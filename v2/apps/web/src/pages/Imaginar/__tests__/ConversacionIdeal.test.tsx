import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConversacionIdeal } from '../ConversacionIdeal';

import type { LugarMapa } from '../../ElMapa/instrumento/BusquedaTerritorial';
import type { ContribucionInput } from '@v2/shared';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

const m = vi.hoisted(() => ({
  user: null as null | { id: number },
  campanas: new Map<string, unknown>(),
  mutate: vi.fn(),
  guardar: vi.fn(() => Promise.resolve()),
  borrar: vi.fn(() => Promise.resolve()),
  leer: vi.fn(() => Promise.resolve([] as unknown[])),
  proveedor: null as string | null,
  lectura: undefined as undefined | { lectura: string; pregunta: string },
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/api', () => ({
  api: { get: vi.fn(() => Promise.resolve({ proveedor: m.proveedor, temas: [] })) },
}));
vi.mock('~/lib/participacion/borradores', () => ({
  leerBorradores: m.leer,
  guardarBorrador: m.guardar,
  borrarBorrador: m.borrar,
}));
vi.mock('~/lib/queries/participacion', () => ({
  usePublicarAporte: () => ({ mutate: m.mutate, isPending: false, error: null }),
  useLecturaAsistida: () => ({ mutate: vi.fn(), isPending: false, data: m.lectura }),
  useCampana: (pedida?: string) => ({
    data: pedida ? m.campanas.get(pedida) : undefined,
    isPending: false,
    isError: Boolean(pedida) && !m.campanas.get(pedida ?? ''),
  }),
}));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Buscador de lugares</p>,
}));
vi.mock('~/components/participacion/Seguir', () => ({
  Seguir: ({ objeto }: { objeto: string }) => <p>Seguir la campaña {objeto}</p>,
}));

const nacional = {
  id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
  slug: 'mi-argentina-ideal',
  revision: 1,
  estado: 'abierta',
  contrato: {
    titulo: 'Mi Argentina ideal',
    pregunta: '¿Qué sería posible en tu vida?',
    responsable: 'Equipo ¡BASTA!',
    fechaDevolucion: '2099-12-20',
  },
};
const otra = {
  id: 'af81507f-f3fb-4a80-99f3-28f0f2377947',
  slug: 'cuidar-la-comunidad',
  revision: 3,
  estado: 'abierta',
  contrato: {
    titulo: 'Cuidar en nuestra comunidad ideal',
    pregunta: '¿Cómo querés cuidar y que te cuiden?',
    responsable: 'Equipo de cuidado',
    fechaDevolucion: '2099-11-05',
  },
};
const mendoza: LugarMapa = {
  id: 50,
  provinceId: 50,
  name: 'Mendoza',
  level: 'province',
  latitude: null,
  longitude: null,
};
const cordoba: LugarMapa = { ...mendoza, id: 14, provinceId: 14, name: 'Córdoba' };
const recibo: ReciboParticipacion = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'sueño',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
};

function montar(props: Parameters<typeof ConversacionIdeal>[0] = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const dibujar = (p: typeof props) => (
    <QueryClientProvider client={qc}>
      <ConversacionIdeal {...p} />
    </QueryClientProvider>
  );
  const vista = render(dibujar(props));
  return {
    ...vista,
    con: (p: typeof props) => {
      vista.rerender(dibujar(p));
    },
  };
}
const escribir = (valor: string) => {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: valor } });
};
const pulsar = (nombre: string | RegExp) => {
  fireEvent.click(screen.getByRole('button', { name: nombre }));
};
/** Recorre las tres preguntas hasta la revisión, dejando abiertas las dos últimas. */
function hastaLaRevision(texto = 'Quiero aprender cerca de mi casa.') {
  escribir(texto);
  pulsar('Seguir imaginando');
  pulsar('Dejar esta pregunta abierta');
  pulsar('Dejar esta pregunta abierta');
}
function aceptar() {
  fireEvent.click(screen.getByLabelText('Este texto dice lo que quiero decir.'));
  fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/));
}
const enviados = () => m.mutate.mock.calls.map(([aporte]) => aporte as ContribucionInput);

beforeEach(() => {
  vi.clearAllMocks();
  m.user = null;
  m.proveedor = null;
  m.lectura = undefined;
  m.campanas.clear();
  m.campanas.set('mi-argentina-ideal', nacional);
  m.campanas.set(otra.id, otra);
  m.campanas.set(otra.slug, otra);
  m.leer.mockImplementation(() => Promise.resolve([]));
  m.mutate.mockImplementation(
    (_aporte: unknown, opciones?: { onSuccess?: (r: ReciboParticipacion) => void }) => {
      opciones?.onSuccess?.(recibo);
    },
  );
  window.localStorage.clear();
  window.history.replaceState(null, '', '/el-mapa?participar=aportar');
});

