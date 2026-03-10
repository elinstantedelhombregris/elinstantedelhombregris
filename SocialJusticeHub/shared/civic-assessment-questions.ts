// ============================================================================
// Evaluacion Civica — 36 preguntas en 6 dimensiones
// Contenido en castellano rioplatense (voseo)
// ============================================================================

// ---------------------------------------------------------------------------
// Tipos base
// ---------------------------------------------------------------------------

export type QuestionType = 'scale' | 'choice' | 'rank';

export interface ScaleQuestion {
  key: string;
  dimensionKey: DimensionKey;
  text: string;
  type: 'scale';
  minLabel: string;
  maxLabel: string;
  weight: number;
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface ChoiceQuestion {
  key: string;
  dimensionKey: DimensionKey;
  text: string;
  type: 'choice';
  options: ChoiceOption[];
  weight: number;
}

export interface RankQuestion {
  key: string;
  dimensionKey: DimensionKey;
  text: string;
  type: 'rank';
  items: string[];
  weight: number;
}

export type AssessmentQuestion = ScaleQuestion | ChoiceQuestion | RankQuestion;

// ---------------------------------------------------------------------------
// Dimensiones civicas
// ---------------------------------------------------------------------------

export type DimensionKey =
  | 'motivacion_civica'
  | 'estilo_liderazgo'
  | 'valores_prioridades'
  | 'fortalezas_civicas'
  | 'areas_crecimiento'
  | 'barreras_compromiso';

export interface CivicDimension {
  key: DimensionKey;
  name: string;
  description: string;
  color: string;
}

export const CIVIC_DIMENSIONS: CivicDimension[] = [
  {
    key: 'motivacion_civica',
    name: 'Motivacion Civica',
    description:
      'Que te impulsa a participar en la vida publica y comunitaria de tu entorno.',
    color: '#E85D26',
  },
  {
    key: 'estilo_liderazgo',
    name: 'Estilo de Liderazgo',
    description:
      'Como te relacionas con otros a la hora de organizar, decidir y actuar colectivamente.',
    color: '#3B82F6',
  },
  {
    key: 'valores_prioridades',
    name: 'Valores y Prioridades',
    description:
      'Cuales son los principios que guian tus decisiones cuando pensas en el bien comun.',
    color: '#8B5CF6',
  },
  {
    key: 'fortalezas_civicas',
    name: 'Fortalezas Civicas',
    description:
      'Las capacidades concretas que ya tenes para aportar a tu comunidad.',
    color: '#10B981',
  },
  {
    key: 'areas_crecimiento',
    name: 'Areas de Crecimiento',
    description:
      'Los aspectos civicos en los que sentis que podrias desarrollarte mas.',
    color: '#F59E0B',
  },
  {
    key: 'barreras_compromiso',
    name: 'Barreras al Compromiso',
    description:
      'Los obstaculos que te frenan o dificultan tu participacion civica.',
    color: '#EF4444',
  },
];

// ---------------------------------------------------------------------------
// Arquetipos civicos
// ---------------------------------------------------------------------------

export interface CivicArchetype {
  key: string;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  primaryDimensions: DimensionKey[];
  color: string;
}

export const CIVIC_ARCHETYPES: CivicArchetype[] = [
  {
    key: 'el_puente',
    name: 'El Puente',
    subtitle: 'Conector comunitario',
    description:
      'Tenes la capacidad de vincular personas, ideas y recursos que de otra forma no se cruzarian. En un pais donde la fragmentacion social es moneda corriente, tu rol es vital: construis lazos donde otros ven grietas. Tu fortaleza esta en la escucha y en la voluntad de tender la mano sin pedir nada a cambio.',
    emoji: '\u{1F309}',
    primaryDimensions: ['estilo_liderazgo', 'valores_prioridades'],
    color: '#3B82F6',
  },
  {
    key: 'el_vigia',
    name: 'El Vigia',
    subtitle: 'Guardian civico',
    description:
      'Sos de los que no miran para otro lado. Cuando algo no funciona en tu barrio, en tu municipio o en el pais, lo señalas con firmeza pero con argumentos. Tu motivacion nace de una conviccion profunda: las instituciones tienen que rendir cuentas. En un contexto donde la desconfianza institucional es alta, vos elegis exigir en vez de resignarte.',
    emoji: '\u{1F52D}',
    primaryDimensions: ['motivacion_civica', 'valores_prioridades'],
    color: '#8B5CF6',
  },
  {
    key: 'la_raiz',
    name: 'La Raiz',
    subtitle: 'Constructor/a comunitario/a',
    description:
      'Tu fuerza esta en lo cercano: el comedor, la plaza, la cooperativa, la escuela del barrio. No necesitas grandes discursos ni plataformas; tu impacto se siente en lo cotidiano. En la Argentina de las crisis ciclicas, personas como vos son las que sostienen el tejido social cuando todo lo demas cruje.',
    emoji: '\u{1F331}',
    primaryDimensions: ['fortalezas_civicas', 'motivacion_civica'],
    color: '#10B981',
  },
  {
    key: 'el_catalizador',
    name: 'El Catalizador',
    subtitle: 'Motor de cambio',
    description:
      'No te conformas con diagnosticar: necesitas actuar. Tenes energia, iniciativa y una capacidad natural de contagiar entusiasmo. Cuando ves una injusticia o una necesidad, ya estas pensando en el primer paso. Tu desafio es sostener el impulso sin quemarte, pero tu potencia transformadora es enorme.',
    emoji: '\u{26A1}',
    primaryDimensions: ['estilo_liderazgo', 'motivacion_civica'],
    color: '#E85D26',
  },
  {
    key: 'el_sembrador',
    name: 'El Sembrador',
    subtitle: 'Actor civico emergente',
    description:
      'Estas en un momento de apertura. Tal vez todavia no encontraste tu espacio o tu causa, pero sentis la inquietud de hacer algo que trascienda lo individual. Tu ventaja es que llegas sin las cicatrices del desencanto; tu mirada fresca puede renovar espacios que se volvieron rutinarios.',
    emoji: '\u{1F33E}',
    primaryDimensions: ['areas_crecimiento', 'barreras_compromiso'],
    color: '#F59E0B',
  },
  {
    key: 'el_espejo',
    name: 'El Espejo',
    subtitle: 'Ciudadano/a reflexivo/a',
    description:
      'Tu fortaleza es la autoconciencia. Antes de actuar, reflexionas; antes de opinar, escuchas. En una cultura publica donde muchos gritan y pocos piensan, tu equilibrio es un recurso escaso. Podes ser la persona que ayuda a un grupo a detenerse, mirar lo que esta pasando y elegir mejor.',
    emoji: '\u{1FA9E}',
    primaryDimensions: ['valores_prioridades', 'areas_crecimiento'],
    color: '#6366F1',
  },
];

// ---------------------------------------------------------------------------
// PREGUNTAS — 36 total (6 por dimension)
// ---------------------------------------------------------------------------

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ==========================================================================
  // DIMENSION 1 — motivacion_civica
  // ==========================================================================
  {
    key: 'mc_01',
    dimensionKey: 'motivacion_civica',
    text: 'Cuando lees una noticia sobre una decision politica que afecta a tu barrio, ¿cuanto te moviliza a hacer algo concreto?',
    type: 'scale',
    minLabel: 'No me mueve en absoluto',
    maxLabel: 'Siento que tengo que actuar ya',
    weight: 3,
  },
  {
    key: 'mc_02',
    dimensionKey: 'motivacion_civica',
    text: '¿Que situacion te empujaria mas fuerte a participar civicamente?',
    type: 'choice',
    options: [
      { value: 'crisis_economica', label: 'Una crisis economica que golpea a tu entorno cercano' },
      { value: 'corrupcion', label: 'Un caso de corrupcion que queda impune' },
      { value: 'emergencia_social', label: 'Ver familias sin acceso a comida o techo en tu zona' },
      { value: 'atropello_derechos', label: 'Que recorten un derecho que creias garantizado' },
      { value: 'inspiracion', label: 'Conocer a alguien que esta cambiando las cosas desde abajo' },
    ],
    weight: 2,
  },
  {
    key: 'mc_03',
    dimensionKey: 'motivacion_civica',
    text: '¿Con que frecuencia sentis que tu voto o tu participacion realmente puede cambiar algo?',
    type: 'scale',
    minLabel: 'Nunca, no cambia nada',
    maxLabel: 'Siempre, cada accion cuenta',
    weight: 3,
  },
  {
    key: 'mc_04',
    dimensionKey: 'motivacion_civica',
    text: 'Ordena estas motivaciones de la mas fuerte a la mas debil en tu caso personal:',
    type: 'rank',
    items: [
      'Proteger a mi familia y mi entorno cercano',
      'Construir un pais mas justo para las proximas generaciones',
      'Defender derechos que siento amenazados',
      'Demostrar que se puede hacer politica de otra manera',
    ],
    weight: 2,
  },
  {
    key: 'mc_05',
    dimensionKey: 'motivacion_civica',
    text: '¿Que tan seguido hablas de temas civicos o politicos con personas fuera de tu circulo cercano (vecinos, compañeros de trabajo, desconocidos)?',
    type: 'scale',
    minLabel: 'Casi nunca, evito el tema',
    maxLabel: 'Constantemente, me sale natural',
    weight: 1,
  },
  {
    key: 'mc_06',
    dimensionKey: 'motivacion_civica',
    text: 'Si mañana se abriera una audiencia publica en tu municipio sobre el presupuesto local, ¿que harias?',
    type: 'choice',
    options: [
      { value: 'ignoro', label: 'Probablemente ni me entere' },
      { value: 'miro', label: 'Me informo pero no voy' },
      { value: 'asisto', label: 'Voy a escuchar aunque no hable' },
      { value: 'participo', label: 'Voy preparado/a para plantear algo' },
      { value: 'organizo', label: 'Convoco a otros para ir juntos' },
    ],
    weight: 2,
  },

