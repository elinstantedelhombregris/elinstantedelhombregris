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

  it('con ancla en la dirección va a la sección, no arriba, y sin deslizarse', () => {
    window.history.replaceState(null, '', '/biblioteca#ensayos');
    render(<Pagina />);

    expect(alElemento).toHaveBeenCalledTimes(1);
    // Llegando NO se desliza: la sección tiene que estar puesta cuando
    // aparece la página, no viajar hasta ahí desde un documento en blanco.
    expect(alElemento).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(arriba).not.toHaveBeenCalled();
  });

  it('espera a la sección que todavía no montó — la página es lazy', async () => {
    window.history.replaceState(null, '', '/biblioteca#tardia');
    render(<SinSecciones />);

    // Cuando corre el efecto la sección no existe: se ve el fallback de
    // Suspense. No hay salto todavía, y tampoco un salto a lo bruto arriba.
    expect(alElemento).not.toHaveBeenCalled();
    expect(arriba).not.toHaveBeenCalled();

    // La página termina de cargar y el DOM cambia.
    const tardia = document.createElement('section');
    tardia.id = 'tardia';
    await act(async () => {
      document.body.append(tardia);
      // El observador de mutaciones entrega en cola aparte, no en el mismo tick.
      await new Promise((listo) => setTimeout(listo, 0));
    });

    expect(alElemento).toHaveBeenCalledTimes(1);
    tardia.remove();
  });
});

describe('saltarASeccion — el salto dentro de la misma página', () => {
  it('salta y avisa que se encargó cuando la sección existe', () => {
    render(<Pagina />);

    expect(saltarASeccion('ensayos')).toBe(true);
    expect(alElemento).toHaveBeenCalledTimes(1);
    // Adentro de la página sí se desliza: el lector ve hacia dónde va.
    expect(alElemento).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('devuelve false cuando la sección no existe, para que el link siga su curso', () => {
    render(<Pagina />);

    expect(saltarASeccion('una-seccion-que-no-existe')).toBe(false);
    expect(alElemento).not.toHaveBeenCalled();
  });
});
