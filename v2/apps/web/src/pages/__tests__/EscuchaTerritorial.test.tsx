import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EscuchaTerritorial } from '../EscuchaTerritorial';
import { tarea } from '../Iniciativas/__tests__/fixtures';

const lista = vi.hoisted(() => vi.fn());
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionLista: (ruta: string) => {
    lista(ruta);
    return {
      data: {
        pages: [
          {
            items: [
              { ...tarea, iniciativaSlug: 'escuela', iniciativaTitulo: 'Escuela', revisiones: 0 },
            ],
          },
        ],
      },
      isPending: false,
    };
  },
}));
vi.mock('../ElMapa/instrumento/BusquedaTerritorial', () => ({ BusquedaTerritorial: () => null }));
describe('Escucha territorial pública', () => {
  it('explica ausencias, separa el ejemplo ficticio y enlaza la tarea específica aun fuera de la primera página', () => {
    render(<EscuchaTerritorial />);
    expect(screen.getByText(/no se registra como un relevamiento realizado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver tarea, ausencias y resultados/ })).toHaveAttribute(
      'href',
      '/iniciativas/escuela?seccion=tareas&tarea=31',
    );
    expect(screen.getByText(/0 registros de evidencia con revisión/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'realizada' } });
    expect(lista).toHaveBeenLastCalledWith('/escuchas?estado=realizada');
    expect(screen.getByRole('link', { name: /Planear una escucha/ })).toHaveAttribute(
      'href',
      '/iniciativas/nueva?escucha=si',
    );
  });
});
