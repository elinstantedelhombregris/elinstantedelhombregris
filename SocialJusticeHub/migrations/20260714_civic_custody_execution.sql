-- Ejecución privada, append-only y conciliable de una coordinación aceptada.
--
-- Aplicar después de las migraciones de grants, responses y coordination. Las
-- tablas nuevas no contienen necesidad, relato, ubicación, contacto ni JSON.

BEGIN;

CREATE TABLE IF NOT EXISTS civic_custody_executions (
  id serial PRIMARY KEY,
  proposal_id text NOT NULL REFERENCES civic_custody_coordination_proposals(proposal_id),
  accepted_decision_id text NOT NULL REFERENCES civic_custody_coordination_decisions(decision_id),
  grant_id text NOT NULL REFERENCES civic_custody_grants(grant_id),
  proposer_user_id integer NOT NULL REFERENCES users(id),
  grantor_user_id integer NOT NULL REFERENCES users(id),
  owner_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  quantity numeric,
  unit text,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT civic_custody_executions_proposal_unique UNIQUE (proposal_id),
  CONSTRAINT civic_custody_executions_decision_unique UNIQUE (accepted_decision_id),
  CONSTRAINT civic_custody_executions_grant_unique UNIQUE (grant_id),
  CONSTRAINT civic_custody_executions_parties_distinct_check CHECK (
    proposer_user_id <> grantor_user_id
  ),
  CONSTRAINT civic_custody_executions_capacity_check CHECK (
    (quantity IS NULL AND unit IS NULL)
    OR (
      quantity IS NOT NULL
      AND unit IS NOT NULL
      AND quantity > 0
      AND quantity <= 1000000000
      AND unit IN (
        'people','meals','units','hours','kilograms','liters',
        'trips','days','beds','kits','other'
      )
    )
  ),
  CONSTRAINT civic_custody_executions_temporal_check CHECK (
    accepted_at < expires_at AND created_at >= accepted_at
  )
);

CREATE INDEX IF NOT EXISTS civic_custody_executions_proposal_idx
  ON civic_custody_executions(proposal_id);