  // ==========================================================================
  // DIMENSION 2 — estilo_liderazgo
  // ==========================================================================
  {
    key: 'el_01',
    dimensionKey: 'estilo_liderazgo',
    text: 'En un grupo que necesita tomar una decision dificil, ¿que rol soles tomar?',
    type: 'choice',
    options: [
      { value: 'facilitador', label: 'Facilito la conversacion para que todos opinen' },
      { value: 'estratega', label: 'Propongo un plan y trato de convencer' },
      { value: 'ejecutor', label: 'Me ofrezco a hacer lo que haga falta' },
      { value: 'mediador', label: 'Busco el punto intermedio entre posturas enfrentadas' },
      { value: 'observador', label: 'Escucho y opino solo si tengo algo que realmente sume' },
    ],
    weight: 3,
  },
  {
    key: 'el_02',
    dimensionKey: 'estilo_liderazgo',
    text: '¿Cuanto te cuesta delegar tareas importantes en otros cuando trabajas en un proyecto colectivo?',
    type: 'scale',
    minLabel: 'Nada, confio y delego facil',
    maxLabel: 'Mucho, prefiero hacerlo yo',
    weight: 2,
  },
  {
    key: 'el_03',
    dimensionKey: 'estilo_liderazgo',
    text: 'Ordena estos estilos segun cuanto te representan, del mas cercano al mas lejano:',
    type: 'rank',
    items: [
      'Liderar con el ejemplo silencioso',
      'Inspirar con la palabra y la vision',
      'Organizar la logistica y los recursos',
      'Acompañar y sostener emocionalmente al grupo',
    ],
    weight: 2,
  },
  {
    key: 'el_04',
    dimensionKey: 'estilo_liderazgo',
    text: '¿Que tan comodo/a te sentis hablando en publico para defender una causa que te importa?',
    type: 'scale',
    minLabel: 'Me paralizo, no puedo',
    maxLabel: 'Me siento en mi elemento',
    weight: 1,
  },
  {
    key: 'el_05',
    dimensionKey: 'estilo_liderazgo',
    text: 'Cuando en un grupo surge un conflicto fuerte entre dos personas, ¿como reaccionas?',
    type: 'choice',
    options: [
      { value: 'intervengo', label: 'Intervengo para calmar las aguas y buscar un acuerdo' },
      { value: 'apoyo', label: 'Me pongo del lado que creo que tiene razon' },
      { value: 'espero', label: 'Espero a que se enfrien y despues opino' },
      { value: 'estructura', label: 'Propongo un mecanismo (votacion, turnos de palabra) para resolverlo' },
      { value: 'retiro', label: 'Me incomoda mucho y tiendo a retirarme' },
    ],
    weight: 2,
  },
  {
    key: 'el_06',
    dimensionKey: 'estilo_liderazgo',
    text: '¿Que tan capaz te sentis de sostener un proyecto comunitario a lo largo de meses, mas alla del entusiasmo inicial?',
    type: 'scale',
    minLabel: 'Me cuesta mucho mantener la constancia',
    maxLabel: 'Soy de los que sostienen hasta el final',
    weight: 3,
  },

