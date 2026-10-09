import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GestionFase } from '../GestionFase';

import type { CampanaPublica, EstadoCampana } from '@v2/shared';

import { PASOS_CAMPANA } from '~/components/participacion/constantes';

const modelo = vi.hoisted(() => ({
  mutate: vi.fn(),
  error: null as { message: string } | null,
}));
vi.mock('~/lib/queries/participacion', () => ({
  useEstadoCampana: () => ({ mutate: modelo.mutate, isPending: false, error: modelo.error }),
}));
const campana = (estado: EstadoCampana): CampanaPublica =>
  ({ id: '3718dc73-9774-4d3b-b23d-8bf290ffec30', revision: 4, estado }) as CampanaPublica;
const opciones = () =>
  Array.from(screen.getByLabelText<HTMLSelectElement>('Próxima etapa').options).map((o) => o.value);

beforeEach(() => {
  modelo.mutate.mockReset();
  modelo.error = null;
});
describe('Cambiar la campaña de etapa', () => {
  it.each([
    ['borrador', ['programada', 'abierta']],
    ['programada', ['abierta', 'pausada']],
    ['abierta', ['pausada', 'en_devolucion']],
    ['pausada', ['abierta', 'en_devolucion']],
    ['en_devolucion', ['abierta', 'cerrada']],
  ] as const)('desde «%s» solo ofrece los pasos que el recorrido permite', (estado, esperadas) => {
    render(<GestionFase campana={campana(estado)} />);
    expect(opciones()).toEqual(esperadas);
  });
  it('una campaña cerrada no ofrece ningún paso y lo dice', () => {
    render(<GestionFase campana={campana('cerrada')} />);
    expect(screen.queryByLabelText('Próxima etapa')).not.toBeInTheDocument();
    expect(
      screen.getByText(/ya está cerrada y no admite más cambios de etapa/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar el cambio' })).not.toBeInTheDocument();
  });
  it('el botón dice por qué no anda hasta que el motivo alcanza', () => {
    render(<GestionFase campana={campana('abierta')} />);
    const boton = screen.getByRole('button', { name: 'Registrar el cambio' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/faltan 10 caracteres/)).toBeVisible();
    fireEvent.click(boton);
    expect(modelo.mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Por qué damos este paso'), {
      target: { value: 'Revisamos la pregunta.' },
    });
    expect(boton).not.toHaveAttribute('aria-disabled');
    fireEvent.click(boton);
    expect(modelo.mutate).toHaveBeenCalledWith(
      { revision: 4, estado: 'pausada', motivo: 'Revisamos la pregunta.' },
      expect.objectContaining({ onSuccess: expect.any(Function) as unknown }),
    );
  });
  it('al registrar el cambio avisa en qué etapa quedó', () => {
    render(<GestionFase campana={campana('abierta')} />);
    fireEvent.change(screen.getByLabelText('Próxima etapa'), {
      target: { value: 'en_devolucion' },
    });
    fireEvent.change(screen.getByLabelText('Por qué damos este paso'), {
      target: { value: 'Terminó la recepción de aportes.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar el cambio' }));
    const [, callbacks] = modelo.mutate.mock.calls[0] as [unknown, { onSuccess: () => void }];
    callbacks.onSuccess();
    return screen
      .findByText('Listo: la campaña pasó a “Preparando la devolución”.')
      .then((aviso) => {
        expect(aviso).toBeInTheDocument();
      });
  });
  it('muestra el error del servidor, por ejemplo cuando no es administrador', () => {
    modelo.error = { message: 'Esta acción requiere permisos de administrador.' };
    render(<GestionFase campana={campana('abierta')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('permisos de administrador');
  });
});
describe('PASOS_CAMPANA', () => {
  it('copia exactamente los pasos que acepta el servidor', () => {
    // El servidor manda: si cambia su recorrido, esta tabla (y esta pantalla) tienen que seguirlo.
    const ruta = resolve(import.meta.dirname, '../../../../../api/src/features/campanas/routes.ts');
    const fuente = readFileSync(ruta, 'utf8');
    const literal = /const PASOS[^=]*=\s*(\{[\s\S]*?\n\});/.exec(fuente)?.[1];
    if (!literal) throw new Error('No encontré PASOS en apps/api/src/features/campanas/routes.ts.');
    const json = literal
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1');
    expect(PASOS_CAMPANA).toEqual(JSON.parse(json));
  });
});
