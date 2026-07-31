import { planTerritorialCoverage, pointInCoverageArea } from '@v2/civic-core';
import { useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { Control, LeyendaRampa, Segmentado } from '../Chrome';

import type { ContextoModo, ResultadoModo } from './tipos';

/**
 * Modo Cobertura — el mapa del silencio, a escala.
 *
 * Es el modo que no tiene deflock y que a nosotros nos importa más: no muestra
 * dónde hay voces, muestra DÓNDE NO LAS HAY. Para un mapa cívico el silencio
 * no es ausencia de dato, es el dato — le dice a alguien dónde ir a caminar.
 *
 * La grilla la arma `coverage.ts` de @v2/civic-core, el mismo módulo que el
 * móvil usa para planificar qué se recorre. La celda que acá se pinta muda es
 * exactamente la que allá se manda a visitar.
 */

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
        .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
        .map((s) => ({ lat: s.lat ?? 0, lng: s.lng ?? 0 })),
    [ctx.todas],
  );

  /**
   * El área a cubrir es el encuadre actual. Tiene sentido: la pregunta
   * «¿dónde no habló nadie?» solo se puede contestar sobre un territorio
   * concreto, y el que estás mirando es el que te importa.
   */
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
      'Dónde todavía no habló nadie. El silencio no es falta de dato: es el dato que dice dónde ir.',

    panel: (
      <>
        <Control etiqueta="En este encuadre">
          {total > 0 ? (
            <>
              <p className="font-anton text-violeta-claro text-[30px] leading-none tabular-nums">
                {porcentaje}%
              </p>
              <p className="text-oscuro-secundario mt-1.5 text-[13px] leading-relaxed">
                <strong>{mudas.toLocaleString('es-AR')}</strong> de {total.toLocaleString('es-AR')}{' '}
                celdas sin una sola voz.
              </p>
              <p className="font-space text-oscuro-meta mt-2 text-[10px] uppercase tracking-[0.1em]">
                celdas de {lado.toLocaleString('es-AR')} m de lado
              </p>
            </>
          ) : (
            <p className="text-oscuro-secundario text-[13px]">Movete por el mapa para medir un área.</p>
          )}
        </Control>

        <Control etiqueta="Resolución">
          <Segmentado
            valor={resolucion}
            onCambiar={setResolucion}
            opciones={RESOLUCIONES.map((r) => ({ id: r.id, etiqueta: r.etiqueta }))}
          />
          <p className="text-oscuro-meta mt-2 text-[11px] leading-relaxed">
            Cuanto más fina la grilla, más celdas mudas — y no porque haya menos voces, sino porque
            la pregunta se hace más chica. El porcentaje se lee junto al tamaño de celda, nunca
            solo.
          </p>
        </Control>

        <Control etiqueta="Qué se pinta">
          <Segmentado
            valor={mostrar}
            onCambiar={setMostrar}
            opciones={[
              { id: 'mudas', etiqueta: 'Solo el silencio' },
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
        bajo="Alguien habló"
        alto="Nadie habló"
        titulo="Cobertura del encuadre"
      />
    ),
  };
}
