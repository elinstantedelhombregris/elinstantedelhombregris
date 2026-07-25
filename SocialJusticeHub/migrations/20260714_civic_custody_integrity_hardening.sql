-- Autoridad SQL incremental para grants y su ledger de revocación.
--
-- Aplicar después de 20260714_civic_custody_coordination.sql. Congela la
-- capability una vez creada y deja como únicas mutaciones válidas los cierres
-- monotónicos que usa PostgresCustodyGrantStore.

BEGIN;

-- No instalar la nueva barrera sobre recibos históricos contradictorios. Un
-- recibo tardío puede haber sido pedido por el grantor aunque la coordinación
-- haya ganado la revocación original; lo inmutable es el grant y su instante.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM civic_custody_grant_revocations AS receipt
    INNER JOIN civic_custody_grants AS custody_grant
      ON custody_grant.grant_id = receipt.grant_id
    WHERE custody_grant.closed_reason IS DISTINCT FROM 'revoked'
      OR custody_grant.revoked_at IS NULL
      OR custody_grant.closed_at IS DISTINCT FROM custody_grant.revoked_at
      OR receipt.revoked_at IS DISTINCT FROM custody_grant.revoked_at
  ) THEN
    RAISE EXCEPTION 'custody revocation ledger contradicts its authoritative grant';
  END IF;
END;
$$;

-- La API valida estas relaciones antes de insertar. Esta barrera repite los
-- invariantes esenciales en PostgreSQL para que una escritura directa no
-- pueda fabricar una capability con otra autoridad o un destinatario que no
-- sea custodial. Sólo rige para filas nuevas: cambios legítimos posteriores
-- de membresía o estado de cuenta no reescriben la historia ya asentada.
CREATE OR REPLACE FUNCTION validate_civic_custody_grant_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Compartido con los triggers de owner y evento público. El lock
  -- transaccional hace que dos INSERT concurrentes vean el commit anterior
  -- antes de decidir a qué namespace pertenece el needId.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'civic-need-namespace/v1:' || lower(NEW.need_id),
    0
  ));

  IF NEW.revoked_at IS NOT NULL
    OR NEW.revoked_by_user_id IS NOT NULL
    OR NEW.closed_at IS NOT NULL
    OR NEW.closed_reason IS NOT NULL
    OR NEW.updated_at IS DISTINCT FROM NEW.created_at
    OR NEW.created_at < clock_timestamp() - interval '5 minutes'
    OR NEW.created_at > clock_timestamp() + interval '5 minutes'
    OR NEW.expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'a custody grant must be created open at the current time'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM civic_events AS public_event
    WHERE (
      public_event.entity_type = 'need'
      AND lower(public_event.entity_id) = lower(NEW.need_id)
    ) OR (
      public_event.entity_type = 'match'
      AND lower(public_event.payload_json::jsonb ->> 'needId') = lower(NEW.need_id)
    )
  ) THEN
    RAISE EXCEPTION 'a public civic event already references this custody need'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM civic_entity_owners AS owner
    INNER JOIN civic_devices AS owner_device
      ON owner_device.actor_key = owner.owner_actor_key
    INNER JOIN users AS grantor
      ON grantor.id = owner_device.linked_user_id
    WHERE owner.entity_type = 'custody_need'
      AND owner.entity_id = NEW.need_id
      AND owner.owner_actor_key = NEW.owner_actor_key
      AND owner_device.linked_user_id = NEW.grantor_user_id
      AND owner_device.revoked_at IS NULL
      AND grantor.id = NEW.grantor_user_id
      AND grantor.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'custody grant owner authority is not valid'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM circle_members AS grantor_membership
    INNER JOIN circles AS recipient_circle
      ON recipient_circle.id = grantor_membership.circle_id
    WHERE grantor_membership.circle_id = NEW.recipient_circle_id
      AND grantor_membership.user_id = NEW.grantor_user_id
      AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
      AND EXISTS (
        SELECT 1
        FROM circle_members AS coordinator_membership
        INNER JOIN users AS coordinator
          ON coordinator.id = coordinator_membership.user_id
        WHERE coordinator_membership.circle_id = NEW.recipient_circle_id
          AND coordinator_membership.role = 'coordinador'
          AND coordinator.is_active = TRUE
      )
  ) THEN
    RAISE EXCEPTION 'custody grant recipient is not currently available'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grants_validate_insert
  ON civic_custody_grants;
