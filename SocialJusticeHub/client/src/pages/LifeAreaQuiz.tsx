import React, { useState, useContext } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: string;
  orderIndex: number;
  category: 'current' | 'desired';
  subcategoryId: number | null;
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

const LifeAreaQuiz = () => {
  const [, params] = useRoute('/life-areas/:areaId/quiz');
  const [, setLocation] = useLocation();
  const areaId = parseInt(params?.areaId || '0');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [responses, setResponses] = useState<Record<number, { current: number; desired: number }>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch quiz
  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: [`/api/life-areas/${areaId}/quiz`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/quiz`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch area info
  const { data: area } = useQuery({
    queryKey: [`/api/life-areas/${areaId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch area');
      }
      return response.json();
    },
    enabled: areaId > 0,
  });

  // Submit quiz mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/life-areas/${areaId}/quiz/submit`, {
        responses: Object.entries(responses).map(([questionId, values]) => ({
          questionId: parseInt(questionId),
          currentValue: values.current,
          desiredValue: values.desired,
        })),
      });
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      return response.json();
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      toast({
        title: '¡Quiz completado!',
        description: 'Tu evaluación ha sido guardada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/wheel'] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/scores`] });
      setTimeout(() => {
        setLocation(`/life-areas/${areaId}`);
      }, 1500);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu evaluación. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    },
  });

  // Initialize responses from quiz questions
  React.useEffect(() => {
    if (quiz?.questions) {
      const initialResponses: Record<number, { current: number; desired: number }> = {};
      quiz.questions.forEach((q) => {
        // Usar valores previos si existen, sino valores por defecto
        const currentVal = q.currentValue !== null && q.currentValue !== undefined 
          ? Math.max(0, Math.min(100, q.currentValue)) 
          : 50;
        const desiredVal = q.desiredValue !== null && q.desiredValue !== undefined 
          ? Math.max(0, Math.min(100, q.desiredValue)) 
          : 75;
        
        initialResponses[q.id] = {
          current: currentVal,
          desired: desiredVal,
        };
      });
      setResponses(initialResponses);
      setHasUnsavedChanges(false);
    }
  }, [quiz]);

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Acceso Requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para completar el quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/login')}>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz || !area) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                No se pudo cargar el quiz. Por favor, intenta nuevamente.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Group questions by category and ensure we have valid questions
  const currentQuestions = quiz.questions.filter(q => q && q.category === 'current' && q.questionText);
  const desiredQuestions = quiz.questions.filter(q => q && q.category === 'desired' && q.questionText);

  // Combine and sort by orderIndex
  const allQuestions = [...currentQuestions, ...desiredQuestions].sort((a, b) => a.orderIndex - b.orderIndex);

  // Validar que tenemos preguntas
  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                No hay preguntas disponibles en este quiz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/life-areas')}>
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQuestion = allQuestions[currentStep];
  const progress = allQuestions.length > 0 ? ((currentStep + 1) / allQuestions.length) * 100 : 0;
  const isLastQuestion = currentStep === allQuestions.length - 1;
  const canSubmit = Object.keys(responses).length === allQuestions.length && 
                    allQuestions.every(q => {
                      const response = responses[q.id];
                      return response && 
                             (response.current !== undefined || response.desired !== undefined);
                    });

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      toast({
        title: 'Faltan respuestas',
        description: 'Por favor completa todas las preguntas antes de enviar.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validar que todas las respuestas estén en el rango correcto
    const invalidResponses = Object.entries(responses).filter(([_, values]) => {
      return (values.current !== undefined && (values.current < 0 || values.current > 100)) ||
             (values.desired !== undefined && (values.desired < 0 || values.desired > 100));
    });

    if (invalidResponses.length > 0) {
      toast({
        title: 'Valores inválidos',
        description: 'Algunas respuestas tienen valores fuera del rango permitido (0-100).',
        variant: 'destructive',
      });
      return;
    }

    submitMutation.mutate();
  };

  const updateResponse = (questionId: number, value: number, type: 'current' | 'desired') => {
    // Validar que el valor esté en el rango correcto
    const clampedValue = Math.max(0, Math.min(100, value));
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [type]: clampedValue,
      },
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/life-areas')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{currentStep + 1} de {allQuestions.length}</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.category === 'current' 
                  ? 'Estado Actual' 
                  : 'Estado Deseado'}
              </CardTitle>
              <CardDescription>
                {currentQuestion.questionText}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Value Slider */}
              {currentQuestion.category === 'current' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Estado Actual</span>
                    <span className="text-sm font-bold text-blue-600">
                      {responses[currentQuestion.id]?.current || 50}
                    </span>
                  </div>
                  <Slider
                    value={[responses[currentQuestion.id]?.current || 50]}
                    onValueChange={(value) => updateResponse(currentQuestion.id, value[0], 'current')}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Muy bajo</span>
                    <span>Excelente</span>
                  </div>
                </div>
              )}

              {/* Desired Value Slider */}
              {currentQuestion.category === 'desired' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Estado Deseado</span>
                    <span className="text-sm font-bold text-purple-600">
                      {responses[currentQuestion.id]?.desired || 75}
                    </span>
                  </div>
                  <Slider
                    value={[responses[currentQuestion.id]?.desired || 75]}
                    onValueChange={(value) => updateResponse(currentQuestion.id, value[0], 'desired')}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No importante</span>
                    <span>Muy importante</span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={submitMutation.isPending}
                >
                  {isLastQuestion ? (
                    <>
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar Quiz
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigation Dots */}
        <div className="flex justify-center gap-2 flex-wrap">
          {allQuestions.map((q, index) => {
            const hasResponse = responses[q.id] !== undefined;
            const isCurrent = index === currentStep;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-blue-600 w-8'
                    : hasResponse
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                title={q.questionText}
              />
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LifeAreaQuiz;

