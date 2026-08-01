/**
 * Guardia del documento de PLANPREGUNTA.
 *
 * Run: npx tsx scripts/verificar-planpregunta.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que cada una lleve su epígrafe, que las cifras canónicas aparezcan
 * CON SU DOMICILIO en la misma oración, que los strings prohibidos no
 * aparezcan, que no queden marcadores de pendiente, que el documento no se
 * invente un piso constitucional, y que las dos tablas contables sumen.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * Cada tarea del plan agrega sus secciones a SECCIONES_ESPERADAS antes de
 * escribirlas: primero la guardia falla, después el documento la hace pasar.
 *
 * ── LO QUE ESTA GUARDIA HEREDA DEL TRAMO C, YA ARREGLADO ──────────────────
 * El tramo C encontró diecisiete formas del mismo defecto en ocho tareas, y el
 * patrón de fondo no eran chequeos flojos: eran **listas opt-in mantenidas a
 * mano**. Acá se arranca con la doctrina puesta:
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un error, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la oración, no la línea).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md');
/** El documento ajeno donde vive la otra mitad del split. Lo lee la Task 11. */
const PLANTER = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANTER_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANPREGUNTA no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** El H2 del mandato. Vive aparte porque la anatomía lo necesita para verificar POSICIÓN. */
const H2_MANDATO = '## Vigésimo Sexto Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — LA PREGUNTA QUE NADIE ANOTÓ',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS OCHO FALLAS DEL APARATO DE CONOCIMIENTO ARGENTINO',
  '## SECCIÓN 1: LA CRISIS — EL PAÍS DISCUTE CUÁNTO PONE Y NUNCA DISCUTIÓ PARA QUÉ',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  '## SECCIÓN 3: LA SOLUCIÓN — LA PREGUNTA NACIONAL',
  '## SECCIÓN 4: EL CENSO DE IGNORANCIA',
  '## SECCIÓN 5: LAS NUEVE VERTICALES',
  '## SECCIÓN 6: LA PRUEBA DE BARRO',
  '## SECCIÓN 7: LA INFRAESTRUCTURA DE LO COMÚN',
  '## SECCIÓN 8: QUIÉN PREGUNTA Y QUIÉN CONTESTA',
  '## SECCIÓN 9: EL SEGURO CONTRA LO IMPREVISTO',
  '## SECCIÓN 10: LA SERIE CENTENARIA',
  '## SECCIÓN 11: DOBLE USO Y BIOSEGURIDAD',
  '## SECCIÓN 12: LA AGENCIA NACIONAL DEL CONOCIMIENTO (ANCON)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 13: MODELO ECONÓMICO Y FISCAL',
  '## SECCIÓN 14: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 15: EL MAPA DE PERDEDORES',
  '## SECCIÓN 16: HOJA DE RUTA',
  '## SECCIÓN 17: TABLERO NACIONAL DE LA PREGUNTA',
  '## SECCIÓN 19: DIMENSIÓN FEDERAL',
  '## SECCIÓN 20: VISIÓN 2040',
  '## SECCIÓN 21: PROTOCOLO DE FALLA',
  '## CIERRE',
];

/**
 * **LA PORTADA, QUE ES LA SUPERFICIE QUE NADIE VUELVE A MIRAR.** En el tramo B la
 * portada ASCII anunció cuatro dispositivos con cero ocurrencias en el cuerpo, se
 * escribió en la primera tarea y nadie la volvió a abrir mientras todo lo demás se
 * revisaba nueve veces. Acá cada renglón de dispositivos de la portada se
 * verifica contra el cuerpo: si la portada lo anuncia, el cuerpo lo tiene que
 * nombrar afuera de la portada, y más de una vez.
 *
 * El default es «todo lo que la portada nombra se verifica». La lista de abajo es
 * el mapa de formas, no un opt-in: un dispositivo que el cuerpo escribe con otra
 * palabra necesita su alias declarado, y un dispositivo nuevo que nadie agregue
 * acá lo va a encontrar `verificarPortadaCompleta()`, que recorre la portada y
 * reporta lo que no sabe leer en vez de descartarlo en silencio.
 */
const DISPOSITIVOS_DE_PORTADA: { enPortada: string; alias?: string[] }[] = [
  { enPortada: 'La Pregunta Nacional', alias: ['Pregunta Nacional'] },
  { enPortada: 'Nueve Verticales', alias: ['nueve verticales', 'vertical'] },
  { enPortada: 'La Pregunta de Adopción', alias: ['Pregunta de Adopción'] },
  { enPortada: 'Censo de Ignorancia bidireccional', alias: ['Censo de Ignorancia', 'Censo'] },
  { enPortada: 'Padrón de Testigos', alias: ['padrón de Testigos', 'Testigos'] },
  { enPortada: 'La Prueba de Barro', alias: ['Prueba de Barro', 'Barro'] },
  { enPortada: 'Banco de Materia Viva' },
  { enPortada: 'Turno de Máquina' },
  { enPortada: 'Sello Abierto' },
  { enPortada: 'Modelos de Órgano', alias: ['Modelo de Órgano'] },
  { enPortada: 'Cátedra Portátil' },
  { enPortada: 'Cátedra de Regreso' },
  { enPortada: 'Cupo de Credencial Consolidada', alias: ['Credencial Consolidada', 'cupo'] },
  { enPortada: 'El Seguro contra lo Imprevisto', alias: ['Seguro contra lo Imprevisto', 'Seguro'] },
  { enPortada: 'La Serie Centenaria', alias: ['Serie Centenaria'] },
  { enPortada: 'Fondo de la Pregunta' },
  { enPortada: 'Agencia Nacional del Conocimiento (ANCON)', alias: ['ANCON'] },
];

/** Mínimo de menciones en el cuerpo. Una sola puede ser la que la portada dejó suelta. */
const MENCIONES_MINIMAS = 2;

