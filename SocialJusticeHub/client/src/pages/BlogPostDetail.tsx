import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  BookOpen,
  Play,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import BlogMediaSection from '@/components/BlogMediaSection';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import { Link } from 'wouter';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/editorial/ReadingProgress';
import ArticleTOC from '@/components/editorial/ArticleTOC';
import RelatedPosts from '@/components/editorial/RelatedPosts';
import { getCategoryColorDark } from '@/lib/editorial';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { getAnonSessionId } from '@/lib/anonSession';
import { useSeoMetadata } from '@/lib/seo';
import {
  BLOG_HUB_PATH,
  buildBlogHubPath,
  buildBlogPostMetadata,
  buildBlogPostPath,
  normalizeBlogContentForRendering,
  normalizeBlogReadTime,
} from '@shared/blog-seo';

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
  updatedAt?: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  tags: Array<{ tag: string }>;
  likes: Array<{ user: { id: number; name: string } }>;
  likeCount: number;
  comments: Array<{
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: { id: number; name: string; username: string };
    parentId?: number;
    replies?: Array<any>;
  }>;
  userLiked?: boolean;
  userBookmarked?: boolean;
}

export default function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const renderedContent = useMemo(
    () => normalizeBlogContentForRendering(post?.content),
    [post?.content],
  );
  const seoMetadata = useMemo(
    () => (post
      ? buildBlogPostMetadata(
          {
            ...post,
            content: renderedContent,
          },
          typeof window !== 'undefined' ? window.location.origin : undefined,
        )
      : null),
    [post, renderedContent],
  );
  const collectionPath = post ? buildBlogHubPath(post.type) : BLOG_HUB_PATH;
  const collectionLabel = post?.type === 'vlog' ? 'Vlog' : 'Blog';
  const canonicalPath = post ? buildBlogPostPath(post) : BLOG_HUB_PATH;
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : canonicalPath;

  useSeoMetadata(seoMetadata);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const sessionId = getAnonSessionId();
      const response = await apiRequest(
        'GET',
        `/api/blog/posts/${postSlug}?sessionId=${encodeURIComponent(sessionId)}`,
      );

      if (!response.ok) {
        throw new Error('Post no encontrado');
      }

      const data = await response.json();
      setPost(data);
      recordView(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el post');
    } finally {
      setLoading(false);
    }
  };

  // Count one view per browser session per post. The sessionStorage guard is
  // set before the await so React StrictMode's double-invoke can't double-count;
  // it is intentionally NOT cleared on failure — if the server actually
  // recorded the view but the response was lost, retrying on next load would
  // double-count. We'd rather miss a view than inflate one.
  const recordView = async (postId: number) => {
    const key = `eihg_viewed_${postId}`;
    if (typeof window === 'undefined' || window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    try {
      const response = await apiRequest('POST', `/api/blog/posts/${postId}/view`, {
        sessionId: getAnonSessionId(),
      });
      if (!response.ok) throw new Error('view request failed');
      setPost(prev => (prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev));
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleLike = async (postId: number) => {
    const response = await apiRequest('POST', `/api/blog/posts/${postId}/like`, {
      sessionId: getAnonSessionId(),
    });

    if (!response.ok) {
      throw new Error('No se pudo registrar el like');
    }

    const result: { liked: boolean; count: number } = await response.json();
    setPost(prev => prev ? {
      ...prev,
      userLiked: result.liked,
      likeCount: result.count,
    } : prev);
  };

  const handleBookmark = async (postId: number) => {
    try {
      const response = await apiRequest('POST', `/api/blog/posts/${postId}/bookmark`);
      if (response.ok) {
        const result = await response.json();
        setPost(prev => (prev ? { ...prev, userBookmarked: result.bookmarked } : prev));
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleAddComment = async (content: string, parentId?: number) => {
    if (!post) return;

    const response = await fetch(`/api/blog/posts/${post.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, parentId }),
    });

    if (response.ok) {
      const newComment = await response.json();
      setPost({
        ...post,
        comments: [...post.comments, newComment]
      });
    } else {
      throw new Error('Error al publicar comentario');
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    const response = await fetch(`/api/blog/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const updatedComment = await response.json();
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId ? updatedComment : comment
        )
      } : null);
    } else {
      throw new Error('Error al editar comentario');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const response = await fetch(`/api/blog/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId)
      } : null);
    } else {
      throw new Error('Error al eliminar comentario');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string) => {
    return `${normalizeBlogReadTime(content)} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 pt-32 pb-20">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 rounded-full bg-white/5" />
            <div className="h-12 w-3/4 rounded-2xl bg-white/5" />
            <div className="h-6 w-1/2 rounded-2xl bg-white/5" />
            <div className="mt-10 h-64 rounded-2xl bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-3/4 rounded bg-white/5" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="relative overflow-hidden pt-40 pb-32">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 font-serif text-3xl font-bold text-slate-100">
              {error || 'Post no encontrado'}
            </h1>
            <p className="mb-8 text-slate-400">
              El artículo que buscás no existe o fue movido.
            </p>
            <Link href={BLOG_HUB_PATH}>
              <Button className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Volver al Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header />
      <ReadingProgress targetRef={contentRef} />

      {/* Hero — ambient image backdrop melting into the page */}
      <div className="relative overflow-hidden pt-28 pb-16">
        {post.imageUrl ? (
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={post.imageUrl}
              alt=""
              className="h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        ) : (
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" aria-hidden="true" />
        )}

        <div className="container relative z-10 mx-auto max-w-4xl px-4">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-6 flex items-center gap-2 text-sm text-slate-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="transition-colors hover:text-slate-300">Inicio</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href="/recursos" className="transition-colors hover:text-slate-300">Recursos</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href={collectionPath} className="transition-colors hover:text-slate-300">{collectionLabel}</Link>
          </motion.nav>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8"
          >
            <Link href={collectionPath} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-sm">
              <span className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                Volver a {collectionLabel}
              </span>
            </Link>
          </motion.div>

          {/* Badges */}
          <motion.div
            className="mb-5 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              post.type === 'vlog'
                ? 'border-red-500/30 bg-red-500/15 text-red-300'
                : 'border-white/15 bg-white/10 text-slate-200'
            }`}>
              {post.type === 'vlog' ? <Play className="h-3 w-3" aria-hidden="true" /> : <BookOpen className="h-3 w-3" aria-hidden="true" />}
              {post.type === 'vlog' ? 'Vlog' : 'Blog'}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mb-5 font-serif text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.15] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            className="mb-8 max-w-3xl text-lg leading-relaxed text-slate-400 md:text-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          {/* Meta row */}
          <motion.div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden="true" />{post.author.name}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(post.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{estimateReadTime(renderedContent)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" aria-hidden="true" />{post.viewCount} vistas</span>
          </motion.div>
        </div>
      </div>

      <main className="container relative z-10 mx-auto px-4 pb-24">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="min-w-0 max-w-3xl lg:mx-auto"
          >
            {/* Featured image (blog) */}
            {post.imageUrl && post.type === 'blog' && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="mb-2 h-64 w-full rounded-2xl border border-white/10 object-cover md:h-96"
              />
            )}

            {/* Video embed (vlog) */}
            {post.type === 'vlog' && post.videoUrl && (
              <div className="mb-2 overflow-hidden rounded-2xl border border-white/10">
                <YouTubeEmbed videoId={post.videoUrl} title={post.title} className="rounded-none" />
              </div>
            )}

            <BlogMediaSection slug={post.slug} />

            {/* Mobile TOC */}
            <div className="mt-8 lg:hidden">
              <ArticleTOC containerRef={contentRef} contentKey={renderedContent} variant="mobile" />
            </div>

            {/* Article body */}
            <div ref={contentRef} className="editorial-dropcap mt-10">
              <MarkdownRenderer
                variant="dark"
                content={renderedContent}
                className="blog-content
                  prose-table:w-full prose-table:my-6
                  prose-th:bg-white/5 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:text-slate-200
                  prose-td:p-3 prose-td:border-t prose-td:border-white/10
                "
              />
            </div>

            {/* Single actions row */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
                  >
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    {tag.tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked || false}
                  initialCount={post.likeCount ?? post.likes.length}
                  onLike={handleLike}
                  onUnlike={handleLike}
                  size="sm"
                  showCount
                />
                <BookmarkButton
                  postId={post.id}
                  initialBookmarked={post.userBookmarked || false}
                  onBookmark={handleBookmark}
                  onUnbookmark={handleBookmark}
                  size="sm"
                />
                <ShareButtons
                  url={canonicalUrl}
                  title={post.title}
                  description={post.excerpt}
                  hashtags={post.tags.map(tag => tag.tag)}
                  size="sm"
                  variant="ghost"
                  showLabel={false}
                />
              </div>
            </div>
          </motion.article>

          {/* Desktop TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ArticleTOC containerRef={contentRef} contentKey={renderedContent} variant="desktop" />
            </div>
          </aside>
        </div>

        <div className="mx-auto max-w-3xl">
          <RelatedPosts category={post.category} currentPostId={post.id} />

          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CommentsSection
              comments={post.comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              currentUserId={userContext?.user?.id ?? 0}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
