vi.mock('../DestinoFicha', () => ({ DestinoFicha: () => null }));
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdministracionIniciativa } from '../Administracion';
import { EvidenciasTarea } from '../Evidencias';
import { HitosIniciativa } from '../Hitos';
import { InicioIniciativas } from '../Inicio';
import { TareaFormulario } from '../TareaFormulario';
import { TareasIniciativa } from '../Tareas';

import { evidencia, iniciativa, permisos, tarea } from './fixtures';

import type * as Wouter from 'wouter';

const m = vi.hoisted(() => ({ mutate: vi.fn(), items: [] as unknown[], navegar: vi.fn() }));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionOperacion: () => ({ mutate: m.mutate, isPending: false }),
  useGestionLista: () => ({
    data: { pages: [{ items: m.items }] },
    isPending: false,
    isError: false,
    hasNextPage: false,
  }),
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 1 }, isLoading: false }) }));
vi.mock('wouter', async (actual) => ({
  ...(await actual<typeof Wouter>()),
  useLocation: () => ['/iniciativas/nueva', m.navegar],
  useSearch: () => 'escucha=si',
}));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Catálogo territorial</p>,
}));
const llenar = (etiqueta: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
const parcial = (v: unknown): unknown => expect.objectContaining(v);
const consentir = () => fireEvent.click(screen.getByLabelText(/Autorizo publicar/));
describe('Gestión cotidiana de iniciativas', () => {
  beforeEach(() => {
    m.items = [];
    m.mutate.mockReset();
  });
  it('la creación exige autorización y conserva el destino escucha después de crear', () => {
    render(<InicioIniciativas />);
    llenar('Nombre de la iniciativa', 'Horarios de la escuela');
    llenar('Propósito y alcance', 'Escuchar a las familias con distintos horarios.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear iniciativa' }));
    expect(m.mutate).not.toHaveBeenCalled();
    consentir();
    fireEvent.click(screen.getByRole('button', { name: 'Crear iniciativa' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ruta: '',
        cuerpo: parcial({
          titulo: 'Horarios de la escuela',
          autorizoPublicacion: true,
        }),
      }),
      expect.any(Object),
    );
  });
  it('un administrador no puede ver el formulario de propiedad; la persona propuesta acepta explícitamente', () => {
    const { rerender } = render(
      <AdministracionIniciativa i={iniciativa} p={{ ...permisos, propietario: false }} />,
    );
    expect(screen.queryByText('Administrar roles y propiedad')).not.toBeInTheDocument();
    rerender(
      <AdministracionIniciativa
        i={iniciativa}
        p={{ ...permisos, propietario: false, administrar: false, aceptarTraspaso: true }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Acepto hacerme cargo de la iniciativa' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ruta: '/10/equipo',
        cuerpo: parcial({ accion: 'aceptar_traspaso', revision: 2 }),
      }),
      expect.any(Object),
    );
  });
  it('crea hitos con criterio y fecha; los derivados no tienen un segundo editor', () => {
    m.items = [
      {
        id: 20,
        titulo: 'Prueba de una ficha',
        descripcion: 'Revisar resultado.',
        fecha: '2099-01-01',
        revision: 1,
        completado: false,
        derivado: true,
      },
    ];
    render(<HitosIniciativa id={10} administrar />);
    expect(screen.queryByText('Editar o cerrar hito')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Crear un hito'));
    llenar('Nombre del hito', 'Revisar horarios y ausencias');
    llenar(
      'Qué se revisará y con qué criterio',
      'Comparar horarios y documentar a quiénes faltó escuchar.',
    );
    llenar('Fecha de revisión', '2099-01-01');
    consentir();
    fireEvent.click(screen.getByRole('button', { name: 'Crear hito' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ruta: '/10/hitos',
        cuerpo: parcial({ fecha: '2099-01-01' }),
      }),
      expect.any(Object),
    );
  });
  it('conserva territorio y unidad al editar una escucha; requiere autorización pública', () => {
    render(
      <TareaFormulario
        id={10}
        tarea={{
          ...tarea,
          escucha: {
            ...(tarea.escucha ?? {
              territorioId: null,
              zona: 'Zona escolar',
              metodo: 'conversacion',
              canal: 'mixta',
              convocatoria: 'Invitar a familias de distintos horarios.',
              unidad: 'Tres encuentros en zona escolar',
              versionUnidad: '1',
            }),
            territorioId: 6,
          },
        }}
        escucha
      />,
    );
    expect(screen.getByText(/Territorio conservado/)).toBeInTheDocument();
    consentir();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarea' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'patch',
        cuerpo: parcial({
          revision: 1,
          escucha: parcial({
            territorioId: 6,
            unidad: 'Tres encuentros en zona escolar',
            versionUnidad: '1',
          }),
        }),
      }),
      expect.any(Object),
    );
  });
  it('aceptar una tarea requiere firma; se muestra el carácter público de la nota', () => {
    m.items = [tarea];
    render(<TareasIniciativa id={10} administrar={false} />);
    fireEvent.click(screen.getByText('Quiero hacer esta tarea'));
    llenar('Cómo me organizo para cumplir esta tarea', 'Puedo coordinar estas conversaciones.');
    fireEvent.click(screen.getByRole('button', { name: 'Acepto hacerme cargo de esta tarea' }));
    expect(m.mutate).not.toHaveBeenCalled();
    llenar('Mi firma pública', 'Equipo de escucha');
    fireEvent.click(screen.getByRole('button', { name: 'Acepto hacerme cargo de esta tarea' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        cuerpo: parcial({ accion: 'aceptar', revision: 1 }),
      }),
      expect.any(Object),
    );
    expect(screen.getByText(/Tu firma y tu nota serán públicas/)).toBeInTheDocument();
  });
  it('distingue cero observaciones de dato vacío y ofrece revisar solo cuando el servidor lo permite', () => {
    m.items = [evidencia];
    render(<EvidenciasTarea id={10} t={tarea} />);
    expect(screen.getByText(/Observaciones: 0/)).toBeInTheDocument();
    expect(screen.queryByText('Registrar evidencia del resultado')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Revisar o retirar evidencia'));
    llenar('Decisión', 'revisar');
    llenar('Firma pública para revisar', 'Revisión del equipo');
    llenar('Fundamento y límites de la decisión', 'Revisé el método; faltan otros horarios.');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar decisión' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ruta: '/10/evidencias/71',
        cuerpo: parcial({ accion: 'revisar', revision: 1 }),
      }),
      expect.any(Object),
    );
  });
});
