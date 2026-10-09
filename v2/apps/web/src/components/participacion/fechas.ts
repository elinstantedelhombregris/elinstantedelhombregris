/**
 * El día de un instante (`2026-10-09T01:30:00.000Z`) en la Argentina, escrito en palabras.
 * Para días sueltos (`2026-10-09`) está `fechaCampana`; un instante cae el día anterior si se lo
 * recorta en UTC pasada la medianoche, por eso va aparte.
 */
export function fechaDeRegistro(instante: string) {
  const valor = new Date(instante);
  return Number.isNaN(valor.getTime())
    ? ''
    : valor.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
      });
}
