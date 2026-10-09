import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AporteDirectoMapa } from '../AporteDirectoMapa';

import type { ContribucionInput } from '@v2/shared';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { useAuth } from '~/lib/auth/use-auth';
import { useProvincias } from '~/lib/queries/open-data';
import { useCampana, usePublicarAporte } from '~/lib/queries/participacion';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('~/lib/queries/open-data', () => ({ useProvincias: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({ useCampana: vi.fn(), usePublicarAporte: vi.fn() }));

const id = 'af81507f-f3fb-4a80-99f3-28f0f2377947';
const campaña = {
  id,
  slug: 'cuidar-la-comunidad',
  revision: 3,
  estado: 'abierta',
  contrato: {
    titulo: 'Cuidar en nuestra comunidad ideal',
    responsable: 'Equipo de cuidado',
    fechaDevolucion: '2099-11-05',
  },
};
const nacional = {
  id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
  slug: 'mi-argentina-ideal',
  revision: 1,
  estado: 'abierta',
  contrato: {
    titulo: 'Mi Argentina ideal',
    responsable: 'Equipo ¡BASTA!',
    fechaDevolucion: '2099-12-20',
  },
};
/** Lo que el servidor sabe: por slug o por id. Lo que no está responde 404. */
const campanas = new Map<string, unknown>();
const publicar =
  vi.fn<
    (
      aporte: ContribucionInput,
      opciones?: { onSuccess?: (respuesta: ReciboParticipacion) => void },
    ) => void
  >();
const cuenta = (usuario: number | null) =>
  vi.mocked(useAuth).mockReturnValue({
    user: usuario ? { id: usuario } : null,
    isLoading: false,
  } as unknown as ReturnType<typeof useAuth>);
function servidor() {
  vi.mocked(useCampana).mockImplementation(((pedida?: string) => {
    const data = pedida ? campanas.get(pedida) : undefined;
    return { data, isLoading: false, isPending: false, isError: Boolean(pedida) && !data };
  }) as unknown as typeof useCampana);
}
function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const dibujar = () => (
    <QueryClientProvider client={qc}>
      <AporteDirectoMapa />
    </QueryClientProvider>
  );
  const vista = render(dibujar());
  return { ...vista, qc, volver: () => { vista.rerender(dibujar()); } };
}
function completar() {
  fireEvent.click(screen.getByRole('button', { name: 'basta' }));
  fireEvent.change(screen.getByLabelText('Tu aporte'), {
    target: { value: 'Quiero caminar por mi barrio sin renunciar a disfrutarlo con otros.' },
  });
  fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/));
}
const enviar = () => fireEvent.click(screen.getByRole('button', { name: /Publicar mi aporte/ }));
const recibo = {
  idPublico: id,
  tipo: 'basta',
  estado: 'enviada',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
  engrosado: 'La precisión publicada protege el lugar.',
};

beforeEach(() => {
  vi.clearAllMocks();
  publicar.mockReset();
  campanas.clear();
  campanas.set(id, campaña);
  campanas.set('cuidar-la-comunidad', campaña);
  campanas.set('mi-argentina-ideal', nacional);
  cuenta(11);
  servidor();
  window.history.replaceState(null, '', `/el-mapa?campana=${id}&edicion=3`);
  vi.mocked(usePublicarAporte).mockReturnValue({
    mutate: publicar,
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof usePublicarAporte>);
  vi.mocked(useProvincias).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
    typeof useProvincias
  >);
});

