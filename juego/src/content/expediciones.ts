import type { PlantillaExpedicion } from './types';

/**
 * Las cinco plantillas de expedición precargadas.
 * Cada paso trae su micro-UI propia — nunca un formulario plano.
 * Copy rioplatense, en segunda persona, tono de juego.
 */
export const PLANTILLAS_EXPEDICION: PlantillaExpedicion[] = [
  {
    id: 'exp-luminarias',
    slug: 'luminarias',
    titulo: 'Luminarias apagadas',
    descripcion:
      'Salí a cazar luces muertas. Cada poste apagado que marcás es una esquina que puede volver a verse de noche.',
    senal: 'need',
    metaSugerida: 10,
    duracionDiasSugerida: 7,
    pasos: [
      {
        key: 'foto',
        titulo: 'La caza',
        instruccion:
          'Cazá la luminaria: sacale una foto de lejos que se vea el poste entero.',
        microUI: 'foto-guiada',
      },
      {
        key: 'estado',
        titulo: 'La falla',
        instruccion: '¿Qué hace esa luminaria? Elegí lo que viste, sin adivinar la causa.',
        microUI: 'chips',
        opciones: ['Apagada', 'Intermitente', 'Rota', 'Cables expuestos'],
      },
      {
        key: 'urgencia',
        titulo: 'La urgencia',
        instruccion:
          '¿Cuánta falta hace esa luz? Un sol si apenas molesta, cinco si la cuadra da miedo de noche.',
        microUI: 'rating-soles',
        max: 5,
      },
    ],
  },
  {
    id: 'exp-comedores',
    slug: 'comedores',
    titulo: 'Ollas del barrio',
    descripcion:
      'Mapeá los comedores y ollas que sostienen tu zona. Que se sepa dónde se cocina para muchos y cuánta gente depende de ese fuego.',
    senal: 'recurso',
    metaSugerida: 5,
    duracionDiasSugerida: 14,
    pasos: [
      {
        key: 'nombre',
        titulo: 'El nombre',
        instruccion:
          'Preguntá cómo se llama el comedor, o quién lo lleva adelante. Los nombres importan: anotalo bien.',
        microUI: 'texto-corto',
      },
      {
        key: 'personas',
        titulo: 'Las bocas',
        instruccion:
          '¿Cuántas personas comen ahí por día? Si no hay número exacto, preguntá y redondeá para abajo.',
        microUI: 'contador',
      },
      {
        key: 'foto',
        titulo: 'El retrato',
        instruccion:
          'Retratalo con respeto: la fachada, la olla o el cartel. Nada de caras sin permiso.',
        microUI: 'foto-guiada',
      },
      {
        key: 'necesidad',
        titulo: 'Lo que falta ahora',
        instruccion: '¿Qué aporte destrabaría más la próxima jornada? Elegí una prioridad concreta.',
        microUI: 'chips',
        opciones: ['Alimentos secos', 'Verduras', 'Gas para cocinar', 'Higiene', 'Utensilios'],
      },
    ],
  },
  {
    id: 'exp-precios',
    slug: 'precios',
    titulo: 'Precios de la canasta',
    descripcion:
      'La canasta, góndola por góndola. Datos de verdad contra el "me parece que aumentó". Tu barrio pone los números.',
    senal: 'need',
    metaSugerida: 15,
    duracionDiasSugerida: 7,
    pasos: [
      {
        key: 'producto',
        titulo: 'El producto',
        instruccion: '¿Qué tenés enfrente en la góndola? Elegí el producto de la canasta.',
        microUI: 'chips',
        opciones: [
          'Pan',
          'Leche',
          'Yerba',
          'Aceite',
          'Harina',
          'Azúcar',
          'Fideos',
          'Arroz',
          'Papa',
          'Huevos',
        ],
      },
      {
        key: 'precio',
        titulo: 'El precio',
        instruccion:
          'Anotá el precio en pesos, tal cual está en la etiqueta. Sin redondear: el dato es sagrado.',
        microUI: 'contador',
      },
    ],
  },
  {
    id: 'exp-basurales',
    slug: 'basurales',
    titulo: 'Basurales a cielo abierto',
    descripcion:
      'Marcá dónde la basura se junta y se queda. Lo que no se ve no se limpia jamás: hacelo visible.',
    senal: 'basta',
    metaSugerida: 8,
    duracionDiasSugerida: 10,
    pasos: [
      {
        key: 'foto',
        titulo: 'La evidencia',
        instruccion: 'Sacá la foto de lejos, que entre todo. El tamaño es el dato.',
        microUI: 'foto-guiada',
      },
      {
        key: 'tamano',
        titulo: 'El tamaño',
        instruccion:
          '¿Qué tan grande es? Un sol: unas bolsas sueltas. Cinco soles: un basural hecho y derecho.',
        microUI: 'rating-soles',
        max: 5,
      },
    ],
  },
  {
    id: 'exp-que-falta',
    slug: 'que-falta',
    titulo: '¿Qué falta acá?',
    descripcion:
      'Una consulta a cielo abierto: preguntale a la gente qué falta en el barrio. Vos ponés la oreja; el cielo junta las voces.',
    senal: 'dream',
    metaSugerida: 20,
    duracionDiasSugerida: 14,
    pasos: [
      {
        key: 'categoria',
        titulo: 'La pregunta',
        instruccion:
          'Preguntale a alguien del barrio: ¿qué falta acá? Marcá de qué va la respuesta.',
        microUI: 'chips',
        opciones: [
          'Salud',
          'Trabajo',
          'Seguridad',
          'Transporte',
          'Espacios verdes',
          'Educación',
          'Cultura',
          'Agua y cloacas',
          'Iluminación',
          'Otra cosa',
        ],
      },
      {
        key: 'voz',
        titulo: 'La voz',
        instruccion:
          'Anotá la respuesta corta y textual, con las palabras del otro. No la traduzcas.',
        microUI: 'texto-corto',
      },
    ],
  },
];
