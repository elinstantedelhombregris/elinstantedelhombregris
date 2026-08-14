export interface CourseVisual {
  src: string;
  alt: string;
  caption: string;
  credit: 'Ilustración original' | 'Diagrama original';
}

const PIEZAS = {
  sistemaVivo: {
    src: '/course-illustrations/sistema-vivo.webp',
    alt: 'Territorio visto como un sistema vivo: agua, producción, transporte, instituciones y comunidad conectados por flujos visibles.',
    caption: 'Nada funciona aislado: cambiar una parte también mueve relaciones, demoras y consecuencias en el resto del sistema.',
    credit: 'Ilustración original',
  },
  evidenciaCiudadana: {
    src: '/course-illustrations/evidencia-ciudadana.webp',
    alt: 'Grupo de ciudadanos que transforma una afirmación ruidosa en evidencia mediante documentos, mapas, datos y contraste de fuentes.',
    caption: 'Del ruido a una decisión pública mejor: separar afirmación, evidencia, incertidumbre y consecuencia.',
    credit: 'Ilustración original',
  },
  economiaResiliente: {
    src: '/course-illustrations/economia-resiliente.webp',
    alt: 'Familias y vecinos organizan recursos, reparan, producen y construyen amortiguadores frente a una economía turbulenta.',
    caption: 'La resiliencia económica no es adivinar el futuro: es ganar margen de maniobra antes de que llegue el próximo movimiento.',
    credit: 'Ilustración original',
  },
  puentesDialogo: {
    src: '/course-illustrations/puentes-dialogo.webp',
    alt: 'Dos grupos separados reparan un puente, sostienen conversaciones de a pares y construyen una mesa circular compartida.',
    caption: 'Conversar no borra el desacuerdo: construye una estructura capaz de sostenerlo sin romper el vínculo.',
    credit: 'Ilustración original',
  },
  resiliencia: {
    src: '/course-illustrations/resiliencia.webp',
    alt: 'Personas atraviesan una tormenta emocional mediante pausa, descanso, límites, apoyo mutuo y pequeñas acciones con propósito.',
    caption: 'Regular no es apagar lo que sentís: es recuperar suficiente espacio para elegir el próximo movimiento.',
    credit: 'Ilustración original',
  },
  accionIterativa: {
    src: '/course-illustrations/accion-iterativa.webp',
    alt: 'Tres vecinos convierten una preocupación en un ciclo de mapeo, prototipo, acción, medición, ajuste y aprendizaje compartido.',
    caption: 'Una acción pequeña se vuelve proyecto cuando deja evidencia, aprende y puede volver a empezar mejor.',
    credit: 'Ilustración original',
  },
  refinamientoColectivo: {
    src: '/course-illustrations/refinamiento-colectivo.webp',
    alt: 'Muchas manos observan, calientan, enfrían y pulen mineral gris hasta convertirlo en pequeñas piezas que iluminan un camino común.',
    caption: 'La transformación profunda no es un instante heroico: es oficio, contraste, paciencia y trabajo distribuido.',
    credit: 'Ilustración original',
  },
  historiaLarga: {
    src: '/course-diagrams/historia-1810-1945.svg',
    alt: 'Línea de tiempo entre 1810 y 1945 con hitos institucionales, electorales, económicos y sociales de la Argentina.',
    caption: 'Una línea de tiempo sirve para ordenar hechos; las flechas recuerdan que ningún período tiene una sola causa.',
    credit: 'Diagrama original',
  },
  penduloPolitico: {
    src: '/course-diagrams/pendulo-1945-2001.svg',
    alt: 'Diagrama de péndulo entre 1945 y 2001 que alterna apertura y cierre político sobre una continuidad social y económica.',
    caption: 'El péndulo muestra alternancias; la línea inferior obliga a mirar también qué continuó mientras cambiaban los gobiernos.',
    credit: 'Diagrama original',
  },
} satisfies Record<string, CourseVisual>;

type Pieza = keyof typeof PIEZAS;

const PIEZA_POR_CURSO: Record<string, Pieza> = {
  'accion-comunitaria': 'accionIterativa',
  'alfabetismo-mediatico-desinformacion': 'evidenciaCiudadana',
  'argentina-1810-1945-sistema-que-construimos': 'historiaLarga',
  'argentina-1945-2001-pendulo-nunca-para': 'penduloPolitico',
  'argentina-sistema-viviente-primeros-principios': 'sistemaVivo',
  'arquitectura-organizaciones-distribuidas': 'sistemaVivo',
  'caja-herramientas-ciudadanas': 'accionIterativa',
  'ciudadano-auditor-control-ciudadano': 'evidenciaCiudadana',
  'como-funciona-argentina-anatomia-estado': 'evidenciaCiudadana',
  'comunicar-sin-polarizar-conversacion-valiente': 'puentesDialogo',
  'datos-para-bien-comun': 'evidenciaCiudadana',
  'diseno-idealizado-sistemas-vivos': 'sistemaVivo',
  'diseno-instituciones-queja-propuesta': 'accionIterativa',
  'economia-familiar-comunitaria': 'economiaResiliente',
  'emprendimiento-con-proposito': 'economiaResiliente',
  'fundamentos-pensamiento-comprension-aprendizaje': 'refinamientoColectivo',
  'gestion-proyectos-comunitarios': 'accionIterativa',
  'inteligencia-emocional-tiempos-turbulentos': 'resiliencia',
  'introduccion-al-hombre-gris': 'refinamientoColectivo',
  'la-metamorfosis': 'refinamientoColectivo',
  'la-vision-de-transformacion': 'refinamientoColectivo',
  'liderazgo-distribuido': 'puentesDialogo',
  'narrativas-que-transforman-historias': 'puentesDialogo',
  'niveles-superiores-pensamiento-conciencia': 'resiliencia',
  'patrones-argentinos-debemos-romper': 'refinamientoColectivo',
  'primeros-pasos-organizar-tu-barrio': 'accionIterativa',
  'redes-territoriales-barrio-provincia': 'puentesDialogo',
  'resiliencia-y-proposito': 'resiliencia',
  'sistemas-economicos-ciclo-argentino': 'sistemaVivo',
  'sobrevivir-prosperar-economia-argentina': 'economiaResiliente',
};

/**
 * Una sola lámina al abrir cada entrenamiento: 30 recorridos reciben un visual
 * curado y Teoría de juegos conserva sus dos diagramas específicos dentro del
 * MDX. Así ganamos respiración y memoria visual sin repetir una imagen en cada
 * una de las 329 lecciones.
 */
export function visualParaCurso(slug: string): CourseVisual | undefined {
  const pieza = PIEZA_POR_CURSO[slug];
  return pieza === undefined ? undefined : PIEZAS[pieza];
}

export const CURSOS_CON_VISUAL_EDITORIAL = Object.keys(PIEZA_POR_CURSO).length;
