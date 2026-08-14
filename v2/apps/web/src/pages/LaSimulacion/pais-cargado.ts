import { CLASES_SENAL } from '@v2/civic-core';

import type { ClaseSenal, Cosecha } from '@v2/civic-core';
import type { CeldaDeSenales } from '~/components/mapa/pintor-senales';
import type { Anillo, RectanguloGeo } from '~/components/mapa/rectangulo-inscripto';

import { anillosDeGeometria } from '~/components/mapa/rectangulo-inscripto';

/**
 * El país cargado — la geometría de dibujar una cosecha sobre las provincias.
 *
 * Puro: sin React, sin DOM y sin red, para que se pueda leer con un test en vez
 * de con una captura de pantalla. La sección que lo usa es
 * `sections/ElPaisCargado.tsx`.
 *
 * ## La restricción que manda, y de dónde sale la forma de este archivo
 *
 * `Cosecha` son celdas agregadas `(territorioId, período, clase) → voces`, y
 * `ubicacion-ensayada.ts` declara `PRECISION_QUE_CONOCE_EL_GENERADOR =
 * 'province'`. O sea: **el motor sabe cuántas voces hay por celda y no sabe
 * dónde cae cada una.** La demo del 11 de agosto puso 10.000 voces sintéticas
 * sobre direcciones reales del callejero del Estado; eso fabrica una precisión
 * que el modelo no tiene, y no se repite.
 *
 * Por eso acá no hay ni una coordenada por voz. Lo que se calcula es, por
 * provincia, **un rectángulo adentro del cual el sembrado reparte los puntos**,
 * y el reparto lo hace `sembrarCelda` de `@v2/civic-core` — la misma función en
 * el navegador y en el servidor.
 *
 * ## Por qué el rectángulo va INSCRIPTO y no es el bounding box
 *
 * Con el bounding box, la mitad de los puntos de Chubut caerían en el mar y
 * varios de los de Buenos Aires adentro de La Pampa. Un punto dibujado en otra
 * provincia no es «dibujo»: es una afirmación falsa sobre esa otra provincia, y
 * es exactamente el error que la declaración de pantalla existe para no
 * cometer. El rectángulo inscripto es un **subconjunto** del polígono, así que
 * «en algún lugar de este rectángulo» implica «en algún lugar de esta
 * provincia», que es toda la verdad disponible.
 *
 * La cuenta no vive acá: es `rectanguloInscripto` de
 * `~/components/mapa/rectangulo-inscripto`, el mismo que usa el instrumento de
 * `/el-mapa`. Estuvo escrita dos veces —una por superficie— y la otra versión
 * divergió hasta sembrar el 21,6 % de la superficie afuera de la provincia; el
 * archivo compartido explica ese episodio con los números medidos. Acá quedó lo
 * que sí es propio de esta pantalla: leer el archivo, proyectar y plegar la
 * cosecha.
 *
 * Y el rectángulo se parte en cuatro, uno por clase (`CUARTO_DE_CLASE`): el
 * relleno del pintor es opaco, así que cuatro clases sembradas en el mismo
 * espacio terminan mostrando sólo la última.
 */

export interface ContornoDeProvincia {
  readonly nombre: string;
  readonly anillos: readonly Anillo[];
}

/**
 * La proyección: equirectangular corregida por `cos(latitud media)`.
 *
 * Propia y de doce líneas, en vez de un mapa base: así la sección dibuja el
 * país aunque el basemap esté caído —que hoy lo está— y no arrastra una
 * instancia de maplibre para pintar veinticuatro polígonos.
 */
export interface Encuadre {
  readonly minLon: number;
  readonly maxLat: number;
  /** `cos(latitud media)`: sin esto el país sale estirado a lo ancho. */
  readonly kx: number;
  /** Unidades del encuadre: grados de latitud, y de longitud ya corregidos. */
  readonly ancho: number;
  readonly alto: number;
}

/** Los cuatro nombres de clase, en castellano y en plural. */
export const NOMBRE_DE_CLASE: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'hechos',
  deseo: 'deseos',
  acto: 'actos con fecha',
  meta: 'preguntas',
};

/* ── Leer el GeoJSON sin creerle nada ────────────────────────────────────── */

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const esArreglo = (v: unknown): v is readonly unknown[] => Array.isArray(v);

/**
 * Los contornos de `public/geo/provincias.geojson`.
 *
 * Recibe `unknown` y lo camina con guardas: un archivo que cambió de forma
 * devuelve una lista vacía —y la sección lo dice— en vez de tirar adentro de un
 * render. La lectura de la geometría es `anillosDeGeometria`, la misma que usa
 * el instrumento de `/el-mapa`: si mañana el archivo llega como `MultiPolygon`,
 * las dos pantallas se enteran juntas.
 */
export function leerContornos(crudo: unknown): ContornoDeProvincia[] {
  if (!esObjeto(crudo)) return [];
  const rasgos = crudo.features;
  if (!esArreglo(rasgos)) return [];
  const salida: ContornoDeProvincia[] = [];
  for (const rasgo of rasgos) {
    if (!esObjeto(rasgo)) continue;
    const propiedades = rasgo.properties;
    const geometria = rasgo.geometry;
    if (!esObjeto(propiedades) || !esObjeto(geometria)) continue;
    const nombre = propiedades.name;
    if (typeof nombre !== 'string') continue;
    const anillos = anillosDeGeometria(geometria);
    if (anillos.length > 0) salida.push({ nombre, anillos });
  }
  return salida;
}

/* ── La proyección ───────────────────────────────────────────────────────── */

