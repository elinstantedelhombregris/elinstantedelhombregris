import { describe, expect, it } from 'vitest';

import { listeningPublicPreview, publicListeningFacet } from './listening-privacy';

describe('escucha privada-primero', () => {
  const privateRow = {
    kind: 'dream' as const,
    source: 'lived' as const,
    theme: 'housing' as const,
    horizon: 'generation' as const,
    scope: 'neighborhood' as const,
    importance: 5,
    supportWanted: false,
    statement: 'Vivo en Calle Secreta 123 y mi teléfono es 2615555555',
    desiredOutcome: 'Este relato tampoco debe salir',
  };

  it('proyecta sólo facetas controladas y nunca el relato', () => {
    const projection = publicListeningFacet(privateRow);
    expect(projection).toEqual({
      kind: 'dream', source: 'lived', theme: 'housing', horizon: 'generation',
      scope: 'neighborhood', importance: 5, supportWanted: false,
    });
    expect(JSON.stringify(projection)).not.toContain('Calle Secreta');
    expect(JSON.stringify(projection)).not.toContain('2615555555');
    expect(JSON.stringify(projection)).not.toContain('relato');
  });

  it('explica exactamente las facetas compartidas', () => {
    expect(listeningPublicPreview(privateRow)).toBe(
      'Sueño · Vivienda · Una generación · Mi barrio · prioridad 5/5',
    );
  });
});
