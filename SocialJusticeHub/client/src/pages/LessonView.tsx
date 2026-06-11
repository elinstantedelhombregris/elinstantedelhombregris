import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  Activity,
  File
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import VideoPlayer from '@/components/VideoPlayer';
import ArticleTOC from '@/components/editorial/ArticleTOC';
import { cn } from '@/lib/utils';
import { UserContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { buildLessonMetadata } from '@shared/course-seo';
import { deriveSearchSummary } from '@shared/course-content';
import { useSeoMetadata } from '@/lib/seo';
import {
  areRequiredLessonsComplete,
  getContinueLessonId,
  getNextUnlockedLessonId,
  isLessonLocked,
  parseCompletedLessonIds,
} from '@/lib/course-surface';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'document';
  videoUrl?: string;
  documentUrl?: string;
  duration?: number;
  orderIndex: number;
  isRequired: boolean;
  searchSummary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  indexable?: boolean | null;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  requiresAuth?: boolean;
  thumbnailUrl?: string | null;
  ogImageUrl?: string | null;
  excerpt?: string | null;
  description: string;
  searchSummary?: string | null;
}

interface CourseProgress {
  completedLessons?: string;
  currentLessonId?: number | null;
}

interface CourseQueryResult {
  course?: Course;
  lessons?: Lesson[];
  completedLessons?: unknown;
  userProgress?: CourseProgress | null;
}

interface CompleteLessonResponse {
  xpAwarded?: {
    lesson?: number;
    course?: number;
  };
  courseCompleted?: boolean;
}

