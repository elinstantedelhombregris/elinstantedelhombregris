import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { describe, expect, it } from 'vitest';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';

describe.skipIf(!process.env.DATABASE_URL_DESCARTABLE)(
  'Limpieza acotada de fixtures ideales',
  () => {
    it('una contribución anónima no acreditada bloquea el lote, y un ID local propio permite limpiar sin tocar otra cuenta', async () => {
      const marca = randomUUID(),
        local = randomUUID(),
        otro = randomUUID();
      const filas = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash) values(${marca},${marca + '@test.local'},'Fixture propio','no-login'),(${'ajena-' + otro},${otro + '@persona.invalid'},'Cuenta independiente','no-login') returning id`,
      );
      const uid = filas.rows[0]!.id,
        independiente = filas.rows[1]!.id;
      let campana = '';
      try {
        const c = await getDb().execute<{ id: string }>(
          sql`insert into campanas(creador_id,id_local,slug,contrato) values(${uid},${randomUUID()}::uuid,${'fixture-' + marca},'{"titulo":"Fixture de limpieza"}'::jsonb) returning id`,
        );
        campana = c.rows[0]!.id;
        await getDb().execute(
          sql`with s as(insert into senales(tipo,clase,origen,id_local,texto,estado,cesion_licencia) values('sueño','deseo','web',${local}::uuid,'Texto de la prueba de limpieza','enviada',false) returning id_publico) insert into contribuciones(senal_id,campana_id,edicion,huella) select id_publico,${campana}::uuid,1,'fixture-propio' from s`,
        );
        await expect(limpiarFixturesIdeales(getDb(), [uid])).rejects.toThrow('Una persona ajena');
        expect(
          (
            await getDb().execute<{ n: number }>(
              sql`select count(*)::int n from campanas where id=${campana}::uuid`,
            )
          ).rows[0]?.n,
        ).toBe(1);
        await limpiarFixturesIdeales(getDb(), [uid], [local]);
        expect(
          (
            await getDb().execute<{ n: number }>(
              sql`select count(*)::int n from users where id=${uid}`,
            )
          ).rows[0]?.n,
        ).toBe(0);
        expect(
          (
            await getDb().execute<{ n: number }>(
              sql`select count(*)::int n from users where id=${independiente}`,
            )
          ).rows[0]?.n,
        ).toBe(1);
      } finally {
        await limpiarFixturesIdeales(getDb(), [uid], [local]);
        await getDb().execute(sql`delete from users where id=${independiente}`);
      }
    });
    it('un ID de cuenta sin marcador de fixture se rechaza antes de modificar sus objetos', async () => {
      const marca = randomUUID();
      const u = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash) values(${'independiente-' + marca},${marca + '@persona.invalid'},'Cuenta independiente','no-login') returning id`,
      );
      const id = u.rows[0]!.id;
      try {
        await expect(limpiarFixturesIdeales(getDb(), [id])).rejects.toThrow(
          'sin marcador de fixture',
        );
        expect(
          (
            await getDb().execute<{ n: number }>(
              sql`select count(*)::int n from users where id=${id}`,
            )
          ).rows[0]?.n,
        ).toBe(1);
      } finally {
        await getDb().execute(sql`delete from users where id=${id}`);
      }
    });
  },
);
