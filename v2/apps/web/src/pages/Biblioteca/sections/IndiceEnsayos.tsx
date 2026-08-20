import { useState } from 'react';
import { Link } from 'wouter';

import { CICLO_COUNT, CICLOS, numeroDeFila, type Ciclo } from '../biblioteca-data';

import type { EnsayoEntry } from '~/lib/ensayos-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';

/** § 3 de la spec — los {C} ciclos. Apertura única en toda la página. */
export function IndiceEnsayos() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const fila = (ensayo: EnsayoEntry, num: string) => {
    const esActa = ensayo.form === 'acta';
    const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    return (
      <FilaIndiceExpandible
        key={ensayo.slug}
        num={num}
        idPanel={`panel-${ensayo.slug}`}
        abierta={abierto === ensayo.slug}
        onToggle={() => {
          setAbierto(abierto === ensayo.slug ? null : ensayo.slug);
        }}
        encabezado={
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`text-[17px] font-semibold leading-snug ${abierto === ensayo.slug ? 'text-violeta' : 'text-tinta'}`}
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

  const bloque = (ciclo: Ciclo) => (
    <div key={ciclo.serie} className="mt-11 first:mt-0">
      <div className="border-tinta border-t-2 pb-2 pt-[22px]">
        <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
          Ciclo {ciclo.romano} · {ciclo.ensayos.length} ensayos · {ciclo.fecha}
        </p>
        <h3 className="font-anton riso-hover mb-1 text-[clamp(24px,3vw,34px)] leading-[1.1]">
          {ciclo.rotulo}
        </h3>
        {ciclo.descripcion ? (
          <p className="text-tinta-50 max-w-[640px] text-pretty text-sm leading-[1.6]">
            {ciclo.descripcion}
          </p>
        ) : null}
      </div>
      {ciclo.ensayos.map((ensayo, i) => fila(ensayo, numeroDeFila(i)))}
    </div>
  );

  return (
    <section id="ensayos" className="scroll-mt-32 anim-fadeup mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-tinta-50 mb-5 text-[11px] uppercase tracking-[0.16em]">
        Ensayos · {CICLO_COUNT} ciclos · tocá para abrir
      </h2>
      {CICLOS.map(bloque)}
    </section>
  );
}
