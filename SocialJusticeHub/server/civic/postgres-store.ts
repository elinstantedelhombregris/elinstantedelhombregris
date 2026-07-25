import { and, asc, eq, gt, inArray, isNotNull, isNull, or } from 'drizzle-orm';

import {
  civicActionLinks,
  civicDevices,
  civicEntityOwners,
  civicEvents,
  civicMatchParticipants,
  civicVerificationClaims,
} from '@shared/schema';
import { civicTransactionDb, db } from '../db';
import type { CivicDeviceRole, CivicEntityType, CivicEventInput } from './contracts';
import type {
  CivicActionLinkRecord,
  CivicDeviceRecord,
  CivicEventStore,
  CivicMatchParties,
  ClaimResult,
  StoredCivicEvent,
  TransitionClaimResult,
} from './service';

export interface CivicFeedSourceEvent {
  id: number;
  eventId: string;
  actorKey: string;
  entityType: string;
  entityId: string;
  operation: string;
  payloadJson: string;
  occurredAt: string;
}

type CivicDatabaseExecutor = Pick<typeof db, 'select' | 'insert' | 'update' | 'delete'>;

export class PostgresCivicEventStore implements CivicEventStore {
  constructor(private readonly database: CivicDatabaseExecutor = db) {}

  async runInTransaction<T>(operation: (store: CivicEventStore) => Promise<T>): Promise<T> {
    return civicTransactionDb.transaction(async (tx) => operation(new PostgresCivicEventStore(
      // Ambos drivers exponen los mismos builders; sólo cambia el tipo de
      // resultado del transporte (HTTP vs WebSocket).
      tx as unknown as CivicDatabaseExecutor,
    )));
  }

  async getDevice(actorKey: string): Promise<CivicDeviceRecord | null> {
    const [row] = await this.database.select({
      actorKey: civicDevices.actorKey,
      secretHash: civicDevices.secretHash,
      role: civicDevices.role,
      linkedUserId: civicDevices.linkedUserId,
      revokedAt: civicDevices.revokedAt,
    }).from(civicDevices).where(eq(civicDevices.actorKey, actorKey)).limit(1);
    return row ?? null;
  }

  async createDevice(actorKey: string, secretHash: string): Promise<CivicDeviceRecord> {
    await this.database.insert(civicDevices).values({ actorKey, secretHash, role: 'contributor' }).onConflictDoNothing();
    const device = await this.getDevice(actorKey);
    if (!device) throw new Error('civic_device_insert_failed');
    return device;
  }

  async linkDevice(actorKey: string, userId: number): Promise<'linked' | 'same' | 'conflict' | 'missing'> {
    const current = await this.getDevice(actorKey);
    if (!current) return 'missing';
    if (current.linkedUserId === userId) return 'same';
    if (current.linkedUserId != null) return 'conflict';
    const now = new Date().toISOString();
    const linked = await this.database.update(civicDevices)
      .set({ linkedUserId: userId, updatedAt: now, lastSeenAt: now })
      .where(and(eq(civicDevices.actorKey, actorKey), isNull(civicDevices.linkedUserId)))
      .returning({ id: civicDevices.id });
    if (linked.length === 1) return 'linked';
    const raced = await this.getDevice(actorKey);
    if (!raced) return 'missing';
    return raced.linkedUserId === userId ? 'same' : 'conflict';
  }

  async unlinkDevice(actorKey: string, userId: number): Promise<boolean> {
    const now = new Date().toISOString();
    const rows = await this.database.update(civicDevices)
      .set({ linkedUserId: null, role: 'contributor', updatedAt: now })
      .where(and(eq(civicDevices.actorKey, actorKey), eq(civicDevices.linkedUserId, userId)))
      .returning({ id: civicDevices.id });
    return rows.length === 1;
  }

  async touchDevice(actorKey: string): Promise<void> {
    const now = new Date().toISOString();
    await this.database.update(civicDevices).set({ lastSeenAt: now, updatedAt: now }).where(eq(civicDevices.actorKey, actorKey));
  }

  async findEvents(eventId: string, idempotencyKey: string): Promise<StoredCivicEvent[]> {
    return this.database.select({
      eventId: civicEvents.eventId,
      idempotencyKey: civicEvents.idempotencyKey,
      actorKey: civicEvents.actorKey,
      eventHash: civicEvents.eventHash,
    }).from(civicEvents).where(or(
      eq(civicEvents.eventId, eventId),
      eq(civicEvents.idempotencyKey, idempotencyKey),
    ));
  }

  async appendEvent(input: {
    event: CivicEventInput;
    idempotencyKey: string;
    actorKey: string;
    eventHash: string;
  }): Promise<boolean> {
    const inserted = await this.database.insert(civicEvents).values({
      eventId: input.event.eventId,
      idempotencyKey: input.idempotencyKey,
      actorKey: input.actorKey,
      entityType: input.event.entityType,
      entityId: input.event.entityId,
      operation: input.event.operation,
      payloadJson: JSON.stringify(input.event.payload),
      eventHash: input.eventHash,
      occurredAt: input.event.createdAt,
    }).onConflictDoNothing().returning({ id: civicEvents.id });
    return inserted.length === 1;
  }

