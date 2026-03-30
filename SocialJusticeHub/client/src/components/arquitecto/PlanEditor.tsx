import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, BookOpen, GitBranch, Link, History, CheckCircle, XCircle } from 'lucide-react';
import { PLAN_NODES, DEPENDENCIES, getPlanPhases, getDependenciesForPlan, type PlanNode } from '@shared/arquitecto-data';

const CANONICAL_TERMS = [
  { term: 'plata', forbidden: 'acero', context: 'Metáfora del Hombre Gris — argentum = plata, no acero' },
  { term: 'dieciséis mandatos', forbidden: 'quince/doce/diez mandatos', context: 'Conteo canónico del ecosistema' },
  { term: '¡BASTA!', forbidden: 'BASTA (sin signos)', context: 'Siempre con signos de exclamación invertidos' },
  { term: 'Contribución de Soberanía', forbidden: 'superávit Bastarda', context: 'Mecanismo 1-2% de ingresos al Fondo Soberano' },
  { term: 'primera mejor alternativa', forbidden: 'primera mejor estrategia', context: 'Concepto de Ackoff' },
  { term: 'Tablero Nacional', forbidden: 'Dashboard', context: 'Terminología en español' },
];

const VERSION_HISTORY = [
  { version: '2.1.0', date: '2026-03-30', changes: 'Integración PLANCUL + conteo 16 mandatos' },
  { version: '2.0.0', date: '2026-03-28', changes: 'Contribución de Soberanía + Fallbacks PLANDIG' },
  { version: '1.5.0', date: '2026-03-26', changes: 'Auditoría de coherencia maestra' },
  { version: '1.0.0', date: '2026-03-15', changes: 'Versión inicial del plan' },
];

