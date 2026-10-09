import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MisProcesos } from '../MiEspacio/MisProcesos';

import type { EspacioPersonal } from '@v2/shared';

type Procesos = NonNullable<EspacioPersonal['procesos']>;

describe('Mis procesos — una palabra por concepto', () => {
  it('una ficha tiene versiones y una campaña tiene ediciones', () => {
    const procesos = [
      {
        tipo: 'ficha',
        id: 'f1',
        titulo: 'Educación en comunidad',
        href: '/fichas/f1',
        revision: 3,
      },
      { tipo: 'campana', id: 'c1', titulo: 'Cuidar el barrio', href: '/campanas/c1', revision: 2 },
    ] as unknown as Procesos;
    const { container } = render(
      <MisProcesos procesos={procesos} puedeArmarFicha={false} esAdmin={false} />,
    );
    expect(screen.getByText(/Ficha · versión\s*3/)).toBeInTheDocument();
    expect(screen.getByText(/Campaña · edición\s*2/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/revisión/i);
  });
});