CREATE TRIGGER civic_custody_grants_validate_insert
BEFORE INSERT ON civic_custody_grants
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_grant_insert();

CREATE OR REPLACE FUNCTION validate_civic_custody_grant_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Identidad, autoridad, destinatario, contenido y ventana temporal nacen
  -- inmutables. La FK ON UPDATE CASCADE del draft no concede permiso para
  -- cambiar grant_id: este trigger prevalece.
  IF ROW(
    NEW.id,
    NEW.grant_id,
    NEW.idempotency_key,
    NEW.request_hash,
    NEW.need_id,
    NEW.owner_actor_key,
    NEW.grantor_user_id,
    NEW.recipient_type,
    NEW.recipient_circle_id,
    NEW.payload_json,
    NEW.expires_at,
    NEW.created_at
  ) IS DISTINCT FROM ROW(
    OLD.id,
    OLD.grant_id,
    OLD.idempotency_key,
    OLD.request_hash,
    OLD.need_id,
    OLD.owner_actor_key,
    OLD.grantor_user_id,
    OLD.recipient_type,
    OLD.recipient_circle_id,
    OLD.payload_json,
    OLD.expires_at,
    OLD.created_at
  ) THEN
    RAISE EXCEPTION 'civic custody grant core is immutable'
      USING ERRCODE = '55000';
  END IF;

  -- Ningún cierre puede reabrirse, cambiar de razón, reasignar su actor ni
  -- reescribir su timestamp, incluido `superseded` de un upgrade anterior.
  IF OLD.closed_at IS NOT NULL
    OR OLD.closed_reason IS NOT NULL
    OR OLD.revoked_at IS NOT NULL
    OR OLD.revoked_by_user_id IS NOT NULL
  THEN
    RAISE EXCEPTION 'closed civic custody grants are immutable'
      USING ERRCODE = '55000';
  END IF;

  IF NEW.closed_reason = 'expired' THEN
    IF NEW.closed_at IS NULL
      OR NEW.closed_at < OLD.expires_at
      OR NEW.closed_at > clock_timestamp() + interval '5 minutes'
      OR NEW.updated_at IS DISTINCT FROM NEW.closed_at
      OR NEW.revoked_at IS NOT NULL
      OR NEW.revoked_by_user_id IS NOT NULL
    THEN
      RAISE EXCEPTION 'invalid civic custody expiry transition'
        USING ERRCODE = '23514';
    END IF;

    -- Un timestamp suministrado en el futuro no permite liberar antes el slot.
    IF clock_timestamp() < OLD.expires_at THEN
      RETURN NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.closed_reason = 'revoked' THEN
    IF NEW.revoked_at IS NULL
      OR NEW.revoked_by_user_id IS NULL
      OR NEW.closed_at IS DISTINCT FROM NEW.revoked_at
      OR NEW.updated_at IS DISTINCT FROM NEW.revoked_at
      OR NEW.revoked_at < OLD.created_at
      OR NEW.revoked_at >= OLD.expires_at
      OR NEW.revoked_at > clock_timestamp() + interval '5 minutes'
    THEN
      RAISE EXCEPTION 'invalid civic custody revocation transition'
        USING ERRCODE = '23514';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM users AS revoker
      WHERE revoker.id = NEW.revoked_by_user_id
        AND revoker.is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'custody revoker account is not active'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.revoked_by_user_id <> OLD.grantor_user_id
      AND NOT EXISTS (
        SELECT 1
        FROM circle_members AS membership
        INNER JOIN circles AS recipient_circle
          ON recipient_circle.id = membership.circle_id
        INNER JOIN users AS coordinator
          ON coordinator.id = membership.user_id
        WHERE membership.circle_id = OLD.recipient_circle_id
          AND membership.user_id = NEW.revoked_by_user_id
          AND membership.role = 'coordinador'
          AND coordinator.is_active = TRUE
          AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
      )
    THEN
      RAISE EXCEPTION 'custody revoker is not currently authorized'
        USING ERRCODE = '42501';
    END IF;

    -- La consulta del store aplica la misma condición. RETURN NULL conserva
    -- una carrera exacta contra el reloj como UPDATE sin filas, para que el
    -- servicio responda CUSTODY_GRANT_EXPIRED en lugar de un error SQL opaco.
    IF clock_timestamp() >= OLD.expires_at THEN
      RETURN NULL;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'unsupported civic custody grant mutation'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grants_validate_update
  ON civic_custody_grants;
