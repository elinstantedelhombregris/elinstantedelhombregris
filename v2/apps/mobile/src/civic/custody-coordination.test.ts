import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CivicNeedAccessGrantRow } from '@/db/schema';

import type { CustodyInboxGrant } from './community-api';
import {
  assertProposalMatchesCustodyGrant,
  CUSTODY_COORDINATION_CONTRACT,
  CustodyCoordinationError,
  custodyCoordinationErrorMessage,
  custodyCoordinationDecisionId,
  custodyCoordinationProposalId,
  decideCustodyCoordination as decideCustodyCoordinationForUser,
  loadCustodyCoordinationCoordinatorInbox as loadCustodyCoordinationCoordinatorInboxForUser,
  parseCustodyCoordinationCoordinatorInbox,
  parseCustodyCoordinationGrantorStatus,
  parseCustodyCoordinationMutationReceipt,
  proposeCustodyCoordination as proposeCustodyCoordinationForUser,
  reconcileCustodyCoordinationCoordinatorInbox,
  refreshCustodyCoordinationStatus as refreshCustodyCoordinationStatusForUser,
} from './custody-coordination';
import type {
  CustodyCoordinationCoordinatorInbox,
  CustodyCoordinationProposal,
} from './custody-coordination';

const runtime = vi.hoisted(() => ({
  row: null as unknown,
  patches: [] as Record<string, unknown>[],
  communityFetch: vi.fn(),
  communityErrorFromResponse: vi.fn(),
  ensureCivicDeviceToken: vi.fn(),
  currentSession: { user: { id: 2 } } as { user: { id: number } } | null,
}));

vi.mock('@/db/client', () => {
  const executor = {
    select: () => ({
      from: () => ({
        where: () => ({ get: () => runtime.row }),
      }),
    }),
    update: () => ({
      set: (patch: Record<string, unknown>) => ({
        where: () => ({
          run: () => {
            runtime.patches.push(patch);
            runtime.row = {
              ...(runtime.row as Record<string, unknown>),
              ...patch,
            };
            return { changes: 1 };
          },
        }),
      }),
    }),
  };
  return {
    db: {
      ...executor,
      transaction: (work: (tx: typeof executor) => unknown) => work(executor),
    },
  };
});
vi.mock('@/db/repos', () => ({ ahoraISO: () => '2026-07-14T12:10:00.000Z' }));
vi.mock('./community-auth', () => ({
  communityErrorFromResponse: runtime.communityErrorFromResponse,
  communityFetch: runtime.communityFetch,
  communityFetchForUser: vi.fn(async (_userId: number, path: string, init?: RequestInit) => (
    init ? runtime.communityFetch(path, init) : runtime.communityFetch(path)
  )),
  getCommunitySession: vi.fn(async () => runtime.currentSession),
}));
vi.mock('./config', () => ({ CIVIC_API_URL: 'https://civic.example' }));
vi.mock('./device-auth', () => ({ ensureCivicDeviceToken: runtime.ensureCivicDeviceToken }));

const grantId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';
const otherGrantId = 'd77c644e-fb1f-45b5-ab55-4699cfa013e4';
const expectedProposalId = '4f06cabe-bdd6-4a89-b408-9a1fc6cd362f';
const expectedDecisionId = '2c69a5cc-d9fb-4eec-9761-e976a9a31b1e';
const responseVersion = 'b'.repeat(64);
const responseAt = '2026-07-14T12:01:00.000Z';
const createdAt = '2026-07-14T12:02:00.000Z';
const refreshedAt = '2026-07-14T12:10:00.000Z';
const expiresAt = '2026-07-20T00:00:00.000Z';
const nowMs = Date.parse(refreshedAt);

const loadCustodyCoordinationCoordinatorInbox = (grants: readonly CustodyInboxGrant[]) =>
  loadCustodyCoordinationCoordinatorInboxForUser(grants, 2);
const proposeCustodyCoordination = (grant: CustodyInboxGrant) =>
  proposeCustodyCoordinationForUser(grant, 2);
const refreshCustodyCoordinationStatus = (id: string) =>
  refreshCustodyCoordinationStatusForUser(id, 2);
const decideCustodyCoordination = (proposalId: string, decision: 'accept' | 'decline') =>
  decideCustodyCoordinationForUser(proposalId, decision, 2);

const proposal = (
  overrides: Partial<CustodyCoordinationProposal> = {},
): CustodyCoordinationProposal => ({
  proposalId: expectedProposalId,
  grantId,
  state: 'proposed',
  terminalDecision: null,
  capacity: { quantity: 12, unit: 'meals' },
  createdAt,
  expiresAt,
  decidedAt: null,
  ...overrides,
});

