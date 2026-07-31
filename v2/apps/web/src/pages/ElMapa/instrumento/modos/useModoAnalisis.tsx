import { useEffect, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { Control, LeyendaRampa, Segmentado } from '../Chrome';
import { RAMPAS } from '../paleta';

import type { ContextoModo, ResultadoModo } from './tipos';

import { useProvincias } from '~/lib/queries/open-data';

/**
 * Modo Análisis — el coroplético: qué provincia habla y cuánto.
 *
 * Es la respuesta a «dónde habla el país» a escala, que los puntos sueltos no
 * dan: mil puntos en el conurbano y diez en Santa Cruz se ven parecidos si uno
 * mira densidad de tinta, y son cosas completamente distintas por habitante.
 *
 * DEPARTAMENTOS: falta la geometría. La capa del IGN (~530 unidades) es la que
 * habilitaría el nivel de abajo, y es la misma que quedó pendiente para el
 * pipeline. Mientras tanto el selector muestra el nivel deshabilitado con su
 * razón, en vez de esconderlo: que exista es parte de lo que el mapa promete.
 */

type Metrica = 'total' | 'porHabitante';
type NivelGeo = 'provincia' | 'departamento';

/**
 * Población por provincia (censo 2022, INDEC), en miles.
 *
 * Va acá y no en la base porque es un dato de referencia estable, no una
 * señal: cambia cada diez años, no cada minuto. Si algún día entra al esquema,
 * este objeto muere.
 */
const POBLACION_MILES: Record<string, number> = {
  'Buenos Aires': 17569,
  'Ciudad Autónoma de Buenos Aires': 3121,
  Córdoba: 3978,
  'Santa Fe': 3556,
  Mendoza: 2014,
  Tucumán: 1703,
  Salta: 1440,
  'Entre Ríos': 1426,
  Misiones: 1281,
  Chaco: 1129,
  Corrientes: 1120,
  Santiago: 978,
  'Santiago del Estero': 978,
  'San Juan': 818,
  Jujuy: 797,
  'Río Negro': 747,
  Neuquén: 726,
  Formosa: 606,
  Chubut: 604,
  'San Luis': 540,
  Catamarca: 429,
  'La Rioja': 384,
  'La Pampa': 366,
  'Santa Cruz': 337,
  'Tierra del Fuego': 191,
};

export function useModoAnalisis(ctx: ContextoModo): ResultadoModo {
  const [nivel, setNivel] = useState<NivelGeo>('provincia');
  const [metrica, setMetrica] = useState<Metrica>('total');
  const [rampa, setRampa] = useState<keyof typeof RAMPAS>('violeta');
  const [opacidad, setOpacidad] = useState(0.8);
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
        /* sin geometría el modo muestra su aviso; no rompe la página */
      });
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * Cuántas voces por provincia, POR NOMBRE.
   *
   * Se cuenta sobre TODAS y no sobre el encuadre: un coroplético que cambia al
   * arrastrar el mapa no compara nada — la provincia que sale del cuadro no
   * pierde sus voces, solo deja de verse.
   *
   * El puente id→nombre lo da `useProvincias()`: el GeoJSON de Natural Earth
   * no conoce los ids de nuestra base, y los nombres ya están normalizados por
   * el pipeline (CABA incluida).
   */
  const porNombre = useMemo(() => {
    const nombrePorId = new Map((provincias.data ?? []).map((p) => [p.id, p.name]));
    const cuenta = new Map<string, number>();
    for (const s of ctx.todas) {
      if (s.provinceId === null) continue;
      const nombre = nombrePorId.get(s.provinceId);
      if (nombre === undefined) continue;
      cuenta.set(nombre, (cuenta.get(nombre) ?? 0) + 1);
    }
    return cuenta;
  }, [ctx.todas, provincias.data]);

  const conValores = useMemo(() => {
    if (!geometria || typeof geometria !== 'object') return null;
    const col = geometria as { features: { properties: { name: string } }[] };

    const features = col.features.map((f) => {
      const nombre = f.properties.name;
      const total = porNombre.get(nombre) ?? 0;
      const pob = POBLACION_MILES[nombre] ?? 0;
      return {
        ...f,
        properties: {
          ...f.properties,
          total,
          porHabitante: pob > 0 ? (total / pob) * 100 : 0,
        },
      };
    });
    return { type: 'FeatureCollection' as const, features };
  }, [geometria, porNombre]);

  const maximo = useMemo(() => {
    if (!conValores) return 1;
    const vals = conValores.features.map((f) =>
      metrica === 'total' ? f.properties.total : f.properties.porHabitante,
    );
    return Math.max(1, ...vals);
  }, [conValores, metrica]);

  // Rampa de respaldo explícita: `noUncheckedIndexedAccess` no confía en
  // que la clave exista, y tiene razón — el estado podría venir de una URL.
  const colores = RAMPAS[rampa]?.colores ?? ['#241F17', '#3B2A66', '#5227CC', '#9D85E8'];

  return {
    titulo: 'Análisis',
    descripcion:
      'Qué provincia habla y cuánto. Elegí si mirar el total o el peso por habitante — no dicen lo mismo.',

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
              nivel existe y va a llegar — esconderlo sería fingir que el mapa no lo tiene pensado.
            </p>
          ) : null}
        </Control>

        <Control etiqueta="Métrica">
          <Segmentado
            valor={metrica}
            onCambiar={setMetrica}
            opciones={[
              { id: 'total', etiqueta: 'Total' },
              { id: 'porHabitante', etiqueta: 'Por habitante' },
            ]}
          />
          <p className="text-oscuro-meta mt-2 text-[11px] leading-relaxed">
            {metrica === 'total'
              ? 'El total crudo. Buenos Aires siempre gana porque tiene 17 millones de personas.'
              : 'Voces cada 100.000 habitantes. Acá una provincia chica que habla mucho se ve.'}
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
                className={`border p-1.5 ${rampa === id ? 'border-oscuro-texto' : 'border-oscuro-borde'}`}
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
      </>
    ),

    capas: conValores ? (
      <Source id="provincias" type="geojson" data={conValores}>
        <Layer
          id="provincias-relleno"
          type="fill"
          paint={{
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', metrica],
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
          paint={{ 'line-color': '#5C594F', 'line-width': 0.8 }}
        />
      </Source>
    ) : null,

    leyenda: (
      <LeyendaRampa
        colores={colores}
        bajo="Menos"
        alto="Más"
        titulo={metrica === 'total' ? 'Voces (total)' : 'Voces por 100.000 hab.'}
      />
    ),
  };
}
