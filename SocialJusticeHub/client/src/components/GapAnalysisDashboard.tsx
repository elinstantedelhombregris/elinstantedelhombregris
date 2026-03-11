import { motion } from 'framer-motion';
import { useGapAnalysis, type TerritoryGap } from '@/hooks/useGapAnalysis';
import { THEME_META } from '@/hooks/useConvergenceAnalysis';
import {
  AlertTriangle,
  Sparkles,
  TrendingUp,
  MapPin,
  Wrench,
  Target,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  legal: 'Legal',
  medical: 'Salud',
  education: 'Educación',
  tech: 'Tecnología',
  construction: 'Construcción',
  agriculture: 'Agro',
  communication: 'Comunicación',
  admin: 'Administración',
  transport: 'Transporte',
  space: 'Espacio físico',
  equipment: 'Equipamiento',
  other: 'Otro',
};

const TerritoryCard = ({ territory }: { territory: TerritoryGap }) => {
  const statusColor = territory.isOpportunityZone
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : territory.isCrisisZone
    ? 'border-red-500/30 bg-red-500/5'
    : 'border-white/10 bg-white/5';

  const statusLabel = territory.isOpportunityZone
    ? 'Zona de Oportunidad'
    : territory.isCrisisZone
    ? 'Zona Crítica'
    : 'En desarrollo';

  const StatusIcon = territory.isOpportunityZone ? Sparkles : territory.isCrisisZone ? Flame : Target;
  const statusTextColor = territory.isOpportunityZone
    ? 'text-emerald-400'
    : territory.isCrisisZone
    ? 'text-red-400'
    : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'rounded-2xl border backdrop-blur-md p-5 transition-all hover:scale-[1.01]',
        statusColor
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <h4 className="text-white font-bold text-sm">{territory.location}</h4>
          </div>
          <div className={cn('flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider', statusTextColor)}>
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-white">
            {territory.gapScore > 0 ? '+' : ''}{territory.gapScore}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Brecha</div>
        </div>
      </div>

      {/* Needs vs Resources bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
          <span>Necesidades: {territory.needIntensity}</span>
          <span>Recursos: {territory.resourceAvailability}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
          {territory.needIntensity + territory.resourceAvailability > 0 && (
            <>
              <div
                className="bg-gradient-to-r from-amber-500 to-red-500 rounded-l-full"
                style={{
                  width: `${(territory.needIntensity / (territory.needIntensity + territory.resourceAvailability)) * 100}%`,
                }}
              />
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-r-full"
                style={{
                  width: `${(territory.resourceAvailability / (territory.needIntensity + territory.resourceAvailability)) * 100}%`,
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Top needs */}
      {territory.topNeeds.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Necesidades principales</div>
          <div className="flex flex-wrap gap-1.5">
            {territory.topNeeds.map((need) => (
              <span
                key={need.theme}
                className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono"
              >
                {need.label} ({need.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Available resources */}
      {territory.availableResources.length > 0 && (
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Recursos disponibles</div>
          <div className="flex flex-wrap gap-1.5">
            {territory.availableResources.map((res) => (
              <span
                key={res.category}
                className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-mono"
              >
                {CATEGORY_LABELS[res.category] || res.category} ({res.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const GapAnalysisDashboard = () => {
  const { territories, globalGap, opportunityZones, crisisZones, isLoading } = useGapAnalysis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  const hasData = globalGap.totalNeeds > 0 || globalGap.totalResources > 0;

  return (
    <div className="space-y-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-bold font-mono text-white">{globalGap.totalNeeds}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Señales de Necesidad</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center"
        >
          <Wrench className="w-5 h-5 text-teal-400 mx-auto mb-2" />
          <div className="text-3xl font-bold font-mono text-white">{globalGap.totalResources}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Recursos Declarados</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 text-center"
        >
          <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <div className="text-3xl font-bold font-mono text-emerald-300">{opportunityZones.length}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Zonas de Oportunidad</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-5 text-center"
        >
          <Flame className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <div className="text-3xl font-bold font-mono text-red-300">{crisisZones.length}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Zonas Críticas</div>
        </motion.div>
      </div>

      {/* Global Theme Gaps */}
      {globalGap.topUnmetThemes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-1">Brechas Nacionales</h3>
          <p className="text-slate-500 text-xs mb-6">
            Temas con mayor necesidad no cubierta por los recursos disponibles
          </p>
          <div className="space-y-3">
            {globalGap.topUnmetThemes.map((theme, i) => {
              const maxGap = globalGap.topUnmetThemes[0]?.gap || 1;
              return (
                <div key={theme.theme} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 w-6">{i + 1}.</span>
                  <span className="text-sm text-slate-300 w-44 truncate">{theme.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${(theme.gap / maxGap) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-amber-400 w-8 text-right">+{theme.gap}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Opportunity Zones — where action can happen NOW */}
      {opportunityZones.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold">Zonas de Oportunidad</h3>
            <span className="text-emerald-400 text-xs font-mono ml-2">
              Necesidad + Recursos = Acción AHORA
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {opportunityZones.slice(0, 4).map((territory) => (
              <TerritoryCard key={territory.location} territory={territory} />
            ))}
          </div>
        </div>
      )}

      {/* Crisis Zones — need external help */}
      {crisisZones.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-bold">Zonas Críticas</h3>
            <span className="text-red-400 text-xs font-mono ml-2">
              Alta necesidad, pocos recursos — necesitan apoyo
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {crisisZones.slice(0, 4).map((territory) => (
              <TerritoryCard key={territory.location} territory={territory} />
            ))}
          </div>
        </div>
      )}

      {/* All territories */}
      {territories.length > 0 && !hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">
            Declarar tus necesidades y recursos en el mapa para activar el análisis de brechas.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            La brecha entre lo que necesitamos y lo que tenemos <strong>ES</strong> el plan de acción.
          </p>
        </motion.div>
      )}

      {!hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-teal-500/5 to-amber-500/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <Wrench className="w-6 h-6 text-teal-400" />
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">El Motor de Brechas</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Cuando declarás lo que <span className="text-amber-400 font-semibold">necesitás</span> y lo que{' '}
            <span className="text-teal-400 font-semibold">podés aportar</span>, el sistema identifica automáticamente
            dónde la acción es posible <span className="text-emerald-400 font-semibold">AHORA</span> y dónde se necesita
            ayuda urgente.
          </p>
          <p className="text-slate-600 text-xs mt-4 font-mono uppercase tracking-wider">
            La brecha entre necesidad y recurso ES el plan de acción
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GapAnalysisDashboard;
