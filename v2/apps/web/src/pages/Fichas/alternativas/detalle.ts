import type { DetalleAlternativa } from '@v2/shared';

export const DETALLE_VACIO: DetalleAlternativa = {
  beneficiarios: '',
  afectados: '',
  capacidades: '',
  costo: null,
  costoUnidad: '',
  fuenteCosto: null,
  plazo: null,
  efectosAdversos: '',
  incertidumbre: '',
  situacionActual: false,
  referencias: [],
};
export const CAMPOS_DETALLE = [
  ['beneficiarios', 'A quiénes beneficiaría'],
  ['afectados', 'A quiénes podría perjudicar o dejar afuera'],
  ['capacidades', 'Capacidades necesarias'],
  ['efectosAdversos', 'Efectos adversos posibles'],
  ['incertidumbre', 'Qué falta saber y qué supuestos podrían fallar'],
] as const;
