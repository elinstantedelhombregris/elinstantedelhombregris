import { useState, useEffect, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Target, Sparkles, Search, MapPin, MessageCircle, 
  ArrowRight, Zap, Filter, Plus, Trophy, Heart, BookOpen, Map, List
} from 'lucide-react';

import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TribalPulse from '@/components/TribalPulse';
import FluidBackground from '@/components/ui/FluidBackground';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import GlassCard from '@/components/ui/GlassCard';
import RelatedPages from '@/components/RelatedPages';
import InitiativesMap from '@/components/InitiativesMap';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import ShockStats from '@/components/ShockStats';

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
  tags?: string[];
  author?: {
    name: string;
    username: string;
  };
};

const communityStats = [
  { 
    id: 'members', 
    label: 'Miembros Activos', 
    value: 12540, 
    unit: '', 
    color: 'blue' as const, 
    icon: <Users className="w-5 h-5" />, 
    description: 'Ciudadanos despiertos' 
  },
  { 
    id: 'projects', 
    label: 'Proyectos Vivos', 
    value: 843, 
    unit: '', 
    color: 'purple' as const, 
    icon: <Sparkles className="w-5 h-5" />, 
    description: 'Transformando realidad' 
  },
  { 
    id: 'impact', 
    label: 'Impacto Directo', 
    value: 45000, 
    unit: '+', 
    color: 'green' as const, 
    icon: <Target className="w-5 h-5" />, 
    description: 'Vidas tocadas' 
  },
];