  async getOwner(entityType: CivicEntityType, entityId: string): Promise<string | null> {
    const [row] = await this.database.select({ ownerActorKey: civicEntityOwners.ownerActorKey })
      .from(civicEntityOwners)
      .where(and(eq(civicEntityOwners.entityType, entityType), eq(civicEntityOwners.entityId, entityId)))
      .limit(1);
    return row?.ownerActorKey ?? null;
  }

  async claimOwner(entityType: CivicEntityType, entityId: string, actorKey: string): Promise<ClaimResult> {
    const inserted = await this.database.insert(civicEntityOwners).values({
      entityType,
      entityId,
      ownerActorKey: actorKey,
    }).onConflictDoNothing().returning({ id: civicEntityOwners.id });
    if (inserted.length === 1) return 'claimed';
    return (await this.getOwner(entityType, entityId)) === actorKey ? 'same' : 'conflict';
  }

  async claimVerification(input: {
    observationId: string;
    verifierActorKey: string;
    verificationId: string;
  }): Promise<ClaimResult> {
    const inserted = await this.database.insert(civicVerificationClaims).values(input)
      .onConflictDoNothing().returning({ id: civicVerificationClaims.id });
    if (inserted.length === 1) return 'claimed';
    const [existing] = await this.database.select().from(civicVerificationClaims).where(or(
      eq(civicVerificationClaims.verificationId, input.verificationId),
      and(
        eq(civicVerificationClaims.observationId, input.observationId),
        eq(civicVerificationClaims.verifierActorKey, input.verifierActorKey),
      ),
    )).limit(1);
    return existing?.verificationId === input.verificationId
      && existing.observationId === input.observationId
      && existing.verifierActorKey === input.verifierActorKey
      ? 'same'
      : 'conflict';
  }

  async getMatchParties(matchId: string): Promise<CivicMatchParties | null> {
    const [row] = await this.database.select({
      matchId: civicMatchParticipants.matchId,
      needActorKey: civicMatchParticipants.needActorKey,
      resourceActorKey: civicMatchParticipants.resourceActorKey,
      createdByActorKey: civicMatchParticipants.createdByActorKey,
      needAcceptedAt: civicMatchParticipants.needAcceptedAt,
      resourceAcceptedAt: civicMatchParticipants.resourceAcceptedAt,
      fulfilledAt: civicMatchParticipants.fulfilledAt,
      confirmedAt: civicMatchParticipants.confirmedAt,
    }).from(civicMatchParticipants).where(eq(civicMatchParticipants.matchId, matchId)).limit(1);
    return row ?? null;
  }

  async claimMatchParties(parties: CivicMatchParties): Promise<ClaimResult> {
    const inserted = await this.database.insert(civicMatchParticipants).values(parties)
      .onConflictDoNothing().returning({ id: civicMatchParticipants.id });
    if (inserted.length === 1) return 'claimed';
    const existing = await this.getMatchParties(parties.matchId);
    return existing
      && existing.needActorKey === parties.needActorKey
      && existing.resourceActorKey === parties.resourceActorKey
      && existing.createdByActorKey === parties.createdByActorKey
      ? 'same'
      : 'conflict';
  }

  async recordMatchAcceptance(matchId: string, side: 'need' | 'resource'): Promise<TransitionClaimResult> {
    const field = side === 'need'
      ? civicMatchParticipants.needAcceptedAt
      : civicMatchParticipants.resourceAcceptedAt;
    const update = side === 'need'
      ? { needAcceptedAt: new Date().toISOString() }
      : { resourceAcceptedAt: new Date().toISOString() };
    const rows = await this.database.update(civicMatchParticipants).set(update)
      .where(and(eq(civicMatchParticipants.matchId, matchId), isNull(field)))
      .returning({ id: civicMatchParticipants.id });
    if (rows.length === 1) return 'recorded';
    return (await this.getMatchParties(matchId)) ? 'already_recorded' : 'prerequisite_missing';
  }

  async recordMatchFulfillment(matchId: string): Promise<TransitionClaimResult> {
    const rows = await this.database.update(civicMatchParticipants).set({ fulfilledAt: new Date().toISOString() })
      .where(and(
        eq(civicMatchParticipants.matchId, matchId),
        isNotNull(civicMatchParticipants.needAcceptedAt),
        isNotNull(civicMatchParticipants.resourceAcceptedAt),
        isNull(civicMatchParticipants.fulfilledAt),
      ))
      .returning({ id: civicMatchParticipants.id });
    if (rows.length === 1) return 'recorded';
    const current = await this.getMatchParties(matchId);
    if (current?.fulfilledAt) return 'already_recorded';
    return 'prerequisite_missing';
  }

