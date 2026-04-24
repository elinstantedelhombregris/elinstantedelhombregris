// client/src/components/radiografia-map/SelectionPanel.tsx
import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import type { DreamType, MapEntry } from './types';
import { ALL_TYPES } from './types';

interface SelectionPanelProps {
  entries: MapEntry[];
  visible: boolean;
  onClose: () => void;
  onRowClick?: (entry: MapEntry) => void;
}

const MAX_LIST = 300;
const MAX_LOCATIONS = 5;
const MAX_THEMES = 3;

// Lightweight theme extraction from text — matches the general style in useConvergenceAnalysis.
const THEME_KEYWORDS: Array<{ label: string; rx: RegExp }> = [
  { label: 'educación', rx: /educa(ción|r|tiv)/i },
  { label: 'salud', rx: /salud|m[eé]dic|hospital/i },
  { label: 'trabajo', rx: /trabaj|empleo|laboral/i },
  { label: 'vivienda', rx: /viviend|hogar|casa propia/i },
  { label: 'seguridad', rx: /seguridad|polic[ií]a|inseguridad/i },
  { label: 'justicia', rx: /justicia|derechos|corrupci[oó]n/i },
  { label: 'economía', rx: /econom[ií]a|inflaci[oó]n|pobreza/i },
  { label: 'medio ambiente', rx: /ambient|ecolog|contamina/i },
];

function extractTopThemes(entries: MapEntry[]): string[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    for (const { label, rx } of THEME_KEYWORDS) {
      if (rx.test(e.text)) counts[label] = (counts[label] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_THEMES)
    .map(([label]) => label);
}

export default function SelectionPanel({ entries, visible, onClose, onRowClick }: SelectionPanelProps) {
  const { byType, locationList, topThemes } = useMemo(() => {
    const bt: Record<DreamType, number> = {
      dream: 0, value: 0, need: 0, basta: 0, compromiso: 0, recurso: 0,
    };
    const locs = new Map<string, number>();
    for (const e of entries) {
      bt[e.type]++;
      const loc = e.city || e.location;
      if (loc) locs.set(loc, (locs.get(loc) || 0) + 1);
    }
    const sortedLocs = Array.from(locs.entries()).sort((a, b) => b[1] - a[1]);
    return {
      byType: bt,
      locationList: sortedLocs.slice(0, MAX_LOCATIONS).map(([name]) => name),
      locationOverflow: sortedLocs.length - MAX_LOCATIONS,
      topThemes: extractTopThemes(entries),
    };
  }, [entries]);

  const maxBarCount = Math.max(1, ...ALL_TYPES.map((t) => byType[t]));
  const locationOverflow = Math.max(0, new Set(entries.map((e) => e.city || e.location).filter(Boolean)).size - MAX_LOCATIONS);
  const shown = entries.slice(0, MAX_LIST);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          role="dialog"
          aria-label="Zona seleccionada"
          className="fixed right-0 top-0 h-full w-full md:w-[420px] z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 flex flex-col"
        >
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a]/95">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Zona seleccionada</div>
              <div className="text-xl font-bold text-white">{entries.length} señales</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No encontramos señales en esta zona. Probá con un área más grande o sin otros filtros.
              </div>
            ) : (
              <>
                <section className="px-5 py-4 space-y-2">
                  {ALL_TYPES.map((t) => {
                    const n = byType[t];
                    if (n === 0) return null;
                    const pct = (n / maxBarCount) * 100;
                    return (
                      <div key={t} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                          <span className="text-slate-300">{TYPE_LABELS[t]}</span>
                        </span>
                        <span className="w-10 text-right tabular-nums text-slate-200">{n}</span>
                        <span className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[t] }} />
                        </span>
                      </div>
                    );
                  })}
                </section>

                <section className="px-5 pb-3 text-xs text-slate-400">
                  {locationList.length > 0 && (
                    <div className="mb-1">
                      <span className="text-slate-500">Localidades:</span>{' '}
                      {locationList.join(', ')}{locationOverflow > 0 ? `, +${locationOverflow}` : ''}
                    </div>
                  )}
                  {topThemes.length > 0 && (
                    <div>
                      <span className="text-slate-500">Temas top:</span> {topThemes.join(', ')}
                    </div>
                  )}
                </section>

                <div className="border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono sticky top-0 bg-[#0a0a0a]/95">
                  Voces ({entries.length})
                </div>

                <ul className="px-3 pb-6">
                  {shown.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => onRowClick?.(e)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[e.type] }} />
                          <span className="text-[11px] uppercase tracking-wider text-slate-400">{TYPE_LABELS[e.type]}</span>
                        </div>
                        <div className="text-sm text-slate-200 leading-snug line-clamp-2">
                          {e.text || <span className="italic text-slate-500">(sin texto)</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {[e.city, e.province].filter(Boolean).join(', ') || e.location}
                        </div>
                      </button>
                    </li>
                  ))}
                  {entries.length > MAX_LIST && (
                    <li className="px-3 py-3 text-xs text-slate-500 italic">
                      Mostrando las primeras {MAX_LIST} de {entries.length}. Ajustá los filtros para refinar.
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
