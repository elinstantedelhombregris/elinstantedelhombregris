import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { RevisarDevolucion } from './RevisarDevolucion';

import type { CampanaPublica, DevolucionCampanaInput } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { escribir } from '~/lib/queries/participacion';

export function Devolucion({ campana }: { campana: CampanaPublica }) {
  const [texto, setTexto] = useState('');
  const [limites, setLimites] = useState('');
  const [ids, setIds] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const idLocal = useRef(crypto.randomUUID());
  const intento = useRef<DevolucionCampanaInput | null>(null);
  const qc = useQueryClient();
  const publicar = async () => {
    if (enviando) return;
    setEnviando(true);
    setError('');
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
    <section className="mt-12 border-t pt-8" aria-labelledby="devolucion-titulo">
      <h2 id="devolucion-titulo" className="font-anton text-4xl">
        Lo que escuchamos.
        <br />
        Lo que sigue abierto.
      </h2>
      {campana.devoluciones.length ? (
        <div className="mt-6 space-y-6">
          {campana.devoluciones.map((d) => (
            <article key={d.id} className="bg-papel-crudo border p-5">
              <p className="font-space text-violeta text-xs">
                Edición {d.edicion} · {new Date(d.fecha).toLocaleDateString('es-AR')}
              </p>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed">{d.texto}</p>
              <Nota>{d.limites}</Nota>
              {d.senales.length ? (
                <ul className="space-y-2 text-sm">
                  {d.senales.map((id) => (
                    <li key={id}>
                      <Fuente id={id} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4">
          La devolución está prevista para {campana.contrato.fechaDevolucion}. Todavía no fue
          publicada.
        </p>
      )}
      {campana.puedoEditar && (campana.estado !== 'borrador' || intento.current !== null) ? (
        <div className="mt-8 border p-5">
          <h3 className="font-anton text-2xl">Devolver es parte de convocar.</h3>
          <p className="mt-3 text-sm">
            Explicá lo aprendido y sus límites. Enlazá fuentes; no copies textos reservados o
            retirados.
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
          {error && intento.current ? <Nota>Este intento conserva su texto, fuentes y edición. Recuperarlo repite exactamente el mismo envío, aunque el proceso haya cambiado. Antes de preparar otro, revisá si esta devolución ya quedó publicada.</Nota> : null}
          <BotonAccion
            className="mt-5"
            disabled={enviando || texto.trim().length < 30 || limites.trim().length < 15}
            onClick={() => {
              void publicar();
            }}
          >
            {intento.current ? 'Recuperar la misma devolución' : 'Publicar devolución'}
          </BotonAccion>
          {error && intento.current ? <button type="button" className="text-violeta mt-4 min-h-11 underline" onClick={() => { intento.current = null; idLocal.current = crypto.randomUUID(); setError('Revisá el historial antes de enviar una devolución nueva. Conservamos tu texto para corregirlo.'); }}>Revisar y preparar un intento nuevo</button> : null}
        </div>
      ) : null}
      {campana.devoluciones.length ? (
        <RevisarDevolucion id={campana.id} responsable={campana.puedoEditar} />
      ) : null}
    </section>
  );
}
function Fuente({ id }: { id: string }) {
  return (
    <Link
      href={`/senal/${id}`}
      className="text-violeta inline-flex min-h-11 items-center underline"
    >
      Consultar el origen y estado de esta fuente
    </Link>
  );
}
