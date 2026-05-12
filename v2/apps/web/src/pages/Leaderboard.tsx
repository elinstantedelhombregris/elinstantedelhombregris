import { useState } from 'react';

import { useLeaderboard } from '~/lib/queries/gamification';
import { cn } from '~/lib/utils';

type Period = 'weekly' | 'all_time';

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <main className="container mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Clasificación</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quiénes están moviendo la aguja cívica.</p>
      </header>

      <div className="inline-flex rounded-lg border border-white/10 p-1">
        <TabButton active={period === 'weekly'} onClick={() => { setPeriod('weekly'); }}>Esta semana</TabButton>
        <TabButton active={period === 'all_time'} onClick={() => { setPeriod('all_time'); }}>Histórico</TabButton>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando…</div>
      ) : (data?.rows.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
          {period === 'weekly'
            ? 'Todavía no hay actividad esta semana — sé el primero.'
            : 'Todavía no hay nadie en la tabla histórica.'}
        </div>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          {(data?.rows ?? []).map((row) => (
            <li
              key={row.userId}
              className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-b-0"
            >
              <span className="flex items-center gap-4">
                <span className="w-8 text-right font-mono text-sm tabular-nums text-muted-foreground">{row.rank}</span>
                <span className="text-sm font-semibold">{row.displayName}</span>
              </span>
              <span className="font-mono text-sm tabular-nums">{row.xp.toLocaleString('es-AR')} XP</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-iris-violet text-white' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
