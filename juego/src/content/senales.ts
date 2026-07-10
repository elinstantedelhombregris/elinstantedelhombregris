import type { TipoSenal } from './types';

/**
 * Las 6 señales del movimiento — puerto de mobile/src/lib/radar-types.ts.
 * Mismos colores canónicos, mismos íconos Ionicons, mismas preguntas
 * rioplatenses VERBATIM. En el juego no hay auth: todas se capturan igual.
 */
export interface SenalDef {
  key: TipoSenal;
  label: string;
  color: string;
  /** Nombre de ícono Ionicons. */
  icon: string;
  question: string;
  placeholder: string;
}

export const SENALES: SenalDef[] = [
  {
    key: 'dream', label: 'Sueño', color: '#3b82f6', icon: 'sparkles-outline',
    question: '¿Qué soñás para tu barrio, tu provincia, el país?',
    placeholder: 'Sueño con…',
  },
  {
    key: 'need', label: 'Necesidad', color: '#f59e0b', icon: 'help-buoy-outline',
    question: '¿Qué falta hoy donde vivís?',
    placeholder: 'Acá falta…',
  },
  {
    key: 'basta', label: '¡Basta!', color: '#ef4444', icon: 'megaphone-outline',
    question: '¿De qué te cansaste? Decilo.',
    placeholder: '¡Basta de…!',
  },
  {
    key: 'value', label: 'Valor', color: '#ec4899', icon: 'diamond-outline',
    question: '¿Qué valor no se negocia para vos?',
    placeholder: 'Para mí no se negocia…',
  },
  {
    key: 'compromiso', label: 'Compromiso', color: '#10b981', icon: 'hand-left-outline',
    question: '¿Qué te comprometés a hacer vos?',
    placeholder: 'Me comprometo a…',
  },
  {
    key: 'recurso', label: 'Recurso', color: '#14b8a6', icon: 'gift-outline',
    question: '¿Qué podés ofrecer? Tiempo, saberes, espacio…',
    placeholder: 'Puedo ofrecer…',
  },
];

export const SENAL_POR_KEY: Record<TipoSenal, SenalDef> = Object.fromEntries(
  SENALES.map((s) => [s.key, s]),
) as Record<TipoSenal, SenalDef>;
