import { z } from 'zod';

import datos from './catalogo-fuentes.json';

const texto = z.string().trim().min(1);
export const datoCatalogoSchema = z
  .object({
    titulo: texto,
    institucion: texto,
    url: z.string().url(),
    referencia: z.string().date(),
    obtenida: z.string().date(),
    unidad: texto,
    universo: texto,
    territorioId: z.number().int().positive().nullable(),
    metodo: texto,
    licencia: texto,
    frecuencia: texto,
    limites: texto,
    estado: z.enum(['disponible', 'no_publicado', 'no_disponible']),
    valor: z.number().finite().nullable(),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.obtenida < d.referencia)
      ctx.addIssue({ code: 'custom', message: 'La consulta no puede ser anterior al dato.' });
    if (d.unidad === '%' && d.valor !== null && (d.valor < 0 || d.valor > 100))
      ctx.addIssue({ code: 'custom', message: 'El porcentaje debe estar entre cero y cien.' });
    if ((d.estado === 'disponible') !== (d.valor !== null))
      ctx.addIssue({ code: 'custom', message: 'La disponibilidad debe coincidir con el valor.' });
  });
export const catalogoFuentesSchema = z
  .object({
    version: texto,
    consultada: z.string().date(),
    publicacion: texto,
    archivoSha256: z.string().regex(/^[a-f0-9]{64}$/),
    verificacion: texto,
    indicadores: z
      .array(
        z
          .object({
            id: texto,
            tema: texto,
            personas: z.number().int().nonnegative(),
            pregunta: texto,
            dato: datoCatalogoSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (new Set(c.indicadores.map((i) => i.id)).size !== c.indicadores.length)
      ctx.addIssue({ code: 'custom', message: 'No repitas indicadores.' });
  });
export const VERSIONES_FUENTES = datos.versiones.map((v) => catalogoFuentesSchema.parse(v));
const actual = VERSIONES_FUENTES.find((v) => v.version === datos.actual);
if (!actual) throw new Error('No existe la edición activa del catálogo de fuentes.');
export const CATALOGO_FUENTES = actual;
export const referenciaCatalogoSchema = z
  .object({ version: texto.max(100), id: texto.max(100) })
  .strict();

export function datoDelCatalogo(ref: z.infer<typeof referenciaCatalogoSchema>) {
  return VERSIONES_FUENTES.find((v) => v.version === ref.version)?.indicadores.find(
    (i) => i.id === ref.id,
  )?.dato;
}

/** La referencia acredita solo el contenido exacto de esa edición. */
export function coincideConCatalogo(
  dato: z.infer<typeof datoCatalogoSchema>,
  ref: z.infer<typeof referenciaCatalogoSchema>,
) {
  const original = datoDelCatalogo(ref);
  return (
    original !== undefined &&
    (Object.keys(original) as (keyof typeof original)[]).every(
      (clave) => original[clave] === dato[clave],
    )
  );
}
