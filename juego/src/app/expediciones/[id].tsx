/**
 * Detalle de expedición (spec §3.2): el progreso como luminosidad, los
 * hitos 25/50/100, el rito de cada captura — y el botón CAPTURAR, que
 * recorre los pasos de la plantilla con su micro-UI propia. Cada captura
 * hace nacer una estrella en el Cielo y enciende la luz de ENCENDER si
 * faltaba. En misiones cívicas, la recompensa se completa al cerrar una
 * celda válida; las expediciones personales conservan su economía clásica.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { BarraLuminosa } from '@/components/juego/BarraLuminosa';
import { MicroUIPaso, pasoValido, type ValorPaso } from '@/components/juego/MicroUIPaso';
import { RangoUpOverlay } from '@/components/juego/RangoUpOverlay';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import {
  CAPTURA,
  PLANTILLAS_EXPEDICION,
  SENAL_POR_KEY,
  type MicroUI,
} from '@/content';
import { campaignForExpedition, recordCampaignCapture } from '@/civic/campaigns';
import {
  cellsForMission,
  missionById,
  type MissionCellCompletionStatus,
} from '@/civic/missions';
import {
  clearStoredCivicCaptureAttempt,
  loadStoredCivicCaptureAttempt,
  saveStoredCivicCaptureAttempt,
  type StoredCivicCaptureAttempt,
} from '@/civic/capture-attempt-store';
import { defaultRecordContextDraft } from '@/civic/record-context';
import { recordConsent } from '@/civic/repo';
import {
  agregarEntradaCivicaUnaVez,
  agregarEntradaExpedicion,
  crearEstrellaCivicaUnaVez,
  crearEstrella,
  entradasDeExpedicion,
  expedicionPorId,
  nuevoId,
  hoyLocal,
  marcarLuz,
  ganarBrasasUnaVez,
} from '@/db/repos';
import type { ResultadoEntrada } from '@/db/repos';
import type { ExpeditionEntryRow, ExpeditionRow } from '@/db/schema';
import {
  BRASAS_POR_HITO,
  HITOS,
  progresoExpedicion,
  resumenDeCaptura,
} from '@/game/expediciones';
import { civicCaptureKeys } from '@/game/capture-attempt';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import type { Rango } from '@/game/types';
import { bloom, fadeIn, fadeUp, slideLeftIn } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { chequearAscensoRango } from '@/stores/rangos-check';
import { haptic } from '@/theme/haptics';

/** stepKey canónico: una entrada = una captura completa (todos los pasos). */
const STEP_KEY_CAPTURA = 'captura';

const ICONO_MICROUI: Record<MicroUI, string> = {
  'foto-guiada': 'camera-outline',
  contador: 'keypad-outline',
  'rating-soles': 'sunny-outline',
  chips: 'apps-outline',
  'texto-corto': 'create-outline',
};

const LINEA_HITO: Record<number, string> = {
  25: 'Un cuarto del camino. El barrio ya se empieza a ver.',
  50: 'La mitad. Lo que era sensación ya es dato.',
  100: 'Meta cumplida. Esto ya es un mapa: mostralo, usalo, pasalo.',
};

const MISSION_NOTICE: Partial<Record<MissionCellCompletionStatus, string>> = {
  completed: 'Celda recorrida. Queda visible como observada hasta que otra mirada la corrobore.',
  no_active_cell: 'La captura quedó guardada, pero ya no había una celda activa. Volvé a la misión para retomar una ruta explícita.',
  missing_location: 'La captura quedó guardada, pero la celda sigue pendiente porque no hubo ubicación. Podés reintentar el recorrido.',
  location_not_field_verified: 'La captura quedó guardada como reporte remoto. Para acreditar que la celda fue recorrida, usá GPS desde el lugar.',
  location_accuracy_too_low: 'La captura quedó guardada, pero la precisión del GPS no alcanzó para acreditar el recorrido de la celda.',
  outside_cell: 'La captura quedó guardada, pero no completó la celda porque ocurrió fuera de su área.',
  mission_inactive: 'La captura quedó guardada. Reanudá la misión antes de completar su ruta.',
  invalid_cell: 'La captura quedó guardada, pero la ruta necesita revisión antes de marcar cobertura.',
  campaign_mismatch: 'La captura quedó guardada, pero la ruta necesita revisión antes de marcar cobertura.',
};

