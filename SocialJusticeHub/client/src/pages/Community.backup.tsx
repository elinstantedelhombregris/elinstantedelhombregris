import { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ActivityFeedItem from '@/components/ActivityFeedItem';
import { 
  Users,
  TrendingUp,
  Award,
  Heart,
  Eye,
  Plus,
  Filter,
  Star,
  MessageSquare,
  Bookmark,
  MapPin,
  Target,
  Zap,
  Sparkles,
  MessageCircle,
  Activity,
  Briefcase,
  HandHeart,
  Lightbulb,
  Gift,
  Search,
  Filter as FilterIcon,
  Share2,
  Trophy
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserContext } from '@/App';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Leaderboard from '@/components/Leaderboard';
import UserProgressTracker from '@/components/UserProgressTracker';
import RelatedPages from '@/components/RelatedPages';
import { motion } from 'framer-motion';

type CommunityPost = {
  id: number;
  title: string;
  description: string;
  type: 'employment' | 'exchange' | 'volunteer' | 'project' | 'donation' | 'story' | 'action' | 'idea' | 'question';
  location: string;
  participants?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'paused' | 'closed';
  views?: number;
  likes?: number;
  tags?: string[];
  author?: {
    name: string;
    username: string;
  };
};

const Community = () => {
  const userContext = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    type: 'project' as const,
    location: '',
    participants: '',
    tags: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'La Tribu - Comunidad de Transformadores | ¡BASTA!';
  }, []);

  const handleCreatePost = async () => {
    if (!userContext?.user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para crear posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/community', {
        ...newPost,
        participants: newPost.participants ? parseInt(newPost.participants) : null,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Tu post ha sido creado exitosamente",
        });
        setShowCreateModal(false);
        setNewPost({ title: '', description: '', type: 'project', location: '', participants: '', tags: '' });
        queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      } else {
        throw new Error('Error al crear el post');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el post. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts', searchTerm, selectedType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/community?type=${selectedType}`);
      if (response.ok) {
        return response.json();
      }
      return [];
    },
  });

  // Activity feed query
  const { data: activityFeed = [], isLoading: activityLoading } = useQuery({
    queryKey: ['activity-feed', activityFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/activity-feed?type=${activityFilter}&limit=20`);
      if (response.ok) {
        return response.json();
      }
      return [];
    },
    refetchInterval: 30000 
  });

  const postTypes = [
    { value: 'all', label: 'Todos', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' },
    { value: 'project', label: 'Proyectos', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    { value: 'employment', label: 'Trabajos', icon: <Briefcase className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700' },
    { value: 'exchange', label: 'Intercambios', icon: <Gift className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
    { value: 'volunteer', label: 'Voluntariado', icon: <HandHeart className="w-4 h-4" />, color: 'bg-rose-100 text-rose-700' },
    { value: 'donation', label: 'Donaciones', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
    { value: 'action', label: 'Acciones', icon: <Target className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
    { value: 'idea', label: 'Ideas', icon: <Sparkles className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
  ];

  const getTypeIcon = (type: string) => {
    const typeConfig = postTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : <TrendingUp className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = postTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-slate-100 text-slate-700';
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = postTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-blue-500/20 font-sans">
      <Header />
      <main>
        
        {/* Live Pulse Header */}
        <div className="bg-[#0a0a0a] text-white overflow-hidden py-3 border-b border-white/10 relative z-20">
          <motion.div 
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12">
                <span className="flex items-center gap-2 text-sm font-medium text-blue-300">
                  <Activity className="w-4 h-4 animate-pulse" />
                  Juan acaba de unirse a un semillero en Córdoba
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-purple-300">
                  <Sparkles className="w-4 h-4" />
                  Nueva propuesta: Huertas comunitarias en Rosario
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <Users className="w-4 h-4" />
                  12 personas se sumaron al compromiso samaritano hoy
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-orange-300">
                  <Target className="w-4 h-4" />
                  Proyecto "Escuela Viva" alcanzó el 80% de financiación
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
          
          <div className="container-content relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8">
              <Users className="w-4 h-4" />
              La Tribu de Transformadores
            </div>
            
            <h1 className="heading-hero text-slate-900 mb-6">
              El Mercado de la <span className="text-blue-600">Acción Colectiva</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Conecta, colabora y construye. Aquí las ideas encuentran recursos y la voluntad encuentra equipo.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button 
                onClick={() => {
                  if (!userContext?.user) {
                    toast({
                      title: "En la sesión",
                      description: "Debes estar logueado para crear posts",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar Oportunidad
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-6 rounded-full text-lg"
              >
                Explorar Rankings
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Miembros', value: '12.5k', icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                { label: 'Proyectos', value: '843', icon: <Lightbulb className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                { label: 'Conexiones', value: '45k', icon: <Share2 className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Ciudades', value: '128', icon: <MapPin className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className={`p-3 rounded-xl ${stat.color} mb-3`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="py-12 bg-slate-50/50 border-t border-slate-200">
          <div className="container-content">
            
            {/* Sticky Filter Bar */}
            <div className="sticky top-24 z-30 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar proyectos, personas, ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {postTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedType === type.value 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Masonry Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
                  <p className="text-slate-500">Cargando la tribu...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no hay publicaciones</h3>
                  <p className="text-slate-500 mb-8">Sé el primero en iniciar el movimiento en esta categoría.</p>
                  <Button onClick={() => setShowCreateModal(true)}>Crear Publicación</Button>
                </div>
              ) : (
                posts.map((post: CommunityPost) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => setLocation(`/community/${post.id}`)}
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${getTypeColor(post.type)} border-0 px-3 py-1 rounded-lg`}>
                          {getTypeIcon(post.type)}
                          <span className="ml-2">{getTypeLabel(post.type)}</span>
                        </Badge>
                        {post.status === 'active' && (
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                        {post.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {post.author?.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px]">{post.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Connect
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Rankings Section */}
        <section className="section-spacing bg-white">
          <div className="container-content">
            <div className="text-center mb-16">
              <h2 className="heading-section text-slate-900 mb-4">Líderes de la Tribu</h2>
              <p className="text-body text-slate-600">Reconociendo a quienes más aportan al cambio colectivo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Top Global</h3>
                </div>
                <Leaderboard data={[]} type="global" limit={5} />
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Más Activos (Semana)</h3>
                </div>
                <Leaderboard data={[]} type="weekly" limit={5} />
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Tu Impacto</h3>
                </div>
                {userContext?.user ? (
                  <UserProgressTracker 
                    progress={{
                      level: 2,
                      points: 450,
                      rank: 'Despierto',
                      totalActions: 12,
                      lastActionAt: new Date().toISOString()
                    }}
                    showDetails={false}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4 text-sm">Inicia sesión para ver tu progreso</p>
                    <Button onClick={() => setLocation('/login')} variant="outline" size="sm">
                      Conectar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <RelatedPages
          title="Continúa el Viaje"
          pages={[
            {
              title: "La Visión",
              description: "Entiende el plan maestro.",
              href: "/la-vision",
              color: "journey-vision",
              icon: <Eye className="w-5 h-5" />
            },
            {
              title: "El Hombre Gris",
              description: "Despierta tu consciencia.",
              href: "/el-instante-del-hombre-gris",
              color: "journey-hombre-gris"
            },
            {
              title: "La Semilla",
              description: "Siembra el cambio.",
              href: "/la-semilla-de-basta",
              color: "journey-semilla",
              icon: <Sparkles className="w-5 h-5" />
            }
          ]}
        />

      </main>
      <Footer />

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Crear Publicación</DialogTitle>
            <DialogDescription>Comparte tu iniciativa con la comunidad.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Título</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Ej: Huerta comunitaria en Palermo"
                className="bg-slate-50"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <Select value={newPost.type} onValueChange={(v: any) => setNewPost({ ...newPost, type: v })}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.filter(t => t.value !== 'all').map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Ubicación</label>
                <Input
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  placeholder="Ciudad, Provincia"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                placeholder="Describe tu propuesta..."
                rows={4}
                className="w-full p-3 rounded-md bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
              <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700 text-white">Publicar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
