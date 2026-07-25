-- Hardening/upgrade path for any pilot that applied an earlier draft of the
-- custody table. This migration is deliberately fail-closed: legacy JSON is
-- canonicalized into jsonb, timestamps become temporal columns and duplicate
-- open capabilities are closed as `superseded` before the unique slot exists.

BEGIN;

-- El draft anterior aceptaba UUID con mayúsculas. Antes de tocar claves,
-- rechazar estados ambiguos que colapsarían bajo la forma canónica.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM civic_custody_grants
    GROUP BY lower(grant_id)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'custody grant ids collide after lowercase canonicalization';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_custody_grants
    GROUP BY lower(need_id)
    HAVING count(DISTINCT need_id) > 1
  ) THEN
    RAISE EXCEPTION 'custody need ids use conflicting casing; resolve before canonicalization';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_custody_grant_revocations AS receipt
    WHERE NOT EXISTS (
      SELECT 1
      FROM civic_custody_grants AS custody_grant
      WHERE lower(custody_grant.grant_id) = lower(receipt.grant_id)
    )
  ) THEN
    RAISE EXCEPTION 'custody revocation ledger contains an orphan grant reference';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_entity_owners AS owner
    INNER JOIN civic_custody_grants AS custody_grant
      ON owner.entity_type = 'need'
      AND lower(owner.entity_id) = lower(custody_grant.need_id)
    WHERE owner.entity_id <> lower(owner.entity_id)
  ) THEN
    RAISE EXCEPTION 'apply civic event core hardening before custody hardening';
  END IF;
END $$;

-- La FK del draft no tenía ON UPDATE CASCADE. Reemplazarla dentro de esta
-- transacción permite canonizar padre y ledger sin exponer un estado parcial.
DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT constraint_row.conname
    FROM pg_constraint AS constraint_row
    WHERE constraint_row.contype = 'f'
      AND constraint_row.conrelid = 'civic_custody_grant_revocations'::regclass
      AND constraint_row.confrelid = 'civic_custody_grants'::regclass
      AND constraint_row.conkey = ARRAY[(
        SELECT attnum
        FROM pg_attribute
        WHERE attrelid = 'civic_custody_grant_revocations'::regclass
          AND attname = 'grant_id'
          AND NOT attisdropped
      )]::smallint[]
      AND constraint_row.confkey = ARRAY[(
        SELECT attnum
        FROM pg_attribute
        WHERE attrelid = 'civic_custody_grants'::regclass
          AND attname = 'grant_id'
          AND NOT attisdropped
      )]::smallint[]
  LOOP
    EXECUTE format(
      'ALTER TABLE civic_custody_grant_revocations DROP CONSTRAINT %I',
      fk_name
    );
  END LOOP;
END $$;

UPDATE civic_custody_grants
SET grant_id = lower(grant_id), need_id = lower(need_id)
WHERE grant_id <> lower(grant_id) OR need_id <> lower(need_id);

UPDATE civic_custody_grant_revocations
SET grant_id = lower(grant_id)
WHERE grant_id <> lower(grant_id);

ALTER TABLE civic_custody_grant_revocations
  ADD CONSTRAINT civic_custody_grant_revocations_grant_id_fkey
  FOREIGN KEY (grant_id) REFERENCES civic_custody_grants(grant_id)
  ON UPDATE CASCADE;

ALTER TABLE civic_custody_grants
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE civic_custody_grants
  ADD COLUMN IF NOT EXISTS closed_reason text;

ALTER TABLE civic_custody_grants
  ALTER COLUMN payload_json TYPE jsonb USING payload_json::jsonb,
  ALTER COLUMN expires_at TYPE timestamptz USING expires_at::timestamptz,
  ALTER COLUMN revoked_at TYPE timestamptz USING revoked_at::timestamptz,
  ALTER COLUMN closed_at TYPE timestamptz USING closed_at::timestamptz,
  ALTER COLUMN created_at TYPE timestamptz USING created_at::timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at::timestamptz;

ALTER TABLE civic_custody_grant_revocations
  ALTER COLUMN revoked_at TYPE timestamptz USING revoked_at::timestamptz,
  ALTER COLUMN created_at TYPE timestamptz USING created_at::timestamptz;

-- Un retiro previo siempre ocupa el cierre revocado. Un vencimiento deja de
-- ocupar el slot aunque nunca haya habido una tarea de mantenimiento.
UPDATE civic_custody_grants
SET closed_at = revoked_at,
  closed_reason = 'revoked',
  updated_at = revoked_at
WHERE revoked_at IS NOT NULL
  AND (closed_at IS NULL OR closed_reason IS DISTINCT FROM 'revoked');

UPDATE civic_custody_grants
SET closed_at = expires_at,
  closed_reason = 'expired',
  updated_at = expires_at
WHERE revoked_at IS NULL
  AND closed_at IS NULL
  AND expires_at <= now();

