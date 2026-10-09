import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ParticiparEnMapa } from '../ParticiparEnMapa';
import { ConsentimientoVoz } from '../soltar/ConsentimientoVoz';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';

vi.mock('../../../Imaginar/ConversacionIdeal', () => ({
  ConversacionIdeal: ({
    irADirecto,
    lugarInicial,
  }: {
    irADirecto?: () => void;
    lugarInicial?: { name: string } | null;
  }) => (
    <div>
      <p>Tres preguntas en {lugarInicial?.name ?? 'todo el país'}</p>
      <textarea aria-label="Reflexión privada" defaultValue="" />
      <button type="button" data-ir-directo onClick={irADirecto}>
        Cargalo directo →
      </button>
    </div>
  ),
}));
vi.mock('../AporteDirectoMapa', () => ({
  AporteDirectoMapa: ({ contexto }: { contexto?: { name: string } | null }) => (
    <div>
      <p>Aporte puntual en {contexto?.name ?? 'todo el país'}</p>
      <textarea aria-label="Aporte puntual" defaultValue="" />
    </div>
  ),
}));
const lugar: LugarMapa = {
  id: 50,
  provinceId: 50,
  name: 'Mendoza',
  level: 'province',
  latitude: null,
  longitude: null,
};
const base = { modo: 'guiado' as const, cerrar: vi.fn(), lugar, visible: true };

describe('El título del panel recibe el foco sin dibujar un anillo', () => {
  it('«Sumá tu aporte.» toma el foco al abrir y no pinta el anillo violeta del :focus-visible', () => {
    render(<ParticiparEnMapa {...base} cambiar={vi.fn()} />);
    const titulo = screen.getByRole('heading', { level: 2, name: 'Sumá tu aporte.' });
    // Foco programático sobre un título que no es un control: el foco se mueve (lectores de
    // pantalla, siguiente tabulación), pero el anillo de .papel-root :focus-visible no se ve.
    expect(titulo).toHaveFocus();
    expect(titulo).toHaveAttribute('tabindex', '-1');
    expect(titulo).toHaveClass('focus:outline-none');
  });
});

