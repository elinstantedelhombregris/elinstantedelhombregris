import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import ScaleQuestion from '@/components/civic-assessment/ScaleQuestion';
import ChoiceQuestion from '@/components/civic-assessment/ChoiceQuestion';
import RankQuestion from '@/components/civic-assessment/RankQuestion';
import DimensionIntro from '@/components/civic-assessment/DimensionIntro';
import ArchetypeReveal from '@/components/civic-assessment/ArchetypeReveal';
import {
  ASSESSMENT_QUESTIONS,
  CIVIC_DIMENSIONS,
  CIVIC_ARCHETYPES,
  type AssessmentQuestion,
  type CivicArchetype,
  type CivicDimension,
  type DimensionKey,
} from '@shared/civic-assessment-questions';

interface ResponseData {
  questionKey: string;
  dimensionKey: string;
  responseType: 'scale' | 'choice' | 'rank';
  responseValue?: number;
  responseChoice?: string;
  responseRank?: string[];
}

interface ProfileResult {
  archetype: string;
  dimensionScores: Record<string, number>;
  topStrengths: string[];
  growthAreas: string[];
  recommendedActions: string[];
}

// Group questions by dimension
function getQuestionsByDimension() {
  const grouped: { dimension: CivicDimension; questions: AssessmentQuestion[] }[] = [];
  for (const dim of CIVIC_DIMENSIONS) {
    grouped.push({
      dimension: dim,
      questions: ASSESSMENT_QUESTIONS.filter(q => q.dimensionKey === dim.key),
    });
  }
  return grouped;
}