function verificarPortada(lineas: string[]): string[] {
  const errores: string[] = [];
  const iAbre = lineas.findIndex((l) => l.trim() === '```');
  if (iAbre === -1) return ['no se encontró la portada ASCII (bloque cercado)'];
  const iCierra = lineas.findIndex((l, k) => k > iAbre && l.trim() === '```');
  if (iCierra === -1) return ['la portada ASCII no cierra'];
  const portada = lineas.slice(iAbre + 1, iCierra).join('\n');
  const cuerpo = lineas.slice(iCierra + 1).join('\n');

  for (const { enPortada, alias } of DISPOSITIVOS_DE_PORTADA) {
    if (!portada.includes(enPortada)) {
      errores.push(
        `«${enPortada}» está declarado como dispositivo de portada y la portada no lo nombra: la ` +
          'lista quedó vieja, y una lista vieja en las dos direcciones es una lista que no verifica nada',
      );
      continue;
    }
    const formas = [enPortada, ...(alias ?? [])];
    const veces = formas.reduce((n, f) => n + cuerpo.split(f).length - 1, 0);
    if (veces < MENCIONES_MINIMAS) {
      errores.push(
        `la portada anuncia «${enPortada}» y el cuerpo lo nombra ${String(veces)} vez/veces ` +
          `(mínimo ${String(MENCIONES_MINIMAS)}): en el tramo B la portada anunció cuatro dispositivos ` +
          'que el cuerpo no tenía, y nadie la volvió a mirar',
      );
    }
  }

  /**
   * El chequeo que descubre solo lo que falta: los renglones de dispositivos de la
   * portada se parten por «·» y cada pedazo tiene que estar cubierto por alguna
   * entrada de la lista. Lo que no matchee se reporta — no se descarta.
   */
  const cubiertos = DISPOSITIVOS_DE_PORTADA.map((d) => d.enPortada);
  /**
   * El bloque de destinatarios usa el mismo separador «·» y no son dispositivos.
   * El corte es la línea «Preparado para…», que el corpus escribe siempre igual
   * (PLANPACTO, PLANARCO). Si esa línea faltara, el chequeo NO corre en silencio:
   * lo dice, porque un ancla que no está deja el descubrimiento apagado.
   */
  const iPreparado = portada.split('\n').findIndex((l) => l.trim().startsWith('Preparado para'));
  if (iPreparado === -1) {
    errores.push(
      'la portada no tiene la línea «Preparado para…» que separa dispositivos de destinatarios: ' +
        'sin ese corte, el descubrimiento de la portada no puede correr',
    );
  }
  const renglones = portada.split('\n').slice(0, iPreparado === -1 ? 0 : iPreparado);
  for (const linea of renglones) {
    if (!linea.includes('·')) continue;
    for (const trozo of linea.split('·').map((t) => t.trim())) {
      if (trozo.length === 0) continue;
      if (!cubiertos.some((c) => trozo.includes(c) || c.includes(trozo))) {
        errores.push(
          `la portada anuncia «${trozo}» y DISPOSITIVOS_DE_PORTADA no lo cubre: la guardia no lo ` +
            'sabe leer, y lo que la guardia no sabe leer se reporta en vez de descartarse',
        );
      }
    }
  }
  return errores;
}

/**
 * **El default es «lleva epígrafe»** y el opt-out es esta lista, que se verifica
 * EN LAS DOS DIRECCIONES: si una sección exenta aparece con epígrafe, la guardia
 * lo reporta, porque entonces la exención está vieja y una lista opt-out vieja
 * es una lista opt-in con otro nombre.
 *
 * Las cuatro exentas son las que el corpus escribe sin epígrafe: el H2 del
 * mandato, que no es sección; el preámbulo y la tesis, que abren con el rostro y
 * con la primitiva; y la INTEGRACIÓN, que abre con el par recíproco.
 */
const SIN_EPIGRAFE: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — LA PREGUNTA QUE NADIE ANOTÓ',
  '## TESIS CENTRAL',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
];

/** Un epígrafe del corpus: blockquote, itálica, entrecomillado y con texto adentro. */
const EPIGRAFE = /^>\s*\*"(.+)"\*$/u;
const LARGO_MINIMO_DE_EPIGRAFE = 20;

/**
 * Las subsecciones que cada H2 tiene que tener, contadas y con numeración
 * correlativa. Un H2 presente no dice nada sobre lo que hay debajo: borrar un
 * dispositivo entero deja el H2 en su lugar, el orden intacto y la guardia
 * verde. Las tareas lo extienden.
 */
const SUBSECCIONES_ESPERADAS: { h2: string; prefijo: string; cuantas: number; porQue: string }[] = [
  {
    h2: '## SECCIÓN 0: LAS OCHO FALLAS DEL APARATO DE CONOCIMIENTO ARGENTINO',
    prefijo: '0',
    cuantas: 8,
    porQue:
      'el H2 promete ocho y borrar una entera deja el H2 en su lugar, el orden intacto y la ' +
      'guardia verde. Se verifica la cantidad Y la numeración correlativa, porque 0.1, 0.3, 0.3, … ' +
      'también da ocho',
  },
  {
    h2: '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
    prefijo: '2',
    cuantas: 5,
    porQue:
      'la sección que defiende al PLAN es la que menos se revisa, y fue el hallazgo Crítico de la ' +
      'revisión final del tramo B. Cinco precedentes, cada uno con lo que pidió y lo que dio',
  },
  {
    h2: '## SECCIÓN 3: LA SOLUCIÓN — LA PREGUNTA NACIONAL',
    prefijo: '3',
    cuantas: 6,
    porQue:
      'anatomía · quién abre · el interinato del órgano · incompatibilidad de autoría · jurados de ' +
      'afuera · frontera con el LANEF. Las dos del medio son las que cierran el modo de falla número ' +
      'uno del PLAN, y son las que un recorte de prosa se lleva primero porque no tienen número',
  },
  {
    h2: '## SECCIÓN 4: EL CENSO DE IGNORANCIA',
    prefijo: '4',
    cuantas: 5,
    porQue:
      'el depósito · la devolución obligatoria · el padrón de Testigos · la Pregunta de Adopción · el ' +
      'modo degradado en papel. La devolución es lo único que separa a este circuito de un buzón de ' +
      'quejas, y el modo degradado es lo que impide que el Censo espere a una plataforma de estadio B',
  },
  {
    h2: '## SECCIÓN 5: LAS NUEVE VERTICALES',
    prefijo: '5',
    cuantas: 4,
    porQue: 'el reparto y la tabla · las siete naturales · República · Evaluación de mandatos',
  },
  {
    h2: '## SECCIÓN 6: LA PRUEBA DE BARRO',
    prefijo: '6',
    cuantas: 4,
    porQue:
      'qué es y qué hereda de PLANEN:786 · el choque con el ciclo LDEA de PLANMESA · cuándo no ' +
      'aplica · el registro de las que fallan. La segunda es la que enmienda o no enmienda el ' +
      'protocolo de otro PLAN, y borrarla deja la contradicción viva y sin declarar',
  },
  {
    h2: '## SECCIÓN 7: LA INFRAESTRUCTURA DE LO COMÚN',
    prefijo: '7',
    cuantas: 4,
    porQue:
      'Banco de Materia Viva · Turno de Máquina · Sello Abierto · Modelos de Órgano. Cuatro ' +
      'dispositivos y cuatro declaraciones de propiedad ajena: germoplasma de PLANISV, cómputo de ' +
      'PLANDIG, custodia de PLANMEMORIA',
  },
  {
    h2: '## SECCIÓN 8: QUIÉN PREGUNTA Y QUIÉN CONTESTA',
    prefijo: '8',
    cuantas: 3,
    porQue:
      'Cátedra Portátil · Cátedra de Regreso · el cupo del 5–8%. El cupo es el arreglo 8 y es lo ' +
      'primero que un recorte se lleva, porque es el único de los tres que le saca lugar a alguien',
  },
  {
    h2: '## SECCIÓN 11: DOBLE USO Y BIOSEGURIDAD',
    prefijo: '11',
    cuantas: 4,
    porQue:
      'qué no se publica el mismo día · qué no se presta · el régimen del nodo de referencia · quién ' +
      'responde cuando falla. La cuarta es la que convierte la doctrina en algo distinto de una ' +
      'declaración de buenas intenciones, y es la que no tiene ningún precedente en el corpus',
  },
  {
    h2: '## SECCIÓN 13: MODELO ECONÓMICO Y FISCAL',
    prefijo: '13',
    cuantas: 5,
    porQue:
      'la rampa · el nuevo split · por qué esa línea y qué se le rompe · la cuenta con el hueco ' +
      'adentro · las dos fuentes que no se reclaman. La última es la que desaparece primero cuando ' +
      'alguien comprime, y una fuente descartada en silencio reaparece en la versión que sigue',
  },
];