describe('Un solo panel para aportar, dentro del mapa', () => {
  it('se llama «Sumá tu aporte» y abre con las tres preguntas; el aporte puntual queda fuera del teclado', async () => {
    render(<ParticiparEnMapa {...base} cambiar={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Sumá tu aporte.' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Reflexión privada')).toBeVisible();
    // Oculto con `hidden`: no está en el árbol de accesibilidad ni en el orden del tabulador.
    expect(screen.queryByRole('textbox', { name: 'Aporte puntual' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Aporte puntual', { selector: 'textarea' })).not.toBeVisible();
    expect(screen.queryByRole('group', { name: 'Cómo querés aportar' })).not.toBeInTheDocument();
  });

  it('el aporte puntual es un camino secundario: se llega desde las tres preguntas y se vuelve con un enlace', async () => {
    const cambiar = vi.fn();
    const vista = render(<ParticiparEnMapa {...base} cambiar={cambiar} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cargalo directo →' }));
    expect(cambiar).toHaveBeenCalledWith('directo');

    vista.rerender(<ParticiparEnMapa {...base} modo="directo" cambiar={cambiar} />);
    expect(screen.getByRole('textbox', { name: 'Aporte puntual' })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Reflexión privada' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '← Volver a las tres preguntas' }));
    expect(cambiar).toHaveBeenLastCalledWith('guiado');
  });

  it('conserva lo escrito al pasar de un camino al otro y al cerrar el panel', async () => {
    const props = { ...base, cambiar: vi.fn(), cerrar: vi.fn() };
    const vista = render(<ParticiparEnMapa {...props} />);
    const campo = await screen.findByLabelText('Reflexión privada');
    fireEvent.change(campo, { target: { value: 'Quiero aprender sin irme de mi lugar.' } });
    vista.rerender(<ParticiparEnMapa {...props} modo="directo" />);
    fireEvent.change(screen.getByLabelText('Aporte puntual'), {
      target: { value: 'Observé una biblioteca abierta.' },
    });
    vista.rerender(<ParticiparEnMapa {...props} modo="guiado" />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aporte y volver al mapa' }));
    expect(props.cerrar).toHaveBeenCalledOnce();
    vista.rerender(<ParticiparEnMapa {...props} visible={false} />);
    vista.rerender(<ParticiparEnMapa {...props} />);
    expect(screen.getByLabelText('Reflexión privada')).toHaveValue(
      'Quiero aprender sin irme de mi lugar.',
    );
    expect(screen.getByLabelText('Aporte puntual')).toHaveValue('Observé una biblioteca abierta.');
  });

  it('sigue al lugar del mapa en vivo y avisa cuando cambia', () => {
    const props = { ...base, cambiar: vi.fn(), modo: 'directo' as const };
    const vista = render(<ParticiparEnMapa {...props} />);
    expect(screen.getByText(/Mendoza · el lugar de tu aporte/)).toBeInTheDocument();
    expect(screen.queryByText(/Cambiaste de lugar/)).not.toBeInTheDocument();
    vista.rerender(
      <ParticiparEnMapa {...props} lugar={{ ...lugar, name: 'Córdoba', id: 14, provinceId: 14 }} />,
    );
    expect(screen.getByText(/Córdoba · el lugar de tu aporte/)).toBeInTheDocument();
    expect(screen.queryByText(/Mendoza · el lugar/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cambiaste de lugar: ahora es Córdoba.');
  });

  it('mientras el mapa busca el lugar lo dice en la línea del lugar y no toca lo escrito', async () => {
    const props = { ...base, cambiar: vi.fn(), lugar: null };
    const vista = render(<ParticiparEnMapa {...props} />);
    const campo = await screen.findByLabelText('Reflexión privada');
    fireEvent.change(campo, { target: { value: 'Una escena en mi barrio.' } });
    vista.rerender(<ParticiparEnMapa {...props} cargandoLugar />);
    expect(screen.getByText(/Buscando el lugar…/)).toBeInTheDocument();
    expect(screen.getByLabelText('Reflexión privada')).toBe(campo);
    expect(campo).toHaveValue('Una escena en mi barrio.');
    vista.rerender(<ParticiparEnMapa {...props} lugar={lugar} />);
    expect(screen.getByText(/Mendoza · el lugar de tu aporte/)).toBeInTheDocument();
    // Llegó el primer lugar: no es un cambio, así que no hay aviso.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Reflexión privada')).toBe(campo);
  });

  it('un lugar que todavía no llegó no borra el que ya tenían los formularios; si el mapa lo quita, vuelven a todo el país', async () => {
    const props = { ...base, cambiar: vi.fn() };
    const vista = render(<ParticiparEnMapa {...props} />);
    expect(await screen.findByText('Tres preguntas en Mendoza')).toBeInTheDocument();
    // El mapa está buscando el lugar siguiente: llega vacío, pero no es «todo el país».
    vista.rerender(<ParticiparEnMapa {...props} lugar={null} cargandoLugar />);
    expect(screen.getByText('Tres preguntas en Mendoza')).toBeInTheDocument();
    expect(screen.getByText('Aporte puntual en Mendoza')).toBeInTheDocument();
    // Ya no busca y no hay lugar: se limpió el filtro del mapa.
    vista.rerender(<ParticiparEnMapa {...props} lugar={null} />);
    expect(screen.getByText('Tres preguntas en todo el país')).toBeInTheDocument();
    expect(screen.getByText('Aporte puntual en todo el país')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cambiaste de lugar: ahora es todo el país.',
    );
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
    const etiqueta = guiada.getByText(/Quiero publicar este aporte/).closest('label');
    if (!etiqueta) throw new Error('Falta el permiso visible');
    fireEvent.click(etiqueta);
    expect(guiada.getByRole('checkbox', { name: /Quiero publicar/ })).toBeChecked();
    expect(directa.getByRole('checkbox', { name: /Quiero publicar/ })).not.toBeChecked();
  });
});
