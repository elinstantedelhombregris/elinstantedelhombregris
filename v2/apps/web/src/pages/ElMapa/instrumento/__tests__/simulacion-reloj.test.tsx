import { fireEvent, render, screen, within } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useModoSimulacion } from '../modos/useModoSimulacion';

import type { ContextoModo } from '../modos/tipos';
import type { SenalConTipo } from '../useVistaMapa';
import type { MapRef } from 'react-map-gl/maplibre';

/**
 * El reloj de la Simulación del mapa — la guarda del §1.5 de la spec.
 *
 * `useModoSimulacion` llamaba `Date.now()` adentro de un `useMemo` que dependía
 * de `palancas`. Consecuencia: **mover una perilla recalculaba el lado medido
 * con otro reloj**, y una voz que caía cerca del borde de un período se pasaba
 * al período siguiente. Medido en el motor, 1 ms de avance movió el alcance del
 * silencio de 0,0000 a 0,2857 — o sea que la tesis del instrumento («el lado de
 * hoy es medición y es idéntico para toda configuración») estaba rota en
 * producción aunque el motor la cumpliera y los tests del motor pasaran.
 *
 * Por eso la guarda vive acá y no en `civic-core`: el defecto nunca estuvo en
 * el motor, estuvo en el call site. Un test del motor no lo habría visto nunca.
 */

const { PROVINCIAS } = vi.hoisted(() => ({
  PROVINCIAS: [{ id: 1, name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C' }],
}));

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: () => ({ data: PROVINCIAS, isLoading: false }),
}));

/** El mes del motor, con la misma definición que `retrato.ts`. */
const MS_POR_PERIODO = (365.25 / 12) * 24 * 3600 * 1000;

const T0 = 1_800_000_000_000;

/**
 * La voz cae a UN MILISEGUNDO de la frontera de su período.
 *
 * Es el caso que el defecto voltea: con `ahora = T0` cae en el período 0 y la
 * ventana medida es de un solo período —persistencia 100%—; con el reloj un
 * período más adelante cae en el 1 y la ventana pasa a dos —persistencia 50%—.
 * Nadie tocó un dato: sólo pasó el tiempo entre dos lecturas del reloj.
 */
const SENALES: readonly SenalConTipo[] = [
  {
    id: 'voz:1',
    capa: 'voz',
    tipo: 'basta',
    claseSenal: 'hecho' as const,
    texto: 'TEST',
    lat: null,
    lng: null,
    precision: 'province',
    role: 'subject',
    provinceId: 1,
    cityId: null,
    createdAt: new Date(T0 - MS_POR_PERIODO + 1).toISOString(),
  },
];

function Banco() {
  const mapaRef = useRef<MapRef>(null);
  const ctx: ContextoModo = {
    senales: SENALES,
    todas: SENALES,
    mapaRef,
    recuadro: null,
    cargando: false,
  };
  return <div>{useModoSimulacion(ctx).panel}</div>;
}

/**
 * El valor que muestra una `Cifra`, buscándolo por su rótulo dentro de su
 * sección. Las dos secciones publican «Legitimidad», y ésa es justamente la
 * comparación que importa: hay que poder pedir la de un lado sin la del otro.
 */
const cifra = (seccion: 'Hoy · medido' | 'Si hablaran', etiqueta: string): string =>
  within(screen.getByRole('region', { name: seccion })).getByText(etiqueta).nextElementSibling
    ?.textContent ?? '';

describe('el reloj del modo Simulación', () => {
  beforeEach(() => {
    // Cada lectura del reloj avanza un período entero. Con una sola lectura no
    // cambia nada; con dos, el lado medido se mueve — que es exactamente lo que
    // esta guarda tiene que poder ver.
    let lecturas = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      const t = T0 + lecturas * MS_POR_PERIODO;
      lecturas += 1;
      return t;
    });
    // Sin geometría el modo lo dice y no rompe; acá sólo se mira el panel.
    vi.stubGlobal('fetch', () => Promise.reject(new Error('sin red en el test')));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('mover una palanca NO mueve el lado medido, aunque el reloj haya avanzado', () => {
    render(<Banco />);

    const persistenciaAntes = cifra('Hoy · medido', 'Persistencia');
    const legitimidadAntes = cifra('Hoy · medido', 'Legitimidad');

    fireEvent.change(screen.getByLabelText('Cuánta gente habla'), { target: { value: '0' } });

    // El movimiento tiene que haber llegado al motor: sin esto, el test pasaría
    // por no haber cambiado nada en vez de por haber arreglado el reloj.
    expect(cifra('Si hablaran', 'Territorios que ganan mandato')).toBe('0');

    expect(cifra('Hoy · medido', 'Persistencia')).toBe(persistenciaAntes);
    expect(cifra('Hoy · medido', 'Legitimidad')).toBe(legitimidadAntes);
  });

  it('el lado medido sobrevive a varias vueltas de perilla', () => {
    render(<Banco />);
    const medido = cifra('Hoy · medido', 'Persistencia');

    for (const valor of ['500', '10', '1200', '200']) {
      fireEvent.change(screen.getByLabelText('Cuánta gente habla'), { target: { value: valor } });
      expect(cifra('Hoy · medido', 'Persistencia')).toBe(medido);
    }
  });
});
