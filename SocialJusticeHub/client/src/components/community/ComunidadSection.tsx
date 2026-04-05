import { useState, useMemo, useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import SmoothReveal from '@/components/ui/SmoothReveal';
import GlassCard from '@/components/ui/GlassCard';
import PowerCTA from '@/components/PowerCTA';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Target, Zap, Sparkles, Search, MapPin,
  ArrowRight, Heart, Eye, Map, List, Plus
} from 'lucide-react';
import InitiativesMap from '@/components/InitiativesMap';
import StoryScroll from './StoryScroll';

type CommunityPost = {
  id: number;
  title: string;
  description: string;
  type: string;
  missionSlug?: string;
  location: string;
  memberCount?: number;
  participants?: number;
  userId?: number;
  createdAt?: string;
  tags?: string[];
  likesCount?: number;
  viewsCount?: number;
  likedByMe?: boolean;
  author?: { name: string; username: string };
};

interface ComunidadSectionProps {
  ayudaCompartirPost: any | null;
  posts: CommunityPost[];
  isLoading?: boolean;
  onNavigateToPost: (id: number) => void;
  onNavigate: (path: string) => void;
  onCreatePost: () => void;
}

const POST_TYPES = [
  { value: 'all', label: 'Todos', icon: Users },
  { value: 'project', label: 'Proyectos', icon: Target },
  { value: 'action', label: 'Acciones', icon: Zap },
  { value: 'exchange', label: 'Intercambios', icon: Sparkles },
];

const TYPE_STYLES: Record<string, { gradient: string; badgeBg: string; badgeColor: string }> = {
  project:  { gradient: 'from-blue-500 to-cyan-500',     badgeBg: 'bg-blue-500/10',    badgeColor: 'text-blue-400' },
  action:   { gradient: 'from-orange-500 to-red-500',    badgeBg: 'bg-orange-500/10',   badgeColor: 'text-orange-400' },
  exchange: { gradient: 'from-purple-500 to-pink-500',   badgeBg: 'bg-purple-500/10',   badgeColor: 'text-purple-400' },
  default:  { gradient: 'from-emerald-500 to-teal-500',  badgeBg: 'bg-emerald-500/10',  badgeColor: 'text-emerald-400' },
};

export default function ComunidadSection({
  ayudaCompartirPost,
  posts,
  isLoading,
  onNavigateToPost,
  onNavigate,
  onCreatePost,
}: ComunidadSectionProps) {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) return apiRequest('DELETE', `/api/community/${postId}/like`);
      return apiRequest('POST', `/api/community/${postId}/like`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  // Filter posts: exclude missions and the featured ayuda post
  const communityPosts = useMemo(() => {
    let filtered = posts.filter((p) =>
      p.type !== 'mission' && p.id !== ayudaCompartirPost?.id
    );
    if (filter !== 'all') {
      filtered = filtered.filter((p) => p.type === filter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [posts, ayudaCompartirPost, filter, searchTerm]);

  const style = (type: string) => TYPE_STYLES[type] || TYPE_STYLES.default;

  return (
    <>
      {/* Story Scroll — featured post + category intro */}
      <StoryScroll
        ayudaCompartirPost={ayudaCompartirPost}
        onNavigateToPost={onNavigateToPost}
      />

      {/* TOOLBAR: Filter + Search + View + Create */}
      <div className="sticky top-[7.5rem] z-30 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container-content flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
            {POST_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    filter === t.value
                      ? 'bg-blue-500/20 border-blue-500/40 text-white'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
              />
            </div>

            {/* View toggle */}
            <div className="flex border border-white/10 rounded-full p-0.5 bg-white/5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-blue-500/20 text-white' : 'text-slate-500'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-all ${viewMode === 'map' ? 'bg-blue-500/20 text-white' : 'text-slate-500'}`}
              >
                <Map className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Create button */}
            <button
              onClick={onCreatePost}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Crear</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-10 min-h-[40vh]">
        <div className="container-content">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-slate-600 font-mono text-xs">Cargando...</p>
            </div>
          ) : communityPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Todavía no hay iniciativas</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Sé el primero en crear un proyecto, una acción ciudadana o un intercambio en tu territorio.
              </p>
              <PowerCTA
                text="CREAR INICIATIVA"
                onClick={onCreatePost}
                variant="accent"
                icon={<Plus className="w-4 h-4" />}
              />
            </div>
          ) : viewMode === 'map' ? (
            <InitiativesMap
              initiatives={communityPosts as any}
              onInitiativeClick={onNavigateToPost}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {communityPosts.map((post, i) => {
                const s = style(post.type);
                return (
                  <SmoothReveal key={post.id} delay={i * 0.06}>
                    <GlassCard
                      className="h-full group cursor-pointer hover:border-white/20 transition-all duration-300 flex flex-col overflow-hidden"
                      onClick={() => onNavigateToPost(post.id)}
                      intensity="low"
                    >
                      {/* Color bar */}
                      <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />

                      <div className="p-5 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className={`capitalize border-0 px-2 py-0.5 text-[11px] ${s.badgeBg} ${s.badgeColor}`}>
                            {post.type}
                          </Badge>
                          <span className="text-[10px] text-slate-600 font-mono">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                          {post.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                          {post.description}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">#{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 mt-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white text-[10px] font-bold">
                              {post.author?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-slate-400 truncate max-w-[80px]">{post.author?.name || 'Anónimo'}</span>
                            {post.location && (
                              <>
                                <span className="text-slate-700">·</span>
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[60px]">{post.location}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className={`flex items-center gap-0.5 transition-colors ${post.likedByMe ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!userContext?.user) { onNavigate('/login'); return; }
                                toggleLikeMutation.mutate({ postId: post.id, isLiked: !!post.likedByMe });
                              }}
                            >
                              <Heart className={`w-3 h-3 ${post.likedByMe ? 'fill-current' : ''}`} />
                              {(post.likesCount || 0) > 0 && <span>{post.likesCount}</span>}
                            </button>
                            {(post.viewsCount || 0) > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> {post.viewsCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </SmoothReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
