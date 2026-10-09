import { useState } from 'react';

import { OpcionesCuenta } from './OpcionesCuenta';
import { ReenviarCorreo } from './VerificarCorreo';

import { BotonPapel } from '~/components/papel/primitives';
import { BotonAccion, EnlaceAccion, Nota } from '~/components/participacion/Elementos';

export function Cuenta({
  nombre,
  email,
  verificado,
  salir,
}: {
  nombre: string;
  email: string;
  verificado: boolean;
  salir: () => void;
}) {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <section aria-labelledby="titulo-cuenta">
      <h2 id="titulo-cuenta" className="font-anton text-3xl">
        Cuenta y datos
      </h2>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-tinta-50 text-sm">Nombre (solo lo ves vos)</dt>
          <dd>{nombre}</dd>
        </div>
        <div>
          <dt className="text-tinta-50 text-sm">Correo</dt>
          <dd>
            {email} · {verificado ? 'verificado' : 'pendiente de verificar'}
            {verificado ? null : <ReenviarCorreo email={email} />}
          </dd>
        </div>
      </dl>
      <Nota>
        Tu nombre y tu correo no se publican junto a tus aportes. Verificar el correo solo confirma
        que podés leerlo.
      </Nota>
      <div className="flex flex-wrap gap-3">
        <BotonPapel asChild className="inline-flex items-center">
          <a href="/api/v1/mi-espacio/mis-datos" download="basta-mis-datos.json">
            Descargar mis datos
          </a>
        </BotonPapel>
        <EnlaceAccion secundario href="/mi-perfil">
          Datos y actividad de mi perfil
        </EnlaceAccion>
        <BotonAccion
          tono="papel"
          onClick={() => {
            setConfirmar(true);
          }}
        >
          Cerrar sesión
        </BotonAccion>
      </div>
      {confirmar ? (
        <Nota>
          Los borradores de este navegador se quedan acá. Si compartís el equipo, revisá qué querés
          borrar antes de salir.
          <div className="mt-4 flex gap-3">
            <BotonAccion onClick={salir}>Salir de mi cuenta</BotonAccion>
            <BotonAccion
              tono="papel"
              onClick={() => {
                setConfirmar(false);
              }}
            >
              Seguir acá
            </BotonAccion>
          </div>
        </Nota>
      ) : null}
      <p className="mt-6 text-sm">
        Cerrar sesión no retira tus aportes ni cambia lo que seguís. Eso lo hacés desde «Mis
        aportes» y «Lo que sigo».
      </p>
      <OpcionesCuenta salir={salir} />
    </section>
  );
}
