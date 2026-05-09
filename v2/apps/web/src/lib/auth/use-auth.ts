/**
 * useAuth — central hook for auth state.
 *
 * Wraps a single React Query that calls /api/auth/me. The query
 * silently returns `null` on 401 (so consumers can render the
 * not-logged-in branch without an error), and the hook exposes
 * helpers to log in / log out / refresh that invalidate the cache.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { readCsrfToken } from './csrf';

import type { AuthenticatedUser } from './types';

import { ApiError, api } from '~/lib/api';

interface MeResponse {
  user: AuthenticatedUser;
}

interface LoginSuccess {
  user: AuthenticatedUser;
  csrfToken: string;
  needsTwoFactor?: undefined;
}

interface LoginNeedsTwoFactor {
  needsTwoFactor: true;
  ticket: string;
  user?: undefined;
  csrfToken?: undefined;
}

type LoginResponse = LoginSuccess | LoginNeedsTwoFactor;

interface LoginVars {
  identifier: string;
  password: string;
}

interface RegisterVars {
  username: string;
  email: string;
  password: string;
  name: string;
}

const ME_KEY = ['auth', 'me'] as const;

async function fetchMe(): Promise<AuthenticatedUser | null> {
  try {
    const result = await api.get<MeResponse>('/api/auth/me');
    return result.user;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) return null;
    throw err;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery<AuthenticatedUser | null>({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    staleTime: 60_000,
    retry: false,
  });

  const loginMutation = useMutation<LoginResponse, ApiError, LoginVars>({
    mutationFn: async (vars) =>
      api.post<LoginResponse>('/api/auth/login', vars, { csrfToken: readCsrfToken() }),
    onSuccess: (data) => {
      // 2FA challenges don't carry a user — leave the cache as-is.
      if (data.user) queryClient.setQueryData(ME_KEY, data.user);
    },
  });

  const registerMutation = useMutation<LoginSuccess, ApiError, RegisterVars>({
    mutationFn: async (vars) =>
      api.post<LoginSuccess>('/api/auth/register', vars, { csrfToken: readCsrfToken() }),
    onSuccess: (data) => {
      queryClient.setQueryData(ME_KEY, data.user);
    },
  });

  const logoutMutation = useMutation<{ ok: true }, ApiError>({
    mutationFn: async () => api.post<{ ok: true }>('/api/auth/logout', undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      queryClient.setQueryData(ME_KEY, null);
      void queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    isAuthenticated: meQuery.data != null,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
