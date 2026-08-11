/**
 * El borde de `/api/v1/geo/*`.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.1, §4.2 y §4.6.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 4.
 *
 * Lo que estos esquemas defienden no es la corrección de los datos: es el COSTO
 * por request. `generalRateLimit()` guarda su estado en memoria de proceso y la
 * API corre como función serverless (ADR 0008), así que bajo concurrencia los
 * 120 req/min son por instancia y dejan de ser un límite. Entonces el techo real
 * son tres cosas, y las tres viven acá: el `limite` topeado en 50 y puesto
 * SIEMPRE aunque el cliente no mande nada, el scope obligatorio, y el mínimo de
 * caracteres por scope.
 */
import { LIMITE_MAXIMO, LIMITE_POR_DEFECTO, NIVELES_DE_LUGAR } from '@v2/db';
import { z } from 'zod';

import type { ScopeDeBusqueda } from '@v2/db';

/**
 * El `limite` de todos los listados. `.default()` va acá y no en la consulta
 * para que sea imposible escribir un endpoint que se olvide del `LIMIT`: si el
 * cliente no lo manda, el esquema lo pone igual.
 */
const limiteSchema = z.coerce
  .number({ invalid_type_error: 'El límite tiene que ser un número.' })
  .int('El límite tiene que ser un número entero.')
  .min(1, 'El límite tiene que ser al menos 1.')
  .max(LIMITE_MAXIMO, `El límite no puede pasar de ${String(LIMITE_MAXIMO)}.`)
  .default(LIMITE_POR_DEFECTO);

const idSchema = z.coerce
  .number({ invalid_type_error: 'Ese id tiene que ser un número.' })
  .int('Ese id tiene que ser un número entero.')
  .positive('Ese id tiene que ser mayor que cero.');

/** El texto crudo de la persona. Se normaliza después, con la MISMA función que escribió la columna. */
const textoSchema = z
  .string()
  .trim()
  .min(1, 'Escribí algo para buscar.')
  .max(120, 'Ese texto es demasiado largo para un nombre de calle.');

/**
 * `GET /api/v1/geo/calles?localidad=&departamento=&provincia=&q=&limite=`
 *
 * Los tres ámbitos entran como campos sueltos porque así viajan en la URL, y
 * salen convertidos en la unión discriminada `ScopeDeBusqueda`: el repositorio
 * no acepta «un id y tres booleanos», acepta un ámbito. La conversión está acá
 * —en el único lugar del sistema donde existen los tres campos a la vez— y de
 * ahí para adentro el ámbito ya no se puede olvidar ni duplicar.
 */
export const consultaDeCallesSchema = z
  .object({
    localidad: idSchema.optional(),
    departamento: idSchema.optional(),
    provincia: idSchema.optional(),
    q: textoSchema,
    limite: limiteSchema,
  })
  .superRefine((valor, ctx) => {
    const puestos = [valor.localidad, valor.departamento, valor.provincia].filter(
      (id) => id !== undefined,
    );
    if (puestos.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Decinos dónde buscar: una localidad, un departamento o una provincia.',
      });
      return;
    }
    if (puestos.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Elegí un solo ámbito: o localidad, o departamento, o provincia.',
      });
    }
  })
  .transform((valor) => ({
    scope: scopeDe(valor),
    q: valor.q,
    limite: valor.limite,
  }));

function scopeDe(valor: {
  localidad?: number | undefined;
  departamento?: number | undefined;
  provincia?: number | undefined;
}): ScopeDeBusqueda {
  if (valor.localidad !== undefined) return { ambito: 'localidad', id: valor.localidad };
  if (valor.departamento !== undefined) return { ambito: 'departamento', id: valor.departamento };
  if (valor.provincia !== undefined) return { ambito: 'provincia', id: valor.provincia };
  // Inalcanzable: el `superRefine` de arriba corta antes. Se tira en vez de
  // devolver un ámbito por defecto, porque un ámbito por defecto sería un scan
  // del país disfrazado de comodidad.
  throw new Error('scopeDe corrió sin ámbito: el superRefine dejó pasar algo que no debía');
}

export type ConsultaDeCallesQuery = z.infer<typeof consultaDeCallesSchema>;

/**
 * `GET /api/v1/geo/lugares?nivel=&padre=&municipio=&q=&limite=`
 *
 * `nivel` sale de `NIVELES_DE_LUGAR` y no de un literal escrito acá: es la
 * guarda 11 de §8.1 —«todo nivel usado en un filtro está en el CHECK»— y existe
 * porque el `level = 'city'` que este repositorio tenía devolvía cero filas sin
 * un solo error a la vista.
 *
 * Al menos un filtro es obligatorio, por la misma razón que el scope de
 * `/calles`: un listado sin filtro sobre 17.986 filas no le sirve a nadie y
 * cachearlo tampoco.
 */
export const consultaDeLugaresSchema = z
  .object({
    nivel: z
      .enum(NIVELES_DE_LUGAR, {
        errorMap: () => ({
          message: `El nivel tiene que ser uno de: ${NIVELES_DE_LUGAR.join(', ')}.`,
        }),
      })
      .optional(),
    padre: idSchema.optional(),
    municipio: idSchema.optional(),
    q: textoSchema.optional(),
    limite: limiteSchema,
  })
  .refine(
    (valor) =>
      valor.nivel !== undefined ||
      valor.padre !== undefined ||
      valor.municipio !== undefined ||
      valor.q !== undefined,
    {
      message:
        'Decinos qué lugares buscás: un nivel (por ejemplo nivel=province), un padre, un municipio o un texto.',
    },
  );

export type ConsultaDeLugaresQuery = z.infer<typeof consultaDeLugaresSchema>;

/** El id que viaja en `/calles/:id`, `/paquete/.../:id`. */
export const idDeRutaSchema = z.object({ id: idSchema });

/**
 * La corrida del catálogo, tal como la escribe el seed. Se valida la FORMA acá y
 * la EXISTENCIA en el servicio: una corrida con forma rara ni siquiera merece
 * una consulta, y una corrida bien formada que no es la vigente merece un 404
 * que lo diga.
 */
export const corridaDeRutaSchema = z.object({
  corrida: z
    .string()
    .trim()
    .min(1, 'Falta la corrida del catálogo.')
    .max(64, 'Esa corrida no tiene forma de corrida.')
    .regex(/^[A-Za-z0-9._:-]+$/, 'Esa corrida tiene caracteres que una corrida no lleva.'),
});

/**
 * `DELETE /api/v1/geo/direccion/:tabla/:id?c=<código>` — el olvido de §4.5.
 *
 * `:tabla` se valida como forma acá y contra la lista blanca en el servicio. El
 * regex es angosto a propósito: el nombre de tabla termina adentro de una
 * consulta y lo único que hay entre eso y una inyección es que el conjunto de
 * tablas posibles sea finito y esté escrito en el servidor.
 */
export const olvidoDeDireccionSchema = z.object({
  tabla: z.string().regex(/^[a-z_]{1,40}$/, 'No conocemos ese registro.'),
  id: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'Ese identificador no tiene forma de identificador.'),
});

export const codigoDeOlvidoSchema = z.object({
  c: z
    .string()
    .trim()
    .min(1, 'Falta el código que vino en tu recibo.')
    .max(128, 'Ese código no tiene forma de código.'),
});
