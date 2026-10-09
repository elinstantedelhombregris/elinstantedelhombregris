import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TemasDeLaFicha } from '../TemasDeLaFicha';

const modelo = vi.hoisted(() => ({ get: vi.fn<() => Promise<unknown>>() }));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));

const catalogo = Array.from({ length: 10 }, (_, i) => ({
  clave: `tema-${i}`,
  etiqueta: `Tema número ${i}`,
}));
function montar(valor: string[], cambiar = vi.fn()) {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <TemasDeLaFicha valor={valor} cambiar={cambiar} />
    </QueryClientProvider>,
  );
  return cambiar;
}

describe('Temas de la ficha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    modelo.get.mockResolvedValue({ temas: catalogo });
  });

  it('muestra las etiquetas del catálogo como botones que se activan, y guarda las claves', async () => {
    const cambiar = montar(['tema-1']);
    const elegido = await screen.findByRole('button', { name: 'Tema número 1' });
    expect(elegido).toHaveAttribute('aria-pressed', 'true');
    const otro = screen.getByRole('button', { name: 'Tema número 2' });
    expect(otro).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(otro);
    expect(cambiar).toHaveBeenLastCalledWith(['tema-1', 'tema-2']);
    fireEvent.click(elegido);
    expect(cambiar).toHaveBeenLastCalledWith([]);
  });

  it('al llegar a ocho, los no elegidos se bloquean y se dice por qué', async () => {
    const ocho = catalogo.slice(0, 8).map((t) => t.clave);
    montar(ocho);
    const libre = await screen.findByRole('button', { name: 'Tema número 9' });
    expect(libre).toBeDisabled();
    expect(screen.getByText('Elegiste 8 temas, el máximo.')).toBeVisible();
    expect(libre.getAttribute('aria-describedby')).toBe(
      screen.getByText('Elegiste 8 temas, el máximo.').id,
    );
    // Lo ya elegido sigue pudiéndose quitar.
    expect(screen.getByRole('button', { name: 'Tema número 0' })).toBeEnabled();
  });

  it('antes del máximo no hay motivo que mostrar', async () => {
    montar(['tema-0']);
    await screen.findByRole('button', { name: 'Tema número 9' });
    expect(screen.queryByText(/el máximo/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Tema número 9' })).toBeEnabled();
  });

  it('un tema escrito a mano en una ficha vieja se conserva con su texto y se puede quitar', async () => {
    const cambiar = montar(['tema-0', 'educación popular']);
    await screen.findByRole('button', { name: 'Tema número 0' });
    const viejo = screen.getByRole('button', { name: 'Quitar el tema educación popular' });
    expect(viejo).toHaveTextContent('educación popular ×');
    fireEvent.click(viejo);
    expect(cambiar).toHaveBeenLastCalledWith(['tema-0']);
  });

  it('si no se pueden leer los temas, avisa que se puede guardar sin elegirlos', async () => {
    modelo.get.mockRejectedValue(new Error('sin conexión'));
    montar(['algo viejo']);
    expect(
      await screen.findByText('No pudimos leer los temas. Podés guardar la ficha sin elegirlos.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Quitar el tema algo viejo' })).toBeInTheDocument();
  });
});
