/**
 * El catálogo del Estado, servido desde casa.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.1, §4.2, §4.3 y §4.5.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 4.
 *
 * Tres cosas viven acá y no en `routes.ts`, y las tres por la misma razón —que
 * un handler no debería poder equivocarse en ellas:
 *
 *   1. **Las cuatro políticas de caché**, que son cuatro y no una porque los
 *      espacios de URL son distintos. `/calles?q=` es INFINITO: cachearlo 24 h
 *      no protege nada y le regala a quien quiera un fallo de caché por cada
 *      tipeo. `/paquete/:corrida/...` es lo contrario: su contenido no cambia
 *      nunca, porque una corrida nueva es una URL nueva.
 *   2. **La forma canónica del texto de búsqueda.** Si el `q` que llegó no es
 *      igual a su normalización, se responde 308 a la URL canónica, así el edge
 *      guarda un objeto por consulta REAL y no uno por variante tipográfica.
 *   3. **El techo de tiempo del router**, que se le pasa a los repositorios y
 *      que hace cumplir el motor (ver `conTechoDeTiempo` en `@v2/db`).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

import { normalizarNombreDeCalle, normalizarNombreDeLugar } from '@v2/civic-core';
import { GeoCallesRepository, GeographicRepository, getDb } from '@v2/db';

import { getConfig } from '../../lib/config.js';

import type { Ancestros, Db, PaqueteDeCalles } from '@v2/db';
import type { Response } from 'express';

/**
 * `statement_timeout` de 2 s para todo lo que sirve este router (§4.1).
 *
 * No es el limitador de tasa el que acota el costo por request —ése cuenta por
 * instancia de lambda y bajo concurrencia deja de ser un límite—, así que el
 * techo real son el `LIMIT` de a lo sumo 50 y este número, que corta del lado
 * del motor y no del lado de una promesa abandonada.
 */
export const TECHO_DEL_ROUTER_MS = 2000;

export interface RepositoriosDelCatalogo {
  calles: GeoCallesRepository;
  lugares: GeographicRepository;
}

/** Los dos repositorios del callejero, con el techo del router ya puesto. */
export function repositoriosDelCatalogo(db: Db = getDb()): RepositoriosDelCatalogo {
  const opciones = { techoMs: TECHO_DEL_ROUTER_MS };
  return {
    calles: new GeoCallesRepository(db, opciones),
    lugares: new GeographicRepository(db, opciones),
  };
}

// ---------------------------------------------------------------------------
// Caché
// ---------------------------------------------------------------------------

/**
 * Las cuatro políticas de §4.1, con el porqué de cada una pegado al valor para
 * que nadie las unifique «por prolijidad».
 */
export const CACHE = {
  /** `/version` — 200 bytes, y es lo que le dice al teléfono si su catálogo quedó viejo. */
  ninguna: 'no-cache',
  /** `/paquete/:corrida/...` — el contenido de una corrida no cambia nunca. */
  inmutable: 'public, max-age=31536000, immutable',
  /** `/calles/:id` y `/lugares` — inmutables entre siembras, espacio de URLs acotado. */
  unDia: 'public, max-age=86400',
  /** `/calles?q=` — espacio de URLs infinito. */
  cortita: 'public, max-age=300',
} as const;

export type PoliticaDeCache = (typeof CACHE)[keyof typeof CACHE];

export function conCache(res: Response, politica: PoliticaDeCache): void {
  res.set('Cache-Control', politica);
}

// ---------------------------------------------------------------------------
// La forma canónica del texto de búsqueda
// ---------------------------------------------------------------------------

/**
 * Cuántas veces se re-normaliza antes de dar por canónica una forma.
 *
 * La normalización de calle **no es idempotente en un caso**: saca el primer
 * token si es una categoría, así que «AV AV SAN MARTIN» necesita dos pasadas.
 * Redirigir a una forma que a su vez redirige funcionaría —el navegador sigue
 * hasta veinte saltos— pero dejaría en la caché un objeto por escalón, que es
 * justo lo que el 308 existe para evitar. Se busca el punto fijo acá, en
 * memoria, y se redirige una sola vez.
 */
const PASADAS_HASTA_CANONICO = 5;

export function formaCanonica(texto: string, normalizar: (t: string) => string): string {
  let actual = normalizar(texto);
  for (let i = 0; i < PASADAS_HASTA_CANONICO; i += 1) {
    const siguiente = normalizar(actual);
    if (siguiente === actual) return actual;
    actual = siguiente;
  }
  return actual;
}

export const canonicoDeCalle = (q: string, categorias: readonly string[]): string =>
  formaCanonica(q, (t) => normalizarNombreDeCalle(t, categorias));

export const canonicoDeLugar = (q: string): string => formaCanonica(q, normalizarNombreDeLugar);

/**
 * La URL a la que se redirige cuando el `q` que llegó no era el canónico.
 *
 * Se arma con `URLSearchParams` sobre los parámetros que YA validó Zod, y la
 * ruta es un literal del servidor: nada de lo que escribió la persona toca el
 * path. Un `Location` compuesto por concatenación es como se regala un redirect
 * abierto.
 */
export function urlCanonica(ruta: string, parametros: Record<string, string | number>): string {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) query.set(clave, String(valor));
  return `${ruta}?${query.toString()}`;
}

