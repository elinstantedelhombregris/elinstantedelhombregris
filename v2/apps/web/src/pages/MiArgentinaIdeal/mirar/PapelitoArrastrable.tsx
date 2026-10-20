import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { deDonde } from '../comun/lugar';
import { Papelito } from '../comun/Papelito';
import { SelloRespuesta } from '../comun/SelloRespuesta';

import { TIEMPOS } from './tiempos';
import { acotar, respuestaDelArrastre, UMBRAL_ARRASTRE, vueloDe } from './vuelo';

import type { TarjetaPila, ValorDeOpinion } from '@v2/shared';

export interface PapelitoArrastrableProps {
  tarjeta: TarjetaPila;
  /** La respuesta que se acaba de dar: la tarjeta se va y después avisa con `onSalio`. */
  saliendo: ValorDeOpinion | null;
  onResponder: (valor: ValorDeOpinion) => void;
  /** Tocarla sin moverla, o Enter: el aporte entero y «Reportar este aporte». */
  onAbrir: () => void;
  onSalio: () => void;
  /** El id del texto que explica cómo se contesta. */
  ayuda: string;
}

const RESORTE = { type: 'spring', stiffness: 520, damping: 34 } as const;

/**
 * El papelito de arriba de la mesa. Se corre con el dedo o el mouse: a la derecha
 * es «Yo también», a la izquierda «Yo no» y hacia abajo «Paso». El sello se va
 * marcando a medida que se corre. Deslizar es un atajo: los botones de abajo hacen
 * lo mismo. Con movimiento reducido no vuela, se desvanece.
 */
export function PapelitoArrastrable({
  tarjeta,
  saliendo,
  onResponder,
  onAbrir,
  onSalio,
  ayuda,
}: PapelitoArrastrableProps) {
  const reducido = useReducedMotion() === true;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacidad = useMotionValue(1);
  const giro = useTransform(x, (v) => v / 18);
  const si = useTransform(x, (v) => acotar(v / UMBRAL_ARRASTRE));
  const no = useTransform(x, (v) => acotar(-v / UMBRAL_ARRASTRE));
  const paso = useTransform(() => (Math.abs(x.get()) < 50 ? acotar(y.get() / UMBRAL_ARRASTRE) : 0));
  const arrastrado = useRef(false);
  const alSalir = useRef(onSalio);
  alSalir.current = onSalio;

  useEffect(() => {
    if (!saliendo) return;
    const destino = vueloDe(saliendo, reducido);
    const duracion = (reducido ? TIEMPOS.desvanecer : TIEMPOS.vuelo) / 1000;
    const controles = [animate(opacidad, destino.opacity, { duration: duracion })];
    if (destino.x !== undefined) controles.push(animate(x, destino.x, { duration: duracion }));
    if (destino.y !== undefined) controles.push(animate(y, destino.y, { duration: duracion }));
    const fin = window.setTimeout(
      () => {
        alSalir.current();
      },
      reducido ? TIEMPOS.desvanecer : TIEMPOS.vuelo,
    );
    return () => {
      window.clearTimeout(fin);
      for (const c of controles) c.stop();
    };
  }, [saliendo, reducido, opacidad, x, y]);

  const sello = (valor: ValorDeOpinion) => (saliendo === valor ? 1 : undefined);

  return (
    <motion.div
      data-foco
      role="button"
      tabIndex={0}
      aria-label={`Alguien de ${deDonde(tarjeta.provincia?.nombre)} imagina: «${tarjeta.texto}». Enter para verlo entero o reportarlo.`}
      aria-describedby={ayuda}
      data-vuelo={saliendo ? (reducido ? 'desvanece' : 'vuela') : undefined}
      drag={saliendo === null}
      dragMomentum={false}
      onPointerDown={() => {
        arrastrado.current = false;
      }}
      onDragStart={() => {
        arrastrado.current = true;
      }}
      onDragEnd={(_, info) => {
        const valor = respuestaDelArrastre(info.offset.x, info.offset.y);
        if (valor) {
          onResponder(valor);
          return;
        }
        void animate(x, 0, RESORTE);
        void animate(y, 0, RESORTE);
      }}
      onClick={() => {
        if (!arrastrado.current && saliendo === null) onAbrir();
      }}
      style={{ x, y, rotate: giro, opacity: opacidad, touchAction: 'none' }}
      className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
    >
      <Papelito
        id={tarjeta.id}
        texto={tarjeta.texto}
        provincia={tarjeta.provincia?.nombre ?? null}
        tema={tarjeta.tema?.etiqueta ?? null}
        className="h-full"
        pie={<span>Tocá para ver más</span>}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: sello('acuerdo') ?? si }}
        >
          <SelloRespuesta tipo="si" />
        </motion.span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: sello('desacuerdo') ?? no }}
        >
          <SelloRespuesta tipo="no" />
        </motion.span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: sello('paso') ?? paso }}
        >
          <SelloRespuesta tipo="paso" />
        </motion.span>
      </Papelito>
    </motion.div>
  );
}
