import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Heart,
  AlertCircle,
  Zap,
  MapPin,
  Map,
  EyeOff,
  Send,
  Loader2,
  Handshake,
  Wrench
} from 'lucide-react';
import { cn } from "@/lib/utils";

type InputType = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

export type LocationMode = 'geo' | 'province' | 'none';

export interface ProvinceOption {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

const LOCATION_MODES: Array<{ id: LocationMode; label: string; icon: any }> = [
  { id: 'geo', label: 'Mi ubicación', icon: MapPin },
  { id: 'province', label: 'Elegir provincia', icon: Map },
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

const types: { id: InputType; label: string; icon: any; color: string; desc: string }[] = [
  { 
    id: 'dream', 
    label: 'Sueño', 
    icon: Eye, 
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    desc: '¿Qué ves para el futuro?' 
  },
  { 
    id: 'value', 
    label: 'Valor', 
    icon: Heart, 
    color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    desc: '¿Qué principios sostenés?' 
  },
  { 
    id: 'need', 
    label: 'Necesidad', 
    icon: AlertCircle, 
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: '¿Qué falta para prosperar?' 
  },
  {
    id: 'basta',
    label: '¡BASTA!',
    icon: Zap,
    color: 'text-red-400 border-red-500/30 bg-red-500/10',
    desc: '¿Qué límite ponés hoy?'
  },
  {
    id: 'compromiso',
    label: 'Compromiso',
    icon: Handshake,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    desc: '¿Qué te comprometés a hacer?'
  },
  {
    id: 'recurso',
    label: 'Recurso',
    icon: Wrench,
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    desc: '¿Qué podés aportar al movimiento?'
  }
];

const SovereignInput = ({ onSubmit, isSubmitting }: SovereignInputProps) => {
  const [activeType, setActiveType] = useState<InputType>('dream');
  const [content, setContent] = useState('');
  const [locationMode, setLocationMode] = useState<LocationMode>('geo');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceOption | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [resourceCategory, setResourceCategory] = useState<string>('other');
  const maxChars = 280;

  const { data: provinces = [] } = useQuery<ProvinceOption[]>({
    queryKey: ['/api/geographic/provinces'],
    enabled: locationMode === 'province',
  });

  const handleTypeChange = (type: InputType) => {
    setActiveType(type);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
      setCharCount(text.length);
    }
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
      setCharCount(0);
    } catch (err) {
      // La geolocalización falló: cambiamos a "elegir provincia" sin perder el texto.
      if (err instanceof Error && err.message === 'GEOLOCATION_FAILED') {
        setLocationMode('province');
      }
    }
  };

  const activeConfig = types.find(t => t.id === activeType)!;
  const progress = (charCount / maxChars) * 100;
  const progressColor = progress > 90 ? 'text-red-500' : progress > 75 ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Header / Type Selector */}
      <div className="p-2 grid grid-cols-6 gap-1 bg-black/20 border-b border-white/5">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-300",
              activeType === type.id 
                ? `bg-white/10 ${type.color} shadow-lg` 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <type.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <h3 className={cn("text-sm font-mono uppercase tracking-widest mb-1", activeConfig.color.split(' ')[0])}>
              {activeConfig.label}
            </h3>
            <p className="text-slate-400 text-xs font-light">
              {activeConfig.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeType === 'recurso' && (
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setResourceCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                    resourceCategory === cat.id
                      ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Escribí lo tuyo acá. Con tus palabras, sin vueltas..."
              className="bg-black/30 border-slate-700 focus:border-blue-500 text-slate-200 min-h-[120px] resize-none rounded-xl p-4 text-base"
            />
            
            {/* Circular Progress */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={cn("text-xs font-mono", progressColor)}>
                {maxChars - charCount}
              </span>
              <svg className="w-5 h-5 transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={50.27}
                  strokeDashoffset={50.27 - (progress / 100) * 50.27}
                  className={cn("transition-all duration-300", progressColor)}
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setLocationMode(mode.id)}
                  aria-pressed={locationMode === mode.id}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                    locationMode === mode.id
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                  )}
                >
                  <mode.icon className="w-3 h-3" /> {mode.label}
                </button>
              ))}
            </div>
            {locationMode === 'province' && (
              <select
                value={selectedProvince?.name ?? ''}
                onChange={(e) => setSelectedProvince(provinces.find((p) => p.name === e.target.value) ?? null)}
                className="w-full h-9 px-3 rounded-md bg-black/30 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                aria-label="Provincia"
              >
                <option value="">Elegí tu provincia…</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            )}
            {locationMode === 'none' && (
              <p className="text-[11px] text-slate-500">
                Tu señal cuenta en las estadísticas pero no aparece en el mapa.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim() || (locationMode === 'province' && !selectedProvince)}
              className={cn(
                "rounded-full px-6 font-bold transition-all duration-300",
                !content.trim() 
                  ? "bg-slate-800 text-slate-500" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  DECLARAR <Send className="w-3 h-3 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SovereignInput;

