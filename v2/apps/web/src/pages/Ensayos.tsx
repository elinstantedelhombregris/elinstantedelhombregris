import { Link } from 'wouter';

import { ENSAYOS } from '~/lib/ensayos-registry';

const SERIES_LABELS: Record<string, string> = {
  'primer-ciclo': 'Primer ciclo',
  indagaciones: 'Indagaciones',
  sueltos: 'Sueltos',
};

export function Ensayos() {
  // Group by series.
  const grouped = new Map<string, typeof ENSAYOS[number][]>();
  for (const e of ENSAYOS) {
    const arr = grouped.get(e.series) ?? [];
    arr.push(e);
    grouped.set(e.series, arr);
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Ensayos</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Pensamiento de fondo.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Textos largos sobre los temas que sostienen el movimiento. Para leer despacio, no para escanear.
        </p>
      </header>

      {ENSAYOS.length === 0 ? (
        <p className="text-center text-muted-foreground">Todavía no hay ensayos publicados.</p>
      ) : null}

      <div className="space-y-12">
        {Array.from(grouped.entries()).map(([series, items]) => (
          <section key={series}>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-iris-violet">
              {SERIES_LABELS[series] ?? series}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/ensayos/${e.slug}`}
                    className="glass block rounded-2xl p-6 transition-colors hover:border-iris-violet/50"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-xl font-semibold">{e.title}</h3>
                      {e.readingMinutes > 0 ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {e.readingMinutes} min
                        </p>
                      ) : null}
                    </div>
                    {e.subtitle ? <p className="mt-1 italic text-muted-foreground">{e.subtitle}</p> : null}
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{e.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Ensayos;