const Community = () => {
  const userContext = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // New Post State
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    type: 'project' as const,
    location: '',
    participants: '',
    tags: '',
    latitude: '',
    longitude: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'La Tribu - Comunidad de Transformadores | ¡BASTA!';
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts', searchTerm, selectedType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/community?type=${selectedType}`);
      if (response.ok) return response.json();
      return [];
    },
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewPost({
          ...newPost,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
        setIsGettingLocation(false);
        toast({
          title: "Ubicación obtenida",
          description: "Tu ubicación ha sido agregada a la iniciativa",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

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
      const postData: any = {
        ...newPost,
        participants: newPost.participants ? parseInt(newPost.participants) : null,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // Add geolocation if provided
      if (newPost.latitude && newPost.longitude) {
        postData.latitude = parseFloat(newPost.latitude);
        postData.longitude = parseFloat(newPost.longitude);
      }

      const response = await apiRequest('POST', '/api/community', postData);

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Tu iniciativa ha sido lanzada a la red.",
        });
        setShowCreateModal(false);
        setNewPost({ title: '', description: '', type: 'project', location: '', participants: '', tags: '', latitude: '', longitude: '' });
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el post.", variant: "destructive" });
    }
  };

  const postTypes = [
    { value: 'all', label: 'Todo el Flujo', icon: <Users className="w-4 h-4" /> },
    { value: 'project', label: 'Proyectos', icon: <Target className="w-4 h-4" /> },
    { value: 'action', label: 'Acciones', icon: <Zap className="w-4 h-4" /> },
    { value: 'exchange', label: 'Intercambios', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 font-sans relative overflow-hidden">
      <FluidBackground className="opacity-40" />
      <Header />
      
      <main className="relative z-10 pt-20">
        <TribalPulse />

        {/* HERO: The Call to Assembly */}
        <section className="relative py-32 overflow-hidden">
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <SmoothReveal direction="down">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-mono mb-8 tracking-widest uppercase backdrop-blur-md">
                  <Users className="w-4 h-4" />
                  La Tribu de Transformadores
                </div>
              </SmoothReveal>
              
              <SmoothReveal delay={0.2}>
                <h1 className="heading-hero mb-8">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500">
                    El Ágora Viva
                  </span>
                  <span className="block text-2xl md:text-4xl font-sans font-light text-slate-400 mt-4 tracking-wide">
                    Donde la voluntad individual se hace <span className="text-blue-400">Poder Colectivo</span>
                  </span>
                </h1>
              </SmoothReveal>

              <SmoothReveal delay={0.4}>
                <p className="text-xl md:text-2xl text-slate-400/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                  Has despertado. Has sembrado. Ahora es momento de conectar.
                  <br />
                  Aquí las ideas encuentran recursos, y los líderes encuentran su tribu.
                </p>
              </SmoothReveal>

              <SmoothReveal delay={0.6}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <PowerCTA
                    text="LANZAR INICIATIVA"
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                    animate={true}
                    icon={<Sparkles className="w-5 h-5" />}
                  />
                  <PowerCTA
                    text="EXPLORAR MISIONES"
                    variant="secondary"
                    onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                    size="lg"
                    animate={true}
                    icon={<Target className="w-5 h-5" />}
                  />
                </div>
              </SmoothReveal>
            </div>
          </div>
        </section>

        {/* SHOCK STATS: Community Impact */}
        <section className="py-12 border-t border-white/5 bg-white/[0.02]">
          <div className="container-content">
            <ShockStats 
              stats={communityStats} 
              title="PULSO DE LA TRIBU" 
              variant="dark"
            />
          </div>
        </section>

        {/* THE COMPASS: Sticky Navigation */}
        <div className="sticky top-20 z-40 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/5">
          <div className="container-content flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                    selectedType === type.value 
                      ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por habilidad, ciudad o causa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex gap-2 border border-white/10 rounded-full p-1 bg-white/5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-500/20 text-white border border-blue-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-blue-500/20 text-white border border-blue-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* THE GRID: Content Area */}
        <section className="py-16 min-h-[60vh]">
          <div className="container-content">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-mono text-sm animate-pulse">Sincronizando red...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                  <Target className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">El tablero está vacío</h3>
                <p className="text-slate-500 mb-8">Sé el primero en encender una chispa en esta categoría.</p>
                <PowerCTA 
                  text="INICIAR EL MOVIMIENTO" 
                  onClick={() => setShowCreateModal(true)} 
                  variant="accent"
                />
              </div>
            ) : viewMode === 'map' ? (
              <InitiativesMap 
                initiatives={posts.filter((post: CommunityPost) => {
                  // Apply filters to map view
                  if (selectedType !== 'all' && post.type !== selectedType) return false;
                  if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                      !post.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                  return true;
                })}
                onInitiativeClick={(id) => setLocation(`/community/${id}`)}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: CommunityPost, i: number) => (
                  <SmoothReveal key={post.id} delay={i * 0.1}>
                    <GlassCard 
                      className="h-full group cursor-pointer hover:border-blue-500/50 transition-all duration-500 flex flex-col overflow-hidden" 
                      onClick={() => setLocation(`/community/${post.id}`)}
                      intensity="low"
                    >
                      {/* Card Header Gradient */}
                      <div className={`h-2 w-full ${
                        post.type === 'project' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        post.type === 'action' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                        post.type === 'exchange' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`} />

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className={`
                            capitalize border-0 px-3 py-1
                            ${post.type === 'project' ? 'bg-blue-500/10 text-blue-400' :
                              post.type === 'action' ? 'bg-orange-500/10 text-orange-400' :
                              post.type === 'exchange' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-emerald-500/10 text-emerald-400'}
                          `}>
                            {post.type}
                          </Badge>
                          <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                            {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                          {post.title}
                        </h3>

                        <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                          {post.description}
                        </p>

                        {/* Tags if available */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold shadow-sm">
                              {post.author?.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-medium truncate max-w-[100px]">{post.author?.name}</span>
                              <span className="flex items-center gap-1 text-[10px]">
                                <MapPin className="w-2.5 h-2.5" /> {post.location}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 rounded-full px-3">
                              Conectar <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </SmoothReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HALL OF GUARDIANS */}
        <section className="py-16 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent" />
          <div className="container-content relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 text-xs font-mono mb-6 tracking-widest uppercase">
                  <Trophy className="w-3 h-3" />
                  Hall of Guardians
                </div>
                <h2 className="heading-section mb-6 text-white">
                  Líderes del Despertar
                </h2>
                <p className="text-slate-400 leading-relaxed mb-8">
                  Reconocemos a quienes transforman la realidad con acciones consistentes. Su impacto es el faro que guía a la tribu.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((rank) => (
                    <GlassCard key={rank} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                        rank === 2 ? 'bg-slate-400/20 text-slate-300 border-slate-400/50' :
                        'bg-orange-700/20 text-orange-400 border-orange-700/50'
                      }`}>
                        {rank}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold">Guardián {rank === 1 ? 'Solar' : rank === 2 ? 'Lunar' : 'Estelar'}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                          <Target className="w-3 h-3" /> {150 - rank * 12} Misiones Completadas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{(5000 - rank * 500).toLocaleString()}</div>
                        <div className="text-xs text-slate-500 uppercase">XP</div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
              
              {/* My Stats Card */}
              <div className="w-full md:w-96">
                <GlassCard className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border-blue-500/20">
                  <div className="text-center p-6 border-b border-white/5">
                    <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full mb-4 flex items-center justify-center border-2 border-blue-500/30">
                      <span className="text-2xl font-bold text-white">
                        {userContext?.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg">Tu Legado</h3>
                    <p className="text-slate-400 text-sm">
                      {userContext?.user ? userContext.user.username : 'Iniciado'}
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Nivel Actual</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Nivel 1</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progreso a Nivel 2</span>
                        <span>450 / 1000 XP</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[45%]" />
                      </div>
                    </div>
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 mt-4">
                      Ver Mi Perfil Completo
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>


      </main>
      <Footer />

      {/* CREATE MODAL - Dark Theme */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] bg-[#0f1116] border border-white/10 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-white">Lanzar Iniciativa</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define tu misión y convoca a la tribu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Título de la Misión</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Ej: Red de Huertas Comunitarias"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tipo de Acción</label>
                <Select value={newPost.type} onValueChange={(v: any) => setNewPost({ ...newPost, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1116] border-white/10 text-slate-200">
                    {postTypes.filter(t => t.value !== 'all').map(t => (
                      <SelectItem key={t.value} value={t.value} className="focus:bg-white/10 focus:text-white">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Base de Operaciones</label>
                <Input
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  placeholder="Ciudad, Provincia"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-400">Geolocalización (Opcional)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="border-white/10 hover:bg-white/10 text-slate-300"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isGettingLocation ? 'Obteniendo...' : 'Usar mi ubicación'}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Agrega coordenadas para que tu iniciativa aparezca en el mapa
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Latitud</label>
                  <Input
                    type="number"
                    step="any"
                    value={newPost.latitude}
                    onChange={(e) => setNewPost({ ...newPost, latitude: e.target.value })}
                    placeholder="-34.6037"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Longitud</label>
                  <Input
                    type="number"
                    step="any"
                    value={newPost.longitude}
                    onChange={(e) => setNewPost({ ...newPost, longitude: e.target.value })}
                    placeholder="-58.3816"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Manifiesto / Descripción</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                placeholder="Describe el impacto que buscas generar..."
                rows={4}
                className="w-full p-3 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Abortar
              </Button>
              <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Lanzar Misión
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
