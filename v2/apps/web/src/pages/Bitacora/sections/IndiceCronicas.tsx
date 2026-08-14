import { useState } from 'react';
import { Link } from 'wouter';

import { ANIOS, categoriaVisible, fechaLarga, numeroDeFila } from '../bitacora-data';

import type { BlogPost } from '~/lib/blog-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';

/**
 * El índice (spec 3.4) — las crónicas agrupadas por año, descendente.
 * Apertura única en toda la página (patrón exacto de `IndiceEnsayos`, 3.1).
 * Sin chips, sin búsqueda, sin paginación (Decisión 14).
 */
export function IndiceCronicas() {
  const [abierta, setAbierta] = useState<string | null>(null);

  const fila = (post: BlogPost, num: string) => {
    const minutos = post.readingMinutes > 0 ? ` · ${String(post.readingMinutes)} min` : '';
    return (
      <FilaIndiceExpandible
        key={post.slug}
        num={num}
        idPanel={`panel-${post.slug}`}
        abierta={abierta === post.slug}
        onToggle={() => {
          setAbierta(abierta === post.slug ? null : post.slug);
        }}
        encabezado={
          <span className="block">
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`text-[17px] font-semibold leading-snug ${abierta === post.slug ? 'text-violeta' : 'text-tinta'}`}
              >
                {post.title}
              </span>
              {post.type === 'vlog' ? (
                <span className="font-space border-tinta-30 text-tinta-50 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
                  vlog
                </span>
              ) : null}
            </span>
            <span className="font-space text-tinta-50 mt-1 block text-[11px] uppercase tracking-[0.1em]">
              {fechaLarga(post.publishedAt)}
              {post.category !== '' ? ` · ${categoriaVisible(post.category)}` : ''}
            </span>
          </span>
        }
      >
        {post.summary !== '' ? (
          <p className="text-tinta-90 mb-3 max-w-[640px] text-pretty text-base leading-[1.6]">
            «{post.summary}»
          </p>
        ) : null}
        <Link
          href={`/bitacora/${post.slug}`}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          Leer la crónica{minutos} →
        </Link>
      </FilaIndiceExpandible>
    );
  };

  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      {ANIOS.map((grupo) => (
        <div key={grupo.anio} className="mt-11 first:mt-0">
          <h2 className="font-space text-tinta-50 border-tinta border-t-2 pb-2 pt-[22px] text-[11px] uppercase tracking-[0.16em]">
            {grupo.anio} · {grupo.cronicas.length} crónica
            {grupo.cronicas.length === 1 ? '' : 's'}
          </h2>
          {grupo.cronicas.map((post, i) => fila(post, numeroDeFila(i)))}
        </div>
      ))}
    </section>
  );
}
