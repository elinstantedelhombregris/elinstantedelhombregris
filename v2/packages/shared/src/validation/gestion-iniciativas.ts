import { z } from 'zod';

const elegir = { errorMap: () => ({ message: 'Elegí una opción válida.' }) };
const texto = (min: number, max = 2000) =>
  z
    .string({ invalid_type_error: 'Completá este campo con texto.' })
    .trim()
    .min(min, `Escribí al menos ${min} caracteres.`)
    .max(max, `Usá como máximo ${max} caracteres.`);
const envio = { idLocal: z.string().uuid() };
const revision = { ...envio, revision: z.number().int().positive() };
const permiso = {
  autorizoPublicacion: z.literal(true, {
    errorMap: () => ({ message: 'Necesitamos tu autorización para publicar.' }),
  }),
};
export const paginaGestionSchema = z
  .object({ cursor: z.coerce.number().int().positive().optional() })
  .strict();
export const estadosIniciativa = [
  'open',
  'in_progress',
  'paused',
  'completed',
  'archived',
] as const;
const contenido = { titulo: texto(5, 160), resumen: texto(15), documento: texto(0, 12000) };
export const nuevaIniciativaSchema = z.object({ ...envio, ...contenido, ...permiso }).strict();
export const editarIniciativaSchema = z
  .object({ ...revision, ...contenido, estado: z.enum(estadosIniciativa, elegir), ...permiso })
  .strict();
export const equipoIniciativaSchema = z.discriminatedUnion('accion', [
  z
    .object({
      ...revision,
      accion: z.literal('rol'),
      usuario: texto(1, 80),
      rol: z.enum(['member', 'admin'], elegir),
    })
    .strict(),
  z.object({ ...revision, accion: z.literal('retirar'), usuario: texto(1, 80) }).strict(),
  z.object({ ...revision, accion: z.literal('proponer_traspaso'), usuario: texto(1, 80) }).strict(),
  z.object({ ...revision, accion: z.literal('aceptar_traspaso') }).strict(),
  z.object({ ...revision, accion: z.literal('cancelar_traspaso') }).strict(),
]);
const hito = {
  titulo: texto(5, 160),
  descripcion: texto(10),
  fecha: z.string().date('Elegí una fecha válida.'),
  ...permiso,
};
export const nuevoHitoSchema = z.object({ ...envio, ...hito }).strict();
export const editarHitoSchema = z
  .object({ ...revision, ...hito, completado: z.boolean() })
  .strict();
export const planEscuchaSchema = z
  .object({
    territorioId: z.number().int().positive().nullable(),
    zona: texto(5, 300),
    metodo: z.enum(['conversacion', 'recorrido', 'encuesta', 'fuentes'], elegir),
    canal: z.enum(['presencial', 'digital', 'mixta'], elegir),
    convocatoria: texto(15),
    unidad: texto(5, 300),
    versionUnidad: texto(1, 80),
  })
  .strict();
export type PlanEscucha = z.infer<typeof planEscuchaSchema>;
const tarea = {
  titulo: texto(5, 160),
  alcance: texto(15),
  fecha: z.string().date('Elegí una fecha válida.'),
  hitoId: z.number().int().positive().nullable(),
  recursos: texto(10),
  escucha: planEscuchaSchema.nullable(),
  ...permiso,
};
export const nuevaTareaSchema = z.object({ ...envio, ...tarea }).strict();
export const editarTareaSchema = z.object({ ...revision, ...tarea }).strict();
export const estadoTareaSchema = z
  .object({
    ...revision,
    accion: z.enum(['aceptar', 'iniciar', 'pausar', 'liberar', 'realizada', 'cancelar'], elegir),
    firma: texto(0, 120),
    nota: texto(15),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.accion === 'aceptar' && v.firma.length < 3)
      c.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firma'],
        message: 'Firmá para aceptar personalmente la responsabilidad.',
      });
  });
export const resultadoEscuchaSchema = z
  .object({
    desde: z.string().date('Elegí una fecha válida.'),
    hasta: z.string().date('Elegí una fecha válida.'),
    observaciones: z
      .number({ invalid_type_error: 'Escribí el número de observaciones.' })
      .int('Usá un número entero.')
      .min(0, 'El número no puede ser negativo.')
      .max(1000000, 'Revisá el número de observaciones.'),
    ausencias: texto(10),
    limites: texto(15),
    proximoPaso: texto(10),
  })
  .strict()
  .refine((r) => r.desde <= r.hasta, 'La fecha final debe ser posterior o igual a la inicial.');
export type ResultadoEscucha = z.infer<typeof resultadoEscuchaSchema>;
export const evidenciaTareaSchema = z
  .object({
    ...envio,
    titulo: texto(5, 160),
    texto: texto(20, 4000),
    url: z
      .string()
      .url('Ingresá un enlace válido.')
      .max(1500)
      .refine((s) => /^https?:\/\//.test(s), 'Usá un enlace HTTP o HTTPS.')
      .nullable(),
    resultadoEscucha: resultadoEscuchaSchema.nullable(),
    ...permiso,
  })
  .strict();
export const revisarEvidenciaSchema = z
  .object({
    ...revision,
    accion: z.enum(['revisar', 'retirar'], elegir),
    firma: texto(0, 120),
    nota: texto(15),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.accion === 'revisar' && v.firma.length < 3)
      c.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firma'],
        message: 'Firmá la revisión y explicá sus límites.',
      });
  });
export const escuchaQuerySchema = paginaGestionSchema
  .extend({
    territorioId: z.coerce.number().int().positive().optional(),
    estado: z.enum(['pendiente', 'realizada'], elegir).optional(),
  })
  .strict();

export type NuevaIniciativa = z.infer<typeof nuevaIniciativaSchema>;
export type EditarIniciativa = z.infer<typeof editarIniciativaSchema>;
export type EquipoIniciativa = z.infer<typeof equipoIniciativaSchema>;
export type NuevoHito = z.infer<typeof nuevoHitoSchema>;
export type EditarHito = z.infer<typeof editarHitoSchema>;
export type NuevaTarea = z.infer<typeof nuevaTareaSchema>;
export type EditarTarea = z.infer<typeof editarTareaSchema>;
export type EstadoTarea = z.infer<typeof estadoTareaSchema>;
export type EvidenciaTareaInput = z.infer<typeof evidenciaTareaSchema>;
export type RevisarEvidencia = z.infer<typeof revisarEvidenciaSchema>;

export const tareasQuerySchema = paginaGestionSchema
  .extend({ tareaId: z.coerce.number().int().positive().optional() })
  .strict();
