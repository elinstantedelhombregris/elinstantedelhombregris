/// <reference lib="webworker" />

import {
  barrer,
  conectadaEn,
  congelarElenco,
  correr,
  modoForma,
  modoGente,
  type Cosecha,
  type Elenco,
  type Escenario,
  type Modo,
  type Pais,
  type Poblacion,
} from '@v2/civic-core';

import { CORRIDAS_POR_AVISO, corridasPrevistas } from './barrido-mensajes';
import { construirPais, territoriosDelPais } from './simulacion-pais';

import type { ElencoTransferible, MensajeDelWorker, PedidoDeBarrido } from './barrido-mensajes';

/**
 * El worker del barrido — regla 10 de la constitución de producto.
 *
 * Mil corridas del modo forma sobre 24 provincias son milisegundos y no
 * necesitarían un hilo aparte. Dos cosas cambian eso y son las que justifican
 * este archivo: bajar de provincia a municipio multiplica el costo por cien
 * (medido: 0,0082 ms contra 0,8926 ms por corrida), y una función del modo
 * gente de mil personas cuesta 1,888 ms **cada una**. Un barrido de mil puntos
 * pasa de dos frames a dos segundos de pestaña congelada, y una pestaña
 * congelada sin explicación es el peor resultado posible de una herramienta que
 * existe para que alguien piense con ella.
 *
 * **La cancelación es `terminate()` desde el otro lado, y tiene que serlo.** Un
 * worker dedicado sólo mira su cola de mensajes cuando la pila se vacía, así
 * que un `postMessage({tipo:'cancelar'})` no llegaría hasta que el barrido
 * terminara — o sea, nunca a tiempo. El progreso sí viaja en el otro sentido
 * durante el bucle: postear no espera al turno de nadie.
 *
 * Dos trampas del empaquetado, verificadas y por eso escritas acá:
 *
 * - con el `worker.format: 'iife'` que Vite trae por defecto este archivo **no
 *   puede** hacer `import()` dinámico. No hace falta: sólo importa civic-core,
 *   que Vite inlinea en el chunk del worker;
 * - sin el `declare const self` de abajo, el `lib` de `@v2/config-typescript`
 *   —que trae DOM y no WebWorker— resuelve `self` al `Window` del navegador y
 *   `self.postMessage(x)` **compila y tipa mal** contra la firma de
 *   `window.postMessage`. El `declare` no es cosmético.
 */

declare const self: DedicatedWorkerGlobalScope;

const avisar = (mensaje: MensajeDelWorker): void => {
  self.postMessage(mensaje);
};

/**
 * El modo, instrumentado.
 *
 * El contador va **acá adentro** y no en `barrer()` por una razón que vale la
 * pena decir: `correr()` llama al modo exactamente una vez por corrida, en los
 * tres métodos y en los dos modos. Envolver el modo da el progreso sin tocar
 * una línea de `civic-core` y sin que el paquete puro se entere de que existe
 * un worker.
 */
function instrumentar(
  modo: Modo,
  id: number,
  previstas: number,
  contador: { hechas: number },
): Modo {
  return (esc: Escenario, pais: Pais, pob: Poblacion | null): Cosecha => {
    contador.hechas += 1;
    if (contador.hechas % CORRIDAS_POR_AVISO === 0) {
      avisar({ tipo: 'progreso', id, hechas: contador.hechas, previstas });
    }
    return modo(esc, pais, pob);
  };
}

/**
 * Congela el elenco de este lado del hilo.
 *
 * `congelarElenco` verifica ids corridos, vínculos colgados y personas atadas a
 * un territorio que el país no conoce —la fuga silenciosa donde las voces no se
 * cuentan en ningún lado y el total cierra igual—, y calcula la huella sobre el
 * contenido. Contrastarla contra la declarada es lo que caza un `conducta.json`
 * editado a mano: si el manifiesto dice una huella y el contenido da otra, las
 * corridas de hoy no son comparables con las de ayer aunque lleven la misma
 * etiqueta.
 */
function congelar(transferible: ElencoTransferible): Elenco {
  const elenco = congelarElenco(
    {
      personas: transferible.personas,
      padre: transferible.padre,
      sello: transferible.sello,
      corpus: transferible.corpus,
    },
    territoriosDelPais(),
  );
  if (elenco.poblacion.huella !== transferible.huellaDeclarada) {
    throw new Error(
      `El elenco dice ser ${transferible.huellaDeclarada} y su conducta hashea ` +
        `${elenco.poblacion.huella}. Alguien editó el archivo o lo escribió otra versión del ` +
        'generador: correr igual daría resultados con la misma etiqueta y distinto significado.',
    );
  }
  return elenco;
}

self.addEventListener('message', (evento: MessageEvent<PedidoDeBarrido>) => {
  const pedido = evento.data;
  const arranque = Date.now();
  try {
    const pais = construirPais(pedido.ahora);
    const conectadas = pedido.diseno.claves.filter((c) => conectadaEn(c, pedido.diseno.modo)).length;
    const previstas = corridasPrevistas(pedido.diseno, conectadas);
    const contador = { hechas: 0 };

    let crudo: Modo;
    let poblacion: Poblacion | null = null;

    if (pedido.elenco === null) {
      crudo = modoForma;
    } else {
      const elenco = congelar(pedido.elenco);
      poblacion = elenco.poblacion;
      // El elenco entra por captura y no por el parámetro `pob`: `modoGente`
      // necesita el objeto congelado con su marca, y `Modo` recibe la
      // `Poblacion` de adentro. `barrer` usa esa población para verificar la
      // huella antes de la primera corrida, que es donde tiene que verificarse.
      crudo = (esc: Escenario, unPais: Pais): Cosecha => modoGente(esc, unPais, elenco);
    }

    /**
     * La corrida de referencia sale con el modo **sin instrumentar**: no es una
     * corrida del barrido y contarla adentro del progreso haría que la barra
     * arrancara con una hecha antes de empezar.
     */
    const sello = poblacion?.sello ?? null;
    const base = correr(pedido.diseno.base, pais, crudo, poblacion, sello).corrida;

    const ejecutar = instrumentar(crudo, pedido.id, previstas, contador);
    const resultado = barrer(pedido.diseno, pais, ejecutar, poblacion);
    avisar({ tipo: 'listo', id: pedido.id, resultado, base, ms: Date.now() - arranque });
  } catch (error) {
    avisar({
      tipo: 'error',
      id: pedido.id,
      mensaje: error instanceof Error ? error.message : String(error),
    });
  }
});
