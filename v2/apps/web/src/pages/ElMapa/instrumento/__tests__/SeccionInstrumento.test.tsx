import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeccionInstrumento } from '../../sections/SeccionInstrumento';

vi.mock('~/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

/**
 * El contrato de esta sección cambió con el rediseño.
 *
 * Antes el instrumento vivía detrás de un botón «Abrir el instrumento», y este
 * archivo afirmaba que no se montaba hasta tocarlo. Esa era justamente la
 * decisión que hacía que no se usara: un instrumento que hay que ir a buscar
 * abajo del pliegue no se encuentra.
 *
 * Ahora se monta siempre y el mapa es la superficie de la página. Lo que sigue
 * protegido —y es lo que estos tests cuidan— es que maplibre NO entre en el
 * bundle inicial: sigue detrás de `lazy()`, así que carga mientras la persona
 * lee el panel de arriba.
 */
describe('SeccionInstrumento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('se monta siempre: ya no hay botón que abrir', () => {
    render(<SeccionInstrumento />);
    expect(screen.queryByRole('button', { name: /abrir el instrumento/i })).not.toBeInTheDocument();
  });

  it('se titula con lo que es y dice su alcance sin esconderlo', () => {
    render(<SeccionInstrumento />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Mapa de aportes con ubicación' }),
    ).toBeInTheDocument();
    const aviso = screen.getByText(
      'Solo cuenta lo que la gente cargó con ubicación. No es toda la población.',
    );
    expect(aviso).toBeInTheDocument();
    // Visible también en el teléfono: antes se ocultaba bajo 640 px.
    expect(aviso.className).not.toMatch(/sr-only|hidden/);
    expect(aviso.closest('[class*="hidden"]')).toBeNull();
  });

  it('lleva el ancla profunda a la que redirige /explorar-datos', () => {
    const { container } = render(<SeccionInstrumento />);
    expect(container.querySelector('#instrumento')).not.toBeNull();
  });

  it('maplibre queda detrás de lazy(): en el primer render se ve el fallback', () => {
    // Si esto dejara de pasar, el mapa habría entrado al bundle inicial y la
    // página de conversión pagaría su peso antes de que nadie lo pida.
    render(<SeccionInstrumento />);
    expect(screen.getByText('Cargando el mapa…')).toBeInTheDocument();
  });
});
