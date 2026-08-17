import { armarVoces } from './padron';

import type { IdDeVoz } from './padron';
import type { Dicho, Escenario, MandatoDelEscenario } from './tipos';

/**
 * Escenario 2 · El reclamo.
 *
 * **Las mismas 63 personas**, en los mismos barrios, en los mismos meses. Lo
 * único que cambió es que ahora nombran la cosa: «no hay agua en El Timbó desde
 * marzo», «la salita cierra a las dos», «el 60 no pasa después de las ocho».
 * Hay lugar, hay cosa, y a veces hay fecha.
 *
 * Y la constelación **se rompe**. Donde había un núcleo enorme aparecen varios
 * más chicos —el agua, la salita, el colectivo, la basura, la luz— y ninguno
 * tiene el tamaño del de la bronca. **Se ve peor y vale más**: por primera vez
 * alguien puede ir a mirar.
 *
 * Dos cosas están puestas acá a propósito, y las dos están para que el lector
 * desconfíe del instrumento en la misma pantalla en que aprende a usarlo:
 *
 *  - **El falso amigo** (`FALSO_AMIGO`): «la salita» que cierra a las dos es un
 *    centro de salud en Tucumán, y «la salita de 4» que no abrió en marzo es
 *    una sala de jardín en Rosario. Comparten la palabra más rara de las dos
 *    frases, así que cualquier medida de similitud las va a querer juntar. Son
 *    dos cosas distintas, en dos provincias distintas, con dos responsables
 *    distintos. El instrumento se equivoca, y tiene que poder verse.
 *  - **El núcleo mixto** (`NUCLEO_MIXTO`): el del agua junta hechos con deseos.
 *    Un `basta` se corrobora; un `sueño` y una `propuesta` se deliberan. No se
 *    resuelve por mayoría: cinco hechos y dos deseos no son «un núcleo de
 *    hechos», son cinco hechos y dos deseos, y siguen necesitando dos máquinas
 *    distintas.
 *
 * Las dos cosas están **medidas, no supuestas**: el test de `__tests__` corre
 * el motor de verdad sobre este corpus y falla si el falso amigo deja de
 * juntarse o si el núcleo del agua deja de ser mixto.
 */

/** La línea de colectivo sale del pedido de diseño; el ramal y el barrio son
 * inventados como todo lo demás. Nada de esto es un registro sobre un servicio
 * real: es una frase de ejemplo con la forma que tiene una queja de verdad. */
