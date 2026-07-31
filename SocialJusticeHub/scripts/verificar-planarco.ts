/**
 * Guardia del documento de PLANARCO.
 *
 * Run: npx tsx scripts/verificar-planarco.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las cifras canónicas ya escritas aparezcan, que los strings
 * prohibidos no aparezcan, que no queden marcadores de pendiente, y que el
 * documento no se invente un piso constitucional.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * Cada tarea del plan agrega sus secciones a SECCIONES_ESPERADAS antes de
 * escribirlas: primero la guardia falla, después el documento la hace pasar.
 * SECCIONES_ESPERADAS arranca con lo único que la Task 1 escribe —el H2 del
 * mandato— porque la guardia tiene que salir 0 al cierre de cada tarea; la
 * Task 2 le agrega el PREÁMBULO y la TESIS CENTRAL cuando las escriba.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANARCO_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANARCO no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** El H2 del mandato. Vive aparte porque la anatomía lo necesita para verificar POSICIÓN. */
const H2_MANDATO = '## Vigésimo Quinto Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — LA VIDA QUE NADIE MIRÓ ENTERA',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS OCHO FALLAS DEL ARCO DE LA VIDA ARGENTINO',
  '## SECCIÓN 1: LA CRISIS — EL PAÍS SE ESTÁ HACIENDO VIEJO SIN HABER DECIDIDO CÓMO SE ENVEJECE',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  '## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES',
  // Task 5: SECCIÓN 4 · Task 6: SECCIÓN 5 y 6 · …
];

/**
 * Domicilio de la cabecera: el tramo ANTERIOR al primer H2. Ahí viven los
 * metadatos —el ACTA DE HABILITACIÓN, el presupuesto, los principios— y no
 * cuelgan de ningún encabezado, así que necesitan una etiqueta propia.
 */
const CABECERA = '(cabecera)';

/**
 * Las ocho fallas de la SECCIÓN 0 llevan la forma de PLANPACTO:96-130 y son
 * OCHO, ni siete ni nueve: el H2 de la sección lo promete en el título. Sin
 * esto, borrar una falla entera salía verde — el mismo modo de falla que la
 * portada tenía antes de que la anatomía se declarara acá.
 *
 * Se verifica la numeración `### 0.N` correlativa de 1 a 8 y, adentro de cada
 * una, los tres leads en negrita que el brief manda. Los leads se buscan sobre
 * el texto CON negritas a propósito: la forma es el lead en negrita, no la
 * palabra suelta, y sobre `rawPlano` un párrafo sin negrita pasaría igual.
 */
const FALLAS_ESPERADAS = 8;
const LEADS_DE_FALLA: string[] = ['**La falla:**', '**Por qué persiste:**', '**El dato:**'];

/**
 * Cifras y fórmulas verificadas que el documento no puede contradecir ni perder.
 * Cada una tiene domicilio abierto y leído antes de escribirla.
 *
 * OJO — acá van solo NÚMEROS. Las afirmaciones sin cifra van en
 * ASERCIONES_OBLIGATORIAS, abajo. Los totales de tabla NO viven en ninguna de
 * las dos: se buscan como string y siguen apareciendo en la prosa aunque la
 * tabla que los produce esté rota. Esos se suman — ver verificarTablas().
 *
 * DOMICILIO — el campo `en`, agregado en la Task 4, y es el arreglo de la
 * QUINTA forma del mismo defecto que esta guardia viene arrastrando: un chequeo
 * que informa éxito sin haber verificado nada. Hasta acá los dos bucles corrían
 * `raw.includes()` sobre el archivo ENTERO, y hoy hay cinco valores que
 * aparecen en más de un lugar. Verificado antes del arreglo: borrar
 * «18% del PBI» de §1.2 salía **exit 0**, porque el mismo número sobrevive en
 * §0.4 — o sea, la falla que la cifra existe para impedir, pasando en verde.
 * `en` lista los encabezados —H2 o H3, o `(cabecera)` para el tramo anterior al
 * primer H2— donde el valor tiene que estar, y se exige en CADA uno.
 *
 * `veces` es el mínimo de ocurrencias adentro del domicilio, y va solo donde un
 * valor legítimamente aparece dos veces en el mismo encabezado —la cita y su
 * declaración— y perder una de las dos es perder la mitad del sentido. Sin él,
 * la granularidad del chequeo vuelve a ser más gruesa que la unidad verificada,
 * que es exactamente el defecto que este arreglo cierra.
 */
type ValorConDomicilio = { valor: string; en: string[]; veces?: number; porQue: string };

/** Los encabezados que se usan como domicilio, escritos una sola vez. */
const H3_FALLA_CUIDADO = '### 0.4 El trabajo que sostiene el sistema no tiene renglón donde anotarse';
const H3_FALLA_VACIAMIENTO = '### 0.8 Lo que no se financia no se deroga: se deja de ejecutar';
const H3_CURVA = '### 1.1 La curva ya está andando, y el único número que la describe es una cuenta';
const H3_CUIDADORES = '### 1.2 La crisis no es que haya más viejos: es que no hay quién los acompañe';
const H2_TESIS = '## TESIS CENTRAL';
const H2_PRECEDENTES = '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES';
const H2_CALENDARIO = '## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES';

const CIFRAS_CANONICAS: ValorConDomicilio[] = [
  {
    valor: '1,77–2,13x',
    en: [CABECERA],
    porQue: 'gate de spin-off contra PLANCUIDADO — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:24',
  },
  {
    valor: '8,83–16,00x',
    en: [CABECERA],
    porQue: 'gate de spin-off contra PLANSAL — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:25',
  },
  {
    valor: '1,47–1,88x',
    en: [CABECERA],
    porQue:
      'gate contra los dos huéspedes sumados: NO PASA contra un umbral de 1,5 — ACTA:26, :41-47. ' +
      'Sin este cociente escrito, la cabecera cuenta media verdad',
  },
  {
    valor: 'umbral de 1,5',
    en: [CABECERA],
    porQue: 'el cociente que falla no significa nada sin el umbral contra el que falla — ACTA:42-43',
  },
  {
    valor: '53.000–96.000M',
    en: [CABECERA],
    porQue:
      'el presupuesto a quince años sobre el que se corrió el gate — scripts/gate-spinoff-planes-nuevos.ts:25. ' +
      'El rango ANUAL no se escribe hasta la Task 8 (hallazgo C-5)',
  },
  {
    valor: 'más de 10 millones',
    en: [H3_CURVA],
    veces: 2,
    porQue:
      'la proyección 2040 de 60+, ÚNICA del corpus — PLANREP:367. Va DOS veces en §1.1 y las dos ' +
      'hacen falta: la cita textual de PLANREP y la declaración de que es cuenta del propio PLANREP ' +
      'y no medición. Sin la segunda, el número queda escrito como si detrás hubiera INDEC, CELADE u ONU',
  },
  {
    valor: '150.000 cuidadores',
    en: [H3_CUIDADORES],
    porQue:
      'el déficit de cuidadores formales — PLANREP:335, :367. Es la mitad de la crisis que la curva ' +
      'demográfica sola no muestra: el que va a cuidar tampoco está',
  },
  {
    valor: '18% del PBI',
    en: [H3_FALLA_CUIDADO, H3_CUIDADORES],
    porQue:
      'el volumen del cuidado no remunerado — PLANCUIDADO:94, que lo escribe en letras. Sostiene dos ' +
      'cosas distintas en dos lugares distintos: la falla 0.4 (sin él es una opinión) y la escala de ' +
      'la crisis en §1.2. Con un solo domicilio, borrarlo de uno de los dos salía verde',
  },
  {
    valor: '60% del presupuesto',
    en: [H3_FALLA_VACIAMIENTO],
    porQue:
      'el recorte al INTA en los años 90 — BLINDAJE:44. Aserción del corpus SIN fuente externa, y la ' +
      'evidencia del modo de falla más probable de este PLAN: no se deroga, se deja de ejecutar',
  },
  {
    valor: 'enero de 2002',
    en: [H3_FALLA_VACIAMIENTO],
    porQue:
      'la Convertibilidad «se derogó en una noche de enero de 2002» — BLINDAJE:50. El contracaso del ' +
      'INTA: derogar tampoco cuesta tanto cuando la presión alcanza',
  },
];

/**
 * Afirmaciones sin cifra que el documento está obligado a hacer, con el mismo
 * domicilio que las cifras. Viven aparte porque no son números: mezclarlas
 * con CIFRAS_CANONICAS hacía que la constante mintiera sobre su contenido, y
 * son nueve las tareas que la extienden.
 */
