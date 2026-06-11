
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Loader2, GraduationCap, Clock, PlayCircle, CheckCircle2,
  ChevronRight, Sparkles, BookOpen, Award, ArrowRight,
  Eye, Zap, Users, Brain, User, TrendingUp, MessageSquare, Landmark,
  type LucideIcon,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { getCategoryLabel, getLevelLabel, formatDuration } from '@/lib/course-utils';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Link } from 'wouter';
import { UserContext } from '@/App';
import { buildCourseHubMetadata } from '@shared/course-seo';
import { useSeoMetadata } from '@/lib/seo';
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
  viewCount: number;
  isFeatured: boolean;
  lessonCount?: number;
  hasQuiz?: boolean;
  userProgress?: {
    status: string;
    progress: number;
  } | null;
}

const categoryMeta: Record<string, { icon: LucideIcon; color: string; accent: string }> = {
  vision:        { icon: Eye,           color: 'text-emerald-400', accent: '#34d399' },
  action:        { icon: Zap,           color: 'text-amber-400',   accent: '#fbbf24' },
  community:     { icon: Users,         color: 'text-blue-400',    accent: '#60a5fa' },
  reflection:    { icon: Brain,         color: 'text-purple-400',  accent: '#c084fc' },
  'hombre-gris': { icon: User,          color: 'text-slate-300',   accent: '#cbd5e1' },
  economia:      { icon: TrendingUp,    color: 'text-green-400',   accent: '#4ade80' },
  comunicacion:  { icon: MessageSquare, color: 'text-cyan-400',    accent: '#22d3ee' },
  civica:        { icon: Landmark,      color: 'text-red-400',     accent: '#f87171' },
};

const categoryOrder = [
  'hombre-gris', 'vision', 'action', 'community',
  'reflection', 'economia', 'comunicacion', 'civica',
];

