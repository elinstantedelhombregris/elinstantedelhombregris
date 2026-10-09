/**
 * El catálogo de modos, separado del chrome.
 *
 * Vive en su propio módulo por el fast refresh de Vite: un archivo que exporta
 * componentes Y constantes pierde el hot reload de esos componentes. Es una
 * regla del tooling, no un capricho — y la alternativa era silenciar el aviso.
 */
export type Modo = 'mapa' | 'analisis' | 'tiempo' | 'cobertura' | 'simulacion';

export const MODOS: { id: Modo; etiqueta: string; descripcion: string }[] = [
  // `descripcion` es la pregunta que contesta cada modo, y se muestra debajo de
  // su pestaña: una palabra sola («Cobertura») no dice para qué sirve.
  { id: 'mapa', etiqueta: 'Mapa', descripcion: '¿Dónde hay aportes?' },
  { id: 'analisis', etiqueta: 'Análisis', descripcion: '¿Cuántos por provincia?' },
  { id: 'tiempo', etiqueta: 'Línea de tiempo', descripcion: '¿Cuándo llegaron?' },
  { id: 'cobertura', etiqueta: 'Cobertura', descripcion: '¿Qué zonas faltan?' },
  { id: 'simulacion', etiqueta: 'Simulación', descripcion: '¿Y si hablaran más?' },
];
