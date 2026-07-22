import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PapelHeader } from '../components/papel/PapelHeader';
import { HeroBasta } from '../pages/Home/sections/HeroBasta';

import { estaDespierto, useDespierto } from './despertar';

import type { ReactNode } from 'react';

const STORAGE_KEY = 'basta_despierto';

/** Sonda mínima: expone si el suscriptor de `useDespierto` ya vio el aviso. */
function Sonda() {
  const despierto = useDespierto();
  return <span data-testid="sonda">{despierto ? 'despierto' : 'dormido'}</span>;
}

/** PapelHeader dispara `useVocesCount` (react-query) — necesita su provider. */
function ConQueryClient({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('despertar — se dispara desde los CTAs canónicos (§10.7)', () => {
  it('el CTA del hero «Dejar mi voz en el mapa» despierta el sitio', () => {
    render(
      <>
        <HeroBasta />
        <Sonda />
      </>,
    );

    expect(estaDespierto()).toBe(false);
    expect(screen.getByText('El sitio está en gris — se enciende con tu primera acción')).toBeInTheDocument();
    expect(screen.getByTestId('sonda')).toHaveTextContent('dormido');

    fireEvent.click(screen.getByRole('link', { name: 'Dejar mi voz en el mapa' }));

    expect(estaDespierto()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.getByTestId('sonda')).toHaveTextContent('despierto');
    expect(
      screen.queryByText('El sitio está en gris — se enciende con tu primera acción'),
    ).not.toBeInTheDocument();
  });

  it('el CTA del header «Sembrar tu voz» despierta el sitio', () => {
    render(
      <ConQueryClient>
        <PapelHeader />
        <Sonda />
      </ConQueryClient>,
    );

    expect(estaDespierto()).toBe(false);
    expect(screen.getByTestId('sonda')).toHaveTextContent('dormido');

    fireEvent.click(screen.getByRole('link', { name: 'Sembrar tu voz' }));

    expect(estaDespierto()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.getByTestId('sonda')).toHaveTextContent('despierto');
  });

  it('la entrada «Sembrar» del menú móvil despierta el sitio y el menú se sigue cerrando', () => {
    render(
      <ConQueryClient>
        <PapelHeader />
        <Sonda />
      </ConQueryClient>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });
    expect(estaDespierto()).toBe(false);

    fireEvent.click(within(menu).getByRole('link', { name: /Sembrar/ }));

    expect(estaDespierto()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.getByTestId('sonda')).toHaveTextContent('despierto');
    // Comportamiento previo intacto: el menú se cierra tras elegir una entrada.
    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();
  });

  it('otras entradas del menú móvil no despiertan el sitio', () => {
    render(
      <ConQueryClient>
        <PapelHeader />
      </ConQueryClient>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });
    fireEvent.click(within(menu).getByRole('link', { name: /Inicio/ }));

    expect(estaDespierto()).toBe(false);
  });

  it('un CTA no canónico del hero («Entender la idea») no despierta el sitio', () => {
    render(<HeroBasta />);

    fireEvent.click(screen.getByRole('link', { name: 'Entender la idea' }));

    expect(estaDespierto()).toBe(false);
  });
});
