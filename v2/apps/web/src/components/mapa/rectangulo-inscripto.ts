/**
 * El rectángulo adentro del cual se siembran los puntos de una provincia —
 * **contenido** en la provincia, y en un solo lugar del árbol.
 *
 * ## Qué problema resuelve
 *
 * El motor cosecha `(territorioId, período, clase) → voces` y declara que su
 * precisión es la provincia: sabe CUÁNTAS voces hay y no sabe DÓNDE cae cada
 * una. Para dibujarlas hace falta una superficie por provincia, y esa superficie
 * tiene que cumplir una sola cosa para que la pantalla pueda decir «la posición
 * adentro de la provincia es dibujo»: **todo punto del rectángulo tiene que caer
 * adentro del polígono de esa provincia**. Si no, el punto no es dibujo — es una
 * afirmación falsa sobre otro territorio, o sobre otro país.
 *
 * ## Por qué está acá y no dos veces
 *
 * Hubo dos implementaciones, una por superficie, y sólo una cumplía. La otra
 * tomaba la caja de la provincia, la encogía por `√(área polígono ÷ área caja)`
 * y la centraba en el centroide. **Igualar áreas no garantiza contención**:
 * medido sobre las 24 provincias, el 21,6 % de la superficie sembrada caía
 * afuera de su provincia (Formosa 41,7 %, con un quinto en Paraguay; Misiones
 * 35,7 %; Tierra del Fuego 31,1 % en el mar o en Chile). Y la pantalla, mientras
 * tanto, declaraba que el punto estaba adentro. Un rectángulo que promete
 * contención y no la da es peor que no tener ninguno, así que ese cálculo se
 * borró y quedó éste, que es el que se puede medir.
 *
 * ## Cómo se calcula
 *
 * Rasterización + «mayor rectángulo de unos» con histograma y pila: se marca qué
 * celdas de una grilla `resolución × resolución` caen adentro del polígono y se
 * busca el rectángulo de área máxima entre ellas. `O(resolución²)` por
 * provincia, milisegundos para las veinticuatro, una sola vez por carga.
 *
 * Una celda cuenta como «adentro» sólo si su centro cae adentro **y ningún
 * lado del polígono la toca**. Mirar sólo el centro alcanzaba con la geometría
 * de 29 vértices por provincia; con la del IGN (D-011) un borde que sigue un
 * río entra y sale de una celda entre dos centros, y el rectángulo se escapaba
 * a Paraguay por siete puntos de cada 8.100 en Corrientes. Una celda que no
 * cruza ningún lado está entera de un lado del borde, así que con el centro
 * adentro está entera adentro: la contención deja de depender de la suerte.
 *
 * Los bordes van por el CENTRO de las celdas extremas, no por su borde
 * exterior: así el rectángulo queda contenido en la unión de las celdas que
 * dieron «adentro», que es lo único que la rasterización verifica.
 *
 * ## Cuando no hay rectángulo
 *
 * Una provincia tan angosta que ninguna celda de la grilla caiga adentro
 * devuelve `null`, no un rectángulo de área cero ni uno «aproximado». Quien
 * llama cuenta esas voces aparte y lo dice en pantalla: no dibujar nada es
 * preferible a dibujar en el país vecino. Con el archivo de hoy
 * (`public/geo/provincias.geojson`) ninguna de las 24 cae en ese caso.
 *
 * Módulo puro: sin React, sin mapa y sin red, para que la contención se pueda
 * medir con un test en vez de con una captura de pantalla.
 * `__tests__/rectangulo-inscripto.test.ts` la mide sobre las 24 provincias
 * reales.
 */

/** Un anillo —exterior o hueco—, en grados: `[lng, lat]`. */
export type Anillo = readonly (readonly [number, number])[];

export interface RectanguloGeo {
  /** El centro, en grados. `CeldaDeSenales` lo espera así. */
  readonly lng: number;
  readonly lat: number;
  readonly anchoGrados: number;
  readonly altoGrados: number;
}

/**
 * El paso de la grilla.
 *
 * Cuarenta y cuatro deja el error de borde bajo el 1,2 % del ancho de la caja y
 * da 0,0 % de fuga en las veinticuatro provincias; subirlo a 120 no mejora la
 * contención —ya es exacta— y sólo agranda un poco el rectángulo.
 */
export const RESOLUCION_INSCRIPTA = 44;

