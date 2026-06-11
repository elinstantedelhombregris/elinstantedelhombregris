import React, { useContext, useState } from 'react';
import { useRoute } from 'wouter';
import { UserContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  Target,
  Clock,
  Star,
  CheckCircle,
  Play,
  Heart,
  Users,
  BookOpen,
  TrendingUp,
  Zap,
  Award,
  Calendar,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  ACCENT_BUTTON,
  DISPLAY_GRADIENT,
  GLASS_CARD,
  GLASS_CARD_HOVER,
  SECTION_BADGE,
} from '@/lib/design-tokens';

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
  steps: ChallengeStep[];
}

interface ChallengeStep {
  id: number;
  title: string;
  description: string;
  type: 'question' | 'action' | 'reflection' | 'quiz';
  orderIndex: number;
  data?: string;
}

interface UserChallengeProgress {
  id: number;
  userId: number;
  challengeId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  currentStep: number;
  completedSteps: string;
  startedAt?: string;
  completedAt?: string;
}

const ChallengeDetail = () => {
  const [, params] = useRoute('/challenges/:id');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const challengeId = parseInt(params?.id || '0');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepAnswers, setStepAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch challenge details
  const { data: challenge, isLoading: challengeLoading, error: challengeError } = useQuery<Challenge>({
    queryKey: [`/api/challenges/${challengeId}`],
    enabled: !!challengeId,
    staleTime: 60000,
    retry: 3,
  });

  // Fetch user progress
  const { data: userProgress, isLoading: progressLoading, error: progressError } = useQuery<UserChallengeProgress[]>({
    queryKey: ['/api/user/challenges'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 30000,
    retry: 3,
  });

  // Get user progress for this challenge
  const currentProgress = userProgress?.find(p => p.challengeId === challengeId);
  const completedSteps = currentProgress?.completedSteps ? JSON.parse(currentProgress.completedSteps) : [];

  // Start challenge mutation
  const startChallengeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/user/challenges/${challengeId}/start`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/challenges'] });
      toast({
        title: '¡Desafío iniciado!',
        description: 'Has comenzado el desafío exitosamente.',
      });
    },
  });

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: (stepId: number) =>
      apiRequest(`/api/user/challenges/${challengeId}/step/${stepId}/complete`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/challenges'] });
    },
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/user/challenges/${challengeId}/complete`, 'POST'),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/badges'] });

      toast({
        title: '¡Desafío completado!',
        description: `¡Felicitaciones! Has ganado ${challenge?.experience} XP.`,
      });

      if (data.newBadges && data.newBadges.length > 0) {
        toast({
          title: '¡Nuevos logros desbloqueados!',
          description: `Has obtenido ${data.newBadges.length} nuevos badges.`,
        });
      }
    },
  });

  // Get level info — level identity labels, no decorative color blobs
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Vos', icon: Heart };
      case 2: return { name: 'Tu Familia', icon: Users };
      case 3: return { name: 'Tu Barrio', icon: BookOpen };
      case 4: return { name: 'Tu Provincia', icon: TrendingUp };
      case 5: return { name: 'La Nación', icon: Star };
      default: return { name: 'Vos', icon: Heart };
    }
  };

  // Get difficulty label — difficulty tier is semantic encoding (rule 6), kept muted
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { label: 'Principiante', cls: 'bg-white/5 border-white/10 text-slate-400' };
      case 'intermediate': return { label: 'Intermedio', cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
      case 'advanced': return { label: 'Avanzado', cls: 'bg-red-500/10 border-red-500/20 text-red-400' };
      default: return { label: difficulty, cls: 'bg-white/5 border-white/10 text-slate-400' };
    }
  };

  const handleStartChallenge = () => {
    startChallengeMutation.mutate();
  };

  const handleStepAnswer = (stepId: number, answer: any) => {
    setStepAnswers(prev => ({ ...prev, [stepId]: answer }));
  };

  const handleCompleteStep = async (stepId: number) => {
    setIsSubmitting(true);
    try {
      await completeStepMutation.mutateAsync(stepId);
      setCurrentStepIndex(prev => prev + 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo completar el paso. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteChallenge = async () => {
    setIsSubmitting(true);
    try {
      await completeChallengeMutation.mutateAsync();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo completar el desafío. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepCompleted = (stepId: number) => {
    return completedSteps.includes(stepId);
  };

  const getCurrentStep = () => {
    if (!challenge?.steps || currentStepIndex >= challenge.steps.length) return null;
    return challenge.steps[currentStepIndex];
  };

  const renderStepContent = (step: ChallengeStep) => {
    const stepData = step.data ? JSON.parse(step.data) : {};

    switch (step.type) {
      case 'question':
        return (
          <div className="space-y-4">
            <p className="text-slate-300">{step.description}</p>
            {stepData.prompt && (
              <div>
                <Label htmlFor={`step-${step.id}`} className="text-sm font-medium text-slate-300">
                  {stepData.prompt}
                </Label>
                <Textarea
                  id={`step-${step.id}`}
                  placeholder="Escribí tu respuesta acá..."
                  value={stepAnswers[step.id] || ''}
                  onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                  rows={4}
                  className="mt-2 bg-white/5 border-white/10 text-slate-200 focus:border-[#7D5BDE]/50"
                />
              </div>
            )}
            {stepData.questions && (
              <div className="space-y-3">
                {stepData.questions.map((question: string, index: number) => (
                  <div key={index}>
                    <Label className="text-sm font-medium text-slate-300">{question}</Label>
                    <Textarea
                      placeholder="Tu respuesta..."
                      value={stepAnswers[`${step.id}-${index}` as any] || ''}
                      onChange={(e) => handleStepAnswer(`${step.id}-${index}` as any, e.target.value)}
                      rows={2}
                      className="mt-1 bg-white/5 border-white/10 text-slate-200 focus:border-[#7D5BDE]/50"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="space-y-4">
            <p className="text-slate-300">{step.description}</p>
            {stepData.prompt && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <h4 className="font-medium text-slate-200 mb-2">Acción a realizar:</h4>
                <p className="text-slate-400">{stepData.prompt}</p>
              </div>
            )}
            {stepData.rules && (
              /* success/rules block — neutral glass card */
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <h4 className="font-medium text-slate-200 mb-2">Reglas:</h4>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {stepData.rules.map((rule: string, index: number) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            {stepData.topics && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <h4 className="font-medium text-slate-200 mb-2">Temas sugeridos:</h4>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {stepData.topics.map((topic: string, index: number) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <Label htmlFor={`step-${step.id}`} className="text-sm font-medium text-slate-300">
                ¿Qué aprendiste de esta acción?
              </Label>
              <Textarea
                id={`step-${step.id}`}
                placeholder="Compartí tu experiencia y reflexiones..."
                value={stepAnswers[step.id] || ''}
                onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                rows={3}
                className="mt-2 bg-white/5 border-white/10 text-slate-200 focus:border-[#7D5BDE]/50"
              />
            </div>
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-4">
            <p className="text-slate-300">{step.description}</p>
            {stepData.prompt && (
              <div>
                <Label htmlFor={`step-${step.id}`} className="text-sm font-medium text-slate-300">
                  {stepData.prompt}
                </Label>
                <Textarea
                  id={`step-${step.id}`}
                  placeholder="Reflexioná sobre este tema..."
                  value={stepAnswers[step.id] || ''}
                  onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                  rows={5}
                  className="mt-2 bg-white/5 border-white/10 text-slate-200 focus:border-[#7D5BDE]/50"
                />
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-slate-300">{step.description}</p>
            {stepData.options && (
              <RadioGroup
                value={stepAnswers[step.id] || ''}
                onValueChange={(value) => handleStepAnswer(step.id, value)}
              >
                {stepData.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${step.id}-${index}`} />
                    <Label htmlFor={`option-${step.id}-${index}`} className="text-slate-300">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );

      default:
        return <p className="text-slate-300">{step.description}</p>;
    }
  };

  if (!userContext?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5BDE] mx-auto mb-4" />
          <p className="text-slate-400">Cargando desafío...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (challengeError || progressError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          {/* error state = red/destructive (rule 6) */}
          <div className="text-red-400 mb-4">
            <Target className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold text-slate-200">Error al cargar desafío</h2>
            <p className="text-slate-400 mt-2">
              No se pudo cargar el desafío. Por favor, intenta de nuevo.
            </p>
          </div>
          <div className="flex space-x-2 justify-center">
            <Button className={ACCENT_BUTTON} onClick={() => window.location.reload()}>
              Recargar página
            </Button>
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5" onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (challengeLoading || !challenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5BDE] mx-auto mb-4" />
          <p className="text-slate-400">Cargando desafío...</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(challenge.level);
  const LevelIcon = levelInfo.icon;
  const diffInfo = getDifficultyLabel(challenge.difficulty);
  const currentStep = getCurrentStep();
  const isCompleted = currentProgress?.status === 'completed';
  const isInProgress = currentProgress?.status === 'in_progress';
  const progressPercentage = challenge.steps.length > 0 ? (completedSteps.length / challenge.steps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      {/* Header bar */}
      <div className="border-b border-white/5 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/challenges">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 text-slate-300 rounded-lg flex items-center justify-center">
                  <LevelIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className={cn('text-2xl font-bold font-serif', DISPLAY_GRADIENT)}>{challenge.title}</h1>
                  <p className="text-slate-500 text-sm">Nivel {challenge.level}: {levelInfo.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* difficulty tier = semantic encoding (rule 6) — amber/red muted */}
              <Badge variant="outline" className={cn('text-[10px]', diffInfo.cls)}>
                {diffInfo.label}
              </Badge>
              {/* XP = progress encoding (rule 6) */}
              <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-slate-400">
                {challenge.experience} XP
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Challenge Info */}
            <Card className={GLASS_CARD}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-slate-200">
                  <span>Información del Desafío</span>
                  {/* completed check = success semantic (rule 6) */}
                  {isCompleted && <CheckCircle className="h-6 w-6 text-emerald-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">{challenge.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{challenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{challenge.frequency}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{challenge.steps.length} pasos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{challenge.experience} XP</span>
                  </div>
                </div>

                {/* Progress */}
                {isInProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Progreso</span>
                      <span>{completedSteps.length}/{challenge.steps.length}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-white/5" indicatorClassName="bg-[#7D5BDE]" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Steps */}
            {!isCompleted && (
              <Card className={GLASS_CARD}>
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Target className="h-5 w-5 mr-2" />
                    Pasos del Desafío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {challenge.steps.map((step, index) => (
                      <div key={step.id} className={cn(
                        'p-4 border rounded-lg',
                        /* completed step = success semantic (rule 6) */
                        isStepCompleted(step.id) ? 'bg-emerald-500/5 border-emerald-500/20' :
                        index === currentStepIndex ? 'bg-[#7D5BDE]/5 border-[#7D5BDE]/20' : 'bg-white/[0.02] border-white/5'
                      )}>
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                            /* completed = success (rule 6), active = violet (action), pending = neutral */
                            isStepCompleted(step.id) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            index === currentStepIndex ? 'bg-[#7D5BDE]/20 text-[#B5A3EF] border border-[#7D5BDE]/30' :
                            'bg-white/5 text-slate-500 border border-white/10'
                          )}>
                            {isStepCompleted(step.id) ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-200">{step.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{step.description}</p>

                            {index === currentStepIndex && (
                              <div className="mt-4">
                                {renderStepContent(step)}
                                <div className="mt-4 flex justify-end">
                                  <Button
                                    onClick={() => handleCompleteStep(step.id)}
                                    disabled={isSubmitting}
                                    className={cn('flex items-center', ACCENT_BUTTON)}
                                  >
                                    {isSubmitting ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Completar Paso
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completion Actions */}
            <Card className={GLASS_CARD}>
              <CardContent className="p-6">
                {!currentProgress ? (
                  <div className="text-center space-y-4">
                    <Target className="h-12 w-12 text-slate-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-200">¿Listo para comenzar?</h3>
                    <p className="text-slate-400">
                      Este desafío te ayudará a avanzar en tu Guía del Cambio.
                      Tómate tu tiempo y reflexioná sobre cada paso.
                    </p>
                    <Button
                      onClick={handleStartChallenge}
                      disabled={startChallengeMutation.isPending}
                      className={cn('flex items-center', ACCENT_BUTTON)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Desafío
                    </Button>
                  </div>
                ) : isCompleted ? (
                  <div className="text-center space-y-4">
                    {/* Trophy = success reward (rule 6) */}
                    <Trophy className="h-12 w-12 text-amber-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-200">¡Desafío Completado!</h3>
                    <p className="text-slate-400">
                      Felicitaciones por completar este desafío. Has ganado {challenge.experience} XP.
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Link href="/challenges">
                        <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                          Ver Más Desafíos
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button className={ACCENT_BUTTON}>
                          Ir al panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : completedSteps.length === challenge.steps.length ? (
                  <div className="text-center space-y-4">
                    <Award className="h-12 w-12 text-slate-300 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-200">¡Todos los pasos completados!</h3>
                    <p className="text-slate-400">
                      Has completado todos los pasos de este desafío.
                      ¡Es hora de reclamar tu recompensa!
                    </p>
                    <Button
                      onClick={handleCompleteChallenge}
                      disabled={isSubmitting}
                      className={cn('flex items-center', ACCENT_BUTTON)}
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Trophy className="h-4 w-4 mr-2" />
                      )}
                      Completar Desafío
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Target className="h-12 w-12 text-slate-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-200">Desafío en Progreso</h3>
                    <p className="text-slate-400">
                      Continuá completando los pasos para avanzar en tu Guía del Cambio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Challenge Stats */}
            <Card className={GLASS_CARD}>
              <CardHeader>
                <CardTitle className="text-slate-200">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dificultad</span>
                  {/* difficulty = semantic tier encoding (rule 6) */}
                  <Badge variant="outline" className={cn('text-[10px]', diffInfo.cls)}>
                    {diffInfo.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frecuencia</span>
                  <span className="font-medium text-slate-300">{challenge.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duración</span>
                  <span className="font-medium text-slate-300">{challenge.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experiencia</span>
                  <span className="font-medium text-slate-300">{challenge.experience} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pasos</span>
                  <span className="font-medium text-slate-300">{challenge.steps.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            {isInProgress && (
              <Card className={GLASS_CARD}>
                <CardHeader>
                  <CardTitle className="text-slate-200">Tu Progreso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pasos completados</span>
                    <span className="font-medium text-slate-300">{completedSteps.length}/{challenge.steps.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 bg-white/5" indicatorClassName="bg-[#7D5BDE]" />
                  <div className="text-sm text-slate-500">
                    {Math.round(progressPercentage)}% completado
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className={GLASS_CARD}>
              <CardHeader>
                <CardTitle className="text-slate-200">Consejos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/20" />
                  <p className="text-sm text-slate-400">
                    Tómate tu tiempo para reflexionar sobre cada paso
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/20" />
                  <p className="text-sm text-slate-400">
                    No hay respuestas correctas o incorrectas
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/20" />
                  <p className="text-sm text-slate-400">
                    Compartí tus reflexiones con otros si te sentís cómodo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChallengeDetail;
