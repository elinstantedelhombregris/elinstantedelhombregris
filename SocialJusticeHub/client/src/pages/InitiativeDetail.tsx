import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { MISSION_META, STATE_META, TEMPORAL_META } from '@/lib/initiative-utils';
import { MISSIONS } from '../../../shared/mission-registry';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import { CitizenRoleList } from '@/components/CitizenRoleBadge';
import type { MissionSlug } from '../../../shared/strategic-initiatives';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  MapPin,
  Users,
  Calendar,
  Target,
  MessageSquare,
  CheckCircle,
  Clock,
  Plus,
  Send,
  UserPlus,
  Settings,
  Crown,
  ExternalLink,
  Trash2,
  Play,
  Check,
  Edit,
  X,
  User,
  Heart,
  BarChart3
} from 'lucide-react';

interface InitiativeDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  memberCount: number;
  requiresApproval: boolean;
  status?: string;
  user: {
    id: number;
    name: string;
    username: string;
    location?: string;
  };
  impulsor?: {
    id: number;
    name: string;
    username: string;
    location?: string;
    stats?: {
      initiativesCreated: number;
      totalMembers: number;
    };
  };
  missionSlug?: string;
  createdAt: string;
}

interface Member {
  id: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
  } | null;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completedAt: string;
  completedBy: number;
  completedByUser?: { id: number; name: string; username: string } | null;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: number;
  dueDate: string;
  createdBy: number;
  assignedToUser?: { id: number; name: string; username: string } | null;
  createdByUser?: { id: number; name: string; username: string } | null;
}

interface Message {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
  } | null;
}

interface MembershipRequest {
  id: number;
  postId: number;
  userId: number;
  message: string;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
  } | null;
}

