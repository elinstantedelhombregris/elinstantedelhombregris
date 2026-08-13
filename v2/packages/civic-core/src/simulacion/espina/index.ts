/**
 * La espina — lo que los dos modos comparten.
 *
 * Un modo no es una implementación de `simular()`: es una función que produce
 * una `Cosecha`. Todo lo que viene después —mandato, retrato, procedencia,
 * cobertura, barrido, cortina— vive acá, es uno solo, y no sabe qué modo lo
 * produjo. Eso es lo que hace que esto sea un módulo con dos modos y no dos
 * programas que comparten carpeta.
 */
export * from './azar.js';
export * from './barrer.js';
export * from './corrida.js';
export * from './cosecha.js';
export * from './diseno-serie.js';
export * from './escenario.js';
export * from './estimacion.js';
export * from './forma.js';
export * from './metodos/muestreo.js';
export * from './metodos/oat.js';
export * from './metodos/umbral.js';
export * from './retratar.js';
export * from './variables.js';
export * from './veredicto.js';
