import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PublicIntelligencePanel } from '@/components/civic/PublicIntelligencePanel';
import { BotonTinta, ChipTipo, FilaIndice, GranoPapel, Kicker, PapelCard, TituloAnton } from '@/components/papel';
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
import { PAPEL, TINTA, TINTA_50 } from '@/theme/tokens';

const EMPTY_REPORT = buildLocalCivicAnalytics({
  observations: [],
  needs: [],
  resources: [],
  matches: [],
  actions: [],
  missions: [],
});

/** Etiquetas de prioridad — sin color propio (spec §1: nada de acento
 * decorativo por categoría); el orden y el rótulo alcanzan. */
const PRIORITY_META: Record<LocalPriorityKind, { label: string }> = {
  protect: { label: 'Cuidado' },
  verify: { label: 'Calidad' },
  refresh: { label: 'Vigencia' },
  cover: { label: 'Cobertura' },
  coordinate: { label: 'Conexión' },
  mobilize: { label: 'Convocatoria' },
  follow_through: { label: 'Seguimiento' },
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
      <Kicker tono="neutro">{eyebrow}</Kicker>
      <TituloAnton tamano="md" className="mt-2">{title}</TituloAnton>
      {description && <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{description}</Text>}
    </View>
  );
}

function RatioCard({
  title,
  numerator,
  denominator,
  percent,
  detail,
}: {
  title: string;
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
    <PapelCard variante="suave" className="p-4" style={{ width: '48.5%' }} accessible accessibilityLabel={accessible}>
      <View className="flex-row items-center justify-between gap-2">
        <Kicker tono="neutro">{title}</Kicker>
        <Text className="font-space text-[10px] text-tinta-50">{percentLabel(percent)}</Text>
      </View>
      <View className="mt-4 flex-row items-end gap-1.5">
        <Text className="font-space text-2xl text-tinta">{denominator > 0 ? numerator : '—'}</Text>
        <Text className="mb-0.5 font-space text-xs text-tinta-50">/ {denominator}</Text>
      </View>
      <View accessible={false} className="mt-3 h-1.5 bg-bordeSuave">
        <View className="h-full bg-tinta" style={{ width }} />
      </View>
      <Text className="mt-3 font-archivo text-[10px] leading-4 text-tinta-50">{detail}</Text>
    </PapelCard>
  );
}

function ActionPortal({
  title,
  detail,
  route,
  onOpen,
}: {
  title: string;
  detail: string;
  route: LocalPriorityRoute;
  onOpen: (route: LocalPriorityRoute) => void;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={() => onOpen(route)}
      className="min-h-[88px] flex-1 items-center justify-center bg-papel-crudo border border-tinta px-2 py-3"
    >
      <Text className="text-center font-archivo-bold text-xs text-tinta">{title}</Text>
      <Text className="mt-2 text-center font-space text-[9px] leading-4 text-tinta-50">{detail}</Text>
    </Pressable97>
  );
}

