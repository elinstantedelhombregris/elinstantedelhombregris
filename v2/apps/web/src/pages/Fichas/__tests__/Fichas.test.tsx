import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Fichas } from '../../Fichas';

import { requerido } from './ayudas';

import type { FichaFuturo } from '@v2/shared';
import type { FichaDeLista } from '~/lib/queries/fichas';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const CAMPANA = '3718dc73-9774-4d3b-b23d-8bf290ffec30';
const ID = '99999999-9999-4999-8999-999999999999';

interface Modelo {
  user: null | { id: number };
  lista: { fichas: FichaDeLista[]; total: number };
  ficha: FichaFuturo | undefined;
  useFichas: ReturnType<typeof vi.fn>;
  mutate: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn<(url: string) => Promise<unknown>>>;
}
const modelo = vi.hoisted(
  (): Modelo => ({
    user: null,
    lista: { fichas: [], total: 0 },
    ficha: undefined,
    useFichas: vi.fn(),
    mutate: vi.fn(),
    get: vi.fn<(url: string) => Promise<unknown>>(),
  }),
);
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({
    user: modelo.user,
    isLoading: false,
    isAuthenticated: Boolean(modelo.user),
  }),
}));
vi.mock('~/lib/queries/fichas', () => ({
  useFichas: (...argumentos: unknown[]) => {
    modelo.useFichas(...argumentos);
    return { data: modelo.lista, isLoading: false, isError: false, refetch: vi.fn() };
  },
  useFicha: () => ({ data: modelo.ficha, isLoading: false, isError: false, refetch: vi.fn() }),
  useGuardarFicha: () => ({ isPending: false, isError: false, error: null, mutate: modelo.mutate }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useCampana: () => ({ data: { contrato: { titulo: 'Aprender cerca de casa' } } }),
}));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));
vi.mock('../deliberacion/Deliberacion', () => ({ Deliberacion: () => <p>Conversación</p> }));
vi.mock('../deliberacion/Relaciones', () => ({ Relaciones: () => <p>Relaciones</p> }));
vi.mock('../ResultadosCampo', () => ({ ResultadosCampo: () => <p>Resultados de campo</p> }));
vi.mock('../PanelDiseno', () => ({ PanelDiseno: () => <p>Panel de diseño</p> }));
vi.mock('~/components/participacion/Seguir', () => ({ Seguir: () => <p>Seguir</p> }));
vi.mock('~/components/participacion/Equipo', () => ({ Equipo: () => <p>Equipo</p> }));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => null,
}));

const LEAD =
  'Una ficha es una propuesta para discutir, no un acuerdo ni una decisión. La puede leer cualquiera; la edita quien la creó y su equipo.';
const ficha: FichaFuturo = {
  id: ID,
  revision: 3,
  contenido: {
    titulo: '¿Cómo sería aprender cerca de casa?',
    territorioId: 13,
    temas: ['educacion'],
    situacion: 'Hoy hay que viajar una hora.',
    futuro: 'Una escuela a pie.',
    proximaTarea: '',
    campanaId: CAMPANA,
    condiciones: ['Transporte seguro'],
    vinculos: [],
  },
  creadaEn: '2026-10-01T12:00:00.000Z',
  actualizadaEn: '2026-10-15T12:00:00.000Z',
  territorioNombre: 'Mendoza',
  puedoEditar: true,
  historial: [
    { revision: 3, fecha: '2026-10-15T12:00:00.000Z', campos: ['vinculos', 'proximaTarea'] },
    { revision: 2, fecha: '2026-10-10T12:00:00.000Z', campos: [] },
    { revision: 1, fecha: '2026-10-01T12:00:00.000Z', campos: ['creación'] },
  ],
  aportes: [
    {
      senalId: A,
      relacion: 'describe',
      disponible: true,
      texto: 'Hay que viajar una hora.',
      estado: 'por_verificar',
    },
    { senalId: B, relacion: 'inspira', disponible: false, texto: null, estado: null },
  ],
};
const tarjeta = (n: number, extra: Partial<FichaDeLista> = {}): FichaDeLista => ({
  id: `00000000-0000-4000-8000-00000000000${n}`,
  titulo: `Ficha número ${n}`,
  revision: 3,
  territorioId: null,
  territorioNombre: null,
  actualizadaEn: '2026-10-15T12:00:00.000Z',
  extracto: '',
  temas: [],
  afirmaciones: 0,
  ...extra,
});

