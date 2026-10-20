/**
 * Los tiempos de Mirar, en milisegundos, en un solo lugar: las pruebas los achican
 * con `vi.mock` y la pantalla no tiene que saberlo.
 */
export const TIEMPOS = {
  /** Lo que tarda la tarjeta en volar después de contestar. */
  vuelo: 320,
  /** Con movimiento reducido no vuela: se desvanece, y es más corto. */
  desvanecer: 200,
  /** Lo que se ve el sello PRIMERO antes de pasar al siguiente. */
  duelo: 600,
  /** Lo que se lee «Gracias» antes de pasar al siguiente después de reportar. */
  gracias: 1_100,
} as const;
