
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2, GraduationCap, Clock, Trophy, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import FluidBackground from '@/components/ui/FluidBackground';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Link } from 'wouter';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', category, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100', // Fetch more to show the "path" effectively
        sortBy: 'level' // Sort by level to create a logical progression
      });

      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const response = await apiRequest('GET', `/api/courses?${params}`);
      return response.json();
    },
  });

  useEffect(() => {
    document.title = 'Guías de Estudio - El Camino del Aprendizaje';
    window.scrollTo(0, 0);
  }, []);

  const courses: Course[] = data?.courses || [];
  
  // Path visualization line logic
  const pathHeight = courses.length * 400; // Approximate height based on cards

  const categories = [
    { id: 'all', label: 'Todo el Camino' },
    { id: 'vision', label: 'Visión' },
    { id: 'action', label: 'Acción' },
    { id: 'community', label: 'Comunidad' },
    { id: 'hombre-gris', label: 'Hombre Gris' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
      <FluidBackground />
      <Header />
      
      <main className="relative pt-32 pb-32">
        <div className="container mx-auto px-4 relative z-10">
            
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <SmoothReveal>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-6">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        TU CAMINO DE <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">MAESTRÍA</span>
                    </h1>
                </SmoothReveal>
                <SmoothReveal delay={0.1}>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        No son solo cursos. Es un itinerario diseñado para transformar tu comprensión en capacidad de acción real.
                    </p>
                </SmoothReveal>
            </div>

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
                    style={{ height: '100%', scaleY: scrollYProgress }}
                />

                {isLoading ? (
                    <div className="flex justify-center pt-20">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No se encontraron guías en este camino.</p>
                        <Button variant="link" onClick={() => { setSearch(''); setCategory('all'); }}>Reiniciar búsqueda</Button>
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-24 pb-20">
                        {courses.map((course, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={course.id} className={`relative flex md:items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                                    
                                    {/* Node Point on Line */}
                                    <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-emerald-100 shadow-md -translate-x-1/2 z-10 flex items-center justify-center hidden md:flex">
                                        <div className={`w-3 h-3 rounded-full ${course.userProgress?.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    </div>

                                    {/* Content Card */}
                                    <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                                        <SmoothReveal direction={isEven ? 'right' : 'left'} delay={index * 0.1}>
                                            <Link href={`/recursos/guias-estudio/${course.slug}`}>
                                                <GlassCard 
                                                    className="group p-0 overflow-hidden hover:border-emerald-400/50 transition-colors"
                                                    intensity="medium"
                                                >
                                                    <div className="relative h-48 overflow-hidden bg-slate-200">
                                                        {course.thumbnailUrl ? (
                                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center">
                                                                <GraduationCap className="w-16 h-16 text-emerald-200" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-700 shadow-sm`}>
                                                                {course.level}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 md:p-8">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">
                                                            <span className="bg-emerald-50 px-2 py-1 rounded">{course.category}</span>
                                                            {course.duration && (
                                                                <span className="flex items-center gap-1 text-slate-400 font-normal lowercase">
                                                                    <Clock className="w-3 h-3" /> {course.duration}m
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
                                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.userProgress.progress}%` }} />
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
                                                </GlassCard>
                                            </Link>
                                        </SmoothReveal>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* End of Path Indicator */}
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
            </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyGuides;
