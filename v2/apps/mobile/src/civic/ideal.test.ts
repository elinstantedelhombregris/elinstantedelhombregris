import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  borradoresIdeales,
  guardarIdeal,
  borrarIdeal,
  publicarIdeal,
  ErrorIdeal,
  esErrorDeSesion,
  escribirIdeal,
  leerIdeal,
  mensajeDeRed,
  MENSAJE_DE_NUESTRO_LADO,
  MENSAJE_SIN_CONEXION,
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

const respuesta = (cuerpo: unknown, status = 200) =>
  new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), { status });
/** Un 401 sin renovación posible: la sesión no vale. fetchIdeal intenta refrescar y se rinde cuando el contexto falla. */
const sinSesion = (mensaje = 'Ingresá para continuar.') => {
  vi.mocked(fetchWithTimeout)
    .mockResolvedValueOnce(respuesta({ error: { message: mensaje } }, 401))
    .mockResolvedValueOnce(respuesta({}, 401));
};

describe('Qué se le dice a la persona cuando algo falla (mensajeDeRed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin conexión o sin respuesta a tiempo: dice que su texto sigue guardado, no el error técnico', () => {
    const abortado = Object.assign(new Error('Aborted'), { name: 'AbortError' });
    for (const e of [
      new TypeError('Network request failed'),
      new TypeError('Failed to fetch'),
      new TypeError('Load failed'),
      abortado,
    ]) {
      expect(mensajeDeRed(e)).toBe(MENSAJE_SIN_CONEXION);
    }
    expect(MENSAJE_SIN_CONEXION).toBe(
      'No hay conexión. Tu texto sigue guardado en este teléfono; probá de nuevo cuando tengas señal.',
    );
  });

  it('un TypeError que no es de red es un bug nuestro, no «sin conexión»', () => {
    expect(mensajeDeRed(new TypeError("Cannot read properties of undefined (reading 'id')"))).toBe(
      MENSAJE_DE_NUESTRO_LADO,
    );
  });

  it('un contrato inválido (Zod) se explica con las razones en castellano, sin repetir ni volcar el JSON', async () => {
    const { contribucionSchema } = await import('@v2/shared');
    const invalido = contribucionSchema.safeParse({
      senal: {
        contrato: 'basta-senal/v1',
        idLocal: base.id,
        tipo: 'sueño',
        texto: base.texto,
        casa: 'sinRespuesta',
        cedeLicencia: false,
      },
      campanaId: '34b57499-a167-4dda-ae15-f0e0c3c67720',
      edicion: null,
      fragmentos: [],
      interpretacionConfirmada: true,
      aceptaPublicar: true,
    });
    expect(invalido.success).toBe(false);
    const mensaje = mensajeDeRed(invalido.error);
    expect(mensaje).toBe('La campaña y su edición van juntas.');
    expect(mensaje).not.toMatch(/[{\[]|"code"|ZodError/);
  });

  it('un ZodError sin razones legibles cae al mensaje general', () => {
    expect(mensajeDeRed({ name: 'ZodError', issues: [] })).toBe(MENSAJE_DE_NUESTRO_LADO);
  });

  it('el mensaje que el servidor o la app escribieron para la persona se conserva', () => {
    expect(mensajeDeRed(new ErrorIdeal('Email o contraseña incorrectos.', 401))).toBe(
      'Email o contraseña incorrectos.',
    );
    expect(mensajeDeRed(new ErrorIdeal('La cuenta cambió desde que autorizaste el envío.'))).toBe(
      'La cuenta cambió desde que autorizaste el envío.',
    );
  });

  it('todo lo demás —un 5xx, un JSON roto, cualquier excepción— dice que falló de nuestro lado', () => {
    for (const e of [
      new ErrorIdeal('Internal Server Error', 500),
      new ErrorIdeal('Bad Gateway', 502),
      new SyntaxError('JSON Parse error: Unexpected end of input'),
      new Error('undefined is not an object'),
      'texto suelto',
      null,
      undefined,
    ]) {
      expect(mensajeDeRed(e)).toBe(MENSAJE_DE_NUESTRO_LADO);
    }
    expect(MENSAJE_DE_NUESTRO_LADO).toBe('Algo falló de nuestro lado. Probá de nuevo en un rato.');
  });
});

