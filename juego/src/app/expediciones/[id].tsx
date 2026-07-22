/**
 * Detalle de expedición (spec §3.2): el progreso, los hitos 25/50/100,
 * el rito de cada captura — y el botón CAPTURAR, que recorre los pasos
 * de la plantilla con su micro-UI propia. Cada captura hace nacer una
 * estrella en el Cielo y enciende la luz de ENCENDER si faltaba. En
 * misiones cívicas, la recompensa se completa al cerrar una celda
 * válida; las expediciones personales conservan su economía clásica.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el cuaderno de
 * campo abierto en una entrada. La barra luminosa muere: el progreso son
 * palitos (spec §4) y números mono. El aviso flotante es una tira de
 * tinta invertida; el hito celebra sobre papel, sin glow.
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
import { MicroUIPaso, pasoValido, type ValorPaso } from '@/components/juego/MicroUIPaso';
import { RangoUpOverlay } from '@/components/juego/RangoUpOverlay';
import {
  BotonTinta,
  ChipTipo,
  GranoPapel,
  Kicker,
  Palitos,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  CAPTURA,
  PLANTILLAS_EXPEDICION,
  SENAL_POR_KEY,
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
import { TINTA, TINTA_30 } from '@/theme/tokens';

/** stepKey canónico: una entrada = una captura completa (todos los pasos). */
const STEP_KEY_CAPTURA = 'captura';

