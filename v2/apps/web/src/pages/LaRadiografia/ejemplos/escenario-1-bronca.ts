import { armarVoces } from './padron';

import type { IdDeVoz } from './padron';
import type { Dicho, Escenario, MandatoDelEscenario } from './tipos';

/**
 * Escenario 1 · La bronca.
 *
 * Sesenta y tres voces de pura bronca. Ni un lugar, ni una cosa, ni una fecha.
 *
 * **La lección sigue siendo que la bronca converge más que la precisión, y hasta
 * el 17 de agosto de 2026 estuvo inflada a mano.** La primera versión de estas
 * 63 frases repetía tres palabras —«nada», «nunca», «nadie»— en 58, 40 y 23 de
 * ellas, y cinco terminaban con la coletilla literal «acá nunca cambia nada».
 * Con eso el motor daba **un** núcleo de 60 sobre 63; sacando esas tres palabras
 * daba siete núcleos y el mayor caía a 24. O sea: la mitad de la convergencia no
 * la ponía la bronca, la poníamos nosotros.
 *
 * Estas frases son la reescritura, y no tienen muleta. **Ningún token de
 * contenido aparece en más del 13 % del corpus** —el techo que se fijó es
 * 35 %—, ninguna cláusula final se repite más de dos veces, y **sacar del corpus
 * los tres tokens más frecuentes mueve el núcleo mayor un 12,9 %**: no hay una
 * palabra de la que la imagen dependa.
 *
 * Medido con el motor de verdad, a k=12 y umbral 0,40:
 *
 * | escenario | núcleos | el mayor | voces solas |
 * |---|---|---|---|
 * | La bronca | 6 | **31 de 63** | 19 |
 * | El reclamo | 8 | 11 | 30 |
 * | El dato | 10 | 5 | 37 |
 *
 * **La lección se sostiene sin la muleta**: la bronca sigue dando el grupo más
 * grande de los tres, casi el triple que el reclamo, y no habilita **nada**. No
 * hay lugar al que ir, no hay cosa que arreglar, no hay fecha que venza. Lo que
 * se perdió al sacar la muleta fue la imagen imposible —una sola estrella con
 * el 95 % del corpus adentro— y estaba bien perderla: era nuestra, no del país.
 *
 * **Dónde se sostiene, dicho con precisión.** El orden `bronca > reclamo > dato`
 * vale en la banda **0,37–0,50** del deslizador, y en esa banda el núcleo
 * mayor de la bronca no se mueve: 31, diecisiete pasos seguidos. Fuera de ahí
 * no vale, y no se disimula: por debajo de 0,37 el `EmbebedorFalso` funde los
 * tres corpus —a 0,30 hasta el preciso da 40 sobre 63— y por encima de 0,50 los
 * tres quedan en un puñado y el orden se cruza. Con la muleta puesta parecía
 * valer en todo el rango; ese «todo el rango» era la muleta.
 *
 * Lo que la convergencia es, y hay que decirlo antes de que alguien lo deduzca:
 * `EmbebedorFalso` es una bolsa de palabras, así que **toda convergencia que
 * este ejemplo muestre es léxica por construcción**. Estas 31 voces se juntan
 * porque comparten «harto», «podrido», «bronca», «roban», «alcanza» —no porque
 * una máquina haya entendido que dicen lo mismo—. Con este motor no se puede
 * demostrar una tesis sobre significado, y el ejemplo no la demuestra: muestra
 * que la bronca **tiene un vocabulario chico y compartido** y que la precisión
 * no, que es una afirmación sobre palabras y una bolsa de palabras sí la puede
 * sostener. `BolsaDePalabras` lo dice en la pantalla, no acá adentro.
 *
 * Y eso, además, es la defensa de esta página contra su peor uso posible. Una
 * pantalla que muestra convergencia es una máquina de fabricar consenso si el
 * lector confunde «esto se ve compacto» con «esto es cierto». El escenario 1
 * está acá para que esa confusión sea imposible de sostener treinta segundos:
 * el núcleo más compacto del ejemplo es el que no se puede corroborar.
 *
 * Las frases las escribió una persona a mano, en castellano rioplatense, y son
 * de gente distinta a propósito: hay quien contesta en tres palabras, quien
 * escribe en minúscula y sin tildes, quien explica su vida en dos renglones,
 * quien pregunta al aire, quien grita en mayúscula. **Nadie dijo ninguna de
 * estas cosas.**
 */

