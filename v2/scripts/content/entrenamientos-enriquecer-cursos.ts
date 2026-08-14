import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Enriquecimiento {
  promesa: [string, string, string];
  noCubre: [string, string];
  paraQuien: string;
  productoFinal: string;
  prerrequisitos: string[];
}

interface FuenteBase {
  url: string;
  titulo: string;
  consultada: string;
}

const enriquecimientos: Record<string, Enriquecimiento> = {
  'accion-comunitaria': {
    promesa: [
      'Detectar un problema abordable sin confundirlo con todos los problemas del barrio.',
      'Mapear activos, aliados, fricciones y una primera palanca de cambio.',
      'Convocar una acción de siete días con responsables y una señal simple de avance.',
    ],
    noCubre: [
      'No promete movilizaciones masivas ni resultados que dependan de autoridades externas.',
      'No reemplaza el análisis legal o técnico de proyectos con riesgos físicos o sanitarios.',
    ],
    paraQuien:
      'Para personas cansadas de opinar desde afuera y grupos pequeños que necesitan una primera victoria concreta.',
    productoFinal:
      'Una ficha de acción comunitaria de siete días, con mapa de activos, responsables y criterio de cierre.',
    prerrequisitos: [],
  },
  'alfabetismo-mediatico-desinformacion': {
    promesa: [
      'Separar afirmación, evidencia, fuente e interpretación antes de compartir una pieza.',
      'Reconocer tácticas de manipulación, sesgos y señales de contenido sintético.',
      'Aplicar un protocolo de verificación reproducible en menos de quince minutos.',
    ],
    noCubre: [
      'No declara verdadero o falso todo el debate público ni reemplaza una investigación periodística.',
      'No ofrece una lista eterna de medios confiables: enseña a evaluar piezas y fuentes.',
    ],
    paraQuien:
      'Para quienes reciben noticias por redes, enseñan, moderan comunidades o necesitan decidir sin amplificar engaños.',
    productoFinal:
      'Un kit personal de verificación con checklist, registro de fuentes y regla de publicación.',
    prerrequisitos: [],
  },
  'argentina-1810-1945-sistema-que-construimos': {
    promesa: [
      'Ordenar los principales cambios institucionales del período sin reducirlos a una lista de próceres.',
      'Conectar modelo productivo, ciudadanía, territorio y conflicto en una misma línea causal.',
      'Distinguir hechos documentados de interpretaciones históricas discutibles.',
    ],
    noCubre: [
      'No pretende agotar la historiografía ni reemplazar fuentes primarias y trabajos académicos.',
      'No usa el pasado como sentencia automática sobre actores políticos actuales.',
    ],
    paraQuien:
      'Para personas que quieren comprender cómo se ensambló el Estado argentino y discutir historia con mejores preguntas.',
    productoFinal:
      'Una línea de tiempo causal 1810–1945 con cinco bifurcaciones y sus consecuencias institucionales.',
    prerrequisitos: [],
  },
  'argentina-1945-2001-pendulo-nunca-para': {
    promesa: [
      'Reconstruir seis décadas de quiebres, continuidades y restricciones del sistema político-económico.',
      'Comparar proyectos de país sin convertir el curso en una tribuna partidaria.',
      'Identificar patrones que culminan en 2001 y condiciones que impiden extrapolarlos sin cuidado.',
    ],
    noCubre: [
      'No ofrece una explicación única de la violencia política, la dictadura o las crisis económicas.',
      'No equipara responsabilidades históricas ni reemplaza memoria, archivos y bibliografía especializada.',
    ],
    paraQuien:
      'Para quienes heredaron relatos enfrentados sobre 1945–2001 y quieren armar una lectura comparativa propia.',
    productoFinal:
      'Una matriz del péndulo argentino: apertura, cierre, coaliciones, restricciones y resultados por período.',
    prerrequisitos: ['Conviene recorrer antes “Argentina 1810–1945”, aunque no es obligatorio.'],
  },
  'argentina-sistema-viviente-primeros-principios': {
    promesa: [
      'Leer fenómenos argentinos como flujos, reservas, demoras y retroalimentaciones.',
      'Evitar analogías físicas fáciles distinguiendo metáfora, modelo y evidencia.',
      'Elegir una intervención relacional medible en un sistema cercano.',
    ],
    noCubre: [
      'No convierte leyes físicas en leyes sociales ni presenta modelos como predicciones exactas.',
      'No sustituye conocimiento sectorial en economía, salud, educación o administración pública.',
    ],
    paraQuien:
      'Para personas que necesitan integrar problemas fragmentados y ensayar decisiones con una mirada sistémica.',
    productoFinal:
      'Un mapa multinivel de un sistema argentino, con bucles, demoras, supuestos y una palanca comprobable.',
    prerrequisitos: ['Disposición a dibujar relaciones y revisar una hipótesis inicial.'],
  },
  'arquitectura-organizaciones-distribuidas': {
    promesa: [
      'Diseñar roles y dominios que no dependan de una persona insustituible.',
      'Elegir protocolos de consentimiento, consejo o delegación según el tipo de decisión.',
      'Instalar salvaguardas para conflictos, dinero, rotación y agotamiento.',
    ],
    noCubre: [
      'No vende horizontalidad sin responsabilidades ni elimina la necesidad de autoridad contextual.',
      'No reemplaza asesoramiento contable, laboral o societario para una organización formal.',
    ],
    paraQuien:
      'Para cooperativas, asociaciones, colectivos y equipos que crecieron más rápido que sus acuerdos internos.',
    productoFinal:
      'Una constitución mínima de equipo con círculos, roles, decisiones, rendición y protocolo de conflicto.',
    prerrequisitos: ['Tener un equipo real o un caso concreto sobre el cual diseñar.'],
  },
  'caja-herramientas-ciudadanas': {
    promesa: [
      'Preparar una reunión breve con propósito, agenda, roles y cierre verificable.',
      'Redactar una nota formal y sostener una conversación de negociación.',
      'Registrar datos, actores y próximos pasos sin depender de memoria o chats caóticos.',
    ],
    noCubre: [
      'No reemplaza formación jurídica ni garantiza respuesta de una institución.',
      'No propone una herramienta digital como solución para un problema de organización.',
    ],
    paraQuien:
      'Para cualquier persona que quiera participar y todavía no tenga un método práctico para hacerlo.',
    productoFinal:
      'Una carpeta ciudadana reutilizable: agenda, nota, mapa, registro de acuerdos y plan de treinta días.',
    prerrequisitos: [],
  },
  'ciudadano-auditor-control-ciudadano': {
    promesa: [
      'Formular un pedido de información específico, trazable y difícil de evadir.',
      'Leer las capas básicas de un presupuesto, una compra y un conjunto de datos públicos.',
      'Documentar hallazgos separando evidencia, inferencia y denuncia.',
    ],
    noCubre: [
      'No constituye asesoramiento legal ni asegura que una vía administrativa sea la adecuada en cada jurisdicción.',
      'No autoriza hostigamiento, exposición de datos personales ni acusaciones sin evidencia.',
    ],
    paraQuien:
      'Para vecinos, organizaciones y periodistas ciudadanos que quieren controlar actos públicos con método y cuidado.',
    productoFinal:
      'Un plan de auditoría ciudadana de treinta días con expediente, cronología y matriz de evidencia.',
    prerrequisitos: ['Elegir un tema público acotado y una jurisdicción concreta.'],
  },
  'como-funciona-argentina-anatomia-estado': {
    promesa: [
      'Ubicar qué nivel y qué organismo decide cada asunto público frecuente.',
      'Seguir el recorrido básico de una norma, un presupuesto y una elección.',
      'Construir un mapa de poder local que diferencie funciones formales e influencia real.',
    ],
    noCubre: [
      'No reemplaza el texto constitucional, la normativa vigente ni asesoramiento jurídico.',
      'No supone que el organigrama formal explica por sí solo cómo se decide.',
    ],
    paraQuien:
      'Para quienes quieren dejar de golpear la puerta equivocada y entender la arquitectura pública argentina.',
    productoFinal:
      'Un mapa de decisión territorial: problema, competencia, organismo, canal y responsable público.',
    prerrequisitos: [],
  },
  'comunicar-sin-polarizar-conversacion-valiente': {
    promesa: [
      'Preparar conversaciones difíciles sin renunciar a una posición ni atacar identidades.',
      'Escuchar para detectar necesidades, temores y puntos de acuerdo reales.',
      'Interrumpir una escalada y cerrar con un límite o próximo paso explícito.',
    ],
    noCubre: [
      'No exige dialogar ante violencia, acoso o una relación insegura.',
      'No promete convencer a la otra persona ni considera toda posición igualmente válida.',
    ],
    paraQuien:
      'Para familias, equipos y comunidades que necesitan volver a hablar de temas que activan la grieta.',
    productoFinal:
      'Un protocolo personal de conversación valiente con apertura, preguntas, límites y salida segura.',
    prerrequisitos: [],
  },
  'datos-para-bien-comun': {
    promesa: [
      'Convertir una inquietud comunitaria en una pregunta que pueda responderse con datos.',
      'Diseñar una recolección mínima con diccionario, controles y resguardo de información sensible.',
      'Comunicar un hallazgo con una visualización honesta y una recomendación proporcionada.',
    ],
    noCubre: [
      'No enseña estadística avanzada ni convierte correlaciones en causalidad.',
      'No habilita recolectar datos personales sin consentimiento, necesidad y protección.',
    ],
    paraQuien:
      'Para equipos ciudadanos con un problema verificable y voluntad de documentar cómo obtienen sus conclusiones.',
    productoFinal:
      'Un proyecto de datos reproducible: pregunta, diccionario, muestra, análisis, gráfico y nota metodológica.',
    prerrequisitos: [
      'Manejo básico de una planilla de cálculo.',
      'Un problema comunitario delimitado.',
    ],
  },
  'diseno-idealizado-sistemas-vivos': {
    promesa: [
      'Definir un sistema por propósito, entorno, límites, flujos y relaciones críticas.',
      'Diseñar desde una hoja en blanco sin borrar restricciones éticas o materiales.',
      'Someter un ideal a pruebas de aprendizaje, viabilidad y sostenimiento.',
    ],
    noCubre: [
      'No presenta el diseño idealizado como predicción ni como permiso para ignorar la transición.',
      'No usa lenguaje de sistemas para disimular decisiones políticas o conflictos de valores.',
    ],
    paraQuien:
      'Para diseñadores de organizaciones y políticas que ya identificaron un sistema agotado y necesitan explorar otro.',
    productoFinal:
      'Un dossier de sistema idealizado con macrofunciones, límites, flujos, tensiones y primera transición.',
    prerrequisitos: [
      'Pensamiento sistémico básico o un mapa causal previo.',
      'Un sistema real elegido.',
    ],
  },
  'diseno-instituciones-queja-propuesta': {
    promesa: [
      'Diagnosticar una falla institucional antes de saltar a una solución favorita.',
      'Escribir una propuesta con mecanismo, autoridad, recursos, incentivos y control.',
      'Diseñar una coalición y una prueba pública para mejorarla antes de escalar.',
    ],
    noCubre: [
      'No reemplaza técnica legislativa profesional ni análisis de constitucionalidad.',
      'No garantiza viabilidad política: obliga a hacer visibles actores, vetos y costos.',
    ],
    paraQuien:
      'Para organizaciones y ciudadanos que quieren transformar una demanda legítima en una propuesta examinable.',
    productoFinal:
      'Una ficha institucional completa: diagnóstico, articulado mínimo, implementación, presupuesto y control.',
    prerrequisitos: ['Conocer un problema público concreto y a quiénes afecta.'],
  },
  'economia-familiar-comunitaria': {
    promesa: [
      'Hacer visible el trabajo, el dinero y los riesgos que circulan dentro del hogar.',
      'Diseñar acuerdos familiares y comunitarios para comprar, ahorrar o cuidarse mejor.',
      'Preparar un protocolo de crisis que priorice liquidez, necesidades y conversación.',
    ],
    noCubre: [
      'No recomienda activos ni promete rendimientos en un contexto económico cambiante.',
      'No reemplaza asesoramiento financiero, impositivo o legal personalizado.',
    ],
    paraQuien:
      'Para hogares y redes cercanas que quieren coordinar recursos sin ocultar tensiones ni cargar todo en una persona.',
    productoFinal:
      'Un tablero económico familiar-comunitario con flujos, acuerdos, riesgos y protocolo de crisis.',
    prerrequisitos: ['Usar números aproximados reales del hogar, sin compartirlos públicamente.'],
  },
  'emprendimiento-con-proposito': {
    promesa: [
      'Validar un problema antes de enamorarte de una solución.',
      'Modelar valor, costos, ingresos, impacto y riesgos en una misma hoja.',
      'Diseñar un experimento comercial pequeño con criterios explícitos para seguir, cambiar o cerrar.',
    ],
    noCubre: [
      'No promete financiamiento, rentabilidad ni encaje de mercado.',
      'No reemplaza asesoramiento contable, societario, laboral o ambiental.',
    ],
    paraQuien:
      'Para quienes quieren crear valor económico y social sin usar el propósito como eslogan.',
    productoFinal:
      'Un dossier de validación con mapa del problema, modelo, números mínimos, impacto y experimento de venta.',
    prerrequisitos: ['Una idea o problema que pueda contrastarse con personas reales.'],
  },
  'fundamentos-pensamiento-comprension-aprendizaje': {
    promesa: [
      'Distinguir datos, información, conocimiento, comprensión e ideal sin mezclarlos.',
      'Representar un problema como sistema y no como una colección de síntomas.',
      'Diseñar un ciclo de decisión, error y aprendizaje aplicable a un desafío propio.',
    ],
    noCubre: [
      'No mide inteligencia ni promete una técnica universal de aprendizaje.',
      'No sustituye práctica deliberada, feedback ni conocimiento del dominio.',
    ],
    paraQuien:
      'Para personas que aprenden mucho, conectan poco y quieren pensar con más estructura.',
    productoFinal:
      'Un cuaderno de comprensión con jerarquía mental, mapa de sistema y ciclo semanal de aprendizaje.',
    prerrequisitos: [],
  },
  'gestion-proyectos-comunitarios': {
    promesa: [
      'Traducir una intención comunitaria en alcance, tareas, responsables y presupuesto.',
      'Coordinar voluntariado, alianzas y comunicación sin depender del entusiasmo inicial.',
      'Definir resultados, indicadores y una revisión que permita adaptar el proyecto.',
    ],
    noCubre: [
      'No asegura subsidios ni ofrece cifras de costos sin cotización local fechada.',
      'No reemplaza habilitaciones, seguros o asesoramiento legal cuando el proyecto los requiere.',
    ],
    paraQuien:
      'Para grupos que ya tienen una idea comunitaria y necesitan convertirla en un proyecto gobernable.',
    productoFinal:
      'Un canvas de proyecto comunitario con alcance, cronograma, presupuesto, riesgos, aliados e indicadores.',
    prerrequisitos: ['Una idea concreta y al menos otra persona con quien contrastarla.'],
  },
  'inteligencia-emocional-tiempos-turbulentos': {
    promesa: [
      'Reconocer señales corporales, emoción, interpretación e impulso como capas distintas.',
      'Ensayar recursos breves de regulación antes de una respuesta importante.',
      'Diseñar una conversación y una rutina de cuidado acordes a tus gatillos reales.',
    ],
    noCubre: [
      'No diagnostica ni trata trastornos de salud mental.',
      'No presenta la autorregulación como solución individual a violencia o precariedad estructural.',
    ],
    paraQuien:
      'Para quienes viven con incertidumbre sostenida y quieren responder con más margen, no con más aguante.',
    productoFinal:
      'Un mapa personal de señales, gatillos, recursos, apoyos y plan de cuidado de dos semanas.',
    prerrequisitos: [],
  },
  'introduccion-al-hombre-gris': {
    promesa: [
      'Distinguir símbolo, interpretación y propuesta ética dentro de la idea del Hombre Gris.',
      'Explorar humildad, pluralidad y transformación sin exigir adhesión mística.',
      'Convertir una intuición personal en un compromiso pequeño y observable.',
    ],
    noCubre: [
      'No demuestra profecías ni presenta interpretaciones simbólicas como hechos históricos.',
      'No construye un culto, una identidad partidaria ni una figura salvadora.',
    ],
    paraQuien:
      'Para personas curiosas por el marco del Hombre Gris, incluidas las que llegan con escepticismo.',
    productoFinal:
      'Una declaración personal de principios y una acción de siete días coherente con ella.',
    prerrequisitos: [],
  },
  'la-metamorfosis': {
    promesa: [
      'Usar las figuras del camello, el león y el niño como lentes, no como etiquetas rígidas.',
      'Reconocer una carga heredada, un límite necesario y una capacidad creadora.',
      'Diseñar un tránsito concreto sin romantizar ruptura, dolor o aislamiento.',
    ],
    noCubre: [
      'No es una exégesis exhaustiva de Nietzsche ni presenta la metáfora como psicología clínica.',
      'No recomienda romper vínculos, tratamientos u obligaciones de cuidado.',
    ],
    paraQuien:
      'Para quienes atraviesan un cambio de identidad, rol o propósito y necesitan un lenguaje para pensarlo.',
    productoFinal:
      'Un mapa de metamorfosis con cargas, dragones, límites, creaciones y red de sostén.',
    prerrequisitos: ['Conviene conocer el marco de “Introducción al Hombre Gris”.'],
  },
  'la-vision-de-transformacion': {
    promesa: [
      'Escribir una visión personal concreta, situada y abierta a revisión.',
      'Conectar valores, propósito, capacidades, restricciones y comunidad.',
      'Traducir la visión en decisiones de noventa días y señales tempranas de aprendizaje.',
    ],
    noCubre: [
      'No promete manifestación, motivación permanente ni control sobre el contexto.',
      'No reemplaza ayuda profesional ante una crisis vital o de salud mental.',
    ],
    paraQuien:
      'Para personas con muchas aspiraciones sueltas que necesitan elegir dirección sin inventar certezas.',
    productoFinal:
      'Un mapa de transformación de noventa días con visión, renuncias, hitos, apoyos y revisión.',
    prerrequisitos: [],
  },
  'liderazgo-distribuido': {
    promesa: [
      'Definir tu zona de influencia sin inflar autoridad ni descargar responsabilidad.',
      'Facilitar acuerdos, feedback y conflicto con estructuras que otros puedan repetir.',
      'Diseñar una función que siga viva cuando vos no estés.',
    ],
    noCubre: [
      'No elimina jerarquías de responsabilidad ni convierte toda decisión en asamblea.',
      'No reemplaza protocolos profesionales ante acoso, fraude o riesgos de seguridad.',
    ],
    paraQuien:
      'Para coordinadores formales e informales que quieren aumentar capacidad colectiva, no dependencia personal.',
    productoFinal:
      'Un experimento de liderazgo distribuido con delegación, feedback, métricas y prueba de ausencia.',
    prerrequisitos: ['Un equipo, proyecto o comunidad donde puedas ensayar una delegación real.'],
  },
  'narrativas-que-transforman-historias': {
    promesa: [
      'Encontrar una tensión narrativa sin fabricar héroes, villanos ni resultados.',
      'Elegir escena, voz, soporte y llamado a la acción según la audiencia.',
      'Editar una historia con consentimiento, precisión y prueba de lectura.',
    ],
    noCubre: [
      'No autoriza apropiarse del dolor ajeno ni publicar testimonios sin consentimiento.',
      'No promete viralidad ni reemplaza estrategia, investigación o verificación.',
    ],
    paraQuien:
      'Para organizaciones, creadores y ciudadanos que necesitan mover atención sin manipular.',
    productoFinal:
      'Una historia de impacto lista para publicar, con guion, piezas derivadas y checklist ético.',
    prerrequisitos: ['Un caso real, una audiencia definida y permiso para narrarlo.'],
  },
  'niveles-superiores-pensamiento-conciencia': {
    promesa: [
      'Explorar perspectivas de primera a sexta persona como ejercicios de atención.',
      'Distinguir experiencia subjetiva, inferencia sobre otros y afirmación verificable.',
      'Construir una práctica breve de observación y metacognición sin jerarquizar personas.',
    ],
    noCubre: [
      'No diagnostica niveles de conciencia ni demuestra superioridad espiritual.',
      'No sustituye psicoterapia, atención psiquiátrica ni formación contemplativa acompañada.',
    ],
    paraQuien:
      'Para personas con práctica reflexiva que quieren ampliar perspectiva sin escapar del cuerpo ni del mundo.',
    productoFinal:
      'Un diario de siete perspectivas con registros, sesgos detectados y práctica personal de catorce días.',
    prerrequisitos: ['Capacidad de pausar la práctica si produce malestar intenso.'],
  },
  'patrones-argentinos-debemos-romper': {
    promesa: [
      'Representar patrones argentinos como estructuras y no como defectos morales nacionales.',
      'Comparar explicaciones alternativas y buscar evidencia que podría refutarlas.',
      'Seleccionar una palanca local proporcional a tu capacidad de acción.',
    ],
    noCubre: [
      'No atribuye una personalidad homogénea a millones de argentinos.',
      'No ofrece una receta macroeconómica ni una plataforma electoral.',
    ],
    paraQuien:
      'Para quienes reconocen ciclos repetidos pero no quieren quedar atrapados en cinismo o simplificación.',
    productoFinal:
      'Un atlas de patrones con mecanismo, evidencia, contraejemplo, escala y palanca local.',
    prerrequisitos: ['Pensamiento sistémico básico recomendado.'],
  },
  'primeros-pasos-organizar-tu-barrio': {
    promesa: [
      'Mapear capacidades existentes antes de convocar alrededor de carencias.',
      'Diseñar una primera reunión con cuidado, foco y una decisión pequeña.',
      'Acordar canales, roles y un plan barrial de noventa días que no queme al grupo.',
    ],
    noCubre: [
      'No supone que toda persona vecina puede participar con el mismo tiempo o seguridad.',
      'No reemplaza protocolos municipales, mediación especializada o respuesta de emergencias.',
    ],
    paraQuien:
      'Para vecinos que comparten una preocupación y todavía no cuentan con organización estable.',
    productoFinal:
      'Un kit de arranque barrial: mapa de activos, convocatoria, agenda, acuerdos y plan de noventa días.',
    prerrequisitos: ['Un territorio pequeño y un problema inicial sobre el cual escuchar.'],
  },
  'redes-territoriales-barrio-provincia': {
    promesa: [
      'Mapear organizaciones, intereses, poder, recursos y vacíos de una red territorial.',
      'Diseñar acuerdos entre nodos que preserven autonomía y hagan posible coordinar.',
      'Preparar una estrategia de incidencia con objetivo, contraparte y escalamiento.',
    ],
    noCubre: [
      'No confunde sumar logos con construir una coalición operativa.',
      'No garantiza acceso a autoridades ni evita por sí solo cooptación y conflicto.',
    ],
    paraQuien:
      'Para organizaciones con trabajo local que necesitan cooperar a escala municipal o provincial.',
    productoFinal:
      'Un diseño de red territorial con nodos, gobernanza, protocolo de comunicación e iniciativa compartida.',
    prerrequisitos: ['Experiencia en una organización o iniciativa territorial real.'],
  },
  'resiliencia-y-proposito': {
    promesa: [
      'Diferenciar resiliencia, aguante, recuperación y cambio de condiciones.',
      'Reconocer valores, apoyos y prácticas que sostienen sentido bajo presión.',
      'Escribir un compromiso flexible que incluya descanso, duelo y pedido de ayuda.',
    ],
    noCubre: [
      'No promete crecimiento a partir de todo trauma ni obliga a encontrarle sentido al dolor.',
      'No reemplaza atención profesional o redes de protección ante una crisis.',
    ],
    paraQuien:
      'Para personas que necesitan recuperar dirección sin negar cansancio, pérdida ni límites.',
    productoFinal:
      'Un manifiesto de resiliencia con valores, señales de sobrecarga, apoyos y plan de treinta días.',
    prerrequisitos: [],
  },
  'sistemas-economicos-ciclo-argentino': {
    promesa: [
      'Conectar inflación, divisas, deuda, producción, impuestos y expectativas en mapas discutibles.',
      'Distinguir identidad política, dato, mecanismo e hipótesis económica.',
      'Comparar intervenciones por secuencia, distribución de costos y efectos secundarios.',
    ],
    noCubre: [
      'No pronostica inflación, dólar o crecimiento ni recomienda inversiones.',
      'No presenta una escuela económica como neutral o suficiente para explicar todo el ciclo.',
    ],
    paraQuien:
      'Para ciudadanos que quieren discutir economía argentina con mecanismos y límites, no solo consignas.',
    productoFinal:
      'Un mapa del ciclo económico argentino con variables, demoras, ganadores, perdedores y tres escenarios.',
    prerrequisitos: ['No hace falta matemática avanzada; sí disposición a comparar supuestos.'],
  },
  'sobrevivir-prosperar-economia-argentina': {
    promesa: [
      'Ordenar ingresos, gastos, deudas, liquidez y protección con números propios.',
      'Comparar herramientas financieras por plazo, riesgo, costo y condiciones vigentes.',
      'Preparar decisiones de seis meses sin fingir que la incertidumbre desaparece.',
    ],
    noCubre: [
      'No recomienda comprar o vender activos ni garantiza rendimientos.',
      'La normativa y los productos cambian: exige verificar fuentes oficiales antes de actuar.',
    ],
    paraQuien:
      'Para personas que necesitan recuperar control operativo de sus finanzas en un contexto volátil.',
    productoFinal:
      'Un plan financiero personal de seis meses con tablero, fondo, deuda, protección y fechas de revisión.',
    prerrequisitos: ['Reunir movimientos aproximados de los últimos dos meses.'],
  },
  'teoria-juegos-argentina-hombre-gris': {
    promesa: [
      'Modelar decisiones estratégicas con jugadores, acciones, información, pagos y repetición.',
      'Detectar cuándo un problema pide confianza, verificación, sanción o rediseño del juego.',
      'Probar un mecanismo cooperativo en una simulación territorial pequeña.',
    ],
    noCubre: [
      'No reduce motivaciones humanas a pagos ni trata un modelo como descripción completa.',
      'No prueba que una estrategia funcione fuera de las condiciones declaradas.',
    ],
    paraQuien:
      'Para diseñadores institucionales y líderes comunitarios que quieren pensar cooperación bajo incentivos reales.',
    productoFinal:
      'Un laboratorio de juego territorial con reglas, simulación, métricas, fallas y versión revisada.',
    prerrequisitos: ['Comodidad con tablas simples y razonamiento por escenarios.'],
  },
};