function CourseCard({ course, accentColor }: { course: Course; accentColor: string }) {
  const isCompleted = course.userProgress?.status === 'completed';
  const isInProgress = course.userProgress?.status === 'in_progress';
  const progress = course.userProgress?.progress || 0;

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link href={`/recursos/guias-estudio/${course.slug}`}>
        <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]">

          {/* Thumbnail */}
          <div className="relative h-44 overflow-hidden">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}05)` }}
              >
                <GraduationCap className="h-14 w-14 opacity-25" style={{ color: accentColor }} aria-hidden="true" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent" />

            {/* Level badge */}
            <div className="absolute left-3 top-3">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>
                {getLevelLabel(course.level)}
              </span>
            </div>

            {/* Completed badge */}
            {isCompleted && (
              <div className="absolute right-3 top-3">
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Completado
                </span>
              </div>
            )}

            {/* Bottom metadata on image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              {course.duration && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDuration(course.duration)}
                </span>
              )}
              {course.lessonCount != null && course.lessonCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <BookOpen className="h-3 w-3" aria-hidden="true" />
                  {course.lessonCount} lecciones
                </span>
              )}
              {course.hasQuiz && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <Award className="h-3 w-3" aria-hidden="true" />
                  Quiz
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
              >
                {getCategoryLabel(course.category)}
              </span>
            </div>

            <h3 className="mb-2 font-serif text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-white">
              {course.title}
            </h3>

            <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">
              {course.description}
            </p>

            {/* Progress (violet = action) */}
            {isInProgress && (
              <div className="mb-4">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-violet-300">
                  <span>En progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                {isInProgress ? (
                  <>
                    <PlayCircle className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                    <span className="font-medium text-violet-300">Continuar</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    <span className="font-medium text-emerald-300">Repasar</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Comenzar
                  </>
                )}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-500 transition-all duration-300 group-hover:bg-[#7D5BDE] group-hover:text-white">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const StudyGuides = () => {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const userContext = useContext(UserContext);
  const isLoggedIn = userContext?.isLoggedIn ?? false;

  const { data, isLoading } = useQuery({
    queryKey: ['courses', category, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '100',
      });

      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const response = await apiRequest('GET', `/api/courses?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });

  const { data: userCoursesData } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/courses');
      if (!response.ok) return { courses: [] };
      return response.json();
    },
    enabled: isLoggedIn,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const seoMetadata = useMemo(
    () => buildCourseHubMetadata(typeof window !== 'undefined' ? window.location.origin : undefined),
    [],
  );
  useSeoMetadata(seoMetadata);

  const courses: Course[] = data?.courses || [];

  const inProgressCourse = useMemo(() => {
    if (!userCoursesData?.courses) return null;
    const inProgress = userCoursesData.courses.filter(
      (c: any) => c.userProgress?.status === 'in_progress'
    );
    return inProgress.length > 0 ? inProgress[0] : null;
  }, [userCoursesData]);

  const stats = useMemo(() => {
    const total = data?.total || courses.length;
    const totalMinutes = courses.reduce((sum: number, c: Course) => sum + (c.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    const levels = new Set(courses.map((c: Course) => c.level));
    return { total, totalHours, levelCount: levels.size };
  }, [courses, data?.total]);

  const coursesByCategory = useMemo(() => {
    const grouped = new Map<string, Course[]>();
    categoryOrder.forEach(catId => grouped.set(catId, []));
    courses.forEach(course => {
      const list = grouped.get(course.category);
      if (list) list.push(course);
      else grouped.set(course.category, [course]);
    });
    for (const [key, value] of grouped) {
      if (value.length === 0) grouped.delete(key);
    }
    return grouped;
  }, [courses]);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'vision', label: 'Visión' },
    { id: 'action', label: 'Acción' },
    { id: 'community', label: 'Comunidad' },
    { id: 'reflection', label: 'Reflexión' },
    { id: 'hombre-gris', label: 'Hombre Gris' },
    { id: 'economia', label: 'Economía' },
    { id: 'comunicacion', label: 'Comunicación' },
    { id: 'civica', label: 'Cívica' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] font-sans text-slate-200 selection:bg-violet-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/[0.03] blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 pt-32 pb-32">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <section className="py-12 md:py-20 flex flex-col justify-center items-center text-center mb-8">
            <SmoothReveal direction="up" className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-8">
                <GraduationCap className="w-4 h-4 text-[#7D5BDE]" aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Rutas de Transformación</span>
              </div>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]">
                Rutas de Transformación
              </h1>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
                Cada ruta es un camino práctico para entender tu realidad y pasar a la acción. Elegí la que más resuene con vos y empezá hoy.
              </p>
            </SmoothReveal>

            {!isLoading && courses.length > 0 && (
              <SmoothReveal direction="up" delay={0.3} className="mt-10">
                <div className="flex justify-center gap-8 md:gap-12">
                  <div className="text-center">
                    <div className="font-serif text-3xl font-bold text-slate-100">{stats.total}</div>
                    <div className="text-sm text-slate-500">Cursos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-serif text-3xl font-bold text-slate-100">{stats.totalHours}h</div>
                    <div className="text-sm text-slate-500">de contenido</div>
                  </div>
                  <div className="text-center">
                    <div className="font-serif text-3xl font-bold text-slate-100">{stats.levelCount}</div>
                    <div className="text-sm text-slate-500">Niveles</div>
                  </div>
                </div>
              </SmoothReveal>
            )}
          </section>

          {/* Continue Learning Banner */}
          {isLoggedIn && inProgressCourse && (
            <SmoothReveal direction="up" className="mb-12 max-w-4xl mx-auto">
              <Link href={`/recursos/guias-estudio/${inProgressCourse.slug}`}>
                <div className="group cursor-pointer rounded-2xl border border-[#7D5BDE]/25 bg-[#7D5BDE]/[0.07] p-6 transition-all duration-300 hover:border-[#7D5BDE]/40 hover:shadow-[0_0_40px_rgba(125,91,222,0.12)]">
                  <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7D5BDE]/15">
                        <PlayCircle className="h-6 w-6 text-violet-300" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300">Continuá donde dejaste</p>
                        <h3 className="truncate font-serif text-lg font-bold text-slate-100">{inProgressCourse.title}</h3>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-4 md:w-auto">
                      <div className="flex-1 md:w-32">
                        <div className="mb-1 flex justify-between text-xs font-medium text-violet-300">
                          <span>{inProgressCourse.userProgress?.progress || 0}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all" style={{ width: `${inProgressCourse.userProgress?.progress || 0}%` }} />
                        </div>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-violet-300 transition-all group-hover:bg-[#7D5BDE] group-hover:text-white">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SmoothReveal>
          )}

          {/* Filters Bar */}
          <div className="sticky top-24 z-40 mb-14">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-3 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="w-full relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Buscar cursos"
                  placeholder="Buscar cursos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#7D5BDE]/60 focus:ring-2 focus:ring-[#7D5BDE]/20 rounded-full pl-11 pr-4 text-base text-slate-200 placeholder-slate-500 h-11 transition-colors outline-none"
                />
              </div>

              <div className="flex bg-white/5 p-1 rounded-full overflow-x-auto max-w-full hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                      category === cat.id
                        ? 'bg-[#7D5BDE] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="max-w-7xl mx-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20">
                <SmoothReveal direction="up">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-slate-500" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-3">
                      {search
                        ? `Sin resultados para "${search}"`
                        : `Cursos de ${categories.find(c => c.id === category)?.label || 'esta categoría'} próximamente`}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {search
                        ? 'Intenta con otras palabras clave o elimina los filtros para ver todos los cursos.'
                        : 'Mientras tanto, explora las guías disponibles en otras categorías.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => { setSearch(''); setCategory('all'); }}
                        className="rounded-full"
                      >
                        Ver todos los cursos
                      </Button>
                    </div>
                  </div>
                </SmoothReveal>
              </div>
            ) : (
              <div className="space-y-16">
                {Array.from(coursesByCategory.entries()).map(([catId, catCourses]) => {
                  const meta = categoryMeta[catId];
                  const CatIcon = meta?.icon || GraduationCap;
                  return (
                    <section key={catId}>
                      {category === 'all' && (
                        <SmoothReveal direction="up">
                          <div className="flex items-center gap-4 mb-8">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${meta?.accent || '#94a3b8'}14` }}
                            >
                              <CatIcon className="w-5 h-5" style={{ color: meta?.accent || '#94a3b8' }} aria-hidden="true" />
                            </div>
                            <div>
                              <h2 className="font-serif text-xl font-bold text-slate-100">
                                {getCategoryLabel(catId)}
                              </h2>
                              <p className="text-sm text-slate-500">
                                {catCourses.length} {catCourses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
                              </p>
                            </div>
                            <div className="ml-4 h-px flex-1 bg-gradient-to-r from-slate-400/30 to-transparent" />
                          </div>
                        </SmoothReveal>
                      )}

                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: '-5%' }}
                      >
                        {catCourses.map(course => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            accentColor={meta?.accent || '#94a3b8'}
                          />
                        ))}
                      </motion.div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyGuides;
