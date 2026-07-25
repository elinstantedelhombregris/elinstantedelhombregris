/**
 * Registry de los planes, partido en dos por peso.
 *
 * El índice (frontmatter de los 23) es eager: lo consumen la landing, La idea y
 * La prueba, y son pocos KB. Los cuerpos suman 5,1 MB, así que se cargan con un
 * `import()` por plan — solo el documento que el visitante abrió.
 */
import { stripFrontmatter } from './markdown';
import { PLANES_INDEX } from './planes-index.generated';

export interface PlanRegistryEntry {
  /** Slug en minúscula usado en la URL (ej. «planjus»). */
  slug: string;
  /** Código en mayúscula como está en el frontmatter («PLANJUS»). */
  code: string;
  /** Título evocativo de la portada del documento. */
  title: string;
  /** Nombre institucional («Plan Nacional de…»). */
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
}

export const PLAN_REGISTRY: readonly PlanRegistryEntry[] = [...PLANES_INDEX].sort(
  (a, b) => a.orderIndex - b.orderIndex,
);

export function findPlanByCode(code: string): PlanRegistryEntry | undefined {
  const upper = code.toUpperCase();
  return PLAN_REGISTRY.find((p) => p.code === upper);
}

export function findPlanBySlug(slug: string): PlanRegistryEntry | undefined {
  const lower = slug.toLowerCase();
  return PLAN_REGISTRY.find((p) => p.slug === lower);
}

/** El H2 literal que separa el documento de su aparato de producción. */
const MARCADOR_FICHA = '## Ficha del expediente';

const cuerpos = import.meta.glob<string>('../../../../content/planes/*.mdx', {
  query: '?raw',
  import: 'default',
});

export interface PlanCuerpo {
  /** El documento como se lee. */
  cuerpo: string;
  /** Cabecera de auditoría + parches, para el pliegue. '' si no hay. */
  ficha: string;
}

export async function cargarCuerpoPlan(code: string): Promise<PlanCuerpo> {
  const cargar = cuerpos[`../../../../content/planes/${code.toUpperCase()}.mdx`];
  if (!cargar) throw new Error(`No hay documento para ${code}`);

  const raw = stripFrontmatter(await cargar());
  const corte = raw.indexOf(MARCADOR_FICHA);
  if (corte === -1) return { cuerpo: raw, ficha: '' };

  return {
    cuerpo: raw.slice(0, corte).trim(),
    ficha: raw.slice(corte + MARCADOR_FICHA.length).trim(),
  };
}
