/**
 * El mapa base no le pide nada a nadie que el estilo no nombre (D-164).
 *
 * `react-map-gl` trae un valor por defecto que no se ve en ningún archivo propio:
 * si no recibe `RTLTextPlugin`, registra un complemento servido por
 * `api.mapbox.com`. La guarda del estilo lee `oscuro.json` y no podía verlo.
 * Esto cuida lo que el componente le pasa a la librería.
 */
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ESTILO_DEL_MAPA } from '../credito';
import { MapaBase } from '../MapaBase';

const recibido = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));

vi.mock('react-map-gl/maplibre', async () => {
  const { forwardRef } = await import('react');
  return {
    // Con `forwardRef`, como el componente real: `MapaBase` le pasa una ref. Un componente de
    // función pelado hace que React avise, y para armar el aviso lo vuelve a llamar sin props.
    Map: forwardRef<unknown, Record<string, unknown>>(function MapaDeMentira(props, _ref) {
      recibido.props = props;
      return null;
    }),
    NavigationControl: () => null,
    ScaleControl: () => null,
  };
});
vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));
vi.mock('../protocolo-pmtiles', () => ({ registrarProtocoloPmtiles: vi.fn() }));

describe('el mapa base', () => {
  it('no registra el complemento de texto de derecha a izquierda, que se baja de Mapbox', () => {
    render(<MapaBase />);
    expect(recibido.props).toHaveProperty('RTLTextPlugin');
    // `undefined` no alcanza: ahí la librería pone su dirección por defecto.
    expect(recibido.props?.RTLTextPlugin).toBe(false);
  });

  it('dibuja el estilo que se publica, el mismo que nombra el crédito', () => {
    render(<MapaBase />);
    expect(recibido.props?.mapStyle).toBe(ESTILO_DEL_MAPA);
  });

  it('no deja el control de atribución de la librería: el crédito lo escribe el pie', () => {
    render(<MapaBase />);
    expect(recibido.props?.attributionControl).toBe(false);
  });
});
