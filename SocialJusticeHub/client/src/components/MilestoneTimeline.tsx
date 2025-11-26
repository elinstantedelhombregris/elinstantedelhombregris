import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Plus,
  Calendar,
  User
} from 'lucide-react';

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  completedAt: string;
  completedBy: number;
  orderIndex: number;
  createdAt: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onCreateMilestone?: () => void;
  onEditMilestone?: (milestone: Milestone) => void;
  onCompleteMilestone?: (milestoneId: number) => void;
  currentUserId?: number;
  canCreate?: boolean;
  className?: string;
}

export default function MilestoneTimeline({
  milestones,
  onCreateMilestone,
  onEditMilestone,
  onCompleteMilestone,
  currentUserId,
  canCreate = false,
  className = ""
}: MilestoneTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <Target className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Progreso';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  const getProgressPercentage = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return `Hace ${Math.abs(diffInDays)} días`;
    } else if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Mañana';
    } else if (diffInDays <= 7) {
      return `En ${diffInDays} días`;
    } else {
      return formatDate(dateString);
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hitos de la Iniciativa
          </CardTitle>
          {canCreate && onCreateMilestone && (
            <Button onClick={onCreateMilestone} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Hito
            </Button>
          )}
        </div>
        
        {/* Progress Bar */}
        {milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progreso general</span>
              <span className="font-medium">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {milestones.filter(m => m.status === 'completed').length} de {milestones.length} completados
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay hitos definidos</p>
            <p className="text-gray-500 text-sm mb-4">
              Los hitos ayudan a organizar y dar seguimiento al progreso de la iniciativa
            </p>
            {canCreate && onCreateMilestone && (
              <Button onClick={onCreateMilestone} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer hito
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`relative ${index !== milestones.length - 1 ? 'pb-6' : ''}`}
              >
                {/* Timeline line */}
                {index !== milestones.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                )}

                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed' ? 'bg-green-100' :
                    milestone.status === 'in_progress' ? 'bg-blue-100' :
                    milestone.status === 'cancelled' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <Badge className={`${getStatusColor(milestone.status)} border`}>
                        {getStatusLabel(milestone.status)}
                      </Badge>
                      {milestone.dueDate && isOverdue(milestone.dueDate, milestone.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Vencido
                        </Badge>
                      )}
                    </div>

                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {milestone.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Vence: {formatRelativeDate(milestone.dueDate)}
                          </span>
                        </div>
                      )}
                      {milestone.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Completado: {formatDate(milestone.completedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {milestone.status !== 'completed' && 
                       milestone.status !== 'cancelled' && 
                       onCompleteMilestone && 
                       currentUserId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCompleteMilestone(milestone.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completar
                        </Button>
                      )}
                      
                      {onEditMilestone && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditMilestone(milestone)}
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