-- Un borrador anterior permitía más de un grant abierto. Conservar el más
-- reciente y cerrar el resto es la opción que minimiza exposición; la razón
-- `superseded` mantiene auditable esta reparación.
WITH ranked_open AS (
  SELECT id,
    row_number() OVER (PARTITION BY need_id ORDER BY created_at DESC, id DESC) AS position
  FROM civic_custody_grants
  WHERE closed_at IS NULL
)
UPDATE civic_custody_grants AS target_grant
SET closed_at = now(), closed_reason = 'superseded', updated_at = now()
FROM ranked_open
WHERE target_grant.id = ranked_open.id
  AND ranked_open.position > 1;

ALTER TABLE civic_custody_grants
  DROP CONSTRAINT IF EXISTS civic_custody_grants_grant_id_check,
  DROP CONSTRAINT IF EXISTS civic_custody_grants_need_id_check,
  DROP CONSTRAINT IF EXISTS civic_custody_grants_expiry_check,
  DROP CONSTRAINT IF EXISTS civic_custody_grants_closure_check,
  DROP CONSTRAINT IF EXISTS civic_custody_grants_payload_size_check,
  DROP CONSTRAINT IF EXISTS civic_custody_grants_payload_allowlist_check;

ALTER TABLE civic_custody_grants
  ADD CONSTRAINT civic_custody_grants_grant_id_check
    CHECK (grant_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  ADD CONSTRAINT civic_custody_grants_need_id_check
    CHECK (need_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  ADD CONSTRAINT civic_custody_grants_expiry_check
    CHECK (
      expires_at >= created_at + interval '5 minutes'
      AND expires_at <= created_at + interval '90 days'
    ),
  ADD CONSTRAINT civic_custody_grants_closure_check
    CHECK (
      (
        closed_at IS NULL
        AND closed_reason IS NULL
        AND revoked_at IS NULL
        AND revoked_by_user_id IS NULL
      )
      OR (
        closed_at IS NOT NULL
        AND closed_reason IN ('revoked', 'expired', 'superseded')
        AND (
          (closed_reason = 'revoked' AND revoked_at = closed_at)
          OR (closed_reason IN ('expired', 'superseded') AND revoked_at IS NULL)
        )
      )
    ),
  ADD CONSTRAINT civic_custody_grants_payload_size_check
    CHECK (pg_column_size(payload_json) <= 4096),
  ADD CONSTRAINT civic_custody_grants_payload_allowlist_check
    CHECK ((
      jsonb_typeof(payload_json) = 'object'
      AND payload_json ?& ARRAY['category','quantity','unit','urgency','location']::text[]
      AND (payload_json - ARRAY['category','quantity','unit','urgency','location']::text[]) = '{}'::jsonb
      AND jsonb_typeof(payload_json -> 'category') = 'string'
      AND (payload_json ->> 'category') IN (
        'food','housing','work','care','health','education',
        'environment','mobility','safety','culture','democracy'
      )
      AND jsonb_typeof(payload_json -> 'urgency') = 'number'
      AND ((payload_json ->> 'urgency')::numeric % 1) = 0
      AND (payload_json ->> 'urgency')::numeric BETWEEN 1 AND 5
      AND (
        payload_json -> 'quantity' = 'null'::jsonb
        OR (
          jsonb_typeof(payload_json -> 'quantity') = 'number'
          AND (payload_json ->> 'quantity')::numeric > 0
          AND (payload_json ->> 'quantity')::numeric <= 1000000000
        )
      )
      AND (
        payload_json -> 'unit' = 'null'::jsonb
        OR (
          jsonb_typeof(payload_json -> 'unit') = 'string'
          AND payload_json -> 'quantity' <> 'null'::jsonb
          AND (payload_json ->> 'unit') IN (
            'people','meals','units','hours','kilograms','liters',
            'trips','days','beds','kits','other'
          )
        )
      )
      AND (
        payload_json -> 'location' = 'null'::jsonb
        OR (
          jsonb_typeof(payload_json -> 'location') = 'object'
          AND (payload_json -> 'location' ?& ARRAY['lat','lng','precision']::text[])
          AND ((payload_json -> 'location') - ARRAY['lat','lng','precision']::text[]) = '{}'::jsonb
          AND jsonb_typeof(payload_json -> 'location' -> 'lat') = 'number'
          AND jsonb_typeof(payload_json -> 'location' -> 'lng') = 'number'
          AND jsonb_typeof(payload_json -> 'location' -> 'precision') = 'string'
          AND (payload_json -> 'location' ->> 'lat')::numeric BETWEEN -90 AND 90
          AND (payload_json -> 'location' ->> 'lng')::numeric BETWEEN -180 AND 180
          AND (payload_json -> 'location' ->> 'precision') IN ('500m','neighborhood','city')
        )
      )
    ) IS TRUE);

CREATE UNIQUE INDEX IF NOT EXISTS civic_custody_grants_one_open_need_idx
  ON civic_custody_grants(need_id)
  WHERE closed_at IS NULL;

COMMIT;
