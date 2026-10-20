import { Redirect, useSearch } from 'wouter';

import { aportarHref } from '~/lib/participacion/aportar';

/**
 * Las direcciones viejas de «Imaginar» (`/imaginar` y `/campanas/:slug/participar`)
 * llevan a Imaginar (`/mi-argentina-ideal/imaginar`). Se queda con lo que el enlace
 * pedía —la campaña (del camino o de la búsqueda), la edición y el borrador— y
 * siempre abre el camino guiado. wouter no conserva la búsqueda en un `Redirect`,
 * por eso se lee acá y se vuelve a armar.
 */
export function RedirigirAAportar({ campana }: { campana?: string }) {
  const q = new URLSearchParams(useSearch());
  const pedida = campana ?? q.get('campana') ?? undefined;
  const edicion = q.get('edicion');
  const borrador = q.get('borrador');
  const numero = Number(edicion);
  let href = aportarHref({
    ...(pedida ? { campana: pedida } : {}),
    ...(edicion !== null && Number.isSafeInteger(numero) && numero > 0 ? { edicion: numero } : {}),
    ...(borrador ? { borrador } : {}),
  });
  // Una edición mal escrita no se descarta: el panel la va a marcar como inválida
  // y no va a publicar en otra edición sin que la persona lo sepa.
  if (edicion !== null && !href.includes('edicion=')) {
    const [ruta = href, busqueda = ''] = href.split('?');
    const conEdicion = new URLSearchParams(busqueda);
    conEdicion.set('edicion', edicion);
    href = `${ruta}?${conEdicion.toString()}`;
  }
  return <Redirect to={href} replace />;
}
