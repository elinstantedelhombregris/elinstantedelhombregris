import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { fusionar, leerDeudas } from '../leer-deudas';

const RUTA_REAL = new URL('../../../../docs/DEUDAS.md', import.meta.url).pathname;

/**
 * El parser de `docs/DEUDAS.md` (`docs/specs/2026-08-12-lo-que-falta.md` §2.7).
 *
 * Se prueba contra cadenas mínimas Y contra el archivo real, porque el archivo
 * real es el único que tiene la plantilla `D-0NN` de la sección «Cómo se usa»,
 * la tabla del índice, y las dos formas distintas de escribir «resuelta». Los
 * tres rompen un parser ingenuo, y ninguno se le ocurre a nadie en abstracto.
 */
describe('leerDeudas', () => {
  it('lee id, título, severidad y estado de una entrada', () => {
    const [deuda] = leerDeudas(`
### D-007 · Dos majors de \`@types/react\` conviven por parche de pnpm

**Dónde:** \`v2/package.json\`
**Encontrada:** 2026-08-01, mirando el lockfile
**Severidad:** media
**Estado:** abierta

El parche fija la versión exacta.
`);

    expect(deuda?.idPublico).toBe('D-007');
    expect(deuda?.titulo).toBe('Dos majors de `@types/react` conviven por parche de pnpm');
    expect(deuda?.severidad).toBe('media');
    expect(deuda?.resuelta).toBe(false);
    expect(deuda?.cuerpo).toContain('El parche fija la versión exacta.');
  });

  it('reconoce las dos formas de decir resuelta que el archivo usa', () => {
    const tachada = leerDeudas(
      '### D-001 · Algo\n\n**Severidad:** alta\n**Estado:** ~~abierta~~ → **resuelta 2026-08-01**, ver [Resueltas](#resueltas)\n',
    );
    expect(tachada[0]?.resuelta).toBe(true);

    const directa = leerDeudas('### D-002 · Otra\n\n**Estado:** resuelta\n');
    expect(directa[0]?.resuelta).toBe(true);

    const abierta = leerDeudas('### D-003 · Otra más\n\n**Estado:** abierta\n');
    expect(abierta[0]?.resuelta).toBe(false);
  });

  /**
   * Las dos formas del archivo que contienen la palabra «resuelta» y son
   * deudas ABIERTAS. Se prueban con el texto literal de D-029 y D-014 porque
   * un parser que busca la palabra suelta las da por cerradas — y ése es el
   * error en la peor dirección: el registro público diría que algo está hecho
   * cuando no lo está.
   */
  it('no da por resuelta una que dice explícitamente que no lo está (D-029)', () => {
    const [deuda] = leerDeudas(
      '### D-029 · Algo\n\n**Severidad:** alta\n**Estado:** abierta (rodeada por el bundle del ADR 0008 D7, no resuelta)\n',
    );
    expect(deuda?.resuelta).toBe(false);
  });

  it('«parcialmente resuelta» es abierta: a medio arreglar todavía le falta a alguien (D-014)', () => {
    const [deuda] = leerDeudas(
      '### D-014 · Algo\n\n**Severidad:** alta\n**Estado:** **parcialmente resuelta 2026-08-02** — las fugas conocidas están tapadas; la causa de fondo sigue\n',
    );
    expect(deuda?.resuelta).toBe(false);
  });

  it('la tercera forma: el campo se llama «Encontrada y resuelta» (D-012)', () => {
    const [deuda] = leerDeudas(
      '### D-012 · Algo\n\n**Encontrada y resuelta:** 2026-08-01, verificando el arreglo de D-001\n**Dónde:** `x.geojson`\n',
    );
    expect(deuda?.resuelta).toBe(true);
  });

  it('«RESUELTA» en mayúsculas con la explicación pegada también cuenta (D-025)', () => {
    const [deuda] = leerDeudas(
      '### D-025 · Algo\n\n**Severidad:** baja\n**Estado:** RESUELTA 2026-08-04 — de rebote, al sacar la dependencia\n',
    );
    expect(deuda?.resuelta).toBe(true);
  });

  it('la quinta forma: un campo «Cómo se arregló», sin línea de estado (D-016)', () => {
    const [deuda] = leerDeudas(
      '### D-016 · Algo\n\n**Encontrada:** 2026-08-03\n**Cómo se arregló (2026-08-03):** la segunda pasó a D-019\n',
    );
    expect(deuda?.resuelta).toBe(true);
  });

  it('«Por qué no se arregla acá» NO cierra nada — es la coartada de una abierta (D-032)', () => {
    const [deuda] = leerDeudas(
      '### D-032 · Algo\n\n**Severidad:** media\n**Estado:** abierta\n\n**Por qué no se arregla acá:** mezcla dos causas de cambio.\n**Qué haría falta:** reescribir las cuatro glosas.\n',
    );
    expect(deuda?.resuelta).toBe(false);
  });

  /**
   * El presente contra el pasado. «Cómo se arregla» es la receta para
   * arreglarla; «Cómo se arregló» es el acta de que se arregló. Un metro que
   * no los distinga cierra deudas abiertas leyendo su propia solución.
   */
  it('«Cómo se arregla» en presente no cierra nada, y el Estado manda sobre él (D-028)', () => {
    const [deuda] = leerDeudas(
      '### D-028 · Algo\n\n**Severidad:** media\n**Estado:** abierta\n**Cómo se arregla:** la tarea de cabecera va antes que la de contenido.\n',
    );
    expect(deuda?.resuelta).toBe(false);
  });

  it('un «Cómo se arregló» en pasado sí cierra, pero pierde contra un Estado abierta', () => {
    expect(
      leerDeudas('### D-040 · Algo\n\n**Cómo se arregló:** se hizo así\n')[0]?.resuelta,
    ).toBe(true);
    expect(
      leerDeudas('### D-041 · Algo\n\n**Estado:** abierta\n**Cómo se arregló:** parte de esto\n')[0]
        ?.resuelta,
    ).toBe(false);
  });

  it('lee la severidad aunque la línea siga con una explicación', () => {
    const [deuda] = leerDeudas(
      '### D-032 · Algo\n\n**Severidad:** media — no rompe ninguna guardia ni ningún build\n**Estado:** abierta\n',
    );
    expect(deuda?.severidad).toBe('media');
  });

  it('devuelve severidad nula cuando la entrada no la declara', () => {
    const [deuda] = leerDeudas('### D-004 · Algo\n\n**Estado:** abierta\n');
    expect(deuda?.severidad).toBeNull();
  });

  it('descarta la plantilla D-0NN de «Cómo se usa»', () => {
    const deudas = leerDeudas(
      '### D-0NN · Título en una línea\n\n**Estado:** abierta\n\n### D-005 · Real\n\n**Estado:** abierta\n',
    );
    expect(deudas.map((d) => d.idPublico)).toEqual(['D-005']);
  });

  it('una cabecera de sección corta la entrada anterior', () => {
    const deudas = leerDeudas(
      '### D-006 · Una\n\nsu prosa\n\n## Resueltas\n\ntexto que no es de nadie\n',
    );
    expect(deudas).toHaveLength(1);
    expect(deudas[0]?.cuerpo).not.toContain('texto que no es de nadie');
  });

  it('no lee nada de un archivo sin entradas', () => {
    expect(leerDeudas('# Deudas\n\nSin entradas todavía.\n')).toEqual([]);
  });
});

