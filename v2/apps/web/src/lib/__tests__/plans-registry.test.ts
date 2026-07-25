import { describe, expect, it } from 'vitest';

import {
  cargarCuerpoPlan,
  findPlanByCode,
  findPlanBySlug,
  PLAN_REGISTRY,
} from '~/lib/plans-registry';

describe('plans-registry (canon + carga diferida)', () => {
  it('canon: 22 temáticos + 1 meta', () => {
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)).toHaveLength(22);
    expect(PLAN_REGISTRY.filter((p) => p.isMeta)).toHaveLength(1);
  });

  it('viene ordenado por orderIndex y el primero temático es el ordinal 1', () => {
    const ordenes = PLAN_REGISTRY.map((p) => p.orderIndex);
    expect([...ordenes].sort((a, b) => a - b)).toEqual(ordenes);
    expect(PLAN_REGISTRY[0]?.code).toBe('PLANRUTA');
    expect(PLAN_REGISTRY.find((p) => !p.isMeta)?.code).toBe('PLANJUS');
  });

  it('cada entrada trae los dos registros de título', () => {
    for (const plan of PLAN_REGISTRY) {
      expect(plan.title.length, `${plan.code}: sin título evocativo`).toBeGreaterThan(0);
      expect(
        plan.nombreInstitucional.startsWith('Plan Nacional'),
        `${plan.code}: nombreInstitucional = ${plan.nombreInstitucional}`,
      ).toBe(true);
    }
  });

  it('la entrada del índice NO trae el cuerpo', () => {
    expect(PLAN_REGISTRY[0]).not.toHaveProperty('body');
  });

  it('findPlanByCode y findPlanBySlug encuentran el mismo plan', () => {
    expect(findPlanByCode('planjus')?.code).toBe('PLANJUS');
    expect(findPlanBySlug('planjus')?.code).toBe('PLANJUS');
    expect(findPlanBySlug('planvej')).toBeUndefined();
  });

  it('cargarCuerpoPlan separa cuerpo y ficha', async () => {
    const { cuerpo, ficha } = await cargarCuerpoPlan('PLANJUS');

    expect(cuerpo.length).toBeGreaterThan(1000);
    expect(cuerpo).not.toContain('Ficha del expediente');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
    expect(ficha).toContain('REVISION_PROFUNDA');
  });

  it('cargarCuerpoPlan rechaza un código que no existe', async () => {
    await expect(cargarCuerpoPlan('PLANVEJ')).rejects.toThrow(/PLANVEJ/);
  });
});
