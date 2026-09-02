import { useEffect, useState } from 'react';

import { saltarASeccion } from '~/lib/ir-al-principio';
import { cn } from '~/lib/utils';

export interface SeccionDelIndice {
  /** El id del encabezado en el documento (lo pone `renderMarkdown`). */
  id: string;
  texto: string;
}

export interface IndiceLectorProps {
  secciones: readonly SeccionDelIndice[];
  /** Nombre accesible del nav («Índice del expediente»). */
  etiqueta: string;
  /**
   * `columna`: lista fija al costado del documento (pantallas anchas).
   * `plegado`: un `<details>` arriba del documento (pantallas angostas).
   * El llamador pone las dos y las alterna con CSS: cada una lleva su
   * propio scroll-spy, y la que no se ve no molesta.
   */
  presentacion: 'columna' | 'plegado';
  /** Sobre qué fondo se lee: cambia los colores, no la forma. */
  superficie?: 'oscuro' | 'papel';
  className?: string;
}

/**
 * Scroll-spy por IntersectionObserver — la misma receta que el fichero de
 * la biblioteca: la activa es la sección visible más temprana; sin ninguna
 * a la vista se conserva la anterior. Sin observer (jsdom) devuelve -1 y el
 * índice rinde igual, como lista de links reales.
 */
function useSeccionActiva(
  secciones: readonly SeccionDelIndice[],
): [number, (id: string) => void] {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const elementos = secciones
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elementos.length === 0) return undefined;

    const orden = new Map(secciones.map((s, i) => [s.id, i]));
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
        setActiva((previa) => candidata ?? previa);
      },
      // El borde superior queda en 92px: APENAS arriba del scroll-mt-24 (96)
      // de los encabezados, para que un encabezado recién saltado —que cae
      // exactamente en 96— cuente como visible. El 55% inferior se descuenta
      // para que «visible» signifique «leyéndola», no «asomando».
      { rootMargin: '-92px 0px -55% 0px' },
    );
    for (const el of elementos) observador.observe(el);
    return () => {
      observador.disconnect();
    };
  }, [secciones]);

  return [activa === null ? -1 : secciones.findIndex((s) => s.id === activa), setActiva];
}

/**
 * El índice de un lector largo (spec 2026-09-01 §5, D-082): las secciones
 * del documento como anclas, con «Sección n de N» como brújula. Nació para
 * el PLAN de 68.000 palabras que no tenía cómo recorrerse; sirve para
 * cualquier documento cuyos encabezados lleven id.
 *
 * Saltar a una sección deja el ancla en la URL (`replaceState`, sin
 * navegación de wouter) para que el lugar se pueda compartir.
 */
export function IndiceLector({
  secciones,
  etiqueta,
  presentacion,
  superficie = 'papel',
  className,
}: IndiceLectorProps) {
  const [activa, marcarActiva] = useSeccionActiva(secciones);
  const total = secciones.length;
  const oscuro = superficie === 'oscuro';

  const brujula =
    activa === -1 ? `${String(total)} secciones` : `Sección ${String(activa + 1)} de ${String(total)}`;

  const lista = (
    <ol className="m-0 list-none p-0">
      {secciones.map((s, i) => {
        const aca = i === activa;
        return (
          <li key={s.id} className="m-0 p-0">
            <a
              href={`#${s.id}`}
              aria-current={aca ? 'true' : undefined}
              onClick={(evento) => {
                if (saltarASeccion(s.id)) {
                  evento.preventDefault();
                  window.history.replaceState(window.history.state, '', `#${s.id}`);
                  // El índice responde al toque, no al final del scroll suave:
                  // en un documento de 260.000px el deslizamiento tarda más de
                  // un segundo y el observer recién confirma al llegar.
                  marcarActiva(s.id);
                }
              }}
              className={cn(
                'flex items-baseline gap-2.5 py-1.5 text-[13px] leading-snug transition-colors',
                aca
                  ? oscuro
                    ? 'text-violeta-claro font-bold'
                    : 'text-violeta font-bold'
                  : oscuro
                    ? 'text-oscuro-meta hover:text-oscuro-texto'
                    : 'text-tinta-50 hover:text-tinta',
              )}
            >
              <span
                className={cn(
                  'font-space w-6 shrink-0 text-[11px] tabular-nums',
                  oscuro ? 'text-oscuro-tenue' : 'text-tinta-30',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.texto}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  const claseBrujula = cn(
    'font-space text-[11px] uppercase tracking-[0.12em]',
    oscuro ? 'text-oscuro-meta' : 'text-tinta-50',
  );

  if (presentacion === 'columna') {
    return (
      <nav
        aria-label={etiqueta}
        className={cn('sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2', className)}
      >
        <p className={cn(claseBrujula, 'mb-3')} aria-live="polite">
          {brujula}
        </p>
        {lista}
      </nav>
    );
  }

  return (
    <nav aria-label={etiqueta} className={className}>
      <details className={cn('border-b pb-4', oscuro ? 'border-oscuro-borde' : 'border-papel-borde')}>
        <summary
          className={cn(
            'font-space cursor-pointer list-none text-[11px] uppercase tracking-[0.12em] marker:content-none',
            oscuro ? 'text-oscuro-meta hover:text-oscuro-texto' : 'text-tinta-50 hover:text-tinta',
          )}
        >
          Índice · {brujula} ▾
        </summary>
        <div className="mt-3">{lista}</div>
      </details>
    </nav>
  );
}
