import { describe, expect, it } from 'vitest';

import { redactPublicValue } from './safety';

describe('public payload contact redaction', () => {
  it('redacts contact recursively without mistaking dates for phones', () => {
    expect(redactPublicValue({
      title: 'Escribí a red@example.org',
      nested: ['WhatsApp +54 261 555-1234', 'Disponible 2026-07-13'],
    })).toEqual({
      title: 'Escribí a [dato protegido]',
      nested: ['WhatsApp [dato protegido]', 'Disponible 2026-07-13'],
    });
  });
});
