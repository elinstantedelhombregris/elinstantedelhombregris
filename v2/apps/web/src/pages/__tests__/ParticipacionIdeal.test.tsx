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
import { Recibo } from '../Imaginar/Recibo';
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
    expect(screen.getByRole('heading', { level: 2, name: 'Mis borradores' })).toBeInTheDocument();
    // Sin borradores: una salida concreta, y «acá» en vez de «aquí».
    expect(screen.getByText(/No hay borradores guardados en este navegador/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=aportar#instrumento',
    );
    expect(screen.queryByText(/aquí|Reflexion/)).not.toBeInTheDocument();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });
  it('recuperar exige selección y reconocimiento de autoría', async () => {
    modelo.user = { id: 1 };
    modelo.api.mockResolvedValue([{ id, texto: 'Mi reflexión' }]);
    montar(<Recuperar />);
    await screen.findByText('Mi reflexión');
    expect(screen.getByRole('button', { name: 'Sumar a mi cuenta' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    fireEvent.click(screen.getByLabelText('Mi reflexión'));
    fireEvent.click(screen.getByLabelText(/Reconozco estos aportes/));
    fireEvent.click(screen.getByRole('button', { name: 'Sumar a mi cuenta' }));
    expect(modelo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ cuerpo: { senales: [id], confirmaControl: true } }),
      expect.any(Object),
    );
  });
  it('Mis aportes diferencia cuenta vacía de una publicación existente', () => {
    montar(<MisAportes aportes={[]} total={0} />);
    expect(screen.getByText('Todavía no publicaste nada desde esta cuenta.')).toBeInTheDocument();
    // El vacío tiene salida: el botón lleva a la puerta única de aportar.
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=aportar#instrumento',
    );
    expect(screen.queryByRole('button', { name: /Retirar/ })).not.toBeInTheDocument();
  });
});
describe('Diseñar y devolver sin fabricar acuerdos', () => {
  it('las afirmaciones distinguen responder de leer y suprimen grupos insuficientes', () => {
    montar(
      <Afirmaciones
        fichaId={id}
        datos={{ ...datos, analisisOpiniones: analizarOpiniones([]) }}
        hrefIngreso="/ingresar"
      />,
    );
    expect(screen.getByText(/desglose público espera/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'De acuerdo' })).not.toBeInTheDocument();
    expect(modelo.mutate).not.toHaveBeenCalled();
  });
  it('comparar diseños exige funcionamiento, prueba y criterio de pausa', () => {
    modelo.user = { id: 1 };
    montar(<Alternativas fichaId={id} datos={datos} hrefIngreso="/ingresar" />);
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
    montar(<Pruebas datos={{ ...datos, pruebas: [prueba] }} hrefIngreso="/ingresar" />);
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
    fireEvent.click(screen.getByRole('link', { name: 'Alternativas para comparar' }));
    expect(screen.getByRole('heading', { name: 'Alternativas para comparar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Pruebas chicas para aprender' }));
    expect(
      screen.getByRole('heading', { name: 'Pruebas chicas para aprender' }),
    ).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: 'Agregar etapa' }));
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
    expect(screen.getByRole('button', { name: 'Pedir una revisión' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    fireEvent.change(screen.getByLabelText('Qué entendieron distinto o qué falta'), {
      target: { value: 'Falta el tiempo de cuidar y aprender sin elegir uno.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Pedir una revisión' })).not.toHaveAttribute(
      'aria-disabled',
    );
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
    expect(screen.getByRole('button', { name: 'Preparar el archivo' })).not.toHaveAttribute(
      'aria-disabled',
    );
    expect(screen.getByText(/No descarga la base interna/)).toBeInTheDocument();
  });
});
