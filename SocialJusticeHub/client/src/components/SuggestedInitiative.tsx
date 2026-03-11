import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import {
  Heart,
  Users,
  Scale,
  Coins,
  HandHeart,
  Flame,
  Cog,
  Compass,
  Telescope,
  BookOpen,
  Zap,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Suggestion {
  id: number;
  territoryName: string;
  needCategory: string;
  needCount: number;
  resourceCount: number;
  suggestedAction: string;
  precedent: string | null;
  status: "suggested" | "activated" | "completed";
  activatedBy?: number | null;
  initiativeId?: number | null;
}

interface SuggestedInitiativeProps {
  suggestion: Suggestion;
  isLoggedIn: boolean;
  onActivated?: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  health: { label: "Salud y Vida", icon: <Heart className="w-4 h-4" /> },
  development: { label: "Desarrollo Humano", icon: <Users className="w-4 h-4" /> },
  justice: { label: "Justicia y Derechos", icon: <Scale className="w-4 h-4" /> },
  economy: { label: "Economía y Recursos", icon: <Coins className="w-4 h-4" /> },
  community: { label: "Comunidad y Colectivo", icon: <HandHeart className="w-4 h-4" /> },
  action: { label: "Acción y Agencia", icon: <Flame className="w-4 h-4" /> },
  systemic: { label: "Transformación Sistémica", icon: <Cog className="w-4 h-4" /> },
  values: { label: "Valores Fundamentales", icon: <Compass className="w-4 h-4" /> },
  future: { label: "Futuro y Visión", icon: <Telescope className="w-4 h-4" /> },
};

export default function SuggestedInitiative({
  suggestion,
  isLoggedIn,
  onActivated,
}: SuggestedInitiativeProps) {
  const [activated, setActivated] = useState(false);

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/suggestions/${suggestion.id}/activate`);
      return res.json();
    },
    onSuccess: () => {
      setActivated(true);
      onActivated?.();
    },
  });

  const category = CATEGORY_LABELS[suggestion.needCategory] ?? {
    label: suggestion.needCategory,
    icon: <Compass className="w-4 h-4" />,
  };

  const currentStatus = activated ? "activated" : suggestion.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate">
            {suggestion.territoryName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-white/70 text-sm">
            {category.icon}
            <span>{category.label}</span>
          </div>
        </div>

        {/* Status badge */}
        {currentStatus === "suggested" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Sugerida
          </span>
        )}
        {currentStatus === "activated" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Activa
          </span>
        )}
        {currentStatus === "completed" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completada
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/15">
          <Users className="w-3 h-3" />
          {suggestion.needCount} personas necesitan
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/15">
          <Zap className="w-3 h-3" />
          {suggestion.resourceCount} recursos disponibles
        </span>
      </div>

      {/* Action text */}
      <p className="text-white text-sm leading-relaxed">
        {suggestion.suggestedAction}
      </p>

      {/* Precedent box */}
      {suggestion.precedent && (
        <div className="border border-white/10 rounded-xl p-3 bg-white/[0.03]">
          <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Precedente real:
          </div>
          <p className="text-white/70 text-sm italic leading-relaxed">
            {suggestion.precedent}
          </p>
        </div>
      )}

      {/* Action button / status */}
      <div className="pt-1">
        {currentStatus === "suggested" && isLoggedIn && (
          <button
            type="button"
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Activar Iniciativa
              </>
            )}
          </button>
        )}

        {currentStatus === "suggested" && !isLoggedIn && (
          <p className="text-white/50 text-xs text-center">
            Inicia sesión para activar
          </p>
        )}

        {currentStatus === "activated" && (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Iniciativa Activa</span>
            {suggestion.initiativeId && (
              <a
                href={`/comunidad/post/${suggestion.initiativeId}`}
                className="inline-flex items-center gap-1 text-emerald-400/80 hover:text-emerald-300 transition-colors underline underline-offset-2"
              >
                Ver publicación
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {currentStatus === "completed" && (
          <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completada</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
