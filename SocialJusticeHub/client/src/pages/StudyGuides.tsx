
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Loader2, GraduationCap, Clock, PlayCircle, CheckCircle2, ChevronRight, Sparkles, BookOpen, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { getCategoryLabel, getLevelLabel, formatDuration, levelColors } from '@/lib/course-utils';
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

const StudyGuides = () => {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { scrollYProgress } = useScroll();
  const userContext = useContext(UserContext);
  const isLoggedIn = userContext?.isLoggedIn ?? false;

  const { data, isLoading } = useQuery({
    queryKey: ['courses', category, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
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

  // Fetch user's courses for "continue learning" banner
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
    document.title = 'Guías de Estudio - El Camino del Aprendizaje';
    window.scrollTo(0, 0);
  }, []);

  const courses: Course[] = data?.courses || [];

  // Find the most recent in-progress course for the continue banner
  const inProgressCourse = useMemo(() => {
    if (!userCoursesData?.courses) return null;
    const inProgress = userCoursesData.courses.filter(
      (c: any) => c.userProgress?.status === 'in_progress'
    );
    return inProgress.length > 0 ? inProgress[0] : null;
  }, [userCoursesData]);

  // Compute stats from courses data
  const stats = useMemo(() => {
    const total = data?.total || courses.length;
    const totalMinutes = courses.reduce((sum: number, c: Course) => sum + (c.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    const levels = new Set(courses.map((c: Course) => c.level));
    return { total, totalHours, levelCount: levels.size };
  }, [courses, data?.total]);

  // Compute actual user progress for the timeline
  const actualProgress = useMemo(() => {
    if (!isLoggedIn || courses.length === 0) return 0;
    const completedCount = courses.filter((c: Course) => c.userProgress?.status === 'completed').length;
    return completedCount / courses.length;
  }, [courses, isLoggedIn]);

  const categories = [
    { id: 'all', label: 'Todo el Camino' },
    { id: 'vision', label: 'Visión' },
    { id: 'action', label: 'Acción' },
    { id: 'community', label: 'Comunidad' },
    { id: 'reflection', label: 'Reflexión' },
    { id: 'hombre-gris', label: 'Hombre Gris' },
    { id: 'economia', label: 'Economía' },
    { id: 'comunicacion', label: 'Comunicación' },
    { id: 'civica', label: 'Cívica' },
  ];

  // Build course list with level milestone markers
  const renderCourses = () => {
    const elements: JSX.Element[] = [];
    let prevLevel = '';

    courses.forEach((course, index) => {
      // Insert milestone marker when level changes
      if (course.level !== prevLevel && prevLevel !== '' && category === 'all') {
        elements.push(
          <div key={`milestone-${index}-${course.level}`} className="relative flex justify-center my-4 md:my-8">
            <div className="absolute left-4 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg z-10 hidden md:flex">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-200 shadow-sm md:ml-16">
              <span className="text-sm font-semibold text-slate-700">Nivel {getLevelLabel(course.level)}</span>
            </div>
          </div>
        );
      }
      prevLevel = course.level;

      const isEven = index % 2 === 0;
      elements.push(
        <div key={course.id} className={`relative flex md:items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>

          {/* Node Point on Line */}
          <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-emerald-100 shadow-md -translate-x-1/2 z-10 flex items-center justify-center hidden md:flex">
            <div className={`w-3 h-3 rounded-full ${
              course.userProgress?.status === 'completed' ? 'bg-emerald-500' :
              course.userProgress?.status === 'in_progress' ? 'bg-amber-400 animate-pulse' :
              'bg-slate-300'
            }`} />
          </div>

          {/* Content Card */}
          <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
            <SmoothReveal direction={isEven ? 'right' : 'left'} delay={index * 0.1}>
              <Link href={`/recursos/guias-estudio/${course.slug}`}>
                <div className="group p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${levelColors[course.level] || 'bg-white/90 text-slate-700'}`}>
                        {getLevelLabel(course.level)}
                      </span>
                    </div>
                    {course.userProgress?.status === 'completed' && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider flex-wrap">
                      <span className="bg-emerald-50 px-2 py-1 rounded">{getCategoryLabel(course.category)}</span>
                      {course.duration && (
                        <span className="flex items-center gap-1 text-slate-400 font-normal lowercase">
                          <Clock className="w-3 h-3" /> {formatDuration(course.duration)}
                        </span>
                      )}
                      {course.lessonCount != null && course.lessonCount > 0 && (
                        <span className="flex items-center gap-1 text-slate-400 font-normal lowercase">
                          <BookOpen className="w-3 h-3" /> {course.lessonCount} lecciones
                        </span>
                      )}
                      {course.hasQuiz && (
                        <span className="flex items-center gap-1 text-cyan-500 font-normal lowercase">
                          <Award className="w-3 h-3" /> Quiz
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-slate-600 mb-6 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      {course.userProgress?.progress ? (
                        <div className="flex flex-col gap-1 w-full mr-4">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-emerald-600">{course.userProgress.progress}% Completado</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${course.userProgress.progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" /> Comenzar
                        </span>
                      )}

                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SmoothReveal>
          </div>
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <FluidBackground className="opacity-30" />
      <Header />

      <main className="relative z-10 pt-32 pb-32">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <section className="min-h-[40vh] flex flex-col justify-center items-center text-center mb-12">
            <SmoothReveal direction="up" className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Guías de Estudio</span>
              </div>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.1}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                Tu Camino de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Maestría</span>
              </h1>
            </SmoothReveal>
            <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
                No son solo cursos. Es un itinerario diseñado para transformar tu comprensión en capacidad de acción real.
              </p>
            </SmoothReveal>

            {/* Stats Strip */}
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
          <div className="sticky top-24 z-40 mb-20">
            <GlassCard className="max-w-4xl mx-auto p-2 flex flex-col md:flex-row items-center gap-4 bg-white/80 backdrop-blur-xl shadow-xl rounded-full" intensity="high">
              <div className="flex-1 w-full relative pl-2">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en el camino..."
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

          {/* The Path Layout */}
          <div className="relative max-w-5xl mx-auto min-h-[500px]">
            {/* Central Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 hidden md:block" />

            {/* Animated Progress Line */}
            <motion.div
              className="absolute left-4 md:left-1/2 top-0 w-1 bg-gradient-to-b from-emerald-400 via-cyan-400 to-blue-500 -translate-x-1/2 origin-top hidden md:block"
              style={{ height: '100%', scaleY: isLoggedIn && actualProgress > 0 ? actualProgress : scrollYProgress }}
            />

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
                      {category === 'community'
                        ? 'Cursos de Comunidad en Desarrollo'
                        : search
                          ? `Sin resultados para "${search}"`
                          : `Cursos de ${categories.find(c => c.id === category)?.label || 'esta categoría'} próximamente`}
                    </h3>
                    <p className="text-slate-500 mb-6">
                      {category === 'community'
                        ? 'Estamos preparando contenido sobre acción comunitaria. Mientras tanto, explora nuestros otros caminos de aprendizaje.'
                        : search
                          ? 'Intenta con otras palabras clave o elimina los filtros para ver todos los cursos.'
                          : 'Mientras tanto, explora las guías disponibles en otras categorías.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => { setSearch(''); setCategory('all'); }}
                        className="rounded-full"
                      >
                        Ver todo el camino
                      </Button>
                    </div>
                  </div>
                </SmoothReveal>
              </div>
            ) : (
              <div className="space-y-12 md:space-y-24 pb-20">
                {renderCourses()}
              </div>
            )}

            {/* End of Path Indicator */}
            {courses.length > 0 && (
              <div className="text-center mt-20 relative z-10 pb-20">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300/60" />
                  <div className="w-1 h-1 rounded-full bg-slate-300/30" />
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-4">
                    Más caminos próximamente
                  </p>
                </div>
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
