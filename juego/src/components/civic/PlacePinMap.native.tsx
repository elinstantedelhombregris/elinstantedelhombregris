import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, type MapPressEvent, type MapStyleElement } from 'react-native-maps';

import type { PlacePinMapProps } from './PlacePinMap.types';

const DEFAULT_HEIGHT = 260;
const ARGENTINA_REGION = {
  latitude: -34.6,
  longitude: -64.2,
  latitudeDelta: 24,
  longitudeDelta: 22,
};
const POINT_DELTA = 0.012;

const DARK_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#111117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#77758A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111117' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#393746' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#282733' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A8798' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#090910' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export default function PlacePinMap({ value, onChange, height = DEFAULT_HEIGHT }: PlacePinMapProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    if (!value) return;
    map.current?.animateToRegion({
      latitude: value.lat,
      longitude: value.lng,
      latitudeDelta: POINT_DELTA,
      longitudeDelta: POINT_DELTA,
    }, 320);
  }, [value]);

  const selectPoint = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onChange({ lat: latitude, lng: longitude });
  };

  return (
    <View
      accessible
      accessibilityLabel="Selector de punto en el mapa. Tocá para ubicarlo."
      className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0B0E]"
      style={{ height }}
    >
      <MapView
        ref={map}
        style={{ flex: 1 }}
        customMapStyle={DARK_STYLE}
        initialRegion={value ? {
          latitude: value.lat,
          longitude: value.lng,
          latitudeDelta: POINT_DELTA,
          longitudeDelta: POINT_DELTA,
        } : ARGENTINA_REGION}
        onPress={selectPoint}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {value && (
          <Marker
            coordinate={{ latitude: value.lat, longitude: value.lng }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View className="h-12 w-12 items-center justify-center">
              <View className="absolute h-11 w-11 rounded-full bg-violet-400/15" />
              <Ionicons name="location" size={35} color="#F5F7FA" />
              <View className="absolute top-[13px] h-2.5 w-2.5 rounded-full bg-accent" />
            </View>
          </Marker>
        )}
      </MapView>
      <View style={{ pointerEvents: 'none' }} className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/75 px-3 py-2">
        <Text className="font-sans-medium text-[11px] text-slate-200">
          {value ? 'Punto elegido · tocá para moverlo' : 'Tocá el mapa para ubicarlo'}
        </Text>
      </View>
    </View>
  );
}
