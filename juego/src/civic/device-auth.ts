import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getActorKey } from './identity';
import { assertCivicApiTransport } from './config';
import { fetchWithTimeout } from './http';

const SECRET_KEY = 'basta.civic.device-secret.v1';
const TOKEN_KEY = 'basta.civic.device-token.v1';
const TOKEN_EXPIRY_KEY = 'basta.civic.device-token-expiry.v1';
let enrollmentInFlight: Promise<string> | null = null;
let credentialsGeneration = 0;
let credentialsResetInFlight: Promise<void> | null = null;

const getItem = (key: string): Promise<string | null> => Platform.OS === 'web'
  ? AsyncStorage.getItem(key)
  : SecureStore.getItemAsync(key);

const setItem = (key: string, value: string): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.setItem(key, value)
  : SecureStore.setItemAsync(key, value);

const deleteItem = (key: string): Promise<void> => Platform.OS === 'web'
  ? AsyncStorage.removeItem(key)
  : SecureStore.deleteItemAsync(key);

const bytesToHex = (bytes: Uint8Array): string => Array.from(bytes)
  .map((value) => value.toString(16).padStart(2, '0'))
  .join('');

const getDeviceSecret = async (generation: number): Promise<string> => {
  const current = await getItem(SECRET_KEY);
  if (current) {
    if (generation !== credentialsGeneration) throw new Error('civic_device_credentials_reset');
    return current;
  }
  const created = bytesToHex(await Crypto.getRandomBytesAsync(32));
  if (generation !== credentialsGeneration) throw new Error('civic_device_credentials_reset');
  await setItem(SECRET_KEY, created);
  if (generation !== credentialsGeneration) {
    await deleteItem(SECRET_KEY);
    throw new Error('civic_device_credentials_reset');
  }
  return created;
};

interface EnrollmentResponse {
  actorKey: string;
  role: 'contributor' | 'verifier' | 'coordinator';
  linked: boolean;
  accessToken: string;
  expiresAt: string;
}

const isEnrollmentResponse = (value: unknown): value is EnrollmentResponse => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<EnrollmentResponse>;
  return typeof candidate.actorKey === 'string'
    && typeof candidate.accessToken === 'string'
    && typeof candidate.expiresAt === 'string'
    && ['contributor', 'verifier', 'coordinator'].includes(String(candidate.role));
};

export const invalidateCivicDeviceToken = async (): Promise<void> => {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(TOKEN_EXPIRY_KEY)]);
};

/**
 * Retira secreto, token y vencimiento de esta instalación. No revoca por sí
 * sola registros ni credenciales que el servidor ya haya recibido.
 */
export const resetCivicDeviceCredentials = async (): Promise<void> => {
  credentialsGeneration += 1;
  enrollmentInFlight = null;
  const reset = Promise.all([
    deleteItem(SECRET_KEY),
    deleteItem(TOKEN_KEY),
    deleteItem(TOKEN_EXPIRY_KEY),
  ]).then(() => undefined);
  credentialsResetInFlight = reset;
  try {
    await reset;
  } finally {
    if (credentialsResetInFlight === reset) credentialsResetInFlight = null;
  }
};

/**
 * Obtiene una credencial corta para el outbox. El secreto de 256 bits nunca
 * entra a SQLite ni a los eventos. Nativo usa Keychain/Keystore; el cliente
 * web todavía depende de almacenamiento del perfil y no debe tratarse como
 * bóveda. El transporte se valida antes de leer o crear el secreto.
 */
export const ensureCivicDeviceToken = async (apiUrl: string): Promise<string> => {
  const safeApiUrl = assertCivicApiTransport(apiUrl);
  if (credentialsResetInFlight) await credentialsResetInFlight;
  const generation = credentialsGeneration;
  const [token, expiresAt] = await Promise.all([getItem(TOKEN_KEY), getItem(TOKEN_EXPIRY_KEY)]);
  if (generation !== credentialsGeneration) throw new Error('civic_device_credentials_reset');
  if (token && expiresAt && Date.parse(expiresAt) > Date.now() + 60_000) return token;
  if (enrollmentInFlight) return enrollmentInFlight;

  const enrollment = (async () => {
    const [actorKey, deviceSecret] = await Promise.all([getActorKey(), getDeviceSecret(generation)]);
    const response = await fetchWithTimeout(`${safeApiUrl}/api/v1/civic/devices/enroll`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        actorKey,
        deviceSecret,
        platform: Platform.OS,
        clientVersion: Constants.expoConfig?.version ?? 'dev',
      }),
    });
    const body = await response.json().catch(() => null) as unknown;
    if (!response.ok || !isEnrollmentResponse(body) || body.actorKey !== actorKey) {
      const code = body && typeof body === 'object' && 'code' in body ? String(body.code) : `HTTP_${response.status}`;
      throw new Error(`civic_device_enrollment_failed:${code}`);
    }
    if (generation !== credentialsGeneration) {
      throw new Error('civic_device_credentials_reset');
    }
    await Promise.all([
      setItem(TOKEN_KEY, body.accessToken),
      setItem(TOKEN_EXPIRY_KEY, body.expiresAt),
    ]);
    if (generation !== credentialsGeneration) {
      await Promise.all([deleteItem(TOKEN_KEY), deleteItem(TOKEN_EXPIRY_KEY)]);
      throw new Error('civic_device_credentials_reset');
    }
    return body.accessToken;
  })();
  enrollmentInFlight = enrollment;

  try {
    return await enrollment;
  } finally {
    if (enrollmentInFlight === enrollment) enrollmentInFlight = null;
  }
};
