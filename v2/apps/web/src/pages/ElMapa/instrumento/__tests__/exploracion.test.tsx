import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BusquedaTerritorial } from '../BusquedaTerritorial';
import { EstadoConsulta } from '../EstadoConsulta';
import { leerExploracion, urlExploracion } from '../exploracion-url';
import { FiltrosExploracion } from '../FiltrosExploracion';
import { ListaRegistros } from '../ListaRegistros';
import { ProcedenciaConsulta } from '../ProcedenciaConsulta';

import type { LecturaMapa } from '~/lib/queries/civic-map';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: () => ({ data: [{ id: 6, name: 'Buenos Aires' }] }),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({
        lugares: [
          {
            id: 15,
            name: 'San Martín',
            level: 'locality',
            provinceId: 6,
            latitude: null,
            longitude: null,
          },
        ],
      }),
  },
}));
const datos: LecturaMapa = {
  signals: [
    {
      id: 'voz:00000000-0000-4000-8000-000000000042',
      capa: 'voz',
      tipo: 'necesidad',
      texto: 'Agua accesible.',
      lat: null,
      lng: null,
      precision: 'province',
      role: 'capture',
      provinceId: 6,
      cityId: null,
      createdAt: '2026-01-01',
    },
  ],
  metadata: {
    total: 1201,
    entregados: 1,
    completa: false,
    hasta: '2026-01-01',
    siguiente: 'otra',
    unidad: 'registros',
    sinPunto: 1,
    porProvincia: [],
    porDia: [],
  },
};
function conQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

describe('Explorar con alcance explícito', () => {
  it('un fallo inicial no muestra cero; el reintento funciona y una lectura previa se conserva como desactualizada', () => {
    const reintentar = vi.fn();
    const { rerender } = render(
      <EstadoConsulta
        cargando={false}
        fallo
        tieneDatos={false}
        actualizadoEn={0}
        reintentar={reintentar}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('No sabemos cuántos registros');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    expect(reintentar).toHaveBeenCalledOnce();
    rerender(
      <EstadoConsulta
        cargando={false}
        fallo
        tieneDatos
        actualizadoEn={100000}
        reintentar={reintentar}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('última lectura recibida');
  });
  it('separa el total de la página y permite continuar sin ocultar los registros sin punto', () => {
    const siguiente = vi.fn();
    render(
      <>
        <ProcedenciaConsulta datos={datos.metadata} siguiente={siguiente} inicio={vi.fn()} />
        <ListaRegistros datos={datos} seleccionada={null} seleccionar={vi.fn()} />
      </>,
    );
    expect(screen.getByText(/1 registros cargados de 1201 coincidentes/)).toBeInTheDocument();
    expect(screen.getByText(/Sin punto publicado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir aporte/ })).toHaveAttribute(
      'href',
      '/senal/00000000-0000-4000-8000-000000000042',
    );
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(siguiente).toHaveBeenCalledOnce();
  });
  it('restaura filtros compartibles e ignora identificadores inválidos sin copiar secretos a la URL', () => {
    const estado = leerExploracion(
      '?lugar=6&nombre=Córdoba&periodo=30d&lente=analisis&tipo=sueño&codigoRetiro=privado',
    );
    const enlace = urlExploracion(estado);
    expect(leerExploracion(enlace.split('?')[1] ?? '')).toEqual(estado);
    expect(enlace).not.toContain('privado');
    expect(leerExploracion('?lugar=-2&lente=inexistente')).toEqual({ modo: 'mapa', rango: 'todo' });
  });
  it('busca en el catálogo y desambigua por provincia antes de seleccionar', async () => {
    const elegir = vi.fn();
    conQuery(<BusquedaTerritorial onElegir={elegir} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'San Martín' } });
    const lugar = await screen.findByRole('button', {
      name: /San Martín.*Localidad.*Buenos Aires/,
    });
    fireEvent.click(lugar);
    expect(elegir).toHaveBeenCalledWith(expect.objectContaining({ id: 15, provinceId: 6 }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
  it('aplica el período elegido y limpia ámbito y filtros juntos', () => {
    const cambiar = vi.fn();
    conQuery(
      <FiltrosExploracion
        valor={{ modo: 'mapa', rango: 'todo', lugarId: 6 }}
        cambiar={cambiar}
        elegir={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Período de la consulta'), { target: { value: '7d' } });
    expect(cambiar).toHaveBeenLastCalledWith({ modo: 'mapa', rango: '7d', lugarId: 6 });
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(cambiar).toHaveBeenLastCalledWith({ modo: 'mapa', rango: 'todo' });
  });
});
