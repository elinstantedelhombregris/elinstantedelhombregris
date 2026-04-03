import { useState, useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import CitizenRoleBadge from '@/components/CitizenRoleBadge';
import PowerCTA from '@/components/PowerCTA';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CITIZEN_ROLE_META } from '@/lib/initiative-utils';
import { CheckCircle2, LogIn, Loader2 } from 'lucide-react';
import type { MissionDefinition } from '../../../../shared/mission-registry';
import type { CitizenRole } from '../../../../shared/strategic-initiatives';

interface MissionJoinCTAProps {
  mission: MissionDefinition;
  postId: number;
  userMembership: any | null;
  onJoined?: () => void;
}

export default function MissionJoinCTA({ mission, postId, userMembership, onJoined }: MissionJoinCTAProps) {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CitizenRole | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const joinMutation = useMutation({
    mutationFn: async (citizenRole: CitizenRole) => {
      const res = await apiRequest('POST', `/api/community/${postId}/join`, { citizenRole });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-members', postId] });
      toast({ title: '¡Te sumaste!', description: `Sos parte de la misión como ${selectedRole ? CITIZEN_ROLE_META[selectedRole]?.label : ''}` });
      setDialogOpen(false);
      onJoined?.();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo procesar tu solicitud.', variant: 'destructive' });
    },
  });

  // Already a member
  if (userMembership) {
    const role = userMembership.citizenRole as CitizenRole;
    return (
      <GlassCard className="bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
        <div className="px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-slate-300 text-sm font-medium">Ya sos parte de esta misión</p>
            <div className="mt-1">
              <CitizenRoleBadge role={role} size="sm" />
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <GlassCard className="bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
        <div className="px-5 py-5 text-center space-y-3">
          <p className="text-slate-300 text-sm">
            Iniciá sesión para sumarte a esta misión y participar activamente.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-slate-300 hover:bg-white/10 text-sm"
            onClick={() => setLocation('/login')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Iniciar sesión
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Logged in, not yet a member — show join CTA
  return (
    <>
      <GlassCard className="bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
        <div className="px-5 py-5 space-y-3">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-slate-400">
            Roles disponibles
          </p>
          <div className="flex flex-wrap gap-2">
            {mission.citizenRoles.map((role) => (
              <CitizenRoleBadge key={role} role={role} size="sm" />
            ))}
          </div>
          <div className="pt-1">
            <PowerCTA
              text="SUMARME A LA MISIÓN"
              variant="primary"
              size="sm"
              onClick={() => setDialogOpen(true)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Role selection dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Elegí tu rol</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cada rol tiene responsabilidades distintas. Elegí el que mejor refleja lo que podés aportar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {mission.citizenRoles.map((role) => {
              const meta = CITIZEN_ROLE_META[role];
              if (!meta) return null;
              const Icon = meta.icon;
              const isSelected = selectedRole === role;

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-white/30 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-white/15' : 'bg-white/5'}`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {meta.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <Button
              onClick={() => selectedRole && joinMutation.mutate(selectedRole)}
              disabled={!selectedRole || joinMutation.isPending}
              className="w-full bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
            >
              {joinMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirmar y sumarme
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
