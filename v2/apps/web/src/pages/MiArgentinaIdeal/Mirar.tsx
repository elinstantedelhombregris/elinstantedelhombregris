import { esRegion } from '@v2/civic-core';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useSearch } from 'wouter';

import { Pasos } from './comun/Pasos';
import { AvisoPendientes } from './mirar/AvisoPendientes';
import { DetalleAporte } from './mirar/DetalleAporte';
import { FinDeTanda } from './mirar/FinDeTanda';
import { MirarVacio } from './mirar/MirarVacio';
import { PantallaTarjeta } from './mirar/PantallaTarjeta';
import { PreguntaProvincia } from './mirar/PreguntaProvincia';
import { mirarNuevo, reducirMirar } from './mirar/recorrido';
import { TarjetaDuelo } from './mirar/TarjetaDuelo';
import { TarjetaEscribir } from './mirar/TarjetaEscribir';

import type { AvisoDeRespuesta } from './mirar/avisos';
import type { TarjetaPila, ValorDeOpinion } from '@v2/shared';
import type { KeyboardEvent } from 'react';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import {
  provinciaRecordada,
  recordarProvincia,
  useComparar,
  useOpinar,
  usePedirTanda,
} from '~/lib/queries/pila';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const ESCRIBIENDO = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

/**
 * Mirar — los aportes de otras personas, de a uno (spec 2026-10-19 §4).
 *
 * Pide una tanda al entrar. Si no se sabe la provincia de quien mira, la pregunta
 * antes del primer aporte. Cada respuesta se manda sin esperar (la tarjeta avanza
 * igual) y, después de la 4.ª y la 8.ª, puede tocar un «¿Cuál va primero?». La
 * tanda termina; otra se pide, nunca empieza sola.
 */
