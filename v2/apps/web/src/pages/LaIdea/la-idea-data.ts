import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * Copy estático de La idea (spec docs/specs/2026-07-22-la-idea-papel-y-tinta.md).
 * Las únicas cifras de la página son PLAN_COUNT (registry MDX, real) y el
 * conteo de voces del Cap III (useVocesCount, API real).
 */

export interface RolRow {
  num: string;
  a: string;
  b: string;
  body: string;
}

export const ROLES: readonly RolRow[] = [
  {
    num: '01',
    a: 'La ciudadanía',
    b: 'diseña.',
    body: 'La que vive el país es la que sabe dónde duele. Vos soltás tu voz en el mapa; miles de voces convergen; de esa convergencia sale el mandato: el país pedido por escrito. Nadie interpreta lo que quisiste decir. Nadie firma en tu nombre.',
  },
  {
    num: '02',
    a: 'El Estado',
    b: 'administra.',
    body: 'Técnicos que gestionan lo que la ciudadanía diseñó: miden, registran, protegen, garantizan que nada se caiga entre un gobierno y el siguiente. Gerentes del país, no dueños. Y con otro tablero: además del PBI, cuánta dignidad sostiene una persona, cuánta confianza circula entre vecinos, cuánta belleza funcional sale a la calle.',
  },
  {
    num: '03',
    a: 'La política',
    b: 'ejecuta.',
    body: 'El que quiera un cargo firma el mandato ciudadano antes de pedirte el voto. Después ejecuta lo diseñado y rinde cuentas en público, con calendario. Empleada del diseño, no autora. Si no cumple, el mismo método la deja afuera.',
  },
];

export interface CicloPaso {
  label: string;
  acento?: 'violeta' | 'verde';
}

export const CICLO: readonly CicloPaso[] = [
  { label: 'tu voz', acento: 'violeta' },
  { label: 'el mandato' },
  { label: 'los planes' },
  { label: 'la ejecución' },
  { label: 'la auditoría', acento: 'verde' },
];

export interface SinLiderCard {
  stamp: string;
  body: string;
}

export const SIN_LIDER: readonly SinLiderCard[] = [
  {
    stamp: 'Sin líder',
    body: 'Un líder es un punto único de falla: se compra, se cansa, se equivoca o se va. Acá decide el método, y al método no lo podés sobornar ni jubilar. Si mañana desaparece el que escribió todo esto, no cambia nada. Esa es la idea.',
  },
  {
    stamp: 'Sin partido',
    body: 'Un partido necesita ganar elecciones, y para ganar necesita prometer lo que sea. Un método solo necesita funcionar. No competimos por los cargos: los condicionamos. El que quiera uno, firma el mandato.',
  },
  {
    stamp: 'Sin excusas',
    body: 'La parte incómoda: si no hay nadie arriba, no queda a quién echarle la culpa. La ciudadanía diseña — entonces la ciudadanía responde. Tu silencio también firma.',
  },
];

/** Planes reales (sin PLANRUTA, que es meta) — mismo criterio que la landing. */
export const PLAN_COUNT = PLAN_REGISTRY.filter((p) => !p.isMeta).length;
