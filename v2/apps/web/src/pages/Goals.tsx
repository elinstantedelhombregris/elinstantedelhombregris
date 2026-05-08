import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';

interface Goal {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priority: number;
  status: string;
  targetDate: string | null;
  createdAt: string;
}

interface GoalsResponse {
  goals: Goal[];
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'engagement', label: 'Compromiso' },
  { value: 'knowledge', label: 'Conocimiento' },
  { value: 'community', label: 'Comunidad' },
  { value: 'impact', label: 'Impacto' },
  { value: 'territorial', label: 'Territorial' },
];

function GoalsInner() {
  const queryClient = useQueryClient();
  const goalsQuery = useQuery<GoalsResponse>({
    queryKey: ['goals'],
    queryFn: () => api.get<GoalsResponse>('/api/goals'),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('engagement');
  const [priority, setPriority] = useState(3);

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post(
        '/api/goals',
        { title, description: description || undefined, category, priority },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      setTitle('');
      setDescription('');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) =>
      api.post(`/api/goals/${String(id)}/complete`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const goals = goalsQuery.data?.goals ?? [];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Objetivos</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Tus objetivos cívicos activos</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pequeños o grandes — los que sostengas.{' '}
          <Link href="/check-in-semanal" className="text-iris-violet hover:underline">
            Cada semana hacé tu check-in →
          </Link>
        </p>
      </header>

      <section className="glass mb-10 rounded-2xl p-6">
        <h2 className="mb-4 font-serif text-xl font-semibold">Nuevo objetivo</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) createMutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="goal-title">Título</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              required
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="goal-description">Descripción (opcional)</Label>
            <Input
              id="goal-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              maxLength={2000}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="goal-category">Categoría</Label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-background">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="goal-priority">Prioridad: {priority}</Label>
              <input
                id="goal-priority"
                type="range"
                min={1}
                max={5}
                value={priority}
                onChange={(e) => {
                  setPriority(Number(e.target.value));
                }}
                className="mt-3 w-full accent-iris-violet"
              />
            </div>
          </div>
          <Button type="submit" disabled={createMutation.isPending || !title.trim()} className="w-full">
            {createMutation.isPending ? 'Guardando…' : 'Crear objetivo'}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Activos ({goals.length})</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no tenés objetivos activos. Empezá creando uno arriba.</p>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => (
              <li key={goal.id} className="glass flex items-start justify-between gap-4 rounded-xl p-5">
                <div className="flex-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">
                    {goal.category} · prioridad {goal.priority}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold">{goal.title}</h3>
                  {goal.description ? <p className="mt-1 text-sm text-foreground/80">{goal.description}</p> : null}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={completeMutation.isPending}
                  onClick={() => {
                    completeMutation.mutate(goal.id);
                  }}
                >
                  Completado
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export function Goals() {
  return (
    <RequireAuth>
      <GoalsInner />
    </RequireAuth>
  );
}

export default Goals;
