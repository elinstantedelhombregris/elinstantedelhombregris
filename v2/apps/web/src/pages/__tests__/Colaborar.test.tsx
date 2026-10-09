import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Colaborar } from '../Colaborar';

const CODIGO_A = 'a'.repeat(64);
const CODIGO_B = 'b'.repeat(64);
const CAMPANA = '0b7f0f5e-5c1d-4c6e-9a0c-2f6f3e1d8a11';
const FICHA = '5d0e8c3a-77aa-4a49-8a52-6d1b0c9f2e22';
const QUE_ES =
  'Si alguien te invitó a sumarte a una campaña o a una ficha, abrí el enlace que te mandó. El código viaja en el enlace y no se guarda en el servidor.';

interface Invitacion {
  tipo: string;
  objeto: string;
  rol: string;
}
const mocks = vi.hoisted(() => ({
  escribir: vi.fn<(m: string, url: string, cuerpo: { codigo: string }) => Promise<unknown>>(),
  usuario: null as { id: number } | null,
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: mocks.escribir }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: mocks.usuario }) }));

/** El servidor: cada código es una invitación; aceptar siempre responde que sí. */
function servidor(invitaciones: Record<string, Invitacion>) {
  mocks.escribir.mockImplementation((_metodo, url, cuerpo) => {
    if (url.endsWith('/leer')) {
      const i = invitaciones[cuerpo.codigo];
      return i ? Promise.resolve(i) : Promise.reject(new Error('La invitación venció.'));
    }
    return Promise.resolve({ aceptada: true });
  });
}
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Colaborar />
    </QueryClientProvider>,
  );
const abrir = (hash: string) => {
  window.history.replaceState(null, '', `/colaborar${hash}`);
};
const campoCodigo = () => screen.getByLabelText('Código de invitación');
const revisar = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Revisar invitación' }));
};
const aceptar = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Aceptar esta responsabilidad' }));
};

describe('Colaborar: una invitación a una campaña o a una ficha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usuario = { id: 1 };
    abrir(`#${CODIGO_A}`);
  });

  it('dice a qué te invitan antes de pedirte que aceptes', async () => {
    servidor({ [CODIGO_A]: { tipo: 'campana', objeto: CAMPANA, rol: 'editor' } });
    montar();
    revisar();
    expect(
      await screen.findByText(`Te invitan a ser editor de «${CAMPANA}» (campaña).`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Aceptar esta responsabilidad' }),
    ).toBeInTheDocument();
  });

  it('nombra el tipo en castellano y el rol que corresponde', async () => {
    servidor({ [CODIGO_A]: { tipo: 'ficha', objeto: FICHA, rol: 'facilitador' } });
    montar();
    revisar();
    expect(
      await screen.findByText(`Te invitan a ser facilitador de «${FICHA}» (ficha).`),
    ).toBeInTheDocument();
  });

  it('una campaña aceptada lleva a su página, no a la gestión; una ficha, a la ficha', async () => {
    servidor({
      [CODIGO_A]: { tipo: 'campana', objeto: CAMPANA, rol: 'editor' },
      [CODIGO_B]: { tipo: 'ficha', objeto: FICHA, rol: 'editor' },
    });
    montar();
    revisar();
    await screen.findByText(/Te invitan a ser/);
    aceptar();
    expect(await screen.findByRole('link', { name: 'Abrir el proceso →' })).toHaveAttribute(
      'href',
      `/campanas/${CAMPANA}`,
    );
    fireEvent.change(campoCodigo(), { target: { value: CODIGO_B } });
    revisar();
    await screen.findByText(/Te invitan a ser editor de «5d0e/);
    aceptar();
    expect(await screen.findByRole('link', { name: 'Abrir el proceso →' })).toHaveAttribute(
      'href',
      `/fichas/${FICHA}`,
    );
  });

  it('con otro código la segunda invitación se puede aceptar: lo aceptado antes no se arrastra', async () => {
    servidor({
      [CODIGO_A]: { tipo: 'campana', objeto: CAMPANA, rol: 'editor' },
      [CODIGO_B]: { tipo: 'ficha', objeto: FICHA, rol: 'facilitador' },
    });
    montar();
    revisar();
    await screen.findByText(/Te invitan a ser/);
    aceptar();
    await screen.findByRole('link', { name: 'Abrir el proceso →' });

    fireEvent.change(campoCodigo(), { target: { value: CODIGO_B } });
    expect(screen.queryByRole('link', { name: 'Abrir el proceso →' })).toBeNull();
    expect(screen.queryByText(/Te invitan a ser/)).toBeNull();
    revisar();
    await screen.findByText(`Te invitan a ser facilitador de «${FICHA}» (ficha).`);
    expect(
      screen.getByRole('button', { name: 'Aceptar esta responsabilidad' }),
    ).toBeInTheDocument();
    aceptar();
    await waitFor(() => {
      expect(mocks.escribir).toHaveBeenCalledWith('post', '/api/v1/equipo/invitaciones/aceptar', {
        codigo: CODIGO_B,
      });
    });
    expect(await screen.findByRole('link', { name: 'Abrir el proceso →' })).toHaveAttribute(
      'href',
      `/fichas/${FICHA}`,
    );
  });

  it('abrir un segundo enlace en la misma pestaña (cambia sólo el fragmento) reinicia la pantalla', async () => {
    servidor({
      [CODIGO_A]: { tipo: 'campana', objeto: CAMPANA, rol: 'editor' },
      [CODIGO_B]: { tipo: 'ficha', objeto: FICHA, rol: 'editor' },
    });
    montar();
    revisar();
    await screen.findByText(/Te invitan a ser/);
    aceptar();
    await screen.findByRole('link', { name: 'Abrir el proceso →' });

    abrir(`#${CODIGO_B}`);
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(campoCodigo()).toHaveValue(CODIGO_B);
    expect(screen.queryByRole('link', { name: 'Abrir el proceso →' })).toBeNull();
    revisar();
    await screen.findByText(`Te invitan a ser editor de «${FICHA}» (ficha).`);
    expect(
      screen.getByRole('button', { name: 'Aceptar esta responsabilidad' }),
    ).toBeInTheDocument();
  });

  it('un error de la invitación anterior no queda pegado al código nuevo', async () => {
    servidor({});
    montar();
    revisar();
    expect(await screen.findByText('La invitación venció.')).toBeInTheDocument();
    fireEvent.change(campoCodigo(), { target: { value: CODIGO_B } });
    expect(screen.queryByText('La invitación venció.')).toBeNull();
  });

  describe('sin una invitación en el enlace', () => {
    it('explica en una frase qué es la página', () => {
      abrir('');
      servidor({});
      montar();
      expect(screen.getByText(QUE_ES)).toBeInTheDocument();
    });
    it('la explica también a quien todavía no ingresó', () => {
      abrir('');
      mocks.usuario = null;
      servidor({});
      montar();
      expect(screen.getByText(QUE_ES)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Ingresar' })).toBeInTheDocument();
    });
    it('con la invitación en el fragmento no hace falta explicarla', () => {
      servidor({});
      montar();
      expect(screen.queryByText(QUE_ES)).toBeNull();
      expect(campoCodigo()).toHaveValue(CODIGO_A);
    });
    it('el código nunca sale del fragmento hacia una URL con query', () => {
      mocks.usuario = null;
      servidor({});
      montar();
      expect(screen.getByRole('link', { name: 'Ingresar' }).getAttribute('href')).not.toContain(
        CODIGO_A,
      );
    });
  });
});
