import { planTerritorialCoverage, pointInCoverageArea } from '@v2/civic-core';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Layer, Map as MapaGL, Source, type MapRef } from 'react-map-gl/maplibre';

import { escribirAreaEnHash } from '../instrumento/area-url';
import { contarArea } from '../instrumento/conteo';
import { LazoOverlay } from '../instrumento/LazoOverlay';
import { PanelArea } from '../instrumento/PanelArea';

import type { GeoPoint } from '@v2/civic-core';
import type { CapaMapa, SenalMapa } from '~/lib/queries/civic-map';

import { CAPAS, NOMBRE_CAPA, useSenalesMapa } from '~/lib/queries/civic-map';
import { cn } from '~/lib/utils';

import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * PROTOTIPO — el instrumento sobre maplibre, para comparar contra el lienzo SVG.
 *
 * No reemplaza nada: vive en su propia ruta y no se linkea desde ningún lado.
 * Existe para responder una sola pregunta que no se contesta discutiendo —
 * ¿un mapa de teselas puede parecer Papel y Tinta, o siempre va a parecer un
 * mapa ajeno con un filtro encima?
 *
 * Lo que este archivo demuestra, además de lo visual: TODO lo que no es dibujo
 * se reusa sin tocar. El conteo honesto, el panel del área, la cobertura, la
 * URL citable y hasta el propio lazo son los mismos módulos que usa el lienzo.
 * Lo único que cambió es cómo se pasa de un píxel a un punto geográfico —
 * `map.unproject()` en vez de la inversa precomputada. Si mañana se decide
 * cambiar de motor, esto es lo que cuesta.
 */

/**
 * Las formas GeoJSON que este archivo necesita, declaradas acá.
 *
 * `@types/geojson` no está en el árbol de esta app, y un prototipo no
 * justifica meter una dependencia al presupuesto para tres interfaces.
 */
interface FeatureGeo {
  type: 'Feature';
  id?: string;
  geometry:
    | { type: 'Point'; coordinates: [number, number] }
    | { type: 'Polygon'; coordinates: number[][][] };
  properties: Record<string, string | number>;
}
interface ColeccionGeo {
  type: 'FeatureCollection';
  features: FeatureGeo[];
}

const VISTA_INICIAL = { longitude: -63.6, latitude: -38.4, zoom: 3.6 };
const ESTILO_PAPEL = '/maps/papel.json';
const CELDAS_OBJETIVO = 48;

/** Los colores del sistema, no los de un mapa de navegación. */
const COLOR_CAPA: Record<CapaMapa, string> = {
  voz: '#5227CC',
  pulso: '#0F6B8A',
  propuesta: '#A16C00',
  mandato: '#1A7A4A',
};

/**
 * El radio del halo, en metros reales de terreno.
 *
 * maplibre puede dibujar círculos en metros (`circle-radius` con
 * `pitch-alignment: map` no alcanza; se usa la expresión por zoom), así que acá
 * el halo SÍ representa la incertidumbre a escala — que es lo que el lienzo
 * SVG solo puede aproximar. Es la ventaja concreta del motor de teselas para
 * el render honesto, no solo para las calles.
 */
const METROS_POR_PRECISION: Record<string, number> = {
  exact: 0,
  '100m': 71,
  '500m': 354,
  neighborhood: 1061,
  city: 3536,
};

