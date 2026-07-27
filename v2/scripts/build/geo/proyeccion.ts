/**
 * La proyección del mapa — equirectangular corregida por cos(latitud media).
 *
 * Extraída de `build-mapa-argentina.ts` para que TODAS las capas la compartan
 * y, sobre todo, para exportar la inversa (spec 1 §3).
 *
 * Sin `desproyectar` el lazo no existe: se dibuja en píxeles del viewBox y
 * tiene que volverse polígono en lng/lat para pasar por el `pointInPolygon`
 * de `@v2/civic-core`. Es la costura que rompe D6 si se olvida.
 *
 * `proyectar` y `desproyectar` son EXACTAS: no redondean. El redondeo a un
 * decimal es una decisión de serialización de los paths, no de la proyección,
 * y vive en `redondearUnidad`. Así el ida y vuelta del lazo es exacto hasta la
 * precisión del flotante en vez de arrastrar el error del dibujo.
 */

export const ALTO = 1000;
export const MARGEN = 8;

export interface Bounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

export interface PuntoSvg {
  x: number;
  y: number;
}

export interface PuntoGeo {
  lng: number;
  lat: number;
}

export interface Proyeccion {
  readonly bounds: Bounds;
  readonly ancho: number;
  readonly alto: number;
  readonly margen: number;
  /** Factor de corrección longitudinal: cos(latitud media). */
  readonly kx: number;
  /** Unidades del viewBox por grado de latitud. */
  readonly k: number;
  proyectar(lng: number, lat: number): PuntoSvg;
  desproyectar(x: number, y: number): PuntoGeo;
}

/** Redondeo a un decimal — el que usan los paths emitidos. */
export const redondearUnidad = (valor: number): number => Math.round(valor * 10) / 10;

/**
 * Bounds de una colección de anillos en [lng, lat].
 *
 * IMPORTANTE (spec 1 §3): los bounds se calculan UNA sola vez, desde la capa
 * de provincias, y todas las demás capas los reciben. Si una capa nueva los
 * corriera aunque sea un milímetro, todos los paths ya emitidos se moverían y
 * la inversa dejaría de coincidir con lo dibujado.
 */
export function boundsDeAnillos(anillos: Iterable<readonly (readonly number[])[]>): Bounds {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const anillo of anillos) {
    for (const coord of anillo) {
      const lon = coord[0] ?? 0;
      const lat = coord[1] ?? 0;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) {
    throw new Error('boundsDeAnillos: la colección no tiene coordenadas finitas.');
  }
  return { minLon, maxLon, minLat, maxLat };
}

export function crearProyeccion(bounds: Bounds): Proyeccion {
  const latMedia = ((bounds.minLat + bounds.maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(latMedia);
  const k = (ALTO - 2 * MARGEN) / (bounds.maxLat - bounds.minLat);
  const ancho = redondearUnidad((bounds.maxLon - bounds.minLon) * kx * k + 2 * MARGEN);

  return {
    bounds,
    ancho,
    alto: ALTO,
    margen: MARGEN,
    kx,
    k,
    proyectar(lng, lat) {
      return {
        x: MARGEN + (lng - bounds.minLon) * kx * k,
        y: MARGEN + (bounds.maxLat - lat) * k,
      };
    },
    desproyectar(x, y) {
      return {
        lng: bounds.minLon + (x - MARGEN) / (kx * k),
        lat: bounds.maxLat - (y - MARGEN) / k,
      };
    },
  };
}

/**
 * Emite el módulo de proyección que consume la app. Lleva las constantes ya
 * resueltas y el par de funciones, sin depender del GeoJSON en runtime.
 */
export function moduloProyeccion(proyeccion: Proyeccion): string {
  const { bounds, kx, k, ancho } = proyeccion;
  const n = (valor: number): string => String(valor);
  return `/**
 * GENERADO por scripts/build/geo/index.ts — NO EDITAR A MANO.
 *
 * La proyección del mapa y su inversa. Equirectangular corregida por
 * cos(latitud media), con los bounds CONGELADOS desde la capa de provincias
 * (spec 1 §3): agregar capas no los mueve, así que los paths ya emitidos
 * siguen coincidiendo con lo que devuelve \`desproyectar\`.
 *
 * Exactas: no redondean. El redondeo a un decimal es del dibujo, no de la
 * proyección — así el ida y vuelta del lazo no arrastra el error del path.
 */
export const MAPA_VIEWBOX = '0 0 ${n(ancho)} ${n(ALTO)}';
export const MAPA_ANCHO = ${n(ancho)};
export const MAPA_ALTO = ${n(ALTO)};

/** Bounds geográficos congelados. Fuente: capa de provincias. */
export const MAPA_BOUNDS = {
  minLon: ${n(bounds.minLon)},
  maxLon: ${n(bounds.maxLon)},
  minLat: ${n(bounds.minLat)},
  maxLat: ${n(bounds.maxLat)},
} as const;

const MARGEN = ${n(MARGEN)};
/** cos(latitud media) — corrección longitudinal. */
const KX = ${n(kx)};
/** Unidades del viewBox por grado de latitud. */
const K = ${n(k)};

export interface PuntoSvg {
  x: number;
  y: number;
}

export interface PuntoGeo {
  lng: number;
  lat: number;
}

/** Grados → unidades del viewBox. */
export function proyectar(lng: number, lat: number): PuntoSvg {
  return {
    x: MARGEN + (lng - MAPA_BOUNDS.minLon) * KX * K,
    y: MARGEN + (MAPA_BOUNDS.maxLat - lat) * K,
  };
}

/**
 * Unidades del viewBox → grados. La usa el lazo para convertir el trazo en
 * píxeles a un polígono que \`selectTerritoryPoints\` de @v2/civic-core pueda
 * evaluar contra las señales.
 */
export function desproyectar(x: number, y: number): PuntoGeo {
  return {
    lng: MAPA_BOUNDS.minLon + (x - MARGEN) / (KX * K),
    lat: MAPA_BOUNDS.maxLat - (y - MARGEN) / K,
  };
}

/** Kilómetros → unidades del viewBox, para el radio del halo de precisión. */
export function kmAUnidades(km: number): number {
  return (km / 111.32) * K;
}
`;
}
