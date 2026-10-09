import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FormularioCampana } from '../Formulario';

const modelo = vi.hoisted(() => ({
  mutate: vi.fn(),
  error: null as { message: string } | null,
}));
vi.mock('~/lib/queries/participacion', () => ({
  useGuardarCampana: () => ({ mutate: modelo.mutate, isPending: false, error: modelo.error }),
}));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Selector oficial de territorio</p>,
}));
const montar = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <FormularioCampana />
    </QueryClientProvider>,
  );
const enviar = () => {
  const formulario = screen.getByRole('button', { name: /Guardar/ }).closest('form');
  if (!formulario) throw new Error('Falta el formulario.');
  fireEvent.submit(formulario);
};

beforeEach(() => {
  modelo.mutate.mockReset();
  modelo.error = null;
});
describe('El formulario de una campaña', () => {
  it('marca cada campo con error, con su nombre en español, y nunca con la clave interna', () => {
    montar();
    enviar();
    expect(modelo.mutate).not.toHaveBeenCalled();
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent(/^Revisá estos campos: .*Nombre de la campaña/);
    expect(alerta).not.toHaveTextContent(/titulo:|fechaDevolucion|metodoLectura/);
    const titulo = screen.getByLabelText('Nombre de la campaña');
    expect(titulo).toHaveAttribute('aria-invalid', 'true');
    // El borde de error le gana al borde común del campo.
    expect(titulo).toHaveClass('border-sello');
    expect(titulo).not.toHaveClass('border-tinta');
    const idError = titulo.getAttribute('aria-describedby')?.split(' ')[0] ?? '';
    expect(document.getElementById(idError)).toHaveTextContent(/Escribí al menos 8 caracteres/);
    // Un campo sin error no se marca.
    expect(screen.getByLabelText('Fecha prevista de devolución')).not.toHaveAttribute(
      'aria-invalid',
    );
    // El foco va al primer campo marcado.
    expect(titulo).toHaveFocus();
  });
  it('los temas, las etapas y la fecha tienen su propio mensaje', () => {
    montar();
    fireEvent.change(screen.getByLabelText('Fecha prevista de devolución'), {
      target: { value: '' },
    });
    const [nombreDeLaEtapa] = screen.getAllByLabelText('Nombre', { selector: 'input' });
    if (!nombreDeLaEtapa) throw new Error('Falta el nombre de la primera etapa.');
    fireEvent.change(nombreDeLaEtapa, { target: { value: 'No' } });
    enviar();
    expect(screen.getByLabelText('Temas, separados por coma')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('Fecha prevista de devolución')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Elegí una fecha válida.')).toBeInTheDocument();
    expect(nombreDeLaEtapa).toHaveAttribute('aria-invalid', 'true');
  });
  it('guardar dice por qué no anda hasta que el equipo acepta cuidar el recorrido', () => {
    montar();
    const guardar = screen.getByRole('button', { name: 'Guardar borrador de campaña' });
    expect(guardar).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Marcá la casilla de arriba/)).toBeVisible();
    fireEvent.click(screen.getByLabelText(/El equipo acepta cuidar este recorrido/));
    expect(guardar).not.toHaveAttribute('aria-disabled');
    expect(screen.queryByText(/Marcá la casilla de arriba/)).not.toBeInTheDocument();
  });
  it('los mensajes del servidor en varias líneas conservan sus saltos', () => {
    modelo.error = { message: 'Primer problema.\nSegundo problema.' };
    montar();
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Primer problema.');
    expect(alerta.parentElement).toHaveClass('whitespace-pre-line');
  });
  it('habla de campaña, etapas y lugares', () => {
    montar();
    expect(screen.getByText('Etapas y fechas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar etapa' })).toBeInTheDocument();
    expect(screen.getByText('Lugares incluidos')).toBeInTheDocument();
    expect(screen.getByLabelText('Por la web')).toBeChecked();
    expect(screen.queryByText('Territorios incluidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Fases y salidas')).not.toBeInTheDocument();
  });
});
