/**
 * Colecciones — progreso de constelaciones (spec §3.1).
 *
 * Regla de asignación (documentada y determinística):
 * - Solo cuentan estrellas-señal (la estrella de amistad no es señal).
 * - Una estrella contada para una constelación COMPLETADA no se reutiliza
 *   para otra. La completación es PEGAJOSA: las estrellas ya persistidas con
 *   `constelacionId` pertenecen a esa constelación para siempre — ninguna
 *   receta puede robarlas después (si no, agregar una estrella podría
 *   "des-completar" una constelación ya celebrada).
 * - Cuando una constelación se puede completar con el pool libre, consume
 *   GREEDY CRONOLÓGICO: recorremos las constelaciones en su orden de
 *   contenido y cada una que completa toma las estrellas libres más antiguas
 *   de cada tipo que pida (createdAt ascendente, desempate por id). Como
 *   completar solo saca estrellas del pool, una pasada en orden alcanza.
 * - Las constelaciones NO completadas muestran su progreso contra el pool
 *   libre entero (pueden "compartir" estrellas entre sí hasta que alguna
 *   complete y las consuma de verdad).
 */

import type { ConstelacionReceta, Star, TipoSenal } from './types';

const SENALES: readonly TipoSenal[] = [
  'dream',
  'need',
  'basta',
  'value',
  'compromiso',
  'recurso',
];

const esSenal = (tipo: Star['tipo']): tipo is TipoSenal =>
  (SENALES as readonly string[]).includes(tipo);

export interface ProgresoConstelacion {
  constelacionId: string;
  completada: boolean;
  /** Por cada tipo de la receta: cuántas tenés vs. cuántas pide. */
  porTipo: Partial<Record<TipoSenal, { tiene: number; necesita: number }>>;
  /** Tipos con déficit y cuántas faltan (vacío si completada). */
  faltantes: Partial<Record<TipoSenal, number>>;
}

export interface ResultadoColecciones {
  /** En el mismo orden que las constelaciones recibidas. */
  progresos: ProgresoConstelacion[];
  /**
   * starId → constelacionId SOLO de las asignaciones nuevas de este cálculo
   * (las que la capa DB tiene que persistir en `stars.constelacionId`).
   */
  asignaciones: Record<string, string>;
}

const ordenCronologico = (a: Star, b: Star): number =>
  a.createdAt < b.createdAt
    ? -1
    : a.createdAt > b.createdAt
      ? 1
      : a.id < b.id
        ? -1
        : a.id > b.id
          ? 1
          : 0;

/**
 * Calcula el progreso de todas las constelaciones y qué estrellas libres
 * consumen las que completan ahora. Respeta las asignaciones persistidas.
 */
export const computeColecciones = (
  stars: Star[],
  constelaciones: ConstelacionReceta[],
): ResultadoColecciones => {
  const senales = stars.filter((s) => esSenal(s.tipo)).sort(ordenCronologico);

  // Asignadas por constelación y tipo (pegajosas), y pool libre por tipo.
  const asignadasPor = new Map<string, Map<TipoSenal, number>>();
  const libresPor = new Map<TipoSenal, Star[]>();
  for (const s of senales) {
    const tipo = s.tipo as TipoSenal;
    if (s.constelacionId !== null) {
      const porTipo = asignadasPor.get(s.constelacionId) ?? new Map<TipoSenal, number>();
      porTipo.set(tipo, (porTipo.get(tipo) ?? 0) + 1);
      asignadasPor.set(s.constelacionId, porTipo);
    } else {
      const g = libresPor.get(tipo);
      if (g) g.push(s);
      else libresPor.set(tipo, [s]);
    }
  }

  const consumidas = new Set<string>();
  const asignaciones: Record<string, string> = {};
  const progresos: ProgresoConstelacion[] = [];

  for (const c of constelaciones) {
    const propias = asignadasPor.get(c.id);
    const porTipo: ProgresoConstelacion['porTipo'] = {};
    const faltantes: ProgresoConstelacion['faltantes'] = {};
    /** Estrellas libres que consumiría si completa ahora. */
    const candidatas: Star[] = [];
    let completada = true;

    for (const tipo of SENALES) {
      const necesita = c.receta[tipo] ?? 0;
      if (necesita <= 0) continue;
      const deAsignadas = Math.min(propias?.get(tipo) ?? 0, necesita);
      const libres = (libresPor.get(tipo) ?? []).filter((s) => !consumidas.has(s.id));
      const deLibres = Math.min(libres.length, necesita - deAsignadas);
      candidatas.push(...libres.slice(0, deLibres));
      const tiene = deAsignadas + deLibres;
      porTipo[tipo] = { tiene, necesita };
      if (tiene < necesita) {
        completada = false;
        faltantes[tipo] = necesita - tiene;
      }
    }

    if (completada) {
      // Completa ahora (o ya estaba): consume las libres más antiguas.
      for (const estrella of candidatas) {
        consumidas.add(estrella.id);
        asignaciones[estrella.id] = c.id;
      }
    }

    progresos.push({ constelacionId: c.id, completada, porTipo, faltantes });
  }

  return { progresos, asignaciones };
};

const idsCompletadas = (r: ResultadoColecciones): Set<string> =>
  new Set(r.progresos.filter((p) => p.completada).map((p) => p.constelacionId));

/**
 * ¿Qué constelaciones se completaron RECIÉN al agregar esta estrella?
 * Simula la persistencia intermedia (las asignaciones del estado previo se
 * aplican antes de sumar la estrella) para que la completación sea pegajosa
 * también acá. Devuelve los ids nuevos — para disparar la Carta de Lore.
 */
export const completadasAlAgregar = (
  starsAntes: Star[],
  nueva: Star,
  constelaciones: ConstelacionReceta[],
): string[] => {
  const antes = computeColecciones(starsAntes, constelaciones);
  const previas = idsCompletadas(antes);
  const persistidas = starsAntes.map((s) => {
    const asignada = antes.asignaciones[s.id];
    return asignada === undefined ? s : { ...s, constelacionId: asignada };
  });
  const despues = computeColecciones([...persistidas, nueva], constelaciones);
  return [...idsCompletadas(despues)].filter((id) => !previas.has(id));
};
