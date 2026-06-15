import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Map, EyeOff, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SIGNAL_TYPES,
  SIGNAL_TYPE_MAP,
  hexToRgb,
  type SignalTypeKey,
} from '@/lib/signal-types';

export type LocationMode = 'geo' | 'province' | 'none';

export interface ProvinceOption {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

const LOCATION_MODES: Array<{ id: LocationMode; label: string; icon: any }> = [
  { id: 'geo', label: 'Mi ubicación', icon: MapPin },
  { id: 'province', label: 'Provincia', icon: Map },
  { id: 'none', label: 'Sin ubicación', icon: EyeOff },
];

const RESOURCE_CATEGORIES = [
  { id: 'legal', label: 'Legal' },
  { id: 'medical', label: 'Salud' },
  { id: 'education', label: 'Educación' },
  { id: 'tech', label: 'Tecnología' },
  { id: 'construction', label: 'Construcción' },
  { id: 'agriculture', label: 'Agro' },
  { id: 'communication', label: 'Comunicación' },
  { id: 'admin', label: 'Administración' },
  { id: 'transport', label: 'Transporte' },
  { id: 'space', label: 'Espacio físico' },
  { id: 'equipment', label: 'Equipamiento' },
  { id: 'other', label: 'Otro' },
] as const;

interface SovereignInputProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const ACCENT = '#7D5BDE';

const SovereignInput = ({ onSubmit, isSubmitting }: SovereignInputProps) => {
  const [activeType, setActiveType] = useState<SignalTypeKey>('dream');
  const [content, setContent] = useState('');
  const [locationMode, setLocationMode] = useState<LocationMode>('geo');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceOption | null>(null);
  const [resourceCategory, setResourceCategory] = useState<string>('other');
  const maxChars = 280;
  const charCount = content.length;

  const { data: provinces = [] } = useQuery<ProvinceOption[]>({
    queryKey: ['/api/geographic/provinces'],
    enabled: locationMode === 'province',
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) setContent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (locationMode === 'province' && !selectedProvince) return;

    try {
      await onSubmit({
        type: activeType,
        content,
        locationMode,
        province: selectedProvince,
        ...(activeType === 'recurso' ? { resourceCategory } : {}),
      });
      setContent('');
    } catch (err) {
      // La geolocalización falló: pasamos a "provincia" sin perder el texto.
      if (err instanceof Error && err.message === 'GEOLOCATION_FAILED') {
        setLocationMode('province');
      }
    }
  };

  const active = SIGNAL_TYPE_MAP[activeType];
  const rgb = hexToRgb(active.color);
  const progress = (charCount / maxChars) * 100;
  const ringColor = progress > 92 ? '#FF6B5E' : active.color;
  const canSubmit =
    !!content.trim() && !(locationMode === 'province' && !selectedProvince) && !isSubmitting;

  return (
    <div
      className="w-full max-w-md rounded-[26px] border border-white/10 bg-[#0c0d12]/85 backdrop-blur-2xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)] overflow-hidden"
      style={{ boxShadow: `0 24px 70px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      {/* Top hue line — identidad del tipo activo */}
      <div className="h-[3px] w-full transition-colors duration-500" style={{ background: `linear-gradient(90deg, transparent, ${active.color}, transparent)` }} />

      <div className="p-5 sm:p-6">
        {/* Kicker */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-500">
            Tu señal
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En vivo
          </span>
        </div>

        {/* Type selector — 6 chips */}
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          {SIGNAL_TYPES.map((t) => {
            const on = activeType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveType(t.key)}
                aria-pressed={on}
                aria-label={t.label}
                className={cn(
                  'group/chip relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border transition-all duration-300',
                  on ? 'border-transparent' : 'border-white/[0.06] hover:border-white/15',
                )}
                style={
                  on
                    ? {
                        background: `rgba(${hexToRgb(t.color)}, 0.14)`,
                        boxShadow: `inset 0 0 0 1px rgba(${hexToRgb(t.color)}, 0.45), 0 6px 20px -8px rgba(${hexToRgb(t.color)}, 0.7)`,
                      }
                    : undefined
                }
              >
                <t.Icon
                  className="w-[18px] h-[18px] transition-colors duration-300"
                  style={{ color: on ? t.color : '#64748b' }}
                />
                <span
                  className="text-[8.5px] font-semibold uppercase tracking-wide leading-none transition-colors duration-300"
                  style={{ color: on ? t.color : '#64748b' }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Editorial prompt */}
        <AnimatePresence mode="wait">
          <motion.h3
            key={activeType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="font-serif text-[22px] sm:text-2xl leading-tight text-white mb-4"
          >
            {active.question}
          </motion.h3>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeType === 'recurso' && (
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_CATEGORIES.map((cat) => {
                const on = resourceCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setResourceCategory(cat.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all border',
                      on
                        ? 'border-transparent text-white'
                        : 'bg-white/[0.04] border-white/10 text-slate-500 hover:text-slate-300',
                    )}
                    style={on ? { background: `rgba(${rgb}, 0.18)`, boxShadow: `inset 0 0 0 1px rgba(${rgb},0.5)`, color: active.color } : undefined}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder={active.placeholder}
              className="bg-black/40 border-white/10 text-slate-100 placeholder:text-slate-600 min-h-[112px] resize-none rounded-2xl p-4 pr-14 text-[15px] leading-relaxed focus-visible:ring-0 focus-visible:border-transparent transition-shadow"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `inset 0 0 0 1.5px ${ACCENT}`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)')}
            />
            {/* Char ring */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[11px] font-mono tabular-nums" style={{ color: ringColor }}>
                {maxChars - charCount}
              </span>
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke={ringColor}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={50.27}
                  strokeDashoffset={50.27 - (Math.min(progress, 100) / 100) * 50.27}
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* Location segmented control */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/30 border border-white/[0.06]">
              {LOCATION_MODES.map((mode) => {
                const on = locationMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setLocationMode(mode.id)}
                    aria-pressed={on}
                    className={cn(
                      'flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all',
                      on ? 'text-white' : 'text-slate-500 hover:text-slate-300',
                    )}
                    style={on ? { background: `rgba(${hexToRgb(ACCENT)}, 0.22)`, boxShadow: `inset 0 0 0 1px rgba(${hexToRgb(ACCENT)},0.5)` } : undefined}
                  >
                    <mode.icon className="w-3 h-3" /> {mode.label}
                  </button>
                );
              })}
            </div>
            {locationMode === 'province' && (
              <select
                value={selectedProvince?.name ?? ''}
                onChange={(e) =>
                  setSelectedProvince(provinces.find((p) => p.name === e.target.value) ?? null)
                }
                className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-[#7D5BDE]"
                aria-label="Provincia"
              >
                <option value="">Elegí tu provincia…</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            {locationMode === 'none' && (
              <p className="text-[11px] text-slate-500 leading-snug">
                Cuenta en las estadísticas, pero no aparece como punto en el mapa.
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'w-full h-12 rounded-2xl font-bold tracking-wide text-[13px] uppercase transition-all duration-300 disabled:opacity-100',
              canSubmit
                ? 'bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white shadow-[0_0_40px_-6px_rgba(125,91,222,0.55)]'
                : 'bg-white/[0.05] text-slate-600',
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-2">
                Declarar en el mapa <Send className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SovereignInput;