/** Palitos solo para metas chicas (spec §4: tally <100). */
const META_PALITOS = 40;

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

  const volver = () =>
    router.canGoBack() ? router.back() : router.replace('/expediciones');

  if (!exp || !plantilla) {
    return (
      <View className="flex-1 bg-papel">
        <GranoPapel />
        <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
        </View>
        <View className="flex-1 items-center justify-center px-7">
          <PapelCard className="w-full p-6">
            <TituloAnton tamano="md">No está más.</TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              Esa expedición no existe en este dispositivo. Volvé al panel y
              fundá otra: el barrio no se termina.
            </Text>
          </PapelCard>
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
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 4 }}>
        <View className="flex-row items-center justify-between">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
          {!missionId && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Pasarla por QR"
              onPress={() =>
                router.push({ pathname: '/qr', params: { expedicionId: exp.id } })
              }
              className="min-h-11 min-w-11 items-center justify-center border border-tinta p-2"
            >
              <Ionicons name="qr-code-outline" size={16} color={TINTA} />
            </Pressable97>
          )}
        </View>
        <View className="mt-2">
          <Kicker style={{ color }}>{`${senal.label} · ${exp.zona}`}</Kicker>
          <TituloAnton tamano="lg" className="mt-1">
            {exp.titulo}
          </TituloAnton>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {!capturando ? (
            <Animated.View entering={fadeUp}>
              {missionId && (
                <View className="mb-5 border border-ambar bg-papel-crudo p-4">
                  <Text className="font-archivo-bold text-xs text-tinta">
                    Tramo de misión{missionCell ? ` · celda ${missionCell}` : ''}
                  </Text>
                  <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-75">
                    Este cuaderno pertenece a una operación territorial concreta. Después de registrar, volvés a la ruta para elegir el siguiente tramo.
                  </Text>
                </View>
              )}

              {/* El progreso, en palitos y mono */}
              <PapelCard className="p-5">
                <View className="flex-row items-end justify-between">
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="font-space text-4xl" style={{ color }}>
                      {entradas.length}
                    </Text>
                    <Text className="font-archivo text-sm text-tinta-75">
                      de {exp.meta}
                    </Text>
                  </View>
                  <Text className="font-space text-sm text-tinta-50">
                    {porcentaje}%
                  </Text>
                </View>
                {exp.meta <= META_PALITOS && (
                  <View className="mt-4">
                    <Palitos total={entradas.length} de={exp.meta} color={color} />
                  </View>
                )}
                <View className="mt-3 flex-row justify-between">
                  {HITOS.map((h) => {
                    const encendido = hitosOtorgados.includes(h) || porcentaje >= h;
                    return (
                      <Text
                        key={h}
                        className="font-space text-[10px]"
                        style={{ color: encendido ? color : TINTA_30 }}
                      >
                        {h}% · +{BRASAS_POR_HITO[h]}
                      </Text>
                    );
                  })}
                </View>
              </PapelCard>

              {/* El acto central */}
              {missionId && missionResult ? (
                <PapelCard className="mt-6 border-verde p-5">
                  <Text className="font-archivo-bold text-sm text-tinta">Tramo registrado</Text>
                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{missionResult}</Text>
                  <View className="mt-5 items-center">
                    <BotonTinta
                      etiqueta="Volver a la ruta →"
                      accessibilityLabel="Volver a la ruta territorial"
                      onPress={() => {
                        if (missionById(missionId)) {
                          router.replace({ pathname: '/territorio/misiones/[id]', params: { id: missionId } });
                        } else {
                          router.replace('/territorio/misiones');
                        }
                      }}
                    />
                  </View>
                </PapelCard>
              ) : activa ? (
                <View className="mt-6 items-center">
                  <BotonTinta etiqueta="Capturar" onPress={empezarCaptura} />
                  <Text className="mt-3 text-center font-archivo text-[11px] leading-4 text-tinta-50">
                    La estrella recuerda la captura. En una misión: +1 por registrar con honestidad y +2 cuando el lugar completa una celda válida.
                  </Text>
                </View>
              ) : (
                <PapelCard className="mt-6 p-5">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="font-archivo-bold text-sm text-tinta">
                      Expedición completa
                    </Text>
                    <ChipTipo etiqueta="Completa" activo color={color} />
                  </View>
                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">
                    La meta está cumplida y el mapa quedó hecho. Fundá otra, o
                    llevá esta misma a otra zona.
                  </Text>
                </PapelCard>
              )}

              {/* El rito de cada captura */}
              <Kicker tono="neutro" className="mt-8">
                El rito de cada captura
              </Kicker>
              <View className="mt-2">
                {plantilla.pasos.map((p, i) => (
                  <View
                    key={p.key}
                    className="flex-row items-baseline gap-5 border-b border-bordeSuave px-2 py-4"
                  >
                    <Text className="w-8 font-space text-[11px] text-tinta-30">
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-archivo-bold text-sm text-tinta">
                        {p.titulo}
                      </Text>
                      <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-50">
                        {p.instruccion}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Lo último capturado */}
              {entradas.length > 0 && (
                <>
                  <Kicker tono="neutro" className="mt-8">
                    Lo último capturado
                  </Kicker>
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
                            className="flex-row items-center gap-2.5 border border-bordeSuave bg-papel-crudo px-4 py-3"
                          >
                            <Text
                              numberOfLines={1}
                              className="flex-1 font-archivo text-xs text-tinta-90"
                            >
                              {resumen ?? 'Una captura sin palabras'}
                            </Text>
                            <Text className="font-space text-[10px] text-tinta-50">
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
                <Kicker tono="neutro">{`Captura — paso ${pasoIdx + 1} de ${plantilla.pasos.length}`}</Kicker>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={retryPending ? 'La captura está pendiente de reintento' : 'Cancelar la captura'}
                  onPress={cancelarCaptura}
                  className="min-h-11 min-w-11 items-center justify-center border border-tinta"
                >
                  <Text className="font-space text-base text-tinta">✕</Text>
                </Pressable97>
              </View>

              {retryPending && (
                <View className="mt-4 border border-ambar bg-papel-crudo p-4">
                  <Text className="font-archivo text-xs leading-5 text-tinta-90">
                    El primer intento quedó identificado. Los campos están pausados para que Reintentar complete exactamente esa captura, sin sumar otra estrella ni otra recompensa.
                  </Text>
                </View>
              )}

              {paso && (
                <Animated.View key={paso.key} entering={slideLeftIn} className="mt-7">
                  <Kicker style={{ color }}>{paso.titulo}</Kicker>
                  <TituloAnton tamano="md" className="mt-3">
                    {paso.instruccion}
                  </TituloAnton>

                  <View style={{ opacity: retryPending ? 0.64 : 1, pointerEvents: retryPending ? 'none' : 'auto' }}>
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
                      className="mt-7 gap-4"
                      style={{ opacity: retryPending ? 0.64 : 1, pointerEvents: retryPending ? 'none' : 'auto' }}
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
                        className="flex-row items-start gap-3 border border-tinta bg-papel-crudo p-4"
                      >
                        <View
                          className={`mt-0.5 h-5 w-5 items-center justify-center border border-tinta ${
                            publicar ? 'bg-violeta' : 'bg-papel-presionado'
                          }`}
                        />
                        <View className="flex-1">
                          <Text className="font-archivo-bold text-xs text-tinta">
                            Compartir con el territorio
                          </Text>
                          <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-75">
                            Se publica el lugar reducido y la firma elegida. La foto, el punto exacto y el contacto quedan fuera del registro común.
                          </Text>
                        </View>
                      </Pressable97>
                    </View>
                  )}

                  <View className="mt-10 items-center">
                    <BotonTinta
                      etiqueta={
                        ultimoPaso
                          ? retryPending
                            ? 'Reintentar sin duplicar'
                            : 'Que nazca'
                          : paso.microUI === 'foto-guiada' &&
                              typeof valores[paso.key] !== 'string'
                            ? 'Seguir sin foto'
                            : 'Siguiente →'
                      }
                      onPress={() =>
                        ultimoPaso ? capturar() : setPasoIdx((i) => i + 1)
                      }
                      disabled={naciendo || !pasoValido(paso, valores[paso.key]) || (ultimoPaso && campaign != null && !isGeoAttributionReady(context))}
                      cargando={naciendo}
                    />
                    {pasoIdx > 0 && !retryPending && (
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel="Paso anterior"
                        onPress={() => setPasoIdx((i) => i - 1)}
                        className="mt-4 px-4 py-2"
                      >
                        <Text className="font-space text-xs text-tinta-50">
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

      {/* Aviso suave: la tira de tinta invertida */}
      {aviso && !momento && !ascenso && (
        <Animated.View
          entering={fadeUp}
          className="absolute left-6 right-6 bg-tinta px-4 py-3"
          style={{ bottom: insets.bottom + 20 }}
        >
          <Text className="font-archivo text-xs leading-5 text-papel">{aviso}</Text>
        </Animated.View>
      )}

      {/* El hito cruzado — momento celebratorio sobre papel */}
      {momento && (
        <Animated.View
          entering={fadeIn}
          className="absolute inset-0 items-center justify-center bg-papel/95 px-8"
        >
          <Animated.View entering={bloom} className="items-center">
            <Kicker tono="neutro">
              {momento.completa ? 'Expedición completa' : `Hito del ${momento.hito}%`}
            </Kicker>
            <Text className="mt-6 font-space text-5xl" style={{ color }}>
              +{momento.brasas}
            </Text>
            <Text className="mt-1 font-space text-xs text-tinta-50">brasas</Text>
            <TituloAnton tamano="md" className="mt-8 text-center">
              {LINEA_HITO[momento.completa ? 100 : momento.hito] ?? ''}
            </TituloAnton>
            <View className="mt-10">
              <BotonTinta etiqueta="Seguir" onPress={() => setMomento(null)} />
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
