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
    <section className="border-tinta bg-papel-crudo border p-6">
      <h1 className="font-anton text-tinta text-4xl">Hola, {firstName}</h1>
      <div className="mt-4 flex items-baseline gap-4">
        <div className="text-tinta-75 text-sm">Nivel</div>
        <div className="text-3xl font-semibold tabular-nums">{data.level}</div>
        <div className="font-space ml-auto text-2xl tabular-nums">
          {data.xp.toLocaleString('es-AR')} XP
        </div>
      </div>
      <div className="bg-papel-presionado mt-3 h-2 w-full overflow-hidden">
        <div
          className="bg-violeta h-full"
          style={{ width: `${String(pct)}%` }}
          aria-label={`${String(pct)}% al siguiente nivel`}
        />
      </div>
      <div className="text-tinta-75 mt-2 text-xs">
        {xpRemaining.toLocaleString('es-AR')} XP para nivel {data.level + 1}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Flame className="text-violeta h-4 w-4" aria-hidden />
        <span>
          Racha de {data.streakDays} días · Récord: {data.longestStreakDays}
        </span>
      </div>
    </section>
  );
}
