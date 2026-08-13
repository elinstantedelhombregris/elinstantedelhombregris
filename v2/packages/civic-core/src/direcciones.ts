/**
 * La dirección de una señal: hasta dónde se pudo verificar contra el catálogo
 * del Estado, y qué parte de ella se puede publicar.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §2.5, §2.6, §4.5 y §6.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 2.
 *
 * Tres reglas gobiernan todo lo que sigue.
 *
 * **La primera: lo que se guarda es lo PUBLICABLE.** Lo que §2.6 no deja
 * publicar no se guarda —igual que el punto crudo— y tampoco se marca como
 * reservado: un estado que dijera «hay una altura que no te muestro» filtraría
 * que el registro es preciso y está protegido, que es justo lo que hay que no
 * decir.
 *
 * **La segunda: el estado de una dirección es una afirmación sobre el
 * CATÁLOGO, nunca sobre la señal.** Por eso el valor se llama `altura_en_rango`
 * y no `altura_confirmada`: conseguirlo cuesta cero —cualquiera elige una calle
 * con rango publicado y escribe un número adentro— y no prueba presencia, ni
 * existencia del domicilio, ni nada sobre lo que la señal dice. Ninguna
 * etiqueta derivada de acá puede usar «confirmada», «confirmado» ni
 * «verificada» (reglas 4 y 11 de la Constitución), porque va a convivir en
 * pantalla con el chip de estado de la señal y confundirlos sería fusionar «la
 * altura no cayó en el rango» con «nadie corroboró esto».
 *
 * **La tercera: el orden de composición va numerado y no se puede invertir**
 * (§4.5). La ingesta única —`b-la-senal.md` §4.7, Task 13 del plan— hace:
 *   1. `resolverUbicacion` → la jerarquía y su origen;
 *   2. `prepareRecordLocation` SIN `locationLabel` → punto publicado + precisión;
 *   3. `ubicacionPublicable(...)` → la dirección y la jerarquía ya degradadas;
 *   4. `componerDireccion(...)` SOBRE LO QUE SALIÓ DEL PASO 3 → `direccion_texto`;
 *   5. `normalizedLocationLabel(direccionTexto)` → la etiqueta de la fila.
 * Componer antes de degradar deja una fila con `altura IS NULL` y con
 * «AV JOSE MARIA MORENO 1450» adentro de `direccion_texto`, que sale por la API
 * pública y por el volcado. Ningún CHECK lo caza —`direccion_texto` es texto
 * libre con tope de largo—, así que es la única parte de §2.6 que la base no
 * puede defender sola.
 *
 * **Y la defensa de acá tampoco es de forma.** Este comentario decía que
 * `componerDireccion` sólo acepta un `DireccionEstado` y que el único que
 * produce uno es `ubicacionPublicable`; es falso, y prometer una garantía que
 * no existe sobre la única invariante que la base no defiende es peor que no
 * prometer nada. `DireccionEstado` es una unión de literales de string:
 * `componerDireccion({ estado: 'altura_en_rango', altura: 1450, … })` escrito a
 * mano compila, y en este mismo módulo hay un segundo productor de esos
 * literales (`direccionOlvidada`). Lo que hay es más chico y es cierto: **la
 * secuencia está documentada acá y fijada por un test** —«la secuencia de §4.5,
 * que el compilador no impide», en `direcciones.test.ts`—, que compone en los
 * dos órdenes y muestra qué sale de cada uno.
 *
 * Marcar el tipo de verdad —un *branded type* que sólo `ubicacionPublicable`
 * pudiera acuñar— se evaluó y se descartó por dos razones. La primera: la marca
 * cubriría `estado` y `altura` y no `nombreCalle` ni `textoLibre`, que entran
 * por separado porque el nombre de la calle se busca en el catálogo ENTRE el
 * paso 3 y el 4 — o sea que «el error es inexpresable» seguiría siendo una
 * frase más grande que el código, que es exactamente el defecto que se está
 * arreglando. La segunda: `DireccionEstado` es también el vocabulario de la
 * COLUMNA, y una fila leída de la base trae un string sin marca; acuñarla en el
 * borde de lectura volvería a hacer falsa la promesa, y ahí sería mucho más
 * difícil de ver que en un comentario.
 *
 * Módulo puro: sin red, sin disco, sin reloj. La lista de categorías de calle
 * entra por parámetro porque civic-core no lee la base.
 */

import { TOPE_DE_ETIQUETA, normalizedLocationLabel } from './location-policy.js';

import type { PublishedPrecisionResult } from './location-policy.js';
import type { TipoSenal } from './senal/vocabulario.js';
import type { CivicSensitivity, LocationRole } from './types.js';

// ---------------------------------------------------------------------------
// Normalización de nombres
// ---------------------------------------------------------------------------

/** Los diacríticos combinantes que deja NFD. Escapados: son invisibles. */
const MARCAS_COMBINANTES = /[\u0300-\u036f]/g;

/**
 * Todo lo que no sea alfanumérico o espacio. Se elimina, y por eso `%` y `_`
 * desaparecen antes de tocar cualquier `LIKE`: el saneamiento no es un escape
 * en el borde de la consulta, es una propiedad del texto normalizado.
 *
 * Se elimina y no se reemplaza por espacio, así que `O'HIGGINS` da `OHIGGINS`.
 * Es asimétrico contra un usuario que escriba el apóstrofo y el catálogo no,
 * pero la simetría que importa —guarda 7— es que los dos lados corran ESTA
 * función: la única forma de encontrar menos filas en una provincia que en otra
 * es que haya dos normalizadores, que es cómo vuelve la D-012.
 */
const NO_ALFANUMERICO = /[^0-9A-Za-z\s]/g;

const ESPACIOS = /\s+/g;

/**
 * El nombre de un lugar, listo para comparar. Lo escribe el seed en
 * `geographic_locations.name_norm` y lo usa la consulta que busca por nombre:
 * la MISMA función de los dos lados (§3.1).
 */
export const normalizarNombreDeLugar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(MARCAS_COMBINANTES, '')
    .replace(NO_ALFANUMERICO, '')
    .toUpperCase()
    .replace(ESPACIOS, ' ')
    .trim();

