import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, GranoPapel, Kicker, Palitos, PapelCard, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { cellsForMission, missionsAll, summarizeMissionCoverage } from '@/civic/missions';
import type { CivicMissionRow } from '@/db/schema';
import { staggerDelay } from '@/motion/variants';
import { AMBAR_PT, TINTA_30, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

const STATUS_LABEL: Record<CivicMissionRow['status'], string> = {
  planning: 'En preparación',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Cerrada',
  archived: 'Archivada',
};

/** Color del chip de estado — mismo idioma que ESTADO_COLOR en
 * src/app/misiones/index.tsx (spec §8): violeta para convocar, verde en
 * marcha, ámbar en pausa/pendiente, tinta-50 resuelta, tinta-30 archivada. */
const STATUS_COLOR: Record<CivicMissionRow['status'], string> = {
  planning: VIOLETA,
  active: VERDE,
  paused: AMBAR_PT,
  completed: TINTA_50,
  archived: TINTA_30,
};

const pad = (n: number): string => String(n).padStart(3, '0');

export default function MisionesTerritoriales() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [missions, setMissions] = useState<CivicMissionRow[]>([]);
  useFocusEffect(useCallback(() => setMissions(missionsAll()), []));

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
          <Kicker>lazo · celdas · evidencia</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Misiones</TituloAnton>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Text className="font-archivo text-base leading-7 text-tinta-90">
          El territorio no se llena de puntos. Se llena de preguntas respondidas.
        </Text>
        <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
          Cada misión nace de un lazo, declara sus reglas y conserva lo desconocido a la vista.
        </Text>

        <View className="mt-6 items-center">
          <BotonTinta
            etiqueta="Trazar nueva misión →"
            accessibilityLabel="Trazar una nueva misión"
            onPress={() => router.push('/territorio/mapa')}
          />
        </View>

        {missions.length > 0 ? (
          <View className="mt-8 gap-3">
            {missions.map((mission, index) => {
              const summary = summarizeMissionCoverage(cellsForMission(mission.id));
              return (
                <Animated.View key={mission.id} entering={staggerDelay(index)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir misión ${mission.title}`}
                    onPress={() => router.push(`/territorio/misiones/${mission.id}`)}
                    className="bg-papel-crudo border border-tinta p-5"
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="font-space text-[10px] text-tinta-30">{pad(index + 1)}</Text>
                        <TituloAnton tamano="md" className="mt-2">{mission.title}</TituloAnton>
                        <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{mission.purpose}</Text>
                      </View>
                      <ChipTipo etiqueta={STATUS_LABEL[mission.status]} activo color={STATUS_COLOR[mission.status]} />
                    </View>
                    <View className="mt-5">
                      <Palitos total={summary.visited} de={summary.planned} color={VIOLETA} />
                    </View>
                    <View className="mt-3 flex-row justify-between">
                      <Text className="font-space text-xs text-tinta-50">{summary.visited}/{summary.planned} recorridas</Text>
                      <Text className="font-space text-xs text-tinta-50">{summary.corroborated} corroboradas</Text>
                    </View>
                  </Pressable97>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <PapelCard className="mt-8 items-center p-8">
            <TituloAnton tamano="md" className="text-center">Todavía no hay operación.</TituloAnton>
            <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-75">Rodeá una zona con el lazo; la convertiremos en un plan recorrible.</Text>
          </PapelCard>
        )}
      </ScrollView>
    </View>
  );
}
