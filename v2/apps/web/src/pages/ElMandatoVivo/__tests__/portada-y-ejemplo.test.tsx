import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { SELLO_ROJO_SOBRE_OSCURO } from '../el-mandato-data';
import { PortadaMandato } from '../sections/PortadaMandato';

import { ElMandatoVivoEjemplo } from '~/pages/ElMandatoVivoEjemplo';

describe('la portada del mandato', () => {
  it('dice qué es un mandato y que hoy no hay ninguno', () => {
    const { container } = render(<PortadaMandato />);
    expect(container.textContent).toContain(
      'Un mandato es una exigencia con fecha, responsables y forma de comprobarla. Hoy no hay ninguno: acá ves qué se está armando y qué dijo la gente.',
    );
    expect(container.textContent).not.toMatch(/sumar voces|palabras parecidas|Conservamos/);
  });
});

describe('el ejemplo del mandato se lee de noche', () => {
  const montar = () => {
    const { hook } = memoryLocation({ path: '/mandato-vivo/ejemplo' });
    return render(
      <Router hook={hook}>
        <ElMandatoVivoEjemplo />
      </Router>,
    );
  };

  it('el eyebrow «Un ejemplo, no el país» usa el violeta claro: el común rinde 2,2:1 sobre este fondo', () => {
    montar();
    const eyebrow = screen.getByText('Un ejemplo, no el país');
    expect(eyebrow.className).toMatch(/text-violeta-claro/);
    expect(eyebrow.className).not.toMatch(/text-violeta(?!-claro)/);
  });

  it('el sello rojo y los de cada acta llevan el aclarado de noche, y ninguno baja de 10 px', () => {
    const { container } = montar();
    const sellos = [...container.querySelectorAll<HTMLElement>('.text-sello')];
    // El sello de arriba y uno por acta.
    expect(sellos.length).toBe(6);
    for (const sello of sellos) {
      expect(sello.className).toContain(SELLO_ROJO_SOBRE_OSCURO);
      expect(sello.className).not.toMatch(/text-\[(?:[0-9]|9\.5)px\]/);
    }
  });

  it('el rojo queda para «ejemplo»: ningún otro texto de la página usa el color del sello', () => {
    const { container } = montar();
    for (const rojo of container.querySelectorAll<HTMLElement>('.text-sello')) {
      expect(rojo.textContent.toLowerCase()).toMatch(/ejemplo/);
    }
  });
});
