import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  comoTextoPlano,
  esPropia,
  guardarLlave,
  leerLlavero,
  olvidarLlave,
  selloDeEstado,
} from '../lo-que-falta-data';
import { FichaDeFalta } from '../sections/FichaDeFalta';
import { FilaFalta } from '../sections/FilaFalta';


import type * as QueriesDeFaltas from '~/lib/queries/faltas';

import { PanelDejarFalta } from '~/components/papel/PanelDejarFalta';

const dejar = vi.fn();
const firmar = vi.fn();
const retirar = vi.fn();

vi.mock('~/lib/queries/faltas', async (original) => {
  const real = await original<typeof QueriesDeFaltas>();
  return {
    ...real,
    useDejarFalta: () => ({ mutate: dejar, isPending: false, isError: false, reset: vi.fn() }),
    useFirmarFalta: () => ({ mutate: firmar, isPending: false, data: undefined }),
    useRetirarFalta: () => ({ mutate: retirar, isPending: false }),
  };
});

const FALTA: QueriesDeFaltas.FaltaPublica = {
  idPublico: 'I-007',
  origen: 'afuera',
  superficie: 'el-mapa',
  titulo: 'El contador dice «en vista» y cuenta lo que trajo',
  cuerpo: 'Con 40.000 señales va a decir 2.000 para siempre. Ver https://ejemplo.ar/detalle',
  contexto: null,
  severidad: null,
  estado: 'dicha',
  razon: null,
  anotadaComo: null,
  cierreUrl: null,
  firmas: 0,
  creadaEn: '2026-08-12T14:03:00.000Z',
  movidaEn: '2026-08-12T14:03:00.000Z',
};

function envolver(nodo: React.ReactNode) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={cliente}>{nodo}</QueryClientProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

/**
 * Lo que la spec promete en pantalla
 * (`docs/specs/2026-08-12-lo-que-falta.md`). Tres cosas, y las tres son
 * afirmaciones sobre el producto y no sobre React:
 *
 *   1. un enlace en el cuerpo NO se renderiza como enlace (§2.6, freno 2);
 *   2. el «no va» muestra su razón tan grande como el pedido (§2.3);
 *   3. la llave se guarda en el navegador y en ningún otro lado (§2.5).
 */
describe('el cuerpo va como texto plano', () => {
  it('desarma la URL en vez de dejarla clickeable', () => {
    expect(comoTextoPlano('mirá https://spam.example/oferta')).toBe('mirá spam.example/oferta');
    expect(comoTextoPlano('y HTTP://OTRO.example/x')).toBe('y OTRO.example/x');
  });

  /**
   * Las faltas de adentro llegan de `docs/DEUDAS.md`, o sea con markdown. Se
   * le sacan las marcas y se deja el texto: renderizarlo crudo mostraba los
   * asteriscos, y renderizarlo como markdown devolvería los `<a>` que el
   * freno 2 existe para prohibir.
   */
  it('le saca las marcas de markdown que traen las deudas del archivo', () => {
    expect(comoTextoPlano('**Dónde:** `packages/db/src/schema/feedback.ts`')).toBe(
      'Dónde: packages/db/src/schema/feedback.ts',
    );
    expect(comoTextoPlano('**Estado:** ~~abierta~~ → **resuelta**')).toBe(
      'Estado: abierta → resuelta',
    );
  });

  it('un enlace markdown conserva su etiqueta y pierde su destino', () => {
    expect(comoTextoPlano('ver [D-016](#d-016--el-archivo) para el detalle')).toBe(
      'ver D-016 para el detalle',
    );
    expect(comoTextoPlano('[comprá acá](https://spam.example)')).toBe('comprá acá');
  });

  it('no emite ningún <a> con el cuerpo de una falta', () => {
    const { container } = envolver(<FilaFalta falta={FALTA} propia={false} />);
    const enlaces = [...container.querySelectorAll('a')];
    // El único <a> de la fila es el que lleva a la ficha.
    expect(enlaces).toHaveLength(1);
    expect(enlaces[0]?.getAttribute('href')).toBe('/lo-que-falta/I-007');
    expect(container.innerHTML).not.toContain('https://ejemplo.ar');
  });
});

