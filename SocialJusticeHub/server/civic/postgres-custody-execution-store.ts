import { and, desc, eq, lte, or, sql } from 'drizzle-orm';

import {
  circles,
  circleMembers,
  civicCustodyCoordinationDecisions,
  civicCustodyCoordinationProposals,
  civicCustodyExecutionCommands,
  civicCustodyExecutions,
  civicCustodyGrants,
  civicDevices,
  users,
} from '@shared/schema';
import { civicTransactionDb, db } from '../db';
import {
  virtualCustodyExecutionRoot,
  type CustodyExecutionCoordinatorSnapshot,
  type CustodyExecutionRecord,
  type CustodyExecutionStore,
  type StoredCustodyExecutionCommand,
  type StoredCustodyExecutionRoot,
} from './custody-execution';
import type {
  StoredCustodyCoordinationDecision,
  StoredCustodyCoordinationProposal,
} from './custody-coordination';
import type { CustodyDeviceRecord, StoredCustodyGrant } from './custody-grants';
import type { CustodyPageRequest } from './custody-pagination';
import { custodyTimestampToIsoUtc } from './custody-timestamps';

type ExecutionDatabaseExecutor = Pick<typeof db, 'select' | 'insert'>;

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

const rootColumns = {
  rowId: civicCustodyExecutions.id,
  proposalId: civicCustodyExecutions.proposalId,
  acceptedDecisionId: civicCustodyExecutions.acceptedDecisionId,
  grantId: civicCustodyExecutions.grantId,
  proposerUserId: civicCustodyExecutions.proposerUserId,
  grantorUserId: civicCustodyExecutions.grantorUserId,
  ownerActorKey: civicCustodyExecutions.ownerActorKey,
  quantity: civicCustodyExecutions.quantity,
  unit: civicCustodyExecutions.unit,
  expiresAt: civicCustodyExecutions.expiresAt,
  acceptedAt: civicCustodyExecutions.acceptedAt,
  createdAt: civicCustodyExecutions.createdAt,
};

const commandColumns = {
  rowId: civicCustodyExecutionCommands.id,
  eventId: civicCustodyExecutionCommands.eventId,
  proposalId: civicCustodyExecutionCommands.proposalId,
  idempotencyKey: civicCustodyExecutionCommands.idempotencyKey,
  requestHash: civicCustodyExecutionCommands.requestHash,
  actorRole: civicCustodyExecutionCommands.actorRole,
  actorUserId: civicCustodyExecutionCommands.actorUserId,
  ownerActorKey: civicCustodyExecutionCommands.ownerActorKey,
  eventType: civicCustodyExecutionCommands.eventType,
  expectedVersion: civicCustodyExecutionCommands.expectedVersion,
  quantity: civicCustodyExecutionCommands.quantity,
  unit: civicCustodyExecutionCommands.unit,
  receiptOutcome: civicCustodyExecutionCommands.receiptOutcome,
  followUpOutcome: civicCustodyExecutionCommands.followUpOutcome,
  applied: civicCustodyExecutionCommands.applied,
  rejectionReason: civicCustodyExecutionCommands.rejectionReason,
  sequence: civicCustodyExecutionCommands.sequence,
  eventVersion: civicCustodyExecutionCommands.eventVersion,
  createdAt: civicCustodyExecutionCommands.createdAt,
};

// JSON estructurado evita colisiones de aliases dentro del derived table que
// produce fila centinela. Es un detalle privado del store, nunca una columna
// JSON persistida ni una respuesta de API.
const snapshotProposalJson = sql<StoredCustodyCoordinationProposal>`jsonb_build_object(
  'rowId', ${civicCustodyCoordinationProposals.id},
  'proposalId', ${civicCustodyCoordinationProposals.proposalId},
  'grantId', ${civicCustodyCoordinationProposals.grantId},
  'sourceResponseId', ${civicCustodyCoordinationProposals.sourceResponseId},
  'idempotencyKey', ${civicCustodyCoordinationProposals.idempotencyKey},
  'requestHash', ${civicCustodyCoordinationProposals.requestHash},
  'proposerUserId', ${civicCustodyCoordinationProposals.proposerUserId},
  'quantity', ${civicCustodyCoordinationProposals.quantity},
  'unit', ${civicCustodyCoordinationProposals.unit},
  'expiresAt', ${civicCustodyCoordinationProposals.expiresAt},
  'createdAt', ${civicCustodyCoordinationProposals.createdAt}
)`.as('snapshot_execution_proposal');

