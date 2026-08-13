/**
 * El motor de convergencia de La Radiografía.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md
 *
 * Lógica pura, como todo civic-core: sin red, sin disco, sin reloj. El
 * cálculo de los vectores entra por el puerto `Embebedor` y su
 * implementación real vive en el job, no acá.
 */
export * from './tipos.js';
export * from './embebedor.js';
export * from './similitud.js';
export * from './grafo.js';
export * from './nucleos.js';
export * from './geometria.js';
