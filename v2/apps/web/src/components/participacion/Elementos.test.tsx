import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BotonAccion, EnlaceAccion, ErrorOperacion, MarcoParticipacion, Nota } from './Elementos';

describe('MarcoParticipacion', () => {
  it('pone el kicker del kit, el título y la entrada', () => {
    render(
      <MarcoParticipacion titulo="Tu espacio" entrada="Lo que aportaste.">
        <p>contenido</p>
      </MarcoParticipacion>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Tu espacio' })).toBeInTheDocument();
    const kicker = screen.getByText('La ciudadanía diseña');
    // El mismo kicker que el resto del sitio: 11px, tracking amplio, violeta.
    expect(kicker.className).toMatch(/text-\[11px\]/);
    expect(kicker.className).toMatch(/tracking-\[0\.16em\]/);
    expect(kicker.className).toMatch(/text-violeta/);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});

describe('BotonAccion', () => {
  it('usa los tamaños y el tracking del botón del kit, no los suyos', () => {
    render(<BotonAccion>Guardar</BotonAccion>);
    const boton = screen.getByRole('button', { name: 'Guardar' });
    expect(boton.className).toMatch(/text-\[13px\]/);
    expect(boton.className).toMatch(/tracking-\[0\.08em\]/);
    expect(boton.className).not.toMatch(/text-xs/);
    expect(boton.className).toMatch(/bg-violeta/);
  });

  it('cada tono sale de una variante del kit', () => {
    render(
      <>
        <BotonAccion tono="papel">Volver</BotonAccion>
        <BotonAccion tono="sello">Quitar</BotonAccion>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Volver' }).className).toMatch(/border-tinta\b/);
    const sello = screen.getByRole('button', { name: 'Quitar' }).className;
    expect(sello).toMatch(/bg-sello/);
    expect(sello).not.toMatch(/bg-violeta/);
  });

  it('disabled no saca al botón del teclado: queda con aria-disabled y no usa opacity', () => {
    const alClic = vi.fn();
    render(
      <BotonAccion disabled onClick={alClic}>
        Enviar
      </BotonAccion>,
    );
    const boton = screen.getByRole('button', { name: 'Enviar' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(boton).not.toBeDisabled();
    expect(boton.className).toMatch(/cursor-not-allowed/);
    expect(boton.className).not.toMatch(/opacity-/);
    boton.focus();
    expect(boton).toHaveFocus();
    fireEvent.click(boton);
    expect(alClic).not.toHaveBeenCalled();
  });

  it('bloqueado no envía el formulario aunque sea un botón de envío', () => {
    const alEnviar = vi.fn((e: { preventDefault: () => void }) => {
      e.preventDefault();
    });
    render(
      <form onSubmit={alEnviar}>
        <BotonAccion type="submit" disabled>
          Publicar
        </BotonAccion>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('con motivo lo muestra a la vista y describe al botón', () => {
    render(<BotonAccion motivo="Falta el nombre.">Seguir</BotonAccion>);
    const boton = screen.getByRole('button', { name: 'Seguir' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Falta el nombre.')).toBeVisible();
    expect(boton).toHaveAccessibleDescription('Falta el nombre.');
  });

  it('habilitado anda como un botón común', () => {
    const alClic = vi.fn();
    render(<BotonAccion onClick={alClic}>Seguir</BotonAccion>);
    const boton = screen.getByRole('button', { name: 'Seguir' });
    expect(boton).not.toHaveAttribute('aria-disabled');
    fireEvent.click(boton);
    expect(alClic).toHaveBeenCalledOnce();
  });
});

describe('EnlaceAccion', () => {
  it('es un enlace con el aspecto del botón del kit, hover y foco incluidos', () => {
    render(<EnlaceAccion href="/mi-espacio">Ir a mi espacio</EnlaceAccion>);
    const enlace = screen.getByRole('link', { name: 'Ir a mi espacio' });
    expect(enlace).toHaveAttribute('href', '/mi-espacio');
    expect(enlace.className).toMatch(/text-\[13px\]/);
    expect(enlace.className).toMatch(/hover:bg-tinta/);
    expect(enlace.className).toMatch(/focus-visible:outline/);
  });

  it('secundario es el botón fantasma', () => {
    render(
      <EnlaceAccion secundario href="/datos-abiertos">
        Datos
      </EnlaceAccion>,
    );
    const enlace = screen.getByRole('link', { name: 'Datos' });
    expect(enlace.className).toMatch(/border-tinta\b/);
    expect(enlace.className).toMatch(/hover:text-papel/);
    expect(enlace.className).not.toMatch(/bg-violeta/);
  });
});

describe('ErrorOperacion', () => {
  it('no pinta nada sin mensaje', () => {
    const { container } = render(<ErrorOperacion mensaje={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('respeta los saltos de línea y acepta className', () => {
    render(<ErrorOperacion mensaje={'Primera línea.\nSegunda línea.'} className="mt-0" />);
    const alerta = screen.getByRole('alert');
    expect(alerta.className).toMatch(/whitespace-pre-line/);
    expect(alerta.className).toMatch(/mt-0/);
    // La barra de al lado va en `sello`, no en el gris de Tailwind.
    expect(alerta.className).toMatch(/border-sello/);
    expect(alerta).toHaveTextContent('Primera línea.');
  });
});

describe('Nota', () => {
  it('lleva su contenido con la barra violeta', () => {
    render(<Nota>Algo para tener en cuenta.</Nota>);
    expect(screen.getByText('Algo para tener en cuenta.').className).toMatch(/border-violeta/);
  });
});
