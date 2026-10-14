import { Fragment } from 'react';

import { ContadorEnVista } from './Chrome';
import { DetalleRegistroMapa } from './DetalleRegistroMapa';
import { MapaBase } from './MapaBase';

import type { ResultadoModo } from './modos/tipos';
import type { SenalConTipo } from './useVistaMapa';
import type { MapRef } from 'react-map-gl/maplibre';
import type { SenalMapa } from '~/lib/queries/civic-map';

import { cn } from '~/lib/utils';

export function SuperficieInstrumento({
  soloLista,
  participando,
  activo,
  modo,
  mapaRef,
  conLugar,
  onFallo,
  alMover,
  tieneDatos,
  enVista,
  sinPunto,
  seleccionada,
  cerrarRegistro,
  intento,
}: {
  soloLista: boolean;
  participando: boolean;
  activo: ResultadoModo;
  modo: string;
  mapaRef: React.RefObject<MapRef>;
  conLugar: boolean;
  onFallo: () => void;
  alMover: (mapa: MapRef | null) => void;
  tieneDatos: boolean;
  enVista: readonly SenalConTipo[];
  sinPunto: number;
  seleccionada: SenalMapa | undefined;
  cerrarRegistro: () => void;
  intento: number;
}) {
  return (
    <div
      hidden={soloLista}
      className={cn(
        'relative h-[640px] min-w-0 max-[960px]:order-1 max-[960px]:h-[440px]',
        // Con el panel de aportes largo, el mapa lo acompaña en vez de quedar arriba con un
        // hueco debajo. 64 px es la altura del encabezado pegajoso.
        participando && 'min-[961px]:sticky min-[961px]:top-16 min-[961px]:self-start',
      )}
    >
      {activo.superficie ? (
        /* La Simulación trae su propia superficie: la cortina son dos
               instancias de mapa y no se puede recortar una capa por posición
               de pantalla. La `key` la aísla igual que a las capas. */
        <Fragment key={`${modo}-${intento}`}>{activo.superficie}</Fragment>
      ) : (
        <MapaBase
          key={intento}
          mapaRef={mapaRef}
          conLugar={conLugar}
          onFallo={() => {
            onFallo();
          }}
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
      {tieneDatos ? (
        <div className="pointer-events-none absolute right-4 top-4 z-10">
          <ContadorEnVista senales={enVista} sinPunto={sinPunto} />
        </div>
      ) : null}

      {activo.leyenda ? (
        <div className="pointer-events-none absolute bottom-14 left-4 z-10">{activo.leyenda}</div>
      ) : null}

      {activo.sobreMapa}
      {seleccionada ? (
        <DetalleRegistroMapa
          senal={seleccionada}
          cerrar={() => {
            cerrarRegistro();
          }}
        />
      ) : null}
    </div>
  );
}
