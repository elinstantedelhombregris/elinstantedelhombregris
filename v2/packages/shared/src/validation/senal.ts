/**
 * El contrato único de ingesta de una señal.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §4.7 (el contrato) y §2.6 (las
 * claves con ñ y con tilde).
 *
 * ## Por qué el enum se arma así y no con `z.enum(...).transform(...)`
 *
 * `'sueño'` en NFC (`U+00F1`) y en NFD (`n` + `U+0303`) se ven idénticos en
 * pantalla y son dos strings distintos para JavaScript. Un teclado de macOS
 * emite NFD sin que nadie se entere, y un cliente iOS manda `'práctica'` con la
 * tilde combinante. La forma fácil de escribirlo —`z.enum(TIPOS_SENAL)
 * .transform((s) => s.normalize('NFC'))`— normaliza **después** de validar, o
 * sea nunca: la validación ya rechazó la palabra bien escrita con un 400.
 *
 * El orden correcto es `string → transform → pipe(enum)`, y está acá una sola
 * vez para que no haya una segunda oportunidad de escribirlo al revés.
 *
 * ## Por qué el vocabulario se importa y no se copia
 *
 * `TIPOS_SENAL` sale de `@v2/civic-core`, que no depende de red, ni de disco,
 * ni del reloj — por eso puede ser la fuente única. Copiar los nueve literales
 * acá crearía la sexta lista paralela del sistema, que es exactamente el
 * defecto que la spec §1.2 vino a cerrar.
 */
import {
  RESPUESTAS_DE_VIVIENDA,
  TIPOS_SENAL,
  claseDe,
  leerTipo,
  type RespuestaDeVivienda,
  type TipoSenal,
} from '@v2/civic-core';
import { z } from 'zod';

/** La versión del contrato. Viaja en el cuerpo para que un cliente viejo se pueda rechazar. */
export const CONTRATO_SENAL = 'basta-senal/v1';

/**
 * Un tipo del canon, normalizado ANTES de validar.
 *
 * El `pipe` es lo que hace que el orden sea correcto y no una convención que
 * la próxima edición pueda invertir sin que nada avise.
 */
export const tipoSenalSchema = z
  .string({ required_error: 'Elegí de qué estás hablando.' })
  .transform((s) => s.trim().toLowerCase().normalize('NFC'))
  .pipe(z.enum(TIPOS_SENAL as [TipoSenal, ...TipoSenal[]], {
    errorMap: () => ({ message: 'Ese no es uno de los nueve tipos.' }),
  }));

/**
 * Los campos libres también se normalizan, por otra razón.
 *
 * Acá no hay bug de igualdad: hay duplicación silenciosa. Sin esto el volcado
 * público y la búsqueda terminan con dos formas del mismo texto, que se cuentan
 * como dos cosas distintas y se leen como una sola.
 */
const libre = (max: number) =>
  z
    .string()
    .transform((s) => s.trim().normalize('NFC'))
    .pipe(z.string().max(max));

const libreOpcional = (max: number) => libre(max).nullish().transform((v) => v ?? null);

const respuestaDeViviendaSchema = z.enum(
  RESPUESTAS_DE_VIVIENDA as [RespuestaDeVivienda, ...RespuestaDeVivienda[]],
  { errorMap: () => ({ message: 'Contestá si esto habla de una casa donde vive alguien.' }) },
);

const puntoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * El cuerpo crudo, antes de las reglas que dependen del tipo.
 *
 * `origen` NO está y no puede estar: lo decide la ruta y la credencial. Si lo
 * declarara el cliente, un script se diría `campo` y lavaría spam de web como
 * si fuera terreno recorrido (spec §3.3).
 */