const ASERCIONES_OBLIGATORIAS: ValorConDomicilio[] = [
  {
    valor: 'derogación expresa',
    en: [CABECERA],
    porQue:
      'la autoridad real por la que este PLAN existe: regla 5 y condición temporal de la regla 3, ' +
      'derogadas con nombre y fecha — ACTA:131-137',
  },
  {
    valor: 'sin piso constitucional propio',
    en: [CABECERA, H2_TESIS],
    porQue: 'el arco es eje transversal adentro de los ocho escalones, no un escalón nuevo (C-2)',
  },
  {
    valor: 'la porción de vejez',
    en: [CABECERA, H2_TESIS],
    porQue:
      'el acta retira solo la vejez del hueco «Discapacidad y vejez»; la discapacidad queda en ' +
      'PLANCUIDADO + PLANSAL y PLANARCO tiene que decirlo — ACTA:169-173',
  },
  {
    valor: 'extrapolación aritmética',
    en: [H3_CURVA],
    porQue:
      'la proyección 2040 es una cuenta del propio PLANREP (7,3M × 1,03^14) y no una medición. ' +
      'Escribir el número sin esta declaración es estrenar una cifra demográfica que nadie midió',
  },
  {
    valor: 'aserción propia sin fuente',
    en: [H2_PRECEDENTES],
    porQue:
      'la disciplina que costó el hallazgo Crítico del tramo B: la sección que DEFIENDE al PLAN es la ' +
      'que menos se revisa. Un precedente sin cita en el corpus se declara como tal, no se escribe ' +
      'como si fuera sabido (PLANPACTO:232 usa esta misma fórmula)',
  },
  // ── Task 4 · SECCIÓN 3 ────────────────────────────────────────────────────
  {
    valor: 'Cuando materia y edad entran en conflicto',
    en: [H2_CALENDARIO],
    porQue:
      'el ANTECEDENTE CONDICIONAL de la Regla de Arco (PLANPACTO:428), y va pegado a la cláusula que ' +
      'lo sigue. Sin él, «la materia decide el escalón y el arco decide adentro del escalón» se lee ' +
      'como jerarquía permanente y no como regla de desempate. Es la operación que PLANPACTO:416 ' +
      'condena por escrito sobre sí mismo: «el calificador va escrito porque la cláusula lo tiene y ' +
      'sin él la cita parece más fuerte de lo que es»',
  },
  {
    valor: 'no escribe regla de reparto propia',
    en: [H2_CALENDARIO],
    porQue:
      'la mitad de ARCO del par recíproco. PLANPACTO:430 ya escribió la suya —«PLANARCO remite a esta ' +
      'sección y no escribe su propia regla de reparto»— y esta es la aceptación explícita (C-1)',
  },
  {
    valor: 'Techo A',
    en: [H2_CALENDARIO],
    porQue:
      'la movilidad de la Renta de Arco es Techo A POR MATERIA PREVISIONAL (PLANPACTO:343, que ya ' +
      'ubica lo previsional adentro del Techo A), no una categoría nueva. «Precompromiso» está ' +
      'prohibido justamente porque estrenar categoría es lo que PLANPACTO:381 cierra por anticipado (C-4)',
  },
  {
    valor: 'capa 4',
    en: [H2_CALENDARIO],
    porQue:
      'el blindaje del arco es la capa SOCIAL de BLINDAJE:197, no la legal: «ley» es la capa 1 y ' +
      'BLINDAJE:194 la llama «Protección media». La fórmula de la spec estaba mal y la sección la corrige (arreglo 12)',
  },
  {
    valor: 'el corralito no aplica',
    en: [H2_CALENDARIO],
    porQue:
      'el análogo de BLINDAJE:63 son cinco millones con AHORROS en El Pulso —propiedad—, y el Piso ' +
      'Vital es una transferencia: no se confisca, se licúa o se deja de pagar. Decirlo explícito es ' +
      'lo que impide que la sección se apoye en una analogía que no la sostiene',
  },
];

/**
 * Anatomía de la cabecera. El brief manda seis elementos y sin esto la guardia
 * verificaba uno y medio: borrar el H1, el H3 de versión y la portada entera
 * salía verde. La portada es el artefacto que nadie vuelve a mirar —en el tramo
 * anterior anunció cuatro dispositivos con cero ocurrencias en el cuerpo—, así
 * que su contenido se declara acá y no se deja a la disciplina.
 */
const H1_ESPERADO = /^# PLANARCO — .+$/m;
/**
 * `\p{L}+` y no `\w+` para el mes: `\w` es `[A-Za-z0-9_]` y no cubre las tildes.
 * Hoy ningún mes castellano lleva tilde, pero es la misma clase de bug latente
 * que hacía que `/\bést[aeo]s?\b/` no marcara nunca nada.
 */
const H3_VERSION_ESPERADO = /^### Versión \d+\.\d+ — \p{L}+ \d{4}$/mu;

/**
 * Los trece dispositivos de la tabla «Los trece dispositivos» del plan del
 * tramo (v2/docs/plans/2026-07-31-tramo-c-planarco.md:171-187). Cada entrada
 * lista los fragmentos literales que tienen que estar en el bloque cercado de
 * la portada. Uno solo tiene dos fragmentos porque el plan lo cuenta como un
 * dispositivo con dos nombres.
 *
 * Esta constante cubre la dirección «¿están los trece?». La contraria —«¿hay un
 * catorceavo?»— la cierra verificarPortadaNoAnunciaDeMas(), abajo, con el mismo
 * léxico: no hace falta el cuerpo porque el conjunto legítimo de nombres de la
 * portada es cerrado y conocido hoy.
 *
 * Lo que sí necesita el cuerpo, y es de la Task 10, es la tercera dirección:
 * «cada dispositivo anunciado en el ASCII tiene ocurrencias en el cuerpo».
 */
const DISPOSITIVOS_EN_PORTADA: { nombre: string; enPortada: string[] }[] = [
  { nombre: 'Calendario de Umbrales', enPortada: ['Calendario de Umbrales'] },
  { nombre: 'Renta de Arco (tres tramos)', enPortada: ['Renta de Arco'] },
  { nombre: 'Dote de Origen', enPortada: ['Dote de Origen'] },
  { nombre: 'Umbral de la Llegada', enPortada: ['Umbral de la Llegada'] },
  { nombre: 'Acta de Bienvenida', enPortada: ['Acta de Bienvenida'] },
  { nombre: 'El Pasaje (cuatro viajes)', enPortada: ['El Pasaje'] },
  { nombre: 'El Alto de los Cuarenta y Cinco', enPortada: ['El Alto de los Cuarenta y Cinco'] },
  { nombre: 'La Rampa de Salida 60–72', enPortada: ['Rampa de Salida 60–72'] },
  { nombre: 'Casa de Dos Edades', enPortada: ['Casa de Dos Edades'] },
  { nombre: 'Casa de Arco', enPortada: ['Casa de Arco'] },
  { nombre: 'La Última Palabra', enPortada: ['La Última Palabra'] },
  {
    nombre: 'El Año del Duelo + Acompañante de Umbral',
    enPortada: ['El Año del Duelo', 'Acompañante de Umbral'],
  },
  { nombre: 'El Umbral del Legado', enPortada: ['Umbral del Legado'] },
];

/** La ANAV no es dispositivo —es la institución de la Sección 8— pero la portada la anuncia. */
const INSTITUCION_EN_PORTADA = 'Agencia Nacional del Arco de la Vida (ANAV)';

/**
 * Calificadores que la portada tiene derecho a llevar además de los nombres de
 * los trece dispositivos: los tres tramos de la Renta de Arco y las edades del
 * Pasaje. Con esto el conjunto de lo que la portada puede nombrar queda CERRADO
 * y conocido hoy, sin una palabra del cuerpo.
 */
const CALIFICADORES_EN_PORTADA: string[] = [
  ': Piso Vital Universal',
  'Tramo Ganado',
  'Tramo Común',
  ': cuatro viajes a los 12, 18, 45 y 60',
];

/**
 * La región de conjunto exacto de la portada es el BLOQUE CERCADO ENTERO. Todo
 * lo que aparezca ahí y no esté en el léxico permitido es un nombre anunciado de
 * más — el modo de falla exacto del tramo B, donde la portada anunció cuatro
 * nombres que no estaban en ninguna sección del plan.
 *
 * La región tuvo dos mojones y los dos fallaron abierto. El de inicio
 * (`PLANARCO`) dejaba el eslogan y el subtítulo afuera: un `Servicio Cívico`
 * plantado en el subtítulo salía verde. El de cierre (`Preparado para`) dejaba
 * afuera el pie —un `Servicio Cívico` pegado a `Registros Civiles` salía
 * verde— y, peor, no estaba anclado: una línea `Preparado para nada` plantada
 * ARRIBA ponía el fin en el índice 0, el bucle no iteraba ninguna línea y la
 * guardia informaba «conjunto exacto: ni falta ni sobra» sin haber mirado nada.
 * Un chequeo truncable que reporta éxito es peor que no tenerlo.
 *
 * El arreglo no es un mojón mejor sino NINGUNO: la región es el bloque entero, y
 * el encabezado y el pie legítimos pasan a ser léxico permitido como cualquier
 * otro nombre. Sin mojones no hay región que colapsar.
 */

