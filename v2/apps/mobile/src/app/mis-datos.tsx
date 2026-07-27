/**
 * Mis datos: panel de soberanía sobre lo que guardaste y compartiste —
 * corregir el pasaporte de un aporte, retirarlo de la red o borrar un
 * pedido privado que nunca salió de este dispositivo. Toda la lógica de
 * disclosure-ledger/record-context queda intacta; esta pantalla sólo la
 * expone.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): pantalla profunda,
 * título sin entintar. Guardar una corrección, asentar un retiro o borrar
 * un pedido local no son entradas del catálogo cerrado de sellos (spec
 * §5) — quedan como nota de borde plana (ambar/verde), nunca un Sello
 * inventado. Las zonas de borrado/retiro siguen el patrón «abandonar
 * misión»: caja de borde sello, segundo toque explícito, BotonTinta para
 * el par confirmar/cancelar.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GeoAttributionCard,
  isGeoAttributionReady,
} from '@/components/civic/GeoAttributionCard';
import {
  BotonTinta,
  ChipTipo,
  FilaIndice,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
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
import { AMBAR_PT, CIAN, ROJO_SELLO, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

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

/** Sólo alimenta el `accent` de GeoAttributionCard (todavía sin migrar);
 * no es un color de estado ni se pinta en ningún chip (spec: los tipos de
 * entidad son categóricos, spec §2). */
