export const CAMPOS = [
  ['titulo', 'Nombre de la alternativa'],
  ['funcionamiento', 'Cómo funcionaría'],
  ['resultado', 'Qué condición de vida haría posible'],
  ['dependencias', 'Qué necesita de otros sistemas o equipos'],
  ['presupuesto', 'Costos, recursos y supuestos que necesitamos contrastar'],
  ['prueba', 'Qué prueba pequeña permitiría aprender'],
  ['criterioPausa', 'Qué resultado nos haría detenernos o rediseñar'],
] as const;
type Clave = (typeof CAMPOS)[number][0];
export type Valores = Record<Clave, string>;

export const VACIO: Valores = {
  titulo: '',
  funcionamiento: '',
  resultado: '',
  dependencias: '',
  presupuesto: '',
  prueba: '',
  criterioPausa: '',
};
/** Lo que pide el servidor, con el mensaje que ve quien escribe. */
const MINIMOS: Partial<Record<Clave, [number, string]>> = {
  titulo: [5, 'Poné un nombre de al menos 5 caracteres.'],
  funcionamiento: [20, 'Contá cómo funcionaría, en al menos 20 caracteres.'],
  resultado: [10, 'Decí qué condición de vida haría posible, en al menos 10 caracteres.'],
  prueba: [15, 'Proponé una prueba pequeña, en al menos 15 caracteres.'],
  criterioPausa: [10, 'Decí qué resultado nos haría frenar, en al menos 10 caracteres.'],
};

export function validar(v: Valores): Partial<Record<Clave, string>> {
  const errores: Partial<Record<Clave, string>> = {};
  for (const [clave, [minimo, mensaje]] of Object.entries(MINIMOS) as [Clave, [number, string]][])
    if (v[clave].trim().length < minimo) errores[clave] = mensaje;
  return errores;
}
