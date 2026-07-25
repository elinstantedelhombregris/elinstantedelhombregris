\set ON_ERROR_STOP on

-- Este regression test asume las migraciones cívicas aplicadas sobre las
-- tablas mínimas users/circles/circle_members. Usa ids reservados 101-201.
INSERT INTO users (id, username, password, email, name, is_active) VALUES
  (101, 'custody_integrity_101', 'test', 'custody-integrity-101@example.invalid', 'Custody 101', TRUE),
  (102, 'custody_integrity_102', 'test', 'custody-integrity-102@example.invalid', 'Custody 102', TRUE),
  (103, 'custody_integrity_103', 'test', 'custody-integrity-103@example.invalid', 'Custody 103', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO circles (id, name, kind, governance, is_private)
VALUES (201, 'Custody integrity test', 'celula', 'coordinado', TRUE)
ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, is_private = EXCLUDED.is_private;

INSERT INTO circle_members (circle_id, user_id, role) VALUES
  (201, 101, 'miembro'),
  (201, 102, 'coordinador')
ON CONFLICT (circle_id, user_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO civic_devices (actor_key, secret_hash, linked_user_id) VALUES
  ('actor_00000000-0000-4000-8000-000000000101', repeat('a', 64), 101),
  ('actor_00000000-0000-4000-8000-000000000102', repeat('b', 64), 102),
  ('actor_00000000-0000-4000-8000-000000000103', repeat('c', 64), 103)
ON CONFLICT (actor_key) DO NOTHING;

INSERT INTO civic_entity_owners (entity_type, entity_id, owner_actor_key) VALUES
  ('custody_need', '00000000-0000-4000-8000-000000001101', 'actor_00000000-0000-4000-8000-000000000101'),
  ('custody_need', '00000000-0000-4000-8000-000000001102', 'actor_00000000-0000-4000-8000-000000000101'),
  ('custody_need', '00000000-0000-4000-8000-000000001103', 'actor_00000000-0000-4000-8000-000000000101'),
  ('custody_need', '00000000-0000-4000-8000-000000001104', 'actor_00000000-0000-4000-8000-000000000101'),
  ('custody_need', '00000000-0000-4000-8000-000000001201', 'actor_00000000-0000-4000-8000-000000000101'),
  ('custody_need', '00000000-0000-4000-8000-000000001202', 'actor_00000000-0000-4000-8000-000000000103')
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO civic_events (
  event_id, idempotency_key, actor_key, entity_type, entity_id,
  operation, payload_json, event_hash, occurred_at
) VALUES (
  '00000000-0000-4000-8000-000000000303',
  'test:public:first:303',
  'actor_00000000-0000-4000-8000-000000000102',
  'need', '00000000-0000-4000-8000-000000001401',
  'create', '{}', repeat('3', 64), statement_timestamp()::text
);

DO $$
BEGIN
  BEGIN
    INSERT INTO civic_entity_owners (entity_type, entity_id, owner_actor_key)
    VALUES (
      'custody_need',
      '00000000-0000-4000-8000-000000001401',
      'actor_00000000-0000-4000-8000-000000000101'
    );
    RAISE EXCEPTION 'expected public-first custody owner rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO civic_custody_grants (
      grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
      grantor_user_id, recipient_type, recipient_circle_id, payload_json,
      expires_at, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000201',
      'test:grant:wrong-owner', repeat('7', 64),
      '00000000-0000-4000-8000-000000001201',
      'actor_00000000-0000-4000-8000-000000000102',
      102, 'circle', 201,
      '{"category":"food","quantity":1,"unit":"meals","urgency":2,"location":null}'::jsonb,
      statement_timestamp() + interval '60 minutes',
      statement_timestamp(), statement_timestamp()
    );
    RAISE EXCEPTION 'expected mismatched custody owner rejection';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grants (
      grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
      grantor_user_id, recipient_type, recipient_circle_id, payload_json,
      expires_at, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000202',
      'test:grant:nonmember', repeat('8', 64),
      '00000000-0000-4000-8000-000000001202',
      'actor_00000000-0000-4000-8000-000000000103',
      103, 'circle', 201,
      '{"category":"care","quantity":1,"unit":"hours","urgency":2,"location":null}'::jsonb,
      statement_timestamp() + interval '60 minutes',
      statement_timestamp(), statement_timestamp()
    );
    RAISE EXCEPTION 'expected nonmember grantor rejection';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grants (
      grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
      grantor_user_id, recipient_type, recipient_circle_id, payload_json,
      expires_at, revoked_at, revoked_by_user_id, closed_at, closed_reason,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000203',
      'test:grant:born-closed', repeat('9', 64),
      '00000000-0000-4000-8000-000000001201',
      'actor_00000000-0000-4000-8000-000000000101',
      101, 'circle', 201,
      '{"category":"food","quantity":1,"unit":"meals","urgency":2,"location":null}'::jsonb,
      statement_timestamp() + interval '60 minutes',
      statement_timestamp(), 103, statement_timestamp(), 'revoked',
      statement_timestamp(), statement_timestamp()
    );
    RAISE EXCEPTION 'expected born-closed grant rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grants (
      grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
      grantor_user_id, recipient_type, recipient_circle_id, payload_json,
      expires_at, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000204',
      'test:grant:split-clock', repeat('0', 64),
      '00000000-0000-4000-8000-000000001201',
      'actor_00000000-0000-4000-8000-000000000101',
      101, 'circle', 201,
      '{"category":"food","quantity":1,"unit":"meals","urgency":2,"location":null}'::jsonb,
      statement_timestamp() + interval '60 minutes',
      statement_timestamp(), statement_timestamp() + interval '1 second'
    );
    RAISE EXCEPTION 'expected split initial timestamps rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

