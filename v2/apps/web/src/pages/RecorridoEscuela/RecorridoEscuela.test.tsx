import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { RecorridoEscuela } from './index';

const publicar = vi.hoisted(() => vi.fn());
vi.mock('~/lib/api', () => ({ api: { post: publicar, patch: publicar } }));
vi.mock('./EnsayoLocal', () => ({ EnsayoLocal: () => null }));
const etapa = (n: number) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${n}\\.`) }));
it('recorre el ciclo aislado, conserva objeciones y distingue declaración de revisión', () => {
  render(<RecorridoEscuela />);
  expect(screen.getByRole('heading', { name: 'Imaginar y ubicar', exact: true })).not.toHaveFocus();
  expect(screen.getByText(/Ejemplo ficticio. Podés practicar sin cuenta/)).toBeInTheDocument();
  etapa(6);
  expect(screen.getByRole('heading', { name: 'Revisar el resultado', exact: true })).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Simular revisión de otra cuenta' })).toBeDisabled();
  etapa(4);
  fireEvent.change(screen.getByLabelText('Ficha de ejemplo donde devolver los resultados'), {
    target: { value: 'escuela' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Simular vínculo con la ficha' }));
  expect(screen.getByRole('button', { name: 'Simular aceptación personal' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Simular ingreso al equipo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Simular aceptación personal' }));
  etapa(5);
  expect(screen.getByRole('button', { name: 'Declarar registro realizado' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar tarea de ejemplo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Declarar registro realizado' }));
  expect(screen.getByRole('status')).toHaveTextContent('revisión pendiente');
  etapa(6);
  fireEvent.click(screen.getByRole('button', { name: 'Simular pedido de más información' }));
  expect(screen.getByRole('status')).toHaveTextContent('sigue pendiente de revisión');
  fireEvent.click(screen.getByRole('button', { name: 'Simular revisión de otra cuenta' }));
  etapa(7);
  fireEvent.click(screen.getByRole('button', { name: 'Simular devolución a participantes' }));
  expect(screen.getByRole('status')).toHaveTextContent('La puntualidad sigue sin evaluarse');
  expect(screen.getByText(/cambiar el ingreso puede complicar el trabajo/)).toBeInTheDocument();
  expect(publicar).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reiniciar el ejemplo' }));
  etapa(4);
  expect(screen.getByLabelText('Ficha de ejemplo donde devolver los resultados')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Simular aceptación personal' })).toBeDisabled();
});
