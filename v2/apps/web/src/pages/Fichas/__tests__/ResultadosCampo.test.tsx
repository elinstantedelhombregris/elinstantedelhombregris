import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResultadosCampo } from '../ResultadosCampo';
const m = vi.hoisted(() => ({ error: false, retirada: false }));
vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    isError: m.error,
    isPending: false,
    data: {
      pages: [
        {
          items: [
            {
              id: 1,
              titulo: 'Resumen',
              texto: 'Observaciones autorizadas',
              retirada: m.retirada,
              revisada: false,
              tareaId: 31,
              tareaTitulo: 'Escuchar horarios',
              iniciativaSlug: 'escuela',
            },
          ],
        },
      ],
    },
  }),
}));
describe('Devolución de campo', () => {
  it('muestra procedencia y estado sin confundir evidencia con futuro alcanzado', () => {
    m.retirada = false;
    m.error = false;
    render(<ResultadosCampo id="ficha" />);
    expect(screen.getByText('Pendiente de revisión independiente')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver tarea: Escuchar horarios' })).toHaveAttribute(
      'href',
      '/iniciativas/escuela?seccion=tareas&tarea=31',
    );
  });
  it('oculta también un texto antiguo si el resultado fue retirado', () => {
    m.retirada = true;
    render(<ResultadosCampo id="ficha" />);
    expect(screen.queryByText('Observaciones autorizadas')).not.toBeInTheDocument();
    expect(screen.getByText('Resultado retirado')).toBeInTheDocument();
  });
});
