import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Target,
  FileText,
  Users,
} from 'lucide-react';

type Proposal = {
  id: number;
  title: string;
  summary: string;
  targetCategory: string;
  urgency: 'critica' | 'importante' | 'oportunidad';
  status: string;
  weeksActive: number;
  territory: string;
  suggestedActionType: string;
  evidence: { voiceCount: number; convergencePercent: number } | null;
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  critica: { label: 'Crítica', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/20', icon: AlertCircle },
  importante: { label: 'Importante', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20', icon: AlertTriangle },
  oportunidad: { label: 'Oportunidad', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: Lightbulb },
};

const TARGET_LABELS: Record<string, string> = {
  gobierno_municipal: 'Gobierno Municipal',
  gobierno_provincial: 'Gobierno Provincial',
  gobierno_nacional: 'Gobierno Nacional',
  organizaciones: 'Organizaciones',
  medios: 'Medios',
  sector_privado: 'Sector Privado',
  comunidad: 'Comunidad',
};

const ACTION_LABELS: Record<string, string> = {
  carta: 'Carta',
  peticion: 'Petición',
  iniciativa_comunitaria: 'Iniciativa',
  difusion: 'Difusión',
  nota_periodistica: 'Nota',
  proyecto_ley: 'Proyecto de Ley',
};

export default function ProposalCard({ proposal, index }: { proposal: Proposal; index: number }) {
  const urgency = URGENCY_CONFIG[proposal.urgency] || URGENCY_CONFIG.oportunidad;
  const UrgencyIcon = urgency.icon;

  return (
    <Link href={`/mandato/propuesta/${proposal.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/20 hover:shadow-[0_0_24px_rgba(245,158,11,0.08)] transition-all cursor-pointer group"
      >
        {/* Top accent line */}
        <div className={`h-[2px] -mx-6 -mt-6 mb-5 rounded-t-2xl ${
          proposal.urgency === 'critica' ? 'bg-gradient-to-r from-rose-500/60 via-rose-400/30 to-transparent' :
          proposal.urgency === 'importante' ? 'bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent' :
          'bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent'
        }`} />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${urgency.bg} ${urgency.color}`}>
              <UrgencyIcon className="w-3 h-3" />
              {urgency.label}
            </span>
            {proposal.weeksActive >= 3 && (
              <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase">
                {proposal.weeksActive} semanas
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
        </div>

        <h3 className="text-white font-serif font-bold text-lg mb-2 group-hover:text-amber-300 transition-colors">
          {proposal.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {proposal.summary}
        </p>

        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-mono">
          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
            <Target className="w-3 h-3" />
            {TARGET_LABELS[proposal.targetCategory] || proposal.targetCategory}
          </span>
          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3" />
            {ACTION_LABELS[proposal.suggestedActionType] || proposal.suggestedActionType}
          </span>
          {proposal.evidence?.voiceCount ? (
            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              {proposal.evidence.voiceCount} voces
            </span>
          ) : null}
        </div>
      </motion.div>
    </Link>
  );
}
