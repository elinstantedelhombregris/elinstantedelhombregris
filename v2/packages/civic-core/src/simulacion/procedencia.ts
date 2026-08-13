/**
 * La primitiva de honestidad de la Simulación — spec §3.1, y §3.4 del módulo.
 *
 * Todo lo que el motor devuelve y la UI puede mostrar es una `Magnitud`: un
 * número pelado que llegue a pantalla es un bug, no un descuido de
 * presentación, y hay una guarda que lo caza (`guardas-simulacion.test.ts`).
 *
 * **La cuarta procedencia envuelve, no reemplaza.** La tentación era agregar
 * `{ tipo: 'generado', modelo, digest }` al lado de las otras tres. Está mal:
 * la legitimidad de una corrida de agentes **sí** es un derivado con fórmula
 * real (`alcance × persistencia`); lo que no es real es el conteo del que
 * cuelga. La corrupción está en la **raíz** de la cadena, no en cada nodo, y
 * aplanarla pierde la fórmula, que es justo lo que `derivado` existe para
 * mostrar. Por eso `hipotesis` lleva adentro la procedencia que envuelve, y
 * `derivarDe` propaga la autoridad hacia arriba: **no hay lavado de
 * procedencia**, que es el agujero que un cuarto par plano dejaría abierto.
 *
 * La línea que separa `derivado` de `hipotesis`, en una frase: **un derivado se
 * puede rehacer con lápiz; una hipótesis sólo se puede volver a correr y
 * esperar.** Por eso el modo forma nunca produce `hipotesis` aunque sea un
 * modelo: su fórmula está a la vista y cualquiera la verifica.
 */
export type Procedencia =
  | { tipo: 'medido'; fuente: string }
  | { tipo: 'declarado'; palanca: string }
  | { tipo: 'derivado'; formula: string; de: readonly string[] }
  | { tipo: 'hipotesis'; sobre: Procedencia; sello: SelloDelModelo };

/**
 * De qué corrida de qué modelo salió esta hipótesis — la D5 de la ADR 0009
 * hecha campo, viajando con **cada magnitud** y no en una nota al pie.
 *
 * Dos corridas de modelos distintos lo dicen en vez de esconderlo, y la
 * `poblacionHuella` es lo que impide el error central del §1.2: si la
 * población se regenerara en cada corrida del barrido, estarías midiendo la
 * varianza del modelo y creyendo que medís la palanca.
 */
export interface SelloDelModelo {
  /** `'llama3.1:8b-instruct-q4_K_M'`. */
  readonly modelo: string;
  readonly digest: string;
  /** Temperatura > 0 hace la corrida no reproducible, y la `Corrida` lo dice. */
  readonly temperatura: number;
  readonly poblacionHuella: string;
  readonly semilla: number;
  /** Epoch en milisegundos. Entra por parámetro: el motor no lee el reloj. */
  readonly generadaEn: number;
}

export interface Magnitud {
  valor: number;
  unidad: string;
  procedencia: Procedencia;
}

/** Dato real de la plataforma o de un documento citado. */
export const medido = (valor: number, unidad: string, fuente: string): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'medido', fuente },
});

/** Parámetro que movió la persona, o coeficiente publicado. */
export const declarado = (valor: number, unidad: string, palanca: string): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'declarado', palanca },
});

/** Cálculo sobre los anteriores, con la fórmula a la vista. */
export const derivado = (
  valor: number,
  unidad: string,
  formula: string,
  de: readonly string[],
): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'derivado', formula, de },
});

/**
 * Una hipótesis del modelo, envolviendo la procedencia que igual vale.
 *
 * Regla 6 de la Constitución: la IA puede sugerir, nunca determina la verdad de
 * una señal. Una voz ensayada es `hipotesis`, **jamás `medido`**: nada la midió.
 */
export const hipotesis = (magnitud: Magnitud, sello: SelloDelModelo): Magnitud =>
  magnitud.procedencia.tipo === 'hipotesis'
    ? magnitud
    : {
        valor: magnitud.valor,
        unidad: magnitud.unidad,
        procedencia: { tipo: 'hipotesis', sobre: magnitud.procedencia, sello },
      };

/** Si en algún punto de la cadena hay una hipótesis, el todo es hipótesis. */
export function esHipotesis(procedencia: Procedencia): boolean {
  return procedencia.tipo === 'hipotesis';
}

/** El sello de la hipótesis más externa, o `null` si no hay ninguna. */
export function selloDe(procedencia: Procedencia): SelloDelModelo | null {
  return procedencia.tipo === 'hipotesis' ? procedencia.sello : null;
}

/** Cómo se nombra un insumo dentro del `de:` de un derivado. */
function nombreDe(procedencia: Procedencia): string {
  switch (procedencia.tipo) {
    case 'medido':
      return procedencia.fuente;
    case 'declarado':
      return procedencia.palanca;
    case 'derivado':
      return procedencia.formula;
    case 'hipotesis':
      return nombreDe(procedencia.sobre);
  }
}

/**
 * Derivar PROPAGANDO autoridad: si alguno de los insumos es hipótesis, el
 * resultado también lo es. Es la regla 6 hecha imposible de violar — el camino
 * corto (`derivado(...)` a mano sobre insumos hipotéticos) sigue existiendo,
 * y por eso hay una guarda que afirma que ninguna magnitud de una corrida de
 * agentes se escapa sin sello.
 *
 * El sello que sobrevive es el del **primer** insumo hipotético en orden de
 * argumento. Mezclar sellos de dos corridas distintas no está contemplado y no
 * hace falta que lo esté: un barrido verifica antes de la primera corrida que
 * todas comparten la misma `poblacionHuella` (guarda «la huella no cambió»).
 */
export function derivarDe(
  de: readonly Magnitud[],
  valor: number,
  unidad: string,
  formula: string,
): Magnitud {
  const base = derivado(
    valor,
    unidad,
    formula,
    de.map((m) => nombreDe(m.procedencia)),
  );
  for (const insumo of de) {
    const sello = selloDe(insumo.procedencia);
    if (sello !== null) return hipotesis(base, sello);
  }
  return base;
}

const TIPOS: readonly string[] = ['medido', 'declarado', 'derivado', 'hipotesis'];

/** Type guard usado por la guarda «sin números huérfanos». */
export function esMagnitud(valor: unknown): valor is Magnitud {
  if (typeof valor !== 'object' || valor === null) return false;
  const candidato = valor as Record<string, unknown>;
  if (typeof candidato.valor !== 'number' || typeof candidato.unidad !== 'string') return false;
  const proc = candidato.procedencia;
  if (typeof proc !== 'object' || proc === null) return false;
  const tipo = (proc as Record<string, unknown>).tipo;
  return typeof tipo === 'string' && TIPOS.includes(tipo);
}
