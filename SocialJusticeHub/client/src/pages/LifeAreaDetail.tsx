import React, { useContext, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActionCard from '@/components/life-areas/ActionCard';
import ProgressTracker from '@/components/life-areas/ProgressTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, PlayCircle, TrendingUp, Target, Award, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';

const LifeAreaDetail = () => {
  const [, params] = useRoute('/life-areas/:areaId');
  const [, setLocation] = useLocation();
  const areaId = parseInt(params?.areaId || '0');
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch area details
  const { data: area, isLoading: areaLoading, error: areaError } = useQuery({
    queryKey: [`/api/life-areas/${areaId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch area' }));
        throw new Error(errorData.message || 'Failed to fetch area');
      }
      return response.json();
    },
    enabled: areaId > 0 && !isNaN(areaId),
    retry: 2,
  });

  // Fetch scores
  const { data: scores } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/scores`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/scores`);
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch actions
  const { data: actions } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/actions`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/actions`);
      if (!response.ok) throw new Error('Failed to fetch actions');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch progress
  const { data: progress } = useQuery({
    queryKey: [`/api/life-areas/${areaId}/progress`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/life-areas/${areaId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Fetch level data for this area
  const { data: levelData } = useQuery({
    queryKey: [`/api/life-areas/levels`],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/life-areas/levels');
      if (!response.ok) return null;
      const levels = await response.json();
      return levels.find((l: any) => l.lifeAreaId === areaId) || null;
    },
    enabled: !!userContext?.isLoggedIn && areaId > 0,
  });

  // Start action mutation
  const startActionMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiRequest('POST', `/api/life-areas/actions/${actionId}/start`);
      if (!response.ok) throw new Error('Failed to start action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/actions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/progress`] });
      toast({
        title: '¡Acción iniciada!',
        description: 'Has comenzado una nueva acción. ¡Sigue así!',
      });
    },
  });

  // Complete action mutation
  const completeActionMutation = useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiRequest('POST', `/api/life-areas/actions/${actionId}/complete`);
      if (!response.ok) throw new Error('Failed to complete action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/actions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/life-areas/${areaId}/progress`] });
      queryClient.invalidateQueries({ queryKey: ['/api/life-areas/dashboard'] });
      toast({
        title: '¡Acción completada!',
        description: 'Has ganado XP y semillas. ¡Excelente trabajo!',
      });
    },
  });

  if (areaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando área...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (areaError || !area) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                {areaError instanceof Error ? areaError.message : 'No se pudo cargar el área. Por favor, intenta nuevamente.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/life-areas')}>
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const areaScore = scores?.areaScore;
  const currentScore = areaScore?.currentScore ?? 0;
  const desiredScore = areaScore?.desiredScore ?? 0;
  const gap = areaScore?.gap ?? 0;

  const getIcon = (iconName: string | null) => {
    if (!iconName) return LucideIcons.Circle;
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return IconComponent;
  };

  const IconComponent = getIcon(area.iconName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/life-areas')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <IconComponent className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{area.name}</h1>
              {area.description && (
                <p className="text-gray-600 mt-2">{area.description}</p>
              )}
            </div>
          </div>

          {!areaScore && (
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Comienza tu evaluación</h3>
                    <p className="text-blue-100">
                      Completa el quiz para ver tu progreso y obtener acciones recomendadas
                    </p>
                  </div>
                  <Button
                    onClick={() => setLocation(`/life-areas/${areaId}/quiz`)}
                    variant="secondary"
                    size="lg"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Comenzar Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {areaScore && (
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            // Scroll to top when switching tabs
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                Acciones
                {actions && actions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {actions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                Progreso
                {progress?.actionsProgress && progress.actionsProgress.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {progress.actionsProgress.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Progress Tracker */}
              <ProgressTracker
                currentScore={currentScore}
                desiredScore={desiredScore}
                gap={gap}
                actionsCompleted={progress?.actionsProgress?.filter((ap: any) => ap.status === 'completed').length || 0}
                totalActions={actions?.length || 0}
                level={levelData?.level || 1}
                xpCurrent={levelData?.xpCurrent || 0}
                xpRequired={levelData?.xpRequired || 100}
              />

              {/* Subcategories */}
              {area.subcategories && area.subcategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subcategorías</CardTitle>
                    <CardDescription>
                      Detalles de cada aspecto de {area.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {area.subcategories.map((subcat: any) => {
                        const subcatScore = scores?.subcategoryScores?.find(
                          (s: any) => s.subcategoryId === subcat.id
                        );
                        const subcatGap = subcatScore ? subcatScore.desiredScore - subcatScore.currentScore : 0;
                        return (
                          <div key={subcat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{subcat.name}</h4>
                              {subcatScore && (
                                <Badge variant={
                                  subcatScore.currentScore >= 80 ? "default" :
                                  subcatScore.currentScore >= 60 ? "secondary" :
                                  "destructive"
                                }>
                                  {subcatScore.currentScore}
                                </Badge>
                              )}
                            </div>
                            {subcat.description && (
                              <p className="text-xs text-gray-500 mb-3">{subcat.description}</p>
                            )}
                            {subcatScore ? (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Actual: {subcatScore.currentScore}/100</span>
                                  <span className="text-gray-600">Deseado: {subcatScore.desiredScore}/100</span>
                                </div>
                                <Progress value={subcatScore.currentScore} className="h-2 mb-1" />
                                {subcatGap > 0 && (
                                  <p className="text-xs text-blue-600">
                                    Gap: {subcatGap} puntos
                                  </p>
                                )}
                                {subcatGap <= 0 && subcatScore.currentScore >= subcatScore.desiredScore && (
                                  <p className="text-xs text-green-600">
                                    ✓ Objetivo alcanzado
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Sin evaluar</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              {actions && actions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Acciones Recomendadas</h2>
                    <Badge variant="secondary">
                      {actions.filter((a: any) => a.userProgress?.status === 'completed').length} completadas
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {actions.map((action: any) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onStart={(id) => startActionMutation.mutate(id)}
                        onComplete={(id) => completeActionMutation.mutate(id)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500">No hay acciones disponibles para esta área aún.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Progreso</CardTitle>
                  <CardDescription>
                    Acciones que has iniciado o completado en esta área
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {progress?.actionsProgress && progress.actionsProgress.length > 0 ? (
                    <div className="space-y-4">
                      {progress.actionsProgress
                        .sort((a: any, b: any) => {
                          // Ordenar: completadas primero, luego en progreso, luego no iniciadas
                          const statusOrder = { completed: 0, in_progress: 1, not_started: 2, abandoned: 3 };
                          const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
                          const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
                          if (aOrder !== bOrder) return aOrder - bOrder;
                          // Si mismo estado, ordenar por fecha de actualización
                          const aDate = a.completedAt || a.startedAt || a.createdAt || '';
                          const bDate = b.completedAt || b.startedAt || b.createdAt || '';
                          return new Date(bDate).getTime() - new Date(aDate).getTime();
                        })
                        .map((ap: any) => (
                        <div key={ap.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{ap.action.title}</h4>
                              {ap.status === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{ap.action.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              {ap.startedAt && (
                                <span>
                                  Iniciado: {new Date(ap.startedAt).toLocaleDateString('es-AR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                              {ap.completedAt && (
                                <span className="text-green-600">
                                  Completado: {new Date(ap.completedAt).toLocaleDateString('es-AR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={
                            ap.status === 'completed' ? 'default' :
                            ap.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {ap.status === 'completed' ? 'Completada' :
                             ap.status === 'in_progress' ? 'En progreso' :
                             'No iniciada'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">
                        Aún no has iniciado ninguna acción en esta área.
                      </p>
                      {actions && actions.length > 0 && (
                        <Button 
                          onClick={() => setActiveTab('actions')} 
                          variant="outline"
                        >
                          Ver Acciones Disponibles
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LifeAreaDetail;

