import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { setSetting } from '@/db/repos';

import { CIVIC_API_URL, CIVIC_FEED_ENABLED_KEY } from './config';
import { ensureCivicDeviceToken } from './device-auth';
import { clearOperationalFeed } from './feed';
import { fetchWithTimeout } from './http';
import { setCivicFeedPullEnabled, syncCivicNetwork } from './sync';

const SESSION_KEY = 'basta.community-session.v1';
let sessionGeneration = 0;
let sessionResetInFlight: Promise<unknown> | null = null;

export interface CommunityUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface CommunitySession {
  user: CommunityUser;
  accessToken: string;
  refreshToken: string;
}

export class CommunityApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 0) {
    super(message);
    this.name = 'CommunityApiError';
  }
}

const getStored = (): Promise<string | null> => Platform.OS === 'web'
  ? AsyncStorage.getItem(SESSION_KEY)
  : SecureStore.getItemAsync(SESSION_KEY);

const setStored = (value: string): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.setItem(SESSION_KEY, value)
  : SecureStore.setItemAsync(SESSION_KEY, value);

const removeStored = (): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.removeItem(SESSION_KEY)
  : SecureStore.deleteItemAsync(SESSION_KEY);

let localSessionStorageLock: Promise<void> = Promise.resolve();

const withSessionStorageLock = async <T>(work: () => Promise<T>): Promise<T> => {
  if (
    Platform.OS === 'web'
    && typeof navigator !== 'undefined'
    && navigator.locks?.request
  ) {
    return navigator.locks.request('basta-community-session-v1', { mode: 'exclusive' }, work);
  }
  const previous = localSessionStorageLock;
  let release = (): void => undefined;
  localSessionStorageLock = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
};

const parseSession = (value: unknown): CommunitySession | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CommunitySession>;
  if (
    !candidate.user || typeof candidate.user.id !== 'number'
    || typeof candidate.user.username !== 'string'
    || typeof candidate.user.email !== 'string'
    || typeof candidate.user.name !== 'string'
    || typeof candidate.accessToken !== 'string'
    || typeof candidate.refreshToken !== 'string'
  ) return null;
  return candidate as CommunitySession;
};

const removeStoredIfSameSession = (expected: CommunitySession): Promise<boolean> =>
  withSessionStorageLock(async () => {
    const raw = await getStored();
    let current: CommunitySession | null = null;
    try { current = raw ? parseSession(JSON.parse(raw) as unknown) : null; } catch { current = null; }
    if (
      !current
      || current.user.id !== expected.user.id
      || current.accessToken !== expected.accessToken
      || current.refreshToken !== expected.refreshToken
    ) return false;
    await removeStored();
    return true;
  });

const requireApi = (): string => {
  if (!CIVIC_API_URL) throw new CommunityApiError('API_NOT_CONFIGURED', 'La red todavía no está conectada en esta instalación.');
  return CIVIC_API_URL;
};

const errorFrom = async (response: Response): Promise<CommunityApiError> => {
  const body = await response.json().catch(() => null) as { code?: string; message?: string } | null;
  return new CommunityApiError(
    body?.code ?? `HTTP_${response.status}`,
    body?.message ?? 'La red no pudo completar la acción.',
    response.status,
  );
};

export const getCommunitySession = async (): Promise<CommunitySession | null> => {
  if (sessionResetInFlight) await sessionResetInFlight;
  const generation = sessionGeneration;
  const raw = await getStored();
  if (generation !== sessionGeneration) return null;
  if (!raw) return null;
  try { return parseSession(JSON.parse(raw) as unknown); } catch { return null; }
};

const sessionFromAuthBody = (body: unknown): CommunitySession => {
  if (!body || typeof body !== 'object') throw new CommunityApiError('INVALID_AUTH_RESPONSE', 'La sesión recibida no es válida.');
  const candidate = body as { user?: unknown; tokens?: { accessToken?: unknown; refreshToken?: unknown } };
  const session = parseSession({
    user: candidate.user,
    accessToken: candidate.tokens?.accessToken,
    refreshToken: candidate.tokens?.refreshToken,
  });
  if (!session) throw new CommunityApiError('INVALID_AUTH_RESPONSE', 'La sesión recibida no es válida.');
  return session;
};

