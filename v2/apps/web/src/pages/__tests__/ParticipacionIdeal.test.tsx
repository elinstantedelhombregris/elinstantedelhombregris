import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { analizarOpiniones } from '@v2/civic-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Devolucion } from '../Campanas/Devolucion';
import { FasesContrato } from '../Campanas/FasesContrato';
import { FormularioCampana } from '../Campanas/Formulario';
import { RevisarDevolucion } from '../Campanas/RevisarDevolucion';
import { Afirmaciones } from '../Fichas/Afirmaciones';
import { Alternativas } from '../Fichas/Alternativas';
import { PanelDiseno } from '../Fichas/PanelDiseno';
import { Pruebas } from '../Fichas/Pruebas';
import { Asistencia } from '../Imaginar/Asistencia';
import { ConversacionIdeal } from '../Imaginar/ConversacionIdeal';
import { Recibo } from '../Imaginar/Recibo';
import { Revision } from '../Imaginar/Revision';
import { ControlesAnalisis } from '../LaRadiografia/sections/ControlesAnalisis';
import { BorradoresLocales } from '../MiEspacio/Borradores';
import { MisAportes } from '../MiEspacio/MisAportes';
import { Recuperar } from '../MiEspacio/Recuperar';

import type { CampanaPublica, DisenoFicha } from '@v2/shared';
import type { ReactElement } from 'react';

