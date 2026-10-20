import { useQuery } from '@tanstack/react-query';
import { SLUG_CAMPANA_NACIONAL, type VisionCampana } from '@v2/shared';

import { api } from '~/lib/api';

/** La clave de la visión de una campaña: la invalida quien opina en Mirar o publica. */
export const claveVision = (campana: string) => ['vision', campana] as const;

/** La dirección de la visión, con el slug de la campaña bien escapado. */
export const rutaVision = (campana: string) =>
  `/api/v1/vision?${new URLSearchParams({ campana }).toString()}`;

/**
 * Ver — la visión de una campaña (spec 2026-10-19 §5), tal como la arma el servidor:
 * reglas, supresión de números chicos y orden ya aplicados. La pantalla sólo muestra.
 *
 * A diferencia del resto de las lecturas (`staleTime: Infinity`), la visión se vuelve a
 * pedir cada vez que se entra: se mueve cuando la gente opina, y quien llega desde Mirar
 * tiene que ver lo que acaba de hacer. Un cambio de sesión la descarta igual que a todo
 * (`adoptarSesion`).
 */
export function useVision(campana: string = SLUG_CAMPANA_NACIONAL) {
  return useQuery({
    queryKey: claveVision(campana),
    queryFn: ({ signal }) => api.get<VisionCampana>(rutaVision(campana), { signal }),
    staleTime: 0,
  });
}
