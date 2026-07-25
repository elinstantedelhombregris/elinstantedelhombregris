\set ON_ERROR_STOP on

-- Regresión real de PostgreSQL para la ruta privada de ejecución. Se ejecuta
-- sobre una base descartable con las migraciones cívicas aplicadas.
BEGIN;

INSERT INTO users (id, username, password, email, name, is_active) VALUES
  (9101, 'execution_grantor', 'test', 'execution-grantor@example.invalid', 'Grantor test', TRUE),
  (9102, 'execution_coordinator', 'test', 'execution-coordinator@example.invalid', 'Coordinator test', TRUE);

INSERT INTO circles (id, name, kind, governance, is_private, created_by)
VALUES (9201, 'Execution test circle', 'celula', 'coordinado', TRUE, 9102);

INSERT INTO circle_members (circle_id, user_id, role) VALUES
  (9201, 9101, 'miembro'),
  (9201, 9102, 'coordinador');

INSERT INTO civic_devices (actor_key, secret_hash, linked_user_id) VALUES
  ('actor_10000000-0000-4000-8000-000000000001', repeat('a', 64), 9101);

INSERT INTO civic_entity_owners (entity_type, entity_id, owner_actor_key)
VALUES (
  'custody_need',
  '10000000-0000-4000-8000-000000000002',
  'actor_10000000-0000-4000-8000-000000000001'
);

WITH stamp AS (SELECT clock_timestamp() AS value)
INSERT INTO civic_custody_grants (
  grant_id, idempotency_key, request_hash, need_id, owner_actor_key,
  grantor_user_id, recipient_type, recipient_circle_id, payload_json,
  expires_at, created_at, updated_at
)
SELECT
  '10000000-0000-4000-8000-000000000001',
  'test:execution:grant', repeat('b', 64),
  '10000000-0000-4000-8000-000000000002',
  'actor_10000000-0000-4000-8000-000000000001',
  9101, 'circle', 9201,
  '{"category":"food","quantity":10,"unit":"meals","urgency":4,"location":null}'::jsonb,
  stamp.value + interval '2 days', stamp.value, stamp.value
FROM stamp;

INSERT INTO civic_custody_grant_responses (
  response_id, idempotency_key, request_hash, grant_id,
  responder_user_id, disposition, applied, created_at
) VALUES (
  '11000000-0000-4000-8000-000000000001',
  'test:execution:assessing', repeat('c', 64),
  '10000000-0000-4000-8000-000000000001',
  9102, 'assessing', TRUE, clock_timestamp()
);

INSERT INTO civic_custody_grant_responses (
  response_id, idempotency_key, request_hash, grant_id,
  responder_user_id, disposition, quantity, unit, applied, created_at
) VALUES (
  '11000000-0000-4000-8000-000000000002',
  'test:execution:support', repeat('d', 64),
  '10000000-0000-4000-8000-000000000001',
  9102, 'support_available', 8, 'meals', TRUE, clock_timestamp()
);

INSERT INTO civic_custody_coordination_proposals (
  proposal_id, grant_id, source_response_id, idempotency_key, request_hash,
  proposer_user_id, quantity, unit, expires_at, created_at
)
SELECT
  derive_civic_custody_coordination_uuid(custody_grant.grant_id, 'proposal'),
  custody_grant.grant_id,
  '11000000-0000-4000-8000-000000000002',
  'test:execution:proposal', repeat('e', 64),
  9102, 8, 'meals', custody_grant.expires_at, clock_timestamp()
FROM civic_custody_grants AS custody_grant
WHERE custody_grant.grant_id = '10000000-0000-4000-8000-000000000001';

INSERT INTO civic_custody_coordination_decisions (
  decision_id, proposal_id, idempotency_key, request_hash,
  decider_user_id, owner_actor_key, decision, created_at
)
SELECT
  derive_civic_custody_coordination_uuid(proposal.proposal_id, 'decision'),
  proposal.proposal_id,
  'test:execution:decision', repeat('f', 64),
  9101, 'actor_10000000-0000-4000-8000-000000000001',
  'accept', clock_timestamp()
FROM civic_custody_coordination_proposals AS proposal
WHERE proposal.grant_id = '10000000-0000-4000-8000-000000000001';

