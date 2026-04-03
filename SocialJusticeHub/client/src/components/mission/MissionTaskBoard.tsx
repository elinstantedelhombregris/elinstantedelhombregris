import { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, UserCheck, Loader2 } from 'lucide-react';

interface MissionTaskBoardProps {
  tasks: any[];
  postId: number;
  userMembership: any | null;
}

const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  high:   { label: 'Alta',   className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  medium: { label: 'Media',  className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  low:    { label: 'Baja',   className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const STATUS_DOT: Record<string, string> = {
  pending:     'bg-slate-400',
  in_progress: 'bg-amber-400',
  completed:   'bg-emerald-400',
};

const STATUS_LABEL: Record<string, string> = {
  pending:     'Disponible',
  in_progress: 'En progreso',
  completed:   'Completada',
};

export default function MissionTaskBoard({ tasks, postId, userMembership }: MissionTaskBoardProps) {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const qc = useQueryClient();
  const { toast } = useToast();

  const claimMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest('PATCH', `/api/community/${postId}/tasks/${taskId}`, {
        assignedTo: user?.id,
        status: 'in_progress',
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-tasks', postId] });
      toast({ title: 'Tarea tomada', description: 'La tarea está asignada a vos.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo tomar la tarea.', variant: 'destructive' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest('POST', `/api/community/${postId}/tasks/${taskId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-tasks', postId] });
      toast({ title: 'Tarea completada', description: '¡Buen trabajo!' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo completar la tarea.', variant: 'destructive' });
    },
  });

  if (tasks.length === 0) {
    return (
      <GlassCard className="p-6 bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
        <p className="text-slate-400 text-sm text-center py-4">No hay tareas disponibles aún.</p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task: any, idx: number) => {
        const priorityMeta = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
        const isAssignedToMe = user && task.assignedTo === user.id;
        const isAssignedToOther = task.assignedTo && !isAssignedToMe;
        const isUnassigned = !task.assignedTo && task.status !== 'completed';
        const canClaim = isUnassigned && !!userMembership && !!user;

        return (
          <SmoothReveal key={task.id ?? idx} delay={idx * 0.06}>
            <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-slate-100 text-sm font-semibold leading-snug flex-1">
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status] ?? 'bg-slate-400'}`} />
                  <span className="text-xs text-slate-500">{STATUS_LABEL[task.status] ?? task.status}</span>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Priority badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs border ${priorityMeta.className} bg-transparent`}>
                  {priorityMeta.label}
                </Badge>
                {task.category && (
                  <Badge className="text-xs border border-white/10 bg-white/5 text-slate-400">
                    {task.category}
                  </Badge>
                )}
              </div>

              {/* Action area */}
              <div className="mt-auto pt-2">
                {task.status === 'completed' ? (
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completada</span>
                  </div>
                ) : isAssignedToMe ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => completeMutation.mutate(task.id)}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Completar
                  </Button>
                ) : isAssignedToOther ? (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Asignada a {task.assigneeName ?? `usuario #${task.assignedTo}`}</span>
                  </div>
                ) : canClaim ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
                    onClick={() => claimMutation.mutate(task.id)}
                    disabled={claimMutation.isPending}
                  >
                    {claimMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    )}
                    Tomar tarea
                  </Button>
                ) : (
                  <p className="text-slate-600 text-xs">
                    {user ? 'Unite a la misión para tomar tareas' : 'Iniciá sesión para participar'}
                  </p>
                )}
              </div>
            </div>
          </SmoothReveal>
        );
      })}
    </div>
  );
}
