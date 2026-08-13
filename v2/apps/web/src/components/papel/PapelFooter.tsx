import { Link } from 'wouter';

import {
  FALTA_HREF,
  FALTA_LABEL,
  PAPEL_NAV_ALL,
  QUIEN_HREF,
  QUIEN_LABEL,
  SEMBRAR_HREF,
  SIMULACION_HREF,
  SIMULACION_LABEL,
} from './papel-nav';

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
    <footer className="bg-tinta text-papel print:hidden">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 min-[961px]:px-10">
        <div
          aria-hidden
          className="font-anton select-none text-[clamp(70px,12vw,200px)] leading-[0.9] text-transparent [-webkit-text-stroke:1px_theme(colors.oscuro.borde)]"
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
          <span className="flex flex-wrap items-center gap-2">
            © 2026 ¡BASTA! — El instante del hombre gris
            <span aria-hidden>·</span>
            {/* Única puerta de entrada de toda la página: no está en el
                recorrido ni en el header, a propósito. */}
            <Link href={QUIEN_HREF} className="hover:text-papel underline transition-colors">
              {QUIEN_LABEL}
            </Link>
            <span aria-hidden>·</span>
            {/* La cuarta boca del canal de escucha, y la que está en todas las
                páginas (spec 2026-08-12-lo-que-falta.md §2.8). Va acá abajo y
                no en el recorrido: es una puerta que tiene que estar siempre y
                no pedir nada, no una sección que compita con las cinco. */}
            <Link href={FALTA_HREF} className="hover:text-papel underline transition-colors">
              {FALTA_LABEL}
            </Link>
            <span aria-hidden>·</span>
            {/* El instrumento de análisis (spec 2026-08-13 §2.9): tercera
                inquilina de la franja, y por la misma razón que las dos de al
                lado — es una herramienta de trabajo y no una puerta del
                recorrido. */}
            <Link href={SIMULACION_HREF} className="hover:text-papel underline transition-colors">
              {SIMULACION_LABEL}
            </Link>
          </span>
          <span>Prototipo · todavía sin voces</span>
        </div>
      </div>
    </footer>
  );
}
