import { useEffect, Fragment, useRef, useState } from 'react';

import { BarraModos, ContadorEnVista, PanelLateral } from './Chrome';
import { EstadoConsulta } from './EstadoConsulta';
import { useExploracion, type Exploracion } from './exploracion-url';
import { FiltrosExploracion } from './FiltrosExploracion';
import { ListaRegistros } from './ListaRegistros';
import { MapaBase } from './MapaBase';
import { useModoAnalisis } from './modos/useModoAnalisis';
import { useModoCobertura } from './modos/useModoCobertura';
import { useModoMapa } from './modos/useModoMapa';
import { useModoSimulacion } from './modos/useModoSimulacion';
import { useModoTiempo } from './modos/useModoTiempo';
import { ProcedenciaConsulta } from './ProcedenciaConsulta';
import { useSenalesEnVista, useVistaMapa } from './useVistaMapa';

import type { LugarMapa } from './BusquedaTerritorial';
import type { ContextoModo } from './modos/tipos';
import type { Recuadro } from './useVistaMapa';
import type { MapRef } from 'react-map-gl/maplibre';

import { PanelDejarFalta } from '~/components/papel/PanelDejarFalta';
import { CAPAS, useSenalesMapa } from '~/lib/queries/civic-map';

/**
 * El instrumento territorial.
 *
 * La estructura es la que hace que funcione, y es lo que faltaba antes: el
 * mapa OCUPA la superficie, los modos son pestañas de primer nivel sobre la
 * misma instancia, y el panel lateral cambia con el modo. Cambiar de modo no
 * remonta el mapa ni pierde el encuadre — se cambia la lente, no la página.
 *
 * Los cuatro modos comparten señales y viewport; cada uno aporta sus capas,
 * sus controles y su leyenda (ver `modos/tipos.ts`).
 */
