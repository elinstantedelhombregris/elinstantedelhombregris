import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  Clock, 
  Eye, 
  User, 
  Play, 
  FileText, 
  TrendingUp,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  type: 'blog' | 'vlog';
  imageUrl?: string;
  videoUrl?: string;
  viewCount: number;
  publishedAt: string;
  author: {
    name: string;
  };
  tags: Array<{ tag: string }>;
  likes: Array<any>;
  comments: Array<any>;
}

interface RelatedPostsProps {
  postId: number;
  currentCategory: string;
  currentTags: string[];
  limit?: number;
  className?: string;
}

export default function RelatedPosts({
  postId,
  currentCategory,
  currentTags,
  limit = 4,
  className = ''
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedPosts();
  }, [postId, currentCategory, currentTags]);

  const fetchRelatedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blog/posts/${postId}/related?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar posts relacionados');
      }
      
      const posts = await response.json();
      setRelatedPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar posts relacionados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelevanceScore = (post: RelatedPost) => {
    let score = 0;
    
    // Same category gets high score
    if (post.category === currentCategory) {
      score += 3;
    }
    
    // Common tags get points
    const postTags = post.tags.map(t => t.tag);
    const commonTags = currentTags.filter(tag => postTags.includes(tag));
    score += commonTags.length;
    
    // Recent posts get bonus
    const daysSincePublished = Math.floor(
      (new Date().getTime() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePublished < 7) {
      score += 1;
    }
    
    // Popular posts get bonus
    if (post.viewCount > 100) {
      score += 1;
    }
    
    return score;
  };

  const sortedPosts = relatedPosts.sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Artículos Relacionados
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Artículos Relacionados
          </h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchRelatedPosts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Artículos Relacionados
          </h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500">
            No se encontraron artículos relacionados en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Artículos Relacionados
        </h2>
        <Link href="/blog-vlog">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md">
              {/* Featured Image */}
              {post.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <Link href={`/blog-vlog/${post.slug}`}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    />
                  </Link>
                  <div className="absolute top-4 left-4">
                    <Badge className={`flex items-center gap-1 ${
                      post.type === 'vlog' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}>
                      {post.type === 'vlog' ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {post.type === 'vlog' ? 'Vlog' : 'Blog'}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getRelevanceScore(post) > 2 ? 'Muy relacionado' : 'Relacionado'}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  <Link href={`/blog-vlog/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.viewCount}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag.tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                >
                  <Link href={`/blog-vlog/${post.slug}`}>
                    {post.type === 'vlog' ? 'Ver Video' : 'Leer Artículo'}
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Call to action */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-gray-600 mb-4">
          ¿Te interesa explorar más contenido?
        </p>
        <Link href="/blog-vlog">
          <Button variant="outline" size="lg">
            Explorar todo el Blog & Vlog
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function RelatedPostsCompact({
  postId,
  currentCategory,
  currentTags,
  limit = 3,
  className = ''
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/posts/${postId}/related?limit=${limit}`);
        if (response.ok) {
          const posts = await response.json();
          setRelatedPosts(posts);
        }
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [postId, currentCategory, currentTags]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-semibold text-gray-800">Relacionados</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Relacionados
      </h3>
      
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link key={post.id} href={`/blog-vlog/${post.slug}`}>
            <motion.div
              whileHover={{ x: 5 }}
              className="group cursor-pointer"
            >
              <div className="flex gap-3">
                {post.imageUrl && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.type === 'vlog' ? 'Vlog' : 'Blog'} • {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }
  
  return date.toLocaleDateString('es-AR', {
    month: 'short',
    day: 'numeric'
  });
}
