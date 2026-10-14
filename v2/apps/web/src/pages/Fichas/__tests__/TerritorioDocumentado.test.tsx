import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { TerritorioDocumentado } from '../cuaderno/TerritorioDocumentado';

vi.mock('../consultas', () => ({
  useLugar: () => ({ data: { name: 'Villa María' }, isError: false }),
}));
it('muestra el nombre del catálogo y conserva el territorio al volver al mapa', () => {
  render(<TerritorioDocumentado id={123} />);
  expect(screen.getByRole('link', { name: 'Villa María' })).toHaveAttribute(
    'href',
    '/el-mapa?lugar=123',
  );
});
