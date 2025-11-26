import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Target, 
  CheckCircle, 
  MessageSquare, 
  Plus, 
  Sparkles,
  Calendar,
  MapPin
} from 'lucide-react';

interface ActivityFeedItemProps {
  id: number;
  type: 'new_initiative' | 'new_member' | 'milestone_completed' | 'task_completed' | 'comment' | 'update';
  title: string;
  description: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
  post?: {
    id: number;
    title: string;
  };
  timestamp: string;
  metadata?: any;
  onClick?: () => void;
}

export default function ActivityFeedItem({
  type,
  title,
  description,
  user,
  post,
  timestamp,
  onClick
}: ActivityFeedItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'new_initiative':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'new_member':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'milestone_completed':
        return <Target className="w-5 h-5 text-purple-600" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'update':
        return <Plus className="w-5 h-5 text-indigo-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'new_initiative':
        return 'bg-blue-100 text-blue-800';
      case 'new_member':
        return 'bg-green-100 text-green-800';
      case 'milestone_completed':
        return 'bg-purple-100 text-purple-800';
      case 'task_completed':
        return 'bg-green-100 text-green-800';
      case 'comment':
        return 'bg-orange-100 text-orange-800';
      case 'update':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = () => {
    switch (type) {
      case 'new_initiative':
        return 'Borró la iniciativa';
      case 'new_member':
        return 'se unió a';
      case 'milestone_completed':
        return 'completó el hito';
      case 'task_completed':
        return 'completó la tarea';
      case 'comment':
        return 'comentó en';
      case 'update':
        return 'actualizó';
      default:
        return 'realizó una acción en';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getTypeColor()} text-xs`}>
                {type.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatTimestamp(timestamp)}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium text-gray-900">{user.name}</span>{' '}
                <span className="text-gray-600">{getActionText()}</span>{' '}
                {post && (
                  <span className="font-medium text-gray-900">"{post.title}"</span>
                )}
              </p>

              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>

            {/* Footer with additional info */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(timestamp).toLocaleDateString()}</span>
              </div>
              {post && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Iniciativa</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