const portadaPorCategoria: Record<string, string> = {
  action: '/course-art/action.webp',
  civica: '/course-art/civica.webp',
  community: '/course-art/community.webp',
  comunicacion: '/course-art/comunicacion.webp',
  economia: '/course-art/economia.webp',
  'hombre-gris': '/course-art/hombre-gris.webp',
  reflection: '/course-art/reflection.webp',
  vision: '/course-art/vision.webp',
};

const CONSULTADA = '2026-08-13';
const FUENTES = {
  comunidad: {
    url: 'https://ctb.ku.edu/en/get-started',
    titulo: 'Community Tool Box · modelo para evaluar, planificar, actuar y sostener',
    consultada: CONSULTADA,
  },
  constitucion: {
    url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24430-804/texto',
    titulo: 'Constitución de la Nación Argentina · texto oficial',
    consultada: CONSULTADA,
  },
  datos: {
    url: 'https://www.argentina.gob.ar/datos-abiertos/portal',
    titulo: 'Portal Nacional de Datos Públicos',
    consultada: CONSULTADA,
  },
  finanzas: {
    url: 'https://www.argentina.gob.ar/economia/inclusion-financiera',
    titulo: 'Inclusión financiera · herramientas y protección',
    consultada: CONSULTADA,
  },
  historia: {
    url: 'https://www.argentina.gob.ar/interior/archivo-general-de-la-nacion',
    titulo: 'Archivo General de la Nación · fondos y servicios documentales',
    consultada: CONSULTADA,
  },
  informacion: {
    url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27275-265949/texto',
    titulo: 'Ley 27.275 · Derecho de Acceso a la Información Pública',
    consultada: CONSULTADA,
  },
  inversor: {
    url: 'https://www.argentina.gob.ar/cnv/proteccion-al-publico-inversor',
    titulo: 'CNV · protección y educación para el público inversor',
    consultada: CONSULTADA,
  },
  mil: {
    url: 'https://www.unesco.org/mil4teachers/en/introduction',
    titulo: 'UNESCO · currículo de alfabetización mediática e informacional',
    consultada: CONSULTADA,
  },
  nietzsche: {
    url: 'https://plato.stanford.edu/entries/nietzsche/',
    titulo: 'Stanford Encyclopedia of Philosophy · Friedrich Nietzsche',
    consultada: CONSULTADA,
  },
  ostrom: {
    url: 'https://www.nobelprize.org/prizes/economic-sciences/2009/ostrom/lecture/',
    titulo: 'Elinor Ostrom · gobernanza policéntrica más allá de mercados y Estados',
    consultada: CONSULTADA,
  },
  presupuesto: {
    url: 'https://www.argentina.gob.ar/economia/onp/presupuesto-ciudadano-2026/datos-abiertos',
    titulo: 'Presupuesto Ciudadano · datos abiertos e históricos',
    consultada: CONSULTADA,
  },
  salud: {
    url: 'https://www.who.int/publications/i/item/9789240003927',
    titulo: 'OMS · En tiempos de estrés, hacé lo que importa',
    consultada: CONSULTADA,
  },
  sistemas: {
    url: 'https://www.oecd.org/en/publications/systemic-thinking-for-policy-making_879c4f7a-en/full-report.html',
    titulo: 'OCDE e IIASA · pensamiento sistémico para políticas públicas',
    consultada: CONSULTADA,
  },
  teoriaJuegos: {
    url: 'https://plato.stanford.edu/entries/game-theory/',
    titulo: 'Stanford Encyclopedia of Philosophy · teoría de juegos',
    consultada: CONSULTADA,
  },
  cooperativas: {
    url: 'https://www.argentina.gob.ar/inaes/constitucion-de-cooperativas',
    titulo: 'INAES · constitución y responsabilidades de una cooperativa',
    consultada: CONSULTADA,
  },
} satisfies Record<string, FuenteBase>;

