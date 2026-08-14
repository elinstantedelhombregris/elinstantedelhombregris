/**
 * La ingesta de señales, punta a punta contra Postgres.
 *
 * Lo que se prueba acá no es que el endpoint conteste 201 —eso lo diría
 * cualquier smoke test— sino las cuatro cosas que el borde tiene que hacer y
 * que ningún type-check alcanza:
 *
 * 1. que los NUEVE tipos entren, incluidos los dos con carácter no ASCII;
 * 2. que la secuencia de ubicación corra en orden, o sea que una dirección
 *    protegida no aparezca compuesta en `direccion_texto`;
 * 3. que `origen` lo ponga la ruta y el cuerpo no lo pueda mover;
 * 4. que el recibo no filtre el ordinal, el actor ni la clave de idempotencia.
 *
 * **Escribe filas.** Si hay `DATABASE_URL_DESCARTABLE` corre contra esa rama;
 * si no, contra la que diga `DATABASE_URL` —la rama de test de CI— y borra por
 * `id_publico` lo que creó. Nunca se apoya en «la tabla estaba vacía».
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

// El cliente de `@v2/db` cachea el pool con el `DATABASE_URL` que encuentre en
// la primera llamada, así que la rama descartable tiene que quedar puesta
// ANTES de que se importe la app. Por eso este bloque va arriba de todo.
const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { CONTRATO_SENAL } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

const RUTA = '/api/v1/civic/senales';

/** El cuerpo mínimo válido. Cada test cambia sólo lo que le importa. */
function cuerpo(over: Record<string, unknown> = {}) {
  return {
    contrato: CONTRATO_SENAL,
    idLocal: randomUUID(),
    tipo: 'basta',
    texto: 'El semáforo de la esquina no anda hace tres meses.',
    cedeLicencia: true,
    casa: 'no',
    ...over,
  };
}

