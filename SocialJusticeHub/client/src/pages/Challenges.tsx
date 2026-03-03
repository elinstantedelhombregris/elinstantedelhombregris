import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Heart, 
  Users, 
  BookOpen, 
  TrendingUp,
  Zap,
  CheckCircle2,
  Lock,
  Play,
  Calendar,
  Crown,
  Sparkles,
  Crosshair,
  ArrowRight,
  Trophy,
  Flame
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface Challenge {
  id: number;
  title: string;
  description: string;
  level: number;
  category: string;
  difficulty: string;
  frequency: string;
  experience: number;
  duration: string;
  iconName: string;
  orderIndex: number;
  isActive: boolean;
  steps: ChallengeStep[];
}

interface ChallengeStep {
  id: number;
  title: string;
  description: string;
  type: string;
  orderIndex: number;
}

interface UserChallengeProgress {
  id: number;
  userId: number;
  challengeId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  currentStep: number;
  startedAt?: string;
  completedAt?: string;
}

const Challenges = () => {
  const userContext = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    staleTime: 60000,
    retry: 3,
  });

  // Fetch user progress
  const { data: userProgress = [] } = useQuery<UserChallengeProgress[]>({
    queryKey: ['/api/user/challenges'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 30000,
    retry: 3,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 30000,
    retry: 3,
  });

  const userLevel = (userStats as any)?.level || 1;

  // Get level info
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Consciencia Individual', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: UserIcon };
      case 2: return { name: 'Núcleo Familiar', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: Users };
      case 3: return { name: 'Impacto Comunitario', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: BookOpen };
      case 4: return { name: 'Liderazgo Provincial', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: TrendingUp };
      case 5: return { name: 'Visión Nacional', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: Star };
      default: return { name: 'Consciencia Individual', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: UserIcon };
    }
  };

  // Helper for icon component (since we can't use the User component directly from Lucide if it conflicts)
  const UserIcon = Heart; // Fallback or specific icon

  const getUserProgress = (challengeId: number) => {
    return userProgress.find(p => p.challengeId === challengeId);
  };

  const isChallengeAvailable = (challengeLevel: number) => {
    return challengeLevel <= userLevel;
  };

  // Filter logic
  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || challenge.level.toString() === selectedLevel;
      const matchesFrequency = selectedFrequency === 'all' || challenge.frequency === selectedFrequency;
      const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
      
      const progress = getUserProgress(challenge.id);
      let matchesView = true;
      if (viewMode === 'active') matchesView = progress?.status === 'in_progress';
      if (viewMode === 'completed') matchesView = progress?.status === 'completed';

      return matchesSearch && matchesLevel && matchesFrequency && matchesCategory && matchesView;
    });
  }, [challenges, searchTerm, selectedLevel, selectedFrequency, selectedCategory, viewMode, userProgress]);

  const challengesByLevel = useMemo(() => {
    return filteredChallenges.reduce((acc, challenge) => {
      if (!acc[challenge.level]) {
        acc[challenge.level] = [];
      }
      acc[challenge.level].push(challenge);
      return acc;
    }, {} as Record<number, Challenge[]>);
  }, [filteredChallenges]);

  const activeMissionsCount = userProgress.filter(p => p.status === 'in_progress').length;
  const completedMissionsCount = userProgress.filter(p => p.status === 'completed').length;

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-slate-600 animate-pulse" />
          <h2 className="text-xl font-serif text-slate-100">Acceso restringido</h2>
          <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">Iniciá sesión para ver tus desafíos</p>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" onClick={() => window.location.href = '/login'}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-blue-500/30">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-serif tracking-tight">
                  Desafíos de práctica
                </h1>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                  ACTIVO
                </Badge>
              </div>
              <p className="text-lg text-slate-400 font-light max-w-2xl leading-relaxed">
                Elegí desafíos acordes a tu nivel y transformá constancia en progreso real.
              </p>
            </div>

            <div className="flex gap-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-md w-32">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">{activeMissionsCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-1">En curso</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-md w-32">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">{completedMissionsCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-1">Completados</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls & Filters */}
        <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-end">
              <div className="w-full lg:w-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Buscar desafío..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#0a0a0a] border-white/10 text-slate-200 focus:border-purple-500/50 focus:ring-purple-500/20 h-10"
                  />
                </div>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-slate-200 h-10">
                    <SelectValue placeholder="Nivel de Acceso" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-slate-200">
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    {[1, 2, 3, 4, 5].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        Nivel {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-slate-200 h-10">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-slate-200">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Array.from(new Set(challenges.map(c => c.category))).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => setViewMode('all')}
                    className={cn("flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-colors", viewMode === 'all' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setViewMode('active')}
                    className={cn("flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-colors", viewMode === 'active' ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300")}
                  >
                    Activos
                  </button>
                  <button 
                    onClick={() => setViewMode('completed')}
                    className={cn("flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-colors", viewMode === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")}
                  >
                    Listos
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missions Grid */}
        {challengesLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-purple-400 font-mono text-sm animate-pulse">CARGANDO DESAFÍOS...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            <Crosshair className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-slate-300 mb-2">No se encontraron desafíos</h3>
            <p className="text-slate-500 font-light">Ajustá los filtros para encontrar opciones relevantes.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('all');
                setSelectedFrequency('all');
                setSelectedCategory('all');
                setViewMode('all');
              }}
              className="mt-6 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              REINICIAR FILTROS
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(challengesByLevel)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, levelChallenges]) => {
                const levelInfo = getLevelInfo(parseInt(level));
                const isAvailable = isChallengeAvailable(parseInt(level));

                return (
                  <div key={level} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", levelInfo.bg, levelInfo.border, levelInfo.color)}>
                        <levelInfo.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white font-serif tracking-wide">
                          Nivel {level} // <span className={levelInfo.color}>{levelInfo.name.toUpperCase()}</span>
                        </h2>
                        {!isAvailable && (
                          <span className="text-xs text-red-400 font-mono flex items-center mt-1">
                            <Lock className="w-3 h-3 mr-1" /> Bloqueado: requiere nivel {level}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {levelChallenges.map((challenge) => {
                        const progress = getUserProgress(challenge.id);
                        const isCompleted = progress?.status === 'completed';
                        const isInProgress = progress?.status === 'in_progress';
                        const isLocked = !isChallengeAvailable(challenge.level);

                        return (
                          <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={!isLocked ? { y: -5 } : {}}
                            className="h-full"
                          >
                            <Card className={cn(
                              "h-full bg-[#0f1115] border border-white/10 overflow-hidden relative group transition-all duration-500",
                              !isLocked && "hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
                              isLocked && "opacity-50 grayscale"
                            )}>
                              {/* Holographic Overlay */}
                              {!isLocked && (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                              )}
                              
                              {/* Status Indicator */}
                              {isCompleted && (
                                <div className="absolute top-0 right-0 p-3 z-20">
                                  <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                </div>
                              )}

                              <CardHeader className="relative z-10 pb-4">
                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center border bg-[#0a0a0a] shadow-inner transition-colors duration-300",
                                    isInProgress ? "border-blue-500/50 text-blue-400" : "border-white/10 text-slate-500 group-hover:text-purple-400 group-hover:border-purple-500/30"
                                  )}>
                                    <Crosshair className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg font-bold text-slate-200 font-sans leading-tight group-hover:text-white transition-colors mb-1 truncate">
                                      {challenge.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="bg-white/5 text-slate-400 border-white/5 text-[9px] font-bold uppercase tracking-wider">
                                        {challenge.frequency}
                                      </Badge>
                                      <span className="text-[10px] font-mono text-purple-400 font-bold">
                                        +{challenge.experience} XP
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardContent className="relative z-10 space-y-4">
                                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                                  {challenge.description}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-t border-white/5 pt-3">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {challenge.duration}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Target className="h-3 w-3" />
                                    {challenge.steps.length} PASOS
                                  </div>
                                </div>

                                {progress && (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                      <span>Progreso del desafío</span>
                                      <span className={isInProgress ? "text-blue-400" : "text-emerald-400"}>
                                        {Math.round((progress.currentStep / challenge.steps.length) * 100)}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(progress.currentStep / challenge.steps.length) * 100} 
                                      className="h-1.5 bg-white/5" 
                                      indicatorClassName={isInProgress ? "bg-blue-500" : "bg-emerald-500"}
                                    />
                                  </div>
                                )}

                                <div className="pt-2">
                                  {isLocked ? (
                                    <Button disabled className="w-full bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed">
                                      <Lock className="h-3 w-3 mr-2" />
                                      Bloqueado
                                    </Button>
                                  ) : isCompleted ? (
                                    <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10">
                                      <Trophy className="h-3 w-3 mr-2" />
                                      COMPLETADO
                                    </Button>
                                  ) : (
                                    <Link href={`/challenges/${challenge.id}`}>
                                      <Button className={cn(
                                        "w-full font-bold tracking-wide shadow-lg transition-all duration-300 group-hover:translate-y-0",
                                        isInProgress 
                                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30" 
                                          : "bg-white text-slate-900 hover:bg-purple-50 shadow-white/10"
                                      )}>
                                        {isInProgress ? "CONTINUAR DESAFÍO" : "COMENZAR DESAFÍO"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Challenges;
