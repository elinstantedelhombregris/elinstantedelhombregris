import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VisionCompartida } from '../../VisionCompartida';

import type { VisionCompartida as Lectura } from '@v2/shared';

const m = vi.hoisted(() => ({
  lectura: undefined as Lectura | undefined,
  isError: false,
  siguiente: vi.fn(),
  filtro: vi.fn(),
}));
vi.mock('~/lib/queries/deliberacion', () => ({
  useVisionCompartida: (id?: number) => {
    m.filtro(id);
    return {
      data: m.lectura ? { pages: [m.lectura] } : undefined,
      isError: m.isError,
      error: m.isError ? new Error('No hay conexión') : null,
      isPending: false,
      hasNextPage: Boolean(m.lectura?.siguiente),
      isFetchingNextPage: false,
      fetchNextPage: m.siguiente,
      refetch: vi.fn(),
    };
  },
}));
vi.mock('../../Fichas/consultas', () => ({ useLugar: () => ({ data: { name: 'Córdoba' } }) }));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Buscador territorial</p>,
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.isError = false;
  m.lectura = undefined;
  window.history.replaceState({}, '', '/vision-compartida');
});
describe('Primera lectura de objetivos entre territorios', () => {
  it('distingue total completo y página cargada y enlaza evidencia y conversación', () => {
    m.lectura = {
      total: 21,
      territorios: 4,
      objetivos: 16,
      siguiente: 'pagina-dos',
      fecha: '2026-10-14T10:00:00Z',
      fichas: [
        {
          id: 'f1',
          titulo: 'Acceder cerca',
          revision: 3,
          territorio: 'Córdoba',
          futuro: 'Pedir turnos sin perder trabajo',
          proximaTarea: 'Relevar tiempos de viaje',
          fuentes: 1,
          sintesis: 'requiere_revision',
          objetivos: [
            {
              id: 'o1',
              titulo: 'Menos espera',
              resultado: 'Acceso oportuno',
              escala: 'entre_territorios',
              horizonte: '2027-01-01',
            },
          ],
        },
      ],
    };
    render(<VisionCompartida />);
    expect(screen.getByText(/se cargaron 1 de 21 fichas/)).toBeVisible();
    expect(screen.getByText(/Síntesis pendiente de revisión por retiro/)).toBeVisible();
    expect(screen.getByText(/Coordinación entre territorios/)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ver línea de base, meta, fuentes y límites' }),
    ).toHaveAttribute('href', '/fichas/f1#evidencia');
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más fichas' }));
    expect(m.siguiente).toHaveBeenCalledOnce();
    expect(screen.getByText(/No representa por sí sola a la población/)).toBeVisible();
  });
  it('no presenta un fallo como cero fichas ni habilita imprimir una lectura ausente', () => {
    m.isError = true;
    render(<VisionCompartida />);
    expect(screen.getByRole('alert')).toHaveTextContent('No hay conexión');
    expect(screen.queryByText('Fichas en el alcance')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Imprimir lectura cargada' })).toBeNull();
  });
  it('preserva el filtro territorial en mapa y nueva ficha y explica sus límites', () => {
    window.history.replaceState({}, '', '/vision-compartida?lugar=14');
    m.lectura = {
      total: 0,
      territorios: 0,
      objetivos: 0,
      siguiente: null,
      fecha: '2026-10-14T10:00:00Z',
      fichas: [],
    };
    render(<VisionCompartida />);
    expect(m.filtro).toHaveBeenCalledWith(14);
    expect(screen.getByRole('link', { name: 'Crear una ficha de este alcance' })).toHaveAttribute(
      'href',
      '/fichas/nueva?lugar=14',
    );
    expect(screen.getByRole('link', { name: 'Volver al mapa' })).toHaveAttribute(
      'href',
      '/el-mapa?lugar=14',
    );
    expect(screen.getByText(/No suma automáticamente localidades/)).toBeVisible();
  });
});
