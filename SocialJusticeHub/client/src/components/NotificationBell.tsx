import React, { useContext } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export function NotificationBell() {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userContext?.user?.id],
    queryFn: async () => {
      if (!userContext?.user?.id) return [];
      const response = await apiRequest('GET', `/api/notifications`);
      if (response.ok) {
        return response.json();
      }
      return [];
    },
    enabled: !!userContext?.user?.id,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userContext?.user?.id] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userContext?.user?.id] });
    }
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'membership_request':
        return '👥';
      case 'milestone_completed':
        return '🎯';
      case 'task_assigned':
        return '📝';
      case 'task_completed':
        return '✅';
      case 'message_received':
        return '💬';
      case 'initiative_created':
        return '🚀';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  if (!userContext?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificaciones
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            No hay notificaciones
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 5).map((notification: Notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className="flex items-start space-x-2 py-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <span className="text-lg">{getTypeIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
              )}
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-blue-600 font-medium">
              Ver todas las notificaciones ({notifications.length})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}