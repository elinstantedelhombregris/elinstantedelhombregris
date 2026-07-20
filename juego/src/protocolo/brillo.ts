/**
 * Brillo — el trust decay del protocolo, renderizado como cielo.
 * La reputación no se muestra jamás como número: se muestra como
 * constelación cuyo brillo refleja obra RECIENTE (vida media 90 días).
 * Sos quien sos ahora, no quien fuiste en 2012.
 */
export const VIDA_MEDIA_DIAS = 90;

const LAMBDA = Math.LN2 / VIDA_MEDIA_DIAS;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const brilloDeObras = (
  fechasISO: readonly string[],
  ahoraISO: string,
): number => {
  const ahora = Date.parse(ahoraISO);
  return fechasISO.reduce((acc, f) => {
    const dias = Math.max(0, (ahora - Date.parse(f)) / MS_POR_DIA);
    return acc + Math.exp(-LAMBDA * dias);
  }, 0);
};

export type NivelBrillo = 'apagada' | 'tenue' | 'viva' | 'radiante';

export const nivelDeBrillo = (brillo: number): NivelBrillo => {
  if (brillo <= 0) return 'apagada';
  if (brillo < 1) return 'tenue';
  if (brillo < 3) return 'viva';
  return 'radiante';
};
