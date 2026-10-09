import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BotonConMotivo } from './BotonConMotivo';

describe('BotonConMotivo', () => {
  it('con motivo queda bloqueado pero enfocable, y el motivo se ve y lo describe', () => {
    const alClic = vi.fn();
    render(
      <BotonConMotivo motivo="Escribí al menos una frase para seguir." onClick={alClic}>
        Seguir
      </BotonConMotivo>,
    );
    const boton = screen.getByRole('button', { name: 'Seguir' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    // Con `disabled` el botón saldría del teclado; con aria-disabled sigue.
    expect(boton).not.toBeDisabled();
    boton.focus();
    expect(boton).toHaveFocus();
    expect(screen.getByText('Escribí al menos una frase para seguir.')).toBeVisible();
    expect(boton).toHaveAccessibleDescription('Escribí al menos una frase para seguir.');
    fireEvent.click(boton);
    expect(alClic).not.toHaveBeenCalled();
  });

  it('bloqueado no envía el formulario aunque sea un botón de envío', () => {
    const alEnviar = vi.fn((e: { preventDefault: () => void }) => {
      e.preventDefault();
    });
    render(
      <form onSubmit={alEnviar}>
        <BotonConMotivo type="submit" motivo="Falta: escribí algo.">
          Publicar
        </BotonConMotivo>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('sin motivo anda como un botón común y no muestra nada de más', () => {
    const alClic = vi.fn();
    const { container } = render(
      <BotonConMotivo motivo={null} onClick={alClic}>
        Seguir
      </BotonConMotivo>,
    );
    const boton = screen.getByRole('button', { name: 'Seguir' });
    expect(boton).not.toHaveAttribute('aria-disabled');
    fireEvent.click(boton);
    expect(alClic).toHaveBeenCalledOnce();
    expect(container.querySelector('p')).toBeNull();
  });

  it('ocupado ignora el clic sin inventar un motivo', () => {
    const alClic = vi.fn();
    const { container } = render(
      <BotonConMotivo motivo={null} ocupado onClick={alClic}>
        Publicando…
      </BotonConMotivo>,
    );
    const boton = screen.getByRole('button', { name: 'Publicando…' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(boton).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(boton);
    expect(alClic).not.toHaveBeenCalled();
    expect(container.querySelector('p')).toBeNull();
  });
});
