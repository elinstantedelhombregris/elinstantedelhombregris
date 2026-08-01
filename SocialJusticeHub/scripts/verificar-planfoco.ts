/**
 * Guardia del documento de PLANFOCO.
 *
 * Run: npx tsx scripts/verificar-planfoco.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que cada una lleve su epígrafe, que las cifras canónicas aparezcan
 * CON SU DOMICILIO en la misma oración, que los strings prohibidos no
 * aparezcan, que el documento no se invente un piso constitucional, y que las
 * TRES tablas contables sumen: la extinción de la pauta, la rampa de quince
 * años y el reparto interno del régimen.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * ── DOCTRINA HEREDADA DE LOS TRAMOS C Y D ────────────────────────────────────
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un error, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la oración, no la línea).
 *
 * ── LO PROPIO DE ESTE PLAN ───────────────────────────────────────────────────
 * La restricción del fundador es absoluta: ningún dispositivo controla,
 * licencia ni castiga contenido. Los prohibidos que la vigilan son AFIRMATIVOS
 * CON LOOKBEHIND DE NEGACIÓN, porque el documento tiene que poder escribir «el
 * Estado no licencia» sin ponerse rojo. Un prohibido que castiga la renuncia y
 * deja pasar el reclamo está al revés.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANFOCO_Argentina_ES.md');
/** El documento ajeno donde se deroga la Acción 3. Lo lee la Task 12. */
const PLANCUL = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANCUL_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANFOCO no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** El H2 del mandato. PLANFOCO es el ordinal 26 y el mandato VIGÉSIMO SÉPTIMO. */
const H2_MANDATO = '## Vigésimo Séptimo Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. */
const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — EL CARTEL QUE NADIE CAMBIÓ',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS SIETE FALLAS DE LA PALABRA PÚBLICA ARGENTINA',
  '## SECCIÓN 1: LA CRISIS — NO FALTA INFORMACIÓN, FALTA DÓNDE MIRAR',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  '## SECCIÓN 3: LA PAUTA CIEGA',
  '## SECCIÓN 4: LA BIBLIOTECA VIVA',
  '## SECCIÓN 5: LA ANTENA',
  '## SECCIÓN 6: LA CARTELERA',
  '## SECCIÓN 7: EL ACERVO ABIERTO Y LA SALA COMÚN',
  '## SECCIÓN 8: LA PROCEDENCIA',
  '## SECCIÓN 9: LA ALFABETIZACIÓN DE LA MIRADA Y EL DESMONTAJE',
  '## SECCIÓN 10: QUIÉN COMPRA, QUIÉN ATIENDE Y QUIÉN CUENTA',
  '## SECCIÓN 11: LO QUE ESTE PLAN TIENE PROHIBIDO',
  '## SECCIÓN 12: LA AGENCIA NACIONAL DE LA BIBLIOTECA Y EL ACERVO COMÚN (ANBAC)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 13: MODELO ECONÓMICO Y FISCAL',
  '## SECCIÓN 14: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 15: EL MAPA DE PERDEDORES',
  '## SECCIÓN 16: HOJA DE RUTA',
  '## SECCIÓN 17: TABLERO NACIONAL DE LA MIRADA',
  '## SECCIÓN 19: DIMENSIÓN FEDERAL',
  '## SECCIÓN 20: VISIÓN 2040',
  '## SECCIÓN 21: PROTOCOLO DE FALLA',
  '## CIERRE',
];

/**
 * **LA PORTADA, QUE ES LA SUPERFICIE QUE NADIE VUELVE A MIRAR.** En el tramo B
 * anunció cuatro dispositivos con cero ocurrencias en el cuerpo. Acá cada
 * renglón se verifica contra el cuerpo, y lo que la lista no sabe leer se
 * reporta en vez de descartarse.
 */
