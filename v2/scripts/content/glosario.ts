/**
 * **La guardia del glosario** — el escáner.
 *
 * El dueño fijó una palabra para cada cosa que la web y la app le muestran a una
 * persona: lo que alguien publica es un **aporte**, lo que arma un equipo es una
 * **campaña**, y así. Varias unidades reescribieron el copy para que fuera así.
 * Sin una guarda, los sinónimos vuelven con la próxima funcionalidad.
 *
 * Este módulo hace dos cosas y ninguna toca el disco más que para leer:
 *
 *  1. **extrae los textos que ve una persona** de un archivo TypeScript, con el
 *     AST de `typescript` (sólo se parsea, no se tipa). Entra: texto de JSX, los
 *     atributos con texto (`aria-label`, `title`, `placeholder`, `alt`, `label`…)
 *     y cualquier otra cadena o parte de plantilla. Sale: imports, claves de
 *     objeto, clases y enlaces, operandos de comparación, URLs, cadenas sin
 *     letras y los comentarios, que el AST ni siquiera ofrece;
 *  2. **cuenta las palabras retiradas** (`GLOSARIO`) en esos textos, descontando
 *     los usos legítimos de `PERMITIDOS`.
 *
 * Lo que queda se compara con una línea de base que sólo baja
 * (`glosario-linea-de-base.json`); la comparación vive en el test.
 *
 * Para regenerar la línea de base: `pnpm glosario:linea-de-base`.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

/* -------------------------------------------------------------------------- */
/*  La tabla                                                                   */
/* -------------------------------------------------------------------------- */

export interface Prohibida {
  /** La palabra en singular, tal como se escribe: es la clave en la línea de base. */
  readonly termino: string;
  /** Todas las formas que se buscan (singular y plural), con su tilde. */
  readonly formas: readonly string[];
}

export interface EntradaDelGlosario {
  /** El concepto, para quien lee la tabla. */
  readonly concepto: string;
  /** La palabra que sí se usa. */
  readonly preferida: string;
  readonly prohibidas: readonly Prohibida[];
  /** Una línea para quien tropieza con la guarda: qué decir en su lugar. */
  readonly explicacion: string;
}

const palabra = (termino: string, plural?: string): Prohibida => ({
  termino,
  formas: plural === undefined ? [termino] : [termino, plural],
});

/**
 * El glosario del dueño. Se compara sin tildes y sin mayúsculas, con límite de
 * palabra entera: `voz` no encuentra «vozarrón» ni `fase` encuentra «fases» de
 * otra entrada. Cada forma se escribe con su tilde para poder mostrarla.
 */
export const GLOSARIO: readonly EntradaDelGlosario[] = [
  {
    concepto: 'lo que alguien publica',
    preferida: 'aporte',
    prohibidas: [
      palabra('mirada', 'miradas'),
      palabra('voz', 'voces'),
      palabra('señal', 'señales'),
      palabra('posibilidad', 'posibilidades'),
      palabra('reflexión', 'reflexiones'),
      palabra('relato', 'relatos'),
    ],
    explicacion: 'lo que alguien publica se llama «aporte» (y «aportes» en los conteos)',
  },
  {
    concepto: 'una pregunta abierta por un equipo, con reglas y fecha',
    preferida: 'campaña',
    prohibidas: [palabra('convocatoria', 'convocatorias'), palabra('ronda', 'rondas')],
    explicacion: 'se dice «campaña»',
  },
  {
    concepto: 'lo que la campaña se compromete a hacer',
    preferida: 'reglas de la campaña',
    prohibidas: [palabra('contrato', 'contratos')],
    explicacion: 'se dice «reglas de la campaña»',
  },
  {
    concepto: 'cada tramo de una campaña',
    preferida: 'etapa',
    prohibidas: [palabra('fase', 'fases')],
    explicacion: 'se dice «etapa»',
  },
  {
    concepto: 'dónde',
    preferida: 'lugar',
    prohibidas: [palabra('ámbito', 'ámbitos'), palabra('alcance nacional')],
    explicacion: 'se dice «lugar», o «todo el país»',
  },
  {
    concepto: 'la propuesta que arma un grupo',
    preferida: 'ficha',
    prohibidas: [palabra('borrador público')],
    explicacion:
      'una propuesta que ya se puede leer se llama «ficha»; «borrador» es lo que todavía no se publicó',
  },
  {
    concepto: 'lo que junta aportes parecidos',
    preferida: 'grupo',
    prohibidas: [palabra('núcleo', 'núcleos')],
    explicacion: 'lo que junta aportes parecidos se llama «grupo»',
  },
];

