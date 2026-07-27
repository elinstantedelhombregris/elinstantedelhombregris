/**
 * Bitácora viva: reflexiones del rito + escuchas estructuradas. Ambas son
 * privadas por defecto; publicar siempre crea una derivación separada.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): la pantalla más
 * editorial del cuaderno — filas índice con fecha mono, lectura Archivo
 * 17/1.75, estados como palabras mono (nada de íconos decorativos).
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  deletePrivateListening,
  listeningsAll,
  listeningHorizonLabel,
  listeningKindLabel,
  listeningScopeLabel,
  listeningThemeLabel,
} from '@/civic/listening';
import type { ListeningKind } from '@/civic/types';
import { contextAttributionSummary, contextLocationSummary, recordContextFor } from '@/civic/record-context';
import { ESTADOS_VACIOS, PREGUNTAS, SENAL_POR_KEY } from '@/content';
import { reflexionesTodas } from '@/db/repos';
import type { CivicListeningRow, ReflectionRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { ROJO_SELLO } from '@/theme/tokens';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const PREGUNTA_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

/** Color de señal (spec §2) por tipo de escucha — el mismo mapeo que usa
 * La Escucha, leído contra la tabla de colores del papel. */
const COLOR_POR_KIND: Record<ListeningKind, string> = {
  need: SENAL_POR_KEY.need.color,
  dream: SENAL_POR_KEY.dream.color,
  proposal: SENAL_POR_KEY.value.color,
  capacity: SENAL_POR_KEY.recurso.color,
};

/** Lectura editorial (spec §8): Archivo 17px, interlineado 1.75. */
const LECTURA = { fontSize: 17, lineHeight: 30 };

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

