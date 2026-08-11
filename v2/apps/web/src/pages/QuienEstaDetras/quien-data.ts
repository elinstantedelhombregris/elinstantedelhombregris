/**
 * Copy y slots de foto de «Quién está detrás»
 * (spec docs/specs/2026-08-10-quien-esta-detras.md).
 *
 * El JSX de las secciones no tiene texto: todo vive acá. Para completar la
 * página se edita este archivo y nada más.
 *
 * ─── LA COLUMNA VERTEBRAL DEL COPY ─────────────────────────────────────────
 * Una sola imagen sostiene toda la página, y no es una metáfora prestada: es
 * el oficio de Juan. Al agua no se la arregla — se le mejoran las cualidades
 * para que rinda más y se le sacan las impurezas. A la plata tampoco: se la
 * pule hasta que vuelve a reflejar. Argentina viene de *argentum*. Y Mendoza
 * es un desierto que se volvió tierra fértil no por abundancia sino por
 * reglas para repartir agua escasa.
 *
 * Agua · plata · tierra · semilla · pozo son un mismo campo, no cinco
 * metáforas apiladas. Cualquier reescritura debería quedarse adentro de él.
 * Y nunca hablar mal del agua: el agua es lo mejor que tenemos.
 *
 * ─── LO QUE FALTA CONFIRMAR ────────────────────────────────────────────────
 * Buscá el centinela `PENDIENTE`. Ninguno de esos huecos inventa un valor de
 * relleno: si todavía no hay número, no hay número (regla de la casa).
 *
 *   · el año en que arrancó ¡BASTA!
 *   · cuánto cuesta sostener el sitio por mes
 *   · las cuatro fotos en public/media/quien/
 * ───────────────────────────────────────────────────────────────────────────
 */

/** Marca visible de dato sin confirmar. Nunca se rellena con un invento. */
export const PENDIENTE = 'PENDIENTE' as const;

// ─── § 0 · Portada ──────────────────────────────────────────────────────────

export const PORTADA = {
  kicker: 'Quién está detrás · una persona · ningún cargo',
  titulo: ['Alguien tuvo que', 'plantarla.'],
  bajada:
    'Me llamo Juan Ignacio Bravin, soy de Mendoza. No inventé nada de lo que vas a leer en este sitio: la semilla ya vivía en la cabeza y en el corazón de mucha gente. Lo único que hice fue buscarle tierra.',
} as const;

// ─── § 1 · La ficha ─────────────────────────────────────────────────────────

export interface FilaFicha {
  etiqueta: string;
  valor: string;
}

export const FICHA: readonly FilaFicha[] = [
  { etiqueta: 'Nombre', valor: 'Juan Ignacio Bravin' },
  { etiqueta: 'De', valor: 'Mendoza, Argentina' },
  {
    etiqueta: 'Oficio',
    valor:
      'CEO y co-fundador de Kairospace Technologies. Trabajo con agua: le mejoro las cualidades para que rinda más y le saco las impurezas.',
  },
  { etiqueta: 'También', valor: 'Padre de tres niños. Pareja de una mujer. Emprendedor.' },
  { etiqueta: 'Acá', valor: 'Ningún cargo. Ninguna candidatura. Ningún voto que pedirte.' },
];

export const RETRATO = {
  src: null as string | null,
  archivo: 'public/media/quien/retrato.jpg',
  alt: 'Retrato de Juan Ignacio Bravin',
  epigrafe: 'Mendoza',
} as const;

export const FICHA_CIERRE =
  'Al agua no se la arregla. Se le devuelven sus cualidades para que rinda más, y se le sacan las impurezas que no le pertenecen. No sé hacer otra cosa, y es exactamente lo que vine a hacer acá. Cambia el material, no el oficio.';

// ─── § 2 · Por qué empecé esto ──────────────────────────────────────────────

export const POR_QUE = {
  kicker: '§ 02 — Por qué empecé esto',
  titulo: 'Golpeé puertas durante años hasta que entendí que el problema no era mi propuesta.',
  parrafos: [
    'Llevé propuestas al gobierno. Escritas, medidas, con números adentro. Muchas veces, durante años. Nunca me contestaron — y ojo con esto: no me dijeron que no. Nunca hubo un no que discutir. Hubo silencio, que es peor, porque contra el silencio no hay argumento posible.',
    'Un día dejé de creer que el problema era mi propuesta. El problema era que no existía el lugar donde dejarla. Y eso no es maldad de nadie: es un sistema mal diseñado. En la Argentina no hay ningún lugar donde un ciudadano deje una idea y esa idea quede registrada, visible y contable — imposible de perder en un cajón, porque el cajón es de todos.',
    'Lo primero que se me ocurrió fue un concurso de ideas. Después entendí que un concurso termina y esto no puede terminar. Hacía falta otra cosa: un lugar donde cualquiera pueda mostrar cómo cambiaría el país y decir qué necesita, sin pedirle permiso a nadie para que se escuche.',
    'Eso es todo lo que hice. La semilla ya estaba: está en cada sobremesa, en cada cola de banco, en cada charla que termina con «así no se puede seguir». Lo que faltaba nunca fue la semilla. Era la tierra.',
    'Y si me preguntás por qué yo y no otro, la respuesta no tiene nada de especial. Cada uno es un pozo que se va llenando con lo que le toca vivir, y en algún momento el pozo se desborda. El mío se desbordó acá.',
  ],
} as const;

