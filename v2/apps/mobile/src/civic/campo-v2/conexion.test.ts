import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { leerConexion, vincularTelefono, desconectarTelefono, pedirCampo } from './conexion';
const m = vi.hoisted(() => ({ stored: null as string | null, os: 'ios', fetch: vi.fn() }));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return m.os;
    },
  },
}));
vi.mock('../config', () => ({ resolveCivicApiUrl: () => ({ url: 'https://v2.test' }) }));
vi.mock('expo-secure-store', () => ({
  getItemAsync: async () => m.stored,
  setItemAsync: async (_k: string, v: string) => {
    m.stored = v;
  },
  deleteItemAsync: async () => {
    m.stored = null;
  },
}));
beforeEach(() => {
  m.stored = null;
  m.os = 'ios';
  m.fetch.mockReset();
  vi.stubGlobal('fetch', m.fetch);
});
afterEach(() => vi.unstubAllGlobals());
const paquete = {
  usuarioId: 7,
  dispositivoId: '20d3ee6b-4cc3-4ed6-ae74-20880d278210',
  items: [],
  siguiente: null,
};
it('guarda sólo en SecureStore y bloquea otra cuenta antes de enviar', async () => {
  m.fetch.mockResolvedValue(new Response(JSON.stringify({ data: paquete })));
  const c = await vincularTelefono('a'.repeat(64));
  expect(await leerConexion()).toEqual(c);
  expect(m.fetch.mock.calls[0]?.[1]).toMatchObject({
    credentials: 'omit',
    headers: { authorization: 'Bearer ' + 'a'.repeat(64) },
  });
  m.stored = JSON.stringify({ ...c, usuarioId: 8 });
  m.fetch.mockClear();
  await expect(pedirCampo(c, '/tareas')).rejects.toThrow('cuenta cambió');
  expect(m.fetch).not.toHaveBeenCalled();
  await desconectarTelefono();
  expect(m.stored).toBeNull();
});
it('un cierre durante la vinculación no restaura credenciales y web no almacena secretos', async () => {
  let resolver: (r: Response) => void = () => undefined;
  m.fetch.mockReturnValue(
    new Promise<Response>((resolve) => {
      resolver = resolve;
    }),
  );
  const pendiente = vincularTelefono('b'.repeat(64));
  await desconectarTelefono();
  resolver(new Response(JSON.stringify({ data: paquete })));
  await expect(pendiente).rejects.toThrow('vinculación cambió');
  expect(m.stored).toBeNull();
  m.os = 'web';
  await expect(vincularTelefono('b'.repeat(64))).rejects.toThrow('iOS o Android');
  expect(await leerConexion()).toBeNull();
});

it('descarta una descarga que termina después de desconectar el teléfono', async () => {
  m.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ data: paquete })));
  const c = await vincularTelefono('c'.repeat(64));
  let resolver: (r: Response) => void = () => undefined;
  m.fetch.mockClear();
  m.fetch.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      resolver = resolve;
    }),
  );
  const pendiente = pedirCampo(c, '/tareas');
  await vi.waitFor(() => expect(m.fetch).toHaveBeenCalledOnce());
  await desconectarTelefono();
  resolver(new Response(JSON.stringify({ data: paquete })));
  await expect(pendiente).rejects.toThrow('No se descargaron datos');
});
