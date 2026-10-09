import { PLAN_COUNT, PLANES } from '~/pages/Planes/la-prueba-data';

export function PlanesGrid() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Los {PLAN_COUNT} PLANs</h2>
        <p className="mt-2 text-muted-foreground">
          Cada PLAN es un sistema diseñado. Se desarrollan colectivamente: equipos de ciudadanos especialistas,
          deliberación pública, prototipos territoriales, refinamiento iterativo.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          PLANRUTA — el plan meta — no aparece en esta lista: es el manual de cómo arrancar todo.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLANES.map((plan) => (
          <li
            key={plan.code}
            className="glass rounded-xl p-4 transition-colors hover:border-iris-violet/50"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-iris-violet">
              {plan.code}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground/90">{plan.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
