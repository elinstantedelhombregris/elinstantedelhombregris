import { and, desc, eq, gt, inArray, isNull, lte, or, sql } from 'drizzle-orm';

import {
  circles,
  circleMembers,
  civicCustodyGrantResponses,
  civicCustodyGrantRevocations,
  civicCustodyGrants,
  civicCustodyCoordinationProposals,
  civicDevices,
  civicEntityOwners,
  users,
} from '@shared/schema';
import { civicTransactionDb, db } from '../db';
import type {
  CustodyCircleAccess,
  CustodyDeviceRecord,
  CustodyGrantInboxSnapshot,
  CustodyGrantStore,
  CustodyNeedOwnerRecord,
  StoredCustodyGrant,
  StoredCustodyGrantResponse,
  StoredCustodyRevocation,
} from './custody-grants';
import type { CustodyPageRequest } from './custody-pagination';

type CustodyDatabaseExecutor = Pick<
  typeof db,
  'select' | 'selectDistinctOn' | 'insert' | 'update' | 'delete'
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

// Aliases únicos para poder envolver la página visible en un derived table y
// producir una fila centinela cuando el inbox está vacío, todo en una sentencia.
const inboxGrantColumns = {
  rowId: sql`${civicCustodyGrants.id}`.mapWith(civicCustodyGrants.id).as('inbox_grant_row_id'),
  grantId: sql`${civicCustodyGrants.grantId}`.mapWith(civicCustodyGrants.grantId).as('inbox_grant_id'),
  idempotencyKey: sql`${civicCustodyGrants.idempotencyKey}`
    .mapWith(civicCustodyGrants.idempotencyKey).as('inbox_grant_idempotency_key'),
  requestHash: sql`${civicCustodyGrants.requestHash}`
    .mapWith(civicCustodyGrants.requestHash).as('inbox_grant_request_hash'),
  needId: sql`${civicCustodyGrants.needId}`.mapWith(civicCustodyGrants.needId).as('inbox_grant_need_id'),
  ownerActorKey: sql`${civicCustodyGrants.ownerActorKey}`
    .mapWith(civicCustodyGrants.ownerActorKey).as('inbox_grant_owner_actor_key'),
  grantorUserId: sql`${civicCustodyGrants.grantorUserId}`
    .mapWith(civicCustodyGrants.grantorUserId).as('inbox_grant_grantor_user_id'),
  recipientType: sql`${civicCustodyGrants.recipientType}`
    .mapWith(civicCustodyGrants.recipientType).as('inbox_grant_recipient_type'),
  recipientCircleId: sql`${civicCustodyGrants.recipientCircleId}`
    .mapWith(civicCustodyGrants.recipientCircleId).as('inbox_grant_recipient_circle_id'),
  payloadJson: sql`${civicCustodyGrants.payloadJson}`
    .mapWith(civicCustodyGrants.payloadJson).as('inbox_grant_payload_json'),
  expiresAt: sql`${civicCustodyGrants.expiresAt}`
    .mapWith(civicCustodyGrants.expiresAt).as('inbox_grant_expires_at'),
  revokedAt: sql`${civicCustodyGrants.revokedAt}`
    .mapWith(civicCustodyGrants.revokedAt).as('inbox_grant_revoked_at'),
  closedAt: sql`${civicCustodyGrants.closedAt}`
    .mapWith(civicCustodyGrants.closedAt).as('inbox_grant_closed_at'),
  closedReason: sql`${civicCustodyGrants.closedReason}`
    .mapWith(civicCustodyGrants.closedReason).as('inbox_grant_closed_reason'),
  createdAt: sql`${civicCustodyGrants.createdAt}`
    .mapWith(civicCustodyGrants.createdAt).as('inbox_grant_created_at'),
};

