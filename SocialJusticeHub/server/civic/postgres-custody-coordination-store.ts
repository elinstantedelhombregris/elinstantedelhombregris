import { and, desc, eq, gt, isNull, lte, ne, or, sql } from 'drizzle-orm';

import {
  circles,
  circleMembers,
  civicCustodyCoordinationDecisions,
  civicCustodyCoordinationProposals,
  civicCustodyGrantResponses,
  civicCustodyGrants,
  civicDevices,
  users,
} from '@shared/schema';
import { civicTransactionDb, db } from '../db';
import type {
  CustodyCoordinationCoordinatorSnapshot,
  CustodyCoordinationRecord,
  CustodyCoordinationStore,
  StoredCustodyCoordinationDecision,
  StoredCustodyCoordinationProposal,
} from './custody-coordination';
import type {
  CustodyDeviceRecord,
  StoredCustodyGrant,
  StoredCustodyGrantResponse,
} from './custody-grants';
import type { CustodyPageRequest } from './custody-pagination';

type CoordinationDatabaseExecutor = Pick<
  typeof db,
  'select' | 'insert' | 'update' | 'delete'
>;

const grantColumns = {
  rowId: civicCustodyGrants.id,
  grantId: civicCustodyGrants.grantId,
  idempotencyKey: civicCustodyGrants.idempotencyKey,
  requestHash: civicCustodyGrants.requestHash,
  needId: civicCustodyGrants.needId,
  ownerActorKey: civicCustodyGrants.ownerActorKey,
  grantorUserId: civicCustodyGrants.grantorUserId,
  recipientType: civicCustodyGrants.recipientType,
  recipientCircleId: civicCustodyGrants.recipientCircleId,
  payloadJson: civicCustodyGrants.payloadJson,
  expiresAt: civicCustodyGrants.expiresAt,
  revokedAt: civicCustodyGrants.revokedAt,
  closedAt: civicCustodyGrants.closedAt,
  closedReason: civicCustodyGrants.closedReason,
  createdAt: civicCustodyGrants.createdAt,
};

const responseColumns = {
  rowId: civicCustodyGrantResponses.id,
  responseId: civicCustodyGrantResponses.responseId,
  idempotencyKey: civicCustodyGrantResponses.idempotencyKey,
  requestHash: civicCustodyGrantResponses.requestHash,
  grantId: civicCustodyGrantResponses.grantId,
  responderUserId: civicCustodyGrantResponses.responderUserId,
  disposition: civicCustodyGrantResponses.disposition,
  quantity: civicCustodyGrantResponses.quantity,
  unit: civicCustodyGrantResponses.unit,
  applied: civicCustodyGrantResponses.applied,
  createdAt: civicCustodyGrantResponses.createdAt,
};

const proposalColumns = {
  rowId: civicCustodyCoordinationProposals.id,
  proposalId: civicCustodyCoordinationProposals.proposalId,
  grantId: civicCustodyCoordinationProposals.grantId,
  sourceResponseId: civicCustodyCoordinationProposals.sourceResponseId,
  idempotencyKey: civicCustodyCoordinationProposals.idempotencyKey,
  requestHash: civicCustodyCoordinationProposals.requestHash,
  proposerUserId: civicCustodyCoordinationProposals.proposerUserId,
  quantity: civicCustodyCoordinationProposals.quantity,
  unit: civicCustodyCoordinationProposals.unit,
  expiresAt: civicCustodyCoordinationProposals.expiresAt,
  createdAt: civicCustodyCoordinationProposals.createdAt,
};

const decisionColumns = {
  rowId: civicCustodyCoordinationDecisions.id,
  decisionId: civicCustodyCoordinationDecisions.decisionId,
  proposalId: civicCustodyCoordinationDecisions.proposalId,
  idempotencyKey: civicCustodyCoordinationDecisions.idempotencyKey,
  requestHash: civicCustodyCoordinationDecisions.requestHash,
  deciderUserId: civicCustodyCoordinationDecisions.deciderUserId,
  ownerActorKey: civicCustodyCoordinationDecisions.ownerActorKey,
  decision: civicCustodyCoordinationDecisions.decision,
  createdAt: civicCustodyCoordinationDecisions.createdAt,
};

