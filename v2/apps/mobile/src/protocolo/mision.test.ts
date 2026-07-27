import { describe, expect, it } from 'vitest';
import { puedeResolver, transicionValida } from './mision';

describe('máquina de estados de misión', () => {
  it('el camino feliz: propuesta→equipo→activa→verificacion→resuelta', () => {
    expect(transicionValida('propuesta', 'equipo')).toBe(true);
    expect(transicionValida('equipo', 'activa')).toBe(true);
    expect(transicionValida('activa', 'verificacion')).toBe(true);
    expect(transicionValida('verificacion', 'resuelta')).toBe(true);
  });

  it('la verificación puede volver a activa (obra rechazada)', () => {
    expect(transicionValida('verificacion', 'activa')).toBe(true);
  });

  it('abandonar se puede desde propuesta/equipo/activa, nunca desde resuelta', () => {
    expect(transicionValida('propuesta', 'abandonada')).toBe(true);
    expect(transicionValida('equipo', 'abandonada')).toBe(true);
    expect(transicionValida('activa', 'abandonada')).toBe(true);
    expect(transicionValida('resuelta', 'abandonada')).toBe(false);
  });

  it('no hay saltos: propuesta no va directo a activa ni a resuelta', () => {
    expect(transicionValida('propuesta', 'activa')).toBe(false);
    expect(transicionValida('propuesta', 'resuelta')).toBe(false);
    expect(transicionValida('resuelta', 'activa')).toBe(false);
  });

  it('gobernanza coordinada: solo el coordinador resuelve', () => {
    expect(puedeResolver('coordinada', 'coordinador', 0, 4)).toBe(true);
    expect(puedeResolver('coordinada', 'miembro', 4, 4)).toBe(false);
  });

  it('gobernanza por consentimiento: mayoría simple de miembros', () => {
    expect(puedeResolver('consentimiento', 'miembro', 2, 4)).toBe(true);  // 2 >= ceil(4/2)
    expect(puedeResolver('consentimiento', 'miembro', 1, 4)).toBe(false);
    expect(puedeResolver('consentimiento', 'coordinador', 1, 3)).toBe(false); // 1 < ceil(3/2)
    expect(puedeResolver('consentimiento', 'miembro', 2, 3)).toBe(true);
  });
});