/**
 * **LA LISTA DE SUBSECCIONES SE DESCUBRE SOLA, Y NO ES UN LUJO: ES EL ARREGLO DE
 * UN DEFECTO QUE ESTA GUARDIA YA TUVO.**
 *
 * Las entradas de la SECCIÓN 8 y de la SECCIÓN 11 se agregaron dos veces cada
 * una, porque la primera vez la edición no aplicó y **nadie se enteró**: una
 * lista opt-in a la que le falta una entrada no se pone roja, se pone verde. Es
 * literalmente el defecto que el encabezado de este archivo dice haber heredado
 * arreglado del tramo C, cometido sobre la lista que lo arregla.
 *
 * El chequeo es el del punto 2 de la doctrina, aplicado a la guardia misma: si
 * una sección esperada tiene dos o más `### N.M` adentro y no está declarada en
 * `SUBSECCIONES_ESPERADAS`, es error. El umbral es dos porque una sola
 * subsección no forma serie y contarla no protege de nada.
 */
function verificarCoberturaDeSubsecciones(lineas: string[]): string[] {
  const errores: string[] = [];
  const declaradas = new Set(SUBSECCIONES_ESPERADAS.map((x) => x.h2));
  for (const h2 of SECCIONES_ESPERADAS) {
    if (declaradas.has(h2)) continue;
    const { tramo } = tramoDeSeccion(lineas, h2);
    if (tramo === null) continue;
    const numeradas = tramo.filter((l) => /^### \d+\.\d+ \S/.test(l.trim())).length;
    if (numeradas >= 2) {
      errores.push(
        `«${h2}» tiene ${String(numeradas)} subsecciones numeradas y no está en ` +
          'SUBSECCIONES_ESPERADAS: la lista opt-in se llena donde cayeron las últimas ediciones, no ' +
          'donde corresponde, y una entrada que falta sale verde',
      );
    }
  }
  return errores;
}

/**
 * La tabla de las nueve verticales. Se parsea y se cuenta, y la columna de
 * ocupantes es obligatoria en TODAS las filas: es lo que hace honesta la
 * arquitectura. Una vertical sin ocupante declarado se lee como territorio
 * vacío, y en este corpus casi nada lo está.
 */
const COLUMNAS_VERTICALES = ['Vertical', 'Ignorancia madre', 'Dueño', 'Quién la ocupa hoy'];

function verificarVerticales(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_VERTICALES, true);
  if (filas === null) return errores;
  if (filas.length !== 9) {
    errores.push(`la tabla de verticales tiene ${String(filas.length)} filas y el PLAN promete nueve`);
  }
  filas.forEach((fila, i) => {
    const ocupante = (fila[3] ?? '').trim();
    if (ocupante.length < 3) {
      errores.push(
        `vertical ${String(i + 1)} («${fila[0] ?? ''}») no declara quién la ocupa hoy: la columna es ` +
          'obligatoria, y «nadie» también es una respuesta que hay que escribir',
      );
    }
  });
  return errores;
}

/**
 * La anatomía de cada falla: `### 0.N {título}` y debajo los tres leads de
 * PLANPACTO:96-130. Sin este chequeo se podía borrar «El dato:» —que es el
 * párrafo que sostiene la falla contra el corpus, y por lo tanto el único que
 * se puede falsear— y la guardia salía verde con el H3 en su lugar.
 */
const LEADS_DE_FALLA = ['**La falla:**', '**Por qué persiste:**', '**El dato:**'];

