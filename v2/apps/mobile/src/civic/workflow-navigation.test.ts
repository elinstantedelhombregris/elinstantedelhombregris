import { describe, expect, it } from 'vitest';

import {
  connectionEmptyState,
  missionExpeditionLinkKey,
  unreviewedObservationsForActor,
} from './workflow-navigation';

describe('relevos del flujo cívico', () => {
  it('no promete contrapartes remotas cuando la instalación está en modo local', () => {
    const state = connectionEmptyState('local');

    expect(state.description).toContain('contraparte remota');
    expect(state.description).toContain('red cívica configurada');
    expect(state.primary).toEqual({ label: 'Preparar un recurso', route: '/aportar' });
  });

  it('distingue red sin cuenta de red conectada sin coincidencias', () => {
    expect(connectionEmptyState('link_required').primary?.route).toBe('/circulos');
    expect(connectionEmptyState('connected').primary?.route).toBe('/aportar');
    expect(connectionEmptyState('checking').primary).toBeNull();
  });

  it('retira de la ronda lo que la misma identidad ya revisó', () => {
    const observations = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const verifications: Record<string, { verifierKey: string }[]> = {
      a: [{ verifierKey: 'actor-me' }],
      b: [{ verifierKey: 'actor-other' }],
      c: [],
    };

    expect(unreviewedObservationsForActor(
      observations,
      'actor-me',
      (id) => verifications[id] ?? [],
    )).toEqual([{ id: 'b' }, { id: 'c' }]);
    expect(unreviewedObservationsForActor(observations, null, () => [])).toEqual([]);
  });

  it('produce una clave estable y separada por misión', () => {
    expect(missionExpeditionLinkKey('mission-a')).toBe(missionExpeditionLinkKey('mission-a'));
    expect(missionExpeditionLinkKey('mission-b')).not.toBe(missionExpeditionLinkKey('mission-a'));
    expect(() => missionExpeditionLinkKey(' ')).toThrow('mission_id_required');
  });
});
