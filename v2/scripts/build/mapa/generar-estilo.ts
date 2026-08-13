#!/usr/bin/env tsx
/**
 * Genera `apps/web/public/maps/oscuro-propio.json` — el estilo de las teselas
 * propias (plan `docs/plans/2026-08-12-teselas-propias.md`, Task 5).
 *
 * Correr desde `v2/`:
 *
 *   pnpm mapa:estilo
 *
 * ## Cuál de los dos estilos escribe, y por qué no es `oscuro.json`
 *
 * **`oscuro.json` es el que se publica hoy y este script NO lo toca.** Sigue
 * siendo las doce capas contra el esquema de OpenMapTiles que sirve Carto,
 * porque el `.pmtiles` de 1,2 GB no tiene dónde vivir: no entra en el artefacto
 * de Vercel y la decisión de hosting está abierta (D-051).
 *
 * Lo que este script escribe queda al lado, listo y sin usar. **El día que
 * D-051 se cierre, `oscuro-propio.json` pasa a ser `oscuro.json`** —un `mv` y
 * la línea de `MapaBase.tsx`— y este comentario se borra.
 *
 * Hasta entonces: apuntarlo de nuevo a `oscuro.json` publica un estilo del
 * esquema equivocado contra las teselas de Carto, y el mapa queda en negro sin
 * un error que mirar, porque los nombres de capa simplemente no matchean.
 *
 * ## Por qué hay un script y no un JSON escrito a mano
 *
 * Hasta el 12/8/2026 `oscuro.json` eran doce capas escritas a mano contra el
 * esquema de OpenMapTiles, que es el que sirve Carto. El archivo `.pmtiles` que
 * ahora sirve las teselas trae el esquema de Protomaps, que es OTRO: donde
 * había `place`, `transportation` y `building` hay `places`, `roads` y
 * `buildings`, con otros campos y otros `kind`. Portar eso a ojo es adivinar
 * doce veces.
 *
 * `protomaps-themes-base` es el paquete oficial del esquema: sabe qué capa
 * filtra qué, a qué zoom aparece cada cosa y en qué orden se apilan. Este script
 * lo usa como base y **lo repinta entero con la paleta del proyecto**. Lo que
 * aporta el paquete es el conocimiento del esquema; lo que aporta el proyecto es
 * el criterio de qué se ve y de qué color.
 *
 * El paquete es `devDependency`: corre acá y no viaja al navegador. Lo que se
 * publica es el JSON.
 *
 * ## Ningún color inventado, y verificado
 *
 * `metadata.criterio` declara desde siempre que todos los valores salen de los
 * tokens del sistema de diseño. **No era cierto**: la versión escrita a mano
 * traía tres colores (`#0E0C08` del agua, `#1D1A14` del verde y `#1F1C15` del
 * suelo urbano) que no están en `tailwind.config.ts` ni en
 * `docs/design-system/tokens.css`. Se conservan porque son los que el mapa ya
 * tenía —cambiarlos sería rediseñar, no portar— y quedan declarados como lo que
 * son. El resto de la paleta son tokens, uno por uno.
 *
 * `verificarPaleta()` recorre el JSON generado y **falla si aparece un solo
 * color que no esté en la tabla de abajo**. La promesa deja de ser una frase en
 * un comentario y pasa a ser algo que se rompe si alguien la incumple.
 *
 * ## Una sola familia tipográfica
 *
 * El estilo del paquete pide `Noto Sans Regular`, `Noto Sans Medium`,
 * `Noto Sans Italic` y —adentro de una expresión, para nombres en devanagari—
 * `Noto Sans Devanagari Regular v1`. En `apps/web/public/fonts/` hay UNA
 * familia, Regular (ver `public/fonts/LEEME.md`). Y si el estilo nombra una
 * familia que no está servida, maplibre **no dibuja NINGUNA etiqueta**, ni
 * siquiera las de las familias que sí están, y no hay error de red que mirar:
 * queda un mapa mudo. Ya pasó dos veces.
 *
 * Por eso `unaSolaFamilia()` reescribe cada `text-font` del árbol a la familia
 * que sí existe. La jerarquía entre un país y una calle la dan el tamaño, la
 * caja y el interletrado, no el peso.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { format, resolveConfig } from 'prettier';
import { layers } from 'protomaps-themes-base';

import type { LayerSpecification, StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Theme } from 'protomaps-themes-base';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SALIDA = resolve(RAIZ, 'apps/web/public/maps/oscuro-propio.json');
const DIR_FUENTES = resolve(RAIZ, 'apps/web/public/fonts');

/** El id de la fuente dentro del estilo, y el archivo que la sirve. */
const FUENTE = 'argentina';
const ARCHIVO_TESELAS = 'pmtiles:///tiles/argentina.pmtiles';

