/**
 * El parser de `docs/DEUDAS.md`.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md` §2.7.
 *
 * Vive separado del importador —que habla con la base— porque esto es una
 * función de texto a datos y se prueba con una cadena, sin base y sin red. El
 * archivo real es el mejor caso de prueba que hay, y el test lo lee entero.
 *
 * Lo que **no** hace: no decide nada sobre la base. Devuelve lo que el archivo
 * dice, incluida la plantilla `D-0NN` de la cabecera, que descarta por no ser
 * un número. Esa plantilla es el caso que rompe un parser ingenuo.
 */

export type SeveridadLeida = 'bloqueante' | 'alta' | 'media' | 'baja';

export interface DeudaLeida {
  idPublico: string;
  titulo: string;
  /** El cuerpo entero de la entrada, con sus campos y su prosa, sin el `###`. */
  cuerpo: string;
  severidad: SeveridadLeida | null;
  resuelta: boolean;
}

const CABECERA = /^###\s+(D-\d{3,6})\s+·\s+(.+?)\s*$/;
const SEVERIDADES: readonly SeveridadLeida[] = ['bloqueante', 'alta', 'media', 'baja'];

/**
 * Una entrada está resuelta si **alguna de sus líneas de campo** dice
 * «resuelta». El archivo usa tres formas distintas y ninguna es la plantilla:
 *
 *   **Estado:** ~~abierta~~ → **resuelta 2026-08-01**   (la del cuerpo)
 *   **Resuelta:** 2026-08-02                            (la copia de «Resueltas»)
 *   **Encontrada y resuelta:** 2026-08-01               (D-012, encontrada y cerrada el mismo día)
 *
 * Perseguir nombres de campo uno por uno fue el error: son tres hoy y van a
 * ser cuatro. La regla mira **el bloque de campos y no la prosa**, que es lo
 * que separa «esta deuda está resuelta» de un párrafo que menciona la palabra.
 */
const LINEA_DE_CAMPO = /^\*\*([^:*]+):\*\*(.*)$/gm;

/**
 * Cinco formas, dos señales.
 *
 * El archivo anuncia que algo se cerró de cinco maneras distintas, escritas por
 * sesiones que no se conocían:
 *
 *   **Estado:** ~~abierta~~ → **resuelta 2026-08-01**   (D-001, la del cuerpo)
 *   **Estado:** RESUELTA 2026-08-04 — de rebote…        (D-025, en mayúsculas)
 *   **Resuelta:** 2026-08-02                            (la copia de «Resueltas»)
 *   **Encontrada y resuelta:** 2026-08-01               (D-012)
 *   **Cómo se arregló (2026-08-03):**                   (D-016, sin línea de estado)
 *
 * Y tres que contienen esas mismas palabras y son deudas ABIERTAS:
 *
 *   **Estado:** abierta (…, no resuelta)                (D-029)
 *   **Estado:** **parcialmente resuelta 2026-08-02**    (D-014)
 *   **Por qué no se arregla acá:** …                    (D-032, D-033)
 *
 * Perseguir nombres de campo uno por uno fue el primer error y buscar la
 * palabra suelta fue el segundo — y el segundo es el grave: daba por hechas
 * cosas que no lo están, que es la única dirección en la que un registro
 * público no puede equivocarse.
 *
 * Las dos señales que quedan: **un campo que anuncia el arreglo y no lo niega**,
 * o **un `**Estado:**` que dice resuelta sin calificarlo**. Los dos miran el
 * bloque de campos y no la prosa, que es lo que separa «esto está cerrado» de
 * un párrafo que menciona la palabra.
 *
 * «Parcialmente resuelta» cuenta como abierta a propósito: en el vocabulario
 * del canal una falta está hecha o no lo está, y una a medio arreglar todavía
 * le falta a alguien.
 */
/**
 * Anuncia el cierre en pasado: «Resuelta», «Encontrada y resuelta», «Cómo se
 * arregló». Sin `\b` de cierre después del verbo, a propósito: `\b` es ASCII y
 * `ó` no es carácter de palabra, así que `arregl[óo]\b` nunca matchea
 * «arregló» — la clase de bug que se ve verde hasta que alguien mira la lista.
 */
const ANUNCIA_CIERRE = /\bresuelta\b|\bse\s+(?:arregl|resolvi|cerr)[óo]/i;
/** «Por qué **no** se arregló en el momento» es la coartada de una abierta. */
const NIEGA_EN_NOMBRE = /\bno\b/i;
const NIEGA_EN_ESTADO = /\b(?:no|sin|parcialmente|aún\s+no|todav[ií]a\s+no)\s+resuelt[ao]/i;

