/**
 * Lo que la persona empezó a escribir en la portada y sigue en Imaginar.
 *
 * Vive en memoria, en este módulo: sobrevive a la navegación dentro del sitio y
 * se pierde al recargar. No va a la URL (un relato no viaja en una dirección) ni a
 * `localStorage` (guardar en el dispositivo es una acción explícita, spec §3).
 */
let texto = '';

export function guardarTextoEnCurso(valor: string): void {
  texto = valor;
}

/** Devuelve el texto y lo borra: se usa una sola vez, al abrir Imaginar. */
export function tomarTextoEnCurso(): string {
  const t = texto;
  texto = '';
  return t;
}
