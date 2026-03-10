import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  Target,
  Star,
  TrendingUp,
  Calendar,
  Flame,
  Zap,
  Heart,
  Users,
  BookOpen,
  Save,
  Award,
  Activity,
  BarChart3,
  Crown,
  ShieldCheck,
  ArrowRight,
  Edit3,
  MapPin,
  X
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

interface BadgeType {
  id: number;
  name: string;
  description: string;
  iconName: string;
  rarity: string;
  experienceReward: number;
}

const UserProfile = () => {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userContext?.user?.name || '',
    email: userContext?.user?.email || '',
    location: userContext?.user?.location || ''
  });

  useEffect(() => {
    if (!userContext?.user) {
      const timer = setTimeout(() => setAuthCheckTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [userContext?.user]);

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 30000,
  });

  const { data: userBadges = [], isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ['/api/user/badges'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 60000,
  });

  const { data: userActivity = [], isLoading: activityLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user/activity'],
    enabled: !!userContext?.isLoggedIn,
    staleTime: 60000,
  });

  const { data: allBadges = [] } = useQuery<BadgeType[]>({
    queryKey: ['/api/badges'],
    staleTime: 300000,
  });

  // Auth guard
  if (!userContext?.user) {
    if (authCheckTimeout) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-blue-500/50 animate-pulse" />
            <h2 className="text-xl font-serif text-slate-100">Acceso restringido</h2>
            <p className="text-slate-500 mt-2 font-mono text-sm">Iniciá sesión para ver tu perfil.</p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-blue-400 font-mono text-sm tracking-widest">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const { user } = userContext;
  const progressPercentage = userStats ? (userStats.experience / userStats.experienceToNext) * 100 : 0;

  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Consciencia Individual', color: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', icon: Heart };
      case 2: return { name: 'Núcleo Familiar', color: 'text-amber-400', gradient: 'from-amber-500 to-amber-600', icon: Users };
      case 3: return { name: 'Impacto Comunitario', color: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600', icon: BookOpen };
      case 4: return { name: 'Liderazgo Provincial', color: 'text-purple-400', gradient: 'from-purple-500 to-purple-600', icon: TrendingUp };
      case 5: return { name: 'Visión Nacional', color: 'text-indigo-400', gradient: 'from-indigo-500 to-indigo-600', icon: Star };
      default: return { name: 'Consciencia Individual', color: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', icon: Heart };
    }
  };

  const currentLevelInfo = getLevelInfo(userStats?.level || 1);
  const LevelIcon = currentLevelInfo.icon;

  const earnedBadgeIds = userBadges.map(ub => ub.badge.id);
  const availableBadges = allBadges.filter((badge) => !earnedBadgeIds.includes(badge.id));

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500' };
      case 'epic': return { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' };
      case 'rare': return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-purple-500' };
      default: return { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', gradient: 'from-slate-400 to-slate-600' };
    }
  };

  const profileMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; location?: string }) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
      toast({ title: 'Perfil actualizado', description: 'Tus cambios han sido guardados exitosamente.' });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios', variant: 'destructive' });
    }
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    profileMutation.mutate({ name: editForm.name, email: editForm.email, location: editForm.location });
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Reciente';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      <Header />
      <EmailVerificationBanner variant="dark" />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="w-28 h-28 rounded-2xl bg-white/5 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:border-blue-500/50 transition-all duration-500">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" />
                  <AvatarFallback className="bg-slate-900 text-slate-400 font-bold text-3xl">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center md:text-left flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight mb-1">
                {user.name}
              </h1>
              <p className="text-slate-500 font-mono text-sm mb-4">@{user.username}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">NV. {userStats?.level || 1} · {currentLevelInfo.name}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Zap className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300">{userStats?.experience || 0} XP</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">{user.location}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                onClick={handleEditToggle}
                variant="outline"
                className={`border-white/20 text-slate-300 hover:bg-white/10 hover:text-white ${isEditing ? 'bg-white/10 border-blue-500/50 text-blue-300' : ''}`}
              >
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                {isEditing ? 'Cancelar' : 'Editar perfil'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Edit form inline */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-3">
                  <Edit3 className="h-5 w-5 text-blue-400" />
                  Editar Información
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-400 text-xs uppercase tracking-wider">Nombre completo</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-400 text-xs uppercase tracking-wider">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-400 text-xs uppercase tracking-wider">Ubicación</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Ciudad, Provincia"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSave}
                    disabled={profileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {profileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button onClick={handleEditToggle} variant="ghost" className="text-slate-400 hover:text-slate-200 hover:bg-white/5">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="info" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="info" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg transition-all">
              <User className="h-4 w-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg transition-all">
              <BarChart3 className="h-4 w-4 mr-2" />
              Progreso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg transition-all">
              <Trophy className="h-4 w-4 mr-2" />
              Logros
            </TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Nombre</span>
                    <span className="text-slate-200 font-medium text-sm">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Email</span>
                    <span className="text-slate-200 font-medium text-sm">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Usuario</span>
                    <span className="text-slate-200 font-medium text-sm">@{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Ubicación</span>
                    <span className="text-slate-200 font-medium text-sm">{user.location || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Miembro desde</span>
                    <span className="text-slate-200 font-medium text-sm">{memberSince}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                    Estadísticas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Nivel actual</span>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
                      {userStats?.level || 1} · {currentLevelInfo.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Experiencia</span>
                    <span className="text-blue-400 font-bold text-sm">{userStats?.experience || 0} XP</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Racha</span>
                    <span className="text-amber-400 font-bold text-sm flex items-center">
                      <Flame className="h-4 w-4 mr-1" />
                      {userStats?.streak || 0} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Desafíos completados</span>
                    <span className="text-emerald-400 font-bold text-sm">{userStats?.completedChallenges || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progreso */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center text-lg font-bold text-slate-100 uppercase tracking-wider">
                  <Crown className="h-5 w-5 mr-3 text-amber-400" />
                  Progreso en la Guía del Cambio
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs font-mono mt-1">
                  EVOLUCIÓN A TRAVÉS DE 5 NIVELES
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center`}>
                    <LevelIcon className={`h-8 w-8 ${currentLevelInfo.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${currentLevelInfo.color} font-serif`}>{currentLevelInfo.name}</h3>
                    <p className="text-slate-500 font-mono text-xs mt-1">
                      PRÓXIMO NIVEL: <span className="text-slate-200 font-bold">{(userStats?.experienceToNext || 500) - (userStats?.experience || 0)} XP</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <span>Nivel {userStats?.level || 1}</span>
                  <span className="text-blue-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Desafíos', value: userStats?.completedChallenges || 0, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Racha', value: `${userStats?.streak || 0}d`, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Logros', value: userStats?.badgesEarned || 0, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'XP Total', value: userStats?.experience || 0, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 mx-auto rounded-lg ${stat.bg} border flex items-center justify-center mb-3`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Activity */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                  <Activity className="h-4 w-4 mr-2 text-emerald-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {activityLoading ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500 font-mono text-xs animate-pulse">CARGANDO ACTIVIDAD...</p>
                  </div>
                ) : userActivity.length > 0 ? (
                  <div className="space-y-2">
                    {userActivity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-300">{new Date(activity.date).toLocaleDateString('es-AR')}</p>
                            <p className="text-xs text-slate-500">
                              +{activity.experienceGained} XP · {activity.challengesCompleted} desafíos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.streakActive && <Flame className="h-4 w-4 text-amber-500" />}
                          <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                            {activity.actionsCompleted} acciones
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-lg border border-dashed border-white/10">
                    <Activity className="h-8 w-8 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-1">Tu actividad aparecerá acá</p>
                    <p className="text-slate-600 font-mono text-xs mb-4">Completá desafíos para registrar tu progreso</p>
                    <Link href="/challenges">
                      <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs uppercase tracking-wider">
                        Ver desafíos
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logros */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <Award className="h-4 w-4 mr-2 text-yellow-400" />
                    Logros Obtenidos
                  </CardTitle>
                  <span className="text-xs font-mono text-slate-500">
                    {userBadges.length} / {allBadges.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {badgesLoading ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500 font-mono text-xs animate-pulse">CARGANDO LOGROS...</p>
                  </div>
                ) : userBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBadges.map((userBadge) => {
                      const style = getRarityStyle(userBadge.badge.rarity);
                      return (
                        <div key={userBadge.id} className={`p-4 rounded-lg border ${style.bg} transition-colors hover:bg-white/[0.07]`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${style.gradient}`}>
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-200">{userBadge.badge.name}</h3>
                              <p className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                                {userBadge.badge.rarity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{userBadge.badge.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="text-emerald-400">+{userBadge.badge.experienceReward} XP</span>
                            <span>{new Date(userBadge.earnedAt).toLocaleDateString('es-AR')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-lg border border-dashed border-white/10">
                    <Trophy className="h-8 w-8 text-yellow-500/30 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-1">Completá desafíos para desbloquear tus primeros logros</p>
                    <p className="text-slate-600 font-mono text-xs mb-4">Cada logro otorga XP y reconocimiento</p>
                    <Link href="/challenges">
                      <Button variant="outline" size="sm" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs uppercase tracking-wider">
                        Explorar desafíos
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Badges */}
            {availableBadges.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-200 uppercase tracking-wider">
                    <Star className="h-4 w-4 mr-2 text-slate-500" />
                    Logros Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableBadges.map((badge) => (
                      <div key={badge.id} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] opacity-60">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 border border-white/10">
                            <Award className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-400">{badge.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {badge.rarity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{badge.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <span>+{badge.experienceReward} XP</span>
                          <span className="uppercase tracking-wider">Bloqueado</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