export const DICHOS_RECLAMO: Readonly<Record<IdDeVoz, Dicho>> = {
  // t1 · El Timbó (Chaco) — el agua
  v01: { texto: 'En El Timbó no sale agua de la canilla desde marzo.', tipo: 'basta' },
  v02: {
    texto: 'En El Timbó compramos agua en bidones. De la canilla no sale nada.',
    tipo: 'basta',
  },
  v03: { texto: 'Acá en El Timbó el agua llega a la madrugada un rato y nada más.', tipo: 'basta' },
  v04: {
    texto: 'Necesitamos el camión de agua en El Timbó, aunque sea día por medio.',
    tipo: 'necesidad',
  },
  v05: { texto: 'Mi vieja tiene 78 y acarrea baldes. En El Timbó no hay agua.', tipo: 'basta' },
  v06: {
    texto:
      'Propongo un tanque de agua comunitario en El Timbó. Así dejamos de comprar agua en bidones.',
    tipo: 'propuesta',
  },
  v07: {
    texto: 'Sueño con abrir la canilla en El Timbó y que salga agua. Nada más que eso.',
    tipo: 'sueño',
  },
  v08: { texto: 'Che, en El Timbó seguimos sin agua. Van seis meses.', tipo: 'basta' },
  // t1 · la salita
  v09: { texto: 'La salita del barrio no abre a la tarde. Cierra a las dos.', tipo: 'basta' },
  v10: { texto: 'En la salita del barrio no hay pediatra. Te mandan al hospital.', tipo: 'basta' },
  v11: { texto: 'Necesitamos que la salita del barrio abra a la tarde.', tipo: 'necesidad' },
  // t1 · la calle
  v12: { texto: 'Cuando llueve la calle del barrio es todo barro y no se entra.', tipo: 'basta' },
  v13: {
    texto: 'La calle del fondo es puro barro. La ambulancia no entra al barrio.',
    tipo: 'basta',
  },
  v14: {
    texto: 'Hace falta ripio en la calle del fondo del barrio. Cuatro cuadras.',
    tipo: 'necesidad',
  },
  // t2 · Los Tarcos (Tucumán) — la salita ← falso amigo, lado A
  v15: { texto: 'La salita del barrio no abre a la tarde.', tipo: 'basta' },
  v16: { texto: 'En la salita dan cuatro turnos por día y a las siete ya no hay.', tipo: 'basta' },
  v17: { texto: 'Fui tres veces a la salita del barrio y estaba cerrada las tres.', tipo: 'basta' },
  v18: { texto: 'Necesitamos que la salita del barrio abra el fin de semana.', tipo: 'necesidad' },
  v19: { texto: 'En la salita no hay ni ibuprofeno. Te mandan a la farmacia.', tipo: 'basta' },
  v20: { texto: 'Ojalá la salita del barrio abra como corresponde alguna vez.', tipo: 'sueño' },
  // t2 · la luz
  v21: { texto: 'Se corta la luz todos los días a la siesta, en pleno enero.', tipo: 'basta' },
  v22: {
    texto: 'Se cortó la luz seis veces en una semana. Se me quemó la heladera.',
    tipo: 'basta',
  },
  v23: {
    texto: 'Hace falta cambiar el transformador del barrio. Se corta la luz siempre.',
    tipo: 'necesidad',
  },
  // t2 · el agua
  v24: {
    texto: 'Acá el agua no sube al tanque. Sube hasta la primera casa y listo.',
    tipo: 'basta',
  },
  v25: { texto: 'El agua sale marrón cuando sale.', tipo: 'basta' },
  // t3 · Los Ceibos del Oeste (Buenos Aires) — el colectivo
  v26: { texto: 'El 60 no pasa después de las ocho de la noche.', tipo: 'basta' },
  v27: {
    texto: 'Espero el colectivo cincuenta minutos para ir a laburar. Todos los días.',
    tipo: 'basta',
  },
  v28: { texto: 'Del centro al barrio de noche no volvés: no pasa el colectivo.', tipo: 'basta' },
  v29: { texto: 'Necesitamos que el colectivo pase los domingos al barrio.', tipo: 'necesidad' },
  v30: { texto: 'El 60 entraba al barrio y ahora te deja a doce cuadras.', tipo: 'basta' },
  v31: {
    texto:
      'Mi hija sale del secundario a las diez de la noche y vuelve caminando. No pasa el colectivo.',
    tipo: 'basta',
  },
  v32: {
    texto: 'Che, ¿el 60 pasó anoche después de las nueve? Yo me fui a pata.',
    tipo: 'pregunta',
  },
  // t3 · la basura
  v33: {
    texto: 'Hay un basural a cielo abierto en el terreno de atrás de la escuela.',
    tipo: 'basta',
  },
  v34: {
    texto: 'Hace tres semanas que no pasa el camión de la basura por el barrio.',
    tipo: 'basta',
  },
  v35: { texto: 'Tiraron escombros en el terreno de la esquina y nadie hace nada.', tipo: 'basta' },
  v36: {
    texto: 'Necesitamos contenedores de basura en las esquinas del barrio.',
    tipo: 'necesidad',
  },
  // t3 · el alumbrado
  v37: {
    texto: 'No hay una sola luz prendida en las cuatro cuadras de la escuela.',
    tipo: 'basta',
  },
  v38: {
    texto: 'A la noche el barrio está a oscuras. No hay luz en las cuadras de la escuela.',
    tipo: 'basta',
  },
  // t4 · La Cañada Vieja (Santa Fe) — la salita de 4 ← falso amigo, lado B
  v39: { texto: 'En la salita de 4 del barrio no hay vacantes. Quedamos afuera.', tipo: 'basta' },
  v40: { texto: 'Mi nena quedó sin sala de 4 este año. No entró nadie del barrio.', tipo: 'basta' },
  v41: { texto: 'La salita de 4 del barrio no abre desde marzo.', tipo: 'basta' },
  v42: {
    texto: 'Necesitamos otra sala de 4: hay treinta anotados y veinte lugares.',
    tipo: 'necesidad',
  },
  v43: {
    texto: 'En el jardín se llueve el techo del aula y mandan a los chicos a casa.',
    tipo: 'basta',
  },
  // t4 · el agua
  v44: { texto: 'Acá el agua no sube al tanque. Nos bañamos con balde.', tipo: 'basta' },
  v45: {
    texto: 'Ojalá algún día podamos abrir la ducha y bañarnos con agua de la red.',
    tipo: 'sueño',
  },
  // t4 · la calle
  v46: {
    texto: 'Cuando llueve fuerte se inunda la cuadra y entra el agua a las casas.',
    tipo: 'basta',
  },
  v47: { texto: 'Necesitamos que limpien el zanjón. Está tapado hace años.', tipo: 'necesidad' },
  // t5 · Alto de la Cruz (Córdoba) — la luz
  v48: { texto: 'Se corta la luz cada vez que llueve. Siempre.', tipo: 'basta' },
  v49: { texto: 'Estuvimos dos días sin luz y se echó a perder toda la comida.', tipo: 'basta' },
  v50: { texto: 'Se cae la tensión y titilan las lámparas. La luz no da abasto.', tipo: 'basta' },
  v51: {
    texto: 'Hace falta reforzar la línea. La luz no da abasto en el barrio.',
    tipo: 'necesidad',
  },
  // t5 · el agua
  v52: {
    texto: 'El agua también se corta cuando se corta la luz: la bomba es eléctrica.',
    tipo: 'basta',
  },
  // t5 · la changa
  v53: { texto: 'Acá el que labura, labura de changa. Laburo fijo no hay.', tipo: 'basta' },
  v54: {
    texto: 'Necesitamos que abran la bolsa de trabajo del municipio. Está cerrada.',
    tipo: 'necesidad',
  },
  // t6 · San Ramón Chico (Misiones) — el camino
  v55: {
    texto: 'El camino a la colonia es de tierra. Con lluvia no entra ni sale nadie.',
    tipo: 'basta',
  },
  v56: { texto: 'La ambulancia no llegó a la colonia: se empantanó en el camino.', tipo: 'basta' },
  v57: {
    texto: 'Necesitamos que pasen la máquina por el camino de la colonia.',
    tipo: 'necesidad',
  },
  // t6 · la escuela
  v58: {
    texto: 'En la escuela de la colonia no hay internet. Los chicos usan el celular de la madre.',
    tipo: 'basta',
  },
  v59: {
    texto: 'Ojalá los chicos de la colonia puedan estudiar sin irse del pueblo.',
    tipo: 'sueño',
  },
  // t7 · El Zanjón (Salta) — la luz
  v60: { texto: 'Acá se corta la luz seguido y nadie avisa nada.', tipo: 'basta' },
  v61: {
    texto: 'Tenemos un solo poste de luz para toda la manzana. Colgados como podemos.',
    tipo: 'basta',
  },
  // t7 · el agua
  v62: {
    texto: 'Acá no hay agua de red. Traemos agua en bidones de la canilla de la esquina.',
    tipo: 'basta',
  },
  v63: {
    texto: 'Hace falta que extiendan la red de agua. Faltan seis cuadras.',
    tipo: 'necesidad',
  },
};

