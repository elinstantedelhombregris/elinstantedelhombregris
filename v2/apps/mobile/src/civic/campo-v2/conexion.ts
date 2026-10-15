import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { paqueteCampoSchema, estadoEvidenciaCampoSchema, type PaqueteCampo } from '@v2/shared';
import { resolveCivicApiUrl } from '../config';

const KEY = 'basta.campo-v2';
const api = resolveCivicApiUrl(process.env.EXPO_PUBLIC_V2_API_URL, {
  allowLoopbackHttp: typeof __DEV__ !== 'undefined' && __DEV__,
}).url;
export type ConexionCampo = {
  token: string;
  usuarioId: number;
  dispositivoId: string;
  origen: string;
};
let generacion = 0;
let escritura = Promise.resolve();
function guardarSeguro(work: () => Promise<void>): Promise<void> {
  const next = escritura.then(work, work);
  escritura = next.catch(() => undefined);
  return next;
}
export class ErrorCampo extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function leerConexion(): Promise<ConexionCampo | null> {
  if (Platform.OS === 'web') return null;
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  const v = JSON.parse(raw) as Partial<ConexionCampo>;
  if (
    v.origen !== api ||
    typeof v.token !== 'string' ||
    !/^[a-f0-9]{64}$/.test(v.token) ||
    !Number.isSafeInteger(v.usuarioId) ||
    typeof v.dispositivoId !== 'string'
  )
    throw new Error(
      'La vinculación no corresponde a esta instalación. Volvé a vincular el teléfono.',
    );
  return v as ConexionCampo;
}
async function consultar(token: string, ruta: string, body?: unknown): Promise<unknown> {
  if (!api) throw new Error('Esta instalación todavía no tiene configurada la web v2.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(api + '/api/campo-nativo' + ruta, {
      signal: controller.signal,
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'omit',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const v = (await r.json()) as { data?: unknown; error?: { message?: string } };
    if (!r.ok)
      throw new ErrorCampo(r.status, v.error?.message ?? 'No pudimos completar la sincronización.');
    return v.data;
  } finally {
    clearTimeout(timer);
  }
}
export async function vincularTelefono(token: string): Promise<ConexionCampo> {
  if (Platform.OS === 'web')
    throw new Error('Usá la app instalada en iOS o Android para vincular el teléfono.');
  if (!api) throw new Error('Esta instalación todavía no tiene configurada la web v2.');
  if (!/^[a-f0-9]{64}$/.test(token.trim()))
    throw new Error('Pegá la clave completa generada en la web.');
  const version = ++generacion;
  const p = paqueteCampoSchema.parse(await consultar(token.trim(), '/tareas'));
  const c = {
    token: token.trim(),
    usuarioId: p.usuarioId,
    dispositivoId: p.dispositivoId,
    origen: api,
  };
  if (version !== generacion) throw new Error('La vinculación cambió.');
  await guardarSeguro(async () => {
    if (version !== generacion) throw new Error('La vinculación cambió.');
    await SecureStore.setItemAsync(KEY, JSON.stringify(c));
    if (version !== generacion) {
      await SecureStore.deleteItemAsync(KEY);
      throw new Error('La vinculación cambió.');
    }
  });
  return c;
}
export async function desconectarTelefono(): Promise<void> {
  generacion++;
  if (Platform.OS === 'web') return;
  await guardarSeguro(() => SecureStore.deleteItemAsync(KEY));
}
export async function pedirCampo(c: ConexionCampo, ruta: string, body?: unknown): Promise<unknown> {
  const actual = await leerConexion();
  if (
    !actual ||
    actual.token !== c.token ||
    actual.usuarioId !== c.usuarioId ||
    actual.origen !== c.origen
  )
    throw new ErrorCampo(401, 'La cuenta cambió. Conservamos el envío sin enviarlo.');
  const resultado = await consultar(c.token, ruta, body);
  // Un acuse de escritura pertenece al envío original. Una lectura tardía,
  // en cambio, no puede volver a poblar el teléfono después de desconectarlo.
  if (body === undefined) {
    const vigente = await leerConexion();
    if (
      !vigente ||
      vigente.token !== c.token ||
      vigente.usuarioId !== c.usuarioId ||
      vigente.origen !== c.origen
    )
      throw new ErrorCampo(
        401,
        'La vinculación cambió durante la consulta. No se descargaron datos.',
      );
  }
  return resultado;
}
export async function descargarTareas(c: ConexionCampo): Promise<PaqueteCampo['items']> {
  const items: PaqueteCampo['items'] = [];
  let cursor: number | null = null;
  do {
    const p = paqueteCampoSchema.parse(
      await pedirCampo(c, '/tareas' + (cursor ? `?cursor=${cursor}` : '')),
    );
    if (p.usuarioId !== c.usuarioId || p.dispositivoId !== c.dispositivoId)
      throw new Error('La respuesta pertenece a otra vinculación.');
    items.push(...p.items);
    if (p.siguiente !== null && p.siguiente <= (cursor ?? 0))
      throw new Error('No pudimos avanzar en las tareas.');
    cursor = p.siguiente;
  } while (cursor !== null);
  return items;
}
export async function estadoEvidencia(c: ConexionCampo, id: number) {
  return estadoEvidenciaCampoSchema.parse(await pedirCampo(c, `/evidencias/${id}`));
}