/* -------------------------------------------------------------------------- */
/*  Los usos legítimos                                                         */
/* -------------------------------------------------------------------------- */

export interface Permitido {
  /**
   * Dónde vale: la ruta relativa a `v2/` con barras (`apps/web/src/...`), una
   * carpeta (termina en `/`) o `'*'` para cualquier archivo.
   */
  readonly archivo: string;
  /**
   * La frase exacta que se permite (sin importar tildes ni mayúsculas) y no la
   * palabra suelta: «en voz alta» no le abre la puerta a «tu voz».
   */
  readonly termino: string;
  /** Por qué es legítimo. Sin motivo no hay excepción. */
  readonly motivo: string;
}

/**
 * Cada entrada es una frase, no una palabra suelta, y cada una dice por qué.
 *
 * Qué NO va acá: una violación de verdad. Si el texto usa «voz» para decir
 * «aporte», se arregla el texto; lo que no se puede arreglar todavía va a la
 * línea de base (`glosario-linea-de-base.json`), que sólo baja. Esta lista es
 * para lo que el glosario no quiso decir.
 *
 * El test falla si una entrada ya no tapa nada: una excepción que sobrevive a su
 * texto es la puerta abierta para el próximo.
 */
export const PERMITIDOS: readonly Permitido[] = [
  {
    archivo: '*',
    termino: 'en voz alta',
    motivo: 'Modismo: hablar sin callarse. «Voz» acá no nombra un aporte.',
  },
  {
    archivo: '*',
    termino: 'en voz baja',
    motivo: 'Modismo: hablar sin que se oiga. «Voz» acá no nombra un aporte.',
  },
  {
    archivo: '*',
    termino: 'tengas señal',
    motivo: 'Señal de teléfono (cobertura), no un aporte.',
  },
  {
    archivo: '*',
    termino: 'Entrená la mirada',
    motivo: 'Modismo de la portada de Entrenamientos: educar el ojo. No es un aporte.',
  },
  {
    archivo: 'apps/web/src/pages/Entrenamientos/sections/PortadaEntrenamientos.tsx',
    termino: 'la mirada',
    motivo:
      'La misma frase, partida en dos cadenas para el rito de tinta (`[«Entrená», «la mirada.»]`).',
  },
  {
    archivo: 'apps/web/src/',
    termino: 'segunda mirada',
    motivo:
      'Quien vuelve a mirar un aporte ajeno para comprobarlo: el acto, no el aporte. Lo permitía ya la guarda de las superficies de lectura.',
  },
  {
    archivo: 'apps/web/src/lib/vocabulario.ts',
    termino: 'otra mirada',
    motivo:
      'Rótulo del estado «por verificar»: otra persona tiene que volver a mirar. Es el acto de comprobar, no el aporte; lo fijan MiEspacio y Fichas en sus tests.',
  },
  {
    archivo: 'apps/web/src/pages/LaRadiografia/',
    termino: 'voces inventadas',
    motivo:
      'Sello del ejemplo, fijado por `sello-del-lienzo.test.ts`: dice, a la vista, que las frases del ejemplo no son de nadie.',
  },
  {
    archivo: 'apps/web/src/pages/UnaRutaParaArgentina/sections/Phases.tsx',
    termino: 'Fase',
    motivo:
      'Las cinco fases de la ruta del país (de la chispa individual al país habitable) son otra cosa que las etapas de una campaña.',
  },
  {
    archivo: 'apps/web/src/pages/UnaRutaParaArgentina/sections/Phases.tsx',
    termino: 'Cinco fases',
    motivo: 'Las cinco fases de la ruta del país, no las etapas de una campaña.',
  },
  {
    archivo: 'apps/web/src/pages/UnaRutaParaArgentina.tsx',
    termino: 'Cinco fases',
    motivo: 'Las cinco fases de la ruta del país, no las etapas de una campaña.',
  },
  {
    archivo: 'apps/web/src/pages/Entrenamientos/entrenamientos-data.ts',
    termino: 'Reflexión',
    motivo:
      'Rótulo de una categoría de cursos (visión, acción, reflexión, comunidad…), traducida del slug del curso. Es una categoría, no un aporte.',
  },
  {
    archivo: 'apps/web/src/pages/WeeklyCheckin.tsx',
    termino: 'Reflexión (opcional)',
    motivo:
      'El campo de reflexión del chequeo semanal (progreso, metas, cómo te fue): un diario personal, no un aporte de campaña.',
  },
  {
    archivo: 'apps/web/src/pages/Entrenamientos/sections/EntregaFinalEntrenamiento.tsx',
    termino: 'documentos, voces, números',
    motivo:
      'Fuentes de un trabajo de análisis (testimonios, documentos, números): «voces» como quienes hablan del tema, no como aportes de la plataforma.',
  },
  {
    archivo: 'apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx',
    termino: 'una posibilidad por construir',
    motivo: 'Sentido corriente de la palabra (lo que el país todavía puede ser), no un aporte.',
  },
  {
    archivo: 'apps/web/src/pages/Fichas/VinculosDeLaFicha.tsx',
    termino: '/senal/',
    motivo:
      'Tramo de una dirección web que el aviso le muestra a quien pega un enlace: es la dirección, no el nombre del aporte.',
  },
  {
    archivo: 'apps/web/src/pages/Sembrar/sections/CertificadoSemilla.tsx',
    termino: 'tu contrato con vos',
    motivo: 'Metáfora de un compromiso personal; nada que ver con las reglas de una campaña.',
  },
  {
    archivo: 'apps/web/src/pages/QuienEstaDetras/quien-data.ts',
    termino: 'contratos que se cumplen',
    motivo:
      'Contratos en sentido jurídico (el Estado de derecho que hace falta), no reglas de una campaña.',
  },
  {
    archivo: 'apps/web/src/pages/QuienEstaDetras/quien-data.ts',
    termino: 'hagan valer un contrato',
    motivo: 'Contrato en sentido jurídico (jueces que lo hacen valer), no reglas de una campaña.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Qué se escanea                                                             */
/* -------------------------------------------------------------------------- */

export interface Alcance {
  readonly nombre: string;
  /** Relativo a `v2/`. */
  readonly directorio: string;
}

export const ALCANCES: readonly Alcance[] = [
  { nombre: 'web', directorio: 'apps/web/src' },
  { nombre: 'mobile', directorio: 'apps/mobile/src' },
  { nombre: 'shared', directorio: 'packages/shared/src' },
  { nombre: 'civic-core', directorio: 'packages/civic-core/src' },
];

/** `v2/`, subiendo desde `scripts/content/`. */
export const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const RUTA_LINEA_DE_BASE = join(RAIZ_V2, 'scripts/content/glosario-linea-de-base.json');

const SALTEAR_CARPETAS = new Set(['__tests__', 'node_modules', 'dist']);
const ES_ARCHIVO_DE_CODIGO = /\.tsx?$/u;
const ES_ARCHIVO_AJENO = /(\.test\.|\.spec\.|\.generated\.ts$|\.d\.ts$)/u;

/** Las rutas absolutas del código de un alcance, ordenadas. */
export function archivosDelAlcance(alcance: Alcance, raiz: string = RAIZ_V2): string[] {
  const base = join(raiz, alcance.directorio);
  const salida: string[] = [];
  const bajar = (directorio: string): void => {
    for (const nombre of readdirSync(directorio).sort()) {
      const ruta = join(directorio, nombre);
      if (statSync(ruta).isDirectory()) {
        if (!SALTEAR_CARPETAS.has(nombre)) bajar(ruta);
      } else if (ES_ARCHIVO_DE_CODIGO.test(nombre) && !ES_ARCHIVO_AJENO.test(nombre)) {
        salida.push(ruta);
      }
    }
  };
  bajar(base);
  return salida;
}

/** La ruta de un archivo como se escribe en la línea de base: relativa a `v2/`, con `/`. */
export const rutaRelativa = (absoluta: string, raiz: string = RAIZ_V2): string =>
  relative(raiz, absoluta).split(sep).join('/');

/* -------------------------------------------------------------------------- */
/*  Extraer lo que ve una persona                                              */
/* -------------------------------------------------------------------------- */

export interface TextoDeUsuario {
  readonly texto: string;
  /** Línea (desde 1) donde empieza el texto. */
  readonly linea: number;
}

/**
 * Atributos de JSX cuyo valor es una clase, un enlace o una clave y no un texto.
 * Los que llevan texto (`aria-label`, `title`, `placeholder`, `alt`, `label`) no
 * están: lo que no se excluye acá, se lee.
 */
const ATRIBUTOS_QUE_NO_SON_TEXTO = new Set([
  'className',
  'class',
  'href',
  'to',
  'key',
  'id',
  'style',
  'htmlFor',
  'src',
  'srcSet',
  'rel',
  'target',
  'role',
  'type',
  'name',
  'd',
  'viewBox',
  'aria-labelledby',
  'aria-describedby',
  'aria-controls',
  'aria-live',
]);

const esAtributoQueNoEsTexto = (nombre: string): boolean =>
  ATRIBUTOS_QUE_NO_SON_TEXTO.has(nombre) || nombre.startsWith('data-');

/** Métodos cuyo primer argumento se compara o se busca: es una clave, no un texto. */
const METODOS_DE_BUSQUEDA = new Set([
  'includes',
  'startsWith',
  'endsWith',
  'indexOf',
  'lastIndexOf',
  'match',
  'matchAll',
  'test',
  'has',
  'get',
  'set',
  'delete',
  'split',
  'replace',
  'replaceAll',
  'localeCompare',
  'getItem',
  'setItem',
  'removeItem',
  'getAttribute',
  'setAttribute',
  'querySelector',
  'querySelectorAll',
  'closest',
  'hasOwnProperty',
  'addEventListener',
  'removeEventListener',
  'matches',
]);

/** Funciones que arman clases: todos sus argumentos son clases. */
const FUNCIONES_DE_CLASES = new Set(['cn', 'clsx', 'cva', 'twMerge', 'classNames']);

const OPERADORES_DE_COMPARACION = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
]);