const saveSession = async (body: unknown, generation: number): Promise<CommunitySession> => {
  const session = sessionFromAuthBody(body);
  return withSessionStorageLock(async () => {
    if (generation !== sessionGeneration) {
      throw new CommunityApiError('SESSION_RESET', 'La sesión local fue retirada.');
    }
    await setStored(JSON.stringify(session));
    if (generation !== sessionGeneration) {
      await removeStored();
      throw new CommunityApiError('SESSION_RESET', 'La sesión local fue retirada.');
    }
    return session;
  });
};

const linkDevice = async (session: CommunitySession): Promise<void> => {
  const api = requireApi();
  const civicToken = await ensureCivicDeviceToken(api);
  const response = await fetchWithTimeout(`${api}/api/v1/civic/devices/link`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      'x-civic-device-token': civicToken,
    },
  });
  if (!response.ok) throw await errorFrom(response);
};

const authenticate = async (path: '/api/login' | '/api/register', body: Record<string, unknown>): Promise<CommunitySession> => {
  if (sessionResetInFlight) await sessionResetInFlight;
  const generation = sessionGeneration;
  const api = requireApi();
  const response = await fetchWithTimeout(`${api}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await errorFrom(response);
  const session = await saveSession(await response.json() as unknown, generation);
  try {
    await linkDevice(session);
    setCivicFeedPullEnabled(true);
    setSetting(CIVIC_FEED_ENABLED_KEY, '1');
    await syncCivicNetwork();
  } catch (error) {
    setCivicFeedPullEnabled(false);
    setSetting(CIVIC_FEED_ENABLED_KEY, '0');
    clearOperationalFeed();
    await removeStoredIfSameSession(session);
    throw error;
  }
  return session;
};

export const loginCommunity = (username: string, password: string): Promise<CommunitySession> =>
  authenticate('/api/login', { username: username.trim(), password });

export const registerCommunity = (input: {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<CommunitySession> => authenticate('/api/register', {
  ...input,
  name: input.name.trim(),
  email: input.email.trim(),
  username: input.username.trim(),
  _hp: '',
  _t: Date.now() - 4_000,
});

const refreshSession = async (current: CommunitySession): Promise<CommunitySession> => {
  if (sessionResetInFlight) await sessionResetInFlight;
  const generation = sessionGeneration;
  const api = requireApi();
  const response = await fetchWithTimeout(`${api}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const refreshError = response.ok ? null : await errorFrom(response);
  const refreshed = response.ok ? sessionFromAuthBody(await response.json() as unknown) : null;
  if (refreshed && refreshed.user.id !== current.user.id) {
    throw new CommunityApiError('INVALID_AUTH_RESPONSE', 'La sesión renovada cambió de cuenta.');
  }

  return withSessionStorageLock(async () => {
    if (generation !== sessionGeneration) {
      throw new CommunityApiError('SESSION_RESET', 'La sesión local fue retirada.');
    }
    const latestRaw = await getStored();
    let latest: CommunitySession | null = null;
    try { latest = latestRaw ? parseSession(JSON.parse(latestRaw) as unknown) : null; } catch { latest = null; }
    if (
      !latest
      || latest.user.id !== current.user.id
      || latest.refreshToken !== current.refreshToken
    ) {
      throw new CommunityApiError(
        'AUTH_SESSION_CHANGED',
        'La cuenta activa cambió mientras se renovaba la sesión.',
      );
    }
    if (refreshError) {
      await removeStored();
      throw refreshError;
    }
    await setStored(JSON.stringify(refreshed));
    return refreshed!;
  });
};

export const communityFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  let session = await getCommunitySession();
  if (!session) throw new CommunityApiError('AUTH_REQUIRED', 'Vinculá tu cuenta para entrar a los círculos.');
  const api = requireApi();
  const send = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    return fetchWithTimeout(`${api}${path}`, { ...init, headers });
  };
  let response = await send(session.accessToken);
  const authFailure = response.status === 401 || (
    response.status === 403
    && await response.clone().json().then((body: unknown) => (
      body && typeof body === 'object' && 'code' in body && (body as { code?: string }).code === 'INVALID_TOKEN'
    )).catch(() => false)
  );
  if (authFailure) {
    session = await refreshSession(session);
    response = await send(session.accessToken);
  }
  return response;
};

/**
 * Variante para comandos locales ligados a una cuenta concreta. El token se
 * obtiene y se refresca sólo si sigue representando ese userId; así un cambio
 * de sesión entre la pantalla y el fetch no puede enviar la intención de A con
 * las credenciales de B.
 */
