import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
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

const CELL_META: Record<CoverageCellStatus, { label: string; short: string; color: string; icon: string }> = {
  unknown: { label: 'Todavía no recorrida', short: 'desconocida', color: '#64748B', icon: 'help-outline' },
  assigned: { label: 'Ruta tomada', short: 'asignada', color: '#FCD34D', icon: 'walk-outline' },
  visited_empty: { label: 'Recorrida, sin hallazgo registrado', short: 'sin hallazgo', color: '#A7F3D0', icon: 'checkmark-done-outline' },
  observed: { label: 'Recorrida, falta corroborar', short: 'observada', color: '#7DD3FC', icon: 'eye-outline' },
  contested: { label: 'Hay que revisar', short: 'en disputa', color: '#FB7185', icon: 'alert-circle-outline' },
  corroborated: { label: 'Corroborada', short: 'corroborada', color: '#6EE7B7', icon: 'shield-checkmark-outline' },
  stale: { label: 'Perdió vigencia', short: 'vencida', color: '#94A3B8', icon: 'time-outline' },
};

const MISSION_META: Record<CivicMissionRow['status'], { label: string; color: string }> = {
  planning: { label: 'En preparación', color: '#94A3B8' },
  active: { label: 'Misión activa', color: '#6EE7B7' },
  paused: { label: 'Misión pausada', color: '#FCD34D' },
  completed: { label: 'Misión cerrada', color: '#A78BFA' },
  archived: { label: 'Misión archivada', color: '#64748B' },
};

