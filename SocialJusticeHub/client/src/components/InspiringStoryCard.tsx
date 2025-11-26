import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Share2, 
  Eye, 
  MapPin, 
  Calendar, 
  Star,
  Sparkles,
  Users,
  Briefcase,
  HandHeart,
  BookOpen,
  Gift,
  Link,
  CheckCircle,
  Clock
} from 'lucide-react';

interface InspiringStory {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  authorId?: number;
  authorName?: string;
  authorEmail?: string;
  category: 'employment' | 'volunteering' | 'community_project' | 'personal_growth' | 'resource_sharing' | 'connection';
  location: string;
  province?: string;
  city?: string;
  impactType: 'job_created' | 'lives_changed' | 'hours_volunteered' | 'people_helped' | 'project_completed' | 'resource_shared';
  impactCount: number;
  impactDescription: string;
  imageUrl?: string;
  videoUrl?: string;
  verified: boolean;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  views: number;
  likes: number;
  shares: number;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface InspiringStoryCardProps {
  story: InspiringStory;
  onLike: () => void;
  onShare: () => void;
  featured?: boolean;
}

const categoryIcons = {
  employment: Briefcase,
  volunteering: HandHeart,
  community_project: Users,
  personal_growth: BookOpen,
  resource_sharing: Gift,
  connection: Link
};

const categoryLabels = {
  employment: 'Empleo',
  volunteering: 'Voluntariado',
  community_project: 'Proyecto Comunitario',
  personal_growth: 'Crecimiento Personal',
  resource_sharing: 'Compartir Recursos',
  connection: 'Conexión'
};

const categoryColors = {
  employment: 'bg-blue-100 text-blue-800',
  volunteering: 'bg-green-100 text-green-800',
  community_project: 'bg-purple-100 text-purple-800',
  personal_growth: 'bg-orange-100 text-orange-800',
  resource_sharing: 'bg-pink-100 text-pink-800',
  connection: 'bg-indigo-100 text-indigo-800'
};

const impactIcons = {
  job_created: Briefcase,
  lives_changed: Heart,
  hours_volunteered: HandHeart,
  people_helped: Users,
  project_completed: Star,
  resource_shared: Gift
};

const impactLabels = {
  job_created: 'empleos creados',
  lives_changed: 'vidas cambiadas',
  hours_volunteered: 'horas de voluntariado',
  people_helped: 'personas ayudadas',
  project_completed: 'proyectos completados',
  resource_shared: 'recursos compartidos'
};

export function InspiringStoryCard({ story, onLike, onShare, featured = false }: InspiringStoryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const CategoryIcon = categoryIcons[story.category];
  const ImpactIcon = impactIcons[story.impactType];
  const categoryLabel = categoryLabels[story.category];
  const impactLabel = impactLabels[story.impactType];

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayContent = showFullContent ? story.content : story.excerpt;

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
      featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon className="h-4 w-4 text-gray-600" />
              <Badge className={`text-xs ${categoryColors[story.category]}`}>
                {categoryLabel}
              </Badge>
              {story.verified && (
                <CheckCircle className="h-4 w-4 text-green-500" title="Historia verificada" />
              )}
              {featured && (
                <Star className="h-4 w-4 text-yellow-500" title="Historia destacada" />
              )}
            </div>
            
            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {story.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{story.authorName || 'Anónimo'}</span>
          {story.location && (
            <>
              <span>•</span>
              <MapPin className="h-4 w-4" />
              <span>{story.location}</span>
            </>
          )}
        </div>

        {/* Impact Metrics */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <ImpactIcon className="h-5 w-5 text-purple-600" />
          <div>
            <span className="font-bold text-purple-600">{story.impactCount}</span>
            <span className="text-gray-600 ml-1">{impactLabel}</span>
          </div>
          <div className="text-sm text-gray-500 ml-auto">
            {story.impactDescription}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {displayContent}
            {!showFullContent && story.content.length > story.excerpt.length && (
              <button
                onClick={() => setShowFullContent(true)}
                className="text-purple-600 hover:text-purple-700 font-medium ml-1"
              >
                ...leer más
              </button>
            )}
          </p>
        </div>

        {/* Tags */}
        {story.tags && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {JSON.parse(story.tags).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{story.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{story.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{story.shares}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={`hover:bg-red-50 ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onShare}
              className="hover:bg-blue-50 text-gray-500"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
          <Calendar className="h-3 w-3" />
          <span>Publicado el {formatDate(story.publishedAt || story.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
