import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DescargarDatos } from './DescargarDatos';

import type { SolicitudExportacion, TrabajoExportacion } from '@v2/shared';

const mocks = vi.hoisted(() => ({ get: vi.fn(), escribir: vi.fn() }));
vi.mock('~/lib/api', () => ({
  api: { get: mocks.get },
  ApiError: class ApiError extends Error {},
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: mocks.escribir }));
const base: TrabajoExportacion = {
  id: '18ce0446-0ba8-4298-ae9c-bd4d80fdaacb',
  estado: 'solicitado',
  formato: 'csv',
  corte: '2026-10-08T00:00:00.000Z',
  venceEn: '2026-10-09T00:00:00.000Z',
  registros: 0,
  total: 510,
  bytes: 0,
  mensaje: null,
  archivoUrl: null,
};
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  mocks.get.mockResolvedValue(base);
});
describe('Descargas públicas desacopladas', () => {
  it('una respuesta tardía conserva su alcance original y no aparece como archivo de otros filtros', async () => {
    let resolver: (v: TrabajoExportacion) => void = (_v) => {
      throw new Error('Falta iniciar el pedido');
    };
    mocks.escribir.mockImplementation(
      () =>
        new Promise<TrabajoExportacion>((r) => {
          resolver = r;
        }),
    );
    const vista = render(<DescargarDatos consulta={{ tema: 'educación' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Descargar estos datos' }));
    await waitFor(() => {
      expect(mocks.escribir).toHaveBeenCalledOnce();
    });
    vista.rerender(<DescargarDatos consulta={{ tema: 'cuidados' }} />);
    await act(async () => {
      resolver(base);
      await Promise.resolve();
    });
    expect(mocks.get).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Descargar estos datos' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('basta-exportacion:[["tema","educación"]]')).toContain(base.id);
  });
  it('pide alcance validado, muestra progreso y ofrece descarga directa sin reunir filas en el navegador', async () => {
    mocks.escribir.mockResolvedValue(base);
    mocks.get.mockResolvedValue({
      ...base,
      estado: 'disponible',
      registros: 510,
      archivoUrl: `/api/v1/exportaciones/trabajos/${base.id}/archivo`,
    });
    render(
      <DescargarDatos
        consulta={{
          tema: 'educación',
          territorio: '8',
          umbral: '0.7',
          k: '12',
          privado: 'ignorado',
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Descargar estos datos' }));
    const enlace = await screen.findByRole('link', { name: 'Descargar ZIP preparado' });
    expect(enlace).toHaveAttribute('href', `/api/v1/exportaciones/trabajos/${base.id}/archivo`);
    // El aviso dice lo que el servidor hace de verdad: avanza mientras la página consulta.
    expect(screen.getByText(/se prepara mientras tengas esta página abierta/)).toBeInTheDocument();
    expect(screen.queryByText(/sigue aunque cierres/)).not.toBeInTheDocument();
    expect(mocks.escribir).toHaveBeenCalledWith(
      'post',
      '/api/v1/exportaciones/trabajos',
      expect.objectContaining({
        formato: 'csv',
        filtros: { tema: 'educación', territorio: 8 },
        analisis: { umbral: 0.7, k: 12 },
      }),
    );
    expect(mocks.get.mock.calls.every(([url]) => String(url).includes('/trabajos/'))).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Archivo completo y disponible');
  });
  it('guarda el pedido antes del envío y reintenta el mismo UUID si se pierde la respuesta, incluso tras recargar', async () => {
    mocks.escribir.mockRejectedValueOnce(new Error('Sin conexión'));
    const primero = render(<DescargarDatos />);
    fireEvent.click(screen.getByRole('button', { name: 'Descargar estos datos' }));
    await screen.findByRole('alert');
    const solicitud = mocks.escribir.mock.calls[0]?.[2] as SolicitudExportacion;
    expect(sessionStorage.getItem('basta-exportacion:[]:solicitud')).toContain(
      solicitud.idSolicitud,
    );
    primero.unmount();
    mocks.escribir.mockResolvedValueOnce(base);
    render(<DescargarDatos />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar el pedido' }));
    await waitFor(() => {
      expect(mocks.escribir).toHaveBeenCalledTimes(2);
    });
    expect(mocks.escribir.mock.calls[1]?.[2]).toEqual(solicitud);
    expect(await screen.findByRole('button', { name: 'Cancelar preparación' })).toBeInTheDocument();
  });
  it('cancela usando el control del pedido y recupera el estado al volver a la página', async () => {
    const idSolicitud = '73e688bc-c251-4f5b-9f16-ea47812f8173';
    sessionStorage.setItem(
      'basta-exportacion:[]',
      JSON.stringify({ id: base.id, idSolicitud, formato: 'jsonl' }),
    );
    mocks.escribir.mockResolvedValue({
      ...base,
      estado: 'fallido',
      mensaje: 'Cancelaste la preparación.',
    });
    render(<DescargarDatos />);
    expect(screen.getByLabelText('Formato de los registros')).toHaveValue('jsonl');
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar preparación' }));
    await waitFor(() => {
      expect(mocks.escribir).toHaveBeenCalledWith(
        'post',
        `/api/v1/exportaciones/trabajos/${base.id}/cancelar`,
        { idSolicitud },
      );
    });
    expect(await screen.findByText('Cancelaste la preparación.')).toBeInTheDocument();
  });
});
