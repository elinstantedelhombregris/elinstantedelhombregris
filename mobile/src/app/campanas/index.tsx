import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchCampanas, type CampaignSummary, type CampaignType } from '@/api/campanas';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { BarraLuminosa } from '@/features/campanas/BarraLuminosa';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { ACCENT_TEXT, PLATA } from '@/theme/tokens';

const TYPE_FILTERS: Array<{ key: CampaignType; label: string }> = [
  { key: 'relevamiento', label: 'Relevamientos' },
  { key: 'consulta', label: 'Consultas' },
];

const TYPE_LABEL: Record<CampaignType, string> = {
  relevamiento: 'Relevamiento',
  consulta: 'Consulta',
};

/**
 * Campañas activas — misiones que iluminan el mapa. El progreso no es una
 * barra administrativa: es cuánta luz ya juntó cada campaña.
 */
export default function Campanas() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<CampaignType | null>(null);
  const [provincia, setProvincia] = useState('');

  const provinciaTrimmed = provincia.trim();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['campanas', 'activa', type, provinciaTrimmed],
    queryFn: () =>
      fetchCampanas({
        ...(type ? { type } : {}),
        ...(provinciaTrimmed ? { province: provinciaTrimmed } : {}),
      }),
  });

  const abrirCrear = () => {
    if (!useAuthStore.getState().user) {
      router.push('/identidad');
      return;
    }
    router.push('/campanas/crear');
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title="Campañas"
        right={
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Lanzar campaña"
            className="p-2"
            onPress={abrirCrear}
          >
            <Ionicons name="add-circle-outline" size={26} color={ACCENT_TEXT} />
          </Pressable97>
        }
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={fadeUp}>
          <View className="flex-row gap-2">
            {TYPE_FILTERS.map((f) => {
              const active = type === f.key;
              return (
                <Pressable97
                  key={f.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${f.label}`}
                  onPress={() => setType(active ? null : f.key)}
                  className={`rounded-full border px-4 py-2 ${
                    active ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-xs ${active ? 'text-white' : 'text-slate-400'}`}
                  >
                    {f.label}
                  </Text>
                </Pressable97>
              );
            })}
          </View>
          <GlassCard className="mt-3 flex-row items-center px-4">
            <Ionicons name="search-outline" size={16} color="#64748b" />
            <TextInput
              value={provincia}
              onChangeText={setProvincia}
              placeholder="Provincia (ej.: Mendoza)"
              placeholderTextColor="#64748b"
              className="ml-2 flex-1 py-3 font-sans text-sm text-white"
              autoCorrect={false}
            />
          </GlassCard>
        </Animated.View>

        {isLoading && (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#94a3b8" />
          </View>
        )}
        {isError && (
          <Text className="mt-16 text-center font-sans text-sm text-slate-400">
            No pudimos cargar las campañas. Probá de nuevo.
          </Text>
        )}
        {!isLoading && !isError && (data ?? []).length === 0 && (
          <Text className="mt-16 text-center font-sans text-sm leading-5 text-slate-400">
            No hay campañas activas con estos filtros.{'\n'}Tu círculo puede lanzar la primera.
          </Text>
        )}

        <View className="mt-5 gap-3">
          {(data ?? []).map((campana, i) => (
            <CampanaCard key={campana.id} campana={campana} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function CampanaCard({ campana, index }: { campana: CampaignSummary; index: number }) {
  const color = campana.mapColor ?? PLATA;
  const pct = campana.targetEntries
    ? Math.min(100, Math.round((campana.entryCount / campana.targetEntries) * 100))
    : null;

  return (
    <Animated.View entering={staggerDelay(Math.min(index, 8))}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={campana.title}
        onPress={() => router.push(`/campanas/${campana.id}`)}
      >
        <GlassCard className="p-4">
          <View className="flex-row items-center">
            <View
              className="mr-2 rounded-full"
              style={{ width: 8, height: 8, backgroundColor: color }}
            />
            <Text className="flex-1 font-sans-semibold text-base text-white" numberOfLines={1}>
              {campana.title}
            </Text>
            <View className="rounded-full bg-white/5 px-2 py-0.5">
              <Text className="font-sans text-[10px] text-slate-400">
                {TYPE_LABEL[campana.type]}
              </Text>
            </View>
          </View>
          <Text className="mt-1 font-sans text-xs text-slate-500" numberOfLines={1}>
            {campana.circleName}
            {campana.targetProvince ? ` · ${campana.targetProvince}` : ''}
          </Text>
          <View className="mt-3">
            <BarraLuminosa pct={pct ?? (campana.entryCount > 0 ? 100 : 0)} color={color} />
          </View>
          <Text className="mt-2 font-sans text-xs text-slate-400">
            <Text className="font-mono text-plata">{campana.entryCount}</Text>
            {campana.targetEntries ? ` de ${campana.targetEntries}` : ''}{' '}
            {campana.entryCount === 1 && !campana.targetEntries ? 'luz sumada' : 'luces sumadas'}
          </Text>
        </GlassCard>
      </Pressable97>
    </Animated.View>
  );
}
