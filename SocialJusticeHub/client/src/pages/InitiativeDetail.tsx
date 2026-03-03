import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
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
  Filter,
  Search,
  Crown,
  ExternalLink
} from 'lucide-react';

interface InitiativeDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  memberCount: number;
  requiresApproval: boolean;
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
  createdAt: string;
}

interface Member {
  id: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completedAt: string;
  completedBy: number;
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
}

interface Message {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
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
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  // Fetch initiative details
  const { data: initiative, isLoading: initiativeLoading } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => apiRequest('GET', `/api/community/${id}`).then(res => res.json()),
    enabled: !!id
  });

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['initiative-members', id],
    queryFn: () => apiRequest('GET', `/api/community/${id}/members`).then(res => res.json()),
    enabled: !!id
  });

  // Fetch milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['initiative-milestones', id],
    queryFn: () => apiRequest('GET', `/api/community/${id}/milestones`).then(res => res.json()),
    enabled: !!id
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['initiative-tasks', id],
    queryFn: () => apiRequest('GET', `/api/community/${id}/tasks`).then(res => res.json()),
    enabled: !!id
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['initiative-messages', id],
    queryFn: () => apiRequest('GET', `/api/community/${id}/messages`).then(res => res.json()),
    enabled: !!id
  });

  // Join initiative mutation
  const joinMutation = useMutation({
    mutationFn: (data: { message?: string }) => 
      apiRequest('POST', `/api/community/${id}/join`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-members', id] });
      setShowJoinModal(false);
      setJoinMessage('');
    }
  });

  // Leave initiative mutation
  const leaveMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/community/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-members', id] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest('POST', `/api/community/${id}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-messages', id] });
      setNewMessage('');
    }
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', `/api/community/${id}/milestones`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-milestones', id] });
      setShowNewMilestone(false);
      setNewMilestone({ title: '', description: '', dueDate: '' });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', `/api/community/${id}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks', id] });
      setShowNewTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    }
  });

  // Check if user is member
  const isMember = userContext?.user && members.some((member: Member) => member.userId === userContext.user?.id);
  const isCreator = userContext?.user && initiative?.user?.id === userContext.user?.id;

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
    if (confirm('¿Estás seguro de que quieres abandonar esta iniciativa?')) {
      leaveMutation.mutate();
    }
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
      createTaskMutation.mutate(newTask);
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
                </div>
                <p className="text-slate-300 mb-4">{initiative.description}</p>
                
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      onClick={() => setLocation(`/user/${(initiative.impulsor || initiative.user).id}`)}
                    >
                      Ver perfil
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isMember && userContext?.user && (
                  <Button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {initiative.requiresApproval ? 'Solicitar unirse' : 'Unirse'}
                  </Button>
                )}
                
                {isMember && !isCreator && (
                  <Button onClick={handleLeave} variant="outline" className="text-red-400 border-red-500/50 hover:bg-red-500/10">
                    Abandonar
                  </Button>
                )}
                
                {isCreator && (
                  <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-200">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="chat">Mensajes</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="milestones">Hitos</TabsTrigger>
              <TabsTrigger value="members">Miembros</TabsTrigger>
            </TabsList>

            {/* Tab de resumen */}
            <TabsContent value="resumen" className="space-y-6">
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
                          <span className="font-medium">{message.user.name}</span>: {message.content}
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
                            {member.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.user.name}</p>
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
                        messages.map((message: Message) => (
                          <div key={message.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                              <span className="text-blue-400 font-medium text-sm">
                                {message.user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-white">{message.user.name}</span>
                                <span className="text-xs text-slate-500">
                                  {new Date(message.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-slate-300">{message.content}</p>
                            </div>
                          </div>
                        ))
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Tareas</h3>
                {isMember && (
                  <Button onClick={() => setShowNewTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TODO Column */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">TODO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.filter((task: Task) => task.status === 'todo').map((task: Task) => (
                      <div key={task.id} className="p-3 bg-white/5 rounded-lg mb-3 border border-white/10">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <p className="text-sm text-slate-400">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="border-white/20 text-slate-300">{task.priority}</Badge>
                          {task.dueDate && (
                            <span className="text-xs text-slate-500">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* IN PROGRESS Column */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-blue-400">EN PROGRESO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.filter((task: Task) => task.status === 'in_progress').map((task: Task) => (
                      <div key={task.id} className="p-3 bg-blue-500/10 rounded-lg mb-3 border border-blue-500/20">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <p className="text-sm text-slate-400">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="border-white/20 text-slate-300">{task.priority}</Badge>
                          {task.dueDate && (
                            <span className="text-xs text-slate-500">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* DONE Column */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-green-400">COMPLETADO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.filter((task: Task) => task.status === 'done').map((task: Task) => (
                      <div key={task.id} className="p-3 bg-green-500/10 rounded-lg mb-3 border border-green-500/20">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <p className="text-sm text-slate-400">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="border-white/20 text-slate-300">{task.priority}</Badge>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4">
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
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
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
                            <CheckCircle className="h-4 w-4" />
                            <span>Completado: {new Date(milestone.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Miembros ({members.length})</h3>
                {isCreator && (
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar Miembro
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member: Member) => (
                  <Card key={member.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 font-medium">
                            {member.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{member.user.name}</h4>
                          <p className="text-sm text-slate-400">@{member.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-white/20 text-slate-300">{member.role}</Badge>
                        <span className="text-xs text-slate-500">
                          Se unió {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
    </div>
  );
}
