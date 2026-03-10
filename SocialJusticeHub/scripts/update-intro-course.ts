import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions } = schema;
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🔥 Actualizando curso "Introducción al Hombre Gris"...');

  // 1. Find the course
  const [course] = await db.select().from(courses).where(eq(courses.slug, 'introduccion-al-hombre-gris')).limit(1);
  if (!course) {
    console.log('❌ Curso no encontrado. Ejecutá seed-courses.ts primero.');
    process.exit(1);
  }
  console.log('✅ Curso encontrado:', course.title, '(ID:', course.id, ')');

  // 2. Update course metadata
  await db.update(courses).set({
    description: 'Un viaje desde la raíz etimológica de lo humano hasta el brillo de la plata refinada. Este curso explora qué significa ser hombre, por qué gris no es ausencia sino síntesis, cómo las crisis nos refinan como plata en el fuego, y por qué romper la polarización es el acto más valiente de nuestro tiempo. Basado en etimología, historia, las psicografías de Parravicini y una invitación a transformarte — ahora.',
    excerpt: 'De la tierra al brillo: etimología, humanidad y el coraje de ser gris en un mundo blanco y negro.',
    duration: 200,
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
  // LECCIONES — El arco narrativo: Tierra → Gris → Fuego → Plata
  // ═══════════════════════════════════════════════════════════════

  const lessons = [

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 1: Homo, Humus, Humildad
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Homo, Humus, Humildad — ¿Qué significa ser Hombre?',
      description: 'Un viaje a la raíz de lo que somos: de la tierra que nos nombra a la humanidad que nos define.',
      content: `
<h2>La palabra que nos nombra</h2>

<p>Antes de hablar del Hombre Gris, necesitamos hacernos una pregunta que rara vez nos hacemos: <strong>¿qué significa ser hombre?</strong> No hombre como género — sino como especie. Como humanidad. Como eso que somos cuando dejamos de lado los títulos, las banderas y las opiniones, y nos miramos a los ojos.</p>

<p>La respuesta está escondida en la propia palabra.</p>

<h3>Homo: el que viene de la tierra</h3>

<p><em>Homo</em>, la palabra latina que nos nombra, no viene de un lugar de grandeza. Viene de <strong><em>humus</em></strong>: tierra, suelo, barro. El ser humano es, literalmente, <em>el que viene de la tierra</em>. No del cielo, no de las estrellas, no de un trono. Del barro.</p>

<p>De esa misma raíz nacen tres palabras que deberían ir siempre juntas:</p>

<ul>
  <li><strong><em>Humano</em></strong> — el que viene del suelo</li>
  <li><strong><em>Humilde</em></strong> — del latín <em>humilis</em>, "cercano a la tierra", lo que está abajo, lo que no se eleva por encima</li>
  <li><strong><em>Humanidad</em></strong> — la cualidad de reconocernos como tierra compartida</li>
</ul>

<blockquote>
  <p>Ser humano, ser humilde y ser parte de la humanidad no son tres cosas distintas. Son la misma cosa dicha tres veces.</p>
</blockquote>

<p>Los romanos lo entendían. Para ellos, <em>humanitas</em> no significaba solo "la especie humana". Significaba la capacidad de sentir compasión, de cultivarse, de reconocer en el otro a un igual. Perder la <em>humanitas</em> era volverse bestia — no por ser débil, sino por olvidar que todos venimos del mismo suelo.</p>

<h3>La paradoja del barro y la grandeza</h3>

<p>Acá está lo extraordinario: somos tierra que piensa. Polvo que sueña. Barro que escribe poesía, que construye puentes, que mira el cielo y se pregunta qué hay más allá. No hay nada más asombroso en el universo conocido que un puñado de átomos de carbono y agua que un día se levantó, miró alrededor y dijo: <em>"¿Qué significa todo esto?"</em></p>

<p>Pero esa grandeza no nos eleva por encima de la tierra — nos conecta más profundamente con ella. El ser humano más brillante de la historia comparte el mismo barro original que el más anónimo. No hay jerarquía en el <em>humus</em>. La tierra no distingue entre los huesos de un rey y los de un campesino.</p>

<h3>Cultura: cultivar lo humano</h3>

<p>Otra palabra que nace de la tierra: <strong><em>cultura</em></strong>, del latín <em>colere</em> — cultivar el suelo. Antes de significar arte, música o tradiciones, <em>cultura</em> significaba meter las manos en la tierra y hacer crecer algo. Después se extendió: cultivar la mente, cultivar el espíritu, cultivar la comunidad.</p>

<p>Entonces, si juntamos todo: <strong>ser humano es ser tierra que se cultiva</strong>. No nacemos terminados. Nacemos como semilla — y lo que hagamos con esta vida es nuestro cultivo.</p>

<h3>¿Qué tiene que ver esto con el Hombre Gris?</h3>

<p>Todo. Porque el Hombre Gris no se presenta como un superhéroe ni como un mesías. No baja del cielo con respuestas. <strong>Emerge de la tierra</strong> — del mismo barro, del mismo suelo que pisamos todos. Es humano en el sentido más profundo de la palabra: viene de abajo, se reconoce parte del todo, y desde ahí construye.</p>

<p>El Hombre Gris es humilde no por debilidad, sino porque entiende la etimología de su propio nombre. Sabe que <em>ser humano</em> y <em>ser humilde</em> son la misma raíz. Y que la grandeza no está en elevarse por encima de los demás, sino en cultivar algo que nos haga crecer a todos.</p>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Si "ser humano" significa "venir de la tierra", entonces tu vida es un cultivo. ¿Qué estás cultivando? ¿Qué crece en el suelo de tus días — resentimiento o esperanza? ¿Muros o puentes? ¿Y qué semilla podrías plantar hoy que todavía no plantaste?</p>
</blockquote>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 20,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 2: Gris — El color que guarda todos los colores
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Gris — El color que guarda todos los colores',
      description: 'Etimología del gris, la rebeldía de lo complejo, y por qué negarse a elegir bando es el acto más libre.',
      content: `
<h2>El color que nadie elige — y que lo contiene todo</h2>

<p>Si le pedís a alguien su color favorito, nadie dice gris. El gris no tiene hinchada. No tiene bandera. No genera pasión a primera vista. Y quizás <strong>eso es exactamente lo que lo hace tan poderoso</strong>.</p>

<h3>De dónde viene la palabra</h3>

<p>La palabra <em>gris</em> llegó al castellano desde el francés antiguo <em>gris</em>, que a su vez viene del fráncico (germánico antiguo) <strong><em>grīs</em></strong>. En las lenguas germánicas, la raíz está emparentada con <em>grizzled</em> — el pelo que mezcla colores, las canas que aparecen con los años. En inglés antiguo, <em>grey</em> se asociaba con la sabiduría del que ya vivió suficiente como para ver matices donde otros ven absolutos.</p>

<blockquote>
  <p>El gris, en su origen, no es el color del aburrimiento. Es el color de la experiencia. De quien ya aprendió que la vida no viene en blanco y negro.</p>
</blockquote>

<h3>Gris no es ausencia — es síntesis</h3>

<p>Hay un malentendido enorme con el gris. Se lo asocia con lo neutro, lo tibio, lo que no se define. Pero pensalo desde la física: <strong>el gris es lo que ocurre cuando todas las longitudes de onda de la luz se mezclan en partes iguales</strong>. No es que no tenga color. <em>Los tiene todos.</em></p>

<p>Mezclar blanco y negro no anula nada. Crea algo nuevo que contiene a ambos. El gris no elimina los extremos — los integra. Los abraza. Los trasciende.</p>

<p>Y esto no es solo física. Es filosofía. Es política. Es vida.</p>

<h3>El mundo te quiere en blanco o negro</h3>

<p>Vivimos en una época que nos empuja a elegir bando con la urgencia de quien te pide que saltes de un edificio en llamas. ¿Derecha o izquierda? ¿Patria o colonia? ¿Conmigo o contra mí? Las redes sociales premian el extremo — un tuit moderado no se viraliza, una indignación sí. Los medios monetizan el conflicto — la grieta vende, el matiz aburre.</p>

<p>Y así, sin darnos cuenta, vamos pintando al mundo en dos colores. Y a cualquiera que se resista a elegir le decimos: <em>"Tibio. No te definís. Sos parte del problema."</em></p>

<p>Pero, ¿y si fuera exactamente al revés?</p>

<h3>Ser gris es un acto de rebeldía</h3>

<p><strong>En un mundo que te exige ser blanco o negro, elegir el gris es el acto más libre que existe.</strong> Es decir: <em>"Soy más complejo que tu etiqueta. No me vas a reducir a una consigna. Puedo ver verdad en dos lugares opuestos sin que me explote la cabeza."</em></p>

<p>El gris no es cobardía. Es el coraje de sostener la complejidad cuando todos a tu alrededor están simplificando. Es la madurez de saber que casi nunca un bando tiene toda la razón — y que buscar el matiz no te hace débil, te hace honesto.</p>

<h3>El gris en la naturaleza</h3>

<p>Mirá dónde aparece el gris en el mundo natural y decime si te parece un color menor:</p>

<ul>
  <li><strong>El amanecer</strong>, antes de que salga el sol — ese momento en que el cielo no es ni noche ni día, sino pura posibilidad</li>
  <li><strong>La ceniza</strong>, que fertiliza la tierra después del fuego — de la destrucción nace el nutriente más rico</li>
  <li><strong>El acero</strong>, que sostiene edificios, puentes y ciudades enteras</li>
  <li><strong>La materia gris</strong> del cerebro, donde nacen todas las ideas que alguna vez cambiaron el mundo</li>
  <li><strong>La piedra</strong>, que es la memoria de la tierra, capas y capas de historia comprimida</li>
  <li><strong>La plata sin pulir</strong> — opaca, gris, sin brillo aparente. Pero con toda la capacidad de reflejar la luz del universo</li>
</ul>

<p>El gris no es triste. <strong>El gris es potencial.</strong></p>

<h3>La plata antes de ser plata</h3>

<p>Esto es lo que más importa de todo: un lingote de plata recién extraído de la mina no brilla. Es un pedazo de metal gris, opaco, cubierto de impurezas. Si lo vieras tirado en el suelo, no le darías importancia. No parece nada especial.</p>

<p>Pero adentro de ese metal gris está toda la capacidad de brillar. Toda la potencia de reflejar la luz. Toda la belleza que alguna vez viste en una pieza de plata pulida. <strong>Ya está ahí</strong>. Solo necesita el proceso de refinamiento.</p>

<p>Esa es la metáfora central de este curso y de este movimiento: <strong>el Hombre Gris es la plata antes de ser pulida</strong>. Es el potencial humano completo, todavía cubierto de escorias — prejuicios, polarizaciones, miedos, individualismos — esperando el fuego que lo revele.</p>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Pensá en una situación reciente donde alguien te obligó a elegir bando — en una discusión política, en redes sociales, en una charla de café. ¿Qué matiz se perdió en esa discusión? ¿Qué verdad quedó afuera porque no encajaba en ninguno de los dos extremos? ¿Y qué hubiera pasado si en vez de elegir un lado, hubieras elegido la complejidad?</p>
</blockquote>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 3: Plata que se refina
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Plata que se refina — El proceso de brillar',
      description: 'El fuego como transformador: de la metalurgia antigua a la crisis argentina, el brillo se conquista pasando por el dolor.',
      content: `
<h2>El orfebre y su fuego</h2>

<p>En el mundo antiguo, refinar plata era un oficio sagrado. No cualquiera podía hacerlo. Requería paciencia extrema, conocimiento profundo del fuego, y una sensibilidad que pocas artes exigían.</p>

<p>El proceso se llamaba <strong>copelación</strong>. El orfebre colocaba la plata en bruto — gris, opaca, mezclada con plomo, cobre y otras impurezas — en un crisol de hueso o ceniza. Después encendía el fuego. No un fuego cualquiera: un fuego controlado, sostenido, que debía alcanzar exactamente la temperatura necesaria para que las impurezas se separaran del metal noble sin destruirlo.</p>

<p>El orfebre no podía irse. No podía distraerse. <strong>Tenía que quedarse mirando el fuego</strong>, observando cómo la escoria subía a la superficie y el metal se iba purificando. Si el fuego era demasiado bajo, las impurezas no salían. Si era demasiado alto, la plata se arruinaba. El arte estaba en sostener la temperatura justa — y en esperar.</p>

<h3>El momento en que la plata está lista</h3>

<p>¿Y cómo sabía el orfebre que el refinamiento había terminado? Hay un texto antiguo que lo describe con una imagen que, una vez que la escuchás, no se te olvida más:</p>

<blockquote>
  <p><em>"Se sentará como refinador y purificador de plata; purificará a los hijos y los afinará como oro y como plata."</em> — Malaquías 3:3</p>
</blockquote>

<p>La tradición de los orfebres antiguos dice que <strong>la plata estaba lista cuando el orfebre podía ver su propio reflejo en el metal líquido</strong>. Mientras hubiera impurezas, la superficie era turbia, opaca, distorsionada. Pero cuando la última escoria era removida, el metal se volvía tan puro, tan transparente, que funcionaba como un espejo.</p>

<p>Pensalo un segundo: <strong>el propósito del refinamiento no era hacer brillar la plata para que la admiren. Era convertirla en un espejo — algo donde otros pudieran verse reflejados.</strong></p>

<h3>Argentina: la tierra de la plata</h3>

<p>Ahora bien. ¿Sabés de dónde viene el nombre <em>Argentina</em>?</p>

<p>Del latín <strong><em>argentum</em></strong>, que significa plata. <em>Argentina</em> es, literalmente, <strong>"Tierra de la Plata"</strong>. El Río de la Plata, la puerta de entrada al país, lleva el nombre del metal más reflexivo que existe. No es oro — que acumula y ostenta. No es bronce — que endurece y resiste. Es plata: <strong>el metal que brilla para reflejar al otro</strong>.</p>

<p>¿Casualidad? Quizás. Pero las casualidades a veces tienen la textura de las profecías. Un país entero que lleva en su nombre la vocación de brillar — no para sí mismo, sino para ser espejo del mundo.</p>

<h3>El fuego que estamos atravesando</h3>

<p>Si la metáfora del refinamiento tiene sentido, entonces lo que Argentina atraviesa no es simplemente una crisis. <strong>Es el fuego del orfebre.</strong></p>

<p>Y como todo fuego de refinamiento, su función no es destruir — es <em>revelar</em>. Sacar a la superficie lo que estaba escondido debajo. Las impurezas que llevamos décadas acumulando no desaparecen solas. Necesitan calor para hacerse visibles:</p>

<ul>
  <li><strong>El individualismo extremo</strong> — el "sálvese quien pueda" como filosofía de vida</li>
  <li><strong>La corrupción normalizada</strong> — el "todos roban" como excusa para no exigir integridad</li>
  <li><strong>La polarización como identidad</strong> — definirse por lo que se odia en vez de por lo que se construye</li>
  <li><strong>La resignación disfrazada de realismo</strong> — el "este país no tiene arreglo" como profecía autocumplida</li>
  <li><strong>La nostalgia como trampa</strong> — idealizar un pasado que tampoco era dorado en vez de imaginar un futuro nuevo</li>
</ul>

<p>Estas son las escorias. El fuego las está sacando a la superficie. La pregunta no es <em>"¿cuándo se apaga el fuego?"</em> — es <strong><em>"¿estamos dispuestos a dejar ir lo que el fuego está revelando?"</em></strong></p>

<h3>Brillar no es protagonismo</h3>

<p>Hay una confusión que este curso quiere deshacer de raíz: <strong>brillar no es ser famoso, ni ser líder, ni tener seguidores</strong>. La plata no brilla para que la miren. Brilla para que <em>otros se vean en ella</em>.</p>

<p>Brillar como plata refinada es ser tan transparente, tan honesto, tan limpio de escorias, que cuando alguien te mira, no ve tu ego — <strong>ve reflejado lo mejor de sí mismo</strong>. Eso es lo que hace un buen padre, un buen maestro, un buen amigo, un buen vecino. No te dice lo grande que es él. Te muestra lo grande que podés ser vos.</p>

<p>El Hombre Gris no brilla para sí. Brilla para que Argentina pueda verse en él y reconocer su propia plata interior.</p>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Pensá en tu vida como un proceso de refinamiento. ¿Qué "fuego" estás atravesando en este momento — una dificultad, una pérdida, un desafío? ¿Y qué impureza personal sentís que ese fuego está sacando a la superficie? Puede ser un miedo, un prejuicio, un rencor, una comodidad que ya no te sirve. Nombralo. Y preguntate: ¿estoy dispuesto a dejar que se vaya?</p>
</blockquote>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 4: Las Psicografías de Parravicini
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Las Psicografías de Parravicini — El gris profetizado',
      description: 'Quién fue Parravicini, qué vio sobre el Hombre Gris, y por qué su visión no es un destino sino una invitación.',
      content: `
<h2>El hombre que dibujaba el futuro</h2>

<p>Benjamín Solano Parravicini nació en Buenos Aires el 8 de agosto de 1898 y murió el 13 de diciembre de 1974. Fue artista plástico, escultor y, durante décadas, un hombre profundamente común. Trabajó en el Museo de Bellas Artes. Vivió sin ostentación. No buscó fama ni seguidores.</p>

<p>Pero desde joven, algo particular le ocurría: entraba en estados de semi-consciencia en los que su mano dibujaba y escribía, aparentemente sin su control voluntario. Él los llamaba <strong>"psicografías"</strong> — dibujos del alma. Muchos de estos dibujos, realizados décadas antes de los eventos que describían, resultaron ser descripciones asombrosamente precisas de acontecimientos futuros.</p>

<h3>Una credibilidad documentada</h3>

<p>Lo que distingue a Parravicini de otros visionarios es que sus psicografías fueron <strong>fechadas, archivadas y publicadas antes de que los eventos ocurrieran</strong>. Entre las predicciones verificables se encuentran referencias a:</p>

<ul>
  <li>La llegada del hombre a la luna, dibujada décadas antes de 1969</li>
  <li>La caída de las Torres Gemelas, esbozada con inquietante similitud</li>
  <li>El surgimiento de la televisión y las comunicaciones globales</li>
  <li>Transformaciones políticas en Argentina y América Latina</li>
</ul>

<p>No mencionamos esto para generar misticismo, sino para dar contexto: cuando Parravicini habla del Hombre Gris, no es un delirio aislado. Es parte de un cuerpo de trabajo con antecedentes verificados de lucidez extraordinaria.</p>

<h3>El Hombre Gris en las psicografías</h3>

<p>En varias de sus psicografías, Parravicini hace referencia a una figura que llama <strong>"el hombre gris"</strong> o variaciones cercanas, siempre vinculada con Argentina y con un momento de transformación profunda. Las ideas centrales que se repiten son:</p>

<ul>
  <li><strong>Argentina atravesará un período de enorme dificultad</strong> — crisis económica, moral y social — que funcionará como un crisol de purificación</li>
  <li><strong>De esa crisis emergerá una figura o fuerza "gris"</strong> — no asociada a ningún partido, ideología o grupo de poder establecido</li>
  <li><strong>Esa fuerza traerá una transformación que irradiará más allá de Argentina</strong> — lo que ocurra acá tendrá impacto continental y mundial</li>
  <li><strong>La transformación no será violenta sino espiritual</strong> — un cambio de conciencia más que de sistema político</li>
</ul>

<blockquote>
  <p>En las psicografías, el Hombre Gris no llega con un ejército. Llega con una forma distinta de ver, de sentir y de construir. No derrota enemigos — disuelve la enemistad misma.</p>
</blockquote>

<h3>Leyendo las psicografías con ojos etimológicos</h3>

<p>Ahora que sabemos lo que vimos en las lecciones anteriores, podemos releer a Parravicini con ojos nuevos:</p>

<p>Si <strong><em>hombre</em></strong> viene de <em>humus</em> (tierra), el Hombre Gris es <strong>alguien que emerge desde abajo</strong> — no desde el poder, no desde la élite, no desde una cúpula. Desde el suelo. Desde la gente común.</p>

<p>Si <strong><em>gris</em></strong> es el color que contiene todos los colores, el Hombre Gris <strong>no pertenece a un bando</strong> — los integra a todos. No es de derecha ni de izquierda, no es peronista ni antiperonista, no es del campo ni de la ciudad. Es la síntesis de todas las experiencias argentinas.</p>

<p>Y si la <strong>plata</strong> es el metal que brilla para reflejar al otro, entonces el Hombre Gris es <strong>plata sin pulir que está siendo refinada por el fuego de la crisis</strong> — y cuando el refinamiento termine, lo que brille no será un líder, sino <em>un pueblo entero que aprendió a verse con otros ojos</em>.</p>

<h3>Lo que Parravicini NO dijo</h3>

<p>Tan importante como lo que las psicografías dicen es lo que <strong>no</strong> dicen. Y hay lecturas distorsionadas que es necesario desactivar:</p>

<ul>
  <li><strong>No dijo que el Hombre Gris es un solo individuo político</strong>. Identificarlo con un presidente, candidato o líder específico es reducir una visión colectiva a una narrativa de caudillismo — exactamente lo que Argentina necesita superar.</li>
  <li><strong>No dijo que debemos esperar pasivamente</strong>. Interpretar la profecía como "sentémonos a esperar que llegue el Hombre Gris" es convertir una invitación en una excusa para la inacción.</li>
  <li><strong>No dijo que será mágico o instantáneo</strong>. El proceso de refinamiento de plata lleva tiempo, atención y fuego sostenido. No hay atajos.</li>
</ul>

<h3>La profecía como espejo</h3>

<p>Hay dos formas de leer una profecía. La primera es pasiva: <em>"Esto va a pasar, sentémonos a mirar."</em> La segunda es activa: <em>"Esto puede pasar — si cada uno de nosotros decide ser parte."</em></p>

<p><strong>La profecía del Hombre Gris no es un destino. Es una invitación.</strong> No describe algo que nos va a pasar. Describe algo que <em>podemos elegir ser</em>. Es un espejo que nos muestra lo que somos capaces de hacer — si nos animamos.</p>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>Si alguien te dijera: "Yo estoy esperando a que llegue el Hombre Gris para que arregle todo", ¿qué le responderías? ¿Cómo le explicarías que la profecía no es un destino sino un espejo? ¿Y qué pasaría si, en vez de esperar, cada persona que lee esto decide ser un fragmento del Hombre Gris — una esquirla de plata que empieza a brillar desde su lugar?</p>
</blockquote>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 5: La humanidad como puente
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'La humanidad como puente — Romper la polarización',
      description: 'Cómo funciona la polarización, qué nos roba, y por qué la humanidad compartida es el puente más fuerte.',
      content: `
<h2>El mecanismo que nos parte al medio</h2>

<p>Antes de intentar romper la polarización, necesitamos entender cómo funciona. Porque no es maldad. No es estupidez. Es un mecanismo psicológico profundo que opera en todos nosotros — incluso en los que creemos estar por encima de él.</p>

<h3>El cerebro que simplifica</h3>

<p>El cerebro humano evolucionó para sobrevivir, no para ser justo. Y una de sus herramientas de supervivencia más poderosas es la <strong>categorización binaria</strong>: amigo o enemigo, seguro o peligroso, nosotros o ellos. En la sabana africana, dividir el mundo en dos categorías rápidas podía salvarte la vida. No tenías tiempo para matices cuando un león te perseguía.</p>

<p>El problema es que ese mismo mecanismo, diseñado para una amenaza física inmediata, <strong>se activa hoy frente a ideas, opiniones y personas que no representan ningún peligro real</strong>. Alguien que vota distinto a vos no es un león. Pero tu cerebro, si no estás atento, lo procesa como si lo fuera.</p>

<h3>El amplificador digital</h3>

<p>Las redes sociales no inventaron la polarización — la pusieron en esteroides. Los algoritmos aprenden que <strong>la indignación genera más clics que la reflexión</strong>. Un posteo moderado y matizado pasa desapercibido. Uno furioso y extremo se viraliza. Y así, sin que nadie lo planifique conscientemente, las plataformas nos van empujando hacia versiones cada vez más extremas de nosotros mismos.</p>

<p>Los medios de comunicación hacen lo mismo: <strong>la grieta vende</strong>. Un debate donde dos personas se escuchan y encuentran puntos en común no da rating. Dos personas gritándose, sí. Y así nos vamos acostumbrando a un mundo donde ganar una discusión importa más que encontrar la verdad.</p>

<h3>Lo que se pierde cuando polarizamos</h3>

<p>La polarización no es gratis. Tiene costos enormes que rara vez contabilizamos:</p>

<ul>
  <li><strong>Se pierde la verdad</strong> — porque la verdad casi nunca está toda de un solo lado, y al atrincherarnos nos privamos de la porción que tiene el otro</li>
  <li><strong>Se pierde la empatía</strong> — porque para odiar a alguien primero hay que deshumanizarlo, convertirlo en caricatura, olvidar que tiene hijos, miedos, sueños</li>
  <li><strong>Se pierden las soluciones</strong> — porque los problemas complejos requieren perspectivas múltiples, y si excluimos la mitad de las voces, nos quedamos con media solución</li>
  <li><strong>Se pierde la paz interior</strong> — porque vivir enojado con la mitad de la humanidad es agotador, corrosivo, y al final te come por dentro</li>
</ul>

<blockquote>
  <p>La deshumanización siempre empieza con una etiqueta. Cuando dejás de ver a Juan y empezás a ver "un kirchnerista", "un libertario", "un zurdo", "un facho" — ahí empezaste a perder tu propia humanidad, no solo la de él.</p>
</blockquote>

<h3>El Hombre Gris como anticuerpo</h3>

<p>Si la polarización es un virus que infecta comunidades enteras, el Hombre Gris es el anticuerpo. No porque tenga la respuesta correcta — sino porque <strong>se niega a aceptar que solo hay dos respuestas posibles</strong>.</p>

<p>Ser Hombre Gris en una discusión polarizada implica:</p>

<ul>
  <li><strong>Escuchar antes de juzgar</strong> — no para responder, sino para entender genuinamente</li>
  <li><strong>Buscar el matiz</strong> — la pregunta "¿y si ambos tienen algo de razón?" como herramienta constante</li>
  <li><strong>Separar a la persona de su posición</strong> — puedo rechazar una idea sin rechazar al ser humano que la sostiene</li>
  <li><strong>Resistir la presión tribal</strong> — "no me voy a enojar con vos solo porque mi grupo espera que lo haga"</li>
</ul>

<h3>Puentes concretos: herramientas para el diálogo</h3>

<p>La anti-polarización no es solo una idea bonita. Requiere <strong>técnicas concretas</strong> que se pueden practicar:</p>

<ol>
  <li><strong>Preguntá "¿qué te preocupa?" antes de "¿qué opinás?"</strong> — Las opiniones dividen. Las preocupaciones conectan. Atrás de toda posición política hay un miedo legítimo: miedo a la pobreza, a la inseguridad, a perder la identidad, a la injusticia. Cuando llegás al miedo, encontrás al humano.</li>
  <li><strong>Buscá el 10% en que coincidís</strong> — Incluso con la persona más opuesta a vos en todo, hay un 10% de terreno común. Encontralo. Nombralo. Construí desde ahí.</li>
  <li><strong>Repetí lo que el otro dijo antes de responder</strong> — "Si te entiendo bien, lo que decís es..." Esta técnica simple desarma el 80% de los conflictos, porque la mayoría de las peleas ocurren porque nadie se siente escuchado.</li>
  <li><strong>Distinguí entre la persona y el sistema</strong> — Mucha gente sostiene posiciones extremas no por maldad sino por un ecosistema informativo que la empuja a eso. Enojarte con la persona es como enojarte con un pez por nadar en agua contaminada.</li>
</ol>

<h3>La humanidad compartida: el puente más fuerte</h3>

<p>Debajo de todas las diferencias — políticas, económicas, culturales, ideológicas — hay una base que compartimos todos los seres humanos que alguna vez pisaron esta tierra:</p>

<p><strong>Todos nacemos.</strong> Todos sentimos dolor. Todos perdimos a alguien. Todos nos despertamos a las 3 de la mañana alguna vez con miedo. Todos queremos que nuestros hijos vivan mejor que nosotros. Todos vamos a morir.</p>

<p>Esa base común es más profunda que cualquier grieta. Más antigua que cualquier partido político. Más real que cualquier etiqueta. Y cuando dos personas se encuentran en ese nivel — el nivel del <em>humus</em>, de la tierra compartida — <strong>la polarización se vuelve absurda</strong>. ¿Cómo vas a odiar a alguien que tiene los mismos miedos que vos?</p>

<h3>Argentina como laboratorio</h3>

<p>Un país que se define por grietas tiene una oportunidad única. Peronismo y antiperonismo. Campo y ciudad. Interior y Capital. Ricos y pobres. Si hay un lugar en el mundo donde la síntesis es difícil, es acá.</p>

<p>Pero justamente por eso: <strong>si podemos acá, se puede en cualquier parte</strong>. Argentina puede ser el laboratorio mundial de la des-polarización. El lugar donde se demuestre que un pueblo entero puede elegir el gris por encima del blanco y negro. Eso es lo que significa ser Tierra de la Plata — brillar no a pesar de nuestras diferencias, sino a través de integrarlas.</p>

<hr />

<h3>🪞 Ejercicio práctico</h3>

<blockquote>
  <p>Esta semana, elegí a una persona de tu entorno que piense muy distinto a vos sobre algo que te importa. Invitala a tomar un mate o un café. Regla: <strong>durante los primeros 10 minutos, solo podés hacer preguntas</strong>. No podés opinar, corregir ni debatir. Solo preguntar y escuchar. Después de esos 10 minutos, anotá en tu teléfono: ¿qué descubriste que no sabías? ¿Qué miedo o preocupación legítima encontraste detrás de su posición? ¿Cambió algo en cómo lo ves?</p>
</blockquote>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 30,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 6: Los Pilares del Movimiento
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Los Pilares del Movimiento — Profundización',
      description: 'Los cinco pilares que sostienen al Hombre Gris, cada uno conectado con la metáfora de la plata que se refina.',
      content: `
<h2>Cinco pilares, una sola plata</h2>

<p>El movimiento del Hombre Gris se sostiene sobre cinco pilares. Pero no son cinco cosas separadas — son cinco caras de un mismo proceso. Pensalos como los cinco pasos del refinamiento de la plata: cada uno es indispensable, y si falta uno, el proceso se interrumpe.</p>

<h3>Pilar 1 — La Visión: ver el brillo posible</h3>

<p>Antes de que el orfebre encienda el fuego, tiene que <strong>ver</strong>. Tiene que mirar ese pedazo de metal gris y opaco, y ser capaz de imaginar la plata brillante que hay adentro. Sin esa visión, el mineral sigue siendo un pedazo de roca. Con ella, se convierte en el comienzo de algo extraordinario.</p>

<p>La Visión, en el contexto del Hombre Gris, no es un plan de gobierno. No es una ideología. No es un programa de 10 puntos. <strong>Es la capacidad de mirar a Argentina — con todas sus grietas, sus fracasos, su dolor — y ver la plata que hay adentro.</strong></p>

<p>Visión no es optimismo ingenuo. No es decir "todo va a estar bien" mientras la casa se prende fuego. Es algo mucho más poderoso: es decir <em>"sé que hay algo extraordinario escondido acá, y voy a dedicar mi vida a revelarlo"</em>. Es la convicción de que la crisis no es el final de la historia, sino el fuego del crisol.</p>

<blockquote>
  <p>La visión no es ver lo que es. Es ver lo que puede ser — y actuar como si ya fuera posible.</p>
</blockquote>

<h3>Pilar 2 — La Acción: entrar al fuego</h3>

<p>La visión sin acción es fantasía. Y la Argentina está llena de gente que sabe exactamente qué hay que hacer — desde el sillón. <strong>El Hombre Gris no opina sobre el fuego. Entra en él.</strong></p>

<p>La Acción es la diferencia entre quejarse y construir. Y no hace falta que sea épica. Las acciones más transformadoras del mundo suelen ser pequeñas y sostenidas:</p>

<ul>
  <li>Un vecino que organiza una huerta comunitaria en un terreno baldío</li>
  <li>Una maestra que llega una hora antes para darle de desayunar a los pibes que vienen sin comer</li>
  <li>Un grupo de amigos que deja de quejarse del país y empieza un proyecto concreto en su barrio</li>
  <li>Alguien que decide educarse — no para acumular diplomas, sino para tener mejores herramientas de servicio</li>
</ul>

<p>El Hombre Gris no espera permiso. No espera un líder. No espera el momento perfecto. <strong>El momento es siempre ahora, y el permiso te lo dás vos.</strong></p>

<h3>Pilar 3 — La Comunidad: el crisol que sostiene</h3>

<p>La plata no se refina sola. Necesita un <strong>crisol</strong> — un recipiente capaz de soportar el fuego sin romperse, que contiene al metal mientras se transforma. Ese crisol es la comunidad.</p>

<p>Solos, el fuego nos destruye. Nos quema, nos consume, nos deja ceniza. Pero en comunidad — contenidos, acompañados, sostenidos — <strong>el mismo fuego que destruiría a un individuo aislado se convierte en el agente de transformación de un grupo entero</strong>.</p>

<p>La comunidad del Hombre Gris no es un club, no es un partido, no es una secta. Es cualquier grupo de personas que decide:</p>

<ol>
  <li>Ser honestos entre sí, incluso cuando duele</li>
  <li>Sostenerse mutuamente en los momentos de fuego</li>
  <li>Ayudarse a remover impurezas — con amor, no con juicio</li>
  <li>Celebrar el brillo del otro como si fuera propio</li>
</ol>

<blockquote>
  <p>El crisol no juzga a la plata por sus impurezas. La sostiene mientras se transforma.</p>
</blockquote>

<h3>Pilar 4 — La Reflexión: el orfebre que observa</h3>

<p>¿Te acordás del orfebre que no podía irse del fuego? Que tenía que quedarse mirando, observando, ajustando la temperatura con paciencia infinita? Ese es el pilar de la Reflexión.</p>

<p>Sin reflexión, la acción es ruido. Es hacer por hacer, moverse sin rumbo, quemar energía sin transformar nada. <strong>La reflexión es la inteligencia de la acción</strong> — la capacidad de parar, observar lo que está pasando, y ajustar el rumbo.</p>

<p>Herramientas concretas de reflexión:</p>

<ul>
  <li><strong>El diario de proceso</strong> — escribir regularmente qué estás aprendiendo, qué te está costando, qué impureza salió a la superficie esta semana</li>
  <li><strong>Los círculos de palabra</strong> — reunirse con otros para compartir no opiniones sino experiencias internas, escuchar sin aconsejar</li>
  <li><strong>La revisión semanal</strong> — preguntarse cada domingo: ¿qué hice esta semana que me acercó a la plata que quiero ser? ¿Qué me alejó?</li>
  <li><strong>El silencio deliberado</strong> — en un mundo de ruido constante, el silencio es el laboratorio donde las revelaciones ocurren</li>
</ul>

<h3>Pilar 5 — La Síntesis: la plata que refleja</h3>

<p>Cuando la Visión, la Acción, la Comunidad y la Reflexión se integran, emerge algo que es más que la suma de sus partes. <strong>Emerge el Hombre Gris.</strong></p>

<p>No como una persona. No como un líder. Como un <strong>estado de conciencia colectiva</strong> — lo que ocurre cuando una comunidad entera decide refinarse junta. Cuando cada miembro aporta su fragmento de plata, pasa por su propio fuego, y lo que brilla al final no es un individuo sino un pueblo.</p>

<p>La Síntesis es el momento en que la plata puede reflejar. El momento en que Argentina deja de mirarse con vergüenza y empieza a verse con la claridad de un metal purificado: <strong>con todas sus cicatrices visibles, pero brillando</strong>.</p>

<h3>Los cinco pilares como proceso de refinamiento</h3>

<table>
  <tr><th>Pilar</th><th>En el refinamiento</th><th>En tu vida</th></tr>
  <tr><td><strong>Visión</strong></td><td>El orfebre ve la plata dentro del mineral</td><td>Ves tu potencial más allá de tus limitaciones</td></tr>
  <tr><td><strong>Acción</strong></td><td>Encender el fuego</td><td>Dejar de planear y empezar a hacer</td></tr>
  <tr><td><strong>Comunidad</strong></td><td>El crisol que sostiene</td><td>Las personas que te acompañan en el proceso</td></tr>
  <tr><td><strong>Reflexión</strong></td><td>El orfebre que observa y ajusta</td><td>La práctica de parar, mirar y aprender</td></tr>
  <tr><td><strong>Síntesis</strong></td><td>La plata que refleja</td><td>Ser espejo donde otros ven lo mejor de sí</td></tr>
</table>

<hr />

<h3>🪞 Reflexión</h3>

<blockquote>
  <p>De los cinco pilares, ¿cuál sentís que es tu punto fuerte? ¿Y cuál es el que más te cuesta? ¿Tenés Visión pero te falta Acción? ¿Tenés Acción pero te falta Reflexión? ¿Tenés todo pero te falta Comunidad — personas que te sostengan en el fuego? Identificá tu pilar más débil. Ahí es donde empieza tu próximo paso.</p>
</blockquote>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 25,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 7: Abrir la mente, abrir el corazón
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Abrir la mente, abrir el corazón',
      description: 'La mente cerrada como impureza, la vulnerabilidad como fortaleza, y las historias que nos devuelven la humanidad.',
      content: `
<h2>La escoria más difícil de remover</h2>

<p>De todas las impurezas que el fuego puede revelar, hay una que es la más resistente, la más escurridiza, la que más cuesta reconocer: <strong>la mente cerrada</strong>.</p>

<p>¿Sabés por qué es la más difícil? Porque se disfraza. Se disfraza de convicción: <em>"Yo tengo claras mis ideas."</em> Se disfraza de lealtad: <em>"Yo no traiciono mis principios."</em> Se disfraza de identidad: <em>"Esto es lo que soy."</em> Y así, lo que en realidad es rigidez y miedo al cambio, <strong>se presenta como fortaleza</strong>.</p>

<p>Pero una mente cerrada es plata que se resiste al fuego. Es como si el metal dijera: <em>"No necesito refinamiento. Ya estoy bien como estoy."</em> Y al resistirse al fuego, se condena a quedarse gris para siempre.</p>

<h3>La diferencia entre certeza y fe</h3>

<p>Hay una distinción crucial que el Hombre Gris necesita entender:</p>

<p><strong>La certeza cierra puertas.</strong> Dice: <em>"Ya sé todo lo que necesito saber. No hay nada nuevo que aprender. Tengo las respuestas."</em> La certeza es cómoda, porque elimina la incertidumbre. Pero también elimina el crecimiento, la sorpresa y la posibilidad de que estemos equivocados — que es, casi siempre, donde empieza la sabiduría.</p>

<p><strong>La fe abre puertas.</strong> Dice: <em>"No sé todo. Confío en que hay algo más por descubrir. Estoy dispuesto a soltar lo que creo si encuentro algo más verdadero."</em> La fe no es creer sin evidencia — es confiar en el proceso sin necesitar controlar el resultado.</p>

<blockquote>
  <p>La certeza es un muro. La fe es un puente. El Hombre Gris camina con fe, no con certeza — porque sabe que el fuego quema primero lo que creíamos saber con seguridad.</p>
</blockquote>

<h3>La cabeza polariza, el corazón conecta</h3>

<p>Hacé un experimento mental. Pensá en alguien que piensa muy distinto a vos y preguntate: <em>"¿Qué pienso de esta persona?"</em></p>

<p>Tu cabeza va a responder con etiquetas, categorías, juicios: es ignorante, es fanático, está equivocado, es peligroso. La cabeza clasifica. Es su trabajo. Pero <strong>clasificar no es comprender</strong>.</p>

<p>Ahora preguntate: <em>"¿Qué siento cuando pienso en esta persona como un ser humano que tiene miedo, que quiere lo mejor para sus hijos, que a veces no puede dormir?"</em></p>

<p>¿Sentiste el cambio? Cuando la pregunta baja de la cabeza al corazón, algo se afloja. No significa que estés de acuerdo. No significa que su posición sea correcta. Significa que <strong>recuperaste acceso a su humanidad — y a la tuya</strong>.</p>

<h3>Vulnerabilidad: la grieta que deja entrar la luz</h3>

<p>Existe en Japón un arte llamado <strong><em>kintsugi</em></strong>: el arte de reparar cerámica rota con oro. En vez de esconder la rotura, la celebra. La grieta reparada con oro se convierte en la parte más bella de la pieza. El objeto no es valioso <em>a pesar</em> de haberse roto — es valioso <em>porque</em> se rompió y fue reparado con algo precioso.</p>

<p>El Hombre Gris practica un <em>kintsugi</em> argentino: <strong>soldar con luz lo que se rompió con oscuridad</strong>. No se trata de esconder las heridas, las contradicciones, los errores. Se trata de mostrarlos — y de repararlos con honestidad, con comunidad, con amor.</p>

<p>Mostrar las grietas no es debilidad. Es autenticidad. Y la autenticidad es magnética: cuando alguien tiene el coraje de decir <em>"me equivoqué"</em>, <em>"tengo miedo"</em>, <em>"no sé"</em> — algo se abre en todos los que lo escuchan. Porque todos tenemos grietas. Y todos necesitamos saber que se pueden reparar.</p>

<h3>Historias que abren</h3>

<p>El cambio no empieza con teorías. Empieza con historias. Historias de personas reales que eligieron abrir cuando todo les decía que cerraran:</p>

<p><strong>La inundación de La Plata, 2013.</strong> En medio del agua, del barro y del desastre, desaparecieron las camisetas de fútbol, las banderas partidarias y las grietas ideológicas. El vecino kirchnerista le pasó una soga al vecino macrista. La señora del country cocinó para la familia de la villa. Nadie preguntó a quién votaba el otro antes de sacarle la cabeza del agua. <strong>En el momento de máxima crisis, la humanidad compartida fue más fuerte que cualquier polarización.</strong></p>

<p><strong>El comedor de Don Héctor.</strong> En un barrio del conurbano, un jubilado que cobra la mínima abre su casa tres veces por semana para darle de comer a 40 pibes. Cuando le preguntan por qué, no habla de política ni de ideología. Dice: <em>"Porque me acuerdo de cuando yo tenía hambre y alguien me dio un plato."</em> La cadena de humanidad no necesita explicaciones teóricas.</p>

<p><strong>El mate en la plaza.</strong> Dos desconocidos en una plaza de Córdoba. Uno con gorra de Milei, otro con remera del Che. Se sientan en el mismo banco porque no hay otro. Uno ofrece mate. El otro acepta. Dos horas después se están riendo de las mismas cosas, descubriendo que sus hijos van a la misma escuela, que comparten el mismo miedo de no llegar a fin de mes. <strong>La etiqueta decía "enemigos". La humanidad dijo "prójimos".</strong></p>

<hr />

<h3>🪞 Ejercicio</h3>

<blockquote>
  <p>Escribí tres creencias que tenés sobre "el otro bando" — el que sea para vos: los K, los libertarios, los del campo, los sindicalistas, los empresarios, los que sea. Tres cosas que "sabés" de ellos. Ahora preguntate con honestidad: ¿las verificaste personalmente hablando con gente real de ese grupo, o las absorbiste del ambiente — de las redes, de la tele, de la mesa familiar? Si la respuesta es la segunda, tenés una impureza que el fuego quiere revelar. ¿La dejás salir?</p>
</blockquote>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 20,
      isRequired: true,
    },

    // ─────────────────────────────────────────────────────────
    // LECCIÓN 8: Tu instante
    // ─────────────────────────────────────────────────────────
    {
      courseId: course.id,
      title: 'Tu instante — Aplicación y compromiso',
      description: 'El instante como decisión, tu arqueología personal, el desafío de 7 días, y la invitación que lo cambia todo.',
      content: `
<h2>¿Por qué "instante"?</h2>

<p>Este proyecto no se llama "La Era del Hombre Gris". No se llama "La Época del Hombre Gris". Se llama <strong>El Instante del Hombre Gris</strong>.</p>

<p>Un instante. Un parpadeo. Un ahora.</p>

<p>¿Por qué? Porque la transformación no es un proceso largo y lejano que va a pasar algún día cuando las condiciones sean perfectas. <strong>La transformación es una decisión que se toma en un instante.</strong> No mañana. No cuando el país mejore. No cuando tenga más plata, más tiempo, más energía. Ahora.</p>

<p>Cada instante de tu vida es una bifurcación silenciosa. En cada momento estás eligiendo — consciente o inconscientemente — entre dos caminos:</p>

<ul>
  <li>Seguir como estás, con las mismas impurezas, los mismos miedos, las mismas excusas</li>
  <li>O dar un paso — uno solo, chiquito, imperfecto — hacia la plata que podés ser</li>
</ul>

<p>No se necesitan grandes gestos. No se necesitan revoluciones. <strong>Se necesita un instante de decisión.</strong> Y después otro. Y después otro. Así se refina la plata: no de golpe, sino gota a gota de fuego, instante a instante de verdad.</p>

<h3>Tu arqueología personal</h3>

<p>Antes de transformar el mundo, necesitás excavar tu propio suelo. Acordate: <em>homo</em> viene de <em>humus</em>. Somos tierra. Y como toda tierra, tenemos capas. Algunas las elegimos, otras las heredamos. Algunas nos nutren, otras nos envenenan sin que nos demos cuenta.</p>

<p>La <strong>arqueología personal</strong> es el proceso de excavar esas capas con honestidad:</p>

<ul>
  <li><strong>¿Qué creencias heredaste sin cuestionar?</strong> — De tu familia, tu barrio, tu clase social, tu generación. No para rechazarlas todas, sino para elegir conscientemente cuáles querés conservar y cuáles ya no te representan.</li>
  <li><strong>¿Qué prejuicios operan en automático?</strong> — Todos tenemos. El que dice "yo no tengo prejuicios" tiene el peor de todos: el de creerse libre de ellos. ¿Cómo reaccionás cuando ves a alguien de una villa? ¿Cuando escuchás un acento correntino? ¿Cuando sabés que alguien vota distinto? Esas reacciones automáticas son impurezas. No te hacen mala persona. Te hacen humano — <em>humus</em> que necesita refinamiento.</li>
  <li><strong>¿Qué heridas sin cerrar te empujan a polarizar?</strong> — Muchas veces, el odio político es dolor personal disfrazado. Odiamos al "otro" porque nos recuerda algo que nos dolió, algo que no pudimos procesar, alguien que nos falló. El fuego del refinamiento saca esto a la superficie no para torturarte, sino para que puedas sanar.</li>
</ul>

<h3>El desafío de los 7 días</h3>

<p>Esto no es teoría. Es práctica. Durante los próximos 7 días, te invitamos a un desafío concreto — un fuego controlado, un mini-refinamiento. Un día a la vez:</p>

<p><strong>Día 1 — La opinión sin verificar.</strong><br />
Identificá una opinión que sostenés con firmeza pero que nunca verificaste personalmente. Puede ser sobre un grupo de personas, sobre un tema social, sobre "cómo es el país". Investigala. Leé algo que contradiga tu posición. No para cambiar de opinión — para enriquecer la que tenés.</p>

<p><strong>Día 2 — La conversación incómoda.</strong><br />
Tené una conversación real — cara a cara, no por chat — con alguien que piense distinto a vos sobre algo que te importa. Escuchá más de lo que hablás. Buscá entender, no convencer.</p>

<p><strong>Día 3 — El acto invisible.</strong><br />
Hacé algo por un desconocido sin que nadie se entere. Sin subirlo a redes. Sin contarlo. Un acto de humanidad pura, sin testigos ni aplausos. Y observá qué te pasa adentro cuando nadie te ve siendo bueno.</p>

<p><strong>Día 4 — La carta que no vas a enviar.</strong><br />
Escribí una carta a alguien que te haya herido — un familiar, un ex amigo, una figura pública, un "bando". Pero en vez de reclamarle, intentá entender su humanidad. ¿Qué miedo lo movía? ¿Qué dolor cargaba? No hace falta que lo perdones. Solo que lo humanices.</p>

<p><strong>Día 5 — El silencio digital.</strong><br />
Desconectate de redes sociales por 12 horas. Nada de Twitter, Instagram, TikTok, grupos de WhatsApp que hablan de política. Y durante esas 12 horas, anotá: ¿qué sentís? ¿Ansiedad? ¿Alivio? ¿Vacío? ¿Libertad? Lo que sientas te dice mucho sobre cuánto del fuego que te quema viene de afuera.</p>

<p><strong>Día 6 — El fuego compartido.</strong><br />
Reunite con al menos 2 personas — amigos, familia, vecinos — y proponeles una conversación distinta: <em>"¿Qué Argentina queremos? No qué nos enoja del pasado, sino qué queremos construir."</em> Regla: no se puede nombrar a ningún político. Solo se puede hablar de valores, sueños y acciones concretas.</p>

<p><strong>Día 7 — Tu declaración de Hombre Gris.</strong><br />
Escribí en un papel — a mano, no en digital — tu declaración personal. Respondé estas tres preguntas:</p>

<ol>
  <li><strong>¿Quién quiero ser?</strong> — No qué quiero tener ni qué quiero lograr. Quién quiero <em>ser</em>.</li>
  <li><strong>¿Qué voy a hacer?</strong> — Una acción concreta, específica, que puedas empezar esta semana.</li>
  <li><strong>¿Qué impureza voy a dejar ir?</strong> — Un miedo, un prejuicio, un rencor, una comodidad que ya no te sirve.</li>
</ol>

<p>Guardá ese papel. Volvé a leerlo en un mes. Vas a sorprenderte de lo que el fuego movió en vos.</p>

<h3>La invitación final</h3>

<p>Llegaste al final de este curso. Pero si hicimos bien nuestro trabajo, esto no se siente como un final — <strong>se siente como un comienzo</strong>.</p>

<p>No te pedimos que te sumes a un movimiento. No te pedimos que sigas a un líder. No te pedimos que compartas una publicación ni que pongas un hashtag.</p>

<p><strong>Te pedimos algo mucho más difícil y mucho más poderoso: que seas el movimiento.</strong></p>

<p>Cada persona que elige la síntesis sobre la división. Cada persona que busca el matiz antes del extremo. Cada persona que acepta el fuego transformador en vez de la comodidad del prejuicio. Cada persona que decide brillar — no para sí misma, sino para que otros se vean reflejados en su luz.</p>

<p><strong>Esa persona es el Hombre Gris.</strong></p>

<p>Y si hay suficientes personas así — en tu barrio, en tu ciudad, en este país que lleva el nombre de la plata — entonces la profecía no se cumple porque estaba escrita. <strong>Se cumple porque la escribimos nosotros, con nuestras vidas, un instante a la vez.</strong></p>

<blockquote>
  <p><em>La tierra te nombró humano.<br />
  El gris te dio todos los colores.<br />
  El fuego te refinó.<br />
  Ahora, brillá — para que otros se vean en tu luz.</em></p>
  <p><strong>El instante es ahora. La plata sos vos.</strong></p>
</blockquote>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 30,
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
    title: 'Quiz: Introducción al Hombre Gris',
    description: 'Evaluá tu comprensión del viaje completo: de la tierra al brillo, de la etimología a la acción.',
    passingScore: 70,
    timeLimit: 20,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿De qué palabra latina proviene "hombre" (homo)?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Honos (honor)',
        'Humus (tierra)',
        'Altus (alto)',
        'Fortis (fuerte)'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Homo viene de humus (tierra, suelo). El ser humano es, etimológicamente, "el que viene de la tierra". De la misma raíz nacen humanidad y humildad.',
      points: 2,
      orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: 'En la metáfora del curso, ¿qué representa el color gris?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Neutralidad e indiferencia',
        'Tristeza y resignación',
        'La síntesis de todos los colores y experiencias',
        'La ausencia de posición política'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El gris no es ausencia ni neutralidad. Es lo que ocurre cuando todas las longitudes de onda se mezclan: contiene todos los colores. Representa la síntesis de la complejidad humana.',
      points: 2,
      orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: '¿Cómo sabía el orfebre antiguo que la plata estaba completamente refinada?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Cuando el metal cambiaba de color a dorado',
        'Cuando podía ver su propio reflejo en el metal líquido',
        'Cuando el fuego se apagaba solo',
        'Cuando el metal dejaba de hacer burbujas'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La plata estaba lista cuando el orfebre podía ver su propio reflejo en ella. Mientras hubiera impurezas, la superficie era turbia. La pureza se mide por la capacidad de reflejar.',
      points: 2,
      orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Qué significa etimológicamente "Argentina"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Tierra del sol (del latín aurum)',
        'Tierra de la plata (del latín argentum)',
        'Tierra del sur (del latín australis)',
        'Tierra del viento (del latín ventus)'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'Argentina viene del latín argentum, que significa plata. El país lleva en su nombre la vocación de brillar — no para sí mismo, sino como espejo del mundo.',
      points: 1,
      orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: 'Las psicografías de Parravicini sugieren que el Hombre Gris es necesariamente un individuo político específico.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Identificar al Hombre Gris con un solo individuo o candidato político reduce una visión colectiva a una narrativa de caudillismo. Las psicografías apuntan a una transformación de conciencia, no a un liderazgo individual.',
      points: 2,
      orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la diferencia entre certeza y fe según el curso?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'La certeza es racional y la fe es irracional',
        'La certeza cierra puertas; la fe abre puertas al crecimiento',
        'La certeza es para los científicos y la fe para los religiosos',
        'No hay diferencia significativa'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La certeza dice "ya sé todo" y cierra la posibilidad de crecer. La fe dice "confío en que hay más por descubrir" y te mantiene abierto al aprendizaje. El Hombre Gris camina con fe, no con certeza.',
      points: 2,
      orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: '¿Cuántos pilares fundamentales tiene el movimiento del Hombre Gris?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['3', '4', '5', '7']),
      correctAnswer: JSON.stringify(2),
      explanation: 'Los cinco pilares son: Visión (ver el brillo posible), Acción (entrar al fuego), Comunidad (el crisol que sostiene), Reflexión (el orfebre que observa), y Síntesis (la plata que refleja).',
      points: 1,
      orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: 'En la metáfora del refinamiento, ¿qué representa la Comunidad?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'El fuego que purifica',
        'El mineral en bruto',
        'El crisol que sostiene la plata durante la transformación',
        'El orfebre que controla el proceso'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'La Comunidad es el crisol: el recipiente que soporta el fuego sin romperse y contiene al metal mientras se transforma. Solos, el fuego nos destruye. En comunidad, nos transforma.',
      points: 2,
      orderIndex: 8,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál de las siguientes acciones refleja mejor el espíritu del Hombre Gris?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Ganar una discusión política en redes sociales',
        'Esperar a que surja un líder que arregle todo',
        'Escuchar a alguien que piensa distinto buscando entender su humanidad',
        'Convencer a todos de tu posición'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: 'El Hombre Gris no busca ganar ni convencer. Busca entender, integrar y reflejar. Escuchar al otro buscando su humanidad es el acto más transformador que existe.',
      points: 2,
      orderIndex: 9,
    },
    {
      quizId: quiz.id,
      question: 'El nombre del proyecto es "El Instante del Hombre Gris". ¿Qué implica la palabra "instante"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Que la transformación será rápida y fácil',
        'Que es algo efímero y pasajero',
        'Que la transformación es una decisión que se toma ahora, no algún día',
        'Que ya pasó y quedó en el pasado'
      ]),
      correctAnswer: JSON.stringify(2),
      explanation: '"Instante" significa que la transformación no es un proceso lejano. Es una decisión que se toma ahora, en cada momento. No mañana, no cuando las condiciones sean perfectas. El instante es siempre ahora.',
      points: 2,
      orderIndex: 10,
    },
    {
      quizId: quiz.id,
      question: 'Brillar como plata refinada significa ser famoso o tener protagonismo.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Brillar no es protagonismo. La plata brilla para que otros se vean reflejados en ella. Brillar es ser tan transparente y auténtico que cuando alguien te mira, ve lo mejor de sí mismo.',
      points: 2,
      orderIndex: 11,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es el primer paso de la "arqueología personal" que propone el curso?',
      type: 'multiple_choice' as const,
      options: JSON.stringify([
        'Cambiar de partido político',
        'Excavar tus creencias heredadas y preguntarte cuáles elegís conscientemente',
        'Leer todas las psicografías de Parravicini',
        'Encontrar un líder para seguir'
      ]),
      correctAnswer: JSON.stringify(1),
      explanation: 'La arqueología personal comienza por excavar las capas de creencias heredadas — de la familia, el barrio, la clase social — no para rechazarlas todas, sino para elegir conscientemente cuáles conservar.',
      points: 2,
      orderIndex: 12,
    },
  ];

  for (const question of questions) {
    await db.insert(quizQuestions).values(question);
  }
  console.log(`✅ Creadas ${questions.length} preguntas de quiz`);

  console.log('\n🔥 ¡Curso actualizado exitosamente!');
  console.log('📊 8 lecciones | 12 preguntas de quiz | ~200 minutos de contenido');
  console.log('📖 Arco narrativo: Tierra → Gris → Fuego → Plata');
}

main().catch(console.error).finally(() => process.exit(0));
