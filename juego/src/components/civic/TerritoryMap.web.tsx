import { Ionicons } from '@expo/vector-icons';
import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Polygon, Polyline } from 'react-native-svg';

import { Pressable97 } from '@/components/ui/Pressable97';
import { VIOLETA, VIOLETA_CLARO } from '@/theme/tokens';
import { selectTerritoryPoints } from '@/civic/lasso';
import type { GeoPoint } from '@/civic/types';

import type { TerritoryMapProps } from './TerritoryMap.types';

interface PixelPoint { x: number; y: number }
const ARGENTINA_CENTER: [number, number] = [-64.2, -34.6];

const initialView = (
  points: TerritoryMapProps['points'],
  highlightedPointId?: string | null,
): { center: [number, number]; zoom: number } => {
  const highlighted = points.find((point) => point.id === highlightedPointId);
  if (highlighted) return { center: [highlighted.lng, highlighted.lat], zoom: 14 };
  if (points.length === 0) return { center: ARGENTINA_CENTER, zoom: 3.6 };
  return {
    center: [
      points.reduce((sum, point) => sum + point.lng, 0) / points.length,
      points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    ],
    zoom: points.length === 1 ? 13 : 5,
  };
};

const fitAllPoints = (instance: MapLibreMap, points: TerritoryMapProps['points']): void => {
  if (points.length < 2) return;
  const lngs = points.map((point) => point.lng);
  const lats = points.map((point) => point.lat);
  instance.fitBounds([
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ], { padding: 56, maxZoom: 12, duration: 0 });
};

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
  layers: [{ id: 'dark', type: 'raster', source: 'dark', paint: { 'raster-opacity': 0.76, 'raster-saturation': -0.5 } }],
};

const pointsGeoJson = (
  points: TerritoryMapProps['points'],
  selected: Set<string>,
  highlightedPointId?: string | null,
  selectedPointId?: string | null,
) => ({
  type: 'FeatureCollection' as const,
  features: points.map((point) => ({
    type: 'Feature' as const,
    id: point.id,
    properties: {
      id: point.id,
      status: point.status,
      kind: point.status.startsWith('need:') ? 'need' : point.status.startsWith('resource:') ? 'resource' : 'observation',
      precision: point.precision ?? '100m',
      selected: selected.has(point.id) ? 1 : 0,
      highlighted: point.id === highlightedPointId ? 1 : 0,
      opened: point.id === selectedPointId ? 1 : 0,
    },
    geometry: { type: 'Point' as const, coordinates: [point.lng, point.lat] },
  })),
});

const coverageGeoJson = (cells: NonNullable<TerritoryMapProps['coverageCells']>) => ({
  type: 'FeatureCollection' as const,
  features: cells.map((cell) => ({
    type: 'Feature' as const,
    id: cell.id,
    properties: { id: cell.id },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[...cell.polygon, cell.polygon[0]!].map((point) => [point.lng, point.lat])],
    },
  })),
});

