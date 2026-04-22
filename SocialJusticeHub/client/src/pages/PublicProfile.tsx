import { useEffect, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { MapPin, Award, Calendar, Target, Flame, Sparkles, Trophy, ArrowLeft, User as UserIcon } from 'lucide-react';

import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PublicProfileData = {
  user: {
    id: number;
    username: string;
    name: string;
    location: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string | null;
  };
  stats: {
    level: number;
    points: number;
    rank: number | null;
    streak: number;
    experience: number;
    experienceToNext: number;
    initiativesCount: number;
    badgesCount: number;
  };
  posts: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    location: string;
    status: string | null;
    likesCount: number | null;
    createdAt: string | null;
  }>;
  badges: Array<{
    id: number;
    name: string;
    description: string;
    iconName: string;
    category: string;
    rarity: string;
    earnedAt: string | null;
  }>;
};

type TabKey = 'iniciativas' | 'insignias' | 'actividad';

const rarityStyles: Record<string, string> = {
  legendary: 'border-yellow-400/40 bg-yellow-400/5 text-yellow-200',
  epic: 'border-purple-400/40 bg-purple-400/5 text-purple-200',
  rare: 'border-sky-400/40 bg-sky-400/5 text-sky-200',
  common: 'border-white/10 bg-white/5 text-slate-200',
};

function formatMemberSince(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

const PublicProfile = () => {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? '';
  const [, setLocation] = useLocation();
  const userContext = useContext(UserContext);
  const [tab, setTab] = useState<TabKey>('iniciativas');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/users/${encodeURIComponent(username)}/profile`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('not-found');
        throw new Error('error');
      }
      const json = await res.json();
      return json.data as PublicProfileData;
    },
    enabled: !!username,
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      document.title = `${data.user.name} (@${data.user.username}) | La Hermandad`;
    }
  }, [data]);

  const isOwnProfile = !!userContext?.user && userContext.user.username === username;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <FluidBackground className="opacity-30" />
        <Header />
        <main className="relative z-10 pt-32 pb-20 container-content">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/5 rounded-2xl" />
            <div className="h-48 bg-white/5 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    const notFound = error instanceof Error && error.message === 'not-found';
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <FluidBackground className="opacity-30" />
        <Header />
        <main className="relative z-10 pt-32 pb-20 container-content">
          <GlassCard className="p-12 text-center max-w-xl mx-auto">
            <UserIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              {notFound ? 'Perfil no encontrado' : 'No pudimos cargar el perfil'}
            </h1>
            <p className="text-slate-400 mb-6">
              {notFound
                ? `No existe nadie con el usuario @${username}.`
                : 'Intentá de nuevo en unos segundos.'}
            </p>
            <Button
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              onClick={() => setLocation('/community')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a La Hermandad
            </Button>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, stats, posts, badges } = data;
  const initials = (user.name || user.username || '?').charAt(0).toUpperCase();
  const xpDenom = (stats.experience || 0) + (stats.experienceToNext || 1);
  const xpProgress = Math.min(100, Math.round(((stats.experience || 0) / xpDenom) * 100));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 font-sans relative overflow-hidden">
      <FluidBackground className="opacity-30" />
      <Header />

      <main className="relative z-10 pt-24 pb-20">
        <div className="container-content">
          <button
            onClick={() => setLocation('/community')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-mono tracking-wider uppercase mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> La Hermandad
          </button>

          {/* HERO DEL PERFIL */}
          <GlassCard className="p-6 md:p-10 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 border-2 border-white/15 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl md:text-5xl font-bold text-white">{initials}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white truncate">{user.name}</h1>
                  {stats.rank ? (
                    <Badge className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-200 font-mono">
                      <Trophy className="w-3 h-3 mr-1" /> {stats.rank}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mb-4">
                  <span className="font-mono text-slate-500">@{user.username}</span>
                  {user.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {user.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Miembro desde {formatMemberSince(user.createdAt)}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-slate-300 leading-relaxed max-w-3xl mb-4">
                    {user.bio}
                  </p>
                )}

                {/* XP progress */}
                <div className="max-w-md space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Nivel {stats.level}</span>
                    <span>{(stats.experience || 0).toLocaleString('es-AR')} / {xpDenom.toLocaleString('es-AR')} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => setLocation('/profile')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  >
                    Editar mi perfil
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={<Sparkles className="w-5 h-5 text-blue-400" />} value={stats.points.toLocaleString('es-AR')} label="XP totales" />
            <StatCard icon={<Target className="w-5 h-5 text-emerald-400" />} value={stats.initiativesCount} label="Iniciativas" />
            <StatCard icon={<Award className="w-5 h-5 text-yellow-400" />} value={stats.badgesCount} label="Insignias" />
            <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} value={stats.streak} label="Días de racha" />
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/5">
            {([
              { key: 'iniciativas', label: 'Iniciativas', count: posts.length },
              { key: 'insignias', label: 'Insignias', count: badges.length },
              { key: 'actividad', label: 'Actividad', count: null as number | null },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-4 py-3 text-sm font-mono tracking-[0.15em] uppercase transition-all border-b-2 -mb-px',
                  tab === t.key
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                )}
              >
                {t.label}
                {typeof t.count === 'number' && (
                  <span className="ml-2 text-xs text-slate-500">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {tab === 'iniciativas' && (
            <div>
              {posts.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Todavía no lanzó iniciativas.</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setLocation(`/community/${p.id}`)}
                      className="text-left p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {p.type}
                        </span>
                        {p.status && p.status !== 'active' && (
                          <span className="text-[10px] font-mono tracking-wider uppercase text-orange-300 px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20">
                            {p.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{p.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {p.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>}
                        {typeof p.likesCount === 'number' && p.likesCount > 0 && (
                          <span>❤ {p.likesCount}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'insignias' && (
            <div>
              {badges.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Todavía no ganó insignias.</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        'p-4 rounded-xl border backdrop-blur-md',
                        rarityStyles[b.rarity] ?? rarityStyles.common
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold truncate">{b.name}</h4>
                          </div>
                          <p className="text-xs opacity-80 line-clamp-2">{b.description}</p>
                          <div className="mt-2 text-[10px] font-mono uppercase tracking-wider opacity-60">
                            {b.rarity} · {b.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'actividad' && (
            <GlassCard className="p-10 text-center">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">El timeline de actividad pública estará disponible próximamente.</p>
            </GlassCard>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">{label}</div>
    </div>
  );
}

export default PublicProfile;
