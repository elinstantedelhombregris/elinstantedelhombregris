import { Link } from 'wouter';

import { CRONICA_COUNT, HREF_BITACORA, ULTIMAS_CRONICAS, fechaLarga, hrefCronica } from '../biblioteca-data';

/**
 * § 4 de la spec — la bitácora. Las últimas crónicas reales (`BLOG_POSTS`,
 * ya ordenado por `publishedAt` descendente), sin asterisco de demo: son
 * MDX reales, no datos de demostración (spec, «Muere el asterisco»). La
 * etiqueta de categoría no se pinta — el color del sistema significa tipo
 * de voz (§7), no tema de blog (spec, Decisión 12).
 */
export function BitacoraReciente() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <div className="border-tinta flex flex-wrap items-baseline justify-between gap-3 border-t-2 pb-2 pt-[22px]">
        <h2 className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.16em]">
          Bitácora · lo que va pasando
        </h2>
        <Link
          href={HREF_BITACORA}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          Ver la bitácora entera · {CRONICA_COUNT} crónicas →
        </Link>
      </div>

      {ULTIMAS_CRONICAS.length === 0 ? (
        <p className="text-tinta-50 mt-8 text-pretty text-[15px] leading-[1.6]">
          Todavía no hay crónicas. Cuando pase algo, se cuenta acá.
        </p>
      ) : (
        ULTIMAS_CRONICAS.map((post) => (
          <Link
            key={post.slug}
            href={hrefCronica(post.slug)}
            className="border-tinta hover:bg-papel-presionado block border-t px-2 py-6 transition-colors duration-150"
          >
            <span className="font-space text-tinta-50 mb-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.1em]">
              <span>{fechaLarga(post.publishedAt)}</span>
              {post.category !== '' ? (
                <span className="border-tinta text-tinta border px-2 py-0.5">{post.category}</span>
              ) : null}
            </span>
            <span className="text-tinta block text-xl font-bold leading-snug">{post.title}</span>
            {post.summary !== '' ? (
              <span className="text-tinta-75 mt-1 block max-w-[680px] text-pretty text-[15px] leading-[1.6]">
                {post.summary}
              </span>
            ) : null}
            <span className="font-space text-violeta mt-2 block text-xs font-bold uppercase tracking-[0.1em]">
              Leer la crónica →
            </span>
          </Link>
        ))
      )}
    </section>
  );
}
