import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LecturaOpiniones } from '../sections/LecturaOpiniones';

import { useFichas } from '~/lib/queries/fichas';
import { useDisenoFicha } from '~/lib/queries/participacion';

vi.mock('~/lib/queries/fichas', () => ({ useFichas: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({ useDisenoFicha: vi.fn() }));
const fichas = vi.mocked(useFichas);
const diseno = vi.mocked(useDisenoFicha);
const lectura = {
  afirmaciones: [
    {
      id: 'a',
      texto: 'Aprender cerca de nuestros vínculos.',
      acuerdo: null,
      desacuerdo: null,
      paso: null,
      respuestas: 3,
      miRespuesta: 'desacuerdo',
      miExpuesta: true,
      puedoRetirar: true,
    },
  ],
  alternativas: [],
  pruebas: [],
  analisisOpiniones: {
    estado: 'insuficiente' as const,
    motivo: 'Hace falta más conversación explícita.',
    participantes: 3,
    incluidos: 0,
    afirmaciones: 1,
    grupos: [],
    condiciones: [],
    metodo: 'PCA centrada; K=2.',
  },
};
beforeEach(() => {
  vi.clearAllMocks();
  fichas.mockReturnValue({
    data: {
      fichas: [
        {
          id: 'f1',
          titulo: 'Aprender juntos',
          revision: 1,
          territorioNombre: null,
          actualizadaEn: '2026-10-08',
        },
        {
          id: 'f2',
          titulo: 'Cuidarnos',
          revision: 1,
          territorioNombre: null,
          actualizadaEn: '2026-10-08',
        },
      ],
      total: 45,
    },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useFichas>);
  diseno.mockReturnValue({
    data: lectura,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useDisenoFicha>);
});
describe('Acuerdos y diferencias en Radiografía', () => {
  it('mantiene la conversación completa separada de filtros de texto y declara el catálogo parcial', () => {
    render(
      <LecturaOpiniones
        filtros={{ territorio: '12', campana: 'c1', tema: 'educacion', edicion: '2' }}
      />,
    );
    expect(fichas).toHaveBeenCalledWith(12, 'c1');
    expect(diseno).toHaveBeenCalledWith('f1');
    expect(screen.getByText(/2 fichas disponibles de 45/)).toBeInTheDocument();
    expect(screen.getByText(/no recortan las respuestas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir la ficha/ })).toHaveAttribute(
      'href',
      '/fichas/f1',
    );
  });
  it('permite seleccionar otra conversación sin mezclar matrices', () => {
    render(<LecturaOpiniones filtros={{}} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'f2' } });
    expect(diseno).toHaveBeenLastCalledWith('f2');
    expect(screen.getByRole('link', { name: /Abrir la ficha/ })).toHaveAttribute(
      'href',
      '/fichas/f2',
    );
  });
  it('respeta supresión de grupos pequeños y no publica mi respuesta ni permisos de gestión', () => {
    render(<LecturaOpiniones filtros={{}} />);
    expect(screen.getByText('Estructura insuficiente')).toBeInTheDocument();
    expect(
      screen.getByText(/3 respuestas; el desglose público espera al menos cinco/),
    ).toBeInTheDocument();
    expect(screen.queryByText('desacuerdo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retirar/ })).not.toBeInTheDocument();
    expect(screen.getByText(/un faltante no es acuerdo/)).toBeInTheDocument();
  });
  it('lee apoyo entre grupos con su denominador y reserva un desglose insuficiente', () => {
    diseno.mockReturnValue({
      data: {
        ...lectura,
        analisisOpiniones: {
          ...lectura.analisisOpiniones,
          estado: 'exploratorio',
          grupos: [
            { nombre: 'A', cuentas: 8 },
            { nombre: 'B', cuentas: 6 },
          ],
          condiciones: [
            {
              afirmacion: 'a',
              apoyo: 0.4,
              grupos: [
                { nombre: 'A', acuerdos: 5, respuestas: 7 },
                { nombre: 'B', acuerdos: null, respuestas: null },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDisenoFicha>);
    render(<LecturaOpiniones filtros={{}} />);
    expect(screen.getByText('Hipótesis exploratoria')).toBeInTheDocument();
    expect(screen.getByText(/A: 5 acuerdos de 7 respuestas/)).toBeInTheDocument();
    expect(screen.getByText(/B: desglose reservado por tamaño insuficiente/)).toBeInTheDocument();
  });
  it('distingue una consulta fallida de una conversación sin participantes', () => {
    fichas.mockReturnValue({ data: undefined, isLoading: false, isError: true } as ReturnType<
      typeof useFichas
    >);
    render(<LecturaOpiniones filtros={{}} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/Una lectura fallida no significa/);
    expect(screen.queryByText(/Todavía no hay fichas/)).not.toBeInTheDocument();
  });
});
