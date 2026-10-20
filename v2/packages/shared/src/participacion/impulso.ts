/**
 * Campañas que propone cualquiera, con un paso previo: traer gente nueva a
 * imaginar el país (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 */
import type { ContratoCampana, EstadoCampana } from './campanas.js';

/** Cookie `httpOnly` que marca la llegada desde la página de una campaña. */
export const COOKIE_IMPULSO = 'basta_impulso';
/** Cuánto dura la marca de llegada. */
export const DIAS_DE_IMPULSO = 7;

type Pasos = Readonly<Partial<Record<EstadoCampana, readonly EstadoCampana[]>>>;

/**
 * Los pasos que da quien impulsa una campaña sin ser de la administración. Son
 * un subconjunto de `PASOS` (`apps/api/src/features/campanas/routes.ts`), que
 * sigue siendo el recorrido completo: presentar y retirar mientras junta gente
 * y, ya abierta, coordinarla. Abrir o programar no lo hace nunca; volver a
 * abrir una campaña pausada, sí.
 */
export const PASOS_DE_QUIEN_IMPULSA: Pasos = {
  borrador: ['reuniendo'],
  reuniendo: ['borrador'],
  abierta: ['pausada', 'en_devolucion'],
  pausada: ['abierta', 'en_devolucion'],
  en_devolucion: ['cerrada'],
};

/**
 * Lo único que la administración hace sobre una campaña que no es suya: decidir
 * una propuesta revisada (abrirla, programarla o devolverla con un motivo) y
 * abrir o pausar la que programó. El resto de la campaña es de quien la impulsa.
 */
export const PASOS_DE_LA_REVISION: Pasos = {
  por_revisar: ['abierta', 'programada', 'reuniendo'],
  programada: ['abierta', 'pausada'],
};

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
