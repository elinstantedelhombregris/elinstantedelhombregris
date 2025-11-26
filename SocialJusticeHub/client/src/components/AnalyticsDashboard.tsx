import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Calendar,
  MapPin,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type AnalyticsDashboardProps = {
  postId: number;
  onClose: () => void;
};

type PostAnalytics = {
  post: {
    id: number;
    title: string;
    type: string;
    location: string;
    createdAt: string;
    status: string;
  };
  totalViews: number;
  totalInteractions: number;
  interactionBreakdown: {
    apply: number;
    interest: number;
    volunteer: number;
    save: number;
  };
  activities: Array<{
    id: number;
    activityType: string;
    createdAt: string;
    userId?: number;
  }>;
  interactions: Array<{
    id: number;
    type: string;
    status: string;
    createdAt: string;
    userId: number;
  }>;
};

const AnalyticsDashboard = ({ postId, onClose }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/community/${postId}/analytics`],
    enabled: !!postId,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron datos</h3>
            <p className="text-gray-600 mb-4">No hay analytics disponibles para esta publicación.</p>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </div>
    );
  }

  const data = analytics as PostAnalytics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInteractionTypeLabel = (type: string) => {
    switch (type) {
      case 'apply':
        return 'Postulaciones';
      case 'interest':
        return 'Interés';
      case 'volunteer':
        return 'Voluntarios';
      case 'save':
        return 'Guardados';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Analytics de Publicación</h2>
              <p className="text-sm text-gray-600">{data.post.title}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Post Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Resumen de la Publicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.totalViews}</div>
                  <div className="text-sm text-gray-600">Vistas Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.totalInteractions}</div>
                  <div className="text-sm text-gray-600">Interacciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((data.totalInteractions / data.totalViews) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa de Conversión</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Desglose de Interacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(data.interactionBreakdown).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600">{getInteractionTypeLabel(type)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de la Publicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <Badge className="bg-blue-100 text-blue-800">
                    {data.post.type}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <Badge className={getStatusColor(data.post.status)}>
                    {data.post.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{data.post.location}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                  <span>{new Date(data.post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Actividades Recientes
              </CardTitle>
              <CardDescription>Últimas 10 actividades registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {data.activities.length > 0 ? (
                <div className="space-y-3">
                  {data.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {activity.activityType === 'view' ? 'Vista' : activity.activityType}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay actividades recientes</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Interacciones Recientes
              </CardTitle>
              <CardDescription>Últimas 10 interacciones</CardDescription>
            </CardHeader>
            <CardContent>
              {data.interactions.length > 0 ? (
                <div className="space-y-3">
                  {data.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {getInteractionTypeLabel(interaction.type)} por Usuario #{interaction.userId}
                        </span>
                        <Badge className={getStatusColor(interaction.status)}>
                          {interaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(interaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay interacciones recientes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
