import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  borradoresIdeales,
  guardarIdeal,
  borrarIdeal,
  publicarIdeal,
  type BorradorIdeal,
} from './ideal';
import { fetchWithTimeout } from './http';
const almacen = vi.hoisted(() => new Map<string, string>());
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (k: string) => almacen.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => {
      almacen.set(k, v);
    }),
  },
}));
vi.mock('./config', () => ({ resolveCivicApiUrl: () => ({ url: 'https://v2.test' }) }));
vi.mock('./http', () => ({ fetchWithTimeout: vi.fn() }));
const base: BorradorIdeal = {
  id: '34b57499-a167-4dda-ae15-f0e0c3c67720',
  texto: 'En mi país ideal puedo aprender sin renunciar a cuidar.',
  tema: '',
  campanaId: null,
  edicion: null,
  modo: 'personal',
  fecha: '2026-10-08T00:00:00Z',
  envio: null,
  recibo: null,
};
describe('La reflexión nueva no publica la bitácora privada', () => {
  beforeEach(() => {
    almacen.clear();
    vi.clearAllMocks();
  });
  it('guardar, reiniciar y borrar son operaciones locales sin red', async () => {
    await guardarIdeal(base);
    expect(await borradoresIdeales()).toEqual([base]);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
    await borrarIdeal(base.id);
    expect(await borradoresIdeales()).toEqual([]);
  });
  it('no envía sin una revisión autorizada', async () => {
    await expect(publicarIdeal(base)).rejects.toThrow('Revisá');
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });
  it('un cambio de cuenta conserva el envío y no lo atribuye a otra persona', async () => {
    const { contribucionSchema } = await import('@v2/shared');
    const pendiente = {
      ...base,
      cuentaAlConfirmar: 1,
      envio: contribucionSchema.parse({
        senal: {
          contrato: 'basta-senal/v1',
          idLocal: base.id,
          tipo: 'sueño',
          texto: base.texto,
          casa: 'sinRespuesta',
          cedeLicencia: false,
        },
        campanaId: null,
        edicion: null,
        fragmentos: [],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      }),
    };
    await guardarIdeal(pendiente);
    vi.mocked(fetchWithTimeout).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { user: { id: 2 } } })),
    );
    await expect(publicarIdeal(pendiente)).rejects.toThrow('La cuenta cambió');
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    expect((await borradoresIdeales())[0]?.cuentaAlConfirmar).toBe(1);
  });
  it('una respuesta perdida conserva el mismo id y un recibo posterior queda guardado', async () => {
    const envio = {
      senal: {
        contrato: 'basta-senal/v1' as const,
        idLocal: base.id,
        tipo: 'sueño' as const,
        texto: base.texto,
        cedeLicencia: false,
        casa: 'sinRespuesta' as const,
      },
      campanaId: null,
      edicion: null,
      modo: 'personal' as const,
      autorConfirmo: false,
      fragmentos: [],
      interpretacionConfirmada: true as const,
      aceptaPublicar: true as const,
    };
    // El contrato completo se valida en la función antes de la red.
    const { contribucionSchema } = await import('@v2/shared');
    const pendiente = { ...base, envio: contribucionSchema.parse(envio), cuentaAlConfirmar: null };
    await guardarIdeal(pendiente);
    vi.mocked(fetchWithTimeout)
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { csrfToken: 'renovar' } })))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { csrfToken: 'csrf' } })))
      .mockRejectedValueOnce(new Error('Sin conexión'));
    await expect(publicarIdeal(pendiente)).rejects.toThrow('Sin conexión');
    expect((await borradoresIdeales())[0]!.envio!.senal.idLocal).toBe(base.id);
    vi.mocked(fetchWithTimeout)
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { csrfToken: 'renovar' } })))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { csrfToken: 'csrf' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { idPublico: 'recibo' } })));
    expect((await publicarIdeal(pendiente)).recibo).toBe('recibo');
    expect((await borradoresIdeales())[0]!.recibo).toBe('recibo');
  });
});
