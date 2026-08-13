/**
 * Superficie pública de @v2/civic-core.
 *
 * El vocabulario de la ubicación y la lógica territorial que comparten la web
 * (v2) y la app de campo (`juego/`). Lógica pura: sin UI, sin APIs de
 * plataforma, sin red ni disco. Todo lo que entra acá tiene que poder correr
 * igual en Node, en el navegador y en Hermes.
 *
 * Spec: docs/specs/2026-07-26-el-mapa-instrumento-territorial.md §3
 */
export * from './types.js';
export * from './geo.js';
export * from './location-policy.js';
export * from './direcciones.js';
export * from './lasso.js';
export * from './coverage.js';
export * from './coeficientes-luz.js';
export * from './brillo.js';
export * from './provincias.js';
export * from './provincias-canonicas.js';
export * from './poblacion.js';
export * from './faltas.js';
export * from './senal/index.js';
export * from './simulacion/index.js';
export * from './radiografia/index.js';
