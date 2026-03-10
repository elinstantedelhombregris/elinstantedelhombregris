import { db, schema } from './db-neon';
const {
  courses,
  courseLessons,
  courseQuizzes,
  quizQuestions,
  users,
  userLessonProgress,
  userCourseProgress,
  quizAttempts,
  quizAttemptAnswers,
} = schema;
import { eq, inArray } from 'drizzle-orm';

async function resetCourseContentState(courseId: number) {
  const lessons = await db
    .select({ id: courseLessons.id })
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  const lessonIds = lessons.map((lesson) => lesson.id);
  if (lessonIds.length > 0) {
    await db.delete(userLessonProgress).where(inArray(userLessonProgress.lessonId, lessonIds));
  }

  await db.delete(userCourseProgress).where(eq(userCourseProgress.courseId, courseId));

  const existingQuiz = await db
    .select({ id: courseQuizzes.id })
    .from(courseQuizzes)
    .where(eq(courseQuizzes.courseId, courseId))
    .limit(1);

  if (existingQuiz.length > 0) {
    const quizId = existingQuiz[0].id;
    const attempts = await db
      .select({ id: quizAttempts.id })
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId));

    const attemptIds = attempts.map((attempt) => attempt.id);
    if (attemptIds.length > 0) {
      await db.delete(quizAttemptAnswers).where(inArray(quizAttemptAnswers.attemptId, attemptIds));
    }

    await db.delete(quizAttempts).where(eq(quizAttempts.quizId, quizId));
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));
}

