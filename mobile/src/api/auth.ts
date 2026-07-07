import { api } from './client';
import type { ApiUser, AuthResponse } from './types';

import { useAuthStore } from '@/stores/auth';

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  location?: string;
}

export async function register(input: RegisterInput): Promise<ApiUser> {
  const data = await api<AuthResponse>('POST', '/api/register', input);
  await useAuthStore.getState().setSession(data.user, data.tokens);
  return data.user;
}

export async function login(username: string, password: string): Promise<ApiUser> {
  const data = await api<AuthResponse>('POST', '/api/login', { username, password });
  await useAuthStore.getState().setSession(data.user, data.tokens);
  return data.user;
}

export async function fetchMe(): Promise<ApiUser> {
  return api<ApiUser>('GET', '/api/auth/me');
}

export async function logout(): Promise<void> {
  try {
    await api('POST', '/api/auth/logout');
  } catch {
    // El logout es best-effort: la sesión local se borra igual.
  }
  await useAuthStore.getState().clearSession();
}
