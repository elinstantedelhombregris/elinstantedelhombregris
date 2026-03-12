import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { useRoute, Link } from 'wouter';
import { UserContext } from '@/App';
import {
  ChevronLeft,
  Target,
  FileText,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  ChevronRight,
  MapPin,
  Send,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FormattedText from '@/components/FormattedText';

type ProposalDetail = {
  id: number;
  digestId: number;
  title: string;
  summary: string;
  fullAnalysis: string | null;
  evidence: {
    voiceCount: number;
    convergencePercent: number;
    territories: string[];
    quotes: string[];
  } | null;
  targetCategory: string;
  targetDescription: string | null;
  territory: string | null;
  urgency: 'critica' | 'importante' | 'oportunidad';
  precedent: string | null;
  suggestedActionType: string;
  actionTemplate: string | null;
  status: string;
  weeksActive: number;
  escalatedAt: string | null;
  firstAppearedWeek: number | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    id: number;
    fromStatus: string;
    toStatus: string;
    changedBy: number | null;
    notes: string | null;
    createdAt: string;
  }>;
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
  carta: 'Carta Formal',
  peticion: 'Petición Pública',
  iniciativa_comunitaria: 'Iniciativa Comunitaria',
  difusion: 'Campaña de Difusión',
  nota_periodistica: 'Nota Periodística',
  proyecto_ley: 'Proyecto de Ley / Ordenanza',
};