function verificarAnatomiaDeFallas(lineas: string[]): string[] {
  const h2 = '## SECCIÓN 0: LAS OCHO FALLAS DEL APARATO DE CONOCIMIENTO ARGENTINO';
  const { tramo, errores } = tramoDeSeccion(lineas, h2);
  if (tramo === null) return errores;

  const inicios: number[] = [];
  tramo.forEach((l, k) => {
    if (/^### 0\.\d+ \S/.test(l.trim())) inicios.push(k);
  });
  inicios.forEach((ini, k) => {
    const fin = inicios[k + 1] ?? tramo.length;
    const cuerpo = tramo.slice(ini, fin).join('\n');
    const titulo = (tramo[ini] ?? '').trim();
    for (const lead of LEADS_DE_FALLA) {
      if (!cuerpo.includes(lead)) {
        errores.push(`«${titulo}» no tiene el párrafo «${lead}» — es la forma de PLANPACTO:96-130`);
      }
    }
  });
  return errores;
}

/**
 * **Cifra canónica = número + domicilio, en la misma oración.**
 *
 * Un `includes()` sobre el archivo entero encuentra el número en la tesis aunque
 * la sección que lo tenía que sostener ya no lo cite. Y un número del corpus sin
 * su domicilio es exactamente la práctica que este documento denuncia: PLANDIG
 * midió el 0,16% del PBI y PLANPREGUNTA no puede escribirlo como si lo hubiera
 * medido él.
 *
 * `ancla` es lo que tiene que aparecer en la MISMA ORACIÓN que el valor.
 * `opcional` es el único opt-out, y lleva razón escrita: sin él, una entrada que
 * todavía no se escribió pondría roja la guardia de una tarea anterior.
 */
interface CifraCanonica {
  valor: RegExp;
  ancla: RegExp;
  porQue: string;
  /** Razón por la que esta cifra todavía puede faltar. Vacío = obligatoria. */
  opcional?: string;
}

const CIFRAS_CANONICAS: CifraCanonica[] = [
  {
    valor: /16\.500\s*[–—-]\s*26\.000/u,
    ancla: /gate|acta|ACTA|quince años/u,
    porQue:
      'la banda de quince años es el INSUMO del gate de spin-off y es lo único que la cabecera ' +
      'puede afirmar: el rango anual lo deriva la Sección 13 (D-2)',
  },
  {
    valor: /0,2[16]\s*[–—-]\s*0,26x|0,19\s*[–—-]\s*0,24x/u,
    ancla: /PLANEDU|sumados|gate/u,
    porQue: 'los dos cocientes que PLANPREGUNTA NO pasa. Escribir sólo los que pasa sería mentir por omisión',
  },
  {
    valor: /derogaci[óo]n expresa/iu,
    ancla: /regla 5|regla 3|acta|ACTA/u,
    porQue:
      'la autoridad real por la que este PLAN existe. Sin la palabra, la habilitación se lee como ' +
      'si el gate la hubiera producido',
  },
  /**
   * Task 2. Las cuatro renuncias de la tesis van con ancla porque son lo que
   * separa a este documento de un pliego de reclamos del sector: un PLAN que se
   * estrena diciendo que el país no sabe lo que no sabe tiene que decir en la
   * misma página qué es lo que él no hace.
   */
  {
    valor: /no es el ministerio|no administra el sistema científico/iu,
    ancla: /PLANPREGUNTA|este PLAN|no (?:es|administra)/iu,
    porQue: 'la primera renuncia de la tesis: PLANPREGUNTA no es la cartera y no administra el sistema existente',
  },
  {
    valor: /pata industrial/iu,
    ancla: /PLANCYT|PLANEB|PLANDIG|PLANISV|PLANMOV|PLANTER|repartida|hueco/iu,
    porQue:
      'la segunda renuncia: la pata industrial que la sigla PLANCYT también nombraba sigue repartida ' +
      'entre cinco PLANes y este diseño no la cubre (ANALISIS_CONEXIONES_22_PLANES.md §9.4)',
  },
  /**
   * Task 3. Las cifras del diagnóstico son TODAS ajenas, y ése es el punto: un
   * PLAN que se estrena diciendo que el país no sabe lo que no sabe no puede
   * estrenar como propio el diagnóstico que otro documento del corpus ya escribió
   * con tabla. El ancla es el domicilio, no el número.
   */
  {
    valor: /0,16%/u,
    ancla: /PLANDIG/u,
    porQue: 'la ejecución de ciencia y técnica la midió PLANDIG:269 y :284, no este documento (D-4)',
  },
  {
    valor: /0,39%/u,
    ancla: /PLANDIG|ley|legal/iu,
    porQue: 'la meta legal vigente es de PLANDIG:285 y su incremento ya tiene dueño: PLANDIG:1112 (D-3)',
  },
  {
    valor: /INTA/u,
    ancla: /BLINDAJE|años 90|noventa|aserci[óo]n|sin fuente/iu,
    porQue:
      'el vaciamiento del INTA es BLINDAJE:41 y :44, sin fuente externa: se cita como aserción del ' +
      'corpus y con su década, porque el −60% es de los años 90 y no de ahora',
  },
  {
    valor: /investigar para publicar|obligaci[óo]n de transferencia/iu,
    ancla: /LANEF|PLANEN/u,
    porQue:
      'la regla que la Prueba de Barro endurece ya está escrita en PLANEN:786. Reclamarla entera ' +
      'sería estrenar una originalidad que el corpus desmiente (D-5)',
  },
  /**
   * Task 4. El sorteo estratificado es el hallazgo D-1: existe, y es de
   * PLANMESA. El prohibido de PLANJUS impide atribuirlo mal; esta cifra obliga a
   * atribuirlo bien, que no es lo mismo — se puede escribir un sorteo sin decir
   * de dónde sale y salir verde por los dos lados.
   */
  {
    valor: /sorteo estratificado|estratificado por Credencial/iu,
    ancla: /PLANMESA/u,
    porQue:
      'el sorteo estratificado por Credencial en la materia es de PLANMESA:297 y la AMCC de ' +
      'PLANMESA:88 se gobierna así. PLANJUS:400 es sorteo puro (D-1)',
  },
  /**
   * Task 6. El choque del Barro con el ciclo LDEA es literal y en las dos
   * variables: PLANMESA:88 exige 60-180 días CON el autor adentro, y el Barro
   * exige doce meses con el autor afuera. Un documento que escriba el Barro sin
   * nombrar el choque le está enmendando el protocolo a otro PLAN en silencio,
   * que es exactamente lo que la Sección 5.4 de este mismo documento se prohíbe.
   */
  {
    valor: /60\s*[–—-]\s*180|sesenta a ciento ochenta/u,
    ancla: /LDEA|PLANMESA|EXPERIMENTAR/u,
    porQue: 'el plazo de la fase EXPERIMENTAR de PLANMESA:88, contra el que el Barro tiene que declararse (D-7)',
  },
  {
    valor: /estadio B/u,
    ancla: /PLANDIG|tranche-3|condicional|degradado/iu,
    porQue:
      'LANIA y ArgenCloud a escala están en el estadio B de PLANDIG:2111, diferido a tranche-3+ y ' +
      'condicional. El Turno de Máquina no puede suponerlos disponibles (arreglo 6)',
  },
  /**
   * Task 7. El cupo del arreglo 8 va con ancla en la Credencial Consolidada
   * porque la figura ya existe y es de PLANMESA: escribir el cupo sin remitir
   * sería inventar un padrón nuevo al lado de uno que ya tiene 80-120 mil
   * personas proyectadas (PLANMESA:1138).
   */
  {
    // Admite «5–8%», «5 al 8%» y «5 y el 8%». La primera versión solo miraba el
    // guion y ponía roja la redacción natural: hacer que la guardia elija la
    // prosa es la manera más rápida de que el documento empiece a escribirse
    // para el script en vez de para el lector.
    valor: /5\s*(?:[–—-]|al|y el|a)\s*8\s*%|cinco a ocho por ciento/u,
    ancla: /C[áa]tedra|cupo|Credencial/iu,
    porQue: 'el cupo de Cátedras para Credencial Consolidada sin trayectoria académica (arreglo 8)',
  },
  {
    valor: /Credencial Consolidada/u,
    ancla: /PLANMESA/u,
    porQue:
      'la Credencial Consolidada es de PLANMESA —:601, :657, :1138— y se remite, no se inventa. ' +
      'Un padrón nuevo al lado de uno que ya existe es un padrón que este PLAN podría llenar solo',
  },
  /**
   * Task 8. El censo de ausencia de la Sección 11 es lo que justifica que ese
   * capítulo se escriba entero en vez de remitir, y es verificable: «doble uso»
   * y «biobanco» tienen cero ocurrencias en el taller y «bioseguridad» tiene
   * una, de SENASA sobre insumos biológicos (PLANISV:1614).
   */
  {
    valor: /bioseguridad/iu,
    ancla: /PLANISV|SENASA|una sola vez|una única|cero|no tiene doctrina|estrena/iu,
    porQue:
      'la única ocurrencia de «bioseguridad» en los 24 documentos del taller es PLANISV:1614, de ' +
      'SENASA y sobre insumos biológicos. El corpus no tiene doctrina y este PLAN la estrena: eso se ' +
      'declara, o el lector supone que había una (arreglo 9)',
  },
  {
    valor: /16\.500\s*[–—-]\s*31\.000|16\.500 a 31\.000/u,
    ancla: /PLANTER|FSC|Fondo Soberano Ciudadano|flujo/iu,
    porQue:
      'el flujo anual del FSC sale de PLANTER:670-676, donde el 40% del dividendo son 6.600-12.400M. ' +
      'Es el denominador del que salen los ocho puntos, y sin él el 8% no significa nada',
  },
  {
    valor: /un solo fondo con dos nombres|son el mismo fondo/iu,
    ancla: /PLANARCO/u,
    porQue:
      'la reconciliación FSC = FSB es decisión de diseño de PLANARCO:449, no de este documento. ' +
      'Escribirla sin atribuir sería atribuirse una autoría ajena, que es la cuarta rama de la ' +
      'declaración de valores',
  },
  {
    valor: /siete y (?:las )?doce|entre siete y doce/iu,
    ancla: /medicion|Serie|Centenaria|cien años/iu,
    porQue: 'las mediciones de la Serie Centenaria: entre siete y doce, irreductibles a cien años',
  },
];

/**
 * Strings que no pueden aparecer, con el motivo de cada uno.
 *
 * `ambito` decide sobre qué se corre el patrón, y la unidad importa: un patrón
 * por oración con una excepción por línea queda apagado justo en el párrafo
 * donde el error se escribiría con naturalidad.
 *  · `'documento'` — el archivo entero, sin negritas.
 *  · `'cabecera'`  — sólo las primeras 60 líneas.
 */
interface Prohibido {
  patron: RegExp;
  porQue: string;
  ambito?: 'documento' | 'cabecera';
  /**
   * Excepción, medida sobre **la oración que contiene al match** — la misma
   * unidad en la que están escritos los patrones, que no cruzan `.` ni `\n`.
   * El tramo C perdió una vuelta entera por tener el patrón por oración y el
   * `salvoSi` por línea: el prohibido quedaba apagado justo en el único párrafo
   * donde el error se escribiría con naturalidad.
   *
   * Lleva razón escrita. Una excepción sin razón es una excepción que nadie va a
   * poder auditar cuando el documento cambie.
   */
  salvoSi?: { patron: RegExp; porQue: string };
}

const PROHIBIDOS: Prohibido[] = [
  {
    patron:
      /(?<!\b(?:no|nunca|jamás|tampoco|ninguno|ninguna|ni)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,30})(pas[óo]|super[óo]|supera|pasa)\s+(el|ese|este|dicho)\s+(gate|umbral)/iu,
    porQue:
      'falso: PLANPREGUNTA falla contra PLANEDU solo (0,21–0,26x) y contra los tres huéspedes ' +
      'sumados (0,19–0,24x). La forma negada queda exenta sola por el lookbehind',
  },
  {
    patron: /(el\s+)?(PLAN\s+)?más\s+caro\s+del\s+corpus/iu,
    porQue:
      'el acta lo corrigió el 2026-07-31: PLANEDU no lo es por ninguna de las dos medidas ' +
      '(PLANVIV por inversión total, PLANMOV por gasto anual). El orden de magnitud alcanza',
  },
  {
    patron: /PLANCYT\s+(es|será|sería)\s+(este|el)\s+PLAN|este PLAN\s+(es|se llama)\s+PLANCYT/iu,
    porQue:
      'PLANCYT es la sigla de «Ciencia, Tecnología e Industria Soberana» ' +
      '(ANALISIS_CONEXIONES_22_PLANES.md §9.4) e incluye una pata industrial que este diseño no ' +
      'cubre. Puede aparecer nombrado como lo que se descartó, nunca como sinónimo',
  },
  {
    patron: /audit\/05/u,
    porQue:
      'cita fabricada. El domicilio del gap de industria y ciencia es ' +
      'ANALISIS_CONEXIONES_22_PLANES.md §9.4 (arreglo 11)',
  },
  {
    patron: /PLANFOCO\s*:\s*\d/u,
    porQue:
      'el archivo PLANFOCO_Argentina_ES.md no existe todavía: toda cita con número de línea es ' +
      'fabricada (D-9). PLANFOCO se nombra como pendiente, con la fórmula de PLANPACTO:721',
  },
  {
    patron: /PLANJUS(?:(?![.\n])[^.\n]){0,120}estratificad|estratificad(?:(?![.\n])[^.\n]){0,120}PLANJUS/iu,
    porQue:
      'el sorteo estratificado por Credencial es de PLANMESA:297 y de PLANMESA:88. PLANJUS:400 es ' +
      'sorteo PURO con exclusión de conflicto de interés, y §6.5 corrige el padrón, no el sorteo (D-1)',
    salvoSi: {
      patron: /\bpuro\b|puramente aleatorio|no (?:lo )?tiene|no es de PLANJUS|a diferencia de PLANJUS|PLANJUS no/iu,
      porQue:
        'la oración que CONTRASTA los dos sorteos es la que hay que escribir, no la que hay que ' +
        'prohibir: el error de la spec fue atribuirle a PLANJUS una estratificación que no tiene, y ' +
        'decir eso mismo requiere nombrar a los dos juntos. La excepción exige la marca del ' +
        'contraste —«puro», «no lo tiene», «a diferencia de»— y no una negación cualquiera',
    },
  },
  /**
   * Los tres de abajo son **afirmativos con lookbehind de negación**, y la forma
   * importa tanto como el patrón. La primera versión de esta guardia los escribió
   * sin él y se puso roja sobre su propia cabecera: «sin piso constitucional
   * propio» y «no duplica el piso de I+D del LANEF» son EXACTAMENTE las frases que
   * el plan manda escribir. Un prohibido que castiga la renuncia y deja pasar el
   * reclamo está al revés — y el reclamo es lo único que hace daño, porque una
   * fuente ajena tomada en silencio no la reclama nadie de vuelta.
   *
   * El lookbehind no cruza `.`, `;` ni `:` ni las conjunciones adversativas: la
   * negación tiene que gobernar la misma cláusula, no una anterior.
   */
  {
    patron:
      /(?<!\b(?:sin|no|ni|nunca|tampoco|ning[úu]n|ninguna)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,25})(piso constitucional|escal[óo]n)\s+(?:de\s+)?(PLANPREGUNTA|propio|nuestro)|nuestro\s+(?:piso constitucional|escal[óo]n)|noveno escal[óo]n/iu,
    porQue:
      'la Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto. PLANPREGUNTA no reclama ' +
      'piso y no agrega escalón',
  },
  {
    patron:
      /(?<!\b(?:sin|no|ni|nunca|tampoco)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,25})\b(reclama|reclamamos|pide|exige|adopta|se queda con)\b(?:[^.;:\n]){0,60}0,39|0,39%\s+(?:propio|de PLANPREGUNTA|de este PLAN)/iu,
    porQue:
      'el 0,39% es la META LEGAL INCUMPLIDA que diagnostica PLANDIG:285, no un piso de este PLAN. ' +
      'Y su incremento ya tiene dueño escrito: PLANDIG:1112 (D-3)',
  },
  {
    patron:
      /(?<!\b(?:sin|no|ni|nunca|tampoco)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,25})\b(reclama|reclamamos|pide|exige|adopta|duplica|se queda con)\b(?:[^.;:\n]){0,60}0,20?%|0,20?%\s+(?:propio|de PLANPREGUNTA|de este PLAN)/iu,
    porQue: 'el 0,2% del PBI es el piso de I+D del LANEF y es de PLANEN:1489 (D-5). El patrón admite las ' +
      'dos grafías —«0,2%» es la del corpus y «0,20%» la que sale de normalizar— porque un prohibido ' +
      'que solo mira una de las dos deja pasar la que el documento va a escribir de verdad',
  },
  {
    patron: /1\.400\s*[–—-]\s*2\.400/u,
    ambito: 'cabecera',
    porQue:
      'el rango anual no se puede afirmar antes de la Sección 13: 1.400 × 15 = 21.000 y 2.400 × 15 ' +
      '= 36.000, contra los 16.500–26.000 sobre los que se corrió el gate (D-2)',
  },
  {
    patron: /Banca\s+(Portátil|de Regreso)/iu,
    porQue: '«Banca» ya significa sector bancario en el corpus. El dispositivo se llama Cátedra',
  },
  {
    patron: /\b(TODO|TKTK|XXX)\b|\[pendiente\]|«PENDIENTE»|\{PENDIENTE\}/u,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
];