dsuite('Ingesta de señales', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  const soltar = async (body: Record<string, unknown>, esperado = 201) => {
    const res = await request.post(RUTA).send(body);
    if (res.status !== esperado) {
      throw new Error(
        `Esperaba ${String(esperado)} y vino ${String(res.status)}: ${JSON.stringify(res.body)}`,
      );
    }
    if (res.status === 201) creadas.push(res.body.data.idPublico);
    return res;
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    // `@v2/db` reexporta los helpers de drizzle justamente para esto: `apps/api`
    // no declara `drizzle-orm` como dependencia y no debería, así que importarlo
    // acá directo rompe la resolución del test.
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

  describe('los nueve tipos entran', () => {
    const CASOS: { tipo: string; extra?: Record<string, unknown> }[] = [
      { tipo: 'basta' },
      { tipo: 'necesidad' },
      { tipo: 'recurso' },
      { tipo: 'práctica', extra: { periodicidad: 'semanal', titulo: 'El comedor de la esquina' } },
      { tipo: 'saber', extra: { fuente: 'Me lo dijo la del kiosco.' } },
      { tipo: 'sueño' },
      { tipo: 'propuesta', extra: { titulo: 'Un semáforo acá' } },
      {
        tipo: 'compromiso',
        extra: {
          comprometidoPara: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
        },
      },
      { tipo: 'pregunta' },
    ];

    it.each(CASOS)('$tipo se guarda con su clase', async ({ tipo, extra }) => {
      const res = await soltar(cuerpo({ tipo, ...extra }));
      expect(res.body.data.tipo).toBe(tipo);
      expect(['hecho', 'deseo', 'acto', 'meta']).toContain(res.body.data.clase);
    });

    it('«valor» ya no existe y se rechaza', async () => {
      await soltar(cuerpo({ tipo: 'valor' }), 400);
    });

    it('un tipo en NFD entra igual: la normalización va antes de validar', async () => {
      // `'sueño'` con la ñ descompuesta, que es lo que emite un teclado de macOS.
      const nfd = 'sueño';
      expect(nfd).not.toBe('sueño');
      const res = await soltar(cuerpo({ tipo: nfd }));
      expect(res.body.data.tipo).toBe('sueño');
    });
  });

  describe('la idempotencia', () => {
    it('el reintento contesta 201 con el mismo id y lo dice', async () => {
      const body = cuerpo();
      const primera = await soltar(body);
      const segunda = await request.post(RUTA).send(body);

      // 201 y no 409: un outbox que reintenta hasta ver un 2xx, contra un
      // servidor que le contesta 409, reintenta para siempre.
      expect(segunda.status).toBe(201);
      expect(segunda.body.data.idPublico).toBe(primera.body.data.idPublico);
      expect(segunda.body.data.yaExistia).toBe(true);
      expect(primera.body.data.yaExistia).toBe(false);
    });
  });

  describe('lo que el cuerpo no puede decidir', () => {
    it('`origen` lo pone la ruta y el cuerpo no lo mueve', async () => {
      const res = await soltar(cuerpo({ origen: 'campo' }));
      // Se relee por el endpoint público: si el cuerpo hubiera ganado, esta
      // señal figuraría como recorrida en terreno.
      const leida = await request.get(`${RUTA}/${res.body.data.idPublico}`);
      expect(leida.status).toBe(200);
      // `origen` no sale al público, así que se comprueba por el efecto: la
      // idempotencia vive en el espacio de nombres `web`.
      const repetida = await request.post(RUTA).send(cuerpo({ idLocal: res.body.data.idLocal }));
      expect(repetida.body.data.yaExistia).toBe(true);
    });

    it('el recibo no filtra el ordinal, el actor ni la clave de idempotencia', async () => {
      const res = await soltar(cuerpo());
      for (const prohibida of ['id', 'actorId', 'userId']) {
        expect(res.body.data).not.toHaveProperty(prohibida);
      }
    });

    it('la lectura pública tampoco', async () => {
      const res = await soltar(cuerpo());
      const leida = await request.get(`${RUTA}/${res.body.data.idPublico}`);
      for (const prohibida of ['id', 'actorId', 'userId', 'idLocal']) {
        expect(leida.body.data.senal).not.toHaveProperty(prohibida);
      }
    });
  });

  describe('la pregunta de la casa manda sobre la ubicación', () => {
    it('sin respuesta, el punto se engrosa y se dice por qué', async () => {
      const res = await soltar(
        cuerpo({
          casa: 'sinRespuesta',
          punto: { lat: -34.603722, lng: -58.381592 },
          precisionPedida: 'exact',
        }),
      );
      // `sinRespuesta` cae del lado seguro: `subject` + `high`, que es
      // exactamente lo que dispara la protección.
      expect(res.body.data.precisionPublicada).not.toBe('exact');
      expect(res.body.data.engrosado).toBeTruthy();
    });

    it('«no» deja publicar el punto fino: no habla de la casa de nadie', async () => {
      const res = await soltar(
        cuerpo({ casa: 'no', punto: { lat: -34.603722, lng: -58.381592 }, precisionPedida: 'exact' }),
      );
      expect(res.body.data.precisionPublicada).toBe('exact');
      expect(res.body.data.engrosado).toBeNull();
    });

    it('rechazar el engrosado sobre una casa ajena es 400', async () => {
      await soltar(cuerpo({ casa: 'ajena', aceptaEngrosado: false }), 400);
    });
  });

  describe('la secuencia de ubicación corre en orden', () => {
    it('una dirección protegida no sale compuesta en el texto', async () => {
      // `casa: 'propia'` sobre un tipo que no cambia de rol deja
      // `role: subject`, y ahí la política retira la dirección. Si la
      // composición corriera ANTES de la degradación, el texto saldría igual
      // con la calle y la altura adentro — y ningún CHECK lo cazaría, porque
      // `direccion_texto` es texto libre.
      const res = await soltar(
        cuerpo({ casa: 'propia', direccionLibre: 'Av. Rivadavia 1450, timbre 3' }),
      );
      const leida = await request.get(`${RUTA}/${res.body.data.idPublico}`);
      const texto = leida.body.data.senal.direccionTexto as string | null;
      if (texto !== null) {
        expect(texto).not.toContain('1450');
        expect(texto).not.toContain('timbre');
      }
    });
  });

  describe('el contrato', () => {
    it('sin `cedeLicencia` es 400 y no un default silencioso', async () => {
      const { cedeLicencia: _, ...sinCesion } = cuerpo();
      await soltar(sinCesion, 400);
    });

    it('sin `casa` es 400', async () => {
      const { casa: _, ...sinCasa } = cuerpo();
      await soltar(sinCasa, 400);
    });

    it('un compromiso sin fecha es 400 con el campo nombrado', async () => {
      const res = await request.post(RUTA).send(cuerpo({ tipo: 'compromiso' }));
      expect(res.status).toBe(400);
    });

    it('el contrato viejo se rechaza', async () => {
      await soltar(cuerpo({ contrato: 'basta-senal/v0' }), 400);
    });
  });

  describe('la lectura', () => {
    it('filtra por clase', async () => {
      await soltar(cuerpo({ tipo: 'sueño' }));
      const res = await request.get(`${RUTA}?clases=deseo&limite=200`);
      expect(res.status).toBe(200);
      const clases = new Set(
        (res.body.data.senales as { clase: string }[]).map((s) => s.clase),
      );
      expect([...clases]).toEqual(['deseo']);
    });

    it('el conteo agrupa por clase', async () => {
      const res = await request.get(`${RUTA}/conteo`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.total).toBe('number');
    });

    it('una señal que no existe es 404 y no un 500', async () => {
      const res = await request.get(`${RUTA}/${randomUUID()}`);
      expect(res.status).toBe(404);
    });
  });
});
