import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { PublicIntelligencePanel } from '@/components/civic/PublicIntelligencePanel';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  buildLocalCivicAnalytics,
  type LocalCivicAnalyticsReport,
  type LocalPriorityKind,
  type LocalPriorityRoute,
} from '@/civic/analytics';
import { civicCategoryLabel } from '@/civic/labels';
import { publicCommunityFetch } from '@/civic/community-auth';
import { cellsForMission, missionsAll } from '@/civic/missions';
import {
  loadPublicCivicIntelligence,
  type PublicIntelligenceState,
} from '@/civic/public-intelligence';
import {
  actionsAll,
  matchesAll,
  needsAll,
  observationsAll,
  observationsToVerify,
  resourcesAll,
} from '@/civic/repo';
import { fadeUp, staggerDelay } from '@/motion/variants';

const EMPTY_REPORT = buildLocalCivicAnalytics({
  observations: [],
  needs: [],
  resources: [],
  matches: [],
  actions: [],
  missions: [],
});

const PRIORITY_META: Record<LocalPriorityKind, { color: string; icon: string; label: string }> = {
  protect: { color: '#FDA4AF', icon: 'shield-outline', label: 'Cuidado' },
  verify: { color: '#7DD3FC', icon: 'shield-checkmark-outline', label: 'Calidad' },
  refresh: { color: '#FCD34D', icon: 'time-outline', label: 'Vigencia' },
  cover: { color: '#C4B5FD', icon: 'map-outline', label: 'Cobertura' },
  coordinate: { color: '#6EE7B7', icon: 'git-merge-outline', label: 'Conexión' },
  mobilize: { color: '#FDBA74', icon: 'megaphone-outline', label: 'Convocatoria' },
  follow_through: { color: '#93C5FD', icon: 'footsteps-outline', label: 'Seguimiento' },
};

const percentLabel = (value: number | null): string => value == null ? 'Sin denominador' : `${value}%`;

const displayTime = (value: string): string => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

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

function RatioCard({
  title,
  icon,
  color,
  numerator,
  denominator,
  percent,
  detail,
}: {
  title: string;
  icon: string;
  color: string;
  numerator: number;
  denominator: number;
  percent: number | null;
  detail: string;
}) {
  const width = `${Math.max(0, Math.min(100, percent ?? 0))}%` as `${number}%`;
  const accessible = denominator > 0
    ? `${title}: ${numerator} de ${denominator}, ${percentLabel(percent)}. ${detail}`
    : `${title}: sin denominador. ${detail}`;
  return (
    <GlassCard className="p-4" style={{ width: '48.5%' }} accessible accessibilityLabel={accessible}>
      <View className="flex-row items-center justify-between gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <Ionicons name={icon as never} size={17} color={color} />
        </View>
        <Text className="font-mono text-[10px] text-slate-500">{percentLabel(percent)}</Text>
      </View>
      <Text className="mt-4 font-sans-medium text-[10px] uppercase tracking-[1.7px] text-slate-500">{title}</Text>
      <View className="mt-2 flex-row items-end gap-1.5">
        <Text className="font-mono text-[25px] text-plata">{denominator > 0 ? numerator : '—'}</Text>
        <Text className="mb-1 font-mono text-xs text-slate-500">/ {denominator}</Text>
      </View>
      <View
        accessible={false}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <View className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </View>
      <Text className="mt-3 font-sans text-[10px] leading-4 text-slate-500">{detail}</Text>
    </GlassCard>
  );
}

