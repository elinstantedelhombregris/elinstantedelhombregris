import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type {
  PublicIntelligencePriorityKind,
  PublicIntelligenceSnapshot,
  PublicIntelligenceState,
} from '@/civic/public-intelligence';
import { civicCategoryLabel } from '@/civic/labels';
import { staggerDelay } from '@/motion/variants';

import { GlassCard } from '../ui/GlassCard';
import { Pressable97 } from '../ui/Pressable97';

const PRIORITY_META: Record<PublicIntelligencePriorityKind, {
  color: string;
  icon: string;
  label: string;
}> = {
  protect: { color: '#FDA4AF', icon: 'shield-outline', label: 'Cuidado' },
  verify: { color: '#7DD3FC', icon: 'shield-checkmark-outline', label: 'Verificar' },
  coordinate: { color: '#6EE7B7', icon: 'git-merge-outline', label: 'Coordinar' },
  mobilize: { color: '#FDBA74', icon: 'megaphone-outline', label: 'Responder' },
  map_demand: { color: '#C4B5FD', icon: 'map-outline', label: 'Explorar demanda' },
  monitor: { color: '#94A3B8', icon: 'pulse-outline', label: 'Observar' },
};

const percentage = (value: number | null): string => value == null ? 'Sin denominador' : `${value}%`;

const readableDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const periodLabel = (period: PublicIntelligenceSnapshot['meta']['period']): string => {
  if (period === '7d') return 'últimos 7 días';
  if (period === '90d') return 'últimos 90 días';
  return 'últimos 30 días';
};

const precisionLabel = (
  precision: PublicIntelligenceSnapshot['report']['matchLeads'][number]['territory']['precision'],
): string => {
  if (precision === '100m') return 'radio de 100 m';
  if (precision === '500m') return 'radio de 500 m';
  if (precision === 'neighborhood') return 'escala de barrio';
  return 'escala de ciudad';
};

function SectionHeading({ eyebrow, title, description }: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <View className="mt-9">
      <Text className="font-sans text-[10px] uppercase tracking-[3px] text-slate-500">{eyebrow}</Text>
      <Text className="mt-2 font-serif text-[26px] leading-8 text-plata">{title}</Text>
      {description && <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{description}</Text>}
    </View>
  );
}

function NetworkMetric({ label, numerator, denominator, value, color, wide = false }: {
  label: string;
  numerator: number;
  denominator: number;
  value: number | null;
  color: string;
  wide?: boolean;
}) {
  const width = `${Math.max(0, Math.min(100, value ?? 0))}%` as `${number}%`;
  return (
    <GlassCard
      className="p-4"
      style={{ width: wide ? '100%' : '48.5%' }}
      accessible
      accessibilityLabel={denominator > 0
        ? `${label}: ${numerator} de ${denominator}, ${percentage(value)}`
        : `${label}: sin denominador`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-sans-medium text-[10px] uppercase tracking-[1.5px] text-slate-500">{label}</Text>
        <Text className="font-mono text-[10px] text-slate-500">{percentage(value)}</Text>
      </View>
      <View className="mt-3 flex-row items-end gap-1.5">
        <Text className="font-mono text-[25px] text-plata">{denominator > 0 ? numerator : '—'}</Text>
        <Text className="mb-1 font-mono text-xs text-slate-500">/ {denominator}</Text>
      </View>
      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <View className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </View>
    </GlassCard>
  );
}

function CategoryBar({ label, count, maximum, color }: {
  label: string;
  count: number;
  maximum: number;
  color: string;
}) {
  const width = `${Math.round((count / Math.max(1, maximum)) * 100)}%` as `${number}%`;
  return (
    <View className="mt-3" accessible accessibilityLabel={`${label}: ${count}`}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-sans text-[11px] text-slate-400">{label}</Text>
        <Text className="font-mono text-xs text-plata">{count}</Text>
      </View>
      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <View className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </View>
    </View>
  );
}

function StateCard({ state, onRetry, onUseLocal }: {
  state: Exclude<PublicIntelligenceState, { status: 'ready' }>;
  onRetry: () => void;
  onUseLocal: () => void;
}) {
  const content = state.status === 'idle'
    ? {
        icon: 'globe-outline',
        color: '#7DD3FC',
        title: 'La red pública es opcional.',
        message: 'La consulta sólo empieza cuando la pedís. Tu análisis local no se envía ni se combina con esta fuente.',
      }
    : state.status === 'loading'
      ? {
          icon: 'hourglass-outline',
          color: '#7DD3FC',
          title: 'Consultando la proyección protegida…',
          message: 'Validamos contrato, fuente, período y salvaguardas antes de mostrar un solo valor.',
        }
      : state.status === 'not_configured'
        ? {
            icon: 'unlink-outline',
            color: '#94A3B8',
            title: 'Red no configurada.',
            message: state.message,
          }
        : state.status === 'offline'
          ? {
              icon: 'cloud-offline-outline',
              color: '#FCD34D',
              title: 'Seguís teniendo inteligencia local.',
              message: state.message,
            }
          : state.status === 'invalid'
            ? {
                icon: 'shield-outline',
                color: '#FDA4AF',
                title: 'Respuesta no verificable.',
                message: state.message,
              }
            : {
                icon: 'alert-circle-outline',
                color: '#FCD34D',
                title: 'La red pública no respondió.',
                message: state.message,
              };
  const canRetry = !['loading', 'not_configured'].includes(state.status);
  return (
    <GlassCard className="mt-6 items-center p-7">
      <View className="h-16 w-16 items-center justify-center rounded-full border" style={{ borderColor: `${content.color}30`, backgroundColor: `${content.color}0C` }}>
        <Ionicons name={content.icon as never} size={27} color={content.color} />
      </View>
      <Text className="mt-5 text-center font-serif text-[27px] leading-9 text-plata">{content.title}</Text>
      <Text accessibilityLiveRegion="polite" className="mt-3 max-w-[320px] text-center font-sans text-sm leading-6 text-slate-400">{content.message}</Text>
      {state.status !== 'loading' && (
        <View className="mt-6 flex-row flex-wrap justify-center gap-3">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver a la lectura local"
            onPress={onUseLocal}
            className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
          >
            <Text className="font-sans-semibold text-xs text-slate-200">Usar lectura local</Text>
          </Pressable97>
          {canRetry && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={state.status === 'idle' ? 'Consultar red pública' : 'Reintentar consulta pública'}
              onPress={onRetry}
              className="min-h-12 items-center justify-center rounded-full bg-accent px-5"
            >
              <Text className="font-sans-semibold text-xs text-white">{state.status === 'idle' ? 'Consultar red' : 'Reintentar'}</Text>
            </Pressable97>
          )}
        </View>
      )}
    </GlassCard>
  );
}

