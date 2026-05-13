import { Link, useRoute } from 'wouter';

import { usePulsoById } from '~/lib/queries/mandato';

export function PulsoDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/pulso/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = usePulsoById(id);

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos este pulso.</p>
        <Link href="/mandato-vivo" className="text-iris-violet underline">
          Volver al Mandato Vivo
        </Link>
      </main>
    );
  }

  const signal = data.signal;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <Link href="/mandato-vivo" className="text-sm text-iris-violet underline">
          ← Volver al Mandato Vivo
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Pulso #{signal.id}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold md:text-3xl">{signal.body}</h1>
      </header>
      <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
        <div>
          <dt className="text-muted-foreground">Provincia</dt>
          <dd className="font-medium">{signal.provinceId ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tema</dt>
          <dd className="font-medium">{signal.theme ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sentimiento</dt>
          <dd className="font-medium">{signal.sentiment ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Origen</dt>
          <dd className="font-medium">{signal.source}</dd>
        </div>
      </dl>
    </main>
  );
}

export default PulsoDetail;
