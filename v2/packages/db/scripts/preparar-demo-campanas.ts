/** Saneamiento exclusivo de fixtures acreditados en la base LOCAL descartable de esta tarea. */
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { contratoCampanaSchema, contenidoFichaSchema } from '@v2/shared';

import { limpiarFixturesIdeales } from '../tests/helpers/limpiar-fixtures-ideales.js';
import { getDb, sql } from '../src/index.js';
import { agregarAportesDemoCampanas } from './demo-campanas-aportes.js';
import { puentearNeonAPostgresLocal } from '../tests/helpers/neon-local.js';

const url = new URL(
  process.argv.find((a) => a.startsWith('--url='))?.slice(6) ??
    'postgresql://postgres@127.0.0.1:55440/basta_descartable_test',
);
if (
  !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
  url.pathname !== '/basta_descartable_test'
)
  throw new Error('Este script sólo admite basta_descartable_test en la máquina local.');
process.env.DATABASE_URL = url.href;
const cerrar = puentearNeonAPostgresLocal(url.href);
const aplicar = process.argv.includes('--aplicar');
const db = getDb();
const manual = 'af81507f-f3fb-4a80-99f3-28f0f2377947';
const demoSlug = 'demo-local-aprender-mendoza';
try {
  const primarios = await db.execute<{ id: number }>(sql`
    select distinct u.id from users u where
    (u.username ~ '^[0-9a-f-]{36}$' and u.email=u.username||'@test.local' and u.password_hash='no-login' and (
      (u.name='Prueba' and exists(select 1 from campanas c join campana_ediciones h on h.campana_id=c.id and h.revision=1 where c.creador_id=u.id and h.contrato->>'titulo'='La vida que queremos poder vivir' and h.contrato->>'responsable'='Equipo de prueba autorizado' and h.contrato->>'fechaDevolucion'='2099-12-20'))
      or (u.name='Diseño' and exists(select 1 from fichas_futuro f where f.creador_id=u.id and f.contenido->>'titulo'='Aprender sin perder nuestros vínculos' and f.contenido->>'futuro'='Aprendemos cerca y compartimos saberes.'))))
    or (u.username ~ '^cerrada-[0-9a-f-]{36}$' and u.name='Cuenta cerrada' and u.is_active=false and exists(
      select 1 from campanas c join campana_ediciones h on h.campana_id=c.id and h.revision=1 where c.creador_id=u.id and h.contrato->>'titulo'='Conversación de prueba ideal' and h.contrato->>'responsable'='Equipo de pruebas' and h.contrato->>'fechaDevolucion'='2099-12-20'
      and exists(select 1 from fichas_futuro f where f.creador_id=u.id and f.contenido->>'titulo'='El tiempo de aprender juntos')))
  `);
  const primaria = primarios.rows.map((r) => r.id);
  const P = sql`select u::int from jsonb_array_elements_text(${JSON.stringify(primaria)}::jsonb) u`;
  const secundarios = await db.execute<{
    id: number;
  }>(sql`select distinct u.id from users u where u.username ~ '^[0-9a-f-]{36}b$' and u.email=u.username||'@test.local' and u.name in('Otra','Editor','Revisión') and (
    exists(select 1 from users p where p.id in(${P}) and u.username=p.username||'b')
    or exists(select 1 from colaboraciones c where c.creador_id in(${P}) and c.usuario_id=u.id)
    or exists(select 1 from fichas_revisiones r join fichas_futuro f on f.id=r.ficha_id where f.creador_id in(${P}) and r.editor_id=u.id)
    or exists(select 1 from opiniones o join ficha_afirmaciones a on a.id=o.afirmacion_id join fichas_futuro f on f.id=a.ficha_id where f.creador_id in(${P}) and o.user_id=u.id)
    or exists(select 1 from prueba_eventos e join pruebas_territoriales t on t.id=e.prueba_id join ficha_alternativas a on a.id=t.alternativa_id join fichas_futuro f on f.id=a.ficha_id where f.creador_id in(${P}) and e.autor_id=u.id))`);
  const usuarios = [...new Set([...primaria, ...secundarios.rows.map((r) => r.id)])];
  const U = sql`select u::int from jsonb_array_elements_text(${JSON.stringify(usuarios)}::jsonb) u`;
  const [cs, fs, voz] = await Promise.all([
    db.execute<{ id: string }>(sql`select id from campanas where creador_id in(${U}) order by id`),
    db.execute<{ id: string }>(
      sql`select id from fichas_futuro where creador_id in(${U}) order by id`,
    ),
    db.execute(sql`select * from senales where id_publico=${manual}::uuid`),
  ]);
  const hashAntes = createHash('sha256').update(JSON.stringify(voz.rows)).digest('hex');
  const plan = {
    base: 'basta_descartable_test (local)',
    aplicar,
    criterio:
      'Marcador de cuenta de test + contrato original/historial o contenido de ficha exacto + relaciones a IDs propios. Nunca sólo el título.',
    usuarios,
    campanas: cs.rows.map((r) => r.id),
    fichas: fs.rows.map((r) => r.id),
    aporteManualPresente: voz.rows.length === 1,
  };
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
  if (aplicar) {
    const eliminados = await limpiarFixturesIdeales(db, usuarios);
    const propietario = await db.execute<{
      id: number;
    }>(sql`insert into users(username,email,name,password_hash,email_verified,is_active)
      values('demo-local-campanas-basta','demo-campanas@localhost.invalid','Ejemplo local; sin equipo real','sin-acceso-demo-local',false,false)
      on conflict(username) do nothing returning id`);
    const uid =
      propietario.rows[0]?.id ??
      (
        await db.execute<{ id: number }>(
          sql`select id from users where username='demo-local-campanas-basta' and email='demo-campanas@localhost.invalid' and is_active=false`,
        )
      ).rows[0]?.id;
    if (!uid)
      throw new Error('El propietario reservado de la demo no coincide. No se sobrescribió.');
    const provincia = (
      await db.execute<{ id: number }>(
        sql`select id from geographic_locations where level='province' and name='Mendoza'`,
      )
    ).rows[0]?.id;
    if (!provincia) throw new Error('No está el ámbito oficial de Mendoza.');
    const contrato = contratoCampanaSchema.parse({
      titulo: 'Ejemplo local · Aprender cerca de quienes querés',
      pregunta: 'En tu comunidad ideal, ¿cómo podrías estudiar y cuidar sin tener que elegir?',
      proposito:
        'Este ejemplo muestra cómo reunir una pregunta de vida, un territorio y una devolución. Una convocatoria real exploraría tiempos, distancias y apoyos para seguir aprendiendo cerca de quienes queremos.',
      territorios: [provincia],
      temas: ['educación', 'cuidados'],
      participantes:
        'Ejemplo: personas que estudian, acompañan a otros o desean volver a aprender. Esta demostración no convoca participantes reales.',
      canales: ['web', 'encuentro'],
      responsable: 'Equipo ilustrativo por conformar · sin organización real asignada',
      devolucion:
        'Ejemplo: una lectura pública de condiciones compartidas, diferencias y preguntas pendientes, revisable por quienes participaron.',
      fechaDevolucion: '2026-11-10',
      efecto:
        'Demostración local del diseño de una campaña. Fechas ilustrativas; sin equipo operativo, participación real ni compromiso institucional.',
      usoDatos:
        'Este ejemplo está en pausa y no recibe aportes. Una campaña real debe anunciar qué textos se comparten, cómo se puede corregir o retirar y quién puede revisar las fuentes.',
      metodoLectura:
        'Ejemplo de método: revisar cada relato con su autor, separar afinidad temática de acuerdos expresos y volver a consultar las diferencias antes de proponer alternativas.',
      institucion: '',
      fases: [
        {
          nombre: 'Imaginar la vida posible',
          salida: 'Ejemplo: relatos revisados por quienes hablaron.',
          fecha: '2026-10-15',
        },
        {
          nombre: 'Diseñar condiciones en común',
          salida: 'Ejemplo: una ficha con condiciones deseadas y alternativas por contrastar.',
          fecha: '2026-10-29',
        },
        {
          nombre: 'Devolver y volver a escuchar',
          salida: 'Ejemplo: lectura pública de lo aprendido y lo que sigue pendiente.',
          fecha: '2026-11-10',
        },
      ],
    });
    const cid = randomUUID();
    await db.execute(sql`with c as (insert into campanas(id,creador_id,id_local,slug,revision,estado,contrato)
      values(${cid}::uuid,${uid},${randomUUID()}::uuid,${demoSlug},2,'pausada',${JSON.stringify(contrato)}::jsonb) on conflict(slug) do nothing returning *)
      insert into campana_ediciones(campana_id,revision,contrato,estado,motivo) select id,2,contrato,estado,'Demostración local identificada. Se mantiene en pausa; no es una convocatoria real.' from c`);
    const campana = (
      await db.execute<{ id: string }>(
        sql`select id from campanas where slug=${demoSlug} and creador_id=${uid}`,
      )
    ).rows[0]?.id;
    if (!campana) throw new Error('La campaña demo no tiene el propietario esperado.');
    const contenido = contenidoFichaSchema.parse({
      titulo: 'Ejemplo local · Tiempo para aprender y cuidar',
      territorioId: provincia,
      temas: ['educación', 'cuidados'],
      futuro:
        'En este ejemplo imaginamos una comunidad donde aprender y cuidar pueden convivir: tiempos compatibles, lugares cercanos y apoyos para sostener ambos vínculos.',
      situacion: 'Ejemplo de diseño; no describe una situación relevada ni un acuerdo observado.',
      condiciones: [
        'Horarios compatibles con las tareas de cuidado',
        'Opciones de aprendizaje cercanas y accesibles',
        'Apoyos compartidos para disponer de tiempo',
      ],
      proximaTarea:
        'En una convocatoria real, escuchar y revisar estas condiciones con las personas que participarían. Esta ficha todavía no tiene fuentes, acuerdos ni resultados.',
      vinculos: [],
      campanaId: campana,
    });
    const idLocal = 'aa753b53-2137-4dc7-a4a6-b29b6d7e7193';
    await db.execute(sql`with f as(insert into fichas_futuro(creador_id,id_local,territorio_id,contenido) values(${uid},${idLocal}::uuid,${provincia},${JSON.stringify(contenido)}::jsonb) on conflict(creador_id,id_local) do nothing returning *)
      insert into fichas_revisiones(ficha_id,revision,editor_id,contenido,campos) select id,1,creador_id,contenido,'["creación"]'::jsonb from f`);
    const vozDespues = await db.execute(
      sql`select * from senales where id_publico=${manual}::uuid`,
    );
    if (createHash('sha256').update(JSON.stringify(vozDespues.rows)).digest('hex') !== hashAntes)
      throw new Error('El aporte manual cambió; revisá la operación antes de continuar.');
    const ficha = (
      await db.execute<{ id: string }>(
        sql`select id from fichas_futuro where creador_id=${uid} and id_local=${idLocal}::uuid`,
      )
    ).rows[0]?.id;
    if (!ficha) throw new Error('No encontramos la ficha de la demo.');
    const ejemplos = await agregarAportesDemoCampanas(db, campana, ficha, provincia);
    const informe = {
      ...plan,
      eliminados,
      demo: { campana, ficha, slug: demoSlug, estado: 'pausada', participantesReales: 0, ejemplos },
      aporteManualPreservado: true,
    };
    const destino = fileURLToPath(new URL('../../../../output/preview/', import.meta.url));
    mkdirSync(destino, { recursive: true });
    writeFileSync(destino + 'saneamiento-fixtures-campanas.json', JSON.stringify(informe, null, 2));
    process.stdout.write(JSON.stringify(informe, null, 2) + '\n');
  }
} finally {
  await cerrar();
}
