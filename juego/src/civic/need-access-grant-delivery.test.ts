import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CivicNeedAccessGrantRow } from '@/db/schema';

import {
  assertNoPendingNeedGrantRemoteRevocationsBeforeLocalErase,
  beginNeedGrantSafeLocalErase,
  buildCustodyGrantDeliveryRequest,
  countPendingNeedGrantRemoteRevocations,
  countPersistedWebNeedGrantRemoteRevocations,
  deliverCustodiedNeedAccess,
  needGrantHasRemoteRevocationDebt,
  parseCustodyGrantDeliveryResponse,
  parseCustodyGrantRevocationResponse,
  revokeCustodiedNeedAccessEverywhere,
  withNeedGrantSafeLocalEraseLock,
} from './need-access-grant-delivery';

const runtime = vi.hoisted(() => ({
  row: null as unknown,
  now: '2026-07-14T12:00:00.000Z',
  getCommunitySession: vi.fn(),
  communityFetch: vi.fn(),
  communityFetchForUser: vi.fn(),
  communityErrorFromResponse: vi.fn(),
  ensureCivicDeviceToken: vi.fn(),
  flushWebDatabaseSnapshot: vi.fn(),
  persistedRows: [] as Record<string, unknown>[],
}));

vi.mock('@/db/client', () => {
  const select = () => ({
      from: () => ({
        all: () => runtime.row ? [runtime.row] : [],
        where: () => ({ get: () => runtime.row }),
      }),
    });
  const update = () => ({
      set: (patch: Record<string, unknown>) => ({
        where: () => ({
          run: () => {
            runtime.row = { ...(runtime.row as Record<string, unknown>), ...patch };
            return { changes: 1 };
          },
        }),
      }),
    });
  const executor = { select, update };
  return {
    db: {
      ...executor,
      transaction: (work: (tx: typeof executor) => unknown) => work(executor),
    },
    flushWebDatabaseSnapshot: runtime.flushWebDatabaseSnapshot,
    readPersistedWebTableRowsForSafety: vi.fn(async () => runtime.persistedRows),
  };
});
vi.mock('@/db/repos', () => ({ ahoraISO: () => runtime.now }));
vi.mock('./community-auth', () => ({
  CommunityApiError: class CommunityApiError extends Error {
    constructor(public readonly code: string, message = code, public readonly status = 0) { super(message); }
  },
  communityErrorFromResponse: runtime.communityErrorFromResponse,
  communityFetch: runtime.communityFetch,
  communityFetchForUser: runtime.communityFetchForUser,
  getCommunitySession: runtime.getCommunitySession,
}));
vi.mock('./config', () => ({ CIVIC_API_URL: 'https://civic.example' }));
vi.mock('./device-auth', () => ({ ensureCivicDeviceToken: runtime.ensureCivicDeviceToken }));

const grantId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';
const needId = 'bbde2aa0-3d0e-4fcf-8d53-c32ee30cd8d1';
const responseVersion = 'c'.repeat(64);

const grant = (overrides: Partial<CivicNeedAccessGrantRow> = {}): CivicNeedAccessGrantRow => ({
  id: grantId,
  needId,
  recipientKind: 'circle',
  recipientKey: 'circle:42',
  recipientLabel: 'Círculo Sur — no viaja',
  scope: 'essentials_and_safe_area',
  purpose: 'coordinate_support',
  authorizedFieldsJson: '["category","urgency","expiresAt","quantity","unitCode","safeArea.lat","safeArea.lng","safeArea.precision"]',
  projectionJson: JSON.stringify({
    schema: 'basta.need-grant.v1',
    policyVersion: 1,
    grantId,
    recipient: { kind: 'circle', key: 'circle:42' },
    purpose: 'coordinate_support',
    scope: 'essentials_and_safe_area',
    need: {
      category: 'food',
      quantity: 18,
      unitCode: 'meals',
      urgency: 4,
      expiresAt: '2026-08-01T00:00:00.000Z',
      safeArea: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
    },
  }),
  policyVersion: 1,
  status: 'active',
  expiresAt: '2026-07-20T00:00:00.000Z',
  grantedAt: '2026-07-14T12:00:00.000Z',
  revokedAt: null,
  revocationReason: null,
  deliveryStatus: 'local',
  remoteRecipientCircleId: null,
  remoteGrantorUserId: null,
  deliveredAt: null,
  remoteRevokedAt: null,
  deliveryLastAttemptAt: null,
  deliveryLastError: null,
  remoteResponseDisposition: null,
  remoteResponseQuantity: null,
  remoteResponseUnit: null,
  remoteResponseAt: null,
  remoteCoordinationProposalId: null,
  remoteCoordinationState: null,
  remoteCoordinationTerminalDecision: null,
  remoteCoordinationQuantity: null,
  remoteCoordinationUnit: null,
  remoteCoordinationCreatedAt: null,
  remoteCoordinationExpiresAt: null,
  remoteCoordinationDecidedAt: null,
  remoteCoordinationRefreshedAt: null,
  remoteExecutionJson: null,
  remoteExecutionObservedAt: null,
  createdAt: '2026-07-14T12:00:00.000Z',
  updatedAt: '2026-07-14T12:00:00.000Z',
  ...overrides,
});