// Un derived table de PostgreSQL no puede exponer tres columnas llamadas `id`
// (ni los otros nombres repetidos) y luego resolverlas desde la consulta
// exterior. Los aliases explícitos son parte de la frontera del snapshot.
const snapshotProposalColumns = {
  rowId: sql`${civicCustodyCoordinationProposals.id}`
    .mapWith(civicCustodyCoordinationProposals.id).as('snapshot_proposal_row_id'),
  proposalId: sql`${civicCustodyCoordinationProposals.proposalId}`
    .mapWith(civicCustodyCoordinationProposals.proposalId).as('snapshot_proposal_id'),
  grantId: sql`${civicCustodyCoordinationProposals.grantId}`
    .mapWith(civicCustodyCoordinationProposals.grantId).as('snapshot_proposal_grant_id'),
  sourceResponseId: sql`${civicCustodyCoordinationProposals.sourceResponseId}`
    .mapWith(civicCustodyCoordinationProposals.sourceResponseId).as('snapshot_proposal_source_response_id'),
  idempotencyKey: sql`${civicCustodyCoordinationProposals.idempotencyKey}`
    .mapWith(civicCustodyCoordinationProposals.idempotencyKey).as('snapshot_proposal_idempotency_key'),
  requestHash: sql`${civicCustodyCoordinationProposals.requestHash}`
    .mapWith(civicCustodyCoordinationProposals.requestHash).as('snapshot_proposal_request_hash'),
  proposerUserId: sql`${civicCustodyCoordinationProposals.proposerUserId}`
    .mapWith(civicCustodyCoordinationProposals.proposerUserId).as('snapshot_proposal_proposer_user_id'),
  quantity: sql`${civicCustodyCoordinationProposals.quantity}`
    .mapWith(civicCustodyCoordinationProposals.quantity).as('snapshot_proposal_quantity'),
  unit: sql`${civicCustodyCoordinationProposals.unit}`
    .mapWith(civicCustodyCoordinationProposals.unit).as('snapshot_proposal_unit'),
  expiresAt: sql`${civicCustodyCoordinationProposals.expiresAt}`
    .mapWith(civicCustodyCoordinationProposals.expiresAt).as('snapshot_proposal_expires_at'),
  createdAt: sql`${civicCustodyCoordinationProposals.createdAt}`
    .mapWith(civicCustodyCoordinationProposals.createdAt).as('snapshot_proposal_created_at'),
};

const snapshotGrantColumns = {
  rowId: sql`${civicCustodyGrants.id}`
    .mapWith(civicCustodyGrants.id).as('snapshot_grant_row_id'),
  grantId: sql`${civicCustodyGrants.grantId}`
    .mapWith(civicCustodyGrants.grantId).as('snapshot_grant_id'),
  idempotencyKey: sql`${civicCustodyGrants.idempotencyKey}`
    .mapWith(civicCustodyGrants.idempotencyKey).as('snapshot_grant_idempotency_key'),
  requestHash: sql`${civicCustodyGrants.requestHash}`
    .mapWith(civicCustodyGrants.requestHash).as('snapshot_grant_request_hash'),
  needId: sql`${civicCustodyGrants.needId}`
    .mapWith(civicCustodyGrants.needId).as('snapshot_grant_need_id'),
  ownerActorKey: sql`${civicCustodyGrants.ownerActorKey}`
    .mapWith(civicCustodyGrants.ownerActorKey).as('snapshot_grant_owner_actor_key'),
  grantorUserId: sql`${civicCustodyGrants.grantorUserId}`
    .mapWith(civicCustodyGrants.grantorUserId).as('snapshot_grant_grantor_user_id'),
  recipientType: sql`${civicCustodyGrants.recipientType}`
    .mapWith(civicCustodyGrants.recipientType).as('snapshot_grant_recipient_type'),
  recipientCircleId: sql`${civicCustodyGrants.recipientCircleId}`
    .mapWith(civicCustodyGrants.recipientCircleId).as('snapshot_grant_recipient_circle_id'),
  payloadJson: sql`${civicCustodyGrants.payloadJson}`
    .mapWith(civicCustodyGrants.payloadJson).as('snapshot_grant_payload_json'),
  expiresAt: sql`${civicCustodyGrants.expiresAt}`
    .mapWith(civicCustodyGrants.expiresAt).as('snapshot_grant_expires_at'),
  revokedAt: sql`${civicCustodyGrants.revokedAt}`
    .mapWith(civicCustodyGrants.revokedAt).as('snapshot_grant_revoked_at'),
  closedAt: sql`${civicCustodyGrants.closedAt}`
    .mapWith(civicCustodyGrants.closedAt).as('snapshot_grant_closed_at'),
  closedReason: sql`${civicCustodyGrants.closedReason}`
    .mapWith(civicCustodyGrants.closedReason).as('snapshot_grant_closed_reason'),
  createdAt: sql`${civicCustodyGrants.createdAt}`
    .mapWith(civicCustodyGrants.createdAt).as('snapshot_grant_created_at'),
};