function CountBar({ label, count, maximum }: {
  label: string;
  count: number;
  maximum: number;
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
        <Text className="font-archivo text-[11px] text-tinta-75">{label}</Text>
        <Text className="font-space text-xs text-tinta">{count}</Text>
      </View>
      <View className="mt-2 h-1.5 bg-bordeSuave">
        <View className="h-full bg-tinta" style={{ width }} />
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));
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
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>lo medible y sus límites</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Inteligencia</TituloAnton>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 44 }}
      >
        <Animated.View entering={fadeUp}>
          <PapelCard className="p-6">
            <View className="flex-row items-center justify-between gap-3">
              <Kicker>{source === 'local' ? 'esta instalación · funciona offline' : 'red pública protegida · 30 días'}</Kicker>
              <Text className="font-space text-[9px] text-tinta-50">
                {source === 'local'
                  ? displayTime(updatedAt)
                  : publicSnapshot
                    ? displayTime(publicSnapshot.meta.generatedAt)
                    : 'OPCIONAL'}
              </Text>
            </View>
            <TituloAnton tamano="md" className="mt-5">
              {source === 'local' ? 'Lo que sabemos. Lo que todavía no.' : 'La Radiografía de la red.'}
            </TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              {source === 'local'
                ? 'Evalúa evidencia, respuesta y cobertura sin convertir participación en verdad automática ni en un falso censo.'
                : 'Una lectura separada, agregada y protegida por umbral. Nunca reemplaza ni absorbe el informe de este dispositivo.'}
            </Text>
            <View className="mt-6 flex-row gap-6">
              {heroStats.map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-space text-xl text-tinta">{value}</Text>
                  <Text className="mt-0.5 font-space text-[9px] uppercase tracking-[1.5px] text-tinta-50">{label}</Text>
                </View>
              ))}
            </View>
          </PapelCard>
        </Animated.View>

        <View className="mt-4 flex-row border border-tinta">
          <Pressable97
            accessibilityRole="tab"
            accessibilityLabel="Leer datos de esta instalación"
            accessibilityState={{ selected: source === 'local' }}
            onPress={useLocal}
            className="min-h-14 flex-1 items-center justify-center px-3 py-2"
            style={{ backgroundColor: source === 'local' ? TINTA : 'transparent' }}
          >
            <Text className="font-archivo-bold text-xs" style={{ color: source === 'local' ? PAPEL : TINTA }}>Esta instalación</Text>
            <Text className="mt-1 font-space text-[9px]" style={{ color: source === 'local' ? PAPEL : TINTA_50 }}>offline · operativo</Text>
          </Pressable97>
          <View className="w-px bg-tinta" />
          <Pressable97
            accessibilityRole="tab"
            accessibilityLabel="Consultar red pública protegida de los últimos 30 días"
            accessibilityState={{ selected: source === 'public' }}
            onPress={usePublic}
            className="min-h-14 flex-1 items-center justify-center px-3 py-2"
            style={{ backgroundColor: source === 'public' ? TINTA : 'transparent' }}
          >
            <Text className="font-archivo-bold text-xs" style={{ color: source === 'public' ? PAPEL : TINTA }}>Red pública</Text>
            <Text className="mt-1 font-space text-[9px]" style={{ color: source === 'public' ? PAPEL : TINTA_50 }}>protegida · 30 días</Text>
          </Pressable97>
        </View>
        <Text className="mt-2 text-center font-archivo text-[10px] leading-4 text-tinta-30">Las fuentes se alternan: sus cifras nunca se suman ni se fusionan.</Text>

        {source === 'local' ? (
          <>
        <View className="mt-4 flex-row gap-2">
          {report.quality.needsReview > 0 && (
            <ActionPortal
              title="Corroborar"
              detail={`${report.quality.needsReview} por mirar`}
              route="/verificar"
              onOpen={open}
            />
          )}
          {(possibleBridges > 0 || report.response.activeMatches + report.response.proposedMatches > 0) && (
            <ActionPortal
              title="Conectar"
              detail={possibleBridges > 0 ? `${possibleBridges} por evaluar` : `${report.response.activeMatches + report.response.proposedMatches} en marcha`}
              route="/conectar"
              onOpen={open}
            />
          )}
          <ActionPortal
            title="Misiones"
            detail={report.coverage.plannedCells > 0 ? `${report.coverage.remainingCells} celdas` : 'crear base'}
            route="/territorio/misiones"
            onOpen={open}
          />
        </View>

        {!hasEvidence ? (
          <Animated.View entering={fadeUp} className="mt-7">
            <PapelCard className="items-center p-7">
              <TituloAnton tamano="md" className="text-center">Todavía no hay base para evaluar.</TituloAnton>
              <Text className="mt-3 max-w-[310px] text-center font-archivo text-sm leading-6 text-tinta-75">
                La pantalla no inventa porcentajes cuando faltan datos. Empezá escuchando una voz o trazando una misión con un denominador explícito.
              </Text>
              <View className="mt-6 flex-row gap-3">
                <BotonTinta
                  etiqueta="Escuchar →"
                  accessibilityLabel="Abrir una escucha"
                  variante="fantasma"
                  onPress={() => router.push('/escuchar')}
                />
                <BotonTinta
                  etiqueta="Trazar misión →"
                  accessibilityLabel="Trazar una misión territorial"
                  onPress={() => router.push('/territorio/mapa')}
                />
              </View>
            </PapelCard>
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
                numerator={report.quality.corroborated}
                denominator={report.quality.fieldSignals}
                percent={report.quality.corroborationPct}
                detail={`${report.quality.needsReview} por mirar · ${report.quality.unsafe} bajo cuidado`}
              />
              <RatioCard
                title="Vigencia"
                numerator={report.quality.currentSignals}
                denominator={report.quality.fieldSignals}
                percent={report.quality.vigencyPct}
                detail={`${report.quality.stale} ${report.quality.stale === 1 ? 'señal vencida' : 'señales vencidas'}`}
              />
              <RatioCard
                title="Resolución"
                numerator={report.response.resolvedNeeds}
                denominator={report.response.consideredNeeds}
                percent={report.response.resolutionPct}
                detail={`${report.response.activeMatches} puentes en curso · ${report.response.confirmedActions} acciones confirmadas`}
              />
              <RatioCard
                title="Cobertura"
                numerator={report.coverage.visitedCells}
                denominator={report.coverage.plannedCells}
                percent={report.coverage.coveragePct}
                detail={report.coverage.plannedCells > 0
                  ? `${report.coverage.remainingCells} sin recorrer · ${report.coverage.corroboratedCells} corroboradas`
                  : 'Sólo una misión con celdas crea esta base'}
              />
            </View>

            <View className="mt-4 border border-ambar px-4 py-3">
              <Text className="font-archivo text-[11px] leading-5 text-tinta-90">
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
                      <PapelCard className="p-5">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-space text-[10px] text-tinta-50">#{priority.rank}</Text>
                          <ChipTipo etiqueta={meta.label} />
                        </View>
                        <TituloAnton tamano="md" className="mt-3">{priority.title}</TituloAnton>
                        <Text className="mt-3 font-archivo text-xs leading-5 text-tinta-75">{priority.explanation}</Text>
                        <View className="mt-4 border border-bordeSuave px-4 py-3">
                          <Kicker tono="neutro">Por qué aparece</Kicker>
                          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-90">{priority.evidence}</Text>
                        </View>
                        {priority.route && priority.actionLabel && (
                          <View className="mt-4 items-start">
                            <BotonTinta
                              etiqueta={`${priority.actionLabel} →`}
                              accessibilityLabel={`${priority.actionLabel}. Prioridad ${priority.rank}: ${priority.title}`}
                              variante="fantasma"
                              tamano="compacto"
                              onPress={() => open(priority.route!)}
                            />
                          </View>
                        )}
                        {!priority.route && (
                          <Text className="mt-4 font-archivo text-[11px] leading-5 text-tinta-50">
                            Requiere custodia y revisión humana; la app no automatiza esta decisión.
                          </Text>
                        )}
                      </PapelCard>
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <PapelCard className="mt-4 p-6">
                <TituloAnton tamano="md">Sin urgencias derivadas.</TituloAnton>
                <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">La evidencia local no activa ninguna regla de prioridad. Eso no significa que el territorio esté libre de problemas.</Text>
              </PapelCard>
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
                    <PapelCard className="p-5">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <TituloAnton tamano="md">{civicCategoryLabel(row.category)}</TituloAnton>
                          <Text className="mt-2 font-space text-[10px] text-tinta-50">
                            {row.signals} señales · {row.corroboratedSignals} corroboradas · {row.resolvedNeeds} resueltas
                          </Text>
                        </View>
                        {row.potentialBridges > 0 && (
                          <ChipTipo etiqueta={`≤ ${row.potentialBridges} puentes`} />
                        )}
                      </View>
                      <CountBar label="Necesidades abiertas" count={row.openNeeds} maximum={maxCategoryCount} />
                      <CountBar label="Recursos disponibles" count={row.availableResources} maximum={maxCategoryCount} />
                      {row.openNeeds > 0 && row.availableResources === 0 && (
                        <Text className="mt-4 border-t border-bordeSuave pt-4 font-archivo text-[11px] leading-5 text-tinta-50">
                          Brecha visible: hay demanda registrada y todavía no una capacidad disponible de esta categoría.
                        </Text>
                      )}
                    </PapelCard>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <PapelCard className="mt-4 p-6">
                <TituloAnton tamano="md">Todavía no hay balance.</TituloAnton>
                <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">Cuando existan señales, necesidades o recursos vigentes, aparecerán agrupados por asunto.</Text>
              </PapelCard>
            )}

            <SectionHeading
              eyebrow="Denominador territorial"
              title="Cobertura que puede auditarse"
              description="Sólo cuentan como visitadas las celdas observadas, controvertidas, corroboradas o vencidas; asignar una ruta no equivale a recorrerla."
            />
            <PapelCard className="mt-4 p-5">
              {report.coverage.plannedCells > 0 ? (
                <>
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <Kicker>{`${report.coverage.measuredMissions} ${report.coverage.measuredMissions === 1 ? 'misión medida' : 'misiones medidas'}`}</Kicker>
                      <TituloAnton tamano="md" className="mt-2">{`${report.coverage.visitedCells} / ${report.coverage.plannedCells} celdas`}</TituloAnton>
                    </View>
                    <Text className="font-space text-sm text-violeta">{percentLabel(report.coverage.coveragePct)}</Text>
                  </View>
                  <View className="mt-5 h-2 bg-bordeSuave">
                    <View className="h-full bg-violeta" style={{ width: `${report.coverage.coveragePct ?? 0}%` }} />
                  </View>
                  <View className="mt-5 flex-row flex-wrap gap-x-5 gap-y-3">
                    {[
                      [report.coverage.assignedCells, 'asignadas'],
                      [report.coverage.corroboratedCells, 'corroboradas'],
                      [report.coverage.contestedCells, 'en disputa'],
                      [report.coverage.fieldSignalsOutsidePlan, 'señales fuera del plan'],
                    ].map(([value, label]) => (
                      <View key={label as string} className="min-w-[42%] flex-1">
                        <Text className="font-space text-lg text-tinta">{value}</Text>
                        <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View className="items-center py-2">
                  <TituloAnton tamano="md" className="text-center">Sin denominador de cobertura.</TituloAnton>
                  <Text className="mt-2 max-w-[300px] text-center font-archivo text-xs leading-5 text-tinta-75">Los casos existen, pero todavía no sabemos qué parte de una zona fue recorrida ni qué quedó sin mirar.</Text>
                </View>
              )}
              <View className="mt-5 items-center">
                <BotonTinta
                  etiqueta="Abrir Misiones →"
                  accessibilityLabel="Abrir misiones territoriales"
                  onPress={() => open('/territorio/misiones')}
                />
              </View>
            </PapelCard>
          </>
        )}

        <SectionHeading
          eyebrow="Límites de representatividad"
          title="Lo que esta lectura no autoriza a decir"
          description="Estos límites viajan con el análisis: no son una nota legal escondida al final."
        />
        <View className="mt-4">
          {report.interpretationLimits.map((limit, index) => (
            <FilaIndice key={limit} numero={String(index + 1).padStart(2, '0')} glifo="">
              <Text className="font-archivo text-[11px] leading-5 text-tinta-75">{limit}</Text>
            </FilaIndice>
          ))}
        </View>

        <View className="mt-7 border border-bordeSuave px-4 py-4">
          <Text className="font-archivo text-[11px] leading-5 text-tinta-50">
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
