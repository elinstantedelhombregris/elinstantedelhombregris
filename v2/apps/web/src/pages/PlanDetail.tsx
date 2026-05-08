import { Link, useRoute } from 'wouter';

import { MdxContent } from '~/components/MdxContent';
import { Button } from '~/components/ui/button';
import { findPlanBySlug } from '~/lib/plans-registry';

export function PlanDetail() {
  const [match, params] = useRoute<{ slug: string }>('/planes/:slug');
  if (!match) return null;
  const plan = findPlanBySlug(params.slug);

  if (!plan) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Ese PLAN no existe.</h1>
        <p className="mt-3 text-muted-foreground">¿Quisiste ver alguno de los otros?</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/planes">Ver todos los PLANs</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-iris-violet">{plan.code}</p>
      <MdxContent raw={plan.body} />
      <div className="mt-12 border-t border-white/5 pt-6 text-center">
        <Button asChild variant="secondary">
          <Link href="/planes">← Ver todos los PLANs</Link>
        </Button>
      </div>
    </main>
  );
}

export default PlanDetail;
