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
 */
const CIFRAS_CANONICAS: { valor: string; porQue: string }[] = [
  { valor: '7,82', porQue: 'extremo bajo de los pisos que los 22 reclaman, % del PBI' },
  { valor: '9,41', porQue: 'extremo alto de los pisos que los 22 reclaman, % del PBI' },
  { valor: '2,40', porQue: 'el piso único que PLANPACTO propone, % del gasto primario consolidado' },
  { valor: '8,62', porQue: 'punto medio de los pisos reclamados, % del PBI' },
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

  // 4) La cabecera de auditoría, una sola vez y al principio.
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
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas, ${String(lineas.length)} líneas.`,
  );
}

main();
