import { z } from 'zod';

import { enlacePublicoSchema } from './evidencia-ficha.js';

const texto = (max: number) =>
  z.string().trim().min(10, 'Explicalo en al menos 10 caracteres.').max(max);
export const procesoFichaSchema = z
  .object({
    pregunta: texto(500),
    ambito: texto(1000),
    convocatoria: texto(2000),
    facilitacion: z.string().trim().min(3).max(200),
    inicio: z.string().date(),
    cierre: z.string().date(),
    reglas: texto(3000),
    metodoCierre: texto(2000),
    moderacion: texto(2000),
    apelacion: texto(1000),
  })
  .strict()
  .refine((p) => p.cierre >= p.inicio, {
    path: ['cierre'],
    message: 'El cierre no puede ser anterior al inicio.',
  });
export const sintesisFichaSchema = z
  .object({
    estado: z.enum(['borrador', 'publicada']),
    firma: z.string().trim().min(3).max(120),
    alcance: texto(1000),
    participacion: texto(2000),
    ausencias: texto(2000),
    acuerdos: z
      .array(
        z
          .object({ texto: texto(2000), argumentoIds: z.array(z.string().uuid()).min(1).max(20) })
          .strict(),
      )
      .max(20),
    disensos: texto(4000),
    proximaRevision: z.string().date(),
  })
  .strict();
export const argumentoFichaSchema = z
  .object({
    idLocal: z.string().uuid(),
    tipo: z.enum(['argumento', 'objecion', 'evidencia', 'respuesta']),
    texto: texto(3000),
    firma: z.string().trim().min(3).max(120),
    respondeA: z.string().uuid().nullable(),
    alternativaId: z.string().uuid().nullable(),
    fuenteIds: z.array(z.string().uuid()).max(10),
  })
  .strict()
  .refine((a) => a.tipo !== 'respuesta' || a.respondeA !== null, {
    path: ['respondeA'],
    message: 'Elegí el argumento al que respondés.',
  });
export const retirarArgumentoSchema = z
  .object({
    motivo: z.enum(['autoria', 'datos_personales', 'agresion', 'fuera_de_alcance']),
  })
  .strict();
export const relacionEntreFichasSchema = z
  .object({
    idLocal: z.string().uuid(),
    destinoId: z.string().uuid(),
    tipo: z.enum(['objetivo_compartido', 'complementa', 'depende', 'tension', 'hipotesis_causal']),
    justificacion: texto(2000),
    fuente: enlacePublicoSchema.nullable(),
  })
  .strict()
  .refine((r) => r.tipo !== 'hipotesis_causal' || r.fuente !== null, {
    path: ['fuente'],
    message: 'Una hipótesis causal necesita su fuente.',
  });
export interface ArgumentoFicha {
  id: string;
  tipo: string;
  texto: string | null;
  firma: string | null;
  fecha: string;
  respondeA: string | null;
  alternativaId: string | null;
  fuenteIds: string[];
  esMio: boolean;
  retirado: boolean;
  motivo: string | null;
  puedoRetirar: boolean;
}
export interface LecturaDeliberacion {
  argumentos: ArgumentoFicha[];
  total: number;
  participantes: number;
  completa: boolean;
}
export interface RelacionEntreFichas {
  id: string;
  origenId: string;
  origenTitulo: string;
  destinoId: string;
  destinoTitulo: string;
  tipo: z.infer<typeof relacionEntreFichasSchema>['tipo'];
  justificacion: string;
  fuente: string | null;
  puedoRetirar: boolean;
}
export const consultaVisionSchema = z.object({
  despues: z.string().uuid().optional(),
  territorioId: z.coerce.number().int().positive().optional(),
});
export interface VisionCompartida {
  fichas: {
    id: string;
    titulo: string;
    revision: number;
    territorio: string | null;
    futuro: string;
    proximaTarea: string;
    objetivos: {
      id: string;
      titulo: string;
      resultado: string;
      escala: string;
      horizonte: string;
    }[];
    fuentes: number;
    sintesis: string | null;
  }[];
  total: number;
  territorios: number;
  objetivos: number;
  siguiente: string | null;
  fecha: string;
}
export type ProcesoFicha = z.infer<typeof procesoFichaSchema>;
export type SintesisFicha = z.infer<typeof sintesisFichaSchema>;
