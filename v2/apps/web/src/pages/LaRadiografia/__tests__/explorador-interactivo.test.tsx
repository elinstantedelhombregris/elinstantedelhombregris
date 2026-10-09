import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { golpearNodo, proyectar, type NodoDibujable } from '../constelacion-pintor';
import { disponerNodos } from '../lentes';
import { Constelacion } from '../sections/Constelacion';
import { ExploradorConstelacion } from '../sections/ExploradorConstelacion';

import type { NucleoEnPantalla } from '../radiografia-data';

const id = 'voz:341084c6-2992-4ce0-9303-c3b4537bd33b';
const otro = 'voz:512180c6-2992-4ce0-9303-c3b4537bd33b';
const nucleos: NucleoEnPantalla[] = [
  {
    id: 'aprender',
    frase: { id, texto: 'Aprender cerca de quienes quiero' },
    textoOmitido: null,
    senales: 2,
    clases: { deseo: 2 },
    provincias: 2,
    distancia: null,
    miembros: [
      { id, clase: 'deseo', x: -0.4, y: 0.3, z: 0.2 },
      { id: otro, clase: 'deseo', x: 0.6, y: -0.3, z: 0.2 },
    ],
  },
];
function Montar({ origen = 'corpus' }: { origen?: 'corpus' | 'ejemplo' }) {
  const [enfocado, enfocar] = useState<string | null>(null);
  return (
    <ExploradorConstelacion
      nucleos={nucleos}
      solas={[]}
      aristas={[{ a: id, b: otro, similitud: 0.8, tipo: 'medida' }]}
      tema="papel"
      origen={origen}
      enfocado={enfocado}
      onEnfocar={enfocar}
      textosEjemplo={{ [id]: 'Texto del laboratorio que jamás se presta al corpus' }}
    />
  );
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('el explorador de Radiografía', () => {
  it('cambia lentes y cámara conservando el dato y declarando el acomodo visual', () => {
    render(<Montar />);
    expect(screen.getByTestId('constelacion')).toHaveAttribute('data-lente', 'nucleos');
    fireEvent.click(screen.getByRole('button', { name: 'Por tipo' }));
    expect(screen.getByTestId('constelacion')).toHaveAttribute('data-lente', 'clases');
    expect(screen.getByText(/Cuatro columnas: lo que hay, lo que querés/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Acercar la constelación' }));
    expect(screen.getByText('150 %')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reencuadrar' }));
    expect(screen.getByText('125 %')).toBeInTheDocument();
    expect(screen.getByTestId('constelacion')).toHaveAttribute('data-origen', 'corpus');
  });
  it('permite seleccionar una fuente con teclado y conserva su identidad al cambiar de lente', () => {
    render(<Montar />);
    fireEvent.click(screen.getByRole('button', { name: /Grupo: Aprender cerca/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Elegir un aporte con el teclado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aporte 1 · lo que querés' }));
    const enlace = screen.getByRole('link', { name: 'Abrir el aporte y sus permisos →' });
    expect(enlace).toHaveAttribute('href', '/senal/' + id.slice(4));
    fireEvent.click(screen.getByRole('button', { name: 'Grupos' }));
    expect(enlace).toHaveAttribute('href', '/senal/' + id.slice(4));
    expect(screen.getByRole('button', { name: 'Aporte 1 · lo que querés' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText(/Texto del laboratorio/)).toBeNull();
  });
  it('el ejemplo conserva el sello y sus fuentes nunca se enlazan al registro real', () => {
    render(<Montar origen="ejemplo" />);
    fireEvent.click(screen.getByRole('button', { name: /Grupo: Aprender cerca/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Elegir un aporte con el teclado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aporte 1 · lo que querés' }));
    expect(screen.getByText('Frase inventada. No es un aporte real.')).toBeInTheDocument();
    expect(screen.getByText(/Texto del laboratorio/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Abrir el aporte/ })).toBeNull();
    expect(screen.getByTestId('constelacion')).toHaveAttribute('data-origen', 'ejemplo');
  });
  it('la búsqueda consulta frases públicas y explica un resultado vacío', () => {
    render(<Montar />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no existe' } });
    expect(screen.queryByRole('button', { name: /Grupo: Aprender cerca/ })).toBeNull();
    expect(screen.getByText(/Los textos reservados no se buscan/)).toBeInTheDocument();
  });
});
describe('disposiciones y selección espacial', () => {
  const nodos: NodoDibujable[] = (nucleos[0]?.miembros ?? []).map((m) => ({
    ...m,
    nucleoId: 'aprender',
    color: '#5227CC',
    radio: 4,
  }));
  it('las tres lentes preservan todos los IDs y no alteran las posiciones originales', () => {
    const originales = structuredClone(nodos);
    for (const lente of ['vinculos', 'nucleos', 'clases'] as const) {
      const vista = disponerNodos(nodos, lente);
      expect(vista.map((n) => n.id).sort()).toEqual(nodos.map((n) => n.id).sort());
      expect(vista.every((n) => [n.x, n.y, n.z].every(Number.isFinite))).toBe(true);
    }
    expect(nodos).toEqual(originales);
    expect(disponerNodos(nodos, 'clases').every((n) => n.z === 0)).toBe(true);
  });
  it('el hit usa la misma cámara que el dibujo incluso después de zoom y desplazamiento', () => {
    const camara = { zoom: 2, x: 80, y: -40 };
    const fuente = nodos[0];
    if (!fuente) throw new Error('El escenario necesita una fuente.');
    const punto = proyectar(fuente, 0.3, 0.2, 800, 500, camara);
    expect(
      golpearNodo(
        nodos,
        0.3,
        0.2,
        { width: 800, height: 500 },
        { x: punto.sx, y: punto.sy },
        camara,
      )?.id,
    ).toBe(fuente.id);
  });

  it('las voces solas permanecen sin núcleo y separadas de las islas', () => {
    const sola = {
      ...nodos[0],
      id: 'sola',
      nucleoId: null,
      clase: 'meta',
      x: 0,
      y: 0,
      z: 0,
      color: '#0F6B8A',
      radio: 2.2,
    };
    const vista = disponerNodos([...nodos, sola], 'nucleos');
    const independiente = vista.find((n) => n.id === 'sola');
    expect(independiente?.nucleoId).toBeNull();
    expect(Math.abs(independiente?.x ?? 0)).toBeGreaterThan(1);
    expect(vista).toHaveLength(nodos.length + 1);
  });

  it('con movimiento reducido no gira y una lente nueva pinta su estado final sin interpolación', () => {
    const cuadros: FrameRequestCallback[] = [];
    const puntos: [number, number][] = [];
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cuadros.push(cb);
      return cuadros.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500);
    const ctx = {
      setTransform: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc(x: number, y: number) {
        puntos.push([x, y]);
      },
      fill: vi.fn(),
      setLineDash: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    const props = {
      nucleos,
      solas: [],
      aristas: [],
      tema: 'papel' as const,
      origen: 'corpus' as const,
      enfocado: null,
      onEnfocar: () => undefined,
      girando: true,
    };
    const r = render(<Constelacion {...props} />);
    const antes = puntos.slice(-2);
    cuadros[0]?.(16);
    expect(puntos.slice(-2)).toEqual(antes);
    r.rerender(<Constelacion {...props} lente="clases" />);
    const destino = disponerNodos(nodos, 'clases');
    for (const n of destino) {
      const p = proyectar(n, 0, 0, 800, 500);
      expect(
        Math.min(...puntos.slice(-2).map(([x, y]) => Math.hypot(x - p.sx, y - p.sy))),
      ).toBeLessThan(1e-6);
    }
  });
});
