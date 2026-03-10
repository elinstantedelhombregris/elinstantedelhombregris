import { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuizIntroScreen from '@/components/life-areas/QuizIntroScreen';
import type { Mood } from '@/components/life-areas/QuizIntroScreen';
import QuizCompletionScreen from '@/components/life-areas/QuizCompletionScreen';
import QuizScaleSelector from '@/components/life-areas/QuizScaleSelector';
import MicroCelebration from '@/components/life-areas/MicroCelebration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLifeAreaIcon } from '@/lib/lucide-icon-registry';
import { slideLeft } from '@/lib/motion-variants';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: string;
  orderIndex: number;
  category: 'current' | 'desired';
  subcategoryId: number | null;
  subcategoryName?: string;
  currentValue: number | null;
  desiredValue: number | null;
}

interface Quiz {
  id: number;
  lifeAreaId: number;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
}

interface SubcategoryGroup {
  subcategoryId: number;
  subcategoryName: string;
  currentQuestion: QuizQuestion;
  desiredQuestion: QuizQuestion;
}

type Phase = 'intro' | 'current' | 'desired' | 'celebration' | 'completion';

const LifeAreaQuiz = () => {
  const [, params] = useRoute('/life-areas/:areaId/quiz');
  const [, setLocation] = useLocation();
  const areaId = parseInt(params?.areaId || '0');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('intro');
  const [subcatIndex, setSubcatIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, { current: number | null; desired: number | null }>>({});
  const [mood, setMood] = useState<Mood | null>(null);

  // Fetch quiz
  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: [`/api/life-areas/${areaId}/quiz`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/quiz`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch area info
  const { data: area } = useQuery({
    queryKey: [`/api/life-areas/${areaId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}`);
      if (!response.ok) throw new Error('Failed to fetch area');
      return response.json();
    },
    enabled: areaId > 0,
  });

  // Fetch existing scores
  const { data: existingScores } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/scores`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/scores`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Group questions by subcategory
  const groups: SubcategoryGroup[] = useMemo(() => {
    if (!quiz?.questions) return [];
    const current = quiz.questions.filter(q => q.category === 'current' && q.questionText);
    const desired = quiz.questions.filter(q => q.category === 'desired' && q.questionText);
    const result: SubcategoryGroup[] = [];
    for (const cq of current) {
      // Skip questions without a valid subcategory pairing
      if (cq.subcategoryId == null) continue;
      const dq = desired.find(d => d.subcategoryId === cq.subcategoryId);
      if (dq) {
        result.push({
          subcategoryId: cq.subcategoryId,
          subcategoryName: cq.subcategoryName || `Dimension ${result.length + 1}`,
          currentQuestion: cq,
          desiredQuestion: dq,
        });
      }
    }
    return result.sort((a, b) => a.currentQuestion.orderIndex - b.currentQuestion.orderIndex);
  }, [quiz, area]);

  // Initialize responses for retake
  useEffect(() => {
    if (groups.length > 0 && Object.keys(responses).length === 0) {
      const initial: Record<number, { current: number | null; desired: number | null }> = {};
      for (const g of groups) {
        const prevCurrent = g.currentQuestion.currentValue;
        const prevDesired = g.desiredQuestion.desiredValue;
        initial[g.subcategoryId] = {
          current: prevCurrent != null ? Math.max(0, Math.min(10, Math.round(prevCurrent / 10))) : null,
          desired: prevDesired != null ? Math.max(0, Math.min(10, Math.round(prevDesired / 10))) : null,
        };
      }
      setResponses(initial);
    }
  }, [groups]);

  // Build payload from current state (called right before submit to avoid stale closures)
  const buildPayload = useCallback(() => {
    return groups.flatMap(g => {
      const r = responses[g.subcategoryId];
      // Clamp to integer 0-10, with fallback
      const curr = Math.max(0, Math.min(10, Math.round(r?.current ?? 5)));
      const des = Math.max(0, Math.min(10, Math.round(r?.desired ?? 7)));
      return [
        { questionId: g.currentQuestion.id, currentValue: curr, desiredValue: des },
        { questionId: g.desiredQuestion.id, currentValue: curr, desiredValue: des },
      ];
    });
  }, [groups, responses]);

  // Submit mutation - accepts payload as variable to avoid stale closures
  const submitMutation = useMutation({
    mutationFn: async (payload: { questionId: number; currentValue: number; desiredValue: number }[]) => {
      if (!payload.length) throw new Error('No responses to submit');
      const response = await apiRequest('POST', `/api/life-areas/${areaId}/quiz/submit`, { responses: payload });
      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Submit failed (${response.status}): ${errBody}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/wheel'] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/scores`] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/quiz`] });
    },
    onError: (err) => {
      console.error('Quiz submit error:', err);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu evaluacion. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
      setPhase('current');
    },
  });

  // Area metadata
  const areaColor = area?.colorTheme ? (() => {
    try { return JSON.parse(area.colorTheme).primary; } catch { return '#3b82f6'; }
  })() : '#3b82f6';
  const IconComponent = getLifeAreaIcon(area?.iconName);
  const isRetake = !!existingScores?.areaScore;
  const previousScore = existingScores?.areaScore?.currentScore ?? null;

  const currentGroup = groups[subcatIndex];
  const currentResponse = currentGroup ? responses[currentGroup.subcategoryId] : null;
  const totalSteps = groups.length;
  const isLastSubcat = subcatIndex === totalSteps - 1;

  // Calculate gap for micro-celebration
  const currentGap = currentResponse
    ? (currentResponse.desired ?? 0) - (currentResponse.current ?? 0)
    : 0;

  // Handlers
  const handleIntroStart = (selectedMood: Mood) => {
    setMood(selectedMood);
    setPhase('current');
  };

  const handleCurrentSelect = (value: number) => {
    if (!currentGroup) return;
    setResponses(prev => ({
      ...prev,
      [currentGroup.subcategoryId]: {
        ...prev[currentGroup.subcategoryId],
        current: value,
      },
    }));
  };

  const handleDesiredSelect = (value: number) => {
    if (!currentGroup) return;
    setResponses(prev => ({
      ...prev,
      [currentGroup.subcategoryId]: {
        ...prev[currentGroup.subcategoryId],
        desired: value,
      },
    }));
  };

  const advanceFromCurrent = () => {
    if (currentResponse?.current == null) return;
    setPhase('desired');
  };

  const advanceFromDesired = () => {
    if (currentResponse?.desired == null) return;
    // Show micro-celebration, then advance
    setPhase('celebration');
  };

  const handleCelebrationComplete = useCallback(() => {
    if (isLastSubcat) {
      setPhase('completion');
      // Build payload at call time to capture latest responses
      const payload = buildPayload();
      submitMutation.mutate(payload);
    } else {
      setSubcatIndex(prev => prev + 1);
      setPhase('current');
    }
  }, [isLastSubcat, submitMutation, buildPayload]);

  const goBack = () => {
    if (phase === 'desired') {
      setPhase('current');
    } else if (phase === 'current' && subcatIndex > 0) {
      setSubcatIndex(prev => prev - 1);
      setPhase('desired');
    } else if (phase === 'current' && subcatIndex === 0) {
      setPhase('intro');
    }
  };

  // Completion data
  const completionData = groups.map(g => ({
    name: g.subcategoryName,
    current: responses[g.subcategoryId]?.current ?? 5,
    desired: responses[g.subcategoryId]?.desired ?? 7,
  }));

  // Auth check
  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Acceso Requerido</CardTitle>
              <CardDescription className="text-slate-400">Debes iniciar sesion para completar la evaluacion</CardDescription>
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

  if (!quiz || !area || groups.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Error</CardTitle>
              <CardDescription className="text-slate-400">No se pudo cargar la evaluacion.</CardDescription>
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back button */}
        {phase !== 'completion' && phase !== 'celebration' && (
          <Button
            variant="ghost"
            onClick={() => phase === 'intro' ? setLocation('/life-areas') : goBack()}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {phase === 'intro' ? 'Volver' : 'Atras'}
          </Button>
        )}

        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === 'intro' && (
            <QuizIntroScreen
              key="intro"
              areaName={area.name}
              areaDescription={area.description}
              areaIcon={IconComponent}
              areaColor={areaColor}
              subcategories={groups.map(g => g.subcategoryName)}
              previousScore={previousScore}
              isRetake={isRetake}
              onStart={handleIntroStart}
            />
          )}

          {/* CURRENT VALUE */}
          {phase === 'current' && currentGroup && (
            <motion.div
              key={`current-${subcatIndex}`}
              variants={slideLeft}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>{currentGroup.subcategoryName}</span>
                  <span>{subcatIndex + 1} de {totalSteps}</span>
                </div>
                <div className="flex gap-1">
                  {groups.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i < subcatIndex ? areaColor
                          : i === subcatIndex ? `${areaColor}cc`
                          : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="h-0.5" style={{ backgroundColor: areaColor }} />
                <CardHeader>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tu realidad hoy</p>
                  <CardTitle className="text-lg text-white leading-snug">
                    {currentGroup.currentQuestion.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <QuizScaleSelector
                    value={currentResponse?.current ?? null}
                    onChange={handleCurrentSelect}
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={advanceFromCurrent}
                      disabled={currentResponse?.current == null}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* DESIRED VALUE */}
          {phase === 'desired' && currentGroup && (
            <motion.div
              key={`desired-${subcatIndex}`}
              variants={slideLeft}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>{currentGroup.subcategoryName}</span>
                  <span>{subcatIndex + 1} de {totalSteps}</span>
                </div>
                <div className="flex gap-1">
                  {groups.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i < subcatIndex ? areaColor
                          : i === subcatIndex ? `${areaColor}cc`
                          : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="h-0.5 bg-purple-500/60" />
                <CardHeader>
                  <p className="text-xs text-purple-400/70 uppercase tracking-wider mb-1">Tu aspiracion a 6 meses</p>
                  <CardTitle className="text-lg text-white leading-snug">
                    {currentGroup.desiredQuestion.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <QuizScaleSelector
                    value={currentResponse?.desired ?? null}
                    onChange={handleDesiredSelect}
                    referenceValue={currentResponse?.current}
                    referenceColor={areaColor}
                  />

                  {/* Live gap visualization */}
                  {currentResponse?.current != null && currentResponse?.desired != null && (
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Brecha</span>
                        <span className={`text-sm font-mono font-medium ${
                          currentGap <= 0 ? 'text-emerald-400'
                            : currentGap <= 2 ? 'text-blue-400'
                            : currentGap <= 5 ? 'text-amber-400'
                            : 'text-red-400'
                        }`}>
                          {currentGap <= 0 ? 'Equilibrio' : `${currentGap} pts`}
                        </span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${((currentResponse.current ?? 0) / 10) * 100}%`,
                            backgroundColor: areaColor,
                          }}
                        />
                        {currentGap > 0 && (
                          <div
                            className="absolute inset-y-0 rounded-full bg-purple-400/25"
                            style={{
                              left: `${((currentResponse.current ?? 0) / 10) * 100}%`,
                              width: `${(currentGap / 10) * 100}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={advanceFromDesired}
                      disabled={currentResponse?.desired == null}
                      className={`disabled:opacity-30 ${
                        isLastSubcat
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      {isLastSubcat ? 'Finalizar' : 'Siguiente'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* MICRO-CELEBRATION */}
          {phase === 'celebration' && (
            <MicroCelebration
              key={`celeb-${subcatIndex}`}
              gap={Math.max(0, currentGap)}
              onComplete={handleCelebrationComplete}
            />
          )}

          {/* COMPLETION */}
          {phase === 'completion' && (
            <QuizCompletionScreen
              key="completion"
              areaName={area.name}
              areaIcon={IconComponent}
              areaColor={areaColor}
              subcategoryResults={completionData}
              isSubmitting={submitMutation.isPending}
              onExploreArea={() => setLocation(`/life-areas/${areaId}`)}
              onEvaluateAnother={() => setLocation('/life-areas')}
            />
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default LifeAreaQuiz;
