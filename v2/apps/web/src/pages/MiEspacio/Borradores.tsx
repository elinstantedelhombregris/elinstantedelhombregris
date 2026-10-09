import { useEffect, useState } from 'react';
import { Link } from 'wouter';

import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { leerBorradores, borrarBorrador, type BorradorIdeal } from '~/lib/participacion/borradores';

export function BorradoresLocales() {
  const [lista, setLista] = useState<BorradorIdeal[]>([]);
  const [error, setError] = useState('');
  const cargar = () => {
    void leerBorradores()
      .then(setLista)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'No pudimos abrir el archivo local.');
      });
  };
  useEffect(cargar, []);
  return (
    <section>
      <h2 className="font-anton text-3xl">Reflexiones que siguen con vos.</h2>
      <Nota>
        Estos borradores están solo en este navegador. No se sincronizaron ni se ligaron
        automáticamente a tu cuenta. Si compartís el equipo, revisá qué conviene conservar acá.
      </Nota>
      <ErrorOperacion mensaje={error} />
      {lista.length ? (
        <ul className="space-y-5">
          {lista.map((b) => (
            <li key={b.id} className="border p-5">
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {b.frases[0]?.trim() ? b.frases[0] : 'Reflexión todavía sin primera frase.'}
              </p>
              <p className="text-tinta-50 mt-3 text-sm">
                Guardado en este dispositivo · {new Date(b.fecha).toLocaleDateString('es-AR')}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  className="text-violeta inline-flex min-h-11 items-center underline"
                  href={`/imaginar?borrador=${b.id}${b.campanaId ? `&campana=${b.campanaId}` : ''}`}
                >
                  Retomar
                </Link>
                <BotonAccion
                  tono="papel"
                  onClick={() => {
                    void borrarBorrador(b.id)
                      .then(cargar)
                      .catch((e: unknown) => {
                        setError(e instanceof Error ? e.message : 'No pudimos borrar el borrador.');
                      });
                  }}
                >
                  Borrar del dispositivo
                </BotonAccion>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No hay reflexiones guardadas aquí. Al imaginar podés elegir guardar una sin publicarla.
        </p>
      )}
    </section>
  );
}
