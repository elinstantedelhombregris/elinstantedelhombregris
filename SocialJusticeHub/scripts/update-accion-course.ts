import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions } = schema;
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🔥 Actualizando curso "Acción Comunitaria"...');

  // 1. Find the course
  const [course] = await db.select().from(courses).where(eq(courses.slug, 'accion-comunitaria')).limit(1);
  if (!course) {
    console.log('❌ Curso no encontrado. Ejecutá seed-courses.ts primero.');
    process.exit(1);
  }
  console.log('✅ Curso encontrado:', course.title, '(ID:', course.id, ')');

  // 2. Update course metadata
  await db.update(courses).set({
    description: 'De la etimología de "agere" al fuego de la acción real. Este curso te saca del sillón y te pone en tu barrio: cómo empezar con 3 vecinos y una preocupación compartida, mapear los tesoros ocultos de tu comunidad, diseñar proyectos que sobrevivan al entusiasmo inicial, convocar sin manipular, y convertir acciones locales en transformación nacional. El Hombre Gris no opina — actúa.',
    excerpt: 'Dejá de opinar y empezá a hacer: herramientas reales para transformar tu barrio, tu comunidad y tu país desde hoy.',
    duration: 195,
  }).where(eq(courses.id, course.id));
  console.log('✅ Metadatos del curso actualizados');

  // 3. Delete existing lessons
  await db.delete(courseLessons).where(eq(courseLessons.courseId, course.id));
  console.log('✅ Lecciones anteriores eliminadas');

  // 4. Delete existing quiz and questions
  const existingQuizzes = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course.id));
  for (const quiz of existingQuizzes) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
  }
  await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course.id));
  console.log('✅ Quiz anterior eliminado');

  // ═══════════════════════════════════════════════════════════════
  // LECCIONES — Arco narrativo: Agere → Mover → Construir → Sostener
  // ═══════════════════════════════════════════════════════════════

  const lessons = [

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 1: Agere — La etimología de la acción
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Agere — La etimología de la acción',
      description: 'De dónde viene la palabra "acción", qué significa ser agente, y por qué reaccionar no es lo mismo que actuar.',
      content: `
<h2>La palabra que mueve el mundo</h2>

<p>Hay palabras que cuando las decís, no pasa nada. Y hay palabras que cuando las entendés de verdad, te cambian la vida. <strong>Acción</strong> es una de esas.</p>

<h3>Agere: hacer, mover, conducir</h3>

<p>La palabra <em>acción</em> viene del latín <strong><em>actio</em></strong>, que a su vez viene del verbo <strong><em>agere</em></strong>. Y <em>agere</em> no significa simplemente "hacer". Significa <strong>mover, conducir, llevar adelante, poner en marcha</strong>. Es un verbo con dirección, con fuerza, con intención.</p>

<p>De esa raíz nacen palabras que deberían darte un escalofrío cuando las entendés juntas:</p>

<ul>
  <li><strong><em>Agente</em></strong> — el que actúa, el que hace, el que mueve las cosas. No el que mira. No el que opina. El que <em>hace</em>.</li>
  <li><strong><em>Agenda</em></strong> — literalmente, "las cosas que deben hacerse". No las cosas que hay que pensar o discutir. Las que hay que <em>hacer</em>.</li>
  <li><strong><em>Agitar</em></strong> — poner en movimiento lo que está quieto. Sacudir lo estancado.</li>
  <li><strong><em>Protagonista</em></strong> — del griego <em>proto</em> (primero) + <em>agonistes</em> (el que actúa). El protagonista no es el más importante — es el <strong>primero en actuar</strong>.</li>
  <li><strong><em>Acto</em></strong> — una unidad de acción con sentido. En el teatro, cada acto cambia la historia. En la vida, también.</li>
</ul>

<blockquote>
  <p>Ser agente no es un título. Es una decisión: la decisión de dejar de ser movido por las circunstancias y empezar a mover las circunstancias.</p>
</blockquote>

<h3>Reaccionar vs. actuar</h3>

<p>Hay una diferencia enorme entre estas dos palabras que en el día a día confundimos todo el tiempo:</p>

<p><strong>Reaccionar</strong> es responder a algo que te pasó. Es automático. Es reflejo. Es el perro que ladra cuando suena el timbre. No eligió ladrar — le salió. <em>Re-acción</em> significa literalmente "acción de vuelta" — algo te empuja y vos empujás para atrás. No hay dirección propia. Hay defensa.</p>

<p><strong>Actuar</strong> es iniciar algo desde adentro. Es elegido. Es deliberado. Es el que mira la situación, piensa, y decide qué hacer — no porque algo lo obligó, sino porque algo lo mueve desde adentro. La acción tiene <strong>origen propio y dirección elegida</strong>.</p>

<p>Argentina vive en modo reactivo. Reaccionamos a la inflación. Reaccionamos a la inseguridad. Reaccionamos al gobierno de turno. Reaccionamos a la crisis. Siempre respondiendo, nunca iniciando. Siempre corriendo detrás de lo que pasa, nunca adelante diseñando lo que queremos que pase.</p>

<p><strong>El Hombre Gris no reacciona. Actúa.</strong> No espera a que la crisis le diga qué hacer. Ve el mineral gris, enciende el fuego, y empieza a refinar. Eso es <em>agere</em> — mover el mundo desde adentro.</p>

<h3>La acción como pilar del refinamiento</h3>

<p>En la metáfora de la plata que vimos en el curso introductorio, la Visión es <em>ver</em> la plata dentro del mineral. Pero ver no alcanza. Podés ver el potencial de algo durante toda tu vida y no cambiar nada. <strong>La Acción es encender el fuego.</strong></p>

<p>Sin fuego no hay refinamiento. Sin calor no salen las impurezas. Sin acción la plata queda gris para siempre — llena de potencial pero sin brillo. Y el fuego no se enciende solo. Alguien tiene que juntar la leña, preparar el crisol, sostener la llama. Ese alguien sos vos.</p>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Pensá en tu semana pasada. ¿Cuántas de tus acciones fueron genuinamente iniciadas por vos — nacidas de una decisión propia, con una dirección elegida? ¿Y cuántas fueron reacciones — respuestas automáticas a lo que te pasó, a lo que dijo alguien, a lo que salió en las noticias? Si la mayoría fueron reacciones, no te juzgues: simplemente observalo. Ese es el primer paso para pasar de reactor a agente.</p>
</blockquote>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 20,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 2: La enfermedad del sillón
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'La enfermedad del sillón — Por qué Argentina opina pero no actúa',
      description: 'Diagnóstico honesto de por qué sabemos qué hay que hacer y no lo hacemos, y cómo romper el ciclo.',
      content: `
<h2>El país de los 45 millones de directores técnicos</h2>

<p>Hay un chiste que dice que en Argentina todos somos directores técnicos de la selección, economistas y presidentes. Desde el bar, desde el asado, desde Twitter — <strong>sabemos exactamente qué hay que hacer</strong>. El problema es que nadie lo hace.</p>

<p>Esto no es un defecto argentino. Es un mecanismo psicológico universal. Pero en Argentina tiene una intensidad especial, alimentada por décadas de frustraciones acumuladas que crearon una cultura donde <strong>opinar reemplazó a actuar</strong>.</p>

<h3>El activismo de sofá</h3>

<p>Año 2026. Agarrás el teléfono a la mañana. Leés una noticia indignante. Te calentás. Compartís. Escribís un comentario. Ponés "me indigna". Alguien te responde, le respondés. Discusión. Más indignación. Pasaron 45 minutos. Cerrás la app.</p>

<p><strong>¿Qué cambió en el mundo real?</strong> Nada. Absolutamente nada.</p>

<p>Pero tu cerebro registró algo parecido a la acción. La indignación genera adrenalina. El posteo genera dopamina. El "me gusta" genera validación. Tu sistema nervioso <em>cree</em> que hiciste algo. Es la <strong>ilusión de acción sin acción real</strong>. Y es adictiva — porque te da la satisfacción del compromiso sin el costo del compromiso.</p>

<h3>Las 5 excusas que matan la acción</h3>

<p>Después de años de escuchar a argentinos explicar por qué no actúan (mientras explican brillantemente qué habría que hacer), estas son las 5 excusas más comunes:</p>

<ol>
  <li>
    <strong>"¿Para qué, si no va a cambiar nada?"</strong><br />
    La profecía autocumplida perfecta. Si creés que nada va a cambiar, no actuás. Si no actuás, nada cambia. Y entonces decís: "¿Ves? Te dije que nada iba a cambiar." Pero la causa no fue la realidad — fue tu creencia.
  </li>
  <li>
    <strong>"Hasta que no tenga todo claro, no empiezo."</strong><br />
    El perfeccionismo como disfraz de miedo. Nadie empieza con todo claro. Todos los que hicieron algo grande empezaron confundidos, asustados y con el plan a medio armar. La claridad viene de la acción, no al revés.
  </li>
  <li>
    <strong>"Yo solo no puedo hacer nada."</strong><br />
    Falso. Una sola persona puede limpiar una vereda, plantar un árbol, darle clases a un pibe, organizar una reunión de vecinos. El "yo solo no puedo" es verdad para derrocar gobiernos. No es verdad para mejorar tu cuadra.
  </li>
  <li>
    <strong>"Debería hacerlo alguien que sepa más."</strong><br />
    La excusa de la falsa humildad. "Alguien" nunca aparece. "Alguien" es el personaje ficticio más improductivo de la historia. Mientras esperás a "alguien", el problema crece.
  </li>
  <li>
    <strong>"No tengo tiempo."</strong><br />
    Pero tenés tiempo para redes sociales, para quejarte, para mirar series, para discutir de política. No es falta de tiempo — es falta de prioridad. Y eso está bien admitirlo. Es más honesto decir "no es mi prioridad" que "no tengo tiempo".
  </li>
</ol>

<h3>El costo de la inacción</h3>

<p>Acá hay algo que pocas veces se dice: <strong>la inacción no es neutra</strong>. No es "quedarse como está". Es un retroceso activo.</p>

<p>Volvé a la metáfora de la plata: si el orfebre apaga el fuego a mitad del refinamiento, las impurezas que estaban saliendo a la superficie se solidifican de vuelta. Se endurece el metal. Se vuelve más difícil de refinar la próxima vez. <strong>Cada día que pasa sin actuar, las impurezas — personales y colectivas — se consolidan un poquito más.</strong></p>

<p>Cada vez que decís "mañana empiezo", el mañana se hace más lejano. No porque el calendario cambie, sino porque el hábito de postergar se fortalece. La inacción es un músculo que se entrena. La acción también. ¿Cuál estás entrenando?</p>

<h3>El antídoto: la acción imperfecta</h3>

<p>No necesitás el plan perfecto. No necesitás toda la información. No necesitás la aprobación de nadie. Lo que necesitás es <strong>dar un paso</strong>. Uno solo. Chiquito. Imperfecto. Ahora.</p>

<p>Un paso imperfecto hoy vale más que un plan perfecto mañana. Porque el paso te da información real, te conecta con otros, te muestra lo que funciona y lo que no. El plan, en cambio, te da la ilusión de control sin haberte movido un centímetro.</p>

<blockquote>
  <p>El Hombre Gris no espera a estar listo. Se lanza al fuego sabiendo que va a quemarse — y confía en que el fuego lo va a refinar, no destruir.</p>
</blockquote>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Identificá UNA cosa que venís diciendo "tendría que hacer" desde hace semanas o meses. Puede ser chiquita: hablar con un vecino, limpiar algo, organizar algo, aprender algo, ofrecer algo. Escribila. Ahora escribí el paso más ridículamente pequeño para empezar — tan chico que sea imposible decir que no. ¿Podés hacerlo hoy? Si la respuesta es sí, cerrá esta lección y andá a hacerlo. Esta lección va a seguir acá cuando vuelvas. La oportunidad de actuar, quizás no.</p>
</blockquote>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 3: Tu barrio como laboratorio
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Tu barrio como laboratorio — Empezar donde estás',
      description: 'No necesitás permiso ni presupuesto. Necesitás 3 vecinos y una preocupación compartida. La regla de los 3 metros.',
      content: `
<h2>El mito del gran cambio</h2>

<p>Hay una fantasía que nos paraliza: la idea de que para cambiar algo tiene que ser grande. Un proyecto nacional. Una ONG con estructura. Un movimiento con miles de seguidores. Una revolución.</p>

<p>Esa fantasía es una trampa. Porque mientras esperás lo grande, <strong>lo chiquito — que es donde realmente vive la transformación — se pudre sin atención</strong>.</p>

<p>La verdad es mucho más simple y mucho más poderosa: <strong>todo lo que necesitás para empezar está a 3 metros de donde estás sentado ahora mismo.</strong></p>

<h3>La regla de los 3 metros</h3>

<p>Mirá 3 metros alrededor tuyo. No 3 kilómetros. No 3 provincias. <strong>Tres metros.</strong></p>

<p>¿Qué ves? ¿Una vereda rota? ¿Un vecino que vive solo? ¿Un espacio público abandonado? ¿Un pibe sin contención? ¿Una plaza sin bancos? ¿Una esquina oscura? ¿Un almacén que podría ser punto de encuentro?</p>

<p>Ahora pensá: ¿qué podrías hacer — vos, sin esperar a nadie — para mejorar algo de eso?</p>

<p>Si cada argentino mejorara sus 3 metros, el país entero cambiaría. No es una metáfora — es matemática. 45 millones de personas mejorando 3 metros cada una es una revolución silenciosa y distribuida que ningún gobierno podría igualar.</p>

<h3>3 vecinos y una preocupación compartida</h3>

<p>La fórmula mínima de la acción comunitaria no requiere presupuesto, estructura legal, ni permiso de nadie. Requiere:</p>

<ol>
  <li><strong>Vos</strong> — con ganas de actuar</li>
  <li><strong>2 o 3 vecinos</strong> — que compartan una preocupación</li>
  <li><strong>Una preocupación concreta</strong> — no "el país está mal" (eso es abstracto), sino "la esquina de casa está oscura y da miedo" (eso es accionable)</li>
</ol>

<p>Con esos tres ingredientes ya podés hacer una reunión, pensar soluciones, y actuar. No mañana. Esta semana.</p>

<h3>Ejemplos reales que empezaron así</h3>

<p>Cada uno de estos proyectos empezó con 3 personas o menos, sin presupuesto, sin permiso, sin estructura:</p>

<ul>
  <li><strong>Huerta comunitaria en Moreno:</strong> Un jubilado empezó a plantar en un terreno baldío. Un vecino lo vio y se sumó. Después otro. Hoy alimentan a 30 familias y enseñan huerta a chicos de la escuela del barrio.</li>
  <li><strong>Biblioteca popular en Quilmes:</strong> Una maestra jubiló y tenía 500 libros en su casa. Puso un cartel: "Libros gratis". Hoy funciona una biblioteca con talleres de lectura para adultos y apoyo escolar para pibes.</li>
  <li><strong>Red de cuidado en Córdoba:</strong> Tres madres del barrio se organizaron para cuidar turnos a los hijos de todas cuando alguna tenía que trabajar. Hoy son 15 familias, tienen un WhatsApp de emergencias, y se ayudan con todo — desde medicina hasta mudanzas.</li>
  <li><strong>Limpieza de arroyo en Tucumán:</strong> Un pibe de 19 años se cansó de ver basura en el arroyo de su barrio. Publicó una foto y dijo "el sábado a las 9 limpio, el que quiera venir que venga". Fueron 4 personas el primer sábado. Al tercer sábado eran 40. El municipio terminó sumándose.</li>
</ul>

<blockquote>
  <p>Ninguno de estos proyectos empezó con un plan estratégico. Empezaron con alguien que dejó de quejarse y agarró una pala, un libro, un teléfono. Empezaron con <em>agere</em> — con el acto de mover.</p>
</blockquote>

<h3>El permiso que nadie te da (porque no lo necesitás)</h3>

<p>Una de las enfermedades más argentinas es <strong>esperar permiso para actuar</strong>. Esperar que el municipio apruebe. Esperar que la sociedad de fomento convoque. Esperar que alguien con título, plata o autoridad diga "adelante".</p>

<p>Pero la mayoría de las acciones comunitarias más transformadoras de la historia <em>no pidieron permiso</em>. Se hicieron. Y después, cuando ya funcionaban, las instituciones se subieron al tren.</p>

<p>No esperés que el Estado te dé luz verde. No esperés que un líder te convoque. No esperés a que "la gente esté lista". <strong>La gente se suma cuando ve que alguien ya empezó.</strong> Nadie se sube a un tren parado. Pero cuando el tren arranca, todos quieren subir.</p>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Esta semana, caminá tu barrio con "ojos de agente". Salí a dar una vuelta de 20 minutos, pero esta vez no vayas pensando en tus cosas — mirá. Observá. Y anotá dos listas en tu teléfono:<br /><br />
  <strong>Lista 1: 5 problemas</strong> — cosas que están mal, rotas, abandonadas, que podrían mejorar.<br />
  <strong>Lista 2: 5 recursos</strong> — personas con habilidades, espacios que se podrían usar, organizaciones que ya existen (clubes, iglesias, comercios, escuelas), herramientas disponibles.<br /><br />
  Vas a descubrir algo sorprendente: tu barrio tiene más recursos de los que pensabas. Y los problemas, cuando los mirás con ojos de agente en vez de ojos de víctima, empiezan a parecerse a oportunidades.</p>
</blockquote>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 4: Mapear para actuar
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Mapear para actuar — Los tesoros ocultos de tu comunidad',
      description: 'El enfoque de activos: antes de pedir lo que falta, descubrí lo que ya tenés. Cada barrio es más rico de lo que cree.',
      content: `
<h2>El error que arruina la mayoría de los proyectos</h2>

<p>Cuando alguien quiere mejorar su comunidad, lo primero que hace es una lista de lo que falta: <em>"Nos falta plata. Nos falta apoyo del municipio. Nos faltan profesionales. Nos falta infraestructura. Nos falta todo."</em></p>

<p>Y tiene razón. Siempre falta algo. En todos los barrios, de todos los países, en todos los tiempos de la historia. <strong>Si esperás a que no falte nada para actuar, no actuás nunca.</strong></p>

<p>Hay otro enfoque — más inteligente, más potente, y curiosamente más esperanzador — que cambia la pregunta por completo:</p>

<blockquote>
  <p>En vez de preguntar "¿qué nos falta?", preguntá <strong>"¿qué ya tenemos?"</strong></p>
</blockquote>

<h3>El enfoque de activos comunitarios (ABCD)</h3>

<p>En los años 90, dos investigadores de la Universidad de Northwestern — John McKnight y Jody Kretzmann — estudiaron comunidades que habían logrado transformarse a pesar de la pobreza y la falta de recursos externos. Descubrieron algo revelador: <strong>las comunidades que prosperaban no eran las que recibían más ayuda de afuera, sino las que mejor conocían y usaban lo que ya tenían adentro</strong>.</p>

<p>Le pusieron nombre: <strong>Asset-Based Community Development</strong> (Desarrollo Comunitario Basado en Activos). La idea central es simple pero revolucionaria:</p>

<p><strong>Toda comunidad, por más pobre o marginada que parezca, tiene activos.</strong> Tiene gente con habilidades, tiene espacios, tiene historias, tiene redes, tiene conocimientos. La clave es hacerlos visibles — porque muchas veces la propia comunidad no sabe lo que tiene.</p>

<h3>Los 5 tipos de activos comunitarios</h3>

<p>Cuando mapeás tu barrio, buscá estos cinco tipos de tesoros ocultos:</p>

<ol>
  <li>
    <strong>Personas y sus habilidades</strong><br />
    El jubilado que sabe de electricidad. La joven que estudia enfermería. El albañil que puede enseñar a construir. La abuela que cocina para un ejército. El pibe que sabe de tecnología. <strong>Cada persona sabe algo que otra persona necesita.</strong> El problema es que nadie se lo preguntó.
  </li>
  <li>
    <strong>Organizaciones existentes</strong><br />
    Clubes de barrio, iglesias, cooperadoras escolares, sociedades de fomento, centros culturales, cooperativas. Muchas ya están ahí, funcionando a media máquina, con ganas de hacer más pero sin saber con quién aliarse. <strong>No necesitás crear una organización nueva — quizás necesitás conectar las que ya existen.</strong>
  </li>
  <li>
    <strong>Espacios físicos</strong><br />
    Plazas, terrenos baldíos, salones comunitarios, patios de escuelas fuera del horario escolar, veredas anchas, estacionamientos vacíos los fines de semana. <strong>El espacio para actuar ya existe — solo necesita una función.</strong>
  </li>
  <li>
    <strong>Redes y relaciones</strong><br />
    El grupo de WhatsApp del barrio. La vecina que conoce a todos. El comerciante que sabe quién necesita trabajo. Las amistades cruzadas entre cuadras. <strong>Las redes informales son infraestructura invisible</strong> — más poderosa que cualquier institución formal.
  </li>
  <li>
    <strong>Historias y tradiciones</strong><br />
    Lo que une emocionalmente al barrio: el recuerdo de cuando todos se ayudaron en una inundación, la fiesta que se hacía antes, el orgullo por algo local, los personajes queridos. <strong>Las historias son el pegamento emocional de la comunidad</strong> — y cuando las recuperás, la gente se vuelve a conectar.
  </li>
</ol>

<h3>La conversación como herramienta de mapeo</h3>

<p>La mejor tecnología de mapeo comunitario no es una app ni una encuesta. Es <strong>el mate</strong>.</p>

<p>Golpear puertas. Sentarse con vecinos. Hacer dos preguntas simples:</p>

<ol>
  <li><strong>"¿En qué sos bueno?"</strong> — Esta pregunta le devuelve dignidad a la persona. La saca del lugar de carencia ("no tengo, no puedo") y la pone en el lugar de aporte ("sé hacer esto, puedo ayudar con aquello").</li>
  <li><strong>"¿Qué te gustaría que mejore en el barrio?"</strong> — Esta pregunta conecta la habilidad personal con la necesidad colectiva. Y muchas veces, la persona se da cuenta de que su habilidad es exactamente lo que el barrio necesita.</li>
</ol>

<p>Esas dos preguntas, repetidas en 20 o 30 casas, te dan un mapa de activos más valioso que cualquier estudio técnico. Porque no solo te dice qué hay — te dice <strong>quién quiere ayudar</strong>.</p>

<h3>El mapa como revelación</h3>

<p>Cuando ponés todo lo que encontraste en un mapa — sea en un papel grande, en un pizarrón, o en un documento compartido — ocurre algo mágico: <strong>la comunidad se ve a sí misma por primera vez</strong>.</p>

<p>"¿Don Roberto sabe de plomería? ¡Yo necesito arreglar un caño!" "¿La escuela presta el patio los sábados? ¡Podemos hacer la feria ahí!" "¿Mirta tiene 200 plantas? ¡Podemos empezar la huerta con su ayuda!"</p>

<p>Las conexiones empiezan a aparecer solas. No porque alguien las planifique desde arriba, sino porque <strong>la información se hizo visible</strong>. El mapeo no crea recursos — revela los que ya estaban ahí, invisibles, desconectados, esperando.</p>

<blockquote>
  <p>Recordá la metáfora: la plata ya estaba dentro del mineral gris. El orfebre no la creó — la reveló. Tu barrio es igual: los tesoros ya están. Solo necesitan ser vistos.</p>
</blockquote>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Hacé un mapa de activos de tu manzana o cuadra. No necesitás recorrer todo el barrio — empezá con lo más cercano. Dibujá (o armá un listado) con:<br /><br />
  - Las personas que conocés y qué saben hacer<br />
  - Los espacios disponibles (incluido tu propio patio o vereda)<br />
  - Las organizaciones cercanas (club, iglesia, escuela, comercio)<br />
  - Los grupos de WhatsApp o redes informales que existen<br /><br />
  Cuando lo termines, miralo. Te apuesto que vas a decir: "Tenemos más de lo que pensaba." Ese es el primer paso de la acción real.</p>
</blockquote>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 5: Diseñar proyectos que sobrevivan al entusiasmo
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Diseñar proyectos que sobrevivan al entusiasmo',
      description: 'El problema de los 3 meses, por qué mueren los proyectos comunitarios, y cómo diseñar uno que dure.',
      content: `
<h2>El cementerio de buenos proyectos</h2>

<p>Argentina está llena de proyectos comunitarios que empezaron con toda la energía del mundo y murieron antes de los 3 meses. Huertas comunitarias que hoy son yuyales. Grupos de vecinos que no se juntan más. Cooperativas que se disolvieron. Comedores que cerraron. Centros culturales que ahora son depósitos.</p>

<p>No murieron por falta de buenas intenciones. Murieron por falta de diseño. <strong>El entusiasmo enciende el fuego, pero el diseño lo sostiene.</strong></p>

<h3>El problema de los 3 meses</h3>

<p>Hay un patrón predecible en los proyectos comunitarios:</p>

<ul>
  <li><strong>Mes 1 — La euforia:</strong> "¡Vamos a cambiar el barrio!" Reuniones largas, muchas ideas, mucha energía, muchas promesas. Todo es posible.</li>
  <li><strong>Mes 2 — La realidad:</strong> Aparecen los primeros obstáculos. Alguien no vino. El municipio no contestó. Llovió y se arruinó algo. La burocracia. El que prometió ayuda no cumplió. La energía baja.</li>
  <li><strong>Mes 3 — La crisis:</strong> Los que venían todos dejan de venir. Quedan 2 o 3 que se sienten solos y agotados. Aparece la frase fatal: <em>"Viste, te dije que no iba a funcionar."</em> Y el proyecto muere.</li>
</ul>

<p>Este ciclo se repite miles de veces en todo el país. Pero <strong>no es inevitable</strong>. Los proyectos que sobreviven tienen algo en común: no son necesariamente los que tienen más recursos o más gente. Son los que tienen <strong>mejor diseño</strong>.</p>

<h3>Las 5 causas de muerte de proyectos</h3>

<ol>
  <li>
    <strong>Objetivo difuso:</strong> "Mejorar el barrio" no es un objetivo — es un deseo. ¿Mejorar qué? ¿Cómo? ¿Para cuándo? Si no podés explicar tu proyecto en una oración, el proyecto no está maduro.
  </li>
  <li>
    <strong>Dependencia de una sola persona:</strong> Si todo depende de María — ella organiza, ella convoca, ella hace — cuando María se enferma o se cansa, el proyecto muere. Si María es indispensable, el proyecto tiene un bug de diseño.
  </li>
  <li>
    <strong>No medir nada:</strong> Si no medís, no sabés si estás avanzando o girando en círculos. Y cuando no sabés si avanzás, te desmoralizás. Las métricas no tienen que ser sofisticadas — "atendimos a 15 familias esta semana" ya es una métrica.
  </li>
  <li>
    <strong>No celebrar los logros chicos:</strong> Los seres humanos necesitamos victorias para seguir. Si solo celebramos cuando "ganamos" en grande, nunca celebramos. Un proyecto que no celebra sus pequeños avances se seca como planta sin agua.
  </li>
  <li>
    <strong>No pedir ayuda a tiempo:</strong> Muchos proyectos mueren por orgullo: "Nosotros podemos solos." No, no podés solos. Nadie puede solo. El pilar de Comunidad existe por algo.
  </li>
</ol>

<h3>Diseño anti-frágil: 6 elementos</h3>

<p>Un proyecto anti-frágil no solo sobrevive a los obstáculos — se fortalece con ellos. Estos son los 6 elementos que lo hacen posible:</p>

<ol>
  <li>
    <strong>Objetivo SMART en una oración:</strong><br />
    Específico, Medible, Alcanzable, Relevante, con Tiempo definido. Ejemplo: <em>"En 3 meses vamos a tener una huerta comunitaria funcionando en el terreno baldío de la esquina de Mitre y San Martín, produciendo verduras para al menos 10 familias."</em> Eso es un objetivo. "Mejorar la alimentación del barrio" no lo es.
  </li>
  <li>
    <strong>Roles rotativos:</strong><br />
    No una persona que hace todo — varias personas con roles claros que rotan. Esta semana coordina Juan, la próxima María, la siguiente Pedro. Si alguien falta, el proyecto sigue.
  </li>
  <li>
    <strong>Ritual de encuentro:</strong><br />
    Reunión fija: mismo día, misma hora, mismo lugar, todas las semanas o quincenas. El ritual crea hábito, y el hábito crea continuidad. Si las reuniones son "cuando podamos", nunca pueden.
  </li>
  <li>
    <strong>Métricas simples:</strong><br />
    3 números que midan el avance. Ejemplo para la huerta: metros cuadrados plantados, familias beneficiadas, kilos cosechados. Lo que se mide se mejora. Lo que no se mide se olvida.
  </li>
  <li>
    <strong>Celebración de hitos:</strong><br />
    Cada avance — por chico que sea — se celebra. Plantamos el primer surco: mate y tortas fritas. Cosechamos lo primero: foto grupal. Un mes funcionando: asado comunitario. La celebración es combustible emocional.
  </li>
  <li>
    <strong>Canal de ayuda:</strong><br />
    Saber a quién pedir ayuda ANTES de necesitarla. ¿Quién nos presta herramientas? ¿Quién sabe de esto? ¿Qué organización puede apoyarnos? Mapear aliados potenciales desde el día 1.
  </li>
</ol>

<h3>El ritmo es más importante que la velocidad</h3>

<p>Un proyecto que avanza lento pero se reúne todas las semanas es infinitamente más poderoso que uno que arranca rápido, se reúne "cuando se puede", y desaparece en un mes.</p>

<p><strong>El ritmo es como la temperatura del fuego del orfebre.</strong> Si es demasiado alto, quema todo rápido y se apaga. Si es demasiado bajo, no alcanza para refinar. El arte está en la temperatura justa: sostenida, constante, suficiente. Eso es lo que un buen diseño de proyecto logra — un fuego que no se apaga.</p>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Diseñá un mini-proyecto de 30 días para tu barrio usando los 6 elementos:<br /><br />
  1. <strong>Objetivo en una oración:</strong> _________________________________<br />
  2. <strong>Equipo mínimo (3 personas):</strong> _________________________________<br />
  3. <strong>Día y hora de reunión fija:</strong> _________________________________<br />
  4. <strong>3 métricas simples:</strong> _________________________________<br />
  5. <strong>Primer hito a celebrar:</strong> _________________________________<br />
  6. <strong>A quién pedir ayuda si lo necesitamos:</strong> _________________________________<br /><br />
  Solo 30 días. Un objetivo. 3 personas. Si funciona, lo renovás otros 30. Si no funciona, aprendiste algo valiosísimo en solo un mes.</p>
</blockquote>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 6: El arte de convocar
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'El arte de convocar — Mover gente sin manipularla',
      description: 'La diferencia entre convocar y manipular, por qué la gente se suma (y no se suma), y cómo inspirar sin mentir.',
      content: `
<h2>La convocatoria que funciona (y la que no)</h2>

<p>Ya tenés la idea. Ya tenés el diseño. Ahora necesitás gente. Y acá es donde muchos proyectos se traban: <em>"Nadie se quiere sumar."</em></p>

<p>Pero antes de quejarte de la gente, preguntate: <strong>¿cómo estás convocando?</strong> Porque hay formas de convocar que inspiran, y hay formas que espantan. La diferencia no es técnica — es humana.</p>

<h3>La gente no se suma a proyectos — se suma a personas</h3>

<p>Esto es lo más importante de esta lección, así que voy a decirlo dos veces: <strong>la gente no se suma a proyectos. Se suma a personas.</strong></p>

<p>Nadie lee un volante y dice "¡qué buen proyecto, me sumo!". Pero alguien que confía en vos, que te vio actuar con coherencia, que siente que lo respetás — esa persona se suma aunque el proyecto sea imperfecto. <strong>La confianza es la moneda de la acción comunitaria.</strong> Y la confianza se construye con un solo material: coherencia entre lo que decís y lo que hacés.</p>

<h3>Convocar vs. manipular</h3>

<p>Hay una línea que muchos proyectos cruzan sin darse cuenta:</p>

<p><strong>Convocar</strong> es decir: <em>"Esto es lo que estamos haciendo. Esto es lo que necesitamos. Si te interesa, sos bienvenido. Si no, no pasa nada."</em> Es una invitación abierta, honesta, sin presión.</p>

<p><strong>Manipular</strong> es generar culpa (<em>"Si no venís, no te importa el barrio"</em>), crear urgencia artificial (<em>"Es ahora o nunca"</em>), prometer lo que no podés cumplir (<em>"En 3 meses va a cambiar todo"</em>), o hacer que la gente sienta que no tiene opción.</p>

<p>La manipulación puede funcionar una vez. Pero destruye la confianza. Y cuando la confianza se rompe, <strong>no hay proyecto que sobreviva</strong>.</p>

<h3>La fórmula de la convocatoria auténtica</h3>

<p>Hay tres pasos que funcionan consistentemente, en cualquier contexto, con cualquier tipo de personas:</p>

<ol>
  <li>
    <strong>Contá tu historia personal:</strong><br />
    No empieces con el proyecto. Empezá con vos. <em>"Yo estaba cansado de ver el terreno baldío lleno de basura. Me daba bronca todos los días al pasar. Un día decidí que en vez de quejarme iba a hacer algo."</em> La gente se conecta con historias, no con propuestas. Tu vulnerabilidad es tu mejor herramienta de convocatoria.
  </li>
  <li>
    <strong>Escuchá la historia del otro:</strong><br />
    Antes de decirle qué puede hacer, preguntale qué le preocupa. <em>"¿Qué es lo que más te jode del barrio?"</em> <em>"¿Qué te gustaría que fuera diferente?"</em> Cuando escuchás primero, la otra persona siente que su voz importa. Y una persona que se siente escuchada es una persona que quiere participar.
  </li>
  <li>
    <strong>Encontrá la intersección:</strong><br />
    <em>"Resulta que a los dos nos preocupa lo mismo. ¿Y si hacemos algo juntos?"</em> No le estás pidiendo un favor. No le estás asignando una tarea. Le estás proponiendo una alianza entre iguales con una preocupación compartida. Eso se siente muy diferente a "necesito que me ayudes".
  </li>
</ol>

<h3>Lo que espanta a la gente</h3>

<p>Si la gente no se suma, antes de pensar "la gente no quiere participar", revisá si estás haciendo alguna de estas cosas:</p>

<ul>
  <li><strong>Reuniones eternas sin acción:</strong> Si la gente viene a reunirse, habla 2 horas, y se va sin haber decidido nada concreto, no va a volver. Las reuniones son para decidir y asignar, no para debatir infinitamente.</li>
  <li><strong>Un solo liderazgo que habla todo el tiempo:</strong> Si vos hablás el 80% de la reunión, la gente se siente espectadora, no protagonista. El arte es hablar menos del 30% del tiempo.</li>
  <li><strong>Falta de reconocimiento:</strong> Si alguien aporta algo y nadie lo registra, si alguien se esfuerza y nadie lo agradece — esa persona se va. El reconocimiento no cuesta nada y vale todo.</li>
  <li><strong>Falta de transparencia:</strong> Si hay decisiones que se toman a puertas cerradas, si no se comparten los problemas sino solo los logros, la gente desconfía. Y la desconfianza es el veneno de la acción comunitaria.</li>
</ul>

<h3>Sostener la participación en el tiempo</h3>

<p>Convocar es solo el primer paso. Sostener la participación en el tiempo es el verdadero arte:</p>

<ul>
  <li><strong>Dar roles significativos:</strong> Que cada persona sienta que su aporte es necesario, no decorativo. Si alguien no tiene rol, no tiene razón para venir.</li>
  <li><strong>Celebrar cada avance:</strong> No esperar al "éxito final" para reconocer. Celebrar el proceso: "Hoy vinimos 8 personas — eso ya es un logro."</li>
  <li><strong>Ser honestos con los problemas:</strong> Si algo salió mal, decilo. La gente no se va porque hay problemas — se va porque siente que le están ocultando los problemas.</li>
  <li><strong>Crear momentos humanos:</strong> No todo es trabajo y reuniones. Un mate, una charla, un festejo, una risa compartida. La comunidad se sostiene con vínculos, no con organigramas.</li>
</ul>

<blockquote>
  <p>Recordá: el crisol no solo soporta el fuego — contiene a la plata con cuidado. Convocar es construir el crisol: un espacio donde la gente se siente segura para transformarse junto a otros.</p>
</blockquote>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Pensá en la última vez que alguien te convocó a algo — un proyecto, una salida, una causa, un trabajo. ¿Cómo te hizo sentir esa convocatoria? ¿Te sentiste genuinamente invitado — libre de decir que sí o que no — o sentiste presión, culpa u obligación? Ahora pensá: cuando vos convocás a otros, ¿qué estás generando — invitación o presión? La respuesta está en cómo se siente la otra persona, no en cómo vos creés que se siente.</p>
</blockquote>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 7: Medir, aprender, iterar
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Medir, aprender, iterar — La reflexión en la acción',
      description: 'Sin medición no hay aprendizaje. 3 preguntas simples para evaluar cualquier proyecto y la bitácora como herramienta.',
      content: `
<h2>El pilar que conecta Acción con Visión</h2>

<p>Hay un pilar del Hombre Gris que muchos proyectos comunitarios se saltean por completo: <strong>la Reflexión</strong>. Y es exactamente por eso que tantos proyectos repiten los mismos errores, se agotan, o giran en círculos sin avanzar.</p>

<p>Acordate del orfebre: no solo enciende el fuego. Se queda <em>observando</em>. Mira cómo reacciona el metal. Ajusta la temperatura. Retira las impurezas cuando suben. Sin esa observación paciente, el fuego destruye en vez de refinar.</p>

<p><strong>Medir, aprender e iterar es la versión comunitaria de esa observación.</strong> Es parar cada tanto, mirar honestamente lo que está pasando, y ajustar el rumbo. No porque algo salió mal — sino porque todo proyecto necesita corrección de rumbo, siempre.</p>

<h3>Por qué medir importa (y por qué nos resistimos)</h3>

<p>Hay una resistencia enorme a medir en el mundo comunitario. <em>"No somos una empresa." "No todo se puede cuantificar." "Lo que hacemos es humano, no se mide con números."</em></p>

<p>Y es cierto que no todo se cuantifica. Pero medir no es "ponerle número a todo". <strong>Medir es hacerse preguntas honestas sobre si lo que estamos haciendo funciona.</strong> Y sin esas preguntas, nos quedan dos opciones: o repetimos ciegamente lo que venimos haciendo (aunque no funcione), o abandonamos sin saber si estábamos a un paso del éxito.</p>

<p>La resistencia a medir muchas veces esconde un miedo más profundo: <strong>el miedo a descubrir que algo no está funcionando</strong>. Pero ese descubrimiento no es un fracaso — es información. Y la información es exactamente lo que necesitamos para mejorar.</p>

<h3>Las 3 preguntas mágicas</h3>

<p>No necesitás un sistema de evaluación sofisticado. Necesitás 3 preguntas que tu equipo se haga cada 2 semanas o cada mes:</p>

<ol>
  <li>
    <strong>"¿Qué intentamos hacer?"</strong><br />
    Parece obvia, pero es reveladora. Muchas veces, después de un mes de acción, el equipo descubre que cada persona entendía algo distinto sobre el objetivo. Alinear la respuesta a esta pregunta es terapéutico.
  </li>
  <li>
    <strong>"¿Qué pasó realmente?"</strong><br />
    No lo que queríamos que pasara. No lo que le dijimos al público que pasó. Lo que <em>realmente</em> pasó. Con los éxitos y los fracasos. Con lo que salió bien y lo que salió horrible. Honestidad brutal, sin maquillaje.
  </li>
  <li>
    <strong>"¿Qué aprendimos y qué hacemos diferente?"</strong><br />
    Esta es la pregunta que transforma. No es suficiente saber qué pasó — hay que extraer el aprendizaje y traducirlo en acción. <em>"Aprendimos que las reuniones de 2 horas agotan. A partir de ahora, máximo 45 minutos."</em> Eso es iterar.
  </li>
</ol>

<blockquote>
  <p>Un proyecto que se hace estas 3 preguntas regularmente es un proyecto que aprende. Y un proyecto que aprende no muere — evoluciona.</p>
</blockquote>

<h3>La bitácora de aprendizaje</h3>

<p>La herramienta más subestimada del mundo comunitario: <strong>un cuaderno compartido donde se anotan los aprendizajes</strong>.</p>

<p>No los acta de la reunión (eso también, pero es diferente). No los logros para el informe. Los <strong>aprendizajes</strong>: lo que descubrimos que funciona, lo que descubrimos que no funciona, lo que nos sorprendió, lo que cambiaríamos si pudiéramos volver atrás.</p>

<p>Formato sugerido (5 minutos al final de cada reunión):</p>

<ul>
  <li><strong>Fecha:</strong> ____</li>
  <li><strong>¿Qué hicimos desde la última reunión?</strong> ____</li>
  <li><strong>¿Qué funcionó bien?</strong> ____</li>
  <li><strong>¿Qué no funcionó?</strong> ____</li>
  <li><strong>¿Qué aprendimos?</strong> ____</li>
  <li><strong>¿Qué vamos a hacer diferente?</strong> ____</li>
</ul>

<p>Parece simple. <strong>Es transformador.</strong> Porque cuando releés la bitácora después de 3 meses, ves el camino recorrido. Ves que los problemas del mes 1 ya se resolvieron. Ves patrones que no veías en el momento. Y ves, sobre todo, que estás avanzando — aunque en el día a día no siempre lo sientas.</p>

<h3>Métricas humanas (no solo números)</h3>

<p>Además de los números duros (familias atendidas, metros plantados, personas participando), hay métricas blandas que importan tanto o más:</p>

<ul>
  <li><strong>¿La gente vuelve?</strong> — Si sí, algo estamos haciendo bien. Si no, algo estamos haciendo mal.</li>
  <li><strong>¿La gente trae a otros?</strong> — El mejor indicador de impacto: cuando alguien le dice a un amigo "tenés que venir".</li>
  <li><strong>¿Cómo se siente el equipo?</strong> — Agotados, frustrados, solos... o energizados, conectados, esperanzados. El estado emocional del equipo es un termómetro que no mienten.</li>
  <li><strong>¿Estamos aprendiendo?</strong> — Si cada reunión es igual a la anterior, no estamos iterando. Si cada reunión es un poquito mejor que la anterior, estamos en camino.</li>
</ul>

<h3>Iterar: la acción inteligente</h3>

<p>Iterar significa: <strong>hacer, observar, ajustar, repetir</strong>. No es planificar todo de antemano y ejecutar a ciegas. Es avanzar un paso, mirar qué pasó, ajustar, y avanzar otro paso. Como el orfebre que ajusta el fuego con cada observación.</p>

<p>La iteración le quita presión a la acción: no necesitás acertar a la primera. Solo necesitás <strong>actuar, observar y mejorar</strong>. Si algo no funcionó, no es un fracaso — es un dato. Y los datos son oro para el próximo intento.</p>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Pensá en algún proyecto, iniciativa o esfuerzo que hayas hecho (puede ser personal, laboral o comunitario) que no haya salido como esperabas. Ahora hacete las 3 preguntas mágicas:<br /><br />
  1. ¿Qué intentabas hacer?<br />
  2. ¿Qué pasó realmente?<br />
  3. ¿Qué aprendiste — y qué harías diferente hoy?<br /><br />
  Si podés, escribí las respuestas. Vas a descubrir que el "fracaso" escondía un aprendizaje que no viste en su momento. Esa es la Reflexión en acción.</p>
</blockquote>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 20,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 8: De tu vereda al país
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'De tu vereda al país — La acción distribuida del Hombre Gris',
      description: 'Cómo las acciones locales se convierten en transformación nacional, el poder de la red, y la invitación final a actuar.',
      content: `
<h2>La ilusión del cambio centralizado</h2>

<p>Hay una fantasía que llevamos grabada en el ADN político argentino: <em>"Si tuviera poder, cambiaría todo."</em> La idea de que la transformación viene de arriba — de un presidente, un ministerio, un decreto, un plan maestro — y se derrama hacia abajo.</p>

<p>Pero pensalo un segundo: ¿cuántos presidentes tuvimos? ¿Cuántos planes maestros? ¿Cuántos decretos, leyes, reformas? <strong>¿Y cuánto cambió realmente la vida en tu cuadra?</strong></p>

<p>No es que el Estado no importe. Importa. Pero la transformación más profunda, más duradera, más difícil de revertir no viene de un escritorio en la Casa Rosada. <strong>Viene de millones de acciones pequeñas, sostenidas, distribuidas, que se acumulan hasta ser imparables.</strong></p>

<h3>El poder de la red</h3>

<p>Pensá en cómo funciona Internet. No hay un centro. No hay una computadora que controle todo. Hay millones de nodos conectados, cada uno haciendo su parte, y la suma de todos genera algo que ningún nodo individual podría lograr.</p>

<p>El Hombre Gris funciona igual. <strong>No es un líder central que coordina todo. Es una red de personas y comunidades, cada una actuando en su territorio, conectadas por una visión compartida.</strong></p>

<p>Cada nodo de la red es un barrio, un grupo de vecinos, un proyecto comunitario. Y cada nodo tiene una propiedad extraordinaria: <strong>cuando se activa, activa a otros</strong>. No porque los coordine ni les dé órdenes — sino porque su ejemplo es contagioso.</p>

<p>El vecino que ve que limpiaste la plaza se pregunta: "¿Y si limpio mi vereda?" La vecina que ve la huerta comunitaria piensa: "¿Y si hacemos algo así en nuestra cuadra?" El pibe que ve al grupo de vecinos organizados dice: "Yo también quiero ser parte de algo." <strong>La acción es el virus más contagioso que existe.</strong></p>

<h3>De tu vereda al barrio, del barrio a la ciudad, de la ciudad al país</h3>

<p>La transformación escala naturalmente cuando está bien enraizada:</p>

<ol>
  <li>
    <strong>Tu vereda:</strong> Empezás solo o con 2-3 personas. Una acción concreta. Un problema resuelto. Un espacio mejorado. Esto genera confianza interna: <em>"Puedo hacer algo."</em>
  </li>
  <li>
    <strong>Tu manzana/cuadra:</strong> Los vecinos ven lo que hacés. Algunos preguntan. Algunos se suman. El núcleo crece. Aparecen nuevos problemas que abordar, nuevas habilidades que descubrir. Esto genera comunidad: <em>"Podemos hacer algo juntos."</em>
  </li>
  <li>
    <strong>Tu barrio:</strong> Varios grupos de vecinos empiezan a conectarse. Comparten experiencias, herramientas, contactos. Lo que aprendió un grupo le sirve a otro. Esto genera red: <em>"No estamos solos."</em>
  </li>
  <li>
    <strong>Tu ciudad:</strong> Las redes barriales se encuentran. Descubren que enfrentan problemas similares. Empiezan a coordinar acciones más grandes: presión al municipio, proyectos inter-barriales, ferias comunitarias. Esto genera movimiento: <em>"Somos muchos."</em>
  </li>
  <li>
    <strong>Tu país:</strong> Cuando hay redes activas en cientos de ciudades, con miles de proyectos funcionando, compartiendo aprendizajes y visión... eso ya no es un proyecto comunitario. <strong>Es una transformación nacional distribuida.</strong> Y eso es exactamente lo que las psicografías de Parravicini describían: no un líder salvador, sino un pueblo que se levanta desde abajo.
  </li>
</ol>

<h3>Conectar acciones: el multiplicador</h3>

<p>Tu proyecto individual es valioso. Pero tu proyecto conectado con otros es exponencialmente más poderoso. ¿Cómo conectar?</p>

<ul>
  <li><strong>Compartí lo que hacés:</strong> No por vanidad — por servicio. Si tu huerta funciona, contá cómo la hiciste. Si tu grupo resolvió un problema, compartí el método. El conocimiento compartido se multiplica.</li>
  <li><strong>Visitá lo que otros hacen:</strong> Andá a ver proyectos de otros barrios. Aprendé de ellos. Llevá ideas de vuelta. La polinización cruzada entre proyectos es la forma más rápida de mejorar.</li>
  <li><strong>Creá alianzas concretas:</strong> No alianzas teóricas ("somos aliados") sino prácticas. "Nosotros les prestamos herramientas, ustedes nos ayudan con la difusión." Alianzas con intercambio real.</li>
  <li><strong>Celebrá los logros de otros:</strong> Cuando otro proyecto avanza, celebralo como si fuera tuyo. En la red del Hombre Gris, el éxito de uno es el éxito de todos. No hay competencia — hay co-creación.</li>
</ul>

<h3>La plata no se refina en un escritorio</h3>

<p>Llegaste al final de este curso. Y la conclusión es simple y radical a la vez:</p>

<p><strong>La plata no se refina desde un escritorio. Se refina en el fuego. Y el fuego se enciende con las manos.</strong></p>

<p>No con las manos de un funcionario. No con las manos de un líder carismático. No con las manos de un experto. <strong>Con tus manos.</strong> Las mismas manos que están sosteniendo el teléfono o el teclado en este momento.</p>

<p>Tenés la etimología: sabés que <em>agere</em> significa mover, conducir, llevar adelante. Sabés que sos un agente — alguien que actúa, no que mira. Tenés el diagnóstico: sabés por qué la inacción se disfraza de excusa. Tenés las herramientas: sabés mapear activos, diseñar proyectos, convocar, medir, iterar. Tenés la red: sabés que no estás solo, que cada acción local se suma a una transformación mayor.</p>

<p>Ahora solo falta una cosa: <strong>que actúes</strong>.</p>

<blockquote>
  <p><em>El humus te hizo humano.<br />
  El gris te dio la complejidad.<br />
  La visión te mostró la plata.<br />
  El fuego te espera.<br /><br />
  Pero el fuego no se enciende solo.<br />
  Necesita tus manos, tu barrio, tu coraje imperfecto.<br /><br />
  No mañana. No cuando estés listo. No cuando alguien te dé permiso.<br />
  <strong>Ahora. Desde tus 3 metros. Con lo que tenés. Con quien tengas al lado.</strong><br /><br />
  Eso es agere. Eso es acción. Eso es el Hombre Gris en movimiento.</em></p>
</blockquote>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },
  ];

  // Insert all lessons
  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log(`✅ Creadas ${lessons.length} lecciones nuevas`);

  // ═══════════════════════════════════════════════════════════════
  // QUIZ EXPANDIDO — 12 preguntas
  // ═══════════════════════════════════════════════════════════════

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId: course.id,
    title: 'Quiz: Acción Comunitaria',
    description: 'Evaluá tu comprensión del viaje completo: de la etimología de agere a la acción distribuida del Hombre Gris.',
    passingScore: 70,
    timeLimit: 20,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿De qué verbo latino proviene la palabra "acción"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Audire (escuchar)',
        'Agere (hacer, mover, conducir)',
        'Vidēre (ver)',
        'Sentire (sentir)'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Acción viene de actio, que a su vez viene de agere: hacer, mover, conducir. De la misma raíz nacen agente, agenda, agitar y protagonista.',
      points: 2,
      orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la diferencia clave entre reaccionar y actuar según el curso?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Reaccionar es más rápido que actuar',
        'Actuar es automático; reaccionar es deliberado',
        'Reaccionar es responder a lo externo; actuar es iniciar desde adentro con dirección propia',
        'No hay diferencia significativa'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'Reaccionar es ser movido por las circunstancias (respuesta automática). Actuar es mover las circunstancias desde una decisión interna con dirección elegida.',
      points: 2,
      orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: 'El "activismo de sofá" genera cambios reales equivalentes a la acción comunitaria.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'El activismo digital genera la ilusión de acción (dopamina, validación) pero no cambia nada en el mundo real. La indignación online no es acción — es reacción.',
      points: 1,
      orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Qué propone la "regla de los 3 metros"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Mantener 3 metros de distancia en reuniones',
        'Mejorar lo que está a 3 metros de donde estás — si todos lo hacen, el país cambia',
        'Caminar 3 metros por día como ejercicio',
        'Limitar los proyectos a un radio de 3 metros'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La regla de los 3 metros dice: mirá lo que está inmediatamente a tu alrededor y mejoralo. Si 45 millones de personas mejoran sus 3 metros, el país entero se transforma.',
      points: 2,
      orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: '¿Qué enfoque propone preguntar "¿qué ya tenemos?" en vez de "¿qué nos falta?"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Enfoque de carencias',
        'Enfoque de subsidios',
        'Enfoque de activos comunitarios (ABCD)',
        'Enfoque de demanda externa'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Asset-Based Community Development (ABCD) de McKnight y Kretzmann propone mapear los activos existentes (personas, organizaciones, espacios, redes, historias) antes de buscar ayuda externa.',
      points: 2,
      orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: 'El mapeo comunitario más efectivo se hace con encuestas digitales anónimas.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'La mejor herramienta de mapeo es la conversación cara a cara: golpear puertas, tomar mate, preguntar "¿en qué sos bueno?" y "¿qué te gustaría mejorar?". Eso revela más que cualquier encuesta.',
      points: 1,
      orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la principal causa de muerte de proyectos comunitarios según el curso?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Falta de dinero',
        'Oposición del gobierno',
        'Falta de diseño: objetivo difuso, dependencia de una persona, no medir ni celebrar',
        'Falta de tecnología'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'Los proyectos no mueren por falta de recursos sino por falta de diseño: objetivos vagos, dependencia de una sola persona, no medir avances, no celebrar logros pequeños, y no pedir ayuda a tiempo.',
      points: 2,
      orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: '¿Cuáles son las 3 preguntas para evaluar cualquier proyecto comunitario?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        '¿Cuánto costó? ¿Quién pagó? ¿Sobró plata?',
        '¿Qué intentamos hacer? ¿Qué pasó realmente? ¿Qué aprendimos?',
        '¿Quién lideró? ¿Quién falló? ¿Quién tiene la culpa?',
        '¿Fue exitoso? ¿Se puede repetir? ¿Cuánto durará?'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Las 3 preguntas mágicas son: ¿Qué intentamos hacer? ¿Qué pasó realmente? ¿Qué aprendimos y qué hacemos diferente? Transforman fracasos en aprendizajes y proyectos en organismos que evolucionan.',
      points: 2,
      orderIndex: 8,
    },
    {
      quizId: quiz.id,
      question: 'La gente se suma a proyectos cuando entiende la propuesta técnica.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'La gente no se suma a proyectos — se suma a personas. La confianza, construida con coherencia entre lo que se dice y lo que se hace, es la moneda de la acción comunitaria.',
      points: 2,
      orderIndex: 9,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la diferencia entre convocar y manipular?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Convocar usa redes sociales; manipular usa medios tradicionales',
        'Convocar invita con honestidad y libertad; manipular usa culpa, presión o promesas falsas',
        'No hay diferencia — ambas buscan que la gente participe',
        'Manipular es más efectivo a largo plazo'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Convocar es una invitación abierta y honesta donde la persona es libre de aceptar o no. Manipular usa culpa, urgencia artificial o promesas incumplibles. La manipulación destruye la confianza.',
      points: 2,
      orderIndex: 10,
    },
    {
      quizId: quiz.id,
      question: 'En la metáfora del refinamiento de plata, ¿qué representa la Acción?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'El mineral sin refinar',
        'El crisol que contiene la plata',
        'Encender el fuego — sin fuego no hay refinamiento',
        'El reflejo en la plata terminada'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'La Visión es ver la plata dentro del mineral. La Acción es encender el fuego. Sin fuego no hay refinamiento. Sin acción, la plata queda gris para siempre.',
      points: 2,
      orderIndex: 11,
    },
    {
      quizId: quiz.id,
      question: '¿Cómo describe el curso la transformación del Hombre Gris a nivel nacional?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Un líder central que coordina todas las acciones',
        'Una ley del Congreso que establece el movimiento',
        'Una red distribuida de acciones locales que se conectan y se multiplican',
        'Una revolución organizada desde una capital'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Hombre Gris no es un líder central. Es una red distribuida: cada persona y comunidad actúa en su territorio, conectada por visión compartida. Cuando la acción se vuelve contagiosa, la transformación es imparable.',
      points: 2,
      orderIndex: 12,
    },
  ];

  for (const question of questions) {
    await db.insert(quizQuestions).values(question);
  }
  console.log(`✅ Creadas ${questions.length} preguntas de quiz`);

  console.log('\n🔥 ¡Curso "Acción Comunitaria" actualizado exitosamente!');
  console.log('📊 8 lecciones | 12 preguntas de quiz | ~195 minutos de contenido');
  console.log('📖 Arco narrativo: Agere → Mover → Construir → Sostener');
}

main().catch(console.error).finally(() => process.exit(0));
