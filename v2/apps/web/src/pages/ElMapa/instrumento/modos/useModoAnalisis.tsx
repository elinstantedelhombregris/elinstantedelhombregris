import { PROVINCIAS_REF } from '@v2/civic-core';
import { useEffect, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { Control, FiltroClases, LeyendaRampa, Segmentado } from '../Chrome';
import { COLOR_CLASE, RAMPAS } from '../paleta';
import { AVISO_TEMAS, temasDe } from '../temas';
import { Vacio } from '../Vacio';

import type { ContextoModo, ResultadoModo } from './tipos';
import type { SenalConTipo } from '../useVistaMapa';


import { useProvincias } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';
import { CLASE_ROTULO, type ClaseSenal } from '~/lib/vocabulario';

/**
 * Modo Análisis — qué provincia habla, cuánto, y QUÉ DICE.
 *
 * El coroplético solo contesta la primera mitad. Tocar una provincia contesta
 * la segunda: de qué está hecho ese color. Un mapa que pinta intensidades sin
 * dejar leer el contenido convierte a la gente en una métrica, que es
 * exactamente lo contrario de lo que esta plataforma existe para hacer.
 *
 * DEPARTAMENTOS: falta la capa del IGN (~530 unidades). El nivel se muestra
 * deshabilitado con su razón en vez de esconderse.
 */

type Metrica = 'total' | 'porHabitante' | 'densidad';
type NivelGeo = 'provincia' | 'departamento';
type Rango = '7d' | '30d' | 'todo';

const DIAS: Record<'7d' | '30d', number> = { '7d': 7, '30d': 30 };

const METRICAS: { id: Metrica; etiqueta: string; explica: string; unidad: string }[] = [
  {
    id: 'total',
    etiqueta: 'Total',
    explica:
      'El total crudo. Buenos Aires siempre gana porque tiene 17 millones de personas — sirve para saber dónde hay volumen, no dónde hay intensidad.',
    unidad: 'voces',
  },
  {
    id: 'porHabitante',
    etiqueta: 'Por habitante',
    explica:
      'Voces cada 100.000 habitantes. Acá una provincia chica que habla mucho deja de desaparecer detrás del conurbano.',
    unidad: 'cada 100 mil hab.',
  },
  {
    id: 'densidad',
    etiqueta: 'Por territorio',
    explica:
      'Voces cada 1.000 km². Muestra concentración geográfica: Santa Cruz y CABA dicen cosas muy distintas con el mismo total.',
    unidad: 'cada 1.000 km²',
  },
];

export function useModoAnalisis(ctx: ContextoModo): ResultadoModo {
  const [nivel, setNivel] = useState<NivelGeo>('provincia');
  const [metrica, setMetrica] = useState<Metrica>('total');
  const [rango, setRango] = useState<Rango>('todo');
  const [clases, setClases] = useState<Set<ClaseSenal>>(
    () => new Set(Object.keys(COLOR_CLASE) as ClaseSenal[]),
  );
  const [rampa, setRampa] = useState<keyof typeof RAMPAS>('violeta');
  const [opacidad, setOpacidad] = useState(0.8);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [geometria, setGeometria] = useState<unknown>(null);
  const provincias = useProvincias();

  useEffect(() => {
    let vivo = true;
    void fetch('/geo/provincias.geojson')
      .then((r) => r.json())
      .then((g: unknown) => {
        if (vivo) setGeometria(g);
      })
      .catch(() => {
        /* sin geometría el modo lo dice; no rompe la página */
      });
    return () => {
      vivo = false;
    };
  }, []);

  /** Las señales que pasan los filtros del panel. */
  const filtradas = useMemo(() => {
    const desde = rango === 'todo' ? 0 : Date.now() - DIAS[rango] * 86_400_000;
    return ctx.todas.filter(
      (s) =>
        (s.claseSenal === null || clases.has(s.claseSenal)) &&
        (rango === 'todo' || Date.parse(s.createdAt) >= desde),
    );
  }, [ctx.todas, clases, rango]);

  /** Las voces agrupadas por nombre de provincia — el GeoJSON no sabe de ids. */
  const porNombre = useMemo(() => {
    const nombrePorId = new Map((provincias.data ?? []).map((p) => [p.id, p.name]));
    const cuenta = new Map<string, SenalConTipo[]>();
    for (const s of filtradas) {
      if (s.provinceId === null) continue;
      const nombre = nombrePorId.get(s.provinceId);
      if (nombre === undefined) continue;
      const lista = cuenta.get(nombre) ?? [];
      lista.push(s);
      cuenta.set(nombre, lista);
    }
    return cuenta;
  }, [filtradas, provincias.data]);

  const conValores = useMemo(() => {
    if (!geometria || typeof geometria !== 'object') return null;
    const col = geometria as { features: { properties: { name: string } }[] };
    const calcular = (nombre: string): number => {
      const total = porNombre.get(nombre)?.length ?? 0;
      const ref = PROVINCIAS_REF[nombre];
      if (metrica === 'total' || !ref) return total;
      if (metrica === 'porHabitante') return ref.pob > 0 ? (total / ref.pob) * 100 : 0;
      return ref.km2 > 0 ? total / ref.km2 : 0;
    };
    return {
      type: 'FeatureCollection' as const,
      features: col.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          valor: calcular(f.properties.name),
          elegida: f.properties.name === seleccionada ? 1 : 0,
        },
      })),
    };
  }, [geometria, porNombre, metrica, seleccionada]);

  const maximo = useMemo(() => {
    if (!conValores) return 1;
    return Math.max(1, ...conValores.features.map((f) => f.properties.valor));
  }, [conValores]);

  const colores = RAMPAS[rampa]?.colores ?? ['#241F17', '#3B2A66', '#5227CC', '#9D85E8'];
  const metricaActiva = METRICAS.find((m) => m.id === metrica) ?? METRICAS[0];

  /** Lo que dice la provincia elegida. */
  const detalle = useMemo(() => {
    if (seleccionada === null) return null;
    const lista = porNombre.get(seleccionada) ?? [];
    const porClase = new Map<ClaseSenal, number>();
    for (const s of lista) {
      if (s.claseSenal === null) continue;
      porClase.set(s.claseSenal, (porClase.get(s.claseSenal) ?? 0) + 1);
    }
    const valor =
      conValores?.features.find((f) => f.properties.name === seleccionada)?.properties.valor ?? 0;
    return {
      nombre: seleccionada,
      lista,
      valor,
      porClase: [...porClase.entries()].sort((a, b) => b[1] - a[1]),
      temas: temasDe(lista.map((s) => s.texto)),
    };
  }, [seleccionada, porNombre, conValores]);

  const alternarClase = (clase: ClaseSenal) => {
    setClases((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(clase)) siguiente.delete(clase);
      else siguiente.add(clase);
      return siguiente;
    });
  };

  return {
    titulo: 'Análisis',
    descripcion: 'Qué provincia habla, cuánto, y qué dice. Tocá una para leerla.',
    capasInteractivas: ['provincias-relleno'],
    onClickCapa: (_id, props) => {
      const nombre = typeof props.name === 'string' ? props.name : null;
      setSeleccionada((previo) => (previo === nombre ? null : nombre));
    },

    panel: (
      <>
        <Control etiqueta="Nivel geográfico">
          <Segmentado
            valor={nivel}
            onCambiar={setNivel}
            opciones={[
              { id: 'provincia', etiqueta: 'Provincia' },
              { id: 'departamento', etiqueta: 'Departamento' },
            ]}
          />
          {nivel === 'departamento' ? (
            <p className="text-oscuro-meta mt-2 text-[11px] leading-relaxed">
              Todavía no está: falta la capa de departamentos del IGN. Se muestra igual porque el
              nivel existe y va a llegar.
            </p>
          ) : null}
        </Control>

        <Control etiqueta="Métrica">
          <div className="border-oscuro-borde grid grid-cols-3 border">
            {METRICAS.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={metrica === m.id}
                onClick={() => {
                  setMetrica(m.id);
                }}
                className={cn(
                  'font-space px-2 py-2 text-[10px] uppercase tracking-[0.06em]',
                  metrica === m.id
                    ? 'bg-oscuro-borde text-oscuro-texto'
                    : 'text-oscuro-meta hover:text-oscuro-secundario',
                )}
              >
                {m.etiqueta}
              </button>
            ))}
          </div>
          <p className="text-oscuro-meta mt-2 text-[11px] leading-relaxed">
            {metricaActiva?.explica}
          </p>
        </Control>

        <Control etiqueta="Cuándo se dijo">
          <Segmentado
            valor={rango}
            onCambiar={setRango}
            opciones={[
              { id: '7d', etiqueta: '7 días' },
              { id: '30d', etiqueta: '30 días' },
              { id: 'todo', etiqueta: 'Todo' },
            ]}
          />
        </Control>

        <Control etiqueta="Tipos de voz">
          <FiltroClases activos={clases} onAlternar={alternarClase} />
          <p className="text-oscuro-meta mt-2 text-[11px]">
            {filtradas.length.toLocaleString('es-AR')} voces pasan los filtros.
          </p>
        </Control>

        <Control etiqueta="Paleta">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(RAMPAS).map(([id, r]) => (
              <button
                key={id}
                type="button"
                aria-pressed={rampa === id}
                onClick={() => {
                  setRampa(id);
                }}
                className={cn(
                  'border p-1.5',
                  rampa === id ? 'border-oscuro-texto' : 'border-oscuro-borde',
                )}
              >
                <span
                  className="block h-3 w-full"
                  style={{ background: `linear-gradient(to right, ${r.colores.join(', ')})` }}
                />
                <span className="font-space text-oscuro-meta mt-1 block text-[9px] uppercase">
                  {r.nombre}
                </span>
              </button>
            ))}
          </div>
        </Control>

        <Control etiqueta={`Opacidad · ${String(Math.round(opacidad * 100))}%`}>
          <input
            type="range"
            min={20}
            max={100}
            value={Math.round(opacidad * 100)}
            onChange={(e) => {
              setOpacidad(Number(e.target.value) / 100);
            }}
            aria-label="Opacidad de las provincias"
            className="accent-violeta-claro w-full"
          />
        </Control>

        {/* Qué dice la provincia elegida — la mitad que el color no contesta. */}
        {detalle ? (
          <section className="border-oscuro-borde bg-tinta border p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-anton text-oscuro-texto text-[18px] leading-tight">
                {detalle.nombre}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSeleccionada(null);
                }}
                aria-label="Cerrar el detalle"
                className="font-space text-oscuro-meta hover:text-oscuro-texto text-[13px]"
              >
                ✕
              </button>
            </div>

            <p className="font-space text-violeta-claro mt-2 text-[22px] leading-none tabular-nums">
              {detalle.valor.toLocaleString('es-AR', {
                maximumFractionDigits: metrica === 'total' ? 0 : 1,
              })}
              <span className="font-space text-oscuro-meta ml-1.5 text-[10px] uppercase">
                {metricaActiva?.unidad}
              </span>
            </p>

            {detalle.lista.length === 0 ? (
              <p className="text-oscuro-secundario mt-3 text-[13px] leading-relaxed">
                Nadie dijo nada acá todavía, al menos con estos filtros. Que una provincia esté en
                silencio también es información.
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-1">
                  {detalle.porClase.map(([clase, n]) => (
                    <li key={clase} className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: COLOR_CLASE[clase] }}
                      />
                      <span className="font-space text-oscuro-secundario text-[11px] uppercase">
                        {CLASE_ROTULO[clase]}
                      </span>
                      <span className="font-space text-oscuro-meta ml-auto text-[11px] tabular-nums">
                        {n}
                      </span>
                    </li>
                  ))}
                </ul>

                {detalle.temas.length > 0 ? (
                  <>
                    <h5 className="font-space text-oscuro-meta mt-4 text-[10px] uppercase tracking-[0.14em]">
                      De qué habla
                    </h5>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {detalle.temas.map(({ tema, cantidad }) => (
                        <li
                          key={tema}
                          className="border-oscuro-borde text-oscuro-secundario font-space border px-2 py-0.5 text-[10px]"
                        >
                          {tema} · {cantidad}
                        </li>
                      ))}
                    </ul>
                    <p className="font-space text-oscuro-tenue mt-1.5 text-[9px]">{AVISO_TEMAS}</p>
                  </>
                ) : null}

                <h5 className="font-space text-oscuro-meta mt-4 text-[10px] uppercase tracking-[0.14em]">
                  Lo que se dijo
                </h5>
                <ul className="mt-1.5 max-h-[220px] space-y-2 overflow-y-auto">
                  {detalle.lista.slice(0, 40).map((s) => (
                    <li
                      key={s.id}
                      className="border-l-2 pl-2.5"
                      style={{ borderColor: s.claseSenal === null ? '#8E8A82' : COLOR_CLASE[s.claseSenal] }}
                    >
                      <p className="text-oscuro-secundario text-[12px] leading-snug">«{s.texto}»</p>
                    </li>
                  ))}
                </ul>
                {detalle.lista.length > 40 ? (
                  <p className="font-space text-oscuro-tenue mt-2 text-[9px]">
                    Se listan las primeras 40 de {detalle.lista.length}.
                  </p>
                ) : null}
              </>
            )}
          </section>
        ) : (
          <p className="text-oscuro-meta text-[12px] leading-relaxed">
            Tocá una provincia en el mapa para leer qué dice.
          </p>
        )}
      </>
    ),

    sobreMapa:
      ctx.todas.length === 0 && !ctx.cargando ? (
        <Vacio
          titulo="Ninguna provincia tiene todavía con qué hablar."
          cuerpo="Cuando entren las primeras voces esto se llena de intensidades: quién habla más, por habitante, por territorio. Tocá una provincia para ver cuántas voces necesita."
        />
      ) : null,

    capas: conValores ? (
      <Source id="provincias" type="geojson" data={conValores}>
        <Layer
          id="provincias-relleno"
          type="fill"
          paint={{
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'valor'],
              0,
              colores[0] ?? '#241F17',
              maximo * 0.33,
              colores[1] ?? '#3B2A66',
              maximo * 0.66,
              colores[2] ?? '#5227CC',
              maximo,
              colores[3] ?? '#9D85E8',
            ],
            'fill-opacity': opacidad,
          }}
        />
        <Layer
          id="provincias-borde"
          type="line"
          paint={{
            // La elegida se resalta con el BORDE, no con el relleno: cambiarle
            // el color rompería la lectura de la rampa justo donde se mira.
            'line-color': ['case', ['==', ['get', 'elegida'], 1], '#F2EFE7', '#5C594F'],
            'line-width': ['case', ['==', ['get', 'elegida'], 1], 2.4, 0.8],
          }}
        />
      </Source>
    ) : null,

    leyenda: (
      <LeyendaRampa
        colores={colores}
        bajo="Menos"
        alto="Más"
        titulo={`Voces · ${metricaActiva?.unidad ?? ''}`}
      />
    ),
  };
}