/** El encabezado legítimo de la portada: los dos renglones del eslogan, el subtítulo y la sigla. */
const PORTADA_ENCABEZADO: string[] = [
  'NACER NO ES UNA LOTERÍA',
  'MORIR NO ES UN TRÁMITE',
  'Plan Nacional del Arco de la Vida, Calendario de Umbrales y Renta de Arco',
  'PLANARCO',
];

/**
 * El pie legítimo de la portada: destinatarios, organismos, fecha y leyenda de
 * circulación. Antes quedaba afuera del conjunto exacto porque `Preparado para`
 * era el mojón de cierre; ahora entra al léxico y el tramo posterior se verifica
 * como el resto.
 */
const PORTADA_PIE: string[] = [
  'Preparado para la República Argentina',
  'Congreso de la Nación · Ministerio de Capital Humano · ANSES · PAMI',
  'Provincias · Municipios · Registros Civiles',
  'Julio 2026 | Versión 1.0',
  'DOCUMENTO ESTRATÉGICO — PARA REVISIÓN AUTORIZADA',
];

/**
 * Strings que no pueden aparecer, con el motivo de cada uno.
 * Case-insensitive salvo donde el corpus distingue mayúsculas: las siglas
 * (PUAM, PNC) y los marcadores de pendiente.
 * `salvoSi` exime la ocurrencia cuando la línea que la contiene la atribuye.
 *
 * OJO — estos patrones se corren sobre el texto SIN negritas (ver `rawPlano` en
 * main()). El corpus escribe en negrita permanentemente, y un `**` en el medio
 * de la frase hacía fallar abierto al prohibido más importante de todos.
 */
const PROHIBIDOS: { patron: RegExp; porQue: string; salvoSi?: RegExp }[] = [
  {
    patron: /\b(PUAM|PNC)\b/,
    porQue: 'cero ocurrencias en el corpus: no se estrenan siglas de partidas cuyo monto nadie tiene (C-6)',
  },
  {
    // El lookbehind es de ancho variable (V8 lo soporta) porque la negación
    // castellana no siempre está pegada al verbo: «no lo supera el umbral»,
    // «Ninguno de los cuatro superó el gate» —paráfrasis del ACTA:115, :36— son
    // las dos frases verdaderas que un lookbehind de ancho fijo marcaba en rojo.
    // Una guardia que se pone roja sobre una frase honesta empuja a reescribir
    // la frase, no la regex, y eso degrada el documento que la guardia protege.
    //
    // ALCANCE REAL, y no es el que este comentario prometía hasta el 2026-07-31:
    // el hueco entre la negación y el verbo corta SOLO contra un límite de
    // cláusula (`.`, `;`, `:`, salto de línea) y contra cinco nexos literales
    // —`y`, `pero`, `aunque`, `sino`, `mas`—. Cualquier otro nexo devuelve la
    // afirmación al alcance de una negación lejana y la deja pasar. Verificado,
    // las cuatro salen VERDES: «no cierra, ya que supera el gate» (la coma sola
    // no corta), «no cierra porque supera el gate», «no cierra mientras supera
    // el gate», «no cierra cuando supera el gate», «no cierra si supera el
    // umbral». Lo que sí atrapa: «PLANARCO supera el gate» y «PLANARCO no es el
    // primero y supera el gate».
    //
    // SEGUNDO EJE, del mismo tamaño y más fácil de olvidar porque este comentario
    // no lo nombraba: el patrón conoce SOLO seis flexiones (`pasó`, `paso`,
    // `superó`, `supero`, `supera`, `pasa`) y exige el artículo PEGADO al verbo.
    // Verificado, salen VERDES «PLANARCO logró superar el gate», «PLANARCO habría
    // superado el gate», «los cocientes superan el umbral de 1,5», «PLANARCO
    // supera holgadamente el gate» —un solo adverbio entre el verbo y el artículo
    // alcanza— y «PLANARCO supera un gate exigente». Las dos últimas son
    // formulación DIRECTA, así que ni siquiera la promesa acotada del párrafo de
    // abajo se cumple entera: la red tiene el agujero de este lado también.
    //
    // No se cierran esos casos ampliando la lista de nexos, porque la lista de
    // nexos del castellano no tiene fondo y cada agregado vuelve a poner en rojo
    // frases honestas. **Este prohibido es una red, no una prueba**: atrapa la
    // formulación directa —la que un documento apurado escribe— y no demuestra
    // que el documento no afirme lo contrario por un camino oblicuo. Eso lo
    // tiene que mirar la revisión, y las Tasks 8 y 9 —que son las que escriben
    // sobre el gate— no pueden delegar en esta regex la verdad de lo que digan.
    patron:
      /(?<!\b(?:no|nunca|jamás|tampoco|ninguno|ninguna|ni)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,30})(pas[óo]|super[óo]|supera|pasa)\s+(el|ese|este|dicho)\s+(gate|umbral)/iu,
    porQue:
      'falso: PLANARCO falla contra la suma de sus dos huéspedes por tres centésimas. ' +
      'Se habilita por derogación expresa, no por el gate (ACTA:41-47, :131-137)',
  },
  {
    patron: /precompromiso/i,
    porQue:
      'categoría inexistente en PLANPACTO (cero ocurrencias, igual que «indexado»); su uso choca con ' +
      'PLANPACTO:381. La movilidad es Techo A por materia (C-4)',
  },
  {
    patron: /escal[óo]n de PLANARCO|nuestro escal[óo]n|noveno escal[óo]n/i,
    porQue: 'la Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto (C-2)',
  },
  {
    patron: /piso constitucional de PLANARCO|nuestro piso constitucional/i,
    porQue: 'PLANARCO no reclama piso: financia su régimen sin escalón propio (C-2)',
  },
  {
    patron: /PLANJUB\s+(es|son|tiene|tienen|establece|crea|garantiza|paga|administra|financia|dispone|declara|rige|sigue|vige)\b|\b(el|del)\s+PLANJUB\s+vigente/i,
    // La frase que el plan MANDA escribir —«el PLAN que nunca existió y del que
    // PLANARCO es sucesor»— es literalmente «PLANJUB es …», y con la
    // normalización sin negritas «**PLANJUB** es» también cae. La exención mira
    // la línea: si nombra la inexistencia o la sucesión, la cópula es honesta.
    salvoSi: /nunca existió|no existe|nunca lleg[óo]|inexistente|fantasma|sucesor|sucede/i,
    porQue:
      'PLANJUB es el fantasma que este PLAN sucede: puede nombrarse como inexistente, nunca afirmarse ' +
      'en presente como PLAN vigente',
  },
  {
    patron: /7[.,]3\s*millones/,
    salvoSi: /PLANREP/,
    porQue:
      'los 7,3 millones de 60+ son el blindaje de la Rama 2 de PLANREP (PLANREP:335, :367). ' +
      'PLANARCO puede citarlos atribuidos, nunca usarlos como su propio universo (C-9)',
  },
  {
    patron: /contrato de continuidad de 36 meses/i,
    porQue: 'no existe en el corpus: se inventaría entero y la spec lo daba por escrito (C-8)',
  },
  {
    patron: /50\.000\s*[-–—]\s*60\.000/,
    porQue:
      'el monto bajo administración de la ANAV no sale por ningún camino del corpus en esa banda: ' +
      '45% × 150.000M da ~65.000–72.000M. O se escribe la derivación o se declara hueco',
  },
  {
    patron: /\bTODO:|\[TODO\]|<!--\s*TODO|\bTKTK\b|\bXXX\b/,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
  {
    // Aparte de los de arriba porque va case-insensitive: el juego anterior
    // (`\[pendiente\]|«PENDIENTE»|\{PENDIENTE\}`) era asimétrico y dejaba pasar
    // `[PENDIENTE]`, `«pendiente»` y `{pendiente}`. Los delimitadores se cruzan a
    // propósito: `[pendiente»` también es un marcador.
    patron: /[[«{]pendiente[\]»}]/i,
    porQue: 'marcador de borrador entre delimitadores: el documento se commitea sin huecos anotados',
  },
  {
    patron: /(?<!\p{L})(sólo|ést[aeo]s?|és[aeo]s?|aquél(?:la|los|las)?)(?!\p{L})/iu,
    porQue:
      'Global Constraint del corpus: «solo» y los demostrativos van sin tilde. ' +
      'PLANPACTO, el modelo declarado, tiene 0 ocurrencias de «sólo» y 32 de «solo»',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tablas: se parsean y se suman. Buscar los totales como string no sirve —
// siguen apareciendo en la prosa aunque la tabla que los produce esté rota.
//
// Hoy la única tabla que se cruza es la de pisos (que PLANARCO no debería
// tener). La Task 4 agrega el Calendario de Umbrales y la Task 5 la tabla de
// fuentes de la Renta de Arco: las dos entran acá abajo, no en CIFRAS_CANONICAS.
// ─────────────────────────────────────────────────────────────────────────────

/** Centésimas enteras: la aritmética en punto flotante sobre 0,07 no cierra. */
const c = (n: number): number => Math.round(n * 100);
const fmt = (cent: number): string => (cent / 100).toFixed(2).replace('.', ',');

/** Celdas de una fila markdown, sin negritas ni bordes. */
function celdas(linea: string): string[] {
  return linea
    .replace(/\*\*/g, '')
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());
}

/** «0,25 – 0,30» → [25, 30]; «0,10» → [10, 10]; «0.25-0.30% PBI» → [25, 30]. */
function rango(celda: string): [number, number] | null {
  const nums = celda.replace(',', '.').replace(/(\d)\s*[–—-]\s*(\d)/g, '$1|$2').split('|');
  const vals = nums.map((s) => {
    const m = /-?\d+(?:[.,]\d+)?/.exec(s.replace(',', '.'));
    return m ? Number(m[0]) : NaN;
  });
  if (vals.length === 0 || vals.some(Number.isNaN)) return null;
  const bajo = c(vals[0]);
  const alto = c(vals.length > 1 ? vals[vals.length - 1] : vals[0]);
  return [bajo, alto];
}

const esFilaDeTabla = (l: string): boolean => l.trim().startsWith('|');
const esSeparadorDeTabla = (l: string): boolean => /^\|[\s:|-]+\|$/.test(l.trim());
const esEncabezado = (l: string): boolean => /^#{1,6}\s/.test(l.trim());

/**
 * Las filas de LA tabla cuya cabecera contiene todas las columnas pedidas.
 *
 * Antes de la Task 4 esta función tenía los dos modos de falla del arquetipo de
 * esta guardia, y el segundo fallaba ABIERTO:
 *
 * 1. `findIndex` devolvía la PRIMERA tabla que coincidiera y no verificaba que
 *    hubiera una sola. Con dos tablas de columnas compartidas, una ensombrece a
 *    la otra: se verifica la de arriba y la de abajo no la mira nadie. Es
 *    exactamente el modo de falla de la portada (`iAbre` tomando UNA portada) y
 *    el de `tramoDeSeccion` (un H2 señuelo). La doctrina ya está fijada: **si el
 *    ancla no es única, el chequeo no corre y lo dice.**
 * 2. El bucle cortaba en la primera línea que no empezara con `|`. Este corpus
 *    parte tablas con párrafos intercalados —lo hace PLANPACTO—, así que la
 *    mitad de abajo quedaba sin parsear y un chequeo del tipo «cada fila tiene
 *    columna X» pasaba en verde sobre las filas que nunca vio. Ahora el párrafo
 *    intercalado NO corta: cortan los encabezados y la cabecera de otra tabla,
 *    que se reconoce por el separador `|---|` que la sigue.
 */
function filasDeTabla(
  lineas: string[],
  columnas: string[],
): { filas: string[][] | null; errores: string[] } {
  const errores: string[] = [];
  const cabeceras: number[] = [];
  lineas.forEach((l, k) => {
    if (esFilaDeTabla(l) && columnas.every((col) => l.includes(col))) cabeceras.push(k);
  });

  if (cabeceras.length === 0) return { filas: null, errores };
  if (cabeceras.length > 1) {
    errores.push(
      `hay ${String(cabeceras.length)} tablas con las columnas [${columnas.join(' · ')}] ` +
        `(líneas ${cabeceras.map((k) => String(k + 1)).join(', ')}) y tiene que haber UNA: ` +
        'con dos, se verifica la primera y la segunda no la mira nadie',
    );
    return { filas: null, errores };
  }

  const i = cabeceras[0];
  const filas: string[][] = [];
  for (let j = i + 1; j < lineas.length; j++) {
    const l = lineas[j];
    if (esEncabezado(l)) break; // la tabla no cruza un título
    if (!esFilaDeTabla(l)) continue; // párrafo intercalado: NO corta
    if (esSeparadorDeTabla(l)) continue;
    // La cabecera de OTRA tabla se reconoce por el separador que la sigue.
    if (filas.length > 0 && esSeparadorDeTabla(lineas[j + 1] ?? '')) break;
    filas.push(celdas(l));
  }
  return { filas, errores };
}

/** `PISOS_SEGUN_EL_TALLER` del test canónico: PLAN → [bajo, alto] en centésimas. */
function pisosDelCanon(): Map<string, [number, number]> {
  const src = readFileSync(CANON_PISOS, 'utf8');
  const bloque = /const PISOS_SEGUN_EL_TALLER[^{]*\{([\s\S]*?)\n\};/.exec(src);
  const out = new Map<string, [number, number]>();
  if (!bloque) return out;
  const re = /(PLAN[A-Z0-9]+):\s*\{\s*floor:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bloque[1])) !== null) {
    const r = rango(m[2]);
    if (r) out.set(m[1], r);
  }
  return out;
}

