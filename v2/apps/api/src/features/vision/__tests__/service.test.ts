import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { armarVision, TOPE_RECIEN } from '../service.js';

import type { CampanaDeVision, ConteoPorRegion, DatosDeVision } from '@v2/db';
import type { ContratoCampana } from '@v2/shared';

const contrato = {
  titulo: 'Mi Argentina ideal',
  fechaDevolucion: '2027-03-15',
  fases: [
    { nombre: 'Recibe aportes', salida: 'Se reciben aportes.', fecha: '2027-02-28' },
    { nombre: 'Lectura', salida: 'Se leen.', fecha: '2027-03-14' },
  ],
} as unknown as ContratoCampana;
const campana: CampanaDeVision = { id: 'c1', slug: 'mi-argentina-ideal', edicion: 1, contrato };

const provincias = PROVINCIAS_CANONICAS.map((p, i) => ({
  id: i + 1,
  nombre: p.name,
  iso: p.isoCode,
}));
const idDe = (iso: string) => provincias.find((p) => p.iso === iso)?.id ?? 0;
const temas = [
  { clave: 'salud', etiqueta: 'Salud' },
  { clave: 'vivienda', etiqueta: 'Vivienda' },
];

function datos(over: Partial<DatosDeVision> = {}): DatosDeVision {
  return {
    aportes: [],
    conteos: [],
    duelos: [],
    personas: [],
    provincias,
    temas,
    propia: { regionDeOpinion: null, isoDeAporte: null, tuyo: null, opiniones: [] },
    ...over,
  };
}
const aporte = (id: string, tema: string | null = 'salud') => ({
  id,
  texto: `Aporte ${id}`,
  provincia: 'Salta',
  tema,
  publicadaEn: '2026-10-01T00:00:00.000Z',
});
const conteo = (
  id: string,
  region: string | null,
  opiniones: number,
  acuerdos: number,
  pasos = 0,
): ConteoPorRegion => ({ id, region, opiniones, acuerdos, pasos });

const AHORA = new Date('2026-10-20T12:00:00.000Z');

