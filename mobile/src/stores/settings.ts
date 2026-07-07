import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  /** Ya vio el manifiesto de bienvenida */
  onboarded: boolean;
  /** Hidratado desde AsyncStorage (evita flash de onboarding) */
  hydrated: boolean;
  setOnboarded: () => void;
  setHydrated: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      onboarded: false,
      hydrated: false,
      setOnboarded: () => set({ onboarded: true }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'basta.settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ onboarded: s.onboarded }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
