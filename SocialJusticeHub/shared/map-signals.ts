// shared/map-signals.ts
// Tipo unificado para las señales del mapa (sueños + compromisos + recursos).
// Lo consumen el endpoint GET /api/map/signals y todos los mapas del cliente.

export type SignalType = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

export const SIGNAL_TYPES: SignalType[] = ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso'];

export interface MapSignal {
  /** "dream-12" | "commitment-3" | "resource-7" — único entre las tres tablas */
  id: string;
  type: SignalType;
  text: string;
  lat: number | null;
  lng: number | null;
  location: string | null;
  province: string | null;
  city: string | null;
  /** Solo recursos (legal, medical, …) */
  category: string | null;
  createdAt: string | null;
}
