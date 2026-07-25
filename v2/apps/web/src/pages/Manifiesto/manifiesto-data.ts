// MDX crudo vía `?raw` (mismo mecanismo que usaba la página v1-port).
import manifiestoRaw from '../../../../../content/manifiesto/manifiesto.mdx?raw';

import { stripFrontmatter } from '~/lib/markdown';

/**
 * El manifiesto (spec 3.3) — el texto se parte por SUS costuras: el `# ` se
 * iza a H1 de página y cada `## ` es una parte con ancla propia. Nada se
 * reescribe: `apertura` + las `fuente` de las partes reconstruyen el cuerpo
 * carácter por carácter, y el test lo prueba por igualdad de strings.
 */
export interface ParteManifiesto {
  /** Número declarado por el propio texto («## 3. …» → 3). `null` si no numera. */
  numero: number | null;
  /** El encabezado TAL CUAL, sin renumerar ni retitular. */
  encabezado: string;
  /** La parte sin su línea de encabezado — lo que se pasa a MdxPapel. */
  cuerpo: string;
  /** Trozo crudo, encabezado incluido: la garantía de verbatim. */
  fuente: string;
  /** Ancla estable del sumario: «parte-3» (o «parte-p3» si el texto no numera). */
  id: string;
}

export interface ManifiestoParseado {
  titulo: string;
  apertura: string;
  partes: readonly ParteManifiesto[];
}

export function parsearManifiesto(raw: string): ManifiestoParseado {
  const cuerpo = stripFrontmatter(raw);
  const h1 = /^# (.+)\n?/.exec(cuerpo);
  const titulo = (h1?.[1] ?? '').trim();
  const resto = h1 ? cuerpo.slice(h1[0].length) : cuerpo;

  const encabezados = [...resto.matchAll(/^## (.+)$/gm)];
  const primero = encabezados[0];
  if (!primero) return { titulo, apertura: resto, partes: [] };

  const partes = encabezados.map((m, i) => {
    const desde = m.index;
    const hasta = encabezados[i + 1]?.index ?? resto.length;
    const fuente = resto.slice(desde, hasta);
    const encabezado = (m[1] ?? '').trim();
    const numerado = /^(\d+)\./.exec(encabezado);
    const numero = numerado?.[1] === undefined ? null : Number(numerado[1]);
    return {
      numero,
      encabezado,
      cuerpo: fuente.slice(m[0].length),
      fuente,
      id: numero === null ? `parte-p${String(i + 1)}` : `parte-${String(numero)}`,
    };
  });

  return { titulo, apertura: resto.slice(0, primero.index), partes };
}

export const MANIFIESTO: ManifiestoParseado = parsearManifiesto(manifiestoRaw);
export const PARTE_COUNT = MANIFIESTO.partes.length;

/**
 * Fecha larga es-AR para el folio impreso. Duplicada a propósito (existe
 * otra igual en `pages/Biblioteca/biblioteca-data`): importarla de ahí
 * arrastraría los 21 ensayos al chunk de esta página.
 */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
