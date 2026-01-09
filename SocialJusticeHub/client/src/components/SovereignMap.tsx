import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useLoader } from '@/hooks/use-loader';
import { useMapClustering } from '@/hooks/useMapClustering';
import { Dream } from "@shared/schema";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import SovereignInput from './SovereignInput';
import EnhancedPopup from './EnhancedPopup';
import { 
  Maximize2, 
  Minimize2, 
  Locate, 
  Layers, 
  Activity,
  Radio,
  Filter
} from 'lucide-react';
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    L: any;
  }
}

const SovereignMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const plainMarkersLayerRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeLayer, setActiveLayer] = useState<'all' | 'dream' | 'value' | 'need' | 'basta'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pulseFeed, setPulseFeed] = useState<Dream[]>([]);

  // Load Leaflet
  const leafletLoaded = useLoader('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'L');

  // Add Leaflet CSS
  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector('link[href*="leaflet.css"]');
    if (existingLink) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Don't remove on cleanup - CSS should persist
    return () => {
      // Keep CSS loaded
    };
  }, []);

  // Fetch data
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/dreams'],
    staleTime: 60000,
  });

  // Filter dreams
  const filteredDreams = useMemo(() => {
    if (!Array.isArray(dreams)) return [];
    return dreams.filter((dream: Dream) => {
      const hasCoords = dream.latitude && dream.longitude && 
                       !isNaN(parseFloat(dream.latitude)) && 
                       !isNaN(parseFloat(dream.longitude));
      if (!hasCoords) return false;
      if (activeLayer === 'all') return true;
      return dream.type === activeLayer;
    });
  }, [dreams, activeLayer]);

  // Update pulse feed (last 5 entries)
  useEffect(() => {
    if (Array.isArray(dreams)) {
      const sorted = [...dreams].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setPulseFeed(sorted.slice(0, 5));
    }
  }, [dreams]);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    let resizeHandler: (() => void) | null = null;

    const timer = setTimeout(() => {
      const L = window.L;
      if (!L) {
        console.warn('Leaflet not loaded yet');
        return;
      }

      try {
        // Dark matter map style
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true
        }).setView([-38.416097, -63.616672], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        // Force map to recalculate size after initialization
        // Use multiple timeouts to ensure the container has rendered
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
        
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 500);

        // Also invalidate size when window resizes
        resizeHandler = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        };
        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        console.error('Map init error:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
    };
  }, [leafletLoaded]);

  // Clustering Logic
  const { clusterReady } = useMapClustering(
    mapInstanceRef.current,
    markersRef.current,
    leafletLoaded,
    filteredDreams
  );

  // Update Markers
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (plainMarkersLayerRef.current) {
      plainMarkersLayerRef.current.clearLayers();
    }
    markersRef.current = [];

    if (filteredDreams.length === 0) return;

    // Custom Icons with "Glowing" effect
    const createIcon = (colorClass: string, iconHtml: string) => L.divIcon({
      className: 'custom-marker-icon',
      html: `<div class="relative group">
              <div class="absolute inset-0 ${colorClass} rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative flex items-center justify-center w-8 h-8 bg-slate-900 border border-slate-600 rounded-full shadow-xl text-white transform transition-transform group-hover:scale-110">
                ${iconHtml}
              </div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20]
    });

    const icons = {
      dream: createIcon('bg-blue-500', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'),
      value: createIcon('bg-pink-500', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'),
      need: createIcon('bg-amber-500', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'),
      basta: createIcon('bg-red-500', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')
    };

    const newMarkers: any[] = [];
    filteredDreams.forEach((dream: Dream) => {
      const lat = parseFloat(dream.latitude!);
      const lng = parseFloat(dream.longitude!);
      
      // Use type casting or specific check to ensure valid key
      const typeKey = (dream.type as keyof typeof icons) || 'dream';
      const icon = icons[typeKey];

      const marker = L.marker([lat, lng], { icon });
      
      // Use EnhancedPopup but styled for dark mode? 
      // EnhancedPopup returns HTML string, we might need to adjust its style via CSS or create a Dark version.
      // For now, we use the existing one but wrap it in a dark-mode container class if possible, 
      // or we rely on the component's internal styling.
      // Let's assume EnhancedPopup works or we might update it later.
      marker.bindPopup(EnhancedPopup({ 
        dream, 
        onViewDetails: () => {}, 
        onShare: () => {} 
      }));

      newMarkers.push({ marker, dream });
    });

    markersRef.current = newMarkers;

    if (!clusterReady) {
      if (!plainMarkersLayerRef.current) {
        plainMarkersLayerRef.current = L.layerGroup().addTo(map);
      }
      newMarkers.forEach(({ marker }) => plainMarkersLayerRef.current.addLayer(marker));
    } else if (plainMarkersLayerRef.current) {
      map.removeLayer(plainMarkersLayerRef.current);
      plainMarkersLayerRef.current = null;
    }

    return () => {
      if (plainMarkersLayerRef.current) {
        plainMarkersLayerRef.current.clearLayers();
        if (mapInstanceRef.current) mapInstanceRef.current.removeLayer(plainMarkersLayerRef.current);
        plainMarkersLayerRef.current = null;
      }
    };
  }, [leafletLoaded, filteredDreams, clusterReady]);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      let lat = '-34.6037';
      let lng = '-58.3816';
      let loc = 'Argentina';

      if (data.shareLocation) {
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
            title: "Ubicación aproximada",
            description: "Usando ubicación general por defecto.",
          });
        }
      }

      const payload = {
        type: data.type,
        [data.type]: data.content,
        latitude: lat,
        longitude: lng,
        location: loc
      };

      await apiRequest('POST', '/api/dreams', payload);
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      
      toast({
        title: "¡Comando Recibido!",
        description: "Tu declaración ha sido registrada en el mapa soberano.",
      });
      
      // Center map on new point
      if (mapInstanceRef.current && window.L) {
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 10, { animate: true });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la declaración.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    if (!mapRef.current) return;
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstanceRef.current.setView(
            [position.coords.latitude, position.coords.longitude],
            12, { animate: true }
          );
        },
        () => toast({ title: "Error", description: "No se pudo obtener ubicación." })
      );
    }
  };

  return (
    <div className="relative w-full h-[80vh] md:h-[90vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 bg-slate-950"
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading State */}
      {!leafletLoaded && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-950/90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Overlay: Header / Stats */}
      <div className="absolute top-6 left-6 z-[400] flex flex-col gap-4 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Señales en Vivo</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{dreams.length}</div>
          <div className="text-xs text-slate-500">Nodos activos</div>
        </div>

        {/* Layer Controls */}
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-xl flex flex-col gap-1">
          {[
            { id: 'all', icon: Layers, color: 'text-slate-300' },
            { id: 'dream', icon: Radio, color: 'text-blue-400' },
            { id: 'value', icon: Radio, color: 'text-pink-400' },
            { id: 'need', icon: Radio, color: 'text-amber-400' },
            { id: 'basta', icon: Radio, color: 'text-red-400' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center justify-center relative group/btn",
                activeLayer === layer.id ? "bg-white/10" : "hover:bg-white/5"
              )}
              title={layer.id.toUpperCase()}
            >
              <layer.icon className={cn("w-4 h-4", layer.color)} />
              {activeLayer === layer.id && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap">
                  {layer.id.toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay: Controls */}
      <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2">
        <Button variant="secondary" size="icon" onClick={handleMyLocation} className="bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800">
          <Locate className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Overlay: Input Panel */}
      <div className="absolute bottom-6 left-6 z-[400] max-w-md w-full hidden md:block">
        <SovereignInput onSubmit={handleCreate} isSubmitting={isSubmitting} />
      </div>
      
      {/* Mobile Input Trigger */}
      <div className="absolute bottom-20 right-6 z-[400] md:hidden">
         {/* Mobile input would be a modal trigger here, simplified for this step */}
      </div>

      {/* Overlay: Pulse Feed */}
      <div className="absolute bottom-6 right-6 z-[400] w-64 hidden lg:block">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-xl overflow-hidden">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <Radio className="w-3 h-3" /> Últimas Transmisiones
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {pulseFeed.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs border-l-2 border-slate-700 pl-3 py-1"
                >
                  <span className={cn(
                    "font-bold uppercase block mb-1",
                    item.type === 'dream' ? "text-blue-400" :
                    item.type === 'basta' ? "text-red-400" :
                    item.type === 'value' ? "text-pink-400" : "text-amber-400"
                  )}>
                    {item.type}
                  </span>
                  <p className="text-slate-300 line-clamp-2 font-mono opacity-80">
                    {item.dream || item.value || item.need || item.basta}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignMap;