/** La única familia que `apps/web/public/fonts/` sirve hoy. */
const FAMILIA = 'Noto Sans Regular';

/**
 * La paleta, con la procedencia de cada valor al lado. Nada que no esté acá
 * puede aparecer en el estilo generado.
 */
const PALETA = {
  /** `tinta` — el fondo del instrumento entero. */
  fondo: '#16130E',
  /** heredado de la versión escrita a mano; no es un token. */
  agua: '#0E0C08',
  /** heredado; no es un token. Parques, bosque, matorral. */
  verde: '#1D1A14',
  /** heredado; no es un token. Suelo con gente encima. */
  suelo: '#1F1C15',
  /** `oscuro-barra` — huellas de edificio, arena, hielo. */
  edificio: '#241F17',
  /** `oscuro-borde` — la calle de barrio. */
  calle: '#3A362D',
  /** `oscuro-tenue` — rutas, límites, nombres de calle. */
  ruta: '#5C594F',
  /** `oscuro-meta` — localidades y provincias. */
  etiqueta: '#8E8A82',
  /** `oscuro-secundario` — el nombre del país, lo más alto de la jerarquía. */
  etiquetaAlta: '#C9C5BA',
} as const;

const { fondo, agua, verde, suelo, edificio, calle, ruta, etiqueta, etiquetaAlta } = PALETA;

/**
 * El tema, clave por clave.
 *
 * Las casings van en el color del fondo: en un mapa plano no hay relieve que
 * simular, y lo único que tienen que hacer es despegar una calle de la de al
 * lado. Los POIs están acá sólo porque el tipo `Theme` los exige — la capa se
 * borra más abajo.
 */
