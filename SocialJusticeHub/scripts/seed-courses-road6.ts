import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse16(authorId: number) {
  console.log('--- Course 16: Inteligencia Emocional para Tiempos Turbulentos ---');
  let course16 = await db.select().from(courses).where(eq(courses.slug, 'inteligencia-emocional-tiempos-turbulentos')).limit(1);

  if (course16.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Inteligencia Emocional para Tiempos Turbulentos',
      slug: 'inteligencia-emocional-tiempos-turbulentos',
      description: 'Herramientas prácticas de inteligencia emocional diseñadas para navegar la inestabilidad crónica argentina. Aprende a regular tu sistema nervioso, transformar la reactividad en respuesta consciente y construir resiliencia emocional genuina en un contexto donde el estrés es la norma.',
      excerpt: 'Domina tus emociones en tiempos de crisis: herramientas prácticas de inteligencia emocional para la Argentina real.',
      category: 'reflection',
      level: 'beginner',
      duration: 300,
      thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
      orderIndex: 16,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course16 = [newCourse];
    console.log('Created course 16:', course16[0].title);
  } else {
    console.log('Found existing course 16:', course16[0].title);
  }

  const courseId = course16[0].id;

  // Delete existing lessons
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));
  console.log('Reset lessons for course 16');

  const lessons16 = [
    {
      courseId,
      title: '¿Qué Son las Emociones y Cómo Funcionan en Tu Cuerpo?',
      description: 'Comprende la base neurofisiológica de las emociones y por qué tu cuerpo reacciona antes que tu mente.',
      content: `
        <h2>Las Emociones: Tu Sistema de Navegación Interior</h2>
        <p>Antes de poder gestionar tus emociones, necesitas entender qué son realmente. Las emociones no son caprichos ni debilidades: son <strong>señales biológicas</strong> que tu cuerpo produce para ayudarte a sobrevivir y prosperar. Son tan reales como el hambre o la sed, y negarlas tiene consecuencias tan graves como ignorar el dolor físico.</p>

        <h3>La Neurociencia Básica de las Emociones</h3>
        <p>Tu cerebro tiene tres capas principales que interactúan constantemente:</p>
        <ul>
          <li><strong>El cerebro reptiliano (tronco encefálico):</strong> Controla las funciones básicas de supervivencia. Es el que te hace saltar cuando escuchas un ruido fuerte. En Argentina, es el que se activa cada vez que escuchas "devaluación" o "corralito".</li>
          <li><strong>El cerebro emocional (sistema límbico):</strong> La amígdala, el hipocampo y otras estructuras procesan tus experiencias emocionales. Aquí se almacenan las memorias cargadas de emoción, desde la alegría de un gol de la selección hasta el terror de una crisis económica.</li>
          <li><strong>La corteza prefrontal:</strong> Es tu capacidad de reflexión, planificación y regulación. Es la parte que puede decir "espera, no reacciones todavía". Pero bajo estrés crónico, esta parte se <em>apaga parcialmente</em>.</li>
        </ul>

        <blockquote>"El Hombre Gris no niega sus emociones: las integra. La metamorfosis del Camello al León comienza cuando dejamos de cargar con emociones que no hemos procesado." — Filosofía del Hombre Gris</blockquote>

        <h3>El Mapa Corporal de las Emociones</h3>
        <p>Investigaciones de la Universidad de Aalto demostraron que las emociones tienen <strong>firmas corporales universales</strong>:</p>
        <ul>
          <li><strong>La ira</strong> se siente como calor en el pecho, los brazos y la cabeza. Las manos se cierran, la mandíbula se tensa.</li>
          <li><strong>El miedo</strong> genera un nudo en el estómago, las piernas se debilitan, el corazón se acelera.</li>
          <li><strong>La tristeza</strong> produce una sensación de pesadez en el pecho, los hombros caen, la energía baja.</li>
          <li><strong>La alegría</strong> se expande por todo el cuerpo, hay ligereza, el pecho se abre.</li>
          <li><strong>La ansiedad</strong> crea tensión en el cuello, hombros y mandíbula, con un zumbido constante de energía nerviosa.</li>
        </ul>

        <h3>Ejercicio Práctico: El Escaneo Corporal de 5 Minutos</h3>
        <p>Este ejercicio es la base de toda inteligencia emocional. Practícalo una vez al día durante esta semana:</p>
        <ol>
          <li>Sentate cómodo y cierra los ojos.</li>
          <li>Recorre tu cuerpo desde los pies hasta la cabeza.</li>
          <li>En cada zona, preguntate: "¿Qué siento aquí? ¿Tensión? ¿Calor? ¿Nada?"</li>
          <li>No intentes cambiar nada. Solo observa y nombra.</li>
          <li>Cuando termines, preguntate: "¿Qué emoción podría estar conectada con estas sensaciones?"</li>
        </ol>

        <h3>¿Por Qué Importa Esto en Argentina?</h3>
        <p>Vivir en un país con <strong>inestabilidad crónica</strong> significa que tu sistema nervioso está sometido a un estrés que la mayoría de los manuales de psicología no contemplan. No es el estrés de un examen o una mudanza: es el estrés de no saber si tu sueldo va a alcanzar el mes que viene, de ver cómo tus ahorros se evaporan, de sentir que las reglas del juego cambian cada pocos años.</p>
        <p>Este tipo de estrés <em>crónico y sistémico</em> altera literalmente la estructura de tu cerebro. La amígdala se agranda (más reactividad), la corteza prefrontal se adelgaza (menos capacidad de regulación). Por eso no es "debilidad" sentirte abrumado: es <strong>biología</strong>.</p>
        <p>La buena noticia: el cerebro es plástico. Puede cambiar. Y las herramientas que vas a aprender en este curso están diseñadas para esa realidad específica.</p>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Respuesta de Estrés en una Economía Crónicamente Inestable',
      description: 'Entiende cómo la inestabilidad económica argentina programa tu sistema nervioso y qué hacer al respecto.',
      content: `
        <h2>Tu Sistema Nervioso en la Argentina Real</h2>
        <p>El estrés no es solo una palabra de moda. Es una <strong>respuesta fisiológica concreta</strong> que tu cuerpo activa para protegerte. El problema no es el estrés en sí, sino cuando se vuelve <em>crónico</em>. Y en Argentina, la cronicidad es la norma.</p>

        <h3>Las Tres Respuestas al Estrés</h3>
        <p>Tu sistema nervioso autónomo tiene tres modos principales, según la teoría polivagal del Dr. Stephen Porges:</p>
        <ol>
          <li><strong>Modo Seguro (ventral vagal):</strong> Estás tranquilo, conectado, puedes pensar con claridad. Podes ser creativo, empático, colaborar. Es el estado desde el que el Hombre Gris construye.</li>
          <li><strong>Modo Lucha/Huida (simpático):</strong> Tu cuerpo se prepara para pelear o escapar. El corazón se acelera, los músculos se tensan, la digestión se detiene. Es útil en una emergencia real, pero devastador cuando es permanente.</li>
          <li><strong>Modo Colapso (dorsal vagal):</strong> Cuando el estrés es demasiado, tu sistema se apaga. Aparece la apatía, la desconexión, el "ya fue, no se puede hacer nada". Muchos argentinos viven aquí sin saberlo.</li>
        </ol>

        <blockquote>"La transformación del Camello —el que carga con todo sin cuestionar— comienza cuando reconoces que tu agotamiento no es pereza: es un sistema nervioso saturado pidiendo auxilio."</blockquote>

        <h3>El Estrés Económico Argentino: Un Caso Especial</h3>
        <p>La psicología convencional estudia el estrés como algo puntual: un despido, un divorcio, una enfermedad. Pero el estrés argentino tiene características únicas:</p>
        <ul>
          <li><strong>Es impredecible:</strong> No sabes cuándo viene la próxima crisis. Esto genera un estado de alerta permanente que es más dañino que un evento traumático único.</li>
          <li><strong>Es sistémico:</strong> No depende de tus decisiones individuales. Podes hacer todo "bien" y aún así perder tus ahorros. Esto genera indefensión aprendida.</li>
          <li><strong>Es transgeneracional:</strong> Tus padres y abuelos pasaron por lo mismo. El estrés se transmite epigenéticamente y a través de patrones familiares.</li>
          <li><strong>Es normalizado:</strong> "Acá siempre fue así" funciona como mecanismo de negación colectiva.</li>
        </ul>

        <h3>Los Síntomas que Nadie Conecta con el Estrés Económico</h3>
        <p>Muchos argentinos experimentan estos síntomas sin conectarlos con la inestabilidad:</p>
        <ul>
          <li>Insomnio o sueño no reparador</li>
          <li>Irritabilidad crónica ("estoy con los cables pelados")</li>
          <li>Problemas digestivos (gastritis, colon irritable)</li>
          <li>Dificultad para concentrarse o tomar decisiones</li>
          <li>Tensión muscular crónica, especialmente en cuello y hombros</li>
          <li>Sensación de estar siempre "en guardia"</li>
        </ul>

        <h3>Ejercicio: Identifica Tu Modo Dominante</h3>
        <p>Durante los próximos tres días, registra en qué modo te encontrás la mayor parte del tiempo:</p>
        <ol>
          <li>Al despertar, antes de mirar el celular: ¿cómo está tu cuerpo?</li>
          <li>Después de leer noticias económicas: ¿qué cambia?</li>
          <li>En el trabajo: ¿estás en modo seguro, lucha/huida o colapso?</li>
          <li>A la noche: ¿podes relajarte o tu mente sigue acelerada?</li>
        </ol>
        <p>No juzgues lo que encuentres. <strong>Observar es el primer paso para cambiar.</strong> En la filosofía del Hombre Gris, el Niño —la tercera metamorfosis— es pura presencia y observación sin juicio.</p>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Autoconciencia: El Primer Paso de la Inteligencia Emocional',
      description: 'Desarrolla la capacidad de observar tus estados internos sin reaccionar automáticamente.',
      content: `
        <h2>El Arte de Conocerte Sin Mentirte</h2>
        <p>La autoconciencia emocional es la <strong>piedra angular</strong> de toda inteligencia emocional. Sin ella, todo lo demás —regulación, empatía, comunicación— es construcción sobre arena. Y en Argentina, donde la cultura nos enseña a "bancársela" o a explotar, la autoconciencia es un acto casi revolucionario.</p>

        <h3>¿Qué Es Realmente la Autoconciencia Emocional?</h3>
        <p>No es simplemente saber que "estás enojado". Es un proceso de tres capas:</p>
        <ol>
          <li><strong>Reconocer la emoción en tiempo real:</strong> "Estoy sintiendo ira ahora mismo."</li>
          <li><strong>Entender el gatillo:</strong> "Esta ira apareció cuando leí que aumentaron las tarifas otra vez."</li>
          <li><strong>Identificar el patrón:</strong> "Cada vez que siento que pierdo control sobre mi economía, reacciono con ira porque debajo hay miedo."</li>
        </ol>

        <blockquote>"Conocete a ti mismo" no es un consejo abstracto. Es la herramienta más práctica que existe. El Hombre Gris que no se conoce a sí mismo termina repitiendo los mismos ciclos que dice querer romper.</blockquote>

        <h3>Los Cuatro Dominios de la Autoconciencia</h3>
        <ul>
          <li><strong>Autoconciencia corporal:</strong> ¿Dónde siento la emoción en mi cuerpo? ¿Qué me está diciendo mi cuerpo que mi mente todavía no registró?</li>
          <li><strong>Autoconciencia emocional:</strong> ¿Qué estoy sintiendo exactamente? ¿Es enojo o es frustración? ¿Es tristeza o es decepción? La precisión importa.</li>
          <li><strong>Autoconciencia cognitiva:</strong> ¿Qué pensamientos acompañan esta emoción? ¿Son hechos o interpretaciones? ¿Estoy catastrofizando?</li>
          <li><strong>Autoconciencia relacional:</strong> ¿Cómo afecta mi estado emocional a las personas que me rodean? ¿Estoy descargando mi estrés en quienes no tienen nada que ver?</li>
        </ul>

        <h3>Vocabulario Emocional: Expandir Tu Diccionario Interior</h3>
        <p>La mayoría de las personas operan con un vocabulario emocional de 5-10 palabras: bien, mal, contento, enojado, triste. Pero existen más de 300 emociones diferenciables. Cuantas más puedas nombrar, mejor podrás gestionarlas.</p>
        <p>En vez de "estoy mal", intentar precisar:</p>
        <ul>
          <li>¿Es <em>frustración</em> (quiero algo y no puedo lograrlo)?</li>
          <li>¿Es <em>impotencia</em> (siento que no puedo cambiar nada)?</li>
          <li>¿Es <em>desilusión</em> (esperaba algo diferente)?</li>
          <li>¿Es <em>agotamiento</em> (no me queda energía)?</li>
          <li>¿Es <em>vergüenza</em> (siento que fallé)?</li>
          <li>¿Es <em>nostalgia</em> (extraño algo que ya no está)?</li>
        </ul>

        <h3>El Diario Emocional del Hombre Gris</h3>
        <p>Herramienta práctica para desarrollar autoconciencia. Cada noche, durante 10 minutos, responde:</p>
        <ol>
          <li><strong>¿Cuál fue mi emoción dominante hoy?</strong> (nombrarla con precisión)</li>
          <li><strong>¿Qué la gatilló?</strong> (evento externo o pensamiento interno)</li>
          <li><strong>¿Cómo reaccioné?</strong> (sin juzgar, solo describir)</li>
          <li><strong>¿Cómo me hubiera gustado responder?</strong> (la brecha entre reacción y respuesta deseada)</li>
          <li><strong>¿Qué puedo aprender de esto?</strong> (el grano de oro de cada experiencia emocional)</li>
        </ol>

        <h3>Trampas Comunes de la Autoconciencia en Argentina</h3>
        <p>Cuidado con estos obstáculos culturales:</p>
        <ul>
          <li><strong>"Los hombres no lloran":</strong> La cultura machista niega la mitad del espectro emocional masculino. El Hombre Gris abraza la vulnerabilidad como fortaleza.</li>
          <li><strong>"No seas exagerado/a":</strong> Minimizar las emociones ajenas (y propias) es una forma de violencia sutil.</li>
          <li><strong>"Hay gente que está peor":</strong> Comparar el sufrimiento no lo elimina, solo le agrega culpa.</li>
          <li><strong>"Sos re intenso/a":</strong> Sentir profundamente no es un defecto. Es información valiosa.</li>
        </ul>
        <p>La autoconciencia es un músculo. Se fortalece con práctica diaria. No busques la perfección: busca la <strong>honestidad contigo mismo</strong>.</p>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Regulación Emocional: Del Modo Reactivo al Modo Responsivo',
      description: 'Aprende técnicas concretas para pasar de la reacción automática a la respuesta consciente.',
      content: `
        <h2>De Reaccionar a Responder: La Diferencia que Transforma</h2>
        <p>Hay una diferencia fundamental entre <strong>reaccionar</strong> y <strong>responder</strong>. Reaccionar es automático, instantáneo, gobernado por la amígdala. Responder requiere una pausa, un espacio entre el estímulo y tu acción. En ese espacio está tu libertad.</p>

        <h3>La Ventana de Tolerancia</h3>
        <p>El psicólogo Dan Siegel desarrolló el concepto de la <em>ventana de tolerancia</em>: el rango de activación emocional dentro del cual podes funcionar bien. Cuando estás dentro de tu ventana:</p>
        <ul>
          <li>Podes pensar con claridad</li>
          <li>Podes escuchar al otro</li>
          <li>Podes tomar decisiones razonables</li>
          <li>Podes ser creativo y colaborativo</li>
        </ul>
        <p>Cuando salís por arriba (hiperactivación): iras, pánico, agitación. Cuando salís por abajo (hipoactivación): apatía, desconexión, shutdown. El objetivo no es nunca salir de la ventana —eso es imposible— sino <strong>ampliarla</strong> y <strong>volver más rápido</strong>.</p>

        <blockquote>"La metamorfosis del León —el que ruge contra lo injusto— solo es efectiva si el rugido nace de la claridad, no del desborde. Un León desregulado destruye lo que quiere proteger."</blockquote>

        <h3>Técnica 1: La Pausa de los 90 Segundos</h3>
        <p>La neurocientífica Jill Bolte Taylor descubrió que una emoción tarda <strong>90 segundos</strong> en recorrer tu cuerpo como reacción química. Después de eso, si la emoción persiste, es porque la estás realimentando con tus pensamientos.</p>
        <ol>
          <li>Cuando sientas una emoción intensa, mira el reloj.</li>
          <li>Respira profundo y observa la sensación en tu cuerpo.</li>
          <li>No hagas nada durante 90 segundos.</li>
          <li>Después de ese tiempo, preguntate: "¿Qué quiero hacer ahora, desde la claridad?"</li>
        </ol>

        <h3>Técnica 2: El Anclaje Sensorial (Grounding)</h3>
        <p>Cuando el estrés te saca de tu ventana de tolerancia, esta técnica te trae al presente:</p>
        <ul>
          <li><strong>5 cosas que ves</strong> (nombrarlas en voz alta si es posible)</li>
          <li><strong>4 cosas que tocas</strong> (sentir la textura, la temperatura)</li>
          <li><strong>3 cosas que escuchas</strong> (sonidos cercanos y lejanos)</li>
          <li><strong>2 cosas que oles</strong> (aunque sea sutil)</li>
          <li><strong>1 cosa que saboreas</strong> (el gusto en tu boca)</li>
        </ul>

        <h3>Técnica 3: La Respiración 4-7-8</h3>
        <p>Esta técnica activa directamente tu sistema parasimpático (el freno de tu sistema nervioso):</p>
        <ol>
          <li>Inhala por la nariz contando hasta 4</li>
          <li>Retené el aire contando hasta 7</li>
          <li>Exhala por la boca contando hasta 8</li>
          <li>Repetí 4 veces</li>
        </ol>
        <p>Podes usarla antes de una reunión difícil, después de leer noticias que te alteran, o cuando sentís que estás a punto de decir algo de lo que te vas a arrepentir.</p>

        <h3>Técnica 4: El Reetiquetado Cognitivo</h3>
        <p>Cambiar la narrativa interna sin negar la emoción:</p>
        <ul>
          <li>En vez de "esto es un desastre" → "esto es difícil y puedo buscar opciones"</li>
          <li>En vez de "siempre pasa lo mismo" → "esto ya pasó antes y lo sobreviví"</li>
          <li>En vez de "este país no tiene arreglo" → "hay cosas que puedo cambiar desde mi lugar"</li>
        </ul>
        <p>Esto no es "pensamiento positivo tóxico". Es <strong>precisión cognitiva</strong>: distinguir entre hechos e interpretaciones catastróficas.</p>

        <h3>Aplicación: La Regulación en Contexto Argentino</h3>
        <p>Situaciones típicas donde aplicar estas herramientas:</p>
        <ul>
          <li>Cuando abris la app del banco y ves que tu plata vale menos</li>
          <li>En discusiones políticas en la mesa familiar</li>
          <li>Cuando tu jefe te pide "un esfuercito más" sin compensación</li>
          <li>Cuando lees las redes sociales y sentís indignación</li>
        </ul>
        <p>La regulación emocional no te convierte en un robot: te convierte en alguien que <strong>elige</strong> cómo canalizar su energía emocional.</p>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tus Gatillos Emocionales: Dinero, Política y Familia',
      description: 'Identifica y trabaja con los tres grandes gatillos emocionales de la vida argentina.',
      content: `
        <h2>Los Tres Campos Minados Emocionales</h2>
        <p>En Argentina, hay tres temas que activan el sistema límbico más rápido que cualquier otra cosa: <strong>el dinero, la política y la familia</strong>. No es casualidad: los tres están profundamente conectados con nuestra identidad, nuestra seguridad y nuestro sentido de pertenencia.</p>

        <h3>Gatillo 1: El Dinero</h3>
        <p>Para la mayoría de los argentinos, el dinero no es solo un medio de intercambio. Es un <strong>campo de batalla emocional</strong> cargado de trauma transgeneracional:</p>
        <ul>
          <li><strong>Hiperinflaciones:</strong> Tus padres o abuelos vieron cómo su dinero se volvía papel. Eso deja una marca que se transmite.</li>
          <li><strong>Corralitos:</strong> La traición del sistema financiero genera una desconfianza visceral que afecta todas tus decisiones económicas.</li>
          <li><strong>El dólar como obsesión:</strong> Mirar la cotización del dólar es un ritual argentino que activa cortisol como pocas cosas.</li>
        </ul>
        <p>Ejercicio: Escribe tu <em>historia personal con el dinero</em>. ¿Qué aprendiste de tu familia sobre el dinero? ¿Qué frases se repetían? ("La plata no alcanza", "Hay que guardar por las dudas", "Los ricos son todos chorros"). Estas creencias operan como programas automáticos en tu sistema emocional.</p>

        <h3>Gatillo 2: La Política</h3>
        <p>La famosa "grieta" no es solo un fenómeno político: es un <strong>fenómeno emocional</strong>. Cuando discutís de política, no estás debatiendo ideas: estás defendiendo tu identidad.</p>
        <ul>
          <li><strong>Identidad tribal:</strong> "Yo soy de X" se siente como "yo soy X". Un ataque a tu posición política se procesa como un ataque personal.</li>
          <li><strong>Razonamiento motivado:</strong> Tu cerebro busca confirmar lo que ya crees, no descubrir la verdad. Esto no es estupidez: es biología.</li>
          <li><strong>El secuestro amigdalar:</strong> En una discusión política acalorada, tu corteza prefrontal se apaga. Literalmente perdés la capacidad de pensar bien.</li>
        </ul>

        <blockquote>"El Hombre Gris no es de ningún bando. No porque sea tibio, sino porque ve lo que cada bando no puede ver de sí mismo. El gris integra: no divide."</blockquote>

        <h3>Gatillo 3: La Familia</h3>
        <p>La familia argentina es simultáneamente el mayor soporte emocional y el mayor campo de activación:</p>
        <ul>
          <li><strong>Roles rígidos:</strong> "El hijo que tiene que triunfar", "la hija que tiene que cuidar", "el hermano oveja negra". Estos roles generan presión emocional crónica.</li>
          <li><strong>Lealtades invisibles:</strong> Sentir que "traicionas" a tu familia por pensar diferente, vivir diferente o elegir un camino propio.</li>
          <li><strong>Comunicación indirecta:</strong> Decir las cosas "por atrás", usar el humor sarcástico para expresar dolor, los silencios cargados de significado.</li>
          <li><strong>El asado como arena política:</strong> El clásico almuerzo familiar donde se mezclan afecto, crítica, política y drama en proporciones impredecibles.</li>
        </ul>

        <h3>Mapa de Gatillos Personal</h3>
        <p>Herramienta práctica para cada uno de los tres campos:</p>
        <ol>
          <li><strong>Identifica tu gatillo específico:</strong> No es "la política" en general. Es "cuando mi cuñado dice X" o "cuando veo la noticia de Y".</li>
          <li><strong>Reconoce la emoción debajo:</strong> La ira suele ser la emoción superficial. Debajo hay miedo, impotencia, tristeza o vergüenza.</li>
          <li><strong>Localiza la sensación en tu cuerpo:</strong> ¿Dónde sientes el gatillo? ¿Pecho? ¿Estómago? ¿Garganta?</li>
          <li><strong>Identifica tu reacción automática:</strong> ¿Atacas? ¿Te cerrás? ¿Te vas? ¿Haces chistes?</li>
          <li><strong>Diseña una respuesta alternativa:</strong> ¿Qué harías si pudieras elegir conscientemente?</li>
        </ol>

        <h3>La Regla de Oro: Separar la Persona del Gatillo</h3>
        <p>Tu cuñado no es tu enemigo. Tu jefe no es la causa de tu frustración. El gobierno no es responsable de todas tus emociones. Estas personas y situaciones <em>activan</em> algo que ya estaba en vos. El trabajo interior es tuyo, no de ellos.</p>
        <p>Esto no significa que no existan injusticias reales. Significa que tu <strong>respuesta</strong> a esas injusticias será más efectiva si nace de la claridad emocional, no de la reactividad.</p>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Autocompasión en una Cultura del "Aguante"',
      description: 'Descubre por qué tratarte con compasión no es debilidad sino la base del cambio sostenible.',
      content: `
        <h2>Más Allá del "Aguante": La Revolución de Tratarte Bien</h2>
        <p>Argentina tiene una cultura del <strong>"aguante"</strong> profundamente arraigada. Aguantar la crisis, aguantar al jefe, aguantar la incertidumbre, aguantar sin quejarse. El problema es que el aguante sin compasión se convierte en <em>autoagresión disfrazada de fortaleza</em>.</p>

        <h3>¿Qué Es la Autocompasión? (Y Qué No Es)</h3>
        <p>La investigadora Kristin Neff identificó tres componentes de la autocompasión:</p>
        <ol>
          <li><strong>Amabilidad hacia uno mismo</strong> (en vez de autocrítica brutal): Tratarte como tratarías a un amigo querido que está pasando por lo mismo que vos.</li>
          <li><strong>Humanidad compartida</strong> (en vez de aislamiento): Recordar que no sos el único que sufre, que la dificultad es parte de la experiencia humana compartida.</li>
          <li><strong>Atención plena</strong> (en vez de sobreidentificación): Observar tu dolor sin exagerarlo ni minimizarlo.</li>
        </ol>
        <p><strong>Lo que NO es:</strong></p>
        <ul>
          <li>No es autoindulgencia ("pobrecito de mí, me quedo en la cama")</li>
          <li>No es bajar los estándares ("como me trato bien, no me exijo")</li>
          <li>No es autoestima inflada ("soy el mejor, no tengo nada que mejorar")</li>
          <li>No es debilidad. De hecho, la investigación muestra que las personas autocompasivas son <em>más</em> resilientes, no menos.</li>
        </ul>

        <blockquote>"La Bondad Radical del Hombre Gris comienza hacia adentro. No podes dar lo que no tenes. Si tu diálogo interior es un campo de batalla, tu acción exterior será guerra disfrazada de cambio social."</blockquote>

        <h3>La Voz del Crítico Interior Argentino</h3>
        <p>Tenemos un crítico interior particularmente sofisticado, moldeado por la cultura:</p>
        <ul>
          <li><strong>"Sos un boludo/a":</strong> La autocrítica disfrazada de humor. Nos reímos, pero la amígdala no entiende de chistes.</li>
          <li><strong>"No te alcanza porque no laburas lo suficiente":</strong> Cuando el sistema falla, nos culpamos individualmente.</li>
          <li><strong>"Dejate de joder con eso":</strong> Minimizar el propio sufrimiento es una forma de autoagresión.</li>
          <li><strong>"Hay gente que la pasa peor":</strong> Comparar sufrimiento para invalidar el propio.</li>
        </ul>

        <h3>Práctica: El Toque Compasivo</h3>
        <p>Cuando notes que tu crítico interior está activo:</p>
        <ol>
          <li>Coloca una mano sobre tu pecho (esto activa la oxitocina, la hormona del vínculo).</li>
          <li>Respira profundo tres veces.</li>
          <li>Decite internamente: "Esto es difícil. No soy el único que pasa por esto. Me merezco la misma compasión que le daría a un amigo."</li>
          <li>Si te parece "cursi", nota esa resistencia sin juzgarla. La resistencia a la compasión es en sí misma un dato importante.</li>
        </ol>

        <h3>Autocompasión y Acción Social</h3>
        <p>Contrario a lo que parece, la autocompasión no te vuelve pasivo. La investigación de Neff demuestra que las personas autocompasivas:</p>
        <ul>
          <li>Son <strong>más</strong> propensas a tomar acción ante la injusticia</li>
          <li>Persisten <strong>más</strong> en tareas difíciles</li>
          <li>Son <strong>más</strong> capaces de reconocer errores y aprender de ellos</li>
          <li>Sufren <strong>menos</strong> burnout activista</li>
        </ul>
        <p>El Hombre Gris que se trata con compasión tiene más energía, más claridad y más capacidad de servicio sostenible. El que se flagela constantemente termina quemado, cínico o desconectado.</p>

        <h3>Ejercicio Semanal: Carta de Compasión</h3>
        <p>Escribe una carta a vos mismo desde la perspectiva de un amigo increíblemente sabio y compasivo. Que ese amigo te diga lo que necesitas escuchar sobre tu situación actual. Sin críticas, sin consejos no pedidos, sin minimización. Solo compasión y verdad.</p>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },
    {
      courseId,
      title: 'Empatía Práctica: Entender al Otro sin Perderte',
      description: 'Desarrolla empatía genuina sin caer en la sobreidentificación ni el agotamiento emocional.',
      content: `
        <h2>Empatía con Límites: El Equilibrio del Hombre Gris</h2>
        <p>La empatía es la capacidad de <strong>sentir con el otro</strong>. Pero en Argentina, donde las emociones colectivas son intensas y la necesidad ajena es constante, la empatía sin límites se convierte en un camino directo al agotamiento.</p>

        <h3>Los Tres Tipos de Empatía</h3>
        <p>El psicólogo Paul Ekman distingue tres formas de empatía que operan de manera diferente:</p>
        <ol>
          <li><strong>Empatía cognitiva:</strong> Entender intelectualmente lo que el otro siente. "Puedo ver que estás sufriendo." Es útil para la negociación y la mediación.</li>
          <li><strong>Empatía emocional:</strong> Sentir lo que el otro siente. Cuando tu amigo llora, a vos también se te hace un nudo. Es la base de la conexión humana.</li>
          <li><strong>Preocupación empática:</strong> Sentir el impulso de ayudar, de hacer algo. Es lo que mueve la acción solidaria.</li>
        </ol>
        <p>Las tres son necesarias, pero en diferentes dosis según la situación. El error más común es quedarse atrapado en la empatía emocional sin pasar a la preocupación empática constructiva.</p>

        <h3>La Trampa de la Sobreempatía</h3>
        <p>En una sociedad con tanto sufrimiento visible, muchas personas caen en la <em>fatiga por compasión</em>:</p>
        <ul>
          <li>Absorber el dolor ajeno como propio</li>
          <li>Sentir culpa por estar "mejor" que otros</li>
          <li>No poder disfrutar de momentos buenos porque "hay gente que la está pasando mal"</li>
          <li>Involucrarse emocionalmente en cada historia triste que ves en redes sociales</li>
          <li>Decir que sí a todo porque "cómo le voy a decir que no"</li>
        </ul>

        <blockquote>"La empatía del Hombre Gris es como el agua: fluida pero con orillas. Sin orillas, el agua se dispersa y pierde fuerza. Con orillas demasiado rígidas, se estanca. El arte está en el equilibrio."</blockquote>

        <h3>Empatía en la Grieta: Entender al que Piensa Diferente</h3>
        <p>El desafío más grande de la empatía argentina no es sentir compasión por el que sufre. Es <strong>entender al que piensa diferente</strong>. Esto no significa estar de acuerdo, sino comprender <em>desde dónde</em> piensa lo que piensa.</p>
        <p>Preguntas que abren la empatía cognitiva:</p>
        <ul>
          <li>"¿Qué experiencia de vida llevó a esta persona a pensar así?"</li>
          <li>"¿Qué miedo está detrás de esta posición?"</li>
          <li>"¿Qué necesidad legítima está intentando proteger?"</li>
          <li>"¿Qué tendría que haber vivido yo para pensar como él/ella?"</li>
        </ul>

        <h3>Práctica: Escucha Empática Estructurada</h3>
        <p>Esta semana, elegí una conversación donde vas a practicar escucha empática pura:</p>
        <ol>
          <li><strong>Escucha sin preparar tu respuesta.</strong> Tu único trabajo es entender.</li>
          <li><strong>Refleja:</strong> "Si entiendo bien, lo que me estás diciendo es..." (parafrasea).</li>
          <li><strong>Valida la emoción:</strong> "Tiene sentido que te sientas así dado lo que me contás."</li>
          <li><strong>Pregunta:</strong> "¿Hay algo más?" (la primera respuesta casi nunca es la más profunda).</li>
          <li><strong>No ofrezcas soluciones</strong> a menos que te las pidan explícitamente.</li>
        </ol>

        <h3>Proteger Tu Energía Empática</h3>
        <p>Para poder sostener la empatía en el tiempo:</p>
        <ul>
          <li><strong>Limita tu consumo de noticias:</strong> Informate, no te intoxiques. 15 minutos al día es suficiente.</li>
          <li><strong>Practica la "empatía con techo":</strong> Podes entender y compadecer sin absorber.</li>
          <li><strong>Recarga:</strong> Después de situaciones emocionalmente intensas, necesitas tiempo de recuperación.</li>
          <li><strong>Distinguí entre empatía y responsabilidad:</strong> Podes sentir empatía por alguien sin ser responsable de solucionar su problema.</li>
        </ul>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Comunicación Emocional Inteligente',
      description: 'Aprende a expresar lo que sentís de manera que construya puentes en vez de muros.',
      content: `
        <h2>Decir lo que Sentís Sin Destruir Relaciones</h2>
        <p>La comunicación emocional es el puente entre tu mundo interior y el mundo exterior. En Argentina, donde la comunicación tiende a ser <strong>apasionada, indirecta y cargada de sobreentendidos</strong>, aprender a comunicar emociones con claridad es un superpoder.</p>

        <h3>El Modelo de Comunicación No Violenta (CNV)</h3>
        <p>Marshall Rosenberg desarrolló un modelo de cuatro pasos que transforma la comunicación:</p>
        <ol>
          <li><strong>Observación (sin juicio):</strong> Describir lo que pasó como lo haría una cámara de video. "Cuando llegaste 40 minutos tarde..." (no "Cuando siempre llegas tarde como un irresponsable...")</li>
          <li><strong>Sentimiento:</strong> Expresar la emoción que eso generó en vos. "Me sentí preocupado y frustrado..." (no "Me hiciste enojar...")</li>
          <li><strong>Necesidad:</strong> Conectar esa emoción con una necesidad no satisfecha. "...porque necesito sentir que mi tiempo es respetado..."</li>
          <li><strong>Pedido (no exigencia):</strong> Hacer un pedido concreto y realizable. "¿Podríamos acordar avisarnos si vamos a llegar tarde?"</li>
        </ol>

        <blockquote>"La comunicación del Hombre Gris no busca ganar discusiones sino construir entendimiento. En un país acostumbrado al grito, hablar con precisión emocional es un acto de coraje."</blockquote>

        <h3>Errores Comunicacionales Típicos Argentinos</h3>
        <ul>
          <li><strong>El sarcasmo como escudo:</strong> Usar el humor para decir verdades dolorosas sin hacerse cargo. "No, está todo bien..." (cuando nada está bien).</li>
          <li><strong>La generalización:</strong> "Siempre haces lo mismo" o "Nunca me escuchas". Esto activa la defensiva del otro inmediatamente.</li>
          <li><strong>El "vos-mensaje":</strong> "Vos sos un insensible" en vez de "yo me sentí ignorado". El primero ataca, el segundo informa.</li>
          <li><strong>El tratamiento silencioso:</strong> Dejar de hablar como castigo. Es una forma de violencia emocional pasiva.</li>
          <li><strong>La escalada competitiva:</strong> "¿A vos te fue mal? ¡A mí me fue peor!" Competir por el sufrimiento destruye la conexión.</li>
        </ul>

        <h3>Comunicación en Contextos Difíciles</h3>
        <p><strong>En la mesa familiar con tema político:</strong></p>
        <ul>
          <li>Antes de hablar, preguntate: "¿Quiero convencer o quiero conectar?"</li>
          <li>Usa "yo pienso" en vez de "la realidad es". Nadie tiene el monopolio de la realidad.</li>
          <li>Valida antes de diferir: "Entiendo por qué pensás así. Mi experiencia me lleva a ver algo diferente."</li>
        </ul>
        <p><strong>En el trabajo con un jefe difícil:</strong></p>
        <ul>
          <li>Separa el problema de la persona: "El proceso tiene una dificultad" vs "Vos creaste un problema".</li>
          <li>Ofrece alternativas, no solo quejas: "Vi este problema y se me ocurren dos posibles soluciones."</li>
        </ul>
        <p><strong>En la pareja:</strong></p>
        <ul>
          <li>La investigación de John Gottman muestra que las parejas exitosas tienen una proporción de 5 interacciones positivas por cada 1 negativa.</li>
          <li>Evita los "cuatro jinetes del apocalipsis relacional": crítica, desprecio, defensividad y obstrucción.</li>
        </ul>

        <h3>Ejercicio: Reformula Tres Frases</h3>
        <p>Toma tres cosas que dijiste (o pensaste) esta semana que generaron conflicto y reformulalas usando el modelo CNV de cuatro pasos. Nota cómo cambia la energía de la comunicación cuando pasas del ataque a la expresión vulnerable.</p>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Hábitos Emocionales: Reprogramar Tu Sistema Nervioso',
      description: 'Crea rutinas diarias que fortalezcan tu regulación emocional de manera sostenible.',
      content: `
        <h2>Tu Sistema Nervioso Es un Jardín: Cultivalo</h2>
        <p>La inteligencia emocional no es algo que se "aprende" una vez y ya. Es un <strong>conjunto de hábitos</strong> que se practican diariamente hasta que se vuelven automáticos. Así como cepillarte los dientes no requiere fuerza de voluntad, regular tus emociones puede volverse algo natural con la práctica suficiente.</p>

        <h3>La Ciencia de la Neuroplasticidad</h3>
        <p>Tu cerebro se recablea constantemente en función de lo que practicas. Esto se llama <em>neuroplasticidad</em>, y es la mejor noticia de la neurociencia moderna:</p>
        <ul>
          <li>8 semanas de meditación aumentan la densidad de materia gris en la corteza prefrontal.</li>
          <li>La práctica regular de regulación emocional reduce el tamaño de la amígdala (menos reactividad).</li>
          <li>Las conexiones neuronales que usas se fortalecen; las que no, se debilitan. "Las neuronas que se activan juntas, se conectan juntas."</li>
        </ul>

        <blockquote>"La metamorfosis del Niño —la tercera etapa— no es un destino: es una práctica diaria. El Niño no nace transformado; se transforma cada mañana al elegir la presencia sobre la reactividad."</blockquote>

        <h3>Los 7 Hábitos Emocionales del Hombre Gris</h3>
        <ol>
          <li><strong>El Check-In Matutino (2 minutos):</strong> Antes de mirar el celular, preguntate: "¿Cómo estoy hoy? ¿Qué necesito?" Solo eso. Dos preguntas que te conectan contigo antes de que el mundo exterior te capture.</li>
          <li><strong>La Micro-Meditación (5 minutos):</strong> No necesitas una hora de silencio. Cinco minutos de atención a la respiración cambian tu química cerebral. Podes hacerlo en el colectivo, en el baño del trabajo, en la fila del súper.</li>
          <li><strong>El Diario Emocional (10 minutos):</strong> Escribir lo que sentiste en el día. No literatura: datos emocionales. ¿Qué sentí? ¿Qué lo gatilló? ¿Cómo respondí?</li>
          <li><strong>El Movimiento Consciente (20 minutos):</strong> Caminar, yoga, estiramientos, bailar. El cuerpo procesa emociones a través del movimiento. El sedentarismo es enemigo de la salud emocional.</li>
          <li><strong>La Conexión Genuina (variable):</strong> Una conversación real por día. Sin celular, sin distracciones. Mirando a los ojos. Escuchando de verdad.</li>
          <li><strong>La Higiene Informativa (15 minutos max):</strong> Limitar las noticias y redes sociales. Informate, no te intoxiques. Tu sistema nervioso no distingue entre una amenaza real y una noticia alarmante.</li>
          <li><strong>La Gratitud Nocturna (3 minutos):</strong> Antes de dormir, nombra tres cosas por las que estás agradecido. No tiene que ser algo grande. "Tomé un café rico", "mi hijo me abrazó", "respiré". La gratitud activa el sistema parasimpático.</li>
        </ol>

        <h3>La Arquitectura del Hábito</h3>
        <p>Según James Clear (Hábitos Atómicos), cada hábito necesita:</p>
        <ul>
          <li><strong>Señal:</strong> Un gatillo que inicia el hábito (la alarma suena = check-in matutino)</li>
          <li><strong>Rutina:</strong> La acción en sí (las dos preguntas del check-in)</li>
          <li><strong>Recompensa:</strong> Algo que tu cerebro disfrute (la sensación de claridad después del check-in)</li>
          <li><strong>Acumulación:</strong> Enganchar hábitos nuevos a hábitos existentes ("después de servirme el mate, hago mi check-in")</li>
        </ul>

        <h3>Implementación Realista para la Vida Argentina</h3>
        <p>No intentes hacer todo al mismo tiempo. Elige <strong>un hábito</strong> y practicalo durante 21 días antes de agregar otro. La consistencia vence a la intensidad:</p>
        <ul>
          <li>Semana 1-3: El check-in matutino (2 minutos)</li>
          <li>Semana 4-6: Agregar la gratitud nocturna (3 minutos)</li>
          <li>Semana 7-9: Agregar la micro-meditación (5 minutos)</li>
          <li>Y así sucesivamente...</li>
        </ul>
        <p>En tres meses, tendrás una rutina de bienestar emocional que no te toma más de 30 minutos al día y que <strong>transforma literalmente la estructura de tu cerebro</strong>.</p>
      `,
      orderIndex: 9,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan de Bienestar Emocional',
      description: 'Integra todo lo aprendido en un plan personalizado y sostenible de salud emocional.',
      content: `
        <h2>De la Teoría a Tu Vida: El Plan Integrado</h2>
        <p>Llegaste al final de este curso con un arsenal de herramientas emocionales. Ahora el desafío es el más importante: <strong>integrar todo en un plan que funcione para tu vida real</strong>, no para una vida idealizada.</p>

        <h3>Paso 1: Tu Diagnóstico Emocional Actual</h3>
        <p>Responde con honestidad:</p>
        <ul>
          <li>¿En qué modo de tu sistema nervioso paso la mayor parte del tiempo? (seguro / lucha-huida / colapso)</li>
          <li>¿Cuáles son mis tres principales gatillos emocionales?</li>
          <li>¿Cómo es mi diálogo interior habitual? (crítico / compasivo / ausente)</li>
          <li>¿Cómo afectan mis emociones a mis relaciones más cercanas?</li>
          <li>¿Qué hábitos emocionales tengo actualmente? (buenos y malos)</li>
        </ul>

        <h3>Paso 2: Tu Visión de Bienestar Emocional</h3>
        <p>No se trata de "no sentir emociones negativas". Se trata de:</p>
        <ol>
          <li><strong>Sentir todo el espectro</strong> sin quedarte atrapado en ningún extremo</li>
          <li><strong>Responder en vez de reaccionar</strong> la mayor parte del tiempo</li>
          <li><strong>Mantener relaciones</strong> donde la comunicación emocional sea fluida</li>
          <li><strong>Tener energía</strong> para el servicio y la acción sin quemarte</li>
          <li><strong>Dormir bien, digerir bien, pensar bien:</strong> los indicadores básicos de un sistema nervioso regulado</li>
        </ol>

        <blockquote>"El Hombre Gris emocionalmente maduro no es el que nunca se enoja, llora o teme. Es el que hace algo útil con cada emoción. Cada emoción es combustible: la pregunta es para qué motor."</blockquote>

        <h3>Paso 3: Tu Kit de Emergencia Emocional</h3>
        <p>Crea una tarjeta (física o digital) con tus herramientas para momentos de crisis:</p>
        <ul>
          <li><strong>Si estoy en modo lucha/huida:</strong> Respiración 4-7-8 + grounding 5-4-3-2-1</li>
          <li><strong>Si estoy en modo colapso:</strong> Movimiento suave + contacto con agua fría en las muñecas</li>
          <li><strong>Si estoy rumiando:</strong> Escribir durante 10 minutos sin parar + salir a caminar</li>
          <li><strong>Si estoy a punto de explotar:</strong> Pausa de 90 segundos + la pregunta "¿qué quiero lograr realmente?"</li>
          <li><strong>Si me siento solo/a:</strong> Llamar a una persona de mi red de confianza (tenerla definida de antemano)</li>
        </ul>

        <h3>Paso 4: Tu Red de Apoyo Emocional</h3>
        <p>Identifica al menos tres personas con las que puedas ser emocionalmente honesto:</p>
        <ol>
          <li>Alguien que te escuche sin juzgar</li>
          <li>Alguien que te diga verdades con amor</li>
          <li>Alguien con quien puedas reír y soltar</li>
        </ol>
        <p>Si no tenes estas tres personas, este curso te da permiso para buscarlas activamente. No es debilidad: es estrategia de supervivencia emocional.</p>

        <h3>Paso 5: Indicadores de Progreso</h3>
        <p>¿Cómo saber si estás avanzando? Revisa mensualmente:</p>
        <ul>
          <li>¿Cuánto tiempo tardo en volver a mi ventana de tolerancia después de un gatillo? (debería ir disminuyendo)</li>
          <li>¿Con qué frecuencia reacciono automáticamente vs. respondo conscientemente? (la proporción debería mejorar)</li>
          <li>¿Cómo está mi calidad de sueño? (indicador fisiológico clave)</li>
          <li>¿Mis relaciones cercanas están mejorando, empeorando o igual?</li>
          <li>¿Tengo energía para mis proyectos o estoy crónicamente agotado?</li>
        </ul>

        <h3>Compromiso Final</h3>
        <p>Escribe tu compromiso con tu bienestar emocional. No un compromiso genérico ("voy a ser más feliz") sino uno concreto y medible. Por ejemplo: "Durante las próximas 8 semanas, voy a hacer el check-in matutino y la gratitud nocturna todos los días, y voy a practicar la pausa de 90 segundos cada vez que sienta un gatillo emocional intenso."</p>
        <p>Firmalo. Ponele fecha. Y compartilo con al menos una persona de tu red de apoyo. <strong>El cambio emocional sostenible requiere testigos.</strong></p>
      `,
      orderIndex: 10,
      type: 'text' as const,
      duration: 35,
      isRequired: true,
    },
  ];

  for (const lesson of lessons16) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons16.length, 'lessons for course 16');

  // Quiz for course 16
  const existingQuiz16 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz16.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz16[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz16] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Inteligencia Emocional para Tiempos Turbulentos',
    description: 'Evalúa tu comprensión de las herramientas de inteligencia emocional aprendidas en este curso.',
    passingScore: 70,
    timeLimit: 20,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions16 = [
    {
      quizId: quiz16.id,
      question: '¿Cuánto tiempo tarda una emoción en recorrer tu cuerpo como reacción química según Jill Bolte Taylor?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['30 segundos', '90 segundos', '5 minutos', '15 minutos']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Según la neurocientífica Jill Bolte Taylor, una emoción tarda 90 segundos en recorrer el cuerpo como reacción química. Después de eso, si persiste es por realimentación cognitiva.',
      points: 1,
      orderIndex: 1,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuáles son los tres modos del sistema nervioso autónomo según la teoría polivagal?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Activo, pasivo y neutral',
        'Seguro (ventral vagal), lucha/huida (simpático) y colapso (dorsal vagal)',
        'Consciente, inconsciente y subconsciente',
        'Emocional, racional y instintivo'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La teoría polivagal de Stephen Porges identifica tres estados: ventral vagal (seguridad), simpático (lucha/huida) y dorsal vagal (colapso/shutdown).',
      points: 1,
      orderIndex: 2,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuáles son los tres componentes de la autocompasión según Kristin Neff?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Autoestima, confianza y optimismo',
        'Amabilidad hacia uno mismo, humanidad compartida y atención plena',
        'Perdón, aceptación y gratitud',
        'Fortaleza, disciplina y perseverancia'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Kristin Neff define la autocompasión con tres componentes: amabilidad hacia uno mismo (vs autocrítica), humanidad compartida (vs aislamiento) y atención plena (vs sobreidentificación).',
      points: 1,
      orderIndex: 3,
    },
    {
      quizId: quiz16.id,
      question: 'La autocompasión te vuelve pasivo y reduce tu motivación para actuar.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Falso. La investigación demuestra que las personas autocompasivas son más resilientes, persisten más en tareas difíciles y sufren menos burnout.',
      points: 1,
      orderIndex: 4,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuál es el orden correcto de los pasos de la Comunicación No Violenta?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Sentimiento, pedido, observación, necesidad',
        'Observación, sentimiento, necesidad, pedido',
        'Necesidad, observación, sentimiento, pedido',
        'Pedido, necesidad, sentimiento, observación'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'El modelo CNV de Marshall Rosenberg sigue el orden: Observación (sin juicio), Sentimiento, Necesidad y Pedido concreto.',
      points: 1,
      orderIndex: 5,
    },
    {
      quizId: quiz16.id,
      question: '¿Qué técnica de regulación emocional usa los cinco sentidos para traerte al presente?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Respiración 4-7-8',
        'Reetiquetado cognitivo',
        'Anclaje sensorial (Grounding) 5-4-3-2-1',
        'Pausa de 90 segundos'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El grounding 5-4-3-2-1 usa los cinco sentidos: 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que oles, 1 que saboreas.',
      points: 1,
      orderIndex: 6,
    },
    {
      quizId: quiz16.id,
      question: '¿Qué característica del estrés económico argentino lo hace especialmente dañino?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Es muy intenso',
        'Es impredecible, sistémico, transgeneracional y normalizado',
        'Solo afecta a los más pobres',
        'Es exclusivamente financiero'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'El estrés argentino combina cuatro factores que lo hacen particularmente dañino: impredecibilidad, naturaleza sistémica, transmisión transgeneracional y normalización cultural.',
      points: 1,
      orderIndex: 7,
    },
    {
      quizId: quiz16.id,
      question: 'En la filosofía del Hombre Gris, ¿qué metamorfosis se relaciona con la presencia y observación sin juicio?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'El Camello',
        'El León',
        'El Niño',
        'El Águila'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Niño es la tercera metamorfosis y representa la presencia pura, la observación sin juicio y la capacidad de crear desde la inocencia recuperada.',
      points: 1,
      orderIndex: 8,
    },
    {
      quizId: quiz16.id,
      question: 'La "ventana de tolerancia" se refiere al rango de activación emocional dentro del cual puedes funcionar bien.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Correcto. Dan Siegel desarrolló este concepto: dentro de la ventana puedes pensar, escuchar y decidir con claridad. Fuera de ella estás en hiper o hipoactivación.',
      points: 1,
      orderIndex: 9,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuál es la proporción de interacciones positivas vs negativas en parejas exitosas según Gottman?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        '1 a 1',
        '3 a 1',
        '5 a 1',
        '10 a 1'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'John Gottman descubrió que las parejas exitosas mantienen una proporción de 5 interacciones positivas por cada 1 negativa.',
      points: 1,
      orderIndex: 10,
    },
  ];

  for (const question of questions16) {
    await db.insert(quizQuestions).values(question);
  }
  console.log('Created quiz with', questions16.length, 'questions for course 16');
}