function MissionBanner({ missionSlug }: { missionSlug: string }) {
  const mission = MISSIONS.find(m => m.slug === missionSlug);
  const meta = MISSION_META[missionSlug as MissionSlug];
  if (!mission || !meta) return null;

  const missionInitiatives = STRATEGIC_INITIATIVES.filter(
    i => i.missionSlug === missionSlug || i.secondaryMissionSlug === missionSlug
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Mission context banner */}
      <div className={`rounded-2xl border border-slate-200 bg-gradient-to-r ${meta.gradient} p-6`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.accent}15` }}>
            <meta.icon className="w-6 h-6" style={{ color: meta.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: meta.accent }}>
                Misión {meta.number}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{meta.label}</h2>
            <p className="text-sm text-slate-600 italic mb-3">"{mission.whatHurts}"</p>
            <p className="text-sm text-slate-700 font-medium">{mission.whatWeGuarantee}</p>
          </div>
        </div>
      </div>

      {/* Linked plans strip */}
      {missionInitiatives.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Planes vinculados</h3>
          <div className="flex flex-wrap gap-2">
            {missionInitiatives.map(initiative => (
              <a
                key={initiative.slug}
                href={`/recursos/iniciativas/${initiative.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {initiative.state && (
                  <span className={`w-2 h-2 rounded-full ${
                    initiative.state === 'verde' ? 'bg-emerald-500' :
                    initiative.state === 'ambar' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                )}
                {initiative.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Citizen roles */}
      {mission.citizenRoles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Roles ciudadanos que necesitamos</h3>
          <CitizenRoleList roles={mission.citizenRoles} />
        </div>
      )}
    </div>
  );
}

export default function InitiativeDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('resumen');
  const [newMessage, setNewMessage] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showNewMilestone, setShowNewMilestone] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', dueDate: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ title: '', description: '', type: '', location: '', requiresApproval: false, status: 'active' });
  const [confirmAction, setConfirmAction] = useState<{ message: string; action: () => void } | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initiative details
  const { data: initiative, isLoading: initiativeLoading } = useQuery({
    queryKey: ['initiative', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}`); if (!res.ok) throw new Error('Error al cargar iniciativa'); return res.json(); },
    enabled: !!id
  });

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['initiative-members', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/members`); if (!res.ok) throw new Error('Error al cargar miembros'); return res.json(); },
    enabled: !!id
  });

  // Fetch milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['initiative-milestones', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/milestones`); if (!res.ok) throw new Error('Error al cargar hitos'); return res.json(); },
    enabled: !!id
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['initiative-tasks', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/tasks`); if (!res.ok) throw new Error('Error al cargar tareas'); return res.json(); },
    enabled: !!id
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['initiative-messages', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/messages`); if (!res.ok) throw new Error('Error al cargar mensajes'); return res.json(); },
    enabled: !!id
  });

  // Like status query
  const { data: likeStatus } = useQuery({
    queryKey: ['initiative-like-status', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/like-status`); if (!res.ok) return { isLiked: false }; return res.json(); },
    enabled: !!id && !!userContext?.user,
  });

  // Like count query
  const { data: likeCount } = useQuery({
    queryKey: ['initiative-likes', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/likes`); if (!res.ok) return { count: 0 }; return res.json(); },
    enabled: !!id,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.isLiked) {
        return apiRequest('DELETE', `/api/community/${id}/like`);
      } else {
        return apiRequest('POST', `/api/community/${id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-like-status', id] });
      queryClient.invalidateQueries({ queryKey: ['initiative-likes', id] });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo procesar tu me gusta.', variant: 'destructive' }); },
  });

  // Join initiative mutation
  const joinMutation = useMutation({
    mutationFn: (data: { message?: string }) =>
      apiRequest('POST', `/api/community/${id}/join`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-members', id] });
      setShowJoinModal(false);
      setJoinMessage('');
      toast({ title: initiative?.requiresApproval ? 'Solicitud enviada' : 'Te uniste a la iniciativa' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo unir a la iniciativa.', variant: 'destructive' }); }
  });

  // Leave initiative mutation
  const leaveMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', `/api/community/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-members', id] });
      toast({ title: 'Abandonaste la iniciativa' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo abandonar la iniciativa.', variant: 'destructive' }); }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest('POST', `/api/community/${id}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-messages', id] });
      setNewMessage('');
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo enviar el mensaje.', variant: 'destructive' }); }
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', `/api/community/${id}/milestones`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-milestones', id] });
      setShowNewMilestone(false);
      setNewMilestone({ title: '', description: '', dueDate: '' });
      toast({ title: 'Hito creado' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo crear el hito.', variant: 'destructive' }); }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', `/api/community/${id}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks', id] });
      setShowNewTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
      toast({ title: 'Tarea creada' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo crear la tarea.', variant: 'destructive' }); }
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: number; updates: any }) =>
      apiRequest('PATCH', `/api/community/${id}/tasks/${taskId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks', id] });
      setEditingTask(null);
      toast({ title: 'Tarea actualizada' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo actualizar la tarea.', variant: 'destructive' }); }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) =>
      apiRequest('DELETE', `/api/community/${id}/tasks/${taskId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-tasks', id] }); toast({ title: 'Tarea eliminada' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo eliminar la tarea.', variant: 'destructive' }); }
  });

  // Complete milestone mutation
  const completeMilestoneMutation = useMutation({
    mutationFn: (milestoneId: number) =>
      apiRequest('POST', `/api/community/${id}/milestones/${milestoneId}/complete`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-milestones', id] }); toast({ title: 'Hito completado' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo completar el hito.', variant: 'destructive' }); }
  });

  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, updates }: { milestoneId: number; updates: any }) =>
      apiRequest('PATCH', `/api/community/${id}/milestones/${milestoneId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-milestones', id] });
      setEditingMilestone(null);
      toast({ title: 'Hito actualizado' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo actualizar el hito.', variant: 'destructive' }); }
  });

  // Delete milestone mutation
  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: number) =>
      apiRequest('DELETE', `/api/community/${id}/milestones/${milestoneId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-milestones', id] }); toast({ title: 'Hito eliminado' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo eliminar el hito.', variant: 'destructive' }); }
  });

  // Update initiative mutation
  const updateInitiativeMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('PUT', `/api/community/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative', id] });
      setShowSettings(false);
      toast({ title: 'Iniciativa actualizada' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo actualizar la iniciativa.', variant: 'destructive' }); }
  });

  // Membership request mutations
  const approveRequestMutation = useMutation({
    mutationFn: (requestId: number) =>
      apiRequest('POST', `/api/community/${id}/requests/${requestId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-requests', id] });
      queryClient.invalidateQueries({ queryKey: ['initiative-members', id] });
      toast({ title: 'Solicitud aprobada' });
    },
    onError: () => { toast({ title: 'Error', description: 'No se pudo aprobar la solicitud.', variant: 'destructive' }); }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: number) =>
      apiRequest('POST', `/api/community/${id}/requests/${requestId}/reject`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-requests', id] }); toast({ title: 'Solicitud rechazada' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo rechazar la solicitud.', variant: 'destructive' }); }
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: string }) =>
      apiRequest('PATCH', `/api/community/${id}/members/${memberId}/role`, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-members', id] }); toast({ title: 'Rol actualizado' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo actualizar el rol.', variant: 'destructive' }); }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) =>
      apiRequest('DELETE', `/api/community/${id}/members/${memberId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['initiative-members', id] }); toast({ title: 'Miembro removido' }); },
    onError: () => { toast({ title: 'Error', description: 'No se pudo remover al miembro.', variant: 'destructive' }); }
  });

  // Check if user is member
  const isMember = userContext?.user && members.some((member: Member) => member.userId === userContext.user?.id);
  const isCreator = userContext?.user && initiative?.user?.id === userContext.user?.id;

  // Fetch pending membership requests (creator only)
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['initiative-requests', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/requests?status=pending`); if (!res.ok) throw new Error('Error al cargar solicitudes'); return res.json(); },
    enabled: !!id && !!isCreator
  });

  // Analytics query (creator only)
  const { data: analytics } = useQuery({
    queryKey: ['initiative-analytics', id],
    queryFn: async () => { const res = await apiRequest('GET', `/api/community/${id}/analytics`); if (!res.ok) return null; return res.json(); },
    enabled: !!id && !!isCreator,
  });

  // Progress stats
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t: Task) => t.status === 'done').length;
    const inProgress = tasks.filter((t: Task) => t.status === 'in_progress').length;
    return { total, done, inProgress, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const milestoneStats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m: Milestone) => m.status === 'completed').length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [milestones]);

  // Helper to get member name from userId
  const getMemberName = (userId: number | null): string => {
    if (!userId) return 'Sin asignar';
    const member = members.find((m: Member) => m.userId === userId);
    return member?.user?.name || 'Usuario';
  };

  // Priority color helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'medium': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'low': return 'border-green-500/30 text-green-400 bg-green-500/10';
      default: return 'border-white/20 text-slate-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Record view on mount (fire-and-forget)
  useEffect(() => {
    if (id) { apiRequest('POST', `/api/community/${id}/view`).catch(() => {}); }
  }, [id]);

  if (initiativeLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando iniciativa...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Iniciativa no encontrada</h1>
            <Button onClick={() => setLocation('/community')} className="bg-blue-600 hover:bg-blue-700">
              Volver a la comunidad
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleJoin = () => {
    if (initiative.requiresApproval) {
      setShowJoinModal(true);
    } else {
      joinMutation.mutate({});
    }
  };

  const handleLeave = () => {
    setConfirmAction({ message: '¿Estás seguro de que quieres abandonar esta iniciativa?', action: () => leaveMutation.mutate() });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleCreateMilestone = () => {
    if (newMilestone.title.trim()) {
      createMilestoneMutation.mutate(newMilestone);
    }
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTaskMutation.mutate({
        ...newTask,
        assignedTo: newTask.assignedTo ? parseInt(newTask.assignedTo) : null,
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      project: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      volunteer: 'bg-green-500/20 text-green-400 border-green-500/30',
      employment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      exchange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      donation: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[type] || 'bg-white/10 text-slate-300 border-white/10';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      todo: 'bg-white/10 text-slate-300 border-white/10',
      done: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || 'bg-white/10 text-slate-300 border-white/10';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/5 border border-white/10 rounded-lg shadow-lg p-6 mb-6 backdrop-blur-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{initiative.title}</h1>
                  <Badge className={getTypeColor(initiative.type)}>
                    {initiative.type}
                  </Badge>
                  {initiative.status && initiative.status !== 'active' && (
                    <Badge className={initiative.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {initiative.status === 'paused' ? 'Pausada' : 'Cerrada'}
                    </Badge>
                  )}
                </div>
                <div className="text-slate-300 mb-4 space-y-3">
                  {(initiative.description ?? '').split('\n\n').map((para: string, i: number) => {
                    const trimmed = para.trim();
                    if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
                      const heading = trimmed.replace(/^-+\s*/, '').replace(/\s*-+$/, '');
                      return <h3 key={i} className="text-white font-semibold text-lg mt-6 mb-1">{heading}</h3>;
                    }
                    return <p key={i}>{trimmed}</p>;
                  })}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{initiative.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{initiative.memberCount} miembros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Creado {new Date(initiative.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Impulsor Section */}
                {(initiative.impulsor || initiative.user) && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <span className="text-blue-400 font-bold text-lg">
                        {(initiative.impulsor || initiative.user).name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{(initiative.impulsor || initiative.user).name}</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-2 py-0">
                          <Crown className="w-3 h-3 mr-1" />
                          Impulsor
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>@{((initiative.impulsor || initiative.user).username)}</span>
                        {(initiative.impulsor || initiative.user).location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {(initiative.impulsor || initiative.user).location}
                          </span>
                        )}
                        {initiative.impulsor?.stats && (
                          <>
                            <span>• {initiative.impulsor.stats.initiativesCreated} iniciativas</span>
                            <span>• {initiative.impulsor.stats.totalMembers} miembros totales</span>
                          </>
                        )}
                      </div>
                    </div>
                    {userContext?.user?.id === (initiative.impulsor || initiative.user).id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => setLocation('/profile')}
                      >
                        Ver perfil
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${likeStatus?.isLiked ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-red-400'} hover:bg-white/5`}
                  onClick={() => {
                    if (!userContext?.user) { setLocation('/login'); return; }
                    toggleLikeMutation.mutate();
                  }}
                  disabled={toggleLikeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${likeStatus?.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likeCount?.count || 0}</span>
                </Button>

                {!userContext?.user && (
                  <Button onClick={() => setLocation('/login')} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inicia sesion para unirte
                  </Button>
                )}
                {!isMember && userContext?.user && (
                  <Button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {initiative.requiresApproval ? 'Solicitar unirse' : 'Unirse'}
                  </Button>
                )}
                
                {isMember && !isCreator && (
                  <Button onClick={handleLeave} variant="outline" className="text-red-400 border-red-500/50 hover:bg-red-500/10" disabled={leaveMutation.isPending}>
                    {leaveMutation.isPending ? 'Saliendo...' : 'Abandonar'}
                  </Button>
                )}
                
                {isCreator && (
                  <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-slate-200"
                    onClick={() => {
                      setSettingsForm({
                        title: initiative.title || '',
                        description: initiative.description || '',
                        type: initiative.type || '',
                        location: initiative.location || '',
                        requiresApproval: initiative.requiresApproval || false,
                        status: initiative.status || 'active',
                      });
                      setShowSettings(true);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mission Banner (for mission-type posts) */}
          {initiative?.type === 'mission' && initiative.missionSlug && (
            <MissionBanner missionSlug={initiative.missionSlug} />
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-6 overflow-x-auto gap-1">
              <TabsTrigger value="resumen" className="whitespace-nowrap flex-shrink-0">Resumen</TabsTrigger>
              <TabsTrigger value="chat" className="whitespace-nowrap flex-shrink-0">Mensajes</TabsTrigger>
              <TabsTrigger value="tasks" className="whitespace-nowrap flex-shrink-0">Tareas {taskStats.total > 0 && `(${taskStats.done}/${taskStats.total})`}</TabsTrigger>
              <TabsTrigger value="milestones" className="whitespace-nowrap flex-shrink-0">Hitos</TabsTrigger>
              <TabsTrigger value="members" className="relative whitespace-nowrap flex-shrink-0">
                Miembros
                {pendingRequests.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-500 rounded-full">{pendingRequests.length}</span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab de resumen */}
            <TabsContent value="resumen" className="space-y-6">
              {/* Progress Overview */}
              {(taskStats.total > 0 || milestoneStats.total > 0) && (
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Progreso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {taskStats.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">Tareas: {taskStats.done}/{taskStats.total} completadas</span>
                            <span className="text-sm font-bold text-white">{taskStats.percent}%</span>
                          </div>
                          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${taskStats.percent}%` }} />
                          </div>
                          {taskStats.inProgress > 0 && (
                            <p className="text-xs text-blue-400 mt-1">{taskStats.inProgress} en progreso</p>
                          )}
                        </div>
                      )}
                      {milestoneStats.total > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">Hitos: {milestoneStats.completed}/{milestoneStats.total} completados</span>
                            <span className="text-sm font-bold text-white">{milestoneStats.percent}%</span>
                          </div>
                          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${milestoneStats.percent}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analytics Card (creator only) */}
              {isCreator && analytics && (
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Estadisticas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-2xl font-bold text-white">{analytics.totalViews || 0}</p>
                        <p className="text-xs text-slate-400">Vistas totales</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-2xl font-bold text-white">{analytics.totalInteractions || 0}</p>
                        <p className="text-xs text-slate-400">Interacciones</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-2xl font-bold text-blue-400">{analytics.interactionBreakdown?.apply || 0}</p>
                        <p className="text-xs text-slate-400">Postulaciones</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-2xl font-bold text-green-400">{analytics.interactionBreakdown?.volunteer || 0}</p>
                        <p className="text-xs text-slate-400">Voluntarios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="h-5 w-5" />
                      Próximos Hitos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {milestones.slice(0, 3).map((milestone: Milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                        <div>
                          <p className="font-medium text-white">{milestone.title}</p>
                          <p className="text-sm text-slate-400">{milestone.description}</p>
                        </div>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                    ))}
                    {milestones.length === 0 && (
                      <p className="text-slate-400 text-center py-4">No hay hitos aún</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MessageSquare className="h-5 w-5" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.slice(0, 3).map((message: Message) => (
                      <div key={message.id} className="py-2 border-b border-white/10 last:border-b-0">
                        <p className="text-sm text-slate-300">
                          <span className="font-medium">{message.user?.name || 'Usuario'}</span>: {message.content}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-slate-400 text-center py-4">No hay mensajes aún</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Miembros Destacados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {members.slice(0, 6).map((member: Member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 font-medium">
                            {member.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.user?.name || 'Usuario'}</p>
                          <p className="text-sm text-slate-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Chat de la Iniciativa</CardTitle>
                  <CardDescription className="text-slate-400">
                    Comunícate con otros miembros de la iniciativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
                      {messagesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-slate-400">Cargando mensajes...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No hay mensajes aún</p>
                      ) : (
                        <>
                          {messages.map((message: Message) => (
                            <div key={message.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                                <span className="text-blue-400 font-medium text-sm">
                                  {message.user?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-white">{message.user?.name || 'Usuario'}</span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(message.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-300">{message.content}</p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    {isMember && (
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe tu mensaje..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              {tasksLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                  <p className="text-slate-400">Cargando tareas...</p>
                </div>
              )}
              {!tasksLoading && <><div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Tareas</h3>
                {isMember && (
                  <Button onClick={() => setShowNewTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kanban Columns */}
                {[
                  { status: 'todo', label: 'TODO', color: 'yellow', bgCard: 'bg-white/5 border-white/10' },
                  { status: 'in_progress', label: 'EN PROGRESO', color: 'blue', bgCard: 'bg-blue-500/10 border-blue-500/20' },
                  { status: 'done', label: 'COMPLETADO', color: 'green', bgCard: 'bg-green-500/10 border-green-500/20' },
                ].map(col => {
                  const colTasks = tasks.filter((t: Task) => t.status === col.status);
                  return (
                    <Card key={col.status} className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className={`text-${col.color}-400`}>
                          {col.label} ({colTasks.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {colTasks.map((task: Task) => (
                          <div key={task.id} className={`p-3 ${col.bgCard} rounded-lg mb-3 border`}>
                            <div className="flex items-start justify-between mb-1">
                              <h4
                                className="font-medium text-white cursor-pointer hover:text-blue-400 flex-1"
                                onClick={() => isMember ? setEditingTask(task) : null}
                              >
                                {task.title}
                              </h4>
                              {isMember && (
                                <button
                                  className="text-slate-500 hover:text-red-400 ml-2 flex-shrink-0"
                                  onClick={() => setConfirmAction({ message: '¿Eliminar esta tarea?', action: () => deleteTaskMutation.mutate(task.id) })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            {task.description && <p className="text-sm text-slate-400 mb-2">{task.description}</p>}
                            {/* Assignee */}
                            <div className="flex items-center gap-1 mb-2">
                              <User className="h-3 w-3 text-slate-500" />
                              <span className="text-xs text-slate-500">{task.assignedToUser?.name || getMemberName(task.assignedTo)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>{getPriorityLabel(task.priority)}</Badge>
                              <div className="flex items-center gap-1">
                                {task.dueDate && (
                                  <span className="text-xs text-slate-500 mr-2">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {isMember && col.status === 'todo' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => updateTaskMutation.mutate({ taskId: task.id, updates: { status: 'in_progress' } })}
                                  >
                                    <Play className="h-3 w-3 mr-1" /> Empezar
                                  </Button>
                                )}
                                {isMember && col.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-green-400 hover:bg-green-500/10"
                                    onClick={() => updateTaskMutation.mutate({ taskId: task.id, updates: { status: 'done' } })}
                                  >
                                    <Check className="h-3 w-3 mr-1" /> Completar
                                  </Button>
                                )}
                                {col.status === 'done' && (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <p className="text-slate-500 text-center text-sm py-4">Sin tareas</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div></>}
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4">
              {milestonesLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                  <p className="text-slate-400">Cargando hitos...</p>
                </div>
              )}
              {!milestonesLoading && <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Hitos</h3>
                {isMember && (
                  <Button onClick={() => setShowNewMilestone(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Hito
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {milestones.map((milestone: Milestone) => (
                  <Card key={milestone.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-white">{milestone.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                          {isMember && milestone.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-green-400 hover:bg-green-500/10"
                              onClick={() => completeMilestoneMutation.mutate(milestone.id)}
                            >
                              <Check className="h-3 w-3 mr-1" /> Completar
                            </Button>
                          )}
                          {isMember && (
                            <>
                              <button
                                className="text-slate-500 hover:text-blue-400"
                                onClick={() => setEditingMilestone(milestone)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="text-slate-500 hover:text-red-400"
                                onClick={() => setConfirmAction({ message: '¿Eliminar este hito?', action: () => deleteMilestoneMutation.mutate(milestone.id) })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-300 mb-3">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Vence: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {milestone.completedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Completado: {new Date(milestone.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {milestone.completedByUser && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-green-400" />
                            <span>Por: {milestone.completedByUser.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {milestones.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No hay hitos definidos aún</p>
                )}
              </div>
              </>}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              {membersLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                  <p className="text-slate-400">Cargando miembros...</p>
                </div>
              )}
              {!membersLoading && <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Miembros ({members.length})</h3>
              </div>

              {/* Pending Membership Requests (creator only) */}
              {isCreator && pendingRequests.length > 0 && (
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-amber-400 text-base">
                      Solicitudes Pendientes ({pendingRequests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingRequests.map((req: MembershipRequest) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                            <span className="text-amber-400 font-medium text-sm">
                              {req.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{req.user?.name || 'Usuario'}</p>
                            {req.message && <p className="text-sm text-slate-400">"{req.message}"</p>}
                            <p className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8"
                            onClick={() => approveRequestMutation.mutate(req.id)}
                            disabled={approveRequestMutation.isPending}
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8"
                            onClick={() => rejectRequestMutation.mutate(req.id)}
                            disabled={rejectRequestMutation.isPending}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member: Member) => (
                  <Card key={member.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 font-medium">
                            {member.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-medium text-white">{member.user?.name || 'Usuario'}</h4>
                            {member.role === 'creator' && <Crown className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <p className="text-sm text-slate-400">@{member.user?.username || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {isCreator && member.userId !== userContext?.user?.id ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) => updateRoleMutation.mutate({ memberId: member.id, role: value })}
                          >
                            <SelectTrigger className="w-36 h-7 text-xs bg-white/5 border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Miembro</SelectItem>
                              <SelectItem value="active_member">Miembro activo</SelectItem>
                              <SelectItem value="co-organizer">Co-organizador</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="border-white/20 text-slate-300">{member.role}</Badge>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                          {isCreator && member.userId !== userContext?.user?.id && (
                            <button
                              className="text-slate-500 hover:text-red-400"
                              onClick={() => setConfirmAction({ message: '¿Remover a este miembro?', action: () => removeMemberMutation.mutate(member.id) })}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />

      {/* Join Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar unirse a la iniciativa</DialogTitle>
            <DialogDescription>
              Esta iniciativa requiere aprobación. Escribe un mensaje para presentarte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Cuéntanos sobre ti y por qué quieres unirte a esta iniciativa..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowJoinModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => joinMutation.mutate({ message: joinMessage })}
                disabled={!joinMessage.trim() || joinMutation.isPending}
              >
                Enviar solicitud
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Milestone Modal */}
      <Dialog open={showNewMilestone} onOpenChange={setShowNewMilestone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo hito</DialogTitle>
            <DialogDescription>
              Define un hito para la iniciativa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              placeholder="Título del hito"
            />
            <Textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              placeholder="Descripción del hito"
              rows={3}
            />
            <Input
              type="date"
              value={newMilestone.dueDate}
              onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewMilestone(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateMilestone}
                disabled={!newMilestone.title.trim() || createMilestoneMutation.isPending}
              >
                Crear hito
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>Modifica los detalles de la tarea</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <Input
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Título"
              />
              <Textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                placeholder="Descripción"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}>
                  <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editingTask.status} onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}>
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">TODO</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="done">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
                <Select
                  value={editingTask.assignedTo ? String(editingTask.assignedTo) : ''}
                  onValueChange={(value) => setEditingTask({ ...editingTask, assignedTo: parseInt(value) })}
                >
                  <SelectTrigger><SelectValue placeholder="Asignar a..." /></SelectTrigger>
                  <SelectContent>
                    {members.map((m: Member) => (
                      <SelectItem key={m.userId} value={String(m.userId)}>{m.user?.name || 'Usuario'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTask(null)}>Cancelar</Button>
                <Button
                  onClick={() => updateTaskMutation.mutate({
                    taskId: editingTask.id,
                    updates: {
                      title: editingTask.title,
                      description: editingTask.description,
                      priority: editingTask.priority,
                      status: editingTask.status,
                      dueDate: editingTask.dueDate || null,
                      assignedTo: editingTask.assignedTo || null,
                    }
                  })}
                  disabled={updateTaskMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Modal */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar hito</DialogTitle>
            <DialogDescription>Modifica los detalles del hito</DialogDescription>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4">
              <Input
                value={editingMilestone.title}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                placeholder="Título"
              />
              <Textarea
                value={editingMilestone.description}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                placeholder="Descripción"
                rows={3}
              />
              <Input
                type="date"
                value={editingMilestone.dueDate || ''}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, dueDate: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMilestone(null)}>Cancelar</Button>
                <Button
                  onClick={() => updateMilestoneMutation.mutate({
                    milestoneId: editingMilestone.id,
                    updates: {
                      title: editingMilestone.title,
                      description: editingMilestone.description,
                      dueDate: editingMilestone.dueDate || null,
                    }
                  })}
                  disabled={updateMilestoneMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Iniciativa</DialogTitle>
            <DialogDescription>Edita los detalles de tu iniciativa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={settingsForm.title}
              onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
              placeholder="Título"
            />
            <Textarea
              value={settingsForm.description}
              onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
              placeholder="Descripción"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={settingsForm.type} onValueChange={(value) => setSettingsForm({ ...settingsForm, type: value })}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Proyecto</SelectItem>
                  <SelectItem value="volunteer">Voluntariado</SelectItem>
                  <SelectItem value="employment">Empleo</SelectItem>
                  <SelectItem value="exchange">Intercambio</SelectItem>
                  <SelectItem value="donation">Donación</SelectItem>
                </SelectContent>
              </Select>
              <Select value={settingsForm.status} onValueChange={(value) => setSettingsForm({ ...settingsForm, status: value })}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="closed">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={settingsForm.location}
              onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
              placeholder="Ubicación"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.requiresApproval}
                onChange={(e) => setSettingsForm({ ...settingsForm, requiresApproval: e.target.checked })}
                className="rounded border-white/20"
              />
              Requiere aprobación para unirse
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>Cancelar</Button>
              <Button
                onClick={() => updateInitiativeMutation.mutate(settingsForm)}
                disabled={updateInitiativeMutation.isPending}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Task Modal */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva tarea</DialogTitle>
            <DialogDescription>
              Asigna una tarea a la iniciativa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Título de la tarea"
            />
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Descripción de la tarea"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Asignar a..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: Member) => (
                  <SelectItem key={m.userId} value={String(m.userId)}>
                    {m.user?.name || 'Usuario'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTask(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={!newTask.title.trim() || createTaskMutation.isPending}
              >
                Crear tarea
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-[#0f1116] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar accion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">{confirmAction?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmAction?.action(); setConfirmAction(null); }} className="bg-red-600 hover:bg-red-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
