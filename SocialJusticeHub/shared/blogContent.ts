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
      "No es un cansancio derrotado; es la lucidez incómoda de saber que Argentina puede ser rediseñada ahora y no mañana.",
    content: `
      <article>
        <h1>El Cansancio Sagrado: Por qué ya no podemos esperar</h1>
        <p>
          El cansancio sagrado aparece cuando dejamos de creer que el deterioro argentino es normal. Es la mezcla de agotamiento,
          claridad y responsabilidad que surge cuando comprendemos que nadie vendrá a rescatarnos. Ese cansancio se vuelve combustible
          si lo tratamos como una brújula moral y no como una excusa para rendirnos.
        </p>

        <blockquote>
          El cansancio sagrado no nos invita a dormir: nos ordena rediseñar sistemas que ya probaron ser insuficientes.
        </blockquote>

        <h2>Cuando el cansancio se vuelve brújula</h2>
        <p>Sentir cansancio sagrado significa tres cosas concretas:</p>
        <ul>
          <li><strong>Lucidez emocional:</strong> reconocemos la frustración, pero no dejamos que nos vuelva cínicos.</li>
          <li><strong>Diagnóstico sistémico:</strong> entendemos que los problemas se repiten por procesos diseñados para fracasar.</li>
          <li><strong>Decisión de servicio:</strong> elegimos usar nuestra energía en construir, no en quejarnos.</li>
        </ul>

        <h2>Diagnóstico urgente del agotamiento argentino</h2>
        <p>Si estás cansado es porque viste alguno de estos fallos estructurales:</p>
        <ul>
          <li><strong>Educación que desconecta:</strong> forma memoriosos, no ciudadanos capaces de rediseñar la realidad.</li>
          <li><strong>Economía especulativa:</strong> premia la viveza y castiga la creación de valor con propósito.</li>
          <li><strong>Política transaccional:</strong> negocia parches, nunca rediseños.</li>
          <li><strong>Cultura de espectadores:</strong> delegamos el cambio en líderes mesiánicos en lugar de asumir autoría.</li>
        </ul>

        <h2>De la indignación a la ingeniería social</h2>
        <p>
          El cansancio sagrado se cura diseñando un plan concreto. Propongo una secuencia práctica para pasar de la fatiga a la construcción:
        </p>
        <ol>
          <li><strong>Nombrar el sistema roto:</strong> educación, salud, barrio, economía personal.</li>
          <li><strong>Identificar el patrón:</strong> ¿qué hábito, ley o creencia mantiene vivo el problema?</li>
          <li><strong>Crear un prototipo:</strong> un pequeño rediseño que pueda probarse en 30 días o menos.</li>
          <li><strong>Medir y narrar:</strong> compartir lo aprendido para sumar a otros al rediseño.</li>
        </ol>

        <h2>Rituales diarios para honrar el cansancio</h2>
        <p>Transformá tu agotamiento en una práctica concreta:</p>
        <ol>
          <li><strong>Diario de lucidez:</strong> escribí qué viste hoy que confirma que no hay tiempo que perder.</li>
          <li><strong>Microacción consciente:</strong> elegí una acción pequeña que mejore el sistema que te preocupa.</li>
          <li><strong>Conversación valiente:</strong> hablá con alguien sobre la visión, no sobre la queja.</li>
        </ol>

        <blockquote>
          El cansancio sagrado es una promesa silenciosa: “no me iré a dormir hasta diseñar, aunque sea, un nuevo ladrillo para mi país”.
        </blockquote>
      </article>
    `,
  },
  [slugify("La Amabilidad como Ingeniería Social")]: {
    excerpt:
      "La amabilidad deja de ser un gesto blando cuando la usamos como arquitectura social para reparar vínculos y alinear propósitos.",
    content: `
      <article>
        <h1>La Amabilidad como Ingeniería Social</h1>
        <p>
          La amabilidad es una tecnología social subestimada. No se trata de buenos modales,
          sino de diseñar interacciones que disminuyan la fricción, multipliquen la confianza y generen cooperación.
          Cuando un sistema humano está quebrado, la amabilidad estratégica es la primera intervención inteligente.
        </p>

        <blockquote>
          La amabilidad profesional no es complacencia: es la decisión de construir escenarios donde otros quieran aportar lo mejor de sí.
        </blockquote>

        <h2>Variables que rediseña la amabilidad</h2>
        <ul>
          <li><strong>Percepción:</strong> transforma la manera en que interpretamos la intención de los demás.</li>
          <li><strong>Velocidad:</strong> acelera acuerdos porque reduce las defensas y el ruido emocional.</li>
          <li><strong>Memoria colectiva:</strong> deja huellas positivas que se replican en la cultura.</li>
        </ul>

        <h2>Blueprint de una interacción amable</h2>
        <ol>
          <li><strong>Preparación:</strong> definí la emoción que querés provocar en la otra persona.</li>
          <li><strong>Lenguaje:</strong> usá palabras que reconozcan al otro antes de pedir algo.</li>
          <li><strong>Oferta clara:</strong> explicá cómo tu propuesta mejora la vida del otro.</li>
          <li><strong>Cierre consciente:</strong> agradecé con datos concretos, no con frases vacías.</li>
        </ol>

        <h2>Aplicaciones prácticas</h2>
        <p>Integrá la amabilidad como ingeniería en tres capas:</p>
        <ul>
          <li><strong>Individual:</strong> establecé límites firmes comunicados con respeto.</li>
          <li><strong>Organizacional:</strong> diseñá rituales de reconocimiento que visibilicen comportamientos generosos.</li>
          <li><strong>Comunitaria:</strong> fomentá espacios donde desconocidos puedan colaborar sin miedo a ser juzgados.</li>
        </ul>

        <blockquote>
          Ser amable es construir infraestructura emocional para que la inteligencia colectiva circule sin bloqueos.
        </blockquote>
      </article>
    `,
  },
  [slugify("Diseño Idealizado: La Argentina Posible")]: {
    excerpt:
      "El diseño idealizado no es una fantasía: es la metodología que nos obliga a describir en detalle la Argentina que merece existir.",
    content: `
      <article>
        <h1>Diseño Idealizado: La Argentina Posible</h1>
        <p>
          Russell Ackoff proponía diseñar sin las restricciones del presente, y recién después preguntarse cómo llegar hasta allí.
          Aplicado a Argentina, el diseño idealizado nos invita a dejar de arreglar el pasado y a construir el país como si pudiéramos empezar hoy.
        </p>

        <h2>Principios del diseño idealizado aplicado al país</h2>
        <ul>
          <li><strong>Propósito compartido:</strong> cada sistema (educación, salud, economía) existe para servir a la vida digna.</li>
          <li><strong>Coherencia:</strong> las políticas dejan de contradecirse porque responden a un modelo integral.</li>
          <li><strong>Iteración:</strong> los prototipos se prueban rápido y con datos, no con promesas.</li>
        </ul>

        <blockquote>
          La pregunta no es “¿qué podemos cambiar?” sino “¿qué país aceptaríamos si tuviéramos que vivir en él para siempre?”.
        </blockquote>

        <h2>Mapa del sistema idealizado</h2>
        <h3>1. Educación que despierta</h3>
        <p>Currículas que integran tecnología, humanidades y diseño social desde la primaria.</p>

        <h3>2. Economía del valor real</h3>
        <p>Emprendimientos medidos por el impacto que generan en comunidades y territorios, no sólo por la renta.</p>

        <h3>3. Estado coreógrafo</h3>
        <p>Gobiernos que coordinan recursos, reglas y datos para que la creatividad ciudadana florezca.</p>

        <h3>4. Cultura del servicio</h3>
        <p>Medios y referentes que honran a quienes solucionan problemas, no a quienes los narran desde afuera.</p>

        <h2>Cómo empezar hoy</h2>
        <ol>
          <li><strong>Visión escrita:</strong> describí tu Argentina ideal como si estuvieras dando un reporte anual.</li>
          <li><strong>Prototipo local:</strong> traducí esa visión en un proyecto concreto de barrio o de organización.</li>
          <li><strong>Aprendizaje compartido:</strong> documentá qué funciona y qué no para que otros puedan replicarlo.</li>
        </ol>

        <blockquote>
          Diseñar idealmente es un acto de responsabilidad: no podemos exigir lo que no nos animamos a imaginar con precisión.
        </blockquote>
      </article>
    `,
  },
  [slugify("El Poder del Pensamiento Sistémico en la Transformación Social")]: {
    excerpt:
      "Pensar en sistemas es pasar del 'qué pasó' al 'qué lo hizo posible' y diseñar palancas que cambien el patrón completo.",
    content: `
      <article>
        <h1>El Poder del Pensamiento Sistémico en la Transformación Social</h1>
        <p>
          Argentina no está rota por eventos aislados sino por la interacción de procesos inconscientes.
          Pensar sistémicamente es aprender a ver los bucles de retroalimentación, las causas invisibles y las dependencias que perpetúan el deterioro.
        </p>

        <h2>Los lentes sistémicos esenciales</h2>
        <ul>
          <li><strong>Bucles refuerzo:</strong> comportamientos que se amplifican a sí mismos, como la desconfianza.</li>
          <li><strong>Bucles balance:</strong> dinámicas que frenan el cambio porque buscan volver al status quo.</li>
          <li><strong>Retrasos:</strong> decisiones cuyos efectos aparecen meses o años después.</li>
        </ul>

        <blockquote>
          Un problema sistémico nunca se soluciona en el mismo lugar donde lo detectamos; debemos intervenir en el diseño que lo produce.
        </blockquote>

        <h2>Metodología práctica</h2>
        <ol>
          <li><strong>Cartografiar actores:</strong> quién gana, quién pierde y quién decide.</li>
          <li><strong>Mapear flujos:</strong> dinero, información, emociones y poder.</li>
          <li><strong>Encontrar apalancamientos:</strong> pequeños cambios con efectos desproporcionados.</li>
          <li><strong>Crear nuevas reglas:</strong> acuerdos explícitos que cambian incentivos.</li>
        </ol>

        <h2>Aplicaciones inmediatas</h2>
        <p>Usá el pensamiento sistémico para:</p>
        <ul>
          <li><strong>Comunidades:</strong> alinear vecinos con datos y compromisos visibles.</li>
          <li><strong>Equipos:</strong> rediseñar reuniones para que resuelvan causas raíz.</li>
          <li><strong>Proyectos sociales:</strong> medir impacto en varias capas (económica, emocional, cultural).</li>
        </ul>

        <blockquote>
          Pensar en sistemas convierte la intuición en estrategia y a la buena voluntad en resultados medibles.
        </blockquote>
      </article>
    `,
  },
  [slugify("La Ética del Servicio: Construyendo una Sociedad de Servidores")]: {
    excerpt:
      "Servir no es sacrificarte; es diseñar tu vida para que cada talento produzca valor colectivo medible.",
    content: `
      <article>
        <h1>La Ética del Servicio: Construyendo una Sociedad de Servidores</h1>
        <p>
          La ética del servicio redefine el éxito personal: servir es crear condiciones para que otros también prosperen.
          En un país fatigado, la actitud del servidor profesional es revolucionaria porque combina amor con diseño.
        </p>

        <h2>Los cuatro compromisos del servidor</h2>
        <ul>
          <li><strong>Autoconocimiento:</strong> saber qué talento aportás mejor que nadie.</li>
          <li><strong>Coraje cívico:</strong> nombrar lo que duele sin destruir al otro.</li>
          <li><strong>Disciplina:</strong> convertir la empatía en soluciones concretas.</li>
          <li><strong>Evaluación constante:</strong> medir si tu servicio realmente transforma.</li>
        </ul>

        <blockquote>
          Servir no es agradar, es estar dispuesto a rediseñar procesos incómodos para que la dignidad sea norma y no excepción.
        </blockquote>

        <h2>Del individuo al sistema</h2>
        <p>Para escalar la ética del servicio necesitamos:</p>
        <ol>
          <li><strong>Lenguaje común:</strong> reemplazar la crítica vacía por preguntas que inviten a co-crear.</li>
          <li><strong>Modelos replicables:</strong> manuales abiertos que expliquen cómo servir en cada contexto.</li>
          <li><strong>Celebración pública:</strong> narrativas que premian a quienes solucionan, no a quienes sólo opinan.</li>
        </ol>

        <h2>Microprácticas para cada día</h2>
        <ul>
          <li><strong>Agenda de servicio:</strong> reservá en tu calendario acciones concretas para otro.</li>
          <li><strong>Feedback generoso:</strong> ofrecé observaciones honestas que ayuden a mejorar.</li>
          <li><strong>Puentes improbables:</strong> conectá personas que no se conocen pero que pueden potenciarse.</li>
        </ul>

        <blockquote>
          Una sociedad de servidores no espera milagros: diseña oportunidades para que cada ciudadano sea autor y no espectador.
        </blockquote>
      </article>
    `,
  },
  [slugify("El Pozo que se Desborda - Reflexiones en Vivo")]: {
    excerpt:
      "En este vlog relato el momento exacto en el que el vaso se rebalsa y entendemos que despertar es asumir autoría.",
    content: `
      <article>
        <h1>El Pozo que se Desborda - Reflexiones en Vivo</h1>
        <p>
          El video nace de una conversación íntima después de una jornada en la que varias personas me dijeron lo mismo:
          “ya no puedo seguir así”. Ese desborde emocional es un regalo si sabemos escucharlo.
        </p>

        <h2>Lo que comparto en el video</h2>
        <ul>
          <li><strong>El instante del quiebre:</strong> el momento en que notamos que postergar la acción es traicionarnos.</li>
          <li><strong>El duelo necesario:</strong> aceptar que el viejo yo no volverá.</li>
          <li><strong>El nacimiento del arquitecto:</strong> descubrir que el futuro depende de nuestro diseño consciente.</li>
        </ul>

        <blockquote>
          Cuando el pozo se desborda no buscamos culpables; diseñamos nuevas compuertas para que la energía se oriente al servicio.
        </blockquote>

        <h2>Preguntas para acompañar el video</h2>
        <ol>
          <li>¿Qué señal venías ignorando hasta ahora?</li>
          <li>¿Qué relación debés rediseñar para recuperar energía?</li>
          <li>¿Qué microacción demuestra que despertaste?</li>
        </ol>

        <h2>Plan de 30 días</h2>
        <p>Usá el desborde como punto de partida:</p>
        <ul>
          <li><strong>Semana 1:</strong> registrá tus patrones de cansancio y nombrá el sistema que querés cambiar.</li>
          <li><strong>Semana 2:</strong> pedí ayuda, formá una dupla o comunidad mínima.</li>
          <li><strong>Semana 3:</strong> prototipá una acción concreta y medible.</li>
          <li><strong>Semana 4:</strong> contá públicamente qué aprendiste y qué sigue.</li>
        </ul>

        <blockquote>
          Despertar es aceptar que somos los curadores de la energía colectiva. Si se desbordó, es hora de redirigirla con maestría.
        </blockquote>
      </article>
    `,
  },
  [slugify("Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social")]: {
    excerpt:
      "El vlog explica por qué los síntomas nos distraen y cómo entrenar la mirada del ingeniero social para modificar las causas.",
    content: `
      <article>
        <h1>Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social</h1>
        <p>
          El video contrapone dos maneras de interpretar la realidad: la mirada reactiva que persigue incendios
          y la mirada sistémica que rediseña el tablero completo.
        </p>

        <h2>Los tres errores que menciono</h2>
        <ul>
          <li><strong>Confundir urgencia con importancia:</strong> corremos detrás del último titular y olvidamos los patrones.</li>
          <li><strong>Atacar personas, no procesos:</strong> personalizamos conflictos y perdemos de vista las reglas que los crean.</li>
          <li><strong>Diseñar sin datos:</strong> proponemos soluciones sin medir flujos ni incentivos.</li>
        </ul>

        <blockquote>
          Pensar como ingeniero social es hacerse responsable de los sistemas que alimentamos con nuestra atención diaria.
        </blockquote>

        <h2>Entrenamiento recomendado</h2>
        <ol>
          <li><strong>Mapeá causas:</strong> dibujá al menos cinco factores que sostienen el síntoma que ves.</li>
          <li><strong>Detectá palancas:</strong> elegí un punto donde intervenir cambia varias variables a la vez.</li>
          <li><strong>Ensayá prototipos:</strong> actuá rápido con experimentos pequeños y medí su efecto.</li>
        </ol>

        <h2>Checklist para tus proyectos</h2>
        <ul>
          <li>¿Quién gana si todo sigue igual?</li>
          <li>¿Qué información falta para tomar decisiones mejores?</li>
          <li>¿Qué hábito personal alimenta el síntoma que criticás?</li>
        </ul>

        <blockquote>
          La ingeniería social es un acto de amor exigente: no alcanza con señalar fallas, hay que rediseñar el sistema que las produce.
        </blockquote>
      </article>
    `,
  },
  [slugify("La Amabilidad como Estrategia de Transformación")]: {
    excerpt:
      "Este vlog muestra la amabilidad como un plan táctico para transformar espacios hostiles en laboratorios de cooperación.",
    content: `
      <article>
        <h1>La Amabilidad como Estrategia de Transformación</h1>
        <p>
          El video responde a una pregunta recurrente: ¿cómo sostener la firmeza sin perder humanidad?
          La amabilidad estratégica es la respuesta porque calma al ego, abre posibilidades y legitima la exigencia.
        </p>

        <h2>Manifiesto de la amabilidad estratégica</h2>
        <ul>
          <li><strong>Claridad radical:</strong> la amabilidad no disfraza los problemas, los expone con respeto quirúrgico.</li>
          <li><strong>Conflicto creativo:</strong> diseña conversaciones donde el desacuerdo genera soluciones nuevas.</li>
          <li><strong>Regulación emocional:</strong> evita que el enojo secuestre la visión de largo plazo.</li>
        </ul>

        <blockquote>
          La amabilidad estratégica es el arte de decir verdades difíciles de un modo que invite a colaborar en la solución.
        </blockquote>

        <h2>Ejercicios para aplicar después del video</h2>
        <ol>
          <li><strong>Mapa de relaciones:</strong> identificá qué vínculo merece una conversación amable y valiente.</li>
          <li><strong>Guion consciente:</strong> prepará tres frases que reconozcan al otro antes de plantear el desafío.</li>
          <li><strong>Cierre potente:</strong> definí un compromiso compartido y una fecha para revisarlo.</li>
        </ol>

        <h2>Métricas de transformación</h2>
        <p>Medí el impacto de tu amabilidad con indicadores simples:</p>
        <ul>
          <li>Número de acuerdos alcanzados sin desgaste emocional.</li>
          <li>Personas nuevas que se suman a tu iniciativa después de una conversación.</li>
          <li>Nivel de claridad colectiva luego de cada interacción.</li>
        </ul>

        <blockquote>
          Siempre hay alguien esperando que llegues con tu amabilidad estratégica para recordarle que todavía vale la pena construir juntos.
        </blockquote>
      </article>
    `,
  },
};
