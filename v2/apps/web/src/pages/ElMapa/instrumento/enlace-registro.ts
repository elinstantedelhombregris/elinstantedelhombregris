import type { SenalMapa } from '~/lib/queries/civic-map';

export function enlaceDeRegistro(senal: SenalMapa): string | null {
  const [origen, id] = senal.id.split(':');
  if (origen === 'voz' && id && /^[0-9a-f-]{36}$/i.test(id)) return `/senal/${id}`;
  if ((origen === 'pulso' || origen === 'propuesta') && id && /^\d+$/.test(id))
    return `/mandato-vivo/${origen}/${id}`;
  return null;
}