async function seedCourse26(authorId: number) {
  console.log('--- Course 26: Comunicar sin Polarizar ---');
  const course26Description = 'Aprende a tener conversaciones políticas sin destruir relaciones. Integra comunicación no violenta adaptada a la cultura argentina, escucha radical, criterios de higiene informativa y prácticas de autorreflexión para sostener diálogos difíciles con firmeza y humanidad.';
  const course26Excerpt = 'Domina conversaciones valientes con método, práctica deliberada y autorreflexión profunda.';
  const course26DurationMinutes = 240;
  let course = await db.select().from(courses).where(eq(courses.slug, 'comunicar-sin-polarizar-conversacion-valiente')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Comunicar sin Polarizar: El Arte de la Conversación Valiente',
      slug: 'comunicar-sin-polarizar-conversacion-valiente',
      description: course26Description,
      excerpt: course26Excerpt,
      category: 'comunicacion',
      level: 'beginner',
      duration: course26DurationMinutes,
      thumbnailUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
      orderIndex: 26,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 26:', course[0].title);
  } else {
    console.log('Found existing course 26:', course[0].title);
  }

  const courseId = course[0].id;
  await db.update(courses).set({
    description: course26Description,
    excerpt: course26Excerpt,
    duration: course26DurationMinutes,
  }).where(eq(courses.id, courseId));
  await resetCourseContentState(courseId);

  type Course26Deepening = {
    advancedLens: string;
    frequentMistakes: string[];
    reflectionQuestions: string[];
    practiceSprint: string[];
    masterySignal: string;
  };

  const renderCourse26DeepeningBlock = (deepening: Course26Deepening): string => `
    <div style="background:#f8fafc;border:2px solid #0f766e;border-radius:12px;padding:24px;margin:28px 0;">
      <h3 style="color:#0f766e;margin-top:0;">Laboratorio de Profundización</h3>
      <p><strong>Marco avanzado:</strong> ${deepening.advancedLens}</p>
      <h4 style="margin-bottom:0.5rem;">Errores frecuentes que escalan la grieta</h4>
      <ul style="line-height:1.8;margin-top:0;">
        ${deepening.frequentMistakes.map((mistake) => `<li>${mistake}</li>`).join('')}
      </ul>
      <h4 style="margin-bottom:0.5rem;">Preguntas de autorreflexión</h4>
      <ol style="line-height:1.9;margin-top:0;">
        ${deepening.reflectionQuestions.map((question) => `<li>${question}</li>`).join('')}
      </ol>
      <h4 style="margin-bottom:0.5rem;">Práctica deliberada (7 días)</h4>
      <ol style="line-height:1.8;margin-top:0;">
        ${deepening.practiceSprint.map((step) => `<li>${step}</li>`).join('')}
      </ol>
      <p style="margin-bottom:0;"><strong>Evidencia de progreso:</strong> ${deepening.masterySignal}</p>
    </div>
  `;

  const defaultCourse26Deepening: Course26Deepening = {
    advancedLens: 'La conversación madura combina 3 capas: contenido (qué se dice), proceso (cómo se dice) y vínculo (qué le pasa a la relación mientras hablamos).',
    frequentMistakes: [
      'Confundir intensidad emocional con profundidad argumentativa.',
      'Responder a la interpretación que hiciste, no a lo que la persona dijo literalmente.',
      'Querer cerrar el desacuerdo antes de haber comprendido qué valor protege la otra persona.'
    ],
    reflectionQuestions: [
      '¿Qué parte de esta conversación era realmente sobre ideas y qué parte era sobre identidad?',
      '¿En qué momento dejaste de escuchar para empezar a defenderte?',
      '¿Qué señal concreta te indica que ya no estás dialogando sino compitiendo?',
      '¿Qué costo relacional tuvo tu forma de comunicar en los últimos 30 días?'
    ],
    practiceSprint: [
      'Elegí una conversación compleja que evitaste y definí un objetivo de vínculo (no solo de contenido).',
      'Durante 7 días, registrá una decisión comunicacional diaria: qué elegiste decir, callar o preguntar y por qué.',
      'Al final de la semana, identificá un patrón repetido y definí un ajuste concreto para la siguiente conversación.'
    ],
    masterySignal: 'Podés sostener desacuerdo firme sin recurrir a ataques, ironía destructiva ni retirada defensiva.'
  };

  const course26DeepeningByLesson: Record<string, Course26Deepening> = {
    'Por Qué Dejamos de Hablar: La Anatomía de la Polarización': {
      advancedLens: 'La polarización se acelera cuando el desacuerdo pasa de la capa de ideas a la capa de identidad: ya no discutimos propuestas, defendemos pertenencia.',
      frequentMistakes: [
        'Reducir la postura del otro a un estereotipo ("todos son iguales").',
        'Interpretar toda diferencia como amenaza moral.',
        'Usar casos extremos para invalidar cualquier matiz del otro lado.'
      ],
      reflectionQuestions: [
        '¿Qué tema activa más tu identidad política y por qué?',
        '¿Qué vínculo dañaste por sostener una discusión en modo "ganar/perder"?',
        '¿Qué evidencia aceptarías como válida si contradijera tu posición actual?',
        '¿Qué costo social tiene para vos salir de tu tribu argumental?'
      ],
      practiceSprint: [
        'Mapeá una conversación reciente: hecho, interpretación, emoción, acción.',
        'Detectá en qué punto exacto empezó la escalada y qué alternativa había en ese momento.',
        'Reescribí esa conversación con una intervención distinta en la línea crítica.'
      ],
      masterySignal: 'Reconocés en tiempo real cuándo un intercambio pasó de argumento a ataque identitario y sabés intervenir para bajar la escalada.'
    },
    'Comunicación No Violenta para Argentinos': {
      advancedLens: 'La CNV aplicada con rigor separa datos observables de juicios y convierte demanda implícita en pedido negociable.',
      frequentMistakes: [
        'Presentar opiniones como hechos incuestionables.',
        'Usar el formato CNV como técnica de manipulación para imponer resultados.',
        'Nombrar sentimientos vagos ("mal", "raro") sin identificar la necesidad asociada.'
      ],
      reflectionQuestions: [
        '¿Qué juicio repetís como si fuera observación objetiva?',
        '¿Qué necesidad propia te cuesta admitir por miedo a parecer vulnerable?',
        '¿Cómo cambia tu mensaje cuando pedís en vez de exigir?',
        '¿Qué conversación concreta mejorarías si usaras CNV durante 10 minutos?'
      ],
      practiceSprint: [
        'Elegí 3 frases conflictivas tuyas y traducilas al formato observación-sentimiento-necesidad-pedido.',
        'Probá una conversación breve aplicando ese formato sin sonar acartonado.',
        'Anotá qué parte del proceso te resultó más difícil y por qué.'
      ],
      masterySignal: 'Podés expresar un límite firme con lenguaje claro y sin descalificar a la persona.'
    },
    'Escuchar Como Acto Radical': {
      advancedLens: 'Escuchar en serio implica tolerar la incomodidad cognitiva de no responder de inmediato y priorizar comprensión antes que réplica.',
      frequentMistakes: [
        'Interrumpir para corregir datos antes de entender la experiencia.',
        'Confundir escuchar con conceder razón.',
        'Parafrasear de forma defensiva para preparar contraataque.'
      ],
      reflectionQuestions: [
        '¿Qué señales corporales muestran que ya dejaste de escuchar?',
        '¿Con qué tipo de persona te cuesta más sostener escucha activa?',
        '¿Qué emoción tuya aparece primero cuando escuchás algo que rechazás?',
        '¿Qué descubriste la última vez que escuchaste sin interrumpir?'
      ],
      practiceSprint: [
        'Realizá una conversación de 12 minutos donde hables menos del 30% del tiempo.',
        'Usá al menos dos parafraseos fieles antes de emitir tu postura.',
        'Cerrá preguntando: "¿Sentís que entendí lo que quisiste decir?"'
      ],
      masterySignal: 'La otra persona puede resumir tu respuesta como "me sentí escuchado", aunque no haya acuerdo final.'
    },
    'La Conversación Política en el Asado Familiar': {
      advancedLens: 'En contextos familiares, la meta estratégica no es consenso ideológico sino preservar vínculo intergeneracional con desacuerdos gestionables.',
      frequentMistakes: [
        'Entrar a discutir para corregir reputación frente a terceros.',
        'Usar humillación irónica para "ganar la mesa".',
        'Forzar cierre racional cuando el grupo está emocionalmente activado.'
      ],
      reflectionQuestions: [
        '¿Qué persona de tu familia activás más fácil y qué patrón repetís con ella?',
        '¿Cuál fue tu último comentario que subió la tensión en vez de bajarla?',
        '¿Qué límite necesitás poner para cuidarte sin romper vínculo?',
        '¿Qué conversación familiar querés poder tener dentro de un año?'
      ],
      practiceSprint: [
        'Antes de la próxima reunión, definí 2 temas puente y 1 salida elegante.',
        'Si aparece política, hacé una pregunta genuina antes de responder.',
        'Evaluá la reunión con 3 criterios: respeto, claridad, continuidad del vínculo.'
      ],
      masterySignal: 'Terminás encuentros familiares con desacuerdo explícito pero sin resentimiento acumulado ni aislamiento posterior.'
    },
    'Amabilidad Radical: Ser Firme Sin Ser Cruel': {
      advancedLens: 'La amabilidad radical combina límites explícitos con dignidad relacional: firmeza en el contenido, cuidado en la forma.',
      frequentMistakes: [
        'Confundir amabilidad con permisividad sin límites.',
        'Usar firmeza como excusa para crueldad verbal.',
        'Reprimir desacuerdo por miedo al conflicto y explotar tarde.'
      ],
      reflectionQuestions: [
        '¿Dónde sos más cruel de lo necesario cuando te sentís atacado?',
        '¿Dónde sos tan complaciente que te traicionás?',
        '¿Qué límite no dicho está generando resentimiento en vos?',
        '¿Cómo suena tu versión de firmeza respetuosa en una frase concreta?'
      ],
      practiceSprint: [
        'Escribí 3 límites que necesitás comunicar esta semana.',
        'Transformá cada límite en formato: "No acepto X, sí estoy disponible para Y".',
        'Practicá decir uno en voz alta, con tono sereno y sin justificaciones infinitas.'
      ],
      masterySignal: 'Podés sostener un "no" claro sin culpa excesiva ni necesidad de atacar para sentirte fuerte.'
    },
    'Preguntas Que Abren vs. Preguntas Que Cierran': {
      advancedLens: 'La calidad de tus preguntas determina la calidad del pensamiento compartido: preguntar bien es una intervención cognitiva, no un adorno retórico.',
      frequentMistakes: [
        'Hacer preguntas-trampa para confirmar superioridad moral.',
        'Disparar múltiples preguntas seguidas sin procesar respuestas.',
        'Preguntar desde sarcasmo en vez de curiosidad real.'
      ],
      reflectionQuestions: [
        '¿Qué tipo de pregunta usás cuando querés tener razón?',
        '¿Qué pregunta evitás por miedo a la respuesta?',
        '¿Cuál fue la última pregunta que realmente cambió una conversación?',
        '¿Qué aprenderías de alguien opuesto si preguntaras sin ironía?'
      ],
      practiceSprint: [
        'Prepará 5 preguntas que abren para un tema sensible.',
        'Usá dos en una conversación real y escuchá la respuesta completa.',
        'Registrá cuál generó más apertura y por qué.'
      ],
      masterySignal: 'Lográs pasar de un intercambio reactivo a una exploración compartida usando una sola pregunta bien formulada.'
    },
    'El Arte de Cambiar de Opinión': {
      advancedLens: 'Actualizar creencias exige separar valores estables de hipótesis revisables; sin esa distinción, todo dato nuevo se vive como amenaza.',
      frequentMistakes: [
        'Defender consistencia personal por encima de la realidad observada.',
        'Cambiar de fuente pero no de método de evaluación.',
        'Asumir que revisar una opinión invalida toda tu trayectoria.'
      ],
      reflectionQuestions: [
        '¿Qué creencia te cuesta revisar porque te dio pertenencia social?',
        '¿Qué dato actual no podés explicar bien con tu modelo mental?',
        '¿Qué valor central querés conservar incluso si cambiás de opinión política?',
        '¿Quién podría desafiarte con honestidad sin que te cierres?'
      ],
      practiceSprint: [
        'Elegí una creencia fuerte y escribí los 3 mejores argumentos en contra.',
        'Buscá una conversación con alguien informado que piense distinto.',
        'Definí qué evidencia concreta te haría ajustar al menos un 10% tu postura.'
      ],
      masterySignal: 'Podés decir "en esto cambié" sin sentir vergüenza ni necesidad de justificarte excesivamente.'
    },
    'Redes Sociales: Comunicar Sin Caer en la Grieta': {
      advancedLens: 'En redes, el objetivo no es maximizar respuesta emocional sino maximizar claridad + responsabilidad + trazabilidad de fuentes.',
      frequentMistakes: [
        'Publicar bajo activación emocional alta buscando descarga inmediata.',
        'Premiar contenido que confirma tu sesgo sin verificar contexto.',
        'Responder a trolls como si buscaran diálogo genuino.'
      ],
      reflectionQuestions: [
        '¿Qué tipo de publicación tuya envejece mal al releerla 24 horas después?',
        '¿Qué porcentaje de tu feed te informa vs. solo te indigna?',
        '¿Qué parte de tu identidad digital está basada en reaccionar rápido?',
        '¿Qué criterio usarías para decidir cuándo comentar y cuándo no?'
      ],
      practiceSprint: [
        'Aplicá regla de latencia: 60 minutos antes de responder temas sensibles.',
        'Durante 7 días, no compartas nada sin leer fuente completa y contexto.',
        'Publicá un hilo o post que modele matiz, evidencia y pregunta abierta.'
      ],
      masterySignal: 'Tus publicaciones generan intercambio útil y menor tasa de conflicto improductivo en tus hilos.'
    },
    'Conversaciones Difíciles en el Trabajo': {
      advancedLens: 'En ámbitos laborales, conversar bien es una competencia de gobernanza: impacta coordinación, confianza y velocidad de ejecución.',
      frequentMistakes: [
        'Dar feedback sobre rasgos personales en vez de conductas observables.',
        'Llevar conflictos de proceso al terreno de lealtad o ego.',
        'Corregir públicamente cuando el objetivo real era aprendizaje.'
      ],
      reflectionQuestions: [
        '¿Qué conversación laboral venís postergando y cuál es su costo real?',
        '¿Qué inferencia hiciste sobre un colega sin verificar datos?',
        '¿Qué hábito tuyo reduce confianza del equipo sin que lo notes?',
        '¿Cómo comunicarías desacuerdo con tu jefe sin perder firmeza ni respeto?'
      ],
      practiceSprint: [
        'Prepará una conversación difícil con guion breve: hechos-impacto-pedido.',
        'Pedí feedback a un colega de confianza sobre tu estilo conversacional.',
        'Al cerrar una reunión compleja, confirmá acuerdos por escrito en 5 líneas.'
      ],
      masterySignal: 'Podés sostener conversaciones de alto riesgo con foco en solución y sin deteriorar la cooperación.'
    },
    'Tu Protocolo Personal de Conversación Valiente': {
      advancedLens: 'Un protocolo útil convierte habilidades sueltas en una secuencia confiable bajo presión emocional.',
      frequentMistakes: [
        'Improvisar en caliente en lugar de seguir una secuencia predefinida.',
        'Diseñar un protocolo ideal pero imposible de ejecutar en tiempo real.',
        'Medir éxito solo por convencer al otro y no por calidad del proceso.'
      ],
      reflectionQuestions: [
        '¿Qué paso de tu protocolo suele romperse primero cuando te activás?',
        '¿Qué desencadenante personal te saca del modo diálogo?',
        '¿Cómo vas a medir si tu protocolo mejora conversaciones en 30 días?',
        '¿Quién puede observarte y darte feedback honesto sobre tu ejecución?'
      ],
      practiceSprint: [
        'Escribí tu versión de PAUSA-CURIOSIDAD-EXPRESIÓN-ESCUCHA-CIERRE en una tarjeta.',
        'Usala en tres conversaciones reales y puntuá cada paso del 1 al 5.',
        'Ajustá el protocolo para que puedas recordarlo en menos de 10 segundos.'
      ],
      masterySignal: 'Tenés un método personal repetible y podés ejecutarlo incluso cuando hay tensión, prisa o desacuerdo fuerte.'
    },
    'Historia Real: Tres Años para Hablar con Mi Padre': {
      advancedLens: 'Las reconciliaciones sostenibles requieren tiempo, microacuerdos y reparación gradual de confianza; no se resuelven en una sola conversación.',
      frequentMistakes: [
        'Exigir cierre emocional inmediato después de años de conflicto.',
        'Confundir disculpa con renuncia a tus convicciones.',
        'Esperar que el otro dé el primer paso para proteger orgullo.'
      ],
      reflectionQuestions: [
        '¿Qué relación te importa reparar aunque no haya coincidencia política?',
        '¿Qué parte de tu orgullo está frenando un movimiento posible?',
        '¿Qué pedido concreto y realista podrías hacer para empezar a reconstruir?',
        '¿Qué conducta sostenida demostraría que querés reparar y no solo "quedar bien"?'
      ],
      practiceSprint: [
        'Escribí un mensaje de reapertura de vínculo (sin debate ideológico).',
        'Proponé una interacción breve de bajo riesgo: café, llamada o caminata.',
        'Después del encuentro, registrá qué gesto fortaleció confianza y cuál la debilitó.'
      ],
      masterySignal: 'Podés iniciar reparación vincular con honestidad, límites claros y expectativa realista de proceso largo.'
    }
  };

  const lessons = [
    {
      courseId,
      title: 'Por Qué Dejamos de Hablar: La Anatomía de la Polarización',
      description: 'Entender los mecanismos sistémicos que destruyen el diálogo en Argentina.',
      content: `
        <h2>La Grieta Como Sistema</h2>
        <p>La polarización argentina no es simplemente un desacuerdo político. Es un <strong>sistema de retroalimentación</strong> que se auto-refuerza: cuanto más nos dividimos, más difícil se vuelve hablar, y cuanto menos hablamos, más nos dividimos.</p>
        <h3>Cómo Funciona el Ciclo</h3>
        <ol>
          <li><strong>Evento polarizante:</strong> Una noticia, una declaración, una medida de gobierno</li>
          <li><strong>Tribalización:</strong> Cada "bando" interpreta el evento desde su marco. No hay hechos compartidos.</li>
          <li><strong>Escalada emocional:</strong> Indignación, desprecio, miedo. Las emociones reemplazan al análisis.</li>
          <li><strong>Corte de comunicación:</strong> "Con esa persona no se puede hablar." Se rompe el diálogo.</li>
          <li><strong>Confirmación de creencias:</strong> Cada bando se refugia en su burbuja, confirmando que el otro es el enemigo.</li>
          <li><strong>Vuelta al paso 1</strong> con mayor intensidad.</li>
        </ol>
        <h3>Los Costos de la Polarización</h3>
        <ul>
          <li><strong>Familias rotas:</strong> Padres e hijos que no se hablan por política</li>
          <li><strong>Amistades destruidas:</strong> Décadas de vínculo cortadas por un debate de WhatsApp</li>
          <li><strong>Parálisis colectiva:</strong> No podemos ponernos de acuerdo en nada, ni siquiera en lo que todos queremos</li>
          <li><strong>Manipulación fácil:</strong> Un pueblo dividido es un pueblo fácil de controlar</li>
        </ul>
        <h3>La Salida No Es el Centro Tibio</h3>
        <p>Romper la polarización no significa "no tener opinión" o "todos tienen un poco de razón". Significa poder <strong>escuchar una perspectiva diferente sin que tu identidad se sienta amenazada</strong>. Eso requiere habilidades que nadie nos enseñó.</p>
        <blockquote>"El Hombre Gris no está en el centro político. Está en un plano diferente, donde se puede ser firme en principios y abierto al diálogo simultáneamente."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Comunicación No Violenta para Argentinos',
      description: 'Adaptar los principios de la CNV de Marshall Rosenberg al contexto cultural argentino.',
      content: `
        <h2>CNV: No Es Ser Buenito, Es Ser Preciso</h2>
        <p>La Comunicación No Violenta (CNV) de Marshall Rosenberg suena "demasiado suave" para la cultura argentina. Pero en realidad es una <strong>herramienta de precisión</strong>: dice exactamente lo que pasa, lo que sentís y lo que necesitás, sin acusar ni agredir.</p>
        <h3>Los 4 Pasos de la CNV</h3>
        <ol>
          <li><strong>Observación (sin juicio):</strong> "Cuando me dijiste que soy un boludo por votar a X..." (no: "Siempre me faltás el respeto")</li>
          <li><strong>Sentimiento:</strong> "Me sentí herido y enojado..." (no: "Me hacés enojar" — nadie te "hace" sentir)</li>
          <li><strong>Necesidad:</strong> "Porque necesito que respetes mis decisiones aunque no estés de acuerdo..." (la necesidad detrás del sentimiento)</li>
          <li><strong>Pedido concreto:</strong> "¿Podrías expresar tu desacuerdo sin insultarme?" (no: "Dejá de ser así")</li>
        </ol>
        <h3>Adaptación Argentina</h3>
        <p>En Argentina somos directos, emocionales e hiperbólicos. La CNV pura puede sonar artificial. La adaptación:</p>
        <ul>
          <li><strong>Mantené tu estilo:</strong> No tenés que hablar como un libro de autoayuda. Usá tu vocabulario.</li>
          <li><strong>El principio, no la fórmula:</strong> Lo importante es separar observación de juicio, sentimiento de acusación, necesidad de exigencia.</li>
          <li><strong>El humor ayuda:</strong> En Argentina, el humor bien usado baja tensiones. "Mirá, si seguimos así vamos a terminar como la selección del 2002."</li>
        </ul>
        <h3>Ejercicio: Traducí al Argentino</h3>
        <p>Tomá un conflicto reciente que hayas tenido. Escribí lo que dijiste (o pensaste). Ahora reescribilo separando: hechos, sentimientos, necesidades, pedido. ¿Cambia algo?</p>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Escuchar Como Acto Radical',
      description: 'Desarrollar la capacidad de escucha profunda en una cultura que premia hablar.',
      content: `
        <h2>La Habilidad Más Subestimada de Argentina</h2>
        <p>En una cultura que premia la elocuencia, la rapidez verbal y el ingenio en la réplica, <strong>escuchar se ha convertido en un acto radical</strong>. Escuchar de verdad — no esperar tu turno para hablar, no preparar tu respuesta mientras el otro habla, no juzgar antes de entender.</p>
        <h3>Los 3 Niveles de Escucha</h3>
        <ol>
          <li><strong>Escucha superficial:</strong> Oís las palabras pero estás pensando en tu respuesta. Es lo que hacemos el 90% del tiempo.</li>
          <li><strong>Escucha activa:</strong> Prestás atención a las palabras, el tono y el lenguaje corporal. Hacés preguntas para entender mejor.</li>
          <li><strong>Escucha empática:</strong> Intentás sentir lo que el otro siente. No para estar de acuerdo, sino para comprender su experiencia.</li>
        </ol>
        <h3>Técnicas Prácticas</h3>
        <ul>
          <li><strong>El parafraseo:</strong> "Si te entendí bien, lo que decís es que..." Muestra que escuchaste y permite corregir malentendidos.</li>
          <li><strong>La pregunta curiosa:</strong> "¿Qué te lleva a pensar eso?" en vez de "¿Cómo podés pensar eso?"</li>
          <li><strong>El silencio:</strong> Después de que el otro habla, contá hasta 3 antes de responder. Ese silencio es poderoso.</li>
          <li><strong>El cuerpo que escucha:</strong> Contacto visual, cuerpo orientado hacia el otro, celular guardado.</li>
        </ul>
        <h3>El Desafío</h3>
        <p>Esta semana, elegí una conversación al día donde practiques escucha de nivel 2 o 3. No intentes ganar el debate. Solo intentá <strong>entender</strong>. Vas a descubrir cosas que nunca habías notado.</p>
        <blockquote>"En un país donde todos gritan, el que escucha tiene un superpoder."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'La Conversación Política en el Asado Familiar',
      description: 'Estrategias concretas para las discusiones políticas en reuniones familiares.',
      content: `
        <h2>El Campo de Batalla Más Difícil: Tu Familia</h2>
        <p>El asado del domingo. La mesa de Navidad. El chat familiar de WhatsApp. Estos son los espacios donde la polarización duele más, porque se mezcla lo político con lo afectivo. Y donde más necesitamos las herramientas de este curso.</p>
        <h3>Las Reglas del Asado Político</h3>
        <ol>
          <li><strong>Elegí tus batallas:</strong> No todas las provocaciones necesitan respuesta. A veces el silencio y una sonrisa son la jugada maestra.</li>
          <li><strong>Preguntá en vez de afirmar:</strong> "¿Qué te hace pensar eso?" es más poderoso que "Estás equivocado."</li>
          <li><strong>Buscá la necesidad detrás de la opinión:</strong> Tu tío que vota diferente a vos probablemente quiere lo mismo: seguridad, trabajo, futuro para sus hijos.</li>
          <li><strong>El humor como puente:</strong> Un chiste bien puesto baja tensiones mejor que cualquier argumento.</li>
          <li><strong>La salida elegante:</strong> "Qué interesante, lo voy a pensar. ¿Me pasás la ensalada?"</li>
        </ol>
        <h3>Lo Que NO Hacer</h3>
        <ul>
          <li>No intentes "convertir" a nadie en una sola conversación</li>
          <li>No uses datos como armas: "¡Pero los números dicen que...!" rara vez convence</li>
          <li>No confundas a la persona con su voto</li>
          <li>No sacrifiques una relación de 30 años por una discusión de 30 minutos</li>
        </ul>
        <h3>La Meta Real</h3>
        <p>No es que tu familia piense como vos. Es que puedan <strong>discrepar sin romperse</strong>. Que el próximo domingo sigan eligiendo sentarse juntos a comer. Eso ya es una victoria enorme contra la polarización.</p>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Amabilidad Radical: Ser Firme Sin Ser Cruel',
      description: 'El concepto de amabilidad radical como herramienta de transformación social.',
      content: `
        <h2>La Fuerza de la Amabilidad</h2>
        <p>La amabilidad radical no es debilidad, no es pasividad, no es "dejar pasar". Es la capacidad de <strong>decir la verdad con amor</strong>, de ser implacable con las ideas y compasivo con las personas.</p>
        <h3>¿Qué Es la Amabilidad Radical?</h3>
        <ul>
          <li><strong>Radical</strong> porque va a la raíz: no es cortesía superficial sino honestidad profunda</li>
          <li><strong>Amable</strong> porque reconoce la humanidad del otro, incluso cuando no estás de acuerdo</li>
          <li>Dice la verdad incómoda pero sin intención de humillar</li>
          <li>Pone límites claros sin demonizar al otro</li>
        </ul>
        <h3>Amabilidad Radical vs. Otras Formas de Comunicación</h3>
        <ol>
          <li><strong>Agresión:</strong> Decís la verdad para lastimar. "Sos un ignorante."</li>
          <li><strong>Pasividad:</strong> Callás para no molestar. Te tragás todo.</li>
          <li><strong>Pasivo-agresividad:</strong> Decís una cosa y hacés otra. Ironía venenosa.</li>
          <li><strong>Amabilidad radical:</strong> "No estoy de acuerdo con eso y te explico por qué, pero valoro esta conversación y tu persona."</li>
        </ol>
        <h3>Prácticas Diarias</h3>
        <ul>
          <li>Antes de responder algo duro, preguntate: "¿Puedo decir esto mismo de una forma que no destruya?"</li>
          <li>Separá el desacuerdo de la descalificación. "Tu idea me parece equivocada" ≠ "Sos un idiota."</li>
          <li>Reconocé cuando el otro tiene un punto válido, aunque su conclusión sea diferente.</li>
        </ul>
        <blockquote>"La amabilidad radical es el filo del Hombre Gris: corta los problemas sin cortar a las personas."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId, title: 'Preguntas Que Abren vs. Preguntas Que Cierran', description: 'El poder de las preguntas para transformar conversaciones.',
      content: `<h2>La Pregunta Correcta Cambia Todo</h2><p>Las preguntas son la herramienta más subestimada de la comunicación. Una pregunta bien formulada puede abrir un diálogo cerrado, generar reflexión en quien parecía inamovible, y transformar una pelea en una conversación.</p><h3>Preguntas Que Cierran</h3><ul><li>"¿Cómo podés pensar eso?" — Acusa, pone al otro a la defensiva.</li><li>"¿No te das cuenta de que...?" — Es una afirmación disfrazada de pregunta.</li><li>"¿Pero leíste sobre...?" — Implica que el otro es ignorante.</li></ul><h3>Preguntas Que Abren</h3><ul><li>"¿Qué experiencia te llevó a pensar así?" — Genuina curiosidad.</li><li>"¿Qué es lo que más te importa de este tema?" — Busca valores compartidos.</li><li>"¿Qué tendría que pasar para que cambiaras de opinión?" — Explora flexibilidad.</li><li>"¿Cómo te afecta esto personalmente?" — Conecta con lo humano.</li></ul><h3>La Pregunta Mágica</h3><p>Cuando una conversación se atasca, hay una pregunta que casi siempre la desatasca: <strong>"¿Qué necesitarías para sentirte escuchado en esta conversación?"</strong></p>`,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId, title: 'El Arte de Cambiar de Opinión', description: 'Desarrollar la flexibilidad intelectual como fortaleza.',
      content: `<h2>Cambiar de Opinión No Es Debilidad</h2><p>En Argentina, cambiar de opinión se asocia con debilidad, con ser "tibio" o "traidor". Pero la capacidad de <strong>actualizar tus creencias</strong> ante nueva evidencia es una de las formas más altas de inteligencia.</p><h3>¿Por Qué Nos Cuesta Tanto?</h3><ul><li><strong>Identidad:</strong> Nuestras opiniones se fusionan con nuestra identidad. Cambiar de opinión se siente como perder parte de quiénes somos.</li><li><strong>Costo social:</strong> Si cambias de posición, tu "tribu" puede rechazarte.</li><li><strong>Sesgo de consistencia:</strong> Nuestro cerebro prefiere ser consistente aunque esté equivocado.</li></ul><h3>Prácticas para la Flexibilidad Intelectual</h3><ol><li><strong>Buscá activamente argumentos contra tu posición.</strong> Si no podés argumentar el otro lado, no entendés suficientemente bien el tema.</li><li><strong>Tené una lista de "cosas en las que cambié de opinión".</strong> Es un ejercicio de humildad poderoso.</li><li><strong>Distinguí opiniones de valores.</strong> Tus valores son estables; tus opiniones sobre cómo alcanzarlos pueden cambiar.</li><li><strong>Celebrá cuando alguien cambia de opinión.</strong> En vez de "¿Ves? Tenía razón", probá con "Aprecio tu apertura a pensar diferente."</li></ol>

        <h3>Las Cámaras de Eco: Cómo Tu Burbuja Te Está Engañando</h3>
        <p>Una cámara de eco es un entorno informativo donde <strong>solo escuchás lo que ya creés</strong>. Las redes sociales la construyen con algoritmos. Tu círculo social la refuerza con afinidad. Y tu cerebro la consolida con el sesgo de confirmación. El resultado: vivís en una realidad paralela convencido de que es LA realidad.</p>
        <p>En Argentina, las cámaras de eco son especialmente tóxicas porque se superponen con identidades políticas profundas. Si consumís solo medios afines a tu posición, empezás a creer que "todo el mundo" piensa como vos. Y cuando descubrís que la mitad del país piensa diferente, la reacción no es curiosidad: es indignación.</p>

        <h3>Tu Dieta Informativa de 30 Días: Protocolo Completo</h3>
        <p>Así como hay dietas alimentarias para mejorar tu salud física, necesitás una <strong>dieta informativa</strong> para mejorar tu salud democrática. Este protocolo de 30 días está diseñado para romper tu cámara de eco sin que pierdas la cabeza:</p>
        <h4>Semana 1: Auditoría (Días 1-7)</h4>
        <ul>
          <li><strong>Día 1-3:</strong> Anotá TODO lo que consumís informativamente durante 3 días: qué medios, qué cuentas de redes, qué programas de TV/radio, qué grupos de WhatsApp. No juzgues, solo anotá.</li>
          <li><strong>Día 4:</strong> Clasificá tu consumo. ¿Cuántas de esas fuentes están "de tu lado"? ¿Cuántas presentan perspectivas diferentes? Si más del 80% confirma lo que ya pensás, estás en una cámara de eco.</li>
          <li><strong>Día 5-7:</strong> Identificá los 3 temas que más te polarizan (economía, seguridad, educación, lo que sea). Para cada uno, anotá qué fuentes consumís y qué perspectiva te falta.</li>
        </ul>
        <h4>Semana 2: Apertura Controlada (Días 8-14)</h4>
        <ul>
          <li>Agregá <strong>1 fuente diaria</strong> de una perspectiva diferente a la tuya. No para enojarte: para entender qué argumentos usan y qué les preocupa.</li>
          <li>Regla de oro: leé/escuchá con la pregunta "¿Qué necesidad legítima hay detrás de esta posición?" en vez de "¿Cómo puede alguien creer esto?"</li>
          <li>Anotá en un cuaderno: ¿Qué aprendí hoy de una fuente que normalmente no consumo?</li>
        </ul>
        <h4>Semana 3: Balance Activo (Días 15-21)</h4>
        <ul>
          <li>Tu consumo diario debe incluir <strong>al menos 2 fuentes de perspectivas diferentes</strong>.</li>
          <li>Practicá el "steelmanning": antes de criticar una posición, reformulala de la forma más fuerte posible. Si no podés hacerlo, todavía no la entendés bien.</li>
          <li>Dejá de seguir o silenciá al menos 3 cuentas que solo te generan indignación sin información.</li>
        </ul>
        <h4>Semana 4: Nuevo Sistema (Días 22-30)</h4>
        <ul>
          <li>Diseñá tu dieta informativa permanente: una combinación de fuentes que te informe, te desafíe y te mantenga conectado con perspectivas diversas.</li>
          <li>Establecé horarios de consumo informativo: no más de 30 minutos de noticias por la mañana, 30 minutos por la noche. El scroll infinito no informa: intoxica.</li>
          <li>Compartí con un amigo o familiar lo que aprendiste. La dieta informativa funciona mejor en compañía.</li>
        </ul>

        <h3>Balance de Medios Argentinos: Recomendaciones Concretas</h3>
        <p>Para armar una dieta informativa equilibrada en Argentina, necesitás entender el mapa mediático. Acá va una guía honesta:</p>
        <ul>
          <li><strong>Medios con línea editorial más cercana al oficialismo de turno:</strong> Consumilos para entender la narrativa del poder. No los tomes como verdad: tomalos como información sobre qué quiere comunicar el gobierno.</li>
          <li><strong>Medios con línea editorial opositora:</strong> Consumilos para entender la narrativa de la oposición. Misma regla: son información sobre una perspectiva, no verdad revelada.</li>
          <li><strong>Medios de datos y verificación:</strong> Chequeado.com es la referencia argentina en fact-checking. No tiene línea partidaria definida. Usalo para verificar afirmaciones de CUALQUIER sector.</li>
          <li><strong>Medios cooperativos y comunitarios:</strong> Tiempo Argentino, lavaca.org, medios de FM comunitarias. Ofrecen perspectivas que los grandes medios ignoran: las del territorio, las organizaciones sociales, las comunidades.</li>
          <li><strong>Medios internacionales en español:</strong> BBC Mundo, Deutsche Welle, France 24. Te dan perspectiva sobre Argentina desde afuera, sin los sesgos locales.</li>
          <li><strong>Newsletters independientes:</strong> Cenital, Seúl, elDiarioAR. Periodismo de autor con diversidad de perspectivas. Menos click-bait, más análisis.</li>
        </ul>
        <p><strong>La regla de oro:</strong> No busques "el medio objetivo". No existe. Buscá <strong>diversidad de subjetividades</strong>. Si solo una fuente te parece confiable, estás en una cámara de eco.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Hacé tu auditoría rápida ahora mismo. Abrí tu celular y respondé:</p>
          <ol>
            <li>¿Cuáles son las últimas 5 cuentas de noticias/opinión que viste en redes?</li>
            <li>¿Cuántas de esas 5 comparten tu perspectiva política?</li>
            <li>¿Cuándo fue la última vez que leíste un artículo completo de un medio que no te gusta?</li>
            <li>Si la respuesta a la 2 es "4 o 5" y la respuesta a la 3 es "no me acuerdo", estás en una cámara de eco. No es tu culpa — los algoritmos te pusieron ahí. Pero salir es tu responsabilidad.</li>
          </ol>
          <p>Comprometete hoy a empezar el protocolo de 30 días. Anotá la fecha de inicio. Marcá en el calendario el día 30. Tu futuro yo democrático te lo va a agradecer.</p>
        </div>

        <blockquote>"El Hombre Gris no es el que tiene todas las respuestas. Es el que tiene la valentía de cambiar sus respuestas cuando la realidad se lo pide."</blockquote>`,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId, title: 'Redes Sociales: Comunicar Sin Caer en la Grieta', description: 'Navegar redes sociales como herramienta de comunicación constructiva.',
      content: `<h2>Las Redes: Tu Arena o Tu Trampa</h2><p>Las redes sociales amplifican la polarización por diseño: los algoritmos premian la indignación, los formatos cortos eliminan matices, y la velocidad impide la reflexión. Pero también son la herramienta de comunicación más poderosa que tenés.</p><h3>Reglas para Redes Constructivas</h3><ul><li><strong>No publiques en caliente:</strong> Si algo te indignó, esperá 1 hora antes de comentar.</li><li><strong>El test del almuerzo:</strong> ¿Le dirías esto a la persona en la cara, almorzando juntos? Si no, no lo publiques.</li><li><strong>Matizá:</strong> Agregá un "me parece que" o "desde mi perspectiva". Deja espacio para el diálogo.</li><li><strong>No alimentes trolls:</strong> Si alguien busca pelea, no le des lo que busca. Silenciar/bloquear es legítimo.</li></ul><h3>Crear Contenido Que Construya</h3><ol><li>Compartí experiencias personales en vez de opiniones abstractas</li><li>Hacé preguntas genuinas en vez de afirmaciones absolutas</li><li>Reconocé la complejidad: "este tema tiene muchas aristas"</li><li>Celebrá cuando alguien de "el otro lado" hace algo bien</li></ol><h3>Tu Dieta Informativa</h3><p>Seguí deliberadamente al menos 3 fuentes de información que no compartan tu perspectiva. No para enojarte, sino para entender cómo piensa la otra parte. La burbuja es cómoda pero peligrosa.</p>`,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId, title: 'Conversaciones Difíciles en el Trabajo', description: 'Aplicar herramientas de comunicación no polarizante en el ámbito laboral.',
      content: `<h2>El Trabajo: Otro Campo Minado</h2><p>En el trabajo pasamos más horas que con nuestra familia. Y las conversaciones difíciles — pedir un aumento, dar feedback negativo, resolver un conflicto con un colega, hablar de política en el almuerzo — requieren las mismas herramientas que estamos aprendiendo.</p><h3>Tipos de Conversaciones Difíciles Laborales</h3><ul><li><strong>Feedback negativo:</strong> Describí el comportamiento específico, no la persona. "El informe tenía 3 errores" vs. "Sos desprolijo."</li><li><strong>Pedido de aumento/mejora:</strong> Preparate con datos concretos de tu aporte. No es personal: es negociación.</li><li><strong>Conflicto con colega:</strong> Hablá en privado primero. Planteá el problema como compartido: "Tenemos un tema que resolver."</li><li><strong>Política en el almuerzo:</strong> Las mismas reglas del asado aplican, pero con un agregado: tu trabajo está en juego.</li></ul><h3>La Escalera de Inferencia</h3><p>Cuando alguien hace algo que te molesta, tu cerebro sube la <strong>escalera de inferencia</strong>: observación → interpretación → conclusión → reacción. El problema es que subimos los escalones en milisegundos y reaccionamos a nuestra interpretación, no a los hechos.</p><p>Práctica: cuando algo te moleste, bajá la escalera. "¿Qué vi realmente? ¿Hay otra interpretación posible?"</p>

        <h3>Construir Confianza en una Cultura de Desconfianza</h3>
        <p>Argentina tiene un problema profundo con la confianza. Según encuestas recientes, menos del 20% de los argentinos dice confiar en "la mayoría de las personas". Comparado con países nórdicos (donde supera el 60%), vivimos en una sociedad donde <strong>la desconfianza es el default</strong>. Esto afecta todo: desde las relaciones laborales hasta la capacidad de organizarse colectivamente.</p>
        <p>La confianza no se pide. Se construye. Y se construye con acciones repetidas en el tiempo, no con palabras. Acá van las prácticas que funcionan:</p>
        <ul>
          <li><strong>Consistencia:</strong> Hacé lo que dijiste que ibas a hacer. Siempre. Si no podés cumplir, avisá antes, no después. En Argentina la frase "mañana te lo mando" destruyó más confianza que cualquier traición.</li>
          <li><strong>Vulnerabilidad calculada:</strong> Mostrar que no tenés todas las respuestas genera más confianza que fingir que sí. "No sé, pero lo averiguo" es más confiable que "sí, obvio" seguido de silencio.</li>
          <li><strong>Escuchar sin interrumpir:</strong> En una cultura donde interrumpir es deporte nacional, dejar que alguien termine de hablar es un acto de respeto que genera confianza inmediata.</li>
          <li><strong>Transparencia sobre intenciones:</strong> Decí qué querés y por qué lo querés. La ambigüedad genera sospecha. "Te propongo esto porque a mí me conviene por X y a vos te conviene por Y" es más confiable que "te propongo esto porque es lo mejor para todos".</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <h4>Role-Play: 3 Escenarios de Conflicto Argentino</h4>
          <p>Estos ejercicios están diseñados para practicarse con otra persona (amigo, pareja, colega). Uno hace de "Persona A" y otro de "Persona B". Después de cada escenario, intercambien roles. Al terminar, conversen: ¿Qué funcionó? ¿Qué fue difícil? ¿Qué harían diferente?</p>

          <h4>Escenario 1: La Mesa de Navidad</h4>
          <p><strong>Contexto:</strong> Es 24 de diciembre. Toda la familia alrededor de la mesa. Tu tío Roberto (que votó al partido opuesto al tuyo) acaba de decir: "Este país se arregla fácil, lo que pasa es que hay gente que no quiere laburar." Tu mamá te mira con cara de "por favor, no empecemos." Tu prima grabó un TikTok hace 2 semanas criticando a los votantes de tu tío y él lo vio.</p>
          <p><strong>Persona A (vos):</strong> Querés responder a tu tío sin arruinar la cena pero sin callarte. Tenés datos que contradicen lo que dijo, pero sabés que los datos no funcionan en este contexto.</p>
          <p><strong>Persona B (el tío Roberto):</strong> Estás convencido de lo que dijiste. Sentís que tu sobrina/sobrino te mira con desprecio por cómo votaste. Estás a la defensiva porque viste el TikTok de tu hija criticando a gente como vos.</p>
          <p><strong>Objetivo:</strong> Terminar la conversación con la relación intacta Y habiendo expresado tu perspectiva. Que el 25 de diciembre tu tío siga queriéndote.</p>
          <p><em>Herramientas sugeridas: Preguntas que abren, humor como puente, amabilidad radical, la salida elegante.</em></p>

          <h4>Escenario 2: El Grupo de WhatsApp del Edificio</h4>
          <p><strong>Contexto:</strong> Vivís en un edificio de departamentos en cualquier ciudad argentina. El grupo de WhatsApp de consorcio tiene 45 miembros. Alguien publicó un link de noticias con un comentario político agresivo. La mitad del grupo saltó a favor, la otra mitad en contra. En 2 horas hay 200 mensajes, insultos, gente que abandonó el grupo. La administradora no sabe qué hacer. Vos necesitás que el grupo funcione porque hay temas urgentes del edificio (filtraciones, expensas, seguridad).</p>
          <p><strong>Persona A (vos):</strong> Querés intervenir para bajar la tensión y redirigir el grupo a temas del edificio, sin que te acusen de censurar ni de estar de un lado.</p>
          <p><strong>Persona B (el vecino más exaltado):</strong> Estás convencido de que el tema político ES un tema del edificio ("porque si sube la inflación no podemos pagar las expensas"). Sentís que los que piden no hablar de política son cómplices del problema.</p>
          <p><strong>Objetivo:</strong> Lograr que el grupo vuelva a ser funcional sin silenciar a nadie y sin que explote otra pelea.</p>
          <p><em>Herramientas sugeridas: CNV adaptada, la escalera de inferencia, separar la persona de la opinión.</em></p>

          <h4>Escenario 3: El Compañero de Trabajo que Difunde Desinformación</h4>
          <p><strong>Contexto:</strong> Tu compañero de oficina, con quien tenés buena relación laboral y personal, comparte constantemente noticias falsas o distorsionadas en el grupo de WhatsApp del equipo de trabajo. Ayer compartió un artículo de un sitio de desinformación conocido con datos inventados sobre un tema que afecta directamente tu área profesional. Varios compañeros le pusieron "me gusta" al mensaje. Tu jefa está en el grupo pero no dice nada.</p>
          <p><strong>Persona A (vos):</strong> Querés corregir la desinformación sin humillar a tu compañero, sin parecer que te creés superior, y sin generar un ambiente laboral tóxico.</p>
          <p><strong>Persona B (el compañero):</strong> Compartiste el artículo de buena fe. Te pareció interesante. No verificaste la fuente porque coincidía con lo que ya creías. Si alguien te dice que es falso, te vas a sentir atacado y avergonzado delante del grupo.</p>
          <p><strong>Objetivo:</strong> Que la información correcta circule sin que tu compañero se sienta humillado y sin dañar la relación laboral.</p>
          <p><em>Herramientas sugeridas: El mensaje privado antes del público, preguntas en vez de afirmaciones, ofrecer la fuente verificada sin acusar.</em></p>

          <p><strong>Después de cada role-play, evaluá:</strong></p>
          <ol>
            <li>¿Pudiste aplicar al menos una herramienta del curso?</li>
            <li>¿En qué momento sentiste que te "subía la temperatura"?</li>
            <li>¿Qué fue lo más difícil: escuchar, expresarte sin agredir, o cerrar la conversación?</li>
            <li>¿Cambió algo cuando intercambiaron roles y te tocó ser "el otro"?</li>
          </ol>
        </div>`,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId, title: 'Tu Protocolo Personal de Conversación Valiente', description: 'Crear tu propio sistema para abordar conversaciones difíciles.',
      content: `<h2>Tu Manual de Conversación</h2><p>A lo largo de este curso adquiriste herramientas de comunicación no violenta, escucha radical, preguntas que abren, y amabilidad radical. Ahora es momento de crear tu <strong>protocolo personal</strong>: un sistema que puedas usar automáticamente cuando una conversación se pone difícil.</p><h3>Tu Protocolo en 5 Pasos</h3><ol><li><strong>PAUSA:</strong> Cuando sentís que se te sube la temperatura, respirá 3 veces antes de hablar. Esos 10 segundos pueden cambiar todo.</li><li><strong>CURIOSIDAD:</strong> Preguntate genuinamente "¿Qué está sintiendo esta persona? ¿Qué necesita?"</li><li><strong>EXPRESIÓN:</strong> Usá el formato CNV adaptado: "Cuando pasa X, yo siento Y, porque necesito Z. ¿Podríamos intentar W?"</li><li><strong>ESCUCHA:</strong> Después de hablar, callate y escuchá. De verdad. Sin preparar tu respuesta.</li><li><strong>CIERRE:</strong> Buscá un acuerdo concreto o reconocé el desacuerdo con respeto: "No estamos de acuerdo en esto, y está bien."</li></ol><h3>Tu Compromiso</h3><p>Elegí una relación donde la comunicación sea difícil (familia, trabajo, amigo) y comprometete a practicar tu protocolo durante 30 días. No vas a ser perfecto. Vas a meter la pata. Pero cada intento te acerca a conversaciones más honestas y menos destructivas.</p><blockquote>"La palabra precisa no es la más inteligente ni la más dura. Es la que dice la verdad sin destruir al otro. Ese es el arte del Hombre Gris en la conversación."</blockquote>`,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Historia Real: Tres Años para Hablar con Mi Padre',
      description: 'Una narrativa en primera persona sobre reconstruir una relación destruida por la diferencia política.',
      content: `
        <h2>Lo Que La Grieta Se Llevó</h2>
        <p>Esta no es una lección con técnicas ni frameworks. Es una historia. Mi historia. La comparto porque creo que hay miles de personas en Argentina viviendo algo parecido, y porque a veces <strong>la mejor forma de enseñar es mostrando la herida y cómo cicatrizó</strong>.</p>

        <h3>El Último Asado</h3>
        <p>Fue un domingo de noviembre, tres semanas antes de las elecciones. Mi viejo había puesto la carne temprano, como siempre. El ritual perfecto: fuego, humo, mate mientras se esperaba. Yo llegué con mi pareja y una ensalada que nadie iba a tocar.</p>
        <p>No me acuerdo quién empezó. Probablemente yo. Probablemente él. Lo que sí me acuerdo es la frase que detonó todo: <strong>"Vos no entendés nada porque vivís en una burbuja."</strong> Él me la dijo a mí. Yo le dije algo peor. Mi vieja se fue a la cocina. Mi hermana se puso a mirar el celular. Mi pareja me apretó la mano por debajo de la mesa como diciendo "pará".</p>
        <p>No paré. Él tampoco. Nos dijimos cosas que no se pueden desdecir. Cosas que no eran sobre política: eran sobre respeto, sobre reconocimiento, sobre quién era más inteligente, sobre quién tenía derecho a opinar. La política era la excusa. La pelea era otra cosa.</p>
        <p>Me fui sin comer el postre. No le hablé durante tres meses.</p>

        <h3>Los Tres Meses de Silencio</h3>
        <p>Los primeros días, estaba convencido de que yo tenía razón. Obvio. Tenía los datos, los artículos, los argumentos. ¿Cómo podía mi propio padre no ver lo evidente?</p>
        <p>Después de un mes, empecé a extrañarlo. No sus opiniones políticas. A <strong>él</strong>. Su voz en el teléfono preguntándome cómo andaba. Los chistes malos que mandaba por WhatsApp. Las historias de cuando era chico que contaba siempre igual y que yo fingía no haber escuchado nunca.</p>
        <p>Al segundo mes, mi vieja me llamó llorando. "Tu padre está triste. No me lo dice pero lo veo. Está triste y yo estoy cansada de estar en el medio." Esa llamada me partió al medio. Mi mamá era la que más sufría, y ninguno de los dos había pensado en ella.</p>
        <p>Al tercer mes, pasó algo que me cambió. Estaba scrolleando Twitter y vi un hilo de un tipo que se jactaba de haber "cortado relación" con su familia por diferencias políticas. Los comentarios lo aplaudían: "¡Bien! ¡No se puede convivir con eso!" Y de repente vi mi propia cara en ese espejo y <strong>no me gustó lo que vi</strong>. ¿Eso era yo? ¿Alguien que prefería tener razón a tener padre?</p>

        <h3>La Llamada</h3>
        <p>Lo llamé un martes a las 10 de la noche. Contestó al primer ring, como si hubiera estado esperando. Ninguno de los dos mencionó la pelea. Hablamos del clima. Del perro. De que a mi hermana le iba bien en el trabajo. Cosas chiquitas, insignificantes, que en ese momento eran enormes.</p>
        <p>Antes de cortar le dije: "Viejo, te quiero. Perdón por lo que dije." Y él contestó algo que todavía me emociona: "Yo también, hijo. No nos hagamos esto de vuelta."</p>
        <p>Esa fue la parte fácil. La parte difícil vino después.</p>

        <h3>Los Tres Años de Reconstrucción</h3>
        <p>Reconciliarse no es hacer una llamada. Es <strong>reconstruir un vínculo dañado</strong>, pieza por pieza, conversación por conversación. Y eso nos llevó tres años. Te cuento lo que aprendí:</p>

        <h4>Año 1: Las Reglas Nuevas</h4>
        <p>Establecimos reglas no escritas. No hablábamos de política. Cuando alguien sacaba el tema, cambiábamos de conversación. Fue incómodo y artificial, pero necesario. Era como una rehabilitación: primero aprendés a caminar de nuevo antes de correr.</p>
        <p>Lo que descubrí: cuando sacás la política de la mesa, lo que queda es un padre y un hijo que se quieren. Esa base no estaba rota. Estaba tapada.</p>

        <h4>Año 2: Las Preguntas Nuevas</h4>
        <p>Empecé a hacerle preguntas que nunca le había hecho. No sobre qué pensaba sino sobre <strong>por qué</strong> pensaba lo que pensaba. "Viejo, ¿cómo era vivir durante la hiperinflación? ¿Qué sentías?" Y él empezó a contarme cosas que explicaban todo. Su miedo a la inestabilidad no era irracional: lo había vivido en carne propia. Su desconfianza hacia ciertos discursos políticos no era ignorancia: era memoria.</p>
        <p>No cambié de opinión. Pero empecé a <strong>entender</strong> la suya. Y eso cambió todo.</p>

        <h4>Año 3: La Conversación Posible</h4>
        <p>Un día, sin planearlo, volvimos a hablar de política. Pero esta vez fue diferente. No era una batalla. Era una conversación. Él dijo algo con lo que no estaba de acuerdo y en vez de saltar le dije: "Entiendo por qué pensás eso. Yo lo veo distinto por tal razón. Pero entiendo tu punto." Y él hizo lo mismo conmigo.</p>
        <p>No nos convencimos mutuamente. Seguimos votando diferente. Pero ahora podemos <strong>hablar sin destruirnos</strong>. Y honestamente, eso vale más que cualquier victoria electoral.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Esta historia es personal, pero el patrón es universal. Si tenés una relación rota o dañada por diferencias políticas, respondé honestamente:</p>
          <ol>
            <li>¿Qué extrañás de esa persona más allá de la política?</li>
            <li>¿Qué necesidad legítima hay detrás de la posición política de esa persona? (No qué piensa, sino qué miedo, qué experiencia, qué necesidad sostiene esa posición.)</li>
            <li>¿Preferís tener razón o tener a esa persona en tu vida? No es una pregunta trampa: a veces la respuesta genuina es "prefiero tener razón" y eso también es válido. Pero tenés que ser honesto.</li>
            <li>Si eligieras reconstruir, ¿cuál sería tu primer paso? ¿Una llamada? ¿Un mensaje? ¿Ir a un asado sin agenda política?</li>
          </ol>
          <p>No hay respuesta correcta. Hay decisiones que tomás sabiendo lo que cuestan y lo que valen.</p>
        </div>

        <h3>Lo Que Aprendí (y Lo Que Te Dejo)</h3>
        <p>De toda esta experiencia, me quedaron algunas certezas:</p>
        <ul>
          <li><strong>La política es importante, pero las personas son irremplazables.</strong> Vas a tener muchas elecciones en tu vida. Padre, uno solo.</li>
          <li><strong>Nadie cambia de opinión porque le gritaron.</strong> Cambian cuando se sienten escuchados, respetados y seguros.</li>
          <li><strong>El orgullo es el peor consejero.</strong> "Que llame él primero" es una frase que destruyó más familias que cualquier crisis económica.</li>
          <li><strong>Entender no es aceptar.</strong> Podés entender por qué alguien piensa como piensa sin estar de acuerdo. Y ese entender abre puertas que el juicio cierra.</li>
          <li><strong>La reconciliación no es un momento: es un proceso.</strong> No se arregla con una llamada. Se arregla con cientos de pequeños actos de respeto sostenidos en el tiempo.</li>
        </ul>
        <p>Si estás viviendo algo parecido, no te digo que perdones todo ni que te tragues tu verdad. Te digo que <strong>evalúes el costo</strong>. Que pienses en lo que perdés. Y que recuerdes que la persona al otro lado de la grieta probablemente también te extraña pero no sabe cómo cruzar.</p>
        <p>Alguien tiene que dar el primer paso. ¿Por qué no vos?</p>

        <blockquote>"El Hombre Gris no elige bandos en la guerra familiar. Elige la trinchera más difícil de todas: la de quien tiende la mano cuando todo el mundo dice que hay que soltar. Eso no es debilidad. Es la forma más alta de valentía."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  const enrichedLessons = lessons.map((lesson) => {
    const deepening = course26DeepeningByLesson[lesson.title] ?? defaultCourse26Deepening;
    return {
      ...lesson,
      duration: lesson.duration + 6,
      content: `${lesson.content}${renderCourse26DeepeningBlock(deepening)}`,
    };
  });

  for (const lesson of enrichedLessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', enrichedLessons.length, 'lessons for course 26');

  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }

  const [quiz] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Comunicar sin Polarizar', description: 'Evaluá tu comprensión de las herramientas de comunicación constructiva.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();

  const questions = [
    { quizId: quiz.id, question: '¿Cuál es el primer paso de la Comunicación No Violenta?', type: 'multiple_choice' as const, options: JSON.stringify(['Expresar sentimientos', 'Hacer un pedido', 'Observar sin juzgar', 'Identificar necesidades']), correctAnswer: JSON.stringify(2), explanation: 'La CNV empieza por observar los hechos sin mezclarlos con juicios o interpretaciones.', points: 2, orderIndex: 1 },
    { quizId: quiz.id, question: 'La amabilidad radical significa evitar todo conflicto.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La amabilidad radical dice la verdad incómoda pero sin intención de humillar. No evita el conflicto.', points: 1, orderIndex: 2 },
    { quizId: quiz.id, question: '¿Cuál es una "pregunta que abre" conversaciones?', type: 'multiple_choice' as const, options: JSON.stringify(['"¿No te das cuenta de que...?"', '"¿Qué experiencia te llevó a pensar así?"', '"¿Cómo podés creer eso?"', '"¿Pero leíste sobre...?"']), correctAnswer: JSON.stringify(1), explanation: 'Las preguntas que abren muestran genuina curiosidad por la experiencia del otro.', points: 2, orderIndex: 3 },
    { quizId: quiz.id, question: 'El "test del almuerzo" para redes sociales pregunta: ¿Le dirías esto a la persona cara a cara?', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Si no lo dirías en persona, probablemente no deberías publicarlo en redes.', points: 1, orderIndex: 4 },
    { quizId: quiz.id, question: '¿Qué es la "escalera de inferencia"?', type: 'multiple_choice' as const, options: JSON.stringify(['Un método de debate', 'El proceso mental de observación → interpretación → conclusión → reacción', 'Una técnica de negociación', 'Un modelo de comunicación organizacional']), correctAnswer: JSON.stringify(1), explanation: 'Subimos la escalera en milisegundos y reaccionamos a interpretaciones, no a hechos.', points: 2, orderIndex: 5 },
    { quizId: quiz.id, question: 'Cambiar de opinión ante nueva evidencia es señal de debilidad intelectual.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La capacidad de actualizar creencias es una forma de inteligencia y coraje.', points: 1, orderIndex: 6 },
    { quizId: quiz.id, question: '¿Cuál es el primer paso del protocolo PAUSA-CURIOSIDAD-EXPRESIÓN-ESCUCHA-CIERRE?', type: 'multiple_choice' as const, options: JSON.stringify(['Expresar tu posición', 'Respirar y pausar antes de hablar', 'Escuchar al otro', 'Buscar un acuerdo']), correctAnswer: JSON.stringify(1), explanation: 'La pausa de 10 segundos antes de responder puede transformar toda la conversación.', points: 2, orderIndex: 7 },
    { quizId: quiz.id, question: 'Para romper la burbuja informativa, debés seguir al menos 3 fuentes que no compartan tu perspectiva.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Diversificar fuentes ayuda a entender cómo piensa la otra parte y a salir de la burbuja.', points: 1, orderIndex: 8 },
    { quizId: quiz.id, question: 'En una discusión familiar intensa, ¿cuál es el objetivo primario de este curso?', type: 'multiple_choice' as const, options: JSON.stringify(['Ganar el debate con más datos', 'Evitar cualquier desacuerdo', 'Preservar el vínculo mientras expresás tu postura', 'Lograr que el otro cambie su voto en ese momento']), correctAnswer: JSON.stringify(2), explanation: 'El curso prioriza sostener vínculos y calidad conversacional, no imponer un cambio inmediato de posición.', points: 2, orderIndex: 9 },
    { quizId: quiz.id, question: 'El steelmanning consiste en caricaturizar la posición opuesta para refutarla más fácil.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Steelmanning es reconstruir la versión más fuerte de la postura contraria antes de criticarla.', points: 1, orderIndex: 10 },
    { quizId: quiz.id, question: '¿Qué conducta construye confianza en conversaciones laborales polarizadas?', type: 'multiple_choice' as const, options: JSON.stringify(['Prometer rápido y ajustar después', 'Ocultar dudas para parecer más fuerte', 'Decir "no sé, lo averiguo" y cumplir', 'Corregir en público para mostrar autoridad']), correctAnswer: JSON.stringify(2), explanation: 'La confianza se fortalece con consistencia, transparencia y cumplimiento de compromisos.', points: 2, orderIndex: 11 },
    { quizId: quiz.id, question: 'Si sentís activación emocional alta durante una conversación, ¿qué recomienda el protocolo?', type: 'multiple_choice' as const, options: JSON.stringify(['Contraargumentar de inmediato', 'Cerrar con ironía para no quedar expuesto', 'Pausar, respirar y formular una pregunta curiosa', 'Cambiar de tema sin reconocer tensión']), correctAnswer: JSON.stringify(2), explanation: 'La secuencia empieza con pausa y regulación para evitar respuestas reactivas.', points: 2, orderIndex: 12 },
  ];
  for (const q of questions) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz with', questions.length, 'questions for course 26');
}

async function seedCourse27(authorId: number) {
  console.log('--- Course 27: Alfabetismo Mediático ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'alfabetismo-mediatico-desinformacion')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({ title: 'Alfabetismo Mediático: Navegar la Era de la Desinformación', slug: 'alfabetismo-mediatico-desinformacion', description: 'Entiende cómo funcionan realmente los medios argentinos y desarrolla herramientas para detectar propaganda, astroturfing y desinformación.', excerpt: 'Navega el ecosistema mediático argentino con ojo crítico y herramientas concretas.', category: 'comunicacion', level: 'intermediate', duration: 160, thumbnailUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800', orderIndex: 27, isPublished: true, isFeatured: false, requiresAuth: false, authorId }).returning();
    course = [newCourse];
    console.log('Created course 27:', course[0].title);
  } else {
    // Update image if needed
    await db.update(courses).set({ thumbnailUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800' }).where(eq(courses.slug, 'alfabetismo-mediatico-desinformacion'));
    console.log('Found existing course 27, updated image:', course[0].title);
  }

  const courseId = course[0].id;
  await resetCourseContentState(courseId);

  const lessons = [
    {
      courseId,
      title: 'El Ecosistema Mediático Argentino: Quién Es Quién',
      description: 'Mapear el paisaje de medios argentinos y entender quién es dueño de qué.',
      content: `
        <h2>No Podés Navegar Lo Que No Mapeaste</h2>
        <p>Antes de aprender a detectar desinformación, necesitás entender <strong>quién te habla y por qué</strong>. Los medios de comunicación no son espejos neutrales de la realidad: son empresas (o proyectos políticos) con dueños, modelos de negocio, audiencias y agendas.</p>
        <h3>Los Grandes Grupos</h3>
        <ul>
          <li><strong>Grupo Clarín:</strong> El conglomerado mediático más grande de Argentina y uno de los más grandes de Latinoamérica. Incluye Clarín (diario más leído), TN (canal de noticias más visto), Canal 13, Radio Mitre, Cablevisión, Fibertel/Flow (internet), Artear, AGEA, y decenas de medios más. Su posición dominante le da poder de agenda sin precedentes.</li>
          <li><strong>Grupo Indalo / La Nación / Otros:</strong> Cada grupo mediático tiene su historia, sus alianzas políticas y sus intereses económicos. La Nación representa históricamente a los sectores conservadores y agroexportadores. Página/12 al progresismo. Infobae busca un perfil más "neutral" digital.</li>
          <li><strong>Medios públicos:</strong> TV Pública, Radio Nacional, Télam/agencia oficial. Cambian de línea editorial con cada gobierno, lo que los deslegitima como servicio público.</li>
          <li><strong>Medios digitales nativos:</strong> Cenital, El Destape, Letra P, Chequeado, Red/Acción. Modelos de negocio basados en suscripción, con menor dependencia de pauta oficial.</li>
        </ul>
        <h3>El Modelo de Negocio Determina el Contenido</h3>
        <p>Pregunta clave que pocos se hacen: <strong>¿de qué vive este medio?</strong></p>
        <ul>
          <li><strong>Pauta publicitaria privada:</strong> El medio necesita audiencia masiva → tendencia al sensacionalismo, clickbait, contenido polarizante.</li>
          <li><strong>Pauta oficial (gobierno):</strong> El medio necesita la buena voluntad del gobierno → autocensura en temas sensibles al poder.</li>
          <li><strong>Suscripción de lectores:</strong> El medio necesita lectores fieles → tendencia a confirmar los sesgos de su audiencia.</li>
          <li><strong>Financiamiento de grupos económicos:</strong> El medio sirve a los intereses del grupo → la línea editorial protege esos intereses.</li>
        </ul>
        <h3>Ejercicio: Tu Mapa de Medios</h3>
        <p>Hacé una lista de los 5 medios que más consumís. Para cada uno, investigá: ¿quién es el dueño? ¿De qué vive? ¿Qué temas cubre bien y cuáles ignora? Vas a descubrir que tu "dieta informativa" tiene sesgos que no habías notado.</p>
        <blockquote>"El primer paso del alfabetismo mediático no es aprender a detectar fake news. Es entender que TODOS los medios tienen intereses, y que tu trabajo como ciudadano es navegar esos intereses, no ignorarlos."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Cómo Funcionan los Algoritmos: La Máquina de Polarización',
      description: 'Entender cómo los algoritmos de redes sociales amplifican la desinformación.',
      content: `
        <h2>Tu Feed No Es la Realidad</h2>
        <p>Cada vez que abrís Instagram, Twitter/X, TikTok o Facebook, un <strong>algoritmo</strong> decide qué ves y qué no ves. Ese algoritmo no tiene como objetivo informarte: tiene como objetivo <strong>mantenerte mirando la pantalla el mayor tiempo posible</strong>. Y descubrió que la mejor manera de lograrlo es indignarte.</p>
        <h3>Cómo Funciona el Algoritmo</h3>
        <ol>
          <li><strong>Registro de comportamiento:</strong> Cada like, cada segundo que parás en una publicación, cada comentario, cada share es registrado.</li>
          <li><strong>Modelo predictivo:</strong> El algoritmo construye un modelo de qué te hace reaccionar. No de qué te interesa: de qué te hace <em>reaccionar</em>.</li>
          <li><strong>Selección de contenido:</strong> Te muestra más de lo que te hace reaccionar. Si la indignación te hace comentar, verás más contenido indignante.</li>
          <li><strong>Burbuja:</strong> Progresivamente ves más contenido que confirma tu perspectiva y menos que la desafía. Tu feed se convierte en un espejo.</li>
        </ol>
        <h3>El Efecto en la Política Argentina</h3>
        <ul>
          <li><strong>Amplificación de extremos:</strong> Las posiciones moderadas no generan engagement. Los extremos sí. El algoritmo favorece a los que gritan más fuerte.</li>
          <li><strong>Micro-targeting político:</strong> Los partidos pueden mostrar mensajes diferentes a diferentes audiencias. A los jubilados les prometen una cosa; a los jóvenes otra. Nadie ve el panorama completo.</li>
          <li><strong>Viralización de la mentira:</strong> Las noticias falsas se comparten 6 veces más rápido que las verdaderas (estudio MIT). Porque generan emociones más intensas.</li>
          <li><strong>Tribalización:</strong> Cada grupo vive en su propia realidad informativa. No comparten hechos ni fuentes con el "otro bando".</li>
        </ul>
        <h3>Cómo Hackear Tu Propio Algoritmo</h3>
        <ol>
          <li>Seguí deliberadamente cuentas que piensen diferente a vos.</li>
          <li>No reacciones en caliente. El algoritmo premia la reacción instantánea.</li>
          <li>Usá RSS o newsletters en vez de feeds algorítmicos cuando sea posible.</li>
          <li>Activá el "modo cronológico" donde esté disponible.</li>
          <li>Instalá extensiones que muestren el tiempo que pasás en cada red.</li>
        </ol>
        <blockquote>"El algoritmo no es tu amigo. Es un sistema diseñado para venderte publicidad que usa tu atención como moneda. Entender eso es el primer paso para dejar de ser producto y empezar a ser ciudadano digital."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Anatomía de la Desinformación: Fake News, Propaganda y Astroturfing',
      description: 'Diferenciar tipos de desinformación y entender cómo se fabrican.',
      content: `
        <h2>No Todas las Mentiras Son Iguales</h2>
        <p>La "desinformación" es un término paraguas que cubre fenómenos muy diferentes. Para defenderte, necesitás distinguir <strong>qué tipo de engaño</strong> estás enfrentando.</p>
        <h3>Los Tipos de Desinformación</h3>
        <ul>
          <li><strong>Misinformación:</strong> Información falsa compartida sin intención de engañar. Tu tía que reenvía un audio de WhatsApp creyendo que es verdad. Es la más común y la más difícil de combatir porque viene de gente que confiás.</li>
          <li><strong>Desinformación:</strong> Información falsa creada deliberadamente para engañar. Granjas de contenido que fabrican noticias falsas para generar clicks (y dinero publicitario) o para manipular opinión.</li>
          <li><strong>Propaganda:</strong> Información sesgada diseñada para promover una agenda. No siempre es falsa: puede ser verdadera pero presentada de manera manipuladora (contexto omitido, datos cherry-picked, framing emocional).</li>
          <li><strong>Astroturfing:</strong> Crear la ilusión de movimiento espontáneo que en realidad es fabricado. Ejércitos de cuentas falsas que simulan "indignación popular" o "apoyo masivo". En Argentina, todos los partidos lo hacen.</li>
          <li><strong>Deepfakes:</strong> Contenido audiovisual manipulado con IA. Videos de políticos diciendo cosas que nunca dijeron. Todavía incipiente en Argentina pero creciendo rápidamente.</li>
        </ul>
        <h3>Cómo Se Fabrican</h3>
        <p>Una operación de desinformación típica:</p>
        <ol>
          <li><strong>Se crea un contenido falso o distorsionado.</strong> Puede ser un artículo en un sitio "noticioso" trucho, un video editado, una captura de pantalla fabricada.</li>
          <li><strong>Se amplifica con cuentas coordinadas.</strong> Decenas de cuentas falsas comparten el contenido simultáneamente para que el algoritmo lo detecte como "trending".</li>
          <li><strong>Un influencer o medio lo levanta.</strong> Al ver que "es tendencia", alguien con audiencia real lo comparte.</li>
          <li><strong>La audiencia real lo multiplica.</strong> La gente común lo comparte sin verificar, especialmente si confirma sus creencias previas.</li>
          <li><strong>Se convierte en "verdad" por repetición.</strong> Después de ser compartido miles de veces, muchos lo dan por cierto.</li>
        </ol>
        <h3>Red Flags de Desinformación</h3>
        <ul>
          <li>Genera una emoción intensa (indignación, miedo, rabia) antes de darte datos.</li>
          <li>No cita fuentes específicas o cita fuentes que no podés verificar.</li>
          <li>Usa lenguaje absolutista: "todos", "siempre", "nunca", "destruye".</li>
          <li>Te presiona a compartir rápido: "compartí antes de que lo censuren".</li>
          <li>Viene de una fuente que no conocés o de un sitio que imita a uno conocido.</li>
        </ul>
        <blockquote>"En la era de la información, la desinformación es una industria. No es un error: es un negocio y una herramienta de poder. Aprender a reconocerla es tan importante como aprender a leer."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Sesgos Cognitivos: Tu Cerebro Contra la Verdad',
      description: 'Los atajos mentales que te hacen vulnerable a la desinformación.',
      content: `
        <h2>Tu Peor Enemigo No Es el Troll: Es Tu Propio Cerebro</h2>
        <p>Los sesgos cognitivos son <strong>atajos mentales</strong> que nuestro cerebro usa para procesar información rápidamente. En la mayoría de las situaciones son útiles. Pero en el ecosistema mediático actual, son <strong>vulnerabilidades</strong> que la desinformación explota.</p>
        <h3>Los Sesgos Que Más Te Afectan</h3>
        <ul>
          <li><strong>Sesgo de confirmación:</strong> Tendés a creer información que confirma lo que ya pensás y a descartar la que lo contradice. Si creés que el gobierno es corrupto, cualquier noticia de corrupción te parece obvia y cualquier defensa te parece mentira.</li>
          <li><strong>Efecto de anclaje:</strong> La primera información que recibís sobre un tema "ancla" tu percepción. Si la primera versión de una noticia es falsa, corregirla después es muy difícil porque ya formaste una opinión.</li>
          <li><strong>Sesgo de disponibilidad:</strong> Creés que lo que más ves es lo más frecuente. Si los medios cubren violencia todo el día, pensás que la violencia es mayor de lo que realmente es.</li>
          <li><strong>Efecto manada:</strong> Si mucha gente cree algo, tendés a creerlo también. Las redes sociales amplifican este efecto porque ves a cientos de personas compartiendo la misma opinión.</li>
          <li><strong>Sesgo de autoridad:</strong> Tendés a creer a figuras de autoridad sin verificar. "Lo dijo un doctor/periodista/profesor" se convierte en prueba suficiente.</li>
          <li><strong>Efecto Dunning-Kruger:</strong> Cuanto menos sabés de un tema, más seguro estás de tu opinión. Los expertos reales expresan dudas; los opinólogos expresan certezas.</li>
        </ul>
        <h3>Cómo la Desinformación Explota Tus Sesgos</h3>
        <p>La desinformación no necesita convencerte de algo nuevo. Solo necesita <strong>activar tus sesgos</strong>:</p>
        <ol>
          <li>Apunta a tus creencias existentes (sesgo de confirmación).</li>
          <li>Te da la "primicia" para que ancles en su versión.</li>
          <li>Te muestra que "todos" piensan así (efecto manada).</li>
          <li>Cita a una "autoridad" (sesgo de autoridad).</li>
          <li>Te hace sentir experto (Dunning-Kruger).</li>
        </ol>
        <h3>Defensas Anti-Sesgo</h3>
        <ul>
          <li><strong>Buscá activamente la contra-evidencia:</strong> Antes de compartir algo, buscá si hay fuentes que digan lo contrario.</li>
          <li><strong>Preguntate: "¿Creo esto porque es verdad o porque quiero que sea verdad?"</strong></li>
          <li><strong>Desconfiá de la certeza absoluta:</strong> La realidad es compleja. Si algo parece simple y definitivo, probablemente está simplificado.</li>
          <li><strong>Esperá antes de reaccionar:</strong> El sesgo se activa en los primeros segundos. Dale tiempo a tu cerebro racional.</li>
        </ul>
        <blockquote>"No sos vulnerable a la desinformación porque seas tonto. Sos vulnerable porque sos humano. Conocer tus sesgos no los elimina, pero te da una chance de neutralizarlos."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Fact-Checking: Herramientas para Verificar Información',
      description: 'Técnicas y herramientas prácticas para verificar noticias y contenido.',
      content: `
        <h2>El Kit del Verificador Ciudadano</h2>
        <p>No necesitás ser periodista para verificar información. Con herramientas simples y un método básico, podés chequear la mayoría del contenido que te llega. El método se llama <strong>SIFT</strong> (por sus siglas en inglés).</p>
        <h3>El Método SIFT</h3>
        <ol>
          <li><strong>S — Stop (Pará):</strong> Antes de compartir o reaccionar, pará. No hagas nada por 30 segundos.</li>
          <li><strong>I — Investigate the source (Investigá la fuente):</strong> ¿Quién publicó esto? ¿Es un medio reconocido? ¿Es una cuenta real o falsa?</li>
          <li><strong>F — Find better coverage (Buscá mejor cobertura):</strong> Buscá el mismo tema en otros medios. ¿Dicen lo mismo? ¿Lo cubre algún medio serio?</li>
          <li><strong>T — Trace claims (Rastreá las afirmaciones):</strong> ¿De dónde sale el dato original? ¿Hay un estudio, un documento, una declaración verificable?</li>
        </ol>
        <h3>Herramientas Gratuitas</h3>
        <ul>
          <li><strong>Chequeado.com:</strong> El principal medio de fact-checking de Argentina. Verifica declaraciones de políticos, noticias virales y datos públicos.</li>
          <li><strong>Google Reverse Image Search:</strong> Subí una imagen y Google te dice dónde apareció antes. Perfecto para detectar fotos viejas usadas como si fueran nuevas.</li>
          <li><strong>TinEye:</strong> Similar a Google pero especializado en búsqueda inversa de imágenes.</li>
          <li><strong>Wayback Machine (archive.org):</strong> Permite ver versiones anteriores de sitios web. Útil si alguien borró una nota o cambió un artículo.</li>
          <li><strong>InVID/WeVerify:</strong> Plugin de navegador para verificar videos. Detecta manipulaciones y te da el contexto original.</li>
          <li><strong>CrowdTangle/Social Searcher:</strong> Para rastrear cómo se difundió un contenido en redes sociales.</li>
        </ul>
        <h3>Casos Prácticos Argentinos</h3>
        <p>Ejemplos reales de desinformación verificada en Argentina:</p>
        <ul>
          <li>Cadenas de WhatsApp sobre cambios legales que no existen.</li>
          <li>Fotos de manifestaciones de otro país presentadas como argentinas.</li>
          <li>Estadísticas sacadas de contexto para apoyar una narrativa política.</li>
          <li>Capturas de pantalla de tweets fabricados atribuidos a figuras públicas.</li>
        </ul>
        <h3>La Regla de Oro</h3>
        <blockquote>"Si algo te genera una emoción intensa y tenés ganas de compartirlo inmediatamente, esa es exactamente la señal de que necesitás verificarlo antes. La desinformación apunta al corazón, no al cerebro."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Propaganda Política Argentina: Aprender a Leerla',
      description: 'Reconocer las técnicas de propaganda usadas por todos los sectores políticos.',
      content: `
        <h2>Todos Hacen Propaganda (Incluyendo Tu Lado)</h2>
        <p>La propaganda no es exclusiva de un partido o sector. <strong>Todos los actores políticos argentinos usan técnicas de propaganda.</strong> La diferencia entre un ciudadano manipulado y uno informado es la capacidad de reconocer estas técnicas sin importar quién las use.</p>
        <h3>Técnicas Clásicas de Propaganda</h3>
        <ul>
          <li><strong>Nosotros vs. Ellos:</strong> Dividir el mundo en dos bandos irreconciliables. "O estás con nosotros o estás con la corrupción/la pobreza/el imperio." No deja espacio para matices.</li>
          <li><strong>Apelación al miedo:</strong> "Si ganan ellos, va a pasar X terrible." Funciona porque el cerebro procesa las amenazas antes que las oportunidades.</li>
          <li><strong>Cherry-picking de datos:</strong> Mostrar solo los datos que convienen e ignorar los que no. "La pobreza bajó" (en un mes específico, comparado con el peor mes del gobierno anterior).</li>
          <li><strong>Whataboutism:</strong> Ante una crítica, responder con "¿y lo que hicieron ustedes?" Desvía la conversación sin responder la pregunta original.</li>
          <li><strong>Repetición:</strong> Repetir algo tantas veces que se convierte en "verdad" por familiaridad. Los eslóganes políticos funcionan así.</li>
          <li><strong>Apelación a la emoción:</strong> Historias personales conmovedoras usadas para justificar políticas complejas sin analizar si la política realmente funciona.</li>
          <li><strong>Ataque ad hominem:</strong> En vez de debatir la idea, atacar a la persona. "¿Quién es este para opinar? Si ni siquiera..."</li>
        </ul>
        <h3>Propaganda de Datos</h3>
        <p>La forma más sofisticada de propaganda usa <strong>datos reales de manera engañosa</strong>:</p>
        <ol>
          <li><strong>Período de comparación:</strong> Comparo con el peor momento del otro para parecer mejor, o con el mejor momento propio para demostrar progreso.</li>
          <li><strong>Indicador selectivo:</strong> Uso el indicador que me conviene e ignoro los demás. "Creció el empleo" (pero cayó el salario real).</li>
          <li><strong>Escala del gráfico:</strong> Un mismo dato puede parecer un cambio enorme o insignificante según cómo escales el eje Y del gráfico.</li>
          <li><strong>Correlación vs. causalidad:</strong> "Desde que gobernamos, bajó X." Pero ¿bajó por lo que hicieron o por otras razones?</li>
        </ol>
        <h3>Tu Escudo Anti-Propaganda</h3>
        <p>Cada vez que un político, medio o influencer te presente un argumento, hacete estas preguntas:</p>
        <ol>
          <li>¿Qué emoción quiere generarme? ¿Miedo? ¿Indignación? ¿Esperanza?</li>
          <li>¿Qué datos omite?</li>
          <li>¿Usaría esta misma técnica para defender al "otro lado"?</li>
          <li>¿Hay una versión más matizada de este argumento?</li>
        </ol>
        <blockquote>"El ciudadano que sabe leer propaganda de TODOS los lados es el ciudadano más libre. No porque no tenga opinión, sino porque su opinión está basada en análisis, no en manipulación."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Redes Sociales como Campo de Batalla Informativo',
      description: 'Entender las estrategias de influencia en redes sociales argentinas.',
      content: `
        <h2>La Guerra Invisible en Tu Celular</h2>
        <p>Las redes sociales argentinas son un <strong>campo de batalla informativo</strong> donde operan ejércitos de trolls, granjas de contenido, operadores políticos y ciudadanos genuinos. Distinguir unos de otros es la habilidad más importante del ciudadano digital.</p>
        <h3>Los Actores de la Batalla</h3>
        <ul>
          <li><strong>Trolls pagos:</strong> Cuentas operadas por personas que cobran por generar contenido a favor o en contra de alguien. En Argentina, todos los partidos grandes tienen "call centers" de redes.</li>
          <li><strong>Bots:</strong> Cuentas automatizadas que amplifican contenido, crean tendencias falsas y simulan consenso o rechazo masivo.</li>
          <li><strong>Influencers militantes:</strong> Personas reales con audiencia que operan como "voz del pueblo" pero con conexiones directas con partidos o sectores de poder.</li>
          <li><strong>Operadores mediáticos:</strong> Periodistas o pseudo-periodistas que "bajan línea" disfrazándola de análisis independiente.</li>
          <li><strong>Ciudadanos genuinos:</strong> Vos y yo, que sin querer amplificamos contenido fabricado creyendo que es espontáneo.</li>
        </ul>
        <h3>Cómo Detectar una Operación Coordinada</h3>
        <ol>
          <li><strong>Velocidad sospechosa:</strong> Si un hashtag se vuelve trending en minutos, probablemente es impulsado artificialmente.</li>
          <li><strong>Cuentas nuevas o sin historial:</strong> Cuentas creadas recientemente que solo publican sobre política son sospechosas.</li>
          <li><strong>Contenido idéntico:</strong> Muchas cuentas publicando exactamente el mismo texto o la misma imagen coordinadamente.</li>
          <li><strong>Ratio sospechoso:</strong> Cuentas con miles de tweets pero pocos seguidores, o viceversa.</li>
          <li><strong>Horarios inhumanos:</strong> Cuentas que publican las 24 horas sin pausa probablemente son bots o equipos rotativos.</li>
        </ol>
        <h3>WhatsApp: El Frente Invisible</h3>
        <p>En Argentina, WhatsApp es el principal canal de desinformación. A diferencia de Twitter o Facebook, los mensajes de WhatsApp son <strong>privados y encriptados</strong>: nadie puede rastrear qué se comparte ni quién lo originó. Es el canal perfecto para operaciones de desinformación.</p>
        <ul>
          <li>Los audios falsos atribuidos a "alguien del gobierno" o "un médico amigo".</li>
          <li>Las cadenas que te piden reenviar "antes de que lo borren".</li>
          <li>Las capturas de pantalla (fácilmente fabricables) de supuestas conversaciones o noticias.</li>
        </ul>
        <blockquote>"En redes sociales, la pregunta no es '¿esto es verdad?' sino '¿quién quiere que yo crea esto y por qué?' Esa pregunta te protege más que cualquier fact-checker."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Medios Comunitarios y Periodismo Independiente',
      description: 'Alternativas al ecosistema mediático corporativo y político.',
      content: `
        <h2>Más Allá del Mainstream</h2>
        <p>Si los grandes medios tienen intereses corporativos y los medios públicos cambian con cada gobierno, ¿dónde encontrar información confiable? En la <strong>diversidad de fuentes</strong>, especialmente en medios comunitarios e independientes que operan con lógicas diferentes.</p>
        <h3>Medios Comunitarios</h3>
        <p>Argentina tiene más de 1.500 medios comunitarios: radios barriales, canales comunitarios de TV, portales digitales locales. Nacieron de la Ley de Servicios de Comunicación Audiovisual (2009) que reservó un tercio del espectro para medios sin fines de lucro.</p>
        <ul>
          <li><strong>Fortaleza:</strong> Cubren temas que los grandes medios ignoran: realidad barrial, problemas locales, voces marginadas.</li>
          <li><strong>Debilidad:</strong> Recursos limitados, calidad técnica desigual, a veces sesgo ideológico propio.</li>
          <li><strong>Valor:</strong> Son la única fuente de información sobre lo que pasa en miles de barrios que para los grandes medios no existen.</li>
        </ul>
        <h3>Periodismo de Investigación Independiente</h3>
        <ul>
          <li><strong>Chequeado:</strong> Fact-checking riguroso, financiado por fundaciones y lectores.</li>
          <li><strong>CIPER (Chile) como modelo:</strong> Centro de investigación periodística financiado independientemente que ha destapado escándalos de corrupción.</li>
          <li><strong>Datos Concepción, Aperturas, y otros:</strong> Medios especializados en periodismo de datos que cruzan bases de datos públicas para encontrar historias.</li>
        </ul>
        <h3>Tu Dieta Informativa Ideal</h3>
        <p>Armá una <strong>dieta informativa diversa</strong>:</p>
        <ol>
          <li><strong>2-3 medios nacionales</strong> de diferentes orientaciones (no para "equilibrar" sino para ver cómo diferentes intereses leen la misma realidad).</li>
          <li><strong>1 medio de fact-checking</strong> (Chequeado, AFP Factual).</li>
          <li><strong>1 medio internacional</strong> que cubra Argentina (BBC Mundo, DW, France24). La mirada externa tiene menos compromisos locales.</li>
          <li><strong>1-2 medios locales/comunitarios</strong> de tu zona.</li>
          <li><strong>Fuentes primarias:</strong> Boletín Oficial, datos.gob.ar, informes del INDEC. Aprendé a leer la fuente directa.</li>
        </ol>
        <blockquote>"No existe el medio perfecto. Existe la ciudadanía que diversifica sus fuentes, cruza información y forma su opinión con evidencia, no con lo que le sirve un solo algoritmo."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Inteligencia Artificial y el Futuro de la Desinformación',
      description: 'Cómo la IA está transformando la creación y detección de contenido falso.',
      content: `
        <h2>La Próxima Ola Ya Está Aquí</h2>
        <p>Todo lo que aprendiste hasta ahora está a punto de complicarse exponencialmente. La inteligencia artificial generativa permite crear <strong>texto, imagen, audio y video falsos que son virtualmente indistinguibles de los reales</strong>. Esto cambia las reglas del juego de la desinformación.</p>
        <h3>Lo Que la IA Ya Puede Hacer</h3>
        <ul>
          <li><strong>Texto:</strong> Generar artículos de noticias completos, comentarios en redes y mensajes de WhatsApp que parecen escritos por humanos. A un costo casi nulo y a escala masiva.</li>
          <li><strong>Imagen:</strong> Crear fotos hiperrealistas de eventos que nunca ocurrieron. Un presidente firmando un documento, una protesta que no existió, un desastre natural inventado.</li>
          <li><strong>Audio:</strong> Clonar la voz de cualquier persona con apenas minutos de audio de referencia. Imaginate recibir un audio de WhatsApp con la voz de un político diciendo algo que nunca dijo.</li>
          <li><strong>Video:</strong> Los deepfakes de video aún no son perfectos, pero mejoran cada mes. Pronto será imposible distinguir un video real de uno fabricado a simple vista.</li>
        </ul>
        <h3>Escenarios de Riesgo para Argentina</h3>
        <ol>
          <li><strong>Elecciones:</strong> Deepfakes de candidatos distribuidos masivamente 48 horas antes de una elección, sin tiempo para verificar.</li>
          <li><strong>Crisis financiera:</strong> Audios falsos de funcionarios del Banco Central provocando corridas bancarias.</li>
          <li><strong>Conflicto social:</strong> Videos fabricados de violencia policial o saqueos que inflamen tensiones reales.</li>
          <li><strong>Operaciones de influencia extranjera:</strong> Países con capacidad tecnológica interviniendo en la política argentina a través de contenido generado por IA.</li>
        </ol>
        <h3>Cómo Defenderte</h3>
        <ul>
          <li><strong>Verificá la fuente antes que el contenido:</strong> ¿Quién publicó esto originalmente? ¿Es una fuente confiable?</li>
          <li><strong>Buscá el mismo evento en múltiples fuentes:</strong> Si solo existe en una fuente o en redes, sospechá.</li>
          <li><strong>Usá herramientas de detección:</strong> Hive Moderation, AI or Not, y otras herramientas gratuitas detectan contenido generado por IA.</li>
          <li><strong>Contexto sobre contenido:</strong> Un video puede ser real pero sacado de contexto (otra fecha, otro país). Verificá el contexto, no solo el contenido.</li>
        </ul>
        <blockquote>"En un mundo donde ver ya no es creer, la verificación no es paranoia: es higiene mental. El Hombre Gris del siglo XXI necesita alfabetismo digital tanto como necesitó alfabetismo textual en el siglo XX."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Kit de Supervivencia Mediática',
      description: 'Protocolo personal para navegar el ecosistema informativo con inteligencia.',
      content: `
        <h2>Tu Protocolo de Ciudadano Mediático</h2>
        <p>A lo largo de este curso desarrollaste herramientas para entender el ecosistema mediático, detectar desinformación, reconocer tus propios sesgos y verificar información. Ahora es momento de convertir todo eso en un <strong>protocolo personal</strong> que puedas usar cada día.</p>
        <h3>El Protocolo GRIS de Consumo Informativo</h3>
        <ol>
          <li><strong>G — Guardá distancia emocional.</strong> Antes de reaccionar a cualquier contenido, respirá. Si te genera indignación intensa, es exactamente cuando más necesitás pausar.</li>
          <li><strong>R — Rastreá la fuente.</strong> ¿Quién dice esto? ¿Es un medio reconocido? ¿Una cuenta verificable? ¿Un forward sin origen?</li>
          <li><strong>I — Investigá otras versiones.</strong> Buscá el mismo tema en al menos 2 fuentes más. ¿Coinciden? ¿Difieren? ¿Lo cubre algún medio de fact-checking?</li>
          <li><strong>S — Separá hechos de opiniones.</strong> ¿Es un dato verificable o es una interpretación? ¿Puedo encontrar la fuente primaria del dato?</li>
        </ol>
        <h3>Tu Rutina Informativa Saludable</h3>
        <ul>
          <li><strong>Mañana:</strong> Leé un resumen de noticias de una fuente confiable. No te informes por redes sociales.</li>
          <li><strong>Día:</strong> Si ves algo impactante en redes, aplicá el protocolo GRIS antes de compartir.</li>
          <li><strong>Noche:</strong> Desconectá. La ansiedad informativa es real y afecta tu salud mental.</li>
          <li><strong>Semana:</strong> Leé al menos un artículo de un medio con perspectiva opuesta a la tuya.</li>
          <li><strong>Mes:</strong> Revisá tu "dieta informativa". ¿Estás en burbuja? ¿Necesitás diversificar?</li>
        </ul>
        <h3>Tu Compromiso</h3>
        <p>A partir de hoy:</p>
        <ol>
          <li>No comparto nada que no haya verificado mínimamente.</li>
          <li>No reacciono en caliente a contenido diseñado para indignarme.</li>
          <li>Diversifico mis fuentes de información conscientemente.</li>
          <li>Cuando detecto desinformación, la señalo con respeto y con evidencia.</li>
          <li>Entiendo que mis sesgos me hacen vulnerable y actúo en consecuencia.</li>
        </ol>
        <blockquote>"El ciudadano mediáticamente alfabetizado no es el que sabe todo. Es el que sabe lo que no sabe, verifica antes de opinar, y entiende que en la guerra de la información, la humildad epistémica es el mejor escudo."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 27');

  const existingQuiz27 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz27.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz27[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }

  const [quiz27] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Alfabetismo Mediático', description: 'Evaluá tu capacidad para navegar la desinformación.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();

  const questions27 = [
    { quizId: quiz27.id, question: '¿Cuál es la diferencia entre misinformación y desinformación?', type: 'multiple_choice' as const, options: JSON.stringify(['Son lo mismo', 'La misinformación es sin intención de engañar; la desinformación es deliberada', 'La desinformación es más grave', 'Una es digital y otra impresa']), correctAnswer: JSON.stringify(1), explanation: 'La misinformación se comparte creyendo que es verdad; la desinformación se crea deliberadamente para engañar.', points: 2, orderIndex: 1 },
    { quizId: quiz27.id, question: 'Los algoritmos de redes sociales priorizan contenido informativo por sobre contenido emocional.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Los algoritmos priorizan engagement (reacciones), que suele ser generado por contenido emocional e indignante.', points: 1, orderIndex: 2 },
    { quizId: quiz27.id, question: '¿Qué es el sesgo de confirmación?', type: 'multiple_choice' as const, options: JSON.stringify(['Creer solo en medios oficiales', 'Tender a creer información que confirma lo que ya pensás', 'Confirmar noticias antes de compartirlas', 'Seguir solo a personas que conocés']), correctAnswer: JSON.stringify(1), explanation: 'El sesgo de confirmación nos hace buscar y creer información que refuerza nuestras creencias previas.', points: 2, orderIndex: 3 },
    { quizId: quiz27.id, question: '¿Cuál es el primer paso del método SIFT para verificar información?', type: 'multiple_choice' as const, options: JSON.stringify(['Investigar la fuente', 'Buscar mejor cobertura', 'Parar y no reaccionar inmediatamente', 'Rastrear las afirmaciones']), correctAnswer: JSON.stringify(2), explanation: 'El primer paso es STOP: parar y no reaccionar inmediatamente antes de investigar.', points: 2, orderIndex: 4 },
    { quizId: quiz27.id, question: 'Las noticias falsas se comparten más lento que las verdaderas en redes sociales.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Estudios del MIT muestran que las noticias falsas se comparten 6 veces más rápido que las verdaderas.', points: 1, orderIndex: 5 },
    { quizId: quiz27.id, question: '¿Qué es el astroturfing?', type: 'multiple_choice' as const, options: JSON.stringify(['Un tipo de periodismo', 'Crear la ilusión de movimiento espontáneo con cuentas falsas coordinadas', 'Una técnica de fact-checking', 'Publicidad encubierta en medios']), correctAnswer: JSON.stringify(1), explanation: 'El astroturfing simula apoyo o rechazo popular usando cuentas falsas coordinadas para crear tendencias artificiales.', points: 2, orderIndex: 6 },
    { quizId: quiz27.id, question: 'Una dieta informativa saludable incluye medios con perspectivas opuestas a la propia.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Diversificar fuentes, incluyendo perspectivas diferentes, es esencial para salir de la burbuja y entender la realidad completa.', points: 1, orderIndex: 7 },
    { quizId: quiz27.id, question: '¿Qué significa la "G" en el protocolo GRIS de consumo informativo?', type: 'multiple_choice' as const, options: JSON.stringify(['Googlear la noticia', 'Guardar distancia emocional', 'Gritar tu opinión', 'Generar contenido propio']), correctAnswer: JSON.stringify(1), explanation: 'Guardar distancia emocional es el primer paso: si algo te indigna intensamente, es cuando más necesitás pausar.', points: 2, orderIndex: 8 },
  ];

  for (const q of questions27) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz with', questions27.length, 'questions for course 27');
}

async function seedCourse28(authorId: number) {
  console.log('--- Course 28: Narrativas que Transforman ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'narrativas-que-transforman-historias')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({ title: 'Narrativas que Transforman: Contar Historias que Mueven', slug: 'narrativas-que-transforman-historias', description: 'Aprende a contar historias que inspiren acción. Storytelling para el cambio social, escritura de impacto y creación de contenido audiovisual.', excerpt: 'Cuenta historias que muevan a la acción y transformen realidades.', category: 'comunicacion', level: 'advanced', duration: 180, thumbnailUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800', orderIndex: 28, isPublished: true, isFeatured: false, requiresAuth: false, authorId }).returning();
    course = [newCourse];
    console.log('Created course 28:', course[0].title);
  } else {
    console.log('Found existing course 28:', course[0].title);
  }

  const courseId = course[0].id;
  await resetCourseContentState(courseId);

  const lessons = [
    {
      courseId,
      title: 'El Poder de las Historias: Por Qué los Datos No Alcanzan',
      description: 'Por qué las historias transforman más que los argumentos racionales.',
      content: `
        <h2>Tu Cerebro Está Diseñado para Historias</h2>
        <p>Podés presentar 100 estadísticas sobre la pobreza infantil y la gente va a decir "qué terrible" y seguir scrolleando. Pero contá la historia de <strong>una nena de 8 años que camina 5 km para llegar a una escuela sin calefacción</strong> y la gente va a sentir algo en el pecho que no puede ignorar.</p>
        <p>Esto no es debilidad humana: es <strong>neurociencia</strong>. Cuando escuchamos datos, se activan las áreas de procesamiento del lenguaje del cerebro. Cuando escuchamos una historia, se activan las áreas sensoriales, emocionales y motoras. Literalmente <em>vivimos</em> la historia en nuestro cerebro.</p>
        <h3>Por Qué las Historias Funcionan</h3>
        <ul>
          <li><strong>Empatía:</strong> Las historias activan las neuronas espejo. Sentimos lo que siente el protagonista.</li>
          <li><strong>Memoria:</strong> Recordamos historias 22 veces mejor que datos aislados (estudio Stanford).</li>
          <li><strong>Acción:</strong> Las historias generan oxitocina, la hormona de la empatía y la cooperación. Los datos generan cortisol (estrés) que paraliza.</li>
          <li><strong>Identidad:</strong> Las historias nos ayudan a imaginarnos en un rol diferente. "Si ella pudo, yo puedo."</li>
        </ul>
        <h3>Historias que Cambiaron Argentina</h3>
        <ul>
          <li><strong>Las Madres de Plaza de Mayo:</strong> No fue un informe sobre desaparecidos lo que conmovió al mundo. Fueron las madres con pañuelos blancos caminando en círculos. Una imagen. Una historia.</li>
          <li><strong>"Nunca Más":</strong> El informe de la CONADEP funciona porque está lleno de testimonios individuales, de nombres, de historias personales. No es un documento estadístico: es una colección de historias que no te dejan indiferente.</li>
          <li><strong>Las fábricas recuperadas:</strong> Lo que transformó la percepción no fue un paper académico, sino el documental "The Take" mostrando a trabajadores concretos recuperando su dignidad.</li>
        </ul>
        <h3>Datos + Historia = Poder</h3>
        <p>No se trata de elegir entre datos e historias. Se trata de <strong>combinarlos</strong>: la historia conecta emocionalmente, los datos dan credibilidad. "María camina 5 km cada día para ir a la escuela. Como ella, 300.000 niños en Argentina no tienen transporte escolar."</p>
        <blockquote>"Los datos te dicen que hay un problema. Las historias te hacen sentir que es TU problema. Y cuando algo es tu problema, actuás."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Storytelling para el Cambio Social: Los Principios',
      description: 'Los fundamentos del storytelling aplicado a causas sociales y cívicas.',
      content: `
        <h2>Contar Historias Con Propósito</h2>
        <p>El storytelling para el cambio social no es manipulación emocional. Es el arte de usar <strong>historias verdaderas</strong> para hacer visible lo invisible, dar voz a quien no la tiene, y mover a la acción a quienes pueden cambiar las cosas.</p>
        <h3>Los 5 Principios del Storytelling Transformador</h3>
        <ol>
          <li><strong>Verdad radical:</strong> Tu historia debe ser verdadera. No embellecida, no exagerada, no manipulada. La verdad es tu activo más valioso. Si te descubren mintiendo, perdés toda credibilidad.</li>
          <li><strong>Dignidad del protagonista:</strong> Las personas de tu historia no son "pobrecitos". Son seres humanos con agencia, inteligencia y dignidad. La lástima paraliza; la admiración inspira.</li>
          <li><strong>Especificidad:</strong> Lo universal está en lo específico. No cuentes "la pobreza"; contá a Juan, que tiene 45 años, vive en Florencio Varela y se levanta a las 4 de la mañana para llegar al trabajo.</li>
          <li><strong>Tensión y resolución:</strong> Toda buena historia tiene un conflicto. ¿Qué obstáculo enfrenta el protagonista? ¿Cómo lo supera (o no)? Sin tensión no hay historia, hay descripción.</li>
          <li><strong>Llamado a la acción:</strong> Una buena historia para el cambio social no termina en "qué triste". Termina en "¿y vos qué vas a hacer?" Debe haber un camino claro de la emoción a la acción.</li>
        </ol>
        <h3>La Diferencia entre Propaganda y Storytelling</h3>
        <ul>
          <li><strong>Propaganda:</strong> Simplifica, manipula, oculta. Divide en buenos y malos. Te dice qué pensar.</li>
          <li><strong>Storytelling transformador:</strong> Complejiza, revela, incluye. Muestra humanidad en todos los personajes. Te invita a sentir y decidir.</li>
        </ul>
        <h3>Estructuras Narrativas Clásicas</h3>
        <ul>
          <li><strong>El viaje del héroe:</strong> Persona común → desafío → transformación → regreso con conocimiento. Funciona para historias de superación.</li>
          <li><strong>Antes/Después:</strong> Cómo era la vida antes de la intervención y cómo es ahora. Simple y poderoso para mostrar impacto.</li>
          <li><strong>El testigo:</strong> Alguien cuenta lo que vio. Funciona para denuncias y visibilización.</li>
          <li><strong>La pregunta:</strong> Planteás un misterio o problema y vas desentrañándolo con el lector/espectador.</li>
        </ul>
        <blockquote>"La diferencia entre una historia que conmueve y una que transforma es la misma diferencia entre quejarse y proponer: la primera te deja donde estabas, la segunda te mueve a un lugar nuevo."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Historia Personal como Herramienta de Cambio',
      description: 'Descubrir y contar tu propia historia para conectar e inspirar.',
      content: `
        <h2>La Historia Más Poderosa Es la Tuya</h2>
        <p>No necesitás ir a buscar historias lejos. La historia más <strong>auténtica, creíble y poderosa</strong> que podés contar es la tuya propia. Tu experiencia de vida, los momentos que te marcaron, los obstáculos que enfrentaste, las cosas que aprendiste.</p>
        <h3>La "Story of Self" (Historia de Uno Mismo)</h3>
        <p>Marshall Ganz, profesor de Harvard y organizador social, desarrolló un framework de tres historias para la acción colectiva:</p>
        <ol>
          <li><strong>Story of Self:</strong> ¿Qué experiencias de tu vida te llevaron a involucrarte en esta causa? ¿Qué momento fue el punto de inflexión?</li>
          <li><strong>Story of Us:</strong> ¿Qué valores compartimos como comunidad? ¿Qué experiencias colectivas nos definen?</li>
          <li><strong>Story of Now:</strong> ¿Por qué es urgente actuar ahora? ¿Qué está en juego si no actuamos?</li>
        </ol>
        <h3>Ejercicio: Encontrar Tu Historia</h3>
        <p>Respondé estas preguntas por escrito (sin filtro, sin editar, solo escribí):</p>
        <ul>
          <li>¿Cuándo fue la primera vez que sentiste que algo era profundamente injusto?</li>
          <li>¿Hubo un momento en que alguien cambió tu vida con una acción simple?</li>
          <li>¿Qué te hizo enojar tanto que decidiste hacer algo?</li>
          <li>¿Quién es la persona que más admirás y por qué?</li>
          <li>¿Cuál fue el momento más difícil de tu vida y qué aprendiste?</li>
        </ul>
        <p>En esas respuestas hay material para una historia poderosa. No necesitás haber vivido algo extraordinario. Las historias más transformadoras son las más <strong>humanas y universales</strong>.</p>
        <h3>Cómo Contar Tu Historia</h3>
        <ol>
          <li><strong>Empezá por un momento concreto:</strong> No "siempre me importó la justicia social". Sí: "Tenía 12 años y vi cómo desalojaban a la familia de mi compañero de escuela."</li>
          <li><strong>Mostrá vulnerabilidad:</strong> No sos un superhéroe. Mostrá tus dudas, tus miedos, tus errores. La vulnerabilidad genera conexión.</li>
          <li><strong>Conectá con lo universal:</strong> Tu historia personal es la puerta de entrada a un tema que afecta a muchos.</li>
        </ol>
        <blockquote>"Tu historia no necesita ser espectacular. Necesita ser verdadera. La autenticidad se siente, y en un mundo de marketing y propaganda, la verdad es revolucionaria."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Historias de Comunidad: Narrar lo Colectivo',
      description: 'Contar historias que reflejen la fuerza de lo comunitario.',
      content: `
        <h2>Del "Yo" al "Nosotros"</h2>
        <p>Las historias individuales conectan. Las historias comunitarias <strong>movilizan</strong>. Cuando una comunidad tiene una narrativa compartida —un relato de quiénes somos, de dónde venimos y hacia dónde vamos— tiene poder colectivo.</p>
        <h3>¿Qué Es una Narrativa Comunitaria?</h3>
        <p>No es un eslogan. Es la <strong>historia viva</strong> de una comunidad: cómo se formó, qué desafíos enfrentó, qué logró, qué valores la definen. Es lo que responde a la pregunta "¿por qué nos importa esto?"</p>
        <h3>Ejemplos Argentinos</h3>
        <ul>
          <li><strong>Las Madres de Plaza de Mayo:</strong> Su narrativa —madres que no se rinden— es una de las más poderosas del siglo XX. No cuentan números de desaparecidos: cuentan la historia de buscar a sus hijos.</li>
          <li><strong>Cooperativas de fábricas recuperadas:</strong> "Los patrones se fueron y nosotros la pusimos a andar." Una narrativa de dignidad y capacidad obrera que desafía la victimización.</li>
          <li><strong>Movimientos barriales:</strong> En cada barrio hay historias de vecinos que se organizaron para resolver algo que el Estado no podía: una plaza, una ambulancia, un comedor.</li>
        </ul>
        <h3>Cómo Construir una Narrativa Comunitaria</h3>
        <ol>
          <li><strong>Recopilar historias:</strong> Entrevistar a miembros de la comunidad. ¿Cuándo llegaron? ¿Qué los trajo? ¿Qué momentos recuerdan?</li>
          <li><strong>Encontrar los hilos comunes:</strong> ¿Qué valores aparecen una y otra vez? ¿Qué experiencias comparten?</li>
          <li><strong>Construir el arco narrativo:</strong> ¿De dónde venimos? ¿Qué enfrentamos? ¿Qué logramos? ¿Hacia dónde vamos?</li>
          <li><strong>Hacer que todos se vean:</strong> La narrativa comunitaria debe incluir voces diversas, no solo las de los líderes.</li>
        </ol>
        <h3>Ejercicio: Tu Comunidad en 3 Historias</h3>
        <p>Elegí una comunidad a la que pertenecés (barrio, club, organización, grupo de amigos) y contá:</p>
        <ul>
          <li>La historia de origen: ¿cómo empezó?</li>
          <li>La historia de crisis: ¿cuál fue el momento más difícil y cómo se superó?</li>
          <li>La historia de esperanza: ¿cuál es la mejor versión de esta comunidad y cómo llegar?</li>
        </ul>
        <blockquote>"Las comunidades que tienen una historia compartida tienen identidad. Las que tienen identidad tienen fuerza. Las que tienen fuerza pueden cambiar las cosas."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Escritura de Impacto: Del Texto al Corazón',
      description: 'Técnicas de escritura para comunicar con claridad, emoción y poder.',
      content: `
        <h2>Escribir Para Que Pase Algo</h2>
        <p>La escritura de impacto no es literatura (aunque puede serlo) ni periodismo (aunque toma elementos). Es escribir con un <strong>objetivo transformador</strong>: que quien lee sienta algo y haga algo. Ya sea una publicación en redes, un mail a un funcionario, una carta abierta o un artículo.</p>
        <h3>Los Principios de la Escritura de Impacto</h3>
        <ol>
          <li><strong>Claridad ante todo:</strong> Si no se entiende, no importa cuán bello sea. Escribí para que te entienda tu abuela y tu primo de 15.</li>
          <li><strong>Un punto, un texto:</strong> Cada texto debe tener UNA idea central. Si tenés tres ideas, escribí tres textos.</li>
          <li><strong>Empezá por lo que importa:</strong> Las primeras dos líneas deciden si alguien sigue leyendo. No empecés con contexto: empezá con lo que golpea.</li>
          <li><strong>Mostrá, no cuentes:</strong> No digas "la situación es triste". Mostrá la situación y dejá que el lector sienta la tristeza.</li>
          <li><strong>Verbos, no adjetivos:</strong> Los verbos mueven. Los adjetivos decoran. "Corrió descalza bajo la lluvia" es más poderoso que "la pobre niña indefensa".</li>
        </ol>
        <h3>Técnicas Específicas</h3>
        <ul>
          <li><strong>El gancho:</strong> "Tienen 8 años y ya saben lo que es tener hambre." Primera línea que obliga a seguir leyendo.</li>
          <li><strong>El detalle revelador:</strong> Un solo detalle específico cuenta más que una descripción general. "La maestra guarda en su bolso galletitas para los chicos que llegan sin desayunar."</li>
          <li><strong>El contraste:</strong> Poner lado a lado dos realidades: "A 10 cuadras del country más caro del país, hay familias sin agua potable."</li>
          <li><strong>La pregunta retórica:</strong> "¿Vos sabías que tu municipio gastó $500 millones en publicidad oficial el año pasado?"</li>
          <li><strong>El cierre con acción:</strong> Nunca termines un texto sobre un problema sin ofrecer un camino de acción, por pequeño que sea.</li>
        </ul>
        <h3>Ejercicio de Escritura</h3>
        <p>Elegí un problema que te importe de tu barrio/ciudad. Escribí un texto de <strong>máximo 200 palabras</strong> usando estas técnicas: gancho en la primera línea, un detalle revelador, un dato duro, y un cierre con acción concreta. Leelo en voz alta. ¿Te mueve a vos? Si no te mueve a vos, no va a mover a nadie.</p>
        <blockquote>"Las palabras que cambian el mundo no son las más sofisticadas. Son las más honestas, las más precisas, las que dicen lo que muchos sienten pero nadie se anima a decir en voz alta."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Video y Audio: Narrativas Audiovisuales Accesibles',
      description: 'Crear contenido audiovisual de impacto con herramientas al alcance de todos.',
      content: `
        <h2>Tu Celular Es una Cámara de Cine</h2>
        <p>Hace 20 años, hacer un documental requería equipos costosos, un equipo técnico y distribución profesional. Hoy, con un <strong>celular y conexión a internet</strong>, podés crear y distribuir contenido audiovisual que llegue a miles de personas. La barrera técnica cayó. Lo que queda es la barrera narrativa: saber qué contar y cómo.</p>
        <h3>Video: Principios Básicos</h3>
        <ul>
          <li><strong>Estabilidad:</strong> Usá trípode o apoyá el celular. Un video tembloroso pierde credibilidad.</li>
          <li><strong>Audio es más importante que video:</strong> La gente tolera imagen mediocre pero no tolera audio malo. Acercá el micrófono al que habla.</li>
          <li><strong>Luz natural:</strong> Filmá con la ventana o el sol detrás de cámara, iluminando la cara del entrevistado.</li>
          <li><strong>Los primeros 3 segundos:</strong> En redes sociales, tenés 3 segundos para captar atención. Empezá con la frase más impactante.</li>
          <li><strong>Duración:</strong> Para redes, 60-90 segundos es ideal. Para YouTube, 5-10 minutos máximo salvo que sea contenido muy específico.</li>
        </ul>
        <h3>Formatos Que Funcionan</h3>
        <ol>
          <li><strong>Testimonio directo:</strong> Una persona mirando a cámara contando su historia. Crudo, potente, sin edición sofisticada.</li>
          <li><strong>Mini-documental:</strong> 3-5 minutos mostrando una situación: imágenes del lugar + voz en off + entrevistas cortas.</li>
          <li><strong>Antes/después:</strong> Mostrar con imágenes la transformación.</li>
          <li><strong>La caminata:</strong> Caminar por un lugar mostrando y narrando lo que se ve. Muy efectivo para mostrar realidades barriales.</li>
        </ol>
        <h3>Audio: El Poder del Podcast</h3>
        <p>El audio es el formato más íntimo. Un podcast permite profundizar temas con una inversión mínima:</p>
        <ul>
          <li>Un micrófono USB básico (o los auriculares del celular en un lugar silencioso).</li>
          <li>Software de edición gratuito (Audacity, GarageBand).</li>
          <li>Plataformas de distribución gratuitas (Spotify for Podcasters, Anchor).</li>
        </ul>
        <h3>Herramientas Específicas para Datos Móviles en Argentina</h3>
        <p>En Argentina, el 85% de la población accede a internet desde el celular. Eso significa que tu audiencia <strong>consume contenido con datos móviles limitados</strong>. Esto cambia radicalmente cómo producís:</p>
        <ul>
          <li><strong>Resolución inteligente:</strong> Filmá en 1080p pero exportá en 720p. Tu video pesa la mitad y en una pantalla de celular la diferencia es imperceptible. Apps como VN o CapCut te permiten ajustar esto en la exportación.</li>
          <li><strong>Compresión sin perder calidad:</strong> Usá HandBrake (gratis, multiplataforma) para comprimir archivos antes de subir. Un video de 3 minutos puede pasar de 200MB a 30MB sin pérdida visible.</li>
          <li><strong>Subtítulos obligatorios:</strong> El 80% de los videos en redes se ven sin sonido. En el transporte público, en el trabajo, en la cama a las 2AM. Usá CapCut o la función automática de Instagram para agregar subtítulos. En Argentina, esto no es opcional: es supervivencia narrativa.</li>
          <li><strong>Formato vertical (9:16):</strong> El 92% del consumo de video en Argentina es en formato vertical. Filmá en vertical para Instagram Reels, TikTok y WhatsApp Status. Reservá el horizontal solo para YouTube.</li>
          <li><strong>Audio con auriculares con cable:</strong> Los auriculares con micrófono que vienen con el celular son tu mejor herramienta de audio portátil. Ponelos en la remera del entrevistado, cerca de la boca. Mejor audio que cualquier micrófono de $5.000.</li>
        </ul>
        <h3>Apps Gratuitas para el Kit Argentino de Video</h3>
        <ol>
          <li><strong>CapCut:</strong> Edición de video completa, gratis, con subtítulos automáticos en español. La mejor opción para Reels y TikTok.</li>
          <li><strong>VN Video Editor:</strong> Más control que CapCut, sin marca de agua, ideal para mini-documentales de 3-5 minutos.</li>
          <li><strong>Canva:</strong> Para crear placas de texto, infografías animadas y thumbnails. Tiene plan gratuito robusto.</li>
          <li><strong>Audacity (PC) / GarageBand (iOS):</strong> Edición de audio profesional, gratuita. Para limpiar entrevistas y armar podcasts.</li>
          <li><strong>Google Drive:</strong> Backup gratuito de 15GB. Subí tus archivos crudos antes de editarlos. Perder material es perder la historia.</li>
        </ol>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <h4>Tu Primer Video de 60 Segundos — Template Paso a Paso</h4>
          <p>Usá esta estructura para producir tu primera pieza audiovisual hoy mismo. No mañana. Hoy.</p>
          <ol>
            <li><strong>Segundos 0-5 — El Gancho:</strong> Una frase que obligue a quedarse. Mirando a cámara, con energía: "¿Sabías que en tu barrio pasan cosas que nadie te cuenta?"</li>
            <li><strong>Segundos 5-15 — El Contexto Rápido:</strong> ¿De qué vas a hablar? ¿Por qué importa? Máximo 2 oraciones. "Hoy te muestro algo que descubrí caminando por [nombre de tu barrio]. Algo que cambia cómo vemos este lugar."</li>
            <li><strong>Segundos 15-40 — La Historia:</strong> Mostrá lo que querés contar. Si es una entrevista, dejá hablar al protagonista. Si es una situación, filmala mientras narrás encima. Un detalle revelador vale más que 10 planos generales.</li>
            <li><strong>Segundos 40-50 — El Dato o Contexto:</strong> Un número, una comparación, algo que dimensione. "Esto le pasa a 1 de cada 3 familias en este barrio."</li>
            <li><strong>Segundos 50-60 — El Cierre con Acción:</strong> ¿Qué puede hacer quien ve esto? "Si querés saber más, seguí esta cuenta. Si querés ayudar, compartí este video. Si vivís esto, contá tu historia en los comentarios."</li>
          </ol>
          <p><strong>Tarea:</strong> Grabá tu video de 60 segundos usando este template. No busques perfección. Buscá autenticidad. Publicalo en una red social con el hashtag #MiBarrioCuenta.</p>
        </div>

        <h3>El Consentimiento</h3>
        <p>Siempre, SIEMPRE pedí consentimiento a las personas que filmás o grabás. Explicá para qué va a usarse. Respetá si alguien no quiere aparecer. La ética es no negociable.</p>
        <blockquote>"No necesitás una productora para contar historias que importen. Necesitás un celular, algo verdadero que contar, y el coraje de darle voz a lo que el mundo necesita escuchar."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Redes Sociales: Micro-Narrativas que Conectan',
      description: 'Adaptar el storytelling a los formatos y lógicas de las redes sociales.',
      content: `
        <h2>Contar Historias en 280 Caracteres</h2>
        <p>Las redes sociales no son enemigas de las buenas historias. Son un <strong>formato diferente</strong> que requiere adaptación. Un hilo de Twitter/X bien escrito, un reel de Instagram con una historia poderosa, una publicación de Facebook que invite a la reflexión: todo puede ser storytelling.</p>
        <h3>Storytelling por Plataforma</h3>
        <ul>
          <li><strong>Twitter/X:</strong> Hilos narrativos. Cada tweet es una "escena". Empezá con el gancho, desarrollá en 5-10 tweets, cerrá con llamado a acción. Usá la primera persona.</li>
          <li><strong>Instagram:</strong> Visual primero. La imagen o video debe impactar antes de que lean el caption. Reels de 30-60 segundos con una sola historia. Carruseles para narrativas paso a paso.</li>
          <li><strong>TikTok:</strong> Autenticidad sobre producción. El formato "mirá lo que descubrí" o "te cuento algo que nadie te dice" funciona para temas sociales.</li>
          <li><strong>Facebook:</strong> Publicaciones más largas, grupos temáticos. Funciona para comunidades específicas y audiencias de mayor edad.</li>
          <li><strong>WhatsApp:</strong> El boca a boca digital. Un audio de 1 minuto con una historia personal puede ser más viral que cualquier post.</li>
        </ul>
        <h3>Reglas de Oro para Redes</h3>
        <ol>
          <li><strong>Una idea por publicación.</strong> No intentes decir todo en un post.</li>
          <li><strong>Gancho en las primeras palabras.</strong> En redes, tenés 1 segundo para captar atención.</li>
          <li><strong>Lo personal supera lo abstracto.</strong> "Hoy vi algo en el colectivo que me hizo pensar" > "La situación social es preocupante."</li>
          <li><strong>Invitá a la conversación.</strong> Las publicaciones que terminan con una pregunta genuina generan más engagement que las que terminan con una afirmación.</li>
          <li><strong>Constancia sobre viralidad.</strong> Mejor publicar 3 veces por semana consistentemente que buscar el viral del año.</li>
        </ol>
        <h3>Demografía de Plataformas en Argentina: Dónde Está Tu Audiencia</h3>
        <p>No todas las plataformas son iguales en Argentina. Conocer <strong>quién está dónde</strong> te permite elegir el canal correcto para tu historia:</p>
        <ul>
          <li><strong>WhatsApp (95% de penetración):</strong> La red dominante. Todas las edades, todos los niveles socioeconómicos. Los grupos de WhatsApp son el verdadero espacio público argentino. Un audio de 1 minuto en un grupo de vecinos tiene más alcance real que un post viral en Twitter. <em>Ideal para:</em> historias en formato audio, cadenas de texto con datos concretos, videos cortos (&lt;1 min).</li>
          <li><strong>Instagram (78% de usuarios de internet):</strong> Dominante en 18-45 años. Nivel socioeconómico medio-alto predominante pero creciendo en todos los segmentos. Reels es el formato rey: el algoritmo favorece contenido local. <em>Ideal para:</em> Reels de 30-60 seg, carruseles informativos, Stories con encuestas.</li>
          <li><strong>TikTok (62% de usuarios de internet):</strong> Explosión en 16-35 años, pero crecimiento acelerado en +40. El algoritmo argentino favorece contenido en español rioplatense. Un video sin seguidores puede llegar a 100.000 personas si conecta. <em>Ideal para:</em> contenido "crudo" y auténtico, formato "te cuento algo", humor con mensaje social.</li>
          <li><strong>Facebook (67% de usuarios de internet):</strong> Audiencia mayoritaria +35 años. Grupos temáticos siguen siendo poderosos: grupos de barrio, de profesiones, de intereses. <em>Ideal para:</em> textos más largos, compartir artículos, movilizar comunidades específicas.</li>
          <li><strong>Twitter/X (25% de usuarios de internet):</strong> Audiencia pequeña pero influyente: periodistas, políticos, formadores de opinión. Lo que se dice en Twitter define la agenda mediática. <em>Ideal para:</em> hilos con datos, denuncias con evidencia, debates con personas de influencia.</li>
          <li><strong>YouTube (85% de usuarios de internet):</strong> La plataforma de contenido largo. Todas las edades. El segundo buscador más usado después de Google. <em>Ideal para:</em> documentales cortos (5-15 min), tutoriales, entrevistas en profundidad.</li>
        </ul>
        <h3>Datos de Engagement que Cambian Tu Estrategia</h3>
        <ul>
          <li><strong>Horarios pico en Argentina:</strong> 7:30-9:00 (transporte público matutino), 12:00-14:00 (almuerzo), 20:00-23:00 (prime time nocturno). Publicar fuera de estos horarios es gritar en el desierto.</li>
          <li><strong>El efecto "compartir en privado":</strong> En Argentina, el 70% del contenido se comparte por mensaje privado (WhatsApp, DM de Instagram), no de forma pública. Tu contenido puede tener pocos "compartidos" públicos pero estar circulando masivamente en privado. Medí el alcance real, no solo el visible.</li>
          <li><strong>El poder del audio en WhatsApp:</strong> Los audios de WhatsApp son el formato narrativo más consumido en Argentina. Un audio de 60 segundos con una historia bien contada se reenvía más que cualquier imagen o texto.</li>
          <li><strong>Carruseles en Instagram:</strong> Tienen 3x más alcance que las publicaciones de imagen única en Argentina. Usá 7-10 slides máximo: gancho en la primera, desarrollo en las del medio, llamado a acción en la última.</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Pensá en la historia que querés contar. Ahora respondé:</p>
          <ol>
            <li>¿Quién es tu audiencia ideal? (edad, dónde vive, qué le preocupa)</li>
            <li>Según los datos de arriba, ¿en qué plataforma está esa audiencia?</li>
            <li>¿Qué formato funciona mejor en esa plataforma para tu tipo de historia?</li>
            <li>¿A qué hora publicarías para maximizar alcance?</li>
          </ol>
          <p>No existe "la mejor plataforma". Existe <strong>la plataforma correcta para tu historia y tu audiencia</strong>. Elegí una y dominala antes de diversificar.</p>
        </div>

        <h3>Métricas Que Importan</h3>
        <p>No midas éxito por likes. Medilo por:</p>
        <ul>
          <li><strong>Comentarios con reflexión:</strong> Alguien se tomó el tiempo de pensar y responder.</li>
          <li><strong>Compartidos:</strong> Alguien quiso que otros vieran tu contenido.</li>
          <li><strong>Mensajes directos:</strong> Alguien conectó tanto que te escribió en privado.</li>
          <li><strong>Acción:</strong> ¿Alguien hizo algo concreto después de ver tu contenido?</li>
        </ul>
        <blockquote>"Las redes sociales son el espacio público más grande que jamás existió. Podés usarlas para quejarte, para consumir, o para contar historias que muevan a la gente. Elegí contar."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Campañas Narrativas: De la Historia a la Acción Colectiva',
      description: 'Diseñar campañas de comunicación que usen el storytelling para generar cambio.',
      content: `
        <h2>Cuando las Historias Se Organizan</h2>
        <p>Una historia individual conmueve. Una <strong>campaña narrativa</strong> transforma. La campaña narrativa es un esfuerzo organizado para contar historias estratégicamente, dirigidas a audiencias específicas, con el objetivo de generar un cambio concreto.</p>
        <h3>Anatomía de una Campaña Narrativa</h3>
        <ol>
          <li><strong>Objetivo claro:</strong> ¿Qué querés lograr? No "concientizar" (demasiado vago). Sí: "Que el Concejo Deliberante apruebe la ordenanza de presupuesto participativo."</li>
          <li><strong>Audiencia definida:</strong> ¿A quién necesitás convencer? ¿Los concejales? ¿Los vecinos que pueden presionar a los concejales? ¿Los medios que pueden instalar el tema?</li>
          <li><strong>Narrativa central:</strong> Un relato que conecte el problema con la solución propuesta. "En nuestro barrio decidimos que era hora de decidir nosotros en qué se gasta nuestra plata."</li>
          <li><strong>Portavoces:</strong> ¿Quién cuenta la historia? Idealmente, personas directamente afectadas. No expertos hablando de la gente, sino la gente hablando de su propia vida.</li>
          <li><strong>Canales:</strong> ¿Dónde se cuenta? Redes sociales, medios locales, actos públicos, reuniones con decisores.</li>
          <li><strong>Timeline:</strong> ¿Cuándo? Las campañas efectivas tienen momentos de intensidad vinculados a momentos de decisión.</li>
        </ol>
        <h3>Caso de Estudio: Campaña por Transparencia Presupuestaria</h3>
        <p>Imaginá que querés que tu municipio publique el presupuesto de manera accesible:</p>
        <ul>
          <li><strong>Semana 1-2:</strong> Recopilar historias de vecinos afectados por decisiones presupuestarias opacas. "Cerraron el centro de salud y nadie nos explicó por qué."</li>
          <li><strong>Semana 3:</strong> Publicar las historias en redes con el hashtag #MiPlataMiDecisión. Video cortos, testimonios directos.</li>
          <li><strong>Semana 4:</strong> Enviar las historias a medios locales. Pedir cobertura. Organizar una conferencia de prensa con los protagonistas.</li>
          <li><strong>Semana 5:</strong> Llevar las historias al Concejo Deliberante. Pedir audiencia pública. Presentar la propuesta formal.</li>
          <li><strong>Seguimiento:</strong> Documentar todo el proceso como historia en sí misma. Win or lose, el relato inspira a otros.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <h4>La Periodista de Corrientes que Rompió el Silencio por WhatsApp</h4>
          <p>En 2021, una periodista independiente de Corrientes capital descubrió un esquema de sobreprecios en la compra de insumos hospitalarios durante la pandemia. Los montos no cerraban: jeringas facturadas al triple de su valor, barbijos a precios de importación que en realidad se compraban en Buenos Aires. Tenía documentos, planillas internas, capturas de pantalla de conversaciones entre funcionarios.</p>
          <p>El problema: ningún medio de Corrientes quiso publicar la investigación. Los medios grandes dependían de la pauta oficial provincial. Los medios chicos tenían miedo. Le dijeron, textualmente: "Si publicamos esto, nos cortan la publicidad y cerramos."</p>
          <p>Entonces hizo algo que nadie esperaba: <strong>convirtió su investigación en una campaña narrativa por WhatsApp</strong>.</p>
          <p>El plan fue quirúrgico:</p>
          <ul>
            <li><strong>Semana 1:</strong> Grabó 5 audios de WhatsApp de 90 segundos cada uno. Cada audio contaba una parte de la historia como si se la contara a un amigo: informal, directa, indignada pero con datos. "Mirá, te cuento algo que descubrí y no lo puedo creer..." Los envió a 30 personas de confianza.</li>
            <li><strong>Semana 2:</strong> Esos 30 contactos reenviaron los audios. Los audios llegaron a grupos de médicos, de enfermeros, de vecinos. Se estima que en 5 días los audios circularon en más de 400 grupos de WhatsApp de Corrientes.</li>
            <li><strong>Semana 3:</strong> Creó un hilo de Twitter con los documentos — fotos de las planillas, capturas de las conversaciones (con datos personales tapados), comparaciones de precios. El hilo tuvo 2.000 retweets en Corrientes, una provincia donde un hilo viral llega a 200.</li>
            <li><strong>Semana 4:</strong> La presión fue tal que un medio nacional levantó la historia. Un diputado provincial pidió informes. El fiscal de Estado abrió una investigación preliminar.</li>
          </ul>
          <p><strong>Resultado:</strong> No hubo condenas penales (la justicia provincial es lenta y tiene sus propias dependencias), pero se modificó el sistema de compras directas del Ministerio de Salud provincial. Se implementó un portal de transparencia para compras de emergencia. Y lo más importante: <strong>se instaló el precedente de que una persona sola, con un celular y la verdad, puede romper el cerco mediático de una provincia entera</strong>.</p>
          <p><strong>Lo que podés aprender:</strong></p>
          <ol>
            <li>WhatsApp no es solo para reenviar memes. Es el <strong>canal de distribución más poderoso de Argentina</strong> porque la gente confía en lo que le manda alguien conocido.</li>
            <li>El formato audio humaniza la denuncia. No es un documento frío: es una persona indignada contándote algo que descubrió.</li>
            <li>La estrategia de escalamiento (WhatsApp → Twitter → medios nacionales) convierte una historia local en presión imposible de ignorar.</li>
            <li>No necesitás un medio. Necesitás una historia verdadera, documentación sólida y una red de distribución que empiece con 30 personas.</li>
          </ol>
        </div>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Pensá en un problema de tu comunidad que los medios locales no cubren. Ahora diseñá tu propia mini-campaña narrativa respondiendo:</p>
          <ol>
            <li>¿Cuál es la historia central? (No el problema abstracto — la historia de UNA persona afectada)</li>
            <li>¿Qué documentación tenés o podrías conseguir?</li>
            <li>¿Cuáles serían tus primeros 30 contactos de confianza para distribuir?</li>
            <li>¿Qué formato usarías primero: audio de WhatsApp, video corto, texto con fotos?</li>
            <li>¿Cuál sería tu estrategia de escalamiento si la historia prende?</li>
          </ol>
          <p>No necesitás ejecutar esto ahora. Pero tener el plan listo significa que cuando aparezca la historia, <strong>vas a saber exactamente qué hacer</strong>.</p>
        </div>

        <blockquote>"Una campaña narrativa efectiva no le dice a la gente qué pensar. Le muestra una realidad que no puede ignorar y le ofrece un camino de acción que no puede rechazar."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Ética Narrativa: El Poder y la Responsabilidad',
      description: 'Los límites éticos del storytelling para el cambio social.',
      content: `
        <h2>Con Gran Poder Narrativo Viene Gran Responsabilidad</h2>
        <p>Si las historias tienen el poder de mover emociones y generar acción, también tienen el poder de <strong>manipular, distorsionar y dañar</strong>. El storytelling para el cambio social requiere un código ético riguroso que lo distinga de la propaganda.</p>
        <h3>Principios Éticos Irrenunciables</h3>
        <ol>
          <li><strong>Verdad:</strong> No inventar, no exagerar, no distorsionar. Si un detalle no es verificable, no lo incluyas.</li>
          <li><strong>Consentimiento informado:</strong> Las personas de tu historia deben saber cómo se va a usar, dónde se va a publicar, y dar su acuerdo explícito.</li>
          <li><strong>Dignidad:</strong> Nunca reducir a una persona a su sufrimiento. No mostrar pobreza como espectáculo. No "pornografía de la miseria".</li>
          <li><strong>Agencia:</strong> Mostrar a las personas como protagonistas de su historia, no como víctimas pasivas que necesitan ser salvadas.</li>
          <li><strong>Complejidad:</strong> No simplificar en buenos y malos. La realidad tiene matices. Mostralos.</li>
          <li><strong>Transparencia:</strong> Si tenés una agenda (y siempre la tenés), hacela explícita. El lector/espectador merece saber desde qué lugar hablás.</li>
        </ol>
        <h3>Errores Comunes</h3>
        <ul>
          <li><strong>"Poverty porn":</strong> Mostrar sufrimiento extremo para generar donaciones o clicks, sin dignificar a las personas.</li>
          <li><strong>El "salvador blanco":</strong> Historias donde un outsider privilegiado "salva" a comunidades vulnerables. Las comunidades se salvan a sí mismas.</li>
          <li><strong>Simplificación excesiva:</strong> Reducir problemas sistémicos complejos a "un villano y una víctima".</li>
          <li><strong>Instrumentalización:</strong> Usar la historia de alguien para tu agenda sin que esa persona tenga voz en cómo se cuenta.</li>
        </ul>
        <h3>El Test Ético</h3>
        <p>Antes de publicar cualquier historia, hacete estas preguntas:</p>
        <ul>
          <li>¿El protagonista de esta historia estaría orgulloso de cómo lo/la represento?</li>
          <li>¿Estoy diciendo la verdad completa o solo la parte que me conviene?</li>
          <li>¿Esta historia empodera o victimiza?</li>
          <li>¿Me sentiría cómodo si la persona sobre la que escribo leyera esto?</li>
        </ul>
        <blockquote>"El narrador que manipula puede ganar una batalla. El narrador que respeta la verdad y la dignidad gana la confianza, y la confianza es la moneda más valiosa del cambio social."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Proyecto Narrativo: Crear Tu Primera Historia de Impacto',
      description: 'Ejercicio integrador: diseñar y ejecutar un proyecto narrativo real.',
      content: `
        <h2>De la Teoría a la Práctica: Tu Historia, Tu Voz, Tu Impacto</h2>
        <p>Llegó el momento de poner todo en práctica. Este ejercicio final te guía paso a paso para crear <strong>tu primera historia de impacto</strong>: una pieza narrativa real que puedas publicar y que tenga potencial de generar cambio.</p>
        <h3>Paso 1: Elegí Tu Tema</h3>
        <p>¿Qué tema te importa lo suficiente como para invertir tiempo y energía? Puede ser:</p>
        <ul>
          <li>Un problema de tu barrio que nadie está contando.</li>
          <li>Una persona o grupo de tu comunidad que está haciendo algo extraordinario.</li>
          <li>Una injusticia que querés hacer visible.</li>
          <li>Una solución que funciona y merece ser replicada.</li>
        </ul>
        <h3>Paso 2: Investigá</h3>
        <ul>
          <li>Hablá con personas afectadas. Escuchá sus historias.</li>
          <li>Buscá datos que den contexto: ¿cuánta gente está afectada? ¿Cuánto cuesta?</li>
          <li>Encontrá la historia específica dentro del tema general.</li>
        </ul>
        <h3>Paso 3: Elegí Tu Formato</h3>
        <ul>
          <li><strong>Texto:</strong> Un artículo de 500-800 palabras para publicar en redes o enviar a un medio.</li>
          <li><strong>Video corto:</strong> 60-90 segundos con testimonio directo para Instagram/TikTok.</li>
          <li><strong>Audio:</strong> Episodio de podcast de 5-10 minutos.</li>
          <li><strong>Hilo de redes:</strong> 5-10 publicaciones encadenadas contando la historia.</li>
        </ul>
        <h3>Paso 4: Escribí/Filmá/Grabá</h3>
        <p>Aplicá todo lo que aprendiste:</p>
        <ol>
          <li>Gancho poderoso en las primeras líneas/segundos.</li>
          <li>Un protagonista con nombre y cara.</li>
          <li>Tensión: ¿cuál es el desafío?</li>
          <li>Humanidad: detalles específicos que generen empatía.</li>
          <li>Contexto: datos que dimensionen el problema.</li>
          <li>Cierre con acción: ¿qué puede hacer quien lee/ve/escucha?</li>
        </ol>
        <h3>Paso 5: Publicá y Medí</h3>
        <p>Publicá tu historia. Compartila. Medí el impacto no en likes sino en conversaciones generadas, acciones tomadas, y —lo más importante— en si le hiciste justicia a la historia que contaste.</p>
        <h3>Tu Compromiso como Narrador del Hombre Gris</h3>
        <blockquote>"A partir de hoy, tenés herramientas para contar historias que importan. No son herramientas técnicas solamente: son herramientas de poder ciudadano. Cada historia bien contada es un acto de justicia, un puente de empatía, una semilla de cambio. Usá ese poder con verdad, con respeto y con valentía. El mundo necesita más narradores que iluminen y menos que polaricen."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Escribir Bajo Presión: Crónica Urgente',
      description: 'El perfil de 30 minutos y el ejercicio de escritura cronometrada para emergencias narrativas.',
      content: `
        <h2>Cuando la Historia No Puede Esperar</h2>
        <p>Hay momentos en que la historia está pasando <strong>ahora</strong>. Un desalojo en tu barrio. Una protesta que se pone tensa. Un acto de solidaridad espontánea que nadie más está documentando. En esos momentos, no tenés tiempo para planificar, investigar durante semanas ni pulir cada palabra. Tenés que escribir. Ya.</p>
        <p>La crónica urgente es el formato del narrador que está ahí cuando las cosas pasan. No es periodismo profesional (no necesitás credencial ni medio). Es <strong>testimonio ciudadano con estructura narrativa</strong>. Y es una de las habilidades más poderosas que podés desarrollar.</p>

        <h3>El Perfil de 30 Minutos: Tu Entrenamiento de Combate Narrativo</h3>
        <p>Los corresponsales de guerra, los cronistas de catástrofes, los periodistas de calle tienen una habilidad que parece magia pero es puro entrenamiento: pueden producir una pieza narrativa coherente, emotiva y precisa en minutos. Vos también podés aprenderlo.</p>
        <p>El ejercicio del perfil de 30 minutos funciona así:</p>
        <ol>
          <li><strong>Minutos 0-10 — Observar y Anotar:</strong> Llegás al lugar (o abrís los ojos donde estés). Anotá todo lo que percibís con los 5 sentidos: ¿Qué ves? ¿Qué escuchás? ¿Qué olés? ¿Qué temperatura hace? ¿Qué expresiones tienen las caras? Anotá detalles específicos, no impresiones generales. No "la gente estaba triste". Sí "una mujer con delantal de cocina abrazaba una caja de cartón con ropa de chicos".</li>
          <li><strong>Minutos 10-15 — La Entrevista Relámpago:</strong> Elegí a UNA persona. Acercate y preguntá: "¿Me contás qué está pasando?" Escuchá. Preguntá: "¿Cómo te afecta esto a vos?" Escuchá. Preguntá: "¿Qué es lo que más te preocupa ahora?" Anotá las respuestas textualmente. Las palabras exactas de la gente son oro narrativo.</li>
          <li><strong>Minutos 15-25 — Escribir:</strong> Con tus notas adelante, escribí la crónica. Estructura: gancho con el detalle más impactante → contexto en 2 oraciones → la voz del protagonista (cita textual) → el dato que dimensiona → cierre con lo que viene o lo que se necesita. Máximo 300 palabras.</li>
          <li><strong>Minutos 25-30 — Revisar y Publicar:</strong> Leé en voz alta. ¿Se entiende? ¿Tiene un detalle que se quede en la cabeza? ¿Es justo con las personas involucradas? Corregí errores obvios. Publicá.</li>
        </ol>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <h4>Ejercicio de Escritura Cronometrada — Hacelo AHORA</h4>
          <p>Poné un timer de 30 minutos en tu celular. No lo pares hasta que termine.</p>
          <ol>
            <li><strong>Tu escenario:</strong> Salí a la calle, al balcón, a la ventana. Si no podés salir, usá la vista desde donde estés. Mirá lo que pasa afuera.</li>
            <li><strong>Minutos 1-8:</strong> Anotá todo lo que ves, escuchás, olés. Detalles concretos. El color de una pared. El sonido de un colectivo. La forma en que camina una persona mayor. Un cartel roto. Un perro durmiendo.</li>
            <li><strong>Minutos 8-12:</strong> Si podés, hablá con alguien. El kiosquero, una vecina, alguien en la parada del colectivo. Preguntá: "¿Cómo está el barrio hoy?" Anotá lo que diga, con sus palabras exactas.</li>
            <li><strong>Minutos 12-25:</strong> Escribí una crónica de máximo 250 palabras sobre lo que acabás de observar. Usá esta estructura:
              <ul>
                <li>Primera línea: el detalle más sorprendente o revelador</li>
                <li>Segundo párrafo: qué está pasando, dónde, cuándo</li>
                <li>Tercer párrafo: la voz de alguien (cita textual)</li>
                <li>Cierre: una reflexión de una oración o una pregunta abierta</li>
              </ul>
            </li>
            <li><strong>Minutos 25-30:</strong> Leé en voz alta. Corregí lo que suene raro. Listo.</li>
          </ol>
          <p><strong>Importante:</strong> Este ejercicio no se trata de escribir algo "bueno". Se trata de <strong>entrenar tu capacidad de producir bajo presión</strong>. Cuantas más veces lo hagas, mejor te va a salir. Los cronistas profesionales hacen versiones de este ejercicio todos los días.</p>
        </div>

        <h3>Formatos de Crónica Urgente para Redes</h3>
        <p>Tu crónica de 30 minutos puede tomar varios formatos según la plataforma:</p>
        <ul>
          <li><strong>Hilo de WhatsApp (3-5 audios de 60 segundos):</strong> Contá lo que estás viendo como si le hablaras a un amigo. Primer audio: el gancho. Últimos audios: qué se necesita.</li>
          <li><strong>Hilo de Twitter/X (5-8 tweets):</strong> Cada tweet una escena. Intercalá texto con fotos del lugar. Último tweet: contexto y llamado a acción.</li>
          <li><strong>Story de Instagram (5-7 stories):</strong> Combiná video del lugar + texto sobre la imagen + encuesta o pregunta en la última story.</li>
          <li><strong>Post largo de Facebook:</strong> La crónica completa de 250-300 palabras con 2-3 fotos. Funcioná especialmente bien en grupos de barrio.</li>
        </ul>

        <h3>Las 5 Preguntas de la Crónica Urgente</h3>
        <p>Antes de publicar cualquier crónica urgente, verificá que respondiste estas preguntas:</p>
        <ol>
          <li><strong>¿Qué está pasando?</strong> (el hecho concreto)</li>
          <li><strong>¿A quién le pasa?</strong> (nombre o descripción del protagonista)</li>
          <li><strong>¿Por qué importa?</strong> (el dato que dimensiona)</li>
          <li><strong>¿Qué dice la gente?</strong> (al menos una voz directa)</li>
          <li><strong>¿Qué se puede hacer?</strong> (acción concreta para quien lee)</li>
        </ol>
        <p>Si tu crónica responde las 5, es publicable. Si le faltan una o dos, agregá lo que falta en un post de seguimiento. Lo importante es que <strong>la historia salga</strong>, no que sea perfecta.</p>

        <h3>Ética de la Crónica Urgente</h3>
        <p>La urgencia no te exime de la ética. Incluso con el timer corriendo:</p>
        <ul>
          <li>No publiques fotos de menores sin autorización de sus padres.</li>
          <li>No identifiques víctimas de violencia sin su consentimiento.</li>
          <li>Si no estás seguro de un dato, decilo: "según lo que pude ver" o "vecinos dicen que".</li>
          <li>Si te equivocaste en algo, corregilo públicamente. La corrección es parte de la credibilidad.</li>
        </ul>

        <blockquote>"El cronista urgente no espera a que la historia termine para contarla. La cuenta mientras pasa, con las manos sucias de realidad y la voz temblando de verdad. Eso es el Hombre Gris con un celular: un testigo que no se calla."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 18, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 28');

  const existingQuiz28 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz28.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz28[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }

  const [quiz28] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Narrativas que Transforman', description: 'Evaluá tu comprensión del storytelling para el cambio social.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();

  const questions28 = [
    { quizId: quiz28.id, question: '¿Por qué las historias son más efectivas que los datos para generar acción?', type: 'multiple_choice' as const, options: JSON.stringify(['Porque la gente no entiende datos', 'Porque activan áreas emocionales, sensoriales y motoras del cerebro', 'Porque son más fáciles de inventar', 'Porque los datos siempre mienten']), correctAnswer: JSON.stringify(1), explanation: 'Las historias activan múltiples áreas del cerebro simultáneamente, incluyendo empatía y respuesta motora, generando mayor impacto.', points: 2, orderIndex: 1 },
    { quizId: quiz28.id, question: 'El storytelling para el cambio social debe exagerar la realidad para generar impacto.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La verdad radical es el primer principio. La exageración destruye credibilidad.', points: 1, orderIndex: 2 },
    { quizId: quiz28.id, question: '¿Cuáles son las tres historias del framework de Marshall Ganz?', type: 'multiple_choice' as const, options: JSON.stringify(['Historia corta, media y larga', 'Story of Self, Story of Us, Story of Now', 'Inicio, nudo y desenlace', 'Problema, solución y acción']), correctAnswer: JSON.stringify(1), explanation: 'Ganz propone tres historias interconectadas: la personal (Self), la comunitaria (Us) y la urgente (Now).', points: 2, orderIndex: 3 },
    { quizId: quiz28.id, question: 'En video, el audio es más importante que la calidad de imagen.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'La gente tolera imagen mediocre pero no tolera audio malo. El sonido es prioridad.', points: 1, orderIndex: 4 },
    { quizId: quiz28.id, question: '¿Qué es "poverty porn" en el contexto narrativo?', type: 'multiple_choice' as const, options: JSON.stringify(['Documentales sobre pobreza', 'Mostrar sufrimiento extremo como espectáculo sin dignificar a las personas', 'Investigación periodística sobre desigualdad', 'Campañas de recaudación de fondos']), correctAnswer: JSON.stringify(1), explanation: 'El poverty porn instrumentaliza el sufrimiento sin respetar la dignidad de las personas, convirtiéndolas en objetos de lástima.', points: 2, orderIndex: 5 },
    { quizId: quiz28.id, question: 'Una campaña narrativa debe medir su éxito por la cantidad de likes que recibe.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El éxito se mide por conversaciones generadas, acciones tomadas y cambio logrado, no por métricas de vanidad.', points: 1, orderIndex: 6 },
    { quizId: quiz28.id, question: '¿Cuál es la diferencia clave entre storytelling y propaganda?', type: 'multiple_choice' as const, options: JSON.stringify(['El storytelling es más largo', 'El storytelling complejiza y revela; la propaganda simplifica y manipula', 'La propaganda usa video y el storytelling usa texto', 'No hay diferencia']), correctAnswer: JSON.stringify(1), explanation: 'El storytelling transformador muestra complejidad y respeta la inteligencia del lector; la propaganda simplifica y manipula.', points: 2, orderIndex: 7 },
    { quizId: quiz28.id, question: 'Antes de publicar la historia de otra persona, siempre debés obtener su consentimiento informado.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'El consentimiento informado es un principio ético irrenunciable del storytelling responsable.', points: 1, orderIndex: 8 },
  ];

  for (const q of questions28) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz with', questions28.length, 'questions for course 28');
}

async function main() {
  console.log('Seeding Road 4: La Palabra Precisa...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) { console.log('No users found.'); return; }
    const authorId = author.id;
    await seedCourse26(authorId);
    await seedCourse27(authorId);
    await seedCourse28(authorId);
    console.log('Road 4 seeding complete!');
  } catch (error) { console.error('Error:', error); throw error; }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
