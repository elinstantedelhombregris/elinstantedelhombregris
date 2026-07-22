/**
 * Persistencia del Protocolo Vivo. TODA decisión vive en src/protocolo/
 * (motor puro, testeado); acá solo se compone y persiste. Si una función
 * de acá toma una decisión que el motor no tomó, es un bug de diseño.
 */
import { and, desc, eq } from 'drizzle-orm';

import { actorKeyCacheado as getActorKey } from '@/civic/actor-cache';
import type { Oficio, OficioId } from '@/content/oficios';
import { OFICIOS } from '@/content/oficios';
import { brilloDeObras, nivelDeBrillo, type NivelBrillo } from '@/protocolo/brillo';
import { puedeResolver, transicionValida } from '@/protocolo/mision';
import { latidoVencido, puedeDarPulso, type VeredictoPulso } from '@/protocolo/pulsos';
import type { EstadoMision, Gobernanza, TipoMision } from '@/protocolo/tipos';

import { db } from './client';
import { ahoraISO, fundarExpedicion, hoyLocal, nuevoId, type NuevaExpedicion } from './repos';
import {
  expeditions, pvMisionMiembros, pvMisiones, pvObras, pvPulsos,
  type ExpeditionRow, type PvMiembroRow, type PvMisionRow, type PvObraRow,
} from './schema';

export const fundarMision = (input: {
  titulo: string; proposito: string; tipo: TipoMision; oficioId: OficioId;
  gobernanza: Gobernanza; territorio?: string;
  /** Si viene y tipo === 'relevamiento', funda además una expedición gratis
   * (origen 'precargada') que sirve de contenedor de progreso a la misión. */
  plantilla?: Pick<NuevaExpedicion, 'plantillaId' | 'titulo' | 'zona' | 'meta'>;
}): PvMisionRow => {
  const actor = getActorKey();
  const row: PvMisionRow = {
    id: nuevoId(),
    titulo: input.titulo.trim(),
    proposito: input.proposito.trim(),
    tipo: input.tipo,
    oficioId: input.oficioId,
    estado: 'propuesta',
    gobernanza: input.gobernanza,
    territorio: input.territorio?.trim() || null,
    parentId: null,
    creadaPor: actor,
    createdAt: ahoraISO(),
    resueltaAt: null,
    expeditionId: null,
  };
  // Atómico: si el alta del coordinador falla, no queda una misión
  // 'coordinada' fundada sin nadie adentro.
  db.transaction((tx) => {
    tx.insert(pvMisiones).values(row).run();
    tx.insert(pvMisionMiembros).values({
      misionId: row.id, actorKey: actor, rol: 'coordinador',
      comprometidoAt: ahoraISO(), ultimoLatidoAt: ahoraISO(),
    }).onConflictDoNothing().run();
  });

  // La expedición se funda FUERA de la transacción de arriba a propósito:
  // fundarExpedicion abre su PROPIA db.transaction, y drizzle sobre
  // expo-sqlite no soporta transacciones anidadas (la interna pisaría/
  // rompería la externa). Si falla — meta inválida, lo que sea — se
  // captura y la misión sobrevive sin expedición: estamos local y
  // single-user, así que una misión de relevamiento sin expedición sigue
  // siendo una misión válida, sólo pierde el mini-juego de progreso.
  // Sub-caso expedición huérfana: si fundarExpedicion SÍ crea la fila pero
  // vincularExpedicion explota después, esa expedición queda sin misión
  // dueña. No es un dato corrupto — sigue siendo una expedición jugable
  // sola —, pero intentamos un borrado best-effort para no dejarla dando
  // vueltas en el panel de Expediciones sin motivo; si ni el borrado anda,
  // tampoco pasa nada grave, sólo queda huérfana.
  if (input.plantilla && input.tipo === 'relevamiento') {
    let expedicion: ExpeditionRow | null = null;
    try {
      expedicion = fundarExpedicion({ ...input.plantilla, origen: 'precargada' });
      vincularExpedicion(row.id, expedicion.id);
      row.expeditionId = expedicion.id;
    } catch {
      if (expedicion) {
        try {
          db.delete(expeditions).where(eq(expeditions.id, expedicion.id)).run();
        } catch {
          // best-effort: si el borrado también falla, queda huérfana.
        }
      }
    }
  }
  return row;
};

/** Reata (o re-reata) una misión a una expedición ya fundada. */
export const vincularExpedicion = (misionId: string, expeditionId: string): void => {
  db.update(pvMisiones).set({ expeditionId }).where(eq(pvMisiones.id, misionId)).run();
};

export const misionesTodas = (): PvMisionRow[] =>
  db.select().from(pvMisiones).orderBy(desc(pvMisiones.createdAt)).all();

export const misionPorId = (
  id: string,
): { mision: PvMisionRow; miembros: PvMiembroRow[] } | null => {
  const mision = db.select().from(pvMisiones).where(eq(pvMisiones.id, id)).get();
  if (!mision) return null;
  const miembros = db.select().from(pvMisionMiembros)
    .where(eq(pvMisionMiembros.misionId, id)).all();
  return { mision, miembros };
};

