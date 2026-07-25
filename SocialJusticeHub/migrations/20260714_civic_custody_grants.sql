-- Canal privado de necesidades bajo custodia.
--
-- No es una extensión del feed ni del dataset abierto. El único destinatario
-- materializable en v1 es la coordinación de un círculo privado/célula, porque
-- hoy es la única membresía que el servidor puede verificar y revocar.

CREATE TABLE IF NOT EXISTS civic_custody_grants (
  id serial PRIMARY KEY,
  grant_id text NOT NULL UNIQUE,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  need_id text NOT NULL,
  owner_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  grantor_user_id integer NOT NULL REFERENCES users(id),
  recipient_type text NOT NULL,
  recipient_circle_id integer NOT NULL REFERENCES circles(id),
  payload_json jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_by_user_id integer REFERENCES users(id),
  closed_at timestamptz,
  closed_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT civic_custody_grants_grantor_idem_unique
    UNIQUE (grantor_user_id, idempotency_key),
  CONSTRAINT civic_custody_grants_grant_id_check
    CHECK (grant_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT civic_custody_grants_need_id_check
    CHECK (need_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT civic_custody_grants_idempotency_check
    CHECK (char_length(idempotency_key) BETWEEN 8 AND 180 AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'),
  CONSTRAINT civic_custody_grants_hash_check
    CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT civic_custody_grants_circle_only_check
    CHECK (recipient_type = 'circle' AND recipient_circle_id IS NOT NULL),
  CONSTRAINT civic_custody_grants_expiry_check
    CHECK (
      expires_at >= created_at + interval '5 minutes'
      AND expires_at <= created_at + interval '90 days'
    ),
  CONSTRAINT civic_custody_grants_revocation_check
    CHECK (
      (revoked_at IS NULL AND revoked_by_user_id IS NULL)
      OR (revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL)
    ),
  CONSTRAINT civic_custody_grants_closure_check
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
  CONSTRAINT civic_custody_grants_payload_size_check
    CHECK (pg_column_size(payload_json) <= 4096),
  CONSTRAINT civic_custody_grants_payload_allowlist_check
    CHECK (
      (
      jsonb_typeof(payload_json) = 'object'
      AND payload_json ?& ARRAY['category','quantity','unit','urgency','location']::text[]
      AND (payload_json - ARRAY['category','quantity','unit','urgency','location']::text[]) = '{}'::jsonb
      AND jsonb_typeof(payload_json -> 'category') = 'string'
      AND payload_json ->> 'category' IN (
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
          AND payload_json ->> 'unit' IN (
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
          AND payload_json -> 'location' ->> 'precision' IN ('500m','neighborhood','city')
        )
      )
      ) IS TRUE
    )
);

CREATE INDEX IF NOT EXISTS civic_custody_grants_recipient_active_idx
  ON civic_custody_grants(recipient_circle_id, revoked_at, expires_at);
CREATE INDEX IF NOT EXISTS civic_custody_grants_owner_need_idx
  ON civic_custody_grants(owner_actor_key, need_id);
CREATE UNIQUE INDEX IF NOT EXISTS civic_custody_grants_one_open_need_idx
  ON civic_custody_grants(need_id)
  WHERE closed_at IS NULL;
CREATE TABLE IF NOT EXISTS civic_custody_grant_revocations (
  id serial PRIMARY KEY,
  grant_id text NOT NULL REFERENCES civic_custody_grants(grant_id) ON UPDATE CASCADE,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  revoked_by_user_id integer NOT NULL REFERENCES users(id),
  revoked_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT civic_custody_revocations_user_idem_unique
    UNIQUE (revoked_by_user_id, idempotency_key),
  CONSTRAINT civic_custody_revocations_idempotency_check
    CHECK (char_length(idempotency_key) BETWEEN 8 AND 180 AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'),
  CONSTRAINT civic_custody_revocations_hash_check
    CHECK (request_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS civic_custody_revocations_grant_idx
  ON civic_custody_grant_revocations(grant_id);
