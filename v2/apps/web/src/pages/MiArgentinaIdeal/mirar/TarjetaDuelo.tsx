import { useEffect, useRef, useState } from 'react';

import { deDonde, giroDe } from '../comun/lugar';
import { SelloRespuesta } from '../comun/SelloRespuesta';

import { TIEMPOS } from './tiempos';

import type { TarjetaPila } from '@v2/shared';
import type { KeyboardEvent } from 'react';

import { BotonAccion } from '~/components/participacion/Elementos';
import { cn } from '~/lib/utils';

export interface TarjetaDueloProps {
  par: readonly [TarjetaPila, TarjetaPila];
  /** Se llama una vez, al elegir: `null` es «Los dos por igual». */
  onElegir: (primero: string | null) => void;
  /** Después de que se vio la elección, pasa a la siguiente tarjeta. */
  onSiguiente: () => void;
}

/**
 * ¿Cuál va primero? Dos aportes que la persona ya dijo querer, juntos. Es lo que
 * deja ordenar a la visión: el acuerdo dice qué se comparte, la prioridad dice qué
 * se elige cuando no se puede todo (spec §4). Con teclado: 1, 2 y la barra
 * espaciadora para «por igual».
 */
export function TarjetaDuelo({ par, onElegir, onSiguiente }: TarjetaDueloProps) {
  const [elegido, setElegido] = useState<string | null | undefined>(undefined);
  const siguiente = useRef(onSiguiente);
  siguiente.current = onSiguiente;

  useEffect(() => {
    if (elegido === undefined) return;
    const t = window.setTimeout(() => {
      siguiente.current();
    }, TIEMPOS.duelo);
    return () => {
      window.clearTimeout(t);
    };
  }, [elegido]);

  const elegir = (primero: string | null) => {
    if (elegido !== undefined) return;
    setElegido(primero);
    onElegir(primero);
  };

  const alTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '1') elegir(par[0].id);
    else if (e.key === '2') elegir(par[1].id);
    else if (e.key === ' ' && e.target === e.currentTarget) {
      e.preventDefault();
      elegir(null);
    }
  };

  return (
    <div
      data-foco
      tabIndex={-1}
      onKeyDown={alTeclado}
      aria-labelledby="duelo-titulo"
      role="group"
      className="flex flex-col gap-3"
    >
      <h2 id="duelo-titulo" className="font-anton text-[clamp(28px,7vw,36px)] leading-[1.05]">
        ¿Cuál va primero?
      </h2>
      <p className="text-tinta-75 text-[16px] leading-relaxed">
        Dijiste que querés los dos. Si sólo uno pudiera pasar primero, ¿cuál elegís?
      </p>
      <div className="flex flex-col gap-3 min-[768px]:grid min-[768px]:grid-cols-2">
        {par.map((t, i) => (
          <button
            key={t.id}
            type="button"
            aria-label={`Elegir primero: «${t.texto}»`}
            aria-pressed={elegido === t.id}
            aria-disabled={elegido !== undefined || undefined}
            onClick={() => {
              elegir(t.id);
            }}
            style={{ transform: `rotate(${giroDe(t.id) / 2}deg)` }}
            className={cn(
              'bg-papel-crudo border-papel-borde relative flex flex-col gap-4 border px-5 pb-4 pt-5 text-left shadow-[0_1px_0_#D8D4C8,0_14px_26px_-18px_rgba(22,19,14,0.3)] transition-colors',
              elegido === undefined && 'hover:border-tinta',
            )}
          >
            <span className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
              {i + 1} · Alguien de {deDonde(t.provincia?.nombre)}
            </span>
            <span className="font-archivo text-tinta text-[20px] font-semibold leading-[1.3] [text-wrap:pretty]">
              «{t.texto}»
            </span>
            <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.08em]">
              {t.tema?.etiqueta ?? 'Sin tema'}
            </span>
            {elegido === t.id ? <SelloRespuesta tipo="primero" /> : null}
          </button>
        ))}
      </div>
      <BotonAccion
        tono="papel"
        aria-pressed={elegido === null}
        ocupado={elegido !== undefined}
        onClick={() => {
          elegir(null);
        }}
      >
        Los dos por igual
      </BotonAccion>
      <p className="font-space text-tinta-50 text-[12px]">
        Con teclado: 1, 2, o la barra espaciadora para «por igual».
      </p>
    </div>
  );
}
