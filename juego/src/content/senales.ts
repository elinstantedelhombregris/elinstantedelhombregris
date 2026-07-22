import type { TipoSenal } from './types';

/**
 * Las 6 señales del movimiento — puerto de mobile/src/lib/radar-types.ts.
 * Mismos íconos Ionicons, mismas preguntas rioplatenses VERBATIM. En el
 * juego no hay auth: todas se capturan igual.
 *
 * Colores: registro PAPEL (spec Papel y Tinta §2 — espejo de
 * `tailwind.config.js → colors.senal`). El cielo nocturno usa su propia
 * tabla, `COLOR_ESTRELLA` en `src/cielo/posiciones.ts`.
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
    key: 'dream', label: 'Sueño', color: '#5227CC', icon: 'sparkles-outline',
    question: '¿Qué soñás para tu barrio, tu provincia, el país?',
    placeholder: 'Sueño con…',
  },
  {
    key: 'need', label: 'Necesidad', color: '#A16C00', icon: 'help-buoy-outline',
    question: '¿Qué falta hoy donde vivís?',
    placeholder: 'Acá falta…',
  },
  {
    key: 'basta', label: '¡Basta!', color: '#C23B22', icon: 'megaphone-outline',
    question: '¿De qué te cansaste? Decilo.',
    placeholder: '¡Basta de…!',
  },
  {
    key: 'value', label: 'Valor', color: '#16130E', icon: 'diamond-outline',
    question: '¿Qué valor no se negocia para vos?',
    placeholder: 'Para mí no se negocia…',
  },
  {
    key: 'compromiso', label: 'Compromiso', color: '#1A7A4A', icon: 'hand-left-outline',
    question: '¿Qué te comprometés a hacer vos?',
    placeholder: 'Me comprometo a…',
  },
  {
    key: 'recurso', label: 'Recurso', color: '#0F6B8A', icon: 'gift-outline',
    question: '¿Qué podés ofrecer? Tiempo, saberes, espacio…',
    placeholder: 'Puedo ofrecer…',
  },
];

export const SENAL_POR_KEY: Record<TipoSenal, SenalDef> = Object.fromEntries(
  SENALES.map((s) => [s.key, s]),
) as Record<TipoSenal, SenalDef>;