import { DescargarDatos } from '~/components/participacion/DescargarDatos';
import { Equipo } from '~/components/participacion/Equipo';
import { Seguir } from '~/components/participacion/Seguir';
const modelo = vi.hoisted(() => ({
  user: null as null | { id: number },
  mutate: vi.fn(),
  escribir: vi.fn(),
  guardar: vi.fn(),
  borradores: vi.fn(() => Promise.resolve([])),
  api: vi.fn(() => Promise.resolve([] as unknown)),
  campana: undefined as CampanaPublica | undefined,
  parametrosCampana: vi.fn(),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/api', () => ({ api: { get: modelo.api } }));
vi.mock('~/lib/participacion/borradores', () => ({
  leerBorradores: modelo.borradores,
  guardarBorrador: modelo.guardar,
  borrarBorrador: vi.fn(),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: modelo.mutate, isPending: false }),
  usePublicarAporte: () => ({ mutate: modelo.mutate, isPending: false }),
  useCampana: (id?: string, edicion?: number) => {
    modelo.parametrosCampana(id, edicion);
    // Como el servidor: la campaña responde por su id o por su slug; las demás, 404.
    const encontrada = id && (id === modelo.campana?.id || id === modelo.campana?.slug);
    return { data: encontrada ? modelo.campana : undefined };
  },
  useCampanas: () => ({ data: [] }),
  useMiEspacio: () => ({ data: { seguimientos: [] } }),
  useGuardarCampana: () => ({ mutate: modelo.mutate, isPending: false }),
  useLecturaAsistida: () => ({ mutate: modelo.mutate, isPending: false }),
  useDisenoFicha: () => ({
    data: {
      afirmaciones: [],
      alternativas: [],
      pruebas: [],
      analisisOpiniones: {
        estado: 'insuficiente',
        motivo: 'Hace falta conversación.',
        grupos: [],
        condiciones: [],
        participantes: 0,
        incluidos: 0,
        afirmaciones: 0,
        metodo: 'Exploratorio',
      },
    },
  }),
  escribir: modelo.escribir,
}));
vi.mock('../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Elegir un territorio oficial</p>,
}));
const id = '34b57499-a167-4dda-ae15-f0e0c3c67720';
const datos: DisenoFicha = {
  afirmaciones: [
    {
      id,
      texto: 'Aprender debe permitir cuidar a quienes queremos.',
      acuerdo: null,
      desacuerdo: null,
      paso: null,
      respuestas: 2,
      miRespuesta: null,
      miExpuesta: false,
      puedoRetirar: false,
    },
  ],
  alternativas: [],
  pruebas: [],
};
const campana: CampanaPublica = {
  id,
  slug: 'nuestra-pregunta',
  estado: 'abierta',
  revision: 2,
  puedoEditar: false,
  creadaEn: '2026-10-08T00:00:00Z',
  actualizadaEn: '2026-10-08T00:00:00Z',
  aportes: 0,
  devoluciones: [],
  historial: [],
  contrato: {
    titulo: 'Aprender cerca de quienes queremos',
    pregunta: '¿Qué vida sería posible?',
    proposito: 'Escuchar para imaginar juntos.',
    territorios: [],
    temas: [],
    participantes: 'Quienes quieran conversar.',
    canales: ['web'],
    responsable: 'Equipo de prueba',
    devolucion: 'Una lectura que podamos revisar.',
    fechaDevolucion: '2099-12-20',
    efecto: 'Ejercicio sin compromiso institucional.',
    usoDatos: 'Leeremos los aportes autorizados, respetando los permisos elegidos.',
    metodoLectura: 'El equipo publicará su lectura para que las personas puedan revisarla.',
    institucion: '',
    fases: [{ nombre: 'Imaginar', salida: 'Relatos revisados.', fecha: '2099-12-01' }],
  },
};
const montar = (ui: ReactElement) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
  modelo.campana = undefined;
  modelo.api.mockResolvedValue([]);
  window.history.replaceState(null, '', '/');
});
describe('La persona conserva el control de su voz', () => {
  it('la conversación guiada conserva la edición del enlace del mapa al publicar', () => {
    modelo.campana = campana;
    window.history.replaceState(null, '', `/el-mapa?campana=${id}&edicion=2&participar=aportar`);
    montar(<ConversacionIdeal />);
    expect(modelo.parametrosCampana).toHaveBeenCalledWith(id, 2);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quiero aprender cerca.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir imaginando' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByLabelText('Este texto dice lo que quiero decir.'));
    fireEvent.click(screen.getByRole('checkbox', { name: /Quiero publicar este aporte/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar mi aporte' }));
    expect(modelo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ campanaId: id, edicion: 2 }),
      expect.anything(),
    );
  });
  it('una edición inválida no convierte la conversación guiada en publicación nacional', () => {
    window.history.replaceState(null, '', '/el-mapa?edicion=otra&participar=aportar');
    montar(<ConversacionIdeal />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quiero aprender cerca.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir imaginando' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByLabelText('Este texto dice lo que quiero decir.'));
    fireEvent.click(screen.getByRole('checkbox', { name: /Quiero publicar este aporte/ }));
    const publicar = screen.getByRole('button', { name: 'Publicar mi aporte' });
    expect(publicar).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByText(/La edición del enlace no es válida/).length).toBeGreaterThan(0);
    fireEvent.click(publicar);
    expect(modelo.mutate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Mi aporte')).toHaveValue('Quiero aprender cerca.');
  });
  it('Imaginar empieza sin cuenta, admite preguntas abiertas y no publica antes de revisión', () => {
    montar(<ConversacionIdeal />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'No quiero renunciar a aprender cerca de quienes quiero.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir imaginando' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    expect(screen.getByLabelText('Mi aporte')).toHaveValue(
      'No quiero renunciar a aprender cerca de quienes quiero.',
    );
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByText('Marcá las dos casillas para publicar.')).toBeInTheDocument();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });
  it('la revisión exige fidelidad y permiso de publicación por separado', () => {
    const props = {
      lectura: 'Quiero aprender cerca.',
      cambiar: vi.fn(),
      tema: '',
      cambiarTema: vi.fn(),
      lugar: null,
      elegirLugar: vi.fn(),
      publicar: true,
      cede: false,
      setPublicar: vi.fn(),
      setCede: vi.fn(),
      confirmado: false,
      confirmar: vi.fn(),
      incluirOrigen: false,
      incluir: vi.fn(),
      volver: vi.fn(),
      enviar: vi.fn(),
      enviando: false,
    };
    const r = montar(<Revision {...props} />);
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    r.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <Revision {...props} confirmado />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('button', { name: 'Publicar mi aporte' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });
  it('la asistencia externa requiere autorización explícita', () => {
    montar(<Asistencia texto="Quiero aprender cerca." proveedor="Groq" usar={vi.fn()} />);
    const boton = screen.getByRole('button', { name: 'Pedir una lectura asistida' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Marcá la casilla para autorizar el envío.')).toBeInTheDocument();
    fireEvent.click(boton);
    expect(modelo.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(boton);
    expect(modelo.mutate).toHaveBeenCalledWith('Quiero aprender cerca.');
    // Es un dato de infraestructura: no se le muestra a quien aporta.
    expect(screen.queryByText(/Groq/)).not.toBeInTheDocument();
  });
  it('sin proveedor la asistencia no muestra nada', () => {
    const { container } = montar(
      <Asistencia texto="Quiero aprender cerca." proveedor={null} usar={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('el recibo distingue reserva y recuperación sin exponer la cuenta', () => {
    montar(
      <Recibo
        recibo={{
          idPublico: id,
          tipo: 'sueño',
          estado: 'enviada',
          precisionPublicada: 'sin punto',
          yaExistia: false,
          avisos: [],
        }}
        campana={null}
        textoVisible={false}
      />,
    );
    expect(screen.getByText(/El texto quedó reservado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver y gestionar mi aporte' })).toHaveAttribute(
      'href',
      '/senal/' + id,
    );
    expect(screen.getByRole('link', { name: 'Guardar en mi espacio' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fmi-espacio',
    );
  });
  it('seguir es una preferencia y la escritura no contiene voto ni apoyo', () => {
    modelo.user = { id: 1 };
    montar(<Seguir tipo="campana" objeto={id} />);
    fireEvent.click(screen.getByRole('button', { name: 'Seguir esta campaña' }));
    expect(modelo.mutate).toHaveBeenCalledWith({
      metodo: 'post',
      ruta: '/api/v1/mi-espacio/seguimientos',
      cuerpo: { tipo: 'campana', objeto: id },
    });
  });
  it('borradores se leen sin sincronizar ni publicar', async () => {
    montar(<BorradoresLocales />);
    await waitFor(() => {
      expect(modelo.borradores).toHaveBeenCalled();
    });
    expect(screen.getByText(/No se sincronizaron/)).toBeInTheDocument();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });
  it('recuperar exige selección y reconocimiento de autoría', async () => {
    modelo.user = { id: 1 };
    modelo.api.mockResolvedValue([{ id, texto: 'Mi reflexión' }]);
    montar(<Recuperar />);
    await screen.findByText('Mi reflexión');
    expect(screen.getByRole('button', { name: /Vincular/ })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Mi reflexión'));
    fireEvent.click(screen.getByLabelText(/Reconozco estos aportes/));
    fireEvent.click(screen.getByRole('button', { name: /Vincular/ }));
    expect(modelo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ cuerpo: { senales: [id], confirmaControl: true } }),
      expect.any(Object),
    );
  });
  it('Mis aportes diferencia cuenta vacía de una publicación existente', () => {
    montar(<MisAportes aportes={[]} total={0} />);
    expect(screen.getByText(/Todavía no hay aportes ligados/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retirar/ })).not.toBeInTheDocument();
  });
});
describe('Diseñar y devolver sin fabricar acuerdos', () => {
  it('las afirmaciones distinguen responder de leer y suprimen grupos insuficientes', () => {
    montar(
      <Afirmaciones fichaId={id} datos={{ ...datos, analisisOpiniones: analizarOpiniones([]) }} />,
    );
    expect(screen.getByText(/desglose público espera/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'De acuerdo' })).not.toBeInTheDocument();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });
  it('comparar diseños exige funcionamiento, prueba y criterio de pausa', () => {
    modelo.user = { id: 1 };
    montar(<Alternativas fichaId={id} datos={datos} />);
    fireEvent.click(screen.getByRole('button', { name: /Proponer/ }));
    expect(screen.getByLabelText('Cómo funcionaría')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Qué resultado nos haría detenernos o rediseñar'),
    ).toBeInTheDocument();
  });
  it('aceptar una prueba envía firma y clave recuperable, sin revisión independiente propia', () => {
    modelo.user = { id: 1 };
    const prueba = {
      id,
      titulo: 'Un encuentro para aprender',
      alternativaId: id,
      plazo: '2099-12-01',
      alcance: 'Un encuentro en la biblioteca.',
      responsableNombre: null,
      estado: 'propuesta' as const,
      revision: 1,
      puedoGestionar: true,
      puedoRevisar: false,
      eventos: [],
    };
    montar(<Pruebas datos={{ ...datos, pruebas: [prueba] }} />);
    fireEvent.change(screen.getByLabelText('Firma pública de responsabilidad'), {
      target: { value: 'Equipo que acepta' },
    });
    fireEvent.change(screen.getByLabelText('Qué observamos y cómo lo sabemos'), {
      target: { value: 'Aceptamos preparar el encuentro y revisar su resultado.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar este paso' }));
    const llamada: unknown = modelo.mutate.mock.calls[0]?.[0];
    if (!llamada || typeof llamada !== 'object' || !('cuerpo' in llamada))
      throw new Error('Falta comando de prueba');
    expect(llamada.cuerpo).toMatchObject({ firma: 'Equipo que acepta', estado: 'aceptada' });
    expect(JSON.stringify(llamada.cuerpo)).toContain('idLocal');
  });
  it('el panel permite llegar a alternativas y seguimiento por teclado y botones reales', () => {
    montar(<PanelDiseno id={id} />);
    fireEvent.click(screen.getByRole('button', { name: 'Diseños alternativos' }));
    expect(screen.getByText(/posible una misma vida/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pruebas y aprendizaje' }));
    expect(screen.getByText(/El diseño aprende/)).toBeInTheDocument();
  });
  it('un contrato incompleto no se publica ni se guarda como convocatoria lista', () => {
    montar(<FormularioCampana />);
    fireEvent.submit(
      screen.getByRole('button', { name: /Guardar/ }).closest('form') ??
        document.createElement('form'),
    );
    expect(modelo.mutate).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  it('las fases preservan salidas y una fecha de devolución al agregar otra', () => {
    const cambiar = vi.fn();
    montar(
      <FasesContrato
        fases={campana.contrato.fases}
        fechaDevolucion={campana.contrato.fechaDevolucion}
        cambiar={cambiar}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Añadir/ }));
    expect(cambiar).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ fecha: '2099-12-20' })]),
    );
  });
  it('la devolución no promete una lectura humana que aún no existe', () => {
    montar(<Devolucion campana={campana} />);
    expect(screen.getByText(/Todavía no fue publicada/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar devolución' })).not.toBeInTheDocument();
  });
  it('pedir revisión necesita permiso público separado del texto', () => {
    modelo.user = { id: 1 };
    montar(<RevisarDevolucion id={id} responsable={false} />);
    expect(screen.getByRole('button', { name: 'Pedir una revisión' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Qué entendieron distinto o qué falta'), {
      target: { value: 'Falta el tiempo de cuidar y aprender sin elegir uno.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Pedir una revisión' })).toBeEnabled();
  });
  it('los filtros de Radiografía guardan un análisis y no una copia de relatos', () => {
    modelo.user = { id: 1 };
    montar(
      <ControlesAnalisis
        filtros={{ tema: 'educación', umbral: '0.7' }}
        cambiar={vi.fn()}
        corte="2026-10-08T00:00:00Z"
      />,
    );
    fireEvent.change(screen.getByLabelText('Nombre para guardar esta lectura'), {
      target: { value: 'Nuestra lectura' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar en mi espacio' }));
    expect(modelo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        cuerpo: {
          nombre: 'Nuestra lectura',
          consulta: { tema: 'educación', umbral: '0.7' },
          corte: '2026-10-08T00:00:00Z',
        },
      }),
    );
  });
  it('equipo explica el alcance antes de conceder una invitación', () => {
    montar(<Equipo tipo="ficha" objeto={id} />);
    expect(screen.getByText(/La invitación dura siete días/)).toBeInTheDocument();
    expect(screen.getByLabelText('Permiso')).toHaveValue('editor');
    expect(modelo.escribir).not.toHaveBeenCalled();
  });
  it('la descarga es pública y anuncia alcance completo con omisiones', () => {
    montar(<DescargarDatos />);
    expect(screen.getByRole('button', { name: 'Descargar estos datos' })).toBeEnabled();
    expect(screen.getByText(/No descarga la base interna/)).toBeInTheDocument();
  });
});
