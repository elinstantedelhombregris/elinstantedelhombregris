import { z } from 'zod';

import type { SintesisFicha } from './deliberacion-ficha.js';
import type { FuenteFicha, ObjetivoFicha } from './evidencia-ficha.js';

const texto = (max: number) =>
  z.string().trim().min(10, 'Explicalo en al menos 10 caracteres.').max(max);
export const referenciaSintesisSchema = z
  .object({
    fichaId: z.string().uuid(),
    revision: z.number().int().positive(),
    objetivoId: z.string().uuid(),
    tipo: z.enum(['propuesta', 'acuerdo_participantes', 'hecho_revisado']),
    resultadoCampo: z
      .object({ id: z.number().int().positive(), revision: z.number().int().positive() })
      .strict()
      .nullable(),
    variantes: texto(2000),
    recursos: texto(2000),
    alternativas: texto(2000),
    tensiones: texto(2000),
    tarea: texto(2000),
  })
  .strict()
  .refine((r) => r.tipo !== 'hecho_revisado' || r.resultadoCampo !== null, {
    message: 'Un hecho revisado requiere un resultado de campo revisado y su versión.',
    path: ['resultadoCampo'],
  });
export const contenidoSintesisNacionalSchema = z
  .object({
    titulo: z.string().trim().min(10).max(160),
    alcance: texto(2000),
    metodo: texto(3000),
    ausencias: texto(3000),
    criterio: texto(2000),
    proximaRevision: z.string().date(),
    referencias: z.array(referenciaSintesisSchema).min(1, 'Elegí al menos un objetivo.').max(12),
  })
  .strict()
  .refine(
    (c) =>
      new Set(c.referencias.map((r) => `${r.fichaId}/${r.objetivoId}`)).size ===
      c.referencias.length,
    { message: 'No repitas un objetivo.', path: ['referencias'] },
  );
export const crearSintesisNacionalSchema = z
  .object({
    idLocal: z.string().uuid(),
    anteriorId: z.string().uuid().nullable(),
    contenido: contenidoSintesisNacionalSchema,
  })
  .strict();
export const accionSintesisNacionalSchema = z
  .object({ accion: z.enum(['revisar', 'retirar']) })
  .strict();
export type ContenidoSintesisNacional = z.infer<typeof contenidoSintesisNacionalSchema>;
export type CrearSintesisNacional = z.infer<typeof crearSintesisNacionalSchema>;
export type EstadoSintesisNacional = 'pendiente' | 'revisada' | 'requiere_revision' | 'retirada';
export interface EdicionSintesisNacional {
  id: string;
  anteriorId: string | null;
  huella: string;
  versionGeo: string;
  versionCenso: string;
  creadaEn: string;
  revisadaEn: string | null;
  autor: string;
  revisor: string | null;
  estado: EstadoSintesisNacional;
  revisionVencida: boolean;
  contenido: ContenidoSintesisNacional | null;
  apoyos: {
    fichaId: string;
    objetivoId: string;
    titulo: string;
    territorio: string | null;
    objetivo: ObjetivoFicha;
    fuentes: FuenteFicha[];
    sintesis: SintesisFicha | null;
    resultado: { titulo: string; texto: string; revision: number; nota: string | null } | null;
  }[];
  puedoRevisar: boolean;
  puedoRetirar: boolean;
  puedoDerivar: boolean;
  consultadaEn: string;
}
export interface ListaSintesisNacional {
  ediciones: EdicionSintesisNacional[];
  siguiente: string | null;
}
