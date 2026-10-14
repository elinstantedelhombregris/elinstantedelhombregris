import { planTerritorialCoverage, pointInCoverageArea } from '@v2/civic-core';
import { useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { Link } from 'wouter';

import { Control, LeyendaRampa, Segmentado } from '../Chrome';

import type { ContextoModo, ResultadoModo } from './tipos';

/** Grilla exploratoria del encuadre; no equivale a unidades de relevamiento persistidas. */

const RESOLUCIONES = [
  { id: 'gruesa', etiqueta: 'Gruesa', celdas: 60 },
  { id: 'media', etiqueta: 'Media', celdas: 160 },
  { id: 'fina', etiqueta: 'Fina', celdas: 400 },
] as const;

type Resolucion = (typeof RESOLUCIONES)[number]['id'];

const MUDA = '#241F17';
const CON_VOZ = '#1A7A4A';

export function useModoCobertura(ctx: ContextoModo): ResultadoModo {
  const [resolucion, setResolucion] = useState<Resolucion>('media');
  const [mostrar, setMostrar] = useState<'mudas' | 'todas'>('mudas');

  const celdas = RESOLUCIONES.find((r) => r.id === resolucion)?.celdas ?? 160;

  const puntos = useMemo(
    () =>
      ctx.todas
        .filter(
          (s) =>
            s.precision === 'exact' &&
            typeof s.lat === 'number' &&
            Number.isFinite(s.lat) &&
            typeof s.lng === 'number' &&
            Number.isFinite(s.lng),
        )
        .map((s) => ({ lat: s.lat ?? 0, lng: s.lng ?? 0 })),
    [ctx.todas],
  );

  const plan = useMemo(() => {
    const r = ctx.recuadro;
    if (!r) return null;
    const marco = [
      { lat: r.sur, lng: r.oeste },
      { lat: r.norte, lng: r.oeste },
      { lat: r.norte, lng: r.este },
      { lat: r.sur, lng: r.este },
    ];
    const p = planTerritorialCoverage({ points: marco }, { cellCount: celdas });
    return p.valid ? p : null;
  }, [ctx.recuadro, celdas]);

  const evaluadas = useMemo(() => {
    if (!plan) return null;
    return plan.cells.map((celda) => ({
      celda,
      tieneVoz: puntos.some((p) => pointInCoverageArea(p, celda.geometry)),
    }));
  }, [plan, puntos]);

  const geojson = useMemo(() => {
    if (!evaluadas) return { type: 'FeatureCollection' as const, features: [] };
    const incluir = mostrar === 'mudas' ? evaluadas.filter((e) => !e.tieneVoz) : evaluadas;
    return {
      type: 'FeatureCollection' as const,
      features: incluir.map((e) => ({
        type: 'Feature' as const,
        properties: { muda: e.tieneVoz ? 0 : 1 },
        geometry: e.celda.geometry,
      })),
    };
  }, [evaluadas, mostrar]);

  const mudas = evaluadas?.filter((e) => !e.tieneVoz).length ?? 0;
  const total = evaluadas?.length ?? 0;
  const porcentaje = total > 0 ? Math.round((mudas / total) * 100) : 0;
  const lado = Math.round(plan?.effectiveCellSizeMeters ?? 0);

  return {
    titulo: 'Cobertura',
    descripcion:
      'Presencia de puntos exactos entre los aportes cargados. No mide población representada ni zonas efectivamente relevadas.',

    panel: (
      <>
        <p className="text-oscuro-meta mb-3 text-xs">
          Las ubicaciones aproximadas o provinciales no colorean celdas. La grilla cambia con el
          encuadre y la resolución; no es una unidad estable de relevamiento. Incluye áreas sin
          población.
        </p>
        <Link
          href="/escucha-territorial"
          className="text-violeta-claro mb-4 inline-flex min-h-11 underline"
        >
          Planear escucha y consultar relevamientos →
        </Link>
        <Control etiqueta="En este encuadre">
          {total > 0 ? (
            <>
              <p className="font-anton text-violeta-claro text-[30px] tabular-nums leading-none">
                {porcentaje}%
              </p>
              <p className="text-oscuro-secundario mt-1.5 text-[13px] leading-relaxed">
                {mudas === total ? (
                  <>
                    <strong>{total.toLocaleString('es-AR')} celdas.</strong> Las{' '}
                    {total.toLocaleString('es-AR')} sin puntos exactos publicados.
                  </>
                ) : (
                  <>
                    <strong>{mudas.toLocaleString('es-AR')}</strong> de{' '}
                    {total.toLocaleString('es-AR')} celdas sin puntos exactos publicados.
                  </>
                )}
              </p>
              <p className="font-space text-oscuro-meta mt-2 text-[10px] uppercase tracking-[0.1em]">
                celdas de {lado.toLocaleString('es-AR')} m de lado
              </p>
            </>
          ) : (
            <p className="text-oscuro-secundario text-[13px]">
              Movete por el mapa para medir un área.
            </p>
          )}
        </Control>

        <Control etiqueta="Resolución">
          <Segmentado
            valor={resolucion}
            onCambiar={setResolucion}
            opciones={RESOLUCIONES.map((r) => ({ id: r.id, etiqueta: r.etiqueta }))}
          />
          <p className="text-oscuro-meta mt-2 text-[11px] leading-relaxed">
            Cuanto más fina la grilla, más celdas sin puntos — y no porque haya menos aportes, sino
            porque la pregunta se hace más chica. El porcentaje se lee junto al tamaño de celda,
            nunca solo.
          </p>
        </Control>

        <Control etiqueta="Qué se pinta">
          <Segmentado
            valor={mostrar}
            onCambiar={setMostrar}
            opciones={[
              { id: 'mudas', etiqueta: 'Sin puntos exactos' },
              { id: 'todas', etiqueta: 'Todas las celdas' },
            ]}
          />
        </Control>
      </>
    ),

    capas: (
      <Source id="cobertura" type="geojson" data={geojson}>
        <Layer
          id="cobertura-relleno"
          type="fill"
          paint={{
            'fill-color': ['case', ['==', ['get', 'muda'], 1], MUDA, CON_VOZ],
            'fill-opacity': ['case', ['==', ['get', 'muda'], 1], 0.72, 0.22],
          }}
        />
        <Layer
          id="cobertura-borde"
          type="line"
          paint={{ 'line-color': '#3A362D', 'line-width': 0.4, 'line-opacity': 0.6 }}
        />
      </Source>
    ),

    leyenda: (
      <LeyendaRampa
        colores={[CON_VOZ, MUDA]}
        bajo="Con puntos exactos"
        alto="Sin puntos exactos"
        titulo="Grilla exploratoria del encuadre"
      />
    ),
  };
}
