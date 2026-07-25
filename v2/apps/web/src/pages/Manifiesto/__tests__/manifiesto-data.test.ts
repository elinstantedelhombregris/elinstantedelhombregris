import { describe, expect, it } from 'vitest';

import manifiestoRaw from '../../../../../../content/manifiesto/manifiesto.mdx?raw';
import { MANIFIESTO, PARTE_COUNT, fechaLarga, parsearManifiesto } from '../manifiesto-data';

import { stripFrontmatter } from '~/lib/markdown';

/**
 * manifiesto-data.test.ts — cero literales de contenido salvo los del propio
 * documento cuando son la aserción: el título esperado se recomputa desde el
 * `?raw` con la misma `stripFrontmatter`, nunca se copia a mano.
 */

describe('verbatim: apertura + fuentes reconstruyen el cuerpo por igualdad de strings', () => {
  it("MANIFIESTO.apertura + partes.map(fuente).join('') === cuerpo sin frontmatter y sin la línea del título", () => {
    const cuerpo = stripFrontmatter(manifiestoRaw);
    const h1 = /^# (.+)\n?/.exec(cuerpo);
    const resto = h1 ? cuerpo.slice(h1[0].length) : cuerpo;

    const reconstruido = MANIFIESTO.apertura + MANIFIESTO.partes.map((p) => p.fuente).join('');
    expect(reconstruido).toBe(resto);
  });
});

describe('título izado', () => {
  it('MANIFIESTO.titulo no está vacío', () => {
    expect(MANIFIESTO.titulo.length).toBeGreaterThan(0);
  });

  it('no aparece un "# " (H1) en la apertura', () => {
    expect(MANIFIESTO.apertura).not.toMatch(/^# /m);
  });

  it('no aparece un "# " (H1) en ninguna fuente de parte', () => {
    for (const parte of MANIFIESTO.partes) {
      expect(parte.fuente).not.toMatch(/^# /m);
    }
  });
});

describe('partes', () => {
  it('PARTE_COUNT coincide con partes.length y es mayor que 0', () => {
    expect(PARTE_COUNT).toBe(MANIFIESTO.partes.length);
    expect(PARTE_COUNT).toBeGreaterThan(0);
  });

  it('cada fuente empieza con "## "', () => {
    for (const parte of MANIFIESTO.partes) {
      expect(parte.fuente.startsWith('## ')).toBe(true);
    }
  });

  it('ningún cuerpo contiene su propio encabezado', () => {
    for (const parte of MANIFIESTO.partes) {
      expect(parte.cuerpo).not.toContain(`## ${parte.encabezado}`);
    }
  });

  it('los numero son estrictamente crecientes', () => {
    const numeros = MANIFIESTO.partes.map((p) => p.numero).filter((n): n is number => n !== null);
    let previo: number | null = null;
    for (const numero of numeros) {
      if (previo !== null) {
        expect(numero).toBeGreaterThan(previo);
      }
      previo = numero;
    }
  });

  it('los id son únicos', () => {
    const ids = MANIFIESTO.partes.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ids', () => {
  it('para una parte numerada, id === "parte-" + numero', () => {
    for (const parte of MANIFIESTO.partes) {
      if (parte.numero !== null) {
        expect(parte.id).toBe(`parte-${String(parte.numero)}`);
      }
    }
  });
});

describe('degradación: parsearManifiesto sobre strings sintéticos', () => {
  it('sin "## ": partes vacío, apertura con la prosa entera, titulo del H1', () => {
    const resultado = parsearManifiesto('# T\n\nsolo prosa\n');
    expect(resultado.partes).toEqual([]);
    expect(resultado.titulo).toBe('T');
    expect(resultado.apertura).toContain('solo prosa');
  });

  it('sin "# ": titulo vacío y toda la prosa en apertura', () => {
    const resultado = parsearManifiesto('solo prosa sin titulo\n');
    expect(resultado.titulo).toBe('');
    expect(resultado.partes).toEqual([]);
    expect(resultado.apertura).toContain('solo prosa sin titulo');
  });

  it('un "## Sin número" da numero null e id "parte-p1"', () => {
    const resultado = parsearManifiesto('# T\n\n## Sin número\ncontenido\n');
    expect(resultado.partes).toHaveLength(1);
    expect(resultado.partes[0]?.numero).toBeNull();
    expect(resultado.partes[0]?.id).toBe('parte-p1');
  });
});

describe('fechaLarga', () => {
  it('formatea un ISO válido con el mismo Intl que el runner', () => {
    const iso = '2026-02-02T00:00:00Z';
    const esperado = new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    expect(fechaLarga(iso)).toBe(esperado);
  });

  it('un ISO inválido da cadena vacía', () => {
    expect(fechaLarga('no-es-una-fecha')).toBe('');
  });
});
