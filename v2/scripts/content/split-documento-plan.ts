/**
 * Parte un documento del corpus (`Iniciativas Estratégicas/PLAN*_Argentina_ES.md`)
 * en sus tres capas. Función pura: sin I/O, para poder testearla contra los 23
 * documentos reales sin efectos.
 *
 * El corpus NO es homogéneo. Casos verificados 2026-07-25:
 *  - PLANDIG abre con la portada ASCII y tiene un `---` en la línea 32, ANTES de
 *    su cabecera de auditoría: cortar en el primer `---` parte mal el documento.
 *  - PLANRUTA abre con un H1 y su cabecera termina en la línea 13.
 *  - PLANMOV no tiene `## PREÁMBULO`; su primer H2 es «Vigésimo Tercer Mandato».
 * Por eso la cabecera se busca como «el primer bloque contiguo de líneas `>`»
 * y no por posición.
 */

export interface DocumentoPartido {
  /** Blockquote de auditoría del arranque. '' si el documento no tiene. */
  cabecera: string;
  /** El documento como se lee: portada + preámbulo + secciones. */
  cuerpo: string;
  /** Parches post-auditoría del final. '' si el documento no tiene. */
  parches: string;
}

/** Dentro de cuántas líneas del arranque se acepta la cabecera de auditoría. */
const VENTANA_CABECERA = 80;

const RE_PARCHE = /^##\s+.*(post-auditor|parche|interconexiones)/i;

function esLineaCita(linea: string): boolean {
  return linea.startsWith('>');
}

export function partirDocumentoPlan(raw: string): DocumentoPartido {
  const lineas = raw.split('\n');

  // 1) Parches: desde el primer heading de parche hasta el final.
  let inicioParches = lineas.length;
  for (let i = 0; i < lineas.length; i++) {
    if (RE_PARCHE.test(lineas[i] ?? '')) {
      inicioParches = i;
      break;
    }
  }
  const parches = lineas.slice(inicioParches).join('\n').trim();

  // 2) Cabecera: el primer bloque contiguo de líneas `>` dentro de la ventana.
  const limite = Math.min(VENTANA_CABECERA, inicioParches);
  let inicioCabecera = -1;
  for (let i = 0; i < limite; i++) {
    if (esLineaCita(lineas[i] ?? '')) {
      inicioCabecera = i;
      break;
    }
  }

  let finCabecera = -1;
  if (inicioCabecera !== -1) {
    finCabecera = inicioCabecera;
    for (let i = inicioCabecera; i < inicioParches; i++) {
      const linea = lineas[i] ?? '';
      if (esLineaCita(linea)) {
        finCabecera = i;
        continue;
      }
      // Una línea en blanco entre dos citas no corta el bloque.
      if (linea.trim() === '' && esLineaCita(lineas[i + 1] ?? '')) continue;
      break;
    }
  }

  const cabecera =
    inicioCabecera === -1 ? '' : lineas.slice(inicioCabecera, finCabecera + 1).join('\n').trim();

  // 3) Cuerpo: todo lo demás, con el hueco de la cabecera cerrado.
  const antes = inicioCabecera === -1 ? [] : lineas.slice(0, inicioCabecera);
  const despues =
    inicioCabecera === -1
      ? lineas.slice(0, inicioParches)
      : lineas.slice(finCabecera + 1, inicioParches);

  // Cerramos solo la costura donde se sacó la cabecera: recortamos líneas en
  // blanco sobrantes en cada punta y unimos con un único blanco de por medio.
  // Nunca tocamos el resto del cuerpo — un regex global sobre todo el texto
  // (como hacía antes) borra separadores `---` que son estructura real del
  // documento, no artefactos del corte.
  while (antes.length > 0 && (antes[antes.length - 1] ?? '').trim() === '') antes.pop();
  while (despues.length > 0 && (despues[0] ?? '').trim() === '') despues.shift();

  const cuerpo =
    antes.length > 0 && despues.length > 0
      ? [...antes, '', ...despues].join('\n').trim()
      : [...antes, ...despues].join('\n').trim();

  return { cabecera, cuerpo, parches };
}
