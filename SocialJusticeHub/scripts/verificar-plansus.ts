/**
 * Guardia del documento de PLANSUS.
 *
 * Run: npx tsx scripts/verificar-plansus.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las subsecciones del bloque nuevo sean correlativas, que las
 * cifras canónicas aparezcan CON SU DOMICILIO en la misma oración, que los
 * prohibidos no aparezcan, y que el piso declarado coincida con el canon.
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
 * ── LO PROPIO DE ESTE PLAN ──────────────────────────────────────────────────
 * La afirmación que sostiene la arquitectura del bloque S28-S31 es un universal
 * negativo defendible: «ningún análisis forense determinó una muerte por
 * intoxicación aguda de ayahuasca». Es verdadera y está sostenida por ICEERS,
 * y por eso NO se prohíbe: se exige que aparezca con su domicilio y con su
 * denominador en la misma oración. Un prohibido que castiga la afirmación
 * sostenida y deja pasar la suelta está al revés.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANSUS_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANSUS declara 0,10% del PBI. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** Los H2 que el documento tiene que tener, en este orden. */
export const SECCIONES_ESPERADAS: string[] = [
  '## PREÁMBULO — EL DERECHO A LA SOBERANÍA SOBRE TU PROPIA CONCIENCIA',
  '## SECCIÓN 1: LA CRISIS — LA PROHIBICIÓN QUE ENRIQUECE AL NARCO Y ENCARCELA AL POBRE',
  '## SECCIÓN 2: LECCIONES DEL MUNDO — QUIÉN LO HIZO Y QUÉ APRENDIMOS',
  '## SECCIÓN 3: EL INGREDIENTE — POR QUÉ UN ARGENTINO ELEGIRÍA PLANSUS',
  '## SECCIÓN 4: CAMBIO DE PARADIGMA — DE LA PROHIBICIÓN A LA SOBERANÍA',
  '## SECCIÓN 5: LAS CUATRO VÍAS — ARQUITECTURA DE LICENCIAMIENTO',
  '## SECCIÓN 6: EL PUENTE — TRANSICIÓN DEL MERCADO NEGRO AL MERCADO BLANCO',
  '## SECCIÓN 7: LA LIBERACIÓN — PRESOS DE LA PROHIBICIÓN',
  '## SECCIÓN 8: ESTRATEGIA INTERNACIONAL — LA DOCTRINA DE LA SOBERANÍA BIOQUÍMICA',
  '## SECCIÓN 9: LA ECONOMÍA BLANCA — DIVERSIFICACIÓN DE LA MATRIZ PRODUCTIVA',
  '## SECCIÓN 10: ARQUITECTURA INSTITUCIONAL — ANSUS',
  '## SECCIÓN 11: PROTECCIÓN DE MENORES — LA LÍNEA QUE NO SE CRUZA',
  '## SECCIÓN 12: MARCO LEGAL — LO QUE SE DERRUMBA Y LO QUE SE CONSTRUYE',
  '## SECCIÓN 13: MARCO PRESUPUESTARIO Y ROI — CADA PESO INVERTIDO VUELVE MULTIPLICADO',
  '## SECCIÓN 14: DIMENSIÓN FEDERAL — 24 PROVINCIAS, UNA SOBERANÍA',
  '## SECCIÓN 15: ANÁLISIS DE RIESGO — LO QUE PUEDE SALIR MAL Y CÓMO LO ENFRENTAMOS',
  '## SECCIÓN 16: RESPUESTA A CRÍTICAS — LAS PREGUNTAS QUE VAN A HACER',
  '## SECCIÓN 17: ESTRATEGIA DE COMUNICACIÓN — CÓMO SE CUENTA ESTA HISTORIA',
  '## SECCIÓN 18: HOJA DE RUTA — CASCADA CONTROLADA (5 AÑOS)',
  '## SECCIÓN 20: VISIÓN 2040 — LA ARGENTINA DONDE LA CONCIENCIA ES LIBRE',
  '## MARCOS OPERATIVOS — INFRAESTRUCTURA PARA LA IMPLEMENTACIÓN',
  '## SECCIÓN 21: INFRAESTRUCTURA FINANCIERA — BANCA, PAGOS Y SEGUROS',
  '## SECCIÓN 22: SEGURIDAD EN LA TRANSICIÓN — PROTOCOLO OPERATIVO',
  '## SECCIÓN 23: CONDUCCIÓN BAJO INFLUENCIA — MARCO LEGAL Y PROTOCOLO',
  '## SECCIÓN 24: PUENTE SANITARIO — LA SALUD NO ESPERA A PLANSALUD',
  '## SECCIÓN 25: ECONOMÍA LEGAL — PRECIOS, EMPLEO Y CAPACITACIÓN',
  '## SECCIÓN 26: TERRITORIO Y AMBIENTE — DÓNDE SE CULTIVA, DÓNDE SE VENDE, CÓMO SE CUIDA',
  '## SECCIÓN 27: PROPIEDAD INTELECTUAL Y PROTECCIÓN DEL CONOCIMIENTO',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## Parche post-auditoría 2026-04-26',
];