describe('armarVision', () => {
  it('con la base en cero dice cero en todo y trae las 24 provincias y los temas', () => {
    const v = armarVision(campana, datos(), AHORA);
    expect(v.cifras).toEqual({ personas: 0, opiniones: 0, provincias: 0 });
    expect(v.enDiscusion).toBe(0);
    expect(v.une).toEqual([]);
    expect(v.provincias).toHaveLength(24);
    expect(v.provincias.every((p) => p.nivel === 0 && p.personas === null)).toBe(true);
    expect(v.regiones.map((r) => r.region)).toEqual([
      'NOA',
      'NEA',
      'Cuyo',
      'Centro',
      'Buenos Aires',
      'Patagonia',
    ]);
    expect(v.temas).toEqual([
      { clave: 'salud', etiqueta: 'Salud', aporte: null },
      { clave: 'vivienda', etiqueta: 'Vivienda', aporte: null },
    ]);
    expect(v.campana).toEqual({
      id: 'c1',
      slug: 'mi-argentina-ideal',
      titulo: 'Mi Argentina ideal',
      edicion: 1,
      recibeHasta: '2027-02-28',
      devolucion: '2027-03-15',
    });
    expect(v.tuyo).toBeNull();
    expect(v.miRegion).toBeNull();
    expect(v.calculadaEn).toBe(AHORA.toISOString());
  });

  it('suprime a las provincias y regiones con menos de cinco personas, y les da luz 1 fija', () => {
    const v = armarVision(
      campana,
      datos({
        personas: [
          { provinciaId: idDe('AR-A'), personas: 3 },
          { provinciaId: idDe('AR-Y'), personas: 4 },
          { provinciaId: idDe('AR-B'), personas: 40 },
          { provinciaId: null, personas: 2 },
        ],
      }),
      AHORA,
    );
    const salta = v.provincias.find((p) => p.iso === 'AR-A');
    const bsas = v.provincias.find((p) => p.iso === 'AR-B');
    expect(salta).toMatchObject({ personas: null, nivel: 1, region: 'NOA' });
    expect(bsas?.personas).toBe(40);
    expect(bsas?.nivel).toBeGreaterThanOrEqual(1);
    // 3 + 4 en el NOA ya son 7: la región sí se muestra.
    expect(v.regiones.find((r) => r.region === 'NOA')?.personas).toBe(7);
    expect(v.regiones.find((r) => r.region === 'Cuyo')?.personas).toBeNull();
    expect(v.cifras).toEqual({ personas: 49, opiniones: 0, provincias: 3 });
  });

  it('aplica la regla federal y deja los pasos fuera del denominador', () => {
    const v = armarVision(
      campana,
      datos({
        aportes: [aporte('une'), aporte('parte', 'vivienda')],
        conteos: [
          conteo('une', 'NOA', 10, 8, 30),
          conteo('une', 'Buenos Aires', 10, 9),
          conteo('une', null, 2, 1),
          conteo('parte', 'NOA', 10, 6),
          conteo('parte', 'Buenos Aires', 10, 10),
        ],
      }),
      AHORA,
    );
    expect(v.une.map((a) => a.id)).toEqual(['une']);
    const une = v.une[0];
    expect(une?.opiniones).toBe(22);
    expect(une?.pasos).toBe(30);
    expect(une?.acuerdo).toBeCloseTo(18 / 22);
    expect(une?.peor).toBeCloseTo(0.8);
    expect(une?.tema).toEqual({ clave: 'salud', etiqueta: 'Salud' });
    expect(v.divide.map((a) => a.id)).toEqual(['parte']);
    expect(v.temas.find((t) => t.clave === 'salud')?.aporte?.id).toBe('une');
    expect(v.temas.find((t) => t.clave === 'vivienda')?.aporte).toBeNull();
    expect(v.cifras.opiniones).toBe(42);
    expect(v.enDiscusion).toBe(2);
    expect(v.regiones.find((r) => r.region === 'NOA')?.cuentaEn).toBe(2);
  });

  it('un aporte que todavía no entra en la visión no muestra porcentajes', () => {
    const v = armarVision(
      campana,
      datos({
        aportes: [aporte('nuevo')],
        conteos: [conteo('nuevo', 'NOA', 12, 3)],
      }),
      AHORA,
    );
    expect(v.recien).toHaveLength(1);
    expect(v.recien[0]).toMatchObject({ id: 'nuevo', opiniones: 12, acuerdo: 0, peor: null });
    expect(v.recien[0]?.regiones.every((r) => r.acuerdo === null)).toBe(true);
    expect(v.recien[0]?.regiones.find((r) => r.region === 'NOA')?.cuenta).toBe(true);
  });

  it('«Lo que recién llega» tiene tope', () => {
    const muchos = Array.from({ length: TOPE_RECIEN + 5 }, (_, i) => aporte(`a${String(i)}`));
    expect(armarVision(campana, datos({ aportes: muchos }), AHORA).recien).toHaveLength(
      TOPE_RECIEN,
    );
  });

  it('pone la opinión propia, lo tuyo y la región de quien mira', () => {
    const tuyo = {
      provincia: 'Mendoza',
      tema: null,
      id: 'mio',
      texto: 'Lo mío',
      opiniones: 3,
      acuerdos: 2,
      pasos: 1,
    };
    const v = armarVision(
      campana,
      datos({
        aportes: [aporte('nuevo')],
        propia: {
          regionDeOpinion: null,
          isoDeAporte: 'AR-M',
          tuyo,
          opiniones: [{ id: 'nuevo', valor: 'acuerdo' }],
        },
      }),
      AHORA,
    );
    expect(v.recien[0]?.miOpinion).toBe('acuerdo');
    expect(v.tuyo).toEqual(tuyo);
    expect(v.miRegion).toBe('Cuyo');
    const conOpinion = armarVision(
      campana,
      datos({
        propia: { regionDeOpinion: 'NOA', isoDeAporte: 'AR-M', tuyo: null, opiniones: [] },
      }),
      AHORA,
    );
    expect(conOpinion.miRegion).toBe('NOA');
  });

  it('«Lo que va primero» trae comparaciones y el puntaje suavizado', () => {
    const v = armarVision(
      campana,
      datos({
        aportes: [aporte('a')],
        conteos: [conteo('a', 'NOA', 20, 18), conteo('a', 'NEA', 20, 18)],
        duelos: [{ id: 'a', comparaciones: 10, primero: 8 }],
      }),
      AHORA,
    );
    expect(v.primero).toHaveLength(1);
    expect(v.primero[0]?.comparaciones).toBe(10);
    expect(v.primero[0]?.puntaje).toBeCloseTo(9 / 12);
  });
});
