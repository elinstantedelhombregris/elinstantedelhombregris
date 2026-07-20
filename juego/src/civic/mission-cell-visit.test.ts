import { describe, expect, it } from 'vitest';

import { validateMissionCellVisit } from './mission-cell-visit';

const geometry = JSON.stringify({
  type: 'Polygon',
  coordinates: [[
    [-68.85, -32.90],
    [-68.84, -32.90],
    [-68.84, -32.89],
    [-68.85, -32.89],
    [-68.85, -32.90],
  ]],
});

describe('acreditación de recorrido de celda', () => {
  it('acepta sólo GPS actual, con precisión suficiente y dentro de la celda', () => {
    expect(validateMissionCellVisit(
      geometry,
      { lat: -32.895, lng: -68.845 },
      { source: 'gps_current', horizontalAccuracyM: 18 },
    )).toBe('valid');
  });

  it('falla cerrado sin punto, con pin manual o precisión débil', () => {
    expect(validateMissionCellVisit(geometry, null, { source: 'gps_current', horizontalAccuracyM: 10 }))
      .toBe('missing_location');
    expect(validateMissionCellVisit(geometry, { lat: -32.895, lng: -68.845 }, { source: 'map_pin', horizontalAccuracyM: 10 }))
      .toBe('location_not_field_verified');
    expect(validateMissionCellVisit(geometry, { lat: -32.895, lng: -68.845 }, { source: 'gps_current', horizontalAccuracyM: 251 }))
      .toBe('location_accuracy_too_low');
  });

  it('rechaza geometría inválida y puntos fuera de la celda', () => {
    expect(validateMissionCellVisit('{bad', { lat: -32.895, lng: -68.845 }, { source: 'gps_current', horizontalAccuracyM: 8 }))
      .toBe('invalid_cell');
    expect(validateMissionCellVisit(geometry, { lat: -33.1, lng: -69.1 }, { source: 'gps_current', horizontalAccuracyM: 8 }))
      .toBe('outside_cell');
  });
});
