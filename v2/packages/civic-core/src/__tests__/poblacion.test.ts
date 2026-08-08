import { describe, expect, it } from 'vitest';

import { planTerritorialCoverage } from '../coverage.js';
import { PROVINCIAS_REF, areaCeldaKm2, habitantesDeCelda } from '../poblacion.js';

/** Una celda real, sacada de un plan sobre un recuadro chico de CABA. */
const celda = () => {
  const plan = planTerritorialCoverage(
    { points: [
      { lat: -34.62, lng: -58.45 },
      { lat: -34.58, lng: -58.45 },
      { lat: -34.58, lng: -58.37 },
      { lat: -34.62, lng: -58.37 },
    ] },
    { cellCount: 16 },
  );
  const primera = plan.cells[0];
  if (!primera) throw new Error('el plan debería tener celdas');
  return primera;
};

describe('PROVINCIAS_REF', () => {
  it('tiene las 24 jurisdicciones', () => {
    expect(Object.keys(PROVINCIAS_REF)).toHaveLength(24);
  });

  it('usa el nombre canónico de CABA, el mismo que devuelve la API', () => {
    expect(PROVINCIAS_REF['Ciudad Autónoma de Buenos Aires']).toBeDefined();
  });

  it('ninguna provincia tiene población ni superficie en cero', () => {
    for (const [nombre, ref] of Object.entries(PROVINCIAS_REF)) {
      expect(ref.pob, nombre).toBeGreaterThan(0);
      expect(ref.km2, nombre).toBeGreaterThan(0);
    }
  });
});

describe('areaCeldaKm2', () => {
  it('una celda de un plan tiene área positiva y chica', () => {
    const a = areaCeldaKm2(celda());
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(100);
  });
});

describe('habitantesDeCelda', () => {
  it('sin provincia no hay denominador: devuelve null, no cero', () => {
    expect(habitantesDeCelda(celda(), null)).toBeNull();
  });

  it('una provincia que no está en la tabla tampoco inventa un número', () => {
    expect(habitantesDeCelda(celda(), 'Provincia Inventada')).toBeNull();
  });

  it('la misma celda da muchos más habitantes en CABA que en Santa Cruz', () => {
    const caba = habitantesDeCelda(celda(), 'Ciudad Autónoma de Buenos Aires');
    const santaCruz = habitantesDeCelda(celda(), 'Santa Cruz');
    expect(caba).not.toBeNull();
    expect(santaCruz).not.toBeNull();
    if (caba === null || santaCruz === null) return;
    // El contraste entre provincias es el que este método SÍ representa bien.
    expect(caba).toBeGreaterThan(santaCruz * 1000);
  });

  it('es densidad por área: a igual provincia, más área son más habitantes', () => {
    const chica = celda();
    // Un plan de 4 celdas sobre el mismo recuadro da celdas más grandes que uno de 16.
    const planGrueso = planTerritorialCoverage(
      { points: [
        { lat: -34.62, lng: -58.45 },
        { lat: -34.58, lng: -58.45 },
        { lat: -34.58, lng: -58.37 },
        { lat: -34.62, lng: -58.37 },
      ] },
      { cellCount: 4 },
    );
    const grande = planGrueso.cells[0];
    if (!grande) throw new Error('el plan grueso debería tener celdas');

    expect(areaCeldaKm2(grande)).toBeGreaterThan(areaCeldaKm2(chica));

    const hChica = habitantesDeCelda(chica, 'Córdoba');
    const hGrande = habitantesDeCelda(grande, 'Córdoba');
    if (hChica === null || hGrande === null) throw new Error('Córdoba está en la tabla');
    expect(hGrande).toBeGreaterThan(hChica);
  });
});
