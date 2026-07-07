import { api } from './client';

import type { RadarTypeKey } from '@/lib/radar-types';

/** Espejo de shared/map-signals.ts (backend v1). */
export interface MapSignal {
  id: string;
  type: RadarTypeKey;
  text: string;
  lat: number | null;
  lng: number | null;
  location: string | null;
  province: string | null;
  city: string | null;
  category: string | null;
  createdAt: string | null;
}

export async function fetchMapSignals(): Promise<MapSignal[]> {
  const data = await api<{ signals: MapSignal[]; total: number }>(
    'GET',
    '/api/map/signals',
  );
  return data.signals.filter((s) => s.lat !== null && s.lng !== null);
}