/* ── Geometría ───────────────────────────────────────────────────────────── */

interface Caja {
  readonly minLng: number;
  readonly maxLng: number;
  readonly minLat: number;
  readonly maxLat: number;
}

function cajaDe(anillos: readonly Anillo[]): Caja | null {
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const anillo of anillos) {
    for (const [lng, lat] of anillo) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  if (!(maxLng > minLng) || !(maxLat > minLat)) return null;
  return { minLng, maxLng, minLat, maxLat };
}

/** Cruce de rayo: `true` cuando el punto cae adentro del anillo. */
function enElAnillo(anillo: Anillo, lng: number, lat: number): boolean {
  let adentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const a = anillo[i];
    const b = anillo[j];
    if (a === undefined || b === undefined) continue;
    const [ax, ay] = a;
    const [bx, by] = b;
    if (ay > lat !== by > lat && lng < ((bx - ax) * (lat - ay)) / (by - ay) + ax) {
      adentro = !adentro;
    }
  }
  return adentro;
}

/**
 * `true` cuando el punto cae adentro de la figura, por paridad sobre TODOS sus
 * anillos: adentro de un número impar de ellos. Con anillos que no se cruzan
 * —lo que garantiza un GeoJSON válido— eso es «adentro de algún exterior y
 * fuera de sus huecos»: las islas se suman y los huecos se restan sin tener que
 * saber cuál es cuál. Los huecos existen desde la geometría del IGN: islas del
 * Uruguay y del Paraná que son de otro país, enclavadas en Entre Ríos y
 * Corrientes.
 */
export function enLaFigura(anillos: readonly Anillo[], lng: number, lat: number): boolean {
  let adentro = false;
  for (const anillo of anillos) if (enElAnillo(anillo, lng, lat)) adentro = !adentro;
  return adentro;
}

/**
 * Dónde corta la horizontal `lat` a los lados de la figura, ordenado de oeste a
 * este. Con la geometría del IGN (~30.000 vértices) probar cada celda contra
 * cada lado eran 58 millones de cuentas por carga; por fila son 44 veces menos.
 * Usa la misma regla de cruce que `enElAnillo`, así que da lo mismo que ella.
 */
function cortesDeFila(anillos: readonly Anillo[], lat: number): number[] {
  const cortes: number[] = [];
  for (const anillo of anillos) {
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const a = anillo[i];
      const b = anillo[j];
      if (a === undefined || b === undefined) continue;
      const [ax, ay] = a;
      const [bx, by] = b;
      if (ay > lat !== by > lat) cortes.push(((bx - ax) * (lat - ay)) / (by - ay) + ax);
    }
  }
  return cortes.sort((x, y) => x - y);
}

/**
 * ¿El segmento entra al INTERIOR de la caja? Liang–Barsky sobre la caja
 * achicada un pelo: un lado que corre justo sobre el borde de una celda —el de
 * un cuadrado alineado con la grilla— no la parte, y no tiene por qué sacarla.
 */
function cruzaLaCaja(
  a: readonly [number, number],
  b: readonly [number, number],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const limites: readonly (readonly [number, number])[] = [
    [-dx, a[0] - x0],
    [dx, x1 - a[0]],
    [-dy, a[1] - y0],
    [dy, y1 - a[1]],
  ];
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of limites) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t0 <= t1;
}

/**
 * Marca las celdas cuyo interior atraviesa algún lado de algún anillo. Sólo se
 * prueban las celdas de la caja de cada lado, así que un lado corto —los del IGN
 * miden cientos de metros— cuesta una o dos celdas.
 */
