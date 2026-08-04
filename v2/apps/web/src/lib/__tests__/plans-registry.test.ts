import { describe, expect, it } from 'vitest';

import {
  cargarCuerpoPlan,
  findPlanByCode,
  findPlanBySlug,
  PLAN_REGISTRY,
} from '~/lib/plans-registry';

describe('plans-registry (canon + carga diferida)', () => {
  it('canon: 27 temáticos + 1 meta', () => {
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)).toHaveLength(27);
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

  /**
   * **TODOS los del registro tienen cuerpo cargable, no sólo PLANJUS.**
   *
   * Este test existe por un fallo real: al entrar los cuatro PLANes nuevos
   * (23-26) el índice ya los listaba y la página de detalle mostraba «Este
   * expediente no abrió». El código estaba bien —era un bundle viejo— pero la
   * suite no tenía forma de distinguir una cosa de la otra, porque verificaba el
   * cuerpo de UN plan elegido a mano. Un plan agregado al índice sin su .mdx
   * pasaba en verde y sólo se veía en la web.
   */
  it('todos los planes del registro tienen cuerpo cargable', async () => {
    for (const plan of PLAN_REGISTRY) {
      const { cuerpo } = await cargarCuerpoPlan(plan.code);
      expect(cuerpo.length, `${plan.code}: cuerpo vacío o ausente`).toBeGreaterThan(1000);
    }
  });

  it('cargarCuerpoPlan rechaza un código que no existe', async () => {
    await expect(cargarCuerpoPlan('PLANVEJ')).rejects.toThrow(/PLANVEJ/);
  });
});
