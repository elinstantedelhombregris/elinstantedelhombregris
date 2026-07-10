/**
 * QR codec — chispas y expediciones cara a cara (spec §3.2, §3.5).
 *
 * Formato: `basta.chispa.v1:<base64url(json)>` y `basta.exped.v1:<...>`.
 * Prefijo versionado para poder evolucionar el payload sin romper lectores.
 *
 * Base64url y UTF-8 implementados a mano (alfabeto propio, sin padding):
 * ni Buffer (Node) ni atob/btoa (no confiables en Hermes) — el mismo código
 * corre en RN Hermes, en el preview web y en los tests de Node.
 */

export const PREFIJO_CHISPA = 'basta.chispa.v1:';
export const PREFIJO_EXPED = 'basta.exped.v1:';

/** Payload de una chispa regalada. `brasas` es SIEMPRE 5 (spec §3.5). */
export interface ChispaPayload {
  /** Nonce one-shot: anti-replay local (se guarda al canjear). */
  nonce: string;
  brasas: 5;
  /** Nombre de quien regala — puede tener unicode, emojis, lo que sea. */
  de: string;
}

/** Definición viajera de una expedición (spec §3.2). */
export interface ExpedicionPayload {
  plantillaId: string;
  zona: string;
  /** Meta de entradas — entero 1..10000. */
  meta: number;
  titulo: string;
}

export type ResultadoQR<T> =
  | { ok: true; payload: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// UTF-8 manual (maneja pares sustitutos → code points de 4 bytes)
// ---------------------------------------------------------------------------

const utf8Bytes = (texto: string): number[] => {
  const bytes: number[] = [];
  for (const ch of texto) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return bytes;
};

/** Decodifica UTF-8; devuelve null si la secuencia está rota. */
const utf8Texto = (bytes: number[]): string | null => {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i]!;
    let cp: number;
    let extra: number;
    if (b0 < 0x80) {
      cp = b0;
      extra = 0;
    } else if ((b0 & 0xe0) === 0xc0) {
      cp = b0 & 0x1f;
      extra = 1;
    } else if ((b0 & 0xf0) === 0xe0) {
      cp = b0 & 0x0f;
      extra = 2;
    } else if ((b0 & 0xf8) === 0xf0) {
      cp = b0 & 0x07;
      extra = 3;
    } else {
      return null;
    }
    if (i + extra >= bytes.length) return null;
    for (let j = 1; j <= extra; j++) {
      const b = bytes[i + j]!;
      if ((b & 0xc0) !== 0x80) return null;
      cp = (cp << 6) | (b & 0x3f);
    }
    if (cp > 0x10ffff) return null;
    out += String.fromCodePoint(cp);
    i += extra + 1;
  }
  return out;
};

// ---------------------------------------------------------------------------
// Base64url manual, sin padding
// ---------------------------------------------------------------------------

const ALFABETO =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const b64urlCodificar = (bytes: number[]): string => {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += ALFABETO[b0 >> 2]!;
    out += ALFABETO[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)]!;
    if (b1 === undefined) break;
    out += ALFABETO[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)]!;
    if (b2 === undefined) break;
    out += ALFABETO[b2 & 0x3f]!;
  }
  return out;
};

/** Devuelve null si hay caracteres fuera del alfabeto o largo imposible. */
const b64urlDecodificar = (s: string): number[] | null => {
  if (s.length % 4 === 1) return null; // largo imposible en base64 sin padding
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of s) {
    const v = ALFABETO.indexOf(ch);
    if (v === -1) return null;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
};

// ---------------------------------------------------------------------------
// Codificación genérica prefijo + JSON
// ---------------------------------------------------------------------------

const codificar = (prefijo: string, payload: unknown): string =>
  prefijo + b64urlCodificar(utf8Bytes(JSON.stringify(payload)));