/**
 * El falso amigo, con nombre y apellido.
 *
 * `v15` habla de un **centro de salud** en San Miguel de Tucumán. `v41` habla
 * de una **sala de jardín de infantes** en Rosario. Las dos dicen «la salita»,
 * que es la palabra más rara de las dos frases y por lo tanto la que más pesa
 * en cualquier bolsa de palabras. Se van a juntar.
 *
 * Que se junten no es un defecto que haya que esconder subiendo el umbral: es
 * lo que un instrumento de convergencia hace, y el lector tiene derecho a
 * verlo. Lo que separa a estas dos señales no es un umbral mejor — es que
 * alguien escriba el nombre completo de la cosa. Y eso es justamente lo que
 * pasa en el escenario 3, donde «la salita» desaparece y quedan «CAPS Villa Los
 * Tarcos» y «sala de 4 de la Escuela N.º 1123». El falso amigo se deshace solo,
 * y no lo deshizo la máquina: lo deshizo la precisión de quien escribió.
 */
export const FALSO_AMIGO = {
  a: 'v15',
  b: 'v41',
  porQue:
    '«La salita» es el centro de salud en Tucumán y la sala de 4 del jardín en Rosario. Misma palabra, dos cosas, dos provincias, dos responsables. La máquina las junta; sólo alguien que lea las separa.',
} as const;

