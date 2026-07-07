/**
 * Cliente API — fetch fino contra el backend v1.
 * - Bearer token si hay sesión; sin token la app sigue en modo invitado.
 * - 401 → un solo refresh en vuelo (single-flight) y reintento único.
 * - Si el refresh falla, la sesión cae a invitado; nunca se bloquea la app.
 */
import { useAuthStore } from '@/stores/auth';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://elinstantedelhombregris.com';

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession, clearSession } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearSession();
      return false;
    }
    const data = await res.json();
    await setSession(data.user, data.tokens);
    return true;
  } catch {
    // Red caída: conservamos la sesión, el próximo request reintenta.
    return false;
  }
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  { retried = false }: { retried?: boolean } = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && accessToken && !retried) {
    refreshInFlight ??= refreshSession().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed) return api<T>(method, path, body, { retried: true });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiRequestError(
      res.status,
      data.message ?? 'Algo salió mal. Probá de nuevo.',
      data.code,
    );
  }

  return (await res.json()) as T;
}
