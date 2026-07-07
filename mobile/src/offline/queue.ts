/**
 * Cola offline — puerto del patrón probado de radar-types.ts (web).
 * El rito nunca se rompe: sin red, la señal se guarda y sale sola después.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendSignal, type SignalPayload } from '@/api/signals';
import { useAuthStore } from '@/stores/auth';

const QUEUE_KEY = 'basta.pending-queue';
const QUEUE_MAX = 50;
/** Respetar el rate limit del backend (12/15min): por tanda salen pocas. */
const FLUSH_BATCH = 8;

export interface PendingItem {
  kind: 'senal';
  payload: SignalPayload;
  queuedAt: string;
  attempts: number;
}

async function readQueue(): Promise<PendingItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingItem[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: PendingItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-QUEUE_MAX)));
}

export async function enqueue(item: Omit<PendingItem, 'queuedAt' | 'attempts'>): Promise<void> {
  const queue = await readQueue();
  queue.push({ ...item, queuedAt: new Date().toISOString(), attempts: 0 });
  await writeQueue(queue);
}

export async function pendingCount(): Promise<number> {
  return (await readQueue()).length;
}

let flushing = false;

/**
 * Intenta vaciar la cola en serie. Corta ante falta de red o rate limit.
 * Descarta ítems rechazados por validación (4xx) — reintentarlos no ayuda.
 * Ítems que piden sesión (401) esperan a que haya sesión.
 */
export async function flushQueue(): Promise<{ sent: number; remaining: number }> {
  if (flushing) return { sent: 0, remaining: await pendingCount() };
  flushing = true;
  try {
    let queue = await readQueue();
    let sent = 0;

    for (const item of queue.slice(0, FLUSH_BATCH)) {
      if (item.kind === 'senal') {
        const needsAuth = item.payload.type === 'compromiso' || item.payload.type === 'recurso';
        if (needsAuth && !useAuthStore.getState().user) continue;

        const result = await sendSignal(item.payload);
        if (result.ok) {
          queue = queue.filter((q) => q !== item);
          sent += 1;
        } else if (result.reason === 'offline') {
          break; // sin red: probamos de nuevo en el próximo evento
        } else if (result.reason === 'auth') {
          continue; // espera sesión
        } else {
          // validación/rate limit: un par de reintentos y afuera
          item.attempts += 1;
          if (item.attempts >= 3) queue = queue.filter((q) => q !== item);
          break;
        }
      }
    }

    await writeQueue(queue);
    return { sent, remaining: queue.length };
  } finally {
    flushing = false;
  }
}
