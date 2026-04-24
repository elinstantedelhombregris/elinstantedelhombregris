// client/src/components/radiografia-map/MapFiltersBar.tsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lasso, X } from 'lucide-react';
import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { DreamType, MapFilters } from './types';
import { ALL_TYPES } from './types';

interface Province { id: number; name: string; latitude?: number; longitude?: number }
interface City { id: number; name: string; latitude?: number; longitude?: number }

interface MapFiltersBarProps {
  filters: MapFilters;
  lassoActive: boolean; // drawing mode
  lassoEntriesCount: number; // count of entries inside current lasso, for chip label
  onToggleType: (t: DreamType) => void;
  onSetProvince: (name: string | null, lat?: number, lng?: number) => void;
  onSetCity: (name: string | null, lat?: number, lng?: number) => void;
  onStartLasso: () => void;
  onClearLasso: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export default function MapFiltersBar({
  filters,
  lassoActive,
  lassoEntriesCount,
  onToggleType,
  onSetProvince,
  onSetCity,
  onStartLasso,
  onClearLasso,
  onClearAll,
  hasActiveFilters,
}: MapFiltersBarProps) {
  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ['/api/geographic/provinces'],
    staleTime: 300000,
  });

  const selectedProvinceObj = useMemo(
    () => provinces.find((p) => p.name === filters.province) ?? null,
    [provinces, filters.province],
  );

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/geographic/provinces', selectedProvinceObj?.id, 'cities'],
    queryFn: async () => {
      if (!selectedProvinceObj) return [];
      const r = await apiRequest('GET', `/api/geographic/provinces/${selectedProvinceObj.id}/cities`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: selectedProvinceObj != null,
    staleTime: 300000,
  });

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6 space-y-4">
      {/* Type chips */}
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map((t) => {
          const active = filters.types.has(t);
          const color = TYPE_COLORS[t];
          return (
            <button
              key={t}
              role="switch"
              aria-checked={active}
              onClick={() => onToggleType(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'text-white'
                  : 'text-slate-400 border-white/10 bg-white/[0.02] hover:bg-white/5',
              )}
              style={
                active
                  ? { backgroundColor: `${color}33`, borderColor: `${color}99`, color: '#fff' }
                  : undefined
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {TYPE_LABELS[t]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dropdowns + Lasso + Clear */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          aria-label="Provincia"
          value={filters.province ?? ''}
          onChange={(e) => {
            const name = e.target.value || null;
            const p = name ? provinces.find((x) => x.name === name) : null;
            onSetProvince(name, p?.latitude, p?.longitude);
          }}
          className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-slate-200"
        >
          <option value="">Todas las provincias</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>

        <select
          aria-label="Ciudad"
          value={filters.city ?? ''}
          disabled={filters.province == null}
          onChange={(e) => {
            const name = e.target.value || null;
            const c = name ? cities.find((x) => x.name === name) : null;
            onSetCity(name, c?.latitude, c?.longitude);
          }}
          className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-slate-200 disabled:opacity-40"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={onStartLasso}
          aria-pressed={lassoActive}
          className={cn(
            'h-9 px-3 rounded-md border text-sm inline-flex items-center gap-2 transition-colors',
            lassoActive
              ? 'bg-purple-600/30 border-purple-400/50 text-white animate-pulse'
              : filters.lasso
                ? 'bg-white/5 border-white/20 text-slate-200 hover:bg-white/10'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10',
          )}
        >
          <Lasso className="w-4 h-4" />
          {lassoActive ? 'Dibujando…' : filters.lasso ? 'Nuevo lazo' : 'Lazo'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="h-9 px-3 rounded-md border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.province && (
            <Chip label={filters.province} onRemove={() => onSetProvince(null)} />
          )}
          {filters.city && (
            <Chip label={filters.city} onRemove={() => onSetCity(null)} />
          )}
          {filters.lasso && (
            <Chip label={`Lazo: ${lassoEntriesCount} señales`} onRemove={onClearLasso} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="text-slate-400 hover:text-white"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
