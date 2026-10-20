import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { GestionPila } from '../GestionPila';

import type { AporteEnGestion } from '@v2/shared';

const modelo = vi.hoisted(() => ({
  auth: { user: null as { id: number; esAdmin: boolean } | null, isLoading: false },
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => modelo.auth }));

interface Pedido {
  metodo: string;
  ruta: string;
  cuerpo: unknown;
}
let pedidos: Pedido[] = [];
let paginas: Record<string, unknown> = {};

const respuesta = (status: number, data?: unknown) =>
  ({
    ok: status < 300,
    status,
    json: () =>
      data === undefined ? Promise.reject(new SyntaxError('vacío')) : Promise.resolve({ data }),
  }) as unknown as Response;

function servir(ruta: string, init?: RequestInit): Promise<Response> {
  const metodo = init?.method ?? 'GET';
  const cuerpo = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
  pedidos.push({ metodo, ruta, cuerpo });
  if (metodo === 'GET' && ruta in paginas) return Promise.resolve(respuesta(200, paginas[ruta]));
  if (ruta.endsWith('/retencion')) return Promise.resolve(respuesta(204));
  return Promise.resolve(respuesta(404));
}

const ID = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';
const reportado: AporteEnGestion = {
  id: ID,
  texto: 'Que la salita abra de noche.',
  provincia: 'Salta',
  publicadoEn: '2026-10-10T12:00:00.000Z',
  reportes: [
    { motivo: 'insulta', cuentan: 4, noCuentan: 2 },
    { motivo: 'datos_personales', cuentan: 1, noCuentan: 0 },
  ],
  retenido: null,
  ultimaDecision: null,
};
const retenido: AporteEnGestion = {
  ...reportado,
  id: '1f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  texto: 'Otro aporte.',
  reportes: [{ motivo: 'fuera_de_tema', cuentan: 13, noCuentan: 0 }],
  retenido: {
    origen: 'reportes',
    desde: '2026-10-18T12:00:00.000Z',
    motivo: 'Trece reportes de personas distintas',
  },
  ultimaDecision: {
    decision: 'retener',
    motivo: 'Trece reportes de personas distintas',
    fecha: '2026-10-18T12:00:00.000Z',
  },
};

function montar() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <GestionPila />
      </Router>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  pedidos = [];
  paginas = { '/api/v1/gestion/pila': [reportado, retenido] };
  modelo.auth = { user: null, isLoading: false };
  document.cookie = 'eihg_csrf=prueba';
  window.history.replaceState(null, '', '/gestion/pila');
  vi.stubGlobal('fetch', vi.fn(servir));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Gestión de Mirar', () => {
  it('quien no ingresó recibe el enlace para ingresar y nada de la lista', () => {
    montar();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      `/ingresar?volver=${encodeURIComponent('/gestion/pila')}`,
    );
    expect(pedidos).toEqual([]);
  });

  it('quien no administra ve una nota y no pide la lista', () => {
    modelo.auth = { user: { id: 2, esAdmin: false }, isLoading: false };
    montar();
    expect(screen.getByText(/Esta página es de la coordinación de ¡BASTA!\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lo que falta' })).toHaveAttribute(
      'href',
      '/lo-que-falta',
    );
    expect(pedidos).toEqual([]);
  });

  it('la coordinación ve texto, provincia, motivos, reportes que no cuentan, estado y decisión', async () => {
    modelo.auth = { user: { id: 1, esAdmin: true }, isLoading: false };
    montar();
    const fila = (await screen.findByText('«Que la salita abra de noche.»')).closest('li');
    expect(fila).not.toBeNull();
    if (!fila) return;
    expect(within(fila).getByText(/^Salta · publicado el/)).toBeInTheDocument();
    expect(
      within(fila).getByText('Insulta a alguien: 4 que cuentan · 2 que no cuentan'),
    ).toBeInTheDocument();
    expect(within(fila).getByText('Tiene datos de una persona: 1 que cuenta')).toBeInTheDocument();
    expect(within(fila).getByText(/^2 reportes no cuentan/)).toBeInTheDocument();
    expect(within(fila).getByText('En Mirar')).toBeInTheDocument();

    const otra = screen.getByText('«Otro aporte.»').closest('li');
    if (!otra) throw new Error('falta la fila retenida');
    expect(within(otra).getByText(/^Fuera de Mirar por reportes desde el/)).toBeInTheDocument();
    expect(within(otra).getByText(/^Última decisión: se retuvo el/)).toBeInTheDocument();
    expect(within(otra).getByRole('button', { name: 'Devolver' })).toBeInTheDocument();
  });

  it('«Retener ahora» pide un motivo y lo manda', async () => {
    modelo.auth = { user: { id: 1, esAdmin: true }, isLoading: false };
    montar();
    const fila = (await screen.findByText('«Que la salita abra de noche.»')).closest('li');
    if (!fila) throw new Error('falta la fila');
    fireEvent.click(within(fila).getByRole('button', { name: 'Retener ahora' }));
    const confirmar = within(fila).getByRole('button', { name: 'Retener ahora' });
    expect(confirmar).toHaveAttribute('aria-disabled', 'true');
    fireEvent.change(within(fila).getByLabelText('Por qué sale de Mirar'), {
      target: { value: 'Tiene el teléfono de una vecina' },
    });
    fireEvent.click(within(fila).getByRole('button', { name: 'Retener ahora' }));
    await waitFor(() => {
      expect(pedidos.filter((p) => p.metodo === 'POST')).toEqual([
        {
          metodo: 'POST',
          ruta: `/api/v1/gestion/pila/${ID}/retencion`,
          cuerpo: { motivo: 'Tiene el teléfono de una vecina' },
        },
      ]);
    });
  });

  it('«Devolver» manda un DELETE con el motivo', async () => {
    modelo.auth = { user: { id: 1, esAdmin: true }, isLoading: false };
    montar();
    const fila = (await screen.findByText('«Otro aporte.»')).closest('li');
    if (!fila) throw new Error('falta la fila');
    fireEvent.click(within(fila).getByRole('button', { name: 'Devolver' }));
    fireEvent.change(within(fila).getByLabelText('Por qué vuelve a Mirar'), {
      target: { value: 'No insulta a nadie' },
    });
    fireEvent.click(within(fila).getByRole('button', { name: 'Devolver' }));
    await waitFor(() => {
      expect(pedidos.filter((p) => p.metodo === 'DELETE')).toEqual([
        {
          metodo: 'DELETE',
          ruta: `/api/v1/gestion/pila/${retenido.id}/retencion`,
          cuerpo: { motivo: 'No insulta a nadie' },
        },
      ]);
    });
  });

  it('pagina con el cursor que trae la respuesta', async () => {
    modelo.auth = { user: { id: 1, esAdmin: true }, isLoading: false };
    paginas = {
      '/api/v1/gestion/pila': { items: [reportado], siguiente: 'c2' },
      '/api/v1/gestion/pila?cursor=c2': { items: [retenido], siguiente: null },
    };
    montar();
    await screen.findByText('«Que la salita abra de noche.»');
    fireEvent.click(screen.getByRole('button', { name: 'Más aportes' }));
    expect(await screen.findByText('«Otro aporte.»')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Más aportes' })).toBeNull();
  });
});