/**
 * El nombre de una calle, listo para comparar, sin su categoría adelante.
 *
 * Georef es inconsistente: `"AV JOSE MARIA MORENO"` trae `categoria: "AV"` y
 * repite el prefijo en el nombre; `"FARADAY"` trae `categoria: "CALLE"` y no lo
 * repite. Por eso se guarda `nombre_norm` sin prefijo y se le saca el prefijo
 * también a lo que escribe la persona: así «MORENO», «JOSE MARIA» y «AV JOSE»
 * encuentran la misma calle.
 *
 * Los dos lados no reciben el mismo segundo argumento, y es deliberado (§3.3):
 * el seed pasa `[fila.categoria]` —la tabla de categorías se llena a medida que
 * el seed avanza, así que leerla sería normalizar las primeras provincias
 * contra una lista incompleta— y la consulta pasa la lista entera, porque
 * todavía no sabe de qué calle está hablando. La guarda 7 afirma que el
 * resultado coincide igual.
 *
 * El corte es por **token completo**: `AVELLANEDA` con categoría `AV` sigue
 * siendo `AVELLANEDA`. Y no se corta si cortar dejaría el resultado vacío, que
 * es el caso de una calle cuyo nombre entero *es* su categoría
 * (`nombre: "CALLE"`, `categoria: "CALLE"`) y que contra una columna
 * `nombre_norm text NOT NULL` reventaría.
 *
 * Las abreviaturas no se expanden: «GRAL» no se vuelve «GENERAL». Expandir es
 * adivinar qué quiso decir el Estado, y la persona está eligiendo de una lista
 * que ve.
 */
export const normalizarNombreDeCalle = (texto: string, categorias: readonly string[]): string => {
  const base = normalizarNombreDeLugar(texto);
  const corte = base.indexOf(' ');
  // Un solo token: sacarlo dejaría la cadena vacía, y `nombre_norm` es NOT NULL.
  if (corte === -1) return base;

  const primero = base.slice(0, corte);
  const esCategoria = categorias.some(
    (categoria) => normalizarNombreDeLugar(categoria) === primero,
  );
  // `base` ya viene colapsado y sin bordes, así que el resto nunca es vacío.
  return esCategoria ? base.slice(corte + 1) : base;
};

// ---------------------------------------------------------------------------
// El rango de altura de una calle
// ---------------------------------------------------------------------------

/**
 * Hasta dónde llega la numeración que el Estado publica para una calle.
 *
 * Son cuatro casos y no un booleano `tiene_rango`, porque el dato real está a
 * medias: `AV JUAN BAUTISTA ALBERDI` (CABA, `0204901001480`) publica el fin
 * —3200— y no el inicio. Con esa calle la altura 4000 es demostrablemente de
 * más y la altura 100 es indecidible: un booleano las trata igual y miente en
 * las dos direcciones (§2.5).
 */
export type RangoDeAltura =
  | { tipo: 'completo'; desde: number; hasta: number }
  | { tipo: 'parcialDesde'; desde: number }
  | { tipo: 'parcialHasta'; hasta: number }
  | { tipo: 'ausente' };

const AUSENTE: RangoDeAltura = { tipo: 'ausente' };

/**
 * Una altura del payload de georef, o `null` si no vino.
 *
 * **El `0` es el «no sé» de georef** —el ejemplo textual de Córdoba trae
 * `inicio: {derecha: 0, izquierda: 0}, fin: {derecha: 0, izquierda: 0}`— y un
 * cero que significa «no sé» es exactamente el pecado del que sale `brillo.ts`.
 * Acá se traduce a ausencia, en la frontera, una sola vez.
 */
const alturaConocida = (valor: number | null | undefined): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor) && valor > 0;

/** Las cuatro alturas que georef publica por calle: dos inicios y dos fines. */
export interface AlturasDeGeoref {
  /** `altura.inicio.derecha` e `altura.inicio.izquierda`. */
  inicio: readonly (number | null | undefined)[];
  /** `altura.fin.derecha` y `altura.fin.izquierda`. */
  fin: readonly (number | null | undefined)[];
}

/**
 * El normalizador del seed: cuatro números de georef → un rango.
 *
 * Ningún camino de acá produce `desde: 0` ni `hasta: 0` (guarda 1). Y un rango
 * invertido —inicio mayor que fin— se descarta entero como `ausente`: es una
 * contradicción de la fuente, no se puede saber cuál de los dos números está
 * mal, y afirmar cualquiera de las dos lecturas sería inventar. De paso, es lo
 * único que impide que el seed arme una fila que el CHECK `desde <= hasta`
 * rechaza recién al insertar.
 */
export const rangoDeAltura = (alturas: AlturasDeGeoref): RangoDeAltura => {
  const inicios = alturas.inicio.filter(alturaConocida);
  const fines = alturas.fin.filter(alturaConocida);
  const desde = inicios.length > 0 ? Math.min(...inicios) : null;
  const hasta = fines.length > 0 ? Math.max(...fines) : null;

  if (desde !== null && hasta !== null) {
    return desde <= hasta ? { tipo: 'completo', desde, hasta } : AUSENTE;
  }
  if (desde !== null) return { tipo: 'parcialDesde', desde };
  if (hasta !== null) return { tipo: 'parcialHasta', hasta };
  return AUSENTE;
};

// ---------------------------------------------------------------------------
// El estado de la dirección
// ---------------------------------------------------------------------------

/**
 * La unión discriminada de §2.5, con la forma de sus columnas verificada por
 * el CHECK `senales_direccion_chk`. Ninguno de los seis se puede fusionar con
 * otro:
 *
 * - `sin_direccion`         — no hay dirección. El caso normal hoy.
 * - `calle`                 — hay calle y no se dio altura: una esquina, «sobre Mitre».
 * - `altura_en_rango`       — la altura cae adentro de la numeración que publica el callejero.
 * - `altura_sin_rango`      — hay altura y el Estado no publica rango. **Medio país.**
 * - `altura_fuera_de_rango` — cae afuera del rango conocido. La altura se guarda igual.
 * - `texto_libre`           — no matcheó ninguna calle: un barrio nuevo, una calle sin nomenclar.
 *
 * `texto_libre` no es una concesión: las 326.832 calles del INDEC no son todas
 * las calles del país, y negarse a guardar lo que no está en el catálogo del
 * Estado sería que esta plataforma le diga a un barrio que no existe.
 */
export type DireccionEstado =
  | 'sin_direccion'
  | 'calle'
  | 'altura_en_rango'
  | 'altura_sin_rango'
  | 'altura_fuera_de_rango'
  | 'texto_libre';

/** Los tres estados que una altura puede producir. */
export type EstadoDeAltura = Extract<
  DireccionEstado,
  'altura_en_rango' | 'altura_sin_rango' | 'altura_fuera_de_rango'
>;

// ---------------------------------------------------------------------------
// El dominio de una altura
// ---------------------------------------------------------------------------

/**
 * Los dos bordes del dominio de `altura`, **escritos una sola vez para todo el
 * sistema**: de acá sale la validación de este módulo y de acá sale el texto
 * del CHECK `senales_altura_chk` (A §3.4), vía `checkDeAltura`. Escribir los
 * números dos veces es cómo, dentro de seis meses, la base termina rechazando
 * lo que el código aceptó: la persona ve un 500 y nadie ve por qué.
 *
 * Los dos son EXCLUSIVOS, igual que el CHECK: `altura > 0 AND altura < 1000000`.
 *
 * El piso es cero por aritmética y no por política —no hay puerta con número
 * cero, y el cero es además el «no sé» de georef, ver `alturaConocida`—. El
 * techo sí es una decisión: la numeración más alta del país está en cinco
 * cifras (Rivadavia llega a ~11.500; las rutas numeradas por kilómetro, a
 * decenas de miles), así que seis cifras es generoso para una dirección real y
 * caza un teléfono tipeado en el campo equivocado.
 */
