import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Colaborar } from '../Colaborar';
import { SeleccionarFuentes } from '../Fichas/SeleccionarFuentes';
import { MisProcesos } from '../MiEspacio/MisProcesos';
import { OpcionesCuenta } from '../MiEspacio/OpcionesCuenta';
import { EditarAporte } from '../Senal/EditarAporte';

import type { ReactElement } from 'react';

import { CompartirProceso } from '~/components/participacion/CompartirProceso';
import { TemaDelAporte } from '~/components/participacion/TemaDelAporte';
const modelo = vi.hoisted(() => ({
  get: vi.fn<() => Promise<unknown>>(),
  escribir: vi.fn<() => Promise<unknown>>(),
}));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));
vi.mock('~/lib/queries/participacion', () => ({
  escribir: modelo.escribir,
  useOperacionPersonal: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 1 } }) }));
const montar = (v: ReactElement) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {v}
    </QueryClientProvider>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  modelo.get.mockResolvedValue({});
  modelo.escribir.mockResolvedValue({});
});
describe('Controles del registro y la continuidad', () => {
  it('compartir conserva una consulta pública sin copiar una reflexión privada', async () => {
    const copiar = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: copiar },
    });
    montar(<CompartirProceso href="/la-radiografia?tema=educación" titulo="Compartir análisis" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir análisis' }));
    await screen.findByRole('status');
    expect(copiar).toHaveBeenCalledWith(expect.stringContaining('/la-radiografia?tema=educaci'));
  });
  it('el texto reservado propio se lee al abrir la gestión y un enunciado con historia permanece protegido', async () => {
    modelo.get.mockResolvedValue({
      texto: 'Una posibilidad que reservé.',
      revision: '2026-10-08T00:00:00Z',
      cedeLicencia: false,
      textoProtegido: true,
    });
    montar(<EditarAporte id="fuente" />);
    expect(modelo.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Corregir mi aporte' }));
    const texto = await screen.findByRole('textbox');
    expect(texto).toHaveValue('Una posibilidad que reservé.');
    expect(texto).toHaveAttribute('readonly');
  });
  it('un tema se elige del vocabulario servido; dejarlo abierto sigue disponible', async () => {
    modelo.get.mockResolvedValue({ temas: [{ clave: 'educación', etiqueta: 'Educación' }] });
    const cambiar = vi.fn();
    montar(<TemaDelAporte valor="" cambiar={cambiar} />);
    await screen.findByRole('option', { name: 'Educación' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'educación' } });
    expect(cambiar).toHaveBeenCalledWith('educación');
    expect(screen.getByRole('option', { name: 'Dejar el tema abierto' })).toBeInTheDocument();
  });
  it('vincular una fuente reservada no inventa ni expone su texto', async () => {
    modelo.get.mockResolvedValue({
      registros: [{ id: 'fuente', tipo: 'sueño', texto: null }],
      siguiente: null,
      total: 1,
    });
    const elegir = vi.fn();
    montar(<SeleccionarFuentes campana={null} elegir={elegir} />);
    await screen.findByText(/Texto reservado/);
    fireEvent.click(screen.getByRole('button', { name: 'Agregar esta voz' }));
    expect(elegir).toHaveBeenCalledWith('fuente');
    expect(screen.getByRole('button', { name: 'Vínculo agregado' })).toBeDisabled();
  });
  it('Mi espacio permite volver a las fichas y campañas a cargo sin un perfil público', () => {
    montar(
      <MisProcesos
        procesos={[
          { id: 'f', tipo: 'ficha', titulo: 'Aprender cerca', href: '/fichas/f', revision: 2 },
        ]}
        puedeArmarFicha
        esAdmin={false}
      />,
    );
    expect(screen.getByRole('link', { name: 'Aprender cerca' })).toHaveAttribute(
      'href',
      '/fichas/f',
    );
  });
  it('cerrar cuenta exige contraseña y frase de confirmación, separado de retirar aportes', () => {
    montar(<OpcionesCuenta salir={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mi cuenta' }));
    expect(
      screen.getByRole('button', { name: 'Cerrar mi cuenta y revocar sesiones' }),
    ).toBeDisabled();
    // El aviso largo pasó a tres viñetas, una por consecuencia.
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Se conservan tus aportes, fichas, campañas/)).toBeInTheDocument();
    expect(modelo.escribir).not.toHaveBeenCalled();
  });
  it('una invitación se revisa antes de poder aceptarla', async () => {
    window.history.replaceState(null, '', '/colaborar#' + 'a'.repeat(64));
    modelo.escribir.mockResolvedValue({ tipo: 'ficha', objeto: 'f', rol: 'editor' });
    montar(<Colaborar />);
    expect(
      screen.queryByRole('button', { name: 'Aceptar esta responsabilidad' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar invitación' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Aceptar esta responsabilidad' }),
      ).toBeInTheDocument(),
    );
    expect(modelo.escribir).toHaveBeenCalledTimes(1);
  });
});