/**
 * `ANLIS` y `Malbrán` no van como prohibido de regex porque lo que está mal no
 * es la palabra sino la ausencia de su declaración: cero ocurrencias en los
 * veinticuatro documentos del taller. Se verifica aparte, en
 * `verificarEstrenoDeclarado()`, que es un chequeo de presencia condicionada y
 * no de ausencia.
 */
const ESTRENOS_QUE_SE_DECLARAN: { termino: RegExp; declaracion: RegExp; porQue: string }[] = [
  {
    termino: /\b(ANLIS|Malbrán)\b/u,
    declaracion: /no aparece|nunca aparece|cero ocurrencias|no lo nombra|ninguna menci[óo]n/iu,
    porQue:
      'ANLIS Malbrán tiene cero ocurrencias en los 24 documentos del taller. Se estrena ' +
      'declarándolo, o el lector supone que ya estaba',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo. Heredadas del tramo C con sus arreglos ya adentro.
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

/** «0,25 – 0,30» → [25, 30]; «0,10» → [10, 10]; «40» → [4000, 4000]. */
function rango(celda: string): [number, number] | null {
  const nums = celda
    .replace(',', '.')
    .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1|$2')
    .split('|');
  const vals = nums.map((s) => {
    const m = /-?\d+(?:[.,]\d+)?/.exec(s.replace(',', '.'));
    return m ? Number(m[0]) : NaN;
  });
  if (vals.length === 0 || vals.some(Number.isNaN)) return null;
  const bajo = c(vals[0] ?? NaN);
  const alto = c(vals.length > 1 ? (vals[vals.length - 1] ?? NaN) : (vals[0] ?? NaN));
  return [bajo, alto];
}

const esFilaDeTabla = (l: string): boolean => l.trim().startsWith('|');
const esSeparadorDeTabla = (l: string): boolean => /^\|[\s:|-]+\|$/.test(l.trim());
const esEncabezado = (l: string): boolean => /^#{1,6}\s/.test(l.trim());

/**
 * Las filas de LA tabla cuya cabecera contiene todas las columnas pedidas, en
 * ORDEN. Los tres modos de falla que el tramo C encontró vienen arreglados de
 * fábrica, porque los tres fallan abierto:
 *
 * 1. **Dos tablas con las mismas columnas.** `findIndex` devolvía la primera y
 *    la segunda no la miraba nadie. Ahora: si el ancla no es única, el chequeo
 *    NO corre y lo dice.
 * 2. **El párrafo intercalado cortaba el parseo.** Este corpus parte tablas, así
 *    que la mitad de abajo quedaba sin verificar y un chequeo del tipo «cada
 *    fila tiene columna X» pasaba en verde sobre filas que nunca vio. Ahora el
 *    párrafo no corta: cortan los encabezados y la cabecera de otra tabla.
 * 3. **La cabecera se reconocía por CONJUNTO y no por ORDEN.** Una tabla con las
 *    columnas permutadas se verificaba entera contra la columna equivocada.
 *    Ahora la celda k tiene que contener la columna k.
 *
 * `exigirContigua` reporta el corte además de parsearlo: una tabla contable con
 * un párrafo en el medio ya no se lee como tabla, y el renglón del otro lado del
 * corte es exactamente donde se esconde la fila que nadie quiere sumar.
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

  const i = cabeceras[0] ?? 0;
  const filas: string[][] = [];
  const cortes: number[] = [];
  let candidatas: number[] = [];
  for (let j = i + 1; j < lineas.length; j++) {
    const l = lineas[j] ?? '';
    if (esEncabezado(l)) break;
    if (!esFilaDeTabla(l)) {
      if (filas.length > 0) candidatas.push(j);
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
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
        `${String(cortes.length)} línea(s) que no son fila (línea ${cortes.map((k) => String(k + 1)).join(', ')})`,
    );
  }

  return { filas, errores };
}

/**
 * El tramo de líneas de una sección: desde su H2 hasta el siguiente H2. Si el
 * H2 no es único, el chequeo NO corre y lo dice — un H2 señuelo en una cita
 * hace que todo lo que cuelga de este tramo se verifique sobre el texto
 * equivocado.
 */
function tramoDeSeccion(lineas: string[], h2: string): { tramo: string[] | null; errores: string[] } {
  const indices = lineas.flatMap((l, k) => (l.trim() === h2 ? [k] : []));
  if (indices.length === 0) return { tramo: null, errores: [] };
  if (indices.length > 1) {
    return {
      tramo: null,
      errores: [
        `«${h2}» aparece ${String(indices.length)} veces (líneas ${indices.map((k) => String(k + 1)).join(', ')}): ` +
          'si el ancla no es única, el chequeo no corre',
      ],
    };
  }
  const i = indices[0] ?? 0;
  let fin = lineas.length;
  for (let j = i + 1; j < lineas.length; j++) {
    if ((lineas[j] ?? '').startsWith('## ')) {
      fin = j;
      break;
    }
  }
  return { tramo: lineas.slice(i + 1, fin), errores: [] };
}

/**
 * El tramo de ORACIÓN que contiene a `[desde, hasta)`. El corte es un salto de
 * línea o un punto seguido de espacio o de fin. El resultado se ensancha al span
 * del match como último recaudo: el ámbito de una excepción nunca puede ser más
 * chico que lo que la regla acusó.
 */
function oracionDe(texto: string, desde: number, hasta: number): string {
  const corta = (i: number): boolean =>
    texto[i] === '\n' || (texto[i] === '.' && (i + 1 >= texto.length || /\s/.test(texto[i + 1] ?? '')));
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

// ─────────────────────────────────────────────────────────────────────────────
// Los chequeos.
// ─────────────────────────────────────────────────────────────────────────────

/** Presencia y orden de los H2. */
function verificarSecciones(lineas: string[]): string[] {
  const errores: string[] = [];
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
  return errores;
}

/** Epígrafes: default «lleva», opt-out verificado en las dos direcciones. */
function verificarEpigrafes(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const h2 of SECCIONES_ESPERADAS) {
    const { tramo, errores: errTramo } = tramoDeSeccion(lineas, h2);
    errores.push(...errTramo);
    if (tramo === null) continue;
    const primera = (tramo.find((l) => l.trim() !== '') ?? '').trim();
    const m = EPIGRAFE.exec(primera);
    const exenta = SIN_EPIGRAFE.includes(h2);

    if (exenta) {
      if (m !== null) {
        errores.push(
          `«${h2}» está en la lista de secciones SIN epígrafe y trae uno: la exención quedó vieja, ` +
            'y una lista opt-out que no se verifica al revés es una lista opt-in con otro nombre',
        );
      }
      continue;
    }
    if (m === null) {
      errores.push(`«${h2}» no abre con epígrafe (blockquote en itálica y entrecomillado)`);
    } else if ((m[1] ?? '').length < LARGO_MINIMO_DE_EPIGRAFE) {
      errores.push(`«${h2}»: el epígrafe tiene ${String((m[1] ?? '').length)} caracteres y es un relleno`);
    }
  }
  return errores;
}

/** Subsecciones: cantidad y numeración correlativa. */
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
        `«${h2}» tiene ${String(numeros.length)} subsección(es) «### ${prefijo}.N {título}» y se ` +
          `esperaban ${String(cuantas)} — ${porQue}`,
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
 * Cifras canónicas: el valor tiene que aparecer, y en la MISMA ORACIÓN tiene que
 * estar su domicilio.
 *
 * El descubrimiento automático es el punto 2 de la doctrina: si una entrada sin
 * `opcional` no tiene NINGUNA ocurrencia con ancla, es error. Eso encuentra las
 * que faltan por construcción, en vez de por memoria.
 */
function verificarCifras(raw: string): string[] {
  const errores: string[] = [];
  for (const { valor, ancla, porQue, opcional } of CIFRAS_CANONICAS) {
    const re = new RegExp(valor.source, valor.flags.includes('g') ? valor.flags : `${valor.flags}g`);
    let m: RegExpExecArray | null;
    let apariciones = 0;
    let conAncla = 0;
    while ((m = re.exec(raw)) !== null) {
      apariciones += 1;
      if (ancla.test(oracionDe(raw, m.index, m.index + m[0].length))) conAncla += 1;
      if (m[0].length === 0) re.lastIndex += 1;
    }
    if (apariciones === 0) {
      if (opcional === undefined) errores.push(`falta la cifra canónica ${String(valor)} — ${porQue}`);
      continue;
    }
    if (conAncla === 0) {
      errores.push(
        `la cifra ${String(valor)} aparece ${String(apariciones)} vez/veces y NINGUNA con su ` +
          `domicilio (${String(ancla)}) en la misma oración — ${porQue}`,
      );
    }
  }
  return errores;
}

/** Prohibidos, con el ámbito que cada uno declara. */
function verificarProhibidos(raw: string, lineas: string[]): string[] {
  const errores: string[] = [];
  const plano = raw.replace(/\*\*/g, '');
  const cabecera = lineas.slice(0, 60).join('\n').replace(/\*\*/g, '');
  for (const { patron, porQue, ambito, salvoSi } of PROHIBIDOS) {
    const texto = ambito === 'cabecera' ? cabecera : plano;
    const re = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex += 1;
        continue;
      }
      // La excepción se mide sobre la ORACIÓN del match: misma unidad que el patrón.
      if (salvoSi && salvoSi.patron.test(oracionDe(texto, m.index, m.index + m[0].length))) continue;
      const nLinea = texto.slice(0, m.index).split('\n').length;
      errores.push(
        `${ambito === 'cabecera' ? 'cabecera, ' : ''}línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`,
      );
      break;
    }
  }
  return errores;
}

