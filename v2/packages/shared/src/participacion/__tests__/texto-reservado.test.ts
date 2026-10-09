import { describe, expect, it } from 'vitest';

import { TEXTO_RESERVADO } from '../../index.js';

describe('TEXTO_RESERVADO', () => {
  it('es la frase que la API ya mandaba, y sale del paquete compartido', () => {
    // Si esta frase cambia, cambian a la vez la base, la cinta de la Home y el detalle del
    // mapa; lo que no puede pasar es que cambie en uno solo.
    expect(TEXTO_RESERVADO).toBe('Texto reservado por su autoría.');
  });

  it('no trae comillas simples: va embebida como literal en el SQL', () => {
    expect(TEXTO_RESERVADO).not.toContain("'");
  });
});
