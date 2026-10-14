import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IniciativaAcciones } from '../IniciativaAcciones';

import type { AccionIniciativa } from '@v2/shared';

const red = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('~/lib/api', () => ({ api: { get: red.get } }));
const accion: AccionIniciativa = {
  iniciativa: { slug: 'apoyo', titulo: 'Apoyo escolar' },
  tareaId: 1,
  estadoTarea: 'done',
  hito: 'Revisar la asistencia',
  revisionRealizada: false,
  recursos: 'Sala confirmada.',
  pruebaId: 'prueba-1',
  fichaId: 'ficha-1',
  alternativaId: 'alternativa-1',
  titulo: 'Dos encuentros de apoyo',
  alcance: 'Una sala del barrio.',
  plazo: '2000-01-01',
  estado: 'implementada',
  responsableNombre: 'Equipo de apoyo',
};
function mostrar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <IniciativaAcciones slug="apoyo" />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
});
describe('Acciones de una iniciativa', () => {
  it('distingue ejecución y revisión pendiente, conserva la evidencia y carga más', async () => {
    red.get
      .mockResolvedValueOnce({ items: [accion], siguiente: 1 })
      .mockResolvedValueOnce({
        items: [
          {
            ...accion,
            pruebaId: 'prueba-2',
            tareaId: 2,
            titulo: 'Otra prueba',
            estado: 'resultado_revisado',
            revisionRealizada: true,
          },
        ],
        siguiente: null,
      });
    mostrar();
    expect(await screen.findByRole('heading', { name: 'Dos encuentros de apoyo' })).toBeVisible();
    expect(screen.getByText(/falta registrar la revisión/)).toBeVisible();
    expect(screen.getByText(/Revisar la asistencia · pendiente/)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ver alternativa, pasos y evidencia' }),
    ).toHaveAttribute('href', '/fichas/ficha-1');
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más acciones' }));
    expect(await screen.findByRole('heading', { name: 'Otra prueba' })).toBeVisible();
    expect(red.get).toHaveBeenLastCalledWith('/api/iniciativas/apoyo/acciones?cursor=1');
    expect(screen.getByText(/revisión registrada/)).toBeVisible();
  });
  it('un fallo no se presenta como ausencia de acciones y permite reintentar', async () => {
    red.get
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValue({ items: [], siguiente: null });
    mostrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos actualizar');
    expect(screen.queryByText(/Todavía no hay acciones/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar acciones' }));
    expect(await screen.findByText(/Todavía no hay acciones/)).toBeVisible();
  });
});
