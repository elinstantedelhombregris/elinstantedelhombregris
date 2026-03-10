import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse9(authorId: number) {
  console.log('--- Course 9: Primeros Pasos: Cómo Organizar tu Barrio ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'primeros-pasos-organizar-tu-barrio')).limit(1);

  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Primeros Pasos: Cómo Organizar tu Barrio',
      slug: 'primeros-pasos-organizar-tu-barrio',
      description: 'Aprende las bases prácticas para organizar a tu comunidad barrial. Desde convocar la primera reunión hasta mapear recursos locales, este curso te da las herramientas para dar el primer paso hacia la transformación desde tu cuadra.',
      excerpt: 'Herramientas prácticas para organizar tu barrio desde cero.',
      category: 'community',
      level: 'beginner',
      duration: 150,
      thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      orderIndex: 9,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 9:', course[0].title);
  } else {
    console.log('Found existing course 9:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'Por Qué Organizar tu Barrio: La Arquitectura Invisible',
      description: 'Comprender por qué la organización barrial es la unidad mínima de transformación.',
      content: `
        <h2>La Comunidad No Es un Sentimiento: Es una Arquitectura</h2>
        <p>Cuando hablamos de "comunidad", la mayoría piensa en un sentimiento cálido de pertenencia. Pero la comunidad real es algo mucho más concreto: es una <strong>estructura de relaciones</strong> que permite a un grupo de personas resolver problemas juntas que no podrían resolver solas.</p>
        <p>Argentina tiene una tradición profunda de organización barrial: los clubes de barrio, las sociedades de fomento, las asambleas populares del 2001. Pero esa tradición se ha debilitado. Los barrios se han atomizado, cada familia encerrada en su casa, conectada a pantallas pero desconectada de sus vecinos.</p>
        <h3>¿Por Qué el Barrio?</h3>
        <p>El barrio es la <strong>unidad mínima de cambio sistémico</strong>. Es lo suficientemente pequeño como para que puedas conocer a la gente, y lo suficientemente grande como para generar impacto real. Es donde la teoría se encuentra con el barro.</p>
        <ul>
          <li><strong>Proximidad:</strong> Compartís el mismo territorio, los mismos problemas, los mismos servicios públicos</li>
          <li><strong>Frecuencia:</strong> Te cruzás con tus vecinos todos los días, lo que permite construir confianza</li>
          <li><strong>Tangibilidad:</strong> Los cambios se ven: una plaza limpia, una vereda arreglada, un comedor funcionando</li>
          <li><strong>Escalabilidad:</strong> Lo que funciona en un barrio puede replicarse en otros</li>
        </ul>
        <h3>El Mito del Líder Salvador</h3>
        <p>No necesitás ser un líder carismático ni tener experiencia política. Lo que necesitás es <strong>curiosidad genuina</strong> por tus vecinos y disposición a hacer el trabajo invisible de conectar personas. El Hombre Gris no espera a un líder: se convierte en el tejido que conecta.</p>
        <blockquote>"La transformación no empieza con grandes discursos. Empieza cuando dos vecinos que no se hablaban deciden sentarse a tomar un mate y preguntarse: ¿qué podemos hacer juntos?" — Filosofía del Hombre Gris</blockquote>
        <h3>Lo Que Vas a Aprender en Este Curso</h3>
        <p>En las próximas 10 lecciones vas a adquirir herramientas concretas para:</p>
        <ol>
          <li>Mapear los recursos que ya existen en tu barrio</li>
          <li>Convocar reuniones donde la gente realmente venga</li>
          <li>Facilitar conversaciones productivas</li>
          <li>Transformar quejas en proyectos</li>
          <li>Sostener el grupo más allá del entusiasmo inicial</li>
        </ol>
      `,
      orderIndex: 1,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'El Mapeo de Activos: Descubriendo Lo Que Ya Tenés',
      description: 'Técnica de mapeo de recursos y activos comunitarios existentes en tu barrio.',
      content: `
        <h2>Tu Barrio Tiene Más de Lo Que Pensás</h2>
        <p>El primer error que comete la mayoría cuando quiere organizar su barrio es empezar por los <strong>problemas</strong>: la inseguridad, la basura, las calles rotas. Pero si empezás por los problemas, te vas a deprimir antes de empezar.</p>
        <p>El <strong>mapeo de activos</strong> (Asset-Based Community Development) propone lo contrario: empezá por lo que ya funciona, por lo que ya existe, por las fortalezas que tu barrio ya tiene.</p>
        <h3>Los Cinco Tipos de Activos Barriales</h3>
        <ul>
          <li><strong>Personas:</strong> ¿Quién sabe de plomería, de electricidad, de cocina, de cuidado de chicos? ¿Quién tiene tiempo libre? ¿Quién tiene ganas de hacer algo?</li>
          <li><strong>Asociaciones:</strong> Club de barrio, sociedad de fomento, iglesia, centro de jubilados, grupo de madres, equipo de fútbol. Muchas ya existen pero están desconectadas entre sí.</li>
          <li><strong>Instituciones:</strong> Escuela, salita de salud, comisaría, biblioteca. Tienen recursos (espacios, personal, presupuesto) que a menudo están subutilizados.</li>
          <li><strong>Espacios físicos:</strong> Plazas, esquinas, veredas anchas, terrenos baldíos, salones comunitarios. Son la infraestructura donde sucede la vida barrial.</li>
          <li><strong>Economía local:</strong> Almacenes, kioscos, talleres, ferias. La economía barrial es un tejido de confianza que ya existe.</li>
        </ul>
        <h3>Cómo Hacer el Mapeo</h3>
        <p>Salí a caminar tu barrio con ojos nuevos. Llevá un cuaderno o usá el celular. Anotá todo lo que veas:</p>
        <ol>
          <li>Caminá las calles principales y las laterales. Observá: ¿qué lugares están vivos? ¿dónde se junta la gente?</li>
          <li>Hablá con los comerciantes. Ellos conocen al barrio mejor que nadie.</li>
          <li>Visitá las instituciones. Preguntá: ¿qué actividades hacen? ¿tienen espacio disponible?</li>
          <li>Identificá a los "conectores naturales": esas personas que conocen a todo el mundo.</li>
        </ol>
        <h3>Ejercicio Práctico</h3>
        <p>Dibujá un mapa simple de tu barrio (a mano, en una hoja grande). Marcá con colores distintos: personas clave (rojo), organizaciones (azul), espacios (verde), comercios (amarillo). Este mapa va a ser tu herramienta fundamental durante todo el curso.</p>
        <blockquote>"No se trata de lo que le falta al barrio. Se trata de lo que el barrio ya tiene y todavía no sabe que tiene." — Principio del mapeo de activos</blockquote>
      `,
      orderIndex: 2,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Primera Reunión: Cómo Convocar y Que Vengan',
      description: 'Estrategias probadas para convocar a vecinos a una primera reunión comunitaria.',
      content: `
        <h2>El Arte de la Convocatoria</h2>
        <p>La primera reunión es el momento más difícil. No porque sea complicada en sí, sino porque tenés que vencer la <strong>inercia del aislamiento</strong>. La gente está cansada, desconfiada y con poco tiempo. Tu convocatoria tiene que superar esas tres barreras.</p>
        <h3>Regla de Oro: No Convoques a Una "Reunión"</h3>
        <p>La palabra "reunión" genera rechazo automático. Probá con:</p>
        <ul>
          <li><strong>"Mate en la plaza"</strong> — informal, sin compromiso, con algo rico</li>
          <li><strong>"Charla de vecinos"</strong> — suena más humano que "asamblea"</li>
          <li><strong>"Juntada para conocernos"</strong> — bajo la presión, alta la curiosidad</li>
        </ul>
        <h3>Estrategia de Convocatoria en 3 Capas</h3>
        <ol>
          <li><strong>Capa personal (la más efectiva):</strong> Hablá cara a cara con 5-10 personas. Tocá el timbre, charlá en el almacén, aprovechá cuando te cruzás. La invitación personal tiene 10 veces más poder que un cartel.</li>
          <li><strong>Capa digital:</strong> Grupo de WhatsApp del barrio (si existe), Facebook del barrio, Instagram. Pero ojo: lo digital sin lo personal no funciona.</li>
          <li><strong>Capa pública:</strong> Un cartel en el almacén, en la panadería, en la puerta de la escuela. Simple, con fecha, hora y lugar claros.</li>
        </ol>
        <h3>Logística Que Marca la Diferencia</h3>
        <ul>
          <li><strong>Horario:</strong> Sábado a la mañana o domingo al mediodía funcionan mejor. Evitá horarios laborales.</li>
          <li><strong>Lugar:</strong> La plaza es ideal porque es neutral. Si llueve, un salón comunitario o la puerta de un comercio.</li>
          <li><strong>Comida:</strong> Nunca subestimes el poder de unas facturas y un termo de mate. La comida baja defensas.</li>
          <li><strong>Duración:</strong> Prometé 45 minutos máximo. Y cumplí. Nada espanta más que una reunión interminable.</li>
        </ul>
        <h3>¿Cuánta Gente Es Suficiente?</h3>
        <p>Si vienen 5 personas, es un éxito. En serio. No necesitás multitudes. Necesitás <strong>5 personas comprometidas</strong> que estén dispuestas a volver. De esas 5, van a surgir las 15 del mes siguiente.</p>
        <blockquote>"No cuentes cuántos vinieron. Contá cuántos se fueron con ganas de volver."</blockquote>
      `,
      orderIndex: 3,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'Construir Visión Compartida Sin un Solo Líder',
      description: 'Facilitar la creación de una visión colectiva sin depender de liderazgo único.',
      content: `
        <h2>La Visión No Viene de Arriba: Se Teje Entre Todos</h2>
        <p>Uno de los patrones más destructivos de la cultura argentina es la <strong>dependencia del líder carismático</strong>. Esperamos a que alguien nos diga qué hacer, y cuando esa persona falla (o se corrompe), el grupo se disuelve.</p>
        <p>La organización distribuida propone algo distinto: una visión que emerge de la conversación colectiva y que no depende de ninguna persona individual para sobrevivir.</p>
        <h3>La Dinámica de "Futuros Deseados"</h3>
        <p>En tu segunda o tercera reunión, facilitá este ejercicio:</p>
        <ol>
          <li><strong>Pregunta generadora:</strong> "Si mañana te despertaras y este barrio fuera exactamente como vos soñás, ¿qué verías de diferente?"</li>
          <li>Cada persona comparte su imagen. No se critica ni se debate: se escucha.</li>
          <li>Anotá todo en un papel grande visible para todos.</li>
          <li>Buscá los temas comunes. Van a aparecer: seguridad, limpieza, espacios verdes, actividades para jóvenes, solidaridad.</li>
          <li>Votá los 3 temas prioritarios con puntos adhesivos o marcas.</li>
        </ol>
        <h3>De la Visión a los Principios</h3>
        <p>Una vez que tenés los temas prioritarios, necesitás traducirlos en <strong>principios de funcionamiento</strong>:</p>
        <ul>
          <li>"Decidimos juntos" — nadie toma decisiones por el grupo sin consultar</li>
          <li>"Empezamos chico" — mejor un proyecto pequeño exitoso que uno grande fracasado</li>
          <li>"Rotamos roles" — nadie es imprescindible, todos aprendemos a hacer todo</li>
          <li>"Celebramos los logros" — reconocer el avance mantiene la energía</li>
        </ul>
        <h3>La Trampa del Consenso Perfecto</h3>
        <p>No busques que todos estén 100% de acuerdo en todo. Buscá <strong>consentimiento</strong>: "¿Alguien tiene una objeción seria a esta dirección?" Si nadie objeta fuertemente, avanzá. El consenso perfecto es el enemigo de la acción.</p>
        <blockquote>"El Hombre Gris no es un líder que guía al rebaño. Es la fibra invisible que conecta a individuos libres en un tejido más fuerte que cualquier caudillo."</blockquote>
      `,
      orderIndex: 4,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'WhatsApp y Herramientas Digitales Que No Se Vuelvan Caos',
      description: 'Gestionar comunicación digital barrial sin que se convierta en fuente de conflicto.',
      content: `
        <h2>El Grupo de WhatsApp: Tu Mejor Herramienta o Tu Peor Pesadilla</h2>
        <p>Todo grupo barrial termina en un grupo de WhatsApp. Y todo grupo de WhatsApp barrial tiende al caos: cadenas de noticias falsas, audios interminables, discusiones políticas, memes, y eventualmente alguien se ofende y se va.</p>
        <p>Pero bien gestionado, WhatsApp es la herramienta de comunicación más poderosa que tenés. La mayoría de tus vecinos ya lo usa. No necesitás enseñar nada nuevo.</p>
        <h3>Reglas Básicas del Grupo (Ponerlas Desde el Día 1)</h3>
        <ul>
          <li><strong>El grupo es para coordinar acciones del barrio.</strong> No es para cadenas, noticias ni memes.</li>
          <li><strong>Horario de mensajes:</strong> de 9 a 21 hs. Fuera de ese horario, solo urgencias reales.</li>
          <li><strong>Audios de máximo 1 minuto.</strong> Si necesitás más, escribí o llamá.</li>
          <li><strong>Política partidaria: afuera.</strong> Acá somos vecinos, no militantes.</li>
          <li><strong>Dos admins rotativos</strong> que se ocupan de moderar.</li>
        </ul>
        <h3>La Estructura de Canales</h3>
        <p>Si el grupo crece más de 20 personas, creá subgrupos:</p>
        <ol>
          <li><strong>General:</strong> Anuncios importantes solamente (solo admins publican)</li>
          <li><strong>Coordinación:</strong> Para quienes participan activamente en proyectos</li>
          <li><strong>Social:</strong> Para el mate virtual, los memes y la charla libre</li>
        </ol>
        <h3>Otras Herramientas Útiles</h3>
        <ul>
          <li><strong>Google Forms:</strong> Para encuestas rápidas al barrio</li>
          <li><strong>Google Calendar compartido:</strong> Para coordinar actividades</li>
          <li><strong>Trello o Notion:</strong> Si el grupo es más tech-savvy, para gestionar proyectos</li>
          <li><strong>Canva:</strong> Para hacer flyers de convocatoria</li>
        </ul>
        <p>Pero recordá: <strong>lo digital nunca reemplaza lo presencial</strong>. El grupo de WhatsApp es la herramienta de coordinación, no el espacio de encuentro. El encuentro real sucede en la plaza, en la vereda, tomando mate.</p>
      `,
      orderIndex: 5,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'La Conversación Valiente: Hablar de Lo Que Importa',
      description: 'Técnicas para facilitar conversaciones honestas sobre temas difíciles en comunidad.',
      content: `
        <h2>Más Allá de la Queja: Conversaciones Que Transforman</h2>
        <p>En Argentina sabemos quejarnos. Es casi un deporte nacional. Pero la queja repetida sin dirección se convierte en un <strong>ritual de impotencia</strong> que refuerza la sensación de que nada se puede cambiar.</p>
        <p>La conversación valiente es diferente: es hablar de lo que realmente importa, con honestidad y sin agresión, incluso cuando duele.</p>
        <h3>Las Cuatro Conversaciones Valientes</h3>
        <ol>
          <li><strong>La conversación sobre lo que nos duele:</strong> ¿Qué no funciona? ¿Qué nos frustra? Permitir que se exprese, pero con un límite de tiempo (15 minutos máximo).</li>
          <li><strong>La conversación sobre lo que soñamos:</strong> ¿Cómo sería si funcionara? ¿Qué queremos para nuestros hijos?</li>
          <li><strong>La conversación sobre lo que podemos hacer:</strong> De todo lo que soñamos, ¿qué está en nuestras manos? ¿Qué podemos empezar mañana?</li>
          <li><strong>La conversación sobre lo que nos comprometemos:</strong> ¿Quién hace qué, para cuándo?</li>
        </ol>
        <h3>Reglas de la Conversación Valiente</h3>
        <ul>
          <li><strong>Hablar en primera persona:</strong> "Yo siento que..." en vez de "La gente piensa que..."</li>
          <li><strong>Escuchar sin preparar respuesta:</strong> Mientras el otro habla, solo escuchá.</li>
          <li><strong>No hay ideas tontas:</strong> Toda propuesta merece ser escuchada.</li>
          <li><strong>Desacuerdo sin agresión:</strong> "No estoy de acuerdo con esa idea" es diferente de "Estás equivocado".</li>
          <li><strong>Confidencialidad:</strong> Lo que se habla en el grupo, queda en el grupo.</li>
        </ul>
        <h3>El Rol del Facilitador</h3>
        <p>El facilitador no es el líder. Es quien cuida el proceso: da la palabra, controla los tiempos, se asegura de que todos hablen (no solo los más extrovertidos), y resume los acuerdos. Este rol debe rotar en cada encuentro.</p>
        <blockquote>"La amabilidad radical no es debilidad. Es la fuerza de decir la verdad sin destruir al otro en el proceso."</blockquote>
      `,
      orderIndex: 6,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'De la Queja al Proyecto: Transformar Frustración en Acción',
      description: 'Metodología para convertir las quejas barriales recurrentes en proyectos concretos.',
      content: `
        <h2>La Alquimia Comunitaria: De la Queja al Proyecto</h2>
        <p>Detrás de cada queja hay una <strong>necesidad no resuelta</strong>, y detrás de cada necesidad hay un <strong>proyecto posible</strong>. La clave es aprender a hacer esa traducción.</p>
        <h3>El Método de las 5 Transformaciones</h3>
        <ol>
          <li><strong>Queja → Problema concreto:</strong> "Esto es un desastre" → "La plaza de la esquina tiene los juegos rotos desde hace 6 meses"</li>
          <li><strong>Problema → Necesidad:</strong> "Los juegos están rotos" → "Los chicos del barrio necesitan un espacio seguro para jugar"</li>
          <li><strong>Necesidad → Objetivo:</strong> "Necesitan un espacio" → "Queremos reparar los 4 juegos de la plaza para el mes que viene"</li>
          <li><strong>Objetivo → Acciones:</strong> "Reparar juegos" → Listar materiales, buscar voluntarios con herramientas, pedir permiso al municipio, organizar jornada de trabajo</li>
          <li><strong>Acciones → Responsables y fechas:</strong> "Juan consigue la pintura para el viernes. María habla con el municipio el lunes."</li>
        </ol>
        <h3>Criterios Para Elegir Tu Primer Proyecto</h3>
        <p>Tu primer proyecto comunitario debe cumplir estas condiciones:</p>
        <ul>
          <li><strong>Pequeño:</strong> Que se pueda completar en 2-4 semanas</li>
          <li><strong>Visible:</strong> Que los vecinos vean el resultado</li>
          <li><strong>Participativo:</strong> Que requiera al menos 5 personas</li>
          <li><strong>Exitoso:</strong> Que tenga altas chances de funcionar</li>
        </ul>
        <p>Ejemplos de buenos primeros proyectos: limpiar una esquina, pintar una pared, armar una huerta comunitaria, organizar una feria de vecinos, hacer una jornada de juegos para chicos.</p>
        <h3>¿Por Qué Empezar Chico?</h3>
        <p>Porque el <strong>primer éxito genera confianza</strong>. Y la confianza es el recurso más escaso en Argentina. Cuando la gente ve que algo funciona, que se puede hacer algo juntos, la energía se multiplica. Ese primer proyecto chico es la semilla de todo lo que viene después.</p>
        <blockquote>"No empieces por cambiar el país. Empezá por cambiar tu cuadra. El país es la suma de todas las cuadras."</blockquote>
      `,
      orderIndex: 7,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'Gestión de Conflictos en el Grupo Inicial',
      description: 'Cómo manejar los conflictos inevitables que surgen en grupos barriales.',
      content: `
        <h2>El Conflicto Va a Llegar: Preparate</h2>
        <p>Si tu grupo barrial no tiene conflictos, probablemente no está haciendo nada importante. El conflicto es señal de que hay <strong>diversidad de opiniones y pasión genuina</strong>. El problema no es el conflicto sino cómo lo manejamos.</p>
        <h3>Los 4 Conflictos Más Comunes en Grupos Barriales</h3>
        <ol>
          <li><strong>El que quiere mandar:</strong> Alguien que empieza a tomar decisiones solo, sin consultar. Solución: recordar los acuerdos de funcionamiento y rotar roles.</li>
          <li><strong>El que critica todo pero no hace nada:</strong> Tiene opinión sobre todo pero nunca se ofrece a hacer algo. Solución: "¿Vos qué proponés? ¿Te animás a encargarte?"</li>
          <li><strong>La pelea política:</strong> Alguien mete la grieta partidaria en el grupo. Solución: recordar que en el grupo somos vecinos, no militantes.</li>
          <li><strong>El abandono silencioso:</strong> Gente que deja de venir sin decir por qué. Solución: llamar personalmente y preguntar con genuina curiosidad.</li>
        </ol>
        <h3>Protocolo Básico de Resolución</h3>
        <ul>
          <li><strong>Paso 1:</strong> Nombrar el conflicto. "Parece que hay un desacuerdo sobre X. ¿Podemos hablarlo?"</li>
          <li><strong>Paso 2:</strong> Escuchar ambas partes sin interrumpir. Usar un objeto que se pasa (el que tiene el objeto, habla).</li>
          <li><strong>Paso 3:</strong> Buscar la necesidad detrás de la posición. "¿Qué necesitás realmente?"</li>
          <li><strong>Paso 4:</strong> Proponer soluciones que atiendan ambas necesidades.</li>
          <li><strong>Paso 5:</strong> Si no hay acuerdo, votar. La mayoría decide, la minoría acepta.</li>
        </ul>
        <h3>La Regla de las 24 Horas</h3>
        <p>Cuando un conflicto se pone caliente: nadie responde en el momento. Esperá 24 horas. Lo que parece urgente hoy, mañana se ve distinto. Esta regla aplica especialmente a los grupos de WhatsApp, donde los conflictos escalan en segundos.</p>
      `,
      orderIndex: 8,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'Rituales y Espacios de Encuentro',
      description: 'Crear rituales y espacios regulares que sostengan al grupo barrial en el tiempo.',
      content: `
        <h2>Lo Que Sostiene a un Grupo No Son las Ideas: Son los Rituales</h2>
        <p>Las organizaciones barriales que sobreviven tienen algo en común: <strong>rituales regulares</strong> que la gente espera con anticipación. No son reuniones de trabajo (aunque esas también son necesarias). Son momentos de encuentro que alimentan el vínculo humano.</p>
        <h3>Rituales Que Funcionan en Argentina</h3>
        <ul>
          <li><strong>El mate de los sábados:</strong> Cada sábado a las 10, en la plaza. Sin agenda. Solo encontrarse, charlar, ponerse al día. El ritual más simple y más poderoso.</li>
          <li><strong>La cena comunitaria mensual:</strong> Cada familia trae un plato. Se comparte la mesa. Es donde se construye la confianza profunda.</li>
          <li><strong>La asamblea mensual:</strong> Una vez al mes, con agenda clara y tiempo limitado, se revisa qué se hizo, qué falta, qué viene.</li>
          <li><strong>La celebración de logros:</strong> Cada vez que se completa un proyecto, se celebra. Un asado, una fiesta en la plaza. El reconocimiento público es combustible comunitario.</li>
          <li><strong>El cumpleaños colectivo:</strong> Una vez al mes, se festejan todos los cumpleaños del mes juntos.</li>
        </ul>
        <h3>El Espacio Físico Importa</h3>
        <p>Tu grupo necesita un <strong>lugar propio</strong>, aunque sea simbólico. Puede ser una esquina de la plaza, un salón prestado, la vereda de un comercio amigo. Ese lugar se convierte en el "territorio" del grupo, y el territorio genera identidad.</p>
        <h3>La Frecuencia Es Más Importante Que la Intensidad</h3>
        <p>Es mejor juntarse 30 minutos cada semana que 4 horas una vez al mes. La frecuencia construye hábito, y el hábito construye pertenencia. Las organizaciones que se juntan solo "cuando hay algo importante" terminan juntándose solo para las crisis.</p>
        <blockquote>"Un barrio organizado se reconoce no por sus asambleas, sino por sus rituales de encuentro. Donde la gente se junta por placer, la acción colectiva florece naturalmente."</blockquote>
      `,
      orderIndex: 9,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan de Acción Barrial: Primeros 90 Días',
      description: 'Crear un plan concreto de organización barrial para los próximos tres meses.',
      content: `
        <h2>De la Teoría a la Calle: Tu Plan de 90 Días</h2>
        <p>Llegaste al final del curso con herramientas concretas. Ahora es momento de armar tu <strong>plan de acción personal</strong> para los próximos 90 días. No necesitás hacer todo: necesitás empezar.</p>
        <h3>Mes 1: Explorar y Conectar</h3>
        <ul>
          <li><strong>Semana 1-2:</strong> Completá tu mapeo de activos barriales. Caminá el barrio, hablá con comerciantes, identificá los conectores naturales.</li>
          <li><strong>Semana 3:</strong> Invitá personalmente a 5-10 personas a un mate en la plaza. Usá la estrategia de convocatoria de tres capas.</li>
          <li><strong>Semana 4:</strong> Realizá tu primer encuentro. No busques resultados concretos: buscá que la gente se conozca y tenga ganas de volver.</li>
        </ul>
        <h3>Mes 2: Visión y Primer Proyecto</h3>
        <ul>
          <li><strong>Semana 5-6:</strong> Facilitá la dinámica de "futuros deseados". Identificá las 3 prioridades del grupo.</li>
          <li><strong>Semana 7:</strong> Elegí tu primer proyecto usando los criterios (pequeño, visible, participativo, exitoso).</li>
          <li><strong>Semana 8:</strong> Planificá la ejecución con responsables y fechas claras.</li>
        </ul>
        <h3>Mes 3: Ejecutar y Celebrar</h3>
        <ul>
          <li><strong>Semana 9-10:</strong> Ejecutá el proyecto. Documentá con fotos y videos.</li>
          <li><strong>Semana 11:</strong> Celebrá el logro. Invitá a nuevos vecinos a la celebración.</li>
          <li><strong>Semana 12:</strong> Reflexioná con el grupo: ¿Qué aprendimos? ¿Qué sigue?</li>
        </ul>
        <h3>Indicadores de Éxito</h3>
        <p>Al final de los 90 días, si podés responder "sí" a estas preguntas, vas muy bien:</p>
        <ol>
          <li>¿Tengo un grupo de al menos 5 personas que se juntan regularmente?</li>
          <li>¿Completamos al menos un proyecto concreto?</li>
          <li>¿Hay al menos un ritual de encuentro establecido?</li>
          <li>¿Tenemos una forma de comunicación que funciona?</li>
        </ol>
        <blockquote>"El instante del Hombre Gris no es un momento lejano. Es cada vez que un vecino golpea la puerta de al lado y dice: '¿Qué podemos hacer juntos?'"</blockquote>
      `,
      orderIndex: 10,
      type: 'text' as const,
      duration: 15,
      isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 9');

  // Quiz
  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Primeros Pasos para Organizar tu Barrio',
    description: 'Evaluá tu comprensión de las herramientas básicas de organización barrial.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿Qué propone el mapeo de activos como punto de partida?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Listar todos los problemas del barrio', 'Identificar los recursos y fortalezas que ya existen', 'Hacer una encuesta de satisfacción', 'Contactar al municipio']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El mapeo de activos propone empezar por las fortalezas existentes, no por los problemas.',
      points: 2,
      orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: '¿Cuántas personas son suficientes para considerar exitosa una primera reunión barrial?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Al menos 50', 'Al menos 20', 'Al menos 5', 'Al menos 100']),
      correctAnswer: JSON.stringify(2),
      explanation: '5 personas comprometidas que quieran volver es un excelente punto de partida.',
      points: 2,
      orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: 'La conversación valiente busca eliminar todo conflicto del grupo.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'La conversación valiente no elimina el conflicto sino que lo canaliza productivamente.',
      points: 1,
      orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es el criterio más importante para elegir el primer proyecto comunitario?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Que sea el más urgente', 'Que sea pequeño y con altas chances de éxito', 'Que requiera mucha inversión', 'Que sea innovador']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El primer éxito genera confianza, que es el recurso más escaso. Por eso debe ser pequeño y exitoso.',
      points: 2,
      orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la diferencia entre consenso y consentimiento en decisiones grupales?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Son lo mismo', 'Consenso requiere 100% de acuerdo; consentimiento requiere que nadie tenga objeciones graves', 'Consentimiento es más lento que consenso', 'Consenso es para grupos chicos, consentimiento para grandes']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El consentimiento pregunta "¿alguien tiene una objeción seria?" en vez de buscar que todos estén entusiasmados.',
      points: 2,
      orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: 'La frecuencia de encuentros es más importante que su duración para sostener un grupo.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Es mejor juntarse 30 minutos cada semana que 4 horas una vez al mes. La frecuencia construye hábito.',
      points: 1,
      orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: '¿Qué es la "regla de las 24 horas" para conflictos?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Resolver todo en 24 horas', 'No responder en caliente, esperar 24 horas', 'Reunirse dentro de 24 horas', 'Expulsar a quien no responda en 24 horas']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Cuando un conflicto se pone caliente, nadie responde en el momento. Se espera 24 horas para ganar perspectiva.',
      points: 2,
      orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la capa de convocatoria más efectiva para la primera reunión?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Publicar en redes sociales', 'Poner carteles en comercios', 'Invitación personal cara a cara', 'Enviar un email masivo']),
      correctAnswer: JSON.stringify(2),
      explanation: 'La invitación personal tiene 10 veces más poder que cualquier otro medio de convocatoria.',
      points: 2,
      orderIndex: 8,
    },
  ];

  for (const q of questions) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions.length, 'questions for course 9');
}