export const communityFetchForUser = async (
  expectedUserId: number,
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const requireExpectedSession = async (): Promise<CommunitySession> => {
    const session = await getCommunitySession();
    if (!session || session.user.id !== expectedUserId) {
      throw new CommunityApiError(
        'AUTH_SESSION_CHANGED',
        'La cuenta activa cambió. La operación pendiente se conservó sin enviarse.',
      );
    }
    return session;
  };

  let session = await requireExpectedSession();
  const api = requireApi();
  const send = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    return fetchWithTimeout(`${api}${path}`, { ...init, headers });
  };
  let response = await send(session.accessToken);
  const authFailure = response.status === 401 || (
    response.status === 403
    && await response.clone().json().then((body: unknown) => (
      body && typeof body === 'object' && 'code' in body && (body as { code?: string }).code === 'INVALID_TOKEN'
    )).catch(() => false)
  );
  if (authFailure) {
    session = await requireExpectedSession();
    session = await refreshSession(session);
    if (session.user.id !== expectedUserId) {
      throw new CommunityApiError(
        'AUTH_SESSION_CHANGED',
        'La cuenta activa cambió. La operación pendiente se conservó sin enviarse.',
      );
    }
    response = await send(session.accessToken);
  }
  return response;
};

/**
 * Retira la sesión comunitaria y la proyección descargada del dispositivo.
 * Es un borrado local: no solicita eliminar registros del servidor.
 */
export const resetCommunitySessionAndFeed = async (): Promise<void> => {
  sessionGeneration += 1;
  // Se escribe antes de limpiar para que un ciclo de sync concurrente no
  // vuelva a descargar la proyección si el unlink remoto quedó pendiente.
  setCivicFeedPullEnabled(false);
  setSetting(CIVIC_FEED_ENABLED_KEY, '0');
  clearOperationalFeed();
  const reset = withSessionStorageLock(removeStored);
  sessionResetInFlight = reset;
  try {
    await reset;
  } finally {
    if (sessionResetInFlight === reset) sessionResetInFlight = null;
  }
};

const resetCommunitySessionAndFeedIfSameSession = async (
  expected: CommunitySession,
): Promise<boolean> => {
  const reset = withSessionStorageLock(async () => {
    const raw = await getStored();
    let current: CommunitySession | null = null;
    try { current = raw ? parseSession(JSON.parse(raw) as unknown) : null; } catch { current = null; }
    if (
      !current
      || current.user.id !== expected.user.id
      || current.accessToken !== expected.accessToken
      || current.refreshToken !== expected.refreshToken
    ) return false;
    sessionGeneration += 1;
    // Mantener el gate y el borrado de la proyección dentro del mismo CAS: una
    // sesión B no puede instalarse entre verificar A y limpiar su feed.
    setCivicFeedPullEnabled(false);
    setSetting(CIVIC_FEED_ENABLED_KEY, '0');
    clearOperationalFeed();
    await removeStored();
    return true;
  });
  sessionResetInFlight = reset;
  try {
    return await reset;
  } finally {
    if (sessionResetInFlight === reset) sessionResetInFlight = null;
  }
};

export const logoutCommunity = async (expectedUserId: number): Promise<void> => {
  const session = await getCommunitySession();
  if (
    !Number.isSafeInteger(expectedUserId)
    || expectedUserId <= 0
    || !session
    || session.user.id !== expectedUserId
  ) {
    throw new CommunityApiError(
      'AUTH_SESSION_CHANGED',
      'La cuenta activa cambió antes de cerrar sesión.',
    );
  }
  if (session && CIVIC_API_URL) {
    try {
      const civicToken = await ensureCivicDeviceToken(CIVIC_API_URL);
      await fetchWithTimeout(`${CIVIC_API_URL}/api/v1/civic/devices/unlink`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${session.accessToken}`,
          'x-civic-device-token': civicToken,
        },
      });
    } catch {
      // Cerrar la sesión local no depende de tener red.
    }
  }
  if (!(await resetCommunitySessionAndFeedIfSameSession(session))) {
    throw new CommunityApiError(
      'AUTH_SESSION_CHANGED',
      'La cuenta activa cambió mientras se cerraba la sesión anterior.',
    );
  }
};

export const publicCommunityFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const api = requireApi();
  return fetchWithTimeout(`${api}${path}`, init);
};

export const communityErrorFromResponse = errorFrom;
