import { CLASES_SENAL, claseDe, sembrarCelda, semillaDeCelda } from '@v2/civic-core';

import type { ClaseSenal, TipoSenal } from '@v2/civic-core';

/**
 * Las reglas visuales del pintor de señales — puras, sin React y sin canvas.
 *
 * Vive separado de `PintorDeSenales.tsx` por lo mismo que
 * `constelacion-pintor.ts` vive separado de `Constelacion.tsx`: un archivo de
 * componentes no puede exportar funciones sueltas sin romper la regla de
 * fast-refresh, y —lo que de verdad pesa— **un canvas no se puede leer en un
 * test**. Acá adentro todo recibe su pincel por parámetro, así que se le puede
 * pasar uno falso y verificar exactamente lo que el lector va a ver.
 *
 * Tres reglas, y ninguna es una preferencia:
 *
 * 1. **El color codifica la CLASE, no el tipo.** Son cuatro y no nueve porque
 *    nueve colores distinguibles en AA a seis píxeles no existen. Las clases
 *    salen de `@v2/civic-core` —`CLASES_SENAL`, `claseDe`— y no de una lista
 *    escrita a mano: una clase nueva rompe la compilación en vez de dibujarse
 *    de un color que nadie eligió.
 *
 * 2. **Los filtros destiñen, no ocultan.** Lo que queda fuera de foco se pinta
 *    en gris y sigue estando. No hay ninguna prop, ni ninguna rama, que permita
 *    saltear una marca: `pintarSenales` devuelve cuántas pintó y ese número es
 *    siempre `marcas.length`. Un país filtrado que parece vacío es un país que
 *    miente.
 *
 * 3. **La profundidad se resuelve con tinta, no con opacidad.** Un punto que se
 *    va al fondo se mezcla hacia el fondo del tema activo —papel en claro,
 *    `oscuro.barra` en nocturno—, así que el mismo trazo funciona arriba de un
 *    mapa y arriba de una hoja.
 *
 * **El pintor no sabe de proyecciones.** Recibe puntos ya convertidos a
 * píxeles: quien lo usa le pasa la función que convierte lng/lat a píxel, que
 * arriba de maplibre es `map.project` y en una vista sin mapa es una
 * equirectangular propia. Ésa es toda la diferencia entre los dos casos.
 */

/* ── El tema ─────────────────────────────────────────────────────────────── */

export type TemaDelMapa = 'papel' | 'nocturno';

export const TEMAS_DEL_MAPA: readonly TemaDelMapa[] = ['papel', 'nocturno'];

/**
 * Los dos fondos, en los tokens de `tailwind.config.ts`. Ni un hex inventado.
 *
 * El pintor **no los pinta**: los usa para mezclar. El lienzo se limpia y queda
 * transparente, porque arriba de maplibre un fondo opaco taparía el mapa. Lo
 * garantiza el tipo `PincelDeMapa`, que no incluye `fillRect`.
 */
export const FONDO_DEL_TEMA: Readonly<Record<TemaDelMapa, string>> = {
  papel: '#F2EFE7',
  nocturno: '#241F17',
};

/** La tinta de cada tema. Es hacia acá que se aclara un color que no contrasta. */
export const TINTA_DEL_TEMA: Readonly<Record<TemaDelMapa, string>> = {
  papel: '#16130E',
  nocturno: '#F2EFE7',
};

/**
 * El gris de lo que quedó fuera de foco: `tinta-50` sobre papel, `oscuro.meta`
 * sobre nocturno.
 *
 * Los dos cruzan 3:1 contra su fondo, y hay un test que lo mide. Ése es el
 * contenido de la regla 2: desteñido no es tenue hasta desaparecer — es gris y
 * perfectamente legible, sólo que sin color que lo reclame.
 */
export const GRIS_DEL_TEMA: Readonly<Record<TemaDelMapa, string>> = {
  papel: '#7A756A',
  nocturno: '#8E8A82',
};

/* ── El color, por clase ─────────────────────────────────────────────────── */