export const ALTURA_PISO_EXCLUSIVO = 0;
export const ALTURA_TECHO_EXCLUSIVO = 1_000_000;

/**
 * El cuerpo del CHECK de A §3.4, armado con las constantes de arriba.
 *
 * La migración que cree `senales` tiene que pedirlo acá y no volver a escribir
 * los números —`packages/db` ya depende de `@v2/civic-core`, así que el schema
 * de drizzle puede hacer
 * `check('senales_altura_chk', sql.raw(checkDeAltura('altura')))`—. Esa es toda
 * la garantía de que el dominio siga siendo uno solo: si alguien mueve el
 * techo, se mueve en los dos lados o no se mueve en ninguno.
 *
 * Lo que el CHECK **no** puede decir es que la altura sea entera: la columna es
 * `integer` y para cuando el valor llega a la base el decimal ya se resolvió de
 * algún modo. La integralidad se defiende acá y en ningún otro lado.
 */
export const checkDeAltura = (columna: string): string =>
  `${columna} IS NULL OR (${columna} > ${ALTURA_PISO_EXCLUSIVO} AND ${columna} < ${ALTURA_TECHO_EXCLUSIVO})`;

/**
 * Por qué un número no es una altura. Cinco motivos, y ninguno se fusiona con
 * otro: la persona tiene que poder arreglar lo que escribió, y «eso no es un
 * número» no se corrige igual que «ese número es demasiado grande».
 */
export type MotivoAlturaInvalida =
  | 'no_es_un_numero'
  | 'no_entera'
  | 'cero'
  | 'negativa'
  | 'sobre_el_techo';

/**
 * Lo que la persona lee. Regla 9: dice qué no se guardó, por qué, y qué hacer.
 * Ninguna dice «validation failed» ni nombra una columna.
 */
const RAZON_POR_MOTIVO: Record<MotivoAlturaInvalida, string> = {
  no_es_un_numero:
    'No guardamos la altura: tiene que ser un número entero mayor que cero, y lo que llegó ' +
    'no es un número.',
  no_entera:
    'No guardamos la altura: tiene que ser un número entero. Si la puerta es la 1450, escribí ' +
    '1450 y no 1450,7.',
  cero:
    'No guardamos la altura: tiene que ser mayor que cero. En el callejero del Estado el cero ' +
    'quiere decir «no sé», no una puerta. Si no sabés la altura, dejá el campo vacío.',
  negativa:
    'No guardamos la altura: tiene que ser un número mayor que cero, y no hay puertas con ' +
    'número negativo.',
  sobre_el_techo:
    'No guardamos la altura: es demasiado grande. La numeración más alta del país tiene cinco ' +
    'cifras, así que fijate que no se te haya colado un teléfono en el campo de la altura.',
};

/**
 * Un número mirado contra el dominio de `altura`: o es una altura, o no lo es y
 * se sabe por qué. Nunca un número que el llamador tenga que revisar por su
 * cuenta, y nunca un `0` ni un `null` haciendo de «no sé».
 */
export type AlturaValidada =
  | { tipo: 'valida'; altura: number }
  | { tipo: 'invalida'; motivo: MotivoAlturaInvalida; razon: string };

const invalida = (motivo: MotivoAlturaInvalida): AlturaValidada => ({
  tipo: 'invalida',
  motivo,
  razon: RAZON_POR_MOTIVO[motivo],
});

/**
 * La validación, del mismo lado que la decisión. Es lo que corre en el borde
 * —también el borde HTTP: una refinación de Zod puede llamar a esto y devolver
 * `razon`— para que un número imposible se rechace con una frase en vez de
 * reventar el INSERT contra `senales_altura_chk`.
 *
 * El orden de las preguntas importa. `Number.isFinite` va primero porque
 * `z.number()` deja pasar `NaN` e `Infinity` si nadie pide `.finite()`, y
 * contra `NaN` **toda** comparación da `false`: un `if (altura <= 0)` suelto lo
 * dejaría seguir por la rama de los números buenos. Es el modo exacto de fallar
 * abierto que este módulo no puede permitirse.
 */
export const validarAltura = (valor: number): AlturaValidada => {
  if (!Number.isFinite(valor)) return invalida('no_es_un_numero');
  if (!Number.isInteger(valor)) return invalida('no_entera');
  if (valor <= ALTURA_PISO_EXCLUSIVO) return invalida(valor === 0 ? 'cero' : 'negativa');
  if (valor >= ALTURA_TECHO_EXCLUSIVO) return invalida('sobre_el_techo');
  return { tipo: 'valida', altura: valor };
};

/**
 * Qué se puede afirmar de una altura VÁLIDA contra el rango publicado.
 *
 * Total sobre las cuatro variantes de `RangoDeAltura`. Lo que devuelve es una
 * afirmación sobre el CATÁLOGO: `altura_en_rango` no dice que la dirección
 * exista, dice que el número cayó adentro de un rango del INDEC.
 *
 * Privada a propósito: es la única cosa del módulo que produce un
 * `EstadoDeAltura`, y sólo se la puede alcanzar a través de `clasificarAltura`,
 * que valida primero.
 */
const contraElRango = (rango: RangoDeAltura, altura: number): EstadoDeAltura => {
  switch (rango.tipo) {
    case 'completo':
      return altura >= rango.desde && altura <= rango.hasta
        ? 'altura_en_rango'
        : 'altura_fuera_de_rango';
    // Se sabe dónde empieza y no dónde termina: por debajo del inicio es
    // demostrablemente de menos; por encima no se afirma nada.
    case 'parcialDesde':
      return altura < rango.desde ? 'altura_fuera_de_rango' : 'altura_sin_rango';
    case 'parcialHasta':
      return altura > rango.hasta ? 'altura_fuera_de_rango' : 'altura_sin_rango';
    case 'ausente':
      return 'altura_sin_rango';
  }
};

/**
 * El resultado de mirar una altura: o se la pudo clasificar contra el catálogo,
 * o el número no era una altura y hay una frase para decirlo.
 *
 * La variante `clasificada` lleva **también el número**, y no es redundancia: el
 * llamador guarda el que salió de acá, así que no puede clasificar uno y
 * escribir otro.
 */
export type ClasificacionDeAltura =
  | { tipo: 'clasificada'; estado: EstadoDeAltura; altura: number }
  | { tipo: 'rechazada'; motivo: MotivoAlturaInvalida; razon: string };

