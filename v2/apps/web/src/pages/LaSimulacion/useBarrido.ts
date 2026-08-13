import { conectadaEn } from '@v2/civic-core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { corridasPrevistas } from './barrido-mensajes';

import type { ElencoTransferible, MensajeDelWorker, PedidoDeBarrido } from './barrido-mensajes';
import type { Corrida, Diseno, ResultadoBarrido } from '@v2/civic-core';

/**
 * El barrido, del lado de la página.
 *
 * Cuatro decisiones, cada una con su motivo:
 *
 * 1. **El worker se crea al primer barrido, no al montar.** Una página que
 *    alguien abre para leer no tiene por qué levantar un hilo, y así los tests
 *    de componente renderizan sin necesitar `Worker` en el entorno.
 * 2. **Cancelar es terminar.** Un worker dedicado no mira su cola de mensajes
 *    mientras corre una tarea sincrónica, así que pedirle amablemente que pare
 *    llegaría cuando ya terminó. Se lo termina y se levanta uno nuevo al
 *    siguiente pedido: instantáneo, y sin dejar la mitad de un resultado.
 * 3. **Cada pedido lleva id.** Un resultado que llega después de haber cambiado
 *    el diseño no puede pisar la pantalla con números de otra pregunta.
 * 4. **Sin `Worker` no se finge.** Si el entorno no lo tiene, el estado lo dice
 *    en vez de correr mil corridas en el hilo del render y colgar la pestaña.
 */

export type EstadoDelBarrido =
  | { readonly fase: 'quieto' }
  | { readonly fase: 'corriendo'; readonly hechas: number; readonly previstas: number }
  | {
      readonly fase: 'listo';
      readonly resultado: ResultadoBarrido;
      readonly base: Corrida;
      readonly ms: number;
    }
  | { readonly fase: 'fallo'; readonly mensaje: string }
  | { readonly fase: 'cancelado'; readonly hechas: number };

export interface Barrido {
  readonly estado: EstadoDelBarrido;
  readonly correr: (diseno: Diseno, ahora: number, elenco: ElencoTransferible | null) => void;
  readonly cancelar: () => void;
}

const SIN_WORKER =
  'Este navegador no tiene Web Workers, y el barrido no se corre en el hilo de la pantalla: mil ' +
  'corridas ahí la dejarían congelada sin decir por qué.';

export function useBarrido(): Barrido {
  const [estado, setEstado] = useState<EstadoDelBarrido>({ fase: 'quieto' });
  const workerRef = useRef<Worker | null>(null);
  const pedidoRef = useRef(0);
  const hechasRef = useRef(0);

  const terminar = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => terminar, [terminar]);

  const cancelar = useCallback(() => {
    // El id avanza antes de terminar: si un mensaje ya estaba en vuelo, cuando
    // llegue va a traer un id viejo y se descarta solo.
    pedidoRef.current += 1;
    terminar();
    setEstado({ fase: 'cancelado', hechas: hechasRef.current });
  }, [terminar]);

  const correr = useCallback(
    (diseno: Diseno, ahora: number, elenco: ElencoTransferible | null) => {
      if (typeof Worker === 'undefined') {
        setEstado({ fase: 'fallo', mensaje: SIN_WORKER });
        return;
      }

      // Un barrido nuevo cancela el anterior: dos hilos calculando dos diseños
      // distintos terminan pintando el que llegó último, que no es el que la
      // persona está mirando.
      terminar();
      pedidoRef.current += 1;
      hechasRef.current = 0;
      const id = pedidoRef.current;

      const worker = new Worker(new URL('./barrido.worker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;

      worker.addEventListener('message', (evento: MessageEvent<MensajeDelWorker>) => {
        const mensaje = evento.data;
        if (mensaje.id !== pedidoRef.current) return;
        switch (mensaje.tipo) {
          case 'progreso':
            hechasRef.current = mensaje.hechas;
            setEstado({ fase: 'corriendo', hechas: mensaje.hechas, previstas: mensaje.previstas });
            break;
          case 'listo':
            setEstado({
              fase: 'listo',
              resultado: mensaje.resultado,
              base: mensaje.base,
              ms: mensaje.ms,
            });
            break;
          case 'error':
            setEstado({ fase: 'fallo', mensaje: mensaje.mensaje });
            break;
        }
      });

      worker.addEventListener('error', (evento: ErrorEvent) => {
        if (id !== pedidoRef.current) return;
        setEstado({
          fase: 'fallo',
          mensaje: evento.message === '' ? 'El worker del barrido murió sin mensaje.' : evento.message,
        });
      });

      // Las conectadas, no las dieciocho: el worker cuenta las mismas, y una
      // cota que arranca en 18 y salta a 12 hace que la barra retroceda con el
      // primer aviso.
      const conectadas = diseno.claves.filter((c) => conectadaEn(c, diseno.modo)).length;
      setEstado({
        fase: 'corriendo',
        hechas: 0,
        previstas: corridasPrevistas(diseno, conectadas),
      });

      const pedido: PedidoDeBarrido = { tipo: 'barrer', id, ahora, diseno, elenco };
      worker.postMessage(pedido);
    },
    [terminar],
  );

  return { estado, correr, cancelar };
}
