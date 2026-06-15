import { Dream } from '@shared/schema';
import { SIGNAL_TYPE_MAP, type SignalTypeKey } from '@/lib/signal-types';

type MapDisplayItem = Dream & { compromiso?: string | null; recurso?: string | null };

interface EnhancedPopupProps {
  dream: MapDisplayItem;
  onViewDetails?: (dream: MapDisplayItem) => void;
  onShare?: (dream: MapDisplayItem) => void;
}

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );

const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'recién';
    if (mins < 60) return `hace ${mins} min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `hace ${h} h`;
    const days = Math.floor(h / 24);
    if (days < 7) return `hace ${days} d`;
    return `hace ${Math.floor(days / 7)} sem`;
  } catch {
    return '';
  }
};

/**
 * Devuelve el HTML (string) del popup de una señal — tema oscuro "plata editorial".
 * El estilo del contenedor vive en index.css bajo `.sov-popup`.
 */
const EnhancedPopup = ({ dream }: EnhancedPopupProps): string => {
  const type = (dream.type as string) || 'dream';
  const def = SIGNAL_TYPE_MAP[type as SignalTypeKey] ?? SIGNAL_TYPE_MAP.dream;

  const raw =
    (type === 'dream' && dream.dream) ||
    (type === 'value' && dream.value) ||
    (type === 'need' && dream.need) ||
    (type === 'basta' && dream.basta) ||
    (type === 'compromiso' && dream.compromiso) ||
    (type === 'recurso' && (dream as any).recurso) ||
    '';

  const text = String(raw);
  const truncated = text.length > 180 ? `${text.slice(0, 180)}…` : text;
  const when = formatDate(dream.createdAt);
  const place = dream.location || 'Argentina';

  return `
    <div class="sov-pop">
      <div class="sov-pop__head">
        <span class="sov-pop__chip" style="--c:${def.color}">
          <span class="sov-pop__dot"></span>${def.label}
        </span>
        ${when ? `<span class="sov-pop__time">${when}</span>` : ''}
      </div>
      <p class="sov-pop__text">${escapeHtml(truncated)}</p>
      <div class="sov-pop__foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span>${escapeHtml(place)}</span>
      </div>
    </div>
  `;
};

export default EnhancedPopup;
