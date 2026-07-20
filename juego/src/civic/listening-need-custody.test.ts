import { describe, expect, it } from 'vitest';

import { listeningNeedDraftFields } from './listening-need';

describe('pedido derivado de una escucha', () => {
  it('deriva sólo campos controlados y nunca copia el relato o la custodia', () => {
    const privateListening = {
      theme: 'food' as const,
      importance: 5,
      statement: 'Vivo en Calle Secreta 123 y necesito ayuda urgente',
      desiredOutcome: 'Mi teléfono es 2615555555',
    };

    const projection = listeningNeedDraftFields(privateListening, {
      quantity: 12,
      unit: '  raciones  ',
      urgency: 4,
    });

    expect(projection).toEqual({
      category: 'food',
      title: 'Necesidad de Alimentación',
      description: null,
      quantity: 12,
      unit: 'raciones',
      urgency: 4,
    });
    const serialized = JSON.stringify(projection);
    expect(serialized).not.toContain('Calle Secreta');
    expect(serialized).not.toContain('2615555555');
    expect(serialized).not.toContain('custod');
  });

  it('normaliza cantidades inválidas y acota la urgencia', () => {
    expect(listeningNeedDraftFields(
      { theme: 'care', importance: 3 },
      { quantity: Number.NaN, unit: '   ', urgency: 99 },
    )).toMatchObject({ quantity: null, unit: null, urgency: 5 });
  });
});
