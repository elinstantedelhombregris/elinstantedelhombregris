import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { civicNeedAccessGrants } from '@/db/schema';
import type { CivicNeedAccessGrantRow } from '@/db/schema';

import {
  communityErrorFromResponse,
  communityFetchForUser,
  getCommunitySession,
} from './community-auth';
import { CIVIC_API_URL } from './config';
import { ensureCivicDeviceToken } from './device-auth';
import { needGrantStatusAt } from './need-access-grants';
import type { CustodyInboxGrant } from './community-api';
import type {
  NeedCoordinationDecision,
  NeedCoordinationState,
  NeedCoordinationUnit,
} from './types';

export const CUSTODY_COORDINATION_CONTRACT = 'basta-civic-custody-coordination/v1' as const;
const COORDINATOR_SCOPE = 'private-circle-coordinator-coordination' as const;
const GRANTOR_SCOPE = 'private-grantor-coordination-status' as const;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PRIVATE_PAGE_CURSOR = /^[A-Za-z0-9_-]{8,768}$/;
const UTC_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;
const CLOCK_TOLERANCE_MS = 5 * 60_000;
const STATES = new Set<NeedCoordinationState>(['proposed', 'accepted', 'declined', 'expired', 'closed']);

export type CustodyCoordinationUnit = NeedCoordinationUnit;

const UNITS = new Set<CustodyCoordinationUnit>([
  'people',
  'meals',
  'units',
  'hours',
  'kilograms',
  'liters',
  'trips',
  'days',
  'beds',
  'kits',
  'other',
]);

export interface CustodyCoordinationProposal {
  proposalId: string;
  grantId: string;
  state: NeedCoordinationState;
  /** Decisión remota verificada; no expresa si el acuerdo sigue operativo. */
  terminalDecision: NeedCoordinationDecision | null;
  capacity: {
    quantity: number | null;
    unit: CustodyCoordinationUnit | null;
  };
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
}

export interface CustodyCoordinationCoordinatorInbox {
  contract: typeof CUSTODY_COORDINATION_CONTRACT;
  scope: typeof COORDINATOR_SCOPE;
  proposals: CustodyCoordinationProposal[];
  refreshedAt: string;
  truncated: boolean;
  nextCursor: string | null;
}

export interface CustodyCoordinationGrantorStatus {
  contract: typeof CUSTODY_COORDINATION_CONTRACT;
  scope: typeof GRANTOR_SCOPE;
  grantId: string;
  proposal: CustodyCoordinationProposal | null;
  refreshedAt: string;
}

export interface CustodyCoordinationMutationReceipt {
  contract: typeof CUSTODY_COORDINATION_CONTRACT;
  status: 'accepted' | 'duplicate';
  proposal: CustodyCoordinationProposal;
}

type CustodyCoordinationSourceGrant = Pick<
  CustodyInboxGrant,
  'grantId' | 'expiresAt'
> & {
  state: 'active' | 'expired' | 'revoked' | 'closed';
  response: Pick<
    NonNullable<CustodyInboxGrant['response']>,
    'disposition' | 'quantity' | 'unit' | 'recordedAt'
  > | null;
};

export class CustodyCoordinationError extends Error {
  constructor(public readonly code: string, message = code) {
    super(message);
    this.name = 'CustodyCoordinationError';
  }
}

