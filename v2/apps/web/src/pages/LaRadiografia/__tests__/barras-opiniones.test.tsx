import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { porcentajeDe, RESPUESTAS_MINIMAS_PARA_DECIMALES } from '../radiografia-data';
import { BarrasOpiniones } from '../sections/BarrasOpiniones';

const base = { miRespuesta: null, miExpuesta: false, puedoRetirar: false };
const afirmacion = (
  id: string,
  texto: string,
  respuestas: number,
  acuerdo: number | null,
  desacuerdo: number | null,
  paso: number | null,
) => ({ ...base, id, texto, respuestas, acuerdo, desacuerdo, paso });

describe('cómo respondieron a cada afirmación', () => {
  it('es una barra apilada de acuerdo, desacuerdo y pase, con el n a la vista', () => {
    const { container } = render(
      <BarrasOpiniones afirmaciones={[afirmacion('a', 'Una condición deseada', 40, 24, 12, 4)]} />,
    );
    expect(
      screen.getByRole('heading', { name: 'Cómo respondieron a cada afirmación' }),
    ).toBeInTheDocument();
    // Una sola barra con las tres partes, no una medida por vez.
    const barra = screen.getByRole('img');
    expect(barra).toHaveAccessibleName(
      /De acuerdo: 24 de 40 \(60,0 %\)\. En desacuerdo: 12 de 40 \(30,0 %\)\. Pasaron: 4 de 40 \(10,0 %\)\./,
    );
    expect(barra.children).toHaveLength(3);
    // El n queda a la vista, en texto.
    expect(container.textContent).toContain('40 respuestas');
    expect(container.textContent).toContain('De acuerdo24 · 60,0 %');
    expect(screen.queryByRole('button', { name: /Acuerdos|Desacuerdos|Pases/ })).toBeNull();
  });

  it('con menos de 30 respuestas no hay decimales y dice que son pocas', () => {
    const { container } = render(
      <BarrasOpiniones afirmaciones={[afirmacion('a', 'Con pocas respuestas', 5, 3, 1, 1)]} />,
    );
    const barra = screen.getByRole('img');
    expect(barra).toHaveAccessibleName(/De acuerdo: 3 de 5 \(60 %\)/);
    expect(barra.getAttribute('aria-label')).not.toMatch(/60,0|60\.0/);
    expect(container.textContent).not.toMatch(/60,0/);
    expect(container.textContent).toContain('5 respuestas · pocas respuestas');
  });

  it('desde 30 respuestas aparecen los decimales, siempre con coma, también para el lector', () => {
    expect(RESPUESTAS_MINIMAS_PARA_DECIMALES).toBe(30);
    expect(porcentajeDe(1, 3)).toBe('33 %');
    expect(porcentajeDe(10, 30)).toBe('33,3 %');
    const { container } = render(
      <BarrasOpiniones afirmaciones={[afirmacion('a', 'Con muchas', 30, 10, 10, 10)]} />,
    );
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('(33,3 %)');
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toMatch(/\d\.\d/);
    expect(container.textContent).not.toContain('pocas respuestas');
  });

  it('lleva la nota fija: más acuerdo no vuelve cierta una afirmación', () => {
    render(<BarrasOpiniones afirmaciones={[]} />);
    expect(
      screen.getByText('Más acuerdo no vuelve cierta una afirmación ni obliga a hacer nada.'),
    ).toBeVisible();
  });

  it('un desglose suprimido sigue reservado también al ordenar', () => {
    render(
      <BarrasOpiniones
        afirmaciones={[afirmacion('a', 'Afirmación con pocas respuestas', 3, null, null, null)]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por porcentaje de acuerdo' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(
      screen.getByText('3 respuestas; el desglose público espera al menos cinco.'),
    ).toBeInTheDocument();
  });

  it('ordenar por acuerdo deja primero la afirmación con más acuerdo y avisa que no la vuelve cierta', () => {
    render(
      <BarrasOpiniones
        afirmaciones={[
          afirmacion('a', 'Primera', 10, 2, 7, 1),
          afirmacion('b', 'Segunda', 10, 9, 1, 0),
          afirmacion('c', 'Tercera', 3, null, null, null),
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por porcentaje de acuerdo' }));
    const textos = screen.getAllByRole('listitem').map((li) => li.querySelector('p')?.textContent);
    expect(textos).toEqual(['Segunda', 'Primera', 'Tercera']);
    // La nota que desactiva la lectura de ranking está en la misma pantalla.
    expect(screen.getByText(/Más acuerdo no vuelve cierta/)).toBeVisible();
  });

  it('un cero va en palabras, no como dígito suelto', () => {
    const { container } = render(
      <BarrasOpiniones afirmaciones={[afirmacion('a', 'Sin respuestas', 0, null, null, null)]} />,
    );
    expect(container.textContent).toContain('ninguna respuesta; el desglose público espera');
  });
});