/**
 * Validar y clasificar, en ese orden y en la misma función.
 *
 * Devuelve una unión discriminada y no un `EstadoDeAltura` suelto porque **es
 * el único productor de `EstadoDeAltura` que existe**: mientras validar y
 * clasificar vivan acá adentro, no hay camino que convierta un `1450,7` —o un
 * `0`, o un `−5`, o un `99.999.999`— en un estado que afirme que hay altura. Es
 * la misma defensa de forma que usa `componerDireccion` con `DireccionEstado`:
 * el error no se detecta, se vuelve inexpresable.
 *
 * Antes esto devolvía el estado directamente y sólo preguntaba por el rango:
 * los cuatro valores de arriba salían clasificados y sin tocar, tres de ellos
 * a reventar el INSERT contra `senales_altura_chk` y el decimal a entrar a la
 * base y salir al público, porque contra un decimal no hay CHECK que valga.
 */
export const clasificarAltura = (rango: RangoDeAltura, altura: number): ClasificacionDeAltura => {
  const validada = validarAltura(altura);
  if (validada.tipo === 'invalida') {
    return { tipo: 'rechazada', motivo: validada.motivo, razon: validada.razon };
  }
  return {
    tipo: 'clasificada',
    estado: contraElRango(rango, validada.altura),
    altura: validada.altura,
  };
};

/**
 * Las cinco frases de §6, tal como se leen en pantalla.
 *
 * `sin_direccion` no tiene etiqueta —devuelve `null`— porque no hay nada que
 * rotular: una fila sin dirección no es una dirección de calidad desconocida.
 *
 * La que más se va a leer es la de `altura_sin_rango`: medido sobre el
 * callejero real, sólo el 24,2% de las calles tiene rango publicado y apenas el
 * 18,5% de las señales con altura cae en `altura_en_rango`. Por eso esa frase
 * habla del **catálogo del Estado** y no de quien escribió: que el INDEC no
 * publique la numeración de una calle de Córdoba es un hecho sobre el INDEC, y
 * decirlo como si la dirección fuera dudosa sería convertirlo en un hecho sobre
 * la persona.
 */
export const etiquetaDeDireccion = (estado: DireccionEstado): string | null => {
  switch (estado) {
    case 'sin_direccion':
      return null;
    case 'calle':
      return 'calle del callejero del Estado, sin altura';
    case 'altura_en_rango':
      return 'la altura está dentro de la numeración que publica el callejero';
    case 'altura_sin_rango':
      return 'el Estado no publica la numeración de esta calle';
    case 'altura_fuera_de_rango':
      return 'la altura no coincide con la numeración del callejero';
    case 'texto_libre':
      return 'escrito a mano: no está en el callejero del Estado';
  }
};

// ---------------------------------------------------------------------------
// Qué parte de una dirección se puede guardar
// ---------------------------------------------------------------------------

/**
 * Qué parte de una dirección se puede guardar. Eje SEPARADO del punto: el rol
 * gobierna la coordenada, esto gobierna el texto. Sin la separación, `sueño` y
 * `saber` —que van a `service_area` con un argumento sobre el PUNTO («un sueño
 * habla de un lugar, no señala un punto»), correcto para el punto y ciego para
 * la dirección— heredaban calle, altura y texto libre sin ninguna compuerta, y
 * «en el pasillo del fondo del 340 vive una señora sola sin agua» entraba
 * entero por la puerta de al lado.
 */
export type PermisoDireccion = 'completa' | 'solo_calle' | 'ninguna';

/** De la más permisiva a la más restrictiva. El orden ES la escala. */
const PERMISOS: readonly PermisoDireccion[] = ['completa', 'solo_calle', 'ninguna'];

/**
 * El fondo de la escala, y la respuesta a toda pregunta que este módulo no
 * entienda. Está nombrado y no escrito a mano en cada rama para que agregarle
 * un cuarto valor a `PermisoDireccion` sea un solo lugar donde decidir.
 */
const MAS_RESTRICTIVO: PermisoDireccion = 'ninguna';

/**
 * La escala, indexada. Es un `Map` y no `PERMISOS.indexOf(...)` por una razón
 * que no es de estilo: `indexOf` devuelve `-1` para lo que no encuentra, y `-1`
 * es **menor** que cualquier posición de la escala, así que un valor no
 * reconocido se leía como el permiso más permisivo del mundo. `Map.get`
 * devuelve `number | undefined` y el tipo obliga a decidir qué hacer con el
 * `undefined` en vez de dejar que un centinela numérico se cuele en una
 * comparación de orden — es el mismo pecado del `0` de georef, un renglón más
 * arriba, y el mismo del que sale `brillo.ts`.
 */
const ORDEN_DE_PERMISO: ReadonlyMap<string, number> = new Map(
  PERMISOS.map((permiso, indice): [string, number] => [permiso, indice]),
);

/**
 * El mínimo entre dos permisos. Nunca amplía: ningún tipo puede subir lo que el
 * rol bajó, y ningún rol puede subir lo que el tipo no admite.
 *
 * **Y ante cualquier entrada que no reconozca devuelve el más restrictivo.** La
 * firma dice `PermisoDireccion`, pero los tipos se borran en runtime y lo que
 * llega del cuerpo de una request no los respeta: la única respuesta segura a
 * «no sé qué es esto» sobre una función que decide cuánto se publica es
 * publicar nada.
 */
export const permisoMasRestrictivo = (
  a: PermisoDireccion,
  b: PermisoDireccion,
): PermisoDireccion => {
  const ordenA = ORDEN_DE_PERMISO.get(a);
  const ordenB = ORDEN_DE_PERMISO.get(b);
  if (ordenA === undefined || ordenB === undefined) return MAS_RESTRICTIVO;
  return ordenA >= ordenB ? a : b;
};

/**
 * **El piso por rol y sensibilidad** (§2.6). Cuatro filas y ninguna se puede
 * fusionar:
 *
 * - `capture` o `meeting_point` → lo que el tipo permita. Un pozo y un punto de
 *   entrega son cosas, no personas.
 * - `service_area` → solo la calle. Un ámbito no es una puerta.
 * - `subject` con sensibilidad alta → nada. El punto quedó en una celda de
 *   500 m *conocida* (`obfuscatePoint` redondea a grilla fija, no agrega
 *   ruido), y cruzarla con un nombre de calle deja un segmento de a lo sumo
 *   500 m, o una cortada entera.
 * - `subject` con sensibilidad no alta → solo la calle, nunca la altura. Una
 *   altura ubica en ~15 m sobre el lugar de una persona; una calle mide entre
 *   100 m y 2 km, o sea que nombrarla es del orden del punto engrosado.
 *
 * **Esa última fila existe de verdad, y es la mitad de para qué existe todo
 * esto.** Con «es mi casa» mapeado a `subject`+`high` no había ninguna
 * combinación que produjera `subject` sin `high`: la fila quedaba muerta y un
 * ¡BASTA! sobre tu propio techo que se llueve perdía la dirección entera, ni
 * siquiera la calle. «Es mi casa» mapea a `subject`+`moderate`; «es la casa de
 * otra persona» y «sin respuesta» quedan en `subject`+`high` con
 * `overridable: false`. El piso de publicación del punto es por rol, así que
 * `subject`+`moderate` sigue saliendo engrosado a 500 m: la gradación no cuesta
 * un metro de protección y recupera la cuadra.
 *
 * **No se exporta, y ése es el arreglo.** Mirar sólo el rol deja publicar la
 * altura de un `saber` sobre la casa de otro (§2.6): los cuatro tipos que B
 * manda a `service_area` son no-`subject`, así que el piso solo los deja pasar.
 * Mientras esta función tuvo nombre público —y peor, mientras tuvo el nombre
 * que el contrato cita—, la forma de equivocarse era llamar a la que estaba a
 * mano. Ahora la única puerta del paquete es `direccionPermitida`, la de tres
 * ejes: el error dejó de estar desalentado y pasó a ser inexpresable.
 *
 * Los dos `Map` no son adorno. Un `Record<LocationRole, PermisoDireccion>`
 * afirmaría que el rol siempre es uno de los cuatro, y el rol llega del cuerpo
 * de una request: `Map.get` devuelve `| undefined` y obliga a escribir qué pasa
 * con lo que no está en el vocabulario. Lo que pasa es `MAS_RESTRICTIVO`.
 */
