import React, { useContext, useState } from 'react';
import { UserContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  User, 
  Trophy, 
  Target, 
  Star, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Zap,
  Heart,
  Users,
  BookOpen,
  Edit,
  Save,
  X,
  Award,
  Activity,
  BarChart3,
  Crown,
  Sparkles,
  Gem,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  streak: number;
  completedChallenges: number;
  totalChallenges: number;
  badgesEarned: number;
  lastActivity?: string;
}

interface UserBadge {
  id: number;
  badge: {
    id: number;
    name: string;
    description: string;
    iconName: string;
    rarity: string;
    experienceReward: number;
  };
  earnedAt: string;
  seen: boolean;
}

interface UserActivity {
  id: number;
  date: string;
  experienceGained: number;
  challengesCompleted: number;
  actionsCompleted: number;
  streakActive: boolean;
}

const UserProfile = () => {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userContext?.user?.name || '',
    email: userContext?.user?.email || '',
    bio: '',
    location: ''
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 30000,
  });

  // Fetch user badges
  const { data: userBadges = [], isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ['/api/user/badges'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 60000,
  });

  // Fetch user activity
  const { data: userActivity = [], isLoading: activityLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user/activity'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 60000,
  });

  // Fetch all badges
  interface Badge {
    id: number;
    name: string;
    description: string;
    iconName: string;
    rarity: string;
    experienceReward: number;
  }
  
  const { data: allBadges = [] } = useQuery<Badge[]>({
    queryKey: ['/api/badges'],
    staleTime: 300000,
  });

  if (!userContext?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  const { user } = userContext;
  const progressPercentage = userStats ? (userStats.experience / userStats.experienceToNext) * 100 : 0;

  // Get level name and color
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
      case 2: return { name: 'Tu Familia', color: 'from-pink-500 to-pink-600', icon: Users };
      case 3: return { name: 'Tu Barrio', color: 'from-green-500 to-green-600', icon: BookOpen };
      case 4: return { name: 'Tu Provincia', color: 'from-purple-500 to-purple-600', icon: TrendingUp };
      case 5: return { name: 'La Nación', color: 'from-indigo-500 to-indigo-600', icon: Star };
      default: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
    }
  };

  const currentLevelInfo = getLevelInfo(userStats?.level || 1);
  const LevelIcon = currentLevelInfo.icon;

  // Get badges not earned yet
  const earnedBadgeIds = userBadges.map(ub => ub.badge.id);
  const availableBadges = allBadges.filter((badge: Badge) => !earnedBadgeIds.includes(badge.id));

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-purple-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Get rarity text color
  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600';
      case 'epic': return 'text-purple-600';
      case 'rare': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        name: userContext?.user?.name || '',
        email: userContext?.user?.email || '',
        bio: '',
        location: ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you would implement the save functionality
    toast({
      title: 'Perfil actualizado',
      description: 'Tus cambios han sido guardados exitosamente.',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 font-serif">
              {user.name}
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">@{user.username}</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Badge className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <Crown className="h-4 w-4 mr-2" />
                Nivel {userStats?.level || 1} • {currentLevelInfo.name}
              </Badge>
              <Badge className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <Zap className="h-4 w-4 mr-2" />
                {userStats?.experience || 0} XP
              </Badge>
              <Badge className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
                <Trophy className="h-4 w-4 mr-2" />
                {userStats?.badgesEarned || 0} Logros
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="info" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-white to-gray-50 border-0 shadow-lg">
            <TabsTrigger value="info" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Progreso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Logros
            </TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="info" className="space-y-8">
            <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Información Personal
                </CardTitle>
                <CardDescription className="text-base">
                  Gestiona tu información personal y preferencias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="Ciudad, País"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                          id="username"
                          value={user.username}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Cuéntanos sobre ti..."
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                      <Button onClick={handleEditToggle} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Información Básica</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Usuario:</span>
                            <span className="font-medium">@{user.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Miembro desde:</span>
                            <span className="font-medium">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Estadísticas Rápidas</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nivel actual:</span>
                            <Badge variant="secondary">{userStats?.level || 1}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Experiencia:</span>
                            <span className="font-medium">{userStats?.experience || 0} XP</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Racha:</span>
                            <span className="font-medium flex items-center">
                              <Flame className="h-4 w-4 text-orange-500 mr-1" />
                              {userStats?.streak || 0} días
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Desafíos completados:</span>
                            <span className="font-medium">{userStats?.completedChallenges || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progreso */}
          <TabsContent value="progress" className="space-y-6">
            {/* Progreso General */}
            <Card>
              <CardHeader>
                <CardTitle>Tu Progreso en la Guía del Cambio</CardTitle>
                <CardDescription>
                  Sigue tu evolución a través de los 5 niveles de transformación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${currentLevelInfo.color} text-white rounded-full flex items-center justify-center`}>
                      <LevelIcon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{currentLevelInfo.name}</h3>
                      <p className="text-gray-600">
                        {(userStats?.experienceToNext || 500) - (userStats?.experience || 0)} XP para el siguiente nivel
                      </p>
                      <div className="flex justify-between text-sm mt-2">
                        <span>Nivel {userStats?.level || 1}</span>
                        <span>{userStats?.experience || 0} / {userStats?.experienceToNext || 500} XP</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3 mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas Detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Desafíos Completados</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats?.completedChallenges || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Flame className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats?.streak || 0} días</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Logros Obtenidos</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats?.badgesEarned || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Experiencia Total</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats?.experience || 0} XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Tu actividad de los últimos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Cargando actividad...</p>
                  </div>
                ) : userActivity.length > 0 ? (
                  <div className="space-y-3">
                    {userActivity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{new Date(activity.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">
                              +{activity.experienceGained} XP • {activity.challengesCompleted} desafíos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.streakActive && (
                            <Flame className="h-4 w-4 text-orange-500" />
                          )}
                          <Badge variant="outline">
                            {activity.actionsCompleted} acciones
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay actividad registrada aún</p>
                    <p className="text-sm text-gray-500">¡Completa desafíos para ver tu progreso aquí!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logros */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Logros Obtenidos */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Obtenidos</CardTitle>
                <CardDescription>
                  {userBadges.length} de {allBadges.length} logros desbloqueados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badgesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : userBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBadges.map((userBadge) => (
                      <div key={userBadge.id} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getRarityColor(userBadge.badge.rarity)}`}>
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{userBadge.badge.name}</h3>
                            <p className={`text-xs font-medium ${getRarityTextColor(userBadge.badge.rarity)}`}>
                              {userBadge.badge.rarity.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{userBadge.badge.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>+{userBadge.badge.experienceReward} XP</span>
                          <span>{new Date(userBadge.earnedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aún no has obtenido logros</p>
                    <p className="text-sm text-gray-500">¡Completa desafíos para desbloquearlos!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logros Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Disponibles</CardTitle>
                <CardDescription>
                  Desafíos para desbloquear más logros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableBadges.map((badge: any) => (
                      <div key={badge.id} className="p-4 border rounded-lg bg-gray-50 opacity-75">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300">
                            <Award className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-600">{badge.name}</h3>
                            <p className="text-xs font-medium text-gray-500">
                              {badge.rarity.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>+{badge.experienceReward} XP</span>
                          <span>Bloqueado</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">¡Has obtenido todos los logros disponibles!</p>
                    <p className="text-sm text-gray-500">¡Felicitaciones por tu dedicación!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
