import { useEffect, useRef, useState } from 'react';

import { fechaCampana } from '../Campanas/presentacion';

import { ESTADOS_PRUEBA, faltanCaracteres, fechaDeFicha, rotuloDePrueba } from './presentacion';

import type { DisenoFicha } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionPersonal } from '~/lib/queries/participacion';

type EstadoPrueba = DisenoFicha['pruebas'][number]['estado'];

const SIGUIENTES: Record<EstadoPrueba, EstadoPrueba[]> = {
  propuesta: ['aceptada'],
  aceptada: ['en_curso', 'pausada'],
  en_curso: ['implementada', 'pausada'],
  pausada: ['en_curso'],
  implementada: ['resultado_observado'],
  resultado_observado: ['resultado_revisado'],
  resultado_revisado: [],
};

export function TarjetaPrueba({
  prueba: p,
  avisar,
}: {
  prueba: DisenoFicha['pruebas'][number];
  avisar: (texto: string) => void;
}) {
  const op = useOperacionPersonal();
  const idLocal = useRef(crypto.randomUUID());
  const [firma, setFirma] = useState('');
  const [observacion, setObservacion] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [estado, setEstado] = useState<EstadoPrueba | ''>(SIGUIENTES[p.estado][0] ?? '');
  useEffect(() => {
    setEstado(SIGUIENTES[p.estado][0] ?? '');
  }, [p.estado]);
  const motivo =
    faltanCaracteres(observacion.trim().length, 15, 'en lo que observamos') ??
    (estado === 'aceptada' && firma.trim().length < 3
      ? 'Falta la firma pública de responsabilidad.'
      : null);
  return (
    <article className="bg-papel-crudo border-tinta border p-5">
      <p className="font-space text-violeta text-xs uppercase">{rotuloDePrueba(p.estado)}</p>
      <h4 className="font-anton mt-3 text-3xl">{p.titulo}</h4>
      <p className="mt-3 leading-relaxed">{p.alcance}</p>
      <p className="text-tinta-50 mt-3 text-sm">
        Fecha prevista de revisión: {fechaCampana(p.plazo)} · versión {p.revision}
      </p>
      <p className="mt-3 text-sm">
        Responsabilidad aceptada: {p.responsableNombre ?? 'todavía pendiente.'} La firma elegida no
        acredita representación institucional.
      </p>
      <ol className="mt-5 space-y-4">
        {p.eventos.map((e, i) => (
          <li key={`${e.fecha}-${i}`} className="border-tinta/25 border-t pt-4">
            <h5 className="font-semibold">
              {rotuloDePrueba(e.estado)}{' '}
              <span className="text-tinta-50 text-sm font-normal">· {fechaDeFicha(e.fecha)}</span>
            </h5>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{e.observacion}</p>
            <ul className="mt-3 space-y-2">
              {e.evidencia.map((url) => (
                <li key={url}>
                  <a
                    className="text-violeta break-all underline"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar evidencia
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {(p.estado === 'resultado_observado' ? p.puedoRevisar : p.puedoGestionar) &&
      SIGUIENTES[p.estado].length ? (
        <form
          className="border-tinta/25 mt-5 border-t pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (motivo || estado === '') return;
            op.mutate(
              {
                metodo: 'post',
                ruta: `/api/v1/fichas/pruebas/${p.id}/estado`,
                cuerpo: {
                  idLocal: idLocal.current,
                  ...(estado === 'aceptada' ? { firma } : {}),
                  revision: p.revision,
                  estado,
                  observacion,
                  evidencia: evidencia.split(/\s+/).filter(Boolean),
                },
              },
              {
                onSuccess: () => {
                  setObservacion('');
                  idLocal.current = crypto.randomUUID();
                  setEvidencia('');
                  avisar(`Registramos el paso: ${rotuloDePrueba(estado).toLowerCase()}.`);
                },
              },
            );
          }}
        >
          <label className="block">
            Paso que vamos a registrar
            <select
              className={CAMPO}
              value={estado}
              onChange={(e) => {
                const elegido = SIGUIENTES[p.estado].find((x) => x === e.target.value);
                if (elegido) setEstado(elegido);
              }}
            >
              {SIGUIENTES[p.estado].map((x) => (
                <option key={x} value={x}>
                  {ESTADOS_PRUEBA[x]}
                </option>
              ))}
            </select>
          </label>
          {estado === 'aceptada' ? (
            <label className="mt-4 block">
              Firma pública de responsabilidad
              <input
                className={CAMPO}
                value={firma}
                onChange={(e) => {
                  setFirma(e.target.value);
                }}
                maxLength={120}
              />
            </label>
          ) : null}
          <label className="mt-4 block">
            Qué observamos y cómo lo sabemos
            <textarea
              className={CAMPO}
              rows={3}
              maxLength={4000}
              value={observacion}
              onChange={(e) => {
                setObservacion(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Enlaces de evidencia, separados por espacios
            <input
              className={CAMPO}
              value={evidencia}
              onChange={(e) => {
                setEvidencia(e.target.value);
              }}
            />
          </label>
          <ErrorOperacion mensaje={op.error?.message} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BotonConMotivo type="submit" motivo={motivo} ocupado={op.isPending}>
              Registrar este paso
            </BotonConMotivo>
          </div>
        </form>
      ) : null}
      <p className="text-tinta-50 mt-4 text-sm">
        La revisión viene de una cuenta distinta de la creadora y de la responsable. Eso no acredita
        independencia personal, no equivale a una auditoría ni demuestra causalidad.
      </p>
    </article>
  );
}
