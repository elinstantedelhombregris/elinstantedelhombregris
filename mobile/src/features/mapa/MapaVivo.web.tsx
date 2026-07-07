import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchMapSignals } from '@/api/map';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RADAR_TYPES, RADAR_TYPE_MAP, type RadarTypeKey } from '@/lib/radar-types';
import { fadeIn } from '@/motion/variants';
import { useMapStore } from '@/stores/map';
import { PLATA } from '@/theme/tokens';

/**
 * LA CONSTELACIÓN — versión web (solo preview de desarrollo).
 * MapLibre nativo no corre en web: proyección equirrectangular simple de la
 * Argentina con las señales reales como puntos de luz.
 */

// Caja aproximada de la Argentina continental
const BOUNDS = { latMin: -55.2, latMax: -21.5, lngMin: -73.8, lngMax: -53.4 };

export function MapaVivo() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { filter, setFilter } = useMapStore();
  const [detalle, setDetalle] = useState<{ type: string; text: string } | null>(null);

  const { data: signals = [] } = useQuery({
    queryKey: ['map-signals'],
    queryFn: fetchMapSignals,
    staleTime: 60_000,
  });

  const visibles = signals.filter((s) => (filter ? s.type === filter : true));

  // Proyección: la caja de Argentina centrada, ocupando ~80% del alto
  const mapH = height * 0.8;
  const mapW = mapH * ((BOUNDS.lngMax - BOUNDS.lngMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 0.75;
  const offsetX = (width - mapW) / 2;
  const offsetY = height * 0.08;
  const px = (lng: number) => offsetX + ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * mapW;
  const py = (lat: number) => offsetY + ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * mapH;

  return (
    <View className="flex-1 bg-fondo">
      <Animated.View entering={fadeIn} className="absolute inset-0">
        {visibles.map((s) => (
          <Pressable97
            key={s.id}
            silent
            onPress={() => setDetalle({ type: s.type, text: s.text.slice(0, 140) })}
            className="absolute rounded-full"
            style={{
              left: px(s.lng!),
              top: py(s.lat!),
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: RADAR_TYPE_MAP[s.type]?.color ?? PLATA,
              opacity: 0.85,
              boxShadow: `0 0 6px ${RADAR_TYPE_MAP[s.type]?.color ?? PLATA}`,
            }}
          />
        ))}
        <View className="absolute inset-x-0 items-center" style={{ bottom: 96 }}>
          <Text className="font-mono text-xs text-slate-500">
            {visibles.length} señales · vista web de desarrollo — el mapa real vive en el teléfono
          </Text>
        </View>
      </Animated.View>

      {/* Filtros — chips de vidrio arriba */}
      <View className="absolute inset-x-0" style={{ top: insets.top + 8 }} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Chip label="Todas" color={PLATA} active={filter === null} onPress={() => setFilter(null)} />
          {RADAR_TYPES.map((t) => (
            <Chip
              key={t.key}
              label={t.label}
              color={t.color}
              active={filter === t.key}
              onPress={() => setFilter(filter === t.key ? null : t.key)}
            />
          ))}
        </ScrollView>
      </View>

      {detalle && (
        <Animated.View entering={fadeIn} className="absolute inset-x-4" style={{ bottom: 120 }}>
          <Pressable97 silent onPress={() => setDetalle(null)}>
            <GlassCard className="bg-fondo/90 p-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: RADAR_TYPE_MAP[detalle.type as RadarTypeKey]?.color ?? PLATA,
                  }}
                />
                <Text className="font-sans-medium text-xs uppercase tracking-widest text-slate-400">
                  {RADAR_TYPE_MAP[detalle.type as RadarTypeKey]?.label ?? 'Señal'}
                </Text>
              </View>
              <Text className="mt-2 font-serif-italic text-base leading-6 text-slate-200">
                “{detalle.text}”
              </Text>
            </GlassCard>
          </Pressable97>
        </Animated.View>
      )}
    </View>
  );
}

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={`Filtrar: ${label}`}
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
        active ? 'bg-white/10 border-white/25' : 'bg-fondo/70 border-white/10'
      }`}
    >
      <View className="rounded-full" style={{ width: 7, height: 7, backgroundColor: color }} />
      <Text className={`font-sans-medium text-xs ${active ? 'text-white' : 'text-slate-400'}`}>
        {label}
      </Text>
    </Pressable97>
  );
}
