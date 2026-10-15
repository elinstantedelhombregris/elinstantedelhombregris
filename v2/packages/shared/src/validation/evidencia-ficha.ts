import { z } from 'zod';

import { coincideConCatalogo, referenciaCatalogoSchema } from '../datos/fuentes.js';

export const enlacePublicoSchema = z
  .string()
  .trim()
  .url('Usá un enlace completo.')
  .max(2000)
  .refine((s) => /^https?:\/\//i.test(s), 'Usá un enlace HTTP o HTTPS.');
const texto = (max: number) => z.string().trim().min(1, 'Completá este campo.').max(max);
export const fuenteFichaSchema = z
  .object({
    id: z.string().uuid(),
    titulo: texto(180),
    institucion: texto(180),
    url: enlacePublicoSchema,
    referencia: z.string().date(),
    obtenida: z.string().date(),
    unidad: texto(100),
    universo: texto(500),
    territorioId: z.number().int().positive().nullable(),
    metodo: texto(2000),
    licencia: texto(300),
    frecuencia: texto(160),
    limites: texto(2000),
    estado: z.enum(['disponible', 'no_publicado', 'no_disponible']),
    valor: z.number().finite().nullable(),
    catalogo: referenciaCatalogoSchema.optional(),
    actualizacion: z
      .object({
        estado: z.enum(['vigente', 'fallida']),
        fecha: z.string().date(),
        detalle: texto(1000),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((f, ctx) => {
    if (f.catalogo && (!coincideConCatalogo(f, f.catalogo) || f.actualizacion))
      ctx.addIssue({
        code: 'custom',
        path: ['catalogo'],
        message:
          'La referencia debe conservar el dato de esa edición. Desvinculá la referencia para adaptar la fuente.',
      });
    if ((f.estado === 'disponible') !== (f.valor !== null))
      ctx.addIssue({
        code: 'custom',
        path: ['valor'],
        message: 'Un valor disponible necesita una cifra; si falta el dato, dejá el valor vacío.',
      });
  });

export const objetivoFichaSchema = z
  .object({
    id: z.string().uuid(),
    titulo: texto(180),
    resultado: texto(2000),
    horizonte: z.string().date(),
    territorios: z.array(z.number().int().positive()).max(24),
    ambito: texto(1000),
    indicador: texto(300),
    unidad: texto(100),
    lineaBase: z.number().finite().nullable(),
    fechaBase: z.string().date().nullable(),
    meta: z.number().finite().nullable(),
    tareaPendiente: z.string().trim().max(2000),
    fuenteIds: z.array(z.string().uuid()).max(20),
    metodo: texto(2000),
    escala: z.enum(['comunitaria', 'municipal', 'provincial', 'nacional', 'entre_territorios']),
    institucionPropuesta: z.string().trim().max(300),
    competencia: z.enum(['por_validar', 'documentada']),
    fuenteCompetencia: z.string().uuid().nullable(),
    principios: z.string().trim().max(2000),
    gravedad: z.string().trim().max(2000),
    desigualdad: z.string().trim().max(2000),
    viabilidad: z.string().trim().max(2000),
  })
  .strict()
  .superRefine((o, ctx) => {
    if ((o.lineaBase === null || o.meta === null) && o.tareaPendiente.length < 10)
      ctx.addIssue({
        code: 'custom',
        path: ['tareaPendiente'],
        message: 'Si falta la base o la meta, indicá qué tarea permitirá establecerla.',
      });
    if (o.lineaBase !== null && (!o.fechaBase || !o.fuenteIds.length))
      ctx.addIssue({
        code: 'custom',
        path: ['lineaBase'],
        message: 'La línea de base necesita fecha y al menos una fuente.',
      });
    if (o.competencia === 'documentada' && (!o.fuenteCompetencia || !o.institucionPropuesta))
      ctx.addIssue({
        code: 'custom',
        path: ['fuenteCompetencia'],
        message: 'Indicá la institución y la fuente que documenta su competencia.',
      });
  });

export const cuadernoFichaSchema = z
  .object({
    fuentes: z.array(fuenteFichaSchema).max(20),
    objetivos: z.array(objetivoFichaSchema).max(12),
  })
  .strict()
  .superRefine((c, ctx) => {
    for (const campo of ['fuentes', 'objetivos'] as const)
      if (new Set(c[campo].map((v) => v.id)).size !== c[campo].length)
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: 'No repitas identificadores en el cuaderno.',
        });
    const fuentes = new Set(c.fuentes.map((f) => f.id));
    c.objetivos.forEach((o, i) => {
      if (
        o.fuenteIds.some((id) => !fuentes.has(id)) ||
        (o.fuenteCompetencia && !fuentes.has(o.fuenteCompetencia))
      )
        ctx.addIssue({
          code: 'custom',
          path: ['objetivos', i, 'fuenteIds'],
          message: 'Cada fuente del objetivo tiene que estar en este cuaderno.',
        });
    });
  });
export type FuenteFicha = z.infer<typeof fuenteFichaSchema>;
export type ObjetivoFicha = z.infer<typeof objetivoFichaSchema>;
export type CuadernoFicha = z.infer<typeof cuadernoFichaSchema>;