const snapshotDecisionColumns = {
  rowId: sql`${civicCustodyCoordinationDecisions.id}`
    .mapWith(civicCustodyCoordinationDecisions.id).as('snapshot_decision_row_id'),
  decisionId: sql`${civicCustodyCoordinationDecisions.decisionId}`
    .mapWith(civicCustodyCoordinationDecisions.decisionId).as('snapshot_decision_id'),
  proposalId: sql`${civicCustodyCoordinationDecisions.proposalId}`
    .mapWith(civicCustodyCoordinationDecisions.proposalId).as('snapshot_decision_proposal_id'),
  idempotencyKey: sql`${civicCustodyCoordinationDecisions.idempotencyKey}`
    .mapWith(civicCustodyCoordinationDecisions.idempotencyKey).as('snapshot_decision_idempotency_key'),
  requestHash: sql`${civicCustodyCoordinationDecisions.requestHash}`
    .mapWith(civicCustodyCoordinationDecisions.requestHash).as('snapshot_decision_request_hash'),
  deciderUserId: sql`${civicCustodyCoordinationDecisions.deciderUserId}`
    .mapWith(civicCustodyCoordinationDecisions.deciderUserId).as('snapshot_decision_decider_user_id'),
  ownerActorKey: sql`${civicCustodyCoordinationDecisions.ownerActorKey}`
    .mapWith(civicCustodyCoordinationDecisions.ownerActorKey).as('snapshot_decision_owner_actor_key'),
  decision: sql`${civicCustodyCoordinationDecisions.decision}`
    .mapWith(civicCustodyCoordinationDecisions.decision).as('snapshot_decision_value'),
  createdAt: sql`${civicCustodyCoordinationDecisions.createdAt}`
    .mapWith(civicCustodyCoordinationDecisions.createdAt).as('snapshot_decision_created_at'),
};

export class PostgresCustodyCoordinationStore implements CustodyCoordinationStore {
  constructor(private readonly database: CoordinationDatabaseExecutor = db) {}

  async runInTransaction<T>(operation: (store: CustodyCoordinationStore) => Promise<T>): Promise<T> {
    return civicTransactionDb.transaction(async (tx) => operation(new PostgresCustodyCoordinationStore(
      tx as unknown as CoordinationDatabaseExecutor,
    )));
  }

  async currentTimestamp(): Promise<string> {
    const [row] = await this.database.select({
      value: sql`clock_timestamp()`.mapWith(civicCustodyGrants.createdAt),
    }).from(users).limit(1);
    if (!row) throw new Error('civic custody coordination database clock unavailable');
    return row.value;
  }