export const sumarseAMision = (misionId: string): void => {
  db.insert(pvMisionMiembros).values({
    misionId, actorKey: getActorKey(), rol: 'miembro',
    comprometidoAt: ahoraISO(), ultimoLatidoAt: ahoraISO(),
  }).onConflictDoNothing().run();
};

export const transicionar = (misionId: string, hacia: EstadoMision): PvMisionRow => {
  const encontrado = misionPorId(misionId);
  if (!encontrado) throw new Error('mision_inexistente');
  const { mision, miembros } = encontrado;
  if (!transicionValida(mision.estado as EstadoMision, hacia)) {
    throw new Error('transicion_invalida');
  }
  if (hacia === 'resuelta') {
    const actor = getActorKey();
    const yo = miembros.find((m) => m.actorKey === actor);
    // P0 local: las "aceptaciones" de consentimiento son latidos vivos (≤7 días).
    const ahora = ahoraISO();
    const aceptaciones = miembros.filter((m) => !latidoVencido(m.ultimoLatidoAt, ahora)).length;
    if (!yo || !puedeResolver(
      mision.gobernanza as Gobernanza,
      yo.rol as 'coordinador' | 'miembro',
      aceptaciones,
      miembros.length,
    )) throw new Error('gobernanza_rechaza');
  }
  const cambios = hacia === 'resuelta'
    ? { estado: hacia, resueltaAt: ahoraISO() }
    : { estado: hacia };
  db.update(pvMisiones).set(cambios).where(eq(pvMisiones.id, misionId)).run();
  return { ...mision, ...cambios };
};

export const registrarLatido = (misionId: string): void => {
  db.update(pvMisionMiembros).set({ ultimoLatidoAt: ahoraISO() })
    .where(and(
      eq(pvMisionMiembros.misionId, misionId),
      eq(pvMisionMiembros.actorKey, getActorKey()),
    )).run();
};

export const publicarObra = (input: {
  misionId?: string; titulo: string; resumen?: string; oficioId: OficioId;
  evidenciaUri?: string; territorio?: string;
}): PvObraRow => {
  const row: PvObraRow = {
    id: nuevoId(),
    misionId: input.misionId ?? null,
    titulo: input.titulo.trim(),
    resumen: input.resumen?.trim() || null,
    oficioId: input.oficioId,
    evidenciaUri: input.evidenciaUri ?? null,
    territorio: input.territorio?.trim() || null,
    publicadaAt: ahoraISO(),
    estado: 'sin_corroborar',
  };
  db.insert(pvObras).values(row).run();
  return row;
};

export const pulsosDeHoy = (): number =>
  db.select().from(pvPulsos).where(and(
    eq(pvPulsos.actorKey, getActorKey()),
    eq(pvPulsos.fecha, hoyLocal()),
  )).all().length;

export const pulsosDeTarget = (targetTipo: string, targetId: string): number =>
  db.select().from(pvPulsos).where(and(
    eq(pvPulsos.targetTipo, targetTipo),
    eq(pvPulsos.targetId, targetId),
  )).all().length;

export const darPulso = (
  targetTipo: 'obra' | 'mision',
  targetId: string,
): VeredictoPulso => {
  const actor = getActorKey();
  const yaDio = db.select().from(pvPulsos).where(and(
    eq(pvPulsos.actorKey, actor),
    eq(pvPulsos.targetTipo, targetTipo),
    eq(pvPulsos.targetId, targetId),
  )).get() !== undefined;
  const veredicto = puedeDarPulso(pulsosDeHoy(), yaDio);
  if (!veredicto.ok) return veredicto;
  db.insert(pvPulsos).values({
    id: nuevoId(), targetTipo, targetId, actorKey: actor,
    fecha: hoyLocal(), createdAt: ahoraISO(),
  }).onConflictDoNothing().run();
  return veredicto;
};

export type ItemCorriente =
  | { clase: 'obra'; obra: PvObraRow; pulsos: number }
  | { clase: 'mision'; mision: PvMisionRow };

export const corrienteLocal = (): ItemCorriente[] => {
  const obras: ItemCorriente[] = db.select().from(pvObras)
    .orderBy(desc(pvObras.publicadaAt)).all()
    .map((obra) => ({ clase: 'obra', obra, pulsos: pulsosDeTarget('obra', obra.id) }));
  const misiones: ItemCorriente[] = misionesTodas()
    .map((mision) => ({ clase: 'mision', mision }));
  const fechaDe = (i: ItemCorriente) =>
    i.clase === 'obra' ? i.obra.publicadaAt : (i.mision.resueltaAt ?? i.mision.createdAt);
  return [...obras, ...misiones].sort((a, b) => fechaDe(b).localeCompare(fechaDe(a)));
};

export const constelacionesDeOficio = (): Array<{
  oficio: Oficio; obras: number; brillo: number; nivel: NivelBrillo;
}> => {
  const todas = db.select().from(pvObras).all();
  const ahora = ahoraISO();
  return OFICIOS.map((oficio) => {
    const fechas = todas.filter((o) => o.oficioId === oficio.id).map((o) => o.publicadaAt);
    const brillo = brilloDeObras(fechas, ahora);
    return { oficio, obras: fechas.length, brillo, nivel: nivelDeBrillo(brillo) };
  });
};
