import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';

import { MenuBiblioteca } from './MenuBiblioteca';
import {
  PAPEL_NAV,
  PAPEL_NAV_ALL,
  SUBSECCIONES,
  SUMATE_LABEL,
  type PapelNavItem,
} from './papel-nav';

import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { despertar } from '~/lib/despertar';
import { saltarSiEsLaMismaPagina } from '~/lib/ir-al-principio';
import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useVocesCount } from '~/lib/queries/analytics';
import { cn } from '~/lib/utils';

function esActiva(location: string, href: string): boolean {
  if (href === '/') return location === '/';
  return location === href || location.startsWith(`${href}/`);
}

/** `page` en la página misma, `true` en una página de adentro de la sección. */
function ariaCurrent(location: string, href: string): 'page' | 'true' | undefined {
  if (!esActiva(location, href)) return undefined;
  return location === href ? 'page' : 'true';
}

/** El camino de un destino, sin su ancla: `/biblioteca#ensayos` vive en `/biblioteca`. */
function caminoDe(href: string): string {
  return href.split('#')[0] ?? href;
}

/**
 * Una entrada del recorrido está activa en su página, adentro de ella o en la
 * página de uno de sus hijos: en `/el-mapa` se marca «Mi Argentina ideal»,
 * porque el mapa cuelga de ahí.
 */
function seccionActiva(location: string, item: PapelNavItem): boolean {
  return (
    esActiva(location, item.href) ||
    (SUBSECCIONES[item.href] ?? []).some((hijo) => esActiva(location, caminoDe(hijo.href)))
  );
}

function ariaCurrentSeccion(location: string, item: PapelNavItem): 'page' | 'true' | undefined {
  if (location === item.href) return 'page';
  return seccionActiva(location, item) ? 'true' : undefined;
}

/**
 * De los hijos de una entrada, el que corresponde a la página: el de camino más
 * largo que la contiene. Sin esto, en `/mi-argentina-ideal/imaginar` quedaban
 * marcados Imaginar y también Ver, que es `/mi-argentina-ideal`.
 */
function hijoActual(location: string, hijos: readonly PapelNavItem[]): string | undefined {
  let elegido: string | undefined;
  for (const hijo of hijos) {
    const camino = caminoDe(hijo.href);
    if (!esActiva(location, camino)) continue;
    if (elegido === undefined || camino.length > caminoDe(elegido).length) elegido = hijo.href;
  }
  return elegido;
}

const ID_MENU_MOVIL = 'menu-movil';

const CLASE_ITEM =
  'font-space hover:text-tinta border-b-2 px-3.5 py-2 text-xs uppercase tracking-[0.06em] transition-colors';

/**
 * Header papel: wordmark con signos en violeta, contador FOMO, las cuatro
 * puertas del recorrido en mono y el botón «Sumate», que lleva a Imaginar.
 * Colapsa a menú de pantalla completa ≤1140px.
 */