describe('fusionar', () => {
  /**
   * Éste es el caso que se rompió de verdad. La sección «Resueltas» del
   * archivo repite la deuda con `**Resuelta:**` y `**Cómo:**` y **sin**
   * `**Severidad:**` ni `**Estado:**`. Un «gana la última» devolvía las cuatro
   * deudas resueltas del archivo como abiertas y sin severidad.
   */
  it('fusiona la entrada del cuerpo con su copia de «Resueltas» sin perder ninguna de las dos', () => {
    const deudas = leerDeudas(
      [
        '### D-009 · Una',
        '',
        '**Severidad:** alta',
        '**Estado:** ~~abierta~~ → **resuelta 2026-08-01**',
        '',
        'lo que estaba roto',
        '',
        '## Resueltas',
        '',
        '### D-009 · Una',
        '',
        '**Resuelta:** 2026-08-01',
        '**Cómo:** se arregló así',
        '',
        'el relato del arreglo',
        '',
      ].join('\n'),
    );
    expect(deudas).toHaveLength(2);

    const [unica] = fusionar(deudas);
    expect(unica?.resuelta).toBe(true);
    expect(unica?.severidad).toBe('alta');
    expect(unica?.cuerpo).toContain('lo que estaba roto');
    expect(unica?.cuerpo).toContain('el relato del arreglo');
  });

  it('la copia de «Resueltas» sola ya cuenta como resuelta, sin línea de estado', () => {
    const [deuda] = leerDeudas('### D-010 · Otra\n\n**Resuelta:** 2026-08-02\n**Cómo:** se borró\n');
    expect(deuda?.resuelta).toBe(true);
  });

  it('no toca las que aparecen una sola vez', () => {
    const unicas = fusionar(leerDeudas('### D-011 · Sola\n\n**Severidad:** baja\n**Estado:** abierta\n'));
    expect(unicas).toHaveLength(1);
    expect(unicas[0]?.resuelta).toBe(false);
    expect(unicas[0]?.severidad).toBe('baja');
  });
});

