import { useEffect, useState, useRef } from 'react';
import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag,
  Share2,
  BookOpen,
  Play,
  Eye,
  MessageCircle,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbList } from '@/components/ui/breadcrumb';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import { Link } from 'wouter';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  useEffect(() => {
    document.title = post ? `${post.title} - El Instante del Hombre Gris` : 'Blog - El Instante del Hombre Gris';
  }, [post]);

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
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {error || 'Post no encontrado'}
              </h1>
              <p className="text-gray-600 mb-8">
                El artículo que buscas no existe o ha sido movido.
              </p>
              <Link href="/blog-vlog">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Blog
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl lg:max-w-5xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog-vlog">Blog & Vlog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{post.category}</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back Button */}
          <Link href="/blog-vlog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Blog
            </Button>
          </Link>

          {/* Article Header */}
          <motion.article
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <header className="mb-8">
              {/* Category and Type */}
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {post.type === 'vlog' ? (
                    <Play className="w-3 h-3" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                  {post.type === 'vlog' ? 'Vlog' : 'Blog'}
                </Badge>
                <Badge variant="outline">{post.category}</Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight font-serif">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
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
                  <span>{estimateReadTime(post.content)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} vistas</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag.tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mb-8">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked || false}
                  initialCount={post.likes.length}
                  onLike={handleLike}
                  onUnlike={handleLike}
                  size="lg"
                />
                <BookmarkButton
                  postId={post.id}
                  initialBookmarked={post.userBookmarked || false}
                  onBookmark={handleBookmark}
                  onUnbookmark={handleBookmark}
                  size="lg"
                />
                <ShareButtons
                  url={`${window.location.origin}/blog-vlog/${post.slug}`}
                  title={post.title}
                  description={post.excerpt}
                  hashtags={post.tags.map(tag => tag.tag)}
                  size="lg"
                  variant="outline"
                />
              </div>
            </header>

            {/* Featured Image */}
            {post.imageUrl && post.type === 'blog' && (
              <div className="mb-8">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Video Embed */}
            {post.type === 'vlog' && post.videoUrl && (
              <div className="mb-8">
                <YouTubeEmbed
                  videoId={post.videoUrl}
                  title={post.title}
                  className="shadow-lg rounded-lg overflow-hidden"
                />
              </div>
            )}

            {/* Article Content */}
            <div ref={contentRef} className="mb-12">
              <MarkdownRenderer
                content={post.content}
                className="
                  blog-content
                  prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5
                  prose-table:w-full prose-table:my-6
                  prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-th:text-left
                  prose-td:p-3 prose-td:border-t prose-td:border-gray-200
                "
              />
            </div>

            {/* Tags and Actions Footer */}
            <div className="border-t border-gray-200 pt-8 mb-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Etiquetas:</span>
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.div
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
