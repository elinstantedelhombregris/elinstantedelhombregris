/**
 * Guardia del documento de PLANPACTO.
 *
 * Run: npx tsx scripts/verificar-planpacto.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las cifras canónicas del tramo A aparezcan, que los strings
 * prohibidos no aparezcan, y que no queden marcadores de pendiente.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * Cada tarea del plan agrega sus secciones a SECCIONES_ESPERADAS antes de
 * escribirlas: primero la guardia falla, después el documento la hace pasar.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. La guardia cruza la tabla del documento contra ella. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  '## Vigésimo Cuarto Mandato del Proyecto ¡BASTA!',
  '## PREÁMBULO — EL RECIBO QUE NUNCA LLEGÓ',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS OCHO FALLAS DEL RÉGIMEN FISCAL ARGENTINO',
  '## SECCIÓN 1: LA CRISIS — LA PLATA SE REPARTE CON UNA LEY QUE VENCIÓ EN 1990',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  '## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS ONCE DISPOSITIVOS',
  '## SECCIÓN 4: LA ESCALERA Y EL TECHO',
  '## SECCIÓN 5: LO QUE SE COBRA',
  '## SECCIÓN 6: LO QUE SE REPARTE',
  '## SECCIÓN 7: EL CONSEJO FEDERAL FISCAL (CFF)',
  '## SECCIÓN 8: MODELO ECONÓMICO Y FISCAL',
  '## SECCIÓN 9: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 10: EL MAPA DE PERDEDORES',
  '## SECCIÓN 11: HOJA DE RUTA',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 12: TABLERO NACIONAL FISCAL',
  '## SECCIÓN 14: DIMENSIÓN FEDERAL',
  '## SECCIÓN 15: VISIÓN 2040',
  '## SECCIÓN 16: PROTOCOLO DE FALLA',
  '## CIERRE',
];

/**
 * Cifras verificadas en el tramo A que el documento no puede contradecir.
 * Fuente: v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md sección 2, y
 * SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts.
 *
 * OJO — 7,82, 9,41, 2,40 y 8,62 **no** viven acá. Un `includes()` sobre el archivo
 * entero los encuentra en la tesis y en los residuos aunque las tablas ya no los
 * produzcan: se puede romper el escalón 4, el piso de PLANVIV y el total de la
 * tabla de pisos, los tres a la vez, y la guardia seguir en verde. Esos cuatro
 * números se verifican sumando las tablas — ver verificarTablas().
 */
const CIFRAS_CANONICAS: { valor: string; porQue: string }[] = [
  { valor: 'sustituye', porQue: 'el piso único es sustitutivo: sin esa palabra la lectura aditiva es legítima' },
  {
    valor: 'El Estado es de vidrio y el ciudadano es opaco',
    porQue: 'la frase que separa el Libro Mayor del Recibo (arreglo 6)',
  },
  {
    valor: 'RIGI',
    porQue:
      'el régimen que congela por 30 años la estructura que el PLAN reescribe; PLANPACTO no lo nombraba ni una vez. ' +
      'Ojo: sí está en el corpus — PLANTER 0.2, CASCADA_LEGAL L.N-10, READINESS_GATES fila PLANTER',
  },
];

