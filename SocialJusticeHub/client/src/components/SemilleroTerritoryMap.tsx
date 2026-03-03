import { useEffect, useMemo, useRef } from 'react';
import { Activity, MapPin } from 'lucide-react';
import { useLoader } from '@/hooks/use-loader';

declare global {
  interface Window {
    L: any;
  }
}

type CommitmentType = 'initial' | 'intermediate' | 'public';

export type SemilleroMapCommitment = {
  id: number;
  commitmentText: string;
  commitmentType: CommitmentType;
  province?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string | null;
  user: {
    id: number;
    name: string;
    username: string;
  };
};

type SemilleroTerritoryMapProps = {
  commitments: SemilleroMapCommitment[];
  totalCommitments: number;
  commitmentGoal: number;
  commitmentTypeTotals: Record<string, number>;
};

type TerritoryPoint = {
  lat: number;
  lng: number;
};

const ARGENTINA_CENTER: [number, number] = [-38.416097, -63.616672];

const TERRITORY_POINTS: TerritoryPoint[] = [
  { lat: -22.9, lng: -65.3 }, { lat: -24.2, lng: -65.0 }, { lat: -24.8, lng: -65.4 },
  { lat: -26.0, lng: -65.2 }, { lat: -27.0, lng: -65.4 }, { lat: -27.8, lng: -64.3 },
  { lat: -28.5, lng: -65.8 }, { lat: -29.4, lng: -66.8 }, { lat: -29.2, lng: -59.3 },
  { lat: -30.6, lng: -59.0 }, { lat: -31.4, lng: -64.2 }, { lat: -31.8, lng: -60.7 },
  { lat: -32.9, lng: -60.7 }, { lat: -33.3, lng: -66.3 }, { lat: -33.8, lng: -68.8 },
  { lat: -34.6, lng: -58.4 }, { lat: -34.9, lng: -57.9 }, { lat: -35.5, lng: -69.0 },
  { lat: -36.6, lng: -64.3 }, { lat: -37.3, lng: -59.1 }, { lat: -38.0, lng: -57.6 },
  { lat: -38.95, lng: -68.1 }, { lat: -40.8, lng: -63.0 }, { lat: -41.1, lng: -71.3 },
  { lat: -42.7, lng: -65.0 }, { lat: -43.3, lng: -65.1 }, { lat: -45.9, lng: -67.5 },
  { lat: -47.8, lng: -67.7 }, { lat: -49.3, lng: -67.7 }, { lat: -51.6, lng: -69.2 },
  { lat: -54.8, lng: -68.3 }
];

const MARKER_STYLE: Record<CommitmentType, { color: string; glow: string; label: string }> = {
  initial: { color: '#f59e0b', glow: 'rgba(245,158,11,0.30)', label: 'Despertar' },
  intermediate: { color: '#34d399', glow: 'rgba(52,211,153,0.34)', label: 'Crecimiento' },
  public: { color: '#60a5fa', glow: 'rgba(96,165,250,0.34)', label: 'Acción pública' }
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const hashNumber = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const aliasForUser = (name?: string, username?: string) => {
  if (name?.trim()) {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0];
    return `${words[0]} ${words[1].charAt(0).toUpperCase()}.`;
  }
  if (username?.trim()) return `@${username}`;
  return 'Sembrador/a';
};

const snippetForCommitment = (text?: string) => {
  if (!text) return 'Semilla en crecimiento';
  const firstLine = text.split('\n').find((line) => line.trim().length > 0) ?? text;
  const cleaned = firstLine.replace(/^Compromiso(?:\s+personal)?\s*:\s*/i, '').trim();
  return cleaned.length > 96 ? `${cleaned.slice(0, 93)}...` : cleaned;
};

