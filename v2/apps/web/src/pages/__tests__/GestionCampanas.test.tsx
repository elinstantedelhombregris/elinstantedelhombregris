import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { GestionCampanas } from '../GestionCampanas';

import type { CampanaPublica } from '@v2/shared';

interface Modelo {
  auth: { user: { id: number; esAdmin: boolean } | null; isLoading: boolean };
  campana: CampanaPublica | undefined;
}
const modelo = vi.hoisted(
  (): Modelo => ({ auth: { user: null, isLoading: false }, campana: undefined }),
);
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => modelo.auth }));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({ data: [], error: null }),
  useCampana: () => ({ data: modelo.campana, error: null }),
  useGuardarCampana: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));
// La revisión de propuestas pide su lista a la API: acá no interesa y dejaría un pedido colgado.
vi.mock('../Campanas/RevisionPropuestas', () => ({ RevisionPropuestas: () => null }));
vi.mock('../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Selector oficial de territorio</p>,
}));
const montar = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Router>
        <GestionCampanas />
      </Router>
    </QueryClientProvider>,
  );
const campana = (puedoEditarContrato: boolean) =>
  ({
    id: '3718dc73-9774-4d3b-b23d-8bf290ffec30',
    revision: 1,
    puedoEditar: false,
    puedoEditarContrato,
    contrato: {
      titulo: 'Aprender cerca de quienes queremos',
      pregunta: '¿Qué sería posible?',
      proposito: 'Escuchar para aprender cerca.',
      territorios: [],
      temas: ['educación'],
      participantes: 'Quienes quieran imaginar.',
      canales: ['web'],
      responsable: 'Equipo',
      devolucion: 'Una lectura pública revisable.',
      fechaDevolucion: '2099-12-20',
      efecto: 'Diseño sin compromiso.',
      usoDatos: 'Se publican textos autorizados.',
      metodoLectura: 'Se contrastan condiciones.',
      institucion: '',
      fases: [{ nombre: 'Imaginar', salida: 'Relatos revisados.', fecha: '2099-12-01' }],
    },
  }) as unknown as CampanaPublica;

beforeEach(() => {
  modelo.auth = { user: null, isLoading: false };
  modelo.campana = undefined;
  window.history.replaceState(null, '', '/gestion/campanas');
});
describe('Gestión de campañas', () => {
  it('quien no ingresó recibe un enlace que vuelve a esta misma página', () => {
    window.history.replaceState(null, '', '/gestion/campanas?duplicar=abc');
    montar();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      `/ingresar?volver=${encodeURIComponent('/gestion/campanas?duplicar=abc')}`,
    );
    expect(screen.queryByLabelText('Nombre de la campaña')).not.toBeInTheDocument();
  });
  it('quien no es administrador ve cómo proponer una y no el formulario para abrir una campaña', () => {
    modelo.auth = { user: { id: 2, esAdmin: false }, isLoading: false };
    montar();
    expect(screen.getByText(/Cualquiera puede proponer una campaña\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proponer una campaña' })).toHaveAttribute(
      'href',
      '/campanas/proponer',
    );
    expect(screen.queryByLabelText('Nombre de la campaña')).not.toBeInTheDocument();
    expect(screen.queryByText('Las campañas que cuidás')).not.toBeInTheDocument();
  });
  it('tampoco puede abrir una campaña copiando otra', () => {
    modelo.auth = { user: { id: 2, esAdmin: false }, isLoading: false };
    modelo.campana = campana(true);
    window.history.replaceState(null, '', '/gestion/campanas?duplicar=3718dc73');
    montar();
    expect(screen.getByText(/Cualquiera puede proponer una campaña/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre de la campaña')).not.toBeInTheDocument();
  });
  it('la administración ve sus campañas y el formulario para abrir una', () => {
    modelo.auth = { user: { id: 1, esAdmin: true }, isLoading: false };
    montar();
    expect(screen.getByText('Las campañas que cuidás')).toBeInTheDocument();
    expect(screen.getByText('Todavía no abriste ninguna campaña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de la campaña')).toBeInTheDocument();
  });
  it('quien edita las reglas de una campaña existente puede seguir revisándolas sin ser administrador', () => {
    modelo.auth = { user: { id: 2, esAdmin: false }, isLoading: false };
    modelo.campana = campana(true);
    window.history.replaceState(null, '', '/gestion/campanas?editar=3718dc73');
    montar();
    expect(screen.getByLabelText('Nombre de la campaña')).toHaveValue(
      'Aprender cerca de quienes queremos',
    );
  });
  it('quien no edita esa campaña lo sabe, en vez de ver un formulario que no va a guardar', () => {
    modelo.auth = { user: { id: 2, esAdmin: false }, isLoading: false };
    modelo.campana = campana(false);
    window.history.replaceState(null, '', '/gestion/campanas?editar=3718dc73');
    montar();
    expect(
      screen.getByText('Las reglas de esta campaña las administra otro equipo.'),
    ).toBeInTheDocument();
  });
});