/** La fecha corta de la columna índice: «12 jul». */
const diaCorto = (fecha: string): string => {
  const date = fecha.includes('T') ? new Date(fecha) : null;
  if (date && !Number.isNaN(date.getTime())) return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]}`;
  const [, m, d] = fecha.split('-').map(Number) as [number, number, number];
  return `${d} ${MESES_CORTOS[m - 1]}`;
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
      <PapelCard className="p-6">
        <TituloAnton tamano="md">Todavía nada.</TituloAnton>
        <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
          {mode === 'reflections'
            ? ESTADOS_VACIOS.bitacora
            : 'Cuando algo pida ser escuchado, guardalo acá: una necesidad, un sueño, una propuesta o una capacidad.'}
        </Text>
        {mode === 'listenings' && (
          <View className="mt-5 items-start">
            <BotonTinta etiqueta="Abrir una escucha →" onPress={onListen} />
          </View>
        )}
      </PapelCard>
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
          <BotonTinta
            etiqueta="+ Escucha"
            variante="fantasma"
            tamano="compacto"
            accessibilityLabel="Nueva escucha"
            onPress={() => router.push('/escuchar')}
          />
        </View>
        <View className="mt-2">
          <Kicker>privada por defecto · tuya siempre</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Bitácora
          </TituloAnton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 32 }}>
        <Animated.View entering={fadeUp}>
          <PapelCard className="border-verde p-5">
            <Text className="font-archivo-bold text-sm text-tinta">Tu espacio de verdad</Text>
            <Text className="mt-3 font-archivo text-xs leading-5 text-tinta-75">
              Privada. No suma puntos. No alimenta perfiles. Cuando decidís contribuir, la app crea una copia mínima y categórica: nunca publica esta página.
            </Text>
            {voices.length > 0 && (
              <View className="mt-4 flex-row flex-wrap gap-x-5 gap-y-1">
                <Text className="font-space text-xs text-tinta-50">{privateCount} sólo acá</Text>
                <Text className="font-space text-xs text-tinta-50">{sharedCount} con faceta colectiva</Text>
                {preparedCount > 0 && <Text className="font-space text-xs text-tinta-50">{preparedCount} pedido preparado</Text>}
              </View>
            )}
          </PapelCard>
        </Animated.View>

        <View className="mt-5 flex-row gap-2">
          {([
            ['listenings', 'Escuchas', voices.length],
            ['reflections', 'Reflexiones', reflections.length],
          ] as const).map(([key, label, count]) => (
            <ChipTipo
              key={key}
              etiqueta={`${label} (${count})`}
              activo={tab === key}
              accessibilityLabel={label}
              onPress={() => { setTab(key); setOpen(null); }}
            />
          ))}
        </View>

        {tab === 'listenings' && (
          voices.length === 0 ? <EmptyCard mode="listenings" onListen={() => router.push('/escuchar')} /> : (
            <View className="mt-5 gap-3">
              {voices.map((voice, index) => {
                const expanded = open === voice.id;
                const color = COLOR_POR_KIND[voice.kind as ListeningKind] ?? undefined;
                const shared = voice.observationId != null;
                const prepared = voice.status === 'connected' && voice.needId != null;
                const canPrepareCustodiedNeed = voice.status === 'private'
                  && voice.kind === 'need'
                  && voice.supportWanted;
                const context = recordContextFor('listening', voice.id);
                return (
                  <Animated.View key={voice.id} entering={staggerDelay(Math.min(index, 8))}>
                    <PapelCard variante="suave">
                      <Pressable97 accessibilityRole="button" accessibilityLabel={`${listeningKindLabel(voice.kind)} sobre ${listeningThemeLabel(voice.theme)}`} accessibilityHint="Toca para expandir" onPress={() => setOpen(expanded ? null : voice.id)} className="p-5" silent>
                        <View className="flex-row items-baseline justify-between gap-3">
                          <View className="flex-1">
                            <Text className="font-space text-[10px] uppercase tracking-[2px]" style={{ color }}>
                              {listeningKindLabel(voice.kind)}
                            </Text>
                            <Text className="mt-1 font-archivo-bold text-sm text-tinta">{listeningThemeLabel(voice.theme)}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="font-space text-[9px] uppercase tracking-[1.5px] text-tinta-50">
                              {shared ? 'compartida' : 'privada'}
                            </Text>
                            <Text className="mt-1 font-space text-[10px] text-tinta-50">{diaLindo(voice.createdAt)}</Text>
                          </View>
                        </View>
                        <Text numberOfLines={expanded ? undefined : 3} className="mt-4 font-archivo-italic text-tinta-90" style={LECTURA}>«{voice.statement}»</Text>
                        <View className="mt-4 flex-row flex-wrap gap-2">
                          {[listeningHorizonLabel(voice.horizon), listeningScopeLabel(voice.scope), `importancia ${voice.importance}/5`].map((item) => (
                            <View key={item} className="bg-papel-presionado px-3 py-1.5"><Text className="font-archivo text-xs text-tinta-75">{item}</Text></View>
                          ))}
                        </View>
                      </Pressable97>
                      {expanded && (
                          <View className="mx-5 mb-5 gap-4 border-t border-bordeSuave pt-5">
                            {voice.desiredOutcome && <View><Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">Resultado que serviría</Text><Text className="mt-2 font-archivo text-sm leading-6 text-tinta-90">{voice.desiredOutcome}</Text></View>}
                            {voice.existingStrength && <View><Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">Lo que ya sostiene</Text><Text className="mt-2 font-archivo text-sm leading-6 text-tinta-90">{voice.existingStrength}</Text></View>}
                            {voice.firstStep && <View><Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">Primer paso posible</Text><Text className="mt-2 font-archivo text-sm leading-6 text-tinta-90">{voice.firstStep}</Text></View>}
                            <Text className="font-archivo text-xs leading-5 text-tinta-50">
                              {shared ? 'El relato sigue privado; sólo se compartieron sus facetas.' : 'Sólo existe en esta bitácora local.'}
                            </Text>
                            {prepared && (
                              <Pressable97
                                accessibilityRole="button"
                                accessibilityLabel="Abrir pedido bajo custodia"
                                onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: voice.id } })}
                                className="min-h-12 flex-row items-center justify-between border border-sello bg-papel-crudo px-4"
                              >
                                <Text className="font-archivo-bold text-xs text-sello">Pedido bajo custodia</Text>
                                <Text className="font-space text-sello">→</Text>
                              </Pressable97>
                            )}
                            {canPrepareCustodiedNeed && (
                              <Pressable97
                                accessibilityRole="button"
                                accessibilityLabel="Preparar pedido bajo custodia"
                                accessibilityHint="Separa un pedido operativo mínimo sin publicar el relato"
                                onPress={() => router.push({ pathname: '/escuchar/necesidad/[id]', params: { id: voice.id } })}
                                className="min-h-12 flex-row items-center justify-between gap-3 border border-sello bg-papel-crudo px-4 py-3"
                              >
                                <View className="flex-1">
                                  <Text className="font-archivo-bold text-xs text-sello">Preparar pedido bajo custodia</Text>
                                  <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">El relato queda privado; elegís custodia, vigencia y punto seguro.</Text>
                                </View>
                                <Text className="font-space text-sello">→</Text>
                              </Pressable97>
                            )}
                            {shared && context && (
                              <View className="bg-papel-presionado p-4">
                                <Text className="font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">Pasaporte compartido</Text>
                                <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{contextLocationSummary(context)}</Text>
                                <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">{contextAttributionSummary(context)}</Text>
                              </View>
                            )}
                            {!shared && !prepared && voice.status === 'private' && (
                              confirmDelete === voice.id ? (
                                <View className="border border-sello p-4">
                                  <Text className="font-archivo-bold text-sm text-tinta">¿Eliminar esta escucha privada?</Text>
                                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">Se borrará de este dispositivo. Como nunca fue compartida, no queda nada que retirar de la red.</Text>
                                  <View className="mt-4 flex-row gap-2">
                                    <BotonTinta
                                      etiqueta="Conservar"
                                      variante="fantasma"
                                      tamano="compacto"
                                      accessibilityLabel="Conservar escucha privada"
                                      onPress={() => setConfirmDelete(null)}
                                      className="flex-1"
                                    />
                                    <BotonTinta
                                      etiqueta="Eliminar"
                                      variante="tinta"
                                      tamano="compacto"
                                      accessibilityLabel="Confirmar eliminación de escucha privada"
                                      onPress={() => removePrivateListening(voice.id)}
                                      className="flex-1"
                                      style={{ borderWidth: 1, borderColor: ROJO_SELLO }}
                                    />
                                  </View>
                                </View>
                              ) : (
                                <Pressable97
                                  accessibilityRole="button"
                                  accessibilityLabel="Eliminar escucha privada de este dispositivo"
                                  onPress={() => setConfirmDelete(voice.id)}
                                  className="min-h-11 flex-row items-center self-start px-2"
                                >
                                  <Text className="font-space text-xs text-sello">Eliminar de mi bitácora</Text>
                                </Pressable97>
                              )
                            )}
                          </View>
                        )}
                    </PapelCard>
                  </Animated.View>
                );
              })}
              <Pressable97 accessibilityRole="button" accessibilityLabel="Abrir otra escucha" onPress={() => router.push('/escuchar')} className="mt-2 min-h-14 flex-row items-center justify-center gap-2 border border-dashed border-tinta bg-papel-crudo px-5">
                <Text className="font-archivo-bold text-sm text-tinta">+ Abrir otra escucha</Text>
              </Pressable97>
            </View>
          )
        )}

        {tab === 'reflections' && (
          reflections.length === 0 ? <EmptyCard mode="reflections" onListen={() => router.push('/escuchar')} /> : groups.map((group) => (
            <View key={group.clave}>
              <Kicker tono="neutro" className="mb-1 mt-7">
                {tituloMes(group.clave)}
              </Kicker>
              <View>
                {group.items.map((reflection, index) => {
                  const question = PREGUNTA_POR_ID.get(reflection.preguntaId);
                  const expanded = open === reflection.id;
                  return (
                    <Animated.View key={reflection.id} entering={staggerDelay(Math.min(index, 6))}>
                      <FilaIndice
                        numero={diaCorto(reflection.fecha)}
                        glifo={expanded ? '−' : '+'}
                        accessibilityLabel={`Reflexión del ${diaLindo(reflection.fecha)}`}
                        onPress={() => setOpen(expanded ? null : reflection.id)}
                      >
                        {question && <Text numberOfLines={expanded ? undefined : 1} className="font-archivo text-xs leading-5 text-tinta-50">{question.texto}</Text>}
                        <Text numberOfLines={expanded ? undefined : 2} className="mt-2 font-archivo-italic text-tinta-90" style={LECTURA}>«{reflection.texto}»</Text>
                        {expanded && question && <Text className="mt-3 font-space text-[10px] text-tinta-50">la pregunta venía de «{question.fuente}»</Text>}
                      </FilaIndice>
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
