import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ParticiparEnMapa } from '../ParticiparEnMapa';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';

import { APORTAR_HREF } from '~/lib/participacion/aportar';

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
const base = { cerrar: vi.fn(), lugar, visible: true };

describe('El título del panel recibe el foco sin dibujar un anillo', () => {
  it('«Sumá tu aporte.» toma el foco al abrir y no pinta el anillo violeta del :focus-visible', () => {
    render(<ParticiparEnMapa {...base} />);
    const titulo = screen.getByRole('heading', { level: 2, name: 'Sumá tu aporte.' });
    // Foco programático sobre un título que no es un control: el foco se mueve (lectores de
    // pantalla, siguiente tabulación), pero el anillo de .papel-root :focus-visible no se ve.
    expect(titulo).toHaveFocus();
    expect(titulo).toHaveAttribute('tabindex', '-1');
    expect(titulo).toHaveClass('focus:outline-none');
  });
});

describe('El panel de aportes es papel dentro del instrumento de noche', () => {
  it('declara el esquema claro: sin eso sus casillas heredarían el oscuro del instrumento', () => {
    render(<ParticiparEnMapa {...base} />);
    const panel = screen.getByRole('complementary', { name: 'Aportar desde el mapa' });
    expect(panel).toHaveClass('[color-scheme:light]', 'accent-violeta', 'bg-papel');
  });
});

describe('En el mapa se cuenta cómo está hoy algo puntual', () => {
  it('abre directo en el aporte puntual: ya no hay tres preguntas ni un camino para volver a ellas', () => {
    render(<ParticiparEnMapa {...base} />);
    expect(screen.getByRole('textbox', { name: 'Aporte puntual' })).toBeVisible();
    expect(screen.getByText(/un problema, algo que falta, algo que ya funciona/)).toBeVisible();
    expect(screen.queryByText(/tres preguntas/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a las tres preguntas/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /Imaginá el país/ })).toBeNull();
  });

  it('a quien vino a imaginar el país le dice dónde se hace', () => {
    render(<ParticiparEnMapa {...base} />);
    expect(screen.getByRole('link', { name: 'Eso va en Mi Argentina ideal' })).toHaveAttribute(
      'href',
      APORTAR_HREF,
    );
  });

  it('conserva lo escrito al cerrar el panel y volver a abrirlo', () => {
    const props = { ...base, cerrar: vi.fn() };
    const vista = render(<ParticiparEnMapa {...props} />);
    fireEvent.change(screen.getByLabelText('Aporte puntual'), {
      target: { value: 'Observé una biblioteca abierta.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aporte y volver al mapa' }));
    expect(props.cerrar).toHaveBeenCalledOnce();
    vista.rerender(<ParticiparEnMapa {...props} visible={false} />);
    vista.rerender(<ParticiparEnMapa {...props} />);
    expect(screen.getByLabelText('Aporte puntual')).toHaveValue('Observé una biblioteca abierta.');
  });

  it('sigue al lugar del mapa en vivo y avisa cuando cambia', () => {
    const vista = render(<ParticiparEnMapa {...base} />);
    expect(screen.getByText(/Mendoza · el lugar de tu aporte/)).toBeInTheDocument();
    expect(screen.queryByText(/Cambiaste de lugar/)).not.toBeInTheDocument();
    vista.rerender(
      <ParticiparEnMapa {...base} lugar={{ ...lugar, name: 'Córdoba', id: 14, provinceId: 14 }} />,
    );
    expect(screen.getByText(/Córdoba · el lugar de tu aporte/)).toBeInTheDocument();
    expect(screen.queryByText(/Mendoza · el lugar/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cambiaste de lugar: ahora es Córdoba.');
  });

  it('mientras el mapa busca el lugar lo dice en la línea del lugar y no toca lo escrito', () => {
    const props = { ...base, lugar: null };
    const vista = render(<ParticiparEnMapa {...props} />);
    const campo = screen.getByLabelText('Aporte puntual');
    fireEvent.change(campo, { target: { value: 'Una escena en mi barrio.' } });
    vista.rerender(<ParticiparEnMapa {...props} cargandoLugar />);
    expect(screen.getByText(/Buscando el lugar…/)).toBeInTheDocument();
    expect(screen.getByLabelText('Aporte puntual')).toBe(campo);
    expect(campo).toHaveValue('Una escena en mi barrio.');
    vista.rerender(<ParticiparEnMapa {...props} lugar={lugar} />);
    expect(screen.getByText(/Mendoza · el lugar de tu aporte/)).toBeInTheDocument();
    // Llegó el primer lugar: no es un cambio, así que no hay aviso.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Aporte puntual')).toBe(campo);
  });

  it('un lugar que todavía no llegó no borra el que ya tenía el formulario; si el mapa lo quita, vuelve a todo el país', () => {
    const vista = render(<ParticiparEnMapa {...base} />);
    expect(screen.getByText('Aporte puntual en Mendoza')).toBeInTheDocument();
    // El mapa está buscando el lugar siguiente: llega vacío, pero no es «todo el país».
    vista.rerender(<ParticiparEnMapa {...base} lugar={null} cargandoLugar />);
    expect(screen.getByText('Aporte puntual en Mendoza')).toBeInTheDocument();
    // Ya no busca y no hay lugar: se limpió el filtro del mapa.
    vista.rerender(<ParticiparEnMapa {...base} lugar={null} />);
    expect(screen.getByText('Aporte puntual en todo el país')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cambiaste de lugar: ahora es todo el país.',
    );
  });
});

describe('Recuperar el territorio sin publicar en otro lugar', () => {
  it('conserva el borrador y bloquea su envío mientras falta el lugar', () => {
    const reintentar = vi.fn();
    const props = { ...base, reintentarLugar: reintentar };
    const vista = render(<ParticiparEnMapa {...props} />);
    const puntual = screen.getByLabelText('Aporte puntual');
    fireEvent.change(puntual, { target: { value: 'Tenemos un espacio disponible' } });
    vista.rerender(<ParticiparEnMapa {...props} lugar={null} cargandoLugar />);
    expect(puntual).toBeDisabled();
    vista.rerender(<ParticiparEnMapa {...props} lugar={null} falloLugar />);
    expect(screen.getByRole('alert')).toHaveTextContent('Tu borrador se conserva');
    expect(screen.getByText('Aporte puntual en Mendoza')).toBeInTheDocument();
    expect(screen.queryByText(/ahora es todo el país/)).not.toBeInTheDocument();
    expect(puntual).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar el lugar' }));
    expect(reintentar).toHaveBeenCalledOnce();
    vista.rerender(<ParticiparEnMapa {...props} />);
    expect(screen.getByLabelText('Aporte puntual')).toBe(puntual);
    expect(puntual).toHaveValue('Tenemos un espacio disponible');
    expect(puntual).toBeEnabled();
  });
});