const ENTITY_META: Record<CivicDisclosureEntity, { singular: string; plural: string; color: string }> = {
  observation: { singular: 'Observación', plural: 'Observaciones', color: CIAN },
  need: { singular: 'Necesidad', plural: 'Necesidades', color: AMBAR_PT },
  resource: { singular: 'Recurso', plural: 'Recursos', color: VERDE },
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

/** Estado del registro → color (spec: pendiente/en curso → violeta,
 * confirmado/activo → verde, en resguardo → sello, vencido → ámbar,
 * retirado/agotado → tinta-50). */
const STATUS_COLOR: Record<string, string> = {
  draft: VIOLETA,
  queued: VIOLETA,
  synced: VERDE,
  needs_review: AMBAR_PT,
  corroborated: VERDE,
  stale: AMBAR_PT,
  unsafe: ROJO_SELLO,
  submitted: VERDE,
  matched: VIOLETA,
  in_progress: VIOLETA,
  resolved: VERDE,
  reopened: VIOLETA,
  available: VERDE,
  reserved: VIOLETA,
  depleted: TINTA_50,
  expired: AMBAR_PT,
  withdrawn: TINTA_50,
};

const statusColorFor = (status: string): string => STATUS_COLOR[status] ?? TINTA_50;

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
      <View className="mt-4 border border-ambar px-4 py-3">
        <Text className="font-archivo text-xs leading-5 text-tinta-90">
          Este aporte es anterior al libro de recibos de esta instalación. Podés corregirlo o retirarlo; la próxima acción dejará un asiento verificable.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      {record.receipts.map((receipt, index) => {
        const fields = readableAuthorizedFields(authorizedFieldsForReceipt(receipt));
        const isRevocation = receipt.kind === 'revocation';
        return (
          <FilaIndice key={receipt.id} numero={String(index + 1).padStart(2, '0')} glifo="">
            <View className="flex-row items-center justify-between gap-2">
              <ChipTipo
                etiqueta={isRevocation ? 'Revocación asentada' : 'Divulgación asentada'}
                activo
                color={isRevocation ? TINTA_50 : VERDE}
              />
              <Text className="font-space text-[10px] text-tinta-30">{displayDate(receipt.recordedAt)}</Text>
            </View>

            <View className="mt-3 gap-1">
              <Text className="font-archivo text-xs leading-5 text-tinta-75">Audiencia: {audienceLabel(receipt.audience)}</Text>
              <Text className="font-archivo text-xs leading-5 text-tinta-75">Mapa: {sharedPrecisionLabel(receipt.sharedPrecision)}</Text>
              <Text className="font-archivo text-xs leading-5 text-tinta-75">
                Firma: {receipt.attributionMode === 'anonymous' ? 'sin firma visible' : receipt.attributionName ?? 'declarada'}
              </Text>
              <Text className="font-archivo text-xs leading-5 text-tinta-75">
                Campos autorizados: {fields.length > 0 ? fields.join(', ') : 'ninguno'}
              </Text>
            </View>

            <Text className="mt-3 font-archivo text-[11px] leading-5 text-tinta-50">{receipt.purpose}</Text>
            <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1 border-t border-bordeSuave pt-3">
              <Text className="font-space text-[9px] text-tinta-30">recibo …{receipt.id.slice(-8)}</Text>
              <Text className="font-space text-[9px] text-tinta-30">política v{receipt.policyVersion}</Text>
              {receipt.revokesReceiptId && (
                <Text className="font-space text-[9px] text-tinta-30">revoca …{receipt.revokesReceiptId.slice(-8)}</Text>
              )}
            </View>
          </FilaIndice>
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
          <Kicker>lo que guardaste, lo que compartís</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Mis datos</TituloAnton>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View entering={fadeUp} className="mt-1">
          <PapelCard className="p-6">
            <TituloAnton tamano="md">Goberná lo que guardás y compartís.</TituloAnton>
            <Text className="mt-3 max-w-[340px] font-archivo text-sm leading-6 text-tinta-75">
              Revisá lo que guardaste, corregí lo que autorizaste y retiralo cuando deje de representar la realidad.
            </Text>
            <View className="mt-6 flex-row gap-6">
              {[
                [activeCount, 'vigentes'],
                [withdrawnCount, 'retirados'],
                [receiptCount, 'recibos'],
              ].map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-space text-xl text-tinta">{value}</Text>
                  <Text className="mt-0.5 font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">{label}</Text>
                </View>
              ))}
            </View>
          </PapelCard>
        </Animated.View>

        <View className="mt-4 border border-cian px-4 py-3">
          <Text className="font-archivo text-[11px] leading-5 text-tinta-75">
            Un retiro no borra el pasado ni tus datos locales: agrega una revocación auditable y saca el aporte de circulación. Tu punto exacto nunca aparece en estos recibos.
          </Text>
        </View>

        {notice && (
          <View
            accessibilityLiveRegion="polite"
            className={`mt-4 border px-4 py-3 ${notice.error ? 'border-ambar' : 'border-verde'}`}
          >
            <Text className="font-archivo text-xs leading-5 text-tinta-90">{notice.message}</Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 24, paddingBottom: 4 }}
        >
          {filters.map(([key, label, count]) => (
            <ChipTipo
              key={key}
              etiqueta={`${label} · ${count}`}
              activo={filter === key}
              accessibilityLabel={`${label}, ${count}`}
              onPress={() => {
                setFilter(key);
                setEditingKey(null);
                setWithdrawKey(null);
                setHistoryKey(null);
              }}
            />
          ))}
        </ScrollView>

        {visible.length === 0 ? (
          <Animated.View entering={fadeUp} className="mt-6">
            <PapelCard className="items-center p-7">
              <TituloAnton tamano="md" className="text-center">Nada bajo este filtro.</TituloAnton>
              <Text className="mt-3 max-w-[310px] text-center font-archivo text-sm leading-6 text-tinta-75">
                Acá aparecen pedidos privados bajo custodia, aportes que autorizaste para la red y los que retiraste.
              </Text>
              <View className="mt-6 flex-row gap-3">
                <BotonTinta etiqueta="Ir al territorio" variante="fantasma" tamano="compacto" onPress={() => router.push('/territorio')} />
                <BotonTinta etiqueta="Aportar" tamano="compacto" onPress={() => router.push('/aportar')} />
              </View>
            </PapelCard>
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
                  <PapelCard className="p-0">
                    <View className="p-5">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <ChipTipo etiqueta={meta.singular} />
                        <ChipTipo etiqueta={STATUS_LABELS[record.status] ?? record.status} activo color={statusColorFor(record.status)} />
                        {privateOnly && (
                          <ChipTipo etiqueta={record.hasPrivateDelivery ? 'Fuera del feed público' : 'Sólo local'} />
                        )}
                        {record.grantCount > 0 && (
                          <ChipTipo
                            etiqueta={record.hasActiveGrant ? 'Permiso vigente' : 'Historial de permiso'}
                            activo
                            color={record.hasActiveGrant ? VERDE : TINTA_50}
                          />
                        )}
                      </View>
                      <Text className="mt-3 font-archivo-bold text-lg leading-6 text-tinta">{record.title}</Text>
                      <Text className="mt-1 font-archivo text-[11px] text-tinta-50">{civicCategoryLabel(record.category)}</Text>

                      <View className="mt-4 gap-1.5 border-t border-bordeSuave pt-4">
                        <Text className="font-archivo text-xs leading-5 text-tinta-75">{locationSummary(record)}</Text>
                        <Text className="font-archivo text-xs leading-5 text-tinta-75">{attributionSummary(record)}</Text>
                        <Text className="font-space text-[10px] leading-5 text-tinta-30">Último cambio · {displayDate(record.updatedAt)}</Text>
                      </View>

                      <View className="mt-4 flex-row gap-2">
                        {!privateOnly && (
                          <BotonTinta
                            etiqueta={`Recibos · ${record.receipts.length}`}
                            accessibilityLabel={`${historyOpen ? 'Ocultar' : 'Ver'} historial de ${record.receipts.length} recibos`}
                            variante="fantasma"
                            tamano="compacto"
                            className="flex-1"
                            onPress={() => {
                              setHistoryKey(historyOpen ? null : record.key);
                              setEditingKey(null);
                              setWithdrawKey(null);
                            }}
                          />
                        )}
                        {!isWithdrawn && !privateOnly && (
                          <BotonTinta
                            etiqueta={editing ? 'Cerrar' : 'Corregir'}
                            accessibilityLabel={`Corregir lugar o firma de ${record.title}`}
                            variante="fantasma"
                            tamano="compacto"
                            className="flex-1"
                            onPress={() => editing ? (setEditingKey(null), setDraft(null)) : beginEdit(record)}
                          />
                        )}
                        {privateOnly && record.listeningId && (
                          <BotonTinta
                            etiqueta="Abrir custodia"
                            accessibilityLabel={`Abrir custodia de ${record.title}`}
                            variante="fantasma"
                            tamano="compacto"
                            onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: record.listeningId! } })}
                          />
                        )}
                      </View>

                      {historyOpen && <ReceiptHistory record={record} />}
                    </View>

                    {editing && draft && (
                      <View className="border-t border-bordeSuave p-4">
                        <GeoAttributionCard
                          value={draft}
                          onChange={setDraft}
                          title="Corregí el pasaporte del aporte"
                          description="Confirmá el lugar del asunto y la firma que verá la red. Guardar crea una nueva versión; los recibos anteriores no se reescriben."
                          accent={meta.color}
                        />
                        <View className="mt-3 flex-row gap-3">
                          <BotonTinta
                            etiqueta="Cancelar"
                            variante="fantasma"
                            onPress={() => { setEditingKey(null); setDraft(null); }}
                            className="flex-1"
                          />
                          <BotonTinta
                            etiqueta="Guardar versión"
                            disabled={!isGeoAttributionReady(draft) || busy}
                            cargando={busy}
                            onPress={() => saveCorrection(record)}
                            className="flex-[1.35]"
                          />
                        </View>
                      </View>
                    )}

                    <View className="border-t border-bordeSuave px-5 py-4">
                      {privateOnly && record.grantCount > 0 ? (
                        <View className="border border-cian px-4 py-3">
                          <Text className="font-archivo text-xs leading-5 text-tinta-75">
                            {record.hasActiveGrant ? 'Este pedido tiene un permiso destinatario vigente.' : 'Este pedido conserva historia de permisos.'} Abrí la custodia para revisarlo o revocarlo. El borrado individual queda bloqueado para no eliminar el acta; “Borrar todo” en Ajustes elimina la copia local completa.
                          </Text>
                        </View>
                      ) : privateOnly && confirming ? (
                        <View className="border border-sello p-4">
                          <Text className="font-archivo-bold text-sm text-tinta">¿Eliminar este pedido local?</Text>
                          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">
                            Borra el pedido y su custodia de este dispositivo. La escucha privada original permanece en la bitácora; no hay revocación remota porque nunca se envió.
                          </Text>
                          <View className="mt-4 flex-row gap-3">
                            <BotonTinta etiqueta="Conservar" variante="fantasma" onPress={() => setWithdrawKey(null)} className="flex-1" />
                            <BotonTinta
                              etiqueta="Sí, eliminar"
                              variante="fantasma"
                              disabled={busy}
                              cargando={busy}
                              onPress={() => confirmWithdrawal(record)}
                              className="flex-1"
                            />
                          </View>
                        </View>
                      ) : privateOnly ? (
                        <View className="gap-3">
                          <View className="border border-cian px-4 py-3">
                            <Text className="font-archivo text-xs leading-5 text-tinta-75">
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
                            className="min-h-11 flex-row items-center justify-center px-4"
                          >
                            <Text className="font-space text-xs text-tinta-50">Eliminar del dispositivo</Text>
                          </Pressable97>
                        </View>
                      ) : isWithdrawn ? (
                        <View className="border border-tinta-50 px-4 py-3">
                          <Text className="font-archivo text-xs leading-5 text-tinta-75">
                            Retirado de circulación. Su historia y sus recibos quedan disponibles para auditar qué ocurrió.
                          </Text>
                        </View>
                      ) : confirming ? (
                        <View className="border border-sello p-4">
                          <Text className="font-archivo-bold text-sm text-tinta">¿Retirar este aporte de la red?</Text>
                          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">
                            Dejará de estar vigente y se enviará una revocación. No se borrarán sus vínculos, su historia ni la copia privada de este dispositivo.
                          </Text>
                          <View className="mt-4 flex-row gap-3">
                            <BotonTinta etiqueta="Conservar" variante="fantasma" onPress={() => setWithdrawKey(null)} className="flex-1" />
                            <BotonTinta
                              etiqueta="Sí, retirar"
                              variante="fantasma"
                              disabled={busy}
                              cargando={busy}
                              onPress={() => confirmWithdrawal(record)}
                              className="flex-1"
                            />
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
                          className="min-h-11 flex-row items-center justify-center px-4"
                        >
                          <Text className="font-space text-xs text-tinta-50">Retirar de la red</Text>
                        </Pressable97>
                      )}
                    </View>
                  </PapelCard>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View className="mt-7 border border-bordeSuave px-4 py-4">
          <Kicker tono="neutro">Principio de soberanía</Kicker>
          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">
            La comunidad puede recordar que un dato existió sin obligarte a mantenerlo vigente. Corregir agrega contexto; retirar corta su circulación; nada altera silenciosamente el libro anterior.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