describe('entrega autenticada de permisos bajo custodia', () => {
  beforeEach(() => {
    runtime.row = grant();
    runtime.now = '2026-07-14T12:00:00.000Z';
    runtime.persistedRows = [];
    runtime.getCommunitySession.mockReset();
    runtime.communityFetch.mockReset();
    runtime.communityFetchForUser.mockReset();
    runtime.communityErrorFromResponse.mockReset();
    runtime.ensureCivicDeviceToken.mockReset();
    runtime.flushWebDatabaseSnapshot.mockReset();
    runtime.getCommunitySession.mockResolvedValue({
      user: { id: 7, username: 'cuenta', email: 'safe@example.test', name: 'Cuenta segura' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    runtime.ensureCivicDeviceToken.mockResolvedValue('device-proof');
    runtime.flushWebDatabaseSnapshot.mockResolvedValue(undefined);
    runtime.communityFetchForUser.mockImplementation(
      async (_expectedUserId: number, path: string, init: RequestInit) =>
        runtime.communityFetch(path, init),
    );
  });

  it('arma sólo la lista permitida y traduce zona/unidad al contrato remoto', () => {
    const request = buildCustodyGrantDeliveryRequest(grant());

    expect(request).toEqual({
      grantId,
      needId,
      recipient: { type: 'circle', id: 42 },
      expiresAt: '2026-07-20T00:00:00.000Z',
      need: {
        category: 'food',
        urgency: 4,
        quantity: 18,
        unit: 'meals',
        location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
      },
    });
    const serialized = JSON.stringify(request);
    expect(serialized).not.toContain('Círculo Sur');
    expect(serialized).not.toContain('recipientLabel');
    expect(serialized).not.toContain('relato');
    expect(serialized).not.toContain('contact');
    expect(serialized).not.toContain('custod');
  });

  it('rechaza organizaciones, referencias manuales y proyecciones ampliadas', () => {
    expect(() => buildCustodyGrantDeliveryRequest(grant({
      recipientKind: 'organization',
      recipientKey: 'organization:org-sur',
    }))).toThrow('NEED_GRANT_VERIFIED_CIRCLE_REQUIRED');
    expect(() => buildCustodyGrantDeliveryRequest(grant({
      recipientKey: 'circle:circulo-sur',
    }))).toThrow('NEED_GRANT_VERIFIED_CIRCLE_REQUIRED');

    const unsafe = JSON.parse(grant().projectionJson) as { need: Record<string, unknown> };
    unsafe.need.contact = '2615555555';
    expect(() => buildCustodyGrantDeliveryRequest(grant({
      projectionJson: JSON.stringify(unsafe),
    }))).toThrow('NEED_GRANT_PROJECTION_INVALID');
  });

  it('rechaza coordenadas demasiado precisas o una identidad local inconsistente', () => {
    const exact = JSON.parse(grant().projectionJson) as {
      need: { safeArea: { precision: string } };
    };
    exact.need.safeArea.precision = 'exact';
    expect(() => buildCustodyGrantDeliveryRequest(grant({
      projectionJson: JSON.stringify(exact),
    }))).toThrow('NEED_GRANT_PROJECTION_INVALID');

    const mismatched = JSON.parse(grant().projectionJson) as { grantId: string };
    mismatched.grantId = 'd77c644e-fb1f-45b5-ab55-4699cfa013e4';
    expect(() => buildCustodyGrantDeliveryRequest(grant({
      projectionJson: JSON.stringify(mismatched),
    }))).toThrow('NEED_GRANT_PROJECTION_INVALID');
  });

  it('sólo reconoce un acuse activo del grant y círculo esperados', () => {
    const request = buildCustodyGrantDeliveryRequest(grant());
    const expected = {
      grantId,
      circleId: 42,
      expiresAt: request.expiresAt,
      need: request.need,
    };
    const receipt = {
      contract: 'basta-civic-custody-grants/v1',
      status: 'accepted',
      grant: {
        grantId,
        recipient: { type: 'circle', id: 42 },
        payload: {
          category: 'food',
          quantity: 18,
          unit: 'meals',
          urgency: 4,
          location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
        },
        expiresAt: '2026-07-20T00:00:00.000Z',
        createdAt: '2026-07-14T12:02:00.000Z',
        state: 'active',
        response: null,
      },
    };
    expect(parseCustodyGrantDeliveryResponse(receipt, expected)).toEqual({
      status: 'accepted',
      createdAt: '2026-07-14T12:02:00.000Z',
      state: 'active',
      response: null,
    });
    expect(() => parseCustodyGrantDeliveryResponse({
      ...receipt,
      grant: { ...receipt.grant, state: 'revoked' },
    }, expected)).toThrow('CUSTODY_DELIVERY_RECEIPT_INVALID');
    expect(parseCustodyGrantDeliveryResponse({
      ...receipt,
      status: 'duplicate',
      grant: { ...receipt.grant, state: 'revoked' },
    }, expected)).toMatchObject({ status: 'duplicate', state: 'revoked' });
    expect(() => parseCustodyGrantDeliveryResponse(receipt, { ...expected, circleId: 7 }))
      .toThrow('CUSTODY_DELIVERY_RECEIPT_INVALID');

    expect(parseCustodyGrantDeliveryResponse({
      ...receipt,
      status: 'duplicate',
      grant: {
        ...receipt.grant,
        response: {
          disposition: 'support_available',
          quantity: null,
          unit: null,
          responseVersion,
          recordedAt: '2026-07-14T12:03:00.000Z',
        },
      },
    }, expected).response).toMatchObject({ disposition: 'support_available', quantity: null, unit: null });

    for (const response of [
      { disposition: 'assessing', quantity: 1, unit: 'meals', responseVersion, recordedAt: '2026-07-14T12:03:00.000Z' },
      { disposition: 'support_available', quantity: 19, unit: 'meals', responseVersion, recordedAt: '2026-07-14T12:03:00.000Z' },
      { disposition: 'support_available', quantity: 8, unit: 'hours', responseVersion, recordedAt: '2026-07-14T12:03:00.000Z' },
      { disposition: 'support_available', quantity: 8, unit: 'meals', responseVersion, recordedAt: '2026-07-14T11:59:00.000Z' },
      { disposition: 'support_available', quantity: 8, unit: 'meals', responseVersion: 'invalid', recordedAt: '2026-07-14T12:03:00.000Z' },
      { disposition: 'support_available', quantity: 8, unit: 'meals', recordedAt: '2026-07-14T12:03:00.000Z' },
      { disposition: 'support_available', quantity: 8, unit: 'meals', responseVersion, recordedAt: '2026-07-14T12:03:00.000Z', note: 'texto libre' },
    ]) {
      expect(() => parseCustodyGrantDeliveryResponse({
        ...receipt,
        status: 'duplicate',
        grant: { ...receipt.grant, response },
      }, expected)).toThrow('CUSTODY_DELIVERY_RECEIPT_INVALID');
    }
  });

  it('valida la identidad y fecha del acuse de revocación', () => {
    expect(parseCustodyGrantRevocationResponse({
      status: 'already_revoked',
      grantId,
      revokedAt: '2026-07-15T10:00:00.000Z',
    }, grantId)).toEqual({
      status: 'already_revoked',
      revokedAt: '2026-07-15T10:00:00.000Z',
    });
    expect(() => parseCustodyGrantRevocationResponse({
      status: 'revoked',
      grantId: needId,
      revokedAt: '2026-07-15T10:00:00.000Z',
    }, grantId)).toThrow('CUSTODY_REVOCATION_RECEIPT_INVALID');
    expect(() => parseCustodyGrantRevocationResponse({
      status: 'revoked',
      grantId,
      revokedAt: '2026-07-15T10:00:00.000Z',
      needId,
    }, grantId)).toThrow('CUSTODY_REVOCATION_RECEIPT_INVALID');
  });

  it('marca entregado sólo después de un acuse autenticado válido', async () => {
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify({
      contract: 'basta-civic-custody-grants/v1',
      status: 'accepted',
      grant: {
        grantId,
        recipient: { type: 'circle', id: 42 },
        payload: {
          category: 'food',
          quantity: 18,
          unit: 'meals',
          urgency: 4,
          location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
        },
        expiresAt: '2026-07-20T00:00:00.000Z',
        createdAt: '2026-07-14T12:03:00.000Z',
        state: 'active',
        response: null,
      },
    }), { status: 201, headers: { 'content-type': 'application/json' } }));

    const delivered = await deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 });

    expect(delivered).toMatchObject({
      deliveryStatus: 'delivered',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveredAt: '2026-07-14T12:03:00.000Z',
    });
    expect(runtime.communityFetchForUser).toHaveBeenCalledWith(
      7,
      '/api/v1/civic/custody/grants',
      expect.any(Object),
    );
    expect(runtime.communityFetch).toHaveBeenCalledOnce();
    expect(runtime.flushWebDatabaseSnapshot).toHaveBeenCalledOnce();
    expect(runtime.flushWebDatabaseSnapshot.mock.invocationCallOrder[0])
      .toBeLessThan(runtime.communityFetchForUser.mock.invocationCallOrder[0]);
    const [path, init] = runtime.communityFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/grants');
    expect(init.headers).toMatchObject({
      'idempotency-key': `custody:${grantId}:deliver:v1`,
      'x-civic-device-token': 'device-proof',
    });
    expect(init.body).toBe(JSON.stringify(buildCustodyGrantDeliveryRequest(grant())));
    expect(String(init.body)).not.toContain('Círculo Sur');
  });

  it('no toca la red si no puede hacer durable la deuda de entrega web', async () => {
    runtime.flushWebDatabaseSnapshot.mockRejectedValueOnce(new Error('snapshot stale'));

    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 })).rejects.toThrow('snapshot stale');

    expect(runtime.flushWebDatabaseSnapshot).toHaveBeenCalledOnce();
    expect(runtime.communityFetchForUser).not.toHaveBeenCalled();
    expect(runtime.communityFetch).not.toHaveBeenCalled();
    expect(runtime.row).toMatchObject({
      deliveryStatus: 'failed',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveryLastError: 'CUSTODY_NETWORK_OR_RESPONSE_FAILED',
    });
    expect(countPendingNeedGrantRemoteRevocations()).toBe(1);
  });

  it('no liga un permiso nuevo a una cuenta distinta de la vista confirmada', async () => {
    runtime.getCommunitySession.mockResolvedValueOnce({
      user: { id: 8, username: 'otra', email: 'other@example.test', name: 'Otra cuenta' },
      accessToken: 'other-access',
      refreshToken: 'other-refresh',
    });

    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 }))
      .rejects.toThrow('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');

    expect(runtime.row).toMatchObject({
      deliveryStatus: 'local',
      remoteGrantorUserId: null,
      remoteRecipientCircleId: null,
    });
    expect(runtime.ensureCivicDeviceToken).not.toHaveBeenCalled();
    expect(runtime.flushWebDatabaseSnapshot).not.toHaveBeenCalled();
    expect(runtime.communityFetch).not.toHaveBeenCalled();
  });

  it('reconcilia un cierre remoto sin inventar quién lo ejecutó', async () => {
    runtime.row = grant({
      deliveryStatus: 'delivered',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveredAt: '2026-07-14T11:30:00.000Z',
      deliveryLastAttemptAt: '2026-07-14T11:30:00.000Z',
      remoteCoordinationProposalId: '4f06cae9-ba94-4b94-a717-8503c6cd7a2f',
      remoteCoordinationState: 'proposed',
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: '2026-07-14T11:55:00.000Z',
      remoteCoordinationExpiresAt: '2026-07-20T00:00:00.000Z',
      remoteCoordinationRefreshedAt: '2026-07-14T11:55:00.000Z',
    });
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify({
      contract: 'basta-civic-custody-grants/v1',
      status: 'duplicate',
      grant: {
        grantId,
        recipient: { type: 'circle', id: 42 },
        payload: {
          category: 'food',
          quantity: 18,
          unit: 'meals',
          urgency: 4,
          location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
        },
        expiresAt: '2026-07-20T00:00:00.000Z',
        createdAt: '2026-07-14T11:30:00.000Z',
        state: 'revoked',
        response: {
          disposition: 'support_available',
          quantity: 12,
          unit: 'meals',
          responseVersion,
          recordedAt: '2026-07-14T11:50:00.000Z',
        },
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));

    const reconciled = await deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 });

    expect(reconciled).toMatchObject({
      status: 'revoked',
      revocationReason: 'remote_closed',
      deliveryStatus: 'revoked_remote',
      deliveredAt: '2026-07-14T11:30:00.000Z',
      remoteRevokedAt: '2026-07-14T12:00:00.000Z',
      remoteResponseDisposition: 'support_available',
      remoteResponseQuantity: 12,
      remoteResponseUnit: 'meals',
      remoteResponseAt: '2026-07-14T11:50:00.000Z',
      remoteCoordinationState: 'closed',
      remoteCoordinationRefreshedAt: '2026-07-14T12:00:00.000Z',
    });
  });

  it('conserva una respuesta perdida como no confirmada y bloquea otro grantor', async () => {
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify({
      contract: 'contrato-inesperado',
      status: 'accepted',
      grant: {},
    }), { status: 201, headers: { 'content-type': 'application/json' } }));

    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 }))
      .rejects.toThrow('CUSTODY_DELIVERY_RECEIPT_INVALID');
    expect(runtime.row).toMatchObject({
      deliveryStatus: 'failed',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveryLastError: 'CUSTODY_DELIVERY_RECEIPT_INVALID',
    });

    runtime.row = grant({
      deliveryStatus: 'failed',
      remoteGrantorUserId: 8,
      remoteRecipientCircleId: 42,
      deliveryLastAttemptAt: '2026-07-14T11:00:00.000Z',
    });
    runtime.communityFetch.mockClear();
    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 }))
      .rejects.toThrow('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
    expect(runtime.communityFetch).not.toHaveBeenCalled();

    runtime.row = grant({
      deliveryStatus: 'delivered',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveredAt: '2026-07-14T11:30:00.000Z',
    });
    runtime.communityFetch.mockRejectedValue(new Error('network lost'));
    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 })).rejects.toThrow('network lost');
    expect(runtime.row).toMatchObject({
      status: 'active',
      deliveryStatus: 'delivered',
      deliveredAt: '2026-07-14T11:30:00.000Z',
      deliveryLastError: 'CUSTODY_NETWORK_OR_RESPONSE_FAILED',
    });
  });

  it('no afirma una revocación cuando la red no responde', async () => {
    runtime.row = grant({
      deliveryStatus: 'failed',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveryLastAttemptAt: '2026-07-14T11:00:00.000Z',
    });
    runtime.communityFetch.mockRejectedValue(new Error('network lost'));

    await expect(revokeCustodiedNeedAccessEverywhere({
      grantId,
      reason: 'safety_concern',
    })).rejects.toThrow('network lost');
    expect(runtime.flushWebDatabaseSnapshot).toHaveBeenCalledOnce();
    expect(runtime.flushWebDatabaseSnapshot.mock.invocationCallOrder[0])
      .toBeLessThan(runtime.communityFetchForUser.mock.invocationCallOrder[0]);
    expect(runtime.row).toMatchObject({
      status: 'active',
      deliveryStatus: 'revocation_pending',
      deliveryLastError: 'CUSTODY_NETWORK_OR_RESPONSE_FAILED',
      revokedAt: null,
    });
    expect(countPendingNeedGrantRemoteRevocations()).toBe(1);
    expect(countPendingNeedGrantRemoteRevocations(7)).toBe(1);
    expect(countPendingNeedGrantRemoteRevocations(8)).toBe(0);

    runtime.row = grant({
      status: 'revoked',
      deliveryStatus: 'revoked_remote',
      revokedAt: '2026-07-14T12:00:00.000Z',
      remoteRevokedAt: '2026-07-14T12:00:00.000Z',
    });
    expect(countPendingNeedGrantRemoteRevocations()).toBe(0);
  });

  it('liga entrega y revocación a la cuenta comprobada aunque cambie la sesión', async () => {
    runtime.communityFetchForUser.mockRejectedValueOnce(new Error('session changed'));

    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 })).rejects.toThrow('session changed');
    expect(runtime.communityFetchForUser).toHaveBeenCalledWith(
      7,
      '/api/v1/civic/custody/grants',
      expect.any(Object),
    );
    expect(runtime.communityFetch).not.toHaveBeenCalled();
    expect(runtime.row).toMatchObject({
      remoteGrantorUserId: 7,
      deliveryStatus: 'failed',
      remoteRevokedAt: null,
    });

    runtime.row = grant({
      deliveryStatus: 'delivered',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveredAt: '2026-07-14T11:30:00.000Z',
    });
    runtime.communityFetchForUser.mockReset();
    runtime.communityFetchForUser.mockRejectedValueOnce(new Error('session changed'));

    await expect(revokeCustodiedNeedAccessEverywhere({
      grantId,
      reason: 'safety_concern',
    })).rejects.toThrow('session changed');
    expect(runtime.communityFetchForUser).toHaveBeenCalledWith(
      7,
      '/api/v1/civic/custody/grants/revoke',
      expect.any(Object),
    );
    expect(runtime.communityFetch).not.toHaveBeenCalled();
    expect(runtime.row).toMatchObject({
      status: 'active',
      deliveryStatus: 'revocation_pending',
      remoteRevokedAt: null,
    });
  });

  it('bloquea el borrado con reloj adelantado y con cualquier estado local no confirmado', () => {
    runtime.now = '2026-08-01T00:00:00.000Z';
    for (const candidate of [
      grant({
        status: 'active',
        deliveryStatus: 'delivered',
        remoteGrantorUserId: 7,
      }),
      grant({
        status: 'expired',
        deliveryStatus: 'failed',
        remoteGrantorUserId: 7,
      }),
      grant({
        status: 'revoked',
        revokedAt: '2026-07-14T11:00:00.000Z',
        revocationReason: 'custodian_decision',
        deliveryStatus: 'revocation_pending',
        remoteGrantorUserId: 7,
      }),
      grant({
        status: 'revoked',
        revokedAt: '2026-07-14T11:00:00.000Z',
        revocationReason: 'custodian_decision',
        deliveryStatus: 'delivering',
        remoteGrantorUserId: 7,
      }),
    ]) {
      runtime.row = candidate;
      expect(needGrantHasRemoteRevocationDebt(candidate)).toBe(true);
      expect(countPendingNeedGrantRemoteRevocations()).toBe(1);
      expect(() => assertNoPendingNeedGrantRemoteRevocationsBeforeLocalErase())
        .toThrow('NEED_GRANT_REMOTE_REVOCATION_REQUIRED_BEFORE_LOCAL_ERASE');
    }

    runtime.row = grant({
      status: 'revoked',
      revokedAt: '2026-07-14T11:00:00.000Z',
      revocationReason: 'custodian_decision',
      deliveryStatus: 'revoked_remote',
      remoteRevokedAt: '2026-07-14T11:00:00.000Z',
    });
    expect(countPendingNeedGrantRemoteRevocations()).toBe(0);
    expect(() => assertNoPendingNeedGrantRemoteRevocationsBeforeLocalErase()).not.toThrow();
  });

  it('cuenta la deuda durable compartida y expone un lock exclusivo para borrar', async () => {
    runtime.persistedRows = [
      { delivery_status: 'delivered' },
      { delivery_status: 'revocation_pending' },
      { delivery_status: 'revoked_remote' },
      { delivery_status: 'local' },
    ];

    await expect(countPersistedWebNeedGrantRemoteRevocations()).resolves.toBe(2);
    await expect(withNeedGrantSafeLocalEraseLock(async () => 'locked')).resolves.toBe('locked');
  });

  it('coordina entrega y borrado entre pestañas con lock compartido/exclusivo', async () => {
    const request = vi.fn(async (
      _name: string,
      _options: LockOptions,
      work: () => Promise<unknown>,
    ) => work());
    vi.stubGlobal('navigator', { locks: { request } });

    try {
      runtime.getCommunitySession.mockResolvedValueOnce({
        user: { id: 8, username: 'otra', email: 'other@example.test', name: 'Otra cuenta' },
        accessToken: 'other-access',
        refreshToken: 'other-refresh',
      });
      await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 }))
        .rejects.toThrow('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
      await expect(withNeedGrantSafeLocalEraseLock(async () => 'locked')).resolves.toBe('locked');

      expect(request).toHaveBeenNthCalledWith(
        1,
        'basta-need-grant-remote-operation-v1',
        { mode: 'shared' },
        expect.any(Function),
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        'basta-need-grant-remote-operation-v1',
        { mode: 'exclusive' },
        expect.any(Function),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('libera la deuda sólo por evidencia autoritativa de que la red ya lo venció', async () => {
    runtime.now = '2026-08-01T00:00:00.000Z';
    runtime.row = grant({
      status: 'expired',
      deliveryStatus: 'delivered',
      remoteGrantorUserId: 7,
      remoteRecipientCircleId: 42,
      deliveredAt: '2026-07-14T12:03:00.000Z',
    });
    runtime.communityFetch.mockResolvedValue(new Response(JSON.stringify({
      error: 'CUSTODY_GRANT_EXPIRED',
    }), { status: 409, headers: { 'content-type': 'application/json' } }));
    runtime.communityErrorFromResponse.mockResolvedValue(Object.assign(
      new Error('CUSTODY_GRANT_EXPIRED'),
      { code: 'CUSTODY_GRANT_EXPIRED' },
    ));

    expect(countPendingNeedGrantRemoteRevocations()).toBe(1);
    const closed = await revokeCustodiedNeedAccessEverywhere({
      grantId,
      reason: 'custodian_decision',
    });

    expect(closed).toMatchObject({
      status: 'expired',
      deliveryStatus: 'revoked_remote',
      remoteRevokedAt: '2026-07-20T00:00:00.000Z',
    });
    expect(countPendingNeedGrantRemoteRevocations()).toBe(0);
  });

  it('cierra la carrera entre iniciar el borrado y una nueva entrega', async () => {
    runtime.row = grant({ deliveryStatus: 'local' });
    const release = beginNeedGrantSafeLocalErase();
    try {
      await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 }))
        .rejects.toThrow('NEED_GRANT_DELIVERY_BLOCKED_BY_LOCAL_ERASE');
      expect(runtime.communityFetch).not.toHaveBeenCalled();
      expect(runtime.ensureCivicDeviceToken).not.toHaveBeenCalled();
    } finally {
      release();
    }

    runtime.communityFetch.mockResolvedValue(new Response('{}', { status: 500 }));
    await expect(deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 })).rejects.not
      .toThrow('NEED_GRANT_DELIVERY_BLOCKED_BY_LOCAL_ERASE');
  });

  it('detiene una entrega que estaba esperando credenciales cuando comienza el borrado', async () => {
    runtime.row = grant({ deliveryStatus: 'local' });
    let resolveToken!: (token: string) => void;
    let signalTokenRequest!: () => void;
    const tokenRequested = new Promise<void>((resolve) => { signalTokenRequest = resolve; });
    runtime.ensureCivicDeviceToken.mockImplementationOnce(() => {
      signalTokenRequest();
      return new Promise<string>((resolve) => { resolveToken = resolve; });
    });

    const delivery = deliverCustodiedNeedAccess({ grantId, expectedUserId: 7 });
    await tokenRequested;
    const release = beginNeedGrantSafeLocalErase();
    resolveToken('device-proof');
    try {
      await expect(delivery).rejects
        .toThrow('NEED_GRANT_DELIVERY_BLOCKED_BY_LOCAL_ERASE');
      expect(runtime.communityFetch).not.toHaveBeenCalled();
      expect(runtime.row).toMatchObject({ deliveryStatus: 'local' });
    } finally {
      release();
    }
  });
});