// ---------------------------------------------------------------------------
// El paquete offline
// ---------------------------------------------------------------------------

/**
 * A qué paquete resuelve un lugar (§4.3).
 *
 * Un `settlement` no tiene paquete propio: resuelve al de su localidad censal
 * ancestro, y los que BAHRA deja sin localidad cuelgan del departamento y
 * resuelven al de su departamento. **Nunca al de un vecino cercano** — atribuir
 * por cercanía es inventar con cara de dato (§2.7).
 */
export type DestinoDelPaquete =
  | { estado: 'propio' }
  | { estado: 'redirige'; ambito: 'localidad' | 'departamento'; id: number }
  | { estado: 'sin_paquete'; razon: string };

export function destinoDelPaquete(
  ambitoPedido: 'localidad' | 'departamento',
  ancestros: Ancestros,
): DestinoDelPaquete {
  const { lugar } = ancestros;

  if (ambitoPedido === 'departamento') {
    if (lugar.level === 'department') return { estado: 'propio' };
    return {
      estado: 'sin_paquete',
      razon: `El lugar ${String(lugar.id)} es un ${lugar.level}, no un departamento.`,
    };
  }

  if (lugar.level === 'locality') return { estado: 'propio' };

  if (lugar.level === 'settlement') {
    if (ancestros.localidadId !== null) {
      return { estado: 'redirige', ambito: 'localidad', id: ancestros.localidadId };
    }
    if (ancestros.departamentoId !== null) {
      // El caso de BAHRA: el asentamiento cuelga del departamento y no de una
      // localidad censal. Se le da la zona entera, que es más de lo que pidió,
      // en vez de elegirle una localidad que el Estado no le asignó.
      return { estado: 'redirige', ambito: 'departamento', id: ancestros.departamentoId };
    }
    return {
      estado: 'sin_paquete',
      razon: `El asentamiento ${String(lugar.id)} no cuelga de ninguna localidad ni departamento.`,
    };
  }

  return {
    estado: 'sin_paquete',
    razon: `El lugar ${String(lugar.id)} es un ${lugar.level}, no una localidad.`,
  };
}

export function rutaDelPaquete(
  corrida: string,
  ambito: 'localidad' | 'departamento',
  id: number,
): string {
  return `/api/v1/geo/paquete/${encodeURIComponent(corrida)}/${ambito}/${String(id)}`;
}

export type PaqueteServido = PaqueteDeCalles;

// ---------------------------------------------------------------------------
// El olvido de una dirección (§4.5)
// ---------------------------------------------------------------------------

/**
 * Las tablas que llevan las cinco columnas de dirección y sobre las que el
 * olvido puede correr.
 *
 * **Hoy está vacía y eso es correcto**: las columnas de §3.4 y sus nueve CHECK
 * los aplica la migración `0015` sobre `senales`, que es de la rebanada 3. La
 * ruta existe igual —la verificación del código es real y está testeada— y va a
 * responder «no conocemos ese registro» hasta que haya algo que olvidar.
 *
 * TODO(Task 13 · `POST /api/v1/civic/senales`): registrar acá `'senales'` con su
 * columna de id público y escribir la única sentencia de `olvidarDireccion`, que
 * es la forma impura de `direccionOlvidada()` (civic-core, Task 2):
 * `SET direccion_estado='sin_direccion', calle_id=NULL, altura=NULL,
 * direccion_texto=NULL`. Es idempotente por construcción y el CHECK
 * `senales_direccion_chk` garantiza que ésa es la única forma legal de la fila
 * después, así que no puede quedar residuo en una columna que alguien olvidó.
 */
export const TABLAS_CON_DIRECCION: ReadonlyMap<string, { tabla: string; columnaId: string }> =
  new Map();

const ETIQUETA_DEL_CODIGO = 'olvido-de-direccion/v1';

/**
 * El código que viaja en el recibo, y que es lo único que autoriza el olvido.
 *
 * Es un HMAC del par (tabla, id) contra el secreto del servidor: cero columnas
 * nuevas, sin cuenta, y sólo lo tiene quien recibió el recibo. El par entero va
 * adentro del mensaje a propósito — si sólo cubriera el id, el código de la
 * fila 5 de una tabla serviría para la fila 5 de otra.
 *
 * **Su límite se dice en vez de disimularse: el código vive en el recibo y no se
 * regenera.** Quien lo pierde pierde la posibilidad de revocar, y eso es
 * preferible a una vía de recuperación que sería, por construcción, una vía de
 * borrado para cualquiera.
 */
export function codigoDeOlvido(tabla: string, id: string): string {
  return createHmac('sha256', getConfig().auth.sessionSecret)
    .update(`${ETIQUETA_DEL_CODIGO}:${tabla}:${id}`)
    .digest('base64url');
}

/** Comparación de tiempo constante. Distinta longitud se descarta antes, sin tirar. */
export function codigoDeOlvidoValido(tabla: string, id: string, codigo: string): boolean {
  const esperado = Buffer.from(codigoDeOlvido(tabla, id));
  const recibido = Buffer.from(codigo);
  if (esperado.length !== recibido.length) return false;
  return timingSafeEqual(esperado, recibido);
}
