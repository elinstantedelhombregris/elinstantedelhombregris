import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

import { avisoDeEstado } from '../aviso-estado';
import { enlaceParticiparCampana, esEdicionAnterior, esEjemploLocal } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

import { rotuloDeEstado } from '~/components/participacion/constantes';
import { EnlaceAccion } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';

/** El título, la pregunta, el único aviso de estado y la acción principal. */
export function CabeceraCampana({
  campana: c,
  esAdmin,
}: {
  campana: CampanaPublica;
  esAdmin: boolean;
}) {
  const historica = esEdicionAnterior(c);
  const aviso = avisoDeEstado(c, { esAdmin });
  const estado = rotuloDeEstado(c.estado);
  return (
    <header className="border-tinta border-b pb-9">
      <Link
        href="/campanas"
        className="text-tinta-75 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Todas las campañas
      </Link>
      <div className="font-space text-violeta mt-5 flex flex-wrap justify-between gap-3 text-[11px] uppercase tracking-[.12em]">
        <p>{esEjemploLocal(c) ? `Ejemplo local · ${estado}` : estado}</p>
        <p>Edición {c.revision}</p>
      </div>
      <h1 className="font-anton mt-5 max-w-[950px] text-[clamp(36px,5vw,64px)] leading-[1.08]">
        {c.contrato.titulo}
      </h1>
      <p className="font-space text-tinta-50 mt-9 text-[10px] uppercase tracking-[.14em]">
        La pregunta de esta campaña
      </p>
      <p className="mt-4 max-w-[850px] text-[clamp(23px,3vw,34px)] leading-[1.35]">
        {c.contrato.pregunta}
      </p>
      {aviso ? (
        <aside
          aria-label="Estado de la campaña"
          className="border-violeta bg-papel-crudo mt-7 max-w-[850px] border-l-4 p-5 leading-relaxed"
        >
          <strong>{aviso.titular}</strong>
          {aviso.detalle ? ` ${aviso.detalle}` : ''}
        </aside>
      ) : null}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        {c.estado === 'abierta' && !historica ? (
          <EnlaceAccion href={enlaceParticiparCampana(c)}>Sumar mi aporte</EnlaceAccion>
        ) : null}
        <Seguir tipo="campana" objeto={c.id} />
      </div>
      {historica ? (
        <p className="text-tinta-75 mt-5 text-sm leading-relaxed">
          Estás leyendo una edición anterior de esta campaña. Sus fuentes y reglas quedan en esa
          edición; no se trasladan a la vigente.{' '}
          <Link href={`/campanas/${c.slug}`} className="text-violeta underline underline-offset-4">
            Ver la edición vigente
          </Link>
          .
        </p>
      ) : null}
    </header>
  );
}
