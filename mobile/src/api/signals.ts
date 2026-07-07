import { api, ApiRequestError } from './client';

import type { RadarTypeKey } from '@/lib/radar-types';

export interface SignalPayload {
  type: RadarTypeKey;
  text: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

export type SendResult =
  | { ok: true; id: number }
  | { ok: false; reason: 'offline' | 'auth' | 'error'; message: string };

/** Envía una señal. Anónima para dream/need/basta/value; con sesión para el resto. */
export async function sendSignal(payload: SignalPayload): Promise<SendResult> {
  try {
    const data = await api<{ ok: true; type: string; id: number }>(
      'POST',
      '/api/radar/senal',
      payload,
    );
    return { ok: true, id: data.id };
  } catch (e) {
    if (e instanceof ApiRequestError) {
      return {
        ok: false,
        reason: e.status === 401 ? 'auth' : 'error',
        message: e.message,
      };
    }
    // fetch lanzó TypeError: sin conexión
    return { ok: false, reason: 'offline', message: 'Sin conexión' };
  }
}