/**
 * Los cuatro colores de clase, en los tokens de `tailwind.config.ts`.
 *
 * El `Record<ClaseSenal, string>` es lo que hace exhaustiva la tabla: agregar
 * una quinta clase al canon rompe la compilación acá en vez de pintarla de
 * cualquier cosa.
 */
export const COLOR_DE_CLASE: Readonly<Record<ClaseSenal, string>> = {
  hecho: '#A16C00', // ámbar
  deseo: '#5227CC', // violeta
  acto: '#1A7A4A', // verde
  meta: '#0F6B8A', // cian
};

/** WCAG 2.1 AA para objetos gráficos. Un punto de seis píxeles es uno. */
export const CONTRASTE_MINIMO = 3;

export function aRgb(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '');
  return [
    parseInt(limpio.slice(0, 2), 16),
    parseInt(limpio.slice(2, 4), 16),
    parseInt(limpio.slice(4, 6), 16),
  ];
}

const enDosDigitos = (v: number): string =>
  Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

/** Mezcla `a` con `b`. `k = 0` devuelve `a`; `k = 1` devuelve `b`. */
export function mezclar(a: string, b: string, k: number): string {
  const [ar, ag, ab] = aRgb(a);
  const [br, bg, bb] = aRgb(b);
  const t = Math.max(0, Math.min(1, k));
  const canal = (x: number, y: number): string => enDosDigitos(x + (y - x) * t);
  return `#${canal(ar, br)}${canal(ag, bg)}${canal(ab, bb)}`;
}

/**
 * Mezcla `color` con el fondo del tema. `peso = 1` es color pleno, `0` es fondo.
 *
 * Es **el** gesto de la superficie, y es el mismo que usa la constelación de La
 * Radiografía: la profundidad no se resuelve con `globalAlpha` ni con niebla,
 * se resuelve con tinta que se acaba hacia el papel en claro y hacia
 * `oscuro.barra` en nocturno. Con opacidad, dos marcas superpuestas se suman y
 * el montón se lee más oscuro de lo que es.
 */
export const haciaElFondo = (color: string, fondo: string, peso: number): string =>
  mezclar(fondo, color, peso);

const canalLineal = (v: number): number => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex);
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const PASOS_DE_AJUSTE = 50;

/**
 * `color` corrido hacia `hacia` lo mínimo necesario para cruzar `minimo` contra
 * `fondo`.
 *
 * Una regla en vez de una segunda paleta escrita a mano. Sobre papel los cuatro
 * tokens ya cruzan 3:1 y salen intactos; sobre nocturno el violeta y el cian se
 * hunden en el fondo —el violeta pleno da 2,5:1— y hay que aclararlos. Que sea
 * una función y no una tabla significa que el día que cambie un token, o el
 * fondo del tema, la corrección se recalcula sola.
 */
export function ajustarAlFondo(
  color: string,
  fondo: string,
  hacia: string,
  minimo: number,
): string {
  for (let paso = 0; paso <= PASOS_DE_AJUSTE; paso++) {
    const candidato = mezclar(color, hacia, paso / PASOS_DE_AJUSTE);
    if (contraste(candidato, fondo) >= minimo) return candidato;
  }
  return hacia;
}

const PALETA = new Map<string, string>();
for (const tema of TEMAS_DEL_MAPA) {
  for (const clase of CLASES_SENAL) {
    PALETA.set(
      `${tema}|${clase}`,
      ajustarAlFondo(
        COLOR_DE_CLASE[clase],
        FONDO_DEL_TEMA[tema],
        TINTA_DEL_TEMA[tema],
        CONTRASTE_MINIMO,
      ),
    );
  }
}

export function colorDeClase(clase: ClaseSenal, tema: TemaDelMapa): string {
  return PALETA.get(`${tema}|${clase}`) ?? COLOR_DE_CLASE[clase];
}

/**
 * El color de un tipo de señal, que es el de su clase y nunca uno propio.
 *
 * `claseDe` es la única traducción tipo → color que existe: si mañana alguien
 * quiere «el color de `sueño`», lo que obtiene es el color de `deseo`, y eso es
 * deliberado.
 */
