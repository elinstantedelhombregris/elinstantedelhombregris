import { z } from 'zod';

const buscar = z.string().trim().max(120, 'Buscá con hasta 120 caracteres.').default('');
export const tareasDisponiblesQuerySchema = z
  .object({
    buscar,
    cursor: z.coerce.number().int().positive().optional(),
    fichaId: z.string().uuid().optional(),
  })
  .strict();
export const fichasEditablesQuerySchema = z
  .object({
    buscar,
    cursor: z.string().uuid().optional(),
  })
  .strict();

export interface TareaDisponible {
  id: number;
  titulo: string;
  alcance: string;
  recursos: string;
  fecha: string;
  iniciativaTitulo: string;
  iniciativaSlug: string;
  fichaId: string | null;
  fichaTitulo: string | null;
}
export interface FichaElegible {
  id: string;
  titulo: string;
  territorio: string | null;
}
export interface PaginaFichasEditables {
  items: FichaElegible[];
  siguiente: string | null;
}
