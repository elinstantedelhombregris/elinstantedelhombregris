-- Respuestas mínimas, privadas y append-only a grants de custodia.
--
-- Esta migración es incremental: se aplica después de
-- 20260714_civic_custody_grants.sql (instalación nueva) o de su hardening
-- (pilotos existentes). No agrega texto, contacto, identidad pública ni need_id.

BEGIN;

CREATE TABLE IF NOT EXISTS civic_custody_grant_responses (
  id serial PRIMARY KEY,
  response_id text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  grant_id text NOT NULL REFERENCES civic_custody_grants(grant_id),
  responder_user_id integer NOT NULL REFERENCES users(id),
  disposition text NOT NULL,
  quantity numeric,
  unit text,
  applied boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT civic_custody_responses_response_id_unique UNIQUE (response_id),
  CONSTRAINT civic_custody_responses_user_idem_unique
    UNIQUE (responder_user_id, idempotency_key),
  CONSTRAINT civic_custody_responses_response_id_check CHECK (
    response_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_custody_responses_idempotency_check CHECK (
    char_length(idempotency_key) BETWEEN 8 AND 180
    AND idempotency_key ~ '^[a-zA-Z0-9:._-]+$'
  ),
  CONSTRAINT civic_custody_responses_hash_check CHECK (
    request_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT civic_custody_responses_disposition_check CHECK (
    disposition IN ('assessing', 'support_available')
  ),
  CONSTRAINT civic_custody_responses_applied_check CHECK (
    disposition = 'assessing' OR applied = TRUE
  ),
  CONSTRAINT civic_custody_responses_quantity_unit_check CHECK ((
    disposition = 'assessing'
    AND quantity IS NULL
    AND unit IS NULL
  ) OR (
    disposition = 'support_available'
    AND (
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
    )
  ))
);

CREATE INDEX IF NOT EXISTS civic_custody_responses_grant_applied_idx
  ON civic_custody_grant_responses(grant_id, applied, id DESC);

-- El trigger replica en la barrera SQL las invariantes cruzadas que un CHECK
-- no puede expresar: autorización actual, vigencia, cantidad solicitada y la
-- máquina monotónica. El lock del grant serializa respond contra respond/revoke.
CREATE OR REPLACE FUNCTION validate_civic_custody_grant_response()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  custody_grant civic_custody_grants%ROWTYPE;
  latest_disposition text;
  requested_quantity numeric;
  requested_unit text;
BEGIN
  SELECT *
  INTO custody_grant
  FROM civic_custody_grants
  WHERE grant_id = NEW.grant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'custody grant is not available'
      USING ERRCODE = '23503';
  END IF;

  IF custody_grant.closed_at IS NOT NULL
    OR custody_grant.revoked_at IS NOT NULL
    OR custody_grant.expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'custody grant is closed or expired'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM circle_members AS membership
    INNER JOIN circles AS recipient_circle
      ON recipient_circle.id = membership.circle_id
    INNER JOIN users AS responder
      ON responder.id = membership.user_id
    WHERE membership.circle_id = custody_grant.recipient_circle_id
      AND membership.user_id = NEW.responder_user_id
      AND membership.role = 'coordinador'
      AND responder.is_active = TRUE
      AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
  ) THEN
    RAISE EXCEPTION 'custody responder is not currently authorized'
      USING ERRCODE = '42501';
  END IF;

  requested_quantity := CASE
    WHEN jsonb_typeof(custody_grant.payload_json -> 'quantity') = 'number'
      THEN (custody_grant.payload_json ->> 'quantity')::numeric
    ELSE NULL
  END;
  requested_unit := CASE
    WHEN jsonb_typeof(custody_grant.payload_json -> 'unit') = 'string'
      THEN custody_grant.payload_json ->> 'unit'
    ELSE NULL
  END;

  IF NEW.disposition = 'assessing' THEN
    IF NEW.quantity IS NOT NULL OR NEW.unit IS NOT NULL THEN
      RAISE EXCEPTION 'assessing does not accept quantity or unit'
        USING ERRCODE = '23514';
    END IF;
  ELSIF requested_quantity IS NOT NULL AND requested_unit IS NOT NULL THEN
    IF NOT (
      (NEW.quantity IS NULL AND NEW.unit IS NULL)
      OR (
        NEW.quantity IS NOT NULL
        AND NEW.unit IS NOT NULL
        AND NEW.unit = requested_unit
        AND NEW.quantity > 0
        AND NEW.quantity <= requested_quantity
      )
    )
    THEN
      RAISE EXCEPTION 'support quantity does not match the requested need projection'
        USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.quantity IS NOT NULL OR NEW.unit IS NOT NULL THEN
    RAISE EXCEPTION 'support quantity requires requested quantity and unit'
      USING ERRCODE = '23514';
  END IF;

  SELECT disposition
  INTO latest_disposition
  FROM civic_custody_grant_responses
  WHERE grant_id = NEW.grant_id
    AND applied = TRUE
  ORDER BY id DESC
  LIMIT 1;

  IF latest_disposition IS NULL THEN
    IF NEW.disposition <> 'assessing' OR NEW.applied <> TRUE THEN
      RAISE EXCEPTION 'custody response must begin with assessing'
        USING ERRCODE = '23514';
    END IF;
  ELSIF latest_disposition = 'assessing' THEN
    IF NEW.disposition = 'assessing' AND NEW.applied <> FALSE THEN
      RAISE EXCEPTION 'repeated assessing must be a non-applied receipt'
        USING ERRCODE = '23514';
    ELSIF NEW.disposition = 'support_available' AND NEW.applied <> TRUE THEN
      RAISE EXCEPTION 'support response must be applied'
        USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.disposition = 'assessing' THEN
      RAISE EXCEPTION 'custody response cannot regress to assessing'
        USING ERRCODE = '23514';
    ELSIF NEW.applied <> TRUE THEN
      RAISE EXCEPTION 'support revision must be applied'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grant_responses_validate
  ON civic_custody_grant_responses;
CREATE TRIGGER civic_custody_grant_responses_validate
BEFORE INSERT ON civic_custody_grant_responses
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_grant_response();

CREATE OR REPLACE FUNCTION reject_civic_custody_grant_response_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'civic custody grant responses are append-only'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grant_responses_append_only
  ON civic_custody_grant_responses;
CREATE TRIGGER civic_custody_grant_responses_append_only
BEFORE UPDATE OR DELETE ON civic_custody_grant_responses
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_grant_response_mutation();

COMMIT;
