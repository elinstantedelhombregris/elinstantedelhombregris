import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useContext, useEffect, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  Lock,
  Check,
  ChevronRight
} from 'lucide-react';
import { UserContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getCategoryLabel, getLevelLabel, formatDuration } from '@/lib/course-utils';
import { buildCourseMetadata } from '@shared/course-seo';
import { deriveSearchSummary } from '@shared/course-content';
import { useSeoMetadata } from '@/lib/seo';
import {
  areRequiredLessonsComplete,
  getContinueLessonId,
  isLessonLocked,
  parseCompletedLessonIds,
} from '@/lib/course-surface';
import { levelColorsDark } from '@/lib/editorial';

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
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5BDE]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-400">Error al cargar el curso</p>
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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header />

      <main className="container relative mx-auto px-4 pt-28 pb-24">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" aria-hidden="true" />

        {/* Breadcrumb */}
        <div className="relative z-10 mx-auto mb-8 max-w-6xl">
          <Link href="/recursos/guias-estudio" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-sm">
            <span className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Volver a Rutas de Transformación
            </span>
          </Link>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="mb-6 h-64 w-full rounded-2xl border border-white/10 object-cover"
                />
              )}

              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#7D5BDE]/25 bg-[#7D5BDE]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">
                  {getCategoryLabel(course.category)}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>
                  {getLevelLabel(course.level)}
                </span>
                {course.isFeatured && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300">
                    Destacado
                  </span>
                )}
              </div>

              <h1 className="mb-3 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-4xl">
                {course.title}
              </h1>
              <p className="text-lg text-slate-400">
                {course.description}
              </p>

              {courseSummary && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    En síntesis
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {courseSummary}
                  </p>
                </div>
              )}

              {isInProgress && (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-violet-300">
                    <span>Tu avance</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {course.duration && (
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" aria-hidden="true" /><span>{formatDuration(course.duration)}</span></div>
                )}
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" /><span>{course.viewCount} vistas</span></div>
                {course.author && (
                  <div className="flex items-center gap-2"><User className="h-4 w-4" aria-hidden="true" /><span>{course.author.name}</span></div>
                )}
                {course.lastReviewedAt && (
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4" aria-hidden="true" /><span>Revisado {new Date(course.lastReviewedAt).toLocaleDateString('es-AR')}</span></div>
                )}
              </div>

              {/* Action button */}
              <div className="mt-6">
                {safeUserContext.isLoggedIn ? (
                  isCompleted ? (
                    <div className="flex items-center gap-4">
                      {continueLessonId ? (
                        <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                          <Button size="lg" variant="outline" className="gap-2">
                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                            Repasar Curso
                          </Button>
                        </Link>
                      ) : (
                        <Button size="lg" variant="outline" className="gap-2">
                          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                          Curso Completado
                        </Button>
                      )}
                      {canTakeQuiz && (
                        <Link href={`/recursos/guias-estudio/${course.slug}/quiz`}>
                          <Button size="lg" variant="outline" className="gap-2">
                            <Award className="w-5 h-5" aria-hidden="true" />
                            Ir al Quiz
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : isInProgress && continueLessonId ? (
                    <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                      <Button size="lg" className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                        <PlayCircle className="w-5 h-5" aria-hidden="true" />
                        Continuar Curso
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleStartCourse}
                      disabled={startCourseMutation.isPending}
                      className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]"
                    >
                      <PlayCircle className="w-5 h-5" aria-hidden="true" />
                      {startCourseMutation.isPending ? 'Iniciando...' : 'Comenzar Curso'}
                    </Button>
                  )
                ) : course.requiresAuth === false && continueLessonId ? (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                    <Button size="lg" className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                      <PlayCircle className="w-5 h-5" aria-hidden="true" />
                      Comenzar Curso
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button size="lg" disabled className="gap-2">
                      <PlayCircle className="w-5 h-5" aria-hidden="true" />
                      Inicia sesión para comenzar
                    </Button>
                    <p className="text-sm text-slate-500">
                      Regístrate gratis para acceder a este curso
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Timeline */}
            <section aria-labelledby="timeline-heading">
              <div className="mb-8 flex items-center gap-4">
                <h2 id="timeline-heading" className="font-serif text-2xl font-bold text-slate-100">Recorrido del curso</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-400/40 to-transparent" />
              </div>

              {lessons.length === 0 ? (
                <p className="text-slate-400">No hay lecciones disponibles aún.</p>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-6 left-5 top-6 w-px bg-white/10" aria-hidden="true" />
                  <ol className="space-y-3">
                    {lessons.map((lesson, index) => {
                      const lessonCompleted = completedLessons.includes(lesson.id);
                      const isCurrent = userProgress?.currentLessonId === lesson.id;
                      const locked = isLessonLocked(lesson, lessonAccessContext);

                      const node = lessonCompleted ? (
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7D5BDE] text-white">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </div>
                      ) : locked ? (
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#16161d] text-slate-600">
                          <Lock className="h-4 w-4" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isCurrent
                            ? 'border-2 border-[#7D5BDE] bg-[#7D5BDE]/10 text-violet-300'
                            : 'border border-white/15 bg-[#16161d] text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                      );

                      const card = (
                        <div className={`flex-1 rounded-2xl border p-5 transition-all duration-300 ${
                          locked
                            ? 'border-white/5 bg-white/[0.015]'
                            : isCurrent
                              ? 'border-[#7D5BDE]/40 bg-[#7D5BDE]/[0.06] hover:border-[#7D5BDE]/60'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}>
                          <div className="flex items-center justify-between gap-3">
                            <h3 className={`font-semibold leading-snug ${locked ? 'text-slate-600' : 'text-slate-100'}`}>
                              {lesson.title}
                            </h3>
                            {!locked && <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
                          </div>
                          {lesson.description && !locked && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">{lesson.description}</p>
                          )}
                          <div className={`mt-2 flex items-center gap-3 text-xs ${locked ? 'text-slate-700' : 'text-slate-500'}`}>
                            {lesson.duration && (
                              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{lesson.duration} min</span>
                            )}
                            {lesson.isRequired && <span>Requerida</span>}
                            {locked && <span>Se desbloquea completando las lecciones anteriores</span>}
                          </div>
                        </div>
                      );

                      return (
                        <li key={lesson.id} className="flex items-start gap-4">
                          {locked ? (
                            <>{node}{card}</>
                          ) : (
                            <>
                              {node}
                              <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${lesson.id}`} className="flex-1 cursor-pointer">
                                {card}
                              </Link>
                            </>
                          )}
                        </li>
                      );
                    })}

                    {/* Quiz — final node */}
                    {quiz && (
                      <li className="flex items-start gap-4">
                        <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          canTakeQuiz
                            ? 'border-2 border-[#7D5BDE] bg-[#7D5BDE]/10 text-violet-300'
                            : 'border border-white/10 bg-[#16161d] text-slate-600'
                        }`}>
                          <Award className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className={`flex-1 rounded-2xl border p-5 ${
                          canTakeQuiz ? 'border-[#7D5BDE]/40 bg-[#7D5BDE]/[0.06]' : 'border-white/5 bg-white/[0.015]'
                        }`}>
                          <h3 className={`font-semibold ${canTakeQuiz ? 'text-slate-100' : 'text-slate-600'}`}>
                            {quiz.title}
                          </h3>
                          <p className={`mt-1 text-sm ${canTakeQuiz ? 'text-slate-400' : 'text-slate-700'}`}>
                            {quiz.questions.length} preguntas · mínimo {quiz.passingScore}% para aprobar
                            {quiz.timeLimit ? ` · ${quiz.timeLimit} min` : ''}
                          </p>
                          <div className="mt-3">
                            {canTakeQuiz ? (
                              <Link href={`/recursos/guias-estudio/${course.slug}/quiz`}>
                                <Button size="sm" className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                                  <Award className="h-4 w-4" aria-hidden="true" />
                                  Tomar Quiz
                                </Button>
                              </Link>
                            ) : (
                              <p className="text-xs text-slate-600">
                                {safeUserContext.isLoggedIn
                                  ? 'Completá las lecciones requeridas para desbloquear el quiz'
                                  : 'Iniciá sesión para tomar el quiz'}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    )}
                  </ol>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {safeUserContext.isLoggedIn && userProgress && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-100">
                    <GraduationCap className="h-5 w-5 text-violet-400" aria-hidden="true" />
                    Tu progreso
                  </h3>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lecciones completadas</span>
                      <span className="font-medium text-slate-200">{completedLessons.length} / {lessons.length}</span>
                    </div>
                    {continueLessonId && (
                      <div className="text-slate-500">
                        Seguir con: <span className="text-slate-300">{lessons.find(l => l.id === continueLessonId)?.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="mb-4 font-serif text-lg font-bold text-slate-100">Información del curso</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="mb-1 text-slate-500">Categoría</dt>
                    <dd><span className="rounded-full border border-[#7D5BDE]/25 bg-[#7D5BDE]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">{getCategoryLabel(course.category)}</span></dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-slate-500">Nivel</dt>
                    <dd><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>{getLevelLabel(course.level)}</span></dd>
                  </div>
                  {course.duration && (
                    <div>
                      <dt className="mb-1 text-slate-500">Duración estimada</dt>
                      <dd className="font-medium text-slate-200">{formatDuration(course.duration)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="mb-1 text-slate-500">Lecciones</dt>
                    <dd className="font-medium text-slate-200">{lessons.length} lecciones</dd>
                  </div>
                  {quiz && (
                    <div>
                      <dt className="mb-1 text-slate-500">Quiz incluido</dt>
                      <dd className="font-medium text-slate-200">Sí ({quiz.questions.length} preguntas)</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