export default function PlanEditor() {
  const [selectedId, setSelectedId] = useState(PLAN_NODES[0].id);
  const [editState, setEditState] = useState<Record<string, { status: string; phase: string; progress: number; notes: string }>>({});

  const plan = PLAN_NODES.find(p => p.id === selectedId)!;
  const phases = getPlanPhases(selectedId);
  const deps = getDependenciesForPlan(selectedId);
  const state = editState[selectedId] || { status: 'published', phase: phases[0]?.name || '', progress: 10, notes: '' };

  const updateState = (field: string, value: string | number) => {
    setEditState(prev => ({ ...prev, [selectedId]: { ...state, [field]: value } }));
  };

  const integrationMatrix = useMemo(() => {
    return PLAN_NODES.filter(p => p.id !== selectedId).map(other => {
      const outgoing = DEPENDENCIES.filter(d => d.source === selectedId && d.target === other.id);
      const incoming = DEPENDENCIES.filter(d => d.source === other.id && d.target === selectedId);
      return { plan: other, outgoing, incoming, hasRelation: outgoing.length > 0 || incoming.length > 0 };
    });
  }, [selectedId]);

  return (
    <div className="space-y-8">
      {/* Plan Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <Edit3 className="w-5 h-5 text-white/50" />
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/80 text-sm flex-1 max-w-md">
          {PLAN_NODES.map(p => (
            <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Metadata + Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-3">Metadata del Plan</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Mandato', value: `#${plan.ordinal}` },
                { label: 'Agencia', value: plan.agency || 'Sin agencia' },
                { label: 'Órgano', value: plan.organMetaphor },
                { label: 'Categoría', value: plan.category },
                { label: 'Presupuesto', value: plan.budgetLow === plan.budgetHigh ? `USD ${plan.budgetLow}M` : `USD ${plan.budgetLow}-${plan.budgetHigh}M` },
                { label: 'Horizonte', value: plan.timelineYears === -1 ? 'Permanente' : `${plan.timelineYears} años` },
                { label: 'Leyes', value: `${plan.legalInstruments} instrumentos` },
                { label: 'Piso PBI', value: plan.constitutionalFloor || '—' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-lg p-2">
                  <div className="text-[10px] text-white/40 uppercase">{item.label}</div>
                  <div className="text-sm text-white/80 font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Editor */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-3">Estado y Progreso</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Status</label>
                <select value={state.status} onChange={e => updateState('status', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70">
                  {['draft', 'review', 'published', 'implementing'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Fase Actual</label>
                <select value={state.phase} onChange={e => updateState('phase', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70">
                  {phases.map(p => <option key={p.name} value={p.name}>{p.name} (A{p.startYear}-A{p.endYear})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Progreso: {state.progress}%</label>
                <input type="range" min={0} max={100} value={state.progress}
                  onChange={e => updateState('progress', parseInt(e.target.value))}
                  className="w-full accent-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-white/40 block mb-1">Notas de actualización</label>
              <textarea value={state.notes} onChange={e => updateState('notes', e.target.value)}
                placeholder="Agregar notas sobre el estado actual del plan..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/20 h-20 resize-none" />
            </div>
          </div>

          {/* Dependencies */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Dependencias ({deps.incoming.length + deps.outgoing.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-emerald-400 mb-2">← Dependen de {plan.id} ({deps.incoming.length})</div>
                {deps.incoming.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-white/5 rounded-lg">
                    <span className={`text-[10px] px-1 py-0.5 rounded ${d.nature === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{d.nature}</span>
                    <div>
                      <span className="text-xs font-medium text-white/70">{d.source}</span>
                      <p className="text-[10px] text-white/40">{d.description}</p>
                    </div>
                  </div>
                ))}
                {deps.incoming.length === 0 && <p className="text-xs text-white/30">Ningún plan depende de este</p>}
              </div>
              <div>
                <div className="text-xs text-blue-400 mb-2">{plan.id} depende de → ({deps.outgoing.length})</div>
                {deps.outgoing.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-white/5 rounded-lg">
                    <span className={`text-[10px] px-1 py-0.5 rounded ${d.nature === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{d.nature}</span>
                    <div>
                      <span className="text-xs font-medium text-white/70">{d.target}</span>
                      <p className="text-[10px] text-white/40">{d.description}</p>
                    </div>
                  </div>
                ))}
                {deps.outgoing.length === 0 && <p className="text-xs text-white/30">No depende de otros planes</p>}
              </div>
            </div>
          </div>

          {/* Integration Matrix */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 overflow-x-auto">
            <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
              <Link className="w-4 h-4" /> Matriz de Integración
            </h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/40 font-normal">Plan</th>
                  <th className="text-center py-2 text-white/40 font-normal">→ Saliente</th>
                  <th className="text-center py-2 text-white/40 font-normal">← Entrante</th>
                  <th className="text-center py-2 text-white/40 font-normal">Relación</th>
                </tr>
              </thead>
              <tbody>
                {integrationMatrix.map(row => (
                  <tr key={row.plan.id} className="border-b border-white/5">
                    <td className="py-1.5 text-white/70 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.plan.color }} />
                      {row.plan.id}
                    </td>
                    <td className="text-center">{row.outgoing.length > 0 ? <span className="text-blue-400">{row.outgoing.length}</span> : <span className="text-white/20">—</span>}</td>
                    <td className="text-center">{row.incoming.length > 0 ? <span className="text-emerald-400">{row.incoming.length}</span> : <span className="text-white/20">—</span>}</td>
                    <td className="text-center">{row.hasRelation ? <CheckCircle className="w-3 h-3 text-emerald-400 inline" /> : <XCircle className="w-3 h-3 text-white/20 inline" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Dictionary + History */}
        <div className="space-y-6">
          {/* Canonical Dictionary */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Diccionario Canónico
            </h4>
            <div className="space-y-3">
              {CANONICAL_TERMS.map((term, i) => (
                <div key={i} className="p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">{term.term}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400 line-through">{term.forbidden}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{term.context}</p>
                </div>
              ))}

              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="text-[10px] text-white/40 uppercase mb-2">Agencias del Ecosistema</div>
                {PLAN_NODES.filter(p => p.agency).map(p => (
                  <div key={p.id} className="flex items-center gap-2 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-white/60 font-mono">{p.agency}</span>
                    <span className="text-[10px] text-white/30 ml-auto truncate max-w-[120px]">{p.agencyFull}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
              <History className="w-4 h-4" /> Historial de Versiones
            </h4>
            <div className="space-y-2">
              {VERSION_HISTORY.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    {i < VERSION_HISTORY.length - 1 && <div className="w-px h-6 bg-white/10" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/70">v{v.version}</span>
                      <span className="text-[10px] text-white/30">{v.date}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{v.changes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
