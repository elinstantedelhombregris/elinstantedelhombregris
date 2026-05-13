import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PropuestaDetail } from '../PropuestaDetail';

import type { ReactNode } from 'react';
import type * as Wouter from 'wouter';

vi.mock('~/lib/queries/mandato', () => ({
  usePropuestaById: () => ({
    data: {
      proposal: {
        id: 1,
        title: 'Más agua para mi barrio',
        summary: 'Una propuesta de prueba.',
        bodyMarkdown: null,
        status: 'voting',
        voteScore: 3,
        voteCount: 5,
        provinceId: null,
        authorId: 99,
        createdAt: '2026-05-13T00:00:00Z',
        updatedAt: '2026-05-13T00:00:00Z',
      },
    },
    isLoading: false,
    isError: false,
  }),
  useVotePropuesta: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock('wouter', async (importOriginal) => {
  const actual = await importOriginal<typeof Wouter>();
  return {
    ...actual,
    useRoute: () => [true, { id: '1' }] as const,
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

describe('PropuestaDetail', () => {
  it('disables vote buttons when not authenticated', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <PropuestaDetail />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Más agua para mi barrio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '-1' })).toBeDisabled();
    expect(screen.getByText(/Ingresá/)).toBeInTheDocument();
  });
});
