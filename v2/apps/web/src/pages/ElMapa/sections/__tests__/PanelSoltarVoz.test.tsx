import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz, type PublicacionVoz } from '../PanelSoltarVoz';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';
import type { VozSoltada } from '~/lib/queries/open-data';

import { useProvincias } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({ useProvincias: vi.fn() }));

const mockProvincias = vi.mocked(useProvincias);

/** Lo que devuelve el 201 cuando no hubo nada que engrosar. */
const RESPUESTA_OK: VozSoltada = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  yaExistia: false,
  precisionPublicada: 'province',
  engrosado: null,
};
const CORDOBA: LugarMapa = {
  id: 6,
  provinceId: 6,
  name: 'Córdoba',
  level: 'province',
  latitude: null,
  longitude: null,
};
const MENDOZA: LugarMapa = { ...CORDOBA, id: 14, provinceId: 14, name: 'Mendoza' };
const NACIONAL = {
  id: 'e2d1c0b9-0000-4000-8000-000000000001',
  slug: 'mi-argentina-ideal',
  revision: 1,
  contrato: {
    titulo: 'Mi Argentina ideal',
    responsable: 'Equipo ¡BASTA!',
    fechaDevolucion: '2099-12-20',
  },
};

const enviar = vi.fn<PublicacionVoz['enviar']>();

function montar(extra: Partial<PublicacionVoz> = {}, contexto?: LugarMapa) {
  const publicacion: PublicacionVoz = { enviar, pendiente: false, error: null, ...extra };
  const dibujar = (p: PublicacionVoz, c?: LugarMapa) => (
    <PanelSoltarVoz publicacion={p} {...(c ? { contexto: c } : {})} />
  );
  const vista = render(dibujar(publicacion, contexto));
  return {
    ...vista,
    volver: (p: Partial<PublicacionVoz> = {}, c?: LugarMapa) => {
      vista.rerender(dibujar({ ...publicacion, ...p }, c));
    },
  };
}

function completar() {
  fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
  fireEvent.change(screen.getByLabelText('Tu aporte'), {
    target: { value: 'Trenes que lleguen.' },
  });
  fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
}
const publicarBtn = () => screen.getByRole('button', { name: /Publicar mi aporte/ });

