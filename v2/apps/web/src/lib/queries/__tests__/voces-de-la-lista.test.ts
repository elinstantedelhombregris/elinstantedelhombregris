import { TEXTO_RESERVADO } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { vocesDeLaLista } from '../analytics';

describe('vocesDeLaLista', () => {
  it('deja afuera los aportes retirados, también los que llegan con el aviso de texto reservado', () => {
    // Lo que devolvía producción el 11/11/2026 sin ningún aporte vigente (D-167).
    const lista = [
      { idPublico: 'a', tipo: 'sueño', texto: '', estado: 'retirada' },
      { idPublico: 'b', tipo: 'sueño', texto: TEXTO_RESERVADO, estado: 'retirada' },
    ];
    expect(vocesDeLaLista(lista)).toEqual([]);
  });

  it('conserva los publicados con texto y descarta los vacíos', () => {
    const lista = [
      {
        idPublico: 'a',
        tipo: 'sueño',
        texto: 'Que el tren vuelva a mi pueblo.',
        estado: 'enviada',
      },
      { idPublico: 'b', tipo: 'sueño', texto: '   ', estado: 'enviada' },
      { idPublico: 'c', tipo: 'basta', texto: null },
      { idPublico: 'd', tipo: 'sueño', texto: TEXTO_RESERVADO, estado: 'enviada' },
    ];
    expect(vocesDeLaLista(lista)).toEqual([
      { id: 'a', texto: 'Que el tren vuelva a mi pueblo.', categoria: 'sueño' },
      { id: 'd', texto: TEXTO_RESERVADO, categoria: 'sueño' },
    ]);
  });
});
