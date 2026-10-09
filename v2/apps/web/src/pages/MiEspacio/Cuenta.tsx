import { useState } from 'react';

import { OpcionesCuenta } from './OpcionesCuenta';

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
    <section>
      <h2 className="font-anton text-3xl">Tu cuenta también necesita claridad.</h2>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-tinta-50 text-sm">Nombre de cuenta, privado en este recorrido</dt>
          <dd>{nombre}</dd>
        </div>
        <div>
          <dt className="text-tinta-50 text-sm">Correo</dt>
          <dd>
            {email} · {verificado ? 'verificado' : 'pendiente de verificar'}
          </dd>
        </div>
      </dl>
      <Nota>
        Ingresar no publica tu identidad ni cambia la firma de tus aportes. Verificar correo
        acredita acceso a ese correo; no identidad civil ni representación de un territorio.
      </Nota>
      <div className="flex flex-wrap gap-3">
        <a
          href="/api/v1/mi-espacio/mis-datos"
          download="basta-mis-datos.json"
          className="font-space bg-violeta text-papel inline-flex min-h-11 items-center border px-5 py-3 text-xs"
        >
          Descargar mis datos
        </a>
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
          Los borradores locales permanecen en este navegador. Si compartís el equipo, revisá qué
          querés borrar antes de salir.
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
        Podés retirar publicaciones desde Mis aportes y dejar de seguir procesos. Cerrar una sesión
        no realiza esas acciones.
      </p>
      <OpcionesCuenta salir={salir} />
    </section>
  );
}
