import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TerritoryMap from '@/components/civic/TerritoryMap';
import { BotonTinta, ChipTipo, GranoPapel, Kicker, PapelCard, TituloAnton } from '@/components/papel';
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
import { AMBAR_PT, CIAN, TINTA, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

const defaultMissionTitle = (campaignKey: CivicCampaignKey): string => {
  const date = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date());
  return campaignKey === 'ollas-v1' ? `Ollas y comedores · ${date}` : `Luminarias · ${date}`;
};

const passportMeta = (campaignKey: CivicCampaignKey) => campaignKey === 'ollas-v1'
  ? { label: 'Ollas y comedores', detail: 'Capacidades y faltantes alimentarios' }
  : { label: 'Luminarias', detail: 'Infraestructura de alumbrado' };

/** Reclasificación de los 3 tipos de punto del mapa sobre las señales más
 * cercanas del registro papel (observación queda neutra: ninguna señal le
 * calza bien). */
const pointKindMeta = {
  observation: { color: TINTA },
  need: { color: AMBAR_PT },
  resource: { color: CIAN },
} as const;

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

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
  const [enfocadoTitulo, setEnfocadoTitulo] = useState(false);
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
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5 pb-3" style={{ paddingTop: insets.top + 10 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={goBack}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>dibujar · leer · actuar</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Lazo territorial</TituloAnton>
        </View>
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
            <PapelCard
              accessibilityLiveRegion="polite"
              className="absolute bottom-3 left-7 right-7 p-4"
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Kicker tono="neutro">ficha territorial</Kicker>
                  <View className="mt-2">
                    <ChipTipo etiqueta={selectedPointCard.kindLabel} activo color={meta.color} />
                  </View>
                  <TituloAnton tamano="md" className="mt-2">
                    {civicCategoryLabel(selectedPointCard.category)}
                  </TituloAnton>
                  <Text className="mt-1 font-archivo text-[11px] leading-4 text-tinta-75">
                    {selectedPointCard.statusLabel} · {sharedPrecisionLabel(selectedPointCard.precision)}
                  </Text>
                </View>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar ficha del punto"
                  onPress={() => setSelectedPointId(null)}
                  className="h-9 w-9 items-center justify-center border border-tinta bg-papel-crudo"
                >
                  <Ionicons name="close" size={16} color={TINTA} />
                </Pressable97>
              </View>
              <Text className="mt-3 font-archivo text-[10px] leading-4 text-tinta-50">
                Vista mínima: no expone relato, contacto ni una ubicación más precisa que la autorizada.
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {selectedPointCard.actions.map((action) => (
                  <BotonTinta
                    key={`${action.kind}:${action.label}`}
                    etiqueta={`${action.label} →`}
                    variante="fantasma"
                    tamano="compacto"
                    className="flex-1"
                    onPress={() => openPointAction(action)}
                  />
                ))}
              </View>
            </PapelCard>
          );
        })()}
      </View>
      <View className="px-5 pt-4" style={{ paddingBottom: insets.bottom + 12 }}>
        {focusedResource && (
          <PapelCard
            accessibilityLiveRegion="polite"
            className="mb-4 p-4"
            style={{ borderColor: VERDE }}
          >
            <Text className="font-space text-[11px] uppercase tracking-[1.76px] text-verde">
              Recurso registrado
            </Text>
            <TituloAnton tamano="md" className="mt-2">{focusedResource.title}</TituloAnton>
            <Text className="mt-1 font-archivo text-[11px] leading-4 text-tinta-75">
              {focusedResource.locationLabel ?? 'Ubicación confirmada'} · {sharedPrecisionLabel(focusedResource.publicPrecision)}. El punto verde muestra la proyección compartida, no la coordenada exacta.
            </Text>
            <View className="mt-4 flex-row gap-2">
              <BotonTinta
                etiqueta="Ir al territorio →"
                accessibilityLabel="Volver al territorio"
                variante="fantasma"
                tamano="compacto"
                className="flex-1"
                onPress={() => router.replace('/territorio')}
              />
              <BotonTinta
                etiqueta="Buscar conexiones →"
                accessibilityLabel="Buscar conexiones para este recurso"
                variante="fantasma"
                tamano="compacto"
                className="flex-1"
                onPress={() => router.push('/conectar')}
              />
            </View>
          </PapelCard>
        )}
        <View className="mb-3 flex-row items-center justify-center gap-4">
          {[
            ['bg-tinta', 'señal'],
            ['bg-ambar', 'necesidad'],
            ['bg-cian', 'recurso'],
          ].map(([swatch, label]) => (
            <View key={label} className="flex-row items-center gap-1.5">
              <View className={`h-2 w-2 ${swatch}`} />
              <Text className="font-space text-[9px] uppercase tracking-[1px] text-tinta-50">{label}</Text>
            </View>
          ))}
        </View>
        <Text className="mb-3 text-center font-archivo text-[9px] leading-4 text-tinta-30">
          El halo expresa la incertidumbre pública; el lazo cuenta el centro de cada zona, no una coordenada exacta.
        </Text>
        {selection ? (
          <View>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-archivo-bold text-sm text-tinta">El lazo ya tiene una operación</Text>
                <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-50">
                  {coverage?.valid
                    ? `${coverage.plannedDenominator.value} celdas planificadas · ${selection.selectedIds.length} registros situados · ${trusted} señales corroboradas · ${pending} por revisar.`
                    : 'El trazo se cruzó o no encierra superficie suficiente. Limpiá el lazo y probá otra vez.'}
                </Text>
              </View>
              <View className="h-11 min-w-11 items-center justify-center border border-violeta px-3">
                <Text className="font-space text-sm text-violeta">{coverage?.plannedDenominator.value ?? 0}</Text>
                <Text className="font-space text-[8px] uppercase tracking-[1px] text-violeta">celdas</Text>
              </View>
            </View>
            {coverage?.valid && coverage.cells.length > 0 && (
              <>
                <Kicker tono="neutro" className="mt-4">¿Qué misión vas a realizar?</Kicker>
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
                        className="min-h-[76px] flex-1 bg-papel-crudo p-3"
                        style={{ borderWidth: selected ? 2 : 1, borderColor: selected ? VIOLETA : TINTA }}
                      >
                        <Text className="font-archivo-bold text-xs text-tinta">{meta.label}</Text>
                        <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{meta.detail}</Text>
                      </Pressable97>
                    );
                  })}
                </View>
                <TextInput
                  accessibilityLabel="Nombre de la misión"
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setEnfocadoTitulo(true)}
                  onBlur={() => setEnfocadoTitulo(false)}
                  maxLength={120}
                  selectTextOnFocus
                  placeholder="Nombre de la misión"
                  placeholderTextColor={TINTA_50}
                  className="mt-3 bg-papel-crudo px-5 py-4 font-archivo text-sm text-tinta"
                  style={estiloInput(enfocadoTitulo)}
                />
                <View className="mt-3 flex-row items-center justify-between gap-3">
                  <View className="flex-1 flex-row flex-wrap gap-x-3 gap-y-1">
                    {missionPassport ? (
                      <>
                        <Text className="font-space text-[10px] text-tinta-50">{missionPassport.minIndependentVerifications} miradas independientes</Text>
                        <Text className="font-space text-[10px] text-tinta-50">{sharedPrecisionLabel(missionPassport.publicPrecision)} pública</Text>
                        <Text className="font-space text-[10px] text-tinta-50">{missionPassport.retentionDays} días</Text>
                      </>
                    ) : (
                      <Text className="font-space text-[10px] text-ambar">Elegí el tipo para definir su pasaporte.</Text>
                    )}
                  </View>
                  <BotonTinta
                    etiqueta="Fundar misión →"
                    accessibilityLabel="Fundar misión territorial"
                    disabled={!title.trim() || !missionPassport || creating}
                    cargando={creating}
                    onPress={createMission}
                  />
                </View>
              </>
            )}
            {error && (
              <View accessibilityLiveRegion="polite" className="mt-3 border border-ambar px-4 py-3">
                <Text className="font-archivo text-xs leading-5 text-tinta-90">{error}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-center font-archivo text-xs leading-5 text-tinta-50">
            Tocá Lazo y rodeá una zona. El trazo se convertirá en celdas, rutas y una condición de cierre explícita.
          </Text>
        )}
      </View>
    </View>
  );
}