const DISPOSITIVOS_DE_PORTADA: { enPortada: string; alias?: string[] }[] = [
  { enPortada: 'La Pauta Ciega', alias: ['Pauta Ciega'] },
  { enPortada: 'La Biblioteca Viva', alias: ['Biblioteca Viva', 'Biblioteca'] },
  { enPortada: 'La Antena', alias: ['Antena'] },
  { enPortada: 'La Cartelera', alias: ['Cartelera'] },
  { enPortada: 'El Acervo Abierto', alias: ['Acervo Abierto', 'Acervo'] },
  { enPortada: 'La Sala Común', alias: ['Sala Común'] },
  { enPortada: 'La Procedencia', alias: ['Procedencia'] },
  { enPortada: 'El Desmontaje', alias: ['Desmontaje'] },
  { enPortada: 'La Beca del Desierto', alias: ['Beca del Desierto'] },
  { enPortada: 'Agencia Nacional de la Biblioteca y el Acervo Común (ANBAC)', alias: ['ANBAC'] },
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
  '## PREÁMBULO — EL CARTEL QUE NADIE CAMBIÓ',
  '## TESIS CENTRAL',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
];

const EPIGRAFE = /^>\s*\*"(.+)"\*$/u;
const LARGO_MINIMO_DE_EPIGRAFE = 20;

/**
 * Las subsecciones que cada H2 tiene que tener, contadas y correlativas. Un H2
 * presente no dice nada sobre lo que hay debajo: borrar un dispositivo entero
 * deja el H2 en su lugar y la guardia verde.
 */
