import { GEOGRAFIA, VALIDACION_ESPACIAL, informeEspacialSchema } from '@v2/shared';

/** La URL inmutable y su huella se empaquetan con esta versión del sitio. */
export async function cargarInformeEspacial(signal?: AbortSignal) {
  if (VALIDACION_ESPACIAL.version !== GEOGRAFIA.version)
    throw new Error('La edición del mapa cambió y todavía no tiene un informe espacial publicado.');
  const respuesta = await fetch(VALIDACION_ESPACIAL.archivo, signal ? { signal } : {});
  if (!respuesta.ok) throw new Error('No pudimos descargar el informe espacial.');
  const bytes = await respuesta.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, '0')).join('');
  if (hash !== VALIDACION_ESPACIAL.sha256)
    throw new Error('La huella del informe no coincide. Volvé a cargar la página.');
  const informe = informeEspacialSchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
  if (
    informe.version !== GEOGRAFIA.version ||
    GEOGRAFIA.capas.some(
      (c) =>
        informe.fuentes.filter((f) => f.nombre === c.nombre && f.sha256 === c.sha256).length !== 1,
    )
  )
    throw new Error('El informe corresponde a otros archivos geográficos.');
  return informe;
}
