import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  COLOR_DEL_BORDE_PROVINCIAL,
  COLOR_DEL_VELO_PROVINCIAL,
  LEYENDA_DEL_VELO,
} from '../ambitos-provinciales';
import { LeyendaDelVelo } from '../AmbitosProvinciales';
import { frasePorPagina } from '../conteo';
import { ListaRegistros } from '../ListaRegistros';
import { COLOR_CLASE } from '../paleta';
import { ProcedenciaConsulta } from '../ProcedenciaConsulta';

import type { LecturaMapa, SenalMapa } from '~/lib/queries/civic-map';

const aporte = (id: string, extra: Partial<SenalMapa> = {}): SenalMapa => ({
  id: `voz:00000000-0000-4000-8000-0000000000${id}`,
  capa: 'voz',
  tipo: 'necesidad',
  texto: 'Falta una salita.',
  lat: -34.6,
  lng: -58.4,
  precision: 'neighborhood',
  role: 'capture',
  provinceId: 6,
  cityId: null,
  createdAt: '2026-10-01T00:00:00Z',
  ...extra,
});

const lectura = (signals: SenalMapa[], total = signals.length): LecturaMapa => ({
  signals,
  metadata: {
    total,
    entregados: signals.length,
    completa: total === signals.length,
    hasta: '2026-10-09T00:00:00Z',
    siguiente: null,
    unidad: 'registros',
    sinPunto: 0,
    porProvincia: [],
    porDia: [],
  },
});

describe('la lista de aportes del mapa', () => {
  it('dice la precisión en castellano y nunca el valor crudo en inglés', () => {
    const { container } = render(
      <ListaRegistros
        datos={lectura([
          aporte('01'),
          aporte('02', { precision: 'city' }),
          aporte('03', { lat: null, lng: null, precision: 'province' }),
        ])}
        seleccionada={null}
        seleccionar={vi.fn()}
      />,
    );
    expect(container.textContent).toContain(
      'Ubicación aproximada, en su barrio. No es una dirección.',
    );
    expect(container.textContent).toContain('en el centro de su localidad');
    expect(container.textContent).toContain('Sin punto en el mapa; se conserva en esta lista.');
    expect(container.textContent).not.toMatch(/neighborhood|Precisión:|\bcity\b|\bprovince\b/);
  });

  it('sin aportes no consuela con un aforismo ni afirma silencio', () => {
    render(<ListaRegistros datos={lectura([])} seleccionada={null} seleccionar={vi.fn()} />);
    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent('Ningún aporte cumple estos filtros.');
    expect(aviso).toHaveTextContent('nadie lo cargó acá');
    expect(aviso).not.toHaveTextContent(/nadie haya hablado|Con estos filtros no hay nada/);
  });

  it('concuerda: un aporte, no «una» ni «1 registros»', () => {
    const { container } = render(
      <ListaRegistros datos={lectura([aporte('01')])} seleccionada={null} seleccionar={vi.fn()} />,
    );
    expect(container.textContent).toContain('ninguno es un acuerdo');
    expect(container.textContent).not.toMatch(/registros|ninguna es un acuerdo|Cada una/);
  });
});

describe('cuántos aportes cumplen los filtros', () => {
  it('muestra «m de n» cuando la página no alcanza, con puntos de miles', () => {
    expect(frasePorPagina(1234, 500)).toBe(
      'Mostramos 500 de 1.234 aportes que cumplen los filtros.',
    );
  });

  it('dice el número una sola vez cuando entra todo, y concuerda', () => {
    expect(frasePorPagina(4, 4)).toBe('4 aportes cumplen los filtros.');
    expect(frasePorPagina(1, 1)).toBe('1 aporte cumple los filtros.');
  });

  it('el cero va en palabras', () => {
    expect(frasePorPagina(0, 0)).toBe('Ningún aporte cumple los filtros.');
  });

  it('la barra de alcance no repite el total en tres renglones', () => {
    const { container } = render(
      <ProcedenciaConsulta
        datos={{ ...lectura([aporte('01')], 4).metadata, sinPunto: 4 }}
        siguiente={vi.fn()}
        inicio={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('Mostramos 1 de 4 aportes que cumplen los filtros.');
    expect(container.textContent).not.toMatch(/en la consulta|en esta página\.|registros/);
    expect(container.textContent).toContain('Se cuentan aportes, no personas.');
  });
});

describe('el sombreado provincial no es un color de clase', () => {
  it('usa un velo neutro y no el violeta de «deseo»', () => {
    for (const clase of Object.values(COLOR_CLASE)) {
      expect(COLOR_DEL_VELO_PROVINCIAL.toLowerCase()).not.toBe(clase.toLowerCase());
      expect(COLOR_DEL_BORDE_PROVINCIAL.toLowerCase()).not.toBe(clase.toLowerCase());
    }
  });

  it('la leyenda dice que el sombreado no marca dónde pasó', () => {
    render(<LeyendaDelVelo />);
    expect(screen.getByText(LEYENDA_DEL_VELO)).toBeInTheDocument();
    expect(LEYENDA_DEL_VELO).toMatch(/provincia con aportes/);
    expect(LEYENDA_DEL_VELO).toMatch(/No marca dónde pasó\.$/);
  });
});
