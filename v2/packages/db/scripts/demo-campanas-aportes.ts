import { createHash } from 'node:crypto';

import { claseDe, encuadreDeUbicacion } from '@v2/civic-core';
import { contenidoFichaSchema, senalSchema } from '@v2/shared';

import { sql } from '../src/index.js';
import type { Db } from '../src/client.js';

/** Ejemplos de documentación local: sin actor, cuenta participante, domicilio, corroboración ni vector. */
export async function agregarAportesDemoCampanas(
  db: Db,
  campana: string,
  ficha: string,
  provincia: number,
) {
  const datos = (
    await db.execute<{ creador_id: number; revision: number; contenido: unknown }>(sql`
    select f.creador_id,f.revision,f.contenido from fichas_futuro f join campanas c on c.id=${campana}::uuid
    join users u on u.id=c.creador_id where f.id=${ficha}::uuid and f.creador_id=c.creador_id
    and c.slug='demo-local-aprender-mendoza' and c.estado='pausada' and u.username='demo-local-campanas-basta' and u.is_active=false`)
  ).rows[0];
  if (!datos)
    throw new Error('No coincide la demo local pausada y su ficha. No se agregaron ejemplos.');
  const ejemplos = [
    {
      id: 'b5e04e0e-9017-4e1b-a5eb-790a46852d53',
      tipo: 'sueño',
      relacion: 'inspira',
      texto:
        '[Ejemplo local] Imaginamos poder seguir aprendiendo cerca de quienes queremos, con tiempo para cuidar y crear. Es una aspiración ilustrativa, no el relato de un participante real.',
    },
    {
      id: '62ee0f64-56e1-4247-a3dd-d841b3c36254',
      tipo: 'necesidad',
      relacion: 'describe',
      texto:
        '[Ejemplo local] Una necesidad hipotética sería disponer de horarios y apoyos compatibles con tareas de cuidado. Este texto ilustra el registro; no describe un caso real relevado.',
    },
    {
      id: 'fd3b6e43-cd75-43d6-99a8-d266d60cecc8',
      tipo: 'práctica',
      relacion: 'capacidad',
      titulo: '[Ejemplo local] Mesa de aprendizaje y cuidados',
      periodicidad: 'semanal',
      sostenidaPor: 'Equipo hipotético del ejemplo; sin actividad real',
      texto:
        '[Ejemplo local] Una mesa semanal de aprendizaje compartido ilustra cómo vincular una práctica a una condición deseada. No existe una actividad operativa ni una organización que la esté sosteniendo.',
    },
  ] as const;
  for (const e of ejemplos) {
    const v = senalSchema.parse({
      contrato: 'basta-senal/v1',
      idLocal: e.id,
      tipo: e.tipo,
      texto: e.texto,
      cedeLicencia: true,
      casa: 'no',
      provinceId: provincia,
      precisionPedida: 'province',
      tema: 'educación',
      ...('titulo' in e
        ? { titulo: e.titulo, periodicidad: e.periodicidad, sostenidaPor: e.sostenidaPor }
        : {}),
    });
    const encuadre = encuadreDeUbicacion(v.tipo, v.casa);
    await db.execute(sql`with s as(insert into senales(id_publico,id_local,origen,tipo,clase,estado,texto,titulo,tema,tema_origen,cesion_licencia,cesion_en,cesion_version,province_id,"precision",ubicacion_origen,location_role,sensitivity,casa,periodicidad,sostenida_por)
      values(${e.id}::uuid,${e.id}::uuid,'web',${v.tipo},${claseDe(v.tipo)},'enviada',${v.texto},${v.titulo},${v.tema},'declarado',true,now(),1,${provincia},'province','catalogo',${encuadre.role},${encuadre.sensitivity},'no',${v.periodicidad},${v.sostenidaPor})
      on conflict(origen,id_local) do nothing returning id_publico)
      insert into contribuciones(senal_id,campana_id,edicion,modo,huella,fragmentos)
      select id_publico,${campana}::uuid,2,'demostracion_local',${createHash('sha256').update(JSON.stringify(v)).digest('hex')},'[]'::jsonb from s on conflict(senal_id) do nothing`);
    const existente = (
      await db.execute<{ valido: boolean }>(
        sql`select actor_id is null and user_id is null and lat is null and lng is null and cesion_licencia=true and texto=${v.texto} and province_id=${provincia} as valido from senales where id_publico=${e.id}::uuid`,
      )
    ).rows[0];
    if (!existente?.valido)
      throw new Error('Un identificador de ejemplo tiene datos diferentes. No se sobrescribió.');
  }
  const anterior = contenidoFichaSchema.parse(datos.contenido);
  const contenido = contenidoFichaSchema.parse({
    ...anterior,
    proximaTarea:
      'En una convocatoria real, escuchar y revisar estas condiciones con quienes participarían. Esta ficha vincula tres ejemplos sintéticos; todavía no tiene voces reales, acuerdos ni resultados observados.',
    vinculos: [
      ...anterior.vinculos.filter((v) => !ejemplos.some((e) => e.id === v.senalId)),
      ...ejemplos.map((e) => ({ senalId: e.id, relacion: e.relacion })),
    ],
  });
  if (JSON.stringify(anterior) !== JSON.stringify(contenido))
    await db.execute(sql`with f as(update fichas_futuro set contenido=${JSON.stringify(contenido)}::jsonb,revision=revision+1,actualizada_en=now() where id=${ficha}::uuid and creador_id=${datos.creador_id} and revision=${datos.revision} returning *)
    insert into fichas_revisiones(ficha_id,revision,editor_id,contenido,campos) select id,revision,creador_id,contenido,'["vinculos","proximaTarea"]'::jsonb from f`);
  return ejemplos.map((e) => ({
    id: e.id,
    tipo: e.tipo,
    relacion: e.relacion,
    sintetico: true,
    participanteReal: false,
    precision: 'province',
    punto: false,
    vector: false,
  }));
}