function ir(ruta: string) {
  window.history.replaceState(null, '', ruta);
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Fichas />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
  modelo.lista = { fichas: [], total: 0 };
  modelo.ficha = ficha;
  modelo.get.mockImplementation((url: string) => {
    if (url.includes('/geo/lugares/'))
      return Promise.resolve({ id: 13, name: 'Mendoza', level: 'province', provinceId: 13 });
    if (url.includes('/contribuciones/contexto'))
      return Promise.resolve({ temas: [{ clave: 'educacion', etiqueta: 'Educación' }] });
    if (url.includes('/exportaciones/publica'))
      return Promise.resolve({ registros: [], siguiente: null, total: 0 });
    return Promise.resolve({});
  });
});

describe('Fichas: la lista', () => {
  it('usa la plantilla de Campañas: eyebrow, título grande y el lead, sin migas repetidas', () => {
    ir('/fichas');
    expect(screen.getByRole('heading', { level: 1, name: 'Fichas' })).toBeInTheDocument();
    expect(screen.getByText('La ciudadanía diseña · Fichas')).toBeInTheDocument();
    expect(screen.getByText(LEAD)).toBeInTheDocument();
    expect(screen.queryByText('Volver al mapa')).toBeNull();
    expect(screen.queryByRole('link', { name: /Todas las fichas/ })).toBeNull();
    expect(screen.queryByText(/entre vecinos|No habla por todo el barrio/)).toBeNull();
  });

  it('sin fichas dice que no hay y ofrece crear la primera, sin ceros ni «últimas»', () => {
    ir('/fichas');
    expect(screen.getByText('Todavía no hay fichas acá. Podés crear la primera.')).toBeVisible();
    expect(screen.queryByText(/últimas fichas|\b0\b/)).toBeNull();
  });

  it('cuenta con el plural correcto', () => {
    modelo.lista = { fichas: [tarjeta(1)], total: 1 };
    const { unmount } = ir('/fichas');
    expect(screen.getByText('Hay 1 ficha.')).toBeInTheDocument();
    unmount();
    modelo.lista = { fichas: [tarjeta(1), tarjeta(2)], total: 2 };
    const otra = ir('/fichas');
    expect(screen.getByText('Hay 2 fichas.')).toBeInTheDocument();
    otra.unmount();
    modelo.lista = { fichas: [tarjeta(1), tarjeta(2)], total: 7 };
    ir('/fichas');
    expect(screen.getByText('Mostramos las 2 fichas más recientes, de 7.')).toBeInTheDocument();
  });

  it('cada tarjeta dice lugar, versión y fecha en castellano, sin «Borrador»', () => {
    modelo.lista = {
      fichas: [tarjeta(1), tarjeta(2, { territorioNombre: 'Mendoza' })],
      total: 2,
    };
    ir('/fichas');
    const [primera, segunda] = screen.getAllByRole('listitem');
    expect(primera).toHaveTextContent(
      /^Ficha número 1Todo el país · versión 3 · actualizada el \d+ de octubre de 2026$/,
    );
    expect(segunda).toHaveTextContent(
      /Mendoza · versión 3 · actualizada el \d+ de octubre de 2026$/,
    );
    expect(within(requerido(primera)).getByRole('link')).toHaveAttribute(
      'href',
      '/fichas/00000000-0000-4000-8000-000000000001',
    );
    expect(screen.queryByText(/Borrador|Ficha abierta/)).toBeNull();
  });

  it('la tarjeta muestra el extracto del futuro, los temas con su etiqueta y cuántas afirmaciones tiene', async () => {
    modelo.lista = {
      fichas: [
        tarjeta(1, {
          territorioNombre: 'Mendoza',
          extracto: 'Aprendemos cerca de casa y compartimos saberes…',
          temas: ['educacion', 'Salud mental'],
          afirmaciones: 2,
        }),
      ],
      total: 1,
    };
    ir('/fichas');
    const tarjetaUno = requerido(screen.getAllByRole('listitem')[0]);
    expect(
      within(tarjetaUno).getByText('Aprendemos cerca de casa y compartimos saberes…'),
    ).toBeVisible();
    expect(await within(tarjetaUno).findByText('Educación')).toBeInTheDocument();
    // La clave se traduce al nombre; un tema escrito a mano en una ficha vieja entra tal cual.
    expect(within(tarjetaUno).queryByText('educacion')).toBeNull();
    expect(within(tarjetaUno).getByText('Salud mental')).toBeInTheDocument();
    expect(
      within(tarjetaUno).getByText(/^Mendoza · versión 3 · actualizada el /),
    ).toHaveTextContent(
      /Mendoza · versión 3 · actualizada el \d+ de octubre de 2026 · 2 afirmaciones$/,
    );
  });

  it('una sola afirmación va en singular; sin afirmaciones, sin extracto y sin temas, la tarjeta no inventa nada', () => {
    modelo.lista = {
      fichas: [tarjeta(1, { afirmaciones: 1 }), tarjeta(2)],
      total: 2,
    };
    ir('/fichas');
    const tarjetas = screen.getAllByRole('listitem');
    const con = requerido(tarjetas[0]);
    const sin = requerido(tarjetas[1]);
    expect(con).toHaveTextContent(/ · 1 afirmación$/);
    expect(sin).not.toHaveTextContent(/afirmaci/);
    expect(sin).not.toHaveTextContent(/\b0\b/);
    expect(within(sin).queryByText('Temas:')).toBeNull();
    expect(sin.querySelectorAll('p')).toHaveLength(1);
  });

  it('el filtro activo se ve como una etiqueta que se quita, y se conserva el otro filtro', () => {
    ir(`/fichas?lugar=13&nombre=Mendoza&campana=${CAMPANA}`);
    expect(modelo.useFichas).toHaveBeenCalledWith(13, CAMPANA);
    const lugar = screen.getByRole('button', { name: 'Quitar el filtro: Mendoza' });
    expect(lugar).toHaveTextContent('Mendoza ×');
    expect(
      screen.getByRole('button', { name: 'Quitar el filtro: Campaña: Aprender cerca de casa' }),
    ).toBeInTheDocument();
    fireEvent.click(lugar);
    expect(window.location.pathname).toBe('/fichas');
    expect(window.location.search).toBe(`?campana=${CAMPANA}`);
  });

  it('el nombre del lugar sale del catálogo cuando el enlace no lo trae', async () => {
    ir('/fichas?lugar=13');
    expect(
      await screen.findByRole('button', { name: 'Quitar el filtro: Mendoza' }),
    ).toBeInTheDocument();
  });

  it('una campaña que no es un id no filtra la lista', () => {
    ir('/fichas?campana=mi-argentina-ideal');
    expect(modelo.useFichas).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.queryByRole('button', { name: /Quitar el filtro/ })).toBeNull();
  });

  it('crear una ficha conserva el lugar y la campaña del enlace', () => {
    ir('/fichas?lugar=13&nombre=Mendoza');
    expect(screen.getByRole('link', { name: 'Crear una ficha' })).toHaveAttribute(
      'href',
      '/fichas/nueva?lugar=13&nombre=Mendoza',
    );
  });
});

