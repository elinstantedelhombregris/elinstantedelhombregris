/**
 * Superficie pública de `@v2/shared/seguridad`.
 *
 * Subpath propio y no barril de la raíz: lo consumen el middleware de la API y
 * los scripts de build, no la web. Nada de acá tiene por qué viajar al bundle
 * del navegador.
 */
export { CABECERAS_DE_SEGURIDAD, CSP, serializarCsp } from './csp.js';
export type { DirectivasCsp, FuentesCsp } from './csp.js';