describe('Las tres preguntas: la primera pantalla', () => {
  it('dice cuánto dura, que no hace falta cuenta y que nada se publica sin revisar', () => {
    montar();
    expect(
      screen.getByText(
        'Contanos qué querrías que fuera posible en tu vida. Son tres preguntas, no necesitás cuenta y nada se publica hasta que lo revises.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Pregunta 1 de 3')).toBeInTheDocument();
  });

  it('el botón no queda mudo: explica qué falta, sigue en el teclado y no avanza', () => {
    montar();
    const seguir = screen.getByRole('button', { name: 'Seguir imaginando' });
    expect(seguir).toHaveAttribute('aria-disabled', 'true');
    expect(seguir).not.toBeDisabled();
    expect(screen.getByText('Escribí al menos una frase para seguir.')).toBeInTheDocument();
    fireEvent.click(seguir);
    expect(screen.getByText('Pregunta 1 de 3')).toBeInTheDocument();
    escribir('Una escena.');
    expect(screen.getByRole('button', { name: 'Seguir imaginando' })).not.toHaveAttribute(
      'aria-disabled',
    );
    expect(screen.queryByText('Escribí al menos una frase para seguir.')).not.toBeInTheDocument();
  });

  it('no lleva el foco al título al aparecer, solo cuando cambia el paso', () => {
    montar();
    expect(document.body).toHaveFocus();
    escribir('Una escena.');
    pulsar('Seguir imaginando');
    expect(screen.getByText('Pregunta 2 de 3')).toBeInTheDocument();
    const titulo = screen.getByRole('heading', { name: '¿Por qué eso es importante para vos?' });
    expect(titulo).toHaveFocus();
    // El foco se mueve, pero el título no dibuja el anillo de :focus-visible.
    expect(titulo).toHaveClass('focus:outline-none');
  });

  it('la barra tiene tantos segmentos como preguntas', () => {
    const { container } = montar();
    expect(container.querySelectorAll('[aria-hidden] > span')).toHaveLength(3);
  });

  it('ofrece el aporte puntual solo si quien lo monta sabe llevar hasta ahí', () => {
    const vista = montar();
    expect(screen.queryByRole('button', { name: /Cargalo directo/ })).not.toBeInTheDocument();
    const irADirecto = vi.fn();
    vista.con({ irADirecto });
    fireEvent.click(
      screen.getByRole('button', {
        name: '¿Querés contar algo puntual — un problema, una necesidad, algo que ya funciona? Cargalo directo →',
      }),
    );
    expect(irADirecto).toHaveBeenCalledOnce();
  });
});

