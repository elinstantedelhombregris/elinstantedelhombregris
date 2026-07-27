import NetInfo from '@react-native-community/netinfo';
import { and, eq, lte } from 'drizzle-orm';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { ahoraISO, getSetting, setSetting } from '@/db/repos';
import { db } from '@/db/client';
import { civicNeeds, civicObservations, civicResources, syncOutbox } from '@/db/schema';

import { pendingOutbox } from './repo';
import { ensureCivicDeviceToken, invalidateCivicDeviceToken } from './device-auth';
import { CIVIC_API_URL, CIVIC_FEED_ENABLED_KEY } from './config';
import { applyOperationalFeed, isOperationalFeedEvent } from './feed';
import { fetchWithTimeout } from './http';
import { getActorKey } from './identity';
import { setRecordContextAudience } from './record-context';

const MAX_BATCH = 12;
const SENDING_LEASE_MS = 2 * 60_000;
const RETRY_SWEEP_MS = 30_000;
let flushing = false;
let pulling = false;
let feedPullEnabledInProcess = true;
let feedPullGeneration = 0;
let lastKnownOutboxSize = 0;
const FEED_CURSOR_KEY = 'civic_feed_cursor_v1';

/**
 * Corte inmediato además del flag persistente. Protege contra una respuesta
 * que ya estaba en vuelo y contra el borrado total que elimina `settings`.
 */
export const setCivicFeedPullEnabled = (enabled: boolean): void => {
  feedPullEnabledInProcess = enabled;
  feedPullGeneration += 1;
};

const civicFeedPullAllowed = (): boolean =>
  feedPullEnabledInProcess && getSetting(CIVIC_FEED_ENABLED_KEY) !== '0';

const readPendingOutbox = () => {
  const rows = pendingOutbox();
  lastKnownOutboxSize = rows.length;
  return rows;
};

const nextBackoff = (attempts: number): string =>
  new Date(Date.now() + Math.min(30 * 60_000, 2 ** attempts * 2_000)).toISOString();

/**
 * Un proceso puede morir después de marcar una fila como `sending`. La marca
 * funciona como un lease corto: vencido ese plazo vuelve a `failed` y entra en
 * el mismo circuito idempotente de reintento.
 */
export const recoverInterruptedOutbox = (at = Date.now()): number => {
  const recoveredAt = new Date(at).toISOString();
  const cutoff = new Date(at - SENDING_LEASE_MS).toISOString();
  return db.update(syncOutbox).set({
    status: 'failed',
    lastError: 'interrupted_while_sending',
    nextAttemptAt: recoveredAt,
    updatedAt: recoveredAt,
  }).where(and(eq(syncOutbox.status, 'sending'), lte(syncOutbox.updatedAt, cutoff))).run().changes;
};

export const retryDeadLetters = (): number => {
  const retriedAt = ahoraISO();
  return db.update(syncOutbox).set({
    status: 'pending',
    attempts: 0,
    lastError: null,
    nextAttemptAt: retriedAt,
    updatedAt: retriedAt,
  }).where(eq(syncOutbox.status, 'dead_letter')).run().changes;
};

