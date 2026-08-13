import type { Corrida, Diseno, Persona, ResultadoBarrido, SelloDelModelo } from '@v2/civic-core';

/**
 * El contrato entre la página y el worker del barrido.
 *
 * Vive suelto de los dos porque el worker **no puede importar nada del DOM** y
 * la página no puede importar el worker: si los tipos vivieran en cualquiera de
 * los dos archivos, uno terminaría arrastrando al otro adentro de su bundle.
 *
 * Todo lo que cruza es estructura plana clonable: `Escenario`, `Diseno` y
 * `Corrida` son objetos y `Uint8Array`, que el clon estructurado maneja sin
 * ayuda. No hay capa de serialización, y no hace falta.
 */

/**
 * El elenco tal como cruza al worker.
 *
 * Cruza **crudo**, no congelado: `Elenco` lleva una marca que sólo
 * `congelarElenco()` puede poner, y el clon estructurado la perdería. Que el
 * worker tenga que congelarlo del otro lado no es una molestia — es la garantía
 * de que la huella se recalcula sobre el contenido que efectivamente llegó, y
 * de que un elenco editado a mano en el camino no corre.
 */
export interface ElencoTransferible {
  /** Lo que el manifiesto dice ser. Se contrasta contra el contenido. */
  readonly huellaDeclarada: string;
  readonly personas: readonly Persona[];
  readonly padre: string | null;
  /** Sin `poblacionHuella`: no se sella con una huella que todavía no existe. */
  readonly sello: Omit<SelloDelModelo, 'poblacionHuella'> | null;
  readonly corpus: readonly { documento: string; sha: string; personas: number }[];
}

export interface PedidoDeBarrido {
  readonly tipo: 'barrer';
  /** Identifica el pedido: una respuesta vieja que llega tarde se descarta. */
  readonly id: number;
  /** El reloj congelado del país. Los dos hilos arman el mismo `Pais` con esto. */
  readonly ahora: number;
  readonly diseno: Diseno;
  /** `null` en modo forma, y el tipo lo dice. */
  readonly elenco: ElencoTransferible | null;
}

export type MensajeDelWorker =
  | {
      readonly tipo: 'progreso';
      readonly id: number;
      readonly hechas: number;
      /** Cota superior, no promesa: la bisección corta antes cuando puede. */
      readonly previstas: number;
    }
  | {
      readonly tipo: 'listo';
      readonly id: number;
      readonly resultado: ResultadoBarrido;
      /**
       * La corrida del escenario tal como está en la mesa, sin barrer nada.
       *
       * Viaja con el barrido porque es el punto de referencia contra el que se
       * leen todos los demás, y calcularla acá cuesta una corrida: pedírsela al
       * hilo de la pantalla obligaría a la página a correr el motor en el camino
       * del render, que es justo lo que este worker existe para evitar.
       */
      readonly base: Corrida;
      readonly ms: number;
    }
  | { readonly tipo: 'error'; readonly id: number; readonly mensaje: string };

/**
 * Cada cuántas corridas avisa el worker.
 *
 * Ni una por corrida —dos mil mensajes por barrido saturan la cola del hilo
 * principal y la barra tiembla— ni una sola al final, que es no tener barra.
 */
export const CORRIDAS_POR_AVISO = 25;

/**
 * Cuántas corridas va a hacer un método, como cota superior.
 *
 * Es una **cota**, y se dice: la bisección corta apenas la ventana baja de la
 * tolerancia, y un territorio que ya tiene mandato se resuelve en una sola
 * corrida. Prometer un total exacto y llegar al 60 % sería peor que declarar
 * una cota y llegar antes.
 */
export function corridasPrevistas(diseno: Diseno, clavesConectadas: number): number {
  switch (diseno.metodo.tipo) {
    case 'unaPorVez':
      return Math.max(2, Math.round(diseno.metodo.pasos)) * clavesConectadas;
    case 'hipercubo':
      return Math.max(1, Math.round(diseno.metodo.muestras));
    case 'umbral':
      // Dos sondas en los bordes más la bisección sobre [0, 1.000] a 0,01 de
      // tolerancia: log2(100.000) ≈ 17.
      return diseno.metodo.territorios.length * 19;
  }
}