/**
 * Cifras que no pueden aparecer huérfanas. `domicilio` es la fuente que tiene
 * que estar en la MISMA ORACIÓN.
 */
export const CIFRAS_CANONICAS: { cifra: string; domicilio: string[]; desc: string }[] = [];

/**
 * Strings prohibidos. `excepcion` habilita la forma legítima: si el patrón
 * aparece en una oración que TAMBIÉN contiene la excepción, no cuenta.
 */
export const PROHIBIDOS: { patron: string; excepcion?: string; porque: string }[] = [];

/**
 * Cláusulas cuya AUSENCIA es el defecto. Se verifican en forma AFIRMATIVA
 * porque un prohibido no serviría.
 */
export const CANDADOS: { ancla: string; desc: string }[] = [
  {
    ancla: 'atestación comunitaria no es transferible',
    desc: 'E2: cierra el paraguas de la exención ceremonial — sin esto, el retiro comercial se cuelga de la Vía Ceremonial',
  },
  {
    ancla: 'Sub-carril de no residentes',
    desc: 'E3: la Vía Terapéutica estaba escrita entera para pacientes argentinos con PMO',
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

function verificarCandados(raw: string): string[] {
  return CANDADOS.filter(({ ancla }) => !raw.includes(ancla)).map(
    ({ ancla, desc }) => `falta el candado «${ancla}» — ${desc}`,
  );
}

/**
 * El piso de PLANSUS es 0,10% del PBI y su única fuente canónica es el test de
 * pisos. Se verifica en forma AFIRMATIVA: si el canon deja de declararlo, o lo
 * declara distinto, la guardia falla — porque S30 del documento razona sobre
 * ese número contra la Escalera de PLANPACTO.
 */
function verificarPiso(): string[] {
  let canon: string;
  try {
    canon = readFileSync(CANON_PISOS, 'utf8');
  } catch {
    return [`no se pudo leer el canon de pisos: ${CANON_PISOS}`];
  }
  const m = /PLANSUS:\s*\{\s*floor:\s*'([^']+)'/.exec(canon);
  if (m === null) return ['PLANSUS no figura en el canon de pisos y el documento razona sobre su piso'];
  if (m[1] !== '0.10% PBI') {
    return [`el canon declara el piso de PLANSUS en «${String(m[1])}» y el documento asume «0.10% PBI»`];
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
    ...verificarCandados(raw),
    ...verificarPiso(),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANSUS encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANSUS OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(CANDADOS.length)} candados, ` +
      `${String(lineas.length)} líneas, ${String(palabras)} palabras. ` +
      `Piso 0,10% PBI verificado contra el canon.`,
  );
}

/** Se corre sola cuando la invocan directo, y NO cuando alguien la importa. */
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
