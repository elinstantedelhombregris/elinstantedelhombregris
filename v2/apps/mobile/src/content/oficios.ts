/**
 * Oficios — los dominios de capacidad demostrada del Protocolo Vivo
 * (Capability Layer). Un oficio agrupa obras; las obras de un oficio
 * forman tu constelación de oficio. Los ids son estables: se persisten.
 */
import type { ListeningTheme } from '../civic/types';

export type OficioId =
  | 'alimentacion' | 'vivienda' | 'trabajo' | 'cuidados' | 'salud'
  | 'educacion' | 'ambiente' | 'movilidad' | 'convivencia'
  | 'cultura' | 'participacion';

export interface Oficio {
  id: OficioId;
  nombre: string;
  /** Nombre de ícono Ionicons. */
  icono: string;
  color: string;
}

export const OFICIOS: readonly Oficio[] = [
  { id: 'alimentacion', nombre: 'Alimentación', icono: 'nutrition-outline', color: '#f59e0b' },
  { id: 'vivienda', nombre: 'Vivienda', icono: 'home-outline', color: '#f97316' },
  { id: 'trabajo', nombre: 'Trabajo', icono: 'hammer-outline', color: '#eab308' },
  { id: 'cuidados', nombre: 'Cuidados', icono: 'heart-outline', color: '#ec4899' },
  { id: 'salud', nombre: 'Salud', icono: 'medkit-outline', color: '#ef4444' },
  { id: 'educacion', nombre: 'Educación', icono: 'book-outline', color: '#3b82f6' },
  { id: 'ambiente', nombre: 'Ambiente', icono: 'leaf-outline', color: '#10b981' },
  { id: 'movilidad', nombre: 'Movilidad', icono: 'bus-outline', color: '#14b8a6' },
  { id: 'convivencia', nombre: 'Convivencia', icono: 'shield-outline', color: '#8b5cf6' },
  { id: 'cultura', nombre: 'Cultura y comunidad', icono: 'people-outline', color: '#a855f7' },
  { id: 'participacion', nombre: 'Participación', icono: 'megaphone-outline', color: '#7D5BDE' },
];

export const oficioPorId = (id: string): Oficio | null =>
  OFICIOS.find((o) => o.id === id) ?? null;

/**
 * Mapeo exhaustivo tema-de-escucha → oficio. La unión exhaustiva de TS
 * rompe la compilación si aparece un tema nuevo sin oficio.
 */
const OFICIO_POR_TEMA: Record<ListeningTheme, OficioId> = {
  food: 'alimentacion',
  housing: 'vivienda',
  work: 'trabajo',
  care: 'cuidados',
  health: 'salud',
  education: 'educacion',
  environment: 'ambiente',
  mobility: 'movilidad',
  safety: 'convivencia',
  culture: 'cultura',
  democracy: 'participacion',
};

export const oficioDeTema = (tema: ListeningTheme): OficioId =>
  OFICIO_POR_TEMA[tema];