export const custodyCoordinationErrorMessage = (error: unknown): string => {
  const code = error instanceof CustodyCoordinationError
    ? error.code
    : error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : error instanceof Error && /^[A-Z0-9_]+$/.test(error.message)
        ? error.message
        : '';
  if (code === 'API_NOT_CONFIGURED') return 'Esta instalación todavía no tiene conectado el canal cívico privado.';
  if (code === 'AUTH_REQUIRED' || code === 'AUTH_SESSION_CHANGED' || code === 'ACCOUNT_NOT_ACTIVE') {
    return 'Vinculá la misma cuenta habilitada para usar este permiso privado.';
  }
  if (
    code.includes('DEVICE')
    || code === 'MISSING_CIVIC_PROOF'
    || code === 'INVALID_CIVIC_PROOF'
    || code === 'CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH'
  ) {
    return 'No pudimos comprobar que este dispositivo conserva la autoridad sobre el permiso. El estado no cambió.';
  }
  if (code === 'CUSTODY_COORDINATION_DISTINCT_PARTY_REQUIRED') {
    return 'La cuenta grantora no puede actuar también como coordinación. La propuesta exige otra cuenta coordinadora y una decisión registrada por separado.';
  }
  if (code === 'CUSTODY_COORDINATION_SUPPORT_REQUIRED') {
    return 'Primero hace falta una capacidad disponible comprobada y vigente.';
  }
  if (code === 'CUSTODY_COORDINATION_RESPONSE_CHANGED') {
    return 'La capacidad cambió desde que la viste. Actualizá la bandeja antes de confirmar la propuesta.';
  }
  if (
    code === 'INVALID_CUSTODY_COORDINATION_PROPOSAL_ID'
    || code === 'INVALID_CUSTODY_COORDINATION_DECISION_ID'
  ) {
    return 'La identidad de la operación no corresponde al permiso vigente. El estado no cambió.';
  }
  if (code === 'CUSTODY_COORDINATION_PROPOSAL_EXISTS') {
    return 'La capacidad ya quedó congelada en una propuesta. Actualizá el estado antes de intentar otro cambio.';
  }
  if (code === 'CUSTODY_COORDINATION_ALREADY_DECIDED') {
    return 'La propuesta ya tiene una decisión. Actualizá para ver la constancia vigente.';
  }
  if (
    code === 'CUSTODY_COORDINATION_IDEMPOTENCY_CONFLICT'
    || code === 'CUSTODY_COORDINATION_DECISION_IDEMPOTENCY_CONFLICT'
  ) return 'El reintento no coincide con la operación original. Actualizá el estado antes de volver a decidir.';
  if (code === 'CUSTODY_COORDINATION_NOT_FOUND') {
    return 'La propuesta ya no está disponible; puede haber vencido o haberse cerrado con el permiso. Actualizá el estado.';
  }
  if (code === 'CUSTODY_COORDINATION_RATE_LIMITED') {
    return 'El canal privado recibió demasiados intentos. Esperá un momento y volvé a actualizar.';
  }
  if (
    code === 'INVALID_CUSTODY_COORDINATION_RESPONSE'
    || code === 'CUSTODY_COORDINATION_GRANT_MISMATCH'
    || code === 'CUSTODY_COORDINATION_UNKNOWN_GRANT'
    || code === 'CUSTODY_COORDINATION_STATE_INVALID'
    || code.startsWith('INVALID_CUSTODY_COORDINATION_')
  ) return 'La red devolvió una constancia que no pasó la verificación segura. El estado visible no cambió.';
  return 'No pudimos verificar la coordinación privada. El estado visible no cambió.';
};

const fail = (code = 'INVALID_CUSTODY_COORDINATION_RESPONSE'): never => {
  throw new CustodyCoordinationError(code);
};

const record = (value: unknown): Record<string, unknown> | null =>
  value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
};

const uuidV4 = (value: unknown): value is string => typeof value === 'string' && UUID_V4.test(value);

/**
 * Deriva un UUID v4 estable sin crear un identificador correlacionable fuera
 * del canal custodial. Debe permanecer byte-a-byte idéntico al servidor.
 */
