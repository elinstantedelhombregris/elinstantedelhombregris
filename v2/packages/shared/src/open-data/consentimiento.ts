/**
 * El consentimiento y la cesión de licencia — una sola redacción, un solo archivo.
 *
 * Spec: `docs/specs/2026-08-11-d-el-registro-publico.md` §2.8 (las dos
 * licencias), §2.9 (la deliberación que todavía no existe) y §7.2.4 (el
 * consentimiento antes del submit).
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 10.
 *
 * ## Por qué existe este archivo
 *
 * Tres specs escribieron tres textos distintos para el mismo acto: B §2.9 la
 * línea del actor, C §2.2 otra para lo mismo, y D §7.3.4 una tercera sobre
 * publicación e irrevocabilidad. Tres pantallas antes del mismo submit es la
 * manera de que ninguna se lea, y dos redacciones del mismo permiso que pueden
 * divergir van a divergir. Se unifican acá y todo el resto las importa.
 *
 * **Cualquier copia literal de estos textos en otro archivo es un bug**, y hay
 * una guarda que lo verifica: `__tests__/consentimiento.test.ts` recorre el
 * código de las apps buscando fragmentos escritos a mano y falla nombrando el
 * archivo. Si necesitás el texto en otra superficie, importalo.
 *
 * ## La promesa legal que sostiene
 *
 * El proyecto es **custodio, no titular**. La compilación —conteos, cobertura,
 * geografía, la estructura del archivo— es obra suya y la puede licenciar. El
 * texto de cada señal lo escribió una persona, y **un custodio no puede
 * licenciar obra ajena**: la columna `texto` sale bajo CC BY 4.0 sólo para las
 * filas cuya autora cedió esa licencia en el momento del envío. Sin cesión la
 * fila sale igual —sirve para cobertura, geografía y conteos— pero **sin
 * `texto`**, y con el motivo declarado en vez de un `null` mudo.
 *
 * Salir con menos es preferible a estampar una licencia inventada sobre un
 * archivo con sha256 y retención perpetua.
 *
 * ## Comprensible, no jurídico
 *
 * La regla 9 de `apps/mobile/docs/PRODUCT_CONSTITUTION.md` pide consentimiento
 * comprensible y revocable. **Un texto que nadie entiende no es
 * consentimiento**: por eso estos cuatro están en castellano rioplatense, en
 * segunda persona, y dicen qué pasa con lo que escribís — no qué cláusula
 * aceptás. Si alguna reescritura futura los vuelve más precisos y menos
 * legibles, está rompiendo la regla que vino a cumplir.
 */

/* -------------------------------------------------------------------------- */
/*  Los cuatro textos                                                          */
/* -------------------------------------------------------------------------- */

/**
 * El actor: por qué se guarda algo en el navegador.
 *
 * Va pegada a los DOS botones que crean un actor —el de enviar una señal y el
 * «Yo también»— y a la cola del outbox del móvil. Una sola redacción para las
 * tres superficies porque es la misma acción en las tres.
 */
export const TEXTO_CONSENTIMIENTO_ACTOR =
  'Para contar personas y no clicks, guardamos un identificador al azar en este ' +
  'navegador. No lleva tu nombre, dura un año, y lo podés borrar cuando quieras.';

/**
 * La cesión de licencia sobre el texto propio.
 *
 * Es la única puerta por la que la columna `texto` puede salir en el volcado
 * público. Sin la marca en la fila, el volcado la publica **sin `texto`** y con
 * {@link MOTIVO_TEXTO_OMITIDO} en su lugar — ver {@link textoPublicable}.
 */
export const TEXTO_CESION_LICENCIA =
  'Lo que escribas se publica bajo CC BY 4.0: cualquiera lo puede citar y reusar ' +
  'diciendo de dónde salió. Si no querés, se publica todo lo demás y el texto no.';

/**
 * La irrevocabilidad hacia atrás, dicha antes y no después.
 *
 * Retirar una señal la saca de la API en el acto y de todo corte posterior; lo
 * que ya salió en un corte mensual publicado no vuelve, porque quien lo bajó ya
 * lo tiene. Eso es una decisión a la vista, no un default heredado, y por eso
 * se lee **antes** del envío y no sólo en `PROCEDENCIA.md`, que lo lee quien
 * baja el archivo y no quien escribe la señal.
 */
