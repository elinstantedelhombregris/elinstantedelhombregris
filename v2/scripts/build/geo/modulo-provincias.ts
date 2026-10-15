import { validarGeografia } from '../../../packages/shared/src/datos/geografia-schema.js';

export function moduloProvincias(texto: string, version: string) {
  const { datos } = validarGeografia(texto, 'provincias');
  const areas = datos.features.map((f) => ({ nombre: f.properties.name, geometria: f.geometry }));
  return `/**
 * GENERADO — no editar a mano. Correr \`pnpm geo:provincias\`.
 * Derivado de la edición inmutable declarada en geografia.generated.json.
 */
import type { AreaProvincia } from '@v2/civic-core';

export const VERSION_GEOGRAFICA = '${version}';
export const AREAS_PROVINCIAS: readonly AreaProvincia[] = ${JSON.stringify(areas)};
`;
}