describe('Fichas: crear una ficha', () => {
  it('sin cuenta, el ingreso devuelve a esta misma página con su lugar', () => {
    ir('/fichas/nueva?lugar=7000');
    expect(screen.getByRole('heading', { level: 1, name: 'Crear una ficha' })).toBeInTheDocument();
    expect(screen.getByText(LEAD)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Ffichas%2Fnueva%3Flugar%3D7000',
    );
    expect(screen.getAllByRole('link', { name: /Todas las fichas/ })).toHaveLength(1);
  });

  it('con cuenta, el lugar se muestra por su nombre y nunca por su número', async () => {
    modelo.user = { id: 1 };
    ir('/fichas/nueva?lugar=7000');
    expect(await screen.findByText('Lugar: Mendoza.')).toBeInTheDocument();
    expect(screen.queryByText(/Lugar 7000|7000/)).toBeNull();
  });

  it('un aporte del enlace entra vinculado como «Inspira el futuro deseado»', () => {
    modelo.user = { id: 1 };
    ir(`/fichas/nueva?senal=${A}`);
    expect(screen.getByText('Quitar vínculo 1')).toBeInTheDocument();
    expect(screen.getAllByText('Inspira el futuro deseado').some((n) => n.tagName === 'P')).toBe(
      true,
    );
  });
});

