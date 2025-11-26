import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  Plus,
  Calendar,
  User,
  Filter,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: number;
  dueDate?: string;
  completedAt?: string;
  createdBy: number;
  milestoneId?: number;
}

interface TaskBoardProps {
  tasks: Task[];
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: number, status: string) => void;
  onAssignTask?: (taskId: number, userId: number) => void;
  currentUserId?: number;
  canCreate?: boolean;
  filterStatus?: string;
  onFilterChange?: (status: string) => void;
  className?: string;
}

export default function TaskBoard({
  tasks,
  onCreateTask,
  onEditTask,
  onUpdateTaskStatus,
  onAssignTask,
  currentUserId,
  canCreate = false,
  filterStatus = 'all',
  onFilterChange,
  className = ""
}: TaskBoardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <CheckSquare className="w-4 h-4 text-gray-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <CheckSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'TODO';
      case 'in_progress':
        return 'EN PROGRESO';
      case 'done':
        return 'COMPLETADO';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
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

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
            <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className={`${
                isOverdue(task.dueDate, task.status) 
                  ? 'text-red-600 font-medium' 
                  : 'text-gray-500'
              }`}>
                {formatRelativeDate(task.dueDate)}
                {isOverdue(task.dueDate, task.status) && (
                  <AlertCircle className="w-3 h-3 inline ml-1" />
                )}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {task.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  <span>Asignado</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {onEditTask && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditTask(task)}
                  className="text-xs"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Tareas ({tasks.length})
          </h3>
          
          {onFilterChange && (
            <Select value={filterStatus} onValueChange={onFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="todo">TODO</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="done">Completadas</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {canCreate && onCreateTask && (
          <Button onClick={onCreateTask}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        )}
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO Column */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              {getStatusIcon('todo')}
              TODO ({todoTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay tareas pendientes</p>
              </div>
            ) : (
              todoTasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </CardContent>
        </Card>

        {/* IN PROGRESS Column */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              {getStatusIcon('in_progress')}
              EN PROGRESO ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay tareas en progreso</p>
              </div>
            ) : (
              inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </CardContent>
        </Card>

        {/* DONE Column */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              {getStatusIcon('done')}
              COMPLETADO ({doneTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doneTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay tareas completadas</p>
              </div>
            ) : (
              doneTasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{todoTasks.length}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
              <p className="text-xs text-gray-500">En Progreso</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{doneTasks.length}</p>
              <p className="text-xs text-gray-500">Completadas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
