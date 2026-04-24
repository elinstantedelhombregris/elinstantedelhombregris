import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import type { MapEntry } from './types';

const CARD_STYLE: Record<string, string> = {
  backgroundColor: 'rgba(10, 10, 20, 0.95)',
  color: '#e2e8f0',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  maxWidth: '280px',
  pointerEvents: 'none',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

/** HexagonLayer passes `object.points: Array<{ source: MapEntry }>` for picked hexagons. */
export function hexagonTooltipHtml(points: Array<{ source?: MapEntry } | MapEntry>): string {
  const entries: MapEntry[] = points.map((p: any) => (p.source ?? p) as MapEntry);
  const total = entries.length;
  const byType: Record<string, number> = {};
  const locSet = new Set<string>();
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.location) locSet.add(e.location);
  }

  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const typeLines = sortedTypes
    .map(
      ([t, n]) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:${TYPE_COLORS[t as keyof typeof TYPE_COLORS] ?? '#888'}"></span>
          <span>${n} ${esc(TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t)}</span>
        </span>`,
    )
    .join('');

  const locList = Array.from(locSet).slice(0, 3).map(esc).join(' · ');
  const extra = locSet.size > 3 ? ` <span style="color:#64748b">+${locSet.size - 3} más</span>` : '';

  return `
    <div>
      <div style="font-weight:700;font-size:13px;margin-bottom:6px">${total} señales en esta zona</div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;line-height:1.6">${typeLines}</div>
      ${locList ? `<div style="margin-top:6px;color:#94a3b8">Localidades: ${locList}${extra}</div>` : ''}
    </div>
  `;
}

export function pointTooltipHtml(entry: MapEntry): string {
  const color = TYPE_COLORS[entry.type] ?? '#888';
  const label = TYPE_LABELS[entry.type] ?? entry.type;
  const loc = [entry.city, entry.province].filter(Boolean).join(', ') || entry.location || '';
  return `
    <div>
      <div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:${color}">
        <span style="width:9px;height:9px;border-radius:50%;background:${color}"></span>
        ${esc(label)}
      </div>
      <div style="margin-top:6px;color:#e2e8f0;line-height:1.45">"${esc(truncate(entry.text || '', 120))}"</div>
      ${loc ? `<div style="margin-top:6px;color:#94a3b8;font-size:11px">${esc(loc)}</div>` : ''}
    </div>
  `;
}

export const TOOLTIP_STYLE = CARD_STYLE;
