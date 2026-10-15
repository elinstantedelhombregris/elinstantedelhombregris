import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { DispositivosCampo } from '../Dispositivos';
const m = vi.hoisted(() => ({
  post: vi.fn(() => Promise.resolve({ token: 'secreto' })),
  del: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [{ id: 'd', nombre: 'Mi teléfono', expira: '2026-11-01', revocado: false }],
    refetch: m.refetch,
  }),
}));
vi.mock('~/lib/api', () => ({ api: { post: m.post, del: m.del } }));
vi.mock('~/lib/queries/participacion', () => ({
  tokenParticipacion: () => Promise.resolve('csrf'),
}));
it('emite con CSRF, permite ocultar la clave y revocar', async () => {
  render(<DispositivosCampo uid={7} />);
  fireEvent.click(screen.getByText('Vincular la app nativa con mis tareas'));
  fireEvent.change(screen.getByLabelText('Nombre del teléfono'), {
    target: { value: 'Mi teléfono' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Generar clave de campo' }));
  await waitFor(() => expect(screen.getByLabelText('Clave de campo')).toHaveValue('secreto'));
  expect(m.post).toHaveBeenCalledWith(
    '/api/campo/dispositivos',
    { nombre: 'Mi teléfono', usuarioId: 7 },
    { csrfToken: 'csrf' },
  );
  fireEvent.click(screen.getByText('Ya la guardé; ocultar clave'));
  expect(screen.queryByLabelText('Clave de campo')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revocar Mi teléfono' }));
  await waitFor(() => {
    expect(m.del).toHaveBeenCalledWith('/api/campo/dispositivos/d', { csrfToken: 'csrf' });
  });
});
