export interface AreaStudyContent {
  areaKey: string;
  perspectives: {
    scientific: { title: string; content: string; keyInsight: string };
    philosophical: { title: string; content: string; keyInsight: string };
    practical: { title: string; content: string; keyInsight: string; frameworks?: { name: string; description: string }[] };
  };
  selfReflectionPrompts: string[];
  mentalModels: { name: string; description: string; application: string }[];
  recommendedHabits: { name: string; description: string; difficulty: string; frequency: string }[];
  deepDiveTopics: { title: string; summary: string }[];
}

export const lifeAreaStudyContent: AreaStudyContent[] = [
  // ========== 1. SALUD ==========
  {
    areaKey: 'Salud',
    perspectives: {
      scientific: {
        title: 'La ciencia del bienestar fisico',
        content: `La investigacion en medicina preventiva muestra que el 80% de las enfermedades cronicas son prevenibles mediante habitos de vida saludables. El ejercicio regular no solo mejora la salud cardiovascular sino que actua como antidepresivo natural: 30 minutos de actividad moderada liberan endorfinas y BDNF (factor neurotrofico derivado del cerebro), que literalmente regeneran neuronas.

El sueno es el pilar menos valorado. Matthew Walker, neurocientificc de UC Berkeley, demostro que dormir menos de 7 horas reduce la funcion inmune en un 70% y afecta la memoria, la regulacion emocional y la toma de decisiones. No es un lujo: es infraestructura biologica.

La nutricion moderna se aleja de las dietas restrictivas hacia un enfoque de "alimentacion consciente": priorizar alimentos reales, minimizar ultraprocesados, y escuchar las senales del cuerpo. La microbiota intestinal, que contiene mas neuronas que la medula espinal, influye directamente en el estado de animo y la salud mental.`,
        keyInsight: 'La salud no es ausencia de enfermedad: es la capacidad de tu cuerpo para adaptarse y prosperar. Invertir en los pilares basicos (movimiento, sueno, nutricion) genera retornos exponenciales en todas las demas areas de tu vida.',
      },
      philosophical: {
        title: 'El cuerpo como templo y herramienta',
        content: `Los estoicos veian el cuerpo como el vehiculo del alma. Marco Aurelio, emperador romano, mantenia rutinas de ejercicio estrictas no por vanidad sino porque entendia que un cuerpo debil debilita la mente y la voluntad.

En la tradicion oriental, el concepto de "chi" o energia vital conecta la salud fisica con la espiritual. El yoga, que tiene mas de 5.000 anos, no separa cuerpo y mente: los considera un sistema integrado donde el movimiento consciente es una forma de meditacion.

Seneca escribio: "Es parte de la cura desear ser curado". La salud comienza con la decision de tratarte como alguien que vale la pena cuidar. No es egoismo: es la base desde la cual podes servir a otros.`,
        keyInsight: 'Cuidar tu cuerpo no es vanidad ni obsesion: es un acto de respeto hacia vos mismo y hacia todos los que dependen de vos. Un cuerpo bien cuidado es la plataforma desde la cual construis todo lo demas.',
      },
      practical: {
        title: 'Sistemas practicos para la salud',
        content: `La clave no es la motivacion sino los sistemas. James Clear, en "Atomic Habits", demuestra que los cambios pequenos y consistentes superan a los esfuerzos heroicos esporadicos. En salud, esto significa: no te propongas correr un maraton, proponete ponerte las zapatillas todos los dias.

La regla del 80/20 aplicada a la salud: el 80% de los beneficios viene de 3 habitos fundamentales: moverte 30 minutos diarios, dormir 7-8 horas, y comer mayormente alimentos reales. El otro 20% son optimizaciones.`,
        keyInsight: 'No necesitas un plan perfecto. Necesitas un plan que puedas sostener.',
        frameworks: [
          { name: 'Minimos viables', description: 'Empeza con la version mas pequena del habito que queres instalar. 5 minutos de caminata son infinitamente mejores que 0.' },
          { name: 'Apilado de habitos', description: 'Conecta un habito nuevo con uno que ya tenes. "Despues de prepararme el mate, hago 10 sentadillas."' },
          { name: 'Triangulo del sueno', description: 'Horario consistente + habitacion oscura y fresca + sin pantallas 1 hora antes. Los tres juntos multiplican la calidad del descanso.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Que relacion tengo con mi cuerpo? Lo trato como un aliado o como algo que debo soportar?',
      'Cual es el habito de salud que mas impacto tendria si lo implementara consistentemente?',
      'Cuando fue la ultima vez que me senti genuinamente lleno de energia? Que estaba haciendo diferente?',
      'Que excusas uso mas frecuentemente para no cuidar mi salud? Son realmente validas?',
      'Si tuviera que elegir UN cambio en mi alimentacion esta semana, cual seria?',
      'Como afecta mi sueno a mi rendimiento y humor al dia siguiente?',
    ],
    mentalModels: [
      { name: 'Interes compuesto de la salud', description: 'Cada pequena decision saludable se acumula. 1% mejor cada dia = 37x mejor en un ano.', application: 'Cuando dudes si vale la pena hacer 10 minutos de ejercicio, recorda que se acumula.' },
      { name: 'Prevencion vs. reparacion', description: 'Prevenir cuesta 1x. Reparar cuesta 10x. No esperes a que el cuerpo falle.', application: 'Inverti en chequeos regulares, movimiento diario y descanso antes de necesitar tratamientos.' },
      { name: 'El cuerpo como sistema', description: 'Sueno, nutricion, movimiento y salud mental estan interconectados. Mejorar uno mejora los otros.', application: 'Si no podes hacer ejercicio, enfocate en dormir mejor. El efecto cascada te va a sorprender.' },
    ],
    recommendedHabits: [
      { name: 'Caminata diaria de 30 minutos', description: 'El ejercicio mas subestimado. Reduce mortalidad, mejora humor y creatividad.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Hidratacion al despertar', description: 'Un vaso de agua apenas te levantas reactiva el metabolismo despues de 8 horas sin liquido.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Rutina de sueno fija', description: 'Acostate y levantate a la misma hora, incluso fines de semana. Tu reloj biologico lo agradece.', difficulty: 'Intermedio', frequency: 'Diario' },
      { name: 'Preparar comida real', description: 'Cocina al menos una comida al dia con ingredientes frescos. Es meditacion activa y nutricion.', difficulty: 'Intermedio', frequency: 'Diario' },
    ],
    deepDiveTopics: [
      { title: 'El eje intestino-cerebro', summary: 'Como tu microbiota intestinal influye en tu estado de animo y decisiones.' },
      { title: 'Crononutricion', summary: 'No solo importa que comes, sino cuando lo comes.' },
    ],
  },

  // ========== 2. APARIENCIA ==========
  {
    areaKey: 'Apariencia',
    perspectives: {
      scientific: {
        title: 'Psicologia de la imagen personal',
        content: `La investigacion en psicologia social muestra que la apariencia afecta significativamente la autoconfianza y como los demas nos perciben. El "efecto halo" (Thorndike, 1920) demuestra que las personas atribuyen cualidades positivas a quienes perciben como cuidados y presentables.

Pero la ciencia tambien muestra algo mas profundo: el "enclothed cognition" (Adam y Galinsky, 2012) revela que la ropa que usamos afecta nuestro procesamiento cognitivo. Vestirse de manera intencional no es superficial: cambia como pensas y actuas.

El cuidado de la piel tiene base cientifica solida. La exposicion solar sin proteccion causa el 80% del envejecimiento visible. Una rutina basica de limpieza, hidratacion y proteccion solar es la inversion estetica con mayor retorno.`,
        keyInsight: 'Tu apariencia no define tu valor, pero si influye en tu confianza y en como navegas el mundo. Cuidarte es un acto de autorespeto.',
      },
      philosophical: {
        title: 'Autenticidad y presentacion',
        content: `La filosofia existencialista nos recuerda que somos seres "arrojados al mundo" y nuestra apariencia es parte de como nos presentamos ante los otros. Sartre hablaba de la "mirada del otro" como constitutiva de nuestra identidad.

Pero la clave no es vestirse para los demas: es que tu exterior refleje tu interior. Los japoneses tienen el concepto de "shibui": una belleza sutil que viene de la autenticidad, no del exceso.

Tu estilo personal es una forma de comunicacion no verbal. No se trata de seguir tendencias sino de encontrar tu propia estetica, esa que te hace sentir mas vos.`,
        keyInsight: 'La verdadera elegancia no es parecer alguien que no sos. Es encontrar la forma visual que mejor exprese quien sos realmente.',
      },
      practical: {
        title: 'Sistema de imagen personal',
        content: `El minimalismo aplicado al guardarropas funciona: un "capsule wardrobe" de 30-40 prendas bien elegidas cubre todas las situaciones y elimina la fatiga de decision matutina.

La rutina de cuidado personal no necesita ser compleja. Los dermatologos coinciden en 3 pasos: limpiar, hidratar, proteger. Todo lo demas es opcional.`,
        keyInsight: 'Menos decisiones de estilo = mas energia para lo que importa.',
        frameworks: [
          { name: 'Capsule wardrobe', description: 'Selecciona prendas versatiles que combinan entre si. Calidad sobre cantidad.' },
          { name: 'Rutina 3-2-1', description: '3 minutos de higiene facial, 2 minutos de vestimenta intencional, 1 minuto de revision general.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Mi apariencia actual refleja como me siento por dentro?',
      'Que mensaje quiero transmitir con mi estilo personal?',
      'Hay aspectos de mi apariencia que evito por miedo al juicio?',
      'Cuando fue la ultima vez que me senti realmente bien con como me veo?',
      'Estoy cuidando mi apariencia para mi o para cumplir expectativas ajenas?',
    ],
    mentalModels: [
      { name: 'Efecto halo inverso', description: 'Si te sentis bien con tu apariencia, tu confianza irradia y mejora tus interacciones.', application: 'Antes de una reunion importante, dedica 5 minutos a presentarte como queres ser percibido.' },
      { name: 'Principio de coherencia', description: 'Tu exterior debe ser coherente con tu interior. Las incongruencias generan incomodidad.', application: 'Elegí ropa y estilo que te hagan sentir autentico, no que sigan una moda que no te representa.' },
    ],
    recommendedHabits: [
      { name: 'Rutina de cuidado facial', description: 'Limpieza e hidratacion matutina y nocturna. 5 minutos que transforman tu piel.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Revision semanal del guardarropas', description: 'Prepara outfits para la semana el domingo. Elimina la fatiga de decision.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Proteccion solar diaria', description: 'Aunque este nublado. Es la medida anti-envejecimiento mas efectiva que existe.', difficulty: 'Principiante', frequency: 'Diario' },
    ],
    deepDiveTopics: [
      { title: 'Enclothed cognition', summary: 'Como la ropa cambia tu forma de pensar y actuar.' },
      { title: 'El minimalismo estetico', summary: 'Menos es mas: la elegancia de la simplicidad intencional.' },
    ],
  },

  // ========== 3. AMOR ==========
  {
    areaKey: 'Amor',
    perspectives: {
      scientific: {
        title: 'Neurociencia del vinculo',
        content: `John Gottman, tras 40 anos de investigacion en el "Love Lab" de la Universidad de Washington, identifico que las parejas exitosas mantienen una proporcion de 5:1 entre interacciones positivas y negativas. No es la ausencia de conflicto lo que importa, sino la proporcion de momentos de conexion.

La oxitocina, la "hormona del vinculo", se libera con el contacto fisico, las miradas sostenidas y las conversaciones profundas. Pero tambien descubrimos que el amor romantico activa las mismas areas cerebrales que la adiccion: el nucleo accumbens y el area tegmental ventral. El amor es biologicamente poderoso.

La teoria del apego (Bowlby, Ainsworth) muestra que nuestro estilo de apego infantil influye en como nos relacionamos en pareja. Reconocer tu patron (seguro, ansioso, evitativo) es el primer paso para construir vinculos mas sanos.`,
        keyInsight: 'El amor no es solo un sentimiento: es una practica diaria de atencion, generosidad y reparacion. Las parejas exitosas no tienen menos problemas, tienen mejores herramientas para navegarlos.',
      },
      philosophical: {
        title: 'Filosofia del encuentro',
        content: `Erich Fromm, en "El arte de amar", argumenta que el amor no es un sentimiento pasivo sino una actividad, un arte que requiere practica y disciplina. "Amar es dar, no recibir."

La filosofia existencialista agrega otra capa: el amor implica vulnerabilidad radical. Elegir amar es elegir exponerse al dolor potencial, y esa valentia es lo que le da profundidad.

Martin Buber hablo de las relaciones "Yo-Tu" versus "Yo-Ello": en el amor autentico, el otro no es un objeto que satisface nuestras necesidades, sino un ser completo al que elegimos encontrar una y otra vez.`,
        keyInsight: 'El amor es una decision renovada cada dia, no un sentimiento que aparece y desaparece. Requiere coraje, presencia y la voluntad de seguir eligiendo al otro.',
      },
      practical: {
        title: 'Construir relaciones solidas',
        content: `Gottman identifico cuatro patrones destructivos que predice el fracaso de una relacion con 94% de precision: critica, desprecio, actitud defensiva y evasion. Los llamo "Los Cuatro Jinetes del Apocalipsis".

Los antidotos son: expresar necesidades sin atacar, construir una cultura de aprecio, asumir responsabilidad, y auto-calmarse antes de responder.`,
        keyInsight: 'Las relaciones se construyen en los momentos pequenos, no en los grandes gestos.',
        frameworks: [
          { name: 'Ritual de conexion diaria', description: '6 segundos de beso + 20 minutos de conversacion sin pantallas = mantenimiento del vinculo.' },
          { name: 'Reparacion rapida', description: 'Cuando haya conflicto, la velocidad de reparacion importa mas que evitar el conflicto.' },
          { name: 'Mapa del amor', description: 'Conoce el mundo interior de tu pareja: sus suenos, miedos, historias. Actualiza ese mapa regularmente.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Cual es mi estilo de apego y como impacta mis relaciones?',
      'Estoy dando en mi relacion lo que me gustaria recibir?',
      'Que tan vulnerable me permito ser con mi pareja?',
      'Cuando fue la ultima vez que tuve una conversacion profunda con mi pareja sin distracciones?',
      'Que necesito expresar que vengo guardando?',
      'Si mi relacion terminara manana, que lamentaria no haber dicho o hecho?',
    ],
    mentalModels: [
      { name: 'Cuenta bancaria emocional', description: 'Cada interaccion positiva es un deposito, cada negativa un retiro. Mantene el balance en positivo.', application: 'Busca 5 momentos de conexion por cada momento de friccion.' },
      { name: 'Los cuatro jinetes', description: 'Critica, desprecio, defensividad y evasion destruyen relaciones. Identifica cual es tu patron.', application: 'Cuando notes un jinete, aplica su antidoto inmediatamente.' },
    ],
    recommendedHabits: [
      { name: '6 segundos de beso', description: 'Un beso de al menos 6 segundos al despedirse y al reencontrarse. Libera oxitocina y mantiene la conexion.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Conversacion sin pantallas', description: '20 minutos diarios de conversacion mirándose a los ojos. Sin telefono, sin TV, sin distracciones.', difficulty: 'Intermedio', frequency: 'Diario' },
      { name: 'Cita semanal', description: 'Una actividad diferente juntos cada semana. No tiene que ser cara, tiene que ser intencional.', difficulty: 'Intermedio', frequency: 'Semanal' },
    ],
    deepDiveTopics: [
      { title: 'Teoria del apego en adultos', summary: 'Como tu infancia moldea tus relaciones romanticas.' },
      { title: 'Comunicacion no violenta', summary: 'Expresar necesidades sin atacar ni generar defensividad.' },
    ],
  },

  // ========== 4. FAMILIA ==========
  {
    areaKey: 'Familia',
    perspectives: {
      scientific: {
        title: 'Dinamicas familiares',
        content: `La investigacion en sistemas familiares (Murray Bowen) muestra que las familias funcionan como sistemas emocionales interconectados. El nivel de "diferenciacion del self" - la capacidad de mantener tu identidad mientras estas emocionalmente conectado - es el predictor mas fuerte de salud familiar.

Los estudios longitudinales de Harvard (el estudio de 85 anos sobre la felicidad) encontraron que la calidad de las relaciones familiares es el mejor predictor de salud y bienestar a largo plazo, superando incluso la riqueza y el estatus.

Las "tradiciones familiares" no son solo nostalgia: la investigacion muestra que las rutinas y rituales familiares reducen la ansiedad infantil, fortalecen la identidad y crean resiliencia frente a la adversidad.`,
        keyInsight: 'La familia es el primer sistema al que pertenecemos. Sanarlo no significa que sea perfecto, sino que aprendamos a navegarlo con conciencia y limites sanos.',
      },
      philosophical: {
        title: 'Raices y alas',
        content: `Khalil Gibran escribio sobre los hijos: "Son los hijos e hijas del anhelo de la vida por si misma. Vienen a traves de ustedes pero no de ustedes." La familia es un espacio de pertenencia, pero no de posesion.

La filosofia ubuntu africana dice: "Yo soy porque nosotros somos." La familia nos recuerda que no somos individuos aislados sino parte de una red de relaciones que nos sostiene y nos da sentido.

Al mismo tiempo, la madurez implica individuarse: encontrar tu propia voz dentro del coro familiar, honrar tus raices sin ser prisionero de ellas.`,
        keyInsight: 'La familia te da raices para sostenerte y la madurez te da alas para volar. Necesitas ambas.',
      },
      practical: {
        title: 'Fortalecer lazos familiares',
        content: `Las familias resilientes comparten tres caracteristicas: comunicacion abierta, flexibilidad ante los cambios, y rituales compartidos. No se trata de la familia perfecta sino de una que puede hablar de lo que pasa.`,
        keyInsight: 'La calidad del tiempo familiar importa mas que la cantidad.',
        frameworks: [
          { name: 'Reunion familiar semanal', description: 'Un espacio regular para hablar, planificar y resolver temas. Sin juicios, con escucha activa.' },
          { name: 'Tradiciones intencionales', description: 'Crea o recupera rituales que den identidad y continuidad: cenas de los domingos, caminatas, juegos.' },
          { name: 'Conversaciones generativas', description: 'Haz preguntas que profundicen: "Que aprendiste hoy?" en vez de "Como te fue?"' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Que patrones familiares estoy repitiendo que me gustaria cambiar?',
      'En que se parece mi relacion con mi familia a lo que realmente quiero?',
      'Hay conversaciones pendientes que evito tener? Por que?',
      'Que tradicion familiar me gustaria crear o recuperar?',
      'Como puedo mejorar la calidad del tiempo que paso con mi familia?',
    ],
    mentalModels: [
      { name: 'Diferenciacion del self', description: 'Podes estar conectado emocionalmente sin perder tu identidad. Ni fusion ni desconexion.', application: 'Antes de reaccionar a un conflicto familiar, preguntate: esto es mio o estoy absorbiendo la emocion del otro?' },
      { name: 'Circulos de influencia', description: 'No podes cambiar a tu familia, pero si podes cambiar como te relacionas con ella.', application: 'Enfocate en lo que depende de vos: tu actitud, tus limites, tu comunicacion.' },
    ],
    recommendedHabits: [
      { name: 'Comida familiar sin pantallas', description: 'Al menos una comida al dia donde todos esten presentes y conectados.', difficulty: 'Intermedio', frequency: 'Diario' },
      { name: 'Llamada semanal a un familiar', description: 'Mantener el contacto activo con familiares que no ves seguido.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Actividad compartida mensual', description: 'Una salida, juego o proyecto que involucre a toda la familia.', difficulty: 'Intermedio', frequency: 'Mensual' },
    ],
    deepDiveTopics: [
      { title: 'Genograma familiar', summary: 'Mapa visual de patrones emocionales a traves de generaciones.' },
      { title: 'Limites sanos con la familia', summary: 'Como decir no con amor y firmeza.' },
    ],
  },

  // ========== 5. AMIGOS ==========
  {
    areaKey: 'Amigos',
    perspectives: {
      scientific: {
        title: 'Ciencia de la amistad',
        content: `Robin Dunbar, antropologo de Oxford, descubrio que el cerebro humano puede mantener aproximadamente 150 relaciones sociales estables (el "numero de Dunbar"). Dentro de esas, solo 5 son amistades intimas, 15 son amigos cercanos, y 50 son amigos casuales.

La soledad cronica tiene el mismo impacto en la mortalidad que fumar 15 cigarrillos diarios (Holt-Lunstad, 2015). Las amistades de calidad reducen el cortisol, fortalecen el sistema inmune y aumentan la longevidad.

Los estudios muestran que las amistades adultas requieren aproximadamente 200 horas de interaccion para desarrollarse plenamente. No se forman por proximidad pasiva sino por experiencias compartidas y vulnerabilidad reciproca.`,
        keyInsight: 'La amistad no es un lujo: es una necesidad biologica. La calidad de tus amistades predice tu salud y felicidad mas que casi cualquier otro factor.',
      },
      philosophical: {
        title: 'El arte de la amistad',
        content: `Aristoteles distinguia tres tipos de amistad: por utilidad (negocios), por placer (diversión), y por virtud (crecimiento mutuo). Solo la tercera es verdadera amistad: aquella donde ambos se inspiran a ser mejores personas.

Los estoicos valoraban la amistad como una de las pocas cosas realmente valiosas en la vida. Seneca le escribio a Lucilio: "Uno de los elementos mas bellos de la amistad es que el amigo te hace mas grande que vos mismo."`,
        keyInsight: 'Las mejores amistades son aquellas donde ambos crecen juntos. Busca amigos que te desafien a ser mejor, no solo que te hagan sentir comodo.',
      },
      practical: {
        title: 'Cultivar amistades profundas',
        content: `La amistad en la adultez requiere intencionalidad. A diferencia de la infancia, donde la proximidad creaba vinculos automaticamente, como adultos necesitamos crear activamente oportunidades de conexion.`,
        keyInsight: 'La amistad adulta no sucede por accidente. Requiere iniciativa, consistencia y vulnerabilidad.',
        frameworks: [
          { name: 'Regla del contacto proactivo', description: 'No esperes que te llamen. Agenda contactar a un amigo diferente cada semana.' },
          { name: 'Actividades ancla', description: 'Crea eventos recurrentes (asado mensual, caminata semanal) que den estructura a las amistades.' },
          { name: 'Profundidad sobre amplitud', description: 'Es mejor tener 5 amistades profundas que 50 superficiales.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Quienes son las 5 personas con las que paso mas tiempo? Me hacen mejor persona?',
      'Hay amistades que descuide y me gustaria recuperar?',
      'Soy el tipo de amigo que me gustaria tener?',
      'Que tan vulnerable me permito ser con mis amigos?',
      'Cuando fue la ultima vez que hice algo nuevo con un amigo?',
    ],
    mentalModels: [
      { name: 'Los 5 circulos de Dunbar', description: '5 intimos, 15 cercanos, 50 casuales, 150 conocidos. No podes tener relaciones profundas con 150 personas.', application: 'Invierte tu energia en tus 5-15 amigos mas cercanos. Calidad sobre cantidad.' },
      { name: 'Reciprocidad asimetrica', description: 'A veces vos das mas, a veces el otro. En el largo plazo debe equilibrarse.', application: 'Si siempre sos vos el que inicia contacto, tene una conversacion honesta sobre el vinculo.' },
    ],
    recommendedHabits: [
      { name: 'Mensaje semanal a un amigo', description: 'Un mensaje genuino, no un meme. Pregunta como esta, comparte algo tuyo.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Encuentro mensual presencial', description: 'Nada reemplaza verse en persona. Un cafe, una caminata, una cerveza.', difficulty: 'Intermedio', frequency: 'Mensual' },
      { name: 'Actividad grupal trimestral', description: 'Organiza algo con tu grupo de amigos. Ser el que convoca fortalece los lazos.', difficulty: 'Intermedio', frequency: 'Trimestral' },
    ],
    deepDiveTopics: [
      { title: 'Amistad masculina en el siglo XXI', summary: 'La crisis de soledad masculina y como construir vinculos autenticos.' },
      { title: 'Amistades toxicas', summary: 'Como identificar y manejar relaciones que te restan energia.' },
    ],
  },

  // ========== 6. CARRERA ==========
  {
    areaKey: 'Carrera',
    perspectives: {
      scientific: {
        title: 'Psicologia del trabajo significativo',
        content: `La investigacion de Amy Wrzesniewski (Yale) muestra que las personas pueden ver su trabajo como un "empleo" (pago), una "carrera" (avance), o un "llamado" (proposito). Quienes lo ven como llamado reportan mayor satisfaccion, independientemente del tipo de trabajo.

El concepto de "flow" de Mihaly Csikszentmihalyi muestra que la satisfaccion laboral maxima ocurre cuando el desafio iguala la habilidad. Demasiado facil = aburrimiento. Demasiado dificil = ansiedad. El punto dulce esta en el medio.

Carol Dweck demostro que una "mentalidad de crecimiento" (creer que las habilidades se desarrollan) predice mejor el exito profesional que el talento innato o el coeficiente intelectual.`,
        keyInsight: 'El exito profesional no depende tanto de encontrar el trabajo perfecto como de desarrollar la mentalidad correcta dentro de cualquier trabajo.',
      },
      philosophical: {
        title: 'Trabajo y sentido',
        content: `Viktor Frankl, sobreviviente del Holocausto y fundador de la logoterapia, enseno que el ser humano puede soportar cualquier "como" si tiene un "por que". Aplicado al trabajo: encontrar significado en lo que haces es mas importante que encontrar el trabajo perfecto.

Los japoneses tienen el concepto de "ikigai": la interseccion entre lo que amas, lo que el mundo necesita, por lo que te pagan, y en lo que sos bueno. No es un destino fijo sino una brujula que te orienta.`,
        keyInsight: 'No busques el trabajo de tus suenos. Construi suenos dentro de tu trabajo.',
      },
      practical: {
        title: 'Estrategia profesional',
        content: `Cal Newport propone el concepto de "capital de carrera": habilidades raras y valiosas que acumulas y que luego podes intercambiar por autonomia, impacto y proposito.`,
        keyInsight: 'Primero se bueno en algo valioso, despues pedi lo que queres.',
        frameworks: [
          { name: 'T-shaped skills', description: 'Profundidad en una disciplina + amplitud en varias. La combinacion unica te hace invaluable.' },
          { name: 'Practica deliberada', description: 'No repitas lo que ya sabes. Identifica tus debilidades y trabaja especificamente en ellas.' },
          { name: 'Red de valor', description: 'Tu red profesional no es la gente que conoces sino la gente a la que le aportaste valor.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Veo mi trabajo como empleo, carrera o llamado? Que me gustaria que fuera?',
      'Que habilidad, si la dominara, transformaria mi carrera?',
      'Estoy creciendo profesionalmente o estoy en piloto automatico?',
      'Que le diria a mi yo de hace 5 anos sobre mi carrera actual?',
      'Si el dinero no fuera un factor, que cambiaria de mi vida profesional?',
    ],
    mentalModels: [
      { name: 'Capital de carrera', description: 'Acumula habilidades raras y valiosas antes de pedir autonomia y proposito.', application: 'Cada semana, dedica al menos 2 horas a desarrollar una habilidad que te diferencie.' },
      { name: 'Ikigai', description: 'La interseccion de pasion, mision, vocacion y profesion.', application: 'Usa ikigai como brujula, no como destino. Es un proceso continuo de ajuste.' },
    ],
    recommendedHabits: [
      { name: 'Aprendizaje diario de 30 minutos', description: 'Lee, escucha podcasts o toma cursos en tu area. El conocimiento compuesto es poderoso.', difficulty: 'Intermedio', frequency: 'Diario' },
      { name: 'Revision semanal de objetivos', description: 'Cada viernes, evalua tu semana laboral y planifica la siguiente con intencion.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Networking genuino mensual', description: 'Conecta con alguien de tu industria sin pedir nada. Ofrece valor primero.', difficulty: 'Intermedio', frequency: 'Mensual' },
    ],
    deepDiveTopics: [
      { title: 'Deep work', summary: 'El arte del trabajo profundo sin distracciones en un mundo hiperconectado.' },
      { title: 'Portfolio career', summary: 'Multiples fuentes de ingreso y proyectos como modelo de carrera moderna.' },
    ],
  },

  // ========== 7. DINERO ==========
  {
    areaKey: 'Dinero',
    perspectives: {
      scientific: {
        title: 'Psicologia financiera',
        content: `Daniel Kahneman (Nobel de Economia) demostro que los humanos tomamos decisiones financieras irracionales sistematicamente. La "aversion a la perdida" nos hace sentir las perdidas con el doble de intensidad que las ganancias, lo que nos paraliza.

La investigacion muestra que la felicidad aumenta con el ingreso hasta un punto (aprox. USD 75.000/ano segun el estudio original; ajustado por inflacion y contexto local). Despues de ese umbral, mas dinero no genera mas felicidad cotidiana, aunque si mayor satisfaccion vital.

El "sesgo del presente" nos hace priorizar la gratificacion inmediata sobre el bienestar futuro. Por eso ahorrar es tan dificil: el cerebro valora los $100 de hoy mucho mas que los $200 en 10 anos.`,
        keyInsight: 'El dinero no compra felicidad, pero la falta de dinero compra miseria. El objetivo es llegar al punto donde el dinero deja de ser una fuente de estres.',
      },
      philosophical: {
        title: 'Dinero y libertad',
        content: `Los estoicos distinguian entre necesidades reales y deseos fabricados. Epicuro vivia con lo minimo y era profundamente feliz. La riqueza verdadera, decia, no es tener mucho sino necesitar poco.

Naval Ravikant propone: "La riqueza es tener activos que ganan mientras dormis." Pero agrega algo crucial: la verdadera riqueza es libertad de tiempo, no acumulacion de cosas.

El minimalismo financiero no es pobreza: es la claridad de saber que es suficiente para vos, y disenar tu vida alrededor de eso.`,
        keyInsight: 'La riqueza no se mide por lo que tenes sino por lo que no necesitas. El dinero es una herramienta de libertad, no un fin en si mismo.',
      },
      practical: {
        title: 'Finanzas personales practicas',
        content: `El principio fundamental es simple: gasta menos de lo que ganas e invierte la diferencia. Todo lo demas son variaciones de este principio.`,
        keyInsight: 'No es cuanto ganas, es cuanto conservas y como lo haces crecer.',
        frameworks: [
          { name: 'Regla 50/30/20', description: '50% necesidades, 30% deseos, 20% ahorro e inversion.' },
          { name: 'Fondo de emergencia', description: 'Antes de invertir, tene 3-6 meses de gastos guardados. Es tu seguro contra el estres.' },
          { name: 'Automatizacion financiera', description: 'Configura transferencias automaticas el dia que cobras. Lo que no ves, no gastas.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Que emociones me genera hablar de dinero? Ansiedad, culpa, poder, libertad?',
      'Mis gastos reflejan mis valores reales?',
      'Tengo un plan financiero o estoy improvisando?',
      'Que creencias sobre el dinero herede de mi familia que me limitan?',
      'Cuanto dinero necesitaria para sentirme tranquilo? Es un numero real o una meta movil?',
    ],
    mentalModels: [
      { name: 'Pagar primero a vos mismo', description: 'Apenas cobras, separa tu ahorro/inversion. Lo que queda es para gastar.', application: 'Automatiza una transferencia del 10-20% de tu ingreso a una cuenta de ahorro/inversion.' },
      { name: 'Costo de oportunidad', description: 'Cada peso que gastas en algo es un peso que no invertis en otra cosa. Incluido tu futuro.', application: 'Antes de una compra impulsiva, preguntate: esto vale mas que X meses de libertad financiera?' },
    ],
    recommendedHabits: [
      { name: 'Registro diario de gastos', description: 'Anota todo lo que gastas. La conciencia precede al cambio.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Presupuesto mensual', description: 'Planifica tus gastos antes de que ocurran. Deja de ser reactivo con tu dinero.', difficulty: 'Intermedio', frequency: 'Mensual' },
      { name: 'Educacion financiera semanal', description: 'Lee un articulo, escucha un podcast o mira un video sobre finanzas personales.', difficulty: 'Principiante', frequency: 'Semanal' },
    ],
    deepDiveTopics: [
      { title: 'Interes compuesto', summary: 'La octava maravilla del mundo segun Einstein. Como el tiempo multiplica tu dinero.' },
      { title: 'Independencia financiera', summary: 'El movimiento FIRE y como disenar tu vida sin depender de un salario.' },
    ],
  },

  // ========== 8. CRECIMIENTO PERSONAL ==========
  {
    areaKey: 'Crecimiento Personal',
    perspectives: {
      scientific: {
        title: 'Neuroplasticidad y cambio',
        content: `La neurociencia moderna destruyo el mito de que el cerebro adulto no cambia. La neuroplasticidad demuestra que podemos generar nuevas conexiones neuronales a cualquier edad. Aprender un idioma, un instrumento o una habilidad literalmente reconfigura tu cerebro.

La investigacion de Angela Duckworth sobre "grit" (determinacion) muestra que la persistencia predice el exito mejor que el talento. Las personas con alto grit no son mas inteligentes: son mas consistentes.

La psicologia positiva (Martin Seligman) identifico que el bienestar tiene 5 componentes: emociones positivas, compromiso (flow), relaciones, significado y logro (PERMA). El crecimiento personal no es un destino sino el equilibrio de estos cinco pilares.`,
        keyInsight: 'Tu cerebro esta disenado para crecer. Cada vez que aprendes algo nuevo, te convertis literalmente en una persona diferente a nivel neurologico.',
      },
      philosophical: {
        title: 'El camino del autoconocimiento',
        content: `Socrates dijo: "Una vida sin examen no merece ser vivida." El crecimiento personal comienza con la honestidad radical sobre quienes somos, no quienes pretendemos ser.

Nietzsche hablo del "Ubermensch": no un ser superior sino alguien que se supera a si mismo constantemente. La meta no es la perfeccion sino la evolucion.

En la tradicion zen, el concepto de "shoshin" (mente de principiante) sugiere abordar cada experiencia con curiosidad fresca, como si fuera la primera vez. El experto que cree saberlo todo deja de crecer.`,
        keyInsight: 'El crecimiento personal no es llegar a un destino. Es mantener la curiosidad y el coraje de seguir explorando quien podes ser.',
      },
      practical: {
        title: 'Sistemas de crecimiento',
        content: `El autoconocimiento sin accion es filosofia. La accion sin autoconocimiento es activismo ciego. Necesitas ambos: reflexion y experimentacion.`,
        keyInsight: 'Reflexiona para saber hacia donde ir. Actua para llegar. Reflexiona de nuevo para ajustar el rumbo.',
        frameworks: [
          { name: 'Diario de aprendizaje', description: 'Anota cada dia una cosa que aprendiste. Al final del ano tenes 365 lecciones.' },
          { name: 'Zona de expansion', description: 'Hace una cosa que te incomode cada semana. No tiene que ser grande, tiene que ser nueva.' },
          { name: 'Revision trimestral', description: 'Cada 3 meses, evalua tus valores, metas y habitos. Ajusta lo que ya no te sirve.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Que version de mi mismo estoy construyendo con mis habitos actuales?',
      'Cual es la creencia limitante que mas me frena?',
      'Que haria si supiera que no puedo fallar?',
      'Que estoy evitando aprender por miedo a ser principiante?',
      'Que feedback incomodo recibi recientemente que podria ser verdad?',
      'Si pudiera enviarle un mensaje a mi yo de hace 5 anos, que le diria?',
    ],
    mentalModels: [
      { name: 'Mentalidad de crecimiento', description: 'Las habilidades se desarrollan con esfuerzo. El fracaso es informacion, no identidad.', application: 'Cuando algo te sale mal, pregunta: que puedo aprender? en vez de no sirvo para esto.' },
      { name: 'La brecha y la ganancia', description: 'Medi tu progreso contra donde empezaste (la ganancia), no contra donde queres llegar (la brecha).', application: 'Cada vez que te frustres, mira cuanto creciste en el ultimo ano.' },
    ],
    recommendedHabits: [
      { name: 'Lectura diaria de 20 minutos', description: 'Lee libros, no solo articulos. La lectura profunda desarrolla empatia y pensamiento critico.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Journaling matutino', description: 'Escribe 3 paginas al despertar. Sin filtro, sin juicio. Aclara la mente.', difficulty: 'Intermedio', frequency: 'Diario' },
      { name: 'Una incomodidad semanal', description: 'Haz algo que te saque de tu zona de confort. Hablar en publico, probar algo nuevo, pedir feedback.', difficulty: 'Avanzado', frequency: 'Semanal' },
    ],
    deepDiveTopics: [
      { title: 'Metacognicion', summary: 'Pensar sobre como pensas: la habilidad mas poderosa que podes desarrollar.' },
      { title: 'Identidad liquida', summary: 'Como reinventarte sin perder tu esencia.' },
    ],
  },

  // ========== 9. ESPIRITUALIDAD ==========
  {
    areaKey: 'Espiritualidad',
    perspectives: {
      scientific: {
        title: 'Neurociencia de la trascendencia',
        content: `La meditacion no es misticismo: es entrenamiento cerebral. Estudios de Harvard (Sara Lazar, 2005-2011) mostraron que 8 semanas de meditacion mindfulness aumentan la densidad de materia gris en areas asociadas con la empatia, memoria y regulacion emocional, y reducen la amigdala (centro del miedo).

La practica de la gratitud activa el sistema de recompensa cerebral (nucleo accumbens) y reduce los biomarcadores de inflamacion. Tres cosas por las que agradecer antes de dormir cambia literalmente la quimica de tu cerebro.

Los estados de "awe" (asombro ante la naturaleza, el arte o lo trascendente) reducen los marcadores inflamatorios y aumentan la generosidad. Buscar experiencias que te hagan sentir pequeno frente a algo grande es medicina preventiva.`,
        keyInsight: 'La espiritualidad tiene efectos medibles en el cerebro y el cuerpo. No necesitas creer en nada sobrenatural para beneficiarte de practicas contemplativas.',
      },
      philosophical: {
        title: 'La busqueda de sentido',
        content: `La espiritualidad no requiere religion. Es la capacidad de conectar con algo mas grande que vos mismo: la naturaleza, el arte, la humanidad, el misterio de existir.

Thich Nhat Hanh enseno que la espiritualidad es presencia: "La vida solo esta disponible en el momento presente." No es escapar del mundo sino habitarlo plenamente.

Los misticos de todas las tradiciones coinciden en algo: el silencio interior revela verdades que el ruido exterior oculta.`,
        keyInsight: 'La espiritualidad es la capacidad de maravillarte, de encontrar silencio interior, y de sentir que perteneces a algo mas grande que vos mismo.',
      },
      practical: {
        title: 'Practicas contemplativas',
        content: `No necesitas irte a un monasterio. Las practicas espirituales mas poderosas son las mas simples: sentarte en silencio, caminar en la naturaleza, prestar atencion plena a lo ordinario.`,
        keyInsight: 'La practica espiritual mas avanzada es prestar atencion.',
        frameworks: [
          { name: '5 minutos de silencio', description: 'Senta en silencio sin hacer nada. Sin telefono, sin musica, sin objetivo. Solo estar.' },
          { name: 'Gratitud nocturna', description: 'Antes de dormir, nombra 3 cosas especificas del dia por las que estas agradecido.' },
          { name: 'Inmersion en naturaleza', description: 'Pasa tiempo en la naturaleza sin auriculares. Deja que tus sentidos sean tu guia.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Cuando fue la ultima vez que senti asombro o maravilla?',
      'Que me da un sentido de proposito mas alla de mi mismo?',
      'Cuanto silencio interior tengo en un dia promedio?',
      'Que me conecta con algo mas grande que yo?',
      'Si muriera manana, sentiria que vivi con sentido?',
    ],
    mentalModels: [
      { name: 'Atencion como recurso sagrado', description: 'Aquello a lo que prestas atencion es aquello que crece en tu vida.', application: 'Dedica atencion intencional a la belleza, la bondad y el misterio que ya existen a tu alrededor.' },
      { name: 'Impermanencia', description: 'Todo cambia, todo pasa. Esta verdad puede ser aterradora o liberadora.', application: 'Cuando algo bueno sucede, saborealo sabiendo que es temporario. Cuando algo malo sucede, sabe que tambien pasara.' },
    ],
    recommendedHabits: [
      { name: 'Meditacion de 10 minutos', description: 'Sentate, respira, observa tus pensamientos sin juzgarlos. Simple pero transformador.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Diario de gratitud', description: 'Anota 3 cosas especificas por las que agradeces. La especificidad es clave.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Caminata contemplativa semanal', description: 'Camina en la naturaleza sin telefono, prestando atencion plena a cada sentido.', difficulty: 'Principiante', frequency: 'Semanal' },
    ],
    deepDiveTopics: [
      { title: 'Mindfulness secular', summary: 'Meditacion sin dogma: la ciencia detras de prestar atencion.' },
      { title: 'Filosofia perenne', summary: 'Las verdades compartidas por todas las tradiciones espirituales del mundo.' },
    ],
  },

  // ========== 10. RECREACION ==========
  {
    areaKey: 'Recreación',
    perspectives: {
      scientific: {
        title: 'La ciencia del juego y el descanso',
        content: `Stuart Brown, fundador del National Institute for Play, demostro que el juego no es trivial: es esencial para la creatividad, la resolucion de problemas y la regulacion emocional. Los adultos que dejan de jugar se vuelven rigidos cognitiva y emocionalmente.

El descanso activo (hobbies, deportes recreativos, actividades creativas) es mas restaurador que el descanso pasivo (scroll en redes, TV). La razon: el descanso activo genera flow y engagement, mientras que el pasivo genera mas fatiga.

Las vacaciones tienen un "efecto de anticipacion": la mayor parte del beneficio en bienestar viene de planificar y esperar el viaje, no solo de vivirlo. Tener algo para esperar es un antidepresivo natural.`,
        keyInsight: 'La recreacion no es perder el tiempo: es invertir en tu capacidad de ser creativo, resiliente y feliz. El ocio con proposito es tan importante como el trabajo.',
      },
      philosophical: {
        title: 'El ocio como arte',
        content: `Los griegos no veian el ocio como pereza. "Schole" (de donde viene "escuela") significaba tiempo libre para el cultivo del espiritu. Para ellos, el ocio era el fin del trabajo, no al reves.

Josef Pieper escribio "El ocio: base de la cultura", argumentando que la contemplacion, el juego y la celebracion son lo que nos hace humanos. Una sociedad que solo trabaja se deshumaniza.`,
        keyInsight: 'No descanses para trabajar mejor. Trabaja para poder descansar, jugar y disfrutar. El goce no necesita justificacion productiva.',
      },
      practical: {
        title: 'Disenar tu tiempo libre',
        content: `El ocio productivo no es un oxímoron: es elegir actividades que te restauren y te hagan crecer al mismo tiempo.`,
        keyInsight: 'Planifica tu ocio con la misma intencion que planificas tu trabajo.',
        frameworks: [
          { name: 'Portfolio de hobbies', description: 'Tene al menos un hobby fisico, uno creativo y uno social.' },
          { name: 'Descanso periodizado', description: 'Micro-descansos diarios (15 min), descanso semanal (medio dia), macro-descanso trimestral (vacaciones).' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Que actividades me hacen perder la nocion del tiempo?',
      'Cuando fue la ultima vez que jugue sin proposito productivo?',
      'Mi tiempo libre me restaura o me agota mas?',
      'Que hobby abandoné que me gustaria retomar?',
      'Cuanto de mi ocio es activo (hobbies, deporte) vs. pasivo (scroll, TV)?',
    ],
    mentalModels: [
      { name: 'Descanso activo vs. pasivo', description: 'El descanso que te restaura requiere engagement, no solo ausencia de trabajo.', application: 'Reemplaza 30 minutos de scroll por 30 minutos de un hobby que te guste.' },
      { name: 'Anticipacion como felicidad', description: 'Tener algo para esperar genera tanta felicidad como vivirlo.', application: 'Siempre tene al menos un evento recreativo planificado en tu calendario.' },
    ],
    recommendedHabits: [
      { name: 'Hora sagrada de hobby', description: 'Dedica al menos 1 hora semanal a un hobby que disfrutes. No es negociable.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Actividad al aire libre', description: 'Pasa tiempo al aire libre haciendo algo fisico. Caminar, andar en bici, nadar.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Desconexion digital', description: 'Un bloque de 2+ horas sin telefono. Redescubri el aburrimiento creativo.', difficulty: 'Intermedio', frequency: 'Semanal' },
    ],
    deepDiveTopics: [
      { title: 'Flow y hobbies', summary: 'Como encontrar actividades que te pongan en estado de flujo.' },
      { title: 'Sabbatical y descanso profundo', summary: 'El arte de tomarte pausas largas para renovarte.' },
    ],
  },

  // ========== 11. ENTORNO ==========
  {
    areaKey: 'Entorno',
    perspectives: {
      scientific: {
        title: 'Psicologia ambiental',
        content: `La investigacion en psicologia ambiental muestra que nuestro entorno fisico afecta profundamente nuestro comportamiento, productividad y bienestar emocional. El desorden visual aumenta el cortisol (hormona del estres) y reduce la capacidad de concentracion.

La teoria de "affordances" de Gibson sugiere que nuestros espacios nos "invitan" a ciertos comportamientos. Una mesa limpia invita a trabajar. Un sillon comodo invita a descansar. Disenar tu entorno es disenar tu comportamiento.

La biofilia (amor por lo vivo) es innata: estudios muestran que tener plantas en un espacio reduce la presion arterial, mejora el humor y aumenta la creatividad. La luz natural regula el ritmo circadiano y mejora el sueno.`,
        keyInsight: 'Tu entorno no es neutral: constantemente te esta empujando hacia habitos positivos o negativos. Disenar tu espacio es una de las formas mas poderosas y subestimadas de cambiar tu vida.',
      },
      philosophical: {
        title: 'El espacio como reflejo interior',
        content: `La tradicion japonesa del "wabi-sabi" encuentra belleza en la imperfeccion y la simplicidad. Un espacio no necesita ser perfecto para ser bello: necesita ser intencional.

Marie Kondo popularizo una verdad antigua: rodearte solo de cosas que "te dan alegria" no es materialismo, es curaduria de tu entorno para que sostenga la vida que queres vivir.

La filosofia feng shui, mas alla de la supersticion, tiene un nucleo practico: el flujo de energia en un espacio afecta como te sentis en el. Un espacio donde todo tiene su lugar genera paz mental.`,
        keyInsight: 'Tu hogar es la extension fisica de tu mundo interior. Ordenar tu espacio es una forma de ordenar tu mente.',
      },
      practical: {
        title: 'Disenar tu entorno',
        content: `No necesitas renovar tu casa. Pequenos cambios estrategicos generan grandes impactos en como te sentis y actuas.`,
        keyInsight: 'Cambia tu entorno antes de intentar cambiar tu comportamiento. Es mas facil y mas efectivo.',
        frameworks: [
          { name: 'Diseno por fricccion', description: 'Haz que los habitos buenos sean faciles (pon la fruta a la vista) y los malos dificiles (guarda el control remoto).' },
          { name: 'Zona de reset diario', description: 'Antes de dormir, deja un area de tu casa lista para el dia siguiente. Te despertarás con menos estres.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'Mi espacio refleja quien quiero ser o quien era?',
      'Que hay en mi entorno que me genera estres innecesario?',
      'Cuando entro a mi casa, que siento? Paz, caos, indiferencia?',
      'Que cambiaria de mi espacio si tuviera un dia libre para dedicarle?',
      'Mi entorno facilita o dificulta mis habitos deseados?',
    ],
    mentalModels: [
      { name: 'Diseno de arquitectura de decision', description: 'Tu entorno toma decisiones por vos. Disenalo a tu favor.', application: 'Coloca lo que queres usar a la vista y guarda lo que queres evitar.' },
      { name: 'Teoria de las ventanas rotas', description: 'El desorden atrae mas desorden. Un espacio limpio se mantiene limpio.', application: 'Arregla la primera ventana rota (lo primero que ves desordenado) y el efecto cascada funciona a tu favor.' },
    ],
    recommendedHabits: [
      { name: 'Reset nocturno de 10 minutos', description: 'Antes de dormir, ordena las superficies principales. Despertar con orden cambia el dia.', difficulty: 'Principiante', frequency: 'Diario' },
      { name: 'Decluttering semanal', description: 'Elige una zona de tu casa y eliminá o reubicá lo que no usas. 15 minutos bastan.', difficulty: 'Principiante', frequency: 'Semanal' },
      { name: 'Planta o verde en cada espacio', description: 'Agrega una planta a cada habitacion que uses frecuentemente.', difficulty: 'Principiante', frequency: 'Una vez' },
    ],
    deepDiveTopics: [
      { title: 'Minimalismo funcional', summary: 'Tener menos para vivir mas: como aplicar el minimalismo sin extremismo.' },
      { title: 'Diseno biofílico', summary: 'Incorporar naturaleza en espacios urbanos para mejorar salud y bienestar.' },
    ],
  },

  // ========== 12. COMUNIDAD ==========
  {
    areaKey: 'Comunidad',
    perspectives: {
      scientific: {
        title: 'El poder de la pertenencia',
        content: `La investigacion de Robert Putnam ("Bowling Alone") documento como la disminucion del capital social en las sociedades modernas se correlaciona con peor salud, menor confianza y mayor desigualdad.

Los estudios muestran que el voluntariado regular reduce la mortalidad en un 22% (Corporation for National and Community Service, 2007). Ayudar a otros activa los centros de recompensa del cerebro: el "helper's high" es un fenomeno real con base neurologica.

Las comunidades con alta cohesion social tienen menores tasas de crimen, mejor salud publica y mayor resilencia ante desastres. El tejido social es infraestructura invisible pero vital.`,
        keyInsight: 'Participar en comunidad no es altruismo: es supervivencia. Los humanos estamos biologicamente disenados para prosperar en grupos cooperativos.',
      },
      philosophical: {
        title: 'El individuo y el todo',
        content: `Aristoteles dijo: "El hombre es un animal politico." No se referia a la politica partidaria sino a la polis: la vida en comunidad. Fuera de la comunidad, decia, solo hay bestias o dioses.

La filosofia ubuntu africana resume: "Soy porque somos." Mi bienestar esta inextricablemente ligado al bienestar de mi comunidad. No es caridad: es interdependencia.

El concepto de "Tikkun Olam" en la tradicion judia significa "reparar el mundo". Cada acto pequeno de servicio contribuye a la reparacion del tejido social.`,
        keyInsight: 'No podes florecer solo. Tu bienestar individual esta entretejido con el bienestar de tu comunidad.',
      },
      practical: {
        title: 'Construir comunidad',
        content: `La participacion comunitaria no requiere grandes gestos. Comienza con conocer a tus vecinos, participar en eventos locales, y ofrecer tu tiempo o habilidades.`,
        keyInsight: 'El cambio social empieza en tu cuadra. Actua localmente, impacta globalmente.',
        frameworks: [
          { name: 'Circulos de 3', description: 'Conecta a 3 personas de tu barrio o comunidad que no se conocen. Ser puente crea red.' },
          { name: 'Servicio basado en fortalezas', description: 'No des lo que sobra. Da lo que sabes hacer bien. Eso genera valor real.' },
          { name: 'Participacion escalonada', description: 'Empieza asistiendo, luego colaborando, luego liderando. Cada nivel profundiza tu conexion.' },
        ],
      },
    },
    selfReflectionPrompts: [
      'A que comunidad pertenezco realmente? No por obligacion sino por eleccion.',
      'Que puedo aportar a mi comunidad que sea unico en mi?',
      'Conozco los nombres de mis vecinos? Que necesitan?',
      'Cuando fue la ultima vez que ayude a alguien sin esperar nada a cambio?',
      'Que problema local me importa lo suficiente como para involucrarme?',
    ],
    mentalModels: [
      { name: 'Capital social', description: 'Las relaciones comunitarias son un recurso que crece con el uso, no se agota.', application: 'Invierte tiempo en conocer personas de tu barrio. Ese capital te va a sostener en momentos dificiles.' },
      { name: 'Efecto multiplicador', description: 'Un acto de servicio inspira a otros. Tu ejemplo es contagioso.', application: 'No subestimes el impacto de un gesto pequeno. Puede activar una cadena de bondad.' },
    ],
    recommendedHabits: [
      { name: 'Acto de servicio semanal', description: 'Una accion concreta para tu comunidad cada semana. Desde ayudar a un vecino hasta donar tiempo.', difficulty: 'Intermedio', frequency: 'Semanal' },
      { name: 'Conocer un vecino al mes', description: 'Presentate, pregunta su nombre, ofrece ayuda. La comunidad empieza con un "hola".', difficulty: 'Principiante', frequency: 'Mensual' },
      { name: 'Participar en un evento local', description: 'Asisti a una reunion vecinal, feria barrial o evento comunitario. Hace presencia.', difficulty: 'Principiante', frequency: 'Mensual' },
    ],
    deepDiveTopics: [
      { title: 'Organizacion comunitaria', summary: 'Como los ciudadanos pueden organizarse para resolver problemas locales.' },
      { title: 'Economia solidaria', summary: 'Modelos economicos basados en cooperacion en vez de competencia.' },
    ],
  },
];
