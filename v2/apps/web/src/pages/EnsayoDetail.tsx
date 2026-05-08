import { Link, useRoute } from 'wouter';

import { MdxContent } from '~/components/MdxContent';
import { Button } from '~/components/ui/button';
import { findEnsayoBySlug } from '~/lib/ensayos-registry';

export function EnsayoDetail() {
  const [match, params] = useRoute<{ slug: string }>('/ensayos/:slug');
  if (!match) return null;
  const ensayo = findEnsayoBySlug(params.slug);

  if (!ensayo) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Ese ensayo no existe.</h1>
        <Button asChild className="mt-6">
          <Link href="/ensayos">Ver todos los ensayos</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
      {ensayo.readingMinutes > 0 ? (
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {ensayo.readingMinutes} minutos de lectura
        </p>
      ) : null}
      <MdxContent raw={ensayo.body} />
      <div className="mt-12 border-t border-white/5 pt-6 text-center">
        <Button asChild variant="secondary">
          <Link href="/ensayos">← Todos los ensayos</Link>
        </Button>
      </div>
    </main>
  );
}

export default EnsayoDetail;
