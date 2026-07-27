import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CivicCustodyResponseIntentRow } from '@/db/schema';

import {
  loadCustodyGrantInbox,
  parseCustodyGrantResponseReceipt,
  parseCustodyGrantInbox,
  parseCustodyGrantRevocationReceipt,
  respondToCustodyGrant,
  revokeCustodyInboxGrant,
} from './community-api';
import type { CustodyResponseIntentDatabase } from './custody-response-intents';

const runtime = vi.hoisted(() => ({
  communityFetch: vi.fn(),
  flushWebDatabaseSnapshot: vi.fn(async () => undefined),
  currentSession: { user: { id: 2 } } as { user: { id: number } } | null,
}));

vi.mock('@/db/client', () => ({
  db: {},
  flushWebDatabaseSnapshot: runtime.flushWebDatabaseSnapshot,
}));

vi.mock('./community-auth', () => ({
  CommunityApiError: class CommunityApiError extends Error {
    constructor(public readonly code: string, message = code, public readonly status = 0) { super(message); }
  },
  communityErrorFromResponse: vi.fn(async () => new Error('remote error')),
  communityFetch: runtime.communityFetch,
  communityFetchForUser: vi.fn(async (_userId: number, path: string, init?: RequestInit) => (
    init ? runtime.communityFetch(path, init) : runtime.communityFetch(path)
  )),
  getCommunitySession: vi.fn(async () => runtime.currentSession),
  publicCommunityFetch: vi.fn(),
}));

const grantId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';
const responseId = '8b573b8f-c04c-42c2-95f1-01ed4b1bb222';
const responseVersion = 'a'.repeat(64);

const recordedResponse = (
  id = responseId,
  disposition: 'assessing' | 'support_available' = 'support_available',
  quantity: number | null = disposition === 'support_available' ? 12 : null,
) => ({
  responseId: id,
  disposition,
  quantity,
  unit: quantity == null ? null : 'meals',
  responseVersion,
  recordedAt: '2026-07-14T11:50:00.000Z',
});

