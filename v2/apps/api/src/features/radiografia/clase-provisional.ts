/**
 * PROVISIONAL — el adaptador de clase, y nada más.
 *
 * **Este archivo se BORRA entero** el día que exista
 * `packages/civic-core/src/senal/vocabulario.ts` (spec
 * `docs/specs/2026-08-11-b-la-senal.md` §2.5, que es la fuente única de los
 * nueve tipos en cuatro clases). No se amplía, no se le agregan tipos y no se
 * le agrega un color: la tabla de color por clase también viene de B
 * (§2.4), y La Radiografía no crea ninguna tabla propia.
 *
 * Existe porque el corpus de hoy es `dreams.category` —los seis tipos de voz
 * de v2, `apps/web/src/lib/tipos-voz.ts`— y la spec de La Radiografía
 * (`docs/specs/2026-08-12-la-radiografia.md` §3.1) necesita la **clase** y no
 * el tipo: la primera lectura de la constelación es la regla 11 —los hechos se
 * corroboran, los deseos se deliberan— y esa distinción es por clase.
 *
 * Es un puente, no una decisión. La decisión la toma B.
 */

/** Las cuatro clases de la spec B §2.1. */
export const CLASES = ['hecho', 'deseo', 'acto', 'meta'] as const;

export type ClaseProvisional = (typeof CLASES)[number];

/**
 * Los seis tipos de voz de hoy, mapeados a las cuatro clases.
 *
 * `basta`, `necesidad` y `recurso` son enunciados sobre **lo que pasa** —algo
 * está roto, algo falta, algo está disponible—: son `hecho`, y un hecho se
 * corrobora. `sueño` es `deseo` y se delibera. `compromiso` es lo que alguien
 * se compromete a hacer: `acto`. `valor` es hacia dónde: `meta`.
 *
 * `sueno` sin eñe entra a propósito: la categoría es texto libre en la base
 * (`dreams.category` es `text`, sin CHECK) y hay clientes que la mandan
 * normalizada. Que una voz pierda su clase por un acento sería perder la
 * lectura que la página existe para dar.
 */
const POR_CATEGORIA: Readonly<Record<string, ClaseProvisional>> = {
  basta: 'hecho',
  necesidad: 'hecho',
  recurso: 'hecho',
  sueño: 'deseo',
  sueno: 'deseo',
  compromiso: 'acto',
  valor: 'meta',
};

/**
 * La clase de una voz a partir de su categoría.
 *
 * Sin categoría —o con una que no está en los seis tipos— cae en **`meta`**, y
 * el porqué es la regla 11 de la constitución de producto.
 *
 * La versión anterior mandaba lo desconocido a `hecho` con el argumento de que
 * es «el lado seguro porque obliga a corroborar». Está al revés: la clase no es
 * una tarea que le asignamos a la voz, es **una afirmación sobre qué tipo de
 * cosa es**, y la página la publica como tal — un núcleo de `hecho` se rotula
 * «esto se corrobora». Decir eso de una voz que no supimos clasificar es
 * afirmar algo que no medimos.
 *
 * Y el camino no es hipotético: `dreams.category` es `text` sin CHECK, y el
 * borde que la escribe acepta cualquier cadena de hasta 60 caracteres. Un sueño
 * cargado con la categoría mal tipeada entraba como hecho corroborable.
 *
 * `meta` es la clase de lo que **no afirma nada del mundo** (spec B §2.1), que
 * es exactamente el estado de una voz que no pudimos clasificar.
 */
export const claseProvisional = (categoria: string | null | undefined): ClaseProvisional => {
  const clave = categoria?.trim().toLowerCase();
  if (!clave) return 'meta';
  return POR_CATEGORIA[clave] ?? 'meta';
};
