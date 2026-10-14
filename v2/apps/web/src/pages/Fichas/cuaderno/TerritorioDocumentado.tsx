import { Link } from 'wouter';

import { useLugar } from '../consultas';

export function TerritorioDocumentado({ id }: { id: number }) {
  const q = useLugar(id);
  return (
    <span>
      <Link className="inline-flex min-h-11 items-center underline" href={`/el-mapa?lugar=${id}`}>
        {q.data?.name ??
          (q.isError ? 'Territorio sin nombre disponible' : 'Consultando territorio…')}
      </Link>
      {q.isError ? (
        <button
          className="ml-3 min-h-11 underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar nombre
        </button>
      ) : null}
    </span>
  );
}
