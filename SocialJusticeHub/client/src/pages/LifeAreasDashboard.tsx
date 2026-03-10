import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Constellation from '@/components/life-areas/Constellation';
import AreaTile from '@/components/life-areas/AreaTile';
import InsightStrip from '@/components/life-areas/InsightStrip';
import { SkeletonDashboard } from '@/components/life-areas/SkeletonDashboard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

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
  currency?: {
    amount: number;
    totalEarned: number;
    totalSpent: number;
  };
}

const LifeAreasDashboard = () => {
  const userContext = useContext(UserContext);

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/life-areas/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/dashboard');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al cargar datos' }));
        const err = new Error(errorData.message || 'Error al cargar datos');
        (err as any).status = response.status;
        throw err;
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

  const { data: wheelData } = useQuery<WheelData[]>({
    queryKey: ['/api/life-areas/wheel'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/wheel');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error' }));
        throw new Error(errorData.message || 'Error');
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

  // Derived data
  const areas = dashboardData?.areas || [];
  const sortedAreas = useMemo(
    () => [...areas].sort((a, b) => a.orderIndex - b.orderIndex),
    [areas]
  );

  const priorityArea = useMemo(() => {
    const withScores = areas
      .filter(a => a.score && a.score.gap > 0)
      .sort((a, b) => (b.score!.gap) - (a.score!.gap));
    if (!withScores.length) return null;
    const top = withScores[0];
    return {
      id: top.id,
      name: top.name,
      gap: top.score!.gap,
      currentScore: top.score!.currentScore,
    };
  }, [areas]);

  const unevaluatedCount = areas.filter(a => !a.score).length;
  const evaluatedAreas = areas.filter(a => a.score);
  const overallAvg = evaluatedAreas.length > 0
    ? Math.round(evaluatedAreas.reduce((sum, a) => sum + (a.score!.currentScore || 0), 0) / evaluatedAreas.length)
    : 0;

  const streak = useMemo(() => {
    const s = dashboardData?.streaks?.find(s => s.streakType === 'daily');
    return s?.currentStreak ?? 0;
  }, [dashboardData]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <SkeletonDashboard />
        </main>
        <Footer />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-400">No se pudieron cargar las areas de vida.</p>
          <Button
            variant="outline"
            className="mt-4 border-white/10 text-slate-300"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <h1 className="text-2xl font-bold text-white">Areas de Vida</h1>
          <p className="text-sm text-slate-500 mt-1">Tu mapa de crecimiento personal</p>
        </motion.div>

        {/* Section A: Constellation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {wheelData && wheelData.length > 0 ? (
            <Constellation areas={wheelData} />
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">Tu constelacion esta esperando</p>
                <p className="text-slate-500 text-sm mb-6">Elegi tu primera area y comenza tu evaluacion</p>
                {sortedAreas.length > 0 && (
                  <Link href={`/life-areas/${sortedAreas[0].id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-500">
                      Comenzar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Insight Strip */}
        <div className="mb-10">
          <InsightStrip
            priorityArea={priorityArea}
            streak={streak}
          />
        </div>

        {/* Progress summary */}
        {evaluatedAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 mb-6 text-center"
          >
            <div>
              <p className="text-2xl font-light text-white">{overallAvg}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Promedio</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-light text-white">{evaluatedAreas.length}<span className="text-slate-500 text-sm">/{areas.length}</span></p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Evaluadas</p>
            </div>
            {streak > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-2xl font-light text-orange-400">{streak}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Dias racha</p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Section B: Area Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8"
        >
          {sortedAreas.map(area => (
            <AreaTile key={area.id} area={area} />
          ))}
        </motion.div>

        {/* Section C: Unevaluated CTA */}
        {unevaluatedCount > 0 && unevaluatedCount < areas.length && (
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="text-center py-6 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <p className="text-slate-400 text-sm">
              Tenes <span className="text-white font-semibold">{unevaluatedCount}</span> area{unevaluatedCount !== 1 ? 's' : ''} sin evaluar
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Completa todas para ver tu constelacion completa
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LifeAreasDashboard;
