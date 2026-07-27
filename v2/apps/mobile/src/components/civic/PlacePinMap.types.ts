import type { GeoPoint } from '@/civic/types';

export interface PlacePinMapProps {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  height?: number;
}
