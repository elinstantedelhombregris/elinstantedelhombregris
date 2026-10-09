import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { CampanaDetail } from '../../CampanaDetail';
import { Campanas } from '../../Campanas';
import { FiltrosCatalogo } from '../FiltrosCatalogo';
import { SLUG_DEMO_CAMPANA } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

const modelo = vi.hoisted(() => ({
  lista: [] as CampanaPublica[],
  detalle: null as CampanaPublica | null,
}));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({ data: modelo.lista, isLoading: false, isError: false, error: null }),
  useCampana: () => ({ data: modelo.detalle, isLoading: false, isError: false, error: null }),
  useEstadoCampana: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  escribir: vi.fn(),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({
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
  CompartirProceso: ({ href }: { href: string }) => <a href={href}>Compartir esta pregunta</a>,
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
  window.history.replaceState(null, '', '/campanas');
});
describe('Campañas como conversaciones concretas', () => {
  it('distingue campañas con el mismo título por su proceso y no las deduplica', async () => {
    const primera = campana();
    const segunda = campana({
      id: 'bce6fbb0-f156-44dc-a062-c108230ae5b7',
      slug: 'otra-conversacion',
      estado: 'pausada',
    });
    modelo.lista = [primera, segunda];
    montar(<Campanas />);
    expect(screen.getAllByRole('heading', { name: primera.contrato.titulo })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Sumar mi mirada' })).toHaveAttribute(
      'href',
      `/el-mapa?campana=${primera.id}&edicion=2&participar=imaginar#instrumento`,
    );
    expect(screen.getByRole('link', { name: 'Conocer el proceso' })).toHaveAttribute(
      'href',
      '/campanas/otra-conversacion',
    );
    expect(await screen.findAllByText('Mendoza')).toHaveLength(2);
  });
  it('identifica la demo como local y pausada, sin fabricar actividad ni un equipo operativo', async () => {
    modelo.lista = [campana({ slug: SLUG_DEMO_CAMPANA, estado: 'pausada' })];
    montar(<Campanas />);
    expect(screen.getByText('Ejemplo local · sin convocatoria')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorar el ejemplo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sumar mi mirada' })).not.toBeInTheDocument();
    expect(screen.getByText(/Está en pausa; no tiene equipo operativo/)).toBeInTheDocument();
    expect(await screen.findByText('Mendoza')).toBeInTheDocument();
  });
  it('los temas y la fase son elecciones explícitas y conservan la zona del enlace', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'educación' }));
    expect((cambiar.mock.calls[0]?.[0] as URLSearchParams).toString()).toBe(
      'territorio=13&tema=educaci%C3%B3n',
    );
    fireEvent.change(screen.getByLabelText('Fase de campaña'), { target: { value: 'abierta' } });
    expect((cambiar.mock.calls[1]?.[0] as URLSearchParams).toString()).toBe(
      'territorio=13&fase=abierta',
    );
    expect(screen.getByText('1 conversación en este alcance')).toBeInTheDocument();
  });
  it('el detalle lleva al mapa con la edición y conserva el mismo alcance en análisis y descarga', () => {
    modelo.detalle = campana();
    window.history.replaceState(null, '', '/campanas/pregunta-de-la-comunidad');
    montar(<CampanaDetail />);
    expect(screen.getByRole('link', { name: 'Sumar mi mirada desde el mapa' })).toHaveAttribute(
      'href',
      `/el-mapa?campana=${modelo.detalle.id}&edicion=2&participar=imaginar#instrumento`,
    );
    expect(screen.getByRole('link', { name: 'Revisar lo escuchado' })).toHaveAttribute(
      'href',
      `/la-radiografia?campana=${modelo.detalle.id}&edicion=2`,
    );
    expect(screen.getByRole('link', { name: 'Descargar estos datos' })).toHaveAttribute(
      'href',
      `/datos-abiertos?campana=${modelo.detalle.id}&edicion=2`,
    );
    expect(screen.getByRole('link', { name: 'Compartir esta pregunta' })).toHaveAttribute(
      'href',
      '/campanas/pregunta-de-la-comunidad?edicion=2',
    );
  });
  it('la demo distingue fechas ilustrativas de una devolución real y una edición anterior no ofrece gestión de fase', () => {
    modelo.detalle = campana({
      slug: SLUG_DEMO_CAMPANA,
      estado: 'pausada',
      puedoEditar: true,
      historial: [
        {
          revision: 3,
          estado: 'borrador',
          motivo: 'Otra pregunta en preparación.',
          fecha: '2026-10-09T00:00:00.000Z',
        },
      ],
    });
    window.history.replaceState(null, '', `/campanas/${SLUG_DEMO_CAMPANA}?edicion=2`);
    montar(<CampanaDetail />);
    expect(screen.getByLabelText('Alcance de esta demostración')).toHaveTextContent(
      'sin convocatoria real',
    );
    expect(screen.getByText(/Estás leyendo una edición anterior/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Próxima fase')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Sumar mi mirada desde el mapa' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/Fecha ilustrativa/).length).toBeGreaterThan(0);
  });
});
