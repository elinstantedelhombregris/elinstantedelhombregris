import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Compartir } from '../comun/Compartir';
import { partirEnRenglones } from '../comun/imagen-para-compartir';
import { deDonde } from '../comun/lugar';
import { Papelito } from '../comun/Papelito';

import type * as Imagen from '../comun/imagen-para-compartir';

vi.mock('../comun/imagen-para-compartir', async (importar) => {
  const real = await importar<typeof Imagen>();
  return { ...real, dibujarPapelito: vi.fn(() => Promise.resolve()) };
});

describe('partirEnRenglones', () => {
  const medir = (s: string) => s.length * 10;
  it('parte por palabras sin pasarse del ancho', () => {
    expect(partirEnRenglones('uno dos tres cuatro', medir, 80)).toEqual([
      'uno dos',
      'tres',
      'cuatro',
    ]);
  });
  it('una palabra más larga que el ancho va sola', () => {
    expect(partirEnRenglones('a supercalifragilístico b', medir, 50)).toEqual([
      'a',
      'supercalifragilístico',
      'b',
    ]);
  });
});

describe('Papelito', () => {
  it('dice de dónde es y el tema', () => {
    render(
      <Papelito
        id="x"
        texto="Que haya tren"
        provincia="Ciudad Autónoma de Buenos Aires"
        tema="Movilidad"
      />,
    );
    expect(screen.getByText('Alguien de la Ciudad de Buenos Aires imagina')).toBeInTheDocument();
    expect(screen.getByText('«Que haya tren»')).toBeInTheDocument();
    expect(screen.getByText('Movilidad')).toBeInTheDocument();
  });
  it('sin provincia dice la Argentina', () => {
    expect(deDonde(null)).toBe('la Argentina');
  });
});

describe('Compartir', () => {
  const contenido = {
    kicker: 'Alguien de Salta imagina',
    texto: 'Que haya tren',
    pie: 'Movilidad',
    llamado: '¿Y vos?',
    bajada: 'Sumá el tuyo',
  };
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sin hoja de compartir copia el enlace', async () => {
    const escribir = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: escribir },
      configurable: true,
    });
    render(<Compartir contenido={contenido} enlace="/mi-argentina-ideal" texto="¿Y vos?" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Copiamos el enlace');
    });
    expect(escribir).toHaveBeenCalled();
  });

  it('si no puede copiar, muestra el enlace para copiarlo a mano', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('no')) },
      configurable: true,
    });
    render(<Compartir contenido={contenido} enlace="/mi-argentina-ideal" texto="¿Y vos?" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('/mi-argentina-ideal');
    });
  });
});
