// Curated coaching message templates, organized by session type + archetype + dimension
// Used by MockCoachingProvider when no API key is configured

export interface CoachingTemplate {
  sessionType: string;
  archetype?: string; // null = generic
  dimension?: string; // null = generic
  messages: string[];
}

export const COACHING_TEMPLATES: CoachingTemplate[] = [
  // ===== ASSESSMENT DEBRIEF =====
  {
    sessionType: 'assessment_debrief',
    archetype: 'el_puente',
    messages: [
      'Tu perfil como Puente habla de alguien que naturalmente conecta personas e ideas. En Argentina, donde la fragmentacion social es un desafio cronico, esta capacidad es un recurso enorme. Te propongo un ejercicio concreto: esta semana, identifica dos personas de tu entorno que deberian conocerse pero no se conocen. Presentalas. Un Puente se construye un ladrillo a la vez.',
      'Los resultados muestran que tu dimension mas fuerte es la colaboracion. Eso no es casual: elegis construir vinculos donde otros ven divisiones. ¿En que espacio concreto podrias poner esa habilidad al servicio de algo mas grande que vos? Pensalo y la proxima vez me contas.',
    ],
  },
  {
    sessionType: 'assessment_debrief',
    archetype: 'el_vigia',
    messages: [
      'Como Vigia, tenes algo que mucha gente no: la conviccion de que las cosas pueden funcionar mejor y la voluntad de señalarlo. En un pais donde es facil resignarse, eso es poderoso. Tu desafio es canalizar esa energia sin agotarte. Esta semana, elegi una sola cosa que quieras fiscalizar o mejorar en tu entorno, y dedica energia solo a eso.',
      'Tu perfil muestra alta motivacion civica combinada con valores fuertes. Sos de los que no miran para otro lado. Eso es valioso, pero tambien puede ser agotador. ¿Tenes un sistema para descansar sin sentir culpa? Porque cuidarte a vos es parte de la lucha.',
    ],
  },
  {
    sessionType: 'assessment_debrief',
    archetype: 'la_raiz',
    messages: [
      'Tu arquetipo de Raiz refleja algo hermoso: tu impacto esta en lo cercano, en lo cotidiano, en lo que sostiene a la comunidad cuando todo lo demas tambalea. No necesitas grandes escenarios. ¿Cual es ese espacio cercano donde mas podes aportar esta semana?',
    ],
  },
  {
    sessionType: 'assessment_debrief',
    archetype: 'el_catalizador',
    messages: [
      'Como Catalizador, tu energia para actuar es tu mayor activo. Pero cuidado: el impulso sin estrategia se apaga rapido. Te propongo que antes de tu proxima accion civica, escribas tres cosas: que queres lograr, quien te puede ayudar, y como vas a saber si funciono.',
    ],
  },
  {
    sessionType: 'assessment_debrief',
    archetype: 'el_sembrador',
    messages: [
      'Tu perfil de Sembrador indica que estas en un momento de apertura. No subestimes eso: llegar sin las cicatrices del desencanto es una ventaja. Tu mirada fresca puede renovar espacios que se volvieron rutinarios. ¿Que espacio de participacion te gustaria explorar primero?',
    ],
  },
  {
    sessionType: 'assessment_debrief',
    archetype: 'el_espejo',
    messages: [
      'Como Espejo, tu equilibrio entre dimensiones es tu superpoder. En un pais de extremos, personas como vos son las que ayudan a un grupo a detenerse y elegir mejor. ¿Hay algun espacio donde podrias ofrecer esa perspectiva equilibrada?',
    ],
  },

  // ===== WEEKLY REFLECTION =====
  {
    sessionType: 'weekly_reflection',
    messages: [
      '¿Que momento de esta semana te hizo sentir mas conectado/a con tu comunidad? No importa si fue grande o pequeño. A veces los gestos minimos son los que mas revelan.',
      'Pensemos en tu semana: ¿hubo algun momento en que pudiste haber actuado como ciudadano/a y no lo hiciste? No te juzgo, solo quiero que lo notes. La conciencia es el primer paso.',
      'Esta semana, ¿que te genero mas indignacion en las noticias o en tu entorno? Y mas importante: ¿que podrias hacer con esa indignacion que sea constructivo?',
      'Contame: ¿pudiste avanzar en alguna de tus metas esta semana? Si no, ¿que se interpuso? A veces nombrar el obstaculo es el primer paso para sacarlo del camino.',
    ],
  },

  // ===== GOAL REVIEW =====
  {
    sessionType: 'goal_review',
    messages: [
      'Vamos a revisar tus metas. No te preocupes si no avanzaste en todas; lo importante es ser honesto/a con vos mismo/a. ¿Cual sentis que esta mas estancada y por que?',
      'Te quiero hacer una pregunta directa: ¿tus metas actuales realmente te importan, o las definiste por inercia? A veces hace falta reformular para que la motivacion vuelva.',
      'Miremos tus metas: ¿cual te genera mas entusiasmo cuando pensas en completarla? Empecemos por ahi. La energia positiva arrastra al resto.',
    ],
  },

  // ===== GROWTH PROMPT =====
  {
    sessionType: 'growth_prompt',
    messages: [
      'Hoy te propongo un ejercicio: escribi tres cosas que podrias hacer por tu barrio que no requieran ni plata ni permiso de nadie. Solo voluntad y un poco de tiempo. Despues elegi una y hacela esta semana.',
      'Pensemos juntos: ¿que habilidad tuya podria tener impacto civico si la pusieras al servicio de otros? No tiene que ser algo grandioso. A veces saber cocinar, saber escuchar o saber de numeros ya es un superpoder comunitario.',
      '¿Cuando fue la ultima vez que hiciste algo por alguien que no es de tu circulo cercano? No por culpa, sino por expansion. El compromiso civico empieza cuando ampliamos el rango de quienes nos importan.',
      'Te dejo una reflexion: en la Argentina, ¿que cambio chiquito podria generar un efecto grande si mucha gente lo hiciera al mismo tiempo? Pensalo y despues compartilo con alguien.',
    ],
  },

  // ===== AD HOC =====
  {
    sessionType: 'ad_hoc',
    messages: [
      'Bienvenido/a a tu sesion de coaching civico. ¿Sobre que queres trabajar hoy? Puedo ayudarte a pensar sobre tus metas, reflexionar sobre tu semana, o explorar como involucrarte mas en tu comunidad.',
      'Hola, estoy aca para ayudarte a pensar. ¿Hay algo especifico que te este dando vueltas en la cabeza sobre tu vida civica o comunitaria?',
      '¿En que puedo acompañarte hoy? Puedo ser util para poner en palabras lo que sentis, ordenar ideas, o definir proximos pasos concretos.',
    ],
  },

  // ===== MISION ACTIVA =====
  {
    sessionType: 'mission_active',
    messages: [
      'Hola. Hoy vamos a enfocarnos en tu mision activa. Contame: ¿que tarea de tu mision te gustaria abordar hoy?',
      'Bien, veo que estas participando en una mision nacional. Cada accion que tomes, por pequeña que sea, suma al cambio. ¿Hay alguna tarea pendiente que puedas completar antes de que termine el dia?',
      'La clave de la participacion civica es la constancia, no la intensidad. ¿Que es lo mas simple que podes hacer hoy por tu mision?',
      'Recorda: no necesitas permiso para actuar. Si ves algo que documentar, documentalo. Si ves algo que verificar, verificalo. Tu rol en la mision es tu licencia para actuar.',
    ],
  },

  // ===== DIMENSION-SPECIFIC GROWTH =====
  {
    sessionType: 'growth_prompt',
    dimension: 'motivacion_civica',
    messages: [
      'Tu motivacion civica mostro margen de crecimiento. Te propongo algo simple: esta semana, lee una noticia sobre tu municipio y contasela a alguien. No para convencer, solo para compartir. La motivacion civica crece con la practica.',
    ],
  },
  {
    sessionType: 'growth_prompt',
    dimension: 'barreras_compromiso',
    messages: [
      'Las barreras al compromiso son reales, no son excusas. ¿Cual es la que mas te pesa: tiempo, desconfianza, o no saber por donde empezar? Nombrarla es el primer paso para trabajarla.',
    ],
  },
  {
    sessionType: 'growth_prompt',
    dimension: 'estilo_liderazgo',
    messages: [
      'Liderar no es mandar. A veces el mejor liderazgo es escuchar, preguntar, y sostener. ¿Hay algun espacio donde podrias practicar ese tipo de liderazgo silencioso esta semana?',
    ],
  },
];

export function getTemplateMessages(
  sessionType: string,
  archetype?: string | null,
  weakestDimension?: string | null,
): string[] {
  // Try archetype-specific first
  if (archetype) {
    const archetypeMatch = COACHING_TEMPLATES.find(
      t => t.sessionType === sessionType && t.archetype === archetype,
    );
    if (archetypeMatch) return archetypeMatch.messages;
  }

  // Try dimension-specific
  if (weakestDimension) {
    const dimMatch = COACHING_TEMPLATES.find(
      t => t.sessionType === sessionType && t.dimension === weakestDimension,
    );
    if (dimMatch) return dimMatch.messages;
  }

  // Fallback to generic
  const generic = COACHING_TEMPLATES.find(
    t => t.sessionType === sessionType && !t.archetype && !t.dimension,
  );
  return generic?.messages || ['Hola, ¿en que puedo ayudarte hoy con tu desarrollo civico?'];
}