const STATUS_FLOW = ['semilla', 'propuesta', 'enviada', 'respondida', 'en_accion', 'completada'];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  semilla: { label: 'Semilla', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  propuesta: { label: 'Propuesta', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  enviada: { label: 'Enviada', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  respondida: { label: 'Respondida', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  en_accion: { label: 'En Acción', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  completada: { label: 'Completada', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  archivada: { label: 'Archivada', color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

export default function PropuestaDetalle() {
  const [, params] = useRoute('/mandato/propuesta/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const userCtx = useContext(UserContext);
  const isLoggedIn = userCtx?.isLoggedIn;
  const [copied, setCopied] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const { data: res, isLoading } = useQuery<{ data: ProposalDetail }>({
    queryKey: [`/api/propuestas/${id}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const resp = await apiRequest('POST', `/api/propuestas/${id}/status`, { status, notes });
      return resp.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/propuestas/${id}`] });
      setStatusNotes('');
    },
  });

  const proposal = res?.data;

  const copyTemplate = () => {
    if (proposal?.actionTemplate) {
      navigator.clipboard.writeText(proposal.actionTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <p className="text-slate-400">Cargando propuesta...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center py-20">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-white font-serif font-bold text-xl mb-2">Propuesta no encontrada</h2>
            <Link href="/el-mandato-vivo" className="text-amber-400 hover:text-amber-300 text-sm">
              ← Volver al Mandato
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const urgency = URGENCY_CONFIG[proposal.urgency] || URGENCY_CONFIG.oportunidad;
  const UrgencyIcon = urgency.icon;
  const currentStatusIdx = STATUS_FLOW.indexOf(proposal.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header />

      <main>
        {/* ═══════ HERO ═══════ */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0a0a] to-[#0a0a0a]" />

          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <Link href="/el-mandato-vivo" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 text-sm mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Volver al Mandato
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 flex-wrap mb-6"
            >
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${urgency.bg} ${urgency.color}`}>
                <UrgencyIcon className="w-3 h-3" />
                {urgency.label}
              </span>
              <span className="text-xs text-slate-500 font-mono">→</span>
              <span className="text-xs text-slate-400 font-mono">
                {TARGET_LABELS[proposal.targetCategory] || proposal.targetCategory}
              </span>
              {proposal.targetDescription && (
                <span className="text-xs text-slate-500 font-mono">({proposal.targetDescription})</span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-5"
            >
              {proposal.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 max-w-3xl"
            >
              {proposal.summary}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-4 flex-wrap text-xs text-slate-500 font-mono"
            >
              {proposal.territory && (
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {proposal.territory}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                <FileText className="w-3 h-3" />
                {ACTION_LABELS[proposal.suggestedActionType] || proposal.suggestedActionType}
              </span>
              {proposal.weeksActive > 1 && (
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {proposal.weeksActive} semanas activa
                </span>
              )}
              {proposal.escalatedAt && (
                <span className="inline-flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-full text-rose-400">
                  Escalada
                </span>
              )}
            </motion.div>
          </div>
        </section>

        {/* ═══════ STATUS PIPELINE ═══════ */}
        <section className="py-16 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
            >
              Ciclo de vida
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-serif font-bold text-center mb-8"
            >
              Estado Actual
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-1 overflow-x-auto pb-2 justify-center"
            >
              {STATUS_FLOW.map((s, i) => {
                const config = STATUS_LABELS[s];
                const isActive = s === proposal.status;
                const isPast = i < currentStatusIdx;
                return (
                  <div key={s} className="flex items-center gap-1 flex-shrink-0">
                    <div className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                      isActive
                        ? `${config.bg} ${config.color} border border-current ring-2 ring-current/20`
                        : isPast
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-slate-600'
                    }`}>
                      {config.label}
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isPast ? 'text-white/30' : 'text-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════ EVIDENCE ═══════ */}
        {proposal.evidence && (
          <section className="py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Respaldo
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Evidencia
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">{proposal.evidence.voiceCount}</p>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-1">Voces</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">{proposal.evidence.convergencePercent}%</p>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-1">Convergencia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">{proposal.evidence.territories?.length || 0}</p>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-1">Territorios</p>
                  </div>
                </div>

                {proposal.evidence.territories && proposal.evidence.territories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
                    {proposal.evidence.territories.map((t, i) => (
                      <span key={i} className="text-xs text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                        <ArrowUpRight className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {proposal.evidence.quotes && proposal.evidence.quotes.length > 0 && (
                  <div className="space-y-3 border-t border-white/10 pt-6">
                    <p className="text-amber-500 font-mono text-xs tracking-[0.2em] uppercase mb-3">Voces del mapa</p>
                    {proposal.evidence.quotes.map((q, i) => (
                      <p key={i} className="text-slate-400 text-sm italic pl-4 border-l-2 border-amber-500/30 leading-relaxed">
                        "{q}"
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ FULL ANALYSIS ═══════ */}
        {proposal.fullAnalysis && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Análisis
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Análisis Detallado
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <FormattedText text={proposal.fullAnalysis} variant="analysis" />
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ PRECEDENT ═══════ */}
        {proposal.precedent && (
          <section className="py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Referencia
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Precedente
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-8"
              >
                <p className="text-slate-300 text-sm leading-relaxed">{proposal.precedent}</p>
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ ACTION TEMPLATE ═══════ */}
        {proposal.actionTemplate && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Acción
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-3"
              >
                Plantilla de Acción
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-slate-400 text-sm text-center mb-8"
              >
                {ACTION_LABELS[proposal.suggestedActionType] || proposal.suggestedActionType} — lista para copiar y enviar
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <button
                  onClick={copyTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-mono uppercase tracking-wider transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(proposal.actionTemplate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono uppercase tracking-wider transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <FormattedText text={proposal.actionTemplate} variant="document" />
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ STATUS CHANGE (LOGGED IN) ═══════ */}
        {isLoggedIn && proposal.status !== 'completada' && proposal.status !== 'archivada' && (
          <section className="py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Gestión
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Actualizar Estado
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto"
              >
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Notas (opcional) — ej: 'Enviada por email al concejo deliberante'"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 mb-4 font-mono"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2 justify-center">
                  {STATUS_FLOW
                    .filter((s) => {
                      const idx = STATUS_FLOW.indexOf(s);
                      return idx > currentStatusIdx;
                    })
                    .map((s) => {
                      const config = STATUS_LABELS[s];
                      return (
                        <button
                          key={s}
                          onClick={() => statusMutation.mutate({ status: s, notes: statusNotes })}
                          disabled={statusMutation.isPending}
                          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider ${config.bg} ${config.color} border border-current/20 hover:opacity-80 transition-opacity disabled:opacity-50`}
                        >
                          Mover a {config.label}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => statusMutation.mutate({ status: 'archivada', notes: statusNotes })}
                    disabled={statusMutation.isPending}
                    className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    Archivar
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ STATUS HISTORY ═══════ */}
        {proposal.statusHistory && proposal.statusHistory.length > 0 && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="max-w-4xl mx-auto px-4">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Trazabilidad
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Historial de Cambios
              </motion.h2>

              <div className="max-w-2xl mx-auto space-y-3">
                {proposal.statusHistory.map((h, i) => {
                  const from = STATUS_LABELS[h.fromStatus] || { label: h.fromStatus, color: 'text-slate-500' };
                  const to = STATUS_LABELS[h.toStatus] || { label: h.toStatus, color: 'text-slate-500' };
                  return (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="flex items-start gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-serif">
                          <span className={from.color}>{from.label}</span>
                          {' → '}
                          <span className={to.color}>{to.label}</span>
                        </p>
                        {h.notes && <p className="text-slate-500 text-xs mt-1">{h.notes}</p>}
                        <p className="text-slate-600 text-xs font-mono mt-1">
                          {new Date(h.createdAt).toLocaleDateString('es-AR', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
