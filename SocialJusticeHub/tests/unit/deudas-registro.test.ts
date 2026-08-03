import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guardia del registro de deudas (`docs/DEUDAS.md`).
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────────
 * La pide D-016, y la pide con la causa escrita: **el archivo no está ordenado
 * por id.** Las entradas viven en dos zonas —el cuerpo y un bloque posterior— y
 * los ids se intercalan, así que mirar el final para averiguar el último id
 * usado da una respuesta equivocada. Pasó dos veces seguidas: al registrar D-015
 * se leyó «D-013» al final, se asumió que D-014 estaba libre y ya existía; y el
 * id D-013 terminó asignado a dos deficiencias sin relación, de dos sesiones que
 * no se conocían.
 *
 * Las dos veces lo encontró una persona leyendo el índice, no un procedimiento.
 * Por eso la guardia no verifica el orden —el archivo se lee por temas y
 * ordenarlo sería otra decisión— sino lo único que importa: **que un id no
 * signifique dos cosas, y que el índice y el cuerpo digan lo mismo.**
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..', '..');
const DEUDAS = resolve(REPO, 'docs/DEUDAS.md');

const texto = readFileSync(DEUDAS, 'utf8');
const lineas = texto.split('\n');

/** `### D-013 · V-FIN-05 suma el piso…` → el id y la línea donde vive. */
function encabezados(): { id: string; linea: number; titulo: string }[] {
  const out: { id: string; linea: number; titulo: string }[] = [];
  lineas.forEach((l, i) => {
    const m = /^###\s+(D-\d{3})\s*·\s*(.+)$/.exec(l);
    if (m) out.push({ id: m[1]!, linea: i + 1, titulo: m[2]!.trim() });
  });
  return out;
}

/** `| [D-013](#…) | título | Media | Abierta |` → el id de cada fila del índice. */
function filasDelIndice(): { id: string; linea: number }[] {
  const out: { id: string; linea: number }[] = [];
  lineas.forEach((l, i) => {
    const m = /^\|\s*\[(D-\d{3})\]\(#/.exec(l);
    if (m) out.push({ id: m[1]!, linea: i + 1 });
  });
  return out;
}

describe('registro de deudas (docs/DEUDAS.md)', () => {
  it('el archivo tiene entradas: si no, la guardia no está midiendo nada', () => {
    // Sin esto, un `grep` que deja de matchear —porque cambió el formato del
    // encabezado— convierte a todos los tests de abajo en verdes vacíos.
    expect(encabezados().length).toBeGreaterThan(10);
    expect(filasDelIndice().length).toBeGreaterThan(10);
  });

  /**
   * **Un id repetido no es por sí mismo un error, y confundirlo costaría caro.**
   * El archivo tiene la convención de darle a una deuda resuelta un segundo
   * encabezado con el MISMO id y el MISMO título —la entrada original arriba, el
   * registro de cómo se cerró más abajo—, y así están escritas D-001, D-002 y
   * D-009. Prohibir la repetición a secas rompería esa convención y empujaría a
   * borrar el historial de resolución, que es justamente lo que el registro dice
   * que no se hace: «las resueltas se marcan resueltas, no se borran».
   *
   * Lo que sí es un error es lo que D-016 describe: **un id asignado a dos
   * deficiencias distintas.** Se detecta por el título, no por el conteo.
   */
  it('ningún id nombra dos deficiencias distintas', () => {
    const porId = new Map<string, { titulo: string; linea: number }[]>();
    for (const e of encabezados()) {
      porId.set(e.id, [...(porId.get(e.id) ?? []), { titulo: e.titulo, linea: e.linea }]);
    }
    const colisiones: string[] = [];
    for (const [id, entradas] of porId) {
      const titulos = new Set(entradas.map((x) => x.titulo));
      if (titulos.size > 1) {
        colisiones.push(
          `${id} nombra ${String(titulos.size)} deficiencias distintas: ` +
            entradas.map((x) => `línea ${String(x.linea)} «${x.titulo}»`).join(' / '),
        );
      }
    }
    expect(colisiones).toEqual([]);
  });

  it('ningún id se usa dos veces en el índice', () => {
    const ids = filasDelIndice().map((f) => f.id);
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(repetidos)]).toEqual([]);
  });

  it('cada entrada del cuerpo tiene su fila en el índice', () => {
    const enElIndice = new Set(filasDelIndice().map((f) => f.id));
    const huerfanas = encabezados()
      .filter((e) => !enElIndice.has(e.id))
      .map((e) => `${e.id} (línea ${String(e.linea)}): «${e.titulo}»`);
    expect(huerfanas).toEqual([]);
  });

  it('cada fila del índice tiene su entrada en el cuerpo', () => {
    const enElCuerpo = new Set(encabezados().map((e) => e.id));
    const fantasmas = filasDelIndice()
      .filter((f) => !enElCuerpo.has(f.id))
      .map((f) => `${f.id} (línea ${String(f.linea)}): el índice la nombra y no existe`);
    expect(fantasmas).toEqual([]);
  });

  /**
   * El id siguiente tiene que ser el máximo + 1, y la guardia lo dice en el
   * mensaje: es la pregunta que las dos sesiones contestaron mal mirando el
   * final del archivo. Que no haya huecos NO se exige —una deuda puede
   * retirarse— pero el máximo sí se publica acá para que esté a mano.
   */
  it('publica cuál es el próximo id libre', () => {
    const nums = encabezados().map((e) => Number(e.id.slice(2)));
    const max = Math.max(...nums);
    const proximo = `D-${String(max + 1).padStart(3, '0')}`;
    expect(nums.length, `el próximo id libre es ${proximo}`).toBeGreaterThan(0);
    expect(proximo).toMatch(/^D-\d{3}$/);
  });
});
