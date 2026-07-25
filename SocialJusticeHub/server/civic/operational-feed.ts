import type { CivicFeedSourceEvent } from './postgres-store';
import type { CivicActionLinkRecord, CivicMatchParties } from './service';
import { LISTENING_CAMPAIGN_KEY } from './listening-insights';

export type OperationalEntityType = 'observation' | 'need' | 'resource' | 'verification' | 'match' | 'action';

export interface OperationalFeedEvent {
  cursor: number;
  eventId: string;
  entityType: OperationalEntityType;
  entityId: string;
  operation: string;
  occurredAt: string;
  ownedByMe: boolean;
  payload: Record<string, unknown>;
  parties?: {
    needOwnedByMe: boolean;
    resourceOwnedByMe: boolean;
    needAccepted: boolean;
    resourceAccepted: boolean;
  };
}

const VISIBLE_TYPES = new Set<OperationalEntityType>([
  'observation', 'need', 'resource', 'verification', 'match', 'action',
]);
const COLLECTIVE_ENTITY_TYPES = new Set<OperationalEntityType>([
  'observation', 'need', 'resource',
]);

const SAFE_KEYS: Record<OperationalEntityType, ReadonlySet<string>> = {
  observation: new Set([
    'campaignKey', 'campaignVersion', 'territoryId', 'category', 'title', 'summary',
    'data', 'evidence', 'location', 'locationPrecision', 'locationLabel', 'observedAt',
    'expiresAt', 'createdAt', 'updatedAt', 'locationRole', 'locationSource',
    'horizontalAccuracyM', 'audience', 'attributionMode', 'attributionName',
    'revokedAt',
  ]),
  need: new Set([
    'observationId', 'territoryId', 'category', 'title', 'description', 'quantity',
    'unit', 'urgency', 'status', 'publicLat', 'publicLng', 'publicPrecision',
    'locationLabel', 'expiresAt', 'createdAt', 'updatedAt', 'locationRole',
    'locationSource', 'horizontalAccuracyM', 'audience', 'attributionMode',
    'attributionName', 'revokedAt',
  ]),
  resource: new Set([
    'territoryId', 'category', 'title', 'description', 'quantity', 'unit',
    'availabilityJson', 'radiusKm', 'confidence', 'status', 'publicLat', 'publicLng',
    'publicPrecision', 'locationLabel', 'expiresAt', 'createdAt', 'updatedAt',
    'locationRole', 'locationSource', 'horizontalAccuracyM', 'audience',
    'attributionMode', 'attributionName', 'revokedAt',
  ]),
  verification: new Set(['observationId', 'verdict', 'createdAt']),
  match: new Set(['needId', 'resourceId', 'score', 'reasonsJson', 'createdAt', 'updatedAt']),
  action: new Set(['matchId', 'title', 'description', 'scheduledAt', 'createdAt', 'updatedAt']),
};

const parseObject = (raw: string): Record<string, unknown> | null => {
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const pick = (payload: Record<string, unknown>, keys: ReadonlySet<string>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(payload).filter(([key]) => keys.has(key)));

const matchStatus = (parties: CivicMatchParties, eventStatus: unknown): string => {
  if (parties.confirmedAt) return 'confirmed';
  if (parties.fulfilledAt) return 'fulfilled';
  if (typeof eventStatus === 'string' && ['accepted', 'in_progress', 'declined', 'cancelled'].includes(eventStatus)) {
    return eventStatus;
  }
  if (parties.needAcceptedAt && parties.resourceAcceptedAt) return 'accepted';
  return 'proposed';
};

const actionStatus = (link: CivicActionLinkRecord, eventStatus: unknown): string => {
  if (link.confirmedAt) return 'confirmed';
  if (link.completedAt) return 'completed';
  if (eventStatus === 'in_progress' || eventStatus === 'cancelled') return eventStatus;
  return 'planned';
};

/**
 * Proyección operativa para participantes vinculados. Nunca devuelve claves
 * de actor, consentimiento, contacto, coordenadas exactas, notas de
 * verificación ni evidencia local. Las conexiones sólo son visibles para sus
 * dos partes y sus estados se derivan de claims persistidos por el servidor.
 */
export function buildOperationalFeed(
  source: CivicFeedSourceEvent[],
  requesterActorKey: string,
  matches: CivicMatchParties[],
  actions: CivicActionLinkRecord[],
): OperationalFeedEvent[] {
  const matchById = new Map(matches.map((item) => [item.matchId, item]));
  const actionById = new Map(actions.map((item) => [item.actionId, item]));
  const result: OperationalFeedEvent[] = [];

  for (const event of source) {
    if (!VISIBLE_TYPES.has(event.entityType as OperationalEntityType)) continue;
    const entityType = event.entityType as OperationalEntityType;
    const raw = parseObject(event.payloadJson);
    if (!raw) continue;
    // The broad participant network is a collective channel, not an ACL. A
    // missing audience and the future private/circle/counterpart modes all fail
    // closed until the server can verify a concrete membership or recipient.
    if (COLLECTIVE_ENTITY_TYPES.has(entityType) && raw.audience !== 'collective') continue;
    // Listening observations are intentionally aggregate-only. Even the
    // creator must not receive an individual record through the broad linked
    // participant feed, because that would also make cross-device scraping
    // and accidental redistribution possible.
    if (entityType === 'observation' && raw.campaignKey === LISTENING_CAMPAIGN_KEY) continue;

    let parties: OperationalFeedEvent['parties'];
    let ownedByMe = event.actorKey === requesterActorKey;
    const payload = pick(raw, SAFE_KEYS[entityType]);

    if (entityType === 'match') {
      const match = matchById.get(event.entityId);
      if (!match) continue;
      parties = {
        needOwnedByMe: match.needActorKey === requesterActorKey,
        resourceOwnedByMe: match.resourceActorKey === requesterActorKey,
        needAccepted: match.needAcceptedAt != null,
        resourceAccepted: match.resourceAcceptedAt != null,
      };
      payload.status = matchStatus(match, raw.status);
      ownedByMe = parties.needOwnedByMe || parties.resourceOwnedByMe;
    }

    if (entityType === 'action') {
      const link = actionById.get(event.entityId);
      if (!link || !matchById.has(link.matchId)) continue;
      payload.matchId = link.matchId;
      payload.status = actionStatus(link, raw.status);
      ownedByMe = true;
    }

    result.push({
      cursor: event.id,
      eventId: event.eventId,
      entityType,
      entityId: event.entityId,
      operation: event.operation,
      occurredAt: event.occurredAt,
      ownedByMe,
      payload,
      ...(parties ? { parties } : {}),
    });
  }

  return result;
}
