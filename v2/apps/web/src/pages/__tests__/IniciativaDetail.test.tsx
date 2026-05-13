import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('~/lib/queries/iniciativas', () => ({
  useIniciativa: () => ({
    data: {
      iniciativa: {
        id: 1,
        slug: 'mejor-barrio',
        title: 'Mejor barrio',
        summary: 'Iniciativa de prueba',
        kind: 'community',
        planCode: null,
        bodyMarkdown: null,
        coverImageUrl: null,
        status: 'open',
        memberCount: 3,
        createdAt: '2026-05-13T00:00:00Z',
        updatedAt: '2026-05-13T00:00:00Z',
      },
    },
    isLoading: false,
    isError: false,
  }),
  useJoinIniciativa: () => ({ mutate: vi.fn(), isPending: false }),
  useLeaveIniciativa: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('wouter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wouter')>();
  return {
    ...actual,
    useRoute: () => [true, { slug: 'mejor-barrio' }] as const,
    Redirect: () => null,
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

import { IniciativaDetail } from '../IniciativaDetail';

describe('IniciativaDetail', () => {
  it('renders title, summary and member count', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <IniciativaDetail />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Mejor barrio')).toBeInTheDocument();
    expect(screen.getByText('Iniciativa de prueba')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unirme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });
});
