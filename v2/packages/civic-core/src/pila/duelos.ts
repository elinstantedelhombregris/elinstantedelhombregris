/**
 * ¿Cuál va primero? (spec 2026-10-19-mi-argentina-ideal-la-pila.md §4).
 *
 * Después de la cuarta y de la octava respuesta de una tanda, si quien mira dijo
 * «Yo también» a dos aportes que todavía no comparó, se los muestra juntos. Se
 * compara el acuerdo más reciente con el más antiguo que todavía no estuvo en un
 * duelo: así cada uno entra una vez antes de repetir.
 */
export const LUGARES_DE_DUELO = [4, 8] as const;
export const MAXIMO_DE_DUELOS = 2;

/** La clave de un par, igual sin importar el orden. */
export function clavePar(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function proximoDuelo(
  acuerdos: readonly string[],
  yaComparados: ReadonlySet<string>,
  usadosEnDuelo: ReadonlySet<string>,
): readonly [string, string] | null {
  if (acuerdos.length < 2) return null;
  const reciente = acuerdos[acuerdos.length - 1];
  if (reciente === undefined) return null;
  const viejo = acuerdos.find(
    (id) => id !== reciente && !usadosEnDuelo.has(id) && !yaComparados.has(clavePar(id, reciente)),
  );
  return viejo === undefined ? null : [viejo, reciente];
}

export function tocaDuelo(respondidasEnTanda: number, duelosEnTanda: number): boolean {
  return (
    duelosEnTanda < MAXIMO_DE_DUELOS &&
    (LUGARES_DE_DUELO as readonly number[]).includes(respondidasEnTanda)
  );
}
