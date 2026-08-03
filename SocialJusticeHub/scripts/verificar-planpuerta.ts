/**
 * Guardia del documento de PLANPUERTA.
 *
 * Run: npx tsx scripts/verificar-planpuerta.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que cada una lleve su epígrafe, que las subsecciones estén y sean
 * correlativas, que las cifras canónicas aparezcan CON SU DOMICILIO en la misma
 * oración, que los strings prohibidos no aparezcan, que el documento no se
 * invente un piso constitucional, y que la portada no anuncie dispositivos que
 * el cuerpo no escribe.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la revisión.
 * Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * ── DOCTRINA HEREDADA DE LOS TRAMOS C, D Y E ────────────────────────────────
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un error, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la oración, no la línea).
 *
 * ── LO PROPIO DE ESTE PLAN ──────────────────────────────────────────────────
 * Dos restricciones absolutas que la guardia vigila en forma AFIRMATIVA CON
 * RECHAZO, porque el documento tiene que poder escribir «PLANPUERTA no expulsa»
 * y «no es el sistema inmune» sin ponerse rojo:
 *   (a) el PLAN no crea poder de expulsión — ni para sí ni para ANAR;
 *   (b) la metáfora inmunológica está prohibida: el órgano es la piel.
 * Un prohibido que castiga la renuncia y deja pasar el reclamo está al revés.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md');
/** El documento ajeno donde se deroga la fila de reclutamiento. Lo lee la Task 11. */
const PLANVIV = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANVIV_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANPUERTA no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');
/** La spec. Se cita desde el documento; por eso entra a los paths del CI (V-3). */
const SPEC = resolve(REPO_ROOT, 'v2/docs/specs/2026-08-02-planpuerta.md');

/** El H2 del mandato. PLANPUERTA es el ordinal 27 y el mandato VIGÉSIMO OCTAVO. */
const H2_MANDATO = '## Vigésimo Octavo Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. */
export const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — EL MÉDICO QUE MANEJA',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS SIETE FALLAS DE LA POLÍTICA MIGRATORIA ARGENTINA',
  '## SECCIÓN 1: LA CRISIS — DE UNO DE CADA TRES A UNO DE CADA VEINTICUATRO',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES',
  '## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS ONCE DISPOSITIVOS',
  '## SECCIÓN 4: TRAMO 1 — LA BÚSQUEDA',
  '## SECCIÓN 5: TRAMO 2 — LA LLEGADA',
  '## SECCIÓN 6: TRAMO 3 — LOS PRIMEROS MIL DÍAS',
  '## SECCIÓN 7: TRAMO 4 — EL ARRAIGO',
  '## SECCIÓN 8: TRAMO 5 — LA CIUDADANÍA',
  '## SECCIÓN 9: EL MARCO DE LA PUERTA',
  '## SECCIÓN 10: LO QUE ESTE PLAN TIENE PROHIBIDO',
  '## SECCIÓN 11: LA AGENCIA NACIONAL DE ARRAIGO (ANAR)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 12: MODELO ECONÓMICO',
  '## SECCIÓN 13: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 14: EL MAPA DE PERDEDORES',
  '## SECCIÓN 15: HOJA DE RUTA',
  '## SECCIÓN 16: TABLERO DE ARRAIGO',
  '## SECCIÓN 17: DIMENSIÓN FEDERAL',
  '## SECCIÓN 18: VISIÓN 2040',
  '## SECCIÓN 19: PROTOCOLO DE FALLA',
  '## CIERRE',
];

/**
 * **LA PORTADA, QUE ES LA SUPERFICIE QUE NADIE VUELVE A MIRAR.** En el tramo B
 * de PLANFOCO anunció cuatro dispositivos con cero ocurrencias en el cuerpo.
 * Acá cada renglón se verifica contra el cuerpo, y lo que la lista no sabe leer
 * se reporta en vez de descartarse. Son los once dispositivos de la spec §5 más
 * la agencia; D11 va numerado once por orden de descubrimiento (spec §16.4).
 */
