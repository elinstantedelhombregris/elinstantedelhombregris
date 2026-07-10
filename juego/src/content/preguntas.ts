import type { Pregunta } from './types';

/**
 * Corpus de preguntas hondas para la luz VER.
 * Extraídas verbatim de los ensayos de El Instante del Hombre Gris
 * (Indagaciones, ciclo de la Interdependencia y primer ciclo en castellano).
 * Rotación diaria determinística: día del año % PREGUNTAS.length.
 */
export const PREGUNTAS: Pregunta[] = [
  // ── La fábrica de obediencia (Indagaciones I) ─────────────────────────────
  {
    id: 'q001',
    texto: '¿Qué es esto que llamamos educación?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q002',
    texto:
      '¿Qué aprende un chico de seis años cuando le dicen "hacé silencio" treinta veces en una mañana?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q003',
    texto:
      '¿Qué aprende cuando la maestra dice "muy bien" y la cara se le ilumina, y otro día dice "está mal" y se le apaga?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q004',
    texto:
      '¿Cuándo fue la última vez que hiciste algo, cualquier cosa, sin medir cómo iba a ser recibido por una autoridad, real o imaginaria?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q005',
    texto:
      '¿Cuándo fue la última vez que dijiste lo que pensabas sin antes calcular si convenía decirlo?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q006',
    texto:
      '¿Qué se aprende en seis mil horas de escuchar sin hablar? ¿Se aprende a escuchar, o se aprende a callar? ¿No serán dos cosas distintas?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q007',
    texto:
      '¿Cuántos egresados conocés que hayan terminado la carrera más libres de lo que entraron?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q008',
    texto:
      '¿Y vos, si fuiste a la universidad, qué hiciste con tu pensamiento mientras estabas adentro?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q009',
    texto:
      '¿Qué hago yo, en mi vida cotidiana, con la inteligencia de los chicos que me rodean?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q010',
    texto:
      '¿Y si el problema de la educación argentina no fuera principalmente del Estado, ni de los gremios, ni de los rectores, sino de millones de adultos que, sin saberlo, le apagan la llama a un chico por día, todos los días, durante años?',
    fuente: 'La fábrica de obediencia',
  },
  {
    id: 'q011',
    texto:
      '¿Estás dispuesto a probar, mañana, en la próxima conversación con el chico que tenés más cerca, a no contestar rápido, a no corregir antes de mirar, a no llenar el silencio con tu propia ansiedad de tener algo que decir?',
    fuente: 'La fábrica de obediencia',
  },

  // ── El caudillo y el camino sin camino (Indagaciones II) ──────────────────
  {
    id: 'q012',
    texto:
      '¿Y cuántas veces, en algún rincón tuyo, esperaste que esta vez sí, que este sí, que el actual sí, fuera el que iba a cumplir?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q013',
    texto: '¿Por qué seguimos buscando padre?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q014',
    texto:
      '¿Cuándo, en la historia argentina del último siglo y medio, hubo una elección presidencial en la que el candidato ganador no haya sido vendido — y consumido — como redentor?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q015',
    texto: '¿Cuántos padres consumiste? ¿Cuántos te dejaste prometer?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q016',
    texto:
      '¿Cuántas veces te enojaste cuando no cumplieron, y cuántas veces, en lugar de revisar tu propia disposición a creer, transferiste tu fe al siguiente?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q017',
    texto:
      '¿Cuántas veces, en una asamblea, en una unidad básica, en una agrupación universitaria, la pregunta importante fue qué piensa Cristina, o qué hubiera dicho Néstor, o qué dice el conductor?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q018',
    texto:
      '¿Y vos, en qué cancha gritás? ¿Y cuándo fue la última vez que dejaste de gritar el tiempo suficiente como para escuchar lo que pasa en el resto del país?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q019',
    texto:
      '¿Cuántas veces tomaste, en serio, una posición política propia que no encajaba con ninguno de los bandos que tenías a mano?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q020',
    texto:
      '¿Estás dispuesto a dejar de militar? ¿O por lo menos a militar de otra manera — una manera donde la lealtad final no sea al espacio sino al país, y donde puedas decir en voz alta, sin miedo, que tu espacio se equivocó cuando se equivocó?',
    fuente: 'El caudillo y el camino sin camino',
  },
  {
    id: 'q021',
    texto:
      '¿Qué parte tuya necesita un padre? ¿Qué le pide al padre que no se permite pedirse a sí misma?',
    fuente: 'El caudillo y el camino sin camino',
  },

  // ── El miedo y el devenir (Indagaciones III) ──────────────────────────────
  {
    id: 'q022',
    texto: '¿Qué es, exactamente, el miedo que sentís?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q023',
    texto:
      '¿Este miedo es respuesta a lo que pasa en el país, o el país produce lo que produce porque está organizado alrededor de este miedo?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q024',
    texto:
      '¿Cuántas conversaciones importantes con tu pareja, con tus hijos, con vos mismo, están guardadas para un momento más tranquilo que nunca llega?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q025',
    texto:
      '¿Cuántos años invertiste esperando que el país se ordene para empezar a vivir el tuyo?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q026',
    texto:
      '¿Y si nunca mejora — o si mejora y empeora y mejora otra vez en ciclos de cinco años, como viene ocurriendo desde antes de que vos nacieras —, no se te va a haber ido la vida en esa espera?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q027',
    texto:
      '¿Cuándo, en los últimos años, estuviste plenamente presente — comiendo una comida sin pensar en el costo, abrazando a alguien sin la lista de cosas pendientes corriendo en paralelo, mirando un atardecer sin convertirlo inmediatamente en una metáfora de algo más, escuchando música sin que la cabeza fuera a otro lado?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q028',
    texto: '¿Qué es la ambición, en su raíz?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q029',
    texto:
      '¿Conocés a alguien — alguien rico, alguien famoso, alguien con poder, alguien con todo lo que prometía la ambición de su juventud — que esté en paz? ¿De verdad en paz, no actuando paz para las cámaras?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q030',
    texto:
      'Ser alguien. ¿No es uno ya alguien por el solo hecho de existir? ¿Hay seres humanos que sean nadie?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q031',
    texto: '¿Sentís que sos alguien ya, o todavía estás en camino a serlo?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q032',
    texto: '¿Cómo se baja de la rueda?',
    fuente: 'El miedo y el devenir',
  },
  {
    id: 'q033',
    texto: '¿Estás en el escalón en el que estás? ¿Lo habitás? ¿O solo lo usás como trampolín?',
    fuente: 'El miedo y el devenir',
  },

  // ── La libertad de lo conocido (Indagaciones IV) ──────────────────────────
  {
    id: 'q034',
    texto:
      '¿Te paraste alguna vez a preguntarte cuánto de lo que pensás sobre Argentina lo pensás vos, y cuánto te lo pensaron antes?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q035',
    texto:
      '¿Cuánto de tu posición política es una conclusión propia, llegada después de mirar y comparar, y cuánto es una herencia que recibiste con el apellido?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q036',
    texto: '¿Y vos, qué Argentina te imaginás cuando se te aprieta el pecho?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q037',
    texto:
      '¿Cuándo elegiste tu lado de la grieta? Pensalo en serio. ¿Hubo un día, una decisión, un momento en que comparaste argumentos, mediste evidencias, sopesaste posiciones, y elegiste? ¿O la grieta ya estaba antes — en tu familia, en tu barrio, en tu colegio, en tus amigos — y vos te encontraste, sin haberlo deliberado, ya colocado de un lado o del otro?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q038',
    texto:
      '¿Tu posición política sería radicalmente distinta si hubieras nacido en otra casa, en otro barrio, en otra familia?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q039',
    texto: '¿Vas a ser, durante toda tu vida, el daño que recibiste? ¿O vas a ser otra cosa?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q040',
    texto:
      '¿Hay alguna cosa, en vos, que no sea solo la sumatoria de lo que el país te hizo?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q041',
    texto:
      '¿No es la memoria una forma de respeto, una forma de no traicionar a los que sufrieron, una forma de no permitir que se repita?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q042',
    texto: '¿Cómo distinguir, en vos, entre memoria sana e identificación?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q043',
    texto:
      '¿Lo que recordás te ilumina el presente, o te lo tapa? ¿Te ayuda a actuar mejor hoy, o te paraliza? ¿Te abre, o te cierra?',
    fuente: 'La libertad de lo conocido',
  },
  {
    id: 'q044',
    texto:
      '¿Quién soy yo si no soy peronista? ¿Quién soy yo si no soy hijo de la generación que sufrió 1976? ¿Quién soy yo si no soy damnificado del corralito? ¿Quién soy yo si no soy heredero de los que hicieron grande este país?',
    fuente: 'La libertad de lo conocido',
  },

  // ── Conocerse sin espejo (Indagaciones V) ─────────────────────────────────
  {
    id: 'q045',
    texto: '¿Cuándo, en los últimos meses, te observaste sin analizarte?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q046',
    texto:
      '¿Cuándo te quedaste un rato con una sensación tuya — de enojo, de envidia, de tristeza, de miedo — sin apurarte a explicártela, a justificarla, a relacionarla con tu infancia, con tu padre, con el país? ¿Pudiste mirarla solamente, sin armarle una historia?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q047',
    texto:
      '¿No será nuestra mirada al país tan mediada por relatos disponibles — peronismo, antiperonismo, kirchnerismo, liberalismo, progresismo, libertarianismo — como nuestra mirada a nosotros mismos lo es por el psicoanálisis vulgarizado?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q048',
    texto: '¿Cuándo aprendiste a presentarte por etiquetas?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q049',
    texto: '¿Estás dispuesto a salir, aunque sea por ratos cortos, de tus propias etiquetas?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q050',
    texto:
      '¿Hay tensión en algún lado? ¿Está la respiración rápida o lenta? ¿Cómo está la mandíbula? ¿La frente? ¿Dónde está apoyado tu peso?',
    fuente: 'Conocerse sin espejo',
  },
  {
    id: 'q051',
    texto:
      '¿Cuántas veces, en una semana, estás a solas con vos durante más de quince minutos seguidos, sin pantalla, sin estímulo externo, sin actividad que te organice la atención?',
    fuente: 'Conocerse sin espejo',
  },

  // ── El amor sin apego (Indagaciones VI) ───────────────────────────────────
  {
    id: 'q052',
    texto:
      '¿Es esa la forma de servir a una causa, o es la forma de usar la causa para llenar un vacío personal?',
    fuente: 'El amor sin apego',
  },
  {
    id: 'q053',
    texto:
      '¿Sos capaz de amar al país aun cuando lo gobierna el bando contrario al tuyo? ¿Aun cuando hace cosas que te parecen mal? ¿Aun cuando una parte enorme de la población piensa cosas que te resultan inaceptables?',
    fuente: 'El amor sin apego',
  },
  {
    id: 'q054',
    texto: '¿Estás dispuesto a renunciar a la propiedad de la Argentina?',
    fuente: 'El amor sin apego',
  },
  {
    id: 'q055',
    texto:
      '¿Qué es, entonces, el amor — si no es deseo, dependencia, identificación ni sentimentalismo?',
    fuente: 'El amor sin apego',
  },
  {
    id: 'q056',
    texto:
      '¿Y qué es, en particular, el amor a un país, si no es la propiedad afectiva del país?',
    fuente: 'El amor sin apego',
  },

  // ── La sensibilidad como infraestructura (Indagaciones VII) ───────────────
  {
    id: 'q057',
    texto:
      '¿Notaste alguna vez la última vez que pasaste un día entero, en serio, en silencio? ¿Un día sin radio, sin pantalla, sin notificaciones, sin música de fondo, sin la voz constante de la cultura ambiente?',
    fuente: 'La sensibilidad como infraestructura',
  },
  {
    id: 'q058',
    texto:
      '¿Estás dispuesto a probar el silencio, no como práctica espiritual sino como entrenamiento cívico?',
    fuente: 'La sensibilidad como infraestructura',
  },
  {
    id: 'q059',
    texto:
      '¿Cuándo, en los últimos años, te quedaste un rato — no una tarde turística, un rato real — frente a un paisaje grande del país, sin teléfono, sin tomar fotos, sin distraerte, simplemente mirando?',
    fuente: 'La sensibilidad como infraestructura',
  },
  {
    id: 'q060',
    texto:
      '¿Cuándo, en los próximos seis meses, vas a darte un día completo en la naturaleza grande del país?',
    fuente: 'La sensibilidad como infraestructura',
  },
  {
    id: 'q061',
    texto: '¿En qué dirección estás moviendo, vos, el océano?',
    fuente: 'La sensibilidad como infraestructura',
  },
  {
    id: 'q062',
    texto: '¿Se puede subir el nivel de atención colectiva?',
    fuente: 'La sensibilidad como infraestructura',
  },

  // ── ¿De qué está hecha una nación? (Interdependencia I) ───────────────────
  {
    id: 'q063',
    texto:
      '¿De qué está hecha una nación? ¿De qué material? ¿Dónde está? ¿La viste alguna vez? ¿Podrías señalarla con el dedo?',
    fuente: '¿De qué está hecha una nación?',
  },
  {
    id: 'q064',
    texto: '¿Qué estoy sosteniendo yo, hoy, con mi acatamiento, mi silencio, mi costumbre?',
    fuente: '¿De qué está hecha una nación?',
  },

  // ── El bisturí de 1816 (Interdependencia II) ──────────────────────────────
  {
    id: 'q065',
    texto:
      '¿Dónde termina un cuerpo? ¿En la piel? ¿Y el aire de los pulmones, la flora del intestino, sin los cuales el cuerpo muere en días?',
    fuente: 'El bisturí de 1816',
  },
  {
    id: 'q066',
    texto:
      'La independencia total con la que soñamos cada 9 de julio, ¿existe? ¿Puede existir? ¿O llevamos doscientos años persiguiendo una palabra que no describe nada vivo?',
    fuente: 'El bisturí de 1816',
  },

  // ── La independencia ficticia (Interdependencia III) ──────────────────────
  {
    id: 'q067',
    texto:
      '¿A quién le declarás la independencia cuando el amo es un spread, un algoritmo, una categoría mental?',
    fuente: 'La independencia ficticia',
  },
  {
    id: 'q068',
    texto: '¿Qué es un sistema que no depende de nada?',
    fuente: 'La independencia ficticia',
  },
  {
    id: 'q069',
    texto: '¿Sos independiente vos?',
    fuente: 'La independencia ficticia',
  },
  {
    id: 'q070',
    texto: '¿Sentís el aire como una cadena, el pan como una deuda, el idioma como un yugo?',
    fuente: 'La independencia ficticia',
  },
  {
    id: 'q071',
    texto:
      '¿Cómo puede la dependencia ser a la vez la trama de la vida y el mecanismo de la servidumbre?',
    fuente: 'La independencia ficticia',
  },
  {
    id: 'q072',
    texto: '¿Qué significa ser independiente? ¿Es posible?',
    fuente: 'La independencia ficticia',
  },

  // ── Interdependencia: la palabra que faltaba (Interdependencia IV) ────────
  {
    id: 'q073',
    texto: '¿Podés vos solo hacer visible un hilo?',
    fuente: 'Interdependencia: la palabra que faltaba',
  },

  // ── Lo que perdemos si no lo vemos (Interdependencia V) ───────────────────
  {
    id: 'q074',
    texto: '¿Y qué se pierde, exactamente, por no mirar?',
    fuente: 'Lo que perdemos si no lo vemos',
  },
  {
    id: 'q075',
    texto: '¿Hasta cuándo se puede no mirar?',
    fuente: 'Lo que perdemos si no lo vemos',
  },

  // ── La práctica del tejido (Interdependencia VI) ──────────────────────────
  {
    id: 'q076',
    texto:
      '¿De cuántas horas de pantalla cuelga tu ánimo, y quién fija los términos de ese hilo?',
    fuente: 'La práctica del tejido',
  },
  {
    id: 'q077',
    texto: '¿De cuántos ingresos únicos cuelga tu casa?',
    fuente: 'La práctica del tejido',
  },
  {
    id: 'q078',
    texto: '¿Qué firmaste sin leer? ¿Qué comés sin saber de dónde viene?',
    fuente: 'La práctica del tejido',
  },

  // ── Por qué los presidentes son una idea estúpida (Primer ciclo I) ────────
  {
    id: 'q079',
    texto: 'Sí, pero ¿qué hago el lunes?',
    fuente: 'Por qué los presidentes son una idea estúpida',
  },

  // ── La falacia del poder mismo (Primer ciclo III) ─────────────────────────
  {
    id: 'q080',
    texto:
      'Si el poder es ficción, ¿qué es real? ¿Qué causa, de verdad, la acción humana coordinada?',
    fuente: 'La falacia del poder mismo',
  },
  {
    id: 'q081',
    texto:
      '¿Qué contribuiría yo, si supiera que mi contribución es la tela real? ¿A quién influiría, si supiera que la influencia es la corriente real?',
    fuente: 'La falacia del poder mismo',
  },
  {
    id: 'q082',
    texto:
      '¿A qué le daría mi consentimiento, y de qué lo retiraría, si supiera que el consentimiento es el soberano real?',
    fuente: 'La falacia del poder mismo',
  },

  // ── La soberanía del hombre gris (Primer ciclo V) ─────────────────────────
  {
    id: 'q083',
    texto: '¿Qué vas a hacer cuando finalmente creas que el disfraz no es tu piel?',
    fuente: 'La soberanía del hombre gris',
  },
  {
    id: 'q084',
    texto: '¿A qué le estás diciendo sí que deberías estar diciendo no?',
    fuente: 'La soberanía del hombre gris',
  },

  // ── La belleza como acto político (Primer ciclo VI) ───────────────────────
  {
    id: 'q085',
    texto:
      'Aprendimos a preguntar ¿funciona? y ¿escala? y ¿cuánto cuesta?, pero dejamos de hacer la pregunta más vieja: ¿es hermoso?',
    fuente: 'La belleza como acto político',
  },
  {
    id: 'q086',
    texto:
      '¿Qué hacés todos los días que tenga belleza? ¿Qué hacés todos los días que esté gobernado por la estética de la captura — la conveniencia barata, la experiencia manufacturada, la interacción descartable?',
    fuente: 'La belleza como acto político',
  },
  {
    id: 'q087',
    texto:
      '¿Dónde, en tu vida, se está practicando belleza compartida — en la mesa, en la conversación, en la celebración, en el rito?',
    fuente: 'La belleza como acto político',
  },
  {
    id: 'q088',
    texto:
      '¿Qué música, qué literatura, qué tradición, qué idioma, qué memoria está esperando que la reclames?',
    fuente: 'La belleza como acto político',
  },
  {
    id: 'q089',
    texto:
      '¿Cuándo fue la última vez que te paraste frente a algo más grande que vos y sentiste la pequeñez apropiada?',
    fuente: 'La belleza como acto político',
  },
];
