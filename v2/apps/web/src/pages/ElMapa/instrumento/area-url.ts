import type { GeoPoint } from '@v2/civic-core';

/**
 * El área citable (spec 3 §5.5).
 *
 * Sin esto el lazo es un juguete: dibujás, mirás, cerrás la pestaña y no queda
 * nada. Con esto le mandás el link a alguien y ve tu zona con tu recorte.
 *
 * Un lazo a mano alzada tiene cientos de vértices y una URL no puede llevarlos,
 * así que el polígono se simplifica a un máximo y se codifica con polilínea
 * codificada — el algoritmo de Google, ~5 caracteres por vértice.
 */

const MAX_VERTICES = 60;
const PRECISION = 1e5;

/**
 * Simplificación por decimación uniforme, conservando siempre el primero y el
 * último. No es Douglas-Peucker: para un trazo a mano alzada, donde los puntos
 * ya vienen repartidos parejo por el umbral de 3 px del overlay, la decimación
 * da un resultado equivalente y no puede colapsar un lóbulo entero como sí
 * puede hacerlo un DP mal tolerado.
 */
export function simplificar(
  poligono: readonly GeoPoint[],
  maximo = MAX_VERTICES,
): GeoPoint[] {
  if (poligono.length <= maximo) return [...poligono];
  const paso = (poligono.length - 1) / (maximo - 1);
  const salida: GeoPoint[] = [];
  for (let i = 0; i < maximo; i += 1) {
    const punto = poligono[Math.round(i * paso)];
    if (punto) salida.push(punto);
  }
  return salida;
}

function codificarValor(valor: number): string {
  let v = valor < 0 ? ~(valor << 1) : valor << 1;
  let salida = '';
  while (v >= 0x20) {
    salida += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  salida += String.fromCharCode(v + 63);
  return salida;
}

export function codificarArea(poligono: readonly GeoPoint[]): string {
  let latAnterior = 0;
  let lngAnterior = 0;
  let salida = '';
  for (const punto of simplificar(poligono)) {
    const lat = Math.round(punto.lat * PRECISION);
    const lng = Math.round(punto.lng * PRECISION);
    salida += codificarValor(lat - latAnterior);
    salida += codificarValor(lng - lngAnterior);
    latAnterior = lat;
    lngAnterior = lng;
  }
  return salida;
}

/** Devuelve `[]` ante cualquier basura: un link roto no rompe la página. */
export function decodificarArea(codificada: string): GeoPoint[] {
  const puntos: GeoPoint[] = [];
  let indice = 0;
  let lat = 0;
  let lng = 0;

  const leer = (): number | null => {
    let resultado = 0;
    let desplazamiento = 0;
    let byte: number;
    do {
      if (indice >= codificada.length) return null;
      byte = codificada.charCodeAt(indice) - 63;
      indice += 1;
      if (byte < 0) return null;
      resultado |= (byte & 0x1f) << desplazamiento;
      desplazamiento += 5;
    } while (byte >= 0x20);
    return resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
  };

  while (indice < codificada.length) {
    const dLat = leer();
    const dLng = leer();
    if (dLat === null || dLng === null) return [];
    lat += dLat;
    lng += dLng;
    const punto = { lat: lat / PRECISION, lng: lng / PRECISION };
    if (!Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) return [];
    if (Math.abs(punto.lat) > 90 || Math.abs(punto.lng) > 180) return [];
    puntos.push(punto);
  }

  // Un polígono necesita tres vértices. Menos que eso no es un área.
  return puntos.length >= 3 ? puntos : [];
}

export interface EstadoArea {
  poligono: GeoPoint[];
  capas: string[];
}

/** Lee el área del hash: `/el-mapa#instrumento?area=…&capas=voz,pulso`. */
export function leerAreaDelHash(hash: string): EstadoArea | null {
  const interrogante = hash.indexOf('?');
  if (interrogante === -1) return null;
  const params = new URLSearchParams(hash.slice(interrogante + 1));
  const area = params.get('area');
  if (!area) return null;
  const poligono = decodificarArea(area);
  if (poligono.length === 0) return null;
  const capas = params.get('capas')?.split(',').filter(Boolean) ?? [];
  return { poligono, capas };
}

export function escribirAreaEnHash(poligono: readonly GeoPoint[], capas: readonly string[]): string {
  const params = new URLSearchParams();
  params.set('area', codificarArea(poligono));
  if (capas.length > 0) params.set('capas', capas.join(','));
  return `#instrumento?${params.toString()}`;
}