const formatDate = (date?: string | null) => {
  if (!date) return 'Sin fecha';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const SemilleroTerritoryMap = ({
  commitments,
  totalCommitments,
  commitmentGoal,
  commitmentTypeTotals
}: SemilleroTerritoryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const leafletLoaded = useLoader('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'L');

  const territoryActivationPercent = commitmentGoal > 0
    ? Math.max(0, Math.min(100, (totalCommitments / commitmentGoal) * 100))
    : 0;

  const seededMarkers = useMemo(() => {
    return commitments.map((commitment, index) => {
      const hasRealCoordinates =
        commitment.latitude !== null &&
        commitment.latitude !== undefined &&
        commitment.longitude !== null &&
        commitment.longitude !== undefined &&
        Number.isFinite(commitment.latitude) &&
        Number.isFinite(commitment.longitude);

      if (hasRealCoordinates) {
        return {
          ...commitment,
          lat: clamp(Number(commitment.latitude), -55, -21.5),
          lng: clamp(Number(commitment.longitude), -73.7, -53.2),
          isRealLocation: true
        };
      }

      const point = TERRITORY_POINTS[(commitment.id + index * 7) % TERRITORY_POINTS.length];
      const jitterSeed = hashNumber(`${commitment.id}-${commitment.commitmentText}-${index}`);
      const latJitter = ((jitterSeed % 100) - 50) * 0.006;
      const lngJitter = (((jitterSeed >> 8) % 100) - 50) * 0.008;

      return {
        ...commitment,
        lat: clamp(point.lat + latJitter, -55, -21.5),
        lng: clamp(point.lng + lngJitter, -73.7, -53.2),
        isRealLocation: false
      };
    });
  }, [commitments]);

  useEffect(() => {
    const existingCss = document.querySelector('link[href*="leaflet.css"]');
    if (existingCss) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView(ARGENTINA_CENTER, 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 500);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers();
        markerLayerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;
    if (!L || !map || !markerLayer) return;

    markerLayer.clearLayers();
    if (!seededMarkers.length) return;

    seededMarkers.forEach((marker) => {
      const style = MARKER_STYLE[marker.commitmentType] ?? MARKER_STYLE.intermediate;
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="position:relative;width:20px;height:20px;">
            <span style="position:absolute;inset:0;border-radius:9999px;background:${style.glow};filter:blur(5px);"></span>
            <span style="position:absolute;left:4px;top:4px;width:12px;height:12px;border-radius:9999px;background:${style.color};border:2px solid rgba(255,255,255,0.35);"></span>
          </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const alias = escapeHtml(aliasForUser(marker.user?.name, marker.user?.username));
      const snippet = escapeHtml(snippetForCommitment(marker.commitmentText));
      const date = escapeHtml(formatDate(marker.createdAt));
      const typeLabel = style.label;
      const areaLabel = marker.city || marker.province
        ? `${marker.city ? escapeHtml(marker.city) : ''}${marker.city && marker.province ? ', ' : ''}${marker.province ? escapeHtml(marker.province) : ''}`
        : marker.isRealLocation
          ? 'Ubicación compartida'
          : 'Ubicación simbólica';

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 190px; max-width: 220px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <strong style="font-size:12px;color:#111827;">${alias}</strong>
            <span style="font-size:10px;color:#4b5563;">${date}</span>
          </div>
          <div style="font-size:10px;color:#374151;margin-bottom:6px;">${areaLabel}</div>
          <div style="font-size:11px;color:#1f2937;line-height:1.35;margin-bottom:6px;">${snippet}</div>
          <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:${style.glow};color:#111827;border:1px solid rgba(0,0,0,0.15);">${typeLabel}</span>
        </div>
      `;

      L.marker([marker.lat, marker.lng], { icon }).bindPopup(popupHtml).addTo(markerLayer);
    });
  }, [seededMarkers]);

  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-3xl border border-emerald-500/25 bg-[#07120c]/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-200/80">
        <MapPin className="w-4 h-4 text-emerald-300" />
        <p className="text-xs uppercase tracking-widest">Territorio de siembra</p>
      </div>

      <div className="relative h-[360px] rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#050d08]">
        <div ref={mapRef} className="absolute inset-0" />

        {!leafletLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#040a06]/90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-400 mx-auto mb-3" />
              <p className="text-xs text-emerald-100/70">Cargando mapa territorial...</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 z-[400] rounded-xl border border-emerald-500/25 bg-[#020603]/80 backdrop-blur px-3 py-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-200/80">Siembra en vivo</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white leading-none mt-1">{totalCommitments.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-200/60">compromisos plantados</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-white font-mono">
          {totalCommitments.toLocaleString()} / {commitmentGoal.toLocaleString()}
        </p>
        <p className="text-emerald-100/60 mt-1">
          {Math.round(territoryActivationPercent)}% del territorio simbólico activado
        </p>
        <div className="mt-3 flex justify-center gap-4 text-[11px] text-emerald-200/65 uppercase tracking-wider">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Despertar {(commitmentTypeTotals.initial ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Crecimiento {(commitmentTypeTotals.intermediate ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Pública {(commitmentTypeTotals.public ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SemilleroTerritoryMap;