const cuerpoBase = z.object({
  contrato: z.literal(CONTRATO_SENAL, {
    errorMap: () => ({ message: `El contrato tiene que ser «${CONTRATO_SENAL}».` }),
  }),

  /** La idempotencia real: el outbox reintenta con el mismo id y el UNIQUE le saca la carrera. */
  idLocal: z.string().uuid('El `idLocal` tiene que ser un uuid.'),

  tipo: tipoSenalSchema,

  texto: libre(2000).pipe(z.string().min(1, 'Escribí algo, aunque sea corto.')),

  /** Sólo `práctica` y `propuesta` tienen nombre propio. */
  titulo: libreOpcional(120),

  /** Sólo `saber`: cómo lo sabés. Sin procedencia es un rumor. */
  fuente: libreOpcional(200),

  /** El nombre público del envío anónimo. Sale SIEMPRE con «sin verificar» al lado. */
  firma: libreOpcional(80),

  tema: libreOpcional(40),
  sinTema: z.boolean().default(false),

  /**
   * La cesión de licencia. **Obligatoria y explícita**: sin `true` la fila sale
   * en el volcado público sin la columna `texto`, con el motivo declarado. Un
   * default acá sería estampar una licencia que nadie firmó sobre obra ajena.
   */
  cedeLicencia: z.boolean({
    required_error: 'Falta decir si cedés la licencia del texto.',
  }),

  /**
   * La pregunta de la casa. **Obligatoria en los nueve tipos**, y sin default:
   * `sinRespuesta` es una respuesta válida del vocabulario, pero tiene que
   * llegar dicha. Es la que decide el rol y la sensibilidad de la ubicación, y
   * por lo tanto la que habilita —o no— guardar una dirección.
   */
  casa: respuestaDeViviendaSchema,

  /** Sólo se honra si `casa === 'propia'`: nadie renuncia al engrosado de un tercero. */
  aceptaEngrosado: z.boolean().default(true),

  provinceId: z.number().int().positive().nullish().transform((v) => v ?? null),
  cityId: z.number().int().positive().nullish().transform((v) => v ?? null),
  punto: puntoSchema.nullish().transform((v) => v ?? null),
  /**
   * Los seis de `LocationPrecision`, y son SEIS. `'street'` no existe: la
   * granularidad entre la manzana y el barrio se expresa con `'100m'` y
   * `'500m'`, que es lo que el engrosado produce. Un séptimo valor acá pasaría
   * el borde y moriría contra `senales_precision_chk`.
   */
  precisionPedida: z
    .enum(['exact', '100m', '500m', 'neighborhood', 'city', 'province'])
    .nullish()
    .transform((v) => v ?? null),
  calleId: z.number().int().positive().nullish().transform((v) => v ?? null),
  altura: z.number().int().min(0).max(99999).nullish().transform((v) => v ?? null),
  direccionLibre: libreOpcional(160),

  /** Sólo `acto`: la fecha que declara quien promete. */
  comprometidoPara: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha va como AAAA-MM-DD.')
    .nullish()
    .transform((v) => v ?? null),

  /**
   * Sólo `práctica`, y de un vocabulario CERRADO.
   *
   * No es texto libre por más que suene a que podría serlo: la base lo amarra
   * con `senales_periodicidad_conocida_chk`, así que un «martes y jueves 18h»
   * escrito acá pasaría la validación del borde y reventaría contra un CHECK
   * con un 500 y el nombre de un constraint adentro. El horario concreto va en
   * el `texto`, que es donde una persona lo va a leer.
   */
  periodicidad: z
    .enum(['diaria', 'semanal', 'quincenal', 'mensual', 'eventual', 'permanente'], {
      errorMap: () => ({ message: 'Elegí cada cuánto: diaria, semanal, quincenal, mensual, eventual o permanente.' }),
    })
    .nullish()
    .transform((v) => v ?? null),
  sostenidaPor: libreOpcional(120),

  /** Sólo hechos, y nunca más que la vida útil de su tipo. */
  diasDeVigencia: z.number().int().min(1).max(3650).nullish().transform((v) => v ?? null),
});

export type CuerpoDeSenal = z.infer<typeof senalSchema>;

