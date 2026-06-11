import { describe, it, expect } from 'vitest';
import {
  radarSenalSchema,
  buildDreamInsert,
  excerptSignalText,
  isVoiceType,
} from '../../server/lib/radar';

describe('radarSenalSchema', () => {
  it('acepta una señal de sueño válida con coordenadas string', () => {
    const parsed = radarSenalSchema.parse({
      type: 'dream',
      text: 'Sueño con un barrio donde los pibes terminen la escuela',
      latitude: '-34.6037',
      longitude: '-58.3816',
      location: 'Buenos Aires',
    });
    expect(parsed.type).toBe('dream');
    expect(parsed.latitude).toBeCloseTo(-34.6037);
    expect(parsed.longitude).toBeCloseTo(-58.3816);
  });

  it('acepta los seis tipos de señal', () => {
    for (const type of ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso']) {
      const result = radarSenalSchema.safeParse({ type, text: 'Una señal con suficiente largo' });
      expect(result.success, `tipo ${type}`).toBe(true);
    }
  });

  it('rechaza texto demasiado corto con mensaje en castellano', () => {
    const result = radarSenalSchema.safeParse({ type: 'need', text: 'corto' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/al menos 10 caracteres/);
    }
  });

  it('rechaza tipo inválido', () => {
    const result = radarSenalSchema.safeParse({ type: 'queja', text: 'Una señal con suficiente largo' });
    expect(result.success).toBe(false);
  });

  it('rechaza latitud fuera de rango', () => {
    const result = radarSenalSchema.safeParse({
      type: 'dream',
      text: 'Una señal con suficiente largo',
      latitude: 120,
    });
    expect(result.success).toBe(false);
  });

  it('recorta espacios del texto', () => {
    const parsed = radarSenalSchema.parse({
      type: 'basta',
      text: '   Basta de promesas vacías en mi barrio   ',
    });
    expect(parsed.text).toBe('Basta de promesas vacías en mi barrio');
  });
});

describe('buildDreamInsert', () => {
  it('pone el texto en la columna del tipo y deja las demás en null', () => {
    const insert = buildDreamInsert(
      { type: 'need', text: 'Necesitamos una salita de salud que atienda de noche' },
      null,
    );
    expect(insert.need).toBe('Necesitamos una salita de salud que atienda de noche');
    expect(insert.dream).toBeNull();
    expect(insert.value).toBeNull();
    expect(insert.basta).toBeNull();
    expect(insert.type).toBe('need');
    expect(insert.userId).toBeNull();
  });

  it('serializa lat/lng como string (la tabla dreams usa text)', () => {
    const insert = buildDreamInsert(
      { type: 'dream', text: 'Un sueño suficientemente largo', latitude: -34.6, longitude: -58.4 },
      7,
    );
    expect(insert.latitude).toBe('-34.6');
    expect(insert.longitude).toBe('-58.4');
    expect(insert.userId).toBe(7);
  });

  it('rechaza tipos que no van a la tabla dreams', () => {
    expect(() =>
      buildDreamInsert({ type: 'compromiso', text: 'Me comprometo a algo concreto' } as any, 1),
    ).toThrow(/tipos de voz/);
  });
});

describe('isVoiceType', () => {
  it('distingue señales anónimas de las que requieren cuenta', () => {
    expect(isVoiceType('dream')).toBe(true);
    expect(isVoiceType('basta')).toBe(true);
    expect(isVoiceType('compromiso')).toBe(false);
    expect(isVoiceType('recurso')).toBe(false);
  });
});

describe('excerptSignalText', () => {
  it('colapsa espacios y corta con elipsis', () => {
    const long = 'palabra '.repeat(40);
    const excerpt = excerptSignalText(long, 50);
    expect(excerpt.length).toBeLessThanOrEqual(50);
    expect(excerpt.endsWith('…')).toBe(true);
  });

  it('devuelve vacío para null', () => {
    expect(excerptSignalText(null)).toBe('');
  });
});
