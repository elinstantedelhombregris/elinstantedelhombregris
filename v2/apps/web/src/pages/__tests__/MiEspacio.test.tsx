import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MiEspacio } from '../MiEspacio';

import type { AportePropio, EspacioPersonal } from '@v2/shared';

const m = vi.hoisted(() => ({
  user: null as null | {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    esAdmin: boolean;
  },
  cargando: false,
  espacio: undefined as EspacioPersonal | undefined,
  recuperables: [] as { id: string; texto: string; tipo: string; fecha: string }[],
  borradores: vi.fn(() => Promise.resolve([] as unknown[])),
  escribir: vi.fn(() => Promise.resolve({})),
}));

vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({
    user: m.user,
    isLoading: m.cargando,
    logout: { mutate: vi.fn() },
  }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useMiEspacio: () => ({ data: m.espacio, isLoading: false, error: null }),
  useOperacionPersonal: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  escribir: m.escribir,
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: (ruta: string) => {
      if (ruta.endsWith('/recuperables')) return Promise.resolve(m.recuperables);
      if (ruta.endsWith('/avisos')) return Promise.resolve([]);
      if (ruta.endsWith('/preferencias')) return Promise.resolve({ avisos: true });
      return Promise.resolve({});
    },
  },
}));
vi.mock('~/lib/participacion/borradores', () => ({
  leerBorradores: m.borradores,
  borrarBorrador: vi.fn(),
}));

const sesion = (extra: Partial<NonNullable<typeof m.user>> = {}) => ({
  id: 1,
  name: 'Ana',
  email: 'ana@example.com',
  emailVerified: true,
  esAdmin: false,
  ...extra,
});

const aporte = (extra: Partial<AportePropio> = {}): AportePropio => ({
  id: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  texto: 'Quiero una huerta en cada escuela.',
  tipo: 'sueño',
  estado: 'por_verificar',
  tema: null,
  creadaEn: '2026-10-05T15:00:00.000Z',
  revision: '2026-10-05T15:00:00.000Z',
  cedeLicencia: true,
  precision: 'neighborhood',
  campanaId: null,
  campanaTitulo: null,
  edicion: null,
  ...extra,
});

const vacio: EspacioPersonal = {
  aportes: [],
  totalAportes: 0,
  procesos: [],
  seguimientos: [],
  analisis: [],
};

function montar(ruta = '/mi-espacio') {
  window.history.replaceState(null, '', ruta);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MiEspacio />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  m.user = null;
  m.cargando = false;
  m.espacio = vacio;
  m.recuperables = [];
  m.borradores.mockResolvedValue([]);
  m.escribir.mockClear();
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Mi espacio — el encabezado', () => {
  it('el H1 nombra la página y la entrada dice qué se encuentra acá', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1, name: 'Mi espacio' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Acá volvés a lo que publicaste, a lo que seguís y a lo que dejaste a medias.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Tu parte del país que imaginamos/)).not.toBeInTheDocument();
  });

  it('mientras se sabe si hay sesión no muestra ni la invitación ni las pestañas', () => {
    m.cargando = true;
    montar();
    expect(screen.getByText('Abriendo tu espacio…')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText(/Creá tu cuenta/)).not.toBeInTheDocument();
  });
});

