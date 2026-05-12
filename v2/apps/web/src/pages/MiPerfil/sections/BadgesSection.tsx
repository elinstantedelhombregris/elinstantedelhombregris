import { Award } from 'lucide-react';

import type { GamificationMe } from '~/lib/queries/gamification';

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-300',
  platinum: 'text-cyan-200',
};

export function BadgesSection({ badges }: { badges: GamificationMe['badges'] }) {
  if (badges.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="font-serif text-lg font-semibold">Insignias</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no ganaste ninguna. Empezá con tu diagnóstico ciudadano o un cuestionario.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold">Insignias ({badges.length})</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((b) => (
          <li key={b.slug} className="flex flex-col items-center gap-2 rounded-lg border border-white/5 p-3 text-center">
            <Award className={`h-8 w-8 ${TIER_COLORS[b.tier] ?? 'text-foreground'}`} aria-hidden />
            <div className="text-xs font-semibold">{b.title}</div>
            <div className="text-[10px] text-muted-foreground">{b.description}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
