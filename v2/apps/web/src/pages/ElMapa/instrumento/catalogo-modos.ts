/**
 * El catálogo de modos, separado del chrome.
 *
 * Vive en su propio módulo por el fast refresh de Vite: un archivo que exporta
 * componentes Y constantes pierde el hot reload de esos componentes. Es una
 * regla del tooling, no un capricho — y la alternativa era silenciar el aviso.
 */
export type Modo = 'mapa' | 'analisis' | 'tiempo' | 'cobertura';

export const MODOS: { id: Modo; etiqueta: string; descripcion: string }[] = [
  { id: 'mapa', etiqueta: 'Mapa', descripcion: 'Cada voz donde fue dicha' },
  { id: 'analisis', etiqueta: 'Análisis', descripcion: 'Qué provincia habla y cuánto' },
  { id: 'tiempo', etiqueta: 'Línea de tiempo', descripcion: 'Cómo se fue despertando' },
  { id: 'cobertura', etiqueta: 'Cobertura', descripcion: 'Dónde todavía no habló nadie' },
];
