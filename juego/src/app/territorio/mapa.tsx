import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TerritoryMap from '@/components/civic/TerritoryMap';
import { Pressable97 } from '@/components/ui/Pressable97';
import { planTerritorialCoverage } from '@/civic/coverage';
import { getActorKey } from '@/civic/identity';
import { civicCategoryLabel } from '@/civic/labels';
import { polygonCenter, type TerritorySelection } from '@/civic/lasso';
import {
  buildSafeMapPointCard,
  isOperationalMapPoint,
  mapPointRecordRef,
  type MapPointAction,
} from '@/civic/map-point-action';
import {
  createTerritorialMission,
  MISSION_PASSPORTS,
  missionPassportForCampaign,
  missionsAll,
} from '@/civic/missions';
import { sharedPrecisionLabel } from '@/civic/record-context';
import {
  isCivicRecordExpired,
  needsAll,
  observationsAll,
  resourcesAll,
  saveTerritory,
} from '@/civic/repo';
import type { CivicCampaignKey } from '@/civic/types';
import { db } from '@/db/client';
import type { CivicMissionRow, CivicNeedRow, CivicObservationRow, CivicResourceRow } from '@/db/schema';
import { haptic } from '@/theme/haptics';

const defaultMissionTitle = (campaignKey: CivicCampaignKey): string => {
  const date = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date());
  return campaignKey === 'ollas-v1' ? `Ollas y comedores · ${date}` : `Luminarias · ${date}`;
};

const passportMeta = (campaignKey: CivicCampaignKey) => campaignKey === 'ollas-v1'
  ? { label: 'Ollas y comedores', detail: 'Capacidades y faltantes alimentarios', icon: 'restaurant-outline', color: '#F59E0B' }
  : { label: 'Luminarias', detail: 'Infraestructura de alumbrado', icon: 'flashlight-outline', color: '#A78BFA' };

const pointKindMeta = {
  observation: { color: '#A78BFA', icon: 'eye-outline' },
  need: { color: '#FB7185', icon: 'hand-left-outline' },
  resource: { color: '#34D399', icon: 'gift-outline' },
} as const;

const pointActionIcon: Record<MapPointAction['kind'], string> = {
  verify: 'shield-checkmark-outline',
  connect: 'git-merge-outline',
  offer: 'gift-outline',
  mission: 'flag-outline',
  missions: 'map-outline',
};