INSERT INTO civic_custody_executions (
  proposal_id, accepted_decision_id, grant_id, proposer_user_id,
  grantor_user_id, owner_actor_key, quantity, unit,
  expires_at, accepted_at, created_at
)
SELECT
  proposal.proposal_id, decision.decision_id, proposal.grant_id,
  proposal.proposer_user_id, 9101,
  'actor_10000000-0000-4000-8000-000000000001',
  proposal.quantity, proposal.unit, proposal.expires_at,
  decision.created_at, decision.created_at
FROM civic_custody_coordination_proposals AS proposal
INNER JOIN civic_custody_coordination_decisions AS decision
  ON decision.proposal_id = proposal.proposal_id
WHERE proposal.grant_id = '10000000-0000-4000-8000-000000000001';

-- Helper repetido explícitamente: cada fila prueba el contrato almacenado y
-- la cadena optimista que también usa el servicio.
INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, owner_actor_key, event_type, expected_version,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000001', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000001',
  repeat('1', 64), 'grantor', 9101,
  'actor_10000000-0000-4000-8000-000000000001',
  'grantor_ready',
  '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
  TRUE, 1, repeat('1', 64), clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000002', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000002',
  repeat('2', 64), 'coordinator', 9102, 'coordinator_ready',
  repeat('1', 64), TRUE, 2, repeat('2', 64), clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000003', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000003',
  repeat('3', 64), 'coordinator', 9102, 'reserve',
  repeat('2', 64), TRUE, 3, repeat('3', 64), clock_timestamp()
FROM civic_custody_executions;

-- Un duplicado con la versión correcta debe persistirse como rechazo, no
-- explotar como 500 ni avanzar la cadena.
INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version,
  applied, rejection_reason, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000009', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000009',
  repeat('9', 64), 'coordinator', 9102, 'reserve',
  repeat('3', 64), FALSE, 'transition_not_allowed', clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000004', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000004',
  repeat('4', 64), 'coordinator', 9102, 'start_delivery',
  repeat('3', 64), TRUE, 4, repeat('4', 64), clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version, quantity, unit,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000005', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000005',
  repeat('5', 64), 'coordinator', 9102, 'report_delivery',
  repeat('4', 64), 6, 'meals', TRUE, 5, repeat('5', 64), clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, event_type, expected_version,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000006', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000006',
  repeat('6', 64), 'coordinator', 9102, 'withdraw',
  repeat('5', 64), TRUE, 6, repeat('6', 64), clock_timestamp()
FROM civic_custody_executions;

-- El retiro del coordinador no borra los hitos: la cuenta grantora todavía
-- puede conciliar una recepción real ocurrida después del inicio.
INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, owner_actor_key, event_type, expected_version,
  quantity, unit, receipt_outcome,
  applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000007', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000007',
  repeat('7', 64), 'grantor', 9101,
  'actor_10000000-0000-4000-8000-000000000001',
  'confirm_receipt', repeat('6', 64),
  4, 'meals', 'partial', TRUE, 7, repeat('7', 64), clock_timestamp()
FROM civic_custody_executions;

INSERT INTO civic_custody_execution_commands (
  event_id, proposal_id, idempotency_key, request_hash, actor_role,
  actor_user_id, owner_actor_key, event_type, expected_version,
  follow_up_outcome, applied, sequence, event_version, created_at
)
SELECT
  '20000000-0000-4000-8000-000000000008', proposal_id,
  'custody:' || proposal_id || ':execution:event:20000000-0000-4000-8000-000000000008',
  repeat('8', 64), 'grantor', 9101,
  'actor_10000000-0000-4000-8000-000000000001',
  'record_follow_up', repeat('7', 64),
  'still_open', TRUE, 8, repeat('8', 64), clock_timestamp()
FROM civic_custody_executions;

DO $$
DECLARE
  applied_count integer;
  rejected_count integer;
BEGIN
  SELECT count(*) INTO applied_count
  FROM civic_custody_execution_commands WHERE applied = TRUE;
  SELECT count(*) INTO rejected_count
  FROM civic_custody_execution_commands
  WHERE applied = FALSE AND rejection_reason = 'transition_not_allowed';
  IF applied_count <> 8 OR rejected_count <> 1 THEN
    RAISE EXCEPTION 'unexpected custody execution ledger: applied %, rejected %',
      applied_count, rejected_count;
  END IF;

  BEGIN
    UPDATE civic_custody_execution_commands
    SET request_hash = repeat('0', 64)
    WHERE event_id = '20000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'expected append-only command rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    DELETE FROM civic_custody_executions;
    RAISE EXCEPTION 'expected append-only root rejection';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$$;

ROLLBACK;
