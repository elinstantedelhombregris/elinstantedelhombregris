
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Play, FileText, User, Search, X, Loader2, ArrowUpRight, Video } from 'lucide-react';
// Animation handled by SmoothReveal component
import { Link, useLocation } from 'wouter';
import LikeButton from '@/components/LikeButton';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { apiRequest } from '@/lib/queryClient';
import { getAnonSessionId } from '@/lib/anonSession';
import { useSeoMetadata } from '@/lib/seo';
import { buildBlogHubMetadata, buildBlogPostPath, BLOG_HUB_PATH, VLOG_HUB_PATH, normalizeBlogReadTime } from '@shared/blog-seo';
import { getCategoryColorDark } from '@/lib/editorial';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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
  likeCount?: number;
  userLiked?: boolean;
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
  const seoKind = location === BLOG_HUB_PATH ? 'blog' : location === VLOG_HUB_PATH ? 'vlog' : 'all';
  const seoMetadata = useMemo(
    () => buildBlogHubMetadata(seoKind, typeof window !== 'undefined' ? window.location.origin : undefined),
    [seoKind],
  );

  useSeoMetadata(seoMetadata);

  // Detect route and set active tab accordingly
  useEffect(() => {
    if (location === BLOG_HUB_PATH) {
      setActiveTab('blog');
    } else if (location === VLOG_HUB_PATH) {
      setActiveTab('vlog');
    } else {
      setActiveTab('all');
    }
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
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

      // Pass sessionId so the server can mark each post's userLiked
      // for this anonymous viewer in the list response.
      params.append('sessionId', getAnonSessionId());
      const response = await apiRequest('GET', `/api/blog/posts?${params}`);

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

  // LikeButton handles the local optimistic flip and reverts on throw. This
  // handler is only responsible for hitting the API and propagating the
  // server's authoritative count/userLiked back into the list.
  const handleLike = async (postId: number) => {
    const response = await apiRequest('POST', `/api/blog/posts/${postId}/like`, {
      sessionId: getAnonSessionId(),
    });

    if (!response.ok) {
      throw new Error('No se pudo registrar el like');
    }

    const result: { liked: boolean; count: number } = await response.json();
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, userLiked: result.liked, likeCount: result.count }
        : post,
    ));
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
    <Link href={buildBlogPostPath(post)}>
      <div className="group relative flex min-h-[520px] cursor-pointer items-end overflow-hidden rounded-3xl border border-white/10 p-8 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_60px_rgba(125,91,222,0.12)] md:p-12">
        <div className="absolute inset-0 bg-[#0d1117]">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-[#7D5BDE] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Destacado
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
          </div>

          <h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-6xl">
            {post.title}
          </h2>

          <p className="mb-8 max-w-2xl text-lg text-slate-300 line-clamp-2 md:text-xl">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><User className="h-4 w-4" aria-hidden="true" />{post.author.name}</span>
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" aria-hidden="true" />{normalizeBlogReadTime(post.content)} min lectura</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const GridCard = ({ post, index }: { post: BlogPost, index: number }) => (
    <Link href={buildBlogPostPath(post)}>
      <div
        className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)] ${
          index % 3 === 0 && post.type !== 'vlog' ? 'md:col-span-2' : ''
        }`}
      >
        <div className="relative h-60 overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
              {post.type === 'vlog'
                ? <Play className="h-12 w-12 text-slate-600" aria-hidden="true" />
                : <FileText className="h-12 w-12 text-slate-600" aria-hidden="true" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md">
              {post.type === 'vlog' ? <Play className="h-3 w-3" aria-hidden="true" /> : <FileText className="h-3 w-3" aria-hidden="true" />}
              {post.type === 'vlog' ? 'Vlog' : 'Blog'}
            </span>
          </div>
        </div>

        <div className="flex flex-grow flex-col p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{normalizeBlogReadTime(post.content)} min</span>
          </div>

          <h3 className="mb-3 font-serif text-2xl font-bold leading-tight text-slate-100 transition-colors group-hover:text-white">
            {post.title}
          </h3>

          <p className="mb-6 flex-grow text-slate-400 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.userLiked || false}
              initialCount={post.likeCount ?? (post.likes || []).length}
              onLike={handleLike}
              onUnlike={handleLike}
              size="sm"
              showCount
            />
            <span className="inline-flex items-center text-sm font-medium text-violet-400 transition-transform group-hover:translate-x-1">
              Leer más <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>
      <Header />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-20">

            {/* Hero Header */}
            <section className="mb-20 flex min-h-[40vh] flex-col items-center justify-center text-center">
              <SmoothReveal direction="up" className="mb-6">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <FileText className="h-4 w-4 text-[#7D5BDE]" aria-hidden="true" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Blog & Vlog</span>
                </div>
              </SmoothReveal>
              <SmoothReveal direction="up" delay={0.1}>
                <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-7xl lg:text-8xl">
                  Crónicas del Despertar
                </h1>
              </SmoothReveal>
              <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
                <p className="text-xl font-light leading-relaxed text-slate-400 md:text-2xl">
                  Ideas para entender el presente, diseñar mejores decisiones y sostener acción colectiva con sentido.
                </p>
              </SmoothReveal>
            </section>

            {/* Floating Filters Bar */}
            <div className="sticky top-24 z-40 mb-12 py-4">
              <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a]/80 p-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:flex-row md:gap-4">
                <div className="flex shrink-0 rounded-full bg-white/5 p-1">
                  {(['all', 'blog', 'vlog'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-6 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[#7D5BDE] text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'all' ? 'Todo' : tab === 'blog' ? 'Blog' : 'Vlog'}
                    </button>
                  ))}
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block" />

                <div className="relative w-full flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar tema, autor o categoría..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full border-none bg-transparent pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-0"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label="Limpiar búsqueda">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block" />

                <div className="hide-scrollbar flex max-w-[200px] shrink-0 gap-2 overflow-x-auto px-2 md:max-w-none">
                  {categories.slice(0, 4).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-200 text-slate-900'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeTab === 'vlog' ? (
                /* Vlog Coming Soon */
                <SmoothReveal direction="up" className="mb-12">
                    <div className="max-w-2xl mx-auto text-center py-24">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#7D5BDE]/10 mb-8">
                            <Video className="w-12 h-12 text-violet-400" />
                        </div>
                        <h2 className="mb-6 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-4xl">
                            Próximamente
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed mb-4">
                            Estamos preparando los primeros videos del movimiento.
                        </p>
                        <p className="text-lg text-slate-500">
                            Muy pronto compartiremos contenido audiovisual para acompañar el despertar colectivo.
                        </p>
                    </div>
                </SmoothReveal>
            ) : (
                <>
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
                                <div key={i} className="h-96 bg-white/5 rounded-3xl animate-pulse" />
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
                        {isLoadingMore && <Loader2 className="w-8 h-8 animate-spin text-slate-500" />}
                    </div>

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg">No se encontraron publicaciones.</p>
                            <Button variant="link" className="text-violet-400" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </>
            )}

      </main>
      <Footer />
    </div>
  );
};

export default BlogVlog;
