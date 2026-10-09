import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CICLO, ROLES } from '../../la-idea-data';
import { CapituloMetodo } from '../CapituloMetodo';

import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

describe('CapituloMetodo', () => {
  it('renderiza los tres roles con su verbo', () => {
    render(<CapituloMetodo />);

    expect(ROLES).toHaveLength(3);
    for (const rol of ROLES) {
      expect(screen.getByRole('heading', { name: `${rol.a} ${rol.b}` })).toBeInTheDocument();
    }
  });

  it('muestra el ciclo completo como cadena de chips que vuelve a girar', () => {
    render(<CapituloMetodo />);

    for (const paso of CICLO) {
      expect(screen.getByText(paso.label)).toBeInTheDocument();
    }
    expect(screen.getByText('↺')).toBeInTheDocument();
  });

  it('el ciclo usa las palabras del sitio y en el orden en que se recorre', () => {
    render(<CapituloMetodo />);

    expect(CICLO.map((paso) => paso.label)).toEqual([
      'tu aporte',
      'campañas',
      'fichas',
      'pruebas',
      'revisión',
    ]);
    // La explicación de debajo habla de lo mismo que las fichas del ciclo.
    expect(screen.getByText(/los aportes nuevos abren campañas, las fichas comparan alternativas/)).toBeInTheDocument();
    for (const viejo of ['tu voz', 'el mandato', 'los planes', 'la ejecución', 'la auditoría'])
      expect(screen.queryByText(viejo)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/las voces nuevas/);
  });

  it('no cierra el método con un aforismo', () => {
    render(<CapituloMetodo />);

    expect(screen.getByText(/observamos lo que ocurre y revisamos el diseño\.$/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/El ideal orienta/);
  });

  it('cierra con el ejemplo: sello, conteo real de planes y CTA a /planes', () => {
    render(<CapituloMetodo />);

    expect(screen.getByText('No es doctrina')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Hay ${PLAN_COUNT} planes`))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver el ejemplo: los planes →' })).toHaveAttribute(
      'href',
      '/planes',
    );
  });
});
