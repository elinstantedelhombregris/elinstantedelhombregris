import { Link, Redirect, useRoute } from 'wouter';

import { Button } from '~/components/ui/button';
import {
  useIniciativa,
  useJoinIniciativa,
  useLeaveIniciativa,
} from '~/lib/queries/iniciativas';

export function IniciativaDetail() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug');
  const slug = params?.slug ?? '';
  const { data, isLoading, isError } = useIniciativa(slug);
  const join = useJoinIniciativa();
  const leave = useLeaveIniciativa();

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos esta iniciativa.</p>
        <Link href="/comunidad" className="text-iris-violet underline">
          Volver a la comunidad
        </Link>
      </main>
    );
  }

  const iniciativa = data.iniciativa;

  if (iniciativa.kind === 'plan') {
    return <Redirect to={`/planes/${iniciativa.slug}`} />;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Iniciativa · {iniciativa.kind}
        </p>
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{iniciativa.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{iniciativa.summary}</p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
        <div>
          <p className="text-muted-foreground">Estado</p>
          <p className="font-medium">{iniciativa.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Miembros</p>
          <p className="font-medium">{iniciativa.memberCount}</p>
        </div>
      </section>

      <div className="mb-12 flex flex-wrap gap-3">
        <Button onClick={() => join.mutate(iniciativa.id)} disabled={join.isPending}>
          Unirme
        </Button>
        <Button
          variant="secondary"
          onClick={() => leave.mutate(iniciativa.id)}
          disabled={leave.isPending}
        >
          Salir
        </Button>
        {iniciativa.bodyMarkdown ? (
          <Link href={`/iniciativas/${iniciativa.slug}/documento`}>
            <Button variant="ghost">Ver documento completo</Button>
          </Link>
        ) : null}
      </div>
    </main>
  );
}

export default IniciativaDetail;