describe('contra el docs/DEUDAS.md real', () => {
  const deudas = fusionar(leerDeudas(readFileSync(RUTA_REAL, 'utf8')));

  it('lee todas las entradas y ninguna es la plantilla', () => {
    expect(deudas.length).toBeGreaterThanOrEqual(30);
    expect(deudas.map((d) => d.idPublico)).not.toContain('D-0NN');
  });

  it('todos los ids son únicos y tienen la forma D-0NN', () => {
    const ids = deudas.map((d) => d.idPublico);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^D-\d{3,6}$/);
  });

  it('ninguna entrada queda sin título ni sin cuerpo', () => {
    for (const deuda of deudas) {
      expect(deuda.titulo.length, deuda.idPublico).toBeGreaterThan(0);
      expect(deuda.cuerpo.length, deuda.idPublico).toBeGreaterThan(0);
    }
  });

  it('hay resueltas y hay abiertas — si no, el parser está leyendo el estado mal', () => {
    expect(deudas.filter((d) => d.resuelta).length).toBeGreaterThan(0);
    expect(deudas.filter((d) => !d.resuelta).length).toBeGreaterThan(0);
  });

  it('D-003 sigue abierta y es la de los CDN de terceros', () => {
    const d003 = deudas.find((d) => d.idPublico === 'D-003');
    expect(d003?.resuelta).toBe(false);
    expect(d003?.titulo).toContain('CDN de terceros');
  });

  /**
   * Las cuatro que el archivo real escribe de forma distinta, ancladas contra
   * el archivo real y no contra una cadena de laboratorio. Si alguien reescribe
   * una de estas entradas y le cambia la forma, este test lo dice.
   */
  it('clasifica bien las cuatro formas raras del archivo real', () => {
    const estado = (id: string) => deudas.find((d) => d.idPublico === id)?.resuelta;
    expect(estado('D-001'), 'tachada → resuelta').toBe(true);
    expect(estado('D-012'), 'campo «Encontrada y resuelta»').toBe(true);
    expect(estado('D-014'), 'parcialmente resuelta = abierta').toBe(false);
    expect(estado('D-029'), 'abierta (…, no resuelta)').toBe(false);
  });

  it('las resueltas del archivo son exactamente estas ocho', () => {
    expect(
      deudas
        .filter((d) => d.resuelta)
        .map((d) => d.idPublico)
        .sort(),
    ).toEqual(['D-001', 'D-002', 'D-009', 'D-012', 'D-016', 'D-019', 'D-020', 'D-025']);
  });
});
