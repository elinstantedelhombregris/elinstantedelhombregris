import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Afirmaciones } from '../Afirmaciones';

import { requerido } from './ayudas';

import type { AnalisisOpiniones } from '@v2/civic-core';
import type { DisenoFicha } from '@v2/shared';

const AVISO =
  'Anotamos qué afirmaciones viste, sin tu nombre, para saber a cuántas personas llegaron.';
const ID = '34b57499-a167-4dda-ae15-f0e0c3c67720';
const OTRA = '44b57499-a167-4dda-ae15-f0e0c3c67721';

const modelo = vi.hoisted(() => ({
  user: null as null | { id: number },
  mutate: vi.fn(),
  escribir: vi.fn(),
  observadores: [] as { observar: (entradas: { isIntersecting: boolean }[]) => void }[],
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: modelo.mutate, isPending: false, error: null }),
  escribir: modelo.escribir,
}));

const afirmacion = (id: string, cambios: Partial<DisenoFicha['afirmaciones'][number]> = {}) => ({
  id,
  texto: `Aprender cerca de casa ${id.slice(0, 2)}`,
  acuerdo: null,
  desacuerdo: null,
  paso: null,
  respuestas: 2,
  miRespuesta: null,
  miExpuesta: false,
  puedoRetirar: false,
  ...cambios,
});
const vacio: AnalisisOpiniones = {
  estado: 'insuficiente',
  motivo: 'Hace falta más conversación explícita antes de buscar grupos.',
  participantes: 0,
  incluidos: 0,
  afirmaciones: 0,
  grupos: [],
  condiciones: [],
  metodo: 'PCA centrada con imputación de medias solo para proyección.',
};
const datos = (
  afirmaciones: DisenoFicha['afirmaciones'],
  analisisOpiniones: AnalisisOpiniones = vacio,
) => ({ afirmaciones, alternativas: [], pruebas: [], analisisOpiniones });
const montar = (d: ReturnType<typeof datos>) =>
  render(<Afirmaciones fichaId={ID} datos={d} hrefIngreso="/ingresar?volver=%2Ffichas%2Fx" />);

beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
  modelo.observadores = [];
  modelo.escribir.mockResolvedValue({});
  class Observador {
    constructor(private readonly alVer: (e: { isIntersecting: boolean }[]) => void) {
      modelo.observadores.push({ observar: alVer });
    }
    observe() {
      this.alVer([{ isIntersecting: true }]);
    }
    disconnect() {
      // Nada que soltar en la prueba.
    }
  }
  vi.stubGlobal('IntersectionObserver', Observador);
});

describe('Afirmaciones: el aviso de exposición', () => {
  it('quien ingresó ve el aviso antes de que se anote lo que vio', () => {
    modelo.user = { id: 7 };
    modelo.escribir.mockImplementation(() => {
      // En el momento exacto de anotar, el aviso ya está en la página.
      expect(screen.queryByText(AVISO)).not.toBeNull();
      return Promise.resolve({});
    });
    montar(datos([afirmacion(ID)]));
    expect(screen.getByText(AVISO)).toBeVisible();
    expect(modelo.escribir).toHaveBeenCalledWith(
      'post',
      `/api/v1/fichas/afirmaciones/${ID}/exposicion`,
    );
  });

  it('quien no ingresó no tiene nada que avisar porque no se anota nada', () => {
    montar(datos([afirmacion(ID)]));
    expect(screen.queryByText(AVISO)).toBeNull();
    expect(modelo.escribir).not.toHaveBeenCalled();
  });

  it('sin afirmaciones no hay aviso ni registro', () => {
    modelo.user = { id: 7 };
    montar(datos([]));
    expect(screen.queryByText(AVISO)).toBeNull();
    expect(modelo.escribir).not.toHaveBeenCalled();
  });

  it('una afirmación que ya viste no se vuelve a anotar', () => {
    modelo.user = { id: 7 };
    montar(datos([afirmacion(ID, { miExpuesta: true }), afirmacion(OTRA)]));
    expect(modelo.escribir).toHaveBeenCalledTimes(1);
    expect(modelo.escribir).toHaveBeenCalledWith(
      'post',
      `/api/v1/fichas/afirmaciones/${OTRA}/exposicion`,
    );
  });
});

