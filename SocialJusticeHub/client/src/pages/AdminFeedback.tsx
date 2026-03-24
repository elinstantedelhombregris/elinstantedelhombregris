import { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { Link, Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Inbox, ChevronDown, ChevronUp, Mail, Clock, Filter } from 'lucide-react';

type PlatformFeedback = {
  id: number;
  type: string;
  content: string;
  email: string | null;
  userId: number | null;
  status: string;
  adminNotes: string | null;
  createdAt: string | null;
};

const typeColors: Record<string, string> = {
  critica: 'bg-red-500/20 text-red-400 border-red-500/30',
  sugerencia: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  bug: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  otro: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const typeLabels: Record<string, string> = {
  critica: 'Crítica',
  sugerencia: 'Sugerencia',
  bug: 'Bug',
  otro: 'Otro',
};

const statusColors: Record<string, string> = {
  nueva: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  revisada: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resuelta: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusLabels: Record<string, string> = {
  nueva: 'Nueva',
  revisada: 'Revisada',
  resuelta: 'Resuelta',
};

export default function AdminFeedback() {
  const userContext = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});

  // Restrict to HombreGris01 (user ID 1)
  if (!userContext?.isLoggedIn || userContext.user?.id !== 1) {
    return <Redirect to="/" />;
  }

  const { data: feedbackList = [], isLoading } = useQuery<PlatformFeedback[]>({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/feedback');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/feedback/${id}/status`, { status, adminNotes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast({ title: 'Feedback actualizado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  const filtered = feedbackList.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    total: feedbackList.length,
    nueva: feedbackList.filter((f) => f.status === 'nueva').length,
    revisada: feedbackList.filter((f) => f.status === 'revisada').length,
    resuelta: feedbackList.filter((f) => f.status === 'resuelta').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Buzón de Feedback</h1>
            <p className="text-slate-400 text-sm">{counts.total} mensajes — {counts.nueva} nuevos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="sugerencia">Sugerencia</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="nueva">Nueva</SelectItem>
              <SelectItem value="revisada">Revisada</SelectItem>
              <SelectItem value="resuelta">Resuelta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay feedback{filterType !== 'all' || filterStatus !== 'all' ? ' con estos filtros' : ' todavía'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Header row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="outline" className={typeColors[item.type] || typeColors.otro}>
                            {typeLabels[item.type] || item.type}
                          </Badge>
                          <Badge variant="outline" className={statusColors[item.status] || statusColors.nueva}>
                            {statusLabels[item.status] || item.status}
                          </Badge>
                          {item.email && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="w-3 h-3" />
                              {item.email}
                            </span>
                          )}
                          {item.userId && (
                            <span className="text-xs text-slate-600">usuario #{item.userId}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-AR', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'Sin fecha'}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                      )}
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-white/10 p-4 space-y-4"
                      >
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mensaje completo</p>
                          <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.content}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notas del admin</p>
                          <Textarea
                            value={editingNotes[item.id] ?? item.adminNotes ?? ''}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [item.id]: e.target.value })}
                            placeholder="Agregar notas internas..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-sm min-h-[80px] resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {(['nueva', 'revisada', 'resuelta'] as const).map((status) => (
                            <Button
                              key={status}
                              variant={item.status === status ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                updateMutation.mutate({
                                  id: item.id,
                                  status,
                                  adminNotes: editingNotes[item.id] ?? item.adminNotes ?? undefined,
                                })
                              }
                              disabled={updateMutation.isPending}
                              className={
                                item.status === status
                                  ? 'bg-blue-600 text-white'
                                  : 'border-white/10 text-slate-300 hover:bg-white/10'
                              }
                            >
                              {statusLabels[status]}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
