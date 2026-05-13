import { Link, useRoute } from 'wouter';

import { MdxContent } from '~/components/MdxContent';
import { useIniciativa } from '~/lib/queries/iniciativas';

export function IniciativaDocumento() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug/documento');
  const slug = params?.slug ?? '';
  const { data, isLoading, isError } = useIniciativa(slug);

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data?.iniciativa.bodyMarkdown) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No hay documento para esta iniciativa.</p>
        <Link href={`/iniciativas/${slug}`} className="text-iris-violet underline">
          Volver a la iniciativa
        </Link>
      </main>
    );
  }

  const iniciativa = data.iniciativa;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <Link href={`/iniciativas/${iniciativa.slug}`} className="text-sm text-iris-violet underline">
          ← Volver a {iniciativa.title}
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-semibold md:text-4xl">{iniciativa.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{iniciativa.summary}</p>
      </header>
      <article>
        <MdxContent raw={iniciativa.bodyMarkdown ?? ''} />
      </article>
    </main>
  );
}

export default IniciativaDocumento;
