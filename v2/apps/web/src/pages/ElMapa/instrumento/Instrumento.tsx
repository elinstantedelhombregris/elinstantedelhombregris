import { planTerritorialCoverage, pointInCoverageArea } from '@v2/civic-core';
import { useMemo, useState } from 'react';

import { CapaSenales } from '../lienzo/CapaSenales';
import { etiquetaDePrecision, precisionValida } from '../lienzo/precision';
import { aAtributo, encuadrar } from '../lienzo/useAltitud';

import { escribirAreaEnHash } from './area-url';
import { contarArea } from './conteo';
import { LazoOverlay } from './LazoOverlay';
import { PanelArea } from './PanelArea';

import type { SenalDibujable } from '../lienzo/CapaSenales';
import type { GeoPoint } from '@v2/civic-core';
import type { CapaMapa } from '~/lib/queries/civic-map';

import { PROVINCIAS_SVG } from '~/geo/pais.generated';
import { MAPA_ALTO, MAPA_ANCHO, desproyectar, proyectar } from '~/geo/proyeccion.generated';
import { CAPAS, NOMBRE_CAPA, useCapasDisponibles, useSenalesMapa } from '~/lib/queries/civic-map';
import { useProvincias } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

/**
 * El instrumento (spec 3). Vive abajo del pliegue de `/el-mapa` y se monta
 * perezosamente: mientras nadie lo pide, no se fetchea un solo byte, porque
 * los 30 segundos de arriba no pagan el análisis de abajo.
 */

const VIEWBOX_PAIS = { x: 0, y: 0, ancho: MAPA_ANCHO, alto: MAPA_ALTO };
const CELDAS_OBJETIVO = 48;
const FILL_CAPA: Record<CapaMapa, string> = {
  voz: 'fill-violeta',
  pulso: 'fill-cian',
  propuesta: 'fill-ambar',
  mandato: 'fill-verde',
};

export interface InstrumentoProps {
  /** Área precargada desde la URL, cuando alguien abre un link compartido. */
  areaInicial?: readonly GeoPoint[];
  capasIniciales?: readonly CapaMapa[];
}

