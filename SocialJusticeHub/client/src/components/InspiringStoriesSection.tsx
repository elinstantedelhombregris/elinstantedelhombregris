import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star,
  Sparkles,
  Users,
  Briefcase,
  HandHeart,
  BookOpen,
  Gift,
  Link
} from 'lucide-react';
import { InspiringStoryCard } from './InspiringStoryCard';
import { apiRequest } from '@/lib/queryClient';

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

interface StoryFilters {
  category?: string;
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

const parseStoriesResponse = (payload: unknown): InspiringStory[] => {
  if (Array.isArray(payload)) {
    return payload as InspiringStory[];
  }
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: InspiringStory[] }).data;
  }
  return [];
};

const fetchStories = async (url: string): Promise<InspiringStory[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch stories (${response.status})`);
  }
  const payload = await response.json();
  return parseStoriesResponse(payload);
};

export function InspiringStoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch featured stories
  const { data: featuredStories = [] } = useQuery<InspiringStory[]>({
    queryKey: ['inspiring-stories', 'featured'],
    queryFn: () => fetchStories('/api/stories/featured?limit=3'),
  });

  // Fetch stories by category
  const { data: categoryStories = [], isLoading: isLoadingCategory } = useQuery<InspiringStory[]>({
    queryKey: ['inspiring-stories', 'category', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return fetchStories('/api/stories?status=approved&limit=6');
      }
      return fetchStories(`/api/stories/category/${selectedCategory}?limit=6`);
    },
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLikeStory = async (storyId: number) => {
    try {
      await apiRequest('POST', `/api/stories/${storyId}/like`);
      // Optimistic update could be added here
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleShareStory = async (storyId: number) => {
    try {
      await apiRequest('POST', `/api/stories/${storyId}/share`);
      
      // Share to social media
      if (navigator.share) {
        await navigator.share({
          title: 'Historia Inspiradora - ¡BASTA!',
          text: 'Mira esta historia inspiradora de la comunidad ¡BASTA!',
          url: window.location.href
        });
      }
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'Todas', icon: Sparkles },
    { id: 'employment', label: 'Empleo', icon: Briefcase },
    { id: 'volunteering', label: 'Voluntariado', icon: HandHeart },
    { id: 'community_project', label: 'Proyectos', icon: Users },
    { id: 'personal_growth', label: 'Crecimiento', icon: BookOpen },
    { id: 'resource_sharing', label: 'Recursos', icon: Gift },
    { id: 'connection', label: 'Conexiones', icon: Link }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Historias que Inspiran
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada conexión cuenta, cada historia importa. Descubre cómo nuestra comunidad está transformando vidas y creando impacto real.
          </p>
        </div>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-2xl font-bold text-gray-900">Historias Destacadas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStories.map((story: InspiringStory) => (
                <InspiringStoryCard
                  key={story.id}
                  story={story}
                  onLike={() => handleLikeStory(story.id)}
                  onShare={() => handleShareStory(story.id)}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Explora por Categoría
          </h3>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="mb-12">
          {isLoadingCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categoryStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryStories.map((story: InspiringStory) => (
                <InspiringStoryCard
                  key={story.id}
                  story={story}
                  onLike={() => handleLikeStory(story.id)}
                  onShare={() => handleShareStory(story.id)}
                  featured={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay historias disponibles
              </h3>
              <p className="text-gray-500">
                Pronto tendremos más historias inspiradoras en esta categoría.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Tienes una historia que contar?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Comparte tu experiencia y ayuda a inspirar a otros miembros de la comunidad.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-50 font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Compartir mi Historia
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