const TEMA: Theme = {
  /**
   * **El fondo va del color del AGUA, no del de la tinta** (D-050).
   *
   * La capa `background` es la única del estilo que pinta el lienzo entero,
   * tenga tesela o no: es lo que se ve donde el `.pmtiles` no llega. Y como el
   * archivo está recortado a las 24 provincias, ese «donde no llega» existe en
   * casi todos los encuadres.
   *
   * Cuando iba en `fondo` —el color de la tierra— el mar terminaba en una LÍNEA
   * RECTA y del otro lado seguía en color de tierra. Medido en el navegador: a
   * z3,7, la vista con la que abre la app, el 18,8% del lienzo era tinta puesta
   * sobre el Atlántico y el Pacífico, partida en dos costuras verticales; a z10
   * sobre Mar del Plata había un tajo vertical en el medio del océano.
   * En agua eso es 0%: el mar se lee como mar hasta el borde del encuadre.
   *
   * **Lo que se paga, dicho:** el país vecino sin teselas ahora se lee como mar
   * en vez de como tierra vacía. Se nota de z8 para arriba pegado a un límite
   * terrestre —Chile, Brasil, Bolivia— y en un encuadre que cae entero afuera,
   * como Montevideo a z11. Se elige igual porque el reparto no es parejo: el
   * hueco marítimo aparece en la vista por defecto y en toda la costa, que es
   * donde vive la mayor parte del país, mientras que el hueco terrestre aparece
   * a zoom alto y en un encuadre que YA está vacío de datos —sin calles, sin
   * etiquetas— o sea donde el mapa ya avisó que se terminó.
   *
   * **Esto no cierra D-050, y no puede.** Un color plano no sabe qué hay del
   * otro lado del recorte; cualquiera que se elija miente en algún encuadre. El
   * arreglo de verdad es re-extraer con un buffer alrededor de la región, y esa
   * es una decisión sobre cuánto país ajeno se paga en MB — del dueño, no del
   * estilo.
   */
  background: agua,
  earth: fondo,
  water: agua,

  park_a: verde,
  park_b: verde,
  wood_a: verde,
  wood_b: verde,
  scrub_a: verde,
  scrub_b: verde,
  zoo: verde,

  hospital: suelo,
  industrial: suelo,
  school: suelo,
  pedestrian: suelo,
  aerodrome: suelo,
  military: suelo,
  pier: suelo,

  glacier: edificio,
  sand: edificio,
  beach: edificio,
  buildings: edificio,

  runway: calle,
  other: calle,
  minor_service: calle,
  minor_a: calle,
  minor_b: calle,
  railway: calle,
  tunnel_other: calle,
  tunnel_minor: calle,

  link: ruta,
  major: ruta,
  highway: ruta,
  boundaries: ruta,
  tunnel_link: ruta,
  tunnel_major: ruta,
  tunnel_highway: ruta,

  bridges_other: calle,
  bridges_minor: calle,
  bridges_link: ruta,
  bridges_major: ruta,
  bridges_highway: ruta,

  tunnel_other_casing: fondo,
  tunnel_minor_casing: fondo,
  tunnel_link_casing: fondo,
  tunnel_major_casing: fondo,
  tunnel_highway_casing: fondo,
  minor_service_casing: fondo,
  minor_casing: fondo,
  link_casing: fondo,
  major_casing_late: fondo,
  highway_casing_late: fondo,
  major_casing_early: fondo,
  highway_casing_early: fondo,
  bridges_other_casing: fondo,
  bridges_minor_casing: fondo,
  bridges_link_casing: fondo,
  bridges_major_casing: fondo,
  bridges_highway_casing: fondo,

  country_label: etiquetaAlta,
  state_label: etiqueta,
  state_label_halo: fondo,
  city_label: etiqueta,
  city_label_halo: fondo,
  subplace_label: ruta,
  subplace_label_halo: fondo,
  roads_label_major: ruta,
  roads_label_major_halo: fondo,
  roads_label_minor: ruta,
  roads_label_minor_halo: fondo,
  ocean_label: ruta,
  waterway_label: ruta,
  peak_label: ruta,
  address_label: ruta,
  address_label_halo: fondo,

  regular: FAMILIA,
  bold: FAMILIA,
  italic: FAMILIA,

  // La textura de fondo a zoom bajo: el país no es una mancha negra, y donde
  // hay gente se aclara un punto. Es la única capa que dice algo antes de que
  // aparezcan las localidades.
  landcover: {
    barren: suelo,
    farmland: suelo,
    forest: verde,
    glacier: edificio,
    grassland: suelo,
    scrub: verde,
    urban_area: edificio,
  },

  // La capa se borra: el tipo los pide igual.
  pois: {
    blue: etiqueta,
    green: etiqueta,
    lapis: etiqueta,
    pink: etiqueta,
    red: etiqueta,
    slategray: etiqueta,
    tangerine: etiqueta,
    turquoise: etiqueta,
  },
};

/**
 * Lo que se apaga, y por qué.
 *
 * `pois` son los comercios y los servicios; `address_label`, la numeración de
 * las casas. Son ruido de mapa de navegación y este es un mapa cívico: los
 * únicos colores que tienen que llamar la atención son los de las señales que
 * van encima. Las huellas de edificio NO están en esta lista — ver abajo.
 */
const APAGADAS = new Set(['pois', 'address_label']);

/** Las etiquetas que van en caja alta e interletradas, como en la versión anterior. */
const EN_CAJA_ALTA = new Set([
  'places_country',
  'places_region',
  'places_locality',
  'places_subplace',
]);