export function InstrumentoMaplibre() {
  const mapRef = useRef<MapRef>(null);
  const [capas, setCapas] = useState<CapaMapa[]>([...CAPAS]);
  const [lazoActivo, setLazoActivo] = useState(false);
  const [poligono, setPoligono] = useState<GeoPoint[] | null>(null);

  const senales = useSenalesMapa({ capas, rango: 'todo' }, true);

  const conCoordenada = useMemo(
    () =>
      (senales.data ?? []).filter(
        (s): s is SenalMapa & { lat: number; lng: number } =>
          typeof s.lat === 'number' && typeof s.lng === 'number',
      ),
    [senales.data],
  );

  const geojson = useMemo<ColeccionGeo>(
    () => ({
      type: 'FeatureCollection',
      features: conCoordenada.map((s) => ({
        type: 'Feature' as const,
        id: s.id,
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] as [number, number] },
        properties: {
          color: COLOR_CAPA[s.capa],
          // El halo en metros de terreno: si es 0 no se dibuja, porque no hay
          // incertidumbre que mostrar.
          halo: METROS_POR_PRECISION[s.precision] ?? 0,
          nitido: s.precision === 'exact' ? 1 : 0,
        },
      })),
    }),
    [conCoordenada],
  );

  /**
   * La desproyección del lazo, ahora a cargo de maplibre. Es la única línea que
   * cambia respecto del lienzo: el resto del componente del lazo es idéntico.
   */
  const desproyectarPixel = useCallback((x: number, y: number): GeoPoint => {
    const mapa = mapRef.current;
    if (!mapa) return { lat: 0, lng: 0 };
    const { lat, lng } = mapa.unproject([x, y]);
    return { lat, lng };
  }, []);

  /** Sin coordenada no hay polígono que las contenga: se cuentan aparte. */
  const provinciasTocadas = useMemo(() => new Set<number>(), []);

  const conteo = useMemo(
    () => (poligono ? contarArea(senales.data ?? [], poligono, provinciasTocadas) : null),
    [poligono, senales.data, provinciasTocadas],
  );

  const cobertura = useMemo(() => {
    if (!poligono || !conteo) return null;
    const plan = planTerritorialCoverage({ points: poligono }, { cellCount: CELDAS_OBJETIVO });
    if (!plan.valid || plan.cells.length === 0) return null;
    const contadas = new Set(conteo.contadas);
    const puntos = conCoordenada
      .filter((s) => contadas.has(s.id))
      .map((s) => ({ lat: s.lat, lng: s.lng }));
    let mudas = 0;
    for (const celda of plan.cells) {
      if (!puntos.some((p) => pointInCoverageArea(p, celda.geometry))) mudas += 1;
    }
    return {
      total: plan.cells.length,
      mudas,
      ladoMetros: Math.round(plan.effectiveCellSizeMeters ?? 0),
    };
  }, [poligono, conteo, conCoordenada]);

  const areaGeojson = useMemo<ColeccionGeo>(
    () => ({
      type: 'FeatureCollection',
      features: poligono
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [[...poligono.map((p) => [p.lng, p.lat]), [poligono[0]?.lng ?? 0, poligono[0]?.lat ?? 0]]],
              },
            },
          ]
        : [],
    }),
    [poligono],
  );

  const sinCoordenada = (senales.data?.length ?? 0) - conCoordenada.length;

  return (
    <div className="grid grid-cols-[1fr_400px] items-start gap-8 max-[1100px]:grid-cols-1">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {CAPAS.map((capa) => {
            const activa = capas.includes(capa);
            return (
              <button
                key={capa}
                type="button"
                onClick={() => {
                  setCapas((p) => (p.includes(capa) ? p.filter((c) => c !== capa) : [...p, capa]));
                }}
                className={cn(
                  'font-space border px-3 py-1 text-[11px] uppercase tracking-[0.08em]',
                  activa ? 'border-tinta bg-tinta text-papel' : 'border-tinta text-tinta',
                )}
              >
                {NOMBRE_CAPA[capa]}
              </button>
            );
          })}
          <span className="bg-tinta/20 mx-1 h-5 w-px" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setLazoActivo((v) => !v);
            }}
            className={cn(
              'font-space border px-3 py-1 text-[11px] uppercase tracking-[0.08em]',
              lazoActivo ? 'border-violeta bg-violeta text-papel' : 'border-violeta text-violeta',
            )}
          >
            {lazoActivo ? 'dibujando…' : 'dibujar un área'}
          </button>
          {poligono ? (
            <button
              type="button"
              onClick={() => {
                setPoligono(null);
              }}
              className="font-space text-tinta-30 hover:text-tinta text-[11px] uppercase tracking-[0.08em]"
            >
              limpiar
            </button>
          ) : null}
        </div>

        <div className="border-tinta bg-papel-crudo relative border p-2">
          <div className="relative h-[70vh] w-full">
            <MapaGL
              ref={mapRef}
              initialViewState={VISTA_INICIAL}
              mapStyle={ESTILO_PAPEL}
              // El lazo se dibuja encima: mientras esté activo, arrastrar tiene
              // que trazar y no mover el mapa.
              dragPan={!lazoActivo}
              style={{ width: '100%', height: '100%' }}
              attributionControl
            >
              <Source id="area" type="geojson" data={areaGeojson}>
                <Layer
                  id="area-relleno"
                  type="fill"
                  paint={{ 'fill-color': '#5227CC', 'fill-opacity': 0.12 }}
                />
                <Layer
                  id="area-borde"
                  type="line"
                  paint={{ 'line-color': '#5227CC', 'line-width': 1.5 }}
                />
              </Source>

              <Source id="senales" type="geojson" data={geojson}>
                {/* El halo, en metros REALES de terreno: crece al alejarse el
                    zoom igual que crecería la duda sobre el mapa. */}
                <Layer
                  id="senales-halo"
                  type="circle"
                  filter={['>', ['get', 'halo'], 0]}
                  paint={{
                    'circle-color': ['get', 'color'],
                    'circle-opacity': 0.16,
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
                    'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 14, 6],
                    'circle-stroke-color': '#F2EFE7',
                    'circle-stroke-width': ['case', ['==', ['get', 'nitido'], 1], 1.2, 0],
                  }}
                />
              </Source>
            </MapaGL>

            {lazoActivo ? (
              <LazoOverlay
                viewBox={{ x: 0, y: 0, ancho: 0, alto: 0 }}
                desproyectarPixel={desproyectarPixel}
                onCompletar={(nuevo) => {
                  setLazoActivo(false);
                  if (nuevo) setPoligono(nuevo);
                }}
                onCancelar={() => {
                  setLazoActivo(false);
                }}
              />
            ) : null}
          </div>
        </div>

        <p className="font-space text-tinta-30 mt-3 text-[10px] uppercase tracking-[0.12em]">
          {conCoordenada.length} con lugar propio · {sinCoordenada} solo con provincia, que este
          motor todavía no dibuja
        </p>
      </div>

      {conteo ? (
        <PanelArea
          conteo={conteo}
          senales={senales.data ?? []}
          cobertura={cobertura}
          enlace={poligono ? escribirAreaEnHash(poligono, capas) : '#'}
          onLimpiar={() => {
            setPoligono(null);
          }}
        />
      ) : (
        <aside className="border-tinta bg-papel-crudo border p-6">
          <h3 className="font-space text-tinta mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">
            Prototipo
          </h3>
          <p className="text-tinta text-[15px] leading-normal">
            Mismo panel, mismo conteo, mismo lazo que el instrumento de{' '}
            <code className="font-space text-[13px]">/el-mapa</code>. Lo único distinto es quién
            dibuja el mapa.
          </p>
          <p className="font-space text-tinta-30 mt-3 text-[11px] leading-relaxed">
            Dibujá un área para comparar el resultado contra el lienzo de papel.
          </p>
        </aside>
      )}
    </div>
  );
}
