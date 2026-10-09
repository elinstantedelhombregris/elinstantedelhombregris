import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoQueFalta } from '../../LoQueFalta';

vi.mock('~/lib/queries/faltas', () => ({ useConteosDeFaltas: () => ({ data: undefined }) }));
vi.mock('../sections/PortadaLoQueFalta', () => ({ PortadaLoQueFalta: () => null }));
vi.mock('../sections/RegistroDeFaltas', () => ({ RegistroDeFaltas: () => null }));
vi.mock('~/components/papel/PanelDejarFalta', () => ({ PanelDejarFalta: () => null }));

describe('Lo que falta — las descargas del registro entero', () => {
  it.each([
    ['CSV', '/api/v1/faltas/descarga.csv'],
    ['JSONL', '/api/v1/faltas/descarga.jsonl'],
  ])('«%s» apunta a su archivo y mide lo que un dedo (44 px de alto)', (nombre, href) => {
    render(<LoQueFalta />);
    const enlace = screen.getByRole('link', { name: nombre });
    expect(enlace).toHaveAttribute('href', href);
    expect(enlace).toHaveClass('min-h-11', 'min-w-11', 'inline-flex', 'items-center');
  });
});