function celdasTocadas(
  anillos: readonly Anillo[],
  caja: Caja,
  resolucion: number,
  pasoX: number,
  pasoY: number,
): Uint8Array {
  const tocadas = new Uint8Array(resolucion * resolucion);
  const acotar = (v: number): number => Math.min(resolucion - 1, Math.max(0, v));
  const margenX = pasoX * 1e-9;
  const margenY = pasoY * 1e-9;
  for (const anillo of anillos) {
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const a = anillo[i];
      const b = anillo[j];
      if (a === undefined || b === undefined) continue;
      const c0 = acotar(Math.floor((Math.min(a[0], b[0]) - caja.minLng) / pasoX));
      const c1 = acotar(Math.floor((Math.max(a[0], b[0]) - caja.minLng) / pasoX));
      const f0 = acotar(Math.floor((Math.min(a[1], b[1]) - caja.minLat) / pasoY));
      const f1 = acotar(Math.floor((Math.max(a[1], b[1]) - caja.minLat) / pasoY));
      for (let fila = f0; fila <= f1; fila++) {
        const y0 = caja.minLat + fila * pasoY + margenY;
        const y1 = caja.minLat + (fila + 1) * pasoY - margenY;
        for (let columna = c0; columna <= c1; columna++) {
          const indice = fila * resolucion + columna;
          if (tocadas[indice] === 1) continue;
          const x0 = caja.minLng + columna * pasoX + margenX;
          const x1 = caja.minLng + (columna + 1) * pasoX - margenX;
          if (cruzaLaCaja(a, b, x0, y0, x1, y1)) tocadas[indice] = 1;
        }
      }
    }
  }
  return tocadas;
}

/**
 * El rectángulo de área máxima **contenido** en la figura, o `null` si no hay
 * ninguno con área.
 *
 * Es un subconjunto del polígono: «en algún lugar de este rectángulo» implica
 * «en algún lugar de esta provincia», que es toda la verdad disponible. Y se ve
 * como lo que es —un rectángulo, no el contorno—, lo que refuerza en el dibujo
 * mismo que la posición es dibujo.
 */
export function rectanguloInscripto(
  anillos: readonly Anillo[],
  resolucion: number = RESOLUCION_INSCRIPTA,
): RectanguloGeo | null {
  const caja = cajaDe(anillos);
  if (caja === null || resolucion < 1) return null;

  const pasoX = (caja.maxLng - caja.minLng) / resolucion;
  const pasoY = (caja.maxLat - caja.minLat) / resolucion;

  const tocadas = celdasTocadas(anillos, caja, resolucion, pasoX, pasoY);
  const adentro: boolean[] = [];
  for (let fila = 0; fila < resolucion; fila++) {
    const lat = caja.minLat + (fila + 0.5) * pasoY;
    const cortes = cortesDeFila(anillos, lat);
    let siguiente = 0;
    for (let columna = 0; columna < resolucion; columna++) {
      const lng = caja.minLng + (columna + 0.5) * pasoX;
      while (siguiente < cortes.length && (cortes[siguiente] ?? Infinity) <= lng) siguiente++;
      // Adentro si quedan a la derecha una cantidad impar de cortes: el mismo
      // cruce de rayo que `enLaFigura`, hecho una vez por fila y no por celda.
      const paridad = (cortes.length - siguiente) % 2 === 1;
      adentro.push(tocadas[fila * resolucion + columna] === 0 && paridad);
    }
  }

  const alturas: number[] = new Array<number>(resolucion).fill(0);
  let mejorArea = 0;
  let f0 = 0;
  let f1 = -1;
  let c0 = 0;
  let c1 = -1;

  for (let fila = 0; fila < resolucion; fila++) {
    for (let columna = 0; columna < resolucion; columna++) {
      alturas[columna] =
        adentro[fila * resolucion + columna] === true ? (alturas[columna] ?? 0) + 1 : 0;
    }

    const pila: number[] = [];
    for (let columna = 0; columna <= resolucion; columna++) {
      const altura = columna === resolucion ? 0 : (alturas[columna] ?? 0);
      for (;;) {
        const tope = pila[pila.length - 1];
        if (tope === undefined) break;
        const alto = alturas[tope] ?? 0;
        if (alto < altura) break;
        pila.pop();
        const anterior = pila[pila.length - 1];
        const izquierda = anterior === undefined ? 0 : anterior + 1;
        /*
          Se maximiza el área DIBUJADA, no la cantidad de celdas: como los bordes
          van por el centro de las celdas extremas, un bloque de `n × m` celdas
          dibuja `(n−1) × (m−1)`. Con la cuenta ingenua, un bloque de una sola
          columna y muchas filas podía ganarle a uno de dos por dos y devolver un
          rectángulo de ancho cero. Así, un bloque que no dibuja nada vale cero y
          nunca gana.
        */
        const area = (alto - 1) * (columna - izquierda - 1);
        if (area > mejorArea) {
          mejorArea = area;
          f0 = fila - alto + 1;
          f1 = fila;
          c0 = izquierda;
          c1 = columna - 1;
        }
      }
      pila.push(columna);
    }
  }

  /*
    Sin celdas adentro no hay rectángulo. Y con una sola fila o una sola columna
    tampoco: como los bordes van por el centro de las celdas extremas, un bloque
    de una celda de ancho da un rectángulo de ancho CERO, que dibujaría todas las
    voces de la provincia sobre una línea de un píxel. Devolver `null` es la
    respuesta honesta —quien llama cuenta esas voces aparte y lo dice—, y es el
    caso de una figura tan angosta y tan torcida respecto de su caja que la
    grilla no le encuentra un cuerpo adentro.
  */
  if (mejorArea === 0 || c1 <= c0 || f1 <= f0) return null;

  const oeste = caja.minLng + (c0 + 0.5) * pasoX;
  const este = caja.minLng + (c1 + 0.5) * pasoX;
  const sur = caja.minLat + (f0 + 0.5) * pasoY;
  const norte = caja.minLat + (f1 + 0.5) * pasoY;
  return {
    lng: (oeste + este) / 2,
    lat: (sur + norte) / 2,
    anchoGrados: este - oeste,
    altoGrados: norte - sur,
  };
}

