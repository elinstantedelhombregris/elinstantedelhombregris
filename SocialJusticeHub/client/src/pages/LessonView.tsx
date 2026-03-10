import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
import LessonCard from '@/components/LessonCard';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { UserContext } from '@/App';
import { useToast } from '@/hooks/use-toast';

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
}

interface Course {
  id: number;
  title: string;
  slug: string;
  requiresAuth?: boolean;
}

interface CourseProgress {
  completedLessons?: string;
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

const parseCompletedLessons = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is number => typeof entry === 'number');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is number => typeof entry === 'number')
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

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
  const responseCompletedLessons = parseCompletedLessons(courseData?.completedLessons);
  const persistedCompletedLessons = parseCompletedLessons(userProgress?.completedLessons);
  const completedLessons = responseCompletedLessons.length > 0
    ? responseCompletedLessons
    : persistedCompletedLessons;

  // Get user lesson progress - only track time if user is authenticated
  // Note: This query is disabled because we track time in the useEffect below
  // It's kept here for potential future use
  const { data: lessonProgress } = useQuery({
    queryKey: ['lesson-progress', lessonId, userContext?.user?.id],
    queryFn: async () => {
      if (!userContext?.user?.id || !lessonId || !course) return null;
      // Don't make unnecessary requests
      return null;
    },
    enabled: false // Disabled - we track time in useEffect instead
  });

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
    if (currentLesson) {
      document.title = `${currentLesson.title} - ${course?.title || 'Curso'}`;
      // Update isCompleted based on completedLessons, but don't override if mutation is pending
      if (!completeLessonMutation.isPending) {
        setIsCompleted(completedLessons.includes(currentLesson.id));
      }
    }
  }, [currentLesson, course, completedLessons, completeLessonMutation.isPending]);

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
      <div className="min-h-screen page-bg-light">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-foreground/60">Lección no encontrada</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

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
    <div className="min-h-screen page-bg-light">
      <Header />
      
      <main ref={mainContentRef} className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb & Navigation */}
            <div ref={navigationRef} className="mb-6 flex items-center justify-between">
              <Link href={`/recursos/guias-estudio/${course.slug}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Curso
                </Button>
              </Link>
              
              <div className="flex items-center gap-2">
                {prevLesson && (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${prevLesson.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                  </Link>
                )}
                {nextLesson && (
                  <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${nextLesson.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Lesson Header */}
            <Card className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(currentLesson.type)}
                      <Badge variant="outline" className="border border-slate-300 text-slate-700 tracking-[0.15em] uppercase text-[10px] bg-white">
                        {currentLesson.type === 'text' ? 'Texto' :
                         currentLesson.type === 'video' ? 'Video' :
                         currentLesson.type === 'interactive' ? 'Interactivo' :
                         'Documento'}
                      </Badge>
                      {currentLesson.duration && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {currentLesson.duration} min
                        </div>
                      )}
                    </div>
                    <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && (
                      <p className="text-slate-700">{currentLesson.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content */}
            <Card className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm" ref={lessonContentRef}>
              <CardContent className="p-6">
                {currentLesson.type === 'text' && (
                  <MarkdownRenderer content={currentLesson.content} className="lesson-rich-text" />
                )}
                {currentLesson.type === 'video' && currentLesson.videoUrl && (
                  <VideoPlayer 
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    onTimeUpdate={(currentTime, duration) => {
                      // Track video progress
                    }}
                  />
                )}
                {currentLesson.type === 'video' && !currentLesson.videoUrl && (
                  <MarkdownRenderer content={currentLesson.content} className="lesson-rich-text" />
                )}
                {currentLesson.type === 'interactive' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-900 mb-4">
                      Contenido interactivo: {currentLesson.content}
                    </p>
                    <p className="text-sm text-slate-600">
                      Los contenidos interactivos se implementarán próximamente
                    </p>
                  </div>
                )}
                {currentLesson.type === 'document' && currentLesson.documentUrl && (
                  <div className="text-center py-8">
                    <a
                      href={currentLesson.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold"
                    >
                      <File className="w-5 h-5" />
                      Descargar documento
                    </a>
                  </div>
                )}
                {currentLesson.type === 'document' && !currentLesson.documentUrl && (
                  <MarkdownRenderer content={currentLesson.content} className="lesson-rich-text" />
                )}
              </CardContent>
            </Card>

            {/* Complete Lesson */}
            {userContext?.isLoggedIn && (
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
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
                        className="text-sm font-medium text-slate-900 cursor-pointer select-none"
                      >
                        Marcar como completada
                      </label>
                    </div>
                    {nextLesson ? (
                      <Link 
                        href={`/recursos/guias-estudio/${course.slug}/leccion/${nextLesson.id}`}
                      >
                        <Button className="gap-2">
                          Continuar al siguiente
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/recursos/guias-estudio/${course.slug}`}>
                        <Button className="gap-2">
                          Ver Quiz Final
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                    {userContext?.isLoggedIn && (
                    <p className="text-xs text-slate-500 mt-2">
                      Tu progreso se guarda automáticamente
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-slate-900">Lecciones del Curso</h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {lessons.map((lesson, index) => {
                      const lessonCompleted = completedLessons.includes(lesson.id);
                      const lessonCurrent = lesson.id === currentLesson.id;
                      const requiresLogin = course.requiresAuth !== false;
                      const lessonLocked = (requiresLogin && !userContext?.isLoggedIn) ||
                        (index > 0 && !completedLessons.includes(lessons[index - 1]?.id) && lessons[index - 1]?.isRequired);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/recursos/guias-estudio/${course.slug}/leccion/${lesson.id}`}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-2xl border cursor-pointer transition-all",
                              lessonLocked
                                ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                                : lessonCurrent
                                  ? "border-blue-500 bg-blue-50"
                                  : lessonCompleted
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm font-medium",
                                lessonCurrent ? "text-blue-900" : lessonCompleted ? "text-emerald-900" : "text-slate-900"
                              )}>
                                {index + 1}. {lesson.title}
                              </span>
                              {lessonCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
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

export default LessonView;

