import { describe, expect, it } from 'vitest';
import { latidoVencido, puedeDarPulso } from './pulsos';
import { puedeResolver, transicionValida } from './mision';

// El contrato que repos-protocolo.ts DEBE cumplir (documentado y testeado acá;
// repos delega en estas funciones — cualquier bypass rompe la revisión de código):
describe('contrato repos-protocolo ↔ motor puro', () => {
  it('resolver una misión coordinada exige rol coordinador', () => {
    expect(transicionValida('verificacion', 'resuelta')).toBe(true);
    expect(puedeResolver('coordinada', 'miembro', 99, 99)).toBe(false);
  });
  it('el sexto pulso del día se rechaza aunque el target sea nuevo', () => {
    expect(puedeDarPulso(5, false)).toEqual({ ok: false, motivo: 'sin-presupuesto' });
  });
  it('las aceptaciones de consentimiento son latidos VIVOS: un latido de hace 8 días no cuenta', () => {
    expect(latidoVencido('2026-07-11T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(true);
    expect(latidoVencido('2026-07-15T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(false);
  });
});
