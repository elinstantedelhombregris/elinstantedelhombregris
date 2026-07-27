/**
 * Social cara a cara — cáscara fina sobre settings (spec §3.5).
 *
 * Acá viven las claves y helpers que comparten qr / compartir / ajustes:
 * el nombre del jugador (viaja en las chispas como `de`), el círculo local
 * (v1 mínimo: {nombre, glifoSeed, miembros} en un JSON de settings) y el
 * nonce one-shot de las chispas. Las reglas puras siguen en src/game.
 */

import { getSetting, setSetting } from '@/db/repos';
import { LIMITES_CHISPA, LIMITES_CIRCULO } from '@/game/qr-codec';

/** Claves de settings del mundo social (G5). */
export const CLAVES_SOCIAL = {
  /** Nombre opcional del jugador — solo para el `de` de las chispas. */
  nombre: 'nombre_jugador',
  /** JSON del círculo local: {nombre, glifoSeed, miembros}. */
  circulo: 'circulo_local',
  /** '1' si la notificación diaria de las 20:00 está activa. */
  notifDiaria: 'notif_diaria',
} as const;

/** Nombre del jugador ('' si nunca lo cargó). */
export const leerNombre = (): string => getSetting(CLAVES_SOCIAL.nombre) ?? '';

/** Guarda el nombre, recortado a la cota que acepta el QR de chispa. */
export const guardarNombre = (nombre: string): void => {
  setSetting(CLAVES_SOCIAL.nombre, nombre.trim().slice(0, LIMITES_CHISPA.deMax));
};

/** El círculo local del jugador (uno solo en v1 — spec §3.5). */
export interface CirculoLocal {
  nombre: string;
  glifoSeed: string;
  /** Manos contadas cara a cara (arranca en 1: vos). */
  miembros: number;
}

const esCirculoLocal = (v: unknown): v is CirculoLocal =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as CirculoLocal).nombre === 'string' &&
  (v as CirculoLocal).nombre.length >= LIMITES_CIRCULO.nombreMin &&
  (v as CirculoLocal).nombre.length <= LIMITES_CIRCULO.nombreMax &&
  typeof (v as CirculoLocal).glifoSeed === 'string' &&
  (v as CirculoLocal).glifoSeed.length > 0 &&
  typeof (v as CirculoLocal).miembros === 'number' &&
  Number.isInteger((v as CirculoLocal).miembros) &&
  (v as CirculoLocal).miembros >= 1;

/** Lee el círculo local; null si no hay o el JSON está roto. */
export const leerCirculo = (): CirculoLocal | null => {
  const raw = getSetting(CLAVES_SOCIAL.circulo);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return esCirculoLocal(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Persiste (o pisa) el círculo local. */
export const guardarCirculo = (circulo: CirculoLocal): void => {
  setSetting(CLAVES_SOCIAL.circulo, JSON.stringify(circulo));
};

const ALFABETO_NONCE = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Nonce one-shot para chispas: 16 chars al azar (crypto si existe,
 * Math.random como último recurso — alcanza: el nonce es anti-replay
 * local, no un secreto).
 */
export const nonceAleatorio = (largo = 16): string => {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(largo));
    return [...bytes].map((b) => ALFABETO_NONCE[b % ALFABETO_NONCE.length]!).join('');
  }
  return Array.from(
    { length: largo },
    () => ALFABETO_NONCE[Math.floor(Math.random() * ALFABETO_NONCE.length)]!,
  ).join('');
};
