import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CertificadoSemilla } from '../sections/CertificadoSemilla';

import type { SemillaGuardada } from '../sembrar-data';

const SEMILLA: SemillaGuardada = {
  id: 1234,
  fecha: '2026-07-24T12:00:00.000Z',
  basta: 'Basta de la mentira cómoda.',
  sueno: 'Sueño con un país que se planta.',
  compromiso: 'Me comprometo a no mirar para otro lado.',
};

describe('CertificadoSemilla', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    // Solo se pisa `clipboard` (no el navigator entero) para no perder el
    // resto de la API que happy-dom/testing-library necesitan.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    writeText.mockClear();
  });

  it('datos reales: heading con id y fecha es-AR, tres frases entre comillas angulares, etiquetas con su color semántico', () => {
    render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Semilla N° 1.234 — 24 de julio de 2026' }),
    ).toBeInTheDocument();

    expect(screen.getByText('«Basta de la mentira cómoda.»')).toBeInTheDocument();
    expect(screen.getByText('«Sueño con un país que se planta.»')).toBeInTheDocument();
    expect(screen.getByText('«Me comprometo a no mirar para otro lado.»')).toBeInTheDocument();

    expect(screen.getByText('Mi basta')).toHaveClass('text-sello');
    expect(screen.getByText('Mi sueño')).toHaveClass('text-violeta');
    expect(screen.getByText('Mi compromiso')).toHaveClass('text-verde');
  });

  it('sello Plantada presente y sin print:hidden — se imprime', () => {
    render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    const sello = screen.getByText('Plantada');
    expect(sello).toBeInTheDocument();
    expect(sello).not.toHaveClass('print:hidden');
    expect(sello.parentElement).not.toHaveClass('print:hidden');
  });

  it('edición impresa: clase edicion-impresa en la card, folio hidden print:block, acciones y cierre print:hidden', () => {
    const { container } = render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    const card = container.querySelector('.edicion-impresa');
    expect(card).not.toBeNull();

    const folio = screen.getByText(/¡BASTA! · edición del lector ·/);
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const acciones = screen.getByRole('button', { name: 'Copiar para compartir' }).closest('div');
    expect(acciones).toHaveClass('print:hidden');

    const cierre = screen.getByText(/Guardala\. Es tu contrato con vos/).closest('div');
    expect(cierre).toHaveClass('print:hidden');
  });

  it('la semilla SVG está presente, aria-hidden, con tallo anim-semgrow y hojas anim-leafpop', () => {
    const { container } = render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden');

    expect(container.querySelectorAll('.anim-semgrow')).toHaveLength(1);
    expect(container.querySelectorAll('.anim-leafpop')).toHaveLength(2);
  });

  it('copiar: escribe el texto exacto al portapapeles, muta a ✓ Copiada y vuelve tras 2s', async () => {
    vi.useFakeTimers();
    try {
      render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Copiar para compartir' }));

      // Flushea el microtask de writeText().then(...) antes de que corra el setTimeout.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(writeText).toHaveBeenCalledWith(
        [
          'MI SEMILLA ¡BASTA! N° 1.234',
          'Mi basta: Basta de la mentira cómoda.',
          'Mi sueño: Sueño con un país que se planta.',
          'Mi compromiso: Me comprometo a no mirar para otro lado.',
          `Plantá la tuya → ${window.location.origin}/sembrar`,
        ].join('\n'),
      );
      expect(screen.getByRole('button', { name: '✓ Copiada' })).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Copiada al portapapeles');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(screen.getByRole('button', { name: 'Copiar para compartir' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('plantar otra: click llama onPlantarOtra una vez', () => {
    const onPlantarOtra = vi.fn();
    render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={onPlantarOtra} />);

    fireEvent.click(screen.getByRole('button', { name: 'Plantar otra' }));

    expect(onPlantarOtra).toHaveBeenCalledTimes(1);
  });

  it('cierre: copy exacto y link al mapa', () => {
    render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    expect(
      screen.getByText('Guardala. Es tu contrato con vos. Cuando el movimiento te pese, volvé a leerla.'),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Ahora soltá tu voz en el mapa →' });
    expect(link).toHaveAttribute('href', '/el-mapa');
  });

  it('chrome muerto: sin glass, gradient-text, iris-violet ni font-serif', () => {
    const { container } = render(<CertificadoSemilla semilla={SEMILLA} onPlantarOtra={vi.fn()} />);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
