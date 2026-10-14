import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Alternativas } from '../Alternativas';
import { Pruebas } from '../Pruebas';

import type { DisenoFicha } from '@v2/shared';

const ID = '34b57499-a167-4dda-ae15-f0e0c3c67720';
const modelo = vi.hoisted(() => ({ user: null as null | { id: number }, mutate: vi.fn() }));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: modelo.mutate, isPending: false, error: null }),
}));

const alternativa = {
  id: ID,
  titulo: 'Escuela de barrio abierta de noche',
  funcionamiento: 'Abre tres noches por semana.',
  resultado: 'Se puede estudiar sin viajar.',
  dependencias: '',
  presupuesto: '',
  prueba: 'Un mes con un grupo.',
  criterioPausa: 'Si nadie viene, paramos.',
};
const prueba = {
  id: ID,
  titulo: 'Un mes de escuela nocturna',
  alternativaId: ID,
  plazo: '2099-12-01',
  alcance: 'Un barrio, veinte vecinos.',
  responsableNombre: null,
  estado: 'propuesta' as const,
  revision: 1,
  puedoGestionar: true,
  puedoRevisar: false,
  eventos: [
    {
      estado: 'propuesta',
      observacion: 'Se propone probar un mes.',
      evidencia: [],
      fecha: '2026-10-15T12:00:00.000Z',
    },
  ],
};
const datos = (cambios: Partial<DisenoFicha> = {}): DisenoFicha => ({
  afirmaciones: [],
  alternativas: [],
  pruebas: [],
  ...cambios,
});
const ingreso = '/ingresar?volver=%2Ffichas%2Fx';

beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
});

