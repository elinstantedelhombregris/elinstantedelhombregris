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
import { readFileSync } from 'node:fs';
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
  // Task 3: SECCIÓN 0, 1 y 2 · Task 4: SECCIÓN 3 · Task 5: SECCIÓN 4 · …
];

/**
 * Cifras y fórmulas verificadas que el documento no puede contradecir ni perder.
 * Cada una tiene domicilio abierto y leído antes de escribirla.
 *
 * OJO — acá van solo NÚMEROS, y solo los que un `includes()` sobre el archivo
 * entero verifica de verdad. Las afirmaciones sin cifra van en
 * ASERCIONES_OBLIGATORIAS, abajo. Los totales de tabla NO viven en ninguna de
 * las dos: se buscan como string y siguen apareciendo en la prosa aunque la
 * tabla que los produce esté rota. Esos se suman — ver verificarTablas().
 */
const CIFRAS_CANONICAS: { valor: string; porQue: string }[] = [
  {
    valor: '1,77–2,13x',
    porQue: 'gate de spin-off contra PLANCUIDADO — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:24',
  },
  {
    valor: '8,83–16,00x',
    porQue: 'gate de spin-off contra PLANSAL — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:25',
  },
  {
    valor: '1,47–1,88x',
    porQue:
      'gate contra los dos huéspedes sumados: NO PASA contra un umbral de 1,5 — ACTA:26, :41-47. ' +
      'Sin este cociente escrito, la cabecera cuenta media verdad',
  },
  {
    valor: 'umbral de 1,5',
    porQue: 'el cociente que falla no significa nada sin el umbral contra el que falla — ACTA:42-43',
  },
  {
    valor: '53.000–96.000M',
    porQue:
      'el presupuesto a quince años sobre el que se corrió el gate — scripts/gate-spinoff-planes-nuevos.ts:25. ' +
      'El rango ANUAL no se escribe hasta la Task 8 (hallazgo C-5)',
  },
];

/**
 * Afirmaciones sin cifra que el documento está obligado a hacer, con el mismo
 * `includes()` que las cifras. Viven aparte porque no son números: mezclarlas
 * con CIFRAS_CANONICAS hacía que la constante mintiera sobre su contenido, y
 * son nueve las tareas que la extienden.
 */
const ASERCIONES_OBLIGATORIAS: { valor: string; porQue: string }[] = [
  {
    valor: 'derogación expresa',
    porQue:
      'la autoridad real por la que este PLAN existe: regla 5 y condición temporal de la regla 3, ' +
      'derogadas con nombre y fecha — ACTA:131-137',
  },
  {
    valor: 'sin piso constitucional propio',
    porQue: 'el arco es eje transversal adentro de los ocho escalones, no un escalón nuevo (C-2)',
  },
  {
    valor: 'la porción de vejez',
    porQue:
      'el acta retira solo la vejez del hueco «Discapacidad y vejez»; la discapacidad queda en ' +
      'PLANCUIDADO + PLANSAL y PLANARCO tiene que decirlo — ACTA:169-173',
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

/** Las filas de la primera tabla cuya cabecera contiene todas las columnas pedidas. */
function filasDeTabla(lineas: string[], columnas: string[]): string[][] | null {
  const i = lineas.findIndex(
    (l) => l.trim().startsWith('|') && columnas.every((col) => l.includes(col)),
  );
  if (i === -1) return null;
  const filas: string[][] = [];
  for (let j = i + 1; j < lineas.length; j++) {
    const l = lineas[j].trim();
    if (!l.startsWith('|')) break;
    if (/^\|[\s:|-]+\|$/.test(l)) continue; // separador
    filas.push(celdas(l));
  }
  return filas;
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
  if (pisos) {
    for (const fila of pisos) {
      if (/PLANARCO/.test(fila[0] ?? '')) {
        errores.push(`el documento se declara un piso constitucional propio: «${fila.join(' | ')}»`);
      }
    }
  }

  // (c) Task 4: Calendario de Umbrales. Task 5: fuentes de la Renta de Arco.

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

  // 2) Las cifras canónicas y las aserciones obligatorias.
  for (const { valor, porQue } of CIFRAS_CANONICAS) {
    if (!raw.includes(valor)) errores.push(`falta la cifra canónica «${valor}» — ${porQue}`);
  }
  for (const { valor, porQue } of ASERCIONES_OBLIGATORIAS) {
    if (!raw.includes(valor)) errores.push(`falta la aserción obligatoria «${valor}» — ${porQue}`);
  }

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
      `${String(lineas.length)} líneas. Sin piso constitucional propio, cruzado contra PISOS_SEGUN_EL_TALLER.`,
  );
}

main();
