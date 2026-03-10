import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions } = schema;
import { eq } from 'drizzle-orm';

/**
 * Deep content seed for "La Visión de Transformación"
 * Replaces the shallow 3-lesson course with a 10-lesson opus course
 * with expert frameworks, reflection questions, and transformative depth.
 */

async function main() {
  console.log('🔥 Seeding deep content for "La Visión de Transformación"...');

  try {
    // Find existing course
    const [course] = await db.select().from(courses).where(eq(courses.slug, 'la-vision-de-transformacion')).limit(1);
    if (!course) {
      console.log('❌ Course "la-vision-de-transformacion" not found. Run seed-courses.ts first.');
      return;
    }

    console.log('✅ Found course:', course.title, '(ID:', course.id, ')');

    // Update course metadata for deeper content
    await db.update(courses).set({
      description: 'Un viaje profundo hacia la construcción de una visión de vida que realmente transforme. A través de 10 lecciones basadas en neurociencia, psicología profunda, liderazgo transformador y filosofía práctica, vas a aprender a crear una visión personal auténtica, superar los sabotajes internos que la frenan, y alinearla con una visión colectiva que genere cambio real. Este no es un curso motivacional: es un proceso de autoconocimiento radical y planificación estratégica con alma.',
      excerpt: 'Construí una visión que transforme tu vida y tu comunidad. 10 lecciones profundas con neurociencia, psicología y estrategia.',
      level: 'intermediate',
      duration: 480,
    }).where(eq(courses.id, course.id));
    console.log('✅ Updated course metadata');

    // Delete existing lessons
    await db.delete(courseLessons).where(eq(courseLessons.courseId, course.id));
    console.log('✅ Deleted existing lessons');

    // Delete existing quiz and questions
    const existingQuizzes = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course.id));
    for (const quiz of existingQuizzes) {
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
    }
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course.id));
    console.log('✅ Deleted existing quiz and questions');

    // ======================================================================
    // LESSON 1: El Poder Oculto de una Visión
    // ======================================================================
    const lesson1Content = `## El Poder Oculto de una Visión

Antes de hablar de técnicas, metas o planificación, necesitamos entender algo fundamental: **una visión no es un deseo bonito**. Una visión es la tecnología más poderosa que tiene el ser humano para transformar su realidad.

No estamos hablando de frases motivacionales ni de "visualizar y atraer". Estamos hablando de un proceso neurológico, psicológico y existencial que, cuando se activa de verdad, reorganiza toda tu vida alrededor de una dirección con sentido.

---

### La diferencia entre fantasía, sueño y visión

Muchas personas confunden estas tres cosas, y esa confusión les cuesta años:

- **La fantasía** es pasiva. Es imaginar sin intención de actuar. Sirve como escape, pero no genera movimiento. Soñar despierto con ganar la lotería es fantasía.
- **El sueño** tiene deseo, pero le falta estructura. "Quiero un mundo mejor" es un sueño. Es el combustible emocional, pero sin motor.
- **La visión** combina deseo, dirección y compromiso. Es un sueño que se hizo honesto consigo mismo. Tiene emoción pero también tiene ojos abiertos. Sabe dónde estás parado y hacia dónde vas.

> Preguntate: lo que llamás "tu visión", ¿es realmente una visión? ¿O es una fantasía disfrazada de plan?

---

### Lo que descubrió Viktor Frankl en el infierno

Viktor Frankl, psiquiatra vienés, sobrevivió a cuatro campos de concentración nazis. En esas condiciones inimaginables, observó algo que cambió la psicología para siempre: **los que sobrevivían no eran necesariamente los más fuertes físicamente, sino los que tenían un sentido, una razón, una visión de futuro**.

Un compañero de Frankl soñó que serían liberados el 30 de marzo de 1945. Cuando ese día pasó sin liberación, murió al día siguiente. No de enfermedad, no de hambre — murió porque su visión se quebró.

Frankl desarrolló la **logoterapia**, basada en una premisa radical: el ser humano puede soportar casi cualquier "cómo" si tiene un "para qué" suficientemente poderoso. La visión no es un lujo de personas privilegiadas. Es una necesidad existencial. Sin ella, nos marchitamos.

> Reflexioná: ¿tenés un "para qué" que te sostenga incluso en tus peores días? Si tu respuesta es vaga o incierta, este curso es exactamente lo que necesitás.

---

### La neurociencia de la visión: tu cerebro no distingue entre vivir y visualizar vívidamente

La investigación en neurociencia ha revelado algo fascinante: cuando visualizás algo con suficiente vivacidad y detalle emocional, **las mismas redes neuronales se activan que cuando lo estás viviendo**. Esto no es metafísica — es biología.

Estudios con atletas olímpicos demostraron que la visualización mental detallada produce mejoras medibles en rendimiento físico. Pianistas que practicaron mentalmente mostraron cambios cerebrales casi idénticos a los que practicaron físicamente.

¿Qué significa esto para vos?

1. **Tu cerebro es un simulador de futuros**. Cuando creás una visión vívida, estás literalmente entrenando a tu sistema nervioso para reconocer oportunidades alineadas con esa visión.
2. **La activación del Sistema Reticular (RAS)**: este filtro cerebral decide qué información de las miles que recibís por segundo llega a tu consciencia. Una visión clara programa tu RAS para detectar recursos, personas y caminos que antes no veías.
3. **La dopamina anticipatoria**: cuando imaginás un futuro deseado con emoción, tu cerebro libera dopamina — la misma que te motiva a actuar. Una buena visión es, literalmente, una fuente de motivación biológica.

Pero hay una trampa: **si tu visión es vaga, tu cerebro no puede hacer nada con ella**. "Quiero estar mejor" no activa nada. "Quiero despertar cada mañana con un propósito claro, rodeado de personas que me inspiren, haciendo un trabajo que me desafíe y aporte a otros" — eso sí enciende circuitos.

---

### El costo invisible de no tener visión

Cuando no tenés una visión clara, no es que "simplemente estás sin dirección". Lo que pasa es más peligroso: **adoptás la visión de otro sin darte cuenta**.

- Seguís la visión que tu familia tenía para vos
- Seguís la visión que el mercado te vende (consumo, estatus, comodidad)
- Seguís la visión que las redes sociales te imponen (comparación constante)
- Seguís la inercia, que no es una visión sino la ausencia de una

La ausencia de visión propia no es neutralidad. Es rendición silenciosa.

> Ejercicio para este momento: cerrá los ojos 60 segundos. Preguntate, con absoluta honestidad: "¿La vida que estoy construyendo hoy es la que yo elegí, o es la que me fue llegando por inercia?" No juzgues la respuesta. Solo observala.

---

### Lo que vamos a hacer en este curso

A lo largo de 10 lecciones, vas a:

1. **Excavarte**: conocer tus valores reales, no los que decís que tenés, sino los que tus acciones demuestran
2. **Construir una visión personal auténtica**: no copiada, no impuesta, sino emergente de tu verdad
3. **Enfrentar tus enemigos internos**: las creencias limitantes, el autosabotaje, el impostor que te habita
4. **Conectar visión con propósito**: para que tu visión tenga raíces profundas y no se vuele con el primer viento
5. **Aprender a construir visión colectiva**: porque la transformación real nunca es individual
6. **Dominar la narrativa transformadora**: contar el futuro para que otros se sumen
7. **Planificar con estrategia y alma**: que tu visión no se quede en poster de Instagram
8. **Desarrollar resiliencia visionaria**: sostener la visión cuando todo dice que la sueltes
9. **Integrar todo en un mapa personal de transformación**: tu brújula para los próximos años

Esto no es un curso para consumir. Es un curso para **hacer**. Cada lección tiene preguntas que te van a incomodar. Ejercicios que te van a exigir honestidad. Y reflexiones que, si te animás a hacerlas de verdad, te van a cambiar.

> ¿Estás listo? No hace falta que lo estés. Solo hace falta que empieces.`;

    // ======================================================================
    // LESSON 2: Conocerte: La Raíz de Toda Visión Auténtica
    // ======================================================================
    const lesson2Content = `## Conocerte: La Raíz de Toda Visión Auténtica

La mayoría de las personas intentan construir una visión de vida sin haber hecho el trabajo previo más importante: **conocerse de verdad**. Es como diseñar un edificio sin estudiar el terreno. Puede quedar lindo en el papel, pero se va a derrumbar.

El autoconocimiento no es un hobby new age. Es la base no negociable de toda transformación genuina. Y es, también, la parte que más resistimos — porque lo que encontramos adentro no siempre nos gusta.

---

### La diferencia entre la persona que creés ser y la que sos

Todos cargamos una imagen de nosotros mismos. Esa imagen fue construida a lo largo de años por nuestras familias, escuelas, amigos, experiencias y por lo que elegimos creer sobre nosotros. Pero esa imagen es, en el mejor de los casos, una versión parcial.

Carl Jung llamó **"persona"** a la máscara social que usamos — el rol que representamos para el mundo. Detrás de esa máscara está lo que él llamó **"la sombra"**: todo lo que reprimimos, negamos o no queremos ver de nosotros mismos.

El problema es este: **si construís tu visión desde la máscara, tu visión va a ser una máscara también**. Va a ser lo que otros esperan de vos, no lo que genuinamente necesitás.

> Preguntate: ¿cuántas de las metas que tenés son realmente tuyas? ¿Cuántas las absorbiste de tu familia, tu cultura, tus redes sociales?

---

### La Ventana de Johari: lo que sabés y lo que no

La **Ventana de Johari** es un modelo simple pero poderoso que divide tu identidad en cuatro zonas:

1. **Área abierta**: lo que vos sabés de vos y los demás también ven (tu personalidad visible)
2. **Área ciega**: lo que otros ven de vos pero vos no reconocés (tus puntos ciegos)
3. **Área oculta**: lo que sabés de vos pero escondés de otros (tus secretos, miedos, vulnerabilidades)
4. **Área desconocida**: lo que ni vos ni otros conocen todavía (tu potencial no descubierto)

La visión más poderosa nace de expandir tu **área abierta** y explorar tu **área desconocida**. Esto requiere dos cosas que nos cuestan muchísimo: **honestidad radical con uno mismo** y **apertura al feedback de otros**.

---

### Ejercicio de Excavación de Valores

Los valores no son lo que decís que te importa. **Los valores son lo que tus acciones demuestran que te importa**. Hay una diferencia enorme.

Podés decir que valorás la familia, pero si trabajás 14 horas diarias y no cenás nunca con tus hijos, tu valor operativo es el trabajo, no la familia. No hay juicio en esto — pero hay una verdad que necesitás ver antes de construir tu visión.

**Ejercicio (tomate al menos 20 minutos para esto):**

1. **Mirá tu última semana**: ¿en qué gastaste más tiempo? ¿Más energía? ¿Más dinero? Hacé una lista real, sin editarla.

2. **Mirá tus últimas 5 decisiones difíciles**: ¿qué elegiste en cada caso? ¿Qué sacrificaste? Lo que elegiste revela tu valor real. Lo que sacrificaste revela lo que decís que valorás pero estás dispuesto a soltar.

3. **La prueba del lecho de muerte**: imaginá que estás en los últimos momentos de tu vida, mirando hacia atrás. ¿Qué lamentarías no haber hecho? ¿Qué estarías orgulloso de haber vivido? Las respuestas a esta pregunta son tus valores más profundos.

4. **Distinguí valores heredados de valores elegidos**: hacé dos columnas. En una, poné los valores que te enseñaron (familia, religión, cultura, educación). En otra, los que vos elegiste conscientemente. ¿Cuántos de tus valores "propios" son en realidad herencias no cuestionadas?

> Si este ejercicio te incomoda, vas por buen camino. El autoconocimiento genuino siempre incomoda antes de liberar.

---

### Los guiones que te dirigen sin que lo sepas

Eric Berne, creador del Análisis Transaccional, descubrió que todas las personas desarrollamos un **"guión de vida"** en la infancia — una narrativa inconsciente sobre quiénes somos, qué merecemos y cómo va a terminar nuestra historia.

Algunos guiones comunes:

- **"El que siempre lucha pero nunca llega"**: se esfuerza muchísimo pero se autosabotea justo antes de lograrlo
- **"El que cuida a todos menos a sí mismo"**: su valor viene de sacrificarse, no de brillar
- **"El que nunca es suficiente"**: siempre un poco menos de lo que debería ser
- **"El que tiene que demostrar algo"**: la motivación viene de probar algo a alguien (un padre, una ex, la sociedad)

**Estos guiones son peligrosísimos cuando diseñás tu visión**, porque te hacen creer que tu visión es libre cuando en realidad está dirigida por una historia que escribiste cuando tenías 7 años.

> Reflexión profunda: ¿reconocés alguno de estos guiones en vos? Si pudieras reescribir tu guión de vida desde cero, sin ninguna obligación con el pasado, ¿qué historia escribirías?

---

### Las tres preguntas que abren todo

Antes de pasar a construir tu visión, necesitás poder responder tres preguntas con honestidad:

1. **¿Qué es lo que genuinamente me importa, más allá de lo que "debería" importarme?** (No lo que tu familia quiere, no lo que Instagram celebra — lo que a vos, en silencio, te mueve)

2. **¿En qué momentos de mi vida me sentí más vivo, más completo, más "yo"?** (Esos momentos son pistas. Contienen las coordenadas de tu propósito)

3. **¿Qué dolor me importa lo suficiente como para hacer algo al respecto?** (Mark Manson lo planteó así: no se trata de qué te hace sentir bien, sino de qué problema estás dispuesto a resolver aunque te cueste)

> Escribí las respuestas. No las pienses — escribilas. El pensamiento gira en círculos; la escritura avanza.`;

    // ======================================================================
    // LESSON 3: El Arte de Construir una Visión Personal
    // ======================================================================
    const lesson3Content = `## El Arte de Construir una Visión Personal

Ahora que empezaste el trabajo de conocerte, es momento de construir. Pero ojo: construir una visión personal no es escribir una lista de metas. Es algo mucho más profundo. Es darle forma a una imagen del futuro que sea lo suficientemente poderosa como para reorganizar tu presente.

---

### Por qué las "metas" no alcanzan

La cultura de la productividad nos vendió la idea de que necesitamos metas SMART (específicas, medibles, alcanzables, relevantes, con plazo). Y sí, las metas tienen su lugar. Pero una meta sin visión es como un ladrillo sin plano: podés ponerlo, pero no sabés si estás construyendo una casa o una pared sin sentido.

La diferencia clave:

- **Meta**: "Quiero ganar $X por mes"
- **Visión**: "Quiero vivir con libertad financiera para poder dedicar mis mañanas a crear, mis tardes a mi comunidad, y tener la tranquilidad de que mi familia está sostenida"

La meta es un indicador. La visión es la experiencia completa de vida que querés habitar. **Las metas se cumplen o se fracasan. La visión se habita o se abandona.**

---

### El Ikigai adaptado: cuatro fuerzas que deben converger

El concepto japonés de **Ikigai** sugiere que la razón de vivir emerge de la intersección de cuatro dimensiones. Lo vamos a adaptar para construir tu visión:

1. **Lo que amás** (tu pasión): ¿qué actividades te hacen perder la noción del tiempo? ¿En qué podrías sumergirte horas sin que nadie te pague?

2. **Lo que el mundo necesita** (tu misión): ¿qué problemas ves a tu alrededor que te indignan? ¿Qué injusticias no podés ignorar? ¿Qué necesidades percibís en tu comunidad?

3. **Aquello en lo que sos bueno** (tu vocación): ¿qué habilidades tenés que otros reconocen, incluso cuando vos las minimizás? ¿En qué te piden ayuda?

4. **Aquello por lo que te pueden compensar** (tu profesión): ¿cómo podés sostener esta vida económicamente? ¿Qué valor podés generar que otros estén dispuestos a retribuir?

**Tu visión personal vive en la intersección de estas cuatro fuerzas**. Si falta alguna, la visión cojea:

- Sin lo que amás: tenés dinero pero no alegría
- Sin lo que el mundo necesita: tenés pasión pero no impacto
- Sin lo que sabés hacer: tenés buenas intenciones pero no efectividad
- Sin sustento económico: tenés propósito pero no sostenibilidad

> Ejercicio: hacé cuatro círculos en un papel. Escribí al menos 5 elementos en cada uno. Después buscá las intersecciones. Ahí está el embrión de tu visión.

---

### Escribiendo tu Declaración de Visión Personal

Una declaración de visión personal es un texto breve (1-3 párrafos) que describe la vida que querés habitar. No es un plan — es una imagen vívida y emocionalmente cargada de tu futuro deseado.

**Principios para escribirla bien:**

1. **Escribí en presente**, como si ya lo estuvieras viviendo: "Vivo en una comunidad donde..." no "Quiero vivir en..."
2. **Sé específico pero no rígido**: describí la experiencia, no los detalles logísticos. "Tengo conversaciones que me desafían intelectualmente" es mejor que "Tengo exactamente 3 amigos intelectuales"
3. **Incluí todas las dimensiones**: tu visión debería tocar tu salud, tus relaciones, tu trabajo, tu contribución al mundo, tu crecimiento interior
4. **Que te emocione al leerla**: si tu visión no te genera algo en el cuerpo — un escalofrío, una sonrisa, un nudo en la garganta — le falta fuerza
5. **Que te asuste un poco**: una visión que no te intimida un poco probablemente sea demasiado chica

**Ejemplo de una declaración de visión personal:**

> "Vivo una vida con propósito donde cada día tiene sentido. Me levanto con energía porque cuido mi cuerpo y mi mente. Tengo relaciones profundas donde puedo ser vulnerable y auténtico. Mi trabajo genera valor real para otros y me permite sostener a mi familia con dignidad. Dedico tiempo a mi comunidad porque entiendo que mi bienestar está atado al de los demás. Cuando me miro al espejo, veo a alguien que se animó a vivir su verdad."

---

### El Anclaje Emocional: hacer que tu visión sea imborrable

Una visión escrita en un papel puede olvidarse. Una visión sentida en el cuerpo se convierte en parte de vos.

**Técnica de anclaje emocional (10 minutos):**

1. Sentate en un lugar tranquilo. Cerrá los ojos. Respirá profundo 3 veces.
2. Imaginá que ya estás viviendo tu visión. No como observador — como protagonista. Metete adentro de esa vida.
3. ¿Qué ves al despertar? ¿Qué olés? ¿Quién está con vos? ¿Qué sonidos escuchás?
4. ¿Cómo se siente tu cuerpo en esa vida? ¿Dónde sentís la emoción — en el pecho, en las manos, en la garganta?
5. Quedate ahí 3-5 minutos. Dejá que la emoción crezca.
6. Abrí los ojos. Escribí lo que sentiste. Esa sensación es tu brújula.

Repetí este ejercicio al menos 3 veces por semana durante el primer mes. Los atletas de élite lo hacen todos los días. Vos también podés.

> Recordá: tu visión no se graba en la mente con letras. Se graba en el cuerpo con emociones.`;

    // ======================================================================
    // LESSON 4: Los Enemigos Internos de la Visión
    // ======================================================================
    const lesson4Content = `## Los Enemigos Internos de la Visión

Tenés una visión. La escribiste. La sentiste. Y ahora viene lo más difícil: **mantenerla viva frente a las fuerzas internas que van a intentar destruirla**.

Porque lo van a intentar. Siempre lo intentan.

Los enemigos externos (falta de recursos, contexto económico, personas tóxicas) son reales, pero manejables. Los enemigos internos son los verdaderamente peligrosos porque operan desde adentro, disfrazados de "sentido común", "realismo" o "protección".

---

### Enemigo 1: Las Creencias Limitantes

Una creencia limitante es una idea sobre vos o sobre el mundo que aceptaste como verdad sin cuestionarla, y que restringe lo que te permitís intentar.

Ejemplos clásicos:

- "No soy lo suficientemente inteligente/capaz/preparado"
- "La gente como yo no llega a eso"
- "Si me va bien, algo malo va a pasar"
- "No merezco tener éxito"
- "Primero tengo que terminar X antes de poder empezar Y" (la trampa del prerequisito infinito)

**¿De dónde vienen?** La mayoría se forman antes de los 12 años. Las absorbés de tus padres, maestros, compañeros y experiencias tempranas. Un padre que te dijo "sos un desastre" una sola vez puede haber instalado una creencia que te limita 30 años después.

**Cómo trabajarlas:**

1. **Identificalas**: cuando sientas resistencia a actuar en dirección a tu visión, preguntate "¿qué estoy creyendo sobre mí o sobre la situación que me frena?"
2. **Cuestionalas**: ¿esa creencia es un hecho verificable o una interpretación? ¿Tenés evidencia concreta o solo la repetiste tantas veces que parece verdad?
3. **Buscá contraejemplos**: ¿conocés a alguien en tu misma situación que haya logrado lo que vos creés imposible? Si existe un solo contraejemplo, la creencia no es ley universal.
4. **Reescribilas**: no con afirmaciones vacías ("soy increíble") sino con versiones honestas y abiertas ("todavía no lo logré, pero estoy aprendiendo y avanzando")

> Ejercicio: escribí tus 5 creencias limitantes más fuertes. Al lado de cada una, escribí cuándo la aprendiste y de quién. Después preguntate: ¿le darías este consejo a un amigo querido? Si la respuesta es no, ¿por qué te lo das a vos?

---

### Enemigo 2: El Síndrome del Impostor

El síndrome del impostor es la sensación persistente de que no merecés tus logros, de que en cualquier momento van a "descubrirte" como fraude. Afecta al 70% de las personas en algún momento de su vida, incluyendo a personas extraordinariamente exitosas.

Lo peligroso del impostor no es que te haga sentir mal — es que **te impide perseguir tu visión porque creés que no tenés derecho a ella**.

Variantes del impostor:

- **El perfeccionista**: "Si no puedo hacerlo perfecto, no lo hago"
- **El experto**: "Necesito saber todo antes de empezar"
- **El genio natural**: "Si me cuesta, es que no soy bueno en esto"
- **El solista**: "Pedir ayuda es signo de debilidad"
- **El superhéroe**: "Tengo que poder con todo"

> Reflexión: ¿con cuál de estas variantes te identificás más? ¿Cómo te frenó en el último año?

---

### Enemigo 3: La Zona de Confort y el Cerebro que Resiste el Cambio

Tu cerebro tiene un diseño evolutivo claro: **minimizar amenazas y conservar energía**. Cualquier cambio significativo — incluso uno positivo — es percibido como amenaza por tu sistema nervioso.

Cuando decidís cambiar tu vida, tu cerebro activa la **amígdala** (centro del miedo) y produce una serie de sensaciones diseñadas para que vuelvas a lo conocido: ansiedad, duda, procrastinación, fatiga inexplicable, hambre repentina.

**No es que seas débil. Es que tu biología está diseñada para resistir el cambio.**

La solución no es "fuerza de voluntad" (recurso limitado). La solución es:

1. **Cambios incrementales**: tu cerebro acepta mejor pequeños pasos que saltos enormes. La regla del 1%: mejorá un 1% cada día
2. **Ambiente diseñado**: modificá tu entorno para que el camino de menor resistencia sea el alineado con tu visión (ej: si querés leer más, dejá libros en todas las superficies de tu casa)
3. **Aliados de visión**: rodeate de personas que compartan tu dirección — tu cerebro social copia el comportamiento del grupo
4. **Celebración de pequeños avances**: cada logro, por mínimo que sea, libera dopamina y refuerza el nuevo camino neural

---

### Enemigo 4: Las Distorsiones Cognitivas

Aaron Beck, padre de la terapia cognitiva, identificó patrones de pensamiento distorsionado que todos tenemos. Estos patrones envenenan tu visión desde adentro:

- **Pensamiento todo-o-nada**: "Si no puedo hacer todo, no hago nada"
- **Catastrofismo**: "Si esto sale mal, mi vida se arruina"
- **Descalificación de lo positivo**: "Sí, me fue bien, pero fue suerte"
- **Lectura mental**: "Seguro piensan que soy un fracasado"
- **Filtro mental**: de 10 cosas buenas y 1 mala, solo ves la mala
- **Etiquetado**: "Soy un perdedor" en vez de "esta vez no me salió"

**La visión necesita claridad mental para sobrevivir**. Si tu pensamiento está distorsionado, tu visión se distorsiona también.

> Ejercicio: durante 3 días, llevá un "diario de pensamientos automáticos". Cada vez que sientas una emoción negativa fuerte, escribí: (1) la situación, (2) el pensamiento automático que tuviste, (3) la emoción que generó, (4) qué distorsión cognitiva detectás. No intentes cambiar nada todavía. Solo observá.

---

### El mapa de tus sabotajes

Cada persona tiene un patrón de autosabotaje preferido. Algunos procrastinan. Otros se sobrecargan de trabajo para no tener que pensar. Otros generan conflictos que les "justifican" abandonar. Otros se comparan obsesivamente hasta paralizarse.

> Tu tarea más importante en esta lección: identificá tu patrón de autosabotaje favorito. No el que creés que tenés — el que tus resultados demuestran que tenés. Mirá tus últimos 3 proyectos abandonados. ¿Qué pasó en cada caso? ¿Ves un patrón?

Nombrar al enemigo es el primer paso para dejar de obedecerlo.`;

    // ======================================================================
    // LESSON 5: Visión y Propósito — El Hilo que Todo lo Conecta
    // ======================================================================
    const lesson5Content = `## Visión y Propósito: El Hilo que Todo lo Conecta

Hay una diferencia sutil pero enormemente importante entre tener una visión y tener un propósito. Podés tener una visión hermosa pero sentir que le falta algo — esa sensación de que la imagen está completa pero el alma está ausente. Lo que falta, casi siempre, es propósito.

---

### La diferencia entre visión y propósito

- **La visión** es el "hacia dónde": la imagen del futuro que querés crear
- **El propósito** es el "para qué profundo": la razón existencial que sostiene todo

La visión puede cambiar. El propósito raramente cambia — evoluciona, se profundiza, pero su esencia permanece.

Pensalo así: tu visión es el barco. Tu propósito es la estrella que te guía. Podés cambiar de barco, podés navegar por diferentes mares, pero la estrella sigue ahí arriba, dándote dirección.

---

### El "Por Qué" detrás del "Por Qué"

Simon Sinek popularizó la pregunta "¿por qué hacés lo que hacés?", pero la mayoría de las personas se quedan en la primera capa de respuesta. El verdadero poder está en cavar más profundo.

**Técnica de los 5 Por Qué (adaptada):**

Empezá con tu visión o meta más importante y preguntá "¿por qué?" cinco veces:

- "Quiero tener mi propio negocio" — ¿Por qué?
- "Porque quiero libertad financiera" — ¿Por qué eso es importante?
- "Porque no quiero depender de que otro decida mi futuro" — ¿Por qué te importa tanto eso?
- "Porque de chico vi a mi viejo sufrir por un jefe abusivo y juré que a mí no me iba a pasar" — ¿Y qué hay debajo de eso?
- "Quiero vivir con dignidad y quiero que mis hijos vean que es posible elegir tu camino"

Mirá lo que pasó: empezamos con "negocio propio" (meta) y llegamos a "dignidad y ejemplo para mis hijos" (propósito). La diferencia es abismal. Si el negocio fracasa, la meta muere. Pero el propósito sigue vivo y puede manifestarse de mil formas diferentes.

> Hacé este ejercicio con tu visión. Cavá hasta que sientas que llegaste a algo que te emociona, que te agarra en la garganta. Eso es tu propósito.

---

### El propósito no se "encuentra" — se construye

Hay un mito dañino que dice que el propósito es algo que "encontrás", como si estuviera escondido esperándote. La realidad es más matizada.

El propósito emerge de la intersección entre:

- **Tu dolor**: lo que sufriste te sensibiliza ante ciertos problemas del mundo
- **Tu don**: las habilidades que desarrollaste (muchas veces, justamente, para sobrevivir ese dolor)
- **Tu contexto**: el momento histórico, geográfico y social en el que te toca vivir

Tu dolor no es un accidente. Puede convertirse en tu mayor activo si lo usás como brújula. La persona que sufrió injusticia se vuelve defensora de derechos. La que fue ignorada se vuelve la que escucha. La que vivió la pobreza se vuelve la que genera oportunidades.

> Reflexión: ¿qué dolor de tu historia podrías transformar en propósito? ¿Qué herida te hizo más sensible a un problema que el mundo necesita resolver?

---

### Propósito y resiliencia: la conexión invisible

Las investigaciones sobre resiliencia muestran consistentemente que las personas con un sentido de propósito claro:

- Se recuperan más rápido de las adversidades
- Tienen mejor salud física (menos cortisol, mejor sistema inmune)
- Mantienen relaciones más profundas
- Experimentan mayor bienestar a largo plazo (no felicidad hedónica, sino eudaimónica)
- Toman mejores decisiones bajo presión

El propósito funciona como un sistema inmunológico existencial. No te evita el sufrimiento, pero te da las herramientas para procesarlo y transformarlo.

---

### El peligro del propósito que no es tuyo

Así como hay visiones prestadas, hay propósitos prestados. Y son igual de tóxicos.

Señales de que tu propósito no es tuyo:

- Lo describís con palabras que suenan bien pero no sentís
- Te agota más de lo que te energiza
- Sentís que "deberías" hacerlo, no que "necesitás" hacerlo
- Cuando imaginás dejarlo, sentís alivio seguido de culpa
- Lo adoptaste después de una crisis sin procesarla realmente

Un propósito auténtico te desafía pero también te llena. Te cuesta pero no te destruye. Te saca de la comodidad pero no de tu esencia.

> Preguntate: si nadie se enterara, si no hubiera reconocimiento, si nadie te aplaudiera — ¿seguirías haciendo lo que hacés? La respuesta a esa pregunta revela mucho sobre la autenticidad de tu propósito.

---

### Ejercicio integrador: tu declaración de propósito

Combinando todo lo trabajado, escribí una declaración de propósito en 1-2 oraciones. Debe responder: "¿Para qué existo en este mundo? ¿Qué contribución única puedo hacer?"

No tiene que ser grandiosa. Puede ser simple y profunda al mismo tiempo.

Ejemplos:

- "Existo para ayudar a otros a encontrar su voz cuando el mundo les dice que se callen"
- "Mi propósito es crear espacios donde las personas puedan ser vulnerables sin miedo"
- "Estoy acá para demostrar que se puede vivir con integridad y abundancia al mismo tiempo"

> Tu declaración de propósito no necesita ser perfecta hoy. Necesita ser honesta hoy. Se va a refinar con el tiempo, pero tiene que empezar con verdad.`;

    // ======================================================================
    // LESSON 6: De la Visión Individual a la Colectiva
    // ======================================================================
    const lesson6Content = `## De la Visión Individual a la Colectiva

Hasta ahora trabajamos tu visión personal. Pero hay algo que necesitás entender profundamente: **ninguna transformación significativa en la historia fue obra de una sola persona**. Siempre fue obra de una visión compartida que se encarnó en un grupo.

La pregunta entonces no es solo "¿qué visión tengo para mi vida?" sino "¿qué visión compartimos para nuestro futuro?"

---

### Lo que Peter Senge descubrió sobre las visiones compartidas

Peter Senge, en "La Quinta Disciplina", argumenta que una visión compartida no es simplemente la visión de un líder que otros siguen. **Una verdadera visión compartida emerge cuando las personas descubren que su visión personal está conectada con algo más grande**.

Hay tres formas en que los grupos se relacionan con una visión:

1. **Acatamiento**: "Lo hago porque me lo piden" — genera obediencia pero no compromiso
2. **Alineamiento**: "Entiendo la visión y estoy de acuerdo" — genera cooperación pero no pasión
3. **Compromiso genuino**: "Esta visión es parte de mi identidad, la defiendo como propia" — genera la energía que mueve montañas

La diferencia entre estos niveles es la diferencia entre una organización que funciona y un movimiento que transforma.

> Reflexión: en los grupos donde participás (familia, trabajo, comunidad), ¿en qué nivel estás? ¿Acatamiento, alineamiento o compromiso? ¿Qué haría falta para subir de nivel?

---

### Cómo nacen los movimientos

Estudios sobre movimientos sociales exitosos revelan patrones comunes:

1. **Un diagnóstico compartido del problema**: no alcanza con que todos sientan que algo está mal. Necesitan nombrar el mismo problema de manera similar.

2. **Una imagen compartida del futuro deseado**: el grupo necesita poder responder: "si todo sale bien, ¿cómo se ve el mundo en 5, 10, 20 años?"

3. **Un sentido de eficacia colectiva**: la creencia de que "nosotros, juntos, podemos hacer algo al respecto". Sin esta creencia, la visión genera frustración en vez de acción.

4. **Una identidad de grupo**: el sentido de "nosotros" — no somos individuos sueltos con la misma queja, somos un grupo con un nombre, una historia y un destino compartido.

5. **Rituales y prácticas compartidas**: los movimientos que duran tienen formas regulares de reunirse, celebrar, recordar y renovar su compromiso.

---

### El proceso de visión colectiva: paso a paso

Si querés construir una visión colectiva (en tu barrio, tu organización, tu grupo de amigos, tu familia), este proceso funciona:

**Fase 1: Escucha profunda (1-2 encuentros)**
- Cada persona comparte su visión personal sin interrupción
- Se usan mapas de empatía: "¿qué ve, oye, siente, piensa cada uno?"
- El objetivo no es consensuar todavía — es entender la riqueza de perspectivas

**Fase 2: Identificación de convergencias (1 encuentro)**
- ¿Qué elementos aparecen en múltiples visiones?
- ¿Qué valores comparten aunque los expresen diferente?
- ¿Qué futuro desean todos, aunque lo imaginen distinto?

**Fase 3: Construcción de la visión puente (1-2 encuentros)**
- La "visión puente" conecta las visiones individuales en una narrativa compartida
- No es la suma de partes — es una síntesis que es más que las partes
- Debe incluir: el futuro deseado, los valores compartidos, el rol de cada persona

**Fase 4: Compromiso público (1 evento)**
- Cada persona declara públicamente su compromiso con la visión colectiva
- Se establecen acuerdos concretos de acción
- Se define un ritual de revisión periódica

> Ejercicio: elegí un grupo al que pertenecés (familia, amigos, trabajo, comunidad). ¿Tienen una visión compartida explícita? Si no la tienen, ¿cómo afecta eso la dinámica del grupo? ¿Qué pasaría si se sentaran a construir una?

---

### La tensión necesaria entre lo individual y lo colectivo

Uno de los errores más comunes es creer que la visión colectiva debe reemplazar la individual. No. La tensión entre ambas es productiva:

- Tu visión personal te da **autenticidad** — sabés quién sos y qué querés
- La visión colectiva te da **potencia** — multiplicás tu impacto
- La tensión entre ambas te da **discernimiento** — sabés cuándo ceder y cuándo sostener

Los mejores aportes a cualquier grupo vienen de personas que tienen una visión personal clara y eligen ponerla al servicio de algo más grande. No desde la sumisión, sino desde la generosidad consciente.

> La pregunta clave no es "¿qué estoy dispuesto a sacrificar por el grupo?" sino "¿qué puedo aportar al grupo que solo yo puedo aportar, y que además me hace crecer?"

---

### Propiedades emergentes: cuando el todo es más que las partes

En sistemas complejos existe un fenómeno llamado **emergencia**: cuando los componentes de un sistema interactúan de cierta manera, surgen propiedades que ningún componente tiene por sí solo. El agua no es húmeda — los átomos de hidrógeno y oxígeno lo son cuando interactúan de cierta forma.

Lo mismo pasa con los grupos humanos alineados: cuando las visiones individuales convergen en una visión colectiva auténtica, emerge algo que ningún individuo podría crear solo. Una energía, una creatividad, una capacidad de acción que es cualitativamente diferente.

Esto no es magia. Es la física social de los sistemas complejos. Y es la razón por la que los movimientos más poderosos de la historia siempre fueron colectivos.`;

    // ======================================================================
    // LESSON 7: Narrativas Transformadoras — Contar el Futuro
    // ======================================================================
    const lesson7Content = `## Narrativas Transformadoras: Contar el Futuro

Los seres humanos no nos movemos por datos. Nos movemos por historias. Podés tener la visión más brillante del mundo, pero si no sabés contarla de una manera que le llegue a otros, se queda dentro tuyo. Y una visión que no se comunica, no transforma.

---

### Marshall Ganz y el arte de la narrativa pública

Marshall Ganz, profesor de Harvard y organizador comunitario legendario, desarrolló un marco para construir narrativas que movilizan. Lo llamó **"Narrativa Pública"** y tiene tres componentes:

**1. Historia del Yo (Story of Self)**
¿Por qué vos, específicamente, te importa esto? ¿Qué experiencia personal te conecta con esta causa? La gente no se conecta con ideas abstractas — se conecta con personas reales que vivieron algo real.

No necesitás un trauma dramático. Necesitás un momento de verdad: el instante donde algo cambió en tu forma de ver el mundo.

**2. Historia del Nosotros (Story of Us)**
¿Qué compartimos como grupo? ¿Qué experiencias, valores o desafíos nos unen? Esta historia construye identidad colectiva — el "nosotros" que hace posible la acción conjunta.

**3. Historia del Ahora (Story of Now)**
¿Por qué es urgente actuar ahora? ¿Qué está en juego si no hacemos nada? ¿Cuál es el primer paso concreto que podemos dar?

La fuerza de la narrativa pública está en la secuencia: **primero te conectás emocionalmente (Yo), después generás identidad grupal (Nosotros), y finalmente llamás a la acción con urgencia (Ahora)**.

> Ejercicio: escribí tu propia narrativa pública en 3 párrafos cortos. Uno para cada historia. No la pensés demasiado — la primera versión es siempre borrador, pero tiene que salir.

---

### El viaje del héroe aplicado a la transformación comunitaria

Joseph Campbell estudió mitos de todas las culturas y encontró una estructura universal: **el viaje del héroe**. Esta misma estructura puede aplicarse a la narrativa de transformación:

1. **El mundo ordinario**: así vivíamos antes, con estas limitaciones
2. **El llamado**: algo nos despertó, algo que ya no podemos ignorar
3. **El rechazo del llamado**: las dudas, los miedos, las excusas
4. **El mentor/aliados**: las personas y recursos que aparecen cuando decidís avanzar
5. **El umbral**: el punto de no retorno, la decisión de cambiar
6. **Las pruebas**: los obstáculos que nos fortalecen
7. **La transformación**: el cambio profundo que nos hace diferentes
8. **El regreso**: volver a la comunidad con lo aprendido para compartirlo

**Tu comunidad es la heroína de su propia historia**. No vos como líder — la comunidad como protagonista. Tu rol es ser el mentor que señala el camino, no el héroe que salva.

---

### Los elementos de una narrativa que mueve

No toda historia mueve. Las que mueven comparten estos elementos:

**Tensión emocional**: toda buena historia tiene conflicto. No escondas las dificultades — mostralas. La gente desconfía de las narrativas perfectas.

**Personajes reales**: no hablés de "la gente" en abstracto. Contá la historia de María del barrio, de Juan que perdió el trabajo, de la abuela que marcha todos los viernes. Los datos informan; las personas conmueven.

**Imágenes concretas**: "Queremos un futuro mejor" no genera nada. "Queremos que nuestros hijos puedan caminar al colegio sin miedo, que los viejos tengan dónde sentarse a tomar mate en la plaza, que haya trabajo digno para el que quiera trabajar" — eso genera imagen, emoción, identificación.

**Un enemigo nombrable**: no necesariamente una persona — puede ser un sistema, una inercia, una injusticia. Pero tiene que haber algo contra lo cual la visión se contrasta. Sin contraste, no hay energía.

**Un llamado claro**: la historia debe terminar con una invitación concreta. No "hagamos algo" sino "este sábado a las 10, en la plaza, arrancamos".

---

### Errores comunes al comunicar la visión

1. **Empezar con datos**: los datos son importantes pero secundarios. Empezá con historia, terminá con datos.

2. **Hablar desde la superioridad**: "nosotros sabemos lo que hay que hacer" mata la conexión. Mejor: "estamos buscando juntos un camino"

3. **Usar lenguaje técnico**: si tu abuela no entiende tu visión, necesitás reescribirla

4. **No incluir la dificultad**: si tu narrativa suena demasiado fácil, nadie te cree. Reconocé que es difícil pero posible.

5. **No dar el primer paso**: la mejor narrativa del mundo es inútil si no termina con una acción concreta que la gente pueda hacer mañana

> Pregunta para reflexionar: si tuvieras 3 minutos para explicarle tu visión a alguien en un café, ¿qué dirías? Practicá en voz alta. Si no podés explicarla en 3 minutos, probablemente no la tenés lo suficientemente clara.

---

### Tu narrativa es un organismo vivo

La narrativa no se escribe una vez y listo. Se practica, se ajusta, se enriquece con cada persona que la escucha y responde. Los mejores comunicadores de visión son los que:

- Escuchan tanto como hablan
- Adaptan el lenguaje al interlocutor sin cambiar el mensaje esencial
- Incluyen las historias de otros en la narrativa colectiva
- No tienen miedo de mostrar vulnerabilidad

> Tu visión necesita una voz. Esa voz sos vos. No tiene que ser perfecta — tiene que ser auténtica.`;

    // ======================================================================
    // LESSON 8: Planificación Estratégica con Alma
    // ======================================================================
    const lesson8Content = `## Planificación Estratégica con Alma

Llegamos al punto donde muchas visiones mueren: **el momento de pasar del sueño al plan**. La planificación estratégica tiene mala fama entre los soñadores porque suena fría, burocrática, corporativa. Pero una buena planificación no mata la visión — **la hace posible**.

El secreto está en planificar con rigor sin perder el alma. Y eso es un arte.

---

### Por qué la planificación habitual fracasa

La planificación tradicional (objetivos anuales, to-do lists, cronogramas) falla para transformaciones profundas porque asume tres cosas que no son ciertas:

1. **Que podés predecir el futuro**: en sistemas complejos (y la vida es un sistema complejo), la predictibilidad es limitada. Los planes rígidos se quiebran ante lo inesperado.

2. **Que el cambio es lineal**: la realidad del cambio es más parecida a una montaña rusa — hay mesetas largas, retrocesos aparentes y saltos repentinos.

3. **Que la motivación es constante**: la motivación fluctúa. Un plan que depende de tu motivación del Día 1 va a fracasar en el Día 47 cuando todo parezca cuesta arriba.

La planificación que funciona para transformaciones profundas necesita ser **adaptativa, sostenible y conectada con tu propósito**.

---

### Teoría del Cambio: planificar desde el futuro hacia el presente

La **Teoría del Cambio** es una herramienta usada en desarrollo social que invierte la lógica habitual. En vez de preguntarte "¿qué hago mañana?", te preguntás:

1. **¿Cómo se ve el éxito?** (tu visión en detalle)
2. **¿Qué condiciones deben existir para que ese éxito ocurra?** (prerequisitos)
3. **¿Qué debe pasar para que esas condiciones se den?** (cambios necesarios)
4. **¿Qué puedo hacer yo/nosotros para provocar esos cambios?** (acciones)
5. **¿Qué supuestos estoy haciendo y cómo los verifico?** (humildad estratégica)

Es como construir un puente: empezás sabiendo dónde querés llegar y trabajás hacia atrás hasta el presente.

> Ejercicio: tomá tu visión personal y aplicá este proceso. ¿Qué condiciones necesitan existir para que tu visión se materialice? ¿Qué cambios necesitan ocurrir? ¿Cuáles de esos cambios dependen de vos?

---

### Backcasting vs Forecasting

**Forecasting** es proyectar desde el presente: "dado que hoy es así, probablemente mañana sea así". Es útil para predicciones a corto plazo, pero terrible para transformaciones porque te ancla a lo conocido.

**Backcasting** es lo opuesto: "dado que quiero llegar allá, ¿qué tendría que haber pasado justo antes? ¿Y antes de eso? ¿Y antes?" Hasta llegar al hoy.

El backcasting libera tu creatividad porque te saca del peso del presente. Cuando arrancás desde el futuro deseado, descubrís caminos que desde el presente son invisibles.

---

### OKRs con propósito

Los **OKR (Objectives and Key Results)** son una herramienta de gestión poderosa que podés adaptar para tu transformación personal:

- **Objetivo**: una dirección inspiradora (conectada con tu visión). Ejemplo: "Tener una presencia física fuerte y energía sostenida"
- **Resultado Clave 1**: indicador medible. "Entrenar 4 veces por semana durante 3 meses"
- **Resultado Clave 2**: otro indicador. "Dormir 7+ horas el 80% de las noches"
- **Resultado Clave 3**: otro más. "Reducir azúcar procesada a menos de 3 veces por semana"

La clave para que los OKRs funcionen en transformación personal:

- **El Objetivo debe emocionarte**: si al leerlo no sentís nada, reescribilo
- **Los Resultados Clave deben ser honestos**: no pongas metas que sabés que no vas a cumplir
- **Revisá cada trimestre**: lo que no se revisa, se abandona
- **Celebrá el progreso, no solo el logro**: si tu meta era 4 entrenamientos y lograste 3, celebrá los 3 antes de buscar el 4to

---

### Pensamiento sistémico: ver el bosque, no solo los árboles

Donella Meadows, pionera del pensamiento sistémico, nos enseñó que **los problemas complejos no se resuelven atacando síntomas, sino interviniendo en los puntos de apalancamiento del sistema**.

Para tu planificación, esto significa:

1. **Identificá los loops de refuerzo**: ¿qué acciones generan ciclos virtuosos? (ej: hacer ejercicio → más energía → mejor trabajo → más satisfacción → más motivación para ejercitar)

2. **Identificá los loops de freno**: ¿qué te frena sistemáticamente? (ej: trabajar mucho → estrés → mala alimentación → poca energía → más estrés)

3. **Encontrá los puntos de apalancamiento**: ¿cuál es la acción más pequeña que genera el cambio más grande? A veces cambiar un solo hábito (como el horario de dormir) transforma todo un sistema de vida.

> Ejercicio: dibujá tu "sistema de vida" actual como un mapa de flechas. ¿Qué alimenta qué? ¿Dónde están los ciclos viciosos? ¿Dónde podrías intervenir con mínimo esfuerzo para máximo impacto?

---

### La paciencia estratégica

Uno de los conceptos más difíciles de aceptar: **la transformación genuina toma tiempo**. No semanas — meses y años.

La cultura del "hack" y el "growth" te vende la idea de que todo puede acelerarse. Pero los cambios profundos — de identidad, de relaciones, de comunidad — tienen su propio ritmo.

La paciencia estratégica no es pasividad. Es actuar consistentemente con la consciencia de que los resultados importantes son acumulativos. Como un árbol: no crece más rápido si le gritás, pero si lo regás todos los días, eventualmente da sombra para todos.

> Preguntate: ¿estás dispuesto a trabajar 2 años en algo sin ver resultados dramáticos, si sabés que en el año 3 todo cambia? Si la respuesta es no, tu visión necesita más raíces de propósito.`;

    // ======================================================================
    // LESSON 9: Resiliencia y Adaptación
    // ======================================================================
    const lesson9Content = `## Resiliencia y Adaptación: Sostener la Visión en la Tormenta

Hasta ahora construimos la visión, la conectamos con propósito, la expandimos al colectivo, la comunicamos con narrativa y la aterrizamos con estrategia. Todo perfecto en el papel. Ahora hablemos de lo que pasa cuando la vida te pega una piña en la cara.

Porque lo va a hacer. No es pesimismo — es realidad. Y la diferencia entre quienes transforman su mundo y quienes abandonan no está en la ausencia de golpes, sino en la capacidad de seguir avanzando después de recibirlos.

---

### La Curva J del cambio

Cuando iniciás una transformación, tu rendimiento y bienestar no mejoran linealmente. Siguen lo que se llama la **Curva J**:

1. **Entusiasmo inicial**: todo es nuevo, hay energía, la visión brilla
2. **El valle de la desilusión**: las cosas se ponen difíciles, los resultados no llegan, dudás de todo
3. **La meseta del aprendizaje**: empezás a integrar, los cambios se estabilizan pero no son espectaculares
4. **El despegue**: los resultados acumulados empiezan a manifestarse, hay un salto cualitativo
5. **La nueva normalidad**: lo que antes era tu visión ahora es tu vida cotidiana

**El momento más peligroso es el punto 2 — el valle de la desilusión**. Es ahí donde la mayoría abandona. Y es ahí donde tu propósito y tu comunidad marcan la diferencia entre rendirse y seguir.

> Preguntate: ¿cuántas veces abandonaste algo en el valle de la desilusión, justo antes de que empezara a funcionar? ¿Cómo sabés que no estás en un valle ahora mismo?

---

### Otto Scharmer y la Teoría U: dejar ir para dejar venir

Otto Scharmer, del MIT, desarrolló un marco llamado **Teoría U** que describe cómo los individuos y las organizaciones pueden navegar el cambio profundo. El proceso tiene forma de U:

**Lado izquierdo (bajar la U): Soltar**
1. **Ver**: observar la realidad sin filtros ni juicios
2. **Sentir**: conectar empáticamente con la situación, dejarte afectar
3. **Presenciar**: llegar al punto más profundo de la U — soltar lo viejo y conectar con lo que quiere emerger

**Fondo de la U: Presencing**
- Es el momento de mayor vulnerabilidad y mayor potencial
- Requiere silencio, soltar el control, confiar en el proceso
- De acá emerge la innovación genuina, no la creatividad forzada

**Lado derecho (subir la U): Crear**
4. **Cristalizar**: darle forma a lo nuevo que emergió
5. **Prototipar**: probarlo rápido, sin perfeccionismo
6. **Encarnar**: integrarlo en la vida cotidiana, hacerlo sostenible

Lo más importante de la Teoría U es el concepto de **"presencing"** (presencia + sentir): la capacidad de soltar tu idea de cómo deberían ser las cosas y abrirte a cómo podrían ser.

> Reflexión: cuando enfrentás un obstáculo en tu visión, ¿tu primer impulso es forzar una solución (subir la U prematuramente) o podés detenerte, observar y sentir antes de actuar?

---

### Resiliencia no es aguantar — es transformar

La resiliencia popular se confunde con aguante: apretar los dientes y bancársela. Pero la resiliencia real es mucho más que eso. Es la capacidad de **usar la adversidad como combustible de crecimiento**.

Las investigaciones de Richard Tedeschi y Lawrence Calhoun sobre **crecimiento postraumático** muestran que las personas que crecen después de adversidades reportan cambios en cinco áreas:

1. **Nuevas posibilidades**: ven caminos que antes no existían
2. **Relaciones más profundas**: la adversidad revela quién está de verdad
3. **Mayor fortaleza personal**: "si sobreviví eso, puedo con esto"
4. **Renovación espiritual o existencial**: un sentido más profundo de la vida
5. **Mayor apreciación de la vida**: lo cotidiano gana valor

Esto no significa que la adversidad sea "buena". Significa que la forma en que la procesás determina si te destruye o te transforma.

---

### Prácticas concretas de resiliencia visionaria

**1. El diario de aprendizaje**
Cada vez que algo salga mal, escribí: (1) qué pasó, (2) qué sentiste, (3) qué aprendiste, (4) qué vas a hacer diferente. La escritura transforma experiencia en sabiduría.

**2. El consejo de aliados**
Tené 3-5 personas de confianza con quienes podés hablar cuando la cosa se pone difícil. No para que te den soluciones, sino para que te escuchen y te recuerden tu visión cuando vos la olvidés.

**3. La práctica del perspectivismo**
Cuando estés en crisis, preguntate: "¿cómo voy a ver esta situación dentro de 5 años?" Esto activa la corteza prefrontal (pensamiento racional) y desactiva la amígdala (reacción emocional).

**4. El ritual de reconexión**
Tené un ritual personal para reconectarte con tu visión: puede ser releer tu declaración de visión, meditar, caminar por un lugar que te inspire, escuchar una canción que te conecte. Usalo cada vez que sientas que la visión se debilita.

**5. La regla del 80%**
No intentes mantener tu visión con intensidad máxima el 100% del tiempo. Eso es una receta para el burnout. Apuntá al 80%: la mayoría de los días alineado, con espacio para los días en que simplemente no podés.

> Ejercicio: diseñá tu propio "kit de emergencia visionaria" — las 3-5 prácticas o recursos que vas a usar cuando la visión se tambalee. Escribilos y tenelos a mano. Cuando estés en el valle, no vas a tener energía para inventar estrategias. Necesitás tenerlas listas.

---

### La visión flexible: adaptarse sin rendirse

La rigidez mata más visiones que el fracaso. Las visiones que sobreviven son las que saben **adaptarse sin perder su esencia**.

Esto significa que los "cómo" pueden cambiar (estrategias, plazos, medios) pero el "para qué" permanece (propósito, valores, dirección).

El signo de una visión madura no es que nunca cambia — es que evoluciona inteligentemente en respuesta a la realidad, sin perder su norte existencial.`;

    // ======================================================================
    // LESSON 10: Integración — Tu Mapa de Transformación Personal
    // ======================================================================
    const lesson10Content = `## Integración: Tu Mapa de Transformación Personal

Llegamos al final de este viaje — que en realidad es un comienzo. A lo largo de 9 lecciones hiciste un trabajo enorme: te conociste más profundamente, construiste una visión personal, enfrentaste tus enemigos internos, conectaste con tu propósito, aprendiste a construir visión colectiva, a narrarla, a planificarla, y a sostenerla.

Ahora es momento de **integrar todo en un mapa personal que puedas llevar con vos**.

---

### El Mapa de Transformación Personal

Tu mapa no es un documento burocrático. Es una brújula viva. Tiene siete componentes que resumen todo lo trabajado:

**1. Tu Declaración de Propósito** (Lección 5)
Una o dos oraciones que responden: ¿para qué estás en este mundo?

**2. Tu Declaración de Visión** (Lección 3)
1-3 párrafos que describen la vida que querés habitar, escritos en presente y con carga emocional.

**3. Tus Valores Operativos** (Lección 2)
Los 3-5 valores que realmente guían tus decisiones (no los que te gustaría que las guiaran — los que tus acciones demuestran).

**4. Tus Enemigos Identificados** (Lección 4)
Tu patrón de autosabotaje principal, tus creencias limitantes más fuertes, y la distorsión cognitiva que más te afecta. Ponerlos por escrito les quita poder.

**5. Tu Narrativa** (Lección 7)
Tu historia del Yo, del Nosotros y del Ahora — cómo contás tu visión en 3 minutos.

**6. Tus OKRs para los Próximos 90 Días** (Lección 8)
2-3 objetivos con resultados clave medibles. Solo 90 días — lo suficiente para avanzar, lo corto como para no perderte.

**7. Tu Kit de Emergencia** (Lección 9)
Las 3-5 prácticas que vas a usar cuando la visión se tambalee.

> Ejercicio final: escribí tu mapa. No necesita ser perfecto. Necesita existir. Un mapa imperfecto es infinitamente mejor que no tener mapa.

---

### El ritual de compromiso

En muchas tradiciones, los compromisos importantes se sellan con algún tipo de ritual. No porque el ritual tenga poder mágico, sino porque **el acto de comprometerse públicamente cambia tu relación con la promesa**.

La investigación sobre compromisos muestra que:

- Los compromisos escritos se cumplen más que los pensados
- Los compromisos compartidos se cumplen más que los privados
- Los compromisos con fecha se cumplen más que los abiertos
- Los compromisos con consecuencias se cumplen más que los sin consecuencias

**Tu ritual puede ser simple:**

1. Leé tu mapa en voz alta (solo o acompañado)
2. Firmalo y fechalo
3. Elegí a una persona con quien compartirlo — alguien que te importe y que te pueda sostener
4. Definí cuándo vas a revisarlo (sugerencia: cada 90 días)
5. Definí qué pasa si no lo revisás (consecuencia que te duela un poco)

---

### La revisión como práctica sagrada

Las mejores visiones del mundo se marchitan si no se revisan. No porque sean malas, sino porque la vida cambia y la visión necesita actualizarse.

**Revisión trimestral (cada 90 días):**

- ¿Mi visión sigue resonando o necesita ajustes?
- ¿Cumplí mis OKRs? ¿Por qué sí o por qué no?
- ¿Descubrí algo nuevo sobre mí que cambia la dirección?
- ¿Mis enemigos internos aparecieron? ¿Cómo los manejé?
- ¿Qué aprendí que no sabía hace 90 días?

**Revisión anual:**

- ¿Estoy más cerca de mi visión que hace un año?
- ¿Mi propósito se profundizó o cambió?
- ¿Qué necesito soltar que ya no me sirve?
- ¿Qué necesito incorporar que no tenía?

> La revisión no es autocrítica. Es autoconocimiento en movimiento. Acercate a ella con curiosidad, no con juicio.

---

### Lo que no te dijimos al principio

Hay algo que este curso no te pudo enseñar, porque solo se aprende haciéndolo: **la visión no es un destino al que llegás, sino una forma de caminar**.

Las personas que realmente transforman su vida y su comunidad no son las que "cumplen su visión". Son las que viven orientadas por su visión. Cada día. Cada decisión. Cada conversación.

La visión no se cumple un martes a las 15:30. La visión se habita. Se practica. Se encarna en cómo tratás a la persona que te atiende en el kiosco, en cómo escuchás a tu hijo cuando le fue mal, en cómo te levantás después de un fracaso.

---

### Tu responsabilidad

Si llegaste hasta acá, ya no podés decir "no sabía". Sabés. Sabés lo que querés. Sabés lo que te frena. Sabés cómo construir una visión. Sabés cómo sostenerla.

Ahora la pregunta es solo una: **¿vas a hacer algo con lo que sabés?**

No mañana. No "cuando tenga tiempo". No "cuando esté listo". Ahora. Imperfectamente. Con miedo. Con dudas. Pero con dirección.

> El mundo no necesita gente perfecta con visiones perfectas. Necesita gente imperfecta con la valentía de intentar transformar su realidad. Ese puede ser tu rol.

---

### Una última reflexión

Hace 10 lecciones empezaste con una pregunta: ¿tenés una visión? Ahora te hacemos otra: **¿estás dispuesto a vivirla?**

La respuesta no se da con palabras. Se da con acciones.

Gracias por llegar hasta acá. El verdadero curso empieza cuando cerrás esta pantalla y abrís tu vida.`;

    // ======================================================================
    // INSERT ALL LESSONS
    // ======================================================================
    const lessons = [
      {
        courseId: course.id,
        title: 'El Poder Oculto de una Visión',
        description: 'Por qué la visión es la tecnología más poderosa del ser humano. Neurociencia, Frankl, y la diferencia entre fantasía, sueño y visión.',
        content: lesson1Content,
        orderIndex: 1,
        type: 'text' as const,
        duration: 45,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Conocerte: La Raíz de Toda Visión Auténtica',
        description: 'Autoconocimiento profundo como base no negociable. Jung, la Ventana de Johari, excavación de valores y guiones de vida.',
        content: lesson2Content,
        orderIndex: 2,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'El Arte de Construir una Visión Personal',
        description: 'Proceso guiado para crear tu visión. Ikigai adaptado, declaración de visión personal y técnica de anclaje emocional.',
        content: lesson3Content,
        orderIndex: 3,
        type: 'text' as const,
        duration: 45,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Los Enemigos Internos de la Visión',
        description: 'Creencias limitantes, síndrome del impostor, zona de confort y distorsiones cognitivas. Cómo identificar y desactivar lo que te frena.',
        content: lesson4Content,
        orderIndex: 4,
        type: 'text' as const,
        duration: 45,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Visión y Propósito: El Hilo que Todo lo Conecta',
        description: 'La diferencia entre visión y propósito. Los 5 Por Qué, propósito emergente del dolor, y la declaración de propósito personal.',
        content: lesson5Content,
        orderIndex: 5,
        type: 'text' as const,
        duration: 45,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'De la Visión Individual a la Colectiva',
        description: 'Peter Senge, movimientos sociales y el proceso paso a paso para construir una visión compartida auténtica.',
        content: lesson6Content,
        orderIndex: 6,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Narrativas Transformadoras: Contar el Futuro',
        description: 'Marshall Ganz, el viaje del héroe y el arte de comunicar tu visión de forma que mueva a otros a la acción.',
        content: lesson7Content,
        orderIndex: 7,
        type: 'text' as const,
        duration: 45,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Planificación Estratégica con Alma',
        description: 'Teoría del Cambio, backcasting, OKRs con propósito y pensamiento sistémico para transformar visión en acción.',
        content: lesson8Content,
        orderIndex: 8,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Resiliencia y Adaptación: Sostener la Visión en la Tormenta',
        description: 'La Curva J, Teoría U de Scharmer, crecimiento postraumático y prácticas concretas de resiliencia visionaria.',
        content: lesson9Content,
        orderIndex: 9,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course.id,
        title: 'Integración: Tu Mapa de Transformación Personal',
        description: 'Poné todo junto en un mapa personal de 7 componentes. Ritual de compromiso, práctica de revisión y el comienzo real.',
        content: lesson10Content,
        orderIndex: 10,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
    ];

    for (const lesson of lessons) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created', lessons.length, 'deep lessons');

    // ======================================================================
    // QUIZ: 20 deep questions
    // ======================================================================
    const [quiz] = await db.insert(courseQuizzes).values({
      courseId: course.id,
      title: 'Evaluación: La Visión de Transformación',
      description: 'Esta evaluación no solo mide lo que aprendiste — mide lo que entendiste. Tomate tu tiempo para cada pregunta.',
      passingScore: 70,
      allowRetakes: true,
    }).returning();

    const questions = [
      {
        quizId: quiz.id,
        question: '¿Cuál es la diferencia fundamental entre un sueño y una visión?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'El sueño es nocturno y la visión es diurna',
          'La visión combina deseo, dirección y compromiso; el sueño tiene deseo pero le falta estructura',
          'No hay diferencia real, son sinónimos',
          'La visión es para empresas y el sueño es personal'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Un sueño tiene combustible emocional pero sin motor. Una visión combina deseo con dirección clara y compromiso de acción. Es un sueño que se hizo honesto consigo mismo.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz.id,
        question: 'Según Viktor Frankl, lo que determinaba la supervivencia en los campos de concentración era principalmente la fortaleza física.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Frankl observó que los que sobrevivían no eran los más fuertes físicamente, sino los que tenían un sentido, una razón, una visión de futuro. De ahí nace la logoterapia.',
        points: 2,
        orderIndex: 2,
      },
      {
        quizId: quiz.id,
        question: '¿Qué revela la "prueba del lecho de muerte" en el ejercicio de excavación de valores?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Tus miedos más superficiales',
          'Tus valores más profundos y auténticos',
          'Lo que la sociedad espera de vos',
          'Tu nivel de éxito material'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Imaginar los últimos momentos de tu vida y preguntarte qué lamentarías revela los valores que realmente importan, más allá de las máscaras sociales.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz.id,
        question: 'Los "guiones de vida" de Eric Berne se forman generalmente en la edad adulta como resultado de decisiones conscientes.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Los guiones de vida se desarrollan en la infancia, como narrativas inconscientes sobre quiénes somos y qué merecemos. Son peligrosos al diseñar una visión porque nos hacen creer que elegimos libremente cuando en realidad seguimos un guión escrito a los 7 años.',
        points: 2,
        orderIndex: 4,
      },
      {
        quizId: quiz.id,
        question: '¿Por qué una visión vaga como "quiero estar mejor" no funciona según la neurociencia?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Porque suena poco profesional',
          'Porque el cerebro necesita especificidad para activar el Sistema Reticular y la dopamina anticipatoria',
          'Porque las visiones siempre deben tener números exactos',
          'Porque otras personas no la van a entender'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El Sistema Reticular Activador filtra la información que llega a tu consciencia. Una visión específica y vívida lo programa para detectar oportunidades alineadas. Una visión vaga no activa nada.',
        points: 2,
        orderIndex: 5,
      },
      {
        quizId: quiz.id,
        question: 'Según el modelo del Ikigai adaptado, ¿qué pasa cuando tu visión incluye lo que amás y lo que el mundo necesita, pero no lo que sabés hacer?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Tenés pasión pero no efectividad',
          'Tenés dinero pero no alegría',
          'Tenés propósito pero no sostenibilidad',
          'Tenés todo lo necesario'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'Sin la dimensión de habilidades desarrolladas, tenés buenas intenciones y pasión pero careces de la capacidad de ejecutar efectivamente tu visión.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz.id,
        question: 'La técnica de los "5 Por Qué" sirve para llegar desde una meta superficial hasta el propósito profundo.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Al preguntar "¿por qué?" repetidamente, penetrás las capas superficiales (metas, deseos) hasta llegar al propósito existencial que sostiene todo. Es la diferencia entre "quiero un negocio" y "quiero vivir con dignidad".',
        points: 2,
        orderIndex: 7,
      },
      {
        quizId: quiz.id,
        question: '¿Cuál de estas es una señal de que tu propósito NO es auténticamente tuyo?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Te desafía pero también te llena de energía',
          'Lo sentís como un "debo" más que como un "necesito"',
          'Te saca de tu zona de confort pero no de tu esencia',
          'Seguirías haciéndolo incluso sin reconocimiento'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Un propósito que sentís como obligación ("debería") en vez de necesidad interna es probablemente heredado o adoptado sin procesamiento genuino.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz.id,
        question: 'Según Peter Senge, ¿cuál es la forma más profunda de relación de un grupo con su visión?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Acatamiento: seguir instrucciones',
          'Alineamiento: estar de acuerdo intelectualmente',
          'Compromiso genuino: la visión es parte de la identidad del grupo',
          'Delegación: dejar que un líder decida'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'Senge distingue entre acatamiento (obediencia), alineamiento (cooperación) y compromiso genuino (la visión como parte de la identidad). Solo el compromiso genuino genera la energía que transforma.',
        points: 2,
        orderIndex: 9,
      },
      {
        quizId: quiz.id,
        question: 'En la Narrativa Pública de Marshall Ganz, la secuencia correcta es: Historia del Nosotros, Historia del Yo, Historia del Ahora.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'La secuencia correcta es Yo → Nosotros → Ahora. Primero conectás emocionalmente con tu historia personal, luego generás identidad grupal, y finalmente llamás a la acción con urgencia.',
        points: 2,
        orderIndex: 10,
      },
      {
        quizId: quiz.id,
        question: '¿Por qué los datos solos no son suficientes para comunicar una visión transformadora?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Porque la gente no entiende estadísticas',
          'Porque los seres humanos nos movemos por historias y emociones, no por datos abstractos',
          'Porque los datos siempre son falsos',
          'Porque solo sirven para informes técnicos'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Los datos informan pero las personas conmueven. Una narrativa efectiva empieza con historia y emoción, y usa datos como soporte, no como protagonista.',
        points: 2,
        orderIndex: 11,
      },
      {
        quizId: quiz.id,
        question: '¿Qué es el "backcasting" y por qué es más útil que el forecasting para transformaciones profundas?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Es hacer predicciones basadas en datos históricos',
          'Es planificar desde el futuro deseado hacia el presente, lo que libera creatividad al no anclarte a lo conocido',
          'Es un tipo de análisis financiero',
          'Es proyectar tendencias actuales hacia adelante'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El backcasting empieza desde el futuro deseado y trabaja hacia atrás hasta el presente. A diferencia del forecasting (que proyecta desde lo conocido), el backcasting descubre caminos que desde el presente son invisibles.',
        points: 2,
        orderIndex: 12,
      },
      {
        quizId: quiz.id,
        question: 'Donella Meadows enseñó que los problemas complejos se resuelven mejor atacando los síntomas directamente.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Meadows, pionera del pensamiento sistémico, enseñó que los problemas complejos se resuelven interviniendo en los puntos de apalancamiento del sistema, no atacando síntomas aislados.',
        points: 2,
        orderIndex: 13,
      },
      {
        quizId: quiz.id,
        question: '¿Qué es el "valle de la desilusión" en la Curva J del cambio?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'El momento donde te das cuenta de que tu visión era incorrecta',
          'La fase donde las cosas se ponen difíciles y los resultados no llegan, antes de que los cambios se estabilicen',
          'El momento final de una transformación exitosa',
          'Una fase que solo afecta a personas sin preparación'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El valle de la desilusión es el punto 2 de la Curva J: la fase más difícil donde la mayoría abandona. Es el momento donde tu propósito y tu comunidad marcan la diferencia entre rendirse y seguir.',
        points: 2,
        orderIndex: 14,
      },
      {
        quizId: quiz.id,
        question: '¿Qué significa "presencing" en la Teoría U de Otto Scharmer?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Hacer una presentación pública de tu visión',
          'Soltar lo viejo y conectar con lo que quiere emerger, en el punto de mayor vulnerabilidad y potencial',
          'Estar presente físicamente en todas las reuniones del equipo',
          'Presionar al grupo para que tome decisiones rápidas'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: '"Presencing" (presencia + sentir) es el fondo de la U — el momento de soltar el control, abrirse a la vulnerabilidad y conectar con lo que genuinamente quiere emerger. De ahí surge la innovación real.',
        points: 2,
        orderIndex: 15,
      },
      {
        quizId: quiz.id,
        question: 'La resiliencia es la capacidad de aguantar el dolor sin quejarse.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'La resiliencia no es aguante pasivo. Es la capacidad de usar la adversidad como combustible de crecimiento. Tedeschi y Calhoun demostraron que la adversidad puede generar crecimiento en posibilidades, relaciones, fortaleza, espiritualidad y apreciación de la vida.',
        points: 2,
        orderIndex: 16,
      },
      {
        quizId: quiz.id,
        question: '¿Por qué la fuerza de voluntad sola no funciona para sostener el cambio?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Porque es un mito que no existe',
          'Porque es un recurso limitado y el cerebro está diseñado evolutivamente para resistir el cambio',
          'Porque solo funciona en personas excepcionales',
          'Porque requiere meditación diaria para activarse'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La fuerza de voluntad es un recurso limitado. El cerebro está diseñado para minimizar amenazas y conservar energía, por lo que resiste cualquier cambio (incluso positivo). La solución está en cambios incrementales, diseño de ambiente, aliados y celebración.',
        points: 2,
        orderIndex: 17,
      },
      {
        quizId: quiz.id,
        question: '¿Cuántos componentes tiene el Mapa de Transformación Personal?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          '3: visión, metas y plan',
          '5: propósito, visión, valores, estrategia y revisión',
          '7: propósito, visión, valores operativos, enemigos identificados, narrativa, OKRs 90 días y kit de emergencia',
          '10: uno por cada lección del curso'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'El mapa tiene 7 componentes que integran todo el curso: declaración de propósito, declaración de visión, valores operativos, enemigos identificados, narrativa personal, OKRs para 90 días y kit de emergencia visionaria.',
        points: 2,
        orderIndex: 18,
      },
      {
        quizId: quiz.id,
        question: 'Los compromisos escritos y compartidos públicamente se cumplen más que los que solo se piensan.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'La investigación sobre compromisos muestra consistentemente que escribirlos, compartirlos, ponerles fecha y asociarles consecuencias aumenta dramáticamente su cumplimiento.',
        points: 1,
        orderIndex: 19,
      },
      {
        quizId: quiz.id,
        question: '¿Cuál es la lección final más importante del curso?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Que necesitás más cursos antes de actuar',
          'Que la visión se cumple un día específico cuando lográs todas tus metas',
          'Que la visión no es un destino sino una forma de caminar — se habita, se practica, se encarna cada día',
          'Que solo las personas con recursos pueden transformar su realidad'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'La visión no se "cumple" — se habita. Se practica en cada decisión, cada conversación, cada día. Las personas que transforman su mundo son las que viven orientadas por su visión, no las que esperan "cumplirla".',
        points: 3,
        orderIndex: 20,
      },
    ];

    for (const question of questions) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created', questions.length, 'quiz questions');

    console.log('\n🎉 Deep content seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${lessons.length} lessons`);
    console.log(`   - ${questions.length} quiz questions`);
    console.log(`   - Course duration: 480 minutes (8 hours)`);
    console.log(`   - Level: intermediate`);

  } catch (error) {
    console.error('❌ Error seeding deep content:', error);
    throw error;
  }

  process.exit(0);
}

main();
