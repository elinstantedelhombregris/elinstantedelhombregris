import { UMBRAL_IMPULSO } from '@v2/shared';
import { useLocation } from 'wouter';

import { MOTIVOS } from './impulso';

import type { CampanaPublica } from '@v2/shared';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useCambiarEstadoPropuesta } from '~/lib/queries/campanas-propuestas';

/**
 * El borrador de una campaña propuesta, para quien la propuso: presentarla la hace pública y
 * empieza a juntar gente. Después lleva a su página.
 */
export function PresentarPropuesta({
  campana: c,
}: {
  campana: Pick<CampanaPublica, 'id' | 'slug' | 'revision'>;
}) {
  const op = useCambiarEstadoPropuesta();
  const [, navegar] = useLocation();
  return (
    <section
      aria-labelledby="presentar-campana"
      className="border-tinta bg-papel-crudo mt-9 max-w-[850px] border p-6"
    >
      <h2 id="presentar-campana" className="font-anton text-3xl">
        Presentá tu campaña
      </h2>
      <p className="mt-4 leading-relaxed">
        Está guardada como borrador: por ahora sólo la ves vos. Cuando la presentes, va a tener su
        página pública para que la compartas. Para abrirse, tiene que traer {UMBRAL_IMPULSO}{' '}
        personas nuevas a imaginar el país.
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
      <div className="mt-5">
        <BotonAccion
          ocupado={op.isPending}
          onClick={() => {
            op.mutate(
              { id: c.id, revision: c.revision, estado: 'reuniendo', motivo: MOTIVOS.presentar },
              {
                onSuccess: () => {
                  navegar(`/campanas/${c.slug}`);
                },
              },
            );
          }}
        >
          {op.isPending ? 'Presentando…' : 'Presentar mi campaña'}
        </BotonAccion>
      </div>
    </section>
  );
}
