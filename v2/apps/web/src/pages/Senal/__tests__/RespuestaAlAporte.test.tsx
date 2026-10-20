import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RespuestaAlAporte } from '../RespuestaAlAporte';

import type { OpinionDeAporte } from '@v2/shared';

import { recordarProvincia } from '~/lib/queries/pila';

vi.mock('../BotonAdherir', () => ({
  BotonAdherir: () => <button type="button">A mí también me pasa</button>,
}));

const ID = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';

interface Pedido {
  metodo: string;
  ruta: string;
  cuerpo: unknown;
}
let pedidos: Pedido[] = [];
let enMirar: OpinionDeAporte = { enMirar: true, miOpinion: 'desacuerdo' };

const respuesta = (status: number, data: unknown) =>
  ({
    ok: status < 300,
    status,
    json: () => Promise.resolve(status < 300 ? { data } : data),
  }) as unknown as Response;

function servir(ruta: string, init?: RequestInit): Promise<Response> {
  const cuerpo = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
  pedidos.push({ metodo: init?.method ?? 'GET', ruta, cuerpo });
  if (ruta === `/api/v1/pila/aportes/${ID}`) return Promise.resolve(respuesta(200, enMirar));
  if (ruta === `/api/v1/pila/opiniones/${ID}`)
    return Promise.resolve(respuesta(200, { coinciden: 1, regionCompleta: null }));
  return Promise.resolve(respuesta(404, { error: { code: 'NO', message: 'No.' } }));
}

function montar(props: Partial<Parameters<typeof RespuestaAlAporte>[0]> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <RespuestaAlAporte
        idPublico={ID}
        esDeseo
        esPropio={false}
        adhesiones={{ total: 0, mia: false }}
        {...props}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  pedidos = [];
  enMirar = { enMirar: true, miOpinion: 'desacuerdo' };
  recordarProvincia(undefined);
  document.cookie = 'eihg_csrf=prueba';
  vi.stubGlobal('fetch', vi.fn(servir));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/senal con un deseo en Mirar', () => {
  it('muestra las tres respuestas con la propia marcada, en lugar de la adhesión', async () => {
    montar();
    const yoNo = await screen.findByRole('button', { name: 'Yo no' });
    expect(yoNo).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Yo también' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.queryByRole('button', { name: 'A mí también me pasa' })).toBeNull();
  });

  it('cambiar la respuesta la manda y la marca sin esperar', async () => {
    recordarProvincia(17);
    montar();
    fireEvent.click(await screen.findByRole('button', { name: 'Yo también' }));
    expect(screen.getByRole('button', { name: 'Yo también' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await waitFor(() => {
      expect(pedidos.filter((p) => p.metodo === 'PUT')).toEqual([
        {
          metodo: 'PUT',
          ruta: `/api/v1/pila/opiniones/${ID}`,
          cuerpo: { valor: 'acuerdo', provinciaId: 17 },
        },
      ]);
    });
  });

  it('un deseo que no está en Mirar sigue con la adhesión', async () => {
    enMirar = { enMirar: false, miOpinion: null };
    montar();
    expect(await screen.findByRole('button', { name: 'A mí también me pasa' })).toBeInTheDocument();
  });

  it('un hecho ni pregunta: sigue con la adhesión', () => {
    montar({ esDeseo: false });
    expect(screen.getByRole('button', { name: 'A mí también me pasa' })).toBeInTheDocument();
    expect(pedidos).toEqual([]);
  });

  it('el aporte propio no se contesta a sí mismo', async () => {
    montar({ esPropio: true });
    expect(await screen.findByText(/Es tu aporte/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yo también' })).toBeNull();
  });
});
