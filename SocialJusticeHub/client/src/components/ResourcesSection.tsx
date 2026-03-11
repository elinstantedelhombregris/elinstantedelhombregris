import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, FileText, Video, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

const ResourcesSection = () => {
  // Fetch counts for Blog, Vlog, and Courses
  const { data: blogStats } = useQuery({
    queryKey: ['blog-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/stats');
      if (response.ok) {
        return await response.json();
      }
      return { blog: 0, vlog: 0, total: 0 };
    },
    staleTime: 60000,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/courses?limit=1');
      if (response.ok) {
        const data = await response.json();
        return data.total || data.courses?.length || 0;
      }
      return 0;
    },
    staleTime: 60000,
  });

  // Fetch recent content from each category
  const { data: recentBlog } = useQuery({
    queryKey: ['recent-blog'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/posts?type=blog&limit=3');
      if (response.ok) {
        const data = await response.json();
        return data.posts || data || [];
      }
      return [];
    },
    staleTime: 60000,
  });

  const { data: recentVlog } = useQuery({
    queryKey: ['recent-vlog'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/posts?type=vlog&limit=3');
      if (response.ok) {
        const data = await response.json();
        return data.posts || data || [];
      }
      return [];
    },
    staleTime: 60000,
  });

  const { data: recentCourses } = useQuery({
    queryKey: ['recent-courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/courses?limit=3');
      if (response.ok) {
        const data = await response.json();
        return data.courses || data || [];
      }
      return [];
    },
    staleTime: 60000,
  });

  const blogCount = blogStats?.blog ?? 0;
  const vlogCount = blogStats?.vlog ?? 0;
  const coursesCount = typeof coursesData === 'number' ? coursesData : 0;

  const recentBlogItems = Array.isArray(recentBlog)
    ? recentBlog
    : Array.isArray((recentBlog as any)?.posts)
      ? (recentBlog as any).posts
      : [];

  const recentVlogItems = Array.isArray(recentVlog)
    ? recentVlog
    : Array.isArray((recentVlog as any)?.posts)
      ? (recentVlog as any).posts
      : [];

  const recentCourseItems = Array.isArray(recentCourses)
    ? recentCourses
    : Array.isArray((recentCourses as any)?.courses)
      ? (recentCourses as any).courses
      : [];

  const resourceTypes = [
    {
      title: 'Blog',
      description: 'Artículos escritos sobre la visión, el movimiento y las ideas detrás del Hombre Gris',
      icon: FileText,
      href: '/recursos/blog',
      count: blogCount,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      recentContent: recentBlogItems
    },
    {
      title: 'Vlog',
      description: 'Videos y contenido multimedia para aprender de manera visual y dinámica',
      icon: Video,
      href: '/recursos/vlog',
      count: vlogCount,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      recentContent: recentVlogItems
    },
    {
      title: 'Rutas de Transformación',
      description: 'Cursos interactivos y guías estructuradas para profundizar tu comprensión',
      icon: GraduationCap,
      href: '/recursos/guias-estudio',
      count: coursesCount,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      recentContent: recentCourseItems
    }
  ];

  return (
    <section id="herramientas" className="section-spacing page-bg-light">
      <div className="container-content">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Aprendé y Crecé</span>
          </div>
          <h2 className="heading-section text-gray-900 mb-6">Recursos Educativos</h2>
          <p className="text-body text-gray-600 max-w-4xl mx-auto">
            Hay ideas que cambian la forma en que ves el mundo. Acá encontrás algunas que pueden hacerlo.
          </p>
        </div>
        
        {/* Main Resource Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {resourceTypes.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Link key={resource.title} href={resource.href}>
                <div 
                  className={`card-unified-light overflow-hidden ${resource.borderColor} hover-lift group cursor-pointer h-full flex flex-col`}
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{resource.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{resource.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{resource.count}</span>
                        <span className="text-sm text-gray-500">
                          {resource.title === 'Blog' ? 'artículos' : 
                           resource.title === 'Vlog' ? 'videos' : 
                           'cursos'}
                        </span>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${resource.textColor} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Content Section */}
        {(recentBlogItems.length > 0 || recentVlogItems.length > 0 || recentCourseItems.length > 0) && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Contenido Reciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Blog Posts */}
              {recentBlogItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-800">Blog</h4>
                  </div>
                  <ul className="space-y-3">
                    {recentBlogItems.slice(0, 3).map((post: any) => (
                      <li key={post.id}>
                        <Link 
                          href={`/blog-vlog/${post.slug}`}
                          className="text-gray-700 hover:text-blue-600 text-sm leading-relaxed block hover:underline transition-colors"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/recursos/blog"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold mt-4"
                  >
                    Ver todos los artículos
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Recent Vlog Posts */}
              {recentVlogItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-gray-800">Vlog</h4>
                  </div>
                  <ul className="space-y-3">
                    {recentVlogItems.slice(0, 3).map((post: any) => (
                      <li key={post.id}>
                        <Link 
                          href={`/blog-vlog/${post.slug}`}
                          className="text-gray-700 hover:text-purple-600 text-sm leading-relaxed block hover:underline transition-colors"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/recursos/vlog"
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm font-semibold mt-4"
                  >
                    Ver todos los videos
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Recent Courses */}
              {recentCourseItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">Rutas de Transformación</h4>
                  </div>
                  <ul className="space-y-3">
                    {recentCourseItems.slice(0, 3).map((course: any) => (
                      <li key={course.id}>
                        <Link 
                          href={`/recursos/guias-estudio/${course.slug}`}
                          className="text-gray-700 hover:text-green-600 text-sm leading-relaxed block hover:underline transition-colors"
                        >
                          {course.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/recursos/guias-estudio"
                    className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-semibold mt-4"
                  >
                    Ver todos los cursos
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResourcesSection;
