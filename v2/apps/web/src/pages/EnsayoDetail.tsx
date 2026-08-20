import { useEffect } from 'react';
import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import { findEnsayoBySlug } from '~/lib/ensayos-registry';
import { guardarSenalador } from '~/lib/senalador';
import { fechaLarga, ubicarEnsayo, type Vecino } from '~/pages/Biblioteca/biblioteca-data';

/** 404 §5: el expediente extraviado, sobre papel (el lector es editorial). */
function EnsayoExtraviado() {
  return (
    <main className="mx-auto max-w-md px-10 py-24 text-center max-[560px]:px-5">
      <Kicker className="mb-4">expediente extraviado</Kicker>
      <h1 className="font-anton mb-6 text-4xl leading-none">Ese ensayo no está.</h1>
      <div className="mb-8">
        <Sello color="rojo">Extraviado</Sello>
      </div>
      <BotonPapel asChild variant="tinta">
        <Link href="/biblioteca">Volver a la biblioteca →</Link>
      </BotonPapel>
    </main>
  );
}

/** Un eslabón de la cadena del ciclo; avisa cuando el vecino cambia de ciclo. */
function Eslabon({ vecino, lado }: { vecino: Vecino; lado: 'anterior' | 'siguiente' }) {
  const siguiente = lado === 'siguiente';
  return (
    <Link
      href={`/ensayos/${vecino.ensayo.slug}`}
      className={`font-space max-w-[300px] text-xs uppercase tracking-[0.06em] ${
        siguiente ? 'text-tinta ml-auto text-right font-bold hover:text-violeta' : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      {vecino.cruzaCiclo ? (
        <span className="text-tinta-30 block text-[10px] tracking-[0.1em]">
          Ciclo {vecino.ciclo.romano} — {vecino.ciclo.rotulo}
        </span>
      ) : null}
      {siguiente ? `${vecino.ensayo.title} →` : `← ${vecino.ensayo.title}`}
    </Link>
  );
}

/**
 * Lector de ensayo — página 3.2 «Papel y Tinta»
 * (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md). Lector editorial
 * sobre papel claro: el cuerpo MDX se renderiza VERBATIM (texto keystone) y
 * la edición impresa reusa el patrón de 2.4 tal cual. No hay sello al
 * terminar: leer no es un acto verificable (spec, Decisión 2).
 */
export function EnsayoDetail() {
  const [match, params] = useRoute<{ slug: string }>('/ensayos/:slug');
  const ensayo = match ? findEnsayoBySlug(params.slug) : undefined;

  // El señalador (spec 2026-08-20 §5): el hub retoma desde el último ensayo
  // abierto. Se guarda el slug crudo; el que lee valida contra el registry.
  // El efecto corre antes de los early-returns para no romper las reglas de
  // hooks; con slug inexistente no toca nada.
  const slugAbierto = ensayo?.slug;
  useEffect(() => {
    if (slugAbierto !== undefined) guardarSenalador(slugAbierto);
  }, [slugAbierto]);

  if (!match) return null;
  const ubicacion = ensayo ? ubicarEnsayo(ensayo.slug) : null;
  if (!ensayo || !ubicacion) return <EnsayoExtraviado />;

  const forma = ensayo.form === 'acta' ? 'acta' : 'ensayo';
  const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';

  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>

      <article className="edicion-impresa">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
        <Kicker className="mb-4 mt-10">
          Ciclo {ubicacion.ciclo.romano} — {ubicacion.ciclo.rotulo} · {forma} {ubicacion.posicion} de{' '}
          {ubicacion.total}
          {minutos}
        </Kicker>
        <h1
          aria-label={ensayo.title}
          className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
        >
          <RitoTinta lineas={[ensayo.title]} />
        </h1>
        {ensayo.subtitle ? (
          <p className="text-tinta-75 mb-7 max-w-[620px] text-pretty text-lg leading-[1.6]">
            {ensayo.subtitle}
          </p>
        ) : null}
        <div className="border-tinta border-t-2 pt-7">
          <MdxPapel raw={ensayo.body} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </div>
        <p className="font-space text-tinta-50 mt-9 text-xs">— El hombre gris</p>
      </article>

      <nav className="border-tinta mt-11 flex flex-wrap justify-between gap-5 border-t pt-[22px] print:hidden">
        {ubicacion.anterior ? <Eslabon vecino={ubicacion.anterior} lado="anterior" /> : null}
        {ubicacion.siguiente ? <Eslabon vecino={ubicacion.siguiente} lado="siguiente" /> : null}
      </nav>

      <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
        <span className="font-anton text-[22px] leading-tight">¿Te resonó? No lo dejes en lectura.</span>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Decir la mía →</Link>
        </BotonPapel>
      </div>
    </main>
  );
}

export default EnsayoDetail;