describe('Afirmaciones: un solo estado vacío y sin ceros', () => {
  it('sin afirmaciones hay un solo mensaje, y no una «lectura» de nada', () => {
    modelo.user = { id: 7 };
    montar(datos([]));
    expect(screen.getByText(/Todavía no hay afirmaciones\./)).toBeVisible();
    expect(screen.queryByText(/Hace falta más conversación/)).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Lectura de las respuestas' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Método y límites' })).toBeNull();
  });

  it('el cero se dice en palabras', () => {
    montar(datos([afirmacion(ID, { respuestas: 0 })]));
    expect(screen.getByText(/Todavía nadie vio ni respondió estas afirmaciones\./)).toBeVisible();
    expect(screen.getByText(/Todavía nadie respondió; el desglose público/)).toBeVisible();
    expect(screen.queryByText(/\b0 (cuentas|respuestas|incluidas)/)).toBeNull();
  });

  it('con desglose público, los acuerdos en cero también van en palabras', () => {
    montar(datos([afirmacion(ID, { acuerdo: 6, desacuerdo: 0, paso: 1, respuestas: 7 })]));
    expect(screen.getByText('6 acuerdos · ningún desacuerdo · 1 pase.')).toBeVisible();
  });

  it('cuenta cuántas cuentas entran en la lectura, en un solo renglón', () => {
    montar(datos([afirmacion(ID)], { ...vacio, participantes: 12, incluidos: 9 }));
    expect(
      screen.getByText(
        '12 cuentas vieron o respondieron estas afirmaciones. 9 respondieron lo suficiente como para entrar en la lectura por grupos.',
      ),
    ).toBeVisible();
  });
});

describe('Afirmaciones: método y límites', () => {
  const exploratorio: AnalisisOpiniones = {
    ...vacio,
    estado: 'exploratorio',
    motivo: 'Estos grupos describen respuestas en esta ficha.',
    participantes: 20,
    incluidos: 18,
    afirmaciones: 3,
    grupos: [
      { nombre: 'Mirada A', cuentas: 9 },
      { nombre: 'Mirada B', cuentas: 9 },
    ],
    condiciones: [{ afirmacion: ID, apoyo: 0.342, grupos: [] }],
  };

  it('explica el indicador una vez, en una frase, y no lo deja suelto en cada afirmación', () => {
    montar(datos([afirmacion(ID, { texto: 'Una escuela cerca' })], exploratorio));
    const seccion = requerido(
      screen.getByRole('heading', { name: 'Método y límites' }).parentElement,
    );
    expect(seccion).toHaveTextContent(
      'El indicador de apoyo distribuido va de 0 a 1 y es alto solo cuando los dos grupos coinciden en estar de acuerdo; sirve para comparar afirmaciones dentro de esta lectura y no es una votación.',
    );
    expect(seccion).toHaveTextContent('Una escuela cerca · 0,34');
    expect(seccion).not.toHaveTextContent('0.342');
    expect(screen.queryByText(/Indicador de apoyo distribuido:/)).toBeNull();
  });

  it('el detalle técnico queda plegado y el método y los límites a la vista', () => {
    montar(datos([afirmacion(ID)], exploratorio));
    expect(screen.getByText(/El pase cuenta como respuesta/)).toBeVisible();
    const detalle = screen.getByText('Detalle técnico del método').closest('details');
    expect(detalle).not.toHaveAttribute('open');
  });
});

describe('Afirmaciones: acciones', () => {
  it('quien no ingresó va a ingresar y vuelve a esta misma parte, no a Mi espacio', () => {
    montar(datos([afirmacion(ID)]));
    const enlace = screen.getByRole('link', { name: 'Ingresar para responder o proponer' });
    expect(enlace).toHaveAttribute('href', '/ingresar?volver=%2Ffichas%2Fx');
    expect(enlace.getAttribute('href')).not.toContain('mi-espacio');
  });

  it('proponer dice cuánto falta mientras no alcance, y no hace nada hasta entonces', () => {
    modelo.user = { id: 7 };
    montar(datos([afirmacion(ID)]));
    const boton = screen.getByRole('button', { name: 'Proponer esta afirmación' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Faltan 10 caracteres.')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Una condición o idea para conversar'), {
      target: { value: 'Una idea' },
    });
    expect(screen.getByText('Faltan 2 caracteres.')).toBeVisible();
    fireEvent.click(boton);
    expect(modelo.mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Una condición o idea para conversar'), {
      target: { value: 'Una idea para conversar' },
    });
    expect(boton).not.toHaveAttribute('aria-disabled');
    fireEvent.click(boton);
    expect(modelo.mutate).toHaveBeenCalledTimes(1);
  });

  it('confirma cuando la afirmación se publicó y cuando se registró una respuesta', () => {
    modelo.user = { id: 7 };
    modelo.mutate.mockImplementation((_pedido: unknown, opciones?: { onSuccess?: () => void }) => {
      opciones?.onSuccess?.();
    });
    montar(datos([afirmacion(ID)]));
    fireEvent.click(requerido(screen.getAllByRole('button', { name: 'Estoy de acuerdo' })[0]));
    expect(screen.getByRole('status')).toHaveTextContent('Registramos tu respuesta.');
    fireEvent.change(screen.getByLabelText('Una condición o idea para conversar'), {
      target: { value: 'Una idea para conversar' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Proponer esta afirmación' }));
    expect(screen.getByRole('status')).toHaveTextContent('Publicamos tu afirmación.');
  });
});
