import { fireEvent, render, screen } from '@testing-library/react';
import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { EscribirIdeal } from '../EscribirIdeal';

import { estaDespierto } from '~/lib/despertar';
import { tomarTextoEnCurso } from '~/lib/participacion/texto-en-curso';

const campo = () =>
  screen.getByRole<HTMLTextAreaElement>('textbox', { name: PREGUNTA_MI_ARGENTINA_IDEAL });

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  window.localStorage.clear();
  // El módulo vive en memoria: se vacía para que una prueba no herede el texto de otra.
  tomarTextoEnCurso();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('La portada: la pregunta y el campo para escribir', () => {
  it('la pregunta es la de la campaña y nombra el campo, que invita sin escribir por nadie', () => {
    render(<EscribirIdeal />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      PREGUNTA_MI_ARGENTINA_IDEAL,
    );
    expect(campo()).toHaveAttribute('placeholder', 'En mi Argentina ideal…');
    expect(campo()).toHaveValue('');
    expect(campo()).toHaveAttribute('maxLength', '2000');
    expect(screen.getByRole('button', { name: 'Seguir' })).toHaveAttribute('type', 'submit');
    expect(
      screen.getByRole('link', { name: 'O empezá mirando lo que imaginan otros' }),
    ).toHaveAttribute('href', '/mi-argentina-ideal/mirar');
    expect(screen.getByText('No hace falta cuenta.')).toBeInTheDocument();
  });

  it('«Seguir» guarda lo escrito en memoria y abre Imaginar, sin ponerlo en la dirección', () => {
    render(<EscribirIdeal />);
    fireEvent.change(campo(), {
      target: { value: '  En mi Argentina ideal puedo estudiar cerca de casa.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir' }));

    expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    expect(window.location.search).toBe('');
    expect(tomarTextoEnCurso()).toBe('En mi Argentina ideal puedo estudiar cerca de casa.');
    // Tampoco queda en el dispositivo: guardar ahí es una acción aparte (spec §3).
    const guardado = Array.from({ length: window.localStorage.length }, (_, i) => {
      const clave = window.localStorage.key(i) ?? '';
      return `${clave}=${window.localStorage.getItem(clave) ?? ''}`;
    }).join('\n');
    expect(guardado).not.toContain('estudiar');
    // Es la primera acción de verdad: el sitio se enciende.
    expect(estaDespierto()).toBe(true);
  });

  it('sin texto, «Seguir» avisa en línea, no navega y deja el foco en el campo', () => {
    render(<EscribirIdeal />);
    fireEvent.change(campo(), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escribí aunque sea una frase para seguir.',
    );
    expect(campo()).toHaveAttribute('aria-invalid', 'true');
    expect(campo()).toHaveAccessibleDescription(
      'Una frase alcanza para empezar. Escribí aunque sea una frase para seguir.',
    );
    expect(campo()).toHaveFocus();
    expect(window.location.pathname).toBe('/');
    expect(tomarTextoEnCurso()).toBe('');
    expect(estaDespierto()).toBe(false);
  });

  it('al volver a escribir, el aviso se va', () => {
    render(<EscribirIdeal />);
    fireEvent.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(campo(), { target: { value: 'Que' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(campo()).not.toHaveAttribute('aria-invalid');
  });
});