/** Un término que el corpus no tiene sólo se puede estrenar declarándolo. */
function verificarEstrenoDeclarado(raw: string): string[] {
  const errores: string[] = [];
  for (const { termino, declaracion, porQue } of ESTRENOS_QUE_SE_DECLARAN) {
    const re = new RegExp(termino.source, `${termino.flags.replace('g', '')}g`);
    let m: RegExpExecArray | null;
    let apariciones = 0;
    let declarado = false;
    while ((m = re.exec(raw)) !== null) {
      apariciones += 1;
      if (declaracion.test(oracionDe(raw, m.index, m.index + m[0].length))) declarado = true;
      if (m[0].length === 0) re.lastIndex += 1;
    }
    if (apariciones > 0 && !declarado) {
      errores.push(
        `${String(termino)} aparece ${String(apariciones)} vez/veces y ninguna declara que el corpus ` +
          `no lo nombra — ${porQue}`,
      );
    }
  }
  return errores;
}

/** `PISOS_SEGUN_EL_TALLER` del test canónico: PLAN → [bajo, alto] en centésimas. */
function pisosDelCanon(): Map<string, [number, number]> {
  const src = readFileSync(CANON_PISOS, 'utf8');
  const bloque = /const PISOS_SEGUN_EL_TALLER[^{]*\{([\s\S]*?)\n\};/.exec(src);
  const out = new Map<string, [number, number]>();
  if (!bloque) return out;
  const re = /(PLAN[A-Z0-9]+):\s*\{\s*floor:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bloque[1] ?? '')) !== null) {
    const r = rango(m[2] ?? '');
    if (r && m[1] !== undefined) out.set(m[1], r);
  }
  return out;
}

