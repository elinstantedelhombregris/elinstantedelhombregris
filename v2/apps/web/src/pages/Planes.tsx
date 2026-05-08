import { Link } from 'wouter';

import { PLAN_REGISTRY } from '~/lib/plans-registry';

export function Planes() {
  const meta = PLAN_REGISTRY.filter((p) => p.isMeta);
  const numbered = PLAN_REGISTRY.filter((p) => !p.isMeta);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Los 22 PLANs + PLANRUTA
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Cada PLAN es un sistema diseñado.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          No promesas: planos. Cada uno se desarrolla colectivamente con equipos de ciudadanos especialistas,
          deliberación pública y prototipos territoriales.
        </p>
      </header>

      {meta.length > 0 ? (
        <section className="mb-14">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-iris-violet">
            El plan meta
          </p>
          <div className="grid gap-4 md:grid-cols-1">
            {meta.map((plan) => (
              <Link
                key={plan.code}
                href={`/planes/${plan.slug}`}
                className="glass block rounded-2xl border-iris-violet/30 p-6 transition-colors hover:border-iris-violet/60"
              >
                <div className="flex items-start gap-4">
                  <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-iris-violet">
                    {plan.code}
                  </p>
                  <div>
                    <h2 className="font-serif text-2xl font-semibold">{plan.title}</h2>
                    <p className="mt-2 text-foreground/80">{plan.summary}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Los 22 PLANs</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {numbered.map((plan) => (
            <li key={plan.code}>
              <Link
                href={`/planes/${plan.slug}`}
                className="glass block h-full rounded-xl p-5 transition-colors hover:border-iris-violet/50"
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-iris-violet">
                  {plan.code}
                </p>
                <h3 className="mt-1 font-serif text-base font-semibold">{plan.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground/75">{plan.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Planes;
