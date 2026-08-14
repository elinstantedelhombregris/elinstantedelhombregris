import {
  CLASES_SENAL,
  congelarElenco,
  DECLARACION_DEL_SEMBRADO,
  derivado,
  hipotesis,
  modoForma,
  modoGente,
  totalDeVoces,
  vocesPorTerritorio,
} from '@v2/civic-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  caminoDe,
  celdasDeCosecha,
  encuadreDe,
  enUnidades,
  leerContornos,
  NOMBRE_DE_CLASE,
} from '../pais-cargado';
import { entero } from '../simulacion-lectura';
import { territoriosDelPais } from '../simulacion-pais';

import { CifraPapel } from './CifraPapel';
import { SelloSintetico } from './SelloSintetico';

import type { ElencoCargado } from '../elenco-archivos';
import type { ContornoDeProvincia, Encuadre } from '../pais-cargado';
import type { ClaseSenal, Cosecha, Escenario, Pais } from '@v2/civic-core';
import type { RectanguloGeo } from '~/components/mapa/rectangulo-inscripto';

import { type ProyectarAPixel } from '~/components/mapa/pintor-senales';
import { PintorDeSenales } from '~/components/mapa/PintorDeSenales';
import { rectanguloInscripto } from '~/components/mapa/rectangulo-inscripto';

/**
 * § El país cargado — la cosecha de la corrida, dibujada sobre las provincias.
 *
 * La página era un instrumento estadístico entero —nube, tornado, importancia,
 * mesa de variables, incertidumbre— y no mostraba el país en ningún lado. Ésta
 * es la sección que lo muestra, y **no dibuja nada que el motor no sepa**.
 *
 * ## Qué es dato y qué es dibujo
 *
 * `Cosecha` son celdas agregadas `(territorio, período, clase) → voces`, y el
 * generador declara que su precisión es la provincia y nada más fino. Entonces:
 * **el conteo por celda es el dato; la posición del punto adentro de la
 * provincia es dibujo.** Eso se declara acá arriba con el mismo peso que la
 * cifra —reusando `DECLARACION_DEL_SEMBRADO`, que es la frase canónica del
 * motor— y otra vez al pie del dibujo, que es donde la pone el pintor.
 *
 * ## Lo que se reusa, y por qué no se reescribe
 *
 * - **El pintor** (`~/components/mapa/PintorDeSenales`) es el mismo que va
 *   arriba de maplibre. Acá se lo enchufa con una proyección propia en vez de
 *   `map.project`, y ésa es toda la diferencia entre los dos casos: sin mapa
 *   base, la sección dibuja igual con el basemap caído — que hoy lo está.
 * - **El sembrado** sale de `@v2/civic-core`: la geometría del reparto es
 *   determinista y no puede vivir en la web, o el mismo escenario dibujaría
 *   distinto en el servidor que en el navegador.
 * - **El sello** es `SelloSintetico`, el que ya existe en esta carpeta con la
 *   frase «Nadie dijo ninguna de estas cosas.». No se escribe otro cartel de
 *   honestidad: se pasa entero por el hueco que el pintor deja para eso.
 *
 * ## La cosecha se calcula acá y no viene del barrido
 *
 * El worker devuelve `Corrida`, que es la cosecha ya reducida a cinco
 * escalares: la cosecha es transitoria por diseño (un barrido que las guardara
 * pesa ×148). Recalcularla para el escenario que está en la mesa cuesta lo
 * mismo que una corrida —microsegundos en modo forma— y tiene una ventaja: el
 * país se redibuja al mover un dial, sin correr un barrido.
 */

export interface ElPaisCargadoProps {
  readonly pais: Pais;
  readonly escenario: Escenario;
  /** `null` en modo forma. El modo gente dibuja la cosecha de SU elenco. */
  readonly elenco: ElencoCargado | null;
}

const RUTA_GEO = '/geo/provincias.geojson';

/** El ancho máximo del dibujo. El alto sale de la proyección, no de un número. */
const ANCHO_MAXIMO = 520;

/**
 * Cuánto se le deja abajo al bloque que declara.
 *
 * El pintor pone su declaración al pie, apoyada en `bottom-0`, porque está
 * hecho para ir arriba de un mapa. Acá el país se proyecta sólo en la franja de
 * arriba del contenedor y esto es el lugar que queda libre: así el texto no le
 * tapa la Patagonia a nadie.
 */
const RESERVA_SIN_SELLO = 340;
const RESERVA_CON_SELLO = 470;

interface Geometria {
  readonly encuadre: Encuadre;
  readonly caminos: readonly { readonly nombre: string; readonly d: string }[];
  readonly rectangulos: ReadonlyMap<string, RectanguloGeo>;
}

