import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BlogAuthor } from '../BlogAuthor';

const mocks = vi.hoisted(() => ({
  auth: { user: null as { id: number } | null, isLoading: false },
}));
vi.mock('~/lib/auth', () => ({
  readCsrfToken: () => 'csrf',
  useAuth: () => mocks.auth,
}));

function montar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={cliente}>
      <BlogAuthor />
    </QueryClientProvider>,
  );
}

describe('BlogAuthor', () => {
  it('sin sesión pide «ingresar», no «iniciar sesión»', () => {
    mocks.auth.user = null;
    const { container } = montar();
    expect(screen.getByRole('heading', { level: 1, name: 'Necesitás ingresar.' })).toBeVisible();
    expect(container.textContent).not.toMatch(/iniciar sesión/i);
  });
});
