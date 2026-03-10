import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import QuizQuestion from '@/components/QuizQuestion';
import { useContext } from 'react';
import { UserContext } from '@/App';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  allowRetakes: boolean;
  maxAttempts?: number;
}

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
  orderIndex: number;
}

type QuizState = 'instructions' | 'taking' | 'results';

const QuizView = () => {
  const { courseSlug } = useParams();
  const { toast } = useToast();
  const userContext = useContext(UserContext)!;
  const [state, setState] = useState<QuizState>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Fetch course and quiz data
  const { data: courseData } = useQuery({
    queryKey: ['course', courseSlug],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseSlug}`);
      if (!response.ok) throw new Error('Error al cargar el curso');
      return response.json();
    },
  });

  const quiz: Quiz | null = courseData?.quiz;
  const questions: Question[] = quiz ? (courseData?.quiz.questions || []) : [];
  const course = courseData?.course;

  // Timer effect
  useEffect(() => {
    if (state === 'taking' && quiz?.timeLimit && timeRemaining !== null) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state, quiz?.timeLimit, timeRemaining]);

  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${course?.id}/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar el quiz');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAttemptId(data.attemptId);
      setStartTime(new Date());
      if (quiz?.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert to seconds
      }
      setState('taking');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));

      const response = await fetch(
        `/api/courses/${course?.id}/quiz/attempt/${attemptId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ answers: answersArray })
        }
      );
      if (!response.ok) throw new Error('Error al enviar el quiz');
      return response.json();
    },
    onSuccess: (data) => {
      setState('results');
      const quizXp = data?.xpAwarded?.quiz ?? 0;
      const certificateXp = data?.xpAwarded?.certificate ?? 0;
      const xpParts = [];
      if (quizXp > 0) {
        xpParts.push(`${quizXp} XP del quiz`);
      }
      if (certificateXp > 0) {
        xpParts.push(`${certificateXp} XP por tu certificado`);
      }
      if (xpParts.length) {
        toast({
          title: '¡Resultados listos!',
          description: `Ganaste ${xpParts.join(' y ')}.`,
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el quiz',
        variant: 'destructive'
      });
    }
  });

  const handleStartQuiz = () => {
    if (!userContext.isLoggedIn) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para tomar el quiz',
        variant: 'destructive'
      });
      return;
    }
    startQuizMutation.mutate();
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinishQuiz = () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `Tienes ${unanswered.length} pregunta(s) sin responder. ¿Deseas finalizar el quiz de todas formas?`
      );
      if (!confirm) return;
    }
    submitQuizMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (course) {
      document.title = `Quiz - ${course.title}`;
    }
    window.scrollTo(0, 0);
  }, [course]);

  if (!userContext.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Inicia sesión requerido</h2>
              <p className="text-gray-600 mb-6">
                Debes iniciar sesión para tomar este quiz
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button>Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Registrarse</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Quiz no encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 theme-light">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href={`/recursos/guias-estudio/${courseSlug}`}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Curso
          </Button>
        </Link>

        <AnimatePresence mode="wait">
          {state === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="text-base">
                      {quiz.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Instrucciones</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Número de preguntas: {questions.length}</li>
                      <li>• Puntuación mínima para aprobar: {quiz.passingScore}%</li>
                      {quiz.timeLimit && (
                        <li>• Tiempo límite: {quiz.timeLimit} minutos</li>
                      )}
                      <li>• Reintentos permitidos: {quiz.allowRetakes ? 'Sí' : 'No'}</li>
                      {quiz.maxAttempts && (
                        <li>• Máximo de intentos: {quiz.maxAttempts}</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      size="lg" 
                      onClick={handleStartQuiz}
                      disabled={startQuizMutation.isPending}
                      className="flex-1"
                    >
                      {startQuizMutation.isPending ? 'Iniciando...' : 'Comenzar Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === 'taking' && (
            <motion.div
              key="taking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
                      <CardDescription>
                        Pregunta {currentQuestion + 1} de {questions.length}
                      </CardDescription>
                    </div>
                    {timeRemaining !== null && (
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="w-5 h-5" />
                        {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardHeader>

                <CardContent>
                  {currentQ && (
                    <div className="mb-6">
                      <QuizQuestion
                        question={currentQ}
                        answer={answers[currentQ.id]}
                        onChange={(answer) => handleAnswer(currentQ.id, answer)}
                        showResult={false}
                      />
                    </div>
                  )}

                  {/* Question Navigation Grid */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Navegación de Preguntas ({answeredCount}/{questions.length} respondidas)
                    </h3>
                    <div className="grid grid-cols-10 gap-2">
                      {questions.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = index === currentQuestion;
                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrentQuestion(index)}
                            className={`
                              h-10 rounded-lg text-sm font-medium transition-colors
                              ${isCurrent 
                                ? 'bg-blue-600 text-white' 
                                : isAnswered 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }
                            `}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={handleFinishQuiz}
                      disabled={submitQuizMutation.isPending}
                      className="gap-2"
                    >
                      {submitQuizMutation.isPending ? 'Enviando...' : 'Finalizar Quiz'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentQuestion === questions.length - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === 'results' && submitQuizMutation.data && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">Resultados del Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                      submitQuizMutation.data.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {submitQuizMutation.data.passed ? (
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      ) : (
                        <XCircle className="w-12 h-12 text-red-600" />
                      )}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${
                      submitQuizMutation.data.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {submitQuizMutation.data.passed ? '¡Aprobado!' : 'No Aprobado'}
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {submitQuizMutation.data.score}%
                    </p>
                    <p className="text-gray-600">
                      Puntuación mínima requerida: {quiz.passingScore}%
                    </p>
                  </div>

                  {(() => {
                    const quizXp = submitQuizMutation.data.xpAwarded?.quiz ?? 0;
                    const certificateXp = submitQuizMutation.data.xpAwarded?.certificate ?? 0;
                    const hasXp = quizXp > 0 || certificateXp > 0;
                    if (!hasXp) return null;
                    return (
                      <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Recompensas de XP
                        </h3>
                        <p className="text-emerald-800">
                          {quizXp > 0 && <span className="font-medium">+{quizXp} XP por completar el quiz.</span>}
                          {' '}
                          {certificateXp > 0 && (
                            <span className="font-medium">
                              +{certificateXp} XP extra por generar tu certificado.
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Answer Breakdown */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-xl font-bold mb-4">Desglose de Respuestas</h3>
                    {questions.map((question) => {
                      const userAnswer = answers[question.id];
                      const correctAnswer = JSON.parse(question.correctAnswer);
                      const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
                      const answerData = submitQuizMutation.data.answers?.find(
                        (a: any) => a.questionId === question.id
                      );

                      return (
                        <Card key={question.id} className={
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-600" />
                                  )}
                                  <span className="font-semibold">{question.question}</span>
                                </div>
                                <div className="ml-7 space-y-1 text-sm">
                                  <div>
                                    <span className="text-gray-600">Tu respuesta: </span>
                                    <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                      {typeof userAnswer === 'object' 
                                        ? JSON.stringify(userAnswer) 
                                        : String(userAnswer || 'Sin responder')}
                                    </span>
                                  </div>
                                  {!isCorrect && (
                                    <div>
                                      <span className="text-gray-600">Respuesta correcta: </span>
                                      <span className="text-green-700 font-medium">
                                        {typeof correctAnswer === 'object' 
                                          ? JSON.stringify(correctAnswer) 
                                          : String(correctAnswer)}
                                      </span>
                                    </div>
                                  )}
                                  {question.explanation && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                                      <strong>Explicación:</strong> {question.explanation}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    Puntos: {answerData?.pointsEarned || 0} / {question.points}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {submitQuizMutation.data.passed && submitQuizMutation.data.certificateCode && (
                      <Link href={`/recursos/guias-estudio/${courseSlug}`}>
                        <Button size="lg" className="gap-2">
                          <Award className="w-5 h-5" />
                          Ver Certificado
                        </Button>
                      </Link>
                    )}
                    {!submitQuizMutation.data.passed && quiz.allowRetakes && (
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => {
                          setState('instructions');
                          setAnswers({});
                          setCurrentQuestion(0);
                          setAttemptId(null);
                          setTimeRemaining(null);
                        }}
                        className="gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reintentar
                      </Button>
                    )}
                    <Link href={`/recursos/guias-estudio/${courseSlug}`}>
                      <Button size="lg" variant="outline">
                        Volver al Curso
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default QuizView;