CREATE TABLE IF NOT EXISTS civic_custody_execution_commands (
  id serial PRIMARY KEY,
  event_id text NOT NULL,
  proposal_id text NOT NULL REFERENCES civic_custody_executions(proposal_id),
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  actor_role text NOT NULL,
  actor_user_id integer NOT NULL REFERENCES users(id),
  owner_actor_key text REFERENCES civic_devices(actor_key),
  event_type text NOT NULL,
  expected_version text NOT NULL,
  quantity numeric,
  unit text,
  receipt_outcome text,
  follow_up_outcome text,
  applied boolean NOT NULL,
  rejection_reason text,
  sequence integer,
  event_version text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT civic_custody_execution_event_id_unique UNIQUE (event_id),
  CONSTRAINT civic_custody_execution_actor_idem_unique
    UNIQUE (actor_user_id, idempotency_key),
  CONSTRAINT civic_custody_execution_event_id_check CHECK (
    event_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_custody_execution_idempotency_check CHECK (
    idempotency_key = 'custody:' || proposal_id || ':execution:event:' || event_id
  ),
  CONSTRAINT civic_custody_execution_request_hash_check CHECK (
    request_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_execution_expected_version_check CHECK (
    expected_version ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_execution_event_version_check CHECK (
    event_version IS NULL OR event_version ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_execution_actor_check CHECK (
    (actor_role = 'coordinator' AND owner_actor_key IS NULL)
    OR (actor_role = 'grantor' AND owner_actor_key IS NOT NULL)
  ),
  CONSTRAINT civic_custody_execution_event_type_check CHECK (
    event_type IN (
      'reserve','grantor_ready','coordinator_ready','start_delivery',
      'report_delivery','confirm_receipt','record_follow_up','withdraw'
    )
  ),
  CONSTRAINT civic_custody_execution_result_check CHECK (
    (
      applied = TRUE
      AND rejection_reason IS NULL
      AND sequence IS NOT NULL
      AND sequence > 0
      AND event_version IS NOT NULL
    ) OR (
      applied = FALSE
      AND rejection_reason IN ('version_changed','transition_not_allowed')
      AND sequence IS NULL
      AND event_version IS NULL
    )
  ),
  CONSTRAINT civic_custody_execution_payload_check CHECK (
    (
      event_type IN ('reserve','grantor_ready','coordinator_ready','start_delivery','withdraw')
      AND quantity IS NULL
      AND unit IS NULL
      AND receipt_outcome IS NULL
      AND follow_up_outcome IS NULL
    ) OR (
      event_type = 'report_delivery'
      AND receipt_outcome IS NULL
      AND follow_up_outcome IS NULL
      AND (
        (quantity IS NULL AND unit IS NULL)
        OR (
          quantity > 0
          AND quantity <= 1000000000
          AND (
            unit IS NULL
            OR unit IN (
              'people','meals','units','hours','kilograms','liters',
              'trips','days','beds','kits','other'
            )
          )
        )
      )
    ) OR (
      event_type = 'confirm_receipt'
      AND receipt_outcome IN ('full','partial','not_received')
      AND follow_up_outcome IS NULL
      AND (
        (receipt_outcome = 'not_received' AND quantity IS NULL AND unit IS NULL)
        OR (
          receipt_outcome IN ('full','partial')
          AND (
            (quantity IS NULL AND unit IS NULL)
            OR (
              quantity > 0
              AND quantity <= 1000000000
              AND (
                unit IS NULL
                OR unit IN (
                  'people','meals','units','hours','kilograms','liters',
                  'trips','days','beds','kits','other'
                )
              )
            )
          )
        )
      )
    ) OR (
      event_type = 'record_follow_up'
      AND quantity IS NULL
      AND unit IS NULL
      AND receipt_outcome IS NULL
      AND follow_up_outcome IN ('need_met','still_open')
    )
  )
);

CREATE INDEX IF NOT EXISTS civic_custody_execution_proposal_ledger_idx
  ON civic_custody_execution_commands(proposal_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS civic_custody_execution_applied_milestone_unique
  ON civic_custody_execution_commands(proposal_id, event_type)
  WHERE applied = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS civic_custody_execution_applied_sequence_unique
  ON civic_custody_execution_commands(proposal_id, sequence)
  WHERE applied = TRUE;

-- No se conceden lecturas implícitas a roles públicos. La aplicación accede
-- con su rol privado y sólo expone las proyecciones allowlist del contrato.
REVOKE ALL ON TABLE civic_custody_executions FROM PUBLIC;
REVOKE ALL ON TABLE civic_custody_execution_commands FROM PUBLIC;

-- La raíz sólo puede ser una copia exacta de una decisión accept. El lock del
-- grant es el padre común con revoke/close/coordination; después se respetan
-- execution → proposal/decision → users/device/membership/circle.
CREATE OR REPLACE FUNCTION validate_civic_custody_execution_root()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  custody_grant civic_custody_grants%ROWTYPE;
  coordination_proposal civic_custody_coordination_proposals%ROWTYPE;
  accepted_decision civic_custody_coordination_decisions%ROWTYPE;
BEGIN
  SELECT * INTO custody_grant
  FROM civic_custody_grants
  WHERE grant_id = NEW.grant_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody execution grant is not available' USING ERRCODE = '23503';
  END IF;

  SELECT * INTO coordination_proposal
  FROM civic_custody_coordination_proposals
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody execution proposal is not available' USING ERRCODE = '23503';
  END IF;

  SELECT * INTO accepted_decision
  FROM civic_custody_coordination_decisions
  WHERE decision_id = NEW.accepted_decision_id
    AND proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR accepted_decision.decision <> 'accept' THEN
    RAISE EXCEPTION 'custody execution requires the accepted decision' USING ERRCODE = '23514';
  END IF;

  -- Locks de ACL en orden estable. La raíz no exige que sigan activos: esa
  -- condición se decide por comando y permite conservar rechazos históricos.
  PERFORM id FROM users
  WHERE id IN (NEW.proposer_user_id, NEW.grantor_user_id)
  ORDER BY id
  FOR UPDATE;
  PERFORM actor_key FROM civic_devices
  WHERE actor_key = NEW.owner_actor_key
  FOR UPDATE;
  PERFORM id FROM circle_members
  WHERE circle_id = custody_grant.recipient_circle_id
    AND user_id = NEW.proposer_user_id
  FOR UPDATE;
  PERFORM id FROM circles
  WHERE id = custody_grant.recipient_circle_id
  FOR UPDATE;

  IF coordination_proposal.grant_id <> custody_grant.grant_id
    OR NEW.accepted_decision_id <> accepted_decision.decision_id
    OR NEW.proposer_user_id <> coordination_proposal.proposer_user_id
    OR NEW.grantor_user_id <> custody_grant.grantor_user_id
    OR NEW.owner_actor_key <> custody_grant.owner_actor_key
    OR NEW.quantity IS DISTINCT FROM coordination_proposal.quantity
    OR NEW.unit IS DISTINCT FROM coordination_proposal.unit
    OR NEW.expires_at <> coordination_proposal.expires_at
    OR NEW.accepted_at <> accepted_decision.created_at
    OR NEW.created_at < accepted_decision.created_at
  THEN
    RAISE EXCEPTION 'custody execution root does not match accepted coordination'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_executions_validate
  ON civic_custody_executions;
CREATE TRIGGER civic_custody_executions_validate
BEFORE INSERT ON civic_custody_executions
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_execution_root();

-- Defensa final de la máquina de estados. El servicio calcula la misma
-- decisión para entregar errores de dominio; este trigger impide que una
-- carrera o escritura SQL directa aplique una transición distinta.
CREATE OR REPLACE FUNCTION validate_civic_custody_execution_command()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  execution_grant_id text;
  custody_grant civic_custody_grants%ROWTYPE;
  execution_root civic_custody_executions%ROWTYPE;
  coordination_proposal civic_custody_coordination_proposals%ROWTYPE;
  accepted_decision civic_custody_coordination_decisions%ROWTYPE;
  owner_device civic_devices%ROWTYPE;
  coordinator_membership circle_members%ROWTYPE;
  recipient_circle circles%ROWTYPE;
  proposer_active boolean := FALSE;
  grantor_active boolean := FALSE;
  coordinator_available boolean := FALSE;
  operational boolean := FALSE;
  transition_allowed boolean := FALSE;
  required_rejection text;
  previous_sequence integer := 0;
  previous_version text := '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945';
  previous_created_at timestamptz;
  reserve_exists boolean;
  grantor_ready_exists boolean;
  coordinator_ready_exists boolean;
  start_event civic_custody_execution_commands%ROWTYPE;
  report_event civic_custody_execution_commands%ROWTYPE;
  receipt_event civic_custody_execution_commands%ROWTYPE;
  follow_up_exists boolean;
  withdraw_event civic_custody_execution_commands%ROWTYPE;
  reference_quantity numeric;
  reference_unit text;
  authoritative_now timestamptz := clock_timestamp();
BEGIN
  -- Lectura inmutable para encontrar el lock padre.
  SELECT grant_id INTO execution_grant_id
  FROM civic_custody_executions
  WHERE proposal_id = NEW.proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody execution root is not available' USING ERRCODE = '23503';
  END IF;

  SELECT * INTO custody_grant
  FROM civic_custody_grants
  WHERE grant_id = execution_grant_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody execution grant is not available' USING ERRCODE = '23503';
  END IF;

  SELECT * INTO execution_root
  FROM civic_custody_executions
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;

  SELECT * INTO coordination_proposal
  FROM civic_custody_coordination_proposals
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  SELECT * INTO accepted_decision
  FROM civic_custody_coordination_decisions
  WHERE decision_id = execution_root.accepted_decision_id
    AND proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR accepted_decision.decision <> 'accept' THEN
    RAISE EXCEPTION 'custody execution acceptance is not available' USING ERRCODE = '23514';
  END IF;

  PERFORM id FROM users
  WHERE id IN (execution_root.proposer_user_id, execution_root.grantor_user_id)
  ORDER BY id
  FOR UPDATE;
  SELECT is_active INTO proposer_active
  FROM users WHERE id = execution_root.proposer_user_id;
  SELECT is_active INTO grantor_active
  FROM users WHERE id = execution_root.grantor_user_id;

  SELECT * INTO owner_device
  FROM civic_devices
  WHERE actor_key = execution_root.owner_actor_key
  FOR UPDATE;
  SELECT * INTO coordinator_membership
  FROM circle_members
  WHERE circle_id = custody_grant.recipient_circle_id
    AND user_id = execution_root.proposer_user_id
  FOR UPDATE;
  SELECT * INTO recipient_circle
  FROM circles
  WHERE id = custody_grant.recipient_circle_id
  FOR UPDATE;

  coordinator_available := proposer_active IS TRUE
    AND coordinator_membership.role = 'coordinador'
    AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE);

  IF execution_root.grant_id <> custody_grant.grant_id
    OR coordination_proposal.grant_id <> custody_grant.grant_id
    OR execution_root.proposer_user_id <> coordination_proposal.proposer_user_id
    OR execution_root.grantor_user_id <> custody_grant.grantor_user_id
    OR execution_root.owner_actor_key <> custody_grant.owner_actor_key
    OR execution_root.quantity IS DISTINCT FROM coordination_proposal.quantity
    OR execution_root.unit IS DISTINCT FROM coordination_proposal.unit
    OR execution_root.expires_at <> coordination_proposal.expires_at
    OR execution_root.accepted_at <> accepted_decision.created_at
  THEN
    RAISE EXCEPTION 'custody execution immutable snapshot is invalid' USING ERRCODE = '23514';
  END IF;

  IF NEW.created_at < execution_root.accepted_at
    OR NEW.created_at < authoritative_now - interval '5 minutes'
    OR NEW.created_at > authoritative_now + interval '5 minutes'
  THEN
    RAISE EXCEPTION 'custody execution command time is not database-authoritative'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.actor_role = 'coordinator' THEN
    IF NEW.actor_user_id <> execution_root.proposer_user_id
      OR NEW.owner_actor_key IS NOT NULL
      OR coordinator_available IS NOT TRUE
      OR NEW.event_type NOT IN (
        'reserve','coordinator_ready','start_delivery','report_delivery','withdraw'
      )
    THEN
      RAISE EXCEPTION 'custody execution coordinator is not authorized' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.actor_role = 'grantor' THEN
    IF NEW.actor_user_id <> execution_root.grantor_user_id
      OR NEW.owner_actor_key IS DISTINCT FROM execution_root.owner_actor_key
      OR NOT grantor_active
      OR owner_device.actor_key IS DISTINCT FROM execution_root.owner_actor_key
      OR owner_device.linked_user_id IS DISTINCT FROM execution_root.grantor_user_id
      OR owner_device.revoked_at IS NOT NULL
      OR NEW.event_type NOT IN ('grantor_ready','confirm_receipt','record_follow_up','withdraw')
    THEN
      RAISE EXCEPTION 'custody execution grantor device is not authorized' USING ERRCODE = '42501';
    END IF;
  ELSE
    RAISE EXCEPTION 'custody execution actor role is invalid' USING ERRCODE = '23514';
  END IF;

  SELECT sequence, event_version, created_at
  INTO previous_sequence, previous_version, previous_created_at
  FROM civic_custody_execution_commands
  WHERE proposal_id = NEW.proposal_id
    AND applied = TRUE
  ORDER BY sequence DESC
  LIMIT 1;
  IF NOT FOUND THEN
    previous_sequence := 0;
    previous_version := '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945';
    previous_created_at := execution_root.accepted_at;
  END IF;
  IF NEW.created_at < previous_created_at THEN
    RAISE EXCEPTION 'custody execution command time precedes its chain' USING ERRCODE = '23514';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'reserve'
  ) INTO reserve_exists;
  SELECT EXISTS (
    SELECT 1 FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'grantor_ready'
  ) INTO grantor_ready_exists;
  SELECT EXISTS (
    SELECT 1 FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'coordinator_ready'
  ) INTO coordinator_ready_exists;
  SELECT * INTO start_event FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'start_delivery';
  SELECT * INTO report_event FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'report_delivery';
  SELECT * INTO receipt_event FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'confirm_receipt';
  SELECT EXISTS (
    SELECT 1 FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'record_follow_up'
  ) INTO follow_up_exists;
  SELECT * INTO withdraw_event FROM civic_custody_execution_commands
    WHERE proposal_id = NEW.proposal_id AND applied = TRUE AND event_type = 'withdraw';

  operational := custody_grant.revoked_at IS NULL
    AND custody_grant.closed_at IS NULL
    AND custody_grant.expires_at > authoritative_now
    AND execution_root.expires_at > authoritative_now
    AND coordinator_available;

  IF follow_up_exists OR receipt_event.receipt_outcome = 'not_received' THEN
    transition_allowed := FALSE;
  ELSIF NEW.event_type = 'reserve' THEN
    transition_allowed := operational
      AND NOT reserve_exists
      AND start_event.id IS NULL
      AND withdraw_event.id IS NULL;
  ELSIF NEW.event_type IN ('grantor_ready','coordinator_ready') THEN
    transition_allowed := operational
      AND (
        (NEW.event_type = 'grantor_ready' AND NOT grantor_ready_exists)
        OR (NEW.event_type = 'coordinator_ready' AND NOT coordinator_ready_exists)
      )
      AND start_event.id IS NULL
      AND withdraw_event.id IS NULL;
  ELSIF NEW.event_type = 'start_delivery' THEN
    transition_allowed := operational
      AND reserve_exists
      AND grantor_ready_exists
      AND coordinator_ready_exists
      AND start_event.id IS NULL
      AND withdraw_event.id IS NULL;
  ELSIF NEW.event_type = 'report_delivery' THEN
    transition_allowed := operational
      AND start_event.id IS NOT NULL
      AND report_event.id IS NULL
      AND withdraw_event.id IS NULL
      AND receipt_event.id IS NULL
      AND (
        (
          execution_root.quantity IS NULL
          AND NEW.quantity IS NULL
          AND NEW.unit IS NULL
        ) OR (
          execution_root.quantity IS NOT NULL
          AND NEW.quantity > 0
          AND NEW.quantity <= execution_root.quantity
          AND NEW.unit IS NOT DISTINCT FROM execution_root.unit
        )
      );
  ELSIF NEW.event_type = 'withdraw' THEN
    transition_allowed := withdraw_event.id IS NULL AND receipt_event.id IS NULL;
  ELSIF NEW.event_type = 'confirm_receipt' THEN
    reference_quantity := COALESCE(report_event.quantity, execution_root.quantity);
    reference_unit := COALESCE(report_event.unit, execution_root.unit);
    transition_allowed := start_event.id IS NOT NULL
      AND receipt_event.id IS NULL
      AND (
        report_event.id IS NOT NULL
        OR withdraw_event.actor_role = 'coordinator'
        OR authoritative_now >= start_event.created_at + interval '24 hours'
      )
      AND (
        (
          NEW.receipt_outcome = 'not_received'
          AND NEW.quantity IS NULL
          AND NEW.unit IS NULL
        ) OR (
          NEW.receipt_outcome = 'full'
          AND (
            (reference_quantity IS NULL AND NEW.quantity IS NULL AND NEW.unit IS NULL)
            OR (
              reference_quantity IS NOT NULL
              AND NEW.quantity = reference_quantity
              AND NEW.unit IS NOT DISTINCT FROM reference_unit
            )
          )
        ) OR (
          NEW.receipt_outcome = 'partial'
          AND (
            (reference_quantity IS NULL AND NEW.quantity IS NULL AND NEW.unit IS NULL)
            OR (
              reference_quantity IS NOT NULL
              AND NEW.quantity > 0
              AND NEW.quantity < reference_quantity
              AND NEW.unit IS NOT DISTINCT FROM reference_unit
            )
          )
        )
      );
  ELSIF NEW.event_type = 'record_follow_up' THEN
    transition_allowed := receipt_event.id IS NOT NULL
      AND receipt_event.receipt_outcome IN ('full','partial')
      AND NOT follow_up_exists;
  END IF;

  IF NEW.expected_version <> previous_version THEN
    required_rejection := 'version_changed';
  ELSIF transition_allowed IS NOT TRUE THEN
    required_rejection := 'transition_not_allowed';
  ELSE
    required_rejection := NULL;
  END IF;

  IF required_rejection IS NULL THEN
    IF NOT NEW.applied
      OR NEW.rejection_reason IS NOT NULL
      OR NEW.sequence IS DISTINCT FROM previous_sequence + 1
      OR NEW.event_version IS NULL
      OR NEW.event_version = previous_version
    THEN
      RAISE EXCEPTION 'valid custody execution command must extend the applied chain'
        USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.applied
      OR NEW.rejection_reason IS DISTINCT FROM required_rejection
      OR NEW.sequence IS NOT NULL
      OR NEW.event_version IS NOT NULL
    THEN
      RAISE EXCEPTION 'custody execution rejection does not match authoritative state'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_execution_commands_validate
  ON civic_custody_execution_commands;
CREATE TRIGGER civic_custody_execution_commands_validate
BEFORE INSERT ON civic_custody_execution_commands
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_execution_command();

CREATE OR REPLACE FUNCTION reject_civic_custody_execution_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'civic custody execution records are append-only'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_executions_append_only
  ON civic_custody_executions;
CREATE TRIGGER civic_custody_executions_append_only
BEFORE UPDATE OR DELETE ON civic_custody_executions
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_execution_mutation();

DROP TRIGGER IF EXISTS civic_custody_execution_commands_append_only
  ON civic_custody_execution_commands;
CREATE TRIGGER civic_custody_execution_commands_append_only
BEFORE UPDATE OR DELETE ON civic_custody_execution_commands
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_execution_mutation();

-- Reapply/pilot audit: CREATE IF NOT EXISTS nunca debe convertir un esquema
-- parcial en una instalación aparentemente válida.
DO $$
DECLARE
  missing_constraints text;
  unexpected_columns text;
  invalid_indexes text;
  invalid_triggers text;
BEGIN
  SELECT string_agg(required.table_name || '.' || required.constraint_name, ', ')
  INTO missing_constraints
  FROM (VALUES
    ('civic_custody_executions','civic_custody_executions_pkey'),
    ('civic_custody_executions','civic_custody_executions_proposal_unique'),
    ('civic_custody_executions','civic_custody_executions_decision_unique'),
    ('civic_custody_executions','civic_custody_executions_grant_unique'),
    ('civic_custody_executions','civic_custody_executions_parties_distinct_check'),
    ('civic_custody_executions','civic_custody_executions_capacity_check'),
    ('civic_custody_executions','civic_custody_executions_temporal_check'),
    ('civic_custody_executions','civic_custody_executions_proposal_id_fkey'),
    ('civic_custody_executions','civic_custody_executions_accepted_decision_id_fkey'),
    ('civic_custody_executions','civic_custody_executions_grant_id_fkey'),
    ('civic_custody_executions','civic_custody_executions_proposer_user_id_fkey'),
    ('civic_custody_executions','civic_custody_executions_grantor_user_id_fkey'),
    ('civic_custody_executions','civic_custody_executions_owner_actor_key_fkey'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_pkey'),
    ('civic_custody_execution_commands','civic_custody_execution_event_id_unique'),
    ('civic_custody_execution_commands','civic_custody_execution_actor_idem_unique'),
    ('civic_custody_execution_commands','civic_custody_execution_event_id_check'),
    ('civic_custody_execution_commands','civic_custody_execution_idempotency_check'),
    ('civic_custody_execution_commands','civic_custody_execution_request_hash_check'),
    ('civic_custody_execution_commands','civic_custody_execution_expected_version_check'),
    ('civic_custody_execution_commands','civic_custody_execution_event_version_check'),
    ('civic_custody_execution_commands','civic_custody_execution_actor_check'),
    ('civic_custody_execution_commands','civic_custody_execution_event_type_check'),
    ('civic_custody_execution_commands','civic_custody_execution_result_check'),
    ('civic_custody_execution_commands','civic_custody_execution_payload_check'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_proposal_id_fkey'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_actor_user_id_fkey'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_owner_actor_key_fkey')
  ) AS required(table_name, constraint_name)
  LEFT JOIN pg_constraint AS installed
    ON installed.conrelid = required.table_name::regclass
    AND installed.conname = required.constraint_name
    AND installed.convalidated
  WHERE installed.oid IS NULL;
  IF missing_constraints IS NOT NULL THEN
    RAISE EXCEPTION 'custody execution schema is missing constraints: %', missing_constraints;
  END IF;

  SELECT string_agg(columns.table_name || '.' || columns.column_name, ', ')
  INTO unexpected_columns
  FROM information_schema.columns AS columns
  WHERE columns.table_schema = 'public'
    AND columns.table_name IN ('civic_custody_executions','civic_custody_execution_commands')
    AND NOT (
      (columns.table_name = 'civic_custody_executions' AND columns.column_name = ANY (ARRAY[
        'id','proposal_id','accepted_decision_id','grant_id','proposer_user_id',
        'grantor_user_id','owner_actor_key','quantity','unit','expires_at','accepted_at','created_at'
      ]))
      OR
      (columns.table_name = 'civic_custody_execution_commands' AND columns.column_name = ANY (ARRAY[
        'id','event_id','proposal_id','idempotency_key','request_hash','actor_role','actor_user_id',
        'owner_actor_key','event_type','expected_version','quantity','unit','receipt_outcome',
        'follow_up_outcome','applied','rejection_reason','sequence','event_version','created_at'
      ]))
    );
  IF unexpected_columns IS NOT NULL THEN
    RAISE EXCEPTION 'custody execution schema contains non-contract columns: %', unexpected_columns;
  END IF;

  SELECT string_agg(required.index_name, ', ')
  INTO invalid_indexes
  FROM (VALUES
    ('civic_custody_executions','civic_custody_executions_proposal_idx',FALSE),
    ('civic_custody_execution_commands','civic_custody_execution_proposal_ledger_idx',FALSE),
    ('civic_custody_execution_commands','civic_custody_execution_applied_milestone_unique',TRUE),
    ('civic_custody_execution_commands','civic_custody_execution_applied_sequence_unique',TRUE)
  ) AS required(table_name,index_name,must_be_unique)
  LEFT JOIN pg_class AS relation
    ON relation.relname = required.index_name
    AND relation.relnamespace = 'public'::regnamespace
  LEFT JOIN pg_index AS installed
    ON installed.indexrelid = relation.oid
    AND installed.indrelid = required.table_name::regclass
  WHERE installed.indexrelid IS NULL
    OR NOT installed.indisvalid
    OR NOT installed.indisready
    OR installed.indisunique IS DISTINCT FROM required.must_be_unique
    OR (
      required.must_be_unique
      AND pg_get_expr(installed.indpred, installed.indrelid) <> '(applied = true)'
    );
  IF invalid_indexes IS NOT NULL THEN
    RAISE EXCEPTION 'custody execution schema has invalid indexes: %', invalid_indexes;
  END IF;

  SELECT string_agg(required.trigger_name, ', ')
  INTO invalid_triggers
  FROM (VALUES
    ('civic_custody_executions','civic_custody_executions_validate'),
    ('civic_custody_executions','civic_custody_executions_append_only'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_validate'),
    ('civic_custody_execution_commands','civic_custody_execution_commands_append_only')
  ) AS required(table_name,trigger_name)
  LEFT JOIN pg_trigger AS installed
    ON installed.tgrelid = required.table_name::regclass
    AND installed.tgname = required.trigger_name
    AND NOT installed.tgisinternal
  WHERE installed.oid IS NULL OR installed.tgenabled <> 'O';
  IF invalid_triggers IS NOT NULL THEN
    RAISE EXCEPTION 'custody execution schema has invalid triggers: %', invalid_triggers;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_custody_executions AS execution
    INNER JOIN civic_custody_coordination_proposals AS proposal
      ON proposal.proposal_id = execution.proposal_id
    INNER JOIN civic_custody_coordination_decisions AS decision
      ON decision.decision_id = execution.accepted_decision_id
    INNER JOIN civic_custody_grants AS custody_grant
      ON custody_grant.grant_id = execution.grant_id
    WHERE decision.decision <> 'accept'
      OR decision.proposal_id <> execution.proposal_id
      OR proposal.grant_id <> execution.grant_id
      OR proposal.proposer_user_id <> execution.proposer_user_id
      OR custody_grant.grantor_user_id <> execution.grantor_user_id
      OR custody_grant.owner_actor_key <> execution.owner_actor_key
      OR proposal.quantity IS DISTINCT FROM execution.quantity
      OR proposal.unit IS DISTINCT FROM execution.unit
      OR proposal.expires_at <> execution.expires_at
      OR decision.created_at <> execution.accepted_at
  ) THEN
    RAISE EXCEPTION 'custody execution contains an invalid immutable root';
  END IF;

  IF EXISTS (
    WITH ordered AS (
      SELECT command.*,
        row_number() OVER (PARTITION BY proposal_id ORDER BY sequence) AS expected_sequence,
        lag(event_version) OVER (PARTITION BY proposal_id ORDER BY sequence) AS previous_version
      FROM civic_custody_execution_commands AS command
      WHERE applied = TRUE
    )
    SELECT 1 FROM ordered
    WHERE sequence <> expected_sequence
      OR expected_version <> COALESCE(
        previous_version,
        '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'
      )
  ) THEN
    RAISE EXCEPTION 'custody execution contains an invalid event chain';
  END IF;
END;
$$;

COMMIT;
