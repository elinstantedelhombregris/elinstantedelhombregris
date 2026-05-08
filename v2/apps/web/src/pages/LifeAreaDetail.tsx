import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useRoute } from 'wouter';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';

interface Area {
  id: number;
  slug: string;
  name: string;
  description: string;
}
interface Subcategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  orderIndex: number;
  lifeAreaId: number;
}
interface Question {
  id: number;
  lifeAreaId: number;
  subcategoryId: number | null;
  category: 'current' | 'desired';
  questionType: string;
  prompt: string;
  orderIndex: number;
}
interface AreaResponse {
  area: Area;
  subcategories: Subcategory[];
  questions: Question[];
}

function DetailInner({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const areaQuery = useQuery<AreaResponse>({
    queryKey: ['life-areas', slug],
    queryFn: () => api.get<AreaResponse>(`/api/life-areas/${slug}`),
  });

  const [responses, setResponses] = useState<Record<number, number>>({});

  const submitMutation = useMutation({
    mutationFn: async () =>
      api.post(
        '/api/life-areas/quiz/responses',
        {
          responses: Object.entries(responses).map(([qid, value]) => ({
            questionId: Number(qid),
            value,
          })),
        },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['life-areas'] });
    },
  });

  if (areaQuery.isLoading) return <p className="font-mono text-sm text-muted-foreground">cargando…</p>;
  if (areaQuery.isError || !areaQuery.data) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">No encontramos esa área.</h1>
        <Button asChild className="mt-6">
          <Link href="/areas">Volver a las áreas</Link>
        </Button>
      </main>
    );
  }

  const { area, questions, subcategories } = areaQuery.data;
  const subsById = new Map(subcategories.map((s) => [s.id, s]));
  const sortedQuestions = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">{area.slug}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">{area.name}</h1>
        <p className="mt-3 text-muted-foreground">{area.description}</p>
      </header>

      <ol className="space-y-6">
        {sortedQuestions.map((q) => {
          const sub = q.subcategoryId !== null ? subsById.get(q.subcategoryId) : undefined;
          const value = responses[q.id] ?? 5;
          return (
            <li key={q.id} className="glass rounded-xl p-5">
              {sub ? (
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {sub.name} · <span className={q.category === 'desired' ? 'text-iris-violet' : 'text-foreground/60'}>{q.category === 'current' ? 'ahora' : 'querés'}</span>
                </p>
              ) : null}
              <p className="mt-2 text-base">{q.prompt}</p>
              <div className="mt-4 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={value}
                  onChange={(e) => {
                    setResponses((prev) => ({ ...prev, [q.id]: Number(e.target.value) }));
                  }}
                  className="flex-1 accent-iris-violet"
                  aria-label={q.prompt}
                />
                <span className="w-10 text-center font-mono text-lg font-semibold">{value}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex items-center justify-between">
        <Button asChild variant="secondary">
          <Link href="/areas">← Todas las áreas</Link>
        </Button>
        <Button
          disabled={submitMutation.isPending || Object.keys(responses).length === 0}
          onClick={() => {
            submitMutation.mutate();
          }}
        >
          {submitMutation.isPending ? 'Guardando…' : 'Guardar respuestas'}
        </Button>
      </div>
      {submitMutation.isSuccess ? (
        <p className="mt-4 text-center text-sm text-green-400">
          ¡Listo! Tus respuestas quedaron guardadas.
        </p>
      ) : null}
    </main>
  );
}

export function LifeAreaDetail() {
  const [match, params] = useRoute<{ slug: string }>('/areas/:slug');
  if (!match) return null;
  return (
    <RequireAuth>
      <DetailInner slug={params.slug} />
    </RequireAuth>
  );
}

export default LifeAreaDetail;