function ActionPortal({
  title,
  detail,
  icon,
  color,
  route,
  onOpen,
}: {
  title: string;
  detail: string;
  icon: string;
  color: string;
  route: LocalPriorityRoute;
  onOpen: (route: LocalPriorityRoute) => void;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={() => onOpen(route)}
      className="min-h-[96px] flex-1 items-center justify-center rounded-2xl border px-2 py-3"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}0C` }}
    >
      <Ionicons name={icon as never} size={19} color={color} />
      <Text className="mt-3 text-center font-sans-semibold text-[11px] text-plata">{title}</Text>
      <Text className="mt-1 text-center font-mono text-[9px] leading-4 text-slate-500">{detail}</Text>
    </Pressable97>
  );
}

function CountBar({ label, count, maximum, color }: {
  label: string;
  count: number;
  maximum: number;
  color: string;
}) {
  const percent = maximum > 0 ? Math.round((count / maximum) * 100) : 0;
  const width = `${Math.max(0, Math.min(100, percent))}%` as `${number}%`;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${count}`}
      className="mt-3"
    >
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

const readLocalReport = (): LocalCivicAnalyticsReport => {
  const missions = missionsAll();
  return buildLocalCivicAnalytics({
    observations: observationsAll(),
    needs: needsAll(),
    resources: resourcesAll(),
    matches: matchesAll(),
    actions: actionsAll(),
    missions: missions.map((mission) => ({
      id: mission.id,
      status: mission.status,
      plannedCells: mission.plannedCells,
      cells: cellsForMission(mission.id),
    })),
    // Sólo las señales importadas pueden ser corroboradas por este dispositivo;
    // las propias necesitan una mirada independiente en otra instalación.
    verificationQueueIds: observationsToVerify()
      .filter((observation) => observation.creatorKey?.startsWith('remote:'))
      .map((observation) => observation.id),
  });
};