const decodificarJSON = (
  raw: string,
  prefijo: string,
  errorPrefijo: string,
): ResultadoQR<unknown> => {
  if (typeof raw !== 'string' || !raw.startsWith(prefijo)) {
    return { ok: false, error: errorPrefijo };
  }
  const bytes = b64urlDecodificar(raw.slice(prefijo.length));
  const texto = bytes === null ? null : utf8Texto(bytes);
  if (texto === null) return { ok: false, error: 'El código está dañado' };
  try {
    return { ok: true, payload: JSON.parse(texto) as unknown };
  } catch {
    return { ok: false, error: 'El código está dañado' };
  }
};

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const esTexto = (v: unknown, min: number, max: number): v is string =>
  typeof v === 'string' && v.length >= min && v.length <= max;

// ---------------------------------------------------------------------------
// Chispas
// ---------------------------------------------------------------------------

/** Cotas del payload de chispa. */
export const LIMITES_CHISPA = { nonceMin: 8, nonceMax: 64, deMax: 80 } as const;

/** Valida forma y cotas de un payload de chispa ya parseado. */
export const validarChispa = (v: unknown): v is ChispaPayload =>
  esObjeto(v) &&
  esTexto(v.nonce, LIMITES_CHISPA.nonceMin, LIMITES_CHISPA.nonceMax) &&
  v.brasas === 5 &&
  esTexto(v.de, 0, LIMITES_CHISPA.deMax);

/** Genera el string QR de una chispa. Tira Error si el payload es inválido. */
export const codificarChispa = (payload: ChispaPayload): string => {
  if (!validarChispa(payload)) throw new Error('Payload de chispa inválido');
  return codificar(PREFIJO_CHISPA, payload);
};

/** Lee un QR de chispa: valida prefijo, JSON, forma y cotas. */
export const decodificarChispa = (raw: string): ResultadoQR<ChispaPayload> => {
  const r = decodificarJSON(raw, PREFIJO_CHISPA, 'No es un código de chispa');
  if (!r.ok) return r;
  if (!validarChispa(r.payload)) {
    return { ok: false, error: 'No es una chispa válida' };
  }
  return { ok: true, payload: r.payload };
};

// ---------------------------------------------------------------------------
// Expediciones
// ---------------------------------------------------------------------------

/** Cotas del payload de expedición. */
export const LIMITES_EXPED = {
  plantillaIdMax: 64,
  zonaMax: 120,
  tituloMax: 120,
  metaMin: 1,
  metaMax: 10000,
} as const;

/** Valida forma y cotas de un payload de expedición ya parseado. */
export const validarExpedicion = (v: unknown): v is ExpedicionPayload =>
  esObjeto(v) &&
  esTexto(v.plantillaId, 1, LIMITES_EXPED.plantillaIdMax) &&
  esTexto(v.zona, 1, LIMITES_EXPED.zonaMax) &&
  esTexto(v.titulo, 1, LIMITES_EXPED.tituloMax) &&
  typeof v.meta === 'number' &&
  Number.isInteger(v.meta) &&
  v.meta >= LIMITES_EXPED.metaMin &&
  v.meta <= LIMITES_EXPED.metaMax;

/** Genera el string QR de una expedición. Tira Error si es inválida. */
export const codificarExpedicion = (payload: ExpedicionPayload): string => {
  if (!validarExpedicion(payload)) {
    throw new Error('Payload de expedición inválido');
  }
  return codificar(PREFIJO_EXPED, payload);
};

/** Lee un QR de expedición: valida prefijo, JSON, forma y cotas. */
export const decodificarExpedicion = (
  raw: string,
): ResultadoQR<ExpedicionPayload> => {
  const r = decodificarJSON(raw, PREFIJO_EXPED, 'No es un código de expedición');
  if (!r.ok) return r;
  if (!validarExpedicion(r.payload)) {
    return { ok: false, error: 'No es una expedición válida' };
  }
  return { ok: true, payload: r.payload };
};

/** ¿Qué clase de QR ¡BASTA! es este string? (para el escáner). */
export const tipoDeQR = (raw: string): 'chispa' | 'expedicion' | null =>
  raw.startsWith(PREFIJO_CHISPA)
    ? 'chispa'
    : raw.startsWith(PREFIJO_EXPED)
      ? 'expedicion'
      : null;
