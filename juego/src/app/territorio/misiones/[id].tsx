import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, GranoPapel, Kicker, Palitos, PapelCard, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIVIC_CAMPAIGNS } from '@/civic/campaigns';
import { sharedPrecisionLabel } from '@/civic/record-context';
import {
  cellsForMission,
  claimNextRoute,
  completeAssignedMissionCellWithoutFinding,
  MISSION_PASSPORTS,
  missionById,
  missionCellLabel,
  myAssignedCells,
  prepareMissionCellCapture,
  replaceMissionPassport,
  summarizeMissionCoverage,
  transitionMission,
  type MissionPassport,
} from '@/civic/missions';
import { PLANTILLAS_EXPEDICION } from '@/content';
import {
  expedicionPorId,
  fundarExpedicion,
  getSetting,
  setSetting,
} from '@/db/repos';
import type { CivicMissionCellRow, CivicMissionRow } from '@/db/schema';
import type { CivicCampaignKey, CoverageCellStatus } from '@/civic/types';
import { missionExpeditionLinkKey } from '@/civic/workflow-navigation';
import { obtenerUbicacion } from '@/lib/capturar-gps';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { AMBAR_PT, TINTA_30, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

/** Estado de cada celda de la malla, reclasificado sobre el mismo idioma de
 * ESTADO_COLOR (spec §8): verde = en marcha, ámbar = pide revisión humana,
 * tinta-50 = resuelta/asentada, tinta-30 = todavía sin tocar o vencida. */
const CELL_META: Record<CoverageCellStatus, { label: string; short: string; color: string }> = {
  unknown: { label: 'Todavía no recorrida', short: 'desconocida', color: TINTA_30 },
  assigned: { label: 'Ruta tomada', short: 'asignada', color: VERDE },
  visited_empty: { label: 'Recorrida, sin hallazgo registrado', short: 'sin hallazgo', color: TINTA_50 },
  observed: { label: 'Recorrida, falta corroborar', short: 'observada', color: AMBAR_PT },
  contested: { label: 'Hay que revisar', short: 'en disputa', color: AMBAR_PT },
  corroborated: { label: 'Corroborada', short: 'corroborada', color: TINTA_50 },
  stale: { label: 'Perdió vigencia', short: 'vencida', color: TINTA_30 },
};

const MISSION_META: Record<CivicMissionRow['status'], { label: string; color: string }> = {
  planning: { label: 'En preparación', color: VIOLETA },
  active: { label: 'Misión activa', color: VERDE },
  paused: { label: 'Misión pausada', color: AMBAR_PT },
  completed: { label: 'Misión cerrada', color: TINTA_50 },
  archived: { label: 'Misión archivada', color: TINTA_30 },
};

const passportMeta = (campaignKey: CivicCampaignKey) => campaignKey === 'ollas-v1'
  ? { label: 'Ollas y comedores', detail: 'Capacidades y faltantes alimentarios' }
  : { label: 'Luminarias', detail: 'Infraestructura de alumbrado' };

export default function MisionTerritorial() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const missionId = Array.isArray(id) ? id[0] : id;
  const [mission, setMission] = useState<CivicMissionRow | null>(null);
  const [cells, setCells] = useState<CivicMissionCellRow[]>([]);
  const [mine, setMine] = useState<CivicMissionCellRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [passportEditing, setPassportEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmEmptyCell, setConfirmEmptyCell] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!missionId) return;
    setMission(missionById(missionId));
    setCells(cellsForMission(missionId));
    myAssignedCells(missionId).then(setMine).catch(() => setMine([]));
  }, [missionId]);
  useFocusEffect(refresh);

  const summary = useMemo(() => summarizeMissionCoverage(cells), [cells]);
  const canClose = summary.planned > 0
    && summary.visited === summary.planned
    && summary.observed === 0
    && summary.contested === 0
    && summary.stale === 0;
  const canReplacePassport = Boolean(mission)
    && ['planning', 'active'].includes(mission!.status)
    && cells.every((cell) => cell.status === 'unknown');

  const claim = async () => {
    if (!missionId || busy) return;
    setBusy(true);
    try {
      const claimed = await claimNextRoute(missionId, 3);
      setNotice(claimed.length > 0
        ? `Ruta lista: ${claimed.length} celdas. Recorré una por vez; la cobertura importa más que el volumen.`
        : 'No quedan celdas desconocidas para tomar.');
      haptic.tick();
      refresh();
    } catch {
      setNotice('No pudimos asignar la ruta en este momento. Ninguna celda cambió de estado.');
    } finally {
      setBusy(false);
    }
  };

  const capture = (cell: CivicMissionCellRow) => {
    if (!mission || mission.status !== 'active' || busy) return;
    const campaign = CIVIC_CAMPAIGNS.find((item) => item.key === mission.campaignKey);
    const template = campaign
      ? PLANTILLAS_EXPEDICION.find((item) => item.slug === campaign.expeditionSlug)
      : null;
    if (!template) {
      setNotice('Esta campaña todavía no tiene un recorrido de campo instalado.');
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const linkKey = missionExpeditionLinkKey(mission.id);
      const linkedId = getSetting(linkKey);
      const linked = linkedId ? expedicionPorId(linkedId) : null;
      const existing = linked?.plantillaId === template.id && linked.estado === 'activa'
        ? linked
        : null;
      const expedition = existing ?? fundarExpedicion({
        plantillaId: template.id,
        titulo: template.titulo,
        zona: mission.title,
        meta: mission.plannedCells,
        origen: 'precargada',
      });
      if (!existing) setSetting(linkKey, expedition.id);
      // La celda se activa después de asegurar el cuaderno de esta misión: si
      // fundar fallara, una captura futura no podría acreditarse por accidente.
      prepareMissionCellCapture(cell.id);
      router.push({
        pathname: '/expediciones/[id]',
        params: {
          id: expedition.id,
          missionId: mission.id,
          missionCellId: cell.id,
          missionCell: missionCellLabel(cell.cellKey),
        },
      });
    } catch {
      setNotice('No pudimos abrir el recorrido. La celda sigue asignada y no se registró ninguna captura.');
    } finally {
      setBusy(false);
    }
  };

  const recordVisitWithoutFinding = async (cell: CivicMissionCellRow) => {
    if (!mission || mission.status !== 'active' || busy) return;
    setBusy(true);
    setNotice('Comprobando que estás dentro de la celda…');
    try {
      const location = await obtenerUbicacion();
      if (!location) {
        setNotice('No pudimos obtener un GPS actual. La celda sigue asignada: probá al aire libre o revisá el permiso de ubicación.');
        return;
      }
      const result = await completeAssignedMissionCellWithoutFinding(
        cell.id,
        location.point,
        location,
      );
      if (result.status === 'completed') {
        setNotice(`Celda ${missionCellLabel(cell.cellKey)} recorrida sin hallazgo registrado. Esto acredita recorrido, no ausencia del fenómeno.`);
        setConfirmEmptyCell(null);
        haptic.tick();
        refresh();
        return;
      }
      const message = result.status === 'outside_cell'
        ? 'El GPS actual está fuera de esta celda. No se registró el recorrido.'
        : result.status === 'location_accuracy_too_low'
          ? 'La precisión del GPS no alcanza para acreditar esta celda. Probá nuevamente al aire libre.'
          : result.status === 'not_assigned_to_actor'
            ? 'La ruta pertenece a otra identidad de campo. No se cambió la celda.'
            : result.status === 'mission_inactive'
              ? 'La misión ya no está activa. No se cambió la celda.'
              : 'No pudimos acreditar el recorrido. La celda conserva su estado anterior.';
      setNotice(message);
    } catch {
      setNotice('No pudimos acreditar el recorrido. La celda conserva su estado anterior.');
    } finally {
      setBusy(false);
    }
  };

  const togglePause = () => {
    if (!mission) return;
    transitionMission(mission.id, mission.status === 'paused' ? 'active' : 'paused');
    refresh();
  };

  const close = () => {
    if (!mission || !canClose) return;
    transitionMission(mission.id, 'completed');
    haptic.celebrate();
    refresh();
  };

  const choosePassport = (passport: MissionPassport) => {
    if (!missionId) return;
    const updated = replaceMissionPassport(missionId, passport);
    if (!updated) {
      setNotice('El pasaporte ya no puede cambiarse porque la misión comenzó a asignar o recoger evidencia.');
      setPassportEditing(false);
      return;
    }
    const meta = passportMeta(passport.campaignKey);
    setNotice(`Pasaporte corregido: esta operación ahora sigue el protocolo de ${meta.label.toLocaleLowerCase('es-AR')}.`);
    setPassportEditing(false);
    haptic.tick();
    refresh();
  };

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!mission) {
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
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-archivo text-sm text-tinta-50">Esta misión no está en este dispositivo.</Text>
        </View>
      </View>
    );
  }

  const missionMeta = MISSION_META[mission.status];

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
          <Kicker>operación territorial</Kicker>
          <TituloAnton tamano="lg" className="mt-1">{mission.title}</TituloAnton>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={fadeUp}>
          <PapelCard className="p-6">
            <ChipTipo etiqueta={`${missionMeta.label} · v${mission.campaignVersion}`} activo color={missionMeta.color} />
            <Text className="mt-4 font-archivo text-sm leading-6 text-tinta-75">{mission.purpose}</Text>
            <View className="mt-6 flex-row items-end justify-between">
              <View>
                <Text className="font-space text-4xl text-tinta">{summary.coveragePct}%</Text>
                <Text className="mt-1 font-space text-xs uppercase tracking-[1.5px] text-tinta-50">cobertura recorrida</Text>
              </View>
              <Text className="font-space text-sm text-tinta-50">{summary.visited}/{summary.planned} celdas</Text>
            </View>
            <View className="mt-4">
              <Palitos total={summary.visited} de={summary.planned} color={VIOLETA} />
            </View>
            <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-50">
              Denominador planificado: {summary.planned} celdas. Esto mide recorrido de la zona, no representatividad social.
            </Text>
          </PapelCard>
        </Animated.View>

        {notice && (
          <View className="mt-4 border border-ambar px-4 py-3">
            <Text className="font-archivo text-xs leading-5 text-tinta-90">{notice}</Text>
          </View>
        )}

        <PapelCard className="mt-5">
          <View className="flex-row items-center p-5">
            <View className="flex-1 pr-3">
              <Text className="font-archivo-bold text-sm text-tinta">Pasaporte de datos</Text>
              <Text className="mt-1 font-archivo text-xs text-tinta-50">Quién, para qué, cómo y hasta cuándo.</Text>
            </View>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={passportOpen ? 'Cerrar pasaporte de datos' : 'Ver pasaporte de datos'}
              accessibilityState={{ expanded: passportOpen }}
              onPress={() => setPassportOpen((value) => !value)}
              className="min-h-11 min-w-11 items-center justify-center border border-tinta bg-papel-crudo"
            >
              <Text className="font-space text-base text-tinta">{passportOpen ? '−' : '+'}</Text>
            </Pressable97>
          </View>
          {passportOpen && (
            <View className="mx-5 mb-5 gap-4 border-t border-bordeSuave pt-5">
              {[
                ['Tipo de misión', passportMeta(mission.campaignKey).label],
                ['Decisión destinataria', mission.decisionRecipient],
                ['Custodia', mission.steward],
                ['Método válido', mission.verificationMethod],
                ['Independencia requerida', `${mission.minIndependentVerifications} miradas distintas`],
                ['Precisión pública', sharedPrecisionLabel(mission.publicPrecision)],
                ['Retención', `${mission.retentionDays} días`],
                ['Condición de cierre', mission.closureCondition],
              ].map(([label, value]) => (
                <View key={label}>
                  <Kicker tono="neutro">{label}</Kicker>
                  <Text className="mt-1.5 font-archivo text-sm leading-6 text-tinta-75">{value}</Text>
                </View>
              ))}
              {canReplacePassport ? (
                <View className="border-t border-bordeSuave pt-4">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={passportEditing ? 'Cancelar corrección del pasaporte' : 'Corregir tipo y pasaporte de la misión'}
                    accessibilityState={{ expanded: passportEditing }}
                    onPress={() => setPassportEditing((value) => !value)}
                    className="flex-row items-center justify-between border border-ambar bg-papel-crudo p-4"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="font-archivo-bold text-xs text-ambar">Corregir tipo de misión</Text>
                      <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">Disponible sólo antes de tomar una ruta o recoger evidencia.</Text>
                    </View>
                    <Text className="font-space text-base text-ambar">{passportEditing ? '×' : '+'}</Text>
                  </Pressable97>
                  {passportEditing && (
                    <View className="mt-3 gap-2">
                      {MISSION_PASSPORTS.map((passport) => {
                        const meta = passportMeta(passport.campaignKey);
                        const selected = passport.campaignKey === mission.campaignKey;
                        return (
                          <Pressable97
                            key={passport.campaignKey}
                            accessibilityRole="radio"
                            accessibilityLabel={`Usar pasaporte de ${meta.label}`}
                            accessibilityState={{ selected }}
                            onPress={() => choosePassport(passport)}
                            className="bg-papel-crudo p-4"
                            style={{ borderWidth: selected ? 2 : 1, borderColor: selected ? VIOLETA : TINTA_50 }}
                          >
                            <Text className="font-archivo-bold text-xs text-tinta">{meta.label}</Text>
                            <Text className="mt-1 font-archivo text-[10px] text-tinta-50">{meta.detail} · {passport.retentionDays} días</Text>
                          </Pressable97>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : (
                <Text className="border-t border-bordeSuave pt-4 font-archivo text-[10px] leading-4 text-tinta-50">
                  El pasaporte queda bloqueado cuando alguien toma una ruta, para que el propósito de la evidencia no cambie a mitad de la misión.
                </Text>
              )}
            </View>
          )}
        </PapelCard>

        <Kicker tono="neutro" className="mt-8">Estado del territorio</Kicker>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {(Object.keys(CELL_META) as CoverageCellStatus[]).map((status) => {
            const count = summary[status];
            if (count === 0) return null;
            const meta = CELL_META[status];
            return <ChipTipo key={status} etiqueta={`${count} ${meta.short}`} activo color={meta.color} />;
          })}
        </View>

        {mine.length > 0 ? (
          <>
            <Kicker tono="neutro" className="mt-8">Tu ruta ahora</Kicker>
            <View className="mt-3 gap-3">
              {mine.map((cell, index) => (
                <Animated.View key={cell.id} entering={staggerDelay(index)}>
                  <PapelCard className="p-4">
                    <View className="flex-row items-center">
                      <View className="h-11 w-11 items-center justify-center border border-ambar">
                        <Text className="font-space text-xs text-ambar">{missionCellLabel(cell.cellKey)}</Text>
                      </View>
                      <View className="ml-3 flex-1 pr-3">
                        <Text className="font-archivo-bold text-sm text-tinta">Recorrer esta celda</Text>
                        <Text className="mt-1 font-archivo text-xs text-tinta-50">Un hallazgo válido o un recorrido acreditado completan el tramo.</Text>
                      </View>
                      <BotonTinta
                        etiqueta="Hallazgo"
                        accessibilityLabel={`Registrar un hallazgo en la celda ${missionCellLabel(cell.cellKey)}`}
                        variante="fantasma"
                        tamano="compacto"
                        disabled={mission.status !== 'active' || busy}
                        cargando={busy}
                        onPress={() => capture(cell)}
                      />
                    </View>
                    {confirmEmptyCell === cell.id ? (
                      <View className="mt-4 border border-verde p-4">
                        <Text className="font-archivo-bold text-sm text-tinta">¿Recorriste esta celda sin registrar un hallazgo?</Text>
                        <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">Esto no afirma que el fenómeno no exista. Sólo acredita que esta identidad recorrió la celda, usando GPS actual; el punto se descarta después de validar.</Text>
                        <View className="mt-4 flex-row gap-2">
                          <BotonTinta
                            etiqueta="Cancelar"
                            accessibilityLabel="Cancelar recorrido sin hallazgo"
                            variante="fantasma"
                            tamano="compacto"
                            className="flex-1"
                            disabled={busy}
                            onPress={() => setConfirmEmptyCell(null)}
                          />
                          <BotonTinta
                            etiqueta="Acreditar con GPS"
                            accessibilityLabel={`Acreditar con GPS la celda ${missionCellLabel(cell.cellKey)}`}
                            variante="fantasma"
                            tamano="compacto"
                            className="flex-1"
                            disabled={busy}
                            cargando={busy}
                            onPress={() => void recordVisitWithoutFinding(cell)}
                          />
                        </View>
                      </View>
                    ) : (
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel={`Recorrí la celda ${missionCellLabel(cell.cellKey)} sin registrar un hallazgo`}
                        disabled={mission.status !== 'active' || busy}
                        onPress={() => setConfirmEmptyCell(cell.id)}
                        className="mt-3 min-h-11 items-start justify-center self-start"
                      >
                        <Text className="font-space text-xs uppercase tracking-[1px] text-tinta-50">Recorrí y no registré un hallazgo</Text>
                      </Pressable97>
                    )}
                  </PapelCard>
                </Animated.View>
              ))}
            </View>
          </>
        ) : summary.unknown > 0 ? (
          <View className="mt-8 items-center">
            <BotonTinta
              etiqueta="Tomar una ruta de 3 celdas"
              accessibilityLabel="Tomar una ruta de tres celdas"
              onPress={claim}
              disabled={busy || mission.status !== 'active'}
              cargando={busy}
            />
          </View>
        ) : null}

        <Kicker tono="neutro" className="mt-8">Malla de cobertura</Kicker>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {cells.map((cell) => {
            const meta = CELL_META[cell.status];
            return (
              <View
                key={cell.id}
                accessible
                accessibilityLabel={`${missionCellLabel(cell.cellKey)}: ${meta.label}`}
                className="h-[70px] w-[31%] justify-between bg-papel-crudo p-3"
                style={{ borderWidth: 1, borderColor: meta.color }}
              >
                <Text className="font-space text-xs text-tinta">{missionCellLabel(cell.cellKey)}</Text>
                <Text className="font-space text-[10px]" style={{ color: meta.color }}>{meta.short}</Text>
              </View>
            );
          })}
        </View>

        <View className="mt-8 gap-3">
          <BotonTinta
            etiqueta={mission.status === 'paused' ? 'Reanudar misión' : 'Pausar sin perder la ruta'}
            accessibilityLabel={mission.status === 'paused' ? 'Reanudar misión' : 'Pausar misión'}
            variante="fantasma"
            onPress={togglePause}
            disabled={mission.status === 'completed'}
          />
          <BotonTinta
            etiqueta={mission.status === 'completed' ? 'Misión cerrada' : 'Cerrar con evidencia'}
            accessibilityLabel="Cerrar misión"
            variante="fantasma"
            onPress={close}
            disabled={!canClose || mission.status === 'completed'}
          />
        </View>
      </ScrollView>
    </View>
  );
}
