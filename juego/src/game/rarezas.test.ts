import { describe, expect, it } from 'vitest';
import { calcularRarezas, esFugaz, esFundadora, esNocturna } from './rarezas';

describe('fundadora', () => {
  it('la primera de su tipo es fundadora', () => {
    expect(esFundadora('need', [])).toBe(true);
    expect(esFundadora('need', [{ tipo: 'dream' }])).toBe(true);
  });

  it('la segunda del mismo tipo ya no', () => {
    expect(esFundadora('need', [{ tipo: 'need' }])).toBe(false);
  });

  it('la estrella de amistad también puede ser fundadora de su tipo', () => {
    expect(esFundadora('amistad', [{ tipo: 'need' }])).toBe(true);
    expect(esFundadora('amistad', [{ tipo: 'amistad' }])).toBe(false);
  });
});

describe('nocturna — 22:00 a 06:00', () => {
  it('bordes exactos', () => {
    expect(esNocturna(21)).toBe(false);
    expect(esNocturna(22)).toBe(true); // 22:00 en punto ya es noche
    expect(esNocturna(23)).toBe(true);
    expect(esNocturna(0)).toBe(true);
    expect(esNocturna(5)).toBe(true);
    expect(esNocturna(6)).toBe(false); // 06:00 en punto ya no
    expect(esNocturna(12)).toBe(false);
  });

  it('hora inválida tira error', () => {
    expect(() => esNocturna(24)).toThrow();
    expect(() => esNocturna(-1)).toThrow();
    expect(() => esNocturna(5.5)).toThrow();
  });
});

describe('fugaz y combinada', () => {
  it('fugaz refleja el evento activo', () => {
    expect(esFugaz(true)).toBe(true);
    expect(esFugaz(false)).toBe(false);
  });

  it('calcularRarezas junta los tres flags', () => {
    expect(
      calcularRarezas({ tipo: 'basta', hora: 23, eventoActivo: true }, []),
    ).toEqual({ fundadora: true, nocturna: true, fugaz: true });
    expect(
      calcularRarezas({ tipo: 'basta', hora: 10, eventoActivo: false }, [
        { tipo: 'basta' },
      ]),
    ).toEqual({ fundadora: false, nocturna: false, fugaz: false });
  });
});
