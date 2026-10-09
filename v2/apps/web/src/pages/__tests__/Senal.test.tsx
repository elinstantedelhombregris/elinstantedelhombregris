import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Senal } from '../Senal';

import type { FichaDeSenal } from '~/lib/queries/senales';

interface EstadoDeLaConsulta {
  data: FichaDeSenal | undefined;
  isLoading: boolean;
  isError: boolean;
}

const m = vi.hoisted(() => {
  const estado: EstadoDeLaConsulta = { data: undefined, isLoading: false, isError: false };
  return { estado };
});

vi.mock('~/lib/queries/senales', () => ({ useSenal: () => m.estado }));
vi.mock('../Senal/BotonAdherir', () => ({ BotonAdherir: () => <p>Yo también</p> }));
vi.mock('../Senal/PanelConfirmar', () => ({ PanelConfirmar: () => <p>Panel de confirmar</p> }));
vi.mock('../Senal/FichaDeConfirmaciones', () => ({ FichaDeConfirmaciones: () => <p>Quiénes</p> }));
vi.mock('../Senal/EditarAporte', () => ({ EditarAporte: () => <p>Editor único</p> }));
vi.mock('../Senal/RetirarAporte', () => ({ RetirarAporte: () => <p>Retirar aporte</p> }));

const ID = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';

function ficha(
  extra: Partial<FichaDeSenal> = {},
  senal: Partial<FichaDeSenal['senal']> = {},
): FichaDeSenal {
  return {
    senal: {
      idPublico: ID,
      tipo: 'sueño',
      clase: 'deseo',
      tema: null,
      titulo: null,
      texto: 'Quiero una huerta en cada escuela.',
      fuente: null,
      firma: null,
      estado: 'enviada',
      lat: null,
      lng: null,
      precision: 'neighborhood',
      provinceId: null,
      direccionTexto: null,
      comprometidoPara: null,
      desenlace: null,
      periodicidad: null,
      creadaEn: '2026-10-05T15:00:00.000Z',
      ...senal,
    },
    adhesiones: { total: 0, mia: false },
    confirmaciones: [],
    respuestas: [],
    umbral: 2,
    seVerifica: false,
    ...extra,
  };
}

beforeEach(() => {
  window.history.replaceState(null, '', `/senal/${ID}`);
  m.estado = { data: ficha(), isLoading: false, isError: false };
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('La página de un aporte', () => {
  it('si no existe, lo dice con las palabras del sitio y sin hablar de «filas vacías»', () => {
    m.estado = { data: undefined, isLoading: false, isError: true };
    render(<Senal />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'No encontramos ese aporte.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Puede que el enlace tenga un error o que quien lo escribió lo haya retirado.'),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/fila vacía|esa voz|el link/);
    expect(screen.getByRole('link', { name: 'Volver al mapa' })).toHaveAttribute('href', '/el-mapa');
  });

  it('si es tuyo, un aviso arriba dice dónde corregirlo o retirarlo', () => {
    m.estado = { data: ficha({ esPropia: true }), isLoading: false, isError: false };
    render(<Senal />);

    expect(
      screen.getByText('Este aporte es tuyo. Podés corregirlo o retirarlo al final de la página.'),
    ).toBeInTheDocument();
    // Un solo editor y el retiro, al final.
    expect(screen.getByText('Editor único')).toBeInTheDocument();
    expect(screen.getByText('Retirar aporte')).toBeInTheDocument();
  });

  it('si es de otra persona no hay aviso ni controles', () => {
    m.estado = { data: ficha({ esPropia: false }), isLoading: false, isError: false };
    render(<Senal />);

    expect(screen.queryByText(/Este aporte es tuyo/)).not.toBeInTheDocument();
    expect(screen.queryByText('Editor único')).not.toBeInTheDocument();
    expect(screen.queryByText('Retirar aporte')).not.toBeInTheDocument();
  });

  it('si es tuyo pero ya está retirado, no promete controles que no hay', () => {
    m.estado = {
      data: ficha({ esPropia: true }, { estado: 'retirada' }),
      isLoading: false,
      isError: false,
    };
    render(<Senal />);

    expect(screen.queryByText(/Este aporte es tuyo/)).not.toBeInTheDocument();
    expect(screen.queryByText('Editor único')).not.toBeInTheDocument();
  });

  it.each([
    ['exact', 'en su punto exacto'],
    ['100m', 'a ±100 m'],
    ['500m', 'a ±500 m'],
    ['neighborhood', 'en su barrio'],
    ['city', 'en el centro de su localidad'],
    ['province', 'a nivel provincia'],
    ['otra-cosa', 'a nivel provincia'],
  ])('la precisión «%s» se dice «%s», con la etiqueta compartida', (precision, etiqueta) => {
    m.estado = { data: ficha({}, { precision }), isLoading: false, isError: false };
    render(<Senal />);

    expect(screen.getByText('Precisión del lugar')).toBeInTheDocument();
    expect(screen.getByText(etiqueta)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/neighborhood|100m|500m/);
  });
});
