import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BienvenidaInstante } from './BienvenidaInstante';
import { EntradaInstante } from './EntradaInstante';
import { instantes } from './instantes';

vi.mock('./useRetrato', () => ({
  useRetrato: () => ({
    figure: { current: null },
    image: { current: null },
    canvas: { current: null },
    ready: false,
    quieto: true,
  }),
}));

beforeEach(() => {
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open');
  });
});

describe('BienvenidaInstante', () => {
  it.each(['cruz', 'seguir', 'Escape'])('cierra directamente sobre la landing con %s', (action) => {
    const close = vi.fn();
    const { container } = render(<BienvenidaInstante onClose={close} initialId="01" />);
    const dialog = screen.getByRole('dialog');
    if (action === 'Escape') fireEvent(dialog, new Event('cancel', { cancelable: true }));
    else
      fireEvent.click(
        screen.getByRole('button', {
          name: action === 'cruz' ? 'Cerrar e ir a la landing' : /Seguir mi camino/,
        }),
      );
    expect(close).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.pt-home,.pt-reading,.ei-home,.ei-reading')).toBeNull();
  });
  it('recorre las 50 citas con su enlace real y el retrato a la izquierda', () => {
    render(<BienvenidaInstante onClose={vi.fn()} initialId="01" />);
    for (const entry of instantes) {
      expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', entry.layout);
      expect(document.querySelector('.pt-edition')).toHaveTextContent(`${entry.id} / 50`);
      expect(document.querySelector('blockquote')).toHaveClass('pt-quote');
      if (entry.quote.length > 85)
        expect(document.querySelector('blockquote')).toHaveClass('pt-long');
      expect(document.querySelector('blockquote')?.textContent).toContain(entry.quote);
      expect(screen.getByRole('link', { name: /Leer el texto/ })).toHaveAttribute(
        'href',
        entry.url,
      );
      fireEvent.click(screen.getByRole('button', { name: /Otro instante/ }));
    }
    expect(document.querySelector('blockquote')?.textContent).toContain(instantes[0].quote);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver colección')).not.toBeInTheDocument();
  });
  it('mantiene la lectura disponible con el retrato estático', () => {
    const close = vi.fn();
    render(<BienvenidaInstante onClose={close} initialId="23" />);
    expect(screen.getByRole('img')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Pausar/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Leer el texto/ }));
    expect(close).toHaveBeenCalledOnce();
  });
  it('restaura el scroll del documento al desmontarse', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = render(
      <StrictMode>
        <BienvenidaInstante onClose={vi.fn()} />
      </StrictMode>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });
  it('no vuelve a abrir la bienvenida al regresar a la portada durante la misma carga', async () => {
    const first = render(
      <StrictMode>
        <EntradaInstante />
      </StrictMode>,
    );
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar e ir a la landing' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    first.unmount();
    render(<EntradaInstante />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
