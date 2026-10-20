/**
 * Las seis regiones con que Mi Argentina ideal lee el país (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §5). La clave es el ISO 3166-2 de
 * `PROVINCIAS_CANONICAS`, que no cambia aunque cambie un nombre.
 *
 * La Pampa va en Centro, aunque por la Ley 23.272 integra la Región Patagónica:
 * en lo que se vive y se produce está más cerca de la pampa húmeda que del sur.
 * Es una elección, y el test la fija.
 *
 * Módulo puro: sin red, sin disco, sin reloj.
 */
export const REGIONES = ['NOA', 'NEA', 'Cuyo', 'Centro', 'Buenos Aires', 'Patagonia'] as const;
export type Region = (typeof REGIONES)[number];

const REGION_DE: Readonly<Record<string, Region>> = {
  'AR-Y': 'NOA',
  'AR-A': 'NOA',
  'AR-T': 'NOA',
  'AR-K': 'NOA',
  'AR-G': 'NOA',
  'AR-F': 'NOA',
  'AR-N': 'NEA',
  'AR-W': 'NEA',
  'AR-H': 'NEA',
  'AR-P': 'NEA',
  'AR-M': 'Cuyo',
  'AR-J': 'Cuyo',
  'AR-D': 'Cuyo',
  'AR-X': 'Centro',
  'AR-S': 'Centro',
  'AR-E': 'Centro',
  'AR-L': 'Centro',
  'AR-B': 'Buenos Aires',
  'AR-C': 'Buenos Aires',
  'AR-Q': 'Patagonia',
  'AR-R': 'Patagonia',
  'AR-U': 'Patagonia',
  'AR-Z': 'Patagonia',
  'AR-V': 'Patagonia',
};

export function regionDe(isoCode: string | null | undefined): Region | null {
  if (!isoCode) return null;
  return REGION_DE[isoCode] ?? null;
}

export function esRegion(valor: string | null | undefined): valor is Region {
  return typeof valor === 'string' && (REGIONES as readonly string[]).includes(valor);
}

/** «el NOA», «Cuyo», «la Patagonia»: para frases como «Con tu respuesta, el NOA ya cuenta». */
export const REGION_CON_ARTICULO: Readonly<Record<Region, string>> = {
  NOA: 'el NOA',
  NEA: 'el NEA',
  Cuyo: 'Cuyo',
  Centro: 'el Centro',
  'Buenos Aires': 'Buenos Aires',
  Patagonia: 'la Patagonia',
};

/** «del NOA», «de Cuyo», «de la Patagonia». */
export const DE_REGION: Readonly<Record<Region, string>> = {
  NOA: 'del NOA',
  NEA: 'del NEA',
  Cuyo: 'de Cuyo',
  Centro: 'del Centro',
  'Buenos Aires': 'de Buenos Aires',
  Patagonia: 'de la Patagonia',
};
