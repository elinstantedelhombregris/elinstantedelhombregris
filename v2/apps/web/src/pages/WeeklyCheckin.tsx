/**
 * Weekly check-in page — single short form posting to /api/checkins.
 * Mounted at /check-in-semanal (the Goals page already links here).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';

interface CurrentWeekResponse {
  weekStart: string;
  checkin: {
    id: number;
    progressScore: number;
    reflection: string | null;
    actedOnGoals: boolean;
  } | null;
}

interface SubmitResponse {
  checkin: {
    id: number;
  };
}

export function WeeklyCheckin() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [progressScore, setProgressScore] = useState<number>(3);
  const [reflection, setReflection] = useState('');
  const [actedOnGoals, setActedOnGoals] = useState(false);

  const currentWeekQuery = useQuery<CurrentWeekResponse>({
    queryKey: ['checkins', 'current-week'],
    queryFn: () => api.get<CurrentWeekResponse>('/api/checkins/current-week'),
  });

  const submitMutation = useMutation<SubmitResponse>({
    mutationFn: async () =>
      api.post<SubmitResponse>(
        '/api/checkins',
        {
          weekStart: currentWeekQuery.data?.weekStart,
          progressScore,
          reflection: reflection.trim() || undefined,
          actedOnGoals,
        },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['checkins'] });
      navigate('/objetivos');
    },
  });

  if (currentWeekQuery.isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <p className="font-mono text-sm text-muted-foreground">cargando…</p>
      </main>
    );
  }

  const existing = currentWeekQuery.data?.checkin;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Check-in semanal
        </p>
        <h1 className="font-serif text-3xl font-semibold">¿Cómo te fue esta semana?</h1>
        <p className="mt-3 text-muted-foreground">
          Una pausa breve para mirar atrás y ajustar el rumbo. La semana corre de lunes a domingo.
        </p>
      </header>

      {existing ? (
        <div className="glass mb-6 rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">
            Ya hiciste el check-in de esta semana. Si querés actualizarlo, mandá uno nuevo —
            sobreescribe el anterior.
          </p>
        </div>
      ) : null}

      <form
        className="glass space-y-6 rounded-2xl p-8"
        onSubmit={(e) => {
          e.preventDefault();
          submitMutation.mutate();
        }}
      >
        <div>
          <Label htmlFor="progress" className="mb-3 block">
            ¿Cuánto avanzaste con tus objetivos? <span className="text-muted-foreground">(1 = nada · 5 = mucho)</span>
          </Label>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="progress">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={progressScore === n}
                onClick={() => {
                  setProgressScore(n);
                }}
                className={`h-12 flex-1 rounded-md border text-sm font-medium transition-colors ${
                  progressScore === n
                    ? 'border-iris-violet bg-iris-violet/20 text-foreground'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="reflection">Reflexión (opcional)</Label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(e) => {
              setReflection(e.target.value);
            }}
            placeholder="¿Qué aprendiste? ¿Qué cambiarías la semana que viene?"
            className="min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={2000}
          />
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={actedOnGoals}
            onChange={(e) => {
              setActedOnGoals(e.target.checked);
            }}
            className="h-4 w-4"
          />
          Hice al menos una acción concreta hacia un objetivo esta semana.
        </label>

        <Button type="submit" disabled={submitMutation.isPending} className="w-full">
          {submitMutation.isPending ? 'Guardando…' : 'Guardar check-in'}
        </Button>
        {submitMutation.isError ? (
          <p role="alert" className="text-sm text-red-400">
            No pudimos guardar el check-in. Intentá de nuevo.
          </p>
        ) : null}
      </form>
    </main>
  );
}

export default WeeklyCheckin;
