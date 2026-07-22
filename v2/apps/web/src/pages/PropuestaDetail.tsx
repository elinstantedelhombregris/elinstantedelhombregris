import { Link, useRoute } from 'wouter';

import { ESTADO_PROPUESTA } from './ElMandatoVivo/el-mandato-data';
import { CargandoFicha, FichaExtraviada, FichaRota, MarcoAnexo } from './ElMandatoVivo/sections/MarcoAnexo';

import { BotonPapel } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { usePropuestaById, useVotePropuesta } from '~/lib/queries/mandato';

/**
 * Anexo propuesta (spec 2.3, «Los anexos») — ficha del expediente de una
 * propuesta en votación. Vive dentro de `MarcoAnexo`; la votación (auth) se
 * conserva, el chrome viejo del v1-port muere acá.
 */
export function PropuestaDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/propuesta/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError, error, refetch } = usePropuestaById(id);
  const vote = useVotePropuesta(id);
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <MarcoAnexo>
        <CargandoFicha />
      </MarcoAnexo>
    );
  }

  // Tres estados distintos (§10.9): extraviado (404) no es lo mismo que roto.
  if (isError && !(error instanceof ApiError && error.status === 404)) {
    return (
      <MarcoAnexo>
        <FichaRota
          onReintentar={() => {
            void refetch();
          }}
        />
      </MarcoAnexo>
    );
  }

  if (!data) {
    return (
      <MarcoAnexo>
        <FichaExtraviada titulo="Esa propuesta no está." />
      </MarcoAnexo>
    );
  }

  const propuesta = data.proposal;
  const estado = ESTADO_PROPUESTA[propuesta.status] ?? propuesta.status;
  const apoyo = `${propuesta.voteScore >= 0 ? '+' : ''}${propuesta.voteScore.toLocaleString('es-AR')}`;
  const parrafos = (propuesta.bodyMarkdown ?? '').split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <MarcoAnexo>
      <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
        Propuesta N° {propuesta.id} · {estado}
      </p>
      <h1 className="font-anton mt-3 text-[30px] leading-tight">{propuesta.title}</h1>
      <p className="text-tinta-75 mt-3 text-[17px] leading-relaxed">{propuesta.summary}</p>
      {parrafos.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {parrafos.map((parrafo, i) => (
            <p key={`${String(i)}-${parrafo.slice(0, 12)}`} className="text-[15px] leading-relaxed">
              {parrafo}
            </p>
          ))}
        </div>
      ) : null}

      <div className="border-tinta mt-8 border-t pt-6">
        <p className="font-space text-violeta text-[13px]">
          {propuesta.voteCount.toLocaleString('es-AR')} votos · apoyo {apoyo}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {/* El botón en vuelo muestra su estado cargando (— ▌); el otro se
              deshabilita mientras dura el POST. Estados honestos y distintos. */}
          <BotonPapel
            variant="fantasma"
            loading={vote.isPending && vote.variables === 1}
            disabled={!isAuthenticated || (vote.isPending && vote.variables !== 1)}
            onClick={() => {
              vote.mutate(1);
            }}
          >
            A favor +1
          </BotonPapel>
          <BotonPapel
            variant="fantasma"
            loading={vote.isPending && vote.variables === -1}
            disabled={!isAuthenticated || (vote.isPending && vote.variables !== -1)}
            onClick={() => {
              vote.mutate(-1);
            }}
          >
            En contra −1
          </BotonPapel>
        </div>
        {vote.isError ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            No pudimos registrar tu voto. Probá de nuevo.
          </p>
        ) : null}
        {!isAuthenticated ? (
          <p className="text-tinta-50 mt-4 text-[14px] leading-relaxed">
            Para votar hace falta{' '}
            <Link href="/ingresar" className="text-tinta font-semibold underline">
              entrar
            </Link>
            . Sin cuenta se lee todo; con cuenta también se vota.
          </p>
        ) : null}
      </div>
    </MarcoAnexo>
  );
}

export default PropuestaDetail;