export function Instrumento({ onAportar }: { onAportar?: (lugar: LugarMapa | null) => void }) {
  const [lugarElegido, setLugarElegido] = useState<LugarMapa | null>(null);
  const [exploracion, setExploracion] = useExploracion();
  const { modo, rango } = exploracion;
  const [soloLista, setSoloLista] = useState(false);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [falloMapa, setFalloMapa] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [panelFalta, setPanelFalta] = useState(false);
  const mapaRef = useRef<MapRef>(null);
  const { recuadro, alMover } = useVistaMapa();

  const cambiar = (valor: Exploracion) => {
    setCursor(undefined);
    setExploracion(valor);
  };
  useEffect(() => {
    setCursor(undefined);
  }, [exploracion]);
  const elegir = (lugar: LugarMapa) => {
    setLugarElegido(lugar);
    cambiar({ ...exploracion, lugarId: lugar.id, lugarNombre: lugar.name });
    if (lugar.latitude !== null && lugar.longitude !== null)
      mapaRef.current?.flyTo({
        center: [Number(lugar.longitude), Number(lugar.latitude)],
        zoom: lugar.level === 'province' ? 5 : 10,
        essential: false,
      });
  };
  const consulta = useSenalesMapa(
    { capas: CAPAS, ...exploracion, ...(cursor ? { cursor } : {}) },
    true,
  );
  const todas = useSenalesEnVista(consulta.data?.signals ?? [], null);
  const enVista = useSenalesEnVista(consulta.data?.signals ?? [], recuadro);

  const ctx: ContextoModo = {
    senales: enVista,
    todas,
    mapaRef,
    recuadro,
    cargando: consulta.isLoading,
    rango,
    cambiarRango: (valor) => {
      cambiar({ ...exploracion, rango: valor });
    },
    seleccionar: setSeleccionada,
    ...(consulta.data ? { resumen: consulta.data.metadata } : {}),
  };

  // Los cuatro se llaman siempre: son hooks, y llamarlos condicionalmente
  // rompería las reglas de React. El costo es memoización, no render.
  const resultados = {
    mapa: useModoMapa(ctx),
    analisis: useModoAnalisis(ctx),
    tiempo: useModoTiempo(ctx),
    cobertura: useModoCobertura(ctx),
    simulacion: useModoSimulacion(ctx),
  };
  const activo = resultados[modo];
  const parcial = consulta.data?.metadata.completa === false;
  const necesitaCorpus = parcial && ['cobertura', 'tiempo', 'simulacion'].includes(modo);
  const tieneDatos = consulta.data !== undefined;
  const siguientePagina = consulta.data?.metadata.siguiente ?? undefined;

  return (
    <section aria-label="Instrumento territorial" className="border-oscuro-borde bg-tinta border-y">
      <FiltrosExploracion valor={exploracion} cambiar={cambiar} elegir={elegir} />
      <div className="text-oscuro-texto flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
        <button
          type="button"
          className="min-h-11 underline"
          aria-pressed={soloLista}
          onClick={() => {
            setSoloLista(!soloLista);
          }}
        >
          {soloLista ? 'Mostrar mapa y lista' : 'Usar solo la lista'}
        </button>
        <a
          className="inline-flex min-h-11 items-center underline"
          href="#aportar"
          onClick={() => {
            onAportar?.(lugarElegido?.id === exploracion.lugarId ? lugarElegido : null);
          }}
        >
          Aportar a esta lectura →
        </a>
      </div>
      {!soloLista ? (
        <BarraModos
          activo={modo}
          onCambiar={(valor) => {
            cambiar({ ...exploracion, modo: valor });
          }}
        />
      ) : null}
      <EstadoConsulta
        cargando={consulta.isLoading}
        fallo={consulta.isError}
        tieneDatos={tieneDatos}
        actualizadoEn={consulta.dataUpdatedAt}
        reintentar={() => {
          void consulta.refetch();
        }}
      />
      {consulta.data ? (
        <ProcedenciaConsulta
          datos={consulta.data.metadata}
          siguiente={() => {
            setCursor(siguientePagina);
          }}
          inicio={() => {
            setCursor(undefined);
          }}
        />
      ) : null}
      {soloLista ? null : necesitaCorpus ? (
        <p role="status" className="text-oscuro-texto px-5 py-10">
          Esta lente necesita todos los registros, y la consulta trae más de una página. Para los
          totales completos por provincia usá Análisis: no calculamos silencio ni escenarios sobre
          una muestra recortada.
        </p>
      ) : tieneDatos ? (
        <div className="grid min-h-[520px] grid-cols-[300px_minmax(0,1fr)] max-[900px]:grid-cols-1">
          <div className="max-h-[520px] overflow-auto max-[900px]:order-2 max-[900px]:max-h-64">
            <PanelLateral titulo={activo.titulo} descripcion={activo.descripcion}>
              {activo.panel}
            </PanelLateral>
          </div>

          <div className="relative h-[520px] min-w-0 max-[900px]:order-1 max-[900px]:h-[440px]">
            {activo.superficie ? (
              /* La Simulación trae su propia superficie: la cortina son dos
               instancias de mapa y no se puede recortar una capa por posición
               de pantalla. La `key` la aísla igual que a las capas. */
              <Fragment key={modo}>{activo.superficie}</Fragment>
            ) : (
              <MapaBase
                mapaRef={mapaRef}
                onFallo={() => {
                  setFalloMapa(true);
                }}
                onMover={alMover}
                arrastreHabilitado={activo.arrastreHabilitado ?? true}
                {...(activo.capasInteractivas
                  ? { capasInteractivas: activo.capasInteractivas }
                  : {})}
                {...(activo.onClickCapa ? { onClickCapa: activo.onClickCapa } : {})}
              >
                {/*
              La `key` por modo es obligatoria, no cosmética: sin ella React
              reconcilia las capas del modo saliente con las del entrante en la
              misma posición del árbol, y `<Source>` de react-map-gl explota con
              «source id changed» porque su id no puede cambiar en caliente.
              Con la key se desmonta un modo y se monta el otro, que es lo que
              corresponde — el mapa NO se remonta, solo sus capas.
            */}
                <Fragment key={modo}>{activo.capas}</Fragment>
              </MapaBase>
            )}

            {/* El contador flota arriba a la derecha y responde al encuadre:
              arrastrás sobre una provincia y el número contesta. */}
            <div className="pointer-events-none absolute right-4 top-4 z-10">
              <ContadorEnVista senales={enVista} />
            </div>

            {activo.leyenda ? (
              <div className="pointer-events-none absolute bottom-14 left-4 z-10">
                {activo.leyenda}
              </div>
            ) : null}

            {activo.sobreMapa}
          </div>
        </div>
      ) : (
        <div className="h-40" aria-hidden="true" />
      )}

      {falloMapa ? (
        <p role="alert" className="text-oscuro-texto p-4">
          Parte del mapa no pudo cargarse. Los registros siguen disponibles en la lista.
        </p>
      ) : null}
      {consulta.data ? (
        <ListaRegistros
          datos={consulta.data}
          seleccionada={seleccionada}
          seleccionar={(senal) => {
            setSeleccionada(senal.id);
            setSoloLista(false);
            if (senal.lng !== null && senal.lat !== null)
              mapaRef.current?.flyTo({
                center: [senal.lng, senal.lat],
                zoom: 12,
                essential: false,
              });
          }}
        />
      ) : null}

      <div className="font-space text-oscuro-tenue border-oscuro-borde flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2 text-[10px]">
        {/* Los datos son de OpenStreetMap y la ODbL obliga a decirlo; las
            teselas las arma Protomaps, que pide su línea. Carto se fue el
            12/8/2026 junto con las teselas que servía. */}
        <span>Mapa © OpenStreetMap contributors · Protomaps</span>
        {/* La segunda boca del canal de escucha, y la única que adjunta algo:
            lo que se deje desde acá se va con el encuadre y el modo que se
            estaban mirando (spec 2026-08-12-lo-que-falta.md §2.8). El pedido
            llega con la pantalla pegada y no como «no me anda una cosa». */}
        <button
          type="button"
          onClick={() => {
            setPanelFalta(true);
          }}
          className="hover:text-papel uppercase tracking-[0.1em] underline transition-colors"
        >
          Algo le falta a este mapa
        </button>
      </div>

      <PanelDejarFalta
        abierto={panelFalta}
        onCerrar={() => {
          setPanelFalta(false);
        }}
        superficieInicial="el-mapa"
        contexto={{
          ruta: '/el-mapa#instrumento',
          capa: modo,
          ...(encuadreAhora(mapaRef.current, recuadro) ?? {}),
        }}
      />
    </section>
  );
}

/**
 * El encuadre para adjuntar a una falta, leído del mapa **en el momento de
 * abrir el panel**.
 *
 * `recuadro` sale del estado de `useVistaMapa()`, que se llena desde
 * `onLoad`/`onMoveEnd` de MapaBase — y verificado en el navegador, con el mapa
 * dibujado y sin haberlo arrastrado nunca, sigue en `null`. O sea que quien
 * abre el mapa, ve algo que no le gusta y toca el botón sin mover nada
 * —exactamente el caso más común— mandaba su falta sin encuadre, que es lo
 * único que esta boca prometía adjuntar.
 *
 * Preguntarle al mapa directamente no tiene ese agujero: si hay instancia, hay
 * límites. El `recuadro` queda como respaldo para cuando la instancia todavía
 * no exista.
 */
function encuadreAhora(
  mapa: MapRef | null,
  respaldo: Recuadro | null,
): { encuadre: Recuadro } | undefined {
  const limites = mapa?.getBounds();
  if (limites) {
    return {
      encuadre: {
        oeste: limites.getWest(),
        sur: limites.getSouth(),
        este: limites.getEast(),
        norte: limites.getNorth(),
      },
    };
  }
  return respaldo ? { encuadre: respaldo } : undefined;
}
