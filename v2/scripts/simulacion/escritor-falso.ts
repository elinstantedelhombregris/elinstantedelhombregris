/**
 * El escritor fabricado — el camino determinista, sin modelo.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §10 (rebanada 4) ·
 * ADR 0009, decisión D4.
 *
 * ## Por qué existe
 *
 * Hoy Ollama **no está instalado en esta máquina** —verificado: `which ollama`
 * no devuelve nada y `curl 127.0.0.1:11434/api/tags` no contesta—, y la ADR
 * 0009 ya resolvió qué hacer en ese caso para los embeddings: se escribe la
 * conexión igual, se la prueba con un doble, y se falla con un mensaje que
 * enseña el comando exacto. Esto es el mismo patrón, copiado a propósito en vez
 * de inventar otro.
 *
 * Con este escritor **todo lo demás se puede probar**: el armado, la huella, el
 * congelamiento, la dinámica de las ocho fases, el mandato sobre la cosecha y
 * las guardas. CI no necesita un demonio levantado, igual que
 * `embebedor-ollama.test.ts` corre sin abrir un socket.
 *
 * ## Y el texto se ve fabricado a propósito
 *
 * Cada semblanza dice, en su primera oración, que la fabricó una regla. No es
 * pudor: un elenco de demostración cuyo texto parece escrito por una persona
 * es exactamente la clase de cosa que termina en una captura de pantalla sin
 * contexto. Que se lea como lo que es cuesta una línea.
 *
 * Su sello es `null`, y eso no es un olvido: **una población fabricada por una
 * fórmula no es una hipótesis de modelo**. Su cosecha sale con autoridad
 * `declarada` y no `hipotesis`, porque cualquiera puede rehacerla con lápiz.
 */
import { azarDe } from '../../packages/civic-core/src/simulacion/espina/azar.js';

import type { EscritorDeElenco, PedidoDeSemblanza, SemblanzaEscrita } from './armar-elenco.js';
import type { TipoSenal } from '../../packages/civic-core/src/senal/vocabulario.js';
import type { SelloDelModelo } from '../../packages/civic-core/src/simulacion/procedencia.js';

const PROPOSITO = { OFICIO: 301, EDAD: 302, ARRAIGO: 303 } as const;

const OFICIOS: readonly string[] = [
  'docente',
  'enfermera',
  'albañil',
  'kiosquera',
  'colectivero',
  'contadora',
  'productor',
  'programadora',
  'jubilado',
  'estudiante',
  'comerciante',
  'mecánica',
];

const TRAMOS: readonly string[] = ['18-24', '25-34', '35-44', '45-59', '60-74', '75+'];

/** Cómo suena cada tipo, en una fórmula. No pretende ser prosa. */
const MOLDE: Readonly<Record<TipoSenal, string>> = {
  basta: 'Acá esto no da para más y lo vengo diciendo hace rato',
  necesidad: 'Lo que falta acá, concreto, es',
  recurso: 'Tengo esto para poner, y está disponible',
  práctica: 'Esto lo hacemos así, y funciona',
  saber: 'Lo que aprendimos con esto, para que no se pierda',
  sueño: 'Lo que me gustaría que pase en este lugar',
  propuesta: 'Propongo esto, y se puede empezar mañana',
  compromiso: 'Me comprometo a esto, con fecha',
  pregunta: 'Lo que quiero saber y nadie contesta',
};

/** Las primeras palabras del ancla, que es lo que ata la persona a su origen. */
function semilla(texto: string, palabras: number): string {
  return texto.split(/\s+/).slice(0, palabras).join(' ').replace(/[.,;:]+$/, '');
}

/**
 * El escritor que no llama a nadie.
 *
 * Determinista por semilla: dos corridas con la misma semilla producen el
 * mismo elenco, byte a byte, y por lo tanto la misma huella.
 */
export class EscritorFabricado implements EscritorDeElenco {
  readonly nombre = 'fabricado';
  /** Corre acá porque no corre en ningún lado: no hay red de por medio. */
  readonly local = true;

  constructor(private readonly semillaDelElenco: number) {}

  sello(): Promise<Omit<SelloDelModelo, 'poblacionHuella'> | null> {
    // `null` a propósito. Ver la cabecera: un sello inventado sería peor que
    // ninguno, porque haría pasar por hipótesis de modelo lo que es aritmética.
    return Promise.resolve(null);
  }

  escribir(pedidos: readonly PedidoDeSemblanza[]): Promise<readonly SemblanzaEscrita[]> {
    return Promise.resolve(
      pedidos.map((pedido): SemblanzaEscrita => {
        const i = pedido.indice;
        const oficio =
          OFICIOS[Math.floor(azarDe(this.semillaDelElenco, i, PROPOSITO.OFICIO) * OFICIOS.length)] ??
          'vecina';
        const tramoEdad =
          TRAMOS[Math.floor(azarDe(this.semillaDelElenco, i, PROPOSITO.EDAD) * TRAMOS.length)] ??
          '35-44';
        const arraigoAnios = Math.floor(
          1 + azarDe(this.semillaDelElenco, i, PROPOSITO.ARRAIGO) * 40,
        );
        const eco = semilla(pedido.ancla.texto, 12);

        return {
          texto:
            `Persona fabricada por una regla, no escrita por un modelo. ` +
            `${oficio} de ${pedido.territorioId}, tramo ${tramoEdad}, ${String(arraigoAnios)} años en el lugar. ` +
            `Salió de «${pedido.ancla.documento} · ${pedido.ancla.ancla}», que empieza diciendo: ${eco}…`,
          oficio,
          tramoEdad,
          arraigoAnios,
          frases: pedido.tiposPedidos.map(
            (tipo, k) =>
              `[fabricada] ${MOLDE[tipo]} — ${pedido.territorioId}, ${eco} (${String(i)}.${String(k)})`,
          ),
        };
      }),
    );
  }
}