  // ==========================================================================
  // DIMENSION 3 — valores_prioridades
  // ==========================================================================
  {
    key: 'vp_01',
    dimensionKey: 'valores_prioridades',
    text: 'Si tuvieras que elegir una sola prioridad para tu comunidad en los proximos 5 años, ¿cual seria?',
    type: 'choice',
    options: [
      { value: 'educacion', label: 'Mejorar la educacion publica local' },
      { value: 'seguridad', label: 'Reducir la inseguridad y la violencia' },
      { value: 'economia', label: 'Generar trabajo genuino y estabilidad economica' },
      { value: 'salud', label: 'Garantizar acceso a salud de calidad' },
      { value: 'ambiente', label: 'Cuidar el medioambiente y los espacios verdes' },
      { value: 'transparencia', label: 'Lograr transparencia en el manejo de fondos publicos' },
    ],
    weight: 3,
  },
  {
    key: 'vp_02',
    dimensionKey: 'valores_prioridades',
    text: '¿Cuanto coincidis con esta frase? "Prefiero una solucion imperfecta que se aplique hoy a una solucion ideal que nunca llegue."',
    type: 'scale',
    minLabel: 'Nada, hay que hacer las cosas bien o no hacerlas',
    maxLabel: 'Totalmente, lo urgente no puede esperar',
    weight: 2,
  },
  {
    key: 'vp_03',
    dimensionKey: 'valores_prioridades',
    text: 'Ordena estos valores segun su importancia para vos cuando pensas en la vida publica:',
    type: 'rank',
    items: [
      'Justicia social y redistribucion',
      'Libertad individual y autonomia',
      'Solidaridad y cuidado mutuo',
      'Institucionalidad y respeto a las reglas',
    ],
    weight: 3,
  },
  {
    key: 'vp_04',
    dimensionKey: 'valores_prioridades',
    text: '¿Que opinion te genera mas acuerdo sobre el rol del Estado en la Argentina?',
    type: 'choice',
    options: [
      { value: 'estado_fuerte', label: 'El Estado tiene que garantizar derechos basicos aunque sea ineficiente' },
      { value: 'estado_eficiente', label: 'El Estado tiene que ser mas chico pero funcionar bien' },
      { value: 'estado_comunidad', label: 'Lo importante es que la comunidad organizada resuelva, con o sin Estado' },
      { value: 'estado_mixto', label: 'Necesitamos un equilibrio: Estado presente donde hace falta y comunidad activa donde puede' },
    ],
    weight: 2,
  },
  {
    key: 'vp_05',
    dimensionKey: 'valores_prioridades',
    text: '¿Cuanto valorás la diversidad de opiniones en un espacio de participacion, incluso cuando incluye posturas que te incomodan?',
    type: 'scale',
    minLabel: 'Poco, hay limites que no se negocian',
    maxLabel: 'Mucho, escuchar al otro siempre enriquece',
    weight: 2,
  },
  {
    key: 'vp_06',
    dimensionKey: 'valores_prioridades',
    text: 'Frente a una asamblea vecinal donde se decide si destinar fondos a arreglar las calles o a un programa de becas para jovenes, ¿que priorizas?',
    type: 'choice',
    options: [
      { value: 'infraestructura', label: 'Las calles, porque mejoran la calidad de vida de todos' },
      { value: 'becas', label: 'Las becas, porque invertir en juventud es invertir en futuro' },
      { value: 'consenso', label: 'Buscaria un esquema que contemple ambas necesidades' },
      { value: 'datos', label: 'Pediria datos concretos antes de decidir' },
    ],
    weight: 1,
  },

