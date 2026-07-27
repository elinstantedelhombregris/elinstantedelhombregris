/**
 * GENERADO por scripts/build/geo/index.ts — NO EDITAR A MANO.
 *
 * La proyección del mapa y su inversa. Equirectangular corregida por
 * cos(latitud media), con los bounds CONGELADOS desde la capa de provincias
 * (spec 1 §3): agregar capas no los mueve, así que los paths ya emitidos
 * siguen coincidiendo con lo que devuelve `desproyectar`.
 *
 * Exactas: no redondean. El redondeo a un decimal es del dibujo, no de la
 * proyección — así el ida y vuelta del lazo no arrastra el error del path.
 */
export const MAPA_VIEWBOX = '0 0 476.4 1000';
export const MAPA_ANCHO = 476.4;
export const MAPA_ALTO = 1000;

/** Bounds geográficos congelados. Fuente: capa de provincias. */
export const MAPA_BOUNDS = {
  minLon: -73.530572,
  maxLon: -53.66672,
  minLat: -55.051046,
  maxLat: -21.792415,
} as const;

const MARGEN = 8;
/** cos(latitud media) — corrección longitudinal. */
const KX = 0.7834578190098304;
/** Unidades del viewBox por grado de latitud. */
const K = 29.586304980502653;

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
 * píxeles a un polígono que `selectTerritoryPoints` de @v2/civic-core pueda
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