/**
 * PLANPREGUNTA no tiene piso constitucional y eso se verifica contra la única
 * fuente canónica, no contra la buena voluntad del documento. Si algún día
 * aparece en el test, la guardia lo dice: o el PLAN cambió de diseño o alguien
 * lo cargó por error, y las dos cosas hay que enterarse.
 */
function verificarQueNoTienePiso(): string[] {
  const canon = pisosDelCanon();
  if (canon.size === 0) return [`no se pudo leer PISOS_SEGUN_EL_TALLER de ${CANON_PISOS}`];
  if (canon.has('PLANPREGUNTA')) {
    return [
      'PLANPREGUNTA figura en PISOS_SEGUN_EL_TALLER: este PLAN no reclama piso constitucional y la ' +
        'Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto',
    ];
  }
  return [];
}

/**
 * **LA RAMPA, QUE ES EL HALLAZGO D-2 CONVERTIDO EN CHEQUEO.** La spec declaraba
 * 1.400-2.400M/año en régimen *y* 16.500-26.000M a quince años, y las dos cosas
 * no cierran: 1.400 x 15 = 21.000 y 2.400 x 15 = 36.000. El total es el insumo
 * sobre el que se corrió el gate de spin-off y está publicado en el acta, así que
 * **la banda que se corrige es la anual**. Esta tabla es la corrección, y se
 * verifica sumándola: los subtotales tienen que dar adentro de 16.500-26.000, y
 * cada subtotal tiene que ser el producto de su anual por sus años — porque una
 * tabla que declara subtotales a mano cierra siempre.
 */
const COLUMNAS_RAMPA = ['Fase', 'Años', 'Anual bajo', 'Anual alto', 'Subtotal bajo', 'Subtotal alto'];
/** La banda del gate, en USD millones a quince años. No es negociable acá. */
const GATE_BAJO = 16_500;
const GATE_ALTO = 26_000;

/** «1.500» -> 1500; «16.500» -> 16500. Sin centésimas: son millones enteros. */
function entero(celda: string): number | null {
  const m = /-?[\d.]+/.exec(celda.replace(/\s/g, ''));
  if (!m) return null;
  const n = Number(m[0].replace(/\./g, ''));
  return Number.isFinite(n) ? n : null;
}