const inbox = (
  proposals: CustodyCoordinationProposal[] = [proposal()],
  overrides: Partial<CustodyCoordinationCoordinatorInbox> = {},
): CustodyCoordinationCoordinatorInbox => ({
  contract: CUSTODY_COORDINATION_CONTRACT,
  scope: 'private-circle-coordinator-coordination',
  proposals,
  refreshedAt,
  truncated: false,
  nextCursor: overrides.truncated ? 'eyJwYWdlIjoyfQ' : null,
  ...overrides,
});

const custodyGrant = (overrides: Partial<CustodyInboxGrant> = {}): CustodyInboxGrant => ({
  grantId,
  recipient: { type: 'circle', id: 42 },
  payload: {
    category: 'food',
    quantity: 18,
    unit: 'meals',
    urgency: 4,
    location: { lat: -32.9, lng: -68.85, precision: 'neighborhood' },
  },
  expiresAt,
  createdAt: '2026-07-14T11:30:00.000Z',
  state: 'active',
  response: {
    disposition: 'support_available',
    quantity: 12,
    unit: 'meals',
    responseVersion,
    recordedAt: responseAt,
  },
  ...overrides,
});

const localGrant = (
  overrides: Partial<CivicNeedAccessGrantRow> = {},
): CivicNeedAccessGrantRow => ({
  id: grantId,
  needId: 'bbde2aa0-3d0e-4fcf-8d53-c32ee30cd8d1',
  recipientKind: 'circle',
  recipientKey: 'circle:42',
  recipientLabel: 'Círculo Sur — no viaja',
  scope: 'essentials_and_safe_area',
  purpose: 'coordinate_support',
  authorizedFieldsJson: '[]',
  projectionJson: '{}',
  policyVersion: 1,
  status: 'active',
  expiresAt,
  grantedAt: '2026-07-14T11:20:00.000Z',
  revokedAt: null,
  revocationReason: null,
  deliveryStatus: 'delivered',
  remoteRecipientCircleId: 42,
  remoteGrantorUserId: 7,
  deliveredAt: '2026-07-14T11:30:00.000Z',
  remoteRevokedAt: null,
  deliveryLastAttemptAt: '2026-07-14T11:30:00.000Z',
  deliveryLastError: null,
  remoteResponseDisposition: 'support_available',
  remoteResponseQuantity: 12,
  remoteResponseUnit: 'meals',
  remoteResponseAt: responseAt,
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
  createdAt: '2026-07-14T11:20:00.000Z',
  updatedAt: '2026-07-14T11:30:00.000Z',
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200): Response => new Response(
  JSON.stringify(body),
  { status, headers: { 'content-type': 'application/json' } },
);

const grantorStatus = (
  currentProposal: CustodyCoordinationProposal | null = proposal(),
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  contract: CUSTODY_COORDINATION_CONTRACT,
  scope: 'private-grantor-coordination-status',
  grantId,
  proposal: currentProposal,
  refreshedAt,
  ...overrides,
});