const inboxResponseColumns = {
  rowId: sql`${civicCustodyGrantResponses.id}`
    .mapWith(civicCustodyGrantResponses.id).as('inbox_response_row_id'),
  responseId: sql`${civicCustodyGrantResponses.responseId}`
    .mapWith(civicCustodyGrantResponses.responseId).as('inbox_response_id'),
  idempotencyKey: sql`${civicCustodyGrantResponses.idempotencyKey}`
    .mapWith(civicCustodyGrantResponses.idempotencyKey).as('inbox_response_idempotency_key'),
  requestHash: sql`${civicCustodyGrantResponses.requestHash}`
    .mapWith(civicCustodyGrantResponses.requestHash).as('inbox_response_request_hash'),
  grantId: sql`${civicCustodyGrantResponses.grantId}`
    .mapWith(civicCustodyGrantResponses.grantId).as('inbox_response_grant_id'),
  responderUserId: sql`${civicCustodyGrantResponses.responderUserId}`
    .mapWith(civicCustodyGrantResponses.responderUserId).as('inbox_response_responder_user_id'),
  disposition: sql`${civicCustodyGrantResponses.disposition}`
    .mapWith(civicCustodyGrantResponses.disposition).as('inbox_response_disposition'),
  quantity: sql`${civicCustodyGrantResponses.quantity}`
    .mapWith(civicCustodyGrantResponses.quantity).as('inbox_response_quantity'),
  unit: sql`${civicCustodyGrantResponses.unit}`
    .mapWith(civicCustodyGrantResponses.unit).as('inbox_response_unit'),
  applied: sql`${civicCustodyGrantResponses.applied}`
    .mapWith(civicCustodyGrantResponses.applied).as('inbox_response_applied'),
  createdAt: sql`${civicCustodyGrantResponses.createdAt}`
    .mapWith(civicCustodyGrantResponses.createdAt).as('inbox_response_created_at'),
};

export class PostgresCustodyGrantStore implements CustodyGrantStore {
  constructor(private readonly database: CustodyDatabaseExecutor = db) {}

  async runInTransaction<T>(operation: (store: CustodyGrantStore) => Promise<T>): Promise<T> {
    return civicTransactionDb.transaction(async (tx) => operation(new PostgresCustodyGrantStore(
      tx as unknown as CustodyDatabaseExecutor,
    )));
  }

  async getDevice(actorKey: string): Promise<CustodyDeviceRecord | null> {
    const [row] = await this.database.select({
      actorKey: civicDevices.actorKey,
      linkedUserId: civicDevices.linkedUserId,
      revokedAt: civicDevices.revokedAt,
    }).from(civicDevices).where(eq(civicDevices.actorKey, actorKey)).limit(1);
    return row ?? null;
  }

