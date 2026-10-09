import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAutoAltura } from './useAutoAltura';

function Campo({ valor }: { valor: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(ref, valor);
  return <textarea ref={ref} rows={5} value={valor} readOnly aria-label="Campo" />;
}

/** happy-dom no calcula layout: se simula que cada 40 caracteres ocupan una línea de 20 px. */
function simularLayout(bordes = 2) {
  const alto = (el: HTMLTextAreaElement) => Math.max(100, Math.ceil(el.value.length / 40) * 20);
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
    this: HTMLTextAreaElement,
  ) {
    return alto(this);
  });
  vi.spyOn(HTMLTextAreaElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLTextAreaElement,
  ) {
    return alto(this);
  });
  vi.spyOn(HTMLTextAreaElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLTextAreaElement,
  ) {
    return alto(this) + bordes;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAutoAltura', () => {
  it('un texto corto queda en el mínimo de sus filas', () => {
    simularLayout();
    const { getByLabelText } = render(<Campo valor="Corto." />);
    expect(getByLabelText('Campo')).toHaveAttribute('rows', '5');
    expect(getByLabelText('Campo').style.height).toBe('102px');
  });

  it('un texto largo ocupa todo su alto, bordes incluidos, y no queda con scroll interno', () => {
    simularLayout();
    const largo = 'Quiero poder caminar tranquila por mi barrio. '.repeat(8); // 368 caracteres
    const { getByLabelText } = render(<Campo valor={largo} />);
    expect(getByLabelText('Campo').style.height).toBe('202px');
  });

  it('crece cuando el texto crece', () => {
    simularLayout();
    const vista = render(<Campo valor={'a'.repeat(100)} />);
    const antes = vista.getByLabelText('Campo').style.height;
    vista.rerender(<Campo valor={'a'.repeat(400)} />);
    const despues = vista.getByLabelText('Campo').style.height;
    expect(parseInt(despues, 10)).toBeGreaterThan(parseInt(antes, 10));
  });

  it('si no está a la vista (scrollHeight 0) no deja el campo en cero', () => {
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockReturnValue(0);
    const { getByLabelText } = render(<Campo valor="Texto." />);
    expect(getByLabelText('Campo').style.height).toBe('');
  });
});
