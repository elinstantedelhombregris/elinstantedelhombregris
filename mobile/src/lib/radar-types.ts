/**
 * Los 6 tipos de señal — puerto de client/src/components/radar/radar-types.ts.
 * Mismos colores que la Radiografía y el mapa; mismas preguntas rioplatenses.
 */

export type RadarTypeKey = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

export interface RadarTypeDef {
  key: RadarTypeKey;
  label: string;
  color: string;
  /** Nombre de ícono Ionicons */
  icon: string;
  question: string;
  placeholder: string;
  requiresAuth: boolean;
}

export const RADAR_TYPES: RadarTypeDef[] = [
  {
    key: 'dream', label: 'Sueño', color: '#3b82f6', icon: 'sparkles-outline',
    question: '¿Qué soñás para tu barrio, tu provincia, el país?',
    placeholder: 'Sueño con…',
    requiresAuth: false,
  },
  {
    key: 'need', label: 'Necesidad', color: '#f59e0b', icon: 'help-buoy-outline',
    question: '¿Qué falta hoy donde vivís?',
    placeholder: 'Acá falta…',
    requiresAuth: false,
  },
  {
    key: 'basta', label: '¡Basta!', color: '#ef4444', icon: 'megaphone-outline',
    question: '¿De qué te cansaste? Decilo.',
    placeholder: '¡Basta de…!',
    requiresAuth: false,
  },
  {
    key: 'value', label: 'Valor', color: '#ec4899', icon: 'diamond-outline',
    question: '¿Qué valor no se negocia para vos?',
    placeholder: 'Para mí no se negocia…',
    requiresAuth: false,
  },
  {
    key: 'compromiso', label: 'Compromiso', color: '#10b981', icon: 'hand-left-outline',
    question: '¿Qué te comprometés a hacer vos?',
    placeholder: 'Me comprometo a…',
    requiresAuth: true,
  },
  {
    key: 'recurso', label: 'Recurso', color: '#14b8a6', icon: 'gift-outline',
    question: '¿Qué podés ofrecer? Tiempo, saberes, espacio…',
    placeholder: 'Puedo ofrecer…',
    requiresAuth: true,
  },
];

export const RADAR_TYPE_MAP: Record<RadarTypeKey, RadarTypeDef> = Object.fromEntries(
  RADAR_TYPES.map((t) => [t.key, t]),
) as Record<RadarTypeKey, RadarTypeDef>;