export const FOTO_DOCUMENTAL_1 = {
  src: null as string | null,
  archivo: 'public/media/quien/documental-1.jpg',
  alt: 'PENDIENTE — foto de trabajo: el oficio, no una pose',
  epigrafe: PENDIENTE,
} as const;

// ─── § 3 · De dónde vengo ───────────────────────────────────────────────────

export const FOTO_DOCUMENTAL_2 = {
  src: null as string | null,
  archivo: 'public/media/quien/documental-2.jpg',
  alt: 'PENDIENTE — foto de contexto: Mendoza, el agua o la planta',
  epigrafe: PENDIENTE,
} as const;

export const TRAYECTORIA_TITULO = 'Nada de esto es un currículum. Es de dónde saqué el método.';

export interface FilaTrayectoria {
  num: string;
  titulo: string;
  cuerpo: string;
}

export const TRAYECTORIA: readonly FilaTrayectoria[] = [
  {
    num: '01',
    titulo: 'Mendoza',
    cuerpo:
      'Donde nací y donde vivo. Un desierto que se volvió tierra fértil, y no por abundancia: porque alguien se puso de acuerdo en cómo repartir el agua que había, y esas reglas se respetan hace siglos. Cuesta crecer acá y no entender que un país se hace con acuerdos que duran más que las personas que los firmaron.',
  },
  {
    num: '02',
    titulo: 'El agua',
    cuerpo:
      'El agua es lo mejor que tenemos y no hay que arreglarla. Mi trabajo es devolverle sus cualidades para que rinda más con menos, y sacarle las impurezas que no le pertenecen. No es un milagro, es un método: medís, intervenís, volvés a medir. Todo lo que hay en este sitio es ese mismo método aplicado a otra cosa.',
  },
  {
    num: '03',
    titulo: 'Kairospace Technologies',
    cuerpo:
      'La empresa que co-fundé y dirijo: tecnologías de tratamiento de agua, y algunas cositas más. Es de donde vengo y de lo que vivo. Lo aclaro por una razón sola: este proyecto no me paga el sueldo, y no está pensado para pagármelo nunca.',
  },
  {
    num: '04',
    titulo: 'Las puertas',
    cuerpo:
      'Años presentando propuestas al Estado sin obtener respuesta. Ahí aprendí lo único que hacía falta aprender, y no fue sobre política: fue sobre diseño. El problema no es que falten ideas. Es que falta el lugar donde dejarlas.',
  },
  {
    num: '05',
    titulo: 'La plataforma',
    cuerpo: `Desde ${PENDIENTE}, construyendo esto. Al principio solo. En el camino se fue sumando gente que me banca, me corrige y me empuja — y nada de lo que hay acá quedó escrito sin que alguien me lo discutiera antes.`,
  },
];

// ─── § 4 · Los dos nombres ──────────────────────────────────────────────────

export const NOMBRES = {
  kicker: '§ 04 — Los dos nombres',
  titulo: ['El primero salió de una charla.', 'El segundo, de una advertencia.'],
  basta: {
    sello: '¡BASTA!',
    parrafos: [
      'El nombre no lo puse yo solo. Salió de una charla con Ricardo, un amigo, dándole vueltas a una idea rara: que esto funcionara como un protocolo, o como un juego. Algo que la gente de Argentina pudiera jugar, y después cualquier país.',
      'Nos quedamos con ¡BASTA! porque es la palabra que ya dice todo el mundo, en voz baja, sin que le sirva de nada. Lo único que propone este sitio es que se diga en un lugar donde se cuente.',
    ],
  },
  hombreGris: {
    sello: 'El instante',
    parrafos: [
      'Hay una psicografía de Benjamín Solari Parravicini que dice que la Argentina tendrá su revolución francesa, y que puede ver sangre en la calle si no ve antes el instante del hombre gris.',
      'De ahí salió el nombre del sitio. No la tomo como una predicción a cumplir: la tomo como una advertencia que reparte una tarea. Si el instante del hombre gris es la alternativa a la sangre, entonces alguien tiene que fabricar ese instante y dejarlo al alcance de la mano.',
      'Gris tampoco es tibieza: gris es plata. Argentina viene de argentum. Y a la plata, igual que al agua, no se la arregla — se le saca lo que no le pertenece hasta que vuelve a reflejar. Resulta que es el mismo trabajo que hago todos los días, con otro material.',
      'Eso es lo que vengo cargando acá y lo que voy a seguir cargando: ideas y herramientas para resolver nuestras diferencias sin sangre. Que un hermano argentino dañe o mate a otro me hace mal. No tengo un argumento más elaborado que ese, y no me hace falta.',
    ],
  },
} as const;