  async isActiveUser(userId: number): Promise<boolean> {
    const [row] = await this.database.select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1);
    return Boolean(row);
  }

  async getCircleAccess(circleId: number, userId: number): Promise<CustodyCircleAccess | null> {
    const [access] = await this.database.select({
      circleId: circles.id,
      kind: circles.kind,
      isPrivate: circles.isPrivate,
      membershipRole: circleMembers.role,
      hasCoordinator: sql<boolean>`EXISTS (
        SELECT 1
        FROM circle_members AS coordinator_membership
        INNER JOIN users AS coordinator_user
          ON coordinator_user.id = coordinator_membership.user_id
        WHERE coordinator_membership.circle_id = ${circles.id}
          AND coordinator_membership.role = 'coordinador'
          AND coordinator_user.is_active = TRUE
      )`,
    }).from(circles)
      .leftJoin(circleMembers, and(
        eq(circleMembers.circleId, circles.id),
        eq(circleMembers.userId, userId),
      ))
      .where(eq(circles.id, circleId))
      .limit(1);
    if (!access) return null;
    return {
      circleId: access.circleId,
      kind: access.kind,
      isPrivate: access.isPrivate === true,
      membershipRole: access.membershipRole ?? null,
      hasCoordinator: access.hasCoordinator === true,
    };
  }

  async isCircleCoordinator(circleId: number, userId: number): Promise<boolean> {
    const custodialCircle = or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true));
    const [row] = await this.database.select({ id: circleMembers.id })
      .from(circleMembers)
      .innerJoin(circles, eq(circles.id, circleMembers.circleId))
      .innerJoin(users, eq(users.id, circleMembers.userId))
      .where(and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
        eq(users.isActive, true),
        custodialCircle,
      ))
      .limit(1);
    return Boolean(row);
  }

  async getNeedOwner(needId: string): Promise<CustodyNeedOwnerRecord | null> {
    const [row] = await this.database.select({
      actorKey: civicEntityOwners.ownerActorKey,
      linkedUserId: civicDevices.linkedUserId,
    }).from(civicEntityOwners)
      .innerJoin(civicDevices, eq(civicDevices.actorKey, civicEntityOwners.ownerActorKey))
      .where(and(
        eq(civicEntityOwners.entityType, 'custody_need'),
        eq(civicEntityOwners.entityId, needId),
      ))
      .limit(1);
    return row ?? null;
  }

  async claimNeedOwner(needId: string, actorKey: string): Promise<'claimed' | 'same' | 'conflict'> {
    const inserted = await this.database.insert(civicEntityOwners).values({
      entityType: 'custody_need',
      entityId: needId,
      ownerActorKey: actorKey,
    }).onConflictDoNothing().returning({ id: civicEntityOwners.id });
    if (inserted.length === 1) return 'claimed';
    const owner = await this.getNeedOwner(needId);
    return owner?.actorKey === actorKey ? 'same' : 'conflict';
  }

  async findGrantConflicts(
    grantId: string,
    grantorUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyGrant[]> {
    return this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .where(or(
        eq(civicCustodyGrants.grantId, grantId),
        and(
          eq(civicCustodyGrants.grantorUserId, grantorUserId),
          eq(civicCustodyGrants.idempotencyKey, idempotencyKey),
        ),
      ));
  }

  async insertGrant(
    input: Omit<StoredCustodyGrant, 'rowId' | 'revokedAt' | 'closedAt' | 'closedReason'>,
  ): Promise<boolean> {
    const rows = await this.database.insert(civicCustodyGrants).values({
      grantId: input.grantId,
      idempotencyKey: input.idempotencyKey,
      requestHash: input.requestHash,
      needId: input.needId,
      ownerActorKey: input.ownerActorKey,
      grantorUserId: input.grantorUserId,
      recipientType: input.recipientType,
      recipientCircleId: input.recipientCircleId,
      payloadJson: input.payloadJson,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    }).onConflictDoNothing().returning({ id: civicCustodyGrants.id });
    return rows.length === 1;
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

  async getRespondableGrant(
    grantId: string,
    userId: number,
    now: string,
  ): Promise<StoredCustodyGrant | null> {
    const custodialCircle = or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true));
    const effectiveNow = sql`GREATEST(${now}::timestamptz, clock_timestamp())`;
    const [row] = await this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .innerJoin(circleMembers, and(
        eq(circleMembers.circleId, civicCustodyGrants.recipientCircleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
      ))
      .innerJoin(circles, eq(circles.id, civicCustodyGrants.recipientCircleId))
      .innerJoin(users, and(
        eq(users.id, circleMembers.userId),
        eq(users.isActive, true),
      ))
      .where(and(
        eq(civicCustodyGrants.grantId, grantId),
        eq(civicCustodyGrants.recipientType, 'circle'),
        isNull(civicCustodyGrants.revokedAt),
        isNull(civicCustodyGrants.closedAt),
        gt(civicCustodyGrants.expiresAt, effectiveNow),
        custodialCircle,
      ))
      .limit(1)
      .for('update', { of: civicCustodyGrants });
    return row ?? null;
  }

  async getOpenGrantForNeed(needId: string): Promise<StoredCustodyGrant | null> {
    const [row] = await this.database.select(grantColumns)
      .from(civicCustodyGrants)
      .where(and(
        eq(civicCustodyGrants.needId, needId),
        isNull(civicCustodyGrants.closedAt),
      ))
      .limit(1);
    return row ?? null;
  }

  async listActiveInbox(
    userId: number,
    limit: number,
    _nowHint: string,
    page: CustodyPageRequest | null,
  ): Promise<CustodyGrantInboxSnapshot> {
    const custodialCircle = or(eq(circles.kind, 'celula'), eq(circles.isPrivate, true));
    const currentNow = sql`statement_timestamp()`.mapWith(civicCustodyGrants.createdAt);
    const statementNow = sql`date_trunc('milliseconds', statement_timestamp())`
      .mapWith(civicCustodyGrants.createdAt);
    const snapshotAt = page
      ? sql`LEAST(${page.asOf}::timestamptz, date_trunc('milliseconds', statement_timestamp()))`
        .mapWith(civicCustodyGrants.createdAt)
      : statementNow;
    const after = page
      ? sql`${civicCustodyGrants.id} < ${page.after.rowId}`
      : undefined;
    const latestResponses = this.database.selectDistinctOn(
      [civicCustodyGrantResponses.grantId],
      inboxResponseColumns,
    ).from(civicCustodyGrantResponses)
      .where(and(
        eq(civicCustodyGrantResponses.applied, true),
        lte(civicCustodyGrantResponses.createdAt, snapshotAt),
      ))
      .orderBy(civicCustodyGrantResponses.grantId, desc(civicCustodyGrantResponses.id))
      .as('latest_custody_inbox_response');
    const visibleRows = this.database.select({
      grant: inboxGrantColumns,
      response: {
        rowId: latestResponses.rowId,
        responseId: latestResponses.responseId,
        idempotencyKey: latestResponses.idempotencyKey,
        requestHash: latestResponses.requestHash,
        grantId: latestResponses.grantId,
        responderUserId: latestResponses.responderUserId,
        disposition: latestResponses.disposition,
        quantity: latestResponses.quantity,
        unit: latestResponses.unit,
        applied: latestResponses.applied,
        createdAt: latestResponses.createdAt,
      },
    })
      .from(civicCustodyGrants)
      .leftJoin(latestResponses, eq(latestResponses.grantId, civicCustodyGrants.grantId))
      .innerJoin(circleMembers, and(
        eq(circleMembers.circleId, civicCustodyGrants.recipientCircleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.role, 'coordinador'),
      ))
      .innerJoin(circles, eq(circles.id, civicCustodyGrants.recipientCircleId))
      .where(and(
        eq(civicCustodyGrants.recipientType, 'circle'),
        isNull(civicCustodyGrants.revokedAt),
        isNull(civicCustodyGrants.closedAt),
        lte(civicCustodyGrants.createdAt, snapshotAt),
        // `asOf` no está firmado. Un cliente puede retrocederlo, pero nunca
        // resucitar un grant que ya venció al momento real de esta página.
        gt(civicCustodyGrants.expiresAt, currentNow),
        custodialCircle,
        after,
      ))
      .orderBy(
        desc(civicCustodyGrants.id),
      )
      .limit(limit)
      .as('visible_custody_grant_rows');

    const rows = await this.database.select({
      grant: visibleRows.grant,
      response: visibleRows.response,
      refreshedAt: snapshotAt,
    })
      .from(users)
      .leftJoin(visibleRows, sql`TRUE`)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .orderBy(desc(visibleRows.grant.rowId));

    if (rows.length === 0) {
      return { authorized: false, rows: [], refreshedAt: null };
    }
    return {
      authorized: true,
      rows: rows.flatMap((row): CustodyGrantInboxSnapshot['rows'] => (
        row.grant?.rowId == null
          ? []
          : [{
            grant: row.grant as StoredCustodyGrant,
            response: row.response?.rowId == null
              ? null
              : row.response as StoredCustodyGrantResponse,
          }]
      )),
      refreshedAt: rows[0].refreshedAt,
    };
  }

  async markGrantExpired(grantId: string, closedAt: string): Promise<boolean> {
    const authoritativeClosedAt = sql`statement_timestamp()`;
    const rows = await this.database.update(civicCustodyGrants)
      .set({
        closedAt: authoritativeClosedAt,
        closedReason: 'expired',
        updatedAt: authoritativeClosedAt,
      })
      .where(and(
        eq(civicCustodyGrants.grantId, grantId),
        isNull(civicCustodyGrants.closedAt),
        lte(civicCustodyGrants.expiresAt, closedAt),
        lte(civicCustodyGrants.expiresAt, authoritativeClosedAt),
      ))
      .returning({ id: civicCustodyGrants.id });
    return rows.length === 1;
  }

  async markGrantRevoked(grantId: string, userId: number, revokedAt: string): Promise<string | null> {
    const effectiveNow = sql`GREATEST(${revokedAt}::timestamptz, clock_timestamp())`;
    const authoritativeRevokedAt = sql`statement_timestamp()`;
    const rows = await this.database.update(civicCustodyGrants)
      .set({
        revokedAt: authoritativeRevokedAt,
        revokedByUserId: userId,
        closedAt: authoritativeRevokedAt,
        closedReason: 'revoked',
        updatedAt: authoritativeRevokedAt,
      })
      .where(and(
        eq(civicCustodyGrants.grantId, grantId),
        isNull(civicCustodyGrants.closedAt),
        isNull(civicCustodyGrants.revokedAt),
        gt(civicCustodyGrants.expiresAt, effectiveNow),
      ))
      .returning({ revokedAt: civicCustodyGrants.revokedAt });
    return rows[0]?.revokedAt ?? null;
  }

  async isGrantExpired(grantId: string, now: string): Promise<boolean> {
    const effectiveNow = sql`GREATEST(${now}::timestamptz, clock_timestamp())`;
    const [row] = await this.database.select({
      expired: sql<boolean>`${civicCustodyGrants.expiresAt} <= ${effectiveNow}`,
    }).from(civicCustodyGrants)
      .where(eq(civicCustodyGrants.grantId, grantId))
      .limit(1);
    return row?.expired === true;
  }

  async findRevocation(userId: number, idempotencyKey: string): Promise<StoredCustodyRevocation | null> {
    const [row] = await this.database.select({
      grantId: civicCustodyGrantRevocations.grantId,
      idempotencyKey: civicCustodyGrantRevocations.idempotencyKey,
      requestHash: civicCustodyGrantRevocations.requestHash,
      revokedByUserId: civicCustodyGrantRevocations.revokedByUserId,
      revokedAt: civicCustodyGrantRevocations.revokedAt,
    }).from(civicCustodyGrantRevocations)
      .where(and(
        eq(civicCustodyGrantRevocations.revokedByUserId, userId),
        eq(civicCustodyGrantRevocations.idempotencyKey, idempotencyKey),
      ))
      .limit(1);
    return row ?? null;
  }

  async appendRevocation(input: StoredCustodyRevocation): Promise<boolean> {
    const rows = await this.database.insert(civicCustodyGrantRevocations)
      // `revokedAt` describe el retiro original. El default de `createdAt`
      // registra cuándo se asentó este recibo idempotente, incluso si fue tarde.
      .values(input)
      .onConflictDoNothing()
      .returning({ id: civicCustodyGrantRevocations.id });
    return rows.length === 1;
  }

  async findResponseConflicts(
    responseId: string,
    responderUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyGrantResponse[]> {
    return this.database.select(responseColumns)
      .from(civicCustodyGrantResponses)
      .where(or(
        eq(civicCustodyGrantResponses.responseId, responseId),
        and(
          eq(civicCustodyGrantResponses.responderUserId, responderUserId),
          eq(civicCustodyGrantResponses.idempotencyKey, idempotencyKey),
        ),
      ));
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

  async listLatestAppliedResponses(grantIds: string[]): Promise<StoredCustodyGrantResponse[]> {
    if (grantIds.length === 0) return [];
    return this.database.selectDistinctOn([civicCustodyGrantResponses.grantId], responseColumns)
      .from(civicCustodyGrantResponses)
      .where(and(
        inArray(civicCustodyGrantResponses.grantId, grantIds),
        eq(civicCustodyGrantResponses.applied, true),
      ))
      .orderBy(civicCustodyGrantResponses.grantId, desc(civicCustodyGrantResponses.id));
  }

  async insertResponse(
    input: Omit<StoredCustodyGrantResponse, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyGrantResponse | null> {
    const [row] = await this.database.insert(civicCustodyGrantResponses)
      .values(input)
      .onConflictDoNothing()
      .returning(responseColumns);
    return row ?? null;
  }

  async hasCoordinationProposal(grantId: string): Promise<boolean> {
    const [row] = await this.database.select({ id: civicCustodyCoordinationProposals.id })
      .from(civicCustodyCoordinationProposals)
      .where(eq(civicCustodyCoordinationProposals.grantId, grantId))
      .limit(1);
    return Boolean(row);
  }
}