function nombreDeLlamada(llamada: ts.CallExpression | ts.NewExpression): string | undefined {
  const callee = llamada.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  return undefined;
}

/** ¿Este nodo es el nombre (la clave) de la declaración que lo contiene? */
function esClave(nodo: ts.Node): boolean {
  const padre = nodo.parent;
  if (ts.isComputedPropertyName(padre)) return true;
  if (
    ts.isPropertyAssignment(padre) ||
    ts.isPropertySignature(padre) ||
    ts.isPropertyDeclaration(padre) ||
    ts.isMethodDeclaration(padre) ||
    ts.isMethodSignature(padre) ||
    ts.isGetAccessorDeclaration(padre) ||
    ts.isSetAccessorDeclaration(padre) ||
    ts.isEnumMember(padre)
  ) {
    return padre.name === nodo;
  }
  if (ts.isBindingElement(padre)) return padre.propertyName === nodo;
  if (ts.isImportSpecifier(padre) || ts.isExportSpecifier(padre)) return true;
  if (ts.isElementAccessExpression(padre)) return padre.argumentExpression === nodo;
  return false;
}

/** ¿Este literal está en una posición donde es código y no un texto para leer? */
function esCodigo(nodo: ts.Node): boolean {
  const padre = nodo.parent;

  // Módulos: `import x from '...'`, `export * from '...'`, `import('...')`, `require('...')`.
  if (
    ts.isImportDeclaration(padre) ||
    ts.isExportDeclaration(padre) ||
    ts.isExternalModuleReference(padre) ||
    ts.isImportEqualsDeclaration(padre) ||
    ts.isModuleDeclaration(padre)
  ) {
    return true;
  }

  // Directivas: `'use client'`.
  if (ts.isExpressionStatement(padre)) return true;

  // Tipos: `'voz' | 'señal'`, `Record<'a', string>`.
  for (let p: ts.Node = padre; !ts.isSourceFile(p); p = p.parent) {
    if (ts.isTypeNode(p)) return true;
  }

  if (esClave(nodo)) return true;

  // `a === 'x'`, `a !== 'x'`, `case 'x':`.
  if (ts.isBinaryExpression(padre) && OPERADORES_DE_COMPARACION.has(padre.operatorToken.kind)) {
    return true;
  }
  if (ts.isCaseClause(padre) && padre.expression === nodo) return true;

  // `html\`...\``, `sql\`...\``: plantillas con otro lenguaje adentro.
  if (ts.isTaggedTemplateExpression(padre)) return true;

  if (ts.isCallExpression(padre) || ts.isNewExpression(padre)) {
    const argumentos = padre.arguments ?? [];
    const indice = argumentos.findIndex((a) => a === nodo);
    if (indice >= 0) {
      if (ts.isCallExpression(padre) && padre.expression.kind === ts.SyntaxKind.ImportKeyword) {
        return true;
      }
      const nombre = nombreDeLlamada(padre);
      if (nombre !== undefined) {
        if (nombre === 'require' || nombre === 'RegExp') return true;
        if (FUNCIONES_DE_CLASES.has(nombre)) return true;
        if (indice === 0 && METODOS_DE_BUSQUEDA.has(nombre)) return true;
      }
    }
  }

  // Todo lo que está dentro de un `className={...}` o un `href={...}` es clase o enlace.
  for (let p: ts.Node = padre; !ts.isSourceFile(p); p = p.parent) {
    if (ts.isJsxAttribute(p)) {
      return esAtributoQueNoEsTexto(ts.isIdentifier(p.name) ? p.name.text : p.name.getText());
    }
    // Un atributo no contiene a una función con su propio cuerpo de texto, pero
    // sí a sus clases: se sigue subiendo mientras haya expresiones.
    if (ts.isStatement(p)) break;
  }

  return false;
}