INSERT INTO civic_custody_grants (
  grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
  grantor_user_id, recipient_type, recipient_circle_id, payload_json,
  expires_at, created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000101',
  'test:grant:101', repeat('a', 64),
  '00000000-0000-4000-8000-000000001101',
  'actor_00000000-0000-4000-8000-000000000101',
  101, 'circle', 201,
  '{"category":"food","quantity":10,"unit":"meals","urgency":4,"location":null}'::jsonb,
  statement_timestamp() + interval '60 minutes',
  statement_timestamp() - interval '4 minutes 30 seconds',
  statement_timestamp() - interval '4 minutes 30 seconds'
);

DO $$
BEGIN
  BEGIN
    UPDATE civic_entity_owners
    SET owner_actor_key = 'actor_00000000-0000-4000-8000-000000000102'
    WHERE entity_type = 'custody_need'
      AND entity_id = '00000000-0000-4000-8000-000000001201';
    RAISE EXCEPTION 'expected custody owner update rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    DELETE FROM civic_entity_owners
    WHERE entity_type = 'custody_need'
      AND entity_id = '00000000-0000-4000-8000-000000001202';
    RAISE EXCEPTION 'expected custody owner delete rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_events (
      event_id, idempotency_key, actor_key, entity_type, entity_id,
      operation, payload_json, event_hash, occurred_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000301',
      'test:public:need:301',
      'actor_00000000-0000-4000-8000-000000000102',
      'need', '00000000-0000-4000-8000-000000001101',
      'create', '{}', repeat('1', 64), clock_timestamp()::text
    );
    RAISE EXCEPTION 'expected public custody need rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_events (
      event_id, idempotency_key, actor_key, entity_type, entity_id,
      operation, payload_json, event_hash, occurred_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000302',
      'test:public:match:302',
      'actor_00000000-0000-4000-8000-000000000102',
      'match', '00000000-0000-4000-8000-000000001302',
      'create',
      '{"needId":"00000000-0000-4000-8000-000000001101"}',
      repeat('2', 64), clock_timestamp()::text
    );
    RAISE EXCEPTION 'expected public match custody reference rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    DELETE FROM civic_custody_grants
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected grant delete rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grant_revocations (
      grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000101',
      'test:receipt:open-grant', repeat('9', 64), 101, clock_timestamp()
    );
    RAISE EXCEPTION 'expected receipt on open grant rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE civic_custody_grants
    SET payload_json = jsonb_set(payload_json, '{urgency}', '5'::jsonb)
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected immutable payload rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    UPDATE civic_custody_grants
    SET revoked_at = statement_timestamp(), revoked_by_user_id = 103,
        closed_at = statement_timestamp(), closed_reason = 'revoked',
        updated_at = statement_timestamp()
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected unauthorized revoker rejection';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE civic_custody_grants
    SET revoked_at = expires_at, revoked_by_user_id = 102,
        closed_at = expires_at, closed_reason = 'revoked', updated_at = expires_at
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected revoked_at >= expires_at rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE civic_custody_grants
    SET revoked_at = statement_timestamp() + interval '10 minutes', revoked_by_user_id = 102,
        closed_at = statement_timestamp() + interval '10 minutes', closed_reason = 'revoked',
        updated_at = statement_timestamp() + interval '10 minutes'
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected future revocation timestamp rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- Transición válida ejecutada por la coordinación actual.
UPDATE civic_custody_grants
SET revoked_at = statement_timestamp(), revoked_by_user_id = 102,
    closed_at = statement_timestamp(), closed_reason = 'revoked',
    updated_at = statement_timestamp()
