import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PALANCAS_INICIALES, PanelPalancas } from '../simulacion/PanelPalancas';

/**
 * El panel de las palancas.
 *
 * Cinco de las siete mueven algo hoy. `composicion` y `cumplimiento` todavía
 * no las lee el motor —entran con las campañas, rebanada 3— y por eso se
 * muestran deshabilitadas con su razón en vez de esconderse o, peor, de
 * ofrecer un control que no hace nada. Es el mismo criterio con que el nivel
 * «departamento» espera la capa del IGN.
 */
describe('PanelPalancas', () => {
  const render7 = (onCambiar = vi.fn()) => {
    render(<PanelPalancas palancas={PALANCAS_INICIALES} onCambiar={onCambiar} />);
    return onCambiar;
  };

  it('ofrece las cinco palancas que hoy mueven algo', () => {
    render7();
    for (const nombre of [/cuánta gente habla/i, /dónde habla/i, /en cuánto tiempo/i, /resistencia/i, /constancia/i]) {
      expect(screen.getByRole('slider', { name: nombre })).toBeInTheDocument();
    }
  });

  it('mover una palanca avisa con las palancas enteras', () => {
    const onCambiar = render7();
    fireEvent.change(screen.getByRole('slider', { name: /cuánta gente habla/i }), {
      target: { value: '900' },
    });
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(onCambiar.mock.calls[0]?.[0]).toMatchObject({ participacion: 900 });
  });

  it('las dos que todavía no mueven nada se muestran, dicen por qué, y no se pueden tocar', () => {
    render7();
    expect(screen.getByText(/qué dice/i)).toBeInTheDocument();
    expect(screen.getByText(/cuánto se cumple/i)).toBeInTheDocument();
    expect(screen.getAllByText(/campañas/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('slider', { name: /qué dice/i })).not.toBeInTheDocument();
  });

  it('cada palanca explica qué distorsiona', () => {
    render7();
    expect(screen.getByText(/la única variable que controlás en la vida real/i)).toBeInTheDocument();
    expect(screen.getByText(/si fuera insuperable el simulador enseñaría fatalismo/i)).toBeInTheDocument();
  });

  it('arranca en valores que producen un país legible, no en cero', () => {
    // Con participación 0 los dos lados de la cortina serían idénticos y la
    // primera impresión sería que la herramienta no hace nada.
    expect(PALANCAS_INICIALES.participacion).toBeGreaterThan(0);
    expect(PALANCAS_INICIALES.constancia).toBeGreaterThan(0);
  });
});
