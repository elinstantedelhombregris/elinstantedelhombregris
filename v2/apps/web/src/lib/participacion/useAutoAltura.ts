import { useLayoutEffect, type RefObject } from 'react';

/**
 * Hace que un `<textarea>` crezca con su contenido, sin scroll interno hasta el tope que le
 * ponga la hoja de estilos (`max-h-*`). El mínimo es el de sus `rows`.
 *
 * `field-sizing: content` haría lo mismo sin JavaScript, pero Safari y Firefox no lo traen todos:
 * esto anda en todos y no deja dos mecanismos peleando por el alto.
 *
 * Dos cuidados que importan:
 *  - dentro de un contenedor `hidden` el `scrollHeight` es 0; fijar ese alto dejaría el campo en
 *    cero al mostrarse. En ese caso se suelta el alto y el campo vuelve a sus `rows`;
 *  - el ancho decide cuántas líneas ocupa el texto, así que se reajusta cuando el campo cambia
 *    de ancho (girar el teléfono, abrir el panel), no solo cuando cambia el texto.
 */
export function useAutoAltura(ref: RefObject<HTMLTextAreaElement | null>, valor: string): void {
  useLayoutEffect(() => {
    const campo = ref.current;
    if (!campo) return;
    const ajustar = () => {
      // Al soltar el alto la página se acorta un instante: si la persona está leyendo cerca del
      // final, el navegador la subiría. Se vuelve a donde estaba.
      const pagina = document.scrollingElement;
      const arriba = pagina?.scrollTop ?? 0;
      campo.style.height = 'auto';
      if (campo.scrollHeight === 0) {
        campo.style.height = '';
        return;
      }
      // `box-sizing: border-box`: al alto del contenido hay que sumarle los bordes.
      const bordes = campo.offsetHeight - campo.clientHeight;
      campo.style.height = `${String(campo.scrollHeight + bordes)}px`;
      if (pagina && pagina.scrollTop !== arriba) pagina.scrollTop = arriba;
    };
    ajustar();
    if (typeof ResizeObserver === 'undefined') return;
    let ancho = campo.offsetWidth;
    const observador = new ResizeObserver(() => {
      if (campo.offsetWidth === ancho) return;
      ancho = campo.offsetWidth;
      ajustar();
    });
    observador.observe(campo);
    return () => {
      observador.disconnect();
    };
  }, [ref, valor]);
}