export default function MapaTerritorial() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string; published?: string }>();
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<TerritorySelection | null>(null);
  const [title, setTitle] = useState('');
  const [passportKey, setPassportKey] = useState<CivicCampaignKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observations, setObservations] = useState<CivicObservationRow[]>([]);
  const [needs, setNeeds] = useState<CivicNeedRow[]>([]);
  const [resources, setResources] = useState<CivicResourceRow[]>([]);
  const [missions, setMissions] = useState<CivicMissionRow[]>([]);
  const [actorKey, setActorKey] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const refreshRecords = useCallback(() => {
    setObservations(observationsAll());
    setNeeds(needsAll());
    setResources(resourcesAll());
    setMissions(missionsAll());
  }, []);
  useFocusEffect(refreshRecords);
  useEffect(() => {
    let alive = true;
    getActorKey().then((key) => { if (alive) setActorKey(key); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const focusedPointId = typeof params.focus === 'string' ? params.focus : null;
  const focusedResource = params.published === 'resource' && focusedPointId?.startsWith('resource:')
    ? resources.find((item) => item.id === focusedPointId.slice('resource:'.length)) ?? null
    : null;
  const missionPassport = missionPassportForCampaign(passportKey);
  const points = useMemo(() => [
    ...observations
      .filter((item) => item.publicLat != null && item.publicLng != null
        && isOperationalMapPoint('observation', item.status)
        && !isCivicRecordExpired(item))
      .map((item) => ({ id: item.id, lat: item.publicLat!, lng: item.publicLng!, status: item.status, category: item.category, precision: item.publicPrecision })),
    ...needs
      .filter((item) => item.publicLat != null && item.publicLng != null
        && isOperationalMapPoint('need', item.status)
        && !isCivicRecordExpired(item))
      .map((item) => ({ id: `need:${item.id}`, lat: item.publicLat!, lng: item.publicLng!, status: `need:${item.status}`, category: item.category, precision: item.publicPrecision })),
    ...resources
      .filter((item) => item.publicLat != null && item.publicLng != null
        && isOperationalMapPoint('resource', item.status)
        && !isCivicRecordExpired(item)
        && (item.quantity == null || item.quantity > 0))
      .map((item) => ({ id: `resource:${item.id}`, lat: item.publicLat!, lng: item.publicLng!, status: `resource:${item.status}`, category: item.category, precision: item.publicPrecision })),
  ], [needs, observations, resources]);
  const selectedPointCard = useMemo(() => {
    if (!selectedPointId || !points.some((point) => point.id === selectedPointId)) return null;
    const ref = mapPointRecordRef(selectedPointId);
    if (ref.kind === 'observation') {
      const row = observations.find((item) => item.id === ref.entityId);
      if (!row) return null;
      return buildSafeMapPointCard({
        pointId: selectedPointId,
        kind: 'observation',
        category: row.category,
        status: row.status,
        precision: row.publicPrecision,
        territoryId: row.territoryId,
        campaignKey: row.campaignKey,
        canVerify: actorKey != null && row.creatorKey !== actorKey && row.campaignKey !== 'escucha-v1',
      }, missions);
    }
    if (ref.kind === 'need') {
      const row = needs.find((item) => item.id === ref.entityId);
      if (!row) return null;
      return buildSafeMapPointCard({
        pointId: selectedPointId,
        kind: 'need',
        category: row.category,
        status: row.status,
        precision: row.publicPrecision,
        territoryId: row.territoryId,
      }, missions);
    }
    const row = resources.find((item) => item.id === ref.entityId);
    if (!row) return null;
    return buildSafeMapPointCard({
      pointId: selectedPointId,
      kind: 'resource',
      category: row.category,
      status: row.status,
      precision: row.publicPrecision,
      territoryId: row.territoryId,
    }, missions);
  }, [actorKey, missions, needs, observations, points, resources, selectedPointId]);
  const selectedRows = useMemo(() => {
    const ids = new Set(selection?.selectedIds ?? []);
    return observations.filter((item) => ids.has(item.id));
  }, [observations, selection]);
  const trusted = selectedRows.filter((item) => item.status === 'corroborated').length;
  const pending = selectedRows.filter((item) => ['queued', 'synced', 'needs_review'].includes(item.status)).length;
  const coverage = useMemo(() => selection
    ? planTerritorialCoverage(
        { points: selection.polygon },
        { cellCount: 12, maxCells: 24, namespace: 'territorial-mission-v1' },
      )
    : null, [selection]);

  const goBack = () => {
    if (focusedResource) {
      router.replace('/territorio');
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/territorio');
  };

  const createMission = () => {
    if (!selection || !coverage?.valid || coverage.cells.length === 0 || !title.trim() || !missionPassport || creating) return;
    setCreating(true);
    setError(null);
    const closed = [...selection.polygon, selection.polygon[0]!];
    try {
      const mission = db.transaction((tx) => {
        const territory = saveTerritory({
          name: title.trim(),
          geometry: { type: 'Polygon', coordinates: [closed.map((point) => [point.lng, point.lat])] },
          center: polygonCenter(selection.polygon),
          database: tx,
        });
        return createTerritorialMission({
          territoryId: territory.id,
          title: title.trim(),
          cells: coverage.cells.map((cell) => ({ key: cell.id, polygon: cell.polygon, center: cell.center })),
          passport: missionPassport,
          database: tx,
        });
      });
      haptic.celebrate();
      router.replace({ pathname: '/territorio/misiones/[id]', params: { id: mission.id } });
    } catch {
      setCreating(false);
      setError('No pudimos fundar la misión. El trazado sigue acá para que vuelvas a intentar.');
    }
  };

  const openPointAction = (action: MapPointAction) => {
    haptic.tick();
    if (action.kind === 'verify' || action.kind === 'mission') {
      router.push(action.href);
      return;
    }
    router.push(action.href);
  };

  return (
    <View className="flex-1 bg-fondo" style={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center justify-between px-5 pb-4">
        <Pressable97 accessibilityRole="button" accessibilityLabel="Volver" onPress={goBack} className="rounded-full border border-white/10 bg-white/5 p-2.5">
          <Ionicons name="arrow-back" size={18} color="#CBD5E1" />
        </Pressable97>
        <View className="items-center">
          <Text className="font-serif text-lg text-plata">Lazo territorial</Text>
          <Text className="font-mono text-[9px] uppercase tracking-[2px] text-slate-500">dibujar · leer · actuar</Text>
        </View>
        <View className="h-10 w-10" />
      </View>
      <View className="relative flex-1 px-4">
        <TerritoryMap
          points={points}
          coverageCells={coverage?.cells ?? []}
          highlightedPointId={focusedResource ? focusedPointId : null}
          selectedPointId={selectedPointCard?.pointId ?? null}
          onPointPress={(pointId) => {
            haptic.tick();
            setSelectedPointId(pointId);
          }}
          onSelection={(next) => { setSelection(next); setError(null); }}
        />
        {selectedPointCard && (() => {
          const meta = pointKindMeta[selectedPointCard.kind];
          return (
            <View
              accessibilityLiveRegion="polite"
              className="absolute bottom-3 left-7 right-7 rounded-[22px] border bg-[#111015]/95 p-4"
              style={{ borderColor: `${meta.color}55` }}
            >
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${meta.color}1F` }}>
                  <Ionicons name={meta.icon} size={19} color={meta.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-[9px] uppercase tracking-[2px]" style={{ color: meta.color }}>
                    {selectedPointCard.kindLabel} · ficha territorial
                  </Text>
                  <Text className="mt-1 font-serif text-lg leading-6 text-plata">
                    {civicCategoryLabel(selectedPointCard.category)}
                  </Text>
                  <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-400">
                    {selectedPointCard.statusLabel} · {sharedPrecisionLabel(selectedPointCard.precision)}
                  </Text>
                </View>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar ficha del punto"
                  onPress={() => setSelectedPointId(null)}
                  className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                >
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </Pressable97>
              </View>
              <Text className="mt-3 font-sans text-[9px] leading-4 text-slate-500">
                Vista mínima: no expone relato, contacto ni una ubicación más precisa que la autorizada.
              </Text>
              <View className="mt-3 flex-row gap-2">
                {selectedPointCard.actions.map((action, index) => (
                  <Pressable97
                    key={`${action.kind}:${action.label}`}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => openPointAction(action)}
                    className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full border px-3"
                    style={{
                      borderColor: index === 0 ? `${meta.color}70` : '#FFFFFF18',
                      backgroundColor: index === 0 ? `${meta.color}22` : '#FFFFFF08',
                    }}
                  >
                    <Ionicons name={pointActionIcon[action.kind] as never} size={14} color={index === 0 ? meta.color : '#CBD5E1'} />
                    <Text className="font-sans-semibold text-[10px] text-slate-100" numberOfLines={1}>{action.label}</Text>
                  </Pressable97>
                ))}
              </View>
            </View>
          );
        })()}
      </View>
      <View className="px-5 pt-4">
        {focusedResource && (
          <View accessibilityLiveRegion="polite" className="mb-4 rounded-[22px] border border-emerald-300/25 bg-emerald-300/[0.08] p-4">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-300/15">
                <Ionicons name="checkmark" size={21} color="#6EE7B7" />
              </View>
              <View className="flex-1">
                <Text className="font-sans text-[9px] uppercase tracking-[2px] text-emerald-300">Recurso registrado</Text>
                <Text className="mt-1 font-serif text-lg leading-6 text-plata" numberOfLines={2}>{focusedResource.title}</Text>
                <Text className="mt-1 font-sans text-[10px] leading-4 text-emerald-100/70">
                  {focusedResource.locationLabel ?? 'Ubicación confirmada'} · {sharedPrecisionLabel(focusedResource.publicPrecision)}. El punto verde muestra la proyección compartida, no la coordenada exacta.
                </Text>
              </View>
            </View>
            <View className="mt-4 flex-row gap-2">
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Volver al territorio"
                onPress={() => router.replace('/territorio')}
                className="min-h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4"
              >
                <Text className="font-sans-semibold text-xs text-slate-200">Ir al territorio</Text>
              </Pressable97>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Buscar conexiones para este recurso"
                onPress={() => router.push('/conectar')}
                className="min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-500 px-4"
              >
                <Text className="font-sans-semibold text-xs text-white">Buscar conexiones</Text>
              </Pressable97>
            </View>
          </View>
        )}
        <View className="mb-3 flex-row items-center justify-center gap-4">
          {[
            ['#A78BFA', 'señal'],
            ['#FB7185', 'necesidad'],
            ['#34D399', 'recurso'],
          ].map(([color, label]) => (
            <View key={label} className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <Text className="font-sans text-[9px] uppercase tracking-[1px] text-slate-500">{label}</Text>
            </View>
          ))}
        </View>
        <Text className="mb-3 text-center font-sans text-[9px] leading-4 text-slate-600">
          El halo expresa la incertidumbre pública; el lazo cuenta el centro de cada zona, no una coordenada exacta.
        </Text>
        {selection ? (
          <View>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-sans-semibold text-sm text-plata">El lazo ya tiene una operación</Text>
                <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
                  {coverage?.valid
                    ? `${coverage.plannedDenominator.value} celdas planificadas · ${selection.selectedIds.length} registros situados · ${trusted} señales corroboradas · ${pending} por revisar.`
                    : 'El trazo se cruzó o no encierra superficie suficiente. Limpiá el lazo y probá otra vez.'}
                </Text>
              </View>
              <View className="h-11 min-w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 px-3">
                <Text className="font-mono text-sm text-violet-200">{coverage?.plannedDenominator.value ?? 0}</Text>
                <Text className="font-sans text-[8px] uppercase tracking-[1px] text-violet-300/60">celdas</Text>
              </View>
            </View>
            {coverage?.valid && coverage.cells.length > 0 && (
              <>
                <Text className="mt-4 font-sans-medium text-xs text-slate-300">¿Qué misión vas a realizar?</Text>
                <View className="mt-2 flex-row gap-2">
                  {MISSION_PASSPORTS.map((passport) => {
                    const meta = passportMeta(passport.campaignKey);
                    const selected = passport.campaignKey === passportKey;
                    return (
                      <Pressable97
                        key={passport.campaignKey}
                        accessibilityRole="radio"
                        accessibilityLabel={`${meta.label}. ${meta.detail}`}
                        accessibilityState={{ selected }}
                        onPress={() => {
                          setPassportKey(passport.campaignKey);
                          setTitle((current) => current.trim() || defaultMissionTitle(passport.campaignKey));
                          setError(null);
                        }}
                        className="min-h-[76px] flex-1 rounded-2xl border p-3"
                        style={{ borderColor: selected ? `${meta.color}70` : '#FFFFFF18', backgroundColor: selected ? `${meta.color}16` : '#FFFFFF08' }}
                      >
                        <Ionicons name={meta.icon as never} size={17} color={selected ? meta.color : '#64748B'} />
                        <Text className="mt-2 font-sans-semibold text-xs" style={{ color: selected ? '#F5F7FA' : '#CBD5E1' }}>{meta.label}</Text>
                        <Text className="mt-1 font-sans text-[9px] leading-3 text-slate-500">{meta.detail}</Text>
                      </Pressable97>
                    );
                  })}
                </View>
                <TextInput
                  accessibilityLabel="Nombre de la misión"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={120}
                  selectTextOnFocus
                  placeholder="Nombre de la misión"
                  placeholderTextColor="#64748B"
                  className="mt-3 min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 font-sans text-sm text-plata"
                />
                <View className="mt-3 flex-row items-center justify-between gap-3">
                  <View className="flex-1 flex-row flex-wrap gap-x-3 gap-y-1">
                    {missionPassport ? (
                      <>
                        <Text className="font-sans text-[10px] text-slate-500">{missionPassport.minIndependentVerifications} miradas independientes</Text>
                        <Text className="font-sans text-[10px] text-slate-500">{sharedPrecisionLabel(missionPassport.publicPrecision)} pública</Text>
                        <Text className="font-sans text-[10px] text-slate-500">{missionPassport.retentionDays} días</Text>
                      </>
                    ) : (
                      <Text className="font-sans text-[10px] text-amber-200">Elegí el tipo para definir su pasaporte.</Text>
                    )}
                  </View>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Fundar misión territorial"
                    accessibilityHint={`Creará una misión de ${coverage.cells.length} celdas`}
                    disabled={!title.trim() || !missionPassport || creating}
                    onPress={createMission}
                    className={`min-h-12 justify-center rounded-full bg-accent px-5 ${title.trim() && missionPassport && !creating ? '' : 'opacity-40'}`}
                  >
                    <Text className="font-sans-semibold text-xs text-white">{creating ? 'Fundando…' : 'Fundar misión'}</Text>
                  </Pressable97>
                </View>
              </>
            )}
            {error && <Text accessibilityLiveRegion="polite" className="mt-2 font-sans text-xs leading-5 text-rose-300">{error}</Text>}
          </View>
        ) : (
          <Text className="text-center font-sans text-xs leading-5 text-slate-500">
            Tocá Lazo y rodeá una zona. El trazo se convertirá en celdas, rutas y una condición de cierre explícita.
          </Text>
        )}
      </View>
    </View>
  );
}
