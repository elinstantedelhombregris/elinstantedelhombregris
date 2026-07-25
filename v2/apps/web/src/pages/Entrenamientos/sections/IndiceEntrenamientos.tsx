import { useState } from 'react';
import { Link } from 'wouter';

import { GRUPOS, duracionLarga, numeroDeFila, rotuloNivel, type Grupo } from '../entrenamientos-data';

import type { CursoEntry } from '~/lib/courses-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';

/**
 * § 2 de la spec — los {N} entrenamientos, agrupados por `category` real.
 * Gemelo de `IndiceEnsayos` (3.1): apertura única en toda la página, misma
 * receta de fila y de bloque de grupo. Sin filtros, sin chips, sin búsqueda.
 */
export function IndiceEntrenamientos() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const fila = (curso: CursoEntry, num: string) => (
    <FilaIndiceExpandible
      key={curso.slug}
      num={num}
      idPanel={`panel-${curso.slug}`}
      abierta={abierto === curso.slug}
      onToggle={() => {
        setAbierto(abierto === curso.slug ? null : curso.slug);
      }}
      encabezado={
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`text-[17px] font-semibold leading-snug ${abierto === curso.slug ? 'text-violeta' : 'text-tinta'}`}
          >
            {curso.title}
          </span>
          <span className="font-space border-tinta-30 text-tinta-50 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
            {rotuloNivel(curso.level)}
          </span>
        </span>
      }
    >
      <p className="text-tinta-90 mb-3 max-w-[640px] text-pretty text-base leading-[1.6]">
        «{curso.excerpt}»
      </p>
      <Link
        href={`/entrenamientos/${curso.slug}`}
        className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
      >
        Abrir el entrenamiento · {curso.lecciones.length} lecciones · {duracionLarga(curso.duration)}{' '}
        →
      </Link>
    </FilaIndiceExpandible>
  );

  const bloque = (grupo: Grupo) => (
    <div key={grupo.categoria} className="mt-11 first:mt-0">
      <div className="border-tinta border-t-2 pb-2 pt-[22px]">
        <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
          {grupo.cursos.length} entrenamientos · {grupo.lecciones} lecciones
        </p>
        <h3 className="font-anton riso-hover mb-1 text-[clamp(24px,3vw,34px)] leading-[1.1]">
          {grupo.rotulo}
        </h3>
      </div>
      {grupo.cursos.map((curso, i) => fila(curso, numeroDeFila(i)))}
    </div>
  );

  return (
    <section className="anim-fadeup mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-tinta-50 mb-5 text-[11px] uppercase tracking-[0.16em]">
        El catálogo entero · tocá para abrir
      </h2>
      {GRUPOS.map(bloque)}
    </section>
  );
}
