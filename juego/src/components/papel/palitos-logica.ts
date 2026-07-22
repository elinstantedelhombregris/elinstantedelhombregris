/**
 * Lógica pura de agrupado en cincos — el data-viz de conteo del juego
 * (spec §3.7, README v2 §10.6): cada grupo de cinco palitos son 4 trazos
 * verticales + 1 diagonal que los cruza; los grupos de 1 a 4 son solo
 * verticales sueltos, sin cruzar.
 *
 * `agruparPalitos(total, de?)` no dibuja nada — devuelve DOS listas de
 * tamaños de grupo (cada número entre 1 y 5) para que `Palitos.tsx` las
 * convierta en trazos SVG:
 *
 *   - `llenos`: los grupos que arma `total`, de a cinco, en orden.
 *   - `huecos`: cuando se pasa `de` (la meta a alcanzar), los grupos que
 *     faltan para llegar a `de`, retomando el ritmo de a cinco justo donde
 *     `llenos` cortó. Si el último grupo lleno quedó a medio completar, el
 *     primer grupo hueco lo termina antes de arrancar quintetos nuevos —
 *     así un solo quinteto nunca queda mitad lleno mitad hueco en dos
 *     entradas separadas de la MISMA lista, pero sí puede quedar repartido
 *     entre la última entrada de `llenos` y la primera de `huecos`.
 *
 * Ejemplo: `agruparPalitos(3, 10)` → `{ llenos: [3], huecos: [2, 5] }`.
 * El grupo de 3 llenos necesita 2 huecos más para cerrar su quinteto;
 * quedan 10 − 3 − 2 = 5, un quinteto hueco entero. 3 + 2 + 5 = 10 = de.
 *
 * Sin `de`, no hay meta que mostrar: `huecos` queda vacío. Si `de` ya está
 * alcanzado o superado por `total`, también queda vacío (nada falta).
 */

export type GrupoPalitos = {
  llenos: number[];
  huecos: number[];
};

const TAMANO_GRUPO = 5;

/** Entero no negativo: negativos y NaN caen a 0, se trunca lo fraccionario. */
function entero(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

/** Parte `cantidad` en grupos de a cinco, el último parcial si no cierra. */
function enGruposDeCinco(cantidad: number): number[] {
  const grupos: number[] = [];
  let restante = cantidad;
  while (restante > 0) {
    const grupo = Math.min(TAMANO_GRUPO, restante);
    grupos.push(grupo);
    restante -= grupo;
  }
  return grupos;
}

export function agruparPalitos(total: number, de?: number): GrupoPalitos {
  const t = entero(total);
  const llenos = enGruposDeCinco(t);

  if (de === undefined) return { llenos, huecos: [] };

  const faltan = Math.max(0, entero(de) - t);
  if (faltan === 0) return { llenos, huecos: [] };

  const huecos: number[] = [];
  let restante = faltan;

  // Si `total` dejó un quinteto a medio hacer, el primer hueco lo cierra
  // antes de arrancar quintetos nuevos.
  const restoUltimoGrupo = t % TAMANO_GRUPO;
  if (restoUltimoGrupo > 0) {
    const cierre = Math.min(TAMANO_GRUPO - restoUltimoGrupo, restante);
    huecos.push(cierre);
    restante -= cierre;
  }

  huecos.push(...enGruposDeCinco(restante));

  return { llenos, huecos };
}
