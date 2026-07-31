import { planTerritorialCoverage, pointInCoverageArea } from '@v2/civic-core';
import { useCallback, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { escribirAreaEnHash } from '../area-url';
import { Control, FiltroTipos } from '../Chrome';
import { contarArea } from '../conteo';
import { anilloCerrado } from '../geojson';
import { LazoOverlay } from '../LazoOverlay';
import { COLOR_TIPO } from '../paleta';
import { PanelArea } from '../PanelArea';

import type { ContextoModo, ResultadoModo } from './tipos';
import type { GeoPoint } from '@v2/civic-core';
import type { TipoVoz } from '~/components/papel/primitives';

import { cn } from '~/lib/utils';

/**
 * Modo Mapa — cada voz donde fue dicha, y el lazo como herramienta.
 *
 * El lazo dejó de ser un botón escondido: es una herramienta del modo, siempre
 * a un click. Mientras está activo el mapa no se arrastra, se traza.
 */

const CELDAS_OBJETIVO = 48;

/** El halo, en metros reales de terreno. Cero para `exact`: no hay duda. */
const METROS_POR_PRECISION: Partial<Record<string, number>> = {
  exact: 0,
  '100m': 71,
  '500m': 354,
  neighborhood: 1061,
  city: 3536,
};

export function useModoMapa(ctx: ContextoModo): ResultadoModo {
  const [tiposActivos, setTiposActivos] = useState<Set<TipoVoz>>(
    () => new Set(Object.keys(COLOR_TIPO) as TipoVoz[]),
  );
  const [lazoActivo, setLazoActivo] = useState(false);
  const [poligono, setPoligono] = useState<GeoPoint[] | null>(null);

  const visibles = useMemo(
    () => ctx.senales.filter((s) => tiposActivos.has(s.tipoVoz)),
    [ctx.senales, tiposActivos],
  );

  const conPunto = useMemo(
    () => visibles.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number'),
    [visibles],
  );

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: conPunto.map((s) => ({
        type: 'Feature' as const,
        properties: {
          color: COLOR_TIPO[s.tipoVoz],
          halo: METROS_POR_PRECISION[s.precision] ?? 0,
          nitido: s.precision === 'exact' ? 1 : 0,
        },
        geometry: { type: 'Point' as const, coordinates: [s.lng ?? 0, s.lat ?? 0] },
      })),
    }),
    [conPunto],
  );

  const areaGeojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: poligono
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: { type: 'Polygon' as const, coordinates: [anilloCerrado(poligono)] },
            },
          ]
        : [],
    }),
    [poligono],
  );

  const conteo = useMemo(
    () => (poligono ? contarArea(visibles, poligono, new Set<number>()) : null),
    [poligono, visibles],
  );

  const cobertura = useMemo(() => {
    if (!poligono || !conteo) return null;
    const plan = planTerritorialCoverage({ points: poligono }, { cellCount: CELDAS_OBJETIVO });
    if (!plan.valid || plan.cells.length === 0) return null;
    const contadas = new Set(conteo.contadas);
    const puntos = conPunto
      .filter((s) => contadas.has(s.id))
      .map((s) => ({ lat: s.lat ?? 0, lng: s.lng ?? 0 }));
    let mudas = 0;
    for (const celda of plan.cells) {
      if (!puntos.some((p) => pointInCoverageArea(p, celda.geometry))) mudas += 1;
    }
    return {
      total: plan.cells.length,
      mudas,
      ladoMetros: Math.round(plan.effectiveCellSizeMeters ?? 0),
    };
  }, [poligono, conteo, conPunto]);

  const desproyectar = useCallback(
    (x: number, y: number): GeoPoint => {
      const mapa = ctx.mapaRef.current;
      if (!mapa) return { lat: 0, lng: 0 };
      const { lat, lng } = mapa.unproject([x, y]);
      return { lat, lng };
    },
    [ctx.mapaRef],
  );

  const alternarTipo = (tipo: TipoVoz) => {
    setTiposActivos((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(tipo)) siguiente.delete(tipo);
      else siguiente.add(tipo);
      return siguiente;
    });
  };

  return {
    titulo: 'Mapa',
    descripcion: 'Cada voz donde fue dicha. Dibujá un área para leer lo que pasa adentro.',
    arrastreHabilitado: !lazoActivo,

    panel: (
      <>
        <Control etiqueta="Tipos de voz">
          <FiltroTipos activos={tiposActivos} onAlternar={alternarTipo} />
        </Control>

        <Control etiqueta="Herramienta">
          <button
            type="button"
            onClick={() => {
              setLazoActivo((v) => !v);
            }}
            className={cn(
              'font-space w-full border px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors',
              lazoActivo
                ? 'border-violeta-claro bg-violeta-claro text-tinta'
                : 'border-violeta-claro text-violeta-claro hover:bg-violeta-claro/10',
            )}
          >
            {lazoActivo ? 'dibujando… (Esc cancela)' : 'dibujar un área'}
          </button>
          {poligono ? (
            <button
              type="button"
              onClick={() => {
                setPoligono(null);
              }}
              className="font-space text-oscuro-meta hover:text-oscuro-texto mt-2 w-full text-[10px] uppercase tracking-[0.08em]"
            >
              borrar el área
            </button>
          ) : null}
        </Control>

        {conteo ? (
          <PanelArea
            conteo={conteo}
            senales={visibles}
            cobertura={cobertura}
            enlace={poligono ? escribirAreaEnHash(poligono, ['voz']) : '#'}
            onLimpiar={() => {
              setPoligono(null);
            }}
            oscuro
          />
        ) : null}
      </>
    ),

    capas: (
      <>
        <Source id="area" type="geojson" data={areaGeojson}>
          <Layer
            id="area-relleno"
            type="fill"
            paint={{ 'fill-color': '#9D85E8', 'fill-opacity': 0.12 }}
          />
          <Layer id="area-borde" type="line" paint={{ 'line-color': '#9D85E8', 'line-width': 1.5 }} />
        </Source>

        <Source id="senales" type="geojson" data={geojson}>
          {/* El halo en metros de terreno: crece con el zoom como crecería la
              duda sobre el mapa. Si la precisión es exacta, no hay halo. */}
          <Layer
            id="senales-halo"
            type="circle"
            filter={['>', ['get', 'halo'], 0]}
            paint={{
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.14,
              'circle-radius': [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                0,
                0,
                20,
                ['/', ['get', 'halo'], 0.075],
              ],
            }}
          />
          <Layer
            id="senales-punto"
            type="circle"
            paint={{
              'circle-color': ['get', 'color'],
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.5, 8, 4, 14, 7],
              'circle-stroke-color': '#16130E',
              'circle-stroke-width': ['case', ['==', ['get', 'nitido'], 1], 1.2, 0],
              'circle-opacity': 0.9,
            }}
          />
        </Source>
      </>
    ),

    sobreMapa: lazoActivo ? (
      <LazoOverlay
        viewBox={{ x: 0, y: 0, ancho: 0, alto: 0 }}
        desproyectarPixel={desproyectar}
        onCompletar={(nuevo) => {
          setLazoActivo(false);
          if (nuevo) setPoligono(nuevo);
        }}
        onCancelar={() => {
          setLazoActivo(false);
        }}
      />
    ) : null,
  };
}
