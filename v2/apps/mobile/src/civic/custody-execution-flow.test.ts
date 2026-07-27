import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CivicCustodyExecutionIntentRow } from '@/db/schema';

import {
  CUSTODY_EXECUTION_CONTRACT,
  CUSTODY_EXECUTION_EMPTY_VERSION,
  CUSTODY_EXECUTION_INBOX_SCOPE,
  CUSTODY_EXECUTION_STATUS_SCOPE,
  loadCustodyExecutionIntentInventory,
  loadCustodyExecutionCoordinatorInbox,
  loadPendingCustodyExecutionIntents,
  loadCustodyExecutionStatus,
  retryCustodyExecutionEvent,
  submitCustodyExecutionEvent,
  type CustodyExecutionView,
} from './custody-execution';
import type { CustodyExecutionIntentDatabase } from './custody-execution-intents';

const runtime = vi.hoisted(() => ({
  grant: null as Record<string, unknown> | null,
  patches: [] as Record<string, unknown>[],
  communityFetch: vi.fn(),
  flush: vi.fn(async () => undefined),
  session: { user: { id: 7 } } as { user: { id: number } } | null,
  proof: vi.fn(async () => 'device-proof'),
  randomUUID: vi.fn(() => '7dc827ec-bd89-4ccd-9353-f8b69193fd41'),
  sequence: [] as string[],
}));

vi.mock('expo-crypto', () => ({ randomUUID: runtime.randomUUID }));
vi.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ get: () => runtime.grant }),
      }),
    }),
    update: () => ({
      set: (patch: Record<string, unknown>) => ({
        where: () => ({
          run: () => {
            runtime.patches.push(patch);
            runtime.grant = { ...runtime.grant, ...patch };
            return { changes: 1 };
          },
        }),
      }),
    }),
  },
  flushWebDatabaseSnapshot: vi.fn(async () => {
    runtime.sequence.push('flush');
    return runtime.flush();
  }),
}));
vi.mock('./community-auth', () => ({
  communityErrorFromResponse: vi.fn(async (response: Response) => {
    const error = new Error(`remote_${response.status}`) as Error & { code: string };
    error.code = `REMOTE_${response.status}`;
    return error;
  }),
  communityFetchForUser: vi.fn((userId: number, path: string, init?: RequestInit) => {
    runtime.sequence.push('http');
    return runtime.communityFetch(userId, path, init);
  }),
  getCommunitySession: vi.fn(async () => runtime.session),
}));
vi.mock('./config', () => ({ CIVIC_API_URL: 'https://civic.example' }));
vi.mock('./device-auth', () => ({ ensureCivicDeviceToken: runtime.proof }));

const proposalId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';
const generatedEventId = '7dc827ec-bd89-4ccd-9353-f8b69193fd41';
const createdAt = '2026-07-14T12:00:00.000Z';
const eventAt = '2026-07-14T12:01:00.000Z';
const coordinatorAt = '2026-07-14T12:02:00.000Z';
const expiresAt = '2026-07-20T12:00:00.000Z';
const observedAt = '2026-07-14T12:00:30.000Z';

const jsonResponse = (body: unknown, status = 200): Response => new Response(
  JSON.stringify(body),
  { status, headers: { 'content-type': 'application/json' } },
);

const initialExecution = (id = proposalId): CustodyExecutionView => ({
  proposalId: id,
  state: 'awaiting_reservation',
  version: CUSTODY_EXECUTION_EMPTY_VERSION,
  capacity: { quantity: 12, unit: 'meals' },
  readiness: { grantor: false, coordinator: false },
  milestones: {
    reservedAt: null,
    grantorReadyAt: null,
    coordinatorReadyAt: null,
    deliveryStartedAt: null,
    deliveryReportedAt: null,
    receiptRecordedAt: null,
    followUpRecordedAt: null,
    withdrawnAt: null,
  },
  delivery: null,
  receipt: null,
  followUp: null,
  reconciliation: {
    receiptAvailableAt: null,
    receiptWindowOpen: false,
    withdrawnBy: null,
  },
  createdAt,
  expiresAt,
  updatedAt: createdAt,
});

const grantorReadyExecution = (): CustodyExecutionView => ({
  ...initialExecution(),
  version: 'a'.repeat(64),
  readiness: { grantor: true, coordinator: false },
  milestones: { ...initialExecution().milestones, grantorReadyAt: eventAt },
  updatedAt: eventAt,
});

