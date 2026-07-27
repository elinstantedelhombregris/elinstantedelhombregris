/**
 * SkyView — la puerta al Cielo. En nativo es el canvas directo; en web
 * (SkyView.web.tsx) difiere la carga de CanvasKit. Las pantallas importan
 * SIEMPRE desde acá y jamás desde CieloCanvas: así ningún módulo de app
 * toca Skia antes de que esté listo.
 */

export { CieloCanvas as SkyView } from './CieloCanvas';
export type { CieloProps, EstrellaCielo } from './CieloCanvas';
