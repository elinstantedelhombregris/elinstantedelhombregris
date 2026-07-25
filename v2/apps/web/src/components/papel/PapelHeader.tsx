import { Fragment, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { MenuBiblioteca } from './MenuBiblioteca';
import {
  BIBLIOTECA_HREF,
  DEMO_VOCES_COUNT,
  PAPEL_NAV,
  PAPEL_NAV_ALL,
  SECCIONES_BIBLIOTECA,
  SEMBRAR_HREF,
} from './papel-nav';

import { despertar } from '~/lib/despertar';
import { saltarSiEsLaMismaPagina } from '~/lib/ir-al-principio';
import { useVocesCount } from '~/lib/queries/analytics';
import { cn } from '~/lib/utils';

function esActiva(location: string, href: string): boolean {
  if (href === '/') return location === '/';
  return location === href || location.startsWith(`${href}/`);
}

/**
 * Header papel: wordmark con signos en violeta, contador FOMO, nav mono
 * y CTA «Sembrar tu voz». Colapsa a menú de pantalla completa ≤1140px.
 */
export function PapelHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const vocesQuery = useVocesCount();
  // Mientras carga o si falla, caemos al valor de demostración: nunca
  // mostramos un contador en blanco ni un error en el header.
  const vocesLabel = vocesQuery.data
    ? vocesQuery.data.total.toLocaleString('es-AR')
    : DEMO_VOCES_COUNT;

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
            <span className="font-space text-tinta-50 hidden text-[10px] uppercase tracking-[0.14em] min-[561px]:inline">
              {vocesLabel} voces · falta la tuya
            </span>
          </Link>

          <nav className="hidden items-center gap-1.5 min-[1141px]:flex" aria-label="Recorrido">
            {PAPEL_NAV.map((item) =>
              // La biblioteca es la única entrada con estantes propios: se
              // despliegan en vez de obligar a pasar por el hub.
              item.href === BIBLIOTECA_HREF ? (
                <MenuBiblioteca
                  key={item.href}
                  item={item}
                  activa={esActiva(location, item.href)}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'font-space hover:text-tinta border-b-2 px-3.5 py-2 text-xs uppercase tracking-[0.06em] transition-colors',
                    esActiva(location, item.href)
                      ? 'border-violeta text-tinta'
                      : 'text-tinta-50 border-transparent',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href={SEMBRAR_HREF}
              className="bg-tinta font-space text-papel hover:bg-violeta ml-3.5 px-5 py-[11px] text-xs font-bold uppercase tracking-[0.08em] transition-colors"
              onClick={despertar}
            >
              Sembrar tu voz
            </Link>
          </nav>

          <button
            type="button"
            aria-expanded={menuOpen}
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
          aria-label="Recorrido completo"
          className="bg-papel fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col gap-1 overflow-y-auto px-6 py-8"
        >
          {PAPEL_NAV_ALL.map((item) => (
            <Fragment key={item.href}>
              <Link
                href={item.href}
                className="border-papel-borde font-anton text-tinta flex items-center justify-between border-b py-2.5 text-[42px] leading-none"
                onClick={() => {
                  // En móvil, «Sembrar» es el mismo trigger canónico del despertar §10.7.
                  if (item.href === SEMBRAR_HREF) despertar();
                  setMenuOpen(false);
                }}
              >
                {item.label}
                <span className="font-space text-violeta text-xs">{item.num}</span>
              </Link>
              {/* Los estantes de la biblioteca también se abren acá: el menú
                  chico no puede ofrecer menos caminos que el grande. */}
              {item.href === BIBLIOTECA_HREF
                ? SECCIONES_BIBLIOTECA.map((seccion) => (
                    <Link
                      key={seccion.href}
                      href={seccion.href}
                      className="border-papel-borde font-space text-tinta-75 flex min-h-11 items-center justify-between border-b pl-5 text-xs uppercase tracking-[0.06em]"
                      onClick={(evento) => {
                        if (saltarSiEsLaMismaPagina(seccion.href, location)) evento.preventDefault();
                        setMenuOpen(false);
                      }}
                    >
                      {seccion.label}
                      <span className="font-space text-tinta-30 text-[10px]">{seccion.num}</span>
                    </Link>
                  ))
                : null}
            </Fragment>
          ))}
        </nav>
      ) : null}
    </>
  );
}
