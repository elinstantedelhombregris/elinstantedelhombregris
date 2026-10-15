import manifiesto from './geografia.generated.json';

/** La edición se empaqueta con el sitio; todas las capas tienen URL inmutable. */
export const GEOGRAFIA = manifiesto;
export function archivoGeografico(capa: 'provincias' | 'departamentos' | 'municipios') {
  const archivo = GEOGRAFIA.capas.find((c) => c.nombre === capa)?.archivo;
  if (!archivo) throw new Error('La capa no está en esta edición geográfica.');
  return archivo;
}