const restoredMissionResult = (
  missionId: string | undefined,
  missionCellId: string | undefined,
): string | null => {
  if (!missionId || !missionCellId) return null;
  const mission = missionById(missionId);
  if (!mission) return 'La operación ya no está en este dispositivo. Volvé al listado de misiones para elegir una ruta vigente.';
  if (mission.status !== 'active') return 'La misión ya no está activa. Volvé a la operación para revisar su estado antes de registrar otro tramo.';
  const cell = cellsForMission(missionId).find((item) => item.id === missionCellId);
  if (!cell) return 'La celda ya no forma parte de esta misión. Volvé a la operación para elegir un tramo vigente.';
  if (!['assigned', 'unknown'].includes(cell.status)) {
    return 'Este tramo ya dejó de estar pendiente. Volvé a la ruta para continuar con la siguiente celda.';
  }
  return null;
};

interface MomentoHito {
  hito: number;
  brasas: number;
  completa: boolean;
}

interface CivicCaptureAttempt extends Omit<StoredCivicCaptureAttempt, 'data'> {
  data: Record<string, ValorPaso>;
  snapshotStored: boolean;
  publishConsentRecorded: boolean;
  locationConsentRecorded: boolean;
  entryResult: ResultadoEntrada | null;
}

export default function ExpedicionDetalle() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();
  const {
    id,
    missionId: missionIdParam,
    missionCellId: missionCellIdParam,
    missionCell: missionCellParam,
  } = useLocalSearchParams<{
    id: string;
    missionId?: string | string[];
    missionCellId?: string | string[];
    missionCell?: string | string[];
  }>();
  const missionId = Array.isArray(missionIdParam) ? missionIdParam[0] : missionIdParam;
  const missionCellId = Array.isArray(missionCellIdParam) ? missionCellIdParam[0] : missionCellIdParam;
  const missionCell = Array.isArray(missionCellParam) ? missionCellParam[0] : missionCellParam;

  // Carga sincrónica inicial (la DB ya migró bajo el gate): sin parpadeo.
  const [exp, setExp] = useState<ExpeditionRow | null>(() =>
    id ? expedicionPorId(id) : null,
  );
  const [entradas, setEntradas] = useState<ExpeditionEntryRow[]>(() =>
    id ? entradasDeExpedicion(id) : [],
  );

  const recargar = useCallback(() => {
    if (!id) return;
    setExp(expedicionPorId(id));
    setEntradas(entradasDeExpedicion(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      recargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recargar]),
  );

  // El rito de captura
  const [capturando, setCapturando] = useState(false);
  const [pasoIdx, setPasoIdx] = useState(0);
  const [valores, setValores] = useState<Record<string, ValorPaso>>({});
  const [naciendo, setNaciendo] = useState(false);
  const [publicar, setPublicar] = useState(false);
  const [retryPending, setRetryPending] = useState(false);
  const civicAttempt = useRef<CivicCaptureAttempt | null>(null);
  const [context, setContext] = useState(() => defaultRecordContextDraft({
    sensitivity: 'low',
    precision: '500m',
  }));

  // Celebraciones
  const [momento, setMomento] = useState<MomentoHito | null>(null);
  const [ascenso, setAscenso] = useState<Rango | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [missionResult, setMissionResult] = useState<string | null>(() => {
    const initialTemplate = exp
      ? PLANTILLAS_EXPEDICION.find((item) => item.id === exp.plantillaId)
      : null;
    const pendingAttempt = exp && initialTemplate
      ? loadStoredCivicCaptureAttempt(exp.id, initialTemplate.slug)
      : null;
    return pendingAttempt ? null : restoredMissionResult(missionId, missionCellId);
  });

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  // El hito cruzado celebra con el cuerpo, no solo con la vista.
  useEffect(() => {
    if (momento) haptic.celebrate();
  }, [momento]);

  const plantilla = exp
    ? PLANTILLAS_EXPEDICION.find((p) => p.id === exp.plantillaId)
    : undefined;

  if (!exp || !plantilla) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Expedición" />
        <View className="flex-1 items-center justify-center px-7">
          <GlassCard className="w-full p-6">
            <Text className="font-serif text-2xl text-plata">No está más.</Text>
            <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
              Esa expedición no existe en este dispositivo. Volvé al panel y
              fundá otra: el barrio no se termina.
            </Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  const senal = SENAL_POR_KEY[plantilla.senal];
  const campaign = campaignForExpedition(plantilla.slug);
  const color = senal.color;
  const { porcentaje } = progresoExpedicion(entradas.length, exp.meta);
  const hitosOtorgados = JSON.parse(exp.hitosOtorgados) as number[];
  const activa = exp.estado === 'activa';

  const paso = plantilla.pasos[pasoIdx];
  const ultimoPaso = pasoIdx === plantilla.pasos.length - 1;

  const empezarCaptura = () => {
    const pending = campaign
      ? loadStoredCivicCaptureAttempt(exp.id, plantilla.slug)
      : null;
    if (pending) {
      civicAttempt.current = {
        ...pending,
        data: pending.data as Record<string, ValorPaso>,
        snapshotStored: true,
        publishConsentRecorded: false,
        locationConsentRecorded: false,
        entryResult: null,
      };
      setValores(pending.data as Record<string, ValorPaso>);
      setPasoIdx(Math.max(0, plantilla.pasos.length - 1));
      setPublicar(pending.publish);
      setContext(pending.context);
      setRetryPending(true);
      setCapturando(true);
      setAviso('Recuperamos una captura interrumpida. Reintentá para completar sólo lo que falta.');
      return;
    }
    civicAttempt.current = null;
    setRetryPending(false);
    setValores({});
    setPasoIdx(0);
    setPublicar(false);
    const precision = campaign?.publicPrecision === 'exact'
      ? '100m'
      : campaign?.publicPrecision ?? '500m';
    setContext(defaultRecordContextDraft({
      sensitivity: campaign?.key === 'luminarias-v1' ? 'low' : 'moderate',
      precision,
    }));
    setCapturando(true);
  };

  const cancelarCaptura = () => {
    if (retryPending) {
      setAviso('Este intento ya empezó. Reintentá para completar sólo lo que falta, sin duplicarlo.');
      return;
    }
    civicAttempt.current = null;
    setCapturando(false);
  };

  const capturar = async () => {
    if (naciendo) return;
    if (campaign && !isGeoAttributionReady(context)) {
      setAviso('Confirmá el pin, el nombre del lugar y la firma antes de cerrar la captura.');
      return;
    }
    setNaciendo(true);
    try {
      const currentData = { ...valores };
      const currentCoords = context.point ? { ...context.point } : null;
      const pasoFoto = plantilla.pasos.find((p) => p.microUI === 'foto-guiada');
      const currentPhoto = pasoFoto ? currentData[pasoFoto.key] : null;
      const currentSummary = resumenDeCaptura(plantilla.pasos, currentData);
      const currentMultiplier = multiplicadorHoy();
      const attempt = campaign
        ? civicAttempt.current ?? {
            version: 1,
            id: nuevoId(),
            expeditionId: exp.id,
            expeditionSlug: plantilla.slug,
            data: currentData,
            summary: currentSummary,
            coords: currentCoords,
            context: {
              ...context,
              point: currentCoords,
              audience: publicar ? 'collective' : 'private',
            },
            publish: publicar,
            photoUri: typeof currentPhoto === 'string' ? currentPhoto : null,
            multiplier: currentMultiplier,
            eventActive: st.eventoHoy !== null,
            confirmedAt: new Date().toISOString(),
            snapshotStored: false,
            publishConsentRecorded: false,
            locationConsentRecorded: false,
            entryResult: null,
          }
        : null;
      if (attempt) {
        civicAttempt.current = attempt;
        if (!attempt.snapshotStored) {
          saveStoredCivicCaptureAttempt(attempt);
          attempt.snapshotStored = true;
        }
      }

      const data = attempt?.data ?? currentData;
      const coords = attempt?.coords ?? currentCoords;
      const resumen = attempt?.summary ?? currentSummary;
      const captureContext = attempt?.context ?? {
        ...context,
        point: coords,
        audience: publicar ? 'collective' : 'private',
      };
      const capturePublish = attempt?.publish ?? publicar;
      const confirmedContext = {
        ...captureContext,
        locationConsent: capturePublish && coords != null,
        attributionConsent: capturePublish && captureContext.attributionMode !== 'anonymous',
        confirmedAt: attempt?.confirmedAt ?? new Date().toISOString(),
      };
      const mult = attempt?.multiplier ?? currentMultiplier;
      const starInput = {
        tipo: plantilla.senal,
        texto: resumen,
        photoUri: attempt?.photoUri ?? (typeof currentPhoto === 'string' ? currentPhoto : null),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        expeditionId: exp.id,
        expeditionStepKey: STEP_KEY_CAPTURA,
        eventoActivo: attempt?.eventActive ?? st.eventoHoy !== null,
      };
      const star = attempt
        ? crearEstrellaCivicaUnaVez(attempt.id, starInput)
        : crearEstrella(starInput);

      let resultado: ResultadoEntrada;
      if (attempt) {
        const ensured = agregarEntradaCivicaUnaVez(
          attempt.id,
          exp.id,
          STEP_KEY_CAPTURA,
          data,
          star.id,
          { multiplicador: mult, baseReward: GANANCIAS.capturaHonesta },
        );
        const remembered = attempt.entryResult;
        resultado = remembered
          ? {
              ...ensured,
              hitosNuevos: [...new Set([...remembered.hitosNuevos, ...ensured.hitosNuevos])],
              brasasGanadas: remembered.brasasGanadas + ensured.brasasGanadas,
            }
          : ensured;
        attempt.entryResult = resultado;
      } else {
        resultado = agregarEntradaExpedicion(
          exp.id,
          STEP_KEY_CAPTURA,
          data,
          star.id,
          { multiplicador: mult },
        );
      }

      if (capturePublish) {
        const attemptKeys = attempt ? civicCaptureKeys(attempt.id, exp.id) : null;
        if (!attempt || !attempt.publishConsentRecorded) {
          recordConsent({
            scope: 'publish',
            purpose: `Compartir una captura de ${plantilla.titulo} con ubicación reducida.`,
            granted: true,
            idempotencyKey: attemptKeys?.publishConsentIdempotencyKey,
          });
          if (attempt) attempt.publishConsentRecorded = true;
        }
        if (!attempt || !attempt.locationConsentRecorded) {
          recordConsent({
            scope: 'location',
            purpose: `Compartir sólo la zona reducida de una captura de ${plantilla.titulo}.`,
            granted: coords != null,
            version: 3,
            idempotencyKey: attemptKeys?.locationConsentIdempotencyKey,
          });
          if (attempt) attempt.locationConsentRecorded = true;
        }
      }
      // El recibo de consentimiento existe antes de crear cualquier evento
      // publicable; si publicar=false, todo queda como borrador local.
      const missionCompletion = await recordCampaignCapture({
        expeditionSlug: plantilla.slug,
        starId: star.id,
        data,
        summary: resumen,
        coords,
        context: confirmedContext,
        publish: capturePublish,
      });
      if (missionCompletion?.status === 'completed' && missionCompletion.cell) {
        const reward = ganarBrasasUnaVez(
          `civic-cell:${missionCompletion.cell.id}:observed`,
          GANANCIAS.celdaRecorrida,
          MOTIVOS.celdaRecorrida,
          { multiplicador: mult },
        );
        resultado.brasasGanadas += reward?.delta ?? 0;
      }
      const missionNotice = missionCompletion
        ? MISSION_NOTICE[missionCompletion.status] ?? null
        : null;
      marcarLuz(hoyLocal(), 'encender', { multiplicador: mult });
      if (attempt) clearStoredCivicCaptureAttempt(exp.id);

      useJuego.getState().setNewStar(star.id);
      if (resultado.hitosNuevos.length === 0) haptic.celebrate();
      st.refresh();
      const nuevoRango = chequearAscensoRango();
      recargar();

      setCapturando(false);
      setRetryPending(false);
      civicAttempt.current = null;
      setValores({});
      setPasoIdx(0);

      if (missionNotice) {
        if (missionId) setMissionResult(missionNotice);
        else setAviso(missionNotice);
      }
      if (resultado.hitosNuevos.length > 0) {
        setMomento({
          hito: Math.max(...resultado.hitosNuevos),
          brasas: resultado.brasasGanadas,
          completa: resultado.estado === 'completa',
        });
        if (nuevoRango) setAscenso(nuevoRango); // se muestra al cerrar el hito
      } else if (nuevoRango) {
        setAscenso(nuevoRango);
      } else if (!missionNotice) {
        setAviso(CAPTURA.nacimientoEstrella);
      }
    } catch (error) {
      if (!campaign) throw error;
      setRetryPending(true);
      setAviso('El intento quedó protegido. Reintentá: se completará sólo lo que falta, sin duplicar estrella, dato ni recompensa.');
    } finally {
      setNaciendo(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title={exp.titulo}
        right={missionId ? undefined : (
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Pasarla por QR"
            onPress={() =>
              router.push({ pathname: '/qr', params: { expedicionId: exp.id } })
            }
            className="mr-3 rounded-full border border-white/10 bg-white/5 p-2"
          >
            <Ionicons name="qr-code-outline" size={16} color="#94a3b8" />
          </Pressable97>
        )}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {!capturando ? (
            <Animated.View entering={fadeUp}>
              {missionId && (
                <View className="mb-5 flex-row items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-4">
                  <Ionicons name="walk-outline" size={18} color="#FCD34D" />
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-xs text-amber-100">
                      Tramo de misión{missionCell ? ` · celda ${missionCell}` : ''}
                    </Text>
                    <Text className="mt-1 font-sans text-[11px] leading-5 text-amber-100/65">
                      Este cuaderno pertenece a una operación territorial concreta. Después de registrar, volvés a la ruta para elegir el siguiente tramo.
                    </Text>
                  </View>
                </View>
              )}
              <View className="mt-1 flex-row items-center gap-2">
                <Ionicons name={senal.icon as never} size={14} color={color} />
                <Text
                  className="font-sans text-[11px] uppercase tracking-[3px]"
                  style={{ color }}
                >
                  {senal.label}
                </Text>
                <Text className="font-sans text-[11px] text-slate-500">
                  · {exp.zona}
                </Text>
              </View>

              {/* El progreso luminoso */}
              <GlassCard className="mt-4 p-5">
                <View className="flex-row items-end justify-between">
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="font-mono text-4xl" style={{ color }}>
                      {entradas.length}
                    </Text>
                    <Text className="font-sans text-sm text-slate-400">
                      de {exp.meta}
                    </Text>
                  </View>
                  <Text className="font-mono text-sm text-slate-400">
                    {porcentaje}%
                  </Text>
                </View>
                <View className="mt-4">
                  <BarraLuminosa
                    alta
                    porcentaje={porcentaje}
                    color={color}
                    hitosOtorgados={hitosOtorgados}
                  />
                </View>
                <View className="mt-3 flex-row justify-between">
                  {HITOS.map((h) => {
                    const encendido = hitosOtorgados.includes(h) || porcentaje >= h;
                    return (
                      <Text
                        key={h}
                        className="font-mono text-[10px]"
                        style={{ color: encendido ? color : '#475569' }}
                      >
                        {h}% · +{BRASAS_POR_HITO[h]}
                      </Text>
                    );
                  })}
                </View>
              </GlassCard>

              {/* El acto central */}
              {missionId && missionResult ? (
                <GlassCard className="mt-6 border border-emerald-300/20 p-5">
                  <View className="flex-row items-start gap-3">
                    <Ionicons name="checkmark-circle-outline" size={20} color="#6EE7B7" />
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-sm text-plata">Tramo registrado</Text>
                      <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{missionResult}</Text>
                    </View>
                  </View>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Volver a la ruta territorial"
                    onPress={() => {
                      if (missionById(missionId)) {
                        router.replace({ pathname: '/territorio/misiones/[id]', params: { id: missionId } });
                      } else {
                        router.replace('/territorio/misiones');
                      }
                    }}
                    className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-emerald-500 px-5"
                  >
                    <Ionicons name="map-outline" size={17} color="#FFFFFF" />
                    <Text className="font-sans-semibold text-sm text-white">Volver a la ruta</Text>
                  </Pressable97>
                </GlassCard>
              ) : activa ? (
                <View className="mt-6 items-center">
                  <AccentButton label="Capturar" onPress={empezarCaptura} />
                  <Text className="mt-3 font-sans text-[11px] text-slate-500">
                    La estrella recuerda la captura. En una misión: +1 por registrar con honestidad y +2 cuando el lugar completa una celda válida.
                  </Text>
                </View>
              ) : (
                <GlassCard className="mt-6 p-5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={18} color={color} />
                    <Text className="font-sans-semibold text-sm text-plata">
                      Expedición completa
                    </Text>
                  </View>
                  <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">
                    La meta está cumplida y el mapa quedó hecho. Fundá otra, o
                    llevá esta misma a otra zona.
                  </Text>
                </GlassCard>
              )}

              {/* El rito de cada captura */}
              <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                El rito de cada captura
              </Text>
              <View className="mt-3 gap-2.5">
                {plantilla.pasos.map((p, i) => (
                  <GlassCard key={p.key} className="flex-row items-center gap-3 p-4">
                    <Text className="font-mono text-xs text-slate-500">
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-sans-medium text-sm text-slate-200">
                        {p.titulo}
                      </Text>
                      <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
                        {p.instruccion}
                      </Text>
                    </View>
                    <Ionicons
                      name={ICONO_MICROUI[p.microUI] as never}
                      size={16}
                      color="#64748b"
                    />
                  </GlassCard>
                ))}
              </View>

              {/* Lo último capturado */}
              {entradas.length > 0 && (
                <>
                  <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                    Lo último capturado
                  </Text>
                  <View className="mt-3 gap-2">
                    {[...entradas]
                      .slice(-3)
                      .reverse()
                      .map((e) => {
                        const data = JSON.parse(e.data) as Record<string, unknown>;
                        const resumen = resumenDeCaptura(plantilla.pasos, data);
                        return (
                          <View
                            key={e.id}
                            className="flex-row items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                          >
                            <View
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <Text
                              numberOfLines={1}
                              className="flex-1 font-sans text-xs text-slate-300"
                            >
                              {resumen ?? 'Una captura sin palabras'}
                            </Text>
                            <Text className="font-mono text-[10px] text-slate-600">
                              {e.createdAt.slice(0, 10)}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </>
              )}
            </Animated.View>
          ) : (
            /* ------------------------------------------ el rito, en vivo */
            <View>
              <View className="mt-1 flex-row items-center justify-between">
                <SectionBadge>{`Captura — paso ${pasoIdx + 1} de ${plantilla.pasos.length}`}</SectionBadge>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={retryPending ? 'La captura está pendiente de reintento' : 'Cancelar la captura'}
                  onPress={cancelarCaptura}
                  className="rounded-full border border-white/10 bg-white/5 p-2"
                >
                  <Ionicons name="close" size={16} color="#94a3b8" />
                </Pressable97>
              </View>

              {retryPending && (
                <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FCD34D" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-amber-100">
                    El primer intento quedó identificado. Los campos están pausados para que Reintentar complete exactamente esa captura, sin sumar otra estrella ni otra recompensa.
                  </Text>
                </View>
              )}

              {paso && (
                <Animated.View key={paso.key} entering={slideLeftIn} className="mt-7">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={senal.icon as never} size={14} color={color} />
                    <Text
                      className="font-sans text-[11px] uppercase tracking-[3px]"
                      style={{ color }}
                    >
                      {paso.titulo}
                    </Text>
                  </View>
                  <Text className="mt-4 font-serif text-2xl leading-9 text-plata">
                    {paso.instruccion}
                  </Text>

                  <View pointerEvents={retryPending ? 'none' : 'auto'} style={{ opacity: retryPending ? 0.64 : 1 }}>
                    <MicroUIPaso
                      paso={paso}
                      color={color}
                      valor={valores[paso.key]}
                      onCambiar={(v) =>
                        setValores((prev) => ({ ...prev, [paso.key]: v }))
                      }
                    />
                  </View>

                  {ultimoPaso && (
                    <View
                      pointerEvents={retryPending ? 'none' : 'auto'}
                      className="mt-7 gap-4"
                      style={{ opacity: retryPending ? 0.64 : 1 }}
                    >
                      <GeoAttributionCard
                        value={context}
                        onChange={setContext}
                        accent={color}
                        title={campaign?.key === 'luminarias-v1' ? '¿Dónde está esta luminaria?' : '¿Dónde ocurre esta captura?'}
                        description="Usá el GPS como punto de partida y corregí el pin si el objeto está enfrente, en otra esquina o fue registrado después."
                      />
                      <Pressable97
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: publicar }}
                        accessibilityLabel="Compartir el recibo visible con el territorio"
                        disabled={retryPending}
                        onPress={() => setPublicar((value) => !value)}
                        className="flex-row items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <View
                          className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border"
                          style={{
                            borderColor: publicar ? color : '#475569',
                            backgroundColor: publicar ? color : 'transparent',
                          }}
                        >
                          {publicar && <Ionicons name="checkmark" size={14} color="#0A0A0A" />}
                        </View>
                        <View className="flex-1">
                          <Text className="font-sans-medium text-xs text-slate-200">
                            Compartir con el territorio
                          </Text>
                          <Text className="mt-1 font-sans text-[11px] leading-5 text-slate-500">
                            Se publica el lugar reducido y la firma elegida. La foto, el punto exacto y el contacto quedan fuera del registro común.
                          </Text>
                        </View>
                      </Pressable97>
                    </View>
                  )}

                  <View className="mt-10 items-center">
                    <AccentButton
                      label={
                        ultimoPaso
                          ? naciendo
                            ? 'Naciendo…'
                            : retryPending
                              ? 'Reintentar sin duplicar'
                              : 'Que nazca'
                          : paso.microUI === 'foto-guiada' &&
                              typeof valores[paso.key] !== 'string'
                            ? 'Seguir sin foto'
                            : 'Siguiente'
                      }
                      onPress={() =>
                        ultimoPaso ? capturar() : setPasoIdx((i) => i + 1)
                      }
                      disabled={naciendo || !pasoValido(paso, valores[paso.key]) || (ultimoPaso && campaign != null && !isGeoAttributionReady(context))}
                    />
                    {pasoIdx > 0 && !retryPending && (
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel="Paso anterior"
                        onPress={() => setPasoIdx((i) => i - 1)}
                        className="mt-4 px-4 py-2"
                      >
                        <Text className="font-sans text-xs text-slate-500">
                          ← Paso anterior
                        </Text>
                      </Pressable97>
                    )}
                  </View>
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Aviso suave: nació la estrella */}
      {aviso && !momento && !ascenso && (
        <Animated.View
          entering={fadeUp}
          className="absolute left-6 right-6"
          style={{ bottom: insets.bottom + 20 }}
        >
          <GlassCard className="flex-row items-center gap-2.5 px-4 py-3">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <Text className="flex-1 font-sans text-xs text-slate-200">{aviso}</Text>
          </GlassCard>
        </Animated.View>
      )}

      {/* El hito cruzado — momento celebratorio inline */}
      {momento && (
        <Animated.View
          entering={fadeIn}
          className="absolute inset-0 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.82)' }}
        >
          <Animated.View entering={bloom} className="items-center">
            <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              {momento.completa ? 'Expedición completa' : `Hito del ${momento.hito}%`}
            </Text>
            <Text className="mt-6 font-mono text-5xl" style={{ color }}>
              +{momento.brasas}
            </Text>
            <Text className="mt-1 font-sans text-xs text-slate-500">brasas</Text>
            <Text className="mt-8 text-center font-serif-italic text-2xl leading-9 text-plata">
              {LINEA_HITO[momento.completa ? 100 : momento.hito]}
            </Text>
            <View className="mt-10">
              <AccentButton label="Seguir" onPress={() => setMomento(null)} />
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Ascenso de rango, si el hito lo empujó */}
      {ascenso && !momento && (
        <RangoUpOverlay rango={ascenso} onCerrar={() => setAscenso(null)} />
      )}
    </View>
  );
}
