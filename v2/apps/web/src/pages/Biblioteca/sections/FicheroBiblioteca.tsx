import { useEffect, useState } from 'react';

import { ESTANTES } from '../biblioteca-data';

import { saltarASeccion } from '~/lib/ir-al-principio';
import { cn } from '~/lib/utils';

/**
 * El fichero (spec 2026-08-20 §2): franja sticky bajo el header con las
 * cinco secciones del hub. Scroll-spy por IntersectionObserver — la activa
 * es la sección visible más temprana en el orden de los estantes (mientras
 * el final de una y el principio de la siguiente comparten la ventana de
 * lectura, seguís en la primera). Sin observer (jsdom, navegadores viejos)
 * la franja rinde sin resaltado: es un <nav> de links reales y los saltos
 * funcionan igual. z-30: debajo del menú móvil (40) y del header (50).
 */
export function FicheroBiblioteca() {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const secciones = ESTANTES.map((e) => document.getElementById(e.ancla)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (secciones.length === 0) return undefined;

    const orden = new Map(ESTANTES.map((e, i) => [e.ancla, i]));
    const visibles = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) visibles.add(entrada.target.id);
          else visibles.delete(entrada.target.id);
        }
        let candidata: string | null = null;
        let menor = Infinity;
        for (const id of visibles) {
          const indice = orden.get(id) ?? Infinity;
          if (indice < menor) {
            menor = indice;
            candidata = id;
          }
        }
        // Sin ninguna a la vista (la portada, o un hueco en pleno scroll) se
        // conserva la anterior — y arriba de todo «la anterior» es ninguna.
        setActiva((previa) => candidata ?? previa);
      },
      // Ventana de lectura: el borde superior queda en 132px — abajo de
      // header (64) + franja (40) y APENAS abajo del scroll-mt-32 (128) de
      // los estantes, para que saltar a una sección la active a ella y no
      // deje viva a la anterior por el pixel de borde que comparten. El 40%
      // inferior se descuenta para que «visible» signifique «leyéndola».
      { rootMargin: '-132px 0px -40% 0px' },
    );
    for (const el of secciones) observador.observe(el);
    return () => {
      observador.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Secciones de la biblioteca"
      className="border-papel-borde bg-papel/90 sticky top-16 z-30 border-b backdrop-blur-[10px] print:hidden"
    >
      <div className="mx-auto flex max-w-[1100px] items-center gap-1 overflow-x-auto px-10 max-[560px]:px-5">
        {ESTANTES.map((estante) => {
          const aca = activa === estante.ancla;
          return (
            <a
              key={estante.ancla}
              href={`#${estante.ancla}`}
              aria-current={aca ? 'true' : undefined}
              onClick={(evento) => {
                if (saltarASeccion(estante.ancla)) evento.preventDefault();
              }}
              className={cn(
                'font-space flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors',
                aca ? 'text-violeta font-bold' : 'text-tinta-50 hover:text-tinta',
              )}
            >
              <span className={aca ? 'text-violeta' : 'text-tinta-30'}>{estante.num}</span>
              {estante.nombre}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
