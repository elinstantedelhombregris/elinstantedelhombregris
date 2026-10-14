import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useModoCobertura } from '../modos/useModoCobertura';

import type { SenalConTipo } from '../useVistaMapa';
interface FeatureCollection {
  features: { properties: Record<string, unknown> | null }[];
}
import type { ReactNode } from 'react';

vi.mock('react-map-gl/maplibre', () => ({
  Source: ({ data, children }: { data: FeatureCollection; children: ReactNode }) => (
    <div
      data-testid="celdas"
      data-con-punto={data.features.filter((f) => f.properties?.muda === 0).length}
    >
      {children}
    </div>
  ),
  Layer: () => null,
}));
const base: SenalConTipo = {
  id: 's1',
  capa: 'voz',
  tipo: 'necesidad',
  claseSenal: null,
  texto: 'Agua',
  lat: -34.61,
  lng: -58.41,
  precision: 'province',
  role: 'capture',
  provinceId: 6,
  cityId: null,
  createdAt: '2026-10-14',
};
function Cobertura({ precision }: { precision: string }) {
  const q = useModoCobertura({
    todas: [{ ...base, precision }],
    senales: [],
    mapaRef: { current: null },
    recuadro: { norte: -34.6, sur: -34.62, oeste: -58.42, este: -58.4 },
    cargando: false,
  });
  return (
    <>
      {q.panel}
      {q.capas}
    </>
  );
}
describe('Precisión de la grilla exploratoria', () => {
  it('un centroide o punto aproximado no acredita presencia exacta; la grilla declara sus límites', () => {
    const { rerender } = render(<Cobertura precision="province" />);
    fireEvent.click(screen.getByRole('button', { name: 'Todas las celdas' }));
    expect(screen.getByTestId('celdas')).toHaveAttribute('data-con-punto', '0');
    for (const precision of ['city', '500m', 'neighborhood', 'desconocida']) {
      rerender(<Cobertura precision={precision} />);
      expect(screen.getByTestId('celdas')).toHaveAttribute('data-con-punto', '0');
    }
    rerender(<Cobertura precision="exact" />);
    expect(Number(screen.getByTestId('celdas').getAttribute('data-con-punto'))).toBeGreaterThan(0);
    expect(screen.getByText(/no es una unidad estable de relevamiento/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Planear escucha/ })).toHaveAttribute(
      'href',
      '/escucha-territorial',
    );
  });
});