/**
 * El núcleo mixto, señalado antes de que se dibuje.
 *
 * En el racimo del agua conviven `basta` y `necesidad` —hechos, que se
 * corroboran— con `propuesta` y `sueño` —deseos, que se deliberan—. La regla 11
 * del canon prohíbe resolverlo por mayoría: un núcleo es de una clase sólo si
 * **todas** sus señales lo son, y con una sola de otra clase adentro es mixto.
 * `rotuloDeNucleo` en `radiografia-data.ts` ya lo hace así; esto está acá para
 * que el ejemplo lo ejercite en vez de suponerlo.
 */
export const NUCLEO_MIXTO = {
  hechos: ['v01', 'v02', 'v03', 'v25', 'v62'],
  deseos: ['v06', 'v07'],
  porQue:
    'Que no haya agua desde marzo es un hecho: alguien puede ir a abrir la canilla. Que haya un tanque comunitario en el barrio es una propuesta, y querer que salga agua de la canilla es un sueño: las dos se deliberan, no se comprueban. Están en el mismo racimo porque hablan del agua del mismo lugar, y siguen necesitando dos máquinas distintas. Cinco contra dos no convierte a las dos en hechos.',
} as const;

/**
 * El mandato del escenario 2: existe, y todavía es blando.
 *
 * Alcanza para exigir. No alcanza para vencer: no hay una fecha desde la cual
 * contar, así que no hay un día en el que el incumplimiento tenga nombre.
 */
export const MANDATO_RECLAMO: MandatoDelEscenario = {
  hay: true,
  texto:
    'Que vuelva el agua de red al barrio El Timbó, en Resistencia. Que la salita del barrio atienda también a la tarde. Que el ramal que entra a Los Ceibos del Oeste vuelva a pasar de noche. Hay lugar y hay cosa: alguien puede ir a mirar, y quien tiene la competencia sobre cada una de las tres tiene nombre.',
  porQue:
    'Con lugar y con cosa ya hay a quién reclamarle: el agua tiene una prestadora, la salita tiene una secretaría, el colectivo tiene una autoridad de transporte. Lo que falta es la fecha. Sin fecha no hay plazo, y sin plazo un mandato es un pedido educado: se puede contestar «lo estamos viendo» para siempre sin incumplir nada.',
  comoSeVerifica:
    'Yendo. Cualquiera puede ir a la canilla, a la puerta de la salita a las tres de la tarde, o a la parada a las nueve de la noche. Todavía no está escrito cuándo hay que ir ni desde cuándo cuenta, así que la comprobación depende de la buena voluntad del que va.',
};

export const ESCENARIO_RECLAMO: Escenario = {
  id: 'reclamo',
  titulo: 'El reclamo',
  resumen:
    'Las mismas 63 voces, ahora nombrando la cosa. Hay lugar, hay cosa, a veces hay fecha. Se puede ir a mirar.',
  loQueSeVe:
    'La constelación se rompe: de una estrella de 60 se pasa a ocho núcleos, y el mayor tiene once. El agua, la salita, el colectivo, la basura, la luz. Se ve peor que la bronca y vale más. Uno de esos ocho no existe —junta dos «salitas» que son cosas distintas— y otro mezcla hechos con deseos: las dos cosas están puestas a propósito.',
  voces: armarVoces({ dichos: DICHOS_RECLAMO, corroboraciones: null }),
  mandato: MANDATO_RECLAMO,
};
