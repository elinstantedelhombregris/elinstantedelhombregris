/**
 * Cookie-first API client.
 *
 * - All requests use `credentials: 'include'` so the browser sends and
 *   stores the httpOnly auth cookies set by the API.
 * - There is no token in localStorage. The cookie does the work.
 * - For state-changing methods, callers must pass the CSRF token from
 *   `useCsrfToken()`. The token is read from a non-httpOnly cookie set
 *   by the API on first navigation.
 */
import { xpEventBus, type XpEvent } from './xp-event-bus.js';
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

interface RequestOptions {
  signal?: AbortSignal;
  csrfToken?: string;
  body?: unknown;
}

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (!safeMethods.has(method) && opts.csrfToken) {
    headers['X-CSRF-Token'] = opts.csrfToken;
  }

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers,
  };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }
  if (opts.signal) {
    init.signal = opts.signal;
  }

  const res = await fetch(path, init);

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(res.status, 'INVALID_JSON', 'La respuesta del servidor no es JSON válido.');
  }

  if (!res.ok || json.error) {
    const code = json.error?.code ?? 'UNKNOWN_ERROR';
    const message = json.error?.message ?? 'Error inesperado.';
    throw new ApiError(res.status, code, message, json.error?.details);
  }

  const data = json.data as T;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if ('xpEvent' in record) {
      const evt = record.xpEvent as XpEvent | undefined;
      if (evt) {
        xpEventBus.publish(evt);
      }
      delete record.xpEvent;
    }
  }
  return data;
}

export const api = {
  get: <T,>(path: string, opts?: RequestOptions): Promise<T> => request<T>('GET', path, opts),
  post: <T,>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T,>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('PATCH', path, { ...opts, body }),
  put: <T,>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('PUT', path, { ...opts, body }),
  del: <T,>(path: string, opts?: RequestOptions): Promise<T> => request<T>('DELETE', path, opts),
};
