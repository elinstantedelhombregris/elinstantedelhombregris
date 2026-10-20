import { Link } from 'wouter';

import { BarraImpulso } from '../Campanas/BarraImpulso';
import { juntaGente, motivoDeDevolucion } from '../Campanas/impulso';

import type { CampanaDeLista } from '~/lib/queries/campanas-propuestas';

import { ENLACE_DE_TEXTO, rotuloDeEstado } from '~/components/participacion/constantes';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import {
  PROPONER_HREF,
  useDatosDePropuesta,
  useTusCampanas,
} from '~/lib/queries/campanas-propuestas';

/**
 * «Tus campañas»: las que propusiste o coordinás, con su estado, la barra mientras juntan gente
 * y el motivo si la coordinación te devolvió una (§11). Sin campañas no ocupa lugar.
 */
export function TusCampanas() {
  const q = useTusCampanas();
  const lista = q.data ?? [];
  if (q.error) return <ErrorOperacion mensaje={q.error.message} />;
  if (!lista.length) return null;
  const hayUnaQueJunta = lista.some((c) => juntaGente(c.estado));
  return (
    <section aria-labelledby="titulo-tus-campanas" className="mt-10 border-t pt-6">
      <h3 id="titulo-tus-campanas" className="font-anton text-3xl">
        Tus campañas
      </h3>
      <ul className="mt-5 divide-y">
        {lista.map((c) => (
          <FilaTuCampana key={c.id} campana={c} />
        ))}
      </ul>
      {hayUnaQueJunta ? null : (
        <Link className={`${ENLACE_DE_TEXTO} mt-4`} href={PROPONER_HREF}>
          Proponer una campaña
        </Link>
      )}
    </section>
  );
}

function FilaTuCampana({ campana: c }: { campana: CampanaDeLista }) {
  const { impulso, historial } = useDatosDePropuesta(c);
  const motivo = motivoDeDevolucion({ estado: c.estado, historial });
  return (
    <li className="py-4">
      <Link className="text-violeta underline" href={`/campanas/${c.slug}`}>
        {c.contrato.titulo}
      </Link>
      <p className="font-space text-tinta-50 mt-2 text-xs uppercase tracking-[.12em]">
        {rotuloDeEstado(c.estado)}
      </p>
      {juntaGente(c.estado) && impulso ? (
        <BarraImpulso impulso={impulso} className="mt-3 text-sm" />
      ) : null}
      {motivo ? (
        <p className="border-sello mt-3 border-l-2 pl-3 text-sm leading-relaxed">
          <strong>La coordinación te la devolvió:</strong> {motivo}
        </p>
      ) : null}
      {c.estado === 'borrador' ? (
        <p className="text-tinta-75 mt-2 text-sm">Está en preparación: todavía no es pública.</p>
      ) : null}
    </li>
  );
}