export function Mirar() {
  useTituloDePagina('Mirar');
  const parametros = new URLSearchParams(useSearch());
  const desdeImaginar = parametros.get('desde') === 'imaginar';
  const region = parametros.get('region');
  const priorizarRegion = esRegion(region) ? region : null;
  // Desde Ver («Decir de qué provincia soy»): se pregunta aunque ya haya contestado antes.
  const elegirProvincia = parametros.get('provincia') === 'elegir';

  const { mutateAsync: pedirLaTanda } = usePedirTanda();
  const opinion = useOpinar();
  const comparar = useComparar();
  const [m, despachar] = useReducer(reducirMirar, undefined, mirarNuevo);
  const [pedido, setPedido] = useState<{ pidiendo: boolean; error: string | null }>({
    pidiendo: true,
    error: null,
  });
  const [provincia, setProvincia] = useState(provinciaRecordada);
  const [saliendo, setSaliendo] = useState<ValorDeOpinion | null>(null);
  const [aviso, setAviso] = useState<AvisoDeRespuesta | null>(null);
  const [detalle, setDetalle] = useState(false);
  const turno = useRef(0);
  const zona = useRef<HTMLElement>(null);
  const enfocar = useRef(false);
  const pedida = useRef(false);

  // La promesa y no los callbacks de `mutate`: en StrictMode, una mutación lanzada al montar
  // pierde a su observador cuando React simula el desmontaje, y la pantalla quedaría esperando.
  const pedirTanda = useCallback(() => {
    setPedido({ pidiendo: true, error: null });
    pedirLaTanda(priorizarRegion ? { priorizarRegion } : {}).then(
      (tanda) => {
        setPedido({ pidiendo: false, error: null });
        setAviso(null);
        despachar({ tipo: 'empezar', tanda, desdeImaginar });
      },
      (e: unknown) => {
        setPedido({
          pidiendo: false,
          error: e instanceof Error ? e.message : 'No pudimos traer aportes. Probá de nuevo.',
        });
      },
    );
  }, [pedirLaTanda, priorizarRegion, desdeImaginar]);

  useEffect(() => {
    if (pedida.current) return;
    pedida.current = true;
    pedirTanda();
  }, [pedirTanda]);

  const indice = m.tanda?.indice;
  const items = m.tanda?.items;
  useEffect(() => {
    if (!enfocar.current) return;
    enfocar.current = false;
    zona.current?.querySelector<HTMLElement>('[data-foco]')?.focus({ preventScroll: true });
  }, [indice, items, provincia]);

  const servidor = m.servidor;
  const provinciaId = provincia !== undefined ? provincia : (servidor?.provincia?.id ?? null);
  useEffect(() => {
    if (provincia === undefined && servidor?.provincia) recordarProvincia(servidor.provincia.id);
  }, [provincia, servidor]);

  const tanda = m.tanda;
  const actual = tanda ? tanda.items[tanda.indice] : undefined;
  const aportes = tanda?.items.filter((i) => i.tipo === 'aporte').length ?? 0;
  const hechas = tanda?.items.slice(0, tanda.indice).filter((i) => i.tipo === 'aporte').length ?? 0;
  const preguntar =
    (servidor?.preguntarProvincia === true || elegirProvincia) &&
    provincia === undefined &&
    (items?.length ?? 0) > 0;

  const responder = (valor: ValorDeOpinion) => {
    if (saliendo || detalle || actual?.tipo !== 'aporte') return;
    turno.current += 1;
    const mio = turno.current;
    setAviso(null);
    void opinion.opinar({ id: actual.tarjeta.id, valor, provinciaId }).then((r) => {
      if (r && mio === turno.current) setAviso({ valor, ...r });
    });
    despachar({ tipo: 'respondio', valor });
    setSaliendo(valor);
  };

  const pasar = (accion: () => void) => {
    enfocar.current = true;
    accion();
  };

  const alTeclado = (e: KeyboardEvent<HTMLElement>) => {
    if (detalle || preguntar || actual?.tipo !== 'aporte') return;
    if (e.target instanceof HTMLElement && ESCRIBIENDO.has(e.target.tagName)) return;
    const valor =
      e.key === 'ArrowRight'
        ? 'acuerdo'
        : e.key === 'ArrowLeft'
          ? 'desacuerdo'
          : e.key === 'ArrowDown'
            ? 'paso'
            : null;
    if (valor) {
      e.preventDefault();
      responder(valor);
    } else if (
      e.key === 'Enter' &&
      e.target instanceof HTMLElement &&
      e.target.hasAttribute('data-foco')
    ) {
      e.preventDefault();
      setDetalle(true);
    }
  };

  const siguienteAporte = (): TarjetaPila | null => {
    if (!tanda) return null;
    const otro = tanda.items.slice(tanda.indice + 1).find((i) => i.tipo === 'aporte');
    return otro?.tipo === 'aporte' ? otro.tarjeta : null;
  };

  const contenido = () => {
    if (pedido.error !== null)
      return (
        <div className="flex flex-col gap-3">
          <ErrorOperacion mensaje={pedido.error} className="my-0" />
          <BotonAccion tono="papel" className="self-start" onClick={pedirTanda}>
            Probar de nuevo
          </BotonAccion>
        </div>
      );
    if (!tanda || !servidor)
      return (
        <p role="status" className="font-space text-tinta-50 text-[13px]">
          Buscando aportes…
        </p>
      );
    if (preguntar)
      return (
        <PreguntaProvincia
          onElegir={(id) => {
            recordarProvincia(id);
            pasar(() => {
              setProvincia(id);
            });
          }}
        />
      );
    if (tanda.items.length === 0) return <MirarVacio yaAporto={servidor.yaAporto} />;
    if (!actual) {
      const vistos = tanda.vistos;
      return (
        <FinDeTanda
          miradas={vistos.length}
          acuerdos={vistos.filter((v) => v.valor === 'acuerdo').map((v) => v.tarjeta)}
          yaAporto={servidor.yaAporto}
          pidiendo={pedido.pidiendo}
          onOtra={() => {
            pasar(pedirTanda);
          }}
        />
      );
    }
    if (actual.tipo === 'duelo')
      return (
        <TarjetaDuelo
          key={`${actual.par[0].id}|${actual.par[1].id}`}
          par={actual.par}
          onElegir={(primero) => {
            comparar.mutate({ a: actual.par[0].id, b: actual.par[1].id, primero });
          }}
          onSiguiente={() => {
            pasar(() => {
              despachar({ tipo: 'eligioDuelo' });
            });
          }}
        />
      );
    if (actual.tipo === 'escribir')
      return (
        <TarjetaEscribir
          onSaltear={() => {
            pasar(() => {
              despachar({ tipo: 'salteoEscribir' });
            });
          }}
        />
      );
    const tarjeta = actual.tarjeta;
    return (
      <>
        <PantallaTarjeta
          tarjeta={tarjeta}
          siguiente={siguienteAporte()}
          saliendo={saliendo}
          aviso={aviso}
          onResponder={responder}
          onAbrir={() => {
            setDetalle(true);
          }}
          onSalio={() => {
            pasar(() => {
              setSaliendo(null);
              despachar({ tipo: 'avanzar' });
            });
          }}
        />
        {detalle ? (
          <DetalleAporte
            tarjeta={tarjeta}
            onCerrar={() => {
              setDetalle(false);
            }}
            onReportado={() => {
              turno.current += 1;
              setAviso(null);
              setDetalle(false);
              pasar(() => {
                despachar({ tipo: 'reporto' });
              });
            }}
          />
        ) : null}
      </>
    );
  };

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 pb-16 pt-6 min-[561px]:px-6">
      <Pasos actual="mirar" />
      <section
        ref={zona}
        aria-labelledby="mirar-titulo"
        onKeyDown={alTeclado}
        className="mt-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h1
            id="mirar-titulo"
            className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.14em]"
          >
            Mirar · lo que imaginan otras personas
          </h1>
          {aportes > 0 && actual?.tipo === 'aporte' ? (
            <span className="font-space text-tinta-50 shrink-0 whitespace-nowrap text-[11px] tabular-nums">
              {Math.min(hechas + 1, aportes)} de {aportes}
            </span>
          ) : null}
        </div>
        {contenido()}
        <AvisoPendientes
          perdidas={opinion.perdidas}
          onReintentar={() => {
            void opinion.reintentar();
          }}
        />
      </section>
    </main>
  );
}
