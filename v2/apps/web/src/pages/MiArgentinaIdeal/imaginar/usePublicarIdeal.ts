import { useQueryClient } from '@tanstack/react-query';
import { contribucionSchema } from '@v2/shared';
import { useRef, useState } from 'react';

import { provinciaIdDe, type AporteEnCurso } from './datos';

import type { CampanaPublica } from '@v2/shared';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { ApiError } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { armarAporteIdeal } from '~/lib/participacion/armar-aporte';
import { usePublicarAporte } from '~/lib/queries/participacion';

export interface ErrorDePublicar {
  mensaje: string;
  /** El código de la API, cuando lo hay: la pantalla ofrece un camino según cuál sea. */
  codigo: string | null;
}

export interface Publicado {
  recibo: ReciboParticipacion;
  /** La campaña en la que entró, o `null` si no entró en ninguna. */
  campana: CampanaPublica | null;
  linea: string;
  cedio: boolean;
}

const OTRO_ENVIO = ' Tocá «Publicar mi aporte» otra vez para mandarlo como un envío nuevo.';

/**
 * Publicar desde Imaginar, con el núcleo común de siempre (spec §3): el reintento es
 * idempotente —el mismo contenido conserva su `idLocal`, otro contenido estrena uno—,
 * la cuenta esperada se fija al primer intento y ningún error borra lo escrito.
 */
export function usePublicarIdeal({
  destino,
  bloqueo,
  pregunta,
}: {
  destino: CampanaPublica | null;
  bloqueo: string | null;
  pregunta: string;
}) {
  const auth = useAuth();
  const qc = useQueryClient();
  const enviar = usePublicarAporte();
  const intento = useRef<{ contenido: string; id: string; cuenta: number | null } | null>(null);
  const [error, setError] = useState<ErrorDePublicar | null>(null);

  const publicar = (aporte: AporteEnCurso, alPublicar: (p: Publicado) => void) => {
    setError(null);
    if (bloqueo) return;
    const cedio = aporte.lectura === 'libre';
    const armar = (idLocal: string, cuenta: number | null) =>
      armarAporteIdeal({
        idLocal,
        linea: aporte.linea,
        texto: aporte.texto,
        cedeLicencia: cedio,
        tema: aporte.tema,
        provinciaId: provinciaIdDe(aporte.provincia),
        cuentaEsperada: cuenta,
        destino,
        pregunta,
      });
    const contenido = JSON.stringify(armar('', null));
    if (intento.current?.contenido !== contenido)
      intento.current = { contenido, id: crypto.randomUUID(), cuenta: auth.user?.id ?? null };
    const validado = contribucionSchema.safeParse(
      armar(intento.current.id, intento.current.cuenta),
    );
    if (!validado.success) {
      setError({ mensaje: validado.error.issues.map((i) => i.message).join(' '), codigo: null });
      return;
    }
    const enDestino = destino;
    enviar.mutate(validado.data, {
      onSuccess: (recibo) => {
        intento.current = null;
        void qc.invalidateQueries({ queryKey: ['vision'] });
        alPublicar({ recibo, campana: enDestino, linea: aporte.linea.trim(), cedio });
      },
      onError: (e) => {
        const codigo = e instanceof ApiError ? e.code : null;
        // Con otra cuenta, o con un identificador que ya usó otro envío, el próximo
        // intento es un envío nuevo: la persona ya vio el aviso y lo revisó.
        if (codigo === 'CUENTA_CAMBIADA' || codigo === 'ENVIO_DISTINTO') intento.current = null;
        if (codigo === 'CAMPANA_CAMBIADA') void qc.invalidateQueries({ queryKey: ['campanas'] });
        // Un error de red llega con el mensaje del navegador, en inglés: se dice en castellano.
        const mensaje =
          e instanceof ApiError && e.message
            ? e.message
            : 'No pudimos publicar tu aporte. Tu texto sigue acá: probá de nuevo en un momento.';
        setError({ mensaje: codigo === 'ENVIO_DISTINTO' ? mensaje + OTRO_ENVIO : mensaje, codigo });
      },
    });
  };

  return {
    publicar,
    enviando: enviar.isPending,
    error,
    limpiarError: () => {
      setError(null);
    },
  };
}
