import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, ShieldCheck, Activity, ArrowRight, Zap, Crown, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import GettingStartedChecklist from '@/components/GettingStartedChecklist';
import CivicProfileSummary from '@/components/insight-dashboard/CivicProfileSummary';
import MissionAlignmentCard from '@/components/insight-dashboard/MissionAlignmentCard';
import GoalStrip from '@/components/insight-dashboard/GoalStrip';
import CoachingCard from '@/components/insight-dashboard/CoachingCard';
import NextStepsPanel from '@/components/insight-dashboard/NextStepsPanel';
import CheckinTimeline from '@/components/insight-dashboard/CheckinTimeline';
import TerritoryCard from '@/components/insight-dashboard/TerritoryCard';
import { useCivicProfile, useGoals, useCurrentCheckin, useCoachingSessions } from '@/hooks/useCivicProfile';
import { useCheckinHistory } from '@/hooks/useCheckinHistory';
import { useMissionAlignment } from '@/hooks/useMissionAlignment';
import { useTerritoryDashboard } from '@/hooks/useTerritoryDashboard';

interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  streak: number;
  completedChallenges: number;
  totalChallenges: number;
  badgesEarned: number;
}

const InsightDashboard = () => {
  const userContext = useContext(UserContext);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);

  useEffect(() => {
    if (!userContext?.user) {
      const timer = setTimeout(() => setAuthCheckTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [userContext?.user]);

  const isLoggedIn = !!userContext?.isLoggedIn && !!userContext?.user;

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/stats');
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: isLoggedIn,
    staleTime: 30000,
    retry: false,
  });

  const { data: profileData } = useCivicProfile(isLoggedIn);
  const { data: goalsData } = useGoals(isLoggedIn);
  const { data: checkinData } = useCurrentCheckin(isLoggedIn);
  const { data: coachingData } = useCoachingSessions(isLoggedIn);
  const { data: checkinHistory } = useCheckinHistory(isLoggedIn);
  const { data: alignmentData } = useMissionAlignment(isLoggedIn);
  const { data: territoryData } = useTerritoryDashboard(isLoggedIn);

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity-feed-dashboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/activity-feed?limit=5');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30000,
    enabled: isLoggedIn,
  });

  const profile = profileData?.profile || null;
  const goals = goalsData?.goals || [];
  const hasCheckedIn = !!checkinData?.checkin;
  const hasCoachingSession = (coachingData?.sessions?.length || 0) > 0;
  const allCheckins = checkinHistory?.checkins || [];

  if (!userContext?.user) {
    if (authCheckTimeout) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-blue-500/50" />
            <h2 className="text-xl font-serif text-slate-100">Acceso restringido</h2>
            <p className="text-slate-500 mt-2 text-sm">Inicia sesion para acceder a tu panel.</p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/login'}>
              Iniciar sesion
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
      </div>
    );
  }

  const { user } = userContext;
  const archetype = profileData?.archetype;
  const allOnboardingDone = !!profile && goals.length > 0 && hasCheckedIn && hasCoachingSession;
  const showChecklist = !allOnboardingDone;

  const level = userStats?.level || 1;
  const xp = userStats?.experience || 0;
  const xpNext = userStats?.experienceToNext || 500;
  const progressPct = Math.min((xp / xpNext) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      <Header />
      <EmailVerificationBanner variant="dark" />

      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-colors duration-300">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className={`${user.avatarUrl ? 'object-cover' : 'opacity-80'} group-hover:opacity-100 transition-opacity`} />
                    <AvatarFallback className="bg-slate-900 text-slate-400 font-bold text-xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0a]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-serif tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  {archetype ? (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] uppercase tracking-wider">
                      {archetype.emoji} {archetype.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                      Sin evaluar
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">NV. {level}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">{xp} XP</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold text-slate-200">{userStats?.streak || 0}</span>
                <span className="text-[10px] text-slate-500">racha</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-slate-200">{userStats?.badgesEarned || 0}</span>
                <span className="text-[10px] text-slate-500">logros</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-5 max-w-md">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5">
              <span>NIVEL {level}</span>
              <span>{xpNext - xp} XP para nivel {level + 1}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Getting Started */}
            {showChecklist && (
              <GettingStartedChecklist
                assessmentDone={!!profile}
                hasGoals={goals.length > 0}
                hasCheckin={hasCheckedIn}
                hasCoachingSession={hasCoachingSession}
              />
            )}

            {/* Civic Profile Summary */}
            <CivicProfileSummary profile={profile} />

            {/* Mission Alignment — Personal→Civic Bridge */}
            <MissionAlignmentCard data={alignmentData} />

            {/* Weekly Evolution - Main feature */}
            <CheckinTimeline checkins={allCheckins} hasCurrentWeek={hasCheckedIn} />

            {/* Goals Strip */}
            <GoalStrip goals={goals} />

            {/* Life Areas CTA */}
            <Link href="/life-areas">
              <motion.div whileHover={{ scale: 1.01 }} className="transition-all">
                <Card className="bg-[#0f1115] border-0 shadow-[0_0_30px_rgba(0,0,0,0.4)] cursor-pointer group border-l-4 border-l-emerald-500 overflow-hidden relative">
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors duration-700" />
                  <CardContent className="py-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                          <Activity className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide group-hover:text-emerald-300 transition-colors">Areas de Vida</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Diagnostico de 12 areas fundamentales</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Coaching Card */}
            <CoachingCard hasProfile={!!profile} />

            {/* Territory Pulse */}
            <TerritoryCard data={territoryData} />

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-500">Actividad</span>
                </div>
                <div className="space-y-2">
                  {recentActivity.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        item.type === 'new_member' ? 'bg-purple-500' :
                        item.type === 'task_completed' ? 'bg-blue-500' :
                        item.type === 'milestone_completed' ? 'bg-emerald-500' :
                        'bg-slate-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 truncate">{item.title || item.description}</p>
                        <p className="text-[10px] text-slate-600">{item.user?.name || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {profile?.recommendedActions && (
              <NextStepsPanel actions={profile.recommendedActions} />
            )}

            {/* Quick Links */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Accesos rapidos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 space-y-0.5">
                <Link href="/challenges">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <Target className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Desafios</span>
                    <ArrowRight className="h-3 w-3 text-slate-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <Link href="/recursos/guias-estudio">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Guias de Estudio</span>
                    <ArrowRight className="h-3 w-3 text-slate-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <Link href="/life-areas">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Areas de Vida</span>
                    <ArrowRight className="h-3 w-3 text-slate-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <Link href="/community">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Comunidad</span>
                    <ArrowRight className="h-3 w-3 text-slate-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default InsightDashboard;
