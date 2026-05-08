import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';

interface Question {
  id: string;
  axis: 'engagement' | 'knowledge' | 'impact' | 'community';
  prompt: string;
  scale: 'likert5';
}

interface QuestionsResponse {
  version: string;
  questions: Question[];
}

interface Assessment {
  id: number;
  userId: number;
  status: string;
  questionsVersion: string;
}

interface AxisScores {
  engagement: number;
  knowledge: number;
  impact: number;
  community: number;
  total: number;
}

interface CivicProfileShape {
  userId: number;
  scores: AxisScores;
  archetype: string | null;
  lastAssessmentId: number | null;
}

interface ProfileResponse {
  profile: CivicProfileShape | null;
}

const AXIS_LABELS: Record<Question['axis'], string> = {
  engagement: 'Compromiso',
  knowledge: 'Conocimiento',
  impact: 'Impacto',
  community: 'Comunidad',
};

const ARCHETYPE_LABELS: Record<string, string> = {
  observador: 'Observador',
  participante: 'Participante',
  organizador: 'Organizador',
  arquitecto: 'Arquitecto',
};

function CivicInner() {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [assessmentId, setAssessmentId] = useState<number | null>(null);

  const questionsQuery = useQuery<QuestionsResponse>({
    queryKey: ['civic-assessment', 'questions'],
    queryFn: () => api.get<QuestionsResponse>('/api/civic-assessment/questions'),
  });

  const profileQuery = useQuery<ProfileResponse>({
    queryKey: ['civic-assessment', 'profile'],
    queryFn: () => api.get<ProfileResponse>('/api/civic-assessment/profile'),
  });

  const startMutation = useMutation({
    mutationFn: async () => api.post<{ assessment: Assessment }>('/api/civic-assessment/start', undefined, { csrfToken: readCsrfToken() }),
    onSuccess: (data) => {
      setAssessmentId(data.assessment.id);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      // Send all responses, then complete.
      for (const [questionId, value] of Object.entries(responses)) {
         
        await api.post(`/api/civic-assessment/${String(id)}/respond`, { questionId, value }, { csrfToken: readCsrfToken() });
      }
      return api.post<{ profile: CivicProfileShape }>(`/api/civic-assessment/${String(id)}/complete`, undefined, { csrfToken: readCsrfToken() });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['civic-assessment', 'profile'] });
      setAssessmentId(null);
      setResponses({});
    },
  });

  const profile = profileQuery.data?.profile;
  const showResults = profile && !startMutation.isPending && assessmentId === null;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Auto-evaluación cívica</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">¿Qué tipo de ciudadano sos?</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          24 afirmaciones, 4 dimensiones (compromiso, conocimiento, impacto, comunidad). Te toma 5 minutos
          y te da un retrato honesto de tu participación cívica hoy.
        </p>
      </header>

      {showResults ? (
        <section className="glass mb-10 rounded-2xl p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">Tu arquetipo actual</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">
            {profile.archetype ? ARCHETYPE_LABELS[profile.archetype] ?? profile.archetype : 'Sin arquetipo'}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(['engagement', 'knowledge', 'impact', 'community'] as const).map((axis) => (
              <div key={axis} className="rounded-xl bg-white/5 p-4 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{AXIS_LABELS[axis]}</p>
                <p className="mt-1 font-serif text-2xl font-semibold">{profile.scores[axis]}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                startMutation.mutate();
              }}
            >
              Volver a hacer la evaluación
            </Button>
          </div>
        </section>
      ) : null}

      {!showResults && assessmentId === null ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Button
            size="lg"
            disabled={startMutation.isPending || questionsQuery.isLoading}
            onClick={() => {
              startMutation.mutate();
            }}
          >
            {startMutation.isPending ? 'Empezando…' : 'Empezar evaluación'}
          </Button>
        </div>
      ) : null}

      {assessmentId !== null && questionsQuery.data ? (
        <section>
          <ol className="space-y-5">
            {questionsQuery.data.questions.map((q) => (
              <li key={q.id} className="glass rounded-xl p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">
                  {AXIS_LABELS[q.axis]}
                </p>
                <p className="mt-2 text-base">{q.prompt}</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const selected = responses[q.id] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setResponses((prev) => ({ ...prev, [q.id]: v }));
                        }}
                        className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                          selected
                            ? 'border-iris-violet bg-iris-violet/20 text-foreground'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        aria-pressed={selected}
                      >
                        {v === 1 && 'Nada'}
                        {v === 2 && 'Poco'}
                        {v === 3 && 'A veces'}
                        {v === 4 && 'Bastante'}
                        {v === 5 && 'Mucho'}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-end">
            <Button
              size="lg"
              disabled={
                completeMutation.isPending ||
                Object.keys(responses).length < questionsQuery.data.questions.length
              }
              onClick={() => {
                completeMutation.mutate(assessmentId);
              }}
            >
              {completeMutation.isPending ? 'Calculando…' : 'Ver mis resultados'}
            </Button>
          </div>
        </section>
      ) : null}

      <div className="mt-10 text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">← Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}

export function CivicAssessment() {
  return (
    <RequireAuth>
      <CivicInner />
    </RequireAuth>
  );
}

export default CivicAssessment;
