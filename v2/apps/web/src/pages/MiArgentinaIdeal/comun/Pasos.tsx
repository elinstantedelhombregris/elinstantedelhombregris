import { Link } from 'wouter';

import { cn } from '~/lib/utils';

export type Momento = 'imaginar' | 'mirar' | 'ver';

const PASOS: { momento: Momento; rotulo: string; href: string }[] = [
  { momento: 'imaginar', rotulo: 'Imaginar', href: '/mi-argentina-ideal/imaginar' },
  { momento: 'mirar', rotulo: 'Mirar', href: '/mi-argentina-ideal/mirar' },
  { momento: 'ver', rotulo: 'Ver', href: '/mi-argentina-ideal' },
];

/** Los tres momentos de Mi Argentina ideal, siempre en el mismo orden. */
export function Pasos({ actual }: { actual: Momento }) {
  return (
    <nav
      aria-label="Momentos de Mi Argentina ideal"
      className="border-tinta grid grid-cols-3 border-[1.5px]"
    >
      {PASOS.map((p, i) => (
        <Link
          key={p.momento}
          href={p.href}
          aria-current={p.momento === actual ? 'step' : undefined}
          className={cn(
            'font-space border-tinta flex min-h-11 items-center justify-center gap-2 border-r-[1.5px] px-1 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] last:border-r-0',
            p.momento === actual ? 'bg-tinta text-papel' : 'text-tinta hover:bg-papel-presionado',
          )}
        >
          <span className={p.momento === actual ? 'text-tinta-30' : 'text-tinta-50'}>{i + 1}</span>
          {p.rotulo}
        </Link>
      ))}
    </nav>
  );
}
