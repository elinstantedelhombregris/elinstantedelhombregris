import { UMBRAL_IMPULSO } from '@v2/shared';
import { useLocation } from 'wouter';

import { BarraImpulso } from '../BarraImpulso';

import { QuienImpulsa } from './QuienImpulsa';

import type { CampanaPublica } from '@v2/shared';

import { BotonAccion } from '~/components/participacion/Elementos';
import { IMAGINAR_HREF, useMarcarLlegada } from '~/lib/queries/campanas-propuestas';

const DT = 'font-space text-violeta text-[10px] uppercase tracking-[.12em]';

/**
 * Lo primero de una campaña que junta gente o espera revisión (§11): quién la impulsa, para qué,
 * cuánto le falta y la acción principal. Quien la impulsa ve, en lugar de «Sumate», cómo
 * compartirla.
 */
export function JuntarGente({ campana: c }: { campana: CampanaPublica }) {
  // En revisión la barra va completa aunque el servidor no mande el conteo.
  const impulso =
    c.impulso ??
    (c.estado === 'por_revisar' ? { personas: UMBRAL_IMPULSO, umbral: UMBRAL_IMPULSO } : null);
  return (
    <section aria-label="Para que la campaña abra" className="border-tinta border-b py-9">
      <dl className="grid max-w-[850px] gap-6">
        <div>
          <dt className={DT}>La impulsa</dt>
          <dd className="mt-3 text-lg leading-relaxed">{c.contrato.responsable}</dd>
        </div>
        <div>
          <dt className={DT}>Para qué</dt>
          <dd className="mt-3 whitespace-pre-wrap leading-relaxed">{c.contrato.proposito}</dd>
        </div>
      </dl>
      {impulso ? <BarraImpulso impulso={impulso} className="mt-8" /> : null}
      {c.impulsadaPorMi ? (
        <QuienImpulsa campana={c} impulso={impulso} />
      ) : c.estado === 'reuniendo' ? (
        <Sumate slug={c.slug} />
      ) : null}
    </section>
  );
}

/** «Sumate»: marca la llegada y lleva a imaginar. Si la marca falla, igual lleva. */
function Sumate({ slug }: { slug: string }) {
  const [, navegar] = useLocation();
  const llegada = useMarcarLlegada();
  return (
    <div className="mt-8">
      <BotonAccion
        ocupado={llegada.isPending}
        onClick={() => {
          llegada.mutate(slug, {
            onSettled: () => {
              navegar(IMAGINAR_HREF);
            },
          });
        }}
      >
        Sumate: contá tu Argentina ideal
      </BotonAccion>
      <p className="text-tinta-75 mt-3 max-w-[560px] text-sm leading-relaxed">
        Si es tu primera vez en Mi Argentina ideal, al participar contás para que esta campaña abra.
        Y lo que imagines suma a la visión de todos.
      </p>
    </div>
  );
}