const snapshotDecisionJson = sql<StoredCustodyCoordinationDecision>`jsonb_build_object(
  'rowId', ${civicCustodyCoordinationDecisions.id},
  'decisionId', ${civicCustodyCoordinationDecisions.decisionId},
  'proposalId', ${civicCustodyCoordinationDecisions.proposalId},
  'idempotencyKey', ${civicCustodyCoordinationDecisions.idempotencyKey},
  'requestHash', ${civicCustodyCoordinationDecisions.requestHash},
  'deciderUserId', ${civicCustodyCoordinationDecisions.deciderUserId},
  'ownerActorKey', ${civicCustodyCoordinationDecisions.ownerActorKey},
  'decision', ${civicCustodyCoordinationDecisions.decision},
  'createdAt', ${civicCustodyCoordinationDecisions.createdAt}
)`.as('snapshot_execution_decision');

const snapshotGrantJson = sql<StoredCustodyGrant>`jsonb_build_object(
  'rowId', ${civicCustodyGrants.id},
  'grantId', ${civicCustodyGrants.grantId},
  'idempotencyKey', ${civicCustodyGrants.idempotencyKey},
  'requestHash', ${civicCustodyGrants.requestHash},
  'needId', ${civicCustodyGrants.needId},
  'ownerActorKey', ${civicCustodyGrants.ownerActorKey},
  'grantorUserId', ${civicCustodyGrants.grantorUserId},
  'recipientType', ${civicCustodyGrants.recipientType},
  'recipientCircleId', ${civicCustodyGrants.recipientCircleId},
  'payloadJson', ${civicCustodyGrants.payloadJson},
  'expiresAt', ${civicCustodyGrants.expiresAt},
  'revokedAt', ${civicCustodyGrants.revokedAt},
  'closedAt', ${civicCustodyGrants.closedAt},
  'closedReason', ${civicCustodyGrants.closedReason},
  'createdAt', ${civicCustodyGrants.createdAt}
)`.as('snapshot_execution_grant');

const snapshotRootJson = sql<StoredCustodyExecutionRoot>`jsonb_build_object(
  'rowId', ${civicCustodyExecutions.id},
  'proposalId', ${civicCustodyExecutions.proposalId},
  'acceptedDecisionId', ${civicCustodyExecutions.acceptedDecisionId},
  'grantId', ${civicCustodyExecutions.grantId},
  'proposerUserId', ${civicCustodyExecutions.proposerUserId},
  'grantorUserId', ${civicCustodyExecutions.grantorUserId},
  'ownerActorKey', ${civicCustodyExecutions.ownerActorKey},
  'quantity', ${civicCustodyExecutions.quantity},
  'unit', ${civicCustodyExecutions.unit},
  'expiresAt', ${civicCustodyExecutions.expiresAt},
  'acceptedAt', ${civicCustodyExecutions.acceptedAt},
  'createdAt', ${civicCustodyExecutions.createdAt}
)`.as('snapshot_execution_root');

const asRecord = (
  row: {
    proposal: StoredCustodyCoordinationProposal;
    decision: StoredCustodyCoordinationDecision;
    grant: StoredCustodyGrant;
    root: StoredCustodyExecutionRoot | null;
  },
  commands: StoredCustodyExecutionCommand[],
  coordinatorAvailable: boolean,
): CustodyExecutionRecord => ({
  proposal: row.proposal,
  decision: row.decision,
  grant: row.grant,
  root: row.root ?? virtualCustodyExecutionRoot(row.proposal, row.decision, row.grant),
  commands,
  coordinatorAvailable,
});

