import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DespertarVeil } from '../DespertarVeil';
import { MdxPapel } from '../MdxPapel';
import { PapelFooter } from '../PapelFooter';
import { PapelHeader } from '../PapelHeader';
import { PaperGrain } from '../PaperGrain';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

const RAW_CON_FRONTMATTER = `---
slug: plansal
code: PLANSAL
---

# Título

## Sección

Un párrafo con [un link](/el-mapa) y **bold**.
`;

describe('MdxPapel', () => {
  it('renderiza el markdown a headings/link/strong reales dentro de la prosa papel', () => {
    const { container } = render(<MdxPapel raw={RAW_CON_FRONTMATTER} />);

    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('h2')).not.toBeNull();
    expect(container.querySelector('a')).not.toBeNull();
    expect(container.querySelector('strong')).not.toBeNull();

    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root?.className).toMatch(/\bprose\b/);
    expect(root?.className).toMatch(/prose-headings:font-anton/);
    expect(root?.className).not.toMatch(/prose-invert/);
    expect(root?.className).not.toMatch(/font-serif/);
    expect(root?.className).not.toMatch(/iris-violet/);
  });

  it('descarta el frontmatter (regresión de renderMarkdown)', () => {
    const { container } = render(<MdxPapel raw={RAW_CON_FRONTMATTER} />);
    expect(container.textContent).not.toContain('slug:');
  });

  it('acepta className adicional sin perder las clases base', () => {
    const { container } = render(<MdxPapel raw="# Solo" className="mt-8" />);
    expect(container.firstElementChild?.className).toMatch(/\bprose\b/);
    expect(container.firstElementChild?.className).toMatch(/mt-8/);
  });
});

describe('El chrome papel no se imprime (§10.8)', () => {
  it('PapelHeader: la raíz <header> lleva print:hidden', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={qc}>
        <PapelHeader />
      </QueryClientProvider>,
    );
    expect(container.querySelector('header')?.className).toMatch(/print:hidden/);
  });

  it('PapelFooter: la raíz <footer> lleva print:hidden', () => {
    const { container } = render(<PapelFooter />);
    expect(container.querySelector('footer')?.className).toMatch(/print:hidden/);
  });

  it('PaperGrain: la raíz lleva print:hidden', () => {
    render(<PaperGrain />);
    const grain = document.querySelector('.paper-grain');
    expect(grain?.className).toMatch(/print:hidden/);
  });

  it('DespertarVeil: la raíz lleva print:hidden', () => {
    render(<DespertarVeil />);
    expect(screen.getByTestId('despertar-veil').className).toMatch(/print:hidden/);
  });
});
