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
  '## SECCIÓN 4: LA RENTA DE ARCO',
  '## SECCIÓN 5: EL COMIENZO',
  '## SECCIÓN 6: EL MEDIO',
  '## SECCIÓN 7: EL FINAL',
  '## SECCIÓN 8: LA AGENCIA NACIONAL DEL ARCO DE LA VIDA (ANAV)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 9: MODELO ECONÓMICO Y FISCAL',
  '## SECCIÓN 10: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 11: EL MAPA DE PERDEDORES',
  '## SECCIÓN 12: HOJA DE RUTA',
  // Task 10: SECCIONES 13, 15, 16, 17 y CIERRE · …
];

/**
 * **La anatomía de las dos secciones de la Task 7, por la misma razón que la de
 * las ocho fallas.** Un H2 presente no dice nada sobre lo que hay debajo: borrar
 * la Casa de Arco entera, o la subsección del PAMI, deja el H2 en su lugar, el
 * orden intacto y la guardia verde. Se verifica la CANTIDAD y la NUMERACIÓN
 * CORRELATIVA de los `### N.M` de cada una, que es lo que un borrado rompe y una
 * retitulación no.
 */
const SUBSECCIONES_ESPERADAS: { h2: string; prefijo: string; cuantas: number; porQue: string }[] = [
  /**
   * **La SECCIÓN 2 entra acá por el hallazgo C-2 de la revisión de la Task 7, y
   * la ironía es exacta: `verificarSubsecciones()` se estrenó como arreglo de
   * este modo de falla y se aplicó a §7 y §8 y no a §2, que es la sección de la
   * que §8.3 acababa de volverse dependiente en esa misma tarea.** §8.3 comprimió
   * las tres relaciones del PAMI en una remisión —«2.4 lo leyó como precedente en
   * dos columnas … y dejó declarado el hueco de sus números»— y quedó apuntando a
   * un párrafo sin guardia. Reproducido: borrar el párrafo «El PAMI.» entero de
   * §2.4 salía **exit 0**, con el H3 todavía titulado «La AUH y el PAMI» y el
   * chequeo de dos columnas verde porque la AUH sola queda balanceada.
   */
  {
    h2: '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
    prefijo: '2',
    cuantas: 5,
    porQue:
      'Japón y Corea · Costa Rica · la moratoria · la AUH y el PAMI · la objeción heredada. La cuarta ' +
      'es la que sostiene a §8.3 entera por remisión, y la quinta es la única sección del documento ' +
      'que escribe la objeción del adversario sin contestarla: las dos se borran sin que el H2 se mueva',
  },
  {
    h2: '## SECCIÓN 7: EL FINAL',
    prefijo: '7',
    cuantas: 6,
    porQue:
      'seis dispositivos del final —Rampa, Casa de Dos Edades, Casa de Arco, Última Palabra, Año del ' +
      'Duelo y Umbral del Legado— y seis estaciones del Calendario en este tramo. Uno menos es un ' +
      'dispositivo anunciado en la portada que el cuerpo dejó de tener',
  },
  {
    h2: '## SECCIÓN 8: LA AGENCIA NACIONAL DEL ARCO DE LA VIDA (ANAV)',
    prefijo: '8',
    cuantas: 3,
    porQue:
      'qué clase de ente es · qué administra · el PAMI. La tercera es la que un recorte se lleva ' +
      'primero, porque es la única que no describe a la agencia sino lo que la agencia NO hace',
  },
  {
    h2: '## SECCIÓN 9: MODELO ECONÓMICO Y FISCAL',
    prefijo: '9',
    cuantas: 4,
    porQue:
      'la rampa · el eje intergeneracional · las tres columnas · el financiamiento sin piso. Las ' +
      'cuatro pagan una deuda declarada en otra parte del documento —la cabecera difiere el gasto ' +
      'anual, §3.6 difiere la razón de ejecución, §4.2 y §4.6 difieren el monto y la diferencia—, ' +
      'así que borrar una deja al remitente apuntando a nada y el H2 quieto',
  },
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
/**
 * ── EL DEFAULT INVERTIDO (Task 9) ─────────────────────────────────────────────
 *
 * Todo lo que sigue describe `sinNegacion` como opt-in, y **esa era la falla**.
 * El comentario original dice que la inversión no se puede hacer globalmente
 * porque muchas aserciones son frases negativas legítimas. Es cierto que
 * existen; lo que no se sigue es que el default tenga que quedar del lado
 * inseguro. Medido al cierre de la Task 8: `sinNegacion` estaba en **18 de 113**
 * entradas y unas noventa aserciones afirmativas seguían siendo negables sin
 * tocar el literal. Siete de ocho ataques de muestra salían **verdes**, y la
 * peor era la oración que la revisión anterior había hecho agregar para cerrar
 * un hallazgo: `Es reingeniería declarada` → `No es reingeniería declarada`,
 * verde. La segunda, la fórmula canónica del corpus: `El cero es decisión de
 * diseño de este documento` → `no es`, verde.
 *
 * El defecto de fondo no es una entrada floja: es una **lista opt-in mantenida a
 * mano**, que se llena donde cayeron las mutaciones de la última vuelta y no
 * donde corresponde. Se cierra como se cierran todas: **default seguro más
 * descubrimiento automático**.
 *
 * - El default pasa a ser `contarSinNegacion`. Una aserción vale si aparece **no
 *   negada** en su domicilio.
 * - La frase negativa legítima se declara con `esFraseNegativa: true`, y es
 *   opt-**out**: el que la escribe tiene que decir por qué.
 * - Y el opt-out se audita solo. Si una entrada marcada `esFraseNegativa` tiene
 *   igual una ocurrencia NO negada, la guardia lo dice y pide que se saque la
 *   marca: un opt-out de más es un agujero que nadie vuelve a mirar, y esta es
 *   la única manera de encontrarlo sin acordarse de él.
 *
 * ── lo que sigue es el comentario original, que documenta el hallazgo ─────────
 *
 * **`sinNegacion`, y es un agujero de la clase ENTERA, no de una entrada.**
 * Encontrado en la quinta vuelta de mutación propia: **quince de quince VERDES**
 * poniéndole una negación adelante a la aserción, sin tocarla. «PLANDIG **no**
 * es el punto único de falla», «el redondeo **no** empuja a la baja», «este PLAN
 * **no** sabe cuánto sale» — el literal sigue adentro de su propia negación y
 * `contar()` lo encuentra igual. Es la novena forma del arquetipo que este
 * archivo ya lleva anotada tres veces (una frase que se cubre a sí misma por
 * accidente ortográfico), acá aplicada al mecanismo que sostiene ciento trece
 * aserciones: **la inversión más barata de todas, y la que ninguna de las cuatro
 * vueltas anteriores había probado.**
 *
 * No se arregla globalmente porque muchas aserciones SON frases negativas
 * legítimas —«no reclama escalón ni piso», «no hay damnificado con expediente»,
 * «menor a un veinteavo», que vive adentro de «no puede ser… menor a un
 * veinteavo»— y una detección global las pondría rojas a todas. Va por entrada,
 * y se marca donde una negación delante INVIERTE el sentido.
 */
type ValorConDomicilio = {
  valor: string;
  en: string[];
  veces?: number;
  /**
   * Opt-**out** del chequeo de negación, para el literal que ya ES una frase
   * negativa —«no reclama escalón ni piso», «no hay damnificado con expediente»,
   * «menor a un veinteavo», que vive adentro de «no puede ser… menor a un
   * veinteavo»—. Se audita: si la entrada tiene igual una ocurrencia no negada,
   * la guardia pide que se saque la marca.
   */
  esFraseNegativa?: boolean;
  porQue: string;
};

/** Los encabezados que se usan como domicilio, escritos una sola vez. */
const H3_FALLA_CUIDADO = '### 0.4 El trabajo que sostiene el sistema no tiene renglón donde anotarse';
/**
 * **Domicilio por número, no por título.** Este era el título entero del H3, y
 * el H3 más largo y más editorial del documento — el que la Task 5 tenía que
 * volver a tocar. Un domicilio que es el título completo pone la guardia en rojo
 * ante cualquier retitulación futura, por una razón que no tiene nada que ver
 * con lo que el domicilio protege: acá adentro vive el blindaje anti-reversión
 * de §0.6 (la caja de PLANMEMORIA y la aserción «organismo, caja y registro»),
 * y eso sobrevive al título.
 *
 * El espacio final NO es decorativo: marca el domicilio como PREFIJO — ver
 * `textoDeDomicilio()`. `### 0.6 ` no puede colisionar con `### 0.61` porque el
 * espacio corta, y la unicidad se sigue exigiendo igual que antes.
 */
const H3_FALLA_TRANSMISION = '### 0.6 ';
const H3_FALLA_VACIAMIENTO = '### 0.8 Lo que no se financia no se deroga: se deja de ejecutar';
const H3_CURVA = '### 1.1 La curva ya está andando, y el único número que la describe es una cuenta';
const H3_CUIDADORES = '### 1.2 La crisis no es que haya más viejos: es que no hay quién los acompañe';
const H2_TESIS = '## TESIS CENTRAL';
const H2_PRECEDENTES = '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES';
const H2_CALENDARIO = '## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES';
const H2_RENTA = '## SECCIÓN 4: LA RENTA DE ARCO';
const H2_COMIENZO = '## SECCIÓN 5: EL COMIENZO';
const H2_MEDIO = '## SECCIÓN 6: EL MEDIO';
/** Prefijo, como `### 0.6 `: el domicilio de la tabla de fuentes es su número. */
/**
 * Domicilios por prefijo de H3, la forma que estrenó `H3_FALLA_TRANSMISION` y
 * que la R-5 de la Task 6 dejó como estándar: el número sobrevive a cualquier
 * retitulación y una repetición de la frase en otro H3 no cubre a este.
 */
const H3_RAMPA = '### 7.1 ';
const H3_DOS_EDADES = '### 7.2 ';
const H3_CASA_DE_ARCO = '### 7.3 ';
const H3_ULTIMA_PALABRA = '### 7.4 ';
const H3_ANO_DEL_DUELO = '### 7.5 ';
const H3_UMBRAL_DEL_LEGADO = '### 7.6 ';
const H3_ENTE = '### 8.1 ';
const H3_BAJO_ADMINISTRACION = '### 8.2 ';
const H3_PAMI = '### 8.3 ';
const H3_TABLA_DE_FUENTES = '### 4.6 ';
/** Task 9 bis: §11 afirma que §4.4 cruzó los dos porcentajes del FGS, y eso se verifica. */
const H3_TRAMO_GANADO = '### 4.4 ';
/** Prefijo, ídem: la declaración de la liberación vive en 5.4 y en ningún otro lado. */
const H3_LIBERACION = '### 5.4 ';
/** Task 8. La INTEGRACIÓN no tiene H3: el domicilio es su propio H2, como en PLANPACTO:715. */
const H2_INTEGRACION = '## INTEGRACIÓN CON EL MARCO ¡BASTA!';
const H3_LA_RAMPA_DEL_GASTO = '### 9.1 ';
const H3_EJE_INTERGENERACIONAL = '### 9.2 ';
const H3_TRES_COLUMNAS = '### 9.3 ';
const H3_SIN_PISO = '### 9.4 ';
/** Task 9. Las tres secciones nuevas no tienen H3: el domicilio es su propio H2. */
const H2_RIESGOS = '## SECCIÓN 10: RIESGOS Y RESPUESTAS';
const H2_PERDEDORES = '## SECCIÓN 11: EL MAPA DE PERDEDORES';
const H2_HOJA_DE_RUTA = '## SECCIÓN 12: HOJA DE RUTA';

/**
 * Los cuatro números del acta que la cabecera del PLAN está obligada a escribir,
 * con nombre propio porque la nota de habilitación del archivo de gates escribe
 * **los mismos cuatro** y hasta la Task 9 bis nadie los cruzaba entre los dos
 * archivos (I-5). La lista se audita contra `CIFRAS_CANONICAS` abajo: si alguien
 * cambia el cociente en un solo lado, la guardia lo dice antes de mirar los
 * documentos.
 */
const COCIENTES_DEL_ACTA = ['1,77–2,13x', '8,83–16,00x', '1,47–1,88x', 'umbral de 1,5'];

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
    valor: 'USD 680–920M',
    en: [H3_FALLA_TRANSMISION],
    porQue:
      'la caja de la Agencia Nacional de Memoria a régimen pleno, 0,10–0,14% del PBI — PLANMEMORIA:486. ' +
      'Es el número que falsifica la versión anterior de §0.6, que apoyaba tres de sus cuatro ' +
      'afirmaciones en que la transmisión no tenía organismo ni caja. La Task 5 financia contra este ' +
      'diagnóstico: si alguien lo revierte a «no hay caja», la guardia se pone roja antes que la Sección 4',
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
  // ── Task 5 · SECCIÓN 4 ────────────────────────────────────────────────────
  {
    valor: 'USD 2.400M',
    en: [H2_RENTA],
    porQue:
      'el pasivo de la redención previsional del cuidado, YA comprometido — PLANCUIDADO:94 y :564, ' +
      'donde es una línea del régimen pleno de ese PLAN. La SECCIÓN 4 declara que el Tramo Ganado no ' +
      'lo vuelve a gastar; sin la cifra escrita, la declaración no tiene contra qué medirse',
  },
  {
    valor: '15–20% del rendimiento',
    en: [H2_RENTA],
    porQue:
      'el Fondo Previsional Bastardo es eso y nada más: una porción del rendimiento anual del fondo ' +
      'soberano, sin monto propio declarado, sobre un capital que todavía no existe — PLANMON:1561',
  },
  {
    valor: 'USD 2.475–4.650M',
    en: [H2_RENTA],
    porQue:
      'el flujo del Fondo Intergeneracional, 15% del FSC — PLANTER:674. Es la única línea del fondo ' +
      'que acumula capital, y sus dos mandatos previos son «no distribuir»: el Fondo Previsional ' +
      'Bastardo choca contra ella y la sección lo tiene que decir con el número puesto',
  },
  // ── Task 6 · SECCIÓN 6 ────────────────────────────────────────────────────
  {
    valor: '2.400 km/año',
    en: [H2_MEDIO],
    porQue:
      'el cupo base del adulto en el Mandato Kilométrico Ciudadano — PLANMOV:469. §6.1 escribe la ' +
      'regla de que el Pasaje no crea kilómetros CONTRA este número: sin él, «se descuenta del cupo» ' +
      'no dice de cuánto',
  },
  {
    valor: '1.200 km/año',
    en: [H2_MEDIO],
    veces: 2,
    porQue:
      'el cupo del MENOR — PLANMOV:469, y las dos ocurrencias hacen falta: la cita del cupo y el ' +
      'argumento de que un solo viaje del Pasaje puede consumirlo entero. Sin la segunda, «cuatro ' +
      'viajes pagos» se sigue leyendo como regalo en un régimen donde es uso obligado del cupo propio',
  },
  {
    valor: 'USD 780M',
    en: [H2_MEDIO],
    porQue:
      'la caja anual de «Cinco Años Dignos» — PLANMOV:1339. Es el precedente estructural del ' +
      'reintegro del Alto y la única política del corpus anclada a una edad de la mediana vida: sin ' +
      'el número, el precedente es una anécdota',
  },
  // ── Task 7 · SECCIONES 7 y 8 ──────────────────────────────────────────────
  {
    valor: '~USD 200M [est.]',
    en: [H3_RAMPA],
    /**
     * **`veces: 2`, y es el arreglo de I-8: el backstop documentado de la
     * familia `PLANSAL:1370` no corría.** El comentario de esa familia prometía
     * que borrar la tilde junto con el número quedaba cubierto por esta cifra
     * canónica, y era falso: §7.1 escribe `~USD 200M [est.]` DOS veces —la cita
     * de PLANSAL y la conclusión de que ese renglón se queda donde está— y con
     * el mínimo en uno, mutar la segunda dejaba la primera cubriendo el chequeo.
     * Reproducido: `los ~USD 200M [est.] de PLANSAL:1370` → `los USD 300M [est.]
     * de PLANSAL:1370` salía **exit 0**, con el párrafo de la asimetría
     * afirmando dos magnitudes distintas para la misma caja.
     *
     * **La otra salida que la revisión ofrecía —extender la unidad de la familia
     * a `~?USD`— es peor y no se toma:** reabre el falso positivo que la familia
     * existe para esquivar. La línea 166 de §0.6 nombra `PLANSAL:1370` y trae en
     * el mismo párrafo la caja de PLANMEMORIA, `USD 680–920M`, sin tilde: con la
     * unidad relajada, la familia vuelve a acusar de contradicción a dos
     * programas distintos que comparten renglón.
     */
    veces: 2,
    porQue:
      'la mitad financiada de la asimetría que §0.6 dejó anotada: PLANSAL:1370 le pone caja al ' +
      'Programa Ancianos de Sabiduría y PLANCUL:421 se la promete a los Granaderos desde un PLAN que ' +
      'no existe. El plan del tramo afirmaba que «ninguno de los dos tiene la caja» y era falso para ' +
      'uno. Sin la cifra en §7.1, la Rampa se vuelve a leer como el tercer dispositivo sin financiar',
  },
  {
    valor: 'USD 3.200M',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'la institucionalización evitable de PLANCUIDADO:219, atribuida a la Cámara Argentina de ' +
      'Geriátricos, y PLANCUIDADO:575 ya lleva USD 1.200M/año de ella como ahorro fiscal PROPIO. La ' +
      'Casa de Arco no lo puede volver a anotar, y la disciplina solo se ve si el número está escrito',
  },
  /**
   * **Las cuatro cifras AJENAS de §7.3, y el arreglo de I-7.** La guardia abre
   * cada ancla de la prosa y verifica que RESUELVA; no cotejaba el número contra
   * la línea anclada. Reproducido, las cuatro salían **exit 0** falsificadas
   * contra su propio origen: `más de 300 villages` → `3.000` (PLANCUIDADO:275
   * dice «300+»), `más de 230 Centros de Día` → `800` (:230 dice «230+»),
   * `hospitalización un 38%` → `68%` (:230 dice 38%) y `USD 1.200M/año` →
   * `2.200M` (:575). La capacidad de cotejar existe —es lo que la tabla de
   * fuentes hace fila por fila contra el libro mayor— y no está generalizada a
   * la prosa; hasta que lo esté, las cifras ajenas que un párrafo usa como
   * evidencia se domicilian una por una.
   */
  {
    valor: 'más de 300 villages',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'PLANCUIDADO:275 escribe «300+ villages activas». Es el precedente de escala de la Casa de ' +
      'Arco: inflado a 3.000 el modelo pasa de red vecinal a política nacional y el argumento cambia',
  },
  {
    valor: 'más de 230 Centros de Día',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'PLANCUIDADO:230 escribe «230+ centros en AMBA y conurbano». Es el precedente ARGENTINO, y el ' +
      'que muestra el hueco que la Casa de Arco ocupa: entre el cierre del centro de día y el geriátrico',
  },
  {
    valor: 'la hospitalización un 38%',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'PLANCUIDADO:230, «reducen hospitalización el 38%». Es el único dato de EFECTO del precedente ' +
      'argentino: sin él el Centro de Día es una cifra de cobertura y no una evidencia',
  },
  {
    valor: 'USD 1.200M/año',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'PLANCUIDADO:575 ya contabiliza esa institucionalización evitada como ahorro fiscal PROPIO. Es ' +
      'la mitad operativa de la disciplina de §4.4: la Casa de Arco declara el ahorro para NO ' +
      'anotarlo, y el número inflado convierte la renuncia en un reclamo de otro tamaño',
  },
  {
    valor: 'USD 400M/año',
    en: [H3_UMBRAL_DEL_LEGADO],
    porQue:
      'PLANCUIDADO:576 ya contabiliza la reducción de litigios de herencia y cuidado como ahorro ' +
      'propio. Es el segundo ahorro ajeno que la SECCIÓN 7 se niega a contar, y sin la cifra la ' +
      'negativa no tiene magnitud',
  },
  {
    valor: '~USD 67.500M',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'el monto bajo administración de la ANAV, DERIVADO y no afirmado: 45% del presupuesto nacional ' +
      '(PLANMON:238, :248) sobre ~USD 150.000M (PRESUPUESTO_CONSOLIDADO_BASTA.md:217). La spec decía ' +
      '50–60.000M y no sale por ningún camino: el prohibido lo bloquea y esta cifra lo reemplaza',
  },
  /**
   * **Los DOS FACTORES de la derivación, y el arreglo de I-4: el producto estaba
   * protegido y la derivación no.** `~USD 67.500M` era cifra canónica y ninguno
   * de los dos números que lo producen lo era. Reproducido, los tres **exit 0**:
   * `~45%` → `~55%`, `USD 150.000M` → `USD 250.000M`, y borrar el `~45%` dejando
   * «el mayor rubro del presupuesto nacional». En los tres el documento seguía
   * afirmando ~USD 67.500M con una derivación que ya no da ese número, o sin
   * derivación — la condición exacta que el brief prohibió, alcanzable en una
   * edición. `veces: 2` porque §8.2 escribe el porcentaje dos veces y las dos
   * hacen falta: el factor de la cuenta y el «organismo que gira el 45% del
   * presupuesto» del que sale la gobernanza por sustracción.
   */
  {
    valor: '45% del presupuesto',
    en: [H3_BAJO_ADMINISTRACION],
    veces: 2,
    porQue:
      'el primer factor de la derivación del monto bajo administración — PLANMON:238, :248. Sin él, ' +
      '~USD 67.500M queda afirmado y no derivado, que es lo que el brief prohibió por escrito',
  },
  {
    valor: 'USD 150.000M',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'el segundo factor — PRESUPUESTO_CONSOLIDADO_BASTA.md:217, ~30% del PBI. Los dos factores van ' +
      'domiciliados porque el producto solo es honesto mientras los dos estén escritos',
  },
  {
    valor: 'USD 51.260M y USD 65.430M',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'el régimen pleno del ecosistema entero — PRESUPUESTO_CONSOLIDADO_BASTA.md:447. Es la ' +
      'comparación incómoda: la ANAV mueve sola del mismo orden que los veintidós PLANes juntos. Si ' +
      'no está escrita acá, la hace un adversario y con peor redacción',
  },
  /**
   * **Task 8 — la reconciliación del presupuesto, que es el hallazgo C-5 y el
   * problema más grave del tramo.** El gate se corrió sobre USD 53.000–96.000M a
   * QUINCE AÑOS. **La banda es el INSUMO del gate, no su salida**, y eso importa
   * para citarla bien: vive en `scripts/gate-spinoff-planes-nuevos.ts:25`, y lo
   * que el acta publica son los tres cocientes que salen de ella (`ACTA:24-26`).
   * Escribir «publicada en el acta» sería falso — verificado, el acta no trae
   * ninguno de los dos números. La cabecera la lleva desde la Task 1 con una
   * remisión a esta sección. La banda
   * ANUAL no se afirma: sale de dividir esa banda por el coeficiente de la rampa,
   * y la rampa es una tabla que la guardia suma — ver `verificarRampaDelGasto()`.
   *
   * Los cinco valores van juntos porque son una sola cuenta y perder cualquiera
   * la deja sin poder rehacerse: la banda de origen, el coeficiente, el cociente
   * y los dos productos de vuelta. Con cuatro de los cinco, el quinto queda
   * afirmado y no derivado — el defecto exacto que I-4 encontró en §8.2.
   */
  {
    valor: 'USD 53.000–96.000M',
    en: [CABECERA, H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la banda de quince años sobre la que se corrió el gate de spin-off: es su INSUMO y vive en ' +
      '`gate-spinoff-planes-nuevos.ts:25`, y lo que el acta publica son los tres cocientes que salen ' +
      'de ella (`ACTA:24-26`). Escribir «publicada en el acta» sería falso —verificado, el acta no ' +
      'trae ninguno de los dos números— y este `porQue` lo decía quince líneas debajo del JSDoc que ' +
      'lo declara falso. Es el único número de plata que este documento no puede tocar: sostiene la ' +
      'legitimidad del PLAN',
  },
  {
    valor: '8,80',
    en: [H3_LA_RAMPA_DEL_GASTO],
    veces: 2,
    porQue:
      'el coeficiente de la rampa —años-régimen equivalentes adentro de quince años calendario—, en ' +
      'el total de la tabla y en la prosa que lo usa. Es el divisor de la derivación: sin él la ' +
      'banda anual vuelve a ser una cifra afirmada',
  },
  {
    valor: 'USD 6.000–10.900M',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la banda anual en régimen, DERIVADA: 53.000/8,80 = 6.023 y 96.000/8,80 = 10.909, redondeados ' +
      'a la centena hacia adentro. La cabecera prometió que esta sección la derivaba y hasta acá ' +
      'cualquier número anual habría sido una cifra estrenada',
  },
  {
    valor: 'USD 52.800M',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la integral de vuelta en el extremo bajo (6.000 × 8,80). Cierra 200 por debajo de 53.000, y ' +
      'la diferencia va escrita en vez de absorbida ajustando los porcentajes de la rampa',
  },
  {
    valor: 'USD 95.920M',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la integral de vuelta en el extremo alto (10.900 × 8,80). El redondeo empuja a la BAJA en los ' +
      'dos extremos y los dos productos quedan por debajo de su extremo del gate. «Los dos caen ' +
      'adentro de la banda» era falso y el documento lo repetía: 95.920 cae adentro, pero 52.800 ' +
      'queda por debajo de 53.000, o sea AFUERA. Se corrigieron los dos textos; el cociente del acta ' +
      'se mueve de 1,77x a 1,76x contra PLANCUIDADO y ningún veredicto cambia',
  },
  /**
   * **El 0,60% del eje intergeneracional y la división que su reemplazo obliga a
   * rehacer** (C-3). `PLANPACTO:369` lo declara supuesto de trabajo propio y deja
   * el permiso escrito: «quien las reemplace rehace la división sin tocar nada
   * más». PLANARCO lo reemplaza por cero —no crea ninguna afectación específica—
   * y por lo tanto le debe la división entera, con el denominador corregido. Los
   * cuatro números van domiciliados porque un reemplazo declarado sin la
   * división rehecha es la mitad del compromiso, y es la mitad barata.
   */
  {
    valor: '0,60',
    en: [H3_EJE_INTERGENERACIONAL],
    veces: 2,
    porQue:
      'el supuesto de trabajo de PLANPACTO:369 para el eje intergeneracional, en la cita y en el ' +
      'reemplazo. Sin las dos, el documento reemplaza un número que no nombró',
  },
  {
    valor: '23,15',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue: 'P del escenario central de PLANPACTO:369, que el reemplazo NO toca. Va escrito para que se vea que no se tocó',
  },
  {
    valor: '4,05',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue: 'F rehecho: 3,5 del piso viejo + 0,55 de afectaciones ya escritas + 0,00 del eje intergeneracional',
  },
  {
    valor: '41,8',
    en: [H3_EJE_INTERGENERACIONAL],
    /**
     * **Arreglo de la mutación M13.** Con `veces: 1`, cambiar «baja de 42,8 a
     * 41,8» por «se mantiene en 42,8» salía **exit 0**, porque el 41,8
     * sobrevivía en el párrafo siguiente —«41,8 sigue siendo un nivel que la
     * Argentina tuvo»— y el chequeo se daba por satisfecho con la consecuencia
     * mientras la corrección desaparecía. Las dos ocurrencias son cosas
     * distintas: una es la división rehecha y la otra es la declaración de que
     * la conclusión ajena sobrevive, y el documento debe las dos.
     */
    veces: 2,
    porQue:
      'el denominador corregido de la prueba por el absurdo de PLANPACTO:369: (23,15 + 4,05) / 0,65. ' +
      'Baja de 42,8 a 41,8, y eso AFLOJA un punto al argumento del documento anterior. Se escribe ' +
      'igual: un reemplazo que solo se declara cuando favorece al que lo hace no es una declaración',
  },
  {
    valor: '42,8',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue: 'el denominador original, que hay que escribir para que el corregido se lea como corrección',
  },
  {
    valor: '1,20–2,18%',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue:
      'la banda anual sobre el producto de referencia de USD 500.000 millones (PLANPACTO:641). Es la ' +
      'magnitud que vuelve incómoda la ausencia de piso: del orden de la Escalera entera (2,40) sin ' +
      'escalón propio, y es lo que 9.4 tiene que contestar',
  },
  /**
   * **La columna del medio, y el arreglo de C-6.** «PUAM» y «PNC» tienen cero
   * ocurrencias en el corpus y ya están prohibidas. Lo que este valor protege es
   * la mitad positiva: el unitario SÍ existe y está citado, y lo que falta es el
   * PADRÓN. Sin el unitario escrito, «no hay datos» es más fuerte de lo que el
   * corpus sostiene —el error que este tramo cometió dieciséis veces— y con él,
   * el hueco queda diagnosticado en el lugar exacto.
   */
  {
    valor: '~USD 250/mes',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'la jubilación mínima según PLANREP:2261, adentro de una tabla cuya columna se titula «Monto ' +
      'Aproximado». Es el único unitario de vejez del corpus: lo que falta para la columna del medio ' +
      'no es el precio sino el padrón, y decirlo así es más preciso que declarar el hueco entero',
  },
  {
    valor: 'USD 500–700 millones',
    en: [H3_SIN_PISO],
    porQue:
      'el presupuesto de régimen de PLANPACTO (PLANPACTO:641), el término de comparación más cercano ' +
      'y el único no `superseded` que existe. Sin él la escala de este PLAN queda sin contra qué leerse',
  },
  {
    valor: '51.260–65.430M',
    en: [H3_SIN_PISO],
    porQue:
      'el régimen pleno del ecosistema entero (PRESUPUESTO_CONSOLIDADO_BASTA.md:447), citado en otra ' +
      'forma que en §8.2 a propósito: allá el término era el monto bajo administración y acá es la ' +
      'erogación propia. Son dos comparaciones distintas y las dos tienen que estar',
  },
  {
    valor: 'USD 1.800–2.400M',
    en: [H2_PERDEDORES],
    porQue:
      'lo que PLANCUIDADO:564 lleva como línea de régimen pleno por la redención previsional. El mapa ' +
      'de perdedores dice qué pierde cada uno Y CUÁNTO: sin el monto, la pérdida más grande del mapa ' +
      'queda declarada sin magnitud y no se puede discutir',
  },
  {
    valor: 'seis de los trece dispositivos',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      'el tamaño de lo que se cae si la Fase 3 no se ejecuta, contra el conjunto cerrado de la ' +
      'portada. La lista de nombres sin el conteo se lee como una enumeración; con el conteo se lee ' +
      'como la mitad del PLAN',
  },
];

/**
 * **EL RECÍPROCO DEL DOMICILIO, y la Task 6 abrió el primer caso.** El campo
 * `en` cierra que una cifra canónica DESAPAREZCA de donde tiene que estar. No
 * cierra lo contrario: que el documento la CONTRADIGA fuera de su domicilio.
 * Hasta acá no importaba porque ninguna sección posterior repetía una cifra de
 * §4; §5.2 es la primera. Reproducido: mutando **solo** la copia de §5.2 a
 * `USD 24.750–46.500M` —un orden de magnitud— la guardia salía **exit 0** y
 * seguía anunciando «14 cifras canónicas» verificadas, con el documento
 * afirmando dos magnitudes distintas para la misma línea del mismo fondo.
 *
 * **Por qué una familia y no un barrido de unidades.** Barrer todos los `USD `
 * del documento y exigir que coincidan con la canónica es absurdo: hay ocho
 * montos legítimos y distintos. Lo que identifica a la MAGNITUD no es la unidad
 * sino el objeto del que se predica, así que la familia se declara con la cosa
 * (`cerca`), la forma del número (`unidad`) y el juego cerrado de valores que
 * esa cosa puede tener. En toda línea que nombre la cosa, cada número con esa
 * forma tiene que ser uno de los declarados.
 *
 * **Falsos positivos: cero**, verificado línea por línea. Las cuatro líneas que
 * nombran el Fondo Intergeneracional son `:465`, `:524`, `:526` y `:532`; las
 * dos que traen monto traen el mismo, y las otras dos no traen ninguno y no
 * disparan.
 */
type FamiliaDeCifra = { cerca: string; unidad: RegExp; valores: string[]; porQue: string };

const FAMILIAS_DE_CIFRA: FamiliaDeCifra[] = [
  {
    /**
     * **El segundo caso de la clase, y lo destapó I-7.** La banda del Tramo
     * Ganado vive en dos secciones —§4.4 la deriva de `PLANCUIDADO:564` y §9.3 la
     * usa como su única erogación propia— y §9.3 la lleva en una FILA DE TABLA,
     * que `soloProsa()` descuenta: CIFRAS_CANONICAS no la puede domiciliar. Mutada
     * a `USD 18.000–24.000M` —un orden de magnitud— la guardia salía verde.
     *
     * `USD 2.400M` está en los valores porque `:435` cita el extremo alto solo,
     * atribuido a `PLANCUIDADO:94`, y es legítimo: la familia declara el juego
     * cerrado de valores que la cosa puede tener, no uno solo.
     */
    cerca: 'Tramo Ganado',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 1.800–2.400M', 'USD 2.400M'],
    porQue:
      'la línea que PLANCUIDADO:564 ya contabiliza como costo propio, y el único monto de la tabla ' +
      'de tres columnas. Es también el número que sostiene el «cero — pass-through» de esa fila: si ' +
      'las dos secciones declaran magnitudes distintas, no hay pass-through que verificar',
  },
  {
    cerca: 'Fondo Intergeneracional',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 2.475–4.650M'],
    porQue:
      'el flujo anual del Fondo Intergeneracional es uno solo (PLANTER:674) y §4.5 y §5.2 lo escriben ' +
      'los dos. Dos magnitudes para la misma línea del mismo fondo es la contradicción que el ' +
      'domicilio no ve',
  },
  {
    cerca: 'Mandato Kilométrico',
    unidad: /[\d.]+\skm\/año/gu,
    valores: ['2.400 km/año', '1.200 km/año'],
    porQue:
      'los dos cupos del MKC son los de PLANMOV:469 y no otros. El Pasaje se descuenta de ellos: un ' +
      'cupo inflado en la copia vuelve gratis un viaje que consume el año entero de un menor',
  },
  {
    cerca: 'Cinco Años Dignos',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 780M'],
    porQue: 'la caja del precedente etario, PLANMOV:1339, no admite segunda versión',
  },
  /**
   * **La cosa se declara con el ANCLA y la unidad lleva la tilde, y las dos
   * decisiones son por un falso positivo real.** El primer intento fue
   * `cerca: 'Ancianos de Sabiduría'` con la unidad `USD …M` de las familias
   * anteriores, y disparó sobre §0.6: la línea 166 es un párrafo entero que
   * nombra a los Ancianos **y** trae la caja de PLANMEMORIA —`USD 680–920M`—,
   * así que la familia acusaba de contradicción a dos magnitudes de programas
   * distintos que comparten renglón por ser el mismo párrafo. Una familia que
   * marca líneas correctas es peor que no tenerla.
   *
   * Se cierra por los dos lados: la cosa pasa a ser el ancla `PLANSAL:1370`,
   * que hoy está en las dos líneas que traen esta caja y en ninguna otra, y la
   * unidad exige la tilde de aproximación, que la cifra de PLANMEMORIA de esa
   * misma línea no lleva. **Falsos positivos: cero**, verificado línea por
   * línea — `~USD` aparece una sola vez en todo el documento antes de §7.1.
   *
   * Lo que NO cubre, dicho para que nadie lo suponga: borrar la tilde junto con
   * el número deja la familia muda. Contra eso corre el otro chequeo, la cifra
   * canónica `~USD 200M [est.]` domiciliada en §7.1.
   */
  {
    cerca: 'PLANSAL:1370',
    unidad: /~USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['~USD 200M'],
    porQue:
      'la caja del Programa Ancianos de Sabiduría es una sola —PLANSAL:1370— y el documento la ' +
      'escribe DOS veces, en §0.6 y en §7.1, que son las dos mitades de la misma asimetría. Dos ' +
      'magnitudes para el mismo renglón es el modo de falla que el domicilio no ve, y acá el número ' +
      'es el que sostiene que la Rampa no duplica a un dispositivo que ya está financiado',
  },
  /**
   * **Las dos familias de la derivación de §8.2 (I-4), declaradas por el ANCLA
   * de cada factor y no por la cosa.** El domicilio exige que los dos números
   * estén; la familia exige que, en cualquier línea que cite la fuente, el
   * número que se le atribuye sea el suyo. Las dos juntas son lo que impide que
   * el producto quede afirmado sobre una cuenta que ya no lo da.
   *
   * **Falsos positivos: cero**, verificado línea por línea. `PLANMON:238`
   * aparece en cuatro líneas —`:76`, `:138`, `:206`, `:735`—: las tres que traen
   * porcentaje del presupuesto traen el mismo, con tilde o sin ella, y `:138` no
   * trae ninguno. El `~30% del PBI` de la misma línea `:735` no dispara porque
   * la unidad exige «del presupuesto» y ese es del PBI.
   */
  {
    cerca: 'PLANMON:238',
    unidad: /~?\d+%\s+del presupuesto/gu,
    valores: ['45% del presupuesto', '~45% del presupuesto'],
    porQue:
      'el peso previsional en el presupuesto nacional es uno solo —PLANMON:238 y :248— y el ' +
      'documento lo escribe en la cabecera, en §1.4 y en §8.2. Es el primer factor de ~USD 67.500M: ' +
      'movido en una sola copia, el producto deja de salir de su propia cuenta',
  },
  {
    cerca: 'PRESUPUESTO_CONSOLIDADO_BASTA.md:217',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 150.000M', 'USD 67.500M'],
    porQue:
      'el segundo factor y el producto viven en la misma línea de §8.2, y los dos valores admitidos ' +
      'son esos: el presupuesto nacional de PRESUPUESTO_CONSOLIDADO_BASTA.md:217 y el resultado de ' +
      'multiplicarlo por 45%. Cualquier tercer monto en esa línea es una derivación que no cierra',
  },
  /**
   * **La ventana de la Rampa (I-6).** `60–72` es el nombre del dispositivo en la
   * portada, la fila del Calendario y el H3 de §7.1, y las tres tienen que decir
   * lo mismo: una ventana movida en la portada y no en el Calendario es el
   * dispositivo anunciado con una edad y tabulado con otra.
   *
   * **Falsos positivos: cero.** «Rampa de Salida» está en cinco líneas —`:40`,
   * `:303`, `:615`, `:639`, `:641`—; las tres que traen un rango de dos cifras
   * traen `60–72`, y `:615` y `:641` no traen ninguno.
   */
  {
    cerca: 'Rampa de Salida',
    unidad: /\b\d{2}[–-]\d{2}\b/gu,
    valores: ['60–72'],
    porQue:
      'la ventana de la Rampa es una sola y aparece tres veces con el nombre pegado. El texto que ' +
      'la escribe en letras («entre los sesenta y los setenta y dos») va aparte, como aserción de §7.1',
  },
];

/**
 * El chequeo de la familia: en cada línea que nombre la cosa, todo número con
 * la forma declarada tiene que ser uno de los valores canónicos.
 */
function verificarFamiliasDeCifra(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const { cerca, unidad, valores, porQue } of FAMILIAS_DE_CIFRA) {
    lineas.forEach((linea, k) => {
      if (!linea.includes(cerca)) return;
      const re = new RegExp(unidad.source, unidad.flags.includes('g') ? unidad.flags : `${unidad.flags}g`);
      let m: RegExpExecArray | null;
      while ((m = re.exec(linea)) !== null) {
        if (valores.includes(m[0])) continue;
        errores.push(
          `línea ${String(k + 1)}: la línea nombra «${cerca}» y escribe «${m[0]}», que no es ninguno ` +
            `de los valores canónicos de esa familia [${valores.join(' · ')}] — ${porQue}`,
        );
      }
    });
  }
  return errores;
}

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
    valor: 'organismo, caja y registro',
    en: [H3_FALLA_TRANSMISION],
    porQue:
      'el hallazgo trece del tramo, y el mismo modo de falla que ya costó seis: «esto no existe» dicho ' +
      'sin buscar bajo otro nombre. §0.6 decía que la transmisión no tenía dueño institucional, que ' +
      'nadie la sostenía y que nadie llevaba registro; PLANMEMORIA tiene las tres — ANM autárquica ' +
      '(:484), Síndicos a salario CONICET adjunto (:405) y el Archivo de siete nodos con hash (:283, ' +
      ':297). La afirmación positiva se exige escrita para que la negativa no pueda volver',
  },
  {
    valor: 'del PAMI no hay número de afiliados, de presupuesto ni de cobertura',
    en: [H2_PRECEDENTES],
    porQue:
      'el hueco declarado del PAMI, y el arreglo de C-2. §8.3 comprimió las tres relaciones en una ' +
      'remisión a §2.4 y quedó dependiendo de un párrafo sin guardia: borrarlo entero salía exit 0. ' +
      'Esta frase es la que impide que la sección que crea la agencia estrene un número que el ' +
      'corpus no tiene, y vive en un solo lugar del documento',
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
  // ── Task 5 · SECCIÓN 4 ────────────────────────────────────────────────────
  {
    valor: 'un solo fondo con dos nombres',
    en: [H2_RENTA],
    porQue:
      'la respuesta a C-7, que el corpus nunca escribió. PLANTER crea el Fondo Soberano Ciudadano ' +
      '(:349) y PLANMON el Fondo Soberano Bastardo (:1561) con los mismos afluentes, y las propias ' +
      'tablas de interconexión de PLANMON le mandan esos afluentes al «Ciudadano» (:2224, :2225, ' +
      ':2235, :2239). Sin este veredicto escrito, financiar el Tramo Común «por el FSC y el Fondo ' +
      'Previsional Bastardo» es contar dos veces la misma regalía',
  },
  {
    valor: 'decisión de diseño de este documento',
    en: [H2_RENTA],
    veces: 2,
    porQue:
      'las dos decisiones que esta sección toma y que el corpus no traía —la reconciliación de los ' +
      'dos fondos y la regla de absorción del Piso Vital— van declaradas con la fórmula del corpus. ' +
      'Una decisión de diseño sin declarar se lee, tres documentos después, como una medición',
  },
  {
    valor: 'ni duplica ni sustituye',
    en: [H2_RENTA],
    porQue:
      'el veredicto sobre el Tramo Ganado, que §3.3 difiere acá por escrito. `PLANCUIDADO:340` ya ' +
      'fijó la moneda de cuidado con fórmula, techo y validación por Mesa Civil: duplicarla sería ' +
      'gastar dos veces el mismo pasivo y sustituirla sería enmendar el PLAN ajeno de prepo',
  },
  {
    valor: 'dos monedas y no tres',
    en: [H2_RENTA],
    porQue:
      'el Servicio Cívico no existe como institución del corpus (C-8) y los tres canales que sí pagan ' +
      'servicio cívico ya pagan: el panelista de PLANJUS:1659, las dietas de PLANMESA:481 y el ' +
      'Referente pago por la AMCC de PLANCUIDADO:94. Una tercera moneda previsional pagaría dos veces',
  },
  {
    valor: 'future_return',
    en: [H2_RENTA],
    porQue:
      'la clase que le cuesta la fuente al Tramo Común, nombrada en la prosa y no solo excluida de la ' +
      'tabla. El libro mayor ya clasifica las rentas extractivas así —F08, especulativa, 2030+— y ' +
      'PLANPACTO lo prohíbe dos veces (:444, :655)',
  },
  {
    valor: 'se absorbe',
    esFraseNegativa: true,
    // el veredicto de §4.3 es NEGATIVO por diseño —«el Piso Vital absorbe y no se suma. Tampoco se absorbe en ninguno de los otros dos»— así que exigir una ocurrencia afirmativa sería pedirle al documento la decisión contraria. La única afirmativa del tramo es «Se absorbe el monto», con mayúscula, y `contar()` distingue caso
    en: [H2_RENTA],
    porQue:
      'el entregable que §3.3 y §3.5 difieren a esta sección: tres pisos universales sobre la misma ' +
      'persona de sesenta y cinco —el DNP de PLANREP §15.3, el DCM de PLANTER:366-367 y el Piso ' +
      'Vital— y el documento tiene que decir cuál se suma, cuál absorbe y cuál es absorbido. El ' +
      'diferimiento estaba declarado desde los dos lados en la prosa y en ninguna parte de la guardia',
  },
  /**
   * **Las dos declaraciones de la SECCIÓN 4 que no protegía nada.** Verificado
   * rompiendo al abrir la Task 6: borrar el párrafo de la fila 1 de la tabla de
   * fuentes salía **exit 0**, y borrar el de confianzas y regla 6 también. Con
   * tres compresiones grandes ya hechas en el tramo y seis secciones por
   * delante, una sección se comprime por donde no hay guardia — que es
   * exactamente donde estaban las dos frases que sostienen la única fila con
   * caja presente y la única regla del libro mayor que la tabla incumple.
   */
  {
    valor: 'regla 6',
    en: [H2_RENTA],
    porQue:
      'la regla del libro mayor que la tabla de fuentes INCUMPLE —disponibilidad mayor a doce meses ' +
      'exige respaldo, y tres de las cuatro filas no lo tienen—. Es la clase de párrafo que la ' +
      'compresión se lleva primero porque no defiende al PLAN, y sin él la tabla se lee cubierta',
  },
  {
    valor: 'Ningún haber en curso se reduce',
    en: [H2_RENTA],
    porQue:
      'la promesa que sostiene la única fila con caja presente: la reasignación de haberes de ANSES ' +
      'cambia el título y no el monto. Sin esa frase escrita, la fila que financia el Piso Vital se ' +
      'lee como un recorte a jubilados, que es lo contrario de lo que la fila hace',
  },
  // ── Task 6 · SECCIONES 5 y 6 ──────────────────────────────────────────────
  {
    valor: 'no reclama el Fondo Intergeneracional',
    en: [H2_COMIENZO],
    porQue:
      'la resolución de C-7 del lado de la Dote. El Fondo Intergeneracional es 15% del FLUJO del FSC ' +
      '(PLANTER:674), sin stock declarado ni regla de retiro, y sus dos mandatos escritos son ambos ' +
      'de no distribuir (PLANTER:163 y :710/:839). Financiar la Dote de ahí sería la misma cadena que ' +
      'a la SECCIÓN 4 le costó el Tramo Común: la renuncia va escrita, no supuesta',
  },
  {
    valor: 'evidencia verificable por sistema',
    /**
     * **R-5, y el domicilio es la mitad del arreglo.** La frase vive en el
     * título del H3 5.4 y en la declaración, y borrar la DECLARACIÓN salía
     * **exit 0** porque el título la cubría. El primer cierre fue `veces: 2`, y
     * `veces: N` cuenta OCURRENCIAS y no LA ocurrencia: con la §5 entera de
     * domicilio, borrar la declaración y repetir la frase cinco palabras más
     * allá —en 5.6, en cualquier lado— volvía a dar dos y salía verde; y al
     * revés, retitular el H3 —operación normal— tiraba el conteo a uno y ponía
     * la guardia roja con la declaración intacta.
     *
     * Las dos se cierran juntas bajando el domicilio al H3 **por prefijo**
     * (`### 5.4 `, la forma que `H3_FALLA_TRANSMISION` estrenó): el título
     * queda afuera del tramo por construcción, el número sobrevive a cualquier
     * retitulación, y una repetición en otro H3 ya no cubre nada. Vuelve a
     * `veces: 1`, que es lo que se quería decir: la prosa de 5.4 declara el
     * criterio, una vez.
     */
    en: [H3_LIBERACION],
    porQue:
      'el arreglo 6: la liberación de la Dote NO se decide en una mesa. Un panel territorial que ' +
      'decide quién cobra un capital de dieciocho años es la mejor máquina de punteros que este ' +
      'corpus podría estrenar, y el criterio se escribe como regla o vuelve solo',
  },
  {
    valor: 'Identidad Digital Soberana',
    en: [H2_COMIENZO],
    porQue:
      'la estación 2 del Calendario ya tiene ocupante: PLANDIG §8.2 emite la IDS al nacer (:677). El ' +
      'Acta de Bienvenida es el dispositivo más nuevo de esta sección y el que más fácil pisa a otro ' +
      'PLAN sin enterarse. La relación va declarada',
  },
  {
    valor: 'Mandato Kilométrico Ciudadano',
    en: [H2_MEDIO],
    porQue:
      'el hallazgo de la Task 6, que ni la spec ni el plan traían: el Pasaje son cuatro viajes PAGOS ' +
      'y el derecho a moverse ya está escrito y es universal — PLANMOV §3.1, 2.400 km/año por adulto, ' +
      'multimodal, activable desde la Cédula Civil. Escribir cuatro viajes pagos sin nombrarlo sería ' +
      'la decimoquinta forma de «esto no existe» dicho sin buscar bajo otro nombre',
  },
  {
    valor: 'Cinco Años Dignos',
    en: [H2_MEDIO],
    porQue:
      'lo más cerca que el corpus está de anclar una política a una edad de la mediana vida: ' +
      'PLANMOV §14.3, mayores de 50 desplazados, con aportes previsionales y cobertura a cargo del ' +
      'FRM. No es la mediana edad como categoría —es un sector y un desplazamiento— pero decir ' +
      '«territorio virgen» sin acotarlo contra esto sería falso',
  },
  /**
   * **Las dos decisiones propias de §6.3, que era lo que el pendiente 3 mandaba
   * proteger y la Task 6 dejó afuera.** Las cinco aserciones de arriba cubren
   * los cinco HALLAZGOS —lo que la sección encontró en otros PLANes— y ninguna
   * cubre lo que la sección DECIDE. Verificado rompiendo, las dos **exit 0**:
   * borrar el párrafo entero de la resolución del acantilado, y bajar el
   * crédito «al 100%» a «al 75%», que es la asimetría con la jornada 6+2 dada
   * vuelta y el modo de falla principal del dispositivo reintroducido.
   */
  {
    valor: 'no escribir el umbral',
    en: [H2_MEDIO],
    porQue:
      'la resolución del acantilado del empleado 50, y la decisión más disputable de la sección: el ' +
      'crédito es igual para todos y proporcional a las horas, así que nadie cruza una frontera al ' +
      'contratar. Un umbral movido a otro número es el mismo acantilado en otro lado, y sobre la ' +
      'misma nómina PLANCUIDADO ya tiene dos cortes propios (:355, :356)',
  },
  {
    valor: 'al 100% y no al 75%',
    en: [H2_MEDIO],
    porQue:
      'la asimetría fundada con la jornada 6+2 de `PLANCUIDADO:347`: las 2 horas de cuidado las ' +
      'recibe la comunidad y en parte la empresa, y el Alto no le devuelve nada a la empresa. Bajar ' +
      'el reintegro al 75% deja la pausa paga parcialmente a cargo de quien emplea a alguien de ' +
      'cuarenta y cinco años, que es el descarte por edad que el dispositivo existe para impedir',
  },
  // ── Task 7 · SECCIONES 7 y 8 ──────────────────────────────────────────────
  /**
   * **Los HALLAZGOS: seis afirmaciones sobre otros PLANes que el final del arco
   * tiene que llevar escritas.** La SECCIÓN 7 es la que más «territorio vacío»
   * quiere declarar, y el tramo lleva quince afirmaciones falsas de la misma
   * familia: «esto no existe» dicho sin buscar bajo otro nombre. Cada una de
   * estas seis es la palabra bajo la que el dispositivo SÍ existía.
   */
  {
    valor: 'Red de acompañamiento',
    en: [H3_ANO_DEL_DUELO],
    porQue:
      'PLANEB:991 tiene un bullet con ese título — grupos de apoyo entre pares financiados por el ' +
      'pool. «El corpus no acompaña al final del arco» es FALSO y la corrección del 2026-07-31 lo ' +
      'declara vinculante. Lo que falta es el deber, el dueño y el horario, y el Año del Duelo solo ' +
      'se puede fundar contra el bullet nombrado',
  },
  {
    valor: 'cláusula de disolución',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      '«muerte digna» NO da cero en el corpus: da nueve, y nombra otra cosa — la disolución de una ' +
      'organización que no puede seguir operando (PLANAGUA:3942, PLANEB:1810, PLANMESA:1169). Sin ' +
      'esta declaración, «la voluntad anticipada es territorio vacío» queda apoyada en un grep que ' +
      'no distingue el homónimo, que es exactamente cómo se produjeron las quince anteriores',
  },
  {
    valor: 'acompañante obligatorio',
    en: [H3_ANO_DEL_DUELO],
    porQue:
      'PLANSAL:1592 exige acompañante durante todo el parto, cesáreas incluidas. Es la simetría que ' +
      'funda el Año del Duelo: el proyecto escribió el deber de estar en un extremo del arco y no en ' +
      'el otro. Sin ella, el dispositivo es una preferencia y no un argumento',
  },
  {
    valor: 'Cofre Digital Ciudadano',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      'PLANDIG:656 se lo da a cada argentino al nacer y dice que «nadie más que él puede abrir». Es ' +
      'el archivo obvio para la Última Palabra y el contenedor equivocado, porque la declaración ' +
      'tiene que leerla un tercero cuando el titular no puede abrir nada. La objeción va escrita o ' +
      'la primera revisión la plantea como hallazgo',
  },
  {
    valor: 'Mayor Acompañante',
    en: [H3_ANO_DEL_DUELO],
    porQue:
      'PLANMEMORIA:419 ya tiene ese rol acompañando el Bastón Memorial a los doce. El «Acompañante ' +
      'de Umbral» choca de nombre con un rol existente y la colisión se declara, no se ignora',
  },
  {
    valor: 'Villages to Care For Elders',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'PLANCUIDADO:275, red vecinal con protocolos formales. Junto con las Butterfly Homes (:271) y ' +
      'el cohousing intergeneracional (:273), el corpus YA trae los precedentes de las dos casas: ' +
      'escribirlas como invención sería la decimosexta forma del mismo error',
  },
  /**
   * **Las DECISIONES PROPIAS, que es donde la Task 6 falló.** Sus cinco primeras
   * aserciones cubrían los cinco hallazgos y ninguna cubría lo que la sección
   * DECIDE, y las dos decisiones de §6.3 salían **exit 0** borradas. Estas seis
   * son las que, borradas, dejan el documento coherente y peor.
   */
  {
    valor: 'la Rampa no mueve ninguna edad',
    esFraseNegativa: true,
    // el literal ES la negación: «no mueve ninguna edad». Una negación adelante no lo invierte, lo duplica
    en: [H3_RAMPA],
    porQue:
      'la Rampa corre de 60 a 72 y el Piso Vital abre a los sesenta y cinco: por fuera el ' +
      'dispositivo se parece a una reforma que corre la edad jubilatoria, y esta cláusula es la ' +
      'única diferencia. Borrarla no rompe ninguna otra frase y convierte al PLAN en lo contrario',
  },
  {
    valor: 'la abre quien la usa',
    en: [H3_RAMPA],
    porQue:
      'una salida gradual que el empleador pueda proponer es un despido blando a los sesenta. El ' +
      'modo de falla principal del dispositivo se cierra con esta regla y con ninguna otra',
  },
  {
    valor: 'no es un Pacto de Cuidado',
    en: [H3_DOS_EDADES],
    porQue:
      'la decisión más disputable de §7.2, y verificada adversarialmente: inscribir la Casa de Dos ' +
      'Edades como Pacto arrastraría el reconocimiento previsional por horas (PLANCUIDADO:316) —la ' +
      'moneda que §4.4 se negó a duplicar— y el derecho a heredar sin testamento a los cinco años ' +
      '(PLANCUIDADO:319). Convivir no es cuidar, y sin esta frase el alquiler barato se vuelve ' +
      'aporte jubilatorio y título hereditario sin que nadie lo decida',
  },
  {
    valor: 'no puede ser apoderado',
    en: [H3_DOS_EDADES, H3_ANO_DEL_DUELO],
    porQue:
      'la prohibición absoluta del arreglo 8, y vale en los DOS domicilios: el conviviente de la ' +
      'Casa de Dos Edades y el Acompañante de Umbral, que entra a una casa donde acaba de morir ' +
      'alguien y está por abrirse una sucesión. Son las dos superficies de captura más grandes del ' +
      'documento y una sola de las dos escrita deja la otra abierta',
  },
  {
    valor: 'execution cells',
    en: [H3_ENTE],
    porQue:
      'la ANAV NO nace autárquica, y es una decisión y no un descuido. La tabla canónica está ' +
      '`superseded` y su default nuevo son execution cells adentro de ministerios existentes, con ' +
      'autonomía solo después de que un piloto pruebe demanda durable, financiamiento estable y ' +
      'necesidad legal (TABLA_AGENCIAS_BASTA.md:11). Un PLAN habilitado por derogación expresa de ' +
      'dos reglas no puede pedir la tercera, y sin esta frase la SECCIÓN 8 crea por decreto la ' +
      'agencia más grande del ecosistema',
  },
  {
    valor: 'no fija montos',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'la gobernanza de la ANAV es por sustracción: no fija montos (§4.2), no elige beneficiarios ' +
      '(§5.4) y no acumula fondo. Un organismo que gira el 45% del presupuesto y además decide sus ' +
      'montos es el objeto más capturable del proyecto, y la comparación con el ecosistema entero ' +
      'no es tolerable sin este párrafo al lado',
  },
  /**
   * **La decimosexta forma de «esto no existe», y la más elocuente del tramo
   * (C-1): §7.4 declaraba vacío lo que §7.6 citaba como ocupado, con dieciocho
   * líneas de distancia.** «Del cuerpo tampoco hay nada» era falso —`PLANEB:989`
   * trae funerarias, crematorios y cementerios con tarifa publicada, y `:990`
   * entierros verdes y compostaje humano— y el propio documento lo sabía: §7.6
   * escribe «entierro verde» citando esa misma sección. Las tres palabras que el
   * grep buscó sí dan cero; la frase que las encabezaba, no. Lo genuinamente
   * vacío es EL ACTO DECLARADO, y eso es lo que la sección aporta.
   */
  {
    valor: 'crematorios',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      'el corpus escribe el CATÁLOGO de qué se hace con un cuerpo (PLANEB:989, :990) y no la ' +
      'elección. Con esta palabra escrita, «del cuerpo no hay nada» no puede volver: la afirmación ' +
      'que la sección puede hacer es la acotada, y sin la evidencia al lado la acotación se pierde',
  },
  {
    valor: 'el corpus escribe el catálogo y no la elección',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      'la ACOTACIÓN, que es la otra mitad del arreglo de C-1 y la que la evidencia sola no sostiene: ' +
      'probado, revertir este encabezado a «del cuerpo tampoco hay nada» DEJANDO los crematorios y ' +
      'los entierros verdes escritos dos renglones después salía verde, y dejaba el párrafo ' +
      'afirmando y negando lo mismo en la misma oración',
  },
  // ── Task 7 · las decisiones y los conteos que la revisión encontró sin guardia ──
  /**
   * **I-6: «todo valor único se declara» estaba a medias, y ninguno de los cinco
   * valores tenía guardia.** Los cuatro que siguen salían **exit 0** mutados:
   * `catorce personas` → `veinticuatro` (que además deja «los otros trece» dos
   * líneas abajo: contradicción interna literal), `cada 60 días` → `cada 180
   * días` (el control es mandato del arreglo 8), `Tres veces en el año` → `Una
   * vez` y la ventana de la Rampa invertida a «entre los sesenta y dos y los
   * setenta», que contradice a la vez el H3 del dispositivo y la fila del
   * Calendario de §3.2.
   */
  {
    valor: 'catorce personas mayores',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'el tamaño de la Casa de Arco es mandato del brief y decisión de diseño declarada: pocas para ' +
      'que cada quien sepa el nombre de los otros trece, suficientes para pagar una guardia nocturna. ' +
      'Movido, el párrafo siguiente sigue diciendo «los otros trece» y el dispositivo se contradice solo',
  },
  {
    valor: 'cada 60 días',
    en: [H3_DOS_EDADES],
    porQue:
      'el control del primer año es mandato del arreglo 8, junto con la prohibición absoluta. Es la ' +
      'única cosa que convierte al arreglo en supervisado: estirado a 180 días queda una convivencia ' +
      'registrada y visitada dos veces por año en la casa de alguien que vive solo',
  },
  {
    valor: 'Tres veces en el año',
    en: [H3_ANO_DEL_DUELO],
    porQue:
      'el ritmo del Año del Duelo, declarado en el texto como decisión de diseño de este documento. ' +
      'Bajado a una visita, el dispositivo deja de ser un año acompañado y pasa a ser un trámite, y ' +
      'la declaración de diseño queda cubriendo un número que ya no es el que se decidió',
  },
  {
    valor: 'Entre los sesenta y los setenta y dos',
    en: [H3_RAMPA],
    porQue:
      'la ventana escrita en letras, que es donde vive el dispositivo: la familia de cifra protege ' +
      '«60–72» y no protege la prosa. Invertida a «sesenta y dos / setenta» contradice el H3 de la ' +
      'propia subsección y la fila «La rampa» del Calendario, y las dos siguen verdes',
  },
  /**
   * **I-5: la única refutación del brief que exigió contar a mano se podía
   * revertir al número equivocado en verde.** El brief decía «el patrón AN+sufijo
   * que siguen 15 de 22» y es falso: las filas 39–60 de TABLA_AGENCIAS_BASTA.md
   * son 22 planes, PLANCUL no tiene agencia → 21 agencias, y las no-AN son ENSV,
   * CNDU, CNEG y AMCC → 17. Mutadas a `quince` y a `veintidós agencias`, las dos
   * salían **exit 0**: un editor futuro que «corrigiera» hacia el brief no
   * encontraba resistencia. `veces: 2` en §8.1 porque el conteo sostiene dos
   * párrafos distintos —el patrón del nombre y la prohibición de acumular
   * materias— y perder uno es perder la mitad del argumento.
   */
  {
    valor: 'diecisiete llevan sigla',
    en: [H3_ENTE],
    porQue:
      'el conteo verificado a mano sobre TABLA_AGENCIAS_BASTA.md:39-60, contra el «15 de 22» del ' +
      'brief. Es la justificación entera de que la ANAV no estrene una quinta excepción al patrón',
  },
  {
    valor: 'veintiuna agencias',
    en: [H3_ENTE],
    veces: 2,
    porQue:
      '21 y no 22: la tabla tiene 22 filas y PLANCUL no tiene agencia. El número corre dos veces en ' +
      '§8.1 —el patrón del nombre y «las veintiuna agencias del ecosistema están cortadas por ' +
      'materia»— y es el denominador de las dos afirmaciones',
  },
  {
    valor: 'las veintiuna agencias, los veintidós PLANes',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'la comparación incómoda mide a la ANAV contra el ecosistema ENTERO, y «entero» son esos dos ' +
      'números. Con el denominador movido, «la ANAV mueve sola del mismo orden que todo lo demás ' +
      'junto» deja de ser el hecho que la sección escribió para que no lo escriba un adversario',
  },
  /**
   * **I-9: dos fundamentos más que salían en verde borrados.** `no acumula fondo`
   * es una de las tres patas de la gobernanza por sustracción y la aserción
   * existente solo cubría la primera (`no fija montos`); `por decisión propia no
   * tiene agencia` es el fundamento ENTERO de por qué el Umbral del Legado lo
   * ejecuta la ANAV y no PLANCUL, y revertido a «tiene agencia propia» el
   * documento queda coherente y falso.
   */
  {
    valor: 'no elige beneficiarios',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'la segunda pata de la sustracción, que corre contra §5.4: el acceso se resuelve por evidencia ' +
      'verificable por sistema y por edad registrada, no por una mesa que elige. Sin ella, la agencia ' +
      'que gira el 45% del presupuesto vuelve a poder decidir a quién',
  },
  {
    valor: 'no acumula fondo',
    en: [H3_BAJO_ADMINISTRACION],
    porQue:
      'la tercera pata: la ANAV liquida contra un índice publicado y un padrón inscripto. Un fondo ' +
      'propio en el organismo más grande del ecosistema es exactamente el objeto capturable que la ' +
      'sección declara no haber diseñado',
  },
  {
    valor: 'por decisión propia no tiene agencia',
    en: [H3_UMBRAL_DEL_LEGADO],
    porQue:
      'PLANCUL declara cuatro veces que no tiene organismo (PLANCUL:46, :106, :389, :471) y la tabla ' +
      'canónica lo registra igual. Es el fundamento completo de por qué el Umbral del Legado lo ' +
      'ejecuta la ANAV: revertido, la sección sigue leyéndose bien y le adjudica el deber al PLAN ' +
      'que eligió no poder recibirlo',
  },
  /**
   * **Nueve fundamentos más, encontrados rompiendo con un juego que NO salió de
   * la lista de hallazgos.** La lección que la revisión de la Task 7 dejó es que
   * el autor del chequeo no puede ser el único que lo rompe: escritas las doce
   * aserciones de la tarea y las diecisiete de la revisión, veinticuatro
   * mutaciones nuevas —elegidas contra lo que NADIE había escrito pensando en la
   * guardia— dejaron quince supervivientes. Estas nueve son las que, borradas o
   * invertidas, dejan el documento coherente y falso; las seis restantes van
   * declaradas como huecos abiertos en el reporte, con su motivo.
   */
  {
    valor: 'PLANMOV §3.11',
    en: [H3_RAMPA],
    porQue:
      'el arreglo de M-10, y no se sostiene solo: el FRM se DEFINE en PLANMOV §3.11 y §14.3 apenas ' +
      'lo nombra como pagador de «Cinco Años Dignos». La guardia abre las anclas y verifica que ' +
      'resuelvan, y §14.3 resuelve: devolver la atribución al ancla equivocada salía verde. Es el ' +
      'instrumento del que la Rampa se cuelga en vez de rediseñarlo, así que va anclado donde vive',
  },
  {
    valor: 'nada se condiciona a haberla tomado',
    en: [H3_RAMPA],
    porQue:
      'la segunda de las tres cláusulas que cierran el modo de falla de la Rampa. La aserción «la ' +
      'abre quien la usa» cubre quién la abre y no qué cuelga de haberla abierto: condicionado el ' +
      'Piso Vital a haber tomado la Rampa, el dispositivo pasa de opción a requisito y «no mueve ' +
      'ninguna edad» queda escrito al lado de una regla que sí la mueve',
  },
  {
    valor: 'no toca el Registro Nacional de Vínculos',
    en: [H3_DOS_EDADES],
    porQue:
      'la consecuencia OPERATIVA de que la Casa de Dos Edades no sea un Pacto de Cuidado. La ' +
      'aserción del veredicto no impide la inscripción: probado, «y se inscribe además en el ' +
      'Registro Nacional de Vínculos» salía verde con el veredicto intacto, que es la contradicción ' +
      'exacta que el veredicto existe para evitar',
  },
  {
    valor: 'en una casa del barrio',
    en: [H3_CASA_DE_ARCO],
    porQue:
      'mandato del brief —catorce personas, en el barrio, no en la ruta— y la mitad del dispositivo ' +
      'que el párrafo siguiente funda: a una casa donde los nietos llegan caminando se va. Mudada ' +
      'sobre una ruta, la Casa de Arco es el geriátrico que vino a evitar y el fundamento queda ' +
      'intacto contradiciéndola',
  },
  {
    valor: 'no nombra prestadores',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      'la primera de las tres reglas contra la superficie de captura comercial, que es la única del ' +
      'documento donde el riesgo es que un dato valga un cliente. Invertidas las reglas, el párrafo ' +
      'sigue anunciando que las escribe y el registro de voluntades queda abierto al sector que ' +
      'PLANEB:985 describe',
  },
  {
    valor: 'Se registra donde se registra la muerte',
    en: [H3_ULTIMA_PALABRA],
    porQue:
      'la RESPUESTA a la objeción del Cofre Digital Ciudadano. La aserción del Cofre obliga a ' +
      'plantear el problema y no a resolverlo: borrada esta frase, §7.4 explica por qué el ' +
      'contenedor obvio no sirve y no dice dónde vive la declaración, que es lo único que la vuelve ' +
      'legible por un tercero el día que hace falta',
  },
  {
    valor: 'ni intermediario de ningún prestador',
    esFraseNegativa: true,
    // el literal arranca con «ni» y cierra una enumeración negativa —«no puede ser apoderado, ni beneficiario, ni heredero designado, ni…»—: es negativo por construcción
    en: [H3_ANO_DEL_DUELO],
    porQue:
      'la mitad COMERCIAL de la prohibición extendida al Acompañante de Umbral. «No puede ser ' +
      'apoderado» cubre lo patrimonial; esto cubre al que entra a la casa a las cuarenta y ocho ' +
      'horas con la tarjeta de una funeraria, que es la superficie que §7.4 acaba de declarar la ' +
      'peor del documento',
  },
  {
    valor: 'sin que nadie vaya a pedirlo',
    en: [H3_UMBRAL_DEL_LEGADO],
    porQue:
      'EL dispositivo entero: el tramo del patrimonio no inventa procedimiento, inventa el ' +
      'disparador. Invertido a «cuando la familia vaya a pedirlo y pague la entrada», el Umbral del ' +
      'Legado es la sucesión que ya existe y §0.7 midió, con el nombre nuevo puesto encima',
  },
  {
    valor: 'nace como célula de ejecución',
    en: [H3_ENTE],
    porQue:
      'la DECISIÓN, que la aserción «execution cells» no cubre: esa cita el default de la tabla ' +
      'canónica, y probado, «la ANAV nace autárquica de entrada» salía verde con la cita intacta ' +
      'dos renglones más arriba. Un PLAN habilitado por derogación expresa de dos reglas no pide la ' +
      'tercera, y esa frase es donde eso se cumple o no',
  },
  {
    valor: 'la ANAV cita, no contrata',
    en: [H3_PAMI],
    porQue:
      'la resolución entera del arreglo 9. El contrato de continuidad está prohibido como cadena ' +
      'literal y lo que lo reemplaza —la citación— no tenía guardia: «la ANAV contrata y no solo ' +
      'cita» salía verde, con los Centros de Vitalidad definidos cuatro veces por la negativa y ' +
      'autogobernados por asamblea tres renglones antes',
  },
  {
    valor: 'queda fuera de este PLAN',
    en: [H3_PAMI],
    porQue:
      'el «contrato de continuidad de 36 meses» no existe y la guardia lo prohíbe; lo que la sección ' +
      'debe a cambio es la declaración de que la refundación del PAMI no es de este PLAN, porque la ' +
      'Regla de Arco de §3.4 manda que la materia decida el escalón. Sin ella, la SECCIÓN 8 crea una ' +
      'agencia de edades que se lee como dueña de una materia ajena',
  },
  // ── Task 8 ────────────────────────────────────────────────────────────────
  /**
   * **La CUARTA rama de declaración de valores, que la Task 7 agregó a las
   * Global Constraints: la restricción heredada.** «Decisión de diseño de este
   * documento» hace DOS afirmaciones —que no es una medición, y que este
   * documento la eligió—, y para la banda de quince años la segunda es falsa:
   * llega del gate. La fórmula acá sería inventar autoría, que es la misma clase
   * de error que inventar un número. La nota de procedencia es lo que va, y se
   * exige escrita porque es lo primero que una compresión se lleva.
   */
  {
    valor: 'no la elige este documento',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la nota de procedencia de la banda de quince años: llega como restricción del gate y no como ' +
      'decisión de esta sección. La forma de la rampa SÍ es decisión de diseño; la banda no, y ' +
      'escribir la fórmula sobre ella sería atribuirse una autoría que no se tiene',
  },
  {
    valor: 'decisión de diseño de este documento',
    en: [H3_LA_RAMPA_DEL_GASTO, H3_EJE_INTERGENERACIONAL, H3_SIN_PISO],
    porQue:
      'los tres valores únicos que esta sección SÍ elige —la forma de la rampa, el cero que reemplaza ' +
      'al 0,60 y la razón de ejecución— llevan la fórmula canónica. Sin ella quedan como si los ' +
      'hubiera medido alguien',
  },
  {
    valor: 'empuja a la baja en los dos extremos',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la dirección REAL del redondeo, y el recíproco de la prohibición de «hacia adentro» (I-2). ' +
      'Prohibir la frase falsa no obliga a escribir la verdadera: sin esta aserción, borrarla deja ' +
      'la reconciliación sin decir para qué lado se movió, y para qué lado se movió es la única ' +
      'razón por la que los dos productos quedan por debajo de su extremo del gate',
  },
  {
    valor: 'reingeniería declarada',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      '**la calibración, que es la libertad que vive un nivel más arriba** (I-3). «El gate divide, no ' +
      'el anual multiplica» es cierto como mecánica y falso como relato: la banda anual de referencia ' +
      'ya estaba escrita antes que ninguna tabla, lo que encierra al coeficiente en una ventana de ' +
      'una décima, y la rampa se movió hasta caer adentro. Negarse a cerrar al centavo es honesto; ' +
      'presentar la forma como descubierta no lo sería',
  },
  {
    valor: 'monto pendiente',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'la salida honesta de C-6, y es la que PLANPACTO:498 ya usó con la base ancha del IVA: la ' +
      'columna del medio se carga con monto pendiente y confianza media, no con una cifra. La otra ' +
      'salida era declarar el hueco entero, y el documento eligió esta porque el unitario existe',
  },
  {
    valor: 'no cuenta en ninguna parte',
    en: [H3_TRES_COLUMNAS],
    porQue:
      '**el hueco entero, en una frase** (mutación propia). Invertida a «y cuenta que un millón ' +
      'largo llegó por la vía de excepción», §9.3 pasa a decir que el corpus tiene el sustraendo, ' +
      'con la celda de la tabla todavía cargada como «monto pendiente» y el párrafo siguiente ' +
      'todavía explicando por qué no se puede multiplicar. La prohibición de magnitudes cerca de la ' +
      'vía de excepción no la atrapa: «un millón largo» no lleva dígito, y meterle las formas en ' +
      'letras pondría en rojo la oración honesta, que también cuenta gente. La afirmación positiva ' +
      'es la que hay que custodiar',
  },
  {
    valor: 'estrenar el padrón',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'el diagnóstico exacto del hueco, que es más preciso que «no hay datos»: el unitario está ' +
      '(PLANREP:2261) y lo que falta es cuántas personas llegaron por la vía de excepción. ' +
      'Multiplicar los cinco millones por el mínimo no estrena el precio: estrena el padrón, y ' +
      'ese es el número que nadie tiene',
  },
  {
    valor: 'uno a veinte',
    en: [H3_SIN_PISO],
    porQue:
      'la razón de ejecución que §3.6 difirió A ESTA SECCIÓN por escrito —«la proporción no se fija ' +
      'acá: la deriva la Sección 9»—. Sin este valor la pieza uno del blindaje queda anunciada y sin ' +
      'número, que es la forma más barata de no fijarla, y §3.6 declaró que callarla es no fijarla',
  },
  {
    valor: 'par recíproco',
    en: [H2_INTEGRACION],
    porQue:
      'la mitad que PLANARCO le debe a PLANPACTO, y es lo único que le debe. PLANPACTO:721 escribió ' +
      'la suya y dejó dicho que este PLAN «todavía tiene una sola mitad escrita»: si esta sección no ' +
      'la emite, esa frase sigue siendo verdadera con el documento entero escrito',
  },
  {
    valor: 'modo degradado',
    en: [H2_INTEGRACION],
    /**
     * **Ocho y no siete, y el siete estaba mal contado.** Las ocurrencias son las
     * seis aristas, el par recíproco y el anuncio del párrafo que las presenta
     * («van con su modo degradado»). Con el mínimo en 7, borrarle el suyo al par
     * recíproco dejaba 7 y salía **exit 0** — encontrado por mutación propia, y es
     * la misma forma que el conteo grueso ya había dejado pasar con PLANREP: un
     * mínimo por debajo del real convierte al chequeo en decoración.
     */
    veces: 8,
    porQue:
      'las seis dependencias críticas, el par recíproco y el anuncio que las presenta. La spec ' +
      'obliga a que cada PLAN nuevo lo declare, y el conteo es lo que impide que se declare para dos ' +
      'y se olvide para cuatro: seis aristas sin modo degradado son seis puntos de falla que el ' +
      'documento anuncia y no contesta',
  },
  {
    valor: 'no se declara como arista',
    en: [H2_INTEGRACION],
    porQue:
      'el patrón de PLANPACTO:723: lo que no es arista va en prosa CON LA RAZÓN. PLANRUTA no es nodo ' +
      'del grafo y declararlo rompería la validación. Sin esta frase, la relación se pierde o se ' +
      'escribe como arista y rompe el registro en el tramo E',
  },
  /**
   * **Las declaraciones AUTOCRÍTICAS eran las menos protegidas del documento, y
   * son su núcleo ético** (I-6). Cinco mutaciones, cinco verdes: invertir «vuelve
   * la hipótesis un punto menos absurda» por «más absurda», invertir «la habría
   * expuesto más» por «protegido más», borrar entero el párrafo del costo que se
   * le traslada a PLANPACTO, borrar entero el párrafo de los seis léxicos —que es
   * la evidencia de C-6— y aflojar «menor a un veinteavo» a «un décimo».
   *
   * Las cinco tienen la misma forma: **son las frases que solo perjudican al que
   * las escribe**, así que nada adentro del documento las reclama y su ausencia no
   * rompe ninguna otra cosa. Una frase que nadie extraña es una frase que se cae
   * en la primera compresión, y estas cinco son las que el documento tiene que
   * pagar para que el resto se lea como algo más que un folleto.
   *
   * Se domicilian como literal y no como regla: lo que hay que custodiar no es un
   * número sino una dirección, y la dirección se escribe en palabras.
   */
  {
    valor: 'vuelve la hipótesis un punto menos absurda',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue:
      'la dirección en que se movió el reemplazo del 0,60, y va CONTRA el interés propio: un ' +
      'denominador más chico afloja el argumento de PLANPACTO. Invertida a «más absurda» el ' +
      'documento se declara benefactor del PLAN al que le achicó el margen, con los cuatro números ' +
      'de la división intactos',
  },
  {
    valor: 'la habría expuesto más',
    en: [H3_SIN_PISO],
    porQue:
      'la mitad incómoda del argumento de la ausencia de piso: no es que el piso no haga falta, es ' +
      'que el piso que este proyecto escribe habría expuesto MÁS a la Renta de Arco en recesión. ' +
      'Invertida a «protegido más», §9.4 pasa a defender lo contrario de lo que el PLAN hizo',
  },
  {
    valor: 'menor a un veinteavo',
    esFraseNegativa: true,
    // vive adentro de «no puede ser, en un ejercicio, menor a un veinteavo», que es negativa por diseño: la obligación se escribe como prohibición de bajar del piso
    en: [H3_SIN_PISO],
    porQue:
      'la razón de ejecución escrita como obligación y no como descripción. Aflojarla a «un décimo» ' +
      'duplica el piso sin tocar «uno a veinte», que sigue escrito dos renglones antes: el número en ' +
      'letras y la fracción que lo ejecuta son dos afirmaciones y las dos tienen que estar',
  },
  {
    valor: 'el PLAN que más empuja contra el objetivo de convergencia',
    en: [H2_INTEGRACION],
    porQue:
      'el costo que PLANARCO le traslada a PLANPACTO, escrito en ESTE documento y no en el del otro. ' +
      'Es lo único de la INTEGRACIÓN que no le conviene al PLAN, y borrar el párrafo entero dejaba ' +
      'el par recíproco declarado con la mitad simpática nada más',
  },
  {
    valor: 'se buscó bajo seis léxicos',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'la evidencia de C-6, y la regla de las dieciséis víctimas la hace obligatoria: «esto no ' +
      'existe» dicho sin buscar bajo otro nombre es el modo de falla propio de este tramo. Sin el ' +
      'párrafo, el hueco de la columna del medio queda declarado sin nada detrás',
  },
  /**
   * **La cosecha propia: veintinueve mutaciones VERDES buscadas después de tener
   * los hallazgos arreglados.** Todas comparten forma con las cinco de I-6 y con
   * las cinco de I-7 —son afirmaciones en palabras, no cifras— pero ninguna
   * estaba en la lista de la revisión, que es el punto: la guardia que uno
   * escribe cubre lo que uno miró. Las que siguen son las que se cierran como
   * literal porque lo que custodian es una DIRECCIÓN, y una dirección no tiene
   * aritmética que rehacer: el degradado que liquida en cero y no completo, el
   * punto único de falla que es de PLANDIG, la estación que queda vacía, el
   * fantasma que sigue vivo en la web, el calificador `superseded`, el
   * emparejamiento bajo con bajo, la columna que se titula «Monto Aproximado» y
   * el sentido en que corre la razón de ejecución.
   */
  /**
   * **Tercera vuelta de mutación propia, y quince de dieciséis salieron VERDES
   * otra vez.** Se buscaron apuntando a lo que las dos vueltas anteriores NO
   * habían mirado: las premisas en palabras de las que cuelgan las cuatro
   * decisiones grandes de la sección. Todas tienen la misma anatomía —invertir
   * una cláusula subordinada deja el argumento en pie y le cambia el suelo— y
   * ninguna mueve una cifra, así que ningún chequeo aritmético las ve.
   *
   * La lección, que es la del tramo entero: **la guardia cubre lo que uno miró.**
   * No hay forma de cerrar la clase con reglas; hay que ir a buscarlas, y cada
   * vuelta encuentra las de la vuelta anterior. Lo que queda abierto va dicho en
   * el reporte, no supuesto cerrado.
   */
  /**
   * **Cuarta vuelta: diez de diez VERDES, y por eso la clase se declara ABIERTA.**
   * La curva de las cuatro vueltas propias es 29/30, 15/16, 10/10 — no satura, y
   * no va a saturar: cada vuelta encuentra las que la anterior no miró, porque lo
   * que se busca son cláusulas subordinadas invertidas y el castellano tiene
   * infinitas. **Estas doce entradas cierran las diez de la cuarta vuelta y NO
   * cierran la clase**, y quien lea este archivo tiene que saberlo: una quinta
   * vuelta encuentra más. Lo que sí queda cerrado es cada premisa que las cuatro
   * decisiones grandes de la SECCIÓN 9 usan como suelo.
   */
  {
    valor: 'el orden inverso de sanción no agarra',
    en: [H3_SIN_PISO],
    porQue:
      'la propiedad del Techo A de la que cuelga la protección de la Capa de Renta. Invertida, lo ' +
      'previsional queda expuesto al orden inverso y §9.4 contesta la ausencia de piso con una ' +
      'protección que su propia oración acaba de negar',
  },
  {
    valor: 'no cabe en ese horizonte',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'el motivo por el que la rampa existe: un régimen constante no entra en quince años contra la ' +
      'banda del gate. Invertido, la tabla entera queda sin razón de ser y la sección abre diciendo ' +
      'que la cuenta que no cerraba cerraba',
  },
  {
    valor: 'tres mil quinientos a seis mil cuatrocientos millones',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'el anual plano —53.000/15 y 96.000/15— que se escribe para mostrar que NO es la magnitud de ' +
      'un régimen. Es la mitad del dilema que la rampa resuelve, y va en letras: cambiada, el ' +
      'argumento sigue en pie sobre un número que ya no sale de dividir por quince',
  },
  {
    valor: 'adentro del piso y no arriba',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue:
      'la contestación por el otro camino: si alguien lee la razón de ejecución como afectación ' +
      'encubierta, PLANPACTO:381 la manda adentro del piso —consume escalón, no agrega línea— y ' +
      'este PLAN no tiene escalón donde consumir. Invertida, el cero pierde su segundo fundamento',
  },
  {
    valor: 'el degradado es hoy y el pleno es lo que hay que esperar',
    en: [H2_INTEGRACION],
    porQue:
      'la lectura incómoda del modo degradado de PLANMON, y es la única de las seis que se declara ' +
      'ya corriendo. Invertida, la sección afirma que el PLAN cuenta hoy con una capa que todavía ' +
      'no existe',
  },
  {
    valor: 'no hay damnificado con expediente',
    esFraseNegativa: true,
    // el literal ES la negación, y es lo que hace barata la suspensión de la forma
    en: [H3_SIN_PISO],
    porQue:
      'la razón por la que la presión fiscal aterriza en la forma y no en la renta. Invertida, §9.4 ' +
      'declara que la Capa de Forma está tan defendida como la de Renta, y la tesis del documento ' +
      '—se conserva como renta y se suspende como forma— se queda sin mecanismo',
  },
  {
    valor: 'que 4.2 declaró como hueco',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'el tercer motivo por el que multiplicar cinco millones por el mínimo no da el sustraendo: el ' +
      'haber del Piso Vital no está fijado. Declarado resuelto, la columna del medio pasa a ser ' +
      'calculable y la tabla se contradice consigo misma',
  },
  {
    /**
     * Con el sujeto adentro, y es la novena forma del arquetipo otra vez: con
     * `es su sucesor declarado` a secas, la negación —«PLANARCO NO es su sucesor
     * declarado»— contiene la aserción y salía **exit 0**. Una frase que se cubre
     * a sí misma por accidente ortográfico. Todo literal que declare una relación
     * afirmativa tiene que llevar su sujeto pegado.
     */
    valor: 'PLANARCO es su sucesor declarado',
    en: [H2_INTEGRACION],
    porQue:
      'la razón por la que las seis citas de PLANCUL se corrigen con nota de sucesión y no ' +
      'borrándolas. Sin la sucesión, el fantasma queda nombrado y sin heredero, que es peor que no ' +
      'nombrarlo',
  },
  {
    valor: 'no decide ninguno de sus montos',
    en: [H3_SIN_PISO],
    porQue:
      'el cierre de la SECCIÓN 9 y la lectura adversarial que el documento se hace a sí mismo: el ' +
      'proyecto le confió su PLAN más grande a una agencia que administra y no decide. Invertido, ' +
      'la sección termina elogiando lo que vino a declarar',
  },
  {
    valor: 'alcanza con un mal año',
    en: [H3_SIN_PISO],
    porQue:
      'el disparador real de la suspensión de la forma, y la razón por la que el riesgo no es ' +
      'político sino contable. Movido a «un cambio de gobierno», el PLAN se protege del adversario ' +
      'equivocado',
  },
  {
    valor: 'sin destino atado',
    en: [H3_SIN_PISO],
    porQue:
      '**el fundamento del cero de §9.2, escrito en §9.4** (mutación propia, tercera vuelta). Si la ' +
      'Capa de Forma pasa a tener destino atado, crea una afectación específica, el reemplazo del ' +
      '0,60 por cero deja de estar fundado y la división rehecha entera queda sin razón — con los ' +
      'cinco números de §9.2 intactos y la guardia verde',
  },
  {
    valor: 'no crea ninguna',
    en: [H3_EJE_INTERGENERACIONAL],
    porQue:
      'la misma premisa donde se usa: PLANARCO no crea afectaciones específicas, que es lo que la ' +
      'letra F suma. Es la única razón por la que el reemplazo puede ser cero y no otro número',
  },
  {
    valor: 'Techo A por materia',
    en: [H3_SIN_PISO],
    porQue:
      'la protección que reemplaza al piso constitucional que este PLAN no pide. Movido a Techo B, ' +
      'lo previsional pasa a ser afectación nueva, el orden inverso de sanción lo agarra y §9.4 ' +
      'contesta la ausencia de piso con una protección que el corpus no le da',
  },
  {
    valor: 'en un ejercicio',
    esFraseNegativa: true,
    // fragmento de la misma cláusula negativa que «menor a un veinteavo»: el período solo aparece adentro de «no puede ser, en un ejercicio, menor a un veinteavo»
    en: [H3_SIN_PISO],
    porQue:
      'el PERÍODO de la razón de ejecución, y sin él la obligación es otra: un promedio de quince ' +
      'años se cumple ceroneando la forma diez y compensando cinco, que es exactamente el ' +
      'vaciamiento que la pieza uno existe para atrapar',
  },
  {
    valor: 'confianza media',
    en: [H3_TRES_COLUMNAS],
    porQue:
      '**el ascenso de calificador, que es el modo de falla propio de este tramo** (mutación propia). ' +
      'Media y no alta: hay dueño y acto previsible, y lo que no hay es la desagregación. Con ' +
      '«confianza alta», el monto pendiente se lee como un dato que existe y todavía no se buscó',
  },
  {
    valor: 'sabe cuánto sale y no sabe cuánto cuesta',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'la tesis de §9.3 en una línea, y la que el documento paga por haber declarado el hueco. ' +
      'Invertida, el PLAN afirma saber lo único que declaró no saber',
  },
  {
    valor: 'el Tramo Ganado sustituye lo mismo que eroga',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'la razón por la que tres de las cuatro filas cierran, y la que sostiene el «cero — ' +
      'pass-through» de la tabla. Permutada entre los tres renglones, las cuatro filas siguen ' +
      'escritas y ninguna dice lo que su celda declara',
  },
  {
    valor: 'veces más caro de lo que eroga',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'el SENTIDO de la confusión que §9.1 previene: confundir el monto bajo administración con la ' +
      'erogación lee al PLAN más caro, no más barato. Dado vuelta, «entre seis y once veces» sigue ' +
      'escrito y el aviso pasa a advertir contra lo contrario de lo que pasa',
  },
  {
    valor: 'la partición es contable y no calendario',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'lo que hace legítima la tabla: las fases del PLAN se solapan y una integral necesita tramos ' +
      'que no se pisen. Invertido, la rampa se declara calendario y contradice la hoja de ruta, que ' +
      'escribe las fases con bordes solapados — y §12 hereda la contradicción',
  },
  {
    valor: 'no reclama escalón ni piso',
    esFraseNegativa: true,
    // el literal ES la negación, y es la renuncia que el par recíproco con PLANPACTO existe para declarar
    en: [H2_INTEGRACION],
    porQue:
      'la mitad que PLANARCO le da a PLANPACTO, y la decisión más incómoda del documento entero. ' +
      'Invertida, el par recíproco pasa a reclamar lo que §0 y §3.4 declaran que no reclama, y la ' +
      'Escalera de ocho escalones se rompe desde la sección que existe para no romperla',
  },
  {
    valor: 'este PLAN le declinó el Fondo de Garantía de Sustentabilidad',
    en: [H2_INTEGRACION],
    porQue:
      'la razón por la que PLAN24CN no es arista: una fuente que no se reclama no crea dependencia. ' +
      'Invertida a «le reclamó», el grafo pierde una arista que sí existiría y §4.4 —donde el PLAN ' +
      'declina el FGS incluso donde le convendría— queda contradicho',
  },
  {
    valor: 'sin documento, sin ordinal y sin presupuesto',
    en: [H2_INTEGRACION],
    porQue:
      'qué le falta exactamente al primer fantasma. El prohibido de PLANJUB exime la línea que dice ' +
      '«nunca existió», así que dejando esa frase y dándole documento propio a la de al lado la ' +
      'guardia salía verde: la exención es de línea y la afirmación es de cláusula',
  },
  {
    valor: 'liquida en cero',
    en: [H2_INTEGRACION],
    porQue:
      'el modo degradado de PLANCUIDADO. Invertido a «liquida completo», la ausencia de la agencia ' +
      'que valida las horas deja de tener consecuencia y la dependencia declarada deja de ser una',
  },
  {
    valor: 'punto único de falla',
    en: [H2_INTEGRACION],
    porQue:
      'PLANDIG, y es la única de las seis que se declara así. Borrarlo no rompe ningún conteo —el ' +
      'párrafo sigue ahí con su modo degradado— y la sección pierde su advertencia más fuerte: una ' +
      'estación que se abre sola necesita que el hecho registrado llegue sin que nadie lo tipee',
  },
  {
    valor: 'deja una estación vacía',
    en: [H2_INTEGRACION],
    porQue:
      'PLANSAL, la única cuyo modo degradado deja un lugar del Calendario anunciado y sin nada ' +
      'adentro. Es la diferencia entre una dependencia que enlentece y una que agujerea, y el ' +
      'documento la declara por su nombre',
  },
  {
    valor: 'sigue publicando',
    en: [H2_INTEGRACION],
    porQue:
      'el segundo fantasma sigue VIVO: PLANVEJ es un código retirado del canon que la aplicación ' +
      'pública todavía muestra con título propio. Invertido a «ya dejó de publicar», el párrafo ' +
      'entero pierde su razón de estar —«uno en un glosario se corrige leyendo; uno en código se ' +
      'corrige desplegando»— y la deuda que declara desaparece sin haberse pagado',
  },
  {
    valor: 'el nodo más dependiente del corpus',
    en: [H2_INTEGRACION],
    porQue:
      'la lectura honesta de las seis aristas: el número no lo elige la sección, llega con el diseño ' +
      'del PLAN. Sin la frase, seis dependencias críticas se leen como un dato administrativo',
  },
  {
    valor: 'superseded',
    en: [H3_SIN_PISO],
    porQue:
      'el calificador del papel del que sale 51.260–65.430M, y su denominador ni siquiera incluye a ' +
      'este PLAN ni a los otros tres nuevos. Borrarlo asciende una estimación vencida a término de ' +
      'comparación vigente, que es el ascenso de calificador que este tramo ya cometió',
  },
  {
    valor: 'bajo con bajo y alto con alto',
    en: [H3_SIN_PISO],
    porQue:
      'la regla de emparejamiento que hace válidos 11,7% y 16,7%. Invertida, los dos porcentajes ' +
      'siguen escritos y dejan de salir de la cuenta que la frase declara: cruzarlos mezcla ' +
      'escenarios y da cocientes sin sentido, y lo dice el propio párrafo',
  },
  {
    valor: 'Monto Aproximado',
    en: [H3_TRES_COLUMNAS],
    porQue:
      'el calificador puesto sobre el unitario de PLANREP:2261 para que nadie lo ascienda: la ' +
      'columna de la que sale se titula así y su objeto es la absorción por otro programa, no medir ' +
      'una partida. Sin él, ~USD 250/mes se lee como una medición',
  },
  {
    valor: 'de la Capa de Forma no puede ser',
    en: [H3_SIN_PISO],
    porQue:
      'el SENTIDO de la razón de ejecución, que es todo el dispositivo: el piso protege a la forma ' +
      'contra la renta, no al revés. Dado vuelta, «uno a veinte» y «un veinteavo» siguen escritos y ' +
      'la pieza uno del blindaje pasa a garantizar lo que ya está garantizado por materia',
  },
  {
    valor: 'no se descubrió',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'la mitad activa de la confesión de calibración (I-3). Con «reingeniería declarada» sola, la ' +
      'frase se puede reescribir para decir que el coeficiente salió de la tabla sin mirar el ' +
      'resultado, que es justamente lo que no pasó',
  },
  {
    valor: 'doscientos millones abajo, ochenta arriba',
    en: [H3_LA_RAMPA_DEL_GASTO],
    porQue:
      'las dos diferencias que el redondeo deja sin usar: 53.000 − 52.800 = 200 y 96.000 − 95.920 = ' +
      '80. Van escritas en vez de absorbidas moviéndole un punto a la tabla, y son la prueba de que ' +
      'no se absorbieron: sin ellas, la afirmación de que no se cerró al centavo no tiene evidencia',
  },
  {
    valor: 'conserva 0,25',
    en: [H3_SIN_PISO],
    porQue:
      'lo que el quinto escalón —«Cuidado y arco»— conserva, y es de PLANCUIDADO (PLANPACTO:391-402). ' +
      'Es el dato que sostiene «ninguno de los ocho es del arco»: si el escalón que lleva el nombre ' +
      'del arco tuviera otra magnitud, la renuncia de este PLAN mediría otra cosa',
  },
  {
    valor: 'PLANVEJ',
    en: [H2_INTEGRACION],
    porQue:
      'el segundo fantasma (C-9), y no es de la misma clase que el primero: PLANJUB es un PLAN ' +
      'prometido que nunca se escribió, y PLANVEJ es un código que la reconciliación del canon retiró ' +
      'y que la aplicación sigue publicando con título propio, con un test que exige que su cuerpo no ' +
      'cargue. Verificado en los dos archivos antes de escribirlo',
  },
  // ── Task 9 · SECCIÓN 10: RIESGOS Y RESPUESTAS ──────────────────────────────
  {
    valor: 'sin una sola fuente externa',
    en: [H2_RIESGOS],
    porQue:
      'la calidad del precedente con el que este PLAN se defiende del vaciamiento. Los cuatro casos ' +
      'de 0.8 son aserciones del corpus, no series medidas, y un riesgo que se contesta con ' +
      'precedentes ajenos tiene que declarar de qué están hechos. Borrado, la SECCIÓN 10 hereda una ' +
      'autoridad que 0.8 se negó a sí misma',
  },
  {
    valor: 'la brecha del tablero se abre y nadie la cierra',
    en: [H2_RIESGOS],
    porQue:
      'el riesgo RESIDUAL con nombre, que es lo único que la SECCIÓN 10 agrega sobre 0.8 y 3.6. Sin ' +
      'él la subsección repite el diagnóstico y el mecanismo, y el documento se queda sin decir qué ' +
      'queda sin cubrir después de las tres piezas',
  },
  {
    valor: 'se mide en días de financiamiento y no en cantidad de empleados',
    en: [H2_RIESGOS],
    porQue:
      'el criterio con el que la ley tiene que fijar el corte del adelanto, y la única defensa contra ' +
      'que vuelva el acantilado que 6.3 sacó. Invertido a cantidad de empleados, la SECCIÓN 10 manda ' +
      'escribir exactamente el umbral que 6.3 se negó a escribir',
  },
  {
    valor: 'la ausencia simultánea y el desfasaje de caja',
    en: [H2_RIESGOS],
    porQue:
      'qué carga la nómina cuando la jornada de cuidado y el Alto caen sobre la misma empresa. NO es ' +
      'la plata, que la reintegra el crédito: 6.3 lo dejó escrito así y la SECCIÓN 10 lo hereda. ' +
      'Cambiado por «el costo», el riesgo pasa a estar resuelto por el crédito fiscal y desaparece',
  },
  {
    valor: 'el Alto no promueve de tranche',
    en: [H2_RIESGOS],
    esFraseNegativa: true,
    // el literal ES la negación: la respuesta al riesgo tres es una prohibición de promover.
    porQue:
      'la respuesta al riesgo tres, y la única que no inventa un número: si la ventana en que los dos ' +
      'regímenes no se superponen se cierra sin medición, el dispositivo no avanza. Sin la cláusula, ' +
      'la interacción no modelada queda declarada y sin consecuencia',
  },
  {
    valor: 'reversible por el mismo camino por el que se hizo',
    en: [H2_RIESGOS],
    porQue:
      'la naturaleza del riesgo cuatro: la habilitación de este PLAN es derogación expresa, y una ' +
      'derogación expresa se repone. Borrado, el PLAN se lee como habilitado de manera estable y el ' +
      'ataque más barato que tiene queda sin nombrar',
  },
  {
    valor: 'la discapacidad queda entera en PLANCUIDADO y en PLANSAL',
    en: [H2_RIESGOS],
    porQue:
      'la frontera del acta, escrita como respuesta de diseño: lo único que se retira es la porción ' +
      'de vejez. Invertida, PLANARCO se adjudica un hueco que el acta no le dio y la reposición de la ' +
      'regla derogada pasa a estar justificada',
  },
  // ── Task 9 · SECCIÓN 11: EL MAPA DE PERDEDORES ─────────────────────────────
  {
    valor: 'pierde la exclusividad sobre la redención previsional',
    en: [H2_PERDEDORES],
    porQue:
      'la pérdida más grande del mapa, y la única que este PLAN produce sobre un compromiso vigente. ' +
      'Sin ella, la sección enumera pérdidas ajenas y omite la propia',
  },
  {
    valor: 'cambian de ventanilla',
    en: [H2_PERDEDORES],
    porQue:
      'qué es exactamente lo que PLANCUIDADO pierde: no el monto, no el dueño, no el conteo — el ' +
      'lugar donde se cobra. Cambiado por una pérdida de plata, el mapa afirma un doble conteo que ' +
      '4.4 declaró que no ocurre',
  },
  {
    valor: 'No la pierde a manos de este PLAN',
    en: [H2_PERDEDORES],
    porQue:
      'PLANARCO declinó el FGS entero en 4.4. Sin esta cláusula, la fila de PLAN24CN se lee como que ' +
      'este PLAN se llevó el fondo, que es lo contrario de lo que la Sección 4 escribió',
  },
  {
    valor: 'sin presupuesto operativo',
    en: [H2_PERDEDORES],
    porQue:
      'el estado real de PLAN24CN (PLAN24CN:8-12), y lo que convierte la pérdida en reasignación de ' +
      'una reserva no ejecutada en vez de ruptura de un compromiso vigente. Borrado, el mapa acusa a ' +
      'este PLAN de romper algo que no estaba andando',
  },
  {
    valor: 'PLANREP no pierde nada',
    en: [H2_PERDEDORES],
    porQue:
      'la ausencia declarada. Una pérdida que nadie declara se asume, y sobre el PLAN que reasigna la ' +
      'partida más grande del Estado la presunción por omisión es que sacó de todos lados',
  },
  {
    valor: 'perdedor más grande de este mapa no es un PLAN',
    en: [H2_PERDEDORES],
    porQue:
      'el cierre que vuelve honesta la lista: las cuatro renuncias de PLANARCO están escritas antes ' +
      'de la Sección 9 y son lo que la habría hecho más barata. Sin el cierre, el mapa es una lista ' +
      'de pérdidas ajenas escrita por el que gana',
  },
  // ── Task 9 · SECCIÓN 12: HOJA DE RUTA ──────────────────────────────────────
  {
    valor: 'no tiene autoridad moral para regalarle capital a sus chicos',
    en: [H2_HOJA_DE_RUTA],
    esFraseNegativa: true,
    // el literal ES la negación, y es la razón declarada del orden de las fases.
    porQue:
      'la razón del orden, y el orden es declarado y no estético. Sin la razón escrita, la secuencia ' +
      'se lee como una prioridad presupuestaria y cualquiera la reordena con un argumento de caja',
  },
  {
    valor: 'este PLAN no creó ningún instituto',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      '«el Instituto» de la spec tiene cero ocurrencias en el documento. La hoja de ruta puede ' +
      'nombrar la fase por lo que 9.1 escribió o declarar que el dispositivo no existe, y hace las ' +
      'dos: sin la declaración, la fase estrena un organismo en una tabla',
  },
  {
    valor: 'la Capa de Forma entera del comienzo y del medio',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      'qué se cae si la Fase 3 no se ejecuta, dicho por capa y no solo por nombre. Es la deuda que ' +
      'abre el riesgo uno de la SECCIÓN 10 y la razón por la que 3.6 existe',
  },
  // ── Task 9 bis · lo que la revisión encontró sin custodia ──────────────────
  {
    valor: 'un 30% durante doce meses',
    en: [H2_RIESGOS],
    porQue:
      'el umbral del indicador del riesgo dos, que hasta la revisión existía SOLO en la fila de ' +
      'READINESS_GATES_ADVERSARIAL.md y en ninguna parte del PLAN. Dos copias del mismo indicador, ' +
      'una sola escrita, es la forma en que las dos derivan sin que nadie lo note (duda 2 del ' +
      'reporte, adjudicada)',
  },
  {
    valor: 'ninguno de los cuatro casos',
    en: [H2_RIESGOS],
    porQue:
      'los cuatro precedentes de 0.8 no son cuatro organismos: la Convertibilidad es un régimen. La ' +
      'palabra importa porque el argumento del riesgo uno es sobre la CLASE de precedente, y llamar ' +
      'organismo a un régimen mete de contrabando una serie institucional que 0.8 no tiene (M-4)',
  },
  {
    valor: 'dos denominadores distintos',
    en: [H2_PERDEDORES],
    porQue:
      'la lectura correcta de los dos porcentajes del FGS, y es la que §4.4 ya había hecho: 10–20% ' +
      'de los activos del fondo contra 15–20% de la estructura de financiamiento del programa. La ' +
      'versión anterior de este párrafo las declaraba bandas rivales y sin cruzar, que era falso y ' +
      'contradecía a la propia §4.4 (C-1)',
  },
  {
    valor: 'Un ganador en un mapa de perdedores',
    en: [H2_PERDEDORES],
    porQue:
      'el párrafo de PLANCUL se borraba entero y no se rompía nada (M-3). Es la prueba de que la ' +
      'lista se armó mirando el corpus y no la conveniencia: un mapa de perdedores sin el que gana ' +
      'es una lista escrita por el que gana',
  },
  {
    valor: 'se vacía por no ejecución',
    en: [H2_RIESGOS],
    porQue: 'el modo de falla principal, nombrado en el lead del riesgo uno (mutación propia)',
  },
  {
    valor: 'convierte el incumplimiento en un cociente publicado',
    en: [H2_RIESGOS],
    porQue:
      'la única respuesta que el riesgo uno puede dar sin prometer lo que no tiene, y lo que 9.4 ' +
      'agrega sobre el precedente. Cambiada por una demora, la respuesta es la del precedente que ' +
      'el mismo párrafo declara insuficiente (mutación propia)',
  },
  {
    valor: 'por tres centésimas',
    en: [H2_RIESGOS],
    porQue:
      'por cuánto falla el gate: 1,47–1,88x contra un umbral de 1,5. Es la medida de la habilitación ' +
      'y agrandarla o achicarla cambia cuán defendible es la derogación (mutación propia)',
  },
  {
    valor: 'se armó declinando',
    en: [H2_PERDEDORES],
    porQue:
      'el encuadre del mapa entero: la lista de perdedores empieza por lo que este PLAN NO se llevó. ' +
      'Invertido, la sección pasa a ser el inventario de un PLAN que reclamó (mutación propia)',
  },
  {
    valor: 'conserva el Fondo Intergeneracional',
    en: [H2_PERDEDORES],
    porQue:
      'una de las tres ausencias declaradas. Una pérdida que nadie declara se asume, y PLANTER es el ' +
      'PLAN cuyo fondo este documento declinó en 5.2 (mutación propia)',
  },
  {
    valor: 'las cuatro renuncias',
    en: [H2_PERDEDORES],
    porQue:
      'el cierre cuenta cuatro renuncias y son cuatro las que el párrafo enumera: el stock del FGS, ' +
      'el fondo que lleva la palabra en el nombre, la enmienda a la fórmula ajena y el universo de ' +
      'PLANREP. El numeral y la lista son el mismo dato escrito dos veces (mutación propia)',
  },
  {
    valor: '4.4 ya las cruzó',
    en: [H2_PERDEDORES],
    porQue:
      'la remisión que sostiene la corrección de C-1, y sin ella el chequeo que la verifica no corre: ' +
      'la versión anterior de §11 afirmaba que «ninguna sección las cruza» y §4.4 las había cruzado ' +
      'bien en la Task 5. Borrarla devuelve el párrafo a decir que nadie hizo lo que sí está hecho',
  },
  {
    valor: 'de la estructura de financiamiento del programa',
    en: [H2_PERDEDORES],
    porQue:
      'el segundo denominador, escrito. Los dos porcentajes solo son compatibles porque miden cosas ' +
      'distintas: 10–20% DE LOS ACTIVOS del fondo y 15–20% DE LA ESTRUCTURA DE FINANCIAMIENTO del ' +
      'programa. Cambiado por «de los activos», §11 vuelve a afirmar una incoherencia inexistente',
  },
  {
    valor: 'pasa a competir con uno que tiene organismo detrás',
    en: [H2_PERDEDORES],
    porQue:
      'QUÉ pierde PLAN24CN, ahora que se sabe que no pierde una banda: el FGS deja de ser un stock ' +
      'previsional sin dueño de su materia y el reclamo de PLAN24CN pasa a tener competencia con ' +
      'domicilio. Borrado, la fila enumera lo que NO pasa y no dice lo que sí (C-1)',
  },
  {
    valor: 'la fase no se llama así',
    en: [H2_HOJA_DE_RUTA],
    // el literal ES la negación: lo que hay que sostener es que la fase NO lleva
    // el nombre del organismo, y va pegado a la otra negación de la declaración.
    esFraseNegativa: true,
    porQue:
      'la mitad de la declaración del Instituto que vive en el lead: la fase lleva el nombre que 9.1 ' +
      'le puso. Sin el lead, el párrafo declara la inexistencia del organismo y deja abierto que la ' +
      'tabla lo nombre igual',
  },
  {
    valor: 'es el continente',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      'el Calendario de Umbrales es el dispositivo 1 de la portada y no estaba de ningún lado de la ' +
      'lista de supervivencia, que por eso sumaba doce y decía trece. Se declara continente y no ' +
      'pieza, que es lo que este documento sostiene desde la SECCIÓN 3 (I-3)',
  },
  {
    valor: 'de la Fase 2 pero sin pago detrás',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      'el Alto está en la Fase 2 de la tabla y entre los que caen si la Fase 3 no se ejecuta, y sin ' +
      'esta cláusula las dos cosas se contradicen a la vista. El criterio de la lista no es la fase ' +
      'sino la masa —padrón, haber, hecho registrado, obra— y el Alto es la única pieza del medio ' +
      'que no tiene ninguna (I-4)',
  },
  {
    valor: 'años ordinales',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      'la otra mitad de la declaración de unidad, y la mutación propia la destapó: con solo «puntos ' +
      'de calendario» exigido, borrar «y van en años ordinales» salía verde y la comparación con ' +
      '§9.1 se quedaba con un solo lado escrito (M-5)',
  },
  {
    valor: 'puntos de calendario',
    en: [H2_HOJA_DE_RUTA],
    porQue:
      '§12 cuenta puntos de calendario (0 a 1, 1 a 4…) y §9.1 años ordinales (1; 2 a 4…). Las ' +
      'duraciones coinciden y la contención pasa, pero el cambio de unidad no estaba declarado y se ' +
      'leía como desfasaje entre las dos tablas (M-5)',
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
/**
 * **EL HALLAZGO ESTRUCTURAL DE LA REVISIÓN DE LA TASK 7 (C-3), y vale para todo
 * lo que queda del tramo: la guardia prohibía lo que el brief escribió como
 * TEXTO y no lo que escribió como REGLA.** Estaban bloqueadas las cadenas
 * literales `50.000–60.000` y `contrato de continuidad de 36 meses` —las dos
 * frases que el brief traía escritas— y ninguna de las dos restricciones que el
 * brief declaró **vinculantes**: que la sección del final no puede estrenar un
 * unitario funerario sin contradecir el hueco del preámbulo, y que del PAMI no
 * hay un solo número en el corpus. Cinco inyecciones, cinco `exit 0`.
 *
 * **Dos alcances, y la diferencia no es de estilo.** Las dos prohibiciones de
 * abajo son huecos declarados del DOCUMENTO ENTERO, así que corren sobre la
 * LÍNEA —que en este corpus es el párrafo—: verificado línea por línea, ninguna
 * de las seis que nombran algo funerario ni ninguna de las siete que nombran al
 * PAMI trae una magnitud, así que **falsos positivos: cero** y el alcance ancho
 * no cuesta nada. El alcance de ORACIÓN existe para el otro caso —la regla que
 * es de UNA subsección, más abajo—, donde el párrafo sí trae magnitudes ajenas
 * legítimas y la línea entera acusaría de contradicción a un párrafo correcto.
 * El corte de oración es `\n` o un punto SEGUIDO DE ESPACIO: un punto pegado a
 * lo que sigue es separador de miles, ancla (`§9.10`, `0.2`) o abreviatura.
 */
const HUECO_DE_LINEA = String.raw`[^\n]{0,600}`;
const HUECO_DE_ORACION = String.raw`(?:[^.\n]|\.(?=\S)){0,300}`;
/**
 * Una magnitud monetaria escrita como el corpus las escribe, con cifra o con
 * letras: «USD 1.500», «900.000 pesos» y «mil quinientos dólares» son la misma
 * cosa y la segunda forma se agregó porque la primera versión la dejaba pasar.
 */
const MAGNITUD_MONETARIA = String.raw`(?:(?:USD|US\$|AR\$|\$)\s?\d[\d.,]*(?:\s?[–—-]\s?\d[\d.,]*)?\s?(?:mil|millones|mill[óo]n|M\b)?|(?:\d[\d.,]*\s+|(?:\p{L}+\s+){1,4})(?:pesos|d[óo]lares))`;
/**
 * Lo que se hace con un cuerpo, en todos los nombres que el corpus usa —más las
 * dos fórmulas con las que la Bastarda del Adiós se enumera sin nombrar nada
 * funerario (`§0.2` la lista como «fondo prepago, red de prestadores, tarifas
 * publicadas»), que era por donde un precio entraba sin tocar el vocabulario.
 */
const COSA_FUNERARIA = String.raw`(?:sepelios?|velatorios?|funeral(?:es)?|funerari[oa]s?|entierros?|enterrar|cremaci[óo]n(?:es)?|crematorios?|inhumaci[óo]n|cementerios?|Bastarda del Adi[óo]s|tarifas? publicadas?|fondo prepago)`;
/**
 * Magnitud de cualquiera de las tres clases que el brief declaró inexistentes
 * para el PAMI —plata, gente, porcentaje—, con cifra o con letras.
 */
const CUENTA_DE_GENTE = String.raw`(?:afiliad[oa]s|beneficiari[oa]s|jubilad[oa]s|personas|argentinos|mayores)`;
const MAGNITUD_DE_PADRON = String.raw`(?:${MAGNITUD_MONETARIA}|\d[\d.,]*\s*(?:mil(?:lones)?|mill[óo]n)?\s*(?:de\s+)?${CUENTA_DE_GENTE}|\p{L}+\s+(?:mil(?:lones)?|mill[óo]n)\s+de\s+${CUENTA_DE_GENTE}|\d[\d.,]*\s?%|\d[\d.,]*\s+por ciento)`;
/**
 * El PAMI por sus tres nombres. **Es una red, no una prueba** —la doctrina que
 * este archivo ya fijó para el prohibido del gate—: cierra las formas que un
 * documento apurado escribe, no demuestra que no haya un número del PAMI por un
 * camino oblicuo. Eso lo mira la revisión.
 */
const EL_PAMI = String.raw`(?:PAMI|INSSJP|Instituto Nacional de Servicios Sociales para Jubilados y Pensionados)`;
/**
 * **Una magnitud escrita SIN sigla, que es la mitad que `MAGNITUD_MONETARIA` no
 * cubre.** Ese patrón exige `USD`/`$` o la palabra «pesos»/«dólares», así que
 * «entre 2.500 y 5.000 millones por año» no es magnitud para él. Acá entran las
 * dos formas que quedan: la escala en palabras y el separador de miles solo.
 * `\d{1,3}(\.\d{3})+` a propósito: `9.3` es una remisión de sección y `9.300` un
 * monto, y el corpus escribe remisiones en todos los párrafos.
 */
const MAGNITUD_SIN_SIGLA = String.raw`(?:\d[\d.,]*\s*(?:M\b|MM\b|mil millones|mill[óo]n(?:es)?)|\d{1,3}(?:\.\d{3})+)`;
const MAGNITUD_ANCHA = `(?:${MAGNITUD_MONETARIA}|${MAGNITUD_SIN_SIGLA})`;
/**
 * **PLATA Y PADRÓN NO SON LA MISMA MAGNITUD, y este PLAN es el peor lugar
 * posible para confundirlos** (R-2 de la Task 9). `MAGNITUD_SIN_SIGLA` trae la
 * alternativa `\d{1,3}(\.\d{3})+` —el separador de miles solo— y esa alternativa
 * matchea `5.200.000 personas` exactamente igual que `3.700`. El hueco declarado
 * de este documento **es un padrón** (§9.3: el unitario existe, lo que falta es
 * el padrón), así que la oración honesta que un revisor va a escribir es
 * justamente «son 5.200.000 personas y el incremental neto sigue sin número» —y
 * salía **roja**, con la guardia acusando de estrenar un neto a la frase que
 * declara que no lo hay.
 *
 * El corte es por lo que la resta prohibida MIDE. El incremental neto y el gasto
 * sustituido son plata: un conteo de gente al lado de esas palabras no es el
 * número que la prohibición existe para impedir. La vía de excepción es lo
 * contrario —su hueco ES el padrón— y por eso sigue usando `MAGNITUD_ANCHA`.
 *
 * La forma del corte: el separador de miles deja de contar como plata cuando lo
 * que sigue es un sustantivo de gente. `USD 5.200.000` sigue siendo plata por
 * `MAGNITUD_MONETARIA`, y `3.700 millones` por la primera alternativa: **la
 * exclusión alcanza solo al número pelado seguido de personas**, que es la
 * forma en que un padrón se escribe y ninguna en que un monto se escriba.
 */
const MAGNITUD_DE_PLATA = String.raw`(?:${MAGNITUD_MONETARIA}|\d[\d.,]*\s*(?:M\b|MM\b|mil millones|mill[óo]n(?:es)?)|\d{1,3}(?:\.\d{3})+(?!\s*(?:de\s+)?${CUENTA_DE_GENTE}))`;
/** El nombre de la resta que no se puede hacer, en los dos órdenes en que se escribe. */
const EL_NETO_INCREMENTAL = String.raw`(?:incremental neto|neto incremental)`;
/**
 * **Las fórmulas con las que este documento declara que un número NO existe.**
 * Vive acá y no adentro de una entrada porque las dos prohibiciones de la resta
 * —el minuendo y el sustraendo— tienen el mismo juego de salidas honestas, y
 * tenerlo dos veces es tenerlo desincronizado.
 *
 * El juego se ensanchó en la Task 9 y la razón está medida, no supuesta: el
 * comentario de la entrada del neto declaraba «falsos positivos: cero,
 * verificado oración por oración sobre las tres ocurrencias del documento», que
 * es una afirmación sobre **el documento de hoy** y no sobre el texto honesto
 * que una tarea futura puede escribir. Con el juego viejo —`pendiente|no se
 * puede escribir`— salían rojas «todavía no se conoce», «nadie calculó»,
 * «sigue sin número» y «no hay versión neta»: cuatro maneras de decir la
 * verdad, las cuatro acusadas de estrenar la cifra que niegan.
 */
const HONESTIDAD_DEL_HUECO =
  /pendiente|no se (puede|conoce|calcul)|nadie (lo )?calcul|sin número|no hay versión neta/i;

/**
 * **La segunda salida honesta del SUSTRAENDO, que no es declarar el hueco sino
 * declarar que el monto es de otro.** Medida, no supuesta: con
 * `HONESTIDAD_DEL_HUECO` solo, «El gasto sustituido de PLANCUIDADO son USD
 * 1.800–2.400M y no los de este PLAN» seguía **roja**, y es una frase que la
 * SECCIÓN 11 escribe sin esfuerzo: el mapa de perdedores habla de la redención
 * previsional de PLANCUIDADO, que tiene monto propio.
 *
 * **La lista léxica que la Task 9 puso acá se borró: era explotable y el propio
 * reporte la dejó anotada como duda.** Pedía tres fórmulas —«no los de este
 * PLAN», «no esta sección», «gasto sustituido de PLANXXX»— y ninguna de las tres
 * mira el monto, así que la fórmula sin monto ajeno detrás abría la puerta:
 * «El gasto sustituido de este PLAN son USD 900M por año, y el detalle no esta
 * sección» salía **exit 0**. La exención descubierta está arriba, en
 * `magnitudesDelMatchAbiertas()`: la magnitud tiene que estar **anclada y
 * abierta** contra la línea del PLAN al que se le atribuye, que es un cruce y no
 * un permiso de vocabulario.
 */
/**
 * **PATRÓN Y EXCEPCIÓN TIENEN QUE MEDIR LA MISMA UNIDAD** (R-1 de la Task 9, y
 * el defecto más caro que esta lista tuvo).
 *
 * `salvoSi` se evaluaba SIEMPRE sobre la línea entera, aunque el patrón fuera de
 * oración. Consecuencia medida, y no es un borde: la prohibición del neto
 * quedaba **apagada justo en el único párrafo donde el número lavado se
 * escribiría con naturalidad**. Insertar `El neto incremental del PLAN son USD
 * 3.700M por año.` en la línea 837 —la que declara que el neto no se puede
 * escribir— salía **exit 0**, porque la oración honesta de al lado eximía a toda
 * la línea. Y esa línea es, por construcción, la que siempre va a contener la
 * frase que la exime: es la que declara el hueco.
 *
 * | La misma frase deshonesta, según dónde caiga | Antes |
 * |---|---|
 * | en §9.4 | rojo |
 * | en §9.3, párrafo distinto | rojo |
 * | en la línea 837, la que declara «no se puede escribir» | **exit 0** |
 *
 * El alcance ahora se declara por entrada y el tipo lo obliga: una entrada con
 * `salvoSi` **no compila** sin `alcance`. `'oración'` recorta el texto que la
 * excepción mira al tramo entre límites de oración que contiene al match;
 * `'línea'` conserva el comportamiento viejo, y va solo donde el patrón también
 * es de línea o de token suelto y la exención vive en el encuadre de la frase
 * —`PLANJUB` nombrado como inexistente, los 7,3 millones atribuidos a PLANREP—.
 */
type Prohibido = { patron: RegExp; porQue: string } & (
  | { salvoSi?: undefined; salvoSiAnclaAbre?: undefined; alcance?: undefined }
  | { salvoSi: RegExp; salvoSiAnclaAbre?: true; alcance: 'oración' | 'línea' }
  | { salvoSi?: undefined; salvoSiAnclaAbre: true; alcance: 'oración' | 'línea' }
);

/**
 * El tramo de ORACIÓN que contiene a `[desde, hasta)`. El corte es **el mismo**
 * que `HUECO_DE_ORACION` usa adentro del patrón —un salto de línea, o un punto
 * SEGUIDO DE ESPACIO O DE FIN— y eso no es una coincidencia cómoda: si el corte
 * fuera más fino que el del patrón, el ámbito quedaría más chico que el match y
 * la excepción no podría ver ni el texto que el patrón sí atravesó. Por eso el
 * `;` no corta acá aunque corte en `CORTA_ORACION`, que resuelve otra cosa.
 *
 * El resultado se ensancha al span del match como último recaudo: el ámbito de
 * una excepción nunca puede ser más chico que lo que la regla acusó.
 */
function oracionDe(texto: string, desde: number, hasta: number): string {
  const corta = (i: number): boolean =>
    texto[i] === '\n' || (texto[i] === '.' && (i + 1 >= texto.length || /\s/.test(texto[i + 1])));
  let ini = 0;
  for (let i = desde - 1; i >= 0; i--) {
    if (corta(i)) {
      ini = i + 1;
      break;
    }
  }
  let fin = texto.length;
  for (let i = hasta; i < texto.length; i++) {
    if (corta(i)) {
      fin = i + 1;
      break;
    }
  }
  return texto.slice(Math.min(ini, desde), Math.max(fin, hasta));
}

/**
 * El prohibido del gate, con nombre propio porque ahora corre en **dos**
 * documentos: sobre `rawPlano` como entrada de `PROHIBIDOS`, y sobre la nota de
 * habilitación que la Task 9 mudó a `READINESS_GATES_ADVERSARIAL.md` (I-5). La
 * frase que el plan declara prohibida —«escribir que pasó el gate sería falso, y
 * la guardia lo prohíbe»— se había mudado de archivo y se había quedado sin
 * guardia en el camino.
 */
const AFIRMA_QUE_PASO_EL_GATE =
  /(?<!\b(?:no|nunca|jamás|tampoco|ninguno|ninguna|ni)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,30})(pas[óo]|super[óo]|supera|pasa)\s+(el|ese|este|dicho)\s+(gate|umbral)/iu;

const PROHIBIDOS: Prohibido[] = [
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
    patron: AFIRMA_QUE_PASO_EL_GATE,
    porQue:
      'falso: PLANARCO falla contra la suma de sus dos huéspedes por tres centésimas. ' +
      'Se habilita por derogación expresa, no por el gate (ACTA:41-47, :131-137)',
  },
  {
    /**
     * **La formulación que la Task 8 escribió y que es aritméticamente falsa**
     * (I-2). «El redondeo va hacia adentro en los dos extremos» describe mal la
     * única operación de la reconciliación: 6.023 → 6.000 baja, y bajar en el
     * extremo BAJO es ir hacia AFUERA —52.800 queda por debajo de 53.000, o sea
     * fuera de la banda del gate—. La justificación escrita («no se reserva un
     * peso más») solo aplica al extremo alto.
     *
     * Se prohíbe la frase porque corregirla en el documento no impide que vuelva:
     * es la formulación intuitiva, la que cualquiera reescribe sin rehacer la
     * cuenta. Verificado: «hacia adentro» y «para adentro» tienen **cero
     * ocurrencias** en el documento, así que falsos positivos cero, y la
     * prohibición pide «redondeo» en la misma oración para no atrapar un «hacia
     * adentro» de otra materia en una sección futura.
     */
    patron: /redondeo[^.\n]{0,80}(?:hacia|para) adentro|(?:hacia|para) adentro en los dos extremos/iu,
    porQue:
      'falso: el redondeo empuja a la BAJA en los dos extremos. En el alto eso es hacia adentro ' +
      '(95.920 < 96.000, adentro de la banda) y en el bajo es hacia AFUERA (52.800 < 53.000, fuera ' +
      'de la banda). Lo que la regla exige es que ningún producto se pase del gate, no que los dos ' +
      'caigan adentro (I-2)',
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
    alcance: 'línea',
    porQue:
      'PLANJUB es el fantasma que este PLAN sucede: puede nombrarse como inexistente, nunca afirmarse ' +
      'en presente como PLAN vigente',
  },
  {
    /**
     * **La cifra se evade en letras, y la SECCIÓN 11 estrenó la forma** (I-8).
     * `/7[.,]3\s*millones/` cubre el número y no la palabra, así que «el universo
     * de siete coma tres millones de personas de más de sesenta años, que es de
     * este PLAN» salía **exit 0**: la apropiación exacta que C-9 existe para
     * impedir, escrita sin un solo dígito. §11 usa «siete millones largos» dos
     * veces y en las dos es honesta —atribuida y renunciada—, pero la forma
     * quedaba estrenada y sin custodia, que es la manera en que una tarea 10–12
     * la hereda ya como vocabulario del documento.
     */
    patron: /7[.,]3\s*millones|siete\s+(?:coma tres|con tres|millones largos)/i,
    salvoSi: /PLANREP/,
    /**
     * **ALCANCE DE ORACIÓN, y la primera versión de I-8 volvió a caer en R-1.**
     * Encontrado por mutación propia: con `alcance: 'línea'`, insertar «El
     * universo de siete coma tres millones de personas es de este PLAN» en la
     * línea 877 salía **exit 0**, porque esa línea trae —legítimamente— la
     * atribución a PLANREP al final, y una atribución honesta eximía a toda la
     * línea. Es la tercera vez que este archivo tropieza con lo mismo: un
     * `salvoSi` de línea sobre un patrón de token queda apagado justo en la
     * línea donde la frase deshonesta se escribiría con naturalidad, porque esa
     * línea es la que trae la exención. Las tres ocurrencias legítimas
     * —`:877`, `:883`, `:887`— tienen PLANREP en su propia oración.
     */
    alcance: 'oración',
    porQue:
      'los 7,3 millones de 60+ son el blindaje de la Rama 2 de PLANREP (PLANREP:335, :367). ' +
      'PLANARCO puede citarlos atribuidos —con PLANREP nombrado en la misma línea, en número o en ' +
      'letras—, nunca usarlos como su propio universo (C-9)',
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
    // Verificado, las seis líneas del documento que nombran algo funerario
    // —`:66`, `:132`, `:307`, `:637`, `:679`, `:709`— no traen una sola magnitud
    // monetaria, así que **falsos positivos: cero**. Y las dos salidas legítimas
    // que el brief dejó abiertas siguen abiertas: repetir el hueco no escribe
    // ningún número, y una fuente externa nueva se marca en la línea.
    patron: new RegExp(
      `(?:${COSA_FUNERARIA}${HUECO_DE_LINEA}${MAGNITUD_MONETARIA}|${MAGNITUD_MONETARIA}${HUECO_DE_LINEA}${COSA_FUNERARIA})`,
      'iu',
    ),
    salvoSi: /fuente externa|\[externa\]/i,
    alcance: 'línea',
    porQue:
      'el preámbulo declaró el hueco del costo funerario con la fórmula canónica y el brief lo hizo ' +
      'VINCULANTE hacia adelante: PLANEB:988 promete el costo real publicado y no publica ninguno, ' +
      'así que este PLAN no puede estrenar un unitario sin contradecirse. Las dos salidas legítimas ' +
      'son repetir el hueco o traer fuente externa nueva marcándola como externa',
  },
  {
    // Sin `salvoSi` a propósito, y es más fuerte que la exención que la revisión
    // proponía: eximir la LÍNEA que dice «no hay número» dejaba abierto el único
    // lugar donde un número del PAMI cabe sin llamar la atención —el párrafo de
    // §2.4 que declara el hueco—. Probado: con esa exención, meter «serían 5,1
    // millones» ADENTRO de la oración que declara el hueco salía verde. Sin ella
    // no hace falta: ninguna de las siete líneas que nombran al PAMI —`:47`,
    // `:256`, `:262`, `:741`, `:743`, `:747`, `:749`— trae magnitud de ninguna de
    // las tres clases. **Falsos positivos: cero**, verificado línea por línea.
    patron: new RegExp(
      `(?:${EL_PAMI}${HUECO_DE_LINEA}${MAGNITUD_DE_PADRON}|${MAGNITUD_DE_PADRON}${HUECO_DE_LINEA}${EL_PAMI})`,
      'u',
    ),
    porQue:
      'del PAMI no hay número de afiliados, de presupuesto ni de cobertura en todo el corpus, y el ' +
      'brief lo declaró vinculante: si el documento lo necesita, es un hueco declarado. Un número ' +
      'del PAMI escrito acá es una cifra estrenada en la sección que crea la agencia que lo mira',
  },
  {
    /**
     * **El agujero que la SECCIÓN 9.3 entera existe para tapar, y que hasta acá
     * estaba abierto por los dos costados** (C-1). La única guardia sobre el
     * neto incremental miraba CELDAS de la tabla, con un patrón que exigía una
     * sigla pegada a un dígito; la PROSA no la miraba nadie. Reproducido: «El
     * neto incremental es del orden de 2.500–5.000 millones de dólares por año»
     * —el número exacto de `spec:34`, derivado de la columna que la sección
     * declara imposible de llenar— salía **exit 0**.
     *
     * El alcance es de ORACIÓN y no de línea, porque el párrafo de §9.3 que
     * declara el hueco trae remisiones de sección legítimas y el de §9.1 trae la
     * banda bruta: acusarlos sería poner la guardia roja sobre el texto honesto,
     * que es el error que este tramo ya cometió dos veces. **Falsos positivos:
     * cero**, verificado oración por oración sobre las tres ocurrencias del
     * documento —`:808`, `:826` (encabezado de la tabla) y `:837`—: ninguna
     * comparte oración con una magnitud, y las tres remisiones que las rodean
     * (`8.2`, `9.1`, `9.3`, `4.6`) no tienen tres dígitos después del punto.
     *
     * **CORREGIDO EN LA TASK 9, y las dos afirmaciones de arriba eran las que
     * fallaban.** «Falsos positivos: cero» estaba medido contra el documento de
     * ese día y no contra el texto honesto que una tarea futura escribiría, y el
     * alcance de oración del patrón convivía con un `salvoSi` de línea, así que
     * la prohibición estaba apagada exactamente en la línea 837 —la que declara
     * el hueco—. Ver `HONESTIDAD_DEL_HUECO` y el bloque de `Prohibido`.
     *
     * La magnitud pasa de `MAGNITUD_ANCHA` a `MAGNITUD_DE_PLATA` por la misma
     * razón: un neto es plata, y `5.200.000 personas` no es un neto lavado.
     *
     * `salvoSi` mira ahora la ORACIÓN del match y exime las salidas honestas que
     * el documento usa y las que un revisor va a escribir: pendiente, no se
     * puede/conoce/calcula, nadie lo calculó, sin número, no hay versión neta.
     *
     * **Es una red, no una prueba**, con la misma doctrina que el prohibido del
     * gate: cubre el término de arte en sus dos órdenes. Un neto escrito sin
     * nombrarlo —«la plata nueva del PLAN son USD 3.000M»— pasa, y eso lo mira
     * la revisión. No se amplía a `\bneto\b` a secas porque `:540` explica la
     * clase `public_net_cost` como «costo neto» en un párrafo lleno de montos
     * legítimos, y esa línea es honesta.
     */
    patron: new RegExp(
      `(?:${EL_NETO_INCREMENTAL}${HUECO_DE_ORACION}${MAGNITUD_DE_PLATA}|${MAGNITUD_DE_PLATA}${HUECO_DE_ORACION}${EL_NETO_INCREMENTAL})`,
      'iu',
    ),
    salvoSi: HONESTIDAD_DEL_HUECO,
    alcance: 'oración',
    porQue:
      'el incremental neto es la resta a la que le falta el sustraendo: el corpus no tiene el padrón ' +
      'de la vía de excepción, así que cualquier número puesto ahí es el de la columna del medio ' +
      'lavado a través de una sustracción, sin que aparezca ninguna sigla prohibida en el camino. ' +
      'La spec traía 2.500–5.000M neto y sale de esa misma columna: escribirlo es estrenarlo',
  },
  {
    /**
     * El otro costado de la misma resta: el SUSTRAENDO. «Gasto sustituido» tiene
     * una sola ocurrencia en el documento —el encabezado de la tabla de §9.3— y
     * ninguna magnitud cerca, así que la prohibición es exacta y **falsos
     * positivos: cero** por construcción.
     */
    patron: new RegExp(
      `(?:[Gg]asto sustituido${HUECO_DE_ORACION}${MAGNITUD_DE_PLATA}|${MAGNITUD_DE_PLATA}${HUECO_DE_ORACION}[Gg]asto sustituido)`,
      'u',
    ),
    salvoSi: HONESTIDAD_DEL_HUECO,
    /**
     * La segunda salida honesta ya no es una fórmula: es que la magnitud esté
     * abierta contra la línea que la oración ancla (I-1, comentario arriba).
     */
    salvoSiAnclaAbre: true,
    alcance: 'oración',
    porQue:
      'el gasto que el Piso Vital sustituye no se puede cifrar: el unitario existe (PLANREP:2261) y ' +
      'el padrón de la vía de excepción no está en ninguna parte del corpus. Multiplicar los cinco ' +
      'millones de 65+ por el mínimo no estrena el precio: estrena el padrón (C-6)',
  },
  {
    /**
     * **El PADRÓN, que es el número que no existe** (C-6, y una mutación propia
     * lo destapó). «…y cuenta que un millón largo llegó por la vía de excepción»
     * salía **VERDE**: invierte el hueco entero de §9.3 sin nombrar ninguna
     * columna de la tabla, y con eso la fila del Piso Vital pasa a tener
     * sustraendo mientras la celda sigue diciendo «monto pendiente».
     *
     * **Falsos positivos: cero**, verificado oración por oración sobre las cinco
     * líneas que nombran la vía de excepción —`:250`, `:490`, `:828`, `:833`,
     * `:835`—: ninguna trae magnitud en la misma oración, y las anclas que las
     * acompañan (`PLANMON:238`, `§2.3`, `4.2`) no tienen forma de monto. La
     * exención cubre la salida honesta, que es la que el documento usa: decir
     * cuántas personas hay y que no se sabe cuántas llegaron por ahí.
     */
    patron: new RegExp(
      `(?:vía de excepción${HUECO_DE_ORACION}${MAGNITUD_ANCHA}|${MAGNITUD_ANCHA}${HUECO_DE_ORACION}vía de excepción)`,
      'iu',
    ),
    /**
     * **La exención es de LÍNEA y por eso tiene que ser angosta.** La primera
     * versión eximía cualquier línea que dijera «pendiente» o «estrenar el
     * padrón», y `:835` dice las dos: con eso, la línea donde el padrón se podía
     * escribir quedaba exenta entera —el mismo error que este archivo ya cometió
     * con el PAMI y anotó—. Quedan solo las tres fórmulas con las que el
     * documento declara el hueco, y no las que lo explican.
     */
    salvoSi: /no cuenta|no se sabe|falta el padrón/i,
    /**
     * **Alcance de LÍNEA a propósito, y es la única de las tres restas donde lo
     * es.** El comentario de arriba explica por qué la exención tiene que ser
     * angosta: `:835` dice a la vez «pendiente» y «estrenar el padrón», así que
     * la primera versión eximía entera la línea donde el padrón se podía
     * escribir. Con el juego de tres fórmulas que quedó, la línea es la unidad
     * correcta: el documento declara la ausencia del padrón en una oración
     * («no cuenta en ninguna parte cuántas llegaron por la vía de excepción») y
     * nombra la vía en la de al lado. **Y la magnitud sigue siendo `ANCHA`**:
     * acá el número prohibido ES un conteo de gente, al revés que en las dos
     * restas de arriba.
     */
    alcance: 'línea',
    porQue:
      'el padrón de los que llegaron por la vía de excepción no existe en ninguna parte del corpus, ' +
      'y es el sustraendo de la única resta que este PLAN no puede hacer. Un número al lado de esa ' +
      'frase estrena el padrón, y de paso estrena que todas cobran el mínimo —falso— y que el haber ' +
      'del Piso Vital es el mínimo actual, que §4.2 declaró como hueco (C-6)',
  },
  {
    /**
     * El tripwire literal sobre el par exacto de `spec:34`. Redundante con el
     * prohibido semántico de arriba a propósito: aquel es una red sobre el
     * término de arte y este es una prueba sobre el número, y el número entra
     * aunque alguien lo escriba sin nombrar la resta. Verificado: el documento
     * no trae `2.500` en ninguna parte.
     */
    patron: /2\.500\s*(?:[–—-]|\sa\s|\sy\s)\s*5\.000|5\.000\s*(?:[–—-]|\sa\s|\sy\s)\s*2\.500/,
    porQue:
      'es el neto incremental de spec:34, derivado por la propia spec «neto de la absorción de ' +
      'moratoria, PUAM y PNC por vejez» (spec:171) — o sea, de la columna que C-6 declara imposible ' +
      'de llenar. Es el número que este PLAN no puede escribir por ningún camino',
  },
  {
    /**
     * **El dispositivo que la spec nombra y este documento nunca creó.** «El
     * Instituto» de la tercera fase tiene cero ocurrencias en el corpus fuera de
     * la spec, y §12 lo declara inexistente en vez de escribirlo. La declaración
     * es la única forma legítima de que la palabra aparezca acá: cualquier otra
     * la vuelve un ente fundado en una tabla, que es la manera más barata que hay
     * de fundar un organismo y la que este tramo lleva ocho tareas evitando.
     *
     * **`salvoSi` es de ORACIÓN, y la primera versión —de LÍNEA— reproducía el
     * defecto R-1 que este mismo commit acababa de arreglar.** El argumento es
     * literalmente el que este archivo escribió sobre la línea 837: un `salvoSi`
     * de línea sobre un patrón de token queda **apagado justo en la única línea
     * del documento donde el Instituto se fundaría**, porque esa línea es, por
     * construcción, la que declara que no existe. Medido, dos veces verde,
     * insertadas en el párrafo de §12:
     *
     * | Insertado | Antes (`alcance: 'línea'`) | Ahora (`'oración'`) |
     * |---|---|---|
     * | «El Instituto del Arco se crea en la Fase 2.» | exit 0 | rojo |
     * | «…y tiene presupuesto propio.» | exit 0 | rojo |
     *
     * `oracionDe()` no corta en `;`, así que la segunda ocurrencia legítima
     * —«el diseño original la llamaba “la rampa y el Instituto”; este PLAN no
     * creó ningún instituto»— queda adentro de la misma oración que la exime.
     * **Falsos positivos: cero**, verificado: las dos únicas ocurrencias del
     * documento viven en esa oración y ninguna otra sección escribe la palabra.
     */
    patron: /\bInstituto\b/,
    salvoSi: /no existe|no creó|no se llama así|diseño original/i,
    alcance: 'oración',
    porQue:
      '«el Instituto» de la spec no existe en este documento ni en el corpus: la única institución ' +
      'que PLANARCO crea es la ANAV, en la Sección 8. Nombrarlo sin declarar que no existe es ' +
      'estrenar un organismo',
  },
  {
    patron: /sección PLANARCO si existe/i,
    porQue:
      'la cabecera remitía al archivo de gates «si existe», y con eso la promesa —«este PLAN no ' +
      'promueve de tranche sin esos tres attack paths escritos»— se cumplía sola. La guardia ahora ' +
      'exige que la sección exista: el condicional la devuelve a ser decorativa (M-6)',
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

/**
 * **Prohibidos CON DOMICILIO, y la tercera inyección de C-3 es la que los hace
 * falta.** `la Casa de Arco cuesta USD 9.000 por persona y por año` salía **exit
 * 0**, contra un §7.3 que escribe, tres renglones después, «no se escribe el
 * unitario». Es la misma clase de defecto que las otras dos —una regla que el
 * documento declara y la guardia no mira— con una diferencia que impide
 * arreglarla como a las otras: **la regla es de esta subsección y no del
 * documento.** §7.3 remite el costeo a la Sección 9 por escrito, así que un
 * prohibido global sobre «Casa de Arco + monto» pondría en rojo, dentro de dos
 * tareas, exactamente el párrafo que ese renglón manda escribir.
 *
 * De ahí el domicilio: el patrón corre SOLO adentro del tramo declarado, con la
 * misma resolución que las cifras y las aserciones —`textoDeDomicilio()`, con la
 * misma doctrina de que un domicilio ambiguo no corre y lo dice—.
 */
const PROHIBIDOS_CON_DOMICILIO: { patron: RegExp; en: string; porQue: string }[] = [
  {
    patron: new RegExp(
      `(?:Casa de Arco${HUECO_DE_ORACION}${MAGNITUD_MONETARIA}|${MAGNITUD_MONETARIA}${HUECO_DE_ORACION}Casa de Arco)`,
      'u',
    ),
    en: H3_CASA_DE_ARCO,
    porQue:
      '§7.3 declara que no escribe el unitario de la Casa de Arco —no hay costeo contra ningún ' +
      'padrón— y escribe solo la posición relativa. Las dos magnitudes que la subsección sí trae ' +
      'son AJENAS (PLANCUIDADO:219 y :575) y ninguna comparte oración con el nombre del ' +
      'dispositivo: falsos positivos cero, verificado oración por oración. El costeo propio lo ' +
      'deriva la Sección 9, que queda afuera de este domicilio a propósito',
  },
];

/** El chequeo: el patrón corre sobre el texto sin negritas del tramo domiciliado. */
function verificarProhibidosConDomicilio(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const { patron, en, porQue } of PROHIBIDOS_CON_DOMICILIO) {
    const { texto, errores: errDom } = textoDeDomicilio(lineas, en);
    errores.push(...errDom);
    if (texto === null) continue;
    const plano = texto.replace(/\*\*/g, '');
    const global = new RegExp(
      patron.source,
      patron.flags.includes('g') ? patron.flags : `${patron.flags}g`,
    );
    let m: RegExpExecArray | null;
    while ((m = global.exec(plano)) !== null) {
      errores.push(`en «${en.trim()}»: «${m[0].slice(0, 120)}» está prohibido acá — ${porQue}`);
    }
  }
  return errores;
}

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
/**
 * `exigirContigua` es de la Task 5 y cierra la mitad que faltaba del punto 2.
 * Que el párrafo intercalado no CORTE el parseo es lo correcto para la tabla del
 * Calendario —el corpus parte tablas y las filas de abajo se tienen que
 * verificar igual—, pero deja de serlo cuando la tabla es un registro contable:
 * una tabla de fuentes con un párrafo en el medio ya no se lee como una tabla, y
 * el renglón que quede del otro lado del corte es exactamente donde se esconde
 * la fuente incómoda. Con la bandera puesta, el corte se parsea Y se reporta.
 */
/**
 * UNDÉCIMA FORMA DEL ARQUETIPO (encontrada rompiendo, arreglada acá). La cabecera
 * se reconocía con `columnas.every((col) => l.includes(col))`: un test de
 * CONJUNTO, no de ORDEN. `| Dueño | Fuente | Disponibilidad | Confianza | Clase |`
 * matcheaba igual y salía **exit 0**, mientras todo lo que se lee por índice
 * —`fila[1]` como dueño, que es el que entra al `Set`, y `fila[0]` como fuente,
 * que es el que se cita en todos los mensajes de error— quedaba corrido una
 * columna. Una tabla contable con las columnas permutadas se verifica entera
 * contra la columna equivocada y no se entera nadie.
 *
 * Ahora la comparación es POSICIONAL: la celda k de la cabecera tiene que
 * contener la columna k. Se compara por `includes` y no por igualdad a propósito,
 * porque el Calendario declara `Dispositivo del arco` donde la constante dice
 * `Dispositivo`; exigir igualdad exacta pondría roja una cabecera honesta, que es
 * la falla que este tramo ya cometió dos veces. Permutar sigue saliendo rojo: la
 * cabecera deja de reconocerse y el chequeo reporta que falta la tabla, que es la
 * respuesta correcta —«si el ancla no es única, el chequeo no corre y lo dice»
 * aplicado al orden de las columnas.
 */
function filasDeTabla(
  lineas: string[],
  columnas: string[],
  exigirContigua = false,
): { filas: string[][] | null; errores: string[] } {
  const errores: string[] = [];
  const cabeceras: number[] = [];
  lineas.forEach((l, k) => {
    if (!esFilaDeTabla(l)) return;
    const cel = celdas(l);
    if (cel.length < columnas.length) return;
    if (columnas.every((col, i) => (cel[i] ?? '').includes(col))) cabeceras.push(k);
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
  /** Líneas que no son fila y quedaron ENTRE dos filas: el corte de la tabla. */
  const cortes: number[] = [];
  let candidatas: number[] = [];
  for (let j = i + 1; j < lineas.length; j++) {
    const l = lineas[j];
    if (esEncabezado(l)) break; // la tabla no cruza un título
    if (!esFilaDeTabla(l)) {
      // Párrafo intercalado: NO corta el parseo. Queda anotado y solo cuenta
      // como corte si después vuelve a haber filas — lo de abajo del último
      // renglón es prosa que sigue, no una tabla partida.
      if (filas.length > 0) candidatas.push(j);
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    // La cabecera de OTRA tabla se reconoce por el separador que la sigue.
    if (filas.length > 0 && esSeparadorDeTabla(lineas[j + 1] ?? '')) break;
    if (candidatas.length > 0) {
      cortes.push(...candidatas);
      candidatas = [];
    }
    filas.push(celdas(l));
  }

  if (exigirContigua && cortes.length > 0) {
    errores.push(
      `la tabla con las columnas [${columnas.join(' · ')}] está partida: entre sus filas hay ` +
        `${String(cortes.length)} línea(s) que no son fila (línea ${cortes.map((k) => String(k + 1)).join(', ')}). ` +
        'Una tabla contable no se parte: el renglón que queda del otro lado del corte es donde se ' +
        'esconde la fuente que nadie quiere sumar',
    );
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
  errores.push(...verificarTablaDeFuentes(lineas));
  // (d) Task 8: la rampa del gasto y la tabla de tres columnas.
  errores.push(...verificarRampaDelGasto(lineas));
  errores.push(...verificarTresColumnas(lineas));
  // (e) Task 8 · arreglo de C-2 e I-4: la aritmética de la PROSA de la SECCIÓN 9.
  errores.push(...verificarCocientesDerivados(lineas));
  errores.push(...verificarDivisionDePacto(lineas));

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// La rampa del gasto: la SECCIÓN 9.1, y la reconciliación con el gate.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_RAMPA = ['Tramo', 'Años', 'Cuántos', 'Ejecución sobre el régimen', 'Años-régimen'];

/** El horizonte del gate, en años. No es negociable: es sobre lo que se corrió. */
const HORIZONTE_DEL_GATE = 15;
/** La banda de quince años, en USD millones. Insumo del gate, no salida del acta. */
const GATE_QUINCE_ANOS: [number, number] = [53_000, 96_000];
/** La banda anual derivada que el documento declara, en USD millones. */
const BANDA_ANUAL_REGIMEN: [number, number] = [6_000, 10_900];
/**
 * El coeficiente de la rampa: años-régimen equivalentes adentro de quince años
 * calendario. **No se copia de la prosa: la tabla lo tiene que producir**, y
 * `verificarRampaDelGasto()` cruza la suma de la columna contra este número. De
 * ahí lo toman los cocientes derivados de abajo, así que si alguien mueve un
 * porcentaje de la tabla, la cuenta entera se cae de una vez y no de a pedazos.
 */
const COEFICIENTE_DE_LA_RAMPA = 8.8;

/**
 * **La tabla que cierra C-5, y es el problema más grave del tramo.** La cabecera
 * declara USD 53.000–96.000M a quince años y el cuerpo, hasta la SECCIÓN 8, no
 * escribió un peso por año: un régimen constante no cabe en ese horizonte —
 * 6.000 × 15 = 90.000 y 11.000 × 15 = 165.000— y la rampa que explicaría el
 * cociente no estaba escrita en ninguna parte del proyecto.
 *
 * Escrita, es una tabla, y una tabla se suma. Lo que se verifica no es que los
 * números estén: es que la CUENTA cierre en las cuatro direcciones que un editor
 * puede romper una por una sin que se note ninguna:
 *
 * 1. **Los tramos parten los quince años sin hueco y sin solapamiento.** El
 *    calendario de fases del PLAN sí se solapa —los umbrales arrancan adentro de
 *    la ventana de la rampa—, así que la partición contable es una decisión
 *    aparte, y si deja de cubrir 1 a 15 la integral deja de ser la integral.
 * 2. **Cada fila es consistente consigo misma:** años × ejecución = años-régimen.
 *    Sin esto, mover un porcentaje deja el sub-total viejo y el total sigue dando.
 * 3. **El total es la suma de la columna**, no un número escrito al pie.
 * 4. **El producto contra la banda anual cae POR DEBAJO de su extremo del
 *    gate**, en los dos extremos: el redondeo empuja a la baja. Ojo con la
 *    formulación vieja —«los dos caen adentro de la banda»—: es falsa en el
 *    extremo bajo, donde 52.800 queda por debajo de 53.000 y por lo tanto
 *    AFUERA. Lo que la regla exige es lo que importa: un PLAN no se puede
 *    reservar un peso más de aquello contra lo que se lo midió.
 *
 * La cuarta es la que vuelve verificable la reconciliación entera: con ella, la
 * banda anual deja de ser una cifra que alguien eligió y pasa a ser un cociente
 * que cualquiera rehace.
 */
function verificarRampaDelGasto(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_RAMPA, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla de la rampa del gasto, con las columnas [${COLUMNAS_RAMPA.join(' · ')}]. ` +
          'Es la que reconcilia la banda de quince años del gate con el gasto anual en régimen, y ' +
          'sin ella la cabecera queda remitiendo a una sección que no cierra la cuenta',
      );
    }
    return errores;
  }
  if (filas.length < 3) {
    errores.push(
      `la tabla de la rampa tiene ${String(filas.length)} fila(s): son los tramos del horizonte más ` +
        'la fila de total, y con menos de tres no hay rampa que verificar',
    );
    return errores;
  }

  const total = filas[filas.length - 1];
  const tramos = filas.slice(0, -1);
  if (!/total/i.test(total[0] ?? '')) {
    errores.push(
      `la última fila de la tabla de la rampa no es el total («${(total[0] ?? '').slice(0, 60)}»): el ` +
        'total va EN la tabla para que la suma se pueda cruzar contra él, no en la prosa de al lado',
    );
    return errores;
  }

  let anioAnterior = 0;
  let sumaAnios = 0;
  let sumaCent = 0;
  let anioDelRegimen: number | null = null;

  tramos.forEach((fila, k) => {
    const donde = `fila ${String(k + 1)} de la rampa («${(fila[0] ?? '').slice(0, 40)}»)`;

    const m = /^(\d+)(?:\s*a\s*(\d+))?$/.exec((fila[1] ?? '').trim());
    if (!m) {
      errores.push(`${donde}: la columna «Años» no se lee como «N» ni como «N a M»: «${fila[1] ?? ''}»`);
      return;
    }
    const desde = Number(m[1]);
    const hasta = m[2] === undefined ? desde : Number(m[2]);
    if (desde !== anioAnterior + 1 || hasta < desde) {
      errores.push(
        `${donde}: el tramo va de ${String(desde)} a ${String(hasta)} y el anterior cerró en ` +
          `${String(anioAnterior)}. Los tramos parten los quince años sin hueco y sin solapamiento: ` +
          'las FASES del PLAN sí se solapan, y por eso la partición contable es una decisión aparte',
      );
    }
    anioAnterior = hasta;

    const cuantos = Number((fila[2] ?? '').trim());
    const anios = hasta - desde + 1;
    if (!Number.isInteger(cuantos) || cuantos !== anios) {
      errores.push(
        `${donde}: la columna «Cuántos» dice «${fila[2] ?? ''}» y el tramo ${String(desde)} a ` +
          `${String(hasta)} son ${String(anios)} año(s)`,
      );
      return;
    }
    sumaAnios += cuantos;

    const p = /(\d+(?:[.,]\d+)?)\s*%/.exec(fila[3] ?? '');
    if (!p) {
      errores.push(`${donde}: la columna «Ejecución sobre el régimen» no trae porcentaje: «${fila[3] ?? ''}»`);
      return;
    }
    const pct = Number(p[1].replace(',', '.'));
    if (pct === 100 && anioDelRegimen === null) anioDelRegimen = desde;

    const ar = rango(fila[4] ?? '');
    if (ar === null) {
      errores.push(`${donde}: la columna «Años-régimen» no trae número: «${fila[4] ?? ''}»`);
      return;
    }
    const esperado = c((cuantos * pct) / 100);
    if (ar[0] !== esperado) {
      errores.push(
        `${donde}: ${String(cuantos)} año(s) al ${String(pct)}% dan ${fmt(esperado)} años-régimen y la ` +
          `columna dice ${fmt(ar[0])}. Mover un porcentaje sin mover el sub-total deja el total dando ` +
          'y la rampa describiendo otra cosa',
      );
    }
    sumaCent += ar[0];
  });

  /**
   * **Cuántos tramos son, y de qué fase es cada uno.** Dos mutaciones propias,
   * las dos verdes: «se parten en cinco tramos» → «cuatro», con la tabla de
   * cinco al lado; y la última fila retitulada «Fase 6», que contradice el
   * calendario de fases que §9.1 fija y que la Task 9 tiene que respetar en §12.
   * El conteo escrito y la tabla que lo sostiene son dos afirmaciones distintas,
   * y el ordinal de la fase es la única forma que tiene el documento de decir
   * dónde arranca el régimen sin repetir el año.
   */
  {
    const { texto } = textoDeDomicilio(lineas, H3_LA_RAMPA_DEL_GASTO);
    const cuantos = /se parten en (\p{L}+) tramos/iu.exec(texto ?? '');
    const escrito = enLetras(tramos.length);
    if (cuantos === null) {
      errores.push(
        `la prosa de §9.1 no dice en cuántos tramos se parten los quince años, y la tabla trae ` +
          `${String(tramos.length)}. El conteo escrito es lo que un lector cuenta sin sumar la tabla`,
      );
    } else if (cuantos[1].toLowerCase() !== escrito) {
      errores.push(
        `la prosa de §9.1 dice «${cuantos[1]} tramos» y la tabla tiene ${String(tramos.length)} ` +
          `(«${escrito}»). Un tramo que se cae de la tabla con el conteo intacto es un pedazo del ` +
          'horizonte que deja de tener ejecución declarada',
      );
    }
  }
  /**
   * **Los nombres de los tramos son el calendario de fases que §12 hereda.** La
   * Task 8 dejó anotado que «el Instituto» de la hoja de ruta no existe en el
   * documento y que §12 tiene que usar el nombre de esta tabla; mutando la fila
   * de las Fases 2 y 3 a «El Instituto del Arco» la guardia salía verde, o sea
   * que la deuda se podía pagar inventando el dispositivo en vez de citando la
   * tabla. El conjunto va cerrado, como el de renglones y el de dispositivos de
   * la portada: agregar o renombrar un tramo pasa por acá, con la razón escrita.
   */
  const TRAMOS_DE_LA_RAMPA = [
    'Contar el arco',
    'El piso y el final, entrando',
    'La salida gradual del trabajo y las casas',
    'El Calendario completo, sin régimen',
    'Régimen pleno',
  ];
  TRAMOS_DE_LA_RAMPA.forEach((nombre, k) => {
    if (!(tramos[k]?.[0] ?? '').includes(nombre)) {
      errores.push(
        `la fila ${String(k + 1)} de la rampa no se llama «${nombre}» («${(tramos[k]?.[0] ?? '').slice(0, 50)}»). ` +
          'Los nombres de los tramos son el calendario de fases que §12 tiene que respetar, y son ' +
          'el único lugar del documento donde ese calendario está escrito: renombrar uno acá deja a ' +
          'la hoja de ruta citando un dispositivo que no existe',
      );
    }
  });
  const FASES_DE_LA_RAMPA = /Fase(?:s)? (\d)(?: y (\d))?/u;
  tramos.forEach((fila, k) => {
    const f = FASES_DE_LA_RAMPA.exec(fila[0] ?? '');
    if (f === null) {
      errores.push(
        `fila ${String(k + 1)} de la rampa («${(fila[0] ?? '').slice(0, 40)}») no nombra su fase. ` +
          'La partición contable de §9.1 es la que fija el calendario de fases del PLAN, y §12 tiene ' +
          'que ser compatible con ella: sin la fase escrita, las dos secciones no se pueden cruzar',
      );
      return;
    }
    for (const n of [f[1], f[2]]) {
      if (n !== undefined && Number(n) > 4) {
        errores.push(
          `la rampa nombra una «Fase ${n}» y el PLAN tiene cinco fases, de la 0 a la 4. Una fase ` +
            'estrenada acá contradice la hoja de ruta sin que ninguna cifra se mueva',
        );
      }
    }
  });

  if (sumaAnios !== HORIZONTE_DEL_GATE) {
    errores.push(
      `los tramos de la rampa suman ${String(sumaAnios)} años y el gate se corrió sobre ` +
        `${String(HORIZONTE_DEL_GATE)}. La integral se calcula sobre el horizonte del gate o no es la ` +
        'integral que hay que cerrar',
    );
  }
  /**
   * **El año del régimen se calculaba y no se usaba para nada** (I-5). El único
   * chequeo era `=== null`, así que poniendo el tramo 4 al 100% y el 5 al 90% el
   * total seguía dando 8,80, la integral quedaba idéntica, `anioDelRegimen`
   * pasaba de 11 a 9 —y la prosa seguía diciendo «el régimen se alcanza en el año
   * once»— con **exit 0**. Borrar la frase entera también salía verde.
   *
   * Dos arreglos, porque son dos agujeros distintos: (1) el ÚLTIMO tramo tiene
   * que ejecutar al 100%, o la rampa vuelve a bajar después de llegar y deja de
   * ser una rampa; (2) el ordinal escrito en la prosa se cruza contra el año que
   * la tabla produce, en letras, porque el documento lo escribe en letras.
   */
  if (anioDelRegimen === null) {
    errores.push(
      'ningún tramo de la rampa ejecuta al 100%: el brief pide la rampa «con el año en que el ' +
        'régimen se alcanza», y una rampa que nunca llega al régimen no tiene régimen que declarar',
    );
  }
  const ultimo = tramos[tramos.length - 1];
  const pctUltimo = /(\d+(?:[.,]\d+)?)\s*%/.exec(ultimo?.[3] ?? '');
  if (pctUltimo !== null && Number(pctUltimo[1].replace(',', '.')) !== 100) {
    errores.push(
      `el último tramo de la rampa ejecuta al ${pctUltimo[1]}% y tiene que ejecutar al 100%: una ` +
        'rampa que llega al régimen y después baja no es una rampa, y con el total intacto la ' +
        'integral sigue cerrando mientras el año del régimen se corre para atrás',
    );
  }
  if (anioDelRegimen !== null) {
    const { texto } = textoDeDomicilio(lineas, H3_LA_RAMPA_DEL_GASTO);
    const enLetras = EN_LETRAS[anioDelRegimen] ?? String(anioDelRegimen);
    const escrito = /r[ée]gimen se alcanza en el año ([\p{L}]+)/iu.exec(texto ?? '');
    if (escrito === null) {
      errores.push(
        `la prosa de §9.1 no dice en qué año se alcanza el régimen. La tabla lo produce —año ` +
          `${String(anioDelRegimen)}, «${enLetras}»— y borrar la frase dejaba la rampa sin su única ` +
          'lectura en palabras: el brief pide la rampa CON el año en que el régimen se alcanza',
      );
    } else if (escrito[1].toLowerCase() !== enLetras) {
      errores.push(
        `la prosa de §9.1 dice que el régimen se alcanza en el año «${escrito[1]}» y la tabla lo ` +
          `pone en el ${String(anioDelRegimen)} («${enLetras}»). El ordinal escrito se cruza contra ` +
          'la tabla o es una afirmación que nadie rehizo',
      );
    }
  }

  const totalAnios = Number((total[2] ?? '').trim());
  if (totalAnios !== sumaAnios) {
    errores.push(
      `la fila de total dice ${String(totalAnios)} años y los tramos suman ${String(sumaAnios)}`,
    );
  }
  const totalCent = rango(total[4] ?? '');
  if (totalCent === null || totalCent[0] !== sumaCent) {
    errores.push(
      `la fila de total dice «${total[4] ?? ''}» años-régimen y la columna suma ${fmt(sumaCent)}. ` +
        'El total se cruza contra la suma: escrito al pie y no verificado, es un número que nadie ' +
        'rehizo',
    );
  }

  // La reconciliación: banda anual × coeficiente contra la banda del gate.
  const coef = sumaCent / 100;
  if (sumaCent !== c(COEFICIENTE_DE_LA_RAMPA)) {
    errores.push(
      `la columna «Años-régimen» suma ${fmt(sumaCent)} y el coeficiente declarado de la rampa es ` +
        `${fmt(c(COEFICIENTE_DE_LA_RAMPA))}. De ese coeficiente cuelgan todos los cocientes de la ` +
        'SECCIÓN 9: si la tabla deja de producirlo, la banda anual y todo lo que se divide por ella ' +
        'quedan afirmados y no derivados',
    );
  }
  ([0, 1] as const).forEach((i) => {
    const producto = Math.round(BANDA_ANUAL_REGIMEN[i] * coef);
    const tope = GATE_QUINCE_ANOS[i];
    if (producto > tope) {
      errores.push(
        `la integral en el extremo ${i === 0 ? 'bajo' : 'alto'} da USD ${String(producto)}M y el gate ` +
          `se corrió sobre USD ${String(tope)}M: el PLAN no puede reservarse un peso más de aquello ` +
          'contra lo que se lo midió, así que el redondeo empuja para adentro y nunca para afuera',
      );
    }
    if (tope - producto > tope * 0.02) {
      errores.push(
        `la integral en el extremo ${i === 0 ? 'bajo' : 'alto'} da USD ${String(producto)}M contra USD ` +
          `${String(tope)}M del gate: más de dos puntos por debajo ya no es redondeo, es otra banda. ` +
          'O la rampa está mal, o la banda anual declarada no es la que sale de dividir',
      );
    }
  });

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// Los cocientes que la PROSA de la SECCIÓN 9 deriva: el arreglo de C-2.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **Ningún cociente derivado de la prosa estaba domiciliado, y el reporte de la
 * Task 8 confesó uno por escrito sin cerrarlo** (C-2). La confesión decía que
 * «veinte veces más caro» había estado a punto de entrar y que «ninguna guardia
 * lo habría atrapado». Seguía siendo cierto: la revisión metió ese mismo número
 * y salió **exit 0**, junto con `6.523` en lugar de `6.023`, `1,7%` en lugar de
 * `11,7%`, `3,40` en lugar de `2,40` y `800.000` en lugar de `500.000`.
 *
 * **Domiciliar el literal no alcanza, y por eso esto no es una lista de cifras
 * canónicas.** Una cifra canónica exige que el número esté; no dice que sea el
 * que sale de la cuenta, así que la guardia se vuelve un archivo de números que
 * alguien tecleó dos veces. Acá el número lo **calcula la guardia** a partir de
 * operandos que ya viven domiciliados en el documento, y después exige el
 * resultado en su subsección. Consecuencia buscada: si alguien cambia el
 * esperado sin que la aritmética lo respalde, no puede — no hay esperado que
 * cambiar, hay una cuenta.
 *
 * Los operandos son todos cifras que el documento ya trae y la guardia ya
 * custodia por separado: la banda del gate, el coeficiente de la rampa (que la
 * tabla produce), el monto bajo administración de §8.2, el régimen del
 * ecosistema, el producto de referencia y el presupuesto de PLANPACTO.
 */
const MONTO_BAJO_ADMINISTRACION = 67_500;
const ECOSISTEMA_EN_REGIMEN: [number, number] = [51_260, 65_430];
const PRODUCTO_DE_REFERENCIA = 500_000;
const PLANPACTO_EN_REGIMEN: [number, number] = [500, 700];
/** La Escalera entera de PLANPACTO, en puntos del producto sobre ocho escalones. */
const ESCALERA_ENTERA = 2.4;
const ESCALONES_DE_LA_ESCALERA = 8;

/** `6023` → `6.023`. El corpus escribe el separador de miles con punto. */
const conMiles = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
/** `11.705` → `11,7`. Decimal con coma, como todo el corpus. */
const conComa = (n: number, dec: number): string => n.toFixed(dec).replace('.', ',');
/** El número en letras, que es como el documento escribe los cocientes redondos. */
const enLetras = (n: number): string => EN_LETRAS[n] ?? String(n);

/**
 * Un literal buscado con bordes que **no son de letra sino de letra O dígito**.
 * `dice()` usa `\p{L}` y con eso `1,7%` se encuentra adentro de `11,7%` —el «1»
 * de la izquierda no es letra— que es justamente la mutación que hay que
 * atrapar. Acá el borde izquierdo rechaza también el dígito.
 */
function traeCifra(texto: string, literal: string): boolean {
  const escapado = literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\d])${escapado}(?![\\p{L}\\d])`, 'u').test(texto);
}

type CocienteDerivado = { esperado: string; cuenta: string; en: string; porQue: string };

function cocientesDerivados(): CocienteDerivado[] {
  const [gBajo, gAlto] = GATE_QUINCE_ANOS;
  const [aBajo, aAlto] = BANDA_ANUAL_REGIMEN;
  const [eBajo, eAlto] = ECOSISTEMA_EN_REGIMEN;
  const [pBajo, pAlto] = PLANPACTO_EN_REGIMEN;
  const k = COEFICIENTE_DE_LA_RAMPA;
  return [
    {
      esperado: conMiles(gBajo / k),
      cuenta: `${conMiles(gBajo)} / ${conComa(k, 2)}`,
      en: H3_LA_RAMPA_DEL_GASTO,
      porQue:
        'el cociente sin redondear del extremo bajo. Es el paso que vuelve DERIVADA a la banda ' +
        'anual: sin él escrito, USD 6.000M es una cifra que alguien eligió',
    },
    {
      esperado: conMiles(gAlto / k),
      cuenta: `${conMiles(gAlto)} / ${conComa(k, 2)}`,
      en: H3_LA_RAMPA_DEL_GASTO,
      porQue: 'el cociente sin redondear del extremo alto, por la misma razón que el bajo',
    },
    {
      esperado: `entre ${enLetras(Math.floor(MONTO_BAJO_ADMINISTRACION / aAlto))} y ${enLetras(Math.floor(MONTO_BAJO_ADMINISTRACION / aBajo))} veces`,
      cuenta: `${conMiles(MONTO_BAJO_ADMINISTRACION)} / {${conMiles(aAlto)} ; ${conMiles(aBajo)}}`,
      en: H3_LA_RAMPA_DEL_GASTO,
      porQue:
        'la distancia entre el monto bajo administración de §8.2 y la erogación bruta. **Es el ' +
        'número que la Task 8 confesó haber estado a punto de inventar** —escribió «veinte veces ' +
        'más caro, cuatro más barato», los dos multiplicadores propios— y lo corrigió a mano sin ' +
        'dejar guardia detrás. Los pisos van en letras porque el documento los escribe en letras',
    },
    {
      esperado: `${conComa((aBajo / eBajo) * 100, 1)}%`,
      cuenta: `${conMiles(aBajo)} / ${conMiles(eBajo)}`,
      en: H3_SIN_PISO,
      porQue:
        'la erogación propia contra el régimen pleno del ecosistema, bajo con bajo. El párrafo ' +
        'estipula que cruzarlos mezcla escenarios, así que el emparejamiento también es la cuenta',
    },
    {
      esperado: `${conComa((aAlto / eAlto) * 100, 1)}%`,
      cuenta: `${conMiles(aAlto)} / ${conMiles(eAlto)}`,
      en: H3_SIN_PISO,
      porQue: 'la misma comparación, alto con alto',
    },
    {
      esperado: `de ${enLetras(Math.floor(aBajo / pBajo))} a más de ${enLetras(Math.floor(aAlto / pAlto))} veces`,
      cuenta: `{${conMiles(aBajo)} / ${String(pBajo)} = ${conComa(aBajo / pBajo, 2)} ; ${conMiles(aAlto)} / ${String(pAlto)} = ${conComa(aAlto / pAlto, 2)}}`,
      en: H3_SIN_PISO,
      porQue:
        'la erogación propia contra el presupuesto de régimen de PLANPACTO. El extremo alto da ' +
        '15,57 y la Task 8 lo había escrito «dieciséis», que es la única dirección en la que este ' +
        'documento no redondea: el piso en letras se reproduce con una calculadora y «dieciséis» no',
    },
    {
      esperado: conComa((aBajo / PRODUCTO_DE_REFERENCIA) * 100, 2),
      cuenta: `${conMiles(aBajo)} / ${conMiles(PRODUCTO_DE_REFERENCIA)}`,
      en: H3_EJE_INTERGENERACIONAL,
      porQue:
        'la banda anual sobre el producto de referencia de PLANPACTO:641, extremo bajo. Es la mitad ' +
        'de la comparación que vuelve incómoda la ausencia de piso',
    },
    {
      esperado: conComa((aAlto / PRODUCTO_DE_REFERENCIA) * 100, 2),
      cuenta: `${conMiles(aAlto)} / ${conMiles(PRODUCTO_DE_REFERENCIA)}`,
      en: H3_EJE_INTERGENERACIONAL,
      porQue: 'la misma cuenta en el extremo alto',
    },
    {
      esperado: `de la mitad a ${enLetras(Math.round(((aAlto / PRODUCTO_DE_REFERENCIA) * 100 * 10) / ESCALERA_ENTERA))} décimas`,
      cuenta: `{${conComa((aBajo / PRODUCTO_DE_REFERENCIA) * 100, 2)} ; ${conComa((aAlto / PRODUCTO_DE_REFERENCIA) * 100, 2)}} / ${conComa(ESCALERA_ENTERA, 2)}`,
      en: H3_EJE_INTERGENERACIONAL,
      porQue:
        'la frase que hace legible la comparación con la Escalera entera, y es la conclusión de §9.2: ' +
        'la erogación bruta de un solo PLAN medida contra todo lo que el proyecto blinda. Escrita en ' +
        'palabras, era la más fácil de aflojar sin tocar un número —«de un décimo a un cuarto» salía ' +
        'verde con 1,20, 2,18 y 2,40 los tres intactos—, y sale de dividirlos',
    },
  ];
}

/**
 * Los operandos que el documento tiene que traer ESCRITOS para que los cocientes
 * de arriba se puedan rehacer. Sin esto, la guardia verifica una cuenta que el
 * lector no puede repetir porque le falta un término.
 */
function operandosDeLosCocientes(): { literal: string; en: string; porQue: string }[] {
  return [
  {
    literal: `USD ${conMiles(PRODUCTO_DE_REFERENCIA)} millones`,
    en: H3_EJE_INTERGENERACIONAL,
    porQue:
      'el producto de referencia de PLANPACTO:641, denominador de 1,20–2,18%. Mutado a 800.000 la ' +
      'guardia salía verde y el porcentaje seguía escrito, o sea afirmado y no derivado',
  },
  {
    literal: '2,40',
    en: H3_EJE_INTERGENERACIONAL,
    porQue:
      'la Escalera entera de PLANPACTO, contra la que se lee la banda anual. Es el término de ' +
      'comparación de «de la mitad a nueve décimas»: sin él, la frase no se puede rehacer',
  },
  {
    literal: '2,40',
    en: H3_SIN_PISO,
    porQue: 'el mismo valor abriendo §9.4, que es donde la pregunta de la ausencia de piso se contesta',
  },
  {
    literal: `${enLetras(ESCALONES_DE_LA_ESCALERA)} escalones`,
    en: H3_EJE_INTERGENERACIONAL,
    porQue:
      'sobre cuántos escalones vale 2,40. Sin el denominador escrito, «la Escalera entera» es una ' +
      'cifra sin objeto y «de la mitad a nueve décimas» no se puede rehacer',
  },
  {
    literal: `${enLetras(ESCALONES_DE_LA_ESCALERA)} escalones`,
    en: H3_SIN_PISO,
    porQue:
      'el mismo denominador en §9.4, donde además se declara que ninguno de los ocho es del arco. ' +
      'Mutado a «diez escalones» la guardia salía verde y el PLAN quedaba sin escalón adentro de una ' +
      'Escalera que no existe',
  },
  ];
}

function verificarCocientesDerivados(lineas: string[]): string[] {
  const errores: string[] = [];
  const mirar = (literal: string, en: string, queEs: string, porQue: string): void => {
    const { texto, errores: errDom } = textoDeDomicilio(lineas, en);
    errores.push(...errDom);
    if (texto === null) return;
    if (!traeCifra(soloProsa(texto), literal)) {
      errores.push(`${queEs} «${literal}» no está en «${en.trim()}» — ${porQue}`);
    }
  };
  for (const { esperado, cuenta, en, porQue } of cocientesDerivados()) {
    mirar(esperado, en, `cociente derivado (${cuenta})`, porQue);
  }
  for (const { literal, en, porQue } of operandosDeLosCocientes()) {
    mirar(literal, en, 'operando de un cociente', porQue);
  }
  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// La división de PLANPACTO rehecha: la SECCIÓN 9.2, y el arreglo de I-4.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **La división de §9.2 no la verificaba nadie: solo la presencia de los cuatro
 * números** (I-4). Es el mismo defecto que la rampa sí cerró, y las tres
 * mutaciones salían verdes: `más 0,55` → `más 1,15` con F todavía en 4,05; la
 * rigidez del 65% al 70% con el denominador todavía en 41,8; y el reemplazo del
 * 0,60 por `0,30` con la división intacta. Los cuatro números seguían escritos y
 * ninguno salía de los otros.
 *
 * Acá se rehace la cuenta entera, en las dos versiones que el documento escribe:
 * la de PLANPACTO —`(P + 4,65) / 0,65 = 42,8`— y la corregida —`(P + F) / 0,65 =
 * 41,8`—, con F cruzado contra sus tres sumandos. **La corrección solo se lee
 * como corrección si las dos cierran**: si la vieja no da 42,8, lo que el
 * documento dice haber corregido no es lo que había.
 *
 * El parseo es literal sobre la prosa de §9.2 y **si no puede leer una pieza no
 * corre y lo dice**, con el nombre de la pieza que le faltó. Es la doctrina que
 * este archivo ya fijó para los domicilios ambiguos: un chequeo que se saltea en
 * silencio cuando cambia una palabra es un chequeo que no existe.
 */
function verificarDivisionDePacto(lineas: string[]): string[] {
  const errores: string[] = [];
  const { texto, errores: errDom } = textoDeDomicilio(lineas, H3_EJE_INTERGENERACIONAL);
  errores.push(...errDom);
  if (texto === null) return errores;
  const plano = soloProsa(texto).replace(/\*\*/g, '');

  const num = (s: string): number => Number(s.replace(',', '.'));
  const leer = (patron: RegExp, pieza: string): RegExpExecArray | null => {
    const m = patron.exec(plano);
    if (m === null) {
      errores.push(
        `§9.2: la guardia no encuentra ${pieza} y por lo tanto NO rehace la división de ` +
          'PLANPACTO:369. La cuenta es el compromiso que el permiso del 0,60 traía adentro; si la ' +
          'redacción cambió, se ajusta el patrón acá y no se deja el chequeo apagado en silencio',
      );
    }
    return m;
  };

  const mCero = leer(
    /declara (\d+,\d+) puntos del producto para el eje intergeneracional/u,
    'el supuesto de PLANPACTO que se reemplaza («declara … puntos del producto para el eje intergeneracional»)',
  );
  const mReemplazo = leer(/lo reemplaza por (cero|\d+,\d+)/u, 'el valor del reemplazo («lo reemplaza por …»)');
  const mP = leer(/\bP queda en (\d+,\d+)/u, 'la P del escenario central («P queda en …»)');
  const mF = leer(/\bF pasa de (\d+,\d+) a (\d+,\d+)/u, 'la F vieja y la nueva («F pasa de … a …»)');
  const mSum = leer(
    /(\d+(?:,\d+)?) del piso viejo, más (\d+,\d+) de afectaciones[^,]*, más (cero|\d+,\d+) del eje intergeneracional/u,
    'los tres sumandos de F',
  );
  const mR = leer(/una rigidez del (\d+)%/u, 'la rigidez de la prueba por el absurdo («una rigidez del …%»)');
  const mD = leer(/baja de (\d+,\d+) a (\d+,\d+)/u, 'los dos denominadores («baja de … a …»)');
  if (
    mCero === null || mReemplazo === null ||
    mP === null || mF === null || mSum === null || mR === null || mD === null
  ) {
    return errores;
  }

  const P = num(mP[1]);
  const [fVieja, fNueva] = [num(mF[1]), num(mF[2])];
  const sumandos = [num(mSum[1]), num(mSum[2]), mSum[3] === 'cero' ? 0 : num(mSum[3])];
  const rigidez = Number(mR[1]) / 100;
  const [dViejo, dNuevo] = [num(mD[1]), num(mD[2])];
  const supuestoAjeno = num(mCero[1]);
  const reemplazo = mReemplazo[1] === 'cero' ? 0 : num(mReemplazo[1]);

  /**
   * **El valor del reemplazo se declara en un párrafo y se usa en otro, y hasta
   * acá los dos no se hablaban.** Mutación: «lo reemplaza por 0,30» con 4,05 y
   * 41,8 intactos salía **exit 0** — la subsección anunciaba un reemplazo y hacía
   * otro. Se cruza en las dos direcciones: contra el tercer sumando de F, que es
   * donde el reemplazo aterriza, y contra la resta que lo produce.
   */
  if (c(reemplazo) !== c(sumandos[2])) {
    errores.push(
      `§9.2 anuncia que reemplaza el supuesto por ${fmt(c(reemplazo))} y en la división lo suma como ` +
        `${fmt(c(sumandos[2]))}. El valor anunciado y el usado son el mismo o la subsección declara ` +
        'un reemplazo y hace otro, que es la mitad barata del compromiso que el permiso traía',
    );
  }
  if (c(fVieja) - c(supuestoAjeno) + c(reemplazo) !== c(fNueva)) {
    errores.push(
      `§9.2: F vieja ${fmt(c(fVieja))} menos el supuesto ajeno ${fmt(c(supuestoAjeno))} más el ` +
        `reemplazo ${fmt(c(reemplazo))} da ${fmt(c(fVieja) - c(supuestoAjeno) + c(reemplazo))}, y la ` +
        `prosa declara F en ${fmt(c(fNueva))}. El permiso de PLANPACTO:369 era «rehace la división ` +
        'sin tocar nada más»: si la resta no cierra, se tocó algo más y no está dicho',
    );
  }

  const suma = sumandos.reduce((a, b) => a + b, 0);
  if (c(suma) !== c(fNueva)) {
    errores.push(
      `§9.2: los sumandos de F dan ${fmt(c(suma))} (${sumandos.map((s) => fmt(c(s))).join(' + ')}) y ` +
        `la prosa declara F en ${fmt(c(fNueva))}. F es la letra de las afectaciones específicas: si ` +
        'sus términos no la suman, el reemplazo del eje intergeneracional cambia un número que no ' +
        'es el que el documento dice haber cambiado',
    );
  }

  ([
    ['corregida', fNueva, dNuevo],
    ['original de PLANPACTO', fVieja, dViejo],
  ] as const).forEach(([cual, F, esperado]) => {
    const calculado = Math.round(((P + F) / rigidez) * 10) / 10;
    if (c(calculado) !== c(esperado)) {
      errores.push(
        `§9.2: la división ${cual} da (${fmt(c(P))} + ${fmt(c(F))}) / ${String(rigidez)} = ` +
          `${fmt(c(calculado))} y la prosa escribe ${fmt(c(esperado))}. La corrección solo se lee ` +
          'como corrección si las DOS divisiones cierran: la vieja fija qué había y la nueva qué ' +
          'quedó, y con una sola escrita el documento afirma una diferencia que nadie rehizo',
      );
    }
  });

  /**
   * **Y la dirección declarada tiene que ser la que la cuenta produce.** §9.2
   * escribe que el reemplazo AFLOJA el argumento ajeno; si un día el denominador
   * subiera, esa frase pasaría a ser falsa sin que ninguna cifra se moviera.
   */
  if (dNuevo >= dViejo) {
    errores.push(
      `§9.2: el denominador corregido (${fmt(c(dNuevo))}) no es menor que el original ` +
        `(${fmt(c(dViejo))}), y la subsección declara que el reemplazo AFLOJA un punto al argumento ` +
        'de PLANPACTO. La declaración contra el interés propio es el compromiso de esta subsección: ' +
        'con la desigualdad dada vuelta, es una declaración de conveniencia',
    );
  }

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// Las tres columnas: la SECCIÓN 9.3, y el arreglo de C-6.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_TRES = ['Renglón', 'Erogación bruta', 'Gasto sustituido', 'Incremental neto'];
/**
 * **Una celda con plata escrita, y la primera versión atrapaba una sola forma de
 * escribirla.** `/(?:USD|US\$|AR\$|\$)\s?\d/` exige una SIGLA PEGADA A UN
 * DÍGITO, así que la celda «entre 2.500 y 5.000 millones por año» —el neto de
 * `spec:34`, el número exacto que esta sección entera existe para no escribir—
 * salía **exit 0**. La sigla es la forma que un documento prolijo usa; la que un
 * documento apurado escribe es justamente la otra.
 *
 * Las tres formas que se agregan son las tres que quedan cuando no hay sigla:
 * la escala en palabras (`5.000 millones`, `1.800M`, `mil millones`), el número
 * con separador de miles solo (`2.500`, `53.000`) y el porcentaje (`1,2% del
 * PBI`, que es la otra unidad en la que un neto se lava).
 *
 * **Falsos positivos: cero**, verificado celda por celda sobre las dos columnas
 * que esto vigila. Los únicos dígitos que hoy viven ahí son remisiones de
 * sección —`4.6`, `9.1`, `2.3`—: ninguna trae escala pegada, ninguna tiene tres
 * dígitos después del punto y ninguna lleva `%`. El separador de miles pide
 * `\d{1,3}(\.\d{3})+` a propósito: `4.6` no es un monto y `4.600` sí.
 */
const MAGNITUD_EN_CELDA =
  /(?:USD|US\$|AR\$|\$)\s?\d|\d[\d.,]*\s*(?:M\b|MM\b|mil millones|mill[óo]n(?:es)?)|\d{1,3}(?:\.\d{3})+|\d[\d.,]*\s*%/u;

/**
 * **La tabla que este corpus entero existe para no inventar** (C-6). La spec la
 * pedía con la columna del medio llena a partir de «moratoria, PUAM y PNC por
 * vejez», y de esas tres cosas dos tienen CERO ocurrencias en el corpus —ya
 * están prohibidas como cadena— y la tercera aparece cinco veces, siempre como
 * diagnóstico y nunca con monto. La única pensión no contributiva citada en todo
 * el taller es por invalidez (`PLANCUIDADO:94`), no por vejez.
 *
 * De ahí sale la regla, y es de una línea: **ninguna celda de «Gasto sustituido»
 * ni de «Incremental neto» puede traer plata escrita.** La del medio, porque el
 * número no existe; la tercera, porque es la primera menos la segunda y una
 * resta con un término pendiente no da un número: lo lava. Ese lavado es la
 * forma sofisticada del error, y es la que la prohibición de cadenas no atrapa,
 * porque un incremental neto escrito en dólares no nombra ninguna sigla.
 *
 * La columna de erogación bruta SÍ lleva plata: es la banda derivada en 9.1 y la
 * línea que `PLANCUIDADO:564` ya contabiliza. La asimetría es el dispositivo.
 *
 * Si algún día el padrón existe y la columna se puede llenar con una cifra
 * citada, esto se cambia acá, a mano y con la razón escrita. Que cueste un
 * commit es exactamente lo que se quiere.
 */
function verificarTresColumnas(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_TRES, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla de tres columnas, con [${COLUMNAS_TRES.join(' · ')}]. Es la que el brief ` +
          'exige y la que obliga a declarar que la del medio no se puede llenar con datos del corpus',
      );
    }
    return errores;
  }
  /**
   * **Conjunto EXACTO, no mínimo, y es el arreglo de la mutación M10.** Con
   * `filas.length < 3` como única guarda, borrar la fila del Tramo Común dejaba
   * tres filas y salía **exit 0**: un renglón del PLAN desaparecía del modelo
   * económico sin que nadie levantara la mano. El conjunto de renglones que este
   * PLAN eroga está cerrado —los tres tramos de la Renta de Arco y la Capa de
   * Forma— y se verifica por nombre en las dos direcciones, como la portada.
   */
  const RENGLONES = ['Piso Vital', 'Tramo Ganado', 'Tramo Común', 'Capa de Forma'];
  if (filas.length !== RENGLONES.length) {
    errores.push(
      `la tabla de tres columnas tiene ${String(filas.length)} fila(s) y tiene que tener ` +
        `${String(RENGLONES.length)}: los tres tramos de la Renta de Arco y la Capa de Forma. Ni una ` +
        'menos —un renglón que se cae del modelo económico es un gasto que el PLAN deja de declarar— ' +
        'ni una más sin pasar por acá',
    );
  }
  for (const renglon of RENGLONES) {
    if (!filas.some((f) => (f[0] ?? '').includes(renglon))) {
      errores.push(
        `la tabla de tres columnas no trae el renglón «${renglon}»: el conjunto es cerrado y se ` +
          'verifica por nombre, porque contar filas no distingue una fila borrada de una duplicada',
      );
    }
  }

  filas.forEach((fila, k) => {
    ([2, 3] as const).forEach((i) => {
      const celda = fila[i] ?? '';
      if (MAGNITUD_EN_CELDA.test(celda)) {
        errores.push(
          `fila ${String(k + 1)} de la tabla de tres columnas («${(fila[0] ?? '').slice(0, 40)}»): la ` +
            `columna «${COLUMNAS_TRES[i]}» trae plata escrita («${celda.slice(0, 60)}»). El gasto ` +
            'sustituido no se puede cifrar —el corpus no tiene el padrón de los que llegaron por la ' +
            'vía de excepción— y el incremental neto es la resta que lo contiene: escribirlo en ' +
            'dólares lava un número inventado a través de una sustracción, y ninguna sigla prohibida ' +
            'aparece en el camino',
        );
      }
    });
  });

  /**
   * **La columna de la izquierda tampoco se verificaba, y es la que sí lleva
   * plata** (I-7). Vaciar la celda «Erogación bruta» de cualquier renglón a `—`
   * salía **exit 0**: el modelo económico declaraba un renglón sin decir cuánto
   * sale, que es exactamente el agujero que la tabla existe para tapar. La
   * asimetría de esta tabla es que las dos columnas de la derecha NO pueden
   * traer magnitud y la de la izquierda TIENE que decir algo; lo que no puede
   * es no decir nada.
   */
  filas.forEach((fila, k) => {
    if (celdaHueca(fila[1] ?? '')) {
      errores.push(
        `fila ${String(k + 1)} de la tabla de tres columnas («${(fila[0] ?? '').slice(0, 40)}»): la ` +
          'columna «Erogación bruta» está vacía. Un renglón sin erogación declarada es un gasto que ' +
          'el PLAN no dice, y la celda hueca se lee como olvido: si no eroga, lo que va escrito es ' +
          'que no eroga y por qué',
      );
    }
  });
  /**
   * **Y el único monto de la tabla se cruza contra su fuente** (I-7). Mutando la
   * celda del Tramo Ganado de `USD 1.800–2.400M` a `USD 18.000–24.000M` —un
   * orden de magnitud sobre la única línea con precio— la guardia salía verde:
   * el valor vive en una fila de tabla y `soloProsa()` descuenta las filas de
   * tabla, así que CIFRAS_CANONICAS no lo puede domiciliar y hacía falta acá.
   * Verificado contra `PLANCUIDADO:564`, «Redenciones previsionales
   * (reconocimiento por horas de cuidado) | 1.800-2.400».
   */
  const TRAMO_GANADO = 'USD 1.800–2.400M';
  const ganado = filas.find((f) => (f[0] ?? '').includes('Tramo Ganado'));
  if (ganado && !(ganado[1] ?? '').includes(TRAMO_GANADO)) {
    errores.push(
      `la fila del Tramo Ganado no trae «${TRAMO_GANADO}» en «Erogación bruta» («${(ganado[1] ?? '').slice(0, 60)}»): ` +
        'es el único monto propio de la tabla y sale de PLANCUIDADO:564, que ya lo contabiliza como ' +
        'costo suyo. Sin cruzarlo, un orden de magnitud entra sin que nadie levante la mano',
    );
  }

  /**
   * **Las celdas se verificaban por lo que NO podían traer y no por lo que
   * dicen.** Cuatro mutaciones propias, cuatro verdes: intercambiar «ninguno» y
   * «cero» entre las dos columnas de la derecha del Tramo Común; cambiar el
   * «igual a la bruta» de la Capa de Forma por «menor a la bruta» —que la
   * convierte en un renglón que sustituye algo, contra su propia celda del
   * medio—; sacarle el «pass-through» al Tramo Ganado; y hacer que el Piso Vital
   * erogue la banda entera, contra la reasignación que §4.6 declara.
   *
   * Las cuatro son la misma clase: **la tabla es el argumento y sus celdas son
   * las premisas**, y una premisa dada vuelta deja el argumento en pie con los
   * datos cambiados debajo. La regla mínima es que cada renglón traiga escrito
   * lo que la prosa de la subsección afirma de él, así que va por nombre y con
   * la razón, como el conjunto exacto de renglones.
   */
  const CELDAS_OBLIGATORIAS: { renglon: string; columna: number; trae: string; porQue: string }[] = [
    {
      renglon: 'Piso Vital',
      columna: 1,
      trae: '4.6 reasigna',
      porQue:
        'el renglón más grande no eroga su banda entera: §4.6 reasigna haberes que ANSES ya liquida ' +
        'y solo la diferencia eroga. Es la razón por la que la rampa arranca plana, y sin ella la ' +
        'forma de la tabla de §9.1 se queda sin fundamento',
    },
    {
      renglon: 'Tramo Ganado',
      columna: 3,
      /**
       * `cero — pass-through` entero y no `pass-through` solo: con la subcadena
       * sola, mutar la celda a «positivo — NO es pass-through» salía verde,
       * porque la palabra prohibida seguía adentro de su propia negación. Es la
       * novena forma del arquetipo que este archivo ya lleva anotada —una frase
       * que se cubre a sí misma por accidente ortográfico— y acá reaparece con
       * `includes()` en vez de con bordes de palabra.
       */
      trae: 'cero — pass-through',
      porQue:
        'el Tramo Ganado sustituye exactamente lo mismo que eroga, y por eso su incremental es cero. ' +
        'Sin la palabra, la fila declara un cero que no se puede rehacer',
    },
    {
      renglon: 'Tramo Común',
      columna: 2,
      trae: 'ninguno',
      porQue: 'el Tramo Común no sustituye nada porque todavía no eroga nada (§4.5)',
    },
    {
      renglon: 'Tramo Común',
      columna: 1,
      trae: 'liquida en cero hasta que su fuente exista',
      porQue:
        'el Tramo Común está declarado y NO financiado —§4.5 lo dejó así por escrito— y esa es la ' +
        'razón de que su erogación sea ninguna. Mutado a «ya financiado por su fuente desde el año ' +
        'uno», la fila sigue declarando cero erogación con la razón dada vuelta, y el PLAN promete ' +
        'una plata que no tiene',
    },
    {
      renglon: 'Capa de Forma',
      columna: 3,
      trae: 'igual a la bruta',
      porQue:
        'la Capa de Forma no sustituye nada, así que su incremental ES su erogación. Es la única ' +
        'fila del modelo cuyo neto se conoce, y la que sostiene «este PLAN sabe cuánto sale»',
    },
  ];
  for (const { renglon, columna, trae, porQue } of CELDAS_OBLIGATORIAS) {
    const fila = filas.find((f) => (f[0] ?? '').includes(renglon));
    if (fila === undefined) continue;
    if (!(fila[columna] ?? '').includes(trae)) {
      errores.push(
        `la fila «${renglon}» no dice «${trae}» en «${COLUMNAS_TRES[columna]}» ` +
          `(«${(fila[columna] ?? '').slice(0, 60)}») — ${porQue}`,
      );
    }
  }

  if (!filas.some((f) => /monto pendiente/i.test(f[2] ?? ''))) {
    errores.push(
      'ninguna fila carga la columna «Gasto sustituido» con «monto pendiente»: es la salida que ' +
        'PLANPACTO:498 ya usó con la base ancha del IVA, y sin ella la columna queda vacía sin decir ' +
        'por qué, que se lee como olvido y no como declaración',
    );
  }

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// La tabla de fuentes de la Renta de Arco: la SECCIÓN 4.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_FUENTES = ['Fuente', 'Dueño', 'Disponibilidad', 'Confianza', 'Clase'];

/** Las cuatro calificaciones de `PLANPACTO §5.1` y de la regla 3 del libro mayor. */
const CONFIANZAS = ['alta', 'media', 'baja', 'especulativa'];

/**
 * La clase que ninguna fila puede llevar. `PLANPACTO:444` la prohíbe —«ningún
 * retorno futuro puede computarse como fuente disponible para gasto presente»—
 * y `PLANPACTO:655` la vuelve a prohibir sobre su propio presupuesto. Es la
 * prohibición que le cuesta al Tramo Común su fuente, y por eso se verifica acá
 * y no se deja a la disciplina de quien escriba la próxima fila.
 */
const CLASE_PROHIBIDA = 'future_return';

/** Sin backticks ni negritas: las celdas escriben los identificadores en `código`. */
const pelada = (celda: string): string => celda.replace(/[`*]/g, '').trim();

/**
 * DÉCIMA FORMA DEL ARQUETIPO (encontrada rompiendo, arreglada acá). El chequeo de
 * celda llena era `pelada(c) === ''`, y eso solo atrapa la cadena vacía: poner
 * `—` en la fecha de disponibilidad, o `—` en el dueño, salía **exit 0** en los
 * dos casos. El comentario de esta misma guardia dice que la celda del dueño «es
 * la que hace verificable la fila», y una fuente sin dueño y sin fecha pasaba en
 * verde con un guion puesto.
 *
 * Una celda es hueca si no queda nada, si es solo puntuación de relleno
 * (`-`, `–`, `—`, `·`, `.`) o si es uno de los placeholders que el corpus usa
 * para decir «esto no lo sé todavía». **El alcance es la tabla de fuentes y
 * ninguna otra**: el Calendario declara `—` como valor legítimo —`SIN_OCUPANTE`,
 * la estación que no tiene ocupante previo—, y aplicar esta regla allá pondría
 * roja una celda honesta. En un registro contable no hay estación vacía: hay
 * fuente sin dueño, que es otra cosa.
 */
const HUECOS_DE_CELDA = /^(?:[-–—·.]+|n\/?d|s\/?d|tbd|tba|pendiente|por definir|\?+)$/i;
const celdaHueca = (celda: string): boolean => {
  const p = pelada(celda);
  return p === '' || HUECOS_DE_CELDA.test(p);
};

/**
 * Las seis clases, **leídas del propio libro mayor** y no copiadas acá. Copiarlas
 * sería estrenar una taxonomía paralela, que es exactamente lo que `PLANPACTO:655`
 * declina hacer: «las clases son las de `SOURCE_OF_FUNDS_LEDGER.md` y no una
 * taxonomía propia». Si el libro mayor agrega una clase, esta guardia la acepta
 * sola; si le cambian el formato a la regla 2, el chequeo **no corre y lo dice**.
 */
function clasesDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const m = /Cada fuente tiene clasificaci[óo]n:\s*`([^`]+)`/.exec(readFileSync(f, 'utf8'));
  if (!m) return [];
  return m[1]
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

/**
 * **DUODÉCIMA FORMA DEL ARQUETIPO: la columna del dueño no tenía autoridad
 * detrás.** Encontrada rompiendo, en dos mitades y las dos verdes:
 *
 * | Mutación | Antes |
 * |---|---|
 * | `Ministerio de Economía` → `ANSES (Ministerio de Economía)` | **exit 0** — dos filas comparten organismo, `duenos.size` sigue en 4, y «cuatro dueños» sigue siendo cierto para la guardia y falso para el lector |
 * | `ANCV` → `Agencia Inventada del Arco` | **exit 0** — el dueño podía ser cualquier cadena |
 *
 * Lo filoso es la asimetría: la **clase** se cruza contra
 * `SOURCE_OF_FUNDS_LEDGER.md`, la **confianza** contra las cuatro de
 * `PLANPACTO §5.1`, y el **dueño** —que es lo primero que nombra la regla de
 * `PLANPACTO:442` y lo único que contesta quién responde el día que haya que
 * pagar— contra nada. `new Set()` sobre una columna libre es un chequeo de
 * ortografía con nombre de chequeo de propiedad.
 *
 * **La autoridad existe y son tres registros, en orden de vigencia:**
 *
 * 1. La columna «Dueño» del propio `SOURCE_OF_FUNDS_LEDGER.md`, que está
 *    `current` y es la autoridad primaria: ahí viven `Ministerio de Economía`
 *    y `PEO`, que no son agencias del ecosistema.
 * 2. La columna «Sigla» de `TABLA_AGENCIAS_BASTA.md`, **con su `superseded`
 *    declarado**, exactamente como §0.3 y §4.5 ya lo declaran en la prosa: el
 *    papel dejó de ser vinculante para la arquitectura de agencias y sigue
 *    siendo el único censo de siglas que el corpus escribió.
 * 3. Los dos que ninguno de los dos provee, listados acá con su razón.
 *
 * Y el conteo de dueños distintos se hace sobre el **identificador resuelto**,
 * no sobre la celda: es lo que cierra la primera mutación.
 */
const DUENOS_EXPLICITOS: { id: string; porQue: string }[] = [
  {
    id: 'ANSES',
    porQue:
      'organismo existente de la República, no una agencia del ecosistema: no está en la tabla de ' +
      'agencias porque ninguna la crea, y es el dueño de la única fila con caja presente',
  },
  {
    id: 'ANAV',
    porQue: 'la agencia que este PLAN crea en la SECCIÓN 8, con el patrón AN+sufijo del corpus',
  },
];

/** Una celda de registro que no nombra a nadie: no se registra como dueño. */
const DUENO_NO_ES_DUENO = /^(?:—|-|n\/?a|reflujo\b)/i;

function duenosDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'Dueño');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda === '' || DUENO_NO_ES_DUENO.test(celda)) continue;
    // «Hacienda + BID» son dos dueños de la misma fuente: valen los dos y el entero.
    out.push(celda, ...celda.split('+').map((s) => s.trim()));
  }
  return out.filter((s) => s !== '');
}

/** Las siglas del censo de agencias. `superseded`, y por eso se declara en la prosa. */
function siglasDeAgencias(): string[] {
  const rel = DOCUMENTOS_CITABLES['TABLA_AGENCIAS_BASTA.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'Sigla');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda === '' || DUENO_NO_ES_DUENO.test(celda)) continue;
    // «AMCO, AMRO, … (placeholders)» — se descartan: no son dueños de nada todavía.
    if (celda.includes('placeholder')) continue;
    out.push(celda);
  }
  return out;
}

/**
 * **M-4.** El barrido de dueños contra la prosa se acota a las SIGLAS —el censo
 * de agencias más los dos explícitos— y deja afuera la columna «Dueño» del libro
 * mayor, que trae nombres corrientes: `Hacienda`, `MinSalud`, `MinHabitat`,
 * `PLANTER L2`. Barridos contra la prosa de §4.6, cualquiera de esos mencionado
 * al pasar por una sección futura pone la guardia roja sin motivo — un falso
 * positivo latente, y esta guardia ya documentó que un chequeo que se pone rojo
 * sobre prosa honesta se termina borrando entero.
 *
 * Acotar no pierde el chequeo: la mutación que lo estrenó —`ANSES` → `ANTSPO`
 * en la fila 1— sigue roja, porque `ANSES` es uno de los dos explícitos y
 * `ANTSPO` es sigla del censo.
 */
function registroAcotadoALasSiglas(): string[] {
  const todos = [...siglasDeAgencias(), ...DUENOS_EXPLICITOS.map((d) => d.id)];
  return [...new Set(todos)].sort((a, b) => b.length - a.length);
}

function registroDeDuenos(): string[] {
  const todos = [
    ...duenosDelLibroMayor(),
    ...siglasDeAgencias(),
    ...DUENOS_EXPLICITOS.map((d) => d.id),
  ];
  // Del más largo al más corto: una celda que nombre «ANEB execution cell» tiene
  // que resolver por el identificador largo y no quedar partida en dos.
  return [...new Set(todos)].sort((a, b) => b.length - a.length);
}

/**
 * Resuelve la celda del dueño contra el registro. Devuelve el identificador
 * canónico, o el error de por qué la celda no nombra exactamente a uno.
 *
 * Los bordes son de LETRA y no `\b`, por la misma razón que en `dice()`: `\b`
 * no entiende la `ñ` ni la `í`. Y una coincidencia contenida dentro de otra más
 * larga no cuenta como segundo dueño — `ANEB` adentro de `ANEB execution cell`
 * es el mismo organismo nombrado con más o menos precisión, no dos.
 */
function resolverDueno(celda: string, registro: string[]): { id: string } | { error: string } {
  const p = pelada(celda);
  const hallados: string[] = [];
  for (const id of registro) {
    const re = new RegExp(`(?<!\\p{L})${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'u');
    if (!re.test(p)) continue;
    if (hallados.some((y) => y.includes(id))) continue;
    hallados.push(id);
  }
  if (hallados.length === 0) {
    return {
      error:
        `nombra como dueño a «${p}», que no resuelve contra ningún registro: ni la columna «Dueño» ` +
        'de `SOURCE_OF_FUNDS_LEDGER.md`, ni las siglas de `TABLA_AGENCIAS_BASTA.md`, ni la lista ' +
        'explícita de la guardia. Un dueño que no existe es una fuente por la que no responde nadie',
    };
  }
  if (hallados.length > 1) {
    return {
      error:
        `nombra a más de un dueño en la misma celda («${hallados.join('», «')}»), y la primera regla ` +
        'de `PLANPACTO §5.1` es «una fuente, un dueño». Dos organismos en una celda hacen que el ' +
        'conteo de dueños distintos siga cerrando mientras nadie sabe a cuál de los dos llamar',
    };
  }
  return { id: hallados[0] };
}

/**
 * **DECIMOQUINTA FORMA DEL ARQUETIPO, del lado de la tabla: la columna del
 * dueño resolvía contra el REGISTRO GLOBAL y no contra la autoridad que la
 * propia fila cita.**
 *
 * (M-5: este bloque venía rotulado `DECIMOCUARTA` igual que el de las anclas,
 * tres pantallas más abajo. En un archivo cuyo valor documental es llevar la
 * cuenta de las formas del arquetipo, dos bloques con el mismo número son una
 * forma que nadie puede citar. La serie va: 14 = el ancla completa que secuestra
 * al antecedente, 15 = esta, 16 = el cruce condicionado a su propio ancla.)
 *
 * El arreglo anterior le puso autoridad a la columna: hoy una celda tiene que
 * nombrar exactamente un dueño del registro. Lo que no cerró es que el registro
 * es un CONJUNTO —todas las siglas del corpus— y la fila 4 no cita el conjunto:
 * cita `SOURCE_OF_FUNDS_LEDGER.md:37`, que es F10, y esa línea trae dueño,
 * clase, confianza y disponibilidad. Reproducido, las dos **exit 0**:
 * `PEO` → `ANMov` (sigla real, dueño de otra fuente) y `baja` → `media`
 * (mientras `:488` sigue diciendo «la lleva F10 con esa confianza»).
 *
 * **La autoridad está en la celda de al lado.** Cuando la celda «Fuente» ancla
 * una línea del libro mayor, las cuatro columnas se cruzan contra ESA línea.
 *
 * La disponibilidad se cruza por equivalencia declarada y no por igualdad: el
 * libro mayor escribe `rolling` y la tabla de este PLAN escribe la condición en
 * castellano —«continua, adhesión por adhesión»—, que es lo que §4.6 declara
 * cuando dice que tres de las cuatro dan condición y no fecha. Una igualdad
 * literal ahí pondría en rojo prosa honesta; la equivalencia va escrita para que
 * agregar una no sea gratis.
 */
const ANCLA_LIBRO_MAYOR = /SOURCE_OF_FUNDS_LEDGER\.md:(\d+)/;

/** `rolling` del libro mayor ↔ la condición en castellano de la tabla. */
const EQUIVALENCIAS_DE_DISPONIBILIDAD: Record<string, RegExp> = {
  rolling: /continua|rolling/i,
};

/** Las celdas de una línea del libro mayor, por nombre de columna. */
function filaDelLibroMayor(n: number): Record<string, string> | null {
  const ls = lineasDelPlan('SOURCE_OF_FUNDS_LEDGER.md');
  if (ls === null) return null;
  const linea = ls[n - 1];
  if (linea === undefined || !esFilaDeTabla(linea) || esSeparadorDeTabla(linea)) return null;
  // La cabecera de esa tabla es la última fila de encabezado antes de `n`.
  let cabecera: string[] | null = null;
  for (let i = n - 2; i >= 0; i -= 1) {
    const l = ls[i] ?? '';
    if (!esFilaDeTabla(l)) break;
    if (esSeparadorDeTabla(l)) {
      cabecera = celdas(ls[i - 1] ?? '').map((c) => pelada(c));
      break;
    }
  }
  if (cabecera === null) return null;
  const cs = celdas(linea).map((c) => pelada(c));
  const out: Record<string, string> = {};
  cabecera.forEach((col, i) => {
    out[col] = cs[i] ?? '';
  });
  return out;
}

/**
 * Cruza una fila de la tabla de fuentes contra la línea del libro mayor que
 * ella misma cita. Devuelve los errores y el `ID` de la línea anclada, o `null`
 * si la fila no ancla ninguna.
 */
function cruzarContraLibroMayor(
  fila: string[],
  donde: string,
  registro: string[],
): { errores: string[]; id: string | null } {
  const m = ANCLA_LIBRO_MAYOR.exec(fila[0] ?? '');
  if (!m) return { errores: [], id: null };
  const n = Number(m[1]);
  const ref = filaDelLibroMayor(n);
  if (ref === null) {
    return {
      errores: [
        `${donde} ancla \`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\` y esa línea no es una fila de la ` +
          'tabla del libro mayor: la fila dice apoyarse en una autoridad que no se puede leer',
      ],
      id: null,
    };
  }

  const errores: string[] = [];
  const id = ref['ID'] ?? `línea ${String(n)}`;

  const duenoRef = registro.length > 0 ? resolverDueno(ref['Dueño'] ?? '', registro) : null;
  const duenoFila = registro.length > 0 ? resolverDueno(fila[1] ?? '', registro) : null;
  if (duenoRef !== null && duenoFila !== null && 'id' in duenoRef && 'id' in duenoFila) {
    if (duenoRef.id !== duenoFila.id) {
      errores.push(
        `${donde} nombra dueño «${duenoFila.id}» y la línea que ella misma cita —${id} de ` +
          `\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`— dice «${duenoRef.id}». La autoridad de una fila ` +
          'anclada es su línea, no el conjunto de siglas del corpus: contra el conjunto, cualquier ' +
          'sigla real pasa',
      );
    }
  }

  const paresExactos: [string, string, number][] = [
    ['Confianza', 'confianza', 3],
    ['Clase', 'clase', 4],
  ];
  for (const [col, nombre, i] of paresExactos) {
    const esperado = (ref[col] ?? '').toLowerCase();
    const escrito = pelada(fila[i] ?? '').toLowerCase();
    if (esperado !== '' && esperado !== escrito) {
      errores.push(
        `${donde} declara ${nombre} «${escrito}» y ${id} la tiene en «${esperado}» ` +
          `(\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`)`,
      );
    }
  }

  const dispRef = (ref['Disponibilidad'] ?? '').toLowerCase();
  const dispFila = pelada(fila[2] ?? '').toLowerCase();
  const equiv = EQUIVALENCIAS_DE_DISPONIBILIDAD[dispRef];
  const cierra = equiv ? equiv.test(dispFila) : dispRef === dispFila;
  if (dispRef !== '' && !cierra) {
    errores.push(
      `${donde} declara disponibilidad «${dispFila}» y ${id} la tiene en «${dispRef}» ` +
        `(\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`). Si son la misma cosa dicha de dos maneras, la ` +
        'equivalencia se declara en EQUIVALENCIAS_DE_DISPONIBILIDAD y no se supone',
    );
  }

  return { errores, id: (ref['ID'] ?? '') === '' ? null : ref['ID'] };
}

/**
 * **DECIMOSEXTA FORMA DEL ARQUETIPO: el cruce contra el libro mayor estaba
 * condicionado al token cuya desaparición tenía que reportar.**
 *
 * `cruzarContraLibroMayor()` arranca con `if (!m) return []` sobre el ancla que
 * la propia fila trae, y una fila sin ancla es indistinguible de una verificada
 * y correcta. Reproducido sobre el árbol de `8559818`: **borrar el ancla de la
 * fila 4 y mutar sus cuatro columnas a la vez** —`PEO` → `ANMov`,
 * disponibilidad → `2031 en adelante`, `baja` → `media`, `reassignment` →
 * `public_net_cost`— sale **exit 0**, mientras `:488` sigue diciendo «La cuarta
 * sí es trazable: la lleva F10 con esa confianza y esa disponibilidad» y `:492`
 * sigue diciendo «el dueño es la oficina de ejecución del proyecto».
 *
 * Detalle que confirma el diagnóstico: la variante con dueño `ANCV` salía roja
 * **de rebote** —colisiona con el dueño de la fila 3 y rompe el conteo de
 * dueños— y con cualquier otra sigla real seguía verde. De rebote no es un
 * chequeo, y está escrito así tres pantallas más abajo, en `CORTA_ORACION`.
 *
 * **El arreglo es simétrico con `verificarDuenosContraLaProsa()`, que ya cerró
 * la mitad de arriba:** todo identificador del libro mayor que la prosa de §4.6
 * nombre —hoy `F10`— tiene que ser el `ID` de una línea que alguna fila de la
 * tabla ancle. La prosa se apoya en la trazabilidad de esa línea; si ninguna
 * fila la cita, la prosa afirma una autoridad que la tabla ya no invoca.
 *
 * El domicilio es §4.6 y no la SECCIÓN 4 entera, por la misma razón que el
 * chequeo de dueños: §4.5 nombra a `F08` —las regalías extractivas— y eso es
 * verdad y no es una fila de esta tabla.
 */
function idsDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'ID');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda !== '') out.push(celda);
  }
  return [...new Set(out)];
}

function verificarIdsDelLibroMayorEnLaProsa(
  lineas: string[],
  idsAnclados: Set<string>,
): string[] {
  const { texto, errores } = textoDeDomicilio(lineas, H3_TABLA_DE_FUENTES);
  if (texto === null) return errores;
  const ids = idsDelLibroMayor();
  if (ids.length === 0) {
    errores.push(
      'no se pudo leer la columna «ID» de `SOURCE_OF_FUNDS_LEDGER.md`: el cruce entre los ' +
        'identificadores que la prosa de §4.6 nombra y las líneas que la tabla ancla **NO corre**, y ' +
        'una prosa que se apoya en una línea que nadie cita es exactamente lo que ese cruce existe ' +
        'para atrapar',
    );
    return errores;
  }
  // Las filas se descuentan: si no, el ancla de la propia fila cubriría a la prosa.
  const prosa = texto
    .split('\n')
    .filter((l) => !esFilaDeTabla(l))
    .join('\n');
  for (const id of ids) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u');
    if (!re.test(prosa)) continue;
    if (idsAnclados.has(id)) continue;
    errores.push(
      `la prosa de §4.6 se apoya en «${id}» del libro mayor —«la lleva ${id} con esa confianza»— y ` +
        'ninguna fila de la tabla ancla esa línea ' +
        `(las ancladas son ${idsAnclados.size === 0 ? '**ninguna**' : `«${[...idsAnclados].join('», «')}»`}). ` +
        'Sin el ancla, las cuatro columnas de la fila dejan de cruzarse contra su línea y se pueden ' +
        'mutar de a cuatro sin que nada se ponga rojo: el chequeo quedaría condicionado al token ' +
        'cuya desaparición tiene que reportar',
    );
  }
  return errores;
}

/**
 * **La otra mitad del mismo defecto: la fila SIN ancla al libro mayor.** La
 * primera fila —la única con caja presente— no cita ninguna línea porque su
 * fuente no está en el libro mayor, así que el cruce de arriba no la alcanza.
 * Reproducido: `ANSES` → `ANTSPO` salía **exit 0**, con una sigla real, el
 * dueño del fondo soberano de otro PLAN, y `:490` a tres líneas diciendo «los
 * haberes que ANSES ya liquida».
 *
 * La autoridad de esas filas es la prosa que las glosa. La regla es simétrica y
 * barata: **toda SIGLA del registro que §4.6 nombre en su prosa tiene que ser
 * dueño de alguna fila de la tabla.** No exige que la prosa nombre a los cuatro
 * —dos se glosan por su función y no por su sigla— sino que no pueda nombrar
 * uno que la tabla ya no tiene. Que sea sobre siglas y no sobre el registro
 * entero lo explica `registroAcotadoALasSiglas()`: barrer `Hacienda` o
 * `MinSalud` contra la prosa es un falso positivo esperando una sección futura.
 *
 * El domicilio es §4.6 y no la SECCIÓN 4 entera a propósito: §4.5 nombra a la
 * ANTSPO como administradora del Fondo Soberano Ciudadano, que es verdad y no
 * es un dueño de esta tabla. Y las filas de la tabla se descuentan del texto,
 * porque si no la mutación se cubriría a sí misma.
 */
function verificarDuenosContraLaProsa(
  lineas: string[],
  duenosDeLaTabla: Set<string>,
  registro: string[],
): string[] {
  const { texto, errores } = textoDeDomicilio(lineas, H3_TABLA_DE_FUENTES);
  if (texto === null) return errores;
  const prosa = texto
    .split('\n')
    .filter((l) => !esFilaDeTabla(l))
    .join('\n');
  for (const id of registro) {
    if (duenosDeLaTabla.has(id)) continue;
    const re = new RegExp(`(?<!\\p{L})${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'u');
    if (!re.test(prosa)) continue;
    errores.push(
      `la prosa de §4.6 nombra a «${id}» como dueño y la tabla de fuentes no lo tiene en ninguna ` +
        `fila (los que tiene son «${[...duenosDeLaTabla].join('», «')}»). La prosa y la tabla no ` +
        'pueden nombrar dueños distintos para la misma plata: una de las dos está mutada',
    );
  }
  return errores;
}

/**
 * Los conteos que la prosa de la SECCIÓN 4 tiene que decir, **derivados de la
 * tabla y no escritos a mano.** Misma doctrina que
 * `frasesDerivadasDelCalendario()`: se exige el par número-sustantivo y no la
 * oración entera, para que la prosa se pueda reescribir sin que la guardia se
 * ponga roja sobre prosa honesta.
 *
 * El cuarto es el que más trabajo hace. Que ninguna fuente llegue a confianza
 * `alta` no es un descuido: la regla 5 del libro mayor dice que una reasignación
 * no sube de media a alta sin ley sancionada o decreto firmado, y la ley de este
 * PLAN no existe. Si mañana alguien escribe una fila `alta` sin la ley, la
 * guardia obliga a que la prosa lo diga en vez de dejarlo pasar en una celda.
 */
function frasesDerivadasDeFuentes(
  total: number,
  duenos: number,
  clases: number,
  altas: number,
): { frase: string; porQue: string }[] {
  const letra = (n: number): string => EN_LETRAS[n] ?? String(n);
  return [
    {
      frase: `${letra(total)} fuentes`,
      porQue: 'la cantidad de fuentes sale de contar la tabla, no de la memoria de quien la escribió',
    },
    {
      frase: `${letra(duenos)} dueños`,
      porQue:
        'los dueños DISTINTOS salen de `new Set()` sobre la segunda columna. La regla de ' +
        '`PLANPACTO §5.1` es «una fuente, un dueño»: si dos filas comparten dueño, el número lo dice',
    },
    {
      frase: `${letra(clases)} clases`,
      porQue:
        'las clases DISTINTAS usadas, contra las seis de `SOURCE_OF_FUNDS_LEDGER.md`. Es el número ' +
        'que delata si la tabla se apoya toda en un solo tipo de fuente',
    },
    {
      frase: altas === 0 ? 'ninguna de confianza alta' : `${letra(altas)} de confianza alta`,
      porQue:
        'la regla 5 del libro mayor: una reasignación no sube a `alta` sin ley sancionada o decreto ' +
        'firmado. Escribir una fila `alta` sin la ley y no decirlo es la manera prolija de estrenar ' +
        'una fuente que no existe',
    },
  ];
}

/**
 * La tabla de la plata. Lo que se verifica, y por qué cada cosa:
 *
 * - **Una sola tabla y CONTIGUA.** Lo cierra `filasDeTabla()` con la bandera.
 * - **Cinco celdas llenas por fila.** La celda que se puede dejar en blanco sin
 *   que el renglón se note es la del dueño, y es la que hace verificable la fila.
 * - **La confianza es una de las cuatro** de `PLANPACTO §5.1`, y **la clase es
 *   una de las seis** del libro mayor, leídas del libro mayor.
 * - **Ninguna fila es `future_return`.**
 * - **Los conteos de la prosa salen de la tabla.**
 *
 * Las anclas de las celdas —`PLANCUIDADO:340` y las demás— no se resuelven acá:
 * las resuelve `verificarAnclasDeProsa()`, que barre TODAS las líneas del
 * archivo, filas de tabla incluidas. Verificado rompiendo una: sale roja.
 */
function verificarTablaDeFuentes(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_FUENTES, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla de fuentes de la Renta de Arco, con las columnas [${COLUMNAS_FUENTES.join(' · ')}]: ` +
          'sin ella la SECCIÓN 4 promete plata y no dice de dónde sale, que es la práctica que ' +
          'PLANPACTO §5.1 existe para terminar',
      );
    }
    return errores;
  }

  const clasesValidas = clasesDelLibroMayor();
  if (clasesValidas.length === 0) {
    errores.push(
      'no se pudieron leer las seis clases de la regla 2 de `SOURCE_OF_FUNDS_LEDGER.md`: el chequeo ' +
        'de clases NO corre, y una tabla de fuentes sin clase verificada es una taxonomía propia',
    );
  }

  const registro = registroDeDuenos();
  if (registro.length === 0) {
    errores.push(
      'no se pudo armar el registro de dueños (`SOURCE_OF_FUNDS_LEDGER.md` + ' +
        '`TABLA_AGENCIAS_BASTA.md`): el chequeo de la columna «Dueño» NO corre, y una columna de ' +
        'dueños sin autoridad detrás es un `new Set()` sobre texto libre',
    );
  }

  const duenos = new Set<string>();
  const clases = new Set<string>();
  /** Los `ID` del libro mayor que ALGUNA fila de la tabla ancla. Ver R-4. */
  const idsAnclados = new Set<string>();
  let altas = 0;
  filas.forEach((fila, k) => {
    const donde = `la fuente ${String(k + 1)} de la Renta de Arco («${pelada(fila[0] ?? '').slice(0, 44)}»)`;
    if (fila.length !== COLUMNAS_FUENTES.length) {
      errores.push(
        `${donde} tiene ${String(fila.length)} celda(s) y la tabla tiene ` +
          `${String(COLUMNAS_FUENTES.length)} columnas`,
      );
      return;
    }
    if (fila.some(celdaHueca)) {
      errores.push(
        `${donde} tiene una celda hueca —vacía, un guion o un placeholder—: «${fila.join(' | ')}». ` +
          'La regla de PLANPACTO §5.1 es «una fuente, un dueño, una fecha de disponibilidad, una ' +
          'calificación de confianza», y las cuatro van escritas o la fila no es una fuente. Un guion ' +
          'en la celda del dueño es una fuente por la que no responde nadie, escrita de manera que no ' +
          'se note',
      );
      return;
    }

    if (registro.length > 0) {
      const dueno = resolverDueno(fila[1], registro);
      if ('error' in dueno) errores.push(`${donde} ${dueno.error}`);
      else duenos.add(dueno.id);
    } else {
      duenos.add(pelada(fila[1]));
    }

    // La autoridad de la fila anclada es su línea del libro mayor, no el conjunto.
    const cruce = cruzarContraLibroMayor(fila, donde, registro);
    errores.push(...cruce.errores);
    if (cruce.id !== null) idsAnclados.add(cruce.id);

    const confianza = pelada(fila[3]).toLowerCase();
    if (!CONFIANZAS.includes(confianza)) {
      errores.push(
        `${donde} declara confianza «${pelada(fila[3])}», que no es una de las cuatro de ` +
          `PLANPACTO §5.1 [${CONFIANZAS.join(' · ')}]`,
      );
    } else if (confianza === 'alta') {
      altas += 1;
    }

    const clase = pelada(fila[4]);
    clases.add(clase);
    if (clase === CLASE_PROHIBIDA) {
      errores.push(
        `${donde} está clasificada \`${CLASE_PROHIBIDA}\`, y ninguna fila puede estarlo: ` +
          'PLANPACTO lo prohíbe dos veces (`:444` y `:655`) y la regla 4 del libro mayor lo repite. ' +
          'Un retorno futuro no financia gasto presente, por bien fundado que esté el retorno',
      );
    } else if (clasesValidas.length > 0 && !clasesValidas.includes(clase)) {
      errores.push(
        `${donde} declara la clase «${clase}», que no está en la regla 2 de ` +
          `\`SOURCE_OF_FUNDS_LEDGER.md\` [${clasesValidas.join(' · ')}]: las clases son las del libro ` +
          'mayor y no una taxonomía propia (PLANPACTO:655)',
      );
    }
  });

  if (registro.length > 0) {
    errores.push(...verificarDuenosContraLaProsa(lineas, duenos, registroAcotadoALasSiglas()));
  }
  errores.push(...verificarIdsDelLibroMayorEnLaProsa(lineas, idsAnclados));

  const { tramo, errores: errTramo } = tramoDeSeccion(lineas, H2_RENTA);
  errores.push(...errTramo);
  if (tramo !== null) {
    const texto = tramo.join('\n');
    for (const { frase, porQue } of frasesDerivadasDeFuentes(
      filas.length,
      duenos.size,
      clases.size,
      altas,
    )) {
      if (!dice(texto, frase)) {
        errores.push(`la SECCIÓN 4 no dice «${frase}»: ${porQue}`);
      }
    }
  }

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

/**
 * Los documentos que la prosa cita por un nombre que no es `PLANXXX`. Sin este
 * mapa, `BLINDAJE:194` y `spec:190` no se pueden abrir, y son exactamente las
 * citas que este tramo viene errando: **dos números de línea de BLINDAJE
 * estaban mal en el propio plan.**
 *
 * Un nombre que no esté acá ni sea un PLAN del taller se reporta: registrar un
 * documento citable nuevo es una línea, y es más barato que una remisión que
 * nadie puede abrir.
 */
const DOCUMENTOS_CITABLES: Record<string, string> = {
  BLINDAJE: 'Iniciativas Estratégicas/BLINDAJE_INSTITUCIONAL_BASTA.md',
  'TABLA_AGENCIAS_BASTA.md': 'Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md',
  ACTA: 'Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md',
  spec: 'v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md',
  // Task 5: el libro mayor de fuentes y sus dos vecinos, que la SECCIÓN 4 cita.
  'SOURCE_OF_FUNDS_LEDGER.md': 'Iniciativas Estratégicas/SOURCE_OF_FUNDS_LEDGER.md',
  'PRESUPUESTO_CONSOLIDADO_BASTA.md': 'Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md',
  'CASCADA_LEGAL_BASTA.md': 'Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md',
  // Task 9: el archivo de gates, que la cabecera del PLAN promete por su nombre.
  'READINESS_GATES_ADVERSARIAL.md': 'Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md',
};

/** Las líneas de un documento citable, cacheadas: la resolución de anclas relee. */
const CACHE_TALLER = new Map<string, string[]>();
function lineasDelPlan(doc: string): string[] | null {
  const hit = CACHE_TALLER.get(doc);
  if (hit) return hit;
  const rel =
    DOCUMENTOS_CITABLES[doc] ?? `Iniciativas Estratégicas/${doc}_Argentina_ES.md`;
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return null;
  const ls = readFileSync(f, 'utf8').split('\n');
  CACHE_TALLER.set(doc, ls);
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
/**
 * El núcleo compartido por la cuarta columna del Calendario y por las anclas de
 * la prosa: abre el documento y comprueba que el ancla exista.
 *
 * `faltaDocumento` decide qué pasa cuando el documento no está. En la tabla se
 * devuelve `null` porque el cruce contra `planesDelTaller()` ya lo reporta con
 * mejor mensaje; en la prosa NO hay tal cruce, así que un `PLANJUB:100` en un
 * paréntesis pasaría en silencio, que es la falla que este tramo persigue.
 */
function resolverContra(
  bruto: string,
  doc: string,
  seccion: string | null,
  desde: number,
  hasta: number,
  faltaDocumento: 'reportar' | 'callar',
): string | null {
  const ls = lineasDelPlan(doc);
  if (ls === null) {
    return faltaDocumento === 'callar'
      ? null
      : `«${bruto}» cita a «${doc}», que no es un PLAN del taller ni un documento citable registrado: ` +
          'o el nombre está mal, o hay que registrarlo en DOCUMENTOS_CITABLES';
  }

  if (seccion !== null) {
    const re = new RegExp(`^#{1,6}\\s+${seccion.replace(/\./g, '\\.')}(?![\\d.])`);
    if (!ls.some((l) => re.test(l))) {
      return `«${bruto}» apunta a una sección que ${doc} no tiene: no hay encabezado «${seccion}»`;
    }
    return null;
  }

  if (desde < 1 || hasta > ls.length || hasta < desde) {
    return `«${bruto}» apunta fuera de ${doc}, que tiene ${String(ls.length)} líneas`;
  }
  if ((ls[desde - 1] ?? '').trim() === '') {
    return `«${bruto}» apunta a una línea vacía de ${doc}: una remisión a nada`;
  }
  return null;
}

function resolverAncla(fragmento: string): string | null {
  const bruto = fragmento.replace(/`/g, '').trim();
  if (bruto === '') return null;

  const s = ANCLA_SECCION.exec(bruto);
  if (s) return resolverContra(bruto, s[1], s[2], 0, 0, 'callar');

  const l = ANCLA_LINEA.exec(bruto);
  if (l) {
    const desde = Number(l[2]);
    return resolverContra(bruto, l[1], null, desde, l[3] === undefined ? desde : Number(l[3]), 'callar');
  }

  return (
    `«${bruto}» no trae PLAN con ancla resoluble: la cuarta columna se escribe ` +
    '`PLANXXX §N.N` o `PLANXXX:NNN` (o `PLANXXX:NNN-NNN`), y sin ancla el ocupante no se puede abrir'
  );
}

/**
 * Las anclas de la PROSA, resueltas con la misma máquina que las de la tabla.
 *
 * Hasta acá `resolverAncla()` se aplicaba a las dieciséis celdas de la cuarta
 * columna del Calendario y a nada más, mientras el cuerpo del documento llevaba
 * unas veinticinco citas ancladas —`PLANPACTO:428`, `BLINDAJE:194`,
 * `PLANMON:1547`, `TABLA_AGENCIAS_BASTA.md:54`— que no se abrían nunca.
 * Reproducido antes de escribir esto: `BLINDAJE:194` → `BLINDAJE:19400` salía
 * **exit 0**, y `PLANPACTO §4.7` → `§4.77` también.
 *
 * No es hipotético: **dos números de línea de BLINDAJE estaban mal en el propio
 * plan del tramo** (`:53` dado como «protección media», que está en `:194`; y
 * `:88-96` dado como masa de beneficiarios, que está en `:186-188`). La cita
 * anclada es la unidad de evidencia de este documento; una que no resuelve es
 * una remisión falsa con aspecto de rigor.
 *
 * **Las tres formas, y por qué la tercera.** El corpus escribe
 * `PLANXXX:NNN` / `PLANXXX §N.N` cuando nombra el documento, y `:NNN` a secas
 * cuando sigue hablando del mismo — «`PLANCUIDADO:94` … con mecanismo propio
 * (`:340`)». La forma corta se resuelve contra el ÚLTIMO documento citado, que
 * es como la lee un lector. Es aproximada por construcción: si el antecedente
 * real quedó dos citas atrás, la corta se resuelve contra el documento
 * equivocado y —salvo que el número caiga fuera de rango— pasa. Atrapa el error
 * grosero, no demuestra la corrección de la cita.
 *
 * **Falsos positivos: cero, y se verificó antes de dar el chequeo por bueno.**
 * Una guardia roja sobre prosa honesta empuja al que sigue a reescribir la
 * frase en vez de arreglar la regex, y en este tramo ya pasó dos veces.
 */
const ANCLA_PROSA_SECCION = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?)\s+§(\d+(?:\.\d+)*)$/;
const ANCLA_PROSA_LINEA = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?):(\d+)(?:-(\d+))?$/;
const ANCLA_PROSA_CORTA = /^:(\d+)(?:-(\d+))?$/;
const NOMBRE_DE_DOCUMENTO = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?)$/;

/**
 * **La octava forma del arquetipo, y la que le faltaba justo a este chequeo: la
 * guardia contaba lo que ENTENDIÓ, no lo que VIO.**
 *
 * Las cuatro formas de arriba reconocen las anclas que el corpus escribe hoy, y
 * todo lo demás se descartaba **en silencio**: un token en backticks que no
 * matcheara era indistinguible de prosa entre comillas invertidas. O sea que la
 * manera más barata de sacarle una cita a la verificación no era romperla — era
 * escribirla en un formato que la guardia no conociera.
 *
 * No es hipotético, y el propio documento trae el caso: `ANCLA_PROSA_LINEA`
 * exige `[A-Za-z][A-Za-z0-9_]*` **sin guiones**, y
 * `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md` ya está en la cabecera como nombre
 * suelto. Reproducido antes de escribir esto, los tres salían **exit 0** y el
 * titular seguía imprimiendo el mismo número de anclas:
 *
 * | Token plantado | Antes |
 * |---|---|
 * | `` `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:99999` `` | exit 0 |
 * | `` `PLANPACTO §4.6-4.7` `` | exit 0 |
 * | `` `PLANMON §6.2:99999` `` | exit 0 |
 *
 * El arreglo no es reconocer más formatos —eso sería perseguir la sintaxis— sino
 * **declarar lo que no se pudo leer**: todo token en backticks con forma de
 * ancla (un `§`, o un `:` seguido de dígito) que ninguna de las cuatro formas
 * capture se reporta. Registrar un formato nuevo es una línea de esta guardia;
 * una cita que nadie puede abrir es lo que este tramo existe para impedir.
 *
 * **Falsos positivos: cero sobre el documento entero**, verificado token por
 * token antes de dar el chequeo por bueno. Los backticks que NO son anclas
 * —`superseded`, `[est.]`, `future_return`, `PLAN_REGISTRY.yml`,
 * `LEGAL_OPINIONS/PLANARCO.md`— no llevan `§` ni `:` seguido de dígito y no
 * entran nunca a este brazo.
 */
const CON_FORMA_DE_ANCLA = /§|:\d/u;

/**
 * **DECIMOTERCERA FORMA, y la única de las trece que produce un FALSO POSITIVO
 * de verificación: un chequeo que AFIRMA una cita equivocada.**
 *
 * `antecedente` era una sola variable global al archivo y **cualquier** nombre
 * de PLAN entre backticks la pisaba, incluido un nombre pelado sin ancla.
 * Reproducido dos veces sobre el árbol de la Task 5: inyectando `` `PLANTER` ``
 * entre `` `PRESUPUESTO_CONSOLIDADO_BASTA.md:100` `` y su remisión corta
 * `` `:430` ``, la guardia salía **exit 0** y contaba esa ancla entre las
 * doscientas «abiertas y resueltas», mientras `:430` resolvía contra
 * `PLANTER:430` —el H2 de otra sección de otro PLAN— en vez de contra el
 * documento del que la oración hablaba.
 *
 * No es un chequeo que falla abierto: es uno que da por verificada una remisión
 * falsa, y la cuenta en el número que el tramo usa para darse por verificado.
 *
 * **El arreglo son dos reglas, y la segunda es la que importa.** Primera: el
 * antecedente de una remisión corta lo fija **solo un ancla completa**
 * (`DOC:NNN` o `DOC §N.N`); un nombre pelado no lo pisa nunca. Segunda: si
 * entre el ancla completa y la remisión corta apareció el nombre pelado de
 * **otro** documento, el chequeo **no corre y lo dice** — no adivina cuál de
 * los dos quiso decir el que escribió. Es la doctrina que esta guardia ya tiene
 * escrita para los domicilios ambiguos, aplicada donde faltaba.
 *
 * **Falsos positivos: cero sobre el documento entero**, verificado antes de dar
 * el chequeo por bueno. El corpus escribe la remisión corta pegada a su ancla
 * —«`PLANTER:674` … (`:163`)»— y el caso ambiguo, cuando aparece, es prosa que
 * el lector tampoco puede desambiguar.
 *
 * ── DECIMOCUARTA FORMA: el arreglo de arriba cerró al hijacker DÉBIL y dejó
 * abierto al FUERTE, que es el realista ────────────────────────────────────
 *
 * El nombre pelado entre backticks —`` `PLANTER` `` suelto— no es prosa que el
 * corpus escriba. El **ancla completa de otro documento** sí lo es. Reproducido
 * sobre `:455` (§4.5), insertando `` `PLANTER:349` `` entre
 * `` `PRESUPUESTO_CONSOLIDADO_BASTA.md:100` `` y sus dos remisiones cortas:
 * **exit 0**, el titular pasó de 246 anclas «abiertas y resueltas» a 247, y
 * `` `:430` `` resolvió contra `PLANTER:430` y `` `:3` `` contra `PLANTER:3`.
 * El ancla completa reasignaba el antecedente y encima LIMPIABA los pelados
 * pendientes.
 *
 * **Lo que NO se puede hacer, y va escrito para que nadie lo reintente:** tratar
 * cualquier ancla intermedia como ambigüedad. Un ancla completa siempre se
 * vuelve el antecedente, así que «entre el antecedente y la remisión corta» no
 * puede haber ninguna otra por construcción; y contar todos los documentos
 * anclados desde la remisión corta anterior pone en rojo prosa honesta —`:465`
 * ancla PLANTER, después PLANMON, después PLANTER otra vez, y sus tres
 * remisiones cortas son correctas—. Medido sobre el árbol limpio: sesenta y
 * pico de falsos positivos.
 *
 * **El corte que sí distingue es la ORACIÓN.** Un lector resuelve la remisión
 * corta contra el último documento citado, y eso alcanza mientras la oración
 * nombre uno solo. Cuando la MISMA oración ancla dos documentos distintos antes
 * de la remisión corta, el lector tampoco puede desambiguar: ahí el chequeo no
 * corre y lo dice, igual que con el nombre pelado. La oración se corta contra
 * `.` o `;` —no contra `:`, y la razón está abajo, en `CORTA_ORACION`— y contra
 * el principio de línea, porque el corpus escribe un párrafo por línea.
 *
 * ── EL DEFAULT INVERTIDO: el corte por oración cerraba UNA de tres variantes ──
 *
 * El arreglo de arriba cerró la variante que comparte oración con el ancla
 * secuestradora —separador coma, **rojo**— y dejó pasar las otras dos, las dos
 * medidas sobre el árbol de `8559818` y las dos **exit 0**:
 *
 * | Variante | Separador | Antes |
 * |---|---|---|
 * | misma oración | coma | rojo |
 * | misma línea, oración distinta | **un punto** | **exit 0**: `` `:1556` `` resolvía contra `PLANSAL:1556` |
 * | líneas distintas | **un párrafo insertado** | **exit 0**: `` `:428` `` resolvía contra `PLANSAL:428` |
 *
 * La tercera es la peligrosa. `ancladosEnLaOracion` se reinicializa en cada
 * línea, así que un ancla de una línea anterior es invisible para el chequeo de
 * ambigüedad mientras `antecedente` —global al archivo— la sigue usando. El
 * documento tenía dos remisiones cortas que cruzaban línea (`:331`→`:329` y
 * `:528`→`:526`), y **insertar un párrafo entre dos párrafos es la operación de
 * edición más común que hay**: con un párrafo nuevo entre `:329` y `:331`, la
 * Regla de Arco citada literal —la cláusula más portante de §3.4— pasaba a
 * resolver contra otro PLAN y se contaba entre las anclas «resueltas».
 *
 * **El arreglo es invertir el default, no agregar una excepción más.** La
 * remisión corta corre **solo si su ancla completa está en la misma oración**;
 * si no, el chequeo no corre y lo dice. Es la doctrina que esta guardia ya
 * proclamaba —el lector resuelve contra lo que tiene a la vista— escrita como
 * requisito positivo en vez de como excepción negativa, que es la forma que se
 * puede escapar por los bordes que nadie enumeró.
 *
 * **El presupuesto del cambio, medido y no supuesto:** 21 de las 62 remisiones
 * cortas del documento pedían el nombre escrito, y `` `:428` `` → ``
 * `PLANPACTO:428` `` es **un token en los dos casos** (`wc -w`), o sea **cero
 * palabras de costo** sobre secciones con margen de tres a seis.
 *
 * **Falsos positivos: cero sobre el documento entero**, medido después de
 * invertir el default: 253 anclas abiertas y resueltas, las mismas 253.
 */
/**
 * Límite de ORACIÓN entre dos tokens. Los dos puntos NO cortan, y la diferencia
 * se midió: con `:` adentro del juego, la mutación «`PLANTER:674` … que
 * `PLANMON:941` no computa … de no distribuir: preservación de capital (`:163`)»
 * se escapaba del chequeo de ambigüedad —el `:` de «no distribuir:» vaciaba el
 * conjunto— y solo caía de rebote, porque `PLANMON` no tiene esas líneas. De
 * rebote no es un chequeo. El castellano del corpus usa los dos puntos para
 * seguir la misma oración, así que cortan `.` y `;` y nada más.
 */
const CORTA_ORACION = /[.;]\s|[.;]$/;

function verificarAnclasDeProsa(lineas: string[]): { errores: string[]; resueltas: number } {
  const errores: string[] = [];
  /**
   * Cuántas anclas se abrieron de verdad **y resolvieron**. Va al titular a
   * propósito: cero anclas escaneadas también da cero errores, y un chequeo que
   * informa éxito sin haber mirado nada es el arquetipo que esta guardia lleva
   * ocho veces. Se incrementa DESPUÉS de resolver y solo si resolvió: antes se
   * contaba al entrar al brazo, así que una cita a un documento no registrado
   * sumaba al titular «abiertas contra su documento» sin haberse abierto nunca.
   */
  let resueltas = 0;
  const anotar = (err: string | null, donde: string): void => {
    if (err === null) resueltas += 1;
    else errores.push(`${donde}: ${err}`);
  };

  lineas.forEach((linea, k) => {
    /**
     * Documentos ANCLADOS en la oración en curso, y nombres PELADOS de la misma
     * oración. Los dos se vacían en cada `.` y `;`. **No hay estado que cruce la
     * oración:** el antecedente global que había acá es exactamente lo que
     * dejaba pasar las variantes B y C.
     */
    let ancladosEnLaOracion = new Set<string>();
    let peladosEnLaOracion = new Set<string>();
    let finDelTokenAnterior = 0;

    for (const m of linea.matchAll(/`([^`\n]+)`/g)) {
      const bruto = m[1].trim();
      const donde = `línea ${String(k + 1)}`;
      if (CORTA_ORACION.test(linea.slice(finDelTokenAnterior, m.index))) {
        ancladosEnLaOracion = new Set<string>();
        peladosEnLaOracion = new Set<string>();
      }
      finDelTokenAnterior = m.index + m[0].length;

      const s = ANCLA_PROSA_SECCION.exec(bruto);
      if (s) {
        if (lineasDelPlan(s[1]) !== null) ancladosEnLaOracion.add(s[1]);
        anotar(resolverContra(bruto, s[1], s[2], 0, 0, 'reportar'), donde);
        continue;
      }

      const l = ANCLA_PROSA_LINEA.exec(bruto);
      if (l) {
        if (lineasDelPlan(l[1]) !== null) ancladosEnLaOracion.add(l[1]);
        const desde = Number(l[2]);
        anotar(
          resolverContra(bruto, l[1], null, desde, l[3] === undefined ? desde : Number(l[3]), 'reportar'),
          donde,
        );
        continue;
      }

      const c = ANCLA_PROSA_CORTA.exec(bruto);
      if (c) {
        if (ancladosEnLaOracion.size === 0) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y su ORACIÓN no ancla ningún documento. La ` +
              'remisión corta corre solo contra un ancla completa de la misma oración: un antecedente ' +
              'que viene de otra oración o de otro párrafo se lo lleva cualquier edición intermedia ' +
              '—un párrafo insertado entre dos párrafos— sin que nadie se entere, y la guardia ' +
              'contaría la cita secuestrada entre las resueltas. Escribí la cita con su nombre ' +
              '(`DOC:NNN`) o traé el ancla completa a esta misma oración',
          );
          continue;
        }
        if (ancladosEnLaOracion.size > 1) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y su oración ancla más de un documento ` +
              `(«${[...ancladosEnLaOracion].join('», «')}»): el lector no tiene cómo saber cuál quiso ` +
              'decir el que escribió. La guardia no adivina — escribí la cita con su nombre ' +
              '(`DOC:NNN`) o partí la oración. Un antecedente secuestrado por un ancla legítima no ' +
              'rompe el chequeo: lo vuelve una afirmación de que la cita es correcta',
          );
          continue;
        }
        const antecedente = [...ancladosEnLaOracion][0];
        const pelados = [...peladosEnLaOracion].filter((d) => d !== antecedente);
        if (pelados.length > 0) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y el antecedente NO es único — el ancla ` +
              `completa de su oración es de «${antecedente}» y la misma oración nombra a ` +
              `«${pelados.join('», «')}». La guardia no adivina cuál de los dos: escribí la cita con ` +
              'su nombre (`DOC:NNN`) o mové el nombre pelado. Un antecedente secuestrado no rompe el ' +
              'chequeo, lo vuelve una afirmación de que la cita es correcta',
          );
          continue;
        }
        const desde = Number(c[1]);
        anotar(
          resolverContra(
            `${antecedente}${bruto}`,
            antecedente,
            null,
            desde,
            c[2] === undefined ? desde : Number(c[2]),
            'reportar',
          ),
          donde,
        );
        continue;
      }

      const n = NOMBRE_DE_DOCUMENTO.exec(bruto);
      if (n) {
        // Un nombre PELADO no ancla: se anota como ambigüedad pendiente de la oración.
        if (lineasDelPlan(n[1]) !== null) peladosEnLaOracion.add(n[1]);
        continue;
      }

      // Octava forma: tiene pinta de ancla y ninguna de las cuatro la leyó.
      if (CON_FORMA_DE_ANCLA.test(bruto)) {
        errores.push(
          `${donde}: «${bruto}» tiene forma de ancla y la guardia no sabe leerla, así que hasta hoy ` +
            'se descartaba en silencio y contaba como prosa. Las formas que se resuelven son ' +
            '`PLANXXX §N.N`, `PLANXXX:NNN`, `PLANXXX:NNN-NNN` y la remisión corta `:NNN`. Si el ' +
            'formato es legítimo, se registra acá; si no, la cita no se puede abrir y no va escrita',
        );
      }
    }
  });

  return { errores, resueltas };
}

/**
 * ── §12 CONTRA §9.1: el cruce que la Task 8 dejó pedido y no existía ──────────
 *
 * §9.1 fija el calendario de fases del PLAN —cada tramo de la rampa nombra la
 * suya— y §12 lo escribe como hoja de ruta. Son dos tablas que dicen lo mismo en
 * dos unidades y **nada las cruzaba**: mover una fase en §12, o correrle el año
 * al régimen, dejaba a la Sección 9 calculando su integral sobre un cronograma
 * que el documento ya había abandonado, con las dos tablas verdes.
 *
 * **La unidad es distinta a propósito y el chequeo tiene que respetarlo.** La
 * partición de §9.1 es contable: los tramos no se pisan porque una integral no
 * se suma dos veces. Las fases de §12 se solapan porque el arco se construye
 * así. Entonces la relación correcta no es igualdad sino CONTENCIÓN, y en dos
 * formas según lo que el tramo nombre:
 *
 * - un tramo que nombra **una** fase tiene que caer entero adentro de la
 *   ventana de esa fase en §12;
 * - un tramo que nombra **dos** —«Fases 2 y 3»— tiene que caer adentro de la
 *   unión de las dos ventanas, que es lo único que se puede afirmar sin
 *   inventar dónde termina una y empieza la otra.
 *
 * Y tres cierres más: el conjunto de fases es el mismo de los dos lados, el año
 * en que la rampa llega al 100% cae adentro de la última fase de §12 y está
 * escrito ahí en letras, y la hoja de ruta termina en el horizonte del gate.
 */
const COLUMNAS_HOJA_DE_RUTA = ['Fase', 'Años', 'Qué se pone en pie', 'Qué la cierra'];

/**
 * Las fases cuyo nombre tiene que ser el mismo en las dos tablas. Van las tres
 * que nombran lo mismo en las dos unidades; la 2 y la 3 no, porque §9.1 las
 * agrupa en un tramo contable —«La salida gradual del trabajo y las casas»— que
 * no es el nombre de ninguna de las dos fases por separado.
 */
const NOMBRES_COMPARTIDOS: Record<number, string> = {
  0: 'Contar el arco',
  1: 'El piso y el final',
  4: 'Régimen pleno',
};

function verificarHojaDeRuta(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_HOJA_DE_RUTA, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla de la hoja de ruta, con las columnas [${COLUMNAS_HOJA_DE_RUTA.join(' · ')}]. ` +
          'Es la que se cruza contra la partición contable de §9.1: sin ella, el calendario de fases ' +
          'del PLAN existe en un solo lado y la Sección 9 calcula sobre un cronograma sin testigo',
      );
    }
    return errores;
  }

  /** Fase → ventana de calendario declarada en §12. */
  const ventanas = new Map<number, [number, number]>();
  filas.forEach((fila, k) => {
    const donde = `fila ${String(k + 1)} de la hoja de ruta («${(fila[0] ?? '').slice(0, 40)}»)`;
    const f = /^Fase (\d+)\s*—\s*(.+)$/u.exec((fila[0] ?? '').trim());
    if (f === null) {
      errores.push(`${donde}: la primera celda no tiene la forma «Fase N — {nombre}»`);
      return;
    }
    const n = Number(f[1]);
    if (n !== k) {
      errores.push(
        `${donde}: es la fase número ${String(k + 1)} de la tabla y está numerada «Fase ${String(n)}». ` +
          'Las fases van de la 0 a la 4 y correlativas, o el cruce contra §9.1 compara fases distintas',
      );
      return;
    }
    const m = /^(\d+)\s*a\s*(\d+)$/.exec((fila[1] ?? '').trim());
    if (m === null) {
      errores.push(`${donde}: la columna «Años» no se lee como «N a M»: «${fila[1] ?? ''}»`);
      return;
    }
    const desde = Number(m[1]);
    const hasta = Number(m[2]);
    if (hasta <= desde) {
      errores.push(`${donde}: la ventana va de ${String(desde)} a ${String(hasta)} y no avanza`);
      return;
    }
    ventanas.set(n, [desde, hasta]);
    const esperado = NOMBRES_COMPARTIDOS[n];
    if (esperado !== undefined && !f[2].includes(esperado)) {
      errores.push(
        `${donde}: la fase ${String(n)} se llama «${esperado}» en la rampa de §9.1 y acá «${f[2]}». ` +
          'Las dos tablas escriben el mismo calendario: un nombre que cambia en un solo lado deja a ' +
          'la Sección 9 y a la hoja de ruta hablando de fases distintas con el mismo número',
      );
    }
  });

  // Sin hueco entre ventanas: la siguiente arranca antes de que cierre la anterior.
  for (let n = 1; n <= 4; n++) {
    const previa = ventanas.get(n - 1);
    const actual = ventanas.get(n);
    if (previa === undefined || actual === undefined) continue;
    if (actual[0] > previa[1]) {
      errores.push(
        `la Fase ${String(n)} arranca en el año ${String(actual[0])} y la anterior cerró en el ` +
          `${String(previa[1])}: queda un hueco de calendario sin fase. Las fases se solapan o se ` +
          'tocan, nunca dejan años del horizonte sin nadie a cargo',
      );
    }
    if (actual[1] <= previa[1]) {
      errores.push(
        `la Fase ${String(n)} cierra en el año ${String(actual[1])} y la anterior cerraba en el ` +
          `${String(previa[1])}: la hoja de ruta no avanza`,
      );
    }
  }
  const ultima = ventanas.get(4);
  if (ultima !== undefined && ultima[1] !== HORIZONTE_DEL_GATE) {
    errores.push(
      `la hoja de ruta termina en el año ${String(ultima[1])} y el gate se corrió sobre ` +
        `${String(HORIZONTE_DEL_GATE)}. El horizonte de las dos tablas es el mismo o la integral de ` +
        '§9.1 mide un plan más largo o más corto que el que la hoja de ruta escribe',
    );
  }

  // ── El cruce contra la partición contable de §9.1 ──────────────────────────
  const rampa = filasDeTabla(lineas, COLUMNAS_RAMPA, true);
  if (rampa.filas === null) {
    errores.push(
      'la hoja de ruta no se puede cruzar contra la rampa de §9.1 porque la guardia no puede leer esa ' +
        'tabla. Las dos escriben el mismo calendario y ninguna es autoridad sola',
    );
    return errores;
  }
  const tramos = rampa.filas.slice(0, -1);
  const fasesDeLaRampa = new Set<number>();
  /** Fase → los tramos de §9.1 que la nombran, en puntos de calendario. */
  const cobertura = new Map<number, [number, number][]>();
  let anioDelRegimen: number | null = null;
  for (const fila of tramos) {
    const f = /Fase(?:s)? (\d)(?: y (\d))?/u.exec(fila[0] ?? '');
    const a = /^(\d+)(?:\s*a\s*(\d+))?$/.exec((fila[1] ?? '').trim());
    if (f === null || a === null) continue;
    const desde = Number(a[1]);
    const hasta = a[2] === undefined ? desde : Number(a[2]);
    const pct = /(\d+(?:[.,]\d+)?)\s*%/.exec(fila[3] ?? '');
    if (pct !== null && Number(pct[1].replace(',', '.')) === 100 && anioDelRegimen === null) {
      anioDelRegimen = desde;
    }
    const nombradas = [f[1], f[2]].filter((x) => x !== undefined).map(Number);
    for (const n of nombradas) {
      fasesDeLaRampa.add(n);
      cobertura.set(n, [...(cobertura.get(n) ?? []), [desde - 1, hasta]]);
    }
    const cubierto = nombradas
      .map((n) => ventanas.get(n))
      .filter((v): v is [number, number] => v !== undefined);
    if (cubierto.length !== nombradas.length) continue; // ya reportado arriba
    /**
     * **La conversión de unidad, hecha operativa** (M-5, y una mutación propia
     * la pidió). §9.1 cuenta AÑOS ORDINALES y §12 PUNTOS DE CALENDARIO: el año
     * ordinal N es el intervalo (N−1, N]. Sin la conversión, comparar `5 a 8`
     * con `4 a 8` es comparar dos cosas distintas, y medido: mover la ventana
     * de la Fase 3 de `6 a 10` a `8 a 10` salía **exit 0** —el tramo «Fases 2 y
     * 3 · 5 a 8» seguía cabiendo en la unión— con la Fase 3 declarada empezando
     * después de la mitad del tramo que la nombra.
     */
    const abre = desde - 1;
    for (let i = 0; i < nombradas.length; i++) {
      const [vDesde, vHasta] = cubierto[i];
      if (abre < vHasta && hasta > vDesde) continue;
      errores.push(
        `el tramo «${(fila[0] ?? '').slice(0, 45)}» de §9.1 nombra la Fase ${String(nombradas[i])} y ` +
          `no comparte un solo año con ella: el tramo va del punto ${String(abre)} al ${String(hasta)} ` +
          `—años ordinales ${String(desde)} a ${String(hasta)}— y la ventana de §12 para esa fase va ` +
          `del ${String(vDesde)} al ${String(vHasta)}. Una fase nombrada en un tramo que no la toca es ` +
          'una erogación imputada a una fase que todavía no empezó',
      );
    }
    const min = Math.min(...cubierto.map((v) => v[0]));
    const max = Math.max(...cubierto.map((v) => v[1]));
    if (abre < min || hasta > max) {
      errores.push(
        `el tramo «${(fila[0] ?? '').slice(0, 45)}» de §9.1 va del año ${String(desde)} al ` +
          `${String(hasta)} y la ventana de §12 para la(s) fase(s) que nombra va del ${String(min)} ` +
          `al ${String(max)}: la partición contable cae afuera de la hoja de ruta. Las dos tablas ` +
          'escriben el mismo calendario en dos unidades — la contable no se pisa, la de calendario ' +
          'se solapa— y la primera tiene que caber adentro de la segunda o la integral de §9.1 se ' +
          'está calculando sobre un cronograma que el documento abandonó',
      );
    }
  }
  /**
   * **La dirección inversa, y una mutación propia la pidió.** La contención sola
   * es de una sola mano: ensanchar una ventana de §12 —Fase 2 de `4 a 8` a
   * `4 a 9`, Fase 0 de `0 a 1` a `0 a 2`— salía **exit 0**, porque un tramo más
   * chico sigue cabiendo adentro de una ventana más grande. Las dos direcciones
   * juntas son lo que hace que los dos calendarios sean el mismo: cada año de
   * una fase tiene que tener por lo menos un tramo de §9.1 que la nombre, o la
   * hoja de ruta declara una fase andando en años en los que nada eroga.
   */
  for (const [n, [vDesde, vHasta]] of ventanas) {
    const cubre = (cobertura.get(n) ?? []).some(([a, b]) => a <= vDesde && b >= vHasta);
    const union = (cobertura.get(n) ?? []).reduce<[number, number] | null>(
      (acc, t) => (acc === null ? t : [Math.min(acc[0], t[0]), Math.max(acc[1], t[1])]),
      null,
    );
    if (cubre) continue;
    if (union !== null && union[0] <= vDesde && union[1] >= vHasta) continue;
    errores.push(
      `la Fase ${String(n)} de §12 va del año ${String(vDesde)} al ${String(vHasta)} y los tramos de ` +
        `§9.1 que la nombran cubren ${union === null ? 'nada' : `del ${String(union[0])} al ${String(union[1])}`}: ` +
        'quedan años de la fase sin ningún tramo que erogue contra ella. La contención sola es de una ' +
        'sola mano —una ventana más grande siempre contiene a un tramo más chico— y con las dos ' +
        'direcciones los dos calendarios son el mismo',
    );
  }
  for (const n of ventanas.keys()) {
    if (!fasesDeLaRampa.has(n)) {
      errores.push(
        `la hoja de ruta declara una Fase ${String(n)} que ningún tramo de la rampa de §9.1 nombra: ` +
          'una fase sin ejecución declarada es una franja de tiempo que no eroga nada',
      );
    }
  }
  for (const n of fasesDeLaRampa) {
    if (!ventanas.has(n)) {
      errores.push(
        `la rampa de §9.1 nombra una Fase ${String(n)} que la hoja de ruta no tiene: el tramo eroga ` +
          'contra una fase que §12 no escribió',
      );
    }
  }

  /**
   * **El gate de cierre de la Fase 3 cuenta estaciones, y nadie contaba las
   * estaciones** (I-7). `dieciséis` → `doce` salía **exit 0**, con el titular de
   * la misma corrida anunciando «Calendario de Umbrales con 16 estaciones
   * parseadas»: la guardia tenía el número en la mano y la celda que lo escribe
   * en otro lado. El Calendario es la tabla que la Fase 3 cierra; si el conteo
   * deriva, la hoja de ruta declara terminada una arquitectura más chica.
   */
  const calendario = filasDeTabla(lineas, COLUMNAS_CALENDARIO);
  if (calendario.filas === null) {
    errores.push(
      'la hoja de ruta no se puede cruzar contra el Calendario de Umbrales porque la guardia no puede ' +
        'leer esa tabla, y el gate de cierre de la Fase 3 cuenta sus estaciones',
    );
  } else {
    const cierre = filas.find((f) => (f[0] ?? '').includes('Fase 3'))?.[3] ?? '';
    const escritas = /(\p{L}+)\s+estaciones/u.exec(cierre);
    const enLetrasEstaciones = EN_LETRAS[calendario.filas.length] ?? String(calendario.filas.length);
    if (escritas === null) {
      errores.push(
        'el gate de cierre de la Fase 3 no dice cuántas estaciones tienen que quedar con responsable, ' +
          `caja y organismo obligado. El Calendario tiene ${String(calendario.filas.length)} ` +
          `(«${enLetrasEstaciones}») y la Fase 3 es la que lo cierra`,
      );
    } else if (escritas[1].toLowerCase() !== enLetrasEstaciones) {
      errores.push(
        `el gate de la Fase 3 exige «${escritas[1]} estaciones» y el Calendario de Umbrales tiene ` +
          `${String(calendario.filas.length)} («${enLetrasEstaciones}»). Una fase que cierra contra un ` +
          'conteo que la tabla no da declara terminada una arquitectura más chica que la que el ' +
          'documento escribió',
      );
    }
  }

  if (anioDelRegimen !== null && ultima !== undefined) {
    if (anioDelRegimen < ultima[0] || anioDelRegimen > ultima[1]) {
      errores.push(
        `la rampa de §9.1 llega al régimen en el año ${String(anioDelRegimen)} y la última fase de ` +
          `§12 va del ${String(ultima[0])} al ${String(ultima[1])}: el año del régimen cae afuera de ` +
          'la fase que lo declara',
      );
    }
    const { texto } = textoDeDomicilio(lineas, H2_HOJA_DE_RUTA);
    const enLetrasDelAnio = EN_LETRAS[anioDelRegimen] ?? String(anioDelRegimen);
    const escrito = /el año ([\p{L}]+) es el primero de régimen/iu.exec(texto ?? '');
    if (escrito === null) {
      errores.push(
        `la hoja de ruta no dice cuál es el primer año de régimen. La rampa de §9.1 lo produce —año ` +
          `${String(anioDelRegimen)}, «${enLetrasDelAnio}»— y §12 es donde un lector lo busca`,
      );
    } else if (escrito[1].toLowerCase() !== enLetrasDelAnio) {
      errores.push(
        `la hoja de ruta dice que el primer año de régimen es el «${escrito[1]}» y la rampa de §9.1 ` +
          `lo pone en el ${String(anioDelRegimen)} («${enLetrasDelAnio}»). Dos calendarios que se ` +
          'contradicen en el año que más importa, con las dos tablas cerrando cada una por su lado',
      );
    }
  }

  return errores;
}

/**
 * **LA LISTA DE SUPERVIVENCIA, CRUZADA CONTRA LOS TRECE DISPOSITIVOS** (I-3).
 *
 * La lista nominada de §12 es la respuesta al riesgo uno y la mitigación que la
 * fila 1 del archivo de gates promete por escrito, y no la contaba nadie.
 * Medido: sobrevivían 6, no sobrevivían 6 —**total 12**, con el Calendario de
 * Umbrales, que es el dispositivo 1 y cuyo gate de cierre está justamente en la
 * Fase 3, sin aparecer de ningún lado—; y el numeral no estaba cruzado contra
 * los nombres, así que borrar «el Alto de los Cuarenta y Cinco» o «la Rampa de
 * Salida 60–72» de la enumeración salía **exit 0** con «seis de los trece»
 * intacto.
 *
 * Se verifica con la misma máquina que `verificarPortadaNoAnunciaDeMas()`: el
 * conjunto de los trece es cerrado, así que cada dispositivo tiene que caer en
 * **exactamente uno** de los tres lados —lo que sobrevive, lo que no, y lo que
 * el párrafo declare continente y no pieza— y el numeral escrito tiene que ser
 * el de la lista que lo acompaña.
 */
function verificarSupervivencia(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(lineas, H2_HOJA_DE_RUTA);
  if (tramo === null) return errores;

  const parrafo = tramo
    .map((l) => l.replace(/\*\*/g, ''))
    .find((l) => l.includes('Sobreviven:') && l.includes('No sobreviven:'));
  if (parrafo === undefined) {
    errores.push(
      'la hoja de ruta no trae el párrafo con «Sobreviven:» y «No sobreviven:». Es la lista nominada ' +
        'que el riesgo uno de la SECCIÓN 10 promete y que la mitigación del attack path 1 declara en ' +
        `${GATES}: sin ella, la pérdida por no ejecución no se mide contra nada escrito de antemano`,
    );
    return errores;
  }

  const iA = parrafo.indexOf('Sobreviven:');
  const iB = parrafo.indexOf('No sobreviven:');
  if (iB < iA) {
    errores.push(
      'la hoja de ruta escribe «No sobreviven:» antes que «Sobreviven:»: el párrafo se lee al revés y ' +
        'el cruce contra los trece dispositivos no puede decidir de qué lado cae cada uno',
    );
    return errores;
  }
  const lados: [string, string][] = [
    ['fuera de la cuenta', parrafo.slice(0, iA)],
    ['sobreviven', parrafo.slice(iA, iB)],
    ['no sobreviven', parrafo.slice(iB)],
  ];

  if (!lados[0][1].includes('es el continente')) {
    errores.push(
      'la lista de supervivencia no declara ANTES de las dos listas qué queda fuera de la cuenta. Lo ' +
        'que no se cuenta se declara antes de contar: puesto después, el mismo dispositivo se lee ' +
        'como sobreviviente y el balance cierra igual con un nombre de más de un lado',
    );
  }

  const conteo = new Map<string, number>(lados.map(([nombre]) => [nombre, 0]));
  for (const { nombre, enPortada } of DISPOSITIVOS_EN_PORTADA) {
    const donde = lados.filter(([, texto]) =>
      enPortada.some((frag) => texto.toLowerCase().includes(frag.toLowerCase())),
    );
    if (donde.length !== 1) {
      errores.push(
        `«${nombre}» aparece en ${String(donde.length)} de los tres lados de la lista de supervivencia ` +
          `[${donde.map(([n]) => n).join(' · ') || '—'}]. Cada uno de los trece dispositivos cae en ` +
          'exactamente uno: el que no está en ninguno desaparece del balance de la Fase 3 sin que se ' +
          'note, y el que está en dos hace que el numeral cierre por casualidad',
      );
      continue;
    }
    conteo.set(donde[0][0], (conteo.get(donde[0][0]) ?? 0) + 1);
  }

  const caen = conteo.get('no sobreviven') ?? 0;
  const escrito = /(\p{L}+) de los trece dispositivos/u.exec(parrafo);
  const enLetrasCaen = EN_LETRAS[caen] ?? String(caen);
  if (escrito === null) {
    errores.push(
      'la lista de supervivencia no dice cuántos de los trece dispositivos caen si la Fase 3 no se ' +
        `ejecuta. Son ${String(caen)} («${enLetrasCaen}») según los nombres que ella misma enumera`,
    );
  } else if (escrito[1].toLowerCase() !== enLetrasCaen) {
    errores.push(
      `la lista de supervivencia dice «${escrito[1]} de los trece dispositivos» y los nombres que ` +
        `enumera del lado que cae son ${String(caen)} («${enLetrasCaen}»). El numeral y la lista son ` +
        'el mismo dato escrito dos veces: borrar un nombre y dejar el número es la manera más barata ' +
        'de achicar la pérdida declarada',
    );
  }
  return errores;
}

/**
 * **UNA MAGNITUD DE PLATA EN LAS TRES SECCIONES NUEVAS SE ABRE O NO SE ESCRIBE**
 * (M-1 y M-2). Las anclas de §10–§12 se resuelven —la línea existe— pero nadie
 * las **leía**, y las tres secciones no traen una sola `«…»` con ancla, así que
 * toda la superficie nueva había quedado del lado no cruzado. Medido:
 * `PLANCUIDADO:564`→`:560` y `USD 50.000 millones`→`80.000` salían **verdes**.
 *
 * Es la misma doctrina que la exención del sustraendo (I-1) y las citas
 * descubiertas, aplicada al tercer lugar donde faltaba: **el mapa de perdedores
 * se escribió con magnitud a propósito, y una magnitud ajena sin abrir es la
 * mitad barata de esa promesa.** Cada monto en dinero de estas tres secciones
 * tiene que estar abierto contra una línea anclada en su misma oración; si no
 * hay ancla, tampoco hay monto que escribir.
 */
const SECCIONES_CON_MAGNITUD_ANCLADA = [H2_RIESGOS, H2_PERDEDORES, H2_HOJA_DE_RUTA];

function verificarMagnitudesAncladas(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const h2 of SECCIONES_CON_MAGNITUD_ANCLADA) {
    const { tramo, errores: errTramo } = tramoDeSeccion(lineas, h2);
    errores.push(...errTramo);
    if (tramo === null) continue;
    for (const cruda of tramo) {
      const linea = cruda.replace(/\*\*/g, '');
      for (const m of linea.matchAll(new RegExp(MAGNITUD_MONETARIA, 'gu'))) {
        const ambito = oracionDe(linea, m.index, m.index + m[0].length);
        if (magnitudAbiertaEnSuAncla(ambito, m[0])) continue;
        errores.push(
          `«${h2}» escribe «${m[0]}» y ninguna ancla de su oración abre ese número. Resolver un ancla ` +
            'prueba que la línea existe; la magnitud que se le atribuye es otra afirmación, y estas ' +
            'tres secciones son las que prometen escribir la pérdida CON magnitud. O el monto va ' +
            'anclado a la línea que lo dice, o no va',
        );
      }
      /**
       * **El rango porcentual se abre contra el ancla que lo PRECEDE, y no
       * contra cualquiera de la oración** (C-1, y una mutación propia lo pidió).
       * La oración de §11 atribuye dos porcentajes distintos a dos líneas
       * distintas del mismo PLAN —10–20% de los activos a `PLAN24CN:1958`,
       * 15–20% de la estructura de financiamiento a `:2676`— y con `some()`
       * sobre las anclas de la oración, cambiar el primero por el segundo salía
       * **verde**: la otra ancla lo abría. La atribución es posicional porque
       * así la escribe el documento —ancla, después el reclamo— y es lo único
       * que distingue dos denominadores de dos bandas rivales.
       */
      for (const m of linea.matchAll(/entre el (\d+) y el (\d+)%|\b(\d+)\s*[–—-]\s*(\d+)\s*%/gu)) {
        const grupos = [m[1] ?? m[3], m[2] ?? m[4]];
        const ambito = oracionDe(linea, m.index, m.index + m[0].length);
        const previas = anclasDeUnTexto(linea.slice(0, m.index)).filter((a) => a.desde > 0);
        const ancla = previas.at(-1);
        if (ancla === undefined || !ambito.includes(ancla.etiqueta.replace(/^[A-Za-z0-9_]+(?=:)/, ''))) {
          errores.push(
            `«${h2}» escribe el rango «${m[0]}» y no hay ancla de línea delante de él en su oración. ` +
              'Un porcentaje ajeno sin la línea que lo dice adelante es una banda que el lector no ' +
              'puede abrir, y §11 existe para que la pérdida se pueda abrir',
          );
          continue;
        }
        const ls = lineasDelPlan(ancla.doc);
        const tramo = ls === null ? '' : tramoDelAncla(ls, ancla.desde, ancla.hasta);
        if (grupos.every((g) => tramo.includes(g))) continue;
        errores.push(
          `«${h2}» le atribuye «${m[0]}» a «${ancla.etiqueta}», que es el ancla que lo precede, y esa ` +
            'línea no dice esos dos números. Dos porcentajes distintos sobre el mismo fondo son dos ' +
            'DENOMINADORES distintos o son una incoherencia: cuál de las dos cosas es depende de que ' +
            'cada uno esté abierto contra SU línea',
        );
      }
    }
  }
  /**
   * **§11 afirma que §4.4 ya cruzó los dos porcentajes, y esa afirmación se
   * verifica** (C-1). Es la premisa del párrafo entero: la versión anterior
   * decía que «ninguna sección las cruza» siendo que §4.4 —escrita en la Task
   * 5— las había cruzado bien, y con eso el reporte agendaba para la Task 11 la
   * resolución de una incoherencia que no existe. Que el cruce siga estando es
   * lo que sostiene la corrección.
   */
  const { texto: perdedores } = textoDeDomicilio(lineas, H2_PERDEDORES);
  if (perdedores !== null && perdedores.includes('4.4 ya las cruzó')) {
    const { texto: cuatroCuatro } = textoDeDomicilio(lineas, H3_TRAMO_GANADO);
    for (const ancla of ['PLAN24CN:2676', ':1958']) {
      if (cuatroCuatro !== null && cuatroCuatro.includes(ancla)) continue;
      errores.push(
        `§11 afirma que §4.4 ya cruzó los dos porcentajes del FGS y §4.4 no nombra «${ancla}». O el ` +
          'cruce se movió de sección —y entonces §11 remite a un lugar que no lo tiene— o la ' +
          'afirmación es falsa, que es exactamente el error que este párrafo vino a corregir',
      );
    }
  }

  return errores;
}

/**
 * **UNA SECCIÓN QUE DECLARA CUÁNTAS PARTES TIENE, CONTADA** (I-6). §10 abre con
 * «Cuatro riesgos» y nada los contaba: `Cuatro` → `Cinco` salía **exit 0**. Es
 * la anatomía que este archivo ya verifica en cuatro lugares —las ocho fallas,
 * las subsecciones, las seis aristas, las estaciones— y los leads existen y son
 * correlativos (`Uno.` … `Cuatro.`), así que el cruce es de una línea.
 */
const ORDINALES = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho'];

function verificarRiesgosContados(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(lineas, H2_RIESGOS);
  if (tramo === null) return errores;

  const declarado = /^(\p{L}+) riesgos\b/mu.exec(tramo.join('\n'));
  const leads: string[] = [];
  for (const l of tramo) {
    const m = /^\*\*(\p{L}+)\./u.exec(l.trim());
    if (m !== null && ORDINALES.includes(m[1])) leads.push(m[1]);
  }

  if (declarado === null) {
    errores.push(
      '§10 no declara cuántos riesgos tiene. El encabezado de la sección es lo que le promete al ' +
        `lector el tamaño de la lista, y hay ${String(leads.length)} lead(s) numerado(s) debajo`,
    );
  } else {
    const n = EN_LETRAS.indexOf(declarado[1].toLowerCase());
    if (n === -1) {
      errores.push(`§10 declara «${declarado[1]} riesgos» y ese numeral no se lee como un número`);
    } else if (n !== leads.length) {
      errores.push(
        `§10 declara «${declarado[1]} riesgos» y trae ${String(leads.length)} párrafo(s) con lead ` +
          'ordinal. Un riesgo borrado deja el encabezado intacto y el conteo de líneas baja sin que ' +
          'nadie mire el conteo de líneas',
      );
    }
  }
  leads.forEach((o, k) => {
    if (o !== ORDINALES[k + 1]) {
      errores.push(
        `§10: el riesgo número ${String(k + 1)} abre con «${o}.» — los leads van correlativos, o dos ` +
          'riesgos con el mismo ordinal dan el conteo justo',
      );
    }
  });
  return errores;
}

/**
 * **La fila de PLANARCO en `READINESS_GATES_ADVERSARIAL.md`, cruzada contra la
 * banda que este documento deriva.** La cabecera del PLAN remite a ese archivo
 * —«no promueve de tranche sin esos tres attack paths escritos»— y hasta la
 * Task 9 la remisión apuntaba a una sección que no existía: la promesa de la
 * cabecera se cumplía sola.
 *
 * Se verifica lo que un editor rompe sin que se note: que la sección esté, que
 * tenga **tres** attack paths y no dos, que ninguna de las seis celdas de una
 * fila quede vacía —una mitigación sin owner o sin indicador es una fila
 * decorativa— y, sobre todo, que **el fallback esté escrito contra el extremo
 * alto de la banda de régimen y no como una cifra suelta**. Ese es el punto: un
 * número escrito a mano en otro archivo deja de moverse cuando la Sección 9 se
 * mueve, y el gate pasa a autorizar contra un presupuesto que el PLAN ya no
 * tiene. La forma es la de la fila de PLANPACTO, que la escribió primero.
 */
const GATES = 'READINESS_GATES_ADVERSARIAL.md';
const COLUMNAS_GATES = ['#', 'Attack path', 'Mitigación', 'Owner', 'Fallback budget', 'Indicador de activación'];
const ATTACK_PATHS_ESPERADOS = 3;

function verificarReadinessGates(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const cociente of COCIENTES_DEL_ACTA) {
    if (!CIFRAS_CANONICAS.some((c) => c.valor === cociente)) {
      errores.push(
        `«${cociente}» está en COCIENTES_DEL_ACTA y no es cifra canónica de la cabecera del PLAN: las ` +
          'dos listas escriben el mismo dato y una sola movida deja al archivo de gates autorizando ' +
          'contra un número que el PLAN no tiene',
      );
    }
  }
  const ls = lineasDelPlan(GATES);
  if (ls === null) {
    errores.push(`la guardia no puede abrir ${GATES} para verificar la fila de PLANARCO`);
    return errores;
  }
  const i = ls.findIndex((l) => l.trim() === '### PLANARCO');
  if (i === -1) {
    errores.push(
      `${GATES} no tiene sección «### PLANARCO», y la cabecera del PLAN promete que existe: ` +
        '«este PLAN no promueve de tranche sin esos tres attack paths escritos». Una remisión a una ' +
        'sección inexistente es una promesa que se cumple sola',
    );
    return errores;
  }
  const j = ls.findIndex((l, k) => k > i && l.startsWith('### '));
  const tramo = ls.slice(i, j === -1 ? ls.length : j);
  const { filas, errores: errTabla } = filasDeTabla(tramo, COLUMNAS_GATES);
  errores.push(...errTabla);
  if (filas === null) {
    errores.push(
      `la sección PLANARCO de ${GATES} no tiene la tabla con las columnas ` +
        `[${COLUMNAS_GATES.join(' · ')}], que es la forma de la fila de PLANPACTO`,
    );
    return errores;
  }
  if (filas.length !== ATTACK_PATHS_ESPERADOS) {
    errores.push(
      `la sección PLANARCO de ${GATES} tiene ${String(filas.length)} attack path(s) y el principio ` +
        `del archivo exige ${String(ATTACK_PATHS_ESPERADOS)}: «un PLAN no avanza de diseño a piloto ` +
        'sin que sus 3 attack paths principales tengan mitigación nombrada, owner accountable, ' +
        'presupuesto de respaldo e indicador de activación documentado»',
    );
  }
  const alto = String(BANDA_ANUAL_REGIMEN[1]).replace(/\B(?=(\d{3})+(?!\d))/, '.');
  const bajo = String(BANDA_ANUAL_REGIMEN[0]).replace(/\B(?=(\d{3})+(?!\d))/, '.');

  /**
   * **LA NOTA DE HABILITACIÓN, QUE ES LO MÁS CARO DE LA FILA Y NO LA CUSTODIABA
   * NADIE** (I-5). La Task 9 mudó a este archivo la única frase que el plan del
   * tramo declara prohibida —«escribir que pasó el gate sería falso»— junto con
   * los cuatro cocientes del acta y la banda derivada, y las dejó del lado de
   * afuera de todas las guardias del PLAN: el prohibido del gate corre sobre
   * `rawPlano`, y las tres celdas de fallback sí se cruzan, pero **el encuadre no
   * lo miraba nadie**. Medido, las tres verdes:
   *
   *     «no superó el gate» → «superó el gate»                    → exit 0
   *     «1,47–1,88x contra un umbral de 1,5» → «1,97–2,88x»       → exit 0
   *     «USD 6.000–10.900M/año» → «USD 6.000–12.900M/año»         → exit 0
   *
   * Se corre acá lo mismo que corre adentro del PLAN, contra las mismas
   * constantes: el documento y su gate no pueden decir cosas distintas del
   * cociente que falla.
   */
  const nota = tramo.filter((l) => !esFilaDeTabla(l)).join('\n').replace(/\*\*/g, '');
  if (!nota.includes('Nota de habilitación:')) {
    errores.push(
      `la sección PLANARCO de ${GATES} no trae su «Nota de habilitación:». Es el encuadre que dice ` +
        'por qué este PLAN existe pese a no haber superado el gate, y las tres celdas de fallback ' +
        'cuelgan de la banda que esa nota declara',
    );
  }
  const afirma = AFIRMA_QUE_PASO_EL_GATE.exec(nota);
  if (afirma !== null) {
    errores.push(
      `la nota de habilitación de PLANARCO en ${GATES} escribe «${afirma[0]}». Este PLAN NO superó el ` +
        'gate de spin-off contra la suma de sus dos huéspedes: la afirmación es falsa y el PLAN la ' +
        'declara prohibida en su propio documento. Que la frase viva en otro archivo no la cambia',
    );
  }
  for (const cociente of COCIENTES_DEL_ACTA) {
    if (!nota.includes(cociente)) {
      errores.push(
        `la nota de habilitación de PLANARCO en ${GATES} no trae «${cociente}», que es una de las ` +
          'cuatro cifras del acta que la cabecera del PLAN está obligada a escribir. Las dos copias ' +
          'del mismo cociente derivan sin que nadie las cruce, y la del gate es la que autoriza',
      );
    }
  }
  if (!nota.includes('derivada en la Sección 9 del PLAN')) {
    errores.push(
      `la nota de habilitación de PLANARCO en ${GATES} no dice de dónde sale la banda de régimen. ` +
        'La deriva §9.1 y no este archivo: una banda sin su derivación remitida es una cifra suelta ' +
        'escrita en el documento que autoriza',
    );
  }
  if (!nota.includes(`USD ${bajo}–${alto}M/año`)) {
    errores.push(
      `la nota de habilitación de PLANARCO en ${GATES} no declara la banda de régimen como ` +
        `«USD ${bajo}–${alto}M/año», que es lo que la Sección 9 deriva y contra lo que los tres ` +
        'fallbacks están escritos. Una banda distinta en el encuadre vuelve arbitrario el techo de ' +
        'las tres celdas que sí se cruzan',
    );
  }

  filas.forEach((fila, k) => {
    const donde = `attack path ${String(k + 1)} de PLANARCO en ${GATES}`;
    COLUMNAS_GATES.forEach((col, c) => {
      if ((fila[c] ?? '').trim().length === 0) {
        errores.push(`${donde}: la celda «${col}» está vacía, y una fila incompleta no cierra el gate`);
      }
    });
    if ((fila[0] ?? '').trim() !== String(k + 1)) {
      errores.push(
        `${donde}: la columna «#» dice «${(fila[0] ?? '').trim()}» y es el attack path ` +
          `${String(k + 1)}. El principio del archivo exige TRES, numerados: un «#» ilegible es una ` +
          'fila que el gate cuenta y nadie puede citar',
      );
    }
    if (k === 0 && !(fila[2] ?? '').includes('lista nominada en la Sección 12')) {
      errores.push(
        `${donde}: la mitigación del vaciamiento no nombra la «lista nominada en la Sección 12 de qué ` +
          'sobrevive y qué no si la Fase 3 no se ejecuta». Es la única mitigación de esa fila que el ' +
          'PLAN entrega como texto verificable, y la guardia la cruza contra los trece dispositivos',
      );
    }
    const fallback = fila[4] ?? '';
    if (!fallback.includes('extremo alto de la banda de régimen')) {
      errores.push(
        `${donde}: el fallback dice «${fallback.slice(0, 60)}» y tiene que escribirse como «hasta USD ` +
          'N/año — extremo alto de la banda de régimen», que es la forma de la fila de PLANPACTO. Una ' +
          'cifra suelta en otro archivo deja de moverse cuando la Sección 9 se mueve',
      );
    }
    if (!fallback.includes(`USD ${alto}M/año`)) {
      errores.push(
        `${donde}: el fallback no está escrito contra USD ${alto}M/año, que es el extremo alto de la ` +
          'banda de régimen que la Sección 9 deriva. El gate estaría autorizando contra un ' +
          'presupuesto que este PLAN no tiene',
      );
    }
  });

  /**
   * **El indicador del attack path 3, cruzado contra §10** (salvedad de la duda
   * 2). El archivo de gates es territorio legítimo para estrenar un umbral
   * operativo —las quince filas previas lo hacen—, pero el del path 3 vivía
   * SOLO acá mientras §10 nombraba el indicador y no su umbral. Dos copias del
   * mismo dato, una escrita: la que no está escrita no puede derivar, y la que
   * sí puede derivar sola.
   */
  const { texto } = textoDeDomicilio(lineas, H2_RIESGOS);
  const enElPlan = /(\d+)% durante \p{L}+ meses/u.exec(texto ?? '');
  if (enElPlan === null) {
    errores.push(
      `§10 no escribe el umbral del indicador que la fila 3 de ${GATES} usa para activar el fallback. ` +
        'El archivo de gates puede estrenar el umbral operativo, pero el PLAN que lo hereda tiene que ' +
        'escribirlo o las dos copias derivan sin testigo',
    );
  } else if (!filas.some((f) => (f[5] ?? '').includes(`${enElPlan[1]}%`))) {
    errores.push(
      `§10 declara un umbral de activación del ${enElPlan[1]}% y ningún indicador de la fila de ` +
        `PLANARCO en ${GATES} lo escribe. El PLAN y su gate se activarían con números distintos`,
    );
  }

  return errores;
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
/**
 * **M-G.** Se compara con `startsWith` y no con `===`. Era un string mágico
 * exacto: la celda «remisión, sin dispositivo propio (ver §4.2)» —la forma que
 * las Tasks 5–7 van a querer escribir cuando la Sección 4 exista— se ponía roja
 * como si nombrara un catorceavo dispositivo. El prefijo es la declaración; lo
 * que venga detrás es el puntero, y un puntero no es un dispositivo nuevo.
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
  /** Los PLANes DISTINTOS que ocupan alguna estación: la prosa dice cuántos son. */
  const documentosOcupantes = new Set<string>();
  /** Fragmentos de ocupante de la fila más poblada: la prosa dice cuántos son. */
  let maxOcupantesEnUnaFila = 0;
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
    if (!dispositivo.startsWith(DISPOSITIVO_POR_REMISION)) {
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
    const fragmentos = ocupante.split('·');
    maxOcupantesEnUnaFila = Math.max(maxOcupantesEnUnaFila, fragmentos.length);
    for (const frag of fragmentos) {
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
      } else {
        documentosOcupantes.add(p);
      }
    }
    ocupadas += 1;
  });

  const { tramo, errores: errTramo } = tramoDeSeccion(lineas, H2_CALENDARIO);
  errores.push(...errTramo);
  if (tramo !== null) {
    const texto = tramo.join('\n');
    for (const { frase, porQue } of frasesDerivadasDelCalendario(
      ocupadas,
      filas.length,
      documentosOcupantes.size,
      maxOcupantesEnUnaFila,
    )) {
      if (!dice(texto, frase)) {
        errores.push(`la SECCIÓN 3 no dice «${frase}»: ${porQue}`);
      }
    }
  }

  return errores;
}

/**
 * **La séptima forma del arquetipo de esta guardia**, y la más fina de las
 * siete: *el arreglo se aplicó al número que estaba mal y no a los que nacieron
 * del arreglo.*
 *
 * La Task 4 le enseñó a la guardia a derivar UN número de la tabla —las
 * estaciones con ocupante— y a exigirlo en la prosa. Después §3.3 creció **tres
 * números más de la misma tabla** y ninguno se derivó. Reproducido antes de
 * escribir esto, los tres salían **exit 0**:
 *
 * | Mutación | Resultado |
 * |---|---|
 * | `Son diez documentos` → `Son cuatro documentos` | exit 0 |
 * | `Solo dos filas llevan guion` → `Solo siete filas llevan guion` | exit 0 |
 * | `cuatro ocupantes, tres de plata` → `nueve ocupantes, ocho de plata` | exit 0 |
 *
 * El titular seguía diciendo «16 estaciones parseadas… y sus ocupantes resueltos
 * ancla por ancla» mientras tres cuartas partes de la aritmética que la sección
 * saca de esa tabla no las miraba nadie.
 *
 * Se exige el par número-sustantivo y no la oración entera, a propósito: la
 * prosa se puede reescribir sin que la guardia se ponga roja sobre prosa
 * honesta, y el número sigue teniendo que salir de la tabla.
 *
 * Lo que NO deriva, y va dicho para que nadie lo suponga derivado: «tres de
 * plata» de la misma frase es una clasificación semántica —qué ocupante paga y
 * cuál es un rol— y ninguna columna la trae. Eso lo mira la revisión.
 */
function frasesDerivadasDelCalendario(
  ocupadas: number,
  total: number,
  documentos: number,
  maxEnUnaFila: number,
): { frase: string; porQue: string }[] {
  const letra = (n: number): string => EN_LETRAS[n] ?? String(n);
  return [
    {
      frase: `${letra(ocupadas)} de las ${letra(total)} estaciones`,
      porQue:
        'el conteo de estaciones con ocupante previo se deriva de la tabla y no se hereda. El plan ' +
        'del tramo dice «nueve» y su propio hallazgo C-9 enumera cuatro territorios: un número que ' +
        'no sale de ninguna cuenta es una cifra estrenada',
    },
    {
      frase: `${letra(documentos)} documentos`,
      porQue:
        'los PLANes DISTINTOS que ocupan alguna estación salen de `new Set()` sobre la cuarta ' +
        'columna. El censo ya pasó de cinco a diez una vez: el número que resume la tabla no puede ' +
        'quedar escrito a mano mientras la tabla se mueve',
    },
    {
      frase: ocupadas === total - 1 ? 'una fila lleva guion' : `${letra(total - ocupadas)} filas llevan guion`,
      porQue:
        'las vacantes son `filas.length - ocupadas` y la prosa las nombra una por una. Sumar un ' +
        'ocupante sin tocar esta frase deja la sección afirmando una vacante que la tabla ya llenó',
    },
    {
      frase: maxEnUnaFila === 1 ? 'un ocupante' : `${letra(maxEnUnaFila)} ocupantes`,
      porQue:
        'la estación más poblada del Calendario es la que obliga a §3.3 a escribir la excepción a la ' +
        'regla de remisión, y su población es el conteo de fragmentos de esa celda',
    },
  ];
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
  /**
   * Un domicilio que termina en espacio es un PREFIJO: `### 0.6 ` domicilia por
   * el número del H3 y no por su título. El resto se compara exacto, como antes.
   * La unicidad se exige igual en los dos casos, así que el prefijo no reabre la
   * puerta del chequeo truncable: si dos H3 empiezan igual, el chequeo no corre
   * y lo dice.
   */
  const porPrefijo = etiqueta.endsWith(' ');
  const indices: number[] = [];
  lineas.forEach((l, k) => {
    const t = l.trim();
    if (porPrefijo ? t.startsWith(etiqueta) : t === etiqueta) indices.push(k);
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
 * Una negación castellana pegada a lo que sigue: el adverbio y después, como
 * mucho, cuarenta caracteres sin cruzar un límite de cláusula. El corte contra
 * `.;:` es lo que impide que la negación de la oración anterior alcance a esta
 * —«el disparador **no** es un cambio de gobierno**:** alcanza con un mal año»
 * es afirmativa del lado derecho de los dos puntos, y tiene que seguir contando.
 */
/**
 * **El nexo CAUSAL corta, y la Task 9 lo encontró rompiendo.** Con el default
 * invertido, la aserción «este PLAN le declinó el Fondo de Garantía de
 * Sustentabilidad» salía roja sobre texto correcto: vive adentro de
 * «**PLAN24CN** no es arista **porque** este PLAN le declinó el FGS», y el «no»
 * niega «es arista», no «le declinó». Lo que sigue a un causal es una cláusula
 * nueva con polaridad propia: la razón que se da de una negación es una
 * afirmación. Sin este corte, cualquier aserción afirmativa que aparezca como
 * fundamento de una negación queda marcada como negada y el chequeo pide
 * reescribir una frase honesta, que es el error que este archivo ya cometió dos
 * veces por el otro lado.
 *
 * Es el mismo recurso que el prohibido del gate ya usa con `y|pero|aunque|sino|
 * mas`, acá con los causales. **Medido antes de darlo por bueno:** con el corte
 * puesto, las 113 aserciones y las 42 cifras siguen pasando y la única que
 * cambia de lado es la que el corte existe para arreglar.
 */
const NEXO_CAUSAL = String.raw`\b(?:porque|ya que|dado que|puesto que|debido a que)\b`;
const NEGACION_PEGADA = new RegExp(
  String.raw`(?:^|[^\p{L}])(?:no|nunca|jamás|tampoco|ni|deja de|dejó de)(?![\p{L}])(?:(?!${NEXO_CAUSAL})[^.;:\n]){0,40}$`,
  'iu',
);

/** Ocurrencias del literal que NO vienen precedidas por una negación. */
function contarSinNegacion(texto: string, valor: string): number {
  let cuantas = 0;
  let desde = 0;
  for (;;) {
    const i = texto.indexOf(valor, desde);
    if (i === -1) return cuantas;
    if (!NEGACION_PEGADA.test(texto.slice(Math.max(0, i - 60), i))) cuantas++;
    desde = i + valor.length;
  }
}

/**
 * El texto de un domicilio SIN sus encabezados ni sus filas de tabla. Ver R-5
 * en `verificarValoresConDomicilio()`: un valor que vive en un título se cubre
 * a sí mismo, y retitular un H3 —operación normal— rompería el conteo.
 */
function soloProsa(texto: string): string {
  return texto
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('#') && !esFilaDeTabla(l))
    .join('\n');
}

/**
 * **Una frase derivada de una tabla se busca con bordes de palabra, no con
 * `includes()`.** Encontrado rompiendo, y es la novena forma del arquetipo:
 * cambiar la confianza de una fila de `media` a `alta` hacía que la frase
 * derivada pasara de «ninguna de confianza alta» a «una de confianza alta»…
 * que es **subcadena de la anterior** —«ning*una de confianza alta*»—, así que
 * el documento sin tocar seguía satisfaciendo la frase nueva y la mutación
 * salía **exit 0**. El chequeo que existe para atrapar una fila estrenada se
 * cubría a sí mismo por accidente ortográfico.
 *
 * El mismo riesgo lo tienen las frases del Calendario —«un ocupante» adentro de
 * «algun ocupante», «dos documentos» adentro de «ciendos documentos»— así que
 * los dos juegos pasan por acá. Los bordes son de LETRA, no `\b`: `\b` no
 * entiende que la `ñ` de «años» o la `é` de «régimen» son letras.
 */
function dice(texto: string, frase: string): boolean {
  const escapada = frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<!\\p{L})${escapada}(?!\\p{L})`, 'u').test(texto);
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
 *
 * ── R-5: `veces: N` cuenta OCURRENCIAS, y lo que hacía falta era LA ocurrencia ─
 *
 * El cierre por `veces: 2` de la declaración de `:548` tapaba el caso y dejaba
 * la clase abierta en las dos direcciones, y las dos se midieron:
 *
 * - **Falso negativo:** borrar la declaración y escribir la frase una vez más
 *   en cualquier lugar de §5 sale **exit 0**. Con una de las dos ocurrencias
 *   viviendo en el TÍTULO del H3 5.4, alcanza una repetición casual de cinco
 *   palabras para tapar el borrado.
 * - **Falso positivo esperando:** si una tarea futura retitula el H3 5.4
 *   —operación normal— el conteo cae a 1 y la guardia se pone roja con la
 *   declaración intacta.
 *
 * **El arreglo es estructural y no por entrada: se descuentan del domicilio las
 * líneas de encabezado y las de tabla antes de contar.** Un título nombra el
 * criterio; la prosa es la que lo declara, y es la prosa la que este juego
 * existe para custodiar. Medido sobre los 43 valores domiciliados: con la
 * exclusión puesta, los 43 siguen pasando sobre prosa sola —salvo el que la
 * exclusión existe para destapar, que vuelve a `veces: 1`—, así que el cambio
 * elimina la clase entera en vez del caso.
 */
function verificarValoresConDomicilio(
  lineas: string[],
  lista: ValorConDomicilio[],
  clase: string,
): string[] {
  const errores: string[] = [];
  for (const { valor, en, veces, esFraseNegativa, porQue } of lista) {
    const minimo = veces ?? 1;
    for (const etiqueta of en) {
      const { texto, errores: errDom } = textoDeDomicilio(lineas, etiqueta);
      errores.push(...errDom);
      if (texto === null) continue;
      const prosa = soloProsa(texto);
      const crudas = contar(prosa, valor);
      const afirmativas = contarSinNegacion(prosa, valor);
      const hay = esFraseNegativa === true ? crudas : afirmativas;
      if (hay < minimo) {
        errores.push(
          `${clase} «${valor}»: se esperaba${minimo > 1 ? `n ${String(minimo)} ocurrencias` : ''} en ` +
            `«${etiqueta}» y hay ${String(hay)}${esFraseNegativa === true ? '' : ' sin una negación adelante'}` +
            `${esFraseNegativa === true || crudas === 0 ? '' : ` (${String(crudas)} contando las negadas: si el literal ya es una frase negativa marcá \`esFraseNegativa: true\` y decí por qué; si no, el documento la está negando)`} — ${porQue}`,
        );
      }
      /**
       * **El opt-out se audita solo.** Una marca de más no rompe nada visible y
       * por eso nadie la revisa: la aserción sigue verde y deja de estar
       * protegida contra la negación. Si hay una ocurrencia afirmativa, la
       * marca sobra y la guardia lo dice — es la única forma de encontrar el
       * agujero sin acordarse de que existe.
       */
      if (esFraseNegativa === true && afirmativas >= minimo) {
        errores.push(
          `${clase} «${valor}»: está marcada \`esFraseNegativa: true\` y en «${etiqueta}» tiene ` +
            `${String(afirmativas)} ocurrencia(s) SIN negación adelante, así que la marca sobra y ` +
            `apaga el chequeo de negación para esta entrada. Sacala — ${porQue}`,
        );
      }
    }
  }
  return errores;
}

/**
 * **La anatomía de una sección cualquiera: cuántos H3 numerados tiene y si van
 * correlativos.** Generaliza a las secciones de la Task 7 el chequeo que la
 * SECCIÓN 0 tenía sola. Sin esto, borrar la Casa de Arco entera —o la
 * subsección del PAMI, que es la única de la SECCIÓN 8 que dice lo que la
 * agencia NO hace— deja el H2 en su lugar, el orden intacto y la guardia verde:
 * el conteo de líneas baja y nadie mira el conteo de líneas.
 *
 * Se verifica sobre el TRAMO de la sección y no sobre el documento entero, así
 * que un `### 7.1` plantado en otra sección no cubre el que falta acá.
 */
function verificarSubsecciones(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const { h2, prefijo, cuantas, porQue } of SUBSECCIONES_ESPERADAS) {
    const { tramo, errores: errTramo } = tramoDeSeccion(lineas, h2);
    errores.push(...errTramo);
    if (tramo === null) continue;

    const numeros: string[] = [];
    const re = new RegExp(`^### ${prefijo}\\.(\\d+) \\S`);
    for (const l of tramo) {
      const m = re.exec(l.trim());
      if (m?.[1] !== undefined) numeros.push(m[1]);
    }

    if (numeros.length !== cuantas) {
      errores.push(
        `«${h2}» tiene ${String(numeros.length)} subsección(es) con forma «### ${prefijo}.N {título}» ` +
          `y se esperaban ${String(cuantas)} — ${porQue}`,
      );
    }
    numeros.forEach((n, k) => {
      if (n !== String(k + 1)) {
        errores.push(
          `«${h2}»: la subsección número ${String(k + 1)} está numerada «${prefijo}.${n}» — la ` +
            'numeración tiene que ser correlativa, o dos H3 con el mismo número dan el conteo justo',
        );
      }
    });
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

/**
 * Las seis dependencias `requires` de naturaleza CRITICAL que la INTEGRACIÓN
 * tiene que emitir, cada una con su modo degradado **en su propio párrafo**.
 *
 * **Arreglo de la mutación M16, y es la misma lección que este archivo lleva
 * anotada cuatro veces: la unidad del chequeo tiene que coincidir con la unidad
 * verificada.** La aserción `modo degradado` con `veces: 7` cuenta ocurrencias
 * en la sección entera, así que las siete se compensan entre sí: borrarle el
 * modo degradado a PLANREP dejaba siete en el resto del texto y salía **exit
 * 0**, con una dependencia crítica anunciada y sin contestar. El párrafo es la
 * unidad real —una arista, un párrafo— y acá se verifica ahí.
 *
 * El conteo grueso se deja igual: atrapa el caso de que alguien borre dos y
 * reescriba uno, y el fino atrapa el de que borre el que le molesta.
 */
const ARISTAS_CRITICAS = ['PLANCUIDADO', 'PLANMON', 'PLANTER', 'PLANDIG', 'PLANSAL', 'PLANREP'];

function verificarAristasCriticas(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(lineas, H2_INTEGRACION);
  if (tramo === null) return errores;

  for (const code of ARISTAS_CRITICAS) {
    const parrafos = tramo.filter((l) => l.trimStart().startsWith(`**${code}**`));
    if (parrafos.length !== 1) {
      errores.push(
        `la INTEGRACIÓN tiene ${String(parrafos.length)} párrafo(s) que abran con «**${code}**» y ` +
          'tiene que haber uno: PLANARCO declara seis dependencias críticas y cada una lleva su ' +
          'párrafo. Sin ancla única, el modo degradado no se puede verificar contra la arista',
      );
      continue;
    }
    if (!parrafos[0].includes('modo degradado')) {
      errores.push(
        `la arista crítica con ${code} no declara su modo degradado en su propio párrafo. La spec ` +
          'obliga a que cada PLAN nuevo lo escriba, y una dependencia crítica sin él es un punto de ' +
          'falla que el documento anuncia y no contesta',
      );
    }
  }

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// Los seis léxicos de §9.3 y las citas textuales: lo que el documento afirma
// SOBRE EL CORPUS, verificado abriendo el corpus.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **La búsqueda bajo seis léxicos es la evidencia de C-6, y el documento la
 * reportaba sin que nadie la repitiera.** Encontrado por mutación propia: «cero
 * ocurrencias cada una en el taller» → «dos ocurrencias», y «es por invalidez,
 * no por vejez» → «es por vejez, no por invalidez», las dos **VERDES**. Son
 * afirmaciones sobre archivos que están en el repositorio: el documento cuenta
 * lo que buscó, y contarlo mal es exactamente el modo de falla que la regla de
 * las dieciséis víctimas existe para cerrar.
 *
 * Se rehace la búsqueda acá y se cruza contra lo que el párrafo declara. Lo que
 * NO se automatiza va dicho: el conteo de «moratoria» —cinco pasajes— no es
 * mecánico, porque el corpus usa la palabra en tres sentidos (previsional en
 * PLANCUIDADO y PLANMON, loteo en `PLANVIV:1277`, vehículos autónomos en
 * PLANMOV) y separarlos pide una taxonomía que la guardia tendría que inventar.
 * Los cinco pasajes previsionales están verificados a mano —`PLANCUIDADO:158`,
 * `PLANMON:238`, `:248`, `:1541`, `:1573`— y acá solo se custodia que el número
 * escrito no derive.
 */
const LEXICOS_SIN_OCURRENCIA = /\b(?:PUAM|PNC)\b/u;
const LEXICO_NO_CONTRIBUTIVO = /no contributiv/iu;

function verificarLosSeisLexicos(lineas: string[]): string[] {
  const errores: string[] = [];
  const { texto, errores: errDom } = textoDeDomicilio(lineas, H3_TRES_COLUMNAS);
  errores.push(...errDom);
  if (texto === null) return errores;
  const prosa = soloProsa(texto).replace(/\*\*/g, '');

  const taller = archivosDelTaller();
  if (taller === null) {
    errores.push(
      '§9.3 declara qué encontró bajo seis léxicos y la guardia no puede abrir el taller para ' +
        'repetir la búsqueda. Sin eso, la evidencia de C-6 es un reporte que nadie rehizo',
    );
    return errores;
  }

  // (1) Las dos siglas: cero ocurrencias, y el documento tiene que decir cero.
  let conSigla = 0;
  for (const [, cuerpo] of taller) {
    for (const l of cuerpo) if (LEXICOS_SIN_OCURRENCIA.test(l)) conSigla++;
  }
  const cero = `${enLetras(conSigla)} ocurrencias`;
  if (!traeCifra(prosa, cero)) {
    errores.push(
      `§9.3 no dice «${cero}» para las dos siglas de partida y el taller tiene ${String(conSigla)} ` +
        'línea(s) que las nombran. Es la mitad negativa de C-6: si el número deja de ser cero, lo ' +
        'que hay que cambiar no es el adjetivo sino la decisión de no escribirlas',
    );
  }

  // (2) La pensión no contributiva: una sola aparición y es por invalidez.
  /**
   * El contexto se recorta a ±90 caracteres alrededor de la ocurrencia y no a la
   * línea: en este corpus la línea es el PÁRRAFO —`PLANCUIDADO:94` tiene miles de
   * caracteres— y buscar «vejez» en el párrafo entero lo encuentra siempre, con
   * lo que el chequeo se ponía rojo sobre el documento correcto. Es la misma
   * lección que este archivo lleva anotada cinco veces: la unidad del chequeo
   * tiene que coincidir con la unidad verificada, y acá la unidad es el sintagma.
   */
  const noContributivas: string[] = [];
  for (const [doc, cuerpo] of taller) {
    for (const l of cuerpo) {
      const m = LEXICO_NO_CONTRIBUTIVO.exec(l);
      if (m === null) continue;
      noContributivas.push(`${doc}: ${l.slice(Math.max(0, m.index - 90), m.index + 90)}`);
    }
  }
  if (noContributivas.length !== 1) {
    errores.push(
      `§9.3 declara UNA sola aparición de la pensión no contributiva en el taller y hay ` +
        `${String(noContributivas.length)}. El diagnóstico de la columna del medio cuelga de ese ` +
        'conteo: con dos apariciones, «una sola» es falso y puede que la segunda sí sea por vejez',
    );
  } else if (!/invalidez/iu.test(noContributivas[0]) || /vejez/iu.test(noContributivas[0])) {
    errores.push(
      'la única pensión no contributiva del taller ya no es la de invalidez, y §9.3 afirma que lo ' +
        'es. Si aparece una por vejez, la columna del medio deja de estar vacía por falta de dato y ' +
        'pasa a estar vacía por omisión',
    );
  }
  if (!dice(prosa, 'por invalidez, no por vejez')) {
    errores.push(
      '§9.3 no declara que la única pensión no contributiva del corpus es por INVALIDEZ y no por ' +
        'vejez. Invertido, el párrafo dice que el corpus tiene el dato de vejez que la tabla ' +
        'declara faltante, y la tabla y su justificación se contradicen sin que ningún número cambie',
    );
  }

  /**
   * (3) **El universo de 65+, cruzado contra la línea de la que sale.** Mutado a
   * «más de quince millones» la guardia salía verde: es el único número de gente
   * del párrafo, y es el que multiplicado por el mínimo «estrenaría el padrón».
   * El ancla ya se resolvía —la línea existe— pero resolver un ancla no verifica
   * la magnitud que se le atribuye, que es la misma lección que las citas
   * textuales. Se compara la frase contra `PLANSAL:1173`, que dice «Hay más de
   * cinco millones de personas mayores de 65 años en este país».
   */
  const universo = /El corpus cuenta (más de \p{L}+ millones)/u.exec(prosa);
  const planSal = lineasDelPlan('PLANSAL');
  if (universo === null) {
    errores.push(
      '§9.3 no declara cuántas personas de sesenta y cinco o más cuenta el corpus, y es el número ' +
        'que sostiene «multiplicar por el mínimo no estrena el precio: estrena el padrón»',
    );
  } else if (planSal === null) {
    errores.push('la guardia no puede abrir PLANSAL para cruzar el universo de sesenta y cinco o más');
  } else if (!(planSal[1172] ?? '').includes(universo[1])) {
    errores.push(
      `§9.3 dice «${universo[1]}» de personas de sesenta y cinco o más y PLANSAL:1173, que es su ` +
        'fuente, no dice eso. El ancla resuelve porque la línea existe; la magnitud que se le ' +
        'atribuye es otra afirmación y hasta acá no la cruzaba nadie',
    );
  }

  // (4) El unitario y el padrón: los dos conteos que el párrafo siguiente usa.
  if (!dice(prosa, 'cinco pasajes')) {
    errores.push(
      '§9.3 no declara cuántos pasajes de «moratoria» trae el corpus. Verificados a mano: cinco, ' +
        'previsionales, todos diagnóstico y ninguno con monto (PLANCUIDADO:158, PLANMON:238, :248, ' +
        ':1541, :1573). El conteo no es mecánico —el corpus usa la palabra en tres sentidos— y por ' +
        'eso al menos no puede derivar en silencio',
    );
  }

  return errores;
}

/**
 * **El TALLER, que es lo que el documento dice haber buscado: los `.md` de
 * primer nivel de `Iniciativas Estratégicas/`.** Se excluye PLANARCO —un
 * documento no puede ser evidencia de sí mismo— y se excluye el subdirectorio
 * `diagnostico/`, que reproduce líneas enteras de los PLANes y duplicaría cada
 * conteo. **La spec queda afuera a propósito y es importante:** `spec:171` sí
 * nombra PUAM y PNC, y es justamente el papel que este documento se negó a
 * copiar. Contarla como taller volvería falso el «cero ocurrencias» que la
 * SECCIÓN 9 declara con razón.
 */
function archivosDelTaller(): [string, string[]][] | null {
  const dir = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
  const salida: [string, string[]][] = [];
  try {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md') || f.startsWith('PLANARCO')) continue;
      salida.push([f, readFileSync(resolve(dir, f), 'utf8').split('\n')]);
    }
  } catch {
    return null;
  }
  return salida.length === 0 ? null : salida;
}

/**
 * **Las citas textuales de otro documento, abiertas contra su línea.** Las
 * anclas de la prosa ya se resuelven una por una, pero resolver un ancla prueba
 * que la LÍNEA existe, no que diga lo que el documento pone entre comillas.
 * Encontrado por mutación propia: alterar la cita de `PLANPACTO:375` de «se
 * ajusta solo EN CONTRA del que el piso protege» a «A FAVOR» —que da vuelta el
 * argumento entero de §9.4— salía **VERDE**, igual que dar vuelta el permiso de
 * `PLANPACTO:369` del que cuelga toda la §9.2.
 *
 * Son las dos citas de las que la SECCIÓN 9 hace depender un argumento ajeno, y
 * las dos son la clase más barata de falsificar: comillas alrededor de una
 * paráfrasis conveniente. Se comparan contra el archivo destino, normalizando
 * comillas y espacios, y si el archivo cambia la guardia **no corre y lo dice**.
 */
const CITAS_TEXTUALES: { cita: string; doc: string; linea: number; porQue: string }[] = [
  {
    cita: 'quien las reemplace rehace la división sin tocar nada más',
    doc: 'PLANPACTO',
    linea: 369,
    porQue:
      'el permiso del que cuelga §9.2 entera. Sin la obligación de rehacer la división, el reemplazo ' +
      'del 0,60 por cero pasa a ser gratis y la subsección se queda con la mitad barata',
  },
  {
    cita: 'se ajusta solo en contra del que el piso protege',
    doc: 'PLANPACTO',
    linea: 375,
    porQue:
      'el argumento ajeno con el que §9.4 contesta la ausencia de piso. Dado vuelta —«a favor»— la ' +
      'subsección pasa a decir que un piso en porcentaje del PBI protege en recesión, que es lo ' +
      'contrario de lo que el documento anterior escribió contra su propio corpus',
  },
];

function verificarCitasTextuales(lineas: string[]): string[] {
  const errores: string[] = [];
  const normalizar = (s: string): string =>
    s.replace(/[«»""'']/gu, '"').replace(/\*/gu, '').replace(/\s+/gu, ' ').trim();
  const documento = normalizar(lineas.join('\n'));

  for (const { cita, doc, linea, porQue } of CITAS_TEXTUALES) {
    const destino = lineasDelPlan(doc);
    if (destino === null) {
      errores.push(`la guardia no puede abrir ${doc} para verificar la cita «${cita.slice(0, 50)}…»`);
      continue;
    }
    const enElOtro = normalizar(destino[linea - 1] ?? '');
    if (!enElOtro.includes(normalizar(cita))) {
      errores.push(
        `la cita «${cita}» NO está en ${doc}:${String(linea)}. O el otro documento cambió —y entonces ` +
          'se actualiza acá, a mano y mirando qué dice ahora— o esta cita es una paráfrasis ' +
          `conveniente entre comillas. ${porQue}`,
      );
      continue;
    }
    if (!documento.includes(normalizar(cita))) {
      errores.push(
        `PLANARCO dejó de citar textualmente «${cita}» (${doc}:${String(linea)}) — ${porQue}`,
      );
    }
  }
  return errores;
}

/**
 * ── LA LISTA DE CITAS SE DESCUBRE SOLA (Task 9) ───────────────────────────────
 *
 * `CITAS_TEXTUALES`, de arriba, es una lista opt-in mantenida a mano, y se llenó
 * **donde cayeron las mutaciones de la última vuelta**: quedó en **dos** entradas
 * mientras el documento lleva **sesenta y ocho** citas de quince caracteres o
 * más y **veintiocho** comparten oración con un ancla. Las otras veintiséis no
 * las miraba nadie. Medido: `PLANCUL:421` —«PLANJUB les da dignidad
 * **económica**»— cambiada a «**simbólica**» salía **verde**, y esa cita es la
 * prueba de §0.6 de que los Granaderos tienen caja prestada de un PLAN que no
 * existe, o sea la premisa de la sucesión entera que este documento declara.
 *
 * El arreglo no es alargar la lista: es **la doctrina que las anclas ya usan**,
 * que son el único chequeo del tramo que no volvió a fallar. Toda `«…»` de
 * quince caracteres o más que comparta ORACIÓN con un ancla se abre contra el
 * tramo que el ancla nombra y se cruza. Lo que la guardia no puede resolver se
 * **reporta**, no se descarta: un descarte silencioso vuelve a poner el
 * formato que la guardia no conoce como la manera más barata de sacarle una
 * cita a la verificación.
 *
 * **Qué queda afuera, dicho para que nadie lo suponga adentro:** las citas sin
 * ancla en su oración —las cuarenta restantes, que en su mayoría son palabras
 * del propio PLANARCO entre comillas— y la dirección inversa (que la cita SIGA
 * escrita), que es lo que las dos entradas a mano de `CITAS_TEXTUALES` custodian
 * y por eso no se borran.
 *
 * **El ancla de una fila de tabla arrastra el encabezado de su tabla**, y no es
 * una concesión: `PLANREP:2261` es la fila «Jubilaciones mínimas | ~USD 250/mes»
 * y el documento cita, en la misma oración, el título de la columna —«Monto
 * Aproximado»— que vive cinco líneas más arriba. Un lector que abre esa fila ve
 * la tabla; la guardia tiene que ver lo mismo o pone en rojo una cita correcta.
 */
const LARGO_MINIMO_DE_CITA = 15;

/**
 * **La `«…»` que no es una cita sino un LÉXICO, y hay que distinguirla o el
 * chequeo pide que exista lo que el documento declara inexistente.** §7.4 y §9.3
 * enumeran los términos con los que buscaron antes de declarar un hueco
 * —«cremación», «inhumación» y «donación de órganos» **dan cero**— y los
 * escriben entre comillas, que es la convención del corpus para mencionar una
 * palabra en vez de usarla. Compartir oración con un ancla es normal ahí: la
 * oración dice a la vez qué no encontró y qué sí.
 *
 * El discriminante es local y va a la DERECHA de la comilla de cierre, después
 * de saltear los demás términos de la enumeración: el verbo de conteo. No se
 * usa «no existe» ni nada tan ancho a propósito —eximiría media sección—: solo
 * las formas exactas con las que este documento declara un resultado de
 * búsqueda. Y las salteadas **se cuentan y se informan** en el titular, que es
 * la diferencia entre reportar y descartar.
 */
/**
 * **LA DECLARACIÓN DEJÓ DE SER UN PERMISO Y PASÓ A SER UNA OBLIGACIÓN** (I-2).
 *
 * Hasta la revisión, reconocer una de estas fórmulas a la derecha de la comilla
 * **salteaba** la cita, y con eso la puerta quedaba abierta en la dirección
 * peor: cualquier `«…»` se sacaba de la verificación agregándole cuatro
 * palabras. Medido:
 *
 *     «`BLINDAJE:44` dice «No lo cerraron — lo enterraron», y dan cero.»
 *                                                            → exit 0
 *
 * (el texto real de `BLINDAJE:44` es «lo **asfixiaron**».) La duda #4 del reporte
 * contemplaba el falso positivo; el falso negativo es peor y es este.
 *
 * **La versión descubierta ya estaba en este archivo:**
 * `verificarLosSeisLexicos()` rehace contra el corpus lo que el documento afirma
 * sobre el corpus. Así que la `«…»` no se saltea: **se rutea ahí**. La fórmula
 * declara un RESULTADO DE BÚSQUEDA y la guardia lo repite sobre el taller —los
 * mismos archivos que §9.3 dice haber abierto— y exige que dé lo declarado. El
 * cero tiene que ser cero de verdad, la aparición única tiene que ser una, y el
 * «sí devuelve un número» tiene que devolver algo.
 *
 * **Y el cero cierra la puerta del ancla.** Una búsqueda que da cero no puede
 * ser, al mismo tiempo, lo que la línea que la oración ancla dice: si tres
 * palabras seguidas del término aparecen adentro del tramo anclado, eso no es un
 * léxico buscado sino una cita alterada, que es exactamente el ataque de arriba.
 * «No lo cerraron» está en `BLINDAJE:44`, así que la inserción sale **roja**.
 *
 * El umbral de 15 caracteres NO se aplica acá: una declaración de búsqueda se
 * verifica aunque el término sea corto, y con eso entran también «cremación» y
 * «inhumación», que hasta hoy no las miraba nadie por ser de nueve y diez
 * caracteres. **Ensanchar esta lista ya no afloja nada**: cada fórmula nueva
 * agrega una afirmación verificada en vez de una exención.
 */
type DeclaracionDeBusqueda = { fuente: string; min: number; max: number };

const FORMULAS_DE_BUSQUEDA: { patron: RegExp; min: number; max: number }[] = [
  { patron: /^[:\s,y]*(?:dan? cero|cero ocurrencias|no devuelve)/iu, min: 0, max: 0 },
  { patron: /^[:\s,y]*una sola aparición/iu, min: 1, max: 1 },
  { patron: /^[:\s,y]*sí devuelve un número/iu, min: 1, max: Number.POSITIVE_INFINITY },
];

const CUANTIFICADORES = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco'];
const CUENTA_A_LA_DERECHA = new RegExp(
  `^[:\\s,y]*(${CUANTIFICADORES.join('|')}) (?:pasajes|apariciones|ocurrencias)`,
  'iu',
);

function declaracionDeBusqueda(derecha: string): DeclaracionDeBusqueda | null {
  for (const { patron, min, max } of FORMULAS_DE_BUSQUEDA) {
    const m = patron.exec(derecha);
    if (m !== null) return { fuente: m[0].trim(), min, max };
  }
  const c = CUENTA_A_LA_DERECHA.exec(derecha);
  if (c !== null) {
    const n = CUANTIFICADORES.indexOf(c[1].toLowerCase());
    return { fuente: c[0].trim(), min: n, max: n };
  }
  return null;
}

/**
 * **El lema pobre con el que se cuenta.** El corpus escribe en plural lo que el
 * documento busca en singular —`PLANCUIDADO:94` dice «pensiones no
 * contributivas» y §9.3 declara «una sola aparición» de «Pensión no
 * contributiva»— así que una comparación literal daría cero y pondría en rojo la
 * afirmación correcta. Se sacan tildes y se corta la marca de plural cuando lo
 * que queda tiene cuerpo (≥4 caracteres), que es lo justo para que «jubilaciones
 * mínimas» y «jubilación mínima» sean el mismo término y «mes» siga siendo mes.
 */
function lema(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => {
      const sinEs = w.slice(0, -2);
      if (w.endsWith('es') && sinEs.length >= 4) return sinEs;
      const sinS = w.slice(0, -1);
      if (w.endsWith('s') && sinS.length >= 4) return sinS;
      return w;
    })
    .join(' ');
}

/** El taller entero lematizado, una sola vez: se busca sobre esto. */
let TALLER_LEMATIZADO: string | null = null;
function tallerLematizado(): string | null {
  if (TALLER_LEMATIZADO !== null) return TALLER_LEMATIZADO;
  const taller = archivosDelTaller();
  if (taller === null) return null;
  TALLER_LEMATIZADO = ` ${taller.map(([, cuerpo]) => lema(cuerpo.join(' '))).join(' ')} `;
  return TALLER_LEMATIZADO;
}

function cuantasVeces(donde: string, que: string): number {
  if (que.length === 0) return 0;
  let n = 0;
  let i = donde.indexOf(que);
  while (i !== -1) {
    n += 1;
    i = donde.indexOf(que, i + que.length);
  }
  return n;
}

/**
 * La `«…»` que el documento declara como resultado de búsqueda, rehecha contra
 * el taller. Devuelve los errores; el conteo lo lleva el llamador.
 */
function verificarLexicoDeclarado(
  nLinea: number,
  termino: string,
  decl: DeclaracionDeBusqueda,
  anclas: AnclaResuelta[],
): string[] {
  const errores: string[] = [];
  const corpus = tallerLematizado();
  if (corpus === null) {
    return [
      `línea ${String(nLinea)}: «${termino.slice(0, 40)}» se declara resultado de búsqueda ` +
        `(«${decl.fuente}») y la guardia no puede abrir el taller para repetirla. Una búsqueda que ` +
        'nadie rehace es un reporte, no evidencia',
    ];
  }
  const buscado = lema(termino);
  const veces = cuantasVeces(corpus, ` ${buscado} `);
  if (veces < decl.min || veces > decl.max) {
    const esperado =
      decl.max === Number.POSITIVE_INFINITY ? `al menos ${String(decl.min)}` : String(decl.min);
    errores.push(
      `línea ${String(nLinea)}: el documento declara «${decl.fuente}» sobre «${termino.slice(0, 40)}» ` +
        `y el taller devuelve ${String(veces)} ocurrencia(s), no ${esperado}. Es una afirmación sobre ` +
        'archivos que están en el repositorio: contarla mal es el modo de falla que la regla de las ' +
        'dieciséis víctimas existe para cerrar',
    );
  }
  if (decl.max === 0) {
    const palabras = buscado.split(' ').filter((p) => p.length > 0);
    for (let i = 0; i + 3 <= palabras.length; i++) {
      const corrida = palabras.slice(i, i + 3).join(' ');
      for (const a of anclas) {
        if (a.desde === 0) continue;
        const ls = lineasDelPlan(a.doc);
        if (ls === null) continue;
        if (!lema(tramoDelAncla(ls, a.desde, a.hasta)).includes(corrida)) continue;
        errores.push(
          `línea ${String(nLinea)}: «${termino.slice(0, 60)}» se declara sin ocurrencias en el corpus ` +
            `(«${decl.fuente}») y comparte las tres palabras «${corrida}» con «${a.etiqueta}», que es ` +
            'un ancla de su propia oración. Un léxico buscado no es un calco alterado de la línea que ' +
            'el documento ancla al lado: o es una cita —y entonces se abre contra su tramo y tiene ' +
            'que estar entera— o no se le cuelga un ancla que la desmiente',
        );
        break;
      }
    }
  }
  return errores;
}

/**
 * ── EL RESOLVEDOR DE ANCLAS, COMPARTIDO ───────────────────────────────────────
 *
 * Vivía adentro de `verificarCitasDescubiertas()` y era el único lugar del
 * archivo que sabía leer las tres formas de ancla de la prosa —`PLAN §N.N`,
 * `PLAN:NNN`, y la remisión corta `:NNN` que hereda el documento de la anterior—
 * y abrir el tramo que nombran. La Task 9 bis lo saca afuera porque hay dos
 * chequeos más que necesitan **exactamente lo mismo**: la exención del sustraendo
 * (I-1) y el cruce de magnitudes de §10–§12 (M-1, M-2). Duplicarlo era tener
 * tres lectores de anclas desincronizados, que es la forma en que un formato
 * nuevo se vuelve la manera barata de sacarle una cita a la verificación.
 */
type AnclaResuelta = { etiqueta: string; doc: string; desde: number; hasta: number };

function resolverAnclas(tokens: string[]): AnclaResuelta[] {
  const anclas: AnclaResuelta[] = [];
  let ultimo: string | null = null;
  for (const txt of tokens) {
    const s = ANCLA_PROSA_SECCION.exec(txt);
    if (s) {
      if (lineasDelPlan(s[1]) !== null) {
        anclas.push({ etiqueta: txt, doc: s[1], desde: 0, hasta: 0 });
        ultimo = s[1];
      }
      continue;
    }
    const l = ANCLA_PROSA_LINEA.exec(txt);
    if (l) {
      if (lineasDelPlan(l[1]) !== null) {
        const desde = Number(l[2]);
        anclas.push({ etiqueta: txt, doc: l[1], desde, hasta: l[3] === undefined ? desde : Number(l[3]) });
        ultimo = l[1];
      }
      continue;
    }
    const c = ANCLA_PROSA_CORTA.exec(txt);
    if (c && ultimo !== null) {
      const desde = Number(c[1]);
      anclas.push({
        etiqueta: `${ultimo}${txt}`,
        doc: ultimo,
        desde,
        hasta: c[2] === undefined ? desde : Number(c[2]),
      });
    }
  }
  return anclas;
}

/** Las anclas de un tramo de texto plano, en el orden en que están escritas. */
function anclasDeUnTexto(texto: string): AnclaResuelta[] {
  return resolverAnclas([...texto.matchAll(/`([^`\n]+)`/g)].map((m) => m[1].trim()));
}

/**
 * **UNA MAGNITUD AJENA SE DECLARA ABRIÉNDOLA, NO NOMBRANDO AL DUEÑO** (I-1).
 *
 * `MONTO_AJENO_DECLARADO` —la exención que la Task 9 le puso al sustraendo— era
 * una lista de tres fórmulas escritas a mano («no los de este PLAN», «no esta
 * sección», «gasto sustituido de PLANXXX»), y el propio reporte la dejó anotada
 * como duda porque es exactamente la clase de cosa que la directiva de guardia
 * critica. Medido por la revisión, la lista se explota escribiendo la fórmula
 * sin el monto ajeno detrás:
 *
 *     «El gasto sustituido de este PLAN son USD 900M por año, y el detalle no
 *      esta sección.»                                             → exit 0
 *
 * La versión descubierta no es una lista: **la magnitud tiene que estar anclada
 * y abierta contra la línea del PLAN al que se le atribuye.** El resolvedor de
 * anclas ya existe y `tramoDelAncla()` ya sabe abrir el destino, así que la
 * exención pasa a ser un CRUCE: si la oración dice `PLANCUIDADO:564` y el monto
 * está en esa línea, el monto es de otro y se puede escribir; si no hay ancla, o
 * la hay y el número no está ahí, la exención no corre y la prohibición se
 * aplica. La frase inventada de arriba no tiene ancla que sostenga los USD 900M
 * y sale **roja** por donde antes salía verde.
 *
 * Se comparan los GRUPOS DE DÍGITOS y no la cadena entera a propósito: el
 * documento escribe `USD 1.800–2.400M` y el destino es una celda de tabla que
 * dice `| 1.800-2.400 |`. Exigir el formato sería exigir que el otro documento
 * escriba como este.
 */
function gruposDeDigitos(s: string): string[] {
  return [...s.matchAll(/\d[\d.]*\d|\d/gu)].map((m) => m[0]);
}

function magnitudAbiertaEnSuAncla(ambito: string, magnitud: string): boolean {
  const grupos = gruposDeDigitos(magnitud);
  if (grupos.length === 0) return false;
  return anclasDeUnTexto(ambito)
    .filter((a) => a.desde > 0)
    .some((a) => {
      const ls = lineasDelPlan(a.doc);
      if (ls === null) return false;
      const tramo = tramoDelAncla(ls, a.desde, a.hasta);
      return grupos.every((g) => tramo.includes(g));
    });
}

/** Toda magnitud de plata del match, abierta contra alguna ancla de su oración. */
function magnitudesDelMatchAbiertas(ambito: string, match: string): boolean {
  const magnitudes = [...match.matchAll(new RegExp(MAGNITUD_DE_PLATA, 'gu'))].map((m) => m[0]);
  if (magnitudes.length === 0) return false;
  return magnitudes.every((mag) => magnitudAbiertaEnSuAncla(ambito, mag));
}

/** El tramo que un ancla nombra: sus líneas, más el encabezado si es fila de tabla. */
function tramoDelAncla(ls: string[], desde: number, hasta: number): string {
  if (desde === 0) return ls.join('\n');
  let ini = desde;
  if (esFilaDeTabla(ls[desde - 1] ?? '')) {
    while (ini > 1 && esFilaDeTabla(ls[ini - 2] ?? '')) ini--;
  }
  return ls.slice(ini - 1, hasta).join('\n');
}

function verificarCitasDescubiertas(lineas: string[]): {
  errores: string[];
  cruzadas: number;
  lexicos: number;
} {
  const errores: string[] = [];
  let cruzadas = 0;
  let lexicos = 0;
  const normalizar = (s: string): string =>
    s.replace(/[«»""'']/gu, '"').replace(/[*`]/gu, '').replace(/\s+/gu, ' ').toLowerCase().trim();
  /**
   * **La elisión se respeta.** El corpus cita con puntos suspensivos cuando saca
   * el medio —«…se vuelve intocable… no porque sea ilegal tocarlo…»— y eso no
   * es una paráfrasis: es una cita con un tramo elidido. Los fragmentos se
   * exigen todos y EN ORDEN, que es lo que la elisión promete.
   */
  const enOrden = (donde: string, cita: string): boolean => {
    let cursor = 0;
    for (const parte of cita.split(/…|\.\.\./).map((p) => p.trim()).filter((p) => p.length > 0)) {
      const i = donde.indexOf(parte, cursor);
      if (i === -1) return false;
      cursor = i + parte.length;
    }
    return true;
  };

  lineas.forEach((linea, k) => {
    type Tok = { tipo: 'ancla' | 'cita'; txt: string; i: number; fin: number };
    const toks: Tok[] = [];
    for (const m of linea.matchAll(/`([^`\n]+)`/g)) {
      toks.push({ tipo: 'ancla', txt: m[1].trim(), i: m.index, fin: m.index + m[0].length });
    }
    for (const m of linea.matchAll(/«([^»\n]+)»/g)) {
      toks.push({ tipo: 'cita', txt: m[1].trim(), i: m.index, fin: m.index + m[0].length });
    }
    toks.sort((a, b) => a.i - b.i);

    /** Las oraciones de la línea, cortadas con la misma regla que las anclas. */
    const oraciones: Tok[][] = [];
    let actual: Tok[] = [];
    let finAnterior = 0;
    for (const t of toks) {
      if (CORTA_ORACION.test(linea.slice(finAnterior, t.i)) && actual.length > 0) {
        oraciones.push(actual);
        actual = [];
      }
      finAnterior = t.fin;
      actual.push(t);
    }
    if (actual.length > 0) oraciones.push(actual);

    for (const oracion of oraciones) {
      const citas = oracion.filter((t) => t.tipo === 'cita');
      if (citas.length === 0) continue;

      /** Las anclas de la oración, resueltas a documento y rango de líneas. */
      const anclas = resolverAnclas(oracion.filter((t) => t.tipo === 'ancla').map((t) => t.txt));
      if (anclas.length === 0) continue;

      for (const cita of citas) {
        // A la derecha de la comilla, sin los demás términos de la enumeración.
        const derecha = linea.slice(cita.fin).replace(/«[^»\n]*»/g, '').slice(0, 60);
        const decl = declaracionDeBusqueda(derecha);
        if (decl !== null) {
          lexicos += 1;
          errores.push(...verificarLexicoDeclarado(k + 1, cita.txt.replace(/\*/g, ''), decl, anclas));
          continue;
        }
        if (cita.txt.replace(/\*/g, '').length < LARGO_MINIMO_DE_CITA) continue;
        const texto = cita.txt.replace(/\*/g, '');
        const buscada = normalizar(texto);
        const probados: string[] = [];
        let hallada = false;
        for (const a of anclas) {
          const ls = lineasDelPlan(a.doc);
          if (ls === null) continue;
          if (enOrden(normalizar(tramoDelAncla(ls, a.desde, a.hasta)), buscada)) {
            hallada = true;
            break;
          }
          probados.push(a.etiqueta);
        }
        if (hallada) {
          cruzadas += 1;
          continue;
        }
        errores.push(
          `línea ${String(k + 1)}: la cita «${texto.slice(0, 80)}» comparte oración con ` +
            `${probados.length === 1 ? 'el ancla' : 'las anclas'} «${probados.join('», «')}» y NO ` +
            'está ahí. O el documento destino cambió —y entonces se mira qué dice ahora—, o la cita ' +
            'es una paráfrasis conveniente entre comillas, o el ancla que le corresponde no está en ' +
            'su oración y hay que traerla. Una cita entre comillas es la unidad de evidencia de este ' +
            'documento: la que nadie puede abrir contra su línea no va escrita',
        );
      }
    }
  });

  return { errores, cruzadas, lexicos };
}

/**
 * **Los cinco conteos de la INTEGRACIÓN son verificables contra archivos y
 * ninguno se cruzaba** (I-7). Las cinco mutaciones salían verdes: «Seis
 * dependencias críticas» → «Cuatro», «nombra diez documentos» → «doce», «lo cita
 * seis veces» → «veinte», «cinco alimentadores» → «nueve», y con las aristas
 * intactas en los seis párrafos de al lado.
 *
 * Es la clase de número que nadie vuelve a contar porque parece obvio, y es la
 * que la sección usa para su argumento central —seis contra diez, ocupar no es
 * sostener—: si los dos conteos dejan de ser los reales, el argumento sigue en
 * pie con los datos cambiados debajo.
 *
 * Los cuatro se cuentan de su fuente y no de una constante: las aristas de
 * `ARISTAS_CRITICAS`, los documentos de la cuarta columna del Calendario de §3.2,
 * las citas a PLANJUB del archivo de PLANCUL, y los alimentadores de la propia
 * enumeración entre rayas del párrafo que los declara.
 */
function verificarConteosDeLaIntegracion(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(lineas, H2_INTEGRACION);
  if (tramo === null) return errores;
  const prosa = tramo.join('\n').replace(/\*\*/g, '');

  const cruzar = (frase: (n: string) => string, real: number, queEs: string, porQue: string): void => {
    const bien = frase(enLetras(real));
    if (new RegExp(`(?<!\\p{L})${bien.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'iu').test(prosa)) return;
    errores.push(
      `la INTEGRACIÓN no dice «${bien}» y ${queEs} son ${String(real)} — ${porQue}`,
    );
  };

  cruzar(
    (n) => `${n} dependencias críticas`,
    ARISTAS_CRITICAS.length,
    'las aristas críticas declaradas',
    'el conteo escrito y los párrafos que lo sostienen son dos cosas, y la sección construye su ' +
      'argumento sobre la diferencia entre este número y el del Calendario',
  );
  /**
   * **El par recíproco también declara su modo degradado, y también estaba sin
   * cruzar.** El conteo grueso lo tapaba —hay ocho ocurrencias en la sección y el
   * mínimo estaba en siete—, así que borrarle el suyo a PLANPACTO salía verde con
   * las seis aristas intactas. Es la séptima dependencia de la sección y la única
   * que no está en `ARISTAS_CRITICAS`, porque no es arista: es el par.
   */
  const parRecíproco = tramo.filter((l) => l.replace(/\*\*/g, '').trimStart().startsWith('PLANPACTO es el par recíproco'));
  if (parRecíproco.length !== 1) {
    errores.push(
      `la INTEGRACIÓN tiene ${String(parRecíproco.length)} párrafo(s) que abran declarando el par ` +
        'recíproco con PLANPACTO y tiene que haber uno: es la mitad que PLANPACTO:721 declaraba ' +
        'faltante y lo único que este PLAN le debe',
    );
  } else if (!parRecíproco[0].includes('modo degradado')) {
    errores.push(
      'el par recíproco con PLANPACTO no declara su modo degradado en su propio párrafo. Sin ' +
        'PLANPACTO sancionado este PLAN queda sin árbitro de nivel, y una dependencia declarada sin ' +
        'su degradado es un punto de falla anunciado y no contestado',
    );
  }

  // Los documentos que la cuarta columna de §3.2 nombra, contados de la tabla.
  const { filas } = filasDeTabla(lineas, COLUMNAS_CALENDARIO, true);
  if (filas === null) {
    errores.push(
      'la INTEGRACIÓN dice cuántos documentos nombra el Calendario de §3.2 y la guardia no puede ' +
        'leer esa tabla para cruzarlo',
    );
  } else {
    const codigos = new Set<string>();
    for (const fila of filas) {
      for (const m of (fila[3] ?? '').matchAll(/PLAN[A-Z0-9]+/gu)) codigos.add(m[0]);
    }
    cruzar(
      (n) => `nombra ${n} documentos`,
      codigos.size,
      'los documentos con dispositivo escrito sobre alguna estación del arco (cuarta columna de §3.2)',
      'es el otro término de «seis contra diez». Contado contra §3.2 y no contra la spec, como el ' +
        'brief pedía: ocupar y sostener son preguntas distintas y los conteos dan distinto porque ' +
        'miden cosas distintas',
    );
    /**
     * La resta que cierra el argumento, y el tercer número de la oración. Mutada
     * a «tres no son arista» con la lista de cuatro nombres intacta al lado, la
     * guardia salía verde: el conteo y su enumeración viven en la misma frase.
     */
    cruzar(
      (n) => `${n} no son arista`,
      codigos.size - ARISTAS_CRITICAS.length,
      'los documentos del Calendario que no son dependencia crítica',
      'diez menos seis. Es la resta que sostiene «ocupar y sostener son dos preguntas distintas», y ' +
        'los cuatro nombres van enumerados en la misma oración: el número que no coincide con su ' +
        'propia lista es el que nadie recuenta',
    );
  }

  // Las veces que PLANCUL cita al fantasma, contadas en el archivo de PLANCUL.
  const planCul = lineasDelPlan('PLANCUL');
  if (planCul === null) {
    errores.push('la INTEGRACIÓN cuenta las citas a PLANJUB en PLANCUL y la guardia no puede abrir ese archivo');
  } else {
    const citas = planCul.filter((l) => l.includes('PLANJUB')).length;
    cruzar(
      (n) => `lo cita ${n} veces`,
      citas,
      'las líneas de PLANCUL que citan a PLANJUB',
      'el fantasma se corrige en el documento del otro y con nota de sucesión, así que el número es ' +
        'la tarea que queda pendiente: escrito de más o de menos, la corrección se hace mal',
    );
    cruzar(
      (n) => `las ${n} referencias`,
      citas,
      'las líneas de PLANCUL que citan a PLANJUB',
      'la segunda mención del mismo conteo, en la oración que declara cómo se corrige',
    );
  }

  // Los alimentadores documentales, contados de su propia enumeración.
  const parrafo = tramo.find((l) => l.includes('alimentadores documentales'));
  if (parrafo === undefined) {
    errores.push(
      'la INTEGRACIÓN no declara los alimentadores documentales, que es la mitad de «lo que no es ' +
        'arista» que el patrón de PLANPACTO:723 obliga a escribir con la razón',
    );
  } else {
    const lista = /alimentadores documentales[^—]*—([^—]+)—/u.exec(parrafo.replace(/\*\*/g, ''));
    if (lista === null) {
      errores.push(
        'los alimentadores documentales se declaran sin enumerarlos entre rayas, así que la guardia ' +
          'no puede cruzar el número escrito contra la lista. Un conteo sin lista al lado es un ' +
          'número que nadie rehizo',
      );
    } else {
      const cuantos = lista[1].split(/,| y /u).filter((s) => s.trim() !== '').length;
      cruzar(
        (n) => `${n} alimentadores documentales`,
        cuantos,
        'los ítems que la propia enumeración del párrafo lista',
        'el número y la lista viven en la misma oración y hasta acá no se miraban: nueve escrito ' +
          'sobre cinco enumerados salía verde',
      );
    }
    /**
     * Cuántos de los alimentadores están `superseded`. Mutado a «cuatro están
     * superseded» sobre cinco alimentadores, la guardia salía verde: es el
     * calificador del que §9.4 hereda el peso de 51.260–65.430M, y un conteo que
     * sube sin que nadie lo cuente convierte un papel vencido en cuatro.
     */
    if (!/\bdos est[áa]n `superseded`/u.test(parrafo)) {
      errores.push(
        'la INTEGRACIÓN no declara que DOS de los alimentadores documentales están `superseded`. Es ' +
          'el calificador que §9.4 hereda para leer 51.260–65.430M, y sin conteo fijo el ascenso o ' +
          'la baja del calificador pasan sin que nadie levante la mano',
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
  // 2 bis) El recíproco del domicilio: una cifra canónica contradicha AFUERA.
  errores.push(...verificarFamiliasDeCifra(lineas));
  // 2 ter) La anatomía interna de las secciones que declaran cuántas partes tienen.
  errores.push(...verificarSubsecciones(lineas));

  // 3) Los prohibidos, sobre el texto sin negritas.
  for (const { patron, porQue, salvoSi, salvoSiAnclaAbre, alcance } of PROHIBIDOS) {
    const global = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = global.exec(rawPlano)) !== null) {
      const nLinea = rawPlano.slice(0, m.index).split('\n').length;
      if (salvoSi !== undefined || salvoSiAnclaAbre === true) {
        const ambito =
          alcance === 'línea'
            ? (lineasPlano[nLinea - 1] ?? '')
            : oracionDe(rawPlano, m.index, m.index + m[0].length);
        if (salvoSi?.test(ambito) === true) continue;
        if (salvoSiAnclaAbre === true && magnitudesDelMatchAbiertas(ambito, m[0])) continue;
      }
      errores.push(`línea ${String(nLinea)}: «${m[0].slice(0, 120)}» está prohibido — ${porQue}`);
    }
  }

  // 3 bis) Los prohibidos que son regla de UNA subsección y no del documento.
  errores.push(...verificarProhibidosConDomicilio(lineas));

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
  // 8 bis) Task 8: cada arista crítica con su modo degradado, EN SU PÁRRAFO, y
  //        los cinco conteos de la INTEGRACIÓN cruzados contra sus archivos.
  errores.push(...verificarAristasCriticas(lineas));
  errores.push(...verificarConteosDeLaIntegracion(lineas));
  // 8 bis 3) Task 9: la fila de PLANARCO en READINESS_GATES_ADVERSARIAL.md.
  errores.push(...verificarReadinessGates(lineas));
  // 8 bis 2) Task 9: §12 cruzada contra la partición contable de §9.1.
  errores.push(...verificarHojaDeRuta(lineas));
  errores.push(...verificarSupervivencia(lineas));
  errores.push(...verificarRiesgosContados(lineas));
  errores.push(...verificarMagnitudesAncladas(lineas));
  // 8 ter) Task 8: lo que el documento afirma SOBRE el corpus, rehecho contra él.
  errores.push(...verificarLosSeisLexicos(lineas));
  errores.push(...verificarCitasTextuales(lineas));
  // 8 quater) Task 9: TODA cita entrecomillada con ancla en su oración, descubierta
  //           y cruzada sola. La lista a mano de arriba cubría dos de veintiocho.
  const citas = verificarCitasDescubiertas(lineas);
  errores.push(...citas.errores);

  // 9) Las anclas de la PROSA, abiertas una por una contra su documento.
  const prosa = verificarAnclasDeProsa(lineas);
  errores.push(...prosa.errores);

  if (errores.length > 0) {
    console.error(`La guardia de PLANARCO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANARCO OK: ${String(SECCIONES_ESPERADAS.length)} sección(es) esperada(s), ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas en su domicilio y ` +
      `${String(FAMILIAS_DE_CIFRA.length)} familias barridas afuera de él, ` +
      `${String(ASERCIONES_OBLIGATORIAS.length)} aserciones obligatorias, ` +
      `${String(PROHIBIDOS.length)} patrones prohibidos en todo el documento y ` +
      `${String(PROHIBIDOS_CON_DOMICILIO.length)} prohibido(s) de subsección, ` +
      `${String(DISPOSITIVOS_EN_PORTADA.length)} dispositivos en portada ` +
      '(conjunto exacto: ni falta ni sobra), ' +
      `${String(FALLAS_ESPERADAS)} fallas correlativas con sus ${String(LEADS_DE_FALLA.length)} leads, ` +
      `${String(SUBSECCIONES_ESPERADAS.length)} secciones con su anatomía interna contada y correlativa, ` +
      `${String(ARISTAS_CRITICAS.length)} aristas críticas con su modo degradado en su propio párrafo, ` +
      'precedentes en dos columnas balanceadas adentro de cada PÁRRAFO, ' +
      `Calendario de Umbrales con ${String(ESTACIONES_ESPERADAS)} estaciones parseadas, sus dispositivos ` +
      'cruzados contra los trece de la portada y sus ocupantes resueltos ancla por ancla contra el ' +
      'archivo destino, ' +
      'tabla de fuentes contigua con sus clases cruzadas contra SOURCE_OF_FUNDS_LEDGER.md, cada fila ' +
      'anclada cruzada contra SU línea del libro mayor (dueño, confianza, disponibilidad y clase) y ' +
      `sin una sola fila \`${CLASE_PROHIBIDA}\`, ` +
      `rampa del gasto con sus tramos partiendo ${String(HORIZONTE_DEL_GATE)} años sin hueco ni ` +
      'solapamiento, cada fila consistente (años × ejecución = años-régimen), el total cruzado contra ' +
      `la suma de la columna y el producto contra la banda anual declarado por DEBAJO de USD ` +
      `${String(GATE_QUINCE_ANOS[0])}–${String(GATE_QUINCE_ANOS[1])}M del gate, ` +
      'tabla de tres columnas contigua sin una sola magnitud monetaria —con sigla o sin ella— en ' +
      '«Gasto sustituido» ni en «Incremental neto», con la del medio cargada como monto pendiente, ' +
      'ninguna celda de «Erogación bruta» vacía y el Tramo Ganado cruzado contra PLANCUIDADO:564, ' +
      `${String(cocientesDerivados().length)} cocientes de la prosa CALCULADOS por la guardia y ` +
      `exigidos en su subsección más ${String(operandosDeLosCocientes().length)} operandos suyos, ` +
      'la división de PLANPACTO:369 rehecha en sus dos versiones (F contra sus tres sumandos, ' +
      '(P+F)/rigidez contra los dos denominadores y la dirección declarada contra la desigualdad), ' +
      'el año del régimen cruzado entre la tabla y el ordinal escrito, hoja de ruta de §12 con sus ' +
      'cinco fases correlativas y sin hueco, cruzada contra la partición contable de §9.1 (cada ' +
      'tramo adentro de la ventana de su fase, el conjunto de fases igual de los dos lados y el ' +
      'año del régimen escrito en las dos, la unidad de cada una declarada y el gate de la Fase 3 ' +
      'contado contra las estaciones del Calendario), lista de supervivencia con los trece ' +
      'dispositivos repartidos en exactamente un lado y el numeral cruzado contra los nombres, ' +
      '§10 con sus riesgos contados y correlativos, ninguna magnitud de plata de §10–§12 sin una ' +
      'línea anclada que la abra, la fila de PLANARCO en READINESS_GATES_ADVERSARIAL.md ' +
      `con sus ${String(ATTACK_PATHS_ESPERADOS)} attack paths completos, sus fallbacks escritos ` +
      'contra el extremo alto de la banda de régimen y no como cifra suelta, y su NOTA de ' +
      'habilitación corrida contra el prohibido del gate, los cuatro cocientes del acta, la banda ' +
      'derivada y el umbral del indicador que §10 escribe, los cinco conteos de la ' +
      'INTEGRACIÓN cruzados contra §3.2, contra el archivo de PLANCUL y contra su propia lista, ' +
      `${String(prosa.resueltas)} anclas de la prosa abiertas y resueltas contra su documento ` +
      '(todo token con forma de ancla que la guardia no sepa leer se reporta, no se descarta, y la ' +
      'remisión corta corre SOLO contra un ancla completa de su misma oración), ' +
      `${String(citas.cruzadas)} citas entrecomilladas de ${String(LARGO_MINIMO_DE_CITA)}+ caracteres ` +
      'DESCUBIERTAS solas y leídas adentro del tramo que su ancla nombra —elisiones respetadas y ' +
      `encabezado de tabla incluido— más ${String(citas.lexicos)} declarada(s) resultado de búsqueda ` +
      'y REHECHA(s) contra el taller —el cero tiene que dar cero y no compartir tres palabras con la ' +
      `línea que su oración ancla—, y las ${String(CITAS_TEXTUALES.length)} que además tienen que seguir escritas, `+
      'todas las aserciones exigidas SIN una negación adelante salvo las que se declaran negativas, ' +
      `${String(lineas.length)} líneas. Sin piso constitucional propio, cruzado contra PISOS_SEGUN_EL_TALLER.`,
  );
}

main();
