import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchCirculos, type CircleKind, type CircleSummary } from '@/api/circulos';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { GlifoCirculo } from '@/features/circulos/GlifoCirculo';
import { CIRCLE_KINDS, KIND_MAP } from '@/features/circulos/kinds';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { ACCENT_TEXT } from '@/theme/tokens';

/**
 * Panel de círculos: los tuyos primero, después el país para descubrir.
 * Filtros por tipo + búsqueda por provincia.
 */
export default function Circulos() {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<CircleKind | null>(null);
  const [provincia, setProvincia] = useState('');

  const provinciaTrimmed = provincia.trim();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['circulos', kind, provinciaTrimmed],
    queryFn: () =>
      fetchCirculos({
        ...(kind ? { kind } : {}),
        ...(provinciaTrimmed ? { province: provinciaTrimmed } : {}),
      }),
  });

  const { mios, descubrir } = useMemo(() => {
    const all = data ?? [];
    return {
      mios: all.filter((c) => c.isMember),
      descubrir: all.filter((c) => !c.isMember),
    };
  }, [data]);

  const abrirCrear = () => {
    if (!useAuthStore.getState().user) {
      router.push('/identidad');
      return;
    }
    router.push('/circulos/crear');
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title="Círculos"
        right={
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Crear círculo"
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
        {/* Filtros: tipo + provincia */}
        <Animated.View entering={fadeUp}>
          <View className="flex-row gap-2">
            {CIRCLE_KINDS.map((k) => {
              const active = kind === k.key;
              return (
                <Pressable97
                  key={k.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${k.label}`}
                  onPress={() => setKind(active ? null : k.key)}
                  className={`rounded-full border px-4 py-2 ${
                    active ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-xs ${active ? 'text-white' : 'text-slate-400'}`}
                  >
                    {k.label}
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
              placeholder="Provincia (ej.: Córdoba)"
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
            No pudimos cargar los círculos. Probá de nuevo.
          </Text>
        )}

        {mios.length > 0 && (
          <View className="mt-6">
            <SectionBadge>Mis círculos</SectionBadge>
            <View className="mt-3 gap-3">
              {mios.map((c, i) => (
                <CirculoRow key={c.id} circulo={c} index={i} />
              ))}
            </View>
          </View>
        )}

        {!isLoading && !isError && (
          <View className="mt-6">
            <SectionBadge>Descubrir</SectionBadge>
            {descubrir.length === 0 ? (
              <Text className="mt-4 font-sans text-sm leading-5 text-slate-400">
                Todavía no hay círculos con estos filtros. Podés crear el primero — alguien
                tiene que encender la primera estrella.
              </Text>
            ) : (
              <View className="mt-3 gap-3">
                {descubrir.map((c, i) => (
                  <CirculoRow key={c.id} circulo={c} index={i} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Entrar con invitación (células y códigos QR) */}
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Tengo una invitación"
          className="mt-8 items-center py-2"
          onPress={() => router.push('/circulos/invitacion')}
        >
          <Text className="font-sans text-sm text-accent-text">Tengo una invitación</Text>
        </Pressable97>
      </ScrollView>
    </View>
  );
}

function CirculoRow({ circulo, index }: { circulo: CircleSummary; index: number }) {
  const kindDef = KIND_MAP[circulo.kind];
  return (
    <Animated.View entering={staggerDelay(Math.min(index, 8))}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={circulo.name}
        onPress={() => router.push(`/circulos/${circulo.id}`)}
      >
        <GlassCard className="flex-row items-center p-4">
          <GlifoCirculo id={circulo.id} />
          <View className="ml-3 flex-1">
            <Text className="font-sans-semibold text-base text-white" numberOfLines={1}>
              {circulo.name}
            </Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="font-sans text-xs text-slate-400">{kindDef.label}</Text>
              {circulo.province && (
                <Text className="font-sans text-xs text-slate-500" numberOfLines={1}>
                  · {circulo.city ? `${circulo.city}, ` : ''}
                  {circulo.province}
                </Text>
              )}
              {circulo.theme && (
                <Text className="font-sans text-xs text-slate-500" numberOfLines={1}>
                  · {circulo.theme}
                </Text>
              )}
            </View>
          </View>
          <View className="items-end">
            <Text className="font-mono text-base text-plata">{circulo.memberCount}</Text>
            <Text className="font-sans text-[10px] text-slate-500">
              {circulo.memberCount === 1 ? 'miembro' : 'miembros'}
            </Text>
          </View>
        </GlassCard>
      </Pressable97>
    </Animated.View>
  );
}
