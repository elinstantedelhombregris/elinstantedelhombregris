import { useState, useEffect, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Users, Target, Sparkles, MapPin,
  Zap, Trophy, Bell, Flame, Award, ShieldCheck
} from 'lucide-react';

import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TribalPulse from '@/components/TribalPulse';
import FluidBackground from '@/components/ui/FluidBackground';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShockStats from '@/components/ShockStats';
import MisionesSection from '@/components/community/MisionesSection';
import ComunidadSection from '@/components/community/ComunidadSection';

type CommunityPost = {
  id: number;
  title: string;
  description: string;
  type: 'employment' | 'exchange' | 'volunteer' | 'project' | 'donation' | 'story' | 'action' | 'idea' | 'question' | 'mission';
  missionSlug?: string;
  location: string;
  memberCount?: number;
  participants?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'paused' | 'closed';
  tags?: string[];
  likesCount?: number;
  viewsCount?: number;
  likedByMe?: boolean;
  author?: {
    name: string;
    username: string;
  };
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const Community = () => {
  const userContext = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [showMyMemberships, setShowMyMemberships] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [section, setSection] = useState<'misiones' | 'comunidad'>('misiones');

  // New Post State
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    type: 'project' as const,
    location: '',
    participants: '',
    tags: '',
    latitude: '',
    longitude: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Los Círculos - Comunidad de Reconstrucción | ¡BASTA!';
  }, []);

  // === DATA QUERIES ===

  const { data: posts = [] } = useQuery({
    queryKey: ['community-posts', debouncedSearch, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.set('type', selectedType);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const response = await apiRequest('GET', `/api/community?${params.toString()}`);
      if (response.ok) return response.json();
      return [];
    },
  });

  const { data: missionPosts = [] } = useQuery({
    queryKey: ['mission-posts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/community?type=mission');
      if (response.ok) return response.json();
      return [];
    },
  });

  const { data: missionStatsData = [] } = useQuery({
    queryKey: ['mission-stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/missions');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 300000,
  });

  // Real community stats
  const { data: statsData } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/stats');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 300000,
  });

  const communityStats = useMemo(() => [
    {
      id: 'members',
      label: 'Miembros Activos',
      value: statsData?.activeMembers || 0,
      unit: '',
      color: 'blue' as const,
      icon: <Users className="w-5 h-5" />,
      description: 'Ciudadanos despiertos'
    },
    {
      id: 'projects',
      label: 'Proyectos Vivos',
      value: statsData?.totalPosts || 0,
      unit: '',
      color: 'purple' as const,
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Transformando realidad'
    },
    {
      id: 'impact',
      label: 'Acciones Realizadas',
      value: statsData?.totalDreams || 0,
      unit: '+',
      color: 'green' as const,
      icon: <Target className="w-5 h-5" />,
      description: 'Impacto directo'
    },
  ], [statsData]);

  // Leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/leaderboard?type=global&limit=5');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 300000,
  });

  // User stats (only when logged in)
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/stats');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userContext?.user,
    staleTime: 60000,
  });

  // Mi Círculo data (only when logged in)
  const { data: myPosts = [] } = useQuery({
    queryKey: ['community-my-posts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/community/my-posts');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userContext?.user,
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['community-my-memberships'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/community/my-memberships');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userContext?.user,
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/notifications/unread-count');
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: !!userContext?.user,
    refetchInterval: 60000,
  });

  const { data: notificationsList = [] } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/notifications');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userContext?.user && showNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    }
  });

  // === MUTATIONS ===

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/community', postData);
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed-pulse'] });
      setShowCreateModal(false);
      setNewPost({ title: '', description: '', type: 'project', location: '', participants: '', tags: '', latitude: '', longitude: '' });
      toast({
        title: "Iniciativa lanzada",
        description: "Tu iniciativa ya esta visible para la tribu.",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear la iniciativa.", variant: "destructive" });
    },
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewPost({
          ...newPost,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
        setIsGettingLocation(false);
        toast({
          title: "Ubicación obtenida",
          description: "Tu ubicación ha sido agregada a la iniciativa",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleCreatePost = () => {
    if (!userContext?.user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para crear iniciativas",
        variant: "destructive",
      });
      return;
    }

    const postData: any = {
      ...newPost,
      participants: newPost.participants ? parseInt(newPost.participants) : null,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (newPost.latitude && newPost.longitude) {
      postData.latitude = parseFloat(newPost.latitude);
      postData.longitude = parseFloat(newPost.longitude);
    }

    createPostMutation.mutate(postData);
  };

  const postTypes = [
    { value: 'all', label: 'Todo el Flujo', icon: <Users className="w-4 h-4" /> },
    { value: 'project', label: 'Proyectos', icon: <Target className="w-4 h-4" /> },
    { value: 'action', label: 'Acciones', icon: <Zap className="w-4 h-4" /> },
    { value: 'exchange', label: 'Intercambios', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const ayudaCompartirPost = posts.find((p: CommunityPost) =>
    p.title === 'Ayuda a compartir ¡BASTA!' && p.type === 'action'
  ) || null;

  // Leaderboard helpers
  const leaderboard = leaderboardData?.data || [];
  const xpProgress = userStats
    ? Math.min(100, Math.round((userStats.experience / (userStats.experience + userStats.experienceToNext)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 font-sans relative overflow-hidden">
      <FluidBackground className="opacity-40" />
      <Header />

      <main className="relative z-10 pt-20">
        <TribalPulse />

        {/* HERO: The Call to Assembly */}
        <section className="relative py-32 overflow-hidden">
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <SmoothReveal direction="down">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-mono mb-8 tracking-widest uppercase backdrop-blur-md">
                  <Users className="w-4 h-4" />
                  Los Círculos de Reconstrucción
                </div>
              </SmoothReveal>

              <SmoothReveal delay={0.2}>
                <h1 className="heading-hero mb-8">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500">
                    El Ágora Viva
                  </span>
                  <span className="block text-2xl md:text-4xl font-sans font-light text-slate-400 mt-4 tracking-wide">
                    Donde la voluntad individual se hace <span className="text-blue-400">Poder Colectivo</span>
                  </span>
                </h1>
              </SmoothReveal>

              <SmoothReveal delay={0.4}>
                <p className="text-xl md:text-2xl text-slate-400/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                  Has despertado. Has sembrado. Ahora es momento de conectar.
                  <br />
                  Aquí las ideas encuentran recursos, y los líderes encuentran su tribu.
                </p>
              </SmoothReveal>

              <SmoothReveal delay={0.6}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <PowerCTA
                    text="LANZAR INICIATIVA"
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                    animate={true}
                    icon={<Sparkles className="w-5 h-5" />}
                  />
                  <PowerCTA
                    text="EXPLORAR MISIONES"
                    variant="secondary"
                    onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                    size="lg"
                    animate={true}
                    icon={<Target className="w-5 h-5" />}
                  />
                </div>
              </SmoothReveal>
            </div>
          </div>
        </section>

        {/* SHOCK STATS: Community Impact */}
        <section className="py-12 border-t border-white/5 bg-white/[0.02]">
          <div className="container-content">
            <ShockStats
              stats={communityStats}
              title="PULSO DE LA TRIBU"
              variant="dark"
            />
          </div>
        </section>

        {/* MI TRIBU: Personal Dashboard (only when logged in) */}
        {userContext?.user && (
          <section className="py-8 border-t border-white/5">
            <div className="container-content">
              <div className="flex items-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono tracking-widest uppercase">
                  <Flame className="w-3 h-3" />
                  Mi Círculo
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard
                  className={`p-4 text-center hover:bg-white/5 transition-colors cursor-pointer ${showOnlyMine ? 'ring-2 ring-blue-500/50' : ''}`}
                  onClick={() => { setShowOnlyMine(!showOnlyMine); setShowMyMemberships(false); }}
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{myPosts.length}</div>
                  <div className="text-xs text-slate-500">Mis Iniciativas</div>
                </GlassCard>

                <GlassCard
                  className={`p-4 text-center hover:bg-white/5 transition-colors cursor-pointer ${showMyMemberships ? 'ring-2 ring-purple-500/50' : ''}`}
                  onClick={() => { setShowMyMemberships(!showMyMemberships); setShowOnlyMine(false); }}
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{myMemberships.length}</div>
                  <div className="text-xs text-slate-500">Membresías</div>
                </GlassCard>

                <GlassCard className="p-4 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setShowNotifications(true)}>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-500/10 flex items-center justify-center relative">
                    <Bell className="w-5 h-5 text-orange-400" />
                    {(unreadNotifications?.count || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                        {unreadNotifications!.count}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">{unreadNotifications?.count || 0}</div>
                  <div className="text-xs text-slate-500">Notificaciones</div>
                </GlassCard>

                <GlassCard className="p-4 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setLocation('/profile')}>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{userStats?.streak || 0}</div>
                  <div className="text-xs text-slate-500">Dias de Racha</div>
                </GlassCard>
              </div>
            </div>
          </section>
        )}

        {/* SECTION NAVIGATOR */}
        <div className="sticky top-20 z-40 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/5">
          <div className="container-content flex justify-center gap-3">
            <button
              onClick={() => setSection('misiones')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all border ${
                section === 'misiones'
                  ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase">Misiones</span>
            </button>
            <button
              onClick={() => setSection('comunidad')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all border ${
                section === 'comunidad'
                  ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase">Comunidad</span>
            </button>
          </div>
        </div>

        {/* SECTION CONTENT */}
        {section === 'misiones' ? (
          <MisionesSection
            missionStatsData={missionStatsData}
            missionPosts={missionPosts}
            onNavigate={setLocation}
          />
        ) : (
          <ComunidadSection
            ayudaCompartirPost={ayudaCompartirPost}
            posts={posts}
            onNavigateToPost={(id) => setLocation(`/community/${id}`)}
            onNavigate={setLocation}
          />
        )}

        {/* HALL OF GUARDIANS */}
        <section className="py-16 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent" />
          <div className="container-content relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 text-xs font-mono mb-6 tracking-widest uppercase">
                  <Trophy className="w-3 h-3" />
                  Hall of Guardians
                </div>
                <h2 className="heading-section mb-6 text-white">
                  Líderes del Despertar
                </h2>
                <p className="text-slate-400 leading-relaxed mb-8">
                  Reconocemos a quienes transforman la realidad con acciones consistentes. Su impacto es el faro que guía a la tribu.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {leaderboard.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                      <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500">Todavia no hay lideres en el ranking.</p>
                      <p className="text-slate-600 text-sm mt-1">Se el primero en escalar.</p>
                    </GlassCard>
                  ) : (
                    leaderboard.map((entry: any, idx: number) => (
                      <GlassCard key={entry.userId} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          idx === 1 ? 'bg-slate-400/20 text-slate-300 border-slate-400/50' :
                          idx === 2 ? 'bg-orange-700/20 text-orange-400 border-orange-700/50' :
                          'bg-white/10 text-slate-400 border-white/20'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold">{entry.user?.name || 'Anonimo'}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                            <Award className="w-3 h-3" /> Nivel {entry.level || 1}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">{(entry.points || 0).toLocaleString()}</div>
                          <div className="text-xs text-slate-500 uppercase">XP</div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>

              {/* My Stats Card */}
              <div className="w-full md:w-96">
                <GlassCard className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border-blue-500/20">
                  <div className="text-center p-6 border-b border-white/5">
                    <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full mb-4 flex items-center justify-center border-2 border-blue-500/30">
                      <span className="text-2xl font-bold text-white">
                        {userContext?.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg">Tu Legado</h3>
                    <p className="text-slate-400 text-sm">
                      {userContext?.user ? userContext.user.username : 'Inicia sesion para ver tu progreso'}
                    </p>
                  </div>
                  {userContext?.user && userStats ? (
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Nivel Actual</span>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Nivel {userStats.level || 1}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Progreso a Nivel {(userStats.level || 1) + 1}</span>
                          <span>{userStats.experience || 0} / {(userStats.experience || 0) + (userStats.experienceToNext || 1000)} XP</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${xpProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{userStats.streak || 0}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Racha</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{userStats.badgesEarned || 0}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Insignias</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{userStats.completedChallenges || 0}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Desafios</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-slate-500 text-sm mb-4">Inicia sesion para desbloquear tu perfil de impacto.</p>
                      <Button
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        onClick={() => setLocation('/login')}
                      >
                        Iniciar Sesion
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          </div>
        </section>


      </main>
      <Footer />

      {/* NOTIFICATIONS MODAL */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-[500px] bg-[#0f1116] border border-white/10 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Notificaciones</DialogTitle>
            <DialogDescription className="text-slate-400">
              Mantente al día con la actividad de tus iniciativas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notificationsList.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No hay notificaciones</p>
            ) : (
              notificationsList.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${notif.read ? 'bg-white/3 border-white/5' : 'bg-blue-500/5 border-blue-500/20'} cursor-pointer`}
                  onClick={() => { if (notif.postId) { setShowNotifications(false); setLocation(`/community/${notif.postId}`); } }}
                >
                  <p className="text-sm font-medium text-white">{notif.title}</p>
                  <p className="text-xs text-slate-400">{notif.content}</p>
                  <p className="text-xs text-slate-600 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          {notificationsList.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                Marcar todas leídas
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE MODAL - Dark Theme */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] bg-[#0f1116] border border-white/10 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-white">Lanzar Iniciativa</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define tu misión y convoca a la tribu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Título de la Misión</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Ej: Red de Huertas Comunitarias"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tipo de Acción</label>
                <Select value={newPost.type} onValueChange={(v: any) => setNewPost({ ...newPost, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1116] border-white/10 text-slate-200">
                    {postTypes.filter(t => t.value !== 'all').map(t => (
                      <SelectItem key={t.value} value={t.value} className="focus:bg-white/10 focus:text-white">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Base de Operaciones</label>
                <Input
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  placeholder="Ciudad, Provincia"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-400">Geolocalización (Opcional)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="border-white/10 hover:bg-white/10 text-slate-300"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isGettingLocation ? 'Obteniendo...' : 'Usar mi ubicación'}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Agrega coordenadas para que tu iniciativa aparezca en el mapa
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Latitud</label>
                  <Input
                    type="number"
                    step="any"
                    value={newPost.latitude}
                    onChange={(e) => setNewPost({ ...newPost, latitude: e.target.value })}
                    placeholder="-34.6037"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Longitud</label>
                  <Input
                    type="number"
                    step="any"
                    value={newPost.longitude}
                    onChange={(e) => setNewPost({ ...newPost, longitude: e.target.value })}
                    placeholder="-58.3816"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Manifiesto / Descripción</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                placeholder="Describe el impacto que buscas generar..."
                rows={4}
                className="w-full p-3 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Abortar
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending || !newPost.title.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {createPostMutation.isPending ? 'Lanzando...' : 'Lanzar Misión'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
