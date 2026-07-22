/**
 * PublicIntelligencePanel — la Radiografía pública protegida: la lectura
 * agregada de la red, con sus salvaguardas de privacidad como primera
 * ciudadana (umbrales, supresión, truncamiento, límites de interpretación).
 *
 * Registro papel del sistema Papel y Tinta (spec §8/§14): éste es un
 * DOCUMENTO — el único lugar del juego donde las barras de datos viven,
 * y viven cuadradas, sobre papel presionado, en colores de token.
 */

import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type {
  PublicIntelligencePriorityKind,
  PublicIntelligenceSnapshot,
  PublicIntelligenceState,
} from '@/civic/public-intelligence';
import { civicCategoryLabel } from '@/civic/labels';
import { staggerDelay } from '@/motion/variants';
import { AMBAR_PT, CIAN, ROJO_SELLO, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

import { BotonTinta, Kicker, PapelCard, TituloAnton } from '../papel';

const PRIORITY_META: Record<PublicIntelligencePriorityKind, {
  color: string;
  label: string;
}> = {
  protect: { color: ROJO_SELLO, label: 'Cuidado' },
  verify: { color: CIAN, label: 'Verificar' },
  coordinate: { color: VERDE, label: 'Coordinar' },
  mobilize: { color: AMBAR_PT, label: 'Responder' },
  map_demand: { color: VIOLETA, label: 'Explorar demanda' },
  monitor: { color: TINTA_50, label: 'Observar' },
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
      <Kicker tono="neutro">{eyebrow}</Kicker>
      <TituloAnton tamano="md" className="mt-2">
        {title}
      </TituloAnton>
      {description && <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{description}</Text>}
    </View>
  );
}

