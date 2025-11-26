import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Calendar,
  Zap,
  Crown,
  Lock,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Bookmark,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserBadge {
  id: number;
  name: string;
  description: string;
  iconName: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experienceReward: number;
  earnedAt?: string;
  progress?: number;
  requirement?: string;
  requirementData?: any;
}

interface ReadingBadgesProps {
  userId?: number;
  variant?: 'full' | 'compact' | 'showcase';
  showProgress?: boolean;
  showUnearned?: boolean;
  filterBy?: 'all' | 'earned' | 'unearned' | 'category';
  className?: string;
}

export default function ReadingBadges({
  userId,
  variant = 'full',
  showProgress = true,
  showUnearned = true,
  filterBy = 'all',
  className = ''
}: ReadingBadgesProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/gamification/badges`);
      
      if (!response.ok) {
        throw new Error('Error al cargar badges');
      }
      
      const badgesData = await response.json();
      setBadges(badgesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar badges');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'book-open': BookOpen,
      'heart': Heart,
      'message-circle': MessageCircle,
      'calendar': Calendar,
      'zap': Zap,
      'crown': Crown,
      'trophy': Trophy,
      'star': Star,
      'target': Target,
      'users': Users,
      'clock': Clock,
      'bookmark': Bookmark,
      'eye': Eye,
      'trending-up': TrendingUp,
      'award': Award,
      'check-circle': CheckCircle
    };
    
    const IconComponent = icons[iconName] || Award;
    return <IconComponent className="w-6 h-6" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500 border-yellow-300';
      case 'epic':
        return 'from-purple-400 to-pink-500 border-purple-300';
      case 'rare':
        return 'from-blue-400 to-indigo-500 border-blue-300';
      default:
        return 'from-green-400 to-teal-500 border-green-300';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'earned' && badge.earnedAt) ||
                         (filterBy === 'unearned' && !badge.earnedAt) ||
                         (filterBy === 'category' && badge.category);

    return matchesSearch && matchesCategory && matchesRarity && matchesFilter;
  });

  const earnedBadges = badges.filter(badge => badge.earnedAt);
  const unearnedBadges = badges.filter(badge => !badge.earnedAt);

  const categories = Array.from(new Set(badges.map(badge => badge.category)));

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Mis Badges</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          <h2 className="text-2xl font-bold text-gray-800">Mis Badges</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchBadges} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const renderBadgeCard = (badge: UserBadge, index: number) => {
    const isEarned = !!badge.earnedAt;
    const progress = badge.progress || 0;

    return (
      <motion.div
        key={badge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="group cursor-pointer"
        onClick={() => setSelectedBadge(badge)}
      >
        <Card className={`overflow-hidden transition-all duration-300 ${
          isEarned 
            ? 'hover:shadow-xl border-0 shadow-md' 
            : 'opacity-60 hover:opacity-80 border-dashed'
        }`}>
          <CardHeader className="pb-4 text-center">
            <div className={`
              w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center
              ${isEarned 
                ? `bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white shadow-lg` 
                : 'bg-gray-200 text-gray-400'
              }
              transition-all duration-300 group-hover:scale-110
            `}>
              {isEarned ? getIcon(badge.iconName) : <Lock className="w-6 h-6" />}
            </div>
            
            <CardTitle className={`text-lg ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>
              {badge.name}
            </CardTitle>
            
            <div className="flex items-center justify-center gap-2">
              <Badge className={getRarityBadgeColor(badge.rarity)}>
                {badge.rarity}
              </Badge>
              {isEarned && (
                <Badge variant="secondary" className="text-xs">
                  +{badge.experienceReward} XP
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="text-center">
            <CardDescription className={`text-sm mb-4 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
              {badge.description}
            </CardDescription>

            {isEarned && badge.earnedAt && (
              <p className="text-xs text-gray-500 mb-3">
                Obtenido: {new Date(badge.earnedAt).toLocaleDateString('es-AR')}
              </p>
            )}

            {showProgress && !isEarned && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progreso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            )}

            {!isEarned && badge.requirement && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Requisito:</p>
                <p className="text-xs text-gray-500">{badge.requirement}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderFull = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-6 h-6" />
            Mis Badges
          </h2>
          <p className="text-gray-600 mt-1">
            {earnedBadges.length} de {badges.length} badges obtenidos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {Math.round((earnedBadges.length / badges.length) * 100)}% completado
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rareza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="common">Común</SelectItem>
              <SelectItem value="rare">Raro</SelectItem>
              <SelectItem value="epic">Épico</SelectItem>
              <SelectItem value="legendary">Legendario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{earnedBadges.length}</div>
            <p className="text-sm text-gray-600">Obtenidos</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {earnedBadges.reduce((sum, badge) => sum + badge.experienceReward, 0)}
            </div>
            <p className="text-sm text-gray-600">XP Total</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {earnedBadges.filter(b => b.rarity === 'legendary').length}
            </div>
            <p className="text-sm text-gray-600">Legendarios</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {badges.length - earnedBadges.length}
            </div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBadges.map((badge, index) => renderBadgeCard(badge, index))}
        </AnimatePresence>
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No se encontraron badges
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );

  const renderCompact = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Badges Recientes
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {earnedBadges.slice(0, 6).map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="text-center p-3 bg-gray-50 rounded-lg"
          >
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
              {getIcon(badge.iconName)}
            </div>
            <p className="text-xs font-medium text-gray-800">{badge.name}</p>
          </motion.div>
        ))}
      </div>
      
      <Button variant="outline" size="sm" className="w-full">
        Ver todos los badges
      </Button>
    </div>
  );

  const renderShowcase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Colección de Badges</h2>
        <p className="text-gray-600">
          {earnedBadges.length} de {badges.length} badges obtenidos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`
              aspect-square rounded-xl flex flex-col items-center justify-center p-4
              ${badge.earnedAt 
                ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-lg` 
                : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
              }
              transition-all duration-300 hover:scale-105
            `}
          >
            <div className="text-3xl mb-2">
              {badge.earnedAt ? getIcon(badge.iconName) : <Lock className="w-8 h-8" />}
            </div>
            <p className="text-xs font-medium text-center leading-tight">
              {badge.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return <div className={className}>{renderCompact()}</div>;
    case 'showcase':
      return <div className={className}>{renderShowcase()}</div>;
    default:
      return <div className={className}>{renderFull()}</div>;
  }
}
