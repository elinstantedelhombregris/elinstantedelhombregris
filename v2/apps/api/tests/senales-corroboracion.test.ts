/**
 * La corroboración — el segundo par de ojos.
 *
 * Es el circuito que faltaba: hasta que existió, las señales llegaban a
 * `por_verificar` y se quedaban ahí para siempre, y la nitidez de todo el país
 * era cero — «hay hechos sin confirmar», literalmente cierto porque no había
 * forma de confirmarlos.
 *
 * **Escribe filas.** Exige `DATABASE_URL_DESCARTABLE`.
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { CONTRATO_SENAL } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

const RUTA = '/api/v1/civic/senales';

function cuerpo(over: Record<string, unknown> = {}) {
  return {
    contrato: CONTRATO_SENAL,
    idLocal: randomUUID(),
    tipo: 'basta',
    texto: 'El semáforo de la esquina no anda hace tres meses.',
    cedeLicencia: true,
    casa: 'no',
    provinceId: 6,
    ...over,
  };
}

const galletaDe = (res: { headers: Record<string, unknown> }): string => {
  const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
  return (set.find((c) => c.startsWith('basta_actor=')) ?? '').split(';')[0] ?? '';
};

dsuite('La corroboración', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  /** Carga una señal con un actor nuevo y devuelve su id y su galleta. */
  const soltar = async (over: Record<string, unknown> = {}) => {
    const res = await request.post(RUTA).send(cuerpo(over));
    if (res.status !== 201) {
      throw new Error(`Esperaba 201 y vino ${String(res.status)}: ${JSON.stringify(res.body)}`);
    }
    creadas.push(res.body.data.idPublico);
    return { id: res.body.data.idPublico as string, galleta: galletaDe(res) };
  };

  const confirmar = async (
    id: string,
    galleta: string,
    body: Record<string, unknown> = { veredicto: 'confirm', metodo: 'saw_now' },
  ) => {
    const r = request.post(`${RUTA}/${id}/confirmacion`).send(body);
    if (galleta !== '') void r.set('Cookie', galleta);
    return r;
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

  it('DOS personas distintas corroboran; una sola no alcanza', async () => {
    const { id } = await soltar();

    // La primera: se registra y NO corrobora. Uno no es corroboración, es un par.
    const primera = await confirmar(id, '');
    expect(primera.status).toBe(201);
    expect(primera.body.data.cuentan).toBe(1);
    expect(primera.body.data.estado).toBe('por_verificar');
    expect(primera.body.data.corroboroAhora).toBe(false);

    // La segunda, de otra persona: cruza el umbral.
    const segunda = await confirmar(id, '');
    expect(segunda.status).toBe(201);
    expect(segunda.body.data.cuentan).toBe(2);
    expect(segunda.body.data.estado).toBe('corroborada');
    expect(segunda.body.data.corroboroAhora).toBe(true);

    // Y quedó escrito en la señal, no sólo en la respuesta.
    const leida = await request.get(`${RUTA}/${id}`);
    expect(leida.body.data.senal.estado).toBe('corroborada');
  });

  it('NO podés confirmar tu propia señal', async () => {
    const { id, galleta } = await soltar();
    const res = await confirmar(id, galleta);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ESTUYA');
  });

  it('la misma persona no cuenta dos veces', async () => {
    const { id } = await soltar();
    const primera = await confirmar(id, '');
    const otra = await confirmar(id, galletaDe(primera));
    expect(otra.status).toBe(409);
    expect(otra.body.error.code).toBe('YACONFIRMASTE');
  });

  it('las correcciones netas BLOQUEAN la corroboración', async () => {
    const { id } = await soltar();

    await confirmar(id, '');
    // Una corrección contra una confirmación: empatan, y el empate no pasa.
    // Contar sólo los «sí» sería sordera con forma de algoritmo.
    const conCorreccion = await confirmar(id, '', {
      veredicto: 'correct',
      metodo: 'saw_now',
      nota: 'El semáforo anda, lo que no anda es la luz de la esquina.',
    });
    expect(conCorreccion.body.data.correcciones).toBe(1);
    expect(conCorreccion.body.data.estado).toBe('por_verificar');

    // La segunda confirmación desempata y ahí sí corrobora.
    const tercera = await confirmar(id, '');
    expect(tercera.body.data.cuentan).toBe(2);
    expect(tercera.body.data.estado).toBe('corroborada');
  });

  it('«conozco el lugar» se registra pero NO suma cuando hay punto', async () => {
    const { id } = await soltar({ punto: { lat: -31.42, lng: -64.18 }, precisionPedida: 'exact' });

    const res = await confirmar(id, '', { veredicto: 'confirm', metodo: 'know_place' });
    expect(res.status).toBe(201);
    // Se registró —aparece en la ficha con su procedencia— pero no cuenta:
    // saber cómo es el barrio no es lo mismo que haber ido a mirar.
    expect(res.body.data.cuentan).toBe(0);
    expect(res.body.data.estado).toBe('por_verificar');
  });

  it('sin punto, «conozco el lugar» SÍ suma: no hay a dónde ir', async () => {
    const { id } = await soltar();
    const a = await confirmar(id, '', { veredicto: 'confirm', metodo: 'know_place' });
    const b = await confirmar(id, '', { veredicto: 'confirm', metodo: 'checked_source' });
    expect(a.body.data.cuentan).toBe(1);
    expect(b.body.data.estado).toBe('corroborada');
  });

  it('«no puedo comprobarlo» con veredicto de confirmación es 400', async () => {
    const { id } = await soltar();
    // El par imposible: lo confirmo y no tengo cómo comprobarlo.
    const res = await confirmar(id, '', { veredicto: 'confirm', metodo: 'cannot_verify' });
    expect(res.status).toBe(400);
  });

  it('un DESEO no se corrobora: nunca llega a por_verificar', async () => {
    const { id } = await soltar({ tipo: 'sueño', texto: 'Que vuelva el tren.' });
    const res = await confirmar(id, '');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NOSEVERIFICA');
  });

  it('la cola trae lo que pide otra mirada, y NO lo tuyo', async () => {
    const { id, galleta } = await soltar({ texto: 'Vereda rota en la esquina del club.' });

    // Con la galleta del AUTOR: su propia señal no puede estar en su cola.
    const mia = await request.get(`${RUTA}/cola`).set('Cookie', galleta);
    expect(mia.status).toBe(200);
    expect((mia.body.data.senales as { idPublico: string }[]).map((s) => s.idPublico)).not.toContain(id);

    // Con la galleta de OTRA persona: sí aparece.
    const otra = await request.post(RUTA).send(cuerpo());
    const suya = await request.get(`${RUTA}/cola`).set('Cookie', galletaDe(otra));
    creadas.push(otra.body.data.idPublico);
    expect((suya.body.data.senales as { idPublico: string }[]).map((s) => s.idPublico)).toContain(id);
  });

  it('`/cola` no se confunde con una señal llamada «cola»', async () => {
    // Express matchea por orden: con la ruta paramétrica arriba, esto entraría
    // como `idPublico = 'cola'` y devolvería 404. Es el clásico que no ve el
    // type-check ni el lint — sólo la primera persona que abre la pantalla.
    const res = await request.get(`${RUTA}/cola`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('senales');
  });

  it('sin actor la cola va vacía CON su razón, no con tareas que van a fallar', async () => {
    const res = await request.get(`${RUTA}/cola`);
    expect(res.body.data.senales).toEqual([]);
    expect(res.body.data.razon).toMatch(/identificador/i);
  });

  it('la ficha trae señal, adhesiones y confirmaciones en UNA llamada', async () => {
    const { id } = await soltar();
    await confirmar(id, '');

    const res = await request.get(`${RUTA}/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.senal.idPublico).toBe(id);
    expect(res.body.data.adhesiones).toEqual({ total: 0, mia: false });
    expect(res.body.data.confirmaciones).toHaveLength(1);
    expect(res.body.data.umbral).toBe(2);
    expect(res.body.data.seVerifica).toBe(true);
  });

  it('mirar una señal NO planta una cookie', async () => {
    const { id } = await soltar();
    const res = await request.get(`${RUTA}/${id}`);
    // El identificador se pide donde se usa —al cargar, al adherir, al
    // confirmar— y no por pasar por una página.
    const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    expect(set.some((c) => c.startsWith('basta_actor='))).toBe(false);
  });

  it('la ficha de confirmaciones NUNCA dice quién', async () => {
    const { id } = await soltar();
    await confirmar(id, '');
    const res = await request.get(`${RUTA}/${id}/confirmaciones`);

    expect(res.status).toBe(200);
    expect(res.body.data.umbral).toBe(2);
    for (const c of res.body.data.confirmaciones as Record<string, unknown>[]) {
      expect(c).not.toHaveProperty('actorId');
      expect(c).not.toHaveProperty('actor_id');
    }
  });
});
