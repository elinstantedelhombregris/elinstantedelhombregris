import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { contratoCampanaSchema } from '@v2/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Campanas } from '../Campanas';
import { Devolucion } from '../Campanas/Devolucion';
import { filtrarCatalogo } from '../Campanas/filtrar-catalogo';
import { FormularioCampana } from '../Campanas/Formulario';

import type { CampanaCatalogo } from '../Campanas/filtrar-catalogo';
import type { CampanaPublica } from '@v2/shared';
import type { ReactElement } from 'react';
import type * as Wouter from 'wouter';

const modelo = vi.hoisted(() => ({ lista: [] as unknown[], mutate: vi.fn(), guardar: vi.fn(), navegar: vi.fn(), escribir: vi.fn() }));
vi.mock('wouter', async (importOriginal) => {
  const real = await importOriginal<typeof Wouter>();
  return { ...real, useLocation: () => [window.location.pathname, modelo.navegar] };
});
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({ data: modelo.lista, isLoading: false, isError: false }),
  escribir: modelo.escribir,
  useGuardarCampana: (id?: string) => {
    modelo.guardar(id);
    return { mutate: modelo.mutate, isPending: false };
  },
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null, isLoading: false }) }));
vi.mock('../ElMapa/instrumento/BusquedaTerritorial', () => ({ BusquedaTerritorial: () => <p>Selector oficial de territorio</p> }));

const contrato = contratoCampanaSchema.parse({
  titulo: 'La vida que queremos vivir', pregunta: '¿Qué sería posible en nuestra Argentina ideal?', proposito: 'Encontrar juntos condiciones deseadas y diseños para compararlas.', territorios: [], temas: ['educación'], participantes: 'Todas las personas que quieran imaginar con otros.', canales: ['web'], responsable: 'Equipo convocante', devolucion: 'Una lectura pública para revisar y corregir lo entendido.', fechaDevolucion: '2099-12-20', efecto: 'Ejercicio de diseño sin autoridad institucional.', usoDatos: 'Leeremos aportes autorizados para elaborar alternativas con sus fuentes.', metodoLectura: 'Contrastaremos las fuentes y ausencias con devolución humana revisable.', institucion: 'Una institución mencionada', fases: [{ nombre: 'Imaginar', salida: 'Relatos revisados por quienes participaron.', fecha: '2099-12-01' }],
});
const campana = (id: string, territorios: number[] = [], tema = 'educación', estado: CampanaCatalogo['estado'] = 'abierta'): CampanaCatalogo => ({ id, slug: id, estado, revision: 2, actualizadaEn: '2026-10-08T00:00:00Z', contrato: { ...contrato, titulo: `Convocatoria ${id}`, territorios, temas: [tema] } });
const montar = (v: ReactElement) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{v}</QueryClientProvider>);

beforeEach(() => {
  vi.clearAllMocks();
  modelo.escribir.mockReset().mockResolvedValue({});
  window.history.replaceState(null, '', '/campanas');
  modelo.lista = [campana('nacional'), campana('otra', [], 'salud', 'pausada')];
});

describe('Campañas por territorio, tema y fase', () => {
  it('el alcance incluye la convocatoria nacional, el lugar y su provincia sin incluir otra zona', () => {
    const lista = [campana('nacional'), campana('local', [45]), campana('provincia', [7]), campana('lejana', [8]), campana('otro-tema', [45], 'salud'), campana('pausada', [45], 'educación', 'pausada')];
    const r = filtrarCatalogo(lista, new URLSearchParams('territorio=45&tema=educación&fase=abierta'), { id: 45, provinceId: 7, name: 'Lugar de prueba', level: 'locality', latitude: null, longitude: null });
    expect(r.map((c) => c.id)).toEqual(['nacional', 'local', 'provincia']);
  });
  it('abre la selección del enlace público y conserva filtros al cambiar una fase', () => {
    window.history.replaceState(null, '', '/campanas?tema=educaci%C3%B3n&fase=abierta');
    montar(<Campanas />);
    expect(screen.getByRole('link', { name: 'Convocatoria nacional' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Convocatoria otra' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Fase de campaña'), { target: { value: 'pausada' } });
    expect(modelo.navegar).toHaveBeenCalledWith('/campanas?tema=educaci%C3%B3n&fase=pausada');
  });
});

describe('Contrato y duplicación sin transferir consentimientos', () => {
  it('una plantilla solo precarga contrato y guarda una creación con identificador nuevo', () => {
    montar(<FormularioCampana plantilla={contrato} />);
    expect(screen.getByLabelText('Cómo usaremos los datos compartidos')).toHaveValue(contrato.usoDatos);
    expect(screen.getByText(/no acredita vínculo, representación ni aceptación/)).toBeInTheDocument();
    expect(screen.getByText(/No se copian aportes, devoluciones/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/El equipo acepta cuidar este recorrido/));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador de campaña' }));
    expect(modelo.guardar).toHaveBeenCalledWith(undefined);
    const primera = modelo.mutate.mock.calls[0]?.[0] as { idLocal: string; contrato: unknown; revision?: number };
    expect(primera.idLocal).toMatch(/^[a-f0-9-]{36}$/);
    expect(primera).not.toHaveProperty('revision');
    expect(primera.contrato).toEqual(contrato);
    expect(primera).not.toHaveProperty('aportes');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador de campaña' }));
    expect(modelo.mutate.mock.calls[1]?.[0]).toMatchObject({ idLocal: primera.idLocal });
  });
  it('la vista previa y el formulario comparten uso y método, sin aceptación institucional', () => {
    montar(<FormularioCampana plantilla={contrato} />);
    fireEvent.click(screen.getByText('Ver cómo se va a mostrar la campaña'));
    expect(screen.getByText(contrato.usoDatos, { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(contrato.metodoLectura, { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Esta mención no acredita representación ni aceptación institucional/)).toBeInTheDocument();
  });
  it('una respuesta HTTP perdida conserva la devolución exacta al cambiar la fase o edición', async () => {
    const c: CampanaPublica = { ...campana('nacional'), puedoEditar: true, creadaEn: '2026-10-08T00:00:00Z', aportes: 0, devoluciones: [], historial: [] };
    const client = new QueryClient();
    modelo.escribir.mockRejectedValueOnce(new Error('Perdimos la respuesta HTTP.'));
    const view = render(<QueryClientProvider client={client}><Devolucion campana={c} /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText('Lectura del equipo'), { target: { value: 'Escuchamos deseos diferentes para aprender en comunidad con tiempo para cuidar.' } });
    fireEvent.change(screen.getByLabelText('Qué falta y hasta dónde llega esta lectura'), { target: { value: 'Esta lectura describe la prueba, no representa al país.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar devolución' }));
    await screen.findByRole('alert');
    const original: unknown = modelo.escribir.mock.calls[0]?.[2];
    expect(original).toMatchObject({ revision: 2 });
    if (!original || typeof original !== 'object' || !('idLocal' in original)) throw new Error('Falta identificador de devolución.');
    expect(original.idLocal).toMatch(/^[a-f0-9-]{36}$/);
    expect(screen.getByLabelText('Lectura del equipo')).toHaveAttribute('readonly');
    view.rerender(<QueryClientProvider client={client}><Devolucion campana={{ ...c, revision: 9, estado: 'borrador' }} /></QueryClientProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Recuperar la misma devolución' }));
    await waitFor(() => { expect(modelo.escribir).toHaveBeenCalledTimes(2); });
    expect(modelo.escribir.mock.calls[1]?.[2]).toEqual(original);
  });
});