const passportMeta = (campaignKey: CivicCampaignKey) => campaignKey === 'ollas-v1'
  ? { label: 'Ollas y comedores', detail: 'Capacidades y faltantes alimentarios', icon: 'restaurant-outline', color: '#F59E0B' }
  : { label: 'Luminarias', detail: 'Infraestructura de alumbrado', icon: 'flashlight-outline', color: '#A78BFA' };

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

  if (!mission) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Misión" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-sans text-sm text-slate-500">Esta misión no está en este dispositivo.</Text>
        </View>
      </View>
    );
  }
  const missionMeta = MISSION_META[mission.status];

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Operación territorial" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[28px] border border-violet-300/20 bg-[#121018] p-6">
          <LivingHalo />
          <View className="flex-row items-center justify-between">
            <View className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
              <Text className="font-sans-medium text-xs uppercase tracking-[2px] text-violet-200">{missionMeta.label} · v{mission.campaignVersion}</Text>
            </View>
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: missionMeta.color }} />
          </View>
          <Text className="mt-5 font-serif text-[32px] leading-[40px] text-plata">{mission.title}</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">{mission.purpose}</Text>
          <View className="mt-6 flex-row items-end justify-between">
            <View>
              <Text className="font-mono text-4xl text-plata">{summary.coveragePct}%</Text>
              <Text className="mt-1 font-sans text-xs uppercase tracking-[1.5px] text-slate-500">cobertura recorrida</Text>
            </View>
            <Text className="font-mono text-sm text-slate-400">{summary.visited}/{summary.planned} celdas</Text>
          </View>
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <View className="h-full rounded-full bg-violet-400" style={{ width: `${summary.coveragePct}%` }} />
          </View>
          <Text className="mt-3 font-sans text-xs leading-5 text-slate-500">
            Denominador planificado: {summary.planned} celdas. Esto mide recorrido de la zona, no representatividad social.
          </Text>
        </Animated.View>

        {notice && (
          <View className="mt-4 flex-row items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <Ionicons name="information-circle-outline" size={17} color="#FCD34D" />
            <Text className="flex-1 font-sans text-xs leading-5 text-amber-100">{notice}</Text>
          </View>
        )}

        <View className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04]">
          <View className="flex-row items-center p-5">
            <Ionicons name="document-lock-outline" size={20} color="#C4B5FD" />
            <View className="ml-3 flex-1">
              <Text className="font-sans-semibold text-sm text-plata">Pasaporte de datos</Text>
              <Text className="mt-1 font-sans text-xs text-slate-500">Quién, para qué, cómo y hasta cuándo.</Text>
            </View>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={passportOpen ? 'Cerrar pasaporte de datos' : 'Ver pasaporte de datos'}
              accessibilityState={{ expanded: passportOpen }}
              onPress={() => setPassportOpen((value) => !value)}
              className="min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
            >
              <Ionicons name={passportOpen ? 'chevron-up' : 'chevron-down'} size={17} color="#94A3B8" />
            </Pressable97>
          </View>
          {passportOpen && (
            <View className="mx-5 mb-5 gap-4 border-t border-white/10 pt-5">
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
                  <Text className="font-sans text-xs uppercase tracking-[1.5px] text-slate-600">{label}</Text>
                  <Text className="mt-1.5 font-sans text-sm leading-6 text-slate-300">{value}</Text>
                </View>
              ))}
              {canReplacePassport ? (
                <View className="border-t border-white/10 pt-4">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={passportEditing ? 'Cancelar corrección del pasaporte' : 'Corregir tipo y pasaporte de la misión'}
                    accessibilityState={{ expanded: passportEditing }}
                    onPress={() => setPassportEditing((value) => !value)}
                    className="flex-row items-center justify-between rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4"
                  >
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-xs text-amber-100">Corregir tipo de misión</Text>
                      <Text className="mt-1 font-sans text-[10px] leading-4 text-amber-100/60">Disponible sólo antes de tomar una ruta o recoger evidencia.</Text>
                    </View>
                    <Ionicons name={passportEditing ? 'close' : 'create-outline'} size={17} color="#FCD34D" />
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
                            className="flex-row items-center rounded-2xl border p-4"
                            style={{ borderColor: selected ? `${meta.color}70` : '#FFFFFF18', backgroundColor: selected ? `${meta.color}16` : '#FFFFFF08' }}
                          >
                            <Ionicons name={meta.icon as never} size={19} color={selected ? meta.color : '#64748B'} />
                            <View className="ml-3 flex-1">
                              <Text className="font-sans-semibold text-xs text-plata">{meta.label}</Text>
                              <Text className="mt-1 font-sans text-[10px] text-slate-500">{meta.detail} · {passport.retentionDays} días</Text>
                            </View>
                            {selected && <Ionicons name="checkmark-circle" size={18} color={meta.color} />}
                          </Pressable97>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row items-start gap-2 border-t border-white/10 pt-4">
                  <Ionicons name="lock-closed-outline" size={15} color="#64748B" />
                  <Text className="flex-1 font-sans text-[10px] leading-4 text-slate-500">El pasaporte queda bloqueado cuando alguien toma una ruta, para que el propósito de la evidencia no cambie a mitad de la misión.</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Text className="mt-8 font-sans text-xs uppercase tracking-[2.5px] text-slate-400">Estado del territorio</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {(Object.keys(CELL_META) as CoverageCellStatus[]).map((status) => {
            const count = summary[status];
            if (count === 0) return null;
            const meta = CELL_META[status];
            return (
              <View key={status} className="flex-row items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: `${meta.color}35`, backgroundColor: `${meta.color}10` }}>
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <Text className="font-sans text-xs" style={{ color: meta.color }}>{count} {meta.short}</Text>
              </View>
            );
          })}
        </View>

        {mine.length > 0 ? (
          <>
            <Text className="mt-8 font-sans text-xs uppercase tracking-[2.5px] text-amber-200">Tu ruta ahora</Text>
            <View className="mt-3 gap-3">
              {mine.map((cell, index) => (
                <Animated.View key={cell.id} entering={staggerDelay(index)}>
                  <GlassCard className="p-4">
                    <View className="flex-row items-center">
                      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10">
                        <Text className="font-mono text-xs text-amber-200">{missionCellLabel(cell.cellKey)}</Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-sans-semibold text-sm text-plata">Recorrer esta celda</Text>
                        <Text className="mt-1 font-sans text-xs text-slate-500">Un hallazgo válido o un recorrido acreditado completan el tramo.</Text>
                      </View>
                      <Pressable97 accessibilityRole="button" accessibilityLabel={`Registrar un hallazgo en la celda ${missionCellLabel(cell.cellKey)}`} disabled={mission.status !== 'active' || busy} onPress={() => capture(cell)} className={`min-h-11 justify-center rounded-full bg-amber-300 px-4 ${mission.status === 'active' && !busy ? '' : 'opacity-40'}`}>
                        <Text className="font-sans-semibold text-xs text-[#352600]">{busy ? 'Procesando…' : 'Hallazgo'}</Text>
                      </Pressable97>
                    </View>
                    {confirmEmptyCell === cell.id ? (
                      <View className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                        <Text className="font-sans-semibold text-sm text-emerald-100">¿Recorriste esta celda sin registrar un hallazgo?</Text>
                        <Text className="mt-2 font-sans text-[11px] leading-5 text-slate-400">Esto no afirma que el fenómeno no exista. Sólo acredita que esta identidad recorrió la celda, usando GPS actual; el punto se descarta después de validar.</Text>
                        <View className="mt-4 flex-row gap-2">
                          <Pressable97 accessibilityRole="button" accessibilityLabel="Cancelar recorrido sin hallazgo" onPress={() => setConfirmEmptyCell(null)} disabled={busy} className="min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3">
                            <Text className="font-sans-semibold text-xs text-slate-300">Cancelar</Text>
                          </Pressable97>
                          <Pressable97 accessibilityRole="button" accessibilityLabel={`Acreditar con GPS la celda ${missionCellLabel(cell.cellKey)}`} onPress={() => void recordVisitWithoutFinding(cell)} disabled={busy} className="min-h-11 flex-1 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3">
                            <Text className="font-sans-semibold text-xs text-emerald-100">{busy ? 'Comprobando…' : 'Acreditar con GPS'}</Text>
                          </Pressable97>
                        </View>
                      </View>
                    ) : (
                      <Pressable97 accessibilityRole="button" accessibilityLabel={`Recorrí la celda ${missionCellLabel(cell.cellKey)} sin registrar un hallazgo`} disabled={mission.status !== 'active' || busy} onPress={() => setConfirmEmptyCell(cell.id)} className="mt-3 min-h-11 flex-row items-center self-start rounded-xl px-2">
                        <Ionicons name="checkmark-done-outline" size={16} color="#A7F3D0" />
                        <Text className="ml-2 font-sans-semibold text-xs text-emerald-100">Recorrí y no registré un hallazgo</Text>
                      </Pressable97>
                    )}
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          </>
        ) : summary.unknown > 0 ? (
          <Pressable97 accessibilityRole="button" accessibilityLabel="Tomar una ruta de tres celdas" onPress={claim} disabled={busy || mission.status !== 'active'} className="mt-7 min-h-14 flex-row items-center justify-center gap-2 rounded-full bg-accent px-6">
            <Ionicons name="walk-outline" size={18} color="white" />
            <Text className="font-sans-semibold text-sm text-white">{busy ? 'Preparando ruta…' : 'Tomar una ruta de 3 celdas'}</Text>
          </Pressable97>
        ) : null}

        <Text className="mt-8 font-sans text-xs uppercase tracking-[2.5px] text-slate-400">Malla de cobertura</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {cells.map((cell) => {
            const meta = CELL_META[cell.status];
            return (
              <View key={cell.id} accessible accessibilityLabel={`${missionCellLabel(cell.cellKey)}: ${meta.label}`} className="h-[74px] w-[31%] justify-between rounded-2xl border p-3" style={{ borderColor: `${meta.color}42`, backgroundColor: `${meta.color}0D` }}>
                <Ionicons name={meta.icon as never} size={16} color={meta.color} />
                <View>
                  <Text className="font-mono text-xs text-plata">{missionCellLabel(cell.cellKey)}</Text>
                  <Text className="mt-0.5 font-sans text-[10px]" style={{ color: meta.color }}>{meta.short}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-8 gap-3">
          <Pressable97 accessibilityRole="button" accessibilityLabel={mission.status === 'paused' ? 'Reanudar misión' : 'Pausar misión'} onPress={togglePause} disabled={mission.status === 'completed'} className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5">
            <Text className="font-sans-medium text-sm text-slate-300">{mission.status === 'paused' ? 'Reanudar misión' : 'Pausar sin perder la ruta'}</Text>
          </Pressable97>
          <Pressable97 accessibilityRole="button" accessibilityLabel="Cerrar misión" accessibilityHint={canClose ? 'Marca la misión como completada' : 'Cada celda debe estar recorrida; todo hallazgo debe alcanzar las miradas independientes definidas en el pasaporte'} onPress={close} disabled={!canClose || mission.status === 'completed'} className={`min-h-12 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 ${canClose ? '' : 'opacity-40'}`}>
            <Text className="font-sans-semibold text-sm text-emerald-200">{mission.status === 'completed' ? 'Misión cerrada' : 'Cerrar con evidencia'}</Text>
          </Pressable97>
        </View>
      </ScrollView>
    </View>
  );
}
