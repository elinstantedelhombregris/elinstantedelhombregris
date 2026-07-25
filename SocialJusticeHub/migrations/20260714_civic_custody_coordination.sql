-- Propuestas privadas de coordinación y aceptación terminal del grantor.
--
-- Aplicar después de 20260714_civic_custody_responses.sql. No crea eventos
-- públicos, no guarda need_id en las tablas nuevas y no abre contacto.

BEGIN;

-- Un id custodial jamás puede ser, simultáneamente, una necesidad del ledger
-- público. El upgrade falla antes de mover owners si el piloto ya colisionó.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM civic_custody_grants AS custody_grant
    INNER JOIN civic_events AS public_need
      ON public_need.entity_type = 'need'
      AND lower(public_need.entity_id) = lower(custody_grant.need_id)
  ) THEN
    RAISE EXCEPTION 'a custody need id is already present in the public civic event ledger';
  END IF;

  -- El primer piloto registraba owners custodiales como `need`. Eso permitía
  -- crear un match público que apuntara al need_id aunque nunca hubiera un
  -- evento público `need`. Los action links sólo guardan match_id: cualquier
  -- acción que dependa de esa conexión queda cubierta al rechazar el match.
  IF EXISTS (
    SELECT 1
    FROM civic_custody_grants AS custody_grant
    INNER JOIN civic_events AS public_match
      ON public_match.entity_type = 'match'
      AND lower((public_match.payload_json::jsonb ->> 'needId')) = lower(custody_grant.need_id)
  ) THEN
    RAISE EXCEPTION 'a custody need id is already referenced by a public civic match';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_entity_owners AS public_owner
    INNER JOIN civic_entity_owners AS custody_owner
      ON lower(custody_owner.entity_id) = lower(public_owner.entity_id)
      AND custody_owner.entity_type = 'custody_need'
    WHERE public_owner.entity_type = 'need'
  ) THEN
    RAISE EXCEPTION 'need and custody_need owner namespaces already collide';
  END IF;
END;
$$;

UPDATE civic_entity_owners AS owner
SET entity_type = 'custody_need'
WHERE owner.entity_type = 'need'
  AND EXISTS (
    SELECT 1
    FROM civic_custody_grants AS custody_grant
    WHERE lower(custody_grant.need_id) = lower(owner.entity_id)
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM civic_custody_grants AS custody_grant
    LEFT JOIN civic_entity_owners AS owner
      ON owner.entity_type = 'custody_need'
      AND lower(owner.entity_id) = lower(custody_grant.need_id)
      AND owner.owner_actor_key = custody_grant.owner_actor_key
    WHERE owner.id IS NULL
  ) THEN
    RAISE EXCEPTION 'a custody grant has no matching custody_need owner';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS civic_entity_owners_need_namespace_unique
  ON civic_entity_owners(entity_id)
  WHERE entity_type IN ('need', 'custody_need');

