import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import SmoothReveal from '@/components/ui/SmoothReveal';
import GlassCard from '@/components/ui/GlassCard';
import CitizenRoleBadge from '@/components/CitizenRoleBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Calendar, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChronicleSectionProps {
  chronicles: any[];
  postId: number;
  userRole: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), "d 'de' MMMM yyyy", { locale: es });
  } catch {
    return '';
  }
}

export default function ChronicleSection({ chronicles, postId, userRole }: ChronicleSectionProps) {
  const isNarrador = userRole === 'narrador';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const qc = useQueryClient();
  const { toast } = useToast();

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/community/${postId}/chronicles`, { title, content });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-chronicles', postId] });
      toast({ title: 'Crónica publicada', description: 'Tu relato está visible para la comunidad.' });
      setTitle('');
      setContent('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo publicar la crónica.', variant: 'destructive' });
    },
  });

  const isValid = title.trim().length > 3 && content.trim().length > 20;

  return (
    <div className="space-y-5">
      {/* Compose form for narradores */}
      {isNarrador && (
        <GlassCard className="bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-violet-400">
                Nueva crónica
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500">
                Título
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Un título que convoque…"
                className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500">
                Relato
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contá lo que está pasando, lo que viste, lo que cambió…"
                className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 text-sm resize-none"
                rows={5}
              />
            </div>

            <Button
              onClick={() => publishMutation.mutate()}
              disabled={!isValid || publishMutation.isPending}
              className="w-full bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-sm"
            >
              {publishMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publicar crónica
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Chronicle list */}
      {chronicles.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-sm text-center py-4">
            Aún no hay crónicas publicadas para esta misión.
          </p>
        </div>
      ) : (
        chronicles.map((chronicle: any, idx: number) => (
          <SmoothReveal key={chronicle.id ?? idx} delay={idx * 0.07}>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
              {/* Title */}
              <h3 className="text-slate-100 font-serif text-lg leading-snug">
                {chronicle.title}
              </h3>

              {/* Content */}
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
                {chronicle.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{chronicle.authorName ?? `Autor #${chronicle.authorId}`}</span>
                  <CitizenRoleBadge role="narrador" size="sm" />
                </div>
                {chronicle.publishedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(chronicle.publishedAt)}
                  </div>
                )}
              </div>
            </div>
          </SmoothReveal>
        ))
      )}
    </div>
  );
}