const PISO_POR_ROL = new Map<string, PermisoDireccion>([
  ['capture', 'completa'],
  ['meeting_point', 'completa'],
  ['service_area', 'solo_calle'],
]);

/** El piso de `subject`, que es el único que depende de la sensibilidad. */
const PISO_DE_SUBJECT = new Map<string, PermisoDireccion>([
  ['low', 'solo_calle'],
  ['moderate', 'solo_calle'],
  ['high', 'ninguna'],
]);

/**
 * El piso de un rol, o la constancia de que no se lo reconoce. Es la unión
 * hermana de `TechoDeTipo` y existe por lo mismo: «el piso de este rol es
 * ninguna» y «no sé qué rol es éste» son afirmaciones distintas, y quien
 * redacta el recibo necesita distinguirlas.
 *
 * `reconocido: false` cubre los dos huecos del vocabulario de §2.6 —un rol que
 * no está en la tabla, y una sensibilidad que no está en la de `subject`—
 * porque el piso es una sola respuesta a los dos ejes juntos y desde afuera no
 * hay nada distinto que hacer con cada uno.
 */
type PisoDeRol = { reconocido: true; piso: PermisoDireccion } | { reconocido: false };

const pisoPorRol = (role: LocationRole, sensitivity: CivicSensitivity): PisoDeRol => {
  const piso = role === 'subject' ? PISO_DE_SUBJECT.get(sensitivity) : PISO_POR_ROL.get(role);
  return piso === undefined ? { reconocido: false } : { reconocido: true, piso };
};

/**
 * **El techo por tipo** (§2.6), nueve entradas exhaustivas sobre el vocabulario
 * de señal.
 *
 * `basta`, `recurso`, `práctica` y `compromiso` hablan de una **cosa** en un
 * lugar —un pozo, un punto de entrega, un lugar al que se va, una obra en una
 * dirección— y por eso admiten altura. Los otros cinco hablan **sobre** un
 * lugar, y a menudo sobre quien vive ahí. Una consecuencia que hay que leer
 * entera: **una `necesidad` es siempre `solo_calle`**, así que la clase de
 * señal que da nombre a la métrica norte es exactamente la que nunca lleva
 * altura. No es una pérdida: una necesidad se resuelve coordinando, no yendo a
 * una puerta que se publicó en un `GET` abierto.
 *
 * Las claves se declaran con `satisfies Record<TipoSenal, PermisoDireccion>`
 * contra el union del vocabulario (`senal/vocabulario.ts`), que antes no
 * existía: un tipo décimo sin fila acá deja de compilar, y una fila de más
 * también.
 *
 * **La tabla no se exporta.** Su uso natural —`TECHO_POR_TIPO[tipo]`— es
 * exactamente el camino que falla abierto: con una clave que no matchea
 * *exactamente* da `undefined`, y ese `undefined` no lo caza el compilador
 * porque el objeto tiene claves conocidas y `noUncheckedIndexedAccess` sólo
 * mira las firmas de índice. Dejar la tabla al alcance de la mano al lado de un
 * lector seguro sería desalentar el error, no impedirlo. El único lector es
 * `techoDeTipo`.
 *
 * TODO (Task 8, rebanada 3): cuando exista `TipoDeSenal`, tipar este `Record`
 * contra él. La guarda de exhaustividad entra ahí y un tipo décimo sin fila
 * deja de compilar.
 */
const TECHO_POR_TIPO = {
  basta: 'completa',
  recurso: 'completa',
  práctica: 'completa',
  compromiso: 'completa',
  necesidad: 'solo_calle',
  saber: 'solo_calle',
  sueño: 'solo_calle',
  propuesta: 'solo_calle',
  pregunta: 'solo_calle',
} satisfies Record<TipoSenal, PermisoDireccion>;

/** Los nueve tipos de señal, vistos desde el techo de dirección que tienen. */
export type TipoConTechoDeDireccion = keyof typeof TECHO_POR_TIPO;

/**
 * Los nueve tipos, para iterar y para construir el enum de Zod del borde. Sale
 * de la tabla y no de una lista escrita a mano, así que no puede desactualizarse
 * respecto de ella; el test la contrasta igual contra una lista independiente,
 * porque una constante derivada de la cosa que verifica no verifica nada sola.
 */
export const TIPOS_CON_TECHO_DE_DIRECCION = Object.keys(
  TECHO_POR_TIPO,
) as readonly TipoConTechoDeDireccion[];

/**
 * La tabla, llaveada en NFC. `'práctica'` con la `á` precompuesta (NFC, un
 * code point) y `'práctica'` con la tilde combinante (NFD, dos) son la
 * misma palabra en pantalla y **dos strings distintos** para JavaScript: un
 * cliente iOS manda la segunda sin querer y la primera nunca matchea. Se
 * normalizan las dos puntas —la clave al construir el mapa, el argumento al
 * buscar—, que es la misma simetría de guarda 7: la única forma de encontrar
 * menos filas en un dispositivo que en otro es que haya dos normalizadores.
 */
const TECHO_POR_TIPO_NFC = new Map<string, PermisoDireccion>(
  Object.entries(TECHO_POR_TIPO).map(([tipo, techo]): [string, PermisoDireccion] => [
    tipo.normalize('NFC'),
    techo,
  ]),
);

/**
 * El techo de un tipo, o la constancia de que no se reconoce el tipo.
 *
 * Unión discriminada y no `PermisoDireccion | undefined`: «no está en la tabla»
 * y «está y no permite nada» son afirmaciones distintas y sólo una de las dos
 * habilita rechazar la señal en el borde en vez de degradarla en silencio.
 */
export type TechoDeTipo = { reconocido: true; techo: PermisoDireccion } | { reconocido: false };

