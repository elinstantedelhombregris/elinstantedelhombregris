/**
 * El Mandato Vivo — public face of the pulse system.
 *
 * Anyone (auth or anon) can submit a pulso signal. Reads:
 *   - GET /api/pulso (recent signals feed)
 *   - GET /api/propuestas?status=voting (top proposals leaderboard)
 *
 * Writes:
 *   - POST /api/pulso (anon-allowed; in the CSRF allow-list)
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';

interface Signal {
  id: number;
  body: string;
  theme: string | null;
  sentiment: number | null;
  createdAt: string;
}

interface Proposal {
  id: number;
  title: string;
  summary: string;
  voteScore: number;
  voteCount: number;
}

interface SubmitResponse {
  id: number;
}

export function ElMandatoVivo() {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const signalsQuery = useQuery<Signal[]>({
    queryKey: ['pulso', 'recent'],
    queryFn: () => api.get<Signal[]>('/api/pulso?limit=50'),
  });

  const proposalsQuery = useQuery<Proposal[]>({
    queryKey: ['propuestas', 'voting'],
    queryFn: () => api.get<Proposal[]>('/api/propuestas?status=voting&limit=10'),
  });

  const submitMutation = useMutation<SubmitResponse>({
    mutationFn: async () =>
      api.post<SubmitResponse>('/api/pulso', { body, source: 'mandato_form' }),
    onSuccess: () => {
      setBody('');
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ['pulso'] });
    },
  });

  const signals = signalsQuery.data ?? [];
  const proposals = (proposalsQuery.data ?? []).slice(0, 3);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          El Mandato Vivo
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Lo que la red dice,</span><br />
          <span className="gradient-text">en tiempo real.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Cada pulso es una señal. Las señales se vuelven temas. Los temas se vuelven propuestas.
          Sin filtros editoriales, sin curaduría política — sólo la voz que la red emite.
        </p>
      </header>

      <section className="glass mb-12 rounded-2xl p-8">
        <h2 className="mb-2 font-serif text-2xl font-semibold">Mandá tu señal</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Una frase, un párrafo, lo que sea. Vamos a clasificar tu señal y sumarla al mapa colectivo.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) submitMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="pulse-body">¿Qué querés que se sepa?</Label>
            <textarea
              id="pulse-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setSubmitted(false);
              }}
              placeholder="Lo que pienses, lo que sientas, lo que necesites."
              className="min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={2000}
              required
            />
          </div>
          <Button type="submit" disabled={submitMutation.isPending || !body.trim()}>
            {submitMutation.isPending ? 'Enviando…' : 'Enviar señal'}
          </Button>
          {submitted ? (
            <p className="text-sm text-green-400">Tu señal quedó registrada. Gracias.</p>
          ) : null}
        </form>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-serif text-xl font-semibold">Señales recientes</h2>
          {signals.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">Aún sin señales.</p>
          ) : (
            <ul className="space-y-3">
              {signals.slice(0, 12).map((s) => (
                <li key={s.id} className="rounded-md border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">{s.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {s.theme ? (
                      <span className="rounded-full bg-iris-violet/10 px-2 py-0.5 text-iris-violet">
                        {s.theme}
                      </span>
                    ) : null}
                    {s.sentiment !== null ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5">
                        {s.sentiment > 0.2
                          ? 'positivo'
                          : s.sentiment < -0.2
                            ? 'negativo'
                            : 'neutro'}
                      </span>
                    ) : null}
                    <time dateTime={s.createdAt}>
                      {new Date(s.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold">Propuestas en votación</h2>
          {proposals.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">Aún sin propuestas.</p>
          ) : (
            <ul className="space-y-4">
              {proposals.map((p, i) => (
                <li key={p.id}>
                  <div className="text-xs font-mono text-muted-foreground">#{i + 1}</div>
                  <div className="font-medium">{p.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {p.voteCount} votos · {p.voteScore > 0 ? '+' : ''}
                    {p.voteScore}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}

export default ElMandatoVivo;
