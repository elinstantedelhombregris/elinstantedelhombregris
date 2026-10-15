import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { CATALOGO_FUENTES, type FuenteFicha } from '@v2/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ElegirFuenteCatalogo } from '../../Fichas/cuaderno/ElegirFuenteCatalogo';
import { FormularioFuente, LeerFuente } from '../../Fichas/cuaderno/Fuentes';
import { Fuentes } from '../../Fuentes';

vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => null,
}));
afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Fuentes />
    </QueryClientProvider>,
  );
const indicador = CATALOGO_FUENTES.indicadores[0];
if (!indicador) throw new Error('Falta el indicador.');
const fuente = {
  ...indicador.dato,
  id: '11111111-1111-4111-8111-111111111111',
  catalogo: { version: CATALOGO_FUENTES.version, id: indicador.id },
};

describe('Fuentes consultables', () => {
  it('muestra datos, escala, versiones y limitaciones aunque falle una actualización', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              fecha: '2026-10-15T10:00:00.000Z',
              estado: 'fallida',
              detalle: 'Fuente incompleta',
            }),
          ),
        ),
      ),
    );
    montar();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fuentes y geografía');
    expect(screen.getByText('83,9 %')).toBeVisible();
    expect(screen.getAllByText(/No es un porcentaje de hogares/)).toHaveLength(4);
    expect(screen.getByText(/Diez|10 sin código/)).toBeVisible();
    expect(await screen.findAllByText(/Se conserva la edición válida/)).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Comprobar en INDEC/ })).toHaveLength(4);
  });
  it('una edición inexistente no se reemplaza silenciosamente por la actual', () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));
    window.history.replaceState(null, '', '/fuentes?version=inexistente');
    montar();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Esta edición del catálogo no está disponible',
    );
    expect(screen.queryByText('83,9 %')).toBeNull();
  });
  it('agrega la fuente nacional al borrador sin publicar y exige desvincular para modificarla', () => {
    const agregar = vi.fn();
    const vista = render(<ElegirFuenteCatalogo agregar={agregar} completo={false} />);
    fireEvent.change(screen.getByLabelText('Indicador del catálogo'), {
      target: { value: indicador.id },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Incorporar fuente del catálogo al borrador' }),
    );
    expect(agregar).toHaveBeenCalledWith(
      expect.objectContaining({ territorioId: null, valor: 83.9, catalogo: fuente.catalogo }),
    );
    const guardar = vi.fn<(f: FuenteFicha) => void>();
    vista.rerender(<FormularioFuente inicial={fuente} guardar={guardar} cancelar={vi.fn()} />);
    expect(screen.getByLabelText('Valor observado')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular para adaptar la fuente' }));
    fireEvent.change(screen.getByLabelText('Valor observado'), { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: 'Incorporar al borrador' }));
    expect(guardar.mock.calls[0]?.[0].catalogo).toBeUndefined();
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ valor: 80 }));
  });
  it('una carga alterada no obtiene una etiqueta de transcripción contrastada', () => {
    const v = render(<LeerFuente fuente={fuente} />);
    expect(screen.getByRole('link', { name: /Procedencia y transcripción/ })).toHaveAttribute(
      'href',
      `/fuentes?version=${fuente.catalogo.version}#${fuente.catalogo.id}`,
    );
    v.rerender(<LeerFuente fuente={{ ...fuente, valor: 1 }} />);
    expect(screen.queryByRole('link', { name: /Procedencia y transcripción/ })).toBeNull();
    expect(screen.getByText(/sin verificación del catálogo/)).toBeVisible();
  });
});
