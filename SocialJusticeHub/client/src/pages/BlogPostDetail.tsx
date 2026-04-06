import { useEffect, useMemo, useRef, useState } from 'react';
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
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import { Link } from 'wouter';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const progress = (visibleHeight / rect.height) * 100;
        setReadProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts/${postSlug}`);
      
      if (!response.ok) {
        throw new Error('Post no encontrado');
      }
      
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (post) {
          setPost({
            ...post,
            likes: result.liked 
              ? [...post.likes, { user: { id: 1, name: 'Usuario' } }] // Mock user
              : post.likes.filter(like => like.user.id !== 1), // Mock user
            userLiked: result.liked
          });
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (post) {
          setPost({
            ...post,
            userBookmarked: result.bookmarked
          });
        }
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

  // Category color map for consistent badge styling
  const categoryColors: Record<string, string> = {
    'Comunidad': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Organización': 'bg-blue-100 text-blue-700 border-blue-200',
    'Despertar': 'bg-amber-100 text-amber-700 border-amber-200',
    'Servicio': 'bg-rose-100 text-rose-700 border-rose-200',
    'Sistemas': 'bg-violet-100 text-violet-700 border-violet-200',
    'Diseño': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Amabilidad': 'bg-pink-100 text-pink-700 border-pink-200',
    'Reflexión': 'bg-orange-100 text-orange-700 border-orange-200',
    'Decisión Colectiva': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 theme-light">
        <Header />
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/20 rounded-full w-32"></div>
              <div className="h-12 bg-white/20 rounded w-3/4"></div>
              <div className="h-6 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 max-w-4xl -mt-12 relative z-10 pb-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-pulse space-y-6">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 theme-light">
        <Header />
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 pt-32 pb-32">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <h1 className="text-3xl font-bold text-white mb-4">
              {error || 'Post no encontrado'}
            </h1>
            <p className="text-white/70 mb-8">
              El artículo que buscas no existe o ha sido movido.
            </p>
            <Link href={BLOG_HUB_PATH}>
              <Button className="bg-white text-indigo-700 hover:bg-white/90 shadow-lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen bg-slate-50 theme-light">
      <Header />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 pt-28 pb-24 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-sm text-white/60 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="hover:text-white/90 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/recursos" className="hover:text-white/90 transition-colors">Recursos</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={collectionPath} className="hover:text-white/90 transition-colors">{collectionLabel}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">{post.title}</span>
          </motion.nav>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8"
          >
            <Link href={collectionPath}>
              <span className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group cursor-pointer">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver a {collectionLabel}
              </span>
            </Link>
          </motion.div>

          {/* Type & Category Badges */}
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              post.type === 'vlog'
                ? 'bg-red-500/90 text-white'
                : 'bg-white/90 text-indigo-700'
            }`}>
              {post.type === 'vlog' ? (
                <Play className="w-3 h-3" />
              ) : (
                <BookOpen className="w-3 h-3" />
              )}
              {post.type === 'vlog' ? 'Vlog' : 'Blog'}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white mb-5 leading-[1.15] font-serif"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-3xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          {/* Meta Row */}
          <motion.div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4 text-white/50" />
              {post.author.name}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/50" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/50" />
              {estimateReadTime(renderedContent)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-white/50" />
              {post.viewCount} vistas
            </span>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area — overlaps hero */}
      <main className="container mx-auto px-4 max-w-4xl -mt-10 relative z-10 pb-20">
        <motion.article
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Featured Image */}
          {post.imageUrl && post.type === 'blog' && (
            <div className="w-full">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Video Embed */}
          {post.type === 'vlog' && post.videoUrl && (
            <div className="w-full">
              <YouTubeEmbed
                videoId={post.videoUrl}
                title={post.title}
                className="rounded-none"
              />
            </div>
          )}

          {/* Tags + Actions Bar */}
          <div className="px-8 md:px-12 pt-8 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-default"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked || false}
                  initialCount={post.likes.length}
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
          </div>

          {/* Divider */}
          <div className="mx-8 md:mx-12 border-t border-slate-100" />

          {/* Article Content */}
          <div ref={contentRef} className="px-8 md:px-12 py-10">
            <MarkdownRenderer
              content={renderedContent}
              className="
                blog-content
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5
                prose-table:w-full prose-table:my-6
                prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-th:text-left
                prose-td:p-3 prose-td:border-t prose-td:border-gray-200
              "
            />
          </div>

          {/* Footer Actions */}
          <div className="px-8 md:px-12 pb-10">
            <div className="border-t border-slate-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">Etiquetas:</span>
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <LikeButton
                    postId={post.id}
                    initialLiked={post.userLiked || false}
                    initialCount={post.likes.length}
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
                    variant="outline"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CommentsSection
            postId={post.id}
            comments={post.comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={1} // Mock user ID
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
