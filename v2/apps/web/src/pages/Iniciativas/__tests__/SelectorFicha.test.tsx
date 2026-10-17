import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { DestinoFicha } from '../DestinoFicha';

const m = vi.hoisted(() => ({ get: vi.fn(), mutate: vi.fn(), usuario: 1 }));
vi.mock('~/lib/api', () => ({ api: { get: m.get } }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: m.usuario } }) }));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionOperacion: () => ({ mutate: m.mutate, isPending: false }),
}));
const id = '00000000-0000-4000-8000-000000000001';
const otro = '00000000-0000-4000-8000-000000000002';
function montar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const vista = (revision: number) => (
    <QueryClientProvider client={cliente}>
      <DestinoFicha id={1} tareaId={2} revision={revision} administrar />
    </QueryClientProvider>
  );
  const r = render(vista(1));
  return {
    ...r,
    revisar: (revision: number) => {
      r.rerender(vista(revision));
    },
  };
}
beforeEach(() => {
  m.usuario = 1;
  m.mutate.mockReset();
  m.get.mockReset().mockImplementation((ruta: string) =>
    Promise.resolve(
      ruta.includes('/editables')
        ? {
            items: [
              { id, titulo: 'Llegar a tiempo a la escuela', territorio: null },
              { id: otro, titulo: 'Otro turno escolar', territorio: null },
            ],
            siguiente: null,
          }
        : { fichaId: id, titulo: 'Llegar a tiempo a la escuela' },
    ),
  );
});
it('conserva la selección cuando cambia la tarea y exige revisar la versión antes de guardar', async () => {
  const r = montar();
  fireEvent.click(await screen.findByText('Elegir ficha de devolución'));
  await screen.findByRole('option', { name: 'Otro turno escolar' });
  fireEvent.change(screen.getByLabelText('Ficha donde devolver los resultados'), {
    target: { value: otro },
  });
  r.revisar(2);
  expect(screen.getByLabelText('Ficha donde devolver los resultados')).toHaveValue(otro);
  expect(screen.getByRole('button', { name: 'Guardar destino' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Revisé la nueva versión' }));
  fireEvent.click(screen.getByLabelText('Revisé la ficha elegida y quiero vincular esta tarea.'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar destino' }));
  expect(m.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      cuerpo: expect.objectContaining({ fichaId: otro, revision: 2 }) as unknown,
    }),
    expect.any(Object),
  );
});
it('elige sin enlaces, conserva selección al buscar y confirma de nuevo al quitar el destino', async () => {
  montar();
  fireEvent.click(await screen.findByText('Elegir ficha de devolución'));
  await screen.findByRole('option', { name: 'Otro turno escolar' });
  const selector = screen.getByLabelText('Ficha donde devolver los resultados');
  fireEvent.change(selector, { target: { value: otro } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar destino' }));
  expect(m.mutate).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Buscar entre tus fichas editables'), {
    target: { value: 'Otro' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar fichas' }));
  await waitFor(() => {
    expect(m.get).toHaveBeenCalledWith('/api/v1/fichas/editables?buscar=Otro', expect.any(Object));
  });
  expect(selector).toHaveValue(otro);
  fireEvent.click(screen.getByLabelText('Revisé la ficha elegida y quiero vincular esta tarea.'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar destino' }));
  expect(m.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      ruta: '/1/tareas/2/ficha',
      cuerpo: expect.objectContaining({ fichaId: otro, revision: 1 }) as unknown,
    }),
    expect.any(Object),
  );
  m.mutate.mockClear();
  fireEvent.change(selector, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar destino' }));
  expect(m.mutate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText('Quiero dejar esta tarea sin ficha de devolución.'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar destino' }));
  expect(m.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ cuerpo: expect.objectContaining({ fichaId: null }) as unknown }),
    expect.any(Object),
  );
});
it('un error permite reintentar y no reemplaza el destino guardado', async () => {
  m.get.mockImplementation((ruta: string) =>
    ruta.includes('/editables')
      ? Promise.reject(new Error('Sin conexión'))
      : Promise.resolve({ fichaId: id, titulo: 'Llegar a tiempo a la escuela' }),
  );
  montar();
  fireEvent.click(await screen.findByText('Elegir ficha de devolución'));
  await screen.findByText('No pudimos actualizar las fichas. Conservamos tu selección.');
  expect(screen.getByLabelText('Ficha donde devolver los resultados')).toHaveValue(id);
  expect(screen.getByRole('button', { name: 'Reintentar fichas' })).toBeInTheDocument();
});
