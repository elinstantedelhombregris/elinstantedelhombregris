import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { LecturaDeRespuestas } from './LecturaDeRespuestas';
import { faltanCaracteres, TITULOS_DE_DISENO } from './presentacion';
import { TarjetaAfirmacion } from './TarjetaAfirmacion';

import type { AnalisisOpiniones } from '@v2/civic-core';
import type { DisenoFicha } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';
import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

const MINIMO_DE_LA_AFIRMACION = 10;

export function Afirmaciones({
  fichaId,
  datos,
  hrefIngreso,
}: {
  fichaId: string;
  datos: DisenoFicha & { analisisOpiniones: AnalisisOpiniones };
  hrefIngreso: string;
}) {
  const auth = useAuth();
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState('');
  const idLocal = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  const analisis = datos.analisisOpiniones;
  const hay = datos.afirmaciones.length > 0;
  // El aviso y el registro de exposición salen de la misma condición: no se anota nada sin avisar.
  const avisaExposicion = Boolean(auth.user) && hay;
  const motivo = faltanCaracteres(texto.trim().length, MINIMO_DE_LA_AFIRMACION);
  return (
    <section aria-labelledby="afirmaciones-titulo">
      <h3 id="afirmaciones-titulo" className="font-anton text-3xl">
        {TITULOS_DE_DISENO.afirmaciones}
      </h3>
      <p className="mt-4 leading-relaxed">
        Cada afirmación contiene una sola idea. Podés estar de acuerdo, no estarlo o pasar. Las
        respuestas no comprueban un hecho ni autorizan una política por sí solas.
      </p>
      {avisaExposicion ? (
        <Nota>
          Anotamos qué afirmaciones viste, sin tu nombre, para saber a cuántas personas llegaron.
        </Nota>
      ) : null}
      <p
        role="status"
        className={aviso ? 'border-violeta my-4 border-l-2 pl-4 text-sm' : 'sr-only'}
      >
        {aviso}
      </p>
      {hay ? (
        <ul className="mt-6 space-y-5">
          {datos.afirmaciones.map((a) => (
            <TarjetaAfirmacion
              key={a.id}
              afirmacion={a}
              registraExposicion={avisaExposicion}
              avisar={setAviso}
            />
          ))}
        </ul>
      ) : (
        <Nota>
          Todavía no hay afirmaciones.{' '}
          {auth.user ? 'Podés proponer la primera.' : 'Ingresá para proponer la primera.'}
        </Nota>
      )}
      {auth.user ? (
        <form
          className="border-tinta mt-7 border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (motivo) return;
            op.mutate(
              {
                metodo: 'post',
                ruta: `/api/v1/fichas/${fichaId}/afirmaciones`,
                cuerpo: { idLocal: idLocal.current, texto },
              },
              {
                onSuccess: () => {
                  setTexto('');
                  idLocal.current = crypto.randomUUID();
                  setAviso('Publicamos tu afirmación.');
                },
              },
            );
          }}
        >
          <label className="block">
            Una condición o idea para conversar
            <textarea
              rows={3}
              maxLength={500}
              className={CAMPO}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
              }}
              placeholder="Que podamos elegir dónde vivir sin renunciar a nuestras oportunidades."
            />
          </label>
          <p className="text-tinta-50 mt-3 text-sm">
            La afirmación se publica con esta ficha. Su autoría de cuenta permanece privada.
          </p>
          <ErrorOperacion mensaje={op.error?.message} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BotonConMotivo type="submit" motivo={motivo} ocupado={op.isPending}>
              Proponer esta afirmación
            </BotonConMotivo>
          </div>
        </form>
      ) : (
        <BotonPapel asChild variant="fantasma" className="mt-6 inline-block">
          <Link href={hrefIngreso}>Ingresar para responder o proponer</Link>
        </BotonPapel>
      )}
      {hay ? <LecturaDeRespuestas afirmaciones={datos.afirmaciones} analisis={analisis} /> : null}
    </section>
  );
}