export const colorDeSenal = (tipo: TipoSenal, tema: TemaDelMapa): string =>
  colorDeClase(claseDe(tipo), tema);

/* ── El foco: destiñe, no oculta ─────────────────────────────────────────── */

/** `null` es todo en foco. Un conjunto vacío destiñe todo, y sigue dibujando todo. */
export type FocoDeClases = ReadonlySet<ClaseSenal> | null;

export const enFoco = (foco: FocoDeClases, clase: ClaseSenal): boolean =>
  foco === null || foco.has(clase);

/**
 * El piso del escalonado por profundidad, para lo que SÍ está en foco.
 *
 * La marca más hundida conserva el 72% de su tinta. El escalonado existe para
 * que quinientas marcas superpuestas no se fundan en un disco opaco; si bajara
 * mucho más, empezaría a decir que las últimas voces valen menos, que es una
 * afirmación que nadie hizo.
 */
export const PESO_MINIMO_EN_FOCO = 0.72;

/** El radio por defecto de una marca, en píxeles CSS. Seis píxeles de diámetro. */
export const RADIO_DE_MARCA = 3;

export interface MarcaDeSenal {
  /** Píxeles CSS, ya proyectados. El pintor no sabe de grados. */
  readonly x: number;
  readonly y: number;
  readonly clase: ClaseSenal;
  /** 1 al frente, 0 al fondo. Presentación pura: no sale de ningún dato. */
  readonly profundidad: number;
}

/**
 * La tinta de una marca.
 *
 * Lo que queda fuera de foco sale en el gris del tema **sin escalonar por
 * profundidad**: se desvanecería dos veces, y eso es la puerta trasera a
 * ocultarlo. El gris es constante, cruza 3:1 y hay un test que lo mide.
 */
export function tintaDeMarca(marca: MarcaDeSenal, foco: FocoDeClases, tema: TemaDelMapa): string {
  if (!enFoco(foco, marca.clase)) return GRIS_DEL_TEMA[tema];
  const hundimiento = Math.max(0, Math.min(1, marca.profundidad));
  const peso = PESO_MINIMO_EN_FOCO + (1 - PESO_MINIMO_EN_FOCO) * hundimiento;
  return haciaElFondo(colorDeClase(marca.clase, tema), FONDO_DEL_TEMA[tema], peso);
}

/* ── El trazo ────────────────────────────────────────────────────────────── */

export interface CajaDeLienzo {
  readonly ancho: number;
  readonly alto: number;
  readonly dpr: number;
}

export interface EscenaDeSenales {
  readonly marcas: readonly MarcaDeSenal[];
  readonly foco: FocoDeClases;
  readonly tema: TemaDelMapa;
  readonly radio: number;
}

/**
 * Lo mínimo del contexto 2D que este pintor toca.
 *
 * `fillRect` **no está**, y su ausencia es una decisión: sin él este pintor no
 * puede pintar un fondo opaco ni por accidente, y por eso el mismo módulo sirve
 * de calco arriba de maplibre y de dibujo entero en una vista sin mapa.
 */
export type PincelDeMapa = Pick<
  CanvasRenderingContext2D,
  'setTransform' | 'clearRect' | 'beginPath' | 'arc' | 'fill' | 'fillStyle'
>;

/**
 * Pinta la escena y devuelve cuántas marcas pintó — que es siempre
 * `escena.marcas.length`, con foco o sin foco.
 *
 * Lo desteñido va primero para quedar DEBAJO, no afuera.
 */
export function pintarSenales(
  ctx: PincelDeMapa,
  caja: CajaDeLienzo,
  escena: EscenaDeSenales,
): number {
  const { ancho, alto, dpr } = caja;
  if (ancho <= 0 || alto <= 0) return 0;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, ancho, alto);

  const radio = Math.max(1, escena.radio);
  let pintadas = 0;

  for (const capa of [false, true]) {
    for (const marca of escena.marcas) {
      if (enFoco(escena.foco, marca.clase) !== capa) continue;
      ctx.fillStyle = tintaDeMarca(marca, escena.foco, escena.tema);
      ctx.beginPath();
      ctx.arc(marca.x, marca.y, radio, 0, Math.PI * 2);
      ctx.fill();
      pintadas += 1;
    }
  }

  return pintadas;
}

