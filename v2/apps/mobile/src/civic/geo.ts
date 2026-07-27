/**
 * La geometría de la ubicación vive en `@v2/civic-core`, compartida con la web.
 *
 * Este archivo era una copia. Ahora es un puente: se mantiene la ruta
 * `@/civic/geo` para que ningún call site cambie, pero la implementación es
 * una sola. La misma función que corre acá al capturar en campo es la que el
 * servidor usa al ingerir, y la que la web usa para dibujar el halo — no puede
 * haber tres respuestas distintas a «cuánto se corrió este punto».
 */
export {
  haversineKm,
  obfuscatePoint,
  publicLocation,
  publicLocationUncertaintyKm,
} from '@v2/civic-core';
