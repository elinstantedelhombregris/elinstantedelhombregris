import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CompartirProceso } from './CompartirProceso';

const clipboard = (writeText: () => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
};
afterEach(() => {
  vi.restoreAllMocks();
});
describe('CompartirProceso', () => {
  it('copia el enlace completo y solo dice que se copió', async () => {
    const copiar = vi.fn().mockResolvedValue(undefined);
    clipboard(copiar);
    render(
      <CompartirProceso href="/campanas/una-campana?edicion=2" titulo="Compartir esta campaña" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Compartir esta campaña' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/^Enlace copiado\.$/);
    expect(copiar).toHaveBeenCalledWith(`${window.location.origin}/campanas/una-campana?edicion=2`);
  });
  it('si el navegador no deja copiar, muestra el enlace para copiarlo a mano', async () => {
    clipboard(() => Promise.reject(new Error('sin permiso')));
    render(<CompartirProceso href="/campanas/una-campana" titulo="Compartir" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      `Copiá este enlace: ${window.location.origin}/campanas/una-campana`,
    );
  });
});
