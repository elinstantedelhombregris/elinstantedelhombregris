import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';
import MapView, { Marker, Polygon as MapPolygon, type MapStyleElement } from 'react-native-maps';
import Svg, { Polygon, Polyline } from 'react-native-svg';

import { Pressable97 } from '@/components/ui/Pressable97';
import { selectTerritoryPoints } from '@/civic/lasso';

import type { TerritoryMapProps } from './TerritoryMap.types';

interface PixelPoint { x: number; y: number }

const initialRegion = (points: TerritoryMapProps['points'], highlightedPointId?: string | null) => {
  const highlighted = points.find((point) => point.id === highlightedPointId);
  if (highlighted) {
    return {
      latitude: highlighted.lat,
      longitude: highlighted.lng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }
  if (points.length === 0) {
    return { latitude: -34.6, longitude: -64.2, latitudeDelta: 24, longitudeDelta: 22 };
  }
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const latitudeSpan = Math.max(...lats) - Math.min(...lats);
  const longitudeSpan = Math.max(...lngs) - Math.min(...lngs);
  return {
    latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
    longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
    latitudeDelta: Math.max(0.08, latitudeSpan * 1.35),
    longitudeDelta: Math.max(0.08, longitudeSpan * 1.35),
  };
};

const DARK_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#111117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#77758A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111117' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#282733' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#090910' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export default function TerritoryMap({
  points,
  coverageCells = [],
  highlightedPointId,
  selectedPointId,
  onPointPress,
  onSelection,
}: TerritoryMapProps) {
  const map = useRef<MapView>(null);
  const [lasso, setLasso] = useState(false);
  const [path, setPath] = useState<PixelPoint[]>([]);
  const [polygon, setPolygon] = useState<{ latitude: number; longitude: number }[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pixel = (event: GestureResponderEvent): PixelPoint => ({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
  const finish = async () => {
    if (!map.current || path.length < 3) { setPath([]); return; }
    const coordinates = await Promise.all(path.map((point) => map.current!.coordinateForPoint(point)));
    const geo = coordinates.map((point) => ({ lat: point.latitude, lng: point.longitude }));
    const ids = selectTerritoryPoints(points, geo);
    setPolygon(coordinates);
    setSelectedIds(ids);
    setLasso(false);
    setPath([]);
    onSelection({ polygon: geo, selectedIds: ids });
  };
  const clear = () => { setPath([]); setPolygon([]); setSelectedIds([]); setLasso(false); onSelection(null); };
  const selectVisibleArea = async () => {
    const boundaries = await map.current?.getMapBoundaries();
    if (!boundaries) return;
    const coordinates = [
      { latitude: boundaries.northEast.latitude, longitude: boundaries.southWest.longitude },
      boundaries.northEast,
      { latitude: boundaries.southWest.latitude, longitude: boundaries.northEast.longitude },
      boundaries.southWest,
    ];
    const geo = coordinates.map((point) => ({ lat: point.latitude, lng: point.longitude }));
    const ids = selectTerritoryPoints(points, geo);
    setPath([]);
    setPolygon(coordinates);
    setSelectedIds(ids);
    setLasso(false);
    onSelection({ polygon: geo, selectedIds: ids });
  };
  const pathString = path.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View className="flex-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0B0E]">
      <MapView
        ref={map}
        style={{ flex: 1 }}
        customMapStyle={DARK_STYLE}
        initialRegion={initialRegion(points, highlightedPointId)}
      >
        {coverageCells.map((cell) => (
          <MapPolygon
            key={cell.id}
            coordinates={cell.polygon.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
            fillColor="rgba(167,139,250,0.11)"
            strokeColor="rgba(196,181,253,0.7)"
            strokeWidth={1}
          />
        ))}
        {points.map((point) => {
          const highlighted = point.id === highlightedPointId;
          const opened = point.id === selectedPointId;
          const haloSize = highlighted || opened
            ? 38
            : point.precision === 'city'
              ? 32
              : point.precision === 'neighborhood'
                ? 26
                : point.precision === '500m'
                  ? 21
                  : 18;
          return (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              accessibilityLabel={`Abrir ficha segura del punto ${point.category}`}
              accessibilityRole="button"
              onPress={() => onPointPress?.(point.id)}
            >
              <View className="h-11 w-11 items-center justify-center">
                <View className="items-center justify-center rounded-full" style={{
                  width: haloSize,
                  height: haloSize,
                  backgroundColor: highlighted
                    ? 'rgba(52,211,153,0.26)'
                    : opened
                      ? 'rgba(245,247,250,0.22)'
                      : selectedIds.includes(point.id)
                        ? 'rgba(245,247,250,0.16)'
                        : 'rgba(167,139,250,0.12)',
                }}>
                  <View className="rounded-full border-2" style={{
                    width: highlighted || opened ? 20 : 16,
                    height: highlighted || opened ? 20 : 16,
                    borderColor: highlighted || opened ? '#F5F7FA' : '#0A0A0A',
                    backgroundColor: selectedIds.includes(point.id)
                      ? '#F5F7FA'
                      : point.status.startsWith('need:')
                        ? '#FB7185'
                        : point.status.startsWith('resource:')
                          ? '#34D399'
                          : '#A78BFA',
                  }} />
                </View>
              </View>
            </Marker>
          );
        })}
        {polygon.length > 2 && <MapPolygon coordinates={polygon} fillColor="rgba(125,91,222,0.18)" strokeColor="#C4B5FD" strokeWidth={2} />}
      </MapView>
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
          {path.length > 2 && <Polygon points={pathString} fill="rgba(125,91,222,0.18)" stroke="#C4B5FD" strokeWidth={2} />}
          {path.length > 1 && <Polyline points={pathString} fill="none" stroke="#F5F7FA" strokeWidth={2} strokeDasharray="3 5" />}
        </Svg>
      </View>
      <View style={{ pointerEvents: 'box-none' }} className="absolute left-3 right-3 top-3 flex-row items-center justify-between">
        <View className="rounded-full border border-white/10 bg-black/70 px-3 py-2">
          <Text className="font-mono text-[10px] text-slate-300">{selectedIds.length} registros en zona</Text>
        </View>
        <View className="flex-row gap-2">
          {(path.length > 0 || selectedIds.length > 0) && (
            <Pressable97 accessibilityRole="button" accessibilityLabel="Limpiar lazo" onPress={clear} className="rounded-full border border-white/10 bg-black/70 p-3">
              <Ionicons name="refresh" size={16} color="#CBD5E1" />
            </Pressable97>
          )}
          <Pressable97 accessibilityRole="button" accessibilityLabel="Convertir el área visible en territorio" accessibilityHint="Alternativa accesible al dibujo con lazo" onPress={selectVisibleArea} className="flex-row items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-3">
            <Ionicons name="scan-outline" size={16} color="white" />
            <Text className="font-sans-semibold text-xs text-white">Área</Text>
          </Pressable97>
          <Pressable97 accessibilityRole="button" accessibilityLabel="Dibujar territorio con lazo" onPress={() => { setLasso((value) => !value); setPath([]); }} className="flex-row items-center gap-2 rounded-full border px-4 py-3" style={{ backgroundColor: lasso ? '#7D5BDE' : 'rgba(0,0,0,0.72)', borderColor: lasso ? '#A78BFA' : '#FFFFFF22' }}>
            <Ionicons name="brush-outline" size={16} color="white" />
            <Text className="font-sans-semibold text-xs text-white">{lasso ? 'Trazá ahora' : 'Lazo'}</Text>
          </Pressable97>
        </View>
      </View>
    </View>
  );
}
