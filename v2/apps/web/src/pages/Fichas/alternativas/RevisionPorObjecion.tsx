import { CampoDato } from '../cuaderno/CampoDato';

import type { RevisionAlternativa } from '@v2/shared';

import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useDeliberacion } from '~/lib/queries/deliberacion';

export function RevisionPorObjecion({
  fichaId,
  valor,
  cambiar,
}: {
  fichaId: string;
  valor: RevisionAlternativa;
  cambiar: (v: RevisionAlternativa) => void;
}) {
  const q = useDeliberacion(fichaId);
  const objeciones =
    q.data?.pages
      .flatMap((p) => p.argumentos)
      .filter((a) => a.tipo === 'objecion' && !a.retirado) ?? [];
  return (
    <fieldset className="mt-5 border p-4">
      <legend className="font-semibold">Revisión que conserva la propuesta anterior</legend>
      <p>
        La versión anterior queda intacta. Elegí qué objeción motivó el cambio y explicá cómo
        responde esta nueva propuesta, sin copiar datos personales.
      </p>
      {q.isPending ? <p role="status">Buscando objeciones…</p> : null}
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isError ? (
        <button
          type="button"
          className="min-h-11 underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar objeciones
        </button>
      ) : null}
      <CampoDato
        etiqueta="Objeción que motiva la revisión"
        valor={valor.objecionId}
        opciones={[
          ['', 'Elegí una objeción activa'],
          ...objeciones.map((a) => [a.id, (a.texto ?? '').slice(0, 150)] as const),
        ]}
        cambiar={(objecionId) => {
          cambiar({ ...valor, objecionId });
        }}
      />
      {q.hasNextPage ? (
        <button
          type="button"
          className="min-h-11 underline"
          disabled={q.isFetchingNextPage}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más objeciones
        </button>
      ) : null}
      {!q.isPending && !q.isError && !objeciones.length ? (
        <p className="mt-3">Primero registrá la objeción en la conversación de esta ficha.</p>
      ) : null}
      <CampoDato
        etiqueta="Qué cambia y cómo responde a la objeción"
        tipo="largo"
        valor={valor.motivo}
        cambiar={(motivo) => {
          cambiar({ ...valor, motivo });
        }}
      />
    </fieldset>
  );
}
