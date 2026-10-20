import { IMAGINAR_HREF } from '~/components/papel/papel-nav';

/**
 * Qué pide un enlace al mapa, ahora que Imaginar vive en Mi Argentina ideal.
 *
 * Hasta la entrega 3 el mapa abría un panel con las tres preguntas para imaginar el
 * país (spec 2026-10-19 §7). Ese panel ya no existe: el mapa es la capa de cómo está
 * hoy lo que la gente imaginó, y en él sólo se cuenta algo puntual con su lugar.
 *
 * Hay enlaces en la calle que siguen pidiendo el panel viejo, así que el contrato
 * de la dirección se lee así:
 *
 * - `participar=aportar`, y sus alias `imaginar` y `guiado`, llevan a Imaginar;
 * - el ancla `#aportar` también, salvo que el enlace pida el aporte puntual;
 * - `participar=directo`, y su alias `voz`, abren el aporte puntual en el mapa.
 *
 * Se lee acá y no con `leerPedidoAportar`, que es del módulo de Imaginar: el mapa
 * no tiene que depender de cómo Imaginar arme sus enlaces.
 */
const PIDEN_IMAGINAR = new Set(['aportar', 'imaginar', 'guiado']);
const PIDEN_PUNTUAL = new Set(['directo', 'voz']);

/** Lo que viaja de un enlace viejo a Imaginar: la campaña, su edición, el borrador y el lugar. */
export const PARAMETROS_PARA_IMAGINAR = ['campana', 'edicion', 'borrador', 'lugar'] as const;

/** ¿El enlace abre el aporte puntual dentro del mapa? */
export function pideAportePuntual(search: string): boolean {
  const participar = new URLSearchParams(search).get('participar');
  return participar !== null && PIDEN_PUNTUAL.has(participar);
}

/**
 * Adónde manda el enlace cuando lo que pide es imaginar, o `null` si es un enlace
 * del mapa. Los parámetros se copian tal como llegan, también una edición mal
 * escrita: Imaginar la marca como inválida en vez de publicar en otra edición sin
 * que la persona lo sepa.
 */
export function destinoDeImaginar(search: string, hash: string): string | null {
  const q = new URLSearchParams(search);
  const participar = q.get('participar');
  const pideImaginar =
    (participar !== null && PIDEN_IMAGINAR.has(participar)) ||
    (hash === '#aportar' && !pideAportePuntual(search));
  if (!pideImaginar) return null;
  const salida = new URLSearchParams();
  for (const clave of PARAMETROS_PARA_IMAGINAR) {
    const valor = q.get(clave);
    if (valor) salida.set(clave, valor);
  }
  const consulta = salida.toString();
  return consulta ? `${IMAGINAR_HREF}?${consulta}` : IMAGINAR_HREF;
}