describe('Fichas: una ficha abierta', () => {
  it('lleva la plantilla de la campaña: eyebrow con la versión, título grande, una sola miga', () => {
    ir(`/fichas/${ID}`);
    expect(screen.getByText('Ficha abierta · versión 3')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: '¿Cómo sería aprender cerca de casa?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(LEAD)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Todas las fichas/ })).toHaveLength(1);
    expect(screen.queryByText(/En revisión (visible para cualquiera)|Volver al mapa/)).toBeNull();
  });

  it('muestra lugar, temas con su etiqueta y la fecha en castellano', async () => {
    ir(`/fichas/${ID}`);
    expect(await screen.findByText(/Temas: Educación/)).toHaveTextContent(
      /Mendoza · Temas: Educación · Actualizada el \d+ de octubre de 2026/,
    );
  });

  it('los aportes se leen con su relación y su estado en castellano', () => {
    ir(`/fichas/${ID}`);
    const lista = requerido(screen.getByText('Hay que viajar una hora.').closest('li'));
    expect(lista).toHaveTextContent('Describe la situación · Pide otra mirada');
    expect(lista).not.toHaveTextContent(/describe|por_verificar/);
    const retirado = requerido(screen.getByText(/dejó de estar disponible/).closest('li'));
    expect(retirado).toHaveTextContent('Inspira el futuro deseado · No disponible');
  });

  it('un aporte con el texto reservado se lee como reservado, no en blanco', () => {
    modelo.ficha = {
      ...ficha,
      aportes: [
        { senalId: A, relacion: 'capacidad', disponible: true, texto: null, estado: 'enviada' },
      ],
    };
    ir(`/fichas/${ID}`);
    const fila = requerido(screen.getByText('Texto reservado por su autor.').closest('li'));
    expect(fila).toHaveTextContent('Aporta una capacidad · Recibida');
  });

  it('el historial nombra los campos que cambiaron y las fechas en castellano', () => {
    ir(`/fichas/${ID}`);
    const historial = requerido(
      screen.getByRole('heading', { name: 'Historial de versiones' }).parentElement,
    );
    expect(historial).toHaveTextContent(
      /Versión 3 · \d+ de octubre de 2026 · Cambió: vínculos y próxima tarea\./,
    );
    expect(historial).toHaveTextContent('Sin cambios en el contenido.');
    expect(historial).toHaveTextContent('Se creó la ficha.');
    expect(historial).not.toHaveTextContent(/vinculos|proximaTarea|creación,/);
    expect(historial).not.toHaveTextContent(/T12:00|2026-10/);
  });

  it('con campaña y lugar, ofrece ver lo escuchado por cada uno en la Radiografía, e Imaginar con esa campaña', () => {
    ir(`/fichas/${ID}`);
    expect(
      screen.getByRole('link', { name: 'Ver en la Radiografía lo escuchado en esta campaña' }),
    ).toHaveAttribute('href', `/la-radiografia?campana=${CAMPANA}`);
    expect(
      screen.getByRole('link', { name: 'Ver en la Radiografía lo escuchado en Mendoza' }),
    ).toHaveAttribute('href', '/la-radiografia?territorio=13');
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      `/mi-argentina-ideal/imaginar?campana=${CAMPANA}`,
    );
  });

  it('sin campaña pero con lugar, la Radiografía se filtra por lugar y no se ofrece Imaginar', () => {
    modelo.ficha = { ...ficha, contenido: { ...ficha.contenido, campanaId: null } };
    ir(`/fichas/${ID}`);
    expect(
      screen.getByRole('link', { name: 'Ver en la Radiografía lo escuchado en Mendoza' }),
    ).toHaveAttribute('href', '/la-radiografia?territorio=13');
    expect(screen.queryByRole('link', { name: 'Imaginar mi Argentina' })).toBeNull();
  });

  it('una ficha de todo el país y sin campaña no inventa un filtro engañoso', () => {
    modelo.ficha = {
      ...ficha,
      territorioNombre: null,
      contenido: { ...ficha.contenido, campanaId: null, territorioId: null },
    };
    ir(`/fichas/${ID}`);
    expect(screen.queryByRole('link', { name: /Radiografía/ })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Imaginar mi Argentina' })).toBeNull();
  });

  it('quien puede editar abre el formulario con la plantilla de edición y vuelve a la ficha', () => {
    ir(`/fichas/${ID}`);
    fireEvent.click(screen.getByRole('button', { name: 'Editar esta ficha' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Editar la ficha' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Pregunta o título/)).toHaveValue(
      '¿Cómo sería aprender cerca de casa?',
    );
    expect(screen.getByRole('button', { name: 'Guardar versión 4' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ficha' }));
    expect(screen.getByText('Ficha abierta · versión 3')).toBeInTheDocument();
  });

  it('quien no puede editar no ve el botón', () => {
    modelo.ficha = { ...ficha, puedoEditar: false };
    ir(`/fichas/${ID}`);
    expect(screen.queryByRole('button', { name: 'Editar esta ficha' })).toBeNull();
  });
});
