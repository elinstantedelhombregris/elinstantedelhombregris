import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IndicePlanes } from '../sections/IndicePlanes';

import { PLAN_REGISTRY } from '~/lib/plans-registry';
import { PLAN_COUNT, PLAN_META, PLANES } from '~/pages/Planes/la-prueba-data';

const planjus = PLANES.find((p) => p.code === 'PLANJUS');
const planrep = PLANES.find((p) => p.code === 'PLANREP');

if (!planjus || !planrep) {
  throw new Error('Fixture inválida: PLANJUS/PLANREP deben existir en el registry para este test.');
}

describe('IndicePlanes (§2–§3 — el índice de los N + el plan meta)', () => {
  it('canon del registry: exactamente 1 plan isMeta y 22 sin isMeta', () => {
    expect(PLAN_REGISTRY.filter((p) => p.isMeta)).toHaveLength(1);
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)).toHaveLength(22);
  });

  it('renderiza 23 filas cerradas; la primera es 01 + PLANJUS; el meta es 00 + PLANRUTA bajo su encabezado', () => {
    render(<IndicePlanes />);

    const filas = screen.getAllByRole('button', { expanded: false });
    expect(filas).toHaveLength(23);

    expect(filas[0]).toHaveTextContent('01');
    expect(filas[0]).toHaveTextContent('PLANJUS');

    expect(
      screen.getByRole('heading', { name: 'El plan meta · fuera de la cuenta' }),
    ).toBeInTheDocument();
    const filaMeta = screen.getByText('PLANRUTA').closest('button');
    expect(filaMeta).not.toBeNull();
    expect(filaMeta).toHaveTextContent('00');
  });

  it('apertura única: abrir PLANJUS muestra su summary y el link; abrir PLANREP cierra PLANJUS y abre el suyo', () => {
    render(<IndicePlanes />);

    const filaPlanjusAbrir = screen.getByText('PLANJUS').closest('button');
    if (!filaPlanjusAbrir) throw new Error('fila PLANJUS no encontrada');
    fireEvent.click(filaPlanjusAbrir);
    expect(screen.getByText(planjus.summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leer el documento →' })).toHaveAttribute(
      'href',
      '/planes/planjus',
    );
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    const filaPlanrepAbrir = screen.getByText('PLANREP').closest('button');
    if (!filaPlanrepAbrir) throw new Error('fila PLANREP no encontrada');
    fireEvent.click(filaPlanrepAbrir);
    expect(screen.queryByText(planjus.summary)).not.toBeInTheDocument();
    expect(screen.getByText(planrep.summary)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('click en una fila abierta la cierra (cero aria-expanded true)', () => {
    render(<IndicePlanes />);

    const filaPlanjus = screen.getByText('PLANJUS').closest('button');
    if (!filaPlanjus) throw new Error('fila PLANJUS no encontrada');
    fireEvent.click(filaPlanjus);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    fireEvent.click(filaPlanjus);
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });

  it('el encabezado del índice interpola PLAN_COUNT — ningún literal 22 suelto', () => {
    render(<IndicePlanes />);

    expect(screen.getByText(`Los ${PLAN_COUNT} planes · tocá para abrir`)).toBeInTheDocument();
  });

  it('el pie del bloque meta también interpola PLAN_COUNT', () => {
    if (!PLAN_META) throw new Error('PLAN_META debe existir (PLANRUTA) para este test.');
    render(<IndicePlanes />);

    expect(
      screen.getByText(
        `PLANRUTA no es un plan más: es el manual de cómo arrancar los otros ${PLAN_COUNT}.`,
      ),
    ).toBeInTheDocument();
  });

  it('el pliegue muestra el nombre institucional además del título evocativo', () => {
    render(<IndicePlanes />);

    const fila = screen.getByText('PLANJUS').closest('button');
    if (!fila) throw new Error('fila PLANJUS no encontrada');

    // Cerrada: solo el evocativo.
    expect(screen.getByText(planjus.title)).toBeInTheDocument();
    expect(screen.queryByText(planjus.nombreInstitucional)).not.toBeInTheDocument();

    fireEvent.click(fila);

    // Abierta: los dos registros.
    expect(screen.getByText(planjus.title)).toBeInTheDocument();
    expect(screen.getByText(planjus.nombreInstitucional)).toBeInTheDocument();
  });
});
