import { Fragment, useRef, useState } from 'react';

import { BarraModos, ContadorEnVista, PanelLateral } from './Chrome';
import { MapaBase } from './MapaBase';
import { useModoAnalisis } from './modos/useModoAnalisis';
import { useModoCobertura } from './modos/useModoCobertura';
import { useModoMapa } from './modos/useModoMapa';
import { useModoSimulacion } from './modos/useModoSimulacion';
import { useModoTiempo } from './modos/useModoTiempo';
import { useSenalesEnVista, useVistaMapa } from './useVistaMapa';


import type { Modo } from './catalogo-modos';
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
export function Instrumento() {
  const [modo, setModo] = useState<Modo>('mapa');
  const [panelFalta, setPanelFalta] = useState(false);
  const mapaRef = useRef<MapRef>(null);
  const { recuadro, alMover } = useVistaMapa();

  const consulta = useSenalesMapa({ capas: CAPAS, rango: 'todo' }, true);
  const todas = useSenalesEnVista(consulta.data ?? [], null);
  const enVista = useSenalesEnVista(consulta.data ?? [], recuadro);

  const ctx: ContextoModo = {
    senales: enVista,
    todas,
    mapaRef,
    recuadro,
    cargando: consulta.isLoading,
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

  return (
    <section
      aria-label="Instrumento territorial"
      className="border-oscuro-borde bg-tinta border-y"
    >
      <BarraModos activo={modo} onCambiar={setModo} />

      <div className="grid h-[min(78vh,760px)] grid-cols-[340px_1fr] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_1fr]">
        <PanelLateral titulo={activo.titulo} descripcion={activo.descripcion}>
          {consulta.isLoading ? (
            <p className="font-space text-oscuro-meta text-[11px] uppercase tracking-[0.12em]">
              Cargando las voces…
            </p>
          ) : null}
          {activo.panel}
        </PanelLateral>

        <div className="relative">
          {activo.superficie ? (
            /* La Simulación trae su propia superficie: la cortina son dos
               instancias de mapa y no se puede recortar una capa por posición
               de pantalla. La `key` la aísla igual que a las capas. */
            <Fragment key={modo}>{activo.superficie}</Fragment>
          ) : (
          <MapaBase
            mapaRef={mapaRef}
            onMover={alMover}
            arrastreHabilitado={activo.arrastreHabilitado ?? true}
            {...(activo.capasInteractivas ? { capasInteractivas: activo.capasInteractivas } : {})}
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

      <div className="font-space text-oscuro-tenue border-oscuro-borde flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2 text-[10px]">
        <span>Mapa © OpenStreetMap contributors · © CARTO</span>
        {/* La segunda boca del canal de escucha, y la única que adjunta algo:
            lo que se deje desde acá se va con el encuadre y el modo que se
            estaban mirando (spec 2026-08-12-lo-que-falta.md §2.8). El pedido
            llega con la pantalla pegada y no como «no me anda una cosa». */}
        <button
          type="button"
          onClick={() => {
            setPanelFalta(true);
          }}
          className="hover:text-papel underline uppercase tracking-[0.1em] transition-colors"
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
