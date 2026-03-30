import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Swords, Users, Target, BarChart3, RefreshCw } from 'lucide-react';
import { PLAN_NODES, DEPENDENCIES } from '@shared/arquitecto-data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Adversary { name: string; plans: string[]; power: 'VERY_HIGH' | 'HIGH' | 'MEDIUM'; }
interface Coalition { name: string; members: string[]; threat: 'EXTREME' | 'HIGH' | 'MEDIUM'; plansAffected: string[]; vectors: string[]; }

const ADVERSARIES: Adversary[] = [
  { name: 'Bancos y sistema financiero', plans: ['PLANMON', 'PLANEB'], power: 'VERY_HIGH' },
  { name: 'FMI y agencias de rating', plans: ['PLANMON', 'PLANGEO'], power: 'VERY_HIGH' },
  { name: 'Narcotráfico', plans: ['PLANSUS', 'PLANSEG'], power: 'VERY_HIGH' },
  { name: 'US State Dept / DEA', plans: ['PLANSUS', 'PLANGEO', 'PLANMON'], power: 'VERY_HIGH' },
  { name: 'Petroleras internacionales', plans: ['PLANEN', 'PLANGEO'], power: 'VERY_HIGH' },
  { name: 'Google, Meta, Amazon', plans: ['PLANDIG', 'PLANGEO'], power: 'HIGH' },
  { name: 'Aseguradoras y telecoms', plans: ['PLANEB'], power: 'HIGH' },
  { name: 'Industria farmacéutica', plans: ['PLANSAL', 'PLANSUS'], power: 'HIGH' },
  { name: 'Sindicatos docentes (modelo de poder)', plans: ['PLANEDU'], power: 'HIGH' },
  { name: 'Judicatura corrupta', plans: ['PLANJUS'], power: 'HIGH' },
  { name: 'Policía corrupta y seguridad privada', plans: ['PLANSEG', 'PLANSUS'], power: 'HIGH' },
  { name: '1.2-1.8M empleados públicos', plans: ['PLANREP'], power: 'HIGH' },
  { name: 'Desarrolladores inmobiliarios', plans: ['PLANVIV'], power: 'MEDIUM' },
  { name: 'Beneficiarios de subsidios energéticos', plans: ['PLANEN'], power: 'MEDIUM' },
  { name: 'Agroindustria convencional', plans: ['PLANISV'], power: 'MEDIUM' },
  { name: 'Gobernadores del interior', plans: ['PLAN24CN', 'PLANREP'], power: 'MEDIUM' },
];

const COALITIONS: Coalition[] = [
  { name: 'Coalición Financiera', members: ['Bancos', 'FMI', 'Rating agencies', 'Fondos de inversión'],
    threat: 'EXTREME', plansAffected: ['PLANMON', 'PLANEB', 'PLANGEO'],
    vectors: ['Downgrade soberano', 'Fuga de capitales', 'Embargo crediticio', 'Presión sobre corresponsales bancarios'] },
  { name: 'Coalición Mediática', members: ['Clarín', 'La Nación', 'Oligarquía de pauta'],
    threat: 'HIGH', plansAffected: ['PLANSUS', 'PLANREP', 'PLANMON'],
    vectors: ['Narrativa de caos', '"¡BASTA! = narcoestado"', 'Amplificación de incidentes', 'Desinformación sobre Pulso'] },
  { name: 'Coalición Judicial', members: ['Jueces federales', 'Facultades de derecho', 'Colegios de abogados'],
    threat: 'HIGH', plansAffected: ['PLANJUS', 'PLANEB', 'PLANSUS'],
    vectors: ['Medidas cautelares preventivas', 'Declaraciones de inconstitucionalidad', 'Bloqueo de agencias autónomas'] },
  { name: 'Paralelo de Seguridad', members: ['Policía corrupta', 'Narcos', 'Seguridad privada'],
    threat: 'HIGH', plansAffected: ['PLANSEG', 'PLANSUS'],
    vectors: ['Sabotaje territorial', 'Violencia escalada', 'Filtración a medios', 'Resistencia pasiva a reforma'] },
  { name: 'Coalición Geopolítica', members: ['US State Dept', 'China', 'UK', 'GAFI/FATF'],
    threat: 'EXTREME', plansAffected: ['PLANGEO', 'PLANMON', 'PLANSUS'],
    vectors: ['Sanciones secundarias', 'Lista gris GAFI', 'Litigio CIADI', 'Presión SWIFT'] },
];

const powerColors = { VERY_HIGH: 'text-red-400 bg-red-500/20', HIGH: 'text-amber-400 bg-amber-500/20', MEDIUM: 'text-yellow-400 bg-yellow-500/20' };
const threatColors = { EXTREME: 'border-red-500/50 bg-red-500/5', HIGH: 'border-amber-500/50 bg-amber-500/5', MEDIUM: 'border-yellow-500/50 bg-yellow-500/5' };