// Road 6 continues: El Fuego Interior
async function seedCourse17(authorId: number) {
  console.log('--- Course 17: Resiliencia y Propósito ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'resiliencia-y-proposito')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Resiliencia y Propósito: El Fuego que No Se Apaga',
      slug: 'resiliencia-y-proposito',
      description: 'De la supervivencia al sentido. Herramientas de resiliencia basadas en ciencia y adaptadas a la realidad argentina: cómo convertir la adversidad en fuerza, encontrar propósito en el caos y construir una vida con significado en un país que no para de sacudirse.',
      excerpt: 'Transformá la adversidad argentina en tu mayor fortaleza interior.',
      category: 'reflection',
      level: 'intermediate',
      duration: 300,
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      orderIndex: 17,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 17:', course[0].title);
  } else {
    console.log('Found existing course 17:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: '¿Qué Es la Resiliencia Real? (No Es lo que Te Dijeron)',
      description: 'Distinguir la resiliencia genuina de la cultura del aguante que enferma.',
      content: `
        <h2>No Es Aguantar. Es Transformarse.</h2>
        <p>En Argentina tenemos un culto al sufrimiento. "Bancátela." "Poné el pecho." "Hay que aguantar." Confundimos resiliencia con estoicismo tóxico: la capacidad de soportar golpes sin quejarse. Pero la resiliencia real no es eso. <strong>Resiliencia no es la capacidad de recibir golpes sin caer. Es la capacidad de caer, romperte, y reconstruirte de una forma nueva.</strong></p>
        <p>Boris Cyrulnik, el neurólogo y psiquiatra francés que acuñó el concepto moderno de resiliencia, lo explica con una imagen poderosa: pensá en una pelota de tenis y un huevo. Tirálos al piso. La pelota rebota — vuelve a su forma original. Eso es <em>elasticidad</em>, no resiliencia. El huevo se rompe — eso es trauma sin respuesta. Pero ¿qué pasa si alguien toma los pedazos del huevo roto y hace con ellos algo nuevo? Un mosaico, una escultura, un camino. <strong>Eso</strong> es resiliencia: crear algo nuevo con los pedazos de lo que se rompió.</p>

        <h3>La Resiliencia Argentina: Un Caso de Estudio Mundial</h3>
        <p>Argentina es, sin exagerar, uno de los laboratorios de resiliencia más intensos del planeta. Considerá lo que un argentino promedio de 50 años ha sobrevivido:</p>
        <ul>
          <li><strong>Dictadura militar</strong> (1976-1983): terrorismo de Estado, 30.000 desaparecidos</li>
          <li><strong>Hiperinflación</strong> (1989-90): precios que se multiplicaban por hora</li>
          <li><strong>Convertibilidad y colapso</strong> (1991-2001): la fiesta de la pizza y el champán, seguida del corralito</li>
          <li><strong>Crisis del 2001</strong>: 5 presidentes en 10 días, saqueos, cacerolas</li>
          <li><strong>Ciclos interminables</strong> de inflación, devaluación, cepo, y vuelta a empezar</li>
        </ul>
        <p>Y sin embargo, acá estamos. No solo sobreviviendo — creando. Haciendo cine premiado, software de clase mundial, ciencia de frontera, cooperativas que funcionan, barrios que se organizan. Eso no es casualidad. Es resiliencia colectiva. Pero una resiliencia <em>intuitiva</em>, no sistematizada. Este curso te da las herramientas para convertir lo intuitivo en consciente.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Hacé una lista rápida de las 3 crisis más fuertes que atravesaste en tu vida (económicas, personales, familiares, de salud). Al lado de cada una, escribí una palabra que describa cómo saliste: ¿más fuerte? ¿más cansado/a? ¿diferente? No juzgues — solo observá el patrón.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>

        <h3>Los 3 Pilares de la Resiliencia (según la ciencia)</h3>
        <ol>
          <li><strong>Vínculo seguro:</strong> Al menos UNA persona que te mira con amor incondicional. Cyrulnik descubrió que los niños que sobrevivían a los traumas más horribles siempre tenían al menos un adulto significativo — un abuelo, una maestra, un vecino — que les decía, con acciones más que con palabras: "Vos importás."</li>
          <li><strong>Narrativa con sentido:</strong> La capacidad de contar tu historia de sufrimiento como una historia de transformación, no solo de dolor. No es negar lo malo — es encontrar significado en lo vivido.</li>
          <li><strong>Acción con propósito:</strong> Hacer algo con el dolor. Convertirlo en acción: ayudar a otros, crear algo, cambiar algo. El dolor que no se transforma en acción se transforma en amargura.</li>
        </ol>

        <h3>Resiliencia vs. Cultura del Aguante</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Cultura del Aguante</th><th style="padding:8px;border:1px solid #ddd;">Resiliencia Real</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">"No pasa nada, seguimos"</td><td style="padding:8px;border:1px solid #ddd;">"Pasó algo grave. Lo proceso y crezco."</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Negar el dolor</td><td style="padding:8px;border:1px solid #ddd;">Atravesar el dolor</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Volver a ser el mismo</td><td style="padding:8px;border:1px solid #ddd;">Convertirse en alguien nuevo</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Individual ("me las arreglo solo")</td><td style="padding:8px;border:1px solid #ddd;">Vincular ("necesito a otros y otros me necesitan")</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Se agota con el tiempo</td><td style="padding:8px;border:1px solid #ddd;">Se fortalece con la práctica</td></tr>
        </table>

        <blockquote>"El Hombre Gris no niega la tormenta. No pretende que no llueve. No le grita al cielo. Se moja, busca refugio, y después sale a plantar algo donde antes hubo barro. Eso es resiliencia: no la ausencia de adversidad, sino la alquimia de transformarla."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 20, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Historia de Adversidad Como Capital',
      description: 'Convertir las crisis vividas en fortalezas conscientes y transferibles.',
      content: `
        <h2>Lo que No Te Mató Te Hizo... ¿Qué Exactamente?</h2>
        <p>Hay una frase que todos repiten como mantra: "Lo que no te mata te hace más fuerte." Pero es una verdad a medias. Lo que no te mata te puede hacer más fuerte, más amargado, más rígido, o más sabio. El resultado depende de <strong>cómo proceses la experiencia</strong>.</p>
        <p>Tu historia de adversidad es un capital — pero un capital en bruto, como un diamante sin pulir. Si no lo trabajás conscientemente, queda enterrado. Si lo trabajás, se convierte en tu herramienta más poderosa para navegar la vida y ayudar a otros.</p>

        <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:1.5rem;border-radius:0 12px 12px 0;margin:2rem 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p><strong>Jorge, 52 años, tornero de oficio, Córdoba Capital, 2001.</strong> Cuando la fábrica donde trabajaba hace 18 años cerró de un día para el otro sin pagar indemnización, Jorge se quedó mirando el techo de su casa durante tres semanas. Su esposa Laura lo encontraba cada mañana sentado en la cocina con el mate frío, inmóvil. "Era como si me hubieran sacado el piso", dice. Un vecino le pidió que le arreglara una cerradura. Después otro le pidió ayuda con una puerta. En seis meses, Jorge tenía un taller de cerrajería en su garage. Hoy emplea a 4 personas. "No soy más fuerte que antes", dice. "Soy diferente. Antes mi identidad era 'el tornero de la fábrica'. Ahora mi identidad es 'el tipo que construye cosas, con lo que tenga, donde esté'. Eso no me lo quita nadie."</p>
        </div>

        <h3>El Inventario de Capital Adverso</h3>
        <p>Cada crisis que atravesaste te dejó habilidades que probablemente no reconocés como tales:</p>
        <ul>
          <li><strong>Crisis económica → Flexibilidad financiera:</strong> Sabés estirar un peso como nadie en el mundo. Sabés improvisar ingresos, negociar precios, encontrar oportunidades donde otros ven solo carencia.</li>
          <li><strong>Pérdida de empleo → Reinvención:</strong> Si te despidieron o cerraron tu fuente de trabajo, descubriste que podías ser más de una cosa. Esa capacidad de pivotar es un superpoder en el siglo XXI.</li>
          <li><strong>Enfermedad → Perspectiva:</strong> Si pasaste por una enfermedad grave (tuya o de un ser querido), aprendiste qué es realmente importante. Esa claridad es irremplazable.</li>
          <li><strong>Ruptura vincular → Autonomía emocional:</strong> Si sobreviviste a una separación, un duelo, o una traición, desarrollaste la capacidad de sostenerte desde adentro.</li>
          <li><strong>Migración interna → Adaptabilidad:</strong> Si te mudaste de provincia, de barrio, o de país, aprendiste a construir redes desde cero. Esa habilidad vale oro.</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Elegí la crisis más difícil que enfrentaste. Ahora respondé: ¿Qué habilidad desarrollaste GRACIAS a esa crisis que hoy usás sin darte cuenta? Puede ser tan simple como "aprendí a cocinar porque no podía pagar delivery" o tan profundo como "aprendí a pedir ayuda porque no podía solo/a".</p>
          <p><em>Tomá 5 minutos para escribirlo.</em></p>
        </div>

        <h3>Reescribir Tu Historia: De Víctima a Protagonista</h3>
        <p>No se trata de negar el sufrimiento ni de romantizarlo. Se trata de cambiar la <strong>posición desde la que contás tu historia</strong>:</p>
        <ul>
          <li><strong>Historia de víctima:</strong> "Me echaron del trabajo y mi vida se arruinó." El protagonista es el evento; vos sos el objeto pasivo.</li>
          <li><strong>Historia de sobreviviente:</strong> "Me echaron del trabajo y logré salir adelante." Mejor — pero el evento sigue siendo el centro.</li>
          <li><strong>Historia de protagonista:</strong> "Cuando perdí el trabajo, descubrí que tenía habilidades que no conocía. Armé mi propio camino y hoy ayudo a otros a hacer lo mismo." Vos sos el centro. La crisis es el escenario, no el guion.</li>
        </ul>
        <p>Reescribir tu historia no cambia los hechos. Cambia tu relación con los hechos. Y eso cambia todo lo que hacés a partir de ahí.</p>

        <h3>Ejercicio: La Carta a Tu Yo del Pasado</h3>
        <p>Escribíle una carta a la versión de vos misma/o que estaba en el peor momento de tu vida. Contale lo que aprendió, lo que construyó, lo que descubrió sobre sí misma/o. No hace falta que sea poética — tiene que ser honesta. Esta carta es tu primer acto de resiliencia consciente.</p>

        <blockquote>"Tu historia de dolor no es tu condena. Es tu curriculum. El problema es que en Argentina nos enseñaron a esconder el sufrimiento como si fuera vergüenza. El Hombre Gris hace lo opuesto: lo mira de frente, lo nombra, y lo convierte en combustible."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'El Propósito Como Ancla: Encontrar Tu "Para Qué"',
      description: 'Viktor Frankl y la búsqueda de sentido aplicada a la inestabilidad crónica argentina.',
      content: `
        <h2>Quien Tiene un Para Qué Puede Soportar Cualquier Cómo</h2>
        <p>Viktor Frankl sobrevivió a Auschwitz. En medio del horror absoluto, observó algo que desafiaba toda lógica: no siempre sobrevivían los más fuertes físicamente, ni los más jóvenes, ni los más astutos. Sobrevivían los que <strong>tenían una razón para vivir</strong>. Un hijo esperándolos. Un libro que terminar. Un paciente que atender. Un sentido que daba significado al sufrimiento.</p>
        <p>Frankl llamó a esto <em>logoterapia</em>: la terapia del sentido. Su descubrimiento no era que el sufrimiento tuviera sentido inherente — era que los seres humanos necesitamos <strong>darle sentido</strong> al sufrimiento para no ser destruidos por él.</p>

        <h3>¿Qué Tiene que Ver con Argentina?</h3>
        <p>Argentina no es Auschwitz. Comparar sería obsceno. Pero Argentina sí es un lugar donde el sufrimiento es <strong>crónico, recurrente y sistémico</strong>. No es una crisis que termina — es un estado permanente de incertidumbre que desgasta el alma.</p>
        <p>Y en ese desgaste, muchos argentinos pierden su "para qué":</p>
        <ul>
          <li>"¿Para qué esforzarme si la inflación se come todo?"</li>
          <li>"¿Para qué estudiar si después no conseguís trabajo?"</li>
          <li>"¿Para qué votar si todos son iguales?"</li>
          <li>"¿Para qué quedarse si afuera está mejor?"</li>
        </ul>
        <p>Cada una de estas preguntas es un <strong>síntoma de pérdida de sentido</strong>, no una conclusión lógica. Porque la lógica dice otra cosa: millones de argentinos SE esfuerzan, SÍ estudian, SÍ votan, SÍ se quedan. La pregunta no es si vale la pena — es encontrar TU razón para que valga.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Completá esta frase cinco veces, cada vez con una respuesta diferente: "Si mañana tuviera la certeza de que Argentina va a estar bien, yo dedicaría mi vida a ___________." No pienses demasiado — escribí lo primero que te salga. Las respuestas que aparecen son pistas de tu propósito latente.</p>
          <p><em>Tomá 5 minutos.</em></p>
        </div>

        <h3>Los 3 Caminos hacia el Sentido (según Frankl)</h3>
        <ol>
          <li><strong>Creación:</strong> Darle algo al mundo. Un emprendimiento, una obra de arte, un hijo bien criado, un barrio mejor organizado. Crear es decir: "El mundo no está completo sin mi aporte."</li>
          <li><strong>Experiencia:</strong> Recibir algo del mundo. El mate al atardecer, una conversación profunda, la belleza de una canción, el abrazo de alguien que querés. Experimentar es decir: "El mundo tiene algo para mí."</li>
          <li><strong>Actitud:</strong> Cuando no podés cambiar la situación, podés cambiar tu relación con ella. El enfermo que encuentra dignidad en su dolor. El preso que encuentra libertad en su mente. Esto no es resignación — es el último acto de libertad humana.</li>
        </ol>

        <h3>El Propósito No Es un Destino — Es una Brújula</h3>
        <p>No necesitás descubrir "tu misión cósmica" para tener propósito. El propósito puede ser tan simple y poderoso como:</p>
        <ul>
          <li>"Quiero que mis hijos crezcan sabiendo que su viejo no se rindió."</li>
          <li>"Quiero que en mi barrio los chicos tengan un lugar seguro para jugar."</li>
          <li>"Quiero aprender lo suficiente como para no dejarme engañar más."</li>
          <li>"Quiero construir algo que sobreviva a esta crisis."</li>
        </ul>
        <p>El propósito no te saca del problema. Te da la <strong>fuerza para atravesarlo</strong>.</p>

        <h3>Ejercicio: El Diario del Para Qué</h3>
        <p>Durante los próximos 7 días, antes de dormirte, escribí una sola línea: "Hoy valió la pena porque ___________." No tiene que ser grandioso — puede ser "porque mi hijo se rio con algo que le dije" o "porque ayudé a un vecino con un trámite." Al final de la semana, leé las 7 líneas juntas. Ahí está tu propósito.</p>

        <blockquote>"El Hombre Gris no necesita que Argentina funcione para tener propósito. Su propósito es HACER que Argentina funcione. Y si no lo logra en su vida, lo habrá intentado — y eso, en este país, ya es un acto de heroísmo cotidiano."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'Identidad Bajo Presión: Quién Sos Cuando Todo Tiembla',
      description: 'Cómo el caos sistémico ataca tu sentido de identidad y cómo construir anclas internas.',
      content: `
        <h2>¿Quién Sos Cuando Te Sacan Todo?</h2>
        <p>Imaginá que mañana perdés tu trabajo, tu casa se inunda, y tus ahorros se evaporan en una devaluación. ¿Quién sos? Si tu identidad está construida sobre lo que <strong>tenés</strong> (trabajo, plata, status), el terremoto externo destruye también tu mundo interno. Pero si tu identidad está construida sobre lo que <strong>sos</strong> (tus valores, tus vínculos, tu carácter), el terremoto sacude pero no derrumba.</p>
        <p>Argentina es un país que derrumba identidades construidas sobre lo externo. Una y otra vez. Por eso la pregunta más importante que podés hacerte no es "¿cómo hago más plata?" sino <strong>"¿quién soy cuando la plata desaparece?"</strong></p>

        <h3>Las 4 Capas de la Identidad</h3>
        <p>Pensá en tu identidad como una cebolla con cuatro capas, de la más externa a la más interna:</p>
        <ol>
          <li><strong>Capa social (la más frágil):</strong> Tu título, tu cargo, tu barrio, tu auto. Es lo primero que la crisis destruye.</li>
          <li><strong>Capa relacional:</strong> Tus vínculos. Pareja, familia, amigos, comunidad. Más resistente, pero también vulnerable al estrés crónico.</li>
          <li><strong>Capa narrativa:</strong> La historia que te contás sobre quién sos. "Soy alguien que no se rinde." "Soy alguien que cuida a los suyos." Esta capa se puede reconstruir conscientemente.</li>
          <li><strong>Capa de valores (la más sólida):</strong> Tus principios no negociables. Honestidad, justicia, compasión, coraje, creatividad. Esta capa NO depende de las circunstancias.</li>
        </ol>
        <p>La resiliencia de identidad consiste en <strong>vivir desde las capas internas</strong>. Que la crisis sacuda tu capa social (perdés el trabajo) sin destruir tu capa de valores (seguís siendo una persona íntegra).</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>¿De cuál de las 4 capas depende más tu identidad hoy? Sé honesto/a: si mañana perdieras tu trabajo o tu status, ¿cuánto de "vos" sentirías que se pierde? ¿Y qué quedaría?</p>
          <p><em>Tomá 3 minutos para reflexionar.</em></p>
        </div>

        <h3>Anclas de Identidad: Lo que No se Mueve</h3>
        <p>Un ancla de identidad es algo que te define independientemente de las circunstancias externas. Ejemplos:</p>
        <ul>
          <li>"Soy alguien que cumple su palabra." → Esto vale si sos CEO o si estás desempleado.</li>
          <li>"Soy alguien que trata bien a los demás." → Esto vale en la abundancia y en la escasez.</li>
          <li>"Soy alguien que aprende de todo." → Esto vale en el éxito y en el fracaso.</li>
          <li>"Soy alguien que no abandona a su gente." → Esto vale con plata y sin plata.</li>
        </ul>
        <p>Tus anclas no son aspiraciones — son <strong>compromisos vividos</strong>. Si decís "soy honesto" pero mentís cuando te conviene, no es un ancla: es un eslogan. Las anclas se demuestran cuando duele mantenerlas.</p>

        <h3>La Identidad Colectiva Argentina</h3>
        <p>Argentina como país tiene un problema de identidad: no nos ponemos de acuerdo en quiénes somos. ¿Somos Europa o Latinoamérica? ¿Somos ricos o pobres? ¿Somos de derecha o de izquierda? Esa fractura identitaria a nivel país se replica a nivel personal: muchos argentinos viven en un estado de <strong>incertidumbre sobre sí mismos</strong> que va más allá de la economía.</p>
        <p>El Hombre Gris propone una identidad que trasciende esas grietas: <strong>soy alguien que busca la verdad, actúa con integridad, y trabaja por el bien común</strong>. Eso no es de izquierda ni de derecha. Es de adelante.</p>

        <h3>Ejercicio: Tus 5 Anclas</h3>
        <p>Escribí 5 frases que empiecen con "Yo soy alguien que..." y que sean verdaderas independientemente de tu situación económica, laboral o social. Pegálas donde las veas todos los días. En la próxima crisis, van a ser tu mapa.</p>

        <blockquote>"La crisis te quita lo que tenés. Nunca te puede quitar lo que sos — a menos que vos se lo permitas. Tu identidad más profunda está hecha de decisiones, no de circunstancias. Y las decisiones son tuyas."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 20, isRequired: true,
    },
    {
      courseId,
      title: 'La Comunidad Como Sistema de Resiliencia',
      description: 'Por qué la resiliencia individual no alcanza y cómo la comunidad multiplica tu fuerza.',
      content: `
        <h2>Nadie Se Salva Solo</h2>
        <p>La psicología positiva del primer mundo te dice: "medita, hacé ejercicio, escribí un diario de gratitud." Y son consejos útiles. Pero en un país donde la amenaza no es un jefe estresante sino un sistema que se cae cada 10 años, <strong>la resiliencia individual es necesaria pero insuficiente</strong>. Lo que realmente salva a los argentinos en las crisis no son las técnicas de respiración — son los vecinos.</p>

        <h3>La Ciencia de la Resiliencia Comunitaria</h3>
        <p>Las investigaciones de Fran Norris y otros psicólogos comunitarios demuestran que las comunidades más resilientes comparten 4 características:</p>
        <ol>
          <li><strong>Capital social:</strong> Gente que se conoce, se ayuda y confía entre sí. En Argentina: el vecino que te fía, la comadre que te cuida a los chicos, el grupo de WhatsApp que avisa si hay un problema.</li>
          <li><strong>Recursos compartidos:</strong> Infraestructura, espacios, herramientas, información que circulan. No es solo plata — es acceso.</li>
          <li><strong>Comunicación efectiva:</strong> La capacidad de transmitir información rápidamente y sin distorsión. En crisis, la comunicación es supervivencia.</li>
          <li><strong>Competencias comunitarias:</strong> Gente que sabe hacer cosas útiles: cocinar para muchos, reparar cosas, organizar, curar, enseñar, mediar conflictos.</li>
        </ol>

        <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:1.5rem;border-radius:0 12px 12px 0;margin:2rem 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p><strong>Las mujeres piqueteras de La Matanza, 2001-2003.</strong> Cuando la crisis del 2001 dejó a barrios enteros sin trabajo ni comida, no fueron los políticos ni las ONGs quienes sostuvieron la vida cotidiana. Fueron las mujeres. Organizaron ollas populares que alimentaban a 200 familias. Armaron redes de cuidado infantil rotativo para que las madres pudieran ir a buscar trabajo. Crearon sistemas de trueque de ropa y medicamentos. María, referente de un comedor en Gregorio de Laferrère, lo explica: "Los hombres salían a cortar la ruta. Nosotras nos quedábamos sosteniendo todo. Sin esa red, los chicos no comían. Así de simple." Lo que estas mujeres construyeron no fue caridad. Fue un <strong>sistema de resiliencia comunitaria</strong> que funcionó mejor que cualquier programa estatal.</p>
        </div>

        <h3>Tu Red de Resiliencia: ¿A Quién Llamás?</h3>
        <p>Hacete estas 5 preguntas. Si no podés responder alguna, ahí tenés un punto débil de tu red:</p>
        <ul>
          <li>¿A quién llamarías a las 3 de la mañana si tuvieras una emergencia?</li>
          <li>¿Quién te prestaría plata sin condiciones?</li>
          <li>¿Quién cuidaría a tus hijos si vos no pudieras?</li>
          <li>¿Con quién podés hablar de tus miedos más profundos sin ser juzgado/a?</li>
          <li>¿Quién te diría la verdad aunque duela?</li>
        </ul>
        <p>Estas 5 personas (si las tenés) son tu <strong>sistema inmunológico social</strong>. Sin ellas, sos vulnerable. Con ellas, sos resiliente.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>¿Pudiste responder las 5 preguntas? ¿Hay algún rol que nadie ocupa en tu vida? ¿Qué podrías hacer esta semana para fortalecer ese vínculo o crear uno nuevo?</p>
          <p><em>Tomá 3 minutos.</em></p>
        </div>

        <h3>Construir Comunidad Cuando No la Tenés</h3>
        <p>Si te mudaste, si estás aislado/a, si tu red se rompió — no estás condenado/a. La comunidad se construye con actos simples:</p>
        <ul>
          <li><strong>Paso 1:</strong> Conocé a 3 vecinos por su nombre. No hacen falta grandes gestos: "Hola, soy [nombre], vivo en el 3B."</li>
          <li><strong>Paso 2:</strong> Ofrecé algo (sin esperar nada): un mate, una herramienta prestada, avisar si hay un paquete.</li>
          <li><strong>Paso 3:</strong> Participá en algo colectivo: la reunión de consorcio, la feria del barrio, el chat de padres del colegio.</li>
          <li><strong>Paso 4:</strong> Cuando necesites algo, pedílo. Pedir ayuda no es debilidad — es el acto que construye reciprocidad.</li>
        </ul>

        <blockquote>"La resiliencia más poderosa no está en tu cabeza — está en tu red. Un argentino solo contra la crisis es un héroe trágico. Un barrio organizado contra la crisis es una fuerza imparable. Elegí ser parte de algo más grande que tu miedo."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'Del Trauma al Sentido: Crecimiento Postraumático',
      description: 'La ciencia del crecimiento después del dolor y cómo activarlo conscientemente.',
      content: `
        <h2>No Todos Los Huesos Rotos Sueldan Mal</h2>
        <p>Hay un fenómeno que la psicología descubrió recién en los años 90 y que desafía la narrativa de que el trauma siempre destruye: el <strong>crecimiento postraumático</strong>. Richard Tedeschi y Lawrence Calhoun documentaron que entre el 50% y el 70% de las personas que atraviesan experiencias traumáticas reportan <em>al menos un área significativa de crecimiento</em> como resultado.</p>
        <p>No es que el trauma sea "bueno." Es que el ser humano tiene una capacidad asombrosa de <strong>crear significado</strong> a partir del dolor, si tiene las condiciones para hacerlo.</p>

        <h3>Las 5 Áreas de Crecimiento Postraumático</h3>
        <ol>
          <li><strong>Relaciones más profundas:</strong> "Antes tenía 100 conocidos. Ahora tengo 5 amigos de verdad." La crisis filtra: te muestra quién está y quién no.</li>
          <li><strong>Nuevas posibilidades:</strong> "Nunca hubiera emprendido si no me echaban." La puerta que se cierra a veces revela un camino que no veías.</li>
          <li><strong>Fuerza personal:</strong> "Si sobreviví a eso, puedo con cualquier cosa." La confianza que viene de haber atravesado lo peor.</li>
          <li><strong>Apreciación de la vida:</strong> "Antes me quejaba de todo. Ahora un domingo con mis hijos es un tesoro." La perspectiva que da la pérdida.</li>
          <li><strong>Transformación existencial/espiritual:</strong> "Entendí que la vida no se trata de acumular sino de ser." La profundidad que viene del abismo.</li>
        </ol>

        <h3>¿Cómo Se Activa el Crecimiento?</h3>
        <p>El crecimiento postraumático no es automático. Requiere condiciones:</p>
        <ul>
          <li><strong>Tiempo:</strong> No se puede apurar. La frase "ya pasó, superalo" es tóxica. El procesamiento tiene su ritmo.</li>
          <li><strong>Reflexión deliberada:</strong> Pensar activamente sobre lo vivido, no evitarlo. El diario, la terapia, la conversación profunda.</li>
          <li><strong>Apoyo social:</strong> Alguien que escuche sin juzgar ni intentar "arreglar." A veces solo necesitás que alguien te diga: "Eso que te pasó fue terrible" — sin el "pero."</li>
          <li><strong>Narrativa:</strong> La capacidad de integrar la experiencia en tu historia de vida. No como capítulo suelto sino como parte de un hilo que continúa.</li>
          <li><strong>Acción:</strong> En algún momento, el procesamiento interno necesita volcarse en algo externo: ayudar a otro, crear algo, cambiar algo.</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Pensá en la experiencia más difícil de tu vida. Sin minimizarla ni dramatizarla, ¿podés identificar al menos UNA de las 5 áreas de crecimiento que surgió como resultado? Si no podés, no te fuerces — a veces el crecimiento todavía está gestándose. Y eso está bien.</p>
          <p><em>Tomá 3 minutos.</em></p>
        </div>

        <h3>Lo Que el Crecimiento NO Es</h3>
        <p>Cuidado con las trampas:</p>
        <ul>
          <li><strong>No es minimizar el dolor:</strong> "Gracias a Dios me echaron porque ahora soy emprendedor." No. Te echaron injustamente Y además encontraste un camino. Las dos cosas son verdad.</li>
          <li><strong>No es obligatorio:</strong> No todo el mundo crece de todo trauma. Y no crecer no es fracasar.</li>
          <li><strong>No justifica el sufrimiento:</strong> "El corralito nos hizo más fuertes" es una burrada. El corralito fue un robo. Que hayamos sobrevivido habla de nosotros, no del evento.</li>
          <li><strong>No se le puede exigir a otro:</strong> Decirle a alguien que está sufriendo "ya vas a ver que esto te hace más fuerte" es crueldad disfrazada de optimismo.</li>
        </ul>

        <h3>Ejercicio: El Mapa de Crecimiento</h3>
        <p>Dibujá una línea horizontal en un papel. A la izquierda, escribí las 3-5 crisis más significativas de tu vida, en orden cronológico. Debajo de cada una, escribí lo que perdiste. Arriba de cada una, escribí lo que ganaste (habilidades, perspectivas, vínculos, fortalezas). Mirá el mapa completo: ¿ves un patrón? ¿Un hilo que conecta las pérdidas con las ganancias?</p>

        <blockquote>"No te pido que agradezcas el dolor. Te pido que no le permitas tener la última palabra. La última palabra la tenés vos: con lo que hacés con lo que te pasó. Eso es libertad. Y en Argentina, eso es revolución."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'Tus Valores en Tiempos de Caos: Lo Que No Se Negocia',
      description: 'Clarificar tus valores fundamentales como brújula para navegar la incertidumbre.',
      content: `
        <h2>Cuando el Piso Desaparece, ¿Qué Queda?</h2>
        <p>En la vida cotidiana, raramente pensamos en nuestros valores. Los damos por sentados. Pero cuando llega la crisis — una devaluación que destruye tus planes, un despido inesperado, una enfermedad, una traición — tus valores son lo único que queda para tomar decisiones. Y si no los tenés claros, la crisis decide por vos.</p>
        <p>La Terapia de Aceptación y Compromiso (ACT) propone algo radical: en vez de intentar controlar lo que sentís, enfocáte en <strong>actuar según tus valores</strong> independientemente de cómo te sientas. No esperés a sentirte motivado para actuar bien. Actuá bien y la motivación vendrá después.</p>

        <h3>Valores vs. Metas vs. Reglas</h3>
        <ul>
          <li><strong>Una meta</strong> se cumple y se termina: "Quiero comprar una casa." Cuando la cumplís, necesitás una nueva.</li>
          <li><strong>Una regla</strong> te dice qué hacer: "No robés." Es externa y rígida.</li>
          <li><strong>Un valor</strong> es una dirección, no un destino: "Integridad." Nunca "llegás" a la integridad — la vivís (o no) en cada decisión, todos los días, para siempre.</li>
        </ul>
        <p>Las metas se cumplen o fracasan. Las reglas se cumplen o se rompen. Los valores se <strong>encarnan o se traicionan</strong>. Y la diferencia entre un ciudadano resiliente y uno que el sistema arrastra es que el primero sabe cuáles son sus valores y <strong>elige defenderlos cuando cuesta</strong>.</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Ejercicio: Las Cartas de Valores</h4>
          <p>De la siguiente lista, elegí los 5 valores que más te representan. No los 5 que "deberías" elegir — los 5 que realmente guían tus decisiones cuando nadie mira:</p>
          <p><strong>Honestidad | Justicia | Compasión | Libertad | Creatividad | Coraje | Lealtad | Responsabilidad | Curiosidad | Generosidad | Autonomía | Conexión | Simplicidad | Perseverancia | Humildad | Humor | Sabiduría | Gratitud</strong></p>
          <p>Ahora ordená los 5 del más al menos importante. ¿Cuál es tu valor #1? ¿Lo viviste esta semana? ¿Cuándo fue la última vez que lo traicionaste?</p>
          <p><em>Tomá 5 minutos.</em></p>
        </div>

        <h3>La Prueba del Fuego: Valores Bajo Presión</h3>
        <p>Es fácil ser honesto cuando no cuesta nada. La pregunta es: ¿sos honesto cuando la honestidad te perjudica? Es fácil ser generoso cuando te sobra. ¿Sos generoso cuando te falta? Los valores se prueban en la crisis, no en la comodidad.</p>
        <p>Situaciones argentinas reales donde tus valores se ponen a prueba:</p>
        <ul>
          <li>Te dan un vuelto de más. ¿Lo devolvés?</li>
          <li>Podés facturar en negro y ahorrarte el IVA. ¿Lo hacés?</li>
          <li>Un amigo te ofrece un laburo donde tenés que "mirar para otro lado." ¿Aceptás?</li>
          <li>Tu jefe te pide que mientas a un cliente. ¿Obedecés?</li>
          <li>Podés irse del país y ganar 5 veces más. ¿Te vas?</li>
        </ul>
        <p>No hay respuestas correctas universales. Hay <strong>tus</strong> respuestas, basadas en <strong>tus</strong> valores. La coherencia entre lo que decís que valorás y lo que hacés cuando cuesta es la medida de tu integridad.</p>

        <h3>Los Valores Como Brújula Comunitaria</h3>
        <p>Los valores no son solo personales. Una comunidad que comparte valores explícitos es más resiliente que una que no los tiene. ¿Tu familia tiene valores declarados? ¿Tu grupo de amigos? ¿Tu barrio? Cuando una comunidad puede decir "nosotros valoramos X" y actuar en consecuencia, es casi indestructible.</p>

        <blockquote>"En Argentina, la viveza criolla se presenta como inteligencia. Pero la viveza sin valores es destrucción. El Hombre Gris propone otra forma de inteligencia: la que te permite ser astuto Y honesto, estratégico Y compasivo, pragmático Y justo. Eso no es debilidad — es la fuerza más sofisticada que existe."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 20, isRequired: true,
    },
    {
      courseId,
      title: 'Construir Hábitos de Resiliencia: La Arquitectura del Día a Día',
      description: 'Prácticas diarias concretas para fortalecer tu capacidad de resistir y transformar.',
      content: `
        <h2>La Resiliencia Se Entrena Como un Músculo</h2>
        <p>La resiliencia no es un rasgo de personalidad con el que nacés o no. Es una <strong>capacidad que se construye con prácticas cotidianas</strong>. Así como no te hacés fuerte levantando una sola pesa una vez, no te hacés resiliente leyendo un solo libro. Se necesitan hábitos: acciones pequeñas, repetidas, que construyen tu capacidad de enfrentar lo difícil.</p>

        <h3>Los 4 Pilares del Entrenamiento de Resiliencia</h3>

        <h4>1. El Cuerpo: Tu Base Física</h4>
        <p>Tu cuerpo es el hardware donde corre el software de tu mente. Si el hardware falla, el software se cuelga:</p>
        <ul>
          <li><strong>Sueño:</strong> 7-8 horas. No negociable. La privación crónica de sueño reduce tu capacidad de regulación emocional un 60% (Walker, 2017). Si dormís 5 horas, tomás decisiones como si tuvieras alcohol en sangre.</li>
          <li><strong>Movimiento:</strong> 30 minutos diarios de actividad física. No necesitás un gym — caminar, bailar, subir escaleras. El ejercicio es el antidepresivo más efectivo que existe (Blumenthal, 2007).</li>
          <li><strong>Alimentación:</strong> Comé lo mejor que puedas con lo que tengas. Priorizá proteínas y verduras sobre ultraprocesados. No es un lujo: es tu combustible básico.</li>
        </ul>

        <h4>2. La Mente: Tu Software Interno</h4>
        <ul>
          <li><strong>5 minutos de silencio al día:</strong> No meditación formal — simplemente sentate en silencio sin celular, sin tele, sin estímulo. Escuchá tus pensamientos sin seguirlos. Esto entrena tu corteza prefrontal para no reaccionar automáticamente.</li>
          <li><strong>Lectura diaria:</strong> 15-20 minutos de algo que te expanda. No noticias — un libro, un artículo profundo, un ensayo. La lectura es el gimnasio de la mente.</li>
          <li><strong>Diario de 3 líneas:</strong> Antes de dormir, escribí: una cosa buena que pasó hoy, una cosa que aprendiste, y una cosa que agradecés. 90 segundos. Reconfigura tu cerebro hacia lo constructivo.</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>De los hábitos mencionados hasta ahora, ¿cuántos ya practicás? ¿Cuál sería el MÁS fácil de incorporar esta semana? No elijas el más importante — elegí el más fácil. El éxito genera momentum.</p>
          <p><em>Tomá 2 minutos.</em></p>
        </div>

        <h4>3. Los Vínculos: Tu Red de Sostén</h4>
        <ul>
          <li><strong>1 conversación significativa por semana:</strong> No charla de ascensor — una conversación real, donde preguntés "¿cómo estás de verdad?" y escuches la respuesta.</li>
          <li><strong>1 acto de generosidad sin motivo:</strong> Ayudar a alguien que no te lo pidió. Invitar un café. Pasar un contacto útil. La generosidad fortalece TUS redes, no solo las del otro.</li>
          <li><strong>Mantener al menos 1 vínculo a distancia:</strong> Un amigo en otra ciudad o país con el que hablás regularmente. La diversidad geográfica de tu red es resiliencia pura.</li>
        </ul>

        <h4>4. El Sentido: Tu Propósito Encarnado</h4>
        <ul>
          <li><strong>1 hora semanal de contribución:</strong> Algo que hagas por otros sin cobrar. Voluntariado, ayudar a un vecino, enseñar algo que sabés. La contribución es el antídoto contra la desesperanza.</li>
          <li><strong>1 cosa nueva por mes:</strong> Aprender algo, visitar un lugar, probar una actividad. La novedad entrena la adaptabilidad, que es el corazón de la resiliencia.</li>
        </ul>

        <h3>Habit Stacking: Apilar para No Olvidar</h3>
        <p>James Clear (Atomic Habits) propone "apilar" hábitos nuevos sobre existentes: "Después de [hábito que ya tengo], hago [hábito nuevo]." Ejemplo: "Después de cebar el primer mate de la mañana, escribo mis 3 líneas en el diario." El hábito existente (mate) dispara el nuevo (diario). Simple y efectivo.</p>

        <blockquote>"La resiliencia no se construye en los momentos de crisis — se construye en los momentos de calma. Cada noche que dormís bien, cada caminata, cada conversación real, cada acto de generosidad es un ladrillo en la fortaleza interior que te va a sostener cuando el piso tiemble. Y en Argentina, el piso siempre tiembla."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 20, isRequired: true,
    },
    {
      courseId,
      title: 'El Duelo Como Portal: Llorar lo que Pudo Ser',
      description: 'Procesar el duelo colectivo argentino como paso necesario hacia la transformación.',
      content: `
        <h2>Antes de Construir, Hay que Llorar</h2>
        <p>Hay un duelo que nadie nombra en Argentina. No es el duelo por una persona — es el duelo por <strong>el país que podría haber sido</strong>. Por los sueños robados. Por la jubilación que no alcanza. Por los hijos que se fueron. Por la carrera truncada. Por la casa que nunca pudiste comprar. Por la estabilidad que nunca conociste.</p>
        <p>Este duelo colectivo, no procesado, se transforma en dos cosas igualmente tóxicas: <strong>cinismo</strong> ("este país no tiene arreglo") o <strong>nostalgia tóxica</strong> ("antes todo era mejor"). Ninguna de las dos permite construir. Para construir algo nuevo, primero hay que llorar lo que se perdió.</p>

        <h3>Los 5 Duelos del Argentino</h3>
        <ol>
          <li><strong>El duelo económico:</strong> Los ahorros que perdiste. Los planes que la devaluación destruyó. El nivel de vida que se degradó año tras año. Esto no es "mala suerte" — es un robo sistémico que merece ser llorado.</li>
          <li><strong>El duelo institucional:</strong> La democracia que no funciona como debería. La justicia que no llega. Los servicios públicos que decaen. La sensación de que "las instituciones son una fachada."</li>
          <li><strong>El duelo vincular:</strong> Los amigos y familiares que emigraron. Las relaciones rotas por la grieta política. Los vínculos erosionados por el estrés económico crónico.</li>
          <li><strong>El duelo de la confianza:</strong> La pérdida de la confianza en el otro, en el sistema, en el futuro. Cuando te estafaron tantas veces, confiar se vuelve un acto de coraje.</li>
          <li><strong>El duelo del potencial:</strong> Lo que Argentina podría ser y no es. Este es quizás el duelo más doloroso: saber que tenemos todo para ser un gran país y no lograrlo.</li>
        </ol>

        <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:1.5rem;border-radius:0 12px 12px 0;margin:2rem 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p><strong>Graciela, 67 años, maestra jubilada, Paraná, Entre Ríos.</strong> "Ahorré toda mi vida. Toda. Desde los 22 años cuando empecé a trabajar. Puse plata en plazo fijo en el '89 y la hiperinflación se la comió. Ahorré de nuevo, y en el 2001 el corralito me dejó con la mitad. Volví a ahorrar, en dólares esta vez, y el cepo me obligó a vender al oficial. La tercera vez que perdí todo, algo se rompió adentro. No era bronca — era un vacío. Me llevó 3 años entender que lo que sentía era duelo. Duelo por la vida que planifiqué y que nunca pude vivir. Cuando por fin lloré — lloré de verdad, con el cuerpo, no solo con la cabeza — fue como si se abriera una puerta. No recuperé la plata. Pero recuperé algo más importante: las ganas de seguir intentando."</p>
        </div>

        <h3>Cómo Procesar el Duelo (Sin Quedarse Atrapado)</h3>
        <ul>
          <li><strong>Nombralo:</strong> "Estoy triste por lo que perdí" es el primer paso. En Argentina, la tristeza se esconde detrás de la bronca o del humor. Pero la bronca sin tristeza procesada es violencia. Y el humor sin tristeza procesada es máscara.</li>
          <li><strong>Compartilo:</strong> El duelo necesita testigos. Alguien que escuche. No que "arregle" — que escuche. Un amigo, un terapeuta, un grupo.</li>
          <li><strong>Ritualizalo:</strong> Los rituales ayudan a procesar. Escribir una carta a lo que perdiste y quemarla. Plantar algo donde hubo destrucción. Hacer una comida en honor a lo que fue.</li>
          <li><strong>Liberalo:</strong> En algún momento, el duelo tiene que dar paso a la acción. No olvidás — pero dejás de vivir DESDE el dolor y empezás a vivir HACIA algo nuevo.</li>
        </ul>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Pausa para Reflexionar</h4>
          <p>¿Cuál de los 5 duelos te pega más fuerte? ¿Lo procesaste o lo escondiste? No hace falta responder ahora — simplemente permitíte sentir lo que aparece.</p>
          <p><em>Tomá 3 minutos de silencio.</em></p>
        </div>

        <h3>El Duelo Como Puerta</h3>
        <p>El duelo no es un punto final — es un <strong>portal</strong>. Del otro lado del duelo está la capacidad de soñar de nuevo. De imaginar un futuro que no sea solo "sobrevivir." De construir sin la carga de lo no llorado.</p>

        <blockquote>"Argentina necesita llorar antes de sanar. No de bronca — de tristeza. Llorar los 30.000 desaparecidos, los millones de emigrados, los sueños rotos, las jubilaciones miserables, las instituciones vaciadas. No para quedarnos en el llanto, sino para limpiarnos. Porque después del llanto viene la claridad. Y de la claridad nace la acción."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Manifiesto Personal: El Fuego que No Se Apaga',
      description: 'Integrar todo lo aprendido en una declaración personal de propósito y resiliencia.',
      content: `
        <h2>De la Lección a la Vida</h2>
        <p>Llegamos al final de este viaje. Recorrimos la resiliencia real, tu capital adverso, el propósito, la identidad, la comunidad, el crecimiento postraumático, los valores, los hábitos y el duelo. Ahora falta lo más importante: <strong>aterrizar todo esto en un compromiso concreto que puedas vivir</strong>.</p>
        <p>No un compromiso abstracto ("voy a ser mejor persona") sino un manifiesto personal: un documento breve que declare quién sos, qué valorás, para qué vivís y cómo vas a enfrentar lo que venga.</p>

        <h3>¿Qué Es un Manifiesto Personal?</h3>
        <p>Un manifiesto es una declaración de principios que te sirve como brújula cuando todo se confunde. No es un plan — los planes cambian. Es un <strong>norte</strong> que permanece cuando los planes se rompen.</p>
        <p>Los grandes movimientos de la historia tuvieron manifiestos. El Manifiesto Comunista, el Manifiesto de las Madres de Plaza de Mayo, el "I Have a Dream" de Luther King. Pero vos no necesitás cambiar el mundo — necesitás tener claro <strong>quién sos y para qué estás</strong>.</p>

        <h3>Guía para Escribir Tu Manifiesto</h3>
        <p>Completá cada sección con 2-3 frases. Sé honesto, sé concreto, sé valiente:</p>

        <h4>1. Quién Soy (identidad)</h4>
        <p>"Soy [nombre]. Soy alguien que [tus anclas de identidad — lección 4]. He sobrevivido [tus adversidades principales — lección 2] y eso me convirtió en [lo que ganaste — lección 6]."</p>

        <h4>2. Qué Valoro (valores)</h4>
        <p>"Mis valores no negociables son [tus 3-5 valores principales — lección 7]. Los defiendo especialmente cuando cuesta, porque [razón personal]."</p>

        <h4>3. Para Qué Vivo (propósito)</h4>
        <p>"Mi propósito es [tu para qué — lección 3]. Esto se expresa concretamente en [acciones que encarnás]."</p>

        <h4>4. Cómo Enfrento lo Difícil (resiliencia)</h4>
        <p>"Cuando la vida me golpea, yo [tu estrategia de respuesta]. Me sostengo en [tu red — lección 5] y practico [tus hábitos — lección 8]."</p>

        <h4>5. Qué Duelo Cargo y Qué Suelto</h4>
        <p>"Reconozco que perdí [tu duelo — lección 9]. Elijo honrar esa pérdida y soltar la amargura. Mi dolor no me define — lo que hago con él sí."</p>

        <h4>6. Mi Compromiso</h4>
        <p>"Me comprometo a [UNA acción concreta que vas a hacer esta semana / este mes / este año] como primer paso de esta nueva versión de mí."</p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">Tu Momento</h4>
          <p>Escribí tu manifiesto ahora. No mañana. No "cuando tenga tiempo." Ahora. No tiene que ser perfecto — tiene que ser verdadero. Usá las respuestas de todas las pausas anteriores como insumo. Si podés, leélo en voz alta. Las palabras dichas tienen más peso que las pensadas.</p>
          <p><em>Tomá 15-20 minutos. Este es el ejercicio más importante del curso.</em></p>
        </div>

        <h3>El Testigo: Compartí Tu Manifiesto</h3>
        <p>Un manifiesto guardado en un cajón es una intención. Un manifiesto compartido es un <strong>compromiso</strong>. Elegí a una persona de confianza — puede ser tu pareja, un amigo, un familiar, un compañero de este curso — y leéle tu manifiesto. No para que te apruebe, sino para que sea testigo de tu declaración.</p>
        <p>En la tradición del Hombre Gris, los compromisos se hacen ante testigos. No por ego, sino por responsabilidad: <strong>cuando alguien sabe lo que prometiste, es más difícil traicionarte a vos mismo</strong>.</p>

        <h3>Después del Curso</h3>
        <ul>
          <li><strong>Releé tu manifiesto</strong> una vez por mes. ¿Seguís viviendo según él?</li>
          <li><strong>Actualizalo</strong> cuando sientas que cambió algo fundamental. Tu manifiesto es un documento vivo.</li>
          <li><strong>Volvé a este curso</strong> cuando la vida te golpee. Las lecciones adquieren significados nuevos después de cada experiencia.</li>
          <li><strong>Pasalo:</strong> Si este curso te transformó, comparálo con alguien que lo necesite.</li>
        </ul>

        <blockquote>"El fuego que no se apaga no es el que arde más fuerte — es el que tiene raíces profundas. Tus raíces son tu historia, tus valores, tu red, tu propósito. Con raíces así, ningún viento argentino te apaga. Ni la inflación, ni la corrupción, ni la desesperanza. Porque tu fuego no depende del afuera. Tu fuego es tuyo."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 25, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 17');

  const eq17 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq17.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq17[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz17] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Resiliencia y Propósito', description: 'Evaluá tu comprensión de la resiliencia como capacidad transformadora.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q17 = [
    { quizId: quiz17.id, question: '¿Cuál es la diferencia entre "cultura del aguante" y resiliencia real?', type: 'multiple_choice' as const, options: JSON.stringify(['No hay diferencia, son sinónimos', 'Aguantar es soportar sin cambiar; resiliencia es romperse y reconstruirse de forma nueva', 'La resiliencia es individual y el aguante es grupal', 'El aguante es más fuerte que la resiliencia']), correctAnswer: JSON.stringify(1), explanation: 'La resiliencia no es la capacidad de absorber golpes sin cambiar (eso es aguante). Es la capacidad de romperse y crear algo nuevo con los pedazos.', points: 2, orderIndex: 1 },
    { quizId: quiz17.id, question: 'Según Frankl, el crecimiento postraumático es automático: todo sufrimiento genera fortaleza.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El crecimiento requiere condiciones: tiempo, reflexión, apoyo social, narrativa y acción. No es automático ni obligatorio.', points: 1, orderIndex: 2 },
    { quizId: quiz17.id, question: '¿Cuáles son los 3 pilares de la resiliencia según Cyrulnik?', type: 'multiple_choice' as const, options: JSON.stringify(['Fuerza física, inteligencia y dinero', 'Vínculo seguro, narrativa con sentido y acción con propósito', 'Meditación, ejercicio y dieta', 'Educación, trabajo y familia']), correctAnswer: JSON.stringify(1), explanation: 'Cyrulnik identificó el vínculo seguro, la capacidad de narrar la experiencia, y la acción con propósito como los 3 pilares fundamentales.', points: 2, orderIndex: 3 },
    { quizId: quiz17.id, question: 'Los valores son lo mismo que las metas: objetivos que alcanzar.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Las metas se cumplen y terminan. Los valores son direcciones permanentes que se viven en cada decisión, nunca se "completan".', points: 1, orderIndex: 4 },
    { quizId: quiz17.id, question: 'Si tu identidad depende de tu trabajo y status, ¿qué pasa en una crisis?', type: 'multiple_choice' as const, options: JSON.stringify(['Te fortalecés', 'La crisis destruye tu identidad junto con tu situación externa', 'No pasa nada porque el trabajo siempre vuelve', 'Descubrís automáticamente quién sos']), correctAnswer: JSON.stringify(1), explanation: 'Las identidades construidas sobre capas externas (trabajo, status) colapsan con la crisis. Las construidas sobre valores internos resisten.', points: 2, orderIndex: 5 },
    { quizId: quiz17.id, question: 'La resiliencia se construye principalmente durante los momentos de crisis.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La resiliencia se construye en los momentos de calma, con hábitos diarios: sueño, ejercicio, vínculos, prácticas de sentido. La crisis solo la pone a prueba.', points: 1, orderIndex: 6 },
    { quizId: quiz17.id, question: '¿Por qué es importante procesar el duelo colectivo en Argentina?', type: 'multiple_choice' as const, options: JSON.stringify(['Porque es una costumbre cultural', 'Porque el duelo no procesado se transforma en cinismo o nostalgia tóxica que impide construir', 'Porque los psicólogos lo recomiendan', 'Porque es requisito legal']), correctAnswer: JSON.stringify(1), explanation: 'El duelo colectivo no procesado se convierte en "este país no tiene arreglo" (cinismo) o "antes todo era mejor" (nostalgia), ambos paralizantes.', points: 2, orderIndex: 7 },
    { quizId: quiz17.id, question: 'Un manifiesto personal es más efectivo cuando se comparte con un testigo.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Compartir el manifiesto con un testigo lo convierte de intención en compromiso. Cuando alguien sabe lo que prometiste, es más difícil traicionarte.', points: 1, orderIndex: 8 },
  ];
  for (const q of q17) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 17');
}

async function seedCourse18(authorId: number) {
  console.log('--- Course 18: Liderazgo Distribuido ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'liderazgo-distribuido')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Liderazgo Distribuido: El Cambio que Convocás',
      slug: 'liderazgo-distribuido',
      description: 'Del caudillo al equipo. Un curso que desmonta el mito del líder carismático y enseña a construir influencia real desde donde estés: tu familia, tu barrio, tu trabajo. Herramientas de facilitación, feedback, gestión de conflictos y mentoría adaptadas a la cultura argentina.',
      excerpt: 'El cambio no necesita un héroe. Necesita a muchos como vos.',
      category: 'action',
      level: 'intermediate',
      duration: 280,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      orderIndex: 18,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 18:', course[0].title);
  } else {
    console.log('Found existing course 18:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Mito del Líder Carismático',
      description: 'Por qué la cultura del caudillo sigue arruinando todo y qué alternativa existe.',
      content: `
<div style="background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🏛️ El Mito del Líder Carismático</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Argentina tiene una adicción. No es al mate ni al fútbol — es al caudillo. Al que habla fuerte, promete todo y concentra el poder como si fuera oxígeno. Desde Rosas hasta hoy, el guión se repite: aparece alguien que dice <em>"yo me encargo"</em>, la gente delega, y cuando ese alguien falla (siempre falla), queda el vacío. Es como construir un edificio con una sola columna. Cuando esa columna se quiebra, todo se derrumba. Este curso propone algo radicalmente distinto: distribuir el liderazgo como se distribuye la raíz de un árbol — en todas direcciones, bajo tierra, donde nadie aplaude pero todo se sostiene.</p>
</div>

<h3 style="color:#1e3a5f;">📜 El Patrón del Caudillismo</h3>
<p style="line-height:1.8;">El sociólogo Maristella Svampa lo llama <strong>"la lógica delegativa"</strong>: elegimos a alguien, le entregamos todo el poder, y después nos quejamos cuando no cumple. Pero el problema no es solo el caudillo — somos también nosotros, que preferimos un salvador a la incómoda tarea de organizarnos entre iguales.</p>

<p style="line-height:1.8;">Pensalo así: si un equipo de fútbol depende de un solo jugador estrella, cada vez que ese jugador se lesiona, el equipo se desintegra. Los equipos que ganan torneos largos son los que tienen <strong>11 jugadores que saben tomar decisiones</strong>. Argentina necesita lo mismo: no un líder mejor, sino millones de personas que lideren desde donde están.</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📊 Anatomía del Ciclo Delegativo</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:0.5rem;">
    <tr style="background:#fef9c3;">
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Fase</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Lo que pasa</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Lo que se pierde</th>
    </tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">1. Ilusión</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">"Este sí nos va a salvar"</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Autonomía ciudadana</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">2. Delegación</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Entregamos poder y dejamos de participar</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Capacidad organizativa</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">3. Decepción</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">"Nos traicionaron otra vez"</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Confianza social</td></tr>
    <tr><td style="padding:0.5rem;">4. Cinismo</td><td style="padding:0.5rem;">"Son todos iguales"</td><td style="padding:0.5rem;">Voluntad de cambio</td></tr>
  </table>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en los últimos 20 años de política argentina. ¿Cuántos "salvadores" aparecieron? ¿Qué pasó después de cada uno? Ahora pensá en tu vida cotidiana: ¿en tu trabajo, tu familia, tu barrio, esperás que alguien lidere o asumís tu parte?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#1e3a5f;">🌳 La Alternativa: Liderazgo Distribuido</h3>
<p style="line-height:1.8;">El liderazgo distribuido no es anarquía ni ausencia de conducción. Es como una red eléctrica descentralizada: si una planta falla, las demás sostienen el sistema. En la práctica significa que <strong>cada persona en un grupo tiene un ámbito donde lidera</strong> — por conocimiento, por confianza, por ubicación, por habilidad. El "líder" ya no es un título fijo; es una función que rota según el contexto.</p>

<p style="line-height:1.8;">El investigador holandés Peter Gronn lo describe así: el liderazgo emerge de la <em>interacción</em>, no del cargo. No es que "nadie manda" — es que <strong>el mando es una función compartida</strong>, como el riego en un jardín comunitario donde cada vecino cuida un sector.</p>

<h3 style="color:#1e3a5f;">🎯 Por Qué Esto Importa en Argentina</h3>
<p style="line-height:1.8;">En un país donde las instituciones se rompen cada 10 años, el liderazgo distribuido es una <strong>estrategia de supervivencia</strong>. Si tu organización depende de una persona, cuando esa persona se muda, se enferma o se frustra, todo muere. Si depende de una red, el sistema se adapta. Cada cooperativa que sobrevivió al 2001, cada asamblea barrial que sigue funcionando, cada grupo de madres que sostiene un comedor — todos tienen algo en común: <strong>nadie era imprescindible porque todos eran necesarios</strong>.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no busca que lo sigan. Busca que cada persona descubra su propia capacidad de conducir. El cambio que depende de uno solo no es cambio — es dependencia con otro nombre."</em></p>
</blockquote>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tu Zona de Influencia',
      description: 'Descubrir dónde ya tenés poder real y cómo expandirlo estratégicamente.',
      content: `
<div style="background:linear-gradient(135deg,#0d9488 0%,#134e4a 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🎯 Tu Zona de Influencia</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">La mayoría de las personas que quieren cambiar algo cometen el mismo error: apuntan demasiado lejos. Se frustran porque no pueden cambiar "el sistema", "la política" o "el país". Es como querer mover un barco empujando desde la costa. Pero si te parás dentro del barco, cerca del timón, con un pequeño giro cambiás la dirección de todo. Stephen Covey lo formalizó como los Círculos de Influencia y Preocupación. Hoy lo vamos a adaptar a la realidad argentina.</p>
</div>

<h3 style="color:#0d9488;">⭕ Los Tres Círculos de Covey — Versión Argentina</h3>
<p style="line-height:1.8;">Covey distingue tres zonas:</p>
<ul style="line-height:2;">
  <li><strong>Círculo de Control:</strong> lo que depende 100% de vos. Tu actitud, tus palabras, tus hábitos, a quién le dedicás tiempo.</li>
  <li><strong>Círculo de Influencia:</strong> lo que podés afectar pero no controlás. Tu familia, tu equipo de trabajo, tus vecinos, tu grupo de WhatsApp.</li>
  <li><strong>Círculo de Preocupación:</strong> lo que te afecta pero no podés cambiar directamente. La inflación, las leyes, el dólar, el clima político.</li>
</ul>

<p style="line-height:1.8;">El error argentino clásico es vivir en el <strong>Círculo de Preocupación</strong>: hablar horas sobre lo que hace el gobierno, enojarse con la televisión, discutir en Twitter sobre cosas que no podemos modificar. Mientras tanto, el Círculo de Influencia — donde realmente podríamos hacer algo — queda abandonado como una plaza sin mantenimiento.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Cuántas horas por semana dedicás a preocuparte por cosas que no podés cambiar (noticias, redes sociales, quejas sobre el gobierno) versus cosas que sí podés cambiar (conversaciones con vecinos, tu barrio, tu comunidad)? Hacé un cálculo honesto.</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#0d9488;">🗺️ Mapeando Tu Influencia Real</h3>
<p style="line-height:1.8;">Tu zona de influencia no es abstracta. Tiene nombres y apellidos. Dibujá tres círculos concéntricos en una hoja:</p>

<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Centro (5-10 personas):</strong> las personas que confían profundamente en vos. Familia nuclear, amigos íntimos, colegas cercanos. Con estas personas, tu palabra tiene peso inmediato.</li>
    <li><strong>Segundo anillo (20-50 personas):</strong> conocidos activos. Compañeros de trabajo, vecinos que saludás, padres del colegio de tus hijos, grupo del club. Podés proponerles cosas.</li>
    <li><strong>Tercer anillo (100-200 personas):</strong> tu red extendida. Contactos de WhatsApp, seguidores reales en redes, ex compañeros, gente del barrio. Podés llegar a ellos con un mensaje.</li>
  </ol>
</div>

<p style="line-height:1.8;">Si tenés 10 personas en tu centro y cada una de ellas tiene otras 10 en su centro, tu red de segundo grado es de <strong>100 personas</strong>. Si cada una de esas 100 tiene 10, tu alcance potencial es de <strong>1.000 personas</strong>. Esto no es fantasía — es cómo funcionó cada cambio social real en la historia. Los grandes movimientos no empezaron con un líder hablándole a millones. Empezaron con <strong>alguien convenciendo a diez personas</strong> que convencieron a diez más.</p>

<h3 style="color:#0d9488;">🔧 La Regla del 10-10-10</h3>
<p style="line-height:1.8;">Para expandir tu influencia en Argentina, aplicá esta regla cada mes:</p>
<ul style="line-height:2;">
  <li><strong>10 conversaciones profundas</strong> con personas de tu centro. No sobre el clima — sobre lo que les preocupa de verdad.</li>
  <li><strong>10 actos de servicio pequeño</strong> hacia tu segundo anillo. Compartir información útil, ayudar sin pedir nada, presentar personas que se beneficien mutuamente.</li>
  <li><strong>10 conexiones nuevas</strong> en tu tercer anillo. Ir a una reunión vecinal, sumarte a un grupo, hablar con alguien que no conocés.</li>
</ul>

<p style="line-height:1.8;">Esto no es "networking" en el sentido corporativo. Es <strong>tejer la red que te va a sostener cuando el piso se mueva</strong> — que en Argentina, se mueve seguido.</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📝 Ejercicio: Tu Mapa de Influencia</h4>
  <p style="line-height:1.8;">Agarrá una hoja (o abrí una nota en el celular) y respondé:</p>
  <ol style="line-height:2;">
    <li>¿Quiénes son tus 5-10 personas de máxima confianza?</li>
    <li>¿En qué temas te escuchan? (¿plata? ¿salud? ¿organización? ¿tecnología?)</li>
    <li>¿Qué espacios frecuentás donde podrías ampliar tu segundo anillo?</li>
    <li>¿Cuál es el primer tema concreto sobre el que podrías movilizar a tu red?</li>
  </ol>
</div>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no espera tener poder para actuar. Actúa con lo que tiene, donde está, con quien lo rodea. Y descubre que eso — exactamente eso — ya es poder."</em></p>
</blockquote>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 28,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Credibilidad Como Capital',
      description: 'Construir confianza real en una sociedad que aprendió a desconfiar de todo.',
      content: `
<div style="background:linear-gradient(135deg,#7c3aed 0%,#4c1d95 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🏦 La Credibilidad Como Capital</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">En Argentina, la confianza es la moneda más escasa. Más que el dólar. Décadas de promesas rotas — de políticos, de instituciones, de vecinos, hasta de familiares — crearon una sociedad donde la sospecha es el modo por defecto. Pero acá está la paradoja: sin confianza, nada funciona. Ni una cooperativa, ni un emprendimiento, ni una familia. Entonces, ¿cómo se construye credibilidad en un país que aprendió a no creer en nada?</p>
</div>

<h3 style="color:#7c3aed;">🧪 La Economía de la Confianza</h3>
<p style="line-height:1.8;">El economista Francis Fukuyama midió algo que llamó <strong>"radio de confianza"</strong>: hasta dónde se extiende la confianza de una persona. En los países nórdicos, la gente confía en desconocidos. En Argentina, el radio es cortísimo: confiamos en la familia cercana (a veces) y sospechamos de todos los demás.</p>

<p style="line-height:1.8;">Esto tiene un costo económico brutal. Cada vez que un cliente paga en efectivo porque no confía en el sistema, cada vez que hacemos un contrato de 47 páginas para una operación simple, cada vez que un vecino pone una reja más alta — eso es <strong>el impuesto invisible de la desconfianza</strong>. Se estima que las sociedades de baja confianza pierden entre un 5% y un 15% de su PBI en "costos de transacción" — es decir, en energía gastada en protegerse unos de otros en vez de colaborar.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Cuánta energía gastás por semana en "cuidarte" de que no te estafen, te roben o te mientan? ¿Cuántas oportunidades dejaste pasar porque no confiabas en la otra persona? ¿Cuánto tiempo le dedicás a verificar lo que otros te dicen?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#7c3aed;">🧱 Los 4 Pilares de la Credibilidad Personal</h3>
<p style="line-height:1.8;">Stephen M.R. Covey (hijo de Stephen Covey) identificó cuatro pilares de la confianza personal. Los adaptamos a la Argentina:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#7c3aed;margin-top:0;">1. Integridad</h4>
    <p style="line-height:1.7;margin-bottom:0;">Hacer lo que decís que vas a hacer. En Argentina esto es casi revolucionario. Si dijiste "el martes te paso el presupuesto", el martes lo pasás. No el jueves. No "ah, me olvidé". Cada promesa cumplida es un ladrillo de credibilidad.</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#7c3aed;margin-top:0;">2. Intención</h4>
    <p style="line-height:1.7;margin-bottom:0;">Que la gente perciba que no buscás ventaja personal. En un país donde "siempre hay un curro atrás", la transparencia de intención es oro. Decí abiertamente qué ganás vos con lo que proponés — aunque no ganes nada.</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#7c3aed;margin-top:0;">3. Capacidad</h4>
    <p style="line-height:1.7;margin-bottom:0;">Saber hacer lo que decís que sabés hacer. Nada destruye la confianza más rápido que la incompetencia disfrazada de seguridad. Si no sabés, decí "no sé, pero averiguo" — eso genera más confianza que inventar.</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#7c3aed;margin-top:0;">4. Resultados</h4>
    <p style="line-height:1.7;margin-bottom:0;">El historial habla. Cada proyecto que completaste, cada compromiso que honraste, cada vez que tu barrio vio que lo que prometiste se hizo — eso es tu CV de confianza. En Argentina, los resultados son la única moneda que no se devalúa.</p>
  </div>
</div>

<h3 style="color:#7c3aed;">📋 Protocolo de Construcción de Confianza</h3>
<p style="line-height:1.8;">Para construir credibilidad en tu entorno, seguí este protocolo progresivo:</p>

<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Semana 1-2: Promesas pequeñas, cumplimiento perfecto.</strong> Prometé cosas chicas ("te mando ese artículo mañana") y cumplilas sin falta. Acumulá micro-victorias.</li>
    <li><strong>Semana 3-4: Transparencia radical.</strong> Cuando no puedas cumplir algo, avisá antes del plazo, no después. Explicá por qué. Proponé alternativa.</li>
    <li><strong>Mes 2: Vulnerabilidad estratégica.</strong> Admití un error públicamente. Decí "me equivoqué en esto" antes de que te lo señalen. En Argentina, donde nadie admite nada, esto genera un impacto enorme.</li>
    <li><strong>Mes 3: Servicio sin retorno.</strong> Hacé algo significativo por alguien sin pedir nada a cambio. No lo publiques en redes. Dejá que la persona lo cuente.</li>
  </ol>
</div>

<p style="line-height:1.8;">La confianza funciona como una cuenta bancaria: los depósitos son lentos y los retiros son instantáneos. Un año de credibilidad se puede destruir con una mentira. Pero un año de credibilidad acumulada te da algo que ningún cargo ni título puede darte: <strong>la capacidad de convocar</strong>.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no exige que le crean. Hace cosas tan consistentes, tan transparentes, tan verificables, que la confianza crece sola — como el pasto entre las baldosas rotas."</em></p>
</blockquote>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Facilitar vs. Controlar',
      description: 'Pasar de "yo tengo las respuestas" a "construyamos respuestas juntos".',
      content: `
<div style="background:linear-gradient(135deg,#ea580c 0%,#9a3412 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🔄 Facilitar vs. Controlar</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Hay dos maneras de conducir un grupo. La primera: "Yo sé, ustedes no saben, hagan lo que digo". La segunda: "Todos sabemos algo, yo voy a ayudar a que eso se ordene". La primera produce obediencia. La segunda produce compromiso. La primera es más rápida. La segunda es la única que dura.</p>
</div>

<h3 style="color:#ea580c;">🎭 El Director vs. El Facilitador</h3>
<p style="line-height:1.8;">Imaginate dos escenas. En la primera, un director de orquesta mueve la batuta y 80 músicos obedecen cada gesto. Si el director se va, la orquesta no puede tocar. En la segunda, una ronda de jazz: cada músico escucha a los demás, improvisa sobre una base compartida, y alguien rota el rol de marcar el ritmo. Si uno se va, la música sigue. Las dos producen arte. Pero solo una construye músicos autónomos.</p>

<p style="line-height:1.8;">En la cultura argentina, estamos acostumbrados al modelo "director": el jefe decide, el maestro dicta, el político anuncia, el padre ordena. El facilitador, en cambio, es quien <strong>crea las condiciones para que otros piensen, propongan y se comprometan</strong>. No da respuestas — hace las preguntas correctas.</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📖 Historia Real: La Maestra de Villa Lugano</h4>
  <p style="line-height:1.8;">Claudia enseñaba en una escuela pública de Villa Lugano donde los pibes faltaban más de lo que iban. Había probado todo: gritar, amenazar con notas, llamar a los padres. Nada funcionaba. Un día, en vez de dar la clase, les preguntó: <em>"Si ustedes pudieran cambiar una cosa de esta escuela, ¿qué cambiarían?"</em> Los pibes se miraron desconcertados. Nadie les había preguntado eso nunca.</p>
  <p style="line-height:1.8;">En tres semanas, los alumnos habían armado un proyecto para pintar los baños (que estaban destruidos), consiguieron donaciones de pintura de una ferretería del barrio, y organizaron turnos de trabajo. La asistencia subió un 40%. Claudia no pintó un solo baño. Lo que hizo fue <strong>dejar de controlar y empezar a facilitar</strong>. Cambió "hagan lo que digo" por "¿qué les parece que deberíamos hacer?". Y esa pregunta cambió todo.</p>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en la última vez que lideraste algo (una reunión, un proyecto, una decisión familiar). ¿Llegaste con la respuesta armada o con preguntas abiertas? ¿Qué hubiera pasado si en vez de proponer, hubieras preguntado?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#ea580c;">🛠️ Herramientas del Facilitador</h3>
<p style="line-height:1.8;">Facilitar no es "no hacer nada". Es hacer cosas distintas — y a veces más difíciles — que controlar:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#ea580c;margin-top:0;">🗣️ Preguntas poderosas</h4>
    <p style="line-height:1.7;">En vez de "Tenemos que hacer X", preguntá: "¿Qué opciones tenemos?". En vez de "El problema es Y", preguntá: "¿Cómo describimos el problema?". Las preguntas abiertas activan el pensamiento colectivo.</p>
  </div>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#ea580c;margin-top:0;">👂 Escucha activa</h4>
    <p style="line-height:1.7;">Repetí lo que escuchaste antes de responder: "Si te entiendo bien, estás diciendo que…". En Argentina tendemos a preparar la respuesta mientras el otro habla. Escuchar de verdad es casi un superpoder.</p>
  </div>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#ea580c;margin-top:0;">⏱️ Gestión de la energía</h4>
    <p style="line-height:1.7;">Sabé cuándo el grupo necesita pausa, cuándo necesita acción, cuándo necesita silencio. Una reunión de 3 horas sin break produce peores ideas que una de 1 hora bien facilitada.</p>
  </div>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#ea580c;margin-top:0;">📝 Registro visible</h4>
    <p style="line-height:1.7;">Escribí las ideas del grupo donde todos las vean (pizarrón, papel afiche, documento compartido). Lo que se escribe se respeta. Lo que se dice se olvida.</p>
  </div>
</div>

<h3 style="color:#ea580c;">🔀 Cuándo Facilitar y Cuándo Dirigir</h3>
<p style="line-height:1.8;">Facilitar no siempre es la respuesta. Si el edificio se está incendiando, no convocás una ronda de opiniones — gritás "¡por acá!" y liderás la evacuación. La clave es saber cuándo cada modo es apropiado:</p>
<ul style="line-height:2;">
  <li><strong>Dirigí</strong> cuando hay urgencia, peligro inmediato o cuando el grupo te delegó explícitamente una decisión.</li>
  <li><strong>Facilitá</strong> cuando necesitás compromiso sostenido, cuando la solución requiere conocimiento distribuido, o cuando querés que el grupo crezca.</li>
</ul>

<p style="line-height:1.8;">El líder distribuido sabe moverse entre ambos modos como un músico que a veces toca solo y a veces acompaña al coro. La sabiduría está en <strong>elegir el modo correcto para cada momento</strong>.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris lidera haciendo buenas preguntas, no dando buenas respuestas. Porque la respuesta que otro descubre solo vale más que la respuesta que alguien le impone."</em></p>
</blockquote>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Cómo Dar Feedback que Cambia',
      description: 'El arte de decir la verdad sin destruir relaciones — adaptado a la cultura argentina.',
      content: `
<div style="background:linear-gradient(135deg,#059669 0%,#064e3b 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">💬 Cómo Dar Feedback que Cambia</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">En Argentina tenemos dos modos de comunicación: la crítica brutal ("sos un desastre") o el silencio cómplice ("no le digo nada para no generar quilombo"). Las dos son formas de cobardía. Existe un tercer camino: decir la verdad con respeto, con datos y con intención de ayudar. No es fácil. Pero es lo que separa a los grupos que crecen de los que se pudren por dentro.</p>
</div>

<h3 style="color:#059669;">❌ Los Dos Extremos Argentinos</h3>
<p style="line-height:1.8;">Kim Scott, autora de <em>Radical Candor</em>, describe cuatro cuadrantes de comunicación. En Argentina vivimos atrapados en dos:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#dc2626;margin-top:0;">😤 Agresión Obnoxia</h4>
    <p style="line-height:1.7;">"Esto está mal, no servís, hacelo de nuevo." Directa pero sin empatía. Humilla. Genera miedo, no mejora. El jefe que grita, el padre que descalifica, el compañero que te tira abajo en la reunión.</p>
  </div>
  <div style="background:#fefce8;border:2px solid #fde047;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#a16207;margin-top:0;">😶 Empatía Ruinosa</h4>
    <p style="line-height:1.7;">"Está bien, no pasa nada" (cuando sí pasa). Empática pero no directa. El compañero que ve el error y no dice nada "para no herir". El amigo que te deja seguir en un camino destructivo. La cortesía que mata.</p>
  </div>
</div>

<p style="line-height:1.8;">El cuadrante que necesitamos es la <strong>Franqueza Radical</strong>: desafiar directamente <em>y</em> demostrar que te importa personalmente. Es decir la verdad desde el afecto. Es el amigo que te dice "mirá, esto que estás haciendo te va a costar caro" — no para herirte, sino porque le importa tu futuro.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en alguien a quien deberías darle un feedback importante pero no se lo diste. ¿Por qué no? ¿Fue por miedo al conflicto (empatía ruinosa) o porque no sabías cómo decirlo sin sonar agresivo? ¿Qué consecuencias tuvo tu silencio?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#059669;">🎯 El Método SBI: Situación, Comportamiento, Impacto</h3>
<p style="line-height:1.8;">El Centro de Liderazgo Creativo desarrolló un formato simple para dar feedback que funciona incluso en la cultura argentina, donde la confrontación directa suele escalar rápido:</p>

<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Situación (S):</strong> Describí el contexto específico. "En la reunión del jueves..." (no "siempre hacés...").</li>
    <li><strong>Comportamiento (B):</strong> Describí lo que la persona HIZO, no lo que "es". "Interrumpiste a María tres veces" (no "sos un maleducado").</li>
    <li><strong>Impacto (I):</strong> Describí el efecto que tuvo. "María dejó de hablar por el resto de la reunión y perdimos su perspectiva sobre el tema."</li>
  </ol>
  <p style="line-height:1.8;margin-bottom:0;margin-top:1rem;"><strong>Ejemplo completo:</strong> "Pedro, en la reunión del jueves (S), interrumpiste a María tres veces cuando estaba explicando su propuesta (B). Después de eso, ella no volvió a hablar y perdimos su perspectiva, que era justamente la que necesitábamos para el presupuesto (I). ¿Podemos buscar una manera de que esto no pase?"</p>
</div>

<h3 style="color:#059669;">🎭 Role-Play: Tres Escenarios Argentinos</h3>
<p style="line-height:1.8;">Practicá mentalmente cómo darías feedback en estas situaciones usando el método SBI:</p>

<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <p style="line-height:1.8;"><strong>Escenario 1:</strong> Tu compañero de cooperativa siempre llega 30 minutos tarde a las reuniones y el grupo lo espera en silencio.</p>
  <p style="line-height:1.8;"><strong>Escenario 2:</strong> La tesorera de la asociación vecinal no presenta los números hace 3 meses y nadie se anima a pedírselos.</p>
  <p style="line-height:1.8;"><strong>Escenario 3:</strong> Tu cuñado publica información falsa en el grupo familiar de WhatsApp y otros familiares la comparten como si fuera cierta.</p>
  <p style="line-height:1.8;margin-bottom:0;">Para cada uno, escribí: ¿Cuál es la Situación? ¿Cuál es el Comportamiento específico? ¿Cuál es el Impacto?</p>
</div>

<h3 style="color:#059669;">🔄 Recibir Feedback: La Otra Mitad</h3>
<p style="line-height:1.8;">Tan importante como dar feedback es saber recibirlo. En Argentina, tendemos a defendernos automáticamente: "pero vos también...", "no es para tanto", "no me entendiste". La próxima vez que alguien te de un feedback, probá este protocolo:</p>
<ol style="line-height:2;">
  <li><strong>Escuchá completo</strong> — sin interrumpir, sin preparar la respuesta.</li>
  <li><strong>Agradecé</strong> — "Gracias por decírmelo" (aunque duela).</li>
  <li><strong>Preguntá más</strong> — "¿Podés darme un ejemplo específico?"</li>
  <li><strong>Procesá</strong> — pedí tiempo si lo necesitás. "Necesito pensarlo. ¿Seguimos mañana?"</li>
</ol>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris dice la verdad con las manos abiertas, no con el puño cerrado. Porque la verdad dicha con respeto construye; la verdad dicha con crueldad solo destruye de otra manera."</em></p>
</blockquote>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 28,
      isRequired: true,
    },
    {
      courseId,
      title: 'Conflicto Como Información',
      description: 'Leer el conflicto como dato del sistema en vez de tomarlo como ataque personal.',
      content: `
<div style="background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🔥 Conflicto Como Información</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">En Argentina le tenemos terror al conflicto. Preferimos acumular resentimiento durante meses antes que enfrentar una conversación incómoda. Y cuando finalmente explota, explota todo junto: lo de hoy, lo de hace seis meses, lo de la infancia. Pero el conflicto, bien leído, es la información más valiosa que un grupo puede tener. Es como la fiebre: no es la enfermedad, es la señal de que algo necesita atención.</p>
</div>

<h3 style="color:#dc2626;">🌡️ La Fiebre Social</h3>
<p style="line-height:1.8;">Cuando dos personas en un equipo chocan, la reacción automática es buscar culpables: "¿Quién empezó?" "¿Quién tiene razón?" Pero eso es como preguntarle a la fiebre quién la causó. Lo que necesitás es <strong>leer el conflicto como un síntoma del sistema</strong>.</p>

<p style="line-height:1.8;">El teórico de sistemas Peter Senge dice que <strong>los conflictos recurrentes son señales de estructuras disfuncionales</strong>. Si en tu cooperativa siempre pelean por los mismos temas, el problema no son las personas — es que hay algo en la estructura (roles poco claros, recursos mal distribuidos, reglas no escritas) que <em>produce</em> el conflicto.</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📊 Tipos de Conflicto y Qué Información Dan</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:0.5rem;">
    <tr style="background:#fef9c3;">
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Tipo</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Ejemplo</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #f59e0b;">Lo que revela</th>
    </tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">De recursos</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">"No hay plata para las dos ideas"</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Faltan criterios claros de priorización</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">De roles</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">"¿Quién decide esto?"</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">Los límites de autoridad no están definidos</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">De valores</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">"Esto va contra lo que creemos"</td><td style="padding:0.5rem;border-bottom:1px solid #fde68a;">La identidad del grupo necesita renegociarse</td></tr>
    <tr><td style="padding:0.5rem;">De relación</td><td style="padding:0.5rem;">"No lo soporto más"</td><td style="padding:0.5rem;">Hay heridas no procesadas que bloquean la tarea</td></tr>
  </table>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en el último conflicto que tuviste en un grupo (trabajo, familia, organización). ¿De qué tipo era? ¿Qué información estaba dando sobre la estructura del grupo? ¿Se resolvió el tema de fondo o solo se apagó el incendio superficial?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#dc2626;">🗺️ Mapeo de Conflictos</h3>
<p style="line-height:1.8;">Antes de intervenir en un conflicto, mapealo. Dibujá un esquema con estos elementos:</p>
<ol style="line-height:2;">
  <li><strong>¿Quiénes están involucrados?</strong> No solo los que pelean — también los que miran, los que toman partido, los que se fueron porque "no quieren quilombo".</li>
  <li><strong>¿Cuál es el tema declarado?</strong> Lo que dicen que es el problema.</li>
  <li><strong>¿Cuál es el tema real?</strong> Lo que hay debajo. Muchas veces la pelea por "quién limpia el salón" es en realidad una pelea por reconocimiento.</li>
  <li><strong>¿Qué necesita cada parte?</strong> No lo que quiere (posición) sino lo que necesita (interés). La posición es "quiero el salón los martes". El interés es "necesito un espacio para mi actividad".</li>
  <li><strong>¿Qué tienen en común?</strong> Siempre hay algo. Aunque sea "los dos queremos que esto funcione".</li>
</ol>

<h3 style="color:#dc2626;">🛡️ El Conflicto Productivo vs. El Destructivo</h3>
<p style="line-height:1.8;">No todo conflicto es igual. El investigador Patrick Lencioni distingue entre:</p>
<ul style="line-height:2;">
  <li><strong>Conflicto productivo:</strong> Se discuten ideas, datos, estrategias. El objetivo es encontrar la mejor solución. Puede ser intenso pero no personal. Después de la reunión, la gente se toma un café junta.</li>
  <li><strong>Conflicto destructivo:</strong> Se atacan personas, se buscan culpables, se acumula resentimiento. El objetivo (consciente o no) es ganar, no resolver. Después de la reunión, la gente habla por la espalda.</li>
</ul>

<p style="line-height:1.8;">La diferencia no está en la intensidad sino en el <strong>objeto</strong>: ¿se discute el tema o se ataca a la persona? Un equipo sano tiene muchos conflictos productivos y casi ninguno destructivo. Un equipo enfermo evita los productivos hasta que explotan como destructivos.</p>

<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <h4 style="color:#dc2626;margin-top:0;">📝 Ejercicio: Mapeo de un Conflicto Actual</h4>
  <p style="line-height:1.8;">Elegí un conflicto activo en tu vida (laboral, familiar, comunitario) y completá:</p>
  <ol style="line-height:2;">
    <li>Involucrados directos: ______</li>
    <li>Involucrados indirectos: ______</li>
    <li>Tema declarado: ______</li>
    <li>Tema real (lo que hay debajo): ______</li>
    <li>Necesidad de la parte A: ______</li>
    <li>Necesidad de la parte B: ______</li>
    <li>Punto en común: ______</li>
  </ol>
</div>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no huye del conflicto ni lo busca. Lo lee como un cartógrafo lee un mapa: con curiosidad, buscando la información que necesita para llegar a donde quiere ir."</em></p>
</blockquote>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 28,
      isRequired: true,
    },
    {
      courseId,
      title: 'El Liderazgo del Que No Está',
      description: 'La verdadera prueba del liderazgo distribuido: construir sistemas que funcionen sin vos.',
      content: `
<div style="background:linear-gradient(135deg,#2563eb 0%,#1e3a8a 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">👻 El Liderazgo del Que No Está</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">La prueba más honesta de tu liderazgo no es lo que pasa cuando estás presente. Es lo que pasa cuando no estás. Si te vas una semana y todo se desmorona, no construiste un equipo — construiste una dependencia. Si te vas y todo sigue funcionando (tal vez distinto, tal vez mejor), entonces sí: lideraste de verdad.</p>
</div>

<h3 style="color:#2563eb;">🧪 El Test de la Ausencia</h3>
<p style="line-height:1.8;">Hacete esta pregunta brutal: <strong>¿Qué se rompe si mañana desaparecés de tu proyecto/organización/familia?</strong></p>

<p style="line-height:1.8;">Si la respuesta es "todo", tenés un problema serio. No porque seas malo sino porque sos <em>demasiado imprescindible</em>. Y lo imprescindible es frágil. Es como una ciudad donde toda el agua pasa por una sola cañería: funciona perfecto hasta que esa cañería se rompe, y entonces nada funciona.</p>

<p style="line-height:1.8;">Lao Tzu, filósofo chino del siglo VI a.C., lo dijo hace 2.500 años: <em>"El mejor líder es aquel cuya gente, cuando todo se hace, dice: lo hicimos nosotros"</em>. En Argentina tendemos a lo contrario: queremos que nos reconozcan, que se note quién hizo el trabajo, que nos den crédito. Pero el liderazgo que se nota es el que todavía no maduró.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Si mañana te fueras un mes de tu proyecto más importante (trabajo, organización, familia), ¿qué tres cosas se detendrían? ¿Esas cosas dependen de tu conocimiento, tu presencia o tu permiso? ¿Qué tendrías que hacer HOY para que no se detengan?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#2563eb;">📋 Inventario de Dependencias</h3>
<p style="line-height:1.8;">Para construir un sistema que funcione sin vos, primero tenés que saber dónde está concentrado el poder. Hacé este inventario:</p>

<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ul style="line-height:2.2;">
    <li><strong>Conocimiento centralizado:</strong> ¿Hay información que solo vos tenés? (contraseñas, contactos clave, procedimientos que nadie más conoce)</li>
    <li><strong>Decisiones centralizadas:</strong> ¿Hay decisiones que solo vos podés tomar? ¿Por qué?</li>
    <li><strong>Relaciones centralizadas:</strong> ¿Hay vínculos clave que solo pasan por vos?</li>
    <li><strong>Habilidades centralizadas:</strong> ¿Hay cosas que solo vos sabés hacer?</li>
  </ul>
</div>

<p style="line-height:1.8;">Cada ítem de esa lista es un <strong>punto de falla</strong>. Si mañana no podés atender ese punto, el sistema sufre. Tu trabajo como líder distribuido es ir eliminando esos puntos de falla — no eliminándote a vos, sino <strong>distribuyendo lo que sabés, lo que decidís y lo que conectás</strong>.</p>

<h3 style="color:#2563eb;">🔧 Protocolo de Descentralización</h3>
<p style="line-height:1.8;">Seguí estos pasos para hacer tu sistema resistente a tu ausencia:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#2563eb;margin-top:0;">1. Documentá</h4>
    <p style="line-height:1.7;margin-bottom:0;">Todo lo que tenés en la cabeza, pasalo a papel o pantalla. Procedimientos, contactos, decisiones pasadas y por qué se tomaron. Si solo está en tu cabeza, no existe para el sistema.</p>
  </div>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#2563eb;margin-top:0;">2. Enseñá</h4>
    <p style="line-height:1.7;margin-bottom:0;">No delegues solo la tarea — enseñá el criterio. "Te pido que hagas X" es delegación. "Fijate en estos criterios para decidir si hacemos X o Y" es formación. Lo primero necesita supervisión; lo segundo crea autonomía.</p>
  </div>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#2563eb;margin-top:0;">3. Soltá</h4>
    <p style="line-height:1.7;margin-bottom:0;">Dejá que otros se equivoquen. Es el precio de la autonomía. Si corregís todo, nadie aprende. Los errores pequeños ahora previenen errores catastróficos después.</p>
  </div>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#2563eb;margin-top:0;">4. Desaparecé</h4>
    <p style="line-height:1.7;margin-bottom:0;">Hacé "ensayos de ausencia": un día sin responder mensajes, una semana sin ir a la reunión. Observá qué pasa. Lo que se rompe te dice qué todavía necesita distribución.</p>
  </div>
</div>

<h3 style="color:#2563eb;">🎯 La Paradoja del Éxito</h3>
<p style="line-height:1.8;">El éxito del liderazgo distribuido tiene una paradoja incómoda: <strong>si funciona, nadie te va a agradecer</strong>. Porque todo parece funcionar "solo". Las cooperativas más exitosas de Argentina no tienen un líder famoso — tienen cientos de personas que saben qué hacer sin que nadie les diga. Y eso es exactamente el punto.</p>

<p style="line-height:1.8;">Si tu ego necesita reconocimiento, el liderazgo distribuido va a ser difícil. Pero si lo que necesitás es impacto real — que las cosas funcionen, que la gente crezca, que el barrio mejore — entonces no hay herramienta más poderosa que hacerte prescindible.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris construye cosas que no llevan su nombre. Planta árboles cuya sombra no va a disfrutar. Y cuando alguien pregunta quién hizo esto, la respuesta es: 'lo hicimos entre todos'. Esa es la señal de que el trabajo está hecho."</em></p>
</blockquote>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 28,
      isRequired: true,
    },
    {
      courseId,
      title: 'Mentoreo y Acompañamiento',
      description: 'Acompañar el crecimiento de otros como el Hombre Gris acompaña al lector.',
      content: `
<div style="background:linear-gradient(135deg,#9333ea 0%,#581c87 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🌱 Mentoreo y Acompañamiento</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">El Hombre Gris no te dice qué hacer. Te hace preguntas hasta que vos descubrís qué tenés que hacer. Esa es la esencia del mentoreo: no dar respuestas sino acompañar el proceso de alguien que está buscando las suyas. En Argentina, donde la cultura del "yo te explico cómo es" reemplaza la escucha genuina, aprender a mentorear es un acto revolucionario.</p>
</div>

<h3 style="color:#9333ea;">🤝 ¿Qué Es un Mentor?</h3>
<p style="line-height:1.8;">Un mentor no es un jefe, ni un profesor, ni un terapeuta. Es alguien que <strong>ya recorrió un camino y acompaña a otro que está empezando a recorrerlo</strong>. La relación se basa en tres cosas:</p>
<ul style="line-height:2;">
  <li><strong>Experiencia compartida:</strong> el mentor sabe cómo se siente lo que el otro está viviendo, porque lo vivió.</li>
  <li><strong>Preguntas más que respuestas:</strong> "¿Qué opciones ves?" funciona mejor que "Hacé esto".</li>
  <li><strong>Compromiso con el crecimiento del otro:</strong> no con que haga lo que vos harías, sino con que desarrolle su propio criterio.</li>
</ul>

<p style="line-height:1.8;">Pensá en la diferencia entre un GPS y un guía de montaña. El GPS te dice "gire a la derecha en 200 metros" — si se desconecta, estás perdido. El guía te enseña a leer el terreno, identificar senderos, orientarte por el sol. Si el guía se va, vos podés seguir solo. <strong>El mentor es el guía, no el GPS.</strong></p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Tuviste algún mentor en tu vida? Puede ser formal o informal: un tío, un jefe, una vecina, un amigo mayor. ¿Qué hizo esa persona que te marcó? Probablemente no te dio instrucciones — te dio confianza en tu propia capacidad.</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#9333ea;">📋 El Arquetipo del Hombre Gris como Mentor</h3>
<p style="line-height:1.8;">En "El Instante del Hombre Gris", el narrador funciona exactamente como un mentor. No te ordena que cambies — te muestra cómo funciona el sistema y te deja sacar tus propias conclusiones. Te dice <em>"jugamos el mismo juego"</em>, no <em>"hacé lo que yo digo"</em>. Este es el modelo de mentoría que necesitamos multiplicar:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#9333ea;margin-top:0;">🪞 Espejo</h4>
    <p style="line-height:1.7;margin-bottom:0;">Reflejale a la otra persona lo que ves en ella que ella todavía no ve. "¿Te diste cuenta de que cada vez que hablás de ese proyecto se te iluminan los ojos?" A veces el mayor regalo es ayudar a alguien a verse.</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#9333ea;margin-top:0;">🔍 Lupa</h4>
    <p style="line-height:1.7;margin-bottom:0;">Ayudá a amplificar lo que ya está ahí. No inventés talentos — encontrá los que existen y proponé formas de desarrollarlos. "Tenés muy buen ojo para detectar problemas. ¿Qué pasaría si lideras la auditoría?"</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#9333ea;margin-top:0;">🧭 Brújula</h4>
    <p style="line-height:1.7;margin-bottom:0;">Cuando la persona está perdida, no le des el mapa — ayudala a encontrar el norte. "¿Qué es lo que más te importa de todo esto?" "Si no tuvieras miedo, ¿qué harías?"</p>
  </div>
  <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#9333ea;margin-top:0;">🛡️ Red</h4>
    <p style="line-height:1.7;margin-bottom:0;">Creá un espacio seguro para que se equivoque. "Probá, y si sale mal lo vemos juntos". En un país donde equivocarse se castiga, la red del mentor es el espacio donde aprender es posible.</p>
  </div>
</div>

<h3 style="color:#9333ea;">📝 Diseño de una Relación de Mentoría</h3>
<p style="line-height:1.8;">Si querés ser mentor (o buscar uno), seguí este template para estructurar la relación:</p>

<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Acuerdo inicial:</strong> "¿Qué esperás de esto? ¿Con qué frecuencia nos juntamos? ¿Cómo lo evaluamos?" — 30 minutos de conversación honesta al principio ahorra meses de malentendidos.</li>
    <li><strong>Frecuencia:</strong> Un encuentro cada 2-3 semanas es suficiente. Más frecuente genera dependencia; menos frecuente pierde continuidad.</li>
    <li><strong>Formato:</strong> Que la persona mentoreada traiga la agenda. "¿Qué tema querés trabajar hoy?" El que busca define el rumbo.</li>
    <li><strong>Duración:</strong> Pactar un período (3-6 meses) con evaluación. No es un compromiso de por vida.</li>
    <li><strong>Cierre:</strong> Toda mentoría tiene que terminar. El éxito se mide por cuánto la persona puede caminar sola.</li>
  </ol>
</div>

<p style="line-height:1.8;">No necesitás un título para ser mentor. Si tenés experiencia en algo — organizar, emprender, resolver conflictos, cocinar para 50 personas, criar hijos solos — <strong>hay alguien que necesita que le cuentes cómo hiciste</strong>. Y lo que le cuentes no tiene que ser un discurso perfecto. Tiene que ser verdadero.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris mentora sin usar esa palabra. Acompaña. Pregunta. Espera. Y cuando el otro da el paso solo, sonríe desde atrás, sabiendo que el trabajo de verdad siempre lo hizo el que caminó."</em></p>
</blockquote>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 28,
      isRequired: true,
    },
    {
      courseId,
      title: 'Liderar en Crisis',
      description: 'Mantener un grupo funcional cuando el contexto se derrumba — la especialidad argentina.',
      content: `
<div style="background:linear-gradient(135deg,#b91c1c 0%,#450a0a 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🌪️ Liderar en Crisis</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Si hay algo para lo cual los argentinos deberíamos estar preparados, es para la crisis. Y sin embargo, cada vez que una llega nos agarra como si fuera la primera. Devaluación, inflación, pandemia, default, cepo. El contexto cambia de golpe y los grupos se paralizan, se fragmentan o explotan. ¿Cómo se mantiene un equipo funcional cuando el piso se mueve bajo los pies? Eso es lo que vamos a aprender.</p>
</div>

<h3 style="color:#b91c1c;">🧠 La Psicología de la Crisis</h3>
<p style="line-height:1.8;">Cuando una crisis golpea, el cerebro humano entra en <strong>modo supervivencia</strong>. La amígdala se activa, el pensamiento racional se reduce, y las personas hacen tres cosas predecibles:</p>
<ol style="line-height:2;">
  <li><strong>Buscan un líder fuerte</strong> — "¿quién nos dice qué hacer?"</li>
  <li><strong>Se aferran a lo conocido</strong> — aunque lo conocido ya no funcione.</li>
  <li><strong>Se vuelven desconfiadas</strong> — "cada uno se salva solo".</li>
</ol>

<p style="line-height:1.8;">Es exactamente lo que pasa en Argentina cada vez que el dólar salta, que cierran las importaciones, o que cambia el gobierno. La reacción colectiva es <strong>sálvese quien pueda</strong>. Y en ese contexto, sostener un grupo es como mantener una vela encendida en medio del viento.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en la última crisis que viviste en grupo (laboral, familiar, comunitaria). ¿Qué pasó con la cohesión del grupo? ¿Se unieron o se fragmentaron? ¿Quién sostuvo las cosas? ¿Cómo lo hizo?</p>
  <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
</div>

<h3 style="color:#b91c1c;">🛡️ El Protocolo de Crisis para Grupos</h3>
<p style="line-height:1.8;">Ronald Heifetz, de la Universidad de Harvard, distingue entre <strong>problemas técnicos</strong> (tienen solución conocida) y <strong>desafíos adaptativos</strong> (requieren que las personas cambien). Las crisis argentinas son casi siempre adaptativas: no alcanza con aplicar una solución — hay que reimaginar cómo funcionar con las nuevas reglas.</p>

<p style="line-height:1.8;">Protocolo para liderar un grupo en crisis:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b91c1c;margin-top:0;">Hora 0-24: Contener</h4>
    <p style="line-height:1.7;margin-bottom:0;">Lo primero es bajar la ansiedad. Convocar al grupo (aunque sea por WhatsApp), nombrar lo que está pasando ("sí, esto es grave"), y dar un siguiente paso concreto ("mañana a las 10 nos juntamos"). La gente necesita sentir que alguien tiene un plan, aunque sea un plan para hacer un plan.</p>
  </div>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b91c1c;margin-top:0;">Día 2-7: Diagnosticar</h4>
    <p style="line-height:1.7;margin-bottom:0;">Separar lo urgente de lo importante. ¿Qué se rompió? ¿Qué sigue funcionando? ¿Qué recursos tenemos? Hacer inventario frío. No tomar decisiones irreversibles con información incompleta.</p>
  </div>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b91c1c;margin-top:0;">Semana 2-4: Adaptar</h4>
    <p style="line-height:1.7;margin-bottom:0;">Rediseñar lo que ya no funciona. Renegociar acuerdos. Redistribuir cargas. Esta es la fase más difícil porque implica soltar cosas que antes valorábamos. "Ya no podemos hacer X, ¿qué podemos hacer en su lugar?"</p>
  </div>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b91c1c;margin-top:0;">Mes 2+: Reconstruir</h4>
    <p style="line-height:1.7;margin-bottom:0;">Crear nuevas rutinas. Celebrar pequeños logros. Documentar lo aprendido. Integrar lo vivido en la identidad del grupo: "somos los que sobrevivimos a esto juntos".</p>
  </div>
</div>

<h3 style="color:#b91c1c;">📋 Pre-Mortem: Prepararse Antes de que Pase</h3>
<p style="line-height:1.8;">En medicina se hace autopsia — revisar qué pasó después de una muerte. En gestión de proyectos, Gary Klein inventó el <strong>pre-mortem</strong>: imaginar que el proyecto ya fracasó y preguntarse por qué. Aplicalo a tu organización:</p>

<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <p style="line-height:1.8;"><strong>Ejercicio Pre-Mortem:</strong> Imaginá que es dentro de 6 meses y tu proyecto/organización colapsó. Escribí:</p>
  <ol style="line-height:2;">
    <li>¿Qué crisis externa lo provocó? (devaluación, pérdida de un miembro clave, corte de financiamiento)</li>
    <li>¿Cuál fue la primera señal que ignoramos?</li>
    <li>¿Qué decisión tomamos (o no tomamos) que aceleró el colapso?</li>
    <li>¿Qué hubiéramos podido hacer ANTES para estar preparados?</li>
  </ol>
  <p style="line-height:1.8;margin-bottom:0;">Ahora, <strong>hacé esas cosas preventivas</strong>. El pre-mortem convierte la ansiedad sobre el futuro en acción preventiva hoy.</p>
</div>

<p style="line-height:1.8;">En Argentina, este ejercicio debería ser obligatorio cada 6 meses. No porque seamos pesimistas, sino porque somos <strong>realistas</strong>. El que se prepara para la tormenta no es miedoso — es sabio.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no se sorprende cuando la crisis llega. Se preparó en calma para lo que otros enfrentarán en pánico. Y cuando el viento sacude todo, es la raíz que sostiene el árbol — invisible, silenciosa, imprescindible."</em></p>
</blockquote>
      `,
      orderIndex: 9,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tu Proyecto de Liderazgo',
      description: 'Diseñar tu experimento de liderazgo distribuido de 90 días.',
      content: `
<div style="background:linear-gradient(135deg,#0891b2 0%,#164e63 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🚀 Tu Proyecto de Liderazgo</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Llegaste al final de este curso, pero este no es un final — es un principio. Todo lo que aprendiste sobre liderazgo distribuido, facilitación, feedback, conflicto, mentoría y crisis no sirve de nada si se queda en la teoría. Hoy vas a diseñar tu propio experimento de liderazgo de 90 días: un proyecto concreto, con personas reales, en tu contexto real.</p>
</div>

<h3 style="color:#0891b2;">📖 Historia Real: La Asamblea de Mendoza</h3>
<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <p style="line-height:1.8;">En 2019, un grupo de 15 vecinos del Gran Mendoza empezó a reunirse cada dos semanas en la casa de Silvia, una jubilada de 62 años. No tenían agenda política, no tenían financiamiento, no tenían "un líder". Tenían una queja compartida: la recolección de residuos en su zona era un desastre y nadie les daba respuesta.</p>
  <p style="line-height:1.8;">Usando principios de liderazgo distribuido — sin saberlo con ese nombre — cada uno asumió un rol según lo que sabía hacer. Raúl, contador, armó la base de datos de los reclamos. Luciana, estudiante de comunicación, manejó las redes. Don Héctor, que conocía a medio barrio, golpeó puertas. Silvia facilitaba las reuniones con una regla simple: "todos hablan, nadie acusa".</p>
  <p style="line-height:1.8;">A los seis meses tenían 200 firmas, un mapeo de basurales clandestinos con fotos georeferenciadas, y una propuesta formal para el Concejo Deliberante. A los nueve meses, el municipio creó un punto de acopio nuevo en la zona. A los doce meses, tres barrios vecinos pidieron usar su modelo para replicarlo.</p>
  <p style="line-height:1.8;margin-bottom:0;">Ninguno de los 15 se postuló para nada. Ninguno salió en los diarios. <strong>Pero cambiaron su barrio sin pedirle permiso a nadie.</strong> Cuando les preguntaron quién era el líder, Silvia respondió: "Acá no hay líder. Hay 15 personas que decidieron dejar de quejarse y empezar a hacer."</p>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Qué tema concreto te mueve lo suficiente como para reunir a 5-10 personas y trabajar durante 90 días? No tiene que ser algo enorme. Puede ser mejorar una plaza, crear un grupo de estudio, organizar una feria, resolver un problema de tu edificio.</p>
  <p><em>Tomá 5 minutos para pensarlo antes de continuar.</em></p>
</div>

<h3 style="color:#0891b2;">📋 Diseñá Tu Experimento de 90 Días</h3>
<p style="line-height:1.8;">Completá esta guía para diseñar tu proyecto de liderazgo distribuido:</p>

<div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <h4 style="color:#0891b2;margin-top:0;">Fase 1: Definición (Semana 1-2)</h4>
  <ol style="line-height:2.2;">
    <li><strong>El problema:</strong> ¿Qué querés resolver o mejorar? Sé específico. No "mejorar el barrio" sino "que haya iluminación en las tres cuadras de Calle San Martín entre 4ta y 7ma".</li>
    <li><strong>Las personas:</strong> ¿A quiénes convocás? Mínimo 3, máximo 10 para empezar. Que sean diversos en habilidades.</li>
    <li><strong>La primera reunión:</strong> ¿Dónde, cuándo, con qué pregunta arrancás? (No "vengan que les cuento mi idea" sino "vengan que quiero escuchar qué piensan sobre...")</li>
  </ol>
</div>

<div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <h4 style="color:#0891b2;margin-top:0;">Fase 2: Organización (Semana 3-6)</h4>
  <ol style="line-height:2.2;">
    <li><strong>Roles distribuidos:</strong> ¿Quién sabe qué? ¿Cómo distribuís responsabilidades según las fortalezas de cada uno?</li>
    <li><strong>Reglas de juego:</strong> ¿Cómo toman decisiones? ¿Cuándo se reúnen? ¿Cómo se comunican entre reuniones?</li>
    <li><strong>Pequeño logro rápido:</strong> ¿Cuál es una victoria chica que pueden conseguir en las primeras 4 semanas para generar impulso?</li>
  </ol>
</div>

<div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <h4 style="color:#0891b2;margin-top:0;">Fase 3: Ejecución (Semana 7-12)</h4>
  <ol style="line-height:2.2;">
    <li><strong>Plan de acción:</strong> ¿Qué hace cada persona, cuándo, con qué recursos?</li>
    <li><strong>Protocolo de crisis:</strong> ¿Qué pasa si alguien se va? ¿Si el contexto cambia? ¿Si hay conflicto?</li>
    <li><strong>Evaluación:</strong> ¿Cómo van a saber si lo que hacen funciona? ¿Qué indicadores miden?</li>
  </ol>
</div>

<h3 style="color:#0891b2;">🔑 Las 5 Reglas de Tu Experimento</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1rem;text-align:center;">
    <p style="font-size:2rem;margin:0;">1️⃣</p>
    <p style="line-height:1.7;margin-bottom:0;"><strong>No seas el héroe.</strong> Facilitá, no controlés.</p>
  </div>
  <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1rem;text-align:center;">
    <p style="font-size:2rem;margin:0;">2️⃣</p>
    <p style="line-height:1.7;margin-bottom:0;"><strong>Empezá chico.</strong> Un barrio, un tema, un grupo.</p>
  </div>
  <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1rem;text-align:center;">
    <p style="font-size:2rem;margin:0;">3️⃣</p>
    <p style="line-height:1.7;margin-bottom:0;"><strong>Documentá todo.</strong> Lo que funciona y lo que no.</p>
  </div>
  <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:1rem;text-align:center;">
    <p style="font-size:2rem;margin:0;">4️⃣</p>
    <p style="line-height:1.7;margin-bottom:0;"><strong>Celebrá las pequeñas victorias.</strong> El cambio se construye con impulso.</p>
  </div>
</div>

<p style="line-height:1.8;">No tenés que esperar a que llegue el momento perfecto. El momento perfecto no existe — especialmente en Argentina. Lo que existe es <strong>hoy, con lo que tenés, donde estás</strong>. Y eso es más que suficiente para empezar.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no espera que el mundo cambie para actuar. Actúa, y al actuar, el mundo cambia un poco. Y ese poco, multiplicado por millones de personas que hacen lo mismo, es la revolución silenciosa que Argentina necesita. No mañana. Hoy. No otro. Vos."</em></p>
</blockquote>
      `,
      orderIndex: 10,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Inserted', lessons.length, 'lessons for course 18');

  // Quiz
  const existingQuiz18 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  let quizId18: number;
  if (existingQuiz18.length > 0) {
    quizId18 = existingQuiz18[0].id;
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId18));
  } else {
    const [newQuiz] = await db.insert(courseQuizzes).values({
      courseId,
      title: 'Evaluación: Liderazgo Distribuido',
      description: 'Evaluá tu comprensión del liderazgo distribuido y tu capacidad para aplicarlo.',
      passingScore: 70,
      timeLimit: 20,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();
    quizId18 = newQuiz.id;
  }

  const questions18 = [
    {
      quizId: quizId18,
      type: 'multiple_choice' as const,
      question: '¿Cuál es la principal diferencia entre el liderazgo distribuido y la ausencia de liderazgo?',
      options: JSON.stringify([
        'No hay diferencia, en ambos casos nadie manda',
        'En el liderazgo distribuido, la función de conducción existe pero rota según el contexto y las capacidades',
        'El liderazgo distribuido solo funciona en grupos pequeños',
        'El liderazgo distribuido requiere que todos tengan el mismo nivel de experiencia',
      ]),
      correctAnswer: 'En el liderazgo distribuido, la función de conducción existe pero rota según el contexto y las capacidades',
      explanation: 'El liderazgo distribuido no elimina la conducción — la distribuye según quién tiene la capacidad más relevante para cada situación.',
      orderIndex: 1,
    },
    {
      quizId: quizId18,
      type: 'true_false' as const,
      question: 'Según el curso, el "radio de confianza" en Argentina es amplio y la gente confía fácilmente en desconocidos.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Falso',
      explanation: 'El radio de confianza en Argentina es cortísimo: tendemos a confiar solo en la familia cercana y sospechar de todos los demás, lo que genera enormes costos de transacción.',
      orderIndex: 2,
    },
    {
      quizId: quizId18,
      type: 'multiple_choice' as const,
      question: '¿Qué es la "empatía ruinosa" según Kim Scott?',
      options: JSON.stringify([
        'Ser demasiado empático con los enemigos',
        'Ser directo pero sin empatía, humillando al otro',
        'Callar la verdad para no herir, permitiendo que los problemas persistan',
        'Mostrar empatía solo cuando conviene políticamente',
      ]),
      correctAnswer: 'Callar la verdad para no herir, permitiendo que los problemas persistan',
      explanation: 'La empatía ruinosa es cuando callamos feedback importante por miedo a herir. Parece compasión, pero en realidad permite que los problemas se agraven.',
      orderIndex: 3,
    },
    {
      quizId: quizId18,
      type: 'multiple_choice' as const,
      question: 'Un compañero de tu cooperativa llega tarde a todas las reuniones. Usando el método SBI, ¿cuál sería el feedback más efectivo?',
      options: JSON.stringify([
        '"Siempre llegás tarde, sos un irresponsable"',
        '"En las últimas tres reuniones llegaste 30 minutos tarde. Eso hizo que el grupo te esperara y perdiéramos casi una hora y media de trabajo colectivo"',
        '"No pasa nada, cada uno tiene sus tiempos"',
        '"Si no podés llegar a horario, mejor no vengas"',
      ]),
      correctAnswer: 'En las últimas tres reuniones llegaste 30 minutos tarde. Eso hizo que el grupo te esperara y perdiéramos casi una hora y media de trabajo colectivo',
      explanation: 'El método SBI describe la Situación específica, el Comportamiento observable y el Impacto concreto, sin atacar a la persona ni minimizar el problema.',
      orderIndex: 4,
    },
    {
      quizId: quizId18,
      type: 'true_false' as const,
      question: 'Según el curso, si tu proyecto funciona perfectamente sin vos durante una semana, eso significa que fracasaste como líder.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Falso',
      explanation: 'Al contrario: que el proyecto funcione sin vos es la prueba máxima de éxito en el liderazgo distribuido. Significa que construiste autonomía, no dependencia.',
      orderIndex: 5,
    },
    {
      quizId: quizId18,
      type: 'multiple_choice' as const,
      question: '¿Cuál es la primera acción recomendada en las primeras 24 horas de una crisis grupal?',
      options: JSON.stringify([
        'Tomar decisiones rápidas e irreversibles antes de que empeore',
        'Esperar a que la crisis pase sola para no generar pánico',
        'Convocar al grupo, nombrar lo que está pasando y dar un siguiente paso concreto',
        'Buscar un líder fuerte que tome el control',
      ]),
      correctAnswer: 'Convocar al grupo, nombrar lo que está pasando y dar un siguiente paso concreto',
      explanation: 'En las primeras horas de crisis, lo esencial es contener: juntar a la gente, nombrar la situación sin minimizarla, y proponer un próximo paso concreto para reducir la ansiedad.',
      orderIndex: 6,
    },
    {
      quizId: quizId18,
      type: 'multiple_choice' as const,
      question: '¿Qué es un "pre-mortem" y para qué sirve?',
      options: JSON.stringify([
        'Una revisión de lo que salió mal después de un fracaso',
        'Un ejercicio donde imaginás que el proyecto ya fracasó y analizás por qué, para tomar acciones preventivas',
        'Una técnica de meditación para reducir la ansiedad sobre el futuro',
        'Un documento legal que protege al grupo en caso de crisis',
      ]),
      correctAnswer: 'Un ejercicio donde imaginás que el proyecto ya fracasó y analizás por qué, para tomar acciones preventivas',
      explanation: 'El pre-mortem de Gary Klein invierte la lógica: en vez de esperar al fracaso para aprender, imagina el fracaso por adelantado y trabaja para prevenirlo.',
      orderIndex: 7,
    },
    {
      quizId: quizId18,
      type: 'true_false' as const,
      question: 'El mentor ideal da respuestas claras y directas para que la persona mentoreada no pierda tiempo equivocándose.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Falso',
      explanation: 'El mentor acompaña con preguntas, no con respuestas. Como un guía de montaña (no un GPS), enseña a la persona a leer el terreno y tomar sus propias decisiones, incluso si eso implica equivocarse.',
      orderIndex: 8,
    },
  ];

  for (const q of questions18) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions18.length, 'questions for course 18');
}

async function seedCourse19(authorId: number) {
  console.log('--- Course 19: La Metamorfosis ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'la-metamorfosis')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'La Metamorfosis: Del Camello al León al Niño',
      slug: 'la-metamorfosis',
      description: 'El viaje interior definitivo. Inspirado en las tres transformaciones de Nietzsche y la filosofía del Hombre Gris, este curso te guía a través de una metamorfosis personal: de cargar el peso del sistema (Camello), a aprender a decir No (León), a crear desde la libertad (Niño). El cierre del camino y el comienzo de todo.',
      excerpt: 'Del peso heredado a la creación libre. Tu transformación empieza acá.',
      category: 'hombre-gris',
      level: 'advanced',
      duration: 320,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      orderIndex: 19,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 19:', course[0].title);
  } else {
    console.log('Found existing course 19:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Camello: Cargar el Peso del Sistema',
      description: 'Diagnosticar las cargas heredadas que llevás sin haberlas elegido.',
      content: `
<div style="background:linear-gradient(135deg,#92400e 0%,#451a03 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🐪 El Camello: Cargar el Peso del Sistema</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Nietzsche, en "Así Habló Zaratustra", describe tres transformaciones del espíritu. La primera es el Camello: el espíritu que busca las cargas más pesadas y dice <em>"yo puedo"</em>. Se arrodilla, acepta el peso, y cruza el desierto solo. En Argentina, nacemos camellos. Cargamos miedos que no son nuestros, mandatos que no elegimos, deudas emocionales que heredamos. Este curso empieza con una pregunta: <strong>¿qué estás cargando que no te pertenece?</strong></p>
</div>

<h3 style="color:#92400e;">🎒 El Inventario del Camello Argentino</h3>
<p style="line-height:1.8;">El camello no se queja de la carga. La lleva con orgullo. En Argentina, ser "el que se la banca" es una virtud cultural. <em>"Yo laburo de sol a sol"</em>, <em>"Yo me arreglo solo"</em>, <em>"Yo no le pido nada a nadie"</em>. Estas frases, que suenan a fortaleza, muchas veces esconden una trampa: <strong>confundir sufrir con ser fuerte</strong>.</p>

<p style="line-height:1.8;">Las cargas que llevamos tienen origen. Vienen de algún lado. Pensalo como una mochila que alguien armó antes de que nacieras y te la pusieron al hombro sin preguntarte:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#92400e;margin-top:0;">🏠 Mandatos familiares</h4>
    <p style="line-height:1.7;margin-bottom:0;">"En esta familia somos laburantes". "Nosotros no pedimos ayuda". "Los hombres no lloran". "Las mujeres se sacrifican". Frases que parecen identidad pero son jaulas.</p>
  </div>
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#92400e;margin-top:0;">📜 Guiones culturales</h4>
    <p style="line-height:1.7;margin-bottom:0;">"Los argentinos somos así". "Acá no se puede". "Si naciste pobre, morís pobre". Narrativas colectivas que limitan antes de que empieces.</p>
  </div>
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#92400e;margin-top:0;">💰 Miedos económicos heredados</h4>
    <p style="line-height:1.7;margin-bottom:0;">Tus abuelos perdieron todo en el Rodrigazo. Tus padres, en el 2001. Vos creciste con la certeza de que en cualquier momento se puede perder todo. Esa ansiedad no es tuya — la heredaste.</p>
  </div>
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#92400e;margin-top:0;">🤐 Silencios históricos</h4>
    <p style="line-height:1.7;margin-bottom:0;">Lo que no se habló de la dictadura. Los familiares que "desaparecieron" y de los que nadie habla. Los traumas nacionales que cargamos sin procesar.</p>
  </div>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Cerrá los ojos un momento. Imaginá que llevás una mochila invisible. ¿Qué hay adentro? ¿Qué mandatos familiares? ¿Qué miedos? ¿Qué "así se hace" que nunca cuestionaste? Escribí 5 cosas que estás cargando que no elegiste cargar.</p>
  <p><em>Tomá 5 minutos para este ejercicio. Es importante.</em></p>
</div>

<h3 style="color:#92400e;">🏜️ El Desierto del Camello</h3>
<p style="line-height:1.8;">El camello cruza el desierto con su carga. El desierto, en la metáfora de Nietzsche, es la vida vivida bajo el peso del "deber ser". Es el lugar donde hacemos lo que se espera de nosotros, donde cumplimos con el guión escrito por otros, donde nuestra energía se gasta en <strong>mantener la estructura en vez de cuestionar si la estructura tiene sentido</strong>.</p>

<p style="line-height:1.8;">No todo lo que carga el camello es malo. Hay cargas que elegimos y nos fortalecen: la responsabilidad hacia los hijos, el compromiso con un trabajo que amamos, las obligaciones que nacen del afecto. La clave no es soltar todo — es <strong>distinguir lo que cargás por elección de lo que cargás por inercia</strong>. Lo que te da sentido de lo que solo te da peso.</p>

<p style="line-height:1.8;">El Hombre Gris fue camello. Cargó el peso del sistema durante años. Pero un día, en el desierto de su propia vida, se hizo la pregunta que cambia todo: <em>"¿Es esto lo que yo quiero, o es lo que me dijeron que debía querer?"</em></p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris cargó durante años las expectativas de un sistema que no lo veía. Hasta que entendió algo simple: no era fuerte por cargar mucho. Era libre cuando eligió qué cargar y qué soltar."</em></p>
</blockquote>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'El Desierto Interior',
      description: 'Confrontar el vacío que aparece cuando dejás de cargar lo que no te pertenece.',
      content: `
<div style="background:linear-gradient(135deg,#78716c 0%,#292524 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🏜️ El Desierto Interior</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Hay un momento — a veces llega a los 25, a veces a los 40, a veces a los 60 — en que algo se quiebra adentro. No es una crisis espectacular. Es una sensación quieta de que <strong>lo que estabas haciendo ya no tiene sentido</strong>. El trabajo que antes te llenaba ahora te vacía. Las relaciones que mantenías por inercia se sienten como actuación. La persona que ves en el espejo se parece a vos pero no termina de ser vos. Bienvenido al desierto interior.</p>
</div>

<h3 style="color:#78716c;">🌑 El Momento del Quiebre</h3>
<p style="line-height:1.8;">El existencialista Martin Heidegger hablaba de la <strong>angustia ontológica</strong>: el momento en que de golpe todo lo familiar se vuelve extraño. No es depresión (aunque se le parece). Es la señal de que el camello llegó al centro del desierto y <strong>el peso que cargaba ya no lo sostiene — lo aplasta</strong>.</p>

<p style="line-height:1.8;">En Argentina este momento tiene detonantes propios: la enésima crisis económica que te quita lo que construiste, el trabajo que perdiste después de darlo todo, el momento en que tu hijo te pregunta "¿para qué estudiás si igual no alcanza?". O simplemente un domingo a la tarde, mirando el techo, con la sensación de que <em>tiene que haber algo más que esto</em>.</p>

<p style="line-height:1.8;">La reacción automática frente al desierto interior es <strong>huir</strong>. Llenarnos de ruido. Más trabajo, más redes sociales, más actividades, más alcohol, más compras. Cualquier cosa con tal de no quedarse en silencio con la pregunta incómoda: <em>¿Quién soy cuando dejo de hacer lo que se espera de mí?</em></p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Tuviste alguna vez esa sensación de que "esto no es todo"? ¿Que la vida que estás viviendo no es exactamente la tuya sino una versión que armaron otros? No la juzgues. Solo reconocela. ¿Cuándo fue? ¿Qué hiciste con esa sensación?</p>
  <p><em>Tomá 5 minutos para escribirlo. No lo censures.</em></p>
</div>

<h3 style="color:#78716c;">🕳️ La Función del Vacío</h3>
<p style="line-height:1.8;">Acá está la paradoja que la cultura del "siempre ocupado" no quiere que sepas: <strong>el vacío es necesario</strong>. Sin el desierto, el camello nunca se preguntaría por qué carga lo que carga. Sin la crisis, no hay transformación. Sin el silencio, no hay espacio para lo nuevo.</p>

<p style="line-height:1.8;">El psicólogo James Hollis lo llama <strong>"la pregunta del mediodía"</strong>: a mitad de la vida (literal o metafórica), la persona descubre que el guión que estaba siguiendo no era el suyo. Y tiene dos opciones: volver a llenarse de ruido y seguir como estaba, o <strong>quedarse en el desierto el tiempo suficiente como para escuchar su propia voz</strong>.</p>

<p style="line-height:1.8;">Es como un vaso que está lleno de agua sucia. Para llenarlo con agua limpia, primero tenés que vaciarlo. El vacío no es el problema — es la <strong>condición necesaria para lo que viene</strong>.</p>

<h3 style="color:#78716c;">🧭 Navegando el Desierto</h3>
<p style="line-height:1.8;">El desierto interior no se cruza rápido ni cómodo. Pero se puede navegar con algunas prácticas:</p>

<div style="background:#f5f5f4;border:1px solid #d6d3d1;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ul style="line-height:2.2;">
    <li><strong>Tolerá la incomodidad.</strong> No llenes el silencio con ruido. Sentate con la pregunta sin apurarte a encontrar la respuesta.</li>
    <li><strong>Escribí.</strong> El diario es el mapa del desierto. No tiene que ser profundo ni bonito. "Hoy me sentí vacío" es suficiente para empezar.</li>
    <li><strong>Buscá testigos, no salvadores.</strong> No necesitás a alguien que te diga qué hacer. Necesitás a alguien que escuche sin juzgar mientras vos descubrís qué querés.</li>
    <li><strong>Distinguí crisis de transformación.</strong> Si estás en riesgo real (depresión profunda, pensamientos de daño), buscá ayuda profesional. El desierto interior no es un sustituto de la terapia.</li>
  </ul>
</div>

<h3 style="color:#78716c;">🇦🇷 El Desierto Colectivo Argentino</h3>
<p style="line-height:1.8;">Argentina vive en un desierto colectivo permanente. El país que nos prometieron nunca llegó. El "granero del mundo", la "potencia emergente", el "futuro brillante" — todo narrativa, poco resultado. Y esa decepción colectiva genera la misma pregunta a nivel social que a nivel personal: <em>¿Esto es todo lo que somos?</em></p>

<p style="line-height:1.8;">Pero así como el desierto personal es la puerta de la transformación individual, el desierto colectivo argentino es la puerta de una transformación social. El país que no cumplió la promesa es un país que necesita una promesa nueva — y esa promesa no va a venir de arriba. Va a salir de personas que cruzaron su propio desierto y descubrieron qué es lo que realmente les importa.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris conoce el desierto. Caminó días enteros sin encontrar sentido. Pero no huyó. Se quedó hasta que el silencio le devolvió su propia voz. Y cuando esa voz habló, no repitió lo que otros decían. Dijo algo nuevo."</em></p>
</blockquote>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'El León: Aprender a Decir No',
      description: 'La segunda transformación: de la obediencia a los límites sagrados.',
      content: `
<div style="background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🦁 El León: Aprender a Decir No</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">La segunda transformación de Nietzsche es la más feroz. En el desierto, el camello se convierte en león. Y la primera palabra que aprende el león es <strong>"NO"</strong>. No a lo que otros esperan. No a lo que la cultura impone. No al "así se hace" que nunca cuestionaste. El león no crea todavía — primero tiene que destruir las jaulas. Tiene que conquistar el derecho a ser libre diciendo el <em>no</em> más sagrado que existe: el no a quien le dijeron quién ser.</p>
</div>

<h3 style="color:#dc2626;">⚔️ El Rugido que Libera</h3>
<p style="line-height:1.8;">En la lección del Camello identificaste lo que cargás sin haber elegido. En el Desierto te sentaste con el vacío. Ahora viene la parte más difícil y más necesaria: <strong>empezar a soltar</strong>.</p>

<p style="line-height:1.8;">Nietzsche lo describe como la batalla contra el "Gran Dragón", una criatura cubierta de escamas doradas, y en cada escama está escrito: <em>"Tú debes"</em>. "Debes ser exitoso". "Debes ganar bien". "Debes tener hijos". "Debes bancar todo en silencio". El león enfrenta al dragón y dice: <em>"Yo quiero"</em>.</p>

<p style="line-height:1.8;">En la vida real, esto se traduce en algo concreto: <strong>aprender a poner límites</strong>. No los límites que se ponen con bronca o agresión, sino los que se ponen con claridad y amor propio. El "no" que no ataca al otro sino que protege lo tuyo.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Hacé una lista de 5 cosas a las que necesitás decirle "no" y todavía no pudiste. Pueden ser compromisos, relaciones, hábitos, mandatos. Para cada una, escribí: ¿Por qué me cuesta decir que no? ¿Qué estoy protegiendo al decir que sí?</p>
  <p><em>Tomá 5 minutos. Este ejercicio puede ser incómodo. Eso es buena señal.</em></p>
</div>

<h3 style="color:#dc2626;">🛡️ El "No" Como Acto Creativo</h3>
<p style="line-height:1.8;">En Argentina, decir "no" tiene mala prensa. Si decís que no en el trabajo, "no sos jugador de equipo". Si decís que no en la familia, "sos un desagradecido". Si decís que no a una demanda social, "te creés mejor que los demás". La cultura nos entrena para el "sí" automático — el "sí" del camello que acepta toda carga.</p>

<p style="line-height:1.8;">Pero cada "no" consciente es un "sí" a otra cosa. Cuando decís "no" a trabajar sábados sin paga, estás diciendo "sí" a tu tiempo. Cuando decís "no" a una relación que te daña, estás diciendo "sí" a tu salud mental. Cuando decís "no" a un mandato familiar, estás diciendo "sí" a tu propio camino.</p>

<p style="line-height:1.8;">El "no" del león no es capricho. Es <strong>la condición de posibilidad de todo lo que sigue</strong>. Sin el "no", no hay espacio para el "sí" genuino. Es como la poda de un árbol: cortás las ramas secas no por crueldad sino para que las ramas vivas tengan luz.</p>

<h3 style="color:#dc2626;">📋 Protocolo del León: Cómo Poner Límites</h3>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Identificá el costo de tu "sí".</strong> Cada vez que decís sí a algo, ¿qué estás diciendo no? Hacé visible el intercambio.</li>
    <li><strong>Separal al pedido de la persona.</strong> "Te quiero mucho Y no puedo hacerme cargo de esto." Las dos cosas pueden ser verdad al mismo tiempo.</li>
    <li><strong>No justifiques de más.</strong> "No puedo" es una oración completa. No necesitás 10 razones para validar tu límite.</li>
    <li><strong>Bancá la incomodidad.</strong> Las primeras veces que ponés un límite, la otra persona (y vos mismo) van a sentir incomodidad. Eso no significa que estés haciendo algo mal. Significa que estás haciendo algo nuevo.</li>
    <li><strong>Empezá por lo fácil.</strong> No arranques poniendo límites con tu jefe o tu madre. Empezá con algo chico: declinar una invitación, no responder un mensaje inmediatamente, decir "necesito pensarlo" antes de comprometerte.</li>
  </ol>
</div>

<h3 style="color:#dc2626;">🔥 El Peligro del León</h3>
<p style="line-height:1.8;">Una advertencia: el león tiene un riesgo. Puede quedarse atrapado en la destrucción. Hay personas que descubren el "no" y se vuelven adictas al conflicto. Dicen no a todo, pelean con todos, rompen todo. El león que solo destruye y nunca crea es tan esclavo como el camello — solo que su cadena es la rebeldía permanente en vez de la obediencia permanente.</p>

<p style="line-height:1.8;">El león es una etapa, no un destino. Es necesario pero transitorio. Necesitás rugir para descubrir tu propia voz. Pero eventualmente, esa voz tiene que empezar a cantar, no solo a gritar. Esa es la tercera transformación que viene más adelante.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris aprendió a rugir antes de aprender a crear. Dijo 'no' a lo que el sistema esperaba de él. Y en ese 'no' encontró el primer 'sí' verdadero de su vida."</em></p>
</blockquote>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'El Gran Dragón: Las Estructuras que Dicen "Debes"',
      description: 'Nombrar los dragones personales: mandatos familiares, guiones culturales, miedos económicos.',
      content: `
<div style="background:linear-gradient(135deg,#4338ca 0%,#1e1b4b 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🐉 El Gran Dragón: Las Estructuras que Dicen "Debes"</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">El león necesita un enemigo claro. En la metáfora de Nietzsche, ese enemigo es el Gran Dragón: <em>"Tú debes"</em>. Pero en la vida real, los dragones son más sutiles. No escupen fuego — susurran. Son las voces internalizadas que te dicen qué ser, cómo vivir, qué merecer. Y lo más peligroso: las confundís con tu propia voz porque las escuchaste toda la vida.</p>
</div>

<h3 style="color:#4338ca;">🔍 Anatomía de un Dragón Personal</h3>
<p style="line-height:1.8;">Los dragones personales tienen tres capas:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#4338ca;margin-top:0;">Capa 1: La Voz Familiar</h4>
    <p style="line-height:1.7;margin-bottom:0;">Son los mandatos que escuchaste en tu casa antes de tener capacidad crítica. "Los varones trabajan con las manos". "Las mujeres se callan". "Nosotros no somos de quejarnos". "Hay que agradecer lo que hay". Se instalaron antes de que pudieras cuestionarlos.</p>
  </div>
  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#4338ca;margin-top:0;">Capa 2: El Guión Cultural</h4>
    <p style="line-height:1.7;margin-bottom:0;">Son las narrativas colectivas: el "éxito" definido como casa propia + auto + título. El "fracaso" definido como no tener eso. En Argentina se suma el mandato de "viveza criolla": si no te avivás, te comen. Y si te quejás, sos un blandito.</p>
  </div>
  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#4338ca;margin-top:0;">Capa 3: El Miedo Económico</h4>
    <p style="line-height:1.7;margin-bottom:0;">En Argentina, el dragón económico es especialmente poderoso. "No dejes el trabajo aunque te haga mal, porque afuera no hay nada". "No emprendas, es muy riesgoso". "Guardá dólares, no sueños". Estos miedos no son irracionales — nacen de la experiencia real. Pero cuando se vuelven absolutos, te paralizan.</p>
  </div>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Vamos a nombrar tus dragones. Para cada categoría, escribí el mandato más fuerte que escuchás en tu cabeza:</p>
  <ul style="line-height:2;">
    <li><strong>Dragón familiar:</strong> "En mi familia siempre me dijeron que debo _____"</li>
    <li><strong>Dragón cultural:</strong> "La sociedad espera que yo _____"</li>
    <li><strong>Dragón económico:</strong> "No puedo _____ porque económicamente _____"</li>
  </ul>
  <p><em>Nombrar al dragón es el primer paso para enfrentarlo. Tomá 5 minutos.</em></p>
</div>

<h3 style="color:#4338ca;">⚔️ El Ejercicio de Nombrar Dragones</h3>
<p style="line-height:1.8;">En todas las tradiciones mitológicas, <strong>nombrar al monstruo le quita poder</strong>. Mientras el dragón es "así son las cosas", es invencible. Cuando lo nombrás — "esto es un mandato de mi padre que yo elegí obedecer" — se convierte en algo que podés evaluar, cuestionar y eventualmente soltar.</p>

<p style="line-height:1.8;">El psicólogo Steven Hayes, creador de la Terapia de Aceptación y Compromiso (ACT), propone un ejercicio: <strong>externalizar la voz</strong>. En vez de pensar "no puedo dejar este trabajo", decí en voz alta: <em>"Estoy teniendo el pensamiento de que no puedo dejar este trabajo"</em>. El contenido es el mismo, pero la relación con el pensamiento cambia. Ya no sos el pensamiento — sos la persona que <em>observa</em> el pensamiento.</p>

<h3 style="color:#4338ca;">🎭 La Escala del Dragón</h3>
<p style="line-height:1.8;">No todos los dragones tienen el mismo poder. Clasificá los tuyos:</p>

<div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <table style="width:100%;border-collapse:collapse;">
    <tr style="background:#e0e7ff;">
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #818cf8;">Nivel</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #818cf8;">Descripción</th>
      <th style="padding:0.5rem;text-align:left;border-bottom:2px solid #818cf8;">Ejemplo</th>
    </tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">🟢 Menor</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">Hábitos y costumbres que podés cambiar hoy</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">"Debo contestar todos los mensajes inmediatamente"</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">🟡 Medio</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">Expectativas sociales que requieren conversaciones</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">"Debo ir a todas las reuniones familiares aunque me hagan mal"</td></tr>
    <tr><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">🔴 Mayor</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">Mandatos profundos que definen tu identidad</td><td style="padding:0.5rem;border-bottom:1px solid #e0e7ff;">"Debo sacrificar mi bienestar por mi familia siempre"</td></tr>
    <tr><td style="padding:0.5rem;">⚫ Existencial</td><td style="padding:0.5rem;">Creencias sobre quién tenés permiso de ser</td><td style="padding:0.5rem;">"No merezco una vida mejor que la de mis padres"</td></tr>
  </table>
</div>

<p style="line-height:1.8;">Empezá por los dragones verdes. Cada uno que enfrentás te da fuerza para el siguiente. No intentes matar al dragón existencial la primera semana — pero <strong>nombralo</strong>. Que sepa que lo viste.</p>

<h3 style="color:#4338ca;">📝 Ejercicio: Carta al Dragón</h3>
<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <p style="line-height:1.8;">Elegí tu dragón más fuerte y escribile una carta. Sí, una carta. Empezá así:</p>
  <p style="line-height:1.8;font-style:italic;">"Querido [nombre del mandato], te llevo cargando desde [cuándo]. Me dijiste que debía [qué]. Durante mucho tiempo te creí porque [por qué]. Hoy quiero decirte que [lo que necesitás decir]."</p>
  <p style="line-height:1.8;margin-bottom:0;">Este ejercicio puede parecer infantil. No lo es. Las investigaciones sobre escritura expresiva (James Pennebaker, Universidad de Texas) muestran que <strong>escribir sobre experiencias emocionales profundas mejora la salud física y mental de forma medible</strong>. No es magia — es procesamiento.</p>
</div>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris nombró a sus dragones uno por uno. Les dijo: 'Te conozco. Sé de dónde venís. Y ya no te obedezco'. No los mató — los dejó ir. Y al soltar cada escama de 'tú debes', encontró debajo la piel nueva de su propio 'yo quiero'."</em></p>
</blockquote>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Batalla del León',
      description: 'La diferencia entre pelear contra el sistema y transformarse desde adentro.',
      content: `
<div style="background:linear-gradient(135deg,#b45309 0%,#78350f 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">⚔️ La Batalla del León</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">El león ruge. Dice no. Pone límites. Pero la gran pregunta del león es: ¿contra qué pelea? Hay una diferencia enorme entre pelear contra el mundo exterior y transformar el mundo interior. Argentina está llena de leones que rugen hacia afuera pero nunca miran hacia adentro. Y está llena de camellos que miran hacia adentro pero nunca rugen. La transformación real requiere las dos cosas.</p>
</div>

<h3 style="color:#b45309;">🔄 Dos Tipos de Batalla</h3>
<p style="line-height:1.8;">Distinguí estas dos batallas:</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;margin:1.5rem 0;">
  <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b45309;margin-top:0;">🗡️ La Batalla Externa</h4>
    <p style="line-height:1.7;">Es la pelea contra las injusticias, las estructuras opresivas, los sistemas corruptos. Es necesaria. Pero si SOLO peleás hacia afuera, te convertís en un guerrero permanente que no conoce la paz. En Argentina, los militantes eternos que se definen por lo que odian más que por lo que aman.</p>
  </div>
  <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:12px;padding:1.25rem;">
    <h4 style="color:#b45309;margin-top:0;">🪞 La Batalla Interna</h4>
    <p style="line-height:1.7;">Es la confrontación con tus propias contradicciones, tus miedos, tus zonas de comodidad. Es más difícil porque no hay enemigo visible. En Argentina, es la batalla que casi nadie da porque es más fácil señalar al de enfrente que mirarse al espejo.</p>
  </div>
</div>

<p style="line-height:1.8;">La trampa más común del león argentino es <strong>externalizar toda la batalla</strong>. "El problema es el gobierno". "El problema es la oposición". "El problema son los que piensan distinto". Cada una de estas frases puede tener verdad — pero si te quedás solo ahí, nunca te preguntás: ¿cuál es mi parte en esto? ¿Qué estoy reproduciendo yo del sistema que critico?</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📖 Historia Real: El Abogado de Buenos Aires</h4>
  <p style="line-height:1.8;">Martín tenía 38 años, un estudio jurídico en Microcentro, un departamento en Palermo y un auto alemán. Había cumplido cada mandato del "éxito argentino". Su padre, un inmigrante español que había llegado sin nada, le repetía desde chico: <em>"Vos tenés que ser alguien, no como yo"</em>.</p>
  <p style="line-height:1.8;">Martín se hizo "alguien". Pero a los 38, en la cima de su carrera corporativa, se despertaba cada mañana con una angustia que ningún logro apagaba. Defendía empresas en casos laborales — es decir, usaba su inteligencia para que los trabajadores cobraran menos. Un día, después de ganar un juicio que dejó a 40 familias sin indemnización, cerró la puerta de su oficina y lloró.</p>
  <p style="line-height:1.8;">Su batalla interna duró dos años. Terapia, lecturas, conversaciones incómodas con su padre. Cuando finalmente dejó el estudio corporativo y abrió un consultorio de derechos humanos en Constitución, su padre no habló con él durante seis meses. Martín ganaba un quinto de lo que ganaba antes. Pero por primera vez en su vida adulta, <strong>no se despertaba con angustia</strong>.</p>
  <p style="line-height:1.8;margin-bottom:0;">Hoy Martín defiende trabajadores. No es un héroe de película — sigue pagando alquiler, peleando con la AFIP y discutiendo con su familia. Pero vive <em>su</em> vida, no la vida que le escribieron. Eso costó. Y eso vale.</p>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">¿Qué parte de tu vida es una "batalla externa" (contra sistemas, injusticias, otros) y qué parte es "batalla interna" (contra tus propios miedos, mandatos, inercias)? ¿Cuál de las dos estás evitando?</p>
  <p><em>Tomá 3 minutos para anotarlo.</em></p>
</div>

<h3 style="color:#b45309;">🔁 La Paradoja de Gandhi</h3>
<p style="line-height:1.8;">Gandhi dijo: <em>"Sé el cambio que quieras ver en el mundo"</em>. Es una frase que todo el mundo cita y casi nadie practica. Porque es <strong>incómodamente concreta</strong>. Significa:</p>
<ul style="line-height:2;">
  <li>Si querés un país sin corrupción, ¿dónde sos corrupto vos? (¿Pagás en negro? ¿Usás el contacto para saltear una cola?)</li>
  <li>Si querés una sociedad que escuche, ¿escuchás vos a los que piensan distinto?</li>
  <li>Si querés justicia social, ¿cómo tratás a las personas que trabajan para vos?</li>
  <li>Si querés cambio, ¿qué cambiaste en tu propia vida este mes?</li>
</ul>

<p style="line-height:1.8;">La batalla del león maduro es <strong>simultánea</strong>: pelea hacia afuera contra la injusticia Y pelea hacia adentro contra sus propias inconsistencias. Uno sin el otro es incompleto. El activista que no se mira al espejo se convierte en lo que critica. La persona que solo trabaja su interior se convierte en un turista espiritual mientras el mundo arde.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris peleó las dos batallas. La de afuera, contra el sistema que nos quiere dormidos. Y la de adentro, contra la parte de sí mismo que quería seguir durmiendo. La segunda fue más difícil. Y más importante."</em></p>
</blockquote>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'El Niño: La Creación Inocente',
      description: 'La tercera transformación: crear desde la alegría, no desde la obligación.',
      content: `
<div style="background:linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">👶 El Niño: La Creación Inocente</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">La tercera transformación de Nietzsche es la más misteriosa. Después de cargar como camello y rugir como león, el espíritu se convierte en... un niño. No un niño ingenuo ni débil. Un niño que crea porque sí. Que juega porque el juego es su naturaleza. Que dice <strong>"yo soy"</strong> sin necesitar permiso ni aprobación. El niño no carga ni pelea — <em>crea</em>. Y su creación es un comienzo sagrado.</p>
</div>

<h3 style="color:#0ea5e9;">🎨 El Poder del Comienzo</h3>
<p style="line-height:1.8;">Nietzsche describe al niño como <em>"inocencia y olvido, un nuevo comienzo, un juego, una rueda que gira por sí misma, un primer movimiento, un santo decir sí"</em>. Leelo de nuevo despacio. Cada palabra importa.</p>

<p style="line-height:1.8;"><strong>Inocencia:</strong> no es ignorancia. Es la capacidad de mirar las cosas como si fuera la primera vez. Sin los filtros del cinismo, del "esto ya se intentó", del "acá no funciona".</p>

<p style="line-height:1.8;"><strong>Olvido:</strong> no es amnesia. Es la capacidad de no dejar que el pasado determine el futuro. En Argentina, estamos encadenados al pasado: "ya nos robaron", "ya nos mintieron", "ya fracasó". El niño no ignora el pasado — simplemente <strong>no le da el poder de definir lo posible</strong>.</p>

<p style="line-height:1.8;"><strong>Un nuevo comienzo:</strong> cada mañana, cada proyecto, cada conversación puede ser un comienzo. No necesitás esperar a enero, ni al próximo gobierno, ni a que las cosas mejoren. <strong>El comienzo es ahora.</strong></p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pregunta provocadora: <strong>¿Cuándo fue la última vez que creaste algo sin que nadie te lo pidiera?</strong> No para el trabajo, no para cumplir, no para ganar plata. Algo que hiciste simplemente porque tenías ganas. Si no te acordás, eso dice algo importante sobre cuánto león te falta soltar.</p>
  <p><em>Tomá 3 minutos para pensarlo.</em></p>
</div>

<h3 style="color:#0ea5e9;">🎭 La Espontaneidad Como Revolución</h3>
<p style="line-height:1.8;">En un país donde todo es estrategia y cálculo — "¿me conviene?", "¿qué van a pensar?", "¿cuál es el riesgo?" — la espontaneidad es un acto revolucionario. No la espontaneidad irresponsable (eso es impulsividad), sino la capacidad de actuar desde el deseo genuino en vez del deber impuesto.</p>

<p style="line-height:1.8;">El psicólogo Donald Winnicott hablaba del <strong>"verdadero self" y el "falso self"</strong>. El falso self es la máscara que construimos para cumplir con las expectativas del mundo. El verdadero self es la parte de nosotros que juega, crea, se asombra, se conecta sin calcular. En la mayoría de los adultos argentinos, el verdadero self está tan enterrado bajo capas de supervivencia que olvidaron que existe.</p>

<p style="line-height:1.8;">El niño de Nietzsche es la recuperación del verdadero self. No la regresión a la infancia, sino <strong>la integración de la capacidad de juego y creación en la vida adulta</strong>. Es el ingeniero que además pinta. La contadora que escribe poesía. El obrero que enseña origami a los pibes del barrio. No porque "sirva para algo" sino porque <strong>esa es la expresión de quién es</strong>.</p>

<h3 style="color:#0ea5e9;">🔧 Recuperar al Niño Interior</h3>
<p style="line-height:1.8;">Esto no es un discurso new age. Es un protocolo práctico:</p>

<div style="background:#e0f2fe;border:1px solid #7dd3fc;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ol style="line-height:2.2;">
    <li><strong>Identificá qué te daba alegría a los 10 años.</strong> ¿Dibujabas? ¿Jugabas a construir cosas? ¿Inventabas historias? ¿Jugabas al fútbol con pasión pura? Eso no desapareció — se enterró.</li>
    <li><strong>Hacé algo "inútil" esta semana.</strong> Pintá, cantá, cociná algo nuevo, armá algo con las manos, escribí un cuento. Sin publicarlo, sin mostrarlo, sin que "sirva para algo".</li>
    <li><strong>Observá a un niño jugando.</strong> Mirá cómo se sumerge sin preguntarse si es productivo. Esa capacidad de inmersión total es lo que necesitás recuperar.</li>
    <li><strong>Eliminá una obligación innecesaria esta semana.</strong> Creá espacio. El niño necesita espacio vacío para jugar — si tu agenda está llena de "deberes", no hay lugar para la creación.</li>
  </ol>
</div>

<h3 style="color:#0ea5e9;">🌟 Crear Como Acto Político</h3>
<p style="line-height:1.8;">En Argentina, crear desde la alegría es un acto profundamente político. Un sistema que te necesita agotado, ansioso y consumiendo no sabe qué hacer con una persona que crea por placer, que tiene tiempo libre y lo usa para algo significativo, que no necesita comprar nada para sentirse bien. <strong>La persona que crea desde la libertad interior es el peor cliente del mercado y el mejor ciudadano de la república.</strong></p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris cargó, rugió y finalmente — creó. No por obligación ni por rebelión sino porque crear es lo que hace un espíritu libre cuando ya no tiene cadenas. Y lo que crea no es para sí mismo. Es para todos los que todavía no saben que pueden."</em></p>
</blockquote>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'Integración: Ser Todos los Tres',
      description: 'El Hombre Gris maduro contiene al Camello, al León y al Niño.',
      content: `
<div style="background:linear-gradient(135deg,#6d28d9 0%,#4c1d95 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🔮 Integración: Ser Todos los Tres</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Acá está el secreto que Nietzsche no dijo explícitamente pero que el Hombre Gris entendió: la transformación no es lineal. No dejás de ser camello para ser león, ni dejás de ser león para ser niño. <strong>La persona madura es las tres cosas al mismo tiempo.</strong> Sabe cargar cuando hay que cargar, rugir cuando hay que rugir, y crear cuando hay que crear. La sabiduría está en saber cuándo ser cuál.</p>
</div>

<h3 style="color:#6d28d9;">🎵 La Sinfonía Interior</h3>
<p style="line-height:1.8;">Pensalo como una orquesta interior. El camello toca los graves: la responsabilidad, el compromiso, la capacidad de sostener. El león toca los agudos: la indignación justa, los límites, el coraje. El niño toca la melodía: la creatividad, la alegría, la espontaneidad. Una persona que solo tiene graves es pesada. Una que solo tiene agudos es agotadora. Una que solo tiene melodía es frágil. Pero las tres juntas producen <strong>música</strong>.</p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📊 Auto-evaluación: ¿Qué Domina en Vos?</h4>
  <p style="line-height:1.8;">Para cada afirmación, puntuá del 1 al 5 (1 = nada, 5 = totalmente):</p>
  <p style="line-height:1.8;"><strong>🐪 Camello:</strong></p>
  <ul style="line-height:1.8;">
    <li>___ Tiendo a cargar más de lo que me corresponde</li>
    <li>___ Me cuesta pedir ayuda</li>
    <li>___ Mi identidad está muy ligada a lo que hago por otros</li>
  </ul>
  <p style="line-height:1.8;"><strong>🦁 León:</strong></p>
  <ul style="line-height:1.8;">
    <li>___ Pongo límites con claridad</li>
    <li>___ Sé decir "no" sin culpa</li>
    <li>___ Cuestiono las reglas que no me convencen</li>
  </ul>
  <p style="line-height:1.8;"><strong>👶 Niño:</strong></p>
  <ul style="line-height:1.8;">
    <li>___ Creo cosas por el placer de crearlas</li>
    <li>___ Puedo asombrarme con algo nuevo</li>
    <li>___ Tengo espacio para el juego y la espontaneidad</li>
  </ul>
  <p style="line-height:1.8;margin-bottom:0;">¿Dónde tenés más puntos? ¿Dónde menos? El que menos tiene es el que más necesitás desarrollar.</p>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Mirá los resultados de tu auto-evaluación. ¿Te sorprenden? ¿El puntaje más bajo coincide con algo que sentís que te falta en la vida? ¿Qué tendrías que hacer esta semana para subir un punto en tu área más débil?</p>
  <p><em>Tomá 3 minutos para procesarlo.</em></p>
</div>

<h3 style="color:#6d28d9;">🔄 El Movimiento Entre los Tres</h3>
<p style="line-height:1.8;">La vida no pide siempre lo mismo. Hay situaciones que requieren camello, otras que requieren león, y otras que requieren niño:</p>

<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <ul style="line-height:2.2;">
    <li><strong>Cuando tu hijo está enfermo:</strong> necesitás al camello (sostener, cuidar, aguantar noches sin dormir) Y al niño (inventar juegos, hacer reír, crear desde el amor).</li>
    <li><strong>Cuando tu jefe te pide algo injusto:</strong> necesitás al león (decir no con firmeza) Y al camello (entender el contexto, no abandonar por impulso).</li>
    <li><strong>Cuando querés emprender algo nuevo:</strong> necesitás al niño (imaginar, soñar, crear) Y al león (defender tu idea) Y al camello (hacer el trabajo tedioso que toda idea requiere).</li>
  </ul>
</div>

<p style="line-height:1.8;">La persona que se estanca en una sola forma se vuelve rígida. El camello perpetuo se quiebra. El león perpetuo se aísla. El niño perpetuo no construye nada duradero. <strong>La integración es movimiento, no estado fijo.</strong></p>

<h3 style="color:#6d28d9;">🧩 El Hombre Gris: La Integración Encarnada</h3>
<p style="line-height:1.8;">El Hombre Gris del libro es exactamente esto: alguien que pasó por las tres transformaciones y las contiene todas. Carga cuando hay que cargar (responsabilidad cívica), ruge cuando hay que rugir (denuncia de la injusticia), y crea cuando hay que crear (propuestas de un mundo diferente). No es un superhéroe — es <strong>una persona completa</strong>. Y cada uno de nosotros puede serlo.</p>

<p style="line-height:1.8;">Lo que le da al Hombre Gris su poder no es ninguna de las tres formas por separado. Es <strong>la capacidad de moverse entre ellas según lo que cada momento necesita</strong>. Eso es sabiduría. Y eso es lo que la Argentina necesita: no más camellos que se rompan ni más leones que destruyan ni más niños que jueguen solos. Necesita personas que integren las tres cosas y las pongan al servicio de algo más grande que ellas mismas.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris es camello cuando el otro necesita que alguien sostenga. Es león cuando el sistema necesita que alguien diga basta. Y es niño cuando el futuro necesita que alguien imagine lo que todavía no existe. Los tres viven en él. Los tres viven en vos."</em></p>
</blockquote>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Metamorfosis Sistémica',
      description: 'Cómo la transformación individual se propaga a través de las redes.',
      content: `
<div style="background:linear-gradient(135deg,#059669 0%,#064e3b 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🌐 La Metamorfosis Sistémica</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Hasta ahora hablamos de transformación personal. Pero el Hombre Gris no se transforma para sentirse mejor — se transforma para que el mundo sea mejor. La pregunta de esta lección es: ¿cómo se propaga un cambio individual a través de una red? ¿Cómo pasa de una persona a una familia, de una familia a un barrio, de un barrio a un país?</p>
</div>

<h3 style="color:#059669;">🔬 La Ciencia de la Propagación</h3>
<p style="line-height:1.8;">Nicholas Christakis y James Fowler, de la Universidad de Harvard, descubrieron algo asombroso: <strong>los comportamientos se propagan hasta tres grados de separación</strong>. Si vos cambiás un hábito, afectás a tus amigos (1er grado), a los amigos de tus amigos (2do grado) y a los amigos de los amigos de tus amigos (3er grado). Esto funciona para la obesidad, la felicidad, el tabaquismo — y también para las actitudes cívicas.</p>

<p style="line-height:1.8;">Pensalo así: si vos dejás de tirar basura en la calle, tu vecino que te ve lo piensa dos veces. El amigo de tu vecino, al notar que su amigo cambió, se pregunta si él debería cambiar. Y así sucesivamente. No es un efecto enorme en cada paso — es un <strong>efecto pequeño multiplicado muchas veces</strong>. Como las ondas en un lago cuando tirás una piedra.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Pensá en algún cambio positivo que hayas hecho en tu vida. ¿Alguien a tu alrededor cambió algo similar después? ¿Podés rastrear una "cadena de influencia" partiendo de tu cambio? Puede ser algo tan simple como empezar a leer y que tu hijo empiece a leer también.</p>
  <p><em>Tomá 3 minutos para pensarlo.</em></p>
</div>

<h3 style="color:#059669;">♟️ Tit for Tat: La Estrategia del Hombre Gris</h3>
<p style="line-height:1.8;">En teoría de juegos, <strong>Tit for Tat</strong> (golpe por golpe, gesto por gesto) es la estrategia que ganó el famoso torneo de Robert Axelrod. Es simple: empezá cooperando, y después hacé lo que el otro hizo. Si coopera, cooperás. Si traiciona, no cooperás la siguiente vez. Si vuelve a cooperar, cooperás de nuevo.</p>

<p style="line-height:1.8;">El Hombre Gris adopta esto como filosofía de vida:</p>
<ul style="line-height:2;">
  <li><strong>Empezá siempre con un gesto de confianza.</strong> No esperes que el otro demuestre primero. Dá vos el primer paso.</li>
  <li><strong>Respondé a la reciprocidad.</strong> Si el otro coopera, profundizá la cooperación. Si traiciona, poné un límite — pero sin rencor, sin venganza. Solo retirá la cooperación.</li>
  <li><strong>Perdoná rápido.</strong> Si el otro vuelve a cooperar, volvé a abrir la puerta. No acumules resentimiento. El resentimiento es un veneno que tomás vos esperando que muera el otro.</li>
</ul>

<p style="line-height:1.8;">En la vida cotidiana argentina, Tit for Tat significa: <strong>ser el primero en actuar bien</strong>. No esperar a que "el otro" cambie. No decir "cuando ellos cambien, cambio yo". Empezar. Y dejar que la propagación haga su trabajo.</p>

<h3 style="color:#059669;">🌱 La Masa Crítica</h3>
<p style="line-height:1.8;">¿Cuánta gente necesita cambiar para que una sociedad cambie? Los estudios de Damon Centola (Universidad de Pennsylvania) sugieren que se necesita aproximadamente un <strong>25% de la población</strong> comprometida con un nuevo comportamiento para que ese comportamiento se vuelva norma social. En Argentina, eso son 11 millones de personas.</p>

<p style="line-height:1.8;">Suena mucho. Pero recordá: cada persona influye hasta tres grados de separación. Si vos cambiás y afectás a 10 personas, y cada una afecta a 10 más, en tres grados sos 1.000. Si 11.000 personas empiezan, en tres grados son 11 millones. <strong>No necesitás convencer a todos. Necesitás encender las primeras chispas.</strong></p>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📊 Tu Cascada de Influencia</h4>
  <p style="line-height:1.8;">Dibujá tu red de propagación:</p>
  <ol style="line-height:2;">
    <li><strong>Grado 1 (tus 10):</strong> ¿Quiénes son las 10 personas que más influenciás directamente?</li>
    <li><strong>Grado 2 (sus 10):</strong> ¿Quiénes son las personas que ellos influencian?</li>
    <li><strong>Tu cambio:</strong> ¿Qué cambio específico querés propagar? (No "cambiar el mundo" — algo concreto: "dejar de hablar mal de los ausentes", "empezar a organizar mi cuadra", "dar feedback honesto")</li>
    <li><strong>Tu primer gesto:</strong> ¿Cuál es el primer Tit — el primer gesto de cooperación que vas a hacer esta semana?</li>
  </ol>
</div>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no espera que todo el mundo cambie para empezar a actuar. Tira la primera piedra al lago y confía en que las ondas llegarán a la otra orilla. No las controla. No las apura. Las lanza. Eso es suficiente."</em></p>
</blockquote>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 32,
      isRequired: true,
    },
    {
      courseId,
      title: 'Argentina Como Laboratorio',
      description: 'Las crisis repetidas como invitaciones permanentes a transformarse.',
      content: `
<div style="background:linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">🇦🇷 Argentina Como Laboratorio</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">¿Y si las crisis de Argentina no fueran una maldición sino un laboratorio? ¿Si cada derrumbe fuera una invitación — brutal, injusta, no pedida — a transformarnos? No romanticemos el sufrimiento: las crisis destruyen vidas, familias, sueños. Pero también es cierto que de cada ruina argentina emergieron formas nuevas de organizarse, de pensar, de existir. Este país rompe todo cada 15 años. Y cada 15 años, alguien construye algo extraordinario sobre los escombros.</p>
</div>

<h3 style="color:#1d4ed8;">📅 Tres Generaciones, Tres Metamorfosis</h3>

<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#92400e;margin-top:0;">📖 Historia Real: La Familia Romero, Tres Generaciones</h4>

  <p style="line-height:1.8;"><strong>1976 — Marta (abuela)</strong></p>
  <p style="line-height:1.8;">Marta tenía 24 años cuando la dictadura le secuestró al hermano. No era militante — era maestra de primaria en Avellaneda. Nunca recuperó el cuerpo de Julio. Durante años fue camello: cargó el dolor en silencio porque hablar podía significar la muerte. Recién en 1984, con el retorno de la democracia, Marta empezó a hablar. Se sumó a una organización de familiares. Aprendió a rugir: declaró en el Juicio a las Juntas. Y después creó: fundó un taller de oficios para jóvenes del barrio, con la foto de Julio en la pared. "Si no puedo devolver lo que me quitaron", decía, "puedo construir algo nuevo sobre el agujero".</p>

  <p style="line-height:1.8;"><strong>2001 — Roberto (padre)</strong></p>
  <p style="line-height:1.8;">Roberto, hijo de Marta, tenía 35 años cuando el corralito se llevó los ahorros de su pequeño taller mecánico. Había construido el negocio durante 10 años. En una semana, todo desapareció. Los primeros meses fue camello: trabajó 14 horas diarias reparando lo que podía, aceptando trueque en vez de dinero. Después fue león: se sumó a la asamblea barrial de Lanús y denunció al banco que les había prometido que sus ahorros estaban seguros. Y después fue niño: junto con tres vecinos, inventó un sistema de reparación comunitaria donde cada uno ponía una herramienta y todos las compartían. "No teníamos plata", recuerda Roberto, "pero teníamos manos, cerebro y bronca. La bronca sola destruye. Pero la bronca con un plan construye".</p>

  <p style="line-height:1.8;margin-bottom:0;"><strong>2023 — Lucía (nieta)</strong></p>
  <p style="line-height:1.8;margin-bottom:0;">Lucía tiene 25 años. Se recibió de programadora en la UTN. Su primera experiencia de crisis consciente fue la pandemia a los 18. Su segunda, la inflación de tres dígitos a los 23. A diferencia de su abuela y su padre, Lucía no tuvo un solo golpe devastador — tiene un goteo constante de inestabilidad. Su camello carga la incertidumbre diaria. Su león dice no al cinismo de su generación ("es todo lo mismo, no se puede hacer nada"). Y su niño creó una app comunitaria para que vecinos de Lanús compartan información sobre precios de alimentos en tiempo real. La usan 3.000 personas. "No sé si cambia algo grande", dice Lucía. "Pero mi abuela hizo lo que pudo con lo que tenía. Mi papá hizo lo que pudo con lo que tenía. Yo hago lo que puedo con lo que tengo. Y lo que tengo es un celular y muchas ganas de que esto sea mejor."</p>
</div>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Tu familia también tiene una historia de metamorfosis. ¿Qué crisis enfrentaron tus abuelos? ¿Tus padres? ¿Vos? ¿Qué construyó cada generación sobre los escombros de la anterior? Si no conocés la historia, esta semana preguntá. Las historias familiares de crisis son el mayor tesoro de resiliencia que tenemos.</p>
  <p><em>Tomá 5 minutos para trazar tu propia línea generacional.</em></p>
</div>

<h3 style="color:#1d4ed8;">🔬 ¿Qué Tiene Argentina que No Tiene Otro Lugar?</h3>
<p style="line-height:1.8;">Argentina produce un tipo de persona que no existe en sociedades estables: alguien que aprendió a <strong>funcionar en el caos</strong>. Esto no es una virtud automática — puede producir cinismo, desconfianza, individualismo salvaje. Pero <em>también</em> puede producir:</p>
<ul style="line-height:2;">
  <li><strong>Creatividad extrema:</strong> cuando los recursos faltan, la inventiva florece. Las cooperativas del 2001, los clubes de trueque, los emprendimientos con cero capital.</li>
  <li><strong>Adaptabilidad:</strong> mientras otros países se paralizan ante un cambio, los argentinos cambian de plan antes de terminar el desayuno.</li>
  <li><strong>Solidaridad de crisis:</strong> cuando todo se derrumba, los vecinos se ayudan. Las ollas populares, las redes de contención, los grupos de WhatsApp que conectan necesidades con recursos.</li>
  <li><strong>Humor como resistencia:</strong> la capacidad de reírse de la tragedia no es cinismo — es la forma argentina de procesar lo improcesable.</li>
</ul>

<p style="line-height:1.8;">El desafío no es desarrollar estas capacidades — ya las tenemos. El desafío es <strong>canalizarlas hacia la construcción en vez de hacia la mera supervivencia</strong>. Dejar de usar la creatividad solo para esquivar la crisis y empezar a usarla para diseñar algo mejor.</p>

<h3 style="color:#1d4ed8;">🌍 Argentina como Ejemplo</h3>
<p style="line-height:1.8;">Hay algo que el mundo puede aprender de nosotros: <strong>cómo vivir con incertidumbre sin romperse</strong>. Las sociedades estables del norte global están empezando a enfrentar lo que nosotros enfrentamos desde siempre: inflación, polarización, desconfianza institucional, crisis climática. No tienen anticuerpos. Nosotros sí. El Hombre Gris argentino no es solo una figura local — es un modelo de ciudadanía para un mundo que se está volviendo cada vez más inestable.</p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Argentina no es un país que fracasa repetidamente. Es un país que se transforma repetidamente. Cada crisis es un desierto que cruzamos. Y cada vez que cruzamos uno, salimos distintos. Más duros, sí. Pero también más sabios. Y si juntamos esa dureza con esa sabiduría y les agregamos amor — eso, exactamente eso, es el Hombre Gris."</em></p>
</blockquote>
      `,
      orderIndex: 9,
      type: 'text' as const,
      duration: 35,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tu Instante del Hombre Gris',
      description: 'Síntesis final: tu rol, tu compromiso, tu manifiesto personal.',
      content: `
<div style="background:linear-gradient(135deg,#1f2937 0%,#030712 100%);color:#f8fafc;padding:2.5rem;border-radius:16px;margin-bottom:2rem;">
  <h2 style="margin-top:0;font-size:1.8rem;">⚡ Tu Instante del Hombre Gris</h2>
  <p style="font-size:1.15rem;line-height:1.8;opacity:0.95;">Llegamos al final del camino. No del camino de la vida — de este camino. Del recorrido que empezó cargando peso, pasó por el desierto, aprendió a rugir, nombró a sus dragones, peleó la batalla doble, recuperó la capacidad de crear, integró las tres transformaciones y entendió cómo propagarse. Ahora queda la pregunta final, la más importante, la que ningún curso puede responder por vos: <strong>¿Quién vas a ser a partir de ahora?</strong></p>
</div>

<h3 style="color:#6b7280;">🔑 ¿Qué Es "El Instante"?</h3>
<p style="line-height:1.8;">En el libro "El Instante del Hombre Gris", hay un momento que cambia todo. No es un evento espectacular — es un <strong>instante de claridad</strong>. El momento en que una persona común entiende que no necesita permiso para actuar, que su vida cotidiana es el campo de batalla donde se define el futuro, y que <em>jugamos el mismo juego</em> — todos, sin excepción.</p>

<p style="line-height:1.8;">Tu instante del Hombre Gris puede ser este momento. O puede ser mañana, cuando un vecino te pida ayuda y en vez de decir "no puedo" digas "¿qué necesitás?". Puede ser la semana que viene, cuando en una reunión familiar en vez de callarte digas la verdad con respeto. Puede ser dentro de un año, cuando mires atrás y veas que algo cambió — que vos cambiaste — y que ese cambio se propagó sin que te dieras cuenta.</p>

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
  <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
  <p style="line-height:1.8;">Antes de escribir tu manifiesto, tomate un momento. Respirá hondo. Pensá en todo lo que recorriste: la carga del camello, el desierto, el rugido del león, los dragones, la batalla, la creación del niño, la integración, la propagación, Argentina como laboratorio. ¿Qué te marcó más? ¿Qué descubriste sobre vos que no sabías?</p>
  <p><em>Tomá 5 minutos de silencio antes de continuar.</em></p>
</div>

<h3 style="color:#6b7280;">📜 Tu Manifiesto Personal</h3>
<p style="line-height:1.8;">Un manifiesto no es una lista de deseos ni una resolución de Año Nuevo. Es una <strong>declaración de quién elegís ser</strong>. Es ponerse de pie — internamente — y decir: esto es lo que creo, esto es lo que hago, esto es lo que no acepto.</p>

<p style="line-height:1.8;">Escribí tu manifiesto personal del Hombre Gris. Usá esta estructura como guía, pero hacelo tuyo:</p>

<div style="background:#f3f4f6;border:2px solid #9ca3af;border-radius:12px;padding:2rem;margin:1.5rem 0;">
  <p style="line-height:2;font-size:1.1rem;"><strong>Yo, [tu nombre],</strong></p>
  <p style="line-height:2;font-size:1.1rem;">reconozco que cargué [lo que cargaste sin elegir].</p>
  <p style="line-height:2;font-size:1.1rem;">Crucé el desierto de [tu desierto interior].</p>
  <p style="line-height:2;font-size:1.1rem;">Aprendí a decir NO a [tus dragones].</p>
  <p style="line-height:2;font-size:1.1rem;">Elijo crear [lo que querés construir].</p>
  <p style="line-height:2;font-size:1.1rem;">Sé que soy camello cuando [situación], león cuando [situación], y niño cuando [situación].</p>
  <p style="line-height:2;font-size:1.1rem;">Mi zona de influencia empieza con [tus personas] y se extiende hacia [tu visión].</p>
  <p style="line-height:2;font-size:1.1rem;">Mi primer gesto de cooperación esta semana es [acción concreta].</p>
  <p style="line-height:2;font-size:1.1rem;">No espero que el mundo cambie. Empiezo yo.</p>
  <p style="line-height:2;font-size:1.1rem;margin-bottom:0;"><strong>Este es mi instante del Hombre Gris.</strong></p>
</div>

<h3 style="color:#6b7280;">👁️ El Testigo</h3>
<p style="line-height:1.8;">Un manifiesto que nadie escucha es un diario. Un manifiesto con testigos es un compromiso. Te propongo algo: <strong>elegí a una persona de confianza y leele tu manifiesto</strong>. No para que lo apruebe — para que lo presencie. Para que dentro de tres meses te pueda preguntar: "¿Estás viviendo lo que declaraste?"</p>

<p style="line-height:1.8;">En las tradiciones antiguas, los compromisos se hacían frente a la comunidad porque la comunidad los sostenía. Tu testigo no es un juez — es un aliado. Alguien que sabe quién elegiste ser y te lo recuerda cuando la inercia te jale de vuelta.</p>

<h3 style="color:#6b7280;">🌅 El Comienzo</h3>
<p style="line-height:1.8;">Este curso termina. Pero el Hombre Gris no tiene final. No es un título que se obtiene ni un certificado que se cuelga en la pared. Es una <strong>práctica diaria</strong>. Es levantarte cada mañana y elegir de nuevo: ¿Quién soy hoy? ¿Qué cargo, qué suelto, qué creo? ¿Cuál es mi primer gesto de cooperación?</p>

<p style="line-height:1.8;">Argentina no necesita héroes. Necesita personas comunes que hagan cosas extraordinarias en su vida cotidiana. Que lleven a sus hijos al colegio y también lleven una pregunta a la reunión de padres. Que paguen los impuestos y también exijan saber en qué se gastan. Que se indignen con la injusticia y también miren cuánta justicia construyen en su metro cuadrado.</p>

<p style="line-height:1.8;font-size:1.15rem;"><strong>Eso es el Hombre Gris. Eso sos vos. Y este es tu instante.</strong></p>

<blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
  <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;font-size:1.1rem;"><em>"No te pedí que me sigas. Te pedí que te mires. No te pedí que creas en mí. Te pedí que creas en lo que podés hacer. Jugamos el mismo juego, vos y yo. Y ahora sabés las reglas. Ahora sabés que podés cambiarlas. Lo que hagas con eso es tuyo. Pero recordá: cada instante es una elección. Y cada elección, multiplicada por millones, es Argentina."</em></p>
</blockquote>
      `,
      orderIndex: 10,
      type: 'text' as const,
      duration: 35,
      isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Inserted', lessons.length, 'lessons for course 19');

  // Quiz
  const existingQuiz19 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  let quizId19: number;
  if (existingQuiz19.length > 0) {
    quizId19 = existingQuiz19[0].id;
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId19));
  } else {
    const [newQuiz] = await db.insert(courseQuizzes).values({
      courseId,
      title: 'Evaluación Final: La Metamorfosis',
      description: 'Reflexioná sobre tu recorrido de transformación personal y tu comprensión del camino del Hombre Gris.',
      passingScore: 70,
      timeLimit: 25,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();
    quizId19 = newQuiz.id;
  }

  const questions19 = [
    {
      quizId: quizId19,
      type: 'multiple_choice' as const,
      question: 'En la metáfora de Nietzsche, ¿qué representa el Camello?',
      options: JSON.stringify([
        'La rebeldía contra el sistema',
        'La creatividad libre e inocente',
        'El espíritu que carga los pesos y mandatos impuestos diciendo "yo puedo"',
        'La sabiduría del líder experimentado',
      ]),
      correctAnswer: 'El espíritu que carga los pesos y mandatos impuestos diciendo "yo puedo"',
      explanation: 'El Camello es la primera transformación: el espíritu que busca las cargas más pesadas — mandatos familiares, culturales, económicos — y las lleva por el desierto sin cuestionarlas.',
      orderIndex: 1,
    },
    {
      quizId: quizId19,
      type: 'true_false' as const,
      question: 'Según el curso, la transformación del Camello al León al Niño es un proceso lineal donde se abandona cada etapa al pasar a la siguiente.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Falso',
      explanation: 'La persona madura integra las tres transformaciones simultáneamente: sabe cuándo cargar (Camello), cuándo poner límites (León) y cuándo crear (Niño). No es lineal sino integrador.',
      orderIndex: 2,
    },
    {
      quizId: quizId19,
      type: 'multiple_choice' as const,
      question: '¿Qué es el "Gran Dragón" en la metáfora de Nietzsche y cómo se manifiesta en la vida real?',
      options: JSON.stringify([
        'Es un monstruo literal que hay que derrotar con fuerza',
        'Son los mandatos, expectativas y "debes" internalizados que confundimos con nuestra propia voz',
        'Es la sociedad entera que hay que destruir para ser libre',
        'Es el miedo a la muerte que todos enfrentamos',
      ]),
      correctAnswer: 'Son los mandatos, expectativas y "debes" internalizados que confundimos con nuestra propia voz',
      explanation: 'El Gran Dragón tiene escamas donde dice "tú debes" — son los mandatos familiares, culturales y económicos que asumimos como propios sin cuestionarlos.',
      orderIndex: 3,
    },
    {
      quizId: quizId19,
      type: 'multiple_choice' as const,
      question: '¿Por qué el curso advierte que el León tiene un peligro?',
      options: JSON.stringify([
        'Porque puede volverse violento físicamente',
        'Porque puede quedarse atrapado en la destrucción y la rebeldía permanente sin nunca crear',
        'Porque puede asustar a las demás personas',
        'Porque el rugido desgasta la voz',
      ]),
      correctAnswer: 'Porque puede quedarse atrapado en la destrucción y la rebeldía permanente sin nunca crear',
      explanation: 'El León que solo dice "no" y nunca crea es tan esclavo como el Camello — su cadena es la rebeldía permanente. El León es una etapa necesaria pero transitoria.',
      orderIndex: 4,
    },
    {
      quizId: quizId19,
      type: 'true_false' as const,
      question: 'Según los estudios de Christakis y Fowler, los comportamientos se propagan hasta tres grados de separación en las redes sociales.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Verdadero',
      explanation: 'La investigación de Christakis y Fowler en Harvard demostró que comportamientos como la felicidad, la obesidad y los hábitos se propagan hasta tres grados de separación: amigos, amigos de amigos, y amigos de amigos de amigos.',
      orderIndex: 5,
    },
    {
      quizId: quizId19,
      type: 'multiple_choice' as const,
      question: '¿Qué significa la estrategia "Tit for Tat" aplicada como filosofía de vida del Hombre Gris?',
      options: JSON.stringify([
        'Vengarse de quien te hizo daño',
        'Empezar siempre cooperando, responder a la reciprocidad y perdonar rápido cuando el otro vuelve a cooperar',
        'No confiar en nadie hasta que demuestren ser confiables',
        'Hacer exactamente lo mismo que hacen los demás',
      ]),
      correctAnswer: 'Empezar siempre cooperando, responder a la reciprocidad y perdonar rápido cuando el otro vuelve a cooperar',
      explanation: 'Tit for Tat como filosofía del Hombre Gris significa dar el primer paso de confianza, responder a la cooperación con cooperación, poner límites si hay traición, pero perdonar rápido si el otro vuelve a cooperar.',
      orderIndex: 6,
    },
    {
      quizId: quizId19,
      type: 'multiple_choice' as const,
      question: 'Según Damon Centola, ¿qué porcentaje aproximado de la población comprometida con un nuevo comportamiento se necesita para que se convierta en norma social?',
      options: JSON.stringify([
        'El 5%',
        'El 25%',
        'El 51% (mayoría simple)',
        'El 90%',
      ]),
      correctAnswer: 'El 25%',
      explanation: 'Los estudios de Centola sugieren que aproximadamente un 25% de la población comprometida con un nuevo comportamiento es suficiente para que se convierta en norma social — la masa crítica.',
      orderIndex: 7,
    },
    {
      quizId: quizId19,
      type: 'true_false' as const,
      question: 'El "Instante del Hombre Gris" es un evento espectacular y único que sucede una sola vez en la vida.',
      options: JSON.stringify(['Verdadero', 'Falso']),
      correctAnswer: 'Falso',
      explanation: 'El Instante del Hombre Gris no es un evento espectacular sino una práctica diaria: elegir cada día quién ser, qué cargar, qué soltar, qué crear. Cada instante es una elección.',
      orderIndex: 8,
    },
  ];

  for (const q of questions19) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions19.length, 'questions for course 19');
}

async function main() {
  console.log('Seeding Road 6: El Fuego Interior...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) {
      console.log('No users found. Please create a user first.');
      return;
    }
    const authorId = author.id;
    console.log('Using author ID:', authorId, 'Username:', author.username);

    await seedCourse16(authorId);
    await seedCourse17(authorId);
    await seedCourse18(authorId);
    await seedCourse19(authorId);

    console.log('Road 6: El Fuego Interior seeding complete!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