CREATE TRIGGER civic_custody_grants_validate_update
BEFORE UPDATE ON civic_custody_grants
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_grant_update();

CREATE OR REPLACE FUNCTION reject_civic_custody_grant_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'civic custody grants cannot be deleted'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grants_reject_delete
  ON civic_custody_grants;
CREATE TRIGGER civic_custody_grants_reject_delete
BEFORE DELETE ON civic_custody_grants
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_grant_delete();

-- El owner custodial es una raíz de autoridad append-only desde que nace, aun
-- antes del primer grant. Rechazar siempre su mutación también cierra la
-- carrera owner/grant: no existe una ventana en la que otra transacción pueda
-- cambiarlo después de la validación del INSERT y antes del commit.
CREATE OR REPLACE FUNCTION reject_civic_custody_owner_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.entity_type = 'custody_need' THEN
    RAISE EXCEPTION 'civic custody owners are immutable'
      USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_owners_referenced_immutable
  ON civic_entity_owners;
DROP TRIGGER IF EXISTS civic_custody_owners_immutable
  ON civic_entity_owners;
CREATE TRIGGER civic_custody_owners_immutable
BEFORE UPDATE OR DELETE ON civic_entity_owners
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_owner_mutation();

CREATE OR REPLACE FUNCTION validate_civic_need_owner_namespace()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.entity_type NOT IN ('need', 'custody_need') THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(
    'civic-need-namespace/v1:' || lower(NEW.entity_id),
    0
  ));

  IF NEW.entity_type = 'custody_need'
    AND EXISTS (
      SELECT 1
      FROM civic_events AS public_event
      WHERE (
        public_event.entity_type = 'need'
        AND lower(public_event.entity_id) = lower(NEW.entity_id)
      ) OR (
        public_event.entity_type = 'match'
        AND lower(public_event.payload_json::jsonb ->> 'needId') = lower(NEW.entity_id)
      )
    )
  THEN
    RAISE EXCEPTION 'a public civic event already owns this need namespace'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.entity_type = 'need'
    AND EXISTS (
      SELECT 1
      FROM civic_custody_grants AS custody_grant
      WHERE lower(custody_grant.need_id) = lower(NEW.entity_id)
    )
  THEN
    RAISE EXCEPTION 'a custody grant already owns this need namespace'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_entity_owners_need_namespace_guard
  ON civic_entity_owners;
CREATE TRIGGER civic_entity_owners_need_namespace_guard
BEFORE INSERT OR UPDATE ON civic_entity_owners
FOR EACH ROW
EXECUTE FUNCTION validate_civic_need_owner_namespace();