/**
 * El único lector de la tabla. Acepta `string` a propósito: es la función que
 * el borde de la API necesita para decidir si un tipo del cuerpo de la request
 * existe, y pedirle que ya lo haya validado sería pedirle que valide con la
 * tabla que esta función esconde.
 */
export const techoDeTipo = (tipo: string): TechoDeTipo => {
  const techo = TECHO_POR_TIPO_NFC.get(tipo.normalize('NFC'));
  return techo === undefined ? { reconocido: false } : { reconocido: true, techo };
};

/**
 * **El permiso efectivo, y la única puerta de este módulo hacia §2.6:** el
 * mínimo entre el techo del tipo y el piso del rol.
 *
 * Es la función que cierra el hueco. Los dos ejes solos fallan: mirar sólo el
 * rol deja publicar la altura de un `saber` sobre la casa de otro, y mirar sólo
 * el tipo deja publicarla cuando el rol es `subject`. Por eso el piso por rol
 * ya no tiene nombre público: no queda una segunda función a la que llamar por
 * error, y el nombre que el contrato cita es el de tres ejes.
 *
 * **Un tipo que no está en la tabla vale `'ninguna'`, no `undefined`.** La
 * alternativa era devolver una unión discriminada también acá y obligar a cada
 * llamador a escribir la rama; se descartó porque la rama es siempre la misma
 * —publicar nada— y la que se escribe nueve veces se escribe mal una. Quien
 * necesite *rechazar* en vez de *degradar* tiene `techoDeTipo`, que sí devuelve
 * la unión y es donde vive la distinción.
 */
export const direccionPermitida = (
  tipo: TipoConTechoDeDireccion,
  role: LocationRole,
  sensitivity: CivicSensitivity,
): PermisoDireccion => {
  // El tipo de los parámetros dice que esto no puede fallar, y en runtime sí
  // puede: los tipos se borran y los valores vienen del cuerpo de una request
  // (Task 13). Los dos ejes fallan cerrado, cada uno por su lado.
  const techo = techoDeTipo(tipo);
  const piso = pisoPorRol(role, sensitivity);
  return techo.reconocido && piso.reconocido
    ? permisoMasRestrictivo(techo.techo, piso.piso)
    : MAS_RESTRICTIVO;
};

// ---------------------------------------------------------------------------
// Degradar: qué sobrevive de la dirección que se cargó
// ---------------------------------------------------------------------------

/** Las frases del recibo. Explican qué se retiró Y por qué (regla 9). */
const RETIRO_DIRECCION_DE_PERSONA =
  'No publicamos la dirección: esta señal habla del lugar donde vive o está una persona.';
const RETIRO_ALTURA_DE_PERSONA =
  'No publicamos la altura: esta señal habla del lugar de una persona.';
const RETIRO_ALTURA_DE_AMBITO =
  'No publicamos la altura: esta señal marca una zona donde algo funciona, y un ámbito no es ' +
  'una puerta.';
const RETIRO_TEXTO_LIBRE =
  'No guardamos la referencia escrita a mano: para esta señal sólo se guarda una calle del ' +
  'callejero. Podés elegir una calle o cargar sin dirección.';
const RETIRO_ALTURA_SIN_CALLE =
  'No publicamos la altura: no elegiste una calle del callejero del Estado.';
const RETIRO_ALTURA_CON_PUNTO_GRUESO =
  'No publicamos la altura: el punto de esta señal se publica engrosado, y una altura lo ' +
  'volvería a afinar.';
/**
 * El tipo no está en la tabla de §2.6. No debería llegar acá —el borde valida
 * contra `TIPOS_CON_TECHO_DE_DIRECCION`— y si llega, la señal se guarda sin
 * dirección y la frase lo dice sin fingir un motivo que no es.
 */
const RETIRO_TIPO_DESCONOCIDO =
  'No publicamos la dirección: no reconocemos el tipo de esta señal, y ante la duda ' +
  'publicamos menos.';
/**
 * El rol —o, con `subject`, su sensibilidad— no está en el vocabulario de §2.6.
 * La constante hermana de la de arriba, por el otro eje, y por la misma razón:
 * sin ella, un `basta` sobre un pozo cargado con un rol que no existe recibía
 * «esta señal habla del lugar donde vive o está una persona», que es un motivo
 * inventado para una decisión correcta. Fallar cerrado está bien; explicarlo
 * mal, no.
 */
const RETIRO_ROL_DESCONOCIDO =
  'No publicamos la dirección: no reconocemos qué es este lugar para la señal, y ante la duda ' +
  'publicamos menos.';

/**
 * Por qué no se publicó ninguna dirección, en el orden en que hay que
 * preguntarlo: primero los dos huecos del vocabulario —que no son sobre la
 * señal sino sobre lo que llegó— y recién después la razón de §2.6, que es la
 * única que afirma algo sobre lo que la señal dice.
 */
const motivoDeNinguna = (techo: TechoDeTipo, piso: PisoDeRol): string => {
  if (!techo.reconocido) return RETIRO_TIPO_DESCONOCIDO;
  if (!piso.reconocido) return RETIRO_ROL_DESCONOCIDO;
  return RETIRO_DIRECCION_DE_PERSONA;
};

const unir = (retiros: readonly string[]): string | null =>
  retiros.length === 0 ? null : retiros.join(' ');

export interface EntradaUbicacionPublicable {
  tipo: TipoConTechoDeDireccion;
  /** Lo que la persona cargó, antes de degradar. */
  direccion: { calleId: number | null; altura: number | null; textoLibre: string | null };
  /** El rango publicado de la calle elegida. `ausente` si no hay calle. */
  rango: RangoDeAltura;
  jerarquia: { cityId: number | null; departmentId: number | null };
  /** El resultado ENTERO de `publishedPrecision`, no sólo la precisión. */
  precision: PublishedPrecisionResult;
  hayPunto: boolean;
  role: LocationRole;
  sensitivity: CivicSensitivity;
}

export interface UbicacionPublicable {
  calleId: number | null;
  altura: number | null;
  estado: DireccionEstado;
  cityId: number | null;
  departmentId: number | null;
  /** Qué se retiró y por qué, en castellano, para el recibo. `null` si no se retiró nada. */
  retirado: string | null;
}