export const flushCivicOutbox = async (): Promise<{ sent: number; remaining: number; configured: boolean }> => {
  if (!CIVIC_API_URL) {
    try {
      return { sent: 0, remaining: readPendingOutbox().length, configured: false };
    } catch {
      return { sent: 0, remaining: lastKnownOutboxSize, configured: false };
    }
  }
  if (flushing) return { sent: 0, remaining: lastKnownOutboxSize, configured: true };
  flushing = true;
  let sent = 0;
  try {
    recoverInterruptedOutbox();
    const batch = readPendingOutbox().slice(0, MAX_BATCH);
    if (batch.length === 0) return { sent: 0, remaining: 0, configured: true };
    let accessToken: string;
    try {
      accessToken = await ensureCivicDeviceToken(CIVIC_API_URL);
    } catch {
      return { sent: 0, remaining: lastKnownOutboxSize, configured: true };
    }
    for (const item of batch) {
      if (item.nextAttemptAt && item.nextAttemptAt > ahoraISO()) continue;
      db.update(syncOutbox).set({ status: 'sending', updatedAt: ahoraISO() }).where(eq(syncOutbox.id, item.id)).run();
      try {
        const response = await fetchWithTimeout(`${CIVIC_API_URL}/api/v1/civic/events`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'idempotency-key': item.idempotencyKey,
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            eventId: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            operation: item.operation,
            payload: JSON.parse(item.payloadJson) as unknown,
            createdAt: item.createdAt,
          }),
        });
        if (response.ok) {
          const sentPayload = JSON.parse(item.payloadJson) as Record<string, unknown>;
          const revokedAt = item.operation === 'update'
            && typeof sentPayload.revokedAt === 'string'
            && Number.isFinite(Date.parse(sentPayload.revokedAt))
            ? sentPayload.revokedAt
            : null;
          const acknowledgedAt = ahoraISO();
          db.transaction((tx) => {
            // El acuse, el retiro de la cola y el estado local forman un solo
            // commit. Un cierre del proceso no puede perder la única prueba de
            // que todavía hacía falta reconciliar el evento.
            tx.delete(syncOutbox).where(eq(syncOutbox.id, item.id)).run();
            if (item.entityType === 'observation') {
              const current = tx.select().from(civicObservations)
                .where(eq(civicObservations.id, item.entityId)).get();
              tx.update(civicObservations)
                .set({
                  status: revokedAt
                    ? 'withdrawn'
                    : item.operation === 'create' && current?.status === 'queued'
                      ? 'synced'
                      : current?.status,
                  syncedAt: acknowledgedAt,
                  updatedAt: revokedAt ?? acknowledgedAt,
                })
                .where(eq(civicObservations.id, item.entityId)).run();
            }
            if (revokedAt && item.entityType === 'need') {
              tx.update(civicNeeds).set({ status: 'withdrawn', updatedAt: revokedAt })
                .where(eq(civicNeeds.id, item.entityId)).run();
            }
            if (revokedAt && item.entityType === 'resource') {
              tx.update(civicResources).set({ status: 'withdrawn', updatedAt: revokedAt })
                .where(eq(civicResources.id, item.entityId)).run();
            }
            if (revokedAt && ['observation', 'need', 'resource'].includes(item.entityType)) {
              setRecordContextAudience(
                item.entityType as 'observation' | 'need' | 'resource',
                item.entityId,
                'private',
                tx,
              );
            }
          });
          sent += 1;
          lastKnownOutboxSize = Math.max(0, lastKnownOutboxSize - 1);
          continue;
        }
        const responseBody = await response.json().catch(() => null) as { code?: string } | null;
        const dependencyPending = new Set([
          'RELATED_ENTITY_NOT_FOUND',
          'ENTITY_NOT_FOUND',
          'BOTH_ACCEPTANCES_REQUIRED',
          'FULFILLMENT_REQUIRED',
          'ACTION_COMPLETION_REQUIRED',
        ]).has(responseBody?.code ?? '');
        const permanent = response.status >= 400 && response.status < 500
          && response.status !== 401 && response.status !== 429 && !dependencyPending;
        const attempts = item.attempts + 1;
        db.update(syncOutbox).set({
          status: permanent || attempts >= 8 ? 'dead_letter' : 'failed', attempts,
          lastError: `HTTP ${response.status}${responseBody?.code ? `:${responseBody.code}` : ''}`,
          nextAttemptAt: permanent ? null : nextBackoff(attempts),
          updatedAt: ahoraISO(),
        }).where(eq(syncOutbox.id, item.id)).run();
        if (response.status === 401 || responseBody?.code === 'INVALID_DEVICE_TOKEN') {
          await invalidateCivicDeviceToken();
          break;
        }
        if (response.status === 429) break;
      } catch (error) {
        const attempts = item.attempts + 1;
        db.update(syncOutbox).set({
          status: attempts >= 8 ? 'dead_letter' : 'failed', attempts,
          lastError: error instanceof Error ? error.message.slice(0, 180) : 'network_error',
          nextAttemptAt: nextBackoff(attempts), updatedAt: ahoraISO(),
        }).where(eq(syncOutbox.id, item.id)).run();
        break;
      }
    }
    return { sent, remaining: readPendingOutbox().length, configured: true };
  } catch {
    return { sent, remaining: lastKnownOutboxSize, configured: true };
  } finally {
    flushing = false;
  }
};

interface FeedResponse {
  contract: string;
  events: unknown[];
  nextCursor: number;
  hasMore: boolean;
}

const isFeedResponse = (value: unknown): value is FeedResponse => {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<FeedResponse>;
  return body.contract === 'basta-civic-feed/v1'
    && Array.isArray(body.events)
    && typeof body.nextCursor === 'number'
    && Number.isInteger(body.nextCursor)
    && typeof body.hasMore === 'boolean';
};

