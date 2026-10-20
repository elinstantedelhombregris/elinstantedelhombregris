import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CONTRATO_SENAL, LARGO_LINEA, PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Imaginar } from '../Imaginar';

import type * as Imagen from '../comun/imagen-para-compartir';
import type { ContribucionInput } from '@v2/shared';
import type * as ApiModulo from '~/lib/api';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { ApiError } from '~/lib/api';
import { armarAporteIdeal } from '~/lib/participacion/armar-aporte';
import { guardarTextoEnCurso } from '~/lib/participacion/texto-en-curso';

const m = vi.hoisted(() => ({
  user: null as null | { id: number },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  publicar: undefined as undefined | ((cuerpo: unknown) => Promise<unknown>),
  parecidos: undefined as undefined | (() => Promise<unknown>),
  leer: vi.fn(() => Promise.resolve([] as unknown[])),
  guardar: vi.fn(() => Promise.resolve()),
  borrar: vi.fn(() => Promise.resolve()),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/api', async (importar) => {
  const real = await importar<typeof ApiModulo>();
  return { ...real, api: { get: m.get, post: m.post, put: m.put, patch: vi.fn(), del: vi.fn() } };
});
vi.mock('~/lib/participacion/borradores', () => ({
  leerBorradores: m.leer,
  guardarBorrador: m.guardar,
  borrarBorrador: m.borrar,
}));
vi.mock('../comun/imagen-para-compartir', async (importar) => {
  const real = await importar<typeof Imagen>();
  return { ...real, dibujarPapelito: vi.fn(() => Promise.resolve()) };
});

const TEMAS = [
  ['alimento', 'Alimento'],
  ['vivienda', 'Vivienda'],
  ['trabajo', 'Trabajo'],
  ['cuidado', 'Cuidado'],
  ['salud', 'Salud'],
  ['educación', 'Educación'],
  ['ambiente', 'Ambiente'],
  ['movilidad', 'Movilidad'],
  ['seguridad', 'Seguridad'],
  ['cultura', 'Cultura'],
  ['democracia', 'Democracia'],
  ['justicia', 'Justicia'],
  ['economía', 'Economía'],
].map(([clave, etiqueta]) => ({ clave, etiqueta }));
const PROVINCIAS = [
  { id: 66, name: 'Salta', isoCode: 'AR-A' },
  { id: 2, name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C' },
  { id: 14, name: 'Córdoba', isoCode: 'AR-X' },
];
const NACIONAL = {
  id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
  slug: 'mi-argentina-ideal',
  revision: 1,
  estado: 'abierta',
  contrato: {
    titulo: 'Mi Argentina ideal',
    pregunta: PREGUNTA_MI_ARGENTINA_IDEAL,
    responsable: 'Juan Bravin',
    fechaDevolucion: '2027-03-15',
  },
};
const RECIBO: ReciboParticipacion = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'sueño',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
  contexto: { campanaId: NACIONAL.id, edicion: 1 },
};
const PARECIDO = {
  id: 'a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a01',
  texto: 'Que el hospital atienda de noche',
  provincia: 'Jujuy',
};
const ESCRITO =
  'En mi Argentina ideal, que un turno en el hospital no tarde tres meses. Y que haya médicos en la salita.';
const LINEA = 'Que un turno en el hospital no tarde tres meses.';

function montar(ruta = '/mi-argentina-ideal/imaginar') {
  window.history.replaceState(null, '', ruta);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Imaginar />
    </QueryClientProvider>,
  );
}
const pulsar = (nombre: string | RegExp) => {
  fireEvent.click(screen.getByRole('button', { name: nombre }));
};
const campoTexto = () => screen.getByLabelText<HTMLTextAreaElement>('Lo que imaginás');
const campoLinea = () => screen.getByLabelText<HTMLTextAreaElement>('Tu aporte');
async function hastaLaLinea(texto = ESCRITO) {
  fireEvent.change(campoTexto(), { target: { value: texto } });
  pulsar('Seguir');
  await screen.findByRole('heading', { name: 'Tu aporte, en una frase' });
}
async function elegirProvincia(valor = '66') {
  const selector = screen.getByLabelText<HTMLSelectElement>('¿De qué provincia sos?');
  await within(selector).findByRole('option', { name: 'Salta' });
  fireEvent.change(selector, { target: { value: valor } });
}
async function hastaPublicar(texto = ESCRITO) {
  await hastaLaLinea(texto);
  await elegirProvincia();
  pulsar('Seguir');
  await screen.findByRole('heading', { name: 'Así lo van a ver' });
  // La campaña ya se comprobó: el aporte va a la nacional.
  await screen.findByText(/Tu aporte va a entrar en la campaña nacional/);
}
function elegirYAceptar(lectura: 'libre' | 'reservado' = 'libre') {
  fireEvent.click(
    screen.getByLabelText(
      lectura === 'libre'
        ? 'Que cualquiera lo pueda leer y citar, sin tu nombre. Entra a Mirar.'
        : 'Que cuente, pero que el texto quede reservado. No entra a Mirar.',
    ),
  );
  fireEvent.click(screen.getByLabelText(/Publicá mi aporte en Mi Argentina ideal/));
}
const enviados = () =>
  m.post.mock.calls
    .filter(([ruta]) => ruta === '/api/v1/contribuciones')
    .map(([, cuerpo]) => cuerpo as ContribucionInput);