async function seedCourse10(authorId: number) {
  console.log('--- Course 10: Arquitectura de Organizaciones Distribuidas ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'arquitectura-organizaciones-distribuidas')).limit(1);

  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Arquitectura de Organizaciones Distribuidas',
      slug: 'arquitectura-organizaciones-distribuidas',
      description: 'Diseña organizaciones que no dependan de un solo líder. Sociocracia, holacracia y modelos distribuidos adaptados a la realidad argentina, con protocolos de decisión, rotación de roles y prevención del agotamiento.',
      excerpt: 'Diseña organizaciones resilientes que sobrevivan a sus fundadores.',
      category: 'community',
      level: 'intermediate',
      duration: 200,
      thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
      orderIndex: 10,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 10:', course[0].title);
  } else {
    console.log('Found existing course 10:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Problema del Líder Insustituible',
      description: 'Por qué las organizaciones que dependen de una sola persona están condenadas a morir.',
      content: `
        <h2>El Caudillo Comunitario: Un Patrón Que Debemos Romper</h2>
        <p>Argentina tiene un patrón cultural profundo: el <strong>líder insustituible</strong>. Desde los caudillos del siglo XIX hasta los referentes barriales de hoy, repetimos la misma estructura: una persona carismática concentra las decisiones, los contactos y el conocimiento. Cuando esa persona se va, la organización colapsa.</p>
        <h3>Señales de Alarma</h3>
        <ul>
          <li>Una sola persona tiene todos los contactos en su celular personal</li>
          <li>Las reuniones no funcionan si "el referente" no está</li>
          <li>Nadie sabe cómo se manejan las finanzas excepto una persona</li>
          <li>Las decisiones se toman en conversaciones privadas, no en espacios colectivos</li>
          <li>Cuando alguien propone algo diferente, se lo mira como "desleal"</li>
        </ul>
        <h3>Por Qué Pasa Esto</h3>
        <p>No es maldad. Es un <strong>atajo cognitivo</strong>: es más fácil seguir a alguien que construir procesos colectivos. El líder concentrador a menudo es la persona más comprometida, la que más trabaja. Pero ese compromiso individual se convierte en una <strong>dependencia sistémica</strong>.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en una organización barrial, club o grupo comunitario de tu zona que hayas conocido. ¿Había una persona que concentraba todo? ¿Qué pasó cuando esa persona se fue o se cansó? Anotá las señales de alarma que identificás en retrospectiva.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>El Costo Real</h3>
        <p>Las organizaciones centradas en un líder sufren de:</p>
        <ol>
          <li><strong>Fragilidad:</strong> Una enfermedad, una mudanza o un conflicto personal desactiva todo</li>
          <li><strong>Limitación:</strong> La organización no puede crecer más allá de la capacidad de una persona</li>
          <li><strong>Corrupción potencial:</strong> El poder concentrado tiende a corromperse, incluso con buenas intenciones</li>
          <li><strong>Desmotivación:</strong> Los demás se sienten ejecutores, no co-creadores</li>
        </ol>
        <blockquote>"La verdadera prueba de una organización no es lo que logra con su mejor líder, sino lo que logra sin ningún líder en particular."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Sociocracia 101: Decisiones por Consentimiento',
      description: 'Introducción al modelo sociocrático de gobernanza y toma de decisiones.',
      content: `
        <h2>Sociocracia: El Sistema de los Círculos</h2>
        <p>La sociocracia es un <strong>sistema de gobernanza</strong> desarrollado en los Países Bajos que permite a las organizaciones tomar decisiones efectivas sin concentrar el poder en una sola persona. Es especialmente útil para organizaciones comunitarias porque respeta la diversidad de voces.</p>
        <h3>Los 4 Principios Fundamentales</h3>
        <ol>
          <li><strong>Decisión por consentimiento:</strong> No se busca que todos digan "sí". Se busca que nadie diga "tengo una objeción razonada". Es más rápido que el consenso y más inclusivo que la votación.</li>
          <li><strong>Organización en círculos:</strong> Cada equipo es un círculo con autoridad para tomar decisiones en su dominio. No hay pirámide: hay red de círculos.</li>
          <li><strong>Doble enlace:</strong> Cada círculo envía dos representantes al círculo superior: uno elegido por el círculo superior y otro elegido por el propio círculo. Esto garantiza comunicación bidireccional.</li>
          <li><strong>Elección sin candidatos:</strong> Los roles se asignan mediante un proceso de nominación abierta donde cada persona explica por qué propone a alguien.</li>
        </ol>
        <h3>El Proceso de Consentimiento en la Práctica</h3>
        <ul>
          <li><strong>Presentación:</strong> Alguien presenta una propuesta</li>
          <li><strong>Preguntas de clarificación:</strong> Solo para entender, no para debatir</li>
          <li><strong>Ronda de reacciones:</strong> Cada persona comparte su primera impresión</li>
          <li><strong>Enmiendas:</strong> Se ajusta la propuesta según las reacciones</li>
          <li><strong>Ronda de consentimiento:</strong> "¿Tenés alguna objeción razonada?" Si nadie objeta, se aprueba</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en la última decisión grupal en la que participaste (en el trabajo, en un grupo de amigos, en tu familia). ¿Se usó votación, consenso, o decidió una sola persona? ¿Cómo habría cambiado el resultado si se hubiera usado el proceso de consentimiento que acabás de leer?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Adaptación al Contexto Argentino</h3>
        <p>La sociocracia pura puede ser demasiado formal para un grupo barrial. Lo esencial es adoptar el <strong>principio de consentimiento</strong> y la <strong>organización en círculos</strong>, adaptando la formalidad al nivel del grupo.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no impone su visión: facilita que la visión emerja del círculo. Jugamos el mismo juego cuando cada voz cuenta igual."</em></p>
        </blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Holacracia Adaptada: Roles, No Personas',
      description: 'Separar los roles de las personas para crear organizaciones más flexibles.',
      content: `
        <h2>Pensá en Roles, No en Personas</h2>
        <p>En la mayoría de las organizaciones barriales, las personas <strong>son</strong> sus roles: "María es la tesorera", "Juan es el que habla con el municipio". Cuando María se va, nadie sabe manejar la plata. Cuando Juan se enoja, se pierde el contacto institucional.</p>
        <p>La holacracia propone separar a la persona del rol. Una persona puede tener varios roles, y un rol puede rotar entre personas.</p>
        <h3>Roles Esenciales para una Organización Barrial</h3>
        <ul>
          <li><strong>Facilitador/a:</strong> Conduce las reuniones, da la palabra, cuida los tiempos. Rota cada mes.</li>
          <li><strong>Secretario/a:</strong> Toma notas, envía resúmenes, mantiene los registros. Rota cada mes.</li>
          <li><strong>Tesorero/a:</strong> Maneja el dinero con transparencia total. Rotación semestral con período de transición.</li>
          <li><strong>Comunicador/a:</strong> Maneja los canales digitales y la difusión. Puede ser compartido.</li>
          <li><strong>Vinculador/a:</strong> Conecta con otras organizaciones e instituciones. Puede haber varios.</li>
        </ul>
        <h3>El Proceso de Asignación de Roles</h3>
        <ol>
          <li>Se describe el rol: qué hace, qué autoridad tiene, qué se espera</li>
          <li>Cada persona nomina a alguien (puede nominarse a sí misma) y explica por qué</li>
          <li>Se escucha a la persona nominada: ¿acepta? ¿tiene condiciones?</li>
          <li>Se decide por consentimiento</li>
          <li>Se establece un período de revisión (3-6 meses)</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Si tu organización barrial tuviera que funcionar mañana sin vos, ¿qué roles quedarían vacíos? Listá 3 tareas que hacés regularmente y pensá: ¿quién podría asumirlas si las documentaras en una hoja simple?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>La Regla de Oro: Documentar Todo</h3>
        <p>Cada rol debe tener un <strong>documento simple</strong> que describa: qué hace, qué puede decidir solo, qué debe consultar, y cómo se hace la transición. Así cuando alguien deja el rol, el siguiente puede retomarlo sin empezar de cero.</p>
        <blockquote>"En una organización sana, nadie es imprescindible y todos son importantes."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'El Círculo como Estructura Base',
      description: 'Implementar la estructura circular como unidad organizativa fundamental.',
      content: `
        <h2>Círculos: La Geometría de la Igualdad</h2>
        <p>Hay una razón por la que las culturas de todo el mundo se reúnen en círculo: en un círculo, <strong>todos ven a todos</strong>. No hay cabecera, no hay fondo. Es la estructura física que mejor expresa la igualdad.</p>
        <h3>Anatomía de un Círculo Organizativo</h3>
        <p>Un círculo no es simplemente un grupo de personas. Es una <strong>estructura con reglas claras</strong>:</p>
        <ul>
          <li><strong>Propósito definido:</strong> ¿Para qué existe este círculo? "Mejorar la plaza" es un propósito. "Juntarnos" no lo es.</li>
          <li><strong>Dominio claro:</strong> ¿Sobre qué tiene autoridad? El círculo de la plaza decide sobre la plaza, no sobre el presupuesto general.</li>
          <li><strong>Membresía definida:</strong> ¿Quiénes son parte? ¿Cómo se entra? ¿Cómo se sale?</li>
          <li><strong>Reuniones regulares:</strong> Con frecuencia y formato predecibles.</li>
          <li><strong>Roles asignados:</strong> Al menos facilitador y secretario, rotativos.</li>
        </ul>
        <h3>Estructura de Múltiples Círculos</h3>
        <p>Cuando la organización crece, un solo círculo se vuelve inmanejable. La solución es crear <strong>subcírculos por tema</strong>:</p>
        <ol>
          <li><strong>Círculo general:</strong> Visión, estrategia, coordinación entre subcírculos</li>
          <li><strong>Círculos de proyecto:</strong> Cada proyecto activo tiene su círculo (plaza, huerta, seguridad)</li>
          <li><strong>Círculos de soporte:</strong> Finanzas, comunicación, logística</li>
        </ol>
        <p>Cada subcírculo envía un representante al círculo general. Así la información fluye y las decisiones se descentralizan.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Dibujá rápidamente en un papel la estructura de círculos que tendría sentido para tu barrio o comunidad. ¿Cuántos subcírculos necesitarías? ¿Qué tema abordaría cada uno? ¿Quiénes serían buenos representantes de cada círculo en el círculo general?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Ejemplo Práctico</h3>
        <p>Una organización barrial de 25 personas podría tener: un círculo general (7 personas: 5 representantes + facilitador + secretario), un círculo "Plaza Viva" (8 personas), un círculo "Huerta Comunitaria" (6 personas), y un círculo "Feria del Barrio" (8 personas). Algunas personas participan en más de un círculo.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"En el círculo nadie está atrás y nadie está adelante. Jugamos el mismo juego porque compartimos el mismo centro."</em></p>
        </blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Protocolos de Decisión para Contexto Argentino',
      description: 'Adaptar modelos internacionales de decisión al estilo cultural argentino.',
      content: `
        <h2>Decidir Juntos Sin Volverse Locos</h2>
        <p>Los modelos internacionales de decisión colectiva son elegantes en la teoría, pero chocan con la <strong>cultura argentina real</strong>: somos apasionados, interrumpimos, nos vamos por las ramas, y tendemos a personalizar los desacuerdos. No se trata de cambiar nuestra cultura sino de diseñar protocolos que funcionen con ella.</p>
        <h3>El Menú de Decisiones</h3>
        <p>No todas las decisiones necesitan el mismo proceso. Tené un <strong>menú</strong> y elegí según la situación:</p>
        <ul>
          <li><strong>Decisión individual con consulta:</strong> Para temas operativos. "Voy a comprar la pintura azul. ¿Alguien tiene objeción?" Si en 24 horas nadie objeta, se ejecuta.</li>
          <li><strong>Consentimiento rápido:</strong> Para la mayoría de las decisiones grupales. Se presenta, se pregunta objeciones, si no hay se avanza.</li>
          <li><strong>Votación simple:</strong> Cuando hay dos opciones claras y el grupo está dividido. Mayoría simple decide.</li>
          <li><strong>Deliberación profunda:</strong> Solo para decisiones que afectan la identidad o dirección del grupo. Se toma todo el tiempo necesario.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Repasá el "menú de decisiones" que acabás de leer. Pensá en las últimas 3 decisiones que tomó tu grupo o equipo. ¿Qué tipo de proceso usaron? ¿Habrían funcionado mejor con otro método del menú? Anotá cuál usarías para cada una.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>La Trampa Argentina: La Discusión Infinita</h3>
        <p>En Argentina amamos debatir. Y eso es hermoso, pero puede paralizar a un grupo. Reglas para evitarlo:</p>
        <ol>
          <li><strong>Tiempo máximo de debate:</strong> Antes de empezar, se define cuánto dura. "Tenemos 20 minutos para decidir esto."</li>
          <li><strong>Rondas estructuradas:</strong> Cada persona habla una vez antes de que alguien hable dos veces.</li>
          <li><strong>Separar información de opinión:</strong> Primero los hechos, después los pareceres.</li>
          <li><strong>Si no hay acuerdo en el tiempo:</strong> Se posterga una semana. Muchas veces la solución aparece sola.</li>
        </ol>
        <blockquote>"La mejor decisión no es la perfecta. Es la suficientemente buena tomada a tiempo."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Rotación de Liderazgo: El Poder como Servicio',
      description: 'Implementar sistemas de rotación que distribuyan el poder efectivamente.',
      content: `
        <h2>El Poder Que Rota No Se Corrompe</h2>
        <p>La rotación de liderazgo no es solo una buena idea democrática: es una <strong>tecnología organizacional</strong> que previene la concentración de poder, desarrolla capacidades en más personas y renueva la energía del grupo.</p>
        <h3>Qué Rota y Qué No</h3>
        <ul>
          <li><strong>Rota mensualmente:</strong> Facilitación de reuniones, moderación de WhatsApp</li>
          <li><strong>Rota trimestralmente:</strong> Comunicación externa, coordinación de proyectos</li>
          <li><strong>Rota semestralmente:</strong> Tesorería (con período de transición), representación institucional</li>
          <li><strong>No rota (pero se renueva anualmente):</strong> Roles que requieren relaciones de largo plazo con instituciones</li>
        </ul>
        <h3>El Protocolo de Transición</h3>
        <p>La rotación sin transición es un desastre. Cada cambio de rol debe incluir:</p>
        <ol>
          <li><strong>Documentación:</strong> La persona saliente escribe qué hizo, qué queda pendiente, qué contactos clave hay</li>
          <li><strong>Acompañamiento:</strong> Un mes donde ambas personas (saliente y entrante) están activas</li>
          <li><strong>Retrospectiva:</strong> ¿Qué funcionó? ¿Qué cambiarías? ¿Qué aprendiste?</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en un rol que hoy concentrás vos (o alguien de tu grupo). Escribí los 3 pasos concretos del protocolo de transición que usarías para pasarlo a otra persona en los próximos 30 días. ¿Qué documentarías primero?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Resistencias Comunes y Cómo Manejarlas</h3>
        <ul>
          <li><strong>"Pero yo lo hago mejor":</strong> Probablemente sí, porque tuviste más práctica. Dejá que otros practiquen.</li>
          <li><strong>"Nadie quiere asumir":</strong> Empezá con roles pequeños y bien definidos. La confianza se construye con éxitos chicos.</li>
          <li><strong>"Es ineficiente":</strong> A corto plazo sí. A largo plazo, una organización con 10 personas capaces es infinitamente más eficiente que una con 1.</li>
        </ul>
        <blockquote>"El verdadero líder es el que trabaja para volverse innecesario."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Resolución de Conflictos en Organizaciones Horizontales',
      description: 'Manejar conflictos cuando no hay un jefe que decida.',
      content: `
        <h2>Sin Jefe Que Decida: Resolver Conflictos Entre Iguales</h2>
        <p>En una organización jerárquica, cuando hay conflicto el jefe decide. En una organización horizontal, necesitás <strong>protocolos</strong> porque no hay autoridad final. Esto es más difícil pero produce resoluciones más duraderas.</p>
        <h3>Niveles de Intervención</h3>
        <ol>
          <li><strong>Nivel 1 - Conversación directa:</strong> Las dos personas hablan solas. La mayoría de los conflictos se resuelven acá si hay buena voluntad.</li>
          <li><strong>Nivel 2 - Mediación:</strong> Si la conversación directa falla, una tercera persona neutral facilita el diálogo.</li>
          <li><strong>Nivel 3 - Panel:</strong> Si la mediación falla, un grupo de 3 personas escucha ambas partes y propone una solución.</li>
          <li><strong>Nivel 4 - Decisión grupal:</strong> Si nada funciona, el grupo completo debate y decide por votación.</li>
        </ol>
        <h3>Herramientas de Mediación Práctica</h3>
        <ul>
          <li><strong>La silla vacía:</strong> Cada persona se sienta en la silla del otro y expresa lo que cree que el otro siente. Genera empatía instantánea.</li>
          <li><strong>Los intereses detrás de las posiciones:</strong> "Vos querés X, pero ¿qué necesitás realmente?" A menudo dos posiciones opuestas comparten el mismo interés de fondo.</li>
          <li><strong>El acuerdo parcial:</strong> "¿En qué sí estamos de acuerdo?" Empezar por lo compartido cambia el tono de la conversación.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Recordá un conflicto reciente en algún grupo del que participás. ¿En qué nivel de los cuatro se resolvió (conversación directa, mediación, panel, decisión grupal)? ¿Habría sido mejor abordarlo en un nivel diferente? ¿Qué herramienta de mediación de las mencionadas podrías haber usado?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Cuando Alguien Debe Irse</h3>
        <p>A veces, a pesar de todos los esfuerzos, alguien no encaja en el grupo o genera daño sistemático. Tener un <strong>proceso claro de desvinculación</strong> protege tanto al grupo como a la persona. Nunca debe ser una decisión unilateral.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El conflicto no es el enemigo de la comunidad. El silencio ante la injusticia sí lo es. Jugamos el mismo juego cuando nos atrevemos a hablar con honestidad y escuchar con respeto."</em></p>
        </blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Prevención del Burnout en Voluntarios',
      description: 'Estrategias para prevenir el agotamiento en activistas y voluntarios comunitarios.',
      content: `
        <h2>El Fuego Que Se Apaga: Prevenir el Agotamiento</h2>
        <p>El burnout activista es una epidemia silenciosa. Las personas más comprometidas con el cambio son las que más se queman. Y cuando se van, se llevan consigo conocimiento, contactos y energía que el grupo tarda años en reconstruir.</p>
        <h3>Señales de Burnout Comunitario</h3>
        <ul>
          <li>Irritabilidad creciente en reuniones</li>
          <li>Empezar a faltar "por cansancio"</li>
          <li>Cinismo: "Esto no va a cambiar nada"</li>
          <li>Sentirse culpable por descansar</li>
          <li>Resentimiento hacia quienes "hacen menos"</li>
        </ul>
        <h3>Causas Estructurales (No Individuales)</h3>
        <p>El burnout no es un problema personal: es un <strong>problema de diseño organizacional</strong>:</p>
        <ol>
          <li><strong>Concentración de tareas:</strong> Pocos hacen mucho, muchos hacen poco</li>
          <li><strong>Falta de límites:</strong> No hay horarios, no hay "vacaciones" del voluntariado</li>
          <li><strong>Falta de reconocimiento:</strong> Se da por sentado el trabajo de quienes más aportan</li>
          <li><strong>Expectativas irreales:</strong> Querer cambiar todo ya</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Hacé un chequeo honesto: ¿cuántas de las señales de burnout que leíste reconocés en vos o en alguien de tu grupo? Anotá una acción concreta que podrías implementar esta semana para prevenir el agotamiento (tuyo o de otro/a).</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Protocolos de Protección</h3>
        <ul>
          <li><strong>Regla del 70%:</strong> Nunca uses más del 70% de tu capacidad. Dejá margen para imprevistos y para tu vida personal.</li>
          <li><strong>Rotación obligatoria:</strong> Nadie hace lo mismo más de 6 meses seguidos.</li>
          <li><strong>Check-in emocional:</strong> Cada reunión empieza con "¿Cómo estás?" y se escucha la respuesta real.</li>
          <li><strong>Celebración regular:</strong> Reconocer públicamente el aporte de cada persona.</li>
          <li><strong>Permiso para retirarse:</strong> Irse no es traicionar. Es cuidarse. Y se puede volver.</li>
        </ul>
        <blockquote>"No podés prender fuego al mundo si vos mismo sos ceniza."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Estatutos Que Previenen la Concentración de Poder',
      description: 'Diseñar documentos fundacionales que distribuyan el poder desde el inicio.',
      content: `
        <h2>Escribir las Reglas Antes de Que Hagan Falta</h2>
        <p>Los estatutos no son burocracia: son el <strong>sistema operativo</strong> de tu organización. Las reglas que escribás hoy van a determinar cómo se resuelven los conflictos de mañana. Y es mucho más fácil escribirlas cuando todos se llevan bien.</p>
        <h3>Elementos Anti-Concentración Esenciales</h3>
        <ul>
          <li><strong>Mandatos limitados:</strong> Ningún cargo dura más de 2 años. Sin posibilidad de reelección inmediata.</li>
          <li><strong>Firmas conjuntas:</strong> Todo movimiento de dinero requiere al menos 2 firmas de personas diferentes.</li>
          <li><strong>Transparencia obligatoria:</strong> Las finanzas se publican mensualmente y cualquier miembro puede auditarlas.</li>
          <li><strong>Quórum de decisiones:</strong> Las decisiones importantes requieren al menos 2/3 de los miembros activos.</li>
          <li><strong>Mecanismo de revocación:</strong> Si un número definido de miembros lo pide, cualquier cargo se somete a revisión.</li>
        </ul>
        <h3>Lo Que Debe Incluir el Documento Fundacional</h3>
        <ol>
          <li>Propósito y valores del grupo</li>
          <li>Quiénes pueden ser miembros y cómo se ingresa</li>
          <li>Estructura de círculos y roles</li>
          <li>Cómo se toman decisiones (qué método para qué tipo)</li>
          <li>Cómo se manejan las finanzas</li>
          <li>Cómo se resuelven conflictos</li>
          <li>Cómo se modifican estos acuerdos</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Agarrá una hoja y escribí un borrador de 5 reglas fundacionales para tu organización barrial (real o imaginaria). ¿Incluiste mandatos limitados? ¿Firmas conjuntas? ¿Mecanismo de revocación? Revisá tu lista contra los elementos anti-concentración de esta lección.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Consejo Práctico</h3>
        <p>No hace falta un abogado ni lenguaje formal. Un documento claro, en lenguaje simple, que todos entiendan, es mejor que un estatuto legal que nadie leyó. Podés formalizarlo después si el grupo crece hacia una asociación civil.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"Las buenas reglas no limitan la libertad: la protegen. Jugamos el mismo juego cuando las reglas son claras y valen para todos por igual."</em></p>
        </blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Finanzas Transparentes y Rendición de Cuentas',
      description: 'Gestionar el dinero comunitario con total transparencia.',
      content: `
        <h2>La Plata: El Tema Que Nadie Quiere Tocar</h2>
        <p>En Argentina, hablar de plata genera incomodidad, desconfianza y conflicto. Y sin embargo, <strong>la mayoría de las organizaciones comunitarias mueren por problemas de dinero</strong>: no porque falte, sino porque se maneja mal o sin transparencia.</p>
        <h3>Principios de Finanzas Comunitarias</h3>
        <ul>
          <li><strong>Todo se registra:</strong> Cada peso que entra y sale queda anotado. Sin excepciones.</li>
          <li><strong>Todo se comparte:</strong> El estado de cuentas se publica mensualmente para todos los miembros.</li>
          <li><strong>Nadie decide solo:</strong> Gastos mayores a un monto acordado requieren aprobación colectiva.</li>
          <li><strong>Comprobantes siempre:</strong> Todo gasto tiene un ticket, factura o recibo.</li>
        </ul>
        <h3>Herramientas Prácticas</h3>
        <ol>
          <li><strong>Planilla compartida:</strong> Un Google Sheet donde se registran todos los movimientos. Todos pueden ver, solo tesorería puede editar.</li>
          <li><strong>Caja chica con rendición:</strong> Para gastos pequeños y urgentes, con rendición semanal.</li>
          <li><strong>Cuenta bancaria del grupo:</strong> Cuando el monto lo justifique, abrir una cuenta con firmas conjuntas.</li>
          <li><strong>Auditoría trimestral:</strong> Cada 3 meses, dos personas que no son de tesorería revisan las cuentas.</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">¿Tu grupo barrial o comunidad maneja plata de alguna forma? Si sí, ¿cuántos de los 4 principios de finanzas comunitarias se cumplen hoy? Si no manejan plata, ¿qué proyecto podrían encarar que requiera un fondo común, y cómo lo administrarían con transparencia total?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Fuentes de Financiamiento Comunitario</h3>
        <p>Un grupo barrial puede financiarse con: cuotas voluntarias, eventos (rifas, festivales), venta de productos, subsidios municipales, y donaciones. La diversificación de fuentes es clave: nunca dependas de una sola.</p>
        <blockquote>"La confianza en una organización se construye peso a peso, registro a registro, rendición a rendición."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Comunicación Interna Que No Queme',
      description: 'Diseñar flujos de comunicación que informen sin saturar.',
      content: `
        <h2>Comunicar Sin Saturar: El Arte del Flujo Interno</h2>
        <p>La mala comunicación interna mata más organizaciones que la falta de recursos. Demasiados mensajes, poca claridad, información que no llega a quien la necesita. Diseñar el <strong>flujo de comunicación</strong> es tan importante como diseñar la estructura.</p>
        <h3>Los Tres Flujos</h3>
        <ul>
          <li><strong>Flujo informativo:</strong> Lo que todos necesitan saber. Formato: resumen semanal breve. Canal: grupo general (solo lectura excepto admins).</li>
          <li><strong>Flujo operativo:</strong> Lo que cada equipo necesita coordinar. Formato: mensajes directos en subcírculos. Canal: grupo de cada proyecto.</li>
          <li><strong>Flujo social:</strong> Lo que mantiene el vínculo humano. Formato: libre. Canal: grupo social separado.</li>
        </ul>
        <h3>La Reunión de 15 Minutos</h3>
        <p>Cada semana, una reunión breve (presencial o virtual) con formato fijo:</p>
        <ol>
          <li><strong>3 minutos:</strong> Cada círculo reporta en una oración qué hizo y qué necesita</li>
          <li><strong>5 minutos:</strong> Anuncios y coordinación</li>
          <li><strong>5 minutos:</strong> Problemas urgentes</li>
          <li><strong>2 minutos:</strong> Próximos pasos claros</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Mirá el grupo de WhatsApp de tu barrio, trabajo o comunidad. ¿Están mezclados los tres flujos (informativo, operativo, social)? Diseñá en un papel cómo separarías la comunicación en canales diferenciados. ¿Qué reglas pondrías desde el día 1?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Documentación Viva</h3>
        <p>Todo lo que se decide debe quedar escrito en un lugar accesible. No en un chat que se pierde, sino en un documento compartido (Google Doc, Notion, o incluso un cuaderno físico en el local) que funcione como la <strong>memoria del grupo</strong>.</p>
        <p>La regla: si no está escrito, no se decidió.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La información compartida es poder compartido. Cuando todos saben lo mismo, jugamos el mismo juego."</em></p>
        </blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'De la Organización al Movimiento: Escalar Sin Perder Esencia',
      description: 'Cómo crecer manteniendo los valores y la estructura distribuida.',
      content: `
        <h2>Crecer Sin Traicionarse</h2>
        <p>Llega un momento donde tu organización barrial funciona bien y aparece la tentación (o la necesidad) de crecer. Más barrios, más proyectos, más personas. Este es el momento más peligroso: donde muchas organizaciones horizontales se vuelven verticales "por necesidad".</p>
        <h3>Los 3 Modelos de Crecimiento</h3>
        <ol>
          <li><strong>Replicación:</strong> No agrandás tu organización sino que ayudás a que surjan otras iguales en otros barrios. Les compartís el modelo, las herramientas, la experiencia. Cada una es autónoma.</li>
          <li><strong>Federación:</strong> Varias organizaciones barriales se asocian en una red que comparte recursos y coordina acciones, pero cada una mantiene su autonomía interna.</li>
          <li><strong>Escalamiento fractal:</strong> La misma estructura de círculos se replica a nivel supra-barrial. Círculos barriales que envían representantes a un círculo zonal, que envía al municipal.</li>
        </ol>
        <h3>Las Trampas del Crecimiento</h3>
        <ul>
          <li><strong>La trampa de la formalización excesiva:</strong> Más papeles, más burocracia, menos agilidad</li>
          <li><strong>La trampa del financiamiento:</strong> El dinero externo puede distorsionar las prioridades</li>
          <li><strong>La trampa de la profesionalización:</strong> Cuando los voluntarios se vuelven empleados, cambia la dinámica</li>
          <li><strong>La trampa de la visibilidad:</strong> La atención mediática puede generar egos y conflictos</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">De los 3 modelos de crecimiento (replicación, federación, escalamiento fractal), ¿cuál se adaptaría mejor a tu contexto territorial? Pensá en las organizaciones que ya existen en barrios vecinos al tuyo. ¿Cuál sería el primer paso concreto para conectarte con ellas?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Tu Proyecto: Diseñá la Arquitectura de Tu Organización</h3>
        <p>Como ejercicio final de este curso, diseñá la estructura completa de una organización distribuida para tu barrio: círculos, roles, protocolos de decisión, flujos de comunicación y mecanismos anti-concentración. Este diseño será tu guía de implementación.</p>
        <blockquote>"El movimiento del Hombre Gris no crece sumando seguidores. Crece multiplicando organizadores."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 18, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 10');

  // Quiz
  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Arquitectura de Organizaciones Distribuidas',
    description: 'Evaluá tu comprensión de los modelos de gobernanza distribuida.',
    passingScore: 70,
    timeLimit: 20,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿Qué diferencia la decisión por consentimiento del consenso?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Son lo mismo', 'Consentimiento busca que nadie tenga objeciones graves; consenso busca acuerdo total', 'Consenso es más rápido', 'Consentimiento requiere unanimidad']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El consentimiento pregunta "¿alguien tiene una objeción razonada?" en vez de buscar entusiasmo universal.',
      points: 2, orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: 'En la holacracia, una persona solo puede tener un rol a la vez.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Una persona puede tener varios roles, y un rol puede rotar entre personas.',
      points: 1, orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es el primer nivel de resolución de conflictos en una organización horizontal?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Votación grupal', 'Conversación directa entre las dos personas', 'Mediación de un tercero', 'Panel de 3 personas']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Siempre se empieza por la conversación directa antes de escalar.',
      points: 2, orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: 'El burnout activista es principalmente un problema individual, no organizacional.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'El burnout es un problema de diseño organizacional: concentración de tareas, falta de límites y reconocimiento.',
      points: 1, orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: '¿Qué elemento de los estatutos previene mejor la concentración de poder financiero?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Un tesorero permanente de confianza', 'Firmas conjuntas y transparencia obligatoria', 'No manejar dinero', 'Que el líder apruebe todo']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Las firmas conjuntas y la transparencia obligatoria son mecanismos estructurales anti-concentración.',
      points: 2, orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: '¿Qué es el "doble enlace" en la sociocracia?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Dos personas comparten un rol', 'Cada círculo envía dos representantes al nivel superior', 'Se toman dos votaciones', 'Se necesitan dos reuniones para decidir']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El doble enlace garantiza comunicación bidireccional entre niveles de la organización.',
      points: 2, orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: 'La Regla del 70% sugiere nunca usar más del 70% de tu capacidad como voluntario.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Dejar un 30% de margen previene el agotamiento y permite responder a imprevistos.',
      points: 1, orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es el modelo de crecimiento donde cada organización barrial mantiene plena autonomía?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Centralización', 'Replicación', 'Fusión', 'Absorción']),
      correctAnswer: JSON.stringify(1),
      explanation: 'La replicación crea organizaciones autónomas que comparten modelo pero no dependen entre sí.',
      points: 2, orderIndex: 8,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la frecuencia recomendada de rotación para la facilitación de reuniones?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Anual', 'Semestral', 'Mensual', 'Nunca debe rotar']),
      correctAnswer: JSON.stringify(2),
      explanation: 'La facilitación de reuniones es un rol que beneficia de rotación mensual para desarrollar capacidades en todos.',
      points: 2, orderIndex: 9,
    },
    {
      quizId: quiz.id,
      question: 'Si una decisión no quedó escrita, no se decidió.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'La documentación es esencial para la memoria organizacional y para evitar malentendidos.',
      points: 1, orderIndex: 10,
    },
  ];

  for (const q of questions) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions.length, 'questions for course 10');
}

