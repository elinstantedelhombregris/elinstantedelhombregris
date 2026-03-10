import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse23(authorId: number) {
  console.log('--- Course 23: Cómo Funciona Argentina de Verdad ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'como-funciona-argentina-anatomia-estado')).limit(1);

  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Cómo Funciona Argentina de Verdad: Anatomía del Estado',
      slug: 'como-funciona-argentina-anatomia-estado',
      description: 'Entiende cómo funciona realmente el Estado argentino. Los 3 poderes como dinámica de poder real, cómo un proyecto se convierte en ley, a dónde van tus impuestos, los feudos provinciales y la capa oculta de entes autónomos.',
      excerpt: 'Descubre cómo funciona realmente el Estado argentino más allá del manual de cívica.',
      category: 'civica',
      level: 'beginner',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800',
      orderIndex: 23,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 23:', course[0].title);
  } else {
    console.log('Found existing course 23:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Estado Argentino: La Máquina Que Nadie Te Explicó',
      description: 'Visión general del Estado como sistema: qué es, qué hace y por qué importa entenderlo.',
      content: `
        <h2>Más Allá del Manual de Cívica</h2>
        <p>En la escuela te enseñaron que Argentina tiene tres poderes: Ejecutivo, Legislativo y Judicial. Te hicieron memorizar artículos de la Constitución. Pero nadie te explicó <strong>cómo funciona realmente</strong> el poder en Argentina.</p>
        <p>Este curso no es un manual de educación cívica. Es una <strong>radiografía del Estado argentino</strong> como sistema: con sus bucles de retroalimentación, sus cuellos de botella, sus puntos ciegos y sus oportunidades de intervención ciudadana.</p>
        <h3>¿Qué Es el Estado?</h3>
        <p>El Estado no es "el gobierno". El gobierno cambia cada 4 años. El Estado es la <strong>infraestructura permanente</strong> que administra un territorio: las leyes, las instituciones, los empleados públicos, los procedimientos. Un presidente pasa; el Estado queda.</p>
        <h3>¿Por Qué Entenderlo?</h3>
        <ul>
          <li><strong>No podés cambiar lo que no entendés:</strong> Si querés mejorar tu barrio, tu ciudad, tu país, necesitás saber dónde están las palancas.</li>
          <li><strong>Dejar de ser víctima:</strong> Cuando entendés el sistema, dejás de quejarte y empezás a intervenir.</li>
          <li><strong>Proteger tus derechos:</strong> Hay herramientas legales poderosas que la mayoría desconoce.</li>
          <li><strong>Ejercer ciudadanía real:</strong> Votar cada 4 años no es ciudadanía. Es el mínimo.</li>
        </ul>
        <h3>El Estado como Sistema</h3>
        <p>Desde la perspectiva del pensamiento sistémico del Hombre Gris, el Estado argentino tiene <strong>bugs de diseño</strong> que generan disfunciones repetitivas. Pero también tiene mecanismos de participación ciudadana que casi nadie usa. Este curso te va a mostrar ambos.</p>
        <blockquote>"El ciudadano que no entiende cómo funciona su Estado es como un pasajero que no sabe leer el mapa del subte: va a donde lo lleven."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Poder Ejecutivo: Más Allá del Presidente',
      description: 'Cómo funciona realmente el Poder Ejecutivo y su estructura de decisión.',
      content: `
        <h2>El Hiperpresidencialismo Argentino</h2>
        <p>Argentina tiene uno de los presidencialismos más fuertes del mundo. El presidente no solo gobierna: <strong>legisla por decreto</strong> (DNU), designa jueces, maneja el presupuesto con discrecionalidad y controla la mayoría de los recursos que llegan a las provincias.</p>
        <h3>La Estructura Real del Ejecutivo</h3>
        <ul>
          <li><strong>Presidente:</strong> Jefe de Estado y Gobierno. Puede emitir Decretos de Necesidad y Urgencia (DNU) que tienen fuerza de ley.</li>
          <li><strong>Jefe de Gabinete:</strong> Coordinador de ministerios. En la práctica, su poder depende de cuánta confianza le dé el presidente.</li>
          <li><strong>Ministerios:</strong> Cada uno maneja un área (Economía, Salud, Educación, etc.). El número y la estructura cambian con cada gobierno.</li>
          <li><strong>Secretarías y subsecretarías:</strong> La capa técnica donde se diseñan e implementan las políticas reales.</li>
          <li><strong>Entes autónomos:</strong> BCRA, AFIP, ANSES, CONICET. Teóricamente independientes, en la práctica dependen del Ejecutivo.</li>
        </ul>
        <h3>El Presupuesto: Donde Está el Poder Real</h3>
        <p>El verdadero poder del Ejecutivo está en el <strong>manejo del presupuesto</strong>. Quién recibe fondos y quién no, qué obras se hacen y cuáles se posponen, qué provincias reciben transferencias discrecionales. Seguir la plata es la forma más efectiva de entender el poder.</p>
        <h3>Los DNU: Legislar Sin Congreso</h3>
        <p>Los Decretos de Necesidad y Urgencia permiten al presidente legislar sin pasar por el Congreso. Diseñados para emergencias, se han convertido en herramienta habitual. Para derogarse, ambas cámaras deben rechazarlos, lo cual casi nunca ocurre.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El poder ejecutivo concentra tanto poder que entenderlo es entender el juego. Y si jugamos el mismo juego sin conocer las reglas, siempre perdemos."</em></p>
        </blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Congreso Nacional: Cómo un Proyecto Realmente Se Convierte en Ley',
      description: 'El proceso legislativo real, más allá del esquema del manual escolar.',
      content: `
        <h2>El Camino Real de una Ley</h2>
        <p>El manual de cívica dice: "Un proyecto se presenta en una cámara, se debate, se vota, pasa a la otra cámara, se debate, se vota, el presidente lo promulga." En la realidad, el proceso es mucho más político y mucho menos lineal.</p>
        <h3>Lo Que No Te Dicen</h3>
        <ul>
          <li><strong>El 95% de los proyectos muere en comisión:</strong> La mayoría nunca llega al recinto. El presidente de la comisión decide qué se trata y qué se cajónea.</li>
          <li><strong>La negociación es antes del debate:</strong> Cuando un proyecto llega al recinto, el resultado ya está negociado. Los discursos son para las cámaras de TV.</li>
          <li><strong>Los bloques partidarios tienen disciplina:</strong> Los legisladores votan según lo que decide el bloque, no según su convicción personal (con excepciones).</li>
          <li><strong>El Ejecutivo manda:</strong> La mayoría de las leyes importantes son iniciativa del Poder Ejecutivo, no del Congreso.</li>
        </ul>
        <h3>Las Comisiones: Donde Se Cocina la Ley</h3>
        <p>Cada cámara tiene decenas de comisiones temáticas (Educación, Presupuesto, Defensa, etc.). Aquí es donde realmente se discute y se modifica un proyecto. Las audiencias públicas en comisiones son una oportunidad real de participación ciudadana que casi nadie aprovecha.</p>
        <h3>¿Cómo Participar?</h3>
        <ol>
          <li>Seguí los proyectos que te importan en hcdn.gob.ar y senado.gob.ar</li>
          <li>Pedí audiencia con tu diputado o senador (es tu derecho)</li>
          <li>Participá en audiencias públicas de comisiones</li>
          <li>Organizá presión ciudadana sobre temas específicos</li>
        </ol>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Las leyes no se hacen en el recinto: se negocian en pasillos, se cocinan en comisiones y se validan ante las cámaras. Entender ese proceso es dejar de ser espectador y empezar a jugar el mismo juego."</em></p>
        </blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Poder Judicial: La Justicia Como Sistema',
      description: 'Cómo funciona el sistema judicial argentino y por qué es tan lento.',
      content: `
        <h2>La Justicia Argentina: Un Sistema en Crisis Permanente</h2>
        <p>El Poder Judicial es probablemente el más cuestionado y menos entendido de los tres poderes. La percepción general es que "la justicia no funciona". Pero para cambiar algo, primero hay que entender cómo está diseñado.</p>
        <h3>Estructura del Poder Judicial</h3>
        <ul>
          <li><strong>Corte Suprema de Justicia:</strong> 5 miembros. Última instancia de apelación. Sus fallos son ley para todos.</li>
          <li><strong>Cámaras de Apelación:</strong> Segunda instancia. Revisan lo que decidió el juez de primera instancia.</li>
          <li><strong>Juzgados de primera instancia:</strong> Donde empieza la mayoría de las causas.</li>
          <li><strong>Justicia federal vs. provincial:</strong> Argentina tiene un sistema dual. La justicia federal trata temas de la Constitución, narcotráfico, causas interjurisdiccionales. La justicia provincial trata la mayoría de las causas civiles y penales.</li>
        </ul>
        <h3>¿Por Qué Es Tan Lenta?</h3>
        <ol>
          <li><strong>Falta de recursos:</strong> Pocos juzgados para la cantidad de causas</li>
          <li><strong>Exceso de formalismo:</strong> Procedimientos que podrían simplificarse enormemente</li>
          <li><strong>Cultura del expediente:</strong> Todo en papel, cuerpos cosidos a mano en pleno siglo XXI</li>
          <li><strong>Incentivos perversos:</strong> Más causas abiertas = más presupuesto pedido</li>
        </ol>
        <h3>El Consejo de la Magistratura</h3>
        <p>Selecciona y puede remover jueces. Es un órgano político donde pesan el gobierno, los legisladores, los abogados y los jueces. Su composición es motivo de disputa permanente porque controlar quién elige a los jueces es controlar la justicia.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La justicia lenta no es justicia. Pero quejarse de la lentitud sin entender el diseño del sistema es gritar al vacío. Jugamos el mismo juego: si entendés por qué es lento, podés proponer cómo acelerarlo."</em></p>
        </blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'A Dónde Van Tus Impuestos: El Presupuesto Nacional',
      description: 'Leer el presupuesto nacional como ciudadano y entender a dónde va tu plata.',
      content: `
        <h2>Seguir la Plata: Tu Derecho Como Contribuyente</h2>
        <p>Cada peso que pagás de impuestos (IVA, Ganancias, monotributo, ABL) va a un gran fondo común que se reparte según el <strong>Presupuesto Nacional</strong>. Entender este documento es entender las prioridades reales del gobierno (no las que dice en los discursos).</p>
        <h3>¿Cuánto Pagás Realmente?</h3>
        <p>Aunque no lo notes, pagás impuestos todo el tiempo:</p>
        <ul>
          <li><strong>IVA (21%):</strong> En cada compra. Es el impuesto más regresivo: el pobre y el rico pagan lo mismo.</li>
          <li><strong>Ganancias:</strong> Si sos empleado en relación de dependencia, te lo descuentan automáticamente.</li>
          <li><strong>Impuesto al cheque:</strong> Cada vez que movés plata por banco.</li>
          <li><strong>Ingresos brutos (provincial):</strong> Se traslada al precio de todo lo que comprás.</li>
          <li><strong>Tasas municipales:</strong> ABL, alumbrado, barrido, limpieza.</li>
        </ul>
        <h3>¿A Dónde Va?</h3>
        <p>Las principales partidas del presupuesto nacional son:</p>
        <ol>
          <li><strong>Seguridad social (jubilaciones, AUH):</strong> Más del 40% del presupuesto</li>
          <li><strong>Servicios de la deuda:</strong> Pagar lo que debemos</li>
          <li><strong>Educación y cultura:</strong> Incluyendo universidades nacionales</li>
          <li><strong>Defensa y seguridad</strong></li>
          <li><strong>Salud</strong></li>
          <li><strong>Obra pública:</strong> Rutas, viviendas, infraestructura</li>
        </ol>
        <h3>Herramienta: Presupuesto Abierto</h3>
        <p>El sitio <strong>presupuestoabierto.gob.ar</strong> te permite ver en tiempo real cómo se ejecuta el presupuesto. ¿Cuánto se asignó a educación? ¿Cuánto se gastó realmente? ¿Qué partidas están subejecutadas? Esta herramienta es oro puro para el ciudadano auditor.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Seguir la plata es la forma más honesta de entender el poder. El discurso miente, el presupuesto no. Jugamos el mismo juego, y el tablero está hecho de pesos."</em></p>
        </blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Provincias y Municipios: El Federalismo Real',
      description: 'Cómo funciona la distribución de poder entre Nación, provincias y municipios.',
      content: `
        <h2>23 Provincias, 23 Realidades</h2>
        <p>Argentina es un país federal, lo que significa que las provincias son <strong>estados autónomos</strong> con su propia constitución, su propio poder ejecutivo, legislativo y judicial. En la práctica, el federalismo argentino es una ficción parcial: la Nación controla la mayor parte de los recursos.</p>
        <h3>La Coparticipación: El Corazón del Conflicto</h3>
        <p>La Nación recauda la mayoría de los impuestos y luego <strong>coparticipa</strong> (distribuye) una parte a las provincias. Este sistema genera una dependencia estructural: muchas provincias no pueden funcionar sin las transferencias nacionales. Esto le da al presidente un poder enorme sobre los gobernadores.</p>
        <h3>Los Feudos Provinciales</h3>
        <p>En varias provincias argentinas, una misma familia o partido político gobierna hace décadas. Estas provincias funcionan como <strong>feudos</strong> donde el gobernador concentra poder ejecutivo, controla el legislativo provincial y tiene influencia sobre la justicia local. Formosa, Santiago del Estero, San Luis tienen historias de este tipo.</p>
        <h3>El Municipio: Tu Primer Nivel de Gobierno</h3>
        <p>El municipio es el nivel de gobierno más cercano a tu vida cotidiana: recolección de basura, alumbrado, regulación del comercio local, obras menores. Y es donde tu participación puede tener impacto más directo e inmediato.</p>
        <ul>
          <li><strong>El intendente</strong> maneja el ejecutivo municipal</li>
          <li><strong>El Concejo Deliberante</strong> legisla a nivel local</li>
          <li><strong>Las audiencias públicas municipales</strong> son tu oportunidad de participar</li>
        </ul>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El federalismo argentino es una promesa a medio cumplir. Pero tu municipio es donde tu voz pesa más. Si jugamos el mismo juego, el primer nivel del tablero es tu ciudad."</em></p>
        </blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Los Entes Autónomos: La Capa Invisible del Estado',
      description: 'Los organismos que controlan aspectos cruciales de tu vida y casi nadie conoce.',
      content: `
        <h2>El Estado Que No Ves</h2>
        <p>Detrás de los tres poderes visibles hay una <strong>capa de organismos</strong> que tienen poder enorme sobre tu vida cotidiana. Son teóricamente autónomos pero en la práctica su independencia varía mucho.</p>
        <h3>Los Organismos Clave</h3>
        <ul>
          <li><strong>BCRA (Banco Central):</strong> Controla la emisión de dinero, la tasa de interés y el tipo de cambio. Sus decisiones determinan si tu sueldo alcanza o no.</li>
          <li><strong>AFIP:</strong> Recauda impuestos y controla aduanas. Tiene más poder de investigación que cualquier otro organismo.</li>
          <li><strong>ANSES:</strong> Administra jubilaciones, AUH, pensiones. Maneja uno de los fondos más grandes del país (FGS).</li>
          <li><strong>INDEC:</strong> Produce las estadísticas oficiales. Cuando se interviene políticamente (como en 2007-2015), perdemos la capacidad de medir la realidad.</li>
          <li><strong>AGN (Auditoría General de la Nación):</strong> Controla las cuentas del Estado. Es dirigida por la oposición (el segundo candidato más votado).</li>
          <li><strong>SIGEN:</strong> Control interno del Poder Ejecutivo. Depende del presidente, lo que limita su independencia.</li>
          <li><strong>Defensoría del Pueblo:</strong> Defiende los derechos de los ciudadanos frente al Estado. Está vacante desde 2009.</li>
        </ul>
        <h3>¿Por Qué Importa?</h3>
        <p>Estos organismos toman decisiones diarias que afectan tu bolsillo, tus derechos y tu calidad de vida. Conocerlos es el primer paso para exigirles rendición de cuentas.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La capa invisible del Estado decide cuánto vale tu sueldo, cuánto pagás de impuestos y qué datos oficiales son confiables. Ignorar estos organismos es jugar el juego con los ojos vendados."</em></p>
        </blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'La Constitución Como Sistema Operativo',
      description: 'Entender la Constitución Nacional como el código fuente del sistema argentino.',
      content: `
        <h2>El Código Fuente de Argentina</h2>
        <p>Si Argentina fuera una computadora, la Constitución sería su <strong>sistema operativo</strong>. Define las reglas básicas: quién puede hacer qué, cómo se toman las decisiones, qué derechos tenés y cómo se protegen.</p>
        <h3>Los Derechos Que Ya Tenés (y Probablemente No Usás)</h3>
        <ul>
          <li><strong>Artículo 14bis:</strong> Derecho a condiciones dignas de trabajo, salario mínimo vital y móvil, protección contra despido arbitrario.</li>
          <li><strong>Artículo 41:</strong> Derecho a un ambiente sano. Podés demandar si contaminan tu barrio.</li>
          <li><strong>Artículo 42:</strong> Derechos como consumidor. Protección contra publicidad engañosa y servicios deficientes.</li>
          <li><strong>Artículo 43:</strong> El amparo. Si el Estado o un particular viola tus derechos, podés pedir protección judicial urgente.</li>
          <li><strong>Artículo 75 inc. 22:</strong> Los tratados internacionales de derechos humanos tienen rango constitucional.</li>
        </ul>
        <h3>Las Herramientas de Democracia Directa</h3>
        <p>La reforma de 1994 incorporó mecanismos de participación directa que casi nadie usa:</p>
        <ol>
          <li><strong>Iniciativa popular (Art. 39):</strong> Los ciudadanos pueden presentar proyectos de ley al Congreso con firmas.</li>
          <li><strong>Consulta popular (Art. 40):</strong> El Congreso o el presidente pueden someter decisiones a votación popular.</li>
        </ol>
        <h3>Los Bugs del Sistema</h3>
        <p>La Constitución también tiene <strong>problemas de diseño</strong>: el hiperpresidencialismo, la coparticipación nunca reglamentada como ordenó la reforma del 94, la Defensoría del Pueblo vacante, el Consejo de la Magistratura en disputa permanente. Estos bugs son oportunidades de mejora institucional.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La Constitución es tu código fuente. Tiene bugs, sí, pero también tiene funciones poderosas que nadie ejecuta. Jugamos el mismo juego: aprendé a leer el código y vas a encontrar herramientas que ni sabías que existían."</em></p>
        </blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Partidos Políticos: Cómo Funciona el Poder Real',
      description: 'Entender los partidos como sistemas de poder, no como ideas abstractas.',
      content: `
        <h2>Los Partidos: Máquinas de Poder</h2>
        <p>Los partidos políticos argentinos no son lo que dicen ser en sus plataformas electorales. Son <strong>organizaciones de poder</strong> con sus propias lógicas internas, financiamiento opaco y estructuras territoriales.</p>
        <h3>Cómo Funciona un Partido Por Dentro</h3>
        <ul>
          <li><strong>El aparato territorial:</strong> La red de punteros, referentes barriales y unidades básicas que movilizan gente y votos.</li>
          <li><strong>El financiamiento:</strong> Aportes legales (públicos y privados), pero también un circuito de financiamiento informal que nadie controla realmente.</li>
          <li><strong>Las internas:</strong> La pelea por las listas de candidatos es donde se juega el poder real. Las PASO hicieron esto parcialmente visible.</li>
          <li><strong>Las alianzas:</strong> Los frentes electorales argentinos son coaliciones pragmáticas, no ideológicas.</li>
        </ul>
        <h3>El Clientelismo Como Sistema</h3>
        <p>El clientelismo no es simplemente "comprar votos con un plan". Es un <strong>sistema de intercambio</strong>: el puntero ofrece acceso a recursos del Estado (planes, turnos médicos, trámites) a cambio de lealtad política. Es un bug de diseño que se sostiene porque para muchos es la única vía de acceso al Estado.</p>
        <h3>¿Se Puede Participar Sin Corromperse?</h3>
        <p>Sí, pero requiere conciencia sistémica. Muchos ciudadanos participan en partidos y mantienen su integridad. La clave es entrar con <strong>objetivos claros</strong>, rodearte de gente íntegra, y mantener siempre un pie afuera (tu organización barrial, tu trabajo, tu vida) que te dé independencia.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Los partidos son máquinas de poder: ni buenos ni malos. Jugamos el mismo juego, y entender la máquina por dentro te permite usarla sin que te use a vos."</em></p>
        </blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Elecciones: Del Cuarto Oscuro al Escrutinio',
      description: 'Cómo funciona el sistema electoral argentino y cómo participar más allá del voto.',
      content: `
        <h2>El Acto Electoral: Más Allá de Meter un Sobre</h2>
        <p>Votar es un derecho y una obligación en Argentina. Pero el sistema electoral tiene muchas capas que la mayoría no conoce, y hay formas de participación electoral mucho más profundas que elegir un candidato cada dos años.</p>
        <h3>El Sistema Electoral Argentino</h3>
        <ul>
          <li><strong>PASO (Primarias Abiertas):</strong> Elecciones primarias obligatorias donde todos los partidos eligen candidatos. También sirven como "encuesta" nacional.</li>
          <li><strong>Generales:</strong> La elección definitiva. Presidente se elige con ballotage (segunda vuelta si nadie supera el 45% o 40% con 10 puntos de diferencia).</li>
          <li><strong>Sistema proporcional (D'Hondt):</strong> Para diputados. Favorece a los partidos más grandes.</li>
          <li><strong>Senado:</strong> 3 senadores por provincia: 2 para la mayoría, 1 para la primera minoría.</li>
        </ul>
        <h3>Formas de Participar</h3>
        <ol>
          <li><strong>Fiscal de mesa:</strong> Controlás el proceso electoral en la mesa de votación. Es un servicio cívico fundamental.</li>
          <li><strong>Fiscal general de escuela:</strong> Coordinás los fiscales de un establecimiento.</li>
          <li><strong>Observador electoral:</strong> ONGs como Poder Ciudadano forman observadores.</li>
          <li><strong>Candidato:</strong> Cualquier ciudadano puede ser candidato a concejal, diputado, etc.</li>
        </ol>
        <h3>El Escrutinio</h3>
        <p>El escrutinio provisorio (la noche de la elección) lo hace correo con supervisión de fiscales. El escrutinio definitivo lo hace la justicia electoral y tarda semanas. Ambos procesos son controlables por la ciudadanía.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Votar es el acto mínimo de ciudadanía. Ser fiscal, observar, exigir transparencia: eso es jugar el mismo juego que juegan los que manejan el poder electoral."</em></p>
        </blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Medios y Poder: La Relación Que No Se Enseña',
      description: 'Entender la relación entre medios de comunicación y poder político en Argentina.',
      content: `
        <h2>El Cuarto Poder Argentino</h2>
        <p>Los medios de comunicación no son observadores neutrales de la política: son <strong>actores de poder</strong> con intereses propios, modelos de negocio que los condicionan, y relaciones complejas con el poder político.</p>
        <h3>El Mapa de Medios Argentino</h3>
        <ul>
          <li><strong>Grupo Clarín:</strong> El conglomerado mediático más grande. Diario, cable (Cablevisión), TV (Canal 13, TN), radio, internet.</li>
          <li><strong>Grupo América:</strong> Canal América, A24, radio La Red.</li>
          <li><strong>Medios públicos:</strong> TV Pública, Radio Nacional, Télam. Cambian de línea editorial con cada gobierno.</li>
          <li><strong>Medios digitales:</strong> Infobae, El Destape, Cenital, y cientos de medios independientes.</li>
        </ul>
        <h3>La Relación Medios-Gobierno</h3>
        <p>Cada gobierno argentino ha tenido una relación compleja con los medios: la pauta publicitaria oficial es una herramienta de presión (financiás a los amigos, ahogás a los críticos). La Ley de Medios del 2009 intentó regular la concentración pero fue parcialmente derogada después.</p>
        <h3>Cómo Leer Medios Críticamente</h3>
        <ol>
          <li>Siempre preguntá: <strong>¿quién es dueño</strong> de este medio?</li>
          <li>¿Cuál es su <strong>modelo de negocio</strong>? (publicidad, suscripción, pauta oficial)</li>
          <li>¿Qué noticias <strong>no cubre</strong>? La omisión dice tanto como la publicación.</li>
          <li>Contrastá siempre con <strong>al menos 3 fuentes</strong> de diferentes orientaciones.</li>
        </ol>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Los medios no te informan: te enmarcan. Jugamos el mismo juego que los dueños de los medios, los anunciantes y los políticos. La diferencia es que el ciudadano informado elige conscientemente qué marco aceptar."</em></p>
        </blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Mapa del Poder: Diagnóstico de Tu Territorio',
      description: 'Ejercicio integrador: mapear la estructura de poder en tu territorio local.',
      content: `
        <h2>De la Teoría a Tu Territorio</h2>
        <p>Ya entendés cómo funciona Argentina a nivel macro. Ahora es momento de <strong>mapear tu propio territorio</strong>: tu municipio, tu barrio, tu zona. Porque es ahí donde tu participación puede tener impacto real.</p>
        <h3>Ejercicio: Tu Mapa del Poder Local</h3>
        <p>En una hoja grande (o un documento digital), construí tu mapa respondiendo estas preguntas:</p>
        <ol>
          <li><strong>¿Quién gobierna tu municipio?</strong> Intendente, concejales, secretarios de área. ¿De qué partido son? ¿Hace cuánto están?</li>
          <li><strong>¿Quiénes son los actores de poder local?</strong> Empresarios, referentes barriales, sindicalistas, líderes religiosos, medios locales.</li>
          <li><strong>¿Cuál es el presupuesto municipal?</strong> ¿En qué se gasta? ¿Hay presupuesto participativo?</li>
          <li><strong>¿Qué mecanismos de participación existen?</strong> Audiencias públicas, banca del vecino, juntas vecinales.</li>
          <li><strong>¿Cuáles son los 3 problemas principales</strong> de tu zona según los vecinos?</li>
        </ol>
        <h3>Plan de Acción Cívica Personal</h3>
        <ul>
          <li><strong>Esta semana:</strong> Investigá quiénes son tus representantes locales (intendente, concejales)</li>
          <li><strong>Este mes:</strong> Asistí a una sesión del Concejo Deliberante o audiencia pública</li>
          <li><strong>Este trimestre:</strong> Hacé un pedido de acceso a información pública (Ley 27.275)</li>
        </ul>
        <blockquote>"El ciudadano que conoce su territorio, conoce a sus representantes y entiende cómo funciona el sistema tiene más poder del que imagina. El primer paso es dejar de mirar y empezar a participar."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 15, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 23');

  // Quiz
  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Cómo Funciona Argentina de Verdad',
    description: 'Evaluá tu comprensión del funcionamiento real del Estado argentino.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿Qué son los DNU (Decretos de Necesidad y Urgencia)?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Leyes votadas por el Congreso', 'Decretos del presidente con fuerza de ley', 'Resoluciones judiciales', 'Ordenanzas municipales']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Los DNU permiten al presidente legislar sin pasar por el Congreso, diseñados para emergencias.',
      points: 2, orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: 'El 95% de los proyectos de ley muere en comisión sin llegar al recinto.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'La gran mayoría de los proyectos nunca se tratan en el recinto. El presidente de comisión decide qué se trata.',
      points: 1, orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: '¿Qué organismo controla la emisión de dinero en Argentina?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['AFIP', 'ANSES', 'BCRA', 'AGN']),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Banco Central de la República Argentina (BCRA) controla la política monetaria y la emisión.',
      points: 2, orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Qué artículo constitucional establece el derecho al amparo?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Artículo 14', 'Artículo 19', 'Artículo 43', 'Artículo 75']),
      correctAnswer: JSON.stringify(2),
      explanation: 'El artículo 43 establece el amparo como herramienta de protección rápida de derechos constitucionales.',
      points: 2, orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: 'La coparticipación es la distribución de recursos de las provincias a la Nación.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Es al revés: la Nación recauda y distribuye (coparticipa) a las provincias.',
      points: 1, orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la partida más grande del presupuesto nacional?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Defensa', 'Seguridad social (jubilaciones, AUH)', 'Educación', 'Obra pública']),
      correctAnswer: JSON.stringify(1),
      explanation: 'La seguridad social (jubilaciones, AUH, pensiones) representa más del 40% del presupuesto.',
      points: 2, orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: '¿Qué herramienta web permite ver la ejecución del presupuesto en tiempo real?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['afip.gob.ar', 'presupuestoabierto.gob.ar', 'datos.gob.ar', 'argentina.gob.ar']),
      correctAnswer: JSON.stringify(1),
      explanation: 'presupuestoabierto.gob.ar muestra en tiempo real cómo se ejecuta el presupuesto nacional.',
      points: 2, orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: 'Ser fiscal de mesa es una forma de participación electoral ciudadana.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Los fiscales de mesa controlan el proceso electoral y son fundamentales para la transparencia.',
      points: 1, orderIndex: 8,
    },
    {
      quizId: quiz.id,
      question: '¿Qué es el clientelismo político?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Un sistema de partidos competitivo', 'Un sistema de intercambio de recursos por lealtad política', 'Un tipo de campaña electoral', 'Un modelo de gestión eficiente']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El clientelismo es un sistema donde se intercambia acceso a recursos del Estado por apoyo político.',
      points: 2, orderIndex: 9,
    },
    {
      quizId: quiz.id,
      question: 'La Defensoría del Pueblo de la Nación funciona normalmente desde 1994.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'La Defensoría del Pueblo está vacante desde 2009, lo que la ha dejado inoperante.',
      points: 1, orderIndex: 10,
    },
  ];

  for (const q of questions) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions.length, 'questions for course 23');
}

