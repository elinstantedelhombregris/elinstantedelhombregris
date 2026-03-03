import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LifeWheel from '@/components/life-areas/LifeWheel';
import { AreaControlCard } from '@/components/life-dashboard/AreaControlCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { 
  Activity,
  Home,
  Users,
  Briefcase,
  Wallet,
  GraduationCap,
  Orbit,
  PartyPopper,
  Leaf,
  Globe2,
  Heart, 
  TrendingUp, 
  TrendingDown,
  Trophy, 
  Flame, 
  Sparkles,
  ArrowRight,
  PlayCircle,
  Target,
  Award,
  Coins,
  Info,
  CheckCircle2,
  Bell,
  Compass,
  Cpu,
  LayoutDashboard,
  AlertCircle,
  Radar,
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface WheelData {
  id: number;
  name: string;
  iconName: string;
  colorTheme: { primary: string; secondary: string } | null;
  currentScore: number;
  desiredScore: number;
  gap: number;
}

interface DashboardData {
  areas: Array<{
    id: number;
    name: string;
    description: string | null;
    iconName: string | null;
    orderIndex: number;
    colorTheme: string | null;
    score: {
      currentScore: number;
      desiredScore: number;
      gap: number;
    } | null;
  }>;
  levels: Array<{
    level: number;
    xpCurrent: number;
    xpRequired: number;
    lifeAreaId: number;
  }>;
  streaks: Array<{
    streakType: string;
    currentStreak: number;
    longestStreak: number;
    bonusMultiplier: number;
  }>;
  recentBadges: Array<any>;
  currency: {
    amount: number;
    totalEarned: number;
    totalSpent: number;
  };
}

interface ProgressResponse {
  scores: Array<{
    id?: number;
    lifeAreaId: number;
    currentScore: number;
    desiredScore: number;
    gap: number;
    lastUpdated?: string | null;
  }>;
  actionsProgress: Array<{
    id: number;
    actionId: number;
    status: string;
    notes?: string | null;
    startedAt?: string | null;
    updatedAt?: string | null;
    completedAt?: string | null;
    action: {
      id: number;
      lifeAreaId: number;
      title: string;
      description: string | null;
      xpReward: number | null;
    };
  }>;
}

interface TimelineResponse {
  scoreChanges: Array<{
    id: number;
    lifeAreaId: number | null;
    delta: number | null;
    value: number | null;
    recordedAt: string;
  }>;
  completedActions: Array<{
    progress: {
      id: number;
      actionId: number;
      status: string;
      updatedAt?: string | null;
      completedAt?: string | null;
    };
    action: {
      id: number;
      lifeAreaId: number;
      title: string;
    };
  }>;
}

interface LifeAreaNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  createdAt: string;
  read: boolean;
}

const AREA_ICON_MAP: Record<string, LucideIcon> = {
  Salud: Activity,
  Apariencia: Sparkles,
  Amor: Heart,
  Familia: Home,
  Amigos: Users,
  Carrera: Briefcase,
  Dinero: Wallet,
  "Crecimiento Personal": GraduationCap,
  Espiritualidad: Orbit,
  Recreación: PartyPopper,
  Entorno: Leaf,
  Comunidad: Globe2,
};

const clampScore = (value: number | null | undefined) => Math.min(Math.max(value ?? 0, 0), 100);
const generateHistory = (current: number, target: number) => {
  const safeTarget = target || Math.min(current + 10, 100);
  const delta = (safeTarget - current) / 5;
  return Array.from({ length: 6 }, (_, index) =>
    clampScore(current - delta * (5 - index))
  );
};

type AreaControlState = {
  value: number;
  target: number;
  note: string;
  history: number[];
};

type TimelineEntry = {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: LucideIcon;
  tone: "positive" | "alert" | "info";
};

