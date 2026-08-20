import { useState } from 'react';
import { Link } from 'wouter';

import {
  CICLOS,
  contar,
  ESTANTES,
  minutosDeCiclo,
  numeroDeFila,
  type Ciclo,
} from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

import type { EnsayoEntry } from '~/lib/ensayos-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';
import { saltarASeccion } from '~/lib/ir-al-principio';
import { leerSenalador } from '~/lib/senalador';
import { cn } from '~/lib/utils';

const ID_PANEL = 'panel-ciclo-abierto';
const ESTANTE = ESTANTES.find((e) => e.ancla === 'ensayos');

/** El ciclo que arranca abierto: el del señalador si existe, si no el primero. */
function cicloInicial(): string | null {
  const slug = leerSenalador();
  const delSenalador =
    slug !== null ? CICLOS.find((c) => c.ensayos.some((e) => e.slug === slug)) : undefined;
  return (delSenalador ?? CICLOS[0])?.serie ?? null;
}

/** jsdom no trae matchMedia/scrollIntoView; sin ellos, el pliegue alcanza. */
function deslizarHastaElIndice(): void {
  if (
    typeof window.matchMedia !== 'function' ||
    typeof Element.prototype.scrollIntoView !== 'function'
  ) {
    return;
  }
  requestAnimationFrame(() => {
    saltarASeccion(ID_PANEL);
  });
}

/**
 * § 3 de la spec madre, rehecho como estantería (spec 2026-08-20 §4): las
 * tapas de los ciclos en grilla de juntas + el índice de UN ciclo por vez —
 * el principio «una sola abierta por lista» de FilaIndiceExpandible, un
 * nivel arriba. Las filas internas conservan su apertura única. La
 * descripción del ciclo vive en la tapa; el panel repite solo el mojón.
 */
export function IndiceEnsayos() {
  const [cicloAbierto, setCicloAbierto] = useState<string | null>(() => cicloInicial());
  const [ensayoAbierto, setEnsayoAbierto] = useState<string | null>(null);

  const fila = (ensayo: EnsayoEntry, num: string) => {
    const esActa = ensayo.form === 'acta';
    const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    return (
      <FilaIndiceExpandible
        key={ensayo.slug}
        num={num}
        idPanel={`panel-${ensayo.slug}`}
        abierta={ensayoAbierto === ensayo.slug}
        onToggle={() => {
          setEnsayoAbierto(ensayoAbierto === ensayo.slug ? null : ensayo.slug);
        }}
        encabezado={
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`text-[17px] font-semibold leading-snug ${ensayoAbierto === ensayo.slug ? 'text-violeta' : 'text-tinta'}`}
            >
              {ensayo.title}
            </span>
            {esActa ? (
              <span className="font-space border-tinta-30 text-tinta-50 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
                acta
              </span>
            ) : null}
          </span>
        }
      >
        {ensayo.summary ? (
          <p className="text-tinta-90 mb-3 max-w-[640px] text-pretty text-base leading-[1.6]">
            «{ensayo.summary}»
          </p>
        ) : null}
        <Link
          href={`/ensayos/${ensayo.slug}`}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          {esActa ? 'Leer el acta completa' : 'Leer el ensayo completo'}
          {minutos} →
        </Link>
      </FilaIndiceExpandible>
    );
  };

  const tapa = (ciclo: Ciclo) => {
    const abierta = cicloAbierto === ciclo.serie;
    const minutos = minutosDeCiclo(ciclo);
    return (
      <button
        key={ciclo.serie}
        type="button"
        aria-expanded={abierta}
        aria-controls={ID_PANEL}
        onClick={() => {
          const abre = !abierta;
          setCicloAbierto(abre ? ciclo.serie : null);
          setEnsayoAbierto(null);
          if (abre) deslizarHastaElIndice();
        }}
        className={cn(
          'flex min-h-[188px] flex-col items-start gap-2 px-6 py-6 text-left transition-colors duration-150',
          abierta ? 'bg-papel-presionado' : 'bg-papel-crudo hover:bg-papel',
        )}
      >
        <span className="flex w-full items-baseline justify-between gap-3">
          <span
            aria-hidden
            className={cn(
              'font-anton text-[56px] leading-none',
              abierta ? 'text-violeta' : 'text-tinta',
            )}
          >
            {ciclo.romano}
          </span>
          <span
            aria-hidden
            className={cn('font-space text-lg', abierta ? 'text-violeta' : 'text-tinta-50')}
          >
            {abierta ? '−' : '+'}
          </span>
        </span>
        <span className="font-anton text-[22px] leading-tight">{ciclo.rotulo}</span>
        {ciclo.descripcion ? (
          <span className="text-tinta-75 text-pretty text-sm leading-[1.5]">
            {ciclo.descripcion}
          </span>
        ) : null}
        <span className="font-space text-tinta-50 mt-auto pt-2 text-[11px] uppercase tracking-[0.1em]">
          {contar(ciclo.ensayos.length, 'ensayo', 'ensayos')}
          {minutos > 0 ? ` · ${String(minutos)} min` : ''} · {ciclo.fecha}
        </span>
      </button>
    );
  };

  const abierto = CICLOS.find((c) => c.serie === cicloAbierto);

  return (
    <section
      id="ensayos"
      className="scroll-mt-32 anim-fadeup mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5"
    >
      <EncabezadoEstante num={ESTANTE?.num ?? '02'} nombre={ESTANTE?.nombre ?? 'Los ensayos'}>
        <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
          {contar(CICLOS.length, 'ciclo', 'ciclos')} · tocá una tapa
        </span>
      </EncabezadoEstante>

      <div className="border-tinta bg-tinta mt-6 grid grid-cols-2 gap-px border max-[560px]:grid-cols-1">
        {CICLOS.map(tapa)}
      </div>

      {abierto ? (
        <div
          id={ID_PANEL}
          role="region"
          aria-label={`Ciclo ${abierto.romano} — ${abierto.rotulo}`}
          className="anim-fadeup-rapido scroll-mt-32 mt-8"
        >
          <div className="border-tinta border-t-2 pb-2 pt-[22px]">
            <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
              Ciclo {abierto.romano} · {contar(abierto.ensayos.length, 'ensayo', 'ensayos')} ·{' '}
              {abierto.fecha}
            </p>
            <h3 className="font-anton riso-hover mb-1 text-[clamp(24px,3vw,34px)] leading-[1.1]">
              {abierto.rotulo}
            </h3>
          </div>
          {abierto.ensayos.map((ensayo, i) => fila(ensayo, numeroDeFila(i)))}
        </div>
      ) : null}
    </section>
  );
}