beforeEach(() => {
  vi.clearAllMocks();
  m.user = null;
  m.publicar = undefined;
  m.parecidos = undefined;
  m.leer.mockImplementation(() => Promise.resolve([]));
  m.get.mockImplementation((ruta: string) => {
    if (ruta === '/api/v1/contribuciones/contexto')
      return Promise.resolve({ csrfToken: 'token-de-prueba', temas: TEMAS, proveedor: null });
    if (ruta.startsWith('/api/v1/campanas/mi-argentina-ideal')) return Promise.resolve(NACIONAL);
    if (ruta === '/api/open-data/provinces') return Promise.resolve({ provinces: PROVINCIAS });
    return Promise.reject(new ApiError(404, 'NO_ENCONTRADO', 'No está.'));
  });
  m.post.mockImplementation((ruta: string, cuerpo: unknown) => {
    if (ruta === '/api/v1/contribuciones')
      return m.publicar ? m.publicar(cuerpo) : Promise.resolve(RECIBO);
    if (ruta === '/api/v1/vision/parecidos')
      return m.parecidos ? m.parecidos() : Promise.resolve([]);
    return Promise.reject(new ApiError(404, 'NO_ENCONTRADO', 'No está.'));
  });
  m.put.mockImplementation(() => Promise.resolve({ coinciden: 4, regionCompleta: null }));
  window.localStorage.clear();
});

describe('Imaginar — la pregunta', () => {
  it('pregunta lo de la campaña y no deja seguir con el campo vacío', () => {
    montar();
    expect(
      screen.getByRole('heading', { level: 1, name: PREGUNTA_MI_ARGENTINA_IDEAL }),
    ).toBeInTheDocument();
    pulsar('Seguir');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escribí aunque sea una frase para seguir.',
    );
    expect(screen.queryByRole('heading', { name: 'Tu aporte, en una frase' })).toBeNull();
  });

  it('una punta cambia la pista y no escribe en el campo', () => {
    montar();
    const punta = screen.getByRole('button', { name: 'tu salud' });
    fireEvent.click(punta);
    expect(punta).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('¿Qué pasa cuando te enfermás un martes?')).toBeInTheDocument();
    expect(campoTexto().value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'tu barrio' }));
    expect(screen.getByText('¿Cómo volvés de noche? ¿Qué hay a diez cuadras?')).toBeInTheDocument();
    expect(punta).toHaveAttribute('aria-pressed', 'false');
    expect(campoTexto().value).toBe('');
  });

  it('el texto que viene de la portada arranca en la segunda pantalla', async () => {
    guardarTextoEnCurso('En mi Argentina ideal, vuelvo de noche tranquila a mi casa.');
    montar();
    expect(
      await screen.findByRole('heading', { name: 'Tu aporte, en una frase' }),
    ).toBeInTheDocument();
    expect(campoLinea().value).toBe('Vuelvo de noche tranquila a mi casa.');
    pulsar('← Volver a lo que escribí');
    expect(campoTexto().value).toBe('En mi Argentina ideal, vuelvo de noche tranquila a mi casa.');
  });

  it('carga un borrador del enlace, y guarda uno en el dispositivo cuando se pide', async () => {
    const id = '3f1c9a3e-8a70-4d16-a2a6-6a3f4a1f5b11';
    m.leer.mockImplementation(() =>
      Promise.resolve([
        {
          id,
          fecha: '2026-10-19T12:00:00Z',
          frases: ['Aprender a nadar en el río.', '', ''],
          campanaId: null,
          edicion: null,
        },
      ]),
    );
    montar(`/mi-argentina-ideal/imaginar?borrador=${id}`);
    await waitFor(() => {
      expect(campoTexto().value).toBe('Aprender a nadar en el río.');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Retomaste un borrador');
    fireEvent.change(campoTexto(), { target: { value: 'Aprender a nadar en el río, cerca.' } });
    pulsar('Guardar borrador en este dispositivo');
    await waitFor(() => {
      expect(m.guardar).toHaveBeenCalledWith(
        expect.objectContaining({ id, frases: ['Aprender a nadar en el río, cerca.', '', ''] }),
      );
    });
    expect(enviados()).toHaveLength(0);
  });
});

