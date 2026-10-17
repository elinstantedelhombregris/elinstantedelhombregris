import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { getDb, sql } from '@v2/db';

import { hashPassword } from '../features/auth/password.js';

import { clienteEscolar } from './escuela-cliente.js';
import { CLAVE_ESCOLAR, CUENTAS_ESCOLARES, contenidoEscolar } from './escuela-contenido.js';

export interface EnsayoEscolar {
  tipo: 'escuela_local';
  inicio: string;
  cierre: string;
  campanaId: string;
  fichaId: string;
  iniciativaId: number;
  iniciativaSlug: string;
  tareaId: number;
}
const directorio = new URL('../../../../.operations/escuela/', import.meta.url);
const archivo = new URL('recorrido.json', directorio);

/** Los recibos se guardan antes del primer envío: un fallo a mitad puede reintentarse. */
export async function sembrarEscuela(): Promise<EnsayoEscolar> {
  const db = getDb();
  if (existsSync(archivo)) {
    const guardado = JSON.parse(readFileSync(archivo, 'utf8')) as EnsayoEscolar;
    const r = await db.execute(sql`select t.id from iniciativa_tasks t
      join fichas_futuro f on f.id=${guardado.fichaId}::uuid
      join campanas c on c.id=${guardado.campanaId}::uuid
      where t.id=${guardado.tareaId} and t.iniciativa_id=${guardado.iniciativaId}`);
    if (!r.rows.length)
      throw new Error(
        'Faltan objetos del ensayo guardado. Revisá .operations/escuela; no se recreó ni borró tu progreso.',
      );
    return guardado;
  }
  mkdirSync(directorio, { recursive: true });
  const planArchivo = new URL('preparacion.json', directorio);
  const hoy = new Date();
  const futuro = new Date(hoy.getTime() + 30 * 86_400_000);
  const nuevo = {
    inicio: hoy.toISOString().slice(0, 10),
    cierre: futuro.toISOString().slice(0, 10),
    campana: randomUUID(),
    ficha: randomUUID(),
    iniciativa: randomUUID(),
    tarea: randomUUID(),
    objecion: randomUUID(),
  };
  const plan = existsSync(planArchivo)
    ? (JSON.parse(readFileSync(planArchivo, 'utf8')) as typeof nuevo)
    : nuevo;
  if (!existsSync(planArchivo))
    writeFileSync(planArchivo, JSON.stringify(plan, null, 2), { mode: 0o600 });
  const hash = await hashPassword(CLAVE_ESCOLAR);
  for (const cuenta of CUENTAS_ESCOLARES) {
    const email = `${cuenta.usuario}@example.invalid`;
    const previa = await db.execute<{ email: string }>(
      sql`select email from users where username=${cuenta.usuario}`,
    );
    if (previa.rows[0] && previa.rows[0].email !== email)
      throw new Error('El nombre de cuenta del ensayo ya pertenece a otra cuenta.');
    await db.execute(sql`insert into users(username,email,name,password_hash,email_verified,onboarding_completed)
      values(${cuenta.usuario},${email},${cuenta.nombre},${hash},true,true) on conflict(username) do nothing`);
  }
  const lugares = await db.execute<{ id: number }>(
    sql`select id from geographic_locations where level='province' and name='Mendoza' limit 1`,
  );
  const territorio = lugares.rows[0]?.id;
  if (!territorio) throw new Error('Primero sembrá el catálogo de provincias.');
  const v = contenidoEscolar(plan.inicio, plan.cierre, territorio);
  const pedir = await clienteEscolar('escuela_coordina', CLAVE_ESCOLAR);
  const campana = await pedir<{ id: string }>('/v1/campanas', {
    idLocal: plan.campana,
    contrato: v.contrato,
  });
  const c = await pedir<{ revision: number; estado: string }>(`/v1/campanas/${campana.id}`);
  if (c.estado === 'borrador')
    await pedir(`/v1/campanas/${campana.id}/estado`, {
      revision: c.revision,
      estado: 'abierta',
      motivo: 'Abrimos únicamente el ensayo local con cuentas y horarios ficticios.',
    });
  const ficha = await pedir<{ id: string }>('/v1/fichas', {
    idLocal: plan.ficha,
    aceptaPublicar: true,
    contenido: { ...v.ficha, campanaId: campana.id },
  });
  const iniciativa = await pedir<{ id: number; slug: string }>('/iniciativas', {
    idLocal: plan.iniciativa,
    ...v.iniciativa,
  });
  const tarea = await pedir<{ id: number }>(`/iniciativas/${iniciativa.id}/tareas`, {
    idLocal: plan.tarea,
    ...v.tarea,
  });
  // El desacuerdo queda como intervención, además del contexto de la ficha.
  const objetar = await clienteEscolar('escuela_revisa', CLAVE_ESCOLAR);
  await objetar(`/v1/fichas/${ficha.id}/argumentos`, {
    idLocal: plan.objecion,
    tipo: 'objecion',
    firma: 'Revisión · ejemplo ficticio',
    texto:
      'Objeción ficticia: cambiar el ingreso puede complicar el trabajo y los cuidados. Antes de elegir esa alternativa hay que escuchar a quienes sostienen ambos. Esta intervención fue preparada como material de ensayo, no enviada por una familia.',
    respondeA: null,
    alternativaId: null,
    fuenteIds: [],
  });
  const resultado: EnsayoEscolar = {
    tipo: 'escuela_local',
    inicio: plan.inicio,
    cierre: plan.cierre,
    campanaId: campana.id,
    fichaId: ficha.id,
    iniciativaId: iniciativa.id,
    iniciativaSlug: iniciativa.slug,
    tareaId: tarea.id,
  };
  writeFileSync(archivo, JSON.stringify(resultado, null, 2), { mode: 0o600 });
  return resultado;
}
