/**
 * El corpus que entra al embebedor, cuando no viene de la base.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §8 — «todo contra un JSONL de
 * juguete». Existe para que la herramienta se pueda probar **hoy**, con la
 * tabla `senales` sin escribir y la base de v2 en cero (`D-002`).
 *
 * Una línea, un objeto `{ "id": "...", "texto": "..." }`. Sin envoltorio, sin
 * coma al final, sin tener que cargar el archivo entero en un `JSON.parse`.
 *
 * Este módulo no importa `@v2/db` a propósito: leer un archivo no debería
 * arrastrar un cliente de Postgres, y así su test corre sin base.
 */

/** Una fila del corpus: un id estable y el texto que lo produce. */
export interface FilaDeCorpus {
  id: string;
  texto: string;
}

/** Lo que se descartó y por qué. El job lo reporta en vez de tragárselo. */
export interface CorpusLeido {
  filas: FilaDeCorpus[];
  /** Líneas con `texto` vacío o en blanco. No se embeben: no dicen nada. */
  vacias: number;
  /** Ids repetidos. Gana el primero — reescribirlo en silencio sería peor. */
  repetidos: string[];
}

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

/**
 * Parsea un JSONL de `{ id, texto }`.
 *
 * **Falla ruidoso y con el número de línea.** Un corpus mal formado que se lee
 * a medias produce un análisis que parece completo y no lo está, y eso es
 * exactamente la clase de mentira silenciosa que la cabecera de la página
 * existe para impedir (§3.2 de la spec).
 */
export function leerJsonl(contenido: string): CorpusLeido {
  const filas: FilaDeCorpus[] = [];
  const vistos = new Set<string>();
  const repetidos: string[] = [];
  let vacias = 0;

  const lineas = contenido.split('\n');
  for (const [indice, cruda] of lineas.entries()) {
    const linea = cruda.trim();
    if (linea.length === 0) continue;

    const numero = indice + 1;
    let valor: unknown;
    try {
      valor = JSON.parse(linea) as unknown;
    } catch (error: unknown) {
      const motivo = error instanceof Error ? error.message : String(error);
      throw new Error(`Línea ${String(numero)} del corpus no es JSON válido: ${motivo}`);
    }

    if (!esObjeto(valor)) {
      throw new Error(`Línea ${String(numero)} del corpus no es un objeto JSON.`);
    }

    const id: unknown = valor.id;
    const texto: unknown = valor.texto;

    // El id se acepta como número por comodidad —`dreams.id` es un serial— y se
    // guarda como texto, que es lo que la tabla de vectores espera.
    const idTexto =
      typeof id === 'string' ? id.trim() : typeof id === 'number' && Number.isFinite(id) ? String(id) : '';
    if (idTexto.length === 0) {
      throw new Error(`Línea ${String(numero)} del corpus no tiene un «id» usable.`);
    }
    if (typeof texto !== 'string') {
      throw new Error(`Línea ${String(numero)} del corpus no tiene un «texto» de tipo string.`);
    }

    if (texto.trim().length === 0) {
      vacias += 1;
      continue;
    }
    if (vistos.has(idTexto)) {
      repetidos.push(idTexto);
      continue;
    }

    vistos.add(idTexto);
    filas.push({ id: idTexto, texto });
  }

  return { filas, vacias, repetidos };
}

/** Parte una lista en tandas de `tamano`. El embebedor cobra por viaje, no por texto. */
export function enTandas<T>(filas: readonly T[], tamano: number): T[][] {
  if (!Number.isInteger(tamano) || tamano <= 0) {
    throw new Error(`El tamaño de tanda tiene que ser un entero positivo, y llegó ${String(tamano)}.`);
  }
  const tandas: T[][] = [];
  for (let i = 0; i < filas.length; i += tamano) {
    tandas.push(filas.slice(i, i + tamano));
  }
  return tandas;
}