async function seedCourse24(authorId: number) {
  console.log('--- Course 24: Ciudadano Auditor ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'ciudadano-auditor-control-ciudadano')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Ciudadano Auditor: Herramientas de Control Ciudadano',
      slug: 'ciudadano-auditor-control-ciudadano',
      description: 'Conviértete en auditor de tu propio Estado. Aprende a leer presupuestos municipales, hacer pedidos de acceso a la información (Ley 27.275), usar datos.gob.ar, presentar amparos y ejercer control ciudadano efectivo.',
      excerpt: 'Las herramientas legales y prácticas para auditar a tu gobierno.',
      category: 'civica',
      level: 'intermediate',
      duration: 160,
      thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      orderIndex: 24,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 24:', course[0].title);
  } else {
    console.log('Found existing course 24:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Derecho a Saber: Fundamentos del Control Ciudadano',
      description: 'Por qué el control ciudadano es un derecho y un deber cívico.',
      content: `
        <h2>Tu Plata, Tu Derecho a Preguntar</h2>
        <p>Cada peso que pagás en impuestos (y pagás muchos: IVA en cada compra, Ganancias, monotributo, ingresos brutos, tasas municipales) va a un fondo que el Estado administra en tu nombre. Tenés <strong>derecho constitucional</strong> a saber cómo se gasta, quién decide y por qué.</p>
        <p>El control ciudadano no es desconfianza: es <strong>democracia en acción</strong>. Los países con más control ciudadano son los que menos corrupción tienen, mejor calidad de servicios públicos ofrecen y mayor confianza institucional generan.</p>
        <h3>El Marco Legal</h3>
        <ul>
          <li><strong>Constitución Nacional, Art. 1:</strong> Argentina es una república representativa. "República" viene del latín "res publica" = cosa pública. Lo público es de todos.</li>
          <li><strong>Art. 36:</strong> Atentado contra el sistema democrático. La corrupción de los funcionarios es un delito constitucional.</li>
          <li><strong>Art. 42:</strong> Derechos de consumidores y usuarios de servicios públicos.</li>
          <li><strong>Ley 27.275 (2016):</strong> Acceso a la Información Pública. Tu derecho a pedir cualquier información que el Estado tenga.</li>
          <li><strong>Convención Interamericana contra la Corrupción:</strong> Tratado internacional ratificado por Argentina.</li>
        </ul>
        <h3>¿Por Qué Tan Pocos Lo Ejercen?</h3>
        <ol>
          <li><strong>Desconocimiento:</strong> La mayoría no sabe que tiene estas herramientas.</li>
          <li><strong>Complejidad:</strong> El lenguaje burocrático y legal intimida.</li>
          <li><strong>Impunidad percibida:</strong> "Para qué, si no pasa nada." (Spoiler: sí pasa cuando muchos lo hacen.)</li>
          <li><strong>Miedo:</strong> En algunos contextos locales, pedir cuentas tiene costos sociales o incluso riesgos.</li>
        </ol>
        <h3>El Ciudadano Auditor</h3>
        <p>Este curso te va a dar las herramientas para ser un <strong>auditor de tu propio Estado</strong>. No necesitás ser abogado ni contador. Necesitás saber hacer las preguntas correctas a las personas correctas usando los canales correctos.</p>
        <blockquote>"El Estado le teme al ciudadano informado. No porque el ciudadano sea un enemigo, sino porque la transparencia es la mejor vacuna contra la corrupción. Un Estado que sabe que lo miran se comporta mejor."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Ley de Acceso a la Información Pública (27.275)',
      description: 'Cómo usar la ley de acceso a la información para obtener datos del Estado.',
      content: `
        <h2>Tu Herramienta Más Poderosa</h2>
        <p>La Ley 27.275 de Acceso a la Información Pública (2016) es probablemente la herramienta de control ciudadano <strong>más poderosa y menos utilizada</strong> de Argentina. Te permite pedir cualquier información que cualquier organismo del Estado tenga, sin dar explicaciones de por qué la querés.</p>
        <h3>¿Qué Podés Pedir?</h3>
        <p>Literalmente <strong>cualquier cosa</strong> que el Estado produzca, obtenga o controle:</p>
        <ul>
          <li>Contratos de obra pública y sus montos</li>
          <li>Sueldos de funcionarios públicos</li>
          <li>Actas de reuniones de organismos</li>
          <li>Informes técnicos sobre cualquier tema</li>
          <li>Gastos de publicidad oficial</li>
          <li>Licitaciones y sus adjudicaciones</li>
          <li>Estadísticas de gestión (tiempos de espera, causas judiciales, etc.)</li>
        </ul>
        <h3>¿A Quién Le Podés Pedir?</h3>
        <p>A todos los organismos del Estado nacional: ministerios, secretarías, entes autónomos (AFIP, ANSES, BCRA), empresas públicas, universidades nacionales, el Congreso, la Justicia, e incluso a organizaciones privadas que reciban fondos públicos.</p>
        <h3>Cómo Hacer un Pedido — Paso a Paso</h3>
        <ol>
          <li><strong>Entrá a</strong> la plataforma de Acceso a la Información Pública (según el organismo, puede ser por web, mail o nota escrita).</li>
          <li><strong>Identificate:</strong> Nombre, DNI, mail. Nada más.</li>
          <li><strong>Describí lo que pedís:</strong> Sé lo más específico posible. "Quiero el detalle de gastos en publicidad oficial del Ministerio X durante 2024" es mejor que "quiero saber sobre publicidad".</li>
          <li><strong>Enviá y esperá:</strong> El organismo tiene 15 días hábiles para responder (prorrogables por 15 más).</li>
          <li><strong>Si no responden:</strong> Podés reclamar ante la Agencia de Acceso a la Información Pública o presentar un amparo judicial.</li>
        </ol>
        <h3>Tips para Pedidos Efectivos</h3>
        <ul>
          <li>Pedí datos estructurados (planillas, bases de datos), no solo documentos PDF.</li>
          <li>Sé específico en el período temporal: "entre enero y diciembre de 2024".</li>
          <li>Si el organismo dice que no tiene la info, pedí que te deriven al organismo correcto.</li>
          <li>Guardá todo: el pedido, la respuesta, los plazos. Es tu evidencia.</li>
        </ul>
        <blockquote>"Cada pedido de información que hacés es un acto de ciudadanía. No importa si sos el primero o el millonésimo. Cada pedido le recuerda al Estado que alguien está mirando."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Presupuesto Municipal: Leer la Plata de Tu Ciudad',
      description: 'Cómo leer e interpretar un presupuesto municipal.',
      content: `
        <h2>El Documento Más Importante que Nadie Lee</h2>
        <p>El presupuesto municipal es el documento que dice <strong>exactamente en qué se va a gastar la plata de tu ciudad</strong>. Cuánto en salud, cuánto en obras, cuánto en sueldos, cuánto en publicidad. Si querés saber las prioridades reales de tu intendente (no las que dice en los discursos), leé el presupuesto.</p>
        <h3>Anatomía de un Presupuesto Municipal</h3>
        <ul>
          <li><strong>Recursos (ingresos):</strong> De dónde viene la plata. Tasas municipales (ABL), coparticipación provincial, transferencias nacionales, ingresos propios.</li>
          <li><strong>Gastos corrientes:</strong> Lo que se gasta en el día a día: sueldos, insumos, servicios, mantenimiento.</li>
          <li><strong>Gastos de capital:</strong> Inversión: obras públicas, equipamiento, infraestructura.</li>
          <li><strong>Servicio de deuda:</strong> Cuánto se paga por deudas anteriores.</li>
        </ul>
        <h3>Qué Buscar (Red Flags)</h3>
        <ol>
          <li><strong>Proporción de sueldos:</strong> Si más del 70% del presupuesto va a sueldos, queda muy poco para inversión y servicios.</li>
          <li><strong>Gastos de publicidad:</strong> Comparalo con gastos en salud o educación. Si el municipio gasta más en publicidad que en ambulancias, algo anda mal.</li>
          <li><strong>Partidas discrecionales:</strong> "Gastos reservados", "otros gastos", "atenciones especiales". Categorías vagas que ocultan gastos no justificados.</li>
          <li><strong>Subejercicio:</strong> Partidas aprobadas que no se ejecutan. Si se aprobaron $100M para cloacas y se gastaron $20M, ¿dónde quedaron los $80M?</li>
          <li><strong>Sobreejercicio:</strong> Gastar más de lo aprobado en alguna categoría. ¿Quién lo autorizó y por qué?</li>
        </ol>
        <h3>Dónde Encontrar el Presupuesto</h3>
        <ul>
          <li>Sitio web del municipio (sección "transparencia" o "hacienda").</li>
          <li>Concejo Deliberante (el presupuesto se aprueba ahí, las sesiones son públicas).</li>
          <li>Si no está online, pedilo por Ley 27.275.</li>
          <li>presupuestoabierto.gob.ar para el nivel nacional.</li>
        </ul>
        <h3>Ejercicio Práctico</h3>
        <p>Buscá el presupuesto de tu municipio. Encontrá 3 datos que te sorprendan. Compartilo con al menos 2 personas. Eso ya es más auditoría ciudadana que la que hace el 99% de la población.</p>
        <blockquote>"Un presupuesto es un documento moral: dice lo que una sociedad valora. Leé el presupuesto de tu municipio y vas a saber qué valora tu intendente. Probablemente te sorprendas."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Datos Abiertos: El Tesoro Que Nadie Busca',
      description: 'Usar datos.gob.ar y otras fuentes de datos abiertos para control ciudadano.',
      content: `
        <h2>La Información Está Ahí, Gratis</h2>
        <p>Argentina tiene uno de los portales de datos abiertos más completos de América Latina. En <strong>datos.gob.ar</strong> hay miles de datasets con información que va desde el gasto público hasta las estadísticas de salud, pasando por contrataciones, empleo público y mucho más. El problema no es la falta de datos: es que casi nadie los mira.</p>
        <h3>¿Qué Son los Datos Abiertos?</h3>
        <p>Son datos producidos por el Estado que se publican en <strong>formatos legibles por máquina</strong> (CSV, JSON, XML) para que cualquier ciudadano pueda descargarlos, analizarlos y usarlos. No son PDFs bonitos: son tablas de datos crudos que permiten análisis profundo.</p>
        <h3>Fuentes Clave de Datos</h3>
        <ul>
          <li><strong>datos.gob.ar:</strong> Portal central del Estado nacional. Miles de datasets.</li>
          <li><strong>presupuestoabierto.gob.ar:</strong> Ejecución presupuestaria en tiempo real.</li>
          <li><strong>datos.arba.gob.ar:</strong> Datos de la provincia de Buenos Aires.</li>
          <li><strong>BA Data (data.buenosaires.gob.ar):</strong> Datos de la Ciudad de Buenos Aires.</li>
          <li><strong>INDEC (indec.gob.ar):</strong> Estadísticas oficiales: pobreza, empleo, inflación, comercio exterior.</li>
          <li><strong>Comprar (comprar.gob.ar):</strong> Todas las compras y contrataciones del Estado nacional.</li>
          <li><strong>Mapa de inversiones (mapainversiones.mecon.gob.ar):</strong> Obras públicas georeferenciadas.</li>
        </ul>
        <h3>Qué Podés Hacer con Datos Abiertos</h3>
        <ol>
          <li><strong>Comparar:</strong> ¿Cuánto gasta tu provincia en salud vs. otras provincias similares?</li>
          <li><strong>Rastrear tendencias:</strong> ¿La pobreza está subiendo o bajando? ¿Cuánto creció el empleo público?</li>
          <li><strong>Detectar anomalías:</strong> Contratos con montos inusualmente altos, proveedores que ganan todas las licitaciones.</li>
          <li><strong>Visualizar:</strong> Convertir datos en gráficos que la gente pueda entender.</li>
        </ol>
        <h3>Herramientas Básicas</h3>
        <ul>
          <li><strong>Google Sheets / Excel:</strong> Para abrir y filtrar archivos CSV.</li>
          <li><strong>Datawrapper (datawrapper.de):</strong> Herramienta gratuita para crear gráficos profesionales sin saber programar.</li>
          <li><strong>Flourish:</strong> Visualizaciones interactivas gratuitas.</li>
          <li><strong>OpenRefine:</strong> Para limpiar datos desordenados.</li>
        </ul>
        <blockquote>"Los datos abiertos son el equivalente digital de abrir las ventanas del Estado. El aire fresco de la transparencia desinfecta. Pero solo funciona si alguien mira adentro."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Compras y Contrataciones Públicas: Seguir la Plata',
      description: 'Cómo auditar las compras que hace el Estado con tu plata.',
      content: `
        <h2>Seguir la Plata: La Forma Más Efectiva de Control</h2>
        <p>La corrupción más común en Argentina no es la coima espectacular del escándalo mediático. Es la <strong>sobrefacturación cotidiana</strong>: el Estado paga el doble por insumos hospitalarios, el triple por una obra de pavimentación, contratos dirigidos a empresas amigas. Seguir la plata es la auditoría más efectiva.</p>
        <h3>Cómo Compra el Estado</h3>
        <ul>
          <li><strong>Licitación pública:</strong> Para montos grandes. Se publica el llamado, las empresas ofertan, se elige la mejor oferta. En teoría, competitivo y transparente.</li>
          <li><strong>Licitación privada:</strong> Se invita a un número limitado de empresas. Menos transparente.</li>
          <li><strong>Contratación directa:</strong> Se elige al proveedor sin competencia. Permitida solo en casos excepcionales (urgencia, proveedor único). En la práctica, se abusa.</li>
          <li><strong>Convenio marco:</strong> Acuerdos pre-establecidos con proveedores a precios pactados.</li>
        </ul>
        <h3>Red Flags en Contrataciones</h3>
        <ol>
          <li><strong>Exceso de contrataciones directas:</strong> Si un organismo compra todo por contratación directa "por urgencia", la urgencia es sospechosa.</li>
          <li><strong>Proveedor recurrente:</strong> Si la misma empresa gana todas las licitaciones, hay que investigar.</li>
          <li><strong>Pliegos a medida:</strong> Requisitos técnicos tan específicos que solo un proveedor puede cumplir.</li>
          <li><strong>Precios inflados:</strong> Compará los precios que paga el Estado con precios de mercado. Si la diferencia es mayor al 20-30%, algo anda mal.</li>
          <li><strong>Empresas fantasma:</strong> Proveedores sin historia, sin empleados, creados poco antes de ganar un contrato.</li>
        </ol>
        <h3>Herramientas de Auditoría</h3>
        <ul>
          <li><strong>COMPR.AR (comprar.gob.ar):</strong> Todas las compras del Estado nacional publicadas online.</li>
          <li><strong>Boletín Oficial:</strong> Los contratos se publican aquí. Buscable en boletinoficial.gob.ar.</li>
          <li><strong>Registro de proveedores:</strong> Para verificar la existencia y antecedentes de los proveedores.</li>
          <li><strong>AFIP (constancia de inscripción):</strong> Para verificar que una empresa existe realmente.</li>
        </ul>
        <h3>Ejercicio</h3>
        <p>Entrá a comprar.gob.ar y buscá las últimas 10 contrataciones de un organismo que te interese. ¿Cuántas fueron licitación pública y cuántas contratación directa? ¿Se repite algún proveedor? ¿Los montos te parecen razonables?</p>
        <blockquote>"La corrupción no sobrevive a la luz del sol. Cada ciudadano que mira una licitación, que compara un precio, que pregunta por qué ese proveedor, es un antibiótico contra la infección de la corrupción."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'El Amparo: Tu Arma Legal Contra el Abuso',
      description: 'Cómo funciona el amparo como herramienta de protección de derechos.',
      content: `
        <h2>La Herramienta Legal Que Equilibra el Poder</h2>
        <p>El <strong>amparo</strong> es una acción judicial rápida que podés presentar cuando el Estado (o un particular) viola tus derechos constitucionales. Es la herramienta más directa que tiene un ciudadano para enfrentar al poder. Y no necesitás ser millonario para usarla.</p>
        <h3>¿Qué Es un Amparo?</h3>
        <p>El artículo 43 de la Constitución dice: toda persona puede interponer acción de amparo cuando un acto u omisión de autoridades públicas o particulares lesione, restrinja, altere o amenace derechos reconocidos por la Constitución, un tratado o una ley.</p>
        <h3>¿Cuándo Se Puede Usar?</h3>
        <ul>
          <li><strong>Derecho a la salud:</strong> Una obra social que no cubre un tratamiento obligatorio.</li>
          <li><strong>Derecho ambiental:</strong> Una fábrica que contamina el agua de tu barrio.</li>
          <li><strong>Acceso a la información:</strong> Un organismo que no responde tu pedido de información.</li>
          <li><strong>Derechos del consumidor:</strong> Un servicio público que no cumple sus obligaciones.</li>
          <li><strong>Discriminación:</strong> Cualquier acto discriminatorio por razones de género, raza, religión, etc.</li>
        </ul>
        <h3>Tipos de Amparo</h3>
        <ol>
          <li><strong>Amparo individual:</strong> Protege tus derechos personales.</li>
          <li><strong>Amparo colectivo:</strong> Protege derechos de un grupo (vecinos, consumidores). Un solo amparo puede beneficiar a miles.</li>
          <li><strong>Hábeas data:</strong> Para acceder, corregir o eliminar datos personales que el Estado o empresas tengan sobre vos.</li>
          <li><strong>Hábeas corpus:</strong> Protege la libertad física. Si alguien es detenido ilegalmente.</li>
        </ol>
        <h3>Cómo Presentar un Amparo</h3>
        <p>Necesitás un abogado, pero hay opciones gratuitas:</p>
        <ul>
          <li><strong>Defensoría del Pueblo:</strong> Puede presentar amparos en tu nombre.</li>
          <li><strong>Consultorios jurídicos gratuitos:</strong> Las facultades de Derecho tienen consultorios que toman casos pro bono.</li>
          <li><strong>ONGs:</strong> Organizaciones como ACIJ, FARN, ADC presentan amparos colectivos sobre temas de interés público.</li>
          <li><strong>Ministerio Público de la Defensa:</strong> Si no tenés recursos para un abogado.</li>
        </ul>
        <h3>Casos Emblemáticos</h3>
        <p>Amparos que cambiaron la realidad en Argentina:</p>
        <ul>
          <li><strong>Caso Mendoza (Riachuelo):</strong> Un amparo colectivo obligó al Estado a sanear el Riachuelo. Es la causa ambiental más importante del país.</li>
          <li><strong>Amparos de salud:</strong> Miles de familias obtuvieron cobertura de tratamientos médicos que sus obras sociales negaban.</li>
        </ul>
        <blockquote>"El amparo es la democracia en acción judicial. Es el ciudadano diciéndole al poder: 'esto no podés hacerlo, y tengo la Constitución para probarlo.' No te dejes intimidar por el sistema: el sistema tiene herramientas a tu favor."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Audiencias Públicas y Participación Formal',
      description: 'Los mecanismos formales de participación ciudadana y cómo aprovecharlos.',
      content: `
        <h2>Tu Voz en las Decisiones</h2>
        <p>Existen mecanismos formales de participación ciudadana que te permiten opinar, objetar y proponer <strong>antes</strong> de que las decisiones se tomen. No son consultivos solamente: en muchos casos, el Estado está obligado a considerarlos. El problema es que casi nadie participa.</p>
        <h3>Audiencias Públicas</h3>
        <p>Las audiencias públicas son instancias donde el Estado convoca a ciudadanos, organizaciones y empresas para opinar sobre una decisión antes de tomarla. Son obligatorias para:</p>
        <ul>
          <li>Aumentos de tarifas de servicios públicos (luz, gas, agua, transporte).</li>
          <li>Aprobación de impacto ambiental de grandes obras.</li>
          <li>Otorgamiento o renovación de licencias de servicios públicos.</li>
          <li>Reformas regulatorias significativas.</li>
        </ul>
        <h3>Cómo Participar en una Audiencia Pública</h3>
        <ol>
          <li><strong>Inscribite:</strong> Las audiencias se publican con anticipación. Hay que inscribirse como participante.</li>
          <li><strong>Preparate:</strong> Leé los documentos que el organismo publica antes de la audiencia. Preparate tu presentación con datos.</li>
          <li><strong>Asistí:</strong> Podés hablar presencialmente o, en muchos casos, de manera virtual.</li>
          <li><strong>Seguí:</strong> Después de la audiencia, el organismo debe publicar una resolución que considere los argumentos presentados.</li>
        </ol>
        <h3>Otros Mecanismos de Participación</h3>
        <ul>
          <li><strong>Banca del vecino:</strong> En muchos concejos deliberantes, podés pedir usar la "banca del vecino" para plantear un tema directamente a los concejales. 5-10 minutos para hablar ante el cuerpo legislativo de tu ciudad.</li>
          <li><strong>Presupuesto participativo:</strong> Muchos municipios permiten a los vecinos votar en qué se gasta una parte del presupuesto. Desde plazas hasta arreglos de calles.</li>
          <li><strong>Consejos consultivos:</strong> Espacios permanentes de participación ciudadana en áreas específicas (salud, seguridad, ambiente).</li>
          <li><strong>Consulta pública:</strong> Antes de aprobar regulaciones, algunos organismos publican borradores para comentarios públicos.</li>
        </ul>
        <h3>El Impacto Real</h3>
        <p>¿Funcionan? <strong>Sí, cuando hay participación masiva e informada.</strong> Una audiencia pública donde participan 3 personas es ignorable. Una donde participan 300 con argumentos sólidos es un hecho político que ningún funcionario puede descartar.</p>
        <blockquote>"La democracia no es solo votar cada 4 años. Es participar activamente en las decisiones que afectan tu vida. Las herramientas existen. Lo que falta es que las uses."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Organismos de Control: AGN, SIGEN, Defensorías',
      description: 'Los organismos que deberían controlar al Estado y cómo interactuar con ellos.',
      content: `
        <h2>Los Guardianes del Sistema (Que a Veces Duermen)</h2>
        <p>Argentina tiene organismos diseñados específicamente para controlar al Estado. Algunos funcionan bien, otros están capturados por el poder político, y otros directamente están vacantes. Conocerlos te permite usarlos como aliados en tu rol de ciudadano auditor.</p>
        <h3>Los Organismos Clave</h3>
        <ul>
          <li><strong>AGN (Auditoría General de la Nación):</strong> Controla las cuentas del Estado nacional. Dirigida constitucionalmente por un miembro de la primera minoría parlamentaria (la oposición). Publica informes detallados que casi nadie lee pero que son oro para el control ciudadano.</li>
          <li><strong>SIGEN (Sindicatura General de la Nación):</strong> Control interno del Poder Ejecutivo. Depende del presidente, lo que limita su independencia, pero produce auditorías internas valiosas.</li>
          <li><strong>Defensoría del Pueblo de la Nación:</strong> Debería defender los derechos de los ciudadanos frente al Estado. Está vacante desde 2009 (sí, más de 15 años). Un escándalo institucional.</li>
          <li><strong>Defensorías provinciales y municipales:</strong> Muchas funcionan mejor que la nacional. Investigá si la tuya existe y está activa.</li>
          <li><strong>Oficina Anticorrupción:</strong> Investiga y previene corrupción en el Poder Ejecutivo. Su efectividad depende de la voluntad política del gobierno.</li>
          <li><strong>Fiscalías especializadas:</strong> PROCELAC (delitos económicos), PROTEX (trata de personas), UFI-AMIA, etc.</li>
        </ul>
        <h3>Cómo Usar Estos Organismos</h3>
        <ol>
          <li><strong>Leé sus informes:</strong> La AGN publica informes de auditoría en agn.gob.ar. Son técnicos pero reveladores.</li>
          <li><strong>Presentá denuncias:</strong> Si detectás irregularidades, podés hacer denuncias formales ante la Oficina Anticorrupción o las fiscalías.</li>
          <li><strong>Acudí a la Defensoría:</strong> Si tenés un problema con un servicio público o un derecho vulnerado, la Defensoría provincial o municipal puede intervenir.</li>
          <li><strong>Exigí que funcionen:</strong> Si tu Defensoría está vacante o inactiva, eso en sí mismo es un tema de auditoría ciudadana.</li>
        </ol>
        <h3>Cuando el Control Falla</h3>
        <p>Cuando los organismos de control no funcionan, el control ciudadano directo se vuelve aún más importante. ONGs como Poder Ciudadano, ACIJ, CIPPEC y Directorio Legislativo hacen parte del trabajo que los organismos estatales no hacen.</p>
        <blockquote>"Los organismos de control son como alarmas contra incendios: necesitás que funcionen ANTES del incendio. Si tu alarma está rota, tu responsabilidad como ciudadano es mayor, no menor."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Periodismo Ciudadano y Denuncia Efectiva',
      description: 'Cómo documentar, denunciar y visibilizar irregularidades de manera efectiva.',
      content: `
        <h2>De la Evidencia a la Acción</h2>
        <p>Detectaste una irregularidad. Tenés datos. ¿Y ahora qué? La denuncia efectiva no es un post enojado en Facebook. Es un proceso <strong>estratégico</strong> que maximiza las chances de que tu hallazgo genere cambio real.</p>
        <h3>El Proceso de Denuncia Efectiva</h3>
        <ol>
          <li><strong>Documentá todo:</strong> Capturas de pantalla, fotos con fecha, documentos oficiales, testimonios. La evidencia es tu base.</li>
          <li><strong>Verificá tus datos:</strong> Antes de denunciar, asegurate de que tu información sea correcta. Un error te desacredita y desacredita la causa.</li>
          <li><strong>Elegí el canal adecuado:</strong>
            <ul>
              <li><strong>Denuncia penal:</strong> Si hay delito (corrupción, fraude, abuso). Ante la fiscalía correspondiente.</li>
              <li><strong>Denuncia administrativa:</strong> Ante el organismo de control competente (AGN, SIGEN, Defensoría).</li>
              <li><strong>Denuncia mediática:</strong> Si los canales institucionales no funcionan, los medios de comunicación pueden generar presión pública.</li>
              <li><strong>Denuncia en redes:</strong> Último recurso cuando todo lo demás falla. Pero solo con evidencia sólida.</li>
            </ul>
          </li>
          <li><strong>Buscá aliados:</strong> ONGs especializadas, legisladores de oposición, periodistas de investigación. Solo no vas a poder contra el sistema.</li>
          <li><strong>Protegete:</strong> Si la denuncia involucra a gente poderosa, tomá precauciones. Respaldá toda tu evidencia en múltiples lugares.</li>
        </ol>
        <h3>Periodismo Ciudadano</h3>
        <p>No necesitás ser periodista profesional para documentar y publicar hallazgos de interés público. Pero respetá principios básicos:</p>
        <ul>
          <li><strong>Verificación:</strong> Todo dato debe estar respaldado por evidencia.</li>
          <li><strong>Contexto:</strong> No publiques datos sin contexto. Un número sin contexto puede ser engañoso.</li>
          <li><strong>Fairness:</strong> Si acusás a alguien, dale la oportunidad de responder.</li>
          <li><strong>Protección de fuentes:</strong> Si alguien te dio información de manera confidencial, protegé su identidad.</li>
        </ul>
        <h3>Protección Legal del Denunciante</h3>
        <p>Argentina tiene protección limitada para denunciantes ("whistleblowers"). La Ley de Ética Pública establece la obligación de denunciar irregularidades, pero la protección práctica es débil. Esto está cambiando lentamente con presión de organizaciones civiles.</p>
        <blockquote>"Denunciar no es ser quilombero. Es ejercer el derecho y el deber cívico de exigir que el Estado funcione como debe. Cada denuncia bien hecha, con evidencia y método, es un ladrillo en la construcción de un país más transparente."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan de Auditoría: 30 Días de Control Ciudadano',
      description: 'Un plan práctico de 30 días para ejercer control ciudadano real.',
      content: `
        <h2>De la Teoría a Tu Primera Auditoría</h2>
        <p>Ahora tenés las herramientas. Tenés el marco legal, sabés leer un presupuesto, conocés los organismos de control, podés hacer pedidos de información y presentar denuncias. <strong>¿Qué vas a hacer con todo esto?</strong></p>
        <h3>Tu Plan de 30 Días</h3>
        <h4>Semana 1: Mapear</h4>
        <ul>
          <li><strong>Día 1-2:</strong> Investigá quiénes son tus representantes locales: intendente, concejales, legisladores provinciales. Nombres, caras, partidos.</li>
          <li><strong>Día 3-4:</strong> Encontrá el presupuesto de tu municipio online. Si no está, eso ya es un hallazgo.</li>
          <li><strong>Día 5-7:</strong> Identificá un tema que te importa (salud, educación, seguridad, obra pública, ambiente) y buscá datos sobre ese tema en tu municipio.</li>
        </ul>
        <h4>Semana 2: Preguntar</h4>
        <ul>
          <li><strong>Día 8-10:</strong> Hacé tu primer pedido de acceso a la información (Ley 27.275). Pedí algo específico: gastos en publicidad, detalle de una obra, contratos de un área.</li>
          <li><strong>Día 11-12:</strong> Entrá a comprar.gob.ar y mirá las últimas contrataciones del organismo que elegiste.</li>
          <li><strong>Día 13-14:</strong> Buscá si hay audiencias públicas o sesiones del Concejo Deliberante próximas e inscribite.</li>
        </ul>
        <h4>Semana 3: Participar</h4>
        <ul>
          <li><strong>Día 15-17:</strong> Asistí a una sesión del Concejo Deliberante o a una audiencia pública. Solo mirá y tomá notas.</li>
          <li><strong>Día 18-19:</strong> Buscá si hay organizaciones en tu ciudad que hacen control ciudadano (ONGs, observatorios, grupos vecinales). Contactalas.</li>
          <li><strong>Día 20-21:</strong> Revisá la respuesta a tu pedido de información (si ya llegó). Si no llegó, preparate para reclamar.</li>
        </ul>
        <h4>Semana 4: Actuar</h4>
        <ul>
          <li><strong>Día 22-24:</strong> Con lo que encontraste, escribí un breve análisis. ¿Qué descubriste? ¿Qué preguntas tenés?</li>
          <li><strong>Día 25-27:</strong> Compartí tus hallazgos: en redes, con vecinos, en un medio local. Convertí datos en historia.</li>
          <li><strong>Día 28-30:</strong> Planificá tu próximo paso: ¿qué vas a auditar el mes que viene? ¿Con quiénes te vas a aliar?</li>
        </ul>
        <h3>Tu Compromiso</h3>
        <blockquote>"El control ciudadano no es un hobby ni un acto heroico. Es higiene democrática. Así como te lavás los dientes todos los días para prevenir caries, auditás a tu gobierno regularmente para prevenir corrupción. No necesitás ser experto. Necesitás ser constante. Un ciudadano que pregunta, mira y exige es más poderoso de lo que imagina."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 24');

  const existingQuiz24 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz24.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz24[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz24] = await db.insert(courseQuizzes).values({
    courseId, title: 'Quiz: Ciudadano Auditor', description: 'Evaluá tu conocimiento de las herramientas de control ciudadano.',
    passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3,
  }).returning();

  const questions24 = [
    { quizId: quiz24.id, question: '¿Qué ley te da derecho a pedir información a cualquier organismo del Estado?', type: 'multiple_choice' as const, options: JSON.stringify(['Ley 25.326 de Datos Personales', 'Ley 27.275 de Acceso a la Información Pública', 'Ley 24.240 de Defensa del Consumidor', 'Ley 25.675 General del Ambiente']), correctAnswer: JSON.stringify(1), explanation: 'La Ley 27.275 de Acceso a la Información Pública te permite pedir cualquier información estatal sin dar explicaciones.', points: 2, orderIndex: 1 },
    { quizId: quiz24.id, question: 'Para hacer un pedido de información pública necesitás ser abogado.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Cualquier ciudadano puede hacer un pedido con solo su nombre, DNI y la descripción de lo que pide.', points: 1, orderIndex: 2 },
    { quizId: quiz24.id, question: '¿Cuál es una "red flag" en el presupuesto municipal?', type: 'multiple_choice' as const, options: JSON.stringify(['Que tenga muchas páginas', 'Que más del 70% vaya a sueldos dejando poco para inversión', 'Que incluya gastos de salud', 'Que esté publicado online']), correctAnswer: JSON.stringify(1), explanation: 'Si la mayor parte del presupuesto va a sueldos, queda muy poco para servicios e inversión pública.', points: 2, orderIndex: 3 },
    { quizId: quiz24.id, question: '¿Qué es el amparo colectivo?', type: 'multiple_choice' as const, options: JSON.stringify(['Un seguro de salud grupal', 'Una acción judicial que protege derechos de un grupo de personas', 'Un tipo de protesta legal', 'Un beneficio para jubilados']), correctAnswer: JSON.stringify(1), explanation: 'El amparo colectivo permite proteger derechos de grupos enteros con una sola acción judicial.', points: 2, orderIndex: 4 },
    { quizId: quiz24.id, question: 'La Defensoría del Pueblo de la Nación está en pleno funcionamiento desde 2009.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La Defensoría del Pueblo está vacante desde 2009, lo que la ha dejado prácticamente inoperante.', points: 1, orderIndex: 5 },
    { quizId: quiz24.id, question: '¿Qué organismo está constitucionalmente dirigido por la oposición?', type: 'multiple_choice' as const, options: JSON.stringify(['SIGEN', 'Oficina Anticorrupción', 'AGN (Auditoría General de la Nación)', 'Defensoría del Pueblo']), correctAnswer: JSON.stringify(2), explanation: 'La Constitución establece que la AGN es presidida por un miembro de la primera minoría parlamentaria.', points: 2, orderIndex: 6 },
    { quizId: quiz24.id, question: 'Las audiencias públicas son obligatorias antes de aumentar tarifas de servicios públicos.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Las audiencias públicas son requisito legal previo a aumentos de tarifas, aunque la participación ciudadana suele ser baja.', points: 1, orderIndex: 7 },
    { quizId: quiz24.id, question: '¿Qué portal permite ver las compras del Estado nacional?', type: 'multiple_choice' as const, options: JSON.stringify(['mercadolibre.com.ar', 'comprar.gob.ar', 'datos.gob.ar', 'afip.gob.ar']), correctAnswer: JSON.stringify(1), explanation: 'comprar.gob.ar publica todas las contrataciones del Estado nacional de manera accesible.', points: 2, orderIndex: 8 },
  ];

  for (const q of questions24) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz with', questions24.length, 'questions for course 24');
}

async function seedCourse25(authorId: number) {
  console.log('--- Course 25: Diseño de Instituciones ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'diseno-instituciones-queja-propuesta')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Diseño de Instituciones: De la Queja a la Propuesta',
      slug: 'diseno-instituciones-queja-propuesta',
      description: 'Pasa de quejarte del sistema a proponer mejoras concretas. Aprende a redactar proyectos legislativos, organizar audiencias públicas, construir coaliciones transversales, y usar mecanismos de democracia directa.',
      excerpt: 'Aprende a diseñar y proponer mejoras institucionales concretas.',
      category: 'civica',
      level: 'advanced',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      orderIndex: 25,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 25:', course[0].title);
  } else {
    console.log('Found existing course 25:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'De Quejarse a Proponer: El Cambio de Mindset',
      description: 'Pasar de la queja al diseño de soluciones institucionales.',
      content: `
        <h2>El Salto Más Difícil</h2>
        <p>Es fácil identificar lo que funciona mal. Es fácil quejarse. Lo difícil es lo que viene después: <strong>proponer una alternativa concreta, viable y mejor</strong>. Este curso te va a enseñar a dar ese salto.</p>
        <p>La diferencia entre un ciudadano frustrado y un ciudadano transformador es simple: el primero dice "esto no funciona"; el segundo dice "esto no funciona, y <strong>acá está mi propuesta para mejorarlo</strong>".</p>
        <h3>¿Por Qué Proponer Es Tan Difícil?</h3>
        <ul>
          <li><strong>Complejidad:</strong> Los problemas institucionales son sistémicos. No tienen soluciones simples.</li>
          <li><strong>Resistencia:</strong> Todo cambio tiene beneficiarios y perjudicados. Los perjudicados van a resistir.</li>
          <li><strong>Conocimiento técnico:</strong> Diseñar una institución o una ley requiere entender cómo funciona el sistema actual.</li>
          <li><strong>Paciencia:</strong> Los cambios institucionales tardan años, no semanas.</li>
        </ul>
        <h3>El Framework del Diseñador Institucional</h3>
        <ol>
          <li><strong>Diagnosticar:</strong> ¿Qué funciona mal exactamente? ¿Cuál es la causa raíz?</li>
          <li><strong>Investigar:</strong> ¿Cómo se resolvió este problema en otros lugares? ¿Qué funcionó y qué no?</li>
          <li><strong>Diseñar:</strong> ¿Cuál es la solución propuesta? ¿Qué incentivos crea? ¿Qué efectos secundarios podría tener?</li>
          <li><strong>Validar:</strong> ¿Qué opinan los expertos? ¿Qué opinan los afectados? ¿Es legal y viable?</li>
          <li><strong>Implementar:</strong> ¿Qué canal usar? ¿Quién tiene poder para implementarlo? ¿Cómo se construye apoyo?</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en una institución o servicio público argentino que te frustre regularmente (puede ser AFIP, el registro civil, una oficina municipal). Ahora intentá aplicar las 5 etapas del framework: ¿podés identificar cuál es la causa raíz del problema, más allá de tu queja inicial?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>El Error Más Común</h3>
        <p>Saltar del diagnóstico a la solución sin investigar. "Los juicios son lentos → hay que echar a todos los jueces." Suena bien como queja, pero como propuesta es inviable, ilegal y contraproducente. El diseñador institucional <strong>investiga antes de proponer</strong>.</p>
        <blockquote>"El Hombre Gris no se queja del sistema: lo rediseña. No pide permiso para proponer: presenta propuestas tan sólidas que no pueden ser ignoradas."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Análisis Institucional: Diagnosticar Antes de Proponer',
      description: 'Herramientas para analizar por qué una institución no funciona.',
      content: `
        <h2>Entender el Bug Antes de Parchar</h2>
        <p>Si un programador arreglara código sin entender el bug, crearía más bugs. Lo mismo pasa con las instituciones. Antes de proponer mejoras, necesitás un <strong>diagnóstico riguroso</strong> de por qué las cosas no funcionan.</p>
        <h3>Las 5 Preguntas del Diagnóstico Institucional</h3>
        <ol>
          <li><strong>¿Cuál es el objetivo declarado de esta institución?</strong> ¿Para qué fue creada?</li>
          <li><strong>¿Cumple ese objetivo?</strong> ¿Qué evidencia hay de que funciona o no funciona?</li>
          <li><strong>¿Quiénes son los actores y qué incentivos tienen?</strong> Los funcionarios, los usuarios, los beneficiarios, los perjudicados.</li>
          <li><strong>¿Qué reglas formales e informales la gobiernan?</strong> La ley dice una cosa; la práctica puede decir otra.</li>
          <li><strong>¿Qué consecuencias tiene el mal funcionamiento?</strong> ¿A quién afecta más?</li>
        </ol>
        <h3>Herramienta: El Mapa de Incentivos</h3>
        <p>La mayoría de los problemas institucionales no son de "gente mala" sino de <strong>incentivos mal diseñados</strong>. Para cada actor, preguntate:</p>
        <ul>
          <li>¿Qué gana si hace bien su trabajo?</li>
          <li>¿Qué pierde si lo hace mal?</li>
          <li>¿Es más fácil/rentable/seguro hacer las cosas bien o mal?</li>
        </ul>
        <p><strong>Ejemplo:</strong> Un juez no tiene incentivo para resolver causas rápido. Más causas abiertas = más presupuesto pedido. No hay penalización por demora. El sistema premia la lentitud. El problema no es "los jueces son vagos" sino que el diseño institucional no premia la eficiencia.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Elegí un trámite que hayas hecho ante el Estado argentino (renovar el DNI, sacar turno en un hospital público, inscribirte en algo). Aplicá el mapa de incentivos: ¿qué gana el empleado público si te atiende rápido? ¿Qué pierde si te atiende mal? ¿El sistema premia la eficiencia o la burocracia?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Herramienta: El Análisis Comparado</h3>
        <p>Antes de inventar la rueda, mirá cómo resolvieron el mismo problema en otros lugares:</p>
        <ul>
          <li>Otras provincias argentinas que funcionan mejor</li>
          <li>Otros países de la región con contexto similar</li>
          <li>Países modelo en ese tema específico</li>
          <li>Experiencias históricas (qué se probó antes y por qué funcionó o no)</li>
        </ul>
        <h3>Ejercicio</h3>
        <p>Elegí una institución que te frustra (puede ser desde la AFIP hasta el registro civil de tu municipio). Aplicá las 5 preguntas y el mapa de incentivos. ¿Cambia tu diagnóstico comparado con tu queja inicial?</p>
        <blockquote>"Un buen diagnóstico es la mitad de la solución. La mayoría de las propuestas fallan no por falta de creatividad sino por falta de comprensión del problema."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Diseño de Políticas Públicas: Los Fundamentos',
      description: 'Principios básicos para diseñar políticas públicas efectivas.',
      content: `
        <h2>No Es Magia: Es Diseño</h2>
        <p>Una política pública es una <strong>intervención deliberada del Estado para resolver un problema colectivo</strong>. Puede ser una ley, un programa, una regulación, un incentivo. Diseñarla bien requiere método, no solo buenas intenciones.</p>
        <h3>Los Componentes de una Política Pública</h3>
        <ol>
          <li><strong>Problema definido:</strong> ¿Qué problema específico resuelve? Cuanto más preciso el problema, mejor la solución.</li>
          <li><strong>Población objetivo:</strong> ¿A quiénes beneficia? ¿Cuántas personas? ¿Dónde están?</li>
          <li><strong>Instrumento:</strong> ¿Qué herramienta usa? Regulación (prohibir/obligar), incentivo económico (subsidio/impuesto), provisión directa (servicio público), información (campaña).</li>
          <li><strong>Presupuesto:</strong> ¿Cuánto cuesta? ¿De dónde sale la plata?</li>
          <li><strong>Indicadores de éxito:</strong> ¿Cómo sabemos si funciona? ¿Qué medimos?</li>
          <li><strong>Mecanismo de evaluación:</strong> ¿Quién evalúa y cada cuánto?</li>
        </ol>
        <h3>Errores Comunes en el Diseño</h3>
        <ul>
          <li><strong>Solución en busca de problema:</strong> "Tenemos esta herramienta y la vamos a usar" en vez de "tenemos este problema, ¿cuál es la mejor herramienta?"</li>
          <li><strong>Ignorar efectos secundarios:</strong> Toda política tiene efectos no deseados. Anticiparlos es parte del diseño.</li>
          <li><strong>No escuchar a los afectados:</strong> Diseñar desde un escritorio sin hablar con quienes van a vivir la política.</li>
          <li><strong>No medir:</strong> Si no tenés indicadores, no sabés si funciona. Y si no sabés si funciona, no podés mejorarla.</li>
          <li><strong>Diseñar para el gobierno, no para el ciudadano:</strong> La política debe simplificar la vida del ciudadano, no la del funcionario.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en la AUH (Asignación Universal por Hijo) o en algún plan social que conozcas. Usando los 6 componentes de una política pública que acabás de leer, ¿podés identificar cuál es su problema definido, su población objetivo y sus indicadores de éxito? ¿Sabés si se evalúa periódicamente?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>El Ciclo de la Política Pública</h3>
        <p>Identificación del problema → Diseño de alternativas → Selección → Implementación → Evaluación → Ajuste → Vuelta al inicio.</p>
        <p>En Argentina, el ciclo suele romperse en la evaluación: se implementan políticas y nunca se evalúan. O se evalúan y se ignoran los resultados porque cambió el gobierno.</p>
        <blockquote>"Una buena política pública se parece más a un experimento científico que a un discurso político: tiene hipótesis, tiene método, se mide y se ajusta. Lo contrario es tirar plata al aire y rezar."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Redacción de Proyectos Legislativos',
      description: 'Cómo se estructura y redacta un proyecto de ley u ordenanza.',
      content: `
        <h2>Escribir la Regla del Juego</h2>
        <p>Una ley no es un deseo. Es un <strong>instrumento técnico</strong> que crea derechos, obligaciones, procedimientos e instituciones. Redactar un proyecto de ley (o de ordenanza municipal) requiere precisión, conocimiento del marco legal existente, y la capacidad de anticipar cómo se va a aplicar en la práctica.</p>
        <h3>Estructura de un Proyecto de Ley</h3>
        <ol>
          <li><strong>Título:</strong> Nombre corto y descriptivo. "Proyecto de Ley de Presupuesto Participativo Municipal."</li>
          <li><strong>Fundamentos:</strong> La exposición de motivos. ¿Por qué es necesaria esta ley? Datos, argumentos, referencias a legislación comparada. Es la parte narrativa que convence.</li>
          <li><strong>Articulado:</strong> El cuerpo de la ley, dividido en artículos. Cada artículo es una disposición específica.</li>
          <li><strong>Disposiciones transitorias:</strong> Cómo se implementa la transición del sistema actual al nuevo.</li>
          <li><strong>Cláusula de vigencia:</strong> Cuándo empieza a regir.</li>
        </ol>
        <h3>Tips para Redacción</h3>
        <ul>
          <li><strong>Sé específico:</strong> "El municipio deberá publicar su presupuesto" es vago. "El municipio deberá publicar su presupuesto en formato de datos abiertos en su sitio web oficial dentro de los 30 días de aprobado" es preciso.</li>
          <li><strong>Definí términos:</strong> Si usás conceptos técnicos, definilos en un artículo de definiciones.</li>
          <li><strong>Establecé autoridad de aplicación:</strong> ¿Quién hace cumplir la ley? Sin autoridad de aplicación, la ley es decorativa.</li>
          <li><strong>Incluí sanciones:</strong> ¿Qué pasa si no se cumple? Sin sanciones, la ley es una sugerencia.</li>
          <li><strong>Revisá la constitucionalidad:</strong> Tu proyecto no puede contradecir la Constitución ni leyes de rango superior.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en un problema de tu barrio o municipio que podría resolverse con una ordenanza (falta de iluminación, basurales, falta de rampas de accesibilidad). Intentá redactar mentalmente los primeros 3 artículos: ¿qué se obliga a hacer, quién es la autoridad de aplicación, y qué pasa si no se cumple?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>¿Necesitás Ser Abogado?</h3>
        <p>Para la redacción técnica final, conviene tener asesoramiento legal. Pero el <strong>diseño conceptual</strong> puede (y debe) venir de los ciudadanos. Muchas organizaciones civiles tienen abogados que ayudan a traducir propuestas ciudadanas en texto legal.</p>
        <h3>Ejemplo: Proyecto de Ordenanza de Transparencia Municipal</h3>
        <p>Art. 1: Todo acto administrativo del municipio de [nombre] será publicado en el sitio web oficial dentro de las 48hs de su emisión.<br>
        Art. 2: El presupuesto municipal y su ejecución serán publicados mensualmente en formato de datos abiertos.<br>
        Art. 3: Toda contratación superior a [monto] será publicada con 15 días de anticipación para observaciones ciudadanas.<br>
        Art. 4: El incumplimiento constituirá falta grave del funcionario responsable.</p>
        <blockquote>"Cada ciudadano que escribe un proyecto de ley, por imperfecto que sea, está ejerciendo soberanía. No necesitás ser legislador para legislar. Necesitás una idea, método y el coraje de proponerla."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Coaliciones Transversales: Construir Poder sin Partido',
      description: 'Cómo construir alianzas amplias para impulsar cambios institucionales.',
      content: `
        <h2>Solo No Podés, Pero No Necesitás un Partido</h2>
        <p>Una propuesta ciudadana individual es fácil de ignorar. Una propuesta respaldada por una <strong>coalición amplia y diversa</strong> es un hecho político que nadie puede descartar. Construir coaliciones es el arte de juntar gente que puede no estar de acuerdo en todo pero sí en algo específico.</p>
        <h3>¿Qué Es una Coalición Transversal?</h3>
        <p>Una alianza de actores diversos (ONGs, gremios, empresas, universidades, medios, vecinos, legisladores) que se unen alrededor de un <strong>objetivo concreto y limitado</strong>. No es un partido político. No es un frente electoral. Es una alianza de propósito.</p>
        <h3>Cómo Construirla</h3>
        <ol>
          <li><strong>Definí el objetivo concreto:</strong> "Aprobar la ordenanza de presupuesto participativo en nuestra ciudad." Cuanto más específico, más fácil sumar aliados.</li>
          <li><strong>Mapeá aliados potenciales:</strong> ¿A quién le conviene este cambio? Vecinos, comerciantes, organizaciones, medios locales, concejales de diferentes partidos.</li>
          <li><strong>Buscá el "mínimo común":</strong> No necesitás que todos estén de acuerdo en todo. Solo en el objetivo específico.</li>
          <li><strong>Asigná roles:</strong> Alguien comunica, alguien hace lobby legislativo, alguien moviliza vecinos, alguien aporta expertise técnica.</li>
          <li><strong>Mantené la cohesión:</strong> Reuniones regulares, comunicación clara, celebración de logros parciales.</li>
        </ol>
        <h3>Aliados Inesperados</h3>
        <p>Las coaliciones más efectivas incluyen aliados que <strong>sorprenden</strong>:</p>
        <ul>
          <li>Un empresario local que quiere transparencia en las contrataciones (porque le ganaron licitaciones con fraude).</li>
          <li>Un concejal de la oposición que busca un logro para mostrar.</li>
          <li>Un medio local que necesita contenido y le interesa cubrir la campaña.</li>
          <li>Una universidad que puede aportar datos y análisis técnico.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Elegí una causa que te importe en tu comunidad (puede ser una plaza, más seguridad, transparencia municipal). Listá 5 aliados potenciales de sectores distintos: ¿un comerciante? ¿un docente? ¿un medio local? ¿un concejal? ¿Cuál sería el "mínimo común" que los una a todos?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Errores a Evitar</h3>
        <ul>
          <li><strong>Partidizar:</strong> Si la propuesta se identifica con un partido, los otros se oponen automáticamente.</li>
          <li><strong>Personalizar:</strong> La coalición es más grande que cualquier líder individual.</li>
          <li><strong>Maximizar:</strong> Mejor un cambio pequeño logrado que un cambio enorme bloqueado.</li>
        </ul>
        <blockquote>"El poder ciudadano no está en un individuo brillante sino en una red de personas comprometidas con un objetivo común. La coalición transversal es la herramienta del Hombre Gris: construir poder sin necesitar un partido."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Iniciativa Popular: Proyectos de Ley Ciudadanos',
      description: 'Cómo usar el mecanismo constitucional de iniciativa popular.',
      content: `
        <h2>El Congreso Es Tuyo: Usalo</h2>
        <p>El artículo 39 de la Constitución establece la <strong>iniciativa popular</strong>: los ciudadanos pueden presentar proyectos de ley al Congreso Nacional. El Congreso está obligado a tratarlos dentro de los 12 meses. Es el mecanismo más directo de legislación ciudadana y casi nadie lo usa.</p>
        <h3>Cómo Funciona</h3>
        <ol>
          <li><strong>Redactar el proyecto:</strong> Con articulado y fundamentos (como vimos en la lección 4).</li>
          <li><strong>Juntar firmas:</strong> Se necesita el 1.5% del padrón electoral nacional (aproximadamente 500.000 firmas). Las firmas deben representar al menos 6 distritos electorales.</li>
          <li><strong>Presentar ante la Cámara de Diputados:</strong> Con las firmas verificadas por la Justicia Electoral.</li>
          <li><strong>Tratamiento obligatorio:</strong> El Congreso tiene 12 meses para tratarlo.</li>
        </ol>
        <h3>Limitaciones</h3>
        <ul>
          <li>No se pueden presentar proyectos sobre reforma constitucional, tratados internacionales, tributos, presupuesto ni materia penal.</li>
          <li>500.000 firmas es un número alto (aunque campañas digitales lo hacen más alcanzable).</li>
          <li>El Congreso debe tratarlo pero no está obligado a aprobarlo.</li>
        </ul>
        <h3>A Nivel Municipal: Más Accesible</h3>
        <p>Muchos municipios tienen mecanismos de iniciativa popular con <strong>requisitos mucho menores</strong>. En algunos municipios, con unos cientos de firmas podés presentar un proyecto al Concejo Deliberante. Investigá las reglas de tu municipio.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Si tuvieras que juntar firmas en tu barrio para una iniciativa popular municipal, ¿qué tema elegirías que genere consenso amplio entre vecinos de distintas edades y orientaciones políticas? ¿Dónde juntarías las firmas: en la plaza, en el club, en la puerta de una escuela?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Casos Exitosos</h3>
        <ul>
          <li><strong>Ley de Hambre Cero (2002):</strong> Una iniciativa popular impulsó legislación alimentaria después de la crisis de 2001.</li>
          <li><strong>Iniciativas municipales:</strong> Decenas de ordenanzas sobre ambiente, transparencia y participación nacieron de iniciativas vecinales.</li>
        </ul>
        <h3>El Valor Más Allá del Resultado</h3>
        <p>Incluso si tu proyecto no se aprueba, el proceso de juntar firmas <strong>construye comunidad, visibiliza el tema y presiona a los legisladores</strong>. La iniciativa popular es tanto herramienta legislativa como herramienta de organización ciudadana.</p>
        <blockquote>"La Constitución te dio el derecho de legislar. No como diputado: como ciudadano. Cada firma es un voto de confianza en la democracia directa. Usá ese derecho."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Presupuesto Participativo: Diseñar la Inversión Local',
      description: 'Cómo funciona y cómo implementar el presupuesto participativo.',
      content: `
        <h2>Los Vecinos Deciden En Qué Se Gasta</h2>
        <p>El <strong>presupuesto participativo</strong> es un mecanismo donde los vecinos deciden directamente en qué se invierte una parte del presupuesto municipal. No opinan: <strong>deciden</strong>. Es una de las innovaciones democráticas más exitosas del mundo, nacida en Porto Alegre (Brasil) en 1989.</p>
        <h3>Cómo Funciona</h3>
        <ol>
          <li><strong>El municipio asigna una porción del presupuesto</strong> (usualmente 5-15%) para que los vecinos decidan.</li>
          <li><strong>Los vecinos proponen proyectos:</strong> En asambleas barriales o plataformas digitales. "Queremos una plaza en la esquina de X." "Necesitamos semáforos en tal cruce."</li>
          <li><strong>Los proyectos se evalúan técnicamente:</strong> El municipio verifica viabilidad y costo.</li>
          <li><strong>Los vecinos votan:</strong> Cada vecino elige qué proyectos priorizar.</li>
          <li><strong>Los proyectos ganadores se ejecutan:</strong> Con seguimiento ciudadano.</li>
        </ol>
        <h3>¿Funciona en Argentina?</h3>
        <p>Sí. Más de 50 municipios argentinos tienen alguna forma de presupuesto participativo. La Ciudad de Buenos Aires lo implementa desde 2002 (con vaivenes). Rosario fue pionera. Muchos municipios del interior lo usan exitosamente.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Si tu municipio te diera $50 millones para invertir en tu barrio y los vecinos tuvieran que votar entre 5 proyectos, ¿cuáles propondrías vos? ¿Cómo harías para que participen vecinos que normalmente no se involucran en nada comunitario?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Los Beneficios</h3>
        <ul>
          <li><strong>Decisiones mejores:</strong> Los vecinos saben mejor que nadie qué necesita su barrio.</li>
          <li><strong>Transparencia:</strong> Cuando los vecinos deciden, controlan. Saben exactamente cuánto se asignó y qué se hizo.</li>
          <li><strong>Educación cívica:</strong> Participar en el presupuesto enseña cómo funciona el Estado.</li>
          <li><strong>Legitimidad:</strong> Las obras decididas por los vecinos no generan rechazo.</li>
        </ul>
        <h3>Si Tu Municipio No Lo Tiene</h3>
        <p>Podés impulsar su implementación:</p>
        <ol>
          <li>Investigá experiencias exitosas en municipios similares al tuyo.</li>
          <li>Redactá un proyecto de ordenanza (o adaptá uno existente).</li>
          <li>Construí una coalición de vecinos, organizaciones y concejales.</li>
          <li>Presentalo al Concejo Deliberante.</li>
        </ol>
        <blockquote>"El presupuesto participativo es la prueba de que la democracia directa funciona. No es utopía: funciona en decenas de ciudades argentinas. Si en tu ciudad no existe, podés ser vos quien lo implemente."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Tecnología Cívica: Herramientas Digitales para el Cambio',
      description: 'Plataformas y herramientas digitales para la participación y el control.',
      content: `
        <h2>La Tecnología al Servicio de la Democracia</h2>
        <p>La tecnología cívica ("civic tech") es el uso de herramientas digitales para <strong>mejorar la participación ciudadana, la transparencia y la rendición de cuentas</strong>. Argentina tiene un ecosistema de civic tech creciente que está creando herramientas poderosas.</p>
        <h3>Plataformas de Participación</h3>
        <ul>
          <li><strong>Consul/Decidim:</strong> Plataformas de código abierto usadas por muchos municipios para presupuesto participativo, propuestas ciudadanas y consultas. Buenos Aires usa Consul.</li>
          <li><strong>Change.org / Avaaz:</strong> Plataformas de peticiones online. No son vinculantes pero generan presión pública.</li>
          <li><strong>DemocracyOS:</strong> Plataforma argentina (creada por el Partido de la Red) para deliberación online sobre proyectos de ley.</li>
        </ul>
        <h3>Herramientas de Control</h3>
        <ul>
          <li><strong>Cargografías (cargografias.org):</strong> Mapea las trayectorias de funcionarios públicos. ¿De dónde viene tu intendente? ¿Qué cargos tuvo?</li>
          <li><strong>Directorio Legislativo:</strong> Seguimiento de actividad parlamentaria. Qué votan tus legisladores, cuánto trabajan.</li>
          <li><strong>Chequeado:</strong> Verificación de datos y declaraciones de funcionarios.</li>
          <li><strong>Dónde van mis impuestos (CIPPEC):</strong> Visualización del presupuesto nacional.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Entrá mentalmente a cargografias.org o a Directorio Legislativo. ¿Sabés quién es tu diputado nacional? ¿Y tu senador? ¿Y tus concejales? Si no lo sabés, anotá buscarlo apenas termines esta lección. Es el primer paso del control ciudadano digital.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Herramientas para Crear</h3>
        <ul>
          <li><strong>Datawrapper:</strong> Crear visualizaciones de datos sin programar.</li>
          <li><strong>Canva:</strong> Diseño gráfico accesible para campañas.</li>
          <li><strong>Google Forms:</strong> Encuestas y recolección de datos barriales.</li>
          <li><strong>Ushahidi:</strong> Mapeo colaborativo de problemas o incidentes.</li>
        </ul>
        <h3>Construir Tu Propia Herramienta</h3>
        <p>Si sabés programar (o conocés a alguien que sepa), podés crear herramientas cívicas específicas para tu comunidad:</p>
        <ul>
          <li>Un bot de Telegram que avise de sesiones del Concejo Deliberante.</li>
          <li>Un mapa interactivo de problemas del barrio.</li>
          <li>Un dashboard que muestre la ejecución presupuestaria de tu municipio.</li>
        </ul>
        <blockquote>"La tecnología no reemplaza la participación: la amplifica. Un ciudadano con un celular y las herramientas correctas puede hacer más control que toda una oficina de auditoría del siglo pasado."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Comunicar Tu Propuesta: De la Idea al Apoyo Público',
      description: 'Cómo comunicar propuestas institucionales para generar apoyo.',
      content: `
        <h2>La Mejor Propuesta del Mundo No Sirve Si Nadie la Conoce</h2>
        <p>Podés tener la propuesta más brillante, técnicamente perfecta y constitucionalmente impecable. Si no sabés <strong>comunicarla de manera que la gente la entienda y la apoye</strong>, va a morir en un cajón. Comunicar la propuesta es tan importante como diseñarla.</p>
        <h3>El Elevator Pitch de Tu Propuesta</h3>
        <p>Necesitás poder explicar tu propuesta en <strong>30 segundos</strong>. Formato:</p>
        <ol>
          <li><strong>El problema:</strong> "¿Sabías que el municipio gasta $X en publicidad pero no tiene ambulancia?"</li>
          <li><strong>La solución:</strong> "Queremos que los vecinos decidan en qué se gasta el 10% del presupuesto."</li>
          <li><strong>El pedido:</strong> "¿Nos firmás el apoyo para que se trate en el Concejo?"</li>
        </ol>
        <h3>Adaptá el Mensaje a la Audiencia</h3>
        <ul>
          <li><strong>Para vecinos:</strong> Beneficios concretos y cercanos. "Vos vas a poder elegir si se arregla tu calle o se hace una plaza."</li>
          <li><strong>Para concejales:</strong> Viabilidad legal y precedentes exitosos. "53 municipios argentinos ya lo implementaron con éxito."</li>
          <li><strong>Para medios:</strong> La historia humana detrás de la propuesta. "Marta juntó 500 firmas porque quiere que sus nietos tengan una plaza."</li>
          <li><strong>Para empresarios:</strong> Eficiencia y transparencia. "El presupuesto participativo reduce la corrupción y mejora la asignación de recursos."</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Elegí una propuesta que te interese (puede ser presupuesto participativo, transparencia, o cualquier mejora local). Ahora escribí tu "elevator pitch" de 30 segundos usando el formato problema-solución-pedido. ¿Podrías convencer a un vecino desinteresado en la cola del supermercado?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Canales de Comunicación</h3>
        <ol>
          <li><strong>Redes sociales:</strong> Contenido visual, historias personales, datos impactantes.</li>
          <li><strong>Medios locales:</strong> Nota de prensa, entrevistas, columna de opinión.</li>
          <li><strong>Puerta a puerta:</strong> En el barrio, la conversación cara a cara sigue siendo lo más efectivo.</li>
          <li><strong>Eventos públicos:</strong> Charlas, debates, presentaciones en clubes y sociedades de fomento.</li>
          <li><strong>Lobby directo:</strong> Reuniones con concejales y funcionarios. Uno a uno, con datos en mano.</li>
        </ol>
        <blockquote>"Una propuesta sin comunicación es un árbol que cae en el bosque sin que nadie lo escuche. Aprendé a comunicar con la misma rigurosidad con la que diseñás."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Propuesta Institucional: Proyecto Final',
      description: 'Diseñar una propuesta institucional concreta y un plan para implementarla.',
      content: `
        <h2>Tu Turno: Diseñá Tu Propuesta</h2>
        <p>Este es el momento de integrar todo lo que aprendiste. Vas a diseñar una <strong>propuesta institucional real</strong> para tu comunidad. No un ejercicio teórico: algo que puedas presentar efectivamente.</p>
        <h3>Paso 1: Elegí el Problema</h3>
        <p>Elegí un problema institucional concreto de tu municipio o provincia. Algunos ejemplos:</p>
        <ul>
          <li>No hay presupuesto participativo.</li>
          <li>No se publican los datos de contrataciones.</li>
          <li>No hay audiencias públicas antes de decisiones importantes.</li>
          <li>La Defensoría del Pueblo está vacante o inactiva.</li>
          <li>Los trámites municipales son innecesariamente complejos.</li>
        </ul>
        <h3>Paso 2: Diagnosticá</h3>
        <ul>
          <li>¿Por qué existe este problema? (5 preguntas del diagnóstico institucional)</li>
          <li>¿A quién afecta más?</li>
          <li>¿Cómo se resolvió en otros lugares?</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Antes de seguir con el diseño de la solución, frená un momento. ¿Tu diagnóstico del problema incluye el mapa de incentivos de los actores involucrados? ¿Investigaste al menos 2 casos comparados (otro municipio argentino, otro país) donde se haya resuelto algo similar? Si no, hacelo ahora: un diagnóstico incompleto lleva a una propuesta débil.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Paso 3: Diseñá la Solución</h3>
        <ul>
          <li>¿Qué proponés específicamente? (proyecto de ordenanza, política pública, reforma)</li>
          <li>¿Cuáles son los costos y beneficios?</li>
          <li>¿Qué efectos secundarios podría tener?</li>
        </ul>
        <h3>Paso 4: Planificá la Implementación</h3>
        <ul>
          <li>¿Quiénes son tus aliados potenciales?</li>
          <li>¿Qué canal vas a usar? (iniciativa popular, lobby legislativo, campaña mediática)</li>
          <li>¿Cuál es tu timeline?</li>
          <li>¿Cómo vas a comunicar la propuesta?</li>
        </ul>
        <h3>Paso 5: Empezá</h3>
        <p>No esperes a que la propuesta sea perfecta. La mejor propuesta es la que se presenta. Podés mejorarla en el camino con feedback de aliados, expertos y la comunidad.</p>
        <h3>Tu Compromiso Final</h3>
        <blockquote>"Terminaste este curso con herramientas que el 99% de los ciudadanos no tiene. Sabés diagnosticar problemas institucionales, diseñar soluciones, redactar proyectos, construir coaliciones y comunicar propuestas. Eso te hace peligroso para el status quo y valioso para tu comunidad. No desperdicies ese poder. Elegí UN problema, diseñá UNA propuesta, y empezá a trabajar. El Hombre Gris no espera que el sistema cambie: lo rediseña."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 18, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 25');

  const existingQuiz25 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz25.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz25[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz25] = await db.insert(courseQuizzes).values({
    courseId, title: 'Quiz: Diseño de Instituciones', description: 'Evaluá tu capacidad para diseñar propuestas institucionales.',
    passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3,
  }).returning();

  const questions25 = [
    { quizId: quiz25.id, question: '¿Cuál es el primer paso del framework del diseñador institucional?', type: 'multiple_choice' as const, options: JSON.stringify(['Proponer una solución', 'Diagnosticar el problema', 'Juntar firmas', 'Comunicar la propuesta']), correctAnswer: JSON.stringify(1), explanation: 'El diagnóstico riguroso es la base de toda propuesta efectiva.', points: 2, orderIndex: 1 },
    { quizId: quiz25.id, question: 'La mayoría de los problemas institucionales se deben a personas malas, no a incentivos mal diseñados.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Los problemas institucionales suelen ser resultado de incentivos mal diseñados que producen malos comportamientos.', points: 1, orderIndex: 2 },
    { quizId: quiz25.id, question: '¿Qué es una coalición transversal?', type: 'multiple_choice' as const, options: JSON.stringify(['Un partido político', 'Una alianza de actores diversos unidos por un objetivo concreto', 'Un sindicato', 'Una organización gubernamental']), correctAnswer: JSON.stringify(1), explanation: 'La coalición transversal une actores diversos que pueden no estar de acuerdo en todo pero sí en un objetivo específico.', points: 2, orderIndex: 3 },
    { quizId: quiz25.id, question: '¿Cuántas firmas se necesitan aproximadamente para una iniciativa popular nacional?', type: 'multiple_choice' as const, options: JSON.stringify(['1.000', '50.000', '500.000 (1.5% del padrón)', '5.000.000']), correctAnswer: JSON.stringify(2), explanation: 'La iniciativa popular requiere el 1.5% del padrón electoral, aproximadamente 500.000 firmas de al menos 6 distritos.', points: 2, orderIndex: 4 },
    { quizId: quiz25.id, question: 'El presupuesto participativo permite a los vecinos opinar sobre el gasto pero no decidir.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'En el presupuesto participativo, los vecinos DECIDEN directamente en qué se invierte una porción del presupuesto.', points: 1, orderIndex: 5 },
    { quizId: quiz25.id, question: '¿Qué componente es esencial en un proyecto de ley para que no sea "decorativo"?', type: 'multiple_choice' as const, options: JSON.stringify(['Un título creativo', 'Autoridad de aplicación y sanciones por incumplimiento', 'Muchos artículos', 'Referencias a leyes extranjeras']), correctAnswer: JSON.stringify(1), explanation: 'Sin autoridad de aplicación y sanciones, una ley es solo una declaración de buenas intenciones.', points: 2, orderIndex: 6 },
    { quizId: quiz25.id, question: 'DemocracyOS es una plataforma argentina de civic tech para deliberación online.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'DemocracyOS fue creada en Argentina por el Partido de la Red para permitir deliberación ciudadana sobre proyectos de ley.', points: 1, orderIndex: 7 },
    { quizId: quiz25.id, question: '¿Cuál es la diferencia clave entre quejarse y proponer?', type: 'multiple_choice' as const, options: JSON.stringify(['Quejarse es más fácil', 'Proponer requiere diagnóstico, diseño, validación y un plan de implementación', 'Proponer requiere título universitario', 'No hay diferencia real']), correctAnswer: JSON.stringify(1), explanation: 'Proponer requiere un proceso riguroso de diagnóstico, investigación, diseño y planificación.', points: 2, orderIndex: 8 },
  ];

  for (const q of questions25) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz with', questions25.length, 'questions for course 25');
}

async function main() {
  console.log('Seeding Road 1: La República Inteligente...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) {
      console.log('No users found. Please create a user first.');
      return;
    }
    const authorId = author.id;
    console.log('Using author ID:', authorId, 'Username:', author.username);

    await seedCourse23(authorId);
    await seedCourse24(authorId);
    await seedCourse25(authorId);

    console.log('Road 1: La República Inteligente seeding complete!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
