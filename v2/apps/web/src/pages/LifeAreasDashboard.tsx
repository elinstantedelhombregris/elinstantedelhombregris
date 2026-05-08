import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { RequireAuth } from '~/lib/auth';

interface LifeArea {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconName: string | null;
  accentColor: string | null;
  orderIndex: number;
}

interface UserState {
  id: number;
  lifeAreaId: number;
  currentScore: number;
  desiredScore: number;
  gap: number;
}

interface AreasResponse {
  areas: LifeArea[];
}
interface StateResponse {
  state: UserState[];
}

function DashboardInner() {
  const areasQuery = useQuery<AreasResponse>({
    queryKey: ['life-areas'],
    queryFn: () => api.get<AreasResponse>('/api/life-areas'),
  });
  const stateQuery = useQuery<StateResponse>({
    queryKey: ['life-areas', 'me', 'state'],
    queryFn: () => api.get<StateResponse>('/api/life-areas/me/state'),
  });

  const isLoading = areasQuery.isLoading || stateQuery.isLoading;
  const areas = areasQuery.data?.areas ?? [];
  const stateById = new Map((stateQuery.data?.state ?? []).map((s) => [s.lifeAreaId, s]));

  return (
    <main className="container mx-auto max-w-6xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">12 áreas de tu vida</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Empezá tomando el quiz de cualquier área para ver dónde estás y dónde querés estar. Cada área tiene
          5 subcategorías y se mide en una escala 0-10.
        </p>
      </header>

      {isLoading ? (
        <p className="font-mono text-sm text-muted-foreground">cargando…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const state = stateById.get(area.id);
            const score = state?.currentScore ?? 0;
            const desired = state?.desiredScore ?? 0;
            const gap = state?.gap ?? 0;
            return (
              <li key={area.id}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="glass block h-full rounded-2xl p-6 transition-colors hover:border-iris-violet/50"
                >
                  <p className={area.accentColor ?? 'text-foreground'}>
                    <span className="font-mono text-xs uppercase tracking-widest">{area.slug}</span>
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-semibold">{area.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{area.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <span>
                      <span className="text-muted-foreground">ahora </span>
                      <span className="font-semibold text-foreground">{Math.round(score / 10)}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">querés </span>
                      <span className="font-semibold text-foreground">{Math.round(desired / 10)}</span>
                    </span>
                    {gap > 0 ? (
                      <span className="ml-auto rounded-full bg-iris-violet/10 px-2 py-0.5 text-iris-violet">
                        gap +{Math.round(gap / 10)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 text-center">
        <Button asChild variant="secondary">
          <Link href="/">← Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}

export function LifeAreasDashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

export default LifeAreasDashboard;