/**
 * Lo que dijo cada una de las 63.
 *
 * El tipo es del canon y la clase se deriva sola. Fijate en la mezcla: casi
 * todo es `basta` y `necesidad` —los dos son **hechos**, o sea que el canon
 * dice «esto se corrobora»— y no hay una sola de estas frases que alguien
 * pueda ir a comprobar. Ése es exactamente el punto: la clase promete una
 * máquina que el texto no puede alimentar.
 *
 * Los tipos son los mismos que tenía la versión inflada, voz por voz. Eso no
 * es pereza: es lo que deja la reescritura aislada en el **texto**, que es lo
 * único que se quiso cambiar. Si además se hubieran movido los tipos, la caída
 * de 60 a 31 podría atribuirse a la mezcla de clases y no al vocabulario.
 */
export const DICHOS_BRONCA: Readonly<Record<IdDeVoz, Dicho>> = {
  v01: { texto: 'Ya está. Basta. Harto.', tipo: 'basta' },
  v02: { texto: 'Harto y podrido.', tipo: 'basta' },
  v03: { texto: 'Podrido. Y con bronca.', tipo: 'basta' },
  v04: { texto: 'Necesitamos respirar.', tipo: 'necesidad' },
  v05: {
    texto: 'Mi vieja laburó cuarenta años y hoy junta monedas para el pan.',
    tipo: 'basta',
  },
  v06: {
    texto: 'Propongo que nos juntemos entre nosotros y dejemos de esperar que baje algo.',
    tipo: 'propuesta',
  },
  v07: { texto: 'Sueño con vivir tranquilo.', tipo: 'sueño' },
  v08: { texto: 'No aguanto más. BASTA.', tipo: 'basta' },
  v09: { texto: 'Podrido del verso.', tipo: 'basta' },
  v10: { texto: 'Son todos iguales.', tipo: 'basta' },
  v11: { texto: 'Lo que necesitamos es que la plata alcance.', tipo: 'necesidad' },
  v12: { texto: 'Verso y vergüenza.', tipo: 'basta' },
  v13: { texto: 'no doy mas. harto', tipo: 'basta' },
  v14: { texto: 'Hace falta que alguien escuche.', tipo: 'necesidad' },
  v15: { texto: 'Mienten y se ríen.', tipo: 'basta' },
  v16: { texto: 'El sueldo no alcanza.', tipo: 'basta' },
  v17: {
    texto: 'Fui, esperé, volví con las manos vacías y encima me trataron mal.',
    tipo: 'basta',
  },
  v18: { texto: 'Falta que escuchen alguna vez.', tipo: 'necesidad' },
  v19: { texto: 'Bronca. Una bronca que no se explica.', tipo: 'basta' },
  v20: { texto: 'Ojalá algún día esto se enderece.', tipo: 'sueño' },
  v21: { texto: 'Chorros. Roban y roban.', tipo: 'basta' },
  v22: {
    texto: 'Estamos en el horno y todavía nos dicen que estamos mejor que antes.',
    tipo: 'basta',
  },
  v23: { texto: 'Hace falta cambiar esto de raíz.', tipo: 'necesidad' },
  v24: { texto: 'Basta de verso.', tipo: 'basta' },
  v25: { texto: 'Mienten sin vergüenza.', tipo: 'basta' },
  v26: { texto: 'Todo lo que prometen es verso.', tipo: 'basta' },
  v27: { texto: 'Perdés media vida esperando.', tipo: 'basta' },
  v28: { texto: 'A nadie le importa.', tipo: 'basta' },
  v29: { texto: 'Que se acuerden de nosotros: necesitamos eso.', tipo: 'necesidad' },
  v30: { texto: 'No alcanza. Qué bronca.', tipo: 'basta' },
  v31: {
    texto: 'Mi hija me preguntó si nos íbamos del país y no supe qué decirle.',
    tipo: 'basta',
  },
  v32: { texto: '¿Nadie más está harto?', tipo: 'pregunta' },
  v33: { texto: 'Todos chorros.', tipo: 'basta' },
  v34: { texto: 'Da vergüenza y da bronca.', tipo: 'basta' },
  v35: {
    texto: 'Acá cada uno se arregla como puede, y el que no puede se hunde.',
    tipo: 'basta',
  },
  v36: { texto: 'Algo que funcione, necesitamos.', tipo: 'necesidad' },
  v37: { texto: 'Solos y con bronca.', tipo: 'basta' },
  v38: { texto: 'Pagamos todo y no alcanza.', tipo: 'basta' },
  v39: { texto: 'Siempre los mismos.', tipo: 'basta' },
  v40: {
    texto: 'Mi nena va a crecer viendo esto y a mí me hierve la sangre.',
    tipo: 'basta',
  },
  v41: { texto: 'Harto. No alcanza.', tipo: 'basta' },
  v42: { texto: 'Un respiro, aunque sea.', tipo: 'necesidad' },
  v43: { texto: 'Nadie se hace cargo.', tipo: 'basta' },
  v44: { texto: 'No me alcanza la guita.', tipo: 'basta' },
  v45: { texto: 'Ojalá los pibes se puedan quedar.', tipo: 'sueño' },
  v46: { texto: 'Pagamos los mismos.', tipo: 'basta' },
  v47: { texto: 'Falta que devuelvan lo que se llevaron.', tipo: 'necesidad' },
  v48: { texto: 'Roban y pagamos.', tipo: 'basta' },
  v49: {
    texto: 'Perdí lo poco que tenía y nadie me dio una explicación.',
    tipo: 'basta',
  },
  v50: { texto: 'Nos roban y nos mienten.', tipo: 'basta' },
  v51: { texto: 'Que inviertan en serio, hace falta.', tipo: 'necesidad' },
  v52: { texto: 'Los que roban, zafan.', tipo: 'basta' },
  v53: { texto: 'Cobro y no me alcanza.', tipo: 'basta' },
  v54: { texto: 'Necesitamos laburo.', tipo: 'necesidad' },
  v55: { texto: 'Acá estamos lejos de todo y se nota.', tipo: 'basta' },
  v56: { texto: 'Solos, y a nadie le importa.', tipo: 'basta' },
  v57: { texto: 'Falta que alguien venga a ver cómo vivimos.', tipo: 'necesidad' },
  v58: { texto: 'Los pibes arrancan perdiendo.', tipo: 'basta' },
  v59: { texto: 'Algún día vamos a respirar tranquilos.', tipo: 'sueño' },
  v60: { texto: 'Con este sueldo, podrido.', tipo: 'basta' },
  v61: { texto: 'Nos arreglamos entre nosotros.', tipo: 'basta' },
  v62: { texto: 'Acá falta lo básico.', tipo: 'necesidad' },
  v63: { texto: 'Que hagan algo, por favor. Falta eso.', tipo: 'necesidad' },
};

