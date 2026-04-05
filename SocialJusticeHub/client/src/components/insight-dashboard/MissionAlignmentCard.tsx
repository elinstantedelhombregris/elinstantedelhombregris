import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Target, MapPin } from 'lucide-react';
import { Link } from 'wouter';

interface MissionAlignmentCardProps {
  data: {
    hasProfile: boolean;
    hasLifeAreas: boolean;
    archetype: string | null;
    recommendedRole: string;
    recommendedRoleLabel: string;
    recommendedMission: { slug: string; label: string; number: number; postId: number | null };
    reason: string;
    currentMemberships: Array<{ postId: number; role: string; missionSlug: string; label: string; pendingTasks: number }>;
    weakestLifeArea: { area: string; current: number; desired: number; gap: number } | null;
  } | null | undefined;
}

export default function MissionAlignmentCard({ data }: MissionAlignmentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!data?.recommendedMission.postId) throw new Error('Mision no disponible');
      const res = await apiRequest('POST', `/api/community/${data.recommendedMission.postId}/join`, {
        citizenRole: data.recommendedRole,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al unirse' }));
        throw new Error(err.message || 'Error al unirse');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/mission-alignment'] });
      queryClient.invalidateQueries({ queryKey: ['community-my-memberships'] });
      toast({ title: 'Te uniste a la mision', description: 'Bienvenido al equipo.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (!data) return null;

  // State C: Missing profile or life areas
  if (!data.hasProfile || !data.hasLifeAreas) {
    return (
      <Card className="bg-[#0f1115] border-0 shadow-[0_0_30px_rgba(0,0,0,0.4)] border-l-4 border-l-slate-600">
        <CardContent className="py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Mision ciudadana</h3>
          </div>
          <p className="text-slate-500 text-sm mb-3">
            {!data.hasProfile
              ? 'Completa tu evaluacion civica para descubrir tu mision recomendada.'
              : 'Evalua tus areas de vida para personalizar tu mision.'}
          </p>
          <div className="flex gap-2">
            {!data.hasProfile && (
              <Link href="/evaluacion">
                <Button variant="outline" size="sm" className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                  Evaluacion civica
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            {!data.hasLifeAreas && (
              <Link href="/life-areas">
                <Button variant="outline" size="sm" className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                  Areas de vida
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // State B: Already a mission member
  if (data.currentMemberships.length > 0) {
    const membership = data.currentMemberships[0];
    return (
      <Card className="bg-[#0f1115] border-0 shadow-[0_0_30px_rgba(0,0,0,0.4)] border-l-4 border-l-blue-500">
        <CardContent className="py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Tu mision activa</h3>
            </div>
          </div>
          <p className="text-white text-sm font-medium mb-1">{membership.label}</p>
          <p className="text-slate-500 text-xs mb-3">
            Rol: <span className="text-slate-300">{membership.role}</span>
            {membership.pendingTasks > 0 && (
              <> &middot; <span className="text-amber-400">{membership.pendingTasks} tarea{membership.pendingTasks !== 1 ? 's' : ''} pendiente{membership.pendingTasks !== 1 ? 's' : ''}</span></>
            )}
          </p>
          <Link href={`/mision/${membership.missionSlug}`}>
            <Button variant="outline" size="sm" className="text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
              Ir a la mision
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // State A: Has profile + life areas, NOT a member
  return (
    <Card className="bg-[#0f1115] border-0 shadow-[0_0_30px_rgba(0,0,0,0.4)] border-l-4 border-l-amber-500 overflow-hidden relative">
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
      <CardContent className="py-5 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Mision recomendada</h3>
        </div>

        <p className="text-white text-sm font-medium mb-1">
          {data.recommendedMission.number > 0 && (
            <span className="text-amber-500 mr-1">#{data.recommendedMission.number}</span>
          )}
          {data.recommendedMission.label}
        </p>

        <p className="text-slate-500 text-xs mb-1">
          Tu arquetipo sugiere el rol de <span className="text-amber-300">{data.recommendedRoleLabel}</span>
        </p>

        {data.weakestLifeArea && (
          <p className="text-slate-500 text-xs mb-3">
            Area mas debil: <span className="text-slate-300">{data.weakestLifeArea.area}</span>{' '}
            ({data.weakestLifeArea.current}/100)
          </p>
        )}

        <p className="text-slate-400 text-xs italic mb-4">{data.reason}</p>

        {data.recommendedMission.postId ? (
          <Button
            size="sm"
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? 'Uniendose...' : 'Unirme a esta mision'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        ) : (
          <p className="text-slate-600 text-xs">Esta mision aun no tiene espacio activo.</p>
        )}
      </CardContent>
    </Card>
  );
}