export default function TerritoryMap({
  points,
  coverageCells = [],
  highlightedPointId,
  selectedPointId,
  onPointPress,
  onSelection,
}: TerritoryMapProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const onPointPressRef = useRef(onPointPress);
  const [ready, setReady] = useState(false);
  const [lasso, setLasso] = useState(false);
  const [path, setPath] = useState<PixelPoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    onPointPressRef.current = onPointPress;
  }, [onPointPress]);

  useEffect(() => {
    if (!container.current || map.current) return;
    let alive = true;
    import('maplibre-gl').then(({ Map }) => {
      if (!alive || !container.current) return;
      const view = initialView(points, highlightedPointId);
      const instance = new Map({
        container: container.current,
        style: STYLE,
        center: view.center,
        zoom: view.zoom,
        attributionControl: { compact: true },
        pitchWithRotate: false,
      });
      map.current = instance;
      // Los límites y `unproject` están disponibles desde que la instancia
      // existe. No bloqueamos el lazo ni la alternativa accesible "Área" por
      // la descarga de teselas: una red lenta no debe impedir fundar misión.
      setReady(true);
      instance.on('load', () => {
        if (!alive) return;
        instance.addSource('coverage', { type: 'geojson', data: coverageGeoJson([]) });
        instance.addLayer({
          id: 'coverage-fill', type: 'fill', source: 'coverage',
          paint: { 'fill-color': VIOLETA_CLARO, 'fill-opacity': 0.11 },
        });
        instance.addLayer({
          id: 'coverage-line', type: 'line', source: 'coverage',
          paint: { 'line-color': '#C4B5FD', 'line-opacity': 0.72, 'line-width': 1.2 },
        });
        instance.addSource('signals', { type: 'geojson', data: pointsGeoJson(points, new Set(), highlightedPointId, selectedPointId) });
        instance.addLayer({
          id: 'signal-halo', type: 'circle', source: 'signals',
          paint: {
            'circle-radius': ['case',
              ['==', ['get', 'precision'], 'city'], 28,
              ['==', ['get', 'precision'], 'neighborhood'], 22,
              ['==', ['get', 'precision'], '500m'], 17,
              13,
            ],
            'circle-color': ['case',
              ['==', ['get', 'kind'], 'need'], '#FB7185',
              ['==', ['get', 'kind'], 'resource'], '#34D399',
              VIOLETA_CLARO,
            ],
            'circle-opacity': ['case',
              ['==', ['get', 'highlighted'], 1], 0.32,
              ['==', ['get', 'opened'], 1], 0.28,
              0.12,
            ],
            'circle-blur': 0.4,
          },
        });
        instance.addLayer({
          id: 'signals', type: 'circle', source: 'signals',
          paint: {
            'circle-radius': ['case',
              ['==', ['get', 'highlighted'], 1], 9,
              ['==', ['get', 'opened'], 1], 9,
              ['==', ['get', 'selected'], 1], 7,
              5,
            ],
            'circle-color': ['case',
              ['==', ['get', 'selected'], 1], '#F5F7FA',
              ['==', ['get', 'kind'], 'need'], '#FB7185',
              ['==', ['get', 'kind'], 'resource'], '#34D399',
              VIOLETA_CLARO,
            ],
            'circle-stroke-color': ['case',
              ['any', ['==', ['get', 'highlighted'], 1], ['==', ['get', 'opened'], 1]],
              '#F5F7FA',
              '#0A0A0A',
            ],
            'circle-stroke-width': ['case',
              ['any', ['==', ['get', 'highlighted'], 1], ['==', ['get', 'opened'], 1]],
              3,
              2,
            ],
          },
        });
        instance.addLayer({
          id: 'signal-hit-target', type: 'circle', source: 'signals',
          paint: {
            'circle-radius': 20,
            'circle-color': '#000000',
            'circle-opacity': 0.001,
          },
        });
        instance.on('click', 'signal-hit-target', (event) => {
          const pointId = event.features?.[0]?.properties?.id;
          if (typeof pointId === 'string') onPointPressRef.current?.(pointId);
        });
        instance.on('mouseenter', 'signal-hit-target', () => {
          instance.getCanvas().style.cursor = 'pointer';
        });
        instance.on('mouseleave', 'signal-hit-target', () => {
          instance.getCanvas().style.cursor = '';
        });
        if (!highlightedPointId) fitAllPoints(instance, points);
        setReady(true);
      });
    });
    return () => {
      alive = false;
      map.current?.remove();
      map.current = null;
    };
    // Initial points are updated by the source-only effect below; remounting
    // MapLibre for every observation would destroy the current lasso gesture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('signals') as GeoJSONSource | undefined)?.setData(pointsGeoJson(points, selected, highlightedPointId, selectedPointId));
  }, [highlightedPointId, points, ready, selected, selectedPointId]);

  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('coverage') as GeoJSONSource | undefined)?.setData(coverageGeoJson(coverageCells));
  }, [coverageCells, ready]);

  const pixel = (event: GestureResponderEvent): PixelPoint => ({
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY,
  });
  const finish = () => {
    if (!map.current || path.length < 3) {
      setPath([]);
      return;
    }
    const polygon: GeoPoint[] = path.map((point) => {
      const coordinate = map.current!.unproject([point.x, point.y]);
      return { lat: coordinate.lat, lng: coordinate.lng };
    });
    const ids = selectTerritoryPoints(points, polygon);
    setSelectedIds(ids);
    setLasso(false);
    setPath([]);
    onSelection({ polygon, selectedIds: ids });
  };
  const clear = () => {
    setPath([]);
    setSelectedIds([]);
    setLasso(false);
    onSelection(null);
  };
  const selectVisibleArea = () => {
    const bounds = map.current?.getBounds();
    if (!bounds) return;
    const polygon: GeoPoint[] = [
      { lat: bounds.getNorth(), lng: bounds.getWest() },
      { lat: bounds.getNorth(), lng: bounds.getEast() },
      { lat: bounds.getSouth(), lng: bounds.getEast() },
      { lat: bounds.getSouth(), lng: bounds.getWest() },
    ];
    const ids = selectTerritoryPoints(points, polygon);
    setPath([]);
    setSelectedIds(ids);
    setLasso(false);
    onSelection({ polygon, selectedIds: ids });
  };
  const pathString = path.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View className="flex-1 overflow-hidden border border-tinta bg-fondo">
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      <View
        style={{ pointerEvents: lasso ? 'auto' : 'none' }}
        className="absolute inset-0"
        onStartShouldSetResponder={() => lasso}
        onMoveShouldSetResponder={() => lasso}
        onResponderGrant={(event) => setPath([pixel(event)])}
        onResponderMove={(event) => setPath((items) => [...items, pixel(event)])}
        onResponderRelease={finish}
        onResponderTerminate={finish}
      >
        <Svg width="100%" height="100%">
          {path.length > 2 && <Polygon points={pathString} fill="rgba(125,91,222,0.18)" stroke="rgba(196,181,253,0.9)" strokeWidth={2} />}
          {path.length > 1 && <Polyline points={pathString} fill="none" stroke="#F5F7FA" strokeWidth={2} strokeDasharray="3 5" />}
        </Svg>
      </View>

      <View style={{ pointerEvents: 'box-none' }} className="absolute left-3 right-3 top-3 flex-row items-center justify-between">
        <View className="border border-tinta bg-black/70 px-3 py-2">
          <Text className="font-space text-[10px] text-oscuro-secundario">{selectedIds.length} registros en zona</Text>
        </View>
        <View className="flex-row gap-2">
          {(path.length > 0 || selectedIds.length > 0) && (
            <Pressable97 accessibilityRole="button" accessibilityLabel="Limpiar lazo" onPress={clear} className="border border-tinta bg-black/70 p-3">
              <Ionicons name="refresh" size={16} color="#CBD5E1" />
            </Pressable97>
          )}
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Convertir el área visible en territorio"
            accessibilityHint="Alternativa accesible al dibujo con lazo"
            onPress={selectVisibleArea}
            disabled={!ready}
            className="flex-row items-center gap-2 border border-tinta bg-black/70 px-3 py-3"
          >
            <Ionicons name="scan-outline" size={16} color="white" />
            <Text className="font-archivo-bold text-xs text-white">Área</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel={lasso ? 'Cancelar lazo' : 'Dibujar territorio con lazo'}
            onPress={() => { setLasso((value) => !value); setPath([]); }}
            className="flex-row items-center gap-2 border px-4 py-3"
            style={{ backgroundColor: lasso ? VIOLETA : 'rgba(0,0,0,0.72)', borderColor: lasso ? VIOLETA_CLARO : '#FFFFFF22' }}
          >
            <Ionicons name="brush-outline" size={16} color="white" />
            <Text className="font-archivo-bold text-xs text-white">{lasso ? 'Trazá ahora' : 'Lazo'}</Text>
          </Pressable97>
        </View>
      </View>

      {lasso && (
        <View style={{ pointerEvents: 'none' }} className="absolute bottom-4 left-4 right-4 items-center">
          <View className="bg-black/75 px-4 py-2.5">
            <Text className="font-archivo-bold text-xs text-oscuro-texto">Rodeá la zona con el dedo o el mouse</Text>
          </View>
        </View>
      )}
    </View>
  );
}
