/**
 * Pulsos — el primitivo de confianza del protocolo (Trust Layer).
 * Aprecio: presupuesto diario igual para todos (sinceridad por escasez,
 * sin plutocracia); un pulso por persona por obra, para siempre.
 * Latido: el "¿seguís?" semanal de las misiones activas — gratis,
 * porque es deber, no regalo.
 */
export const PULSOS_APRECIO_POR_DIA = 5;
export const LATIDO_VENCE_DIAS = 7;

export const pulsosDisponibles = (dadosHoy: number): number =>
  Math.max(0, PULSOS_APRECIO_POR_DIA - dadosHoy);

export type VeredictoPulso =
  | { ok: true }
  | { ok: false; motivo: 'sin-presupuesto' | 'repetido' };

export const puedeDarPulso = (
  dadosHoy: number,
  yaDioAlTarget: boolean,
): VeredictoPulso => {
  if (yaDioAlTarget) return { ok: false, motivo: 'repetido' };
  if (pulsosDisponibles(dadosHoy) === 0) return { ok: false, motivo: 'sin-presupuesto' };
  return { ok: true };
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const latidoVencido = (
  ultimoLatidoISO: string | null,
  ahoraISO: string,
): boolean => {
  if (!ultimoLatidoISO) return true;
  const dias = (Date.parse(ahoraISO) - Date.parse(ultimoLatidoISO)) / MS_POR_DIA;
  return dias > LATIDO_VENCE_DIAS;
};