describe('Aportar desde el instrumento conserva contexto y autoría', () => {
  it('publica campaña, edición y cuenta elegidas con el mismo ID al reintentar', () => {
    montar();
    completar();
    enviar();
    enviar();
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
    expect(screen.getByText(/edición 3\./)).toBeInTheDocument();
    expect(screen.getByText(/Tu aporte entra en esta campaña cuando lo publiques/)).toBeInTheDocument();
  });

  it('una campaña cerrada no recibe el primer envío, dice por qué y no pierde el texto', () => {
    campanas.set(id, { ...campaña, estado: 'cerrada' });
    montar();
    completar();
    expect(screen.getByRole('button', { name: /Publicar mi aporte/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    enviar();
    expect(publicar).not.toHaveBeenCalled();
    // El motivo está a la vista, junto al botón.
    expect(screen.getAllByText(/Esta edición no recibe aportes ahora/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Tu aporte')).toHaveValue(
      'Quiero caminar por mi barrio sin renunciar a disfrutarlo con otros.',
    );
  });

  it('sin campaña pedida entra a la campaña nacional «Mi Argentina ideal»', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    cuenta(null);
    montar();
    expect(
      screen.getByText(/Tu aporte va a entrar en la campaña nacional «Mi Argentina ideal»/),
    ).toBeInTheDocument();
    completar();
    enviar();
    expect(publicar.mock.calls[0]?.[0]).toMatchObject({
      campanaId: nacional.id,
      edicion: 1,
      cuentaEsperada: null,
      senal: { provinceId: null, cityId: null, punto: null, cedeLicencia: false },
    });
  });

  it('si la campaña nacional todavía no existe publica sin campaña y no bloquea nada', () => {
    campanas.delete('mi-argentina-ideal');
    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    montar();
    expect(screen.getByText(/se publica en el mapa, sin campaña/)).toBeInTheDocument();
    completar();
    expect(screen.getByRole('button', { name: /Publicar mi aporte/ })).not.toHaveAttribute(
      'aria-disabled',
    );
    enviar();
    expect(publicar.mock.calls[0]?.[0]).toMatchObject({ campanaId: null, edicion: null });
  });

  it('si la campaña nacional no está abierta también publica sin campaña', () => {
    campanas.set('mi-argentina-ideal', { ...nacional, estado: 'pausada' });
    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    montar();
    completar();
    enviar();
    expect(publicar.mock.calls[0]?.[0]).toMatchObject({ campanaId: null, edicion: null });
  });

  it('cambiar la cuenta no cambia el payload de un intento que perdió su respuesta', () => {
    const vista = montar();
    completar();
    enviar();
    const original = publicar.mock.calls[0]?.[0];
    cuenta(22);
    vista.volver();
    enviar();
    expect(publicar.mock.calls[1]?.[0]).toEqual(original);
    expect(publicar.mock.calls[1]?.[0].cuentaEsperada).toBe(11);
    expect(screen.getByText(/La cuenta actual no recibe esa autoría/)).toBeInTheDocument();
  });

  it('el recibo reutiliza limpieza, autoría y precisión del formulario, y actualiza lectores antiguos', () => {
    publicar.mockImplementation((_entrada, opciones) => opciones?.onSuccess?.(recibo));
    const vista = montar();
    const invalidar = vi.spyOn(vista.qc, 'invalidateQueries');
    completar();
    enviar();
    expect(screen.getByLabelText('Tu aporte')).toHaveValue('');
    expect(screen.getByText('Recibido')).toBeInTheDocument();
    expect(screen.getByText('La precisión publicada protege el lugar.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi aporte y cómo sigue →' })).toHaveAttribute(
      'href',
      `/senal/${id}`,
    );
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['open-data'] });
  });

  it('el recibo cuenta lo que pasó: otra campaña, la nacional o ninguna', () => {
    publicar.mockImplementation((_entrada, opciones) => opciones?.onSuccess?.(recibo));
    const otra = montar();
    completar();
    enviar();
    expect(
      screen.getByText(
        /Tu aporte entró en la campaña «Cuidar en nuestra comunidad ideal»\. Equipo de cuidado, que la coordina, va a publicar una devolución el 5 de noviembre de 2099 con lo que se leyó\./,
      ),
    ).toBeInTheDocument();
    otra.unmount();

    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    const nacionalVista = montar();
    completar();
    enviar();
    expect(
      screen.getByText(
        /Tu aporte entró en la campaña nacional «Mi Argentina ideal»\. Equipo ¡BASTA!, que la coordina, va a publicar una devolución el 20 de diciembre de 2099 con lo que se leyó\./,
      ),
    ).toBeInTheDocument();
    nacionalVista.unmount();

    campanas.delete('mi-argentina-ideal');
    montar();
    completar();
    enviar();
    expect(
      screen.getByText(
        'Tu aporte quedó publicado en el mapa. Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo.',
      ),
    ).toBeInTheDocument();
  });

  it('puede recuperar el intento original después de que otra edición dejó de recibir aportes', () => {
    const vista = montar();
    completar();
    enviar();
    const original = publicar.mock.calls[0]?.[0];
    campanas.set(id, { ...campaña, revision: 4, estado: 'pausada' });
    vista.volver();
    enviar();
    expect(publicar.mock.calls[1]?.[0]).toEqual(original);
  });

  it('un contexto fallido no desvía el aporte a la campaña nacional ni a ninguna otra', () => {
    campanas.delete(id);
    montar();
    completar();
    enviar();
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getAllByText(/No pudimos comprobar esta campaña/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/campaña nacional/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tu aporte')).not.toHaveValue('');
  });

  it('una edición inválida del enlace conserva el aporte sin reemplazarla por la vigente', () => {
    window.history.replaceState(null, '', `/el-mapa?campana=${id}&edicion=3.5`);
    montar();
    completar();
    enviar();
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getAllByText(/La edición del enlace no es válida/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Tu aporte')).not.toHaveValue('');
  });

  it('lee la campaña del enlace en vivo: si el enlace cambia con el panel abierto, publica en la nueva', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    montar();
    completar();
    act(() => {
      window.history.replaceState(null, '', `/el-mapa?participar=directo&campana=${id}&edicion=3`);
    });
    expect(screen.getByText(/Cuidar en nuestra comunidad ideal/)).toBeInTheDocument();
    enviar();
    expect(publicar.mock.calls[0]?.[0]).toMatchObject({ campanaId: id, edicion: 3 });
  });
});