  async recordMatchConfirmation(matchId: string): Promise<TransitionClaimResult> {
    const rows = await this.database.update(civicMatchParticipants).set({ confirmedAt: new Date().toISOString() })
      .where(and(
        eq(civicMatchParticipants.matchId, matchId),
        isNotNull(civicMatchParticipants.fulfilledAt),
        isNull(civicMatchParticipants.confirmedAt),
      ))
      .returning({ id: civicMatchParticipants.id });
    if (rows.length === 1) return 'recorded';
    const current = await this.getMatchParties(matchId);
    if (current?.confirmedAt) return 'already_recorded';
    return 'prerequisite_missing';
  }

  async getActionLink(actionId: string): Promise<CivicActionLinkRecord | null> {
    const [row] = await this.database.select({
      actionId: civicActionLinks.actionId,
      matchId: civicActionLinks.matchId,
      createdByActorKey: civicActionLinks.createdByActorKey,
      completedAt: civicActionLinks.completedAt,
      confirmedAt: civicActionLinks.confirmedAt,
    }).from(civicActionLinks).where(eq(civicActionLinks.actionId, actionId)).limit(1);
    return row ?? null;
  }

  async claimActionLink(link: CivicActionLinkRecord): Promise<ClaimResult> {
    const inserted = await this.database.insert(civicActionLinks).values(link)
      .onConflictDoNothing().returning({ id: civicActionLinks.id });
    if (inserted.length === 1) return 'claimed';
    const existing = await this.getActionLink(link.actionId);
    return existing
      && existing.matchId === link.matchId
      && existing.createdByActorKey === link.createdByActorKey
      ? 'same'
      : 'conflict';
  }

  async recordActionCompletion(actionId: string): Promise<TransitionClaimResult> {
    const rows = await this.database.update(civicActionLinks).set({ completedAt: new Date().toISOString() })
      .where(and(eq(civicActionLinks.actionId, actionId), isNull(civicActionLinks.completedAt)))
      .returning({ id: civicActionLinks.id });
    if (rows.length === 1) return 'recorded';
    return (await this.getActionLink(actionId))?.completedAt ? 'already_recorded' : 'prerequisite_missing';
  }

  async recordActionConfirmation(actionId: string): Promise<TransitionClaimResult> {
    const rows = await this.database.update(civicActionLinks).set({ confirmedAt: new Date().toISOString() })
      .where(and(
        eq(civicActionLinks.actionId, actionId),
        isNotNull(civicActionLinks.completedAt),
        isNull(civicActionLinks.confirmedAt),
      ))
      .returning({ id: civicActionLinks.id });
    if (rows.length === 1) return 'recorded';
    const current = await this.getActionLink(actionId);
    if (current?.confirmedAt) return 'already_recorded';
    return 'prerequisite_missing';
  }

  async listFeedEventsAfter(after: number, limit: number): Promise<CivicFeedSourceEvent[]> {
    return this.database.select({
      id: civicEvents.id,
      eventId: civicEvents.eventId,
      actorKey: civicEvents.actorKey,
      entityType: civicEvents.entityType,
      entityId: civicEvents.entityId,
      operation: civicEvents.operation,
      payloadJson: civicEvents.payloadJson,
      occurredAt: civicEvents.occurredAt,
    }).from(civicEvents)
      .where(gt(civicEvents.id, after))
      .orderBy(asc(civicEvents.id))
      .limit(limit);
  }

  async listMatchesForActor(actorKey: string): Promise<CivicMatchParties[]> {
    return this.database.select({
      matchId: civicMatchParticipants.matchId,
      needActorKey: civicMatchParticipants.needActorKey,
      resourceActorKey: civicMatchParticipants.resourceActorKey,
      createdByActorKey: civicMatchParticipants.createdByActorKey,
      needAcceptedAt: civicMatchParticipants.needAcceptedAt,
      resourceAcceptedAt: civicMatchParticipants.resourceAcceptedAt,
      fulfilledAt: civicMatchParticipants.fulfilledAt,
      confirmedAt: civicMatchParticipants.confirmedAt,
    }).from(civicMatchParticipants).where(or(
      eq(civicMatchParticipants.needActorKey, actorKey),
      eq(civicMatchParticipants.resourceActorKey, actorKey),
    ));
  }

  async listActionLinksForMatches(matchIds: string[]): Promise<CivicActionLinkRecord[]> {
    if (matchIds.length === 0) return [];
    return this.database.select({
      actionId: civicActionLinks.actionId,
      matchId: civicActionLinks.matchId,
      createdByActorKey: civicActionLinks.createdByActorKey,
      completedAt: civicActionLinks.completedAt,
      confirmedAt: civicActionLinks.confirmedAt,
    }).from(civicActionLinks).where(inArray(civicActionLinks.matchId, matchIds));
  }
}

export const asDeviceRole = (value: string): CivicDeviceRole => {
  if (value === 'verifier' || value === 'coordinator') return value;
  return 'contributor';
};
