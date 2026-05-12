import { Flame } from 'lucide-react';

import type { GamificationMe } from '~/lib/queries/gamification';

interface Props {
  data: GamificationMe;
  displayName: string;
}

export function HeaderSection({ data, displayName }: Props) {
  const span = Math.max(1, data.xpForNext - data.xpForCurrent);
  const pct = Math.min(100, Math.round(((data.xp - data.xpForCurrent) / span) * 100));
  const xpRemaining = Math.max(0, data.xpForNext - data.xp);
  const firstName = displayName.split(' ')[0] ?? displayName;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h1 className="font-serif text-2xl font-semibold">Hola, {firstName}</h1>
      <div className="mt-4 flex items-baseline gap-4">
        <div className="text-sm text-muted-foreground">Nivel</div>
        <div className="text-3xl font-semibold tabular-nums">{data.level}</div>
        <div className="ml-auto font-mono text-2xl tabular-nums">{data.xp.toLocaleString('es-AR')} XP</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-iris-violet"
          style={{ width: `${String(pct)}%` }}
          aria-label={`${String(pct)}% al siguiente nivel`}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {xpRemaining.toLocaleString('es-AR')} XP para nivel {data.level + 1}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Flame className="h-4 w-4 text-iris-violet" aria-hidden />
        <span>Racha de {data.streakDays} días · Récord: {data.longestStreakDays}</span>
      </div>
    </section>
  );
}