-- Derivación compartida con juego/src/civic/custody-coordination.ts. No es un
-- secreto: evita que dos clientes creen identidades alternativas para la misma
-- operación y hace que los reintentos converjan aun después de reiniciar.
CREATE OR REPLACE FUNCTION derive_civic_custody_coordination_uuid(
  source_id text,
  derivation_domain text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = public, pg_temp
AS $$
DECLARE
  source_bytes bytea;
  mask_bytes bytea;
  output_hex text;
  byte_index integer;
BEGIN
  IF source_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'coordination derivation source must be a canonical UUID v4'
      USING ERRCODE = '23514';
  END IF;
  IF derivation_domain NOT IN ('proposal', 'decision') THEN
    RAISE EXCEPTION 'unknown custody coordination derivation domain'
      USING ERRCODE = '23514';
  END IF;

  source_bytes := decode(replace(source_id, '-', ''), 'hex');
  mask_bytes := decode(
    CASE derivation_domain
      WHEN 'proposal' THEN '636f6f72642d70726f706f73616c2d31'
      ELSE '636f6f72642d6465636973696f6e2d31'
    END,
    'hex'
  );
  FOR byte_index IN 0..15 LOOP
    source_bytes := set_byte(
      source_bytes,
      byte_index,
      get_byte(source_bytes, byte_index) # get_byte(mask_bytes, byte_index)
    );
  END LOOP;
  source_bytes := set_byte(source_bytes, 6, (get_byte(source_bytes, 6) & 15) | 64);
  source_bytes := set_byte(source_bytes, 8, (get_byte(source_bytes, 8) & 63) | 128);
  output_hex := encode(source_bytes, 'hex');
  RETURN substr(output_hex, 1, 8)
    || '-' || substr(output_hex, 9, 4)
    || '-' || substr(output_hex, 13, 4)
    || '-' || substr(output_hex, 17, 4)
    || '-' || substr(output_hex, 21, 12);
END;
$$;

CREATE TABLE IF NOT EXISTS civic_custody_coordination_proposals (
  id serial PRIMARY KEY,
  proposal_id text NOT NULL,
  grant_id text NOT NULL REFERENCES civic_custody_grants(grant_id),
  source_response_id text NOT NULL REFERENCES civic_custody_grant_responses(response_id),
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  proposer_user_id integer NOT NULL REFERENCES users(id),
  quantity numeric,
  unit text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT civic_custody_coordination_proposal_id_unique UNIQUE (proposal_id),
  CONSTRAINT civic_custody_coordination_grant_unique UNIQUE (grant_id),
  CONSTRAINT civic_custody_coordination_source_response_unique UNIQUE (source_response_id),
  CONSTRAINT civic_custody_coordination_proposer_idem_unique
    UNIQUE (proposer_user_id, idempotency_key),
  CONSTRAINT civic_custody_coordination_proposal_id_check CHECK (
    proposal_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_custody_coordination_proposal_id_deterministic CHECK (
    proposal_id = derive_civic_custody_coordination_uuid(grant_id, 'proposal')
  ),
  CONSTRAINT civic_custody_coordination_idempotency_check CHECK (
    char_length(idempotency_key) BETWEEN 8 AND 180
    AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'
  ),
  CONSTRAINT civic_custody_coordination_hash_check CHECK (
    request_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_coordination_quantity_unit_check CHECK (
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
  CONSTRAINT civic_custody_coordination_temporal_check CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS civic_custody_coordination_proposer_idx
  ON civic_custody_coordination_proposals(proposer_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS civic_custody_coordination_decisions (
  id serial PRIMARY KEY,
  decision_id text NOT NULL,
  proposal_id text NOT NULL REFERENCES civic_custody_coordination_proposals(proposal_id),
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  decider_user_id integer NOT NULL REFERENCES users(id),
  owner_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  decision text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT civic_custody_coordination_decision_id_unique UNIQUE (decision_id),
  CONSTRAINT civic_custody_coordination_proposal_decision_unique UNIQUE (proposal_id),
  CONSTRAINT civic_custody_coordination_decider_idem_unique
    UNIQUE (decider_user_id, idempotency_key),
  CONSTRAINT civic_custody_coordination_decision_id_check CHECK (
    decision_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_custody_coordination_decision_id_deterministic CHECK (
    decision_id = derive_civic_custody_coordination_uuid(proposal_id, 'decision')
  ),
  CONSTRAINT civic_custody_coordination_decision_idempotency_check CHECK (
    char_length(idempotency_key) BETWEEN 8 AND 180
    AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'
  ),
  CONSTRAINT civic_custody_coordination_decision_hash_check CHECK (
    request_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_coordination_decision_check CHECK (
    decision IN ('accept', 'decline')
  )
);

CREATE INDEX IF NOT EXISTS civic_custody_coordination_decider_idx
  ON civic_custody_coordination_decisions(decider_user_id, created_at DESC);

-- CREATE TABLE IF NOT EXISTS no agrega constraints a una instalación piloto.
-- Agregarlas aquí valida también datos existentes; un ID legado arbitrario
-- bloquea el upgrade en vez de dejar una operación irrecuperable por cliente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'civic_custody_coordination_proposal_id_deterministic'
      AND conrelid = 'civic_custody_coordination_proposals'::regclass
  ) THEN
    ALTER TABLE civic_custody_coordination_proposals
      ADD CONSTRAINT civic_custody_coordination_proposal_id_deterministic CHECK (
        proposal_id = derive_civic_custody_coordination_uuid(grant_id, 'proposal')
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'civic_custody_coordination_decision_id_deterministic'
      AND conrelid = 'civic_custody_coordination_decisions'::regclass
  ) THEN
    ALTER TABLE civic_custody_coordination_decisions
      ADD CONSTRAINT civic_custody_coordination_decision_id_deterministic CHECK (
        decision_id = derive_civic_custody_coordination_uuid(proposal_id, 'decision')
      );
  END IF;
END;
$$;

-- `CREATE TABLE IF NOT EXISTS` no completa un draft parcial. Antes de instalar
-- triggers sobre un piloto, exigir el shape íntegro que usa este contrato. Un
-- esquema incompleto aborta el upgrade con nombre explícito en vez de quedar
-- aparentemente migrado sin UNIQUE, FK, NOT NULL o checks esenciales.
DO $$
DECLARE
  missing_constraints text;
  invalid_constraint_semantics text;
  invalid_columns text;
  invalid_defaults text;
  invalid_indexes text;
BEGIN
  SELECT string_agg(required.table_name || '.' || required.constraint_name, ', ')
  INTO missing_constraints
  FROM (VALUES
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_pkey'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_unique'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_grant_unique'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_source_response_unique'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposer_idem_unique'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_check'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_deterministic'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_idempotency_check'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_hash_check'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_quantity_unit_check'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_temporal_check'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_grant_id_fkey'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_source_response_id_fkey'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_proposer_user_id_fkey'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_pkey'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_unique'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_proposal_decision_unique'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decider_idem_unique'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_check'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_deterministic'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_idempotency_check'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_hash_check'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_check'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_proposal_id_fkey'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_decider_user_id_fkey'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_owner_actor_key_fkey')
  ) AS required(table_name, constraint_name)
  LEFT JOIN pg_constraint AS installed
    ON installed.conrelid = required.table_name::regclass
    AND installed.conname = required.constraint_name
  WHERE installed.oid IS NULL;

  IF missing_constraints IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema is missing constraints: %', missing_constraints;
  END IF;

  SELECT string_agg(required.table_name || '.' || required.constraint_name, ', ')
  INTO invalid_constraint_semantics
  FROM (VALUES
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_pkey', 'p', 'id', NULL, NULL),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_unique', 'u', 'proposal_id', NULL, NULL),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_grant_unique', 'u', 'grant_id', NULL, NULL),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_source_response_unique', 'u', 'source_response_id', NULL, NULL),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposer_idem_unique', 'u', 'proposer_user_id,idempotency_key', NULL, NULL),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_grant_id_fkey', 'f', 'grant_id', 'civic_custody_grants', 'grant_id'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_source_response_id_fkey', 'f', 'source_response_id', 'civic_custody_grant_responses', 'response_id'),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposals_proposer_user_id_fkey', 'f', 'proposer_user_id', 'users', 'id'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_pkey', 'p', 'id', NULL, NULL),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_unique', 'u', 'decision_id', NULL, NULL),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_proposal_decision_unique', 'u', 'proposal_id', NULL, NULL),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decider_idem_unique', 'u', 'decider_user_id,idempotency_key', NULL, NULL),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_proposal_id_fkey', 'f', 'proposal_id', 'civic_custody_coordination_proposals', 'proposal_id'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_decider_user_id_fkey', 'f', 'decider_user_id', 'users', 'id'),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decisions_owner_actor_key_fkey', 'f', 'owner_actor_key', 'civic_devices', 'actor_key')
  ) AS required(table_name, constraint_name, constraint_type, key_columns, reference_table, reference_columns)
  INNER JOIN pg_constraint AS installed
    ON installed.conrelid = required.table_name::regclass
    AND installed.conname = required.constraint_name
  WHERE NOT installed.convalidated
    OR installed.contype::text <> required.constraint_type
    OR installed.condeferrable
    OR installed.condeferred
    OR ARRAY(
      SELECT attribute.attname::text
      FROM unnest(installed.conkey) WITH ORDINALITY AS key_column(attnum, position)
      INNER JOIN pg_attribute AS attribute
        ON attribute.attrelid = installed.conrelid
        AND attribute.attnum = key_column.attnum
      ORDER BY key_column.position
    ) <> string_to_array(required.key_columns, ',')
    OR (
      required.reference_table IS NOT NULL
      AND (
        installed.confrelid <> required.reference_table::regclass
        OR ARRAY(
          SELECT attribute.attname::text
          FROM unnest(installed.confkey) WITH ORDINALITY AS reference_column(attnum, position)
          INNER JOIN pg_attribute AS attribute
            ON attribute.attrelid = installed.confrelid
            AND attribute.attnum = reference_column.attnum
          ORDER BY reference_column.position
        ) <> string_to_array(required.reference_columns, ',')
        OR installed.confupdtype <> 'a'
        OR installed.confdeltype <> 'a'
        OR installed.confmatchtype <> 's'
      )
    );

  IF invalid_constraint_semantics IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema has invalid key constraints: %', invalid_constraint_semantics;
  END IF;

  SELECT string_agg(required.table_name || '.' || required.constraint_name, ', ')
  INTO invalid_constraint_semantics
  FROM (VALUES
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_check', $definition$CHECK (proposal_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text)$definition$),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_proposal_id_deterministic', $definition$CHECK (proposal_id = derive_civic_custody_coordination_uuid(grant_id, 'proposal'::text))$definition$),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_idempotency_check', $definition$CHECK (char_length(idempotency_key) >= 8 AND char_length(idempotency_key) <= 180 AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'::text)$definition$),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_hash_check', $definition$CHECK (request_hash ~ '^[0-9a-f]{64}$'::text)$definition$),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_quantity_unit_check', $definition$CHECK (quantity IS NULL AND unit IS NULL OR quantity IS NOT NULL AND unit IS NOT NULL AND quantity > 0::numeric AND quantity <= 1000000000::numeric AND (unit = ANY (ARRAY['people'::text, 'meals'::text, 'units'::text, 'hours'::text, 'kilograms'::text, 'liters'::text, 'trips'::text, 'days'::text, 'beds'::text, 'kits'::text, 'other'::text])))$definition$),
    ('civic_custody_coordination_proposals', 'civic_custody_coordination_temporal_check', $definition$CHECK (expires_at > created_at)$definition$),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_check', $definition$CHECK (decision_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text)$definition$),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_id_deterministic', $definition$CHECK (decision_id = derive_civic_custody_coordination_uuid(proposal_id, 'decision'::text))$definition$),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_idempotency_check', $definition$CHECK (char_length(idempotency_key) >= 8 AND char_length(idempotency_key) <= 180 AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'::text)$definition$),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_hash_check', $definition$CHECK (request_hash ~ '^[0-9a-f]{64}$'::text)$definition$),
    ('civic_custody_coordination_decisions', 'civic_custody_coordination_decision_check', $definition$CHECK (decision = ANY (ARRAY['accept'::text, 'decline'::text]))$definition$)
  ) AS required(table_name, constraint_name, definition)
  INNER JOIN pg_constraint AS installed
    ON installed.conrelid = required.table_name::regclass
    AND installed.conname = required.constraint_name
  WHERE NOT installed.convalidated
    OR installed.contype <> 'c'
    OR pg_get_constraintdef(installed.oid, TRUE) <> required.definition;

  IF invalid_constraint_semantics IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema has invalid check constraints: %', invalid_constraint_semantics;
  END IF;

  SELECT string_agg(required.table_name || '.' || required.column_name, ', ')
  INTO invalid_columns
  FROM (VALUES
    ('civic_custody_coordination_proposals', 'id', 'integer', TRUE),
    ('civic_custody_coordination_proposals', 'proposal_id', 'text', TRUE),
    ('civic_custody_coordination_proposals', 'grant_id', 'text', TRUE),
    ('civic_custody_coordination_proposals', 'source_response_id', 'text', TRUE),
    ('civic_custody_coordination_proposals', 'idempotency_key', 'text', TRUE),
    ('civic_custody_coordination_proposals', 'request_hash', 'text', TRUE),
    ('civic_custody_coordination_proposals', 'proposer_user_id', 'integer', TRUE),
    ('civic_custody_coordination_proposals', 'quantity', 'numeric', FALSE),
    ('civic_custody_coordination_proposals', 'unit', 'text', FALSE),
    ('civic_custody_coordination_proposals', 'expires_at', 'timestamp with time zone', TRUE),
    ('civic_custody_coordination_proposals', 'created_at', 'timestamp with time zone', TRUE),
    ('civic_custody_coordination_decisions', 'id', 'integer', TRUE),
    ('civic_custody_coordination_decisions', 'decision_id', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'proposal_id', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'idempotency_key', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'request_hash', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'decider_user_id', 'integer', TRUE),
    ('civic_custody_coordination_decisions', 'owner_actor_key', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'decision', 'text', TRUE),
    ('civic_custody_coordination_decisions', 'created_at', 'timestamp with time zone', TRUE)
  ) AS required(table_name, column_name, data_type, must_be_not_null)
  LEFT JOIN pg_attribute AS installed
    ON installed.attrelid = required.table_name::regclass
    AND installed.attname = required.column_name
    AND installed.attnum > 0
    AND NOT installed.attisdropped
  WHERE installed.attnum IS NULL
    OR format_type(installed.atttypid, installed.atttypmod) <> required.data_type
    OR installed.attnotnull IS DISTINCT FROM required.must_be_not_null;

  IF invalid_columns IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema has invalid columns: %', invalid_columns;
  END IF;

  SELECT string_agg(required.table_name || '.' || required.column_name, ', ')
  INTO invalid_defaults
  FROM (VALUES
    ('civic_custody_coordination_proposals', 'id', $definition$nextval('civic_custody_coordination_proposals_id_seq'::regclass)$definition$),
    ('civic_custody_coordination_proposals', 'created_at', $definition$clock_timestamp()$definition$),
    ('civic_custody_coordination_decisions', 'id', $definition$nextval('civic_custody_coordination_decisions_id_seq'::regclass)$definition$),
    ('civic_custody_coordination_decisions', 'created_at', $definition$clock_timestamp()$definition$)
  ) AS required(table_name, column_name, definition)
  INNER JOIN pg_attribute AS installed
    ON installed.attrelid = required.table_name::regclass
    AND installed.attname = required.column_name
    AND installed.attnum > 0
    AND NOT installed.attisdropped
  LEFT JOIN pg_attrdef AS column_default
    ON column_default.adrelid = installed.attrelid
    AND column_default.adnum = installed.attnum
  WHERE column_default.oid IS NULL
    OR pg_get_expr(column_default.adbin, column_default.adrelid) <> required.definition;

  IF invalid_defaults IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema has invalid defaults: %', invalid_defaults;
  END IF;

  SELECT string_agg(required.table_name || '.' || required.index_name, ', ')
  INTO invalid_indexes
  FROM (VALUES
    (
      'civic_custody_coordination_proposals',
      'civic_custody_coordination_proposer_idx',
      $definition$CREATE INDEX civic_custody_coordination_proposer_idx ON public.civic_custody_coordination_proposals USING btree (proposer_user_id, created_at DESC)$definition$
    ),
    (
      'civic_custody_coordination_decisions',
      'civic_custody_coordination_decider_idx',
      $definition$CREATE INDEX civic_custody_coordination_decider_idx ON public.civic_custody_coordination_decisions USING btree (decider_user_id, created_at DESC)$definition$
    )
  ) AS required(table_name, index_name, definition)
  LEFT JOIN pg_class AS index_relation
    ON index_relation.relname = required.index_name
    AND index_relation.relnamespace = 'public'::regnamespace
  LEFT JOIN pg_index AS installed
    ON installed.indexrelid = index_relation.oid
    AND installed.indrelid = required.table_name::regclass
  WHERE installed.indexrelid IS NULL
    OR NOT installed.indisvalid
    OR NOT installed.indisready
    OR installed.indisunique
    OR installed.indisprimary
    OR installed.indpred IS NOT NULL
    OR installed.indexprs IS NOT NULL
    OR pg_get_indexdef(installed.indexrelid) <> required.definition;

  IF invalid_indexes IS NOT NULL THEN
    RAISE EXCEPTION 'custody coordination pilot schema has invalid indexes: %', invalid_indexes;
  END IF;
