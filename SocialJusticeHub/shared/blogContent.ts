const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export interface BlogContentEntry {
  excerpt: string;
  content: string;
}

export const blogContentUpdates: Record<string, BlogContentEntry> = {
  [slugify("El Cansancio Sagrado: Por qué ya no podemos esperar")]: {
    excerpt:
      "Hay un cansancio que no pide almohada: pide planos. Es la lucidez incómoda de saber que Argentina puede ser rediseñada — ahora, no mañana.",
    content: `
      <article>
        <h1>El Cansancio Sagrado: Por qué ya no podemos esperar</h1>
        <p>
          Hay un cansancio que no pide almohada: pide planos. Lo sentís cuando cerrás el noticiero y el enojo ya no alcanza.
          Cuando la indignación deja de ser suficiente y algo más profundo te exige pasar de la queja al diseño.
          Ese cansancio tiene nombre: es la lucidez de quien entiende que nadie vendrá a rescatarnos — y que eso,
          lejos de ser una condena, es la mayor oportunidad de nuestra generación.
        </p>

        <blockquote>
          El cansancio sagrado no nos invita a dormir: nos ordena sentarnos a la mesa de diseño
          y trazar los planos de los sistemas que reemplazarán a los que ya probaron ser insuficientes.
        </blockquote>

        <h2>Cuando el agotamiento se convierte en brújula</h2>
        <p>
          El cansancio sagrado no es depresión ni cinismo. Es un estado de alerta moral que combina tres fuerzas:
        </p>
        <ul>
          <li><strong>Lucidez emocional:</strong> reconocemos la frustración sin permitir que nos vuelva cínicos. La rabia se transforma en combustible, no en veneno.</li>
          <li><strong>Diagnóstico sistémico:</strong> entendemos que los problemas se repiten porque fueron diseñados para repetirse — por procesos, no por personas.</li>
          <li><strong>Decisión de servicio:</strong> elegimos invertir cada gramo de energía en construir, no en señalar culpables.</li>
        </ul>

        <h2>Radiografía urgente: por qué estás agotado</h2>
        <p>
          Si llegaste hasta acá es porque ya viste alguno de estos fallos estructurales con tus propios ojos:
        </p>
        <ul>
          <li><strong>Educación que desconecta:</strong> forma memoriosos, no ciudadanos capaces de rediseñar su realidad.</li>
          <li><strong>Economía especulativa:</strong> premia la viveza cortoplacista y castiga la creación de valor con propósito.</li>
          <li><strong>Política transaccional:</strong> negocia parches cosméticos, nunca rediseños de fondo.</li>
          <li><strong>Cultura de espectadores:</strong> delegamos la transformación en líderes mesiánicos en lugar de asumir autoría colectiva.</li>
        </ul>

        <h2>De la indignación a la ingeniería social</h2>
        <p>
          El cansancio sagrado no se cura con descanso — se cura diseñando. Acá va una secuencia práctica
          para pasar de la fatiga a la construcción en menos de un mes:
        </p>
        <ol>
          <li><strong>Nombrar el sistema roto:</strong> ¿educación, salud, tu barrio, tu economía personal? Elegí uno.</li>
          <li><strong>Identificar el patrón:</strong> ¿qué hábito, norma o creencia mantiene vivo el problema?</li>
          <li><strong>Crear un prototipo:</strong> un pequeño rediseño que pueda probarse en 30 días o menos.</li>
          <li><strong>Medir y narrar:</strong> compartir lo aprendido para que otros se sumen al rediseño.</li>
        </ol>

        <h2>Tres rituales diarios para honrar tu cansancio</h2>
        <p>Transformá tu agotamiento en práctica concreta antes de que termine el día:</p>
        <ol>
          <li><strong>Diario de lucidez:</strong> escribí qué viste hoy que confirma que no hay más tiempo que perder.</li>
          <li><strong>Microacción consciente:</strong> elegí una sola acción pequeña que mejore el sistema que te quita el sueño.</li>
          <li><strong>Conversación valiente:</strong> hablá con alguien sobre la visión — no sobre la queja.</li>
        </ol>

        <blockquote>
          El cansancio sagrado es una promesa silenciosa: "no voy a irme a dormir
          hasta diseñar, aunque sea, un nuevo ladrillo para mi país."
        </blockquote>
      </article>
    `,
  },
  [slugify("La Amabilidad como Ingeniería Social")]: {
    excerpt:
      "Decile 'amabilidad' a un argentino curtido y te va a mirar con desconfianza. Pero cuando la usás como arquitectura social, repara vínculos y alinea propósitos como ninguna otra tecnología.",
    content: `
      <article>
        <h1>La Amabilidad como Ingeniería Social</h1>
        <p>
          Decile "amabilidad" a un argentino curtido por la calle y te va a mirar con desconfianza.
          Suena a debilidad, a ingenuidad, a "buenismo" que no sobrevive una semana en la realidad.
          Pero hay otra lectura — una que cambia todo: la amabilidad no es cortesía.
          Es una tecnología social. La más subestimada que existe. Cuando un sistema humano está quebrado,
          la amabilidad estratégica es la primera intervención inteligente porque desarma defensas,
          multiplica confianza y genera cooperación donde antes solo había fricción.
        </p>

        <blockquote>
          La amabilidad profesional no es complacencia: es la decisión de construir escenarios
          donde otros quieran aportar lo mejor de sí — y donde hacerlo sea fácil.
        </blockquote>

        <h2>Las tres variables que la amabilidad rediseña</h2>
        <ul>
          <li><strong>Percepción:</strong> transforma la manera en que interpretamos la intención de los demás. Lo que antes era amenaza se vuelve posibilidad.</li>
          <li><strong>Velocidad:</strong> acelera acuerdos porque reduce el ruido emocional. Donde había discusión de dos horas, hay consenso en veinte minutos.</li>
          <li><strong>Memoria colectiva:</strong> deja huellas positivas que se replican en la cultura. Un acto de amabilidad precisa crea tres imitadores.</li>
        </ul>

        <h2>Blueprint de una interacción amable</h2>
        <p>Cada conversación importante merece este diseño previo:</p>
        <ol>
          <li><strong>Preparación:</strong> definí la emoción que querés provocar en la otra persona antes de abrir la boca.</li>
          <li><strong>Reconocimiento:</strong> usá las primeras palabras para validar al otro — antes de pedir nada.</li>
          <li><strong>Oferta clara:</strong> explicá cómo tu propuesta mejora la vida del otro, no solo la tuya.</li>
          <li><strong>Cierre consciente:</strong> agradecé con datos concretos ("valoré que me hayas dado 20 minutos"), no con frases vacías.</li>
        </ol>

        <h2>Tres capas de aplicación</h2>
        <p>Integrá la amabilidad como ingeniería en cada nivel de tu vida:</p>
        <ul>
          <li><strong>Individual:</strong> establecé límites firmes comunicados con respeto quirúrgico. No es lo que decís, es cómo lo diseñás.</li>
          <li><strong>Organizacional:</strong> creá rituales de reconocimiento que hagan visibles los comportamientos generosos — no solo los resultados.</li>
          <li><strong>Comunitaria:</strong> diseñá espacios donde desconocidos puedan colaborar sin miedo a ser juzgados. Ese es el verdadero urbanismo social.</li>
        </ul>

        <blockquote>
          Ser amable es construir infraestructura emocional para que la inteligencia colectiva
          circule sin bloqueos. No es un gesto: es ingeniería.
        </blockquote>
      </article>
    `,
  },
  [slugify("Diseño Idealizado: La Argentina Posible")]: {
    excerpt:
      "¿Y si pudieras empezar de cero? El diseño idealizado no es fantasía: es la metodología que nos obliga a describir en detalle la Argentina que merece existir — y después construirla.",
    content: `
      <article>
        <h1>Diseño Idealizado: La Argentina Posible</h1>
        <p>
          ¿Y si pudieras empezar de cero? No reformar lo que hay — diseñar desde la hoja en blanco.
          Russell Ackoff proponía exactamente eso: imaginar el sistema ideal sin las restricciones del presente,
          y recién después preguntarse cómo llegar hasta allí. Aplicado a Argentina, el diseño idealizado
          nos libera de la trampa de arreglar el pasado y nos obliga a una pregunta más poderosa:
          ¿qué país aceptaríamos si tuviéramos que vivir en él para siempre?
        </p>

        <blockquote>
          La pregunta no es "¿qué podemos cambiar?" sino "¿qué país diseñaríamos
          si tuviéramos que vivir en él — nosotros y nuestros hijos — para siempre?"
        </blockquote>

        <h2>Los tres principios del rediseño nacional</h2>
        <ul>
          <li><strong>Propósito compartido:</strong> cada sistema — educación, salud, economía — existe para servir a la vida digna. Si no cumple esa función, se rediseña.</li>
          <li><strong>Coherencia radical:</strong> las políticas dejan de contradecirse porque responden a un modelo integral, no a urgencias electorales.</li>
          <li><strong>Iteración con evidencia:</strong> los prototipos se prueban rápido y con datos, no con promesas ni con fe.</li>
        </ul>

        <h2>Mapa del sistema idealizado</h2>
        <h3>1. Educación que despierta</h3>
        <p>Currículas que integran tecnología, humanidades y diseño social desde la primaria. Alumnos que egresan sabiendo hacer preguntas, no solo repetir respuestas.</p>

        <h3>2. Economía del valor real</h3>
        <p>Emprendimientos medidos por el impacto que generan en comunidades y territorios — no solo por la renta. Donde crear valor social sea tan rentable como especular.</p>

        <h3>3. Estado coreógrafo</h3>
        <p>Gobiernos que coordinan recursos, reglas y datos para que la creatividad ciudadana florezca. No un Estado que hace todo, sino uno que habilita todo.</p>

        <h3>4. Cultura del servicio</h3>
        <p>Medios y referentes que honran a quienes solucionan problemas, no a quienes los narran desde afuera. Donde "servidor público" sea un título de orgullo.</p>

        <h2>Tres pasos para empezar hoy</h2>
        <ol>
          <li><strong>Visión escrita:</strong> describí tu Argentina ideal como si estuvieras dando un reporte anual de resultados. Con números, con plazos, con nombres.</li>
          <li><strong>Prototipo local:</strong> traducí esa visión en un proyecto concreto de barrio o de organización que puedas lanzar este mes.</li>
          <li><strong>Aprendizaje compartido:</strong> documentá qué funciona y qué no para que otros puedan replicarlo sin empezar de cero.</li>
        </ol>

        <blockquote>
          Diseñar idealmente es un acto de responsabilidad:
          no podemos exigir lo que no nos animamos a imaginar con precisión.
        </blockquote>
      </article>
    `,
  },
  [slugify("El Poder del Pensamiento Sistémico en la Transformación Social")]: {
    excerpt:
      "Un médico no trata la fiebre sin buscar la infección. Pensar en sistemas es pasar del 'qué pasó' al 'qué lo hizo posible' — y diseñar palancas que cambien el patrón completo.",
    content: `
      <article>
        <h1>El Poder del Pensamiento Sistémico en la Transformación Social</h1>
        <p>
          Un médico no trata la fiebre sin buscar la infección. Pero en Argentina llevamos décadas
          tratando síntomas — pobreza, inseguridad, corrupción — sin tocar los procesos que los producen.
          Pensar sistémicamente es aprender a ver lo que está debajo: los bucles de retroalimentación,
          las causas invisibles y las dependencias silenciosas que perpetúan el deterioro mientras todos
          miramos para otro lado.
        </p>

        <h2>Los tres lentes que necesitás ahora</h2>
        <ul>
          <li><strong>Bucles de refuerzo:</strong> comportamientos que se amplifican a sí mismos. La desconfianza genera aislamiento, el aislamiento genera más desconfianza. Hasta que alguien lo corta.</li>
          <li><strong>Bucles de balance:</strong> dinámicas que frenan el cambio porque el sistema busca volver al status quo. Cada reforma encuentra su anticuerpo.</li>
          <li><strong>Retrasos invisibles:</strong> decisiones cuyos efectos aparecen meses o años después. Lo que hoy parece inofensivo mañana es irreversible.</li>
        </ul>

        <blockquote>
          Un problema sistémico nunca se soluciona en el mismo lugar donde lo detectamos.
          Hay que intervenir en el diseño que lo produce — o seguir apagando incendios para siempre.
        </blockquote>

        <h2>Metodología práctica: cuatro pasos urgentes</h2>
        <ol>
          <li><strong>Cartografiar actores:</strong> ¿quién gana si todo sigue igual? ¿Quién pierde? ¿Quién decide?</li>
          <li><strong>Mapear flujos:</strong> seguí el dinero, la información, las emociones y el poder. Ahí está el diagnóstico real.</li>
          <li><strong>Encontrar apalancamientos:</strong> buscá los puntos donde un cambio pequeño produce efectos desproporcionados.</li>
          <li><strong>Crear nuevas reglas:</strong> diseñá acuerdos explícitos que cambien los incentivos del juego.</li>
        </ol>

        <h2>Donde aplicarlo mañana mismo</h2>
        <p>No necesitás un doctorado. Usá el pensamiento sistémico en tu próxima reunión:</p>
        <ul>
          <li><strong>En tu comunidad:</strong> alineá vecinos con datos compartidos y compromisos visibles.</li>
          <li><strong>En tu equipo:</strong> rediseñá las reuniones para que resuelvan causas raíz, no emergencias del momento.</li>
          <li><strong>En tus proyectos sociales:</strong> medí impacto en varias capas — económica, emocional, cultural — no solo en outputs.</li>
        </ul>

        <blockquote>
          Pensar en sistemas convierte la intuición en estrategia
          y a la buena voluntad en resultados medibles. Es la diferencia entre desear y diseñar.
        </blockquote>
      </article>
    `,
  },
  [slugify("La Ética del Servicio: Construyendo una Sociedad de Servidores")]: {
    excerpt:
      "En Argentina, 'servir' suena a sacrificio. Pero servir no es inmolarse: es diseñar tu vida para que cada talento produzca valor colectivo medible. Es la forma más profesional del amor.",
    content: `
      <article>
        <h1>La Ética del Servicio: Construyendo una Sociedad de Servidores</h1>
        <p>
          En Argentina, "servir" suena a sacrificio, a abnegación, a perder algo propio en nombre de los demás.
          Esa lectura está rota. Servir — bien entendido — es lo opuesto: es diseñar tu vida profesional
          para que cada talento que tenés produzca valor colectivo medible. No es caridad. Es la forma
          más rigurosa y exigente del amor aplicado. En un país fatigado de promesas vacías,
          la actitud del servidor profesional es revolucionaria porque combina empatía con diseño,
          pasión con métricas, corazón con ingeniería.
        </p>

        <h2>Los cuatro compromisos del servidor profesional</h2>
        <ul>
          <li><strong>Autoconocimiento:</strong> sabé qué talento aportás mejor que nadie — y dejá de disculparte por no tener todos los demás.</li>
          <li><strong>Coraje cívico:</strong> nombrá lo que duele sin destruir al otro. La verdad dicha con respeto es el mayor regalo que podés dar.</li>
          <li><strong>Disciplina:</strong> convertí la empatía en soluciones concretas. Sentir no alcanza; diseñar sí.</li>
          <li><strong>Evaluación constante:</strong> medí si tu servicio realmente transforma — o si solo te hace sentir bien a vos.</li>
        </ul>

        <blockquote>
          Servir no es agradar. Es estar dispuesto a rediseñar procesos incómodos
          para que la dignidad sea norma y no excepción.
        </blockquote>

        <h2>Del individuo al sistema: cómo escalar el servicio</h2>
        <p>Para que la ética del servicio deje de ser heroísmo individual y se vuelva cultura, necesitamos:</p>
        <ol>
          <li><strong>Lenguaje común:</strong> reemplazar la crítica vacía por preguntas que inviten a co-crear. "¿Qué podemos rediseñar juntos?" en lugar de "esto no funciona".</li>
          <li><strong>Modelos replicables:</strong> manuales abiertos que expliquen cómo servir en cada contexto — desde un aula hasta una empresa.</li>
          <li><strong>Celebración pública:</strong> narrativas que premien a quienes solucionan, no solo a quienes opinan. Que "servidor público" sea un título de honor.</li>
        </ol>

        <h2>Tres microprácticas para empezar hoy</h2>
        <ul>
          <li><strong>Agenda de servicio:</strong> reservá en tu calendario de esta semana una acción concreta al servicio de otro. No algún día — esta semana.</li>
          <li><strong>Feedback generoso:</strong> ofrecé a alguien una observación honesta que lo ayude a mejorar. No crítica: diseño de mejora.</li>
          <li><strong>Puentes improbables:</strong> conectá a dos personas que no se conocen pero que pueden potenciarse mutuamente. Eso es ingeniería social en acción.</li>
        </ul>

        <blockquote>
          Una sociedad de servidores no espera milagros: diseña oportunidades
          para que cada ciudadano sea autor de soluciones — y no espectador de problemas.
        </blockquote>
      </article>
    `,
  },
  [slugify("El Pozo que se Desborda - Reflexiones en Vivo")]: {
    excerpt:
      "Este video nace de una noche en la que tres personas distintas me dijeron lo mismo: 'ya no puedo seguir así'. Ese desborde emocional es un regalo — si sabemos escucharlo.",
    content: `
      <article>
        <h1>El Pozo que se Desborda — Reflexiones en Vivo</h1>
        <p>
          Este video nace de una noche en la que tres personas distintas — que no se conocen entre sí —
          me dijeron exactamente lo mismo: "ya no puedo seguir así". Una por mensaje, otra en un café,
          la tercera en una llamada que empezó hablando de trabajo y terminó en llanto.
          Ese desborde emocional simultáneo no es casualidad. Es una señal colectiva.
          Y si sabemos escucharla, es el punto exacto donde empieza la transformación.
        </p>

        <h2>Lo que comparto en el video</h2>
        <ul>
          <li><strong>El instante del quiebre:</strong> el momento preciso en que notamos que postergar la acción es traicionarnos a nosotros mismos.</li>
          <li><strong>El duelo necesario:</strong> aceptar que el viejo yo — el que toleraba, el que esperaba, el que delegaba — no volverá. Y que eso está bien.</li>
          <li><strong>El nacimiento del arquitecto:</strong> descubrir que el futuro no se espera: se diseña. Y que ese diseño empieza hoy.</li>
        </ul>

        <blockquote>
          Cuando el pozo se desborda no buscamos culpables:
          diseñamos nuevas compuertas para que la energía se oriente al servicio.
        </blockquote>

        <h2>Preguntas para acompañar el video</h2>
        <p>Respondé antes de seguir scrolleando — este es el ejercicio:</p>
        <ol>
          <li>¿Qué señal venías ignorando hasta hoy?</li>
          <li>¿Qué relación necesitás rediseñar para recuperar energía vital?</li>
          <li>¿Qué microacción podés tomar en las próximas 24 horas que demuestre que despertaste?</li>
        </ol>

        <h2>Plan de 30 días: del desborde al diseño</h2>
        <p>No dejes que el impulso se enfríe. Usá el desborde como rampa de lanzamiento:</p>
        <ul>
          <li><strong>Semana 1 — Nombrar:</strong> registrá tus patrones de cansancio y elegí el sistema que querés cambiar. Un solo sistema. El más urgente.</li>
          <li><strong>Semana 2 — Convocar:</strong> pedí ayuda. Formá una dupla o comunidad mínima. Nadie rediseña solo.</li>
          <li><strong>Semana 3 — Prototipar:</strong> lanzá una acción concreta y medible. No perfecta: medible.</li>
          <li><strong>Semana 4 — Narrar:</strong> contá públicamente qué aprendiste y qué sigue. Tu historia es el combustible de otros.</li>
        </ul>

        <blockquote>
          Despertar es aceptar que somos los curadores de la energía colectiva.
          Si el pozo se desbordó, es hora de redirigirla con maestría — no de tapar la grieta.
        </blockquote>
      </article>
    `,
  },
  [slugify("Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social")]: {
    excerpt:
      "Hay dos formas de mirar la realidad argentina: perseguir incendios o rediseñar el tablero. Este vlog te entrena para la segunda — la única que produce cambios duraderos.",
    content: `
      <article>
        <h1>Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social</h1>
        <p>
          Hay dos formas de mirar la realidad argentina. La primera es la que todos conocemos:
          correr detrás del último incendio, indignarse con el titular del día, señalar culpables
          y esperar que alguien lo resuelva. La segunda es más incómoda pero infinitamente más poderosa:
          ver el tablero completo, entender las reglas que producen los incendios, y rediseñarlas.
          Este video te entrena para la segunda mirada — la del ingeniero social.
        </p>

        <h2>Los tres errores que te mantienen atrapado</h2>
        <ul>
          <li><strong>Confundir urgencia con importancia:</strong> corremos detrás del último titular y olvidamos los patrones que llevan décadas repitiéndose. La urgencia es el anestésico de la estrategia.</li>
          <li><strong>Atacar personas en lugar de procesos:</strong> personalizamos cada conflicto y perdemos de vista las reglas del juego que los crean. Cambiar al jugador sin cambiar las reglas no cambia nada.</li>
          <li><strong>Diseñar sin datos:</strong> proponemos soluciones desde la intuición sin medir flujos, incentivos ni consecuencias de segundo orden.</li>
        </ul>

        <blockquote>
          Pensar como ingeniero social es hacerse responsable de los sistemas
          que alimentamos con nuestra atención, nuestro dinero y nuestro silencio — cada día.
        </blockquote>

        <h2>Entrenamiento: tres habilidades para desarrollar esta semana</h2>
        <ol>
          <li><strong>Mapear causas:</strong> elegí un síntoma que te moleste y dibujá al menos cinco factores que lo sostienen. Vas a ver que el síntoma es solo la punta del iceberg.</li>
          <li><strong>Detectar palancas:</strong> de esos cinco factores, elegí el punto donde intervenir cambia varias variables a la vez. Ese es tu apalancamiento.</li>
          <li><strong>Ensayar prototipos:</strong> actuá rápido con un experimento pequeño y medí su efecto en 7 días. Velocidad de aprendizaje vence perfección de diseño.</li>
        </ol>

        <h2>Checklist de ingeniero social para tus proyectos</h2>
        <p>Antes de lanzar cualquier iniciativa, respondé estas tres preguntas:</p>
        <ul>
          <li>¿Quién gana si todo sigue exactamente igual? (Seguí el incentivo.)</li>
          <li>¿Qué información falta para tomar decisiones mejores? (Seguí los datos que nadie mide.)</li>
          <li>¿Qué hábito personal mío alimenta el síntoma que critico? (Empezá por casa.)</li>
        </ul>

        <blockquote>
          La ingeniería social es un acto de amor exigente: no alcanza con señalar fallas
          — hay que sentarse a rediseñar el sistema que las produce. Eso es responsabilidad adulta.
        </blockquote>
      </article>
    `,
  },
  [slugify("La Amabilidad como Estrategia de Transformación")]: {
    excerpt:
      "¿Cómo sostengo la firmeza sin perder humanidad? Este vlog muestra la amabilidad como plan táctico para transformar espacios hostiles en laboratorios de cooperación — antes de que termine el día.",
    content: `
      <article>
        <h1>La Amabilidad como Estrategia de Transformación</h1>
        <p>
          ¿Cómo sostengo la firmeza sin perder humanidad? Esa es la pregunta que más me hacen — y la que
          más me hago a mí mismo. Porque en un contexto argentino donde la dureza se confunde con fortaleza
          y la amabilidad con debilidad, sostener ambas al mismo tiempo parece imposible.
          Pero no lo es. La amabilidad estratégica es la respuesta: no esconde los problemas, los expone
          con precisión quirúrgica. No evita el conflicto — lo diseña para que produzca soluciones
          en lugar de heridas.
        </p>

        <h2>Manifiesto de la amabilidad estratégica</h2>
        <ul>
          <li><strong>Claridad radical:</strong> la amabilidad no disfraza los problemas. Los ilumina con respeto para que se puedan resolver, no para que se toleren.</li>
          <li><strong>Conflicto creativo:</strong> diseña conversaciones donde el desacuerdo genera soluciones nuevas — en lugar de ganadores y perdedores.</li>
          <li><strong>Regulación emocional:</strong> evita que el enojo secuestre la visión de largo plazo. Firmeza sin furia. Exigencia sin desprecio.</li>
        </ul>

        <blockquote>
          La amabilidad estratégica es el arte de decir verdades difíciles de un modo
          que invite a colaborar en la solución — no a huir de la conversación.
        </blockquote>

        <h2>Tres ejercicios para antes de que termine el día</h2>
        <ol>
          <li><strong>Mapa de relaciones:</strong> identificá hoy un vínculo que merece una conversación amable y valiente. Escribí el nombre. Definí cuándo va a ser.</li>
          <li><strong>Guion consciente:</strong> prepará tres frases que reconozcan al otro antes de plantear el desafío. "Valoro que..." / "Entiendo que..." / "Necesito que hablemos de..."</li>
          <li><strong>Cierre con compromiso:</strong> definí un acuerdo concreto, una fecha de revisión y una métrica simple. Sin esto, la conversación fue catarsis, no diseño.</li>
        </ol>

        <h2>¿Cómo sabés que está funcionando?</h2>
        <p>Medí el impacto de tu amabilidad estratégica con tres indicadores simples:</p>
        <ul>
          <li>Cantidad de acuerdos alcanzados sin desgaste emocional esta semana.</li>
          <li>Personas nuevas que se sumaron a tu iniciativa después de una conversación — no de un discurso.</li>
          <li>Nivel de claridad colectiva después de cada interacción: ¿la gente sale sabiendo qué hacer?</li>
        </ul>

        <blockquote>
          Siempre hay alguien esperando que llegues con tu amabilidad estratégica
          para recordarle que todavía vale la pena construir juntos. No lo hagas esperar más.
        </blockquote>
      </article>
    `,
  },
};
