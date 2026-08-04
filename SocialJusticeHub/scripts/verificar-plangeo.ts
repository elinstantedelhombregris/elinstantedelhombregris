/**
 * Guardia del documento de PLANGEO.
 *
 * Run: npx tsx scripts/verificar-plangeo.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las cifras canónicas aparezcan CON SU DOMICILIO en la misma
 * oración, que los prohibidos no aparezcan, que las anclas que OTROS documentos
 * citan sigan apuntando a lo que dicen, y que el canon siga declarando que
 * PLANGEO no pide piso.
 *
 * La voz y el argumento NO se verifican acá. Una guardia que pretende juzgar
 * prosa da falsa tranquilidad.
 *
 * ── DOCTRINA HEREDADA ───────────────────────────────────────────────────────
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un ERROR, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la ORACIÓN, no la línea).
 *
 * ── LO PROPIO DE ESTA GUARDIA ───────────────────────────────────────────────
 * Es la única del repositorio que **se mira desde afuera**. Cuatro documentos
 * ajenos citan a PLANGEO por número de línea (`PLANGEO:207`, `:223`, `:425`,
 * `:1148-1149`, `:1151`) y ocho de las once ediciones forzadas del bloque
 * S26-S28 corren dos de esas anclas. `verificar-remisiones.ts` detecta que la
 * cita apunte a una línea que existe; esto detecta que la línea siga diciendo
 * lo que el citador afirma que dice, que no es lo mismo y es lo que rompe.
 *
 * El chequeo de piso va **por la negativa**: PLANGEO es `budget_class: XS` y no
 * reclama piso. Si alguien lo saca de SIN_PISO en el canon, el corolario
 * presupuestario del bloque —«siete de los ocho mecanismos tienen costo marginal
 * cercano a cero»— deja de ser cierto y el documento miente sin que falle nada.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANGEO_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANGEO tiene que estar en SIN_PISO. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** Los H2 que el documento tiene que tener, en este orden. */
export const SECCIONES_ESPERADAS: string[] = [
  '## PREÁMBULO — LA FORJA INVISIBLE',
  '## SECCIÓN 1: ARGENTINA EN EL TABLERO — EVALUACIÓN DE POSICIÓN 2026',
  '## SECCIÓN 2: LA DOCTRINA DE LA PLATAFORMA SOBERANA',
  '## SECCIÓN 3: STACK DE GOBERNANZA ECONÓMICA',
  '## SECCIÓN 4: STACK DE SOBERANÍA DIGITAL',
  '## SECCIÓN 5: STACK DE SOBERANÍA DE RECURSOS',
  '## SECCIÓN 6: STACK DE TRANSICIÓN HUMANA',
  '## SECCIÓN 7: STACK DE SOBERANÍA SANITARIA',
  '## SECCIÓN 8: STACK DE SOBERANÍA URBANA',
  '## SECCIÓN 9: STACK DE SOBERANÍA JURÍDICA',
  '## SECCIÓN 10: LA RED SOBERANA — ARQUITECTURA DE ALIANZAS',
  '## SECCIÓN 11: EL MAPA DE FRICCIÓN — MATRIZ CONSOLIDADA DE AMENAZAS',
  '## SECCIÓN 12: LA ESTRATEGIA DE DOBLE CAPA',
  '## SECCIÓN 13: NAVEGACIÓN DEL EJE US-CHINA',
  '## SECCIÓN 14: ALINEAMIENTO CON LA UNIÓN EUROPEA',
  '## SECCIÓN 15: REFORMA DEL MERCOSUR Y LIDERAZGO REGIONAL',
  '## SECCIÓN 16: BRICS+ Y EL SUR GLOBAL',
  '## SECCIÓN 17: ARQUITECTURA COMERCIAL Y FINANCIERA',
  '## SECCIÓN 18: POSTURA DE DEFENSA Y CIBERSOBERANÍA',
  '## SECCIÓN 19: MALVINAS — LA ESTRATEGIA BIFURCADA',
  '## SECCIÓN 20: ATLÁNTICO SUR Y ANTÁRTIDA — PROYECCIÓN AUSTRAL',
  '## SECCIÓN 21: IDEAS SIN FRONTERA — HERRAMIENTAS QUE AÚN NO EXISTEN',
  '## SECCIÓN 22: PROTOCOLOS DE FALLA',
  '## SECCIÓN 23: PRESUPUESTO E INVERSIÓN',
  '## SECCIÓN 24: INTEGRACIÓN ¡BASTA!',
  '## SECCIÓN 25: VISIÓN 2040',
  '## SECCIÓN 26: EL CONTRATO COMO DEFENSA',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## Parche post-auditoría 2026-04-26',
];

