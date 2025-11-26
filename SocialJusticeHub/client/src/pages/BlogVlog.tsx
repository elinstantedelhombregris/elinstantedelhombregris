
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Play, FileText, User, Search, X, Loader2, ArrowUpRight } from 'lucide-react';
// Animation handled by SmoothReveal component
import { Link, useLocation } from 'wouter';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import FluidBackground from '@/components/ui/FluidBackground';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  type: 'blog' | 'vlog';
  featured: boolean;
  imageUrl?: string;
  videoUrl?: string;
  viewCount: number;
  publishedAt: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  tags: Array<{ tag: string }>;
  likes: Array<any>;
  comments: Array<any>;
}

const BlogVlog = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'blog' | 'vlog'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Detect route and set active tab accordingly
  useEffect(() => {
    if (location === '/recursos/blog') {
      setActiveTab('blog');
      document.title = 'Blog - El Instante del Hombre Gris';
    } else if (location === '/recursos/vlog') {
      setActiveTab('vlog');
      document.title = 'Vlog - El Instante del Hombre Gris';
    } else {
      setActiveTab('all');
      document.title = 'Blog & Vlog - El Instante del Hombre Gris';
    }
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [activeTab, selectedCategory, searchQuery]);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setPosts([]);
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);

      const currentPageToFetch = reset ? 1 : page + 1;
      const params = new URLSearchParams({
        page: currentPageToFetch.toString(),
        limit: '12'
      });

      if (activeTab !== 'all') {
        params.append('type', activeTab);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/blog/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar los posts: ${response.status}`);
      }
      
      const newPosts = await response.json();
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(currentPageToFetch);
      }
      
      setHasMore(newPosts.length === 12);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los posts');
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [page, activeTab, selectedCategory, searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchPosts(false);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchPosts, hasMore, isLoadingMore]);

  const handleLike = async (postId: number) => {
    try {
        // Optimistic UI update
        setPosts(prev => prev.map(post => {
            if (post.id !== postId) return post;
            const isLiked = post.likes.some(like => like.user?.id === 1); // Assuming user id 1 for optimistic update
            return {
                ...post,
                likes: isLiked 
                    ? post.likes.filter(like => like.user?.id !== 1)
                    : [...post.likes, { user: { id: 1, name: 'Usuario' } }]
            };
        }));

      const response = await fetch(`/api/blog/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Sync with server state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: result.liked 
                  ? [...post.likes, { user: { id: 1, name: 'Usuario' } }]
                  : post.likes.filter(like => like.user?.id !== 1)
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async (postId: number) => {
    // Placeholder for bookmark logic
    console.log('Bookmark toggled for post', postId);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map(post => post.category)));
    return ['all', ...cats];
  }, [posts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPost = useMemo(() => posts.find(p => p.featured) || posts[0], [posts]);
  const gridPosts = useMemo(() => posts.filter(p => p.id !== featuredPost?.id), [posts, featuredPost]);

  const FeaturedCard = ({ post }: { post: BlogPost }) => (
    <Link href={`/blog-vlog/${post.slug}`}>
      <GlassCard className="group relative overflow-hidden min-h-[500px] flex items-end p-8 md:p-12 cursor-pointer border-0" intensity="high">
        {post.imageUrl && (
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                />
            </div>
        )}
        
        <div className="relative z-20 w-full max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`px-3 py-1 text-sm font-medium tracking-wide ${
                post.type === 'vlog' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
                {post.type === 'vlog' ? 'VLOG' : 'BLOG'}
            </Badge>
            <span className="text-white/80 text-sm font-medium uppercase tracking-wider border border-white/20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                {post.category}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-blue-200 transition-colors">
            {post.title}
          </h2>
          
          <p className="text-lg md:text-xl text-white/80 mb-8 line-clamp-2 max-w-2xl">
            {post.excerpt}
          </p>
          
          <div className="flex items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>5 min lectura</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );

  const GridCard = ({ post, index }: { post: BlogPost, index: number }) => (
    <Link href={`/blog-vlog/${post.slug}`}>
      <GlassCard 
        intensity="low"
        className={`group h-full flex flex-col cursor-pointer hover:border-blue-500/30 ${
             // Make every 3rd card span 2 columns on large screens for a "bento" feel, if it's not a vlog
             index % 3 === 0 && post.type !== 'vlog' ? 'md:col-span-2' : ''
        }`}
      >
        <div className="relative h-64 overflow-hidden bg-slate-200">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
                {post.type === 'vlog' ? <Play className="w-12 h-12 text-slate-400" /> : <FileText className="w-12 h-12 text-slate-400" />}
             </div>
          )}
          
          <div className="absolute top-4 left-4">
             <Badge className={post.type === 'vlog' ? 'bg-red-500' : 'bg-blue-500'}>
                {post.type === 'vlog' ? <Play className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                {post.type === 'vlog' ? 'Vlog' : 'Blog'}
             </Badge>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.category}</span>
             <span className="text-xs text-slate-400">•</span>
             <span className="text-xs text-slate-400">{formatDate(post.publishedAt)}</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <LikeButton
                    postId={post.id}
                    initialLiked={false}
                    initialCount={(post.likes || []).length}
                    onLike={handleLike}
                    onUnlike={handleLike}
                    size="sm"
                    showCount
                />
             </div>
             
             <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                Leer más <ArrowUpRight className="w-4 h-4 ml-1" />
             </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <FluidBackground />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
            
            {/* Hero Header */}
            <div className="mb-12 text-center max-w-4xl mx-auto">
                <SmoothReveal>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
                        CRÓNICAS DEL<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">DESPERTAR</span>
                    </h1>
                </SmoothReveal>
                <SmoothReveal delay={0.1}>
                    <p className="text-xl text-slate-600">
                        Explora las ideas que están rediseñando Argentina. Pensamiento sistémico, acción directa y consciencia colectiva.
                    </p>
                </SmoothReveal>
            </div>

            {/* Floating Filters Bar */}
            <div className="sticky top-24 z-40 mb-12 py-4">
                <GlassCard className="max-w-5xl mx-auto p-2 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white/70 backdrop-blur-xl shadow-xl rounded-full" intensity="high">
                    <div className="flex bg-slate-100 rounded-full p-1 shrink-0">
                        <Button
                            variant={activeTab === 'all' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('all')}
                            className={`rounded-full px-6 ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'}`}
                            size="sm"
                        >
                            Todo
                        </Button>
                        <Button
                            variant={activeTab === 'blog' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('blog')}
                            className={`rounded-full px-6 ${activeTab === 'blog' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'}`}
                            size="sm"
                        >
                            Blog
                        </Button>
                        <Button
                            variant={activeTab === 'vlog' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('vlog')}
                            className={`rounded-full px-6 ${activeTab === 'vlog' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'}`}
                            size="sm"
                        >
                            Vlog
                        </Button>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 h-10"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    <div className="shrink-0 overflow-x-auto max-w-[200px] md:max-w-none flex gap-2 px-2 hide-scrollbar">
                         {categories.slice(0, 4).map(cat => (
                             <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                                    selectedCategory === cat 
                                    ? 'bg-slate-900 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                             >
                                {cat === 'all' ? 'Todos' : cat}
                             </button>
                         ))}
                    </div>
                </GlassCard>
            </div>

            {/* Featured Post */}
            {!loading && featuredPost && !searchQuery && page === 1 && (
                <SmoothReveal className="mb-12">
                    <FeaturedCard post={featuredPost} />
                </SmoothReveal>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {loading && posts.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
                    ))
                ) : (
                    gridPosts.map((post, index) => (
                        <SmoothReveal key={post.id} delay={index * 0.05}>
                            <GridCard post={post} index={index} />
                        </SmoothReveal>
                    ))
                )}
            </div>

            {/* Infinite Scroll Loader */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {isLoadingMore && <Loader2 className="w-8 h-8 animate-spin text-slate-400" />}
            </div>

            {!loading && posts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-lg">No se encontraron publicaciones.</p>
                    <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                        Limpiar filtros
                    </Button>
                </div>
            )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogVlog;
