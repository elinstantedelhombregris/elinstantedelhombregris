import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { cargarGrafo, cargarVisor } from './Atlas/cargar-visor';
import { PLAN_COUNT } from './Planes/la-prueba-data';

import type { MouseEvent } from 'react';

import { Kicker } from '~/components/papel/primitives';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

type Estado = 'cargando' | 'listo' | 'error';

/**
 * El atlas del corpus — el análisis en profundidad. Monta el visor estático
 * (`public/atlas/atlas.js`) dentro del chrome papel. El título de la página es
 * de acá; el visor pinta sus pestañas, su contenido y su nota de método.
 */
export function Atlas() {
  useTituloDePagina('Atlas del corpus');
  const [, navegar] = useLocation();
  const raiz = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>('cargando');

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const control = new AbortController();
    let limpiar: (() => void) | undefined;

    Promise.all([cargarVisor(), cargarGrafo(control.signal)]).then(
      ([visor, grafo]) => {
        if (control.signal.aborted) return;
        setEstado('listo');
        limpiar = visor.iniciar(grafo, el);
      },
      () => {
        if (!control.signal.aborted) setEstado('error');
      },
    );

    return () => {
      control.abort();
      limpiar?.();
      limpiar = undefined;
    };
  }, []);

  // Los links internos del visor son `<a href="/…">` planos: los resolvemos con el router.
  const alHacerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (!(e.target instanceof Element)) return;
    const a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('target')) return;
    const href = a.getAttribute('href');
    if (!href?.startsWith('/') || href.startsWith('//')) return;
    e.preventDefault();
    navegar(href);
  };

  return (
    <main>
      <section className="mx-auto max-w-[1440px] px-10 pb-8 pt-16 max-[560px]:px-5">
        <Kicker className="anim-fadeup mb-4">
          Análisis en profundidad · los {PLAN_COUNT} planes y su plan meta
        </Kicker>
        <h1 className="font-anton mb-5 text-[clamp(34px,4vw,56px)] leading-[0.98]">
          El atlas del corpus
        </h1>
        <p className="text-tinta-75 max-w-[640px] text-pretty text-[17px] leading-[1.6]">
          Quién se apoya en quién, qué nombra cada plan como propio, qué se rompe cuando se edita
          uno y cómo se va arreglando. Para elegir un plan y leerlo, el mapa está en{' '}
          <Link href="/planes" className="text-violeta font-semibold">
            la página de los planes
          </Link>
          .
        </p>
      </section>
      <section className="mx-auto max-w-[1440px] px-10 pb-[72px] max-[560px]:px-5">
        {estado === 'cargando' ? (
          <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
            Cargando el corpus…
          </p>
        ) : null}
        {estado === 'error' ? (
          <p className="font-space text-tinta-75 text-[11px] uppercase tracking-[0.12em]">
            El atlas no cargó. Probá recargar la página.{' '}
            <Link href="/planes" className="text-violeta font-bold">
              Ir a los planes →
            </Link>
          </p>
        ) : null}
        <div className="atlas" ref={raiz} onClick={alHacerClick} />
      </section>
    </main>
  );
}

export default Atlas;