END;
$$;

-- Valida y congela contra el snapshot autoritativo mientras el lock del grant
-- serializa create/respond/revoke/decide.
CREATE OR REPLACE FUNCTION validate_civic_custody_coordination_proposal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  custody_grant civic_custody_grants%ROWTYPE;
  latest_response civic_custody_grant_responses%ROWTYPE;
BEGIN
  SELECT *
  INTO custody_grant
  FROM civic_custody_grants
  WHERE grant_id = NEW.grant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody grant is not available' USING ERRCODE = '23503';
  END IF;
  IF NEW.proposal_id <> derive_civic_custody_coordination_uuid(NEW.grant_id, 'proposal') THEN
    RAISE EXCEPTION 'coordination proposal id is not deterministic for grant'
      USING ERRCODE = '23514';
  END IF;
  IF custody_grant.closed_at IS NOT NULL
    OR custody_grant.revoked_at IS NOT NULL
    OR custody_grant.expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'custody grant is closed or expired' USING ERRCODE = '23514';
  END IF;
  IF NEW.proposer_user_id = custody_grant.grantor_user_id THEN
    RAISE EXCEPTION 'coordination proposer must be distinct from grantor'
      USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM circle_members AS membership
    INNER JOIN circles AS recipient_circle ON recipient_circle.id = membership.circle_id
    INNER JOIN users AS proposer ON proposer.id = membership.user_id
    WHERE membership.circle_id = custody_grant.recipient_circle_id
      AND membership.user_id = NEW.proposer_user_id
      AND membership.role = 'coordinador'
      AND proposer.is_active = TRUE
      AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
  ) THEN
    RAISE EXCEPTION 'coordination proposer is not currently authorized'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO latest_response
  FROM civic_custody_grant_responses
  WHERE grant_id = NEW.grant_id
    AND applied = TRUE
  ORDER BY id DESC
  LIMIT 1;

  IF NOT FOUND OR latest_response.disposition <> 'support_available' THEN
    RAISE EXCEPTION 'support_available response is required'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.source_response_id <> latest_response.response_id
    OR NEW.quantity IS DISTINCT FROM latest_response.quantity
    OR NEW.unit IS DISTINCT FROM latest_response.unit
  THEN
    RAISE EXCEPTION 'coordination capacity must equal latest support response'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.expires_at <> custody_grant.expires_at
    OR NEW.created_at < latest_response.created_at
  THEN
    RAISE EXCEPTION 'coordination temporal snapshot is invalid'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_coordination_proposals_validate
  ON civic_custody_coordination_proposals;
