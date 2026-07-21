import { Link } from 'wouter';

import { TRES_LINEAS } from '../landing-data';

export function IdeaEnTresLineas() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-[72px] pt-[88px] min-[961px]:px-10">
      <div className="font-space text-violeta mb-7 text-[11px] uppercase tracking-[0.16em]">
        § 01 — La idea en tres líneas
      </div>

      {TRES_LINEAS.map((row) => (
        <Link
          key={row.num}
          href="/la-vision"
          className="border-tinta text-tinta hover:bg-papel-presionado grid grid-cols-[90px_1fr_300px] items-center gap-7 border-t py-[26px] transition-colors duration-200 max-[960px]:grid-cols-[56px_1fr]"
        >
          <span className="font-space text-tinta-50 text-sm">{row.num}</span>
          <span className="font-anton text-[clamp(34px,4.6vw,64px)] leading-none tracking-[0.01em]">
            {row.a} <span className="text-violeta">{row.b}</span>
          </span>
          <span className="text-tinta-50 text-pretty text-sm leading-normal max-[960px]:hidden">
            {row.def}
          </span>
        </Link>
      ))}

      <div className="border-tinta flex flex-wrap items-center justify-between gap-4 border-t pt-[18px]">
        <span className="text-tinta-50 text-[15px]">
          Sin líder que idolatrar. Sin partido al que afiliarse. Un método.
        </span>
        <Link
          href="/la-vision"
          className="font-space text-violeta hover:text-violeta-hover text-[13px] font-bold uppercase tracking-[0.08em] transition-colors"
        >
          Leer la idea completa ↗
        </Link>
      </div>
    </section>
  );
}
