import { SLUG_CAMPANA_NACIONAL, type CampanaPublica } from '@v2/shared';
import { useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';

import { leerPedidoAportar, type PedidoAportar } from './aportar';

import { useCampana } from '~/lib/queries/participacion';

export interface ContextoDeCampana {
  /** Lo que pide el enlace, leído en vivo. */
  pedido: PedidoAportar;
  /** El enlace nombró una campaña. Si no, un aporte va a la nacional cuando está abierta. */
  explicita: boolean;
  /** Lo que se sabe de la campaña consultada: la pedida, o la nacional. */
  campana: CampanaPublica | undefined;
  /** Todavía no hay respuesta sobre la campaña. */
  comprobando: boolean;
  /** La campaña en la que entraría un aporte publicado ahora; `null` si no hay ninguna. */
  destino: CampanaPublica | null;
  /** Por qué no se puede publicar ahora, o `null` si se puede. */
  bloqueo: string | null;
}

const MENSAJE = {
  edicion:
    'La edición del enlace no es válida. Conservamos tu texto; revisá la campaña antes de publicar.',
  campana:
    'No reconocemos la campaña del enlace. Conservamos tu texto; revisá el enlace antes de publicar.',
  cerrada:
    'Esta edición no recibe aportes ahora. Conservamos tu texto; no lo trasladamos a otra campaña.',
  fallo: 'No pudimos comprobar esta campaña. Tu texto sigue con vos; reintentá antes de publicar.',
  comprobando: 'Estamos comprobando la campaña. Un momento.',
} as const;

/**
 * A qué campaña entra un aporte, leído del enlace EN VIVO.
 *
 * Los dos formularios del panel del mapa (las tres preguntas y el aporte
 * puntual) comparten esta regla, que antes estaba copiada en cada uno y
 * congelada al montarse: si el enlace cambiaba con el panel abierto, seguían
 * publicando en la campaña vieja.
 *
 * - Con `campana` en el enlace, el aporte entra ahí o no entra: si la campaña
 *   no se puede comprobar, no está abierta o la edición es inválida, se bloquea
 *   y se conserva el texto. Nunca se traslada a otra campaña «por las dudas».
 * - Sin `campana`, entra a la campaña nacional «Mi Argentina ideal». Si esa
 *   campaña no existe todavía o no está abierta, se publica sin campaña y no se
 *   bloquea nada: es el caso de una base recién creada.
 */
export function useCampanaDeAporte(): ContextoDeCampana {
  const search = useSearch();
  const pedido = useMemo(() => leerPedidoAportar(search), [search]);
  const slug = pedido.campana ?? SLUG_CAMPANA_NACIONAL;
  const explicita = pedido.campana !== undefined;
  const consultar = pedido.problema !== 'campana';

  // Una campaña pedida se fija en la edición que la persona vio al empezar.
  const [fijada, setFijada] = useState<{ slug: string; edicion: number } | null>(null);
  const edicionFijada = fijada?.slug === slug ? fijada.edicion : undefined;
  const edicion = explicita ? (pedido.edicion ?? edicionFijada) : undefined;
  const consulta = useCampana(consultar ? slug : undefined, edicion);
  const datos = consulta.data;
  useEffect(() => {
    if (
      explicita &&
      pedido.problema === null &&
      datos &&
      pedido.edicion === undefined &&
      edicionFijada === undefined
    )
      setFijada({ slug, edicion: datos.revision });
  }, [explicita, pedido.problema, pedido.edicion, datos, edicionFijada, slug]);

  const comprobando = consultar && !datos && consulta.isPending;
  let destino: CampanaPublica | null = null;
  let bloqueo: string | null = null;
  if (pedido.problema) bloqueo = MENSAJE[pedido.problema];
  else if (explicita) {
    if (datos) {
      if (datos.estado === 'abierta') destino = datos;
      else bloqueo = MENSAJE.cerrada;
    } else bloqueo = comprobando ? MENSAJE.comprobando : MENSAJE.fallo;
  } else if (datos?.estado === 'abierta') destino = datos;
  else if (comprobando) bloqueo = MENSAJE.comprobando;

  return { pedido, explicita, campana: datos, comprobando, destino, bloqueo };
}