const derivedUuid = (source: string, domain: 'proposal' | 'decision'): string => {
  if (!uuidV4(source)) return fail('INVALID_CUSTODY_COORDINATION_ID');
  const hex = source.replaceAll('-', '');
  const bytes = new Uint8Array(hex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
  const mask = domain === 'proposal'
    ? [0x63, 0x6f, 0x6f, 0x72, 0x64, 0x2d, 0x70, 0x72, 0x6f, 0x70, 0x6f, 0x73, 0x61, 0x6c, 0x2d, 0x31]
    : [0x63, 0x6f, 0x6f, 0x72, 0x64, 0x2d, 0x64, 0x65, 0x63, 0x69, 0x73, 0x69, 0x6f, 0x6e, 0x2d, 0x31];
  for (let index = 0; index < bytes.length; index += 1) bytes[index] ^= mask[index]!;
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const output = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${output.slice(0, 8)}-${output.slice(8, 12)}-${output.slice(12, 16)}-${output.slice(16, 20)}-${output.slice(20)}`;
};

export const custodyCoordinationProposalId = (grantId: string): string => derivedUuid(grantId, 'proposal');
export const custodyCoordinationDecisionId = (proposalId: string): string => derivedUuid(proposalId, 'decision');

const utcDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const matched = UTC_DATETIME.exec(value);
  if (!matched) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const date = new Date(parsed);
  return date.getUTCFullYear() === Number(matched[1])
    && date.getUTCMonth() + 1 === Number(matched[2])
    && date.getUTCDate() === Number(matched[3])
    && date.getUTCHours() === Number(matched[4])
    && date.getUTCMinutes() === Number(matched[5])
    && date.getUTCSeconds() === Number(matched[6]);
};
const finiteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

interface ProposalTiming {
  /** Ventana de verdad usada para clasificar activo/vencido. */
  earliestStateAtMs: number;
  latestStateAtMs: number;
  /** Límite superior tolerado para timestamps creados por otro reloj. */
  latestTimestampMs: number;
}

const parseProposal = (
  value: unknown,
  timing?: ProposalTiming,
): CustodyCoordinationProposal => {
  const proposal = record(value);
  const capacity = proposal ? record(proposal.capacity) : null;
  if (
    !proposal
    || !exactKeys(proposal, [
      'proposalId',
      'grantId',
      'state',
      'terminalDecision',
      'capacity',
      'createdAt',
      'expiresAt',
      'decidedAt',
    ])
    || !uuidV4(proposal.proposalId)
    || !uuidV4(proposal.grantId)
    || proposal.proposalId !== custodyCoordinationProposalId(proposal.grantId)
    || typeof proposal.state !== 'string'
    || !STATES.has(proposal.state as NeedCoordinationState)
    || !(proposal.terminalDecision === null
      || proposal.terminalDecision === 'accept'
      || proposal.terminalDecision === 'decline')
    || !capacity
    || !exactKeys(capacity, ['quantity', 'unit'])
    || !utcDate(proposal.createdAt)
    || !utcDate(proposal.expiresAt)
    || !(proposal.decidedAt === null || utcDate(proposal.decidedAt))
  ) return fail();

  const state = proposal.state as NeedCoordinationState;
  const terminalDecision = proposal.terminalDecision as NeedCoordinationDecision | null;
  const quantity = capacity.quantity;
  const unit = capacity.unit;
  const emptyCapacity = quantity === null && unit === null;
  const controlledCapacity = finiteNumber(quantity)
    && quantity > 0
    && quantity <= 1_000_000_000
    && typeof unit === 'string'
    && UNITS.has(unit as CustodyCoordinationUnit);
  if (!emptyCapacity && !controlledCapacity) return fail();

  const createdAtMs = Date.parse(proposal.createdAt);
  const expiresAtMs = Date.parse(proposal.expiresAt);
  const decidedAtMs = proposal.decidedAt === null ? null : Date.parse(proposal.decidedAt);
  if (createdAtMs >= expiresAtMs) return fail();
  if ((terminalDecision === null) !== (decidedAtMs == null)) return fail();
  if (state === 'proposed' && terminalDecision != null) return fail();
  if (state === 'accepted' && terminalDecision !== 'accept') return fail();
  if (state === 'declined' && terminalDecision !== 'decline') return fail();
  if (decidedAtMs != null && (
    decidedAtMs < createdAtMs
    || decidedAtMs > expiresAtMs
    || (timing != null && decidedAtMs > timing.latestTimestampMs)
  )) return fail();
  if (timing != null) {
    if (state === 'expired' && expiresAtMs > timing.latestStateAtMs) return fail();
    if (['proposed', 'accepted', 'declined'].includes(state) && expiresAtMs <= timing.earliestStateAtMs) return fail();
    if (createdAtMs > timing.latestTimestampMs) return fail();
  }

  return {
    proposalId: proposal.proposalId,
    grantId: proposal.grantId,
    state,
    terminalDecision,
    capacity: {
      quantity: quantity as number | null,
      unit: unit as CustodyCoordinationUnit | null,
    },
    createdAt: proposal.createdAt,
    expiresAt: proposal.expiresAt,
    decidedAt: proposal.decidedAt as string | null,
  };
};

export const parseCustodyCoordinationCoordinatorInbox = (
  value: unknown,
  nowMs = Date.now(),
): CustodyCoordinationCoordinatorInbox => {
  const inbox = record(value);
  if (
    !inbox
    || !exactKeys(inbox, ['contract', 'scope', 'proposals', 'refreshedAt', 'truncated', 'nextCursor'])
    || inbox.contract !== CUSTODY_COORDINATION_CONTRACT
    || inbox.scope !== COORDINATOR_SCOPE
    || !Array.isArray(inbox.proposals)
    || inbox.proposals.length > 50
    || !utcDate(inbox.refreshedAt)
    || typeof inbox.truncated !== 'boolean'
    || !(inbox.nextCursor === null
      || (typeof inbox.nextCursor === 'string' && PRIVATE_PAGE_CURSOR.test(inbox.nextCursor)))
  ) return fail();
  const refreshedAtMs = Date.parse(inbox.refreshedAt);
  if (refreshedAtMs > nowMs + CLOCK_TOLERANCE_MS) return fail();
  const proposals = inbox.proposals.map((proposal) => parseProposal(proposal, {
    earliestStateAtMs: refreshedAtMs,
    latestStateAtMs: refreshedAtMs,
    // Este envelope nace de un único snapshot PostgreSQL: una propuesta o
    // decisión posterior a refreshedAt no pertenece a la respuesta.
    latestTimestampMs: refreshedAtMs,
  }));
  if (
    new Set(proposals.map((proposal) => proposal.proposalId)).size !== proposals.length
    || new Set(proposals.map((proposal) => proposal.grantId)).size !== proposals.length
    || (inbox.truncated !== (inbox.nextCursor !== null))
    || (inbox.truncated && proposals.length !== 50)
  ) return fail();
  return {
    contract: CUSTODY_COORDINATION_CONTRACT,
    scope: COORDINATOR_SCOPE,
    proposals,
    refreshedAt: inbox.refreshedAt,
    truncated: inbox.truncated,
    nextCursor: inbox.nextCursor as string | null,
  };
};

export const parseCustodyCoordinationGrantorStatus = (
  value: unknown,
  expectedGrantId: string,
  nowMs = Date.now(),
): CustodyCoordinationGrantorStatus => {
  if (!uuidV4(expectedGrantId)) return fail();
  const status = record(value);
  if (
    !status
    || !exactKeys(status, ['contract', 'scope', 'grantId', 'proposal', 'refreshedAt'])
    || status.contract !== CUSTODY_COORDINATION_CONTRACT
    || status.scope !== GRANTOR_SCOPE
    || status.grantId !== expectedGrantId
    || !utcDate(status.refreshedAt)
  ) return fail();
  const refreshedAtMs = Date.parse(status.refreshedAt);
  if (refreshedAtMs > nowMs + CLOCK_TOLERANCE_MS) return fail();
  const proposal = status.proposal === null
    ? null
    : parseProposal(status.proposal, {
      earliestStateAtMs: refreshedAtMs,
      latestStateAtMs: refreshedAtMs,
      latestTimestampMs: refreshedAtMs + CLOCK_TOLERANCE_MS,
    });
  if (proposal && proposal.grantId !== expectedGrantId) return fail();
  return {
    contract: CUSTODY_COORDINATION_CONTRACT,
    scope: GRANTOR_SCOPE,
    grantId: expectedGrantId,
    proposal,
    refreshedAt: status.refreshedAt,
  };
};

export const parseCustodyCoordinationMutationReceipt = (
  value: unknown,
  expected: {
    proposalId: string;
    grantId?: string;
    decision?: 'accept' | 'decline';
    grant?: CustodyCoordinationSourceGrant;
    observedAtMs?: number;
  },
): CustodyCoordinationMutationReceipt => {
  if (!uuidV4(expected.proposalId) || (expected.grantId != null && !uuidV4(expected.grantId))) return fail();
  const receipt = record(value);
  if (
    !receipt
    || !exactKeys(receipt, ['contract', 'status', 'proposal'])
    || receipt.contract !== CUSTODY_COORDINATION_CONTRACT
    || !['accepted', 'duplicate'].includes(String(receipt.status))
  ) return fail();
  const observedAtMs = expected.observedAtMs ?? Date.now();
  const proposal = parseProposal(receipt.proposal, {
    earliestStateAtMs: observedAtMs - CLOCK_TOLERANCE_MS,
    latestStateAtMs: observedAtMs + CLOCK_TOLERANCE_MS,
    latestTimestampMs: observedAtMs + CLOCK_TOLERANCE_MS,
  });
  if (
    proposal.proposalId !== expected.proposalId
    || (expected.grantId != null && proposal.grantId !== expected.grantId)
    || (expected.decision != null && proposal.terminalDecision !== expected.decision)
    || (expected.decision === 'accept' && receipt.status === 'accepted' && proposal.state !== 'accepted')
    || (expected.decision === 'decline' && receipt.status === 'accepted' && proposal.state !== 'declined')
    || (expected.decision == null && receipt.status === 'accepted' && proposal.state !== 'proposed')
  ) return fail();
  // Un create nuevo sólo puede producir `proposed`; su replay exacto puede
  // observar el estado vigente posterior (incluso closed/expired) porque no
  // vuelve a crear ni decidir. `parseProposal` ya exige la combinación estricta
  // entre estado, terminalDecision y decidedAt.
  if (expected.grant) assertProposalMatchesCustodyGrant(proposal, expected.grant);
  return {
    contract: CUSTODY_COORDINATION_CONTRACT,
    status: receipt.status as CustodyCoordinationMutationReceipt['status'],
    proposal,
  };
};

const localRemoteGrantIsKnown = (grant: CivicNeedAccessGrantRow): boolean =>
  ['delivered', 'revocation_pending', 'revoked_remote'].includes(grant.deliveryStatus)
  && grant.deliveredAt != null
  && grant.remoteGrantorUserId != null
  && grant.remoteRecipientCircleId != null;

const expectedFromLocalGrant = (
  grant: CivicNeedAccessGrantRow,
): CustodyCoordinationSourceGrant | null => {
  if (
    !localRemoteGrantIsKnown(grant)
    || grant.remoteResponseDisposition !== 'support_available'
    || grant.remoteResponseAt == null
    || !(grant.remoteResponseUnit == null || UNITS.has(grant.remoteResponseUnit as NeedCoordinationUnit))
  ) return null;
  return {
    grantId: grant.id,
    expiresAt: grant.expiresAt,
    state: grant.status === 'revoked' || grant.deliveryStatus === 'revoked_remote'
      ? 'revoked'
      : needGrantStatusAt(grant) === 'expired' ? 'expired' : 'active',
    response: {
      disposition: 'support_available',
      quantity: grant.remoteResponseQuantity,
      unit: grant.remoteResponseUnit as NeedCoordinationUnit | null,
      recordedAt: grant.remoteResponseAt,
    },
  };
};

/**
 * Ata el snapshot mínimo de coordinación al grant que lo originó. Los términos
 * congelados siguen siendo verificables aunque el estado operativo haya cerrado.
 * evita renderizar una propuesta válida en forma pero asociada a otro permiso
 * o a una capacidad anterior.
 */
export const assertProposalMatchesCustodyGrant = (
  proposal: CustodyCoordinationProposal,
  grant: CustodyCoordinationSourceGrant,
): void => {
  const response = grant.response;
  if (
    response?.disposition !== 'support_available'
    || proposal.grantId !== grant.grantId
    || proposal.proposalId !== custodyCoordinationProposalId(grant.grantId)
    || proposal.expiresAt !== grant.expiresAt
    || proposal.capacity.quantity !== response.quantity
    || proposal.capacity.unit !== response.unit
    || Date.parse(proposal.createdAt) < Date.parse(response.recordedAt)
  ) fail('CUSTODY_COORDINATION_GRANT_MISMATCH');
};

export const reconcileCustodyCoordinationCoordinatorInbox = (
  inbox: CustodyCoordinationCoordinatorInbox,
  activeGrants: readonly CustodyInboxGrant[],
): CustodyCoordinationCoordinatorInbox => {
  const grantsById = new Map(activeGrants.map((grant) => [grant.grantId, grant]));
  const knownProposals: CustodyCoordinationProposal[] = [];
  let omittedUnknownProposal = false;
  for (const proposal of inbox.proposals) {
    const grant = grantsById.get(proposal.grantId);
    if (!grant) {
      // Las dos bandejas se leen por separado. Una propuesta válida puede caer
      // fuera de la página de grants (o entrar en una carrera entre lecturas).
      // No derriba lo conocido, pero convierte toda ausencia en "no probada".
      omittedUnknownProposal = true;
      continue;
    }
    if (grant.state !== 'active') fail('CUSTODY_COORDINATION_GRANT_MISMATCH');
    assertProposalMatchesCustodyGrant(proposal, grant);
    knownProposals.push(proposal);
  }
  if (!omittedUnknownProposal) return inbox;
  return {
    ...inbox,
    proposals: knownProposals,
    truncated: true,
  };
};

const readJson = async (response: Response): Promise<unknown> => {
  if (!response.ok) throw await communityErrorFromResponse(response);
  return response.json() as Promise<unknown>;
};

const civicProof = async (): Promise<string> => {
  if (!CIVIC_API_URL) return fail('API_NOT_CONFIGURED');
  return ensureCivicDeviceToken(CIVIC_API_URL);
};

const assertExpectedCommunitySession = async (expectedUserId: number): Promise<void> => {
  if (!Number.isSafeInteger(expectedUserId) || expectedUserId <= 0) return fail('AUTH_SESSION_CHANGED');
  const current = await getCommunitySession();
  if (!current || current.user.id !== expectedUserId) return fail('AUTH_SESSION_CHANGED');
};

export const loadCustodyCoordinationCoordinatorInbox = async (
  activeGrants: readonly CustodyInboxGrant[],
  expectedUserId: number,
): Promise<CustodyCoordinationCoordinatorInbox> => {
  await assertExpectedCommunitySession(expectedUserId);
  const proposals: CustodyCoordinationProposal[] = [];
  const seenProposalIds = new Set<string>();
  const seenGrantIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let refreshedAt: string | null = null;

  for (let pageNumber = 0; pageNumber < 20; pageNumber += 1) {
    const path = cursor
      ? `/api/v1/civic/custody/coordination/proposals?limit=50&cursor=${encodeURIComponent(cursor)}`
      : '/api/v1/civic/custody/coordination/proposals?limit=50';
    const response = await communityFetchForUser(expectedUserId, path);
    const page = parseCustodyCoordinationCoordinatorInbox(await readJson(response));
    if (refreshedAt != null && page.refreshedAt !== refreshedAt) return fail();
    refreshedAt ??= page.refreshedAt;
    for (const proposal of page.proposals) {
      if (seenProposalIds.has(proposal.proposalId) || seenGrantIds.has(proposal.grantId)) return fail();
      seenProposalIds.add(proposal.proposalId);
      seenGrantIds.add(proposal.grantId);
      proposals.push(proposal);
    }
    if (page.nextCursor == null) {
      await assertExpectedCommunitySession(expectedUserId);
      return reconcileCustodyCoordinationCoordinatorInbox({
        contract: CUSTODY_COORDINATION_CONTRACT,
        scope: COORDINATOR_SCOPE,
        proposals,
        refreshedAt,
        truncated: false,
        nextCursor: null,
      }, activeGrants);
    }
    if (seenCursors.has(page.nextCursor)) return fail();
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  await assertExpectedCommunitySession(expectedUserId);
  return reconcileCustodyCoordinationCoordinatorInbox({
    contract: CUSTODY_COORDINATION_CONTRACT,
    scope: COORDINATOR_SCOPE,
    proposals,
    refreshedAt: refreshedAt ?? new Date(0).toISOString(),
    truncated: true,
    nextCursor: cursor,
  }, activeGrants);
};

export const proposeCustodyCoordination = async (
  grant: CustodyInboxGrant,
  expectedUserId: number,
): Promise<CustodyCoordinationMutationReceipt> => {
  if (grant.state !== 'active' || grant.response?.disposition !== 'support_available') {
    return fail('CUSTODY_COORDINATION_SUPPORT_REQUIRED');
  }
  const grantId = grant.grantId;
  const proposalId = custodyCoordinationProposalId(grantId);
  const response = await communityFetchForUser(expectedUserId, '/api/v1/civic/custody/coordination/proposals', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': `custody:${grantId}:coordination:propose:v1`,
    },
    body: JSON.stringify({
      proposalId,
      grantId,
      expectedResponseVersion: grant.response.responseVersion,
    }),
  });
  const receipt = parseCustodyCoordinationMutationReceipt(await readJson(response), {
    proposalId,
    grantId,
    grant,
  });
  await assertExpectedCommunitySession(expectedUserId);
  return receipt;
};

const cachePatch = (
  proposal: CustodyCoordinationProposal | null,
  refreshedAt: string,
): Partial<CivicNeedAccessGrantRow> => ({
  remoteCoordinationProposalId: proposal?.proposalId ?? null,
  remoteCoordinationState: proposal?.state ?? null,
  remoteCoordinationTerminalDecision: proposal?.terminalDecision ?? null,
  remoteCoordinationQuantity: proposal?.capacity.quantity ?? null,
  remoteCoordinationUnit: proposal?.capacity.unit ?? null,
  remoteCoordinationCreatedAt: proposal?.createdAt ?? null,
  remoteCoordinationExpiresAt: proposal?.expiresAt ?? null,
  remoteCoordinationDecidedAt: proposal?.decidedAt ?? null,
  remoteCoordinationRefreshedAt: refreshedAt,
});

const coordinationStateCanAdvance = (
  current: NeedCoordinationState,
  next: NeedCoordinationState,
): boolean => {
  const allowed: Record<NeedCoordinationState, readonly NeedCoordinationState[]> = {
    proposed: ['accepted', 'declined', 'expired', 'closed'],
    accepted: ['expired', 'closed'],
    declined: ['expired', 'closed'],
    closed: ['expired'],
    expired: [],
  };
  return current === next || allowed[current].includes(next);
};

const assertMonotonicCacheAdvance = (
  grant: CivicNeedAccessGrantRow,
  proposal: CustodyCoordinationProposal | null,
): void => {
  if (!grant.remoteCoordinationProposalId) return;
  if (!proposal || proposal.proposalId !== grant.remoteCoordinationProposalId) {
    return fail('CUSTODY_COORDINATION_STATE_INVALID');
  }
  if (
    grant.remoteCoordinationCreatedAt !== proposal.createdAt
    || grant.remoteCoordinationExpiresAt !== proposal.expiresAt
    || grant.remoteCoordinationQuantity !== proposal.capacity.quantity
    || grant.remoteCoordinationUnit !== proposal.capacity.unit
    || (grant.remoteCoordinationState != null
      && !coordinationStateCanAdvance(grant.remoteCoordinationState, proposal.state))
    || (grant.remoteCoordinationTerminalDecision != null
      && grant.remoteCoordinationTerminalDecision !== proposal.terminalDecision)
    || (grant.remoteCoordinationDecidedAt != null
      && grant.remoteCoordinationDecidedAt !== proposal.decidedAt)
  ) fail('CUSTODY_COORDINATION_STATE_INVALID');
};

const cacheProposal = (
  grantId: string,
  proposal: CustodyCoordinationProposal | null,
  refreshedAt: string,
  verifiedTerminalMutation = false,
): CivicNeedAccessGrantRow => {
  return db.transaction((tx) => {
    const grant = tx.select().from(civicNeedAccessGrants)
      .where(eq(civicNeedAccessGrants.id, grantId)).get() ?? null;
    if (!grant || !utcDate(refreshedAt) || (proposal && proposal.grantId !== grantId)) {
      return fail('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
    }
    if (proposal) {
      const expected = expectedFromLocalGrant(grant);
      if (!expected) return fail('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
      assertProposalMatchesCustodyGrant(proposal, expected);
    }

    const previousRefreshedAt = grant.remoteCoordinationRefreshedAt;
    const verifiedTerminalAdvance = Boolean(
      verifiedTerminalMutation
      && proposal
      && proposal.terminalDecision != null
      && proposal.decidedAt != null
      && grant.remoteCoordinationProposalId === proposal.proposalId
      && grant.remoteCoordinationTerminalDecision == null,
    );
    if (previousRefreshedAt != null) {
      if (!utcDate(previousRefreshedAt)) return fail('CUSTODY_COORDINATION_STATE_INVALID');
      if (
        Date.parse(refreshedAt) < Date.parse(previousRefreshedAt)
        && !verifiedTerminalAdvance
      ) return grant;
    }
    assertMonotonicCacheAdvance(grant, proposal);

    // Un recibo de decisión autenticado es evidencia más fuerte que el reloj
    // local. Puede completar null→decision aunque el snapshot previo tenga un
    // watermark adelantado; el watermark mismo nunca retrocede, por lo que un
    // status realmente anterior seguirá siendo ignorado.
    const effectiveRefreshedAt = previousRefreshedAt != null
      && Date.parse(previousRefreshedAt) > Date.parse(refreshedAt)
      ? previousRefreshedAt
      : refreshedAt;

    tx.update(civicNeedAccessGrants).set(cachePatch(proposal, effectiveRefreshedAt))
      .where(eq(civicNeedAccessGrants.id, grantId)).run();
    return tx.select().from(civicNeedAccessGrants)
      .where(eq(civicNeedAccessGrants.id, grantId)).get()
      ?? fail('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
  });
};

export const refreshCustodyCoordinationStatus = async (
  grantId: string,
  expectedUserId: number,
): Promise<CivicNeedAccessGrantRow> => {
  if (!uuidV4(grantId)) return fail('INVALID_CUSTODY_COORDINATION_ID');
  const localGrant = db.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.id, grantId)).get() ?? null;
  if (!localGrant || !localRemoteGrantIsKnown(localGrant)) {
    return fail('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
  }
  const proof = await civicProof();
  const response = await communityFetchForUser(expectedUserId, '/api/v1/civic/custody/coordination/status', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-civic-device-token': proof,
    },
    body: JSON.stringify({ grantId }),
  });
  const status = parseCustodyCoordinationGrantorStatus(await readJson(response), grantId);
  await assertExpectedCommunitySession(expectedUserId);
  return cacheProposal(grantId, status.proposal, status.refreshedAt);
};

export const decideCustodyCoordination = async (
  proposalId: string,
  decision: 'accept' | 'decline',
  expectedUserId: number,
): Promise<CivicNeedAccessGrantRow> => {
  if (!uuidV4(proposalId)) return fail('INVALID_CUSTODY_COORDINATION_ID');
  const localGrant = db.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.remoteCoordinationProposalId, proposalId)).get() ?? null;
  if (
    !localGrant
    || localGrant.remoteCoordinationProposalId !== custodyCoordinationProposalId(localGrant.id)
    || localGrant.remoteCoordinationState == null
    || localGrant.remoteCoordinationCreatedAt == null
    || localGrant.remoteCoordinationExpiresAt == null
    || (localGrant.remoteCoordinationTerminalDecision != null
      && localGrant.remoteCoordinationTerminalDecision !== decision)
    || !expectedFromLocalGrant(localGrant)
  ) return fail('CUSTODY_COORDINATION_LOCAL_GRANT_MISMATCH');
  const proof = await civicProof();
  const decisionId = custodyCoordinationDecisionId(proposalId);
  const response = await communityFetchForUser(expectedUserId, '/api/v1/civic/custody/coordination/proposals/decide', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': `custody:${proposalId}:coordination:decision:v1`,
      'x-civic-device-token': proof,
    },
    body: JSON.stringify({ proposalId, decisionId, decision }),
  });
  const receipt = parseCustodyCoordinationMutationReceipt(
    await readJson(response),
    {
      proposalId,
      grantId: localGrant.id,
      decision,
      grant: expectedFromLocalGrant(localGrant)!,
      observedAtMs: Date.now(),
    },
  );
  const decisionAt = receipt.proposal.decidedAt;
  if (!decisionAt) return fail('CUSTODY_COORDINATION_STATE_INVALID');
  await assertExpectedCommunitySession(expectedUserId);
  return cacheProposal(receipt.proposal.grantId, receipt.proposal, decisionAt, true);
};
