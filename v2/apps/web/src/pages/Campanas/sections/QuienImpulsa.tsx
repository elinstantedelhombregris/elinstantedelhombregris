import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { Compartir } from '../../MiArgentinaIdeal/comun/Compartir';
import {
  MOTIVOS,
  contenidoParaCompartir,
  lineaDeLugares,
  motivoDeDevolucion,
  textoDeLoQueFalta,
  type Impulso,
} from '../impulso';

import type { LugarMapa } from '../../ElMapa/instrumento/BusquedaTerritorial';
import type { CampanaPublica } from '@v2/shared';

import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useCambiarEstadoPropuesta } from '~/lib/queries/campanas-propuestas';

/** El lugar de la campaña en una línea, para el pie de la imagen. */
function useLineaDeLugares(ids: readonly number[]) {
  const visibles = [...new Set(ids)].slice(0, 2);
  const lugares = useQueries({
    queries: visibles.map((id) => ({
      queryKey: ['geo', 'lugar', id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        api.get<LugarMapa>(`/api/v1/geo/lugares/${String(id)}`, { signal }),
      staleTime: 300_000,
    })),
  });
  const nombres = lugares.flatMap((l) => (l.data?.name ? [l.data.name] : []));
  return lineaDeLugares(nombres, new Set(ids).size);
}

/**
 * Lo que ve quien impulsa la campaña en su página: cuánto le falta, cómo compartirla y cómo
 * retirarla para corregirla. En revisión, sólo qué está pasando.
 */
export function QuienImpulsa({
  campana: c,
  impulso,
}: {
  campana: CampanaPublica;
  impulso: Impulso | null;
}) {
  const lugar = useLineaDeLugares(c.contrato.territorios);
  const contenido = useMemo(
    () => contenidoParaCompartir(c.contrato.pregunta, lugar),
    [c.contrato.pregunta, lugar],
  );
  const motivo = motivoDeDevolucion(c);
  if (c.estado === 'por_revisar')
    return (
      <p className="mt-8 max-w-[640px] leading-relaxed">
        Tu campaña llegó a revisión. La coordinación de ¡BASTA! revisa que sus reglas se cumplan y
        te avisa en Mi espacio cuando la abra o si te la devuelve con un motivo.
      </p>
    );
  return (
    <section
      aria-labelledby="tu-campana"
      className="border-tinta bg-papel-crudo mt-8 max-w-[850px] border p-6"
    >
      <h2 id="tu-campana" className="font-anton text-3xl">
        Tu campaña
      </h2>
      {impulso ? <p className="mt-3 leading-relaxed">{textoDeLoQueFalta(impulso)}</p> : null}
      {motivo ? (
        <Nota>
          <strong>La coordinación te la devolvió con este motivo:</strong> {motivo}
        </Nota>
      ) : null}
      <p className="text-tinta-75 mt-3 text-sm leading-relaxed">
        Cuenta cada persona que llega desde esta página, toca «Sumate» y participa por primera vez
        en Mi Argentina ideal.
      </p>
      <div className="mt-6 max-w-[320px]">
        <Compartir
          contenido={contenido}
          enlace={`/campanas/${c.slug}`}
          texto={`${c.contrato.pregunta} ¿Te sumás? Contá tu Argentina ideal y ayudala a abrir.`}
          rotulo="Compartí esta campaña"
          nombreDeArchivo={`campana-${c.slug}.png`}
        />
      </div>
      <Retirar campana={c} />
    </section>
  );
}

/** Retirarla para corregir: vuelve a borrador. Pide una confirmación antes. */
function Retirar({ campana: c }: { campana: CampanaPublica }) {
  const [confirmando, setConfirmando] = useState(false);
  const op = useCambiarEstadoPropuesta();
  return (
    <div className="border-tinta/25 mt-8 border-t pt-6">
      {confirmando ? (
        <>
          <p className="leading-relaxed">
            Mientras la corregís no suma personas nuevas. Las que ya trajo siguen contando cuando la
            vuelvas a presentar.
          </p>
          <ErrorOperacion mensaje={op.error?.message} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BotonAccion
              tono="sello"
              ocupado={op.isPending}
              onClick={() => {
                op.mutate({
                  id: c.id,
                  revision: c.revision,
                  estado: 'borrador',
                  motivo: MOTIVOS.retirar,
                });
              }}
            >
              Sí, retirarla
            </BotonAccion>
            <BotonAccion
              tono="papel"
              onClick={() => {
                setConfirmando(false);
              }}
            >
              No, dejarla
            </BotonAccion>
          </div>
        </>
      ) : (
        <BotonAccion
          tono="papel"
          onClick={() => {
            setConfirmando(true);
          }}
        >
          Retirarla para corregir
        </BotonAccion>
      )}
    </div>
  );
}
