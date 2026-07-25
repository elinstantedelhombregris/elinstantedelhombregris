import { MANIFIESTO, PARTE_COUNT } from '../manifiesto-data';

/** Sumario §5 (spec 3.3): ancla nativa por parte. No se imprime: es navegación. */
export function SumarioManifiesto() {
  if (PARTE_COUNT === 0) return null;
  return (
    <nav aria-label="Las partes del manifiesto" className="mt-10 print:hidden">
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
        El recorrido · {PARTE_COUNT} partes
      </p>
      {MANIFIESTO.partes.map((parte, i) => (
        <a
          key={parte.id}
          href={`#${parte.id}`}
          className="border-papel-borde hover:bg-papel-presionado text-tinta grid grid-cols-[56px_1fr_40px] items-baseline gap-5 border-b px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
        >
          <span className="font-space text-tinta-30 text-sm">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-[17px] leading-snug">{parte.encabezado}</span>
          <span className="font-space text-tinta-50 justify-self-end">→</span>
        </a>
      ))}
    </nav>
  );
}
