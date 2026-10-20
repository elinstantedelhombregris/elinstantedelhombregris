import { describe, expect, it, vi } from 'vitest';

import type { ResultadoOpinion } from '@v2/shared';

import { ApiError } from '~/lib/api';
import {
  crearColaDeOpiniones,
  leerPaginaDeGestion,
  type OpinionPendiente,
} from '~/lib/queries/pila';

const ok: ResultadoOpinion = { coinciden: 2, regionCompleta: null };
const opinion = (id: string): OpinionPendiente => ({ id, valor: 'acuerdo', provinciaId: 17 });
const sinRed = () => new TypeError('Failed to fetch');
/** Las esperas se registran y no se esperan: la prueba no tarda nueve segundos. */
const reloj = () => {
  const esperas: number[] = [];
  return {
    esperas,
    esperar: (ms: number) => {
      esperas.push(ms);
      return Promise.resolve();
    },
  };
};

describe('la cola de opiniones', () => {
  it('con la red que falla y se recupera, reintenta con espera creciente y no pierde nada', async () => {
    const r = reloj();
    const enviar = vi
      .fn<(o: OpinionPendiente) => Promise<ResultadoOpinion>>()
      .mockRejectedValueOnce(sinRed())
      .mockRejectedValueOnce(sinRed())
      .mockResolvedValueOnce(ok);
    const cola = crearColaDeOpiniones(enviar, { esperar: r.esperar });
    await expect(cola.opinar(opinion('a'))).resolves.toEqual(ok);
    expect(enviar).toHaveBeenCalledTimes(3);
    expect(r.esperas).toEqual([1_000, 3_000]);
    expect(cola.estado()).toEqual({ pendientes: 0, perdidas: [] });
  });

  it('después de tres reintentos la da por perdida, y reintentar la vuelve a mandar', async () => {
    const r = reloj();
    const enviar = vi.fn<(o: OpinionPendiente) => Promise<ResultadoOpinion>>(() =>
      Promise.reject(sinRed()),
    );
    const cola = crearColaDeOpiniones(enviar, { esperar: r.esperar });
    const avisos = vi.fn();
    cola.suscribir(avisos);
    await expect(cola.opinar(opinion('a'))).resolves.toBeNull();
    expect(enviar).toHaveBeenCalledTimes(4);
    expect(r.esperas).toEqual([1_000, 3_000, 9_000]);
    expect(cola.estado().perdidas).toEqual([opinion('a')]);
    expect(avisos).toHaveBeenCalled();

    enviar.mockResolvedValue(ok);
    await cola.reintentar();
    expect(cola.estado()).toEqual({ pendientes: 0, perdidas: [] });
  });

  it('mientras espera, la cuenta como pendiente', async () => {
    let soltar: (r: ResultadoOpinion) => void = () => undefined;
    const cola = crearColaDeOpiniones(
      () =>
        new Promise<ResultadoOpinion>((resolver) => {
          soltar = resolver;
        }),
    );
    const enviada = cola.opinar(opinion('a'));
    expect(cola.estado().pendientes).toBe(1);
    soltar(ok);
    await enviada;
    expect(cola.estado().pendientes).toBe(0);
  });

  it('un 404 se descarta sin avisar: el aporte ya salió de Mirar', async () => {
    const cola = crearColaDeOpiniones(() =>
      Promise.reject(new ApiError(404, 'NO_ENCONTRADO', 'No está.')),
    );
    await expect(cola.opinar(opinion('a'))).resolves.toBeNull();
    expect(cola.estado()).toEqual({ pendientes: 0, perdidas: [] });
  });

  it('otro 4xx no se reintenta solo, pero se avisa', async () => {
    const enviar = vi.fn(() => Promise.reject(new ApiError(403, 'CSRF', 'Recargá.')));
    const cola = crearColaDeOpiniones(enviar);
    await cola.opinar(opinion('a'));
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(cola.estado().perdidas).toHaveLength(1);
  });

  it('una opinión nueva sobre el mismo aporte reemplaza a la que esperaba', async () => {
    const r = reloj();
    const enviar = vi
      .fn<(o: OpinionPendiente) => Promise<ResultadoOpinion>>()
      .mockRejectedValueOnce(sinRed())
      .mockResolvedValue(ok);
    const cola = crearColaDeOpiniones(enviar, {
      esperar: (ms) =>
        r.esperar(ms).then(() => {
          void cola.opinar({ id: 'a', valor: 'desacuerdo', provinciaId: 17 });
        }),
    });
    await expect(cola.opinar(opinion('a'))).resolves.toBeNull();
    await vi.waitFor(() => {
      expect(cola.estado().pendientes).toBe(0);
    });
    expect(enviar.mock.calls.map(([o]) => o.valor)).toEqual(['acuerdo', 'desacuerdo']);
    expect(cola.estado().perdidas).toEqual([]);
  });
});

describe('la página de gestión', () => {
  const aporte = {
    id: 'x',
    texto: 't',
    provincia: null,
    publicadoEn: '2026-10-20T00:00:00.000Z',
    reportes: [],
    retenido: null,
    ultimaDecision: null,
  };
  it('lee la lista sola y la página con cursor', () => {
    expect(leerPaginaDeGestion([aporte])).toEqual({ aportes: [aporte], siguiente: null });
    expect(leerPaginaDeGestion({ items: [aporte], siguiente: 50 })).toEqual({
      aportes: [aporte],
      siguiente: '50',
    });
    expect(leerPaginaDeGestion({ data: [aporte], cursor: 'abc' })).toEqual({
      aportes: [aporte],
      siguiente: 'abc',
    });
    expect(leerPaginaDeGestion(undefined)).toEqual({ aportes: [], siguiente: null });
  });
});
