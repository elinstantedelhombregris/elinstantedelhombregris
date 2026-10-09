import { useQueryClient } from '@tanstack/react-query';
import { contribucionSchema } from '@v2/shared';
import { useRef, useState } from 'react';

import { DestinoDelAporte } from '../../Imaginar/DestinoDelAporte';

import { PanelSoltarVoz } from './PanelSoltarVoz';

import type { PublicacionVoz } from './PanelSoltarVoz';
import type { CampanaDeAporte } from '../../Imaginar/FraseCampana';
import type { LugarMapa } from '../instrumento/BusquedaTerritorial';
import type { ContribucionInput } from '@v2/shared';

import { useAuth } from '~/lib/auth/use-auth';
import { useCampanaDeAporte } from '~/lib/participacion/useCampanaDeAporte';
import { usePublicarAporte } from '~/lib/queries/participacion';

interface Intento {
  id: string;
  aporte: ContribucionInput;
  campana: CampanaDeAporte | null;
  nombre: string | null;
}

/**
 * El aporte puntual publica en la misma campaña que las tres preguntas — leída
 * del enlace en vivo — y recupera el intento original si la respuesta se perdió.
 */
export function AporteDirectoMapa({ contexto }: { contexto?: LugarMapa | null }) {
  const auth = useAuth();
  const campanaCtx = useCampanaDeAporte();
  const { destino, bloqueo } = campanaCtx;
  const publicar = usePublicarAporte();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const intento = useRef<Intento | null>(null);
  const enviar: PublicacionVoz['enviar'] = (input, onSuccess) => {
    if (publicar.isPending || auth.isLoading) return;
    setError(null);
    let previo = intento.current?.id === input.idLocal ? intento.current : null;
    if (!previo) {
      // Sin intento previo, una campaña que no recibe aportes bloquea el envío.
      if (bloqueo) {
        setError(bloqueo);
        return;
      }
      const v = contribucionSchema.safeParse({
        senal: input,
        campanaId: destino?.id ?? null,
        edicion: destino?.revision ?? null,
        cuentaEsperada: auth.user?.id ?? null,
        fragmentos: [],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      });
      if (!v.success) {
        setError(v.error.issues.map((i) => i.message).join(' '));
        return;
      }
      previo = {
        id: input.idLocal,
        aporte: v.data,
        campana: destino,
        nombre: destino?.contrato.titulo ?? null,
      };
      intento.current = previo;
    }
    const { aporte, campana } = previo;
    publicar.mutate(aporte, {
      onSuccess: (respuesta) => {
        if (intento.current?.id === input.idLocal) intento.current = null;
        void qc.invalidateQueries({ queryKey: ['open-data'] });
        onSuccess(respuesta, campana);
      },
    });
  };
  const anterior = intento.current;
  const contextoCambiado =
    anterior &&
    (anterior.aporte.cuentaEsperada !== (auth.user?.id ?? null) ||
      anterior.aporte.campanaId !== (destino?.id ?? null) ||
      anterior.aporte.edicion !== (destino?.revision ?? null));
  return (
    <>
      <div className="border-tinta/20 mb-5 border-b pb-5 text-sm leading-relaxed">
        <DestinoDelAporte contexto={campanaCtx} />
        <p className="text-tinta-75 mt-3">
          El texto y sus permisos entran en el mismo registro. Con cuenta, su gestión queda en Mi
          espacio; sin cuenta, este navegador conserva la autoría. Publicar no expresa apoyo ni
          concede representación.
        </p>
        {contextoCambiado ? (
          <p className="text-sello mt-3">
            El reintento conserva la cuenta y la edición originales
            {anterior.nombre ? ` de ${anterior.nombre}` : ''}. La cuenta actual no recibe esa
            autoría. Para empezar otro aporte, revisá y cambiá lo que querés compartir.
          </p>
        ) : null}
      </div>
      <PanelSoltarVoz
        {...(contexto === undefined ? {} : { contexto })}
        publicacion={{
          enviar,
          pendiente: publicar.isPending || auth.isLoading,
          error: error ?? publicar.error?.message ?? null,
          // Reintentar un envío que ya salió no depende de cómo esté hoy la campaña.
          bloqueo: anterior ? null : bloqueo,
        }}
      />
    </>
  );
}
