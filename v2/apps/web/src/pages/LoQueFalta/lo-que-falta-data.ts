/**
 * Lo que falta — el copy de la página y la memoria local de las llaves.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md`.
 *
 * Las llaves viven acá y sólo acá: son lo único que el navegador guarda de
 * quien deja una falta, y no salen a ningún lado salvo al endpoint que las
 * pide. No hay cuenta, no hay mail, no hay nada más que esto.
 */
import type {
  EstadoDeFalta,
  FaltaPublica,
  SuperficieDeFalta,
} from '~/lib/queries/faltas';

export interface OpcionDeSuperficie {
  valor: SuperficieDeFalta;
  etiqueta: string;
  guia: string;
}

export const SUPERFICIES: readonly OpcionDeSuperficie[] = [
  { valor: 'el-mapa', etiqueta: 'El mapa', guia: 'El instrumento, las capas, lo que se ve o no se ve del país.' },
  { valor: 'los-planes', etiqueta: 'Los PLANes', guia: 'El corpus, un plan puntual, cómo se leen o cómo se buscan.' },
  { valor: 'la-biblioteca', etiqueta: 'La biblioteca', guia: 'Ensayos, crónica, bitácora, manifiesto.' },
  { valor: 'los-entrenamientos', etiqueta: 'Los entrenamientos', guia: 'Cursos, lecciones, prácticas.' },
  { valor: 'la-plataforma', etiqueta: 'La plataforma', guia: 'Todo lo demás: la cuenta, el rendimiento, lo que se rompe.' },
];

export const LARGO_MAXIMO_TITULO = 140;
export const LARGO_MAXIMO_CUERPO = 4000;

interface DescripcionDeEstado {
  etiqueta: string;
  glosa: string;
}

/**
 * Los seis estados en la voz de la página. Importa que digan qué le pasó a lo
 * que alguien dejó, no en qué casilla del sistema cayó.
 */
export const ESTADOS: Readonly<Record<EstadoDeFalta, DescripcionDeEstado>> = {
  dicha: { etiqueta: 'Dicha', glosa: 'Entró y está acá. Todavía no la miré.' },
  anotada: { etiqueta: 'Anotada', glosa: 'La leí y entró al registro de verdad.' },
  en_curso: { etiqueta: 'En curso', glosa: 'Se está haciendo.' },
  hecha: { etiqueta: 'Hecha', glosa: 'Se hizo.' },
  no_va: { etiqueta: 'No va', glosa: 'No se va a hacer, y abajo está por qué.' },
  bajada: { etiqueta: 'Bajada', glosa: 'Se retiró el contenido. El número queda.' },
};

/** El color del sello por estado. Sólo tres, para que el estado se lea de lejos. */
export function selloDeEstado(estado: EstadoDeFalta): 'verde' | 'rojo' | 'violeta' {
  if (estado === 'hecha') return 'verde';
  if (estado === 'no_va' || estado === 'bajada') return 'rojo';
  return 'violeta';
}

export function etiquetaDeSuperficie(superficie: SuperficieDeFalta): string {
  return SUPERFICIES.find((s) => s.valor === superficie)?.etiqueta ?? superficie;
}

/** `2026-08-12T14:03:00Z` → `12 de agosto de 2026`. Sin librería de fechas. */
export function fechaLarga(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(fecha);
}

/**
 * El cuerpo se muestra como TEXTO PLANO, siempre, en toda superficie (§2.6).
 *
 * No es una decisión de estilo: es el freno anti-spam más barato que hay. Un
 * registro público al instante y sin cuenta donde los enlaces son enlaces es
 * una granja de backlinks el mismo día que alguien lo encuentre. Acá el `<a>`
 * no existe, así que el spam no tiene qué ganar. React ya escapa el HTML por
 * su cuenta; el desarmado de URLs es la otra mitad — que una escrita a mano
 * tampoco se vuelva clickeable por autolink de nadie.
 *
 * Y lo segundo, que apareció al ver la página con datos reales: **las faltas
 * de adentro vienen de un archivo markdown**, así que el cuerpo llega con
 * `**Dónde:**`, backticks y `[texto](url)`. Renderizarlo crudo mostraba los
 * asteriscos; renderizarlo como markdown devolvería los `<a>` que el freno 2
 * existe para prohibir. Queda la tercera: **se le sacan las marcas y se deja
 * el texto**, que es exactamente lo que «texto plano» prometía. El enlace
 * markdown conserva su etiqueta y pierde su destino, que es la forma correcta
 * de degradarlo.
 */
export function comoTextoPlano(cuerpo: string): string {
  return cuerpo
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\bhttps?:\/\/\S+/gi, (url) => url.replace(/^https?:\/\//i, ''));
}

/* ── La llave: lo único que el navegador guarda ─────────────────────────── */

const CLAVE_DE_STORAGE = 'basta_faltas_llaves';

/** `{ 'I-007': 'llave…' }` — las faltas que dejó esta persona en este navegador. */
export type Llavero = Record<string, string>;

export function leerLlavero(): Llavero {
  try {
    const crudo = window.localStorage.getItem(CLAVE_DE_STORAGE);
    if (!crudo) return {};
    const parseado: unknown = JSON.parse(crudo);
    if (typeof parseado !== 'object' || parseado === null) return {};
    return Object.fromEntries(
      Object.entries(parseado as Record<string, unknown>).filter(
        ([, valor]) => typeof valor === 'string',
      ),
    ) as Llavero;
  } catch {
    // Sin storage se pierde el hilo de lo propio. La falta ya está en el
    // registro público, que es donde tenía que quedar.
    return {};
  }
}

export function guardarLlave(idPublico: string, llave: string): void {
  try {
    const llavero = leerLlavero();
    llavero[idPublico] = llave;
    window.localStorage.setItem(CLAVE_DE_STORAGE, JSON.stringify(llavero));
  } catch {
    /* ídem */
  }
}

export function olvidarLlave(idPublico: string): void {
  try {
    const { [idPublico]: _retirada, ...resto } = leerLlavero();
    window.localStorage.setItem(CLAVE_DE_STORAGE, JSON.stringify(resto));
  } catch {
    /* ídem */
  }
}

/**
 * La llave con la que se firma. Firmar no crea nada, así que no hay llave
 * propia que devolver: se usa una del navegador —cualquiera— o se acuña una
 * al vuelo. Es lo que deduplica «me pasa lo mismo» sin saber quién sos.
 */
const CLAVE_DE_FIRMA = 'basta_faltas_firma';

export function llaveDeFirma(): string {
  try {
    const guardada = window.localStorage.getItem(CLAVE_DE_FIRMA);
    if (guardada && guardada.length >= 16) return guardada;
    const nueva = acunarLlave();
    window.localStorage.setItem(CLAVE_DE_FIRMA, nueva);
    return nueva;
  } catch {
    // Sin storage cada firma cuenta como nueva. Es el peor caso y es benigno:
    // infla un conteo que no ordena nada.
    return acunarLlave();
  }
}

function acunarLlave(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** ¿Esta falta la dejó quien está mirando? Decide si se ofrece retirarla. */
export function esPropia(falta: Pick<FaltaPublica, 'idPublico'>, llavero: Llavero): boolean {
  return typeof llavero[falta.idPublico] === 'string';
}