/**
 * La dirección y la jerarquía, ya degradadas. **Paso 3 de la secuencia**, y no
 * recibe ni devuelve el texto compuesto: esa es la parte del diseño que hace el
 * error inexpresable.
 *
 * Tres cosas la hacen distinta de un `if` suelto:
 *
 * - **Se llavea en `direccionPermitida` y en `coarsenedBecause`, no en
 *   `LocationPrecision`.** Una precisión gruesa porque no hay punto no es lo
 *   mismo que una gruesa porque corrió la protección, y `PublishedPrecisionResult`
 *   ya trae el campo que las distingue. Llavearlo en la precisión borraba en
 *   silencio el caso emblemático de la spec: Córdoba, sin GPS, calle escrita a
 *   mano.
 * - **`cityId` es su salida también.** Cuando corrió la protección, la
 *   localidad se retira y queda el departamento: publicar el paraje exacto al
 *   lado de un punto engrosado a 500 m es la misma fuga por el otro flanco, y
 *   `city_id` es público desde que `CivicMapRepository` lo devuelve.
 * - **La altura cae también cuando hay punto engrosado.** Es el CHECK
 *   `senales_altura_punto_chk`: una altura al lado de un punto de 500 m lo
 *   vuelve a afinar y anula el engrosado por la ventana.
 * - **La altura imposible se cae en la puerta, antes que cualquier política.**
 *   Un `0`, un `−5` o un `99.999.999` reventarían el INSERT contra
 *   `senales_altura_chk` —un 500 en la cara de quien está cargando una señal en
 *   el celular, parado en el barrio— y un `1450,7` no lo rechaza ningún CHECK:
 *   entraría a la base y saldría al público, compuesto adentro de
 *   `direccion_texto`, de donde `direccionSinAltura` ya no lo puede sacar.
 */
export const ubicacionPublicable = (entrada: EntradaUbicacionPublicable): UbicacionPublicable => {
  const { direccion, jerarquia } = entrada;
  const permiso = direccionPermitida(entrada.tipo, entrada.role, entrada.sensitivity);
  // Los dos ejes por separado, sólo para redactar el recibo: la decisión de
  // cuánto se publica ya la tomó `direccionPermitida`, y volver a mirar las
  // tablas para decidirla otra vez sería tener dos jueces. Acá no se decide
  // nada: se pregunta quién puso el techo, para poder decirlo sin inventar.
  const techo = techoDeTipo(entrada.tipo);
  const piso = pisoPorRol(entrada.role, entrada.sensitivity);
  const textoLibre = normalizedLocationLabel(direccion.textoLibre);
  const retiros: string[] = [];

  // Paso 0, antes de mirar rol, tipo o punto: si el número no es una altura, se
  // cae acá con su frase y de acá en adelante la función se comporta como si
  // nunca se hubiera escrito. Un solo motivo en el recibo y no dos: no se le
  // explica a alguien por qué no publicamos una altura que no existía.
  const clasificacion =
    direccion.altura === null ? null : clasificarAltura(entrada.rango, direccion.altura);
  if (clasificacion?.tipo === 'rechazada') retiros.push(clasificacion.razon);
  const conAltura = clasificacion?.tipo === 'clasificada' ? clasificacion : null;

  const habiaAlgo = direccion.calleId !== null || conAltura !== null || textoLibre !== null;

  // Corrió la protección del punto: no queda dirección, y la localidad tampoco.
  if (entrada.precision.coarsenedBecause !== null) {
    if (habiaAlgo) retiros.push(RETIRO_DIRECCION_DE_PERSONA);
    return {
      calleId: null,
      altura: null,
      estado: 'sin_direccion',
      cityId: null,
      departmentId: jerarquia.departmentId,
      retirado: unir(retiros),
    };
  }

  const { cityId, departmentId } = jerarquia;

  if (permiso === 'ninguna') {
    // El recibo tiene que decir la verdad sobre por qué. Hay tres motivos
    // distintos detrás del mismo «ninguna» —el techo del tipo, un tipo que no
    // está en la tabla, un rol que no está en la suya— y sólo uno de ellos
    // habla de una persona.
    if (habiaAlgo) retiros.push(motivoDeNinguna(techo, piso));
    return {
      calleId: null,
      altura: null,
      estado: 'sin_direccion',
      cityId,
      departmentId,
      retirado: unir(retiros),
    };
  }

  if (permiso === 'solo_calle') {
    // Quién puso el techo cambia lo que hay que decirle a la persona: si fue el
    // tipo, la señal habla del lugar de alguien; si fue el rol `service_area`,
    // lo que se cargó es un ámbito. Decir «de una persona» sobre un comedor que
    // atiende diez cuadras sería explicar mal una decisión correcta.
    const razon =
      techo.reconocido && techo.techo === 'completa' && entrada.role === 'service_area'
        ? RETIRO_ALTURA_DE_AMBITO
        : RETIRO_ALTURA_DE_PERSONA;
    if (conAltura !== null) retiros.push(razon);
    if (textoLibre !== null) retiros.push(RETIRO_TEXTO_LIBRE);
    return direccion.calleId === null
      ? {
          calleId: null,
          altura: null,
          estado: 'sin_direccion',
          cityId,
          departmentId,
          retirado: unir(retiros),
        }
      : {
          calleId: direccion.calleId,
          altura: null,
          estado: 'calle',
          cityId,
          departmentId,
          retirado: unir(retiros),
        };
  }

  // Techo completo. Sin calle del catálogo, la altura no tiene a qué colgarse:
  // el CHECK pide `calle_id IS NOT NULL` para los tres estados con altura.
  if (direccion.calleId === null) {
    if (conAltura !== null) retiros.push(RETIRO_ALTURA_SIN_CALLE);
    return {
      calleId: null,
      altura: null,
      estado: textoLibre === null ? 'sin_direccion' : 'texto_libre',
      cityId,
      departmentId,
      retirado: unir(retiros),
    };
  }

  if (conAltura === null) {
    return {
      calleId: direccion.calleId,
      altura: null,
      estado: 'calle',
      cityId,
      departmentId,
      retirado: unir(retiros),
    };
  }

  if (entrada.hayPunto && entrada.precision.precision !== 'exact') {
    retiros.push(RETIRO_ALTURA_CON_PUNTO_GRUESO);
    return {
      calleId: direccion.calleId,
      altura: null,
      estado: 'calle',
      cityId,
      departmentId,
      retirado: unir(retiros),
    };
  }

  // El número que se guarda es el que salió de `clasificarAltura`, no el que
  // entró: clasificar uno y escribir otro es un error que acá no se puede
  // cometer porque no hay dos variables.
  return {
    calleId: direccion.calleId,
    altura: conAltura.altura,
    estado: conAltura.estado,
    cityId,
    departmentId,
    retirado: unir(retiros),
  };
};

// ---------------------------------------------------------------------------
// Componer y volver a olvidar
// ---------------------------------------------------------------------------

export interface EntradaComponerDireccion {
  /** El estado que salió de `ubicacionPublicable`. Es la llave de todo. */
  estado: DireccionEstado;
  /** El `nombre` presentable de la calle del catálogo, no su `nombre_norm`. */
  nombreCalle: string | null;
  altura: number | null;
  textoLibre: string | null;
}

/**
 * **Paso 4 de la secuencia.** El texto presentable, compuesto al ESCRIBIR y
 * guardado. No se compone al leer a propósito: el catálogo se re-siembra y una
 * calle puede cambiar de nombre, y el registro de una persona tiene que seguir
 * diciendo lo que decía.
 *
 * Se llavea en `estado` y no en los campos, así que una altura que
 * `ubicacionPublicable` retiró no puede volver a entrar por el texto. Lo que
 * **no** garantiza es que ese `estado` haya salido del paso 3: eso lo sostienen
 * el orden y un test, no el compilador (ver la cabecera del módulo).
 *
 * El tope es `TOPE_DE_ETIQUETA`, el mismo de `normalizedLocationLabel` y el
 * mismo que el CHECK `senales_direccion_texto_len_chk` hace cumplir, y se mide
 * ANTES de pegar el número.
 */
