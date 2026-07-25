/**
 * Parser de la portada ASCII de los documentos PLAN*_Argentina_ES.md.
 *
 * Extraído de extraer-fuentes-planes.ts para que se pueda importar desde un
 * test sin ejecutar el `main()` del extractor (que reescribe planes-sources.ts).
 */

export interface Portada {
  title: string;
  /** Las líneas del título evocativo sin unir, en orden — existe porque en
   * PLANSAL el título de la tabla es solo la primera línea, no el bloque entero. */
  lineasTitulo: string[];
  nombreInstitucional: string;
}

/**
 * La portada vive en el primer code fence. Sus primeras líneas son el título
 * evocativo (una o más, hasta la primera línea en blanco); la primera línea
 * posterior que arranca con «Plan Nacional» es el nombre institucional, que
 * puede continuar en la línea siguiente.
 */
export function leerPortada(raw: string): Portada {
  const lineas = raw.split('\n');
  const apertura = lineas.findIndex((l) => l.startsWith('```'));
  if (apertura === -1) return { title: '', lineasTitulo: [], nombreInstitucional: '' };

  const cierre = lineas.findIndex((l, i) => i > apertura && l.startsWith('```'));
  const portada = lineas.slice(apertura + 1, cierre === -1 ? undefined : cierre);

  const evocativo: string[] = [];
  for (const linea of portada) {
    if (linea.trim() === '') break;
    evocativo.push(linea.trim());
  }

  const iInstitucional = portada.findIndex((l) => l.trim().startsWith('Plan Nacional'));
  let institucional = '';
  if (iInstitucional !== -1) {
    institucional = portada[iInstitucional]?.trim() ?? '';
    const siguiente = portada[iInstitucional + 1]?.trim() ?? '';
    // Nombres largos que siguen en la línea de abajo (caso PLANGEO: «y Plataforma…»).
    if (siguiente !== '' && !/^PLAN[A-Z0-9]*$/.test(siguiente) && siguiente.startsWith('y ')) {
      institucional = `${institucional} ${siguiente}`;
    }
  }

  return {
    title: evocativo.join(' ').replace(/\s+/g, ' ').trim(),
    lineasTitulo: evocativo,
    nombreInstitucional: institucional,
  };
}