describe('Imaginar — el aporte en pocas palabras', () => {
  it('viene con la primera oración sin la fórmula, y una sugerencia larga no pasa de 140', async () => {
    const { unmount } = montar();
    await hastaLaLinea();
    expect(campoLinea().value).toBe(LINEA);
    expect(screen.getByText(`${LINEA.length} de ${LARGO_LINEA}`)).toBeInTheDocument();
    unmount();

    montar();
    await hastaLaLinea(
      `En mi Argentina ideal ${'cada barrio tiene su plaza y su escuela '.repeat(8)}`,
    );
    expect(campoLinea().value.length).toBeLessThanOrEqual(LARGO_LINEA);
    expect(campoLinea().value).toMatch(/^Cada barrio/);
  });

  it('sugiere el tema como pregunta, sin marcarlo, y se puede confirmar o cambiar', async () => {
    montar();
    await hastaLaLinea();
    expect(await screen.findByText(/¿Es sobre/)).toHaveTextContent('¿Es sobre salud?');
    const salud = screen.getByRole('button', { name: 'Salud' });
    expect(salud).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(salud);
    expect(salud).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(/¿Es sobre/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Trabajo' }));
    expect(screen.getByRole('button', { name: 'Trabajo' })).toHaveAttribute('aria-pressed', 'true');
    expect(salud).toHaveAttribute('aria-pressed', 'false');
  });

  it('un teléfono se marca mientras se escribe y no deja llegar a publicar', async () => {
    montar();
    await hastaLaLinea();
    await elegirProvincia();
    fireEvent.change(campoLinea(), {
      target: { value: 'Que me llamen al 11 1234-5678 del hospital' },
    });
    const aviso = screen.getByText(/Esto parece un teléfono/);
    expect(within(aviso).getByText('11 1234-5678').tagName).toBe('MARK');
    pulsar('Seguir');
    expect(screen.getByRole('alert')).toHaveTextContent('Sacá un teléfono antes de seguir');
    expect(screen.queryByRole('heading', { name: 'Así lo van a ver' })).toBeNull();
    expect(enviados()).toHaveLength(0);
  });

  it('pide elegir la provincia, o «Prefiero no decirlo»', async () => {
    montar();
    await hastaLaLinea();
    pulsar('Seguir');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Elegí tu provincia, o «Prefiero no decirlo».',
    );
    await elegirProvincia('ninguna');
    pulsar('Seguir');
    expect(await screen.findByRole('heading', { name: 'Así lo van a ver' })).toBeInTheDocument();
    expect(screen.getByText('Alguien de la Argentina imagina')).toBeInTheDocument();
  });
});

describe('Imaginar — los aportes parecidos', () => {
  it('se muestran debajo y «Me sumo» manda la opinión con la provincia elegida', async () => {
    m.parecidos = () => Promise.resolve([PARECIDO]);
    montar();
    await hastaLaLinea();
    await elegirProvincia();
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Otras personas imaginan algo parecido' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('«Que el hospital atienda de noche»')).toBeInTheDocument();
    pulsar('Me sumo');
    await screen.findByText('Te sumaste');
    expect(m.put).toHaveBeenCalledWith(
      `/api/v1/pila/opiniones/${PARECIDO.id}`,
      { valor: 'acuerdo', provinciaId: 66 },
      { csrfToken: 'token-de-prueba' },
    );
    // Sumarse no reemplaza publicar el propio.
    pulsar('Seguir');
    expect(await screen.findByRole('heading', { name: 'Así lo van a ver' })).toBeInTheDocument();
  });

  it('si la búsqueda de parecidos falla, la pantalla sigue igual', async () => {
    m.parecidos = () => Promise.reject(new ApiError(500, 'ERROR', 'Se cayó.'));
    montar();
    await hastaLaLinea();
    await waitFor(
      () => {
        expect(m.post).toHaveBeenCalledWith(
          '/api/v1/vision/parecidos',
          { texto: LINEA },
          { csrfToken: 'token-de-prueba' },
        );
      },
      { timeout: 2000 },
    );
    expect(
      screen.queryByRole('heading', { name: 'Otras personas imaginan algo parecido' }),
    ).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    await elegirProvincia();
    pulsar('Seguir');
    expect(await screen.findByRole('heading', { name: 'Así lo van a ver' })).toBeInTheDocument();
  });
});