// ─── § 5 · La semilla no es mía ─────────────────────────────────────────────

export const CITA_LA_IDEA = {
  texto: 'Si mañana desaparece el que escribió todo esto, no cambia nada. Esa es la idea.',
  fuente: 'La idea — Capítulo III',
  href: '/la-idea',
} as const;

export const CITA_BAJADA =
  'Esa frase la escribí yo, y me obliga. Así que acá está en concreto: cinco cosas que no puedo hacer, aunque quisiera.';

export interface Prohibicion {
  num: string;
  sello: string;
  cuerpo: string;
}

export const PROHIBICIONES: readonly Prohibicion[] = [
  {
    num: '01',
    sello: 'No puedo vetar',
    cuerpo:
      'No hay una sola voz que yo pueda borrar del mapa porque no me guste. Si me molesta lo que dice alguien, mi único recurso es el mismo que el tuyo: sembrar la mía al lado.',
  },
  {
    num: '02',
    sello: 'No puedo decidir',
    cuerpo:
      'El mandato sale de lo que converge entre miles de voces, no de lo que yo interprete que quisieron decir. Mi voz vale exactamente una voz, y la cuenta la hace el método, no yo.',
  },
  {
    num: '03',
    sello: 'No puedo cerrar',
    cuerpo:
      'Lo que se siembra acá es de quien lo sembró y es público. Si yo me cansara, me enfermara o me comprara alguien, el mapa se levanta en otro lado sin mí y no se pierde nada.',
  },
  {
    num: '04',
    sello: 'No puedo cobrar',
    cuerpo:
      'No vivo de esto ni voy a vivir de esto. Vivo de mi trabajo, que es otro y está a la vista. Acá no hay sueldos, y el día que los haya dejo de ser yo el que decide.',
  },
  {
    num: '05',
    sello: 'No puedo candidatearme',
    cuerpo:
      'No hay ningún cargo al que este proyecto me lleve. En el momento en que yo te pidiera un voto, esto dejaría de ser un método para pasar a ser una campaña. Son dos cosas distintas y no se mezclan.',
  },
];

export const PROHIBICIONES_CIERRE =
  'Ninguna de las cinco es una promesa de buena persona. Son reglas, y las reglas se pueden auditar. Si todo esto dependiera de que yo sea confiable, ya sería el mismo sistema de siempre con una cara nueva.';

// ─── § 6 · Quién paga esto ──────────────────────────────────────────────────

export const PLATA_TITULO = 'Lo primero que sospecha un argentino, contestado antes de que lo preguntes.';

export interface ColumnaPlata {
  titulo: string;
  filas: readonly string[];
  nota?: string;
}

export const PLATA: readonly ColumnaPlata[] = [
  {
    titulo: 'De dónde sale',
    filas: [
      'De mi bolsillo.',
      'De horas mías, de noche y de fin de semana.',
      'De horas de la gente que se fue sumando y no cobra.',
    ],
    nota: `Sostener el sitio cuesta algo de dinero por mes. Donde me gustaría ir es a tener infraestructura propia del movimiento para alojar la información en suelo argentino y en servidores que puedan correr la plataforma y procesar toda la información que espereo podamos generar.`,
  },
  {
    titulo: 'Quién no lo financia',
    filas: [
      'Ningún partido.',
      'Ningún gobierno, de ningún signo.',
      'Ninguna empresa, incluida la mía.',
      'Ninguna fundación con agenda.',
      'Ningún medio.',
    ],
  },
  {
    titulo: 'A dónde va',
    filas: [
      'Servidores y dominio.',
      'Las herramientas con las que está construido.',
      'Nada más. No hay sueldos, no hay pauta, no hay consultores.',
    ],
  },
];

export const PLATA_CIERRE =
  'El día que esto reciba plata de alguien más, va a estar escrito acá — con el nombre y el monto — antes de gastarse un peso.';

// ─── § 7 · Cierre ───────────────────────────────────────────────────────────

export const CIERRE = {
  titulo: ['No me sigas a mí.', 'Plantá la tuya.'],
  cuerpo:
    'Si llegaste hasta acá buscando a quién seguir, algo hice mal. Acá no hay a quién seguir: hay algo que hacer, y es lo mismo que hice yo. Poner lo que te pasa en un lugar donde pueda contarse.',
  cta: 'Sembrar mi voz',
} as const;

export const FIRMA = {
  src: null as string | null,
  archivo: 'public/media/quien/firma.png',
  alt: 'Firma de Juan Ignacio Bravin',
} as const;
