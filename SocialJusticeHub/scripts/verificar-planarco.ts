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

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  '## Vigésimo Quinto Mandato del Proyecto ¡BASTA!',
  // Task 2: '## PREÁMBULO — {título}', '## TESIS CENTRAL'
  // Task 3: SECCIÓN 0, 1 y 2 · Task 4: SECCIÓN 3 · Task 5: SECCIÓN 4 · …
];

/**
 * Cifras y fórmulas verificadas que el documento no puede contradecir ni perder.
 * Cada una tiene domicilio abierto y leído antes de escribirla.
 *
 * OJO — acá van sólo los valores que un `includes()` sobre el archivo entero
 * verifica de verdad. Los totales de tabla NO viven acá: se buscan como string
 * y siguen apareciendo en la prosa aunque la tabla que los produce esté rota.
 * Esos se suman — ver verificarTablas().
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
      'el acta retira sólo la vejez del hueco «Discapacidad y vejez»; la discapacidad queda en ' +
      'PLANCUIDADO + PLANSAL y PLANARCO tiene que decirlo — ACTA:169-173',
  },
];

/**
 * Strings que no pueden aparecer, con el motivo de cada uno.
 * Case-insensitive salvo donde el corpus distingue mayúsculas: las siglas
 * (PUAM, PNC) y los marcadores de pendiente (TODO ≠ «todo»).
 * `salvoSi` exime la ocurrencia cuando la línea que la contiene la atribuye.
 */
const PROHIBIDOS: { patron: RegExp; porQue: string; salvoSi?: RegExp }[] = [
  {
    patron: /\b(PUAM|PNC)\b/,
    porQue: 'cero ocurrencias en el corpus: no se estrenan siglas de partidas cuyo monto nadie tiene (C-6)',
  },
  {
    patron: /(?<!\bno\s)(?<!\bno lo\s)(?<!\btampoco\s)(pas[óo]|super[óo]|supera|pasa)\s+el\s+(gate|umbral)/i,
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
    patron: /\bTODO\b|\bTKTK\b|\bXXX\b|\[pendiente\]|«PENDIENTE»|\{PENDIENTE\}/,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
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

  // 2) Las cifras canónicas.
  for (const { valor, porQue } of CIFRAS_CANONICAS) {
    if (!raw.includes(valor)) errores.push(`falta la cifra canónica «${valor}» — ${porQue}`);
  }

  // 3) Los prohibidos.
  for (const { patron, porQue, salvoSi } of PROHIBIDOS) {
    const global = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = global.exec(raw)) !== null) {
      const nLinea = raw.slice(0, m.index).split('\n').length;
      const linea = lineas[nLinea - 1] ?? '';
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

  if (errores.length > 0) {
    console.error(`La guardia de PLANARCO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANARCO OK: ${String(SECCIONES_ESPERADAS.length)} sección(es) esperada(s), ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas, ${String(PROHIBIDOS.length)} patrones prohibidos, ` +
      `${String(lineas.length)} líneas. Sin piso constitucional propio, cruzado contra PISOS_SEGUN_EL_TALLER.`,
  );
}

main();
