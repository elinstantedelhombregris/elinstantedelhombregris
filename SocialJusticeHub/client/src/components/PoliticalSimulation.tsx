import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  ChevronRight,
  Target,
  Scale,
} from 'lucide-react';
import ProposalModal from './ProposalModal';
import { proposalsByTerritory } from '@/lib/mandato-vivo-proposals';

// ─── Types ───────────────────────────────────────────────────────────────────

type AlignmentStatus = 'aligned' | 'misaligned' | 'partial' | 'none';

interface Priority {
  theme: string;
  convergencePercent: number;
}

interface GovernmentAction {
  title: string;
  description: string;
  relatedPriority: string;
  status: AlignmentStatus;
  budgetPercent?: number;
}

interface SystemResponse {
  type: 'carta' | 'peticion' | 'proyecto';
  title: string;
  preview: string;
}

interface TerritoryData {
  name: string;
  level: 'Provincial' | 'Municipal' | 'Nacional';
  convergenceScore: number;
  voiceCount: number;
  priorities: Priority[];
  actions: GovernmentAction[];
  alignmentScore: number;
  alignmentLabel: string;
  systemResponse: SystemResponse;
}

// ─── Hardcoded Data ──────────────────────────────────────────────────────────

const territories: TerritoryData[] = [
  {
    name: 'Córdoba',
    level: 'Provincial',
    convergenceScore: 78,
    voiceCount: 5200,
    priorities: [
      { theme: 'Salud y Vida', convergencePercent: 87 },
      { theme: 'Economía y Recursos', convergencePercent: 74 },
      { theme: 'Desarrollo Humano', convergencePercent: 71 },
    ],
    actions: [
      {
        title: 'Ampliación de hospitales',
        description: 'Inversión en infraestructura hospitalaria provincial',
        relatedPriority: 'Salud y Vida',
        status: 'aligned',
        budgetPercent: 18,
      },
      {
        title: 'Subsidio a grandes productores',
        description:
          'El mandato pide economía local y empleo. El gobierno subsidia grandes corporaciones.',
        relatedPriority: 'Economía y Recursos',
        status: 'misaligned',
        budgetPercent: 25,
      },
      {
        title: 'Desarrollo Humano',
        description: 'Sin asignación presupuestaria ni programa activo',
        relatedPriority: 'Desarrollo Humano',
        status: 'none',
        budgetPercent: 0,
      },
    ],
    alignmentScore: 45,
    alignmentLabel: 'Desalineado',
    systemResponse: {
      type: 'carta',
      title: 'Carta al Gobernador de Córdoba',
      preview:
        'Sr. Gobernador: 5.200 ciudadanos cordobeses han expresado sus prioridades a través del sistema de mandato territorial. La convergencia del 87% en Salud y Vida exige una respuesta proporcional. El subsidio a grandes productores contradice directamente el mandato popular que prioriza la economía local y el empleo...',
    },
  },
  {
    name: 'La Matanza',
    level: 'Municipal',
    convergenceScore: 82,
    voiceCount: 3100,
    priorities: [
      { theme: 'Economía y Recursos', convergencePercent: 91 },
      { theme: 'Comunidad y Colectivo', convergencePercent: 79 },
      { theme: 'Salud y Vida', convergencePercent: 73 },
    ],
    actions: [
      {
        title: 'Programa de emprendedores',
        description:
          'Capacitación y microcréditos para nuevos emprendimientos locales',
        relatedPriority: 'Economía y Recursos',
        status: 'aligned',
        budgetPercent: 22,
      },
      {
        title: 'Centros comunitarios',
        description: 'Apertura de 3 nuevos centros de encuentro barrial',
        relatedPriority: 'Comunidad y Colectivo',
        status: 'aligned',
        budgetPercent: 15,
      },
      {
        title: 'Presupuesto de Salud',
        description:
          'Asignación mínima: solo 4% del presupuesto cuando el mandato exige prioridad',
        relatedPriority: 'Salud y Vida',
        status: 'partial',
        budgetPercent: 4,
      },
    ],
    alignmentScore: 72,
    alignmentLabel: 'Parcial',
    systemResponse: {
      type: 'peticion',
      title: 'Petición pública: Aumento de presupuesto de salud',
      preview:
        '3.100 vecinos de La Matanza establecieron Salud y Vida como tercera prioridad con 73% de convergencia. El presupuesto asignado (4%) es insuficiente para cumplir el mandato. Solicitamos la reasignación presupuestaria para alcanzar un mínimo del 12% destinado a salud comunitaria...',
    },
  },
  {
    name: 'Argentina',
    level: 'Nacional',
    convergenceScore: 72,
    voiceCount: 50000,
    priorities: [
      { theme: 'Economía y Recursos', convergencePercent: 88 },
      { theme: 'Salud y Vida', convergencePercent: 82 },
      { theme: 'Justicia y Derechos', convergencePercent: 76 },
      { theme: 'Desarrollo Humano', convergencePercent: 73 },
      { theme: 'Comunidad y Colectivo', convergencePercent: 69 },
    ],
    actions: [
      {
        title: 'Recorte presupuestario en salud',
        description:
          'Reducción del 30% en partidas de salud pública. Directamente contra el mandato.',
        relatedPriority: 'Salud y Vida',
        status: 'misaligned',
        budgetPercent: -30,
      },
      {
        title: 'Desregulación económica',
        description:
          'Liberación de precios y eliminación de controles. Alineación ambigua con el mandato económico.',
        relatedPriority: 'Economía y Recursos',
        status: 'partial',
        budgetPercent: 0,
      },
      {
        title: 'Justicia y Derechos',
        description: 'Sin iniciativas legislativas ni presupuesto asignado',
        relatedPriority: 'Justicia y Derechos',
        status: 'none',
        budgetPercent: 0,
      },
      {
        title: 'Educación recortada',
        description:
          'Recorte del 20% en educación. Contradice el mandato de Desarrollo Humano.',
        relatedPriority: 'Desarrollo Humano',
        status: 'misaligned',
        budgetPercent: -20,
      },
    ],
    alignmentScore: 28,
    alignmentLabel: 'Desalineado',
    systemResponse: {
      type: 'proyecto',
      title: 'Proyecto de ley: Presupuesto Alineado al Mandato Popular',
      preview:
        '50.000 ciudadanos argentinos han constituido un mandato territorial con convergencias que superan el 70% en cinco áreas fundamentales. Los recortes en salud (-30%) y educación (-20%) contradicen frontalmente la voluntad popular expresada. Este proyecto de ley establece un mecanismo vinculante de alineación presupuestaria...',
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAlignmentColor(score: number): string {
  if (score >= 80) return 'emerald';
  if (score >= 50) return 'amber';
  return 'rose';
}

function getStatusIcon(status: AlignmentStatus) {
  switch (status) {
    case 'aligned':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'misaligned':
      return <AlertCircle className="w-4 h-4 text-rose-400" />;
    case 'partial':
      return <Scale className="w-4 h-4 text-amber-400" />;
    case 'none':
      return <MinusCircle className="w-4 h-4 text-white/30" />;
  }
}

function getStatusBg(status: AlignmentStatus): string {
  switch (status) {
    case 'aligned':
      return 'border-emerald-500/20 bg-emerald-500/5';
    case 'misaligned':
      return 'border-rose-500/20 bg-rose-500/5';
    case 'partial':
      return 'border-amber-500/20 bg-amber-500/5';
    case 'none':
      return 'border-white/5 bg-white/[0.02]';
  }
}

function getStatusLabel(status: AlignmentStatus): {
  text: string;
  className: string;
} {
  switch (status) {
    case 'aligned':
      return {
        text: 'Alineado',
        className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      };
    case 'misaligned':
      return {
        text: 'Desalineado',
        className: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    case 'partial':
      return {
        text: 'Parcial',
        className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    case 'none':
      return {
        text: 'Sin acción',
        className: 'text-white/40 bg-white/5 border-white/10',
      };
  }
}

function getResponseTypeLabel(type: SystemResponse['type']): string {
  switch (type) {
    case 'carta':
      return 'Carta automática generada';
    case 'peticion':
      return 'Petición pública activada';
    case 'proyecto':
      return 'Proyecto de ley redactado';
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AlignmentCircle({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const color = getAlignmentColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    color === 'emerald'
      ? '#10b981'
      : color === 'amber'
        ? '#f59e0b'
        : '#f43f5e';
  const textColor =
    color === 'emerald'
      ? 'text-emerald-400'
      : color === 'amber'
        ? 'text-amber-400'
        : 'text-rose-400';
  const labelBg =
    color === 'emerald'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : color === 'amber'
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : 'bg-rose-500/10 border-rose-500/20 text-rose-400';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-bold ${textColor}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <span
        className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${labelBg}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PoliticalSimulation() {
  const [activeTab, setActiveTab] = useState(0);
  const [proposalOpen, setProposalOpen] = useState(false);
  const territory = territories[activeTab];
  const alignColor = getAlignmentColor(territory.alignmentScore);
  const activeProposal = proposalsByTerritory[territory.name] ?? null;
  const modalAccent: 'amber' | 'rose' | 'emerald' =
    alignColor === 'emerald' ? 'emerald' : alignColor === 'amber' ? 'amber' : 'rose';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Tab selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 gap-1">
          {territories.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setActiveTab(i)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === i
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {activeTab === i && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-amber-500/20 border border-amber-500/30 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={territory.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* ── Column 1: Lo que el Pueblo Mandó ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="h-[2px] bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent" />
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                  Lo que el Pueblo Mandó
                </span>
                <div className="flex items-center gap-3 mt-3">
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {territory.name}
                  </h3>
                  <span className="inline-flex items-center bg-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                    {territory.level}
                  </span>
                </div>
              </div>

              {/* Convergence Score */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/60 flex items-center justify-center bg-amber-500/5">
                  <span className="text-amber-400 font-bold text-xl">
                    {territory.convergenceScore}%
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Convergencia</p>
                  <p className="text-white/40 text-xs">
                    {territory.voiceCount.toLocaleString('es-AR')} voces
                  </p>
                </div>
              </div>

              {/* Priorities */}
              <div className="space-y-3">
                <span className="text-white/50 text-xs font-mono uppercase tracking-wider">
                  Prioridades del mandato
                </span>
                <div className="space-y-3">
                  {territory.priorities.map((p, i) => (
                    <div key={p.theme} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{p.theme}</span>
                        <span className="text-amber-400/70 text-xs font-mono">
                          {p.convergencePercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${p.convergencePercent}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.3 + i * 0.1,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice count footer */}
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-amber-500/50" />
                  <span className="text-white/30 text-xs font-mono">
                    {territory.voiceCount.toLocaleString('es-AR')} voces
                    convergieron en estas prioridades
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Column 2: Lo que la Política Hizo ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="h-[2px] bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <span className="text-white/40 font-mono text-xs tracking-[0.3em] uppercase">
                  Lo que la Política Hizo
                </span>
                <p className="text-white/30 text-xs mt-1">
                  Acciones y asignaciones presupuestarias simuladas
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {territory.actions.map((action, i) => {
                  const statusInfo = getStatusLabel(action.status);
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                      className={`border rounded-xl p-4 space-y-2 ${getStatusBg(action.status)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {getStatusIcon(action.status)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-white text-sm font-semibold">
                              {action.title}
                            </p>
                            <p className="text-white/50 text-xs leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Budget bar */}
                      <div className="flex items-center gap-2 pl-6">
                        <span className="text-white/30 text-[10px] font-mono shrink-0">
                          Presupuesto:
                        </span>
                        {action.budgetPercent !== undefined &&
                        action.budgetPercent !== 0 ? (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  action.budgetPercent > 0
                                    ? action.status === 'aligned'
                                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                      : action.status === 'partial'
                                        ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                                        : 'bg-gradient-to-r from-rose-600 to-rose-400'
                                    : 'bg-gradient-to-r from-rose-600 to-rose-400'
                                }`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.abs(action.budgetPercent)}%`,
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: 0.5 + i * 0.1,
                                }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-mono ${
                                action.budgetPercent < 0
                                  ? 'text-rose-400'
                                  : action.status === 'aligned'
                                    ? 'text-emerald-400/70'
                                    : action.status === 'partial'
                                      ? 'text-amber-400/70'
                                      : 'text-rose-400/70'
                              }`}
                            >
                              {action.budgetPercent > 0
                                ? `${action.budgetPercent}%`
                                : `${action.budgetPercent}%`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/20 text-[10px] font-mono">
                            Sin asignación
                          </span>
                        )}
                      </div>

                      {/* Related priority */}
                      <div className="pl-6">
                        <span className="text-white/20 text-[10px] font-mono">
                          Mandato: {action.relatedPriority}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Column 3: El Sistema Responde ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
          >
            <div
              className={`h-[2px] bg-gradient-to-r ${
                alignColor === 'emerald'
                  ? 'from-emerald-500/60 via-emerald-400/30'
                  : alignColor === 'amber'
                    ? 'from-amber-500/60 via-amber-400/30'
                    : 'from-rose-500/60 via-rose-400/30'
              } to-transparent`}
            />
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <span
                  className={`font-mono text-xs tracking-[0.3em] uppercase ${
                    alignColor === 'emerald'
                      ? 'text-emerald-500'
                      : alignColor === 'amber'
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  }`}
                >
                  El Sistema Responde
                </span>
              </div>

              {/* Alignment circle */}
              <div className="flex justify-center">
                <AlignmentCircle
                  score={territory.alignmentScore}
                  label={territory.alignmentLabel}
                />
              </div>

              {/* Alignment index label */}
              <div className="text-center">
                <span className="text-white/40 text-xs font-mono uppercase tracking-wider">
                  Índice de Alineación
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5" />

              {/* System response card */}
              {territory.alignmentScore < 80 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className={`border rounded-xl p-4 space-y-3 ${
                    alignColor === 'amber'
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-rose-500/20 bg-rose-500/5'
                  }`}
                >
                  {/* Response type badge */}
                  <div className="flex items-center gap-2">
                    <FileText
                      className={`w-3.5 h-3.5 ${
                        alignColor === 'amber'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider ${
                        alignColor === 'amber'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {getResponseTypeLabel(territory.systemResponse.type)}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-white text-sm font-semibold leading-snug">
                    {territory.systemResponse.title}
                  </p>

                  {/* Preview text */}
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-3">
                    {territory.systemResponse.preview}
                  </p>

                  {/* Link */}
                  <button
                    type="button"
                    onClick={() => setProposalOpen(true)}
                    disabled={!activeProposal}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      alignColor === 'amber'
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    Ver propuesta completa
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* Fully aligned message */}
              {territory.alignmentScore >= 80 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 text-center space-y-2"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-emerald-400 text-sm font-semibold">
                    Mandato satisfecho
                  </p>
                  <p className="text-white/40 text-xs">
                    Las acciones gubernamentales responden adecuadamente al
                    mandato popular.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <ProposalModal
        proposal={activeProposal}
        accent={modalAccent}
        open={proposalOpen}
        onOpenChange={setProposalOpen}
      />
    </motion.div>
  );
}
