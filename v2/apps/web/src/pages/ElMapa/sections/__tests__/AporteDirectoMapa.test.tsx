import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AporteDirectoMapa } from '../AporteDirectoMapa';

import type { ContribucionInput } from '@v2/shared';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { useAuth } from '~/lib/auth/use-auth';
import { useProvincias, useSoltarVoz } from '~/lib/queries/open-data';
import { useCampana, usePublicarAporte } from '~/lib/queries/participacion';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('~/lib/queries/open-data', () => ({ useProvincias: vi.fn(), useSoltarVoz: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({ useCampana: vi.fn(), usePublicarAporte: vi.fn() }));

const id = 'af81507f-f3fb-4a80-99f3-28f0f2377947';
const campaña = {
  id,
  slug: 'cuidar-la-comunidad',
  revision: 3,
  estado: 'abierta',
  contrato: { titulo: 'Cuidar en nuestra comunidad ideal' },
};
const publicar =
  vi.fn<
    (
      aporte: ContribucionInput,
      opciones?: { onSuccess?: (respuesta: ReciboParticipacion) => void },
    ) => void
  >();
const legado = vi.fn();
const cuenta = (usuario: number | null) =>
  vi
    .mocked(useAuth)
    .mockReturnValue({
      user: usuario ? { id: usuario } : null,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuth>);
function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const vista = render(
    <QueryClientProvider client={qc}>
      <AporteDirectoMapa />
    </QueryClientProvider>,
  );
  return { ...vista, qc };
}
function completar() {
  fireEvent.click(screen.getByRole('button', { name: 'basta' }));
  fireEvent.change(screen.getByLabelText('Tu voz'), {
    target: { value: 'Quiero caminar por mi barrio sin renunciar a disfrutarlo con otros.' },
  });
  fireEvent.click(screen.getByLabelText(/Quiero publicar esta voz/));
}
beforeEach(() => {
  vi.clearAllMocks();
  publicar.mockReset();
  cuenta(11);
  window.history.replaceState(null, '', `/el-mapa?campana=${id}&edicion=3`);
  vi.mocked(useCampana).mockReturnValue({
    data: campaña,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useCampana>);
  vi.mocked(usePublicarAporte).mockReturnValue({
    mutate: publicar,
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof usePublicarAporte>);
  vi.mocked(useProvincias).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
    typeof useProvincias
  >);
  vi.mocked(useSoltarVoz).mockReturnValue({
    mutate: legado,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useSoltarVoz>);
});

describe('Aportar desde el instrumento conserva contexto y autoría', () => {
  it('publica campaña, edición y cuenta elegidas con el mismo ID al reintentar', () => {
    montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    const primero = publicar.mock.calls[0]?.[0];
    if (!primero) throw new Error('Falta la contribución.');
    expect(primero).toMatchObject({
      campanaId: id,
      edicion: 3,
      cuentaEsperada: 11,
      fragmentos: [],
      aceptaPublicar: true,
      senal: { tipo: 'basta', cedeLicencia: false },
    });
    expect(primero.senal.idLocal).toMatch(/^[a-f0-9-]{36}$/);
    expect(publicar.mock.calls[1]?.[0]).toEqual(primero);
    expect(legado).not.toHaveBeenCalled();
    expect(screen.getByText(/edición 3 · Abierta/)).toBeInTheDocument();
  });
  it('una campaña cerrada no recibe el primer envío ni pierde el texto', () => {
    vi.mocked(useCampana).mockReturnValue({
      data: { ...campaña, estado: 'cerrada' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampana>);
    montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Esta edición no recibe aportes ahora.');
    expect(screen.getByLabelText('Tu voz')).toHaveValue(
      'Quiero caminar por mi barrio sin renunciar a disfrutarlo con otros.',
    );
  });
  it('sin campaña usa el registro nacional, conserva texto reservado y no inventa ubicación', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=voz');
    cuenta(null);
    montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    const cuerpo = publicar.mock.calls[0]?.[0];
    expect(cuerpo).toMatchObject({
      campanaId: null,
      edicion: null,
      cuentaEsperada: null,
      senal: { provinceId: null, cityId: null, punto: null, cedeLicencia: false },
    });
    expect(screen.getByText(/registro común, sin una campaña elegida/)).toBeInTheDocument();
  });
  it('cambiar la cuenta no cambia el payload de un intento que perdió su respuesta', () => {
    const vista = montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    const original = publicar.mock.calls[0]?.[0];
    cuenta(22);
    vista.rerender(
      <QueryClientProvider client={vista.qc}>
        <AporteDirectoMapa />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(publicar.mock.calls[1]?.[0]).toEqual(original);
    expect(publicar.mock.calls[1]?.[0].cuentaEsperada).toBe(11);
    expect(screen.getByText(/La cuenta actual no recibe esa autoría/)).toBeInTheDocument();
  });
  it('el recibo reutiliza limpieza, autoría y precisión del formulario, y actualiza lectores antiguos', () => {
    const recibo = {
      idPublico: id,
      tipo: 'basta',
      estado: 'enviada',
      precisionPublicada: 'province',
      yaExistia: false,
      avisos: [],
      engrosado: 'La precisión publicada protege el lugar.',
    };
    publicar.mockImplementation((_entrada, opciones) => opciones?.onSuccess?.(recibo));
    const vista = montar();
    const invalidar = vi.spyOn(vista.qc, 'invalidateQueries');
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(screen.getByLabelText('Tu voz')).toHaveValue('');
    expect(screen.getByText('Recibida')).toBeInTheDocument();
    expect(screen.getByText('La precisión publicada protege el lugar.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi voz y cómo sigue →' })).toHaveAttribute(
      'href',
      `/senal/${id}`,
    );
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['open-data'] });
  });
  it('puede recuperar el intento original después de que otra edición dejó de recibir aportes', () => {
    const vista = montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    const original = publicar.mock.calls[0]?.[0];
    vi.mocked(useCampana).mockReturnValue({
      data: { ...campaña, revision: 4, estado: 'pausada' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampana>);
    vista.rerender(
      <QueryClientProvider client={vista.qc}>
        <AporteDirectoMapa />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(publicar.mock.calls[1]?.[0]).toEqual(original);
  });
  it('un contexto fallido no desvía el aporte al alcance nacional', () => {
    vi.mocked(useCampana).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useCampana>);
    montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.queryByText(/Alcance nacional, sin campaña elegida/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tu voz')).not.toHaveValue('');
  });
  it('una edición inválida del enlace conserva el aporte sin reemplazarla por la vigente', () => {
    window.history.replaceState(null, '', `/el-mapa?campana=${id}&edicion=3.5`);
    montar();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByLabelText('Tu voz')).not.toHaveValue('');
  });
});