const coordinatorReadyExecution = (): CustodyExecutionView => ({
  ...initialExecution(),
  version: 'b'.repeat(64),
  readiness: { grantor: false, coordinator: true },
  milestones: { ...initialExecution().milestones, coordinatorReadyAt: coordinatorAt },
  updatedAt: coordinatorAt,
});

const acceptedGrantorReady = (
  request: { eventId: string; expectedVersion: string },
  status: 'accepted' | 'duplicate' = 'accepted',
) => ({
  contract: CUSTODY_EXECUTION_CONTRACT,
  status,
  recordedEvent: {
    eventId: request.eventId,
    proposalId,
    type: 'grantor_ready',
    actorRole: 'grantor',
    expectedVersion: request.expectedVersion,
    quantity: null,
    unit: null,
    receipt: null,
    followUp: null,
    recordedAt: eventAt,
    version: 'a'.repeat(64),
  },
  execution: grantorReadyExecution(),
  refreshedAt: eventAt,
});

const localGrant = (ownerUserId = 7): Record<string, unknown> => ({
  id: 'grant-local',
  remoteGrantorUserId: ownerUserId,
  remoteCoordinationProposalId: proposalId,
  remoteCoordinationTerminalDecision: 'accept',
  remoteExecutionJson: null,
  remoteExecutionObservedAt: null,
});

