import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, FileText, XCircle } from 'lucide-react';
import { runAllValidations, getEcosystemScore, ALL_RULES, CATEGORY_LABELS, type ValidationResult, type RuleCategory } from '@shared/validation-engine';

export default function ValidationDashboard() {
  const [expandedCat, setExpandedCat] = useState<RuleCategory | null>(null);
  const [showReport, setShowReport] = useState(false);

  const results = useMemo(() => runAllValidations(), []);
  const score = useMemo(() => getEcosystemScore(), []);
  const errors = results.filter(r => r.severity === 'ERROR');
  const warnings = results.filter(r => r.severity === 'WARNING');

  const categoryStats = useMemo(() => {
    const cats = Object.keys(CATEGORY_LABELS) as RuleCategory[];
    return cats.map(cat => {
      const catRules = ALL_RULES.filter(r => r.category === cat);
      const catResults = results.filter(r => r.category === cat);
      const catErrors = catResults.filter(r => r.severity === 'ERROR').length;
      const rulesPassed = catRules.length - new Set(catResults.filter(r => r.severity === 'ERROR').map(r => r.ruleId)).size;
      return { category: cat, ...CATEGORY_LABELS[cat], total: catRules.length, passed: rulesPassed, errors: catErrors, warnings: catResults.filter(r => r.severity === 'WARNING').length, results: catResults };
    });
  }, [results]);

  const scoreColor = score.score > 80 ? '#22c55e' : score.score > 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference * (1 - score.score / 100);

  return (
    <div className="space-y-8">
      {/* Health Ring + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 128 128" className="w-full h-full">
              <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle cx="64" cy="64" r="58" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 64 64)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span className="text-3xl font-bold" style={{ color: scoreColor }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {score.score}
              </motion.span>
              <span className="text-xs text-white/50">/ 100</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Errores', value: score.errors, color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
            { label: 'Alertas', value: score.warnings, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
            { label: 'Reglas OK', value: score.passed, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
            { label: 'Total Reglas', value: score.total, color: 'text-slate-300', bg: 'bg-white/5', icon: Shield },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/10`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90">Validación por Categoría</h3>
        {categoryStats.map(cat => {
          const isExpanded = expandedCat === cat.category;
          const pct = cat.total > 0 ? (cat.passed / cat.total) * 100 : 100;
          const barColor = pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-500';

          return (
            <div key={cat.category} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button onClick={() => setExpandedCat(isExpanded ? null : cat.category)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-white/80 font-medium">{cat.label}</span>
                  {cat.errors > 0 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{cat.errors} errores</span>}
                  {cat.warnings > 0 && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{cat.warnings} alertas</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${barColor} rounded-full`}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-sm text-white/50 w-12 text-right">{cat.passed}/{cat.total}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && cat.results.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="border-t border-white/10">
                    {cat.results.map((r, i) => (
                      <div key={i} className="px-4 py-3 border-b border-white/5 last:border-0 flex items-start gap-3">
                        {r.severity === 'ERROR'
                          ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white/40">{r.ruleId}</span>
                            {r.planId && <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/60">{r.planId}</span>}
                          </div>
                          <p className="text-sm text-white/70 mt-0.5">{r.message}</p>
                          {r.details && <p className="text-xs text-white/40 mt-1">{r.details}</p>}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
                {isExpanded && cat.results.length === 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-4 py-4">
                    <p className="text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Todas las reglas pasan sin violaciones
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Generate Report */}
      <div className="flex justify-center">
        <button onClick={() => setShowReport(!showReport)}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 text-white/80 transition-colors">
          <FileText className="w-4 h-4" />
          {showReport ? 'Ocultar Informe' : 'Generar Informe de Coherencia'}
        </button>
      </div>

      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6 font-mono text-sm text-white/70 whitespace-pre-wrap">
{`INFORME DE COHERENCIA — EL ARQUITECTO
======================================
Fecha: ${new Date().toISOString().split('T')[0]}
Ecosistema: ¡BASTA! — 16 mandatos

PUNTUACIÓN GLOBAL: ${score.score}/100
  Errores: ${score.errors}
  Alertas: ${score.warnings}
  Reglas aprobadas: ${score.passed}/${score.total}

RESUMEN POR CATEGORÍA:
${categoryStats.map(c => `  ${c.label}: ${c.passed}/${c.total} (${c.errors} errores, ${c.warnings} alertas)`).join('\n')}

${errors.length > 0 ? `\nERRORES (${errors.length}):\n${errors.map(e => `  [${e.ruleId}] ${e.planId || 'SISTEMA'}: ${e.message}`).join('\n')}` : '\nSIN ERRORES CRÍTICOS'}

${warnings.length > 0 ? `\nALERTAS (${warnings.length}):\n${warnings.map(w => `  [${w.ruleId}] ${w.planId || 'SISTEMA'}: ${w.message}`).join('\n')}` : ''}

FIN DEL INFORME`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