/**
 * Descarga sólo la proyección operativa autorizada. La API exige una cuenta
 * vinculada; una instalación anónima sigue capturando y enviando sin error.
 */
export const pullCivicFeed = async (): Promise<{
  received: number;
  configured: boolean;
  linked: boolean;
}> => {
  if (!CIVIC_API_URL) return { received: 0, configured: false, linked: false };
  // Logout must fail closed even when the remote unlink could not run offline.
  // `null` preserves already-linked installations created before this gate.
  if (!civicFeedPullAllowed()) {
    return { received: 0, configured: true, linked: false };
  }
  if (pulling) return { received: 0, configured: true, linked: true };
  pulling = true;
  const pullGeneration = feedPullGeneration;
  let received = 0;
  try {
    let cursor = Math.max(0, Number(getSetting(FEED_CURSOR_KEY)) || 0);
    const [accessToken, actorKey] = await Promise.all([
      ensureCivicDeviceToken(CIVIC_API_URL),
      getActorKey(),
    ]);
    for (let page = 0; page < 3; page += 1) {
      const response = await fetchWithTimeout(`${CIVIC_API_URL}/api/v1/civic/feed?after=${cursor}&limit=200`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const body = await response.json().catch(() => null) as unknown;
      // Puede haberse cerrado sesión mientras la petición estaba en vuelo.
      // Nunca aplicar una página después de que el gate local cambió a cero.
      if (pullGeneration !== feedPullGeneration || !civicFeedPullAllowed()) {
        return { received, configured: true, linked: false };
      }
      if (!response.ok) {
        const code = body && typeof body === 'object' && 'code' in body ? String(body.code) : '';
        if (response.status === 401 || code === 'INVALID_DEVICE_TOKEN') await invalidateCivicDeviceToken();
        if (code === 'ACCOUNT_LINK_REQUIRED') return { received, configured: true, linked: false };
        return { received, configured: true, linked: true };
      }
      if (!isFeedResponse(body) || body.nextCursor < cursor) return { received, configured: true, linked: true };
      const events = body.events.filter(isOperationalFeedEvent);
      received += applyOperationalFeed(events, actorKey);
      cursor = body.nextCursor;
      setSetting(FEED_CURSOR_KEY, String(cursor));
      if (!body.hasMore) break;
    }
    return { received, configured: true, linked: true };
  } catch {
    return { received, configured: true, linked: true };
  } finally {
    pulling = false;
  }
};

export interface CivicSyncResult {
  pushed: { sent: number; remaining: number; configured: boolean };
  pulled: { received: number; configured: boolean; linked: boolean };
}

let syncInFlight: Promise<CivicSyncResult> | null = null;

const performCivicSync = async (): Promise<CivicSyncResult> => {
  const pushed = await flushCivicOutbox();
  const pulled = await pullCivicFeed();
  return { pushed, pulled };
};

/**
 * Una sola sincronización por vez. En web, expo-sqlite usa un worker para las
 * operaciones síncronas: dos ciclos disparados por foco/red pueden bloquearse
 * entre sí. El single-flight comparte el resultado y nunca deja un rechazo
 * sin manejar dentro de un evento de ciclo de vida.
 */
export const syncCivicNetwork = (): Promise<CivicSyncResult> => {
  if (syncInFlight) return syncInFlight;
  syncInFlight = performCivicSync()
    .catch(() => ({
      pushed: { sent: 0, remaining: lastKnownOutboxSize, configured: Boolean(CIVIC_API_URL) },
      pulled: { received: 0, configured: Boolean(CIVIC_API_URL), linked: Boolean(CIVIC_API_URL) },
    }))
    .finally(() => {
      syncInFlight = null;
    });
  return syncInFlight;
};

export const useCivicSync = (): void => {
  useEffect(() => {
    const requestSync = () => { void syncCivicNetwork(); };
    requestSync();
    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      if (state.isConnected) requestSync();
    });
    const retrySweep = setInterval(requestSync, RETRY_SWEEP_MS);
    // El worker SQLite web puede seguir suspendido cuando visibilitychange
    // anuncia "active". La red ya dispara su propio ciclo; este listener es
    // útil sólo en el teléfono, donde la base es nativa y persistente.
    const subscription = Platform.OS === 'web' ? null : AppState.addEventListener('change', (state) => {
      if (state === 'active') requestSync();
    });
    return () => {
      unsubscribeNetwork();
      clearInterval(retrySweep);
      subscription?.remove();
    };
  }, []);
};
