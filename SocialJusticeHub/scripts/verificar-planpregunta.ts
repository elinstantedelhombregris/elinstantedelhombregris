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
const SECCIONES_ESPERADAS: string[] = [H2_MANDATO];

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
const SUBSECCIONES_ESPERADAS: { h2: string; prefijo: string; cuantas: number; porQue: string }[] =
  [];

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
      /(?<!\b(?:sin|no|ni|nunca|tampoco)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,25})\b(reclama|reclamamos|pide|exige|adopta|duplica|se queda con)\b(?:[^.;:\n]){0,60}0,20%|0,20%\s+(?:propio|de PLANPREGUNTA|de este PLAN)/iu,
    porQue: 'el 0,20% del PBI es el piso de I+D del LANEF y es de PLANEN:1489 (D-5)',
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
  for (const { patron, porQue, ambito } of PROHIBIDOS) {
    const texto = ambito === 'cabecera' ? cabecera : plano;
    const m = patron.exec(texto);
    if (m) {
      const nLinea = texto.slice(0, m.index).split('\n').length;
      errores.push(
        `${ambito === 'cabecera' ? 'cabecera, ' : ''}línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`,
      );
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
    ...verificarCifras(raw),
    ...verificarProhibidos(raw, lineas),
    ...verificarEstrenoDeclarado(raw),
    ...verificarQueNoTienePiso(),
    ...verificarSplit(lineas),
    ...verificarSplitEnPlanter(),
    ...verificarCabecera(lineas),
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
