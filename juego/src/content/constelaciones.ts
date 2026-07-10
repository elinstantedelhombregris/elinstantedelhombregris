import type { Constelacion } from './types';

/**
 * Las ocho constelaciones coleccionables.
 * La receta de cada una suma exactamente los puntos de su silueta:
 * cada estrella capturada ocupa un lugar del dibujo.
 * Las cartas de lore citan VERBATIM a los ensayos (con su título como atribución).
 */
export const CONSTELACIONES: Constelacion[] = [
  {
    id: 'cuidado',
    nombre: 'La Constelación del Cuidado',
    descripcion:
      'Las estrellas de los que sostienen a otros: faltas vistas a tiempo, recursos ofrecidos, manos que no piden nada a cambio.',
    // 6 + 4 + 2 = 12 estrellas — una mano abierta.
    receta: { need: 6, recurso: 4, value: 2 },
    silueta: [
      { x: 0.5, y: 0.94 }, // muñeca
      { x: 0.31, y: 0.76 }, // palma izquierda
      { x: 0.69, y: 0.74 }, // palma derecha
      { x: 0.14, y: 0.54 }, // pulgar
      { x: 0.34, y: 0.19 }, // índice
      { x: 0.48, y: 0.1 }, // mayor
      { x: 0.62, y: 0.16 }, // anular
      { x: 0.79, y: 0.3 }, // meñique
      { x: 0.37, y: 0.44 }, // nudillo 1
      { x: 0.49, y: 0.38 }, // nudillo 2
      { x: 0.61, y: 0.42 }, // nudillo 3
      { x: 0.71, y: 0.5 }, // nudillo 4
    ],
    carta: {
      titulo: 'La atención que no pide vuelto',
      cita:
        'El amor es atención. Es la disposición sostenida hacia el bien del otro, sin que el otro tenga que darme nada a cambio.',
      ensayo: 'El amor sin apego',
    },
  },
  {
    id: 'coraje',
    nombre: 'La Constelación del Coraje',
    descripcion:
      'Se enciende con cada ¡basta! dicho a tiempo. La antorcha de los que no miraron para otro lado.',
    // 6 + 2 + 2 = 10 estrellas — una antorcha.
    receta: { basta: 6, compromiso: 2, value: 2 },
    silueta: [
      { x: 0.52, y: 0.06 }, // punta de la llama
      { x: 0.41, y: 0.17 }, // llama izquierda
      { x: 0.61, y: 0.15 }, // llama derecha
      { x: 0.49, y: 0.25 }, // corazón de la llama
      { x: 0.36, y: 0.37 }, // borde del cuenco
      { x: 0.65, y: 0.36 }, // borde del cuenco
      { x: 0.5, y: 0.45 }, // cuello
      { x: 0.48, y: 0.61 }, // mango
      { x: 0.53, y: 0.77 }, // mango
      { x: 0.5, y: 0.93 }, // base
    ],
    carta: {
      titulo: 'Lo que no se perdona no haber hecho',
      cita:
        'Nos juntamos porque no queríamos morir, veinte años después, habiendo sabido qué hacer y no haberlo hecho.',
      ensayo: 'Carta al Nieto',
    },
  },
  {
    id: 'palabra',
    nombre: 'La Constelación de la Palabra',
    descripcion:
      'Lo que se dice y se cumple: valores puestos en voz alta, compromisos sostenidos, sueños con nombre.',
    // 4 + 4 + 2 = 10 estrellas — un libro abierto.
    receta: { value: 4, compromiso: 4, dream: 2 },
    silueta: [
      { x: 0.5, y: 0.32 }, // lomo, arriba
      { x: 0.5, y: 0.8 }, // lomo, abajo
      { x: 0.14, y: 0.24 }, // esquina superior izquierda
      { x: 0.08, y: 0.55 }, // borde externo izquierdo
      { x: 0.2, y: 0.72 }, // esquina inferior izquierda
      { x: 0.86, y: 0.25 }, // esquina superior derecha
      { x: 0.92, y: 0.56 }, // borde externo derecho
      { x: 0.8, y: 0.73 }, // esquina inferior derecha
      { x: 0.31, y: 0.42 }, // página izquierda
      { x: 0.69, y: 0.43 }, // página derecha
    ],
    carta: {
      titulo: 'Una palabra para redimir',
      cita:
        'La democracia no es una palabra para defender. Es una palabra para redimir.',
      ensayo: 'La falacia de la democracia',
    },
  },
  {
    id: 'encuentro',
    nombre: 'La Constelación del Encuentro',
    descripcion:
      'El puente entre orillas que no se hablaban. Se completa mezclando de todo un poco, como una mesa bien servida.',
    // 3 + 3 + 3 + 3 = 12 estrellas — un puente.
    receta: { value: 3, need: 3, recurso: 3, dream: 3 },
    silueta: [
      { x: 0.22, y: 0.28 }, // torre izquierda, cima
      { x: 0.78, y: 0.3 }, // torre derecha, cima
      { x: 0.21, y: 0.74 }, // torre izquierda, base
      { x: 0.79, y: 0.75 }, // torre derecha, base
      { x: 0.04, y: 0.62 }, // tablero, orilla izquierda
      { x: 0.35, y: 0.64 }, // tablero
      { x: 0.5, y: 0.65 }, // tablero, centro
      { x: 0.65, y: 0.64 }, // tablero
      { x: 0.96, y: 0.61 }, // tablero, orilla derecha
      { x: 0.35, y: 0.42 }, // cable izquierdo
      { x: 0.5, y: 0.5 }, // cable, punto bajo
      { x: 0.64, y: 0.43 }, // cable derecho
    ],
    carta: {
      titulo: 'Una cara con nombre',
      cita:
        'No hace falta hablar de política. Hace falta que, cuando la próxima ola de rabia organizada baje por el feed, del otro lado haya una cara con nombre y no una categoría.',
      ensayo: 'La práctica del tejido',
    },
  },
  {
    id: 'memoria',
    nombre: 'La Constelación de la Memoria',
    descripcion:
      'El árbol que recuerda sin quedarse quieto: raíces en lo que pasó, ramas en lo que viene.',
    // 5 + 3 + 3 = 11 estrellas — un árbol.
    receta: { value: 5, dream: 3, need: 3 },
    silueta: [
      { x: 0.5, y: 0.08 }, // copa, punta
      { x: 0.36, y: 0.16 }, // copa interna izquierda
      { x: 0.63, y: 0.15 }, // copa interna derecha
      { x: 0.27, y: 0.27 }, // copa izquierda
      { x: 0.73, y: 0.25 }, // copa derecha
      { x: 0.2, y: 0.45 }, // rama baja izquierda
      { x: 0.79, y: 0.43 }, // rama baja derecha
      { x: 0.51, y: 0.56 }, // tronco, alto
      { x: 0.49, y: 0.7 }, // tronco, medio
      { x: 0.36, y: 0.89 }, // raíz izquierda
      { x: 0.63, y: 0.91 }, // raíz derecha
    ],
    carta: {
      titulo: 'La piedra en el bolsillo',
      cita:
        'El recuerdo es como una piedra en el bolsillo: la llevás, te recuerda algo, no te define. La identificación, en cambio, es como una piedra atada al pie: te frena, te define, no te deja moverte.',
      ensayo: 'La libertad de lo conocido',
    },
  },
  {
    id: 'trabajo',
    nombre: 'La Constelación del Trabajo',
    descripcion:
      'La ola que vuelve todos los días: compromisos cumplidos, recursos puestos a rodar, constancia sin épica.',
    // 5 + 2 + 2 = 9 estrellas — una ola.
    receta: { compromiso: 5, recurso: 2, need: 2 },
    silueta: [
      { x: 0.04, y: 0.62 },
      { x: 0.16, y: 0.46 },
      { x: 0.29, y: 0.34 }, // cresta primera
      { x: 0.41, y: 0.4 },
      { x: 0.51, y: 0.56 },
      { x: 0.61, y: 0.71 }, // valle
      { x: 0.74, y: 0.66 },
      { x: 0.87, y: 0.5 },
      { x: 0.96, y: 0.36 }, // cresta que viene
    ],
    carta: {
      titulo: 'Los que construyen ahora',
      cita:
        'Los ciudadanos que construyen ahora fijan la arquitectura del próximo siglo. Los ciudadanos que esperan, heredan lo que otros construyeron durante la espera.',
      ensayo: 'Una arquitectura para el hombre gris',
    },
  },
  {
    id: 'belleza',
    nombre: 'La Constelación de la Belleza',
    descripcion:
      'Sueños y valores, nada más: la estrella que se dibuja cuando alguien vuelve a preguntar si es hermoso.',
    // 5 + 5 = 10 estrellas — una estrella de cinco puntas.
    receta: { dream: 5, value: 5 },
    silueta: [
      { x: 0.5, y: 0.06 }, // punta superior
      { x: 0.92, y: 0.38 }, // punta derecha
      { x: 0.76, y: 0.9 }, // punta inferior derecha
      { x: 0.24, y: 0.88 }, // punta inferior izquierda
      { x: 0.08, y: 0.36 }, // punta izquierda
      { x: 0.59, y: 0.33 }, // vértice interno
      { x: 0.66, y: 0.56 }, // vértice interno
      { x: 0.5, y: 0.7 }, // vértice interno
      { x: 0.34, y: 0.55 }, // vértice interno
      { x: 0.41, y: 0.32 }, // vértice interno
    ],
    carta: {
      titulo: 'El combustible',
      cita: 'La belleza es el combustible del trabajo.',
      ensayo: 'La belleza como acto político',
    },
  },
  {
    id: 'aurora',
    nombre: 'La Constelación de la Aurora',
    descripcion:
      'La última constelación: todas las luces juntas. Cuando se completa, la noche empieza a terminarse.',
    // 3 + 3 + 3 + 3 + 2 + 2 = 16 estrellas — un sol asomando en el horizonte.
    receta: { dream: 3, value: 3, need: 3, basta: 3, compromiso: 2, recurso: 2 },
    silueta: [
      { x: 0.03, y: 0.74 }, // horizonte, oeste
      { x: 0.97, y: 0.73 }, // horizonte, este
      { x: 0.29, y: 0.7 }, // disco
      { x: 0.35, y: 0.58 }, // disco
      { x: 0.42, y: 0.5 }, // disco
      { x: 0.5, y: 0.47 }, // disco, cenit
      { x: 0.58, y: 0.5 }, // disco
      { x: 0.65, y: 0.57 }, // disco
      { x: 0.71, y: 0.69 }, // disco
      { x: 0.5, y: 0.12 }, // rayo vertical
      { x: 0.36, y: 0.2 }, // rayo
      { x: 0.64, y: 0.19 }, // rayo
      { x: 0.2, y: 0.31 }, // rayo
      { x: 0.8, y: 0.3 }, // rayo
      { x: 0.09, y: 0.51 }, // rayo rasante oeste
      { x: 0.91, y: 0.5 }, // rayo rasante este
    ],
    carta: {
      titulo: 'La fe del tejedor',
      cita:
        'La fe es la lealtad a una realidad invisible. El marino la tiene con la corriente que no ve. El sembrador, con la primavera que todavía no llegó.',
      ensayo: 'Acta de la Interdependencia',
    },
  },
];
