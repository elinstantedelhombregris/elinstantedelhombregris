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
import { ahoraISO, hoyLocal, nuevoId } from './repos';
import {
  pvMisionMiembros, pvMisiones, pvObras, pvPulsos,
  type PvMiembroRow, type PvMisionRow, type PvObraRow,
} from './schema';

export const fundarMision = (input: {
  titulo: string; proposito: string; tipo: TipoMision; oficioId: OficioId;
  gobernanza: Gobernanza; territorio?: string;
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
  };
  // Atómico: si el alta del coordinador falla, no queda una misión
  // 'coordinada' fundada sin nadie adentro.
  return db.transaction((tx) => {
    tx.insert(pvMisiones).values(row).run();
    tx.insert(pvMisionMiembros).values({
      misionId: row.id, actorKey: actor, rol: 'coordinador',
      comprometidoAt: ahoraISO(), ultimoLatidoAt: ahoraISO(),
    }).onConflictDoNothing().run();
    return row;
  });
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
