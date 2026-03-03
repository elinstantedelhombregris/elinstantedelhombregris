import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  Star, 
  TrendingUp,
  Flame,
  Zap,
  BookOpen,
  Award,
  Crown,
  BarChart3,
  ArrowRight,
  Radar,
  Activity,
  ShieldCheck,
  Cpu,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  streak: number;
  completedChallenges: number;
  totalChallenges: number;
  badgesEarned: number;
  lastActivity?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  level: number;
  frequency: string;
  difficulty: string;
  experience: number;
  duration: string;
  iconName: string;
}

interface UserBadge {
  id: number;
  badge: {
    name: string;
    description: string;
    iconName: string;
    rarity: string;
  };
  earnedAt: string;
}

const UserDashboard = () => {
  const userContext = useContext(UserContext);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);

  useEffect(() => {
    if (!userContext?.user) {
      const timer = setTimeout(() => {
        setAuthCheckTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userContext?.user]);

  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/stats');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          if (userContext) userContext.setUser(null);
          throw new Error(`Authentication failed: ${response.status}`);
        }
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/challenges');
      if (!response.ok) throw new Error(`Failed to fetch challenges: ${response.status}`);
      return response.json();
    },
    staleTime: 60000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { data: userBadges = [], isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ['/api/user/badges'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/badges');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          if (userContext) userContext.setUser(null);
          throw new Error(`Authentication failed: ${response.status}`);
        }
        throw new Error(`Failed to fetch badges: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 60000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!userContext?.user) {
    if (authCheckTimeout) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-blue-500/50 animate-pulse" />
            <h2 className="text-xl font-serif text-slate-100">Acceso restringido</h2>
            <p className="text-slate-500 mt-2 font-mono text-sm">Iniciá sesión para entrar a tu panel de progreso.</p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50" onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-blue-400 font-mono text-sm tracking-widest">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  const isAuthError = statsError?.message?.includes('401') || statsError?.message?.includes('Unauthorized');
  if (isAuthError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400">Sesión expirada</h2>
          <Button className="mt-4 bg-slate-800 hover:bg-slate-700 text-white" onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}>Reconectar</Button>
        </div>
      </div>
    );
  }

  const isLoadingCriticalData = statsLoading && userContext?.isLoggedIn;
  if (isLoadingCriticalData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-blue-400 font-mono text-sm tracking-widest">Cargando panel...</p>
        </div>
      </div>
    );
  }

  const { user } = userContext;
  const progressPercentage = userStats ? (userStats.experience / userStats.experienceToNext) * 100 : 0;
  const availableChallenges = challenges.filter(c => c.level <= (userStats?.level || 1));

  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Consciencia Individual', color: 'text-blue-400', glow: 'shadow-blue-500/50', icon: User };
      case 2: return { name: 'Núcleo Familiar', color: 'text-amber-400', glow: 'shadow-amber-500/50', icon: Users };
      case 3: return { name: 'Impacto Comunitario', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', icon: BookOpen };
      case 4: return { name: 'Liderazgo Provincial', color: 'text-purple-400', glow: 'shadow-purple-500/50', icon: TrendingUp };
      case 5: return { name: 'Visión Nacional', color: 'text-indigo-400', glow: 'shadow-indigo-500/50', icon: Star };
      default: return { name: 'Consciencia Individual', color: 'text-blue-400', glow: 'shadow-blue-500/50', icon: User };
    }
  };

  const currentLevelInfo = getLevelInfo(userStats?.level || 1);
  const LevelIcon = currentLevelInfo.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      <Header />
      
      {/* Hero Section: Control Tower Header - Cinematic */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-8"
            >
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white/5 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:border-blue-500/50 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500">
                   <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" />
                    <AvatarFallback className="bg-slate-900 text-slate-400 font-bold text-3xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-[#0a0a0a] shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" title="Sistema Activo"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
                    PANEL DE {user.name.toUpperCase()}
                  </h1>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    ACTIVO
                  </Badge>
                </div>
                <p className="text-blue-400/80 font-mono text-xs uppercase tracking-[0.2em] mb-4">
                  Última actualización // {new Date().toLocaleTimeString()}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">NV. {userStats?.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">{userStats?.experience || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-slate-300">{userStats?.badgesEarned || 0} LOGROS</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-auto"
            >
               <Link href="/life-areas">
                <Button className="w-full md:w-auto h-12 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 font-bold tracking-wide">
                  <Activity className="mr-2 h-4 w-4 animate-pulse" />
                  VER ÁREAS DE VIDA
                </Button>
               </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal: Sistemas Críticos */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Estado de progreso */}
            <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="transition-all">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardHeader className="pb-4 border-b border-white/5 relative z-10">
                  <CardTitle className="flex items-center text-lg font-bold text-slate-100 uppercase tracking-wider">
                    <Cpu className="h-5 w-5 mr-3 text-blue-400" />
                    Estado de Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className={`w-20 h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-blue-500/30 transition-colors duration-500 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${currentLevelInfo.color.replace('text-', 'from-')}/20 to-transparent opacity-20`}></div>
                        <LevelIcon className={`h-8 w-8 ${currentLevelInfo.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold ${currentLevelInfo.color} font-serif tracking-tight drop-shadow-sm`}>{currentLevelInfo.name}</h3>
                        <p className="text-sm text-slate-400 font-mono mt-1">
                          PRÓXIMO NIVEL: <span className="text-slate-200 font-bold">{(userStats?.experienceToNext || 500) - (userStats?.experience || 0)} XP</span> REQUERIDOS
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pt-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                        <span>Progreso Actual</span>
                        <span className="text-blue-400">{Math.round(progressPercentage)}% Completado</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-500 relative"
                        >
                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mapa personal de áreas de vida */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} className="transition-all">
              <Card className="border-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[#0f1115] text-white rounded-xl relative overflow-hidden group cursor-pointer border-l-4 border-l-emerald-500">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>
                <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="flex items-center text-lg font-bold uppercase tracking-wider text-emerald-100">
                    <Radar className="h-5 w-5 mr-3 text-emerald-400 animate-[spin_10s_linear_infinite]" />
                    Mapa Personal de Áreas de Vida
                  </CardTitle>
                  <CardDescription className="text-emerald-400/60 text-xs font-mono mt-1 tracking-widest">
                    ESTADO: LISTO PARA DIAGNÓSTICO
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pt-4">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-4">
                      <p className="text-slate-300 text-sm font-light leading-relaxed max-w-xl">
                        Revisá tu diagnóstico para calibrar las <strong className="text-white font-medium">12 áreas fundamentales</strong> de tu vida. Identificá brechas, definí objetivos y ejecutá mejoras concretas.
                      </p>
                      <div className="flex gap-3">
                        <div className="bg-emerald-500/10 rounded px-3 py-1.5 border border-emerald-500/20 backdrop-blur-sm">
                          <span className="block text-[9px] text-emerald-300/70 uppercase tracking-wider">Áreas Activas</span>
                          <span className="text-base font-mono text-emerald-300 font-bold">12</span>
                        </div>
                        <div className="bg-amber-500/10 rounded px-3 py-1.5 border border-amber-500/20 backdrop-blur-sm">
                          <span className="block text-[9px] text-amber-300/70 uppercase tracking-wider">Diagnóstico</span>
                          <span className="text-base font-mono text-amber-300 font-bold">DISPONIBLE</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-auto">
                      <Link href="/life-areas">
                        <Button className="w-full md:w-auto bg-white text-slate-950 hover:bg-emerald-50 font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all group-hover:scale-105 h-12 px-8 rounded-lg">
                          ABRIR PANEL
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Desafíos Activos */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-lg font-bold text-slate-100 uppercase tracking-wider">
                        <Target className="h-5 w-5 mr-3 text-purple-400" />
                        Desafíos Disponibles
                      </CardTitle>
                      <CardDescription className="font-mono text-xs text-slate-500 mt-1">
                        PRÁCTICAS DISPONIBLES SEGÚN TU NIVEL
                      </CardDescription>
                    </div>
                    <Link href="/challenges">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 text-[10px] uppercase tracking-wider font-bold"
                      >
                        VER TODAS
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {challengesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse text-slate-500 font-mono text-xs">CARGANDO DESAFÍOS...</div>
                      </div>
                    ) : availableChallenges.length > 0 ? (
                      <>
                        {availableChallenges.slice(0, 3).map((challenge, idx) => (
                          <motion.div 
                            key={challenge.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white/5 border border-white/5 rounded-lg p-4 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center text-purple-400 border border-white/10 group-hover:border-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
                                  <Target className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-1 group-hover:text-purple-300 transition-colors">{challenge.title}</h3>
                                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{challenge.frequency}</span>
                                    <span className="text-emerald-400 font-bold">+{challenge.experience} XP</span>
                                  </div>
                                </div>
                              </div>
                              <Link href={`/challenges/${challenge.id}`}>
                                <Button size="sm" variant="outline" className="bg-transparent border-white/20 text-slate-300 hover:bg-purple-500/20 hover:text-purple-200 hover:border-purple-500/50 text-xs uppercase font-bold tracking-wider">
                                  Empezar
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                        {availableChallenges.length > 3 && (
                          <Link href="/challenges">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                                    <Target className="h-5 w-5 text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-200 uppercase tracking-wide group-hover:text-purple-300 transition-colors">
                                      {availableChallenges.length - 3} DESAFÍOS ADICIONALES DISPONIBLES
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                      Ver catálogo completo de desafíos
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </motion.div>
                          </Link>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-10 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <Target className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 font-mono text-xs mb-4">SIN DESAFÍOS PENDIENTES</p>
                        <Link href="/challenges">
                          <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs uppercase tracking-wider">
                            EXPLORAR DESAFÍOS
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Columna lateral: indicadores */}
          <div className="space-y-8">
            
            {/* Indicadores personales */}
            <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="transition-all">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
                    Indicadores Personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-inner group hover:border-amber-500/30 transition-colors">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Racha activa</p>
                      <p className="text-3xl font-mono font-bold text-white group-hover:text-amber-400 transition-colors">{userStats?.streak || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Flame className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl text-center hover:border-blue-500/30 transition-colors group">
                      <Target className="h-4 w-4 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-[9px] uppercase text-slate-500 mb-1">Desafíos</p>
                      <p className="text-xl font-mono font-bold text-slate-200">{userStats?.completedChallenges || 0}</p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl text-center hover:border-yellow-500/30 transition-colors group">
                      <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-[9px] uppercase text-slate-500 mb-1">Logros</p>
                      <p className="text-xl font-mono font-bold text-slate-200">{userStats?.badgesEarned || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Logros Recientes (Dossier Style) */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-4 border-b border-white/5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <Award className="h-4 w-4 mr-2 text-yellow-400" />
                    Logros recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {badgesLoading ? (
                    <div className="text-center py-4">
                      <p className="text-slate-500 font-mono text-xs animate-pulse">Cargando logros...</p>
                    </div>
                  ) : userBadges.length > 0 ? (
                    <div className="space-y-4">
                      {userBadges.slice(0, 5).map((userBadge, idx) => (
                        <motion.div 
                          key={userBadge.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0"
                        >
                          <div className="mt-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                              userBadge.badge.rarity === 'legendary' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                              'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              <Star className="h-4 w-4" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{userBadge.badge.name}</h4>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{userBadge.badge.description}</p>
                            <span className="inline-block mt-1 text-[9px] font-mono text-slate-600 uppercase">
                              {new Date(userBadge.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                      <p className="text-slate-500 font-mono text-xs px-4">
                        Aún no registrás logros en este ciclo.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
