import { createHash } from 'node:crypto';
import { z } from 'zod';

import { canonicalJson, civicIdempotencyKeySchema } from './contracts';
import {
  custodyResponseVersion,
  custodyNeedUnitSchema,
  custodyUuidV4Schema,
  type CustodyDeviceRecord,
  type StoredCustodyGrant,
  type StoredCustodyGrantResponse,
} from './custody-grants';
import { custodyTimestampToIsoUtc } from './custody-timestamps';
import {
  custodyPageCursorStringSchema,
  decodeCustodyPageCursor,
  encodeCustodyPageCursor,
  type CustodyPageRequest,
} from './custody-pagination';
import { CivicApiError } from './service';

export const CUSTODY_COORDINATION_CONTRACT = 'basta-civic-custody-coordination/v1' as const;

const COORDINATION_UUID_MASKS = {
  proposal: [0x63, 0x6f, 0x6f, 0x72, 0x64, 0x2d, 0x70, 0x72, 0x6f, 0x70, 0x6f, 0x73, 0x61, 0x6c, 0x2d, 0x31],
  decision: [0x63, 0x6f, 0x6f, 0x72, 0x64, 0x2d, 0x64, 0x65, 0x63, 0x69, 0x73, 0x69, 0x6f, 0x6e, 0x2d, 0x31],
} as const;