const SUBSECCIONES_ESPERADAS: { h2: string; prefijo: string; cuantas: number; porQue: string }[] = [
  {
    h2: '## SECCIÓN 0: LAS SIETE FALLAS DE LA PALABRA PÚBLICA ARGENTINA',
    prefijo: '0',
    cuantas: 7,
    porQue: 'siete fallas, y cada una con su anatomía de PLANPACTO:96-130',
  },
  {
    h2: '## SECCIÓN 3: LA PAUTA CIEGA',
    prefijo: '3',
    cuantas: 4,
    porQue: 'el mecanismo, la extinción, el umbral que va en la ley (arreglo 5) y qué pasa con la comunicación de interés público',
  },
  {
    h2: '## SECCIÓN 4: LA BIBLIOTECA VIVA',
    prefijo: '4',
    cuantas: 5,
    porQue: 'la frontera con el Commons de PLANDIG, la sede, el bibliotecario (arreglo 6), la compra (arreglo 7) y el horario',
  },
  {
    h2: '## SECCIÓN 7: EL ACERVO ABIERTO Y LA SALA COMÚN',
    prefijo: '7',
    cuantas: 4,
    porQue: 'el acervo, la partición manifiesto/bitstream (arreglo 8), el Sello Abierto que hereda de PLANPREGUNTA, y la Sala',
  },
  {
    h2: '## SECCIÓN 9: LA ALFABETIZACIÓN DE LA MIRADA Y EL DESMONTAJE',
    prefijo: '9',
    cuantas: 3,
    porQue: 'qué es el Desmontaje, quién lo dicta (arreglo 11) y el par recíproco con el Censo de Ignorancia',
  },
  {
    h2: '## SECCIÓN 10: QUIÉN COMPRA, QUIÉN ATIENDE Y QUIÉN CUENTA',
    prefijo: '10',
    cuantas: 3,
    porQue: 'las Mesas de Materia, el concurso ciego más sorteo, y la Beca del Desierto territorializada (arreglo 9)',
  },
  {
    h2: '## SECCIÓN 13: MODELO ECONÓMICO Y FISCAL',
    prefijo: '13',
    cuantas: 5,
    porQue: 'la fuente y su domicilio, la extinción, la rampa, el reparto interno y lo que el ecosistema pierde',
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
  const h2 = '## SECCIÓN 0: LAS SIETE FALLAS DE LA PALABRA PÚBLICA ARGENTINA';
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
 * denuncia: PLANCUL midió las cinco horas y PLANFOCO no puede escribirlas como
 * si las hubiera medido él.
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
    valor: /USD\s*450M?\/año|USD\s*450\s*millones|450M\/año/u,
    ancla: /PRESUPUESTO_CONSOLIDADO|:419|PLANMESA|:788/u,
    porQue:
      'la pauta entera es la fuente y el techo de este PLAN. Su domicilio es ' +
      'PRESUPUESTO_CONSOLIDADO_BASTA.md:419, confirmado por PLANMESA:788 (F-1)',
  },
  {
    valor: /eliminable en 40-60%|40\s*(?:a|y|[–—-])\s*60%/u,
    ancla: /PRESUPUESTO_CONSOLIDADO|:419|Fuente 1/u,
    porQue:
      'los «180-270M genéricos» de la spec no son una bolsa aparte: son el 40-60% de los mismos ' +
      '450M, y eso cambia el problema entero (F-1)',
  },
  {
    valor: /5,2\s*horas|5,2\b/u,
    ancla: /PLANCUL|:304|pantalla/u,
    porQue: 'las cinco horas del título las midió PLANCUL:304 (5,2 no laborales por día contra 3,8 global)',
  },
  {
    valor: /3\.000\+?\s*Commons|uno cada 15\.000/u,
    ancla: /PLANDIG|:788|:799/u,
    porQue: 'el derecho al Commons Atencional es de PLANDIG:788 y este PLAN lo financia, no lo estrena (F-3)',
  },
  {
    valor: /2\.000\+?\s*bibliotecas populares/u,
    ancla: /PLANCUL|:259/u,
    porQue: 'las bibliotecas populares que ya existen son las que cierran la aritmética del derecho de PLANDIG (F-3)',
  },
  {
    valor: /4\.700\s*[–—-]\s*9\.900|~?\s*700M\/año/u,
    ancla: /PLANDIG|TABLA 20|:1086/u,
    porQue: 'la escala del favor: la TABLA 20 de PLANDIG no tiene la fila del Commons, y su total anual es ~700M (F-4)',
  },
  {
    valor: /50%\s*audiencia|50% de audiencia/u,
    ancla: /PLANCUL|:387|Acci[óo]n 3/u,
    porQue: 'la fórmula que se deroga es de PLANCUL:387 y es la que la Pauta Ciega prohíbe (F-2)',
  },
  {
    valor: /640\s*[–—-]\s*1\.000/u,
    ancla: /PLANTALLER|PRESUPUESTO_CONSOLIDADO|:394|:655/u,
    porQue: 'el techo de orden que la spec fija: por debajo de PLANTALLER',
  },
  {
    valor: /800\s*[–—-]\s*2\.500/u,
    ancla: /PLANJUS|:107/u,
    porQue: 'el otro extremo de la restricción de orden: no por encima de PLANJUS',
  },
  {
    valor: /siete nodos/u,
    ancla: /PLANMEMORIA|:90|hash/u,
    porQue: 'el manifiesto y el hash del Acervo van a los siete nodos de PLANMEMORIA:90 (arreglo 8)',
  },
  {
    valor: /sorteo estratificado/u,
    ancla: /PLANMESA|:297/u,
    porQue: 'la mecánica del concurso ciego más sorteo es la de PLANMESA:297, no una invención de este PLAN',
  },
  {
    valor: /Informe Mensual de Extracci[óo]n Atencional/u,
    ancla: /PLANDIG|:886/u,
    porQue: 'el instrumento que ya le dice a Marisol el número, sin ofrecerle a dónde ir. Es de PLANDIG:886',
  },
  {
    valor: /3\.540\s*[–—-]\s*5\.400/u,
    ancla: /quince años|rampa|corrige|corrección|Secci[óo]n 13/u,
    porQue: 'el total corregido. La spec decía 3.000-5.000 y ningún instrumento lo consumió (F-7, F-8)',
  },
  {
    valor: /300\s*[–—-]\s*450/u,
    ancla: /régimen|banda|pauta|techo|corrige|corrección/u,
    porQue:
      'la banda anual corregida: el techo del PLAN es la pauta que extingue, y por eso es 450 y no 500 (F-8)',
  },
];

/**
 * `ambito` decide sobre qué se corre el patrón:
 *  · `'documento'` — el archivo entero, sin negritas.
 *  · `'cabecera'`  — sólo las primeras 60 líneas.
 */
