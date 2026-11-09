import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { BorradoresLocales } from './Borradores';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { hrefIngresar } from '~/lib/auth/volver';

interface AporteDeEsteNavegador {
  id: string;
  texto: string;
  tipo: string;
  fecha: string;
}

/**
 * Lo que este navegador publicó sin cuenta. La lista la arma el servidor leyendo la cookie
 * de autoría, que el código de la página no puede leer (D-107). Si no hay nada, no ocupa lugar.
 */
function AportesDeEsteNavegador() {
  const q = useQuery({
    queryKey: ['de-este-navegador'],
    queryFn: () => api.get<AporteDeEsteNavegador[]>('/api/v1/mi-espacio/de-este-navegador'),
  });
  if (!Array.isArray(q.data) || q.data.length === 0) return null;
  return (
    <section aria-labelledby="titulo-de-este-navegador" className="mt-10 border p-5">
      <h2 id="titulo-de-este-navegador" className="font-anton text-2xl">
        Lo que publicaste desde este navegador
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        Los publicaste sin cuenta. Desde acá podés corregirlos o retirarlos mientras conserves este
        navegador.
      </p>
      <ul className="mt-5 space-y-4">
        {q.data.map((a) => (
          <li key={a.id} className="flex flex-wrap items-start justify-between gap-3">
            <span className="max-w-[560px] break-words">{a.texto}</span>
            <Link href={`/senal/${a.id}`} className="text-violeta underline underline-offset-4">
              Corregir o retirar
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Mi espacio para quien no ingresó: sin pestañas, porque no hay nada que
 * separar. Lo que sí hay en el navegador son los borradores (viven en el
 * dispositivo, no en el servidor), y la razón para tener cuenta.
 *
 * Los aportes que este navegador publicó sin cuenta SÍ se listan acá (D-107): la autoría
 * anónima vive en una cookie que solo el servidor lee, y `/api/v1/mi-espacio/de-este-navegador`
 * la lee sin pedir sesión. Al crear la cuenta, «Mis aportes» los ofrece para sumarlos.
 */
export function EspacioSinCuenta() {
  return (
    <>
      <section
        aria-labelledby="titulo-crear-cuenta"
        className="border-violeta bg-papel-crudo border-l-2 p-5"
      >
        <h2 id="titulo-crear-cuenta" className="font-anton text-3xl">
          Creá tu cuenta para no perder tus aportes
        </h2>
        <p className="mt-3 max-w-[640px] leading-relaxed">
          Los aportes que publicaste sin cuenta quedan atados a este navegador: si borrás sus datos
          o cambiás de dispositivo, no vamos a poder devolvértelos. Con una cuenta te siguen a
          cualquier dispositivo, y al crearla te ofrecemos sumar los que publicaste desde acá. Para
          imaginar no hace falta, y tu nombre no se publica.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <EnlaceAccion href={hrefIngresar('/mi-espacio', '/registrarse')}>
            Crear mi cuenta
          </EnlaceAccion>
          <EnlaceAccion secundario href={hrefIngresar('/mi-espacio')}>
            Ya tengo cuenta: ingresar
          </EnlaceAccion>
        </div>
      </section>
      <AportesDeEsteNavegador />
      <div className="mt-10">
        <BorradoresLocales />
      </div>
    </>
  );
}
