const PHASES = [
  {
    title: 'Despertar',
    description:
      'El primer ¡BASTA! interno. La persona deja de delegar su conciencia y empieza a hacerse cargo de su parte.',
    horizon: 'Días',
  },
  {
    title: 'Diseñar',
    description:
      'La persona despierta diseña su entorno: casa, barrio, trabajo, aula. Prototipa los principios en pequeño.',
    horizon: 'Semanas',
  },
  {
    title: 'Conectar',
    description:
      'Los nodos despiertos se encuentran. La red se densifica. Aparecen iniciativas que cruzan barrios.',
    horizon: 'Meses',
  },
  {
    title: 'Multiplicar',
    description:
      'Los PLANs encuentran ejecutores en cada provincia. La política empieza a recibir el diseño popular como input.',
    horizon: '1-2 años',
  },
  {
    title: 'Estrenar',
    description:
      'Argentina vuelve a atraer soñadores. No por desesperación, por excelencia. El diseño se vuelve cotidiano.',
    horizon: '5 años',
  },
];

export function Phases() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Cinco fases</h2>
        <p className="mt-2 text-muted-foreground">De la chispa individual al país habitable. Cada fase tiene su tarea.</p>
      </div>
      <ol className="space-y-4">
        {PHASES.map((phase, idx) => (
          <li key={phase.title} className="glass flex flex-col gap-3 rounded-xl p-6 md:flex-row md:items-start md:gap-8">
            <div className="md:w-32 md:flex-shrink-0">
              <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">
                Fase {String(idx + 1).padStart(2, '0')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{phase.horizon}</p>
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold">{phase.title}</h3>
              <p className="mt-2 leading-relaxed text-foreground/85">{phase.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