  // ==========================================================================
  // DIMENSION 4 — fortalezas_civicas
  // ==========================================================================
  {
    key: 'fc_01',
    dimensionKey: 'fortalezas_civicas',
    text: '¿Que tan bien conoces los mecanismos formales de participacion ciudadana en tu municipio (presupuesto participativo, banca abierta, audiencias publicas)?',
    type: 'scale',
    minLabel: 'No tengo idea de que existen',
    maxLabel: 'Los conozco y los use alguna vez',
    weight: 2,
  },
  {
    key: 'fc_02',
    dimensionKey: 'fortalezas_civicas',
    text: '¿Cual de estas habilidades sentis que es tu punto mas fuerte?',
    type: 'choice',
    options: [
      { value: 'comunicacion', label: 'Comunicar ideas de forma clara y persuasiva' },
      { value: 'organizacion', label: 'Organizar actividades, eventos o campañas' },
      { value: 'analisis', label: 'Analizar datos, presupuestos o informacion publica' },
      { value: 'empatia', label: 'Conectar emocionalmente con las necesidades del otro' },
      { value: 'redes', label: 'Tejer redes y conectar personas que no se conocen entre si' },
    ],
    weight: 3,
  },
  {
    key: 'fc_03',
    dimensionKey: 'fortalezas_civicas',
    text: 'Ordena estas acciones civicas segun tu experiencia real (de la que mas hiciste a la que menos):',
    type: 'rank',
    items: [
      'Firmar petitorios o campañas online',
      'Participar en asambleas, reuniones vecinales o marchas',
      'Colaborar con una ONG, comedor o cooperativa',
      'Contactar a un funcionario o representante para un reclamo',
    ],
    weight: 2,
  },
  {
    key: 'fc_04',
    dimensionKey: 'fortalezas_civicas',
    text: '¿Que tan preparado/a te sentis para explicarle a un vecino como funciona el presupuesto de tu municipio?',
    type: 'scale',
    minLabel: 'No podria, no manejo esa informacion',
    maxLabel: 'Podria hacerlo con claridad y ejemplos',
    weight: 2,
  },
  {
    key: 'fc_05',
    dimensionKey: 'fortalezas_civicas',
    text: '¿Alguna vez lideraste o co-lideraste una iniciativa comunitaria (junta de firmas, reclamo colectivo, evento solidario, etc.)?',
    type: 'choice',
    options: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'acompañe', label: 'No lidere, pero acompañe activamente' },
      { value: 'una_vez', label: 'Si, una vez' },
      { value: 'varias', label: 'Si, varias veces' },
      { value: 'actualmente', label: 'Si, y actualmente estoy en una' },
    ],
    weight: 3,
  },
  {
    key: 'fc_06',
    dimensionKey: 'fortalezas_civicas',
    text: '¿Cuanto confias en tu capacidad de sostener una conversacion productiva con alguien que piensa muy distinto a vos sobre temas politicos?',
    type: 'scale',
    minLabel: 'Muy poco, termino enojandome o callando',
    maxLabel: 'Mucho, puedo escuchar y argumentar con calma',
    weight: 1,
  },

  // ==========================================================================
  // DIMENSION 5 — areas_crecimiento
  // ==========================================================================
  {
    key: 'ac_01',
    dimensionKey: 'areas_crecimiento',
    text: '¿En que area sentis que mas necesitas crecer para ser un ciudadano/a mas activo/a?',
    type: 'choice',
    options: [
      { value: 'conocimiento', label: 'Conocer mejor como funcionan las instituciones y las leyes' },
      { value: 'oratoria', label: 'Poder expresarme mejor en publico' },
      { value: 'organizacion', label: 'Aprender a organizar y sostener proyectos' },
      { value: 'redes', label: 'Ampliar mi red de contactos civicos' },
      { value: 'manejo_conflicto', label: 'Saber manejar conflictos y diferencias sin destruir vinculos' },
      { value: 'digital', label: 'Usar herramientas digitales para causas civicas' },
    ],
    weight: 3,
  },
  {
    key: 'ac_02',
    dimensionKey: 'areas_crecimiento',
    text: '¿Cuanto sabés hoy sobre tus derechos como ciudadano/a frente a un abuso de autoridad (policial, municipal, laboral)?',
    type: 'scale',
    minLabel: 'Muy poco, no sabria que hacer',
    maxLabel: 'Mucho, conozco los canales y procedimientos',
    weight: 2,
  },
  {
    key: 'ac_03',
    dimensionKey: 'areas_crecimiento',
    text: 'Ordena estas competencias de la que mas te gustaria desarrollar a la que menos:',
    type: 'rank',
    items: [
      'Leer e interpretar datos publicos y presupuestos',
      'Moderar reuniones y facilitar acuerdos',
      'Redactar proyectos, pedidos de informes o petitorios',
      'Usar redes sociales estrategicamente para visibilizar causas',
    ],
    weight: 2,
  },
  {
    key: 'ac_04',
    dimensionKey: 'areas_crecimiento',
    text: '¿Que tan dispuesto/a estas a dedicar tiempo regular (por ejemplo, 2 horas por semana) a formarte en temas civicos?',
    type: 'scale',
    minLabel: 'No tengo margen, mi dia esta lleno',
    maxLabel: 'Totalmente, lo priorizaria',
    weight: 2,
  },
  {
    key: 'ac_05',
    dimensionKey: 'areas_crecimiento',
    text: '¿Que formato de aprendizaje te resulta mas efectivo para temas civicos?',
    type: 'choice',
    options: [
      { value: 'presencial', label: 'Talleres presenciales con gente del barrio' },
      { value: 'online', label: 'Cursos online a mi ritmo' },
      { value: 'practica', label: 'Aprender haciendo: sumandome a un proyecto real' },
      { value: 'lectura', label: 'Leer y reflexionar por mi cuenta' },
      { value: 'mentor', label: 'Tener un mentor o referente que me guie' },
    ],
    weight: 1,
  },
  {
    key: 'ac_06',
    dimensionKey: 'areas_crecimiento',
    text: '¿Cuanto te sentis capaz de identificar informacion falsa o manipulada sobre temas politicos en redes sociales?',
    type: 'scale',
    minLabel: 'Me cuesta mucho, a veces me doy cuenta tarde',
    maxLabel: 'Tengo buen ojo, verifico antes de compartir',
    weight: 2,
  },

  // ==========================================================================
  // DIMENSION 6 — barreras_compromiso
  // ==========================================================================
  {
    key: 'bc_01',
    dimensionKey: 'barreras_compromiso',
    text: '¿Cual es el obstaculo mas grande que te frena a participar mas activamente?',
    type: 'choice',
    options: [
      { value: 'tiempo', label: 'No tengo tiempo: entre el laburo, la familia y la supervivencia diaria, no da' },
      { value: 'desconfianza', label: 'Desconfianza: siento que todo espacio termina siendo cooptado o corrupto' },
      { value: 'miedo', label: 'Miedo a exponerme o a represalias' },
      { value: 'no_se_como', label: 'No se por donde empezar ni a quien acercarme' },
      { value: 'desanimo', label: 'Ya participe y no vi resultados, me desmotivo' },
      { value: 'no_me_representan', label: 'Los espacios que conozco no me representan' },
    ],
    weight: 3,
  },
  {
    key: 'bc_02',
    dimensionKey: 'barreras_compromiso',
    text: '¿Cuanto influye la inestabilidad economica en tu capacidad de pensar mas alla de lo inmediato (fin de mes, precios, inflacion)?',
    type: 'scale',
    minLabel: 'Nada, logro separar las cosas',
    maxLabel: 'Totalmente, la urgencia economica me absorbe',
    weight: 3,
  },
  {
    key: 'bc_03',
    dimensionKey: 'barreras_compromiso',
    text: 'Ordena estas barreras de la que mas te afecta a la que menos:',
    type: 'rank',
    items: [
      'La sensacion de que nada va a cambiar ("siempre fue asi")',
      'La agresividad y polarizacion del debate publico',
      'La falta de espacios genuinos y no partidarios para participar',
      'El cansancio y la sobrecarga de la vida cotidiana',
    ],
    weight: 2,
  },
  {
    key: 'bc_04',
    dimensionKey: 'barreras_compromiso',
    text: '¿Cuanta confianza tenes en que las instituciones argentinas (justicia, congreso, municipio) puedan mejorar en los proximos 10 años?',
    type: 'scale',
    minLabel: 'Ninguna, estan perdidas',
    maxLabel: 'Bastante, creo que la mejora es posible',
    weight: 2,
  },
  {
    key: 'bc_05',
    dimensionKey: 'barreras_compromiso',
    text: '¿Que te haria falta para dar el paso y comprometerte mas con tu comunidad?',
    type: 'choice',
    options: [
      { value: 'grupo', label: 'Un grupo de confianza con el que compartir el esfuerzo' },
      { value: 'informacion', label: 'Informacion clara sobre que puedo hacer y donde' },
      { value: 'tiempo_protegido', label: 'Que mi situacion economica me diera un poco mas de respiro' },
      { value: 'resultados', label: 'Ver que una pequeña accion realmente produce un cambio' },
      { value: 'formacion', label: 'Formarme para sentirme mas seguro/a al participar' },
    ],
    weight: 2,
  },
  {
    key: 'bc_06',
    dimensionKey: 'barreras_compromiso',
    text: '¿Cuanto te afecta emocionalmente la polarizacion politica argentina a la hora de involucrarte en temas civicos?',
    type: 'scale',
    minLabel: 'No me afecta, lo manejo bien',
    maxLabel: 'Me agota tanto que prefiero no meterme',
    weight: 1,
  },
];
