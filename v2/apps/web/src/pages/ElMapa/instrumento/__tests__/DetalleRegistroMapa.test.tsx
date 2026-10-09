import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DetalleRegistroMapa } from '../DetalleRegistroMapa';

import type { SenalMapa } from '~/lib/queries/civic-map';

const senal: SenalMapa = {
  id: 'voz:34b57499-a167-4dda-ae15-f0e0c3c67720',
  capa: 'voz',
  tipo: 'sueño',
  texto: 'Aprender cerca de quienes quiero.',
  lat: null,
  lng: null,
  precision: 'province',
  role: 'capture',
  provinceId: 13,
  cityId: null,
  createdAt: '2026-10-08T00:00:00Z',
};
describe('Leer un aporte dentro del mapa', () => {
  it('abre la fuente correcta, explica la precisión y permite cerrar con teclado', () => {
    const cerrar = vi.fn();
    render(<DetalleRegistroMapa senal={senal} cerrar={cerrar} />);
    expect(screen.getByRole('link', { name: 'Leer este aporte →' })).toHaveAttribute(
      'href',
      '/senal/34b57499-a167-4dda-ae15-f0e0c3c67720',
    );
    expect(screen.getByText(/Sin punto en el mapa/)).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: 'Cerrar el aporte seleccionado' });
    expect(boton).toHaveFocus();
    fireEvent.keyDown(boton, { key: 'Escape' });
    expect(cerrar).toHaveBeenCalledOnce();
  });
  it('un texto reservado no se cita como si lo hubiera dicho su autor', () => {
    const { container } = render(
      <DetalleRegistroMapa
        senal={{ ...senal, texto: 'Texto reservado por su autoría.' }}
        cerrar={vi.fn()}
      />,
    );
    expect(container.querySelector('blockquote')).toBeNull();
    expect(screen.getByText(/reservar sus palabras/)).toBeInTheDocument();
  });

  it('la precisión se lee en castellano y aclara que no es una dirección', () => {
    const { container } = render(
      <DetalleRegistroMapa
        senal={{ ...senal, lat: -34.6, lng: -58.4, precision: 'neighborhood' }}
        cerrar={vi.fn()}
      />,
    );
    expect(container.textContent).toContain(
      'Ubicación aproximada, en su barrio. No es una dirección.',
    );
    expect(container.textContent).not.toMatch(/neighborhood|Precisión:/);
  });
});
