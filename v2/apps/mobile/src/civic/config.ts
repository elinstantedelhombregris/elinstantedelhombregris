export interface CivicApiUrlPolicy {
  allowLoopbackHttp?: boolean;
}

export type CivicApiUrlResolution =
  | { url: string; error: null }
  | { url: null; error: 'invalid_url' | 'unsupported_protocol' | 'credentials_forbidden' | 'insecure_transport' };

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

/**
 * Resuelve el origen de red sin confiar en que una configuración de build sea
 * correcta. HTTP sólo existe para loopback durante desarrollo explícito.
 */
export const resolveCivicApiUrl = (
  raw: string | null | undefined,
  policy: CivicApiUrlPolicy = {},
): CivicApiUrlResolution => {
  const input = raw?.trim();
  if (!input) return { url: null, error: 'invalid_url' };
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { url: null, error: 'invalid_url' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { url: null, error: 'unsupported_protocol' };
  }
  if (parsed.username || parsed.password) {
    return { url: null, error: 'credentials_forbidden' };
  }
  if (
    parsed.protocol === 'http:'
    && !(policy.allowLoopbackHttp === true && LOOPBACK_HOSTS.has(parsed.hostname))
  ) {
    return { url: null, error: 'insecure_transport' };
  }
  parsed.hash = '';
  parsed.search = '';
  return { url: parsed.toString().replace(/\/$/, ''), error: null };
};

const DEVELOPMENT_BUILD = typeof __DEV__ !== 'undefined' && __DEV__;
const civicApiResolution = resolveCivicApiUrl(
  process.env.EXPO_PUBLIC_CIVIC_API_URL,
  { allowLoopbackHttp: DEVELOPMENT_BUILD },
);

/** Null significa red deshabilitada y nunca debe degradar a un origen inseguro. */
export const CIVIC_API_URL = civicApiResolution.url;
export const CIVIC_API_URL_ERROR = civicApiResolution.error;

export const assertCivicApiTransport = (raw: string): string => {
  const resolution = resolveCivicApiUrl(raw, { allowLoopbackHttp: DEVELOPMENT_BUILD });
  if (!resolution.url) throw new Error(`civic_api_configuration_error:${resolution.error}`);
  return resolution.url;
};

/** `0` corta todo pull aunque el unlink remoto haya fallado sin conexión. */
export const CIVIC_FEED_ENABLED_KEY = 'civic_feed_enabled_v1';