interface Prohibido {
  patron: RegExp;
  porQue: string;
  ambito?: 'documento' | 'cabecera';
  /** Excepción medida sobre **la oración del match** — la misma unidad que el patrón. */
  salvoSi?: { patron: RegExp; porQue: string };
  /**
   * **El prohibido sólo dispara si la oración nombra a alguien que podría tener
   * la potestad.** Existe por un defecto que apareció apenas se escribieron las
   * tres primeras secciones: los prohibidos de la restricción del fundador se
   * pusieron rojos sobre frases que el documento NECESITA escribir — «ninguna
   * regulación de contenido se queda en manos del que la escribió», «incluida la
   * que paga por alcance verificado», «es un ministerio de la verdad con buenos
   * modales» —, porque el método retórico de este PLAN es **nombrar el mecanismo
   * prohibido para rechazarlo**, y el lookbehind sólo ve negaciones anteriores.
   *
   * El invariante real no es «la palabra no aparece»: es «este PLAN no le da a
   * nadie la potestad sobre contenido». Entonces la oración tiene que nombrar a
   * ese alguien. Una crítica abstracta al mecanismo no le da potestad a nadie.
   *
   * **Hueco conocido y declarado:** una construcción impersonal —«el contenido se
   * licencia»— no nombra actor y se escapa. Es más angosto que el falso positivo
   * que reemplaza, y queda anotado acá en vez de descubrirse después.
   */
  exigeActor?: boolean;
}

/**
 * Quién podría tener la potestad. Si la oración no nombra a ninguno, el
 * prohibido con `exigeActor` no corre.
 */
const ACTOR = /\bANBAC\b|\beste PLAN\b|\bPLANFOCO\b|\bel Estado\b|\bla agencia\b|\bel gobierno\b|\bla autoridad\b|\bla ANBAC\b/iu;

/**
 * Negación en CUALQUIER parte de la oración, no sólo antes del verbo. El
 * lookbehind cubre «el Estado no licencia contenido»; esto cubre «... es un
 * ministerio de la verdad con buenos modales, y este PLAN existe para no ser eso»,
 * donde el rechazo llega después.
 */
