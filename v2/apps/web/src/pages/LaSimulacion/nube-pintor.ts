/**
 * La nube — la geometría, sin React y sin SVG.
 *
 * Existe separada del componente por la misma razón que
 * `LaRadiografia/constelacion-pintor.ts`: lo que hay que poder verificar es
 * **dónde caen los puntos y si hay un salto**, no qué etiquetas emite React.
 * Una función de números a números se testea con números.
 *
 * ## Por qué la nube va siempre al lado del tornado
 *
 * La respuesta del motor es un **escalón**, no una rampa: medido con 24
 * territorios, participación 50, 100, 200, 300, 366 y 367 dan todas el mismo
 * resultado, y el borde está en 438,15. Un tornado promedia esa forma adentro
 * de una barra y la esconde; la nube la muestra. Por eso el tornado nunca va
 * solo, y por eso acá se **mide** el salto en vez de suponer que no lo hay.
 */

export interface PuntoCrudo {
  readonly entrada: number;
  readonly salida: number;
}

export interface PuntoDibujado extends PuntoCrudo {
  readonly x: number;
  readonly y: number;
}

export interface MarcaDeEje {
  readonly valor: number;
  /** Coordenada ya escalada al lienzo. */
  readonly posicion: number;
}

/**
 * El salto, cuando lo hay.
 *
 * `fraccion` es cuánto del recorrido total se hace en un solo tramo entre dos
 * puntos vecinos. Con la mitad o más del recorrido en un tramo, lo que hay no
 * es una pendiente: es un umbral, y llamarlo sensibilidad sería mentir sobre su
 * forma.
 */
export interface Salto {
  readonly desde: number;
  readonly hasta: number;
  readonly deValor: number;
  readonly aValor: number;
  readonly fraccion: number;
}

export interface Nube {
  readonly puntos: readonly PuntoDibujado[];
  readonly marcasX: readonly MarcaDeEje[];
  readonly marcasY: readonly MarcaDeEje[];
  readonly salto: Salto | null;
  /** `true` cuando la salida no se movió nunca: no hay curva que dibujar. */
  readonly plana: boolean;
  readonly ancho: number;
  readonly alto: number;
  readonly margen: { readonly izq: number; readonly der: number; readonly arr: number; readonly abj: number };
}

export const FRACCION_DE_SALTO = 0.5;

const MARGEN = { izq: 52, der: 12, arr: 12, abj: 30 };

/**
 * Escala un valor a un lienzo, tolerando el caso degenerado.
 *
 * Cuando el dominio es un punto —todas las entradas iguales, o una salida que
 * no se movió— se devuelve el centro en vez de dividir por cero. Un `NaN` en un
 * atributo de SVG no dibuja nada y no avisa.
 */
function escalar(valor: number, minimo: number, maximo: number, desde: number, hasta: number): number {
  if (maximo - minimo <= 0) return (desde + hasta) / 2;
  return desde + ((valor - minimo) / (maximo - minimo)) * (hasta - desde);
}

function marcas(minimo: number, maximo: number, cuantas: number): number[] {
  if (maximo - minimo <= 0) return [minimo];
  const salida: number[] = [];
  for (let i = 0; i < cuantas; i++) salida.push(minimo + ((maximo - minimo) * i) / (cuantas - 1));
  return salida;
}

/** El tramo vecino donde más se mueve la salida, en fracción del recorrido total. */
export function medirSalto(puntos: readonly PuntoCrudo[]): Salto | null {
  if (puntos.length < 2) return null;

  let recorrido = 0;
  let mayor = 0;
  let indice = -1;
  for (let i = 1; i < puntos.length; i++) {
    const previo = puntos[i - 1];
    const actual = puntos[i];
    if (previo === undefined || actual === undefined) continue;
    const paso = Math.abs(actual.salida - previo.salida);
    recorrido += paso;
    if (paso > mayor) {
      mayor = paso;
      indice = i;
    }
  }

  if (recorrido <= 0 || indice < 1) return null;
  const previo = puntos[indice - 1];
  const actual = puntos[indice];
  if (previo === undefined || actual === undefined) return null;

  const fraccion = mayor / recorrido;
  if (fraccion < FRACCION_DE_SALTO) return null;
  return {
    desde: previo.entrada,
    hasta: actual.entrada,
    deValor: previo.salida,
    aValor: actual.salida,
    fraccion,
  };
}

export function pintarNube(
  crudos: readonly PuntoCrudo[],
  ancho = 420,
  alto = 200,
): Nube {
  const base = {
    marcasX: [] as MarcaDeEje[],
    marcasY: [] as MarcaDeEje[],
    salto: null,
    ancho,
    alto,
    margen: MARGEN,
  };
  if (crudos.length === 0) return { ...base, puntos: [], plana: true };

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const p of crudos) {
    if (p.entrada < minX) minX = p.entrada;
    if (p.entrada > maxX) maxX = p.entrada;
    if (p.salida < minY) minY = p.salida;
    if (p.salida > maxY) maxY = p.salida;
  }

  const plana = maxY - minY <= 0;
  /**
   * Con una salida que no se movió, el eje vertical se abre a [0, valor × 2]
   * en vez de quedar en un punto. Una línea recta pegada al borde superior se
   * lee como «llegó al máximo»; centrada se lee como lo que es: no se movió.
   */
  const pisoY = plana ? Math.min(0, minY) : minY;
  const techoY = plana ? Math.max(minY * 2, minY + 1) : maxY;

  const x0 = MARGEN.izq;
  const x1 = ancho - MARGEN.der;
  const y0 = alto - MARGEN.abj;
  const y1 = MARGEN.arr;

  const puntos: PuntoDibujado[] = crudos.map((p) => ({
    ...p,
    x: escalar(p.entrada, minX, maxX, x0, x1),
    y: escalar(p.salida, pisoY, techoY, y0, y1),
  }));

  return {
    puntos,
    marcasX: marcas(minX, maxX, 3).map((valor) => ({
      valor,
      posicion: escalar(valor, minX, maxX, x0, x1),
    })),
    marcasY: marcas(pisoY, techoY, 3).map((valor) => ({
      valor,
      posicion: escalar(valor, pisoY, techoY, y0, y1),
    })),
    salto: medirSalto(crudos),
    plana,
    ancho,
    alto,
    margen: MARGEN,
  };
}