export function PapelHeader() {
  const [location] = useLocation();
  // «Ingresar» devuelve a la página donde se pidió, con su query: suscribirse a
  // la búsqueda mantiene fresco ese enlace cuando solo cambian los filtros.
  useSearch();
  const auth = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const vocesQuery = useVocesCount();
  /**
   * Tres estados y ninguna invención.
   *
   * Antes, mientras cargaba o si fallaba, caía a un `DEMO_VOCES_COUNT` de
   * 12.496 voces: una cifra fabricada, en el lugar más visible del sitio, en
   * todas las páginas. Un hueco es mejor que un número que nadie dijo.
   *
   * En cero el contador cambia de signo: no cuenta, invita. Y vuelve a contar
   * solo en cuanto haya una voz — no hay ningún modo que apagar.
   */
  const total = vocesQuery.data?.total;
  const leyendaVoces =
    total === undefined
      ? null
      : total === 0
        ? 'el primer aporte todavía puede ser el tuyo'
        : `${total.toLocaleString('es-AR')} ${total === 1 ? 'aporte' : 'aportes'} en el registro`;

  // Escape cierra el menú de pantalla completa y devuelve el foco al botón que
  // lo abrió: sin eso quien navega con teclado queda sobre un link que ya no está.
  useEffect(() => {
    if (!menuOpen) return;
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      setMenuOpen(false);
      botonMenu.current?.focus();
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
    };
  }, [menuOpen]);

  // Con el menú de pantalla completa abierto la página de atrás no se desplaza. Se guarda y se
  // devuelve el `overflow` que había (no un '' a ciegas), también si el header se desmonta
  // con el menú abierto.
  useEffect(() => {
    if (!menuOpen) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuOpen]);

  const hrefSesion = auth.user ? '/mi-espacio' : hrefIngresar();
  const rutaSesion = auth.user ? '/mi-espacio' : '/ingresar';

  return (
    // El menú móvil vive FUERA del <header>: el backdrop-filter del header lo
    // convertiría en containing block y el overlay fixed quedaría atrapado ahí.
    <>
      <header className="border-tinta bg-papel/90 sticky top-0 z-50 border-b backdrop-blur-[10px] print:hidden">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 min-[961px]:px-10">
          <Link
            href="/"
            aria-label="¡BASTA! — inicio"
            className="text-tinta flex items-baseline gap-2.5"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <span className="font-anton text-[26px] leading-none tracking-[0.01em]">
              <span className="text-violeta">¡</span>BASTA<span className="text-violeta">!</span>
            </span>
            {leyendaVoces === null ? null : (
              <span className="font-space text-tinta-50 hidden text-[10px] uppercase tracking-[0.14em] min-[1351px]:inline">
                {leyendaVoces}
              </span>
            )}
          </Link>

          <nav
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap min-[1141px]:flex"
            aria-label="Recorrido"
          >
            {PAPEL_NAV.map((item) =>
              // Las entradas con hijos los despliegan en vez de obligar a
              // pasar por el hub. Cuáles son es dato (`SUBSECCIONES`) y no un
              // `if` por href: hoy son las cuatro.
              SUBSECCIONES[item.href] ? (
                <MenuBiblioteca
                  key={item.href}
                  item={item}
                  activa={seccionActiva(location, item)}
                  secciones={SUBSECCIONES[item.href] ?? []}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={ariaCurrentSeccion(location, item)}
                  className={cn(
                    CLASE_ITEM,
                    seccionActiva(location, item)
                      ? 'border-violeta text-tinta'
                      : 'text-tinta-50 border-transparent',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href={hrefSesion}
              aria-current={ariaCurrent(location, rutaSesion)}
              className={cn(
                CLASE_ITEM,
                esActiva(location, rutaSesion)
                  ? 'border-violeta text-tinta'
                  : 'text-tinta-50 border-transparent',
              )}
            >
              {auth.user ? 'Mi espacio' : 'Ingresar'}
            </Link>
            <Link
              href={APORTAR_HREF}
              className="bg-tinta font-space text-papel hover:bg-violeta ml-3.5 px-5 py-[11px] text-xs font-bold uppercase tracking-[0.08em] transition-colors"
              onClick={despertar}
            >
              {SUMATE_LABEL}
            </Link>
          </nav>

          <button
            ref={botonMenu}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={ID_MENU_MOVIL}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="border-tinta font-space text-tinta hidden min-h-11 min-w-11 items-center justify-center gap-2 border px-3.5 py-[9px] text-xs uppercase max-[1140px]:inline-flex"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
          >
            {menuOpen ? 'Cerrar ✕' : 'Menú ☰'}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav
          id={ID_MENU_MOVIL}
          aria-label="Recorrido completo"
          className="bg-papel fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col gap-1 overflow-y-auto px-6 py-8"
        >
          {PAPEL_NAV_ALL.map((item) => {
            const hijos = SUBSECCIONES[item.href] ?? [];
            const actual = hijoActual(location, hijos);
            return (
              <Fragment key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ariaCurrentSeccion(location, item)}
                  className="border-papel-borde font-anton text-tinta flex items-center justify-between border-b py-2.5 text-[42px] leading-none"
                  onClick={() => {
                    // En móvil, «Sumate» es el mismo trigger canónico del despertar §10.7.
                    if (item.href === APORTAR_HREF) despertar();
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                  <span className="font-space text-violeta text-xs">{item.num}</span>
                </Link>
                {/* Los hijos de una entrada también se abren acá: el menú chico
                  no puede ofrecer menos caminos que el grande. */}
                {hijos.map((seccion) => (
                  <Link
                    key={seccion.href}
                    href={seccion.href}
                    aria-current={
                      seccion.href === actual
                        ? ariaCurrent(location, caminoDe(seccion.href))
                        : undefined
                    }
                    className="border-papel-borde font-space text-tinta-75 flex min-h-11 items-center justify-between border-b pl-5 text-xs uppercase tracking-[0.06em]"
                    onClick={(evento) => {
                      if (saltarSiEsLaMismaPagina(seccion.href, location)) evento.preventDefault();
                      setMenuOpen(false);
                    }}
                  >
                    {seccion.label}
                    <span className="font-space text-tinta-50 text-[10px]">{seccion.num}</span>
                  </Link>
                ))}
              </Fragment>
            );
          })}
          {auth.user ? null : (
            <Link
              href={hrefSesion}
              aria-current={ariaCurrent(location, rutaSesion)}
              className="border-papel-borde font-anton text-tinta flex items-center justify-between border-b py-2.5 text-[42px] leading-none"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              Ingresar
              <span aria-hidden className="font-space text-violeta text-xs">
                →
              </span>
            </Link>
          )}
        </nav>
      ) : null}
    </>
  );
}
