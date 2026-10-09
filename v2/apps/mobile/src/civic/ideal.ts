import AsyncStorage from '@react-native-async-storage/async-storage';
import { contribucionSchema, type ContribucionInput } from '@v2/shared';
import { resolveCivicApiUrl } from './config';
import { fetchWithTimeout } from './http';

// Un origen explícito evita enviar el ejercicio nuevo a la API histórica de v1.
export const IDEAL_API = resolveCivicApiUrl(process.env.EXPO_PUBLIC_BASTA_V2_URL, {
  allowLoopbackHttp: typeof __DEV__ !== 'undefined' && __DEV__,
}).url;
/**
 * Un error pensado para mostrarse tal cual: su mensaje está en castellano y dice qué pasó. Lo
 * lanzamos nosotros (copy local o el mensaje que el servidor mandó) y `status` conserva el estado
 * HTTP cuando vino de una respuesta, para distinguir «no ingresaste» (401) de cualquier otra falla.
 */
export class ErrorIdeal extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ErrorIdeal';
    this.status = status;
  }
}
/** Sólo un 401 significa que la sesión ya no vale; una falla de red o un 5xx no la tocan. */
export const esErrorDeSesion = (e: unknown): boolean => e instanceof ErrorIdeal && e.status === 401;

export const MENSAJE_SIN_CONEXION =
  'No hay conexión. Tu texto sigue guardado en este teléfono; probá de nuevo cuando tengas señal.';
export const MENSAJE_DE_NUESTRO_LADO = 'Algo falló de nuestro lado. Probá de nuevo en un rato.';
const FALLA_DE_RED = /network request failed|failed to fetch|network error|load failed|offline/i;
function esSinConexion(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const { name, message } = e as { name?: unknown; message?: unknown };
  // El corte de `fetchWithTimeout` es un AbortError: para quien espera es lo mismo que no tener señal.
  if (name === 'AbortError' || name === 'TimeoutError') return true;
  return e instanceof TypeError && FALLA_DE_RED.test(String(message));
}
/** Los mensajes de un ZodError, sin repetir. Se reconoce por forma: la app no depende de `zod` directamente. */
function mensajesDeZod(e: unknown): string | null {
  if (typeof e !== 'object' || e === null) return null;
  const { name, issues } = e as { name?: unknown; issues?: unknown };
  if (name !== 'ZodError' || !Array.isArray(issues)) return null;
  const mensajes = (issues as unknown[])
    .map((i) => (typeof i === 'object' && i !== null ? (i as { message?: unknown }).message : null))
    .filter((m): m is string => typeof m === 'string' && m.length > 0);
  return mensajes.length ? [...new Set(mensajes)].join(' ') : null;
}
/**
 * Lo que la persona lee cuando algo falla. Nunca el `message` crudo de una excepción técnica
 * («Network request failed», «JSON Parse error…», el volcado de un ZodError).
 *  - Sin conexión o sin respuesta a tiempo: dice que su texto sigue guardado.
 *  - Una validación del contrato (Zod): las razones, en castellano.
 *  - Un `ErrorIdeal` que no es del servidor caído: su propio mensaje, que ya está pensado para leerse
 *    («Email o contraseña incorrectos», «La cuenta cambió…»).
 *  - Todo lo demás, incluido un 5xx: que falló de nuestro lado.
 */