function armarGeometria(contornos: readonly ContornoDeProvincia[]): Geometria | null {
  const encuadre = encuadreDe(contornos);
  if (encuadre === null) return null;
  const rectangulos = new Map<string, RectanguloGeo>();
  for (const contorno of contornos) {
    const rectangulo = rectanguloInscripto(contorno.anillos);
    if (rectangulo !== null) rectangulos.set(contorno.nombre, rectangulo);
  }
  return {
    encuadre,
    caminos: contornos.map((contorno) => ({
      nombre: contorno.nombre,
      d: caminoDe(encuadre, contorno),
    })),
    rectangulos,
  };
}

type Lectura =
  | { readonly cosecha: Cosecha; readonly motivo: null }
  | { readonly cosecha: null; readonly motivo: string };

/**
 * La cosecha del modo que corresponde, con el error a la vista.
 *
 * `congelarElenco` verifica ids corridos, vínculos colgados y personas atadas a
 * un territorio que el país no conoce; `modoGente` verifica que el escenario se
 * haya armado contra ESTA población. Los tres tiran con el motivo escrito, y
 * ese motivo se muestra: un país que se dibuja a medias porque una verificación
 * falló es peor que uno que no se dibuja y dice por qué.
 */
function leerCosecha(escenario: Escenario, pais: Pais, elenco: ElencoCargado | null): Lectura {
  try {
    if (elenco === null) return { cosecha: modoForma(escenario, pais, null), motivo: null };
    const congelado = congelarElenco(
      {
        personas: elenco.transferible.personas,
        padre: elenco.transferible.padre,
        sello: elenco.transferible.sello,
        corpus: elenco.transferible.corpus,
      },
      territoriosDelPais(),
    );
    return { cosecha: modoGente(escenario, pais, congelado), motivo: null };
  } catch (error) {
    return { cosecha: null, motivo: error instanceof Error ? error.message : String(error) };
  }
}

