import React, { useContext, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubcategoryRadar from '@/components/life-areas/SubcategoryRadar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Target,
  Zap,
  Play,
  Share2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLifeAreaIcon } from '@/lib/lucide-icon-registry';
import {
  getScoreVerdict,
  getGapAnalysis,
  getAreaNarrative,
  getPriorityActions,
  type SubcategoryScore,
} from '@/lib/life-area-insights';

const LifeAreaResults = () => {
  const [, params] = useRoute('/life-areas/:areaId/results');
  const [, setLocation] = useLocation();
  const areaId = parseInt(params?.areaId || '0');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch area
  const { data: area } = useQuery({
    queryKey: [`/api/life-areas/${areaId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: areaId > 0,
  });

  // Fetch scores
  const { data: scores, isLoading } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/scores`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/scores`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch actions for recommendations
  const { data: actions } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/actions`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/actions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Start action mutation
  const startAction = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiRequest('POST', `/api/life-areas/actions/${actionId}/start`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/actions`] });
      toast({ title: 'Accion iniciada!' });
    },
  });

  // Parse area color
  const areaColor = area?.colorTheme ? (() => {
    try { return JSON.parse(area.colorTheme).primary; } catch { return '#3b82f6'; }
  })() : '#3b82f6';
  const IconComponent = getLifeAreaIcon(area?.iconName);

  // Process scores
  const areaScore = scores?.areaScore;
  const currentScore = areaScore?.currentScore ?? 0;
  const desiredScore = areaScore?.desiredScore ?? 0;
  const gap = areaScore?.gap ?? 0;
  const verdict = getScoreVerdict(currentScore);

  // Subcategory scores
  const subcatScores: SubcategoryScore[] = useMemo(() => {
    if (!scores?.subcategoryScores || !area?.subcategories) return [];
    return scores.subcategoryScores.map((s: any) => {
      const subcat = area.subcategories.find((sc: any) => sc.id === s.subcategoryId);
      return {
        name: subcat?.name || 'Subcategoria',
        subcategoryId: s.subcategoryId,
        currentScore: s.currentScore || 0,
        desiredScore: s.desiredScore || 0,
        gap: (s.desiredScore || 0) - (s.currentScore || 0),
      };
    });
  }, [scores, area]);

  // Sorted by gap for analysis
  const sortedByGap = useMemo(
    () => [...subcatScores].sort((a, b) => b.gap - a.gap),
    [subcatScores]
  );

  const biggestGaps = sortedByGap.filter(s => s.gap > 10);
  const strengths = subcatScores.filter(s => s.gap <= 10 && s.currentScore >= 70);
  const balanced = subcatScores.filter(s => s.currentScore >= s.desiredScore);

  // Narrative
  const narrative = useMemo(
    () => area ? getAreaNarrative(area.name, subcatScores) : '',
    [area, subcatScores]
  );

  // Recommendations
  const recommendations = useMemo(
    () => getPriorityActions(subcatScores, actions || []).slice(0, 3),
    [subcatScores, actions]
  );

  // Quick win
  const quickWin = useMemo(() => {
    if (!actions?.length || !sortedByGap.length) return null;
    const highestGapSubcat = sortedByGap[0];
    return actions.find((a: any) =>
      a.difficulty === 'beginner' &&
      (!a.userProgress || a.userProgress.status === 'not_started')
    ) || actions.find((a: any) => !a.userProgress || a.userProgress.status === 'not_started');
  }, [actions, sortedByGap]);

  // Radar data
  const radarData = subcatScores.map(s => ({
    name: s.name,
    current: s.currentScore,
    desired: s.desiredScore,
  }));

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Acceso Requerido</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/login')}>Iniciar Sesion</Button>
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!area || !areaScore) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Sin resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Completa el quiz primero para ver tus resultados.</p>
              <Button onClick={() => setLocation(`/life-areas/${areaId}/quiz`)}>Ir al Quiz</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/life-areas')}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al panel
        </Button>

        {/* SECTION 1: Hero Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden relative">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ backgroundColor: areaColor }}
            />
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${areaColor}15` }}
                >
                  <IconComponent className="w-8 h-8" style={{ color: areaColor }} />
                </div>

                <h1 className="text-2xl font-bold text-white mb-1">Resultados: {area.name}</h1>

                {/* Score gauge */}
                <div className="my-6 relative inline-block">
                  <svg width="160" height="100" viewBox="0 0 160 100">
                    {/* Background arc */}
                    <path
                      d="M 20 90 A 60 60 0 0 1 140 90"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Score arc */}
                    <path
                      d="M 20 90 A 60 60 0 0 1 140 90"
                      fill="none"
                      stroke={areaColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(currentScore / 100) * 188.5} 188.5`}
                      style={{ filter: `drop-shadow(0 0 8px ${areaColor}60)` }}
                    />
                    {/* Desired marker */}
                    {desiredScore > 0 && (() => {
                      const angle = Math.PI - (desiredScore / 100) * Math.PI;
                      const x = 80 + 60 * Math.cos(angle);
                      const y = 90 - 60 * Math.sin(angle);
                      return (
                        <circle cx={x} cy={y} r={4} fill="#a855f7" stroke="#0a0a0a" strokeWidth={2} />
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <span className="text-4xl font-bold text-white font-mono">{currentScore}</span>
                    <span className="text-sm text-slate-500 ml-1">/100</span>
                  </div>
                </div>

                {/* Verdict */}
                <Badge className={`${verdict.bgColor} ${verdict.color} ${verdict.borderColor} text-sm px-4 py-1 mb-3`}>
                  {verdict.label}
                </Badge>

                <p className="text-slate-300 max-w-xl mx-auto mt-3 leading-relaxed">
                  {narrative}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2: Radar Chart */}
        {radarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Mapa de Subcategorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <SubcategoryRadar data={radarData} size={300} currentColor={areaColor} />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: areaColor }} />
                    <span>Estado actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-purple-400 bg-transparent" />
                    <span>Estado deseado</span>
                  </div>
                </div>

                {/* Subcategory detail rows */}
                <div className="space-y-3">
                  {subcatScores.map((subcat, i) => {
                    const gapAnalysis = getGapAnalysis(subcat.currentScore, subcat.desiredScore);
                    return (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-200">{subcat.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${gapAnalysis.color} border-current/20`}
                          >
                            {subcat.gap > 0 ? `Gap: ${subcat.gap}` : 'Equilibrio'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{
                                  width: `${subcat.currentScore}%`,
                                  backgroundColor: areaColor,
                                }}
                              />
                              {subcat.desiredScore > 0 && (
                                <div
                                  className="absolute top-0 h-full w-0.5 bg-purple-400"
                                  style={{
                                    left: `${Math.min(subcat.desiredScore, 100)}%`,
                                    boxShadow: '0 0 4px rgba(168,85,247,0.5)',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-mono text-slate-400 w-16 text-right">
                            {subcat.currentScore}/{subcat.desiredScore}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 italic">{gapAnalysis.message}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SECTION 3: Gap Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Biggest gaps */}
          {biggestGaps.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Tus mayores brechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {biggestGaps.slice(0, 3).map((subcat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{subcat.name}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {subcat.currentScore} → {subcat.desiredScore}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Brecha de {subcat.gap} puntos. Enfocarte aca puede generar el mayor impacto.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-400" />
                  Tus fortalezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {strengths.map((subcat, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300">{subcat.name}</span>
                      <span className="text-xs font-mono text-emerald-400">{subcat.currentScore}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balanced (goal reached) */}
          {balanced.length > 0 && balanced.length < subcatScores.length && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <Award className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-300">
                Alcanzaste tu objetivo en: {balanced.map(s => s.name).join(', ')}
              </p>
            </div>
          )}
        </motion.div>

        {/* SECTION 4: Personalized Recommendations */}
        {(recommendations.length > 0 || quickWin) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Recomendaciones personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick win */}
                {quickWin && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Quick Win</span>
                    </div>
                    <h4 className="font-semibold text-white mb-1">{quickWin.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">{quickWin.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-400" />
                          {quickWin.xpReward} XP
                        </span>
                        <span>{quickWin.estimatedDuration}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500"
                        onClick={() => startAction.mutate(quickWin.id)}
                        disabled={startAction.isPending}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Comenzar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other recommendations */}
                {recommendations.map((rec, i) => (
                  <div key={rec.actionId} className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-200 mb-1">{rec.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">{rec.reason}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <Badge variant="outline" className="text-[10px] border-white/10">
                            {rec.difficulty === 'beginner' ? 'Principiante' : rec.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                          </Badge>
                          <span>{rec.xpReward} XP</span>
                          <span>{rec.estimatedDuration}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-slate-300 hover:bg-white/5 shrink-0"
                        onClick={() => startAction.mutate(rec.actionId)}
                        disabled={startAction.isPending}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SECTION 5: Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <Button
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 h-auto py-4 flex-col gap-2"
            onClick={() => setLocation(`/life-areas/${areaId}`)}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Explorar area</span>
          </Button>
          <Button
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 h-auto py-4 flex-col gap-2"
            onClick={() => setLocation('/life-areas')}
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Evaluar otra area</span>
          </Button>
          <Button
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 h-auto py-4 flex-col gap-2"
            onClick={() => setLocation(`/goals?linkedLifeAreaId=${areaId}`)}
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Crear objetivo</span>
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default LifeAreaResults;