const LifeAreasDashboard = () => {
  const userContext = useContext(UserContext);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/life-areas/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/dashboard');
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({ message: 'Authentication or validation error' }));
          const error = new Error(errorData.message || 'Authentication or validation error');
          (error as any).status = response.status;
          throw error;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data' }));
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 30000,
    retry: (failureCount, error: any) => {
      if (error?.status === 400 || error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Fetch wheel data
  const { data: wheelData, error: wheelError } = useQuery<WheelData[]>({
    queryKey: ['/api/life-areas/wheel'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/wheel');
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({ message: 'Authentication or validation error' }));
          const error = new Error(errorData.message || 'Authentication or validation error');
          (error as any).status = response.status;
          throw error;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch wheel data' }));
        throw new Error(errorData.message || 'Failed to fetch wheel data');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 30000,
    retry: (failureCount, error: any) => {
      if (error?.status === 400 || error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });

  const { data: progressData } = useQuery<ProgressResponse>({
    queryKey: ['/api/life-areas/progress'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/progress');
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          return { scores: [], actionsProgress: [] };
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch progress data' }));
        throw new Error(errorData.message || 'Failed to fetch progress data');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 60000,
    retry: 1,
  });

  const { data: timelineData } = useQuery<TimelineResponse>({
    queryKey: ['/api/life-areas/progress/timeline', 25],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/progress/timeline?limit=25');
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          return { scoreChanges: [], completedActions: [] };
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch timeline data' }));
        throw new Error(errorData.message || 'Failed to fetch timeline data');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 60000,
    retry: 1,
  });

  const { data: notificationsData } = useQuery<LifeAreaNotification[]>({
    queryKey: ['/api/life-areas/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/notifications?unreadOnly=false');
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) return [];
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch notifications' }));
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && !!userContext?.user,
    staleTime: 60000,
    retry: 1,
  });

  const [activeWheelArea, setActiveWheelArea] = useState<number | null>(null);
  const [showWheelTargets, setShowWheelTargets] = useState<boolean>(true);
  const [areaControls, setAreaControls] = useState<Record<number, AreaControlState>>({});

  useEffect(() => {
    if (!dashboardData) return;
    setAreaControls((prev) => {
      const next: Record<number, AreaControlState> = { ...prev };
      dashboardData.areas.forEach((area) => {
        const current = clampScore(area.score?.currentScore);
        const desiredRaw = clampScore(area.score?.desiredScore);
        const safeTarget = desiredRaw > 0 ? desiredRaw : Math.min(current + 10, 100);
        if (!next[area.id]) {
          next[area.id] = {
            value: current,
            target: safeTarget,
            note: area.description ?? "",
            history: generateHistory(current, safeTarget),
          };
        } else {
          const existing = next[area.id];
          next[area.id] = {
            value: existing.value ?? current,
            target: existing.target ?? safeTarget,
            note: existing.note ?? area.description ?? "",
            history: existing.history && existing.history.length > 0 ? existing.history : generateHistory(current, safeTarget),
          };
        }
      });
      return next;
    });
  }, [dashboardData]);

  const normalizedWheelData = useMemo(
    () =>
      (wheelData ?? []).map((area) => ({
        ...area,
        colorTheme: null,
        currentScore: clampScore(area.currentScore),
        desiredScore: clampScore(area.desiredScore),
        gap: Math.max(clampScore(area.desiredScore) - clampScore(area.currentScore), 0),
      })),
    [wheelData]
  );

  const mergedWheelAreas = useMemo(
    () =>
      normalizedWheelData.map((area) => {
        const control = areaControls[area.id];
        if (!control) return area;
        const current = clampScore(control.value);
        const target = clampScore(control.target);
        return {
          ...area,
          colorTheme: null,
          currentScore: current,
          desiredScore: target,
          gap: Math.max(target - current, 0),
        };
      }),
    [normalizedWheelData, areaControls]
  );

  const areaNameById = useMemo(() => {
    const map = new Map<number, string>();
    dashboardData?.areas.forEach((area) => {
      map.set(area.id, area.name);
    });
    return map;
  }, [dashboardData?.areas]);

  const levelByArea = useMemo(() => {
    const map = new Map<number, number>();
    dashboardData?.levels.forEach((level) => {
      map.set(level.lifeAreaId, level.level);
    });
    return map;
  }, [dashboardData?.levels]);

  const areaControlList = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.areas.map((area) => {
      const control = areaControls[area.id];
      const baseValue = clampScore(area.score?.currentScore);
      const baseTarget = clampScore(area.score?.desiredScore);
      const value = clampScore(control?.value ?? baseValue);
      const target = clampScore(control?.target ?? (baseTarget > 0 ? baseTarget : Math.min(baseValue + 10, 100)));
      const note = control?.note ?? area.description ?? "";
      const history =
        control?.history && control.history.length > 0
          ? control.history
          : generateHistory(baseValue, target);
      const icon = AREA_ICON_MAP[area.name] ?? Sparkles;
      return {
        id: area.id,
        name: area.name,
        value,
        target,
        note,
        icon,
        history,
        level: levelByArea.get(area.id),
      };
    });
  }, [dashboardData, areaControls, levelByArea]);

  const focusAreas = useMemo(() => {
    if (progressData?.scores?.length) {
      return progressData.scores
        .map((score) => {
          const current = clampScore(score.currentScore);
          const desired = clampScore(score.desiredScore > 0 ? score.desiredScore : Math.min(current + 10, 100));
          return {
            id: score.lifeAreaId,
            name: areaNameById.get(score.lifeAreaId) ?? `Área ${score.lifeAreaId}`,
            value: current,
            target: desired,
            gap: Math.max(desired - current, 0),
            updatedAt: score.lastUpdated ?? null,
          };
        })
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 4);
    }
    return areaControlList
      .map((area) => ({
        id: area.id,
        name: area.name,
        value: area.value,
        target: area.target,
        gap: Math.max(area.target - area.value, 0),
        updatedAt: undefined,
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4);
  }, [progressData, areaNameById, areaControlList]);

  const recentActions = useMemo(
    () => (progressData?.actionsProgress ?? []).slice(0, 4),
    [progressData?.actionsProgress]
  );

  const timelineEntries = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [];
    timelineData?.scoreChanges?.forEach((change) => {
      if (!change.recordedAt) return;
      const areaName = change.lifeAreaId ? areaNameById.get(change.lifeAreaId) ?? `Área ${change.lifeAreaId}` : "Área";
      const delta = change.delta ?? 0;
      entries.push({
        id: `score-${change.id}`,
        title: `${areaName}: ${delta >= 0 ? "+" : ""}${delta} puntos`,
        subtitle: `Nuevo valor: ${clampScore(change.value ?? (change.delta ?? 0))}`,
        timestamp: change.recordedAt,
        icon: delta >= 0 ? TrendingUp : TrendingDown,
        tone: delta >= 0 ? "positive" : "alert",
      });
    });
    timelineData?.completedActions?.forEach(({ progress, action }) => {
      if (!progress || !action) return;
      const timestamp = progress.completedAt ?? progress.updatedAt ?? new Date().toISOString();
      const areaName = areaNameById.get(action.lifeAreaId) ?? "Área";
      entries.push({
        id: `action-${progress.id}`,
        title: `Acción completada: ${action.title}`,
        subtitle: `${areaName} · Estado: ${progress.status}`,
        timestamp,
        icon: CheckCircle2,
        tone: "positive",
      });
    });
    (notificationsData ?? []).forEach((notification) => {
      if (!notification) return;
      entries.push({
        id: `notification-${notification.id}`,
        title: notification.title,
        subtitle: notification.message,
        timestamp: notification.createdAt ?? new Date().toISOString(),
        icon: Bell,
        tone: notification.read ? "info" : "alert",
      });
    });
    return entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [timelineData, notificationsData, areaNameById]);

  const handleAreaValueChange = (areaId: number, value: number) => {
    const clamped = clampScore(value);
    setAreaControls((prev) => {
      const existing = prev[areaId];
      if (!existing) return prev;
      const history = [...existing.history.slice(-5), clamped];
      return {
        ...prev,
        [areaId]: {
          ...existing,
          value: clamped,
          history,
        },
      };
    });
    setActiveWheelArea(areaId);
  };

  const handleAreaTargetChange = (areaId: number, value: number) => {
    const clamped = clampScore(value);
    setAreaControls((prev) => {
      const existing = prev[areaId];
      if (!existing) return prev;
      return {
        ...prev,
        [areaId]: {
          ...existing,
          target: clamped,
        },
      };
    });
  };

  const handleAreaNoteChange = (areaId: number, note: string) => {
    setAreaControls((prev) => {
      const existing = prev[areaId];
      if (!existing) return prev;
      return {
        ...prev,
        [areaId]: {
          ...existing,
          note,
        },
      };
    });
  };

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md border-white/10 shadow-2xl bg-[#0f1115] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif text-white">Acceso requerido</CardTitle>
              <CardDescription className="text-slate-400">
                Iniciá sesión para abrir tu panel de áreas de vida.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50">Iniciar sesión</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-400 font-mono text-sm tracking-widest">Cargando panel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md border-red-900/50 bg-red-950/10">
            <CardHeader>
              <CardTitle className="text-red-400">Error de conexión</CardTitle>
              <CardDescription className="text-red-300/70">
                No se pudo cargar la información del panel.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const dailyStreak = dashboardData.streaks.find(s => s.streakType === 'daily');
  const averageScore = dashboardData.areas.length > 0
    ? Math.round(
        dashboardData.areas
          .filter(a => a.score)
          .reduce((sum, a) => sum + (a.score?.currentScore || 0), 0) /
        dashboardData.areas.filter(a => a.score).length
      )
    : 0;

  const areasWithoutQuiz = dashboardData.areas.filter(a => !a.score);

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "RECIENTE";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 selection:bg-blue-500/30 font-sans">
      <Header />
      
      <div className="relative overflow-hidden bg-[#0a0a0a]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          {/* Hero Section: Panel de Ingeniería */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              Mapa de Áreas de Vida
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed"
            >
              Visualizá tu estado actual, definí objetivos y sostené mejoras concretas en cada dimensión personal.
            </motion.p>
          </div>

          {/* Metrics Grid: Instrumentos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-blue-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Avance global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">{averageScore}</span>
                  <span className="text-xs text-slate-500 ml-1 font-mono">/100</span>
                </div>
                <Progress value={averageScore} className="mt-3 h-1 bg-white/10" indicatorClassName="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-amber-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Constancia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">
                    {dailyStreak?.currentStreak || 0}
                  </span>
                  <span className="text-xs text-slate-500 ml-1 font-mono">DÍAS</span>
                </div>
                {dailyStreak && dailyStreak.bonusMultiplier > 1 && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                    Eficiencia {dailyStreak.bonusMultiplier}x
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-purple-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Hitos logrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">
                    {dashboardData.recentBadges.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wide">Logros Desbloqueados</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Recursos disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">
                    {dashboardData.currency.amount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wide">Semillas</p>
              </CardContent>
            </Card>
          </div>

          {/* Vista principal: rueda de áreas */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 items-start">
            
            {/* Columna izquierda: rueda y controles */}
            <div className="space-y-8">
              <Card className="border-white/10 shadow-2xl bg-[#0f1115] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-serif text-white flex items-center gap-2">
                      <Radar className="w-5 h-5 text-blue-500 animate-pulse" />
                      Rueda de Equilibrio
                    </CardTitle>
                    <CardDescription className="font-mono text-[10px] tracking-widest text-blue-400/60 uppercase">
                      Visualización comparada: situación actual vs objetivo
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Switch
                      id="show-wheel-targets"
                      checked={showWheelTargets}
                      onCheckedChange={setShowWheelTargets}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="show-wheel-targets" className="text-[10px] uppercase font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">
                      Ver objetivo
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 relative z-10">
                  {wheelError ? (
                    <div className="text-center py-16 bg-red-900/10 border border-red-900/20 m-6 rounded-lg">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-400 font-mono text-sm mb-4">ERROR CRÍTICO EN SENSOR DE MATRIZ</p>
                      <Button onClick={() => window.location.reload()} variant="outline" className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-200">
                        REINICIAR SISTEMA
                      </Button>
                    </div>
                  ) : mergedWheelAreas.length > 0 ? (
                    <LifeWheel 
                      areas={mergedWheelAreas}
                      showTargets={showWheelTargets}
                      highlightAreaId={activeWheelArea}
                      onAreaHoverChange={(area) => setActiveWheelArea(area?.id ?? null)}
                      onAreaClick={(areaId) => {
                        // Navegación manejada internamente en LifeWheel con wouter location
                      }}
                    />
                  ) : (
                    <div className="text-center py-20 px-4">
                      <Compass className="w-16 h-16 text-slate-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-serif text-white mb-2">
                        Rueda sin datos
                      </h3>
                      <p className="text-slate-400 max-w-md mx-auto mb-8 font-light leading-relaxed">
                        Completá tu primer diagnóstico para obtener una base clara de progreso y prioridades.
                      </p>
                      <Link href="/life-areas/1/quiz">
                        <Button className="bg-blue-600 text-white hover:bg-blue-500 px-8 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Iniciar diagnóstico
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grid de Control de Áreas */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {areaControlList.map((area) => (
                  <AreaControlCard
                    key={area.id} 
                    area={area}
                    isActive={activeWheelArea === area.id}
                    onValueChange={(value) => handleAreaValueChange(area.id, value)}
                    onTargetChange={(value) => handleAreaTargetChange(area.id, value)}
                    onNoteChange={(note) => handleAreaNoteChange(area.id, note)}
                    onHoverChange={(hovering) => setActiveWheelArea(hovering ? area.id : null)}
                    actions={
                      <div className="flex flex-col items-end gap-2">
                        <Link href={`/life-areas/${area.id}/quiz`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[9px] uppercase tracking-wider text-slate-500 hover:text-white hover:bg-white/5">
                            Actualizar (Quiz)
                          </Button>
                        </Link>
                        <Link href={`/life-areas/${area.id}`}>
                          <Button variant="outline" size="sm" className="h-7 rounded border-white/10 text-slate-300 text-[9px] uppercase tracking-wider font-bold hover:bg-white/10 hover:text-white hover:border-white/30">
                            Panel Detallado <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Insights & Feeds */}
            <div className="space-y-6">
              
              {/* Timeline Card */}
              <Card className="border-white/10 bg-white/5 backdrop-blur shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    Historial reciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {timelineEntries.length > 0 ? (
                      timelineEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 group hover:bg-white/5 p-2 rounded transition-colors"
                        >
                          <div
                            className={cn(
                              "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] border",
                              entry.tone === "positive" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              entry.tone === "alert" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                              entry.tone === "info" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}
                          >
                            <entry.icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{entry.title}</p>
                              <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{entry.subtitle}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-600 font-mono text-xs">
                        SIN MOVIMIENTOS RECIENTES
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Focus Areas */}
              <Card className="border-white/10 bg-white/5 backdrop-blur shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-400" />
                    Áreas prioritarias
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  {focusAreas.length > 0 ? (
                    focusAreas.map((area) => (
                      <div key={area.id} className="space-y-2 group">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{area.name}</p>
                          <div className="flex items-center gap-1 text-xs font-mono">
                            <span className="text-slate-500">GAP:</span>
                            <span className="text-amber-400 font-bold">{area.gap}</span>
                          </div>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-slate-600"
                            style={{ width: `${area.value}%` }}
                          />
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 shadow-[0_0_5px_rgba(245,158,11,0.8)]"
                            style={{ left: `${Math.min(area.target, 100)}%` }}
                          />
                          {/* Visualización del gap llena */}
                          <div 
                             className="absolute inset-y-0 bg-amber-500/20"
                             style={{ 
                               left: `${area.value}%`,
                               width: `${Math.max(area.target - area.value, 0)}%` 
                             }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Sistema en equilibrio. Sin prioridades críticas.</p>
                  )}

                  {/* Active Actions List */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                        Acciones activas
                      </p>
                      <Link href="/challenges">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-5 px-2 text-[9px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 uppercase tracking-wider font-bold"
                        >
                          Ver Misiones
                        </Button>
                      </Link>
                    </div>
                    {recentActions.length > 0 ? (
                      <div className="space-y-2">
                        {recentActions.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors group"
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white">{item.action.title}</p>
                              <p className="text-[9px] text-slate-500 truncate font-mono uppercase">
                                {areaNameById.get(item.action.lifeAreaId) ?? "ÁREA"}
                              </p>
                            </div>
                            <Link href={`/life-areas/${item.action.lifeAreaId}`}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-slate-500 hover:text-white hover:bg-white/10">
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-[10px] text-slate-600 font-mono mb-3 border border-dashed border-white/5 rounded p-2">
                          SIN ACCIONES EN CURSO
                        </p>
                        <Link href="/challenges">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[10px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10 uppercase tracking-wider font-bold"
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Explorar desafíos
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Desafíos - acceso directo */}
              <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 shadow-lg overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <Link href="/challenges">
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-purple-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Target className="w-4 h-4 text-purple-400 animate-pulse" />
                      Desafíos de práctica
                    </CardTitle>
                    <CardDescription className="text-purple-200/70 text-xs mt-1">
                      Accedé al catálogo completo de desafíos para sostener tu progreso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-purple-300/80">
                        <Zap className="w-3 h-3" />
                        <span>CONSTRUÍ CONSTANCIA</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Acciones rápidas para áreas pendientes */}
              {areasWithoutQuiz.length > 0 && (
                <Card className="bg-blue-900/20 border border-blue-500/30 shadow-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-blue-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      Áreas sin datos
                    </CardTitle>
                    <CardDescription className="text-blue-200/60 text-xs">
                      Detectamos {areasWithoutQuiz.length} áreas pendientes de diagnóstico.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {areasWithoutQuiz.slice(0, 6).map((area) => (
                        <Link key={area.id} href={`/life-areas/${area.id}/quiz`}>
                          <Button variant="secondary" size="sm" className="h-6 text-[10px] bg-blue-950/50 text-blue-200 hover:bg-blue-900 hover:text-white border border-blue-500/30">
                            {area.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LifeAreasDashboard;
