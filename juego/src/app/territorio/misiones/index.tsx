import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { cellsForMission, missionsAll, summarizeMissionCoverage } from '@/civic/missions';
import type { CivicMissionRow } from '@/db/schema';
import { staggerDelay } from '@/motion/variants';

const STATUS_LABEL: Record<CivicMissionRow['status'], string> = {
  planning: 'En preparación',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Cerrada',
  archived: 'Archivada',
};

export default function MisionesTerritoriales() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [missions, setMissions] = useState<CivicMissionRow[]>([]);
  useFocusEffect(useCallback(() => setMissions(missionsAll()), []));

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Misiones" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Text className="mt-1 font-serif text-[30px] leading-[39px] text-plata">El territorio no se llena de puntos. Se llena de preguntas respondidas.</Text>
        <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">Cada misión nace de un lazo, declara sus reglas y conserva lo desconocido a la vista.</Text>

        <Pressable97 accessibilityRole="button" accessibilityLabel="Trazar una nueva misión" onPress={() => router.push('/territorio/mapa')} className="mt-6 min-h-14 flex-row items-center justify-center gap-2 rounded-full bg-accent px-6">
          <Ionicons name="brush-outline" size={18} color="white" />
          <Text className="font-sans-semibold text-sm text-white">Trazar nueva misión</Text>
        </Pressable97>

        {missions.length > 0 ? (
          <View className="mt-8 gap-3">
            {missions.map((mission, index) => {
              const summary = summarizeMissionCoverage(cellsForMission(mission.id));
              return (
                <Animated.View key={mission.id} entering={staggerDelay(index)}>
                  <Pressable97 accessibilityRole="button" accessibilityLabel={`Abrir misión ${mission.title}`} onPress={() => router.push(`/territorio/misiones/${mission.id}`)}>
                    <GlassCard className="p-5">
                      <View className="flex-row items-start justify-between gap-4">
                        <View className="flex-1">
                          <Text className="font-sans text-[9px] uppercase tracking-[2px] text-violet-300">{STATUS_LABEL[mission.status]}</Text>
                          <Text className="mt-2 font-serif text-xl leading-7 text-plata">{mission.title}</Text>
                          <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{mission.purpose}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={18} color="#A78BFA" />
                      </View>
                      <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><View className="h-full bg-violet-400" style={{ width: `${summary.coveragePct}%` }} /></View>
                      <View className="mt-3 flex-row justify-between">
                        <Text className="font-mono text-xs text-slate-500">{summary.visited}/{summary.planned} recorridas</Text>
                        <Text className="font-mono text-xs text-slate-500">{summary.corroborated} corroboradas</Text>
                      </View>
                    </GlassCard>
                  </Pressable97>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View className="mt-8 items-center rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <Ionicons name="map-outline" size={30} color="#64748B" />
            <Text className="mt-4 text-center font-serif text-2xl text-plata">Todavía no hay operación.</Text>
            <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-400">Rodeá una zona con el lazo; la convertiremos en un plan recorrible.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
