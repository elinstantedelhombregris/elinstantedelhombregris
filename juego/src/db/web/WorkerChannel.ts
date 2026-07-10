/**
 * Copia corregida de `expo-sqlite/web/WorkerChannel.ts` (v57.0.0) — metro la
 * inyecta en lugar del original SOLO en web (ver resolveRequest en
 * metro.config.js). Autocontenida a propósito: el original importa hermanos
 * relativos que desde acá no resuelven.
 *
 * Dos bugs del upstream que rompen la API sync en web (probados el 2026-07-09,
 * siguen en el canary 57.0.0-canary-20260629):
 *
 * 1. LONGITUD TRUNCADA: `resultArray.set(new Uint32Array([length]), 0)`
 *    convierte ELEMENTOS (no bytes): escribe `length & 0xFF` en UN byte.
 *    El lector hace `new Uint32Array(buffer, 0, 1)[0]` (4 bytes LE), así que
 *    toda respuesta sync de más de 255 bytes llega con el JSON cortado
 *    (SyntaxError). Fix: escribir los 4 bytes de verdad.
 *
 * 2. ERRORES ILEGIBLES: `serialize({ error })` con `error: Error` produce
 *    `{}` (las props de Error no son enumerables) → el main thread muestra
 *    "Error: [object Object]". Fix: mandar SIEMPRE el mensaje como string,
 *    que es lo que el lector ya espera (`error?: string`).
 *
 * Borrar este archivo (y el redirect de metro) cuando upstream lo arregle.
 * El resto del código es copia literal del original.
 */

/* eslint-disable no-restricted-globals */

// ---------------------------------------------------------------------------
// Inlineado de expo-sqlite/web/Deferred.ts (copia literal)
// ---------------------------------------------------------------------------

type DeferredResolve<T> = (value: T | PromiseLike<T>) => void;
type DeferredReject = (reason?: unknown) => void;

class Deferred<T = unknown> {
  promise: Promise<T>;
  private resolveCallback!: DeferredResolve<T>;
  private rejectCallback!: DeferredReject;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
    });
  }

  resolve(value: T) {
    this.resolveCallback(value);
  }

  reject(reason: unknown) {
    this.rejectCallback(reason);
  }

  getPromise(): Promise<T> {
    return this.promise;
  }
}

// ---------------------------------------------------------------------------
// Inlineado de expo-sqlite/web/SyncSerializer.ts (copia literal)
// ---------------------------------------------------------------------------

const UINT8ARRAY_TYPE = '__uint8array__';

interface Uint8ArrayMarker {
  [UINT8ARRAY_TYPE]: true;
  data: number[];
}

function isUint8ArrayMarker(value: unknown): value is Uint8ArrayMarker {
  return (
    value !== null &&
    typeof value === 'object' &&
    UINT8ARRAY_TYPE in value &&
    Array.isArray((value as Uint8ArrayMarker).data)
  );
}

function serialize(value: unknown): string {
  return JSON.stringify(value, (_, v) => {
    if (v instanceof Uint8Array) {
      return {
        [UINT8ARRAY_TYPE]: true,
        data: Array.from(v),
      };
    }
    return v;
  });
}

function deserialize<T>(json: string): T {
  return JSON.parse(json, (_, value) => {
    if (isUint8ArrayMarker(value)) {
      return new Uint8Array(value.data);
    }
    return value;
  }) as T;
}

// ---------------------------------------------------------------------------
// El canal en sí (misma API pública que el original)
// ---------------------------------------------------------------------------

let messageId = 0;
const deferredMap = new Map<number, Deferred>();
const PENDING = 1;
const RESOLVED = 2;

let hasWarnedSync = false;

/** FIX 2: un Error viaja como su mensaje, no como `{}`. */
const errorAMensaje = (error: unknown): string => {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
};

/**
 * For worker to send result to the main thread.
 */
export function sendWorkerResult({
  id,
  result,
  error,
  syncTrait,
}: {
  id: number;
  result: unknown;
  error: Error | null;
  syncTrait?: {
    lockBuffer: SharedArrayBuffer;
    resultBuffer: SharedArrayBuffer;
  };
}) {
  if (syncTrait) {
    const { lockBuffer, resultBuffer } = syncTrait;
    const lock = new Int32Array(lockBuffer);
    const resultArray = new Uint8Array(resultBuffer);
    const resultJson =
      error != null ? serialize({ error: errorAMensaje(error) }) : serialize({ result });
    const resultBytes = new TextEncoder().encode(resultJson);
    const length = resultBytes.length;
    // FIX 1: los 4 bytes little-endian de la longitud (el original escribía 1).
    resultArray.set(new Uint8Array(new Uint32Array([length]).buffer), 0);
    resultArray.set(resultBytes, 4);
    Atomics.store(lock, 0, RESOLVED);
  } else {
    if (result) {
      (self as unknown as Worker).postMessage({ id, result });
    } else {
      (self as unknown as Worker).postMessage({
        id,
        error: error != null ? errorAMensaje(error) : error,
      });
    }
  }
}

/**
 * For main thread to handle worker messages.
 */
export function workerMessageHandler(event: MessageEvent) {
  const { id, result, error, isSync } = event.data;
  if (!isSync) {
    const deferred = deferredMap.get(id);
    if (deferred) {
      if (error) {
        deferred.reject(new Error(error));
      } else {
        deferred.resolve(result);
      }
      deferredMap.delete(id);
    }
  }
}

/**
 * For main thread to invoke worker function asynchronously.
 */
export async function invokeWorkerAsync<T>(
  worker: Worker,
  type: string,
  data: unknown
): Promise<T> {
  const id = messageId++;
  const deferred = new Deferred<T>();
  deferredMap.set(id, deferred as Deferred);
  worker.postMessage({ type, id, data, isSync: false });
  return deferred.getPromise();
}

/**
 * For main thread to invoke worker function synchronously.
 */
export function invokeWorkerSync<T>(worker: Worker, type: string, data: unknown): T {
  if (__DEV__ && !hasWarnedSync) {
    console.warn(
      'Using synchronous SQLite operations can cause significant performance impact. Consider using async operations instead.'
    );
    hasWarnedSync = true;
  }

  const id = messageId++;
  const lockBuffer = new SharedArrayBuffer(4);
  const lock = new Int32Array(lockBuffer);
  const resultBuffer = new SharedArrayBuffer(1024 * 1024);
  const resultArray = new Uint8Array(resultBuffer);

  Atomics.store(lock, 0, PENDING);
  worker.postMessage({
    type,
    id,
    data,
    isSync: true,
    lockBuffer,
    resultBuffer,
  });

  let i = 0;
  const useAtomicsPause = typeof Atomics.pause === 'function';
  while (Atomics.load(lock, 0) === PENDING) {
    ++i;

    if (useAtomicsPause) {
      if (i > 1_000_000) {
        throw new Error('Sync operation timeout');
      }
      Atomics.pause();
    } else {
      // NOTE(kudo): Unfortunate for the busy loop,
      // because we don't have a way for main thread to yield its execution to other callbacks.
      if (i > 1000_000_000) {
        throw new Error('Sync operation timeout');
      }
    }
  }

  const length = new Uint32Array(resultArray.buffer, 0, 1)[0]!;
  const resultCopy = new Uint8Array(length);
  resultCopy.set(new Uint8Array(resultArray.buffer, 4, length));
  const resultJson = new TextDecoder().decode(resultCopy);
  const { result, error } = deserialize<{ result: T; error?: string }>(resultJson);
  if (error) throw new Error(error);
  return result;
}