const DISPOSITIVOS_DE_PORTADA: { enPortada: string; alias?: string[] }[] = [
  { enPortada: 'La Lista de Faltantes', alias: ['Lista de Faltantes'] },
  { enPortada: 'El Cuerpo de Scouts', alias: ['Cuerpo de Scouts'] },
  { enPortada: 'La Ventana de Pases', alias: ['Ventana de Pases'] },
  { enPortada: 'Las Tres Puertas', alias: ['Tres Puertas'] },
  { enPortada: 'El Contrato de Puerta', alias: ['Contrato de Puerta'] },
  { enPortada: 'El Padrinazgo', alias: ['Padrinazgo'] },
  { enPortada: 'El Paquete', alias: ['Paquete'] },
  { enPortada: 'La Regla del Problema Pago', alias: ['Regla del Problema Pago', 'Problema Pago'] },
  { enPortada: 'El Tablero de Arraigo', alias: ['Tablero de Arraigo'] },
  { enPortada: 'La Ciudadanía por Aporte Verificado', alias: ['ciudadanía por aporte verificado', 'aporte verificado'] },
  { enPortada: 'La Revalidación por Desempeño', alias: ['Revalidación por Desempeño'] },
  { enPortada: 'Agencia Nacional de Arraigo (ANAR)', alias: ['ANAR'] },
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
          'lista quedó vieja, y una lista vieja en las dos direcciones no verifica nada',
      );
      continue;
    }
    const formas = [enPortada, ...(alias ?? [])];
    const veces = formas.reduce((n, f) => n + cuerpo.split(f).length - 1, 0);
    if (veces < MENCIONES_MINIMAS) {
      errores.push(
        `la portada anuncia «${enPortada}» y el cuerpo lo nombra ${String(veces)} vez/veces ` +
          `(mínimo ${String(MENCIONES_MINIMAS)})`,
      );
    }
  }

  const cubiertos = DISPOSITIVOS_DE_PORTADA.map((d) => d.enPortada);
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
      if (!cubiertos.some((cb) => trozo.includes(cb) || cb.includes(trozo))) {
        errores.push(
          `la portada anuncia «${trozo}» y DISPOSITIVOS_DE_PORTADA no lo cubre: lo que la guardia ` +
            'no sabe leer se reporta en vez de descartarse',
        );
      }
    }
  }
  return errores;
}

/**
 * **El default es «lleva epígrafe»** y el opt-out es esta lista, verificada EN
 * LAS DOS DIRECCIONES: si una sección exenta aparece con epígrafe, se reporta.
 */
const SIN_EPIGRAFE: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — EL MÉDICO QUE MANEJA',
  '## TESIS CENTRAL',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
];

const EPIGRAFE = /^>\s*\*"(.+)"\*$/u;
const LARGO_MINIMO_DE_EPIGRAFE = 20;

/**
 * Las subsecciones que cada H2 tiene que tener, contadas y correlativas. Un H2
 * presente no dice nada sobre lo que hay debajo: borrar un dispositivo entero
 * deja el H2 en su lugar y la guardia verde.
 *
 * **Esta lista arranca con una sola entrada a propósito.** La única que el
 * esqueleto puede fundar sin inventar es la SECCIÓN 0, porque su propio título
 * dice cuántas son. Las demás las declara la tarea que escribe la sección, y
 * hasta entonces las obliga `verificarCoberturaDeSubsecciones`, que convierte en
 * error el hueco en vez de dejarlo pasar en verde.
 */
export const SUBSECCIONES_ESPERADAS: { h2: string; prefijo: string; cuantas: number; porQue: string }[] = [
  {
    h2: '## SECCIÓN 0: LAS SIETE FALLAS DE LA POLÍTICA MIGRATORIA ARGENTINA',
    prefijo: '0',
    cuantas: 7,
    porQue: 'siete fallas, y cada una con su anatomía de PLANPACTO:96-130',
  },
];

/**
 * Descubrimiento automático: una sección con dos o más `### N.M` que no esté en
 * `SUBSECCIONES_ESPERADAS` es error. Una lista opt-in incompleta sale VERDE, y
 * ése fue el defecto que costó una vuelta entera en el tramo D.
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
          'SUBSECCIONES_ESPERADAS: una entrada que falta sale verde',
      );
    }
  }
  return errores;
}

/** La anatomía de cada falla, con los tres leads de PLANPACTO:96-130. */
const LEADS_DE_FALLA = ['**La falla:**', '**Por qué persiste:**', '**El dato:**'];