/**
 * El cruce que este PLAN existe para no romper: PLANARCO no agrega piso.
 * Falla si aparece en el canon del taller, o si el documento se declara uno
 * propio en una tabla de pisos.
 */
function verificarTablas(lineas: string[]): string[] {
  const errores: string[] = [];

  // (a) El canon del taller no puede tener fila de PLANARCO.
  const canon = pisosDelCanon();
  if (canon.size === 0) {
    errores.push(`no se pudo leer PISOS_SEGUN_EL_TALLER de ${CANON_PISOS}`);
  } else {
    const propio = canon.get('PLANARCO');
    if (propio) {
      errores.push(
        `PISOS_SEGUN_EL_TALLER declara un piso de PLANARCO (${fmt(propio[0])}–${fmt(propio[1])}). ` +
          'El arco es eje transversal adentro de los ocho escalones y no agrega escalón: ' +
          'si el canon cambió, se revisa la Escalera de PLANPACTO antes de tocar este documento',
      );
    }
  }

  // (b) Si el documento trae una tabla de pisos, PLANARCO no puede tener fila.
  const pisos = filasDeTabla(lineas, ['PLAN', 'Piso declarado']);
  errores.push(...pisos.errores);
  if (pisos.filas) {
    for (const fila of pisos.filas) {
      if (/PLANARCO/.test(fila[0] ?? '')) {
        errores.push(`el documento se declara un piso constitucional propio: «${fila.join(' | ')}»`);
      }
    }
  }

  // (c) Task 4: el Calendario de Umbrales. Task 5: fuentes de la Renta de Arco.
  errores.push(...verificarCalendarioDeUmbrales(lineas));

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// El Calendario de Umbrales: la tabla de estaciones de la SECCIÓN 3.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_CALENDARIO = ['Estación', 'Edad o hito', 'Dispositivo', 'Quién la ocupa hoy'];

/** Las estaciones del arco. El número va acá porque la prosa lo tiene que decir. */
const ESTACIONES_ESPERADAS = 16;

/** La celda que declara que una estación no tiene ocupante previo. */
const SIN_OCUPANTE = '—';

/**
 * Los PLANes que existen como documento en el taller. La columna «quién la
 * ocupa hoy» solo puede nombrar PLANes reales: un ocupante inventado sería una
 * remisión falsa, que es la falla que este tramo lleva nueve veces detectadas.
 */
function planesDelTaller(): Set<string> {
  const dir = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
  const out = new Set<string>();
  for (const f of readdirSync(dir)) {
    const m = /^(PLAN[A-Z0-9]+)_Argentina_ES\.md$/.exec(f);
    if (m) out.add(m[1]);
  }
  return out;
}

/** Las líneas de un PLAN del taller, cacheadas: la resolución de anclas relee. */
const CACHE_TALLER = new Map<string, string[]>();
function lineasDelPlan(plan: string): string[] | null {
  const hit = CACHE_TALLER.get(plan);
  if (hit) return hit;
  const f = resolve(REPO_ROOT, 'Iniciativas Estratégicas', `${plan}_Argentina_ES.md`);
  if (!existsSync(f)) return null;
  const ls = readFileSync(f, 'utf8').split('\n');
  CACHE_TALLER.set(plan, ls);
  return ls;
}

/**
 * Una celda de ocupante se trocea por `·` y cada pedazo tiene que traer PLAN y
 * ancla. Formas aceptadas, que son las que el corpus escribe:
 *
 *   `PLANSAL §4.4`   `PLANCUIDADO:340`   `PLANMON:1543-1576`
 *
 * El `§` remite a un encabezado; el `:` a una línea (o a un rango).
 */
const ANCLA_SECCION = /^(PLAN[A-Z0-9]+)\s+§(\d+(?:\.\d+)*)$/;
const ANCLA_LINEA = /^(PLAN[A-Z0-9]+):(\d+)(?:-(\d+))?$/;

/**
 * **La sexta forma del arquetipo, y la peor de las seis.** Antes de esta
 * función la guardia se publicitaba como «ocupantes cruzados contra el taller»
 * y lo único que cruzaba era que el TOKEN `PLANXXX` tuviera archivo. El ancla
 * —`§4.4`, `:340`— no se miraba nunca: reproducido, un ocupante
 * `PLANAGUA §999.9` en la celda de «El piso» —un PLAN que no dice una palabra
 * de jubilaciones, en una sección que no existe— salía **exit 0**. El chequeo
 * que se anuncia como lo que hace confiable la cuarta columna informaba éxito
 * sobre una remisión inventada.
 *
 * Esto no verifica semántica —`PLANAGUA §1.1` existe y sigue sin hablar de
 * jubilaciones— pero cierra la dirección barata, que es la que se usa: inventar
 * el número de sección o de línea porque nadie lo va a abrir.
 *
 * Se resuelve contra el archivo destino: `§N.N` exige un encabezado
 * `^#{1,6} N.N` (y `9.1` NO matchea `9.10`); `:NNN` exige que la línea exista y
 * no esté vacía —una remisión a una línea en blanco es una remisión a nada—.
 */
function resolverAncla(fragmento: string): string | null {
  const bruto = fragmento.replace(/`/g, '').trim();
  if (bruto === '') return null;

  const s = ANCLA_SECCION.exec(bruto);
  if (s) {
    const ls = lineasDelPlan(s[1]);
    if (ls === null) return null; // el PLAN inexistente ya lo reporta el cruce de arriba
    const re = new RegExp(`^#{1,6}\\s+${s[2].replace(/\./g, '\\.')}(?![\\d.])`);
    if (!ls.some((l) => re.test(l))) {
      return `«${bruto}» apunta a una sección que ${s[1]} no tiene: no hay encabezado «${s[2]}»`;
    }
    return null;
  }

  const l = ANCLA_LINEA.exec(bruto);
  if (l) {
    const ls = lineasDelPlan(l[1]);
    if (ls === null) return null;
    const desde = Number(l[2]);
    const hasta = l[3] === undefined ? desde : Number(l[3]);
    if (desde < 1 || hasta > ls.length || hasta < desde) {
      return `«${bruto}» apunta fuera de ${l[1]}, que tiene ${String(ls.length)} líneas`;
    }
    if ((ls[desde - 1] ?? '').trim() === '') {
      return `«${bruto}» apunta a una línea vacía de ${l[1]}: una remisión a nada`;
    }
    return null;
  }

  return (
    `«${bruto}» no trae PLAN con ancla resoluble: la cuarta columna se escribe ` +
    '`PLANXXX §N.N` o `PLANXXX:NNN` (o `PLANXXX:NNN-NNN`), y sin ancla el ocupante no se puede abrir'
  );
}

/**
 * **M13.** El titular decía «conjunto exacto: ni falta ni sobra» sobre la
 * portada mientras la columna «Dispositivo del arco» podía nombrar cualquier
 * cosa: verificado, renombrar «Dote de Origen» → «Bono Fundacional Vitalicio»
 * en la tabla salía exit 0. Las Tasks 5–7 escriben esos dispositivos, así que
 * el cruce vale: cada celda tiene que nombrar por lo menos uno de los trece de
 * la portada, salvo la única fila que declara no tener dispositivo propio.
 *
 * Es la dirección barata a propósito: no exige que los trece estén en la tabla
 * —`Calendario de Umbrales` es la tabla, no una fila— sino que lo que la tabla
 * nombra pertenezca al conjunto cerrado que la portada anuncia.
 */
const DISPOSITIVO_POR_REMISION = 'remisión, sin dispositivo propio';

/** 0–20 en letras: la prosa del corpus escribe los conteos estructurales así. */
const EN_LETRAS = [
  'cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
  'diecinueve', 'veinte',
];

/**
 * La tabla que hace honesta la arquitectura. La columna «quién la ocupa hoy» es
 * obligatoria y es lo que impide que PLANARCO se presente como si el territorio
 * del arco estuviera vacío: no lo está.
 *
 * Lo que se verifica, y por qué cada cosa:
 *
 * - **Una sola tabla, y todas sus filas.** Lo cierra `filasDeTabla()`, arriba.
 * - **Cantidad de estaciones**, contra la constante. Borrar una fila entera es
 *   la manera más barata de hacer desaparecer un ocupante incómodo.
 * - **Cuatro celdas llenas por fila.** La columna del ocupante es la única que
 *   se puede dejar en blanco sin que el renglón se note, y es la importante.
 * - **Los ocupantes existen.** Cada `PLANXXX` de la columna tiene que tener
 *   documento en el taller. Y PLANARCO no puede ocuparse a sí mismo.
 * - **El conteo de la prosa sale de la tabla.** Es el chequeo que importa: el
 *   plan del tramo dice «nueve estaciones tienen ocupante previo» y su propio
 *   hallazgo C-9 enumera cuatro territorios, así que el número heredado no lo
 *   deriva nada. Acá la guardia cuenta las filas con ocupante y exige que la
 *   sección escriba ESE número, en letras. Si mañana se agrega una estación
 *   ocupada y nadie toca la prosa, la guardia se pone roja.
 */
function verificarCalendarioDeUmbrales(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_CALENDARIO);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla del Calendario de Umbrales, con las columnas [${COLUMNAS_CALENDARIO.join(' · ')}]: ` +
          'el Calendario no es un dispositivo, es la arquitectura, y sin la tabla la SECCIÓN 3 es un ensayo',
      );
    }
    return errores;
  }

  if (filas.length !== ESTACIONES_ESPERADAS) {
    errores.push(
      `el Calendario de Umbrales tiene ${String(filas.length)} estación(es) y se esperaban ` +
        `${String(ESTACIONES_ESPERADAS)}: borrar una fila es la manera más barata de hacer desaparecer ` +
        'un ocupante previo, y la cuenta de la prosa se deriva de esta tabla',
    );
  }

  const existentes = planesDelTaller();
  let ocupadas = 0;
  filas.forEach((fila, k) => {
    const donde = `la estación ${String(k + 1)} del Calendario («${(fila[0] ?? '').slice(0, 40)}»)`;
    if (fila.length !== COLUMNAS_CALENDARIO.length) {
      errores.push(
        `${donde} tiene ${String(fila.length)} celda(s) y la tabla tiene ` +
          `${String(COLUMNAS_CALENDARIO.length)} columnas`,
      );
      return;
    }
    if (fila.some((c) => c === '')) {
      errores.push(
        `${donde} tiene una celda vacía: «${fila.join(' | ')}». La columna del ocupante es la única ` +
          'que se puede dejar en blanco sin que el renglón se note, y es la que hace honesta la tabla',
      );
      return;
    }

    // M13: el dispositivo del arco sale del conjunto cerrado de la portada.
    const dispositivo = fila[2];
    if (dispositivo !== DISPOSITIVO_POR_REMISION) {
      const conocido = DISPOSITIVOS_EN_PORTADA.some((d) =>
        d.enPortada.some((frag) => dispositivo.includes(frag)),
      );
      if (!conocido) {
        errores.push(
          `${donde} nombra el dispositivo «${dispositivo}», que no está entre los trece de la portada: ` +
            'la portada se declara conjunto exacto, así que un dispositivo que solo vive en la tabla ' +
            `es un catorceavo por la puerta de atrás (o «${DISPOSITIVO_POR_REMISION}» si no tiene uno propio)`,
        );
      }
    }

    const ocupante = fila[3];
    if (ocupante === SIN_OCUPANTE) return;

    // Crítico 2: cada ocupante trae ancla, y el ancla se resuelve contra el destino.
    for (const frag of ocupante.split('·')) {
      const err = resolverAncla(frag);
      if (err !== null) errores.push(`${donde} ${err}`);
    }

    const nombrados = [...ocupante.matchAll(/PLAN[A-Z0-9]+/g)].map((m) => m[0]);
    if (nombrados.length === 0) {
      errores.push(
        `${donde} declara ocupante «${ocupante}» y no nombra ningún PLAN: o la estación tiene ` +
          `ocupante con nombre de PLAN, o lleva «${SIN_OCUPANTE}»`,
      );
      return;
    }
    for (const p of nombrados) {
      if (p === 'PLANARCO') {
        errores.push(`${donde} se declara ocupada por PLANARCO: la columna dice quién la ocupa HOY`);
      } else if (!existentes.has(p)) {
        errores.push(
          `${donde} nombra a «${p}» como ocupante y no hay documento suyo en el taller: ` +
            'un ocupante inventado es una remisión falsa',
        );
      }
    }
    ocupadas += 1;
  });

  const { tramo, errores: errTramo } = tramoDeSeccion(lineas, H2_CALENDARIO);
  errores.push(...errTramo);
  if (tramo !== null) {
    const frase = `${EN_LETRAS[ocupadas] ?? String(ocupadas)} de las ${EN_LETRAS[filas.length] ?? String(filas.length)} estaciones`;
    if (!tramo.join('\n').includes(frase)) {
      errores.push(
        `la SECCIÓN 3 no dice «${frase}»: el conteo de estaciones con ocupante previo se deriva de la ` +
          'tabla y no se hereda. El plan del tramo dice «nueve» y su propio hallazgo C-9 enumera cuatro ' +
          'territorios: un número que no sale de ninguna cuenta es una cifra estrenada',
      );
    }
  }

  return errores;
}

/**
 * El tramo de líneas de una sección: de su H2 al siguiente H2, o al fin del archivo.
 *
 * Toma EL H2, no UNO de los H2 que coincidan. Con `findIndex` tomaba el primero,
 * y eso lo volvía truncable exactamente como la portada: un H2 señuelo plantado
 * antes del real —tres pares triviales de `*Pidió:*`/`*Dio:*`, u ocho `### 0.N`
 * mínimos— hacía que la anatomía se verificara sobre el señuelo, que la sección
 * real quedara sin mirar y que la línea de éxito informara «precedentes en dos
 * columnas balanceadas» y «8 fallas correlativas» sin haber verificado nada.
 *
 * Es la tercera instancia del mismo arquetipo en esta guardia; las dos primeras
 * fueron de la portada (`iAbre` tomando UNA portada, y los mojones de región que
 * colapsaban en un tramo vacío). La doctrina ya la fijó `verificarCabecera()`
 * con las cercas: **si el ancla no es única, el chequeo no corre y lo dice**.
 * Un chequeo truncable que reporta éxito es peor que no tenerlo.
 */
function tramoDeSeccion(
  lineas: string[],
  h2: string,
): { tramo: string[] | null; desde: number; errores: string[] } {
  const indices: number[] = [];
  lineas.forEach((l, k) => {
    if (l.trim() === h2) indices.push(k);
  });
  // La ausencia ya la reporta el chequeo de SECCIONES_ESPERADAS: acá no se duplica.
  if (indices.length === 0) return { tramo: null, desde: -1, errores: [] };
  if (indices.length > 1) {
    return {
      tramo: null,
      desde: -1,
      errores: [
        `«${h2}» aparece ${String(indices.length)} veces (líneas ${indices.map((k) => String(k + 1)).join(', ')}) ` +
          'y el H2 de una sección es UNO: con un señuelo plantado antes, la anatomía se verifica sobre ' +
          'el señuelo y la sección real no la mira nadie',
      ],
    };
  }
  const i = indices[0];
  const j = lineas.findIndex((l, k) => k > i && l.startsWith('## '));
  return {
    tramo: lineas.slice(i + 1, j === -1 ? lineas.length : j),
    desde: i + 1,
    errores: [],
  };
}

/**
 * El texto que vive bajo un domicilio: `(cabecera)` es el tramo anterior al
 * primer H2; cualquier otra etiqueta es un encabezado —H2 o H3— y su tramo va
 * hasta el siguiente encabezado del MISMO nivel o de uno superior.
 *
 * Si el encabezado no existe o aparece más de una vez, el chequeo **no corre y
 * lo dice**: la misma doctrina que `tramoDeSeccion()`. Un domicilio ambiguo que
 * devuelve el primer tramo es un chequeo truncable, y la guardia ya tuvo cinco.
 */
function textoDeDomicilio(
  lineas: string[],
  etiqueta: string,
): { texto: string | null; errores: string[] } {
  if (etiqueta === CABECERA) {
    const iH2 = lineas.findIndex((l) => l.startsWith('## '));
    return { texto: lineas.slice(0, iH2 === -1 ? lineas.length : iH2).join('\n'), errores: [] };
  }

  const nivel = /^#+/.exec(etiqueta)?.[0].length ?? 0;
  if (nivel === 0) {
    return { texto: null, errores: [`domicilio mal escrito en la guardia: «${etiqueta}»`] };
  }
  const indices: number[] = [];
  lineas.forEach((l, k) => {
    if (l.trim() === etiqueta) indices.push(k);
  });
  if (indices.length === 0) {
    return { texto: null, errores: [`falta el domicilio «${etiqueta}», donde viven cifras canónicas`] };
  }
  if (indices.length > 1) {
    return {
      texto: null,
      errores: [
        `el domicilio «${etiqueta}» aparece ${String(indices.length)} veces ` +
          `(líneas ${indices.map((k) => String(k + 1)).join(', ')}): con un señuelo plantado antes, ` +
          'la cifra se busca en el señuelo y el tramo real no lo mira nadie',
      ],
    };
  }
  const i = indices[0];
  const corte = new RegExp(`^#{1,${String(nivel)}} `);
  const j = lineas.findIndex((l, k) => k > i && corte.test(l));
  return { texto: lineas.slice(i + 1, j === -1 ? lineas.length : j).join('\n'), errores: [] };
}

/** Cuenta ocurrencias literales, sin regex: los valores traen `.`, `%` y `–`. */
function contar(texto: string, valor: string): number {
  return texto.split(valor).length - 1;
}

/**
 * Cifras y aserciones, cada una buscada EN SU DOMICILIO y no en el archivo
 * entero. Ver el comentario largo de CIFRAS_CANONICAS: hasta la Task 4 los dos
 * bucles corrían `raw.includes()` sobre todo el documento y cinco valores
 * duplicados se cubrían entre sí.
 *
 * Lo que este arreglo NO cierra, y va escrito para que nadie lo suponga
 * cerrado: un valor que aparezca dos veces adentro del MISMO domicilio sigue
 * cubriéndose a sí mismo salvo que su entrada declare `veces`. La granularidad
 * es el encabezado, no el párrafo.
 */
function verificarValoresConDomicilio(
  lineas: string[],
  lista: ValorConDomicilio[],
  clase: string,
): string[] {
  const errores: string[] = [];
  for (const { valor, en, veces, porQue } of lista) {
    const minimo = veces ?? 1;
    for (const etiqueta of en) {
      const { texto, errores: errDom } = textoDeDomicilio(lineas, etiqueta);
      errores.push(...errDom);
      if (texto === null) continue;
      const hay = contar(texto, valor);
      if (hay < minimo) {
        errores.push(
          `${clase} «${valor}»: se esperaba${minimo > 1 ? `n ${String(minimo)} ocurrencias` : ''} en ` +
            `«${etiqueta}» y hay ${String(hay)} — ${porQue}`,
        );
      }
    }
  }
  return errores;
}

/**
 * La SECCIÓN 0 promete OCHO fallas en su propio H2 y cada una lleva la forma de
 * PLANPACTO:96-130: `### 0.N {título}` con tres párrafos de lead en negrita.
 * Sin este chequeo se podía borrar una falla entera —o dejarla sin «El dato:»,
 * que es el párrafo que la sostiene contra el corpus— y la guardia salía verde.
 *
 * Se verifica la numeración CORRELATIVA, no la cantidad: ocho H3 numerados
 * 0.1, 0.3, 0.3, … también dan ocho.
 */
function verificarOchoFallas(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(
    lineas,
    '## SECCIÓN 0: LAS OCHO FALLAS DEL ARCO DE LA VIDA ARGENTINO',
  );
  if (tramo === null) return errores; // H2 ausente (lo reporta el chequeo de secciones) o duplicado

  const iH3: number[] = [];
  const numeros: string[] = [];
  tramo.forEach((l, k) => {
    const m = /^### 0\.(\d+) \S/.exec(l.trim());
    if (m) {
      iH3.push(k);
      numeros.push(m[1]);
    }
  });

  if (iH3.length !== FALLAS_ESPERADAS) {
    errores.push(
      `la SECCIÓN 0 tiene ${String(iH3.length)} falla(s) con forma «### 0.N {título}» y su propio H2 ` +
        `promete ${String(FALLAS_ESPERADAS)}: el título de la sección y su contenido no pueden discrepar`,
    );
  }
  numeros.forEach((n, k) => {
    if (n !== String(k + 1)) {
      errores.push(
        `la falla número ${String(k + 1)} de la SECCIÓN 0 está numerada «0.${n}»: la numeración es ` +
          'correlativa desde 0.1, y ocho H3 mal numerados también suman ocho',
      );
    }
  });

  // Los tres leads, adentro de cada falla y no en cualquier lado de la sección.
  iH3.forEach((inicio, k) => {
    const fin = k + 1 < iH3.length ? iH3[k + 1] : tramo.length;
    const cuerpo = tramo.slice(inicio + 1, fin).join('\n');
    for (const lead of LEADS_DE_FALLA) {
      if (!cuerpo.includes(lead)) {
        errores.push(
          `la falla «${tramo[inicio].trim()}» no trae el lead «${lead}»: la forma de PLANPACTO:96-130 ` +
            'son tres párrafos, y «El dato:» es el que ata la falla al corpus',
        );
      }
    }
  });

  return errores;
}

/**
 * La SECCIÓN 2 es la que DEFIENDE al PLAN, y por eso es la que menos se revisa:
 * fue el hallazgo Crítico del tramo B, donde los precedentes se enumeraron por
 * lo que PIDIERON y nadie escribió lo que DIERON — y dos de ellos sí traían la
 * característica que el documento invocaba como diferencia propia.
 *
 * El arreglo editorial de PLANPACTO:226-232 fue marcar las dos columnas con
 * `*Pidió:*` y `*Dio:*` en el propio texto. Acá se verifica que estén, que sean
 * al menos tres pares —un precedente solo no es una sección— y que estén
 * BALANCEADAS: la falla real es escribir la primera columna y olvidar la
 * segunda, y eso se detecta contando, no buscando.
 *
 * El balance se exige ADENTRO DE CADA PÁRRAFO, y esa granularidad es el arreglo
 * de la Task 4. Antes se exigía adentro de cada H3, y esa era la CUARTA forma
 * del defecto de esta guardia: **la unidad del chequeo no coincidía con la
 * unidad verificada.** §2.4 lleva DOS precedentes bajo un solo H3 —la AUH y el
 * PAMI—, así que el H3 los compensa entre sí igual que el total de la sección
 * compensaba a los H3. Verificado: sacándole el `*Dio:*` a la AUH y poniéndole
 * uno de más al PAMI, el H3 cierra 2 y 2 y salía **exit 0** — con la AUH
 * enumerada por lo que pidió sin lo que dio, que es el Crítico exacto del tramo
 * anterior, pasando en verde.
 *
 * El párrafo es la unidad real: un precedente se escribe en un párrafo, y los
 * cinco pares del documento viven uno por línea. La sección entera se trocea,
 * incluidos el encabezado y las líneas sueltas: un `*Pidió:*` huérfano en
 * cualquier lado no puede quedar fuera del conteo.
 */
const PARES_MINIMOS_DE_PRECEDENTE = 3;

function verificarPrecedentesEnDosColumnas(lineas: string[]): string[] {
  const { tramo, desde, errores } = tramoDeSeccion(
    lineas,
    '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  );
  if (tramo === null) return errores;

  // Párrafos: bloques de líneas no vacías separados por líneas en blanco.
  const parrafos: { texto: string; linea: number }[] = [];
  let actual: string[] = [];
  let inicio = 0;
  const cerrar = (): void => {
    if (actual.length > 0) parrafos.push({ texto: actual.join('\n'), linea: desde + inicio + 1 });
    actual = [];
  };
  tramo.forEach((l, k) => {
    if (l.trim() === '') {
      cerrar();
      return;
    }
    if (actual.length === 0) inicio = k;
    actual.push(l);
  });
  cerrar();

  let pidioTotal = 0;
  for (const { texto, linea } of parrafos) {
    const pidio = (texto.match(/\*Pidió:\*/g) ?? []).length;
    const dio = (texto.match(/\*Dio:\*/g) ?? []).length;
    pidioTotal += pidio;
    if (dio !== pidio) {
      errores.push(
        `el párrafo de la línea ${String(linea)} marca ${String(pidio)} «*Pidió:*» y ${String(dio)} ` +
          '«*Dio:*»: la falla del tramo B fue enumerar lo que un antecedente pidió sin escribir lo que ' +
          'dio, y el balance se exige por PÁRRAFO porque §2.4 lleva dos precedentes bajo un solo H3 y ' +
          'el H3 los compensa entre sí. Si un «Dio» no se pudo verificar, se escribe declarándolo ' +
          '—el patrón de PLANPACTO:230— y la columna igual existe',
      );
    }
  }

  if (pidioTotal < PARES_MINIMOS_DE_PRECEDENTE) {
    errores.push(
      `la SECCIÓN 2 marca ${String(pidioTotal)} «*Pidió:*» y se esperaban al menos ` +
        `${String(PARES_MINIMOS_DE_PRECEDENTE)}: cada precedente se lee en dos columnas declaradas`,
    );
  }

  return errores;
}

/**
 * La anatomía de la cabecera: H1, H3 de versión y portada ASCII con los trece
 * dispositivos adentro. Sin esto se podía borrar la portada entera y salir 0.
 */
function verificarCabecera(raw: string, lineas: string[]): string[] {
  const errores: string[] = [];

  const iH1 = lineas.findIndex((l) => H1_ESPERADO.test(l.trim()));
  if (iH1 === -1) {
    errores.push(
      'falta el H1 del documento («# PLANARCO — {título}»): la anatomía de PLANPACTO lo pone ' +
        'entre el `---` de la cabecera y el H2 del mandato',
    );
  }

  const iMandato = lineas.findIndex((l) => l.trim() === H2_MANDATO);
  const iVersion = lineas.findIndex((l) => H3_VERSION_ESPERADO.test(l.trim()));
  if (iVersion === -1) {
    errores.push(
      'falta el H3 de versión («### Versión 1.0 — Julio 2026»), que va entre el H2 del mandato y la portada',
    );
  }

  // El brief manda el ORDEN, no solo la existencia: con el chequeo anterior se
  // podía mover el H1 al final del archivo y salir 0. La portada ya se busca
  // desde el H3 en adelante; esto cierra la mitad que faltaba.
  if (iH1 !== -1 && iMandato !== -1 && iH1 > iMandato) {
    errores.push(
      `el H1 está en la línea ${String(iH1 + 1)}, después del H2 del mandato (línea ${String(iMandato + 1)}): ` +
        'el orden de la anatomía es H1 → H2 del mandato → H3 de versión → portada',
    );
  }
  if (iMandato !== -1 && iVersion !== -1 && iMandato > iVersion) {
    errores.push(
      `el H2 del mandato está en la línea ${String(iMandato + 1)}, después del H3 de versión ` +
        `(línea ${String(iVersion + 1)}): el orden de la anatomía es H1 → H2 del mandato → H3 de versión → portada`,
    );
  }

  // La portada es el primer bloque cercado después del H3 de versión: buscarla
  // desde ahí verifica presencia y orden de una sola vez.
  const desde = iVersion === -1 ? 0 : iVersion + 1;

  // `iAbre` toma UNA portada, no LA portada: con una copia legítima plantada
  // arriba, el conjunto exacto se verificaba sobre la copia y la portada real
  // —contaminada con los dispositivos que se quisiera— no la miraba nadie. Es
  // el mismo modo de falla que la Task 4 tiene anotado para `filasDeTabla()`.
  // El tramo de la portada va del H3 de versión al primer H2 del cuerpo y ahí
  // adentro tiene que haber EXACTAMENTE dos cercas; acotado a propósito, porque
  // las Secciones 3 y siguientes traen bloques cercados propios que no son
  // asunto de este chequeo.
  const iCuerpo = lineas.findIndex((l, j) => j >= desde && l.startsWith('## '));
  const finTramo = iCuerpo === -1 ? lineas.length : iCuerpo;
  const cercas = lineas.slice(desde, finTramo).filter((l) => l.trim() === '```').length;
  if (cercas !== 2) {
    errores.push(
      `entre el H3 de versión y el primer H2 del cuerpo hay ${String(cercas)} cerca(s) de bloque, ` +
        'y tienen que ser exactamente dos: la portada es UNA. Con más de un bloque cercado, el ' +
        'conjunto exacto se verifica sobre el primero y la portada real queda sin mirar',
    );
  }

  const iAbre = lineas.findIndex((l, j) => j >= desde && l.trim() === '```');
  const iCierra = iAbre === -1 ? -1 : lineas.findIndex((l, j) => j > iAbre && l.trim() === '```');
  if (iAbre === -1 || iCierra === -1) {
    errores.push(
      'falta la portada ASCII en bloque cercado después del H3 de versión. Es la página que nadie ' +
        'vuelve a mirar: si no la verifica la guardia, no la verifica nadie',
    );
    return errores;
  }

  const portada = lineas.slice(iAbre + 1, iCierra).join('\n');
  for (const { nombre, enPortada } of DISPOSITIVOS_EN_PORTADA) {
    for (const fragmento of enPortada) {
      if (!portada.includes(fragmento)) {
        errores.push(
          `la portada no anuncia «${fragmento}» (dispositivo «${nombre}»): los trece dispositivos ` +
            'del plan del tramo se anuncian todos, y no se anuncia ninguno de más',
        );
      }
    }
  }
  if (!portada.includes(INSTITUCION_EN_PORTADA)) {
    errores.push(`la portada no anuncia «${INSTITUCION_EN_PORTADA}», la institución de la Sección 8`);
  }

  errores.push(...verificarPortadaNoAnunciaDeMas(lineas.slice(iAbre + 1, iCierra)));

  return errores;
}

/**
 * La dirección contraria, y la que reventó en el tramo B: la portada anunciando
 * de MÁS. Ahí anunció cuatro nombres que no estaban en ninguna sección del plan,
 * dos de ellos cosas que el propio PLAN prohíbe.
 *
 * No hace falta el cuerpo para cerrarlo: el conjunto legítimo de nombres de la
 * portada es cerrado y conocido hoy —los trece dispositivos, sus calificadores,
 * la ANAV, el encabezado y el pie—, así que esto es un chequeo de CONJUNTO
 * EXACTO sobre el bloque cercado ENTERO. Se le resta a cada línea cada fragmento
 * permitido, del más largo al más corto, y si queda alguna letra, la portada
 * anuncia algo que nadie mandó. Sin mojones de región no hay región truncable.
 *
 * Itera la PORTADA, no la constante. Si iterara la constante, un nombre
 * inventado que se cuele en el ASCII seguiría sin verlo nadie.
 *
 * El encabezado y el pie se verifican además en la dirección barata —«¿está lo
 * que esperaba?»—, porque el mojón que se borró era lo único que exigía que
 * `Preparado para …` existiera: sin esa línea, sacarlo del documento no
 * levantaba ningún error.
 *
 * La otra dirección todavía —«el dispositivo anunciado, ¿aparece en el cuerpo?»—
 * sí necesita el cuerpo, y es de la Task 10.
 */
function verificarPortadaNoAnunciaDeMas(portada: string[]): string[] {
  const errores: string[] = [];

  for (const renglon of [...PORTADA_ENCABEZADO, ...PORTADA_PIE]) {
    if (!portada.some((l) => l.trim() === renglon)) {
      errores.push(
        `la portada no trae el renglón «${renglon}»: el encabezado y el pie son parte del conjunto ` +
          'exacto y se verifican en las dos direcciones, ni falta ni sobra',
      );
    }
  }

  const lexico = [
    ...PORTADA_ENCABEZADO,
    ...PORTADA_PIE,
    ...DISPOSITIVOS_EN_PORTADA.flatMap((d) => d.enPortada),
    ...CALIFICADORES_EN_PORTADA,
    INSTITUCION_EN_PORTADA,
  ].sort((a, b) => b.length - a.length);

  for (const linea of portada) {
    if (linea.trim() === '') continue;
    let resto = linea;
    for (const permitido of lexico) resto = resto.split(permitido).join('');
    const sobra = resto.replace(/[·\s]/gu, '');
    if (sobra !== '') {
      errores.push(
        `la portada anuncia algo que no está en los trece dispositivos del plan: «${linea.trim()}» ` +
          `→ sobra «${sobra}». En el tramo B la portada anunció cuatro nombres que no existían en ` +
          'ninguna sección: el conjunto es cerrado, ni falta ni sobra',
      );
    }
  }

  return errores;
}

function main(): void {
  let raw: string;
  try {
    raw = readFileSync(DOC, 'utf8');
  } catch {
    console.error(`No existe el documento: ${DOC}`);
    process.exit(1);
  }

  const errores: string[] = [];
  const lineas = raw.split('\n');

  /**
   * El mismo texto sin negritas, para los prohibidos. Sacar los `**` no cambia
   * el conteo de líneas —no hay saltos adentro—, así que los números de línea
   * que se reportan abajo siguen siendo los del archivo real.
   */
  const rawPlano = raw.replace(/\*\*/g, '');
  const lineasPlano = rawPlano.split('\n');

  // 1) Las secciones esperadas, presentes y en orden.
  let cursor = -1;
  for (const seccion of SECCIONES_ESPERADAS) {
    const i = lineas.findIndex((l, j) => j > cursor && l.trim() === seccion);
    if (i === -1) {
      const existeFueraDeOrden = lineas.some((l) => l.trim() === seccion);
      errores.push(
        existeFueraDeOrden
          ? `«${seccion}» está, pero fuera de orden (se esperaba después de la anterior)`
          : `falta la sección «${seccion}»`,
      );
      continue;
    }
    cursor = i;
  }

  // 2) Las cifras canónicas y las aserciones obligatorias, EN SU DOMICILIO.
  errores.push(...verificarValoresConDomicilio(lineas, CIFRAS_CANONICAS, 'cifra canónica'));
  errores.push(
    ...verificarValoresConDomicilio(lineas, ASERCIONES_OBLIGATORIAS, 'aserción obligatoria'),
  );

  // 3) Los prohibidos, sobre el texto sin negritas.
  for (const { patron, porQue, salvoSi } of PROHIBIDOS) {
    const global = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = global.exec(rawPlano)) !== null) {
      const nLinea = rawPlano.slice(0, m.index).split('\n').length;
      const linea = lineasPlano[nLinea - 1] ?? '';
      if (salvoSi && salvoSi.test(linea)) continue;
      errores.push(`línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`);
    }
  }

  // 4) Las tablas: parseadas y cruzadas contra el canon, no buscadas como string.
  errores.push(...verificarTablas(lineas));

  // 5) La cabecera de auditoría, una sola vez y al principio.
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }

  // 6) El desfasaje ordinal/mandato se declara: ordinal 24, mandato 25.
  if (!/> \*\*ORDINAL Y MANDATO:\*\*[^\n]*\(24\)[^\n]*\(25\)/.test(raw)) {
    errores.push(
      'la cabecera no declara el desfasaje ordinal (24) / mandato (25), que es convención de todo el corpus',
    );
  }

  // 7) La anatomía de la cabecera: H1, H3 de versión y portada.
  errores.push(...verificarCabecera(raw, lineas));

  // 8) La anatomía del diagnóstico: ocho fallas con sus tres leads, y los
  //    precedentes leídos en dos columnas.
  errores.push(...verificarOchoFallas(lineas));
  errores.push(...verificarPrecedentesEnDosColumnas(lineas));

  if (errores.length > 0) {
    console.error(`La guardia de PLANARCO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANARCO OK: ${String(SECCIONES_ESPERADAS.length)} sección(es) esperada(s), ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas, ${String(ASERCIONES_OBLIGATORIAS.length)} aserciones obligatorias, ` +
      `${String(PROHIBIDOS.length)} patrones prohibidos, ${String(DISPOSITIVOS_EN_PORTADA.length)} dispositivos en portada ` +
      '(conjunto exacto: ni falta ni sobra), ' +
      `${String(FALLAS_ESPERADAS)} fallas correlativas con sus ${String(LEADS_DE_FALLA.length)} leads, ` +
      'precedentes en dos columnas balanceadas adentro de cada PÁRRAFO, ' +
      `Calendario de Umbrales con ${String(ESTACIONES_ESPERADAS)} estaciones parseadas, sus dispositivos ` +
      'cruzados contra los trece de la portada y sus ocupantes resueltos ancla por ancla contra el ' +
      'archivo destino, ' +
      `${String(lineas.length)} líneas. Sin piso constitucional propio, cruzado contra PISOS_SEGUN_EL_TALLER.`,
  );
}

main();
