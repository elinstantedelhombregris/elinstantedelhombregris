import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse29(authorId: number) {
  console.log('--- Course 29: Argentina 1810-1945 ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'argentina-1810-1945-sistema-que-construimos')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Argentina 1810-1945: El Sistema que Construimos',
      slug: 'argentina-1810-1945-sistema-que-construimos',
      description: 'Comprende la historia argentina desde 1810 hasta 1945 como transiciones de sistema. La independencia como cambio de régimen, el período caudillista, la arquitectura de la Generación del 80, y la llegada de Perón.',
      excerpt: 'La historia argentina desde la independencia hasta Perón, vista como dinámica de sistemas.',
      category: 'hombre-gris',
      level: 'intermediate',
      duration: 200,
      thumbnailUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      orderIndex: 29,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 29:', course[0].title);
  } else {
    console.log('Found existing course 29:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'La Revolución de Mayo: Cuando el Sistema Cambió de Manos',
      description: 'La independencia como cambio de régimen analizada desde el pensamiento sistémico.',
      content: `
        <h2>Un Cambio de Operador, No de Sistema</h2>
        <p>La Revolución de Mayo de 1810 suele enseñarse como el glorioso nacimiento de una nación libre. Pero desde el pensamiento sistémico, lo que ocurrió fue algo más sutil y revelador: <strong>cambió quién operaba el sistema, pero el sistema en sí permaneció casi intacto</strong>.</p>
        <p>El virreinato era una máquina extractiva: sacaba recursos del territorio y los enviaba a la metrópoli. Después de 1810, los recursos dejaron de ir a España... pero la lógica extractiva, la concentración de poder en Buenos Aires y la estructura social jerárquica <strong>se mantuvieron</strong>.</p>
        <h3>El Contexto Sistémico</h3>
        <p>Para entender Mayo, hay que ver el sistema completo:</p>
        <ul>
          <li><strong>Napoleón invade España (1808):</strong> El rey Fernando VII es capturado. Sin rey legítimo, ¿a quién obedecen las colonias?</li>
          <li><strong>La doctrina de la retroversión de la soberanía:</strong> Si el rey no puede gobernar, el poder vuelve al pueblo. Una idea revolucionaria que los criollos usaron como palanca legal.</li>
          <li><strong>Los intereses comerciales:</strong> Los comerciantes criollos querían comercio libre con Inglaterra, no el monopolio español. La revolución fue también un cambio de socio comercial.</li>
          <li><strong>La élite criolla vs. los peninsulares:</strong> La pelea no era "pueblo vs. corona" sino "élite local vs. élite española" por quién controlaba los recursos.</li>
        </ul>
        <h3>La Primera Junta: Un Gobierno de Abogados y Militares</h3>
        <p>La Primera Junta tenía 9 miembros: abogados, militares y un sacerdote. No había representación de pueblos originarios, de las masas populares ni del interior profundo. <strong>El nuevo sistema reproducía la concentración de poder del anterior, solo que ahora los operadores eran locales.</strong></p>
        <h3>La Pregunta Sistémica</h3>
        <blockquote>"Si cambias al conductor pero no cambias la ruta, ¿realmente cambiaste algo? Mayo fue el primer cambio de conductor de Argentina. Entender esto es entender por qué tantas revoluciones posteriores produjeron resultados similares."</blockquote>
        <h3>Para Reflexionar</h3>
        <p>¿Cuántas veces en la historia argentina posterior veremos el mismo patrón? Un grupo desplaza a otro del poder, promete cambios profundos, pero mantiene la estructura de fondo. Este es el primer patrón que debemos aprender a reconocer.</p>
      `,
      orderIndex: 1, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Las Guerras de Independencia: El Precio de Nacer',
      description: 'Los costos humanos, económicos y políticos de forjar una nación por las armas.',
      content: `
        <h2>La Libertad No Fue Gratis</h2>
        <p>Entre 1810 y 1824, las Provincias Unidas del Río de la Plata pelearon una guerra brutal en múltiples frentes. San Martín cruzó los Andes, Belgrano combatió en el norte, Güemes resistió las invasiones realistas desde Salta. Pero detrás de la épica militar hay una historia sistémica que marcó al país para siempre.</p>
        <h3>Los Costos del Nacimiento</h3>
        <ul>
          <li><strong>Humano:</strong> Miles de muertos en batallas, epidemias y hambruna. Las provincias del norte fueron las que más sangre pusieron y las que menos poder recibieron después.</li>
          <li><strong>Económico:</strong> Las guerras se financiaron con confiscaciones, empréstitos forzosos y emisión de deuda. El primer préstamo externo de Argentina (Baring Brothers, 1824) se tomó para financiar la guerra y la infraestructura... y se gastó mal. Tardamos más de 80 años en pagarlo.</li>
          <li><strong>Institucional:</strong> La urgencia militar impuso una lógica de mando vertical que contaminó la política civil. El caudillo militar como líder natural es un patrón que nace aquí.</li>
        </ul>
        <h3>San Martín vs. Rivadavia: Dos Lógicas en Conflicto</h3>
        <p>San Martín representaba la lógica militar-continental: liberar Sudamérica era la prioridad. Rivadavia representaba la lógica comercial-porteña: modernizar Buenos Aires y conectarla con Europa. Este conflicto entre <strong>proyecto nacional y proyecto porteño</strong> es un patrón fundacional que nunca se resolvió.</p>
        <h3>La Declaración de Independencia (1816)</h3>
        <p>El Congreso de Tucumán declaró la independencia el 9 de julio de 1816. Pero ¿independencia de qué? De España, sí. Pero no se definió qué tipo de país se quería construir: ¿unitario o federal? ¿Monarquía o república? ¿Buenos Aires como capital o un sistema descentralizado? Estas preguntas sin respuesta alimentaron <strong>décadas de guerra civil</strong>.</p>
        <h3>El Patrón que Nace</h3>
        <blockquote>"Argentina nació de una guerra donde las provincias pusieron la sangre y Buenos Aires puso las condiciones. Ese desequilibrio original nunca se saldó."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Anarquía y los Caudillos: Fragmentación como Patrón',
      description: 'La era de los caudillos provinciales vista como fragmentación sistémica.',
      content: `
        <h2>Cuando No Hay Sistema, Manda el Más Fuerte</h2>
        <p>La década de 1820 es conocida como "la anarquía". Después de la caída del Directorio, no había gobierno central. Cada provincia era un Estado casi independiente, gobernada por un <strong>caudillo</strong>: un líder fuerte, carismático, generalmente militar, que concentraba todo el poder local.</p>
        <p>Desde el pensamiento sistémico, la anarquía no fue un "desorden": fue el <strong>estado natural de un sistema sin reglas de coordinación</strong>. Sin constitución, sin instituciones compartidas, sin mecanismos de resolución de conflictos, cada parte del sistema optimizaba para sí misma.</p>
        <h3>Los Grandes Caudillos</h3>
        <ul>
          <li><strong>Estanislao López (Santa Fe):</strong> Defensor del federalismo real, se opuso al centralismo porteño.</li>
          <li><strong>Facundo Quiroga (La Rioja):</strong> La fuerza bruta como sistema de gobierno. Sarmiento lo inmortalizó en "Facundo" como el símbolo de la "barbarie".</li>
          <li><strong>Francisco Ramírez (Entre Ríos):</strong> Se declaró "Supremo Entrerriano". Controló la Mesopotamia hasta que fue derrotado.</li>
          <li><strong>Martín Miguel de Güemes (Salta):</strong> Héroe de la Guerra Gaucha, murió defendiendo el norte. Las élites salteñas lo odiaban porque armaba a los gauchos.</li>
        </ul>
        <h3>Unitarios vs. Federales: La Primera Grieta</h3>
        <p>Este conflicto no era solo ideológico. Era un conflicto de <strong>modelos económicos</strong>:</p>
        <ul>
          <li><strong>Unitarios:</strong> Buenos Aires como centro, comercio libre con Europa, modernización desde arriba. Les convenía el centralismo porque controlaban el puerto y la aduana.</li>
          <li><strong>Federales:</strong> Autonomía provincial, protección de las economías del interior, reparto de los ingresos aduaneros.</li>
        </ul>
        <h3>El Bug Fundacional</h3>
        <p>El caudillismo no es una anomalía: es lo que pasa cuando no hay instituciones. <strong>Donde no hay Estado, emerge un hombre fuerte.</strong> Este patrón se repetirá cada vez que las instituciones argentinas se debiliten: 1930, 1943, 1955, 1966, 1976. Entender el caudillismo original es entender una constante argentina.</p>
        <blockquote>"El caudillo no nace por maldad sino por vacío. Cada vez que Argentina rompió sus instituciones, un caudillo las reemplazó."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Rosas y la Confederación: El Primer Orden Autoritario',
      description: 'Juan Manuel de Rosas como modelo de concentración de poder y sus consecuencias.',
      content: `
        <h2>Orden a Cualquier Precio</h2>
        <p>Juan Manuel de Rosas gobernó Buenos Aires entre 1829 y 1852 (con una interrupción). En su segundo mandato (1835-1852), la Legislatura porteña le otorgó la <strong>"Suma del Poder Público"</strong>: todo el poder ejecutivo, legislativo y judicial en una sola persona. Es la máxima concentración de poder en la historia constitucional argentina.</p>
        <h3>El Sistema Rosista</h3>
        <p>Rosas no era un improvisado. Construyó un <strong>sistema de control</strong> sofisticado:</p>
        <ul>
          <li><strong>La Mazorca:</strong> Una fuerza parapolicial que intimidaba, perseguía y asesinaba opositores. El terror como herramienta de gobierno.</li>
          <li><strong>El uso obligatorio del cintillo punzó:</strong> Todo ciudadano debía usar un distintivo federal rojo. Control simbólico del espacio público.</li>
          <li><strong>Control de la prensa:</strong> Censura total. Solo circulaban medios favorables al gobierno.</li>
          <li><strong>Relaciones exteriores como cortina:</strong> Los bloqueos navales francés (1838-40) e anglo-francés (1845-50) le permitieron presentarse como defensor de la soberanía nacional.</li>
        </ul>
        <h3>La Economía del Rosismo</h3>
        <p>Rosas representaba a los <strong>estancieros bonaerenses</strong>. Su modelo económico era simple: ganadería extensiva para exportación, mínima industrialización, y control de la aduana porteña como fuente de poder. Las provincias del interior se empobrecieron porque Buenos Aires seguía quedándose con los ingresos del puerto.</p>
        <h3>La Generación del 37: La Resistencia Intelectual</h3>
        <p>Sarmiento, Alberdi, Echeverría y otros intelectuales exiliados pensaron el país que vendría después. Desde el exilio, diseñaron las instituciones de la Argentina moderna. Sarmiento escribió "Facundo", Alberdi escribió las "Bases" que inspirarían la Constitución de 1853.</p>
        <h3>Lección Sistémica</h3>
        <blockquote>"Rosas demostró que se puede tener orden sin libertad, estabilidad sin justicia, unidad sin consenso. Argentina aprendió a desconfiar del orden por la fuerza... pero no dejó de buscar líderes fuertes cada vez que el caos amenazaba."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Caseros y la Organización Nacional: Diseñar un País',
      description: 'La Constitución de 1853 como intento de diseño institucional racional.',
      content: `
        <h2>El Primer Intento de Diseño Sistémico</h2>
        <p>El 3 de febrero de 1852, Justo José de Urquiza derrotó a Rosas en la Batalla de Caseros. Lo que siguió fue el momento más cercano que tuvo Argentina a un <strong>diseño institucional consciente</strong>: un grupo de hombres se sentó a escribir las reglas del juego para un país entero.</p>
        <h3>Las "Bases" de Alberdi</h3>
        <p>Juan Bautista Alberdi escribió "Bases y puntos de partida para la organización política de la República Argentina". Es, esencialmente, un <strong>documento de diseño de sistema</strong>:</p>
        <ul>
          <li><strong>"Gobernar es poblar":</strong> Argentina necesitaba inmigrantes europeos para desarrollarse. La constitución debía atraerlos con garantías de libertad.</li>
          <li><strong>Federalismo con centro fuerte:</strong> Provincias autónomas pero un gobierno nacional con poder real. Un equilibrio deliberado.</li>
          <li><strong>Educación como motor:</strong> Una población educada era la precondición de una república funcional.</li>
          <li><strong>Economía abierta:</strong> Libre comercio, protección de la propiedad privada, incentivos a la inversión extranjera.</li>
        </ul>
        <h3>La Constitución de 1853</h3>
        <p>El Congreso Constituyente de Santa Fe produjo una constitución inspirada en la de Estados Unidos y en las ideas de Alberdi. Estableció:</p>
        <ol>
          <li>División de poderes (Ejecutivo, Legislativo, Judicial)</li>
          <li>Sistema federal con provincias autónomas</li>
          <li>Garantías de derechos individuales</li>
          <li>Libre navegación de los ríos interiores</li>
          <li>Nacionalización de la aduana (para terminar con el monopolio porteño)</li>
        </ol>
        <h3>El Problema: Buenos Aires Se Fue</h3>
        <p>Buenos Aires rechazó la Constitución porque perdía el control de la aduana. Se separó de la Confederación durante una década (1852-1862). Tuvo que haber otra batalla (Pavón, 1861) para que se reincorporara... <strong>en sus propios términos</strong>. Buenos Aires impuso un presidente porteño (Mitre) y mantuvo su hegemonía económica.</p>
        <h3>La Lección de Diseño</h3>
        <blockquote>"Argentina tuvo una constitución brillante en el papel pero un problema de implementación: el actor más poderoso del sistema (Buenos Aires) se negó a jugar con las reglas que limitaban su poder. Este patrón de diseño perfecto y implementación defectuosa se repetirá muchas veces."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Generación del 80: La Máquina Agroexportadora',
      description: 'El modelo de la Generación del 80 como sistema diseñado con bugs incorporados.',
      content: `
        <h2>El País Que Supimos Construir (Para Algunos)</h2>
        <p>Entre 1880 y 1916, Argentina vivió su período de mayor crecimiento económico. La "Generación del 80" —una élite de terratenientes, abogados e intelectuales— diseñó un <strong>modelo de país</strong> que convirtió a Argentina en una de las economías más grandes del mundo. También sembraron las semillas de las crisis futuras.</p>
        <h3>La Arquitectura del Modelo</h3>
        <ul>
          <li><strong>Motor económico:</strong> Exportar materias primas (carne, granos, lana) a Europa, especialmente a Gran Bretaña. Importar manufactura e inversión.</li>
          <li><strong>Infraestructura:</strong> Red ferroviaria en forma de abanico centrada en Buenos Aires y el puerto. Cada riel iba de las pampas al puerto. El interior que no producía para exportar quedaba afuera.</li>
          <li><strong>Inmigración masiva:</strong> 6 millones de europeos llegaron entre 1880 y 1930. Transformaron la demografía, la cultura y la economía.</li>
          <li><strong>Educación pública:</strong> La Ley 1420 (1884) estableció educación primaria obligatoria, gratuita y laica. La tasa de analfabetismo cayó del 77% al 35% en una generación.</li>
          <li><strong>Federalización de Buenos Aires (1880):</strong> La ciudad se convirtió en capital federal, separada de la provincia. Un intento de resolver el conflicto Buenos Aires vs. Interior... que no funcionó.</li>
        </ul>
        <h3>Los Bugs del Diseño</h3>
        <p>El modelo de la Generación del 80 tenía <strong>fallas estructurales</strong> que se activarían después:</p>
        <ol>
          <li><strong>Dependencia extrema:</strong> El modelo dependía de un solo cliente (Gran Bretaña) y un solo producto (agro). Cuando el mundo cambió, Argentina no tenía plan B.</li>
          <li><strong>Concentración de la tierra:</strong> La Conquista del Desierto (1879) repartió millones de hectáreas entre pocas familias. Argentina nunca tuvo reforma agraria. La desigualdad quedó impresa en el territorio.</li>
          <li><strong>Exclusión política:</strong> El "orden conservador" gobernaba con fraude electoral. El voto era público y controlado. La mayoría de la población no participaba del sistema político.</li>
          <li><strong>Desequilibrio territorial:</strong> Los ferrocarriles solo servían al modelo exportador. Las provincias que no estaban en la pampa húmeda quedaron marginadas.</li>
        </ol>
        <h3>Argentina Potencia</h3>
        <p>En 1910, Argentina tenía el ingreso per cápita más alto de América Latina y comparable al de muchos países europeos. Buenos Aires era la "París de Sudamérica". Pero la riqueza estaba brutalmente concentrada, y millones de inmigrantes y criollos vivían en conventillos hacinados.</p>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: La Conquista del Desierto Vista desde el Otro Lado</h4>
          <p>Cuando leés sobre la Generación del 80 y su "conquista del desierto", te están contando la historia desde el escritorio de Julio Argentino Roca. Pero ese "desierto" no estaba vacío. Era el territorio de los pueblos <strong>Ranquel, Mapuche, Tehuelche y Vorogano</strong>, que lo habitaban desde hacía siglos con sus propias formas de organización política, económica y espiritual.</p>
          <p>El lonko Panguitruz Guor —a quien los criollos llamaban Mariano Rosas— gobernaba la Confederación Ranquel con un sistema de parlamentos y alianzas que nada tenía de "salvaje". En 1878 escribió al gobierno argentino: <em>"Nosotros no hemos ido a buscarlos a ustedes, ustedes han venido a buscarnos a nosotros."</em> Un año después, la campaña de Roca arrasó su territorio.</p>
          <p>Los números que no aparecen en los manuales: entre 1878 y 1885, más de <strong>14.000 indígenas fueron tomados prisioneros</strong>. Familias enteras fueron separadas. Hombres enviados a trabajos forzados en la zafra tucumana o como sirvientes en Buenos Aires. Mujeres y niños repartidos entre familias criollas como "servicio doméstico" —un eufemismo para trabajo esclavo. El cacique Inacayal fue exhibido vivo en el Museo de La Plata, donde murió en 1888.</p>
          <p>La tierra "ganada" —40 millones de hectáreas— se repartió entre 391 terratenientes. Esa concentración originaria de la propiedad <strong>nunca se revirtió</strong> y es la base de la desigualdad territorial argentina hasta hoy. Cuando te hablan del "granero del mundo", preguntate: ¿granero sobre las cenizas de quién?</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris ve el sistema completo: no hay "progreso" sin preguntarse quién pagó el precio. La Generación del 80 construyó sobre tierra robada, y ese silencio fundacional sigue vibrando en cada conflicto territorial del presente.</p>
        </div>
        <blockquote>"La Generación del 80 construyó un país rico y desigual, conectado al mundo y desconectado de sí mismo, moderno en la superficie y feudal en la estructura. Entender este modelo es entender la Argentina que heredamos."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Inmigración Masiva: El País que Decidimos Ser',
      description: 'Cómo 6 millones de inmigrantes transformaron el sistema argentino.',
      content: `
        <h2>La Mayor Transformación Demográfica del Hemisferio Sur</h2>
        <p>Entre 1880 y 1930, Argentina recibió aproximadamente <strong>6 millones de inmigrantes</strong>, principalmente italianos y españoles, pero también polacos, rusos, sirios, libaneses, judíos y muchos más. En proporción a su población, fue una de las migraciones más masivas de la historia mundial.</p>
        <h3>El Diseño: "Gobernar Es Poblar"</h3>
        <p>La Constitución de 1853 (Art. 25) mandaba al gobierno federal a fomentar la inmigración europea. La Ley Avellaneda (1876) creó un sistema de atracción: pasajes subsidiados, Hotel de Inmigrantes, colonias agrícolas. El <strong>diseño era explícito</strong>: traer europeos para "civilizar" el territorio, proveer mano de obra y transformar la cultura.</p>
        <h3>La Realidad vs. El Plan</h3>
        <ul>
          <li><strong>Se esperaban granjeros;</strong> llegaron también obreros urbanos que se quedaron en Buenos Aires y Rosario.</li>
          <li><strong>Se esperaba que se integraran pasivamente;</strong> trajeron ideas anarquistas, socialistas y sindicalistas que transformaron la política.</li>
          <li><strong>Se esperaban "nórdicos";</strong> la mayoría fueron italianos del sur y españoles pobres, lo que generó desprecio en la élite.</li>
          <li><strong>Se esperaba que ocuparan el campo;</strong> como la tierra ya estaba concentrada en pocas manos, muchos no pudieron acceder a la propiedad y quedaron como arrendatarios o peones.</li>
        </ul>
        <h3>Lo Que Construyeron</h3>
        <p>Los inmigrantes no solo aportaron mano de obra. Transformaron Argentina:</p>
        <ol>
          <li><strong>El idioma:</strong> El lunfardo, el castellano rioplatense, las expresiones italianas que usamos sin pensar.</li>
          <li><strong>La comida:</strong> La pizza, la pasta, las empanadas, la milanesa: toda nuestra gastronomía es mestiza.</li>
          <li><strong>La clase media:</strong> Los hijos de inmigrantes construyeron la clase media argentina a través de la educación pública y el esfuerzo. El ascenso social como promesa.</li>
          <li><strong>El movimiento obrero:</strong> Las primeras huelgas, los primeros sindicatos, las primeras leyes laborales fueron impulsadas por inmigrantes.</li>
          <li><strong>Las cooperativas:</strong> Clubes, mutuales, sociedades de fomento: la trama asociativa argentina nació aquí.</li>
        </ol>
        <h3>Lo Que Se Perdió</h3>
        <p>La ola inmigratoria también tuvo costos. Los pueblos originarios fueron invisibilizados aún más. Los afroargentinos, que habían sido un porcentaje significativo de la población, fueron borrados de la narrativa nacional. La identidad argentina se construyó como "europea" negando sus raíces mestizas e indígenas.</p>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: Los Que Ya Estaban — Desplazamiento Indígena y Borrado Afroargentino</h4>
          <p>Cuando te cuentan la historia de la inmigración como un relato de "crisol de razas", te están ocultando una pregunta fundamental: <strong>¿qué pasó con los que ya estaban ahí?</strong></p>
          <p>Los pueblos originarios que sobrevivieron a la Conquista del Desierto fueron empujados a los márgenes del nuevo orden. Comunidades Qom, Wichí y Mocoví en el Chaco fueron sometidas a trabajo forzado en los ingenios azucareros y obrajes madereros. En 1924, la <strong>Masacre de Napalpí</strong> dejó al menos 200 hombres, mujeres y niños Qom y Mocoví asesinados por la policía y colonos en la reducción de Napalpí, Chaco, por reclamar condiciones de trabajo dignas. El gobernador Fernando Centeno lo ocultó. Los diarios apenas lo mencionaron. Pasaron casi 100 años hasta que la justicia argentina reconoció los hechos como crimen de lesa humanidad (2022).</p>
          <p>Y los afroargentinos — que en el censo de 1778 representaban el <strong>30% de la población</strong> de Buenos Aires y hasta el 50% en provincias como Santiago del Estero y Catamarca — fueron borrados de la narrativa nacional. No "desaparecieron" como dice el mito: fueron invisibilizados. Muchos murieron desproporcionadamente en las guerras de independencia y en la epidemia de fiebre amarilla de 1871, pero sus comunidades sobrevivieron. La escritora afroargentina <strong>Gabino Ezeiza</strong> (1858-1916), considerado el padre de la payada, llenaba teatros en plena era de inmigración europea, pero casi nunca aparece en los libros escolares.</p>
          <p>El relato de que "los argentinos bajamos de los barcos" es una operación de borrado. Cada vez que repetís esa frase, estás participando de la invisibilización de los pueblos originarios y las comunidades afrodescendientes que <strong>siguen acá</strong>, exigiendo reconocimiento.</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris no acepta narrativas incompletas. Si tu identidad se construye borrando a otro, no es identidad: es amnesia deliberada.</p>
        </div>
        <blockquote>"Somos todos hijos o nietos de inmigrantes, pero olvidamos que ellos también fueron rechazados, explotados y discriminados. Recordar eso nos conecta con cualquier persona que hoy busca una vida mejor lejos de su tierra."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: '1912: La Ley Sáenz Peña y el Nacimiento de la Democracia',
      description: 'El voto secreto y obligatorio como transformación del sistema político.',
      content: `
        <h2>Cuando el Sistema Se Abrió</h2>
        <p>Hasta 1912, el sistema político argentino era una <strong>oligarquía disfrazada de república</strong>. Las elecciones existían, pero el voto era público (tu patrón sabía a quién votabas), voluntario (los pobres no participaban) y fraudulento (los caudillos locales manejaban los resultados).</p>
        <p>La Ley Sáenz Peña (1912) cambió las tres cosas de un golpe: voto <strong>secreto, universal masculino y obligatorio</strong>. Fue, quizás, la reforma más importante del sistema político argentino.</p>
        <h3>¿Por Qué un Conservador Amplió la Democracia?</h3>
        <p>Roque Sáenz Peña era presidente conservador. ¿Por qué ampliar el voto si eso significaba perder el poder? Varias razones sistémicas:</p>
        <ul>
          <li><strong>Presión social creciente:</strong> Los radicales de Yrigoyen habían hecho varias revoluciones armadas (1890, 1893, 1905). La inestabilidad era peor que perder una elección.</li>
          <li><strong>Legitimidad internacional:</strong> Argentina quería ser vista como una democracia moderna, no como una oligarquía atrasada.</li>
          <li><strong>Cálculo errado:</strong> Los conservadores creían que podían ganar en elecciones limpias. Se equivocaron.</li>
          <li><strong>Visión de estadista:</strong> Sáenz Peña entendió que un sistema político que excluye a la mayoría es un sistema con fecha de vencimiento.</li>
        </ul>
        <h3>Las Consecuencias</h3>
        <p>En 1916, cuatro años después de la ley, la <strong>Unión Cívica Radical</strong> ganó las elecciones presidenciales con Hipólito Yrigoyen. Por primera vez en la historia argentina, el gobierno cambió de manos a través de elecciones genuinas. La élite conservadora que había gobernado por décadas perdió el poder por la vía democrática.</p>
        <h3>Lo Que Faltó</h3>
        <ul>
          <li><strong>Las mujeres no votaban:</strong> El sufragio femenino llegaría recién en 1947, 35 años después.</li>
          <li><strong>Los pueblos originarios:</strong> Muchos no tenían documentación ni eran considerados ciudadanos plenos.</li>
          <li><strong>El fraude local:</strong> En muchas provincias, el fraude siguió funcionando por décadas más.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: Los Que Siguieron Afuera — Exclusiones Después de la "Universalidad"</h4>
          <p>La Ley Sáenz Peña de 1912 se celebra como el nacimiento de la democracia argentina. Pero <strong>"universal" significaba solo varones argentinos mayores de 18 años</strong>. Esa "universalidad" dejó afuera a más de la mitad de la población adulta del país.</p>
          <p><strong>Las mujeres</strong> tuvieron que esperar 35 años más. Julieta Lanteri, médica y activista, se presentó como candidata a diputada en 1919 — la primera mujer candidata de América Latina — y votó en las elecciones de 1911 usando un vacío legal, ya que la ley de enrolamiento municipal no especificaba sexo. El sistema cerró ese "error" rápidamente. Alicia Moreau de Justo organizó el Primer Congreso Femenino Internacional en Buenos Aires en 1910 y luchó durante décadas hasta que en <strong>1947</strong>, con la Ley 13.010 impulsada por Eva Perón, las mujeres finalmente pudieron votar. En las elecciones de 1951, votaron por primera vez: 3.816.654 mujeres ejercieron ese derecho.</p>
          <p><strong>Los pueblos originarios</strong> enfrentaron una exclusión aún más profunda. Aunque la ley no los excluía explícitamente, en la práctica la falta de documentación, el analfabetismo forzado, las barreras lingüísticas y la ubicación geográfica remota los mantenían fuera del sistema electoral. Los indígenas del Chaco, Formosa y Misiones vivían bajo regímenes de trabajo forzado en reducciones y obrajes donde el patrón decidía todo. Recién con la reforma constitucional de <strong>1994</strong> se reconoció la preexistencia étnica y cultural de los pueblos indígenas, y en muchas comunidades el ejercicio real del voto sigue siendo una lucha.</p>
          <p>Y los inmigrantes — esos millones que el modelo del 80 había traído — <strong>tampoco votaban</strong> si no se nacionalizaban, y muchos no lo hacían. En 1914, el 30% de la población de Buenos Aires era extranjera. Construían el país pero no elegían quién lo gobernaba.</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris desconfía de las palabras grandilocuentes. Cada vez que escuchés "universal", preguntate: ¿universal para quién? La democracia real no se mide por la ley que se escribe sino por quién puede efectivamente ejercerla.</p>
        </div>
        <blockquote>"La Ley Sáenz Peña demuestra que a veces los cambios más profundos vienen de arriba, cuando la élite entiende que mantener el sistema cerrado es más peligroso que abrirlo. Es una lección que Argentina olvida y recuerda cíclicamente."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Yrigoyen y el Radicalismo: La Primera Democracia Popular',
      description: 'El primer gobierno democrático real y sus contradicciones sistémicas.',
      content: `
        <h2>El Pueblo al Poder (Con Asteriscos)</h2>
        <p>Hipólito Yrigoyen fue el primer presidente argentino elegido en elecciones genuinamente democráticas (1916). Representaba a la <strong>clase media emergente</strong> —hijos de inmigrantes, pequeños comerciantes, profesionales— que había sido excluida del poder por la oligarquía.</p>
        <h3>El Estilo Yrigoyenista</h3>
        <p>Yrigoyen creó un estilo de liderazgo que marcaría la política argentina para siempre:</p>
        <ul>
          <li><strong>Personalismo:</strong> El partido era él. No delegaba, no hacía conferencias de prensa, gobernaba desde su casa. El líder como misterio.</li>
          <li><strong>Clientelismo incipiente:</strong> Usó los empleos públicos para premiar a los militantes radicales. El Estado como fuente de empleo político nace aquí.</li>
          <li><strong>Neutralidad internacional:</strong> Mantuvo a Argentina neutral en la Primera Guerra Mundial, una posición popular pero que le ganó enemigos en la élite pro-británica.</li>
          <li><strong>Intervencionismo provincial:</strong> Intervino provincias opositoras con frecuencia, debilitando el federalismo.</li>
        </ul>
        <h3>Logros Reales</h3>
        <ol>
          <li><strong>Reforma Universitaria de 1918:</strong> Los estudiantes de Córdoba impusieron la autonomía universitaria, el cogobierno y la extensión. Un modelo que se expandió por toda América Latina.</li>
          <li><strong>Mediación en conflictos laborales:</strong> Por primera vez, el Estado no respondía automáticamente con represión a las huelgas (aunque la Semana Trágica de 1919 fue una excepción sangrienta).</li>
          <li><strong>Creación de YPF (1922):</strong> La primera empresa petrolera estatal del mundo. Soberanía energética como política de Estado.</li>
        </ol>
        <h3>Las Contradicciones</h3>
        <p>Yrigoyen democratizó el acceso al poder pero no transformó la estructura económica. La tierra siguió concentrada, el modelo agroexportador siguió intacto, la dependencia de Gran Bretaña se profundizó. Fue un <strong>cambio de operadores sin cambio de sistema</strong>, igual que en Mayo de 1810.</p>
        <h3>El Segundo Mandato y la Caída</h3>
        <p>Reelegido en 1928 a los 76 años, Yrigoyen gobernó mal: delegaba en funcionarios ineptos, la crisis mundial de 1929 golpeó la economía, y la oposición (conservadores, militares, prensa) conspiró abiertamente. En septiembre de 1930, un golpe militar lo derrocó. Era el primer golpe de Estado de la Argentina moderna.</p>
        <blockquote>"Yrigoyen demostró que la democracia es más que ganar elecciones: es construir instituciones que sobrevivan a un líder. El radicalismo dependía de un hombre. Cuando ese hombre falló, el sistema entero colapsó."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'El Golpe de 1930: El Primer Cortocircuito',
      description: 'El primer golpe militar como ruptura del sistema democrático y precedente fatal.',
      content: `
        <h2>El Día que Argentina Rompió sus Propias Reglas</h2>
        <p>El 6 de septiembre de 1930, el general José Félix Uriburu derrocó a Yrigoyen. Fue el <strong>primer golpe de Estado exitoso</strong> contra un gobierno constitucional en Argentina. Y fue mucho más que un cambio de gobierno: fue la creación de un <strong>precedente</strong> que contaminaría los siguientes 53 años.</p>
        <h3>¿Por Qué Se Pudo?</h3>
        <ul>
          <li><strong>Crisis económica mundial:</strong> La Gran Depresión de 1929 destruyó los precios de las exportaciones argentinas. Desempleo, caída del salario real, malestar social.</li>
          <li><strong>Debilidad del gobierno:</strong> Yrigoyen, viejo y enfermo, no gobernaba. La percepción era de vacío de poder.</li>
          <li><strong>Conspiración abierta:</strong> Los diarios publicaban rumores de golpe como si fueran noticias deportivas. La sociedad lo naturalizó.</li>
          <li><strong>Validación judicial:</strong> La Corte Suprema avaló el golpe con la doctrina de los "gobiernos de facto", dándole legitimidad legal a lo ilegal. Este fallo es uno de los momentos más graves de la historia institucional argentina.</li>
        </ul>
        <h3>El Mecanismo del Golpe</h3>
        <p>Un golpe no es solo militares marchando. Es un <strong>sistema de complicidades</strong>:</p>
        <ol>
          <li>La élite económica que financia y presiona</li>
          <li>La prensa que instala el "caos" como narrativa</li>
          <li>Los militares que ejecutan</li>
          <li>La justicia que legitima</li>
          <li>Una parte de la sociedad que aplaude (o mira para otro lado)</li>
        </ol>
        <h3>El Precedente Mortal</h3>
        <p>Argentina tuvo <strong>6 golpes militares</strong> entre 1930 y 1976. El primero no fue el peor, pero fue el que demostró que se podía: que las Fuerzas Armadas podían derrocar gobiernos electos, que la justicia los iba a avalar, y que una parte de la sociedad lo iba a celebrar.</p>
        <h3>Reflexión Sistémica</h3>
        <blockquote>"Un sistema que permite que se rompan las reglas sin consecuencias está enseñando que las reglas no importan. El golpe de 1930 enseñó a Argentina que la democracia era optativa. Costó 53 años, 30.000 desaparecidos y una guerra perdida aprender que no lo es."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Década Infame: Fraude, Dependencia y Exclusión',
      description: 'Los años 30 como laboratorio de todos los vicios del sistema argentino.',
      content: `
        <h2>El Nombre Lo Dice Todo</h2>
        <p>El período 1930-1943 es conocido como la <strong>"Década Infame"</strong>. No porque todo haya sido malo (hubo crecimiento industrial, modernización urbana, una edad de oro cultural), sino porque el sistema político se basó en el <strong>fraude sistemático</strong>, la corrupción estructural y la subordinación a los intereses británicos.</p>
        <h3>El "Fraude Patriótico"</h3>
        <p>Los conservadores que volvieron al poder después del golpe de 1930 sabían que no podían ganar elecciones limpias. Entonces inventaron el concepto de <strong>"fraude patriótico"</strong>: hacer trampa electoral estaba justificado para evitar que los radicales (el pueblo) volvieran al poder. Es un ejemplo perfecto de cómo las élites racionalizan la corrupción del sistema.</p>
        <ul>
          <li>Urnas rellenas antes de abrir las mesas</li>
          <li>Votantes muertos que aparecían en los padrones</li>
          <li>Punteros armados intimidando en los comicios</li>
          <li>Jueces cómplices que avalaban resultados fraudulentos</li>
        </ul>
        <h3>El Pacto Roca-Runciman (1933)</h3>
        <p>Este tratado comercial con Gran Bretaña es el símbolo de la dependencia económica. A cambio de mantener las cuotas de carne, Argentina concedió un trato preferencial a los productos y empresas británicas. El senador Lisandro de la Torre denunció el negociado de las carnes y casi fue asesinado en el recinto del Senado (su colega Enzo Bordabehere murió en su lugar).</p>
        <h3>La Industrialización por Sustitución</h3>
        <p>Paradójicamente, la crisis mundial y la Segunda Guerra Mundial forzaron una <strong>transformación positiva</strong>: como Argentina no podía importar manufacturas de Europa, empezó a fabricarlas. Nacieron industrias textiles, alimenticias, metalúrgicas. Surgió una <strong>clase obrera industrial</strong> en el Gran Buenos Aires que sería decisiva en la historia posterior.</p>
        <h3>La Lección de la Década Infame</h3>
        <blockquote>"Cuando la democracia es una fachada, el sistema genera anticuerpos. La clase obrera que creció en los márgenes del fraude conservador fue la base social que llevó a Perón al poder. Los sistemas excluidos no desaparecen: acumulan energía hasta que encuentran un canal de expresión."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: '1943-1945: El Huevo de la Serpiente — Los Orígenes de Perón',
      description: 'El surgimiento de Perón como producto del sistema y punto de inflexión histórico.',
      content: `
        <h2>El Sistema Produce Su Propio Transformador</h2>
        <p>En junio de 1943, un golpe militar (otro más) derrocó al gobierno conservador. Entre los militares golpistas había un coronel que entendió algo que nadie más veía: <strong>la clase obrera industrial que nadie representaba era la fuerza política más grande del país</strong>. Ese coronel era Juan Domingo Perón.</p>
        <h3>El Movimiento del GOU</h3>
        <p>El Grupo de Oficiales Unidos (GOU) era una logia militar nacionalista. Querían un Estado fuerte, industrialización, neutralidad en la guerra y orden social. Perón era uno de sus líderes, pero se distinguía de sus compañeros en algo crucial: <strong>entendía a los trabajadores</strong>.</p>
        <h3>La Jugada Maestra: La Secretaría de Trabajo</h3>
        <p>Perón pidió un puesto que nadie quería: la Secretaría de Trabajo y Previsión. Desde ahí:</p>
        <ul>
          <li><strong>Recibió a cada sindicato:</strong> Escuchó demandas que llevaban décadas acumulándose.</li>
          <li><strong>Impulsó leyes laborales:</strong> Vacaciones pagas, aguinaldo, jubilación, estatuto del peón rural. Derechos que hoy nos parecen básicos y que antes no existían.</li>
          <li><strong>Construyó una base de poder:</strong> Cada decreto favorable a los trabajadores sumaba lealtad. Los sindicatos pasaron de ser enemigos del Estado a ser aliados del coronel.</li>
          <li><strong>Mostró eficacia:</strong> Mientras otros militares debatían ideología, Perón resolvía problemas concretos de la gente.</li>
        </ul>
        <h3>El 17 de Octubre de 1945</h3>
        <p>Cuando sus rivales militares lo encarcelaron, ocurrió algo sin precedentes: <strong>cientos de miles de trabajadores marcharon espontáneamente a Plaza de Mayo</strong> pidiendo su liberación. Era la clase obrera que había nacido en la Década Infame, que había sido ignorada por todos los partidos, que ahora tenía nombre y demanda.</p>
        <p>Perón fue liberado. Habló desde el balcón de la Casa Rosada. Y la historia argentina cambió para siempre.</p>
        <h3>Lo que el 17 de Octubre Reveló</h3>
        <ol>
          <li>Existía una Argentina invisible: millones de trabajadores del interior y del conurbano que el sistema político no registraba.</li>
          <li>La lealtad se construye con hechos concretos, no con discursos.</li>
          <li>Un líder que conecta con las necesidades reales de la gente puede cambiar las reglas del juego.</li>
        </ol>
        <h3>El Cierre del Ciclo 1810-1945</h3>
        <p>Este curso empezó con la Revolución de Mayo, donde una élite cambió de manos el poder sin cambiar el sistema. Termina con el 17 de octubre de 1945, donde por primera vez <strong>las masas populares irrumpieron en la historia como protagonistas</strong>. Entre ambos puntos, el sistema argentino se fue construyendo capa a capa: la estructura colonial heredada, la fragmentación caudillista, el diseño institucional de 1853, la máquina agroexportadora, la democracia restringida, los golpes como corrección, y finalmente la emergencia de una Argentina nueva que pedía ser reconocida.</p>
        <blockquote>"1945 no fue el comienzo de la polarización argentina. Fue el momento en que la mitad invisible del país dijo 'existimos'. Entender los 135 años anteriores es entender por qué ese grito era inevitable, necesario y transformador."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 17, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 29');

  // Quiz
  const existingQuiz29 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz29.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz29[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz29] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Argentina 1810-1945',
    description: 'Evaluá tu comprensión de los patrones sistémicos en la historia argentina.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions29 = [
    { quizId: quiz29.id, question: '¿Qué significó realmente la Revolución de Mayo desde una perspectiva sistémica?', type: 'multiple_choice' as const, options: JSON.stringify(['El nacimiento de la libertad', 'Un cambio de operadores del sistema sin cambio del sistema', 'Una revolución popular masiva', 'La independencia completa de España']), correctAnswer: JSON.stringify(1), explanation: 'Mayo cambió quién operaba el sistema colonial, pero la estructura de poder (concentración en Buenos Aires, lógica extractiva) se mantuvo.', points: 2, orderIndex: 1 },
    { quizId: quiz29.id, question: 'La Constitución de 1853 fue implementada sin conflictos por todas las provincias.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Buenos Aires rechazó la Constitución y se separó de la Confederación durante una década porque perdía el control de la aduana.', points: 1, orderIndex: 2 },
    { quizId: quiz29.id, question: '¿Qué estableció la Ley Sáenz Peña de 1912?', type: 'multiple_choice' as const, options: JSON.stringify(['Educación obligatoria', 'Voto secreto, universal masculino y obligatorio', 'Reforma agraria', 'Separación de Iglesia y Estado']), correctAnswer: JSON.stringify(1), explanation: 'La Ley Sáenz Peña transformó el sistema electoral argentino al hacer el voto secreto, obligatorio y universal (para hombres).', points: 2, orderIndex: 3 },
    { quizId: quiz29.id, question: '¿Cuál fue el principal "bug de diseño" del modelo de la Generación del 80?', type: 'multiple_choice' as const, options: JSON.stringify(['La educación pública', 'La inmigración masiva', 'La dependencia de un solo cliente y un solo producto', 'La federalización de Buenos Aires']), correctAnswer: JSON.stringify(2), explanation: 'El modelo dependía exclusivamente de exportar materias primas a Gran Bretaña. Cuando esa relación se alteró, Argentina no tenía alternativa.', points: 2, orderIndex: 4 },
    { quizId: quiz29.id, question: 'El golpe de 1930 fue avalado por la Corte Suprema con la doctrina de "gobiernos de facto".', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'La Corte Suprema legitimó el golpe, creando un precedente legal que facilitó los golpes posteriores.', points: 1, orderIndex: 5 },
    { quizId: quiz29.id, question: '¿Qué cargo ocupó Perón que le permitió construir su base de poder?', type: 'multiple_choice' as const, options: JSON.stringify(['Presidente', 'Ministro de Guerra', 'Secretario de Trabajo y Previsión', 'Jefe de Policía']), correctAnswer: JSON.stringify(2), explanation: 'Desde la Secretaría de Trabajo, Perón impulsó leyes laborales que le ganaron la lealtad de los sindicatos y la clase obrera.', points: 2, orderIndex: 6 },
    { quizId: quiz29.id, question: 'La "Década Infame" se caracterizó por el "fraude patriótico" para evitar que el pueblo eligiera libremente.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Los conservadores justificaban el fraude electoral como necesario para evitar que los radicales volvieran al poder.', points: 1, orderIndex: 7 },
    { quizId: quiz29.id, question: '¿Qué evento demostró por primera vez la irrupción de las masas populares como actor político?', type: 'multiple_choice' as const, options: JSON.stringify(['La Revolución de Mayo', 'La Semana Trágica de 1919', 'El 17 de octubre de 1945', 'El golpe de 1943']), correctAnswer: JSON.stringify(2), explanation: 'El 17 de octubre de 1945, cientos de miles de trabajadores marcharon espontáneamente a Plaza de Mayo, marcando la irrupción de las masas en la política argentina.', points: 2, orderIndex: 8 },
  ];

  for (const q of questions29) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions29.length, 'questions for course 29');
}

async function seedCourse30(authorId: number) {
  console.log('--- Course 30: Argentina 1945-2001 ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'argentina-1945-2001-pendulo-nunca-para')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Argentina 1945-2001: El Péndulo que Nunca Para',
      slug: 'argentina-1945-2001-pendulo-nunca-para',
      description: 'El medio siglo donde Argentina consolida sus patrones destructivos. Peronismo/antiperonismo como polarización autorreferente, el ciclo militar como resets forzados, y la convertibilidad como parche.',
      excerpt: 'Medio siglo de péndulos, golpes y crisis vistos como patrones sistémicos.',
      category: 'hombre-gris',
      level: 'intermediate',
      duration: 200,
      thumbnailUrl: 'https://images.unsplash.com/photo-1612831197310-ff5cf7a211b6?w=800',
      orderIndex: 30,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 30:', course[0].title);
  } else {
    console.log('Found existing course 30:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'Perón 1946-1955: El Modelo que Dividió Argentina',
      description: 'El peronismo como transformación del sistema y origen de la polarización permanente.',
      content: `
        <h2>El Sistema que Cambió Todas las Reglas</h2>
        <p>Juan Domingo Perón ganó las elecciones de 1946 con el 56% de los votos. Lo que construyó en los siguientes 9 años fue mucho más que un gobierno: fue un <strong>nuevo sistema operativo</strong> para Argentina. Un sistema tan potente que, 80 años después, sigue definiendo la política del país.</p>
        <h3>Las Tres Banderas</h3>
        <ul>
          <li><strong>Justicia social:</strong> Derechos laborales, vacaciones pagas, aguinaldo, jubilación universal. Millones de personas que habían sido invisibles accedieron por primera vez a una vida digna.</li>
          <li><strong>Independencia económica:</strong> Nacionalización de ferrocarriles, gas, teléfonos. Industrialización dirigida por el Estado. El IAPI controlaba el comercio exterior.</li>
          <li><strong>Soberanía política:</strong> "Tercera posición" entre EEUU y la URSS. Argentina como país no alineado.</li>
        </ul>
        <h3>Eva Perón: El Corazón del Sistema</h3>
        <p>Eva Duarte de Perón fue mucho más que "la esposa del presidente". Fue una <strong>innovación política</strong>: conectó emocionalmente al gobierno con los sectores más vulnerables, construyó la Fundación Eva Perón (hospitales, escuelas, viviendas), impulsó el voto femenino (1947), y creó una mística que ningún político argentino pudo replicar.</p>
        <h3>Los Costos del Modelo</h3>
        <ul>
          <li><strong>Autoritarismo creciente:</strong> Persecución a opositores, cierre de diarios (La Prensa), control de la justicia, reforma constitucional para permitir la reelección.</li>
          <li><strong>Culto a la personalidad:</strong> Perón y Evita en los manuales escolares, en las calles, en todo el espacio público.</li>
          <li><strong>Agotamiento económico:</strong> El modelo redistributivo funcionó mientras hubo reservas acumuladas durante la guerra. Cuando se acabaron, la economía empezó a crujir.</li>
          <li><strong>Polarización fundacional:</strong> Argentina se dividió en peronistas y antiperonistas con una intensidad que no tenía precedente. Familias, amistades, instituciones: todo se partió en dos.</li>
        </ul>
        <h3>La Lección Sistémica</h3>
        <blockquote>"El peronismo demostró que la inclusión social genera lealtad inquebrantable, pero que la concentración de poder genera resistencia igualmente inquebrantable. Ese equilibrio inestable entre inclusión y autoritarismo define la tensión central de la política argentina hasta hoy."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Revolución Libertadora: El Primer Péndulo Violento',
      description: 'El golpe de 1955 como inicio del ciclo pendular peronismo/antiperonismo.',
      content: `
        <h2>Cuando el Péndulo Empieza a Oscilar</h2>
        <p>En septiembre de 1955, un golpe cívico-militar derrocó a Perón. Los golpistas se autodenominaron <strong>"Revolución Libertadora"</strong>. Lo que hicieron fue inaugurar el ciclo más destructivo de la historia argentina: el péndulo peronismo-antiperonismo.</p>
        <h3>La Lógica del Antiperonismo</h3>
        <p>Los sectores que derrocaron a Perón (militares, Iglesia Católica, partidos opositores, clase media alta) compartían un diagnóstico: el peronismo era una <strong>enfermedad</strong> que debía ser erradicada. No bastaba con sacar a Perón; había que eliminar el peronismo de la cultura argentina.</p>
        <h3>La Desperonización</h3>
        <ul>
          <li><strong>Prohibición del peronismo:</strong> Se prohibió el partido peronista, nombrar a Perón o a Evita, tener símbolos peronistas. Hasta silbar la marcha peronista era delito.</li>
          <li><strong>Intervención de sindicatos:</strong> Se purgaron los sindicatos, se encarcelaron dirigentes, se intentó desmantelar la estructura gremial.</li>
          <li><strong>Fusilamientos de 1956:</strong> Se fusiló a militares y civiles peronistas que intentaron un contragolpe. Un acto de violencia estatal sin juicio previo que radicalizó la resistencia.</li>
          <li><strong>Robo del cadáver de Eva:</strong> El cuerpo embalsamado de Eva Perón fue secuestrado y enviado a Italia clandestinamente. Un acto de crueldad simbólica que habla del odio visceral que generaba el peronismo en sus adversarios.</li>
        </ul>
        <h3>El Resultado Paradójico</h3>
        <p>La persecución no eliminó el peronismo: lo <strong>fortaleció</strong>. Al prohibirlo, lo convirtieron en mística de resistencia. Al perseguir a sus seguidores, profundizaron la lealtad. Al intentar borrar su memoria, la hicieron inolvidable.</p>
        <p>Este es un patrón sistémico fundamental: <strong>la represión de un movimiento de masas no lo destruye sino que lo radicaliza</strong>. Cada intento de erradicar el peronismo lo hizo más fuerte y más desafiante.</p>
        <h3>El Péndulo se Activa</h3>
        <blockquote>"Con la Revolución Libertadora nace el ciclo que dominará medio siglo de historia argentina: un gobierno cae, el siguiente intenta borrar todo lo que hizo el anterior, radicaliza a la oposición, pierde legitimidad, y cae a su vez. Es una máquina de inestabilidad perpetua."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Frondizi e Illia: La Democracia Vigilada',
      description: 'Los intentos democráticos bajo tutela militar y la proscripción peronista.',
      content: `
        <h2>Democracia Con Asterisco</h2>
        <p>Entre 1958 y 1966, Argentina intentó funcionar como democracia, pero con una condición imposible: <strong>el partido más grande del país estaba prohibido</strong>. Es como intentar jugar al fútbol sacando al equipo más popular del torneo y pretender que el campeonato sea legítimo.</p>
        <h3>Frondizi (1958-1962): El Desarrollista Frágil</h3>
        <p>Arturo Frondizi ganó las elecciones con un pacto secreto con Perón (exiliado en Madrid): votos peronistas a cambio de la promesa de levantar la proscripción. Una vez presidente:</p>
        <ul>
          <li><strong>Industrialización:</strong> Atrajo inversión extranjera para industria pesada (petróleo, siderurgia, automotriz). Argentina empezó a fabricar autos, acero, electrodomésticos.</li>
          <li><strong>Contradicciones:</strong> Prometió a los sindicatos peronistas pero aplicó planes de austeridad. Prometió soberanía energética pero firmó contratos con empresas petroleras extranjeras.</li>
          <li><strong>32 planteos militares:</strong> Los militares lo presionaron constantemente. Cada vez que el peronismo ganaba una elección provincial, los militares amenazaban con golpe.</li>
          <li><strong>Caída:</strong> Cuando el peronismo ganó la gobernación de Buenos Aires en 1962, los militares derrocaron a Frondizi.</li>
        </ul>
        <h3>Illia (1963-1966): La Democracia Débil</h3>
        <p>Arturo Illia (radical del pueblo) ganó con apenas el 25% de los votos (el peronismo seguía proscripto). Su gobierno fue honesto, moderado y extraordinariamente democrático. Pero la prensa, los militares y los sectores corporativos lo presentaron como <strong>"lento", "ineficaz", una "tortuga"</strong>.</p>
        <ul>
          <li>Anuló los contratos petroleros de Frondizi</li>
          <li>Sancionó la Ley de Medicamentos (regulación de precios farmacéuticos que enfureció a los laboratorios)</li>
          <li>Respetó escrupulosamente las libertades civiles</li>
          <li>Fue derrocado en 1966 por Onganía con el aplauso de la prensa y parte de la sociedad</li>
        </ul>
        <h3>La Lección Trágica</h3>
        <blockquote>"Entre 1955 y 1966, Argentina demostró que una democracia que excluye a la mayoría no es democracia. Y que una sociedad que aplaude cuando los militares derriban gobiernos débiles termina sufriendo gobiernos militares fuertes y crueles."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Onganía y la Revolución Argentina: El Autoritarismo Modernizador',
      description: 'La dictadura de Onganía y el intento de modernización desde arriba.',
      content: `
        <h2>El Orden Sin Política</h2>
        <p>El general Juan Carlos Onganía llegó al poder en junio de 1966 con un plan ambicioso: <strong>transformar Argentina sin política</strong>. Tres tiempos: primero el económico (estabilizar y modernizar), después el social (distribuir), finalmente el político (devolver la democracia). Un plan de laboratorio que chocó violentamente con la realidad.</p>
        <h3>Lo Que Hizo</h3>
        <ul>
          <li><strong>La Noche de los Bastones Largos (1966):</strong> La Policía Federal irrumpió en las universidades y golpeó a profesores y estudiantes. Argentina perdió una generación de científicos e investigadores que emigraron. Un daño incalculable al sistema científico.</li>
          <li><strong>Prohibición de partidos:</strong> Todos los partidos políticos fueron disueltos. Los sindicatos fueron intervenidos.</li>
          <li><strong>Krieger Vasena:</strong> Su ministro de economía estabilizó la moneda y atrajo inversión, pero a costa de congelar salarios y cerrar las economías regionales. Las provincias del interior se empobrecieron dramáticamente.</li>
        </ul>
        <h3>El Cordobazo (1969)</h3>
        <p>El 29 de mayo de 1969, obreros y estudiantes de Córdoba se levantaron en una insurrección popular que tomó la ciudad durante horas. El <strong>Cordobazo</strong> fue un terremoto que resquebrajó la dictadura y demostró que no se puede modernizar un país sin la gente.</p>
        <p>No fue el único: el Rosariazo, el Tucumanazo, el Mendozazo. Toda la Argentina del interior explotó contra un modelo que la ignoraba.</p>
        <h3>La Radicalización</h3>
        <p>La violencia estatal de los 60 radicalizó a una generación. Nacieron las organizaciones armadas: Montoneros (peronistas), ERP (marxistas), FAR, FAP. Miles de jóvenes que habían empezado pidiendo democracia terminaron tomando las armas. Es un ejemplo de cómo <strong>la represión del sistema produce sus propios antagonistas radicalizados</strong>.</p>
        <h3>La Caída de Onganía</h3>
        <p>El Cordobazo destrozó el plan de los "tres tiempos". Los propios militares sacaron a Onganía en 1970 y empezaron a buscar una salida: había que dejar volver a Perón para pacificar el país. La solución al problema creado en 1955 era, irónicamente, deshacer lo que se había hecho en 1955.</p>
        <blockquote>"El Cordobazo enseñó que no se puede gobernar un país contra su gente. Que la eficiencia sin participación es opresión disfrazada de modernidad. Es una lección que los tecnócratas argentinos siguen sin aprender."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'El Retorno de Perón: Esperanza y Tragedia',
      description: 'La vuelta de Perón como solución imposible a una crisis sistémica.',
      content: `
        <h2>El Regreso del Exiliado</h2>
        <p>Después de 18 años de exilio, proscripción, golpes y crisis, el sistema argentino recurrió a su último recurso: <strong>traer de vuelta a Perón</strong>. En 1973, el peronismo ganó las elecciones y en septiembre de ese año Perón fue elegido presidente con el 62% de los votos. Parecía que el péndulo finalmente se detenía.</p>
        <h3>La Masacre de Ezeiza (Junio 1973)</h3>
        <p>El día que Perón volvió a Argentina, <strong>la derecha peronista disparó contra la juventud peronista</strong> en Ezeiza. Hubo muertos y heridos. Perón no había pisado el país y el movimiento que lo reclamaba ya se mataba entre sí. Era la señal de que la "unidad" era una ficción.</p>
        <h3>El Imposible Equilibrio</h3>
        <p>Perón intentó equilibrar fuerzas irreconciliables dentro de su propio movimiento:</p>
        <ul>
          <li><strong>Juventud radicalizada:</strong> Montoneros y JP querían revolución socialista. "Perón, Evita, la patria socialista."</li>
          <li><strong>Sindicalismo tradicional:</strong> Los sindicatos querían mejoras salariales y poder gremial, no revolución.</li>
          <li><strong>Derecha peronista:</strong> López Rega, la Triple A, los sectores represivos que querían eliminar a la izquierda.</li>
        </ul>
        <p>Perón optó por la derecha de su movimiento. En el acto del 1° de mayo de 1974, echó de la Plaza de Mayo a los Montoneros llamándolos "imberbes". La ruptura fue total.</p>
        <h3>La Muerte de Perón (Julio 1974)</h3>
        <p>Perón murió el 1° de julio de 1974. Con él murió la única persona capaz de (intentar) mantener unido al peronismo. Asumió Isabel Perón, su esposa y vicepresidenta, bajo la influencia total de López Rega.</p>
        <h3>El Descenso al Infierno</h3>
        <p>Lo que siguió fue el peor período de la historia argentina antes de la dictadura:</p>
        <ul>
          <li>La Triple A (Alianza Anticomunista Argentina) asesinaba opositores, intelectuales, artistas.</li>
          <li>La inflación se desbocó (el "Rodrigazo" de 1975: un ajuste brutal que generó crisis social).</li>
          <li>La violencia era cotidiana: bombas, secuestros, asesinatos de ambos lados.</li>
        </ul>
        <blockquote>"El retorno de Perón demostró que un líder no puede resolver una crisis sistémica solo con carisma. Las contradicciones acumuladas durante 18 años de proscripción habían creado un nudo gordiano que no podía desatarse con política. Se cortaría con la peor violencia de la historia argentina."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: '1976-1983: La Dictadura — El Abismo',
      description: 'El terrorismo de Estado como la peor expresión de los patrones argentinos.',
      content: `
        <h2>El Horror Como Política de Estado</h2>
        <p>El 24 de marzo de 1976, las Fuerzas Armadas derrocaron a Isabel Perón e instalaron el autodenominado <strong>"Proceso de Reorganización Nacional"</strong>. Lo que siguió fue el período más oscuro de la historia argentina: un plan sistemático de secuestro, tortura, asesinato y desaparición de personas ejecutado por el Estado.</p>
        <h3>Los Números del Horror</h3>
        <ul>
          <li><strong>30.000 desaparecidos:</strong> Personas secuestradas por el Estado, torturadas en centros clandestinos de detención y asesinadas. Sus cuerpos nunca fueron entregados a sus familias.</li>
          <li><strong>500 bebés robados:</strong> Hijos de detenidas-desaparecidas que fueron apropiados por familias de militares o allegados. Abuelas de Plaza de Mayo sigue buscándolos.</li>
          <li><strong>Más de 300 centros clandestinos de detención</strong> en todo el país.</li>
          <li><strong>Vuelos de la muerte:</strong> Prisioneros arrojados vivos al Río de la Plata desde aviones militares.</li>
        </ul>
        <h3>El Plan Económico</h3>
        <p>Martínez de Hoz, ministro de Economía, implementó un programa de liberalización financiera que:</p>
        <ul>
          <li>Destruyó la industria nacional abriendo las importaciones sin protección.</li>
          <li>Multiplicó la deuda externa de 8.000 a 45.000 millones de dólares.</li>
          <li>Creó una "bicicleta financiera" (la "tablita") donde era más rentable especular que producir.</li>
          <li>Concentró la riqueza: los grupos económicos más grandes se hicieron más grandes. Los pequeños desaparecieron.</li>
        </ul>
        <h3>La Complicidad</h3>
        <p>La dictadura no fue solo obra de militares. Tuvo <strong>complicidad civil</strong>: empresarios que se beneficiaron del plan económico y denunciaron a delegados sindicales, jueces que rechazaron hábeas corpus, medios que ocultaron la realidad, ciudadanos que "no sabían" o preferían no saber.</p>
        <h3>Malvinas (1982): La Desesperación</h3>
        <p>Cuando el modelo se derrumbaba, la dictadura jugó su última carta: una guerra contra Gran Bretaña por las Islas Malvinas. Una causa justa usada como cortina de humo desesperada. La derrota militar aceleró la caída del régimen.</p>
        <h3>La Herida Abierta</h3>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: Las Madres y Abuelas — Cuando el Amor Se Hizo Resistencia</h4>
          <p>El 30 de abril de 1977, catorce mujeres se reunieron en la Plaza de Mayo. Eran madres de desaparecidos. La policía les ordenó "circular" porque estaba prohibido reunirse en grupos. Entonces empezaron a <strong>caminar en ronda</strong>. Así nacieron las Madres de Plaza de Mayo — la forma de resistencia más poderosa contra la dictadura, nacida de un acto cotidiano: caminar.</p>
          <p><strong>Azucena Villaflor</strong>, fundadora del grupo, fue secuestrada y desaparecida el 10 de diciembre de 1977. Sus restos fueron identificados en 2005 por el Equipo Argentino de Antropología Forense. La habían arrojado al mar en un vuelo de la muerte. Pero su ronda no se detuvo.</p>
          <p>Hebe de Bonafini testimoniaba: <em>"Yo era una simple ama de casa. No sabía nada de política. Mis hijos me parieron. Ellos me hicieron Madre de Plaza de Mayo."</em> María Isabel Chorobik de Mariani — "Chicha" — buscó a su nieta Clara Anahí, nacida en cautiverio en noviembre de 1976, hasta su muerte en 2018 sin haberla encontrado.</p>
          <p>Las Abuelas de Plaza de Mayo, lideradas por <strong>Estela de Carlotto</strong>, desarrollaron junto con genetistas un método pionero mundial: el <strong>índice de abuelidad</strong>, una técnica de ADN que permite identificar parentesco saltando una generación. Gracias a esa herramienta, hasta hoy se han restituido <strong>133 identidades</strong> de nietos apropiados. Cada restitución es un acto de justicia que demuestra que el sistema de terror no pudo borrar los lazos.</p>
          <p>Pensá en esto: mientras el aparato represivo más brutal de la historia argentina funcionaba a pleno, un grupo de mujeres sin armas, sin partido, sin organización previa, <strong>puso al terrorismo de Estado contra las cuerdas</strong> caminando en círculos con pañuelos blancos en la cabeza. El poder del vínculo contra el poder de la fuerza.</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris reconoce que la resistencia más duradera no viene de las armas ni de las ideologías, sino de los vínculos que el poder no puede romper. Las Madres y Abuelas convirtieron el dolor privado en acción pública, y eso cambió la historia.</p>
        </div>
        <blockquote>"La dictadura no fue un paréntesis ni una anomalía. Fue la consecuencia extrema de patrones que Argentina venía construyendo desde 1930: la violencia política como herramienta legítima, los militares como árbitros, la sociedad dividida en enemigos irreconciliables. Nunca Más no es solo un título: es un imperativo sistémico."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Alfonsín 1983-1989: La Primavera Democrática',
      description: 'La reconstrucción democrática, el Juicio a las Juntas y las limitaciones del sistema.',
      content: `
        <h2>Reconstruir un País Desde los Escombros</h2>
        <p>El 10 de diciembre de 1983, Raúl Alfonsín asumió como presidente. Argentina volvía a la democracia después del período más traumático de su historia. Alfonsín tenía una misión que parecía imposible: <strong>reconstruir la república, hacer justicia por los crímenes de la dictadura y estabilizar una economía en crisis</strong>. Todo al mismo tiempo.</p>
        <h3>El Juicio a las Juntas (1985)</h3>
        <p>El acto más valiente de la democracia argentina. Por primera vez en la historia mundial, un gobierno democrático <strong>juzgó y condenó a los comandantes de su propia dictadura</strong> en un tribunal civil. No fue un tribunal revolucionario ni un linchamiento: fue justicia con todas las garantías.</p>
        <ul>
          <li>Videla y Massera: prisión perpetua</li>
          <li>Viola: 17 años de prisión</li>
          <li>Otros comandantes: diversas penas</li>
        </ul>
        <p>El fiscal Julio César Strassera cerró su alegato con una frase que quedó en la memoria colectiva: <strong>"Señores jueces: Nunca Más."</strong></p>
        <h3>La CONADEP y el "Nunca Más"</h3>
        <p>La Comisión Nacional sobre la Desaparición de Personas, presidida por Ernesto Sabato, investigó y documentó los crímenes de la dictadura. El informe "Nunca Más" se convirtió en el bestseller más vendido de la historia argentina y en un documento fundamental de los derechos humanos mundiales.</p>
        <h3>Las Limitaciones</h3>
        <ul>
          <li><strong>Presión militar:</strong> Las rebeliones carapintadas (1987-88) forzaron las leyes de Obediencia Debida y Punto Final, que limitaron los juicios. Un retroceso doloroso.</li>
          <li><strong>Crisis económica:</strong> La deuda heredada, la caída del precio de las exportaciones y la resistencia de los poderes económicos impidieron estabilizar la economía.</li>
          <li><strong>Hiperinflación (1989):</strong> Los precios subían varias veces por día. Los supermercados eran saqueados. Alfonsín tuvo que entregar el poder 6 meses antes de lo previsto.</li>
        </ul>
        <h3>El Legado Sistémico</h3>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: La Democracia Vista desde la Villa — Los Olvidados de la Primavera</h4>
          <p>Mientras la clase media celebraba el regreso de la democracia y el rock nacional llenaba estadios, en las villas miseria de Buenos Aires, Rosario y Córdoba la "primavera democrática" llegaba con cuentagotas. Para los habitantes de la <strong>Villa 31 de Retiro</strong>, la Villa 1-11-14 del Bajo Flores o la Villa La Cava de San Isidro, la transición democrática significaba otra cosa.</p>
          <p><strong>Alberto "Lito" Ibarra</strong>, referente comunitario de Villa 31 durante los 80, describía la paradoja: <em>"Ahora podemos votar, pero seguimos sin cloacas, sin agua potable, sin títulos de propiedad. La democracia nos devolvió la palabra, pero no el techo."</em> En 1984, las villas de Capital Federal albergaban a unas <strong>52.000 personas</strong> — muchas de ellas sobrevivientes del plan de erradicación de villas ejecutado por la dictadura, que entre 1977 y 1981 demolió viviendas y expulsó a 200.000 personas con topadoras.</p>
          <p>La hiperinflación de 1989 golpeó desproporcionadamente a los villeros. Sin ahorros bancarios que proteger, sin empleo formal, dependientes de changas y del mercado informal, cada salto del dólar significaba hambre literal. Los saqueos de mayo de 1989 no empezaron en los barrios de clase media: empezaron en los <strong>cordones del Gran Buenos Aires</strong> — San Miguel, Moreno, Quilmes — donde familias enteras llevaban meses sin poder comprar lo básico.</p>
          <p>La Pastoral Villera, con curas como <strong>Carlos Mugica</strong> (asesinado en 1974) como referente fundacional, y sus continuadores en los 80 como el padre Daniel de la Sierra, sostenían redes de comedores, guarderías y apoyo escolar que funcionaban como un Estado paralelo. La democracia formal coexistía con una <strong>democracia de la supervivencia</strong> donde las organizaciones de base hacían lo que las instituciones no podían o no querían.</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris sabe que la democracia tiene temperaturas diferentes según dónde vivís. La primavera de unos fue el otoño de otros. Medir una época solo por sus logros institucionales es ignorar a quienes esos logros no alcanzaron.</p>
        </div>
        <blockquote>"Alfonsín demostró que la democracia puede juzgar a sus verdugos. Pero también demostró que la justicia sin estabilidad económica es frágil, y que los poderes fácticos (militares, grupos económicos) pueden limitar incluso al gobierno más valiente. La democracia necesita más que buenas intenciones: necesita poder real."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Menem 1989-1999: La Fiesta y la Resaca',
      description: 'La convertibilidad como parche sistémico y las reformas neoliberales.',
      content: `
        <h2>Pizza con Champagne</h2>
        <p>Carlos Menem llegó al poder prometiendo "revolución productiva" y "salariazo". Hizo exactamente lo contrario: implementó el programa de reformas neoliberales más profundo de la historia argentina. Y, durante un tiempo, <strong>funcionó</strong>. Eso es lo que lo hace tan interesante desde el pensamiento sistémico.</p>
        <h3>La Convertibilidad: El Parche Que Parecía Cura</h3>
        <p>Domingo Cavallo, ministro de Economía, ató el peso al dólar: 1 peso = 1 dólar, por ley. El efecto fue mágico:</p>
        <ul>
          <li>La inflación cayó de 5.000% anual a casi cero.</li>
          <li>Los argentinos pudieron planificar, ahorrar, sacar créditos.</li>
          <li>Llegó inversión extranjera masiva.</li>
          <li>Se podía viajar al exterior "barato". Miami era un shopping.</li>
        </ul>
        <p>Pero la convertibilidad tenía <strong>bugs fatales</strong> que se activarían más tarde.</p>
        <h3>Las Reformas Estructurales</h3>
        <ol>
          <li><strong>Privatizaciones:</strong> YPF, Aerolíneas, Entel, Gas del Estado, ferrocarriles. Vendidas a precios bajos, muchas a empresas que luego desinvirtieron.</li>
          <li><strong>Apertura comercial:</strong> Se eliminaron protecciones a la industria. Miles de fábricas cerraron.</li>
          <li><strong>Flexibilización laboral:</strong> Debilitamiento de convenios colectivos y derechos laborales.</li>
          <li><strong>Deuda externa:</strong> Se endeudó masivamente para financiar el déficit y mantener la convertibilidad.</li>
        </ol>
        <h3>La Otra Cara</h3>
        <ul>
          <li><strong>Desempleo:</strong> Pasó del 6% al 18%. El desempleo masivo era un fenómeno nuevo en Argentina.</li>
          <li><strong>Pobreza:</strong> Los indicadores de pobreza crecieron dramáticamente, especialmente en el interior.</li>
          <li><strong>Corrupción:</strong> Los escándalos de corrupción eran cotidianos. "Pizza con champagne" describía a una élite que se enriquecía mientras el país se endeudaba.</li>
          <li><strong>Concentración económica:</strong> Los grandes grupos se hicieron más grandes. La clase media se precarizó.</li>
        </ul>
        <h3>Los Bugs de la Convertibilidad</h3>
        <p>Un peso sobrevaluado significaba que:</p>
        <ol>
          <li>Era barato importar y caro exportar → se destruía la industria local.</li>
          <li>Para mantener el tipo de cambio fijo se necesitaban dólares → se pedía deuda.</li>
          <li>La deuda crecía pero la capacidad de pagar no → la bomba de tiempo se agrandaba.</li>
        </ol>
        <blockquote>"La convertibilidad enseñó que un parche brillante puede esconder una enfermedad terminal. Argentina eligió la anestesia del dólar barato en vez de la cirugía de reformas reales. Cuando la anestesia se acabó, el dolor fue insoportable."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'La Crisis de 2001: El Colapso Sistémico',
      description: 'El estallido de diciembre de 2001 como falla sistémica total.',
      content: `
        <h2>Cuando Todo el Sistema Falla a la Vez</h2>
        <p>Diciembre de 2001 no fue una crisis económica. No fue una crisis política. No fue una crisis social. Fue las <strong>tres cosas al mismo tiempo</strong>: un colapso sistémico total donde cada componente del sistema falló simultáneamente.</p>
        <h3>La Secuencia del Colapso</h3>
        <ol>
          <li><strong>La recesión (1998-2001):</strong> Tres años consecutivos de caída del PIB. Desempleo por encima del 20%. Pobreza creciente.</li>
          <li><strong>El "corralito" (diciembre 2001):</strong> El gobierno de De la Rúa congeló los depósitos bancarios. Los argentinos no podían sacar su propia plata del banco. Fue el equivalente a que el sistema operativo del país diera "pantalla azul".</li>
          <li><strong>Los saqueos:</strong> En todo el país, la gente saqueó supermercados. Mezcla de hambre real y desesperación.</li>
          <li><strong>La represión:</strong> El gobierno declaró estado de sitio. La policía mató a 39 personas en las protestas.</li>
          <li><strong>La renuncia:</strong> De la Rúa renunció y se fue de la Casa Rosada en helicóptero. Imagen que simboliza el abandono del poder.</li>
          <li><strong>5 presidentes en 10 días:</strong> El sistema institucional estaba tan roto que no podía producir un sucesor estable.</li>
        </ol>
        <h3>"Que Se Vayan Todos"</h3>
        <p>El grito de las cacerolas no era solo contra De la Rúa o la convertibilidad. Era contra <strong>todo el sistema político</strong>: los partidos, los sindicatos, los jueces, los medios, los empresarios. Era la expresión de una sociedad que sintió que todas las instituciones habían fallado simultáneamente.</p>
        <h3>Lo Que Emergió de las Cenizas</h3>
        <ul>
          <li><strong>Asambleas barriales:</strong> Los vecinos se organizaron para resolver problemas que el Estado no podía.</li>
          <li><strong>Fábricas recuperadas:</strong> Los trabajadores ocuparon fábricas cerradas y las pusieron a producir.</li>
          <li><strong>Clubes de trueque:</strong> Sin plata, la gente creó sistemas de intercambio paralelos.</li>
          <li><strong>Movimientos piqueteros:</strong> Los desocupados se organizaron y crearon un movimiento social nuevo.</li>
        </ul>
        <h3>La Lección Más Dolorosa</h3>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
          <h4 style="color:#92400e;margin-top:0;">🔍 Voces Silenciadas: Las Piqueteras — Cuando las Mujeres Sostuvieron la Rebelión</h4>
          <p>La imagen icónica del 2001 es el cacerolazo de clase media en Plaza de Mayo. Pero la crisis ya había empezado mucho antes en los barrios del conurbano, y quienes la sostuvieron día a día fueron, en su inmensa mayoría, <strong>mujeres</strong>.</p>
          <p>El movimiento piquetero nació en los cortes de ruta de Cutral-Có (Neuquén, 1996) y General Mosconi (Salta, 1997), pueblos devastados por la privatización de YPF. Pero fue en el Gran Buenos Aires donde se convirtió en un movimiento de masas, y ahí el 70% de quienes sostenían los piquetes, los comedores y las asambleas eran mujeres. No era casualidad: cuando el hombre pierde el trabajo, muchas veces se quiebra. Las mujeres se organizan.</p>
          <p><strong>Milagro Sala</strong> en Jujuy construyó la organización Tupac Amaru desde una cooperativa de 16 personas hasta un movimiento que edificó barrios enteros con piletas, escuelas y fábricas textiles. <strong>Neka Jara</strong>, del MTD (Movimiento de Trabajadores Desocupados) de Solano, describía su tarea cotidiana: <em>"Acá los compañeros vienen a la asamblea, pero las que armamos el comedor, las que llevamos a los pibes al hospital, las que peleamos el plan social en la municipalidad, somos nosotras."</em></p>
          <p>En La Matanza, <strong>Soledad Bordegaray</strong> y otras mujeres del MTD Aníbal Verón organizaron guarderías populares para que las madres pudieran participar en los cortes de ruta. Inventaron una <strong>infraestructura de cuidado comunitario</strong> que el Estado había abandonado. Los comedores piqueteros alimentaban a 2 millones de personas durante lo peor de la crisis. Cada olla popular era un acto político sostenido por manos de mujer.</p>
          <p>Cuando leés sobre el 2001, generalmente te muestran a De la Rúa en helicóptero o a Duhalde asumiendo la presidencia. Pero el verdadero poder constituyente de esos años estaba en las asambleas de barrio, en los comedores, en las fábricas recuperadas — y en cada uno de esos espacios, las mujeres eran <strong>la columna vertebral</strong> invisible.</p>
          <p style="font-style:italic;color:#92400e;">El Hombre Gris sabe que las crisis no se viven igual para todos. En 2001, mientras unos perdían ahorros en dólares, otras perdían la posibilidad de darle de comer a sus hijos. La historia de abajo no es un complemento pintoresco: es la historia real.</p>
        </div>
        <blockquote>"2001 demostró que un país puede colapsar sin invasión extranjera, sin desastre natural, sin guerra. Puede colapsar por acumulación de decisiones equivocadas, por parches sobre parches, por patear problemas hacia adelante. El sistema argentino no fue destruido por un enemigo externo: se autodestruyó."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Los Patrones del Péndulo: El Ciclo que Se Repite',
      description: 'Análisis sistémico de los patrones recurrentes en la historia 1945-2001.',
      content: `
        <h2>El Mismo Ciclo, Diferentes Actores</h2>
        <p>Si mirás la historia argentina de 1945 a 2001 desde arriba, ves un <strong>patrón que se repite con variaciones</strong>. No son los mismos actores ni las mismas circunstancias, pero la dinámica subyacente es asombrosamente similar.</p>
        <h3>El Ciclo del Péndulo Argentino</h3>
        <ol>
          <li><strong>Fase 1 — Crisis:</strong> El modelo vigente se agota. Crisis económica, descontento social, pérdida de legitimidad del gobierno.</li>
          <li><strong>Fase 2 — Ruptura:</strong> Un nuevo gobierno (elegido o impuesto) llega con la promesa de cambiar todo. Se presenta como la antítesis del anterior.</li>
          <li><strong>Fase 3 — Refundación:</strong> El nuevo gobierno intenta rehacer todo desde cero. Descarta lo anterior, incluso lo que funcionaba.</li>
          <li><strong>Fase 4 — Luna de miel:</strong> El entusiasmo inicial genera resultados positivos (o la ilusión de ellos).</li>
          <li><strong>Fase 5 — Agotamiento:</strong> Las contradicciones internas del nuevo modelo empiezan a manifestarse. Los problemas que se patearon vuelven.</li>
          <li><strong>Fase 6 — Crisis:</strong> Volvemos al paso 1, pero con más deuda, más desconfianza y menos capacidad institucional.</li>
        </ol>
        <h3>Los Patrones Específicos</h3>
        <ul>
          <li><strong>Patrón de gasto:</strong> Cada gobierno gasta más de lo que recauda para mantener el apoyo popular. La diferencia se cubre con emisión o deuda. Cuando ya no se puede, crisis.</li>
          <li><strong>Patrón de polarización:</strong> Cada gobierno construye su legitimidad en contra del anterior. No hay continuidad de políticas de Estado.</li>
          <li><strong>Patrón militar:</strong> Hasta 1983, los militares intervenían cada vez que el sistema civil fallaba. Eran el "reset button" del sistema.</li>
          <li><strong>Patrón de dependencia:</strong> Argentina siempre necesitó un "socio mayor" (Gran Bretaña, EEUU, FMI) para sostener su modelo. Esa dependencia limita la autonomía.</li>
          <li><strong>Patrón de amnesia:</strong> Cada generación repite errores que la anterior ya cometió, porque no hay transmisión efectiva de aprendizaje institucional.</li>
        </ul>
        <h3>¿Se Puede Romper el Ciclo?</h3>
        <p>Romper un ciclo requiere:</p>
        <ol>
          <li><strong>Reconocerlo:</strong> Saber que estás en un bucle es el primer paso. Este curso es un intento de eso.</li>
          <li><strong>Políticas de Estado:</strong> Acuerdos mínimos que sobrevivan a los cambios de gobierno.</li>
          <li><strong>Instituciones fuertes:</strong> Reglas que nadie pueda romper impunemente.</li>
          <li><strong>Memoria activa:</strong> No olvidar los errores, no repetir los patrones.</li>
        </ol>
        <blockquote>"Argentina no tiene mala suerte. Tiene malos patrones. Y los patrones se pueden cambiar cuando se los ve con claridad. Esa es la esperanza del Hombre Gris."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Economía y Sociedad: Lo Que los Números No Dicen',
      description: 'Cómo los indicadores económicos ocultan realidades humanas en cada período.',
      content: `
        <h2>Detrás de Cada Número Hay una Familia</h2>
        <p>La historia económica argentina se suele contar con indicadores: PIB, inflación, deuda, desempleo. Pero detrás de cada número hay <strong>historias humanas</strong> que los gráficos no capturan.</p>
        <h3>1946-1955: Los Que Por Primera Vez Tuvieron</h3>
        <p>Cuando Perón implementó vacaciones pagas, millones de trabajadores viajaron al mar por primera vez. Mar del Plata se llenó de "cabecitas negras" que la clase media miraba con desprecio. Para esos trabajadores, ver el mar no era turismo: era <strong>la prueba de que eran personas con derechos</strong>.</p>
        <h3>1976-1983: Los Que Perdieron Todo</h3>
        <p>La desindustrialización de la dictadura no fue un número abstracto: fueron fábricas que cerraron, obreros que perdieron su identidad como trabajadores, barrios que se vaciaron, familias que se desintegraron. El tipo que trabajó 20 años en una fábrica y de un día para otro no tenía nada.</p>
        <h3>1991-2001: Los Nuevos Pobres</h3>
        <p>La convertibilidad creó una categoría sociológica nueva: los <strong>"nuevos pobres"</strong>. Clase media que de un mes a otro no podía pagar el colegio de los hijos, que vendía el auto, que dejaba de salir a comer. Gente con título universitario haciendo cola para un plan social. La vergüenza de la caída social es un trauma específicamente argentino.</p>
        <h3>Las Mujeres en la Historia</h3>
        <p>La historia que contamos suele ser de hombres. Pero las mujeres argentinas fueron protagonistas invisibles de cada período:</p>
        <ul>
          <li>Las <strong>Madres y Abuelas de Plaza de Mayo</strong> que desafiaron a la dictadura cuando nadie más se animaba.</li>
          <li>Las <strong>trabajadoras domésticas</strong> que sostuvieron la economía informal en cada crisis.</li>
          <li>Las <strong>maestras</strong> que mantuvieron funcionando las escuelas con sueldos miserables.</li>
          <li>Las <strong>mujeres del trueque</strong> que inventaron economías alternativas cuando el sistema colapsó.</li>
        </ul>
        <h3>La Memoria Como Herramienta</h3>
        <blockquote>"Cuando decimos '30.000 desaparecidos' o '57% de pobreza infantil' o '25% de desempleo', estamos hablando de personas que amaban, soñaban, tenían proyectos. Convertir historias en números es necesario para analizarlas. Pero convertir números en historias es necesario para sentirlas. Ambas cosas hacen falta."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 17, isRequired: true,
    },
    {
      courseId,
      title: 'Lecciones para el Futuro: Lo Que Este Medio Siglo Nos Enseña',
      description: 'Síntesis de aprendizajes sistémicos para construir una Argentina diferente.',
      content: `
        <h2>De la Comprensión a la Acción</h2>
        <p>Recorrimos medio siglo de historia argentina. Vimos péndulos, golpes, crisis, esperanzas y tragedias. La pregunta final no es "¿qué pasó?" sino <strong>"¿qué aprendimos y qué vamos a hacer diferente?"</strong></p>
        <h3>Las 10 Lecciones del Período 1945-2001</h3>
        <ol>
          <li><strong>La inclusión social genera lealtad pero no justifica el autoritarismo.</strong> Perón incluyó a millones, pero la concentración de poder produjo la reacción violenta que le siguió.</li>
          <li><strong>Prohibir un movimiento popular lo fortalece.</strong> La proscripción del peronismo fue el error más costoso de la historia política argentina.</li>
          <li><strong>Los golpes militares nunca resuelven nada.</strong> Cada golpe dejó al país peor que como lo encontró.</li>
          <li><strong>La democracia es el piso, no el techo.</strong> Tener elecciones es necesario pero no suficiente para una sociedad justa.</li>
          <li><strong>Las reformas económicas sin inclusión social explotan.</strong> Menem modernizó y privatizó, pero la exclusión de millones armó la bomba de 2001.</li>
          <li><strong>La deuda externa es una trampa.</strong> Cada ciclo de endeudamiento terminó en crisis. Ningún gobierno logró romper este patrón.</li>
          <li><strong>Los parches no sustituyen las reformas.</strong> La convertibilidad pareció una solución mágica hasta que se volvió una jaula.</li>
          <li><strong>La violencia política destruye a todos.</strong> No importa quién empiece o quién crea tener razón: todos pierden.</li>
          <li><strong>La sociedad civil es la reserva moral.</strong> Cuando todo falló en 2001, la gente se organizó desde abajo.</li>
          <li><strong>La memoria es una herramienta de futuro.</strong> Los países que olvidan su historia están condenados a repetirla.</li>
        </ol>
        <h3>El Modelo del Hombre Gris</h3>
        <p>El Hombre Gris no es de izquierda ni de derecha. No es peronista ni antiperonista. Es alguien que entiende los patrones, que ve más allá de los ciclos, y que trabaja para <strong>construir las instituciones y la cultura que rompan el péndulo</strong>.</p>
        <h3>Tu Rol en Esta Historia</h3>
        <ul>
          <li><strong>Conocer:</strong> Ya diste el primer paso al estudiar esta historia.</li>
          <li><strong>Comprender:</strong> Los patrones no son destino. Son hábitos colectivos que se pueden cambiar.</li>
          <li><strong>Actuar:</strong> Cada conversación donde rompés la polarización, cada vez que participás cívicamente, cada vez que exigís rendición de cuentas, estás interviniendo en el sistema.</li>
        </ul>
        <blockquote>"La historia argentina no es una tragedia griega donde el destino está escrito. Es un sistema complejo donde pequeñas intervenciones en los puntos correctos pueden cambiar la trayectoria. Vos sos una de esas posibles intervenciones. El próximo capítulo de esta historia depende de lo que hagamos con lo que aprendimos."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 17, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 30');

  // Quiz
  const existingQuiz30 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz30.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz30[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz30] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Argentina 1945-2001',
    description: 'Evaluá tu comprensión del medio siglo de péndulos y crisis.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions30 = [
    { quizId: quiz30.id, question: '¿Qué ley impulsó Eva Perón que transformó la democracia argentina?', type: 'multiple_choice' as const, options: JSON.stringify(['Ley de divorcio', 'Voto femenino (1947)', 'Ley de educación', 'Reforma agraria']), correctAnswer: JSON.stringify(1), explanation: 'El sufragio femenino de 1947 duplicó el padrón electoral y transformó la política argentina.', points: 2, orderIndex: 1 },
    { quizId: quiz30.id, question: 'La proscripción del peronismo (1955-1973) debilitó al movimiento peronista.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La prohibición fortaleció al peronismo al convertirlo en mística de resistencia.', points: 1, orderIndex: 2 },
    { quizId: quiz30.id, question: '¿Qué fue el Cordobazo?', type: 'multiple_choice' as const, options: JSON.stringify(['Un golpe militar', 'Una insurrección popular de obreros y estudiantes en 1969', 'Una reforma económica', 'Un tratado internacional']), correctAnswer: JSON.stringify(1), explanation: 'El Cordobazo fue una insurrección obrero-estudiantil que desestabilizó la dictadura de Onganía.', points: 2, orderIndex: 3 },
    { quizId: quiz30.id, question: '¿Qué significó el Juicio a las Juntas de 1985?', type: 'multiple_choice' as const, options: JSON.stringify(['Un juicio militar interno', 'Primera vez que un gobierno democrático juzgó a su propia dictadura en tribunal civil', 'Un juicio internacional como Núremberg', 'Una amnistía general']), correctAnswer: JSON.stringify(1), explanation: 'Argentina fue pionera mundial al juzgar y condenar a los comandantes de su dictadura en tribunales civiles.', points: 2, orderIndex: 4 },
    { quizId: quiz30.id, question: 'La convertibilidad (1 peso = 1 dólar) fue sostenible a largo plazo.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La convertibilidad tenía bugs fatales: destruía la industria local, requería endeudamiento creciente y no era sostenible.', points: 1, orderIndex: 5 },
    { quizId: quiz30.id, question: '¿Cuántos presidentes tuvo Argentina en los 10 días posteriores a la renuncia de De la Rúa?', type: 'multiple_choice' as const, options: JSON.stringify(['2', '3', '5', '7']), correctAnswer: JSON.stringify(2), explanation: 'Argentina tuvo 5 presidentes en 10 días, reflejando el colapso institucional total.', points: 2, orderIndex: 6 },
    { quizId: quiz30.id, question: 'El grito "Que se vayan todos" iba dirigido exclusivamente contra el presidente De la Rúa.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Era contra todo el sistema político: partidos, sindicatos, jueces, medios y empresarios.', points: 1, orderIndex: 7 },
    { quizId: quiz30.id, question: '¿Cuál es el patrón central del péndulo argentino 1945-2001?', type: 'multiple_choice' as const, options: JSON.stringify(['Progreso lineal continuo', 'Crisis → ruptura → refundación → luna de miel → agotamiento → crisis', 'Estabilidad institucional', 'Alternancia pacífica de partidos']), correctAnswer: JSON.stringify(1), explanation: 'El ciclo pendular se repitió múltiples veces, con cada fase dejando al país con menos capacidad institucional.', points: 2, orderIndex: 8 },
  ];

  for (const q of questions30) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions30.length, 'questions for course 30');
}

async function seedCourse31(authorId: number) {
  console.log('--- Course 31: Patrones Argentinos que Debemos Romper ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'patrones-argentinos-debemos-romper')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Patrones Argentinos que Debemos Romper',
      slug: 'patrones-argentinos-debemos-romper',
      description: 'Meta-análisis de los patrones que Argentina repite. El ciclo stop-go, el patrón caudillista, Buenos Aires vs Interior, la fuga de cerebros. Para cada uno: causa raíz, puntos de apalancamiento y diseño idealizado.',
      excerpt: 'Identifica y diseña intervenciones para romper los patrones que Argentina repite.',
      category: 'hombre-gris',
      level: 'advanced',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800',
      orderIndex: 31,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 31:', course[0].title);
  } else {
    console.log('Found existing course 31:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'Pensamiento Sistémico: Ver Patrones, No Eventos',
      description: 'Introducción al pensamiento sistémico aplicado a la realidad argentina.',
      content: `
        <h2>De los Titulares a los Patrones</h2>
        <p>Los noticieros te muestran <strong>eventos</strong>: un dólar que sube, un presidente que decreta, una protesta, un escándalo. Pero los eventos son la superficie. Debajo hay <strong>patrones</strong>: dinámicas que se repiten cíclicamente. Y debajo de los patrones hay <strong>estructuras</strong>: las reglas del juego que generan esos patrones.</p>
        <p>Este curso te va a enseñar a ver Argentina con ojos sistémicos: no para predecir el futuro, sino para entender por qué ciertos resultados se repiten y dónde intervenir para cambiarlos.</p>
        <h3>Los Tres Niveles de Comprensión</h3>
        <ol>
          <li><strong>Nivel 1 — Eventos:</strong> "El dólar subió hoy." Reacción emocional. Quejarse en Twitter.</li>
          <li><strong>Nivel 2 — Patrones:</strong> "El dólar sube cada vez que hay déficit fiscal y emisión monetaria." Comprensión de tendencias.</li>
          <li><strong>Nivel 3 — Estructuras:</strong> "El sistema político incentiva el gasto público excesivo porque los beneficios son inmediatos y visibles, mientras los costos son futuros y difusos." Comprensión profunda que permite diseñar intervenciones.</li>
        </ol>
        <h3>Herramientas Sistémicas</h3>
        <ul>
          <li><strong>Bucles de retroalimentación:</strong> Cuando A causa B y B refuerza A, tenés un bucle que se amplifica. La inflación genera expectativas de inflación que generan más inflación.</li>
          <li><strong>Puntos de apalancamiento:</strong> Lugares del sistema donde una pequeña intervención produce grandes cambios. Donella Meadows identificó 12 niveles de intervención sistémica.</li>
          <li><strong>Efectos retardados:</strong> Las consecuencias de muchas decisiones no se ven inmediatamente. El endeudamiento de los 90 explotó en 2001. El daño educativo de una década se ve 20 años después.</li>
          <li><strong>Modelo mental:</strong> Las creencias compartidas sobre cómo funciona el mundo. "En Argentina no se puede ahorrar en pesos" es un modelo mental que genera comportamientos que confirman el modelo.</li>
        </ul>
        <h3>Aplicación a Argentina</h3>
        <p>En las siguientes lecciones, vamos a analizar los principales patrones argentinos usando estas herramientas. Para cada patrón identificaremos:</p>
        <ol>
          <li>Cómo se manifiesta (los eventos que vemos)</li>
          <li>La dinámica subyacente (el bucle que lo sostiene)</li>
          <li>La causa raíz estructural</li>
          <li>Los puntos de apalancamiento para romperlo</li>
        </ol>
        <blockquote>"El pesimista argentino dice 'este país no tiene arreglo'. El optimista ingenuo dice 'con el próximo gobierno se arregla'. El pensador sistémico dice 'estos son los patrones, estas son las palancas, y así se interviene'. El Hombre Gris piensa sistémicamente."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Ciclo Stop-Go: Expansión, Crisis, Ajuste, Repetir',
      description: 'El patrón económico más persistente de Argentina.',
      content: `
        <h2>El Bucle Económico que Nunca Se Rompe</h2>
        <p>Desde 1950, Argentina repite un ciclo económico conocido como <strong>stop-go</strong>: períodos de expansión seguidos de crisis que llevan a ajustes que llevan a nueva expansión que lleva a nueva crisis. Es como un péndulo económico que oscila sin detenerse nunca.</p>
        <h3>Anatomía del Ciclo</h3>
        <ol>
          <li><strong>GO (Expansión):</strong> El gobierno aumenta el gasto público, los salarios suben, el consumo crece, la actividad económica se acelera. Todos contentos.</li>
          <li><strong>Sobrecalentamiento:</strong> La demanda supera la capacidad productiva. Los precios suben. Se importa más de lo que se exporta. Se necesitan dólares que no hay.</li>
          <li><strong>Crisis de balanza de pagos:</strong> Se acaban las reservas de dólares. El peso se devalúa. Los precios se disparan. El poder adquisitivo cae.</li>
          <li><strong>STOP (Ajuste):</strong> Se reduce el gasto, se suben las tasas de interés, se frena la economía. Recesión, desempleo, malestar social.</li>
          <li><strong>Estabilización:</strong> Con la economía frenada, la inflación baja, las cuentas externas mejoran. Se acumulan reservas.</li>
          <li><strong>Vuelta al paso 1:</strong> Un nuevo gobierno (o el mismo presionado por las urnas) vuelve a expandir.</li>
        </ol>
        <h3>¿Por Qué Se Repite?</h3>
        <ul>
          <li><strong>Incentivos políticos:</strong> Expandir da votos ahora; el costo viene después (probablemente le toque al siguiente gobierno).</li>
          <li><strong>Estructura productiva:</strong> Argentina exporta materias primas e importa manufacturas. Cuando crece, necesita más dólares para importar, pero no genera más dólares porque la producción agrícola tiene límites físicos.</li>
          <li><strong>Ausencia de ahorro:</strong> Ni el Estado ni los ciudadanos ahorran en pesos porque aprendieron que la inflación se los come. Sin ahorro interno, cada expansión depende de financiamiento externo.</li>
        </ul>
        <h3>Puntos de Apalancamiento</h3>
        <ul>
          <li><strong>Diversificar exportaciones:</strong> Si Argentina exportara más productos de alto valor (tecnología, servicios, manufacturas), el límite de dólares sería menos restrictivo.</li>
          <li><strong>Reglas fiscales:</strong> Límites institucionales al gasto público que sobrevivan a los cambios de gobierno.</li>
          <li><strong>Estabilidad monetaria creíble:</strong> Crear las condiciones para que los argentinos ahorren en pesos requiere décadas de consistencia.</li>
        </ul>
        <blockquote>"El ciclo stop-go no es un misterio: es un sistema con incentivos que premian la expansión cortoplacista y castigan la prudencia. Cambiá los incentivos y cambiás el resultado."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Patrón Caudillista: Salvadores y Dependencia',
      description: 'La búsqueda recurrente de un líder mesiánico que lo resuelva todo.',
      content: `
        <h2>Siempre Buscando al Mesías</h2>
        <p>Facundo, Rosas, Yrigoyen, Perón, Menem, Néstor... Argentina tiene una relación adictiva con los <strong>líderes fuertes</strong>. Cada cierto tiempo, la sociedad deposita en una persona la esperanza de que "arregle todo". Y cada vez, el resultado es el mismo: un período de éxito parcial seguido de una caída cuando el líder falla, se corrompe o muere.</p>
        <h3>El Bucle del Caudillismo</h3>
        <ol>
          <li><strong>Crisis de confianza institucional:</strong> Las instituciones fallan, la gente no confía en el sistema.</li>
          <li><strong>Emergencia del salvador:</strong> Aparece un líder que promete resolver lo que las instituciones no pueden.</li>
          <li><strong>Concentración de poder:</strong> El líder concentra poder porque "necesita herramientas para cambiar las cosas".</li>
          <li><strong>Debilitamiento institucional:</strong> Al concentrar poder en una persona, las instituciones se debilitan más.</li>
          <li><strong>Dependencia:</strong> Todo el sistema depende de una persona. Si se va, todo se cae.</li>
          <li><strong>Caída del líder:</strong> Por muerte, desgaste, corrupción o golpe. Vuelta al paso 1.</li>
        </ol>
        <h3>¿Por Qué Lo Repetimos?</h3>
        <ul>
          <li><strong>Herencia cultural:</strong> La tradición caudillista viene de la Colonia. El virrey, el caudillo, el presidente fuerte: la misma figura con diferentes nombres.</li>
          <li><strong>Urgencia:</strong> Cuando la crisis es grave, la gente quiere soluciones rápidas. Las instituciones son lentas; un líder fuerte es rápido.</li>
          <li><strong>Comodidad:</strong> Es más fácil delegar la responsabilidad en un líder que asumir la propia. "Que lo arregle el presidente" es más cómodo que "voy a participar activamente".</li>
        </ul>
        <h3>El Antídoto: Instituciones Fuertes</h3>
        <p>Los países que funcionan bien no dependen de tener buenos líderes. Tienen <strong>buenas instituciones</strong> que limitan lo que un mal líder puede destruir y potencian lo que un buen líder puede construir.</p>
        <ul>
          <li>Justicia independiente que ningún presidente pueda controlar</li>
          <li>Organismos de control que funcionen con cualquier gobierno</li>
          <li>Reglas fiscales que ningún congreso pueda romper fácilmente</li>
          <li>Prensa libre que no dependa de pauta oficial</li>
          <li>Sociedad civil activa que no delegue su poder</li>
        </ul>
        <blockquote>"El Hombre Gris no busca un salvador. Construye sistemas que no necesiten salvadores. Esa es la diferencia entre depender de la suerte de tener un buen líder y diseñar un país que funcione con líderes normales."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Buenos Aires vs. Interior: La Grieta Territorial',
      description: 'La concentración en Buenos Aires como desequilibrio sistémico fundacional.',
      content: `
        <h2>Un País con Cabeza de Goliat</h2>
        <p>Argentina es un país enorme (el octavo del mundo en superficie) donde <strong>un tercio de la población vive en el 0.1% del territorio</strong> (el AMBA: Ciudad y Gran Buenos Aires). Esta macrocefalia no es casualidad: es el resultado de 200 años de decisiones que concentraron poder, recursos e infraestructura en un solo punto.</p>
        <h3>Cómo Se Construyó el Desequilibrio</h3>
        <ul>
          <li><strong>1580-1810:</strong> Buenos Aires controla el puerto, único punto de contacto con el mundo.</li>
          <li><strong>1810-1880:</strong> Las guerras civiles se ganan desde Buenos Aires porque tiene los recursos del comercio exterior.</li>
          <li><strong>1880-1930:</strong> Los ferrocarriles van del campo al puerto, no conectan provincias entre sí. Toda la producción converge en Buenos Aires.</li>
          <li><strong>1930-presente:</strong> La industrialización se concentra en el cordón industrial del GBA. La gente migra del interior a Buenos Aires buscando trabajo.</li>
        </ul>
        <h3>Los Costos del Desequilibrio</h3>
        <ol>
          <li><strong>Vaciamiento del interior:</strong> Provincias con potencial enorme se despueblan. Jóvenes que se van a Buenos Aires a estudiar y no vuelven.</li>
          <li><strong>Conurbano insostenible:</strong> El Gran Buenos Aires crece sin planificación, sin infraestructura suficiente, con barrios precarios cada vez más extensos.</li>
          <li><strong>Distorsión política:</strong> La provincia de Buenos Aires tiene el 38% del padrón electoral. Ningún candidato puede ganar sin el conurbano. Esto distorsiona toda la agenda política.</li>
          <li><strong>Feudos provinciales:</strong> Las provincias chicas dependen de transferencias nacionales y se convierten en feudos donde un gobernador controla todo.</li>
        </ol>
        <h3>Puntos de Apalancamiento</h3>
        <ul>
          <li><strong>Conectividad digital:</strong> Internet y el trabajo remoto permiten producir valor desde cualquier punto del país. Fomentar hubs tecnológicos en el interior.</li>
          <li><strong>Infraestructura transversal:</strong> Rutas, trenes y vuelos que conecten provincias entre sí, no solo con Buenos Aires.</li>
          <li><strong>Descentralización fiscal real:</strong> Que las provincias recauden más y dependan menos de transferencias nacionales.</li>
          <li><strong>Universidades del interior:</strong> Crear polos de conocimiento en ciudades intermedias que retengan talento local.</li>
        </ul>
        <blockquote>"El federalismo argentino es una promesa incumplida. Mientras Buenos Aires concentre poder, riqueza e infraestructura, el interior será proveedor de materias primas y exportador de jóvenes. Revertir eso requiere decisiones que perjudiquen a Buenos Aires, lo cual ningún gobierno con base electoral porteña quiere hacer."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'La Fuga de Cerebros: Exportar Talento, Importar Frustración',
      description: 'El patrón de emigración de talento como síntoma y causa de deterioro sistémico.',
      content: `
        <h2>El País que Produce Genios y los Regala</h2>
        <p>Argentina invierte en formar profesionales de primera línea mundial: médicos, ingenieros, científicos, programadores, artistas. Y luego una parte significativa de ellos se va del país. Argentina tiene <strong>5 premios Nobel</strong> pero no puede retener a sus investigadores. Forma programadores excelentes que trabajan para empresas de Silicon Valley.</p>
        <h3>Los Números</h3>
        <ul>
          <li>Se estima que más de <strong>1 millón de argentinos</strong> con educación universitaria viven en el exterior.</li>
          <li>Cada crisis produce una ola emigratoria: 2001-2002 fue masiva, pero también hubo olas en los 70, los 80 y periódicamente desde entonces.</li>
          <li>El costo de formar un profesional universitario en Argentina es de aproximadamente $50.000-100.000 USD. Cada emigrante profesional es una inversión pública que otro país capitaliza gratis.</li>
        </ul>
        <h3>¿Por Qué Se Van?</h3>
        <ol>
          <li><strong>Inestabilidad:</strong> La imposibilidad de planificar a largo plazo en un país donde las reglas cambian constantemente.</li>
          <li><strong>Brecha salarial:</strong> Un programador argentino puede ganar 10 veces más trabajando remoto para el exterior.</li>
          <li><strong>Techo de cristal:</strong> En ciencia y tecnología, llega un punto donde las oportunidades de desarrollo simplemente no existen en Argentina.</li>
          <li><strong>Inseguridad:</strong> Física y jurídica. No sentirse seguro ni saber que las reglas van a respetarse.</li>
          <li><strong>Frustración acumulada:</strong> Años de crisis, promesas rotas y deterioro generan un agotamiento que empuja a irse.</li>
        </ol>
        <h3>El Bucle Vicioso</h3>
        <p>La fuga de cerebros genera un <strong>ciclo que se auto-refuerza</strong>: los mejores se van → menos talento local → menos innovación → menos oportunidades → más gente se quiere ir → los mejores se van.</p>
        <h3>Puntos de Apalancamiento</h3>
        <ul>
          <li><strong>Diáspora como activo:</strong> En vez de lamentar la emigración, conectar a los argentinos en el exterior con proyectos locales. Israel lo hace magistralmente.</li>
          <li><strong>Trabajo remoto:</strong> Permitir que la gente trabaje para empresas extranjeras desde Argentina, aportando divisas y conocimiento.</li>
          <li><strong>CONICET y sistema científico:</strong> Sostener la inversión en ciencia como política de Estado, no como variable de ajuste.</li>
          <li><strong>Retorno facilitado:</strong> Programas de incentivo para que los que se fueron puedan volver con sus conocimientos y redes.</li>
        </ul>
        <blockquote>"Un país que no retiene a sus mejores personas no es un país pobre por falta de talento. Es un país que elige ser pobre al destruir las condiciones para que el talento florezca aquí."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Patrón Inflacionario: La Droga Argentina',
      description: 'La inflación crónica como adicción sistémica y sus efectos devastadores.',
      content: `
        <h2>La Enfermedad que No Podemos Curar</h2>
        <p>Argentina ha tenido inflación de dos dígitos o más durante la mayor parte de su historia moderna. Tuvo hiperinflación en 1989-90. Tuvo la convertibilidad como "tratamiento de shock". Y volvió a tener inflación alta en el siglo XXI. Es como una <strong>adicción</strong>: todos saben que es destructiva, pero el sistema sigue generándola.</p>
        <h3>Cómo Funciona el Bucle Inflacionario</h3>
        <ol>
          <li><strong>El Estado gasta más de lo que recauda.</strong> El déficit fiscal se cubre emitiendo pesos.</li>
          <li><strong>Más pesos en circulación = más inflación.</strong> Los precios suben porque hay más dinero persiguiendo los mismos bienes.</li>
          <li><strong>Expectativas:</strong> Todos esperan que los precios sigan subiendo, así que aumentan preventivamente. Los sindicatos piden aumentos "por inflación futura". Las empresas remarcan "por las dudas".</li>
          <li><strong>Inercia:</strong> La inflación pasada se proyecta al futuro a través de contratos, alquileres, paritarias. Se auto-reproduce.</li>
          <li><strong>Fuga al dólar:</strong> Nadie quiere quedarse con pesos que pierden valor. La demanda de dólares presiona el tipo de cambio, que sube los precios de todo lo importado, que alimenta más inflación.</li>
        </ol>
        <h3>Lo Que la Inflación Destruye</h3>
        <ul>
          <li><strong>El ahorro:</strong> No se puede ahorrar en una moneda que pierde valor. Sin ahorro no hay inversión. Sin inversión no hay crecimiento.</li>
          <li><strong>La planificación:</strong> ¿Cómo hacés un plan de negocios si no sabés cuánto van a costar las cosas en 6 meses?</li>
          <li><strong>La equidad:</strong> La inflación es el impuesto más regresivo: golpea más a los que menos tienen porque no pueden protegerse.</li>
          <li><strong>La confianza:</strong> Cada billete que pierde valor es una promesa rota del Estado al ciudadano.</li>
          <li><strong>Los vínculos sociales:</strong> La discusión por "el precio justo" envenena la relación entre vecinos, entre empleador y empleado, entre consumidor y comerciante.</li>
        </ul>
        <h3>¿Tiene Solución?</h3>
        <p>Decenas de países tuvieron inflación crónica y la resolvieron. No es un misterio técnico: requiere equilibrio fiscal sostenido, banco central independiente, y tiempo para reconstruir la confianza. Lo difícil no es el "qué" sino el "cómo" político: ¿quién paga el costo del ajuste? ¿Cómo se sostiene la política en el tiempo cuando los costos son inmediatos y los beneficios tardan años?</p>
        <blockquote>"La inflación es el síntoma. La causa es un sistema político que no puede decir que no: no al gasto, no a las presiones sectoriales, no a la tentación de emitir. Curar la inflación sin curar la adicción al gasto es como sacarle la botella a un alcohólico sin tratar el alcoholismo."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Péndulo Político: De un Extremo al Otro',
      description: 'La oscilación permanente entre modelos opuestos que impide las políticas de Estado.',
      content: `
        <h2>El País que Derriba Lo Que Construyó</h2>
        <p>Argentina no tiene políticas de Estado. Tiene <strong>políticas de gobierno</strong> que duran lo que dura el gobierno y son desmanteladas por el siguiente. Es un péndulo que oscila entre modelos opuestos, destruyendo en cada oscilación lo que el otro construyó.</p>
        <h3>El Patrón de las Refundaciones</h3>
        <p>Cada nuevo gobierno argentino se presenta como una <strong>refundación</strong>: el anterior era el infierno, nosotros somos el cielo. Esto implica:</p>
        <ul>
          <li>Cambiar funcionarios de todos los niveles (no solo los políticos, también los técnicos).</li>
          <li>Revertir políticas del gobierno anterior, incluso las que funcionaban.</li>
          <li>Crear nuevos programas con nuevos nombres para hacer lo mismo de otra manera.</li>
          <li>Ignorar la evidencia generada por el gobierno anterior porque "eran datos de ellos".</li>
        </ul>
        <h3>Ejemplos Concretos</h3>
        <ul>
          <li><strong>Energía:</strong> Se nacionaliza YPF, se privatiza, se vuelve a nacionalizar parcialmente. Cada cambio destruye inversiones y planificación.</li>
          <li><strong>Tipo de cambio:</strong> Dólar libre, dólar controlado, cepo, convertibilidad, flotación. Cada modelo dura un gobierno.</li>
          <li><strong>Relaciones exteriores:</strong> Se mira a EEUU, se mira a China, se mira al Mercosur, se mira a Europa. Sin continuidad.</li>
          <li><strong>Educación:</strong> Cada gobierno reforma la reforma del anterior. Los docentes sobreviven a las reformas haciendo lo que pueden.</li>
        </ul>
        <h3>¿Por Qué No Hay Políticas de Estado?</h3>
        <ol>
          <li><strong>Polarización:</strong> El sistema político está tan polarizado que acordar con el adversario es visto como traición.</li>
          <li><strong>Electoralismo:</strong> Todo se piensa en función de la próxima elección, no del largo plazo.</li>
          <li><strong>Falta de instituciones de continuidad:</strong> No hay mecanismos que obliguen a mantener políticas más allá de un mandato.</li>
          <li><strong>Cultura del "borrón y cuenta nueva":</strong> La ilusión de que se puede empezar de cero cada 4 años.</li>
        </ol>
        <h3>El Antídoto</h3>
        <p>Políticas de Estado requieren <strong>acuerdos suprapartidarios</strong> en temas fundamentales: educación, ciencia, infraestructura, inserción internacional. No es utopía: Chile lo hizo con sus acuerdos de la transición, Uruguay con sus políticas educativas. Se necesita madurez política y sociedad civil que lo demande.</p>
        <blockquote>"Un país que cada 4 años destruye lo que construyó y empieza de cero no avanza: gira en círculos. El desafío del Hombre Gris es romper el péndulo sin caer en la inmovilidad."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'La Cultura del Atajo: Viveza Criolla como Bug Sistémico',
      description: 'La viveza criolla analizada como patrón cultural que destruye la confianza social.',
      content: `
        <h2>El Costo Invisible de "Ser Vivo"</h2>
        <p>La "viveza criolla" es celebrada culturalmente como astucia, como la capacidad de salir adelante en un sistema que no funciona. Colarse en la fila, evadir impuestos, conseguir un "acomodo", conocer a alguien que te haga el trámite. Individualmente parece racional. Sistémicamente es <strong>devastador</strong>.</p>
        <h3>La Economía de la Confianza</h3>
        <p>La confianza social es un <strong>recurso económico</strong> medible. Los países con alta confianza (Dinamarca, Noruega, Japón) tienen menores costos de transacción: no necesitan 47 sellos para cada trámite, no necesitan escribir contratos de 200 páginas, la gente cumple su palabra porque el sistema funciona.</p>
        <p>Argentina tiene uno de los niveles de <strong>confianza interpersonal más bajos del mundo</strong>. Eso no es "carácter nacional": es el resultado de un sistema que premia el atajo y castiga al que cumple las reglas.</p>
        <h3>El Bucle de la Desconfianza</h3>
        <ol>
          <li>Las reglas son injustas o absurdas → parece razonable evitarlas.</li>
          <li>Mucha gente evita las reglas → las reglas se vuelven más estrictas para compensar.</li>
          <li>Reglas más estrictas son más difíciles de cumplir → más gente las evita.</li>
          <li>El que cumple las reglas se siente estafado → empieza a evitarlas también.</li>
          <li>La desconfianza generalizada aumenta los costos para todos.</li>
        </ol>
        <h3>Ejemplos Cotidianos</h3>
        <ul>
          <li><strong>Impuestos:</strong> La evasión fiscal se estima en más del 30% de la recaudación potencial. El que paga subsidia al que evade.</li>
          <li><strong>Tránsito:</strong> Las normas de tránsito se cumplen selectivamente. El resultado: Argentina tiene tasas de accidentes viales altísimas.</li>
          <li><strong>Trámites:</strong> La burocracia excesiva nace de la desconfianza del Estado hacia el ciudadano. Y la desconfianza es mutua.</li>
          <li><strong>Trabajo en negro:</strong> Más del 35% del empleo es informal. Trabajadores sin derechos, Estado sin ingresos.</li>
        </ul>
        <h3>Romper el Patrón</h3>
        <p>No se cambia una cultura con moralejas. Se cambia con <strong>diseño de incentivos</strong>:</p>
        <ul>
          <li>Simplificar las reglas para que cumplirlas sea fácil</li>
          <li>Hacer visible el costo del atajo (no solo el beneficio individual)</li>
          <li>Premiar el cumplimiento, no solo castigar la evasión</li>
          <li>Que los líderes den el ejemplo (la corrupción desde arriba autoriza el atajo desde abajo)</li>
        </ul>
        <blockquote>"La viveza criolla es la respuesta racional a un sistema irracional. No se puede pedir honestidad en un sistema que premia la deshonestidad. Primero arreglá el sistema."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Estado como Botín: Captura Institucional',
      description: 'Cómo los intereses privados capturan las instituciones públicas.',
      content: `
        <h2>Cuando el Estado Deja de Ser de Todos</h2>
        <p>En teoría, el Estado es un instrumento de todos los ciudadanos. En la práctica argentina, el Estado es frecuentemente un <strong>botín</strong>: un conjunto de recursos (empleos, contratos, presupuesto, regulaciones) que el grupo que gana las elecciones reparte entre sus aliados.</p>
        <h3>Formas de Captura del Estado</h3>
        <ul>
          <li><strong>Empleo público como moneda de cambio:</strong> Los empleos estatales se usan para premiar militantes, parientes y amigos. El resultado: un Estado sobredimensionado con gente que cobra pero no produce valor público.</li>
          <li><strong>Contrataciones dirigidas:</strong> Las licitaciones públicas se diseñan a medida del proveedor amigo. Los pliegos tienen requisitos que solo una empresa puede cumplir.</li>
          <li><strong>Regulaciones capturadas:</strong> Las empresas reguladas influyen en la regulación. El regulador termina trabajando para el regulado, no para el público.</li>
          <li><strong>Justicia domesticada:</strong> Jueces que deben su nombramiento al poder político tienden a fallar a su favor.</li>
          <li><strong>Obra pública como negocio:</strong> La obra pública sobrefacturada es una de las principales fuentes de financiamiento político.</li>
        </ul>
        <h3>El Costo</h3>
        <p>El Estado capturado no solo es ineficiente: <strong>traiciona a quienes más lo necesitan</strong>. Las personas más vulnerables (que dependen de la salud pública, la educación pública, los programas sociales) reciben servicios degradados porque los recursos se desvían.</p>
        <h3>Diseño Anti-Captura</h3>
        <ol>
          <li><strong>Servicio civil profesionalizado:</strong> Empleo público por concurso con estabilidad, no por amiguismo. Los que producen ascienden; los que no, se van.</li>
          <li><strong>Transparencia radical:</strong> Todos los contratos, gastos y decisiones públicas accesibles en tiempo real por internet.</li>
          <li><strong>Organismos de control independientes:</strong> Financiados por ley, con directivos elegidos por concurso, que no respondan al gobierno de turno.</li>
          <li><strong>Participación ciudadana:</strong> Presupuesto participativo, audiencias públicas obligatorias, derecho de acceso a información.</li>
          <li><strong>Rotación y límites:</strong> Límites de mandato para todos los cargos. Prohibición de familiares en puestos públicos.</li>
        </ol>
        <blockquote>"Un Estado capturado por intereses privados es peor que un Estado ausente: tiene el poder de un Estado pero sirve a los intereses de pocos. Liberar al Estado de la captura es la tarea cívica más importante."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Patrón de la Queja sin Acción',
      description: 'La cultura del lamento como mecanismo de descarga que reemplaza la acción.',
      content: `
        <h2>Quejarse Es el Deporte Nacional (Y No Ayuda)</h2>
        <p>Los argentinos somos campeones mundiales de la queja. Nos quejamos del gobierno, de los impuestos, del tránsito, del vecino, del clima, de todo. Pero la queja en Argentina funciona como <strong>válvula de escape</strong>: libera presión emocional sin producir cambio. Es un patrón que nos mantiene cómodos en la impotencia.</p>
        <h3>La Anatomía de la Queja</h3>
        <ul>
          <li><strong>La queja como identidad:</strong> "Este país es un desastre" se convierte en parte de quiénes somos. Si el país mejorara, ¿de qué hablaríamos?</li>
          <li><strong>La queja como conexión:</strong> Quejarse juntos genera vínculo social. El bar, el taxi, el chat de WhatsApp: la queja compartida nos une.</li>
          <li><strong>La queja como justificación:</strong> "Con este país, ¿para qué voy a hacer algo?" La queja justifica la inacción.</li>
          <li><strong>La queja como descarga:</strong> Después de quejarnos, nos sentimos "mejor" sin haber cambiado nada.</li>
        </ul>
        <h3>Queja vs. Diagnóstico</h3>
        <p>Hay una diferencia fundamental entre <strong>quejarse y diagnosticar</strong>:</p>
        <ul>
          <li><strong>Queja:</strong> "Los políticos son todos corruptos." Generalización que paraliza.</li>
          <li><strong>Diagnóstico:</strong> "El sistema de financiamiento de campañas no tiene controles efectivos, lo que incentiva la corrupción." Análisis que sugiere intervención.</li>
        </ul>
        <h3>De la Queja a la Acción</h3>
        <ol>
          <li><strong>Convertí cada queja en pregunta:</strong> "Los hospitales están destruidos" → "¿Qué necesitaría el hospital de mi barrio y quién decide el presupuesto?"</li>
          <li><strong>Buscá el punto de intervención:</strong> ¿Quién toma la decisión? ¿Cómo puedo influir en esa decisión?</li>
          <li><strong>Acción mínima viable:</strong> No necesitás cambiar el país. Necesitás hacer UNA cosa concreta esta semana.</li>
          <li><strong>Registrá resultados:</strong> Cada pequeño logro rompe el ciclo de impotencia.</li>
        </ol>
        <blockquote>"El Hombre Gris no se queja: diagnostica. No lamenta: diseña. No espera que alguien lo salve: actúa. La diferencia entre una queja y una propuesta es una pregunta: ¿y qué vamos a hacer al respecto?"</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Puntos de Apalancamiento: Dónde Intervenir',
      description: 'Los lugares del sistema argentino donde pequeñas intervenciones producen grandes cambios.',
      content: `
        <h2>No Todo Tiene el Mismo Efecto</h2>
        <p>Donella Meadows, una de las pensadoras sistémicas más importantes del siglo XX, identificó <strong>12 niveles de intervención</strong> en un sistema, ordenados de menor a mayor impacto. Vamos a aplicar su framework a Argentina.</p>
        <h3>Los Niveles (de menor a mayor impacto)</h3>
        <ol>
          <li><strong>Parámetros:</strong> Cambiar números (ej: subir o bajar impuestos). Es lo más fácil y lo menos efectivo. Todos los gobiernos lo hacen.</li>
          <li><strong>Stocks y flujos:</strong> Cambiar la infraestructura física (ej: construir rutas, hospitales). Importante pero lento.</li>
          <li><strong>Regulaciones:</strong> Cambiar las reglas formales (ej: ley de financiamiento de partidos). Más impacto pero depende de la implementación.</li>
          <li><strong>Flujos de información:</strong> Hacer visible lo que estaba oculto (ej: datos abiertos de gasto público). MUY poderoso. La transparencia cambia comportamientos.</li>
          <li><strong>Estructura del sistema:</strong> Cambiar quién decide qué (ej: descentralización real). Difícil pero transformador.</li>
          <li><strong>Objetivos del sistema:</strong> Cambiar para qué existe el sistema (ej: el Estado existe para servir al ciudadano, no al revés).</li>
          <li><strong>Modelos mentales:</strong> Cambiar las creencias profundas que sostienen el sistema (ej: "el Estado es de todos, no del gobierno de turno"). El nivel más difícil y más transformador.</li>
        </ol>
        <h3>Intervenciones de Alto Apalancamiento para Argentina</h3>
        <ul>
          <li><strong>Transparencia radical:</strong> Hacer que toda información pública sea accesible en tiempo real. Cuando la gente ve a dónde va su plata, exige rendición de cuentas.</li>
          <li><strong>Educación cívica real:</strong> No la del manual aburrido, sino la que enseña a leer un presupuesto, hacer un pedido de información, participar en una audiencia pública.</li>
          <li><strong>Servicio civil meritocrático:</strong> Un Estado donde los funcionarios sean profesionales que se quedan cuando cambia el gobierno.</li>
          <li><strong>Justicia rápida y accesible:</strong> Un sistema judicial que resuelva conflictos en meses, no en décadas.</li>
          <li><strong>Conectividad del interior:</strong> Internet de alta velocidad en todo el territorio para descentralizar la economía del conocimiento.</li>
        </ul>
        <blockquote>"No necesitás cambiar todo. Necesitás encontrar las palancas correctas. Una ley de transparencia bien implementada puede tener más impacto que 100 promesas de campaña."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Diseño Idealizado: La Argentina que Podemos Construir',
      description: 'Ejercicio de diseño idealizado: si pudieras diseñar Argentina desde cero, ¿cómo sería?',
      content: `
        <h2>Si Pudieras Empezar de Cero</h2>
        <p>Russell Ackoff, uno de los padres del pensamiento sistémico, propuso un ejercicio poderoso: el <strong>diseño idealizado</strong>. La premisa es: "Si el sistema actual desapareciera mañana y pudieras diseñar uno nuevo desde cero, ¿cómo sería?" No estás limitado por lo que existe. Estás limitado solo por lo que es posible.</p>
        <h3>La Argentina Idealizada</h3>
        <p>Después de estudiar los patrones argentinos, imaginemos un sistema que <strong>no los reproduzca</strong>:</p>
        <h4>Economía</h4>
        <ul>
          <li>Moneda estable respaldada por un banco central genuinamente independiente con mandato constitucional.</li>
          <li>Economía diversificada: agro, industria, servicios, tecnología, energía. No dependiente de un solo producto.</li>
          <li>Sistema fiscal simple, justo y difícil de evadir. Pocos impuestos pero bien diseñados.</li>
          <li>Red de seguridad social universal que no dependa de la voluntad del gobierno de turno.</li>
        </ul>
        <h4>Política</h4>
        <ul>
          <li>Democracia con participación real: presupuesto participativo, referéndums vinculantes, revocatoria de mandato efectiva.</li>
          <li>Financiamiento público de campañas con control estricto. Prohibición de aportes empresariales.</li>
          <li>Justicia independiente con jueces elegidos por mérito, no por amiguismo político.</li>
          <li>Federalismo fiscal real: las provincias se autofinancian y deciden sus prioridades.</li>
        </ul>
        <h4>Sociedad</h4>
        <ul>
          <li>Educación pública de excelencia con docentes bien pagos y evaluados.</li>
          <li>Cultura de la legalidad: cumplir las reglas es lo normal, no la excepción.</li>
          <li>Medios de comunicación diversos, independientes del poder político y económico.</li>
          <li>Sociedad civil fuerte: organizaciones que controlan al Estado y proponen mejoras.</li>
        </ul>
        <h3>Del Ideal a lo Posible</h3>
        <p>El diseño idealizado no es fantasía: es una <strong>brújula</strong>. No te dice qué hacer mañana (no podés refundar el país un lunes). Te dice <strong>en qué dirección caminar</strong>. Cada decisión personal, cada voto, cada acción cívica puede acercarte al ideal o alejarte.</p>
        <h3>Tu Compromiso Personal</h3>
        <p>Este curso termina con una invitación. Elegí <strong>UN patrón</strong> de los que estudiamos que quieras ayudar a romper. Solo uno. Y comprometete a hacer una acción concreta al respecto este mes:</p>
        <ol>
          <li>Si elegís la transparencia: hacé un pedido de acceso a información pública.</li>
          <li>Si elegís la polarización: mantené una conversación genuina con alguien que piense diferente.</li>
          <li>Si elegís la participación: asistí a una sesión del Concejo Deliberante de tu municipio.</li>
          <li>Si elegís la educación: voluntariá en una organización que trabaje con educación.</li>
        </ol>
        <blockquote>"El Hombre Gris no es un soñador. Es un diseñador de sistemas que empieza por lo que puede cambiar hoy. No espera la Argentina perfecta: la construye, una intervención a la vez, un patrón roto a la vez, una conversación a la vez. Y sabe que la suma de millones de pequeñas acciones inteligentes es más poderosa que cualquier revolución."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 15, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 31');

  // Quiz
  const existingQuiz31 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz31.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz31[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz31] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Patrones Argentinos que Debemos Romper',
    description: 'Evaluá tu comprensión de los patrones sistémicos y los puntos de apalancamiento.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions31 = [
    { quizId: quiz31.id, question: '¿Cuáles son los tres niveles de comprensión sistémica?', type: 'multiple_choice' as const, options: JSON.stringify(['Pasado, presente, futuro', 'Eventos, patrones, estructuras', 'Economía, política, sociedad', 'Causa, efecto, solución']), correctAnswer: JSON.stringify(1), explanation: 'El pensamiento sistémico va de los eventos visibles a los patrones recurrentes y a las estructuras que los generan.', points: 2, orderIndex: 1 },
    { quizId: quiz31.id, question: 'El ciclo stop-go se repite porque los incentivos políticos premian la expansión cortoplacista.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Expandir la economía da votos ahora; el costo del ajuste viene después y probablemente le toque al siguiente gobierno.', points: 1, orderIndex: 2 },
    { quizId: quiz31.id, question: '¿Qué nivel de intervención sistémica tiene mayor impacto según Donella Meadows?', type: 'multiple_choice' as const, options: JSON.stringify(['Cambiar parámetros (impuestos, tasas)', 'Construir infraestructura', 'Cambiar modelos mentales y objetivos del sistema', 'Modificar regulaciones']), correctAnswer: JSON.stringify(2), explanation: 'Los modelos mentales y los objetivos del sistema son los niveles más profundos y transformadores de intervención.', points: 2, orderIndex: 3 },
    { quizId: quiz31.id, question: 'La viveza criolla es un rasgo cultural innato de los argentinos.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La viveza criolla es la respuesta racional a un sistema que premia el atajo. Cambiando los incentivos se cambia el comportamiento.', points: 1, orderIndex: 4 },
    { quizId: quiz31.id, question: '¿Qué diferencia al Hombre Gris del pesimista y del optimista ingenuo?', type: 'multiple_choice' as const, options: JSON.stringify(['No tiene opinión política', 'Piensa sistémicamente e identifica palancas de cambio', 'Siempre está en el centro político', 'Es indiferente a los problemas']), correctAnswer: JSON.stringify(1), explanation: 'El Hombre Gris ve patrones, identifica estructuras y busca puntos de apalancamiento en vez de quejarse o esperar milagros.', points: 2, orderIndex: 5 },
    { quizId: quiz31.id, question: 'El "diseño idealizado" es un ejercicio de fantasía sin aplicación práctica.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El diseño idealizado es una brújula que indica la dirección. No dice qué hacer mañana, pero orienta cada decisión.', points: 1, orderIndex: 6 },
    { quizId: quiz31.id, question: '¿Cuál es un punto de apalancamiento de alto impacto para Argentina?', type: 'multiple_choice' as const, options: JSON.stringify(['Subir o bajar impuestos', 'Transparencia radical de información pública', 'Cambiar el nombre de programas sociales', 'Construir más rutas']), correctAnswer: JSON.stringify(1), explanation: 'La transparencia (flujos de información) es un punto de alto apalancamiento: cuando la gente ve cómo se gasta su dinero, exige rendición de cuentas.', points: 2, orderIndex: 7 },
    { quizId: quiz31.id, question: 'La diferencia entre queja y diagnóstico es que el diagnóstico sugiere puntos de intervención.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Quejarse paraliza; diagnosticar identifica causas y sugiere dónde actuar.', points: 1, orderIndex: 8 },
  ];

  for (const q of questions31) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions31.length, 'questions for course 31');
}

async function main() {
  console.log('Seeding Road 5: Raíces Vivas...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) { console.log('No users found.'); return; }
    const authorId = author.id;
    await seedCourse29(authorId);
    await seedCourse30(authorId);
    await seedCourse31(authorId);
    console.log('Road 5 seeding complete!');
  } catch (error) { console.error('Error:', error); throw error; }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
