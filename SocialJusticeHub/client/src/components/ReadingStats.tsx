import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Eye, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  BarChart3,
  Activity,
  Users,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ReadingStats {
  totalPostsRead: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  readingStreak: number;
  weeklyActivity: Array<{
    date: string;
    postsRead: number;
    comments: number;
    likes: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  monthlyGoal: {
    target: number;
    current: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
}

interface ReadingStatsProps {
  userId?: number;
  className?: string;
  variant?: 'dashboard' | 'compact' | 'sidebar';
  showGoals?: boolean;
  showAchievements?: boolean;
}

export default function ReadingStats({
  userId,
  className = '',
  variant = 'dashboard',
  showGoals = true,
  showAchievements = true
}: ReadingStatsProps) {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchStats();
  }, [userId, selectedPeriod]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/gamification/stats?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const statsData = await response.json();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    return (stats.experience / stats.experienceToNext) * 100;
  };

  const getGoalProgress = () => {
    if (!stats) return 0;
    return (stats.monthlyGoal.current / stats.monthlyGoal.target) * 100;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-green-600 bg-green-100';
    if (streak >= 14) return 'text-blue-600 bg-blue-100';
    if (streak >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Lectura</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
          <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Lectura</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Estadísticas de Lectura
        </h2>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
            className="h-8 px-3 text-xs"
          >
            Semana
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
            className="h-8 px-3 text-xs"
          >
            Mes
          </Button>
          <Button
            variant={selectedPeriod === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedPeriod('all')}
            className="h-8 px-3 text-xs"
          >
            Todo
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artículos Leídos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPostsRead}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.weeklyActivity.reduce((sum, day) => sum + day.postsRead, 0)} esta semana
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Promedio: {Math.round(stats.totalViews / 30)} por día
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interacciones</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes + stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLikes} likes, {stats.totalComments} comentarios
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha de Lectura</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.readingStreak}</div>
              <p className="text-xs text-muted-foreground">
                días consecutivos
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Level and Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Nivel Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">Nivel {stats.currentLevel}</div>
                <p className="text-sm text-gray-600">
                  {stats.experience} / {stats.experienceToNext} XP
                </p>
              </div>
              <Badge className={getStreakColor(stats.readingStreak)}>
                {stats.readingStreak} días
              </Badge>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
            <p className="text-xs text-gray-500">
              {stats.experienceToNext - stats.experience} XP para el siguiente nivel
            </p>
          </CardContent>
        </Card>

        {showGoals && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Meta Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.monthlyGoal.current}</div>
                  <p className="text-sm text-gray-600">
                    de {stats.monthlyGoal.target} artículos
                  </p>
                </div>
                <Badge variant="secondary">
                  {Math.round(getGoalProgress())}%
                </Badge>
              </div>
              <Progress value={getGoalProgress()} className="h-2" />
              <p className="text-xs text-gray-500">
                {stats.monthlyGoal.target - stats.monthlyGoal.current} artículos restantes
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Categorías Favoritas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{category.category}</Badge>
                  <span className="text-sm text-gray-600">{category.count} artículos</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(category.count / Math.max(...stats.topCategories.map(c => c.count))) * 100}%` 
                    }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {showAchievements && stats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Logros Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.achievements.slice(0, 4).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCompact = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Mi Actividad
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-lg font-bold">{stats.totalPostsRead}</div>
          <div className="text-xs text-gray-600">Artículos</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-lg font-bold">{stats.readingStreak}</div>
          <div className="text-xs text-gray-600">Días</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Nivel {stats.currentLevel}</span>
          <span>{Math.round(getLevelProgress())}%</span>
        </div>
        <Progress value={getLevelProgress()} className="h-2" />
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Estadísticas</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Leídos
          </span>
          <span className="font-medium">{stats.totalPostsRead}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Likes
          </span>
          <span className="font-medium">{stats.totalLikes}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentarios
          </span>
          <span className="font-medium">{stats.totalComments}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Racha
          </span>
          <span className="font-medium">{stats.readingStreak}d</span>
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm mb-2">
          <span>Nivel {stats.currentLevel}</span>
          <span>{Math.round(getLevelProgress())}%</span>
        </div>
        <Progress value={getLevelProgress()} className="h-1.5" />
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return <div className={className}>{renderCompact()}</div>;
    case 'sidebar':
      return <div className={className}>{renderSidebar()}</div>;
    default:
      return <div className={className}>{renderDashboard()}</div>;
  }
}
