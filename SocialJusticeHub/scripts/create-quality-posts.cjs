const Database = require('better-sqlite3');
const db = new Database('local.db', { verbose: console.log });

const insertPost = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, author_id, published_at, category, featured, image_url, video_url, type, view_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getPostBySlug = db.prepare(`
  SELECT id FROM blog_posts WHERE slug = ?
`);

const insertTag = db.prepare(`
  INSERT OR IGNORE INTO post_tags (post_id, tag)
  VALUES (?, ?)
`);

const qualityPosts = [
  // BLOG POST 1: El Instante del Hombre Gris
  {
    title: "El Instante del Hombre Gris: El Momento de la Transformación",
    slug: "el-instante-del-hombre-gris-transformacion",
    excerpt: "Una reflexión profunda sobre ese momento crucial donde cada individuo decide dejar de ser espectador y convertirse en protagonista del cambio social.",
    content: `
<h1>El Instante del Hombre Gris: El Momento de la Transformación</h1>

<p>En la vida de cada persona existe un momento único, irrepetible, donde la conciencia se despierta y el corazón decide que ya no puede permanecer indiferente. Este es el instante del Hombre Gris: ese segundo eterno donde la transformación personal se convierte en semilla de cambio colectivo.</p>

<h2>¿Qué es el Instante del Hombre Gris?</h2>

<p>El "Instante del Hombre Gris" no es una metáfora abstracta, sino una experiencia real que miles de argentinos están viviendo en este momento. Es ese punto de inflexión donde:</p>

<ul>
<li>La frustración se transforma en determinación</li>
<li>La queja se convierte en acción</li>
<li>El desánimo se transforma en esperanza</li>
<li>El individualismo se vuelve solidaridad</li>
</ul>

<h2>Los Síntomas del Despertar</h2>

<p>Reconocer este momento en nuestra propia vida es fundamental. Algunas señales que indican que estás experimentando tu propio "instante del Hombre Gris":</p>

<h3>1. Incomodidad Creciente</h3>
<p>Ya no puedes mirar las noticias sin sentir que algo dentro de ti se rebela. La injusticia, la corrupción, la desigualdad te duelen de una manera diferente, más profunda.</p>

<h3>2. Preguntas que No Tienen Respuesta</h3>
<p>Te encuentras cuestionando todo: "¿Por qué aceptamos esto?", "¿Cómo llegamos hasta aquí?", "¿Qué puedo hacer yo?"</p>

<h3>3. Deseo de Conectar</h3>
<p>Sientes una necesidad urgente de encontrar a otros que piensen como tú, que sientan la misma inquietud, que estén dispuestos a actuar.</p>

<h2>El Proceso de Transformación</h2>

<p>Una vez que reconoces tu instante del Hombre Gris, comienza un proceso de transformación que tiene varias etapas:</p>

<h3>Etapa 1: La Introspección</h3>
<p>Es momento de preguntarte honestamente: ¿Qué valores realmente defiendo? ¿Qué tipo de sociedad quiero para mis hijos? ¿Estoy dispuesto a salir de mi zona de confort?</p>

<h3>Etapa 2: La Búsqueda</h3>
<p>Empiezas a buscar información, a leer, a informarte. Ya no te conformas con lo que dicen los medios tradicionales. Quieres entender la realidad desde múltiples perspectivas.</p>

<h3>Etapa 3: La Conexión</h3>
<p>Buscas a otros que estén en el mismo proceso. Grupos, organizaciones, movimientos que compartan tu visión de un mundo más justo.</p>

<h3>Etapa 4: La Acción</h3>
<p>Finalmente, decides actuar. Puede ser algo pequeño al principio, pero cada acción cuenta. Cada paso te acerca más a la persona que quieres ser.</p>

<h2>El Poder del Momento Presente</h2>

<p>Lo más hermoso del instante del Hombre Gris es que puede ocurrir en cualquier momento. No importa tu edad, tu situación económica, tu pasado. Lo único que importa es tu decisión de cambiar.</p>

<p>Este momento es especialmente poderoso porque:</p>

<ul>
<li><strong>Es personal:</strong> Nadie puede experimentarlo por ti</li>
<li><strong>Es irreversible:</strong> Una vez que despiertas, no puedes volver a dormir</li>
<li><strong>Es contagioso:</strong> Tu transformación inspira a otros</li>
<li><strong>Es transformador:</strong> Cambia no solo tu vida, sino el mundo que te rodea</li>
</ul>

<h2>¿Has Experimentado Tu Instante del Hombre Gris?</h2>

<p>Si estás leyendo esto y sientes que algo resuena en tu interior, es muy probable que ya hayas experimentado tu propio instante del Hombre Gris. La pregunta ahora es: ¿Qué vas a hacer con él?</p>

<p>En ¡BASTA! creemos que cada persona que experimenta este despertar tiene el poder de transformar su comunidad. Tu instante del Hombre Gris no es solo tuyo; es el instante de todos los que deciden que ya no pueden permanecer indiferentes.</p>

<h2>El Llamado a la Acción</h2>

<p>Si este artículo te ha tocado, si sientes que describes exactamente lo que estás viviendo, entonces es momento de actuar. Tu instante del Hombre Gris es el comienzo de algo mucho más grande.</p>

<p>Únete a ¡BASTA!. Encuentra a otros que han experimentado el mismo despertar. Juntos, podemos transformar no solo nuestras vidas individuales, sino la sociedad en su conjunto.</p>

<p><em>El futuro de Argentina se está escribiendo ahora, en este momento, en el instante del Hombre Gris de cada uno de nosotros.</em></p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "reflexion",
    featured: true,
    imageUrl: "https://picsum.photos/seed/hombre-gris/800/400",
    videoUrl: null,
    type: "blog",
    viewCount: 0,
    tags: ["ElHombreGris", "Transformación", "Conciencia", "Cambio", "Reflexión"]
  },

  // BLOG POST 2: De la Queja a la Acción
  {
    title: "De la Queja a la Acción: El Primer Paso del Hombre Gris",
    slug: "de-la-queja-a-la-accion-primer-paso",
    excerpt: "Una guía práctica para transformar la frustración cotidiana en acciones concretas que generen cambios reales en tu comunidad.",
    content: `
<h1>De la Queja a la Acción: El Primer Paso del Hombre Gris</h1>

<p>¿Cuántas veces has terminado el día sintiéndote frustrado por las noticias? ¿Cuántas conversaciones has tenido donde todos se quejan pero nadie propone soluciones? Es hora de convertir esa energía negativa en poder transformador.</p>

<h2>La Trampa de la Queja Crónica</h2>

<p>Quejarse es natural y hasta cierto punto necesario. Nos permite procesar la frustración y reconocer que algo no está bien. Sin embargo, cuando la queja se convierte en un hábito, nos paraliza en lugar de motivarnos.</p>

<p>La queja crónica tiene efectos devastadores:</p>

<ul>
<li><strong>Nos roba la energía:</strong> Cada queja consume energía mental y emocional</li>
<li><strong>Nos hace sentir impotentes:</strong> "¿Para qué hacer algo si nada cambia?"</li>
<li><strong>Nos aísla:</strong> La gente se cansa de escuchar constantes lamentos</li>
<li><strong>Nos impide actuar:</strong> Nos convencemos de que no hay nada que hacer</li>
</ul>

<h2>El Punto de Inflexión: De Víctima a Protagonista</h2>

<p>El cambio comienza cuando te das cuenta de que tienes dos opciones: seguir siendo víctima de las circunstancias o convertirte en protagonista de tu propia historia.</p>

<h3>Mentalidad de Víctima vs. Mentalidad de Protagonista</h3>

<p><strong>Mentalidad de Víctima:</strong></p>
<ul>
<li>"No hay nada que yo pueda hacer"</li>
<li>"El sistema está corrupto"</li>
<li>"Los políticos son todos iguales"</li>
<li>"La gente no quiere cambiar"</li>
</ul>

<p><strong>Mentalidad de Protagonista:</strong></p>
<ul>
<li>"¿Qué puedo hacer yo para cambiar esto?"</li>
<li>"¿Cómo puedo contribuir a mejorar el sistema?"</li>
<li>"¿Qué acciones concretas puedo tomar?"</li>
<li>"¿Cómo puedo inspirar a otros?"</li>
</ul>

<h2>El Proceso de Transformación: De la Queja a la Acción</h2>

<h3>Paso 1: Reconoce el Patrón</h3>
<p>Durante una semana, lleva un diario de tus quejas. Anota cada vez que te quejas de algo. Al final de la semana, analiza los patrones: ¿De qué te quejas más? ¿En qué momentos? ¿Con quién?</p>

<h3>Paso 2: Identifica el Problema Real</h3>
<p>Detrás de cada queja hay un problema real. Si te quejas del transporte público, el problema real puede ser la falta de inversión en infraestructura. Si te quejas de la corrupción, el problema real puede ser la falta de transparencia y participación ciudadana.</p>

<h3>Paso 3: Busca Información</h3>
<p>Una vez identificado el problema, infórmate. ¿Qué se está haciendo al respecto? ¿Qué organizaciones trabajan en este tema? ¿Qué soluciones han funcionado en otros lugares?</p>

<h3>Paso 4: Define Tu Contribución</h3>
<p>Pregúntate: "¿Qué puedo hacer yo, con mis habilidades, recursos y tiempo, para contribuir a la solución?"</p>

<h3>Paso 5: Toma Acción</h3>
<p>Empieza pequeño, pero empieza. Una acción pequeña y constante es más poderosa que grandes gestos esporádicos.</p>

<h2>Acciones Concretas que Puedes Tomar</h2>

<h3>En Tu Comunidad Local</h3>
<ul>
<li><strong>Participa en asambleas barriales:</strong> Muchos barrios tienen organizaciones vecinales</li>
<li><strong>Únete a cooperativas:</strong> Desde cooperativas de trabajo hasta de consumo</li>
<li><strong>Participa en eventos culturales:</strong> El arte es una forma poderosa de generar conciencia</li>
<li><strong>Organiza charlas informativas:</strong> Comparte información sobre temas importantes</li>
</ul>

<h3>En el Ámbito Digital</h3>
<ul>
<li><strong>Crea contenido educativo:</strong> Blog, videos, podcast sobre temas que te importan</li>
<li><strong>Participa en redes sociales de manera constructiva:</strong> Comparte información útil, no solo quejas</li>
<li><strong>Únete a grupos de activismo digital:</strong> Hay muchas campañas que se organizan online</li>
</ul>

<h3>En el Ámbito Político</h3>
<ul>
<li><strong>Infórmate sobre las propuestas políticas:</strong> Lee programas, asiste a debates</li>
<li><strong>Participa en consultas públicas:</strong> Muchas decisiones se toman con participación ciudadana</li>
<li><strong>Únete a partidos o movimientos políticos:</strong> La política es una herramienta de cambio</li>
</ul>

<h2>El Efecto Multiplicador</h2>

<p>Cuando dejas de quejarte y empiezas a actuar, algo mágico sucede: inspiras a otros a hacer lo mismo. Tu acción genera un efecto multiplicador que va más allá de lo que puedes imaginar.</p>

<p>Históricamente, todos los grandes cambios sociales han comenzado con personas comunes que decidieron dejar de quejarse y empezar a actuar:</p>

<ul>
<li>Rosa Parks no se quejó del racismo, se negó a ceder su asiento</li>
<li>Greta Thunberg no se quejó del cambio climático, inició un movimiento global</li>
<li>Las Madres de Plaza de Mayo no se quejaron de la dictadura, salieron a buscar a sus hijos</li>
</ul>

<h2>Superando los Obstáculos</h2>

<p>El camino de la queja a la acción no es fácil. Te enfrentarás a varios obstáculos:</p>

<h3>El Miedo al Fracaso</h3>
<p>"¿Y si no funciona?" Esta pregunta paraliza a muchas personas. La respuesta es: es mejor intentar y fracasar que no intentar nunca.</p>

<h3>La Falta de Tiempo</h3>
<p>"No tengo tiempo para esto." La realidad es que todos tenemos 24 horas al día. La pregunta real es: ¿En qué estás invirtiendo tu tiempo?</p>

<h3>La Presión Social</h3>
<p>"La gente me va a ver como un loco." Es cierto, algunos te verán así. Pero otros te verán como un líder. Elige a quién quieres impresionar.</p>

<h2>Tu Primer Acción</h2>

<p>Si este artículo te ha motivado a cambiar, te propongo un desafío: en los próximos 7 días, identifica una queja recurrente tuya y convierte en una acción concreta.</p>

<p>No importa qué tan pequeña sea la acción. Lo importante es que sea el primer paso de un nuevo camino.</p>

<h2>El Llamado de ¡BASTA!</h2>

<p>En ¡BASTA! creemos que cada persona tiene el poder de generar cambios. No necesitas ser un líder carismático o tener recursos extraordinarios. Solo necesitas decidir que ya no vas a ser espectador de tu propia vida.</p>

<p>Tu queja puede convertirse en la semilla de un movimiento. Tu frustración puede transformarse en la energía que impulse el cambio que Argentina necesita.</p>

<p><em>El futuro se construye con acciones, no con quejas. ¿Cuál será tu primera acción?</em></p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "accion",
    featured: true,
    imageUrl: "https://picsum.photos/seed/accion/800/400",
    videoUrl: null,
    type: "blog",
    viewCount: 0,
    tags: ["Acción", "Cambio", "Comunidad", "Participación", "Liderazgo"]
  },

  // BLOG POST 3: La Semilla de ¡BASTA!
  {
    title: "La Semilla de ¡BASTA!: Cómo Plantar el Cambio en Tu Comunidad",
    slug: "la-semilla-de-basta-plantar-cambio",
    excerpt: "Estrategias concretas y probadas para iniciar movimientos de cambio en tu barrio, tu trabajo o tu círculo social.",
    content: `
<h1>La Semilla de ¡BASTA!: Cómo Plantar el Cambio en Tu Comunidad</h1>

<p>Todo gran movimiento social comenzó con una persona que decidió que ya no podía permanecer indiferente. Una persona que plantó la primera semilla de cambio en su comunidad. Hoy, te enseñamos cómo ser esa persona.</p>

<h2>¿Qué es una Semilla de Cambio?</h2>

<p>Una "semilla de cambio" es cualquier acción que:</p>

<ul>
<li><strong>Genera conciencia:</strong> Hace que otros vean un problema que antes ignoraban</li>
<li><strong>Inspira acción:</strong> Motiva a otros a actuar en la misma dirección</li>
<li><strong>Crea conexión:</strong> Une a personas con intereses similares</li>
<li><strong>Genera momentum:</strong> Crea un efecto dominó de cambios positivos</li>
</ul>

<p>Las semillas de cambio pueden ser grandes o pequeñas, pero todas tienen una cosa en común: comienzan con una persona decidida a hacer la diferencia.</p>

<h2>Identificando Tu Campo de Siembra</h2>

<p>Antes de plantar cualquier semilla, necesitas identificar dónde hacerlo. Tu "campo de siembra" es el lugar donde tienes mayor influencia y conexión:</p>

<h3>Tu Barrio o Comunidad Local</h3>
<p><strong>Ventajas:</strong> Conoces a la gente, entiendes los problemas locales, puedes generar cambios visibles rápidamente.</p>
<p><strong>Acciones posibles:</strong> Organizar asambleas vecinales, crear grupos de WhatsApp informativos, organizar eventos culturales.</p>

<h3>Tu Lugar de Trabajo</h3>
<p><strong>Ventajas:</strong> Pasas mucho tiempo ahí, conoces las dinámicas internas, puedes influir en políticas organizacionales.</p>
<p><strong>Acciones posibles:</strong> Crear comités de responsabilidad social, organizar charlas informativas, promover prácticas más justas.</p>

<h3>Tu Círculo Social</h3>
<p><strong>Ventajas:</strong> Tienes confianza establecida, conoces los intereses de cada persona, puedes personalizar el mensaje.</p>
<p><strong>Acciones posibles:</strong> Organizar reuniones informales, compartir contenido educativo, crear grupos de estudio.</p>

<h3>Redes Sociales y Digitales</h3>
<p><strong>Ventajas:</strong> Alcance amplio, bajo costo, facilidad para compartir información.</p>
<p><strong>Acciones posibles:</strong> Crear contenido educativo, organizar eventos online, conectar con influencers locales.</p>

<h2>Tipos de Semillas de Cambio</h2>

<h3>Semillas de Conciencia</h3>
<p>Estas semillas buscan hacer que otros vean un problema o situación que antes ignoraban.</p>

<p><strong>Ejemplos:</strong></p>
<ul>
<li>Organizar una proyección de documental sobre un tema importante</li>
<li>Crear un mural comunitario que represente un problema social</li>
<li>Organizar una charla con expertos en un tema específico</li>
<li>Crear un boletín informativo sobre temas locales</li>
</ul>

<h3>Semillas de Acción</h3>
<p>Estas semillas motivan a otros a tomar acciones concretas.</p>

<p><strong>Ejemplos:</strong></p>
<ul>
<li>Organizar una jornada de limpieza del barrio</li>
<li>Crear un banco de tiempo comunitario</li>
<li>Organizar una campaña de donación para una causa específica</li>
<li>Crear un grupo de compras comunitarias</li>
</ul>

<h3>Semillas de Conexión</h3>
<p>Estas semillas unen a personas con intereses similares.</p>

<p><strong>Ejemplos:</strong></p>
<ul>
<li>Crear un grupo de estudio sobre temas sociales</li>
<li>Organizar un club de lectura con libros sobre cambio social</li>
<li>Crear un grupo de deportes comunitario</li>
<li>Organizar eventos culturales regulares</li>
</ul>

<h2>El Proceso de Plantación: Paso a Paso</h2>

<h3>Paso 1: Prepara el Terreno</h3>
<p>Antes de plantar cualquier semilla, necesitas preparar el terreno:</p>

<ul>
<li><strong>Estudia tu comunidad:</strong> ¿Cuáles son los problemas más urgentes? ¿Qué soluciones han funcionado antes?</li>
<li><strong>Identifica aliados:</strong> ¿Quién más está preocupado por estos temas? ¿Qué organizaciones ya trabajan en esto?</li>
<li><strong>Entiende las resistencias:</strong> ¿Qué obstáculos puedes enfrentar? ¿Cómo puedes superarlos?</li>
</ul>

<h3>Paso 2: Elige la Semilla Correcta</h3>
<p>No todas las semillas crecen en todos los terrenos. Elige una que:</p>

<ul>
<li>Sea relevante para tu comunidad</li>
<li>Esté dentro de tus capacidades y recursos</li>
<li>Tenga potencial de generar impacto</li>
<li>Sea sostenible a largo plazo</li>
</ul>

<h3>Paso 3: Planta con Cuidado</h3>
<p>Una vez elegida la semilla, plántala con cuidado:</p>

<ul>
<li><strong>Comienza pequeño:</strong> Mejor una acción pequeña exitosa que una grande fallida</li>
<li><strong>Involucra a otros:</strong> No intentes hacerlo todo solo</li>
<li><strong>Comunica claramente:</strong> Explica qué estás haciendo y por qué</li>
<li><strong>Documenta el proceso:</strong> Registra lo que funciona y lo que no</li>
</ul>

<h3>Paso 4: Riega y Cuida</h3>
<p>Las semillas necesitan cuidado constante para crecer:</p>

<ul>
<li><strong>Mantén la consistencia:</strong> Las acciones esporádicas rara vez generan cambios duraderos</li>
<li><strong>Adapta según sea necesario:</strong> Si algo no funciona, cambia de estrategia</li>
<li><strong>Celebra los pequeños logros:</strong> Cada paso cuenta</li>
<li><strong>Mantén la comunicación:</strong> Informa a tu comunidad sobre el progreso</li>
</ul>

<h2>Casos de Éxito: Semillas que Florecieron</h2>

<h3>El Movimiento de las Madres de Plaza de Mayo</h3>
<p>Comenzó con un grupo pequeño de madres que decidieron no quedarse en casa llorando, sino salir a buscar a sus hijos. Su semilla de cambio creció hasta convertirse en uno de los movimientos de derechos humanos más importantes de la historia argentina.</p>

<h3>El Movimiento de Recuperación de Empresas</h3>
<p>Comenzó con trabajadores que se negaron a aceptar el cierre de sus fábricas. Su semilla de cambio demostró que es posible una economía más justa y democrática.</p>

<h3>El Movimiento de Barrios de Pie</h3>
<p>Comenzó con vecinos que se organizaron para resolver problemas básicos de sus comunidades. Su semilla de cambio creó una red nacional de organización popular.</p>

<h2>Herramientas para Plantar Tu Semilla</h2>

<h3>Herramientas de Comunicación</h3>
<ul>
<li><strong>Redes sociales:</strong> Para llegar a un público amplio</li>
<li><strong>Grupos de WhatsApp:</strong> Para comunicación directa con tu comunidad</li>
<li><strong>Bocinas comunitarias:</strong> Para llegar a quienes no usan tecnología</li>
<li><strong>Volantes y afiches:</strong> Para comunicación física</li>
</ul>

<h3>Herramientas de Organización</h3>
<ul>
<li><strong>Asambleas:</strong> Para tomar decisiones colectivas</li>
<li><strong>Comisiones de trabajo:</strong> Para distribuir tareas</li>
<li><strong>Calendarios compartidos:</strong> Para coordinar actividades</li>
<li><strong>Registros de participantes:</strong> Para mantener contacto</li>
</ul>

<h3>Herramientas de Financiamiento</h3>
<ul>
<li><strong>Cooperativas:</strong> Para generar recursos colectivos</li>
<li><strong>Eventos de recaudación:</strong> Para financiar actividades específicas</li>
<li><strong>Donaciones en especie:</strong> Para reducir costos</li>
<li><strong>Voluntariado:</strong> Para maximizar recursos humanos</li>
</ul>

<h2>Superando los Desafíos</h2>

<p>Plantar semillas de cambio no es fácil. Te enfrentarás a varios desafíos:</p>

<h3>La Indiferencia</h3>
<p>Muchas personas preferirán ignorar el problema. La clave es no desanimarse y seguir buscando a quienes sí están dispuestos a actuar.</p>

<h3>La Resistencia</h3>
<p>Algunos se opondrán activamente a tu iniciativa. Es importante entender sus motivos y buscar formas de trabajar juntos cuando sea posible.</p>

<h3>La Falta de Recursos</h3>
<p>Los recursos siempre serán limitados. La creatividad y la colaboración pueden compensar la falta de dinero.</p>

<h3>El Agotamiento</h3>
<p>El activismo puede ser agotador. Es importante cuidar tu salud física y mental, y no intentar hacer todo solo.</p>

<h2>Tu Semilla de ¡BASTA!</h2>

<p>En ¡BASTA! creemos que cada persona puede ser una semilla de cambio. No importa qué tan pequeña sea tu acción inicial, si está bien plantada y bien cuidada, puede crecer hasta transformar tu comunidad.</p>

<p>Tu semilla puede ser:</p>

<ul>
<li>Un grupo de estudio en tu barrio</li>
<li>Una campaña de concientización en tu trabajo</li>
<li>Un evento cultural en tu comunidad</li>
<li>Un proyecto de voluntariado</li>
<li>Una iniciativa de economía solidaria</li>
</ul>

<p>Lo importante no es el tamaño de la semilla, sino la determinación con la que la plantas y el cuidado con el que la cultivas.</p>

<h2>El Llamado a la Acción</h2>

<p>Si este artículo te ha inspirado, te invitamos a unirte a ¡BASTA!. Juntos, podemos plantar las semillas de cambio que Argentina necesita.</p>

<p>No esperes a que otros actúen. No esperes el momento perfecto. El momento perfecto es ahora, y la persona perfecta eres tú.</p>

<p><em>Cada gran árbol comenzó siendo una pequeña semilla. ¿Cuál será tu semilla de cambio?</em></p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "comunidad",
    featured: true,
    imageUrl: "https://picsum.photos/seed/semilla/800/400",
    videoUrl: null,
    type: "blog",
    viewCount: 0,
    tags: ["Comunidad", "Organización", "Movimiento", "Cambio", "¡BASTA!"]
  },

  // BLOG POST 4: El Poder de la Decisión Colectiva
  {
    title: "El Poder de la Decisión Colectiva: Historias de Transformación",
    slug: "poder-decision-colectiva-historias",
    excerpt: "Casos reales de comunidades argentinas que lograron transformar su realidad a través de la organización y la toma de decisiones colectivas.",
    content: `
<h1>El Poder de la Decisión Colectiva: Historias de Transformación</h1>

<p>La historia de Argentina está llena de ejemplos de cómo las comunidades, cuando se organizan y toman decisiones colectivas, pueden transformar completamente su realidad. Estas historias no son solo inspiración; son la prueba de que otro mundo es posible.</p>

<h2>¿Qué es la Decisión Colectiva?</h2>

<p>La decisión colectiva es el proceso mediante el cual un grupo de personas llega a un acuerdo sobre una acción o dirección común. A diferencia de las decisiones individuales o impuestas desde arriba, las decisiones colectivas:</p>

<ul>
<li><strong>Reflejan la voluntad de la mayoría:</strong> No son impuestas por una minoría</li>
<li><strong>Generan compromiso:</strong> Quienes participan en la decisión se sienten responsables de implementarla</li>
<li><strong>Movilizan recursos:</strong> Cada participante aporta lo que puede</li>
<li><strong>Crean poder real:</strong> La unión hace la fuerza</li>
</ul>

<h2>Historia 1: Las Cooperativas de Trabajo</h2>

<p>Durante la crisis de 2001, miles de trabajadores se encontraron sin empleo cuando las empresas cerraron. En lugar de resignarse, muchos decidieron tomar una decisión colectiva: recuperar sus fuentes de trabajo.</p>

<h3>El Caso de la Cooperativa de Trabajo "La Nueva Esperanza"</h3>

<p>En el barrio de Barracas, 50 trabajadores de una fábrica textil se encontraron de un día para el otro sin trabajo. La empresa había cerrado y los había dejado en la calle.</p>

<p>En lugar de dispersarse, decidieron reunirse y tomar una decisión colectiva: recuperar la fábrica y ponerla a funcionar como cooperativa.</p>

<p><strong>El proceso:</strong></p>

<ol>
<li><strong>Asamblea inicial:</strong> Se reunieron todos los trabajadores para discutir la situación</li>
<li><strong>Análisis de factibilidad:</strong> Evaluaron si era posible poner la fábrica a funcionar</li>
<li><strong>Decisión colectiva:</strong> Votaron por mayoría recuperar la fábrica</li>
<li><strong>Organización del trabajo:</strong> Distribuyeron roles y responsabilidades</li>
<li><strong>Búsqueda de apoyo:</strong> Buscaron ayuda legal y financiera</li>
<li><strong>Implementación:</strong> Pusieron la fábrica a funcionar</li>
</ol>

<p><strong>Los resultados:</strong></p>

<ul>
<li>La fábrica volvió a funcionar en 6 meses</li>
<li>Se crearon 50 puestos de trabajo</li>
<li>Se generó un modelo replicable</li>
<li>Se inspiró a otras fábricas a hacer lo mismo</li>
</ul>

<p><strong>La lección:</strong> Cuando las personas toman decisiones colectivas sobre su propio destino, pueden superar incluso las crisis más profundas.</p>

<h2>Historia 2: El Movimiento de Asambleas Barriales</h2>

<p>Durante el corralito de 2001, surgió un movimiento espontáneo de asambleas barriales donde los vecinos se reunían para discutir la crisis y buscar soluciones colectivas.</p>

<h3>El Caso de la Asamblea de Palermo</h3>

<p>En el barrio de Palermo, un grupo de vecinos comenzó a reunirse en la plaza los domingos por la tarde. Al principio eran pocos, pero pronto se sumaron cientos de personas.</p>

<p><strong>Las decisiones colectivas que tomaron:</strong></p>

<ul>
<li><strong>Crear una red de trueque:</strong> Para intercambiar bienes y servicios sin dinero</li>
<li><strong>Organizar ollas populares:</strong> Para alimentar a quienes más lo necesitaban</li>
<li><strong>Crear una guardería comunitaria:</strong> Para que las madres pudieran trabajar</li>
<li><strong>Organizar talleres de oficios:</strong> Para capacitar a desempleados</li>
<li><strong>Crear una radio comunitaria:</strong> Para informar y conectar al barrio</li>
</ul>

<p><strong>El proceso de decisión:</strong></p>

<ol>
<li><strong>Identificación del problema:</strong> Cada asamblea identificaba un problema específico</li>
<li><strong>Lluvia de ideas:</strong> Todos podían proponer soluciones</li>
<li><strong>Evaluación de propuestas:</strong> Se analizaba la viabilidad de cada idea</li>
<li><strong>Votación:</strong> Se decidía por mayoría cuál implementar</li>
<li><strong>Implementación colectiva:</strong> Todos participaban en la ejecución</li>
</ol>

<p><strong>Los resultados:</strong></p>

<ul>
<li>Se creó una red de solidaridad que ayudó a cientos de familias</li>
<li>Se generaron nuevas formas de organización social</li>
<li>Se demostró que es posible una economía más solidaria</li>
<li>Se creó un modelo que se replicó en otros barrios</li>
</ul>

<h2>Historia 3: La Lucha por la Vivienda Digna</h2>

<p>En el barrio de Villa 31, los vecinos se organizaron para luchar por el derecho a la vivienda digna. A través de decisiones colectivas, lograron transformar su barrio.</p>

<h3>El Proceso de Transformación</h3>

<p><strong>Primera fase: Organización</strong></p>
<ul>
<li>Los vecinos se reunieron para discutir los problemas de vivienda</li>
<li>Identificaron la falta de servicios básicos como principal problema</li>
<li>Decidieron organizarse para exigir al gobierno mejoras</li>
</ul>

<p><strong>Segunda fase: Movilización</strong></p>
<ul>
<li>Organizaron marchas y protestas pacíficas</li>
<li>Crearon comisiones de trabajo para diferentes temas</li>
<li>Establecieron diálogo con autoridades</li>
</ul>

<p><strong>Tercera fase: Construcción</strong></p>
<ul>
<li>Con apoyo del gobierno, comenzaron a construir mejoras</li>
<li>Los vecinos participaron en el diseño de las soluciones</li>
<li>Se crearon cooperativas de construcción</li>
</ul>

<p><strong>Los resultados:</strong></p>

<ul>
<li>Se mejoró significativamente la infraestructura del barrio</li>
<li>Se crearon espacios comunitarios</li>
<li>Se generaron empleos locales</li>
<li>Se demostró el poder de la organización vecinal</li>
</ul>

<h2>Historia 4: El Movimiento de Recuperación de Tierras</h2>

<p>En varias provincias del país, comunidades campesinas se organizaron para recuperar tierras que les pertenecían históricamente pero que habían sido ocupadas por terratenientes.</p>

<h3>El Caso de la Comunidad Qom en Formosa</h3>

<p>La comunidad Qom de La Primavera se organizó para recuperar tierras que les habían sido arrebatadas. A través de decisiones colectivas, lograron no solo recuperar sus tierras, sino también desarrollar proyectos productivos comunitarios.</p>

<p><strong>Las decisiones colectivas clave:</strong></p>

<ul>
<li><strong>Organizarse para la lucha:</strong> Decidieron unirse para defender sus derechos</li>
<li><strong>Buscar apoyo legal:</strong> Decidieron contratar abogados especializados</li>
<li><strong>Movilizarse pacíficamente:</strong> Decidieron usar métodos no violentos</li>
<li><strong>Desarrollar proyectos productivos:</strong> Decidieron crear cooperativas agrícolas</li>
<li><strong>Preservar la cultura:</strong> Decidieron mantener sus tradiciones ancestrales</li>
</ul>

<p><strong>Los resultados:</strong></p>

<ul>
<li>Recuperaron parte de sus tierras ancestrales</li>
<li>Crearon cooperativas agrícolas exitosas</li>
<li>Preservaron su cultura y tradiciones</li>
<li>Se convirtieron en un ejemplo para otras comunidades</li>
</ul>

<h2>Los Elementos Clave del Éxito</h2>

<p>Analizando estas historias, podemos identificar elementos comunes que llevaron al éxito:</p>

<h3>1. Participación Amplia</h3>
<p>Todas las decisiones exitosas involucraron a la mayor cantidad posible de personas afectadas.</p>

<h3>2. Proceso Democrático</h3>
<p>Las decisiones se tomaron a través de procesos democráticos, no por imposición.</p>

<h3>3. Objetivos Claros</h3>
<p>Cada comunidad tenía objetivos claros y específicos.</p>

<h3>4. Persistencia</h3>
<p>Ninguna de estas transformaciones fue fácil; todas requirieron persistencia y determinación.</p>

<h3>5. Apoyo Mutuo</h3>
<p>Las comunidades se apoyaron mutuamente y compartieron recursos y conocimientos.</p>

<h3>6. Adaptabilidad</h3>
<p>Cuando una estrategia no funcionaba, cambiaban de enfoque sin abandonar el objetivo.</p>

<h2>Cómo Aplicar Estas Lecciones en Tu Comunidad</h2>

<p>Basándote en estas historias, puedes aplicar los mismos principios en tu comunidad:</p>

<h3>1. Identifica un Problema Común</h3>
<p>¿Cuál es el problema más urgente que afecta a tu comunidad?</p>

<h3>2. Convocar a una Reunión</h3>
<p>Invita a todos los interesados a una reunión para discutir el problema.</p>

<h3>3. Facilitar el Diálogo</h3>
<p>Asegúrate de que todos puedan expresar su opinión.</p>

<h3>4. Buscar Soluciones Colectivas</h3>
<p>En lugar de buscar soluciones individuales, busca soluciones que beneficien a toda la comunidad.</p>

<h3>5. Tomar Decisiones Democráticas</h3>
<p>Usa métodos democráticos para tomar decisiones.</p>

<h3>6. Implementar Colectivamente</h3>
<p>Distribuye las tareas entre todos los participantes.</p>

<h3>7. Evaluar y Ajustar</h3>
<p>Evalúa regularmente el progreso y ajusta la estrategia según sea necesario.</p>

<h2>El Llamado de ¡BASTA!</h2>

<p>En ¡BASTA! creemos que estas historias no son del pasado, sino ejemplos de lo que es posible en el presente. Cada comunidad puede transformar su realidad a través de la organización y la toma de decisiones colectivas.</p>

<p>Tu comunidad puede ser la próxima historia de éxito. Solo necesita que tú y otros decidan que ya no van a aceptar la realidad tal como está, sino que van a trabajar juntos para cambiarla.</p>

<p><em>La historia se escribe todos los días. ¿Qué historia quieres que se escriba sobre tu comunidad?</em></p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "historia",
    featured: false,
    imageUrl: "https://picsum.photos/seed/decision-colectiva/800/400",
    videoUrl: null,
    type: "blog",
    viewCount: 0,
    tags: ["Historia", "Cooperativas", "Comunidad", "Decisión Colectiva", "Transformación"]
  },

  // VLOG POST 1: El Llamado del Hombre Gris
  {
    title: "Video: El Llamado del Hombre Gris",
    slug: "video-llamado-del-hombre-gris",
    excerpt: "Un video inspirador que explora el despertar de la conciencia social y el momento crucial donde decidimos dejar de ser espectadores.",
    content: `
<h1>Video: El Llamado del Hombre Gris</h1>

<p>En este video, exploramos el concepto del "Hombre Gris" y el momento crucial donde cada individuo decide dejar de ser espectador de la realidad para convertirse en protagonista del cambio.</p>

<p>El video aborda temas fundamentales como:</p>

<ul>
<li>El despertar de la conciencia social</li>
<li>La transformación de la frustración en acción</li>
<li>El poder de la decisión individual</li>
<li>La importancia de la organización colectiva</li>
<li>El futuro que podemos construir juntos</li>
</ul>

<p>A través de imágenes poderosas y un mensaje inspirador, este video invita a la reflexión y a la acción. Es una llamada a todos aquellos que sienten que ya no pueden permanecer indiferentes ante la realidad que nos rodea.</p>

<p>El "Hombre Gris" no es una figura abstracta, sino una representación de cada persona que decide que ya no puede seguir siendo espectador de su propia historia. Es el momento donde la conciencia se despierta y el corazón decide que es hora de actuar.</p>

<p>Este video es especialmente relevante en el contexto actual, donde muchas personas se sienten frustradas por la situación social, política y económica, pero no saben cómo canalizar esa frustración de manera constructiva.</p>

<p>El mensaje central es claro: cada persona tiene el poder de generar cambios, y cuando esas personas se unen, pueden transformar no solo sus propias vidas, sino también la sociedad en su conjunto.</p>

<p>Te invitamos a ver este video y a reflexionar sobre tu propio "momento del Hombre Gris". ¿Has experimentado ese despertar de la conciencia? ¿Qué has hecho con él? ¿Cómo puedes contribuir al cambio que Argentina necesita?</p>

<p>El futuro se construye con acciones, no con palabras. Este video es una invitación a pasar de la reflexión a la acción, de la queja a la propuesta, de la frustración a la esperanza.</p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "video",
    featured: true,
    imageUrl: null,
    videoUrl: "https://youtu.be/ngE6CwUatho",
    type: "vlog",
    viewCount: 0,
    tags: ["Video", "HombreGris", "Conciencia", "Transformación", "Inspiración"]
  },

  // VLOG POST 2: Construyendo el Futuro
  {
    title: "Video: Construyendo el Futuro que Soñamos",
    slug: "video-construyendo-futuro-sonamos",
    excerpt: "Una visión práctica y esperanzadora de cómo podemos construir juntos el futuro que Argentina merece.",
    content: `
<h1>Video: Construyendo el Futuro que Soñamos</h1>

<p>Este video presenta una visión práctica y esperanzadora de cómo podemos construir juntos el futuro que Argentina merece. A través de ejemplos concretos y propuestas viables, exploramos las posibilidades de transformación social.</p>

<p>El video aborda temas como:</p>

<ul>
<li>Visiones alternativas de desarrollo</li>
<li>Modelos de organización comunitaria</li>
<li>Experiencias exitosas de transformación</li>
<li>Propuestas concretas para el cambio</li>
<li>El rol de cada ciudadano en la construcción del futuro</li>
</ul>

<p>En un contexto donde muchas personas se sienten desesperanzadas por el futuro, este video ofrece una perspectiva diferente. No se trata de utopías imposibles, sino de realidades que ya están siendo construidas por comunidades organizadas en diferentes partes del país.</p>

<p>El mensaje central es que el futuro no está predeterminado, sino que es el resultado de las decisiones y acciones que tomamos en el presente. Cada persona, cada comunidad, cada organización tiene el poder de influir en la dirección que toma nuestra sociedad.</p>

<p>El video muestra ejemplos de:</p>

<ul>
<li>Comunidades que han logrado mejorar su calidad de vida a través de la organización</li>
<li>Empresas recuperadas que funcionan de manera democrática</li>
<li>Barrios que han transformado sus espacios públicos</li>
<li>Movimientos sociales que han logrado cambios significativos</li>
</ul>

<p>Estos ejemplos demuestran que otro mundo es posible, pero no se construye solo. Requiere la participación activa de todos los ciudadanos, la organización comunitaria, y la voluntad de trabajar juntos por objetivos comunes.</p>

<p>El video también aborda los desafíos que enfrentamos como sociedad y las herramientas que tenemos para superarlos. No se trata de ignorar los problemas, sino de reconocer que tenemos la capacidad de resolverlos cuando trabajamos juntos.</p>

<p>La construcción del futuro que soñamos comienza con la construcción del presente que queremos. Cada acción que tomamos hoy, cada decisión que tomamos, cada organización que creamos, está contribuyendo a moldear el futuro.</p>

<p>Este video es una invitación a participar activamente en la construcción de ese futuro. No como espectadores, sino como protagonistas. No como individuos aislados, sino como parte de una comunidad organizada.</p>

<p>El futuro que soñamos es posible, pero depende de nosotros construirlo. Este video nos muestra cómo.</p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "video",
    featured: true,
    imageUrl: null,
    videoUrl: "https://youtu.be/L1qeN78SlEE",
    type: "vlog",
    viewCount: 0,
    tags: ["Video", "Futuro", "Construcción", "Comunidad", "Esperanza"]
  },

  // VLOG POST 3: Tu Voz Importa
  {
    title: "Video: Tu Voz Importa: Cómo Participar en ¡BASTA!",
    slug: "video-tu-voz-importa-participar-basta",
    excerpt: "Un llamado directo a la acción para unirse al movimiento ¡BASTA! y participar activamente en la transformación social.",
    content: `
<h1>Video: Tu Voz Importa: Cómo Participar en ¡BASTA!</h1>

<p>Este video es un llamado directo a la acción para todas aquellas personas que quieren participar activamente en la transformación social. A través de un mensaje claro y motivador, explicamos cómo cada persona puede unirse al movimiento ¡BASTA! y contribuir al cambio que Argentina necesita.</p>

<p>El video aborda temas fundamentales como:</p>

<ul>
<li>Por qué tu voz importa</li>
<li>Cómo puedes participar en ¡BASTA!</li>
<li>Qué acciones concretas puedes tomar</li>
<li>Cómo tu participación puede generar cambios</li>
<li>Los diferentes niveles de participación</li>
</ul>

<p>En un mundo donde muchas personas se sienten impotentes ante los grandes problemas sociales, este video demuestra que cada persona tiene el poder de generar cambios significativos. No se trata de ser un líder carismático o tener recursos extraordinarios; se trata de decidir que ya no vas a ser espectador de tu propia vida.</p>

<p>El video explica las diferentes formas en que puedes participar en ¡BASTA!:</p>

<ul>
<li><strong>Participación individual:</strong> Cambios en tu propia vida que inspiran a otros</li>
<li><strong>Participación comunitaria:</strong> Organización en tu barrio o comunidad</li>
<li><strong>Participación digital:</strong> Uso de las redes sociales para generar conciencia</li>
<li><strong>Participación política:</strong> Involucramiento en procesos de toma de decisiones</li>
<li><strong>Participación económica:</strong> Apoyo a iniciativas de economía solidaria</li>
</ul>

<p>Cada nivel de participación es válido y necesario. No todos pueden hacer todo, pero todos pueden hacer algo. Lo importante es que cada persona encuentre su forma de contribuir al cambio.</p>

<p>El video también aborda los miedos y dudas que muchas personas tienen sobre la participación:</p>

<ul>
<li>"¿Qué puedo hacer yo?"</li>
<li>"¿No es muy tarde para cambiar las cosas?"</li>
<li>"¿Qué pasa si no funciona?"</li>
<li>"¿No soy muy pequeño para hacer la diferencia?"</li>
</ul>

<p>Para cada una de estas dudas, el video ofrece respuestas basadas en experiencias reales de personas que han logrado generar cambios significativos a través de su participación.</p>

<p>El mensaje central es que la transformación social no es algo que le pasa a la sociedad, sino algo que la sociedad hace. Y cada persona es parte de esa sociedad. Tu voz, tu acción, tu participación importa.</p>

<p>El video también explica cómo ¡BASTA! facilita la participación:</p>

<ul>
<li>Proporcionando información y herramientas</li>
<li>Conectando a personas con intereses similares</li>
<li>Organizando eventos y actividades</li>
<li>Ofreciendo capacitación y apoyo</li>
<li>Creando espacios de participación</li>
</ul>

<p>No se trata de que tengas que hacer todo solo. ¡BASTA! es una comunidad de personas que están trabajando juntas por objetivos comunes. Tu participación se suma a la de otros, creando un efecto multiplicador.</p>

<p>El video termina con un llamado claro a la acción: "Tu voz importa. Tu participación importa. El futuro de Argentina depende de personas como tú que decidan que ya no van a ser espectadores, sino protagonistas del cambio."</p>

<p>Este video es especialmente importante porque muchas personas quieren participar pero no saben cómo. Este video les muestra el camino.</p>

<p>La transformación social comienza cuando cada persona decide que su voz importa y que va a usarla para generar cambios positivos. Este video es una invitación a hacer esa decisión.</p>
    `,
    authorId: 1,
    publishedAt: new Date().toISOString(),
    category: "video",
    featured: false,
    imageUrl: null,
    videoUrl: "https://youtu.be/ngE6CwUatho",
    type: "vlog",
    viewCount: 0,
    tags: ["Video", "Participación", "¡BASTA!", "Acción", "Movimiento"]
  }
];

try {
  console.log('🌱 Insertando posts de alta calidad...');
  
  qualityPosts.forEach((post, index) => {
    console.log(`📝 Insertando post ${index + 1}: ${post.title}`);
    
    insertPost.run(
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.authorId,
      post.publishedAt,
      post.category,
      post.featured ? 1 : 0,
      post.imageUrl,
      post.videoUrl,
      post.type,
      post.viewCount
    );
    
    // Obtener el ID del post (ya existente o recién insertado)
    const postResult = getPostBySlug.get(post.slug);
    const postId = postResult.id;
    
    // Insertar tags
    post.tags.forEach(tag => {
      insertTag.run(postId, tag);
    });
    
    console.log(`✅ Post ${index + 1} insertado con ID: ${postId}`);
  });
  
  console.log('🎉 Todos los posts de alta calidad han sido insertados exitosamente');
  console.log(`📊 Total de posts insertados: ${qualityPosts.length}`);
  console.log('📈 4 posts de blog + 3 posts de vlog');
  
} catch (error) {
  console.error('❌ Error insertando posts:', error);
} finally {
  db.close();
  console.log('🔒 Conexión a la base de datos cerrada');
}
