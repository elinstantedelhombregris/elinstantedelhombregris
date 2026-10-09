import { EspacioConCuenta } from './MiEspacio/EspacioConCuenta';
import { EspacioSinCuenta } from './MiEspacio/EspacioSinCuenta';

import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/**
 * Mi espacio: donde una persona vuelve a lo que publicó, a lo que sigue y a lo
 * que dejó a medias. Con sesión son seis pestañas; sin sesión, una invitación a
 * crear la cuenta y los borradores de este navegador.
 */
export function MiEspacio() {
  useTituloDePagina('Mi espacio');
  const auth = useAuth();
  return (
    <MarcoParticipacion
      titulo="Mi espacio"
      entrada="Acá volvés a lo que publicaste, a lo que seguís y a lo que dejaste a medias."
      kicker="Solo lo ves vos"
    >
      {auth.isLoading ? (
        <p>Abriendo tu espacio…</p>
      ) : auth.user ? (
        <EspacioConCuenta user={auth.user} />
      ) : (
        <EspacioSinCuenta />
      )}
    </MarcoParticipacion>
  );
}

export default MiEspacio;
