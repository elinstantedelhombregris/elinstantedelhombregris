import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export interface VozAbierta {
  /**
   * Dos espacios de identidad conviviendo: un **uuid** para lo que vive en
   * `senales`, y el ordinal numérico de lo que todavía escribe la app de campo
   * en `dreams`. No se unifican a string a propósito — el 201 de la ruta vieja
   * devuelve un número y quien lo guardó lo va a comparar con `===`.
   *
   * Como clave de React sirven los dos. Lo que NO hay que hacer es aritmética
   * con esto ni asumir orden.
   */
  id: string | number;
  body: string;
  category: string | null;
  /** La clase de la señal. `null` en lo viejo: sus tipos no son del canon. */
  clase?: string | null;
  provinceId: number | null;
  submittedAs: string | null;
  createdAt: string;
  /** El punto publicado, o null cuando la voz solo sabe su provincia. */
  lat: number | null;
  lng: number | null;
  /** `LocationPrecision` — con qué precisión se publicó. Ver spec 1 §5. */
  precision: string;
}

export const VOCES_MAPA_LIMIT = 500;

/** Voces aprobadas, más nuevas primero — un solo fetch para puntos del mapa Y feed. */
export function useVocesAbiertas() {
  return useQuery({
    queryKey: ['open-data', 'voces', VOCES_MAPA_LIMIT],
    queryFn: () => api.get<VozAbierta[]>(`/api/open-data/dreams?limit=${String(VOCES_MAPA_LIMIT)}`),
  });
}

export interface ConteoProvincia {
  provinceId: number | null;
  count: number;
}

/** Conteo autoritativo por provincia — numera los clusters más allá del cap de la lista. */
export function useVocesPorProvincia() {
  return useQuery({
    queryKey: ['open-data', 'voces-por-provincia'],
    queryFn: () => api.get<{ byProvince: ConteoProvincia[] }>('/api/open-data/dreams/by-province'),
    select: (d) => d.byProvince,
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

/**
 * La conversión primaria del sitio. Endpoint anónimo (CSRF allow-listed,
 * rate limit del server como techo). Al 201 invalida open-data (puntos,
 * clusters, feed) y analytics (cifra de portada + contador FOMO del header):
 * toda la página confirma que la voz quedó.
 */
export function useSoltarVoz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SoltarVozInput) => api.post<VozSoltada>('/api/v1/civic/senales', input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['open-data'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['senales'] }),
      ]);
    },
  });
}
