import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { escribir } from '~/lib/queries/participacion';
export function RevisarDevolucion({ id, responsable }: { id: string; responsable: boolean }) {
  const auth = useAuth();
  const qc = useQueryClient();
  const envio = useRef(crypto.randomUUID());
  const [texto, setTexto] = useState('');
  const [confirma, setConfirma] = useState(false);
  const [error, setError] = useState('');
  const q = useQuery({
    queryKey: ['devolucion-revisiones', id],
    queryFn: () =>
      api.get<{ id: string; texto: string; respuesta: string | null; fecha: string }[]>(
        `/api/v1/equipo/campanas/${id}/revisiones`,
      ),
  });
  const publicar = async () => {
    try {
      await escribir('post', `/api/v1/equipo/campanas/${id}/revisiones`, {
        idLocal: envio.current,
        texto,
        aceptaPublicar: true,
      });
      setTexto('');
      setConfirma(false);
      envio.current = crypto.randomUUID();
      void qc.invalidateQueries({ queryKey: ['devolucion-revisiones', id] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos registrar tu revisión.');
    }
  };
  return (
    <section className="mt-8 border-t pt-6">
      <h3 className="font-anton text-3xl">¿Tu voz conserva su sentido?</h3>
      <p className="mt-3 leading-relaxed">
        Quienes participaron pueden señalar una omisión o una lectura que necesita corregirse. El
        equipo responde acá; la diferencia queda visible.
      </p>
      <ul className="mt-5 space-y-4">
        {q.data?.map((v) => (
          <li key={v.id} className="border p-5">
            <p className="whitespace-pre-wrap">{v.texto}</p>
            {v.respuesta ? (
              <Nota>Respuesta del equipo: {v.respuesta}</Nota>
            ) : responsable ? (
              <Responder campana={id} revision={v.id} />
            ) : (
              <p className="text-tinta-50 mt-3 text-sm">El equipo todavía no respondió.</p>
            )}
          </li>
        ))}
      </ul>
      {auth.user && (
        <form
          className="mt-5 border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void publicar();
          }}
        >
          <label>
            Qué entendieron distinto o qué falta
            <textarea
              className={CAMPO}
              value={texto}
              rows={3}
              maxLength={2000}
              onChange={(e) => {
                setTexto(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirma}
              onChange={(e) => {
                setConfirma(e.target.checked);
              }}
            />
            Autorizo publicar esta revisión, sin datos de mi cuenta.
          </label>
          <BotonAccion
            className="mt-4"
            type="submit"
            disabled={!confirma || texto.trim().length < 15}
          >
            Pedir una revisión
          </BotonAccion>
          <Nota>
            La cuenta debe tener un aporte asociado a esta campaña. Si participaste sin cuenta,
            recuperalo primero en Mi espacio.
          </Nota>
        </form>
      )}
      <ErrorOperacion mensaje={error || q.error?.message} />
    </section>
  );
}
function Responder({ campana, revision }: { campana: string; revision: string }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const qc = useQueryClient();
  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        void escribir(
          'post',
          `/api/v1/equipo/campanas/${campana}/revisiones/${revision}/respuesta`,
          { texto },
        )
          .then(() => qc.invalidateQueries({ queryKey: ['devolucion-revisiones', campana] }))
          .catch((e: unknown) => {
            setError(e instanceof Error ? e.message : 'No pudimos registrar la respuesta.');
          });
      }}
    >
      <label>
        Cómo incorporamos esta mirada
        <textarea
          className={CAMPO}
          rows={2}
          maxLength={3000}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
          }}
        />
      </label>
      <BotonAccion type="submit" className="mt-3" disabled={texto.trim().length < 15}>
        Publicar respuesta
      </BotonAccion>
      <ErrorOperacion mensaje={error} />
    </form>
  );
}
