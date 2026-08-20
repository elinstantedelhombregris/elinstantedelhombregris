import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EncabezadoEstante } from '../sections/EncabezadoEstante';

describe('EncabezadoEstante — § 0N, la gramática única de los estantes', () => {
  it('rinde § num — nombre como h2 y el link «ver todo» con flecha', () => {
    render(
      <EncabezadoEstante
        num="05"
        nombre="La bitácora"
        verTodo={{ href: '/bitacora', label: 'Ver la bitácora entera' }}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: '§ 05 — La bitácora' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la bitácora entera →' })).toHaveAttribute(
      'href',
      '/bitacora',
    );
  });

  it('sin verTodo rinde children como meta derecha', () => {
    render(<EncabezadoEstante num="02" nombre="Los ensayos">4 ciclos</EncabezadoEstante>);
    expect(screen.getByText('4 ciclos')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
