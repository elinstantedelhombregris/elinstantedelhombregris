import Database from 'better-sqlite3';
import { db } from '../server/db';
import { courses, courseLessons, courseQuizzes, quizQuestions, users } from '../shared/schema-sqlite';
import { eq } from 'drizzle-orm';

const sqlite = new Database('local.db');

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
      title: '¿Que Son las Emociones y Como Funcionan en Tu Cuerpo?',
      description: 'Comprende la base neurofisiologica de las emociones y por que tu cuerpo reacciona antes que tu mente.',
      content: `
        <h2>Las Emociones: Tu Sistema de Navegacion Interior</h2>
        <p>Antes de poder gestionar tus emociones, necesitas entender que son realmente. Las emociones no son caprichos ni debilidades: son <strong>senales biologicas</strong> que tu cuerpo produce para ayudarte a sobrevivir y prosperar. Son tan reales como el hambre o la sed, y negarlas tiene consecuencias tan graves como ignorar el dolor fisico.</p>

        <h3>La Neurociencia Basica de las Emociones</h3>
        <p>Tu cerebro tiene tres capas principales que interactuan constantemente:</p>
        <ul>
          <li><strong>El cerebro reptiliano (tronco encefalico):</strong> Controla las funciones basicas de supervivencia. Es el que te hace saltar cuando escuchas un ruido fuerte. En Argentina, es el que se activa cada vez que escuchas "devaluacion" o "corralito".</li>
          <li><strong>El cerebro emocional (sistema limbico):</strong> La amigdala, el hipocampo y otras estructuras procesan tus experiencias emocionales. Aqui se almacenan las memorias cargadas de emocion, desde la alegria de un gol de la seleccion hasta el terror de una crisis economica.</li>
          <li><strong>La corteza prefrontal:</strong> Es tu capacidad de reflexion, planificacion y regulacion. Es la parte que puede decir "espera, no reacciones todavia". Pero bajo estres cronico, esta parte se <em>apaga parcialmente</em>.</li>
        </ul>

        <blockquote>"El Hombre Gris no niega sus emociones: las integra. La metamorfosis del Camello al Leon comienza cuando dejamos de cargar con emociones que no hemos procesado." — Filosofia del Hombre Gris</blockquote>

        <h3>El Mapa Corporal de las Emociones</h3>
        <p>Investigaciones de la Universidad de Aalto demostraron que las emociones tienen <strong>firmas corporales universales</strong>:</p>
        <ul>
          <li><strong>La ira</strong> se siente como calor en el pecho, los brazos y la cabeza. Las manos se cierran, la mandibula se tensa.</li>
          <li><strong>El miedo</strong> genera un nudo en el estomago, las piernas se debilitan, el corazon se acelera.</li>
          <li><strong>La tristeza</strong> produce una sensacion de pesadez en el pecho, los hombros caen, la energia baja.</li>
          <li><strong>La alegria</strong> se expande por todo el cuerpo, hay ligereza, el pecho se abre.</li>
          <li><strong>La ansiedad</strong> crea tension en el cuello, hombros y mandibula, con un zumbido constante de energia nerviosa.</li>
        </ul>

        <h3>Ejercicio Practico: El Escaneo Corporal de 5 Minutos</h3>
        <p>Este ejercicio es la base de toda inteligencia emocional. Practícalo una vez al dia durante esta semana:</p>
        <ol>
          <li>Sientate comodo y cierra los ojos.</li>
          <li>Recorre tu cuerpo desde los pies hasta la cabeza.</li>
          <li>En cada zona, preguntate: "¿Que siento aqui? ¿Tension? ¿Calor? ¿Nada?"</li>
          <li>No intentes cambiar nada. Solo observa y nombra.</li>
          <li>Cuando termines, preguntate: "¿Que emocion podria estar conectada con estas sensaciones?"</li>
        </ol>

        <h3>¿Por Que Importa Esto en Argentina?</h3>
        <p>Vivir en un pais con <strong>inestabilidad cronica</strong> significa que tu sistema nervioso esta sometido a un estres que la mayoria de los manuales de psicologia no contemplan. No es el estres de un examen o una mudanza: es el estres de no saber si tu sueldo va a alcanzar el mes que viene, de ver como tus ahorros se evaporan, de sentir que las reglas del juego cambian cada pocos anos.</p>
        <p>Este tipo de estres <em>cronico y sistemico</em> altera literalmente la estructura de tu cerebro. La amigdala se agranda (mas reactividad), la corteza prefrontal se adelgaza (menos capacidad de regulacion). Por eso no es "debilidad" sentirte abrumado: es <strong>biologia</strong>.</p>
        <p>La buena noticia: el cerebro es plastico. Puede cambiar. Y las herramientas que vas a aprender en este curso estan disenadas para esa realidad especifica.</p>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Respuesta de Estres en una Economia Cronicamente Inestable',
      description: 'Entiende como la inestabilidad economica argentina programa tu sistema nervioso y que hacer al respecto.',
      content: `
        <h2>Tu Sistema Nervioso en la Argentina Real</h2>
        <p>El estres no es solo una palabra de moda. Es una <strong>respuesta fisiologica concreta</strong> que tu cuerpo activa para protegerte. El problema no es el estres en si, sino cuando se vuelve <em>cronico</em>. Y en Argentina, la cronicidad es la norma.</p>

        <h3>Las Tres Respuestas al Estres</h3>
        <p>Tu sistema nervioso autonomo tiene tres modos principales, segun la teoria polivagal del Dr. Stephen Porges:</p>
        <ol>
          <li><strong>Modo Seguro (ventral vagal):</strong> Estas tranquilo, conectado, puedes pensar con claridad. Podes ser creativo, empatico, colaborar. Es el estado desde el que el Hombre Gris construye.</li>
          <li><strong>Modo Lucha/Huida (simpatico):</strong> Tu cuerpo se prepara para pelear o escapar. El corazon se acelera, los musculos se tensan, la digestion se detiene. Es util en una emergencia real, pero devastador cuando es permanente.</li>
          <li><strong>Modo Colapso (dorsal vagal):</strong> Cuando el estres es demasiado, tu sistema se apaga. Aparece la apatia, la desconexion, el "ya fue, no se puede hacer nada". Muchos argentinos viven aqui sin saberlo.</li>
        </ol>

        <blockquote>"La transformacion del Camello —el que carga con todo sin cuestionar— comienza cuando reconoces que tu agotamiento no es pereza: es un sistema nervioso saturado pidiendo auxilio."</blockquote>

        <h3>El Estres Economico Argentino: Un Caso Especial</h3>
        <p>La psicologia convencional estudia el estres como algo puntual: un despido, un divorcio, una enfermedad. Pero el estres argentino tiene caracteristicas unicas:</p>
        <ul>
          <li><strong>Es impredecible:</strong> No sabes cuando viene la proxima crisis. Esto genera un estado de alerta permanente que es mas danino que un evento traumatico unico.</li>
          <li><strong>Es sistemico:</strong> No depende de tus decisiones individuales. Podes hacer todo "bien" y aun asi perder tus ahorros. Esto genera indefension aprendida.</li>
          <li><strong>Es transgeneracional:</strong> Tus padres y abuelos pasaron por lo mismo. El estres se transmite epigeneticamente y a traves de patrones familiares.</li>
          <li><strong>Es normalizado:</strong> "Aca siempre fue asi" funciona como mecanismo de negacion colectiva.</li>
        </ul>

        <h3>Los Sintomas que Nadie Conecta con el Estres Economico</h3>
        <p>Muchos argentinos experimentan estos sintomas sin conectarlos con la inestabilidad:</p>
        <ul>
          <li>Insomnio o sueno no reparador</li>
          <li>Irritabilidad cronica ("estoy con los cables pelados")</li>
          <li>Problemas digestivos (gastritis, colon irritable)</li>
          <li>Dificultad para concentrarse o tomar decisiones</li>
          <li>Tension muscular cronica, especialmente en cuello y hombros</li>
          <li>Sensacion de estar siempre "en guardia"</li>
        </ul>

        <h3>Ejercicio: Identifica Tu Modo Dominante</h3>
        <p>Durante los proximos tres dias, registra en que modo te encontras la mayor parte del tiempo:</p>
        <ol>
          <li>Al despertar, antes de mirar el celular: ¿como esta tu cuerpo?</li>
          <li>Despues de leer noticias economicas: ¿que cambia?</li>
          <li>En el trabajo: ¿estas en modo seguro, lucha/huida o colapso?</li>
          <li>A la noche: ¿podes relajarte o tu mente sigue acelerada?</li>
        </ol>
        <p>No juzgues lo que encuentres. <strong>Observar es el primer paso para cambiar.</strong> En la filosofia del Hombre Gris, el Nino —la tercera metamorfosis— es pura presencia y observacion sin juicio.</p>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Autoconciencia: El Primer Paso de la Inteligencia Emocional',
      description: 'Desarrolla la capacidad de observar tus estados internos sin reaccionar automaticamente.',
      content: `
        <h2>El Arte de Conocerte Sin Mentirte</h2>
        <p>La autoconciencia emocional es la <strong>piedra angular</strong> de toda inteligencia emocional. Sin ella, todo lo demas —regulacion, empatia, comunicacion— es construccion sobre arena. Y en Argentina, donde la cultura nos ensena a "bancarsela" o a explotar, la autoconciencia es un acto casi revolucionario.</p>

        <h3>¿Que Es Realmente la Autoconciencia Emocional?</h3>
        <p>No es simplemente saber que "estas enojado". Es un proceso de tres capas:</p>
        <ol>
          <li><strong>Reconocer la emocion en tiempo real:</strong> "Estoy sintiendo ira ahora mismo."</li>
          <li><strong>Entender el gatillo:</strong> "Esta ira aparecio cuando lei que aumentaron las tarifas otra vez."</li>
          <li><strong>Identificar el patron:</strong> "Cada vez que siento que pierdo control sobre mi economia, reacciono con ira porque debajo hay miedo."</li>
        </ol>

        <blockquote>"Conocete a ti mismo" no es un consejo abstracto. Es la herramienta mas practica que existe. El Hombre Gris que no se conoce a si mismo termina repitiendo los mismos ciclos que dice querer romper.</blockquote>

        <h3>Los Cuatro Dominios de la Autoconciencia</h3>
        <ul>
          <li><strong>Autoconciencia corporal:</strong> ¿Donde siento la emocion en mi cuerpo? ¿Que me esta diciendo mi cuerpo que mi mente todavia no registro?</li>
          <li><strong>Autoconciencia emocional:</strong> ¿Que estoy sintiendo exactamente? ¿Es enojo o es frustracion? ¿Es tristeza o es decepcion? La precision importa.</li>
          <li><strong>Autoconciencia cognitiva:</strong> ¿Que pensamientos acompanan esta emocion? ¿Son hechos o interpretaciones? ¿Estoy catastrofizando?</li>
          <li><strong>Autoconciencia relacional:</strong> ¿Como afecta mi estado emocional a las personas que me rodean? ¿Estoy descargando mi estres en quienes no tienen nada que ver?</li>
        </ul>

        <h3>Vocabulario Emocional: Expandir Tu Diccionario Interior</h3>
        <p>La mayoria de las personas operan con un vocabulario emocional de 5-10 palabras: bien, mal, contento, enojado, triste. Pero existen mas de 300 emociones diferenciables. Cuantas mas puedas nombrar, mejor podras gestionarlas.</p>
        <p>En vez de "estoy mal", intentar precisar:</p>
        <ul>
          <li>¿Es <em>frustracion</em> (quiero algo y no puedo lograrlo)?</li>
          <li>¿Es <em>impotencia</em> (siento que no puedo cambiar nada)?</li>
          <li>¿Es <em>desilucion</em> (esperaba algo diferente)?</li>
          <li>¿Es <em>agotamiento</em> (no me queda energia)?</li>
          <li>¿Es <em>verguenza</em> (siento que falle)?</li>
          <li>¿Es <em>nostalgia</em> (extrano algo que ya no esta)?</li>
        </ul>

        <h3>El Diario Emocional del Hombre Gris</h3>
        <p>Herramienta practica para desarrollar autoconciencia. Cada noche, durante 10 minutos, responde:</p>
        <ol>
          <li><strong>¿Cual fue mi emocion dominante hoy?</strong> (nombrarla con precision)</li>
          <li><strong>¿Que la gatillo?</strong> (evento externo o pensamiento interno)</li>
          <li><strong>¿Como reaccione?</strong> (sin juzgar, solo describir)</li>
          <li><strong>¿Como me hubiera gustado responder?</strong> (la brecha entre reaccion y respuesta deseada)</li>
          <li><strong>¿Que puedo aprender de esto?</strong> (el grano de oro de cada experiencia emocional)</li>
        </ol>

        <h3>Trampas Comunes de la Autoconciencia en Argentina</h3>
        <p>Cuidado con estos obstaculos culturales:</p>
        <ul>
          <li><strong>"Los hombres no lloran":</strong> La cultura machista niega la mitad del espectro emocional masculino. El Hombre Gris abraza la vulnerabilidad como fortaleza.</li>
          <li><strong>"No seas exagerado/a":</strong> Minimizar las emociones ajenas (y propias) es una forma de violencia sutil.</li>
          <li><strong>"Hay gente que esta peor":</strong> Comparar el sufrimiento no lo elimina, solo le agrega culpa.</li>
          <li><strong>"Sos re intenso/a":</strong> Sentir profundamente no es un defecto. Es informacion valiosa.</li>
        </ul>
        <p>La autoconciencia es un musculo. Se fortalece con practica diaria. No busques la perfeccion: busca la <strong>honestidad contigo mismo</strong>.</p>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Regulacion Emocional: Del Modo Reactivo al Modo Responsivo',
      description: 'Aprende tecnicas concretas para pasar de la reaccion automatica a la respuesta consciente.',
      content: `
        <h2>De Reaccionar a Responder: La Diferencia que Transforma</h2>
        <p>Hay una diferencia fundamental entre <strong>reaccionar</strong> y <strong>responder</strong>. Reaccionar es automatico, instantaneo, gobernado por la amigdala. Responder requiere una pausa, un espacio entre el estimulo y tu accion. En ese espacio esta tu libertad.</p>

        <h3>La Ventana de Tolerancia</h3>
        <p>El psicologo Dan Siegel desarrollo el concepto de la <em>ventana de tolerancia</em>: el rango de activacion emocional dentro del cual podes funcionar bien. Cuando estas dentro de tu ventana:</p>
        <ul>
          <li>Podes pensar con claridad</li>
          <li>Podes escuchar al otro</li>
          <li>Podes tomar decisiones razonables</li>
          <li>Podes ser creativo y colaborativo</li>
        </ul>
        <p>Cuando salis por arriba (hiperactivacion): iras, panico, agitacion. Cuando salis por abajo (hipoactivacion): apatia, desconexion, shutdown. El objetivo no es nunca salir de la ventana —eso es imposible— sino <strong>ampliarla</strong> y <strong>volver mas rapido</strong>.</p>

        <blockquote>"La metamorfosis del Leon —el que ruge contra lo injusto— solo es efectiva si el rugido nace de la claridad, no del desborde. Un Leon desregulado destruye lo que quiere proteger."</blockquote>

        <h3>Tecnica 1: La Pausa de los 90 Segundos</h3>
        <p>La neurocientifica Jill Bolte Taylor descubrio que una emocion tarda <strong>90 segundos</strong> en recorrer tu cuerpo como reaccion quimica. Despues de eso, si la emocion persiste, es porque la estas realimentando con tus pensamientos.</p>
        <ol>
          <li>Cuando sientas una emocion intensa, mira el reloj.</li>
          <li>Respira profundo y observa la sensacion en tu cuerpo.</li>
          <li>No hagas nada durante 90 segundos.</li>
          <li>Despues de ese tiempo, preguntate: "¿Que quiero hacer ahora, desde la claridad?"</li>
        </ol>

        <h3>Tecnica 2: El Anclaje Sensorial (Grounding)</h3>
        <p>Cuando el estres te saca de tu ventana de tolerancia, esta tecnica te trae al presente:</p>
        <ul>
          <li><strong>5 cosas que ves</strong> (nombrarlas en voz alta si es posible)</li>
          <li><strong>4 cosas que tocas</strong> (sentir la textura, la temperatura)</li>
          <li><strong>3 cosas que escuchas</strong> (sonidos cercanos y lejanos)</li>
          <li><strong>2 cosas que oles</strong> (aunque sea sutil)</li>
          <li><strong>1 cosa que saboreas</strong> (el gusto en tu boca)</li>
        </ul>

        <h3>Tecnica 3: La Respiracion 4-7-8</h3>
        <p>Esta tecnica activa directamente tu sistema parasimpatico (el freno de tu sistema nervioso):</p>
        <ol>
          <li>Inhala por la nariz contando hasta 4</li>
          <li>Retene el aire contando hasta 7</li>
          <li>Exhala por la boca contando hasta 8</li>
          <li>Repeti 4 veces</li>
        </ol>
        <p>Podes usarla antes de una reunion dificil, despues de leer noticias que te alteran, o cuando sentis que estas a punto de decir algo de lo que te vas a arrepentir.</p>

        <h3>Tecnica 4: El Reetiquetado Cognitivo</h3>
        <p>Cambiar la narrativa interna sin negar la emocion:</p>
        <ul>
          <li>En vez de "esto es un desastre" → "esto es dificil y puedo buscar opciones"</li>
          <li>En vez de "siempre pasa lo mismo" → "esto ya paso antes y lo sobrevivi"</li>
          <li>En vez de "este pais no tiene arreglo" → "hay cosas que puedo cambiar desde mi lugar"</li>
        </ul>
        <p>Esto no es "pensamiento positivo toxico". Es <strong>precision cognitiva</strong>: distinguir entre hechos e interpretaciones catastroficas.</p>

        <h3>Aplicacion: La Regulacion en Contexto Argentino</h3>
        <p>Situaciones tipicas donde aplicar estas herramientas:</p>
        <ul>
          <li>Cuando abris la app del banco y ves que tu plata vale menos</li>
          <li>En discusiones politicas en la mesa familiar</li>
          <li>Cuando tu jefe te pide "un esfuercito mas" sin compensacion</li>
          <li>Cuando lees las redes sociales y sentis indignacion</li>
        </ul>
        <p>La regulacion emocional no te convierte en un robot: te convierte en alguien que <strong>elige</strong> como canalizar su energia emocional.</p>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tus Gatillos Emocionales: Dinero, Politica y Familia',
      description: 'Identifica y trabaja con los tres grandes gatillos emocionales de la vida argentina.',
      content: `
        <h2>Los Tres Campos Minados Emocionales</h2>
        <p>En Argentina, hay tres temas que activan el sistema limbico mas rapido que cualquier otra cosa: <strong>el dinero, la politica y la familia</strong>. No es casualidad: los tres estan profundamente conectados con nuestra identidad, nuestra seguridad y nuestro sentido de pertenencia.</p>

        <h3>Gatillo 1: El Dinero</h3>
        <p>Para la mayoria de los argentinos, el dinero no es solo un medio de intercambio. Es un <strong>campo de batalla emocional</strong> cargado de trauma transgeneracional:</p>
        <ul>
          <li><strong>Hiperinflaciones:</strong> Tus padres o abuelos vieron como su dinero se volvia papel. Eso deja una marca que se transmite.</li>
          <li><strong>Corralitos:</strong> La traicion del sistema financiero genera una desconfianza visceral que afecta todas tus decisiones economicas.</li>
          <li><strong>El dolar como obsesion:</strong> Mirar la cotizacion del dolar es un ritual argentino que activa cortisol como pocas cosas.</li>
        </ul>
        <p>Ejercicio: Escribe tu <em>historia personal con el dinero</em>. ¿Que aprendiste de tu familia sobre el dinero? ¿Que frases se repetian? ("La plata no alcanza", "Hay que guardar por las dudas", "Los ricos son todos chorros"). Estas creencias operan como programas automaticos en tu sistema emocional.</p>

        <h3>Gatillo 2: La Politica</h3>
        <p>La famosa "grieta" no es solo un fenomeno politico: es un <strong>fenomeno emocional</strong>. Cuando discutis de politica, no estas debatiendo ideas: estas defendiendo tu identidad.</p>
        <ul>
          <li><strong>Identidad tribal:</strong> "Yo soy de X" se siente como "yo soy X". Un ataque a tu posicion politica se procesa como un ataque personal.</li>
          <li><strong>Razonamiento motivado:</strong> Tu cerebro busca confirmar lo que ya crees, no descubrir la verdad. Esto no es estupidez: es biologia.</li>
          <li><strong>El secuestro amigdalar:</strong> En una discusion politica acalorada, tu corteza prefrontal se apaga. Literalmente perdes la capacidad de pensar bien.</li>
        </ul>

        <blockquote>"El Hombre Gris no es de ningun bando. No porque sea tibio, sino porque ve lo que cada bando no puede ver de si mismo. El gris integra: no divide."</blockquote>

        <h3>Gatillo 3: La Familia</h3>
        <p>La familia argentina es simultaneamente el mayor soporte emocional y el mayor campo de activacion:</p>
        <ul>
          <li><strong>Roles rigidos:</strong> "El hijo que tiene que triunfar", "la hija que tiene que cuidar", "el hermano oveja negra". Estos roles generan presion emocional cronica.</li>
          <li><strong>Lealtades invisibles:</strong> Sentir que "traicionas" a tu familia por pensar diferente, vivir diferente o elegir un camino propio.</li>
          <li><strong>Comunicacion indirecta:</strong> Decir las cosas "por atras", usar el humor sarcastico para expresar dolor, los silencios cargados de significado.</li>
          <li><strong>El asado como arena politica:</strong> El clasico almuerzo familiar donde se mezclan afecto, critica, politica y drama en proporciones impredecibles.</li>
        </ul>

        <h3>Mapa de Gatillos Personal</h3>
        <p>Herramienta practica para cada uno de los tres campos:</p>
        <ol>
          <li><strong>Identifica tu gatillo especifico:</strong> No es "la politica" en general. Es "cuando mi cunado dice X" o "cuando veo la noticia de Y".</li>
          <li><strong>Reconoce la emocion debajo:</strong> La ira suele ser la emocion superficial. Debajo hay miedo, impotencia, tristeza o verguenza.</li>
          <li><strong>Localiza la sensacion en tu cuerpo:</strong> ¿Donde sientes el gatillo? ¿Pecho? ¿Estomago? ¿Garganta?</li>
          <li><strong>Identifica tu reaccion automatica:</strong> ¿Atacas? ¿Te cerras? ¿Te vas? ¿Haces chistes?</li>
          <li><strong>Disenha una respuesta alternativa:</strong> ¿Que harias si pudieras elegir conscientemente?</li>
        </ol>

        <h3>La Regla de Oro: Separar la Persona del Gatillo</h3>
        <p>Tu cunado no es tu enemigo. Tu jefe no es la causa de tu frustracion. El gobierno no es responsable de todas tus emociones. Estas personas y situaciones <em>activan</em> algo que ya estaba en vos. El trabajo interior es tuyo, no de ellos.</p>
        <p>Esto no significa que no existan injusticias reales. Significa que tu <strong>respuesta</strong> a esas injusticias sera mas efectiva si nace de la claridad emocional, no de la reactividad.</p>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Autocompasion en una Cultura del "Aguante"',
      description: 'Descubre por que tratarte con compasion no es debilidad sino la base del cambio sostenible.',
      content: `
        <h2>Mas Alla del "Aguante": La Revolucion de Tratarte Bien</h2>
        <p>Argentina tiene una cultura del <strong>"aguante"</strong> profundamente arraigada. Aguantar la crisis, aguantar al jefe, aguantar la incertidumbre, aguantar sin quejarse. El problema es que el aguante sin compasion se convierte en <em>autoagresion disfrazada de fortaleza</em>.</p>

        <h3>¿Que Es la Autocompasion? (Y Que No Es)</h3>
        <p>La investigadora Kristin Neff identifico tres componentes de la autocompasion:</p>
        <ol>
          <li><strong>Amabilidad hacia uno mismo</strong> (en vez de autocritica brutal): Tratarte como tratarias a un amigo querido que esta pasando por lo mismo que vos.</li>
          <li><strong>Humanidad compartida</strong> (en vez de aislamiento): Recordar que no sos el unico que sufre, que la dificultad es parte de la experiencia humana compartida.</li>
          <li><strong>Atencion plena</strong> (en vez de sobreidentificacion): Observar tu dolor sin exagerarlo ni minimizarlo.</li>
        </ol>
        <p><strong>Lo que NO es:</strong></p>
        <ul>
          <li>No es autoindulgencia ("pobrecito de mi, me quedo en la cama")</li>
          <li>No es bajar los estandares ("como me trato bien, no me exijo")</li>
          <li>No es autoestima inflada ("soy el mejor, no tengo nada que mejorar")</li>
          <li>No es debilidad. De hecho, la investigacion muestra que las personas autocompasivas son <em>mas</em> resilientes, no menos.</li>
        </ul>

        <blockquote>"La Bondad Radical del Hombre Gris comienza hacia adentro. No podes dar lo que no tenes. Si tu dialogo interior es un campo de batalla, tu accion exterior sera guerra disfrazada de cambio social."</blockquote>

        <h3>La Voz del Critico Interior Argentino</h3>
        <p>Tenemos un critico interior particularmente sofisticado, moldeado por la cultura:</p>
        <ul>
          <li><strong>"Sos un boludo/a":</strong> La autocritica disfrazada de humor. Nos reimos, pero la amigdala no entiende de chistes.</li>
          <li><strong>"No te alcanza porque no laburas lo suficiente":</strong> Cuando el sistema falla, nos culpamos individualmente.</li>
          <li><strong>"Dejate de joder con eso":</strong> Minimizar el propio sufrimiento es una forma de autoagresion.</li>
          <li><strong>"Hay gente que la pasa peor":</strong> Comparar sufrimiento para invalidar el propio.</li>
        </ul>

        <h3>Practica: El Toque Compasivo</h3>
        <p>Cuando notes que tu critico interior esta activo:</p>
        <ol>
          <li>Coloca una mano sobre tu pecho (esto activa la oxitocina, la hormona del vinculo).</li>
          <li>Respira profundo tres veces.</li>
          <li>Decite internamente: "Esto es dificil. No soy el unico que pasa por esto. Me merezco la misma compasion que le daria a un amigo."</li>
          <li>Si te parece "cursi", nota esa resistencia sin juzgarla. La resistencia a la compasion es en si misma un dato importante.</li>
        </ol>

        <h3>Autocompasion y Accion Social</h3>
        <p>Contrario a lo que parece, la autocompasion no te vuelve pasivo. La investigacion de Neff demuestra que las personas autocompasivas:</p>
        <ul>
          <li>Son <strong>mas</strong> propensas a tomar accion ante la injusticia</li>
          <li>Persisten <strong>mas</strong> en tareas dificiles</li>
          <li>Son <strong>mas</strong> capaces de reconocer errores y aprender de ellos</li>
          <li>Sufren <strong>menos</strong> burnout activista</li>
        </ul>
        <p>El Hombre Gris que se trata con compasion tiene mas energia, mas claridad y mas capacidad de servicio sostenible. El que se flagela constantemente termina quemado, cinico o desconectado.</p>

        <h3>Ejercicio Semanal: Carta de Compasion</h3>
        <p>Escribe una carta a vos mismo desde la perspectiva de un amigo increiblemente sabio y compasivo. Que ese amigo te diga lo que necesitas escuchar sobre tu situacion actual. Sin criticas, sin consejos no pedidos, sin minimizacion. Solo compasion y verdad.</p>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },
    {
      courseId,
      title: 'Empatia Practica: Entender al Otro sin Perderte',
      description: 'Desarrolla empatia genuina sin caer en la sobreidentificacion ni el agotamiento emocional.',
      content: `
        <h2>Empatia con Limites: El Equilibrio del Hombre Gris</h2>
        <p>La empatia es la capacidad de <strong>sentir con el otro</strong>. Pero en Argentina, donde las emociones colectivas son intensas y la necesidad ajena es constante, la empatia sin limites se convierte en un camino directo al agotamiento.</p>

        <h3>Los Tres Tipos de Empatia</h3>
        <p>El psicologo Paul Ekman distingue tres formas de empatia que operan de manera diferente:</p>
        <ol>
          <li><strong>Empatia cognitiva:</strong> Entender intelectualmente lo que el otro siente. "Puedo ver que estas sufriendo." Es util para la negociacion y la mediacion.</li>
          <li><strong>Empatia emocional:</strong> Sentir lo que el otro siente. Cuando tu amigo llora, a vos tambien se te hace un nudo. Es la base de la conexion humana.</li>
          <li><strong>Preocupacion empatica:</strong> Sentir el impulso de ayudar, de hacer algo. Es lo que mueve la accion solidaria.</li>
        </ol>
        <p>Las tres son necesarias, pero en diferentes dosis segun la situacion. El error mas comun es quedarse atrapado en la empatia emocional sin pasar a la preocupacion empatica constructiva.</p>

        <h3>La Trampa de la Sobreempatia</h3>
        <p>En una sociedad con tanto sufrimiento visible, muchas personas caen en la <em>fatiga por compasion</em>:</p>
        <ul>
          <li>Absorber el dolor ajeno como propio</li>
          <li>Sentir culpa por estar "mejor" que otros</li>
          <li>No poder disfrutar de momentos buenos porque "hay gente que la esta pasando mal"</li>
          <li>Involucrarse emocionalmente en cada historia triste que ves en redes sociales</li>
          <li>Decir que si a todo porque "como le voy a decir que no"</li>
        </ul>

        <blockquote>"La empatia del Hombre Gris es como el agua: fluida pero con orillas. Sin orillas, el agua se dispersa y pierde fuerza. Con orillas demasiado rigidas, se estanca. El arte esta en el equilibrio."</blockquote>

        <h3>Empatia en la Grieta: Entender al que Piensa Diferente</h3>
        <p>El desafio mas grande de la empatia argentina no es sentir compasion por el que sufre. Es <strong>entender al que piensa diferente</strong>. Esto no significa estar de acuerdo, sino comprender <em>desde donde</em> piensa lo que piensa.</p>
        <p>Preguntas que abren la empatia cognitiva:</p>
        <ul>
          <li>"¿Que experiencia de vida llevo a esta persona a pensar asi?"</li>
          <li>"¿Que miedo esta detras de esta posicion?"</li>
          <li>"¿Que necesidad legitima esta intentando proteger?"</li>
          <li>"¿Que tendria que haber vivido yo para pensar como el/ella?"</li>
        </ul>

        <h3>Practica: Escucha Empatica Estructurada</h3>
        <p>Esta semana, elegi una conversacion donde vas a practicar escucha empatica pura:</p>
        <ol>
          <li><strong>Escucha sin preparar tu respuesta.</strong> Tu unico trabajo es entender.</li>
          <li><strong>Refleja:</strong> "Si entiendo bien, lo que me estas diciendo es..." (parafrasea).</li>
          <li><strong>Valida la emocion:</strong> "Tiene sentido que te sientas asi dado lo que me contas."</li>
          <li><strong>Pregunta:</strong> "¿Hay algo mas?" (la primera respuesta casi nunca es la mas profunda).</li>
          <li><strong>No ofrezcas soluciones</strong> a menos que te las pidan explicitamente.</li>
        </ol>

        <h3>Proteger Tu Energia Empatica</h3>
        <p>Para poder sostener la empatia en el tiempo:</p>
        <ul>
          <li><strong>Limita tu consumo de noticias:</strong> Informate, no te intoxiques. 15 minutos al dia es suficiente.</li>
          <li><strong>Practica la "empatia con techo":</strong> Podes entender y compadecer sin absorber.</li>
          <li><strong>Recarga:</strong> Despues de situaciones emocionalmente intensas, necesitas tiempo de recuperacion.</li>
          <li><strong>Distingui entre empatia y responsabilidad:</strong> Podes sentir empatia por alguien sin ser responsable de solucionar su problema.</li>
        </ul>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Comunicacion Emocional Inteligente',
      description: 'Aprende a expresar lo que sentis de manera que construya puentes en vez de muros.',
      content: `
        <h2>Decir lo que Sentis Sin Destruir Relaciones</h2>
        <p>La comunicacion emocional es el puente entre tu mundo interior y el mundo exterior. En Argentina, donde la comunicacion tiende a ser <strong>apasionada, indirecta y cargada de sobreentendidos</strong>, aprender a comunicar emociones con claridad es un superpoder.</p>

        <h3>El Modelo de Comunicacion No Violenta (CNV)</h3>
        <p>Marshall Rosenberg desarrollo un modelo de cuatro pasos que transforma la comunicacion:</p>
        <ol>
          <li><strong>Observacion (sin juicio):</strong> Describir lo que paso como lo haria una camara de video. "Cuando llegaste 40 minutos tarde..." (no "Cuando siempre llegas tarde como un irresponsable...")</li>
          <li><strong>Sentimiento:</strong> Expresar la emocion que eso genero en vos. "Me senti preocupado y frustrado..." (no "Me hiciste enojar...")</li>
          <li><strong>Necesidad:</strong> Conectar esa emocion con una necesidad no satisfecha. "...porque necesito sentir que mi tiempo es respetado..."</li>
          <li><strong>Pedido (no exigencia):</strong> Hacer un pedido concreto y realizable. "¿Podriamos acordar avisarnos si vamos a llegar tarde?"</li>
        </ol>

        <blockquote>"La comunicacion del Hombre Gris no busca ganar discusiones sino construir entendimiento. En un pais acostumbrado al grito, hablar con precision emocional es un acto de coraje."</blockquote>

        <h3>Errores Comunicacionales Tipicos Argentinos</h3>
        <ul>
          <li><strong>El sarcasmo como escudo:</strong> Usar el humor para decir verdades dolorosas sin hacerse cargo. "No, esta todo bien..." (cuando nada esta bien).</li>
          <li><strong>La generalizacion:</strong> "Siempre haces lo mismo" o "Nunca me escuchas". Esto activa la defensiva del otro inmediatamente.</li>
          <li><strong>El "vos-mensaje":</strong> "Vos sos un insensible" en vez de "yo me senti ignorado". El primero ataca, el segundo informa.</li>
          <li><strong>El tratamiento silencioso:</strong> Dejar de hablar como castigo. Es una forma de violencia emocional pasiva.</li>
          <li><strong>La escalada competitiva:</strong> "¿A vos te fue mal? ¡A mi me fue peor!" Competir por el sufrimiento destruye la conexion.</li>
        </ul>

        <h3>Comunicacion en Contextos Dificiles</h3>
        <p><strong>En la mesa familiar con tema politico:</strong></p>
        <ul>
          <li>Antes de hablar, preguntate: "¿Quiero convencer o quiero conectar?"</li>
          <li>Usa "yo pienso" en vez de "la realidad es". Nadie tiene el monopolio de la realidad.</li>
          <li>Valida antes de diferir: "Entiendo por que pensas asi. Mi experiencia me lleva a ver algo diferente."</li>
        </ul>
        <p><strong>En el trabajo con un jefe dificil:</strong></p>
        <ul>
          <li>Separa el problema de la persona: "El proceso tiene una dificultad" vs "Vos creaste un problema".</li>
          <li>Ofrece alternativas, no solo quejas: "Vi este problema y se me ocurren dos posibles soluciones."</li>
        </ul>
        <p><strong>En la pareja:</strong></p>
        <ul>
          <li>La investigacion de John Gottman muestra que las parejas exitosas tienen una proporcion de 5 interacciones positivas por cada 1 negativa.</li>
          <li>Evita los "cuatro jinetes del apocalipsis relacional": critica, desprecio, defensividad y obstruccion.</li>
        </ul>

        <h3>Ejercicio: Reformula Tres Frases</h3>
        <p>Toma tres cosas que dijiste (o pensaste) esta semana que generaron conflicto y reformulalas usando el modelo CNV de cuatro pasos. Nota como cambia la energia de la comunicacion cuando pasas del ataque a la expresion vulnerable.</p>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },
    {
      courseId,
      title: 'Habitos Emocionales: Reprogramar Tu Sistema Nervioso',
      description: 'Crea rutinas diarias que fortalezcan tu regulacion emocional de manera sostenible.',
      content: `
        <h2>Tu Sistema Nervioso Es un Jardin: Cultivalo</h2>
        <p>La inteligencia emocional no es algo que se "aprende" una vez y ya. Es un <strong>conjunto de habitos</strong> que se practican diariamente hasta que se vuelven automaticos. Asi como cepillarte los dientes no requiere fuerza de voluntad, regular tus emociones puede volverse algo natural con la practica suficiente.</p>

        <h3>La Ciencia de la Neuroplasticidad</h3>
        <p>Tu cerebro se recablea constantemente en funcion de lo que practicas. Esto se llama <em>neuroplasticidad</em>, y es la mejor noticia de la neurociencia moderna:</p>
        <ul>
          <li>8 semanas de meditacion aumentan la densidad de materia gris en la corteza prefrontal.</li>
          <li>La practica regular de regulacion emocional reduce el tamano de la amigdala (menos reactividad).</li>
          <li>Las conexiones neuronales que usas se fortalecen; las que no, se debilitan. "Las neuronas que se activan juntas, se conectan juntas."</li>
        </ul>

        <blockquote>"La metamorfosis del Nino —la tercera etapa— no es un destino: es una practica diaria. El Nino no nace transformado; se transforma cada manana al elegir la presencia sobre la reactividad."</blockquote>

        <h3>Los 7 Habitos Emocionales del Hombre Gris</h3>
        <ol>
          <li><strong>El Check-In Matutino (2 minutos):</strong> Antes de mirar el celular, preguntate: "¿Como estoy hoy? ¿Que necesito?" Solo eso. Dos preguntas que te conectan contigo antes de que el mundo exterior te capture.</li>
          <li><strong>La Micro-Meditacion (5 minutos):</strong> No necesitas una hora de silencio. Cinco minutos de atencion a la respiracion cambian tu quimica cerebral. Podes hacerlo en el colectivo, en el bano del trabajo, en la fila del super.</li>
          <li><strong>El Diario Emocional (10 minutos):</strong> Escribir lo que sentiste en el dia. No literatura: datos emocionales. ¿Que senti? ¿Que lo gatillo? ¿Como respondi?</li>
          <li><strong>El Movimiento Consciente (20 minutos):</strong> Caminar, yoga, estiramientos, bailar. El cuerpo procesa emociones a traves del movimiento. El sedentarismo es enemigo de la salud emocional.</li>
          <li><strong>La Conexion Genuina (variable):</strong> Una conversacion real por dia. Sin celular, sin distracciones. Mirando a los ojos. Escuchando de verdad.</li>
          <li><strong>La Higiene Informativa (15 minutos max):</strong> Limitar las noticias y redes sociales. Informate, no te intoxiques. Tu sistema nervioso no distingue entre una amenaza real y una noticia alarmante.</li>
          <li><strong>La Gratitud Nocturna (3 minutos):</strong> Antes de dormir, nombra tres cosas por las que estas agradecido. No tiene que ser algo grande. "Tome un cafe rico", "mi hijo me abrazo", "respire". La gratitud activa el sistema parasimpatico.</li>
        </ol>

        <h3>La Arquitectura del Habito</h3>
        <p>Segun James Clear (Habitos Atomicos), cada habito necesita:</p>
        <ul>
          <li><strong>Senal:</strong> Un gatillo que inicia el habito (la alarma suena = check-in matutino)</li>
          <li><strong>Rutina:</strong> La accion en si (las dos preguntas del check-in)</li>
          <li><strong>Recompensa:</strong> Algo que tu cerebro disfrute (la sensacion de claridad despues del check-in)</li>
          <li><strong>Acumulacion:</strong> Enganchar habitos nuevos a habitos existentes ("despues de servirme el mate, hago mi check-in")</li>
        </ul>

        <h3>Implementacion Realista para la Vida Argentina</h3>
        <p>No intentes hacer todo al mismo tiempo. Elige <strong>un habito</strong> y practicalo durante 21 dias antes de agregar otro. La consistencia vence a la intensidad:</p>
        <ul>
          <li>Semana 1-3: El check-in matutino (2 minutos)</li>
          <li>Semana 4-6: Agregar la gratitud nocturna (3 minutos)</li>
          <li>Semana 7-9: Agregar la micro-meditacion (5 minutos)</li>
          <li>Y asi sucesivamente...</li>
        </ul>
        <p>En tres meses, tendras una rutina de bienestar emocional que no te toma mas de 30 minutos al dia y que <strong>transforma literalmente la estructura de tu cerebro</strong>.</p>
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
        <h2>De la Teoria a Tu Vida: El Plan Integrado</h2>
        <p>Llegaste al final de este curso con un arsenal de herramientas emocionales. Ahora el desafio es el mas importante: <strong>integrar todo en un plan que funcione para tu vida real</strong>, no para una vida idealizada.</p>

        <h3>Paso 1: Tu Diagnostico Emocional Actual</h3>
        <p>Responde con honestidad:</p>
        <ul>
          <li>¿En que modo de tu sistema nervioso paso la mayor parte del tiempo? (seguro / lucha-huida / colapso)</li>
          <li>¿Cuales son mis tres principales gatillos emocionales?</li>
          <li>¿Como es mi dialogo interior habitual? (critico / compasivo / ausente)</li>
          <li>¿Como afectan mis emociones a mis relaciones mas cercanas?</li>
          <li>¿Que habitos emocionales tengo actualmente? (buenos y malos)</li>
        </ul>

        <h3>Paso 2: Tu Vision de Bienestar Emocional</h3>
        <p>No se trata de "no sentir emociones negativas". Se trata de:</p>
        <ol>
          <li><strong>Sentir todo el espectro</strong> sin quedarte atrapado en ningun extremo</li>
          <li><strong>Responder en vez de reaccionar</strong> la mayor parte del tiempo</li>
          <li><strong>Mantener relaciones</strong> donde la comunicacion emocional sea fluida</li>
          <li><strong>Tener energia</strong> para el servicio y la accion sin quemarte</li>
          <li><strong>Dormir bien, digerir bien, pensar bien:</strong> los indicadores basicos de un sistema nervioso regulado</li>
        </ol>

        <blockquote>"El Hombre Gris emocionalmente maduro no es el que nunca se enoja, llora o teme. Es el que hace algo util con cada emocion. Cada emocion es combustible: la pregunta es para que motor."</blockquote>

        <h3>Paso 3: Tu Kit de Emergencia Emocional</h3>
        <p>Crea una tarjeta (fisica o digital) con tus herramientas para momentos de crisis:</p>
        <ul>
          <li><strong>Si estoy en modo lucha/huida:</strong> Respiracion 4-7-8 + grounding 5-4-3-2-1</li>
          <li><strong>Si estoy en modo colapso:</strong> Movimiento suave + contacto con agua fria en las munecas</li>
          <li><strong>Si estoy rumiando:</strong> Escribir durante 10 minutos sin parar + salir a caminar</li>
          <li><strong>Si estoy a punto de explotar:</strong> Pausa de 90 segundos + la pregunta "¿que quiero lograr realmente?"</li>
          <li><strong>Si me siento solo/a:</strong> Llamar a una persona de mi red de confianza (tenerla definida de antemano)</li>
        </ul>

        <h3>Paso 4: Tu Red de Apoyo Emocional</h3>
        <p>Identifica al menos tres personas con las que puedas ser emocionalmente honesto:</p>
        <ol>
          <li>Alguien que te escuche sin juzgar</li>
          <li>Alguien que te diga verdades con amor</li>
          <li>Alguien con quien puedas reir y soltar</li>
        </ol>
        <p>Si no tenes estas tres personas, este curso te da permiso para buscarlas activamente. No es debilidad: es estrategia de supervivencia emocional.</p>

        <h3>Paso 5: Indicadores de Progreso</h3>
        <p>¿Como saber si estas avanzando? Revisa mensualmente:</p>
        <ul>
          <li>¿Cuanto tiempo tardo en volver a mi ventana de tolerancia despues de un gatillo? (deberia ir disminuyendo)</li>
          <li>¿Con que frecuencia reacciono automaticamente vs. respondo conscientemente? (la proporcion deberia mejorar)</li>
          <li>¿Como esta mi calidad de sueno? (indicador fisiologico clave)</li>
          <li>¿Mis relaciones cercanas estan mejorando, empeorando o igual?</li>
          <li>¿Tengo energia para mis proyectos o estoy cronicamente agotado?</li>
        </ul>

        <h3>Compromiso Final</h3>
        <p>Escribe tu compromiso con tu bienestar emocional. No un compromiso generico ("voy a ser mas feliz") sino uno concreto y medible. Por ejemplo: "Durante las proximas 8 semanas, voy a hacer el check-in matutino y la gratitud nocturna todos los dias, y voy a practicar la pausa de 90 segundos cada vez que sienta un gatillo emocional intenso."</p>
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
    description: 'Evalua tu comprension de las herramientas de inteligencia emocional aprendidas en este curso.',
    passingScore: 70,
    timeLimit: 20,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions16 = [
    {
      quizId: quiz16.id,
      question: '¿Cuanto tiempo tarda una emocion en recorrer tu cuerpo como reaccion quimica segun Jill Bolte Taylor?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['30 segundos', '90 segundos', '5 minutos', '15 minutos']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Segun la neurocientifica Jill Bolte Taylor, una emocion tarda 90 segundos en recorrer el cuerpo como reaccion quimica. Despues de eso, si persiste es por realimentacion cognitiva.',
      points: 1,
      orderIndex: 1,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuales son los tres modos del sistema nervioso autonomo segun la teoria polivagal?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Activo, pasivo y neutral',
        'Seguro (ventral vagal), lucha/huida (simpatico) y colapso (dorsal vagal)',
        'Consciente, inconsciente y subconsciente',
        'Emocional, racional y instintivo'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La teoria polivagal de Stephen Porges identifica tres estados: ventral vagal (seguridad), simpatico (lucha/huida) y dorsal vagal (colapso/shutdown).',
      points: 1,
      orderIndex: 2,
    },
    {
      quizId: quiz16.id,
      question: '¿Cuales son los tres componentes de la autocompasion segun Kristin Neff?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Autoestima, confianza y optimismo',
        'Amabilidad hacia uno mismo, humanidad compartida y atencion plena',
        'Perdon, aceptacion y gratitud',
        'Fortaleza, disciplina y perseverancia'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Kristin Neff define la autocompasion con tres componentes: amabilidad hacia uno mismo (vs autocritica), humanidad compartida (vs aislamiento) y atencion plena (vs sobreidentificacion).',
      points: 1,
      orderIndex: 3,
    },
    {
      quizId: quiz16.id,
      question: 'La autocompasion te vuelve pasivo y reduce tu motivacion para actuar.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Falso. La investigacion demuestra que las personas autocompasivas son mas resilientes, persisten mas en tareas dificiles y sufren menos burnout.',
      points: 1,
      orderIndex: 4,
    },
    {
      quizId: quiz16.id,
      question: '¿Cual es el orden correcto de los pasos de la Comunicacion No Violenta?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Sentimiento, pedido, observacion, necesidad',
        'Observacion, sentimiento, necesidad, pedido',
        'Necesidad, observacion, sentimiento, pedido',
        'Pedido, necesidad, sentimiento, observacion'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'El modelo CNV de Marshall Rosenberg sigue el orden: Observacion (sin juicio), Sentimiento, Necesidad y Pedido concreto.',
      points: 1,
      orderIndex: 5,
    },
    {
      quizId: quiz16.id,
      question: '¿Que tecnica de regulacion emocional usa los cinco sentidos para traerte al presente?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Respiracion 4-7-8',
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
      question: '¿Que caracteristica del estres economico argentino lo hace especialmente danino?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Es muy intenso',
        'Es impredecible, sistemico, transgeneracional y normalizado',
        'Solo afecta a los mas pobres',
        'Es exclusivamente financiero'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'El estres argentino combina cuatro factores que lo hacen particularmente danino: impredecibilidad, naturaleza sistemica, transmision transgeneracional y normalizacion cultural.',
      points: 1,
      orderIndex: 7,
    },
    {
      quizId: quiz16.id,
      question: 'En la filosofia del Hombre Gris, ¿que metamorfosis se relaciona con la presencia y observacion sin juicio?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'El Camello',
        'El Leon',
        'El Nino',
        'El Aguila'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Nino es la tercera metamorfosis y representa la presencia pura, la observacion sin juicio y la capacidad de crear desde la inocencia recuperada.',
      points: 1,
      orderIndex: 8,
    },
    {
      quizId: quiz16.id,
      question: 'La "ventana de tolerancia" se refiere al rango de activacion emocional dentro del cual puedes funcionar bien.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Correcto. Dan Siegel desarrollo este concepto: dentro de la ventana puedes pensar, escuchar y decidir con claridad. Fuera de ella estas en hiper o hipoactivacion.',
      points: 1,
      orderIndex: 9,
    },
    {
      quizId: quiz16.id,
      question: '¿Cual es la proporcion de interacciones positivas vs negativas en parejas exitosas segun Gottman?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        '1 a 1',
        '3 a 1',
        '5 a 1',
        '10 a 1'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'John Gottman descubrio que las parejas exitosas mantienen una proporcion de 5 interacciones positivas por cada 1 negativa.',
      points: 1,
      orderIndex: 10,
    },
  ];

  for (const question of questions16) {
    await db.insert(quizQuestions).values(question);
  }
  console.log('Created quiz with', questions16.length, 'questions for course 16');
}

// Placeholder for remaining courses - will be filled next
async function seedCourse17(authorId: number) {
  // PLACEHOLDER
}

async function seedCourse18(authorId: number) {
  // PLACEHOLDER
}

async function seedCourse19(authorId: number) {
  // PLACEHOLDER
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

main().finally(() => { sqlite.close(); });
