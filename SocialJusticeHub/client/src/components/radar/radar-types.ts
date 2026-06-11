import { apiRequest } from '@/lib/queryClient';
import {
  Sparkles, Gem, LifeBuoy, Megaphone, HeartHandshake, Gift,
  type LucideIcon,
} from 'lucide-react';

/**
 * Radar ¡BASTA! — definición de los 6 tipos de señal y cola offline.
 * Los colores son los mismos que usa la Radiografía (/explorar-datos).
 */

export type RadarTypeKey = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

export interface RadarTypeDef {
  key: RadarTypeKey;
  label: string;
  color: string;
  icon: LucideIcon;
  question: string;
  placeholder: string;
  requiresAuth: boolean;
}

export const RADAR_TYPES: RadarTypeDef[] = [
  {
    key: 'dream', label: 'Sueño', color: '#3b82f6', icon: Sparkles,
    question: '¿Qué soñás para tu barrio, tu provincia, el país?',
    placeholder: 'Sueño con…',
    requiresAuth: false,
  },
  {
    key: 'need', label: 'Necesidad', color: '#f59e0b', icon: LifeBuoy,
    question: '¿Qué falta hoy donde vivís?',
    placeholder: 'Acá falta…',
    requiresAuth: false,
  },
  {
    key: 'basta', label: '¡Basta!', color: '#ef4444', icon: Megaphone,
    question: '¿De qué te cansaste? Decilo.',
    placeholder: '¡Basta de…!',
    requiresAuth: false,
  },
  {
    key: 'value', label: 'Valor', color: '#ec4899', icon: Gem,
    question: '¿Qué valor no se negocia para vos?',
    placeholder: 'Para mí no se negocia…',
    requiresAuth: false,
  },
  {
    key: 'compromiso', label: 'Compromiso', color: '#10b981', icon: HeartHandshake,
    question: '¿Qué te comprometés a hacer vos?',
    placeholder: 'Me comprometo a…',
    requiresAuth: true,
  },
  {
    key: 'recurso', label: 'Recurso', color: '#14b8a6', icon: Gift,
    question: '¿Qué podés ofrecer? Tiempo, saberes, espacio…',
    placeholder: 'Puedo ofrecer…',
    requiresAuth: true,
  },
];

export const RADAR_TYPE_MAP: Record<RadarTypeKey, RadarTypeDef> = Object.fromEntries(
  RADAR_TYPES.map((t) => [t.key, t]),
) as Record<RadarTypeKey, RadarTypeDef>;

// ---------- Envío ----------

export interface SignalPayload {
  type: RadarTypeKey;
  text: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export type SendResult =
  | { ok: true; id: number }
  | { ok: false; reason: 'offline' | 'auth' | 'error'; message: string };

export async function sendSignal(payload: SignalPayload): Promise<SendResult> {
  try {
    const res = await apiRequest('POST', '/api/radar/senal', payload);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, id: data.id };
    }
    // apiRequest devuelve 401/403 sin lanzar
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      reason: res.status === 401 ? 'auth' : 'error',
      message: data.message ?? 'No pudimos guardar tu señal. Probá de nuevo.',
    };
  } catch (error) {
    if (error instanceof TypeError) {
      // fetch falló: sin conexión
      return { ok: false, reason: 'offline', message: 'Sin conexión' };
    }
    // apiRequest lanza Error("400: {json}") para errores no-auth
    const raw = error instanceof Error ? error.message : '';
    const match = raw.match(/^\d+:\s*(.*)$/s);
    let message = 'No pudimos guardar tu señal. Probá de nuevo.';
    if (match) {
      try {
        message = JSON.parse(match[1]).message ?? message;
      } catch {
        if (match[1]) message = match[1];
      }
    }
    return { ok: false, reason: 'error', message };
  }
}

// ---------- Cola offline (solo señales anónimas) ----------

const QUEUE_KEY = 'radar-pending-signals';
const QUEUE_MAX = 50;

export interface PendingSignal extends SignalPayload {
  queuedAt: string;
}

export function getQueue(): PendingSignal[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingSignal[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-QUEUE_MAX)));
  } catch {
    // storage lleno o bloqueado: la señal se pierde silenciosamente, mejor que romper la app
  }
}

export function queueSignal(payload: SignalPayload): void {
  saveQueue([...getQueue(), { ...payload, queuedAt: new Date().toISOString() }]);
}

/** Reintenta las señales pendientes. Devuelve cuántas salieron y cuántas quedan. */
export async function flushQueue(): Promise<{ sent: number; remaining: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { sent: 0, remaining: 0 };

  const stillPending: PendingSignal[] = [];
  let sent = 0;
  for (const signal of queue) {
    const { queuedAt, ...payload } = signal;
    const result = await sendSignal(payload);
    if (result.ok) {
      sent++;
    } else if (result.reason === 'offline') {
      stillPending.push(signal);
    }
    // errores de validación/auth: se descartan para no trabar la cola
  }
  saveQueue(stillPending);
  return { sent, remaining: stillPending.length };
}

// ---------- Helpers de presentación ----------

export function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 1) return 'recién';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? 'hace 1 día' : `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
}
