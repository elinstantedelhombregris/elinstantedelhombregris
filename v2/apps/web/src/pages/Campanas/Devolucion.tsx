import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { esEjemploLocal, fechaCampana } from './presentacion';
import { RevisarDevolucion } from './RevisarDevolucion';

import type { CampanaPublica, DevolucionCampanaInput } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { fechaDeRegistro } from '~/components/participacion/fechas';
import { escribir } from '~/lib/queries/participacion';

const MINIMO_TEXTO = 30;
const MINIMO_LIMITES = 15;

/** Qué le falta al formulario para poder publicarse, en una frase; `null` si ya puede. */
function queFalta(texto: string, limites: string) {
  const faltaTexto = MINIMO_TEXTO - texto.trim().length;
  if (faltaTexto > 0)
    return `Faltan ${faltaTexto} ${faltaTexto === 1 ? 'carácter' : 'caracteres'} en la lectura del equipo (mínimo ${MINIMO_TEXTO}).`;
  const faltaLimites = MINIMO_LIMITES - limites.trim().length;
  if (faltaLimites > 0)
    return `Faltan ${faltaLimites} ${faltaLimites === 1 ? 'carácter' : 'caracteres'} en lo que falta y hasta dónde llega (mínimo ${MINIMO_LIMITES}).`;
  return null;
}

export function Devolucion({ campana }: { campana: CampanaPublica }) {
  const [texto, setTexto] = useState('');
  const [limites, setLimites] = useState('');
  const [ids, setIds] = useState('');
  const [error, setError] = useState('');
  const [publicada, setPublicada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const idLocal = useRef(crypto.randomUUID());
  const intento = useRef<DevolucionCampanaInput | null>(null);
  const qc = useQueryClient();
  const publicar = async () => {
    if (enviando) return;
    setEnviando(true);
    setError('');
    setPublicada(false);
    try {
      intento.current ??= {
        idLocal: idLocal.current,
        revision: campana.revision,
        texto,
        limites,
        senales: ids
          .split(/[\s,]+/)
          .filter(Boolean)
          .map((id) => id.split('/senal/').pop() ?? id),
      };
      await escribir('post', `/api/v1/campanas/${campana.id}/devoluciones`, intento.current);
      setTexto('');
      setLimites('');
      setIds('');
      intento.current = null;
      idLocal.current = crypto.randomUUID();
      setPublicada(true);
      void qc.invalidateQueries({ queryKey: ['campanas'] });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No pudimos publicar la devolución. Conservá tu texto.',
      );
    } finally {
      setEnviando(false);
    }
  };
  return (
    <section
      id="devolucion"
      className="mt-12 scroll-mt-24 border-t pt-8"
      aria-labelledby="devolucion-titulo"
    >
      <h2 id="devolucion-titulo" className="font-anton text-4xl">
        La devolución
      </h2>
      {campana.devoluciones.length ? (
        <div className="mt-6 space-y-6">
          {campana.devoluciones.map((d) => (
            <article key={d.id} className="bg-papel-crudo border p-5">
              <p className="font-space text-violeta text-xs">
                Edición {d.edicion} · {fechaDeRegistro(d.fecha)}
              </p>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed">{d.texto}</p>
              <Nota>
                <strong>Qué falta y hasta dónde llega esta lectura:</strong> {d.limites}
              </Nota>
              {d.senales.length ? (
                <ul className="space-y-2 text-sm">
                  {d.senales.map((id, i) => (
                    <li key={id}>
                      <Fuente id={id} numero={i + 1} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4">
          {esEjemploLocal(campana)
            ? 'Todavía no hay una devolución publicada.'
            : `La devolución está prevista para el ${fechaCampana(campana.contrato.fechaDevolucion)}. Todavía no fue publicada.`}
        </p>
      )}
      <p role="status" className="mt-4 text-sm">
        {publicada ? 'Publicamos la devolución. Ya la puede leer cualquiera en esta página.' : ''}
      </p>
      {campana.puedoEditar && (campana.estado !== 'borrador' || intento.current !== null) ? (
        <div className="mt-8 border p-5">
          <h3 className="font-anton text-2xl">Publicar la devolución</h3>
          <p className="mt-3 text-sm">
            Contá lo que aprendieron y hasta dónde llega esa lectura. Enlazá fuentes; no copies
            textos reservados o retirados.
          </p>
          <label className="mt-4 block">
            Lectura del equipo
            <textarea
              className={CAMPO}
              rows={6}
              maxLength={12000}
              value={texto}
              readOnly={intento.current !== null}
              onChange={(e) => {
                setTexto(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Qué falta y hasta dónde llega esta lectura
            <textarea
              className={CAMPO}
              rows={3}
              maxLength={3000}
              value={limites}
              readOnly={intento.current !== null}
              onChange={(e) => {
                setLimites(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Enlaces o identificadores públicos de fuentes
            <input
              className={CAMPO}
              value={ids}
              readOnly={intento.current !== null}
              onChange={(e) => {
                setIds(e.target.value);
              }}
            />
          </label>
          <ErrorOperacion mensaje={error} />
          {error && intento.current ? (
            <Nota>
              Este intento conserva su texto, fuentes y edición. Recuperarlo repite exactamente el
              mismo envío, aunque la campaña haya cambiado. Antes de preparar otro, revisá si esta
              devolución ya quedó publicada.
            </Nota>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <BotonConMotivo
              motivo={intento.current ? null : queFalta(texto, limites)}
              ocupado={enviando}
              onClick={() => {
                void publicar();
              }}
            >
              {intento.current ? 'Recuperar la misma devolución' : 'Publicar devolución'}
            </BotonConMotivo>
          </div>
          {error && intento.current ? (
            <button
              type="button"
              className="text-violeta mt-4 min-h-11 underline"
              onClick={() => {
                intento.current = null;
                idLocal.current = crypto.randomUUID();
                setError(
                  'Revisá el historial antes de enviar una devolución nueva. Conservamos tu texto para corregirlo.',
                );
              }}
            >
              Revisar y preparar un intento nuevo
            </button>
          ) : null}
        </div>
      ) : null}
      {campana.devoluciones.length ? (
        <RevisarDevolucion id={campana.id} responsable={campana.puedoEditar} />
      ) : null}
    </section>
  );
}
function Fuente({ id, numero }: { id: string; numero: number }) {
  return (
    <Link
      href={`/senal/${id}`}
      className="text-violeta inline-flex min-h-11 items-center underline"
    >
      Fuente {numero}: ver su origen y estado
    </Link>
  );
}
