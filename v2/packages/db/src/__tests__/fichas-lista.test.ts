/**
 * Lo que la lista de fichas muestra de cada una sin abrirla: el extracto del
 * futuro deseado y los temas. Son funciones puras; la consulta entera, con el
 * conteo de afirmaciones y los filtros, se prueba contra Postgres en
 * `apps/api/tests/fichas.test.ts`.
 */
import { describe, expect, it } from 'vitest';

import { extractoDeFuturo, temasDeLaFicha } from '../repositories/fichas.js';

describe('extractoDeFuturo', () => {
  it('un futuro corto se devuelve entero', () => {
    expect(extractoDeFuturo('Agua accesible.')).toBe('Agua accesible.');
  });

  it('junta los saltos de línea y los espacios repetidos', () => {
    expect(extractoDeFuturo('  Una escuela\n\na pie   para todos.  ')).toBe(
      'Una escuela a pie para todos.',
    );
  });

  it('un texto de exactamente 180 caracteres no se corta', () => {
    const justo = 'a'.repeat(179) + 'b';
    expect(extractoDeFuturo(justo)).toBe(justo);
  });

  it('un texto largo se corta en el borde de una palabra y lo marca con «…»', () => {
    const largo = 'Aprendemos cerca de casa y compartimos saberes entre generaciones. '.repeat(6);
    const extracto = extractoDeFuturo(largo);
    expect(extracto.endsWith('…')).toBe(true);
    expect(extracto.length).toBeLessThanOrEqual(181);
    const cuerpo = extracto.slice(0, -1);
    expect(largo.startsWith(cuerpo)).toBe(true);
    expect(largo[cuerpo.length]).toMatch(/[\s.]/);
    expect(cuerpo).not.toMatch(/[\s,;:.]$/);
  });

  it('si la palabra número 180 termina justo en el corte, no se pierde la palabra anterior', () => {
    const texto = `${'a'.repeat(100)} ${'b'.repeat(79)} ${'c'.repeat(30)}`;
    expect(extractoDeFuturo(texto)).toBe(`${'a'.repeat(100)} ${'b'.repeat(79)}…`);
  });

  it('sin ningún espacio cerca, corta duro a los 180 caracteres', () => {
    expect(extractoDeFuturo('x'.repeat(400))).toBe(`${'x'.repeat(180)}…`);
  });

  it('un corte duro no deja la mitad de un carácter fuera del plano básico', () => {
    const extracto = extractoDeFuturo('x'.repeat(179) + '😀'.repeat(20));
    expect(extracto).toBe(`${'x'.repeat(179)}…`);
  });

  it('una ficha vieja sin futuro, o con otra forma, no tiene extracto', () => {
    for (const raro of [undefined, null, 42, true, {}, ['Agua'], '   ']) {
      expect(extractoDeFuturo(raro)).toBe('');
    }
  });
});

describe('temasDeLaFicha', () => {
  it('devuelve las claves tal cual vienen', () => {
    expect(temasDeLaFicha(['agua', 'educacion'])).toEqual(['agua', 'educacion']);
  });

  it('conserva un tema escrito a mano en una ficha vieja', () => {
    expect(temasDeLaFicha(['Salud mental'])).toEqual(['Salud mental']);
  });

  it('quita lo que no es texto, lo vacío y lo repetido', () => {
    expect(temasDeLaFicha(['agua', 3, null, '', '  ', {}, 'agua', 'transporte'])).toEqual([
      'agua',
      'transporte',
    ]);
  });

  it('sin temas, o con otra forma, es una lista vacía', () => {
    for (const raro of [undefined, null, 'agua', 7, {}, { 0: 'agua' }]) {
      expect(temasDeLaFicha(raro)).toEqual([]);
    }
  });
});