describe('Alternativas', () => {
  it('lleva un título llano y un estado vacío que dice qué falta', () => {
    render(<Alternativas fichaId={ID} datos={datos()} hrefIngreso={ingreso} />);
    expect(screen.getByRole('heading', { name: 'Alternativas para comparar' })).toBeVisible();
    expect(screen.getByText(/Todavía no hay alternativas\./)).toBeVisible();
    expect(screen.queryByText(/posible una misma vida|El diseño sigue abierto/)).toBeNull();
    expect(screen.getByRole('link', { name: 'Ingresá para proponer una' })).toHaveAttribute(
      'href',
      ingreso,
    );
  });

  it('antes de publicar marca cada campo que falta, junto al campo, y no envía nada', () => {
    modelo.user = { id: 1 };
    render(<Alternativas fichaId={ID} datos={datos()} hrefIngreso={ingreso} />);
    fireEvent.click(screen.getByRole('button', { name: 'Proponer una alternativa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar alternativa' }));
    const nombre = screen.getByLabelText('Nombre de la alternativa');
    expect(nombre).toHaveAttribute('aria-invalid', 'true');
    expect(nombre.getAttribute('aria-describedby')).toBe(
      screen.getByText('Poné un nombre de al menos 5 caracteres.').id,
    );
    expect(screen.getByText('Contá cómo funcionaría, en al menos 20 caracteres.')).toBeVisible();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });

  it('con todo completo publica y confirma', () => {
    modelo.user = { id: 1 };
    modelo.mutate.mockImplementation((_p: unknown, o?: { onSuccess?: () => void }) => {
      o?.onSuccess?.();
    });
    render(<Alternativas fichaId={ID} datos={datos()} hrefIngreso={ingreso} />);
    fireEvent.click(screen.getByRole('button', { name: 'Proponer una alternativa' }));
    const llenar = (etiqueta: string, valor: string) => {
      fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
    };
    llenar('Nombre de la alternativa', 'Escuela abierta');
    llenar('Cómo funcionaría', 'Abre tres noches por semana en la sala del barrio.');
    llenar('Qué condición de vida haría posible', 'Estudiar sin viajar.');
    llenar('Qué prueba pequeña permitiría aprender', 'Un mes con un grupo chico.');
    llenar('Qué resultado nos haría detenernos o rediseñar', 'Si nadie viene.');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar alternativa' }));
    expect(modelo.mutate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Publicamos la alternativa.');
  });

  it('muestra las alternativas ya publicadas', () => {
    render(
      <Alternativas
        fichaId={ID}
        datos={datos({ alternativas: [alternativa] })}
        hrefIngreso={ingreso}
      />,
    );
    expect(screen.getByRole('heading', { name: alternativa.titulo })).toBeVisible();
    expect(screen.getAllByText('Todavía pendiente de desarrollo.')).toHaveLength(2);
  });
});

describe('Pruebas', () => {
  it('pide revisar otra versión antes de enviar una observación que se estaba escribiendo', () => {
    modelo.user = { id: 1 };
    const { rerender } = render(
      <Pruebas
        datos={datos({ alternativas: [alternativa], pruebas: [prueba] })}
        hrefIngreso={ingreso}
      />,
    );
    fireEvent.change(screen.getByLabelText('Qué observamos y cómo lo sabemos'), {
      target: { value: 'Aceptamos preparar el encuentro.' },
    });
    fireEvent.change(screen.getByLabelText('Firma pública de responsabilidad'), {
      target: { value: 'Equipo del barrio' },
    });
    rerender(
      <Pruebas
        datos={datos({ alternativas: [alternativa], pruebas: [{ ...prueba, revision: 2 }] })}
        hrefIngreso={ingreso}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Registrar este paso' }));
    expect(modelo.mutate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Qué observamos y cómo lo sabemos')).toHaveValue(
      'Aceptamos preparar el encuentro.',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisé la nueva versión; conservar mi observación' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Registrar este paso' }));
    expect(modelo.mutate.mock.calls.at(-1)?.[0]).toMatchObject({ cuerpo: { revision: 2 } });
  });
  it('explica una sola vez qué es una prueba y no la confunde con evidencia', () => {
    render(<Pruebas datos={datos()} hrefIngreso={ingreso} />);
    expect(screen.getByRole('heading', { name: 'Pruebas chicas para aprender' })).toBeVisible();
    expect(
      screen.getAllByText(
        /Una prueba es un experimento acotado: tiene un lugar, personas a cargo y una fecha/,
      ),
    ).toHaveLength(1);
    expect(screen.getByText(/Todavía no hay pruebas\./)).toBeVisible();
    expect(screen.queryByText(/El diseño aprende|toca la vida/)).toBeNull();
  });

  it('muestra la fecha de revisión y la de cada paso en castellano, y el estado con su nombre', () => {
    render(
      <Pruebas
        datos={datos({ alternativas: [alternativa], pruebas: [prueba] })}
        hrefIngreso={ingreso}
      />,
    );
    expect(
      screen.getByText(/Fecha prevista de revisión: 1 de diciembre de 2099 · versión 1/),
    ).toBeVisible();
    expect(screen.getAllByText('Prueba propuesta').length).toBeGreaterThan(0);
    expect(screen.getByText(/· \d+ de octubre de 2026/)).toBeVisible();
    expect(screen.queryByText(/2099-12-01|T12:00/)).toBeNull();
    expect(screen.queryByText('propuesta')).toBeNull();
  });

  it('valida el nombre y el alcance con mensajes en castellano, junto a cada campo', () => {
    modelo.user = { id: 1 };
    render(<Pruebas datos={datos({ alternativas: [alternativa] })} hrefIngreso={ingreso} />);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar propuesta de prueba' }));
    expect(screen.getByText('Elegí la alternativa que se pondría a prueba.')).toBeVisible();
    expect(screen.getByText('Poné un nombre de al menos 5 caracteres.')).toBeVisible();
    expect(
      screen.getByText('Contá dónde, con quién y a qué escala, en al menos 10 caracteres.'),
    ).toBeVisible();
    expect(screen.getByText('Elegí la fecha en que vamos a revisar qué pasó.')).toBeVisible();
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(modelo.mutate).not.toHaveBeenCalled();
  });

  it('con los datos completos registra la propuesta y lo confirma', () => {
    modelo.user = { id: 1 };
    modelo.mutate.mockImplementation((_p: unknown, o?: { onSuccess?: () => void }) => {
      o?.onSuccess?.();
    });
    render(<Pruebas datos={datos({ alternativas: [alternativa] })} hrefIngreso={ingreso} />);
    fireEvent.change(screen.getByLabelText('Alternativa'), { target: { value: ID } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Un mes de prueba' } });
    fireEvent.change(screen.getByLabelText('Dónde, con quién y a qué escala'), {
      target: { value: 'Un barrio, veinte vecinos.' },
    });
    fireEvent.change(screen.getByLabelText('Fecha de revisión'), {
      target: { value: '2099-12-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar propuesta de prueba' }));
    expect(modelo.mutate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Registramos la propuesta de prueba.');
  });

  it('registrar un paso dice por qué todavía no se puede y confirma el paso cuando se registra', () => {
    modelo.user = { id: 1 };
    modelo.mutate.mockImplementation((_p: unknown, o?: { onSuccess?: () => void }) => {
      o?.onSuccess?.();
    });
    render(
      <Pruebas
        datos={datos({ alternativas: [alternativa], pruebas: [prueba] })}
        hrefIngreso={ingreso}
      />,
    );
    const boton = screen.getByRole('button', { name: 'Registrar este paso' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Faltan 15 caracteres en lo que observamos.')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Qué observamos y cómo lo sabemos'), {
      target: { value: 'Aceptamos preparar el encuentro.' },
    });
    expect(screen.getByText('Falta la firma pública de responsabilidad.')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Firma pública de responsabilidad'), {
      target: { value: 'Equipo del barrio' },
    });
    fireEvent.click(boton);
    expect(modelo.mutate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Registramos el paso: responsabilidad aceptada.',
    );
  });
});
