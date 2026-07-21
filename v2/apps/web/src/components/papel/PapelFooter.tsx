import { Link } from 'wouter';

import { PAPEL_NAV_ALL, SEMBRAR_HREF } from './papel-nav';

const PRINCIPIOS = [
  'Abierto y auditable',
  'Anónimo si querés',
  'Sin fines de lucro',
  'Federal por diseño',
];

/**
 * Footer papel: wordmark gigante en outline, recorrido, principios y el
 * siguiente paso. Página oscura (#16130E) según el sistema.
 */
export function PapelFooter() {
  return (
    <footer className="bg-tinta text-papel">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 min-[961px]:px-10">
        <div
          aria-hidden
          className="font-anton select-none text-[clamp(70px,12vw,200px)] leading-[0.9] text-transparent [-webkit-text-stroke:1px_#3A362D]"
        >
          ¡BASTA!
        </div>

        <div className="border-oscuro-borde grid grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-10 border-b py-11 max-[960px]:grid-cols-1">
          <div>
            <div className="font-anton mb-3.5 text-xl">El instante del hombre gris</div>
            <p className="text-oscuro-meta m-0 max-w-[300px] text-pretty text-sm leading-relaxed">
              La ciudadanía diseña. El Estado administra. La política ejecuta. Sin líder, sin
              partido, sin excusas.
            </p>
          </div>

          <div>
            <div className="font-space text-oscuro-tenue mb-4 text-[11px] font-bold uppercase tracking-[0.14em]">
              Recorrido
            </div>
            <div className="flex flex-col gap-2.5">
              {PAPEL_NAV_ALL.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-oscuro-secundario hover:text-papel text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-space text-oscuro-tenue mb-4 text-[11px] font-bold uppercase tracking-[0.14em]">
              Principios
            </div>
            <div className="text-oscuro-meta flex flex-col gap-2.5 text-sm">
              {PRINCIPIOS.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="font-space text-oscuro-tenue mb-4 text-[11px] font-bold uppercase tracking-[0.14em]">
              El siguiente paso
            </div>
            <p className="text-oscuro-meta m-0 mb-4 text-sm leading-relaxed">
              No te pedimos fe. Te pedimos tres frases.
            </p>
            <Link
              href={SEMBRAR_HREF}
              className="bg-violeta font-space text-papel hover:bg-papel hover:text-tinta block w-full px-4 py-[15px] text-center text-xs font-bold uppercase tracking-[0.1em] transition-colors"
            >
              Sembrar mi voz
            </Link>
          </div>
        </div>

        <div className="font-space text-oscuro-tenue flex flex-wrap justify-between gap-4 pt-6 text-[11px] max-[560px]:flex-col">
          <span>© 2026 ¡BASTA! — El instante del hombre gris</span>
          <span>Prototipo con datos de demostración</span>
        </div>
      </div>
    </footer>
  );
}
