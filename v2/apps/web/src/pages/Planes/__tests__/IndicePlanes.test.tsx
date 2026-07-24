import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IndicePlanes } from '../sections/IndicePlanes';

import { PLAN_REGISTRY } from '~/lib/plans-registry';
import { PLAN_COUNT, PLAN_META, PLANES } from '~/pages/Planes/la-prueba-data';

const plansal = PLANES.find((p) => p.code === 'PLANSAL');
const planedu = PLANES.find((p) => p.code === 'PLANEDU');

if (!plansal || !planedu) {
  throw new Error('Fixture inválida: PLANSAL/PLANEDU deben existir en el registry para este test.');
}

describe('IndicePlanes (§2–§3 — el índice de los N + el plan meta)', () => {
  it('canon del registry: exactamente 1 plan isMeta y 22 sin isMeta', () => {
    expect(PLAN_REGISTRY.filter((p) => p.isMeta)).toHaveLength(1);
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)).toHaveLength(22);
  });

  it('renderiza 23 filas cerradas; la primera es 01 + PLANSAL; el meta es 00 + PLANRUTA bajo su encabezado', () => {
    render(<IndicePlanes />);

    const filas = screen.getAllByRole('button', { expanded: false });
    expect(filas).toHaveLength(23);

    expect(filas[0]).toHaveTextContent('01');
    expect(filas[0]).toHaveTextContent('PLANSAL');

    expect(
      screen.getByRole('heading', { name: 'El plan meta · fuera de la cuenta' }),
    ).toBeInTheDocument();
    const filaMeta = screen.getByText('PLANRUTA').closest('button');
    expect(filaMeta).not.toBeNull();
    expect(filaMeta).toHaveTextContent('00');
  });

  it('apertura única: abrir PLANSAL muestra su summary y el link; abrir PLANEDU cierra PLANSAL y abre el suyo', () => {
    render(<IndicePlanes />);

    const filaPlansalAbrir = screen.getByText('PLANSAL').closest('button');
    if (!filaPlansalAbrir) throw new Error('fila PLANSAL no encontrada');
    fireEvent.click(filaPlansalAbrir);
    expect(screen.getByText(plansal.summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leer el documento →' })).toHaveAttribute(
      'href',
      '/planes/plansal',
    );
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    const filaPlaneduAbrir = screen.getByText('PLANEDU').closest('button');
    if (!filaPlaneduAbrir) throw new Error('fila PLANEDU no encontrada');
    fireEvent.click(filaPlaneduAbrir);
    expect(screen.queryByText(plansal.summary)).not.toBeInTheDocument();
    expect(screen.getByText(planedu.summary)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('click en una fila abierta la cierra (cero aria-expanded true)', () => {
    render(<IndicePlanes />);

    const filaPlansal = screen.getByText('PLANSAL').closest('button');
    if (!filaPlansal) throw new Error('fila PLANSAL no encontrada');
    fireEvent.click(filaPlansal);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    fireEvent.click(filaPlansal);
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });

  it('el encabezado del índice interpola PLAN_COUNT — ningún literal 22 suelto', () => {
    render(<IndicePlanes />);

    expect(
      screen.getByText(`Los ${PLAN_COUNT} planes · tocá para abrir`),
    ).toBeInTheDocument();
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
});
