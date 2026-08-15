/**
 * Los parámetros de lectura.
 *
 * El contrato de ESCRITURA no está acá: vive en `@v2/shared` (`validation/
 * senal.ts`), porque la web y el móvil lo comparten y una segunda copia sería
 * la sexta lista paralela del sistema. Acá quedan sólo los filtros de consulta,
 * que son de la API y de nadie más.
 */
import { CLASES_SENAL, METODOS, PROXIMIDADES, TIPOS_SENAL, VEREDICTOS } from '@v2/civic-core';
import { z } from 'zod';

/** `?clases=hecho,acto` → `['hecho','acto']`. Vacío es «todas». */
const listaSeparadaPorComas = (validos: readonly string[]) =>
  z
    .string()
    .optional()
    .transform((s) =>
      s === undefined || s.trim() === ''
        ? []
        : s
            .split(',')
            .map((x) => x.trim().toLowerCase().normalize('NFC'))
            .filter((x) => validos.includes(x)),
    );

export const consultaDeSenalesSchema = z.object({
  clases: listaSeparadaPorComas(CLASES_SENAL),
  tipos: listaSeparadaPorComas(TIPOS_SENAL),
  provinceId: z.coerce.number().int().positive().optional(),
  /** El mapa sólo puede dibujar lo que tiene coordenada. */
  soloConPunto: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  /**
   * El techo real lo pone el repositorio (500). Acá se acota igual para que un
   * `?limite=abc` sea un 400 con nombre y no un `NaN` que el repositorio
   * termine leyendo como «el default».
   */
  limite: z.coerce.number().int().min(1).max(500).default(100),
});

export type ConsultaDeSenales = z.infer<typeof consultaDeSenalesSchema>;

/** El cuerpo de «esta señal responde esa pregunta». */
export const respuestaSchema = z.object({
  /** El id público del HECHO que contesta. La pregunta va en la ruta. */
  senalId: z.string().uuid('El `senalId` tiene que ser el id público de una señal.'),
});

/**
 * El cuerpo de una confirmación — «sí, está», y desde dónde.
 *
 * Los tres vocabularios se importan del núcleo y no se copian: son los mismos
 * que la app de campo ya tenía escritos y los mismos que los CHECK de la tabla
 * hacen cumplir. Una cuarta copia acá sería la que diverge.
 */
export const confirmacionSchema = z
  .object({
    veredicto: z.enum(VEREDICTOS as [string, ...string[]], {
      errorMap: () => ({ message: 'Ese no es uno de los seis veredictos.' }),
    }),
    metodo: z.enum(METODOS as [string, ...string[]], {
      errorMap: () => ({ message: 'Decí cómo lo sabés: lo viste, conocés el lugar, chequeaste una fuente, fuiste, o no podés.' }),
    }),
    /** Categoría, nunca un punto. La declara quien confirma y el servidor no la atesta. */
    proximidad: z.enum(PROXIMIDADES as [string, ...string[]]).default('sin_declarar'),
    /** Sólo con `correct`: qué habría que corregir. */
    nota: z.string().trim().max(280).nullish().transform((v) => v ?? null),
  })
  .superRefine((v, ctx) => {
    // El mismo par imposible que el CHECK cruzado impide, dicho en castellano
    // antes de que Postgres lo diga con el nombre de un constraint.
    if ((v.metodo === 'cannot_verify') !== (v.veredicto === 'cannot_verify')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metodo'],
        message: 'No se puede confirmar algo y a la vez decir que no tenés cómo comprobarlo.',
      });
    }
    if (v.nota !== null && v.veredicto !== 'correct') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nota'],
        message: 'La nota es para corregir. En los otros veredictos no hay nada que corregir.',
      });
    }
  });