CREATE TRIGGER civic_custody_coordination_proposals_validate
BEFORE INSERT ON civic_custody_coordination_proposals
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_coordination_proposal();

-- Una propuesta congela el response que la originó. El servicio comprueba
-- esto antes de insertar para devolver 409 de dominio; el trigger es defensa
-- ante escrituras directas y carreras.
CREATE OR REPLACE FUNCTION reject_civic_custody_support_revision_after_proposal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Debe tomar el mismo lock padre que create/decide/revoke antes de mirar la
  -- propuesta; de lo contrario una fila aún no confirmada sería invisible.
  PERFORM 1
  FROM civic_custody_grants
  WHERE grant_id = NEW.grant_id
  FOR UPDATE;

  IF NEW.disposition = 'support_available'
    AND EXISTS (
      SELECT 1
      FROM civic_custody_coordination_proposals
      WHERE grant_id = NEW.grant_id
    )
  THEN
    RAISE EXCEPTION 'support capacity is frozen by a coordination proposal'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grant_responses_coordination_freeze
  ON civic_custody_grant_responses;
CREATE TRIGGER civic_custody_grant_responses_coordination_freeze
BEFORE INSERT ON civic_custody_grant_responses
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_support_revision_after_proposal();

CREATE OR REPLACE FUNCTION validate_civic_custody_coordination_decision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  coordination_proposal civic_custody_coordination_proposals%ROWTYPE;
  custody_grant civic_custody_grants%ROWTYPE;
  proposal_grant_id text;