/**
 * El mandato del escenario 1: ninguno. Y la razón, con nombre.
 *
 * No es una omisión ni una falta de voluntad política: es que no hay con qué.
 * Tres ausencias, y cada una rompe una parte distinta de la maquinaria:
 *
 *  - **sin lugar no hay a quién reclamarle** — ninguna oficina del país tiene
 *    competencia sobre «el país está mal»;
 *  - **sin cosa no hay qué arreglar** — no hay un objeto que alguien pueda
 *    reparar y después mostrar reparado;
 *  - **sin fecha no hay plazo** — y sin plazo no existe el día en que se puede
 *    decir «esto se venció», que es lo único que convierte un pedido en una
 *    obligación.
 *
 * La legitimidad de este escenario es **idéntica** a la de los otros dos. Eso
 * no es un error de la fórmula: es la fórmula diciendo lo que tiene que decir.
 * Estas 63 personas representan exactamente lo mismo que las 63 del escenario
 * 3. Lo que cambia no es cuánto pesan: es qué se puede hacer con lo que
 * escribieron.
 */
export const MANDATO_BRONCA: MandatoDelEscenario = {
  hay: false,
  texto: 'Ninguno.',
  porQue:
    'Sin lugar no hay a quién reclamarle: no existe la oficina con competencia sobre «el país está mal». Sin cosa no hay qué arreglar: no hay un objeto que alguien pueda reparar y después mostrar reparado. Y sin fecha no hay plazo, así que no hay día en que se pueda decir «esto se venció». Las 63 voces son reales como bronca y verdaderas como estado de ánimo. Como mandato no alcanzan, y decirlo no es despreciarlas: es no usarlas para algo que no pueden sostener.',
  comoSeVerifica: null,
};

export const ESCENARIO_BRONCA: Escenario = {
  id: 'bronca',
  titulo: 'La bronca',
  resumen:
    'Sesenta y tres voces de bronca. Sin lugar, sin cosa, sin fecha. Es el escenario que más converge y el único que no habilita nada.',
  loQueSeVe:
    'Un núcleo de 31 voces —casi la mitad del corpus, casi el triple que el mayor del reclamo— y diecinueve voces solas alrededor. La bronca tiene un vocabulario chico y compartido, así que la máquina junta mucho; pero se junta por «harto», «podrido», «bronca», «roban», «alcanza», y ninguna de esas palabras dice dónde, qué ni cuándo. Que se vea antes de sacar la conclusión: converger no es corroborar.',
  voces: armarVoces({ dichos: DICHOS_BRONCA, corroboraciones: null }),
  mandato: MANDATO_BRONCA,
};
