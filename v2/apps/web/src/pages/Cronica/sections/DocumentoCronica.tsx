import { CAPITULO_COUNT, fechaLarga, idCapitulo } from '../cronica-data';

import { SumarioCronica } from './SumarioCronica';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';

/**
 * El documento (spec 3.6). Los 5 cuerpos se renderizan VERBATIM — cada
 * capítulo ya es un archivo separado (a diferencia del manifiesto, acá no
 * hace falta parsear un único MDX en partes). Un solo H1 con rito de la
 * tinta para toda la página; cada capítulo es un H2 sin rito propio. Sin
 * sello al terminar (spec, Decisión 2) — no hay `IntersectionObserver` acá.
 */
export function DocumentoCronica() {
  if (CAPITULO_COUNT === 0) {
    return (
      <article className="edicion-impresa">
        <Cabecera />
        <p className="text-tinta-75 mt-10 max-w-[560px] text-pretty text-base leading-[1.6]">
          Todavía no hay crónica. Cuando el país la escriba, se cuenta acá.
        </p>
      </article>
    );
  }

  return (
    <article className="edicion-impresa">
      <Cabecera />
      <SumarioCronica />

      {CRONICA_CHAPTERS.map((capitulo) => (
        <section
          key={capitulo.slug}
          id={idCapitulo(capitulo)}
          className="border-tinta mt-14 scroll-mt-20 border-t-2 pt-[22px]"
        >
          <Kicker color="tinta" className="mb-3">
            Capítulo {capitulo.orderIndex} de {CAPITULO_COUNT} · {capitulo.subtitle}
          </Kicker>
          <h2 className="font-anton riso-hover mb-4 text-pretty text-[clamp(26px,3.4vw,40px)] leading-[1.05]">
            {capitulo.title}
          </h2>
          <blockquote className="border-violeta text-tinta-75 mb-6 max-w-[560px] border-l-2 pl-5 text-lg italic leading-[1.6]">
            {capitulo.epigraph}
          </blockquote>
          <MdxPapel raw={capitulo.body} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </section>
      ))}

      <p className="font-space text-tinta-50 mt-9 text-xs">— El hombre gris</p>
    </article>
  );
}

/** Folio + kicker + H1 + lead — comunes a los dos ramales (vacío y con contenido). */
function Cabecera() {
  return (
    <>
      <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
        ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
      </p>
      <Kicker className="mb-4 mt-10">La crónica del país que viene · ficción especulativa</Kicker>
      <h1
        aria-label="La crónica del país que viene."
        className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
      >
        <RitoTinta lineas={['La crónica', 'del país que viene.']} />
      </h1>
      <p className="text-tinta-75 max-w-[640px] text-pretty text-lg leading-[1.6]">
        {CAPITULO_COUNT} capítulos que imaginan, desde el futuro, qué pasaría si esto se
        usara en serio. No es una predicción. Es un ejercicio para ver que otro camino es
        posible.
      </p>
    </>
  );
}
