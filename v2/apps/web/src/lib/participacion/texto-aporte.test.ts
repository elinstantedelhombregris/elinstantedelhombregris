import { describe, expect, it } from 'vitest';

import { unirRespuestas } from './texto-aporte';

describe('unirRespuestas', () => {
  it('une solo lo escrito, sin espacios sobrantes', () => {
    expect(unirRespuestas(['  Una escena. ', '', '   ', 'Que funcione.'])).toBe(
      'Una escena.\n\nQue funcione.',
    );
    expect(unirRespuestas(['', '', ''])).toBe('');
  });
});
