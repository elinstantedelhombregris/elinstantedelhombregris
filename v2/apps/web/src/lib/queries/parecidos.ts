import { useMutation, useQuery } from '@tanstack/react-query';
import { opinionSchema } from '@v2/shared';
import { useEffect, useState } from 'react';

import { escribir } from './participacion';

import type { AporteParecido, ResultadoOpinion } from '@v2/shared';

/**
 * Aportes parecidos a lo que la persona está escribiendo (spec §3, entrega 2).
 *
 * El parecido lo calcula la API adentro de Postgres (`pg_trgm` y búsqueda de texto
 * en castellano), sin modelo y sin proveedor. Se pregunta después de una pausa al
 * escribir, para no mandar una consulta por letra. Si la API falla o no encuentra
 * nada, la pantalla no muestra nada: es una ayuda, no un paso.
 */

/** Cuánto se espera después de la última tecla. */
export const PAUSA_PARECIDOS_MS = 600;
/** Menos letras que esto no alcanza para que el parecido signifique algo. */
export const LETRAS_PARA_PARECIDOS = 10;
export const MAXIMO_DE_PARECIDOS = 3;

const letras = (t: string) => t.replace(/[^\p{L}]/gu, '').length;

/** El valor, recién cuando dejó de cambiar durante `ms`. Antes de la primera pausa, vacío. */
export function useConPausa(valor: string, ms: number = PAUSA_PARECIDOS_MS): string {
  const [quieto, setQuieto] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setQuieto(valor);
    }, ms);
    return () => {
      clearTimeout(t);
    };
  }, [valor, ms]);
  return quieto;
}

export function useParecidos(texto: string) {
  const consulta = useConPausa(texto.trim());
  return useQuery({
    queryKey: ['parecidos', consulta],
    enabled: letras(consulta) >= LETRAS_PARA_PARECIDOS,
    queryFn: () =>
      escribir<AporteParecido[]>('post', '/api/v1/vision/parecidos', { texto: consulta }),
    select: (d) => (Array.isArray(d) ? d.slice(0, MAXIMO_DE_PARECIDOS) : []),
    retry: false,
    staleTime: 60_000,
  });
}

/** «Me sumo»: cuenta como «Yo también» en Mirar (`PUT /api/v1/pila/opiniones/:id`). */
export function useSumarmeAParecido() {
  return useMutation({
    mutationFn: (v: { id: string; provinciaId: number | null }) =>
      escribir<ResultadoOpinion>(
        'put',
        `/api/v1/pila/opiniones/${encodeURIComponent(v.id)}`,
        opinionSchema.parse({ valor: 'acuerdo', provinciaId: v.provinciaId }),
      ),
  });
}
