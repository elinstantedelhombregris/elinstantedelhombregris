import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CASOS_COTIDIANOS, plantillaDelCaso } from '../ejemplos/casos';
import { EjemplosFichas } from '../ejemplos/Ejemplos';

describe('Ejemplos cotidianos separados de la participación real', () => {
  it('explica las operaciones en siete pasos para los tres casos sin copiar resultados', () => {
    render(<EjemplosFichas />);
    expect(screen.getByText(/Ejemplos ficticios/)).toBeVisible();
    for (const c of CASOS_COTIDIANOS) {
      fireEvent.click(screen.getByRole('button', { name: c.titulo }));
      for (let i = 0; i < c.pasos.length; i++) {
        const paso = c.pasos[i];
        if (!paso) throw new Error('Falta paso');
        fireEvent.click(screen.getByRole('button', { name: `${i + 1}. ${paso.titulo}` }));
        expect(screen.getByText(paso.accion)).toBeVisible();
        expect(screen.getByText(paso.resultado, { exact: false })).toBeVisible();
      }
      expect(
        screen.getByRole('link', { name: 'Empezar una ficha con esta pregunta' }),
      ).toHaveAttribute('href', `/fichas/nueva?ejemplo=${c.id}`);
      expect(plantillaDelCaso(c.id)).toEqual({
        titulo: c.pregunta,
        futuro: c.futuro,
        proximaTarea: c.investigar,
      });
    }
    expect(plantillaDelCaso('no-existe')).toBeNull();
  });
});