async function main(): Promise<void> {
  const capas = layers(FUENTE, TEMA, { lang: 'es' })
    .filter((capa) => !APAGADAS.has(capa.id))
    .map(unaSolaFamilia)
    .map(sinIconos)
    .map(cajaAlta)
    .map(huellasDeEdificio);

  const estilo = {
    version: 8,
    name: '¡BASTA! oscuro',
    metadata: {
      criterio:
        'El basemap se corre del camino. Fondo tinta, geografía en grises tenues, cero saturación: los únicos colores del mapa son los de las señales que van encima. La paleta son los tokens `oscuro-*` y `tinta` de tailwind.config.ts, más tres valores heredados del estilo escrito a mano (#0E0C08 agua, #1D1A14 verde, #1F1C15 suelo) que no son tokens y quedan declarados como lo que son.',
      apagado:
        'POIs, comercios y numeración de casas. Son ruido de mapa de navegación; este es un mapa cívico. Las huellas de edificio SÍ se dibujan de z14 para arriba, y a z15 se leen: la trama de manzanas dice algo cívico, se ve la cuadra. Es lo que hace que el zoom máximo del archivo de teselas signifique algo.',
      fondo:
        'La capa `background` va del color del AGUA (#0E0C08) y no del de la tierra. Es la única que pinta donde el .pmtiles no llega, y el archivo está recortado a las 24 provincias: en tinta, el mar terminaba en una línea recta y seguía en color de tierra —el 18,8% del lienzo en la vista por defecto—. Lo que se paga es que el país vecino sin teselas se lee como mar de z8 para arriba. Un color plano no sabe qué hay del otro lado del recorte; el arreglo de verdad es re-extraer con buffer (D-050).',
      atribucion: '© OpenStreetMap contributors, Protomaps',
      generado:
        'Este archivo lo escribe `scripts/build/mapa/generar-estilo.ts` (pnpm mapa:estilo). No lo edites a mano: la próxima corrida te lo pisa. El color, lo que se apaga y la tipografía se cambian en el script.',
    },
    glyphs: '/fonts/{fontstack}/{range}.pbf',
    sources: {
      [FUENTE]: {
        type: 'vector',
        url: ARCHIVO_TESELAS,
        // La ODbL exige nombrar a OpenStreetMap; Protomaps pide su línea con
        // esta misma forma en los estilos que publica. Ésta es la que maplibre
        // muestra de verdad.
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://github.com/protomaps/basemaps">Protomaps</a>',
      },
    },
    layers: capas,
  };

  verificarContraLaSpec(estilo as unknown as StyleSpecification);
  verificarPaleta(estilo);
  verificarSinHostsExternos(estilo);
  verificarFuentesServidas(estilo);
  verificarSinIconos(estilo);

  // Se escribe con prettier y no con JSON.stringify a secas por dos razones: el
  // archivo pasa `format:check` como cualquier otro, y las expresiones cortas
  // quedan en una línea (`["get", "kind"]` en vez de cuatro), que es la
  // diferencia entre un diff legible y 2.000 líneas de corchetes sueltos.
  const config = await resolveConfig(SALIDA);
  const texto = await format(JSON.stringify(estilo), { ...config, parser: 'json' });
  writeFileSync(SALIDA, texto, 'utf8');
  process.stdout.write(
    `${SALIDA.replace(`${RAIZ}/`, '')}: ${String(capas.length)} capas, ${String(
      Math.round(texto.length / 1024),
    )} KB.\n`,
  );
}

/**
 * Reescribe cada `text-font` de la capa a la única familia servida.
 *
 * Hay que tocar dos lugares y **no aceptan la misma forma**, que es un pozo con
 * el fondo blando: en `layout` un `text-font` es un valor de propiedad y va como
 * array pelado, `["Noto Sans Regular"]`; adentro de las opciones de un
 * `["format", …, {"text-font": …}]` va en posición de expresión, donde ese mismo
 * array se lee como una llamada a la función `"Noto Sans Regular"` y maplibre
 * rechaza el estilo entero con *Unknown expression*. Ahí va
 * `["literal", ["Noto Sans Regular"]]`.
 *
 * El segundo caso no es teórico: es donde el paquete esconde el
 * `Noto Sans Devanagari Regular v1` que nadie sirve.
 */