export const TEXTO_PUBLICACION_IRREVOCABLE =
  'Esto entra a un registro público que se descarga entero en un archivo. Podés ' +
  'retirarlo cuando quieras y desaparece en menos de 24 horas — menos de los ' +
  'archivos mensuales que ya se publicaron, que quien los bajó ya los tiene.';

/**
 * Los tipos de la clase `deseo`, para llavear {@link DECLARACION_DELIBERACION}.
 *
 * **Esto debería salir de `@v2/civic-core` y hoy no puede.** El plan (Task 10,
 * Step 1b) pide `satisfies Record<TipoDeseo, string>` con `TipoDeseo` importado
 * del vocabulario, y ahí se traba por dos motivos, ninguno de los cuales se
 * arregla desde este paquete:
 *
 * 1. `TipoDeseo` **no existe** en `packages/civic-core/src/senal/vocabulario.ts`.
 *    El vocabulario exporta `TipoSenal`, `ClaseSenal`, `CLASE_DE_TIPO` y
 *    `TIPOS_POR_CLASE`, pero ningún alias por clase.
 * 2. Aunque existiera, no se puede derivar por tipos: `CLASE_DE_TIPO` está
 *    anotado `Readonly<Record<TipoSenal, ClaseSenal>>`, así que para el
 *    compilador cada entrada es `ClaseSenal` y no su literal — un
 *    `{ [T in TipoSenal]: CLASE_DE_TIPO[T] extends 'deseo' ? T : never }` da
 *    los nueve tipos, no dos.
 *
 * Y además `@v2/shared` todavía no declara a `@v2/civic-core` entre sus
 * dependencias, con lo cual el import no resolvería.
 *
 * Así que la exhaustividad **no la garantiza el compilador sino el test**:
 * `consentimiento.test.ts` lee `vocabulario.ts` del disco, extrae los tipos de
 * clase `deseo` y falla si no son exactamente las claves de esta constante. Un
 * décimo tipo `deseo` rompe la suite en vez de salir a producción sin frase.
 *
 * No se exporta a propósito: el día que `TipoDeseo` viva en el vocabulario,
 * esta línea se borra y nadie tiene que ir a desengancharla de los consumidores.
 */
type ClaveDeseo = 'sueño' | 'propuesta';

/**
 * Lo que el registro todavía no sabe hacer, dicho por el registro.
 *
 * La mitad deliberativa de la regla 11 no tiene mecanismo (D-037) y el producto
 * lo dice en vez de disimularlo. Va en la superficie de TODA señal de clase
 * `deseo` —`sueño` y `propuesta`—, en el cuerpo de los 410 de las rutas
 * retiradas y en `PROCEDENCIA.md`.
 *
 * Las tres frases del medio no son relleno: dicen qué **no** es una adhesión,
 * que es lo único que evita que «yo también» se lea como voto. Y «lo estamos
 * construyendo» va al final y no al principio a propósito — lo primero que se
 * lee es la limitación, no el consuelo. Si algún día se decide que la
 * deliberación no se construye, esa frase se saca y las anteriores siguen
 * siendo verdad.
 */
export const DECLARACION_DELIBERACION = {
  sueño:
    'Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones ' +
    '—«yo también»—, y eso no es una votación ni un acuerdo: nadie está midiendo ' +
    'quién gana. Lo estamos construyendo.',
  propuesta:
    'Todavía no se puede deliberar. Esta propuesta sólo recibe adhesiones ' +
    '—«yo también»—: nadie está votando, y una adhesión no la aprueba ni la ' +
    'rechaza. Lo estamos construyendo.',
} as const satisfies Record<ClaveDeseo, string>;

const DECLARACION_POR_TIPO: ReadonlyMap<string, string> = new Map(
  Object.entries(DECLARACION_DELIBERACION).map(([tipo, frase]) => [tipo.normalize('NFC'), frase]),
);

/**
 * La declaración que le toca a un tipo de señal, o `null` si no le toca ninguna.
 *
 * Existe para que ningún consumidor tenga que escribir su propio `switch` sobre
 * el tipo: un `switch` en la web y otro en la API es cómo se vuelve a tener dos
 * clasificaciones que pueden divergir. Recibe `string` y no `TipoSenal` porque
 * este paquete no ve el vocabulario; devolver `null` para lo que no es `deseo`
 * es la respuesta correcta y no un descarte.
 *
 * Normaliza a NFC: `'sueño'` con la `ñ` precompuesta y con la tilde combinante
 * son la misma palabra en pantalla y dos strings distintos para JavaScript.
 */