WHERE grant_id = '00000000-0000-4000-8000-000000000101';

DO $$
BEGIN
  BEGIN
    INSERT INTO civic_custody_grant_revocations (
      grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at
    ) SELECT grant_id, 'test:receipt:wrong-time', repeat('c', 64), 102,
        revoked_at + interval '1 second'
      FROM civic_custody_grants
      WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected mismatched receipt timestamp rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grant_revocations (
      grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at
    ) SELECT grant_id, 'test:receipt:outsider', repeat('d', 64), 103, revoked_at
      FROM civic_custody_grants
      WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected unauthorized receipt actor rejection';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

INSERT INTO civic_custody_grant_revocations (
  grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at
) SELECT grant_id, 'test:receipt:coordinator', repeat('e', 64), 102, revoked_at
FROM civic_custody_grants
WHERE grant_id = '00000000-0000-4000-8000-000000000101';

-- El default transaction timestamp puede quedar apenas detrás del reloj del
-- proceso. Cuatro minutos de skew son tolerados; más de cinco, no.
INSERT INTO civic_custody_grant_revocations (
  grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at, created_at
) SELECT grant_id, 'test:receipt:clock-skew', repeat('4', 64), 102,
    revoked_at, revoked_at - interval '4 minutes'
FROM civic_custody_grants
WHERE grant_id = '00000000-0000-4000-8000-000000000101';

DO $$
BEGIN
  BEGIN
    INSERT INTO civic_custody_grant_revocations (
      grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at, created_at
    ) SELECT grant_id, 'test:receipt:excessive-skew', repeat('5', 64), 102,
        revoked_at, revoked_at - interval '6 minutes'
      FROM civic_custody_grants
      WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected excessive receipt clock skew rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO civic_custody_grant_revocations (
      grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at, created_at
    ) SELECT grant_id, 'test:receipt:future-created', repeat('6', 64), 102,
        revoked_at, clock_timestamp() + interval '10 minutes'
      FROM civic_custody_grants
      WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected future receipt creation rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- Replay tardío legítimo pedido por el grantor, no por quien ganó el UPDATE.
INSERT INTO civic_custody_grant_revocations (
  grant_id, idempotency_key, request_hash, revoked_by_user_id, revoked_at
) SELECT grant_id, 'test:receipt:late-grantor', repeat('f', 64), 101, revoked_at
FROM civic_custody_grants
WHERE grant_id = '00000000-0000-4000-8000-000000000101';

