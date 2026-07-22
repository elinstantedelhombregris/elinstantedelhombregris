import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PapelHeader } from '../components/papel/PapelHeader';
import { HeroBasta } from '../pages/Home/sections/HeroBasta';

import { estaDespierto, useDespierto } from './despertar';

const STORAGE_KEY = 'basta_despierto';

/** Sonda mínima: expone si el suscriptor de `useDespierto` ya vio el aviso. */
function Sonda() {
  const despierto = useDespierto();
  return <span data-testid="sonda">{despierto ? 'despierto' : 'dormido'}</span>;
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
      <>
        <PapelHeader />
        <Sonda />
      </>,
    );

    expect(estaDespierto()).toBe(false);
    expect(screen.getByTestId('sonda')).toHaveTextContent('dormido');

    fireEvent.click(screen.getByRole('link', { name: 'Sembrar tu voz' }));

    expect(estaDespierto()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.getByTestId('sonda')).toHaveTextContent('despierto');
  });

  it('un CTA no canónico del hero («Entender la idea») no despierta el sitio', () => {
    render(<HeroBasta />);

    fireEvent.click(screen.getByRole('link', { name: 'Entender la idea' }));

    expect(estaDespierto()).toBe(false);
  });
});
