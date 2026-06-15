import { useEffect, useState, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLoader } from '@/hooks/use-loader';
import { useMapClustering } from '@/hooks/useMapClustering';
import { useMapSignals, MAP_SIGNALS_QUERY_KEY } from '@/hooks/useMapSignals';
import type { MapSignal } from '@shared/map-signals';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SovereignInput from './SovereignInput';
import EnhancedPopup from './EnhancedPopup';
import {
  Maximize2,
  Minimize2,
  Locate,
  Plus,
  Minus,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SIGNAL_TYPES,
  SIGNAL_TYPE_MAP,
  signalLabel,
  signalColor,
  hexToRgb,
  type SignalTypeKey,
} from '@/lib/signal-types';

declare global {
  interface Window {
    L: any;
  }
}

const RECENT_MS = 60 * 60 * 1000; // 1h = "señal viva"

const timeAgo = (date: string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (Number.isNaN(s)) return '';
  if (s < 60) return 'recién';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days} d`;
  return `hace ${Math.floor(days / 7)} sem`;
};

const isRecentSignal = (date: string | null): boolean => {
  if (!date) return false;
  const t = new Date(date).getTime();
  return !Number.isNaN(t) && Date.now() - t < RECENT_MS;
};

type LayerKey = 'all' | SignalTypeKey;

const SovereignMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const plainMarkersLayerRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeLayer, setActiveLayer] = useState<LayerKey>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(false);

  const leafletLoaded = useLoader('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'L');

  // Leaflet CSS (persiste entre montajes)
  useEffect(() => {
    if (document.querySelector('link[href*="leaflet.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  const { signals, isLoading } = useMapSignals();

  // Conteos por tipo (sobre todas las señales declaradas)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of signals) c[s.type] = (c[s.type] ?? 0) + 1;
    return c;
  }, [signals]);

  // Sólo las que tienen coordenadas van como puntos al mapa
  const mappedSignals = useMemo(
    () =>
      signals.filter(
        (s) => s.lat != null && s.lng != null && (activeLayer === 'all' || s.type === activeLayer),
      ),
    [signals, activeLayer],
  );

  const pulseFeed = useMemo(() => signals.slice(0, 6), [signals]);

  // Inicialización del mapa — encuadrado sobre Argentina
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    let resizeHandler: (() => void) | null = null;

    const timer = setTimeout(() => {
      const L = window.L;
      if (!L) return;

      try {
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true,
          minZoom: 3,
          maxZoom: 18,
          zoomSnap: 0.25,
          worldCopyJump: false,
        });

        const argBounds = L.latLngBounds([
          [-55.2, -73.6],
          [-21.7, -53.5],
        ]);
        map.fitBounds(argBounds, { padding: [24, 24] });
        map.setMaxBounds(argBounds.pad(0.5));
        map.options.maxBoundsViscosity = 0.75;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
          className: 'sov-tiles',
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);

        [200, 500].forEach((d) =>
          setTimeout(() => mapInstanceRef.current?.invalidateSize(), d),
        );
        resizeHandler = () => mapInstanceRef.current?.invalidateSize();
        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        console.error('Map init error:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
  }, [leafletLoaded]);

  const { clusterGroup } = useMapClustering(mapInstanceRef.current, leafletLoaded);

  // Crea/actualiza los marcadores "estrella"
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const cluster = clusterGroup.current;

    cluster?.clearLayers();
    plainMarkersLayerRef.current?.clearLayers();
    markersRef.current = [];

    if (mappedSignals.length === 0) return;

    const createOrb = (key: string, recent: boolean) => {
      const def = SIGNAL_TYPE_MAP[key as SignalTypeKey] ?? SIGNAL_TYPE_MAP.dream;
      const rgb = hexToRgb(def.color);
      return L.divIcon({
        className: 'sov-marker-icon',
        html: `<div class="sov-marker${recent ? ' sov-marker--live' : ''}" style="--c:${def.color};--rgb:${rgb}">
                 <span class="sov-marker__halo"></span>
                 <span class="sov-marker__ring"></span>
                 <span class="sov-marker__core">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${def.glyph}</svg>
                 </span>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16],
      });
    };

    const newMarkers: any[] = [];
    mappedSignals.forEach((signal: MapSignal) => {
      const lat = signal.lat!;
      const lng = signal.lng!;
      const marker = L.marker([lat, lng], {
        icon: createOrb(signal.type, isRecentSignal(signal.createdAt)),
      });

      marker.bindPopup(
        EnhancedPopup({
          dream: {
            id: signal.id,
            type: signal.type,
            dream: signal.type === 'dream' ? signal.text : null,
            value: signal.type === 'value' ? signal.text : null,
            need: signal.type === 'need' ? signal.text : null,
            basta: signal.type === 'basta' ? signal.text : null,
            compromiso: signal.type === 'compromiso' ? signal.text : null,
            recurso: signal.type === 'recurso' ? signal.text : null,
            location:
              [signal.city, signal.province].filter(Boolean).join(', ') || signal.location,
            latitude: String(lat),
            longitude: String(lng),
            createdAt: signal.createdAt,
          } as any,
          onViewDetails: () => {},
          onShare: () => {},
        }),
        { className: 'sov-popup', closeButton: true, maxWidth: 300 },
      );

      newMarkers.push({ marker, signal });
    });

    markersRef.current = newMarkers;

    if (cluster) {
      if (plainMarkersLayerRef.current) {
        map.removeLayer(plainMarkersLayerRef.current);
        plainMarkersLayerRef.current = null;
      }
      newMarkers.forEach(({ marker }) => cluster.addLayer(marker));
    } else {
      if (!plainMarkersLayerRef.current) {
        plainMarkersLayerRef.current = L.layerGroup().addTo(map);
      }
      newMarkers.forEach(({ marker }) => plainMarkersLayerRef.current.addLayer(marker));
    }

    return () => {
      if (plainMarkersLayerRef.current) {
        plainMarkersLayerRef.current.clearLayers();
        mapInstanceRef.current?.removeLayer(plainMarkersLayerRef.current);
        plainMarkersLayerRef.current = null;
      }
    };
  }, [leafletLoaded, mappedSignals, clusterGroup, mapReady]);

  // Ceremonia: la nueva señal "florece" en su punto
  const bloomAt = (lat: number, lng: number, color: string) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;
    const icon = L.divIcon({
      className: 'sov-bloom-icon',
      html: `<div class="sov-bloom" style="--c:${color}"><span></span><span></span><span></span></div>`,
      iconSize: [0, 0],
    });
    const m = L.marker([lat, lng], { icon, interactive: false, zIndexOffset: 1000 }).addTo(map);
    setTimeout(() => map.removeLayer(m), 1900);
  };

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      let lat: string | null = null;
      let lng: string | null = null;
      let loc: string | null = null;
      let provinceName: string | null = null;

      if (data.locationMode === 'geo') {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = position.coords.latitude.toString();
          lng = position.coords.longitude.toString();
          loc = 'Ubicación compartida';
        } catch (e) {
          console.warn('Geolocation failed', e);
          toast({
            title: 'No pudimos obtener tu ubicación',
            description: 'Elegí tu provincia para ubicar tu señal — o mandala sin ubicación.',
            variant: 'destructive',
          });
          throw new Error('GEOLOCATION_FAILED');
        }
      } else if (data.locationMode === 'province' && data.province) {
        if (data.province.latitude != null && data.province.longitude != null) {
          lat = String(data.province.latitude);
          lng = String(data.province.longitude);
        }
        loc = data.province.name;
        provinceName = data.province.name;
      }

      let res: Response;
      if (data.type === 'compromiso') {
        res = await apiRequest('POST', '/api/commitment', {
          commitmentText: data.content,
          commitmentType: 'public',
          latitude: lat ? parseFloat(lat) : null,
          longitude: lng ? parseFloat(lng) : null,
          province: provinceName,
        });
      } else if (data.type === 'recurso') {
        res = await apiRequest('POST', '/api/resources-map', {
          description: data.content,
          category: data.resourceCategory || 'other',
          latitude: lat ? parseFloat(lat) : null,
          longitude: lng ? parseFloat(lng) : null,
          location: loc,
          province: provinceName,
        });
      } else {
        res = await apiRequest('POST', '/api/dreams', {
          type: data.type,
          [data.type]: data.content,
          latitude: lat,
          longitude: lng,
          location: loc,
          province: provinceName,
        });
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast({
            title: 'Sesión requerida',
            description: 'Tenés que iniciar sesión para declarar este tipo de señal.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo registrar la declaración.',
            variant: 'destructive',
          });
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: MAP_SIGNALS_QUERY_KEY });
      if (data.type === 'compromiso')
        queryClient.invalidateQueries({ queryKey: ['/api/commitments'] });
      else if (data.type === 'recurso')
        queryClient.invalidateQueries({ queryKey: ['/api/resources-map'] });
      else queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });

      toast({
        title: '¡Tu señal ya está en el mapa!',
        description: 'Gracias por ponerle palabras. Ya suma a la voz colectiva de tu territorio.',
      });

      if (lat && lng && mapInstanceRef.current && window.L) {
        const la = parseFloat(lat);
        const ln = parseFloat(lng);
        mapInstanceRef.current.flyTo([la, ln], 9, { duration: 1.4 });
        setTimeout(() => bloomAt(la, ln, signalColor(data.type)), 700);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'GEOLOCATION_FAILED') throw error;
      toast({
        title: 'Error',
        description: 'No se pudo registrar la declaración.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    const el = mapRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        mapInstanceRef.current?.flyTo(
          [position.coords.latitude, position.coords.longitude],
          11,
          { duration: 1.4 },
        ),
      () => toast({ title: 'No se pudo obtener tu ubicación.', variant: 'destructive' }),
    );
  };

  const legend: Array<{ id: LayerKey; label: string; color: string; count: number }> = [
    { id: 'all', label: 'Todas', color: '#9D85E8', count: signals.length },
    ...SIGNAL_TYPES.map((t) => ({
      id: t.key as LayerKey,
      label: t.label,
      color: t.color,
      count: counts[t.key] ?? 0,
    })),
  ];

  const showEmpty = !isLoading && mapReady && signals.length === 0;

  return (
    <div className="sov-shell relative w-full h-[82vh] md:h-[88vh] rounded-[28px] overflow-hidden border border-white/10 bg-[#07070b] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      {/* Mapa */}
      <div ref={mapRef} className="absolute inset-0 z-0 bg-[#07070b]" style={{ minHeight: '400px' }} />

      {/* Atmósfera: aura violeta + viñeta hacia el vacío */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[70%] rounded-full blur-[120px] opacity-[0.18]" style={{ background: 'radial-gradient(circle, #7D5BDE 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 220px 60px rgba(7,7,11,0.9)' }} />
      </div>

      {/* Cargando */}
      {!leafletLoaded && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-[#07070b]/95">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-white/10 border-t-[#7D5BDE] animate-spin" />
            <p className="text-slate-500 text-sm font-mono uppercase tracking-[0.25em]">Trazando el mapa…</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      <AnimatePresence>
        {showEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none px-6"
          >
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-5 w-12 h-12 rounded-full bg-[#7D5BDE]/15 border border-[#7D5BDE]/40 flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#9D85E8] animate-pulse" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-2">El mapa espera tu voz</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Todavía no hay señales acá. Sé la primera persona en dejar lo que soñás, lo que falta o lo que ya no bancás.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD superior izquierdo: pulso + leyenda (desktop) ── */}
      <div className="absolute top-5 left-5 z-[400] hidden md:block w-[230px]">
        <div className="rounded-[22px] border border-white/10 bg-[#0c0d12]/85 backdrop-blur-2xl p-5 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Señales en vivo</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[44px] leading-none text-white tabular-nums">
              {signals.length.toLocaleString('es-AR')}
            </span>
            <span className="text-[11px] text-slate-500">voces</span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.07] flex flex-col gap-0.5">
            {legend.map((l) => {
              const on = activeLayer === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors',
                    on ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
                  )}
                  aria-pressed={on}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: l.color, boxShadow: on ? `0 0 10px ${l.color}` : 'none' }}
                  />
                  <span className={cn('text-[12px] flex-1 text-left transition-colors', on ? 'text-white font-medium' : 'text-slate-400')}>
                    {l.label}
                  </span>
                  <span className={cn('text-[11px] font-mono tabular-nums', on ? 'text-slate-300' : 'text-slate-600')}>
                    {l.count.toLocaleString('es-AR')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile: pulso + filtro horizontal ── */}
      <div className="absolute top-3 left-3 right-14 z-[400] md:hidden flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#0c0d12]/85 backdrop-blur-xl px-3 py-1.5 border border-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-300 tabular-nums">{signals.length} señales</span>
        </div>
        <div className="overflow-x-auto flex gap-1.5 pb-1 -mx-1 px-1 scrollbar-hide">
          {legend.map((l) => {
            const on = activeLayer === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-[11px] font-semibold transition-colors border',
                  on ? 'bg-white/10 border-white/20 text-white' : 'bg-[#0c0d12]/85 border-white/10 text-slate-400',
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Controles (derecha) ── */}
      <div className="absolute top-5 right-5 z-[400] flex flex-col gap-2">
        <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0c0d12]/85 backdrop-blur-xl">
          <button onClick={() => mapInstanceRef.current?.zoomIn()} className="p-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors" aria-label="Acercar">
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/10" />
          <button onClick={() => mapInstanceRef.current?.zoomOut()} className="p-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors" aria-label="Alejar">
            <Minus className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleMyLocation} className="p-2.5 rounded-2xl border border-white/10 bg-[#0c0d12]/85 backdrop-blur-xl text-slate-300 hover:text-[#9D85E8] hover:border-[#7D5BDE]/40 transition-colors" aria-label="Mi ubicación">
          <Locate className="w-4 h-4" />
        </button>
        <button onClick={toggleFullscreen} className="p-2.5 rounded-2xl border border-white/10 bg-[#0c0d12]/85 backdrop-blur-xl text-slate-300 hover:text-white transition-colors" aria-label="Pantalla completa">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Composer (desktop, abajo izquierda) ── */}
      <div className="absolute bottom-5 left-5 z-[400] max-w-md w-full hidden md:block">
        <SovereignInput onSubmit={handleCreate} isSubmitting={isSubmitting} />
      </div>

      {/* ── Composer (mobile, bottom-sheet) ── */}
      <div className="md:hidden">
        <AnimatePresence>
          {showMobileInput && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileInput(false)}
                className="absolute inset-0 z-[390] bg-black/50"
              />
              <motion.div
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 120 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="absolute bottom-0 left-0 right-0 z-[400] p-3"
              >
                <SovereignInput
                  onSubmit={async (data) => {
                    await handleCreate(data);
                    setShowMobileInput(false);
                  }}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {!showMobileInput && (
          <button
            onClick={() => setShowMobileInput(true)}
            className="absolute bottom-6 right-6 z-[400] h-14 w-14 rounded-full bg-[#7D5BDE] text-white shadow-[0_0_40px_-4px_rgba(125,91,222,0.7)] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Declarar"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Feed en vivo (abajo derecha, lg+) ── */}
      <div className="absolute bottom-5 right-5 z-[400] w-72 hidden lg:block">
        <div className="rounded-[22px] border border-white/10 bg-[#0c0d12]/85 backdrop-blur-2xl p-4 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
          <h4 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-3">
            <Radio className="w-3 h-3" /> Últimas señales
          </h4>
          <div className="space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            <AnimatePresence initial={false}>
              {pulseFeed.map((item) => {
                const color = signalColor(item.type);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                    style={{ borderLeft: `2px solid ${color}` }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
                        {signalLabel(item.type)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-slate-300 leading-snug line-clamp-2">{item.text}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {pulseFeed.length === 0 && (
              <p className="text-[12px] text-slate-600 py-4 text-center">Las señales aparecerán acá en tiempo real.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignMap;
