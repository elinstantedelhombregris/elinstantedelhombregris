const SIMBOLOS = [
  { color: 'bg-violeta-claro', texto: 'confianza' },
  { color: 'bg-ambar-claro', texto: 'trabajo' },
  { color: 'bg-papel', texto: 'lo que vuelve' },
  { color: 'bg-sello-claro', texto: 'calor' },
] as const;

/** Qué es cada color de la escena: sin esto, la luz es linda pero no dice nada. */
export function Leyenda() {
  return (
    <ul className="font-space text-oscuro-secundario pointer-events-none absolute left-3 top-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.08em] sm:left-4 sm:top-4">
      {SIMBOLOS.map(({ color, texto }) => (
        <li key={texto} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`inline-block size-2 rounded-full ${color}`} />
          {texto}
        </li>
      ))}
    </ul>
  );
}
