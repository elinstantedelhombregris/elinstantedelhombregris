import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse20(authorId: number) {
  console.log('--- Course 20: Caja de Herramientas Ciudadanas ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'caja-herramientas-ciudadanas')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Caja de Herramientas Ciudadanas',
      slug: 'caja-herramientas-ciudadanas',
      description: 'Las habilidades prácticas que todo ciudadano activo necesita. Gestión de proyectos, reuniones productivas, alfabetismo de datos, herramientas digitales, oratoria básica y redacción de propuestas.',
      excerpt: 'Las herramientas prácticas esenciales para pasar de la idea a la acción ciudadana.',
      category: 'action',
      level: 'beginner',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      orderIndex: 20,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 20:', course[0].title);
  } else {
    console.log('Found existing course 20:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'De la Indignación a la Acción: Tu Primera Herramienta Sos Vos',
      description: 'Pasar de quejarse a actuar requiere herramientas concretas, no solo voluntad.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Vivís en un país donde cada crisis te enseñó a sobrevivir pero nadie te enseñó a incidir. Sabés pagar impuestos, hacer colas interminables y esquivar baches, pero nunca te explicaron cómo escribir una nota al municipio que realmente alguien lea, ni cómo pararte frente a un concejal y hablar sin que te tiemble la voz. Esta lección existe porque la democracia te prometió participación pero nunca te dio las herramientas para ejercerla. Hoy eso cambia: cada herramienta que aprendas acá es un pedazo de poder que recuperás.</p>
        </div>
        <h2>El Abismo Entre Querer y Hacer</h2>
        <p>Todos conocemos a alguien que dice "este país no tiene arreglo" y no hace nada. Pero también conocemos a alguien que dice "hay que hacer algo" y tampoco hace nada. La diferencia entre la indignación estéril y la acción transformadora no es la voluntad — son las <strong>herramientas</strong>.</p>
        <p>Este curso te da las herramientas prácticas que la escuela nunca te enseñó: cómo organizar una reunión productiva, cómo escribir una propuesta, cómo hablar en público, cómo leer datos, cómo usar la tecnología para multiplicar tu impacto.</p>
        <h3>El Ciudadano Equipado vs. El Ciudadano Desarmado</h3>
        <ul>
          <li><strong>Sin herramientas:</strong> Ves un bache en tu calle → te quejás en Twitter → nada pasa → te frustrás → dejás de intentar.</li>
          <li><strong>Con herramientas:</strong> Ves un bache → sabés a qué oficina reclamar → escribís una nota formal → juntás firmas del barrio → hacés seguimiento → el bache se arregla (o al menos dejás registro de la negligencia).</li>
        </ul>
        <h3>Las 6 Herramientas del Ciudadano Activo</h3>
        <ol>
          <li><strong>Comunicación:</strong> Saber hablar, escribir y escuchar con efectividad.</li>
          <li><strong>Organización:</strong> Saber planificar proyectos, coordinar personas y gestionar tiempo.</li>
          <li><strong>Datos:</strong> Saber leer, interpretar y usar información para argumentar.</li>
          <li><strong>Tecnología:</strong> Saber usar herramientas digitales para multiplicar tu alcance.</li>
          <li><strong>Negociación:</strong> Saber dialogar con autoridades, vecinos y actores diversos.</li>
          <li><strong>Documentación:</strong> Saber registrar, sistematizar y compartir lo aprendido.</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Elegí UN problema concreto de tu cuadra o barrio que te moleste cada vez que lo ves. Escribilo en una hoja: qué es, desde cuándo existe, a quién afecta.</li>
            <li><strong>Hoy:</strong> Buscá en Google el nombre de tu municipio + "mesa de atención vecinal" o "defensoría del pueblo". Guardá el teléfono y la dirección.</li>
            <li><strong>Hoy:</strong> Mandá un mensaje a un vecino o amigo que sepas que comparte tu bronca y decile: "Estoy haciendo un curso de herramientas ciudadanas. ¿Querés que hagamos algo juntos con [el problema]?"</li>
          </ol>
        </div>
        <blockquote>"La ciudadanía activa no es un talento natural — es un oficio que se aprende. Y como todo oficio, requiere herramientas. Este curso es tu caja de herramientas."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Reuniones que Funcionan: El Arte de No Perder el Tiempo',
      description: 'Cómo organizar y facilitar reuniones productivas en contextos comunitarios.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Pensá en la última reunión vecinal a la que fuiste. Probablemente alguien habló 40 minutos sin dejar hablar a nadie, se discutió de todo menos lo importante, y al final cada uno se fue a su casa sin saber qué se decidió ni quién iba a hacer qué. Al otro día, todo seguía igual. Esa frustración no es casualidad: en Argentina nadie nos enseñó a reunirnos de forma productiva. Pero cuando aprendés a facilitar una reunión corta y enfocada, se convierte en la herramienta más poderosa que tiene un grupo de vecinos para pasar de la queja al cambio real.</p>
        </div>
        <h2>La Reunión: Donde Mueren las Buenas Ideas</h2>
        <p>Las reuniones son la herramienta más usada y más odiada de la participación ciudadana. ¿Cuántas veces fuiste a una reunión vecinal que duró 3 horas, todos hablaron, nadie escuchó, y al final no se decidió nada? El problema no son las reuniones — es que nadie nos enseñó a hacerlas bien.</p>
        <h3>Antes de la Reunión: Preparación</h3>
        <ul>
          <li><strong>¿Es necesaria?</strong> No toda comunicación requiere reunión. Si es informativo, mandá un mensaje. Si es una decisión simple, usá una encuesta. Reuní solo cuando necesitás deliberación real.</li>
          <li><strong>Agenda clara:</strong> Escribí los temas a tratar, el tiempo para cada uno, y el resultado esperado. Compartila antes. Sin agenda = sin reunión.</li>
          <li><strong>Invitá solo a quien necesitás:</strong> Cada persona adicional multiplica la complejidad. 5-7 personas es ideal para decidir. Más de 12 es una asamblea, no una reunión.</li>
          <li><strong>Logística:</strong> Lugar accesible, hora conveniente, duración definida (máximo 90 minutos). Si es virtual: link enviado con anticipación.</li>
        </ul>
        <h3>Durante la Reunión: Facilitación</h3>
        <ol>
          <li><strong>Abrir con claridad (5 min):</strong> "Estamos acá para decidir X. Tenemos 90 minutos. La agenda es esta."</li>
          <li><strong>Un tema a la vez:</strong> No saltar entre temas. Terminá uno antes de empezar otro.</li>
          <li><strong>Equilibrar voces:</strong> El facilitador debe asegurar que todos hablen, no solo los más ruidosos. "María, ¿vos qué pensás?" vale oro.</li>
          <li><strong>Parking lot:</strong> Los temas que surgen pero no están en la agenda van a una lista aparte ("estacionamiento"). Se tratan al final o en otra reunión.</li>
          <li><strong>Cerrar con acciones (10 min):</strong> Cada reunión termina con: ¿Quién hace qué? ¿Para cuándo? Si no hay acciones claras, la reunión fue un café social.</li>
        </ol>
        <h3>Después de la Reunión: Seguimiento</h3>
        <ul>
          <li><strong>Minuta en 24 horas:</strong> Resumen breve: qué se decidió, quién hace qué, próxima reunión. Compartir por WhatsApp o mail.</li>
          <li><strong>Seguimiento de compromisos:</strong> Antes de la próxima reunión, verificar: ¿se cumplió lo acordado? Sin seguimiento, las reuniones son ficción.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Pensá en la próxima reunión que tengas (del trabajo, del consorcio, de la escuela de tus hijos). Escribí una agenda de 3 puntos con tiempo asignado a cada uno y mandala por WhatsApp al grupo antes de la reunión.</li>
            <li><strong>Hoy:</strong> Descargá una plantilla de minuta de reunión (buscá "plantilla minuta reunión" en Google Docs) y tenela lista en tu celular para la próxima vez.</li>
            <li><strong>Hoy:</strong> Elegí una persona en tu grupo o entorno que hable poco en las reuniones. En la próxima reunión, hacele una pregunta directa: "¿Vos qué opinás de esto?" Practicá ser facilitador antes de necesitarlo.</li>
          </ol>
        </div>
        <blockquote>"Una reunión bien facilitada de 45 minutos logra más que 5 reuniones caóticas de 3 horas. El secreto no es reunirse más — es reunirse mejor."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Oratoria Ciudadana: Hablar para que Te Escuchen',
      description: 'Técnicas básicas de comunicación oral para asambleas, audiencias públicas y medios.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Te pasó mil veces: sabías exactamente qué decir, pero cuando te dieron el micrófono se te cerró la garganta. O peor: hablaste 10 minutos y después te diste cuenta de que nadie entendió tu punto. En un país donde los políticos monopolizan la palabra y los medios editan todo, tu capacidad de hablar con claridad en 3 minutos es un acto de resistencia democrática. No se trata de ser elocuente — se trata de que tu verdad llegue a donde tiene que llegar.</p>
        </div>
        <h2>Tu Voz Es Tu Herramienta Más Poderosa</h2>
        <p>No necesitás ser Perón para hablar en público. No necesitás carisma sobrenatural ni voz de locutor. Lo que necesitás es <strong>estructura, práctica y autenticidad</strong>. Un vecino que habla 3 minutos con claridad en una audiencia pública tiene más impacto que un político que habla 30 minutos con vaguedades.</p>
        <h3>La Estructura de 3 Partes</h3>
        <p>Todo discurso ciudadano efectivo tiene 3 partes:</p>
        <ol>
          <li><strong>Gancho (30 seg):</strong> Arrancá con algo que capture la atención. Un dato impactante, una pregunta, una historia personal breve. "¿Sabían que en este barrio hay 200 chicos sin vacante escolar?"</li>
          <li><strong>Cuerpo (2-4 min):</strong> Tu argumento. Máximo 3 puntos. No intentes decir todo — decí lo esencial. Usá ejemplos concretos, datos verificables, historias reales.</li>
          <li><strong>Cierre (30 seg):</strong> ¿Qué querés que hagan después de escucharte? Pedí algo concreto: "Necesitamos que el Concejo vote este proyecto antes del 30 de junio."</li>
        </ol>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">Graciela Mendoza tiene 58 años y es portera de una escuela en Moreno, provincia de Buenos Aires. En 2023, cuando el municipio anuncia que va a cerrar el comedor escolar de su escuela, Graciela decide hablar en la audiencia pública del Concejo Deliberante. Nunca habló en público en su vida. Se prepara durante una semana: escribe tres puntos en una tarjeta, practica frente al espejo del baño, y le pide a su hija que la cronometre. El día de la audiencia, le tiemblan las manos. Pero arranca con un dato: "Yo sirvo 340 platos de comida por día. Para 86 de esos chicos, es la única comida caliente del día. Los conozco por nombre." Habla 2 minutos y 40 segundos. Tres concejales lloran. El cierre del comedor se frena. Un periodista local filma su discurso y se viraliza. Graciela no es oradora — es auténtica. Y eso es más poderoso que cualquier técnica retórica.</p>
        </div>
        <h3>Los 5 Errores Más Comunes</h3>
        <ul>
          <li><strong>Hablar demasiado:</strong> Menos es más. 3 minutos claros > 15 minutos confusos.</li>
          <li><strong>Leer un texto:</strong> Usá notas de referencia, no un texto completo. La lectura mata la conexión.</li>
          <li><strong>Empezar pidiendo disculpas:</strong> "Perdón, no sé hablar bien" te resta credibilidad. Arrancá directo.</li>
          <li><strong>Atacar personas:</strong> Criticá ideas y decisiones, no personas. "Esta política es ineficiente" en vez de "el intendente es un inútil".</li>
          <li><strong>No practicar:</strong> Ensayá en voz alta, cronometrate. Grabate con el celular y mirá la grabación.</li>
        </ul>
        <h3>Hablar en Contextos Específicos</h3>
        <ul>
          <li><strong>Audiencia pública:</strong> Tenés 3-5 minutos. Sé preciso, citá datos, dejá tu presentación por escrito.</li>
          <li><strong>Asamblea vecinal:</strong> Sé propositivo. No solo señales el problema — traé una propuesta de solución.</li>
          <li><strong>Medios de comunicación:</strong> Preparate 2-3 frases clave (sound bites). Los medios te van a editar — asegurate de que lo que quede sea lo esencial.</li>
          <li><strong>Redes sociales:</strong> Video corto (60 seg), mirando a cámara, bien iluminado. Hablá como le hablarías a un amigo.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Elegí un tema que te importe (un problema del barrio, algo del trabajo, una causa). Escribí 3 puntos clave en una tarjeta y ensayá decirlos en voz alta en menos de 3 minutos. Cronometrate con el celular.</li>
            <li><strong>Hoy:</strong> Grabate un video de 60 segundos hablando sobre ese tema, mirando a cámara. Mirá la grabación y anotá qué mejorarías. No lo publiques — es solo para vos.</li>
            <li><strong>Hoy:</strong> Buscá en YouTube "audiencia pública argentina" y mirá al menos un video de un vecino hablando. Observá qué funciona y qué no. Aprendé de los demás.</li>
          </ol>
        </div>
        <blockquote>"No necesitás ser orador profesional. Necesitás ser GENUINO. La gente reconoce la autenticidad a kilómetros de distancia. Hablá desde lo que sabés, lo que vivís, lo que te importa. Eso es más poderoso que cualquier técnica retórica."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Redacción de Propuestas y Notas Formales',
      description: 'Cómo escribir documentos que abran puertas en vez de cerrarlas.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">En Argentina, el Estado funciona por escrito. Un reclamo verbal en una ventanilla se pierde en el aire. Pero una nota con número de expediente, firmada y sellada, genera una obligación legal de responder. Durante décadas, la escritura formal fue un privilegio de abogados y burócratas — un código secreto que separaba a los que pueden reclamar de los que solo pueden quejarse. Aprender a redactar una nota formal no es un ejercicio escolar: es recuperar una herramienta de poder que siempre te perteneció.</p>
        </div>
        <h2>Escribir Es Actuar</h2>
        <p>Una nota bien escrita al municipio tiene más poder que 100 quejas verbales. Un proyecto bien redactado accede a financiamiento que uno mal escrito nunca verá. La escritura formal es una <strong>herramienta de poder</strong> que históricamente estuvo reservada a abogados, burócratas y profesionales. Este capítulo te la democratiza.</p>
        <h3>La Nota al Funcionario</h3>
        <p>Modelo básico para dirigirte a cualquier autoridad:</p>
        <pre style="background:#f5f5f5; padding:15px; border-radius:5px; font-size:13px;">
[Lugar], [Fecha]

Al Sr./Sra. [Cargo]
[Nombre del organismo]
S/D

De mi mayor consideración:

[Primer párrafo: quién sos y por qué escribís]
Me dirijo a Ud. en mi carácter de [vecino/a del barrio X /
representante de la organización Y] para [solicitar/informar/
proponer]...

[Segundo párrafo: el problema o situación]
Desde hace [tiempo], [descripción concreta del problema con
datos específicos]...

[Tercer párrafo: lo que pedís]
Por lo expuesto, solicito que [acción concreta y medible]...

Sin otro particular, saludo a Ud. atentamente.

[Firma]
[Nombre completo]
[DNI]
[Contacto]
        </pre>
        <h3>El Proyecto Comunitario</h3>
        <p>Si querés presentar un proyecto para financiamiento o apoyo, necesita estos componentes:</p>
        <ol>
          <li><strong>Título:</strong> Claro y descriptivo. "Huertas Escolares Villa Lugano" — no "Proyecto de Seguridad Alimentaria Integral para la Zona Sur."</li>
          <li><strong>Problema:</strong> ¿Qué problema resolvés? Con datos. "El 40% de los chicos del barrio no accede a verduras frescas."</li>
          <li><strong>Solución:</strong> ¿Qué proponés hacer? Concreto y alcanzable.</li>
          <li><strong>Beneficiarios:</strong> ¿A quiénes ayuda? ¿Cuántos?</li>
          <li><strong>Actividades:</strong> ¿Qué vas a hacer, paso a paso?</li>
          <li><strong>Cronograma:</strong> ¿Cuánto dura? ¿Qué pasa cada mes?</li>
          <li><strong>Presupuesto:</strong> ¿Cuánto cuesta? Desglosado.</li>
          <li><strong>Quiénes somos:</strong> ¿Quién lleva adelante esto? ¿Qué experiencia tienen?</li>
        </ol>
        <h3>Errores Que Matan Propuestas</h3>
        <ul>
          <li><strong>Lenguaje inflado:</strong> "Paradigma sinérgico de empoderamiento holístico." Escribí claro o no te van a leer.</li>
          <li><strong>Sin datos:</strong> "Hay mucha pobreza" no es un argumento. "El 35% de los hogares del barrio está bajo la línea de pobreza según el censo" sí lo es.</li>
          <li><strong>Pedir sin ofrecer:</strong> No solo pidas plata — mostrá qué ponés vos: tiempo, voluntarios, espacio, conocimiento.</li>
          <li><strong>Mala ortografía/formato:</strong> Parece injusto, pero una nota con errores pierde credibilidad. Pedile a alguien que revise antes de enviar.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Copiá el modelo de nota formal de esta lección y guardalo como plantilla en tu celular (en Notas o Google Docs). La próxima vez que necesites reclamar algo, ya tenés el formato listo.</li>
            <li><strong>Hoy:</strong> Pensá en un reclamo pendiente que tengas (una vereda rota, una luminaria quemada, un servicio que no funciona). Escribí el primer borrador de la nota usando el modelo. No hace falta que la mandes hoy — el ejercicio es practicar la escritura.</li>
            <li><strong>Hoy:</strong> Pedile a alguien de confianza que lea tu borrador y te diga si se entiende. La mejor revisión es la de otro par de ojos.</li>
          </ol>
        </div>
        <blockquote>"El poder historicamente se concentró en los que sabían escribir las reglas. Cuando vos aprendés a escribir una nota formal, una propuesta, un reclamo con número de expediente, estás rompiendo un monopolio que te excluía. No subestimes lo que una hoja bien redactada puede lograr: derribó muros que los gritos nunca movieron."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Alfabetismo de Datos: Leer los Números que Gobiernan Tu Vida',
      description: 'Entender estadísticas, gráficos y datos públicos para argumentar con evidencia.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Cada vez que un funcionario te dice "estamos invirtiendo más que nunca en tu barrio" y vos no sabés cómo verificarlo, estás perdiendo una batalla silenciosa. En Argentina, los datos son el idioma del poder: los presupuestos se escriben en números, las decisiones se justifican con estadísticas, y los que no saben leer esos números quedan afuera de la conversación. Aprender a leer datos no es volverse contador — es recuperar el derecho a preguntar con fundamento y a que no te mientan en la cara.</p>
        </div>
        <h2>Los Números No Mienten (Pero los Que los Presentan a Veces Sí)</h2>
        <p>Vivimos bombardeados por datos: la inflación fue del X%, el desempleo del Y%, la pobreza del Z%. Pero <strong>¿sabés leer esos datos?</strong> ¿Sabés cuándo un gráfico te está engañando? ¿Sabés dónde encontrar datos públicos para respaldar tu argumento?</p>
        <h3>Las 4 Trampas Estadísticas Más Comunes</h3>
        <ol>
          <li><strong>Eje manipulado:</strong> Un gráfico que empieza en 95% en vez de 0% hace que una variación del 2% parezca enorme. Siempre mirá la escala.</li>
          <li><strong>Correlación ≠ Causa:</strong> "Los países con más heladerías tienen más ahogados." ¿Las heladerías causan ahogamientos? No: ambos se correlacionan con el calor. Que dos cosas se muevan juntas no significa que una cause la otra.</li>
          <li><strong>Promedio engañoso:</strong> Si Bill Gates entra a un bar con 9 desempleados, el "ingreso promedio" del bar es de millones. El promedio esconde la distribución. Siempre preguntá por la mediana.</li>
          <li><strong>Muestra sesgada:</strong> "El 80% está de acuerdo" — ¿el 80% de quién? ¿De 10 personas que el periodista eligió? ¿O de 1.500 seleccionadas aleatoriamente?</li>
        </ol>
        <h3>Fuentes de Datos Públicos en Argentina</h3>
        <ul>
          <li><strong>INDEC (indec.gob.ar):</strong> Instituto Nacional de Estadística. Censo, pobreza, empleo, comercio exterior, precios. Es LA fuente oficial.</li>
          <li><strong>datos.gob.ar:</strong> Portal de datos abiertos del gobierno nacional. Miles de datasets descargables sobre transporte, salud, educación, presupuesto.</li>
          <li><strong>Presupuesto abierto:</strong> presupuestoabierto.gob.ar muestra en qué gasta el Estado cada peso.</li>
          <li><strong>Datos municipales:</strong> Muchos municipios tienen sus propios portales. CABA: data.buenosaires.gob.ar.</li>
          <li><strong>Universidades y centros de investigación:</strong> CONICET, CIFRA (CTA), IDAES (UNSAM) producen datos alternativos valiosos.</li>
        </ul>
        <h3>Cómo Usar Datos en Tu Argumento</h3>
        <ol>
          <li><strong>Contextualizá:</strong> "La pobreza es del 40%" es un dato. "La pobreza subió del 30% al 40% en un año" es un argumento.</li>
          <li><strong>Compará:</strong> "Gastamos $X en publicidad oficial" no dice nada. "Gastamos $X en publicidad y $X/10 en escuelas" dice todo.</li>
          <li><strong>Humanizá:</strong> "45% de pobreza infantil" son estadísticas. "En esta cuadra, de cada 10 chicos, 4 no comen bien" es una historia.</li>
          <li><strong>Citá la fuente:</strong> "Según el INDEC, censo 2022..." te da credibilidad. "Dicen que..." te la quita.</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Entrá a presupuestoabierto.gob.ar y buscá cuánto se asigna a tu provincia o municipio en el rubro que más te importe (educación, salud, seguridad). Anotá el número y comparalo con el año anterior.</li>
            <li><strong>Hoy:</strong> La próxima vez que veas un gráfico en un noticiero o en redes sociales, antes de creerlo hacete estas 3 preguntas: ¿De dónde vienen los datos? ¿El eje empieza en cero? ¿Cuál es el tamaño de la muestra?</li>
            <li><strong>Hoy:</strong> Entrá a datos.gob.ar y buscá un dataset sobre un tema que te interese. Descargalo en Excel o CSV. No necesitás analizarlo ahora — el primer paso es saber que existe y que es tuyo por derecho.</li>
          </ol>
        </div>
        <blockquote>"Te acostumbraron a que los números son cosa de expertos, de economistas en la tele, de contadores con calculadora. Mentira. Los números de tu barrio, de tu escuela, de tu hospital, son TUS números. Cada dato público que aprendés a leer es un fósforo que encendés en la oscuridad que el poder necesita para operar sin rendirte cuentas. Aprendé a leer los números — porque los que gobiernan ya saben escribirlos a su favor."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Herramientas Digitales para la Acción Ciudadana',
      description: 'Tecnología gratuita para organizar, comunicar y amplificar tu impacto.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Tenés en tu bolsillo algo que hace 20 años no existía: la capacidad de llegar a miles de personas, documentar evidencia con geolocalización, coordinar 50 voluntarios en tiempo real y presionar al poder con un video de 60 segundos. Pero si usás tu celular solo para scrollear redes y mandar memes, es como tener un martillo y usarlo de pisapapeles. En un país donde los medios tradicionales tienen dueño y las oficinas públicas te hacen esperar meses, tu celular bien usado es la herramienta de democracia directa más potente que existe.</p>
        </div>
        <h2>Tu Celular Es una Herramienta de Cambio Social</h2>
        <p>Hace 30 años, organizar una campaña ciudadana requería meses, dinero y contactos. Hoy, con un celular y WiFi, podés alcanzar a miles de personas, coordinar acciones, documentar problemas y presionar autoridades. La tecnología democratizó la acción — pero solo si sabés usarla.</p>
        <h3>Para Organizar</h3>
        <ul>
          <li><strong>Google Forms (gratis):</strong> Hacé encuestas vecinales, recolectá firmas digitales, inscribí voluntarios. Resultados automáticos en planilla.</li>
          <li><strong>Google Calendar compartido:</strong> Coordiná actividades del grupo sin perder fechas.</li>
          <li><strong>Trello / Notion (gratis):</strong> Organizá tareas del proyecto. Quién hace qué, para cuándo, en qué estado.</li>
          <li><strong>WhatsApp Grupos:</strong> El canal por excelencia en Argentina. Pero con reglas: sin spam, sin cadenas, sin audio de 5 minutos.</li>
        </ul>
        <h3>Para Comunicar</h3>
        <ul>
          <li><strong>Canva (gratis):</strong> Diseñá flyers, infografías, posteos para redes. Plantillas profesionales sin saber diseño.</li>
          <li><strong>CapCut (gratis):</strong> Editá videos desde el celular. Un video de 60 segundos bien editado tiene más alcance que 10 posteos de texto.</li>
          <li><strong>Change.org:</strong> Plataforma de peticiones online. Si tu causa junta firmas suficientes, los medios le prestan atención.</li>
          <li><strong>Instagram / TikTok:</strong> Para llegar a jóvenes. Contenido corto, visual, con gancho emocional.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">Ramiro Gutiérrez es profesor de educación física en Resistencia, Chaco. En 2024, el terreno baldío frente a su escuela se convierte en un basural clandestino. Ramiro saca fotos con su celular todos los días durante un mes — cada foto queda con fecha y GPS automáticos. Las sube a un Google My Maps compartido y le pone un título simple: "Basural ilegal frente a Escuela N.° 412". Hace un video de 45 segundos mostrando a los chicos caminando al lado de la basura para entrar a la escuela. Lo publica en Instagram y lo comparte en tres grupos de WhatsApp del barrio. En 48 horas tiene 12.000 vistas. Un concejal lo contacta. En una semana, el municipio manda un camión. Ramiro no tenía experiencia en redes, no tenía seguidores, no tenía contactos políticos. Tenía un celular, una causa justa y las herramientas correctas.</p>
        </div>
        <h3>Para Documentar</h3>
        <ul>
          <li><strong>Google Maps / My Maps:</strong> Mapeá problemas del barrio: baches, basurales, inundaciones. Un mapa visual impacta más que una lista.</li>
          <li><strong>Google Drive:</strong> Almacená documentos, fotos, actas. Compartí con el grupo. Todo en un solo lugar.</li>
          <li><strong>Grabadora del celular:</strong> Grabá audiencias públicas, sesiones del concejo, reuniones con funcionarios (verificá la legalidad en tu jurisdicción).</li>
        </ul>
        <h3>Seguridad Digital Básica</h3>
        <ul>
          <li><strong>Contraseñas fuertes:</strong> Usá un gestor de contraseñas (Bitwarden es gratis).</li>
          <li><strong>Verificación en dos pasos:</strong> Activala en WhatsApp, Gmail, redes. Te protege de hackeos.</li>
          <li><strong>Cuidá tu información:</strong> No publiques datos personales sensibles en redes abiertas.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Activá la verificación en dos pasos en WhatsApp (Ajustes → Cuenta → Verificación en dos pasos). Tardás 2 minutos y te protege de que alguien robe tu cuenta.</li>
            <li><strong>Hoy:</strong> Creá un Google My Maps nuevo (mymaps.google.com), ponele el nombre de tu barrio, y marcá al menos 3 puntos: un problema que te moleste, un recurso que nadie aprovecha, y un lugar de encuentro comunitario.</li>
            <li><strong>Hoy:</strong> Abrí Canva (canva.com) desde tu celular, buscá "volante comunitario" en las plantillas, y diseñá uno de prueba para una causa que te importe. No necesitás publicarlo — el ejercicio es descubrir lo fácil que es.</li>
          </ol>
        </div>
        <blockquote>"La tecnología no reemplaza la acción ciudadana — la multiplica. Un vecino con un celular y las herramientas correctas tiene más poder de comunicación que un medio de comunicación hace 20 años."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Negociación Ciudadana: Conseguir Sin Pelear',
      description: 'Técnicas de negociación para tratar con funcionarios, vecinos y actores diversos.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">En Argentina crecimos con la idea de que negociar es transar, que pedir una reunión con un funcionario es arrodillarse, y que la única forma de conseguir algo es a los gritos o con un piquete. Pero mirá lo que pasa: los que gritan se cansan, los que hacen piquete son ignorados al mes siguiente, y todo vuelve a como estaba. La negociación no es sumisión — es la herramienta que te permite sentarte frente al poder con datos, propuestas y alternativas, y salir con compromisos por escrito que podés hacer cumplir. Es la diferencia entre un reclamo que se olvida y un acuerdo que deja registro.</p>
        </div>
        <h2>Negociar No Es Pelear</h2>
        <p>La política argentina nos acostumbró al modelo confrontativo: grito, piquete, amenaza. Y a veces funciona — pero también genera desgaste, enemigos y resultados frágiles. La negociación es una alternativa: conseguir lo que necesitás <strong>sin destruir la relación</strong>.</p>
        <h3>Los 4 Principios de Harvard</h3>
        <p>La Escuela de Negociación de Harvard propone un modelo que funciona tanto entre países como entre vecinos:</p>
        <ol>
          <li><strong>Separar las personas del problema:</strong> "El intendente no contestó nuestra nota" es un problema. "El intendente es un sinvergüenza" es un ataque personal. Atacá el problema, no a la persona.</li>
          <li><strong>Enfocarse en intereses, no en posiciones:</strong> La posición es "queremos que saquen la fábrica del barrio." El interés es "queremos que nuestros hijos no se enfermen." Si entendés el interés, podés encontrar soluciones creativas (filtros, horarios de operación, monitoreo ambiental).</li>
          <li><strong>Generar opciones de beneficio mutuo:</strong> No es todo o nada. ¿Qué puede ganar cada parte? El funcionario quiere resolver sin escándalo. Vos querés una solución real. ¿Hay un camino donde ambos ganen?</li>
          <li><strong>Usar criterios objetivos:</strong> En vez de "esto es injusto" (opinión), usá "la OMS recomienda un máximo de X partículas por metro cúbico, y acá hay 3X" (dato). Los datos son más difíciles de refutar que las emociones.</li>
        </ol>
        <h3>Tu MAAN: Tu Poder Real</h3>
        <p><strong>MAAN = Mejor Alternativa A un Acuerdo Negociado.</strong> Es lo que hacés si la negociación fracasa. Si tu MAAN es fuerte (podés ir a la justicia, a los medios, organizar una protesta), negociás desde una posición de fuerza. Si tu MAAN es débil (no tenés alternativa), negociás desde la debilidad.</p>
        <p>Antes de negociar, siempre preguntate: si no llego a un acuerdo, ¿qué hago? Fortalecé tu MAAN antes de sentarte a la mesa.</p>
        <h3>Negociar con Funcionarios: Tips Prácticos</h3>
        <ul>
          <li><strong>Andá preparado:</strong> Datos, fotos, documentos, testigos. La improvisación te debilita.</li>
          <li><strong>Pedí una reunión formal:</strong> Por escrito, con fecha y hora. Dejá registro.</li>
          <li><strong>Llevá un testigo:</strong> Nunca vayas solo a una reunión con un funcionario. Un testigo protege a ambas partes.</li>
          <li><strong>Pedí compromisos por escrito:</strong> "¿Nos puede enviar un mail confirmando lo acordado?" Si no quieren escribirlo, probablemente no piensen cumplirlo.</li>
          <li><strong>Agradecé y hacé seguimiento:</strong> Un mail de agradecimiento después de la reunión, resumiendo lo acordado, funciona como acta informal.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Pensá en una situación pendiente donde necesitás conseguir algo de alguien (un funcionario, un vecino, un jefe). Escribí: ¿Qué quiero? ¿Qué quiere la otra parte? ¿Hay alguna solución donde ambos ganemos?</li>
            <li><strong>Hoy:</strong> Definí tu MAAN para esa situación: si la negociación no funciona, ¿qué hacés? ¿Podés ir a la justicia, a los medios, a otra instancia? Cuanto más claro tengas tu Plan B, más fuerte negociás.</li>
            <li><strong>Hoy:</strong> Practicá la frase "¿Me podés enviar eso por escrito?" Decila en voz alta cinco veces. Esa frase es tu escudo: lo que un funcionario no quiere escribir, probablemente no piense cumplir.</li>
          </ol>
        </div>
        <blockquote>"El ciudadano que negocia bien es más peligroso para el mal funcionario que el que grita en la calle. Porque el que grita se cansa. El que negocia, documenta y persiste... no se va nunca."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Mapeo Comunitario: Conocer Tu Territorio',
      description: 'Técnicas para diagnosticar tu barrio y detectar recursos, problemas y oportunidades.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Caminás por tu barrio todos los días, pero hay una diferencia enorme entre pasar y observar. Cuando un funcionario te dice "no sabíamos que había un problema ahí", está contando con que nadie tiene un registro ordenado de la realidad del territorio. El mapeo comunitario es la herramienta que transforma tu conocimiento cotidiano — los baches que esquivás, las esquinas oscuras, el terreno abandonado que podría ser plaza — en evidencia organizada que ningún funcionario puede negar. Un barrio que se mapea a sí mismo deja de ser invisible.</p>
        </div>
        <h2>Antes de Actuar, Conocé Tu Territorio</h2>
        <p>No podés transformar lo que no conocés. El mapeo comunitario es una herramienta para <strong>ver tu barrio con ojos nuevos</strong>: identificar problemas que nadie registra, descubrir recursos que nadie aprovecha, y entender las relaciones de poder que determinan qué pasa y qué no pasa.</p>
        <h3>El Paseo Diagnóstico</h3>
        <p>Caminá tu barrio con una libreta (o el celular) y registrá:</p>
        <ul>
          <li><strong>Infraestructura:</strong> Estado de las calles, veredas, iluminación, plazas, espacios públicos. ¿Qué funciona? ¿Qué está roto?</li>
          <li><strong>Servicios:</strong> ¿Hay escuelas? ¿Centros de salud? ¿Transporte? ¿Conectividad? ¿Qué falta?</li>
          <li><strong>Comercio:</strong> ¿Qué se vende? ¿Qué no se consigue? ¿Dónde va la gente a comprar?</li>
          <li><strong>Espacios de encuentro:</strong> ¿Dónde se junta la gente? Plazas, clubes, parroquias, esquinas.</li>
          <li><strong>Problemas visibles:</strong> Basurales, terrenos abandonados, contaminación, inseguridad.</li>
          <li><strong>Recursos ocultos:</strong> Gente con habilidades, espacios sin usar, organizaciones activas.</li>
        </ul>
        <h3>Mapa de Actores</h3>
        <p>¿Quién tiene poder en tu barrio? No solo el poder formal (delegado, concejal) sino el real:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px; border:1px solid #ddd;">Actor</th><th style="padding:8px; border:1px solid #ddd;">Poder</th><th style="padding:8px; border:1px solid #ddd;">Actitud</th></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Junta vecinal</td><td style="padding:8px; border:1px solid #ddd;">Convocatoria, legitimidad</td><td style="padding:8px; border:1px solid #ddd;">¿A favor? ¿En contra?</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Club del barrio</td><td style="padding:8px; border:1px solid #ddd;">Espacio, red social</td><td style="padding:8px; border:1px solid #ddd;">¿Aliado potencial?</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Comerciantes</td><td style="padding:8px; border:1px solid #ddd;">Recursos, influencia</td><td style="padding:8px; border:1px solid #ddd;">¿Qué les interesa?</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Referente político</td><td style="padding:8px; border:1px solid #ddd;">Conexiones, recursos</td><td style="padding:8px; border:1px solid #ddd;">¿Condiciones?</td></tr>
        </table>
        <h3>Mapa Digital Colaborativo</h3>
        <p>Usá <strong>Google My Maps</strong> (gratis) para crear un mapa compartido del barrio. Cada vecino puede agregar puntos: "Bache peligroso", "Luminaria rota", "Espacio abandonado que podría ser huerta", "Vecina que da clases de apoyo." El mapa se vuelve un <strong>documento vivo</strong> que muestra la realidad que ningún funcionario puede negar.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Salí a caminar 10 cuadras de tu barrio con el celular en la mano. Sacá fotos de 5 problemas que veas (bache, luminaria rota, basura, vereda destruida, espacio abandonado). Guardalas en una carpeta llamada "Mapeo barrio".</li>
            <li><strong>Hoy:</strong> Hacé una lista de 5 personas o instituciones que tienen poder real en tu barrio (no solo el delegado: pensá en el dueño del supermercado, la directora de la escuela, el cura de la parroquia, la referente del merendero). Anotá al lado de cada uno: ¿es aliado potencial o posible obstáculo?</li>
            <li><strong>Hoy:</strong> Abrí Google My Maps y creá un mapa con las 5 fotos que sacaste. Compartilo con al menos 2 vecinos y pediles que agreguen sus propios puntos. Un mapa colaborativo se vuelve más poderoso con cada vecino que participa.</li>
          </ol>
        </div>
        <blockquote>"El poder siempre contó con la desmemoria y la desorganización del barrio para hacer lo que quiere. Un mapa comunitario rompe esa ventaja. Cuando 30 vecinos documentan 47 problemas con fotos, fechas y coordenadas GPS, el funcionario pierde la excusa del 'no sabíamos'. El territorio deja de ser su escenario y se convierte en tu evidencia. El conocimiento del territorio es poder ciudadano."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Documentar y Sistematizar: Que Nada Se Pierda',
      description: 'Cómo registrar tu experiencia para que otros puedan replicarla.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">¿Cuántas veces escuchaste "acá ya intentamos hacer eso y no funcionó", pero nadie puede explicarte qué hicieron exactamente, por qué falló, ni qué aprendieron? En Argentina se pierden miles de experiencias comunitarias valiosas cada año porque nadie las documenta. El grupo se disuelve, el líder se muda, y todo ese conocimiento acumulado se evapora como si nunca hubiera existido. Documentar no es llenar papeles por obligación — es el acto más generoso que podés hacer por el próximo grupo de vecinos que va a querer cambiar algo y va a empezar de cero porque nadie le dejó un mapa del camino.</p>
        </div>
        <h2>Si No Lo Escribís, No Pasó</h2>
        <p>Miles de experiencias comunitarias brillantes se pierden porque nadie las documentó. El grupo se disuelve, los líderes se mudan, y todo el conocimiento acumulado desaparece. Documentar no es burocracia — es <strong>cuidar el futuro</strong>.</p>
        <h3>¿Qué Documentar?</h3>
        <ul>
          <li><strong>Decisiones:</strong> Qué se decidió, por qué, quiénes participaron. Las actas de reuniones son el registro más básico y más importante.</li>
          <li><strong>Procesos:</strong> Cómo hicieron algo. Los pasos, los problemas, las soluciones. Si mañana otro grupo quiere replicar lo que hicieron, ¿podrían con lo que documentaron?</li>
          <li><strong>Resultados:</strong> Qué se logró. Fotos del antes y después. Números. Testimonios.</li>
          <li><strong>Aprendizajes:</strong> Qué funcionó, qué no, qué harían diferente. Este es el conocimiento más valioso y el menos documentado.</li>
        </ul>
        <h3>Herramientas de Documentación</h3>
        <ul>
          <li><strong>Fotos con fecha y ubicación:</strong> Tu celular georeferencia las fotos automáticamente. Una foto de un basural con fecha y GPS es evidencia.</li>
          <li><strong>Google Drive compartido:</strong> Una carpeta del proyecto donde TODO esté: actas, fotos, documentos, presupuestos. Accesible para todo el grupo.</li>
          <li><strong>Blog o página simple:</strong> Blogger, WordPress o Notion público. Publicá los avances del proyecto. Da visibilidad y transparencia.</li>
          <li><strong>Video-testimonios:</strong> 2 minutos de un vecino contando cómo el proyecto cambió su vida vale más que 20 páginas de informe.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">Marta Sánchez coordina un merendero en Florencio Varela desde 2019. Durante 3 años trabaja sin documentar nada: cocina, sirve, limpia, repite. Cuando en 2022 se presenta a una convocatoria de fondos del municipio, le piden "antecedentes del proyecto". Marta no tiene una sola foto organizada, ningún registro de cuántos chicos atendió, ni un acta de las reuniones con las otras madres. Pierde la convocatoria. Esa noche decide que nunca más le va a pasar. Con una carpeta de Google Drive, un cuaderno y el celular empieza a documentar todo: fotos diarias con fecha, planilla de asistencia en Google Sheets, acta de cada reunión en un Google Doc compartido. Cuando se presenta a la siguiente convocatoria seis meses después, lleva un informe de 3 páginas con fotos, números y testimonios. Gana el financiamiento. Hoy le enseña a otros merenderos del partido a documentar: "Si no lo escribís, para el Estado no existís", les dice.</p>
        </div>
        <h3>La Sistematización de Experiencias</h3>
        <p>Sistematizar es más que documentar: es <strong>reflexionar críticamente</strong> sobre lo vivido para extraer aprendizajes transferibles. Un esquema simple:</p>
        <ol>
          <li><strong>Punto de partida:</strong> ¿Cuál era la situación antes de intervenir?</li>
          <li><strong>Lo que hicimos:</strong> Acciones concretas, en orden cronológico.</li>
          <li><strong>Los resultados:</strong> ¿Qué cambió? ¿Cuánto? ¿Para quién?</li>
          <li><strong>Lo que aprendimos:</strong> ¿Qué funcionó? ¿Qué no? ¿Por qué?</li>
          <li><strong>Las recomendaciones:</strong> Si alguien quisiera hacer algo similar, ¿qué le dirías?</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Creá una carpeta en Google Drive llamada "[Tu proyecto o causa] - Documentación". Dentro, creá 4 subcarpetas: Actas, Fotos, Documentos, Informes. Ya tenés la estructura — ahora solo falta llenarla.</li>
            <li><strong>Hoy:</strong> Si participás de algún grupo, proyecto o reunión comunitaria, ofrecete para tomar la minuta de la próxima reunión. Usá el formato simple: Fecha, Presentes, Temas tratados, Decisiones, Responsables, Próxima reunión.</li>
            <li><strong>Hoy:</strong> Grabá un video-testimonio de 2 minutos de alguien que haya sido beneficiado por una acción comunitaria que conozcas (o contá vos tu propia experiencia). Un testimonio en video vale más que 20 páginas de informe.</li>
          </ol>
        </div>
        <blockquote>"Documentar es un acto de generosidad con el futuro. Cada experiencia que sistematizás es un regalo para el próximo grupo que quiera cambiar algo en su barrio y no sepa por dónde empezar."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan de Acción Ciudadana: De Este Curso a Tu Barrio',
      description: 'Integrar todas las herramientas en un plan concreto de acción para tu comunidad.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Llegaste hasta acá. Aprendiste a facilitar reuniones, a hablar en público, a redactar notas, a leer datos, a usar tecnología, a negociar, a mapear tu barrio y a documentar experiencias. Pero si todo esto queda en la pantalla y no baja a la calle, fue entretenimiento, no educación. Esta lección existe para que no te pase lo que le pasa al 90% de la gente que hace un curso online: terminar, sentirse inspirado 48 horas, y después volver a la vida exactamente igual. Hoy diseñás tu primer plan de acción. Hoy la teoría se convierte en tu barrio.</p>
        </div>
        <h2>Las Herramientas Sin Uso Son Chatarra</h2>
        <p>Leíste 9 lecciones. Aprendiste herramientas de reuniones, oratoria, redacción, datos, tecnología, negociación, mapeo y documentación. Pero si esto queda en la teoría, no sirvió de nada. Esta última lección te guía para crear tu <strong>Plan de Acción Ciudadana</strong>: un proyecto concreto que uses para practicar TODO lo aprendido.</p>
        <h3>Paso 1: Elegí UN Problema (15 min)</h3>
        <p>No intentes arreglar el mundo. Elegí UN problema de tu barrio que te importe personalmente. Cuanto más específico, mejor.</p>
        <ul>
          <li>Malo: "La inseguridad del barrio"</li>
          <li>Mejor: "La esquina de X y Y no tiene iluminación y hubo 3 robos este mes"</li>
          <li>Excelente: "Necesitamos que el municipio instale 2 luminarias LED en la esquina de X y Y"</li>
        </ul>
        <h3>Paso 2: Investigá (1 semana)</h3>
        <ul>
          <li>Hacé el mapeo del problema: ¿desde cuándo? ¿a quién afecta? ¿quién es responsable?</li>
          <li>Buscá datos: ¿hay registros de reclamos anteriores? ¿estadísticas relevantes?</li>
          <li>Identificá actores: ¿quién decide? ¿quién puede ayudar? ¿quién se opone?</li>
        </ul>
        <h3>Paso 3: Organizá un Grupo (1 semana)</h3>
        <ul>
          <li>Encontrá 3-5 vecinos que compartan tu preocupación.</li>
          <li>Hacé una primera reunión con agenda (Lección 2).</li>
          <li>Definí roles: quién redacta, quién habla, quién documenta.</li>
        </ul>
        <h3>Paso 4: Actuá (2 semanas)</h3>
        <ul>
          <li>Escribí la nota al funcionario (Lección 4).</li>
          <li>Pedí una reunión (Lección 7).</li>
          <li>Documentá todo (Lección 9).</li>
          <li>Si no contestan: escalá (medios, redes, Concejo Deliberante).</li>
        </ul>
        <h3>Paso 5: Evaluá y Compartí (1 semana)</h3>
        <ul>
          <li>¿Funcionó? ¿Qué aprendiste? ¿Qué harías diferente?</li>
          <li>Sistematizá la experiencia.</li>
          <li>Compartila: un posteo, una charla en el club, una nota en el grupo vecinal.</li>
        </ul>
        <h3>El Efecto Dominó</h3>
        <p>Un vecino que resuelve UN problema se convierte en referencia. Otros vecinos le piden ayuda. Se arma un grupo más grande. Abordan problemas más complejos. En 2 años, un barrio organizado puede transformar más que 10 años de promesas electorales.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin-top:20px;">
          <h4 style="color:#16a34a;margin-top:0;">Paso Siguiente Concreto</h4>
          <ol>
            <li><strong>Hoy:</strong> Completá la hoja de proyecto de esta lección. No tiene que ser perfecta — tiene que estar escrita. Abrí un Google Doc, copiá la tabla, y llená cada celda con lo que se te ocurra ahora. Podés mejorarla después.</li>
            <li><strong>Hoy:</strong> Mandá un mensaje a 3 personas contándoles tu idea de proyecto en 3 oraciones. No les pidas compromiso — solo preguntales: "¿Qué te parece? ¿Te interesaría ser parte?" La primera conversación es el primer paso real.</li>
            <li><strong>Hoy:</strong> Poné una alarma en tu celular para dentro de 7 días con el texto: "¿Hice algo con mi plan de acción ciudadana?" La alarma te va a recordar que este curso no era para consumir — era para actuar.</li>
          </ol>
        </div>
        <blockquote>"No esperes al líder perfecto, al gobierno ideal, al momento oportuno. Empezá hoy, con lo que tenés, donde estás. Un problema pequeño bien resuelto genera más cambio que mil planes grandiosos que nunca arrancan. La caja de herramientas ya es tuya. Ahora usala."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 20');

  const eq20 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq20.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq20[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz20] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Caja de Herramientas Ciudadanas', description: 'Evaluá tu dominio de las herramientas de acción ciudadana.', passingScore: 70, timeLimit: 12, allowRetakes: true, maxAttempts: 3 }).returning();
  const q20 = [
    { quizId: quiz20.id, question: '¿Cuál es el error más común en las reuniones comunitarias?', type: 'multiple_choice' as const, options: JSON.stringify(['Empezar puntual', 'No tener agenda ni definir acciones concretas al final', 'Invitar poca gente', 'Usar tecnología']), correctAnswer: JSON.stringify(1), explanation: 'Sin agenda clara y sin acciones concretas asignadas al final, las reuniones son conversaciones sin resultado.', points: 2, orderIndex: 1 },
    { quizId: quiz20.id, question: 'En oratoria ciudadana, es recomendable empezar pidiendo disculpas por no ser orador profesional.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Pedir disculpas al inicio resta credibilidad. Es mejor arrancar directo con un gancho que capture la atención.', points: 1, orderIndex: 2 },
    { quizId: quiz20.id, question: '¿Qué es el MAAN en negociación?', type: 'multiple_choice' as const, options: JSON.stringify(['Un tipo de acuerdo', 'Tu Mejor Alternativa A un Acuerdo Negociado', 'Una técnica de persuasión', 'Un documento legal']), correctAnswer: JSON.stringify(1), explanation: 'El MAAN es lo que hacés si la negociación fracasa. Cuanto más fuerte tu MAAN, más poder tenés al negociar.', points: 2, orderIndex: 3 },
    { quizId: quiz20.id, question: 'Correlación entre dos variables siempre implica que una causa la otra.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Correlación no es causalidad. Dos cosas pueden moverse juntas sin que una cause la otra.', points: 1, orderIndex: 4 },
    { quizId: quiz20.id, question: '¿Cuál es la estructura básica de un discurso ciudadano efectivo?', type: 'multiple_choice' as const, options: JSON.stringify(['Introducción larga + argumentos + resumen', 'Gancho (30 seg) + Cuerpo (2-4 min) + Cierre con pedido concreto', 'Saludo + queja + despedida', 'Datos + más datos + conclusión técnica']), correctAnswer: JSON.stringify(1), explanation: 'Un discurso efectivo tiene gancho que captura, cuerpo con máximo 3 puntos, y cierre con pedido de acción concreto.', points: 2, orderIndex: 5 },
    { quizId: quiz20.id, question: 'Google My Maps permite crear mapas colaborativos del barrio de forma gratuita.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Google My Maps es gratuito y permite que múltiples personas agreguen puntos, fotos y descripciones en un mapa compartido.', points: 1, orderIndex: 6 },
    { quizId: quiz20.id, question: '¿Qué es sistematizar una experiencia comunitaria?', type: 'multiple_choice' as const, options: JSON.stringify(['Informatizarla', 'Reflexionar críticamente sobre lo vivido para extraer aprendizajes transferibles', 'Escribir un informe largo', 'Publicarla en redes sociales']), correctAnswer: JSON.stringify(1), explanation: 'Sistematizar es más que documentar: es analizar qué funcionó, qué no y por qué, para que otros puedan aprender de tu experiencia.', points: 2, orderIndex: 7 },
    { quizId: quiz20.id, question: 'Para iniciar acción ciudadana, es mejor esperar a tener un grupo grande organizado antes de hacer cualquier cosa.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Es mejor empezar con 3-5 personas comprometidas y un problema concreto que esperar a tener una organización perfecta.', points: 1, orderIndex: 8 },
  ];
  for (const q of q20) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 20');
}

async function seedCourse21(authorId: number) {
  console.log('--- Course 21: Gestión de Proyectos Comunitarios ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'gestion-proyectos-comunitarios')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Gestión de Proyectos Comunitarios',
      slug: 'gestion-proyectos-comunitarios',
      description: 'Lleva tu proyecto comunitario del sueño a la realidad. Presupuestos, coordinación de voluntarios, medición de impacto, escritura de propuestas para fondos y estructuras legales.',
      excerpt: 'Gestiona proyectos comunitarios con profesionalismo y corazón.',
      category: 'action',
      level: 'intermediate',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      orderIndex: 21,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 21:', course[0].title);
  } else {
    console.log('Found existing course 21:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'Anatomía de un Proyecto: Del Sueño al Plan',
      description: 'Los componentes esenciales de un proyecto comunitario bien diseñado.',
      content: `
        <h2>Un Sueño Sin Plan Es Solo un Deseo</h2>
        <p>Todos los grandes proyectos comunitarios empezaron como una idea simple: "¿y si hacemos una huerta?", "¿y si armamos un apoyo escolar?", "¿y si juntamos firmas para el semáforo?" La diferencia entre las ideas que se concretaron y las que murieron en la charla del asado es una sola: <strong>la gestión</strong>.</p>
        <p>Gestionar un proyecto no es aburrido ni burocrático. Es el arte de transformar una idea en <strong>acciones ordenadas que producen resultados</strong>.</p>
        <h3>Los 7 Componentes de Todo Proyecto</h3>
        <ol>
          <li><strong>El problema:</strong> ¿Qué querés resolver? Definilo con datos: "En nuestro barrio, 120 chicos de primaria no tienen acceso a apoyo escolar, y el 40% repite al menos un año."</li>
          <li><strong>El objetivo:</strong> ¿Qué querés lograr? Medible y concreto: "Ofrecer apoyo escolar gratuito a 60 chicos de 1ro a 6to grado durante el ciclo lectivo 2025."</li>
          <li><strong>Los beneficiarios:</strong> ¿A quién va dirigido? Cuántos, dónde, quiénes. No "la comunidad" — sino "60 chicos de 6-12 años del barrio X."</li>
          <li><strong>Las actividades:</strong> ¿Qué vas a hacer? Lista concreta: conseguir espacio, reclutar voluntarios, diseñar programa, armar cronograma, difundir.</li>
          <li><strong>Los recursos:</strong> ¿Qué necesitás? Humanos (voluntarios), materiales (útiles, espacio), financieros (presupuesto).</li>
          <li><strong>El cronograma:</strong> ¿Cuándo? Mes por mes, actividad por actividad.</li>
          <li><strong>La evaluación:</strong> ¿Cómo sabés si funcionó? Indicadores concretos: asistencia, mejora de notas, satisfacción de familias.</li>
        </ol>
        <h3>El Marco Lógico Simplificado</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Nivel</th><th style="padding:8px;border:1px solid #ddd;">Descripción</th><th style="padding:8px;border:1px solid #ddd;">Ejemplo</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Fin</strong></td><td style="padding:8px;border:1px solid #ddd;">El cambio grande al que contribuís</td><td style="padding:8px;border:1px solid #ddd;">Mejorar la calidad educativa del barrio</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Propósito</strong></td><td style="padding:8px;border:1px solid #ddd;">Lo que tu proyecto logra directamente</td><td style="padding:8px;border:1px solid #ddd;">60 chicos con apoyo escolar</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Resultados</strong></td><td style="padding:8px;border:1px solid #ddd;">Lo que producís</td><td style="padding:8px;border:1px solid #ddd;">240 clases dictadas, 15 voluntarios capacitados</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Actividades</strong></td><td style="padding:8px;border:1px solid #ddd;">Lo que hacés</td><td style="padding:8px;border:1px solid #ddd;">Reclutar, capacitar, dictar clases, evaluar</td></tr>
        </table>
        <blockquote>"No hace falta ser ingeniero para gestionar un proyecto. Hace falta claridad sobre qué querés lograr, honestidad sobre qué tenés, y disciplina para hacer lo que dijiste que ibas a hacer."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Presupuestos Comunitarios: Cuánto Cuesta Cambiar el Mundo',
      description: 'Cómo armar un presupuesto realista para un proyecto sin fines de lucro.',
      content: `
        <h2>El Dinero No Es Todo (Pero Sin Plata No Arrancás)</h2>
        <p>Uno de los errores más comunes de los proyectos comunitarios es subestimar cuánto cuestan. "Lo hacemos a pulmón" funciona un mes. Después, la gente se cansa, los materiales se acaban, y el proyecto muere. Un <strong>presupuesto honesto</strong> es la columna vertebral de un proyecto sostenible.</p>
        <h3>Tipos de Costos</h3>
        <ul>
          <li><strong>Costos directos:</strong> Lo que gastás específicamente en el proyecto. Materiales, transporte, impresiones, refrigerios, honorarios de talleristas.</li>
          <li><strong>Costos indirectos:</strong> Los que sostienen la organización. Internet, teléfono, espacio, contador, seguros.</li>
          <li><strong>Costos ocultos:</strong> Los que nadie presupuesta. El tiempo de los voluntarios (que aunque no cobren, tiene valor), el desgaste de equipos personales, las comidas durante jornadas largas.</li>
          <li><strong>Costos de contingencia:</strong> Siempre sumá un 10-15% para imprevistos. En Argentina, los imprevistos son la regla.</li>
        </ul>
        <h3>Modelo de Presupuesto</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Rubro</th><th style="padding:8px;border:1px solid #ddd;">Detalle</th><th style="padding:8px;border:1px solid #ddd;">Cantidad</th><th style="padding:8px;border:1px solid #ddd;">Costo unit.</th><th style="padding:8px;border:1px solid #ddd;">Total</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Materiales</td><td style="padding:8px;border:1px solid #ddd;">Útiles escolares</td><td style="padding:8px;border:1px solid #ddd;">60 kits</td><td style="padding:8px;border:1px solid #ddd;">$5.000</td><td style="padding:8px;border:1px solid #ddd;">$300.000</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Merienda</td><td style="padding:8px;border:1px solid #ddd;">Leche + galletitas</td><td style="padding:8px;border:1px solid #ddd;">120 días</td><td style="padding:8px;border:1px solid #ddd;">$8.000</td><td style="padding:8px;border:1px solid #ddd;">$960.000</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Capacitación</td><td style="padding:8px;border:1px solid #ddd;">Taller voluntarios</td><td style="padding:8px;border:1px solid #ddd;">2 jornadas</td><td style="padding:8px;border:1px solid #ddd;">$50.000</td><td style="padding:8px;border:1px solid #ddd;">$100.000</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Contingencia</td><td style="padding:8px;border:1px solid #ddd;">10%</td><td style="padding:8px;border:1px solid #ddd;">-</td><td style="padding:8px;border:1px solid #ddd;">-</td><td style="padding:8px;border:1px solid #ddd;">$136.000</td></tr>
          <tr style="background:#e8f5e9;"><td style="padding:8px;border:1px solid #ddd;" colspan="4"><strong>TOTAL</strong></td><td style="padding:8px;border:1px solid #ddd;"><strong>$1.496.000</strong></td></tr>
        </table>
        <h3>Fuentes de Financiamiento</h3>
        <ul>
          <li><strong>Autofinanciamiento:</strong> Rifas, eventos, venta de productos. Genera autonomía pero requiere esfuerzo.</li>
          <li><strong>Donaciones:</strong> Comercios del barrio, profesionales, ex-alumnos. Pedí cosas concretas: "Necesitamos 60 carpetas" en vez de "necesitamos plata."</li>
          <li><strong>Subsidios públicos:</strong> Municipio, provincia, nación. Hay programas para casi todo — el desafío es enterarte y postularte.</li>
          <li><strong>Fondos de cooperación:</strong> Embajadas, organizaciones internacionales, empresas con programas de RSE.</li>
          <li><strong>Crowdfunding:</strong> Plataformas como Ideame. Funcionan mejor si tenés buena comunicación visual.</li>
        </ul>
        <blockquote>"Un presupuesto no es una planilla aburrida: es la traducción de tu sueño al idioma de la realidad. Cuando sabés cuánto cuesta, podés empezar a buscar cómo financiarlo."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Coordinación de Voluntarios: Liderar Sin Mandar',
      description: 'Cómo motivar, organizar y retener voluntarios en proyectos comunitarios.',
      content: `
        <h2>El Recurso Más Valioso (y Más Frágil)</h2>
        <p>Los voluntarios son el corazón de cualquier proyecto comunitario. Pero a diferencia de los empleados, <strong>no están obligados a quedarse</strong>. No les pagás sueldo. No podés darles órdenes. Si se aburren, se frustran o se sienten ignorados, simplemente dejan de venir. Coordinar voluntarios es un arte.</p>
        <h3>¿Por Qué la Gente Dona Su Tiempo?</h3>
        <ul>
          <li><strong>Propósito:</strong> Quieren sentir que hacen algo que importa.</li>
          <li><strong>Pertenencia:</strong> Quieren ser parte de algo más grande que ellos mismos.</li>
          <li><strong>Aprendizaje:</strong> Quieren adquirir habilidades y experiencias nuevas.</li>
          <li><strong>Reconocimiento:</strong> Quieren sentirse valorados y visibles.</li>
          <li><strong>Diversión:</strong> Sí, el voluntariado puede (y debe) ser disfrutable.</li>
        </ul>
        <h3>El Ciclo del Voluntario</h3>
        <ol>
          <li><strong>Convocatoria:</strong> Sé claro sobre qué necesitás. "Buscamos 5 personas que puedan dar 3 horas los sábados durante 4 meses para dar apoyo escolar a chicos de primaria." Cuanto más específico, mejor. La gente se suma a lo concreto.</li>
          <li><strong>Inducción:</strong> El primer día es clave. Presentá el proyecto, el equipo, las reglas, las expectativas. Un voluntario que no entiende qué se espera se frustra rápido.</li>
          <li><strong>Asignación de tareas:</strong> Cada persona tiene habilidades diferentes. Preguntá: "¿Qué sabés hacer? ¿Qué te gustaría aprender?" Asigná tareas que combinen ambas cosas.</li>
          <li><strong>Acompañamiento:</strong> Chequeá regularmente. "¿Cómo te sentís? ¿Necesitás algo? ¿Tenés alguna idea?" El voluntario que se siente acompañado se queda.</li>
          <li><strong>Reconocimiento:</strong> Agradecé públicamente. Un certificado, una mención en redes, un asado de cierre. El reconocimiento no cuesta dinero pero vale millones.</li>
          <li><strong>Feedback y cierre:</strong> Al terminar el ciclo, hacé una evaluación conjunta. ¿Qué aprendimos? ¿Qué mejorar? ¿Quieren seguir?</li>
        </ol>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">Lucía Ferreyra coordina un programa de apoyo escolar en Córdoba Capital desde 2021. El primer año arranca con 22 voluntarios universitarios entusiasmados. Para junio, le quedan 6. ¿Qué pasó? Los voluntarios llegaban los sábados y nadie les decía qué hacer. Algunos se sentaban a esperar. Otros improvisaban actividades que no conectaban con nada. No había feedback, no había agradecimiento, no había sentido de equipo. Lucía decide cambiar todo: crea una ficha de ingreso donde cada voluntario cuenta qué sabe hacer y qué quiere aprender. Arma parejas de voluntarios nuevos con experimentados. Manda un WhatsApp de agradecimiento cada lunes con una foto y un resultado concreto. Organiza un asado de cierre cada trimestre. En 2023, no solo retiene a 18 de 20 voluntarios — sino que los propios voluntarios traen nuevos. "El secreto no fue exigir más compromiso", dice Lucía. "Fue cuidar mejor a la gente que ya estaba."</p>
        </div>
        <h3>Los 5 Asesinos del Voluntariado</h3>
        <ul>
          <li><strong>Desorganización:</strong> Si el voluntario viene y no sabe qué hacer, no vuelve.</li>
          <li><strong>Sobrecarga:</strong> Si le pedís que haga todo, se quema. Respetá los límites que puso.</li>
          <li><strong>Falta de impacto visible:</strong> Si no ve resultados, pierde motivación. Mostrá avances.</li>
          <li><strong>Conflictos no resueltos:</strong> Tensiones entre voluntarios que nadie aborda destruyen equipos.</li>
          <li><strong>Liderazgo autoritario:</strong> "Acá mando yo" no funciona con voluntarios. Liderar es servir, no mandar.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin:20px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Si coordinás o participás en un proyecto con voluntarios, respondé estas preguntas:</p>
          <ul>
            <li>¿Cada voluntario sabe exactamente qué se espera de él o ella al llegar?</li>
            <li>¿Cuándo fue la última vez que le agradeciste públicamente a un voluntario?</li>
            <li>Si un voluntario dejara de venir, ¿sabrías por qué? ¿Le preguntarías?</li>
          </ul>
          <p>Si alguna respuesta es "no" o "no sé", ahí tenés tu próxima acción concreta.</p>
        </div>
        <blockquote>"Un buen coordinador de voluntarios no es el que sabe más: es el que hace sentir a cada persona que su aporte es indispensable. Porque lo es."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Escritura de Propuestas para Fondos',
      description: 'Cómo redactar propuestas que consigan financiamiento.',
      content: `
        <h2>El Arte de Pedir (Bien)</h2>
        <p>Hay dinero disponible para proyectos comunitarios. Mucho más del que la mayoría imagina. Subsidios municipales, programas nacionales, fondos internacionales, fundaciones empresariales. El problema es que muchos proyectos excelentes <strong>nunca acceden a ese dinero</strong> porque no saben escribir una propuesta que convenza.</p>
        <h3>La Estructura de una Propuesta Ganadora</h3>
        <ol>
          <li><strong>Resumen ejecutivo (1 página):</strong> Qué hacés, para quién, dónde, cuánto cuesta, qué impacto esperás. Es lo primero que leen y a veces lo único. Tiene que ser impecable.</li>
          <li><strong>Diagnóstico del problema (1-2 páginas):</strong> Describí el problema con datos. No solo anécdotas — datos del INDEC, del municipio, de tu propio relevamiento. Mostrá que entendés el problema a fondo.</li>
          <li><strong>Propuesta de intervención (2-3 páginas):</strong> Tu solución. Qué vas a hacer, cómo, con quién, en qué plazos. Sé específico: no "vamos a mejorar la educación" sino "vamos a dar 240 clases de apoyo a 60 chicos durante 8 meses."</li>
          <li><strong>Metodología:</strong> ¿Cómo vas a hacer lo que prometés? El evaluador quiere saber que tenés un plan realista, no solo buenas intenciones.</li>
          <li><strong>Equipo (1 página):</strong> ¿Quiénes son? ¿Qué experiencia tienen? Incluí CVs breves. No es vanidad — es demostrar capacidad.</li>
          <li><strong>Presupuesto detallado:</strong> Rubro por rubro, justificado. Si pedís $50.000 para capacitación, detallá: 2 jornadas de 4 horas, facilitador especializado, materiales, refrigerio.</li>
          <li><strong>Cronograma:</strong> Mes a mes, qué se hace.</li>
          <li><strong>Evaluación:</strong> ¿Cómo vas a medir si funcionó? Indicadores concretos.</li>
          <li><strong>Sostenibilidad:</strong> ¿Qué pasa cuando se termina el financiamiento? ¿El proyecto continúa? ¿Cómo?</li>
        </ol>
        <h3>Las 3 Preguntas del Evaluador</h3>
        <p>Toda persona que evalúa una propuesta se hace 3 preguntas:</p>
        <ul>
          <li><strong>¿El problema es real?</strong> ¿Hay evidencia? ¿Afecta a mucha gente?</li>
          <li><strong>¿La solución es viable?</strong> ¿Es realista? ¿El equipo puede hacerlo?</li>
          <li><strong>¿Vale la inversión?</strong> ¿El impacto justifica el costo?</li>
        </ul>
        <p>Si tu propuesta responde SÍ a las tres con evidencia, tenés altas chances.</p>
        <h3>Dónde Buscar Convocatorias</h3>
        <ul>
          <li><strong>Argentina.gob.ar:</strong> Programas nacionales de desarrollo social, cultura, medio ambiente.</li>
          <li><strong>Tu municipio:</strong> Presupuesto participativo, subsidios a organizaciones, programas específicos.</li>
          <li><strong>Fundaciones:</strong> Fundación Avina, TECHO, Ashoka, Socialab, Kuepa.</li>
          <li><strong>Cooperación internacional:</strong> Unión Europea, embajadas (especialmente Canadá, Alemania, países nórdicos).</li>
        </ul>
        <blockquote>"Una propuesta bien escrita es un puente entre tu sueño y los recursos para realizarlo. No subestimes el poder de la palabra escrita: la propuesta que ganó el financiamiento cambió un barrio entero."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Estructuras Legales: Formalizar Sin Burocratizarse',
      description: 'Opciones legales para dar marco institucional a tu proyecto comunitario.',
      content: `
        <h2>¿Necesitás una Personería Jurídica?</h2>
        <p>Llega un momento en todo proyecto comunitario donde te preguntan: "¿tienen personería jurídica?" Para recibir subsidios, firmar convenios, abrir una cuenta bancaria o emitir recibos de donación. La respuesta no tiene que ser "tenemos una asociación civil compleja." Hay opciones más simples.</p>
        <h3>Las Opciones en Argentina</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Forma</th><th style="padding:8px;border:1px solid #ddd;">Complejidad</th><th style="padding:8px;border:1px solid #ddd;">Costo</th><th style="padding:8px;border:1px solid #ddd;">Ideal para</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Grupo informal</strong></td><td style="padding:8px;border:1px solid #ddd;">Nula</td><td style="padding:8px;border:1px solid #ddd;">$0</td><td style="padding:8px;border:1px solid #ddd;">Arrancar, probar la idea</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Asociación simple</strong></td><td style="padding:8px;border:1px solid #ddd;">Baja</td><td style="padding:8px;border:1px solid #ddd;">$0</td><td style="padding:8px;border:1px solid #ddd;">Proyectos chicos, sin fondos externos</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Asociación Civil</strong></td><td style="padding:8px;border:1px solid #ddd;">Media</td><td style="padding:8px;border:1px solid #ddd;">$100.000-300.000</td><td style="padding:8px;border:1px solid #ddd;">Recibir fondos, firmar convenios</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Fundación</strong></td><td style="padding:8px;border:1px solid #ddd;">Alta</td><td style="padding:8px;border:1px solid #ddd;">$300.000+</td><td style="padding:8px;border:1px solid #ddd;">Patrimonio propio, escala grande</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Cooperativa</strong></td><td style="padding:8px;border:1px solid #ddd;">Media</td><td style="padding:8px;border:1px solid #ddd;">Variable</td><td style="padding:8px;border:1px solid #ddd;">Actividad económica colectiva</td></tr>
        </table>
        <h3>La Asociación Civil: Paso a Paso</h3>
        <ol>
          <li><strong>Acta fundacional:</strong> Reunión de al menos 3 personas. Se registra nombre, objeto, autoridades, domicilio.</li>
          <li><strong>Estatuto:</strong> Las reglas de la organización. Hay modelos disponibles online. Un abogado puede adaptarlos.</li>
          <li><strong>Inscripción en IGJ (CABA) o Dirección de Personas Jurídicas (provincias):</strong> Se presenta acta + estatuto + documentación de los miembros.</li>
          <li><strong>CUIT y cuenta bancaria:</strong> Con la personería aprobada, tramitás CUIT en AFIP y abrís cuenta en el banco.</li>
          <li><strong>Exención impositiva:</strong> Las asociaciones civiles sin fines de lucro pueden solicitar exención de IVA y Ganancias.</li>
        </ol>
        <h3>Alternativa: Usar el Paraguas de Otra Organización</h3>
        <p>Si no querés (o no podés) armar tu propia personería, podés operar bajo el "paraguas" de una organización existente que administre los fondos por vos. Muchas parroquias, clubes y ONGs establecidas ofrecen esto a proyectos emergentes.</p>
        <h3>La Trampa de la Burocratización</h3>
        <p>Cuidado: la formalización es un medio, no un fin. Hay organizaciones que pasan más tiempo haciendo trámites que haciendo impacto. La regla es simple: <strong>formalizate solo cuando lo necesités</strong>, y al mínimo nivel necesario.</p>
        <blockquote>"La personería jurídica no hace al proyecto. El proyecto hace a la organización. Primero demostrá que tu idea funciona — después formalizala. Nunca al revés."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Comunicación del Proyecto: Contar Tu Historia',
      description: 'Cómo comunicar tu proyecto para atraer aliados, fondos y visibilidad.',
      content: `
        <h2>Si No Lo Contás, No Existe</h2>
        <p>Podés tener el mejor proyecto del mundo, pero si nadie se entera, no vas a conseguir voluntarios, fondos, aliados ni beneficiarios. La comunicación no es un "extra" — es parte esencial de la gestión.</p>
        <h3>Tu Historia en 60 Segundos (Elevator Pitch)</h3>
        <p>Si alguien te pregunta "¿qué hacen?", tenés que poder contestar en 60 segundos:</p>
        <ol>
          <li><strong>El problema (15 seg):</strong> "En nuestro barrio, 120 chicos no tienen apoyo escolar y el 40% repite."</li>
          <li><strong>La solución (15 seg):</strong> "Nosotros organizamos clases gratuitas los sábados con voluntarios capacitados."</li>
          <li><strong>El impacto (15 seg):</strong> "En 2 años, la tasa de repetición bajó al 15% entre nuestros chicos."</li>
          <li><strong>El pedido (15 seg):</strong> "Estamos buscando 5 voluntarios más y un espacio para el segundo turno."</li>
        </ol>
        <h3>Comunicación Digital Básica</h3>
        <ul>
          <li><strong>Instagram del proyecto:</strong> Publicá mínimo 2 veces por semana. Fotos reales (no stock), historias del día a día, testimonios de beneficiarios (con permiso). Usá Canva para diseño.</li>
          <li><strong>WhatsApp Status:</strong> Compartí novedades en tu estado. Muchos de tus contactos no saben lo que hacés.</li>
          <li><strong>Videos cortos:</strong> 60 segundos mostrando la actividad. Un chico leyendo por primera vez, un vecino agradeciendo, un antes y después. El video emociona más que el texto.</li>
          <li><strong>Newsletter simple:</strong> Un mail mensual a tu base de contactos. Qué hicieron, qué lograron, qué necesitan. Google Forms te permite armar la lista.</li>
        </ul>
        <h3>Relación con Medios Locales</h3>
        <ul>
          <li><strong>Gacetilla de prensa:</strong> Un texto breve (1 página) que cuente la noticia. "Proyecto X del barrio Y cumple 100 chicos atendidos." Enviala al mail de redacción del diario y la radio local.</li>
          <li><strong>Invitá a periodistas:</strong> A tus eventos, talleres, entregas. Ver con sus propios ojos es más poderoso que leer.</li>
          <li><strong>Sé fuente:</strong> Cuando un medio busque hablar del tema (educación, pobreza, barrios), que te conozcan como referente.</li>
        </ul>
        <blockquote>"Contar tu historia no es vanidad: es responsabilidad. Cada historia de impacto que compartís inspira a otro vecino a hacer algo. La comunicación es la semilla del efecto multiplicador."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Medición de Impacto: ¿Estamos Logrando Algo?',
      description: 'Cómo medir resultados reales para mejorar tu proyecto y rendir cuentas.',
      content: `
        <h2>Lo Que No Se Mide No Se Puede Mejorar</h2>
        <p>Muchos proyectos comunitarios trabajan años sin saber si realmente están generando cambio. "Sentimos que estamos haciendo bien" no alcanza. <strong>Medir el impacto</strong> te permite: mejorar lo que hacés, demostrar resultados a financiadores, y rendir cuentas a tu comunidad.</p>
        <h3>Actividades vs. Resultados vs. Impacto</h3>
        <ul>
          <li><strong>Actividades:</strong> Lo que hacés. "Damos 60 clases por mes." Es necesario pero no suficiente.</li>
          <li><strong>Resultados:</strong> Lo que producís. "120 chicos asisten regularmente." Mejor, pero todavía no es impacto.</li>
          <li><strong>Impacto:</strong> El cambio que generás. "La tasa de repetición bajó del 40% al 15% entre los chicos que asisten." ESO es impacto.</li>
        </ul>
        <h3>Indicadores Inteligentes (SMART)</h3>
        <p>Un buen indicador es:</p>
        <ul>
          <li><strong>S (Específico):</strong> "Mejorar la educación" NO es indicador. "Subir el promedio de notas de los chicos" SÍ.</li>
          <li><strong>M (Medible):</strong> Tiene que poder expresarse en números o categorías claras.</li>
          <li><strong>A (Alcanzable):</strong> Tiene que ser realista dado tus recursos.</li>
          <li><strong>R (Relevante):</strong> Tiene que medir algo que importa para el problema que atacás.</li>
          <li><strong>T (Temporal):</strong> Tiene que tener un plazo. "En 12 meses."</li>
        </ul>
        <h3>Herramientas Simples de Medición</h3>
        <ul>
          <li><strong>Registro de asistencia:</strong> Planilla simple (papel o Google Sheets). Quién viene, cuándo, cuántas veces. Es tu dato base.</li>
          <li><strong>Encuesta de satisfacción:</strong> 5 preguntas a beneficiarios y familias. Google Forms, anónimo. ¿Qué les parece? ¿Qué mejorarían?</li>
          <li><strong>Entrevistas breves:</strong> 3-5 entrevistas en profundidad a beneficiarios clave. Historias de vida que muestren el cambio.</li>
          <li><strong>Fotos antes/después:</strong> Documentá el estado inicial y el cambio. Un espacio abandonado transformado en huerta habla por sí solo.</li>
          <li><strong>Datos secundarios:</strong> Notas escolares, datos del centro de salud, estadísticas municipales. Compará "antes de tu intervención" vs. "después."</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">Diego Romero coordina un taller de oficios para jóvenes en el barrio Güemes de Salta. Durante dos años, Diego mide solo asistencia: "Vienen 40 pibes por semana." Cuando un financiador le pregunta "¿qué impacto tienen?", Diego no sabe qué contestar. ¿Los pibes consiguen trabajo después? ¿Mejoran sus ingresos? No tiene idea. Decide implementar tres mediciones simples: una encuesta de entrada (situación laboral al inscribirse), seguimiento a los 6 meses (¿consiguieron trabajo o emprendimiento?), y un grupo de WhatsApp de egresados donde comparten logros. Los resultados lo sorprenden: el 62% de los egresados encuentra trabajo o arranca un emprendimiento dentro de los 8 meses posteriores al taller. Ese dato cambia todo. Se lo muestra a la Cámara de Comercio local y consigue que 5 empresas apadrinen becas. "Medir no era burocracia", dice Diego. "Era descubrir que lo que hacíamos funcionaba de verdad."</p>
        </div>
        <h3>Informe de Impacto Anual</h3>
        <p>Una vez al año, consolidá tus datos en un <strong>informe de 2-3 páginas</strong>:</p>
        <ol>
          <li>Qué hicimos (actividades y números)</li>
          <li>Qué logramos (resultados e impacto)</li>
          <li>Qué aprendimos (lo que funcionó y lo que no)</li>
          <li>Qué necesitamos (para seguir y crecer)</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin:20px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Pensá en un proyecto comunitario que conozcas (propio o ajeno) y respondé:</p>
          <ul>
            <li>¿Qué actividades hacen? (Eso es fácil de contestar.)</li>
            <li>¿Qué resultados producen? (Números concretos: cuántos beneficiarios, cuántas actividades.)</li>
            <li>¿Qué impacto generan? (¿Cambió algo en la vida de las personas? ¿Cómo lo sabés?)</li>
          </ul>
          <p>Si la tercera pregunta te cuesta, no te preocupes — le cuesta al 80% de los proyectos. Pero ahora sabés que tenés que medir eso.</p>
        </div>
        <blockquote>"Medir impacto no es una exigencia burocrática: es un acto de respeto. Respeto por los beneficiarios, que merecen saber si el proyecto les sirve. Respeto por los voluntarios, que merecen saber si su esfuerzo vale. Y respeto por vos mismo, que merecés saber si vas por buen camino."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Alianzas Estratégicas: No Reinventes la Rueda',
      description: 'Cómo articular con otros actores para multiplicar el impacto.',
      content: `
        <h2>Juntos Llegamos Más Lejos</h2>
        <p>Uno de los problemas más comunes en el sector social argentino es la <strong>fragmentación</strong>: hay 10 organizaciones en el mismo barrio haciendo cosas parecidas sin hablar entre sí. Cada una reinventa la rueda, compite por los mismos fondos, y atiende a los mismos beneficiarios. Articular es la clave para multiplicar impacto.</p>
        <h3>¿Con Quién Articular?</h3>
        <ul>
          <li><strong>Otras organizaciones sociales:</strong> ¿Quién más trabaja en tu tema o tu barrio? ¿Pueden complementarse en vez de competir?</li>
          <li><strong>Escuelas:</strong> Son el punto de contacto con casi todas las familias del barrio. Si tu proyecto se vincula con la escuela, llegás a más gente.</li>
          <li><strong>Centros de salud:</strong> Si tu proyecto tiene componente de salud, nutrición o bienestar, el centro de salud es aliado natural.</li>
          <li><strong>Empresas locales:</strong> Muchas PyMEs quieren aportar pero no saben cómo. Ofreceles participación concreta: donar productos, prestar espacio, dar charlas.</li>
          <li><strong>Universidades:</strong> Estudiantes que necesitan hacer prácticas, investigadores que buscan campo, extensionistas con ganas de articular.</li>
          <li><strong>Gobierno local:</strong> No como "benefactor" sino como <em>socio</em>. Tu proyecto puede complementar políticas públicas. El municipio tiene recursos; vos tenés cercanía con la comunidad.</li>
        </ul>
        <h3>Tipos de Alianzas</h3>
        <ol>
          <li><strong>Intercambio de recursos:</strong> "Nosotros ponemos los voluntarios, ustedes el espacio." Simple y efectivo.</li>
          <li><strong>Derivación mutua:</strong> "Si a tus beneficiarios les sirve nuestro servicio, mandálos. Y viceversa." Red de servicios complementarios.</li>
          <li><strong>Proyecto conjunto:</strong> Diseñar y ejecutar algo juntos. Más complejo pero más impactante.</li>
          <li><strong>Red temática:</strong> Varias organizaciones del mismo tema se juntan para incidir en políticas públicas. Solos no los escuchan; juntos sí.</li>
        </ol>
        <h3>Claves para que la Alianza Funcione</h3>
        <ul>
          <li><strong>Definir aportes y expectativas:</strong> ¿Qué pone cada uno? ¿Qué espera recibir? Por escrito.</li>
          <li><strong>Comunicación regular:</strong> Reunión mensual de coordinación. Sin comunicación, la alianza se muere.</li>
          <li><strong>Reconocimiento mutuo:</strong> Visibilizá al otro. En tus comunicaciones, en tus informes, en tus eventos.</li>
          <li><strong>Autonomía:</strong> Articular no es fusionarse. Cada organización mantiene su identidad y sus decisiones.</li>
        </ul>
        <blockquote>"El ego es el enemigo de la articulación. Si tu objetivo es que los chicos aprendan, no importa si el mérito es tuyo o del vecino. Lo que importa es que los chicos aprendan. Cuando ponés el propósito por encima del protagonismo, las alianzas florecen."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 14, isRequired: true,
    },
    {
      courseId,
      title: 'Sostenibilidad: Que Tu Proyecto Sobreviva a Tu Entusiasmo',
      description: 'Cómo hacer que un proyecto comunitario perdure más allá de sus fundadores.',
      content: `
        <h2>El Cementerio de los Buenos Proyectos</h2>
        <p>Argentina está llena de proyectos comunitarios que nacieron con entusiasmo, funcionaron 1-2 años, y murieron cuando el fundador se cansó, el financiamiento se acabó, o la crisis se los llevó puestos. La <strong>sostenibilidad</strong> es lo que separa un proyecto de un movimiento.</p>
        <h3>Las 4 Dimensiones de la Sostenibilidad</h3>
        <ol>
          <li><strong>Sostenibilidad financiera:</strong> ¿De dónde viene el dinero? Si dependés de un solo financiador, sos frágil. Diversificá: autofinanciamiento + donaciones + subsidios + servicios pagos.</li>
          <li><strong>Sostenibilidad institucional:</strong> ¿El proyecto depende de una sola persona? Si te vas, ¿sigue? Distribuí el liderazgo. Formá a tu reemplazo desde el día 1.</li>
          <li><strong>Sostenibilidad social:</strong> ¿La comunidad se apropió del proyecto? ¿Lo siente suyo? Un proyecto "para" la comunidad es frágil. Un proyecto "de" la comunidad es resiliente.</li>
          <li><strong>Sostenibilidad técnica:</strong> ¿Tienen las capacidades para seguir operando? ¿Documentaron los procesos? ¿Capacitaron a nuevos miembros?</li>
        </ol>
        <h3>El Plan de Sucesión</h3>
        <p>Parece prematuro, pero pensalo desde el principio: ¿qué pasa si mañana no podés seguir?</p>
        <ul>
          <li><strong>Identificá tu "número 2":</strong> Alguien del equipo que pueda tomar el liderazgo.</li>
          <li><strong>Delegá progresivamente:</strong> Si hacés todo vos, nadie aprende. Delegá una tarea por mes.</li>
          <li><strong>Documentá:</strong> Todo lo que sabés hacer debe estar escrito en algún lado. Procesos, contactos, contraseñas, procedimientos.</li>
          <li><strong>Rotar roles:</strong> Que todos sepan hacer un poco de todo. Si la única persona que sabe hacer las facturas se va, el proyecto se paraliza.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;padding:20px 24px;border-radius:0 10px 10px 0;margin:20px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p style="color:#78350f;line-height:1.7;">La biblioteca popular "Alicia Moreau" en Berazategui funciona desde 2017. La fundó Estela Giménez, jubilada docente, en el garaje de su casa. Durante 4 años, Estela hace todo: consigue libros donados, abre todos los días, organiza talleres de lectura para chicos del barrio. En 2021, Estela se enferma y no puede abrir durante un mes. La biblioteca cierra. Cuando vuelve, entiende que el proyecto no puede depender solo de ella. Forma un equipo de 4 vecinas, cada una encargada de un día de la semana. Documenta todos los procesos en un cuaderno que llama "el manual de Alicia": cómo se registran los libros, cómo se inscribe un socio, dónde están las llaves, quién es el contacto en la editorial que dona. En 2023, Estela se muda a la casa de su hija en Bahía Blanca. La biblioteca no solo sigue abierta — ahora abre 5 días a la semana en vez de 4. "Lo más difícil fue soltar", dice Estela por teléfono. "Pero si no soltaba, la biblioteca moría conmigo."</p>
        </div>
        <h3>Modelos de Ingresos para Proyectos Sociales</h3>
        <ul>
          <li><strong>Cuota simbólica:</strong> Cobrar un monto mínimo a los beneficiarios dignifica la relación y genera un ingreso base.</li>
          <li><strong>Venta de productos:</strong> Las huertas venden verdura, los talleres venden artesanías, los grupos culturales venden entradas.</li>
          <li><strong>Servicios a terceros:</strong> Tu experiencia vale: podés capacitar a otros grupos, asesorar empresas, dictar talleres pagos.</li>
          <li><strong>Eventos:</strong> Festivales, rifas, cenas benéficas. Generan ingresos y visibilidad.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin:20px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Hacete estas preguntas sobre tu proyecto (o uno que conozcas):</p>
          <ul>
            <li>Si mañana la persona que más sabe se va, ¿el proyecto sobrevive una semana?</li>
            <li>¿Hay alguien más que sepa hacer cada tarea clave? ¿Están documentados los procesos?</li>
            <li>¿De cuántas fuentes de financiamiento dependés? Si una se cae, ¿seguís operando?</li>
          </ul>
          <p>Si las respuestas te incomodan, este es el momento de empezar tu plan de sucesión y diversificación.</p>
        </div>
        <blockquote>"El mayor acto de liderazgo no es hacer un proyecto exitoso: es hacer un proyecto que funcione sin vos. Cuando te volvés prescindible, tu proyecto se volvió indestructible."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Proyecto Empieza Hoy: De la Lección a la Acción',
      description: 'Integrar todo lo aprendido en el diseño de tu propio proyecto comunitario.',
      content: `
        <h2>El Momento Es Ahora</h2>
        <p>Llegaste al final de este curso con todas las herramientas de gestión que necesitás. Pero las herramientas sin uso son chatarra. Esta última lección te guía para diseñar tu primer proyecto comunitario (o mejorar el que ya tenés).</p>
        <h3>Ejercicio Final: Tu Proyecto en Una Página</h3>
        <p>Completá esta hoja y tendrás el esqueleto de un proyecto listo para implementar:</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;width:30%;"><strong>Nombre del proyecto</strong></td><td style="padding:10px;border:1px solid #ddd;"></td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Problema que resuelve</strong></td><td style="padding:10px;border:1px solid #ddd;">(con datos)</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Objetivo</strong></td><td style="padding:10px;border:1px solid #ddd;">(medible, en un plazo)</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Beneficiarios</strong></td><td style="padding:10px;border:1px solid #ddd;">(cuántos, dónde, quiénes)</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>3 actividades principales</strong></td><td style="padding:10px;border:1px solid #ddd;"></td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Equipo necesario</strong></td><td style="padding:10px;border:1px solid #ddd;">(# voluntarios, roles)</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Presupuesto estimado</strong></td><td style="padding:10px;border:1px solid #ddd;"></td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Cómo mido el éxito</strong></td><td style="padding:10px;border:1px solid #ddd;">(indicador SMART)</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>Primer paso concreto</strong></td><td style="padding:10px;border:1px solid #ddd;">(lo que hago esta semana)</td></tr>
        </table>
        <h3>Tu Línea de Tiempo</h3>
        <ul>
          <li><strong>Esta semana:</strong> Completá la hoja de proyecto. Hablá con 3 personas sobre tu idea.</li>
          <li><strong>Mes 1:</strong> Armá el equipo mínimo (3-5 personas). Hacé la primera reunión con agenda.</li>
          <li><strong>Mes 2:</strong> Ejecutá una actividad piloto. Algo chico, manejable, que te permita aprender.</li>
          <li><strong>Mes 3:</strong> Evaluá el piloto. ¿Funcionó? ¿Qué ajustás? Rediseñá si es necesario.</li>
          <li><strong>Mes 4-6:</strong> Escalá. Más beneficiarios, más voluntarios, primera búsqueda de fondos.</li>
          <li><strong>Mes 6-12:</strong> Consolidá. Medí impacto, escribí tu informe, buscá alianzas, formalizá si necesitás.</li>
        </ul>
        <h3>Los 3 Enemigos del Primer Paso</h3>
        <ol>
          <li><strong>"No estoy preparado/a":</strong> Nadie lo está. Se aprende haciendo. Ese es todo el punto de este curso.</li>
          <li><strong>"No tengo tiempo":</strong> 3 horas por semana alcanzan para arrancar. ¿Cuántas horas por semana mirás el celular?</li>
          <li><strong>"No va a servir de nada":</strong> Un chico que aprendió a leer, una cuadra con luz, una plaza limpia: eso NO es "nada". Cada pequeño cambio es una victoria enorme.</li>
        </ol>
        <blockquote>"No necesitás permiso para cambiar tu barrio. No necesitás un título para gestionar un proyecto. No necesitás plata para empezar. Necesitás lo que ya tenés: indignación ante lo injusto, compasión por los demás, y la voluntad de hacer algo al respecto. El resto se aprende en el camino."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Historia Completa: La Huerta Comunitaria de Flores',
      description: 'Una narrativa real que muestra cómo una vecina usó cada herramienta de este curso para transformar un terreno baldío en un espacio de encuentro y producción.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">Las lecciones anteriores te dieron herramientas una por una: presupuestos, voluntarios, propuestas, medición, alianzas, sostenibilidad. Pero en la vida real, esas herramientas no se usan por separado — se usan todas juntas, desordenadas, en medio del barro y la incertidumbre. Esta historia te muestra cómo se ve eso en la práctica: una persona real, en un barrio real, usando cada herramienta del curso en secuencia para convertir una idea en un proyecto que lleva tres años funcionando.</p>
        </div>
        <h2>Silvia y el Terreno Baldío</h2>
        <p>Silvia Domínguez tiene 45 años y trabaja como empleada doméstica en el barrio de Flores, Ciudad de Buenos Aires. Todos los días pasa por un terreno baldío de 400 metros cuadrados en la esquina de Directorio y Bonorino. El terreno pertenece al Gobierno de la Ciudad, está abandonado desde 2018, y se convirtió en basural informal. Los vecinos tiran escombros, los perros callejeros se refugian ahí, y cada vez que llueve el agua estancada cría mosquitos. Los chicos de la escuela de enfrente pasan caminando al lado de la basura todos los días.</p>
        <p>En marzo de 2023, Silvia ve un documental sobre huertas urbanas en Rosario. Al día siguiente, parada frente al terreno, piensa: "¿Y si hacemos una huerta acá?"</p>

        <h3>Fase 1: Del Sueño al Plan (Herramienta: Diseño de Proyecto)</h3>
        <p>Silvia no empieza con la pala. Empieza con un cuaderno. Escribe:</p>
        <ul>
          <li><strong>Problema:</strong> Terreno baldío de 400m² convertido en basural, frente a escuela con 280 alumnos.</li>
          <li><strong>Objetivo:</strong> Transformar el terreno en huerta comunitaria productiva en 12 meses.</li>
          <li><strong>Beneficiarios:</strong> 120 familias del barrio + 280 alumnos de la escuela.</li>
          <li><strong>Actividades:</strong> Limpiar terreno, preparar suelo, construir canteros, plantar, capacitar vecinos, cosechar y distribuir.</li>
        </ul>
        <p>No es una propuesta perfecta. Pero está escrita. Y eso la separa del 90% de las buenas ideas que mueren en la charla del café.</p>

        <h3>Fase 2: Armar el Equipo (Herramienta: Coordinación de Voluntarios)</h3>
        <p>Silvia le cuenta la idea a 3 vecinas mientras esperan a los chicos en la puerta de la escuela. Las tres dicen que sí. Hacen la primera reunión en la cocina de Silvia un jueves a la noche. Silvia aplica lo que aprendió: lleva una agenda de 3 puntos, asigna roles, y cierra con acciones concretas. María se encarga de averiguar el estado legal del terreno. Josefina habla con la directora de la escuela. Claudia, que es técnica agrícola recibida en el INTA, diseña el plan de cultivo.</p>
        <p>En la segunda reunión, ya son 8. Silvia crea un grupo de WhatsApp con reglas claras: nada de cadenas, nada de audios largos, solo información del proyecto. Cada voluntario llena una ficha simple: nombre, qué sabe hacer, cuántas horas puede dar por semana.</p>

        <h3>Fase 3: Conseguir el Espacio (Herramienta: Negociación + Redacción Formal)</h3>
        <p>El terreno es del Gobierno de la Ciudad. Silvia necesita un permiso de uso. Escribe una nota formal al Director de Espacios Verdes de la Comuna 7, siguiendo el modelo que aprendió: quién es, qué propone, qué problema resuelve, qué pide. Adjunta fotos del basural, un croquis de la huerta, y la firma de 47 vecinos que juntó en un Google Form.</p>
        <p>La primera respuesta es el silencio. Silvia manda la nota de nuevo por correo certificado — ahora tiene número de expediente. Después pide una reunión formal. Va acompañada de Claudia (que aporta credencial técnica del INTA) y de una mamá de la escuela que es periodista en un medio local. No amenaza — negocia. Plantea intereses comunes: "Ustedes necesitan un terreno mantenido, nosotros necesitamos un espacio para la huerta. Ganamos todos."</p>
        <p>El permiso tarda 3 meses. Pero sale.</p>

        <h3>Fase 4: Conseguir Recursos (Herramienta: Presupuesto + Escritura de Propuestas)</h3>
        <p>Silvia arma un presupuesto detallado. La limpieza del terreno cuesta $180.000 (volquete + herramientas). Los materiales para canteros: $120.000. Tierra y compost: $95.000. Semillas y plantines: $45.000. Contingencia 10%: $44.000. Total: $484.000.</p>
        <p>Consigue financiamiento de tres fuentes:</p>
        <ul>
          <li>La escuela dona $80.000 de su cooperadora.</li>
          <li>La ferretería del barrio dona herramientas a cambio de un cartel con su nombre en la huerta.</li>
          <li>Silvia se presenta al programa "Buenos Aires Produce" del Gobierno de la Ciudad y gana un subsidio de $300.000.</li>
        </ul>
        <p>La propuesta que presenta tiene todo: diagnóstico con datos, marco lógico simplificado, cronograma mes a mes, presupuesto desglosado, y cartas de apoyo de la escuela y la junta vecinal.</p>

        <h3>Fase 5: Ejecutar y Medir (Herramienta: Gestión + Medición de Impacto)</h3>
        <p>La limpieza del terreno es una jornada comunitaria. Vienen 35 personas un sábado. Silvia documenta todo: fotos del antes, fotos del durante, lista de asistentes, acta de la jornada. Cada mes mide: kilos cosechados, familias que retiran verdura, horas de voluntariado, alumnos que participan en la huerta escolar.</p>
        <p>A los 6 meses, la huerta produce 120 kilos de verdura por mes. 85 familias retiran lechuga, tomate, acelga y aromáticas. 140 alumnos de 4to y 5to grado tienen clase de huerta una vez por semana como parte del programa escolar.</p>

        <h3>Fase 6: Alianzas y Sostenibilidad (Herramienta: Alianzas + Sostenibilidad)</h3>
        <p>Silvia entiende que el proyecto no puede depender solo de ella y del subsidio. Arma alianzas:</p>
        <ul>
          <li>El INTA les da capacitación técnica gratuita a través del programa ProHuerta.</li>
          <li>La escuela incorpora la huerta como espacio curricular permanente.</li>
          <li>Un restaurante del barrio compra aromáticas y verduras de estación a precio justo.</li>
          <li>Tres voluntarias se capacitan como líderes de cantero: si Silvia no puede venir, la huerta funciona igual.</li>
        </ul>
        <p>En 2025, la huerta tiene cuenta propia (operan bajo el paraguas de la cooperadora escolar), ingresos por venta de aromáticas que cubren el 40% de los costos, y un equipo de 12 voluntarios estables con roles rotativos.</p>

        <h3>Los Aprendizajes de Silvia</h3>
        <p>Cuando le preguntan qué aprendió, Silvia dice cinco cosas:</p>
        <ol>
          <li><strong>"Empezá chico."</strong> No arrancó con un terreno de una hectárea — arrancó con 400 metros y 4 vecinas.</li>
          <li><strong>"Escribí todo."</strong> La nota formal, el presupuesto, las actas, los indicadores. Si no estaba escrito, no existía para el Estado.</li>
          <li><strong>"No hagas todo vos."</strong> Delegar fue lo más difícil y lo más importante. La huerta sobrevive porque no depende de ella.</li>
          <li><strong>"Medí lo que hacés."</strong> "120 kilos por mes" abrió más puertas que "estamos haciendo una huerta linda".</li>
          <li><strong>"No pidas permiso para empezar."</strong> Silvia empezó a planificar antes de tener el permiso del terreno. Cuando llegó el permiso, ya tenía equipo, plan y presupuesto.</li>
        </ol>

        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin:20px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Releé la historia de Silvia e identificá en qué momento usó cada herramienta del curso:</p>
          <ul>
            <li>¿En qué fase usó el diseño de proyecto? ¿Y la negociación?</li>
            <li>¿Cómo consiguió que el proyecto no dependiera de ella sola?</li>
            <li>¿Qué hubiera pasado si no hubiera documentado todo desde el principio?</li>
            <li>¿Hay un terreno baldío, un problema sin resolver o una necesidad en tu barrio que podría tener una historia parecida?</li>
          </ul>
        </div>

        <blockquote>"Silvia no tenía título universitario, ni contactos políticos, ni plata. Tenía un cuaderno, un grupo de WhatsApp, y la terquedad de no aceptar que un basural frente a una escuela fuera normal. Si ella pudo, vos podés. La pregunta no es si tenés las herramientas — ya las tenés. La pregunta es: ¿cuándo empezás?"</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 20, isRequired: true,
    },
    {
      courseId,
      title: 'Historia Completa: El Grupo de WhatsApp que Cambió el Barrio',
      description: 'Cómo un simple grupo de mensajería se transformó en una organización formal que resolvió problemas concretos durante 3 años.',
      content: `
        <div style="background:#1a1a2e;color:#ffffff;padding:24px 28px;border-radius:12px;margin-bottom:24px;">
          <h3 style="color:#f0e68c;margin-top:0;">Por qué importa</h3>
          <p style="color:#e0e0e0;line-height:1.7;">No todos los proyectos comunitarios nacen con un plan estratégico y un marco lógico. Muchos nacen de la forma más argentina posible: un grupo de WhatsApp donde los vecinos se quejan. Esta historia muestra cómo la queja colectiva, canalizada con las herramientas correctas, puede transformarse en una organización que cambia la realidad de un barrio entero. No se necesita un héroe fundador ni un evento dramático — se necesita alguien que diga "bueno, dejemos de quejarnos y hagamos algo", y que sepa cómo dar el primer paso.</p>
        </div>
        <h2>El Origen: Una Queja en el Grupo del Consorcio</h2>
        <p>Todo empieza en septiembre de 2022, en el barrio San José de Quilmes Oeste. Fabián Acosta, técnico en refrigeración de 38 años, manda un mensaje al grupo de WhatsApp de su cuadra:</p>
        <p><em>"¿Alguien más tiene problemas con el agua? Hace 3 días que sale marrón y ABSA no atiende el teléfono."</em></p>
        <p>En 10 minutos, 14 vecinos responden. Todos tienen el mismo problema. Algunos hace semanas. Una vecina dice que su hija tuvo una infección intestinal. Otro cuenta que ABSA le dijo "estamos al tanto" y cortó. La indignación crece. Los audios de 3 minutos empiezan a multiplicarse. Alguien dice "habría que hacer algo" y otro responde "pero ¿qué?"</p>
        <p>Fabián, sin pensarlo mucho, responde: "¿Y si nos organizamos?"</p>

        <h3>Fase 1: De la Queja a la Organización (Mes 1-2)</h3>
        <p>Fabián no tiene experiencia en organización comunitaria. Pero tiene sentido común y un celular. Hace tres cosas:</p>
        <ol>
          <li><strong>Crea un Google Form:</strong> "Problemas de agua en San José" — pregunta dirección, tipo de problema, desde cuándo, si hizo reclamo. En una semana tiene 87 respuestas de 6 manzanas.</li>
          <li><strong>Crea un grupo de WhatsApp nuevo:</strong> "Vecinos por el Agua - San José" — con reglas: solo temas del agua, sin política partidaria, sin cadenas. Límite de participantes: los que llenaron el formulario.</li>
          <li><strong>Convoca una reunión:</strong> Sábado 10am en la vereda de su casa. Trae una agenda impresa de 3 puntos: ¿Qué sabemos? ¿Qué queremos? ¿Qué hacemos primero?</li>
        </ol>
        <p>Vienen 23 personas. La reunión dura 50 minutos. Al final hay 3 acciones concretas con responsables: hacer un mapa de los hogares afectados (Fabián), redactar una nota a ABSA (Patricia, que es maestra y escribe bien), y contactar al concejal del distrito (Don Raúl, que lo conoce de la parroquia).</p>

        <h3>Fase 2: Documentar y Escalar (Mes 3-4)</h3>
        <p>Fabián arma un Google My Maps con los 87 hogares afectados. Cada punto tiene dirección, tipo de problema y foto del agua. El mapa es demoledor: muestra que toda la zona sur del barrio tiene agua contaminada, mientras la zona norte (donde vive el intendente) tiene servicio perfecto.</p>
        <p>Patricia redacta la nota a ABSA siguiendo un modelo formal. La envían por correo certificado con copia al Defensor del Pueblo de la Provincia. Adjuntan: el mapa, las 87 respuestas del formulario, y fotos de vasos con agua marrón.</p>
        <p>ABSA responde a los 15 días con un comunicado genérico: "Estamos realizando trabajos de mejora en la red." Los vecinos saben que es mentira porque hace 6 meses dicen lo mismo. Pero ahora tienen el expediente.</p>
        <p>Don Raúl consigue una reunión con el concejal. Van Fabián, Patricia y 4 vecinos más. Llevan el mapa impreso en A3 y las fotos. El concejal se compromete a hacer un pedido de informes al Concejo Deliberante. Lo piden por escrito. El concejal duda pero escribe un mail confirmando.</p>

        <h3>Fase 3: Ganar Visibilidad (Mes 5-6)</h3>
        <p>El pedido de informes de ABSA no llega. Fabián decide ir a los medios. Graba un video de 90 segundos: muestra el agua marrón saliendo de 3 canillas diferentes, lee un párrafo de la respuesta de ABSA, y cierra con: "Nuestros hijos se enferman y ABSA dice que están 'realizando mejoras'. Llevamos 8 meses."</p>
        <p>El video lo publica en Instagram, Facebook y se lo manda a 3 radios locales de Quilmes. Una radio lo levanta. Un periodista del diario zonal va al barrio. La nota sale con el mapa que hizo Fabián. Un medio digital de Buenos Aires la replica. ABSA llama a Fabián a las 48 horas.</p>
        <p>La reunión con ABSA es tensa pero productiva. Fabián va preparado: lleva datos, habla con calma, pide compromisos concretos con plazos. ABSA reconoce que hay un problema en la cañería troncal de la zona y se compromete a iniciar obras en 60 días. Fabián pide el compromiso por mail. Lo consigue.</p>

        <h3>Fase 4: La Obra y el Nacimiento de la Organización (Mes 7-12)</h3>
        <p>ABSA empieza las obras al día 75 (15 días tarde, pero empieza). Fabián documenta cada día con fotos. Los vecinos hacen seguimiento rotativo: un vecino por día verifica que los obreros estén trabajando y reporta al grupo.</p>
        <p>Durante los meses de obra, el grupo de WhatsApp empieza a abordar otros temas: la luminaria rota de la esquina, el basural de la calle paralela, la falta de poda en los árboles. Fabián se da cuenta de que ya no es un grupo del agua — es un grupo de vecinos organizados.</p>
        <p>En diciembre de 2022, con el agua resuelta, Fabián convoca una asamblea. Vienen 40 vecinos. Propone formalizar el grupo como "Vecinos Organizados de San José" y armar un plan para los 5 problemas más votados. Se eligen 3 coordinadores (no solo Fabián — él insiste en que haya más), se arma un estatuto simple, y se crea una cuenta de Instagram.</p>

        <h3>Fase 5: Crecimiento y Sostenibilidad (Año 2-3)</h3>
        <p>En 2023, "Vecinos Organizados de San José" consigue:</p>
        <ul>
          <li>La instalación de 12 luminarias LED en calles sin luz (reclamo formal al municipio con mapa de zonas oscuras).</li>
          <li>La limpieza de 3 microbasurales (jornada comunitaria + nota al municipio pidiendo contenedores).</li>
          <li>Un convenio con la escuela del barrio para uso del SUM para reuniones y talleres.</li>
          <li>La inscripción como asociación simple (sin costo) para poder participar del presupuesto participativo.</li>
        </ul>
        <p>En 2024, participan del presupuesto participativo de Quilmes y ganan un proyecto de $2.800.000 para la construcción de una vereda accesible en las 4 cuadras que rodean la escuela. Es la primera vez que el barrio gana un proyecto de presupuesto participativo.</p>
        <p>Para 2025, la organización tiene 65 miembros activos en el grupo de WhatsApp, 3 coordinadores rotativos, una cuenta de Instagram con 1.200 seguidores, y una carpeta de Google Drive con actas de 24 reuniones, 3 informes anuales, y un mapa comunitario con 120 puntos marcados.</p>

        <h3>Lo que Fabián Aprendió</h3>
        <ol>
          <li><strong>"El grupo de WhatsApp es solo el principio."</strong> Si te quedás en la queja digital, nada cambia. El WhatsApp sirve para coordinar acción, no para reemplazarla.</li>
          <li><strong>"Los datos son tu mejor arma."</strong> El mapa de hogares afectados fue más efectivo que 100 quejas telefónicas. Un formulario de Google le ganó a meses de reclamos individuales.</li>
          <li><strong>"Nunca vayas solo."</strong> A cada reunión con funcionarios fueron al menos 3 personas. El testigo protege, y el grupo impone respeto.</li>
          <li><strong>"Documentá todo desde el día uno."</strong> El expediente de ABSA, los mails del concejal, las fotos de la obra: todo servía para demostrar negligencia o cumplimiento.</li>
          <li><strong>"Formalizate cuando lo necesitás, no antes."</strong> Operaron 8 meses como grupo informal. Se formalizaron recién cuando querían participar del presupuesto participativo.</li>
          <li><strong>"Cuidá a tu gente."</strong> Fabián manda un mensaje de agradecimiento después de cada acción. Hace un asado de fin de año. Reconoce públicamente a cada persona que aporta. Por eso el grupo sigue activo 3 años después.</li>
        </ol>

        <div style="background:#f0fdf4;border:2px solid #16a34a;padding:20px 24px;border-radius:10px;margin:20px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Pensá en los grupos de WhatsApp en los que estás:</p>
          <ul>
            <li>¿Hay alguno donde los vecinos se quejan repetidamente de lo mismo sin que nadie proponga acción?</li>
            <li>¿Qué pasaría si en vez de mandar un audio quejándote, mandaras un Google Form preguntando a cuántos les pasa lo mismo?</li>
            <li>¿Quién podría ser el "Fabián" de tu grupo? ¿Podrías ser vos?</li>
            <li>¿Cuál sería tu primer paso concreto: un formulario, una reunión, una nota, un mapa?</li>
          </ul>
        </div>

        <blockquote>"Fabián no es un líder nato. No tiene título en ciencias políticas ni experiencia en ONGs. Tiene un celular, un formulario de Google, y la convicción de que quejarse sin actuar es hacerle un favor al que se beneficia de tu resignación. Cada barrio tiene un Fabián potencial. Cada grupo de WhatsApp puede ser el germen de una organización que cambie la realidad. La pregunta es siempre la misma: ¿quién dice 'bueno, basta de quejarnos, hagamos algo'? Hoy, esa persona podés ser vos."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 22, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 21');

  const eq21 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq21.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq21[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz21] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Gestión de Proyectos Comunitarios', description: 'Evaluá tu capacidad para gestionar proyectos de impacto.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q21 = [
    { quizId: quiz21.id, question: '¿Cuáles son los 7 componentes de todo proyecto comunitario?', type: 'multiple_choice' as const, options: JSON.stringify(['Idea, equipo, plata, oficina, logo, web, redes', 'Problema, objetivo, beneficiarios, actividades, recursos, cronograma, evaluación', 'Visión, misión, valores, estrategia, táctica, operación, balance', 'Planificar, ejecutar, controlar, cerrar, evaluar, comunicar, celebrar']), correctAnswer: JSON.stringify(1), explanation: 'Los 7 componentes esenciales son: problema, objetivo, beneficiarios, actividades, recursos, cronograma y evaluación.', points: 2, orderIndex: 1 },
    { quizId: quiz21.id, question: 'Los costos de contingencia no son necesarios en el presupuesto si se planifica bien.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'En Argentina los imprevistos son la regla. Siempre incluir un 10-15% de contingencia en el presupuesto.', points: 1, orderIndex: 2 },
    { quizId: quiz21.id, question: '¿Cuál es la principal razón por la que los voluntarios abandonan un proyecto?', type: 'multiple_choice' as const, options: JSON.stringify(['Falta de pago', 'Desorganización, no saber qué hacer y sentirse ignorados', 'Distancia al lugar de trabajo', 'Falta de experiencia']), correctAnswer: JSON.stringify(1), explanation: 'La desorganización, la falta de tareas claras y sentirse ignorados son los principales "asesinos" del voluntariado.', points: 2, orderIndex: 3 },
    { quizId: quiz21.id, question: 'Una propuesta de fondos exitosa solo necesita describir el problema, no proponer indicadores de medición.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Los evaluadores necesitan saber cómo medirás si funcionó. Los indicadores de medición son esenciales.', points: 1, orderIndex: 4 },
    { quizId: quiz21.id, question: '¿Cuál es la diferencia entre "resultados" e "impacto"?', type: 'multiple_choice' as const, options: JSON.stringify(['Son lo mismo', 'Los resultados son lo que producís; el impacto es el cambio que generás', 'Los resultados son cualitativos; el impacto es cuantitativo', 'El impacto es más fácil de medir que los resultados']), correctAnswer: JSON.stringify(1), explanation: '"120 chicos asisten" es resultado. "La tasa de repetición bajó del 40% al 15%" es impacto.', points: 2, orderIndex: 5 },
    { quizId: quiz21.id, question: 'Para recibir financiamiento externo, siempre es necesario tener personería jurídica propia.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Podés operar bajo el "paraguas" de una organización existente (parroquia, club, ONG) que administre los fondos.', points: 1, orderIndex: 6 },
    { quizId: quiz21.id, question: '¿Qué significa sostenibilidad institucional en un proyecto comunitario?', type: 'multiple_choice' as const, options: JSON.stringify(['Tener un edificio propio', 'Que el proyecto funcione sin depender de una sola persona', 'Tener presupuesto para 10 años', 'Estar registrado en el gobierno']), correctAnswer: JSON.stringify(1), explanation: 'La sostenibilidad institucional significa distribuir liderazgo y capacidades para que el proyecto funcione sin depender de un individuo.', points: 2, orderIndex: 7 },
    { quizId: quiz21.id, question: 'El ego y la competencia entre organizaciones es el principal obstáculo para las alianzas estratégicas.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Cuando se pone el propósito por encima del protagonismo, las alianzas florecen. El ego es el enemigo de la articulación.', points: 1, orderIndex: 8 },
  ];
  for (const q of q21) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 21');
}

async function seedCourse22(authorId: number) {
  console.log('--- Course 22: Datos para el Bien Común ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'datos-para-bien-comun')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Datos para el Bien Común',
      slug: 'datos-para-bien-comun',
      description: 'Usa datos como herramienta de transformación. Recolección y análisis de datos comunitarios, datos.gob.ar e INDEC, visualización, ciencia ciudadana y rendición de cuentas basada en datos.',
      excerpt: 'Convierte datos en herramientas de justicia y rendición de cuentas.',
      category: 'action',
      level: 'advanced',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      orderIndex: 22,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 22:', course[0].title);
  } else {
    console.log('Found existing course 22:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'Datos como Arma Ciudadana: Ver lo que el Poder Quiere Esconder',
      description: 'Los datos públicos son tu derecho y tu herramienta más poderosa de rendición de cuentas.',
      content: `
        <h2>La Información Es Poder — Literalmente</h2>
        <p>Cuando un funcionario dice "estamos invirtiendo mucho en educación", ¿cómo sabés si es verdad? Cuando un candidato promete "bajar la pobreza", ¿cómo medís si cumplió? Cuando tu municipio dice "no hay presupuesto para arreglar esa calle", ¿cómo verificás?</p>
        <p>Con <strong>datos</strong>. Los datos públicos son tu derecho constitucional (Ley 27.275 de Acceso a la Información Pública) y tu herramienta más poderosa para exigir rendición de cuentas.</p>
        <h3>¿Qué Son los Datos Abiertos?</h3>
        <p>Son datos que el gobierno produce y que cualquier ciudadano puede acceder, descargar, usar y redistribuir <strong>sin restricciones</strong>. No son un favor del gobierno — son una obligación democrática. Incluyen:</p>
        <ul>
          <li>Presupuestos (cuánto recauda y en qué gasta el Estado)</li>
          <li>Contrataciones públicas (a quién le compra y por cuánto)</li>
          <li>Estadísticas sociales (pobreza, empleo, salud, educación)</li>
          <li>Datos geográficos (mapas, infraestructura, transporte)</li>
          <li>Declaraciones juradas de funcionarios</li>
        </ul>
        <h3>El Ecosistema de Datos en Argentina</h3>
        <ul>
          <li><strong>datos.gob.ar:</strong> El portal nacional. Miles de datasets de todos los ministerios.</li>
          <li><strong>INDEC:</strong> El instituto de estadísticas. Censos, pobreza, empleo, precios.</li>
          <li><strong>Presupuesto Abierto:</strong> Cada peso que gasta el Estado nacional, desglosado.</li>
          <li><strong>data.buenosaires.gob.ar:</strong> Datos de CABA. Transporte, servicios, demografía.</li>
          <li><strong>Argentina Compra:</strong> Todas las licitaciones y contrataciones públicas.</li>
        </ul>
        <h3>Tu Derecho de Acceso</h3>
        <p>La Ley 27.275 te da derecho a pedir CUALQUIER información que tenga el Estado. El trámite es gratuito y el Estado tiene 15 días hábiles para responder. Si no responde, podés reclamar ante la Agencia de Acceso a la Información Pública.</p>
        <blockquote>"Los datos son la democracia en estado puro. Cuando un ciudadano armado con datos le muestra a un funcionario que su discurso no coincide con la realidad, eso es rendición de cuentas. Eso es república."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Recolección de Datos Comunitarios: Tu Barrio en Números',
      description: 'Métodos prácticos para relevar datos que no existen en fuentes oficiales.',
      content: `
        <h2>Cuando los Datos Oficiales No Alcanzan</h2>
        <p>Los datos del INDEC te dicen cuánta pobreza hay en el país. Pero no te dicen cuántos baches hay en tu cuadra, cuánto tarda la ambulancia en llegar a tu barrio, o cuántos chicos de tu manzana no van a la escuela. Esos datos los tenés que generar <strong>vos</strong>.</p>
        <h3>Métodos de Recolección</h3>
        <h4>1. La Encuesta Vecinal</h4>
        <ul>
          <li><strong>Diseño:</strong> Máximo 10 preguntas. Claras, cerradas (opciones), sin jerga. Google Forms es ideal.</li>
          <li><strong>Muestra:</strong> No necesitás encuestar a todo el barrio. 50-100 hogares bien seleccionados te dan un panorama confiable.</li>
          <li><strong>Distribución:</strong> Puerta a puerta es lo más confiable. WhatsApp funciona pero sesga (solo llega a los conectados).</li>
          <li><strong>Ejemplo:</strong> "¿Cuántas veces por semana sale agua por la canilla?" "¿A qué hora pasa el último colectivo?" "¿Su hijo/a asiste a apoyo escolar?"</li>
        </ul>
        <h4>2. La Observación Sistemática</h4>
        <ul>
          <li>Caminá la misma ruta 3 veces en diferentes horarios.</li>
          <li>Registrá: luminarias rotas, veredas en mal estado, basurales, esquinas inseguras.</li>
          <li>Sacá fotos geolocalizadas.</li>
          <li>Volcá todo en un mapa (Google My Maps).</li>
        </ul>
        <h4>3. El Registro Ciudadano</h4>
        <ul>
          <li>Pedí a vecinos que registren un dato durante 30 días. Ejemplo: "Anotá cada vez que se corta la luz, la hora y cuánto dura."</li>
          <li>Al final del mes, consolidá los datos.</li>
          <li>30 vecinos registrando cortes de luz = un informe demoledor sobre calidad del servicio eléctrico.</li>
        </ul>
        <h3>Calidad de los Datos</h3>
        <ul>
          <li><strong>Consistencia:</strong> Todos registramos lo mismo, de la misma manera.</li>
          <li><strong>Temporalidad:</strong> Los datos tienen fecha. "Relevado entre el 1 y el 30 de marzo de 2025."</li>
          <li><strong>Representatividad:</strong> ¿Cubrimos todo el barrio o solo una zona? Aclaralo.</li>
          <li><strong>Transparencia:</strong> Publicá la metodología. "Encuestamos 80 hogares seleccionados al azar en 10 manzanas del barrio X."</li>
        </ul>
        <blockquote>"El dato que vos generás tiene un valor que ningún censo nacional puede reemplazar: es hiperlocal, es actual, y es tuyo. Cuando le mostrás al funcionario que vos tenés LOS DATOS de su barrio, la conversación cambia por completo."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Análisis de Datos con Herramientas Gratuitas',
      description: 'Cómo transformar datos crudos en información útil usando hojas de cálculo.',
      content: `
        <h2>De Números Sueltos a Información Que Habla</h2>
        <p>Tener datos es el primer paso. Pero una planilla con 500 filas no le dice nada a nadie. El análisis transforma datos crudos en <strong>información comprensible y accionable</strong>. Y no necesitás ser científico de datos para hacerlo.</p>
        <h3>Google Sheets: Tu Laboratorio de Datos</h3>
        <p>Google Sheets (o Excel) es la herramienta más accesible para analizar datos. Gratuita, online, colaborativa. Las funciones que necesitás son pocas:</p>
        <ul>
          <li><strong>CONTAR.SI:</strong> ¿Cuántos vecinos respondieron "sí"? <code>=CONTAR.SI(B2:B100,"sí")</code></li>
          <li><strong>PROMEDIO:</strong> ¿Cuál es el ingreso promedio? <code>=PROMEDIO(C2:C100)</code></li>
          <li><strong>MEDIANA:</strong> ¿Cuál es el ingreso típico (sin que los extremos distorsionen)? <code>=MEDIANA(C2:C100)</code></li>
          <li><strong>MAX / MIN:</strong> ¿Cuál es el valor más alto y más bajo?</li>
          <li><strong>Tablas dinámicas:</strong> La herramienta más poderosa de Sheets. Cruza variables automáticamente.</li>
        </ul>
        <h3>Los 5 Análisis Básicos</h3>
        <ol>
          <li><strong>Frecuencia:</strong> ¿Cuántos respondieron cada opción? "El 60% reportó cortes de luz semanales."</li>
          <li><strong>Tendencia:</strong> ¿El problema mejora o empeora? Compará datos de diferentes momentos.</li>
          <li><strong>Comparación:</strong> ¿Hay diferencia entre zonas? "En la zona norte hay 3 luminarias por cuadra; en la sur, 0.5."</li>
          <li><strong>Cruce de variables:</strong> ¿Hay relación entre dos cosas? "Las familias con menor ingreso son las que más reportan cortes de agua."</li>
          <li><strong>Ranking:</strong> ¿Cuáles son los problemas más frecuentes? Ordená de mayor a menor.</li>
        </ol>
        <h3>Errores Comunes en el Análisis</h3>
        <ul>
          <li><strong>Confundir promedio con realidad:</strong> "El promedio de ingresos es $500.000" puede esconder que la mitad gana $200.000 y un vecino gana $3.000.000.</li>
          <li><strong>Porcentajes sin base:</strong> "Subió un 50%." ¿De cuánto a cuánto? El 50% de 2 es 3 — no impresiona.</li>
          <li><strong>Ignorar el contexto:</strong> "En nuestro barrio la pobreza es del 30%." ¿Es más o menos que el promedio de la ciudad? Sin comparación, el dato flota.</li>
          <li><strong>Cherry-picking:</strong> Elegir solo los datos que confirman tu argumento. Si querés credibilidad, mostrá TODOS los datos, incluso los incómodos.</li>
        </ul>
        <blockquote>"No necesitás un posgrado en estadística para analizar datos. Necesitás curiosidad, una planilla de cálculo, y la honestidad de dejar que los datos hablen — incluso cuando dicen algo que no querías escuchar."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Visualización: Convertir Datos en Historias Visuales',
      description: 'Cómo hacer gráficos, mapas e infografías que comuniquen datos con impacto.',
      content: `
        <h2>Una Imagen Vale Más que Mil Filas de Excel</h2>
        <p>Un concejal no va a leer tu planilla de 500 filas. Pero si le mostrás un <strong>gráfico claro</strong> donde se ve que los cortes de luz se multiplicaron por 3 en un año, lo entiende en 5 segundos. La visualización de datos es el puente entre tu análisis y la acción.</p>
        <h3>¿Qué Tipo de Gráfico Uso?</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Lo que querés mostrar</th><th style="padding:8px;border:1px solid #ddd;">Tipo de gráfico</th><th style="padding:8px;border:1px solid #ddd;">Ejemplo</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Comparación entre categorías</td><td style="padding:8px;border:1px solid #ddd;">Barras</td><td style="padding:8px;border:1px solid #ddd;">Problemas del barrio por frecuencia</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Evolución en el tiempo</td><td style="padding:8px;border:1px solid #ddd;">Líneas</td><td style="padding:8px;border:1px solid #ddd;">Cortes de luz mes a mes</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Partes de un todo</td><td style="padding:8px;border:1px solid #ddd;">Torta / dona</td><td style="padding:8px;border:1px solid #ddd;">En qué gasta el municipio</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Distribución geográfica</td><td style="padding:8px;border:1px solid #ddd;">Mapa</td><td style="padding:8px;border:1px solid #ddd;">Luminarias rotas por cuadra</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Relación entre variables</td><td style="padding:8px;border:1px solid #ddd;">Dispersión</td><td style="padding:8px;border:1px solid #ddd;">Ingreso vs. acceso a servicios</td></tr>
        </table>
        <h3>Herramientas Gratuitas de Visualización</h3>
        <ul>
          <li><strong>Google Sheets:</strong> Gráficos básicos directamente desde tu planilla. Alcanza para el 80% de los casos.</li>
          <li><strong>Canva:</strong> Infografías profesionales con plantillas. Ideal para redes sociales y presentaciones.</li>
          <li><strong>Datawrapper (gratis para uso básico):</strong> Gráficos interactivos de calidad periodística. Usado por medios como The Guardian.</li>
          <li><strong>Google My Maps:</strong> Mapas temáticos con puntos, áreas y rutas. Perfecto para datos georreferenciados.</li>
          <li><strong>Flourish:</strong> Visualizaciones animadas e interactivas. Gratis para uso público.</li>
        </ul>
        <h3>Los 5 Mandamientos del Buen Gráfico</h3>
        <ol>
          <li><strong>Un mensaje por gráfico:</strong> Si tu gráfico necesita explicación, es un mal gráfico.</li>
          <li><strong>Título claro:</strong> No "Gráfico 1" sino "Los cortes de luz se triplicaron en 12 meses."</li>
          <li><strong>Fuente visible:</strong> Siempre indicá de dónde vienen los datos.</li>
          <li><strong>Sin adornos innecesarios:</strong> 3D, sombras, efectos — todo eso distrae. Simplicidad.</li>
          <li><strong>Accesible:</strong> Colores contrastantes, texto legible, formato adaptable a celular.</li>
        </ol>
        <blockquote>"El dato sin visualización es potencial sin realizar. El gráfico correcto transforma una tabla aburrida en un argumento irrefutable. Aprendé a visualizar y tus datos se convertirán en historias que mueven voluntades."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Presupuesto Público: Seguí la Plata',
      description: 'Cómo leer el presupuesto público y detectar inconsistencias.',
      content: `
        <h2>Follow the Money: El Mandamiento Democrático</h2>
        <p>El presupuesto público es el documento político más importante de un gobierno. No lo que dice en los discursos — lo que decide GASTAR. Porque las prioridades reales no están en las promesas: están en las partidas presupuestarias.</p>
        <h3>Anatomía del Presupuesto</h3>
        <p>El presupuesto tiene dos caras:</p>
        <ul>
          <li><strong>Ingresos (recursos):</strong> De dónde viene la plata. Impuestos, tasas, transferencias, endeudamiento.</li>
          <li><strong>Gastos (erogaciones):</strong> A dónde va la plata. Personal, bienes, servicios, obra pública, transferencias, deuda.</li>
        </ul>
        <h3>Las Preguntas del Ciudadano Auditor</h3>
        <ol>
          <li><strong>¿Cuánto se presupuesta vs. cuánto se ejecuta?</strong> Si se presupuestaron $100M para escuelas pero solo se gastaron $40M, ¿dónde están los otros $60M?</li>
          <li><strong>¿Qué porcentaje va a cada área?</strong> Si el municipio gasta el 60% en sueldos y el 5% en obra pública, ¿es razonable?</li>
          <li><strong>¿Cómo cambia año a año?</strong> Si el gasto en salud bajó un 20% en términos reales (ajustado por inflación), ¿por qué?</li>
          <li><strong>¿Cuánto gasta en publicidad oficial?</strong> ¿Es razonable que un municipio gaste más en publicidad que en mantenimiento de plazas?</li>
          <li><strong>¿Hay partidas "discrecionales"?</strong> Transferencias a "otros organismos" sin detallar cuáles son sospechosas.</li>
        </ol>
        <h3>Herramientas para Seguir la Plata</h3>
        <ul>
          <li><strong>presupuestoabierto.gob.ar:</strong> Presupuesto nacional desglosado. Buscá por ministerio, programa, actividad.</li>
          <li><strong>Presupuestos municipales:</strong> Muchos municipios publican sus presupuestos en sus webs. Si no lo hacen, pedilo por Ley 27.275.</li>
          <li><strong>Compras públicas:</strong> comprar.gob.ar muestra todas las contrataciones nacionales. ¿A quién le compra el Estado? ¿A qué precio?</li>
        </ul>
        <h3>El Ajuste por Inflación: El Truco Más Viejo</h3>
        <p>El truco favorito de los gobiernos con inflación alta: "Aumentamos el presupuesto de salud un 50%." Si la inflación fue del 100%, en realidad <strong>bajaron</strong> el presupuesto de salud en términos reales. Siempre ajustá por inflación.</p>
        <p><strong>Fórmula simple:</strong> Presupuesto Real = Presupuesto Nominal / (1 + Inflación). Si la partida subió un 50% pero la inflación fue 100%, el presupuesto real cayó un 25%.</p>
        <blockquote>"El presupuesto público es la declaración jurada de un gobierno. Dice en qué cree realmente, más allá de lo que proclame. Un ciudadano que sabe leer el presupuesto es un ciudadano que no se deja engañar."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Ciencia Ciudadana: Cuando la Comunidad Investiga',
      description: 'Proyectos donde ciudadanos comunes generan datos científicos de valor.',
      content: `
        <h2>No Necesitás un Doctorado para Hacer Ciencia</h2>
        <p>La ciencia ciudadana es un movimiento global donde personas comunes contribuyen a la investigación científica: observando aves, midiendo la calidad del aire, monitoreando ríos, contando árboles. No son científicos profesionales — son <strong>ciudadanos curiosos con método</strong>.</p>
        <h3>Casos en Argentina</h3>
        <ul>
          <li><strong>eBird Argentina:</strong> Miles de observadores de aves registran avistamientos que alimentan bases de datos científicas globales. Argentina tiene más de 1.000 especies de aves y necesita ojos en todo el territorio.</li>
          <li><strong>AppEAR:</strong> Aplicación del CONICET para evaluar la calidad de ambientes acuáticos. Los ciudadanos recolectan muestras de agua y reportan condiciones de ríos y arroyos.</li>
          <li><strong>Monitoreo de mosquitos:</strong> Proyectos donde vecinos cuentan criaderos de Aedes aegypti y reportan datos que ayudan a prevenir dengue.</li>
          <li><strong>Calidad del aire:</strong> Sensores de bajo costo que vecinos instalan en sus casas para medir contaminación. Los datos se comparan con las mediciones oficiales (cuando existen).</li>
          <li><strong>Mapeo de biodiversidad:</strong> iNaturalist permite fotografiar plantas y animales que un algoritmo de IA identifica. Cada foto es un dato científico georreferenciado.</li>
        </ul>
        <h3>¿Por Qué Importa?</h3>
        <ul>
          <li><strong>Escala:</strong> Los científicos no pueden estar en todos lados. Miles de voluntarios cubriendo todo el territorio generan datos imposibles de obtener de otro modo.</li>
          <li><strong>Frecuencia:</strong> Un investigador visita un sitio 1-2 veces al año. Un vecino observa TODOS los días.</li>
          <li><strong>Conocimiento local:</strong> El vecino conoce el río, el bosque, el barrio. Sabe cuándo algo cambió.</li>
          <li><strong>Empoderamiento:</strong> Cuando medís la calidad del aire de tu barrio y descubrís que supera los límites, tenés un argumento que ningún funcionario puede ignorar.</li>
        </ul>
        <h3>Cómo Participar</h3>
        <ol>
          <li><strong>Elegí un proyecto:</strong> Buscá proyectos de ciencia ciudadana activos en Argentina (Ciencia Ciudadana Argentina, SciStarter, Zooniverse).</li>
          <li><strong>Capacitáte:</strong> La mayoría ofrece tutoriales gratuitos. Aprendé el método antes de empezar a recolectar.</li>
          <li><strong>Contribuí datos:</strong> Seguí el protocolo. La consistencia es clave: datos mal tomados son peor que no tener datos.</li>
          <li><strong>Conectá con tu comunidad:</strong> Armá un grupo de ciencia ciudadana en tu barrio. Es educativo, es divertido, y genera datos de valor.</li>
        </ol>
        <blockquote>"La ciencia ciudadana demuestra algo profundo: el conocimiento no es exclusivo de las universidades. Cuando un vecino mide la calidad del agua de su arroyo con método y rigor, está haciendo ciencia. Y está protegiendo a su comunidad con datos."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Periodismo de Datos: Contar Historias con Evidencia',
      description: 'Técnicas básicas de periodismo de datos aplicadas a la acción ciudadana.',
      content: `
        <h2>Los Datos Cuentan Historias — Si Sabés Escucharlos</h2>
        <p>El periodismo de datos no es solo para periodistas. Es una <strong>forma de pensar</strong>: partir de los datos para descubrir historias que nadie está contando. Cuando cruzás la lista de contrataciones públicas con el registro de empresas y descubrís que 5 licitaciones fueron a la misma empresa del cuñado del intendente, estás haciendo periodismo de datos.</p>
        <h3>El Proceso en 5 Pasos</h3>
        <ol>
          <li><strong>Pregunta:</strong> Empezá con una pregunta concreta. "¿En qué gasta mi municipio?" "¿Cuántos árboles se talaron este año?" "¿Quiénes son los mayores contratistas del Estado?"</li>
          <li><strong>Datos:</strong> ¿Dónde están los datos que responden tu pregunta? Portales abiertos, pedidos de información, relevamiento propio.</li>
          <li><strong>Limpieza:</strong> Los datos crudos son desprolijos. Errores de tipeo, formatos inconsistentes, datos faltantes. Limpiá antes de analizar.</li>
          <li><strong>Análisis:</strong> Buscá patrones, anomalías, tendencias. ¿Hay algo que no cierra? ¿Algo que sorprende?</li>
          <li><strong>Narrativa:</strong> Transformá tu hallazgo en una historia comprensible. Datos + contexto + visualización = historia poderosa.</li>
        </ol>
        <h3>Técnicas de Investigación con Datos</h3>
        <ul>
          <li><strong>Cruce de bases:</strong> Cruzar la lista de funcionarios con la lista de titulares de empresas contratistas. Si coinciden, hay conflicto de interés.</li>
          <li><strong>Análisis temporal:</strong> ¿Las contrataciones aumentan antes de las elecciones? ¿La obra pública se concentra en ciertos barrios?</li>
          <li><strong>Comparación:</strong> ¿Mi municipio gasta más per cápita en publicidad que otros similares? ¿Por qué?</li>
          <li><strong>Outliers:</strong> ¿Hay una licitación que costó 10 veces más que las similares? Investigá.</li>
        </ul>
        <h3>Publicar Tu Investigación</h3>
        <ul>
          <li><strong>Blog propio:</strong> Tu investigación documentada con datos, gráficos y fuentes.</li>
          <li><strong>Medios locales:</strong> Ofrecé tu investigación como nota. Los medios locales suelen tener poca capacidad de investigación propia.</li>
          <li><strong>Redes sociales:</strong> Un hilo de Twitter/X o una serie de Instagram Stories con tus hallazgos.</li>
          <li><strong>Organizaciones aliadas:</strong> Asociaciones anticorrupción, organizaciones de transparencia, foros cívicos.</li>
        </ul>
        <blockquote>"El periodismo de datos no es un oficio de élite: es ciudadanía ejercida con método. Cuando cruzás datos y descubrís lo que el poder quería esconder, estás haciendo el trabajo más importante de una democracia: vigilar al que manda."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Inteligencia Artificial y Datos Ciudadanos',
      description: 'Cómo usar IA para potenciar el análisis de datos comunitarios.',
      content: `
        <h2>La IA al Servicio del Ciudadano</h2>
        <p>La inteligencia artificial no es solo para empresas tecnológicas. Es una <strong>herramienta democratizadora</strong> que permite a ciudadanos comunes hacer análisis que antes requerían equipos de especialistas. Y la mayoría de las herramientas son gratuitas.</p>
        <h3>IA para Análisis de Datos</h3>
        <ul>
          <li><strong>ChatGPT / Claude con datos:</strong> Subí tu planilla de datos (CSV) y pedí: "Analizá esta encuesta y decime los 5 hallazgos más importantes." La IA identifica patrones que a vos te llevarían horas.</li>
          <li><strong>Google Sheets + IA:</strong> Funciones como GOOGLETRANSLATE para traducir respuestas, o fórmulas complejas que podés pedirle a la IA que escriba por vos.</li>
          <li><strong>Limpieza automática:</strong> Pedile a la IA que limpie tus datos: estandarice nombres, corrija errores, complete campos vacíos con estimaciones.</li>
        </ul>
        <h3>IA para Comunicación</h3>
        <ul>
          <li><strong>Redacción:</strong> "Transformá estos datos en un comunicado de prensa de 300 palabras." La IA te da un borrador que vos editás.</li>
          <li><strong>Visualización:</strong> "Sugerí el mejor tipo de gráfico para mostrar estos datos." La IA te guía hacia la visualización más efectiva.</li>
          <li><strong>Traducción:</strong> Si necesitás comunicar tus hallazgos en otros idiomas (para organismos internacionales, por ejemplo).</li>
          <li><strong>Resumen:</strong> Si tenés un informe de 50 páginas del municipio, la IA te lo resume en 5 párrafos con los puntos clave.</li>
        </ul>
        <h3>IA para Investigación</h3>
        <ul>
          <li><strong>Análisis de texto:</strong> ¿Qué dicen 500 comentarios de vecinos en una encuesta abierta? La IA los categoriza y extrae temas principales.</li>
          <li><strong>Reconocimiento de patrones:</strong> "¿Hay correlación entre las zonas con más reclamos y las zonas con menos inversión pública?" La IA cruza datos rápidamente.</li>
          <li><strong>Detección de anomalías:</strong> "¿Alguna contratación pública parece anormalmente cara comparada con las demás?" La IA detecta outliers.</li>
        </ul>
        <h3>Precauciones con IA</h3>
        <ul>
          <li><strong>Verificá siempre:</strong> La IA puede equivocarse o inventar datos. Todo output de IA debe verificarse con fuentes originales.</li>
          <li><strong>No subas datos sensibles:</strong> Si tu encuesta tiene datos personales de vecinos, anonimizalos antes de subirlos a cualquier herramienta de IA.</li>
          <li><strong>La IA asiste, no reemplaza:</strong> Tu juicio, tu conocimiento del barrio y tu contexto son irremplazables. La IA es una herramienta, no un oráculo.</li>
        </ul>
        <blockquote>"La IA pone en manos de un vecino con celular la capacidad analítica que hace 10 años requería un equipo de consultores. Eso es democratización del conocimiento en su forma más pura. Usala con responsabilidad y multiplicará tu impacto por cien."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Rendición de Cuentas Basada en Datos',
      description: 'Cómo usar datos para exigir transparencia y combatir la corrupción.',
      content: `
        <h2>Datos Contra la Impunidad</h2>
        <p>La corrupción prospera en la oscuridad. Los datos son luz. Cuando un ciudadano armado con datos demuestra que una obra pública costó el doble de lo que debería, que un funcionario tiene un patrimonio inexplicable, o que los fondos de un programa social nunca llegaron a los beneficiarios, la impunidad retrocede.</p>
        <h3>Herramientas de Rendición de Cuentas</h3>
        <ol>
          <li><strong>Declaraciones juradas:</strong> Los funcionarios públicos están obligados a declarar su patrimonio. Están disponibles en la Oficina Anticorrupción. Compará año a año: si el patrimonio crece más rápido que el sueldo, algo no cierra.</li>
          <li><strong>Boletín Oficial:</strong> Todos los decretos, resoluciones y designaciones se publican en el Boletín Oficial. Es público y buscable. Ahí se esconden las decisiones que no quieren que veas.</li>
          <li><strong>Licitaciones públicas:</strong> Comparar precios de licitaciones similares. Si el mismo tipo de obra cuesta 3 veces más en un municipio que en el vecino, hay que preguntar por qué.</li>
          <li><strong>Ejecución presupuestaria:</strong> Comparar lo presupuestado con lo ejecutado y lo pagado. Si se ejecutó el 100% de publicidad pero solo el 30% de escuelas, las prioridades están claras.</li>
        </ol>
        <h3>Cómo Presentar una Denuncia Basada en Datos</h3>
        <ul>
          <li><strong>Documentá exhaustivamente:</strong> Capturas de pantalla, links, descargas. Los datos online pueden desaparecer.</li>
          <li><strong>Contextualizá:</strong> No alcanza con mostrar un número sospechoso. Mostrá POR QUÉ es sospechoso: comparación con precios de mercado, con otros municipios, con años anteriores.</li>
          <li><strong>Presentá formalmente:</strong> Oficina Anticorrupción, fiscalía, Defensoría del Pueblo, organismos de control provincial. Por escrito, con evidencia adjunta.</li>
          <li><strong>Difundí públicamente:</strong> Si la denuncia formal no avanza, la presión pública a veces sí. Medios, redes, organizaciones aliadas.</li>
        </ul>
        <h3>Organizaciones Aliadas</h3>
        <ul>
          <li><strong>Poder Ciudadano:</strong> Capítulo argentino de Transparency International.</li>
          <li><strong>ACIJ:</strong> Asociación Civil por la Igualdad y la Justicia.</li>
          <li><strong>Directorio Legislativo:</strong> Monitoreo parlamentario con datos.</li>
          <li><strong>CIPPEC:</strong> Centro de políticas públicas con investigaciones basadas en datos.</li>
        </ul>
        <blockquote>"La corrupción le teme a los datos como el vampiro a la luz. Cada dataset que analizás, cada inconsistencia que detectás, cada informe que publicás es un acto de justicia. No necesitás ser fiscal para combatir la corrupción: necesitás datos y el coraje de mostrarlos."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Proyecto de Datos: De Este Curso a la Transformación',
      description: 'Diseñar y ejecutar tu primer proyecto de datos para el bien común.',
      content: `
        <h2>Los Datos Son Tuyos. Usalos.</h2>
        <p>Este curso te dio las herramientas para recolectar, analizar, visualizar y usar datos como instrumento de transformación social. Ahora es momento de ponerlas en práctica con un <strong>proyecto concreto</strong>.</p>
        <h3>3 Proyectos Modelo para Empezar</h3>
        <h4>Proyecto A: Auditoría Ciudadana del Presupuesto</h4>
        <ol>
          <li>Descargá el presupuesto de tu municipio (web oficial o pedido de acceso)</li>
          <li>Identificá las 10 partidas más grandes</li>
          <li>Compará presupuesto vs. ejecución de los últimos 3 años</li>
          <li>Ajustá por inflación para ver la evolución REAL</li>
          <li>Visualizá los hallazgos en gráficos claros</li>
          <li>Publicá un informe de 3 páginas y compartilo con medios y organizaciones</li>
        </ol>
        <h4>Proyecto B: Mapa de Calidad de Servicios del Barrio</h4>
        <ol>
          <li>Definí qué servicios vas a evaluar (agua, luz, transporte, recolección de residuos)</li>
          <li>Diseñá una encuesta breve (Google Forms)</li>
          <li>Relevá 50-100 hogares</li>
          <li>Analizá los datos y creá un mapa temático</li>
          <li>Presentá los resultados al municipio con propuestas concretas</li>
        </ol>
        <h4>Proyecto C: Monitor de Contrataciones Públicas</h4>
        <ol>
          <li>Descargá las licitaciones de tu municipio del último año</li>
          <li>Identificá los 10 mayores proveedores</li>
          <li>Investigá quiénes son (AFIP, registro de empresas)</li>
          <li>Compará precios con valores de mercado</li>
          <li>Buscá patrones: ¿siempre gana el mismo? ¿los precios son razonables?</li>
        </ol>
        <h3>Tu Kit de Herramientas Final</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;">Necesidad</th><th style="padding:8px;border:1px solid #ddd;">Herramienta</th><th style="padding:8px;border:1px solid #ddd;">Costo</th></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Recolección</td><td style="padding:8px;border:1px solid #ddd;">Google Forms</td><td style="padding:8px;border:1px solid #ddd;">Gratis</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Análisis</td><td style="padding:8px;border:1px solid #ddd;">Google Sheets + ChatGPT/Claude</td><td style="padding:8px;border:1px solid #ddd;">Gratis</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Visualización</td><td style="padding:8px;border:1px solid #ddd;">Datawrapper / Canva</td><td style="padding:8px;border:1px solid #ddd;">Gratis</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Mapeo</td><td style="padding:8px;border:1px solid #ddd;">Google My Maps</td><td style="padding:8px;border:1px solid #ddd;">Gratis</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Publicación</td><td style="padding:8px;border:1px solid #ddd;">Blog / Redes / Medios locales</td><td style="padding:8px;border:1px solid #ddd;">Gratis</td></tr>
        </table>
        <h3>El Compromiso</h3>
        <p>Elegí UNO de los tres proyectos. Dáte 60 días. Documentá todo. Publicá los resultados. Compartí con tu comunidad.</p>
        <blockquote>"Los datos para el bien común no son un concepto abstracto. Son TU encuesta, TU mapa, TU gráfico, TU informe mostrando la realidad que otros quieren esconder. Cada dato que generás, analizás y compartís es un ladrillo en la construcción de una democracia que funcione de verdad."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 22');

  const eq22 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq22.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq22[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz22] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Datos para el Bien Común', description: 'Evaluá tu capacidad para usar datos como herramienta de transformación.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q22 = [
    { quizId: quiz22.id, question: '¿Qué ley argentina garantiza el acceso a información pública?', type: 'multiple_choice' as const, options: JSON.stringify(['Ley de Medios', 'Ley 27.275 de Acceso a la Información Pública', 'Ley de Datos Personales', 'Ley de Transparencia Fiscal']), correctAnswer: JSON.stringify(1), explanation: 'La Ley 27.275 garantiza que cualquier ciudadano puede pedir información al Estado, que tiene 15 días hábiles para responder.', points: 2, orderIndex: 1 },
    { quizId: quiz22.id, question: 'Un gráfico de barras es el mejor tipo para mostrar la evolución de un indicador en el tiempo.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Para evolución temporal, el gráfico de líneas es más apropiado. Las barras son mejores para comparar categorías.', points: 1, orderIndex: 2 },
    { quizId: quiz22.id, question: '¿Qué es la ciencia ciudadana?', type: 'multiple_choice' as const, options: JSON.stringify(['Ciencia financiada por los ciudadanos', 'Proyectos donde ciudadanos comunes contribuyen a investigaciones científicas con datos', 'Ciencia aplicada a problemas urbanos', 'Un programa del CONICET']), correctAnswer: JSON.stringify(1), explanation: 'La ciencia ciudadana involucra a ciudadanos comunes en la recolección de datos científicos, como observar aves o medir calidad del agua.', points: 2, orderIndex: 3 },
    { quizId: quiz22.id, question: 'Si el presupuesto de salud subió un 50% pero la inflación fue del 100%, el presupuesto real de salud aumentó.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Con 50% de aumento nominal y 100% de inflación, el presupuesto real CAYÓ un 25%. Siempre ajustar por inflación.', points: 1, orderIndex: 4 },
    { quizId: quiz22.id, question: '¿Cuál es el primer paso del periodismo de datos?', type: 'multiple_choice' as const, options: JSON.stringify(['Descargar datos', 'Formular una pregunta concreta', 'Hacer gráficos', 'Publicar en redes']), correctAnswer: JSON.stringify(1), explanation: 'Todo análisis de datos empieza con una pregunta concreta que guía la búsqueda y el análisis.', points: 2, orderIndex: 5 },
    { quizId: quiz22.id, question: 'Los outputs de inteligencia artificial siempre deben verificarse con fuentes originales.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'La IA puede equivocarse o inventar datos. Todo resultado debe verificarse con las fuentes originales.', points: 1, orderIndex: 6 },
    { quizId: quiz22.id, question: '¿Qué herramienta permite crear mapas temáticos gratuitos con datos geolocalizados?', type: 'multiple_choice' as const, options: JSON.stringify(['Excel', 'Google My Maps', 'PowerPoint', 'WhatsApp']), correctAnswer: JSON.stringify(1), explanation: 'Google My Maps permite crear mapas colaborativos gratuitos con puntos, áreas y datos asociados.', points: 2, orderIndex: 7 },
    { quizId: quiz22.id, question: 'Las declaraciones juradas de los funcionarios públicos argentinos son información confidencial.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Las declaraciones juradas son información pública disponible en la Oficina Anticorrupción.', points: 1, orderIndex: 8 },
  ];
  for (const q of q22) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 22');
}

async function main() {
  console.log('Seeding Road 7: El Taller del Ciudadano...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) { console.log('No users found.'); return; }
    const authorId = author.id;
    await seedCourse20(authorId);
    await seedCourse21(authorId);
    await seedCourse22(authorId);
    console.log('Road 7 seeding complete!');
  } catch (error) { console.error('Error:', error); throw error; }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