describe('Mi espacio — sin cuenta', () => {
  it('no hay pestañas: una invitación a crear la cuenta con retorno a Mi espacio', () => {
    montar();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Creá tu cuenta para no perder tus aportes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear mi cuenta' })).toHaveAttribute(
      'href',
      '/registrarse?volver=%2Fmi-espacio',
    );
    expect(screen.getByRole('link', { name: 'Ya tengo cuenta: ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fmi-espacio',
    );
    expect(screen.getByText(/Para imaginar no hace falta, y tu nombre no se publica/)).toBeInTheDocument();
  });

  it('muestra los borradores guardados en este dispositivo y deja retomarlos', async () => {
    m.borradores.mockResolvedValue([
      {
        id: '3f1c9a3e-8a70-4d16-a2a6-6a3f4a1f5b11',
        fecha: '2026-10-05T15:00:00.000Z',
        frases: ['Una plaza con sombra', '', ''],
        campanaId: null,
      },
    ]);
    montar();
    expect(await screen.findByText('Una plaza con sombra')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Mis borradores' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Retomar' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=aportar&borrador=3f1c9a3e-8a70-4d16-a2a6-6a3f4a1f5b11#instrumento',
    );
  });

  it('sin borradores ofrece imaginar, en vez de un vacío sin salida', async () => {
    montar();
    expect(
      await screen.findByText(/No hay borradores guardados en este navegador/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=aportar#instrumento',
    );
  });
});

describe('Mi espacio — con cuenta, las pestañas', () => {
  beforeEach(() => {
    m.user = sesion();
  });

  it('son un tablist de seis, la primera activa y un panel atado a ella', () => {
    montar();
    const lista = screen.getByRole('tablist', { name: 'Secciones de Mi espacio' });
    const pestanas = within(lista).getAllByRole('tab');
    expect(pestanas.map((p) => p.textContent)).toEqual([
      'Mis aportes',
      'Lo que sigo',
      'Mis borradores',
      'Mis análisis',
      'Avisos',
      'Cuenta y datos',
    ]);
    expect(pestanas[0]).toHaveAttribute('aria-selected', 'true');
    expect(pestanas[0]).toHaveAttribute('tabindex', '0');
    expect(pestanas[1]).toHaveAttribute('aria-selected', 'false');
    expect(pestanas[1]).toHaveAttribute('tabindex', '-1');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', pestanas[0]?.id);
    expect(pestanas[0]).toHaveAttribute('aria-controls', panel.id);
  });

  it.each([
    ['aportes', 'Mis aportes'],
    ['sigo', 'Lo que sigo'],
    ['borradores', 'Mis borradores'],
    ['analisis', 'Mis análisis'],
    ['avisos', 'Avisos'],
    ['cuenta', 'Cuenta y datos'],
  ])('?pestana=%s abre el panel cuyo H2 es «%s»', async (clave, nombre) => {
    montar(`/mi-espacio?pestana=${clave}`);
    expect(await screen.findByRole('heading', { level: 2, name: nombre })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: nombre })).toHaveAttribute('aria-selected', 'true');
  });

  it('una pestaña desconocida cae en la primera', () => {
    montar('/mi-espacio?pestana=inventada');
    expect(screen.getByRole('tab', { name: 'Mis aportes' })).toHaveAttribute('aria-selected', 'true');
  });

  it('elegir una pestaña la escribe en la dirección, y las flechas se mueven entre ellas', async () => {
    montar();
    fireEvent.click(screen.getByRole('tab', { name: 'Lo que sigo' }));
    await waitFor(() => {
      expect(window.location.search).toBe('?pestana=sigo');
    });
    expect(screen.getByRole('tab', { name: 'Lo que sigo' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Lo que sigo' }), { key: 'ArrowRight' });
    await waitFor(() => {
      expect(window.location.search).toBe('?pestana=borradores');
    });
    expect(screen.getByRole('tab', { name: 'Mis borradores' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Mis borradores' }), { key: 'End' });
    await waitFor(() => {
      expect(window.location.search).toBe('?pestana=cuenta');
    });
  });
});

describe('Mi espacio — Mis aportes', () => {
  beforeEach(() => {
    m.user = sesion();
  });

  it('sin aportes lo dice una vez, con el botón de imaginar, y esconde lo avanzado', () => {
    montar();
    expect(screen.getByText('Todavía no publicaste nada desde esta cuenta.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=aportar#instrumento',
    );
    expect(screen.queryByRole('link', { name: 'Armar una ficha nueva' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gestionar mis campañas' })).not.toBeInTheDocument();
    expect(screen.queryByText(/procesos a tu cargo/)).not.toBeInTheDocument();
  });

  it('con un aporte aparece «Armar una ficha nueva», y «Gestionar mis campañas» solo es de quien administra', () => {
    m.espacio = { ...vacio, aportes: [aporte()], totalAportes: 1 };
    const comun = montar();
    expect(screen.getByRole('link', { name: 'Armar una ficha nueva' })).toHaveAttribute(
      'href',
      '/fichas/nueva',
    );
    expect(screen.queryByRole('link', { name: 'Gestionar mis campañas' })).not.toBeInTheDocument();
    comun.unmount();

    m.user = sesion({ esAdmin: true });
    montar();
    expect(screen.getByRole('link', { name: 'Gestionar mis campañas' })).toHaveAttribute(
      'href',
      '/gestion/campanas',
    );
  });

  it('cada aporte muestra tipo, estado y precisión en castellano, nunca el valor crudo', () => {
    m.espacio = { ...vacio, aportes: [aporte()], totalAportes: 1 };
    const { container } = montar();
    expect(container).toHaveTextContent(/sueño · Pide otra mirada · /);
    expect(container).toHaveTextContent('Ubicación publicada: en su barrio.');
    expect(container).toHaveTextContent('Cualquiera puede leer y compartir este texto (licencia CC BY 4.0).');
    expect(container.textContent).not.toMatch(/neighborhood|por_verificar|por verificar|jerga/);
  });

  it('un estado o un tipo que no están en el canon no se muestran crudos', () => {
    m.espacio = {
      ...vacio,
      aportes: [aporte({ tipo: 'bastta', estado: 'en_cuarentena', precision: 'inventada' })],
      totalAportes: 1,
    };
    const { container } = montar();
    expect(container.textContent).not.toMatch(/bastta|en_cuarentena|en cuarentena|inventada/);
    expect(container).toHaveTextContent('sin clasificar · estado sin clasificar');
    expect(container).toHaveTextContent('Ubicación publicada: a nivel provincia.');
  });

  it('usa el editor único: «Corregir mi aporte», sin un segundo editor inline', () => {
    m.espacio = { ...vacio, aportes: [aporte()], totalAportes: 1 };
    montar();
    expect(screen.getByRole('button', { name: 'Corregir mi aporte' })).toBeInTheDocument();
    expect(screen.queryByText(/Corregir mis palabras|Cedo este texto según el contrato/)).not.toBeInTheDocument();
  });

  it('«Recuperar» sube a la cabeza de la pestaña cuando hay algo para recuperar', async () => {
    m.recuperables = [
      { id: 'a1', texto: 'Escribí esto sin cuenta', tipo: 'sueño', fecha: '2026-10-01T00:00:00Z' },
    ];
    m.espacio = { ...vacio, aportes: [aporte()], totalAportes: 1 };
    montar();

    const recuperar = await screen.findByRole('heading', {
      name: 'Aportes de este navegador para sumar a tu cuenta',
    });
    const mios = screen.getByRole('heading', { level: 2, name: 'Mis aportes' });
    expect(recuperar.compareDocumentPosition(mios) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sumar a mi cuenta' })).toBeDisabled();
  });

  it('sin nada para recuperar no ocupa lugar', async () => {
    m.espacio = { ...vacio, aportes: [aporte()], totalAportes: 1 };
    montar();
    await screen.findByRole('heading', { level: 2, name: 'Mis aportes' });
    expect(
      screen.queryByRole('heading', { name: /sumar a tu cuenta/ }),
    ).not.toBeInTheDocument();
  });
});

describe('Mi espacio — Cuenta y datos', () => {
  it('con el correo sin verificar ofrece reenviarlo', async () => {
    m.user = sesion({ emailVerified: false });
    montar('/mi-espacio?pestana=cuenta');

    expect(screen.getByText(/ana@example.com · pendiente de verificar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar correo' }));

    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith('post', '/api/auth/email/send-verification', {
        email: 'ana@example.com',
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Te mandamos un enlace a ana@example.com');
  });

  it('un error del servidor al reenviar se dice tal cual y se puede reintentar', async () => {
    m.user = sesion({ emailVerified: false });
    m.escribir.mockRejectedValueOnce(new Error('Demasiados pedidos. Probá más tarde.'));
    montar('/mi-espacio?pestana=cuenta');

    fireEvent.click(screen.getByRole('button', { name: 'Reenviar correo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados pedidos. Probá más tarde.');
    expect(screen.getByRole('button', { name: 'Reenviar correo' })).toBeEnabled();
  });

  it('con el correo verificado no hay nada que reenviar', () => {
    m.user = sesion({ emailVerified: true });
    montar('/mi-espacio?pestana=cuenta');

    expect(screen.getByText(/ana@example.com · verificado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reenviar correo' })).not.toBeInTheDocument();
  });

  it('no usa la jerga que había: corte, eludir, contrato del registro, credencial, identificador', () => {
    m.user = sesion();
    const { container } = montar('/mi-espacio?pestana=cuenta');
    expect(container.textContent).not.toMatch(
      /corte|eludir|contrato del registro|credencial|identificador/i,
    );
  });
});
