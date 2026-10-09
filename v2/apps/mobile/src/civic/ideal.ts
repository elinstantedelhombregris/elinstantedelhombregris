import AsyncStorage from '@react-native-async-storage/async-storage';
import { contribucionSchema, type ContribucionInput } from '@v2/shared';
import { resolveCivicApiUrl } from './config';
import { fetchWithTimeout } from './http';

// Un origen explícito evita enviar el ejercicio nuevo a la API histórica de v1.
export const IDEAL_API = resolveCivicApiUrl(process.env.EXPO_PUBLIC_BASTA_V2_URL, {
  allowLoopbackHttp: typeof __DEV__ !== 'undefined' && __DEV__,
}).url;
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
  if (!IDEAL_API) throw new Error('La conexión con v2 todavía no está configurada.');
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
    throw new Error('No pudimos leer los borradores. Conservá la copia local antes de reiniciar.');
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
    throw new Error(
      'La conexión con v2 todavía no está configurada. Podés guardar tu reflexión en este dispositivo.',
    );
  const respuesta = await fetchIdeal(ruta);
  const body = (await respuesta.json()) as { data: T; error?: { message: string } };
  if (!respuesta.ok) throw new Error(body.error?.message ?? 'No pudimos completar la lectura.');
  return body.data;
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
  const body = (await respuesta.json()) as { data: T; error?: { message: string } };
  if (!respuesta.ok) throw new Error(body.error?.message ?? 'No pudimos completar la acción.');
  return body.data;
}
export async function cuentaIdealActual(): Promise<number | null> {
  if (!IDEAL_API) throw new Error('La conexión con v2 todavía no está configurada.');
  const r = await fetchIdeal('/api/auth/me');
  if (r.status === 401) return null;
  if (!r.ok) throw new Error('No pudimos comprobar la cuenta actual. Tu reflexión sigue guardada.');
  const b = (await r.json()) as { data: { user: { id: number } } };
  if (!Number.isSafeInteger(b.data.user.id)) throw new Error('La cuenta recibida no es válida.');
  return b.data.user.id;
}
export async function publicarIdeal(b: BorradorIdeal): Promise<BorradorIdeal> {
  if (!b.envio) throw new Error('Revisá y autorizá el aporte antes de enviarlo.');
  if (b.cuentaAlConfirmar === undefined)
    throw new Error(
      'Este envío necesita una revisión de la cuenta antes de compartirse. Conservá el borrador y volvé a revisarlo.',
    );
  if ((await cuentaIdealActual()) !== b.cuentaAlConfirmar)
    throw new Error(
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
  const body = (await respuesta.json()) as {
    data?: { idPublico: string };
    error?: { message: string };
  };
  if (!respuesta.ok || !body.data)
    throw new Error(
      body.error?.message ?? 'No llegó un recibo. Conservamos el mismo envío para reintentar.',
    );
  const guardado = { ...b, recibo: body.data.idPublico };
  await guardarIdeal(guardado);
  return guardado;
}
