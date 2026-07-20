/**
 * Bitácora viva: reflexiones del rito + escuchas estructuradas. Ambas son
 * privadas por defecto; publicar siempre crea una derivación separada.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  deletePrivateListening,
  listeningsAll,
  listeningHorizonLabel,
  listeningKindLabel,
  listeningScopeLabel,
  listeningThemeLabel,
  LISTENING_KINDS,
} from '@/civic/listening';
import { contextAttributionSummary, contextLocationSummary, recordContextFor } from '@/civic/record-context';
import { ESTADOS_VACIOS, PREGUNTAS } from '@/content';
import { reflexionesTodas } from '@/db/repos';
import type { CivicListeningRow, ReflectionRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const PREGUNTA_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

const tituloMes = (clave: string): string => {
  const [y, m] = clave.split('-').map(Number) as [number, number];
  return `${MESES[m - 1]} ${y}`;
};

const diaLindo = (fecha: string): string => {
  const date = fecha.includes('T') ? new Date(fecha) : null;
  if (date && !Number.isNaN(date.getTime())) return `${date.getDate()} de ${MESES[date.getMonth()]}`;
  const [, m, d] = fecha.split('-').map(Number) as [number, number, number];
  return `${d} de ${MESES[m - 1]}`;
};

interface GrupoMes {
  clave: string;
  items: ReflectionRow[];
}

const agruparPorMes = (rows: ReflectionRow[]): GrupoMes[] => {
  const desc = [...rows].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const grupos: GrupoMes[] = [];
  for (const r of desc) {
    const clave = r.fecha.slice(0, 7);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.clave === clave) ultimo.items.push(r);
    else grupos.push({ clave, items: [r] });
  }
  return grupos;
};

function EmptyCard({ mode, onListen }: { mode: 'reflections' | 'listenings'; onListen: () => void }) {
  return (
    <Animated.View entering={fadeUp} className="mt-8">
      <GlassCard className="p-6">
        <Text className="font-serif text-2xl text-plata">Todavía nada.</Text>
        <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
          {mode === 'reflections'
            ? ESTADOS_VACIOS.bitacora
            : 'Cuando algo pida ser escuchado, guardalo acá: una necesidad, un sueño, una propuesta o una capacidad.'}
        </Text>
        {mode === 'listenings' && (
          <Pressable97 accessibilityRole="button" accessibilityLabel="Abrir una escucha" onPress={onListen} className="mt-5 min-h-12 self-start justify-center rounded-full border border-violet-300/25 bg-violet-300/10 px-5">
            <Text className="font-sans-semibold text-sm text-violet-200">Abrir una escucha</Text>
          </Pressable97>
        )}
      </GlassCard>
    </Animated.View>
  );
}

export default function Bitacora() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'listenings' | 'reflections'>('listenings');
  const [reflections, setReflections] = useState<ReflectionRow[]>([]);
  const [voices, setVoices] = useState<CivicListeningRow[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    setReflections(reflexionesTodas());
    setVoices(listeningsAll());
  }, []));

  const groups = agruparPorMes(reflections);
  const privateCount = voices.filter((item) => item.status === 'private').length;
  const sharedCount = voices.filter((item) => item.observationId != null).length;
  const preparedCount = voices.filter((item) => item.status === 'connected' && item.needId).length;

  const removePrivateListening = useCallback((id: string) => {
    if (!deletePrivateListening(id)) return;
    setVoices((current) => current.filter((item) => item.id !== id));
    setOpen((current) => current === id ? null : current);
    setConfirmDelete(null);
  }, []);

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title="Bitácora"
        right={(
          <Pressable97 accessibilityRole="button" accessibilityLabel="Nueva escucha" onPress={() => router.push('/escuchar')} className="h-11 w-11 items-center justify-center rounded-full border border-violet-300/25 bg-violet-300/10">
            <Ionicons name="add" size={22} color="#C4B5FD" />
          </Pressable97>
        )}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[24px] border border-emerald-300/15 bg-emerald-300/[0.05] p-5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="lock-closed" size={16} color="#6EE7B7" />
            <Text className="font-sans-semibold text-sm text-emerald-100">Tu espacio de verdad</Text>
          </View>
          <Text className="mt-3 font-sans text-xs leading-5 text-slate-400">
            Privada. No suma puntos. No alimenta perfiles. Cuando decidís contribuir, la app crea una copia mínima y categórica: nunca publica esta página.
          </Text>
          {voices.length > 0 && (
            <View className="mt-4 flex-row gap-5">
              <Text className="font-mono text-xs text-slate-400">{privateCount} sólo acá</Text>
              <Text className="font-mono text-xs text-slate-400">{sharedCount} con faceta colectiva</Text>
              {preparedCount > 0 && <Text className="font-mono text-xs text-slate-400">{preparedCount} pedido preparado</Text>}
            </View>
          )}
        </Animated.View>

        <View className="mt-5 flex-row rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          {([
            ['listenings', 'Escuchas', voices.length],
            ['reflections', 'Reflexiones', reflections.length],
          ] as const).map(([key, label, count]) => (
            <Pressable97 key={key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tab === key }} onPress={() => { setTab(key); setOpen(null); }} className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl" style={{ backgroundColor: tab === key ? '#FFFFFF12' : 'transparent' }}>
              <Text className="font-sans-medium text-sm" style={{ color: tab === key ? '#F5F7FA' : '#64748B' }}>{label}</Text>
              <Text className="font-mono text-xs text-slate-500">{count}</Text>
            </Pressable97>
          ))}
        </View>

        {tab === 'listenings' && (
          voices.length === 0 ? <EmptyCard mode="listenings" onListen={() => router.push('/escuchar')} /> : (
            <View className="mt-5 gap-3">
              {voices.map((voice, index) => {
                const expanded = open === voice.id;
                const definition = LISTENING_KINDS.find((item) => item.key === voice.kind);
                const shared = voice.observationId != null;
                const prepared = voice.status === 'connected' && voice.needId != null;
                const canPrepareCustodiedNeed = voice.status === 'private'
                  && voice.kind === 'need'
                  && voice.supportWanted;
                const context = recordContextFor('listening', voice.id);
                return (
                  <Animated.View key={voice.id} entering={staggerDelay(Math.min(index, 8))}>
                    <GlassCard className="overflow-hidden">
                      <Pressable97 accessibilityRole="button" accessibilityLabel={`${listeningKindLabel(voice.kind)} sobre ${listeningThemeLabel(voice.theme)}`} accessibilityHint="Toca para expandir" onPress={() => setOpen(expanded ? null : voice.id)} className="p-5" silent>
                        <View className="flex-row items-center">
                          <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${definition?.color ?? '#A78BFA'}18` }}>
                            <Ionicons name={(definition?.icon ?? 'sparkles-outline') as never} size={19} color={definition?.color ?? '#A78BFA'} />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="font-sans text-xs uppercase tracking-[1.8px]" style={{ color: definition?.color ?? '#A78BFA' }}>{listeningKindLabel(voice.kind)}</Text>
                            <Text className="mt-1 font-sans-medium text-sm text-plata">{listeningThemeLabel(voice.theme)}</Text>
                          </View>
                          <View className="items-end">
                            <Ionicons name={shared ? 'radio-outline' : 'lock-closed-outline'} size={15} color={shared ? '#6EE7B7' : '#64748B'} />
                            <Text className="mt-1 font-mono text-[10px] text-slate-500">{diaLindo(voice.createdAt)}</Text>
                          </View>
                        </View>
                        <Text numberOfLines={expanded ? undefined : 3} className="mt-4 font-serif-italic text-lg leading-7 text-slate-200">«{voice.statement}»</Text>
                        <View className="mt-4 flex-row flex-wrap gap-2">
                          {[listeningHorizonLabel(voice.horizon), listeningScopeLabel(voice.scope), `importancia ${voice.importance}/5`].map((item) => (
                            <View key={item} className="rounded-full bg-white/5 px-3 py-1.5"><Text className="font-sans text-xs text-slate-500">{item}</Text></View>
                          ))}
                        </View>
                      </Pressable97>
                      {expanded && (
                          <View className="mx-5 mb-5 gap-4 border-t border-white/10 pt-5">
                            {voice.desiredOutcome && <View><Text className="font-sans text-xs uppercase tracking-[1.5px] text-slate-600">Resultado que serviría</Text><Text className="mt-2 font-sans text-sm leading-6 text-slate-300">{voice.desiredOutcome}</Text></View>}
                            {voice.existingStrength && <View><Text className="font-sans text-xs uppercase tracking-[1.5px] text-slate-600">Lo que ya sostiene</Text><Text className="mt-2 font-sans text-sm leading-6 text-slate-300">{voice.existingStrength}</Text></View>}
                            {voice.firstStep && <View><Text className="font-sans text-xs uppercase tracking-[1.5px] text-slate-600">Primer paso posible</Text><Text className="mt-2 font-sans text-sm leading-6 text-slate-300">{voice.firstStep}</Text></View>}
                            <View className="flex-row items-center gap-2">
                              <Ionicons name={shared ? 'shield-checkmark-outline' : 'lock-closed-outline'} size={15} color={shared ? '#6EE7B7' : '#64748B'} />
                              <Text className="flex-1 font-sans text-xs leading-5 text-slate-500">{shared ? 'El relato sigue privado; sólo se compartieron sus facetas.' : 'Sólo existe en esta bitácora local.'}</Text>
                            </View>
                            {prepared && (
                              <Pressable97
                                accessibilityRole="button"
                                accessibilityLabel="Abrir pedido bajo custodia"
                                onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: voice.id } })}
                                className="min-h-12 flex-row items-center rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] px-4"
                              >
                                <Ionicons name="shield-checkmark-outline" size={17} color="#FDA4AF" />
                                <Text className="ml-2 flex-1 font-sans-semibold text-xs text-rose-100">Pedido bajo custodia</Text>
                                <Ionicons name="arrow-forward" size={15} color="#FDA4AF" />
                              </Pressable97>
                            )}
                            {canPrepareCustodiedNeed && (
                              <Pressable97
                                accessibilityRole="button"
                                accessibilityLabel="Preparar pedido bajo custodia"
                                accessibilityHint="Separa un pedido operativo mínimo sin publicar el relato"
                                onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: voice.id } })}
                                className="min-h-12 flex-row items-center rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] px-4"
                              >
                                <Ionicons name="shield-checkmark-outline" size={17} color="#FDA4AF" />
                                <View className="ml-2 flex-1">
                                  <Text className="font-sans-semibold text-xs text-rose-100">Preparar pedido bajo custodia</Text>
                                  <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">El relato queda privado; elegís custodia, vigencia y punto seguro.</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={15} color="#FDA4AF" />
                              </Pressable97>
                            )}
                            {shared && context && (
                              <View className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                                <Text className="font-sans text-[10px] uppercase tracking-[1.5px] text-slate-600">Pasaporte compartido</Text>
                                <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{contextLocationSummary(context)}</Text>
                                <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{contextAttributionSummary(context)}</Text>
                              </View>
                            )}
                            {!shared && !prepared && voice.status === 'private' && (
                              confirmDelete === voice.id ? (
                                <View className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-4">
                                  <Text className="font-sans-semibold text-sm text-rose-100">¿Eliminar esta escucha privada?</Text>
                                  <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">Se borrará de este dispositivo. Como nunca fue compartida, no queda nada que retirar de la red.</Text>
                                  <View className="mt-4 flex-row gap-2">
                                    <Pressable97
                                      accessibilityRole="button"
                                      accessibilityLabel="Conservar escucha privada"
                                      onPress={() => setConfirmDelete(null)}
                                      className="min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3"
                                    >
                                      <Text className="font-sans-semibold text-xs text-slate-300">Conservar</Text>
                                    </Pressable97>
                                    <Pressable97
                                      accessibilityRole="button"
                                      accessibilityLabel="Confirmar eliminación de escucha privada"
                                      onPress={() => removePrivateListening(voice.id)}
                                      className="min-h-11 flex-1 items-center justify-center rounded-xl border border-rose-300/25 bg-rose-300/10 px-3"
                                    >
                                      <Text className="font-sans-semibold text-xs text-rose-100">Eliminar</Text>
                                    </Pressable97>
                                  </View>
                                </View>
                              ) : (
                                <Pressable97
                                  accessibilityRole="button"
                                  accessibilityLabel="Eliminar escucha privada de este dispositivo"
                                  onPress={() => setConfirmDelete(voice.id)}
                                  className="min-h-11 flex-row items-center self-start rounded-xl px-2"
                                >
                                  <Ionicons name="trash-outline" size={15} color="#FDA4AF" />
                                  <Text className="ml-2 font-sans-semibold text-xs text-rose-200">Eliminar de mi bitácora</Text>
                                </Pressable97>
                              )
                            )}
                          </View>
                        )}
                    </GlassCard>
                  </Animated.View>
                );
              })}
              <Pressable97 accessibilityRole="button" accessibilityLabel="Abrir otra escucha" onPress={() => router.push('/escuchar')} className="mt-2 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300/25 bg-violet-300/[0.06] px-5">
                <Ionicons name="add-circle-outline" size={19} color="#C4B5FD" />
                <Text className="font-sans-semibold text-sm text-violet-200">Abrir otra escucha</Text>
              </Pressable97>
            </View>
          )
        )}

        {tab === 'reflections' && (
          reflections.length === 0 ? <EmptyCard mode="reflections" onListen={() => router.push('/escuchar')} /> : groups.map((group) => (
            <View key={group.clave}>
              <Text className="mb-3 mt-7 font-sans text-xs uppercase tracking-[2.5px] text-slate-400">{tituloMes(group.clave)}</Text>
              <View className="gap-2.5">
                {group.items.map((reflection, index) => {
                  const question = PREGUNTA_POR_ID.get(reflection.preguntaId);
                  const expanded = open === reflection.id;
                  return (
                    <Animated.View key={reflection.id} entering={staggerDelay(Math.min(index, 6))}>
                      <Pressable97 accessibilityRole="button" accessibilityLabel={`Reflexión del ${diaLindo(reflection.fecha)}`} onPress={() => setOpen(expanded ? null : reflection.id)} silent>
                        <GlassCard className="p-4">
                          <Text className="font-mono text-xs text-slate-500">{diaLindo(reflection.fecha)}</Text>
                          {question && <Text numberOfLines={expanded ? undefined : 1} className="mt-2 font-sans text-xs leading-5 text-slate-400">{question.texto}</Text>}
                          <Text numberOfLines={expanded ? undefined : 2} className="mt-2.5 font-serif-italic text-base leading-7 text-slate-200">«{reflection.texto}»</Text>
                          {expanded && question && <Text className="mt-3 font-sans text-xs text-slate-600">la pregunta venía de «{question.fuente}»</Text>}
                        </GlassCard>
                      </Pressable97>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