DO $$
BEGIN
  BEGIN
    UPDATE civic_custody_grant_revocations
    SET request_hash = repeat('0', 64)
    WHERE idempotency_key = 'test:receipt:coordinator';
    RAISE EXCEPTION 'expected append-only update rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    DELETE FROM civic_custody_grant_revocations
    WHERE idempotency_key = 'test:receipt:coordinator';
    RAISE EXCEPTION 'expected append-only delete rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    UPDATE civic_custody_grants
    SET revoked_at = NULL, revoked_by_user_id = NULL,
        closed_at = NULL, closed_reason = NULL, updated_at = clock_timestamp()
    WHERE grant_id = '00000000-0000-4000-8000-000000000101';
    RAISE EXCEPTION 'expected closed grant reopening rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$$;

-- Cierre expirado válido: sólo después de que el reloj DB alcanzó expires_at.
INSERT INTO civic_custody_grants (
  grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
  grantor_user_id, recipient_type, recipient_circle_id, payload_json,
  expires_at, created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000102',
  'test:grant:102', repeat('1', 64),
  '00000000-0000-4000-8000-000000001102',
  'actor_00000000-0000-4000-8000-000000000101',
  101, 'circle', 201,
  '{"category":"food","quantity":null,"unit":null,"urgency":3,"location":null}'::jsonb,
  statement_timestamp() + interval '1 second',
  statement_timestamp() - interval '4 minutes 59 seconds',
  statement_timestamp() - interval '4 minutes 59 seconds'
);
SELECT pg_sleep(1.2);
UPDATE civic_custody_grants
SET closed_at = statement_timestamp(), closed_reason = 'expired', updated_at = statement_timestamp()
WHERE grant_id = '00000000-0000-4000-8000-000000000102';

-- Un expiry futuro cercano se ignora (0 filas), aun si el caller suministra
-- como closed_at el expires_at futuro.
INSERT INTO civic_custody_grants (
  grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
  grantor_user_id, recipient_type, recipient_circle_id, payload_json,
  expires_at, created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000103',
  'test:grant:103', repeat('2', 64),
  '00000000-0000-4000-8000-000000001103',
  'actor_00000000-0000-4000-8000-000000000101',
  101, 'circle', 201,
  '{"category":"care","quantity":1,"unit":"hours","urgency":2,"location":null}'::jsonb,
  statement_timestamp() + interval '1 minute',
  statement_timestamp() - interval '4 minutes',
  statement_timestamp() - interval '4 minutes'
);
DO $$
DECLARE affected integer;
BEGIN
  UPDATE civic_custody_grants
  SET closed_at = expires_at, closed_reason = 'expired', updated_at = expires_at
  WHERE grant_id = '00000000-0000-4000-8000-000000000103';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'future expiry unexpectedly changed a row';
  END IF;
END;
$$;

-- La misma cláusula usada por markGrantRevoked pierde de forma segura una
-- carrera contra clock_timestamp().
INSERT INTO civic_custody_grants (
  grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
  grantor_user_id, recipient_type, recipient_circle_id, payload_json,
  expires_at, created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000104',
  'test:grant:104', repeat('3', 64),
  '00000000-0000-4000-8000-000000001104',
  'actor_00000000-0000-4000-8000-000000000101',
  101, 'circle', 201,
  '{"category":"mobility","quantity":1,"unit":"trips","urgency":2,"location":null}'::jsonb,
  statement_timestamp() + interval '200 milliseconds',
  statement_timestamp() - interval '4 minutes 59.8 seconds',
  statement_timestamp() - interval '4 minutes 59.8 seconds'
);
SELECT pg_sleep(0.3);
DO $$
DECLARE affected integer;
BEGIN
  UPDATE civic_custody_grants
  SET revoked_at = expires_at - interval '1 millisecond', revoked_by_user_id = 101,
      closed_at = expires_at - interval '1 millisecond', closed_reason = 'revoked',
      updated_at = expires_at - interval '1 millisecond'
  WHERE grant_id = '00000000-0000-4000-8000-000000000104'
    AND closed_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > GREATEST(expires_at - interval '1 millisecond', clock_timestamp());
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'expired revoke race unexpectedly changed a row';
  END IF;
END;
$$;

SELECT 'civic custody integrity hardening: ok' AS result;
