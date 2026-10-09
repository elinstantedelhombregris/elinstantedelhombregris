import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fraseDeCeldasSinAportes } from '../conteo';
import { PanelArea } from '../PanelArea';

import type { ConteoArea } from '../conteo';

const CONTEO: ConteoArea = {
  exactas: [],
  aproximadas: [],
  centroide: [],
  provinciasTocadas: [],
  provincialesSinContar: 0,
  contadas: [],
};

function panel(cobertura: { total: number; mudas: number; ladoMetros: number } | null) {
  return render(
    <PanelArea
      conteo={CONTEO}
      senales={[]}
      cobertura={cobertura}
      enlace="#"
      onLimpiar={vi.fn()}
      oscuro
    />,
  );
}

describe('el panel del área dibujada', () => {
  it('las celdas sin puntos no afirman silencio: dicen que nadie cargó, o lo cargó sin ubicación', () => {
    const { container } = panel({ total: 48, mudas: 12, ladoMetros: 900 });
    expect(container.textContent).toContain(
      'En 12 de 48 celdas no hay aportes publicados: nadie cargó nada, o lo cargó sin ubicación.',
    );
    expect(container.textContent).not.toMatch(/mudas|Nadie dijo nada|silencio/i);
    expect(screen.getByRole('heading', { name: 'Celdas sin aportes' })).toBeInTheDocument();
  });

  it('un área sin aportes publicados lo dice con lo que se sabe', () => {
    const { container } = panel(null);
    expect(container.textContent).toContain('No hay aportes publicados en esta área');
    expect(container.textContent).not.toMatch(/también es información/);
  });

  it('ningún texto del panel dice «voces» ni deja un cero suelto', () => {
    const { container } = panel({ total: 10, mudas: 0, ladoMetros: 500 });
    expect(container.textContent).not.toMatch(/\bvoces?\b/i);
    expect(container.textContent).toContain('Las 10 celdas del área tienen aportes publicados.');
  });
});

describe('fraseDeCeldasSinAportes', () => {
  it('concuerda en número y no deja ceros en dígitos', () => {
    expect(fraseDeCeldasSinAportes(0, 10)).toBe(
      'Las 10 celdas del área tienen aportes publicados.',
    );
    expect(fraseDeCeldasSinAportes(10, 10)).toMatch(/^En las 10 celdas del área no hay aportes/);
    expect(fraseDeCeldasSinAportes(1, 1)).toMatch(/^En la única celda del área no hay aportes/);
    expect(fraseDeCeldasSinAportes(0, 1)).toBe('La única celda del área tiene aportes publicados.');
    expect(fraseDeCeldasSinAportes(1, 1200)).toMatch(/^En 1 de 1\.200 celdas no hay aportes/);
    expect(fraseDeCeldasSinAportes(0, 0)).toBe('');
  });
});
