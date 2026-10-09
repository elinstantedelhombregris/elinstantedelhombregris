import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Sembrar } from '../Sembrar';

import { usePlantarSemilla } from '~/lib/queries/semillas';

vi.mock('~/lib/queries/semillas', () => ({
  usePlantarSemilla: vi.fn(),
}));

const mockPlantar = vi.mocked(usePlantarSemilla);

type OnSuccess = (res: { id: number; createdAt: string }) => void;
type MutateComoLoLlamaElComponente = (
  input: { basta: string; sueno: string; compromiso: string },
  opciones?: { onSuccess?: OnSuccess },
) => void;
const mutate = vi.fn<MutateComoLoLlamaElComponente>();

function armarMutacion(extra: Partial<ReturnType<typeof usePlantarSemilla>> = {}) {
  mockPlantar.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
    ...extra,
  } as ReturnType<typeof usePlantarSemilla>);
}

/** Completa los 3 pasos del asistente en pantalla — helper de este composer. */
function completarAsistente() {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Sueño con algo.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Me comprometo a algo.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Plantar mi semilla' }));
}

describe('Sembrar (composer, página papel 2.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    armarMutacion();
  });

  it('sin semilla guardada: portada en estado asistente, asistente visible, certificado ausente', () => {
    render(<Sembrar />);

    expect(screen.getByText('Sembrar · 3 pasos · 2 minutos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Tu semilla.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tu basta' })).toBeInTheDocument();
    expect(screen.queryByText(/Semilla N°/)).not.toBeInTheDocument();
  });

  it('completar el asistente muestra el certificado, oculta el asistente, cambia el kicker y persiste en localStorage', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 1234, createdAt: '2026-07-24T12:00:00.000Z' });
    });
    render(<Sembrar />);

    completarAsistente();

    expect(screen.getByText(/Semilla N° 1\.234/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Tu basta' })).not.toBeInTheDocument();
    expect(screen.getByText('Sembrar · plantada')).toBeInTheDocument();

    const guardada = window.localStorage.getItem('basta_semilla');
    expect(guardada).not.toBeNull();
    const parsed = JSON.parse(guardada ?? '') as { id: number; basta: string };
    expect(parsed.id).toBe(1234);
    expect(parsed.basta).toBe('Basta de todo.');
  });

  it('con semilla pre-guardada en localStorage: monta directo en el certificado (la vuelta)', () => {
    window.localStorage.setItem(
      'basta_semilla',
      JSON.stringify({
        id: 42,
        fecha: '2026-07-01T00:00:00.000Z',
        basta: 'Ya estaba.',
        sueno: 'Ya estaba.',
        compromiso: 'Ya estaba.',
      }),
    );

    render(<Sembrar />);

    expect(screen.getByText(/Semilla N° 42/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Tu basta' })).not.toBeInTheDocument();
  });

  it('Plantar otra vuelve al asistente en el paso 1 con el storage vacío', () => {
    window.localStorage.setItem(
      'basta_semilla',
      JSON.stringify({
        id: 42,
        fecha: '2026-07-01T00:00:00.000Z',
        basta: 'Ya estaba.',
        sueno: 'Ya estaba.',
        compromiso: 'Ya estaba.',
      }),
    );
    render(<Sembrar />);

    fireEvent.click(screen.getByRole('button', { name: 'Plantar otra' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Tu basta' })).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
    expect(window.localStorage.getItem('basta_semilla')).toBeNull();
  });

  it('la acción va primero: el asistente queda antes que la explicación de ir más lejos', () => {
    render(<Sembrar />);

    const paso = screen.getByRole('heading', { level: 2, name: 'Tu basta' });
    const masLejos = screen.getByRole('heading', {
      level: 2,
      name: '¿Querés llevar tu compromiso más lejos?',
    });
    expect(paso.compareDocumentPosition(masLejos) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(/Una voluntad puede sostener una prueba/)).not.toBeInTheDocument();
  });

  it('la explicación son dos frases simples y sus enlaces dicen adónde llevan', () => {
    render(<Sembrar />);

    expect(
      screen.getByText(
        'Tu semilla es un compromiso personal. Si querés probar algo con otras personas, elegí una ficha y sumate.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Encontrar una ficha para probar' })).toHaveAttribute(
      'href',
      '/fichas',
    );
    expect(screen.getByRole('link', { name: 'Volver a Mi espacio' })).toHaveAttribute(
      'href',
      '/mi-espacio',
    );
    expect(document.body.textContent).not.toMatch(/criterios de pausa|mis procesos/i);
  });

  it('también aparece después de plantar, debajo del certificado', () => {
    window.localStorage.setItem(
      'basta_semilla',
      JSON.stringify({
        id: 42,
        fecha: '2026-07-01T00:00:00.000Z',
        basta: 'Ya estaba.',
        sueno: 'Ya estaba.',
        compromiso: 'Ya estaba.',
      }),
    );
    render(<Sembrar />);

    const certificado = screen.getByText(/Semilla N° 42/);
    const masLejos = screen.getByRole('heading', { name: '¿Querés llevar tu compromiso más lejos?' });
    expect(certificado.compareDocumentPosition(masLejos) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('mata el chrome v1-port: sin "Seis principios", sin glass ni gradient-text', () => {
    const { container } = render(<Sembrar />);

    expect(screen.queryByText(/Seis principios/)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
  });
});
