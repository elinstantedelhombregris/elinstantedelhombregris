import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapLibre,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchMapSignals, type MapSignal } from '@/api/map';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RADAR_TYPES, RADAR_TYPE_MAP, type RadarTypeKey } from '@/lib/radar-types';
import { bloom, fadeIn } from '@/motion/variants';
import { useMapStore } from '@/stores/map';
import { PLATA } from '@/theme/tokens';

/**
 * LA CONSTELACIÓN — el mapa vivo de la Argentina.
 * Las señales brillan cada una en su color; al filtrar, el tipo elegido
 * queda solo en escena. El violeta es para la acción, nunca para los datos.
 */

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
const ARGENTINA_CENTER: [number, number] = [-64.5, -38.5];

function toGeoJSON(signals: MapSignal[], filter: RadarTypeKey | null): GeoJSON.GeoJSON {
  return {
    type: 'FeatureCollection',
    features: signals
      .filter((s) => (filter ? s.type === filter : true))
      .map((s) => ({
        type: 'Feature' as const,
        id: s.id,
        properties: { type: s.type, text: s.text.slice(0, 140) },
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lng!, s.lat!] as [number, number],
        },
      })),
  };
}

export function MapaVivo() {
  const insets = useSafeAreaInsets();
  const camera = useRef<CameraRef>(null);
  const { filter, setFilter, celebration, clearCelebration } = useMapStore();
  const [detalle, setDetalle] = useState<{ type: string; text: string } | null>(null);

  const { data: signals = [], refetch } = useQuery({
    queryKey: ['map-signals'],
    queryFn: fetchMapSignals,
    staleTime: 60_000,
  });

  // Payoff: la señal recién enviada trae al mapa hasta tu barrio.
  useEffect(() => {
    if (!celebration) return;
    refetch();
    camera.current?.flyTo({
      center: [celebration.longitude, celebration.latitude],
      zoom: 12,
      duration: 1600,
    });
    const t = setTimeout(clearCelebration, 4000);
    return () => clearTimeout(t);
  }, [celebration, clearCelebration, refetch]);

  const geojson = useMemo(() => toGeoJSON(signals, filter), [signals, filter]);
  const activeColor = filter ? RADAR_TYPE_MAP[filter].color : PLATA;

  return (
    <View className="flex-1">
      <MapLibre
        style={{ flex: 1 }}
        mapStyle={STYLE_URL}
        attribution={false}
        logo={false}
        compass={false}
      >
        <Camera
          ref={camera}
          initialViewState={{ center: ARGENTINA_CENTER, zoom: 3.2 }}
        />
        <GeoJSONSource
          id="senales"
          data={geojson}
          cluster
          clusterRadius={46}
          onPress={(e) => {
            const f = e.nativeEvent.features[0];
            const props = f?.properties as
              | { type?: string; text?: string; cluster?: boolean }
              | undefined;
            if (props && !props.cluster && props.type && props.text) {
              setDetalle({ type: props.type, text: props.text });
            }
          }}
        >
          {/* Racimos: luz contenida, el número en plata */}
          <Layer
            type="circle"
            id="clusters"
            filter={['has', 'point_count']}
            style={{
              circleColor: activeColor,
              circleOpacity: 0.14,
              circleStrokeColor: activeColor,
              circleStrokeOpacity: 0.5,
              circleStrokeWidth: 1,
              circleRadius: [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 14,
                100, 26,
                1000, 38,
              ],
            }}
          />
          <Layer
            type="symbol"
            id="cluster-count"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: PLATA,
            }}
          />
          {/* Señales sueltas: puntos de luz */}
          <Layer
            type="circle"
            id="senales-puntos"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: filter
                ? activeColor
                : ([
                    'match',
                    ['get', 'type'],
                    ...RADAR_TYPES.flatMap((t) => [t.key, t.color]),
                    PLATA,
                  ] as never),
              circleOpacity: filter ? 0.95 : 0.8,
              circleRadius: 4,
              circleStrokeColor: PLATA,
              circleStrokeOpacity: 0.25,
              circleStrokeWidth: 1,
            }}
          />
        </GeoJSONSource>
      </MapLibre>

      {/* Filtros — chips de vidrio arriba */}
      <View
        className="absolute inset-x-0"
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Chip
            label="Todas"
            color={PLATA}
            active={filter === null}
            onPress={() => setFilter(null)}
          />
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

      {/* Detalle de señal — hoja de vidrio abajo */}
      {detalle && (
        <Animated.View
          entering={fadeIn}
          className="absolute inset-x-4"
          style={{ bottom: 104 }}
        >
          <Pressable97 silent onPress={() => setDetalle(null)}>
            <GlassCard className="bg-fondo/90 p-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor:
                      RADAR_TYPE_MAP[detalle.type as RadarTypeKey]?.color ?? PLATA,
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

      {/* Bloom de celebración sobre el centro del mapa */}
      {celebration && (
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <Animated.View
            entering={bloom}
            className="rounded-full"
            style={{
              width: 28,
              height: 28,
              backgroundColor: `${celebration.color}33`,
              borderWidth: 1.5,
              borderColor: celebration.color,
              opacity: celebration.pending ? 0.5 : 1,
            }}
          />
        </View>
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
      <View
        className="rounded-full"
        style={{ width: 7, height: 7, backgroundColor: color }}
      />
      <Text
        className={`font-sans-medium text-xs ${active ? 'text-white' : 'text-slate-400'}`}
      >
        {label}
      </Text>
    </Pressable97>
  );
}