/**
 * Cifras que no pueden aparecer huérfanas. `domicilio` es el término que tiene
 * que estar en la MISMA ORACIÓN.
 */
export const CIFRAS_CANONICAS: { cifra: string; domicilio: string[]; desc: string }[] = [
  {
    cifra: 'USD 500-800M',
    domicilio: ['naval'],
    desc: 'la línea que la S27.4 del bloque nuevo REASIGNA, no suma. Si pierde el rótulo naval, la reasignación deja de poder señalarla',
  },
  {
    cifra: '0,7% de su PBI',
    domicilio: ['defensa'],
    desc: 'el gasto de defensa del que parte toda la S18. Sin domicilio es un número suelto',
  },
];

/**
 * Patrones que NO pueden aparecer. `excepcion` es el texto que, en la misma
 * oración, vuelve legítima la aparición.
 */
export const PROHIBIDOS: { patron: string; excepcion?: string; porque: string }[] = [
  {
    patron: 'AFIP',
    porque: 'el fisco se llama ARCA desde octubre de 2024. PLANGEO hoy no nombra a ninguno de los dos y así tiene que seguir salvo que lo nombre bien',
  },
];

/**
 * Las anclas que documentos AJENOS citan por número de línea. La guardia
 * verifica que la línea siga conteniendo lo que el citador afirma.
 *
 * Sin esto, una edición de PLANGEO corre las líneas y rompe en silencio a
 * PLANPUERTA, a `verificar-planpuerta.ts` y a la arista `d200` de
 * `arquitecto-data.ts`. Es el modo de falla que en el tramo D de PLANPREGUNTA
 * rompió ocho remisiones de PLANARCO y se encontró por casualidad.
 */
export const ANCLAS_AJENAS: { linea: number; debeContener: string; quienCita: string }[] = [
  {
    linea: 207,
    debeContener: 'cero lock-in',
    quienCita: 'PLANPREGUNTA (documento, copia pública, .mdx de v2) y arquitecto-data.ts:711 (arista d200)',
  },
  {
    linea: 425,
    debeContener: 'Coordinación del Triángulo',
    quienCita: 'PLANPUERTA (documento, spec, plan) y verificar-planpuerta.ts:397',
  },
  {
    linea: 1148,
    debeContener: 'Las ciudades adoptantes se conectan directamente a la Red Soberana',
    quienCita: 'PLANPUERTA (documento, spec, plan) y verificar-planpuerta.ts:402',
  },
  {
    linea: 1151,
    debeContener: 'Por qué es poderosa',
    quienCita: 'ídem — es el ancla :1151 que el plan de PLANPUERTA documenta explícitamente',
  },
];