const LessonView = () => {
  const { courseSlug, lessonId } = useParams<{ courseSlug?: string; lessonId?: string }>();
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  // Fetch course data
  const { data: courseData } = useQuery<CourseQueryResult>({
    queryKey: ['course', courseSlug],
    queryFn: async () => {
      if (!courseSlug) {
        throw new Error('Curso no encontrado');
      }
      const response = await apiRequest('GET', `/api/courses/${courseSlug}`);
      if (!response.ok) throw new Error('Error al cargar el curso');
      return (await response.json()) as CourseQueryResult;
    },
    enabled: Boolean(courseSlug),
  });

  const course: Course | undefined = courseData?.course;
  // Deduplicate lessons by ID to prevent duplicates
  const lessonsRaw: Lesson[] = courseData?.lessons ?? [];
  const lessonsMap = new Map<number, Lesson>();
  lessonsRaw.forEach(lesson => {
    if (!lessonsMap.has(lesson.id)) {
      lessonsMap.set(lesson.id, lesson);
    }
  });
  const lessons: Lesson[] = Array.from(lessonsMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  const currentLesson: Lesson | undefined = lessons.find(l => l.id === parseInt(lessonId || '0'));
  const userProgress = courseData?.userProgress;
  const completedLessons = parseCompletedLessonIds(courseData?.completedLessons, userProgress?.completedLessons);

  const seoMetadata = useMemo(
    () => course && currentLesson ? buildLessonMetadata(course, currentLesson, typeof window !== 'undefined' ? window.location.origin : undefined) : null,
    [course, currentLesson],
  );
  useSeoMetadata(seoMetadata);

  // Track time spent - only if user is authenticated
  useEffect(() => {
    if (!userContext?.user?.id || !lessonId || !course) {
      // Still track time locally for display, but don't send to server
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
          setTimeSpent(elapsed);
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }

    // User is authenticated - track and send to server
    startTimeRef.current = new Date();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
        setTimeSpent(elapsed);

        // Update every 30 seconds - only if user is authenticated
        if (elapsed % 30 === 0 && elapsed > 0 && userContext?.user?.id && course?.id && lessonId) {
          // Use timeSpent to match server expectation
          apiRequest('POST', `/api/courses/${course.id}/lessons/${lessonId}/track-time`, {
            timeSpent: elapsed,
            seconds: elapsed
          })
            .catch(() => {
              // Silently handle errors - user might not be authenticated or lesson might not be started
            });
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lessonId, course, userContext?.user?.id]);

  const completeLessonMutation = useMutation<CompleteLessonResponse, Error>({
    mutationFn: async () => {
      if (!course?.id || !lessonId) {
        throw new Error('Curso o lección no encontrada');
      }
      const response = await apiRequest('POST', `/api/courses/${course.id}/lessons/${lessonId}/complete`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = (payload as { message?: string } | null)?.message;
        throw new Error(message || 'Error al completar la lección');
      }
      return (payload ?? {}) as CompleteLessonResponse;
    },
    onSuccess: async (data) => {
      setIsCompleted(true);
      const lessonXp = data?.xpAwarded?.lesson ?? 0;
      const courseXp = data?.xpAwarded?.course ?? 0;
      const xpMessages: string[] = [];
      if (lessonXp > 0) {
        xpMessages.push(`${lessonXp} XP por la lección`);
      }
      if (courseXp > 0) {
        xpMessages.push(`${courseXp} XP por completar el curso`);
      }
      await queryClient.invalidateQueries({ queryKey: ['course', courseSlug] });
      await queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId, userContext?.user?.id] });
      if (userContext?.user?.id) {
        await queryClient.invalidateQueries({ queryKey: ['user-progress', userContext.user.id] });
      }
      // Refetch course data to get updated completedLessons
      await queryClient.refetchQueries({ queryKey: ['course', courseSlug] });
      toast({
        title: 'Lección completada',
        description: [
          data.courseCompleted
            ? '¡Felicidades! Has completado el curso.'
            : 'Continúa con la siguiente lección.',
          xpMessages.length ? `Ganaste ${xpMessages.join(' y ')}.` : ''
        ].filter(Boolean).join(' ')
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo completar la lección',
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (currentLesson && !completeLessonMutation.isPending) {
      setIsCompleted(completedLessons.includes(currentLesson.id));
    }
  }, [currentLesson, completedLessons, completeLessonMutation.isPending]);

  // Separate useEffect for scroll - only when lessonId changes
  useEffect(() => {
    // Scroll to top of the page first
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Then scroll to navigation area (where Anterior/Siguiente buttons are) after a short delay
    // This ensures the content is rendered before scrolling
    setTimeout(() => {
      // Scroll to the navigation area at the top of the lesson content
      if (navigationRef.current) {
        // Calculate offset to account for fixed header if any
        const elementPosition = navigationRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 20; // 20px offset from top

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback: scroll to main content start
        if (mainContentRef.current) {
          const elementPosition = mainContentRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 20;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 200);
  }, [lessonId, courseSlug]);

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-slate-400">Lección no encontrada</p>
        </div>
        <Footer />
      </div>
    );
  }

  const requiresAuth = course.requiresAuth !== false;
  const effectiveCompletedLessons = isCompleted && !completedLessons.includes(currentLesson.id)
    ? [...completedLessons, currentLesson.id]
    : completedLessons;
  const lessonAccessContext = {
    lessons,
    completedLessonIds: effectiveCompletedLessons,
    requiresAuth,
    isLoggedIn: userContext?.isLoggedIn ?? false,
  };
  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLessonId = getNextUnlockedLessonId(currentLesson.id, lessonAccessContext);
  const nextLesson = nextLessonId ? lessons.find((lesson) => lesson.id === nextLessonId) ?? null : null;
  const currentLessonLocked = isLessonLocked(currentLesson, {
    lessons,
    completedLessonIds: completedLessons,
    requiresAuth,
    isLoggedIn: userContext?.isLoggedIn ?? false,
  });
  const continueLessonId = getContinueLessonId({
    lessons,
    completedLessonIds: completedLessons,
    requiresAuth,
    isLoggedIn: userContext?.isLoggedIn ?? false,
    currentLessonId: userProgress?.currentLessonId,
  });
  const quizUnlocked = areRequiredLessonsComplete(lessons, effectiveCompletedLessons);
  const lessonSummary = deriveSearchSummary(currentLesson.searchSummary, currentLesson.description || currentLesson.content, 220);

  const handleComplete = () => {
    if (!userContext?.isLoggedIn) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para completar lecciones',
        variant: 'destructive'
      });
      return;
    }
    completeLessonMutation.mutate();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'interactive': return <Activity className="w-5 h-5" />;
      case 'document': return <File className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
      <Header />

      <main ref={mainContentRef} className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb & Navigation */}
            <div ref={navigationRef} className="mb-6 flex items-center justify-between">
              <Link href={`/recursos/guias-estudio/${course.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-sm">
                <span className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                  Volver al Curso
                </span>
              </Link>

              <div className="flex items-center gap-2">
                {prevLesson && (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${prevLesson.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      Anterior
                    </Button>
                  </Link>
                )}
                {nextLesson && (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${nextLesson.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      Siguiente
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Lesson Header */}
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-violet-400">
                      {getTypeIcon(currentLesson.type)}
                    </span>
                    <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-300 tracking-[0.15em] uppercase text-[10px]">
                      {currentLesson.type === 'text' ? 'Texto' :
                       currentLesson.type === 'video' ? 'Video' :
                       currentLesson.type === 'interactive' ? 'Interactivo' :
                       'Documento'}
                    </Badge>
                    {currentLesson.duration && (
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {currentLesson.duration} min
                      </div>
                    )}
                  </div>
                  <h1 className="mb-2 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]">
                    {currentLesson.title}
                  </h1>
                  {currentLesson.description && (
                    <p className="text-slate-400">{currentLesson.description}</p>
                  )}
                  {lessonSummary && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300 mb-1">
                        En síntesis
                      </p>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {lessonSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div ref={lessonContentRef} className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              {currentLessonLocked ? (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-5 py-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300 mb-2">
                    Lección bloqueada
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Completa primero las lecciones requeridas anteriores para seguir este recorrido en orden.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {continueLessonId && continueLessonId !== currentLesson.id && (
                      <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${continueLessonId}`}>
                        <Button className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                          Ir a la lección disponible
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/recursos/guias-estudio/${course.slug}`}>
                      <Button variant="outline">Volver al curso</Button>
                    </Link>
                  </div>
                </div>
              ) : currentLesson.type === 'text' && (
                <MarkdownRenderer content={currentLesson.content} variant="dark" className="lesson-rich-text" />
              )}
              {!currentLessonLocked && currentLesson.type === 'video' && currentLesson.videoUrl && (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    onTimeUpdate={(currentTime, duration) => {
                      // Track video progress
                    }}
                  />
                </div>
              )}
              {!currentLessonLocked && currentLesson.type === 'video' && !currentLesson.videoUrl && (
                <MarkdownRenderer content={currentLesson.content} variant="dark" className="lesson-rich-text" />
              )}
              {!currentLessonLocked && currentLesson.type === 'interactive' && (
                <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-6">
                  <p className="text-slate-300 mb-4">
                    Contenido interactivo: {currentLesson.content}
                  </p>
                  <p className="text-sm text-slate-500">
                    Los contenidos interactivos se implementarán próximamente
                  </p>
                </div>
              )}
              {!currentLessonLocked && currentLesson.type === 'document' && currentLesson.documentUrl && (
                <div className="text-center py-8">
                  <a
                    href={currentLesson.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                  >
                    <File className="w-5 h-5" aria-hidden="true" />
                    Descargar documento
                  </a>
                </div>
              )}
              {!currentLessonLocked && currentLesson.type === 'document' && !currentLesson.documentUrl && (
                <MarkdownRenderer content={currentLesson.content} variant="dark" className="lesson-rich-text" />
              )}
            </div>

            {/* Complete Lesson */}
            {userContext?.isLoggedIn && !currentLessonLocked && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="complete-lesson"
                      checked={isCompleted}
                      onCheckedChange={(checked: CheckedState) => {
                        if (checked === true && !isCompleted) {
                          handleComplete();
                        }
                      }}
                      disabled={isCompleted || completeLessonMutation.isPending}
                    />
                    <label
                      htmlFor="complete-lesson"
                      className="text-sm font-medium text-slate-200 cursor-pointer select-none"
                    >
                      Marcar como completada
                    </label>
                  </div>
                  {nextLesson ? (
                    <Link
                      href={`/recursos/guias-estudio/${course.slug}/leccion/${nextLesson.id}`}
                    >
                      <Button className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                        Continuar al siguiente
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={quizUnlocked ? `/recursos/guias-estudio/${course.slug}/quiz` : `/recursos/guias-estudio/${course.slug}`}>
                      <Button className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                        {quizUnlocked ? 'Ir al Quiz Final' : 'Volver al curso'}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </Link>
                  )}
                </div>
                {userContext?.isLoggedIn && (
                  <p className="text-xs text-slate-600 mt-2">
                    Tu progreso se guarda automáticamente
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold mb-4 text-slate-100">Lecciones del Curso</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {lessons.map((lesson, index) => {
                    const lessonCompleted = completedLessons.includes(lesson.id);
                    const lessonCurrent = lesson.id === currentLesson.id;
                    const lessonLocked = isLessonLocked(lesson, {
                      lessons,
                      completedLessonIds: completedLessons,
                      requiresAuth,
                      isLoggedIn: userContext?.isLoggedIn ?? false,
                    });

                    const item = (
                      <div
                        className={cn(
                          "p-3 rounded-2xl border transition-all",
                          lessonLocked
                            ? "opacity-50 cursor-not-allowed border-white/5 bg-white/[0.015]"
                            : "cursor-pointer",
                          !lessonLocked && lessonCurrent
                            ? "border-[#7D5BDE]/50 bg-[#7D5BDE]/10"
                            : !lessonLocked && lessonCompleted
                              ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                              : !lessonLocked
                                ? "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                                : ""
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            lessonCurrent ? "text-violet-200" : lessonCompleted ? "text-emerald-200" : "text-slate-300"
                          )}>
                            {index + 1}. {lesson.title}
                          </span>
                          {lessonCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    );

                    if (lessonLocked) {
                      return <div key={lesson.id}>{item}</div>;
                    }

                    return (
                      <Link
                        key={lesson.id}
                        href={`/recursos/guias-estudio/${course.slug}/leccion/${lesson.id}`}
                      >
                        {item}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {currentLesson.type === 'text' && !currentLessonLocked && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <ArticleTOC containerRef={lessonContentRef} contentKey={currentLesson.content} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonView;