function fuentesPara(slug: string, categoria: string): FuenteBase[] {
  if (
    slug === 'argentina-1810-1945-sistema-que-construimos' ||
    slug === 'argentina-1945-2001-pendulo-nunca-para'
  ) {
    return [FUENTES.historia, FUENTES.constitucion];
  }
  if (slug === 'la-metamorfosis') return [FUENTES.nietzsche, FUENTES.sistemas];
  if (slug === 'teoria-juegos-argentina-hombre-gris') return [FUENTES.teoriaJuegos, FUENTES.ostrom];
  if (slug === 'emprendimiento-con-proposito' || slug === 'economia-familiar-comunitaria') {
    return [FUENTES.finanzas, FUENTES.cooperativas, FUENTES.inversor];
  }
  if (slug === 'fundamentos-pensamiento-comprension-aprendizaje')
    return [FUENTES.sistemas, FUENTES.comunidad];
  if (slug === 'niveles-superiores-pensamiento-conciencia')
    return [FUENTES.salud, FUENTES.nietzsche];
  if (slug === 'inteligencia-emocional-tiempos-turbulentos' || slug === 'resiliencia-y-proposito') {
    return [FUENTES.salud, FUENTES.comunidad];
  }
  const porCategoria: Record<string, FuenteBase[]> = {
    action: [FUENTES.comunidad, FUENTES.datos],
    civica: [FUENTES.constitucion, FUENTES.informacion, FUENTES.presupuesto],
    community: [FUENTES.comunidad, FUENTES.ostrom],
    comunicacion: [FUENTES.mil, FUENTES.informacion],
    economia: [FUENTES.finanzas, FUENTES.inversor],
    'hombre-gris': [FUENTES.sistemas, FUENTES.historia],
    reflection: [FUENTES.salud, FUENTES.sistemas],
    vision: [FUENTES.sistemas, FUENTES.comunidad],
  };
  return porCategoria[categoria] ?? [];
}

const raiz = resolve(process.cwd(), 'content/courses');
for (const [slug, enriquecimiento] of Object.entries(enriquecimientos)) {
  const archivo = resolve(raiz, slug, 'course.json');
  const curso = JSON.parse(readFileSync(archivo, 'utf8')) as Record<string, unknown>;
  const categoria = typeof curso.category === 'string' ? curso.category : '';
  const coverImage = portadaPorCategoria[categoria];
  if (!coverImage) throw new Error(`categoría sin portada: ${categoria || '(vacía)'} en ${slug}`);
  const actualizado = {
    ...curso,
    ...enriquecimiento,
    coverImage,
    fuentesBase: fuentesPara(slug, categoria),
    ...(['civica', 'economia'].includes(categoria) ? { revisarAntesDe: '2026-11-13' } : {}),
  };
  writeFileSync(archivo, `${JSON.stringify(actualizado, null, 2)}\n`);
}

process.stdout.write(
  `enriquecidos ${String(Object.keys(enriquecimientos).length)} cursos con promesas y productos propios\n`,
);
