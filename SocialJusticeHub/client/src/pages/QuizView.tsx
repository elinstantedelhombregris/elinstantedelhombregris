import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
import { buildQuizMetadata } from '@shared/course-seo';
import { useSeoMetadata } from '@/lib/seo';
import { apiRequest } from '@/lib/queryClient';
import { areRequiredLessonsComplete, parseCompletedLessonIds } from '@/lib/course-surface';

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

interface CourseLesson {
  id: number;
  orderIndex: number;
  isRequired: boolean;
}

interface CourseProgress {
  completedLessons?: string;
}

interface CourseData {
  course?: {
    id: number;
    slug: string;
    title: string;
    description: string;
    excerpt?: string | null;
    searchSummary?: string | null;
    thumbnailUrl?: string | null;
    ogImageUrl?: string | null;
  };
  quiz?: (Quiz & { questions?: Question[] }) | null;
  lessons?: CourseLesson[];
  completedLessons?: unknown;
  userProgress?: CourseProgress | null;
}

const QuizView = () => {
  const { courseSlug } = useParams();
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const isLoggedIn = userContext?.isLoggedIn ?? false;
  const [state, setState] = useState<QuizState>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Fetch course and quiz data
  const { data: courseData } = useQuery<CourseData>({
    queryKey: ['course', courseSlug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/courses/${courseSlug}`);
      if (!response.ok) throw new Error('Error al cargar el curso');
      return response.json();
    },
  });

  const quiz = courseData?.quiz ?? null;
  const questions: Question[] = quiz?.questions ?? [];
  const course = courseData?.course;
  const lessons = courseData?.lessons ?? [];
  const completedLessons = parseCompletedLessonIds(courseData?.completedLessons, courseData?.userProgress?.completedLessons);
  const quizUnlocked = areRequiredLessonsComplete(lessons, completedLessons);
  const seoMetadata = useMemo(
    () => (course ? buildQuizMetadata(course, typeof window !== 'undefined' ? window.location.origin : undefined) : null),
    [course],
  );
  useSeoMetadata(seoMetadata);

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
      const response = await apiRequest('POST', `/api/courses/${course?.id}/quiz/attempt`);
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

      const response = await apiRequest(
        'POST',
        `/api/courses/${course?.id}/quiz/attempt/${attemptId}/submit`,
        { answers: answersArray }
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
    if (!isLoggedIn) {
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
    window.scrollTo(0, 0);
  }, [course]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <AlertCircle aria-hidden="true" className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Inicia sesión requerido</h2>
            <p className="text-slate-400 mb-6">
              Debes iniciar sesión para tomar este quiz
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-slate-400">Quiz no encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quizUnlocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <AlertCircle aria-hidden="true" className="w-16 h-16 text-amber-500/70 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Quiz todavía bloqueado</h2>
            <p className="text-slate-400 mb-6">
              Completa las lecciones requeridas del curso antes de rendir el quiz final.
            </p>
            <Link href={`/recursos/guias-estudio/${courseSlug}`}>
              <Button className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]">
                Volver al curso
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href={`/recursos/guias-estudio/${courseSlug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-sm">
          <span className="group mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
            <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al Curso
          </span>
        </Link>

        <AnimatePresence mode="wait">
          {state === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <h1 className="font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] mb-2">
                  {quiz.title}
                </h1>
                {quiz.description && (
                  <p className="text-slate-400 text-base mb-6">
                    {quiz.description}
                  </p>
                )}

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{questions.length} preguntas</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Mínimo {quiz.passingScore}%</span>
                    {quiz.timeLimit && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{quiz.timeLimit} minutos</span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Reintentos: {quiz.allowRetakes ? 'Sí' : 'No'}</span>
                    {quiz.maxAttempts && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Máx. {quiz.maxAttempts} intentos</span>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      disabled={startQuizMutation.isPending}
                      className="flex-1 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                    >
                      {startQuizMutation.isPending ? 'Iniciando...' : 'Comenzar Quiz'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'taking' && (
            <motion.div
              key="taking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03]">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-100 mb-1">{quiz.title}</h2>
                      <p className="text-slate-500 text-sm">
                        Pregunta {currentQuestion + 1} de {questions.length}
                      </p>
                    </div>
                    {timeRemaining !== null && (
                      <div className={`flex items-center gap-2 text-lg font-semibold ${timeRemaining < 60 ? 'text-red-400' : 'text-slate-200'}`}>
                        <Clock aria-hidden="true" className="w-5 h-5" />
                        {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-[#7D5BDE] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {currentQ && (
                    <div className="mb-6">
                      <QuizQuestion
                        variant="dark"
                        question={currentQ}
                        answer={answers[currentQ.id]}
                        onChange={(answer) => handleAnswer(currentQ.id, answer)}
                        showResult={false}
                      />
                    </div>
                  )}

                  {/* Question Navigation Grid */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
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
                            className={`h-10 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                              isCurrent
                                ? 'bg-transparent text-violet-300 ring-2 ring-[#7D5BDE]'
                                : isAnswered
                                  ? 'bg-[#7D5BDE] text-white'
                                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
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
                      className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
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
                </div>
              </div>
            </motion.div>
          )}

          {state === 'results' && submitQuizMutation.data && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03]">
                {/* Header */}
                <div className="p-6 pb-0">
                  <h2 className="font-serif text-3xl font-bold text-slate-100 mb-2">Resultados del Quiz</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Score block */}
                  <div className="mb-8 text-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.12, 1], opacity: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border ${
                        submitQuizMutation.data.passed
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      {submitQuizMutation.data.passed ? (
                        <CheckCircle2 aria-hidden="true" className="h-12 w-12 text-emerald-400" />
                      ) : (
                        <XCircle aria-hidden="true" className="h-12 w-12 text-red-400" />
                      )}
                    </motion.div>
                    <h3 className={`mb-2 text-2xl font-bold ${submitQuizMutation.data.passed ? 'text-emerald-300' : 'text-red-300'}`}>
                      {submitQuizMutation.data.passed ? '¡Aprobado!' : 'No Aprobado'}
                    </h3>
                    <p className="mb-2 font-serif text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]">
                      {submitQuizMutation.data.score}%
                    </p>
                    <p className="text-slate-500">
                      Puntuación mínima requerida: {quiz.passingScore}%
                    </p>
                  </div>

                  {(() => {
                    const quizXp = submitQuizMutation.data.xpAwarded?.quiz ?? 0;
                    const certificateXp = submitQuizMutation.data.xpAwarded?.certificate ?? 0;
                    const hasXp = quizXp > 0 || certificateXp > 0;
                    if (!hasXp) return null;
                    return (
                      <div className="mb-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-emerald-300">
                          <Award aria-hidden="true" className="w-5 h-5" />
                          Recompensas de XP
                        </h3>
                        <p className="text-emerald-200/90">
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
                    <h3 className="font-serif text-xl font-bold text-slate-100 mb-4">Desglose de Respuestas</h3>
                    {questions.map((question) => {
                      const userAnswer = answers[question.id];
                      const correctAnswer = JSON.parse(question.correctAnswer);
                      const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
                      const answerData = submitQuizMutation.data.answers?.find(
                        (a: any) => a.questionId === question.id
                      );

                      return (
                        <div
                          key={question.id}
                          className={isCorrect
                            ? 'rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4'
                            : 'rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4'
                          }
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                  <CheckCircle aria-hidden="true" className="w-5 h-5 text-emerald-400 shrink-0" />
                                ) : (
                                  <X aria-hidden="true" className="w-5 h-5 text-red-400 shrink-0" />
                                )}
                                <span className="font-semibold text-slate-200">{question.question}</span>
                              </div>
                              <div className="ml-7 space-y-1 text-sm">
                                <div>
                                  <span className="text-slate-500">Tu respuesta: </span>
                                  <span className={isCorrect ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'}>
                                    {typeof userAnswer === 'object'
                                      ? JSON.stringify(userAnswer)
                                      : String(userAnswer || 'Sin responder')}
                                  </span>
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <span className="text-slate-500">Respuesta correcta: </span>
                                    <span className="text-emerald-300 font-medium">
                                      {typeof correctAnswer === 'object'
                                        ? JSON.stringify(correctAnswer)
                                        : String(correctAnswer)}
                                    </span>
                                  </div>
                                )}
                                {question.explanation && (
                                  <div className="mt-2 rounded-lg bg-blue-500/10 p-2 text-blue-200/90">
                                    <strong className="text-blue-300">Explicación:</strong> {question.explanation}
                                  </div>
                                )}
                                <div className="text-xs text-slate-600">
                                  Puntos: {answerData?.pointsEarned || 0} / {question.points}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {submitQuizMutation.data.passed && submitQuizMutation.data.certificateCode && (
                      <Link href={`/recursos/guias-estudio/${courseSlug}`}>
                        <Button
                          size="lg"
                          className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                        >
                          <Award aria-hidden="true" className="w-5 h-5" />
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
                        <RotateCcw aria-hidden="true" className="w-5 h-5" />
                        Reintentar
                      </Button>
                    )}
                    <Link href={`/recursos/guias-estudio/${courseSlug}`}>
                      <Button size="lg" variant="outline">
                        Volver al Curso
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default QuizView;
