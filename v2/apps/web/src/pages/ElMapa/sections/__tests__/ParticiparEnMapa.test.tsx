import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ParticiparEnMapa } from '../ParticiparEnMapa';
import { ConsentimientoVoz } from '../soltar/ConsentimientoVoz';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';

vi.mock('../../../Imaginar/ConversacionIdeal', () => ({
  ConversacionIdeal: () => <textarea aria-label="Reflexión privada" defaultValue="" />,
}));
vi.mock('../AporteDirectoMapa', () => ({
  AporteDirectoMapa: () => <textarea aria-label="Mirada directa" defaultValue="" />,
}));
const lugar: LugarMapa = {
  id: 50,
  provinceId: 50,
  name: 'Mendoza',
  level: 'province',
  latitude: null,
  longitude: null,
};
describe('Participar sin salir del mapa', () => {
  it('conserva lo escrito al cambiar de forma de aportar y cerrar el panel', async () => {
    const props = {
      modo: 'imaginar' as const,
      cambiar: vi.fn(),
      cerrar: vi.fn(),
      lugar,
      visible: true,
    };
    const vista = render(<ParticiparEnMapa {...props} />);
    const campo = await screen.findByLabelText('Reflexión privada');
    fireEvent.change(campo, { target: { value: 'Quiero aprender sin irme de mi lugar.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contar lo que veo' }));
    expect(props.cambiar).toHaveBeenCalledWith('voz');
    vista.rerender(<ParticiparEnMapa {...props} modo="voz" />);
    fireEvent.change(screen.getByLabelText('Mirada directa'), {
      target: { value: 'Observé una biblioteca abierta.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aporte y volver al mapa' }));
    expect(props.cerrar).toHaveBeenCalledOnce();
    vista.rerender(<ParticiparEnMapa {...props} visible={false} />);
    vista.rerender(<ParticiparEnMapa {...props} />);
    expect(screen.getByLabelText('Reflexión privada')).toHaveValue(
      'Quiero aprender sin irme de mi lugar.',
    );
    expect(screen.getByLabelText('Mirada directa')).toHaveValue('Observé una biblioteca abierta.');
  });
  it('recorrer otro territorio no cambia silenciosamente el ámbito de una reflexión en curso', () => {
    const props = { modo: 'voz' as const, cambiar: vi.fn(), cerrar: vi.fn(), lugar, visible: true };
    const vista = render(<ParticiparEnMapa {...props} />);
    vista.rerender(
      <ParticiparEnMapa {...props} lugar={{ ...lugar, name: 'Córdoba', id: 14, provinceId: 14 }} />,
    );
    expect(screen.getByText('Mendoza · tu lugar en la conversación')).toBeInTheDocument();
    expect(screen.queryByText('Córdoba · tu lugar en la conversación')).not.toBeInTheDocument();
  });
  it('cada forma de aportar controla únicamente sus propios permisos de publicación', () => {
    function Permisos({ nombre }: { nombre: string }) {
      const [publicar, setPublicar] = useState(false);
      const [cede, setCede] = useState(false);
      return (
        <section aria-label={nombre}>
          <ConsentimientoVoz
            publicar={publicar}
            cede={cede}
            setPublicar={setPublicar}
            setCede={setCede}
          />
        </section>
      );
    }
    render(
      <>
        <Permisos nombre="Guiada" />
        <Permisos nombre="Directa" />
      </>,
    );
    const guiada = within(screen.getByRole('region', { name: 'Guiada' }));
    const directa = within(screen.getByRole('region', { name: 'Directa' }));
    const etiqueta = guiada.getByText(/Quiero publicar esta voz/).closest('label');
    if (!etiqueta) throw new Error('Falta el permiso visible');
    fireEvent.click(etiqueta);
    expect(guiada.getByRole('checkbox', { name: /Quiero publicar/ })).toBeChecked();
    expect(directa.getByRole('checkbox', { name: /Quiero publicar/ })).not.toBeChecked();
  });
});
