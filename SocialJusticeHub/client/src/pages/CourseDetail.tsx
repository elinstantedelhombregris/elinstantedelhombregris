import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  GraduationCap,
  CheckCircle2,
  BookOpen,
  Award,
  PlayCircle,
  FileText,
  ListChecks
} from 'lucide-react';
import LessonCard from '@/components/LessonCard';
import ProgressBar from '@/components/ProgressBar';
import { useContext } from 'react';
import { UserContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getCategoryLabel, getLevelLabel } from '@/lib/course-utils';
import { buildCourseMetadata } from '@shared/course-seo';
import { deriveSearchSummary } from '@shared/course-content';
import { useSeoMetadata } from '@/lib/seo';
import {
  areRequiredLessonsComplete,
  getContinueLessonId,
  isLessonLocked,
  parseCompletedLessonIds,
} from '@/lib/course-surface';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  category: string;
  level: string;
  duration?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  viewCount: number;
  isFeatured?: boolean;
  requiresAuth?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  searchSummary?: string | null;
  ogImageUrl?: string | null;
  lastReviewedAt?: string | null;
  indexable?: boolean | null;
  author?: {
    id: number;
    name: string;
  };
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  type: 'text' | 'video' | 'interactive' | 'document';
  duration?: number;
  orderIndex: number;
  isRequired: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  allowRetakes: boolean;
  maxAttempts?: number;
  questions: Array<{
    id: number;
    question: string;
    type: string;
    points: number;
  }>;
}

const CourseDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  
  // Provide default values if context is undefined (safety check)
  const safeUserContext = userContext || {
    user: null,
    setUser: () => {},
    isLoggedIn: false
  };
  const [activeTab, setActiveTab] = useState('content');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/courses/${slug}`);
      return response.json();
    },
  });

  const startCourseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/courses/${data?.course.id}/start`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', slug] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      toast({
        title: 'Curso iniciado',
        description: 'Puedes comenzar a estudiar ahora',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el curso',
        variant: 'destructive'
      });
    }
  });

  const course: Course | undefined = data?.course;
  const seoMetadata = useMemo(
    () => course ? buildCourseMetadata(course, typeof window !== 'undefined' ? window.location.origin : undefined) : null,
    [course],
  );
  useSeoMetadata(seoMetadata);

  useEffect(() => {
    // Removed automatic scroll - let user control scroll position
    // This prevents page jumping when data loads
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg-light">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen page-bg-light">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-destructive">Error al cargar el curso</p>
            <Link href="/recursos/guias-estudio">
              <Button variant="outline" className="mt-4">
                Volver a Rutas de Transformación
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Deduplicate lessons by ID to prevent duplicates
  const lessonsRaw: Lesson[] = data.lessons || [];
  const lessonsMap = new Map<number, Lesson>();
  lessonsRaw.forEach(lesson => {
    if (!lessonsMap.has(lesson.id)) {
      lessonsMap.set(lesson.id, lesson);
    }
  });
  const lessons: Lesson[] = Array.from(lessonsMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  const quiz: Quiz | null = data.quiz;
  const userProgress = data.userProgress;
  const completedLessons = parseCompletedLessonIds(data.completedLessons, userProgress?.completedLessons);

  const courseSummary = deriveSearchSummary(course.searchSummary, course.excerpt || course.description, 220);

  const isInProgress = userProgress?.status === 'in_progress';
  const isCompleted = userProgress?.status === 'completed';
  const progress = userProgress?.progress || 0;
  const requiresAuth = course.requiresAuth !== false;
  const lessonAccessContext = {
    lessons,
    completedLessonIds: completedLessons,
    requiresAuth,
    isLoggedIn: safeUserContext.isLoggedIn,
  };
  const continueLessonId = getContinueLessonId({
    ...lessonAccessContext,
    currentLessonId: userProgress?.currentLessonId,
  });
  const quizUnlocked = areRequiredLessonsComplete(lessons, completedLessons);
  const canTakeQuiz = Boolean(quiz) && safeUserContext.isLoggedIn && quizUnlocked;

  const handleStartCourse = () => {
    if (!safeUserContext.isLoggedIn) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para comenzar el curso',
        variant: 'destructive'
      });
      return;
    }
    startCourseMutation.mutate();
  };

  return (
    <div className="min-h-screen page-bg-light">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/recursos/guias-estudio">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Rutas de Transformación
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 rounded-3xl shadow-[0_35px_80px_rgba(15,23,42,0.08)] p-8 mb-8 border border-border/60"
            >
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-2xl mb-6"
                />
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-accent/10 text-accent border border-accent/25 tracking-[0.15em] uppercase text-[10px]">
                      {getCategoryLabel(course.category)}
                    </Badge>
                    <Badge variant="outline" className="border border-border/60 text-slate-700 tracking-[0.15em] uppercase text-[10px]">
                      {getLevelLabel(course.level)}
                    </Badge>
                    {course.isFeatured && (
                      <Badge variant="outline" className="border-accent/40 text-accent">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
                    {course.title}
                  </h1>
                  <p className="text-slate-700 text-lg">
                    {course.description}
                  </p>
                  {courseSummary && (
                    <div className="mt-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-1">
                        En síntesis
                      </p>
                      <p className="text-sm text-emerald-950/85 leading-relaxed">
                        {courseSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isInProgress && (
                <div className="mb-4">
                  <ProgressBar progress={progress} />
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center flex-wrap gap-4 text-sm text-slate-600">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration} minutos</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.viewCount} vistas</span>
                </div>
                {course.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{course.author.name}</span>
                  </div>
                )}
                {course.lastReviewedAt && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Revisado {new Date(course.lastReviewedAt).toLocaleDateString('es-AR')}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {safeUserContext.isLoggedIn ? (
                  isCompleted ? (
                    <div className="flex items-center gap-4">
                      {continueLessonId ? (
                        <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                          <Button size="lg" variant="outline" className="gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Repasar Curso
                          </Button>
                        </Link>
                      ) : (
                        <Button size="lg" variant="outline" className="gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Curso Completado
                        </Button>
                      )}
                      {canTakeQuiz && (
                        <Link href={`/recursos/guias-estudio/${course.slug}/quiz`}>
                          <Button size="lg" variant="outline" className="gap-2">
                            <Award className="w-5 h-5" />
                            Ir al Quiz
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : isInProgress && continueLessonId ? (
                    <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                      <Button size="lg" className="gap-2">
                        <PlayCircle className="w-5 h-5" />
                        Continuar Curso
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleStartCourse}
                      disabled={startCourseMutation.isPending}
                      className="gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      {startCourseMutation.isPending ? 'Iniciando...' : 'Comenzar Curso'}
                    </Button>
                  )
                ) : course.requiresAuth === false && continueLessonId ? (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                    <Button size="lg" className="gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Comenzar Curso
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button size="lg" disabled className="gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Inicia sesión para comenzar
                    </Button>
                    <p className="text-sm text-slate-600">
                      Regístrate gratis para acceder a este curso
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/95 rounded-3xl shadow-[0_30px_70px_rgba(15,23,42,0.06)] border border-border/60">
              <TabsList className="w-full justify-start p-2 rounded-2xl bg-white/70 border-b border-border/40">
                <TabsTrigger value="content" className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  <ListChecks className="w-4 h-4" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  <FileText className="w-4 h-4" />
                  Información
                </TabsTrigger>
                {quiz && (
                  <TabsTrigger value="quiz" className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900">
                    <Award className="w-4 h-4" />
                    Quiz
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="content" className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">Lecciones</h2>
                <div className="space-y-4">
                  {lessons.length === 0 ? (
                    <p className="text-slate-600">No hay lecciones disponibles aún.</p>
                  ) : (
                    lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isCurrent = userProgress?.currentLessonId === lesson.id;
                      const locked = isLessonLocked(lesson, lessonAccessContext);

                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          isCompleted={isCompleted}
                          isCurrent={isCurrent}
                          isLocked={locked}
                          order={index + 1}
                          courseSlug={course.slug}
                        />
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="info" className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">Acerca del Curso</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-slate-700 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </TabsContent>

              {quiz && (
                <TabsContent value="quiz" className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-slate-900">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="text-slate-600 mb-4">{quiz.description}</p>
                  )}
                  
                  <div className="bg-white/80 border border-border/50 rounded-2xl p-5 mb-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Información del Quiz</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li>Preguntas: {quiz.questions.length}</li>
                      <li>Puntuación mínima para aprobar: {quiz.passingScore}%</li>
                      {quiz.timeLimit && (
                        <li>Tiempo límite: {quiz.timeLimit} minutos</li>
                      )}
                      <li>Reintentos permitidos: {quiz.allowRetakes ? 'Sí' : 'No'}</li>
                      {quiz.maxAttempts && (
                        <li>Máximo de intentos: {quiz.maxAttempts}</li>
                      )}
                    </ul>
                  </div>

                  {safeUserContext.isLoggedIn ? (
                    canTakeQuiz ? (
                      <Link href={`/recursos/guias-estudio/${course.slug}/quiz`}>
                        <Button size="lg" className="gap-2">
                          <Award className="w-5 h-5" />
                          Tomar Quiz
                        </Button>
                      </Link>
                    ) : (
                      <p className="text-slate-600">
                        Completa las lecciones requeridas para desbloquear el quiz
                      </p>
                    )
                  ) : (
                    <p className="text-slate-600">
                      Inicia sesión para tomar el quiz
                    </p>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Progress Card */}
              {safeUserContext.isLoggedIn && userProgress && (
                <Card className="rounded-3xl border border-border/60 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <GraduationCap className="w-5 h-5" />
                      Tu Progreso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar progress={progress} />
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lecciones completadas</span>
                        <span className="font-medium text-slate-900">
                          {completedLessons.length} / {lessons.length}
                        </span>
                      </div>
                      {continueLessonId && (
                        <div className="text-slate-600">
                          Seguir con: {
                            lessons.find(l => l.id === continueLessonId)?.title
                          }
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Info Card */}
              <Card className="rounded-3xl border border-border/60 bg-white/95">
                <CardHeader>
                  <CardTitle className="text-slate-900">Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Categoría</div>
                    <Badge className="bg-accent/10 text-accent border border-accent/25 tracking-[0.15em] uppercase text-[10px]">
                      {getCategoryLabel(course.category)}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Nivel</div>
                    <Badge variant="outline" className="border border-border/60 text-slate-700 tracking-[0.15em] uppercase text-[10px]">
                      {getLevelLabel(course.level)}
                    </Badge>
                  </div>
                  {course.duration && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Duración estimada</div>
                      <div className="font-medium text-slate-900">{course.duration} minutos</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Lecciones</div>
                    <div className="font-medium text-slate-900">{lessons.length} lecciones</div>
                  </div>
                  {quiz && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Quiz incluido</div>
                      <div className="font-medium text-slate-900">Sí ({quiz.questions.length} preguntas)</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