describe('Sólo un 401 vale como «la sesión no está»', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('leer sin sesión falla con el estado 401 y se reconoce como error de sesión', async () => {
    sinSesion();
    const e = await leerIdeal('/api/auth/me').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErrorIdeal);
    expect((e as ErrorIdeal).status).toBe(401);
    expect(esErrorDeSesion(e)).toBe(true);
  });

  it('una falla de red no es un error de sesión: la cuenta puede seguir ingresada', async () => {
    vi.mocked(fetchWithTimeout).mockRejectedValueOnce(new TypeError('Network request failed'));
    const e = await leerIdeal('/api/auth/me').catch((x: unknown) => x);
    expect(esErrorDeSesion(e)).toBe(false);
    expect(mensajeDeRed(e)).toBe(MENSAJE_SIN_CONEXION);
  });

  it('el corte por tiempo tampoco lo es', async () => {
    vi.mocked(fetchWithTimeout).mockRejectedValueOnce(
      Object.assign(new Error('Aborted'), { name: 'AbortError' }),
    );
    const e = await leerIdeal('/api/v1/mi-espacio').catch((x: unknown) => x);
    expect(esErrorDeSesion(e)).toBe(false);
    expect(mensajeDeRed(e)).toBe(MENSAJE_SIN_CONEXION);
  });

  it('un 5xx, aunque llegue sin JSON (un proxy caído), no es de sesión y no filtra el parseo', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValueOnce(
      respuesta('<html>502 Bad Gateway</html>', 502),
    );
    const e = await leerIdeal('/api/v1/mi-espacio').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErrorIdeal);
    expect((e as ErrorIdeal).status).toBe(502);
    expect(esErrorDeSesion(e)).toBe(false);
    expect(mensajeDeRed(e)).toBe(MENSAJE_DE_NUESTRO_LADO);
  });

  it('un 403 o un 404 tampoco cierran la sesión', async () => {
    for (const status of [403, 404]) {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce(
        respuesta({ error: { message: 'No tenés permiso.' } }, status),
      );
      expect(esErrorDeSesion(await leerIdeal('/api/v1/mi-espacio').catch((x: unknown) => x))).toBe(
        false,
      );
    }
  });

  it('una contraseña incorrecta llega a la pantalla con el mensaje del servidor', async () => {
    vi.mocked(fetchWithTimeout)
      .mockResolvedValueOnce(respuesta({ data: { csrfToken: 'csrf' } }))
      .mockResolvedValueOnce(
        respuesta({ error: { message: 'Email o contraseña incorrectos.' } }, 401),
      );
    const e = await escribirIdeal('/api/auth/login', { identifier: 'a', password: 'b' }).catch(
      (x: unknown) => x,
    );
    expect(mensajeDeRed(e)).toBe('Email o contraseña incorrectos.');
  });

  it('una respuesta de error ilegible del envío conserva el borrador y no vuelca el parseo', async () => {
    const { contribucionSchema } = await import('@v2/shared');
    const pendiente = {
      ...base,
      cuentaAlConfirmar: null,
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
    vi.mocked(fetchWithTimeout)
      // cuentaIdealActual: sin sesión (401 y sin renovación) = null = la cuenta confirmada.
      .mockResolvedValueOnce(respuesta({}, 401))
      .mockResolvedValueOnce(respuesta({}, 401))
      // contexto CSRF y envío
      .mockResolvedValueOnce(respuesta({ data: { csrfToken: 'csrf' } }))
      .mockResolvedValueOnce(respuesta('<html>Bad Gateway</html>', 502));
    const e = await publicarIdeal(pendiente).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErrorIdeal);
    expect((e as ErrorIdeal).message).toBe(
      'No llegó un recibo. Conservamos el mismo envío para reintentar.',
    );
    expect(mensajeDeRed(e)).toBe(MENSAJE_DE_NUESTRO_LADO);
  });
});
