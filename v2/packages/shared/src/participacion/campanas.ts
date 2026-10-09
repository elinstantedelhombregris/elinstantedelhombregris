import { z } from 'zod';

import { MAX_TEMAS } from './temas.js';

/**
 * Un texto libre con piso y techo. `donde` completa «Escribí al menos N
 * caracteres …»: por defecto «en este campo», y quien conozca el motivo de ese
 * campo lo dice con sus palabras.
 */
const frase = (min: number, max: number, donde = 'en este campo') =>
  z
    .string()
    .trim()
    .min(min, `Escribí al menos ${min === 1 ? 'un carácter' : `${min} caracteres`} ${donde}.`)
    .max(max, `El límite es ${max} caracteres.`);
/** Una fecha `AAAA-MM-DD`. Vacía o ausente, el esquema lo dice en castellano y no como «Invalid date». */
const fecha = z
  .string({ required_error: 'Elegí una fecha.', invalid_type_error: 'Elegí una fecha.' })
  .date('Elegí una fecha.');
/**
 * La campaña nacional permanente «Mi Argentina ideal». Todo aporte que no elige
 * otra campaña entra acá, para que alguien responda por él con una devolución.
 * La siembra `packages/db/scripts/seed-campana-nacional.ts` la crea con este slug.
 */
export const SLUG_CAMPANA_NACIONAL = 'mi-argentina-ideal';

export const estadosCampana = [
  'borrador',
  'programada',
  'abierta',
  'pausada',
  'en_devolucion',
  'cerrada',
] as const;
export const estadoCampanaSchema = z.enum(estadosCampana);
export const faseCampanaSchema = z
  .object({ nombre: frase(3, 100), salida: frase(8, 500), fecha })
  .strict();
export const USO_DATOS_CONTRATO_ANTERIOR =
  'Las reglas anteriores de la campaña no detallaron el uso de los datos. Los permisos elegidos por cada autor siguen vigentes; el equipo debe aclarar cualquier uso adicional antes de convocar otra edición.';
export const METODO_LECTURA_CONTRATO_ANTERIOR =
  'Las reglas anteriores de la campaña no declararon un método de lectura. Sus aportes no constituyen por sí solos un acuerdo; el equipo debe publicar cómo los interpretará y cómo podrán corregir esa lectura.';
export const contratoCampanaSchema = z
  .object({
    titulo: frase(8, 160),
    pregunta: frase(10, 500, 'para que la pregunta tenga contexto'),
    proposito: frase(20, 2500),
    territorios: z
      .array(z.number().int().positive())
      .max(50, 'Acortá este campo sin perder su sentido.'),
    temas: z
      .array(frase(2, 60))
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(MAX_TEMAS, 'Acortá este campo sin perder su sentido.'),
    participantes: frase(10, 1500),
    canales: z
      .array(z.enum(['web', 'encuentro', 'asistido']))
      .min(1, 'Este campo necesita un poco más de contexto.'),
    responsable: frase(3, 150),
    devolucion: frase(15, 1500),
    fechaDevolucion: fecha,
    efecto: frase(15, 1500),
    usoDatos: frase(20, 2500).default(USO_DATOS_CONTRATO_ANTERIOR),
    metodoLectura: frase(20, 2500).default(METODO_LECTURA_CONTRATO_ANTERIOR),
    institucion: z.string().trim().max(200, 'Acortá el nombre de la institución.').default(''),
    fases: z
      .array(faseCampanaSchema)
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(8, 'Acortá este campo sin perder su sentido.'),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (new Set(v.territorios).size !== v.territorios.length)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['territorios'],
        message: 'Un lugar alcanza una vez. Revisá los lugares repetidos.',
      });
    if (v.fases.some((f, i) => i > 0 && f.fecha < (v.fases[i - 1]?.fecha ?? '')))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fases'],
        message: 'Las fechas de las etapas deben seguir su recorrido.',
      });
    if ((v.fases.at(-1)?.fecha ?? '') > v.fechaDevolucion)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaDevolucion'],
        message: 'La devolución tiene que llegar después de las etapas previstas.',
      });
  });
export const crearCampanaSchema = z
  .object({ idLocal: z.string().uuid(), contrato: contratoCampanaSchema })
  .strict();
export const editarCampanaSchema = z
  .object({ revision: z.number().int().positive(), contrato: contratoCampanaSchema })
  .strict();
export const cambiarCampanaSchema = z
  .object({
    revision: z.number().int().positive(),
    estado: estadoCampanaSchema,
    motivo: frase(10, 1000),
  })
  .strict();
export const devolucionCampanaSchema = z
  .object({
    idLocal: z.string().uuid(),
    revision: z.number().int().positive(),
    texto: frase(30, 12000),
    limites: frase(15, 3000),
    senales: z.array(z.string().uuid()).max(100, 'Acortá este campo sin perder su sentido.'),
  })
  .strict();
export const consultaParticipacionSchema = z
  .object({
    campana: z.string().uuid().optional(),
    edicion: z.coerce.number().int().positive().optional(),
    territorio: z.coerce.number().int().positive().optional(),
    tema: frase(1, 60).optional(),
    desde: z.string().datetime().optional(),
    hasta: z.string().datetime().optional(),
    tipo: frase(1, 30).optional(),
    estado: frase(1, 30).optional(),
    cursor: z.string().uuid().optional(),
    limite: z.coerce
      .number()
      .int()
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(100, 'Acortá este campo sin perder su sentido.')
      .default(30),
  })
  .strict()
  .refine((q) => !q.edicion || Boolean(q.campana), {
    message: 'Una edición necesita su campaña.',
    path: ['edicion'],
  });
export type ContratoCampana = z.infer<typeof contratoCampanaSchema>;
export type DevolucionCampanaInput = z.infer<typeof devolucionCampanaSchema>;
export type EstadoCampana = z.infer<typeof estadoCampanaSchema>;
export type ConsultaParticipacion = z.infer<typeof consultaParticipacionSchema>;
export interface CampanaPublica {
  id: string;
  slug: string;
  revision: number;
  estado: EstadoCampana;
  contrato: ContratoCampana;
  creadaEn: string;
  actualizadaEn: string;
  puedoEditar: boolean;
  puedoInvitar?: boolean;
  puedoEditarContrato?: boolean;
  aportes: number;
  devoluciones: {
    id: string;
    edicion: number;
    texto: string;
    limites: string;
    senales: string[];
    fecha: string;
  }[];
  historial: { revision: number; estado: string; motivo: string; fecha: string }[];
}
