import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLoader } from '@/hooks/use-loader';

declare global {
  interface Window {
    L: any;
  }
}

type CommunityPost = {
  id: number;
  title: string;
  description: string;
  type: 'employment' | 'exchange' | 'volunteer' | 'project' | 'donation' | 'story' | 'action' | 'idea' | 'question';
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  memberCount?: number;
  city?: string;
  province?: string;
};

type InitiativesMapProps = {
  initiatives: CommunityPost[];
  onInitiativeClick: (id: number) => void;
};

const InitiativesMap = ({ initiatives, onInitiativeClick }: InitiativesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Load Leaflet library dynamically
  const leafletLoaded = useLoader('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'L');
  
  // Add Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    return () => {
      const existingLink = document.head.querySelector(`link[href="${link.href}"]`);
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);
  
  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (leafletLoaded && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      
      // Center of Argentina
      const argentinaCenterLat = -38.416097;
      const argentinaCenterLng = -63.616672;
      
      const map = L.map(mapRef.current).setView([argentinaCenterLat, argentinaCenterLng], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }
  }, [leafletLoaded]);
  
  // Get color for initiative type
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      project: '#3b82f6', // blue
      action: '#f97316', // orange
      exchange: '#a855f7', // purple
      volunteer: '#10b981', // green
      donation: '#ef4444', // red
      employment: '#8b5cf6', // purple
      story: '#06b6d4', // cyan
      idea: '#f59e0b', // amber
      question: '#6366f1' // indigo
    };
    return colors[type] || '#6b7280'; // gray default
  };
  
  // Add initiative markers to map
  useEffect(() => {
    if (leafletLoaded && mapInstanceRef.current && initiatives && Array.isArray(initiatives)) {
      const L = window.L;
      const map = mapInstanceRef.current;
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
      
      // Filter initiatives with valid coordinates
      const initiativesWithLocation = initiatives.filter(init => 
        init.latitude != null && 
        init.longitude != null && 
        !isNaN(Number(init.latitude)) && 
        !isNaN(Number(init.longitude))
      );
      
      // Create markers for each initiative
      initiativesWithLocation.forEach((initiative) => {
        const lat = Number(initiative.latitude);
        const lng = Number(initiative.longitude);
        const color = getTypeColor(initiative.type);
        
        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-initiative-marker',
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        // Create marker
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${initiative.title}</h3>
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 2px 8px; background-color: ${color}20; color: ${color}; border-radius: 4px; font-size: 12px; font-weight: 500;">
                ${initiative.type}
              </span>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${initiative.description.substring(0, 100)}${initiative.description.length > 100 ? '...' : ''}</p>
            <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">
              <div>📍 ${initiative.location || (initiative.city && initiative.province ? `${initiative.city}, ${initiative.province}` : 'Sin ubicación')}</div>
              ${initiative.memberCount ? `<div>👥 ${initiative.memberCount} miembros</div>` : ''}
            </div>
            <button 
              id="view-initiative-${initiative.id}" 
              style="width: 100%; padding: 6px 12px; background-color: ${color}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; margin-top: 8px;"
              onmouseover="this.style.opacity='0.9'"
              onmouseout="this.style.opacity='1'"
            >
              Ver detalle
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click handler to popup button
        marker.on('popupopen', () => {
          const button = document.getElementById(`view-initiative-${initiative.id}`);
          if (button) {
            button.addEventListener('click', () => {
              onInitiativeClick(initiative.id);
            });
          }
        });
        
        markersRef.current.push(marker);
      });
    }
  }, [leafletLoaded, initiatives, onInitiativeClick]);
  
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-white/10 bg-white/5">
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
};

export default InitiativesMap;