function unaSolaFamilia(capa: LayerSpecification): LayerSpecification {
  if (capa.type !== 'symbol') return capa;
  const layout: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(capa.layout ?? {})) {
    layout[clave] = clave === 'text-font' ? [FAMILIA] : dentroDeExpresiones(valor);
  }
  return { ...capa, layout };
}

/** El mismo reemplazo, pero en posición de expresión. */
function dentroDeExpresiones<T>(nodo: T): T {
  if (Array.isArray(nodo)) return nodo.map(dentroDeExpresiones) as T;
  if (nodo === null || typeof nodo !== 'object') return nodo;
  const salida: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(nodo)) {
    salida[clave] = clave === 'text-font' ? ['literal', [FAMILIA]] : dentroDeExpresiones(valor);
  }
  return salida as T;
}

/**
 * Fuera los iconos — no hay sprite, y no lo va a haber.
 *
 * `places_locality` viene del paquete con un `townspot`, el puntito que las
 * localidades llevan a zoom bajo en un mapa de navegación. Un sprite es un
 * archivo más que servir y una promesa más que mantener, y este mapa nunca tuvo
 * iconos: la localidad ES su nombre. Si el estilo lo pidiera igual, maplibre
 * llenaría la consola de «image not found» y dejaría las etiquetas corridas
 * hacia un punto que no está.
 *
 * Con el icono se van también el ancla a la izquierda y el desplazamiento
 * radial, que existían sólo para hacerle lugar: sin ellos el nombre vuelve a
 * caer sobre su propia coordenada.
 */
function sinIconos(capa: LayerSpecification): LayerSpecification {
  if (capa.type !== 'symbol') return capa;
  const {
    'icon-image': _icono,
    'icon-size': _tamano,
    'icon-padding': _relleno,
    'text-anchor': _ancla,
    'text-radial-offset': _desplazamiento,
    ...resto
  } = capa.layout ?? {};
  return { ...capa, layout: resto };
}

/** Caja alta e interletrado en los topónimos: es la voz del mapa, no un adorno. */
function cajaAlta(capa: LayerSpecification): LayerSpecification {
  if (!EN_CAJA_ALTA.has(capa.id) || capa.type !== 'symbol') return capa;
  return {
    ...capa,
    layout: { ...capa.layout, 'text-transform': 'uppercase', 'text-letter-spacing': 0.1 },
  };
}

/**
 * Las huellas de edificio, encendidas en zoom alto — decisión del dueño,
 * 12/8/2026.
 *
 * El archivo de teselas se extrajo hasta z15 para traerlas: sin esto, ese medio
 * giga de más serían bytes que el estilo tira. Aparecen a z14 en cero y llegan a
 * su valor a z17, de manera que el paso de «trama de calles» a «trama de
 * manzanas» es continuo y no un parpadeo. El paquete las trae planas a 0,5 desde
 * el primer zoom en que existen (z11), donde no son la cuadra sino suciedad.
 */
function huellasDeEdificio(capa: LayerSpecification): LayerSpecification {
  if (capa.id !== 'buildings' || capa.type !== 'fill') return capa;
  return {
    ...capa,
    minzoom: 14,
    paint: {
      ...capa.paint,
      'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.35, 17, 0.7],
    },
  };
}

/**
 * El estilo tiene que ser un estilo válido de maplibre — y esto no es
 * ceremonia.
 *
 * Un estilo inválido no degrada: maplibre lo rechaza entero y no dibuja NADA,
 * ni el fondo. Ya pasó en esta misma tarea, con un `text-font` puesto como array
 * pelado adentro de un `format` (ver `unaSolaFamilia`): ocho capas mal y el mapa
 * entero en negro. Se valida acá, antes de escribir, para que el archivo roto no
 * llegue nunca al disco.
 */
function verificarContraLaSpec(estilo: StyleSpecification): void {
  const errores = validateStyleMin(estilo);
  if (errores.length > 0) {
    throw new Error(
      `El estilo no valida contra la spec de maplibre (${String(errores.length)}):\n` +
        errores.map((e) => `  · ${e.message}`).join('\n'),
    );
  }
}