/**
 * Las reglas que dependen del tipo.
 *
 * Van como `superRefine` y no como campos obligatorios del objeto por una razón
 * concreta: la base **también** las exige, con CHECK, y un 500 de Postgres con
 * el nombre de un constraint adentro no le dice nada a quien está escribiendo
 * en el teléfono. Cada una de estas es un CHECK de `0022_senales.sql` traducido
 * al borde, en castellano, y apuntando al campo que falta.
 */
export const senalSchema = cuerpoBase.superRefine((v, ctx) => {
  const lectura = leerTipo(v.tipo);
  if (!lectura.reconocido) return;
  const tipo = lectura.tipo;

  if (tipo === 'compromiso') {
    if (v.comprometidoPara === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comprometidoPara'],
        message: 'Un compromiso sin fecha es un sueño con otro nombre. ¿Para cuándo?',
      });
    } else {
      /**
       * Fecha pasada es 400 y no una advertencia. Un compromiso vencido al
       * nacer entra `abierto`, el cron lo barre en la primera pasada y queda
       * `no_cumplida` sin que nadie haya incumplido nada.
       *
       * Se compara contra el día en UTC y no contra el instante: quien promete
       * «para hoy» a las 23:00 en Buenos Aires no está prometiendo el pasado.
       */
      const hoy = new Date().toISOString().slice(0, 10);
      if (v.comprometidoPara < hoy) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['comprometidoPara'],
          message: 'Esa fecha ya pasó. Un compromiso vencido al nacer no es un compromiso.',
        });
      }
    }
  } else if (v.comprometidoPara !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['comprometidoPara'],
      message: 'Sólo un compromiso lleva fecha de cumplimiento.',
    });
  }

  if (tipo === 'práctica' && v.periodicidad === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['periodicidad'],
      message: 'Decí cada cuánto abre. Una práctica sin eso no se puede ir a buscar.',
    });
  }

  /**
   * `sostenidaPor` va con `periodicidad` y sólo en `práctica`: la base los
   * amarra juntos con `senales_solo_practica_tiene_periodicidad_chk`, que exige
   * los DOS en null fuera de `práctica`.
   */
  if (tipo !== 'práctica' && (v.periodicidad !== null || v.sostenidaPor !== null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['periodicidad'],
      message: 'Sólo una práctica declara cada cuánto pasa y quién la sostiene.',
    });
  }

  if (tipo === 'saber' && (v.fuente === null || v.fuente === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fuente'],
      message: 'Decí cómo lo sabés. Un saber sin procedencia es un rumor.',
    });
  }

  if (v.titulo !== null && tipo !== 'práctica' && tipo !== 'propuesta') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['titulo'],
      message: 'Sólo una práctica o una propuesta llevan nombre propio.',
    });
  }

  /**
   * La vigencia declarada es sólo de los hechos. Un `deseo` no caduca por
   * calendario —caduca cuando se cumple o se abandona, y eso lo dice la
   * deliberación, que todavía no existe—; un `acto` tiene su propia fecha; una
   * `meta` se responde.
   */
  if (v.diasDeVigencia !== null && claseDe(tipo) !== 'hecho') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['diasDeVigencia'],
      message: 'Sólo un hecho declara días de vigencia.',
    });
  }

  if (v.tema !== null && v.sinTema) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tema'],
      message: 'O le ponés tema o pedís que no le pongan. Las dos cosas no.',
    });
  }

  /** La altura sin calle es una dirección a medias que no se puede resolver. */
  if (v.altura !== null && v.calleId === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['altura'],
      message: 'Una altura sin calle no ubica nada. Elegí la calle primero.',
    });
  }

  /**
   * El rechazo del engrosado sólo lo puede pedir quien habla de su propia casa.
   * Sobre la casa de un tercero, la decisión no es de quien escribe.
   */
  if (!v.aceptaEngrosado && v.casa !== 'propia') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['aceptaEngrosado'],
      message: 'Sólo podés rechazar el engrosado sobre tu propia casa.',
    });
  }
});
