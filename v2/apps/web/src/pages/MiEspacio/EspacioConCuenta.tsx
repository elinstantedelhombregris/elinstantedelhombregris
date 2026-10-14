import { Link } from 'wouter';

import { AnalisisGuardados } from './AnalisisGuardados';
import { Avisos } from './Avisos';
import { BorradoresLocales } from './Borradores';
import { Cuenta } from './Cuenta';
import { MisAportes } from './MisAportes';
import { MisProcesos } from './MisProcesos';
import { ListaDePestanas, PanelDePestana } from './Pestanas';
import { Recuperar } from './Recuperar';
import { Seguidos } from './Seguidos';
import { usePestana } from './usePestana';

import type { ReactNode } from 'react';
import type { AuthenticatedUser } from '~/lib/auth/types';

import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useMiEspacio } from '~/lib/queries/participacion';

/** Mi espacio con sesión: seis pestañas en la dirección (`?pestana=`) y un panel por pestaña. */
export function EspacioConCuenta({ user }: { user: AuthenticatedUser }) {
  const auth = useAuth();
  const q = useMiEspacio(user.id);
  const [pestana, elegir] = usePestana();
  const espacio = q.data;

  const conDatos = (hacer: (datos: NonNullable<typeof espacio>) => ReactNode) =>
    espacio ? (
      hacer(espacio)
    ) : q.isLoading ? (
      <p>Buscando tus aportes y lo que seguís…</p>
    ) : (
      <p>No pudimos abrir tu espacio. Probá recargar la página.</p>
    );

  return (
    <>
      <Link className="mb-5 inline-flex min-h-11 underline" href="/campo">
        Mi cuaderno de campo →
      </Link>
      <Link className="mb-5 inline-flex min-h-11 underline" href="/capacidades?propias=si">
        Mis capacidades, reservas y entregas →
      </Link>
      <p className="mb-5">
        <Link className="inline-flex min-h-11 underline" href="/iniciativas">
          Mis iniciativas, tareas y escuchas →
        </Link>
      </p>
      <ListaDePestanas actual={pestana} elegir={elegir} />
      <PanelDePestana id={pestana}>
        {pestana === 'borradores' ? (
          <BorradoresLocales />
        ) : pestana === 'avisos' ? (
          <Avisos />
        ) : pestana === 'cuenta' ? (
          <Cuenta
            nombre={user.name}
            email={user.email}
            verificado={user.emailVerified}
            salir={() => {
              auth.logout.mutate();
            }}
          />
        ) : (
          <>
            <ErrorOperacion mensaje={q.error?.message} />
            {pestana === 'aportes' ? (
              <>
                <Recuperar />
                {conDatos((datos) => (
                  <>
                    <MisAportes aportes={datos.aportes} total={datos.totalAportes} />
                    <MisProcesos
                      procesos={datos.procesos ?? []}
                      puedeArmarFicha={datos.totalAportes > 0}
                      esAdmin={user.esAdmin}
                    />
                  </>
                ))}
              </>
            ) : pestana === 'sigo' ? (
              conDatos((datos) => <Seguidos espacio={datos} />)
            ) : (
              conDatos((datos) => <AnalisisGuardados espacio={datos} />)
            )}
          </>
        )}
      </PanelDePestana>
    </>
  );
}
