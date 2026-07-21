import { Link } from 'wouter';

import { CIFRAS } from '../landing-data';

import { cn } from '~/lib/utils';


export function CifrasStrip() {
  return (
    <section className="border-tinta bg-papel-crudo border-b">
      <div className="mx-auto grid max-w-[1440px] grid-cols-4 px-5 max-[960px]:grid-cols-1 min-[961px]:px-10">
        {CIFRAS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border-papel-borde text-tinta hover:bg-papel-presionado block border-r px-6 py-[34px] transition-colors duration-200 max-[960px]:border-b max-[960px]:border-r-0"
          >
            <div
              className={cn('font-anton text-[46px] leading-none', c.esVioleta && 'text-violeta')}
            >
              {c.n}
            </div>
            <div className="font-space text-tinta-50 mt-2.5 text-[11px] uppercase tracking-[0.12em]">
              {c.label} ↗
            </div>
          </Link>
        ))}
      </div>
      <div className="mx-auto max-w-[1440px] px-5 pb-3.5 min-[961px]:px-10">
        <span className="font-space text-tinta-30 text-[10px] uppercase tracking-[0.12em]">
          * Datos de demostración — la plataforma real arranca en cero, y eso también está bien.
        </span>
      </div>
    </section>
  );
}
