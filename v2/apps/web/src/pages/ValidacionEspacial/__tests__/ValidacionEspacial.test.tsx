import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { GEOGRAFIA } from '@v2/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';


import { ValidacionEspacial } from '../../ValidacionEspacial';
import * as carga from '../cargar-informe';

import type { InformeEspacial } from '@v2/shared';

const informe: InformeEspacial = {
  version: GEOGRAFIA.version,
  generadoEn: '2026-10-15T12:00:00Z',
  metodoVersion: 'espacial-1',
  motor: { shapely: '2', geos: '3', pyproj: '3', proj: '9' },
  proyeccion: 'Albers',
  umbralM2: 1,
  fuentes: [],
  limites: ['No acredita límites legales.'],
  estado: 'con_observaciones',
  capas: [
    { nombre: 'provincias', rasgos: 24, validos: 23, invalidos: 1, sinCodigo: 0, incidencias: 1 },
  ],
  incidencias: [
    {
      tipo: 'geometria_invalida',
      capa: 'provincias',
      unidades: [{ indice: 1, codigo: '06', nombre: 'Buenos Aires' }],
      detalle: 'Anillo con autointersección.',
    },
    {
      tipo: 'sin_codigo',
      capa: 'municipios',
      unidades: [{ indice: 0, codigo: null, nombre: 'Ejemplo sin código' }],
      detalle: 'Pendiente de identificar.',
    },
  ],
};
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ValidacionEspacial />
    </QueryClientProvider>,
  );
afterEach(() => vi.restoreAllMocks());

describe('Informe espacial', () => {
  it('explica límites, permite filtrar y ofrece el informe íntegro', async () => {
    vi.spyOn(carga, 'cargarInformeEspacial').mockResolvedValue(informe);
    montar();
    expect(await screen.findByText('Buenos Aires (06)')).toBeInTheDocument();
    expect(screen.queryByText('Ejemplo sin código (sin código)')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tipo de control'), { target: { value: '' } });
    expect(screen.getByText('Ejemplo sin código (sin código)')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre o código'), { target: { value: 'ausente' } });
    expect(screen.getByText(/Esto no significa que se hayan comprobado todos/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Descargar informe completo (JSON)' })).toHaveAttribute(
      'download',
    );
  });
  it('un fallo no se presenta como cero defectos', async () => {
    vi.spyOn(carga, 'cargarInformeEspacial').mockRejectedValue(new Error('La huella no coincide.'));
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent('La huella no coincide');
    expect(screen.queryByText(/Sin polígonos inválidos/)).not.toBeInTheDocument();
  });
});
