import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  MessageSquare, 
  UserPlus, 
  Heart, 
  Eye, 
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

type NotificationCenterProps = {
  onClose: () => void;
};

type Notification = {
  id: string;
  type: 'message' | 'interaction' | 'view' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
};

const NotificationCenter = ({ onClose }: NotificationCenterProps) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Mock notifications - in a real app, these would come from the API
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'message',
      title: 'Nuevo mensaje',
      message: 'Usuario #123 te envió un mensaje sobre tu publicación "Desarrollador Frontend"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      read: false,
      actionUrl: '/community/messages'
    },
    {
      id: '2',
      type: 'interaction',
      title: 'Nueva postulación',
      message: 'Usuario #456 se postuló para tu empleo "Desarrollador Frontend"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      actionUrl: '/community/my-posts'
    },
    {
      id: '3',
      type: 'view',
      title: 'Publicación vista',
      message: 'Tu publicación "Proyecto de Huerta Comunitaria" fue vista 5 veces hoy',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
      actionUrl: '/community/my-posts'
    },
    {
      id: '4',
      type: 'system',
      title: 'Bienvenido a la comunidad',
      message: '¡Gracias por unirte a ¡BASTA! Tu perfil ha sido creado exitosamente.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true
    }
  ];

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'interaction':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case 'view':
        return <Eye className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <CheckCircle2 className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-blue-200 bg-blue-50';
      case 'interaction':
        return 'border-green-200 bg-green-50';
      case 'view':
        return 'border-purple-200 bg-purple-50';
      case 'system':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">Notificaciones</h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Sin leer ({unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border rounded-lg transition-colors hover:shadow-md cursor-pointer",
                    getNotificationColor(notification.type),
                    !notification.read && "ring-2 ring-blue-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-semibold text-sm mb-1",
                            !notification.read && "text-gray-900"
                          )}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        {notification.actionUrl && (
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'Todas tus notificaciones han sido leídas.' 
                  : 'Aquí aparecerán tus notificaciones cuando recibas interacciones o mensajes.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''}
            </p>
            <Button variant="outline" size="sm">
              Marcar todas como leídas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
