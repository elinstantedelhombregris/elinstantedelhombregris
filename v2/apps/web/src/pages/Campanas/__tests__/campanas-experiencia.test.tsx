import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { CampanaDetail } from '../../CampanaDetail';
import { Campanas } from '../../Campanas';
import { FiltrosCatalogo } from '../FiltrosCatalogo';
import { SLUG_DEMO_CAMPANA } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

import { aportarHref } from '~/lib/participacion/aportar';

const modelo = vi.hoisted(() => ({
  lista: [] as CampanaPublica[],
  detalle: null as CampanaPublica | null,
  user: null as { id: number; esAdmin: boolean } | null,
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({ data: modelo.lista, isLoading: false, isError: false, error: null }),
  useCampana: () => ({ data: modelo.detalle, isLoading: false, isError: false, error: null }),
  useEstadoCampana: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  escribir: vi.fn(),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      id: 13,
      name: 'Mendoza',
      level: 'province',
      provinceId: 13,
      latitude: null,
      longitude: null,
    }),
  },
}));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: () => ({ data: [{ id: 13, name: 'Mendoza' }] }),
}));
vi.mock('~/components/participacion/Seguir', () => ({
  Seguir: () => <button type="button">Seguir</button>,
}));
vi.mock('~/components/participacion/Equipo', () => ({ Equipo: () => <div>Equipo</div> }));
vi.mock('~/components/participacion/CompartirProceso', () => ({
  CompartirProceso: ({ href, titulo }: { href: string; titulo: string }) => (
    <a href={href}>{titulo}</a>
  ),
}));
function campana(cambios: Partial<CampanaPublica> = {}): CampanaPublica {
  return {
    id: '3718dc73-9774-4d3b-b23d-8bf290ffec30',
    slug: 'pregunta-de-la-comunidad',
    revision: 2,
    estado: 'abierta',
    creadaEn: '2026-10-08T00:00:00.000Z',
    actualizadaEn: '2026-10-08T00:00:00.000Z',
    puedoEditar: false,
    puedoInvitar: false,
    puedoEditarContrato: false,
    aportes: 0,
    devoluciones: [],
    historial: [],
    contrato: {
      titulo: 'Aprender cerca de quienes queremos',
      pregunta: '¿Qué sería posible al aprender sin perder nuestros vínculos?',
      proposito: 'Escuchar condiciones de vida para aprender cerca y cuidar lo que nos importa.',
      territorios: [13],
      temas: ['educación'],
      participantes: 'Quienes quieran imaginar esta posibilidad.',
      canales: ['web'],
      responsable: 'Equipo declarado',
      devolucion: 'Una lectura pública revisable por quienes participaron.',
      fechaDevolucion: '2026-11-10',
      efecto: 'Diseño compartido sin compromiso institucional.',
      usoDatos: 'Se publican sólo textos elegidos y autorizados por sus autores.',
      metodoLectura: 'Se contrastan condiciones y diferencias antes de proponer alternativas.',
      institucion: '',
      fases: [
        { nombre: 'Imaginar', salida: 'Relatos revisados por sus autores.', fecha: '2026-10-15' },
      ],
    },
    ...cambios,
  };
}
function montar(componente: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Router>{componente}</Router>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  modelo.lista = [];
  modelo.detalle = null;
  modelo.user = null;
  window.history.replaceState(null, '', '/campanas');
});
const usuario = (esAdmin: boolean) => ({ id: 1, esAdmin });
const nacional = (cambios: Partial<CampanaPublica> = {}) =>
  campana({
    id: '8f7f4a0c-6a7e-4e4f-9d5a-0c9c8d5f8a11',
    slug: SLUG_CAMPANA_NACIONAL,
    ...cambios,
    contrato: { ...campana().contrato, titulo: 'Mi Argentina ideal', territorios: [] },
  });