async function seedCourse11(authorId: number) {
  console.log('--- Course 11: Redes Territoriales ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'redes-territoriales-barrio-provincia')).limit(1);

  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Redes Territoriales: Del Barrio a la Provincia',
      slug: 'redes-territoriales-barrio-provincia',
      description: 'Conecta organizaciones barriales en redes más amplias. Aprende a construir coaliciones, articular con gobierno local y escalar iniciativas exitosas. Incluye análisis de las asambleas del 2001.',
      excerpt: 'Escala tu impacto conectando barrios en redes de cambio territorial.',
      category: 'community',
      level: 'advanced',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800',
      orderIndex: 11,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 11:', course[0].title);
  } else {
    console.log('Found existing course 11:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'De la Isla al Archipiélago: Por Qué Conectar Organizaciones',
      description: 'La lógica sistémica de conectar organizaciones barriales en redes territoriales.',
      content: `
        <h2>El Barrio Solo No Alcanza</h2>
        <p>Tu organización barrial funciona. Tenés reuniones regulares, completaste proyectos, la gente participa. Pero empezás a notar algo: muchos de los problemas que afectan a tu barrio <strong>no se resuelven a escala barrial</strong>. La inseguridad, el transporte, la contaminación, el presupuesto municipal: todo esto requiere una escala mayor.</p>
        <h3>La Lógica de Red</h3>
        <p>Una red territorial no es una organización más grande. Es un <strong>sistema de conexiones</strong> entre organizaciones que mantienen su autonomía pero multiplican su impacto:</p>
        <ul>
          <li><strong>Información compartida:</strong> Lo que funciona en un barrio puede replicarse en otro</li>
          <li><strong>Recursos compartidos:</strong> Un camión, una impresora, un abogado pueden ser compartidos</li>
          <li><strong>Voz amplificada:</strong> Un barrio le pide al municipio y lo ignoran. Diez barrios juntos son imposibles de ignorar</li>
          <li><strong>Resiliencia:</strong> Si un grupo tiene un mal momento, los demás lo sostienen</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en un problema concreto de tu barrio que no se puede resolver solo a escala barrial (transporte, contaminación, seguridad, etc.). ¿Qué barrios vecinos comparten ese mismo problema? ¿Conocés a alguien en alguna organización de esos barrios? Anotá 3 posibles aliados territoriales.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Precedentes Argentinos</h3>
        <p>Argentina tiene una rica historia de redes territoriales: las asambleas barriales del 2001, las redes de comedores comunitarios, los movimientos piqueteros, las federaciones de cooperativas. Cada una ofrece lecciones sobre qué funciona y qué no cuando los barrios se conectan.</p>
        <blockquote>"Solos podemos cambiar una cuadra. Conectados podemos cambiar una ciudad."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Mapeo de Actores y Análisis de Poder Territorial',
      description: 'Identificar quiénes tienen poder en tu territorio y cómo interactúan.',
      content: `
        <h2>¿Quién Manda Acá? El Mapa del Poder Real</h2>
        <p>Antes de construir una red, necesitás entender el <strong>ecosistema de poder</strong> de tu territorio. No el poder formal (el intendente, el concejal), sino el poder real: quién decide, quién bloquea, quién facilita, quién tiene recursos.</p>
        <h3>Los Cuatro Cuadrantes del Poder</h3>
        <ol>
          <li><strong>Poder formal + visible:</strong> Gobierno municipal, concejo deliberante, jueces. Tienen autoridad legal y son visibles.</li>
          <li><strong>Poder formal + invisible:</strong> Burocracia municipal, directores de área, secretarios. Tienen poder real pero no aparecen en los medios.</li>
          <li><strong>Poder informal + visible:</strong> Referentes barriales, líderes religiosos, periodistas locales. No tienen cargo pero tienen influencia.</li>
          <li><strong>Poder informal + invisible:</strong> Empresarios locales, redes de favores, estructuras clientelares. El poder que nadie nombra pero todos conocen.</li>
        </ol>
        <h3>Cómo Hacer el Mapeo</h3>
        <ul>
          <li>Dibujá un mapa grande con los cuatro cuadrantes</li>
          <li>Con tu grupo, ubicá a cada actor relevante en su cuadrante</li>
          <li>Dibujá flechas entre actores que tienen relación (alianza, conflicto, dependencia)</li>
          <li>Identificá: ¿quiénes son potenciales aliados? ¿quiénes son obstáculos? ¿quiénes son neutrales que podrían sumarse?</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Dibujá rápidamente los cuatro cuadrantes del poder en tu municipio o localidad. Ubicá al menos 2 actores en cada cuadrante. ¿Quién está en el cuadrante "informal + invisible" que afecta a tu barrio pero nadie nombra? Ese es el poder que más necesitás entender.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>La Regla del Interés</h3>
        <p>Cada actor se mueve por intereses. Antes de acercarte a alguien, preguntate: <strong>¿qué gana esta persona si colabora con nosotros?</strong> Si no podés responder esa pregunta, tu propuesta de alianza va a fracasar.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris ve lo que otros no ven: las conexiones invisibles de poder. Jugamos el mismo juego cuando entendemos las reglas reales, no solo las escritas."</em></p>
        </blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Construcción de Coaliciones: El Arte de la Alianza',
      description: 'Estrategias para construir alianzas entre organizaciones diversas.',
      content: `
        <h2>Aliados Improbables: El Poder de la Coalición</h2>
        <p>Una coalición no es un grupo de amigos. Es una <strong>alianza estratégica</strong> entre organizaciones que pueden tener visiones distintas pero comparten un objetivo concreto. La iglesia evangélica y el centro cultural pueden no estar de acuerdo en muchas cosas, pero ambos quieren que la plaza esté limpia.</p>
        <h3>Los 5 Pasos de la Construcción de Coaliciones</h3>
        <ol>
          <li><strong>Identificar el tema convocante:</strong> Tiene que ser concreto, urgente y compartido. "Mejorar el barrio" es demasiado vago. "Conseguir que pongan semáforo en la esquina peligrosa" es perfecto.</li>
          <li><strong>Mapear aliados potenciales:</strong> ¿Quiénes comparten este problema? Pensá amplio: vecinos, comerciantes, escuelas, clubes, iglesias, ONGs.</li>
          <li><strong>Primera ronda de conversaciones:</strong> Visitá a cada potencial aliado. Escuchá su perspectiva. No propongas nada todavía: primero entendé.</li>
          <li><strong>Reunión fundacional:</strong> Invitá a quienes mostraron interés. Objetivo: acordar un plan de acción concreto con responsables.</li>
          <li><strong>Acción visible rápida:</strong> Ejecutá algo en las primeras 2 semanas. La acción temprana consolida la coalición.</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Elegí un problema concreto de tu zona (por ejemplo, una esquina peligrosa, un basural, falta de actividades para jóvenes). Siguiendo los 5 pasos que acabás de leer, anotá: ¿quiénes serían tus 5 aliados potenciales más improbables para resolver ese problema? Pensá más allá de los sospechosos de siempre.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Reglas de Convivencia en Coaliciones</h3>
        <ul>
          <li><strong>Cada organización mantiene su identidad.</strong> La coalición no reemplaza a nadie.</li>
          <li><strong>Se trabaja sobre acuerdos mínimos.</strong> No hace falta estar de acuerdo en todo.</li>
          <li><strong>Representación proporcional.</strong> Cada organización tiene voz, independientemente de su tamaño.</li>
          <li><strong>Comunicación unificada hacia afuera</strong> pero diversa hacia adentro.</li>
        </ul>
        <blockquote>"La coalición perfecta no existe. La coalición efectiva es la que se junta el martes y hace algo el miércoles."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Articulación con Gobierno Local Sin Cooptación',
      description: 'Cómo trabajar con el municipio sin perder independencia ni ser cooptados.',
      content: `
        <h2>Ni Enemigos Ni Subordinados: La Relación con el Municipio</h2>
        <p>Uno de los dilemas más comunes de las organizaciones barriales argentinas: ¿cómo relacionarse con el gobierno local? Si te acercás demasiado, te cooptan. Si te alejás demasiado, perdés acceso a recursos y decisiones que afectan tu barrio.</p>
        <h3>El Espectro de Relación</h3>
        <ul>
          <li><strong>Confrontación:</strong> Solo denunciamos. Funciona para visibilizar problemas pero no construye soluciones.</li>
          <li><strong>Colaboración crítica:</strong> Trabajamos juntos en lo que coincidimos, criticamos lo que no funciona. El punto dulce.</li>
          <li><strong>Cooptación:</strong> Nos convertimos en extensión del gobierno. Perdemos independencia y credibilidad.</li>
        </ul>
        <h3>Señales de Cooptación</h3>
        <ol>
          <li>El gobierno empieza a elegir quién participa de tu organización</li>
          <li>Te piden que no critiques públicamente a cambio de recursos</li>
          <li>Los tiempos de tu organización empiezan a coincidir con los tiempos electorales</li>
          <li>Perdés la capacidad de decir "no"</li>
        </ol>
        <h3>Estrategias de Independencia</h3>
        <ul>
          <li><strong>Diversificá fuentes:</strong> Nunca dependas solo de fondos municipales</li>
          <li><strong>Documentá todo:</strong> Los acuerdos con el gobierno se escriben, no se confían a la buena voluntad</li>
          <li><strong>Rotá voceros:</strong> Si solo una persona habla con el municipio, se crea una relación personal que puede distorsionar</li>
          <li><strong>Mantené la puerta de la crítica abierta:</strong> Podés agradecer lo bueno y señalar lo malo en la misma oración</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en la relación actual de tu barrio o comunidad con el municipio. ¿Dónde la ubicarías en el espectro (confrontación, colaboración crítica, cooptación)? ¿Reconocés alguna de las señales de cooptación? Anotá una estrategia concreta para mantener la independencia sin perder el vínculo.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <p>La clave es pensar en términos de <strong>poder ciudadano</strong>, no de favores. El municipio no te hace un favor cuando arregla la calle: está cumpliendo su obligación con tus impuestos.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"El Hombre Gris no le debe favores a nadie. Exige derechos con firmeza y construye puentes con dignidad. Jugamos el mismo juego, pero nunca de rodillas."</em></p>
        </blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Advocacy Efectivo: Cambiar Políticas Desde Abajo',
      description: 'Herramientas de incidencia para que las organizaciones barriales influyan en políticas públicas.',
      content: `
        <h2>Tu Voz en la Política Pública</h2>
        <p>El advocacy (incidencia política) es el arte de <strong>influir en las decisiones que toman quienes tienen poder</strong> para que esas decisiones beneficien a tu comunidad. No es lobby corporativo ni militancia partidaria: es ciudadanía activa organizada.</p>
        <h3>Las 4 Herramientas de Incidencia</h3>
        <ol>
          <li><strong>Evidencia:</strong> Datos concretos sobre el problema. "Hubo 15 accidentes en esta esquina en el último año" pesa más que "esta esquina es peligrosa".</li>
          <li><strong>Historias:</strong> Los datos convencen a la razón, las historias mueven al corazón. Testimonios de vecinos afectados.</li>
          <li><strong>Alianzas:</strong> Cuanta más gente respalde tu pedido, más difícil es ignorarlo.</li>
          <li><strong>Presión:</strong> Si el diálogo no funciona, la movilización pacífica, la prensa, las redes sociales son herramientas legítimas.</li>
        </ol>
        <h3>El Proceso de Incidencia Paso a Paso</h3>
        <ul>
          <li><strong>Definí el cambio específico que querés:</strong> No "mejorar la seguridad" sino "instalar 10 cámaras en las calles X, Y, Z"</li>
          <li><strong>Identificá quién tiene el poder de hacerlo:</strong> ¿Es el intendente? ¿El concejo deliberante? ¿Un director de área?</li>
          <li><strong>Diseñá tu estrategia:</strong> ¿Empezás con diálogo privado o con presión pública?</li>
          <li><strong>Ejecutá y ajustá:</strong> La incidencia es un proceso, no un evento</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Elegí un cambio concreto que quisieras lograr en tu municipio (un semáforo, una poda de árboles, más frecuencia de colectivos). Usando las 4 herramientas de incidencia, armá un mini-plan: ¿qué dato concreto presentarías? ¿qué historia contarías? ¿a quién convocarías? ¿a quién se lo pedirías?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Caso Práctico: Presupuesto Participativo</h3>
        <p>Muchos municipios argentinos tienen mecanismos de presupuesto participativo. Es una oportunidad concreta para que tu red territorial priorice proyectos y los haga realidad con fondos públicos. Investigá si tu municipio lo tiene y cómo participar.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La democracia no se agota en el voto cada cuatro años. Jugamos el mismo juego todos los días, cada vez que un ciudadano organizado le exige a su gobierno que cumpla."</em></p>
        </blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Las Asambleas del 2001: Lecciones de Lo Que Funcionó y Lo Que No',
      description: 'Análisis sistémico del movimiento asambleario argentino post-crisis 2001.',
      content: `
        <h2>2001: Cuando los Barrios se Levantaron</h2>
        <p>En diciembre de 2001, tras el estallido económico y social, surgieron más de <strong>200 asambleas barriales</strong> en Buenos Aires y el conurbano. Fue la expresión más potente de organización territorial espontánea en la historia reciente argentina. Y en menos de dos años, la gran mayoría había desaparecido.</p>
        <h3>Lo Que Funcionó</h3>
        <ul>
          <li><strong>Horizontalidad genuina:</strong> Las asambleas no tenían líderes formales. Cualquiera podía hablar.</li>
          <li><strong>Territorialidad:</strong> Cada asamblea estaba anclada en una esquina, una plaza, un barrio concreto.</li>
          <li><strong>Acción directa:</strong> No esperaban al gobierno: ocupaban fábricas, armaban comedores, organizaban trueque.</li>
          <li><strong>Transversalidad:</strong> En la misma asamblea podía haber un profesional, una ama de casa, un jubilado y un pibe del barrio.</li>
        </ul>
        <h3>Lo Que No Funcionó</h3>
        <ul>
          <li><strong>Falta de estructura:</strong> La horizontalidad sin protocolos se volvió caótica. Reuniones de 4 horas sin conclusiones.</li>
          <li><strong>Infiltración partidaria:</strong> Partidos políticos infiltraron militantes que pusieron sus agendas por sobre las del barrio.</li>
          <li><strong>Agotamiento:</strong> Sin rotación ni cuidado, los más activos se quemaron.</li>
          <li><strong>Falta de institucionalización:</strong> Cuando la crisis amainó, no había estructura que sostuviera lo construido.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Si en tu barrio se armara una asamblea mañana como las del 2001, ¿qué harías diferente sabiendo lo que aprendiste en este curso? Anotá 3 mecanismos concretos que implementarías desde el primer día para evitar que se repitan los errores (infiltración, agotamiento, falta de estructura).</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Lecciones para Hoy</h3>
        <p>Las asambleas del 2001 demostraron que <strong>la capacidad de auto-organización existe</strong> en la sociedad argentina. Lo que faltó fue la infraestructura organizativa para sostenerla en el tiempo. Todo lo que aprendiste en este curso — roles, protocolos, rotación, estatutos — es la respuesta a ese vacío.</p>
        <blockquote>"2001 no fracasó. Fue un ensayo general. La próxima vez que los barrios se levanten, estaremos mejor preparados."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Comunicación Entre Nodos: Protocolos de Red',
      description: 'Diseñar sistemas de comunicación eficientes entre organizaciones de una red.',
      content: `
        <h2>Conectar Sin Ahogar: La Comunicación en Red</h2>
        <p>Una red territorial puede morir de dos formas: por falta de comunicación (los nodos se aíslan) o por exceso de comunicación (todo el mundo está en todo y nadie hace nada). El diseño de <strong>protocolos de comunicación</strong> es crítico.</p>
        <h3>Estructura de Comunicación en Red</h3>
        <ul>
          <li><strong>Canal general:</strong> Para información que afecta a toda la red. Máximo 2-3 mensajes por semana. Solo coordinadores publican.</li>
          <li><strong>Canales temáticos:</strong> Para cada proyecto o tema transversal. Solo participan quienes están involucrados.</li>
          <li><strong>Encuentros presenciales:</strong> Mensualmente, rotan entre barrios. Son el momento de fortalecer vínculos humanos.</li>
          <li><strong>Boletín periódico:</strong> Un resumen quincenal de qué está haciendo cada nodo. Breve y visual.</li>
        </ul>
        <h3>El Rol del Articulador de Red</h3>
        <p>Cada red necesita personas dedicadas a la <strong>articulación</strong>: no lideran, sino que conectan. Su trabajo es:</p>
        <ol>
          <li>Saber qué está haciendo cada nodo</li>
          <li>Identificar oportunidades de colaboración</li>
          <li>Facilitar los encuentros de red</li>
          <li>Ser el "puente" cuando hay conflictos entre nodos</li>
        </ol>
        <h3>Herramientas Digitales para Redes</h3>
        <p>Para redes más formales: Slack o Discord permiten canales organizados. Para redes más informales: grupos de WhatsApp bien estructurados con un canal de "solo anuncios". Para documentación compartida: Google Drive o Notion con carpetas por nodo.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Imaginá que tu barrio forma parte de una red con 4 barrios vecinos. Diseñá la estructura de comunicación: ¿cuántos canales de WhatsApp crearías? ¿Quién sería el articulador de red de tu barrio? ¿Con qué frecuencia se juntarían presencialmente? Hacé un esquema rápido.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <p>Pero nunca olvides: <strong>la herramienta más poderosa de comunicación en red es el mate compartido entre coordinadores de diferentes barrios.</strong></p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La red invisible del Hombre Gris se teje con conversaciones, no con organigramas. Jugamos el mismo juego cuando la información fluye libre entre los nodos."</em></p>
        </blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Recursos Compartidos: Economía de Red Territorial',
      description: 'Crear sistemas de recursos compartidos entre organizaciones barriales.',
      content: `
        <h2>Juntos Tenemos Más: La Economía Colaborativa Territorial</h2>
        <p>Uno de los beneficios más concretos de una red territorial es la <strong>capacidad de compartir recursos</strong>. Lo que un barrio no puede costear solo, cinco barrios juntos sí.</p>
        <h3>Tipos de Recursos Compartibles</h3>
        <ul>
          <li><strong>Espacios:</strong> Un salón comunitario en un barrio puede ser usado por organizaciones de barrios vecinos</li>
          <li><strong>Herramientas:</strong> Un equipo de sonido, una impresora, herramientas de construcción</li>
          <li><strong>Conocimiento:</strong> Un abogado de un barrio puede asesorar a toda la red. Un contador puede hacer los balances de todas las organizaciones.</li>
          <li><strong>Contactos:</strong> Los vínculos institucionales de un nodo benefician a toda la red</li>
          <li><strong>Compras conjuntas:</strong> Comprar materiales en cantidad entre varios barrios baja los costos</li>
        </ul>
        <h3>El Fondo Común de Red</h3>
        <p>Muchas redes exitosas crean un <strong>fondo común</strong> donde cada nodo aporta lo que puede. Este fondo se usa para:</p>
        <ol>
          <li>Gastos de coordinación de la red</li>
          <li>Emergencias en algún nodo</li>
          <li>Proyectos conjuntos que beneficien a varios barrios</li>
          <li>Formación y capacitación para miembros de la red</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Hacé una lista de 5 recursos que tu organización barrial tiene y que podrían beneficiar a barrios vecinos (un espacio, un contacto, un conocimiento, una herramienta). Ahora pensá al revés: ¿qué recurso necesitás que probablemente ya exista en un barrio cercano? ¿Cómo podrías proponerles un intercambio?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Reglas Claras para Compartir</h3>
        <p>Todo sistema de recursos compartidos necesita reglas: quién puede usar qué, cómo se reserva, quién lo mantiene, qué pasa si se rompe. Sin estas reglas, el sistema colapsa en el primer conflicto. Escribí los acuerdos desde el principio.</p>
        <blockquote style="border-left:4px solid #3b82f6;padding:1rem 1.5rem;margin:2rem 0;background:#eff6ff;border-radius:0 12px 12px 0;">
          <p style="font-style:italic;color:#1e3a5f;line-height:1.8;margin:0;"><em>"La abundancia no está en acumular sino en compartir. Jugamos el mismo juego cuando lo que es de uno se pone al servicio de todos."</em></p>
        </blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Gestión de la Diversidad Ideológica en Coaliciones',
      description: 'Manejar las diferencias políticas e ideológicas dentro de una red territorial.',
      content: `
        <h2>La Grieta en la Red: Convivir con Diferencias</h2>
        <p>En una red territorial van a convivir personas con visiones políticas muy diferentes. La tentación es evitar el tema o exigir homogeneidad ideológica. Ambas opciones son destructivas. La alternativa es <strong>construir sobre los acuerdos concretos</strong> sin pretender unanimidad ideológica.</p>
        <h3>El Principio del Mínimo Común</h3>
        <p>Una red territorial no necesita acuerdo ideológico total. Necesita acuerdo en:</p>
        <ul>
          <li>¿Qué problemas concretos queremos resolver?</li>
          <li>¿Qué valores básicos compartimos? (transparencia, participación, no violencia)</li>
          <li>¿Cómo tomamos decisiones juntos?</li>
          <li>¿Qué no toleramos? (corrupción, violencia, discriminación)</li>
        </ul>
        <h3>Cuando la Grieta Aparece</h3>
        <ol>
          <li><strong>No la niegues:</strong> "Tenemos diferentes visiones políticas y eso está bien."</li>
          <li><strong>Volvé al territorio:</strong> "¿Esto afecta lo que estamos tratando de hacer en el barrio?"</li>
          <li><strong>Separar persona de posición:</strong> "Puedo discrepar con tu posición sin dejar de respetarte."</li>
          <li><strong>El test del mate:</strong> "¿Podemos seguir tomando mate juntos después de esta conversación?"</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Pensá en alguien de tu barrio con quien tenés diferencias políticas fuertes. Ahora listá 3 problemas concretos del barrio en los que probablemente coincidan (la vereda rota, la falta de iluminación, la plaza descuidada). ¿Podrías sentarte a tomar un mate con esa persona y trabajar juntos en eso? ¿Qué necesitarías soltar para lograrlo?</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Lo Que No Se Negocia</h3>
        <p>Hay límites claros que no se negocian: violencia, discriminación, corrupción, y acciones que pongan en riesgo al grupo. Estos límites deben estar escritos en los acuerdos fundacionales de la red y aplicarse sin excepciones.</p>
        <blockquote>"El Hombre Gris es gris precisamente porque integra todos los colores. Una red que solo acepta un color político no es red: es secta."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Proyecto Capstone: Diseñar una Red Territorial',
      description: 'Ejercicio integrador: diseñar una red territorial para tu zona.',
      content: `
        <h2>Tu Diseño de Red: De la Teoría al Territorio</h2>
        <p>Has recorrido todo el camino desde organizar tu barrio hasta pensar en redes que conectan barrios. Es momento del <strong>proyecto capstone</strong>: diseñar una red territorial para tu zona.</p>
        <h3>El Entregable</h3>
        <p>Diseñá un documento (puede ser escrito, un mapa, un diagrama, o una combinación) que incluya:</p>
        <ol>
          <li><strong>Diagnóstico territorial:</strong> Mapa de actores, análisis de poder, problemas compartidos entre barrios</li>
          <li><strong>Propuesta de red:</strong> Quiénes la integran, cuál es su propósito, qué estructura tiene</li>
          <li><strong>Protocolos:</strong> Cómo se decide, cómo se comunica, cómo se comparten recursos</li>
          <li><strong>Plan de acción:</strong> Primeros 3 meses de la red — qué hacer, quién, cuándo</li>
          <li><strong>Primer proyecto conjunto:</strong> Una acción concreta que la red pueda ejecutar para consolidarse</li>
        </ol>
        <h3>Criterios de Evaluación</h3>
        <ul>
          <li><strong>Realismo:</strong> ¿Es implementable con los recursos que existen?</li>
          <li><strong>Distribución de poder:</strong> ¿Previene la concentración en pocas manos?</li>
          <li><strong>Inclusividad:</strong> ¿Incluye diversidad de actores y perspectivas?</li>
          <li><strong>Resiliencia:</strong> ¿Puede sobrevivir si algún nodo se debilita?</li>
          <li><strong>Acción concreta:</strong> ¿Tiene un primer paso claro y ejecutable?</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:1.5rem;margin:2rem 0;">
          <h4 style="color:#15803d;margin-top:0;">🔄 Pausa para Reflexionar</h4>
          <p style="line-height:1.8;">Antes de arrancar tu diseño de red, hacé un inventario honesto: ¿con cuántas organizaciones de barrios vecinos tenés contacto real hoy? Si la respuesta es cero o una, tu primer paso no es diseñar la red sino salir a conocer. Anotá 3 organizaciones cercanas que podrías visitar este mes y qué les propondrías como primer acercamiento.</p>
          <p><em>Tomá 3 minutos para anotarlo antes de continuar.</em></p>
        </div>
        <h3>Reflexión Final</h3>
        <p>La transformación de Argentina no va a venir de arriba. Va a venir de <strong>miles de redes territoriales</strong> que conecten barrios, compartan recursos, amplifiquen voces y construyan el poder ciudadano que este país necesita. Vos estás aprendiendo a tejer esa red. El Instante del Hombre Gris es ahora, y empieza en tu cuadra.</p>
        <blockquote>"El tejido vivo de una nación no es su gobierno ni su economía. Es la red invisible de ciudadanos que deciden organizarse, conectarse y actuar juntos."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 18, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 11');

  // Quiz
  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Redes Territoriales',
    description: 'Evaluá tu comprensión de la construcción de redes entre organizaciones barriales.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿Cuál es la principal ventaja de una red territorial sobre una organización barrial sola?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Tiene más dinero', 'Multiplica el impacto manteniendo la autonomía de cada nodo', 'Es más fácil de organizar', 'Elimina todos los conflictos']),
      correctAnswer: JSON.stringify(1),
      explanation: 'La red amplifica impacto sin que ninguna organización pierda su autonomía.',
      points: 2, orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál fue una de las principales debilidades de las asambleas del 2001?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Falta de participación', 'Falta de estructura que las sostuviera en el tiempo', 'Exceso de financiamiento', 'Demasiada organización formal']),
      correctAnswer: JSON.stringify(1),
      explanation: 'La horizontalidad sin protocolos ni estructura institucional hizo que no pudieran sostenerse.',
      points: 2, orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: 'La cooptación ocurre cuando una organización pierde independencia al acercarse al gobierno.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'La cooptación es el riesgo de que la relación con el gobierno comprometa la independencia del grupo.',
      points: 1, orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Qué es el "poder informal invisible"?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['El poder del voto', 'Empresarios y redes de favores que influyen sin cargos formales', 'El poder de los medios', 'El poder militar']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Son actores que ejercen poder real sin visibilidad pública ni cargos formales.',
      points: 2, orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: 'Una coalición requiere acuerdo ideológico total entre sus miembros.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'Una coalición funciona sobre acuerdos concretos mínimos, no sobre unanimidad ideológica.',
      points: 1, orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la primera herramienta de incidencia (advocacy) más efectiva?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Protesta masiva', 'Evidencia concreta con datos', 'Publicar en redes sociales', 'Contratar un lobbista']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Los datos concretos son la base de toda incidencia: hacen medible y demostrable el problema.',
      points: 2, orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: 'El rol de articulador de red consiste principalmente en liderar la red.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(false),
      explanation: 'El articulador no lidera sino que conecta, facilita y sirve de puente entre nodos.',
      points: 1, orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la señal más clara de que una organización está siendo cooptada por el gobierno?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Recibe fondos municipales', 'Pierde la capacidad de criticar públicamente', 'Tiene reuniones con funcionarios', 'Participa en presupuesto participativo']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Perder la capacidad de crítica a cambio de recursos es la señal definitiva de cooptación.',
      points: 2, orderIndex: 8,
    },
  ];

  for (const q of questions) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions.length, 'questions for course 11');
}

async function main() {
  console.log('Seeding Road 3: El Tejido Vivo...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) {
      console.log('No users found. Please create a user first.');
      return;
    }
    const authorId = author.id;
    console.log('Using author ID:', authorId, 'Username:', author.username);

    await seedCourse9(authorId);
    await seedCourse10(authorId);
    await seedCourse11(authorId);

    console.log('Road 3: El Tejido Vivo seeding complete!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
