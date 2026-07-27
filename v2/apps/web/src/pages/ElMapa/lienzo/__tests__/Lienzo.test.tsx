import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MapaArgentina } from '../../sections/MapaArgentina';

import { useProvincias, useVocesAbiertas, useVocesPorProvincia } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

const PROVINCIAS = [
  { id: 6, name: 'Córdoba', isoCode: 'AR-X' },
  { id: 2, name: 'Buenos Aires', isoCode: 'AR-B' },
];

/** Una voz clavada en un punto exacto, y una que solo sabe su provincia. */
const CON_PUNTO = {
  id: 10,
  body: 'Hay un pozo en esta esquina.',
  category: 'necesidad',
  provinceId: 2,
  submittedAs: null,
  createdAt: '2026-07-26T12:00:00Z',
  lat: -34.6037,
  lng: -58.3816,
  precision: 'exact',
};
const SIN_PUNTO = {
  id: 11,
  body: 'Quiero trenes que lleguen.',
  category: 'sueño',
  provinceId: 6,
  submittedAs: null,
  createdAt: '2026-07-25T12:00:00Z',
  lat: null,
  lng: null,
  precision: 'province',
};

function armar(voces: unknown[]) {
  vi.mocked(useProvincias).mockReturnValue({
    data: PROVINCIAS,
    isLoading: false,
  } as ReturnType<typeof useProvincias>);
  vi.mocked(useVocesAbiertas).mockReturnValue({
    data: voces,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useVocesAbiertas>);
  vi.mocked(useVocesPorProvincia).mockReturnValue({
    data: [
      { provinceId: 2, count: 1 },
      { provinceId: 6, count: 1 },
    ],
    isLoading: false,
  } as ReturnType<typeof useVocesPorProvincia>);
}

describe('Lienzo — el render honesto (spec 1 §5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armar([CON_PUNTO, SIN_PUNTO]);
  });

  it('una voz con punto se dibuja como círculo; una sin punto NO', () => {
    const { container } = render(<MapaArgentina />);
    // Un solo punto dibujado: el de la voz que tiene coordenada. La otra vive
    // en el lavado de su provincia, no como un punto inventado.
    const puntos = container.querySelectorAll('circle');
    expect(puntos).toHaveLength(1);
  });

  it('la voz exacta no lleva halo — no hay incertidumbre que dibujar', () => {
    const { container } = render(<MapaArgentina />);
    const circulos = [...container.querySelectorAll('circle')];
    expect(circulos).toHaveLength(1);
    expect(circulos[0]?.getAttribute('r')).toBe('3');
  });

  it('a escala país el halo de una voz a nivel localidad no se dibuja', () => {
    armar([{ ...CON_PUNTO, precision: 'city' }]);
    const { container } = render(<MapaArgentina />);
    // A escala país el halo de ±5 km es más chico que el símbolo, así que no
    // se dibuja: exagerar la duda es tan deshonesto como esconderla.
    const radios = [...container.querySelectorAll('circle')].map((c) => Number(c.getAttribute('r')));
    expect(radios).toHaveLength(1);
  });

  it('la leyenda dice cuántas tienen lugar propio y cuántas solo su provincia', () => {
    render(<MapaArgentina />);
    expect(screen.getByText(/1 voz tiene un lugar propio/)).toBeInTheDocument();
    expect(screen.getByText(/Las otras 1 solo saben su provincia/)).toBeInTheDocument();
  });

  it('sin ninguna coordenada, la leyenda lo dice en vez de fingir puntos', () => {
    armar([SIN_PUNTO]);
    render(<MapaArgentina />);
    expect(screen.getByText(/ubicadas a nivel provincia/)).toBeInTheDocument();
  });
});

describe('Lienzo — las altitudes (spec 1 §4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armar([CON_PUNTO, SIN_PUNTO]);
  });

  it('arranca en altitud país, mirando todo el mapa', () => {
    const { container } = render(<MapaArgentina />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 476.4 1000');
    expect(screen.getByText('Mirando todo el país.')).toBeInTheDocument();
  });

  it('entrar a una provincia acerca el viewBox y lo anuncia', () => {
    const { container } = render(<MapaArgentina />);
    fireEvent.click(screen.getByRole('button', { name: /^Córdoba: 1 voz/ }));
    fireEvent.click(screen.getByRole('button', { name: /ver Córdoba de cerca/ }));

    const viewBox = container.querySelector('svg')?.getAttribute('viewBox');
    expect(viewBox).not.toBe('0 0 476.4 1000');
    expect(screen.getByText(/Mirando Córdoba/)).toBeInTheDocument();
  });

  it('la miga de pan devuelve al país — el zoom no es solo gestual', () => {
    const { container } = render(<MapaArgentina />);
    fireEvent.click(screen.getByRole('button', { name: /^Córdoba: 1 voz/ }));
    fireEvent.click(screen.getByRole('button', { name: /ver Córdoba de cerca/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Argentina' }));
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 476.4 1000');
  });

  it('dentro de una provincia, las otras dejan de ser tab-stops', () => {
    render(<MapaArgentina />);
    expect(screen.getByRole('button', { name: /^Buenos Aires/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Córdoba: 1 voz/ }));
    fireEvent.click(screen.getByRole('button', { name: /ver Córdoba de cerca/ }));

    // Los tab-stops son los de la altitud actual, no la suma de todas.
    expect(screen.queryByRole('button', { name: /^Buenos Aires/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Córdoba/ })).not.toBeInTheDocument();
  });
});
