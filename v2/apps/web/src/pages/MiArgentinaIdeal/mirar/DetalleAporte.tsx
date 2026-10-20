import { MOTIVOS_DE_REPORTE, RESPUESTAS_PARA_REPORTAR, UMBRAL_REPORTES } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';

import { deDonde } from '../comun/lugar';

import { TEXTO_DEL_MOTIVO } from './motivos';
import { TIEMPOS } from './tiempos';

import type { MotivoDeReporte, TarjetaPila } from '@v2/shared';
import type { KeyboardEvent } from 'react';

import { ISLA_DE_PAPEL } from '~/components/papel/esquema';
import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { ApiError } from '~/lib/api';
import { useReportar } from '~/lib/queries/pila';
import { cn } from '~/lib/utils';

export interface DetalleAporteProps {
  tarjeta: TarjetaPila;
  onCerrar: () => void;
  /** Después del «Gracias»: la tarjeta se saltea sin contestarla. */
  onReportado: () => void;
}

const ENFOCABLES = 'button, input, [href], [tabindex]:not([tabindex="-1"])';

/**
 * El aporte entero, en una hoja que sube desde abajo en el teléfono: la línea, lo
 * que escribió completo si lo hubo, y «Reportar este aporte» con tres motivos.
 * Reportar no es contestar: la tarjeta se saltea y no vuelve a aparecer.
 */
export function DetalleAporte({ tarjeta, onCerrar, onReportado }: DetalleAporteProps) {
  const [reportando, setReportando] = useState(false);
  const [motivo, setMotivo] = useState<MotivoDeReporte | null>(null);
  const [falta, setFalta] = useState(false);
  const [gracias, setGracias] = useState(false);
  const reportar = useReportar();
  const hoja = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;
  const reportado = useRef(onReportado);
  reportado.current = onReportado;

  useEffect(() => {
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    hoja.current?.querySelector<HTMLElement>('[data-titulo]')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previo?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!gracias) return;
    const t = window.setTimeout(() => {
      reportado.current();
    }, TIEMPOS.gracias);
    return () => {
      window.clearTimeout(t);
    };
  }, [gracias]);

  /** Escape cierra, y el foco no se escapa de la hoja mientras está abierta. */
  const alTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cerrar.current();
      return;
    }
    if (e.key !== 'Tab' || !hoja.current) return;
    const enfocables = [...hoja.current.querySelectorAll<HTMLElement>(ENFOCABLES)];
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (!primero || !ultimo) return;
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  const enviar = () => {
    if (!motivo) {
      setFalta(true);
      return;
    }
    reportar.mutate(
      { id: tarjeta.id, motivo },
      {
        onSuccess: () => {
          setGracias(true);
        },
        onError: (e) => {
          // Si ya no está en Mirar (lo retuvieron o lo retiraron), no hay nada más que hacer.
          if (e instanceof ApiError && e.status === 404) setGracias(true);
        },
      },
    );
  };

  const errorDeEnvio =
    reportar.isError && !(reportar.error instanceof ApiError && reportar.error.status === 404)
      ? 'No se pudo enviar el reporte. Probá de nuevo en un momento.'
      : null;

  return (
    <div
      className="bg-tinta/40 fixed inset-0 z-50 flex items-end justify-center min-[720px]:items-center min-[720px]:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={hoja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        onKeyDown={alTeclado}
        className={cn(
          'bg-papel border-tinta flex max-h-[86vh] w-full max-w-[520px] flex-col gap-4 overflow-y-auto border-t-2 px-[18px] pb-[calc(22px+env(safe-area-inset-bottom,0px))] pt-5',
          ISLA_DE_PAPEL,
        )}
      >
        <p className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
          Alguien de {deDonde(tarjeta.provincia?.nombre)} imagina
          {tarjeta.tema ? ` · ${tarjeta.tema.etiqueta}` : ''}
        </p>
        <h2
          id="detalle-titulo"
          data-titulo
          tabIndex={-1}
          className="font-archivo text-tinta text-[22px] font-semibold leading-[1.3]"
        >
          «{tarjeta.texto}»
        </h2>
        {tarjeta.origen ? (
          <div>
            <p className="font-space text-tinta-50 mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              Lo que escribió completo
            </p>
            <p className="text-tinta-75 whitespace-pre-wrap text-[16px] leading-relaxed">
              {tarjeta.origen}
            </p>
          </div>
        ) : (
          <p className="text-tinta-50 text-[14px]">Escribió sólo esto.</p>
        )}

        {gracias ? (
          <div role="status">
            <p className="font-bold">Gracias. Lo vamos a tener en cuenta.</p>
            <p className="text-tinta-50 text-[14px]">No te lo vamos a volver a mostrar.</p>
          </div>
        ) : reportando ? (
          <div className="flex flex-col gap-3">
            <fieldset className="m-0 border-0 p-0">
              <legend className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                ¿Por qué no va?
              </legend>
              <div className="flex flex-col gap-2">
                {MOTIVOS_DE_REPORTE.map((m) => (
                  <label
                    key={m}
                    className="border-papel-borde has-[:checked]:border-tinta flex min-h-11 cursor-pointer items-center gap-3 border px-3 py-2 text-[15.5px]"
                  >
                    <input
                      type="radio"
                      name="motivo-de-reporte"
                      value={m}
                      checked={motivo === m}
                      onChange={() => {
                        setMotivo(m);
                        setFalta(false);
                      }}
                    />
                    {TEXTO_DEL_MOTIVO[m]}
                  </label>
                ))}
              </div>
            </fieldset>
            <ErrorOperacion mensaje={falta ? 'Elegí un motivo.' : errorDeEnvio} className="my-0" />
            <BotonAccion ocupado={reportar.isPending} className="w-full" onClick={enviar}>
              Enviar reporte
            </BotonAccion>
            <p className="text-tinta-50 text-[13px] leading-relaxed">
              Con {UMBRAL_REPORTES} reportes de personas distintas que ya contestaron{' '}
              {RESPUESTAS_PARA_REPORTAR} aportes, sale de Mirar. La coordinación lo revisa y lo
              puede devolver.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setReportando(true);
            }}
            className="font-space text-sello min-h-11 self-start text-[12px] font-bold uppercase tracking-[0.08em] underline underline-offset-4"
          >
            Reportar este aporte
          </button>
        )}

        {gracias ? null : (
          <BotonAccion tono="papel" className="w-full" onClick={onCerrar}>
            Volver a la tarjeta
          </BotonAccion>
        )}
      </div>
    </div>
  );
}
