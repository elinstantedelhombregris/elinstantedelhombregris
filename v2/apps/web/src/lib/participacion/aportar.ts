/**
 * La puerta única de «Imaginar mi Argentina».
 *
 * Imaginar vive dentro del mapa: hay un solo panel, una sola dirección y una
 * sola palabra para lo que se publica, que es «aporte». Todo enlace que invita
 * a aportar —cabecera, pie, cierres de página, campañas— sale de acá, así la
 * próxima vez que cambie el contrato de la URL se cambia en un solo lugar.
 *
 * ## El contrato de la URL
 *
 * - `participar=aportar` abre el panel con las tres preguntas (lo canónico).
 * - `participar=directo` lo abre en el aporte puntual.
 * - Alias que siguen andando porque hay enlaces en la calle: `imaginar` y
 *   `guiado` abren las tres preguntas; `voz` abre el aporte puntual.
 * - `campana` es un slug o un id; `edicion`, `borrador` y `lugar` acompañan.
 */
export const APORTAR_HREF = '/el-mapa?participar=aportar#instrumento';

export type ModoAportar = 'guiado' | 'directo';

export interface OpcionesAportar {
  campana?: string;
  edicion?: number;
  borrador?: string;
  lugar?: string;
  modo?: 'guiado' | 'directo';
}

/** El enlace al panel de aportes del mapa. Siempre termina en `#instrumento`. */
export function aportarHref(o: OpcionesAportar = {}): string {
  const q = new URLSearchParams();
  q.set('participar', o.modo === 'directo' ? 'directo' : 'aportar');
  if (o.campana) q.set('campana', o.campana);
  if (o.edicion !== undefined && Number.isSafeInteger(o.edicion) && o.edicion > 0)
    q.set('edicion', String(o.edicion));
  if (o.borrador) q.set('borrador', o.borrador);
  if (o.lugar) q.set('lugar', o.lugar);
  return `/el-mapa?${q.toString()}#instrumento`;
}

const MODO_DE_PARTICIPAR: Readonly<Record<string, ModoAportar>> = {
  aportar: 'guiado',
  imaginar: 'guiado',
  guiado: 'guiado',
  directo: 'directo',
  voz: 'directo',
};

/** Un slug (`mi-argentina-ideal`) o un id: letras, números, guiones; nada que cambie una ruta. */
const FORMA_DE_CAMPANA = /^[A-Za-z0-9_-]{1,120}$/;

export interface PedidoAportar {
  /** Lo que pide la URL; `null` cuando no pide abrir el panel. */
  modo: ModoAportar | null;
  campana?: string;
  /** Solo si es un entero positivo. */
  edicion?: number;
  borrador?: string;
  /**
   * Qué parte del enlace no se puede usar. Con un problema el aporte no se
   * publica en ningún otro lado «por las dudas»: se conserva el texto y se avisa.
   */
  problema: 'edicion' | 'campana' | null;
}

/** Lo que el enlace pide, con los alias resueltos. */
export function leerPedidoAportar(search: string): PedidoAportar {
  const q = new URLSearchParams(search);
  const participar = q.get('participar');
  const pedido: PedidoAportar = {
    modo: participar === null ? null : (MODO_DE_PARTICIPAR[participar] ?? null),
    problema: null,
  };
  const campana = q.get('campana');
  if (campana) {
    if (FORMA_DE_CAMPANA.test(campana)) pedido.campana = campana;
    else pedido.problema = 'campana';
  }
  if (q.has('edicion')) {
    const edicion = Number(q.get('edicion'));
    if (pedido.campana && Number.isSafeInteger(edicion) && edicion > 0) pedido.edicion = edicion;
    else pedido.problema ??= 'edicion';
  }
  const borrador = q.get('borrador');
  if (borrador) pedido.borrador = borrador;
  return pedido;
}

/** Saca un parámetro de la dirección actual sin recargar ni sumar una entrada al historial. */
export function quitarParametroDeLaUrl(clave: string): void {
  const q = new URLSearchParams(window.location.search);
  if (!q.has(clave)) return;
  q.delete(clave);
  const consulta = q.size ? `?${q.toString()}` : '';
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${consulta}${window.location.hash}`,
  );
}
