/**
 * signal-types.ts — única fuente de verdad de los 6 tipos de señal del Mapa.
 *
 * Sistema de color: el violeta iris (ACCENT) gobierna toda la acción/chrome.
 * Estos hues SOLO codifican el *tipo* de señal (data-viz) — una paleta
 * "constelación" recurada: luminosa sobre el vacío #0a0a0a, armónica entre sí,
 * y distinguible de un vistazo. No son colores de marca; son semántica.
 */
import {
  Eye,
  Heart,
  AlertCircle,
  Zap,
  Handshake,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type SignalTypeKey =
  | 'dream'
  | 'value'
  | 'need'
  | 'basta'
  | 'compromiso'
  | 'recurso';

export interface SignalTypeDef {
  key: SignalTypeKey;
  /** Etiqueta corta para chips, leyenda y feed. */
  label: string;
  /** Pregunta editorial que abre el compositor. */
  question: string;
  /** Placeholder del textarea. */
  placeholder: string;
  /** Hue luminoso del tipo (constelación). */
  color: string;
  /** Ícono lucide para chips/leyenda/feed. */
  Icon: LucideIcon;
  /** Glifo SVG interno (currentColor) para el marcador del mapa. */
  glyph: string;
  /** Si requiere sesión iniciada para declarar. */
  requiresAuth: boolean;
}

export const SIGNAL_TYPES: SignalTypeDef[] = [
  {
    key: 'dream',
    label: 'Sueño',
    question: '¿Qué ves para el futuro?',
    placeholder: 'Sueño con una Argentina donde…',
    color: '#6E8BFF',
    Icon: Eye,
    glyph:
      '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    requiresAuth: false,
  },
  {
    key: 'value',
    label: 'Valor',
    question: '¿Qué principio no se negocia?',
    placeholder: 'Para mí no se negocia…',
    color: '#F06595',
    Icon: Heart,
    glyph:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    requiresAuth: false,
  },
  {
    key: 'need',
    label: 'Necesidad',
    question: '¿Qué falta donde vivís?',
    placeholder: 'Acá falta…',
    color: '#FFB454',
    Icon: AlertCircle,
    glyph:
      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    requiresAuth: false,
  },
  {
    key: 'basta',
    label: '¡Basta!',
    question: '¿De qué te cansaste? Decilo.',
    placeholder: '¡Basta de…!',
    color: '#FF6B5E',
    Icon: Zap,
    glyph: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    requiresAuth: false,
  },
  {
    key: 'compromiso',
    label: 'Compromiso',
    question: '¿Qué te comprometés a hacer vos?',
    placeholder: 'Me comprometo a…',
    color: '#4ED9A4',
    Icon: Handshake,
    glyph: '<path d="M20 6 9 17l-5-5"/>',
    requiresAuth: true,
  },
  {
    key: 'recurso',
    label: 'Recurso',
    question: '¿Qué podés aportar al movimiento?',
    placeholder: 'Puedo ofrecer…',
    color: '#3FC8C8',
    Icon: Wrench,
    glyph:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    requiresAuth: true,
  },
];

export const SIGNAL_TYPE_MAP: Record<SignalTypeKey, SignalTypeDef> =
  SIGNAL_TYPES.reduce((acc, t) => {
    acc[t.key] = t;
    return acc;
  }, {} as Record<SignalTypeKey, SignalTypeDef>);

/** Color del tipo, con fallback al hue de "sueño" si llega algo inesperado. */
export const signalColor = (key: string): string =>
  SIGNAL_TYPE_MAP[key as SignalTypeKey]?.color ?? SIGNAL_TYPE_MAP.dream.color;

/** Etiqueta del tipo, con fallback legible. */
export const signalLabel = (key: string): string =>
  SIGNAL_TYPE_MAP[key as SignalTypeKey]?.label ?? 'Señal';

/** hex (#rrggbb) → "r, g, b" para componer rgba() en estilos inline. */
export const hexToRgb = (hex: string): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};
