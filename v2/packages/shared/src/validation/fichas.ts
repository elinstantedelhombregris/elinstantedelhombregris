import { z } from 'zod';

export const relacionFichaSchema = z.enum(['describe', 'contradice', 'evidencia', 'capacidad']);
export const contenidoFichaSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(8, 'Poné una pregunta o título de al menos 8 caracteres.')
      .max(180),
    territorioId: z.number().int().positive().nullable(),
    temas: z.array(z.string().trim().min(1).max(60)).max(8),
    situacion: z.string().trim().max(4000),
    futuro: z.string().trim().max(4000),
    proximaTarea: z.string().trim().max(2000),
    vinculos: z
      .array(z.object({ senalId: z.string().uuid(), relacion: relacionFichaSchema }))
      .max(40),
  })
  .strict()
  .refine(
    (d) => new Set(d.vinculos.map((v) => v.senalId + ':' + v.relacion)).size === d.vinculos.length,
    {
      message: 'El mismo vínculo ya está en la ficha.',
      path: ['vinculos'],
    },
  );
export const crearFichaSchema = z
  .object({
    idLocal: z.string().uuid(),
    contenido: contenidoFichaSchema,
    aceptaPublicar: z.literal(true),
  })
  .strict();
export const editarFichaSchema = z
  .object({ revisionEsperada: z.number().int().positive(), contenido: contenidoFichaSchema })
  .strict();
export const consultaFichasSchema = z.object({
  territorioId: z.coerce.number().int().positive().optional(),
});
export const idFichaSchema = z.string().uuid();
export type ContenidoFicha = z.infer<typeof contenidoFichaSchema>;
export interface FichaFuturo {
  id: string;
  revision: number;
  contenido: ContenidoFicha;
  creadaEn: string;
  actualizadaEn: string;
  territorioNombre: string | null;
  puedoEditar: boolean;
  historial: { revision: number; fecha: string; campos: string[] }[];
  aportes: {
    senalId: string;
    relacion: z.infer<typeof relacionFichaSchema>;
    disponible: boolean;
    texto: string | null;
    estado: string | null;
  }[];
}
