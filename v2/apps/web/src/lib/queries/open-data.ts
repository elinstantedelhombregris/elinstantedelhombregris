import { useQuery } from '@tanstack/react-query';

import type { TipoSenal } from '~/components/papel/primitives';

import { api } from '~/lib/api';

export interface ProvinciaApi {
  id: number;
  name: string;
  isoCode: string | null;
}

/** Las 24 provincias seed — alimentan el select del panel y el match nombre→id del SVG. */
export function useProvincias() {
  return useQuery({
    queryKey: ['open-data', 'provincias'],
    queryFn: () => api.get<{ provinces: ProvinciaApi[] }>('/api/open-data/provinces'),
    select: (d) => d.provinces,
  });
}

/**
 * El cuerpo del contrato `basta-senal/v1`.
 *
 * Cambió entero: antes era `{body, category}` contra `/api/open-data/dreams`,
 * con `category` como texto libre y los seis tipos viejos. Ahora es el contrato
 * único de la spec B §4.7, con los nueve del canon y los tres campos que la
 * base exige y que un default no puede inventar — `casa`, `cedeLicencia` y,
 * según el tipo, la fecha, la fuente o la periodicidad.
 */
export interface SoltarVozInput {
  contrato: string;
  idLocal: string;
  tipo: TipoSenal;
  texto: string;
  casa: string;
  cedeLicencia: boolean;
  titulo?: string | null;
  fuente?: string | null;
  firma?: string | null;
  comprometidoPara?: string | null;
  periodicidad?: string | null;
  sostenidaPor?: string | null;
  provinceId?: number;
  cityId?: number;
  punto?: { lat: number; lng: number };
  precisionPedida?: string;
  aceptaEngrosado?: boolean;
}

export interface VozSoltada {
  idPublico: string;
  yaExistia: boolean;
  /**
   * Opcionales a propósito. La confirmación de la voz soltada es la conversión
   * primaria del sitio: no puede romperse porque una respuesta venga sin un
   * campo accesorio — de un servidor viejo, de un proxy que recorta, de lo que
   * sea. El sello RECIBIDA tiene que salir igual.
   */
  precisionPublicada?: string;
  /** Por qué el servidor engrosó la precisión, cuando la engrosó. */
  engrosado?: string | null;
  /** Qué se retiró de la dirección y por qué. */
  direccionRetirada?: string | null;
  avisos?: readonly string[];
}