const fakeIntentDatabase = () => {
  const rows: CivicCustodyExecutionIntentRow[] = [];
  const database = {
    select: () => ({
      from: () => ({
        where: () => ({
          get: () => rows[0],
          all: () => [...rows],
        }),
        all: () => [...rows],
      }),
    }),
    insert: () => ({
      values: (row: CivicCustodyExecutionIntentRow) => ({
        onConflictDoNothing: () => ({
          run: () => {
            if (rows.length > 0) return { changes: 0 };
            rows.push({ ...row });
            return { changes: 1 };
          },
        }),
      }),
    }),
    update: () => ({
      set: (patch: Partial<CivicCustodyExecutionIntentRow>) => ({
        where: () => ({
          run: () => {
            if (!rows[0]) return { changes: 0 };
            Object.assign(rows[0], patch);
            return { changes: 1 };
          },
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        run: () => ({ changes: rows.splice(0, rows.length).length }),
      }),
    }),
  } as unknown as CustodyExecutionIntentDatabase;
  return { database, rows };
};

describe('transporte durable de ejecución custodial', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-07-14T12:10:00.000Z');
    runtime.grant = localGrant();
    runtime.patches = [];
    runtime.communityFetch.mockReset();
    runtime.flush.mockReset();
    runtime.flush.mockResolvedValue(undefined);
    runtime.session = { user: { id: 7 } };
    runtime.proof.mockClear();
    runtime.randomUUID.mockClear();
    runtime.sequence = [];
  });

  afterEach(() => { vi.useRealTimers(); });

  it('persiste y hace flush antes del HTTP, con cuerpo plano e idempotencia exacta', async () => {
    const { database, rows } = fakeIntentDatabase();
    runtime.communityFetch.mockImplementation(async (
      userId: number,
      path: string,
      init: RequestInit,
    ) => {
      expect(userId).toBe(7);
      expect(path).toBe('/api/v1/civic/custody/execution/events');
      expect(rows).toHaveLength(1);
      expect(runtime.sequence.slice(-2)).toEqual(['flush', 'http']);
      const request = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(request).toEqual({
        eventId: generatedEventId,
        proposalId,
        expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
        type: 'grantor_ready',
      });
      expect(init.headers).toMatchObject({
        'content-type': 'application/json',
        'idempotency-key': `custody:${proposalId}:execution:event:${generatedEventId}`,
        'x-civic-device-token': 'device-proof',
      });
      return jsonResponse(acceptedGrantorReady({
        eventId: String(request.eventId),
        expectedVersion: String(request.expectedVersion),
      }), 201);
    });

    const receipt = await submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database);

    expect(receipt.status).toBe('accepted');
    expect(rows).toHaveLength(0);
    expect(runtime.randomUUID).toHaveBeenCalledTimes(1);
    expect(runtime.flush).toHaveBeenCalledTimes(2);
    expect(runtime.patches.at(-1)).toMatchObject({
      remoteExecutionObservedAt: eventAt,
    });
  });

  it('conserva el mismo eventId, body e idempotency después de red caída y reinicio', async () => {
    const { database, rows } = fakeIntentDatabase();
    const sent: { body: string; key: string }[] = [];
    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      sent.push({
        body: String(init.body),
        key: String((init.headers as Record<string, string>)['idempotency-key']),
      });
      throw new Error('offline');
    });

    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database)).rejects.toThrow('offline');
    expect(rows).toHaveLength(1);
    const durableBody = rows[0]!.requestJson;

    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      sent.push({
        body: String(init.body),
        key: String((init.headers as Record<string, string>)['idempotency-key']),
      });
      const request = JSON.parse(String(init.body)) as { eventId: string; expectedVersion: string };
      return jsonResponse(acceptedGrantorReady(request, 'duplicate'));
    });
    await expect(retryCustodyExecutionEvent(proposalId, 7, database))
      .resolves.toMatchObject({ status: 'duplicate' });

    expect(sent[0]).toEqual(sent[1]);
    expect(sent[0]!.body).toBe(durableBody);
    expect(runtime.randomUUID).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(0);
  });

  it('no limpia ante un recibo inválido ni ante un 409 ordinario', async () => {
    const first = fakeIntentDatabase();
    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      const request = JSON.parse(String(init.body)) as { eventId: string; expectedVersion: string };
      return jsonResponse({ ...acceptedGrantorReady(request), contact: 'PII inesperada' });
    });
    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, first.database)).rejects.toThrow();
    expect(first.rows).toHaveLength(1);

    runtime.communityFetch.mockResolvedValueOnce(jsonResponse({
      error: { code: 'CUSTODY_EXECUTION_IDEMPOTENCY_CONFLICT' },
    }, 409));
    await expect(retryCustodyExecutionEvent(proposalId, 7, first.database)).rejects.toThrow();
    expect(first.rows).toHaveLength(1);
  });

  it('limpia sólo un rechazo 409 exacto con ejecución autoritativa', async () => {
    const { database, rows } = fakeIntentDatabase();
    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      const request = JSON.parse(String(init.body)) as { eventId: string };
      return jsonResponse({
        contract: CUSTODY_EXECUTION_CONTRACT,
        status: 'rejected',
        reason: 'version_changed',
        eventId: request.eventId,
        recordedEvent: null,
        execution: coordinatorReadyExecution(),
        refreshedAt: coordinatorAt,
      }, 409);
    });

    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database)).resolves.toMatchObject({
      status: 'rejected',
      reason: 'version_changed',
    });
    expect(rows).toHaveLength(0);
    expect(runtime.patches.at(-1)).toMatchObject({ remoteExecutionObservedAt: coordinatorAt });
  });

  it('preserva la intención si la cuenta cambia después del HTTP', async () => {
    const { database, rows } = fakeIntentDatabase();
    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      runtime.session = { user: { id: 8 } };
      const request = JSON.parse(String(init.body)) as { eventId: string; expectedVersion: string };
      return jsonResponse(acceptedGrantorReady(request));
    });

    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database)).rejects.toThrow('AUTH_SESSION_CHANGED');
    expect(rows).toHaveLength(1);
    expect(runtime.patches).toHaveLength(0);
  });

  it('restaura la intención si falla la persistencia del borrado confirmado', async () => {
    const { database, rows } = fakeIntentDatabase();
    let flushNumber = 0;
    runtime.flush.mockImplementation(async () => {
      flushNumber += 1;
      if (flushNumber === 2) throw new Error('snapshot_write_failed');
    });
    runtime.communityFetch.mockImplementationOnce(async (
      _userId: number,
      _path: string,
      init: RequestInit,
    ) => {
      const request = JSON.parse(String(init.body)) as { eventId: string; expectedVersion: string };
      return jsonResponse(acceptedGrantorReady(request));
    });

    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'grantor_ready',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database)).rejects.toThrow('snapshot_write_failed');

    expect(flushNumber).toBe(3);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      eventId: generatedEventId,
      proposalId,
      eventType: 'grantor_ready',
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
    });
  });

  it('no inicia una acción grantora desde el cache de otra cuenta', async () => {
    const { database, rows } = fakeIntentDatabase();
    runtime.grant = localGrant(8);

    await expect(submitCustodyExecutionEvent({
      proposalId,
      type: 'confirm_receipt',
      receipt: 'not_received',
      snapshot: { execution: initialExecution(), observedAt },
    }, 7, database)).rejects.toThrow('CUSTODY_EXECUTION_LOCAL_GRANT_MISMATCH');
    expect(rows).toHaveLength(0);
    expect(runtime.communityFetch).not.toHaveBeenCalled();
  });

  it('aísla una fila corrupta sin ocultar las sanas, borrarla ni reenviarla', async () => {
    const { database, rows } = fakeIntentDatabase();
    const validRequest = {
      eventId: generatedEventId,
      proposalId,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
      type: 'grantor_ready',
    };
    rows.push({
      eventId: generatedEventId,
      userId: 7,
      proposalId,
      eventType: 'grantor_ready',
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
      requestJson: JSON.stringify(validRequest),
      executionJson: JSON.stringify(initialExecution()),
      snapshotObservedAt: observedAt,
      createdAt: observedAt,
      lastAttemptAt: null,
    });
    const corruptProposalId = '8dc827ec-bd89-4ccd-9353-f8b69193fd41';
    rows.push({
      eventId: '9dc827ec-bd89-4ccd-9353-f8b69193fd41',
      userId: 7,
      proposalId: corruptProposalId,
      eventType: 'reserve',
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
      requestJson: '{',
      executionJson: '{"contact":"no se expone"}',
      snapshotObservedAt: observedAt,
      createdAt: observedAt,
      lastAttemptAt: null,
    });

    expect(loadPendingCustodyExecutionIntents(7, database)).toHaveLength(1);
    const inventory = loadCustodyExecutionIntentInventory(7, database);
    expect(inventory.intents).toHaveLength(1);
    expect(inventory.incidents).toEqual([{
      kind: 'corrupt_local_intent',
      code: 'CUSTODY_EXECUTION_INTENT_CORRUPT',
      userId: 7,
      proposalId: corruptProposalId,
      eventId: '9dc827ec-bd89-4ccd-9353-f8b69193fd41',
      type: 'reserve',
      createdAt: observedAt,
    }]);
    expect(inventory.lockedProposalIds).toEqual([proposalId, corruptProposalId]);
    expect(JSON.stringify(inventory)).not.toContain('contact');
    expect(rows).toHaveLength(2);

    const corruptOnly = fakeIntentDatabase();
    corruptOnly.rows.push(rows[1]!);
    await expect(submitCustodyExecutionEvent({
      proposalId: corruptProposalId,
      type: 'reserve',
      snapshot: { execution: initialExecution(corruptProposalId), observedAt },
    }, 7, corruptOnly.database)).rejects.toThrow('CUSTODY_EXECUTION_INTENT_CORRUPT');
    expect(corruptOnly.rows).toHaveLength(1);
    expect(runtime.communityFetch).not.toHaveBeenCalled();
  });

  it('cachea status válido y conserva el anterior si la siguiente respuesta falla cerrada', async () => {
    const validStatus = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: CUSTODY_EXECUTION_STATUS_SCOPE,
      execution: initialExecution(),
      refreshedAt: observedAt,
    };
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse(validStatus));
    await expect(loadCustodyExecutionStatus(proposalId, 7)).resolves.toEqual(validStatus);
    expect(runtime.grant).toMatchObject({
      remoteExecutionJson: JSON.stringify(initialExecution()),
      remoteExecutionObservedAt: observedAt,
    });
    const prior = { ...runtime.grant };

    runtime.patches = [];
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse({ ...validStatus, phone: 'no' }));
    await expect(loadCustodyExecutionStatus(proposalId, 7)).rejects.toThrow();
    expect(runtime.grant).toEqual(prior);
    expect(runtime.patches).toHaveLength(0);
  });

  it('pagina la bandeja con un único corte y detecta duplicados entre páginas', async () => {
    const refreshedAt = observedAt;
    const firstExecutions = Array.from({ length: 50 }, (_, index) => {
      const suffix = String(index + 1).padStart(12, '0');
      return initialExecution(`00000000-0000-4000-8000-${suffix}`);
    });
    const finalExecution = initialExecution('00000000-0000-4000-8000-000000000051');
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: CUSTODY_EXECUTION_INBOX_SCOPE,
        executions: firstExecutions,
        refreshedAt,
        nextCursor: 'cursor_page_02',
      }))
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: CUSTODY_EXECUTION_INBOX_SCOPE,
        executions: [finalExecution],
        refreshedAt,
        nextCursor: null,
      }));

    await expect(loadCustodyExecutionCoordinatorInbox(7)).resolves.toMatchObject({
      executions: [...firstExecutions, finalExecution],
      nextCursor: null,
    });
    expect(runtime.communityFetch.mock.calls[1]?.[1]).toContain('cursor=cursor_page_02');

    runtime.communityFetch.mockReset();
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: CUSTODY_EXECUTION_INBOX_SCOPE,
        executions: firstExecutions,
        refreshedAt,
        nextCursor: 'cursor_page_02',
      }))
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: CUSTODY_EXECUTION_INBOX_SCOPE,
        executions: [firstExecutions[0]],
        refreshedAt,
        nextCursor: null,
      }));
    await expect(loadCustodyExecutionCoordinatorInbox(7)).rejects.toThrow();
  });
});
