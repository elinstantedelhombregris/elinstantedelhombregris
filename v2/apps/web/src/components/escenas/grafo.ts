/** Un grafo de vértices y aristas sacado de una malla de three, para recorrerlo. */
export interface Grafo {
  /** x, y, z de cada vértice, en coordenadas locales de la red. */
  vertices: Float32Array;
  /** Pares de índices de vértice. */
  aristas: Uint16Array;
  vecinos: number[][];
  indiceDeArista: Map<number, number>;
}

/**
 * Reduce una malla de triángulos sin indexar (como la de `IcosahedronGeometry`)
 * a un grafo: vértices únicos y aristas sin repetir.
 */
export function grafoDeTriangulos(posiciones: ArrayLike<number>): Grafo {
  const unicos: number[] = [];
  const indicePorClave = new Map<string, number>();
  const indiceDe = (k: number): number => {
    const x = posiciones[k * 3] ?? 0;
    const y = posiciones[k * 3 + 1] ?? 0;
    const z = posiciones[k * 3 + 2] ?? 0;
    const clave = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
    const existente = indicePorClave.get(clave);
    if (existente !== undefined) return existente;
    const nuevo = unicos.length / 3;
    unicos.push(x, y, z);
    indicePorClave.set(clave, nuevo);
    return nuevo;
  };
  const indiceDeArista = new Map<number, number>();
  const aristas: number[] = [];
  const triangulos = Math.floor(posiciones.length / 9);
  for (let t = 0; t < triangulos; t++) {
    const v = [indiceDe(t * 3), indiceDe(t * 3 + 1), indiceDe(t * 3 + 2)];
    for (const [a, b] of [
      [v[0], v[1]],
      [v[1], v[2]],
      [v[2], v[0]],
    ] as const) {
      if (a === undefined || b === undefined) continue;
      const clave = claveDeArista(a, b);
      if (indiceDeArista.has(clave)) continue;
      indiceDeArista.set(clave, aristas.length / 2);
      aristas.push(a, b);
    }
  }
  const cantidad = unicos.length / 3;
  const vecinos: number[][] = Array.from({ length: cantidad }, () => []);
  for (let e = 0; e < aristas.length; e += 2) {
    const a = aristas[e] ?? 0;
    const b = aristas[e + 1] ?? 0;
    vecinos[a]?.push(b);
    vecinos[b]?.push(a);
  }
  return {
    vertices: new Float32Array(unicos),
    aristas: new Uint16Array(aristas),
    vecinos,
    indiceDeArista,
  };
}

export function claveDeArista(a: number, b: number): number {
  return Math.min(a, b) * 4096 + Math.max(a, b);
}