describe('Campañas como campañas concretas', () => {
  it('distingue campañas con el mismo título por su campaña y no las deduplica', async () => {
    const primera = campana();
    const segunda = campana({
      id: 'bce6fbb0-f156-44dc-a062-c108230ae5b7',
      slug: 'otra-conversacion',
      estado: 'pausada',
    });
    modelo.lista = [primera, segunda];
    montar(<Campanas />);
    expect(screen.getAllByRole('heading', { name: primera.contrato.titulo })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Sumar mi aporte' })).toHaveAttribute(
      'href',
      aportarHref({ campana: 'pregunta-de-la-comunidad', edicion: 2 }),
    );
    expect(screen.getByRole('link', { name: 'Conocer esta campaña' })).toHaveAttribute(
      'href',
      '/campanas/otra-conversacion',
    );
    expect(await screen.findAllByText('Mendoza')).toHaveLength(2);
  });
  it('el catálogo se explica en el título y la entrada, sin numerar las tarjetas', () => {
    modelo.lista = [campana(), campana({ id: 'otra', slug: 'otra' })];
    montar(<Campanas />);
    expect(screen.getByRole('heading', { level: 1, name: 'Campañas' })).toBeInTheDocument();
    expect(
      screen.getByText(/Una campaña es una pregunta abierta por un equipo/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ED\. \d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Una pregunta para imaginar juntos/)).not.toBeInTheDocument();
  });
  it('la campaña nacional va primera y es la destacada, aunque llegue última o cerrada', () => {
    modelo.lista = [
      campana({ id: 'a', slug: 'abierta-a' }),
      campana({ id: 'b', slug: 'cerrada-b', estado: 'cerrada' }),
      nacional({ estado: 'pausada' }),
    ];
    montar(<Campanas />);
    const lista = within(screen.getByRole('region', { name: 'Campañas' }));
    const titulos = lista.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos[0]).toBe('Mi Argentina ideal');
    expect(lista.getByText('Campaña nacional · Pausada')).toBeInTheDocument();
    expect(
      lista.getByText(/Si no elegís otra campaña, tu aporte entra en esta/),
    ).toBeInTheDocument();
  });
  it('sin la campaña nacional, las abiertas van antes que las cerradas', () => {
    modelo.lista = [
      campana({ id: 'c', slug: 'cerrada', estado: 'cerrada' }),
      campana({ id: 'a', slug: 'abierta' }),
    ];
    montar(<Campanas />);
    const links = within(screen.getByRole('region', { name: 'Campañas' })).getAllByRole('link', {
      name: /^Aprender cerca/,
    });
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/campanas/abierta',
      '/campanas/cerrada',
    ]);
  });
  it('abrir una campaña es solo para la administración', () => {
    modelo.lista = [campana()];
    const r = montar(<Campanas />);
    expect(
      screen.queryByRole('link', { name: /Abrir una (campaña|pregunta)/ }),
    ).not.toBeInTheDocument();
    r.unmount();
    modelo.user = usuario(false);
    const r2 = montar(<Campanas />);
    expect(
      screen.queryByRole('link', { name: /Abrir una (campaña|pregunta)/ }),
    ).not.toBeInTheDocument();
    r2.unmount();
    modelo.user = usuario(true);
    montar(<Campanas />);
    expect(screen.getByRole('link', { name: 'Abrir una campaña' })).toHaveAttribute(
      'href',
      '/gestion/campanas',
    );
  });
  it('sin resultados dice qué pasó y deja volver a ver todas, sin contar «0 conversaciones»', () => {
    modelo.lista = [campana()];
    window.history.replaceState(null, '', '/campanas?tema=salud');
    montar(<Campanas />);
    expect(screen.getByText('No hay campañas con estos filtros.')).toBeInTheDocument();
    expect(screen.queryByText(/^0 (conversaciones|campañas)/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas' }));
    expect(window.location.pathname + window.location.search).toBe('/campanas');
  });
  it('la entrada sin campañas públicas manda a sumar el aporte a la campaña nacional', () => {
    modelo.lista = [];
    montar(<Campanas />);
    expect(screen.getByText(/podés sumar tu aporte igual/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Sumar mi aporte a la campaña nacional' }),
    ).toHaveAttribute('href', aportarHref());
  });
  it('identifica la demo como local y pausada, sin fabricar actividad ni un equipo operativo', async () => {
    modelo.lista = [campana({ slug: SLUG_DEMO_CAMPANA, estado: 'pausada' })];
    montar(<Campanas />);
    expect(screen.getByText('Ejemplo local')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorar el ejemplo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
    expect(screen.getByText(/está en pausa y no recibe aportes/)).toBeInTheDocument();
    expect(await screen.findByText('Mendoza')).toBeInTheDocument();
  });
  it('el tema y el estado son un solo control cada uno y conservan el lugar del enlace', () => {
    const cambiar = vi.fn();
    const c = campana();
    montar(
      <FiltrosCatalogo
        campanas={[c]}
        filtros={new URLSearchParams('territorio=13')}
        lugar={{
          id: 13,
          name: 'Mendoza',
          level: 'province',
          provinceId: 13,
          latitude: null,
          longitude: null,
        }}
        errorLugar={false}
        cambiar={cambiar}
      />,
    );
    // Antes el tema se elegía con botones y con un desplegable; ahora solo con el desplegable.
    expect(screen.queryByRole('button', { name: 'educación' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'educación' } });
    expect((cambiar.mock.calls[0]?.[0] as URLSearchParams).toString()).toBe(
      'territorio=13&tema=educaci%C3%B3n',
    );
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'abierta' } });
    expect((cambiar.mock.calls[1]?.[0] as URLSearchParams).toString()).toBe(
      'territorio=13&fase=abierta',
    );
    expect(screen.getByText('1 campaña')).toBeInTheDocument();
  });
  it('con pocas campañas y sin filtros activos, los filtros arrancan cerrados', () => {
    const props = {
      lugar: undefined,
      errorLugar: false,
      cambiar: vi.fn(),
    };
    const r = montar(
      <FiltrosCatalogo campanas={[campana()]} filtros={new URLSearchParams()} {...props} />,
    );
    expect(r.container.querySelector('details')).not.toHaveAttribute('open');
    r.unmount();
    const r2 = montar(
      <FiltrosCatalogo
        campanas={[campana()]}
        filtros={new URLSearchParams('tema=salud')}
        {...props}
      />,
    );
    expect(r2.container.querySelector('details')).toHaveAttribute('open');
    r2.unmount();
    const muchas = [1, 2, 3, 4].map((n) => campana({ id: `c${n}`, slug: `c${n}` }));
    const r3 = montar(
      <FiltrosCatalogo campanas={muchas} filtros={new URLSearchParams()} {...props} />,
    );
    expect(r3.container.querySelector('details')).toHaveAttribute('open');
  });
});

