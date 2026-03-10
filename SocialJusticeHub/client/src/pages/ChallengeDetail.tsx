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

  // Get level info
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
      case 2: return { name: 'Tu Familia', color: 'from-pink-500 to-pink-600', icon: Users };
      case 3: return { name: 'Tu Barrio', color: 'from-green-500 to-green-600', icon: BookOpen };
      case 4: return { name: 'Tu Provincia', color: 'from-purple-500 to-purple-600', icon: TrendingUp };
      case 5: return { name: 'La Nación', color: 'from-indigo-500 to-indigo-600', icon: Star };
      default: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <p className="text-gray-700">{step.description}</p>
            {stepData.prompt && (
              <div>
                <Label htmlFor={`step-${step.id}`} className="text-sm font-medium">
                  {stepData.prompt}
                </Label>
                <Textarea
                  id={`step-${step.id}`}
                  placeholder="Escribe tu respuesta aquí..."
                  value={stepAnswers[step.id] || ''}
                  onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                  rows={4}
                />
              </div>
            )}
            {stepData.questions && (
              <div className="space-y-3">
                {stepData.questions.map((question: string, index: number) => (
                  <div key={index}>
                    <Label className="text-sm font-medium">{question}</Label>
                    <Textarea
                      placeholder="Tu respuesta..."
                      value={stepAnswers[`${step.id}-${index}` as any] || ''}
                      onChange={(e) => handleStepAnswer(`${step.id}-${index}` as any, e.target.value)}
                      rows={2}
                      className="mt-1"
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
            <p className="text-gray-700">{step.description}</p>
            {stepData.prompt && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Acción a realizar:</h4>
                <p className="text-blue-800">{stepData.prompt}</p>
              </div>
            )}
            {stepData.rules && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Reglas:</h4>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  {stepData.rules.map((rule: string, index: number) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            {stepData.topics && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Temas sugeridos:</h4>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  {stepData.topics.map((topic: string, index: number) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <Label htmlFor={`step-${step.id}`} className="text-sm font-medium">
                ¿Qué aprendiste de esta acción?
              </Label>
              <Textarea
                id={`step-${step.id}`}
                placeholder="Comparte tu experiencia y reflexiones..."
                value={stepAnswers[step.id] || ''}
                onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">{step.description}</p>
            {stepData.prompt && (
              <div>
                <Label htmlFor={`step-${step.id}`} className="text-sm font-medium">
                  {stepData.prompt}
                </Label>
                <Textarea
                  id={`step-${step.id}`}
                  placeholder="Reflexiona sobre este tema..."
                  value={stepAnswers[step.id] || ''}
                  onChange={(e) => handleStepAnswer(step.id, e.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">{step.description}</p>
            {stepData.options && (
              <RadioGroup
                value={stepAnswers[step.id] || ''}
                onValueChange={(value) => handleStepAnswer(step.id, value)}
              >
                {stepData.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${step.id}-${index}`} />
                    <Label htmlFor={`option-${step.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );

      default:
        return <p className="text-gray-700">{step.description}</p>;
    }
  };

  if (!userContext?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando desafío...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (challengeError || progressError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Target className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Error al cargar desafío</h2>
            <p className="text-gray-600 mt-2">
              No se pudo cargar el desafío. Por favor, intenta de nuevo.
            </p>
          </div>
          <div className="flex space-x-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (challengeLoading || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando desafío...</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(challenge.level);
  const LevelIcon = levelInfo.icon;
  const currentStep = getCurrentStep();
  const isCompleted = currentProgress?.status === 'completed';
  const isInProgress = currentProgress?.status === 'in_progress';
  const progressPercentage = challenge.steps.length > 0 ? (completedSteps.length / challenge.steps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/challenges">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${levelInfo.color} text-white rounded-lg flex items-center justify-center`}>
                  <LevelIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
                  <p className="text-gray-600">Nivel {challenge.level}: {levelInfo.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Información del Desafío</span>
                  {isCompleted && <CheckCircle className="h-6 w-6 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{challenge.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{challenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{challenge.frequency}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{challenge.steps.length} pasos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{challenge.experience} XP</span>
                  </div>
                </div>

                {/* Progress */}
                {isInProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{completedSteps.length}/{challenge.steps.length}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Steps */}
            {!isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Pasos del Desafío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {challenge.steps.map((step, index) => (
                      <div key={step.id} className={`p-4 border rounded-lg ${
                        isStepCompleted(step.id) ? 'bg-green-50 border-green-200' : 
                        index === currentStepIndex ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isStepCompleted(step.id) ? 'bg-green-500 text-white' :
                            index === currentStepIndex ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isStepCompleted(step.id) ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            
                            {index === currentStepIndex && (
                              <div className="mt-4">
                                {renderStepContent(step)}
                                <div className="mt-4 flex justify-end">
                                  <Button 
                                    onClick={() => handleCompleteStep(step.id)}
                                    disabled={isSubmitting}
                                    className="flex items-center"
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
            <Card>
              <CardContent className="p-6">
                {!currentProgress ? (
                  <div className="text-center space-y-4">
                    <Target className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900">¿Listo para comenzar?</h3>
                    <p className="text-gray-600">
                      Este desafío te ayudará a avanzar en tu Guía del Cambio. 
                      Tómate tu tiempo y reflexiona sobre cada paso.
                    </p>
                    <Button 
                      onClick={handleStartChallenge}
                      disabled={startChallengeMutation.isPending}
                      className="flex items-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Desafío
                    </Button>
                  </div>
                ) : isCompleted ? (
                  <div className="text-center space-y-4">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900">¡Desafío Completado!</h3>
                    <p className="text-gray-600">
                      Felicitaciones por completar este desafío. Has ganado {challenge.experience} XP.
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Link href="/challenges">
                        <Button variant="outline">
                          Ver Más Desafíos
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button>
                          Ir al panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : completedSteps.length === challenge.steps.length ? (
                  <div className="text-center space-y-4">
                    <Award className="h-12 w-12 text-blue-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900">¡Todos los pasos completados!</h3>
                    <p className="text-gray-600">
                      Has completado todos los pasos de este desafío. 
                      ¡Es hora de reclamar tu recompensa!
                    </p>
                    <Button 
                      onClick={handleCompleteChallenge}
                      disabled={isSubmitting}
                      className="flex items-center"
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
                    <Target className="h-12 w-12 text-blue-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900">Desafío en Progreso</h3>
                    <p className="text-gray-600">
                      Continúa completando los pasos para avanzar en tu Guía del Cambio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Challenge Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dificultad</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frecuencia</span>
                  <span className="font-medium">{challenge.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración</span>
                  <span className="font-medium">{challenge.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experiencia</span>
                  <span className="font-medium">{challenge.experience} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pasos</span>
                  <span className="font-medium">{challenge.steps.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            {isInProgress && (
              <Card>
                <CardHeader>
                  <CardTitle>Tu Progreso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pasos completados</span>
                    <span className="font-medium">{completedSteps.length}/{challenge.steps.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-sm text-gray-600">
                    {Math.round(progressPercentage)}% completado
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Consejos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Tómate tu tiempo para reflexionar sobre cada paso
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    No hay respuestas correctas o incorrectas
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Comparte tus reflexiones con otros si te sientes cómodo
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