const SIN_ESPACIOS = /^\S+$/u;
const HAY_UNA_LETRA = /\p{L}/u;
/** `mapa-voces`, `senal.aporte`, `a_b`: una clave con separadores, no una frase. */
const CLAVE_CON_SEPARADORES = /^[\p{L}\p{N}]+(?:[-_.:][\p{L}\p{N}]+)+$/u;
/** Una sola ficha de ASCII sin mayúsculas ni espacios: `'voces'`, `'senales'`, `'fases.'`. */
const FICHA_DE_MAQUINA = /^[\x21-\x40\x5b-\x7e]+$/u;

/** Ruta, URL o esquema: sin espacios y con barra, o con esquema. */
function pareceRuta(texto: string): boolean {
  if (!SIN_ESPACIOS.test(texto)) return false;
  return texto.startsWith('/') || texto.includes('/') || /^[a-z][a-z0-9+.-]*:/iu.test(texto);
}

/**
 * Un identificador y no una palabra para leer: una sola ficha, sin espacios, con
 * ASCII y sin mayúsculas (`'voz'`, `'senales'`, `'fase'`). Es como se escriben los
 * valores de un enum, las claves de caché y los nombres de métrica. Una palabra
 * de interfaz con ñ o con tilde (`'señales'`), o con mayúscula inicial
 * (`'Voces'`), no entra acá: ésa sí se lee.
 *
 * Es una concesión, y se paga: una etiqueta escrita en minúscula y sin tilde
 * como `label: 'voces'` pasa. El resto de la guarda no depende de esto.
 */
