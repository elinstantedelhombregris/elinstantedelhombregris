import { describe, expect, it } from 'vitest';

import {
  buildSafeMapPointCard,
  isOperationalMapPoint,
  mapPointRecordRef,
  selectedMapPointFirst,
  type MapPointSelectionInput,
} from './map-point-action';

const observation: MapPointSelectionInput = {
  pointId: 'obs-1',
  kind: 'observation',
  category: 'alumbrado-publico',
  status: 'needs_review',
  precision: '100m',
  territoryId: 'territory-1',
  campaignKey: 'luminarias-v1',
  canVerify: true,
};

describe('selección segura y accionable de puntos del mapa', () => {
  it('decodifica la selección sin confundir los tres tipos de registro', () => {
    expect(mapPointRecordRef('obs-1')).toEqual({ kind: 'observation', entityId: 'obs-1' });
    expect(mapPointRecordRef('need:need-1')).toEqual({ kind: 'need', entityId: 'need-1' });
    expect(mapPointRecordRef('resource:resource-1')).toEqual({ kind: 'resource', entityId: 'resource-1' });
  });

  it('abre la señal elegida primero en la ronda de verificación', () => {
    const card = buildSafeMapPointCard(observation);

    expect(card?.actions[0]).toEqual({
      kind: 'verify',
      label: 'Aportar otra mirada',
      href: { pathname: '/verificar', params: { focus: 'obs-1' } },
    });
    expect(selectedMapPointFirst([{ id: 'other' }, { id: 'obs-1' }], 'obs-1'))
      .toEqual([{ id: 'obs-1' }, { id: 'other' }]);
  });

  it('no ofrece auto-verificación y abre la misión operativa vinculada', () => {
    const card = buildSafeMapPointCard(
      { ...observation, canVerify: false },
      [{
        id: 'mission-active',
        territoryId: 'territory-1',
        campaignKey: 'luminarias-v1',
        status: 'active',
      }],
    );

    expect(card?.actions).toEqual([{
      kind: 'mission',
      label: 'Abrir misión vinculada',
      href: { pathname: '/territorio/misiones/[id]', params: { id: 'mission-active' } },
    }]);
  });

  it('ofrece conectar y aportar para una necesidad sin misión', () => {
    const card = buildSafeMapPointCard({
      pointId: 'need:need-1',
      kind: 'need',
      category: 'food',
      status: 'submitted',
      precision: 'neighborhood',
      territoryId: null,
    });

    expect(card?.actions.map((action) => action.kind)).toEqual(['connect', 'offer']);
  });

  it('construye la ficha por lista permitida y descarta campos sensibles del origen', () => {
    const unsafeOrigin = {
      ...observation,
      title: 'Relato que no fue consentido',
      summary: 'Detalle privado',
      phone: '+54 11 5555 5555',
      exactLat: -34.6037,
      exactLng: -58.3816,
      locationLabel: 'Puerta roja, casa 12',
    } as MapPointSelectionInput;

    const serialized = JSON.stringify(buildSafeMapPointCard(unsafeOrigin));

    expect(serialized).not.toContain('Relato que no fue consentido');
    expect(serialized).not.toContain('Detalle privado');
    expect(serialized).not.toContain('+54 11');
    expect(serialized).not.toContain('-34.6037');
    expect(serialized).not.toContain('Puerta roja');
  });

  it('impide que borradores y estados cerrados sean puntos accionables', () => {
    expect(isOperationalMapPoint('observation', 'draft')).toBe(false);
    expect(isOperationalMapPoint('need', 'resolved')).toBe(false);
    expect(isOperationalMapPoint('resource', 'withdrawn')).toBe(false);
    expect(buildSafeMapPointCard({ ...observation, status: 'unsafe' })).toBeNull();
    expect(buildSafeMapPointCard({ ...observation, pointId: 'need:crossed-kind' })).toBeNull();
  });
});
