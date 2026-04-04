// Mission Registry — Single source of truth for the 5 national missions
// Derived from PLAN_MAESTRO_RECONSTRUCCION_ARGENTINA_ES.md and MATRIZ_MISIONES_Y_PLANES_ES.md

import type { MissionSlug, TemporalOrder, CitizenRole } from './strategic-initiatives';

export interface MissionDefinition {
  slug: MissionSlug;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  whatHurts: string;
  whatWeGuarantee: string;
  whatChanges90Days: string[];
  whatChanges12Months: string[];
  whatChanges3Years: string[];
  citizenRoles: CitizenRole[];
  cellCanDo: string[];
  citizenCanDo: string[];
  evidenceAccepted: string[];
  storyItTells: string;
  whatWeWontPromiseYet: string[];
  pauseConditions: string[];
  kpiNames: string[];
  plans: string[];
  temporalOrders: TemporalOrder[];
}

export const MISSIONS: MissionDefinition[] = [
  {
    slug: 'supervivencia-digna',
    number: 1,
    label: 'Supervivencia Digna',
    shortLabel: 'Supervivencia',
    description: 'Agua, vivienda, salud, energia, seguridad de proximidad',
    whatHurts: 'La intemperie material. El agua que falta o enferma. El alquiler que expulsa. La salud que llega tarde. El barrio donde el miedo organiza mas que la ley.',
    whatWeGuarantee: 'Agua, saneamiento basico, refugio digno, alimentacion esencial, salud primaria, continuidad energetica minima y seguridad de proximidad.',
    whatChanges90Days: [
      'Mapa de criticidad territorial',
      'Cuadrillas de reparacion rapida',
      'Centros de respuesta primaria por zonas criticas',
      'Stock y uso de inmuebles, camas, cisternas, comedores relevados',
    ],
    whatChanges12Months: [
      'Red basica de infraestructura social critica estabilizada',
      'Mecanismos de vivienda incremental y autoconstruccion asistida en marcha',
      'APS territorial con protocolos minimos comunes',
    ],
    whatChanges3Years: [
      'Caida sensible de intemperie extrema, enfermedad evitable y violencia de proximidad en territorios priorizados',
    ],
    citizenRoles: ['testigo', 'constructor', 'custodio'],
    cellCanDo: [
      'Relevamiento',
      'Deteccion temprana',
      'Distribucion',
      'Cuadrillas barriales',
      'Acompanamiento a familias criticas',
    ],
    citizenCanDo: [
      'Declarar necesidad',
      'Ofrecer recurso',
      'Sumarse a cuadrilla',
      'Verificar entrega',
      'Documentar falla',
    ],
    evidenceAccepted: [
      'Relevamientos geoetiquetados',
      'Partes de reparacion',
      'Trazabilidad de insumos',
      'Metricas de cobertura',
      'Historias verificadas de mejora concreta',
    ],
    storyItTells: 'La del pais que vuelve a cuidar primero lo indispensable.',
    whatWeWontPromiseYet: [
      'Solucion total del deficit habitacional',
      'Pacificacion plena',
      'Salud integral de largo plazo en 90 dias',
    ],
    pauseConditions: [
      'Opacidad en distribucion',
      'Dependencia de intermediarios extractivos',
      'Expansion sin evidencia de cobertura real',
    ],
    kpiNames: [
      'Hogares criticos cubiertos',
      'Tiempo promedio de reparacion',
      'Acceso a agua segura',
      'Cobertura de APS',
      'Eventos violentos priorizados resueltos por protocolo',
    ],
    plans: ['PLANAGUA', 'PLANVIV', 'PLANSAL', 'PLANSEG', 'PLANEN'],
    temporalOrders: ['emergencia', 'transicion'],
  },
  {
    slug: 'territorio-legible',
    number: 2,
    label: 'Territorio Legible y Mando Civico',
    shortLabel: 'Territorio',
    description: 'Senales, mandatos, datos abiertos, rieles digitales basicos',
    whatHurts: 'No sabemos con suficiente precision que necesita cada territorio, que esta dispuesto a sostener, que rechaza, que recursos tiene y donde estan los cuellos de botella.',
    whatWeGuarantee: 'Un sistema nacional de senal, recursos, compromisos, mandato territorial y datos abiertos con proteccion.',
    whatChanges90Days: [
      'Taxonomia minima unificada',
      'Tablero nacional de senal',
      'Cobertura territorial visible',
      'Primer mandato territorial consolidado en pilotos',
    ],
    whatChanges12Months: [
      'Mandatos por provincia y ciudades estrategicas',
      'Integracion de recursos y compromisos',
      'Llamados ciudadanos por mision',
    ],
    whatChanges3Years: [
      'Toma de decision publica apoyada en senal ciudadana, evidencia territorial y verificacion multicapa',
    ],
    citizenRoles: ['declarante', 'testigo', 'custodio', 'organizador'],
    cellCanDo: [
      'Convocar',
      'Mapear',
      'Verificar',
      'Elevar prioridades',
      'Sostener circulos de escucha y ejecucion',
    ],
    citizenCanDo: [
      'Declarar sueno, valor, necesidad, basta, compromiso o recurso',
      'Revisar su mandato territorial',
      'Sumarse a una accion concreta',
    ],
    evidenceAccepted: [
      'Senales con trazabilidad basica',
      'Series temporales',
      'Cobertura territorial',
      'Verificacion comunitaria y documental',
    ],
    storyItTells: 'La del pais que deja de hablar por intuicion y empieza a escucharse en serio.',
    whatWeWontPromiseYet: [
      'Inteligencia artificial perfecta',
      'Representacion total',
      'Captura cero de senal',
    ],
    pauseConditions: [
      'Sesgo sistematico oculto',
      'Vulneracion de privacidad',
      'Opacidad algoritmica o narrativa sin trazabilidad',
    ],
    kpiNames: [
      'Cobertura territorial',
      'Densidad de senal por tipo',
      'Tiempo entre senal y sintesis',
      'Porcentaje de mandatos con llamada a la accion visible',
    ],
    plans: ['PLANDIG', 'PLANRUTA'],
    temporalOrders: ['emergencia', 'transicion'],
  },
  {
    slug: 'produccion-y-suelo-vivo',
    number: 3,
    label: 'Trabajo, Produccion y Suelo Vivo',
    shortLabel: 'Produccion',
    description: 'Empleo util, suelo regenerado, empresas bastardas, cadenas territoriales',
    whatHurts: 'Trabajo improductivo, suelo degradado, cadena de valor rota, infraestructura minima insuficiente y dependencia de rentas que no dejan musculatura real.',
    whatWeGuarantee: 'Reconstruccion productiva con foco en suelo vivo, empleo util, empresas de servicio justo, reconversion laboral y cadenas territoriales.',
    whatChanges90Days: [
      'Pilotos de suelo vivo',
      'Identificacion de capacidades reconvertibles',
      'Primeras bastardas o estructuras equivalentes de servicio util en dominios acotados',
      'Cartera de microproyectos territoriales productivos',
    ],
    whatChanges12Months: [
      'Nodos demostrativos de produccion y servicio',
      'Primeras cohortes de reconversion laboral',
      'Red inicial de empleo util ligada a misiones',
    ],
    whatChanges3Years: [
      'Caida de dependencia improductiva',
      'Mejora de suelos y rendimientos',
      'Cadenas territoriales mas densas y menos extractivas',
    ],
    citizenRoles: ['constructor', 'organizador', 'custodio'],
    cellCanDo: [
      'Mapear capacidades',
      'Coordinar formacion',
      'Lanzar microproyectos',
      'Auditar costo real',
      'Conectar oferta y necesidad local',
    ],
    citizenCanDo: [
      'Ofrecer oficio',
      'Aprender uno nuevo',
      'Sumarse a una red productiva',
      'Custodiar transparencia de costos',
    ],
    evidenceAccepted: [
      'Empleo creado o reconvertido',
      'Productividad',
      'Reduccion de costos extractivos',
      'Mejora de suelo',
      'Continuidad operativa de nodos',
    ],
    storyItTells: 'La del pais que deja de vivir de goteos y vuelve a hacer cosas con sentido.',
    whatWeWontPromiseYet: [
      'Industrializacion completa',
      'Soberania energetica total',
      'Mercado perfecto',
    ],
    pauseConditions: [
      'Subsidio sin salida',
      'Pilotaje sin aprendizaje',
      'Estructura productiva capturada por actores rentistas',
    ],
    kpiNames: [
      'Puestos reconvertidos',
      'Hectareas piloto',
      'Costo real comparado',
      'Proyectos productivos vivos a 12 meses',
    ],
    plans: ['PLANISV', 'PLANEB', 'PLANREP', 'PLANEN', 'PLAN24CN'],
    temporalOrders: ['transicion', 'permanencia'],
  },
  {
    slug: 'infancia-escuela-cultura',
    number: 4,
    label: 'Infancia, Escuela y Cultura de Reconstruccion',
    shortLabel: 'Infancia',
    description: 'Ninez cuidada, escuela significativa, cultura viva',
    whatHurts: 'Ninos rotos por el contexto, escuela degradada, cultura fragmentada y ausencia de un relato comun que convoque sin manipular.',
    whatWeGuarantee: 'Ninez cuidada, alfabetizacion robusta, escuela significativa, cultura viva y ritos publicos que conviertan la reconstruccion en experiencia compartida.',
    whatChanges90Days: [
      'Priorizacion de ninez e infancia critica',
      'Modulos de alfabetizacion y apoyo intensivo',
      'Programacion cultural barrial de cohesion',
      'Relatos de mision visibles y no partidarios',
    ],
    whatChanges12Months: [
      'Comunidades educativas con metas compartidas',
      'Mejora en asistencia y lectura',
      'Circuitos culturales de pertenencia activa',
    ],
    whatChanges3Years: [
      'Escuela mas exigente y mas humana',
      'Infancia con mejor cuidado',
      'Cultura entendida como infraestructura de confianza',
    ],
    citizenRoles: ['constructor', 'organizador', 'narrador'],
    cellCanDo: [
      'Tutorias',
      'Acompanamiento a familias',
      'Circulos de lectura',
      'Mesas, ferias, juegos, memoria y documentacion del proceso',
    ],
    citizenCanDo: [
      'Ensenar',
      'Tutorizar',
      'Alojar una actividad cultural',
      'Sostener presencia adulta confiable',
    ],
    evidenceAccepted: [
      'Asistencia',
      'Alfabetizacion',
      'Participacion',
      'Continuidad de espacios',
      'Historias de transformacion verificables',
    ],
    storyItTells: 'La del pais que decide que ningun chico crezca sin horizonte ni tribu de cuidado.',
    whatWeWontPromiseYet: [
      'Reforma educativa total en un ciclo',
      'Sanacion cultural instantanea',
    ],
    pauseConditions: [
      'Escolarizacion vacia sin aprendizaje',
      'Cultura convertida en propaganda',
      'Dispersion programatica sin comunidad real',
    ],
    kpiNames: [
      'Asistencia',
      'Alfabetizacion inicial',
      'Tutorias activas',
      'Eventos de cohesion con continuidad',
    ],
    plans: ['PLANEDU', 'PLANCUL'],
    temporalOrders: ['emergencia', 'transicion'],
  },
  {
    slug: 'instituciones-y-futuro',
    number: 5,
    label: 'Instituciones Confiables y Pacto de Futuro',
    shortLabel: 'Instituciones',
    description: 'Justicia, integridad, blindaje, settlement institucional',
    whatHurts: 'La impunidad, la arbitrariedad, la opacidad, el ciclo pendular y la facilidad con la que cualquier construccion puede ser vaciada.',
    whatWeGuarantee: 'Integridad, justicia transicional, proteccion contra captura, settlement institucional gradual y reglas de uso del poder visibles.',
    whatChanges90Days: [
      'Defensoria de Integridad',
      'Protocolos de trazabilidad',
      'Registro publico de decisiones criticas',
      'Reglas de emergencia con caducidad explicita',
    ],
    whatChanges12Months: [
      'Mecanismos de resolucion rapida',
      'Controles cruzados basicos',
      'Primera capa de pacto fiscal y anticaptura',
    ],
    whatChanges3Years: [
      'Settlement institucional mas estable',
      'Justicia funcional en dominios prioritarios',
      'Menor reversibilidad del proyecto por simple cambio de humor politico',
    ],
    citizenRoles: ['custodio', 'testigo', 'narrador'],
    cellCanDo: [
      'Veeduria',
      'Registro de irregularidades',
      'Documentacion de desvios',
      'Custodia civica de misiones',
    ],
    citizenCanDo: [
      'Denunciar',
      'Auditar',
      'Seguir tableros',
      'Exigir justificacion de gasto y decision',
    ],
    evidenceAccepted: [
      'Auditorias',
      'Trazabilidad presupuestaria',
      'Resolucion de conflictos',
      'Tiempos judiciales acotados en dominios criticos',
    ],
    storyItTells: 'La del pais que deja de tolerar que el poder se esconda atras del humo.',
    whatWeWontPromiseYet: [
      'Justicia perfecta',
      'Constitucion ideal de un solo golpe',
      'Desarme total de decadas de captura en meses',
    ],
    pauseConditions: [
      'Expansion institucional sin control',
      'Blindajes decorativos',
      'Captura temprana de organos transitorios',
    ],
    kpiNames: [
      'Tiempo de publicacion de decisiones',
      'Trazabilidad de fondos',
      'Denuncias procesadas',
      'Conflictos criticos resueltos',
    ],
    plans: ['PLANJUS', 'PLANSUS', 'PLANMON', 'PLANGEO', 'PLANSEG'],
    temporalOrders: ['transicion', 'permanencia'],
  },
];

// Helper: get a mission by slug
export function getMission(slug: MissionSlug): MissionDefinition | undefined {
  return MISSIONS.find(m => m.slug === slug);
}

// Helper: get all mission slugs in order
export function getMissionSlugs(): MissionSlug[] {
  return MISSIONS.map(m => m.slug);
}
