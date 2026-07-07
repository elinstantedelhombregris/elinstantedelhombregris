/**
 * Sesión — access token en memoria (+ usuario cacheado), refresh token en
 * SecureStore. Al arrancar, bootstrapSession() intenta revivir la sesión
 * con el refresh token; si no puede, la app queda en modo invitado.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { ApiUser, AuthTokens } from '@/api/types';
import { tokenStore } from '@/lib/token-store';

const REFRESH_KEY = 'basta.refreshToken';
const USER_KEY = 'basta.user';

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** true mientras intentamos revivir la sesión al arrancar */
  bootstrapping: boolean;
  setSession: (user: ApiUser, tokens: AuthTokens) => Promise<void>;
  clearSession: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  bootstrapping: true,

  setSession: async (user, tokens) => {
    set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    await Promise.all([
      tokenStore.set(REFRESH_KEY, tokens.refreshToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
  },

  clearSession: async () => {
    set({ user: null, accessToken: null, refreshToken: null });
    await Promise.all([
      tokenStore.delete(REFRESH_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },

  bootstrap: async () => {
    try {
      const [refreshToken, rawUser] = await Promise.all([
        tokenStore.get(REFRESH_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (refreshToken) {
        set({
          refreshToken,
          user: rawUser ? (JSON.parse(rawUser) as ApiUser) : null,
        });
        // El primer request autenticado renovará tokens vía 401 → refresh.
      }
    } finally {
      set({ bootstrapping: false });
    }
  },
}));

/** ¿Hay una persona con cuenta, o estamos en modo invitado? */
export const useIsLoggedIn = () => useAuthStore((s) => s.user !== null);