/** Corta el cuerpo en oraciones. Unidad de medida de cifras y prohibidos. */
function oraciones(raw: string): string[] {
  return raw
    .split('\n')
    .flatMap((l) => l.split(/(?<=[.:;!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
}

function verificarSecciones(lineas: string[]): string[] {
  const errores: string[] = [];
  const h2 = lineas.filter((l) => l.startsWith('## '));
  for (const esperada of SECCIONES_ESPERADAS) {
    const n = h2.filter((l) => l.trim() === esperada).length;
    if (n === 0) errores.push(`falta la sección: ${esperada}`);
    if (n > 1) errores.push(`sección duplicada (${String(n)}x): ${esperada}`);
  }
  const indices = SECCIONES_ESPERADAS.map((s) => h2.findIndex((l) => l.trim() === s));
  for (let i = 1; i < indices.length; i++) {
    const prev = indices[i - 1];
    const cur = indices[i];
    if (prev === undefined || cur === undefined) continue;
    if (prev !== -1 && cur !== -1 && cur < prev) {
      errores.push(`fuera de orden: «${String(SECCIONES_ESPERADAS[i])}» aparece antes que la anterior`);
    }
  }
  return errores;
}

function verificarCifras(raw: string): string[] {
  const errores: string[] = [];
  const oras = oraciones(raw);
  for (const { cifra, domicilio, desc } of CIFRAS_CANONICAS) {
    const conCifra = oras.filter((o) => o.includes(cifra));
    // Doctrina 2: cero ocurrencias es ERROR, no pase.
    if (conCifra.length === 0) {
      errores.push(`la cifra canónica «${cifra}» (${desc}) no aparece en ninguna parte`);
      continue;
    }
    for (const o of conCifra) {
      if (!domicilio.some((d) => o.includes(d))) {
        errores.push(`cifra «${cifra}» sin domicilio (${domicilio.join(' | ')}) en: «${o.slice(0, 110)}…»`);
      }
    }
  }
  return errores;
}

function verificarProhibidos(raw: string): string[] {
  const errores: string[] = [];
  const oras = oraciones(raw);
  for (const { patron, excepcion, porque } of PROHIBIDOS) {
    for (const o of oras) {
      if (!o.includes(patron)) continue;
      if (excepcion !== undefined && o.includes(excepcion)) continue;
      errores.push(`prohibido «${patron}» (${porque}) en: «${o.slice(0, 110)}…»`);
    }
  }
  return errores;
}

/**
 * El chequeo que mira hacia afuera. Falla con el número de línea VIEJO y el
 * contenido esperado, para que el que rompió sepa qué buscar y dónde arreglar.
 */
function verificarAnclasAjenas(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const { linea, debeContener, quienCita } of ANCLAS_AJENAS) {
    const actual = lineas[linea - 1];
    if (actual === undefined) {
      errores.push(
        `el ancla PLANGEO:${String(linea)} quedó fuera del documento (tiene ${String(lineas.length)} líneas). ` +
          `La cita «${debeContener}» la usan: ${quienCita}`,
      );
      continue;
    }
    if (!actual.includes(debeContener)) {
      errores.push(
        `PLANGEO:${String(linea)} ya no contiene «${debeContener}» — dice «${actual.slice(0, 80)}…». ` +
          `Hay que recalcular el ancla y actualizarla en: ${quienCita}`,
      );
    }
  }
  return errores;
}

/**
 * PLANGEO no reclama piso y el bloque S26-S28 razona sobre esa ausencia. Se
 * verifica en forma AFIRMATIVA contra el canon: si PLANGEO sale de SIN_PISO, o
 * si aparece con piso declarado, la guardia falla.
 */
function verificarSinPiso(): string[] {
  let canon: string;
  try {
    canon = readFileSync(CANON_PISOS, 'utf8');
  } catch {
    return [`no se pudo leer el canon de pisos: ${CANON_PISOS}`];
  }
  const m = /const SIN_PISO = \[([\s\S]*?)\]/.exec(canon);
  if (m === null) return ['no se encontró SIN_PISO en el canon de pisos — el ancla no es única o cambió de forma'];
  const bloque = m[1] ?? '';
  if (!bloque.includes("'PLANGEO'")) {
    return [
      'PLANGEO salió de SIN_PISO en el canon de pisos. El corolario presupuestario del bloque S26-S28 ' +
        'asume que no reclama piso; si ahora lo reclama, ese párrafo miente.',
    ];
  }
  if (/PLANGEO:\s*\{\s*floor:/.test(canon)) {
    return ['PLANGEO aparece con piso declarado en el canon y a la vez el documento asume que no pide piso'];
  }
  return [];
}

function main(): void {
  let raw = '';
  try {
    raw = readFileSync(DOC, 'utf8');
  } catch {
    console.error(`No existe el documento: ${DOC}`);
    process.exit(1);
  }

  const lineas = raw.split('\n');
  const errores: string[] = [
    ...verificarSecciones(lineas),
    ...verificarCifras(raw),
    ...verificarProhibidos(raw),
    ...verificarAnclasAjenas(lineas),
    ...verificarSinPiso(),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANGEO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANGEO OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(ANCLAS_AJENAS.length)} anclas ajenas, ` +
      `${String(lineas.length)} líneas, ${String(palabras)} palabras. ` +
      `Ausencia de piso verificada contra el canon.`,
  );
}

/** Se corre sola cuando la invocan directo, y NO cuando alguien la importa. */
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
