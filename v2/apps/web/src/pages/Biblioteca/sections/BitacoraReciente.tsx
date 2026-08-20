import { Link } from 'wouter';

import {
  BITACORA_DESTACADA,
  BITACORA_RESTO,
  contar,
  CRONICA_COUNT,
  ESTANTES,
  fechaLarga,
  HREF_BITACORA,
  hrefCronica,
} from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

/**
 * § 4 de la spec madre + jerarquía nueva (spec 2026-08-20, Decisión 9): la
 * crónica más reciente conserva el tratamiento entero; las demás pasan a
 * fila slim. La etiqueta de categoría solo en la destacada — el color del
 * sistema significa tipo de voz (§7), no tema de blog (spec madre,
 * Decisión 12). Son MDX reales, sin asterisco de demo.
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'bitacora');

export function BitacoraReciente() {
  return (
    <section id="bitacora" className="scroll-mt-32 mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <EncabezadoEstante
        num={ESTANTE?.num ?? '05'}
        nombre={ESTANTE?.nombre ?? 'La bitácora'}
        verTodo={{
          href: HREF_BITACORA,
          label: `Ver la bitácora entera · ${contar(CRONICA_COUNT, 'crónica', 'crónicas')}`,
        }}
      />

      {BITACORA_DESTACADA === null ? (
        <p className="text-tinta-50 mt-8 text-pretty text-[15px] leading-[1.6]">
          Todavía no hay crónicas. Cuando pase algo, se cuenta acá.
        </p>
      ) : (
        <>
          <Link
            href={hrefCronica(BITACORA_DESTACADA.slug)}
            className="hover:bg-papel-presionado block px-2 py-6 transition-colors duration-150"
          >
            <span className="font-space text-tinta-50 mb-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.1em]">
              <span>{fechaLarga(BITACORA_DESTACADA.publishedAt)}</span>
              {BITACORA_DESTACADA.category !== '' ? (
                <span className="border-tinta text-tinta border px-2 py-0.5">
                  {BITACORA_DESTACADA.category}
                </span>
              ) : null}
            </span>
            <span className="text-tinta block text-xl font-bold leading-snug">
              {BITACORA_DESTACADA.title}
            </span>
            {BITACORA_DESTACADA.summary !== '' ? (
              <span className="text-tinta-75 mt-1 block max-w-[680px] text-pretty text-[15px] leading-[1.6]">
                {BITACORA_DESTACADA.summary}
              </span>
            ) : null}
            <span className="font-space text-violeta mt-2 block text-xs font-bold uppercase tracking-[0.1em]">
              Leer la crónica →
            </span>
          </Link>

          {BITACORA_RESTO.map((post) => (
            <Link
              key={post.slug}
              href={hrefCronica(post.slug)}
              className="border-papel-borde hover:bg-papel-presionado grid grid-cols-[150px_1fr_40px] items-baseline gap-5 border-t px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-1 max-[560px]:gap-1"
            >
              <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
                {fechaLarga(post.publishedAt)}
              </span>
              <span className="text-tinta text-[17px] font-semibold leading-snug">{post.title}</span>
              <span aria-hidden className="font-space text-violeta justify-self-end max-[560px]:hidden">
                →
              </span>
            </Link>
          ))}
        </>
      )}
    </section>
  );
}
