// client/src/components/radiografia-map/ConvergenceMap.tsx
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BarChart3, Network } from 'lucide-react';
import { TYPE_COLORS } from '@/hooks/useConvergenceAnalysis';
import { useDeckGLLayers } from '@/hooks/useDeckGLLayers';
import { useToast } from '@/hooks/use-toast';
import MapFiltersBar from './MapFiltersBar';
import LassoOverlay from './LassoOverlay';
import SelectionPanel from './SelectionPanel';
import { hexagonTooltipHtml, pointTooltipHtml, TOOLTIP_STYLE } from './MapTooltip';
import { useProvinceClassifier } from './useProvinceClassifier';
import { useRadiografiaFilters } from './useRadiografiaFilters';
import type { LassoPolygon, MapEntry } from './types';

interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionInterpolator?: unknown;
}

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: -38.416,
  longitude: -63.617,
  zoom: 4,
  pitch: 45,
  bearing: 0,
  transitionDuration: 0,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const POINT_ZOOM_THRESHOLD = 7;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export default function ConvergenceMap() {
  // WebGL2 gate
  const [hasWebGL2] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch { return false; }
  });

  const { allEntries, isLoading } = useDeckGLLayers();
  const { classify } = useProvinceClassifier();

  const enrichedEntries = useMemo(() => classify(allEntries), [classify, allEntries]);
  const api = useRadiografiaFilters(enrichedEntries);
  const {
    filters,
    filteredEntries,
    toggleType,
    setProvince,
    setCity,
    setLasso,
    clear,
    hasActiveFilters,
  } = api;

  const [activeLayer, setActiveLayer] = useState<'hexagon' | 'arc'>('hexagon');
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [lassoMode, setLassoMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const deckRef = useRef<any>(null);
  const { toast } = useToast();

  const getDeckViewport = useCallback(
    () => deckRef.current?.deck?.getViewports?.()?.[0] ?? null,
    [],
  );

  const handleViewStateChange = useCallback((e: { viewState: MapViewState }) => {
    setViewState(e.viewState);
  }, []);

  const handleMapLoad = useCallback(() => setMapReady(true), []);

  const clearLasso = useCallback(() => setLasso(null), [setLasso]);

  // Fly-to province / city
  const flyTo = useCallback((lat?: number, lng?: number, zoom = 7) => {
    if (lat == null || lng == null) return;
    setViewState((vs) => ({
      ...vs,
      latitude: lat,
      longitude: lng,
      zoom,
      transitionDuration: 1200,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  }, []);

  const handleSetProvince = useCallback(
    (name: string | null, lat?: number, lng?: number) => {
      setProvince(name);
      if (name && lat != null && lng != null) flyTo(lat, lng, 6);
    },
    [setProvince, flyTo],
  );

  const handleSetCity = useCallback(
    (name: string | null, lat?: number, lng?: number) => {
      setCity(name);
      if (name && lat != null && lng != null) flyTo(lat, lng, 9);
    },
    [setCity, flyTo],
  );

  // Lasso lifecycle
  const startLasso = useCallback(() => setLassoMode(true), []);
  const cancelLasso = useCallback(() => setLassoMode(false), []);
  const completeLasso = useCallback(
    (poly: LassoPolygon | null) => {
      setLassoMode(false);
      if (!poly) return;
      try {
        setLasso(poly);
      } catch {
        toast({
          title: 'No pudimos procesar el área',
          description: 'Intentá dibujar el lazo de nuevo.',
          variant: 'destructive',
        });
      }
    },
    [setLasso, toast],
  );

  // Derived: count inside current lasso (for chip label)
  const lassoCount = filters.lasso ? filteredEntries.length : 0;

  // Filtered hex data
  const filteredHex = useMemo(
    () => filteredEntries.map((e) => ({ position: [e.lng, e.lat] as [number, number], weight: 1, source: e })),
    [filteredEntries],
  );

  // Build layers
  const layers = useMemo(() => {
    const built: any[] = [];

    if (activeLayer === 'hexagon') {
      built.push(
        new HexagonLayer({
          id: 'hexagon-layer',
          data: filteredHex,
          getPosition: (d: any) => d.position,
          getElevationWeight: (d: any) => d.weight,
          elevationScale: 200,
          extruded: true,
          radius: 15000,
          coverage: 0.85,
          upperPercentile: 100,
          pickable: true,
          colorRange: [
            [30, 30, 80],
            [60, 40, 140],
            [100, 60, 180],
            [140, 80, 200],
            [180, 100, 220],
            [220, 130, 240],
          ],
          material: {
            ambient: 0.6,
            diffuse: 0.6,
            shininess: 40,
            specularColor: [125, 91, 222],
          },
        }),
      );
      // Individual dots at high zoom
      if ((viewState.zoom ?? 4) >= POINT_ZOOM_THRESHOLD) {
        built.push(
          new ScatterplotLayer({
            id: 'points-layer',
            data: filteredEntries,
            getPosition: (e: MapEntry) => [e.lng, e.lat],
            getFillColor: (e: MapEntry) => [...hexToRgb(TYPE_COLORS[e.type]), 220] as [number, number, number, number],
            getRadius: 400,
            radiusMinPixels: 3,
            radiusMaxPixels: 8,
            stroked: true,
            getLineColor: [0, 0, 0, 200],
            lineWidthMinPixels: 1,
            pickable: true,
            updateTriggers: {
              getFillColor: filters.types,
            },
          }),
        );
      }
    } else {
      // Arc layer — rebuild from filtered entries (location-bucketed)
      type ArcBucket = { lng: number; lat: number; count: number; location: string };
      const buckets: Record<string, ArcBucket> = {};
      for (const e of filteredEntries) {
        const key = e.location || `${e.lat.toFixed(2)},${e.lng.toFixed(2)}`;
        if (!buckets[key]) buckets[key] = { lng: e.lng, lat: e.lat, count: 0, location: key };
        buckets[key].count++;
      }
      const locs = Object.values(buckets).filter((b) => b.count >= 3).slice(0, 12);
      const arcs: any[] = [];
      for (let i = 0; i < locs.length; i++) {
        for (let j = i + 1; j < locs.length; j++) {
          arcs.push({
            source: [locs[i].lng, locs[i].lat],
            target: [locs[j].lng, locs[j].lat],
            sourceLabel: locs[i].location,
            targetLabel: locs[j].location,
          });
        }
      }
      built.push(
        new ArcLayer({
          id: 'arc-layer',
          data: arcs,
          getSourcePosition: (d: any) => d.source,
          getTargetPosition: (d: any) => d.target,
          getSourceColor: [125, 91, 222, 180],
          getTargetColor: [59, 130, 246, 180],
          getWidth: 2,
          greatCircle: true,
        }),
      );
    }

    return built;
  }, [activeLayer, filteredHex, filteredEntries, viewState.zoom, filters.types]);

  const getTooltip = useCallback((info: any) => {
    if (!info?.object) return null;
    if (info.layer?.id === 'hexagon-layer') {
      const points = info.object.points || [];
      return { html: hexagonTooltipHtml(points), style: TOOLTIP_STYLE };
    }
    if (info.layer?.id === 'points-layer') {
      return { html: pointTooltipHtml(info.object as MapEntry), style: TOOLTIP_STYLE };
    }
    return null;
  }, []);

  const flyToEntry = useCallback((e: MapEntry) => flyTo(e.lat, e.lng, 11), [flyTo]);

  if (!hasWebGL2) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            Tu navegador no soporta WebGL2. Visitá{' '}
            <a href="/el-mapa" className="text-blue-400 underline">El Mapa</a>{' '}
            para ver las señales en el mapa interactivo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Visualización GPU</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">El Territorio en 3D</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada hexágono representa la densidad de voces en una zona. Zoom in y aparecen los puntos individuales.
            Filtrá por tipo, provincia, ciudad — o dibujá un lazo para explorar una zona específica.
          </p>
        </div>

        <MapFiltersBar
          filters={filters}
          lassoActive={lassoMode}
          lassoDisabled={!mapReady}
          lassoEntriesCount={lassoCount}
          onToggleType={toggleType}
          onSetProvince={handleSetProvince}
          onSetCity={handleSetCity}
          onStartLasso={startLasso}
          onClearLasso={clearLasso}
          onClearAll={clear}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Layer toggle */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { id: 'hexagon' as const, label: 'Hexágonos 3D', icon: BarChart3 },
            { id: 'arc' as const, label: 'Arcos Territoriales', icon: Network },
          ].map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayer(layer.id)}
              aria-pressed={activeLayer === layer.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 ${
                activeLayer === layer.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]'
              }`}
            >
              <layer.icon className="w-4 h-4" />
              {layer.label}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div
          className="rounded-2xl overflow-hidden border border-white/10 relative"
          style={{ height: 'clamp(400px, 60vh, 700px)' }}
          role="application"
          aria-label="Mapa de convergencia territorial en 3D"
        >
          <DeckGL
            ref={deckRef}
            viewState={viewState as unknown as Record<string, unknown>}
            onViewStateChange={handleViewStateChange as unknown as (e: unknown) => void}
            controller={!lassoMode}
            layers={layers}
            getTooltip={lassoMode ? undefined : getTooltip}
            onLoad={handleMapLoad}
          >
            <Map mapStyle={MAP_STYLE} />
          </DeckGL>

          {/* Persistent lasso polygon overlay when a lasso is committed */}
          {filters.lasso && !lassoMode && (
            <CommittedLassoOverlay polygon={filters.lasso} getViewport={getDeckViewport} />
          )}

          {lassoMode && (
            <LassoOverlay
              getViewport={getDeckViewport}
              onComplete={completeLasso}
              onCancel={cancelLasso}
            />
          )}
        </div>

        {isLoading && (
          <div className="text-center text-slate-500 text-xs mt-3">Cargando señales…</div>
        )}
      </div>

      <SelectionPanel
        entries={filteredEntries}
        visible={filters.lasso != null}
        onClose={clearLasso}
        onRowClick={flyToEntry}
      />
    </section>
  );
}

/** Renders the committed lasso polygon as an SVG overlay. Memoized so pan/zoom ticks don't reproject the path unless the polygon itself changes. */
const CommittedLassoOverlay = memo(function CommittedLassoOverlay({
  polygon,
  getViewport,
}: {
  polygon: LassoPolygon;
  getViewport: () => any;
}) {
  const vp = getViewport();
  if (!vp) return null;
  const projected: string[] = [];
  for (const [lng, lat] of polygon.coordinates) {
    try {
      const px = vp.project([lng, lat]);
      projected.push(`${px[0]},${px[1]}`);
    } catch {
      // skip
    }
  }
  if (projected.length < 3) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      <polygon
        points={projected.join(' ')}
        fill="rgba(125, 91, 222, 0.12)"
        stroke="#7D5BDE"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    </svg>
  );
});