  async isActiveUser(userId: number): Promise<boolean> {
    const [row] = await this.database.select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1);
    return Boolean(row);
  }

  async getDevice(actorKey: string): Promise<CustodyDeviceRecord | null> {
    const [row] = await this.database.select({
      actorKey: civicDevices.actorKey,
      linkedUserId: civicDevices.linkedUserId,
      revokedAt: civicDevices.revokedAt,
    }).from(civicDevices).where(eq(civicDevices.actorKey, actorKey)).limit(1);
    return row ?? null;
  }

  async isCircleCoordinator(circleId: number, userId: number): Promise<boolean> {
    const [row] = await this.database.select({ id: circleMembers.id })
      .from(circleMembers)
      .innerJoin(circles, eq(circles.id, circleMembers.circleId))
      .innerJoin(users, eq(users.id, circleMembers.userId))
      .where(and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
        eq(users.isActive, true),
        or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true)),
      ))
      .limit(1);
    return Boolean(row);
  }

  async hasAvailableCircleCoordinator(circleId: number, excludedUserId: number): Promise<boolean> {
    const [row] = await this.database.select({ id: circleMembers.id })
      .from(circleMembers)
      .innerJoin(circles, eq(circles.id, circleMembers.circleId))
      .innerJoin(users, eq(users.id, circleMembers.userId))
      .where(and(
        eq(circleMembers.circleId, circleId),
        ne(circleMembers.userId, excludedUserId),
        eq(circleMembers.role, 'coordinador'),
        eq(users.isActive, true),
        or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true)),
      ))
      .limit(1);
    return Boolean(row);
  }

  async getGrant(grantId: string): Promise<StoredCustodyGrant | null> {
    const [row] = await this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .where(eq(civicCustodyGrants.grantId, grantId))
      .limit(1);
    return row ?? null;
  }

  async getGrantForUpdate(grantId: string): Promise<StoredCustodyGrant | null> {
    const [row] = await this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .where(eq(civicCustodyGrants.grantId, grantId))
      .limit(1)
      .for('update', { of: civicCustodyGrants });
    return row ?? null;
  }

  async getLatestAppliedResponse(grantId: string): Promise<StoredCustodyGrantResponse | null> {
    const [row] = await this.database.select(responseColumns)
      .from(civicCustodyGrantResponses)
      .where(and(
        eq(civicCustodyGrantResponses.grantId, grantId),
        eq(civicCustodyGrantResponses.applied, true),
      ))
      .orderBy(desc(civicCustodyGrantResponses.id))
      .limit(1);
    return row ?? null;
  }

  async findProposalConflicts(
    proposalId: string,
    proposerUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyCoordinationProposal[]> {
    return this.database.select(proposalColumns)
      .from(civicCustodyCoordinationProposals)
      .where(or(
        eq(civicCustodyCoordinationProposals.proposalId, proposalId),
        and(
          eq(civicCustodyCoordinationProposals.proposerUserId, proposerUserId),
          eq(civicCustodyCoordinationProposals.idempotencyKey, idempotencyKey),
        ),
      ));
  }

  async getProposal(proposalId: string): Promise<StoredCustodyCoordinationProposal | null> {
    const [row] = await this.database.select(proposalColumns)
      .from(civicCustodyCoordinationProposals)
      .where(eq(civicCustodyCoordinationProposals.proposalId, proposalId))
      .limit(1);
    return row ?? null;
  }

  async getProposalForGrant(grantId: string): Promise<StoredCustodyCoordinationProposal | null> {
    const [row] = await this.database.select(proposalColumns)
      .from(civicCustodyCoordinationProposals)
      .where(eq(civicCustodyCoordinationProposals.grantId, grantId))
      .limit(1);
    return row ?? null;
  }

  async getProposalForUpdate(proposalId: string): Promise<StoredCustodyCoordinationProposal | null> {
    const [row] = await this.database.select(proposalColumns)
      .from(civicCustodyCoordinationProposals)
      .where(eq(civicCustodyCoordinationProposals.proposalId, proposalId))
      .limit(1)
      .for('update', { of: civicCustodyCoordinationProposals });
    return row ?? null;
  }

  async insertProposal(
    input: Omit<StoredCustodyCoordinationProposal, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyCoordinationProposal | null> {
    const [row] = await this.database.insert(civicCustodyCoordinationProposals)
      .values(input)
      .onConflictDoNothing()
      .returning(proposalColumns);
    return row ?? null;
  }

  async findDecisionConflicts(
    decisionId: string,
    deciderUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyCoordinationDecision[]> {
    return this.database.select(decisionColumns)
      .from(civicCustodyCoordinationDecisions)
      .where(or(
        eq(civicCustodyCoordinationDecisions.decisionId, decisionId),
        and(
          eq(civicCustodyCoordinationDecisions.deciderUserId, deciderUserId),
          eq(civicCustodyCoordinationDecisions.idempotencyKey, idempotencyKey),
        ),
      ));
  }

  async getDecision(proposalId: string): Promise<StoredCustodyCoordinationDecision | null> {
    const [row] = await this.database.select(decisionColumns)
      .from(civicCustodyCoordinationDecisions)
      .where(eq(civicCustodyCoordinationDecisions.proposalId, proposalId))
      .limit(1);
    return row ?? null;
  }

  async insertDecision(
    input: Omit<StoredCustodyCoordinationDecision, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyCoordinationDecision | null> {
    const [row] = await this.database.insert(civicCustodyCoordinationDecisions)
      .values(input)
      .onConflictDoNothing()
      .returning(decisionColumns);
    return row ?? null;
  }

  async listCoordinatorRecords(
    userId: number,
    limit: number,
    page: CustodyPageRequest | null,
  ): Promise<CustodyCoordinationCoordinatorSnapshot> {
    // PostgreSQL fija statement_timestamp() al comienzo de esta única
    // sentencia. La ACL, el conjunto visible y refreshedAt comparten entonces
    // el mismo snapshot MVCC y el mismo corte temporal, aun con una bandeja
    // vacía o una escritura concurrente.
    const currentNow = sql`statement_timestamp()`.mapWith(civicCustodyCoordinationProposals.createdAt);
    const statementNow = sql`date_trunc('milliseconds', statement_timestamp())`
      .mapWith(civicCustodyCoordinationProposals.createdAt);
    const snapshotAt = page
      ? sql`LEAST(${page.asOf}::timestamptz, date_trunc('milliseconds', statement_timestamp()))`
        .mapWith(civicCustodyCoordinationProposals.createdAt)
      : statementNow;
    const after = page
      ? sql`${civicCustodyCoordinationProposals.id} < ${page.after.rowId}`
      : undefined;
    const visibleRecords = this.database.select({
      proposal: snapshotProposalColumns,
      grant: snapshotGrantColumns,
      decision: snapshotDecisionColumns,
    }).from(civicCustodyCoordinationProposals)
      .innerJoin(civicCustodyGrants, eq(civicCustodyGrants.grantId, civicCustodyCoordinationProposals.grantId))
      .innerJoin(circleMembers, and(
        eq(circleMembers.circleId, civicCustodyGrants.recipientCircleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
      ))
      .innerJoin(circles, eq(circles.id, civicCustodyGrants.recipientCircleId))
      .leftJoin(
        civicCustodyCoordinationDecisions,
        and(
          eq(civicCustodyCoordinationDecisions.proposalId, civicCustodyCoordinationProposals.proposalId),
          lte(civicCustodyCoordinationDecisions.createdAt, snapshotAt),
        ),
      )
      .where(and(
        isNull(civicCustodyGrants.revokedAt),
        isNull(civicCustodyGrants.closedAt),
        ne(civicCustodyGrants.grantorUserId, userId),
        lte(civicCustodyGrants.createdAt, snapshotAt),
        lte(civicCustodyCoordinationProposals.createdAt, snapshotAt),
        // El cursor es estricto pero no está firmado: un `asOf` histórico no
        // puede volver operable una propuesta que ya venció.
        gt(civicCustodyGrants.expiresAt, currentNow),
        gt(civicCustodyCoordinationProposals.expiresAt, currentNow),
        or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true)),
        after,
      ))
      .orderBy(desc(civicCustodyCoordinationProposals.id))
      .limit(limit)
      .as('visible_custody_coordination_records');

    const rows = await this.database.select({
      proposal: visibleRecords.proposal,
      grant: visibleRecords.grant,
      decision: visibleRecords.decision,
      refreshedAt: snapshotAt,
    }).from(users)
      // El LEFT JOIN produce una fila centinela para una bandeja vacía. Si la
      // cuenta no está activa, el WHERE no devuelve ni siquiera esa fila.
      .leftJoin(visibleRecords, sql`TRUE`)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .orderBy(desc(visibleRecords.proposal.rowId));

    if (rows.length === 0) {
      return { authorized: false, records: [], refreshedAt: null };
    }

    return {
      authorized: true,
      records: rows.flatMap((row): CustodyCoordinationRecord[] => (
        row.proposal?.rowId == null || row.grant?.rowId == null
          ? []
          : [{
            proposal: row.proposal as StoredCustodyCoordinationProposal,
            grant: row.grant as StoredCustodyGrant,
            decision: row.decision?.rowId == null
              ? null
              : row.decision as StoredCustodyCoordinationDecision,
          }]
      )),
      refreshedAt: rows[0].refreshedAt,
    };
  }
}
