import { beforeEach, describe, expect, it, vi } from 'vitest';

import { autorizarCuaderno, nuevoCuaderno, type Cuaderno } from '../modelo';
import { sincronizarCampo } from '../sincronizar';

import type * as ApiModule from '~/lib/api';

import { api, ApiError } from '~/lib/api';
import { tarea } from '~/pages/Iniciativas/__tests__/fixtures';

const m = vi.hoisted(() => ({ filas: [] as Cuaderno[], conflicto: false, escrituras: 0 }));
vi.mock('../archivo', () => ({
  leerCuadernos: (uid: number) =>
    Promise.resolve(structuredClone(m.filas.filter((c) => c.usuarioId === uid))),
  guardarCuaderno: (c: Cuaderno) => {
    m.escrituras++;
    const indice = m.filas.findIndex((v) => v.id === c.id);
    if (m.conflicto || m.filas[indice]?.version !== c.version)
      return Promise.reject(new Error('Conflicto local'));
    const r = { ...c, version: c.version + 1 };
    m.filas[indice] = r;
    return Promise.resolve(r);
  },
}));
vi.mock('~/lib/queries/participacion', () => ({
  tokenParticipacion: () => Promise.resolve('csrf'),
}));
vi.mock('~/lib/api', async (actual) => {
  const a = await actual<typeof ApiModule>();
  return { ...a, api: { post: vi.fn() } };
});
export function fixtureCampo(): Cuaderno {
  const c = nuevoCuaderno(7, 10, tarea, '/iniciativas/escuela?seccion=tareas&tarea=31');
  c.notas = 'Estas notas privadas nunca deben salir.';
  c.campos = {
    titulo: 'Horarios para conversar',
    texto: 'Conversamos en dos encuentros y faltó escuchar otros horarios.',
    url: '',
    desde: '2026-10-01',
    hasta: '2026-10-02',
    observaciones: '2',
    ausencias: 'Faltaron personas de otros turnos.',
    limites: 'No describe a toda la zona.',
    proximoPaso: 'Invitar también por la mañana.',
  };
  return c;
}
describe('Cola de campo', () => {
  beforeEach(() => {
    m.filas = [];
    m.conflicto = false;
    m.escrituras = 0;
    vi.mocked(api.post).mockReset();
  });
  it('no envía borradores, notas privadas ni datos de otra cuenta; exige observaciones explícitas', async () => {
    const privado = fixtureCampo();
    expect(() =>
      autorizarCuaderno({ ...privado, campos: { ...privado.campos, observaciones: '' } }),
    ).toThrow();
    const autorizado = autorizarCuaderno(privado);
    if (!autorizado.sobre) throw new Error('Falta el sobre de prueba');
    expect(JSON.stringify(autorizado.sobre)).not.toContain('notas');
    m.filas = [
      privado,
      {
        ...autorizado,
        id: crypto.randomUUID(),
        usuarioId: 8,
        sobre: { ...autorizado.sobre, usuarioId: 8 },
      },
    ];
    await sincronizarCampo(7, () => true, true);
    expect(api.post).not.toHaveBeenCalled();
  });
  it('reconcilia respuesta perdida usando exactamente el mismo sobre y guarda el recibo', async () => {
    const c = autorizarCuaderno(fixtureCampo());
    m.filas = [c];
    vi.mocked(api.post)
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce({ id: 91 });
    await sincronizarCampo(7, () => true, true);
    expect(m.filas[0]).toMatchObject({ estado: 'espera', intentos: 1 });
    await sincronizarCampo(7, () => true, false);
    expect(api.post).toHaveBeenCalledTimes(1);
    await sincronizarCampo(7, () => true, true);
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(vi.mocked(api.post).mock.calls[0]?.[1]).toEqual(vi.mocked(api.post).mock.calls[1]?.[1]);
    expect(m.filas[0]).toMatchObject({ estado: 'enviado', evidenciaId: 91, notas: c.notas });
  });
  it('detiene conflictos sin rebase automático y no confunde una respuesta inválida con recepción', async () => {
    m.filas = [autorizarCuaderno(fixtureCampo())];
    vi.mocked(api.post).mockRejectedValueOnce(new ApiError(409, 'CAMPO_CONFLICTO', 'Cambió'));
    await sincronizarCampo(7, () => true, true);
    expect(m.filas[0]?.estado).toBe('conflicto');
    await sincronizarCampo(7, () => true, true);
    expect(api.post).toHaveBeenCalledTimes(1);
    m.filas = [autorizarCuaderno(fixtureCampo())];
    vi.mocked(api.post).mockResolvedValueOnce({});
    await sincronizarCampo(7, () => true, true);
    expect(m.filas[0]).toMatchObject({ estado: 'espera', evidenciaId: null });
  });
  it('no publica después del cambio de sesión ni de un conflicto local', async () => {
    m.filas = [autorizarCuaderno(fixtureCampo())];
    let controles = 0;
    await sincronizarCampo(7, () => ++controles === 1, true);
    expect(api.post).not.toHaveBeenCalled();
    m.conflicto = true;
    await sincronizarCampo(7, () => true, true);
    expect(api.post).not.toHaveBeenCalled();
  });
  it('limita intentos automáticos y comparte el envío dentro de la pestaña', async () => {
    m.filas = [{ ...autorizarCuaderno(fixtureCampo()), intentos: 5 }];
    await sincronizarCampo(7, () => true);
    expect(api.post).not.toHaveBeenCalled();
    vi.mocked(api.post).mockResolvedValue({ id: 92 });
    await Promise.all([
      sincronizarCampo(7, () => true, true),
      sincronizarCampo(7, () => true, true),
    ]);
    expect(api.post).toHaveBeenCalledTimes(1);
  });
});