export default function AdversarialSimulator() {
  const [activeSection, setActiveSection] = useState<'adversaries' | 'coalitions' | 'montecarlo'>('adversaries');
  const [political, setPolitical] = useState(50);
  const [fiscal, setFiscal] = useState(50);
  const [social, setSocial] = useState(50);
  const [simKey, setSimKey] = useState(0);

  const monteCarloResults = useMemo(() => {
    const iterations = 1000;
    const histogram: Record<number, number> = {};
    for (let n = 0; n <= 16; n++) histogram[n] = 0;

    for (let i = 0; i < iterations; i++) {
      let completed = 0;
      for (const plan of PLAN_NODES) {
        // Base probability based on plan characteristics
        let baseProb = 0.7;
        if (plan.timelineYears > 15) baseProb -= 0.1;
        if (plan.timelineYears === -1) baseProb = 0.85; // continuous plans are more resilient
        if (plan.budgetHigh > 50000) baseProb -= 0.05; // very expensive plans are riskier

        // Political factor (government change risk)
        const politicalFactor = 0.5 + (political / 100) * 0.5;

        // Fiscal factor
        const fiscalFactor = 0.5 + (fiscal / 100) * 0.5;

        // Social acceptance
        const socialFactor = 0.6 + (social / 100) * 0.4;

        // Dependency factor — more critical deps = more fragile
        const critDeps = DEPENDENCIES.filter(d => d.source === plan.id && d.nature === 'CRITICAL').length;
        const depFactor = Math.max(0.5, 1 - critDeps * 0.08);

        const prob = baseProb * politicalFactor * fiscalFactor * socialFactor * depFactor;
        if (Math.random() < prob) completed++;
      }
      histogram[completed]++;
    }

    return Object.entries(histogram).map(([n, count]) => ({
      mandatos: parseInt(n),
      frecuencia: count,
      porcentaje: ((count / iterations) * 100).toFixed(1),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [political, fiscal, social, simKey]);

  const avgCompleted = useMemo(() => {
    return monteCarloResults.reduce((s, r) => s + r.mandatos * r.frecuencia, 0) / 1000;
  }, [monteCarloResults]);

  const prob16 = useMemo(() => {
    const p = monteCarloResults.find(r => r.mandatos === 16);
    return p ? parseFloat(p.porcentaje) : 0;
  }, [monteCarloResults]);

  const probMajority = useMemo(() => {
    return monteCarloResults.filter(r => r.mandatos >= 12).reduce((s, r) => s + r.frecuencia, 0) / 10;
  }, [monteCarloResults]);

  const sections = [
    { id: 'adversaries' as const, label: 'Mapa Adversarial', icon: Target },
    { id: 'coalitions' as const, label: 'Coaliciones', icon: Users },
    { id: 'montecarlo' as const, label: 'Monte Carlo', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Section Nav */}
      <div className="flex gap-2">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors border ${
              activeSection === s.id ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'}`}>
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* Adversarial Map */}
      {activeSection === 'adversaries' && (
        <div className="space-y-4">
          <p className="text-sm text-white/50">Actores perdedores identificados por el ecosistema ¡BASTA! — cada uno tiene incentivo para resistir.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADVERSARIES.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">{a.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${powerColors[a.power]}`}>{a.power.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.plans.map(p => {
                    const plan = PLAN_NODES.find(n => n.id === p);
                    return (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plan?.color || '#666' }} />
                        {p}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Coalitions */}
      {activeSection === 'coalitions' && (
        <div className="space-y-4">
          <p className="text-sm text-white/50">Coaliciones probables de adversarios coordinados — el peligro no son los actores individuales sino su convergencia.</p>
          {COALITIONS.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-5 ${threatColors[c.threat]}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-white/90">{c.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${c.threat === 'EXTREME' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {c.threat}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Miembros</div>
                  {c.members.map(m => <div key={m} className="text-xs text-white/60">{m}</div>)}
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Planes Afectados</div>
                  <div className="flex flex-wrap gap-1">
                    {c.plansAffected.map(p => {
                      const plan = PLAN_NODES.find(n => n.id === p);
                      return (
                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plan?.color || '#666' }} />
                          {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Vectores de Ataque</div>
                  {c.vectors.map(v => <div key={v} className="text-[10px] text-white/50">• {v}</div>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Monte Carlo */}
      {activeSection === 'montecarlo' && (
        <div className="space-y-6">
          <p className="text-sm text-white/50">Simulación de 1.000 iteraciones: ¿cuántos mandatos se completan hacia 2040?</p>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Estabilidad Política', value: political, set: setPolitical, color: 'accent-blue-400' },
              { label: 'Salud Fiscal', value: fiscal, set: setFiscal, color: 'accent-emerald-400' },
              { label: 'Aceptación Social', value: social, set: setSocial, color: 'accent-amber-400' },
            ].map(ctrl => (
              <div key={ctrl.label} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">{ctrl.label}</span>
                  <span className="text-sm font-bold text-white/80">{ctrl.value}%</span>
                </div>
                <input type="range" min={0} max={100} value={ctrl.value}
                  onChange={e => ctrl.set(parseInt(e.target.value))}
                  className={`w-full ${ctrl.color}`} />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={() => setSimKey(k => k + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm text-white/70 border border-white/10">
              <RefreshCw className="w-4 h-4" /> Re-simular
            </button>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-white/90">{avgCompleted.toFixed(1)}</div>
              <div className="text-xs text-white/50">Mandatos promedio</div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <div className={`text-2xl font-bold ${prob16 > 20 ? 'text-emerald-400' : prob16 > 5 ? 'text-amber-400' : 'text-red-400'}`}>
                {prob16}%
              </div>
              <div className="text-xs text-white/50">Prob. 16/16 completos</div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <div className={`text-2xl font-bold ${probMajority > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {probMajority.toFixed(0)}%
              </div>
              <div className="text-xs text-white/50">Prob. ≥12 mandatos</div>
            </div>
          </div>

          {/* Histogram */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monteCarloResults} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <XAxis dataKey="mandatos" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  label={{ value: 'Mandatos completados', position: 'bottom', fill: 'rgba(255,255,255,0.3)', fontSize: 11, offset: 5 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  formatter={(value: number, name: string) => [`${value} iteraciones`, 'Frecuencia']} />
                <Bar dataKey="frecuencia" radius={[4, 4, 0, 0]}>
                  {monteCarloResults.map((entry, index) => (
                    <Cell key={index} fill={entry.mandatos >= 12 ? '#22c55e' : entry.mandatos >= 8 ? '#f59e0b' : '#ef4444'} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
