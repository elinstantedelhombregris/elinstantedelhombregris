import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { type PapelNavItem } from './papel-nav';

import type { FocusEvent, KeyboardEvent, MouseEvent } from 'react';

import { saltarSiEsLaMismaPagina } from '~/lib/ir-al-principio';
import { cn } from '~/lib/utils';

const ID_PANEL = 'menu-biblioteca';

/** ¿La sección es la página donde ya estamos? El ancla no cuenta para esto. */
function esLaActual(location: string, href: string): boolean {
  const [ruta = ''] = href.split('#');
  return location === ruta || location.startsWith(`${ruta}/`);
}

/**
 * El desplegable de «La biblioteca» en el header papel.
 *
 * La biblioteca tiene cinco estantes con destino propio y desde el header
 * solo se llegaba al hub: para entrar a la bitácora o a los entrenamientos
 * había que atravesarlo. El panel los abre todos.
 *
 * Se abre con el mouse Y con el foco, y se cierra con Escape: un menú que
 * solo entiende de hover deja afuera a quien navega con teclado. El
 * disparador sigue siendo un link real al hub — el panel agrega caminos, no
 * los reemplaza, así que nadie queda sin poder llegar a `/biblioteca`.
 */
export function MenuBiblioteca({
  item,
  activa,
  secciones,
}: {
  item: PapelNavItem;
  activa: boolean;
  /** Los hijos que despliega. Entran por prop desde `SUBSECCIONES`: el
   *  componente dejó de saber cuál es la entrada con estantes el día que hubo
   *  una segunda (La Radiografía cuelga de «El mapa»). */
  secciones: readonly PapelNavItem[];
}) {
  const [location] = useLocation();
  const [abierto, setAbierto] = useState(false);

  // Cambiar de página cierra el panel: el mouse ya no está donde estaba.
  useEffect(() => {
    setAbierto(false);
  }, [location]);

  function alSalirElFoco(evento: FocusEvent<HTMLDivElement>): void {
    // relatedTarget es adónde VA el foco: si sigue adentro, el panel se queda.
    if (!evento.currentTarget.contains(evento.relatedTarget)) setAbierto(false);
  }

  function alTeclear(evento: KeyboardEvent<HTMLDivElement>): void {
    if (evento.key === 'Escape') setAbierto(false);
  }

  function alTocarSeccion(evento: MouseEvent<HTMLAnchorElement>, href: string): void {
    setAbierto(false);
    // Si ya estamos en la página del ancla, wouter no re-renderiza (su
    // `location` es solo el camino) y nadie scrollea: saltamos a mano.
    if (saltarSiEsLaMismaPagina(href, location)) evento.preventDefault();
  }

  return (
    <div
      className="relative flex h-16 items-center"
      onMouseEnter={() => {
        setAbierto(true);
      }}
      onMouseLeave={() => {
        setAbierto(false);
      }}
      onFocus={() => {
        setAbierto(true);
      }}
      onBlur={alSalirElFoco}
      onKeyDown={alTeclear}
    >
      <Link
        href={item.href}
        aria-expanded={abierto}
        aria-controls={ID_PANEL}
        className={cn(
          'font-space hover:text-tinta flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs uppercase tracking-[0.06em] transition-colors',
          activa ? 'border-violeta text-tinta' : 'text-tinta-50 border-transparent',
        )}
      >
        {item.label}
        <span aria-hidden className={cn('text-[10px]', abierto && 'text-violeta')}>
          ▾
        </span>
      </Link>

      {abierto ? (
        <div
          id={ID_PANEL}
          className="border-tinta bg-papel absolute left-0 top-full z-50 -mt-px flex w-[264px] flex-col border"
        >
          {secciones.map((seccion) => {
            const aca = esLaActual(location, seccion.href);
            return (
              <Link
                key={seccion.href}
                href={seccion.href}
                aria-current={aca ? 'page' : undefined}
                onClick={(evento) => {
                  alTocarSeccion(evento, seccion.href);
                }}
                className={cn(
                  'font-space border-papel-borde hover:bg-papel-presionado hover:text-tinta flex min-h-11 items-center border-b px-4 py-3 text-xs uppercase leading-tight tracking-[0.06em] transition-colors last:border-b-0',
                  aca ? 'text-tinta' : 'text-tinta-75',
                )}
              >
                {seccion.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