/** Ningún color fuera de PALETA, a ninguna profundidad. Si aparece uno, se corta. */
function verificarPaleta(estilo: unknown): void {
  const permitidos = new Set<string>(Object.values(PALETA).map((c) => c.toLowerCase()));
  const encontrados = new Set<string>();
  for (const texto of stringsDe(estilo)) {
    for (const color of texto.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) ?? []) {
      if (!permitidos.has(color.toLowerCase())) encontrados.add(color);
    }
  }
  if (encontrados.size > 0) {
    throw new Error(
      `Colores fuera de la paleta: ${[...encontrados].join(', ')}. ` +
        'O sale de un token, o se declara en PALETA con su procedencia.',
    );
  }
}

/** Ni un host de terceros, salvo los enlaces de licencia de la atribución. */
function verificarSinHostsExternos(estilo: { sources: unknown; layers: unknown; glyphs: string }): void {
  if (!estilo.glyphs.startsWith('/')) throw new Error('Los glyphs tienen que salir del propio origen.');
  const sinAtribucion = JSON.stringify({ sources: estilo.sources, layers: estilo.layers }, (clave, valor: unknown) =>
    clave === 'attribution' ? undefined : valor,
  );
  const externos = sinAtribucion.match(/https?:\/\/[^"']+/g) ?? [];
  if (externos.length > 0) throw new Error(`Hosts externos en el estilo: ${externos.join(', ')}`);
}

/**
 * Cada familia que el estilo nombra tiene que estar en public/fonts/.
 *
 * Después de `unaSolaFamilia` un `text-font` sólo puede tener dos formas:
 * `["Familia"]` o `["literal", ["Familia"]]`. Cualquier otra cosa es una
 * expresión que se escapó del reemplazo —y que podría estar pidiendo una
 * familia que no servimos según el dato de cada rasgo—, así que también corta.
 */
function verificarFuentesServidas(estilo: { layers: unknown }): void {
  const pedidas = new Set<string>();
  recorrer(estilo.layers, (clave, valor) => {
    if (clave !== 'text-font') return;
    const pelado: unknown =
      Array.isArray(valor) && valor[0] === 'literal' ? (valor as unknown[])[1] : valor;
    if (!Array.isArray(pelado) || !pelado.every((x) => typeof x === 'string')) {
      throw new Error(`Un text-font quedó como expresión: ${JSON.stringify(valor)}`);
    }
    for (const familia of pelado) pedidas.add(familia);
  });
  for (const familia of pedidas) {
    try {
      readFileSync(resolve(DIR_FUENTES, familia, '0-255.pbf'));
    } catch {
      throw new Error(
        `El estilo pide la familia «${familia}» y no está en apps/web/public/fonts/. ` +
          'Sin ella el mapa se queda SIN NINGUNA etiqueta y sin error visible.',
      );
    }
  }
}

/** Sin sprite declarado, un `icon-image` sobreviviente es consola llena y etiquetas corridas. */
function verificarSinIconos(estilo: { layers: unknown }): void {
  const iconos: string[] = [];
  recorrer(estilo.layers, (clave, valor) => {
    if (clave === 'icon-image') iconos.push(JSON.stringify(valor));
  });
  if (iconos.length > 0) {
    throw new Error(`El estilo no declara sprite y quedaron iconos: ${iconos.join(', ')}`);
  }
}

function recorrer(nodo: unknown, visitar: (clave: string, valor: unknown) => void): void {
  if (Array.isArray(nodo)) {
    for (const hijo of nodo) recorrer(hijo, visitar);
    return;
  }
  if (nodo === null || typeof nodo !== 'object') return;
  for (const [clave, valor] of Object.entries(nodo)) {
    visitar(clave, valor);
    recorrer(valor, visitar);
  }
}

function stringsDe(nodo: unknown): string[] {
  if (typeof nodo === 'string') return [nodo];
  if (Array.isArray(nodo)) return nodo.flatMap(stringsDe);
  if (nodo !== null && typeof nodo === 'object') return Object.values(nodo).flatMap(stringsDe);
  return [];
}

void main();
