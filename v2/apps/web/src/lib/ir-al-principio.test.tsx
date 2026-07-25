import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { navigate } from 'wouter/use-browser-location';

import { saltarASeccion, useIrAlPrincipio } from './ir-al-principio';

/** Monta el hook y una sección con ancla, como hace RootLayout con la página. */
function Pagina() {
  useIrAlPrincipio();
  return <section id="ensayos">Los ensayos</section>;
}

function SinSecciones() {
  useIrAlPrincipio();
  return <p>Una página sin anclas</p>;
}

const arriba = vi.fn();
const alElemento = vi.fn();

beforeEach(() => {
  arriba.mockClear();
  alElemento.mockClear();
  window.scrollTo = arriba;
  Element.prototype.scrollIntoView = alElemento;
  window.history.replaceState(null, '', '/biblioteca');
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('useIrAlPrincipio — toda navegación empieza donde empieza la página', () => {
  it('al cambiar de página va arriba de todo', () => {
    render(<SinSecciones />);
    arriba.mockClear(); // el montaje inicial también scrollea; medimos la navegación

    act(() => {
      navigate('/ensayos/la-obediencia');
    });

    expect(arriba).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('apaga la restauración del navegador para no pelear con ella', () => {
    render(<SinSecciones />);

    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('con ancla en la dirección va a la sección, no arriba', async () => {
    window.history.replaceState(null, '', '/biblioteca#ensayos');
    render(<Pagina />);

    // El ancla se busca en el frame siguiente: la página es lazy y puede no
    // estar montada cuando corre el efecto.
    await act(async () => {
      await new Promise((listo) => requestAnimationFrame(() => { listo(null); }));
    });

    expect(alElemento).toHaveBeenCalledTimes(1);
    expect(arriba).not.toHaveBeenCalled();
  });
});

describe('saltarASeccion — el salto dentro de la misma página', () => {
  it('salta y avisa que se encargó cuando la sección existe', () => {
    render(<Pagina />);

    expect(saltarASeccion('ensayos')).toBe(true);
    expect(alElemento).toHaveBeenCalledTimes(1);
  });

  it('devuelve false cuando la sección no existe, para que el link siga su curso', () => {
    render(<Pagina />);

    expect(saltarASeccion('una-seccion-que-no-existe')).toBe(false);
    expect(alElemento).not.toHaveBeenCalled();
  });
});