const RECHAZO = {
  patron: /\b(no|ni|nunca|jamás|tampoco|ning[úu]n|ninguna|nadie)\b|prohib|descart|rechaz|renunci/iu,
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
 * versión usaba 30 y la guardia se puso roja sobre su propia cabecera: en
 * «ningún dispositivo de este PLAN controla, licencia, habilita ni castiga
 * contenido» hay 35 caracteres entre la negación y el verbo, porque este PLAN
 * enumera sus renuncias en serie y la serie es larga a propósito. Sesenta cubre
 * la enumeración sin dejar que una negación de otra cláusula exima a una
 * afirmación posterior, que es lo único que el prohibido tiene que atrapar.
 */
const NEG = '(?<!\\b(?:sin|no|ni|nunca|jamás|tampoco|ningún|ninguna|prohibido|prohíbe|impedido)\\b(?:(?!\\b(?:y|pero|aunque|sino|mas)\\b)[^.;:\\n]){0,60})';

const PROHIBIDOS: Prohibido[] = [
  {
    patron: /Vigésimo Sexto Mandato/u,
    porQue:
      'el Vigésimo Sexto es PLANPREGUNTA. PLANFOCO es el ordinal 26 y el mandato VIGÉSIMO SÉPTIMO: ' +
      'el desfase de 1 viene de PLANRUTA y es convención de todo el corpus',
  },
  {
    patron: /PLANFOCO\s*:\s*\d/u,
    porQue:
      'remisión con número de línea al propio documento desde su propio cuerpo. Las líneas se ' +
      'mueven con cada edición y la cita queda apuntando a otra cosa',
  },
  {
    patron: /PRESUPUESTO_CONSOLIDADO(?:_BASTA\.md)?\s*:\s*396/u,
    porQue:
      'domicilio equivocado. La spec citaba :396 —que es la fila de PLANDIG de la tabla de régimen— ' +
      'y la pauta vive en :419 (F-1)',
  },
  {
    patron: /3\.000\s*(?:sedes|Bibliotecas|bibliotecas)|(?:sedes|Bibliotecas)\s*(?:[^.;:\n]){0,20}3\.000/u,
    porQue:
      'los 3.000 son de PLANDIG:788 y miden cobertura del derecho, no obra propia. Este PLAN ' +
      'construye 1.200-1.500 y certifica el resto con las bibliotecas populares de PLANCUL:259 (F-3)',
    salvoSi: {
      patron: /PLANDIG|:788|:799|certifica|cobertura|derecho|convenio/u,
      porQue:
        'la oración que ATRIBUYE el número a PLANDIG es la que hay que escribir, no la que hay que ' +
        'prohibir: el error sería estrenarlo como meta de obra de este PLAN',
    },
  },
  {
    patron: /300\s*[–—-]\s*500/u,
    porQue:
      'la banda anual se corrigió a 300-450: el techo del PLAN es la pauta que extingue, y no hay ' +
      'segunda fuente reclamada (F-8)',
    salvoSi: {
      patron: /corrig|corrección|spec|dec[íi]a|pasaba de|en vez de/iu,
      porQue: 'la oración que DECLARA la corrección tiene que poder nombrar el valor viejo',
    },
  },
  {
    patron: /3\.000\s*[–—-]\s*5\.000/u,
    porQue: 'el total a quince años se corrigió a 3.540-5.400 al derivarlo de la rampa (F-8)',
    salvoSi: {
      patron: /corrig|corrección|spec|dec[íi]a|pasaba de|en vez de|gate/iu,
      porQue: 'la oración que DECLARA la corrección tiene que poder nombrar el valor viejo',
    },
  },
  /**
   * Los cuatro de abajo vigilan la restricción absoluta del fundador, y son
   * AFIRMATIVOS CON LOOKBEHIND DE NEGACIÓN. Sin el lookbehind, la guardia se
   * pondría roja sobre las frases que el PLAN existe para escribir: «el Estado
   * no licencia contenido», «ANBAC no regula medios». Un prohibido que castiga
   * la renuncia y deja pasar el reclamo está al revés.
   */
  {
    patron: new RegExp(
      `${NEG}\\b(licencia|licencias|licenciar|habilita|habilitar|autoriza|autorizar)\\b(?:[^.;:\\n]){0,60}\\b(contenido|contenidos|medio|medios|publicaci[óo]n|programaci[óo]n)\\b`,
      'iu',
    ),
    porQue:
      'la restricción del fundador es absoluta: ningún dispositivo puede licenciar, habilitar ni ' +
      'autorizar contenido. La forma negada queda exenta sola por el lookbehind',
    exigeActor: true,
    salvoSi: RECHAZO,
  },
  {
    patron: new RegExp(
      `${NEG}\\b(regula|regular|regulaci[óo]n|fiscaliza|fiscalizar)\\b(?:[^.;:\\n]){0,60}\\b(contenido|contenidos|medio|medios|l[íi]nea editorial)\\b`,
      'iu',
    ),
    porQue: 'el Estado no regula medios en este PLAN: se aplica una sola disciplina a sí mismo, sobre su propia billetera',
    exigeActor: true,
    salvoSi: {
      patron: new RegExp(`${RECHAZO.patron.source}|CNDC|antimonopolio|concentraci[óo]n|PLANCUL`, 'iu'),
      porQue:
        `${RECHAZO.porQue}. Y además: la acción antimonopolio de PLANCUL:387 (Acción 1) la aplica la ` +
        'CNDC y no es contenido, así que nombrarla exige usar la palabra',
    },
  },
  {
    patron: new RegExp(
      `${NEG}\\b(da|dar|reparte|repartir|asigna|asignar|paga|pagar)\\b(?:[^.;:\\n]){0,40}\\balcance verificado\\b`,
      'iu',
    ),
    porQue:
      'pagar por alcance verificado es subsidiar al incumbente, y es exactamente el mecanismo que ' +
      'la Pauta Ciega existe para desmontar (spec §6)',
    exigeActor: true,
    salvoSi: RECHAZO,
  },
  {
    patron: new RegExp(`${NEG}\\b(es|ser[íi]a|funciona como)\\b\\s+(?:un\\s+)?Ministerio de la Verdad`, 'iu'),
    porQue: 'este PLAN existe para no serlo. La frase sólo puede aparecer negada o rechazada',
    salvoSi: RECHAZO,
  },
  /**
   * El piso: PLANFOCO no lo tiene y no lo pide. Su piso va a Visión 2040+.
   * Mismo lookbehind, misma razón.
   */
  {
    patron: new RegExp(
      `${NEG}(piso constitucional|escal[óo]n)\\s+(?:de\\s+)?(PLANFOCO|propio|nuestro)|nuestro\\s+(?:piso constitucional|escal[óo]n)|noveno escal[óo]n`,
      'iu',
    ),
    porQue:
      'la Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto. PLANFOCO no reclama piso ' +
      'y no agrega escalón: su piso va a Visión 2040+',
    salvoSi: {
      patron: /2040|Visi[óo]n|todav[íi]a no|más adelante|difiere|diferido/iu,
      porQue: 'la oración que DIFIERE el piso a Visión 2040 tiene que poder nombrarlo',
    },
  },
  {
    patron: /PLANEDU(?:(?![.\n])[^.\n]){0,120}(?:ya dicta|ya ense[ñn]a|ya tiene)(?:(?![.\n])[^.\n]){0,40}algor[íi]tmic/iu,
    porQue:
      'PLANDIG:803 da la materia por dictada y la palabra «algorítmica» no aparece ni una vez en ' +
      'PLANEDU. El Desmontaje la crea; no la encuentra (F-5)',
    salvoSi: {
      patron: /\bno\b|cero ocurrencias|no existe|nunca|todav[íi]a no/iu,
      porQue: 'la oración que DENUNCIA la referencia rota es la que hay que escribir',
    },
  },
  {
    patron: /\b(TODO|TKTK|XXX)\b|\[pendiente\]|«PENDIENTE»|\{PENDIENTE\}/u,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
];

/**
 * Términos con CERO ocurrencias en los veinticuatro documentos del taller. No
 * está mal usarlos: está mal usarlos como si el corpus ya los tuviera. Se
 * estrenan declarando el estreno, o el lector supone que ya estaban (F-6).
 */
const ESTRENOS_QUE_SE_DECLARAN: { termino: RegExp; declaracion: RegExp; porQue: string }[] = [
  {
    termino: /\bmedios públicos\b/iu,
    declaracion: /no aparece|nunca aparece|cero ocurrencias|no lo nombra|ninguna menci[óo]n|aserci[óo]n propia|supuesto de trabajo/iu,
    porQue:
      '«medios públicos», «Radio Nacional», «Televisión Pública» y «RTA» tienen cero ocurrencias en ' +
      'los 24 documentos del taller. La Sala Común y el Acervo se apoyan enteros en aserción propia',
  },
  {
    termino: /\bBeca del Desierto\b/u,
    declaracion: /no aparece|nunca aparece|cero ocurrencias|no lo nombra|aserci[óo]n propia|decisi[óo]n de diseño/iu,
    porQue: 'cero ocurrencias en el corpus. Se estrena declarándolo (arreglo 9)',
  },
  {
    termino: /\bCartelera\b/u,
    declaracion: /PLANSAL|:1515|cartelera f[íi]sica|no es el mismo|distinto|desambigua/iu,
    porQue:
      'PLANSAL:1515 usa «cartelera física» para el tablón de gastos de un Centro de Vitalidad. No es ' +
      'el mismo objeto y hay que desambiguarlo la primera vez (F-6)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo. Heredadas de los tramos C y D con sus arreglos adentro.
// ─────────────────────────────────────────────────────────────────────────────

function celdas(linea: string): string[] {
  return linea
    .replace(/\*\*/g, '')
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());
}

const esFilaDeTabla = (l: string): boolean => l.trim().startsWith('|');
const esSeparadorDeTabla = (l: string): boolean => /^\|[\s:|-]+\|$/.test(l.trim());
const esEncabezado = (l: string): boolean => /^#{1,6}\s/.test(l.trim());

/**
 * Las filas de LA tabla cuya cabecera contiene todas las columnas pedidas, en
 * ORDEN. Los tres modos de falla del tramo C vienen arreglados de fábrica: si
 * el ancla no es única el chequeo no corre y lo dice; un párrafo intercalado no
 * corta el parseo; y la cabecera se reconoce por orden, no por conjunto.
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
      // Una crítica abstracta al mecanismo no le da la potestad a nadie: sin actor, no hay reclamo.
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
  if (canon.has('PLANFOCO')) {
    return [
      'PLANFOCO figura en PISOS_SEGUN_EL_TALLER: este PLAN no reclama piso constitucional. Su piso ' +
        'va a Visión 2040+ y la Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto',
    ];
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Las tres tablas contables.
// ─────────────────────────────────────────────────────────────────────────────

/** «1.500» -> 1500. Sin centésimas: son millones enteros. */
function entero(celda: string): number | null {
  const m = /-?[\d.]+/.exec(celda.replace(/\s/g, ''));
  if (!m) return null;
  const n = Number(m[0].replace(/\./g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * **LA EXTINCIÓN, QUE ES EL ARREGLO 1 CONVERTIDO EN CHEQUEO.** La pauta son USD
 * 450M (`PRESUPUESTO_CONSOLIDADO:419`) y se extingue en quintos. La columna
 * «Liberado» tiene que ser el complemento EXACTO de la remanente contra 450 —
 * una tabla de extinción donde las dos columnas no cierran es una tabla que
 * libera plata que no existe.
 */
const PAUTA_TOTAL = 450;
const COLUMNAS_EXTINCION = ['Año', 'Pauta', 'Liberado'];

function verificarExtincion(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_EXTINCION, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push('no se encontró la tabla de extinción de la pauta (columnas Año/Pauta/Liberado)');
    }
    return errores;
  }
  if (filas.length < 5) {
    errores.push(`la tabla de extinción tiene ${String(filas.length)} filas y la extinción corre en quintos`);
  }
  let llegaACero = false;
  for (const fila of filas) {
    const remanente = entero(fila[1] ?? '');
    const liberado = entero(fila[2] ?? '');
    if (remanente === null || liberado === null) {
      errores.push(`extinción: no se pudo leer la fila «${fila[0] ?? ''}»`);
      continue;
    }
    if (remanente + liberado !== PAUTA_TOTAL) {
      errores.push(
        `extinción, «${fila[0] ?? ''}»: ${String(remanente)} + ${String(liberado)} = ` +
          `${String(remanente + liberado)} y la pauta son ${String(PAUTA_TOTAL)} (PRESUPUESTO_CONSOLIDADO:419)`,
      );
    }
    if (remanente === 0) llegaACero = true;
  }
  if (!llegaACero) {
    errores.push(
      'la tabla de extinción nunca llega a cero: «hasta extinción» quiere decir que el Estado deja ' +
        'de poder colocar un peso en un medio, no que reparta menos',
    );
  }
  return errores;
}

/**
 * **LA RAMPA.** Cada subtotal se RECALCULA como anual × años, porque una tabla
 * que declara subtotales a mano cierra siempre. Y ninguna fase puede gastar por
 * encima de lo que la extinción liberó: el techo de este PLAN es la pauta que
 * mata.
 */
const COLUMNAS_RAMPA = ['Fase', 'Años', 'Anual bajo', 'Anual alto', 'Subtotal bajo', 'Subtotal alto'];
const VENTANA = 15;

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
      if (n !== null && n !== VENTANA) {
        errores.push(`la fila de total declara ${String(n)} años y la ventana son ${String(VENTANA)}`);
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
    if (ab * n !== sb) {
      errores.push(`rampa, «${fila[0] ?? ''}»: ${String(ab)} × ${String(n)} = ${String(ab * n)} y declara ${String(sb)}`);
    }
    if (aa * n !== sa) {
      errores.push(`rampa, «${fila[0] ?? ''}»: ${String(aa)} × ${String(n)} = ${String(aa * n)} y declara ${String(sa)}`);
    }
    if (aa > PAUTA_TOTAL) {
      errores.push(
        `rampa, «${fila[0] ?? ''}»: el anual alto es ${String(aa)} y la pauta entera son ` +
          `${String(PAUTA_TOTAL)}. El techo de este PLAN es la fuente que extingue, y no hay segunda ` +
          'fuente reclamada (F-8)',
      );
    }
    bajo += sb;
    alto += sa;
    anios += n;
  }

  if (anios !== VENTANA) {
    errores.push(`las fases de la rampa suman ${String(anios)} años y la ventana son ${String(VENTANA)}`);
  }
  if (totalDeclarado === null) {
    errores.push('la tabla de la rampa no tiene fila de total legible');
  } else if (totalDeclarado[0] !== bajo || totalDeclarado[1] !== alto) {
    errores.push(
      `la fila de total dice ${String(totalDeclarado[0])}-${String(totalDeclarado[1])} y las fases ` +
        `suman ${String(bajo)}-${String(alto)}`,
    );
  }
  return errores;
}

/**
 * **EL REPARTO INTERNO DEL RÉGIMEN.** Las siete líneas tienen que sumar 300 y
 * 450 EXACTOS, que es la banda anual corregida. Sin este chequeo se puede
 * agregar una línea de dispositivo sin sacarla de ningún lado, y el documento
 * gasta plata que no tiene.
 */
const COLUMNAS_REPARTO = ['Línea', 'Bajo', 'Alto'];
const REGIMEN_BAJO = 300;
const REGIMEN_ALTO = 450;

function verificarReparto(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_REPARTO, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push('no se encontró la tabla de reparto interno del régimen (columnas Línea/Bajo/Alto)');
    }
    return errores;
  }

  let bajo = 0;
  let alto = 0;
  let lineasReales = 0;
  let totalDeclarado: [number, number] | null = null;

  for (const fila of filas) {
    const b = entero(fila[1] ?? '');
    const a = entero(fila[2] ?? '');
    if (/^\**\s*total/i.test((fila[0] ?? '').trim())) {
      if (b !== null && a !== null) totalDeclarado = [b, a];
      continue;
    }
    if (b === null || a === null) {
      errores.push(`reparto: no se pudo leer la fila «${fila[0] ?? ''}»`);
      continue;
    }
    if (b > a) {
      errores.push(`reparto, «${fila[0] ?? ''}»: el extremo bajo (${String(b)}) es mayor que el alto (${String(a)})`);
    }
    bajo += b;
    alto += a;
    lineasReales += 1;
  }

  if (lineasReales !== 7) {
    errores.push(`el reparto interno tiene ${String(lineasReales)} líneas y los dispositivos son siete`);
  }
  if (bajo !== REGIMEN_BAJO) {
    errores.push(
      `el reparto suma ${String(bajo)} en el extremo bajo y la banda es ${String(REGIMEN_BAJO)} exacto: ` +
        'un reparto que no cierra reparte plata que no existe o se olvida plata que sí',
    );
  }
  if (alto !== REGIMEN_ALTO) {
    errores.push(
      `el reparto suma ${String(alto)} en el extremo alto y la banda es ${String(REGIMEN_ALTO)} exacto, ` +
        'que es el tamaño de la pauta entera (PRESUPUESTO_CONSOLIDADO:419)',
    );
  }
  if (totalDeclarado !== null && (totalDeclarado[0] !== bajo || totalDeclarado[1] !== alto)) {
    errores.push(
      `la fila de total del reparto dice ${String(totalDeclarado[0])}-${String(totalDeclarado[1])} y ` +
        `las líneas suman ${String(bajo)}-${String(alto)}`,
    );
  }
  return errores;
}

/**
 * La derogación de la Acción 3, del lado de PLANCUL. Es el espejo del chequeo
 * que el tramo D puso sobre PLANTER: una derogación escrita en un solo
 * documento deja al otro afirmando en presente algo que dejó de ser verdad, y
 * ésa fue la lección 2 del cierre del tramo D. Se enciende cuando la Task 12
 * corre.
 */
function verificarDerogacionEnPlancul(raw: string): string[] {
  if (!/Acci[óo]n 3/u.test(raw)) return []; // El documento todavía no la nombra.
  let ajeno: string;
  try {
    ajeno = readFileSync(PLANCUL, 'utf8');
  } catch {
    return [`no se pudo leer ${PLANCUL}`];
  }
  if (!/PLANFOCO/u.test(ajeno)) {
    return [
      'PLANFOCO deroga la Acción 3 de PLANCUL y PLANCUL no lo nombra ni una vez: una derogación ' +
        'escrita de un solo lado deja al otro documento afirmando en presente algo que dejó de ser ' +
        'verdad (lección 2 del tramo D)',
    ];
  }
  return [];
}

function verificarCabecera(lineas: string[]): string[] {
  const errores: string[] = [];
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }
  const iMandato = lineas.findIndex((l) => l.trim() === H2_MANDATO);
  const iH1 = lineas.findIndex((l) => l.startsWith('# PLANFOCO'));
  if (iH1 === -1) errores.push('falta el H1 «# PLANFOCO — …»');
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
    ...verificarExtincion(lineas),
    ...verificarRampa(lineas),
    ...verificarReparto(lineas),
    ...verificarDerogacionEnPlancul(raw),
    ...verificarCabecera(lineas),
    ...verificarPortada(lineas),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANFOCO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANFOCO OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(lineas.length)} líneas, ` +
      `${String(palabras)} palabras. Sin piso constitucional, verificado contra el canon del taller.`,
  );
}

main();
