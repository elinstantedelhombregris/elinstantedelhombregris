import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'wouter';

import { AmbitosCampana } from './AmbitosCampana';
import { enlaceParticiparCampana, esEjemploLocal, fechaCampana } from './presentacion';

import type { CampanaCatalogo } from './filtrar-catalogo';

import { FASES_ROTULO } from '~/components/participacion/constantes';

export function TarjetaCampana({
  campana: c,
  destacada = false,
  numero,
}: {
  campana: CampanaCatalogo;
  destacada?: boolean;
  numero: number;
}) {
  const ejemplo = esEjemploLocal(c);
  const abierta = c.estado === 'abierta';
  return (
    <article
      className={`border-tinta relative flex min-w-0 flex-col border ${destacada ? 'bg-papel-crudo px-6 py-8 sm:px-9 sm:py-10' : 'bg-papel p-6'}`}
    >
      <div className="border-tinta/25 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <p
          className={`font-space text-[10px] uppercase tracking-[.12em] ${abierta ? 'text-violeta' : 'text-tinta-50'}`}
        >
          {ejemplo ? 'Ejemplo local · sin convocatoria' : FASES_ROTULO[c.estado]}
        </p>
        <span className="font-space text-tinta-50 text-[10px]">
          {String(numero).padStart(2, '0')} / ED. {c.revision}
        </span>
      </div>
      <div className={destacada ? 'mt-7 grid gap-8 lg:grid-cols-[1fr_270px]' : 'mt-6'}>
        <div>
          <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.14em]">
            Una pregunta para imaginar juntos
          </p>
          <h2
            className={`font-anton mt-4 leading-[1.08] ${destacada ? 'max-w-[750px] text-[clamp(30px,4vw,52px)]' : 'text-3xl'}`}
          >
            <Link
              href={`/campanas/${c.slug}`}
              className="hover:text-violeta focus-visible:underline"
            >
              {c.contrato.titulo}
            </Link>
          </h2>
          <p
            className={`mt-5 max-w-[720px] leading-relaxed ${destacada ? 'text-xl' : 'text-base'}`}
          >
            {c.contrato.pregunta}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.contrato.temas.map((t) => (
              <span key={t} className="border-tinta/25 border px-3 py-1 text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div
          className={`${destacada ? 'border-tinta/25 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0' : 'border-tinta/25 mt-6 border-t pt-5'} text-sm`}
        >
          <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.12em]">
            Dónde se abre la pregunta
          </p>
          <div className="mt-3">
            <AmbitosCampana ids={c.contrato.territorios} />
          </div>
          <p className="font-space text-tinta-50 mt-6 text-[10px] uppercase tracking-[.12em]">
            Qué vuelve a quienes participan
          </p>
          <p className="mt-3 leading-relaxed">{c.contrato.devolucion}</p>
          <p className="text-tinta-75 mt-4 flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {ejemplo ? 'Fecha ilustrativa: ' : 'Devolución: '}
            {fechaCampana(c.contrato.fechaDevolucion)}
          </p>
        </div>
      </div>
      <div className="border-tinta/25 mt-7 flex flex-wrap items-center gap-5 border-t pt-5">
        <Link
          href={abierta ? enlaceParticiparCampana(c) : `/campanas/${c.slug}`}
          className="font-space bg-violeta text-papel inline-flex min-h-11 items-center justify-between gap-5 px-5 py-3 text-xs uppercase tracking-wide"
        >
          {abierta ? 'Sumar mi mirada' : ejemplo ? 'Explorar el ejemplo' : 'Conocer el proceso'}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        {abierta ? (
          <Link href={`/campanas/${c.slug}`} className="text-sm underline underline-offset-4">
            Leer la convocatoria
          </Link>
        ) : null}
        {ejemplo ? (
          <p className="text-tinta-50 max-w-[420px] text-xs leading-relaxed">
            Para conocer cómo sería una campaña. Está en pausa; no tiene equipo operativo ni recibe
            aportes.
          </p>
        ) : null}
      </div>
    </article>
  );
}
