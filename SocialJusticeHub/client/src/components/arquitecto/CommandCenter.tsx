import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Flag, Plus, X } from 'lucide-react';
import { PLAN_NODES, DEPENDENCIES, getPlanById, type PlanNode } from '@shared/arquitecto-data';

interface StatusEntry { planId: string; status: string; phase: string; progress: number; }
interface UpdateEntry { id: number; planId: string; type: string; title: string; description: string; timestamp: string; }
interface BlockerEntry { id: number; planId: string; blockedBy: string | null; title: string; severity: string; status: string; }

const STATUS_OPTIONS = ['published', 'implementing', 'phase_1', 'phase_2', 'phase_3'];
const UPDATE_TYPES = ['milestone', 'progress', 'blocker', 'decision', 'risk'];
const typeColors: Record<string, string> = { milestone: 'bg-emerald-500/20 text-emerald-400', progress: 'bg-blue-500/20 text-blue-400', blocker: 'bg-red-500/20 text-red-400', decision: 'bg-purple-500/20 text-purple-400', risk: 'bg-amber-500/20 text-amber-400' };

export default function CommandCenter() {
  const [statuses, setStatuses] = useState<StatusEntry[]>(
    PLAN_NODES.map(p => ({ planId: p.id, status: 'published', phase: 'Fase 0', progress: Math.floor(Math.random() * 30 + 5) }))
  );
  const [updates, setUpdates] = useState<UpdateEntry[]>([
    { id: 1, planId: 'PLANDIG', type: 'milestone', title: 'Pre-fase completada', description: 'Auditoría de ARSAT completada, 200 ingenieros contratados', timestamp: '2026-03-28' },
    { id: 2, planId: 'PLANJUS', type: 'progress', title: 'Casas JUS piloto', description: '5 Casas JUS inauguradas en AMBA', timestamp: '2026-03-25' },
    { id: 3, planId: 'PLANSEG', type: 'risk', title: 'Resistencia sindical policial', description: 'Sindicato de policía federal amenaza con paros', timestamp: '2026-03-20' },
    { id: 4, planId: 'PLANVIV', type: 'decision', title: 'Censo habitacional aprobado', description: 'Decreto firmado para censo nacional de vivienda', timestamp: '2026-03-15' },
  ]);
  const [blockers, setBlockers] = useState<BlockerEntry[]>([
    { id: 1, planId: 'PLANMON', blockedBy: 'PLANDIG', title: 'SAPI sin infraestructura', severity: 'critical', status: 'open' },
    { id: 2, planId: 'PLANSUS', blockedBy: 'PLANSEG', title: 'Esperando 250 EB operativas', severity: 'critical', status: 'open' },
    { id: 3, planId: 'PLAN24CN', blockedBy: 'PLANEN', title: 'Bastarda Energética pendiente', severity: 'warning', status: 'in_progress' },
  ]);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ planId: 'PLANDIG', type: 'progress', title: '', description: '' });

  const updateStatus = (planId: string, field: keyof StatusEntry, value: string | number) => {
    setStatuses(prev => prev.map(s => s.planId === planId ? { ...s, [field]: value } : s));
  };

  const addUpdate = () => {
    if (!newUpdate.title) return;
    setUpdates(prev => [{ id: Date.now(), ...newUpdate, timestamp: new Date().toISOString().split('T')[0] }, ...prev]);
    setNewUpdate({ planId: 'PLANDIG', type: 'progress', title: '', description: '' });
    setShowAddUpdate(false);
  };

  const resolveBlocker = (id: number) => {
    setBlockers(prev => prev.map(b => b.id === id ? { ...b, status: 'resolved' } : b));
  };

  return (
    <div className="space-y-8">
      {/* Status Board */}
      <section>
        <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Estado de los 16 Mandatos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statuses.map(s => {
            const plan = getPlanById(s.planId);
            if (!plan) return null;
            const pctColor = s.progress > 66 ? 'bg-emerald-500' : s.progress > 33 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <motion.div key={s.planId} className="bg-white/5 rounded-xl border border-white/10 p-4"
                whileHover={{ scale: 1.02 }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="font-medium text-white/90 text-sm">{plan.id}</span>
                  <span className="text-xs text-white/40 ml-auto">{plan.agency || '—'}</span>
                </div>
                <select value={s.status} onChange={e => updateStatus(s.planId, 'status', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 mb-2">
                  {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                </select>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${pctColor} rounded-full`}
                      initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.6 }} />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">{s.progress}%</span>
                </div>
                <input type="range" min={0} max={100} value={s.progress}
                  onChange={e => updateStatus(s.planId, 'progress', parseInt(e.target.value))}
                  className="w-full h-1 accent-white/40" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Activity Feed + Blockers side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Actividad Reciente
            </h3>
            <button onClick={() => setShowAddUpdate(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs text-white/70 border border-white/10">
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>

          <AnimatePresence>
            {showAddUpdate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="bg-white/5 rounded-xl border border-white/10 p-4 mb-4 space-y-3">
                <div className="flex gap-2">
                  <select value={newUpdate.planId} onChange={e => setNewUpdate(p => ({ ...p, planId: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 flex-1">
                    {PLAN_NODES.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                  </select>
                  <select value={newUpdate.type} onChange={e => setNewUpdate(p => ({ ...p, type: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70">
                    {UPDATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <input placeholder="Título..." value={newUpdate.title}
                  onChange={e => setNewUpdate(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/30" />
                <textarea placeholder="Descripción..." value={newUpdate.description}
                  onChange={e => setNewUpdate(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/30 h-16 resize-none" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddUpdate(false)} className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70">Cancelar</button>
                  <button onClick={addUpdate} className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs text-white/80 border border-white/10">Guardar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {updates.map(u => {
              const plan = getPlanById(u.planId);
              return (
                <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: plan?.color || '#666' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-white/60">{u.planId}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[u.type] || 'bg-white/10 text-white/50'}`}>{u.type}</span>
                      <span className="text-xs text-white/30 ml-auto">{u.timestamp}</span>
                    </div>
                    <p className="text-sm text-white/80 font-medium mt-1">{u.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{u.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Blocker Board */}
        <section>
          <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5" /> Bloqueadores
          </h3>
          {['open', 'in_progress', 'resolved'].map(status => {
            const items = blockers.filter(b => b.status === status);
            const label = status === 'open' ? 'Abiertos' : status === 'in_progress' ? 'En Progreso' : 'Resueltos';
            const dotColor = status === 'open' ? 'bg-red-400' : status === 'in_progress' ? 'bg-amber-400' : 'bg-emerald-400';
            return (
              <div key={status} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="text-sm font-medium text-white/60">{label} ({items.length})</span>
                </div>
                {items.length === 0 && <p className="text-xs text-white/30 pl-4 mb-2">Sin bloqueadores</p>}
                {items.map(b => {
                  const plan = getPlanById(b.planId);
                  const blockedByPlan = b.blockedBy ? getPlanById(b.blockedBy) : null;
                  return (
                    <motion.div key={b.id} layout className="bg-white/5 rounded-xl border border-white/10 p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan?.color || '#666' }} />
                        <span className="text-xs font-medium text-white/70">{b.planId}</span>
                        {blockedByPlan && <span className="text-xs text-white/40">bloqueado por {b.blockedBy}</span>}
                        <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${b.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{b.severity}</span>
                      </div>
                      <p className="text-sm text-white/80 mt-1">{b.title}</p>
                      {b.status !== 'resolved' && (
                        <button onClick={() => resolveBlocker(b.id)}
                          className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolver
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
