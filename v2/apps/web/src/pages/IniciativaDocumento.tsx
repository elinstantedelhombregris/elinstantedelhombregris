import { Link, useRoute } from 'wouter';

import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useIniciativa } from '~/lib/queries/iniciativas';

export function IniciativaDocumento() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug/documento');
  const slug = params?.slug ?? '';
  const q = useIniciativa(slug);
  if (q.isLoading)
    return (
      <main className="p-10" role="status">
        Cargando documento…
      </main>
    );
  return (
    <MarcoParticipacion
      titulo={q.data?.iniciativa.title ?? 'Documento de la iniciativa'}
      entrada={q.data?.iniciativa.summary ?? 'Consultá el propósito y los criterios del equipo.'}
    >
      <Link href={`/iniciativas/${slug}`} className="text-violeta underline">
        Volver a la iniciativa
      </Link>
      {q.isError ? (
        <div role="alert" className="my-5">
          <p>No pudimos actualizar el documento. Conservamos la última lectura disponible.</p>
          <button
            className="min-h-11 underline"
            onClick={() => {
              void q.refetch();
            }}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {q.data?.iniciativa.bodyMarkdown ? (
        <article className="mt-7 whitespace-pre-wrap break-words leading-relaxed">
          {q.data.iniciativa.bodyMarkdown}
        </article>
      ) : !q.isError ? (
        <p className="mt-7">Esta iniciativa todavía no publicó un documento.</p>
      ) : null}
    </MarcoParticipacion>
  );
}
export default IniciativaDocumento;
