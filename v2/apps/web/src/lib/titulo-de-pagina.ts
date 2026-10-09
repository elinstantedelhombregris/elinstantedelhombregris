import { useEffect } from 'react';

/** Lo que cierra el título de toda página: «Mi espacio · ¡BASTA!». */
export const SUFIJO_DEL_TITULO = '¡BASTA!';

/**
 * El título de la pestaña para la página que se está mirando: `«<titulo> · ¡BASTA!»`.
 *
 * Sin esto toda página se llama igual (el título de `index.html`) y quien navega con lector de
 * pantalla, con varias pestañas o desde el historial no puede distinguirlas. Al desmontar la
 * página devuelve el título que había, así que una pantalla sin título propio no hereda el de la
 * anterior. Un título vacío (la campaña o la ficha todavía cargando) no toca nada.
 */
export function useTituloDePagina(titulo: string): void {
  useEffect(() => {
    const limpio = titulo.trim();
    if (limpio === '') return;
    const anterior = document.title;
    document.title = `${limpio} · ${SUFIJO_DEL_TITULO}`;
    return () => {
      document.title = anterior;
    };
  }, [titulo]);
}
