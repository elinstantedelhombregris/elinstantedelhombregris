import { create } from 'zustand';

import type { RadarTypeKey } from '@/lib/radar-types';

interface Celebration {
  latitude: number;
  longitude: number;
  color: string;
  /** true si la señal quedó encolada (sin red) — brilla en modo pendiente */
  pending: boolean;
}

interface MapState {
  /** Filtro activo por tipo de señal (null = todas, plata en reposo) */
  filter: RadarTypeKey | null;
  /** Señal recién enviada: el mapa vuela hacia ella y la hace florecer */
  celebration: Celebration | null;
  setFilter: (f: RadarTypeKey | null) => void;
  celebrate: (c: Celebration) => void;
  clearCelebration: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  filter: null,
  celebration: null,
  setFilter: (filter) => set({ filter }),
  celebrate: (celebration) => set({ celebration }),
  clearCelebration: () => set({ celebration: null }),
}));