/** Debe permanecer byte-a-byte idéntico al derivador del cliente móvil. */
const derivedCoordinationUuid = (source: string, domain: keyof typeof COORDINATION_UUID_MASKS): string => {
  const hex = source.replaceAll('-', '');
  const pairs = hex.match(/.{2}/g);
  if (!pairs || pairs.length !== 16) return '';
  const bytes = new Uint8Array(pairs.map((byte) => Number.parseInt(byte, 16)));
  const mask = COORDINATION_UUID_MASKS[domain];
  for (let index = 0; index < bytes.length; index += 1) bytes[index] ^= mask[index]!;
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const output = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${output.slice(0, 8)}-${output.slice(8, 12)}-${output.slice(12, 16)}-${output.slice(16, 20)}-${output.slice(20)}`;
};

export const custodyCoordinationProposalId = (grantId: string): string => (
  derivedCoordinationUuid(grantId, 'proposal')
);

export const custodyCoordinationDecisionId = (proposalId: string): string => (
  derivedCoordinationUuid(proposalId, 'decision')
);

const custodyResponseVersionSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const createCustodyCoordinationProposalSchema = z.object({
  proposalId: custodyUuidV4Schema,
  grantId: custodyUuidV4Schema,
  expectedResponseVersion: custodyResponseVersionSchema,
}).strict().superRefine((value, ctx) => {
  if (value.proposalId !== custodyCoordinationProposalId(value.grantId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['proposalId'],
      message: 'proposalId no corresponde al grantId.',
    });
  }
});

export const decideCustodyCoordinationProposalSchema = z.object({
  proposalId: custodyUuidV4Schema,
  decisionId: custodyUuidV4Schema,
  decision: z.enum(['accept', 'decline']),
}).strict().superRefine((value, ctx) => {
  if (value.decisionId !== custodyCoordinationDecisionId(value.proposalId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['decisionId'],
      message: 'decisionId no corresponde al proposalId.',
    });
  }
});

export const custodyCoordinationStatusSchema = z.object({
  grantId: custodyUuidV4Schema,
}).strict();

export const custodyCoordinationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: custodyPageCursorStringSchema.optional(),
}).strict();

export { civicIdempotencyKeySchema as custodyCoordinationIdempotencyKeySchema };

export type CreateCustodyCoordinationProposalInput = z.infer<typeof createCustodyCoordinationProposalSchema>;
export type DecideCustodyCoordinationProposalInput = z.infer<typeof decideCustodyCoordinationProposalSchema>;
export type CustodyCoordinationDecision = DecideCustodyCoordinationProposalInput['decision'];
export type CustodyCoordinationState = 'proposed' | 'accepted' | 'declined' | 'expired' | 'closed';
export type CustodyCoordinationUnit = z.infer<typeof custodyNeedUnitSchema>;

export interface StoredCustodyCoordinationProposal {
  rowId: number;
  proposalId: string;
  grantId: string;
  sourceResponseId: string;
  idempotencyKey: string;
  requestHash: string;
  proposerUserId: number;
  quantity: number | null;
  unit: CustodyCoordinationUnit | null;
  expiresAt: string;
  createdAt: string;
}

export interface StoredCustodyCoordinationDecision {
  rowId: number;
  decisionId: string;
  proposalId: string;
  idempotencyKey: string;
  requestHash: string;
  deciderUserId: number;
  ownerActorKey: string;
  decision: CustodyCoordinationDecision;
  createdAt: string;
}

export interface CustodyCoordinationRecord {
  proposal: StoredCustodyCoordinationProposal;
  grant: StoredCustodyGrant;
  decision: StoredCustodyCoordinationDecision | null;
}

export interface CustodyCoordinationCoordinatorSnapshot {
  /** La cuenta seguía activa dentro del mismo snapshot que produjo las filas. */
  authorized: boolean;
  records: CustodyCoordinationRecord[];
  /** Reloj PostgreSQL de la sentencia; null implica que la ACL falló cerrada. */
  refreshedAt: string | null;
}

export interface CustodyCoordinationStore {
  runInTransaction?<T>(operation: (store: CustodyCoordinationStore) => Promise<T>): Promise<T>;
  /** Reloj autoritativo de la misma base que serializa grants y decisiones. */
  currentTimestamp(): Promise<string>;
  isActiveUser(userId: number): Promise<boolean>;
  getDevice(actorKey: string): Promise<CustodyDeviceRecord | null>;
  isCircleCoordinator(circleId: number, userId: number): Promise<boolean>;
  hasAvailableCircleCoordinator(circleId: number, excludedUserId: number): Promise<boolean>;
  getGrant(grantId: string): Promise<StoredCustodyGrant | null>;
  getGrantForUpdate(grantId: string): Promise<StoredCustodyGrant | null>;
  getLatestAppliedResponse(grantId: string): Promise<StoredCustodyGrantResponse | null>;
  findProposalConflicts(
    proposalId: string,
    proposerUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyCoordinationProposal[]>;
  getProposal(proposalId: string): Promise<StoredCustodyCoordinationProposal | null>;
  getProposalForGrant(grantId: string): Promise<StoredCustodyCoordinationProposal | null>;
  getProposalForUpdate(proposalId: string): Promise<StoredCustodyCoordinationProposal | null>;
  insertProposal(
    input: Omit<StoredCustodyCoordinationProposal, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyCoordinationProposal | null>;
  findDecisionConflicts(
    decisionId: string,
    deciderUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyCoordinationDecision[]>;
  getDecision(proposalId: string): Promise<StoredCustodyCoordinationDecision | null>;
  insertDecision(
    input: Omit<StoredCustodyCoordinationDecision, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyCoordinationDecision | null>;
  listCoordinatorRecords(
    userId: number,
    limit: number,
    page: CustodyPageRequest | null,
  ): Promise<CustodyCoordinationCoordinatorSnapshot>;
}

export interface CustodyCoordinationActorContext {
  actorKey: string;
  linkedUserId: number | null;
  revokedAt: string | null;
}

export interface CustodyCoordinationProposalView {
  proposalId: string;
  grantId: string;
  state: CustodyCoordinationState;
  /**
   * Decisión append-only del grantor, separada del estado operativo. Un cierre
   * o vencimiento puede prevalecer en `state` sin borrar esta constancia.
   */
  terminalDecision: CustodyCoordinationDecision | null;
  capacity: {
    quantity: number | null;
    unit: CustodyCoordinationUnit | null;
  };
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
}

const hash = (value: unknown): string => createHash('sha256')
  .update(canonicalJson(value))
  .digest('hex');

const grantIsActive = (grant: StoredCustodyGrant, nowMs: number): boolean => (
  grant.revokedAt == null
  && grant.closedAt == null
  && Date.parse(grant.expiresAt) > nowMs
);

const effectiveState = (
  record: CustodyCoordinationRecord,
  nowMs: number,
  coordinatorAvailable = true,
): CustodyCoordinationState => {
  const { grant, proposal, decision } = record;
  if (grant.revokedAt || grant.closedReason === 'revoked' || grant.closedReason === 'superseded') {
    return 'closed';
  }
  if (grant.closedAt && grant.closedReason !== 'expired') return 'closed';
  if (
    grant.closedReason === 'expired'
    || Date.parse(grant.expiresAt) <= nowMs
    || Date.parse(proposal.expiresAt) <= nowMs
  ) return 'expired';
  // Sin una contraparte coordinadora actualmente autorizada no queda una
  // coordinación operable. No se revela si cambió la membresía o el círculo.
  if (!coordinatorAvailable) return 'closed';
  if (decision?.decision === 'accept') return 'accepted';
  if (decision?.decision === 'decline') return 'declined';
  return 'proposed';
};

const viewFromRecord = (
  record: CustodyCoordinationRecord,
  nowMs: number,
  coordinatorAvailable = true,
): CustodyCoordinationProposalView => ({
  proposalId: record.proposal.proposalId,
  grantId: record.proposal.grantId,
  state: effectiveState(record, nowMs, coordinatorAvailable),
  terminalDecision: record.decision?.decision ?? null,
  capacity: {
    quantity: record.proposal.quantity,
    unit: record.proposal.unit,
  },
  createdAt: custodyTimestampToIsoUtc(record.proposal.createdAt, '$.proposal.createdAt'),
  expiresAt: custodyTimestampToIsoUtc(record.proposal.expiresAt, '$.proposal.expiresAt'),
  decidedAt: record.decision
    ? custodyTimestampToIsoUtc(record.decision.createdAt, '$.proposal.decidedAt')
    : null,
});

const idempotentProposal = (
  rows: StoredCustodyCoordinationProposal[],
  proposalId: string,
  proposerUserId: number,
  idempotencyKey: string,
  requestHash: string,
): StoredCustodyCoordinationProposal | null => {
  if (rows.length === 0) return null;
  if (
    rows.length === 1
    && rows[0].proposalId === proposalId
    && rows[0].proposerUserId === proposerUserId
    && rows[0].idempotencyKey === idempotencyKey
    && rows[0].requestHash === requestHash
  ) return rows[0];
  throw new CivicApiError(
    409,
    'CUSTODY_COORDINATION_IDEMPOTENCY_CONFLICT',
    'La identidad de la propuesta ya fue usada con otro contenido.',
  );
};

const idempotentDecision = (
  rows: StoredCustodyCoordinationDecision[],
  input: DecideCustodyCoordinationProposalInput,
  userId: number,
  actorKey: string,
  idempotencyKey: string,
  requestHash: string,
): StoredCustodyCoordinationDecision | null => {
  if (rows.length === 0) return null;
  if (
    rows.length === 1
    && rows[0].decisionId === input.decisionId
    && rows[0].proposalId === input.proposalId
    && rows[0].deciderUserId === userId
    && rows[0].ownerActorKey === actorKey
    && rows[0].decision === input.decision
    && rows[0].idempotencyKey === idempotencyKey
    && rows[0].requestHash === requestHash
  ) return rows[0];
  throw new CivicApiError(
    409,
    'CUSTODY_COORDINATION_DECISION_IDEMPOTENCY_CONFLICT',
    'La identidad de la decisión ya fue usada con otro contenido.',
  );
};

const assertDeterministicProposalId = (input: CreateCustodyCoordinationProposalInput): void => {
  if (input.proposalId !== custodyCoordinationProposalId(input.grantId)) {
    throw new CivicApiError(
      422,
      'INVALID_CUSTODY_COORDINATION_PROPOSAL_ID',
      'La identidad de propuesta no corresponde al grant.',
      '$.proposalId',
    );
  }
};

const assertDeterministicDecisionId = (input: DecideCustodyCoordinationProposalInput): void => {
  if (input.decisionId !== custodyCoordinationDecisionId(input.proposalId)) {
    throw new CivicApiError(
      422,
      'INVALID_CUSTODY_COORDINATION_DECISION_ID',
      'La identidad de decisión no corresponde a la propuesta.',
      '$.decisionId',
    );
  }
};

export class CustodyCoordinationService {
  constructor(private readonly store: CustodyCoordinationStore) {}

  private async authoritativeNow(store: CustodyCoordinationStore): Promise<{
    iso: string;
    ms: number;
  }> {
    const iso = custodyTimestampToIsoUtc(
      await store.currentTimestamp(),
      '$.coordination.currentTimestamp',
    );
    return { iso, ms: Date.parse(iso) };
  }

  private async assertActiveUser(store: CustodyCoordinationStore, userId: number): Promise<void> {
    if (!(await store.isActiveUser(userId))) {
      throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para coordinar.');
    }
  }

  private assertExactOwnerDevice(
    actor: CustodyCoordinationActorContext,
    userId: number,
    grant: StoredCustodyGrant,
  ): void {
    if (actor.revokedAt) {
      throw new CivicApiError(403, 'DEVICE_REVOKED', 'El dispositivo dueño de la necesidad fue revocado.');
    }
    if (
      actor.actorKey !== grant.ownerActorKey
      || actor.linkedUserId !== userId
      || grant.grantorUserId !== userId
    ) {
      throw new CivicApiError(
        404,
        'CUSTODY_COORDINATION_NOT_FOUND',
        'La coordinación no existe o no está disponible.',
      );
    }
  }

  private async recordForProposal(
    store: CustodyCoordinationStore,
    proposal: StoredCustodyCoordinationProposal,
    grant?: StoredCustodyGrant,
  ): Promise<CustodyCoordinationRecord> {
    const resolvedGrant = grant ?? await store.getGrant(proposal.grantId);
    if (!resolvedGrant) {
      throw new CivicApiError(500, 'CUSTODY_COORDINATION_STATE_INVALID', 'La propuesta perdió su grant de origen.');
    }
    return {
      proposal,
      grant: resolvedGrant,
      decision: await store.getDecision(proposal.proposalId),
    };
  }

  async create(
    userId: number,
    input: CreateCustodyCoordinationProposalInput,
    idempotencyKey: string,
  ): Promise<{
    contract: typeof CUSTODY_COORDINATION_CONTRACT;
    status: 'accepted' | 'duplicate';
    proposal: CustodyCoordinationProposalView;
  }> {
    assertDeterministicProposalId(input);
    const requestHash = hash({
      proposalId: input.proposalId,
      grantId: input.grantId,
      expectedResponseVersion: input.expectedResponseVersion,
      proposerUserId: userId,
    });

    const commit = async (store: CustodyCoordinationStore) => {
      await this.assertActiveUser(store, userId);
      const grant = await store.getGrantForUpdate(input.grantId);
      if (!grant) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'El grant no existe o no está disponible.');
      }
      // Tomar el reloj autoritativo después de esperar el lock evita aceptar
      // una propuesta que venció mientras otra transacción retenía el grant.
      const now = await this.authoritativeNow(store);
      if (!(await store.isCircleCoordinator(grant.recipientCircleId, userId))) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'El grant no existe o no está disponible.');
      }
      if (grant.grantorUserId === userId) {
        throw new CivicApiError(
          403,
          'CUSTODY_COORDINATION_DISTINCT_PARTY_REQUIRED',
          'La propuesta debe provenir de otra cuenta coordinadora, distinta de la cuenta grantora.',
        );
      }

      const replay = idempotentProposal(
        await store.findProposalConflicts(input.proposalId, userId, idempotencyKey),
        input.proposalId,
        userId,
        idempotencyKey,
        requestHash,
      );
      if (replay) {
        return {
          contract: CUSTODY_COORDINATION_CONTRACT,
          status: 'duplicate' as const,
          proposal: viewFromRecord(await this.recordForProposal(store, replay, grant), now.ms),
        };
      }

      // La membresía actual protege la lectura del recibo, pero revoke/expiry
      // no destruyen un replay exacto ya autenticado. Sólo una escritura nueva
      // queda sujeta a la operabilidad actual del grant.
      if (!grantIsActive(grant, now.ms)) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'El grant no existe o no está disponible.');
      }

      if (await store.getProposalForGrant(grant.grantId)) {
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_PROPOSAL_EXISTS',
          'Este grant ya tiene una propuesta de coordinación.',
        );
      }
      const response = await store.getLatestAppliedResponse(grant.grantId);
      if (!response || response.disposition !== 'support_available') {
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_SUPPORT_REQUIRED',
          'La propuesta requiere una declaración vigente de capacidad disponible.',
        );
      }
      if (custodyResponseVersion(response.responseId) !== input.expectedResponseVersion) {
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_RESPONSE_CHANGED',
          'La capacidad cambió desde que fue mostrada; debe revisarse antes de proponer.',
        );
      }

      const inserted = await store.insertProposal({
        proposalId: input.proposalId,
        grantId: grant.grantId,
        sourceResponseId: response.responseId,
        idempotencyKey,
        requestHash,
        proposerUserId: userId,
        quantity: response.quantity,
        unit: response.unit,
        expiresAt: grant.expiresAt,
      });
      if (!inserted) {
        const afterRace = idempotentProposal(
          await store.findProposalConflicts(input.proposalId, userId, idempotencyKey),
          input.proposalId,
          userId,
          idempotencyKey,
          requestHash,
        );
        if (afterRace) {
          return {
            contract: CUSTODY_COORDINATION_CONTRACT,
            status: 'duplicate' as const,
            proposal: viewFromRecord(
              await this.recordForProposal(store, afterRace, grant),
              now.ms,
            ),
          };
        }
        if (await store.getProposalForGrant(grant.grantId)) {
          throw new CivicApiError(
            409,
            'CUSTODY_COORDINATION_PROPOSAL_EXISTS',
            'Este grant ya tiene una propuesta de coordinación.',
          );
        }
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_IDEMPOTENCY_CONFLICT',
          'La propuesta entró en conflicto con otra escritura.',
        );
      }

      return {
        contract: CUSTODY_COORDINATION_CONTRACT,
        status: 'accepted' as const,
        proposal: viewFromRecord({ proposal: inserted, grant, decision: null }, now.ms),
      };
    };

    return this.store.runInTransaction ? this.store.runInTransaction(commit) : commit(this.store);
  }

  async decide(
    actor: CustodyCoordinationActorContext,
    userId: number,
    input: DecideCustodyCoordinationProposalInput,
    idempotencyKey: string,
  ): Promise<{
    contract: typeof CUSTODY_COORDINATION_CONTRACT;
    status: 'accepted' | 'duplicate';
    proposal: CustodyCoordinationProposalView;
  }> {
    assertDeterministicDecisionId(input);
    const requestHash = hash({
      proposalId: input.proposalId,
      decisionId: input.decisionId,
      decision: input.decision,
      deciderUserId: userId,
      ownerActorKey: actor.actorKey,
    });

    const commit = async (store: CustodyCoordinationStore) => {
      await this.assertActiveUser(store, userId);
      const currentDevice = await store.getDevice(actor.actorKey);
      if (!currentDevice) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'La coordinación no existe o no está disponible.');
      }

      // Primera lectura inmutable para conocer el grant; después siempre se
      // bloquea grant → proposal, el mismo orden usado por create/respond.
      const located = await store.getProposal(input.proposalId);
      if (!located) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'La coordinación no existe o no está disponible.');
      }
      const grant = await store.getGrantForUpdate(located.grantId);
      const proposal = await store.getProposalForUpdate(input.proposalId);
      if (!grant || !proposal || proposal.grantId !== grant.grantId) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'La coordinación no existe o no está disponible.');
      }
      this.assertExactOwnerDevice(currentDevice, userId, grant);

      const now = await this.authoritativeNow(store);
      const replay = idempotentDecision(
        await store.findDecisionConflicts(input.decisionId, userId, idempotencyKey),
        input,
        userId,
        currentDevice.actorKey,
        idempotencyKey,
        requestHash,
      );
      const coordinatorAvailable = await store.hasAvailableCircleCoordinator(
        grant.recipientCircleId,
        grant.grantorUserId,
      );
      if (replay) {
        return {
          contract: CUSTODY_COORDINATION_CONTRACT,
          status: 'duplicate' as const,
          proposal: viewFromRecord(
            { proposal, grant, decision: replay },
            now.ms,
            coordinatorAvailable,
          ),
        };
      }
      // La autenticación del owner y el replay exacto se resuelven antes de
      // comprobar operabilidad. Así una respuesta perdida puede recuperar su
      // recibo después de revoke/expiry, sin habilitar una decisión nueva.
      if (!grantIsActive(grant, now.ms) || !coordinatorAvailable) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'La coordinación no existe o no está disponible.');
      }
      if (await store.getDecision(proposal.proposalId)) {
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_ALREADY_DECIDED',
          'La propuesta ya tiene una decisión terminal.',
        );
      }

      const inserted = await store.insertDecision({
        decisionId: input.decisionId,
        proposalId: proposal.proposalId,
        idempotencyKey,
        requestHash,
        deciderUserId: userId,
        ownerActorKey: currentDevice.actorKey,
        decision: input.decision,
      });
      if (!inserted) {
        const afterRace = idempotentDecision(
          await store.findDecisionConflicts(input.decisionId, userId, idempotencyKey),
          input,
          userId,
          currentDevice.actorKey,
          idempotencyKey,
          requestHash,
        );
        if (afterRace) {
          return {
            contract: CUSTODY_COORDINATION_CONTRACT,
            status: 'duplicate' as const,
            proposal: viewFromRecord(
              { proposal, grant, decision: afterRace },
              now.ms,
              coordinatorAvailable,
            ),
          };
        }
        if (await store.getDecision(proposal.proposalId)) {
          throw new CivicApiError(
            409,
            'CUSTODY_COORDINATION_ALREADY_DECIDED',
            'La propuesta ya tiene una decisión terminal.',
          );
        }
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_DECISION_IDEMPOTENCY_CONFLICT',
          'La decisión entró en conflicto con otra escritura.',
        );
      }

      return {
        contract: CUSTODY_COORDINATION_CONTRACT,
        status: 'accepted' as const,
        proposal: viewFromRecord({ proposal, grant, decision: inserted }, now.ms),
      };
    };

    return this.store.runInTransaction ? this.store.runInTransaction(commit) : commit(this.store);
  }

  async listCoordinator(userId: number, limit: number, cursor?: string): Promise<{
    contract: typeof CUSTODY_COORDINATION_CONTRACT;
    scope: 'private-circle-coordinator-coordination';
    proposals: CustodyCoordinationProposalView[];
    refreshedAt: string;
    truncated: boolean;
    nextCursor: string | null;
  }> {
    const page = decodeCustodyPageCursor(cursor, 'coordination-inbox');
    const snapshot = await this.store.listCoordinatorRecords(userId, limit + 1, page);
    if (!snapshot.authorized) {
      throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para coordinar.');
    }
    if (!snapshot.refreshedAt) {
      throw new CivicApiError(
        500,
        'CUSTODY_COORDINATION_SNAPSHOT_INVALID',
        'No se pudo fijar el reloj de la bandeja de coordinación.',
      );
    }
    const refreshedAt = custodyTimestampToIsoUtc(snapshot.refreshedAt, '$.refreshedAt');
    if (page && refreshedAt !== page.asOf) {
      throw new CivicApiError(
        422,
        'INVALID_CUSTODY_CURSOR',
        'El cursor no pertenece a un corte temporal válido.',
      );
    }
    const refreshedAtMs = Date.parse(refreshedAt);
    const records = snapshot.records.slice(0, limit);
    const hasMore = snapshot.records.length > limit;
    const last = records.at(-1)?.proposal;
    const nextCursor = hasMore && last
      ? encodeCustodyPageCursor('coordination-inbox', {
        asOf: refreshedAt,
        after: {
          rowId: last.rowId,
        },
      })
      : null;
    return {
      contract: CUSTODY_COORDINATION_CONTRACT,
      scope: 'private-circle-coordinator-coordination',
      proposals: records.map((record) => viewFromRecord(record, refreshedAtMs)),
      refreshedAt,
      truncated: hasMore,
      nextCursor,
    };
  }

  async ownerStatus(
    actor: CustodyCoordinationActorContext,
    userId: number,
    grantId: string,
  ): Promise<{
    contract: typeof CUSTODY_COORDINATION_CONTRACT;
    scope: 'private-grantor-coordination-status';
    grantId: string;
    proposal: CustodyCoordinationProposalView | null;
    refreshedAt: string;
  }> {
    const readSnapshot = async (store: CustodyCoordinationStore) => {
      await this.assertActiveUser(store, userId);
      const currentDevice = await store.getDevice(actor.actorKey);
      // El lock padre serializa este snapshot con create/respond/decide/revoke.
      // Una revocación no puede quedar entre el grant observado y refreshedAt.
      const grant = await store.getGrantForUpdate(grantId);
      if (!currentDevice || !grant) {
        throw new CivicApiError(404, 'CUSTODY_COORDINATION_NOT_FOUND', 'La coordinación no existe o no está disponible.');
      }
      this.assertExactOwnerDevice(currentDevice, userId, grant);

      const locatedProposal = await store.getProposalForGrant(grant.grantId);
      const proposal = locatedProposal
        ? await store.getProposalForUpdate(locatedProposal.proposalId)
        : null;
      if (locatedProposal && (!proposal || proposal.grantId !== grant.grantId)) {
        throw new CivicApiError(500, 'CUSTODY_COORDINATION_STATE_INVALID', 'La propuesta perdió su grant de origen.');
      }
      const decision = proposal ? await store.getDecision(proposal.proposalId) : null;
      const coordinatorAvailable = await store.hasAvailableCircleCoordinator(
        grant.recipientCircleId,
        grant.grantorUserId,
      );
      const now = await this.authoritativeNow(store);
      return {
        contract: CUSTODY_COORDINATION_CONTRACT,
        scope: 'private-grantor-coordination-status' as const,
        grantId: grant.grantId,
        proposal: proposal
          ? viewFromRecord({ proposal, grant, decision }, now.ms, coordinatorAvailable)
          : null,
        refreshedAt: now.iso,
      };
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(readSnapshot)
      : readSnapshot(this.store);
  }
}
