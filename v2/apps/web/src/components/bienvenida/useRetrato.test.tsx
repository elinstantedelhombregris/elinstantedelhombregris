import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { instantes } from './instantes';
import { useRetrato } from './useRetrato';

const engine = vi.hoisted(() => ({
  resize: vi.fn(),
  render: vi.fn(),
  interact: vi.fn(),
  endInteraction: vi.fn(),
  clearInteractions: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('./portrait-renderer', () => ({ createPortraitRenderer: vi.fn(() => engine) }));

function Portrait() {
  const { figure, image, canvas, ready } = useRetrato(instantes[0], false);
  return (
    <div ref={figure} data-testid="figure">
      <img ref={image} src="/portrait.webp" alt="Retrato" hidden={ready} />
      <canvas ref={canvas} hidden={!ready} />
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 400,
    height: 480,
    right: 400,
    bottom: 480,
    toJSON: () => ({}),
  });
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ciclo de vida del retrato', () => {
  it('desmonta el motor y no deja eventos activos, incluso con StrictMode', async () => {
    const { unmount } = render(
      <StrictMode>
        <Portrait />
      </StrictMode>,
    );
    await waitFor(() => {
      expect(engine.render).toHaveBeenCalled();
    });
    expect(screen.getByAltText('Retrato')).not.toBeVisible();
    const figure = screen.getByTestId('figure');
    fireEvent.pointerMove(figure, { clientX: 200, clientY: 140 });
    expect(engine.interact).toHaveBeenCalledOnce();
    unmount();
    expect(engine.dispose).toHaveBeenCalledOnce();
    fireEvent.pointerMove(figure, { clientX: 220, clientY: 140 });
    expect(engine.interact).toHaveBeenCalledOnce();
  });
  it('dibuja una pose quieta cuando se pide movimiento reducido', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Portrait />);
    await waitFor(() => {
      expect(engine.render).toHaveBeenCalledWith(
        expect.objectContaining({ reduced: true, assembly: 1, motion: 0 }),
      );
    });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    fireEvent.pointerMove(screen.getByTestId('figure'), { clientX: 200, clientY: 140 });
    expect(engine.interact).not.toHaveBeenCalled();
  });
  it('deja disponible la imagen cuando no puede cargar el renderizador', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(
      new Error('image unavailable'),
    );
    render(<Portrait />);
    await waitFor(() => {
      expect(screen.getByAltText('Retrato')).toBeVisible();
    });
    expect(engine.render).not.toHaveBeenCalled();
  });
});
