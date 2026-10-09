import { describe, expect, it } from 'vitest';

import { LIMITE_APORTE, recortarEnFrase, unirRespuestas } from './texto-aporte';

describe('unirRespuestas', () => {
  it('une solo lo escrito, sin espacios sobrantes', () => {
    expect(unirRespuestas(['  Una escena. ', '', '   ', 'Que funcione.'])).toBe(
      'Una escena.\n\nQue funcione.',
    );
    expect(unirRespuestas(['', '', ''])).toBe('');
  });
});

describe('recortarEnFrase', () => {
  it('no toca lo que ya entra', () => {
    expect(recortarEnFrase('Una frase corta.')).toEqual({
      texto: 'Una frase corta.',
      recortado: false,
    });
    const justo = 'a'.repeat(LIMITE_APORTE);
    expect(recortarEnFrase(justo)).toEqual({ texto: justo, recortado: false });
  });

  it('corta donde termina una frase y avisa que recortó', () => {
    const primera = 'Quiero aprender cerca de mi casa. ';
    const texto = primera.repeat(100);
    const r = recortarEnFrase(texto, 200);
    expect(r.recortado).toBe(true);
    expect(r.texto.length).toBeLessThanOrEqual(200);
    expect(r.texto.endsWith('casa.')).toBe(true);
  });

  it('prefiere el último fin de párrafo cuando está más cerca del límite', () => {
    const texto = `${'Uno. '.repeat(10)}\n\n${'Dos dos dos dos dos dos dos dos dos dos.'.padEnd(120, ' x')}`;
    const r = recortarEnFrase(texto, 80);
    expect(r.recortado).toBe(true);
    expect(r.texto.length).toBeLessThanOrEqual(80);
    expect(r.texto.startsWith('Uno.')).toBe(true);
  });

  it('sin puntuación cercana corta en un espacio, no a mitad de palabra', () => {
    const texto = 'palabra '.repeat(60);
    const r = recortarEnFrase(texto, 100);
    expect(r.recortado).toBe(true);
    expect(r.texto.length).toBeLessThanOrEqual(100);
    expect(r.texto.endsWith('palabra')).toBe(true);
  });

  it('un bloque sin espacios ni puntos se corta a secas, pero nunca pasa el límite', () => {
    const r = recortarEnFrase('x'.repeat(5000));
    expect(r.recortado).toBe(true);
    expect(r.texto).toHaveLength(LIMITE_APORTE);
  });

  it('tres respuestas llenas quedan dentro del límite', () => {
    const respuesta = 'Quiero poder caminar tranquila por mi barrio. '.repeat(44).trim();
    const unido = unirRespuestas([respuesta, respuesta, respuesta]);
    expect(unido.length).toBeGreaterThan(LIMITE_APORTE);
    const r = recortarEnFrase(unido);
    expect(r.texto.length).toBeLessThanOrEqual(LIMITE_APORTE);
    expect(r.texto.endsWith('.')).toBe(true);
  });
});
