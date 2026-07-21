import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import type { GeoPoint } from '@/civic/types';

import type { PlacePinMapProps } from './PlacePinMap.types';

const ARGENTINA_CENTER: [number, number] = [-64.2, -34.6];
const DEFAULT_HEIGHT = 260;

const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    dark: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap © CARTO',
    },
  },
  layers: [
    {
      id: 'dark',
      type: 'raster',
      source: 'dark',
      paint: {
        'raster-opacity': 0.78,
        'raster-saturation': -0.55,
        'raster-contrast': 0.08,
      },
    },
  ],
};

const pointData = (point: GeoPoint | null) => ({
  type: 'FeatureCollection' as const,
  features: point
    ? [{
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: [point.lng, point.lat] },
      }]
    : [],
});

export default function PlacePinMap({ value, onChange, height = DEFAULT_HEIGHT }: PlacePinMapProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!container.current || map.current) return;
    let alive = true;

    import('maplibre-gl').then(({ Map }) => {
      if (!alive || !container.current) return;
      const instance = new Map({
        container: container.current,
        style: STYLE,
        center: value ? [value.lng, value.lat] : ARGENTINA_CENTER,
        zoom: value ? 15 : 3.6,
        attributionControl: { compact: true },
        pitchWithRotate: false,
      });
      map.current = instance;
      instance.getCanvas().style.cursor = 'crosshair';
      instance.on('click', (event) => {
        onChangeRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng });
      });
      instance.on('load', () => {
        if (!alive) return;
        instance.addSource('place-pin', { type: 'geojson', data: pointData(value) });
        instance.addLayer({
          id: 'place-pin-halo',
          type: 'circle',
          source: 'place-pin',
          paint: {
            'circle-radius': 20,
            'circle-color': '#A78BFA',
            'circle-opacity': 0.16,
            'circle-blur': 0.45,
          },
        });
        instance.addLayer({
          id: 'place-pin-core',
          type: 'circle',
          source: 'place-pin',
          paint: {
            'circle-radius': 8,
            'circle-color': '#F5F7FA',
            'circle-stroke-color': '#7D5BDE',
            'circle-stroke-width': 4,
          },
        });
        setReady(true);
      });
    }).catch(() => {
      if (alive) setReady(false);
    });

    return () => {
      alive = false;
      map.current?.remove();
      map.current = null;
    };
    // The controlled point is synchronized by the source-only effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('place-pin') as GeoJSONSource | undefined)?.setData(pointData(value));
    if (value) {
      map.current?.easeTo({
        center: [value.lng, value.lat],
        zoom: Math.max(map.current?.getZoom() ?? 15, 15),
        duration: 320,
      });
    }
  }, [ready, value]);

  return (
    <View
      accessible
      accessibilityLabel="Selector de punto en el mapa. Hacé clic para ubicarlo."
      className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0B0E]"
      style={{ height }}
    >
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      <View style={{ pointerEvents: 'none' }} className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/75 px-3 py-2">
        <Text className="font-sans-medium text-[11px] text-slate-200">
          {value ? 'Punto elegido · tocá para moverlo' : 'Tocá el mapa para ubicarlo'}
        </Text>
      </View>
      {!ready && (
        <View style={{ pointerEvents: 'none' }} className="absolute inset-0 items-center justify-center bg-[#0B0B0E]">
          <Text className="font-sans text-xs text-slate-500">Abriendo el territorio…</Text>
        </View>
      )}
    </View>
  );
}