export default function InteligenciaTerritorial() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<LocalCivicAnalyticsReport>(EMPTY_REPORT);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toISOString());
  const [source, setSource] = useState<'local' | 'public'>('local');
  const [publicState, setPublicState] = useState<PublicIntelligenceState>({ status: 'idle' });
  const publicRequest = useRef(0);

  const refresh = useCallback(() => {
    setReport(readLocalReport());
    setUpdatedAt(new Date().toISOString());
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  const loadPublic = useCallback(async () => {
    const request = publicRequest.current + 1;
    publicRequest.current = request;
    setPublicState({ status: 'loading' });
    const next = await loadPublicCivicIntelligence('30d', publicCommunityFetch);
    if (publicRequest.current === request) setPublicState(next);
  }, []);

  const useLocal = () => {
    setSource('local');
  };

  const usePublic = () => {
    setSource('public');
    if (publicState.status === 'idle') void loadPublic();
  };

  const open = (route: LocalPriorityRoute) => router.push(route as never);
  const possibleBridges = report.categories.reduce((total, row) => total + row.potentialBridges, 0);
  const maxCategoryCount = Math.max(
    1,
    ...report.categories.flatMap((row) => [row.openNeeds, row.availableResources]),
  );
  const hasEvidence = report.quality.fieldSignals > 0
    || report.response.consideredNeeds > 0
    || report.response.availableResources > 0
    || report.coverage.plannedCells > 0
    || report.response.proposedMatches > 0
    || report.response.activeMatches > 0;
  const publicSnapshot = publicState.status === 'ready' ? publicState.snapshot : null;
  const heroStats: readonly (readonly [number | string, string])[] = source === 'local'
    ? [
        [report.quality.fieldSignals, 'señales'],
        [report.response.openNeeds, 'abiertas'],
        [report.response.availableResources, 'recursos'],
      ]
    : [
        [publicSnapshot?.report.overview.publishedGroups ?? '—', 'grupos'],
        [publicSnapshot?.report.overview.openNeeds ?? '—', 'abiertas'],
        [publicSnapshot?.report.overview.availableResources ?? '—', 'recursos'],
      ];

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Inteligencia" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 44 }}
      >
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[28px] border border-sky-300/20">
          <LinearGradient
            colors={['#101B29', '#0E1019', '#090909']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22, minHeight: 250 }}
          >
            <LivingHalo color="#38BDF8" />
            <View className="flex-row items-center justify-between gap-3">
              <View className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5">
                <Text className="font-sans-medium text-[9px] uppercase tracking-[2px] text-sky-200">
                  {source === 'local' ? 'Esta instalación · funciona offline' : 'Red pública protegida · 30 días'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <Text className="font-mono text-[9px] text-slate-500">
                  {source === 'local'
                    ? displayTime(updatedAt)
                    : publicSnapshot
                      ? displayTime(publicSnapshot.meta.generatedAt)
                      : 'OPCIONAL'}
                </Text>
              </View>
            </View>
            <Text className="mt-6 max-w-[330px] font-serif text-[32px] leading-[39px] text-plata">
              {source === 'local' ? 'Lo que sabemos. Lo que todavía no.' : 'La Radiografía de la red.'}
            </Text>
            <Text className="mt-3 max-w-[340px] font-sans text-sm leading-6 text-slate-400">
              {source === 'local'
                ? 'Evalúa evidencia, respuesta y cobertura sin convertir participación en verdad automática ni en un falso censo.'
                : 'Una lectura separada, agregada y protegida por umbral. Nunca reemplaza ni absorbe el informe de este dispositivo.'}
            </Text>
            <View className="mt-6 flex-row gap-6">
              {heroStats.map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-mono text-xl text-plata">{value}</Text>
                  <Text className="mt-0.5 font-sans text-[9px] uppercase tracking-[1.5px] text-slate-500">{label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        <View className="mt-4 flex-row rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <Pressable97
            accessibilityRole="tab"
            accessibilityLabel="Leer datos de esta instalación"
            accessibilityState={{ selected: source === 'local' }}
            onPress={useLocal}
            className="min-h-12 flex-1 items-center justify-center rounded-xl px-3"
            style={{ backgroundColor: source === 'local' ? '#FFFFFF12' : 'transparent' }}
          >
            <Text className="font-sans-semibold text-xs" style={{ color: source === 'local' ? '#F5F7FA' : '#64748B' }}>Esta instalación</Text>
            <Text className="mt-1 font-sans text-[9px] text-slate-500">offline · operativo</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="tab"
            accessibilityLabel="Consultar red pública protegida de los últimos 30 días"
            accessibilityState={{ selected: source === 'public' }}
            onPress={usePublic}
            className="min-h-12 flex-1 items-center justify-center rounded-xl px-3"
            style={{ backgroundColor: source === 'public' ? '#38BDF814' : 'transparent' }}
          >
            <Text className="font-sans-semibold text-xs" style={{ color: source === 'public' ? '#BAE6FD' : '#64748B' }}>Red pública</Text>
            <Text className="mt-1 font-sans text-[9px] text-slate-500">protegida · 30 días</Text>
          </Pressable97>
        </View>
        <Text className="mt-2 text-center font-sans text-[10px] leading-4 text-slate-600">Las fuentes se alternan: sus cifras nunca se suman ni se fusionan.</Text>

        {source === 'local' ? (
          <>
        <View className="mt-4 flex-row gap-2">
          {report.quality.needsReview > 0 && (
            <ActionPortal
              title="Corroborar"
              detail={`${report.quality.needsReview} por mirar`}
              icon="shield-checkmark-outline"
              color="#7DD3FC"
              route="/verificar"
              onOpen={open}
            />
          )}
          {(possibleBridges > 0 || report.response.activeMatches + report.response.proposedMatches > 0) && (
            <ActionPortal
              title="Conectar"
              detail={possibleBridges > 0 ? `${possibleBridges} por evaluar` : `${report.response.activeMatches + report.response.proposedMatches} en marcha`}
              icon="git-merge-outline"
              color="#6EE7B7"
              route="/conectar"
              onOpen={open}
            />
          )}
          <ActionPortal
            title="Misiones"
            detail={report.coverage.plannedCells > 0 ? `${report.coverage.remainingCells} celdas` : 'crear base'}
            icon="map-outline"
            color="#C4B5FD"
            route="/territorio/misiones"
            onOpen={open}
          />
        </View>

        {!hasEvidence ? (
          <Animated.View entering={fadeUp} className="mt-7">
            <GlassCard className="items-center p-7">
              <View className="h-16 w-16 items-center justify-center rounded-full border border-sky-300/15 bg-sky-300/[0.07]">
                <Ionicons name="telescope-outline" size={27} color="#7DD3FC" />
              </View>
              <Text className="mt-5 text-center font-serif text-[27px] leading-9 text-plata">Todavía no hay base para evaluar.</Text>
              <Text className="mt-3 max-w-[310px] text-center font-sans text-sm leading-6 text-slate-400">
                La pantalla no inventa porcentajes cuando faltan datos. Empezá escuchando una voz o trazando una misión con un denominador explícito.
              </Text>
              <View className="mt-6 flex-row gap-3">
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Abrir una escucha"
                  onPress={() => router.push('/escuchar')}
                  className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
                >
                  <Text className="font-sans-semibold text-xs text-slate-200">Escuchar</Text>
                </Pressable97>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Trazar una misión territorial"
                  onPress={() => router.push('/territorio/mapa')}
                  className="min-h-12 items-center justify-center rounded-full bg-accent px-5"
                >
                  <Text className="font-sans-semibold text-xs text-white">Trazar misión</Text>
                </Pressable97>
              </View>
            </GlassCard>
          </Animated.View>
        ) : (
          <>
            <SectionHeading
              eyebrow="Estado de la evidencia"
              title="Cuatro denominadores, cuatro preguntas"
              description="Cada porcentaje muestra su numerador y su base. Si la base no existe, dice “sin denominador”."
            />
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
              <RatioCard
                title="Corroboración"
                icon="shield-checkmark-outline"
                color="#7DD3FC"
                numerator={report.quality.corroborated}
                denominator={report.quality.fieldSignals}
                percent={report.quality.corroborationPct}
                detail={`${report.quality.needsReview} por mirar · ${report.quality.unsafe} bajo cuidado`}
              />
              <RatioCard
                title="Vigencia"
                icon="time-outline"
                color="#FCD34D"
                numerator={report.quality.currentSignals}
                denominator={report.quality.fieldSignals}
                percent={report.quality.vigencyPct}
                detail={`${report.quality.stale} ${report.quality.stale === 1 ? 'señal vencida' : 'señales vencidas'}`}
              />
              <RatioCard
                title="Resolución"
                icon="checkmark-done-outline"
                color="#6EE7B7"
                numerator={report.response.resolvedNeeds}
                denominator={report.response.consideredNeeds}
                percent={report.response.resolutionPct}
                detail={`${report.response.activeMatches} puentes en curso · ${report.response.confirmedActions} acciones confirmadas`}
              />
              <RatioCard
                title="Cobertura"
                icon="map-outline"
                color="#C4B5FD"
                numerator={report.coverage.visitedCells}
                denominator={report.coverage.plannedCells}
                percent={report.coverage.coveragePct}
                detail={report.coverage.plannedCells > 0
                  ? `${report.coverage.remainingCells} sin recorrer · ${report.coverage.corroboratedCells} corroboradas`
                  : 'Sólo una misión con celdas crea esta base'}
              />
            </View>

            <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
              <Ionicons name="information-circle-outline" size={18} color="#FCD34D" />
              <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">
                {report.coverage.plannedCells === 0
                  ? 'Hay registros, pero no cobertura medible. Sirven para responder casos concretos; no para afirmar cuán extendido está un problema.'
                  : `${report.coverage.visitedCells} de ${report.coverage.plannedCells} celdas planificadas fueron recorridas. ${report.coverage.fieldSignalsOutsidePlan} señales quedan fuera de ese denominador.`}
              </Text>
            </View>

            <SectionHeading
              eyebrow="Cola explicable"
              title="Qué atender primero"
              description="El orden es fijo y auditable: cuidado, corroboración, vigencia, cobertura y recién después conveniencia operativa."
            />
            {report.priorities.length > 0 ? (
              <View className="mt-4 gap-3">
                {report.priorities.map((priority, index) => {
                  const meta = PRIORITY_META[priority.kind];
                  return (
                    <Animated.View key={`${priority.kind}:${priority.title}`} entering={staggerDelay(Math.min(index, 8))}>
                      <GlassCard className="overflow-hidden p-5">
                        <View className="flex-row items-start">
                          <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${meta.color}18` }}>
                            <Ionicons name={meta.icon as never} size={20} color={meta.color} />
                          </View>
                          <View className="ml-3 flex-1">
                            <View className="flex-row items-center gap-2">
                              <Text className="font-mono text-[10px]" style={{ color: meta.color }}>#{priority.rank}</Text>
                              <Text className="font-sans text-[9px] uppercase tracking-[1.8px]" style={{ color: meta.color }}>{meta.label}</Text>
                            </View>
                            <Text className="mt-2 font-serif text-xl leading-7 text-plata">{priority.title}</Text>
                          </View>
                        </View>
                        <Text className="mt-4 font-sans text-xs leading-5 text-slate-400">{priority.explanation}</Text>
                        <View className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                          <Text className="font-sans text-[10px] uppercase tracking-[1.5px] text-slate-600">Por qué aparece</Text>
                          <Text className="mt-2 font-sans-medium text-xs leading-5 text-slate-300">{priority.evidence}</Text>
                        </View>
                        {priority.route && priority.actionLabel && (
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel={`${priority.actionLabel}. Prioridad ${priority.rank}: ${priority.title}`}
                            onPress={() => open(priority.route!)}
                            className="mt-4 min-h-11 flex-row items-center justify-between rounded-full border px-4"
                            style={{ borderColor: `${meta.color}35`, backgroundColor: `${meta.color}0C` }}
                          >
                            <Text className="font-sans-semibold text-xs" style={{ color: meta.color }}>{priority.actionLabel}</Text>
                            <Ionicons name="arrow-forward" size={16} color={meta.color} />
                          </Pressable97>
                        )}
                        {!priority.route && (
                          <View className="mt-4 flex-row items-start gap-2">
                            <Ionicons name="lock-closed-outline" size={15} color="#FDA4AF" />
                            <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">Requiere custodia y revisión humana; la app no automatiza esta decisión.</Text>
                          </View>
                        )}
                      </GlassCard>
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <GlassCard className="mt-4 p-6">
                <Text className="font-serif text-xl text-plata">Sin urgencias derivadas.</Text>
                <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">La evidencia local no activa ninguna regla de prioridad. Eso no significa que el territorio esté libre de problemas.</Text>
              </GlassCard>
            )}

            <SectionHeading
              eyebrow="Necesidades ↔ capacidades"
              title="Balance por asunto"
              description="Todas las barras usan la misma escala. Un cruce de categoría es una pista, nunca una asignación automática."
            />
            {report.categories.length > 0 ? (
              <View className="mt-4 gap-3">
                {report.categories.map((row, index) => (
                  <Animated.View key={row.category} entering={staggerDelay(Math.min(index, 8))}>
                    <GlassCard className="p-5">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-serif text-xl leading-7 text-plata">{civicCategoryLabel(row.category)}</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">
                            {row.signals} señales · {row.corroboratedSignals} corroboradas · {row.resolvedNeeds} resueltas
                          </Text>
                        </View>
                        {row.potentialBridges > 0 && (
                          <View className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5">
                            <Text className="font-mono text-[9px] text-emerald-200">≤ {row.potentialBridges} puentes</Text>
                          </View>
                        )}
                      </View>
                      <CountBar label="Necesidades abiertas" count={row.openNeeds} maximum={maxCategoryCount} color="#FCD34D" />
                      <CountBar label="Recursos disponibles" count={row.availableResources} maximum={maxCategoryCount} color="#6EE7B7" />
                      {row.openNeeds > 0 && row.availableResources === 0 && (
                        <View className="mt-4 flex-row items-start gap-2 border-t border-white/[0.06] pt-4">
                          <Ionicons name="alert-circle-outline" size={15} color="#FDBA74" />
                          <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">Brecha visible: hay demanda registrada y todavía no una capacidad disponible de esta categoría.</Text>
                        </View>
                      )}
                    </GlassCard>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <GlassCard className="mt-4 p-6">
                <Text className="font-serif text-xl text-plata">Todavía no hay balance.</Text>
                <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">Cuando existan señales, necesidades o recursos vigentes, aparecerán agrupados por asunto.</Text>
              </GlassCard>
            )}

            <SectionHeading
              eyebrow="Denominador territorial"
              title="Cobertura que puede auditarse"
              description="Sólo cuentan como visitadas las celdas observadas, controvertidas, corroboradas o vencidas; asignar una ruta no equivale a recorrerla."
            />
            <GlassCard className="mt-4 p-5">
              {report.coverage.plannedCells > 0 ? (
                <>
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <Text className="font-sans text-[10px] uppercase tracking-[1.8px] text-violet-300">{report.coverage.measuredMissions} {report.coverage.measuredMissions === 1 ? 'misión medida' : 'misiones medidas'}</Text>
                      <Text className="mt-2 font-serif text-[27px] leading-9 text-plata">{report.coverage.visitedCells} / {report.coverage.plannedCells} celdas</Text>
                    </View>
                    <Text className="font-mono text-sm text-violet-200">{percentLabel(report.coverage.coveragePct)}</Text>
                  </View>
                  <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <View className="h-full rounded-full bg-violet-400" style={{ width: `${report.coverage.coveragePct ?? 0}%` }} />
                  </View>
                  <View className="mt-5 flex-row flex-wrap gap-x-5 gap-y-3">
                    {[
                      [report.coverage.assignedCells, 'asignadas'],
                      [report.coverage.corroboratedCells, 'corroboradas'],
                      [report.coverage.contestedCells, 'en disputa'],
                      [report.coverage.fieldSignalsOutsidePlan, 'señales fuera del plan'],
                    ].map(([value, label]) => (
                      <View key={label as string} className="min-w-[42%] flex-1">
                        <Text className="font-mono text-lg text-plata">{value}</Text>
                        <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">{label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View className="items-center py-2">
                  <Ionicons name="map-outline" size={27} color="#8B7BB8" />
                  <Text className="mt-4 text-center font-serif text-2xl text-plata">Sin denominador de cobertura.</Text>
                  <Text className="mt-2 max-w-[300px] text-center font-sans text-xs leading-5 text-slate-400">Los casos existen, pero todavía no sabemos qué parte de una zona fue recorrida ni qué quedó sin mirar.</Text>
                </View>
              )}
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Abrir misiones territoriales"
                onPress={() => open('/territorio/misiones')}
                className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-5"
              >
                <Ionicons name="arrow-forward" size={16} color="#C4B5FD" />
                <Text className="font-sans-semibold text-xs text-violet-200">Abrir Misiones</Text>
              </Pressable97>
            </GlassCard>
          </>
        )}

        <SectionHeading
          eyebrow="Límites de representatividad"
          title="Lo que esta lectura no autoriza a decir"
          description="Estos límites viajan con el análisis: no son una nota legal escondida al final."
        />
        <View className="mt-4 gap-2.5">
          {report.interpretationLimits.map((limit, index) => (
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
          <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">
            Esta superficie apoya una deliberación humana. No puntúa personas, no define verdad y no convierte un orden de trabajo en mandato vinculante.
          </Text>
        </View>
          </>
        ) : (
          <PublicIntelligencePanel
            state={publicState}
            onRetry={() => { void loadPublic(); }}
            onUseLocal={useLocal}
          />
        )}
      </ScrollView>
    </View>
  );
}
