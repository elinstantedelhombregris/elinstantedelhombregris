import { armarPais } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { estadoMedidoDesde, territoriosDesde } from '../simulacion/datos';

import type { SenalConTipo } from '../useVistaMapa';
import type { ProvinciaApi } from '~/lib/queries/open-data';

/**
 * El puente entre lo que la web tiene y lo que el motor necesita.
 *
 * El id de territorio es el NOMBRE canónico de la provincia, no su id
 * numérico. No es capricho: el coroplético recorre las features del GeoJSON y
 * las indexa por nombre, así que usando el nombre el resultado del motor entra
 * directo en el mapa sin una tabla de traducción más. Una traducción menos es
 * un lugar menos donde CABA se vuelva a llamar distinto (D-012).
 */

const PROVINCIAS: ProvinciaApi[] = [
  { id: 1, name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C' },
  { id: 2, name: 'Córdoba', isoCode: 'AR-X' },
  { id: 99, name: 'Provincia Inventada', isoCode: null },
];

const senal = (provinceId: number | null, createdAt: string): SenalConTipo => ({
  id: `voz:${String(provinceId)}-${createdAt}`,
  capa: 'voz',
  tipo: 'basta',
  tipoVoz: 'basta',
  texto: 'TEST',
  lat: null,
  lng: null,
  precision: 'province',
  role: 'subject',
  provinceId,
  cityId: null,
  createdAt,
});

describe('territoriosDesde', () => {
  it('usa el nombre canónico como id del territorio', () => {
    const t = territoriosDesde(PROVINCIAS);
    expect(t.map((x) => x.id)).toContain('Ciudad Autónoma de Buenos Aires');
  });

  it('trae población y superficie de la tabla de referencia', () => {
    const caba = territoriosDesde(PROVINCIAS).find((t) => t.nombre.startsWith('Ciudad'));
    expect(caba?.poblacion).toBe(3_121_000);
    expect(caba?.km2).toBeCloseTo(200, 0);
  });

  it('descarta las provincias sin referencia en vez de inventarles población', () => {
    // Una provincia sin población no tiene denominador. Ponerle un número
    // plausible sería exactamente la clase de invento que el motor prohíbe.
    expect(territoriosDesde(PROVINCIAS).map((t) => t.id)).not.toContain('Provincia Inventada');
    expect(territoriosDesde(PROVINCIAS)).toHaveLength(2);
  });
});

describe('estadoMedidoDesde', () => {
  const ahora = Date.parse('2026-08-02T00:00:00.000Z');

  it('mapea cada voz a su territorio por nombre', () => {
    const e = estadoMedidoDesde([senal(1, '2026-08-01T00:00:00.000Z')], PROVINCIAS, ahora);
    expect(e.voces[0]?.territorioId).toBe('Ciudad Autónoma de Buenos Aires');
  });

  it('convierte la fecha ISO a epoch', () => {
    const e = estadoMedidoDesde([senal(2, '2026-08-01T00:00:00.000Z')], PROVINCIAS, ahora);
    expect(e.voces[0]?.fecha).toBe(Date.parse('2026-08-01T00:00:00.000Z'));
  });

  it('descarta las voces sin provincia', () => {
    // Son las de D-001 que todavía no se pudieron resolver. Contarlas sin
    // territorio las metería en ningún lado y en todos a la vez.
    const e = estadoMedidoDesde([senal(null, '2026-08-01T00:00:00.000Z')], PROVINCIAS, ahora);
    expect(e.voces).toHaveLength(0);
  });

  it('descarta las voces de provincias sin referencia', () => {
    const e = estadoMedidoDesde([senal(99, '2026-08-01T00:00:00.000Z')], PROVINCIAS, ahora);
    expect(e.voces).toHaveLength(0);
  });

  it('lleva el instante que se le pasa, no el reloj', () => {
    expect(estadoMedidoDesde([], PROVINCIAS, ahora).ahora).toBe(ahora);
  });

  /**
   * El vocabulario con que entra una voz al motor.
   *
   * Entraba `s.tipoVoz`, que es el resultado de la PALETA de la web: seis tipos
   * y un `?? 'valor'` para todo lo demás. O sea que una categoría que el
   * catálogo no tiene llegaba al motor afirmando ser un `valor`, que es un tipo
   * real y que además no existe en el canon.
   */
  it('el tipo entra crudo y leído contra el canon, no pintado', () => {
    const rara = { ...senal(1, '2026-08-01T00:00:00.000Z'), tipo: 'otra_cosa', tipoVoz: 'valor' as const };
    const e = estadoMedidoDesde([rara], PROVINCIAS, ahora);
    expect(e.voces[0]?.tipo).toEqual({ reconocido: false, crudo: 'otra_cosa' });
  });

  it('y por eso dos países con voces distintas no comparten huella', () => {
    // La consecuencia que hacía cara la costumbre: plegadas contra `valor`, las
    // dos voces eran la misma para la huella, y dos países distintos se podían
    // comparar como si fueran uno.
    const con = (tipo: string) =>
      armarPais(
        estadoMedidoDesde(
          [{ ...senal(1, '2026-08-01T00:00:00.000Z'), tipo, tipoVoz: 'valor' as const }],
          PROVINCIAS,
          ahora,
        ),
        territoriosDesde(PROVINCIAS),
        'provincia',
      );

    expect(con('otra_cosa').huella).not.toBe(con('valor').huella);
  });
});
