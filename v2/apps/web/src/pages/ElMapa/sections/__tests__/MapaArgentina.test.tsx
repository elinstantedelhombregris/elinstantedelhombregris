import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MapaArgentina } from '../MapaArgentina';

import {
  useProvincias,
  useVocesAbiertas,
  useVocesPorProvincia,
} from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockVoces = vi.mocked(useVocesAbiertas);
const mockConteos = vi.mocked(useVocesPorProvincia);

const PROVINCIAS = [
  { id: 6, name: 'Córdoba', isoCode: 'AR-X' },
  { id: 21, name: 'Santa Fe', isoCode: 'AR-S' },
];
const VOCES = [
  { id: 2, body: 'Quiero trenes que lleguen.', category: 'sueño', provinceId: 6, submittedAs: null, createdAt: '2026-07-22T12:00:00Z' },
  { id: 1, body: 'Basta de laburar para el alquiler.', category: 'basta', provinceId: 6, submittedAs: null, createdAt: '2026-07-21T12:00:00Z' },
];

function armarMocks(voces = VOCES, conteos = [{ provinceId: 6, count: 2 }]) {
  mockProvincias.mockReturnValue({ data: PROVINCIAS, isLoading: false } as ReturnType<typeof useProvincias>);
  mockVoces.mockReturnValue({ data: voces, isLoading: false, isError: false } as ReturnType<typeof useVocesAbiertas>);
  mockConteos.mockReturnValue({ data: conteos, isLoading: false } as ReturnType<typeof useVocesPorProvincia>);
}

describe('MapaArgentina', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armarMocks();
  });

  it('las provincias con voces son botones con conteo; las demás quedan decorativas', () => {
    render(<MapaArgentina />);

    const cordoba = screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' });
    expect(cordoba).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Santa Fe/ })).not.toBeInTheDocument();
  });

  it('activar una provincia abre el popover con la voz más reciente y cicla con «otra →»', () => {
    render(<MapaArgentina />);

    fireEvent.click(screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' }));

    const popover = screen.getByRole('dialog', { name: 'Voz de Córdoba' });
    expect(popover).toHaveTextContent('«Quiero trenes que lleguen.»');
    expect(popover).toHaveTextContent('Córdoba · voz 1 de 2');

    fireEvent.click(screen.getByRole('button', { name: 'otra →' }));
    expect(screen.getByRole('dialog', { name: 'Voz de Córdoba' })).toHaveTextContent(
      '«Basta de laburar para el alquiler.»',
    );
  });

  it('Escape y «✕» cierran el popover', () => {
    render(<MapaArgentina />);
    fireEvent.click(screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' }));

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin voces, la leyenda dice la oportunidad (§10.9)', () => {
    armarMocks([], []);
    render(<MapaArgentina />);

    expect(screen.getByText('Todavía no hay voces acá. Qué oportunidad.')).toBeInTheDocument();
  });
});
