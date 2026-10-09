import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Equipo } from './Equipo';

const modelo = vi.hoisted(() => ({ get: vi.fn(), escribir: vi.fn(), copiar: vi.fn() }));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));
vi.mock('~/lib/queries/participacion', () => ({ escribir: modelo.escribir }));

const montar = (tipo: 'campana' | 'ficha' = 'campana') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Equipo tipo={tipo} objeto="c1" />
    </QueryClientProvider>,
  );
const pendiente = {
  id: 'i1',
  rol: 'editor',
  aceptadaEn: null,
  revocadaEn: null,
  venceEn: '2999-10-16T15:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  modelo.get.mockResolvedValue([]);
  modelo.escribir.mockResolvedValue({});
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: modelo.copiar.mockResolvedValue(undefined) },
  });
});
describe('Equipo', () => {
  it('habla de la campaña o de la ficha según lo que se cuida', () => {
    const r = montar('campana');
    expect(screen.getByText('Invitar a cuidar esta campaña')).toBeInTheDocument();
    expect(
      screen.getByText(/Publicar la campaña sigue a cargo de quien la coordina/),
    ).toBeInTheDocument();
    r.unmount();
    montar('ficha');
    expect(screen.getByText('Invitar a cuidar esta ficha')).toBeInTheDocument();
    expect(screen.queryByText(/Publicar la campaña/)).not.toBeInTheDocument();
  });
  it('al crear la invitación ofrece copiar el enlace y avisa que se muestra una sola vez', async () => {
    modelo.escribir.mockResolvedValue({ codigo: 'abc123' });
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Crear invitación' }));
    const enlace = await screen.findByLabelText('Enlace privado de invitación');
    expect(enlace).toHaveValue(`${window.location.origin}/colaborar#abc123`);
    expect(screen.getByText('Este enlace se muestra una sola vez.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));
    await waitFor(() => {
      expect(screen.getByText('Enlace copiado.')).toBeInTheDocument();
    });
    expect(modelo.copiar).toHaveBeenCalledWith(`${window.location.origin}/colaborar#abc123`);
  });
  it('revocar pregunta antes y dice qué invitación es; «No, dejarla» no la toca', async () => {
    modelo.get.mockResolvedValue([pendiente]);
    montar();
    fireEvent.click(
      await screen.findByRole('button', { name: /Revocar la invitación de editor, pendiente/ }),
    );
    expect(screen.getByText(/¿Revocar la invitación de editor, pendiente\?/)).toBeInTheDocument();
    expect(modelo.escribir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'No, dejarla' }));
    expect(modelo.escribir).not.toHaveBeenCalled();
    expect(screen.queryByText(/¿Revocar/)).not.toBeInTheDocument();
  });
  it('al confirmar revoca y lo avisa', async () => {
    modelo.get.mockResolvedValue([pendiente]);
    montar();
    fireEvent.click(await screen.findByRole('button', { name: /Revocar la invitación/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, revocar' }));
    await waitFor(() => {
      expect(modelo.escribir).toHaveBeenCalledWith('delete', '/api/v1/equipo/invitaciones/i1');
    });
    expect(await screen.findByText('Invitación de editor revocada.')).toBeInTheDocument();
  });
  it('muestra el vencimiento de una invitación pendiente en palabras', async () => {
    modelo.get.mockResolvedValue([pendiente]);
    montar();
    expect(await screen.findByText(/vence el 16 de octubre de 2999/)).toBeInTheDocument();
  });
});
