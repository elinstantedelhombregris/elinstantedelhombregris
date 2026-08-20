import { beforeEach, describe, expect, it } from 'vitest';

import { guardarSenalador, leerSenalador } from './senalador';

describe('senalador — el último ensayo abierto', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trip: lo guardado se lee', () => {
    guardarSenalador('carta-al-nieto');
    expect(leerSenalador()).toBe('carta-al-nieto');
  });

  it('sin nada guardado devuelve null; string vacío también es null', () => {
    expect(leerSenalador()).toBeNull();
    window.localStorage.setItem('basta_senalador', '');
    expect(leerSenalador()).toBeNull();
  });

  it('con storage roto no explota: guardar es silencioso y leer devuelve null', () => {
    // Ni el spy de Storage.prototype intercepta en este entorno DOM: se
    // reemplaza window.localStorage entero por uno que tira, y se restaura.
    const original = window.localStorage;
    const roto = {
      getItem(): string | null {
        throw new Error('SecurityError');
      },
      setItem(): void {
        throw new Error('QuotaExceededError');
      },
    };
    Object.defineProperty(window, 'localStorage', { value: roto, configurable: true });
    try {
      expect(() => {
        guardarSenalador('x');
      }).not.toThrow();
      expect(leerSenalador()).toBeNull();
    } finally {
      Object.defineProperty(window, 'localStorage', { value: original, configurable: true });
    }
  });
});
