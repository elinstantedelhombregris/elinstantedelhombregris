/**
 * Campañas que propone cualquiera, con un paso previo: traer gente nueva a
 * imaginar el país (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 */
import type { ContratoCampana } from './campanas.js';

/** Cookie `httpOnly` que marca la llegada desde la página de una campaña. */
export const COOKIE_IMPULSO = 'basta_impulso';
/** Cuánto dura la marca de llegada. */
export const DIAS_DE_IMPULSO = 7;

export interface CampanaParaRevisar {
  id: string;
  slug: string;
  revision: number;
  contrato: ContratoCampana;
  impulsadaPor: string;
  personas: number;
  presentadaEn: string;
  /** Lo que escribieron las personas que trajo, para notar si son de verdad. */
  aportesTraidos: { id: string; texto: string; provincia: string | null }[];
}
