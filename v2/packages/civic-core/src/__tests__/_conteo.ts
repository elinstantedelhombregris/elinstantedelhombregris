import type { ConteoCelda } from '../brillo.js';

/**
 * Una celda con denominador conocido y nada dicho todavía. Cada test cambia
 * sólo los campos que le importan, y así lo que varía queda a la vista.
 */
export const conteo = (parcial: Partial<ConteoCelda>): ConteoCelda => ({
  cellId: 'c1',
  vocesDistintas: 0,
  habitantes: 1000,
  verificables: 0,
  confirmaciones: 0,
  ...parcial,
});