export function ElPaisCargado({ pais, escenario, elenco }: ElPaisCargadoProps) {
  const [contornos, setContornos] = useState<readonly ContornoDeProvincia[] | null>(null);
  const [foco, setFoco] = useState<ReadonlySet<ClaseSenal> | null>(null);
  const [ancho, setAncho] = useState(ANCHO_MAXIMO);
  const cajaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof fetch !== 'function') return;
    let vivo = true;
    void fetch(RUTA_GEO)
      .then(async (respuesta) => JSON.parse(await respuesta.text()) as unknown)
      .then((crudo: unknown) => {
        if (vivo) setContornos(leerContornos(crudo));
      })
      .catch(() => {
        // Sin contorno no hay dibujo, y la sección lo dice abajo. El dato —el
        // conteo por provincia— se rinde igual: es el que no depende del mapa.
        if (vivo) setContornos([]);
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    const caja = cajaRef.current;
    if (caja === null) return;
    const medir = () => {
      setAncho(Math.max(160, caja.clientWidth));
    };
    medir();
    if (typeof ResizeObserver !== 'function') return;
    const observador = new ResizeObserver(medir);
    observador.observe(caja);
    return () => {
      observador.disconnect();
    };
  }, []);

  const lectura = useMemo(() => leerCosecha(escenario, pais, elenco), [escenario, pais, elenco]);
  const geometria = useMemo(
    () => (contornos === null || contornos.length === 0 ? null : armarGeometria(contornos)),
    [contornos],
  );
  const pintado = useMemo(
    () =>
      lectura.cosecha === null || geometria === null
        ? null
        : celdasDeCosecha(lectura.cosecha, geometria.rectangulos),
    [lectura, geometria],
  );

  const alto = geometria === null ? 0 : (ancho * geometria.encuadre.alto) / geometria.encuadre.ancho;

  const proyectar = useCallback<ProyectarAPixel>(
    (lng, lat) => {
      if (geometria === null) return null;
      const { x, y } = enUnidades(geometria.encuadre, lng, lat);
      return {
        x: (x / geometria.encuadre.ancho) * ancho,
        y: (y / geometria.encuadre.alto) * alto,
      };
    },
    [geometria, ancho, alto],
  );

  const alternar = useCallback((clase: ClaseSenal) => {
    setFoco((previo) => {
      const proximo = new Set<ClaseSenal>(previo ?? CLASES_SENAL);
      if (proximo.has(clase)) proximo.delete(clase);
      else proximo.add(clase);
      return proximo.size === CLASES_SENAL.length ? null : proximo;
    });
  }, []);

  const voces = lectura.cosecha === null ? 0 : totalDeVoces(lectura.cosecha);
  const magnitud = derivado(voces, 'voces', 'suma de las voces de la cosecha de esta corrida', [
    'voces',
  ]);
  const selloDelElenco = elenco?.manifiesto.sello ?? null;

  return (
    <section aria-labelledby="titulo-pais-cargado" className="mt-12">
      <h2 id="titulo-pais-cargado" className="font-anton text-tinta text-[28px] leading-[1.1]">
        El país cargado
      </h2>
      <p className="text-tinta-75 mb-6 mt-2 max-w-[70ch] text-[16px] leading-[1.55]">
        La cosecha del escenario que está en la mesa, sin correr ningún barrido: movés un dial y el
        país se rehace. El color es la clase de lo que se dijo, y cada provincia lleva un rectángulo
        contenido en su propia figura, partido en cuatro, siempre igual — hechos arriba a la
        izquierda, deseos arriba a la derecha, actos abajo a la izquierda, preguntas abajo a la
        derecha. El rectángulo y el cuarto son dibujo: sin partirlo, en las provincias apretadas una
        clase taparía a las otras tres y el color diría algo que la composición no dice. Que sea
        dibujo no lo hace impune: ningún punto cae afuera de la provincia que lo cuenta.
      </p>

      <div className="border-tinta mb-6 flex flex-wrap items-start gap-6 border-t-2 pt-5">
        <div className="min-w-[190px]">
          <CifraPapel
            etiqueta={elenco === null ? 'Voces de esta corrida' : 'Voces que produjo la gente'}
            magnitud={selloDelElenco === null ? magnitud : hipotesis(magnitud, selloDelElenco)}
            formato={entero}
          />
        </div>
        <p className="text-tinta min-w-[260px] max-w-[62ch] flex-1 text-[16px] leading-[1.5]">
          {DECLARACION_DEL_SEMBRADO}
        </p>
      </div>

      {lectura.motivo !== null && (
        <p role="alert" className="text-sello max-w-[70ch] text-[14px] leading-[1.5]">
          {lectura.motivo}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Qué clase queda en foco">
        {CLASES_SENAL.map((clase) => {
          const encendida = foco === null || foco.has(clase);
          return (
            <button
              key={clase}
              type="button"
              aria-pressed={encendida}
              onClick={() => {
                alternar(clase);
              }}
              className={`font-space border px-3 py-1 text-[11px] uppercase tracking-[0.12em] ${
                encendida
                  ? 'border-tinta text-tinta bg-papel-presionado'
                  : 'border-papel-borde text-tinta-50'
              }`}
            >
              {NOMBRE_DE_CLASE[clase]}
            </button>
          );
        })}
      </div>

      <div
        ref={cajaRef}
        className="bg-papel-crudo relative w-full max-w-[520px]"
        style={{ height: alto + (elenco === null ? RESERVA_SIN_SELLO : RESERVA_CON_SELLO) }}
      >
        {geometria !== null && (
          <svg
            aria-hidden
            className="fill-papel-mapa stroke-tinta-30 absolute inset-x-0 top-0 w-full"
            style={{ height: alto }}
            viewBox={`0 0 ${geometria.encuadre.ancho.toFixed(3)} ${geometria.encuadre.alto.toFixed(3)}`}
            preserveAspectRatio="none"
          >
            {geometria.caminos.map((camino) => (
              <path
                key={camino.nombre}
                d={camino.d}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}

        {pintado !== null && (
          <PintorDeSenales
            celdas={pintado.celdas}
            proyectar={proyectar}
            foco={foco}
            tema="papel"
            semilla={escenario.semilla}
            radio={1.2}
            sello={
              elenco === null ? null : (
                <SelloSintetico
                  sello={elenco.manifiesto.sello}
                  huella={elenco.manifiesto.huella}
                  personas={elenco.manifiesto.personas}
                  advertencia={elenco.manifiesto.sesgo.advertencia}
                />
              )
            }
          />
        )}
      </div>

      {pintado !== null && pintado.sinContorno.length > 0 && (
        <p className="text-sello mt-3 max-w-[70ch] text-[13px] leading-[1.5]">
          {`${entero(pintado.vocesSinLugar)} voces no se dibujaron: el mapa no tiene dónde ponerlas adentro de ${pintado.sinContorno.join(', ')} —falta el contorno, o la figura es tan angosta que no admite ningún rectángulo adentro—. Están contadas en la cifra de arriba.`}
        </p>
      )}

      {contornos !== null && contornos.length === 0 && lectura.cosecha !== null && (
        <div className="border-papel-borde mt-2 border-t pt-4">
          <p className="text-tinta-75 mb-3 max-w-[70ch] text-[14px] leading-[1.5]">
            El contorno de las provincias no cargó, así que no hay dibujo. El conteo —que es el
            dato— no depende de él y va acá:
          </p>
          <ul className="text-tinta max-w-[70ch] text-[13px] leading-[1.6]">
            {[...vocesPorTerritorio(lectura.cosecha)].map(([territorioId, cuantas]) => (
              <li key={territorioId}>{`${territorioId}: ${entero(cuantas)} voces.`}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