const validInbox = () => ({
  contract: 'basta-civic-custody-grants/v1',
  scope: 'private-circle-coordinator-inbox',
  refreshedAt: '2026-07-14T12:00:00.000Z',
  truncated: false,
  nextCursor: null as string | null,
  grants: [{
    grantId,
    recipient: { type: 'circle', id: 42 },
    payload: {
      category: 'food',
      quantity: 18,
      unit: 'meals',
      urgency: 4,
      location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
    },
    expiresAt: '2036-07-20T12:00:00.000Z',
    createdAt: '2026-07-14T11:00:00.000Z',
    state: 'active',
    response: null as null | {
      disposition: string;
      quantity: number | null;
      unit: string | null;
      responseVersion: string;
      recordedAt: string;
      [key: string]: unknown;
    },
  }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const fakeIntentDatabase = () => {
  const rows: CivicCustodyResponseIntentRow[] = [];
  const database = {
    select: () => ({
      from: () => ({
        where: () => ({
          get: () => rows[0],
          all: () => [...rows],
        }),
      }),
    }),
    insert: () => ({
      values: (row: CivicCustodyResponseIntentRow) => ({
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
      set: (patch: Partial<CivicCustodyResponseIntentRow>) => ({
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
  } as unknown as CustodyResponseIntentDatabase;
  return { database, rows };
};

describe('bandeja receptora de permisos bajo custodia', () => {
  beforeEach(() => {
    runtime.communityFetch.mockReset();
    runtime.flushWebDatabaseSnapshot.mockClear();
    runtime.currentSession = { user: { id: 2 } };
  });

  it('acepta exclusivamente la proyección pública permitida', () => {
    const parsed = parseCustodyGrantInbox(validInbox());

    expect(parsed.grants).toEqual([{
      grantId,
      recipient: { type: 'circle', id: 42 },
      payload: {
        category: 'food',
        quantity: 18,
        unit: 'meals',
        urgency: 4,
        location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
      },
      expiresAt: '2036-07-20T12:00:00.000Z',
      createdAt: '2026-07-14T11:00:00.000Z',
      state: 'active',
      response: null,
    }]);
    expect(parsed.grants[0]).not.toHaveProperty('needId');
    expect(parsed.grants[0]).not.toHaveProperty('sender');
    expect(parsed.grants[0].payload).not.toHaveProperty('contact');
    expect(parsed.grants[0].payload).not.toHaveProperty('story');
  });

  it('falla cerrado ante needId, contacto o cualquier otra clave no permitida', () => {
    const withNeedId = clone(validInbox());
    Object.assign(withNeedId.grants[0], { needId: 'bbde2aa0-3d0e-4fcf-8d53-c32ee30cd8d1' });
    expect(() => parseCustodyGrantInbox(withNeedId)).toThrow();

    const withContact = clone(validInbox());
    Object.assign(withContact.grants[0].payload, { contact: 'dato que nunca debe entrar' });
    expect(() => parseCustodyGrantInbox(withContact)).toThrow();
  });

  it('valida UUID v4, círculo positivo y coherencia temporal del estado activo', () => {
    const uppercaseId = clone(validInbox());
    uppercaseId.grants[0].grantId = grantId.toUpperCase();
    expect(() => parseCustodyGrantInbox(uppercaseId)).toThrow();

    const invalidCircle = clone(validInbox());
    invalidCircle.grants[0].recipient.id = 0;
    expect(() => parseCustodyGrantInbox(invalidCircle)).toThrow();

    const alreadyExpired = clone(validInbox());
    alreadyExpired.grants[0].expiresAt = '2026-07-14T11:30:00.000Z';
    expect(() => parseCustodyGrantInbox(alreadyExpired)).toThrow();

    const duplicated = clone(validInbox());
    duplicated.grants.push(clone(duplicated.grants[0]));
    expect(() => parseCustodyGrantInbox(duplicated)).toThrow();
  });

  it('acepta estados controlados de evaluación y capacidad sin convertirlos en resolución', () => {
    const assessing = clone(validInbox());
    assessing.grants[0].response = {
      disposition: 'assessing',
      quantity: null,
      unit: null,
      responseVersion,
      recordedAt: '2026-07-14T11:20:00.000Z',
    };
    expect(parseCustodyGrantInbox(assessing).grants[0].response).toEqual(assessing.grants[0].response);

    const support = clone(validInbox());
    support.grants[0].response = {
      disposition: 'support_available',
      quantity: 12,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T11:30:00.000Z',
    };
    expect(parseCustodyGrantInbox(support).grants[0].response).toEqual(support.grants[0].response);

    support.grants[0].response = {
      disposition: 'support_available',
      quantity: null,
      unit: null,
      responseVersion,
      recordedAt: '2026-07-14T12:02:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(support)).toThrow();
  });

  it('falla cerrado ante respuestas con cantidad, unidad, tiempo o claves incoherentes', () => {
    const invalid = clone(validInbox());
    invalid.grants[0].response = {
      disposition: 'assessing',
      quantity: 1,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T11:20:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();

    invalid.grants[0].response = {
      disposition: 'support_available',
      quantity: 19,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T11:20:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();

    invalid.grants[0].response = {
      disposition: 'support_available',
      quantity: 8,
      unit: 'hours',
      responseVersion,
      recordedAt: '2026-07-14T11:20:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();

    invalid.grants[0].response = {
      disposition: 'support_available',
      quantity: 8,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T12:10:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();

    invalid.grants[0].response = {
      disposition: 'support_available',
      quantity: 8,
      unit: 'meals',
      responseVersion: 'not-a-sha256',
      recordedAt: '2026-07-14T11:20:00.000Z',
    };
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();

    invalid.grants[0].response.responseVersion = responseVersion;
    Object.assign(invalid.grants[0].response!, { note: 'texto libre prohibido' });
    expect(() => parseCustodyGrantInbox(invalid)).toThrow();
  });

  it('carga solamente el inbox autenticado con límite fijo de 50', async () => {
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify(validInbox()), { status: 200 }));

    const inbox = await loadCustodyGrantInbox(2);

    expect(inbox.grants).toHaveLength(1);
    expect(runtime.communityFetch).toHaveBeenCalledOnce();
    expect(runtime.communityFetch).toHaveBeenCalledWith('/api/v1/civic/custody/grants?limit=50');
  });

  it('alcanza permisos 51+ sin omitir ni duplicar y conserva el mismo snapshot', async () => {
    const grants = Array.from({ length: 60 }, (_, index) => ({
      ...clone(validInbox().grants[0]),
      grantId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    }));
    const cursor = 'eyJ2IjoxLCJwYWdlIjoyfQ';
    runtime.communityFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(),
        grants: grants.slice(0, 50),
        truncated: true,
        nextCursor: cursor,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(),
        grants: grants.slice(50),
      }), { status: 200 }));

    const loaded = await loadCustodyGrantInbox(2);

    expect(loaded).toMatchObject({ truncated: false, nextCursor: null });
    expect(loaded.grants.map((item) => item.grantId)).toEqual(grants.map((item) => item.grantId));
    expect(runtime.communityFetch).toHaveBeenNthCalledWith(
      2,
      `/api/v1/civic/custody/grants?limit=50&cursor=${cursor}`,
    );
  });

  it('rechaza cursor mal formado, repetición entre páginas o cambio de refreshedAt', async () => {
    const grants = Array.from({ length: 50 }, (_, index) => ({
      ...clone(validInbox().grants[0]),
      grantId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    }));
    expect(() => parseCustodyGrantInbox({
      ...validInbox(),
      grants,
      truncated: true,
      nextCursor: 'cursor con espacios',
    })).toThrow();

    runtime.communityFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(), grants, truncated: true, nextCursor: 'eyJwYWdlIjoyfQ',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(), grants: [grants[49]],
      }), { status: 200 }));
    await expect(loadCustodyGrantInbox(2)).rejects.toThrow();

    runtime.communityFetch.mockReset();
    runtime.communityFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(), grants, truncated: true, nextCursor: 'eyJwYWdlIjoyfQ',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...validInbox(), grants: [], refreshedAt: '2026-07-14T12:00:01.000Z',
      }), { status: 200 }));
    await expect(loadCustodyGrantInbox(2)).rejects.toThrow();
  });

  it('no mezcla ni entrega una bandeja si la cuenta cambia durante la paginación', async () => {
    runtime.communityFetch.mockImplementationOnce(async () => {
      runtime.currentSession = { user: { id: 3 } };
      return new Response(JSON.stringify(validInbox()), { status: 200 });
    });

    await expect(loadCustodyGrantInbox(2)).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
  });

  it('retira con una clave idempotente determinista y valida la constancia', async () => {
    const receipt = { status: 'revoked', grantId, revokedAt: '2026-07-14T12:05:00.000Z' };
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify(receipt), { status: 200 }));

    expect(parseCustodyGrantRevocationReceipt(receipt, grantId)).toEqual(receipt);
    await revokeCustodyInboxGrant(grantId, 2);

    const [path, init] = runtime.communityFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/grants/revoke');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('idempotency-key'))
      .toBe(`custody:${grantId}:recipient-withdraw:v1`);
    expect(JSON.parse(String(init.body))).toEqual({ grantId });

    expect(() => parseCustodyGrantRevocationReceipt({ ...receipt, needId: grantId }, grantId)).toThrow();
    expect(() => parseCustodyGrantRevocationReceipt({ ...receipt, grantId: '11111111-1111-4111-8111-111111111111' }, grantId)).toThrow();
  });

  it('responde con contrato mínimo, idempotencia y constancia estricta', async () => {
    const original = parseCustodyGrantInbox(validInbox()).grants[0];
    const responded = clone(validInbox().grants[0]);
    responded.response = {
      disposition: 'support_available',
      quantity: 12,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T11:50:00.000Z',
    };
    const receipt = {
      contract: 'basta-civic-custody-grants/v1',
      status: 'accepted',
      grant: responded,
      recordedResponse: recordedResponse(),
    };
    runtime.communityFetch.mockImplementation(async (_path: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { responseId: string };
      return new Response(JSON.stringify({
        ...receipt,
        recordedResponse: recordedResponse(body.responseId),
      }), { status: 200 });
    });

    expect(parseCustodyGrantResponseReceipt(
      receipt,
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toEqual(receipt);
    const { database } = fakeIntentDatabase();
    await respondToCustodyGrant(original, 2, 'support_available', 12, database);

    const [path, init] = runtime.communityFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/grants/respond');
    expect(init.method).toBe('POST');
    const sentBody = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(sentBody.responseId).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Headers(init.headers).get('idempotency-key'))
      .toBe(`custody:${grantId}:respond:${sentBody.responseId}`);
    expect(sentBody).toEqual({
      grantId,
      responseId: sentBody.responseId,
      disposition: 'support_available',
      quantity: 12,
    });

    expect(() => parseCustodyGrantResponseReceipt(
      { ...receipt, needId: grantId },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toThrow();

    expect(parseCustodyGrantResponseReceipt(
      {
        ...receipt,
        status: 'duplicate',
        recordedResponse: recordedResponse(responseId, 'assessing', null),
      },
      original,
      responseId,
      'assessing',
      null,
      Date.parse('2026-07-14T12:00:00.000Z'),
    ).grant.response?.disposition).toBe('support_available');

    for (const state of ['revoked', 'closed'] as const) {
      expect(parseCustodyGrantResponseReceipt(
        { ...receipt, status: 'duplicate', grant: { ...responded, state } },
        original,
        responseId,
        'support_available',
        12,
        Date.parse('2026-07-14T12:00:00.000Z'),
      ).grant.state).toBe(state);
    }

    expect(parseCustodyGrantResponseReceipt(
      { ...receipt, status: 'duplicate', grant: { ...responded, state: 'expired' } },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2036-07-21T12:00:00.000Z'),
    ).grant.state).toBe('expired');
    expect(() => parseCustodyGrantResponseReceipt(
      { ...receipt, grant: { ...responded, state: 'revoked' } },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toThrow();
    expect(() => parseCustodyGrantResponseReceipt(
      { ...receipt, status: 'duplicate', grant: { ...responded, state: 'expired' } },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toThrow();

    const revisedCurrentQuantity = clone(receipt);
    revisedCurrentQuantity.grant.response!.quantity = 6;
    expect(parseCustodyGrantResponseReceipt(
      { ...revisedCurrentQuantity, status: 'duplicate' },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    ).grant.response?.quantity).toBe(6);

    const alteredRecordedQuantity = clone(receipt);
    alteredRecordedQuantity.recordedResponse.quantity = 11;
    expect(() => parseCustodyGrantResponseReceipt(
      { ...alteredRecordedQuantity, status: 'duplicate' },
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toThrow();

    expect(() => parseCustodyGrantResponseReceipt(
      receipt,
      original,
      '11111111-1111-4111-8111-111111111111',
      'support_available',
      12,
      Date.parse('2026-07-14T12:00:00.000Z'),
    )).toThrow();

    const responseAfterExpiry = clone(receipt);
    responseAfterExpiry.status = 'duplicate';
    responseAfterExpiry.grant.state = 'expired';
    responseAfterExpiry.recordedResponse.recordedAt = '2036-07-20T12:00:00.000Z';
    expect(() => parseCustodyGrantResponseReceipt(
      responseAfterExpiry,
      original,
      responseId,
      'support_available',
      12,
      Date.parse('2036-07-21T12:00:00.000Z'),
    )).toThrow();
  });

  it('persiste antes del HTTP, bloquea otro payload y reintenta el mismo comando tras reiniciar', async () => {
    const original = parseCustodyGrantInbox(validInbox()).grants[0];
    const responded = clone(validInbox().grants[0]);
    responded.response = {
      disposition: 'support_available',
      quantity: 12,
      unit: 'meals',
      responseVersion,
      recordedAt: '2026-07-14T11:50:00.000Z',
    };
    const { database, rows } = fakeIntentDatabase();
    runtime.communityFetch.mockRejectedValueOnce(new Error('lost response'));

    await expect(respondToCustodyGrant(original, 2, 'support_available', 12, database))
      .rejects.toThrow('lost response');
    expect(rows).toHaveLength(1);
    const firstBody = JSON.parse(String(
      (runtime.communityFetch.mock.calls[0] as [string, RequestInit])[1].body,
    )) as { responseId: string };
    expect(runtime.flushWebDatabaseSnapshot).toHaveBeenCalledBefore(runtime.communityFetch);

    await expect(respondToCustodyGrant(original, 2, 'support_available', 6, database))
      .rejects.toThrow('CUSTODY_RESPONSE_INTENT_PENDING_CONFLICT');
    expect(runtime.communityFetch).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(1);

    runtime.communityFetch.mockImplementationOnce(async (_path: string, init: RequestInit) => {
      const retry = JSON.parse(String(init.body)) as { responseId: string };
      return new Response(JSON.stringify({
        contract: 'basta-civic-custody-grants/v1',
        status: 'duplicate',
        grant: responded,
        recordedResponse: recordedResponse(retry.responseId, 'support_available', 11),
      }), { status: 200 });
    });
    await expect(respondToCustodyGrant(original, 2, 'support_available', 12, database))
      .rejects.toThrow();
    expect(rows).toHaveLength(1);

    const revisedCurrent = clone(responded);
    revisedCurrent.response!.quantity = 6;
    runtime.communityFetch.mockImplementationOnce(async (_path: string, init: RequestInit) => {
      const retry = JSON.parse(String(init.body)) as { responseId: string };
      return new Response(JSON.stringify({
        contract: 'basta-civic-custody-grants/v1',
        status: 'duplicate',
        grant: revisedCurrent,
        recordedResponse: recordedResponse(retry.responseId, 'support_available', 12),
      }), { status: 200 });
    });
    await expect(respondToCustodyGrant(original, 2, 'support_available', 12, database))
      .resolves.toMatchObject({ status: 'duplicate' });

    const retryBody = JSON.parse(String(
      (runtime.communityFetch.mock.calls[2] as [string, RequestInit])[1].body,
    )) as { responseId: string; quantity: number };
    expect(retryBody).toEqual({
      grantId,
      responseId: firstBody.responseId,
      disposition: 'support_available',
      quantity: 12,
    });
    expect(rows).toHaveLength(0);
  });

  it('no cruza una intención entre cuentas y conserva la deuda si la sesión cambia durante el HTTP', async () => {
    const original = parseCustodyGrantInbox(validInbox()).grants[0];
    const responded = clone(validInbox().grants[0]);
    responded.response = {
      disposition: 'assessing',
      quantity: null,
      unit: null,
      responseVersion,
      recordedAt: '2026-07-14T11:50:00.000Z',
    };
    const { database, rows } = fakeIntentDatabase();

    runtime.currentSession = { user: { id: 3 } };
    await expect(respondToCustodyGrant(original, 2, 'assessing', undefined, database))
      .rejects.toThrow('La cuenta activa cambió');
    expect(rows).toHaveLength(0);
    expect(runtime.communityFetch).not.toHaveBeenCalled();

    runtime.currentSession = { user: { id: 2 } };
    runtime.communityFetch.mockImplementationOnce(async (_path: string, init: RequestInit) => {
      const sent = JSON.parse(String(init.body)) as { responseId: string };
      runtime.currentSession = { user: { id: 3 } };
      return new Response(JSON.stringify({
        contract: 'basta-civic-custody-grants/v1',
        status: 'accepted',
        grant: responded,
        recordedResponse: recordedResponse(sent.responseId, 'assessing', null),
      }), { status: 200 });
    });
    await expect(respondToCustodyGrant(original, 2, 'assessing', undefined, database))
      .rejects.toThrow('La cuenta activa cambió');
    expect(rows).toHaveLength(1);
    expect(rows[0].responseId).not.toBe(grantId);
    expect(rows[0].responseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

});