-- La migración de coordinación aborta si encuentra una colisión histórica.
-- Esta barrera mantiene esa separación después del despliegue: ninguna
-- escritura directa puede publicar una necesidad custodial ni referenciarla
-- desde un match público. Las acciones sólo enlazan match_id, por lo que
-- bloquear el match corta también esa vía de exposición.
CREATE OR REPLACE FUNCTION reject_public_event_for_custody_need()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  referenced_need_id text;
BEGIN
  IF NEW.entity_type = 'need' THEN
    referenced_need_id := NEW.entity_id;
  ELSIF NEW.entity_type = 'match' THEN
    referenced_need_id := NEW.payload_json::jsonb ->> 'needId';
  ELSE
    RETURN NEW;
  END IF;

  IF referenced_need_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(
    'civic-need-namespace/v1:' || lower(referenced_need_id),
    0
  ));

  IF (
      EXISTS (
        SELECT 1
        FROM civic_entity_owners AS custody_owner
        WHERE custody_owner.entity_type = 'custody_need'
          AND lower(custody_owner.entity_id) = lower(referenced_need_id)
      )
      OR EXISTS (
        SELECT 1
        FROM civic_custody_grants AS custody_grant
        WHERE lower(custody_grant.need_id) = lower(referenced_need_id)
      )
    )
  THEN
    RAISE EXCEPTION 'a custody need cannot enter the public civic ledger'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_events_reject_custody_need
  ON civic_events;
CREATE TRIGGER civic_events_reject_custody_need
BEFORE INSERT OR UPDATE ON civic_events
FOR EACH ROW
EXECUTE FUNCTION reject_public_event_for_custody_need();

CREATE OR REPLACE FUNCTION validate_civic_custody_grant_revocation_receipt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  custody_grant civic_custody_grants%ROWTYPE;
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

  IF custody_grant.closed_reason IS DISTINCT FROM 'revoked'
    OR custody_grant.revoked_at IS NULL
    OR custody_grant.closed_at IS DISTINCT FROM custody_grant.revoked_at
    OR NEW.revoked_at IS DISTINCT FROM custody_grant.revoked_at
  THEN
    RAISE EXCEPTION 'revocation receipt does not match the authoritative grant'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.created_at < custody_grant.created_at
    OR NEW.created_at + interval '5 minutes' < NEW.revoked_at
    OR NEW.created_at > clock_timestamp() + interval '5 minutes'
  THEN
    RAISE EXCEPTION 'revocation receipt timestamp is invalid'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM users AS receipt_actor
    WHERE receipt_actor.id = NEW.revoked_by_user_id
      AND receipt_actor.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'revocation receipt actor is not active'
      USING ERRCODE = '42501';
  END IF;

  -- `revoked_by_user_id` identifica al emisor de este recibo idempotente. El
  -- grantor puede pedirlo tarde; el revocador original puede recuperarlo; una
  -- coordinación actual puede asentar el recibo de una carrera concurrente.
  IF NEW.revoked_by_user_id <> custody_grant.grantor_user_id
    AND NEW.revoked_by_user_id <> custody_grant.revoked_by_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM circle_members AS membership
      INNER JOIN circles AS recipient_circle
        ON recipient_circle.id = membership.circle_id
      INNER JOIN users AS coordinator
        ON coordinator.id = membership.user_id
      WHERE membership.circle_id = custody_grant.recipient_circle_id
        AND membership.user_id = NEW.revoked_by_user_id
        AND membership.role = 'coordinador'
        AND coordinator.is_active = TRUE
        AND (recipient_circle.kind = 'celula' OR recipient_circle.is_private = TRUE)
    )
  THEN
    RAISE EXCEPTION 'revocation receipt actor is not authorized'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grant_revocations_validate
  ON civic_custody_grant_revocations;
CREATE TRIGGER civic_custody_grant_revocations_validate
BEFORE INSERT ON civic_custody_grant_revocations
FOR EACH ROW
EXECUTE FUNCTION validate_civic_custody_grant_revocation_receipt();

CREATE OR REPLACE FUNCTION reject_civic_custody_grant_revocation_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'civic custody grant revocations are append-only'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS civic_custody_grant_revocations_append_only
  ON civic_custody_grant_revocations;
CREATE TRIGGER civic_custody_grant_revocations_append_only
BEFORE UPDATE OR DELETE ON civic_custody_grant_revocations
FOR EACH ROW
EXECUTE FUNCTION reject_civic_custody_grant_revocation_mutation();

COMMIT;