describe('contrato privado de coordinación custodial', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(nowMs);
    runtime.row = localGrant();
    runtime.patches = [];
    runtime.communityFetch.mockReset();
    runtime.currentSession = { user: { id: 2 } };
    runtime.communityErrorFromResponse.mockReset();
    runtime.ensureCivicDeviceToken.mockReset();
    runtime.ensureCivicDeviceToken.mockResolvedValue('device-proof');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deriva IDs v4 estables por dominio y rechaza una fuente inválida', () => {
    expect(custodyCoordinationProposalId(grantId)).toBe(expectedProposalId);
    expect(custodyCoordinationProposalId(grantId)).toBe(expectedProposalId);
    expect(custodyCoordinationDecisionId(expectedProposalId)).toBe(expectedDecisionId);
    expect(expectedDecisionId).not.toBe(expectedProposalId);
    expect(expectedProposalId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(expectedDecisionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(() => custodyCoordinationProposalId('no-es-un-uuid')).toThrow('INVALID_CUSTODY_COORDINATION_ID');
  });

  it('traduce fallas técnicas a mensajes humanos sin filtrar códigos', () => {
    for (const code of [
      'INVALID_CUSTODY_COORDINATION_RESPONSE',
      'CUSTODY_COORDINATION_GRANT_MISMATCH',
      'CUSTODY_COORDINATION_DISTINCT_PARTY_REQUIRED',
      'CUSTODY_COORDINATION_ALREADY_DECIDED',
      'AUTH_REQUIRED',
    ]) {
      const message = custodyCoordinationErrorMessage(new CustodyCoordinationError(code));
      expect(message).not.toContain(code);
      expect(message).not.toMatch(/^[A-Z0-9_]+$/);
    }
  });

  it('acepta sólo el envelope y el proposal exactos', () => {
    expect(parseCustodyCoordinationCoordinatorInbox(inbox(), nowMs)).toEqual(inbox());

    const invalidEnvelopes: unknown[] = [
      { ...inbox(), contract: 'basta-civic-custody-coordination/v2' },
      { ...inbox(), scope: 'public-coordination' },
      { ...inbox(), unexpected: true },
      { ...inbox(), proposals: [{ ...proposal(), unexpected: true }] },
      {
        ...inbox(),
        proposals: [{ ...proposal(), capacity: { quantity: 12, unit: 'meals', note: 'dato libre' } }],
      },
      { ...inbox(), proposals: [{ ...proposal(), proposalId: otherGrantId.toUpperCase() }] },
    ];
    for (const invalid of invalidEnvelopes) {
      expect(() => parseCustodyCoordinationCoordinatorInbox(invalid, nowMs))
        .toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    }
  });

  it('rechaza capacidades parciales, fuera de dominio o no finitas', () => {
    const invalidCapacities: unknown[] = [
      { quantity: null, unit: 'meals' },
      { quantity: 12, unit: null },
      { quantity: 0, unit: 'meals' },
      { quantity: -1, unit: 'meals' },
      { quantity: 1_000_000_001, unit: 'meals' },
      { quantity: Number.NaN, unit: 'meals' },
      { quantity: 12, unit: 'personas-libres' },
    ];
    for (const capacity of invalidCapacities) {
      expect(() => parseCustodyCoordinationCoordinatorInbox({
        ...inbox(),
        proposals: [{ ...proposal(), capacity }],
      }, nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    }
    expect(parseCustodyCoordinationCoordinatorInbox({
      ...inbox(),
      proposals: [proposal({ capacity: { quantity: null, unit: null } })],
    }, nowMs).proposals[0]?.capacity).toEqual({ quantity: null, unit: null });
  });

  it('hace fail-closed ante IDs duplicados, truncado incoherente y estados imposibles', () => {
    const sameProposalId = proposal({ grantId: otherGrantId });
    const sameGrantId = proposal({
      proposalId: custodyCoordinationProposalId(otherGrantId),
    });
    for (const invalid of [
      inbox([proposal(), sameProposalId]),
      inbox([proposal(), sameGrantId]),
      inbox([proposal()], { truncated: true }),
      inbox([proposal({ state: 'proposed', decidedAt: '2026-07-14T12:05:00.000Z' })]),
      inbox([proposal({ state: 'accepted', decidedAt: null })]),
      inbox([proposal({ state: 'declined', decidedAt: null })]),
      inbox([proposal({ state: 'accepted', decidedAt: '2026-07-14T12:00:00.000Z' })]),
      inbox([proposal({ state: 'accepted', decidedAt: '2026-07-21T00:00:00.000Z' })]),
      inbox([proposal({
        state: 'accepted',
        terminalDecision: 'decline',
        decidedAt: '2026-07-14T12:05:00.000Z',
      })]),
      inbox([proposal({
        state: 'closed',
        terminalDecision: 'accept',
        decidedAt: null,
      })]),
      { ...inbox(), proposals: [{ ...proposal(), state: 'reserved' }] },
    ]) {
      expect(() => parseCustodyCoordinationCoordinatorInbox(invalid, nowMs))
        .toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    }
  });

  it('usa refreshedAt como reloj de verdad con tolerancia acotada', () => {
    expect(() => parseCustodyCoordinationCoordinatorInbox({
      ...inbox(),
      refreshedAt: '2026-07-14T12:15:00.001Z',
    }, nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({ createdAt: '2026-07-14T12:15:00.001Z' }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({ createdAt: '2026-07-14T12:10:00.001Z' }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({
        state: 'accepted',
        terminalDecision: 'accept',
        decidedAt: '2026-07-14T12:15:00.001Z',
      }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({
        state: 'accepted',
        terminalDecision: 'accept',
        decidedAt: '2026-07-14T12:10:00.001Z',
      }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({ expiresAt: refreshedAt }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({
        state: 'expired',
        createdAt: '2026-07-14T11:00:00.000Z',
        expiresAt: '2026-07-14T12:11:00.000Z',
      }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(() => parseCustodyCoordinationCoordinatorInbox(inbox([
      proposal({ createdAt: '2026-02-30T12:02:00.000Z' }),
    ]), nowMs)).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');

    const expired = proposal({
      state: 'expired',
      createdAt: '2026-07-14T11:00:00.000Z',
      expiresAt: '2026-07-14T12:00:00.000Z',
    });
    expect(parseCustodyCoordinationCoordinatorInbox(inbox([expired]), nowMs).proposals[0])
      .toEqual(expired);
    const closed = proposal({ state: 'closed' });
    expect(parseCustodyCoordinationCoordinatorInbox(inbox([closed]), nowMs).proposals[0])
      .toEqual(closed);
    const closedAfterAcceptance = proposal({
      state: 'closed',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    expect(parseCustodyCoordinationCoordinatorInbox(inbox([closedAfterAcceptance]), nowMs).proposals[0])
      .toEqual(closedAfterAcceptance);
  });

  it('valida status grantor, grant esperado y proposal interno sin aceptar extras', () => {
    expect(parseCustodyCoordinationGrantorStatus(grantorStatus(), grantId, nowMs))
      .toEqual(grantorStatus());
    expect(parseCustodyCoordinationGrantorStatus(grantorStatus(null), grantId, nowMs).proposal)
      .toBeNull();

    for (const invalid of [
      grantorStatus(proposal(), { grantId: otherGrantId }),
      grantorStatus(proposal({ grantId: otherGrantId })),
      grantorStatus(proposal(), { unexpected: true }),
      grantorStatus({ ...proposal(), capacity: { quantity: 12, unit: 'meals', note: 'texto' } } as unknown as CustodyCoordinationProposal),
    ]) {
      expect(() => parseCustodyCoordinationGrantorStatus(invalid, grantId, nowMs))
        .toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    }
    expect(() => parseCustodyCoordinationGrantorStatus(grantorStatus(), 'grant-inválido', nowMs))
      .toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
  });

  it('ata proposal a grant, capacidad, vigencia, respuesta y causalidad temporal', () => {
    expect(() => assertProposalMatchesCustodyGrant(proposal(), custodyGrant())).not.toThrow();

    const mismatches: [CustodyCoordinationProposal, CustodyInboxGrant][] = [
      [proposal({ proposalId: custodyCoordinationProposalId(otherGrantId) }), custodyGrant()],
      [proposal({ grantId: otherGrantId }), custodyGrant()],
      [proposal({ expiresAt: '2026-07-21T00:00:00.000Z' }), custodyGrant()],
      [proposal({ capacity: { quantity: 13, unit: 'meals' } }), custodyGrant()],
      [proposal({ capacity: { quantity: 12, unit: 'hours' } }), custodyGrant()],
      [proposal({ createdAt: '2026-07-14T12:00:59.999Z' }), custodyGrant()],
      [proposal(), custodyGrant({ response: null })],
    ];
    for (const [candidate, source] of mismatches) {
      expect(() => assertProposalMatchesCustodyGrant(candidate, source))
        .toThrow('CUSTODY_COORDINATION_GRANT_MISMATCH');
    }
  });

  it('reconcilia cada proposal conocido y vuelve parcial una desalineación de páginas', () => {
    const parsed = parseCustodyCoordinationCoordinatorInbox(inbox(), nowMs);
    expect(reconcileCustodyCoordinationCoordinatorInbox(parsed, [custodyGrant()])).toBe(parsed);
    expect(reconcileCustodyCoordinationCoordinatorInbox(parsed, [])).toMatchObject({
      proposals: [],
      truncated: true,
    });
    expect(() => reconcileCustodyCoordinationCoordinatorInbox(parsed, [custodyGrant({
      response: {
        disposition: 'support_available',
        quantity: 11,
        unit: 'meals',
        responseVersion,
        recordedAt: responseAt,
      },
    })])).toThrow('CUSTODY_COORDINATION_GRANT_MISMATCH');
  });

  it('conserva la intersección verificable cuando dos páginas de 50 divergen sobre más de 50 grants', () => {
    const grants = Array.from({ length: 60 }, (_, index) => {
      const numberedGrantId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
      return custodyGrant({ grantId: numberedGrantId });
    });
    const proposalPage = grants.slice(10).map((source) => proposal({
      grantId: source.grantId,
      proposalId: custodyCoordinationProposalId(source.grantId),
    }));
    const parsed = parseCustodyCoordinationCoordinatorInbox(
      inbox(proposalPage, { truncated: true }),
      nowMs,
    );

    const reconciled = reconcileCustodyCoordinationCoordinatorInbox(parsed, grants.slice(0, 50));

    expect(reconciled.proposals).toHaveLength(40);
    expect(reconciled.truncated).toBe(true);
    expect(reconciled.proposals.every((item) => (
      grants.slice(0, 50).some((source) => source.grantId === item.grantId)
    ))).toBe(true);
  });

  it('valida receipts según operación y permite replay ya avanzado sólo al proponer', () => {
    const createReceipt = {
      contract: CUSTODY_COORDINATION_CONTRACT,
      status: 'accepted',
      proposal: proposal(),
    };
    expect(parseCustodyCoordinationMutationReceipt(createReceipt, {
      proposalId: expectedProposalId,
      grantId,
      grant: custodyGrant(),
      observedAtMs: nowMs,
    })).toEqual(createReceipt);

    const accepted = proposal({
      state: 'accepted',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    const replay = { ...createReceipt, status: 'duplicate', proposal: accepted };
    expect(parseCustodyCoordinationMutationReceipt(replay, {
      proposalId: expectedProposalId,
      grantId,
      grant: custodyGrant(),
      observedAtMs: nowMs,
    })).toEqual(replay);
    expect(parseCustodyCoordinationMutationReceipt(replay, {
      proposalId: expectedProposalId,
      grantId,
      decision: 'accept',
      grant: custodyGrant(),
      observedAtMs: nowMs,
    }).proposal.state).toBe('accepted');

    const closedReplay = {
      ...createReceipt,
      status: 'duplicate',
      proposal: proposal({
        state: 'closed',
        terminalDecision: 'accept',
        decidedAt: '2026-07-14T12:05:00.000Z',
      }),
    };
    expect(parseCustodyCoordinationMutationReceipt(closedReplay, {
      proposalId: expectedProposalId,
      grantId,
      decision: 'accept',
      grant: custodyGrant(),
      observedAtMs: nowMs,
    }).proposal).toMatchObject({
      state: 'closed',
      terminalDecision: 'accept',
    });

    const expiredAt = '2026-07-14T12:00:00.000Z';
    const expiredReplay = {
      ...createReceipt,
      status: 'duplicate',
      proposal: proposal({
        state: 'expired',
        terminalDecision: 'decline',
        createdAt: '2026-07-14T11:02:00.000Z',
        expiresAt: expiredAt,
        decidedAt: '2026-07-14T11:05:00.000Z',
      }),
    };
    expect(parseCustodyCoordinationMutationReceipt(expiredReplay, {
      proposalId: expectedProposalId,
      grantId,
      decision: 'decline',
      grant: custodyGrant({
        expiresAt: expiredAt,
        response: {
          ...custodyGrant().response!,
          recordedAt: '2026-07-14T11:01:00.000Z',
        },
      }),
      observedAtMs: nowMs,
    }).proposal).toMatchObject({
      state: 'expired',
      terminalDecision: 'decline',
    });

    const declined = proposal({
      state: 'declined',
      terminalDecision: 'decline',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    for (const invalid of [
      { ...createReceipt, proposal: accepted },
      { ...createReceipt, unexpected: true },
      { ...createReceipt, proposal: { ...proposal(), proposalId: custodyCoordinationProposalId(otherGrantId) } },
    ]) {
      expect(() => parseCustodyCoordinationMutationReceipt(invalid, {
        proposalId: expectedProposalId,
        grantId,
        grant: custodyGrant(),
        observedAtMs: nowMs,
      })).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    }
    expect(() => parseCustodyCoordinationMutationReceipt({
      ...createReceipt,
      status: 'duplicate',
      proposal: declined,
    }, {
      proposalId: expectedProposalId,
      grantId,
      decision: 'accept',
      grant: custodyGrant(),
      observedAtMs: nowMs,
    })).toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
  });

  it('consulta la bandeja privada y marca parcial si el backend devuelve un grant fuera de página', async () => {
    runtime.communityFetch.mockResolvedValue(jsonResponse(inbox()));
    await expect(loadCustodyCoordinationCoordinatorInbox([custodyGrant()]))
      .resolves.toEqual(inbox());
    expect(runtime.communityFetch).toHaveBeenCalledWith(
      '/api/v1/civic/custody/coordination/proposals?limit=50',
    );

    runtime.communityFetch.mockResolvedValue(jsonResponse(inbox()));
    await expect(loadCustodyCoordinationCoordinatorInbox([]))
      .resolves.toMatchObject({ proposals: [], truncated: true });
  });

  it('alcanza propuestas 51+ y conserva corte, orden y unicidad entre páginas', async () => {
    const grants = Array.from({ length: 60 }, (_, index) => {
      const numberedGrantId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
      return custodyGrant({ grantId: numberedGrantId });
    });
    const proposals = grants.map((source) => proposal({
      grantId: source.grantId,
      proposalId: custodyCoordinationProposalId(source.grantId),
    }));
    const cursor = 'eyJ2IjoxLCJwYWdlIjoyfQ';
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse(inbox(proposals.slice(0, 50), {
        truncated: true,
        nextCursor: cursor,
      })))
      .mockResolvedValueOnce(jsonResponse(inbox(proposals.slice(50))));

    const loaded = await loadCustodyCoordinationCoordinatorInbox(grants);

    expect(loaded).toMatchObject({ truncated: false, nextCursor: null });
    expect(loaded.proposals.map((item) => item.proposalId))
      .toEqual(proposals.map((item) => item.proposalId));
    expect(runtime.communityFetch).toHaveBeenNthCalledWith(
      2,
      `/api/v1/civic/custody/coordination/proposals?limit=50&cursor=${cursor}`,
    );
  });

  it('falla cerrado si dos páginas repiten propuesta o cambian refreshedAt', async () => {
    const page = Array.from({ length: 50 }, (_, index) => {
      const numberedGrantId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
      return proposal({
        grantId: numberedGrantId,
        proposalId: custodyCoordinationProposalId(numberedGrantId),
      });
    });
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse(inbox(page, { truncated: true })))
      .mockResolvedValueOnce(jsonResponse(inbox([page[49]!])));
    await expect(loadCustodyCoordinationCoordinatorInbox([]))
      .rejects.toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');

    runtime.communityFetch.mockReset();
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse(inbox(page, { truncated: true })))
      .mockResolvedValueOnce(jsonResponse(inbox([], {
        refreshedAt: '2026-07-14T12:10:01.000Z',
      })));
    await expect(loadCustodyCoordinationCoordinatorInbox([]))
      .rejects.toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
  });

  it('descarta la lectura si cambia la cuenta antes de entregar la bandeja', async () => {
    runtime.communityFetch.mockImplementationOnce(async () => {
      runtime.currentSession = { user: { id: 3 } };
      return jsonResponse(inbox());
    });

    await expect(loadCustodyCoordinationCoordinatorInbox([custodyGrant()]))
      .rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
  });

  it('propone con cuerpo mínimo e idempotencia, sin prueba de dispositivo ni cache local', async () => {
    const receipt = {
      contract: CUSTODY_COORDINATION_CONTRACT,
      status: 'accepted',
      proposal: proposal(),
    };
    runtime.communityFetch.mockResolvedValue(jsonResponse(receipt, 201));

    await expect(proposeCustodyCoordination(custodyGrant())).resolves.toEqual(receipt);
    const [path, init] = runtime.communityFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/coordination/proposals');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      'content-type': 'application/json',
      'idempotency-key': `custody:${grantId}:coordination:propose:v1`,
    });
    expect(init.body).toBe(JSON.stringify({
      proposalId: expectedProposalId,
      grantId,
      expectedResponseVersion: responseVersion,
    }));
    expect(runtime.ensureCivicDeviceToken).not.toHaveBeenCalled();
    expect(runtime.patches).toHaveLength(0);

    runtime.communityFetch.mockClear();
    await expect(proposeCustodyCoordination(custodyGrant({ response: null })))
      .rejects.toThrow('CUSTODY_COORDINATION_SUPPORT_REQUIRED');
    expect(runtime.communityFetch).not.toHaveBeenCalled();
  });

  it('refresca con prueba privada y modifica cache sólo tras status válido y reconciliado', async () => {
    const original = localGrant();
    runtime.row = original;
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse(grantorStatus(proposal(), { unexpected: true })))
      .mockResolvedValueOnce(jsonResponse(grantorStatus(proposal({
        capacity: { quantity: 13, unit: 'meals' },
      }))))
      .mockResolvedValueOnce(jsonResponse(grantorStatus()));

    await expect(refreshCustodyCoordinationStatus(grantId))
      .rejects.toThrow('INVALID_CUSTODY_COORDINATION_RESPONSE');
    expect(runtime.row).toEqual(original);
    expect(runtime.patches).toHaveLength(0);

    await expect(refreshCustodyCoordinationStatus(grantId))
      .rejects.toThrow('CUSTODY_COORDINATION_GRANT_MISMATCH');
    expect(runtime.row).toEqual(original);
    expect(runtime.patches).toHaveLength(0);

    const refreshed = await refreshCustodyCoordinationStatus(grantId);
    expect(refreshed).toMatchObject({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    expect(runtime.patches).toHaveLength(1);
    expect(runtime.ensureCivicDeviceToken).toHaveBeenNthCalledWith(1, 'https://civic.example');
    const [path, init] = runtime.communityFetch.mock.calls[2] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/coordination/status');
    expect(init).toEqual({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-civic-device-token': 'device-proof',
      },
      body: JSON.stringify({ grantId }),
    });

    runtime.communityFetch.mockResolvedValue(jsonResponse(grantorStatus(null, {
      refreshedAt: '2026-07-14T12:11:00.000Z',
    })));
    await expect(refreshCustodyCoordinationStatus(grantId))
      .rejects.toThrow('CUSTODY_COORDINATION_STATE_INVALID');
    expect(runtime.row).toMatchObject({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    expect(runtime.patches).toHaveLength(1);
  });

  it('no deja que respuestas fuera de orden regresen estado ni borren una propuesta append-only', async () => {
    runtime.row = localGrant({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    const accepted = proposal({
      state: 'accepted',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse(grantorStatus(accepted, {
        refreshedAt: '2026-07-14T12:12:00.000Z',
      })))
      .mockResolvedValueOnce(jsonResponse(grantorStatus(proposal(), {
        refreshedAt: '2026-07-14T12:11:00.000Z',
      })))
      .mockResolvedValueOnce(jsonResponse(grantorStatus(null, {
        refreshedAt: '2026-07-14T12:11:30.000Z',
      })))
      .mockResolvedValueOnce(jsonResponse(grantorStatus(null, {
        refreshedAt: '2026-07-14T12:13:00.000Z',
      })));

    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationRefreshedAt: '2026-07-14T12:12:00.000Z',
    });
    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationRefreshedAt: '2026-07-14T12:12:00.000Z',
    });
    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationTerminalDecision: 'accept',
    });
    expect(runtime.patches).toHaveLength(1);

    await expect(refreshCustodyCoordinationStatus(grantId))
      .rejects.toThrow('CUSTODY_COORDINATION_STATE_INVALID');
    expect(runtime.row).toMatchObject({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
    });
    expect(runtime.patches).toHaveLength(1);
  });

  it('no consulta ni decide sin evidencia de que el grant remoto fue entregado', async () => {
    runtime.row = localGrant({
      deliveryStatus: 'local',
      deliveredAt: null,
      remoteGrantorUserId: null,
      remoteRecipientCircleId: null,
    });
    await expect(refreshCustodyCoordinationStatus(grantId))
      .rejects.toThrow('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
    expect(runtime.communityFetch).not.toHaveBeenCalled();

    runtime.row = localGrant({
      deliveryStatus: 'failed',
      deliveredAt: null,
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    await expect(decideCustodyCoordination(expectedProposalId, 'accept'))
      .rejects.toThrow('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
    expect(runtime.communityFetch).not.toHaveBeenCalled();
    expect(runtime.ensureCivicDeviceToken).not.toHaveBeenCalled();
  });

  it('refresca historia cerrada o vencida y conserva accept/decline por separado del estado', async () => {
    const closedAccepted = proposal({
      state: 'closed',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    runtime.row = localGrant({
      status: 'revoked',
      revokedAt: '2026-07-14T12:06:00.000Z',
      deliveryStatus: 'revoked_remote',
      remoteRevokedAt: '2026-07-14T12:06:00.000Z',
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'closed',
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse(grantorStatus(closedAccepted)));
    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationState: 'closed',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationDecidedAt: '2026-07-14T12:05:00.000Z',
    });

    const expiredAt = '2026-07-14T12:05:00.000Z';
    const expiredDeclined = proposal({
      state: 'expired',
      terminalDecision: 'decline',
      createdAt: '2026-07-14T12:02:00.000Z',
      expiresAt: expiredAt,
      decidedAt: '2026-07-14T12:04:00.000Z',
    });
    runtime.row = localGrant({
      expiresAt: expiredAt,
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'expired',
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: '2026-07-14T12:02:00.000Z',
      remoteCoordinationExpiresAt: expiredAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse(grantorStatus(expiredDeclined)));
    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationState: 'expired',
      remoteCoordinationTerminalDecision: 'decline',
      remoteCoordinationDecidedAt: '2026-07-14T12:04:00.000Z',
    });
  });

  it('recupera el receipt exacto response-lost después de revoke o expiry sin confirmar intención local', async () => {
    const closedAccepted = proposal({
      state: 'closed',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    runtime.row = localGrant({
      status: 'revoked',
      revokedAt: '2026-07-14T12:06:00.000Z',
      deliveryStatus: 'revoked_remote',
      remoteRevokedAt: '2026-07-14T12:06:00.000Z',
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'closed',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse({
      contract: CUSTODY_COORDINATION_CONTRACT,
      status: 'duplicate',
      proposal: closedAccepted,
    }));
    await expect(decideCustodyCoordination(expectedProposalId, 'accept')).resolves.toMatchObject({
      remoteCoordinationState: 'closed',
      remoteCoordinationTerminalDecision: 'accept',
    });

    const expiredAt = '2026-07-14T12:05:00.000Z';
    const expiredDeclined = proposal({
      state: 'expired',
      terminalDecision: 'decline',
      expiresAt: expiredAt,
      decidedAt: '2026-07-14T12:04:00.000Z',
    });
    runtime.row = localGrant({
      expiresAt: expiredAt,
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'expired',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiredAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    runtime.communityFetch.mockResolvedValueOnce(jsonResponse({
      contract: CUSTODY_COORDINATION_CONTRACT,
      status: 'duplicate',
      proposal: expiredDeclined,
    }));
    await expect(decideCustodyCoordination(expectedProposalId, 'decline')).resolves.toMatchObject({
      remoteCoordinationState: 'expired',
      remoteCoordinationTerminalDecision: 'decline',
    });

    runtime.communityFetch.mockClear();
    await expect(decideCustodyCoordination(expectedProposalId, 'accept'))
      .rejects.toThrow('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
    expect(runtime.communityFetch).not.toHaveBeenCalled();
  });

  it('decide con proof e ID estable, y no cambia cache ante receipt inválido', async () => {
    runtime.row = localGrant({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    const accepted = proposal({
      state: 'accepted',
      terminalDecision: 'accept',
      decidedAt: '2026-07-14T12:05:00.000Z',
    });
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_COORDINATION_CONTRACT,
        status: 'accepted',
        proposal: { ...accepted, capacity: { quantity: 13, unit: 'meals' } },
      }))
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_COORDINATION_CONTRACT,
        status: 'accepted',
        proposal: accepted,
      }));

    await expect(decideCustodyCoordination(expectedProposalId, 'accept'))
      .rejects.toThrow('CUSTODY_COORDINATION_GRANT_MISMATCH');
    expect(runtime.patches).toHaveLength(0);
    expect(runtime.row).toMatchObject({ remoteCoordinationState: 'proposed' });

    const decided = await decideCustodyCoordination(expectedProposalId, 'accept');
    expect(decided).toMatchObject({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationDecidedAt: '2026-07-14T12:05:00.000Z',
      remoteCoordinationRefreshedAt: refreshedAt,
    });
    expect(runtime.patches).toHaveLength(1);
    const [path, init] = runtime.communityFetch.mock.calls[1] as [string, RequestInit];
    expect(path).toBe('/api/v1/civic/custody/coordination/proposals/decide');
    expect(init).toEqual({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `custody:${expectedProposalId}:coordination:decision:v1`,
        'x-civic-device-token': 'device-proof',
      },
      body: JSON.stringify({
        proposalId: expectedProposalId,
        decisionId: expectedDecisionId,
        decision: 'accept',
      }),
    });
  });

  it('confía en decidedAt de PostgreSQL sin retroceder el watermark cuando el reloj local va detrás', async () => {
    const dbWatermark = '2026-07-14T12:14:30.000Z';
    const dbDecisionAt = '2026-07-14T12:14:00.000Z';
    runtime.row = localGrant({
      remoteCoordinationProposalId: expectedProposalId,
      remoteCoordinationState: 'proposed',
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: 12,
      remoteCoordinationUnit: 'meals',
      remoteCoordinationCreatedAt: createdAt,
      remoteCoordinationExpiresAt: expiresAt,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: dbWatermark,
    });
    const accepted = proposal({
      state: 'accepted',
      terminalDecision: 'accept',
      decidedAt: dbDecisionAt,
    });
    runtime.communityFetch
      .mockResolvedValueOnce(jsonResponse({
        contract: CUSTODY_COORDINATION_CONTRACT,
        status: 'accepted',
        proposal: accepted,
      }))
      .mockResolvedValueOnce(jsonResponse(grantorStatus(proposal(), {
        refreshedAt: '2026-07-14T12:14:15.000Z',
      })));

    await expect(decideCustodyCoordination(expectedProposalId, 'accept')).resolves.toMatchObject({
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationDecidedAt: dbDecisionAt,
      remoteCoordinationRefreshedAt: dbWatermark,
    });
    await expect(refreshCustodyCoordinationStatus(grantId)).resolves.toMatchObject({
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
      remoteCoordinationRefreshedAt: dbWatermark,
    });
    expect(runtime.patches).toHaveLength(1);
  });
});
