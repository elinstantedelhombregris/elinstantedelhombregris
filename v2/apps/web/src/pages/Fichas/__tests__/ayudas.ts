/** Un elemento que la prueba da por existente; si falta, la prueba falla con un mensaje claro. */
export function requerido<T>(valor: T | null | undefined, que = 'un elemento'): T {
  if (valor === null || valor === undefined) throw new Error(`La prueba esperaba ${que}.`);
  return valor;
}
