import { Award } from 'lucide-react';

import type { GamificationMe } from '~/lib/queries/gamification';

/** Los colores de los niveles, todos con ≥3:1 sobre papel crudo (los claros del tema oscuro no se ven). */
const TIER_COLORS: Record<string, string> = {
  bronze: 'text-ambar',
  silver: 'text-tinta-50',
  gold: 'text-violeta',
  platinum: 'text-cian',
};

export function BadgesSection({ badges }: { badges: GamificationMe['badges'] }) {
  if (badges.length === 0) {
    return (
      <section className="border-tinta bg-papel-crudo border p-6">
        <h2 className="font-anton text-tinta text-2xl">Insignias</h2>
        <p className="text-tinta-75 mt-2 text-sm">
          Todavía no ganaste ninguna. Empezá con tu diagnóstico ciudadano o un cuestionario.
        </p>
      </section>
    );
  }
  return (
    <section className="border-tinta bg-papel-crudo border p-6">
      <h2 className="font-anton text-tinta text-2xl">Insignias ({badges.length})</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((b) => (
          <li
            key={b.slug}
            className="border-papel-borde flex flex-col items-center gap-2 border p-3 text-center"
          >
            <Award className={`h-8 w-8 ${TIER_COLORS[b.tier] ?? 'text-tinta'}`} aria-hidden />
            <div className="text-xs font-semibold">{b.title}</div>
            <div className="text-tinta-75 text-xs">{b.description}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