export const componerDireccion = (entrada: EntradaComponerDireccion): string | null => {
  switch (entrada.estado) {
    case 'sin_direccion':
      return null;
    case 'texto_libre':
      return normalizedLocationLabel(entrada.textoLibre);
    case 'calle':
      return normalizedLocationLabel(entrada.nombreCalle);
    case 'altura_en_rango':
    case 'altura_sin_rango':
    case 'altura_fuera_de_rango': {
      const calle = normalizedLocationLabel(entrada.nombreCalle);
      if (calle === null || entrada.altura === null) return calle;
      /**
       * **El número entra entero o no entra.** Antes esto era
       * `normalizedLocationLabel` sobre «calle + espacio + altura», o sea
       * recortar a 120 DESPUÉS de pegar: medido, con un nombre de 116 y la
       * altura 1450, `direccion_texto` terminaba en «AA 145» mientras la
       * columna `altura` decía 1450. La fila afirmaba una puerta que no existe,
       * en la única columna que ningún CHECK puede defender.
       *
       * Con nombres argentinos reales no se alcanza, y ésa es justamente la
       * razón por la que había que arreglarlo acá: `geo_calles.nombre` es
       * `text` sin tope y el largo entra desde el catálogo del Estado, no desde
       * la persona — o sea que quien lo puede traer es el seed de esta misma
       * rebanada, no un usuario.
       *
       * **Un número mutilado es peor que uno ausente**: el ausente ya tiene su
       * estado (`calle`) y su etiqueta, el mutilado se lee como un dato. Cuando
       * no entra queda una fila con `altura` y con un texto que no la nombra;
       * del lado del registro público `direccionSinAltura` no puede probar que
       * la sacó y no publica nada, que es la salida segura de las dos.
       */
      const compuesto = `${calle} ${entrada.altura}`;
      return compuesto.length <= TOPE_DE_ETIQUETA ? compuesto : calle;
    }
  }
};

/** La dirección de una señal, tal como queda guardada en la fila. */
export interface DireccionDeSenal {
  calleId: number | null;
  altura: number | null;
  estado: DireccionEstado;
  direccionTexto: string | null;
}

/**
 * El texto sin la altura, para el registro público: **la altura no sale al
 * volcado** —ni en la API, ni en el CSV, ni en el JSONL, ni en el GeoJSON—
 * porque una fila con dirección y sin punto es válida y el piso de publicación
 * de D se llavea en `lat`, así que sobre esa fila no tiene sobre qué actuar.
 *
 * Recorta el número del final y nada más. Un regex sobre dígitos convertiría
 * `25 DE MAYO 1450` en `DE MAYO`, que es por qué esto es una función testeada y
 * no una expresión adentro de una consulta.
 *
 * **Y cuando el texto y la altura no coinciden, no devuelve el texto crudo.**
 * Devolverlo era la única salida de este módulo que publicaba MÁS ante una
 * entrada que no entendía: con `altura` no nula la fila afirma que el texto se
 * compuso como `<calle> <altura>` (paso 4 de §4.5), así que un texto que no
 * termina en esa altura es un desacople —una fila editada a mano, una migración
 * a medias, una altura corregida sin recomponer el texto— y en un desacople de
 * una sola unidad, `'25 DE MAYO 1451'` con `altura: 1450`, lo que salía al
 * volcado era el número entero.
 *
 * Lo que sí se puede garantizar en un desacople es una sola cosa: si el último
 * token es un número, cortarlo publica **estrictamente menos** que el texto
 * crudo y deja el nombre de la calle, que es lo que el registro público quería.
 * Y si el último token **no** es un número, este texto no tiene la forma que
 * esta función sabe acortar, no hay dónde estar seguro de que la altura no está
 * adentro, y entonces no se publica nada. Nada es un resultado; el texto crudo
 * no lo es.
 *
 * El corte de rescate es por token completo y anclado al final, igual que el
 * camino feliz: `AV 9 DE JULIO 9` sigue dando `AV 9 DE JULIO` y no `AV 9 DE`.
 */
const TOKEN_SOLO_DIGITOS = /^[0-9]+$/;

export const direccionSinAltura = (direccion: {
  direccionTexto: string | null;
  altura: number | null;
}): string | null => {
  const texto = direccion.direccionTexto;
  if (texto === null || direccion.altura === null) return texto;

  const sufijo = ` ${direccion.altura}`;
  if (texto.endsWith(sufijo)) {
    return normalizedLocationLabel(texto.slice(0, texto.length - sufijo.length));
  }

  const corte = texto.lastIndexOf(' ');
  const ultimo = corte === -1 ? texto : texto.slice(corte + 1);
  if (!TOKEN_SOLO_DIGITOS.test(ultimo)) return null;
  if (corte === -1) return null;

  /**
   * El rescate se valida por su SALIDA y no por la forma de la entrada.
   *
   * Cortar el último token de dígitos alcanza cuando la altura está al final,
   * y no alcanza cuando quedó más adentro: con `MITRE 340 PASILLO 12` y altura
   * 340, el corte devuelve `MITRE 340` — que sigue nombrando la puerta. Un
   * desacople puede dejar el número en cualquier posición, así que la única
   * comprobación que sirve es mirar lo que se va a publicar.
   *
   * Acá no se afina: si el número aparece como token en lo que iba a salir, no
   * sale nada. Ésta es ya la rama de «el texto y la altura no cuadran», y ser
   * conservador de más cuesta una calle que igual estaba mal escrita. En el
   * camino feliz no hace falta la comprobación: ahí el sufijo coincidió exacto
   * y lo que queda es el nombre de la calle — `AV 9 DE JULIO` con altura 9
   * conserva su `9` porque ése es el nombre de la avenida, no una puerta.
   */
  const rescatado = normalizedLocationLabel(texto.slice(0, corte));
  if (rescatado === null) return null;
  const buscada = String(direccion.altura);
  return rescatado.split(' ').includes(buscada) ? null : rescatado;
};

/**
 * La forma de una dirección olvidada. La regla 9 pide consentimiento
 * comprensible **y revocable**, y sobre el dato más sensible que la plataforma
 * guardó nunca hacen falta las dos mitades.
 *
 * Es una sola transición y deja la fila en la única forma que el CHECK admite
 * después, así que no puede quedar residuo en una columna que alguien olvidó
 * —incluida `direccion_texto`, que es donde una implementación descuidada lo
 * dejaría.
 */
export const direccionOlvidada = (): DireccionDeSenal => ({
  calleId: null,
  altura: null,
  estado: 'sin_direccion',
  direccionTexto: null,
});
