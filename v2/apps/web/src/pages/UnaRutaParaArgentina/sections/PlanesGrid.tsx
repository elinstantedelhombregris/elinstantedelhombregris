const PLANES = [
  { code: 'PLANSAL', title: 'Salud digna y soberana' },
  { code: 'PLANEDU', title: 'Educación que despierta' },
  { code: 'PLANSEG', title: 'Seguridad sin miedo' },
  { code: 'PLANJUS', title: 'Justicia que acompaña' },
  { code: 'PLANTIE', title: 'Tierra y soberanía territorial' },
  { code: 'PLANSUS', title: 'Soberanía sobre las sustancias' },
  { code: 'PLANENE', title: 'Energía abundante y limpia' },
  { code: 'PLANEB', title: 'Empresas Bastardas (Red Bastarda)' },
  { code: 'PLANCUI', title: 'Cuidado de la primera infancia' },
  { code: 'PLANVEJ', title: 'Vejez con dignidad' },
  { code: 'PLANCUL', title: 'Cultura como infraestructura' },
  { code: 'PLANCIE', title: 'Ciencia abierta argentina' },
  { code: 'PLANTRA', title: 'Trabajo con propósito' },
  { code: 'PLANMON', title: 'Soberanía monetaria' },
  { code: 'PLANBAR', title: 'Barrios autogestivos' },
  { code: 'PLANCON', title: 'Confianza institucional' },
  { code: 'PLANCOM', title: 'Comunicación y verdad' },
  { code: 'PLANGEN', title: 'Generación de excelencia' },
  { code: 'PLANBIO', title: 'Bioeconomía y bienes comunes' },
  { code: 'PLANCRI', title: 'Crisis preparada (resiliencia)' },
  { code: 'PLANINS', title: 'Instituciones rediseñadas' },
  { code: 'PLANAMB', title: 'Ambiente sano para 7 generaciones' },
];

export function PlanesGrid() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Los 22 PLANs</h2>
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