function estaResuelta(cuerpo: string): boolean {
  let estado: string | undefined;
  let anuncioDeCierre = false;

  for (const [, nombre = '', valor = ''] of cuerpo.matchAll(LINEA_DE_CAMPO)) {
    if (/^estado$/i.test(nombre.trim())) {
      estado = valor;
      continue;
    }
    if (ANUNCIA_CIERRE.test(nombre) && !NIEGA_EN_NOMBRE.test(nombre)) anuncioDeCierre = true;
  }

  // `**Estado:**` es el campo que la plantilla del archivo declara, así que
  // cuando está, MANDA. Es lo que salva a D-028, que dice «**Estado:** abierta»
  // y más abajo «**Cómo se arregla:** …» — en presente, que es la receta para
  // arreglarla y no el acta de que se arregló. Un anuncio de cierre sólo
  // decide cuando no hay estado que consultar, que es el caso de D-012, D-016
  // y de todas las copias de la sección «Resueltas».
  if (estado !== undefined) {
    return /resuelt[ao]/i.test(estado) && !NIEGA_EN_ESTADO.test(estado);
  }
  return anuncioDeCierre;
}

function leerSeveridad(lineaDeSeveridad: string | undefined): SeveridadLeida | null {
  if (!lineaDeSeveridad) return null;
  const texto = lineaDeSeveridad.toLowerCase();
  // El archivo escribe «media — no rompe ninguna guardia»: la severidad es la
  // primera palabra conocida, no la línea entera.
  return SEVERIDADES.find((s) => new RegExp(`\\b${s}\\b`).test(texto)) ?? null;
}

function campo(cuerpo: string, nombre: string): string | undefined {
  const match = new RegExp(`^\\*\\*${nombre}:\\*\\*\\s*(.+)$`, 'mi').exec(cuerpo);
  return match?.[1]?.trim();
}

/**
 * Corta el archivo en entradas por sus cabeceras `### D-0NN · …`.
 *
 * Descarta la plantilla de «Cómo se usa» porque su id es literalmente `D-0NN`
 * y no matchea `\d{3,6}`, y descarta el índice porque las filas de la tabla no
 * empiezan con `###`.
 */
export function leerDeudas(markdown: string): DeudaLeida[] {
  const lineas = markdown.split('\n');
  const deudas: DeudaLeida[] = [];

  let actual: { idPublico: string; titulo: string; lineas: string[] } | undefined;

  const cerrar = () => {
    if (!actual) return;
    const cuerpo = actual.lineas.join('\n').trim();
    deudas.push({
      idPublico: actual.idPublico,
      titulo: actual.titulo,
      cuerpo,
      severidad: leerSeveridad(campo(cuerpo, 'Severidad')),
      resuelta: estaResuelta(cuerpo),
    });
    actual = undefined;
  };

  for (const linea of lineas) {
    const cabecera = CABECERA.exec(linea);
    if (cabecera?.[1] && cabecera[2]) {
      cerrar();
      actual = { idPublico: cabecera[1], titulo: cabecera[2], lineas: [] };
      continue;
    }
    // Una cabecera de otro nivel cierra la entrada: la sección «Resueltas»
    // arranca con `##` y lo que sigue no pertenece a la última deuda.
    if (actual && /^#{1,2}\s/.test(linea)) {
      cerrar();
      continue;
    }
    actual?.lineas.push(linea);
  }
  cerrar();

  return deudas;
}

/**
 * La misma deuda aparece **dos veces** cuando se resuelve: la entrada del
 * cuerpo, que lleva `**Severidad:**` y `**Estado:**`, y la copia de la sección
 * «Resueltas», que lleva `**Resuelta:**` y `**Cómo:**` y ninguno de los otros
 * dos.
 *
 * Por eso esto **fusiona y no descarta**. «Gana la última» perdía la severidad
 * de las cuatro deudas resueltas y —peor— las devolvía como abiertas, porque
 * la copia de abajo no tiene línea de estado que leer. Y «gana la primera»
 * perdería el relato de cómo se arregló, que es la mitad del valor del
 * registro.
 *
 * La fusión: el título y la severidad salen de la primera aparición; `resuelta`
 * es cierto si **alguna** lo dice; el cuerpo son los dos, en orden de archivo.
 */
export function fusionar(deudas: DeudaLeida[]): DeudaLeida[] {
  const porId = new Map<string, DeudaLeida>();

  for (const deuda of deudas) {
    const previa = porId.get(deuda.idPublico);
    if (!previa) {
      porId.set(deuda.idPublico, deuda);
      continue;
    }
    porId.set(deuda.idPublico, {
      idPublico: previa.idPublico,
      titulo: previa.titulo,
      cuerpo: `${previa.cuerpo}\n\n${deuda.cuerpo}`.trim(),
      severidad: previa.severidad ?? deuda.severidad,
      resuelta: previa.resuelta || deuda.resuelta,
    });
  }

  return [...porId.values()];
}