function ReadyReport({ snapshot, onRetry }: {
  snapshot: PublicIntelligenceSnapshot;
  onRetry: () => void;
}) {
  const { meta, report } = snapshot;
  const totalCoverageGroups = report.evaluation.groupsWithMeasuredCoverage
    + report.evaluation.groupsWithoutMeasuredCoverage;
  const measuredCoveragePct = totalCoverageGroups > 0
    ? Math.round((report.evaluation.groupsWithMeasuredCoverage / totalCoverageGroups) * 100)
    : null;
  const maximumCategory = Math.max(
    1,
    ...report.categories.flatMap((row) => [row.openNeeds, row.availableResources]),
  );

  return (
    <>
      <GlassCard className="mt-6 overflow-hidden p-0">
        <View className="border-b border-sky-300/10 bg-sky-300/[0.05] p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-sky-300/10">
              <Ionicons name="globe-outline" size={20} color="#7DD3FC" />
            </View>
            <View className="flex-1">
              <Text className="font-sans text-[9px] uppercase tracking-[2px] text-sky-300">Fuente separada</Text>
              <Text className="mt-1 font-serif text-xl leading-7 text-plata">La Radiografía pública protegida</Text>
            </View>
          </View>
          <Text className="mt-4 font-sans text-xs leading-5 text-slate-400">
            Proyección agregada de {periodLabel(meta.period)}. No contiene eventos crudos y no incorpora tu informe local.
          </Text>
        </View>
        <View className="gap-3 p-5">
          {[
            ['Período', `${readableDate(meta.since)} → ${readableDate(meta.generatedAt)}`],
            ['Contrato', meta.contract],
            ['Fuente', meta.sourceContract],
            ['Generado', readableDate(meta.generatedAt)],
          ].map(([label, value]) => (
            <View key={label} className="flex-row items-start justify-between gap-4">
              <Text className="font-sans text-[10px] uppercase tracking-[1.4px] text-slate-600">{label}</Text>
              <Text className="max-w-[68%] text-right font-mono text-[10px] leading-4 text-slate-400">{value}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <SectionHeading
        eyebrow="Privacidad de la fuente"
        title="Lo que tuvo que ocurrir antes de aparecer"
        description="Un grupo pequeño no se publica. Su ausencia no se presenta como cero."
      />
      <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
        {[
          [meta.minimumDistinctSourceContributors, 'fuentes distintas mínimas', 'people-outline', '#6EE7B7'],
          [meta.smallGroupsSuppressed, 'grupos suprimidos', 'eye-off-outline', '#FCD34D'],
          [report.overview.publishedGroups, 'grupos publicados', 'layers-outline', '#7DD3FC'],
          [meta.truncated ? 'sí' : 'no', 'lectura truncada', 'cut-outline', meta.truncated ? '#FDA4AF' : '#94A3B8'],
        ].map(([value, label, icon, color]) => (
          <GlassCard key={label as string} className="p-4" style={{ width: '48.5%' }} accessible accessibilityLabel={`${label}: ${value}`}>
            <Ionicons name={icon as never} size={17} color={color as string} />
            <Text className="mt-3 font-mono text-xl text-plata">{value}</Text>
            <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">{label}</Text>
          </GlassCard>
        ))}
      </View>

      <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
        <Ionicons name={meta.truncated ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={18} color={meta.truncated ? '#FDA4AF' : '#FCD34D'} />
        <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">
          {meta.truncated
            ? 'Lectura parcial: la fuente alcanzó su límite de eventos. No debe compararse como si cubriera todo el período.'
            : `La fuente no declaró truncamiento. ${meta.smallGroupsSuppressed} grupos quedaron fuera por no alcanzar el umbral de privacidad; no equivalen a ausencia de actividad.`}
        </Text>
      </View>

      {report.overview.publishedGroups === 0 ? (
        <GlassCard className="mt-7 items-center p-7">
          <Ionicons name="eye-off-outline" size={28} color="#94A3B8" />
          <Text className="mt-4 text-center font-serif text-2xl text-plata">Nada superó el umbral público.</Text>
          <Text className="mt-2 max-w-[310px] text-center font-sans text-xs leading-5 text-slate-400">No significa que no existan voces o necesidades: los grupos pequeños permanecen suprimidos para proteger a quienes aportaron.</Text>
        </GlassCard>
      ) : (
        <>
          <SectionHeading
            eyebrow="Lectura pública"
            title="Calidad, resolución y cobertura declarada"
            description={report.evaluation.qualityStatement}
          />
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            <NetworkMetric
              label="Corroboración"
              numerator={report.overview.corroboratedSignals}
              denominator={report.overview.observedSignals}
              value={report.overview.verificationRatePct}
              color="#7DD3FC"
            />
            <NetworkMetric
              label="Resolución"
              numerator={report.overview.resolvedNeeds}
              denominator={report.overview.openNeeds + report.overview.resolvedNeeds}
              value={report.overview.resolutionRatePct}
              color="#6EE7B7"
            />
            <NetworkMetric
              label="Grupos con cobertura medida"
              numerator={report.evaluation.groupsWithMeasuredCoverage}
              denominator={totalCoverageGroups}
              value={measuredCoveragePct}
              color="#C4B5FD"
              wide
            />
          </View>

          <SectionHeading
            eyebrow="Prioridades públicas"
            title="Orden de trabajo, no mandato"
            description="Estas prioridades explican evidencia y próximos pasos; no abren una acción local porque la proyección pública no revela registros ni personas."
          />
          {report.priorities.length > 0 ? (
            <View className="mt-4 gap-3">
              {report.priorities.map((priority, index) => {
                const priorityMeta = PRIORITY_META[priority.kind];
                return (
                  <Animated.View key={priority.id} entering={staggerDelay(Math.min(index, 8))}>
                    <GlassCard className="p-5">
                      <View className="flex-row items-start gap-3">
                        <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${priorityMeta.color}18` }}>
                          <Ionicons name={priorityMeta.icon as never} size={20} color={priorityMeta.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-sans text-[9px] uppercase tracking-[1.7px]" style={{ color: priorityMeta.color }}>#{priority.rank} · {priorityMeta.label}</Text>
                          <Text className="mt-2 font-serif text-xl leading-7 text-plata">{priority.title}</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">{priority.territory.label ?? `territorio a ${precisionLabel(priority.territory.precision)}`}</Text>
                        </View>
                      </View>
                      <Text className="mt-4 font-sans text-xs leading-5 text-slate-400">{priority.explanation}</Text>
                      <View className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <Text className="font-sans text-[10px] uppercase tracking-[1.5px] text-slate-600">Evidencia del grupo</Text>
                        <Text className="mt-2 font-mono text-[10px] leading-5 text-slate-400">
                          {priority.evidence.corroborated} corroboradas · {priority.evidence.needsReview} por revisar · {priority.evidence.openNeeds} necesidades · {priority.evidence.availableResources} recursos
                        </Text>
                      </View>
                      <View className="mt-4 gap-2 border-t border-white/[0.06] pt-4">
                        {priority.nextActions.slice(0, 3).map((action) => (
                          <View key={action} className="flex-row items-start gap-2">
                            <Ionicons name="arrow-forward" size={14} color="#64748B" />
                            <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">{action}</Text>
                          </View>
                        ))}
                      </View>
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <GlassCard className="mt-4 p-6">
              <Text className="font-serif text-xl text-plata">Sin prioridades publicables.</Text>
              <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">La proyección protegida no derivó trabajo prioritario para este período.</Text>
            </GlassCard>
          )}

          {report.matchLeads.length > 0 && (
            <>
              <SectionHeading
                eyebrow="Oportunidades protegidas"
                title="Coinciden asunto y territorio público"
                description="No son asignaciones. La distancia real, cantidad, vigencia y voluntad de ambas partes todavía necesitan confirmación privada."
              />
              <View className="mt-4 gap-3">
                {report.matchLeads.map((lead, index) => (
                  <Animated.View key={lead.id} entering={staggerDelay(Math.min(index, 8))}>
                    <GlassCard className="p-5">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-sans text-[9px] uppercase tracking-[1.8px] text-emerald-300">Posibilidad agregada</Text>
                          <Text className="mt-2 font-serif text-xl text-plata">{civicCategoryLabel(lead.category)}</Text>
                          <Text className="mt-1 font-sans text-xs text-slate-400">{lead.territory.label} · {precisionLabel(lead.territory.precision)}</Text>
                        </View>
                        <View className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5">
                          <Text className="font-mono text-[9px] text-emerald-200">≤ {lead.potentialBridges}</Text>
                        </View>
                      </View>
                      <Text className="mt-4 font-mono text-[10px] text-slate-400">{lead.openNeeds} necesidades · {lead.availableResources} recursos</Text>
                      <Text className="mt-3 font-sans text-[11px] leading-5 text-slate-500">{lead.explanation}</Text>
                      <View className="mt-4 flex-row items-start gap-2 border-t border-white/[0.06] pt-4">
                        <Ionicons name="people-outline" size={15} color="#64748B" />
                        <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">Requiere confirmación humana; por eso esta tarjeta no abre una conexión automática.</Text>
                      </View>
                    </GlassCard>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          <SectionHeading
            eyebrow="Balance público"
            title="Necesidades y capacidades por asunto"
            description="Escala común entre categorías; los grupos suprimidos no participan de estas barras."
          />
          {report.categories.length > 0 ? (
            <View className="mt-4 gap-3">
              {report.categories.map((category) => (
                <GlassCard key={category.category} className="p-5">
                  <Text className="font-serif text-xl text-plata">{civicCategoryLabel(category.category)}</Text>
                  <Text className="mt-1 font-sans text-[10px] text-slate-500">{category.groups} grupos · {category.observedSignals} señales · {category.corroboratedSignals} corroboradas</Text>
                  <CategoryBar label="Necesidades abiertas" count={category.openNeeds} maximum={maximumCategory} color="#FCD34D" />
                  <CategoryBar label="Recursos disponibles" count={category.availableResources} maximum={maximumCategory} color="#6EE7B7" />
                </GlassCard>
              ))}
            </View>
          ) : (
            <GlassCard className="mt-4 p-6">
              <Text className="font-serif text-xl text-plata">Sin categorías publicables.</Text>
              <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">Ningún balance superó las salvaguardas de publicación en este período.</Text>
            </GlassCard>
          )}
        </>
      )}

      <SectionHeading
        eyebrow="Límites de esta fuente"
        title="Qué no puede concluirse"
        description="La red entrega estas restricciones dentro del mismo contrato que los valores."
      />
      <View className="mt-4 gap-2.5">
        {report.evaluation.interpretationLimits.map((limit, index) => (
          <View key={limit} className="flex-row items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white/[0.05]">
              <Text className="font-mono text-[10px] text-slate-500">{index + 1}</Text>
            </View>
            <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">{limit}</Text>
          </View>
        ))}
      </View>

      <View className="mt-7 flex-row items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
        <Ionicons name="people-outline" size={17} color="#6EE7B7" />
        <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">Apoyo a decisiones, no verdad automática ni mandato vinculante. Toda acción necesita deliberación humana.</Text>
      </View>

      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Actualizar lectura de la red pública"
        onPress={onRetry}
        className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-5"
      >
        <Ionicons name="refresh-outline" size={16} color="#7DD3FC" />
        <Text className="font-sans-semibold text-xs text-sky-200">Actualizar esta fuente</Text>
      </Pressable97>
    </>
  );
}

export function PublicIntelligencePanel({ state, onRetry, onUseLocal }: {
  state: PublicIntelligenceState;
  onRetry: () => void;
  onUseLocal: () => void;
}) {
  return state.status === 'ready'
    ? <ReadyReport snapshot={state.snapshot} onRetry={onRetry} />
    : <StateCard state={state} onRetry={onRetry} onUseLocal={onUseLocal} />;
}
