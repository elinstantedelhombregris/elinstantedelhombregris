import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { Escena } from './Escena';
import { esNombreDeEscena, type NombreDeEscena } from './registro';

interface Destino {
  nodo: HTMLElement;
  nombre: NombreDeEscena;
}

/**
 * El cuerpo de una crónica es HTML verbatim (`MdxPapel` vía marked): no hay
 * JSX en el MDX. Una escena se pide con un hueco, `<div data-escena="horas">`,
 * y este componente la monta adentro con un portal, así sigue siendo parte del
 * árbol de React. Un nombre que no está en `ESCENAS` deja el hueco vacío; la
 * guardia de `escenas.test.ts` impide publicarlo.
 *
 * Va con `key={slug}`: al cambiar de crónica, el HTML se reemplaza entero y los
 * huecos viejos dejan de existir.
 */
export function EscenasDeCronica({ contenedor }: { contenedor: RefObject<HTMLElement> }) {
  const [destinos, setDestinos] = useState<readonly Destino[]>([]);

  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;
    const encontrados: Destino[] = [];
    for (const nodo of raiz.querySelectorAll<HTMLElement>('[data-escena]')) {
      const nombre = nodo.dataset.escena ?? '';
      if (esNombreDeEscena(nombre)) encontrados.push({ nodo, nombre });
    }
    setDestinos(encontrados);
  }, [contenedor]);

  return (
    <>
      {destinos.map(({ nodo, nombre }, i) =>
        createPortal(<Escena nombre={nombre} />, nodo, `${nombre}-${String(i)}`),
      )}
    </>
  );
}