export function mensajeDeRed(e: unknown): string {
  if (esSinConexion(e)) return MENSAJE_SIN_CONEXION;
  const zod = mensajesDeZod(e);
  if (zod) return zod;
  if (e instanceof ErrorIdeal && (e.status === null || e.status < 500)) return e.message;
  return MENSAJE_DE_NUESTRO_LADO;
}
/** La respuesta de error del servidor como `ErrorIdeal`, aunque el cuerpo no sea JSON (un proxy caído, un 502). */
async function errorDeRespuesta(r: Response, porDefecto: string): Promise<ErrorIdeal> {
  const cuerpo = (await r.json().catch(() => null)) as { error?: { message?: unknown } } | null;
  const mensaje = cuerpo?.error?.message;
  return new ErrorIdeal(typeof mensaje === 'string' && mensaje ? mensaje : porDefecto, r.status);
}
export interface BorradorIdeal {
  id: string;
  texto: string;
  tema: string;
  campanaId: string | null;
  edicion: number | null;
  modo: 'personal' | 'asistido';
  fecha: string;
  envio: ContribucionInput | null;
  recibo: string | null;
  cuentaAlConfirmar?: number | null;
}
const KEY = 'basta.ideal.borradores.v1';
async function fetchIdeal(ruta: string, init: RequestInit = {}): Promise<Response> {
  if (!IDEAL_API) throw new ErrorIdeal('La conexión con v2 todavía no está configurada.');
  const enviar = (opciones: RequestInit) =>
    fetchWithTimeout(IDEAL_API + ruta, { ...opciones, credentials: 'include' });
  let r = await enviar(init);
  if (r.status !== 401 || ruta.startsWith('/api/auth/login') || ruta.startsWith('/api/auth/2fa/'))
    return r;
  const contexto = await fetchWithTimeout(IDEAL_API + '/api/v1/contribuciones/contexto', {
    credentials: 'include',
  });
  if (!contexto.ok) return r;
  const c = (await contexto.json()) as { data: { csrfToken: string } };
  const renovar = await fetchWithTimeout(IDEAL_API + '/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': c.data.csrfToken },
    body: '{}',
  });
  if (!renovar.ok) return r;
  const sesion = (await renovar.json()) as { data: { csrfToken: string } };
  const headers = new Headers(init.headers);
  if (init.method && init.method !== 'GET' && init.method !== 'HEAD')
    headers.set('X-CSRF-Token', sesion.data.csrfToken);
  r = await enviar({ ...init, headers });
  return r;
}
let escritura: Promise<unknown> = Promise.resolve();
export async function borradoresIdeales(): Promise<BorradorIdeal[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const lista: unknown = JSON.parse(raw);
  if (!Array.isArray(lista))
    throw new ErrorIdeal(
      'No pudimos leer los borradores. Conservá la copia local antes de reiniciar.',
    );
  return lista as BorradorIdeal[];
}
export function guardarIdeal(b: BorradorIdeal): Promise<void> {
  const siguiente = escritura
    .catch(() => undefined)
    .then(async () => {
      const lista = await borradoresIdeales();
      await AsyncStorage.setItem(KEY, JSON.stringify([...lista.filter((x) => x.id !== b.id), b]));
    });
  escritura = siguiente;
  return siguiente;
}
export function borrarIdeal(id: string): Promise<void> {
  const siguiente = escritura
    .catch(() => undefined)
    .then(async () => {
      const lista = await borradoresIdeales();
      await AsyncStorage.setItem(KEY, JSON.stringify(lista.filter((x) => x.id !== id)));
    });
  escritura = siguiente;
  return siguiente;
}
export async function leerIdeal<T>(ruta: string): Promise<T> {
  if (!IDEAL_API)
    throw new ErrorIdeal(
      'La conexión con v2 todavía no está configurada. Podés guardar tu reflexión en este dispositivo.',
    );
  const respuesta = await fetchIdeal(ruta);
  if (!respuesta.ok) throw await errorDeRespuesta(respuesta, 'No pudimos completar la lectura.');
  return ((await respuesta.json()) as { data: T }).data;
}
/** La sesión nueva vive en cookies httpOnly del transporte; no copiamos JWT al almacenamiento local. */
export async function escribirIdeal<T>(
  ruta: string,
  cuerpo: unknown,
  metodo: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST',
): Promise<T> {
  const contexto = await leerIdeal<{ csrfToken: string }>('/api/v1/contribuciones/contexto');
  const respuesta = await fetchIdeal(ruta, {
    method: metodo,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': contexto.csrfToken },
    body: JSON.stringify(cuerpo),
  });
  if (!respuesta.ok) throw await errorDeRespuesta(respuesta, 'No pudimos completar la acción.');
  return ((await respuesta.json()) as { data: T }).data;
}
export async function cuentaIdealActual(): Promise<number | null> {
  if (!IDEAL_API) throw new ErrorIdeal('La conexión con v2 todavía no está configurada.');
  const r = await fetchIdeal('/api/auth/me');
  if (r.status === 401) return null;
  if (!r.ok)
    throw new ErrorIdeal(
      'No pudimos comprobar la cuenta actual. Tu reflexión sigue guardada.',
      r.status,
    );
  const b = (await r.json()) as { data: { user: { id: number } } };
  if (!Number.isSafeInteger(b.data.user.id))
    throw new ErrorIdeal('La cuenta recibida no es válida.');
  return b.data.user.id;
}
export async function publicarIdeal(b: BorradorIdeal): Promise<BorradorIdeal> {
  if (!b.envio) throw new ErrorIdeal('Revisá y autorizá el aporte antes de enviarlo.');
  if (b.cuentaAlConfirmar === undefined)
    throw new ErrorIdeal(
      'Este envío necesita una revisión de la cuenta antes de compartirse. Conservá el borrador y volvé a revisarlo.',
    );
  if ((await cuentaIdealActual()) !== b.cuentaAlConfirmar)
    throw new ErrorIdeal(
      'La cuenta cambió desde que autorizaste el envío. Ingresá con esa cuenta para reintentar; el borrador sigue guardado.',
    );
  const envio = contribucionSchema.parse(b.envio);
  const contexto = await leerIdeal<{ csrfToken: string }>('/api/v1/contribuciones/contexto');
  const respuesta = await fetchWithTimeout(IDEAL_API + '/api/v1/contribuciones', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': contexto.csrfToken },
    body: JSON.stringify(envio),
  });
  const body = (await respuesta.json().catch(() => null)) as {
    data?: { idPublico: string };
    error?: { message?: unknown };
  } | null;
  if (!respuesta.ok || !body?.data) {
    const mensaje = body?.error?.message;
    throw new ErrorIdeal(
      typeof mensaje === 'string' && mensaje
        ? mensaje
        : 'No llegó un recibo. Conservamos el mismo envío para reintentar.',
      respuesta.status,
    );
  }
  const guardado = { ...b, recibo: body.data.idPublico };
  await guardarIdeal(guardado);
  return guardado;
}