/** Barra de documento (spec §14): cuadrada, sobre papel presionado. */
function BarraDocumento({ value, color }: { value: number | null; color: string }) {
  const width = `${Math.max(0, Math.min(100, value ?? 0))}%` as `${number}%`;
  return (
    <View className="h-1.5 bg-papel-presionado">
      <View className="h-full" style={{ width, backgroundColor: color }} />
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
  return (
    <PapelCard
      variante="suave"
      className="p-4"
      style={{ width: wide ? '100%' : '48.5%' }}
      accessible
      accessibilityLabel={denominator > 0
        ? `${label}: ${numerator} de ${denominator}, ${percentage(value)}`
        : `${label}: sin denominador`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">{label}</Text>
        <Text className="font-space text-[10px] text-tinta-50">{percentage(value)}</Text>
      </View>
      <View className="mt-3 flex-row items-end gap-1.5">
        <Text className="font-space text-[25px] text-tinta">{denominator > 0 ? numerator : '—'}</Text>
        <Text className="mb-1 font-space text-xs text-tinta-50">/ {denominator}</Text>
      </View>
      <View className="mt-3">
        <BarraDocumento value={value} color={color} />
      </View>
    </PapelCard>
  );
}

function CategoryBar({ label, count, maximum, color }: {
  label: string;
  count: number;
  maximum: number;
  color: string;
}) {
  const pct = Math.round((count / Math.max(1, maximum)) * 100);
  return (
    <View className="mt-3" accessible accessibilityLabel={`${label}: ${count}`}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-archivo text-[11px] text-tinta-75">{label}</Text>
        <Text className="font-space text-xs text-tinta">{count}</Text>
      </View>
      <View className="mt-2">
        <BarraDocumento value={pct} color={color} />
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
        title: 'La red pública es opcional.',
        message: 'La consulta sólo empieza cuando la pedís. Tu análisis local no se envía ni se combina con esta fuente.',
      }
    : state.status === 'loading'
      ? {
          title: 'Consultando la proyección protegida…',
          message: 'Validamos contrato, fuente, período y salvaguardas antes de mostrar un solo valor.',
        }
      : state.status === 'not_configured'
        ? {
            title: 'Red no configurada.',
            message: state.message,
          }
        : state.status === 'offline'
          ? {
              title: 'Seguís teniendo inteligencia local.',
              message: state.message,
            }
          : state.status === 'invalid'
            ? {
                title: 'Respuesta no verificable.',
                message: state.message,
              }
            : {
                title: 'La red pública no respondió.',
                message: state.message,
              };
  const canRetry = !['loading', 'not_configured'].includes(state.status);
  return (
    <PapelCard className="mt-6 p-7">
      <TituloAnton tamano="md">{content.title}</TituloAnton>
      <Text accessibilityLiveRegion="polite" className="mt-3 font-archivo text-sm leading-6 text-tinta-75">{content.message}</Text>
      {state.status !== 'loading' && (
        <View className="mt-6 flex-row flex-wrap gap-3">
          <BotonTinta
            etiqueta="Usar lectura local"
            variante="fantasma"
            tamano="compacto"
            accessibilityLabel="Volver a la lectura local"
            onPress={onUseLocal}
          />
          {canRetry && (
            <BotonTinta
              etiqueta={state.status === 'idle' ? 'Consultar red' : 'Reintentar'}
              tamano="compacto"
              accessibilityLabel={state.status === 'idle' ? 'Consultar red pública' : 'Reintentar consulta pública'}
              onPress={onRetry}
            />
          )}
        </View>
      )}
    </PapelCard>
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
      <PapelCard className="mt-6 p-0">
        <View className="border-b border-tinta p-5">
          <Kicker style={{ color: CIAN }}>Fuente separada</Kicker>
          <TituloAnton tamano="md" className="mt-2">
            La Radiografía pública protegida
          </TituloAnton>
          <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">
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
              <Text className="font-space text-[10px] uppercase tracking-[1.4px] text-tinta-50">{label}</Text>
              <Text className="max-w-[68%] text-right font-space text-[10px] leading-4 text-tinta-75">{value}</Text>
            </View>
          ))}
        </View>
      </PapelCard>

      <SectionHeading
        eyebrow="Privacidad de la fuente"
        title="Lo que tuvo que ocurrir antes de aparecer"
        description="Un grupo pequeño no se publica. Su ausencia no se presenta como cero."
      />
      <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
        {[
          [meta.minimumDistinctSourceContributors, 'fuentes distintas mínimas'],
          [meta.smallGroupsSuppressed, 'grupos suprimidos'],
          [report.overview.publishedGroups, 'grupos publicados'],
          [meta.truncated ? 'sí' : 'no', 'lectura truncada'],
        ].map(([value, label]) => (
          <PapelCard key={label as string} variante="suave" className="p-4" style={{ width: '48.5%' }} accessible accessibilityLabel={`${label}: ${value}`}>
            <Text className="font-space text-xl text-tinta">{value}</Text>
            <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{label}</Text>
          </PapelCard>
        ))}
      </View>

      <View className="mt-4 border border-ambar bg-papel-crudo p-4">
        <Text className="font-archivo text-[11px] leading-5 text-tinta-75">
          {meta.truncated
            ? 'Lectura parcial: la fuente alcanzó su límite de eventos. No debe compararse como si cubriera todo el período.'
            : `La fuente no declaró truncamiento. ${meta.smallGroupsSuppressed} grupos quedaron fuera por no alcanzar el umbral de privacidad; no equivalen a ausencia de actividad.`}
        </Text>
      </View>

      {report.overview.publishedGroups === 0 ? (
        <PapelCard className="mt-7 p-7">
          <TituloAnton tamano="md">Nada superó el umbral público.</TituloAnton>
          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">No significa que no existan voces o necesidades: los grupos pequeños permanecen suprimidos para proteger a quienes aportaron.</Text>
        </PapelCard>
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
              color={CIAN}
            />
            <NetworkMetric
              label="Resolución"
              numerator={report.overview.resolvedNeeds}
              denominator={report.overview.openNeeds + report.overview.resolvedNeeds}
              value={report.overview.resolutionRatePct}
              color={VERDE}
            />
            <NetworkMetric
              label="Grupos con cobertura medida"
              numerator={report.evaluation.groupsWithMeasuredCoverage}
              denominator={totalCoverageGroups}
              value={measuredCoveragePct}
              color={VIOLETA}
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
                    <PapelCard className="p-5">
                      <Text className="font-space text-[9px] uppercase tracking-[1.7px]" style={{ color: priorityMeta.color }}>#{priority.rank} · {priorityMeta.label}</Text>
                      <Text className="mt-2 font-archivo-bold text-base leading-6 text-tinta">{priority.title}</Text>
                      <Text className="mt-1 font-space text-[10px] text-tinta-50">{priority.territory.label ?? `territorio a ${precisionLabel(priority.territory.precision)}`}</Text>
                      <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">{priority.explanation}</Text>
                      <View className="mt-4 bg-papel-presionado p-4">
                        <Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">Evidencia del grupo</Text>
                        <Text className="mt-2 font-space text-[10px] leading-5 text-tinta-75">
                          {priority.evidence.corroborated} corroboradas · {priority.evidence.needsReview} por revisar · {priority.evidence.openNeeds} necesidades · {priority.evidence.availableResources} recursos
                        </Text>
                      </View>
                      <View className="mt-4 gap-2 border-t border-bordeSuave pt-4">
                        {priority.nextActions.slice(0, 3).map((action) => (
                          <View key={action} className="flex-row items-start gap-2">
                            <Text className="font-space text-xs text-tinta-30">→</Text>
                            <Text className="flex-1 font-archivo text-[11px] leading-5 text-tinta-75">{action}</Text>
                          </View>
                        ))}
                      </View>
                    </PapelCard>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <PapelCard className="mt-4 p-6">
              <Text className="font-archivo-bold text-base text-tinta">Sin prioridades publicables.</Text>
              <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">La proyección protegida no derivó trabajo prioritario para este período.</Text>
            </PapelCard>
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
                    <PapelCard className="p-5">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-space text-[9px] uppercase tracking-[1.8px] text-verde">Posibilidad agregada</Text>
                          <Text className="mt-2 font-archivo-bold text-base text-tinta">{civicCategoryLabel(lead.category)}</Text>
                          <Text className="mt-1 font-archivo text-xs text-tinta-75">{lead.territory.label} · {precisionLabel(lead.territory.precision)}</Text>
                        </View>
                        <View className="border border-verde px-3 py-1.5">
                          <Text className="font-space text-[9px] text-verde">≤ {lead.potentialBridges}</Text>
                        </View>
                      </View>
                      <Text className="mt-4 font-space text-[10px] text-tinta-75">{lead.openNeeds} necesidades · {lead.availableResources} recursos</Text>
                      <Text className="mt-3 font-archivo text-[11px] leading-5 text-tinta-50">{lead.explanation}</Text>
                      <Text className="mt-4 border-t border-bordeSuave pt-4 font-archivo text-[11px] leading-5 text-tinta-50">Requiere confirmación humana; por eso esta tarjeta no abre una conexión automática.</Text>
                    </PapelCard>
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
                <PapelCard key={category.category} className="p-5">
                  <Text className="font-archivo-bold text-base text-tinta">{civicCategoryLabel(category.category)}</Text>
                  <Text className="mt-1 font-space text-[10px] text-tinta-50">{category.groups} grupos · {category.observedSignals} señales · {category.corroboratedSignals} corroboradas</Text>
                  <CategoryBar label="Necesidades abiertas" count={category.openNeeds} maximum={maximumCategory} color={AMBAR_PT} />
                  <CategoryBar label="Recursos disponibles" count={category.availableResources} maximum={maximumCategory} color={VERDE} />
                </PapelCard>
              ))}
            </View>
          ) : (
            <PapelCard className="mt-4 p-6">
              <Text className="font-archivo-bold text-base text-tinta">Sin categorías publicables.</Text>
              <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">Ningún balance superó las salvaguardas de publicación en este período.</Text>
            </PapelCard>
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
          <View key={limit} className="flex-row items-baseline gap-3 border border-bordeSuave bg-papel-crudo p-4">
            <Text className="font-space text-[10px] text-tinta-30">{String(index + 1).padStart(2, '0')}</Text>
            <Text className="flex-1 font-archivo text-[11px] leading-5 text-tinta-75">{limit}</Text>
          </View>
        ))}
      </View>

      <View className="mt-7 border border-verde bg-papel-crudo p-4">
        <Text className="font-archivo text-[11px] leading-5 text-tinta-75">Apoyo a decisiones, no verdad automática ni mandato vinculante. Toda acción necesita deliberación humana.</Text>
      </View>

      <View className="mt-5 items-center">
        <BotonTinta
          etiqueta="Actualizar esta fuente"
          variante="fantasma"
          tamano="compacto"
          accessibilityLabel="Actualizar lectura de la red pública"
          onPress={onRetry}
        />
      </View>
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
