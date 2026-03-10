import { useContext, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActionCard from '@/components/life-areas/ActionCard';
import SubcategoryRadar from '@/components/life-areas/SubcategoryRadar';
import { ScoreTrendChart } from '@/components/life-areas/ScoreTrendChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, PlayCircle, CheckCircle, BookOpen, Lightbulb,
  FlaskConical, BookOpenCheck, Wrench, ChevronDown, ChevronUp,
  Loader2, Target, Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLifeAreaIcon } from '@/lib/lucide-icon-registry';
import { getScoreVerdict, getGapAnalysis, getAreaNarrative } from '@/lib/life-area-insights';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

import { lifeAreaStudyContent, type AreaStudyContent } from '../../../shared/life-area-study-content';

const studyContentMap: Record<string, AreaStudyContent> = {};
for (const content of lifeAreaStudyContent) {
  studyContentMap[content.areaKey] = content;
}

const perspectiveIcons: Record<string, any> = {
  scientific: FlaskConical,
  philosophical: BookOpenCheck,
  practical: Wrench,
};
const perspectiveLabels: Record<string, string> = {
  scientific: 'Perspectiva Cientifica',
  philosophical: 'Perspectiva Filosofica',
  practical: 'Perspectiva Practica',
};

const LifeAreaDetail = () => {
  const [, params] = useRoute('/life-areas/:areaId');
  const [, setLocation] = useLocation();
  const areaId = parseInt(params?.areaId || '0');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAllActions, setShowAllActions] = useState(false);

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Data fetching
  const { data: area, isLoading: areaLoading, error: areaError } = useQuery({
    queryKey: [`/api/life-areas/${areaId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}`);
      if (!response.ok) throw new Error('No se pudo cargar el area');
      return response.json();
    },
    enabled: areaId > 0 && !isNaN(areaId),
    retry: 2,
  });

  const { data: scores } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/scores`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/scores`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  const { data: actions } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/actions`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/actions`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  const { data: progress } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/progress`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/progress`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Mutations
  const startActionMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiRequest('POST', `/api/life-areas/actions/${actionId}/start`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/actions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/progress`] });
      toast({ title: 'Accion iniciada!' });
    },
  });

  const completeActionMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiRequest('POST', `/api/life-areas/actions/${actionId}/complete`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/actions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/progress`] });
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/dashboard'] });
      toast({ title: 'Accion completada!', description: 'Has ganado XP y semillas.' });
    },
  });

  // Loading & error states
  if (areaLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (areaError || !area) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Error</CardTitle>
              <CardDescription className="text-slate-400">No se pudo cargar el area.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/life-areas')}>Volver</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Derived data
  const areaScore = scores?.areaScore;
  const currentScore = areaScore?.currentScore ?? 0;
  const desiredScore = areaScore?.desiredScore ?? 0;
  const gap = areaScore?.gap ?? 0;
  const hasScore = !!areaScore;
  const verdict = hasScore ? getScoreVerdict(currentScore) : null;
  const IconComponent = getLifeAreaIcon(area.iconName);
  const areaColor = area.colorTheme ? (() => {
    try { return JSON.parse(area.colorTheme).primary; } catch { return '#3b82f6'; }
  })() : '#3b82f6';

  const subcatScoresEnriched = (scores?.subcategoryScores || []).map((s: any) => {
    const subcat = area.subcategories?.find((sc: any) => sc.id === s.subcategoryId);
    return {
      name: subcat?.name || 'Subcategoria',
      subcategoryId: s.subcategoryId,
      currentScore: s.currentScore || 0,
      desiredScore: s.desiredScore || 0,
      gap: (s.desiredScore || 0) - (s.currentScore || 0),
      current: s.currentScore || 0,
      desired: s.desiredScore || 0,
    };
  });
  const radarData = subcatScoresEnriched;
  const narrative = hasScore && subcatScoresEnriched.length > 0
    ? getAreaNarrative(area.name, subcatScoresEnriched)
    : null;

  const studyContent = studyContentMap[area.name] || null;

  // Sort actions: priority first (uncompleted with highest XP)
  const sortedActions = [...(actions || [])].sort((a: any, b: any) => {
    const aCompleted = a.userProgress?.status === 'completed';
    const bCompleted = b.userProgress?.status === 'completed';
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    return (b.xpReward || 0) - (a.xpReward || 0);
  });
  const priorityActions = sortedActions.slice(0, 3);
  const completedCount = (actions || []).filter((a: any) => a.userProgress?.status === 'completed').length;

  // Action progress for history
  const actionHistory = (progress?.actionsProgress || [])
    .filter((ap: any) => ap.status === 'completed' || ap.status === 'in_progress')
    .sort((a: any, b: any) => {
      const aDate = a.completedAt || a.startedAt || '';
      const bDate = b.completedAt || b.startedAt || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/life-areas')}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Areas de Vida
        </Button>

        {/* ──────────────────────────── SECTION 1: DONDE ESTAS ──────────────────────────── */}
        <motion.section variants={fadeUp} initial="initial" animate="animate" className="mb-12">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="p-3 rounded-xl border border-white/10"
              style={{ backgroundColor: `${areaColor}15` }}
            >
              <IconComponent className="w-10 h-10" style={{ color: areaColor }} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{area.name}</h1>
              {area.description && <p className="text-slate-400 text-sm mt-1">{area.description}</p>}
            </div>
            {hasScore && verdict && (
              <div className="text-right">
                <div className="text-3xl font-light text-white">{currentScore}</div>
                <span className={`text-xs font-medium ${verdict.color}`}>{verdict.label}</span>
              </div>
            )}
          </div>

          {/* No score CTA */}
          {!hasScore && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Evalua esta area</h3>
                    <p className="text-slate-400 text-sm">Completa la evaluacion para descubrir donde estas y a donde queres llegar</p>
                  </div>
                  <Button
                    onClick={() => setLocation(`/life-areas/${areaId}/quiz`)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 shrink-0"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Comenzar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Narrative insight */}
          {narrative && (
            <div className="mb-6 p-4 rounded-xl border border-white/6 bg-white/[0.02]">
              <p className="text-sm text-slate-300 leading-relaxed">{narrative}</p>
            </div>
          )}

          {/* Radar + subcategories */}
          {hasScore && (
            <>
              {radarData.length > 0 && (
                <div className="flex flex-col items-center mb-6">
                  <SubcategoryRadar data={radarData} size={320} currentColor={areaColor} showLabels={true} />
                  <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: areaColor }} />
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full border border-purple-400 bg-transparent" />
                      <span>Deseado</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subcategory breakdown */}
              {area.subcategories && area.subcategories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {area.subcategories.map((subcat: any) => {
                    const sc = scores?.subcategoryScores?.find((s: any) => s.subcategoryId === subcat.id);
                    const subcatGap = sc ? sc.desiredScore - sc.currentScore : 0;
                    const gapInfo = sc ? getGapAnalysis(sc.currentScore, sc.desiredScore) : null;
                    const isHighGap = subcatGap > 20;

                    return (
                      <div
                        key={subcat.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          isHighGap
                            ? 'border-amber-500/15 bg-amber-500/[0.03]'
                            : 'border-white/6 bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-slate-200">{subcat.name}</h4>
                          {sc && (
                            <span className="text-sm font-mono text-slate-300">{sc.currentScore}</span>
                          )}
                        </div>
                        {sc ? (
                          <>
                            <div className="relative h-1.5 rounded-full bg-white/6 overflow-hidden mb-1.5">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ width: `${sc.currentScore}%`, backgroundColor: areaColor }}
                              />
                              {sc.desiredScore > 0 && (
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white/40"
                                  style={{ left: `${Math.min(sc.desiredScore, 100)}%` }}
                                />
                              )}
                            </div>
                            {gapInfo && subcatGap > 0 && (
                              <p className={`text-[11px] ${gapInfo.color}`}>{gapInfo.message}</p>
                            )}
                            {subcatGap <= 0 && (
                              <p className="text-[11px] text-emerald-400">Objetivo alcanzado</p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-slate-500">Sin evaluar</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.section>

        {/* ──────────────────────────── SECTION 2: QUE PODES HACER ──────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Que podes hacer</h2>
            {actions && actions.length > 0 && (
              <Badge variant="outline" className="border-white/10 text-slate-400 text-xs ml-auto">
                {completedCount}/{actions.length}
              </Badge>
            )}
          </div>

          {/* Priority actions (horizontal scroll on mobile) */}
          {priorityActions.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-thin">
              {priorityActions.map((action: any) => (
                <div key={action.id} className="min-w-[280px] flex-shrink-0 sm:min-w-0 sm:flex-1">
                  <ActionCard
                    action={action}
                    onStart={(id) => startActionMutation.mutate(id)}
                    onComplete={(id) => completeActionMutation.mutate(id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl border border-white/5 bg-white/[0.02] mb-4">
              <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No hay acciones disponibles aun</p>
            </div>
          )}

          {/* All actions accordion */}
          {sortedActions.length > 3 && (
            <button
              onClick={() => setShowAllActions(!showAllActions)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
            >
              {showAllActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAllActions ? 'Ocultar' : `Ver todas las acciones (${sortedActions.length})`}
            </button>
          )}
          {showAllActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            >
              {sortedActions.slice(3).map((action: any) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onStart={(id) => startActionMutation.mutate(id)}
                  onComplete={(id) => completeActionMutation.mutate(id)}
                />
              ))}
            </motion.div>
          )}

          {/* Study content - expandable */}
          {studyContent && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profundizar</h3>

              {/* Perspectives */}
              {Object.entries(studyContent.perspectives || {}).map(([key, perspective]: [string, any]) => {
                const isOpen = expandedSections[key];
                const PIcon = perspectiveIcons[key] || BookOpen;
                return (
                  <div key={key} className="rounded-xl border border-white/6 bg-white/[0.02] overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-200">{perspectiveLabels[key]}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 pb-4 space-y-3"
                      >
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{perspective.content}</p>
                        {perspective.keyInsight && (
                          <blockquote className="border-l-2 pl-3 py-1 text-sm italic text-slate-400" style={{ borderColor: areaColor }}>
                            <Lightbulb className="w-3.5 h-3.5 inline mr-1.5" style={{ color: areaColor }} />
                            {perspective.keyInsight}
                          </blockquote>
                        )}
                        {perspective.frameworks && perspective.frameworks.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {perspective.frameworks.map((fw: any, i: number) => (
                              <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                <h5 className="font-semibold text-white text-xs mb-1">{fw.name}</h5>
                                <p className="text-[11px] text-slate-400">{fw.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {/* Habits */}
              {studyContent.recommendedHabits && studyContent.recommendedHabits.length > 0 && (
                <div className="rounded-xl border border-white/6 bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => toggleSection('habits')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-200">Habitos recomendados</span>
                    </div>
                    {expandedSections.habits ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {expandedSections.habits && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-2">
                      {studyContent.recommendedHabits.map((habit: any, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm text-slate-200 font-medium">{habit.name}</span>
                            {habit.frequency && <span className="text-xs text-slate-500 ml-2">{habit.frequency}</span>}
                            <p className="text-xs text-slate-400 mt-0.5">{habit.description}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Self-reflection prompts */}
              {studyContent.selfReflectionPrompts && studyContent.selfReflectionPrompts.length > 0 && (
                <div className="rounded-xl border border-white/6 bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => toggleSection('reflection')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-slate-200">Preguntas para reflexionar</span>
                    </div>
                    {expandedSections.reflection ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {expandedSections.reflection && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-2">
                      {studyContent.selfReflectionPrompts.map((prompt: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-slate-300">
                          {prompt}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* ──────────────────────────── SECTION 3: COMO VAS ──────────────────────────── */}
        {hasScore && (
          <motion.section variants={fadeUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Como vas</h2>

            {/* Score trend chart */}
            {progress?.scores && progress.scores.length > 1 && (
              <div className="mb-6">
                <ScoreTrendChart
                  data={progress.scores.map((s: any) => ({
                    date: s.lastUpdated || '',
                    score: s.currentScore,
                  }))}
                  color={areaColor}
                />
              </div>
            )}

            {/* Action history */}
            {actionHistory.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Historial</h3>
                {actionHistory.slice(0, 8).map((ap: any) => (
                  <div key={ap.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${
                        ap.status === 'completed' ? 'text-emerald-400' : 'text-blue-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">{ap.action?.title}</p>
                        <p className="text-xs text-slate-500">
                          {ap.completedAt
                            ? `Completado ${new Date(ap.completedAt).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}`
                            : ap.startedAt
                            ? `Iniciado ${new Date(ap.startedAt).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${
                        ap.status === 'completed' ? 'text-emerald-400 border-emerald-500/20' : 'text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {ap.status === 'completed' ? 'Completada' : 'En progreso'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Re-evaluate CTA */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation(`/life-areas/${areaId}/quiz`)}
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Re-evaluar esta area
              </Button>
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LifeAreaDetail;
