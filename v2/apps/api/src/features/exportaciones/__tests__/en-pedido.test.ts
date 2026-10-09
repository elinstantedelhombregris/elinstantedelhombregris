import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfig } from '../../../lib/config.js';
import { logger } from '../../../lib/logger.js';
import { avanzarEnPedido, TRAMO_EN_PEDIDO } from '../en-pedido.js';
import { prepararExportaciones } from '../worker.js';

import type { ExportacionesRepository, ExportacionFila } from '@v2/db';

vi.mock('../../../lib/logger.js', () => ({ logger: { warn: vi.fn() } }));
vi.mock('../../../lib/config.js', () => ({ getConfig: vi.fn() }));
vi.mock('../worker.js', () => ({ prepararExportaciones: vi.fn() }));

const fila = (estado: ExportacionFila['estado']) =>
  ({ id: '00000000-0000-4000-8000-000000000001', estado }) as ExportacionFila;
const repoCon = (devuelve: ExportacionFila | null) => {
  const vigencia = vi.fn().mockResolvedValue(devuelve);
  return { repo: { vigencia } as unknown as ExportacionesRepository, vigencia };
};
const encendido = (valor: boolean) =>
  vi
    .mocked(getConfig)
    .mockReturnValue({ exportacionesEnPedido: valor } as ReturnType<typeof getConfig>);

describe('El avance en pedido de las exportaciones', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    encendido(true);
    vi.mocked(prepararExportaciones).mockResolvedValue({ trabajo: null, pasos: 0 });
  });

  it('avanza un tramo acotado, sin barrido, y devuelve el estado releído', async () => {
    const { repo, vigencia } = repoCon(fila('disponible'));
    const r = await avanzarEnPedido(repo, fila('solicitado'));
    expect(prepararExportaciones).toHaveBeenCalledTimes(1);
    expect(prepararExportaciones).toHaveBeenCalledWith({
      maxPasos: 20,
      presupuestoMs: 10_000,
      limpiar: false,
    });
    expect(TRAMO_EN_PEDIDO).toEqual({ maxPasos: 20, presupuestoMs: 10_000, limpiar: false });
    expect(vigencia).toHaveBeenCalledWith(fila('solicitado').id);
    expect(r?.estado).toBe('disponible');
  });

  it('también avanza un trabajo ya en preparación', async () => {
    const { repo } = repoCon(fila('preparando'));
    await avanzarEnPedido(repo, fila('preparando'));
    expect(prepararExportaciones).toHaveBeenCalledTimes(1);
  });

  it.each(['disponible', 'fallido', 'vencido'] as const)(
    'no toca el worker para un trabajo %s',
    async (estado) => {
      const { repo, vigencia } = repoCon(null);
      const f = fila(estado);
      expect(await avanzarEnPedido(repo, f)).toBe(f);
      expect(prepararExportaciones).not.toHaveBeenCalled();
      expect(vigencia).not.toHaveBeenCalled();
    },
  );

  it('apagado por EXPORTACIONES_EN_PEDIDO=0, devuelve la fila sin trabajar', async () => {
    encendido(false);
    const { repo } = repoCon(null);
    const f = fila('solicitado');
    expect(await avanzarEnPedido(repo, f)).toBe(f);
    expect(prepararExportaciones).not.toHaveBeenCalled();
  });

  it('un fallo del worker no llega a la respuesta: se registra y se devuelve el estado actual', async () => {
    vi.mocked(prepararExportaciones).mockRejectedValue(new Error('relato-reservado'));
    const { repo } = repoCon(fila('preparando'));
    const r = await avanzarEnPedido(repo, fila('solicitado'));
    expect(r?.estado).toBe('preparando');
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('relato-reservado');
  });

  it('si el trabajo desapareció mientras tanto devuelve null', async () => {
    const { repo } = repoCon(null);
    expect(await avanzarEnPedido(repo, fila('solicitado'))).toBeNull();
  });
});