function verificarRampa(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_RAMPA, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push('no se encontró la tabla de la rampa (columnas Fase/Años/Anual/Subtotal)');
    }
    return errores;
  }

  let bajo = 0;
  let alto = 0;
  let anios = 0;
  let totalDeclarado: [number, number] | null = null;

  for (const fila of filas) {
    if (/^\**\s*total/i.test((fila[0] ?? '').trim())) {
      const b = entero(fila[4] ?? '');
      const a = entero(fila[5] ?? '');
      if (b !== null && a !== null) totalDeclarado = [b, a];
      const n = entero(fila[1] ?? '');
      if (n !== null && n !== 15) {
        errores.push(`la fila de total declara ${String(n)} años y la ventana del gate son 15`);
      }
      continue;
    }
    const n = entero(fila[1] ?? '');
    const ab = entero(fila[2] ?? '');
    const aa = entero(fila[3] ?? '');
    const sb = entero(fila[4] ?? '');
    const sa = entero(fila[5] ?? '');
    if (n === null || ab === null || aa === null || sb === null || sa === null) {
      errores.push(`rampa: no se pudo leer la fila «${fila[0] ?? ''}»`);
      continue;
    }
    // Los subtotales no se creen: se recalculan. Una tabla con subtotales a mano cierra siempre.
    if (ab * n !== sb) {
      errores.push(`rampa, «${fila[0] ?? ''}»: ${String(ab)} x ${String(n)} = ${String(ab * n)} y declara ${String(sb)}`);
    }
    if (aa * n !== sa) {
      errores.push(`rampa, «${fila[0] ?? ''}»: ${String(aa)} x ${String(n)} = ${String(aa * n)} y declara ${String(sa)}`);
    }
    bajo += sb;
    alto += sa;
    anios += n;
  }

  if (anios !== 15) errores.push(`las fases de la rampa suman ${String(anios)} años y la ventana del gate son 15`);
  if (bajo < GATE_BAJO || bajo > GATE_ALTO) {
    errores.push(
      `la rampa suma ${String(bajo)} en el extremo bajo, fuera de la banda del gate ${String(GATE_BAJO)}-${String(GATE_ALTO)}`,
    );
  }
  if (alto < GATE_BAJO || alto > GATE_ALTO) {
    errores.push(
      `la rampa suma ${String(alto)} en el extremo alto, fuera de la banda del gate ${String(GATE_BAJO)}-${String(GATE_ALTO)}`,
    );
  }
  if (totalDeclarado === null) {
    errores.push('la tabla de la rampa no tiene fila de total legible');
  } else if (totalDeclarado[0] !== bajo || totalDeclarado[1] !== alto) {
    errores.push(
      `la fila de total dice ${String(totalDeclarado[0])}-${String(totalDeclarado[1])} y las fases suman ${String(bajo)}-${String(alto)}`,
    );
  }
  return errores;
}

/**
 * El split del FSC, en los DOS documentos. Es la única tabla que existe por
 * duplicado a propósito, y por eso es la que más fácil se desincroniza: dos
 * documentos con dos versiones del mismo protocolo es exactamente el defecto que
 * la regla de fuentes de PLANPACTO §5.1 existe para evitar.
 *
 * El chequeo del lado de PLANTER lo enciende la Task 11. Hasta entonces sólo
 * corre el de acá, y sólo si la tabla existe.
 */
const COLUMNAS_SPLIT = ['Línea', 'Antes', 'Después'];

function verificarSplit(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_SPLIT, true);
  if (filas === null) return errores;

  let antes = 0;
  let despues = 0;
  let filasReales = 0;
  for (const fila of filas) {
    if (/^total/i.test(fila[0] ?? '')) continue;
    const a = rango(fila[1] ?? '');
    const d = rango(fila[2] ?? '');
    if (a === null && (fila[1] ?? '').trim() !== '—') {
      errores.push(`split: no se pudo leer «Antes» de «${fila[0] ?? ''}»`);
      continue;
    }
    if (d === null) {
      errores.push(`split: no se pudo leer «Después» de «${fila[0] ?? ''}»`);
      continue;
    }
    antes += a ? a[0] : 0;
    despues += d[0];
    filasReales += 1;
  }

  if (filasReales !== 6) {
    errores.push(`el split nuevo tiene ${String(filasReales)} destinos y tiene que tener 6`);
  }
  if (antes !== c(100)) {
    errores.push(`la columna «Antes» del split suma ${fmt(antes)} y el protocolo de PLANTER reparte 100`);
  }
  if (despues !== c(100)) {
    errores.push(
      `la columna «Después» del split suma ${fmt(despues)} y tiene que dar 100: un protocolo que no ` +
        'cierra en 100 es un protocolo que reparte plata que no existe o que se olvida plata que sí',
    );
  }
  return errores;
}

/** La otra mitad del split, en PLANTER. Se enciende cuando la Task 11 la escribe. */
function verificarSplitEnPlanter(): string[] {
  let ajeno: string;
  try {
    ajeno = readFileSync(PLANTER, 'utf8');
  } catch {
    return [`no se pudo leer ${PLANTER}`];
  }
  if (!/Fondo de la Pregunta/u.test(ajeno)) return []; // Task 11 todavía no corrió.

  const errores: string[] = [];
  const esperados: [string, number][] = [
    ['DCM', 40],
    ['Territorios', 20],
    ['Restauración', 15],
    ['ANTSPO', 10],
    ['Intergeneracional', 7],
    ['Pregunta', 8],
  ];
  for (const [nombre, pct] of esperados) {
    const re = new RegExp(`${String(pct)}%[^.\\n]{0,80}${nombre}|${nombre}[^.\\n]{0,80}${String(pct)}%`, 'iu');
    if (!re.test(ajeno)) {
      errores.push(
        `PLANTER no declara «${String(pct)}% ${nombre}»: el split tiene que decir lo mismo en los dos ` +
          'documentos, o el PLAN cobra de un protocolo que no lo nombra',
      );
    }
  }
  return errores;
}

/** La cabecera de auditoría, una sola vez y al principio. */
function verificarCabecera(lineas: string[]): string[] {
  const errores: string[] = [];
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }
  const iMandato = lineas.findIndex((l) => l.trim() === H2_MANDATO);
  const iH1 = lineas.findIndex((l) => l.startsWith('# PLANPREGUNTA'));
  if (iH1 === -1) errores.push('falta el H1 «# PLANPREGUNTA — …»');
  if (iMandato !== -1 && iH1 !== -1 && iMandato < iH1) {
    errores.push('el H2 del mandato está antes del H1: la anatomía del corpus es H1 → H2 de mandato → H3 de versión');
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

  const lineas = raw.split('\n');
  const errores: string[] = [
    ...verificarSecciones(lineas),
    ...verificarEpigrafes(lineas),
    ...verificarSubsecciones(lineas),
    ...verificarCoberturaDeSubsecciones(lineas),
    ...verificarAnatomiaDeFallas(lineas),
    ...verificarCifras(raw),
    ...verificarProhibidos(raw, lineas),
    ...verificarEstrenoDeclarado(raw),
    ...verificarQueNoTienePiso(),
    ...verificarVerticales(lineas),
    ...verificarRampa(lineas),
    ...verificarSplit(lineas),
    ...verificarSplitEnPlanter(),
    ...verificarCabecera(lineas),
    ...verificarPortada(lineas),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANPREGUNTA encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANPREGUNTA OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(lineas.length)} líneas, ` +
      `${String(palabras)} palabras. Sin piso constitucional, verificado contra el canon del taller.`,
  );
}

main();
