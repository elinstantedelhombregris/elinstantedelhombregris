import { z } from 'zod';

const texto = z.string().trim().max(2000);
const enlace = z
  .string()
  .url()
  .max(2000)
  .refine((v) => /^https?:\/\//.test(v), 'Usá un enlace http o https.');
export const detalleAlternativaSchema = z
  .object({
    beneficiarios: texto,
    afectados: texto,
    capacidades: texto,
    costo: z.number().finite().min(0).nullable(),
    costoUnidad: z.string().trim().max(120),
    fuenteCosto: enlace.nullable(),
    plazo: z.string().date().nullable(),
    efectosAdversos: texto,
    incertidumbre: texto,
    situacionActual: z.boolean(),
    referencias: z.array(enlace).max(5),
  })
  .strict()
  .refine((v) => v.costo === null || (v.costoUnidad.length > 0 && v.fuenteCosto !== null), {
    path: ['costo'],
    message: 'Para estimar un costo, indicá unidad, período y fuente; si falta, dejalo pendiente.',
  });
export type DetalleAlternativa = z.infer<typeof detalleAlternativaSchema>;
export const revisionAlternativaSchema = z
  .object({
    anteriorId: z.string().uuid(),
    objecionId: z.string().uuid(),
    motivo: z.string().trim().min(10, 'Explicá qué cambia frente a la objeción.').max(2000),
  })
  .strict();
export type RevisionAlternativa = z.infer<typeof revisionAlternativaSchema>;
