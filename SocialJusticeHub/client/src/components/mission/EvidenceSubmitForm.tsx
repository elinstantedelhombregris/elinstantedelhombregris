import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import type { MissionDefinition } from '../../../../shared/mission-registry';

interface EvidenceSubmitFormProps {
  postId: number;
  mission: MissionDefinition;
  onSuccess?: () => void;
}

export default function EvidenceSubmitForm({ postId, mission, onSuccess }: EvidenceSubmitFormProps) {
  const [open, setOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const qc = useQueryClient();
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        evidenceType,
        content,
        imageUrl: imageUrl.trim() || undefined,
      };
      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lon;
      }
      const res = await apiRequest('POST', `/api/community/${postId}/evidence`, payload);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mission-evidence', postId] });
      toast({ title: 'Evidencia enviada', description: 'Tu aporte fue registrado correctamente.' });
      setEvidenceType('');
      setContent('');
      setImageUrl('');
      setCoords(null);
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar la evidencia.', variant: 'destructive' });
    },
  });

  function handleGeolocate() {
    if (!navigator.geolocation) {
      toast({ title: 'Sin soporte', description: 'Tu navegador no soporta geolocalización.', variant: 'destructive' });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoLoading(false);
        toast({ title: 'Ubicación capturada', description: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      },
      () => {
        setGeoLoading(false);
        toast({ title: 'Sin permiso', description: 'No se pudo acceder a tu ubicación.', variant: 'destructive' });
      },
      { timeout: 10000 },
    );
  }

  const isValid = evidenceType && content.trim().length > 10;

  return (
    <GlassCard className="bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
      {/* Toggle header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-slate-400">
          Aportar evidencia
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
          {/* Evidence type */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500">
              Tipo de evidencia
            </label>
            <Select value={evidenceType} onValueChange={setEvidenceType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-slate-200 text-sm">
                <SelectValue placeholder="Seleccioná un tipo…" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10">
                {mission.evidenceAccepted.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-slate-200 hover:bg-white/10 focus:bg-white/10"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500">
              Descripción
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describí lo que observaste, mediste o verificaste…"
              className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500">
              URL de imagen (opcional)
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 text-sm"
            />
          </div>

          {/* Geolocation */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="border-white/10 text-slate-400 hover:bg-white/10 text-xs"
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
              )}
              {coords ? 'Ubicación capturada' : 'Agregar ubicación'}
            </Button>
            {coords && (
              <span className="text-xs text-emerald-500">
                {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
              </span>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!isValid || submitMutation.isPending}
            className="w-full bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-sm"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Enviar evidencia
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
