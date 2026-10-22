export interface Puntero {
  /** Posición del puntero sobre la escena, de -1 a 1 en cada eje; 0, 0 cuando no está. */
  readonly x: number;
  readonly y: number;
}

/**
 * Sigue el puntero sobre `contenedor` para el paralaje de las escenas. Devuelve
 * un objeto vivo (se lee en cada cuadro) y la función que deja de seguirlo.
 */
export function seguirPuntero(contenedor: HTMLElement): { puntero: Puntero; soltar: () => void } {
  const puntero = { x: 0, y: 0 };
  const mover = (e: PointerEvent) => {
    const caja = contenedor.getBoundingClientRect();
    puntero.x = ((e.clientX - caja.left) / caja.width) * 2 - 1;
    puntero.y = ((e.clientY - caja.top) / caja.height) * 2 - 1;
  };
  const salir = () => {
    puntero.x = 0;
    puntero.y = 0;
  };
  contenedor.addEventListener('pointermove', mover);
  contenedor.addEventListener('pointerleave', salir);
  return {
    puntero,
    soltar: () => {
      contenedor.removeEventListener('pointermove', mover);
      contenedor.removeEventListener('pointerleave', salir);
    },
  };
}