/** Strings que no pueden aparecer, con el motivo de cada uno. */
const PROHIBIDOS: { patron: RegExp; porQue: string }[] = [
  {
    patron: /Procurement OS/i,
    porQue:
      'cero ocurrencias en PLANDIG_Argentina_ES.md; existe sólo en SOURCE_OF_FUNDS_LEDGER.md como F12, clase future_return',
  },
  {
    patron: /vot(a|ada|ado)s? por (la )?Mesa Civil/i,
    porQue: 'PLANMESA:16 dice consulta no vinculante, y el art. 75 inc. 8 CN le da el presupuesto al Congreso',
  },
  { patron: /6,0% del PBI/, porQue: 'versión descartada del piso único; el piso es 2,40%' },
  { patron: /3,5% del PBI/, porQue: 'versión descartada del piso único; el piso es 2,40%' },
  {
    patron: /«PENDIENTE»|\{PENDIENTE\}|TODO:/,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Las dos tablas que el documento existe para fijar: se parsean y se suman.
// Buscar los totales como string no sirve — siguen apareciendo en la prosa.
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

/** (a) Escalera, (b) pisos, (c) cruce contra el canon. Devuelve los errores. */
function verificarTablas(lineas: string[]): string[] {
  const errores: string[] = [];

  // (a) La Escalera: ocho escalones, «Conserva» suma 2,40 y «Acumulado» es la corrida.
  const esc = filasDeTabla(lineas, ['Escalón', 'Conserva', 'Acumulado']);
  if (!esc) {
    errores.push('no se encontró la tabla de la Escalera (columnas Escalón/Conserva/Acumulado)');
  } else if (esc.length !== 8) {
    errores.push(`la Escalera tiene ${String(esc.length)} escalones y se esperaban 8`);
  } else {
    let corrida = 0;
    esc.forEach((fila, i) => {
      const conserva = rango(fila[2]);
      const acumulado = rango(fila[3]);
      if (!conserva || !acumulado) {
        errores.push(`escalón ${String(i + 1)}: no se pudo leer «${fila[2]}» / «${fila[3]}»`);
        return;
      }
      corrida += conserva[0];
      if (acumulado[0] !== corrida) {
        errores.push(
          `escalón ${String(i + 1)}: Acumulado dice ${fmt(acumulado[0])} y la suma corrida da ${fmt(corrida)}`,
        );
      }
    });
    if (corrida !== c(2.4)) {
      errores.push(`la columna Conserva suma ${fmt(corrida)} y el piso único es 2,40`);
    }
  }

  // (b) Los diecisiete pisos: suman 7,82 – 9,41, punto medio 8,62.
  const pisos = filasDeTabla(lineas, ['PLAN', 'Piso declarado', 'Dónde lo declara']);
  const delDoc = new Map<string, [number, number]>();
  let totalDeclarado: [number, number] | null = null;
  let medioDeclarado: number | null = null;

  if (!pisos) {
    errores.push('no se encontró la tabla de los pisos (columnas PLAN/Piso declarado)');
  } else {
    for (const fila of pisos) {
      if (/^Total/i.test(fila[0])) {
        totalDeclarado = rango(fila[2]);
        const pm = /punto medio\s*([\d,]+)/i.exec(fila[3] ?? '');
        medioDeclarado = pm ? c(Number(pm[1].replace(',', '.'))) : null;
        continue;
      }
      const r = rango(fila[2]);
      if (!r) {
        errores.push(`${fila[0]}: no se pudo leer el piso «${fila[2]}»`);
        continue;
      }
      delDoc.set(fila[0], r);
    }

    if (delDoc.size !== 17) {
      errores.push(`la tabla de pisos tiene ${String(delDoc.size)} filas y se esperaban 17`);
    }
    const bajos = [...delDoc.values()].reduce((a, [b]) => a + b, 0);
    const altos = [...delDoc.values()].reduce((a, [, x]) => a + x, 0);
    const medio = Math.round((bajos + altos) / 2);

    if (bajos !== c(7.82)) errores.push(`los pisos suman ${fmt(bajos)} en el extremo bajo, y el canon es 7,82`);
    if (altos !== c(9.41)) errores.push(`los pisos suman ${fmt(altos)} en el extremo alto, y el canon es 9,41`);
    if (medio !== c(8.62)) errores.push(`el punto medio calculado da ${fmt(medio)} y el canon es 8,62`);

    if (!totalDeclarado) {
      errores.push('la tabla de pisos no tiene fila de total legible');
    } else if (totalDeclarado[0] !== bajos || totalDeclarado[1] !== altos) {
      errores.push(
        `la fila de total dice ${fmt(totalDeclarado[0])} – ${fmt(totalDeclarado[1])} y las filas suman ${fmt(bajos)} – ${fmt(altos)}`,
      );
    }
    if (medioDeclarado === null) {
      errores.push('la fila de total no declara punto medio');
    } else if (medioDeclarado !== medio) {
      errores.push(`la fila de total declara punto medio ${fmt(medioDeclarado)} y el cálculo da ${fmt(medio)}`);
    }
  }

  // (c) El cruce con la única fuente canónica: tests/unit/pisos-constitucionales.test.ts.
  const canon = pisosDelCanon();
  if (canon.size === 0) {
    errores.push(`no se pudo leer PISOS_SEGUN_EL_TALLER de ${CANON_PISOS}`);
  } else if (delDoc.size > 0) {
    for (const [plan, [bajo, alto]] of canon) {
      /**
       * PLANPACTO está en el canon con su propio 2,40% desde el 2026-08-01, y NO
       * puede estar en esta tabla: la tabla enumera los diecisiete pisos que este
       * PLAN **sustituye**, y el sustituto no es uno de los sustituidos. Si algún
       * día apareciera acá, la suma de la tabla daría 10,22-11,81 — la lectura
       * aditiva que §2.3 declara ilegítima — y la guardia lo diría por la fila de
       * total, no por esta línea.
       */
      if (plan === 'PLANPACTO') continue;
      const doc = delDoc.get(plan);
      if (!doc) {
        errores.push(`${plan}: está en el canon del taller y no en la tabla del documento`);
        continue;
      }
      if (doc[0] !== bajo || doc[1] !== alto) {
        errores.push(
          `${plan}: el documento declara ${fmt(doc[0])}–${fmt(doc[1])} y el canon ${fmt(bajo)}–${fmt(alto)}`,
        );
      }
    }
    for (const plan of delDoc.keys()) {
      if (!canon.has(plan)) errores.push(`${plan}: está en la tabla del documento y no en el canon del taller`);
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
  for (const { patron, porQue } of PROHIBIDOS) {
    const m = patron.exec(raw);
    if (m) {
      const nLinea = raw.slice(0, m.index).split('\n').length;
      errores.push(`línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`);
    }
  }

  // 4) Las dos tablas: parseadas y sumadas, no buscadas como string.
  errores.push(...verificarTablas(lineas));

  // 5) La cabecera de auditoría, una sola vez y al principio.
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }

  if (errores.length > 0) {
    console.error(`La guardia de PLANPACTO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANPACTO OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas, ${String(lineas.length)} líneas. ` +
      'Escalera: 8 escalones que suman 2,40. Pisos: 17 filas que suman 7,82–9,41 (medio 8,62), ' +
      'cruzados contra PISOS_SEGUN_EL_TALLER.',
  );
}

main();