function esIdentificador(texto: string): boolean {
  return FICHA_DE_MAQUINA.test(texto);
}

/** ¿Vale la pena leer este texto? Filtra lo que no es una frase para una persona. */
function esLegible(texto: string): boolean {
  if (!HAY_UNA_LETRA.test(texto)) return false;
  if (pareceRuta(texto)) return false;
  if (CLAVE_CON_SEPARADORES.test(texto)) return false;
  if (esIdentificador(texto)) return false;
  return true;
}

/**
 * Los textos que llegan a una persona en un archivo TypeScript o TSX.
 *
 * Es una función pura de texto a datos: se prueba con cadenas.
 */
export function textosDeUsuario(codigo: string, nombre = 'archivo.tsx'): TextoDeUsuario[] {
  const fuente = ts.createSourceFile(
    nombre,
    codigo,
    ts.ScriptTarget.Latest,
    true,
    nombre.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const salida: TextoDeUsuario[] = [];
  const lineaDe = (posicion: number): number =>
    fuente.getLineAndCharacterOfPosition(posicion).line + 1;

  const agregar = (texto: string, posicion: number): void => {
    if (esLegible(texto)) salida.push({ texto, linea: lineaDe(posicion) });
  };

  const mirar = (nodo: ts.Node): void => {
    if (ts.isJsxText(nodo)) {
      // El texto de JSX arranca en `pos`: lleva adentro su sangría y sus saltos.
      agregar(nodo.text, nodo.pos);
    } else if (ts.isStringLiteral(nodo) || ts.isNoSubstitutionTemplateLiteral(nodo)) {
      if (!esCodigo(nodo)) agregar(nodo.text, nodo.getStart(fuente));
    } else if (ts.isTemplateHead(nodo) || ts.isTemplateMiddle(nodo) || ts.isTemplateTail(nodo)) {
      const plantilla =
        nodo.parent.kind === ts.SyntaxKind.TemplateSpan ? nodo.parent.parent : nodo.parent;
      if (!esCodigo(plantilla)) agregar(nodo.text, nodo.getStart(fuente));
    }
    ts.forEachChild(nodo, mirar);
  };
  mirar(fuente);
  return salida;
}

/* -------------------------------------------------------------------------- */
/*  Buscar las palabras retiradas                                              */
/* -------------------------------------------------------------------------- */

/** Sin tildes y en minúsculas. Conserva el largo para que los índices valgan. */
export function plegar(texto: string): string {
  return texto.normalize('NFC').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

const escaparRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

/** Una frase como patrón: los espacios admiten saltos de línea (el JSX parte las líneas). */
const patronDeFrase = (frase: string): string =>
  plegar(frase).split(/\s+/u).map(escaparRegex).join('\\s+');

const LIMITE_IZQUIERDO = '(?<![\\p{L}\\p{N}_])';
const LIMITE_DERECHO = '(?![\\p{L}\\p{N}_])';

interface Buscadora {
  readonly regex: RegExp;
  readonly termino: string;
  readonly explicacion: string;
  /** La forma plegada → cómo se escribe de verdad (con su tilde). */
  readonly escritura: ReadonlyMap<string, string>;
}

const BUSCADORAS: readonly Buscadora[] = GLOSARIO.flatMap((entrada) =>
  entrada.prohibidas.map((p): Buscadora => {
    const escritura = new Map(p.formas.map((f) => [plegar(f).replace(/\s+/gu, ' '), f]));
    return {
      regex: new RegExp(
        `${LIMITE_IZQUIERDO}(?:${p.formas.map(patronDeFrase).join('|')})${LIMITE_DERECHO}`,
        'giu',
      ),
      termino: p.termino,
      explicacion: entrada.explicacion,
      escritura,
    };
  }),
);

export interface Hallazgo {
  /** Relativo a `v2/`, con `/`. */
  readonly archivo: string;
  readonly linea: number;
  /** La clave en la línea de base (la palabra en singular). */
  readonly termino: string;
  /** La forma que apareció, con su tilde. */
  readonly forma: string;
  readonly explicacion: string;
}

const archivoVale = (permitido: Permitido, archivo: string): boolean =>
  permitido.archivo === '*' ||
  permitido.archivo === archivo ||
  (permitido.archivo.endsWith('/') && archivo.startsWith(permitido.archivo));

/** Tapa con espacios las frases permitidas sin cambiar el largo del texto. */
function taparPermitidos(
  plegado: string,
  archivo: string,
  permitidos: readonly Permitido[],
  usados: Set<Permitido>,
): string {
  let resultado = plegado;
  for (const permitido of permitidos) {
    if (!archivoVale(permitido, archivo)) continue;
    const regex = new RegExp(
      `${LIMITE_IZQUIERDO}${patronDeFrase(permitido.termino)}${LIMITE_DERECHO}`,
      'giu',
    );
    resultado = resultado.replace(regex, (coincidencia) => {
      usados.add(permitido);
      return ' '.repeat(coincidencia.length);
    });
  }
  return resultado;
}

export interface ResultadoDeArchivo {
  readonly hallazgos: Hallazgo[];
  /** Las excepciones de `PERMITIDOS` que taparon algo en este archivo. */
  readonly usados: Set<Permitido>;
}

/** Las palabras retiradas que aparecen en los textos de un archivo. */
export function escanearCodigo(
  archivo: string,
  codigo: string,
  permitidos: readonly Permitido[] = PERMITIDOS,
): ResultadoDeArchivo {
  const hallazgos: Hallazgo[] = [];
  const usados = new Set<Permitido>();
  for (const { texto, linea } of textosDeUsuario(codigo, archivo)) {
    const plegado = taparPermitidos(plegar(texto), archivo, permitidos, usados);
    const encontrados: { indice: number; hallazgo: Hallazgo }[] = [];
    for (const buscadora of BUSCADORAS) {
      for (const coincidencia of plegado.matchAll(buscadora.regex)) {
        const indice = coincidencia.index;
        const saltos = plegado.slice(0, indice).split('\n').length - 1;
        const clave = coincidencia[0].replace(/\s+/gu, ' ');
        encontrados.push({
          indice,
          hallazgo: {
            archivo,
            linea: linea + saltos,
            termino: buscadora.termino,
            forma: buscadora.escritura.get(clave) ?? buscadora.termino,
            explicacion: buscadora.explicacion,
          },
        });
      }
    }
    // En el orden en que se leen, no en el de la tabla.
    encontrados.sort((a, b) => a.indice - b.indice);
    hallazgos.push(...encontrados.map((e) => e.hallazgo));
  }
  return { hallazgos, usados };
}

export interface ResultadoDelAlcance extends ResultadoDeArchivo {
  readonly nombre: string;
  readonly archivos: number;
}

/** Escanea un alcance entero. */
export function escanearAlcance(
  alcance: Alcance,
  raiz: string = RAIZ_V2,
  permitidos: readonly Permitido[] = PERMITIDOS,
): ResultadoDelAlcance {
  const archivos = archivosDelAlcance(alcance, raiz);
  const hallazgos: Hallazgo[] = [];
  const usados = new Set<Permitido>();
  for (const absoluta of archivos) {
    const resultado = escanearCodigo(
      rutaRelativa(absoluta, raiz),
      readFileSync(absoluta, 'utf8'),
      permitidos,
    );
    hallazgos.push(...resultado.hallazgos);
    for (const u of resultado.usados) usados.add(u);
  }
  return { nombre: alcance.nombre, archivos: archivos.length, hallazgos, usados };
}

/* -------------------------------------------------------------------------- */
/*  La línea de base                                                           */
/* -------------------------------------------------------------------------- */

/** `{ [archivo]: { [término]: cuántas veces } }`. */
export type LineaDeBase = Record<string, Record<string, number>>;

const comparar = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** El recuento de los hallazgos, con las claves ordenadas: es determinista. */
export function contar(hallazgos: readonly Hallazgo[]): LineaDeBase {
  const crudo: LineaDeBase = {};
  for (const h of hallazgos) {
    const porTermino = (crudo[h.archivo] ??= {});
    porTermino[h.termino] = (porTermino[h.termino] ?? 0) + 1;
  }
  const ordenado: LineaDeBase = {};
  for (const archivo of Object.keys(crudo).sort(comparar)) {
    const porTermino = crudo[archivo] ?? {};
    ordenado[archivo] = Object.fromEntries(
      Object.keys(porTermino)
        .sort(comparar)
        .map((termino) => [termino, porTermino[termino] ?? 0]),
    );
  }
  return ordenado;
}

/** El JSON tal como se guarda: dos espacios y salto final, igual que Prettier. */
export const serializarLineaDeBase = (linea: LineaDeBase): string =>
  `${JSON.stringify(linea, null, 2)}\n`;

export function leerLineaDeBase(ruta: string = RUTA_LINEA_DE_BASE): LineaDeBase {
  return JSON.parse(readFileSync(ruta, 'utf8')) as LineaDeBase;
}

/** Todo el escaneo: los cuatro alcances. */
export function escanearTodo(raiz: string = RAIZ_V2): ResultadoDelAlcance[] {
  return ALCANCES.map((alcance) => escanearAlcance(alcance, raiz));
}

if (process.argv[1]?.endsWith('glosario.ts')) {
  const resultados = escanearTodo();
  const hallazgos = resultados.flatMap((r) => r.hallazgos);
  if (process.argv.includes('--linea-de-base')) {
    writeFileSync(RUTA_LINEA_DE_BASE, serializarLineaDeBase(contar(hallazgos)));
    process.stdout.write(
      `línea de base escrita: ${String(hallazgos.length)} usos en ${String(Object.keys(contar(hallazgos)).length)} archivos\n`,
    );
  } else {
    for (const h of hallazgos) {
      process.stdout.write(`${h.archivo}:${String(h.linea)}\t${h.forma}\n`);
    }
  }
}