describe('PanelSoltarVoz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enviar.mockReset();
    window.localStorage.clear();
    mockProvincias.mockReturnValue({
      data: [
        { id: 6, name: 'Córdoba', isoCode: 'AR-X' },
        { id: 14, name: 'Mendoza', isoCode: 'AR-M' },
      ],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
  });

  it('ofrece los NUEVE tipos del canon y el botón nace bloqueado, diciendo qué falta', () => {
    montar();

    for (const tipo of [
      'basta',
      'necesidad',
      'recurso',
      'práctica',
      'saber',
      'sueño',
      'propuesta',
      'compromiso',
      'pregunta',
    ]) {
      expect(screen.getByRole('button', { name: tipo, pressed: false })).toBeInTheDocument();
    }
    // `valor` salió del canon: un valor no tiene coordenada.
    expect(screen.queryByRole('button', { name: 'valor' })).not.toBeInTheDocument();
    // Bloqueado con `aria-disabled` y no con `disabled`: sigue en el orden del teclado.
    expect(publicarBtn()).toHaveAttribute('aria-disabled', 'true');
    expect(publicarBtn()).not.toBeDisabled();
    expect(
      screen.getByText(
        'Falta: elegí de qué estás hablando · escribí algo · marcá que querés publicarla.',
      ),
    ).toBeInTheDocument();
  });

  it('sin confirmar publicación el botón sigue bloqueado y el envío no sale', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), {
      target: { value: 'Trenes que lleguen.' },
    });

    // Nadie licencia obra ajena por default: sin la marca, la fila saldría en
    // el volcado público sin `texto`, y eso tiene que ser una decisión dicha.
    expect(publicarBtn()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Falta: marcá que querés publicarla.')).toBeInTheDocument();
    fireEvent.click(publicarBtn());
    expect(enviar).not.toHaveBeenCalled();
  });

  it('con tipo + texto + provincia manda el payload correcto', () => {
    montar();

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), {
      target: { value: '  Trenes que lleguen. ' },
    });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
    fireEvent.click(screen.getByLabelText(/cedo el texto para que se pueda citar/i));
    fireEvent.click(publicarBtn());

    expect(enviar).toHaveBeenCalledWith(
      expect.objectContaining({
        contrato: 'basta-senal/v1',
        tipo: 'sueño',
        texto: 'Trenes que lleguen.',
        provinceId: 6,
        cedeLicencia: true,
        casa: 'sinRespuesta',
      }),
      expect.anything(),
    );
    // El uuid de idempotencia lo pone el cliente y tiene que ser uno de verdad.
    expect(enviar.mock.calls[0]?.[0].idLocal).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('doble submit mientras está pendiente no duplica el envío', () => {
    const { container, volver } = montar();
    const form = container.querySelector('form');
    if (!form) throw new Error('form no encontrado');

    completar();
    fireEvent.submit(form);
    expect(enviar).toHaveBeenCalledTimes(1);

    // El submit va directo sobre el <form>, sin pasar por el clic del botón:
    // prueba el guard de adentro de onSubmit, no el bloqueo del DOM.
    volver({ pendiente: true });
    fireEvent.submit(form);

    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it('con una campaña que no recibe aportes el botón explica por qué y no envía', () => {
    montar({ bloqueo: 'Esta edición no recibe aportes ahora. Conservamos tu texto.' });
    completar();

    expect(publicarBtn()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Esta edición no recibe aportes ahora/)).toBeInTheDocument();
    fireEvent.click(publicarBtn());
    expect(enviar).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Tu aporte')).toHaveValue('Trenes que lleguen.');
  });

  it('al 201: sello Recibido + despertar + formulario limpio, con la campaña que lo recibió', () => {
    enviar.mockImplementation((_input, ok) => {
      ok(RESPUESTA_OK, NACIONAL);
    });
    montar();

    completar();
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(publicarBtn());

    expect(screen.getByText('Recibido')).toBeInTheDocument();
    expect(
      screen.getByText('Quedó en Córdoba. Desde su página lo seguís o lo retirás.'),
    ).toBeInTheDocument();
    // La frase sale de los datos de la campaña, no está escrita en la pantalla.
    expect(
      screen.getByText(/Tu aporte entró en la campaña nacional «Mi Argentina ideal»/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Equipo ¡BASTA!, que la coordina/)).toBeInTheDocument();
    expect(screen.getByText(/20 de diciembre de 2099/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi aporte y cómo sigue →' })).toHaveAttribute(
      'href',
      `/senal/${RESPUESTA_OK.idPublico}`,
    );
    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    expect(screen.getByLabelText('Tu aporte')).toHaveValue('');
  });

  it('el aporte siguiente no sale con los permisos del anterior: publicar, ceder, tipo y casa se reinician', () => {
    enviar.mockImplementation((_input, ok) => {
      ok(RESPUESTA_OK, null);
    });
    montar();

    completar();
    fireEvent.click(screen.getByLabelText(/cedo el texto para que se pueda citar/i));
    fireEvent.click(screen.getByLabelText(/Sí, la de otro/));
    fireEvent.click(publicarBtn());
    expect(enviar).toHaveBeenCalledTimes(1);

    // Todo lo que habilitaba la publicación irrevocable vuelve a su estado de partida.
    expect(screen.getByLabelText(/Quiero publicar este aporte/i)).not.toBeChecked();
    expect(screen.getByLabelText(/cedo el texto para que se pueda citar/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Prefiero no decir/)).toBeChecked();
    expect(screen.getByLabelText(/Sí, la de otro/)).not.toBeChecked();
    for (const tipo of ['sueño', 'basta'])
      expect(screen.getByRole('button', { name: tipo, pressed: false })).toBeInTheDocument();
    expect(publicarBtn()).toHaveAttribute('aria-disabled', 'true');

    // Y aunque se escriba otro aporte, no sale sin volver a marcar la publicación.
    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), { target: { value: 'Otro aporte.' } });
    fireEvent.click(publicarBtn());
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it('sin provincia, la confirmación es honesta: cuenta pero no cae en el mapa', () => {
    enviar.mockImplementation((_input, ok) => {
      ok(RESPUESTA_OK, null);
    });
    montar();

    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
    fireEvent.click(publicarBtn());

    expect(
      screen.getByText(
        'No indicaste una provincia, así que cuenta pero no aparece en un lugar del mapa.',
      ),
    ).toBeInTheDocument();
    // Sin campaña lo dice tal cual es: nadie se comprometió a responder.
    expect(
      screen.getByText(/Por ahora no está en ninguna campaña, así que nadie se comprometió/),
    ).toBeInTheDocument();
  });

  it('muestra el error que le pasa quien publica', () => {
    montar({ error: 'Demasiadas solicitudes. Intentá de nuevo en un momento.' });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Demasiadas solicitudes. Intentá de nuevo en un momento.',
    );
  });

  it('permite no licenciar el texto y conserva el identificador al reintentar el mismo envío', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), { target: { value: 'Agua accesible.' } });
    fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
    fireEvent.click(publicarBtn());
    fireEvent.click(publicarBtn());
    const primero = enviar.mock.calls[0]?.[0];
    const segundo = enviar.mock.calls[1]?.[0];
    expect(primero?.cedeLicencia).toBe(false);
    expect(segundo?.idLocal).toBe(primero?.idLocal);
    fireEvent.change(screen.getByLabelText('Tu aporte'), { target: { value: 'Otro aporte.' } });
    fireEvent.click(publicarBtn());
    expect(enviar.mock.calls[2]?.[0].idLocal).not.toBe(primero?.idLocal);
  });

  it('sigue al lugar del mapa: si el mapa pasa a otro lugar, el formulario lo toma', () => {
    const { volver } = montar({}, CORDOBA);
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('6');

    // El mismo lugar con otra identidad de objeto no pisa lo que se eligió a mano.
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '' } });
    volver({}, { ...CORDOBA });
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('');

    volver({}, MENDOZA);
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('14');
    completar();
    fireEvent.click(publicarBtn());
    expect(enviar.mock.calls[0]?.[0].provinceId).toBe(14);

    // Si el mapa deja de mirar un lugar, el aporte vuelve a ser de todo el país.
    volver({}, undefined);
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('');
  });
});
