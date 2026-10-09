import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelDiseno } from '../PanelDiseno';

const ID = '34b57499-a167-4dda-ae15-f0e0c3c67720';
const modelo = vi.hoisted(() => ({
  user: null as null | { id: number },
  desplazar: vi.fn(),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  escribir: vi.fn(),
  useDisenoFicha: () => ({
    isLoading: false,
    error: null,
    data: {
      afirmaciones: [],
      alternativas: [],
      pruebas: [],
      analisisOpiniones: {
        estado: 'insuficiente',
        motivo: 'Hace falta más conversación.',
        grupos: [],
        condiciones: [],
        participantes: 0,
        incluidos: 0,
        afirmaciones: 0,
        metodo: 'Exploratorio',
      },
    },
  }),
}));

const TITULOS = [
  'Afirmaciones para conversar',
  'Alternativas para comparar',
  'Pruebas chicas para aprender',
];

beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
  Element.prototype.scrollIntoView = modelo.desplazar;
});

function abrir(ruta: string) {
  window.history.replaceState(null, '', ruta);
  return render(<PanelDiseno id={ID} />);
}

describe('Panel de diseño: las partes se pueden enlazar con ?vista=', () => {
  it('sin ?vista= abre las afirmaciones y no arrastra la pantalla', () => {
    abrir(`/fichas/${ID}`);
    expect(screen.getByRole('heading', { name: 'Afirmaciones para conversar' })).toBeVisible();
    expect(modelo.desplazar).not.toHaveBeenCalled();
  });

  it('un enlace con ?vista=alternativas abre esa parte y lleva hasta ella', () => {
    abrir(`/fichas/${ID}?vista=alternativas`);
    expect(screen.getByRole('heading', { name: 'Alternativas para comparar' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Alternativas para comparar' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Afirmaciones para conversar' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(modelo.desplazar).toHaveBeenCalledTimes(1);
  });

  it('una vista que no existe cae en las afirmaciones', () => {
    abrir(`/fichas/${ID}?vista=inventada`);
    expect(screen.getByRole('heading', { name: 'Afirmaciones para conversar' })).toBeVisible();
  });

  it('elegir una pestaña pone la vista en la dirección y cambia el contenido', () => {
    abrir(`/fichas/${ID}`);
    fireEvent.click(screen.getByRole('link', { name: 'Pruebas chicas para aprender' }));
    expect(window.location.search).toBe('?vista=pruebas');
    expect(window.location.hash).toBe('#diseno');
    expect(screen.getByRole('heading', { name: 'Pruebas chicas para aprender' })).toBeVisible();
  });

  it('cada pestaña se llama igual que el título de su parte', () => {
    for (const titulo of TITULOS) {
      const { unmount } = abrir(`/fichas/${ID}`);
      fireEvent.click(screen.getByRole('link', { name: titulo }));
      expect(screen.getByRole('heading', { level: 3, name: titulo })).toBeVisible();
      unmount();
    }
  });

  it('el ingreso desde una parte vuelve a esa misma parte', () => {
    abrir(`/fichas/${ID}?vista=alternativas`);
    expect(screen.getByRole('link', { name: 'Ingresá para proponer una' })).toHaveAttribute(
      'href',
      `/ingresar?volver=${encodeURIComponent(`/fichas/${ID}?vista=alternativas#diseno`)}`,
    );
  });

  it('ninguna parte tiene un título de aforismo', () => {
    abrir(`/fichas/${ID}`);
    expect(screen.queryByText(/El diseño aprende|Aprender a diseñar juntos/)).toBeNull();
  });
});