export class PostgresCustodyExecutionStore implements CustodyExecutionStore {
  constructor(private readonly database: ExecutionDatabaseExecutor = db) {}

  async runInTransaction<T>(operation: (store: CustodyExecutionStore) => Promise<T>): Promise<T> {
    return civicTransactionDb.transaction(async (tx) => operation(new PostgresCustodyExecutionStore(
      tx as unknown as ExecutionDatabaseExecutor,
    )));
  }

  async currentTimestamp(): Promise<string> {
    const [row] = await this.database.select({
      value: sql`date_trunc('milliseconds', clock_timestamp())`
        .mapWith(civicCustodyExecutionCommands.createdAt),
    }).from(users).limit(1);
    if (!row) throw new Error('civic custody execution database clock unavailable');
    return row.value;
  }

  async lockActiveUser(userId: number): Promise<boolean> {
    const [row] = await this.database.select({ active: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .for('update', { of: users });
    return row?.active === true;
  }

  async lockDevice(actorKey: string): Promise<CustodyDeviceRecord | null> {
    const [row] = await this.database.select({
      actorKey: civicDevices.actorKey,
      linkedUserId: civicDevices.linkedUserId,
      revokedAt: civicDevices.revokedAt,
    }).from(civicDevices)
      .where(eq(civicDevices.actorKey, actorKey))
      .limit(1)
      .for('update', { of: civicDevices });
    return row ?? null;
  }

  async lockCircleCoordinator(circleId: number, userId: number): Promise<boolean> {
    const [row] = await this.database.select({ role: circleMembers.role })
      .from(circleMembers)
      .where(and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId),
      ))
      .limit(1)
      .for('update', { of: circleMembers });
    return row?.role === 'coordinador';
  }

  async lockCircle(circleId: number): Promise<boolean> {
    const [row] = await this.database.select({
      kind: circles.kind,
      isPrivate: circles.isPrivate,
    }).from(circles)
      .where(eq(circles.id, circleId))
      .limit(1)
      .for('update', { of: circles });
    return row?.kind === 'celula' || row?.isPrivate === true;
  }

  async getGrantForUpdate(grantId: string): Promise<StoredCustodyGrant | null> {
    const [row] = await this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .where(eq(civicCustodyGrants.grantId, grantId))
      .limit(1)
      .for('update', { of: civicCustodyGrants });
    return row ?? null;
  }