describe('Imaginar — publicar', () => {
  it('sin elegir quién puede leerlo no publica, y ninguna opción viene marcada', async () => {
    montar();
    await hastaPublicar();
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    fireEvent.click(screen.getByLabelText(/Publicá mi aporte en Mi Argentina ideal/));
    pulsar('Publicar mi aporte');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Elegí quién puede leerlo. Las dos opciones publican tu aporte.',
    );
    expect(enviados()).toHaveLength(0);
  });

  it('manda la frase como texto y lo escrito como fragmento, y el cierre invita a mirar y compartir', async () => {
    montar();
    await hastaLaLinea();
    fireEvent.click(await screen.findByRole('button', { name: 'Salud' }));
    await elegirProvincia();
    pulsar('Seguir');
    await screen.findByRole('heading', { name: 'Así lo van a ver' });
    await screen.findByText(/Tu aporte va a entrar en la campaña nacional/);
    expect(screen.getByText('Alguien de Salta imagina')).toBeInTheDocument();
    elegirYAceptar('libre');
    pulsar('Publicar mi aporte');
    expect(
      await screen.findByRole('heading', { name: 'Tu aporte quedó publicado.' }),
    ).toBeInTheDocument();

    const [cuerpo] = enviados();
    expect(cuerpo?.senal).toMatchObject({
      contrato: CONTRATO_SENAL,
      tipo: 'sueño',
      casa: 'sinRespuesta',
      texto: LINEA,
      cedeLicencia: true,
      tema: 'salud',
      sinTema: false,
      provinceId: 66,
    });
    expect(cuerpo?.fragmentos).toEqual([
      { pregunta: PREGUNTA_MI_ARGENTINA_IDEAL, respuesta: ESCRITO },
    ]);
    expect(cuerpo).toMatchObject({ campanaId: NACIONAL.id, edicion: 1, cuentaEsperada: null });

    expect(screen.getByRole('button', { name: 'Compartir mi aporte' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ahora mirá lo que imaginan otros →' }),
    ).toHaveAttribute('href', '/mi-argentina-ideal/mirar?desde=imaginar');
    expect(screen.getByText('Tu recibo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver y gestionar mi aporte' })).toHaveAttribute(
      'href',
      `/senal/${RECIBO.idPublico}`,
    );
    expect(m.borrar).toHaveBeenCalled();
  });

  it('con el texto reservado no ofrece compartir y dice que no entra a Mirar', async () => {
    montar();
    await hastaPublicar();
    elegirYAceptar('reservado');
    pulsar('Publicar mi aporte');
    await screen.findByRole('heading', { name: 'Tu aporte quedó publicado.' });
    expect(enviados()[0]?.senal.cedeLicencia).toBe(false);
    expect(screen.queryByRole('button', { name: 'Compartir mi aporte' })).toBeNull();
    expect(screen.getByText(/así que no entra a Mirar/)).toBeInTheDocument();
  });

  it('sin campaña abierta, el cierre no dice que cuenta en una campaña', async () => {
    m.get.mockImplementation((ruta: string) => {
      if (ruta.startsWith('/api/v1/campanas/mi-argentina-ideal'))
        return Promise.reject(new ApiError(404, 'CAMPANA_NO_ENCONTRADA', 'Todavía no está.'));
      if (ruta === '/api/v1/contribuciones/contexto')
        return Promise.resolve({ csrfToken: 'token-de-prueba', temas: TEMAS, proveedor: null });
      if (ruta === '/api/open-data/provinces') return Promise.resolve({ provinces: PROVINCIAS });
      return Promise.reject(new ApiError(404, 'NO_ENCONTRADO', 'No está.'));
    });
    m.publicar = () => Promise.resolve({ ...RECIBO, contexto: null });
    montar();
    await hastaLaLinea();
    await elegirProvincia();
    pulsar('Seguir');
    await screen.findByRole('heading', { name: 'Así lo van a ver' });
    await screen.findByText(/Por ahora no hay una campaña abierta/);
    fireEvent.click(screen.getByLabelText(/el texto quede reservado/));
    fireEvent.click(screen.getByLabelText(/Publicá mi aporte/));
    pulsar('Publicar mi aporte');
    await screen.findByRole('heading', { name: 'Tu aporte quedó publicado.' });
    expect(screen.queryByText(/Cuenta en la campaña/)).toBeNull();
    expect(screen.getByText(/Quedó publicado con el texto reservado/)).toBeInTheDocument();
  });

  it('desde Mirar, el cierre dice «Seguir mirando» y vuelve ahí', async () => {
    montar('/mi-argentina-ideal/imaginar?volver=mirar');
    await hastaPublicar();
    elegirYAceptar();
    pulsar('Publicar mi aporte');
    expect(await screen.findByRole('link', { name: 'Seguir mirando →' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal/mirar',
    );
  });

  it('un 409 de la campaña conserva lo escrito, y el reintento conserva el identificador', async () => {
    m.publicar = () =>
      Promise.reject(
        new ApiError(
          409,
          'CAMPANA_CAMBIADA',
          'La campaña cambió. Tu borrador sigue con vos; revisá la edición antes de compartir.',
        ),
      );
    montar();
    await hastaPublicar();
    elegirYAceptar();
    pulsar('Publicar mi aporte');
    expect(await screen.findByRole('alert')).toHaveTextContent('La campaña cambió');
    expect(screen.getByText(`«${LINEA}»`)).toBeInTheDocument();

    m.publicar = () => Promise.reject(new TypeError('Failed to fetch'));
    pulsar('Publicar mi aporte');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Tu texto sigue acá');
    });
    const [primero, segundo] = enviados();
    expect(segundo?.senal.idLocal).toBe(primero?.senal.idLocal);

    pulsar('← Volver a tu aporte');
    expect(campoLinea().value).toBe(LINEA);
    pulsar('← Volver a lo que escribí');
    expect(campoTexto().value).toBe(ESCRITO);
  });

  it('con otra cuenta o un envío distinto, el próximo intento es un envío nuevo', async () => {
    m.publicar = () =>
      Promise.reject(
        new ApiError(409, 'ENVIO_DISTINTO', 'Ese identificador ya tiene otro aporte.'),
      );
    montar();
    await hastaPublicar();
    elegirYAceptar();
    pulsar('Publicar mi aporte');
    expect(await screen.findByRole('alert')).toHaveTextContent('como un envío nuevo');
    m.publicar = undefined;
    pulsar('Publicar mi aporte');
    await screen.findByRole('heading', { name: 'Tu aporte quedó publicado.' });
    const [primero, segundo] = enviados();
    expect(segundo?.senal.idLocal).not.toBe(primero?.senal.idLocal);
  });

  it('si el servidor encuentra un dato personal, lo dice y ofrece volver sin perder nada', async () => {
    m.publicar = () =>
      Promise.reject(
        new ApiError(
          422,
          'DATOS_PERSONALES',
          'Tu aporte tiene lo que parece un mail. Sacalo antes de publicar: el aporte se ve en público.',
          { hallazgos: [{ tipo: 'mail' }] },
        ),
      );
    montar();
    await hastaPublicar();
    elegirYAceptar();
    pulsar('Publicar mi aporte');
    expect(await screen.findByRole('alert')).toHaveTextContent('parece un mail');
    pulsar('Volver a tu aporte para sacarlo');
    expect(campoLinea().value).toBe(LINEA);
  });
});

describe('armarAporteIdeal', () => {
  const base = {
    idLocal: '7d0b1a52-7c0f-4f4e-9d61-3c1a2b4d5e6f',
    cedeLicencia: true,
    tema: null,
    provinciaId: null,
    cuentaEsperada: null,
    destino: null,
  };
  it('si lo escrito es la misma frase, no la repite como fragmento', () => {
    const a = armarAporteIdeal({ ...base, linea: 'Que haya tren.', texto: '  Que   haya tren. ' });
    expect(a.fragmentos).toEqual([]);
    expect(a.senal).toMatchObject({ texto: 'Que haya tren.', sinTema: true, tema: null });
    expect(a.senal).not.toHaveProperty('provinceId');
    expect(a).toMatchObject({ campanaId: null, edicion: null });
  });
  it('con otra pregunta, el fragmento la nombra', () => {
    const a = armarAporteIdeal({
      ...base,
      linea: 'Que haya tren.',
      texto: 'Que haya tren. Y colectivo.',
      pregunta: '¿Cómo te movés?',
    });
    expect(a.fragmentos).toEqual([
      { pregunta: '¿Cómo te movés?', respuesta: 'Que haya tren. Y colectivo.' },
    ]);
  });
});
