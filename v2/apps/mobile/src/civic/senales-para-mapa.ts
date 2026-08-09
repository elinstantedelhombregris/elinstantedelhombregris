/**
 * De los repos locales a la luz que pinta la portada.
 *
 * El último tramo del flujo de la rebanada 1:
 *   repos (observations, needs, resources) → SenalParaConteo[]
 *     → planTerritorialCoverage(zona) → conteosPorCelda(...) → luzDeCeldas(...)
 *
 * Vive en su propio módulo — y no adentro de `(tabs)/index.tsx` — porque la
 * portada tiene el tope de 300 líneas de `v2/CLAUDE.md` y esto es lógica
 * pura: se testea sola, sin montar una pantalla ni tocar la base.
 */

import { luzDeCeldas, planTerritorialCoverage, provinciaDelPunto } from '@v2/civic-core';

import provinciasGeoJson from '@/assets/geo/provincias.json';

import { conteosPorCelda, type SenalParaConteo } from './conteos';
import { isOperationalMapPoint } from './map-point-action';

import type { AreaProvincia, ConteoCelda, CoverageAreaInput, CoveragePlan, LuzCelda } from '@v2/civic-core';
import type { CivicNeedRow, CivicObservationRow, CivicResourceRow } from '@/db/schema';

/**
 * Copia deliberada de `repo.ts::isCivicRecordExpired`, no un import: `repo.ts`
 * carga `db/client` (expo-sqlite) y este módulo tiene que seguir siendo
 * lógica pura, testeable sin base — igual que `conteos.ts`. Es una función de
 * dos líneas; si `repo.ts` la cambia, este archivo tiene que enterarse por un
 * test que falla, no por un import compartido con una dependencia pesada.
 */
const estaVencido = (record: { expiresAt: string | null }, at = Date.now()): boolean => {
  if (record.expiresAt == null) return false;
  const expiresAt = Date.parse(record.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= at;
};

interface ProvinciaFeature {
  properties: { name: string };
  geometry: AreaProvincia['geometria'];
}

/**
 * Mismo GeoJSON que sirve la web (Natural Earth, dominio público — D-001 en
 * `docs/DEUDAS.md`), empaquetado en el bundle en vez de pedido por red: el
 * mapa tiene que resolver provincia offline, con la base recién migrada.
 */
const AREAS_PROVINCIAS: AreaProvincia[] = (
  provinciasGeoJson as { features: ProvinciaFeature[] }
).features.map((feature) => ({ nombre: feature.properties.name, geometria: feature.geometry }));

/** Resuelve un punto a su provincia con la misma geometría que usa la web. */
export const provinciaDeMobile = (punto: { lat: number; lng: number }): string | null =>
  provinciaDelPunto(punto, AREAS_PROVINCIAS);

export interface FuentesSenales {
  observations: readonly CivicObservationRow[];
  needs: readonly CivicNeedRow[];
  resources: readonly CivicResourceRow[];
}

const aplanarObservaciones = (rows: readonly CivicObservationRow[]): SenalParaConteo[] =>
  rows
    .filter((r) => r.publicLat != null && r.publicLng != null
      && isOperationalMapPoint('observation', r.status) && !estaVencido(r))
    .map((r) => ({
      lat: r.publicLat!,
      lng: r.publicLng!,
      // Identidad seudónima del dispositivo que la creó; regla 8: dos
      // señales de la misma persona en la misma celda son una sola voz.
      actorKey: r.creatorKey ?? r.id,
      verificable: true,
      confirmada: r.status === 'corroborated',
    }));

const aplanarNecesidades = (rows: readonly CivicNeedRow[]): SenalParaConteo[] =>
  rows
    .filter((r) => r.publicLat != null && r.publicLng != null
      && isOperationalMapPoint('need', r.status) && !estaVencido(r))
    .map((r) => ({
      lat: r.publicLat!,
      lng: r.publicLng!,
      // `civic_needs` no guarda `creatorKey` (schema sin esa columna: llegan
      // filas propias y ajenas por el feed, distinguidas por `ownedByMe`).
      // Sin identidad de persona, cada fila es su propia voz — regla 8 sigue
      // protegida donde el dato existe; acá el techo es el dato, no la regla.
      actorKey: r.id,
      verificable: true,
      confirmada: r.status === 'corroborated',
    }));

const aplanarRecursos = (rows: readonly CivicResourceRow[]): SenalParaConteo[] =>
  rows
    .filter((r) => r.publicLat != null && r.publicLng != null
      && isOperationalMapPoint('resource', r.status) && !estaVencido(r)
      && (r.quantity == null || r.quantity > 0))
    .map((r) => ({
      lat: r.publicLat!,
      lng: r.publicLng!,
      // Mismo límite que las necesidades: sin `creatorKey` en el schema.
      actorKey: r.id,
      verificable: true,
      // `ResourceStatus` no tiene `corroborated' — ofrecer un recurso no
      // pasa (todavía) por una segunda mirada. No apaga el brillo: la
      // nitidez es un eje aparte y una celda sin hechos que comprobar se
      // pinta nítida igual (`foco = 1`, ver `luzDeCelda`).
      confirmada: false,
    }));

/** Las tres fuentes públicas, aplanadas y listas para `conteosPorCelda`. */
export const senalesParaMapa = (fuentes: FuentesSenales): SenalParaConteo[] => [
  ...aplanarObservaciones(fuentes.observations),
  ...aplanarNecesidades(fuentes.needs),
  ...aplanarRecursos(fuentes.resources),
];

/** Namespace estable: los ids de celda no deben mezclarse con otro plan. */
const NAMESPACE_PORTADA = 'portada-v1';

/** El plan, sus conteos y su luz, en un solo paso — lo que consume la portada. */
export const planificarLucesDeZona = (
  zona: CoverageAreaInput,
  fuentes: FuentesSenales,
): { plan: CoveragePlan; conteos: ConteoCelda[]; luces: LuzCelda[] } => {
  const plan = planTerritorialCoverage(zona, { cellCount: 16, maxCells: 36, namespace: NAMESPACE_PORTADA });
  const conteos = conteosPorCelda(senalesParaMapa(fuentes), plan.cells, provinciaDeMobile);
  return { plan, conteos, luces: luzDeCeldas(conteos) };
};

/** `true` cuando nadie habló todavía en ninguna celda del plan — el estado vacío. */
export const nadieHabloTodavia = (conteos: readonly ConteoCelda[]): boolean =>
  conteos.every((c) => c.vocesDistintas === 0);
