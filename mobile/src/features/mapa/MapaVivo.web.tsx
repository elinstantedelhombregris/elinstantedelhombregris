import { useQuery } from '@tanstack/react-query';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchMapSignals, type MapSignal } from '@/api/map';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RADAR_TYPES, RADAR_TYPE_MAP, type RadarTypeKey } from '@/lib/radar-types';
import { fadeIn } from '@/motion/variants';
import { useMapStore } from '@/stores/map';
import { PLATA } from '@/theme/tokens';

/**
 * LA CONSTELACIÓN — versión web (preview de desarrollo).
 * Mismo motor y mismo estilo oscuro que el teléfono, vía maplibre-gl JS.
 */

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
const ARGENTINA_CENTER: [number, number] = [-64.5, -38.5];

// Metro rompe el worker embebido de maplibre-gl (los tiles nunca se piden):
// usamos el worker CSP servido desde public/ (mismo origen).
maplibregl.setWorkerUrl('/maplibre-gl-csp-worker.js');

function toGeoJSON(
  signals: MapSignal[],
  filter: RadarTypeKey | null,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: signals
      .filter((s) => (filter ? s.type === filter : true))
      .map((s) => ({
        type: 'Feature' as const,
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { filter, setFilter, celebration, clearCelebration } = useMapStore();
  const [detalle, setDetalle] = useState<{ type: string; text: string } | null>(null);

  const { data: signals = [], refetch } = useQuery({
    queryKey: ['map-signals'],
    queryFn: fetchMapSignals,
    staleTime: 60_000,
  });

  const geojson = useMemo(() => toGeoJSON(signals, filter), [signals, filter]);
  const activeColor = filter ? RADAR_TYPE_MAP[filter].color : PLATA;

  // Montaje del mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: ARGENTINA_CENTER,
      zoom: 3.2,
      attributionControl: false,
    });
    mapRef.current = map;
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__basta_map = map;
    }

    map.on('load', () => {
      map.addSource('senales', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterRadius: 46,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'senales',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': PLATA,
          'circle-opacity': 0.14,
          'circle-stroke-color': PLATA,
          'circle-stroke-opacity': 0.5,
          'circle-stroke-width': 1,
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'point_count'],
            2, 14, 100, 26, 1000, 38,
          ],
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'senales',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 12,
          'text-font': ['Noto Sans Regular'],
        },
        paint: { 'text-color': PLATA },
      });
      map.addLayer({
        id: 'senales-puntos',
        type: 'circle',
        source: 'senales',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'type'],
            ...RADAR_TYPES.flatMap((t) => [t.key, t.color] as [string, string]).flat(),
            PLATA,
          ] as never,
          'circle-opacity': 0.85,
          'circle-radius': 4.5,
          'circle-stroke-color': PLATA,
          'circle-stroke-opacity': 0.25,
          'circle-stroke-width': 1,
        },
      });
      map.on('click', 'senales-puntos', (e) => {
        const f = e.features?.[0];
        if (f?.properties?.type && f.properties.text) {
          setDetalle({ type: f.properties.type as string, text: f.properties.text as string });
        }
      });
      map.on('mouseenter', 'senales-puntos', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'senales-puntos', () => {
        map.getCanvas().style.cursor = '';
      });
      map.resize();
      setMapReady(true);
    });

    // El contenedor puede medir 0 en el primer frame (layout de RN Web):
    // sin resize, MapLibre nunca pide tiles y queda negro.
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Datos y filtros
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const source = map?.getSource('senales') as maplibregl.GeoJSONSource | undefined;
    source?.setData(geojson);
    if (map) {
      map.setPaintProperty(
        'senales-puntos',
        'circle-color',
        filter
          ? activeColor
          : ([
              'match', ['get', 'type'],
              ...RADAR_TYPES.flatMap((t) => [t.key, t.color] as [string, string]).flat(),
              PLATA,
            ] as never),
      );
      map.setPaintProperty('clusters', 'circle-color', activeColor);
      map.setPaintProperty('clusters', 'circle-stroke-color', activeColor);
    }
  }, [geojson, filter, activeColor, mapReady]);

  // Payoff: la señal recién enviada trae al mapa hasta tu barrio.
  useEffect(() => {
    if (!celebration) return;
    refetch();
    mapRef.current?.flyTo({
      center: [celebration.longitude, celebration.latitude],
      zoom: 12,
      duration: 1600,
    });
    const t = setTimeout(clearCelebration, 4000);
    return () => clearTimeout(t);
  }, [celebration, clearCelebration, refetch]);

  return (
    <View className="flex-1 bg-fondo">
      {/* Contenedor DOM del mapa (react-native-web) */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

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
          style={{ bottom: 120 }}
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