BEGIN
  -- Lectura inmutable sólo para conocer el lock padre.
  SELECT grant_id
  INTO proposal_grant_id
  FROM civic_custody_coordination_proposals
  WHERE proposal_id = NEW.proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'coordination proposal is not available' USING ERRCODE = '23503';
  END IF;

  SELECT *
  INTO custody_grant
  FROM civic_custody_grants
  WHERE grant_id = proposal_grant_id
  FOR UPDATE;

  SELECT *
  INTO coordination_proposal
  FROM civic_custody_coordination_proposals
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;

  IF NEW.decision_id <> derive_civic_custody_coordination_uuid(NEW.proposal_id, 'decision') THEN
    RAISE EXCEPTION 'coordination decision id is not deterministic for proposal'
      USING ERRCODE = '23514';
  END IF;

  IF custody_grant.closed_at IS NOT NULL
    OR custody_grant.revoked_at IS NOT NULL
    OR custody_grant.expires_at <= clock_timestamp()
    OR coordination_proposal.expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'coordination proposal is closed or expired'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.decider_user_id <> custody_grant.grantor_user_id
    OR NEW.owner_actor_key <> custody_grant.owner_actor_key
  THEN
    RAISE EXCEPTION 'only the exact grant owner can decide coordination'
      USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM civic_devices AS owner_device
    INNER JOIN users AS grantor ON grantor.id = owner_device.linked_user_id
    WHERE owner_device.actor_key = NEW.owner_actor_key
      AND owner_device.linked_user_id = NEW.decider_user_id
      AND owner_device.revoked_at IS NULL
      AND grantor.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'the exact linked owner device is not active'
      USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM circle_members AS membership
    INNER JOIN circles AS recipient_circle ON recipient_circle.id = membership.circle_id
    INNER JOIN users AS coordinator ON coordinator.id = membership.user_id
    WHERE membership.circle_id = custody_grant.recipient_circle_id
      AND membership.user_id <> custody_grant.grantor_user_id
      AND membership.role = 'coordinador'
      AND coordinator.is_active = TRUE
      AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
  ) THEN
    RAISE EXCEPTION 'recipient coordination is no longer available'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.created_at < coordination_proposal.created_at
    OR NEW.created_at >= coordination_proposal.expires_at
  THEN
    RAISE EXCEPTION 'coordination decision timestamp is invalid'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_coordination_decisions_validate
  ON civic_custody_coordination_decisions;
CREATE TRIGGER civic_custody_coordination_decisions_validate
BEFORE INSERT ON civic_custody_coordination_decisions
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_coordination_decision();

CREATE OR REPLACE FUNCTION reject_civic_custody_coordination_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'civic custody coordination records are append-only'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_coordination_proposals_append_only
  ON civic_custody_coordination_proposals;
CREATE TRIGGER civic_custody_coordination_proposals_append_only
BEFORE UPDATE OR DELETE ON civic_custody_coordination_proposals
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_coordination_mutation();

DROP TRIGGER IF EXISTS civic_custody_coordination_decisions_append_only
  ON civic_custody_coordination_decisions;
CREATE TRIGGER civic_custody_coordination_decisions_append_only
BEFORE UPDATE OR DELETE ON civic_custody_coordination_decisions
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_coordination_mutation();

COMMIT;
