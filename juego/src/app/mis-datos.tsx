import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GeoAttributionCard,
  isGeoAttributionReady,
} from '@/components/civic/GeoAttributionCard';
import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  authorizedFieldsForReceipt,
  disclosureReceiptsAll,
} from '@/civic/disclosure-ledger';
import { readableAuthorizedFields } from '@/civic/disclosure-receipt';
import {
  contextAttributionSummary,
  contextLocationSummary,
  recordContextDraftFor,
  recordContextFor,
  sharedPrecisionLabel,
} from '@/civic/record-context';
import {
  deleteCustodiedNeedDraft,
  listeningByNeedId,
  needCustodyByNeedId,
} from '@/civic/listening';
import { civicCategoryLabel } from '@/civic/labels';
import { needAccessGrantsForNeed, needGrantStatusAt } from '@/civic/need-access-grants';
import {
  needsAll,
  observationsAll,
  resourcesAll,
  updateNeedContext,
  updateObservationContext,
  updateResourceContext,
  withdrawNeed,
  withdrawObservation,
  withdrawResource,
} from '@/civic/repo';
import type {
  CivicDisclosureReceiptRow,
  CivicNeedRow,
  CivicObservationRow,
  CivicRecordContextRow,
  CivicResourceRow,
} from '@/db/schema';
import type {
  CivicDisclosureEntity,
  CivicRecordContextDraft,
  CivicRecordContextInput,
  LocationPrecision,
} from '@/civic/types';
import { fadeUp, staggerDelay } from '@/motion/variants';

type Filter = 'all' | CivicDisclosureEntity;

interface ManagedRecord {
  key: string;
  entityType: CivicDisclosureEntity;
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  locationLabel: string | null;
  publicLat: number | null;
  publicLng: number | null;
  publicPrecision: LocationPrecision;
  context: CivicRecordContextRow | null;
  receipts: CivicDisclosureReceiptRow[];
  privateOnly: boolean;
  listeningId: string | null;
  grantCount: number;
  hasActiveGrant: boolean;
  hasPrivateDelivery: boolean;
}

const ENTITY_META: Record<CivicDisclosureEntity, {
  singular: string;
  plural: string;
  icon: string;
  color: string;
}> = {
  observation: {
    singular: 'Observación',
    plural: 'Observaciones',
    icon: 'eye-outline',
    color: '#7DD3FC',
  },
  need: {
    singular: 'Necesidad',
    plural: 'Necesidades',
    icon: 'alert-circle-outline',
    color: '#FCD34D',
  },
  resource: {
    singular: 'Recurso',
    plural: 'Recursos',
    icon: 'hand-left-outline',
    color: '#6EE7B7',
  },
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Listo bajo custodia',
  queued: 'En cola',
  synced: 'Compartido',
  needs_review: 'Pide revisión',
  corroborated: 'Corroborado',
  stale: 'Desactualizado',
  unsafe: 'En resguardo',
  submitted: 'Publicado',
  matched: 'Con conexión',
  in_progress: 'En acción',
  resolved: 'Resuelto',
  reopened: 'Reabierto',
  available: 'Disponible',
  reserved: 'Reservado',
  depleted: 'Agotado',
  expired: 'Vencido',
  withdrawn: 'Retirado',
};

const withdrawn = (record: ManagedRecord): boolean => record.status === 'withdrawn';

