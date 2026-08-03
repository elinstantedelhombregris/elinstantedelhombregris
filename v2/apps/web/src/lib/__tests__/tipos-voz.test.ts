import { TIPOS_VOZ_CIVICOS } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { TIPOS_VOZ } from '../tipos-voz';

describe('los tipos de voz de la web y los del núcleo', () => {
  it('son la misma lista, en el mismo orden', () => {
    // `civic-core` no puede importar de la app, así que la lista está en dos
    // lugares. Si divergen, el motor contaría una composición que la UI no
    // ofrece —o al revés— y nadie se enteraría. Esta es la guarda.
    expect([...TIPOS_VOZ]).toEqual([...TIPOS_VOZ_CIVICOS]);
  });
});