export function encuadreDe(contornos: readonly ContornoDeProvincia[]): Encuadre | null {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const contorno of contornos) {
    for (const anillo of contorno.anillos) {
      for (const [lng, lat] of anillo) {
        if (lng < minLon) minLon = lng;
        if (lng > maxLon) maxLon = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  if (maxLon <= minLon || maxLat <= minLat) return null;
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  return { minLon, maxLat, kx, ancho: (maxLon - minLon) * kx, alto: maxLat - minLat };
}

/** Grados → unidades del encuadre, con el origen arriba a la izquierda. */
export const enUnidades = (
  encuadre: Encuadre,
  lng: number,
  lat: number,
): { readonly x: number; readonly y: number } => ({
  x: (lng - encuadre.minLon) * encuadre.kx,
  y: encuadre.maxLat - lat,
});

/** El `d` de un `<path>`, en unidades del encuadre. */
export function caminoDe(encuadre: Encuadre, contorno: ContornoDeProvincia): string {
  let camino = '';
  for (const anillo of contorno.anillos) {
    let primero = true;
    for (const [lng, lat] of anillo) {
      const { x, y } = enUnidades(encuadre, lng, lat);
      camino += `${primero ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`;
      primero = false;
    }
    camino += 'Z';
  }
  return camino;
}

/* ── De la cosecha a las celdas del pintor ───────────────────────────────── */

export interface PaisEnCeldas {
  readonly celdas: readonly CeldaDeSenales[];
  /**
   * Territorios con voces y sin lugar donde dibujarlas: o el archivo no trae su
   * contorno, o la figura es tan angosta que no admite ningún rectángulo
   * adentro. Se dicen, no se tragan — no dibujar nada es preferible a dibujar
   * en la provincia de al lado.
   */
  readonly sinContorno: readonly string[];
  /** Cuántas voces quedaron sin un lugar donde dibujarse. */
  readonly vocesSinLugar: number;
}

const clave = (territorioId: string, clase: ClaseSenal): string => `${territorioId}\u0000${clase}`;

/**
 * Qué cuarto del rectángulo le toca a cada clase: `[columna, fila]`, fila 0
 * arriba.
 *
 * **Existe porque las cuatro clases superpuestas mienten sobre la
 * composición.** Con un solo rectángulo por provincia las cuatro sembraban
 * adentro del mismo espacio, y el relleno del pintor es opaco: en cualquier
 * provincia apretada —Jujuy, Tucumán, Misiones— las quinientas marcas de la
 * última clase tapaban a las otras tres y el bloque salía entero del color de
 * `meta`. Alguien leía «acá se hacen puras preguntas» sobre una composición
 * declarada de 25 % cada una. Ése es un error sobre el DATO, y es peor que el
 * que se corre al partir el espacio — que es sobre la posición, y la posición
 * ya está declarada como dibujo.
 *
 * Adentro de cada cuarto el reparto sigue siendo parejo y sin grilla. El cuarto
 * es una decisión de presentación, idéntica en las veinticuatro provincias, y
 * la sección la dice al lado del dibujo en vez de dejarla acá.
 */
const CUARTO_DE_CLASE: Readonly<Record<ClaseSenal, readonly [number, number]>> = {
  hecho: [0, 0],
  deseo: [1, 0],
  acto: [0, 1],
  meta: [1, 1],
};

/**
 * La cosecha plegada a una celda por `(provincia, clase)`.
 *
 * Se pliega el **período** porque el mapa no tiene eje de tiempo: lo que se
 * dibuja es el total de la ventana. La clase NO se pliega: es lo que el pintor
 * compartido codifica en color, y plegarla dejaría un país de un solo color
 * diciendo menos de lo que el motor sabe.
 *
 * El `id` lleva la clase adentro porque `semillaDeCelda` lo hashea: sin eso dos
 * clases con el mismo conteo dibujarían la misma figura y alguien la leería
 * como un patrón.
 */
export function celdasDeCosecha(
  cosecha: Cosecha,
  rectangulos: ReadonlyMap<string, RectanguloGeo>,
): PaisEnCeldas {
  const sumadas = new Map<string, number>();
  const territorios: string[] = [];

  for (const celda of cosecha.celdas) {
    if (celda.voces <= 0) continue;
    if (!territorios.includes(celda.territorioId)) territorios.push(celda.territorioId);
    const k = clave(celda.territorioId, celda.clase);
    sumadas.set(k, (sumadas.get(k) ?? 0) + celda.voces);
  }

  const celdas: CeldaDeSenales[] = [];
  const sinContorno: string[] = [];
  let vocesSinLugar = 0;

  for (const territorioId of territorios.sort((a, b) => (a < b ? -1 : 1))) {
    const rectangulo = rectangulos.get(territorioId);
    for (const clase of CLASES_SENAL) {
      const suma = sumadas.get(clave(territorioId, clase)) ?? 0;
      if (suma <= 0) continue;
      if (rectangulo === undefined) {
        vocesSinLugar += suma;
        continue;
      }
      const [columna, fila] = CUARTO_DE_CLASE[clase];
      const ancho = rectangulo.anchoGrados / 2;
      const alto = rectangulo.altoGrados / 2;
      celdas.push({
        id: `${territorioId}|${clase}`,
        nombre: `${territorioId} · ${NOMBRE_DE_CLASE[clase]}`,
        clase,
        voces: suma,
        lng: rectangulo.lng + (columna - 0.5) * ancho,
        lat: rectangulo.lat + (0.5 - fila) * alto,
        anchoGrados: ancho,
        altoGrados: alto,
      });
    }
    if (rectangulo === undefined) sinContorno.push(territorioId);
  }

  return { celdas, sinContorno, vocesSinLugar };
}
