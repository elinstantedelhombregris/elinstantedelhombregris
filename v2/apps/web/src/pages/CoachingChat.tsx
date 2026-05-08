import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';

interface Session {
  id: number;
  title: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface SessionsResponse {
  sessions: Session[];
}
interface SessionDetailResponse {
  session: Session;
  messages: Message[];
}

function CoachingInner() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const sessionsQuery = useQuery<SessionsResponse>({
    queryKey: ['coaching', 'sessions'],
    queryFn: () => api.get<SessionsResponse>('/api/coaching/sessions'),
  });

  const sessionQuery = useQuery<SessionDetailResponse>({
    queryKey: ['coaching', 'sessions', activeId],
    queryFn: () => api.get<SessionDetailResponse>(`/api/coaching/sessions/${String(activeId)}`),
    enabled: activeId !== null,
  });

  const startMutation = useMutation({
    mutationFn: async () => api.post<{ session: Session }>('/api/coaching/sessions', {}, { csrfToken: readCsrfToken() }),
    onSuccess: (data) => {
      setActiveId(data.session.id);
      void queryClient.invalidateQueries({ queryKey: ['coaching', 'sessions'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) =>
      api.post<{ message: Message }>(`/api/coaching/sessions/${String(id)}/messages`, { content }, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['coaching', 'sessions', activeId] });
    },
  });

  const sessions = sessionsQuery.data?.sessions ?? [];
  const messages = sessionQuery.data?.messages ?? [];

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Coaching</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Pensá en voz alta. Te acompañamos.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Coach reflexivo en rioplatense. Hace más preguntas que respuestas.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <Button
            disabled={startMutation.isPending}
            onClick={() => {
              startMutation.mutate();
            }}
            className="w-full"
            size="sm"
          >
            {startMutation.isPending ? 'Creando…' : 'Nueva sesión'}
          </Button>
          <ul className="space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(s.id);
                  }}
                  className={`w-full rounded-md p-3 text-left text-sm transition-colors ${
                    s.id === activeId ? 'bg-iris-violet/15 text-foreground' : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                >
                  <p className="truncate">{s.title ?? `Sesión ${String(s.id)}`}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="glass flex min-h-[60vh] flex-col rounded-2xl p-6">
          {activeId === null ? (
            <p className="m-auto text-sm text-muted-foreground">
              Empezá una sesión nueva o elegí una de la lista.
            </p>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {messages.length === 0 && !sendMutation.isPending ? (
                  <p className="text-sm text-muted-foreground">
                    Escribí lo que tengas en la cabeza. Te respondo con preguntas para pensarlo.
                  </p>
                ) : null}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-xl p-4 ${
                      m.role === 'user'
                        ? 'ml-auto bg-iris-violet/15'
                        : 'bg-white/5'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {m.role === 'user' ? 'vos' : 'coach'}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{m.content}</p>
                  </div>
                ))}
                {sendMutation.isPending ? (
                  <div className="max-w-[85%] rounded-xl bg-white/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">coach</p>
                    <p className="mt-1 text-sm text-muted-foreground">pensando…</p>
                  </div>
                ) : null}
              </div>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) {
                    sendMutation.mutate({ id: activeId, content: draft });
                  }
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                  }}
                  placeholder="Escribí algo…"
                  className="min-h-[60px] flex-1 rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={sendMutation.isPending || !draft.trim()}
                  className="self-end"
                >
                  Enviar
                </Button>
              </form>
            </>
          )}
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">← Volver al inicio</Link>
      </p>
    </main>
  );
}

export function CoachingChat() {
  return (
    <RequireAuth>
      <CoachingInner />
    </RequireAuth>
  );
}

export default CoachingChat;