export function declaracionDeliberacionDe(tipo: string): string | null {
  return DECLARACION_POR_TIPO.get(tipo.trim().normalize('NFC')) ?? null;
}

/**
 * Los cuatro, en el orden en que se leen antes de enviar.
 *
 * La superficie de carga los muestra en este orden y no en otro: primero qué se
 * guarda de vos, después qué pasa con lo que escribiste, y al final que el
 * archivo ya publicado no se puede despublicar. De lo reversible a lo
 * irreversible, para que lo último que se lea sea lo que menos se deshace.
 */
export const CONSENTIMIENTO_ANTES_DE_ENVIAR: readonly string[] = [
  TEXTO_CONSENTIMIENTO_ACTOR,
  TEXTO_CESION_LICENCIA,
  TEXTO_PUBLICACION_IRREVOCABLE,
];

/* -------------------------------------------------------------------------- */
/*  Las dos licencias                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Las dos licencias del registro, porque son dos cosas.
 *
 * El catálogo viejo decía `CC0` para todo (`datasets/index.ts`). CC0 renuncia a
 * la atribución, y la atribución es lo único que le permite a quien lea un
 * número publicado volver a la fuente y ver con qué cobertura se midió. Un
 * número de participación sin trazabilidad a su cobertura es exactamente el mal
 * uso que la regla 5 existe para impedir.
 *
 * Viaja en el campo `licencia` del sobre de la API y lo imprime `/esquema`.
 */
export const LICENCIAS = {
  /**
   * Lo que el proyecto sí puede otorgar: conteos, cobertura, geografía, tipos,
   * clases, estados, procedencia y la estructura del archivo. Es obra suya.
   */
  compilacion: {
    id: 'CC-BY-4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/deed.es',
    atribucion: '¡BASTA! — El Instante del Hombre Gris',
  },
  /**
   * Lo que el proyecto **no** puede otorgar por su cuenta: el texto de cada
   * señal. La licencia la da quien escribió, señal por señal, y las filas sin
   * cesión salen sin la columna.
   */
  textos: {
    id: 'CC-BY-4.0',
    otorgadaPor: 'quien escribió cada señal',
    nota: 'Sólo las filas con cesión traen `texto`; las demás traen `textoOmitido`.',
  },
} as const;

/**
 * El motivo declarado cuando la fila sale sin `texto`.
 *
 * Dominio cerrado de uno, por ahora. Es la diferencia entre «acá no hay nada» y
 * «acá hay algo que no nos toca publicar»: un `texto: null` pelado hace que
 * quien baja el archivo cuente una fila vacía como una persona que no dijo
 * nada, y eso ya sesgó todo lo que calcule después.
 */
export const MOTIVO_TEXTO_OMITIDO = 'sin cesión de licencia';

/** Lo que sale por las dos columnas de texto de una fila publicable. */
export interface TextoPublicable {
  /** El texto tal cual lo escribió su autora, o `null` si no hay cesión. */
  texto: string | null;
  /** Por qué no hay texto, cuando no lo hay. `null` cuando sí lo hay. */
  textoOmitido: string | null;
}

/**
 * La regla de §2.8, ejecutable en vez de comentada.
 *
 * Existe para que el serializador del volcado no vuelva a derivar la condición:
 * un `fila.cesionLicencia ? fila.texto : null` escrito a mano en cada
 * serializador es la manera de que uno de los tres formatos publique el texto
 * de alguien que no lo cedió. Los dos campos nunca vienen los dos llenos: o
 * sale el texto, o sale el motivo por el que no sale.
 *
 * Una fila con cesión pero sin texto —la señal era sólo un punto en el mapa—
 * sale con los dos en `null`: no hay texto y tampoco hay nada omitido. Decir
 * «sin cesión de licencia» ahí sería declarar un motivo falso.
 */
export function textoPublicable(fila: {
  texto: string | null;
  cesionLicencia: boolean;
}): TextoPublicable {
  if (!fila.cesionLicencia) {
    return { texto: null, textoOmitido: MOTIVO_TEXTO_OMITIDO };
  }
  return { texto: fila.texto, textoOmitido: null };
}
