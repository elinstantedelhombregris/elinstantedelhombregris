import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { EnsayoLocal } from './EnsayoLocal';

const get = vi.hoisted(() => vi.fn());
vi.mock('~/lib/api', () => ({ api: { get } }));
afterEach(() => {
  vi.clearAllMocks();
});
it('enlaza los objetos persistidos y distingue responsabilidades y datos ficticios', async () => {
  get.mockResolvedValue({
    tipo: 'escuela_local',
    inicio: '2026-10-17',
    cierre: '2026-11-16',
    campanaId: '20000000-0000-4000-8000-000000000001',
    fichaId: '20000000-0000-4000-8000-000000000002',
    iniciativaSlug: 'escolar',
    tareaId: 9,
    clave: 'clave-local',
    cuentas: [{ usuario: 'escuela_coordina', rol: 'Coordinar' }],
  });
  render(<EnsayoLocal />);
  expect(await screen.findByRole('region', { name: 'Práctica con API local' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '3. Abrir la tarea de práctica' })).toHaveAttribute(
    'href',
    '/iniciativas/escolar?seccion=tareas&tarea=9',
  );
  expect(screen.getByRole('link', { name: 'Ver qué volvió a la ficha' })).toHaveAttribute(
    'href',
    '/fichas/20000000-0000-4000-8000-000000000002#resultados-campo',
  );
  expect(screen.getByText(/no mide el transporte/)).toBeInTheDocument();
});
it('no presenta el ensayo como disponible cuando falta la API local', async () => {
  get.mockRejectedValue(new Error('404'));
  const r = render(<EnsayoLocal />);
  await waitFor(() => {
    expect(get).toHaveBeenCalledTimes(1);
  });
  expect(r.container).toBeEmptyDOMElement();
});
it('no muestra credenciales si otro servidor devuelve una respuesta diferente', async () => {
  get.mockResolvedValue({ tipo: 'otro', clave: 'no-mostrar' });
  const r = render(<EnsayoLocal />);
  await waitFor(() => {
    expect(get).toHaveBeenCalledTimes(1);
  });
  expect(r.container).toBeEmptyDOMElement();
});