const displayDate = (value: string): string => {
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

const publicPrecisionDraft = (
  precision: LocationPrecision,
): CivicRecordContextDraft['sharedPrecision'] => precision === 'exact' ? '100m' : precision;

const fallbackDraftFor = (record: ManagedRecord): CivicRecordContextDraft =>
  recordContextDraftFor(record.entityType, record.id, {
    point: record.publicLat == null || record.publicLng == null
      ? null
      : { lat: record.publicLat, lng: record.publicLng },
    locationSource: record.publicLat == null ? 'none' : 'imported_public',
    sharedPrecision: publicPrecisionDraft(record.publicPrecision),
    locationLabel: record.locationLabel ?? '',
    audience: 'collective',
    sensitivity: record.entityType === 'need'
      ? 'high'
      : record.entityType === 'resource'
        ? 'low'
        : 'moderate',
  });

const canManage = (
  context: CivicRecordContextRow | null,
  status: string,
  receipts: CivicDisclosureReceiptRow[],
): boolean => context?.audience === 'collective' || status === 'withdrawn' || receipts.length > 0;

const managedRecords = (): ManagedRecord[] => {
  const allReceipts = disclosureReceiptsAll();
  const receiptsFor = (entityType: CivicDisclosureEntity, entityId: string) => allReceipts
    .filter((receipt) => receipt.entityType === entityType && receipt.entityId === entityId);

  const observations = observationsAll()
    .filter((row) => !row.creatorKey?.startsWith('remote:'))
    .map((row: CivicObservationRow): ManagedRecord => {
      const receipts = receiptsFor('observation', row.id);
      const context = recordContextFor('observation', row.id);
      return {
        key: `observation:${row.id}`,
        entityType: 'observation',
        id: row.id,
        title: row.title,
        category: row.category,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        locationLabel: row.locationLabel,
        publicLat: row.publicLat,
        publicLng: row.publicLng,
        publicPrecision: row.publicPrecision,
        context,
        receipts,
        privateOnly: false,
        listeningId: null,
        grantCount: 0,
        hasActiveGrant: false,
        hasPrivateDelivery: false,
      };
    });

  const needs = needsAll()
    .filter((row) => row.ownedByMe)
    .map((row: CivicNeedRow): ManagedRecord => {
      const receipts = receiptsFor('need', row.id);
      const context = recordContextFor('need', row.id);
      const custody = needCustodyByNeedId(row.id);
      const listening = custody ? listeningByNeedId(row.id) : null;
      const grants = custody ? needAccessGrantsForNeed(row.id) : [];
      return {
        key: `need:${row.id}`,
        entityType: 'need',
        id: row.id,
        title: row.title,
        category: row.category,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        locationLabel: row.locationLabel,
        publicLat: row.publicLat,
        publicLng: row.publicLng,
        publicPrecision: row.publicPrecision,
        context,
        receipts,
        privateOnly: custody != null && context?.audience === 'private' && receipts.length === 0,
        listeningId: listening?.id ?? null,
        grantCount: grants.length,
        hasActiveGrant: grants.some((grant) => needGrantStatusAt(grant) === 'active'),
        hasPrivateDelivery: grants.some((grant) => grant.deliveredAt != null),
      };
    })
    .filter((record) => record.privateOnly || canManage(record.context, record.status, record.receipts));

  const resources = resourcesAll()
    .filter((row) => row.ownedByMe)
    .map((row: CivicResourceRow): ManagedRecord => {
      const receipts = receiptsFor('resource', row.id);
      const context = recordContextFor('resource', row.id);
      return {
        key: `resource:${row.id}`,
        entityType: 'resource',
        id: row.id,
        title: row.title,
        category: row.category,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        locationLabel: row.locationLabel,
        publicLat: row.publicLat,
        publicLng: row.publicLng,
        publicPrecision: row.publicPrecision,
        context,
        receipts,
        privateOnly: false,
        listeningId: null,
        grantCount: 0,
        hasActiveGrant: false,
        hasPrivateDelivery: false,
      };
    });

  return [
    ...observations.filter((record) => canManage(record.context, record.status, record.receipts)),
    ...needs,
    ...resources.filter((record) => canManage(record.context, record.status, record.receipts)),
  ]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

const locationSummary = (record: ManagedRecord): string => {
  if (record.context) return contextLocationSummary(record.context);
  if (record.publicLat == null || record.publicLng == null) return 'Sin lugar confirmado';
  return `${record.locationLabel ?? 'Punto sin nombre'} · ${sharedPrecisionLabel(record.publicPrecision)}`;
};

const attributionSummary = (record: ManagedRecord): string => record.context
  ? contextAttributionSummary(record.context)
  : 'Sin firma visible · registro anterior al pasaporte de autoría';

const audienceLabel = (value: CivicDisclosureReceiptRow['audience']): string => {
  if (value === 'collective') return 'Red colectiva';
  if (value === 'circle') return 'Círculo';
  if (value === 'counterpart') return 'Contraparte';
  return 'Local · no sincronizado';
};

const buildContextInput = (draft: CivicRecordContextDraft): CivicRecordContextInput => ({
  point: draft.point,
  locationSource: draft.locationSource,
  horizontalAccuracyM: draft.horizontalAccuracyM,
  capturedAt: draft.capturedAt,
  sharedPrecision: draft.sharedPrecision,
  locationLabel: draft.locationLabel,
  audience: 'collective',
  attributionMode: draft.attributionMode,
  attributionName: draft.attributionName,
  sensitivity: draft.sensitivity,
  locationConsent: true,
  attributionConsent: draft.attributionMode !== 'anonymous',
  confirmedAt: new Date().toISOString(),
});

function ReceiptHistory({ record }: { record: ManagedRecord }) {
  if (record.receipts.length === 0) {
    return (
      <View className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
        <Text className="font-sans text-xs leading-5 text-amber-100">
          Este aporte es anterior al libro de recibos de esta instalación. Podés corregirlo o retirarlo; la próxima acción dejará un asiento verificable.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4 gap-3">
      {record.receipts.map((receipt) => {
        const fields = readableAuthorizedFields(authorizedFieldsForReceipt(receipt));
        const isRevocation = receipt.kind === 'revocation';
        return (
          <View
            key={receipt.id}
            className="rounded-2xl border p-4"
            style={{
              borderColor: isRevocation ? '#FB718533' : '#6EE7B733',
              backgroundColor: isRevocation ? '#FB71850C' : '#6EE7B70C',
            }}
          >
            <View className="flex-row items-start">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: isRevocation ? '#FB71851A' : '#6EE7B71A' }}
              >
                <Ionicons
                  name={isRevocation ? 'remove-circle-outline' : 'receipt-outline'}
                  size={17}
                  color={isRevocation ? '#FDA4AF' : '#6EE7B7'}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="font-sans-semibold text-xs uppercase tracking-[1.6px]"
                  style={{ color: isRevocation ? '#FDA4AF' : '#6EE7B7' }}
                >
                  {isRevocation ? 'Revocación asentada' : 'Divulgación asentada'}
                </Text>
                <Text className="mt-1 font-mono text-[10px] text-slate-500">{displayDate(receipt.recordedAt)}</Text>
              </View>
            </View>

            <View className="mt-4 gap-1.5">
              <Text className="font-sans text-xs leading-5 text-slate-300">Audiencia: {audienceLabel(receipt.audience)}</Text>
              <Text className="font-sans text-xs leading-5 text-slate-300">Mapa: {sharedPrecisionLabel(receipt.sharedPrecision)}</Text>
              <Text className="font-sans text-xs leading-5 text-slate-300">
                Firma: {receipt.attributionMode === 'anonymous' ? 'sin firma visible' : receipt.attributionName ?? 'declarada'}
              </Text>
              <Text className="font-sans text-xs leading-5 text-slate-300">
                Campos autorizados: {fields.length > 0 ? fields.join(', ') : 'ninguno'}
              </Text>
            </View>

            <Text className="mt-3 font-sans text-[11px] leading-5 text-slate-500">{receipt.purpose}</Text>
            <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1 border-t border-white/[0.06] pt-3">
              <Text className="font-mono text-[9px] text-slate-600">recibo …{receipt.id.slice(-8)}</Text>
              <Text className="font-mono text-[9px] text-slate-600">política v{receipt.policyVersion}</Text>
              {receipt.revokesReceiptId && (
                <Text className="font-mono text-[9px] text-slate-600">revoca …{receipt.revokesReceiptId.slice(-8)}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function MisDatos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<ManagedRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState<string | null>(null);
  const [withdrawKey, setWithdrawKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<CivicRecordContextDraft | null>(null);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);

  const refresh = useCallback(() => setRecords(managedRecords()), []);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  const beginEdit = (record: ManagedRecord) => {
    setWithdrawKey(null);
    setHistoryKey(null);
    setEditingKey(record.key);
    setDraft(fallbackDraftFor(record));
    setNotice(null);
  };

  const saveCorrection = (record: ManagedRecord) => {
    if (!draft || !isGeoAttributionReady(draft) || busyKey) return;
    setBusyKey(record.key);
    setNotice(null);
    try {
      const input = buildContextInput(draft);
      const updated = record.entityType === 'observation'
        ? updateObservationContext(record.id, input)
        : record.entityType === 'need'
          ? updateNeedContext(record.id, input)
          : updateResourceContext(record.id, input);
      if (!updated) throw new Error('record_not_updated');
      refresh();
      setEditingKey(null);
      setDraft(null);
      setNotice({ message: 'Corrección guardada. La red recibirá la nueva versión y quedó asentado un recibo.' });
    } catch {
      setNotice({ message: 'No pudimos guardar la corrección. Tus datos anteriores siguen intactos.', error: true });
    } finally {
      setBusyKey(null);
    }
  };

  const confirmWithdrawal = (record: ManagedRecord) => {
    if (busyKey) return;
    setBusyKey(record.key);
    setNotice(null);
    try {
      if (record.privateOnly) {
        if (!deleteCustodiedNeedDraft(record.id)) throw new Error('private_draft_not_deleted');
        refresh();
        setWithdrawKey(null);
        setNotice({ message: 'Pedido local eliminado. La escucha privada original sigue en tu bitácora.' });
        return;
      }
      const updated = record.entityType === 'observation'
        ? withdrawObservation(record.id)
        : record.entityType === 'need'
          ? withdrawNeed(record.id)
          : withdrawResource(record.id);
      if (!updated) throw new Error('record_not_withdrawn');
      refresh();
      setWithdrawKey(null);
      setEditingKey(null);
      setDraft(null);
      setNotice({ message: 'Retiro asentado. El registro deja de estar vigente en la red sin borrar su historia.' });
    } catch {
      setNotice({ message: 'No pudimos asentar el retiro. El registro sigue vigente y podés reintentar.', error: true });
    } finally {
      setBusyKey(null);
    }
  };

  const visible = filter === 'all'
    ? records
    : records.filter((record) => record.entityType === filter);
  const activeCount = records.filter((record) => !withdrawn(record)).length;
  const withdrawnCount = records.length - activeCount;
  const receiptCount = records.reduce((total, record) => total + record.receipts.length, 0);

  const filters: readonly [Filter, string, number][] = [
    ['all', 'Todos', records.length],
    ['observation', 'Señales', records.filter((item) => item.entityType === 'observation').length],
    ['need', 'Necesidades', records.filter((item) => item.entityType === 'need').length],
    ['resource', 'Recursos', records.filter((item) => item.entityType === 'resource').length],
  ];

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Mis datos" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[28px] border border-violet-300/20">
          <LinearGradient
            colors={['#1A132B', '#0E0D16', '#090909']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}
          >
            <LivingHalo color="#A78BFA" />
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
              <Ionicons name="finger-print-outline" size={23} color="#C4B5FD" />
            </View>
            <Text className="mt-5 font-serif text-[30px] leading-[37px] text-plata">Goberná lo que guardás y compartís.</Text>
            <Text className="mt-3 max-w-[340px] font-sans text-sm leading-6 text-slate-400">
              Revisá lo que guardaste, corregí lo que autorizaste y retiralo cuando deje de representar la realidad.
            </Text>
            <View className="mt-6 flex-row gap-6">
              {[
                [activeCount, 'vigentes'],
                [withdrawnCount, 'retirados'],
                [receiptCount, 'recibos'],
              ].map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-mono text-xl text-plata">{value}</Text>
                  <Text className="mt-0.5 font-sans text-[10px] uppercase tracking-[1.5px] text-slate-500">{label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-4">
          <Ionicons name="shield-checkmark-outline" size={17} color="#7DD3FC" />
          <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-400">
            Un retiro no borra el pasado ni tus datos locales: agrega una revocación auditable y saca el aporte de circulación. Tu punto exacto nunca aparece en estos recibos.
          </Text>
        </View>

        {notice && (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 flex-row items-start gap-3 rounded-2xl border p-4"
            style={{
              borderColor: notice.error ? '#FB718533' : '#6EE7B733',
              backgroundColor: notice.error ? '#FB71850C' : '#6EE7B70C',
            }}
          >
            <Ionicons
              name={notice.error ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color={notice.error ? '#FDA4AF' : '#6EE7B7'}
            />
            <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">{notice.message}</Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 24, paddingBottom: 4 }}
        >
          {filters.map(([key, label, count]) => {
            const selected = filter === key;
            return (
              <Pressable97
                key={key}
                accessibilityRole="tab"
                accessibilityLabel={`${label}, ${count}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setFilter(key);
                  setEditingKey(null);
                  setWithdrawKey(null);
                  setHistoryKey(null);
                }}
                className="min-h-11 flex-row items-center justify-center gap-2 rounded-full border px-4"
                style={{
                  borderColor: selected ? '#A78BFA55' : '#FFFFFF18',
                  backgroundColor: selected ? '#A78BFA18' : '#FFFFFF08',
                }}
              >
                <Text className="font-sans-semibold text-xs" style={{ color: selected ? '#DDD6FE' : '#94A3B8' }}>{label}</Text>
                <Text className="font-mono text-[10px] text-slate-500">{count}</Text>
              </Pressable97>
            );
          })}
        </ScrollView>

        {visible.length === 0 ? (
          <Animated.View entering={fadeUp} className="mt-6">
            <GlassCard className="items-center p-7">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
                <Ionicons name="leaf-outline" size={24} color="#94A3B8" />
              </View>
              <Text className="mt-5 text-center font-serif text-2xl text-plata">Nada bajo este filtro.</Text>
              <Text className="mt-3 max-w-[310px] text-center font-sans text-sm leading-6 text-slate-400">
                Acá aparecen pedidos privados bajo custodia, aportes que autorizaste para la red y los que retiraste.
              </Text>
              <View className="mt-6 flex-row gap-3">
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Volver al territorio"
                  onPress={() => router.push('/territorio')}
                  className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
                >
                  <Text className="font-sans-semibold text-xs text-slate-200">Ir al territorio</Text>
                </Pressable97>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Aportar un recurso"
                  onPress={() => router.push('/aportar')}
                  className="min-h-12 items-center justify-center rounded-full bg-accent px-5"
                >
                  <Text className="font-sans-semibold text-xs text-white">Aportar</Text>
                </Pressable97>
              </View>
            </GlassCard>
          </Animated.View>
        ) : (
          <View className="mt-6 gap-4">
            {visible.map((record, index) => {
              const meta = ENTITY_META[record.entityType];
              const isWithdrawn = withdrawn(record);
              const editing = editingKey === record.key;
              const confirming = withdrawKey === record.key;
              const historyOpen = historyKey === record.key;
              const busy = busyKey === record.key;
              const privateOnly = record.privateOnly;
              return (
                <Animated.View key={record.key} entering={staggerDelay(Math.min(index, 8))}>
                  <GlassCard className="overflow-hidden p-0">
                    <View className="p-5">
                      <View className="flex-row items-start">
                        <View
                          className="h-11 w-11 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${meta.color}18` }}
                        >
                          <Ionicons name={meta.icon as never} size={20} color={meta.color} />
                        </View>
                        <View className="ml-3 flex-1">
                          <View className="flex-row flex-wrap items-center gap-2">
                            <Text className="font-sans text-[10px] uppercase tracking-[1.8px]" style={{ color: meta.color }}>{meta.singular}</Text>
                            <View
                              className="rounded-full border px-2 py-1"
                              style={{
                                borderColor: isWithdrawn ? '#FB718533' : '#FFFFFF16',
                                backgroundColor: isWithdrawn ? '#FB718510' : '#FFFFFF08',
                              }}
                            >
                              <Text className="font-sans-medium text-[9px]" style={{ color: isWithdrawn ? '#FDA4AF' : '#94A3B8' }}>
                                {STATUS_LABELS[record.status] ?? record.status}
                              </Text>
                            </View>
                            {privateOnly && (
                              <View className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2 py-1">
                                <Text className="font-sans-medium text-[9px] text-emerald-200">
                                  {record.hasPrivateDelivery ? 'Fuera del feed público' : 'Sólo local'}
                                </Text>
                              </View>
                            )}
                            {record.grantCount > 0 && (
                              <View className="rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-2 py-1">
                                <Text className="font-sans-medium text-[9px] text-sky-200">{record.hasActiveGrant ? 'Permiso vigente' : 'Historial de permiso'}</Text>
                              </View>
                            )}
                          </View>
                          <Text className="mt-2 font-serif text-xl leading-7 text-plata">{record.title}</Text>
                          <Text className="mt-1 font-sans text-[11px] text-slate-500">{civicCategoryLabel(record.category)}</Text>
                        </View>
                      </View>

                      <View className="mt-5 gap-3 rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                        <View className="flex-row items-start gap-2.5">
                          <Ionicons name="location-outline" size={16} color="#94A3B8" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">{locationSummary(record)}</Text>
                        </View>
                        <View className="flex-row items-start gap-2.5">
                          <Ionicons name="person-circle-outline" size={16} color="#94A3B8" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">{attributionSummary(record)}</Text>
                        </View>
                        <View className="flex-row items-start gap-2.5">
                          <Ionicons name="time-outline" size={16} color="#64748B" />
                          <Text className="flex-1 font-mono text-[10px] leading-5 text-slate-500">Último cambio · {displayDate(record.updatedAt)}</Text>
                        </View>
                      </View>

                      <View className="mt-4 flex-row gap-2">
                        {!privateOnly && <Pressable97
                          accessibilityRole="button"
                          accessibilityLabel={`${historyOpen ? 'Ocultar' : 'Ver'} historial de ${record.receipts.length} recibos`}
                          accessibilityState={{ expanded: historyOpen }}
                          onPress={() => {
                            setHistoryKey(historyOpen ? null : record.key);
                            setEditingKey(null);
                            setWithdrawKey(null);
                          }}
                          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3"
                        >
                          <Ionicons name="receipt-outline" size={16} color="#CBD5E1" />
                          <Text className="font-sans-semibold text-xs text-slate-200">Recibos · {record.receipts.length}</Text>
                        </Pressable97>}
                        {!isWithdrawn && !privateOnly && (
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel={`Corregir lugar o firma de ${record.title}`}
                            onPress={() => editing ? (setEditingKey(null), setDraft(null)) : beginEdit(record)}
                            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-300/[0.08] px-3"
                          >
                            <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={16} color="#C4B5FD" />
                            <Text className="font-sans-semibold text-xs text-violet-200">{editing ? 'Cerrar' : 'Corregir'}</Text>
                          </Pressable97>
                        )}
                        {privateOnly && record.listeningId && (
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel={`Abrir custodia de ${record.title}`}
                            onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: record.listeningId! } })}
                            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] px-3"
                          >
                            <Ionicons name="shield-checkmark-outline" size={16} color="#FDA4AF" />
                            <Text className="font-sans-semibold text-xs text-rose-100">Abrir custodia</Text>
                          </Pressable97>
                        )}
                      </View>

                      {historyOpen && <ReceiptHistory record={record} />}
                    </View>

                    {editing && draft && (
                      <View className="border-t border-white/10 bg-black/10 p-4">
                        <GeoAttributionCard
                          value={draft}
                          onChange={setDraft}
                          title="Corregí el pasaporte del aporte"
                          description="Confirmá el lugar del asunto y la firma que verá la red. Guardar crea una nueva versión; los recibos anteriores no se reescriben."
                          accent={meta.color}
                        />
                        <View className="mt-3 flex-row gap-3">
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar corrección"
                            onPress={() => { setEditingKey(null); setDraft(null); }}
                            className="min-h-12 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
                          >
                            <Text className="font-sans-semibold text-xs text-slate-300">Cancelar</Text>
                          </Pressable97>
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel="Guardar corrección y nuevo recibo"
                            accessibilityHint={!isGeoAttributionReady(draft) ? 'Primero confirmá el pin, la referencia y la firma' : undefined}
                            disabled={!isGeoAttributionReady(draft) || busy}
                            onPress={() => saveCorrection(record)}
                            className={`min-h-12 flex-[1.35] items-center justify-center rounded-full bg-accent px-5 ${isGeoAttributionReady(draft) && !busy ? '' : 'opacity-40'}`}
                          >
                            <Text className="font-sans-semibold text-xs text-white">{busy ? 'Guardando…' : 'Guardar versión'}</Text>
                          </Pressable97>
                        </View>
                      </View>
                    )}

                    <View className="border-t border-white/[0.06] px-5 py-4">
                      {privateOnly && record.grantCount > 0 ? (
                        <View className="flex-row items-start gap-3 rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-4">
                          <Ionicons name="key-outline" size={18} color="#7DD3FC" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-slate-400">
                            {record.hasActiveGrant ? 'Este pedido tiene un permiso destinatario vigente.' : 'Este pedido conserva historia de permisos.'} Abrí la custodia para revisarlo o revocarlo. El borrado individual queda bloqueado para no eliminar el acta; “Borrar todo” en Ajustes elimina la copia local completa.
                          </Text>
                        </View>
                      ) : privateOnly && confirming ? (
                        <View className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-4">
                          <Text className="font-sans-semibold text-sm text-rose-100">¿Eliminar este pedido local?</Text>
                          <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">
                            Borra el pedido y su custodia de este dispositivo. La escucha privada original permanece en la bitácora; no hay revocación remota porque nunca se envió.
                          </Text>
                          <View className="mt-4 flex-row gap-3">
                            <Pressable97 accessibilityRole="button" accessibilityLabel="Conservar pedido local" onPress={() => setWithdrawKey(null)} className="min-h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4">
                              <Text className="font-sans-semibold text-xs text-slate-300">Conservar</Text>
                            </Pressable97>
                            <Pressable97 accessibilityRole="button" accessibilityLabel={`Confirmar eliminación local de ${record.title}`} disabled={busy} onPress={() => confirmWithdrawal(record)} className={`min-h-11 flex-1 items-center justify-center rounded-full bg-rose-400 px-4 ${busy ? 'opacity-40' : ''}`}>
                              <Text className="font-sans-semibold text-xs text-slate-950">{busy ? 'Eliminando…' : 'Sí, eliminar'}</Text>
                            </Pressable97>
                          </View>
                        </View>
                      ) : privateOnly ? (
                        <View className="gap-3">
                        <View className="flex-row items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                          <Ionicons name="lock-closed-outline" size={18} color="#6EE7B7" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-slate-400">
                            Pedido no sincronizado: permanece en el almacenamiento de esta app en este dispositivo. No existe recibo de divulgación ni retiro remoto porque todavía no salió a la red. Este almacenamiento aún no tiene cifrado propio de la app.
                          </Text>
                        </View>
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel={`Eliminar ${record.title} de este dispositivo`}
                            accessibilityHint="Abre una confirmación; no afecta la escucha privada original"
                            onPress={() => {
                              setWithdrawKey(record.key);
                              setEditingKey(null);
                              setDraft(null);
                              setHistoryKey(null);
                              setNotice(null);
                            }}
                            className="min-h-11 flex-row items-center justify-center gap-2 rounded-full px-4"
                          >
                            <Ionicons name="trash-outline" size={16} color="#FDA4AF" />
                            <Text className="font-sans-semibold text-xs text-rose-200">Eliminar del dispositivo</Text>
                          </Pressable97>
                        </View>
                      ) : isWithdrawn ? (
                        <View className="flex-row items-start gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.05] p-4">
                          <Ionicons name="remove-circle-outline" size={18} color="#FDA4AF" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-slate-400">
                            Retirado de circulación. Su historia y sus recibos quedan disponibles para auditar qué ocurrió.
                          </Text>
                        </View>
                      ) : confirming ? (
                        <View className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-4">
                          <Text className="font-sans-semibold text-sm text-rose-100">¿Retirar este aporte de la red?</Text>
                          <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">
                            Dejará de estar vigente y se enviará una revocación. No se borrarán sus vínculos, su historia ni la copia privada de este dispositivo.
                          </Text>
                          <View className="mt-4 flex-row gap-3">
                            <Pressable97
                              accessibilityRole="button"
                              accessibilityLabel="Cancelar retiro"
                              onPress={() => setWithdrawKey(null)}
                              className="min-h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4"
                            >
                              <Text className="font-sans-semibold text-xs text-slate-300">Conservar</Text>
                            </Pressable97>
                            <Pressable97
                              accessibilityRole="button"
                              accessibilityLabel={`Confirmar retiro de ${record.title}`}
                              disabled={busy}
                              onPress={() => confirmWithdrawal(record)}
                              className={`min-h-11 flex-1 items-center justify-center rounded-full bg-rose-400 px-4 ${busy ? 'opacity-40' : ''}`}
                            >
                              <Text className="font-sans-semibold text-xs text-slate-950">{busy ? 'Asentando…' : 'Sí, retirar'}</Text>
                            </Pressable97>
                          </View>
                        </View>
                      ) : (
                        <Pressable97
                          accessibilityRole="button"
                          accessibilityLabel={`Retirar ${record.title} de la red`}
                          accessibilityHint="Abre una confirmación antes de asentar la revocación"
                          onPress={() => {
                            setWithdrawKey(record.key);
                            setEditingKey(null);
                            setDraft(null);
                            setHistoryKey(null);
                            setNotice(null);
                          }}
                          className="min-h-11 flex-row items-center justify-center gap-2 rounded-full px-4"
                        >
                          <Ionicons name="remove-circle-outline" size={16} color="#FDA4AF" />
                          <Text className="font-sans-semibold text-xs text-rose-200">Retirar de la red</Text>
                        </Pressable97>
                      )}
                    </View>
                  </GlassCard>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <Text className="font-sans text-[10px] uppercase tracking-[2px] text-slate-500">Principio de soberanía</Text>
          <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">
            La comunidad puede recordar que un dato existió sin obligarte a mantenerlo vigente. Corregir agrega contexto; retirar corta su circulación; nada altera silenciosamente el libro anterior.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