  async getProposal(proposalId: string): Promise<StoredCustodyCoordinationProposal | null> {
    const [row] = await this.database.select(proposalColumns)
      .from(civicCustodyCoordinationProposals)
      .where(eq(civicCustodyCoordinationProposals.proposalId, proposalId))
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

  async getDecisionForUpdate(proposalId: string): Promise<StoredCustodyCoordinationDecision | null> {
    const [row] = await this.database.select(decisionColumns)
      .from(civicCustodyCoordinationDecisions)
      .where(eq(civicCustodyCoordinationDecisions.proposalId, proposalId))
      .limit(1)
      .for('update', { of: civicCustodyCoordinationDecisions });
    return row ?? null;
  }

  async getExecutionRootForUpdate(proposalId: string): Promise<StoredCustodyExecutionRoot | null> {
    const [row] = await this.database.select(rootColumns)
      .from(civicCustodyExecutions)
      .where(eq(civicCustodyExecutions.proposalId, proposalId))
      .limit(1)
      .for('update', { of: civicCustodyExecutions });
    return row ?? null;
  }

  async insertExecutionRoot(
    input: Omit<StoredCustodyExecutionRoot, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyExecutionRoot | null> {
    const [row] = await this.database.insert(civicCustodyExecutions)
      .values(input)
      .onConflictDoNothing()
      .returning(rootColumns);
    return row ?? null;
  }

  async getCommands(proposalId: string): Promise<StoredCustodyExecutionCommand[]> {
    return this.database.select(commandColumns)
      .from(civicCustodyExecutionCommands)
      .where(eq(civicCustodyExecutionCommands.proposalId, proposalId))
      .orderBy(civicCustodyExecutionCommands.id);
  }

  async findCommandConflicts(
    eventId: string,
    actorUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyExecutionCommand[]> {
    return this.database.select(commandColumns)
      .from(civicCustodyExecutionCommands)
      .where(or(
        eq(civicCustodyExecutionCommands.eventId, eventId),
        and(
          eq(civicCustodyExecutionCommands.actorUserId, actorUserId),
          eq(civicCustodyExecutionCommands.idempotencyKey, idempotencyKey),
        ),
      ));
  }

  async insertCommand(
    input: Omit<StoredCustodyExecutionCommand, 'rowId'>,
  ): Promise<StoredCustodyExecutionCommand | null> {
    const [row] = await this.database.insert(civicCustodyExecutionCommands)
      .values(input)
      .onConflictDoNothing()
      .returning(commandColumns);
    return row ?? null;
  }

  private async coordinatorAvailable(circleId: number, userId: number): Promise<boolean> {
    const [row] = await this.database.select({ memberId: circleMembers.id })
      .from(circleMembers)
      .innerJoin(users, eq(users.id, circleMembers.userId))
      .innerJoin(circles, eq(circles.id, circleMembers.circleId))
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

  async getRecord(proposalId: string): Promise<CustodyExecutionRecord | null> {
    const [row] = await this.database.select({
      proposal: proposalColumns,
      decision: decisionColumns,
      grant: grantColumns,
      root: rootColumns,
    }).from(civicCustodyCoordinationProposals)
      .innerJoin(
        civicCustodyCoordinationDecisions,
        eq(civicCustodyCoordinationDecisions.proposalId, civicCustodyCoordinationProposals.proposalId),
      )
      .innerJoin(civicCustodyGrants, eq(civicCustodyGrants.grantId, civicCustodyCoordinationProposals.grantId))
      .leftJoin(civicCustodyExecutions, eq(civicCustodyExecutions.proposalId, civicCustodyCoordinationProposals.proposalId))
      .where(and(
        eq(civicCustodyCoordinationProposals.proposalId, proposalId),
        eq(civicCustodyCoordinationDecisions.decision, 'accept'),
      ))
      .limit(1);
    if (!row) return null;
    const commands = await this.getCommands(proposalId);
    return asRecord(
      {
        proposal: row.proposal,
        decision: row.decision,
        grant: row.grant,
        root: row.root?.rowId == null ? null : row.root,
      },
      commands,
      await this.coordinatorAvailable(row.grant.recipientCircleId, row.proposal.proposerUserId),
    );
  }

  async listCoordinatorRecords(
    userId: number,
    limit: number,
    page: CustodyPageRequest | null,
  ): Promise<CustodyExecutionCoordinatorSnapshot> {
    // ACL, filas, ledger applied y refreshedAt nacen en una única sentencia
    // centinela. No hay N+1 ni evento futuro colado en un snapshot anterior.
    const snapshotAt = page
      ? sql`LEAST(${page.asOf}::timestamptz, date_trunc('milliseconds', statement_timestamp()))`
        .mapWith(civicCustodyExecutionCommands.createdAt)
      : sql`date_trunc('milliseconds', statement_timestamp())`
        .mapWith(civicCustodyExecutionCommands.createdAt);
    const after = page
      ? sql`${civicCustodyCoordinationProposals.id} < ${page.after.rowId}`
      : undefined;

    const visibleRecords = this.database.select({
      rowId: sql`${civicCustodyCoordinationProposals.id}`
        .mapWith(civicCustodyCoordinationProposals.id)
        .as('snapshot_execution_row_id'),
      proposal: snapshotProposalJson,
      decision: snapshotDecisionJson,
      grant: snapshotGrantJson,
      root: snapshotRootJson,
      commands: sql<StoredCustodyExecutionCommand[]>`COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'rowId', execution_command.id,
          'eventId', execution_command.event_id,
          'proposalId', execution_command.proposal_id,
          'idempotencyKey', execution_command.idempotency_key,
          'requestHash', execution_command.request_hash,
          'actorRole', execution_command.actor_role,
          'actorUserId', execution_command.actor_user_id,
          'ownerActorKey', execution_command.owner_actor_key,
          'eventType', execution_command.event_type,
          'expectedVersion', execution_command.expected_version,
          'quantity', execution_command.quantity,
          'unit', execution_command.unit,
          'receiptOutcome', execution_command.receipt_outcome,
          'followUpOutcome', execution_command.follow_up_outcome,
          'applied', execution_command.applied,
          'rejectionReason', execution_command.rejection_reason,
          'sequence', execution_command.sequence,
          'eventVersion', execution_command.event_version,
          'createdAt', execution_command.created_at
        ) ORDER BY execution_command.sequence)
        FROM civic_custody_execution_commands AS execution_command
        WHERE execution_command.proposal_id = ${civicCustodyCoordinationProposals.proposalId}
          AND execution_command.applied = TRUE
          AND execution_command.created_at <= ${snapshotAt}
      ), '[]'::jsonb)`.as('snapshot_execution_commands'),
    }).from(civicCustodyCoordinationProposals)
      .innerJoin(
        civicCustodyCoordinationDecisions,
        and(
          eq(civicCustodyCoordinationDecisions.proposalId, civicCustodyCoordinationProposals.proposalId),
          eq(civicCustodyCoordinationDecisions.decision, 'accept'),
        ),
      )
      .innerJoin(civicCustodyGrants, eq(civicCustodyGrants.grantId, civicCustodyCoordinationProposals.grantId))
      .innerJoin(circleMembers, and(
        eq(circleMembers.circleId, civicCustodyGrants.recipientCircleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
      ))
      .innerJoin(circles, eq(circles.id, circleMembers.circleId))
      .leftJoin(civicCustodyExecutions, eq(civicCustodyExecutions.proposalId, civicCustodyCoordinationProposals.proposalId))
      .where(and(
        eq(civicCustodyCoordinationProposals.proposerUserId, userId),
        lte(civicCustodyCoordinationProposals.createdAt, snapshotAt),
        lte(civicCustodyCoordinationDecisions.createdAt, snapshotAt),
        or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true)),
        after,
      ))
      .orderBy(desc(civicCustodyCoordinationProposals.id))
      .limit(limit)
      .as('visible_custody_execution_records');

    const rows = await this.database.select({
      rowId: visibleRecords.rowId,
      proposal: visibleRecords.proposal,
      decision: visibleRecords.decision,
      grant: visibleRecords.grant,
      root: visibleRecords.root,
      commands: visibleRecords.commands,
      refreshedAt: snapshotAt,
    }).from(users)
      .leftJoin(visibleRecords, sql`TRUE`)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .orderBy(desc(visibleRecords.rowId));

    if (rows.length === 0) {
      return { authorized: false, records: [], refreshedAt: null };
    }
    const refreshedAt = custodyTimestampToIsoUtc(
      rows[0]!.refreshedAt,
      '$.custodyExecutionInbox.refreshedAt',
    );
    const visibleRows = rows.filter((row) => row.rowId != null && row.proposal != null);
    if (visibleRows.length === 0) {
      return { authorized: true, records: [], refreshedAt };
    }
    return {
      authorized: true,
      records: visibleRows.map((row) => asRecord(
        {
          proposal: row.proposal!,
          decision: row.decision!,
          grant: row.grant!,
          root: row.root?.rowId == null ? null : row.root,
        },
        row.commands ?? [],
        true,
      )),
      refreshedAt,
    };
  }
}
