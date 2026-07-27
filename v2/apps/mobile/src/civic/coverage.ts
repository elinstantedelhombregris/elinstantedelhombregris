/**
 * La grilla de cobertura vive en `@v2/civic-core`, compartida con la web.
 *
 * La web la usa para el mapa del silencio —qué celdas de un área no tienen
 * ninguna señal— y el móvil para planificar qué se camina. Es la misma
 * pregunta desde los dos lados, así que es el mismo plan: si el plan no
 * coincidiera, la celda que la web marca muda no sería la que el móvil manda
 * a visitar.
 */
export {
  planTerritorialCoverage,
  pointInCoverageArea,
  summarizeCoverageStatuses,
} from '@v2/civic-core';
export type {
  CoverageAreaInput,
  CoverageCell,
  CoverageCellStatusInput,
  CoverageIssue,
  CoverageIssueCode,
  CoveragePlan,
  CoverageShare,
  CoverageStatus,
  CoverageStatusSummary,
  CoverageTarget,
  GeoJsonPolygonInput,
  GeoJsonPosition,
} from '@v2/civic-core';
