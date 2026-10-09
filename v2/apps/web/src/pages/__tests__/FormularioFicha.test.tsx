import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormularioFicha } from '../Fichas/FormularioFicha';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

vi.mock('~/lib/queries/fichas', () => ({
  useGuardarFicha: () => ({ isPending: false, isError: false, error: null, mutate: vi.fn() }),
}));
vi.mock('../Fichas/SeleccionarFuentes', () => ({ SeleccionarFuentes: () => null }));
vi.mock('../ElMapa/instrumento/BusquedaTerritorial', () => ({ BusquedaTerritorial: () => null }));

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const C = '33333333-3333-4333-8333-333333333333';
const NUEVA = '44444444-4444-4444-8444-444444444444';
const LARGO = `${'Una escuela que queda cerca y abre de noche. '.repeat(8)}Fin.`;

const base: ContenidoFicha = {
  titulo: 'Una pregunta de prueba',
  territorioId: null,
  temas: [],
  situacion: '',
  futuro: '',
  proximaTarea: '',
  vinculos: [
    { senalId: A, relacion: 'describe' },
    { senalId: B, relacion: 'evidencia' },
    { senalId: C, relacion: 'inspira' },
  ],
};
const ficha: FichaFuturo = {
  id: '99999999-9999-4999-8999-999999999999',
  revision: 1,
  contenido: base,
  creadaEn: '2026-10-01T00:00:00.000Z',
  actualizadaEn: '2026-10-01T00:00:00.000Z',
  territorioNombre: null,
  puedoEditar: true,
  historial: [],
  aportes: [
    { senalId: A, relacion: 'describe', disponible: true, texto: LARGO, estado: 'enviada' },
    { senalId: B, relacion: 'evidencia', disponible: true, texto: null, estado: 'enviada' },
    { senalId: C, relacion: 'inspira', disponible: false, texto: null, estado: null },
  ],
};

const fila = (texto: RegExp) => screen.getByText(texto).closest('li') as HTMLElement;

describe('Ficha de futuro: aportes enlazados en el formulario', () => {
  it('el enlace al aporte se abre en otra pestaña para no perder la ficha sin guardar', () => {
    render(
      <FormularioFicha
        inicial={base}
        nombreTerritorio="Argentina"
        ficha={ficha}
        guardada={vi.fn()}
      />,
    );
    const enlaces = screen.getAllByRole('link', {
      name: 'Ver el aporte (se abre en otra pestaña)',
    });
    // El tercero dejó de estar disponible: no se ofrece abrirlo.
    expect(enlaces).toHaveLength(2);
    expect(enlaces[0]).toHaveAttribute('href', `/senal/${A}`);
    for (const enlace of enlaces) {
      expect(enlace).toHaveAttribute('target', '_blank');
      expect(enlace).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('muestra un extracto del texto del aporte y no su identificador', () => {
    render(
      <FormularioFicha
        inicial={base}
        nombreTerritorio="Argentina"
        ficha={ficha}
        guardada={vi.fn()}
      />,
    );
    const primera = fila(/Una escuela que queda cerca/);
    const texto = within(primera).getByText(/Una escuela que queda cerca/).textContent;
    expect(texto.startsWith('«Una escuela que queda cerca y abre de noche.')).toBe(true);
    expect(texto.endsWith('…»')).toBe(true);
    expect(texto.length).toBeLessThan(LARGO.length);
    expect(texto).not.toContain('Fin.');
    expect(primera).toHaveTextContent('Describe la situación');
    expect(primera).not.toHaveTextContent(A);
  });

  it('cuenta lo que pasa con un aporte reservado o retirado', () => {
    render(
      <FormularioFicha
        inicial={base}
        nombreTerritorio="Argentina"
        ficha={ficha}
        guardada={vi.fn()}
      />,
    );
    expect(fila(/Texto reservado por su autor\./)).not.toHaveTextContent(B);
    const retirado = fila(/dejó de estar disponible/);
    expect(retirado).not.toHaveTextContent(C);
    expect(within(retirado).queryByRole('link')).toBeNull();
    expect(within(retirado).getByRole('button', { name: 'Quitar vínculo 3' })).toBeInTheDocument();
  });

  it('un vínculo recién agregado, del que no se conoce el texto, conserva su identificador y también abre aparte', () => {
    render(
      <FormularioFicha
        inicial={{ ...base, vinculos: [] }}
        nombreTerritorio="Argentina"
        guardada={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Enlace o identificador del aporte'), {
      target: { value: `https://basta.example/senal/${NUEVA}` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar vínculo' }));
    const item = fila(new RegExp(NUEVA));
    const enlace = within(item).getByRole('link', {
      name: 'Ver el aporte (se abre en otra pestaña)',
    });
    expect(enlace).toHaveAttribute('href', `/senal/${NUEVA}`);
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('quitar un vínculo no recarga ni borra lo ya escrito', () => {
    render(
      <FormularioFicha
        inicial={base}
        nombreTerritorio="Argentina"
        ficha={ficha}
        guardada={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Pregunta o título/), {
      target: { value: 'Un título que todavía no se guardó' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar vínculo 1' }));
    expect(screen.queryByText(/Una escuela que queda cerca/)).toBeNull();
    expect(screen.getByLabelText(/Pregunta o título/)).toHaveValue(
      'Un título que todavía no se guardó',
    );
  });
});