/* ── La conversión: del GeoJSON crudo a la forma que entra acá ───────────── */

const esLista = (v: unknown): v is readonly unknown[] => Array.isArray(v);

function puntoDe(crudo: unknown): readonly [number, number] | null {
  if (!esLista(crudo) || crudo.length < 2) return null;
  const [lng, lat] = crudo;
  if (typeof lng !== 'number' || !Number.isFinite(lng)) return null;
  if (typeof lat !== 'number' || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

/**
 * Un anillo, si lo que llegó es uno.
 *
 * Estricto a propósito: si un punto no se puede leer, el anillo entero no se
 * puede leer. Saltear el punto malo y seguir devolvería un polígono con una
 * cuerda donde había una costa —una figura distinta de la provincia—, y el
 * rectángulo que salga de esa figura ya no promete nada. Menos de tres puntos no
 * encierra área.
 */
function anilloDe(crudo: unknown): Anillo | null {
  if (!esLista(crudo)) return null;
  const puntos: (readonly [number, number])[] = [];
  for (const par of crudo) {
    const punto = puntoDe(par);
    if (punto === null) return null;
    puntos.push(punto);
  }
  return puntos.length >= 3 ? puntos : null;
}

/**
 * Los anillos de un polígono, exterior y huecos, o ninguno.
 *
 * Todo o nada, por la misma razón que `anilloDe`: descartar un hueco ilegible y
 * quedarse con el exterior agrandaría la figura que se considera «adentro» —el
 * territorio ajeno enclavado pasaría a ser propio—. Perder el polígono entero
 * sólo puede achicarla, que es la dirección segura.
 */
function anillosDePoligono(crudo: unknown): Anillo[] {
  if (!esLista(crudo) || crudo.length === 0) return [];
  const anillos: Anillo[] = [];
  for (const parte of crudo) {
    const anillo = anilloDe(parte);
    if (anillo === null) return [];
    anillos.push(anillo);
  }
  return anillos;
}

/**
 * Todos los anillos de una geometría GeoJSON —exteriores y huecos— en una sola
 * lista: el adaptador entre lo que sirve la web y lo que come
 * `rectanguloInscripto`. No hace falta distinguirlos porque `enLaFigura` cuenta
 * por paridad, y el dibujo de La Simulación tampoco: el GeoJSON trae los huecos
 * con el giro opuesto al exterior (RFC 7946), así que la regla `nonzero` del SVG
 * los deja vacíos.
 *
 * Los huecos llegaron con la geometría del IGN (D-011); hasta entonces se
 * ignoraban porque el archivo no traía ninguno, y un hueco sin restar agranda
 * la figura. Soporta `MultiPolygon`: Tierra del Fuego, Buenos Aires y
 * Corrientes tienen islas.
 */
export function anillosDeGeometria(geometria: unknown): Anillo[] {
  if (typeof geometria !== 'object' || geometria === null) return [];
  const g = geometria as { type?: unknown; coordinates?: unknown };
  if (!esLista(g.coordinates)) return [];

  if (g.type === 'Polygon') return anillosDePoligono(g.coordinates);
  if (g.type !== 'MultiPolygon') return [];
  return g.coordinates.flatMap((poligono) => anillosDePoligono(poligono));
}
