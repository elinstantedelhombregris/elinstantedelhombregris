import { z } from 'zod';

export const vincularEjecucionSchema = z
  .object({
    idLocal: z.string().uuid(),
    revision: z.number().int().positive(),
    iniciativa: z.discriminatedUnion('tipo', [
      z
        .object({
          tipo: z.literal('existente'),
          slug: z
            .string()
            .trim()
            .min(1)
            .max(200)
            .regex(/^[a-z0-9-]+$/),
        })
        .strict(),
      z
        .object({
          tipo: z.literal('nueva'),
          titulo: z.string().trim().min(5, 'Poné un nombre de al menos 5 caracteres.').max(160),
          resumen: z
            .string()
            .trim()
            .min(15, 'Describí el propósito en al menos 15 caracteres.')
            .max(2000),
        })
        .strict(),
    ]),
    hito: z
      .string()
      .trim()
      .min(10, 'Describí qué van a revisar, en al menos 10 caracteres.')
      .max(160),
    recursos: z
      .string()
      .trim()
      .min(15, 'Indicá recursos disponibles y pendientes, en al menos 15 caracteres.')
      .max(2000),
    autorizoPublicacion: z.literal(true),
  })
  .strict();

export type VincularEjecucion = z.infer<typeof vincularEjecucionSchema>;
export const accionesIniciativaQuerySchema = z
  .object({
    cursor: z.coerce.number().int().positive().optional(),
  })
  .strict();

export interface EjecucionPrueba {
  iniciativa: { slug: string; titulo: string };
  tareaId: number;
  estadoTarea: 'todo' | 'in_progress' | 'done' | 'blocked';
  hito: string;
  revisionRealizada: boolean;
  recursos: string;
}

export interface AccionIniciativa extends EjecucionPrueba {
  pruebaId: string;
  fichaId: string;
  alternativaId: string;
  titulo: string;
  alcance: string;
  plazo: string;
  estado:
    | 'propuesta'
    | 'aceptada'
    | 'en_curso'
    | 'pausada'
    | 'implementada'
    | 'resultado_observado'
    | 'resultado_revisado';
  responsableNombre: string | null;
}
export interface PaginaAccionesIniciativa {
  items: AccionIniciativa[];
  siguiente: number | null;
}
