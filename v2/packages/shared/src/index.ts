/**
 * Public surface of @v2/shared.
 *
 * Cross-cutting Zod schemas, types, and content registries that both
 * the api and web apps depend on.
 */
export * from './validation/index.js';
export * from './content/index.js';
export * from './civic-assessment/index.js';
export * from './datasets/index.js';
export * from './open-data/index.js';
export { xpForLevel, levelForXp, xpToNextLevel } from './gamification/levels.js';
export * from './participacion/campanas.js';
export * from './participacion/aportes.js';
export * from './participacion/diseno.js';

export * from './participacion/equipo.js';
export * from './participacion/exportaciones.js';
export * from './participacion/temas.js';
export * from './participacion/texto-reservado.js';

export * from './participacion/detalle-alternativa.js';

export * from './participacion/ejecucion.js';

export * from './participacion/gestion-iniciativas.js';
export * from './validation/gestion-iniciativas.js';

export * from './participacion/recursos-tarea.js';
export {
  CATALOGO_FUENTES,
  catalogoFuentesSchema,
  datoDelCatalogo,
  coincideConCatalogo,
} from './datos/fuentes.js';
export { GEOGRAFIA, archivoGeografico } from './datos/geografia.js';
export { VERSIONES_FUENTES } from './datos/fuentes.js';
export * from './escenarios/disponibilidad.js';

export * from './datos/validacion-espacial.js';