function verificarAnatomiaDeFallas(lineas: string[]): string[] {
  const h2 = '## SECCIÓN 0: LAS SIETE FALLAS DE LA POLÍTICA MIGRATORIA ARGENTINA';
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
 * **Cifra canónica = número + domicilio, en la misma oración.** Un número del
 * corpus sin su domicilio es exactamente la práctica que este documento
 * denuncia: el censo midió el 29,9% y PLANPUERTA no puede escribirlo como si lo
 * hubiera medido él. Las veintidós entradas son la tabla «Cifras canónicas —
 * con domicilio» del plan `v2/docs/plans/2026-08-02-planpuerta.md`.
 */
export interface CifraCanonica {
  valor: RegExp;
  ancla: RegExp;
  porQue: string;
  /** Razón por la que esta cifra todavía puede faltar. Vacío = obligatoria. */
  opcional?: string;
}

export const CIFRAS_CANONICAS: CifraCanonica[] = [
  {
    valor: /29,9\s*%/u,
    ancla: /censo\.gob\.ar|Tercer Censo|1914/u,
    porQue: 'el máximo histórico de nacidos en el extranjero. Es LA cifra de la SECCIÓN 1 y su domicilio es el Tercer Censo Nacional de 1914 (censo.gob.ar)',
  },
  {
    valor: /4,2\s*%/u,
    ancla: /censo\.gob\.ar|Censo 2022|2022/u,
    porQue: 'el mínimo del último siglo. Domicilio: Censo 2022 (censo.gob.ar)',
  },
  {
    valor: /65,9\s*%/u,
    ancla: /censo\.gob\.ar|Censo 2022|lim[íi]trof/u,
    porQue:
      'el 65,9% de países limítrofes es la razón entera de B+C: para ese flujo la residencia ya es ' +
      'derecho por tratado y no una concesión que este PLAN pueda regular (spec §3.1)',
  },
  {
    valor: /(?:Ley\s*)?25\.903|28\s*(?:de\s*)?julio\s*(?:de\s*)?2009|28\/07\/2009/u,
    ancla: /MERCOSUR|Acuerdo de Residencia|argentina\.gob\.ar|§\s*3\.1/u,
    porQue: 'la puerta que no se toca: el Acuerdo de Residencia del MERCOSUR (2002), ratificado por Ley 25.903 y vigente desde el 28/07/2009',
  },
  {
    valor: /25\.871/u,
    ancla: /art(?:\.|ículo)?\s*23|nacionalidad MERCOSUR|§\s*3\.1/u,
    porQue: 'el art. 23 de la Ley 25.871 incorporó «nacionalidad MERCOSUR» como categoría migratoria propia: el derecho por nacionalidad',
  },
  {
    valor: /4\.144/u,
    ancla: /1902|1958|56 años|Residencia|Can[ée]/u,
    porQue:
      'la Ley de Residencia 4.144 (22/11/1902, derogada en 1958, 56 años de expulsiones sin juez) es ' +
      'el precedente que ordena todos los límites del Marco de la Puerta (spec §6.3)',
  },
  {
    // El valor es sólo el 12,5% a propósito: «80%» y «5×» son demasiado
    // frecuentes en prosa —«1,5× el presupuesto del huésped» ya los dispara— y
    // una cifra canónica que se acusa a sí misma sobre otra frase no verifica nada.
    valor: /12,5\s*%/u,
    ancla: /Start-?Up Chile|Chile/u,
    porQue:
      'Start-Up Chile es el experimento más parecido y su fracaso es el más instructivo: ~80% se fue a ' +
      'los seis meses, 12,5% seguía operando a largo plazo, y la tracción comercial multiplicó por ~5 la retención (spec §4)',
  },
  {
    valor: /395\.000|−\s*21\s*%|-\s*21\s*%/u,
    ancla: /Canad[áa]/u,
    porQue:
      'Canadá recortó su meta de 500.000 a 395.000 para 2025 (−21%) porque casi el 60% dijo que ' +
      'entraba demasiada gente, primera vez desde 2000. Es el backlash que el freno de infraestructura anticipa (spec §4)',
  },
  {
    valor: /11\.285|41\.000|\+\s*264\s*%/u,
    ancla: /impatriati|Italia/u,
    porQue: 'el régimen impatriati italiano llevó los entrantes de 11.285 a ~41.000 (+264%) con exención del 50% (60% con hijos menores) — spec §5 D7',
  },
  {
    valor: /NHR|IFICI/u,
    ancla: /Portugal|1\/1\/2025|rentista|derogad/u,
    porQue: 'Portugal derogó el NHR el 1/1/2025 y lo reemplazó por el IFICI: toda golden visa deriva a rentista si no se la ata a producción (spec §6.2 III.1)',
  },
  {
    valor: /55\s*pa[íi]ses/u,
    ancla: /OMS|Salvaguardia|2023/u,
    porQue: 'la Lista de Salvaguardia de la OMS (2023) son 55 países, y es el contenido concreto del Techo de Origen (spec §6.2 III.2)',
  },
  {
    valor: /5\.000\s*[-–—]\s*10\.000|10\s*[-–—]\s*20M/u,
    ancla: /PLANVIV|:\s*1566/u,
    porQue: 'la fila que este PLAN deroga: 5.000-10.000 trabajadores regionales y USD 10-20M de gestión migratoria, en PLANVIV:1566',
  },
  {
    valor: /50\.000\s*[-–—]\s*68\.000|150\s*[-–—]\s*230M/u,
    ancla: /PLANVIV|:\s*1567|derog|corrig/u,
    porQue: 'el total de PLANVIV:1567 después de la derogación. La aritmética de la tabla cascadea y hay que escribirla, no dejarla vieja (V-5)',
  },
  {
    valor: /15\.000\s*(?:de\s*)?(?:de\s*)?brecha|brecha(?:[^.;:\n]){0,30}15\.000/u,
    ancla: /PLANVIV|:\s*1571|deuda|declarad/u,
    porQue:
      'la deuda declarada: derogar la fila abre 15.000 de brecha en el extremo bajo de PLANVIV:1571. ' +
      'Se escribe como riesgo, no se disimula (spec §8.1)',
  },
  {
    valor: /26\.350\s*[-–—]\s*73\.000/u,
    ancla: /PRESUPUESTO_CONSOLIDADO|:\s*33|PLAN24CN/u,
    porQue:
      'de dónde salen los lotes: PLAN24CN son USD 26.350-73.000M a 15-20 años. **El domicilio es ' +
      'PRESUPUESTO_CONSOLIDADO_BASTA.md:33** — el plan escribió :37, que es la fila de PLANVIV',
  },
  {
    valor: /80\.000\s*[-–—]\s*120\.000/u,
    ancla: /PRESUPUESTO_CONSOLIDADO|:\s*37|PLANVIV/u,
    porQue: 'el contraste de escala: PLANVIV son USD 80.000-120.000M a 15 años (PRESUPUESTO_CONSOLIDADO_BASTA.md:37) y este PLAN es dos órdenes de magnitud menor',
  },
  {
    valor: /3,5\s*millones|3\.5\s*millones/u,
    ancla: /PLANREP|TABLA 1|:\s*8[0-9]/u,
    porQue:
      'los ~3,5 millones de empleados públicos que PLANREP está reconvirtiendo son la razón entera de ' +
      'la Regla de Subsidiariedad. La fila vive en la TABLA 1 de PLANREP (:87; el encabezado en :83)',
  },
  {
    valor: /sin verificar\s*(?:el\s*)?estatus migratorio|no (?:pide ni )?verifica(?:r)?\s*(?:el\s*)?estatus/u,
    ancla: /PLANJUS|:\s*2366/u,
    porQue: 'el compromiso que se hereda y se extiende: PLANJUS:2366 no verifica estatus migratorio y no comparte información con Migraciones',
  },
  {
    valor: /reunificaci[óo]n/u,
    ancla: /PLANCUIDADO|:\s*318/u,
    porQue: 'de dónde sale el Padrinazgo: el Pacto de Cuidado ya genera derechos migratorios de reunificación (PLANCUIDADO:318)',
  },
  {
    valor: /Agencia del Litio/u,
    ancla: /PLANGEO|:\s*425/u,
    porQue: 'por qué no se denuncia MERCOSUR: PLANGEO:425 le propone a Bolivia y Chile cogobernar el litio en la Agencia del Litio del Cono Sur',
  },
  {
    valor: /Red Soberana/u,
    ancla: /PLANGEO|:\s*1151|municipal/u,
    porQue: 'ídem: PLANGEO:1151 monta la expansión de la Red Soberana sobre adopción municipal en la región',
  },
  {
    valor: /f[áa]brica de emigrantes/u,
    ancla: /PLANREP|:\s*2182|:\s*1811/u,
    porQue: 'el problema inverso que este PLAN cierra: PLANREP:2182 declara el riesgo de ser «fábrica de emigrantes» subsidiada',
  },
];

/**
 * `ambito` decide sobre qué se corre el patrón:
 *  · `'documento'` — el archivo entero, sin negritas.
 *  · `'cabecera'`  — sólo las primeras 60 líneas.
 */
export interface Prohibido {
  patron: RegExp;
  porQue: string;
  ambito?: 'documento' | 'cabecera';
  /** Excepción medida sobre **la oración del match** — la misma unidad que el patrón. */
  salvoSi?: { patron: RegExp; porQue: string };
  /**
   * **El prohibido sólo dispara si la oración nombra a alguien que podría tener
   * la potestad.** Es la lección 3 del tramo D: un prohibido escrito contra el
   * reclamo se dispara sobre el rechazo. El método retórico de este PLAN es
   * **nombrar el mecanismo prohibido para rechazarlo** —«PLANPUERTA no crea ni un
   * gramo de poder de expulsión nuevo», «el órgano es la piel, no el sistema
   * inmune»— y sin este filtro la guardia se pondría roja sobre las frases que el
   * documento existe para escribir.
   *
   * El invariante real no es «la palabra no aparece»: es «este PLAN no le da a
   * nadie la facultad». Entonces la oración tiene que nombrar a ese alguien.
   *
   * **Hueco conocido y declarado:** una construcción impersonal —«al que llega se
   * lo trata como un cuerpo extraño»— no nombra actor y se escapa. Es más angosto
   * que el falso positivo que reemplaza, y queda anotado acá en vez de
   * descubrirse después.
   */
  exigeActor?: boolean;
}

/**
 * Quién podría tener la facultad. Si la oración no nombra a ninguno, el
 * prohibido con `exigeActor` no corre.
 */
const ACTOR =
  /\bANAR\b|\bla ANAR\b|\beste PLAN\b|\bPLANPUERTA\b|\bel Estado\b|\bla agencia\b|\bel gobierno\b|\bla autoridad\b|\bMigraciones\b/iu;

/**
 * Negación en CUALQUIER parte de la oración, no sólo antes del verbo. El
 * lookbehind cubre «ANAR no expulsa»; esto cubre «... el órgano es el sistema
 * inmune, y ésa es exactamente la metáfora que este PLAN prohíbe», donde el
 * rechazo llega después.
 */
const RECHAZO = {
  patron: /\b(no|ni|nunca|jamás|tampoco|ning[úu]n|ninguna|nadie)\b|prohib|descart|rechaz|renunci|deroga/iu,
  porQue:
    'la negación puede llegar DESPUÉS del verbo, y el lookbehind sólo ve hacia atrás. Este ' +
    'documento escribe la mitad de sus rechazos en esa forma: nombra el mecanismo y lo rechaza en la ' +
    'cláusula siguiente',
};

/**
 * Lookbehind de negación reutilizable: la negación tiene que gobernar la misma
 * cláusula, y por eso no cruza `.`, `;`, `:` ni las conjunciones adversativas.
 *
 * **La ventana es de 60 caracteres y el número tiene historia.** La primera
 * versión de PLANFOCO usaba 30 y la guardia se puso roja sobre su propia
 * cabecera, porque estos PLANes enumeran sus renuncias en serie y la serie es
 * larga a propósito. Sesenta cubre la enumeración sin dejar que una negación de
 * otra cláusula exima a una afirmación posterior.
 */
const NEG =
  '(?<!\\b(?:sin|no|ni|nunca|jamás|tampoco|ningún|ninguna|prohibido|prohíbe|impedido)\\b(?:(?!\\b(?:y|pero|aunque|sino|mas)\\b)[^.;:\\n]){0,60})';

export const PROHIBIDOS: Prohibido[] = [
  {
    patron: /PLANPUERTA\s*:\s*\d/u,
    porQue:
      'remisión con número de línea al propio documento. Las líneas se mueven con cada edición y la ' +
      'cita queda apuntando a otra cosa (GC-6)',
  },
  {
    patron: new RegExp(
      `${NEG}\\b(expulsa|expulsar|expulsi[óo]n|expulsiones|deporta|deportar|deportaci[óo]n|deportaciones)\\b`,
      'iu',
    ),
    porQue:
      '**el PLAN no crea poder de expulsión** (GC-4). El verbo afirmativo atribuido a PLANPUERTA o a ' +
      'ANAR es exactamente la facultad que este documento se niega a fundar; la forma negada es la ' +
      'que hay que escribir y queda exenta sola',
    exigeActor: true,
    salvoSi: {
      patron: new RegExp(
        `${RECHAZO.patron.source}|derecho penal|c[óo]digo penal|sentencia (?:judicial )?firme|4\\.144|vigente`,
        'iu',
      ),
      porQue:
        `${RECHAZO.porQue}. Y además: la oración que ATRIBUYE la expulsión al derecho penal vigente ` +
        'con sentencia firme es la que hay que escribir, porque es la que aclara que el PLAN no inventa nada',
    },
  },
  {
    patron: /\b(sistema inmune|inmunol[óo]gic\w*|inmunitari\w*|pat[óo]geno\w*|contagio|infecci[óo]n|cuerpo extra[ñn]o)\b/iu,
    porQue:
      'la metáfora inmunológica está prohibida (GC-5): trata al que llega como patógeno. **El órgano ' +
      'es la piel** — el borde que decide qué entra, pero sobre todo lo que toca y lo que respira. Es ' +
      'la decisión 9 del registro de la spec',
    exigeActor: true,
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|met[áa]fora|la piel|prohibid`, 'iu'),
      porQue: 'la oración que RECHAZA la metáfora por nombre es la que el documento tiene que escribir, y aparece en la portada y en la SECCIÓN 10',
    },
  },
  {
    patron: new RegExp(`${NEG}\\b(golden visa|visa dorada|residencia por inversi[óo]n)\\b`, 'iu'),
    porQue: 'la residencia no se vende: prohibición explícita de III.1. El aporte se paga con trabajo, nunca con plata',
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|Portugal|NHR|IFICI|rentista|deriva|lo contrario`, 'iu'),
      porQue:
        `${RECHAZO.porQue}. Y además: el argumento de Portugal —toda golden visa deriva a rentista— ` +
        'exige nombrar el mecanismo para mostrarlo fallando',
    },
  },
  {
    patron: new RegExp(
      `${NEG}\\b(denuncia|denunciar|denunciamos|renegocia|renegociar|renegociamos)\\b(?:[^.;:\\n]){0,60}\\bMERCOSUR\\b|\\bMERCOSUR\\b(?:[^.;:\\n]){0,40}\\bse (?:denuncia|renegocia)\\b`,
      'iu',
    ),
    porQue:
      'decisión 3 del registro: la puerta MERCOSUR no se toca. Denunciar el Acuerdo rompe PLANGEO de ' +
      'punta a punta — no se le pide a Bolivia que comparta el triángulo del litio el mismo año que se ' +
      'le cierra la puerta a sus ciudadanos',
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|PLANGEO|selectiv|exigir[íi]a|hace falta|B\\+C`, 'iu'),
      porQue: 'la oración que DESCARTA la denuncia tiene que poder nombrarla: es el argumento de la spec §3.2',
    },
  },
  {
    patron: /\b(cupos?|cuotas?)\b(?:[^.;:\n]){0,50}\b(nacionalidad|origen|pa[íi]s de origen|pa[íi]ses)\b|\b(nacionalidad|pa[íi]s de origen)\b(?:[^.;:\n]){0,30}\b(cupos?|cuotas?)\b/iu,
    porQue:
      'B+C: lo selectivo es el acceso al Paquete, **nunca la entrada al país**. Un cupo por ' +
      'nacionalidad como criterio de entrada es el sistema que la decisión 3 descartó',
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|Techo de Origen|OMS|Salvaguardia|reclutar|buscamos|a qui[ée]n`, 'iu'),
      porQue:
        'el Techo de Origen SÍ limita por país, y es legítimo porque limita a quién *buscamos*, no ' +
        'quién entra. La oración que lo aplica al Techo mide otra cosa que la que el prohibido acusa',
    },
  },
  {
    patron: /Ministerio de Migraciones|ANAR absorbe/iu,
    porQue:
      'decisión 8: **ANAR no absorbe la Dirección Nacional de Migraciones.** El que ficha no es el que ' +
      'controla, y esa separación es lo que impide que un gobierno futuro convierta ANAR en la 4.144 con otro nombre',
    salvoSi: RECHAZO,
  },
  {
    patron: /Vigésimo Séptimo Mandato/u,
    porQue:
      'el Vigésimo Séptimo es PLANFOCO. PLANPUERTA es el ordinal 27 y el mandato VIGÉSIMO OCTAVO: el ' +
      'desfase de 1 viene de PLANRUTA y es convención de todo el corpus',
  },
  {
    patron: /26 thematic/u,
    ambito: 'cabecera',
    porQue: 'el canon es 27 temáticos + PLANRUTA desde este tramo. La cabecera es lo único que ningún lector vuelve a leer y por eso se verifica sola',
  },
  {
    patron: new RegExp(
      `${NEG}(piso constitucional|escal[óo]n)\\s+(?:de\\s+)?(PLANPUERTA|propio|nuestro)|nuestro\\s+(?:piso constitucional|escal[óo]n)|noveno escal[óo]n`,
      'iu',
    ),
    porQue:
      'PLANPUERTA no tiene piso constitucional y no lo pide (GC-7): no agrega presión al Techo de ' +
      'PLANPACTO ni escalón a su Escalera',
    salvoSi: RECHAZO,
  },
  {
    patron: /5\.000\s*[-–—]\s*10\.000/u,
    porQue: 'la fila de 5.000-10.000 trabajadores regionales está DEROGADA por este PLAN. Escribirla sin la marca la deja viva en presente',
    salvoSi: {
      patron: /PLANVIV|:\s*1566|derog|se elimina|sale la l[íi]nea|ya no/iu,
      porQue: 'la oración que la deroga tiene que poder nombrarla, con su domicilio PLANVIV:1566',
    },
  },
  {
    patron: /55\.000\s*[-–—]\s*78\.000|160\s*[-–—]\s*250M/u,
    porQue:
      'totales viejos de PLANVIV:1567. La derogación de la fila cascadea sobre la aritmética de la ' +
      'tabla y el total pasa a 50.000-68.000 / USD 150-230M (V-5)',
    salvoSi: {
      patron: /hist[óo]ric|antes de|previo|derog|corrig|pasaba de|dec[íi]a|V-5/iu,
      porQue: 'la oración que DECLARA el valor histórico tiene que poder nombrarlo',
    },
  },
  {
    patron: /\bideales\b(?:[^.;:\n]){0,80}\b(residencia|permanencia|expulsi[óo]n)\b|\b(residencia|permanencia)\b(?:[^.;:\n]){0,80}\bideales\b/iu,
    porQue:
      'acto sí, idea nunca (GC-4, spec §6.3). **Se puede condicionar la permanencia a lo que alguien ' +
      'hace; nunca a lo que alguien piensa, cree, dice o vota.** La distancia entre «desconsiderar los ' +
      'ideales» y 56 años de deportaciones sin juez es de una sola palabra mal definida',
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|Paquete|Contrato de Puerta|se revoca|4\\.144|acto`, 'iu'),
      porQue:
        'la oración que lo aplica al **Paquete** —que es lo que se revoca contra lo que la persona ' +
        'misma firmó— mide otra cosa que la que el prohibido acusa, y es la salida legítima entera del PLAN',
    },
  },
];

/**
 * Términos que el corpus ya usa con OTRO sentido, o que no usa nunca. No está
 * mal usarlos: está mal usarlos como si el corpus ya los tuviera con este
 * significado. Se estrenan declarando el estreno, o el lector supone que ya estaban.
 */
const ESTRENOS_QUE_SE_DECLARAN: { termino: RegExp; declaracion: RegExp; porQue: string }[] = [
  {
    termino: /\bPadrinazgo\b/u,
    declaracion: /PLANMESA|:\s*88|PLANARCO|:\s*574|Compadrazgo|PLANCUIDADO|desambigu|otro sentido|peyorativ|distinto/iu,
    porQue:
      'el corpus usa «padrinazgo» una sola vez y en sentido PEYORATIVO —lo que separa al que tiene ' +
      'contactos del que no (`PLANMESA:88`)— y `PLANARCO:574` lo dice con todas las letras y usa el ' +
      '**Compadrazgo** de `PLANCUIDADO:307` como la figura tipificada. Llamar Padrinazgo al dispositivo ' +
      'D6 sin desambiguarlo la primera vez es chocar de frente con esas dos líneas',
  },
  {
    termino: /Revalidaci[óo]n por Desempe[ñn]o/u,
    declaracion: /no aparece|nunca aparece|cero ocurrencias|no lo nombra|aserci[óo]n propia|decisi[óo]n de diseño|estren/iu,
    porQue:
      '«revalidación» tiene cero ocurrencias en los documentos del taller: D11 no hereda nada, lo ' +
      'estrena. Se declara como decisión de diseño de este documento (GC-1)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo. Heredadas de los tramos C, D y E con sus arreglos adentro.
// ─────────────────────────────────────────────────────────────────────────────

/** El tramo de líneas de una sección. Si el H2 no es único, el chequeo NO corre y lo dice. */
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
 * El tramo de ORACIÓN que contiene a `[desde, hasta)`. El resultado se ensancha
 * al span del match como último recaudo: el ámbito de una excepción nunca puede
 * ser más chico que lo que la regla acusó.
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
            'numeración tiene que ser correlativa',
        );
      }
    });
  }
  return errores;
}

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

function verificarProhibidos(raw: string, lineas: string[]): string[] {
  const errores: string[] = [];
  const plano = raw.replace(/\*\*/g, '');
  const cabecera = lineas.slice(0, 60).join('\n').replace(/\*\*/g, '');
  for (const { patron, porQue, ambito, salvoSi, exigeActor } of PROHIBIDOS) {
    const texto = ambito === 'cabecera' ? cabecera : plano;
    const re = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex += 1;
        continue;
      }
      const oracion = oracionDe(texto, m.index, m.index + m[0].length);
      if (salvoSi && salvoSi.patron.test(oracion)) continue;
      // Una crítica abstracta al mecanismo no le da la facultad a nadie: sin actor, no hay reclamo.
      if (exigeActor === true && !ACTOR.test(oracion)) continue;
      const nLinea = texto.slice(0, m.index).split('\n').length;
      errores.push(
        `${ambito === 'cabecera' ? 'cabecera, ' : ''}línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`,
      );
      break;
    }
  }
  return errores;
}

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
        `${String(termino)} aparece ${String(apariciones)} vez/veces y ninguna declara su estreno — ${porQue}`,
      );
    }
  }
  return errores;
}

/** `PISOS_SEGUN_EL_TALLER` del test canónico: PLAN → rango declarado. */
function pisosDelCanon(): Set<string> {
  const src = readFileSync(CANON_PISOS, 'utf8');
  const bloque = /const PISOS_SEGUN_EL_TALLER[^{]*\{([\s\S]*?)\n\};/.exec(src);
  const out = new Set<string>();
  if (!bloque) return out;
  const re = /(PLAN[A-Z0-9]+):\s*\{\s*floor:\s*'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bloque[1] ?? '')) !== null) {
    if (m[1] !== undefined) out.add(m[1]);
  }
  return out;
}

function verificarQueNoTienePiso(): string[] {
  const canon = pisosDelCanon();
  if (canon.size === 0) return [`no se pudo leer PISOS_SEGUN_EL_TALLER de ${CANON_PISOS}`];
  if (canon.has('PLANPUERTA')) {
    return [
      'PLANPUERTA figura en PISOS_SEGUN_EL_TALLER: este PLAN no reclama piso constitucional y no ' +
        'agrega presión al Techo de PLANPACTO. Su poder viene de la asignación y la coordinación, no del gasto (GC-7)',
    ];
  }
  return [];
}

/**
 * La derogación de la fila de reclutamiento, del lado de PLANVIV. Es el espejo
 * del chequeo que el tramo D puso sobre PLANTER y el tramo E sobre PLANCUL: una
 * derogación escrita en un solo documento deja al otro afirmando en presente algo
 * que dejó de ser verdad. Se enciende cuando la Task 11 corre.
 */
function verificarDerogacionEnPlanviv(raw: string): string[] {
  if (!/PLANVIV\s*:\s*1566/u.test(raw)) return []; // El documento todavía no la nombra.
  let ajeno: string;
  try {
    ajeno = readFileSync(PLANVIV, 'utf8');
  } catch {
    return [`no se pudo leer ${PLANVIV}`];
  }
  if (!/PLANPUERTA/u.test(ajeno)) {
    return [
      'PLANPUERTA deroga la fila de trabajadores regionales de PLANVIV:1566 y PLANVIV no lo nombra ni ' +
        'una vez: una derogación escrita de un solo lado deja al otro documento afirmando en presente ' +
        'algo que dejó de ser verdad (lección 2 del tramo D)',
    ];
  }
  return [];
}

/**
 * La cabecera es lo único que ningún lector vuelve a leer, y por eso lleva sus
 * propios chequeos: el canon declarado, la anatomía H1 → H2 → H3, la habilitación
 * escrita entera, el total de quince años, y la prohibición de estrenar un número
 * anual antes de derivarlo en la SECCIÓN 12.
 */
function verificarCabecera(lineas: string[]): string[] {
  const errores: string[] = [];
  const cabecera = lineas.slice(0, 60).join('\n');

  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }
  const iMandato = lineas.findIndex((l) => l.trim() === H2_MANDATO);
  const iH1 = lineas.findIndex((l) => l.startsWith('# PLANPUERTA'));
  if (iH1 === -1) errores.push('falta el H1 «# PLANPUERTA — …»');
  if (iMandato !== -1 && iH1 !== -1 && iMandato < iH1) {
    errores.push('el H2 del mandato está antes del H1: la anatomía del corpus es H1 → H2 de mandato → H3 de versión');
  }

  // La habilitación se escribe ENTERA: no es que falle el gate, es que no lo alcanza.
  if (!/ACTA DE HABILITACIÓN/u.test(cabecera)) {
    errores.push('la cabecera no tiene la línea «ACTA DE HABILITACIÓN»: la vía de entrada de este PLAN se escribe, no se supone');
  }
  for (const [patron, queFalta] of [
    [/COVERAGE_GAPS_ASSIGNMENTS/u, 'el barrido de COVERAGE_GAPS_ASSIGNMENTS.md, que es donde consta que nadie tuvo asignada la inmigración'],
    [/regla 3/u, 'la mención de la regla 3 del freeze, que es el gate que este PLAN no alcanza'],
    [/hu[ée]sped/iu, 'la palabra «huésped»: sin huésped no hay denominador y no hay cociente'],
  ] as [RegExp, string][]) {
    if (!patron.test(cabecera)) {
      errores.push(`la habilitación de la cabecera no escribe ${queFalta}`);
    }
  }

  // El total de quince años va en la cabecera; el desglose, en la SECCIÓN 12.
  if (!/450\s*[-–—]\s*900M/u.test(cabecera)) {
    errores.push('la cabecera no declara el total de quince años (USD 450-900M): el presupuesto canónico se escribe arriba');
  }
  if (!/SECCI[ÓO]N 12/u.test(cabecera)) {
    errores.push('la cabecera declara el total y no remite a la SECCIÓN 12 para el desglose');
  }
  const anual = /USD\s*[\d.]+\s*[-–—]\s*[\d.]+M?\s*\/\s*año/u.exec(cabecera);
  if (anual) {
    errores.push(
      `la cabecera estrena un número anual («${anual[0]}») antes de derivarlo: el anual sale del ` +
        'desglose de la SECCIÓN 12, y hasta esa derivación cualquier anual es una cifra estrenada',
    );
  }

  // GC-6: ninguna remisión a un archivo que no existe. La spec se cita desde la cabecera.
  if (/2026-08-02-planpuerta\.md/u.test(cabecera)) {
    try {
      readFileSync(SPEC, 'utf8');
    } catch {
      errores.push(`la cabecera cita la spec y no se pudo leer ${SPEC} (GC-6)`);
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
    ...verificarDerogacionEnPlanviv(raw),
    ...verificarCabecera(lineas),
    ...verificarPortada(lineas),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANPUERTA encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANPUERTA OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(lineas.length)} líneas, ` +
      `${String(palabras)} palabras. Sin piso constitucional, verificado contra el canon del taller.`,
  );
}

/**
 * Se corre sola cuando la invocan directo, y NO cuando alguien la importa. Las
 * tareas siguientes consumen `SECCIONES_ESPERADAS`, `CIFRAS_CANONICAS` y
 * `PROHIBIDOS`, y un `main()` al tope del módulo les mataría el proceso con
 * `process.exit(1)` apenas hicieran el import.
 */
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