describe('la ficha', () => {
  it('muestra la razón de un «no va» con su propio encabezado', () => {
    envolver(
      <FichaDeFalta
        falta={{
          ...FALTA,
          estado: 'no_va',
          razon: 'Ya lo cubre el conteo del servidor, que no tiene techo.',
        }}
      />,
    );
    expect(screen.getByText('Por qué no va')).toBeInTheDocument();
    expect(
      screen.getByText('Ya lo cubre el conteo del servidor, que no tiene techo.'),
    ).toBeInTheDocument();
  });

  it('una bajada conserva el número y pierde el contenido', () => {
    envolver(
      <FichaDeFalta falta={{ ...FALTA, estado: 'bajada', titulo: '[contenido retirado]', razon: 'insultos' }} />,
    );
    expect(screen.getByText('I-007', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Contenido retirado')).toBeInTheDocument();
    expect(screen.getByText('Por qué se bajó')).toBeInTheDocument();
    // No se ofrece firmar algo que se bajó.
    expect(screen.queryByText('Me pasa lo mismo')).not.toBeInTheDocument();
  });

  it('ofrece retirar sólo si la llave de esta falta está en este navegador', () => {
    const { unmount } = envolver(<FichaDeFalta falta={FALTA} />);
    expect(screen.queryByText('Retirarla')).not.toBeInTheDocument();
    unmount();

    guardarLlave('I-007', 'llave-guardada-en-este-navegador');
    envolver(<FichaDeFalta falta={FALTA} />);
    expect(screen.getByText('Retirarla')).toBeInTheDocument();
  });

  it('el conteo de firmas se muestra y no ordena nada', () => {
    envolver(<FichaDeFalta falta={{ ...FALTA, firmas: 12 }} />);
    expect(screen.getByText('12 personas la firmaron')).toBeInTheDocument();
  });
});

describe('el panel', () => {
  it('dice que se publica al instante ANTES de que alguien escriba', () => {
    envolver(<PanelDejarFalta abierto onCerrar={vi.fn()} />);
    expect(screen.getByText(/se publica/i)).toBeInTheDocument();
    expect(screen.getByText(/al instante/i)).toBeInTheDocument();
  });

  it('no pide nombre, ni mail, ni cuenta', () => {
    const { container } = envolver(<PanelDejarFalta abierto onCerrar={vi.fn()} />);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    // Un solo campo de texto libre: el título. El resto es textarea y botones.
    expect(container.querySelectorAll('input')).toHaveLength(1);
  });

  it('manda el encuadre que le pasó el mapa, y nada que no le hayan pasado', () => {
    const encuadre = { oeste: -64.2, sur: -34.9, este: -58.1, norte: -31.2 };

    envolver(
      <PanelDejarFalta
        abierto
        onCerrar={vi.fn()}
        superficieInicial="el-mapa"
        contexto={{ ruta: '/el-mapa#instrumento', capa: 'analisis', encuadre }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/El mapa no dice/), {
      target: { value: 'El contador miente con muchas señales' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Qué pasó, qué esperabas/), {
      target: { value: 'Cuenta las filas que trajo y topea en 500.' },
    });
    fireEvent.click(screen.getByText('Dejarla'));

    expect(dejar).toHaveBeenCalledTimes(1);
    const [enviado] = dejar.mock.calls[0] as [Record<string, unknown>];
    expect(enviado.superficie).toBe('el-mapa');
    expect(enviado.contexto).toEqual({ ruta: '/el-mapa#instrumento', capa: 'analisis', encuadre });
    // Nada más que los tres campos declarados más el contexto.
    expect(Object.keys(enviado).sort()).toEqual(['contexto', 'cuerpo', 'superficie', 'titulo']);
  });

  it('no deja mandar un título de una palabra ni un cuerpo vacío', () => {
    envolver(<PanelDejarFalta abierto onCerrar={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/El mapa no dice/), { target: { value: 'no' } });
    fireEvent.click(screen.getByText('Dejarla'));
    expect(dejar).not.toHaveBeenCalled();
  });
});

describe('el llavero', () => {
  it('guarda, lee y olvida sin tocar nada más', () => {
    expect(leerLlavero()).toEqual({});
    guardarLlave('I-007', 'llave-a');
    guardarLlave('I-008', 'llave-b');
    expect(leerLlavero()).toEqual({ 'I-007': 'llave-a', 'I-008': 'llave-b' });

    olvidarLlave('I-007');
    expect(leerLlavero()).toEqual({ 'I-008': 'llave-b' });
    expect(esPropia({ idPublico: 'I-008' }, leerLlavero())).toBe(true);
    expect(esPropia({ idPublico: 'I-007' }, leerLlavero())).toBe(false);
  });

  it('sobrevive a un storage con basura adentro', () => {
    window.localStorage.setItem('basta_faltas_llaves', 'no soy json');
    expect(leerLlavero()).toEqual({});

    window.localStorage.setItem('basta_faltas_llaves', '{"I-001": 42, "I-002": "ok"}');
    expect(leerLlavero()).toEqual({ 'I-002': 'ok' });
  });
});

describe('el sello del estado', () => {
  it('sólo tres colores, para que el estado se lea de lejos', () => {
    expect(selloDeEstado('hecha')).toBe('verde');
    expect(selloDeEstado('no_va')).toBe('rojo');
    expect(selloDeEstado('bajada')).toBe('rojo');
    expect(selloDeEstado('dicha')).toBe('violeta');
    expect(selloDeEstado('anotada')).toBe('violeta');
    expect(selloDeEstado('en_curso')).toBe('violeta');
  });
});