describe('Revisar antes de publicar', () => {
  it('el campo «Mi aporte» crece con el texto: mínimo de cinco filas, tope antes de scrollear', () => {
    montar();
    escribir('Una escena.');
    pulsar('Seguir imaginando');
    pulsar('Seguir imaginando');
    pulsar('Revisar lo que voy a compartir');

    const campo = screen.getByLabelText<HTMLTextAreaElement>('Mi aporte');
    expect(campo).toHaveAttribute('rows', '5');
    expect(campo).toHaveClass('max-h-[28rem]', 'overflow-y-auto', 'resize-none');
  });

  it('con respuestas que juntas pasan el límite ofrece un texto recortado donde termina una frase', () => {
    montar();
    const larga = 'Quiero poder caminar tranquila por mi barrio. '.repeat(40).trim();
    escribir(larga);
    pulsar('Seguir imaginando');
    escribir(larga);
    pulsar('Seguir imaginando');
    escribir(larga);
    pulsar('Revisar lo que voy a compartir');

    const revision = screen.getByRole('heading', { name: 'Revisá lo que vas a compartir' });
    expect(revision).toHaveFocus();
    expect(revision).toHaveClass('focus:outline-none');
    expect(
      screen.getByText('Esto es lo que se va a publicar. Podés cambiarlo o recortarlo.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lo recortamos para que entre: revisalo.')).toBeInTheDocument();
    const texto = screen.getByLabelText<HTMLTextAreaElement>('Mi aporte').value;
    expect(texto.length).toBeLessThanOrEqual(2000);
    expect(texto.endsWith('.')).toBe(true);
    expect(screen.queryByText(/Te pasás por/)).not.toBeInTheDocument();

    // Con el texto recortado se puede publicar sin tener que descubrir por qué no andaba.
    aceptar();
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('si se pasa de largo lo dice con los caracteres que sobran y bloquea la publicación', () => {
    montar();
    hastaLaRevision();
    fireEvent.change(screen.getByLabelText('Mi aporte'), { target: { value: 'a'.repeat(2100) } });
    aceptar();
    expect(screen.getByText('Te pasás por 100 caracteres.')).toBeInTheDocument();
    const publicar = screen.getByRole('button', { name: 'Publicar mi aporte' });
    expect(publicar).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Acortá el texto para poder publicarlo.')).toBeInTheDocument();
    fireEvent.click(publicar);
    expect(m.mutate).not.toHaveBeenCalled();
  });

  it('sin tildar las dos casillas dice qué falta, y la casilla de origen y el cierre hablan claro', () => {
    montar();
    hastaLaRevision();
    expect(screen.getByText('Marcá las dos casillas para publicar.')).toBeInTheDocument();
    expect(
      screen.getByText('Compartir también mis tres respuestas, para que se vea de dónde salió.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Si ingresaste, el aporte queda en tu cuenta y lo podés editar o retirar desde Mi espacio. Tu nombre no se publica.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Lugar:/)).toBeInTheDocument();
    expect(screen.queryByText(/Ámbito/)).not.toBeInTheDocument();
  });

  it('la lectura asistida se muestra aparte y no pisa lo que la persona escribió hasta que la elige', () => {
    m.proveedor = 'Groq';
    m.lectura = {
      lectura: 'Quiero aprender cerca de mi casa, con tiempo para cuidar.',
      pregunta: '¿Con quién?',
    };
    montar();
    hastaLaRevision('Mi primera versión.');
    return waitFor(() => {
      expect(screen.getByText('Versión sugerida')).toBeInTheDocument();
    }).then(() => {
      // La sugerencia no se coló en el campo.
      expect(screen.getByLabelText('Mi aporte')).toHaveValue('Mi primera versión.');
      fireEvent.change(screen.getByLabelText('Mi aporte'), {
        target: { value: 'Mi versión editada.' },
      });
      expect(screen.getByLabelText('Mi aporte')).toHaveValue('Mi versión editada.');
      fireEvent.click(screen.getByRole('button', { name: 'Usar esta versión' }));
      expect(screen.getByLabelText('Mi aporte')).toHaveValue(
        'Quiero aprender cerca de mi casa, con tiempo para cuidar.',
      );
      expect(screen.queryByText(/Groq/)).not.toBeInTheDocument();
    });
  });
});

describe('A qué campaña entra el aporte', () => {
  it('sin campaña pedida entra en la nacional, con su edición, y lo cuenta el recibo con sus datos', () => {
    montar();
    hastaLaRevision();
    aceptar();
    pulsar('Publicar mi aporte');
    expect(enviados()[0]).toMatchObject({ campanaId: nacional.id, edicion: 1 });
    expect(screen.getByRole('heading', { name: 'Tu aporte quedó publicado.' })).toHaveFocus();
    expect(
      screen.getByText(
        'Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Tu aporte entró en la campaña nacional «Mi Argentina ideal»\. Equipo ¡BASTA!, que la coordina, va a publicar una devolución el 20 de diciembre de 2099 con lo que se leyó\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(`Seguir la campaña ${nacional.id}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la campaña y su devolución' })).toHaveAttribute(
      'href',
      '/campanas/mi-argentina-ideal?edicion=1',
    );
  });

  it('antes de publicar, la revisión dice a dónde va el aporte', () => {
    montar();
    hastaLaRevision();
    expect(
      screen.getByText(/Tu aporte va a entrar en la campaña nacional «Mi Argentina ideal»/),
    ).toBeInTheDocument();
  });

  it('si la nacional no existe todavía publica sin campaña, no bloquea y lo dice sin prometer respuesta', () => {
    m.campanas.delete('mi-argentina-ideal');
    montar();
    hastaLaRevision();
    expect(screen.getByText(/se publica en el mapa, sin campaña/)).toBeInTheDocument();
    aceptar();
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).not.toHaveAttribute(
      'aria-disabled',
    );
    pulsar('Publicar mi aporte');
    expect(enviados()[0]).toMatchObject({ campanaId: null, edicion: null });
    expect(
      screen.getByText(
        'Tu aporte quedó publicado en el mapa. Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Seguir la campaña/)).not.toBeInTheDocument();
  });

  it('si la nacional no está abierta tampoco bloquea: publica sin campaña', () => {
    m.campanas.set('mi-argentina-ideal', { ...nacional, estado: 'pausada' });
    montar();
    hastaLaRevision();
    aceptar();
    pulsar('Publicar mi aporte');
    expect(enviados()[0]).toMatchObject({ campanaId: null, edicion: null });
  });

  it('con otra campaña en el enlace entra en esa, con su pregunta, y el recibo usa su nombre', () => {
    window.history.replaceState(
      null,
      '',
      `/el-mapa?participar=aportar&campana=${otra.slug}&edicion=3`,
    );
    montar();
    expect(
      screen.getByRole('heading', { name: '¿Cómo querés cuidar y que te cuiden?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Campaña:/)).toHaveTextContent('Cuidar en nuestra comunidad ideal');
    hastaLaRevision();
    aceptar();
    pulsar('Publicar mi aporte');
    expect(enviados()[0]).toMatchObject({ campanaId: otra.id, edicion: 3 });
    expect(
      screen.getByText(
        /Tu aporte entró en la campaña «Cuidar en nuestra comunidad ideal»\. Equipo de cuidado, que la coordina, va a publicar una devolución el 5 de noviembre de 2099 con lo que se leyó\./,
      ),
    ).toBeInTheDocument();
  });

  it('una campaña pedida que no recibe aportes bloquea con el motivo a la vista y conserva el texto', () => {
    m.campanas.set(otra.id, { ...otra, estado: 'cerrada' });
    window.history.replaceState(
      null,
      '',
      `/el-mapa?participar=aportar&campana=${otra.id}&edicion=3`,
    );
    montar();
    hastaLaRevision();
    aceptar();
    const publicar = screen.getByRole('button', { name: 'Publicar mi aporte' });
    expect(publicar).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByText(/Esta edición no recibe aportes ahora/).length).toBeGreaterThan(0);
    fireEvent.click(publicar);
    expect(m.mutate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Mi aporte')).toHaveValue('Quiero aprender cerca de mi casa.');
  });

  it('una campaña pedida que no se puede comprobar no se reemplaza por la nacional', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=aportar&campana=no-existe');
    montar();
    hastaLaRevision();
    aceptar();
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getAllByText(/No pudimos comprobar esta campaña/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/campaña nacional/)).not.toBeInTheDocument();
  });

  it('lee la campaña del enlace en vivo, sin quedarse con la del primer render', () => {
    montar();
    hastaLaRevision();
    aceptar();
    act(() => {
      window.history.replaceState(
        null,
        '',
        `/el-mapa?participar=aportar&campana=${otra.id}&edicion=3`,
      );
    });
    pulsar('Publicar mi aporte');
    expect(enviados()[0]).toMatchObject({ campanaId: otra.id, edicion: 3 });
  });
});

describe('Lo que pasa al publicar', () => {
  it('despierta el sitio y borra el borrador que se retomó', async () => {
    const borrador = {
      id: '7a1d3e52-9a1b-4c1e-8b6f-0d2f3a4b5c6d',
      fecha: '2026-10-01T10:00:00.000Z',
      frases: ['Una escena guardada.', '', ''],
      campanaId: null,
    };
    m.leer.mockImplementation(() => Promise.resolve([borrador]));
    window.history.replaceState(null, '', `/el-mapa?participar=aportar&borrador=${borrador.id}`);
    montar();
    expect(await screen.findByDisplayValue('Una escena guardada.')).toBeInTheDocument();
    expect(
      screen.getByText('Retomaste un borrador que estaba guardado solo en este dispositivo.'),
    ).toBeInTheDocument();
    pulsar('Seguir imaginando');
    pulsar('Dejar esta pregunta abierta');
    pulsar('Dejar esta pregunta abierta');
    aceptar();
    expect(window.localStorage.getItem('basta_despierto')).toBeNull();
    pulsar('Publicar mi aporte');
    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    // No queda un borrador viejo en Mi espacio del aporte que ya salió.
    expect(m.borrar).toHaveBeenCalledWith(borrador.id);
  });

  it('el borrador se carga una vez: que el enlace cambie por otra razón no pisa lo que se escribió', async () => {
    const borrador = {
      id: '7a1d3e52-9a1b-4c1e-8b6f-0d2f3a4b5c6d',
      fecha: '2026-10-01T10:00:00.000Z',
      frases: ['Una escena guardada.', '', ''],
      campanaId: null,
    };
    m.leer.mockImplementation(() => Promise.resolve([borrador]));
    window.history.replaceState(null, '', `/el-mapa?participar=aportar&borrador=${borrador.id}`);
    montar();
    await screen.findByDisplayValue('Una escena guardada.');
    escribir('Ya la reescribí.');
    // Elegir un lugar en el mapa cambia la dirección; el borrador sigue en ella.
    act(() => {
      window.history.pushState(
        null,
        '',
        `/el-mapa?participar=aportar&borrador=${borrador.id}&lugar=14`,
      );
    });
    expect(screen.getByRole('textbox')).toHaveValue('Ya la reescribí.');
    expect(m.leer).toHaveBeenCalledOnce();
  });

  it('guardar un borrador conserva la campaña y la edición con las que se empezó', async () => {
    window.history.replaceState(
      null,
      '',
      `/el-mapa?participar=aportar&campana=${otra.slug}&edicion=3`,
    );
    montar();
    escribir('Algo a medias.');
    pulsar('Guardar borrador en este dispositivo');
    await waitFor(() => {
      expect(m.guardar).toHaveBeenCalledWith(
        expect.objectContaining({
          frases: ['Algo a medias.', '', ''],
          campanaId: otra.slug,
          edicion: 3,
        }),
      );
    });
    expect(
      await screen.findByText(
        'Tu borrador quedó en este dispositivo. No se publicó ni se subió a una cuenta.',
      ),
    ).toBeInTheDocument();
  });

  it('«Sumar otro aporte» deja todo en blanco, vuelve a la primera pregunta y usa un identificador nuevo', () => {
    montar();
    hastaLaRevision('Primer aporte, con todas sus palabras.');
    aceptar();
    pulsar('Publicar mi aporte');
    const primero = enviados()[0];
    expect(primero).toBeDefined();

    pulsar('Sumar otro aporte');
    expect(screen.getByText('Pregunta 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(
      screen.getByRole('heading', {
        name: 'En tu Argentina ideal, ¿qué sería posible en tu vida?',
      }),
    ).toHaveFocus();

    // El mismo texto otra vez: sin un identificador nuevo el servidor devolvería el aporte anterior.
    hastaLaRevision('Primer aporte, con todas sus palabras.');
    // Los permisos del aporte anterior no se arrastran.
    expect(screen.getByLabelText(/Quiero publicar este aporte/)).not.toBeChecked();
    expect(screen.getByLabelText('Este texto dice lo que quiero decir.')).not.toBeChecked();
    aceptar();
    pulsar('Publicar mi aporte');
    const segundo = enviados()[1];
    expect(segundo?.senal.idLocal).toMatch(/^[0-9a-f-]{36}$/);
    expect(segundo?.senal.idLocal).not.toBe(primero?.senal.idLocal);
  });

  it('«Sumar otro aporte» saca el borrador del enlace', () => {
    window.history.replaceState(
      null,
      '',
      '/el-mapa?participar=aportar&borrador=abc&campana=cuidar-la-comunidad',
    );
    montar();
    hastaLaRevision();
    aceptar();
    pulsar('Publicar mi aporte');
    pulsar('Sumar otro aporte');
    const q = new URLSearchParams(window.location.search);
    expect(q.has('borrador')).toBe(false);
    expect(q.get('campana')).toBe('cuidar-la-comunidad');
  });

  it('el recibo ofrece volver al mapa, la Radiografía y sumar otro aporte', () => {
    const alMapa = vi.fn();
    montar({ alMapa });
    hastaLaRevision();
    aceptar();
    pulsar('Publicar mi aporte');
    fireEvent.click(screen.getByRole('button', { name: 'Verlo en el mapa' }));
    expect(alMapa).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Ver la Radiografía' })).toHaveAttribute(
      'href',
      '/la-radiografia',
    );
    expect(screen.getByRole('button', { name: 'Sumar otro aporte' })).toBeInTheDocument();
  });
});

describe('El lugar sigue al mapa', () => {
  it('publica con el lugar que se mira ahora y no con el del primer render', () => {
    const vista = montar({ lugarInicial: mendoza });
    hastaLaRevision();
    expect(screen.getByText(/Lugar:/)).toHaveTextContent('Mendoza');
    vista.con({ lugarInicial: cordoba });
    expect(screen.getByText(/Lugar:/)).toHaveTextContent('Córdoba');
    aceptar();
    pulsar('Publicar mi aporte');
    expect(enviados()[0]?.senal).toMatchObject({ provinceId: 14 });
    expect(
      within(screen.getByRole('region', { name: 'Imaginar mi Argentina' })).getByText(
        /Lugar: Córdoba\./,
      ),
    ).toBeInTheDocument();
  });
});
