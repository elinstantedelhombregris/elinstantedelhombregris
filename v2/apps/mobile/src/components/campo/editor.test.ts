import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { EditorCampoNativo } from './EditorCampoNativo';
import CampoV2 from '@/app/campo-v2';
import { nuevoCuaderno } from '@/civic/campo-v2/modelo';
vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  AppState: { addEventListener: vi.fn() },
  View: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  ScrollView: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  Text: ({ children }: { children: React.ReactNode }) => createElement('p', null, children),
  TextInput: ({
    accessibilityLabel,
    value,
    editable,
  }: {
    accessibilityLabel: string;
    value: string;
    editable: boolean;
  }) => createElement('input', { 'aria-label': accessibilityLabel, value, readOnly: !editable }),
  Switch: ({ accessibilityLabel, value }: { accessibilityLabel: string; value: boolean }) =>
    createElement('input', {
      type: 'checkbox',
      'aria-label': accessibilityLabel,
      checked: value,
      readOnly: true,
    }),
}));
vi.mock('@/components/papel', () => ({
  BotonTinta: ({ etiqueta, disabled }: { etiqueta: string; disabled: boolean }) =>
    createElement('button', { disabled }, etiqueta),
  TituloAnton: ({ children }: { children: React.ReactNode }) => createElement('h1', null, children),
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
vi.mock('expo-linking', () => ({ openURL: vi.fn() }));
vi.mock('@react-native-community/netinfo', () => ({ default: { addEventListener: vi.fn() } }));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
vi.mock('@/civic/campo-v2/archivo', () => ({
  guardarCuaderno: vi.fn(),
  borrarCuaderno: vi.fn(),
  leerCuadernos: () => [],
}));
vi.mock('@/civic/campo-v2/conexion', () => ({
  leerConexion: async () => null,
  descargarTareas: vi.fn(),
  estadoEvidencia: vi.fn(),
}));
vi.mock('@/civic/campo-v2/sincronizar', () => ({ sincronizarCuadernos: vi.fn() }));
it('muestra destino y notas separadas y exige ambas autorizaciones', () => {
  const c = nuevoCuaderno('5d391091-3407-4166-8a3d-9e6c44a5ab14', 7, 'https://v2.test', {
    id: 1,
    iniciativaId: 2,
    slug: 'escuela',
    titulo: 'Escuchar horarios',
    alcance: 'Escuchar en distintos horarios',
    revision: 1,
    estado: 'in_progress',
    fichaId: null,
    fichaTitulo: null,
    escucha: {
      territorioId: null,
      zona: 'Zona escolar',
      metodo: 'conversacion',
      canal: 'presencial',
      convocatoria: 'Invitar sin datos personales',
      unidad: 'Encuentros de barrio',
      versionUnidad: '1',
    },
  });
  const html = renderToStaticMarkup(
    createElement(EditorCampoNativo, {
      inicial: c,
      conexion: { token: 'secreto', usuarioId: 7, dispositivoId: 'd', origen: c.origen },
      cambiar: () => undefined,
    }),
  );
  expect(html).toContain('Notas privadas');
  expect(html).toContain('Sólo la iniciativa');
  expect(html).toContain('<button disabled="">Autorizar y guardar para sincronizar');
  expect(html).not.toContain('secreto');
});
it('la pantalla web explica que la credencial sólo se guarda en iOS o Android', () => {
  expect(renderToStaticMarkup(createElement(CampoV2))).toContain('app instalada en iOS o Android');
});