export function Instrumento({ areaInicial, capasIniciales }: InstrumentoProps) {
  const [capas, setCapas] = useState<CapaMapa[]>(() => [...(capasIniciales ?? CAPAS)]);
  const [rango, setRango] = useState<'7d' | '30d' | 'todo'>('todo');
  const [lazoActivo, setLazoActivo] = useState(false);
  const [poligono, setPoligono] = useState<GeoPoint[] | null>(
    areaInicial && areaInicial.length >= 3 ? [...areaInicial] : null,
  );

  const senales = useSenalesMapa({ capas, rango }, true);
  const disponibles = useCapasDisponibles(true);
  const provincias = useProvincias();

  const idPorNombre = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.name, p.id])),
    [provincias.data],
  );

  /**
   * Las provincias que el polígono toca. Se testea el centroide y los vértices
   * del bbox: alcanza para saber si el área roza la provincia, que es todo lo
   * que el conteo honesto necesita para NOMBRARLA sin contar sus señales.
   */
  const provinciasTocadas = useMemo(() => {
    const tocadas = new Set<number>();
    if (!poligono) return tocadas;
    for (const prov of PROVINCIAS_SVG) {
      const id = idPorNombre.get(prov.nombre);
      if (id === undefined) continue;
      const [minX, minY, maxX, maxY] = prov.bbox;
      const puntos = [
        desproyectar(prov.cx, prov.cy),
        desproyectar(minX, minY),
        desproyectar(maxX, minY),
        desproyectar(minX, maxY),
        desproyectar(maxX, maxY),
      ];
      if (puntos.some((p) => pointInCoverageArea({ lat: p.lat, lng: p.lng }, { points: poligono }))) {
        tocadas.add(id);
      }
    }
    return tocadas;
  }, [poligono, idPorNombre]);

  const conteo = useMemo(() => {
    if (!poligono) return null;
    return contarArea(senales.data ?? [], poligono, provinciasTocadas);
  }, [poligono, senales.data, provinciasTocadas]);

  /**
   * El mapa del silencio: la grilla que `coverage.ts` del núcleo tira sobre el
   * polígono, con las celdas que no tienen ninguna señal adentro.
   */
  const cobertura = useMemo(() => {
    if (!poligono || !conteo) return null;
    const plan = planTerritorialCoverage({ points: poligono }, { cellCount: CELDAS_OBJETIVO });
    if (!plan.valid || plan.cells.length === 0) return null;

    const contadas = new Set(conteo.contadas);
    // flatMap en vez de filter+map: estrecha el tipo de verdad en vez de
    // afirmarlo con `!`, que acá sería una promesa que el compilador no ve.
    const puntos = (senales.data ?? []).flatMap((s) =>
      contadas.has(s.id) && typeof s.lat === 'number' && typeof s.lng === 'number'
        ? [{ lat: s.lat, lng: s.lng }]
        : [],
    );

    let mudas = 0;
    for (const celda of plan.cells) {
      const tiene = puntos.some((p) => pointInCoverageArea(p, celda.geometry));
      if (!tiene) mudas += 1;
    }
    return {
      total: plan.cells.length,
      mudas,
      ladoMetros: Math.round(plan.effectiveCellSizeMeters ?? 0),
    };
  }, [poligono, conteo, senales.data]);

  const dibujables = useMemo<SenalDibujable[]>(
    () =>
      (senales.data ?? [])
        .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
        .map((s) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          precision: s.precision,
          fill: FILL_CAPA[s.capa],
          etiqueta: `${NOMBRE_CAPA[s.capa]}: «${s.texto.slice(0, 80)}» — ${etiquetaDePrecision(precisionValida(s.precision))}`,
        })),
    [senales.data],
  );

  /**
   * Al abrir un link con área, el lienzo arranca encuadrado en esa zona: quien
   * recibe el link tiene que ver el recorte, no el país entero con una manchita.
   */
  const viewBox = useMemo(() => {
    if (!poligono) return VIEWBOX_PAIS;
    const puntos = poligono.map((p) => proyectar(p.lng, p.lat));
    const xs = puntos.map((p) => p.x);
    const ys = puntos.map((p) => p.y);
    return encuadrar([
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs),
      Math.max(...ys),
    ]);
  }, [poligono]);

  const toggleCapa = (capa: CapaMapa) => {
    setCapas((previo) =>
      previo.includes(capa) ? previo.filter((c) => c !== capa) : [...previo, capa],
    );
  };

  const enlace = poligono ? escribirAreaEnHash(poligono, capas) : '#instrumento';

  return (
    <div className="grid grid-cols-[1fr_400px] items-start gap-8 max-[1100px]:grid-cols-1">
      <div>
        <BarraFiltros
          capas={capas}
          disponibles={disponibles.data}
          rango={rango}
          onCapa={toggleCapa}
          onRango={setRango}
          lazoActivo={lazoActivo}
          onLazo={() => {
            setLazoActivo((v) => !v);
          }}
          hayArea={poligono !== null}
          onLimpiar={() => {
            setPoligono(null);
          }}
        />

        <div className="border-tinta bg-papel-crudo relative border p-6 max-[560px]:p-3">
          <svg
            viewBox={aAtributo(viewBox)}
            className="mx-auto block max-h-[70vh] w-full"
            role="group"
            aria-label="Mapa del instrumento: las señales del país"
          >
            {PROVINCIAS_SVG.map((prov) => (
              <path
                key={prov.nombre}
                d={prov.path}
                strokeWidth={1}
                aria-hidden
                className="fill-papel-mapa stroke-tinta"
              />
            ))}
            <CapaSenales
              senales={dibujables}
              provincias={PROVINCIAS_SVG}
              conteoProvincial={new Map()}
              escala={1}
            />
            {poligono ? <PoligonoDibujado poligono={poligono} /> : null}
          </svg>

          {lazoActivo ? (
            <LazoOverlay
              viewBox={viewBox}
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

      {conteo ? (
        <PanelArea
          conteo={conteo}
          senales={senales.data ?? []}
          cobertura={cobertura}
          enlace={enlace}
          onLimpiar={() => {
            setPoligono(null);
          }}
        />
      ) : (
        <SinArea cargando={senales.isLoading} total={senales.data?.length ?? 0} />
      )}
    </div>
  );
}

/** El polígono cerrado, dibujado sobre el lienzo en unidades del viewBox. */
function PoligonoDibujado({ poligono }: { poligono: readonly GeoPoint[] }) {
  const d = useMemo(() => {
    const puntos = poligono.map((p) => {
      const svg = proyectar(p.lng, p.lat);
      return `${String(svg.x)},${String(svg.y)}`;
    });
    return `M${puntos.join(' L')} Z`;
  }, [poligono]);
  return <path d={d} aria-hidden className="fill-violeta/15 stroke-violeta" strokeWidth={1.5} />;
}

function BarraFiltros({
  capas,
  disponibles,
  rango,
  onCapa,
  onRango,
  lazoActivo,
  onLazo,
  hayArea,
  onLimpiar,
}: {
  capas: readonly CapaMapa[];
  disponibles: Record<CapaMapa, number> | undefined;
  rango: '7d' | '30d' | 'todo';
  onCapa: (capa: CapaMapa) => void;
  onRango: (rango: '7d' | '30d' | 'todo') => void;
  lazoActivo: boolean;
  onLazo: () => void;
  hayArea: boolean;
  onLimpiar: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {CAPAS.map((capa) => {
        const cantidad = disponibles?.[capa] ?? 0;
        const vacia = cantidad === 0;
        const activa = capas.includes(capa);
        return (
          <button
            key={capa}
            type="button"
            disabled={vacia}
            onClick={() => {
              onCapa(capa);
            }}
            // Las capas sin datos se muestran deshabilitadas con su razón, no
            // escondidas: que el mapa tenga cuatro capas es parte de lo que
            // comunica (spec 3 §6).
            title={vacia ? `Todavía no hay ${NOMBRE_CAPA[capa]} con ubicación` : undefined}
            className={cn(
              'font-space border px-3 py-1 text-[11px] uppercase tracking-[0.08em]',
              vacia && 'border-tinta/20 text-tinta-30 cursor-not-allowed',
              !vacia && activa && 'border-tinta bg-tinta text-papel',
              !vacia && !activa && 'border-tinta text-tinta',
            )}
          >
            {NOMBRE_CAPA[capa]}
            {vacia ? ' (0)' : ` (${String(cantidad)})`}
          </button>
        );
      })}

      <span className="bg-tinta/20 mx-1 h-5 w-px" aria-hidden />

      {(['7d', '30d', 'todo'] as const).map((valor) => (
        <button
          key={valor}
          type="button"
          onClick={() => {
            onRango(valor);
          }}
          className={cn(
            'font-space border px-3 py-1 text-[11px] uppercase tracking-[0.08em]',
            rango === valor ? 'border-tinta bg-tinta text-papel' : 'border-tinta text-tinta',
          )}
        >
          {valor === 'todo' ? 'todo' : valor === '7d' ? '7 días' : '30 días'}
        </button>
      ))}

      <span className="bg-tinta/20 mx-1 h-5 w-px" aria-hidden />

      <button
        type="button"
        onClick={onLazo}
        className={cn(
          'font-space border px-3 py-1 text-[11px] uppercase tracking-[0.08em]',
          lazoActivo ? 'border-violeta bg-violeta text-papel' : 'border-violeta text-violeta',
        )}
      >
        {lazoActivo ? 'dibujando…' : 'dibujar un área'}
      </button>

      {hayArea ? (
        <button
          type="button"
          onClick={onLimpiar}
          className="font-space text-tinta-30 hover:text-tinta text-[11px] uppercase tracking-[0.08em]"
        >
          limpiar
        </button>
      ) : null}
    </div>
  );
}

function SinArea({ cargando, total }: { cargando: boolean; total: number }) {
  return (
    <aside className="border-tinta bg-papel-crudo border p-6">
      <h3 className="font-space text-tinta mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">
        Todavía no dibujaste nada
      </h3>
      <p className="text-tinta text-[15px] leading-normal">
        {cargando
          ? 'Cargando las señales del país…'
          : `Hay ${String(total)} señales en pantalla. Dibujá un área para ver qué pasa adentro.`}
      </p>
      <p className="font-space text-tinta-30 mt-3 text-[11px] leading-relaxed">
        Si no podés dibujar, elegí una provincia en el mapa de arriba: llegás al mismo panel.
      </p>
    </aside>
  );
}