/* ── De celdas agregadas a marcas ────────────────────────────────────────── */

/**
 * Una celda de la cosecha, lista para dibujar.
 *
 * `voces` es el dato. `lng`/`lat` y la extensión en grados son el rectángulo
 * adentro del cual se reparte el sembrado, y **no dicen dónde está nadie**: son
 * el «en algún lugar de acá adentro» del modelo dibujado con tinta.
 */
export interface CeldaDeSenales {
  readonly id: string;
  readonly nombre: string;
  readonly clase: ClaseSenal;
  readonly voces: number;
  readonly lng: number;
  readonly lat: number;
  readonly anchoGrados: number;
  readonly altoGrados: number;
}

/** `null` cuando el punto no cae en el lienzo. Nunca se inventa un píxel. */
export type ProyectarAPixel = (
  lng: number,
  lat: number,
) => { readonly x: number; readonly y: number } | null;

export interface CeldaSaturada {
  readonly id: string;
  readonly nombre: string;
  readonly voces: number;
  readonly noDibujados: number;
  readonly leyenda: string;
}

export interface Cosido {
  readonly marcas: readonly MarcaDeSenal[];
  /** Marcas que la proyección no pudo ubicar. Se cuentan, no se tragan. */
  readonly sinProyectar: number;
}

/**
 * Qué celdas pasaron el techo, y cuánto quedó afuera del dibujo.
 *
 * Separada de `marcasDeCeldas` porque responde una pregunta que **no depende de
 * la proyección**: una celda saturada lo está con el mapa quieto o en
 * movimiento, y el texto que lo declara no puede parpadear al arrastrar. Sale
 * de `sembrarCelda`, la misma función que decide cuántos puntos hay: no hay dos
 * aritméticas del techo que se puedan desincronizar.
 */
export function saturacionDeCeldas(celdas: readonly CeldaDeSenales[]): CeldaSaturada[] {
  const saturadas: CeldaSaturada[] = [];
  for (const celda of celdas) {
    // La semilla no cambia cuántos puntos entran, sólo dónde caen.
    const sembrada = sembrarCelda(celda.voces, 0);
    if (sembrada.leyenda === null) continue;
    saturadas.push({
      id: celda.id,
      nombre: celda.nombre,
      voces: sembrada.voces,
      noDibujados: sembrada.noDibujados,
      leyenda: sembrada.leyenda,
    });
  }
  return saturadas;
}

/**
 * Celdas agregadas → marcas en píxeles.
 *
 * El sembrado y el techo salen de `@v2/civic-core`: la geometría del reparto es
 * lógica pura y determinista, y no puede vivir en la web o el mismo escenario
 * dibujaría distinto en el servidor que en el navegador.
 */
export function marcasDeCeldas(
  celdas: readonly CeldaDeSenales[],
  semilla: number,
  proyectar: ProyectarAPixel,
): Cosido {
  const marcas: MarcaDeSenal[] = [];
  let sinProyectar = 0;

  for (const celda of celdas) {
    const sembrada = sembrarCelda(celda.voces, semillaDeCelda(semilla, celda.id));
    const cuantos = Math.max(1, sembrada.dibujados);
    for (const punto of sembrada.puntos) {
      const lng = celda.lng + (punto.x - 0.5) * celda.anchoGrados;
      const lat = celda.lat + (0.5 - punto.y) * celda.altoGrados;
      const pixel = proyectar(lng, lat);
      if (pixel === null) {
        sinProyectar += 1;
        continue;
      }
      marcas.push({
        x: pixel.x,
        y: pixel.y,
        clase: celda.clase,
        profundidad: 1 - punto.i / cuantos,
      });
    }
  }

  return { marcas, sinProyectar };
}
