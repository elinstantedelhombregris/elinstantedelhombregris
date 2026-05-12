import { Redirect } from 'wouter';


import { ActivitySection } from './sections/ActivitySection';
import { BadgesSection } from './sections/BadgesSection';
import { HeaderSection } from './sections/HeaderSection';

import { useAuth } from '~/lib/auth';
import { useGamificationMe } from '~/lib/queries/gamification';

export default function MiPerfil() {
  const { user, isLoading } = useAuth();
  const { data, isLoading: meLoading } = useGamificationMe(Boolean(user));

  if (isLoading || meLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Cargando…</div>;
  }
  if (!user) return <Redirect to="/ingresar" />;
  if (!data) {
    return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">No pudimos cargar tu perfil.</div>;
  }

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <HeaderSection data={data} displayName={user.name} />
      <BadgesSection badges={data.badges} />
      <ActivitySection items={data.recentActivity} />
    </main>
  );
}
