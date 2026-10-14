import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IniciativaDocumento } from '../IniciativaDocumento';

import type * as Wouter from 'wouter';

const m = vi.hoisted(() => ({ error: false, refetch: vi.fn() }));
vi.mock('~/lib/queries/iniciativas', () => ({
  useIniciativa: () => ({
    data: {
      iniciativa: {
        title: 'Escuela',
        summary: 'Horarios escolares',
        bodyMarkdown: '<img src="/x" onerror="alert(1)">\n[Enlace](javascript:alert(1))',
      },
    },
    isError: m.error,
    refetch: m.refetch,
  }),
}));
vi.mock('wouter', async (actual) => ({
  ...(await actual<typeof Wouter>()),
  useRoute: () => [true, { slug: 'escuela' }],
}));
describe('Documento público de iniciativa', () => {
  it('el contenido editable se presenta como texto y una falla no borra la última lectura', () => {
    const { container, rerender } = render(<IniciativaDocumento />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(screen.getByText(/onerror/)).toBeInTheDocument();
    m.error = true;
    rerender(<IniciativaDocumento />);
    expect(screen.getByRole('alert')).toHaveTextContent('última lectura disponible');
    expect(screen.getByText(/onerror/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(m.refetch).toHaveBeenCalledOnce();
  });
});
