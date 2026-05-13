import { Link, useRoute } from 'wouter';

import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth/use-auth';
import { usePropuestaById, useVotePropuesta } from '~/lib/queries/mandato';

export function PropuestaDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/propuesta/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = usePropuestaById(id);
  const vote = useVotePropuesta(id);
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos esta propuesta.</p>
        <Link href="/mandato-vivo" className="text-iris-violet underline">
          Volver al Mandato Vivo
        </Link>
      </main>
    );
  }

  const propuesta = data.proposal;
  const voteDisabled = !isAuthenticated || vote.isPending;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <Link href="/mandato-vivo" className="text-sm text-iris-violet underline">
          ← Volver al Mandato Vivo
        </Link>
        <p className="mt-6 mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Propuesta #{propuesta.id} · {propuesta.status}
        </p>
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{propuesta.title}</h1>
        <p className="mt-4 whitespace-pre-line text-lg text-muted-foreground">{propuesta.summary}</p>
      </header>

      {propuesta.bodyMarkdown ? (
        <article className="mb-8 whitespace-pre-line text-base text-foreground/90">
          {propuesta.bodyMarkdown}
        </article>
      ) : null}

      <section className="mb-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-muted-foreground">
          Score:{' '}
          <span className="font-medium text-foreground">{propuesta.voteScore}</span>{' '}
          <span className="text-xs">({propuesta.voteCount} votos)</span>
        </p>
        <div className="ml-auto flex gap-2">
          <Button
            onClick={() => {
              vote.mutate(1);
            }}
            disabled={voteDisabled}
          >
            +1
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              vote.mutate(-1);
            }}
            disabled={voteDisabled}
          >
            -1
          </Button>
        </div>
      </section>
      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          <Link href="/ingresar" className="text-iris-violet underline">
            Ingresá
          </Link>{' '}
          para votar.
        </p>
      ) : null}
    </main>
  );
}

export default PropuestaDetail;
