import { useEffect, useRef, useState } from 'react';

import { BarraModos, PanelLateral } from './Chrome';
import { encuadreAhora } from './encuadre-actual';
import { EstadoConsulta } from './EstadoConsulta';
import { EstadoGeometria } from './EstadoGeometria';
import { useExploracion, type Exploracion } from './exploracion-url';
import { FiltrosExploracion } from './FiltrosExploracion';
import { ListaRegistros } from './ListaRegistros';
import { useModoAnalisis } from './modos/useModoAnalisis';
import { useModoCobertura } from './modos/useModoCobertura';
import { useModoMapa } from './modos/useModoMapa';
import { useModoSimulacion } from './modos/useModoSimulacion';
import { useModoTiempo } from './modos/useModoTiempo';
import { ProcedenciaConsulta } from './ProcedenciaConsulta';
import { SuperficieInstrumento } from './SuperficieInstrumento';
import { useSenalesEnVista, useVistaMapa } from './useVistaMapa';

import type { LugarMapa } from './BusquedaTerritorial';
import type { ContextoModo } from './modos/tipos';
import type { ReactNode } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';

import { REGISTRO_DE_NOCHE } from '~/components/papel/esquema';
import { PanelDejarFalta } from '~/components/papel/PanelDejarFalta';
import { BotonPapel } from '~/components/papel/primitives';
import { CAPAS, useSenalesMapa } from '~/lib/queries/civic-map';
import { cn } from '~/lib/utils';

/** Los modos comparten señales, encuadre y borrador del aporte. */
export function Instrumento({
  onAportar,
  onTerritorio,
  participacion,
  participando = false,
}: {
  onAportar?: (lugar: LugarMapa | null) => void;
  onTerritorio?: (lugar: LugarMapa | null) => void;
  participacion?: ReactNode;
  participando?: boolean;
}) {
  const [lugarElegido, setLugarElegido] = useState<LugarMapa | null>(null);
  const [exploracion, setExploracion] = useExploracion();
  const { modo, rango } = exploracion;
  const [soloLista, setSoloLista] = useState(false);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const regresarAlRegistro = useRef<HTMLElement | null>(null);
  const seleccionarRegistro = (id: string) => {
    regresarAlRegistro.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSeleccionada(id);
  };
  const cerrarRegistro = () => {
    setSeleccionada(null);
    if (regresarAlRegistro.current?.isConnected) regresarAlRegistro.current.focus();
  };
  const [intentoMapa, setIntentoMapa] = useState(0);
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
    onTerritorio?.(lugar);
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
    seleccionar: seleccionarRegistro,
    onFalloMapa: () => {
      setFalloMapa(true);
    },
    elegirLugar: elegir,
    ...(consulta.data ? { resumen: consulta.data.metadata } : {}),
  };

  // Los hooks de los modos se llaman siempre.
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
  const mirada = consulta.data?.signals.find((s) => s.id === seleccionada);

  return (
    <section
      aria-label="Instrumento territorial"
      className={cn('border-oscuro-borde bg-tinta border-y', REGISTRO_DE_NOCHE)}
    >
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
        <BotonPapel
          type="button"
          variant="violeta"
          surface="oscuro"
          data-abrir-aporte
          aria-expanded={participando}
          aria-controls="aportar"
          onClick={() => {
            onAportar?.(lugarElegido?.id === exploracion.lugarId ? lugarElegido : null);
          }}
        >
          {participando ? 'Seguir con mi aporte' : 'Sumá tu aporte →'}
        </BotonPapel>
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
      <EstadoGeometria
        falloMapa={falloMapa}
        tieneDatos={tieneDatos}
        necesitaProvincias={['mapa', 'analisis', 'simulacion'].includes(modo)}
        reintentarMapa={() => {
          setFalloMapa(false);
          setIntentoMapa((intento) => intento + 1);
        }}
      />
      {necesitaCorpus ? (
        <p role="status" className="text-oscuro-texto px-5 py-10">
          Esta vista necesita todos los aportes, y la consulta trae más de una página. Para ver los
          totales completos por provincia usá Análisis: no calculamos zonas sin aportes ni
          escenarios sobre una muestra recortada.
        </p>
      ) : null}
      {/* Ocultar sin desmontar conserva los borradores. */}
      <div
        className={cn(
          'grid min-h-[640px] max-[960px]:grid-cols-1',
          soloLista
            ? 'grid-cols-1'
            : participando
              ? 'grid-cols-[420px_minmax(0,1fr)]'
              : 'grid-cols-[300px_minmax(0,1fr)]',
          soloLista && !participando && 'hidden',
        )}
      >
        {/* El formulario crece con la página; solo se recorta el panel de lectura. */}
        <div
          className={cn(
            'overflow-auto max-[960px]:order-2 max-[960px]:max-h-none',
            !participando && 'max-h-[640px]',
          )}
        >
          <div hidden={participando}>
            <PanelLateral titulo={activo.titulo} descripcion={activo.descripcion}>
              {tieneDatos ? (
                activo.panel
              ) : (
                <p className="text-oscuro-secundario text-sm leading-relaxed">
                  La lectura todavía no llegó. Podés recorrer el lugar y preparar tu aporte.
                </p>
              )}
            </PanelLateral>
          </div>
          <div hidden={!participando}>{participacion}</div>
        </div>

        <SuperficieInstrumento
          soloLista={soloLista}
          participando={participando}
          activo={activo}
          modo={modo}
          mapaRef={mapaRef}
          conLugar={exploracion.lugarId !== undefined}
          onFallo={() => {
            setFalloMapa(true);
          }}
          alMover={alMover}
          tieneDatos={tieneDatos}
          enVista={enVista}
          sinPunto={consulta.data?.metadata.sinPunto ?? 0}
          seleccionada={mirada}
          cerrarRegistro={cerrarRegistro}
          intento={intentoMapa}
        />
      </div>

      {consulta.data ? (
        <ListaRegistros
          datos={consulta.data}
          seleccionada={seleccionada}
          seleccionar={(senal) => {
            seleccionarRegistro(senal.id);
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

      <div className="font-space text-oscuro-meta border-oscuro-borde flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2 text-[10px]">
        {/* Los datos son de OpenStreetMap y la ODbL obliga a decirlo; las
            teselas las arma Protomaps, que pide su línea. Carto se fue el
            12/8/2026 junto con las teselas que servía. */}
        <span>Mapa © OpenStreetMap contributors · Protomaps</span>
        {/* El pedido de mejora adjunta el encuadre y el modo actuales. */}
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
