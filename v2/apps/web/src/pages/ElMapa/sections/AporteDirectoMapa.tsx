import { useQueryClient } from '@tanstack/react-query';
import { contribucionSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearch } from 'wouter';

import { PanelSoltarVoz } from './PanelSoltarVoz';

import type { PublicacionVoz } from './PanelSoltarVoz';
import type { LugarMapa } from '../instrumento/BusquedaTerritorial';
import type { ContribucionInput } from '@v2/shared';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { useAuth } from '~/lib/auth/use-auth';
import { useCampana, usePublicarAporte } from '~/lib/queries/participacion';

/** Un mismo formulario publica y recupera la contribución dentro de su contexto original. */
export function AporteDirectoMapa({ contexto }: { contexto?: LugarMapa | null }) {
  const auth = useAuth();
  const origen = useRef(new URLSearchParams(useSearch()));
  const q = origen.current;
  const campanaId = q.get('campana');
  const edicion = Number(q.get('edicion'));
  const edicionInvalida =
    q.has('edicion') && (!campanaId || !Number.isSafeInteger(edicion) || edicion <= 0);
  const [edicionElegida, fijarEdicion] = useState<number | undefined>(
    Number.isSafeInteger(edicion) && edicion > 0 ? edicion : undefined,
  );
  const campana = useCampana(campanaId ?? undefined, edicionElegida);
  useEffect(() => {
    if (campanaId && !edicionInvalida && campana.data && edicionElegida === undefined)
      fijarEdicion(campana.data.revision);
  }, [campanaId, edicionInvalida, campana.data, edicionElegida]);
  const activa = campanaId ? campana.data : undefined;
  const publicar = usePublicarAporte();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const intento = useRef<{ id: string; aporte: ContribucionInput; nombre: string | null } | null>(
    null,
  );
  const enviar: PublicacionVoz['enviar'] = (input, onSuccess) => {
    if (publicar.isPending || auth.isLoading) return;
    setError(null);
    let aporte = intento.current?.id === input.idLocal ? intento.current.aporte : null;
    if (!aporte) {
      if (edicionInvalida) {
        setError(
          'La edición del enlace no es válida. Revisá el proceso antes de compartir; conservamos tu texto.',
        );
        return;
      }
      if (campanaId && (!campana.data || campana.isError)) {
        setError(
          'No pudimos comprobar esta campaña. Tu texto sigue con vos; revisá el proceso antes de compartir.',
        );
        return;
      }
      if (campanaId && campana.data?.estado !== 'abierta') {
        setError(
          'Esta edición no recibe aportes ahora. Conservamos tu texto; no lo trasladamos a otra campaña.',
        );
        return;
      }
      const v = contribucionSchema.safeParse({
        senal: input,
        campanaId: activa?.id ?? null,
        edicion: activa?.revision ?? null,
        cuentaEsperada: auth.user?.id ?? null,
        fragmentos: [],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      });
      if (!v.success) {
        setError(v.error.issues.map((i) => i.message).join(' '));
        return;
      }
      aporte = v.data;
      intento.current = { id: input.idLocal, aporte, nombre: activa?.contrato.titulo ?? null };
    }
    publicar.mutate(aporte, {
      onSuccess: (respuesta) => {
        if (intento.current?.id === input.idLocal) intento.current = null;
        void qc.invalidateQueries({ queryKey: ['open-data'] });
        onSuccess(respuesta);
      },
    });
  };
  const anterior = intento.current;
  const contextoCambiado =
    anterior &&
    (anterior.aporte.cuentaEsperada !== (auth.user?.id ?? null) ||
      anterior.aporte.campanaId !== (activa?.id ?? null) ||
      anterior.aporte.edicion !== (activa?.revision ?? null));
  return (
    <>
      <div className="border-tinta/20 mb-5 border-b pb-5 text-sm leading-relaxed">
        {edicionInvalida ? (
          <p role="alert">
            La edición del enlace no es válida. Conservá tu voz y revisá la convocatoria.
          </p>
        ) : campanaId ? (
          campana.isLoading ? (
            <p role="status">Buscando el contexto de esta campaña…</p>
          ) : campana.data ? (
            <>
              <p>
                Campaña: <strong>{campana.data.contrato.titulo}</strong> · edición{' '}
                {campana.data.revision} · {FASES_ROTULO[campana.data.estado]}.
              </p>
              <p className="text-tinta-75 mt-2">
                {campana.data.estado === 'abierta'
                  ? 'Tu aporte entra en esta pregunta después de revisarlo y elegir publicarlo.'
                  : 'Esta edición no recibe aportes nuevos. Tu texto permanece con vos.'}
              </p>
              <Link
                href={`/campanas/${campana.data.slug}${edicion > 0 ? `?edicion=${campana.data.revision}` : ''}`}
                className="text-violeta mt-2 inline-flex min-h-11 items-center underline"
              >
                Leer el contrato y la devolución
              </Link>
            </>
          ) : (
            <p role="alert">
              No pudimos leer esta campaña. No publicaremos tu voz fuera de ella por defecto.
            </p>
          )
        ) : (
          <p>
            Tu voz entra al registro común, sin una campaña elegida. La ubicación es opcional y la
            elegís vos.
          </p>
        )}
        <p className="text-tinta-75 mt-3">
          El texto y sus permisos entran en el mismo registro. Con cuenta, su gestión queda en Mi
          espacio; sin cuenta, este navegador conserva la autoría. Publicar no expresa apoyo ni
          concede representación.
        </p>
        {contextoCambiado ? (
          <p className="text-sello mt-3">
            El reintento conserva la cuenta y la edición originales
            {anterior.nombre ? ` de ${anterior.nombre}` : ''}. La cuenta actual no recibe esa
            autoría. Para comenzar otra voz, revisá y cambiá lo que querés compartir.
          </p>
        ) : null}
      </div>
      <PanelSoltarVoz
        {...(contexto === undefined ? {} : { contexto })}
        publicacion={{
          enviar,
          pendiente: publicar.isPending || auth.isLoading,
          error: error ?? publicar.error?.message ?? null,
        }}
      />
    </>
  );
}
