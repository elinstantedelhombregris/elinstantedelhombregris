import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SintesisNacional } from '../../SintesisNacional';
import { EjemploSintesisNacional } from '../Ejemplo';
import { ElegirResultado } from '../ElegirResultado';
import { FormularioSintesis } from '../Formulario';
import { LecturaSintesis } from '../Lectura';

import { edicion } from './fixtures';

import type { ReactNode } from 'react';

import { api } from '~/lib/api';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 4 }, isLoading: false }) }));
vi.mock('~/lib/queries/deliberacion', () => ({
  useVisionCompartida: () => ({
    data: { pages: [{ fichas: [] }] },
    isPending: false,
    isError: false,
    hasNextPage: false,
  }),
}));
const montar = (node: ReactNode) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {node}
    </QueryClientProvider>,
  );
beforeEach(() => {
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});
describe('Síntesis por objetivos', () => {
  it('muestra ausencias, competencias pendientes y trazabilidad; oculta el contenido invalidado', () => {
    const r = render(<LecturaSintesis edicion={edicion} />);
    expect(screen.getByText('Faltan los turnos de la noche por escuchar.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir Agua en casa/ })).toHaveAttribute(
      'href',
      '/fichas/22222222-2222-4222-8222-222222222222#evidencia',
    );
    expect(screen.getByText(/Competencia: Por validar/)).toBeInTheDocument();
    r.rerender(
      <LecturaSintesis
        edicion={{ ...edicion, estado: 'requiere_revision', contenido: null, apoyos: [] }}
      />,
    );
    expect(screen.queryByText('Reducir los cortes de agua')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('contenido se ocultó');
  });
  it('un guardado fallido conserva el formulario y el recibo para reintentar', async () => {
    const guardar = vi.spyOn(api, 'post').mockRejectedValue(new Error('La ficha cambió'));
    if (!edicion.contenido) throw new Error('Falta la fixture');
    montar(<FormularioSintesis inicial={edicion.contenido} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar edición para revisión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La ficha cambió');
    expect(screen.getByLabelText('Título')).toHaveValue(edicion.contenido.titulo);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar edición para revisión' }));
    await waitFor(() => {
      expect(guardar).toHaveBeenCalledTimes(2);
    });
    expect(guardar.mock.calls[0]?.[1]).toEqual(guardar.mock.calls[1]?.[1]);
  });
  it('ofrece resultados de campo revisados con su revisión y conserva la paginación', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      items: [
        { id: 2, titulo: 'Dos encuentros revisados', revision: 3, revisada: true, retirada: false },
        { id: 3, titulo: 'Sin revisar', revision: 1, revisada: false, retirada: false },
      ],
      siguiente: 3,
    });
    const r = edicion.contenido?.referencias[0];
    if (!r) throw new Error('Falta la referencia');
    const cambiar = vi.fn();
    montar(<ElegirResultado referencia={r} cambiar={cambiar} />);
    await screen.findByRole('option', { name: 'Dos encuentros revisados · revisión 3' });
    expect(screen.queryByRole('option', { name: 'Sin revisar' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(cambiar).toHaveBeenCalledWith({ id: 2, revision: 3 });
    expect(screen.getByRole('button', { name: 'Cargar más resultados' })).toBeInTheDocument();
  });
  it('la descarga vuelve al servidor y no exporta texto que fue retirado', async () => {
    window.history.replaceState(null, '', `/sintesis-nacional/${edicion.id}`);
    const get = vi
      .spyOn(api, 'get')
      .mockResolvedValueOnce(edicion)
      .mockResolvedValue({ ...edicion, estado: 'retirada', contenido: null, apoyos: [] });
    montar(<SintesisNacional />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Descargar edición citable (JSON)' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('La edición cambió');
    expect(get).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Reducir los cortes de agua')).not.toBeInTheDocument();
  });
  it('el ejemplo conserva su rótulo y cambia entre situaciones cotidianas', () => {
    render(<EjemploSintesisNacional />);
    fireEvent.click(screen.getByRole('button', { name: 'Conseguir un turno' }));
    expect(screen.getByText(/Ejemplo ficticio/)).toBeInTheDocument();
    expect(screen.getByText(/Distinguir acceso a internet/)).toBeInTheDocument();
  });
});