describe('El detalle de una campaña', () => {
  const abrir = (c: CampanaPublica, ruta = `/campanas/${c.slug}`) => {
    modelo.detalle = c;
    window.history.replaceState(null, '', ruta);
    return montar(<CampanaDetail />);
  };
  it('lleva al mapa con la edición vigente y conserva el mismo alcance en análisis y descarga', () => {
    abrir(campana());
    const id = '3718dc73-9774-4d3b-b23d-8bf290ffec30';
    expect(screen.getByRole('link', { name: 'Sumar mi aporte' })).toHaveAttribute(
      'href',
      aportarHref({ campana: 'pregunta-de-la-comunidad', edicion: 2 }),
    );
    expect(
      screen.getByRole('link', { name: 'Ver lo escuchado en la Radiografía' }),
    ).toHaveAttribute('href', `/la-radiografia?campana=${id}&edicion=2`);
    expect(screen.getByRole('link', { name: 'Ver las fichas de esta campaña' })).toHaveAttribute(
      'href',
      `/fichas?campana=${id}`,
    );
    expect(screen.getByRole('link', { name: 'Descargar estos datos' })).toHaveAttribute(
      'href',
      `/datos-abiertos?campana=${id}&edicion=2`,
    );
    expect(screen.getByRole('link', { name: 'Compartir esta campaña' })).toHaveAttribute(
      'href',
      '/campanas/pregunta-de-la-comunidad?edicion=2',
    );
  });
  it('los tres destinos de «Seguir construyendo» miden lo mismo: una columna de un solo ancho', () => {
    abrir(campana());
    const grupo = screen.getByRole('heading', {
      name: 'Seguir construyendo esta campaña',
    }).nextElementSibling;
    const enlaces = Array.from(grupo?.querySelectorAll('a') ?? []);
    expect(enlaces.map((a) => a.textContent)).toEqual([
      'Ver las fichas de esta campaña',
      'Ver lo escuchado en la Radiografía',
      'Descargar estos datos',
    ]);
    // Mismo ancho en todos (w-full dentro de la misma columna), centrados.
    for (const enlace of enlaces) expect(enlace).toHaveClass('w-full', 'justify-center');
    expect(grupo).toHaveClass('flex-col');
  });
  it('explica la devolución una sola vez y no numera los bloques', () => {
    abrir(campana());
    expect(
      screen.getAllByText(
        'La devolución es el texto que publica quien coordina la campaña con lo que se leyó.',
      ),
    ).toHaveLength(1);
    expect(screen.queryByText(/^0\d \//)).not.toBeInTheDocument();
  });
  it('muestra el canal, el lugar y los aportes en palabras de quien lee, con su plural', () => {
    abrir(
      campana({ aportes: 1, contrato: { ...campana().contrato, canales: ['web', 'asistido'] } }),
    );
    expect(screen.getByText('Por la web · Con ayuda de una persona')).toBeInTheDocument();
    expect(screen.getByText(/^1 aporte publicado\./)).toBeInTheDocument();
    expect(screen.getByText('Lugar')).toBeInTheDocument();
    expect(screen.queryByText(/web · asistido/)).not.toBeInTheDocument();
  });
  it('las fechas van en palabras y nunca en ISO', () => {
    abrir(campana());
    expect(screen.getByText(/Fecha prevista: 10 de noviembre de 2026/)).toBeInTheDocument();
    expect(screen.getByText('Para el 15 de octubre de 2026')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/\d{4}-\d{2}-\d{2}/);
  });
  it('una campaña en pausa dice en qué estado está y no ofrece sumar un aporte', () => {
    abrir(
      campana({
        estado: 'pausada',
        historial: [
          {
            revision: 2,
            estado: 'pausada',
            motivo: 'Revisamos la pregunta.',
            fecha: '2026-10-08T15:00:00.000Z',
          },
        ],
      }),
    );
    const aviso = screen.getByLabelText('Estado de la campaña');
    expect(aviso).toHaveTextContent('Esta campaña está en pausa: por ahora no recibe aportes.');
    expect(aviso).toHaveTextContent('Motivo de la pausa: Revisamos la pregunta.');
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
  });
  it('una campaña abierta no repite avisos: el botón ya dice qué hacer', () => {
    abrir(campana());
    expect(screen.queryByLabelText('Estado de la campaña')).not.toBeInTheDocument();
  });
  it('quien edita un borrador sabe quién lo ve y cómo abrirlo', () => {
    modelo.user = usuario(true);
    abrir(campana({ estado: 'borrador', puedoEditar: true, puedoInvitar: true }));
    expect(screen.getByLabelText('Estado de la campaña')).toHaveTextContent(
      'Esta campaña es un borrador: solo la ven vos y tu equipo. Cuando esté lista, abrila desde “Cuidar el recorrido”.',
    );
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cuidar el recorrido' })).toBeInTheDocument();
  });
  it('una edición anterior no ofrece sumar un aporte con una edición vieja y lleva a la vigente', () => {
    abrir(
      campana({
        historial: [
          {
            revision: 3,
            estado: 'abierta',
            motivo: 'Se actualizó.',
            fecha: '2026-10-09T00:00:00.000Z',
          },
        ],
      }),
      '/campanas/pregunta-de-la-comunidad?edicion=2',
    );
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la edición vigente' })).toHaveAttribute(
      'href',
      '/campanas/pregunta-de-la-comunidad',
    );
  });
  it('la demo se avisa una sola vez, fuerte, arriba; el resto no repite el aviso', () => {
    abrir(
      campana({
        slug: SLUG_DEMO_CAMPANA,
        estado: 'pausada',
        puedoEditar: true,
        historial: [
          {
            revision: 3,
            estado: 'borrador',
            motivo: 'Otra edición en preparación.',
            fecha: '2026-10-09T00:00:00.000Z',
          },
        ],
      }),
      `/campanas/${SLUG_DEMO_CAMPANA}?edicion=2`,
    );
    expect(screen.getByLabelText('Estado de la campaña')).toHaveTextContent(
      'Ejemplo local, sin campaña real.',
    );
    expect(screen.getByText(/Estás leyendo una edición anterior/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Próxima etapa')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
    expect(screen.getAllByText(/sin campaña real/)).toHaveLength(1);
    expect(screen.getAllByText(/Fecha ilustrativa/)).toHaveLength(1);
    expect(screen.queryByText(/Este ejemplo/)).not.toBeInTheDocument();
  });
  it('tomar la configuración para abrir otra campaña es solo para la administración', () => {
    const c = campana({ puedoEditar: true, puedoInvitar: true, puedoEditarContrato: true });
    const sinAdmin = abrir(c);
    expect(screen.queryByText(/Tomar esta configuración/)).not.toBeInTheDocument();
    // Quien edita las reglas las sigue pudiendo revisar, pero no cambia la etapa: eso es de la
    // administración y de quien impulsa la campaña (que la coordina una vez abierta).
    expect(screen.getByRole('link', { name: 'Revisar las reglas' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Próxima etapa')).not.toBeInTheDocument();
    sinAdmin.unmount();
    modelo.user = usuario(false);
    const conSesion = abrir(c);
    expect(screen.queryByText(/Tomar esta configuración/)).not.toBeInTheDocument();
    conSesion.unmount();
    modelo.user = usuario(true);
    abrir(c);
    expect(
      screen.getByRole('link', { name: 'Tomar esta configuración para abrir otra campaña' }),
    ).toHaveAttribute('href', `/gestion/campanas?duplicar=${c.id}`);
    expect(screen.getByLabelText('Próxima etapa')).toBeInTheDocument();
  });
  it('quien impulsa una campaña abierta la coordina, sin poder abrirla ni programarla', () => {
    modelo.user = usuario(false);
    abrir(campana({ puedoEditar: true, impulsadaPorMi: true }));
    const etapas = within(screen.getByLabelText('Próxima etapa'))
      .getAllByRole('option')
      .map((o) => o.getAttribute('value'));
    expect(etapas).toEqual(['pausada', 'en_devolucion']);
  });
  it('si la campaña no existe lo dice en el título y muestra el error una sola vez', () => {
    modelo.detalle = null;
    window.history.replaceState(null, '', '/campanas/no-existe');
    montar(<CampanaDetail />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'No encontramos esta campaña.' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Buscando esta pregunta/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver las campañas' })).toHaveAttribute(
      'href',
      '/campanas',
    );
  });
  it('/devolucion abre la página en el texto de la devolución', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const c = campana();
    const r = abrir(c);
    expect(scroll).not.toHaveBeenCalled();
    r.unmount();
    abrir(c, `/campanas/${c.slug}/devolucion`);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(document.getElementById('devolucion'));
    expect(document.getElementById('devolucion')).toHaveTextContent('La devolución');
  });
});
