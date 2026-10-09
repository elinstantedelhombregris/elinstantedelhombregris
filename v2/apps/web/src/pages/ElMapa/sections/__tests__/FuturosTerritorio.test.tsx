import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FuturosTerritorio } from '../FuturosTerritorio';

const m = vi.hoisted(() => ({ useFichas: vi.fn() }));
vi.mock('~/lib/queries/fichas', () => ({ useFichas: m.useFichas }));
vi.mock('~/lib/queries/participacion', () => ({ useCampanas: () => ({ data: [] }) }));
vi.mock('~/components/participacion/Seguir', () => ({ Seguir: () => null }));

describe('Futuros del territorio', () => {
  beforeEach(() => {
    m.useFichas.mockReset();
    m.useFichas.mockReturnValue({ data: { fichas: [], total: 0 }, isLoading: false });
  });

  it('filtra por una campaña pedida por id', () => {
    const id = 'af81507f-f3fb-4a80-99f3-28f0f2377947';
    window.history.replaceState(null, '', `/el-mapa?campana=${id}`);
    render(<FuturosTerritorio lugar={null} />);
    expect(m.useFichas).toHaveBeenCalledWith(undefined, id);
  });

  it('una ficha tiene versiones: la lista dice «versión», no «revisión»', () => {
    m.useFichas.mockReturnValue({
      data: {
        fichas: [
          { id: 'f1', titulo: 'Educación en comunidad', territorioNombre: null, revision: 2 },
        ],
        total: 1,
      },
      isLoading: false,
    });
    window.history.replaceState(null, '', '/el-mapa');
    const { container } = render(<FuturosTerritorio lugar={null} />);
    expect(screen.getByText('Todo el país · versión 2')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/revisión/i);
  });

  it('una campaña por slug —la que usa el panel de aportes— no filtra: las fichas se piden por id', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=aportar&campana=mi-argentina-ideal');
    render(<FuturosTerritorio lugar={null} />);
    expect(m.useFichas).toHaveBeenCalledWith(undefined, undefined);
  });
});
