
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
import { getCategoryLabel, getLevelLabel, formatDuration, levelColors } from '@/lib/course-utils';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import FluidBackground from '@/components/ui/FluidBackground';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Link } from 'wouter';
import { UserContext } from '@/App';

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
  vision:        { icon: Eye,            color: 'text-emerald-600', accent: '#059669' },
  action:        { icon: Zap,            color: 'text-amber-600',   accent: '#d97706' },
  community:     { icon: Users,          color: 'text-blue-600',    accent: '#2563eb' },
  reflection:    { icon: Brain,          color: 'text-purple-600',  accent: '#9333ea' },
  'hombre-gris': { icon: User,           color: 'text-slate-600',   accent: '#475569' },
  economia:      { icon: TrendingUp,     color: 'text-green-600',   accent: '#16a34a' },
  comunicacion:  { icon: MessageSquare,  color: 'text-cyan-600',    accent: '#0891b2' },
  civica:        { icon: Landmark,       color: 'text-red-600',     accent: '#dc2626' },
};

const categoryOrder = [
  'hombre-gris', 'vision', 'action', 'community',
  'reflection', 'economia', 'comunicacion', 'civica',
];

function CompactCourseCard({ course, accentColor }: { course: Course; accentColor: string }) {
  const isCompleted = course.userProgress?.status === 'completed';
  const isInProgress = course.userProgress?.status === 'in_progress';
  const progress = course.userProgress?.progress || 0;

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/recursos/guias-estudio/${course.slug}`}>
        <div
          className="group relative bg-white rounded-xl border border-slate-200 shadow-sm
                     hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                     p-4 h-full flex flex-col cursor-pointer"
          style={{ borderTopWidth: '3px', borderTopColor: accentColor }}
        >
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${levelColors[course.level] || 'bg-slate-100 text-slate-600'}`}>
              {getLevelLabel(course.level)}
            </span>
            {course.duration && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {formatDuration(course.duration)}
              </span>
            )}
            {course.lessonCount != null && course.lessonCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <BookOpen className="w-3 h-3" />
                {course.lessonCount}
              </span>
            )}
            {course.hasQuiz && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-500">
                <Award className="w-3 h-3" />
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-1 mb-3 flex-1">
            {course.description}
          </p>

          {isInProgress && (
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-emerald-600 font-medium mb-1">
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
            <span className="text-[11px] text-slate-400">
              {getCategoryLabel(course.category)}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
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
        sortBy: 'level'
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
    document.title = 'Guías de Estudio - Catálogo de Cursos';
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden theme-light">
      <FluidBackground className="opacity-30" />
      <Header />

      <main className="relative z-10 pt-32 pb-32">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <section className="py-12 md:py-20 flex flex-col justify-center items-center text-center mb-8">
            <SmoothReveal direction="up" className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Guías de Estudio</span>
              </div>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Cursos</span>
              </h1>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                Explorá todos los cursos disponibles. Filtrá por categoría o buscá por tema para encontrar lo que necesitás.
              </p>
            </SmoothReveal>

            {!isLoading && courses.length > 0 && (
              <SmoothReveal direction="up" delay={0.3} className="mt-10">
                <div className="flex justify-center gap-8 md:gap-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{stats.total}</div>
                    <div className="text-sm text-slate-500">Cursos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">{stats.totalHours}h</div>
                    <div className="text-sm text-slate-500">de contenido</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.levelCount}</div>
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
                <GlassCard className="p-6 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 border border-emerald-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer group" intensity="medium">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Continúa donde dejaste</p>
                        <h3 className="text-lg font-bold text-slate-900 truncate">{inProgressCourse.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex-1 md:w-32">
                        <div className="flex justify-between text-xs font-medium text-emerald-600 mb-1">
                          <span>{inProgressCourse.userProgress?.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${inProgressCourse.userProgress?.progress || 0}%` }} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </SmoothReveal>
          )}

          {/* Filters Bar */}
          <div className="sticky top-24 z-40 mb-12">
            <GlassCard className="max-w-5xl mx-auto p-2 flex flex-col md:flex-row items-center gap-4 bg-white/80 backdrop-blur-xl shadow-xl rounded-full" intensity="high">
              <div className="flex-1 w-full relative pl-2">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 pl-10 text-base text-slate-800 placeholder-slate-400 h-12"
                />
              </div>

              <div className="flex bg-slate-100/50 p-1 rounded-full overflow-x-auto max-w-full hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      category === cat.id
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Course Grid */}
          <div className="max-w-7xl mx-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20">
                <SmoothReveal direction="up">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      {search
                        ? `Sin resultados para "${search}"`
                        : `Cursos de ${categories.find(c => c.id === category)?.label || 'esta categoría'} próximamente`}
                    </h3>
                    <p className="text-slate-500 mb-6">
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
              <div className="space-y-12">
                {Array.from(coursesByCategory.entries()).map(([catId, catCourses]) => {
                  const meta = categoryMeta[catId];
                  const CatIcon = meta?.icon || GraduationCap;
                  return (
                    <section key={catId}>
                      {category === 'all' && (
                        <SmoothReveal direction="up">
                          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <CatIcon className={`w-4 h-4 ${meta?.color || 'text-slate-500'}`} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">
                              {getCategoryLabel(catId)}
                            </h2>
                            <span className="text-sm text-slate-400 ml-auto">
                              {catCourses.length} {catCourses.length === 1 ? 'curso' : 'cursos'}
                            </span>
                          </div>
                        </SmoothReveal>
                      )}

                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: '-5%' }}
                      >
                        {catCourses.map(course => (
                          <CompactCourseCard
                            key={course.id}
                            course={course}
                            accentColor={meta?.accent || '#64748b'}
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
