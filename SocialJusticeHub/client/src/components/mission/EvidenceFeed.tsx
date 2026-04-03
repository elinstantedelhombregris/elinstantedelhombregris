import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShieldCheck, Flag, ImageOff, Calendar, User, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EvidenceFeedProps {
  evidence: any[];
  userRole: string | null;
  postId: number;
}

// Pause conditions come from mission prop but this component gets them separately;
// we use a generic flag for now and pass flagCategory as freetext from dropdown
const FLAG_CATEGORIES = [
  'Opacidad en distribución',
  'Dependencia de intermediarios extractivos',
  'Expansión sin evidencia',
  'Sesgo sistémático',
  'Vulneración de privacidad',
  'Captura de intermediarios',
  'Otro',
];

const STATUS_DOT: Record<string, string> = {
  pending:  'bg-amber-500',
  verified: 'bg-emerald-500',
  flagged:  'bg-red-500',
};

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendiente',
  verified: 'Verificada',
  flagged:  'Marcada',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), "d MMM yyyy", { locale: es });
  } catch {
    return '';
  }
}

export default function EvidenceFeed({ evidence, userRole, postId }: EvidenceFeedProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isCustodio = userRole === 'custodio';

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/community/${postId}/evidence/${id}/verify`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-evidence', postId] });
      toast({ title: 'Evidencia verificada' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo verificar.', variant: 'destructive' });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async ({ id, flagCategory }: { id: number; flagCategory: string }) => {
      const res = await apiRequest('POST', `/api/community/${postId}/evidence/${id}/flag`, { flagCategory });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-evidence', postId] });
      toast({ title: 'Evidencia marcada' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo marcar.', variant: 'destructive' });
    },
  });

  if (evidence.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <p className="text-slate-400 text-sm text-center py-4">No hay evidencia registrada aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evidence.map((item: any, idx: number) => (
        <SmoothReveal key={item.id ?? idx} delay={idx * 0.05}>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${STATUS_DOT[item.status] ?? 'bg-slate-500'}`}
                />
                <Badge className="text-xs border border-white/10 bg-white/5 text-slate-300">
                  {item.evidenceType ?? 'General'}
                </Badge>
                <span className="text-xs text-slate-500">
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {formatDate(item.createdAt)}
              </div>
            </div>

            {/* Content */}
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
              {item.content}
            </p>

            {/* Image thumbnail */}
            {item.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-40">
                <img
                  src={item.imageUrl}
                  alt="Evidencia"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.currentTarget.closest('.rounded-xl') as HTMLElement)?.remove();
                  }}
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3 h-3" />
                <span>{item.submitterName ?? `Usuario #${item.submittedBy}`}</span>
              </div>

              {/* Custodio actions */}
              {isCustodio && item.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2.5"
                    onClick={() => verifyMutation.mutate(item.id)}
                    disabled={verifyMutation.isPending}
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verificar
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 px-2.5"
                        disabled={flagMutation.isPending}
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Marcar
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#0f0f0f] border-white/10 min-w-[200px]"
                    >
                      {FLAG_CATEGORIES.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          className="text-slate-300 hover:bg-white/10 focus:bg-white/10 text-xs cursor-pointer"
                          onClick={() => flagMutation.mutate({ id: item.id, flagCategory: cat })}
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {isCustodio && item.status === 'verified' && (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verificada
                </span>
              )}

              {isCustodio && item.status === 'flagged' && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  {item.flagCategory ?? 'Marcada'}
                </span>
              )}
            </div>
          </div>
        </SmoothReveal>
      ))}
    </div>
  );
}
