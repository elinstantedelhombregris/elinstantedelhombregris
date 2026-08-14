import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { Control } from '../Chrome';
import { COLOR_CLASE } from '../paleta';
import { Vacio } from '../Vacio';

import type { ContextoModo, ResultadoModo } from './tipos';

import { cn } from '~/lib/utils';

/**
 * Modo Línea de tiempo — cómo se fue despertando el país.
 *
 * Es la pieza narrativa: no dice cuántas voces hay, dice cómo llegaron. Un
 * mapa que se llena mes a mes cuenta algo que un mapa lleno no puede contar.
 *
 * La fecha del scrubber es la de CARGA, no la del hecho. Es una diferencia
 * real y se declara en el panel: alguien puede subir hoy un reclamo de hace
 * dos años. La línea muestra cuándo se dijo, no cuándo pasó.
 */

const VELOCIDADES = [
  { id: 'lenta', etiqueta: '1×', diasPorSegundo: 15 },
  { id: 'media', etiqueta: '3×', diasPorSegundo: 45 },
  { id: 'rapida', etiqueta: '8×', diasPorSegundo: 120 },
] as const;

const DIA = 86_400_000;

export function useModoTiempo(ctx: ContextoModo): ResultadoModo {
  const [corriendo, setCorriendo] = useState(false);
  const [velocidad, setVelocidad] = useState<(typeof VELOCIDADES)[number]['id']>('media');
  const [corte, setCorte] = useState<number | null>(null);
  const marcoRef = useRef<number | null>(null);

  /** El rango real de los datos: desde la primera voz hasta la última. */
  const rango = useMemo(() => {
    const tiempos = ctx.todas
      .map((s) => Date.parse(s.createdAt))
      .filter((t) => Number.isFinite(t));
    if (tiempos.length === 0) return null;
    return { desde: Math.min(...tiempos), hasta: Math.max(...tiempos) };
  }, [ctx.todas]);

  // Al llegar los datos, el corte arranca al final: el mapa completo primero,
  // y quien quiera ver cómo se llenó lo rebobina.
  useEffect(() => {
    if (rango && corte === null) setCorte(rango.hasta);
  }, [rango, corte]);

  const diasPorSegundo =
    VELOCIDADES.find((v) => v.id === velocidad)?.diasPorSegundo ?? 45;

  useEffect(() => {
    if (!corriendo || !rango) return;
    let anterior = performance.now();
    const paso = (ahora: number) => {
      const delta = (ahora - anterior) / 1000;
      anterior = ahora;
      setCorte((previo) => {
        const base = previo ?? rango.desde;
        const siguiente = base + delta * diasPorSegundo * DIA;
        if (siguiente >= rango.hasta) {
          setCorriendo(false);
          return rango.hasta;
        }
        return siguiente;
      });
      marcoRef.current = requestAnimationFrame(paso);
    };
    marcoRef.current = requestAnimationFrame(paso);
    return () => {
      if (marcoRef.current !== null) cancelAnimationFrame(marcoRef.current);
    };
  }, [corriendo, rango, diasPorSegundo]);

  const hasta = corte ?? rango?.hasta ?? Date.now();

  const visibles = useMemo(
    () =>
      ctx.todas.filter(
        (s) =>
          typeof s.lat === 'number' &&
          typeof s.lng === 'number' &&
          Date.parse(s.createdAt) <= hasta,
      ),
    [ctx.todas, hasta],
  );

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: visibles.map((s) => ({
        type: 'Feature' as const,
        properties: { color: s.claseSenal === null ? '#8E8A82' : COLOR_CLASE[s.claseSenal] },
        geometry: { type: 'Point' as const, coordinates: [s.lng ?? 0, s.lat ?? 0] },
      })),
    }),
    [visibles],
  );

  const fecha = new Date(hasta).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const progreso =
    rango && rango.hasta > rango.desde
      ? ((hasta - rango.desde) / (rango.hasta - rango.desde)) * 100
      : 100;

  return {
    titulo: 'Línea de tiempo',
    descripcion: 'Mirá aparecer las voces en el orden en que se dijeron.',

    panel: (
      <>
        <Control etiqueta="Velocidad">
          <div className="border-oscuro-borde grid grid-flow-col border">
            {VELOCIDADES.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={velocidad === v.id}
                onClick={() => {
                  setVelocidad(v.id);
                }}
                className={cn(
                  'font-space px-3 py-2 text-[11px] uppercase tracking-[0.08em]',
                  velocidad === v.id
                    ? 'bg-oscuro-borde text-oscuro-texto'
                    : 'text-oscuro-meta hover:text-oscuro-secundario',
                )}
              >
                {v.etiqueta}
              </button>
            ))}
          </div>
        </Control>

        <Control etiqueta="Qué muestra la fecha">
          <p className="text-oscuro-secundario text-[13px] leading-relaxed">
            La fecha en que la voz se <strong>cargó</strong>, no la del hecho. Alguien puede subir
            hoy un reclamo de hace dos años: esta línea cuenta cuándo se dijo, no cuándo pasó.
          </p>
        </Control>

        <Control etiqueta="En pantalla">
          <p className="font-anton text-violeta-claro text-[26px] leading-none tabular-nums">
            {visibles.length.toLocaleString('es-AR')}
          </p>
          <p className="font-space text-oscuro-meta mt-1 text-[10px] uppercase tracking-[0.12em]">
            voces al {fecha}
          </p>
        </Control>
      </>
    ),

    capas: (
      <Source id="tiempo" type="geojson" data={geojson}>
        <Layer
          id="tiempo-punto"
          type="circle"
          paint={{
            'circle-color': ['get', 'color'],
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.5, 8, 4, 14, 7],
            'circle-opacity': 0.85,
          }}
        />
      </Source>
    ),

    sobreMapa: ctx.todas.length === 0 && !ctx.cargando ? (
      <Vacio
        titulo="La línea arranca cuando alguien la arranque."
        cuerpo="Acá va a verse el día que el mapa se despertó."
      />
    ) : rango ? (
      <div className="pointer-events-auto absolute inset-x-4 bottom-4 z-10">
        <div className="border-oscuro-borde bg-oscuro-barra/95 flex items-center gap-4 border px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              // Volver a arrancar desde el principio si ya terminó.
              if (!corriendo && hasta >= rango.hasta) setCorte(rango.desde);
              setCorriendo((v) => !v);
            }}
            aria-label={corriendo ? 'Pausar' : 'Reproducir'}
            className="border-oscuro-borde text-oscuro-texto hover:border-violeta-claro hover:text-violeta-claro flex h-9 w-9 shrink-0 items-center justify-center border"
          >
            {corriendo ? '⏸' : '▶'}
          </button>

          <input
            type="range"
            min={rango.desde}
            max={rango.hasta}
            value={hasta}
            onChange={(e) => {
              setCorriendo(false);
              setCorte(Number(e.target.value));
            }}
            aria-label="Momento de la línea de tiempo"
            className="accent-violeta-claro flex-1"
          />

          <span className="font-space text-oscuro-texto shrink-0 text-[12px] tabular-nums">
            {fecha}
          </span>
          <span className="font-space text-oscuro-meta shrink-0 text-[11px] tabular-nums">
            {visibles.length.toLocaleString('es-AR')} · {Math.round(progreso)}%
          </span>
        </div>
      </div>
    ) : null,
  };
}
