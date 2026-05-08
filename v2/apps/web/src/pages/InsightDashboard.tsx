import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { api } from '~/lib/api';

interface Summary {
  users: number;
  iniciativas: number;
  dreams: number;
  pulseSignals: number;
  communityPosts: number;
  blogPosts: number;
  generatedAt: string;
}

interface ByCategory {
  category: string;
  count: number;
}

export function InsightDashboard() {
  const summaryQuery = useQuery<Summary>({
    queryKey: ['analytics', 'summary'],
    queryFn: () => api.get<Summary>('/api/analytics/convergence-summary'),
  });

  const dreamsQuery = useQuery<{ byCategory: ByCategory[] }>({
    queryKey: ['analytics', 'dreams-by-category'],
    queryFn: () => api.get<{ byCategory: ByCategory[] }>('/api/analytics/dreams-by-category'),
  });

  const summary = summaryQuery.data;
  const byCategory = dreamsQuery.data?.byCategory ?? [];

  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tablero</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">¿Cómo va la red?</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Un resumen público de lo que está pasando en la plataforma. Todos los números agregados — sin
          datos personales.
        </p>
      </header>

      {summaryQuery.isLoading ? (
        <p className="font-mono text-sm text-muted-foreground">cargando…</p>
      ) : summary ? (
        <>
          <section className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Personas activas', value: summary.users },
              { label: 'Iniciativas', value: summary.iniciativas },
              { label: 'Sueños', value: summary.dreams },
              { label: 'Señales de pulso', value: summary.pulseSignals },
              { label: 'Posts comunidad', value: summary.communityPosts },
              { label: 'Posts blog', value: summary.blogPosts },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-3xl font-semibold">{stat.value.toLocaleString('es-AR')}</p>
              </div>
            ))}
          </section>

          {byCategory.length > 0 ? (
            <section className="glass rounded-2xl p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold">Sueños por categoría</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="category" stroke="hsl(220 5% 65%)" fontSize={12} />
                    <YAxis stroke="hsl(220 5% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(20,20,20,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" fill="#7D5BDE" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ) : (
            <section className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Todavía no hay sueños categorizados para mostrar el desglose.
            </section>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Generado: {new Date(summary.generatedAt).toLocaleString('es-AR')}
          </p>
        </>
      ) : null}
    </main>
  );
}

export default InsightDashboard;