const CivicAssessment = () => {
  const userContext = useContext(UserContext);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, then question indices, last = results
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [archetype, setArchetype] = useState<CivicArchetype | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sections = getQuestionsByDimension();
  // Steps: intro -> [dimensionIntro, q1, q2, ... q6] x 6 -> submitting -> results
  // Flatten: [intro, dim1Intro, q1..q6, dim2Intro, q7..q12, ..., results]
  const steps: Array<{ type: 'intro' | 'dimension_intro' | 'question' | 'results'; dimension?: CivicDimension; question?: AssessmentQuestion; sectionIdx?: number }> = [];
  steps.push({ type: 'intro' });
  sections.forEach((section, sIdx) => {
    steps.push({ type: 'dimension_intro', dimension: section.dimension, sectionIdx: sIdx });
    section.questions.forEach(q => {
      steps.push({ type: 'question', question: q, dimension: section.dimension });
    });
  });
  steps.push({ type: 'results' });

  const totalSteps = steps.length;
  const progressPercent = (currentStep / (totalSteps - 1)) * 100;

  // Initialize assessment
  useEffect(() => {
    if (!userContext?.isLoggedIn) {
      setIsLoading(false);
      return;
    }
    const init = async () => {
      try {
        const res = await apiRequest('POST', '/api/assessment/start');
        if (res.ok) {
          const data = await res.json();
          setAssessmentId(data.assessment.id);

          // Restore existing responses
          if (data.responses?.length > 0) {
            const restored: Record<string, ResponseData> = {};
            for (const r of data.responses) {
              restored[r.questionKey] = {
                questionKey: r.questionKey,
                dimensionKey: r.dimensionKey,
                responseType: r.responseType,
                responseValue: r.responseValue ?? undefined,
                responseChoice: r.responseChoice ?? undefined,
                responseRank: r.responseRank ? JSON.parse(r.responseRank) : undefined,
              };
            }
            setResponses(restored);
          }

          // If assessment is already completed, fetch profile
          if (data.assessment.status === 'completed') {
            const profileRes = await apiRequest('GET', '/api/civic-profile');
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData.profile) {
                setProfile(profileData.profile);
                setArchetype(profileData.archetype);
                setCurrentStep(totalSteps - 1);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error initializing assessment:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [userContext?.isLoggedIn]);

  const setResponse = useCallback((questionKey: string, data: Partial<ResponseData>) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: { ...prev[questionKey], questionKey, ...data } as ResponseData,
    }));
  }, []);

  // Save responses for current dimension when moving to next section
  const saveCurrentResponses = useCallback(async () => {
    if (!assessmentId) return;
    const responsesToSave = Object.values(responses).filter(r => r.questionKey && r.dimensionKey);
    if (responsesToSave.length === 0) return;
    try {
      await apiRequest('PUT', `/api/assessment/${assessmentId}/respond`, {
        responses: responsesToSave,
      });
    } catch (e) {
      console.error('Error saving responses:', e);
    }
  }, [assessmentId, responses]);

  const goNext = useCallback(async () => {
    if (currentStep < totalSteps - 2) {
      // Save on dimension transitions
      const currentStepData = steps[currentStep];
      const nextStepData = steps[currentStep + 1];
      if (currentStepData?.type === 'question' && nextStepData?.type === 'dimension_intro') {
        await saveCurrentResponses();
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === totalSteps - 2) {
      // Last question -> submit
      setIsSubmitting(true);
      try {
        await saveCurrentResponses();
        const res = await apiRequest('POST', `/api/assessment/${assessmentId}/complete`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setArchetype(data.archetype);
          setCurrentStep(totalSteps - 1);
        }
      } catch (e) {
        console.error('Error completing assessment:', e);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentStep, totalSteps, assessmentId, saveCurrentResponses, steps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Check if current question is answered
  const isCurrentAnswered = () => {
    const step = steps[currentStep];
    if (!step || step.type !== 'question') return true;
    const q = step.question!;
    const resp = responses[q.key];
    if (!resp) return false;
    if (q.type === 'scale') return resp.responseValue !== undefined;
    if (q.type === 'choice') return !!resp.responseChoice;
    if (q.type === 'rank') return resp.responseRank && resp.responseRank.length > 0;
    return false;
  };

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-serif text-slate-100">Inicia sesion para hacer la evaluacion</h2>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/login'}>
              Iniciar sesion
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      {/* Progress bar - hide on intro and results */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <div className="fixed top-[72px] left-0 right-0 z-40">
          <Progress value={progressPercent} className="h-1 rounded-none bg-white/5" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {currentStepData?.type === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-6">&#x1F9ED;</div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Evaluacion Civica
              </h1>
              <p className="text-slate-400 max-w-lg mx-auto mb-3 leading-relaxed">
                36 preguntas en 6 dimensiones para descubrir tu perfil civico.
                No hay respuestas correctas ni incorrectas.
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Dura aproximadamente 10-15 minutos. Tus respuestas se guardan automaticamente.
              </p>
              <Button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 h-14 rounded-xl text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                Empezar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* DIMENSION INTRO */}
          {currentStepData?.type === 'dimension_intro' && (
            <motion.div
              key={`dim-${currentStepData.dimension!.key}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DimensionIntro
                dimension={currentStepData.dimension!}
                sectionIndex={currentStepData.sectionIdx!}
                totalSections={sections.length}
              />
              <div className="flex justify-center mt-8">
                <Button
                  onClick={goNext}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 h-12 rounded-xl border border-white/10"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* QUESTION */}
          {currentStepData?.type === 'question' && (
            <motion.div
              key={currentStepData.question!.key}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="py-8"
            >
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentStepData.dimension?.color }} />
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  {currentStepData.dimension?.name}
                </span>
              </div>

              {currentStepData.question!.type === 'scale' && (
                <ScaleQuestion
                  questionKey={currentStepData.question!.key}
                  text={currentStepData.question!.text}
                  minLabel={(currentStepData.question! as any).minLabel}
                  maxLabel={(currentStepData.question! as any).maxLabel}
                  value={responses[currentStepData.question!.key]?.responseValue ?? 5}
                  onChange={(v) => setResponse(currentStepData.question!.key, {
                    dimensionKey: currentStepData.question!.dimensionKey,
                    responseType: 'scale',
                    responseValue: v,
                  })}
                />
              )}

              {currentStepData.question!.type === 'choice' && (
                <ChoiceQuestion
                  text={currentStepData.question!.text}
                  options={(currentStepData.question! as any).options}
                  value={responses[currentStepData.question!.key]?.responseChoice ?? null}
                  onChange={(v) => setResponse(currentStepData.question!.key, {
                    dimensionKey: currentStepData.question!.dimensionKey,
                    responseType: 'choice',
                    responseChoice: v,
                  })}
                />
              )}

              {currentStepData.question!.type === 'rank' && (
                <RankQuestion
                  text={currentStepData.question!.text}
                  items={(currentStepData.question! as any).items}
                  value={responses[currentStepData.question!.key]?.responseRank ?? []}
                  onChange={(v) => setResponse(currentStepData.question!.key, {
                    dimensionKey: currentStepData.question!.dimensionKey,
                    responseType: 'rank',
                    responseRank: v,
                  })}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-10">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!isCurrentAnswered() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : currentStep === totalSteps - 2 ? (
                    'Ver resultados'
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {currentStepData?.type === 'results' && profile && archetype && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ArchetypeReveal
                archetype={archetype}
                dimensionScores={profile.dimensionScores}
                dimensions={CIVIC_DIMENSIONS}
                topStrengths={profile.topStrengths}
                growthAreas={profile.growthAreas}
                recommendedActions={profile.recommendedActions}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default CivicAssessment;
