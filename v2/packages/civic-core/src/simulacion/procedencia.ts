/**
 * La primitiva de honestidad de la Simulación — spec §3.1.
 *
 * Solo existen tres procedencias y ninguna cuarta. Todo lo que el motor
 * devuelve y la UI puede mostrar es una `Magnitud`: un número pelado que
 * llegue a pantalla es un bug, no un descuido de presentación, y hay una
 * guarda que lo caza (`guardas-simulacion.test.ts`).
 */
export type Procedencia =
  | { tipo: 'medido'; fuente: string }
  | { tipo: 'declarado'; palanca: string }
  | { tipo: 'derivado'; formula: string; de: readonly string[] };

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

const TIPOS: readonly string[] = ['medido', 'declarado', 'derivado'];

/** Type guard usado por la guarda «sin números huérfanos». */
export function esMagnitud(valor: unknown): valor is Magnitud {
  if (typeof valor !== 'object' || valor === null) return false;
  const candidato = valor as Record<string, unknown>;
  if (typeof candidato['valor'] !== 'number' || typeof candidato['unidad'] !== 'string') {
    return false;
  }
  const proc = candidato['procedencia'];
  if (typeof proc !== 'object' || proc === null) return false;
  return TIPOS.includes((proc as Record<string, unknown>)['tipo'] as string);
}
