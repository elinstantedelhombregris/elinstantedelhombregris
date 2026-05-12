import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth';
import { useChallenges, useStartChallenge, type ChallengeEntry } from '~/lib/queries/gamification';

const CADENCE_LABELS: Record<ChallengeEntry['cadence'], string> = {
  daily: 'Diarios',
  weekly: 'Semanales',
  monthly: 'Mensuales',
  one_time: 'Una sola vez',
};

const CADENCE_ORDER: ChallengeEntry['cadence'][] = ['daily', 'weekly', 'monthly', 'one_time'];

export function Desafios() {
  const { user } = useAuth();
  const { data, isLoading } = useChallenges();
  const start = useStartChallenge();

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Cargando…</div>;
  }

  const grouped = new Map<ChallengeEntry['cadence'], ChallengeEntry[]>();
  for (const c of data?.challenges ?? []) {
    const bucket = grouped.get(c.cadence) ?? [];
    bucket.push(c);
    grouped.set(c.cadence, bucket);
  }

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Desafíos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pequeñas misiones para mover la aguja. Ganás XP por completarlas.
        </p>
      </header>

      {CADENCE_ORDER.map((cadence) => {
        const list = grouped.get(cadence) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={cadence} className="flex flex-col gap-3">
            <h2 className="text-sm uppercase tracking-wide text-muted-foreground">{CADENCE_LABELS[cadence]}</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((c) => {
                const rawSteps = c.progress?.stepsCompleted;
                const completedSet = new Set<number>(Array.isArray(rawSteps) ? (rawSteps as number[]) : []);
                const isDone = c.progress?.status === 'completed';
                const isStarted = c.progress?.status === 'in_progress';
                return (
                  <li
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{c.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                      </div>
                      <span className="rounded-full border border-iris-violet/40 px-2 py-0.5 text-xs text-iris-violet">
                        +{c.xpReward} XP
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {c.steps.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          {completedSet.has(s.orderIndex) ? (
                            <CheckCircle2 className="h-4 w-4 text-iris-violet" aria-hidden />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />
                          )}
                          <span className={completedSet.has(s.orderIndex) ? 'line-through' : ''}>{s.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1">
                      {!user ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href="/registrarse">Registrate para participar</Link>
                        </Button>
                      ) : isDone ? (
                        <span className="text-xs text-muted-foreground">Completado ✓</span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={start.isPending}
                          onClick={() => {
                            start.mutate(c.slug);
                          }}
                        >
                          {isStarted ? 'Continuar' : 'Empezar'}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
