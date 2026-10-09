import { BorradoresLocales } from './Borradores';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { hrefIngresar } from '~/lib/auth/volver';

/**
 * Mi espacio para quien no ingresó: sin pestañas, porque no hay nada que
 * separar. Lo que sí hay en el navegador son los borradores (viven en el
 * dispositivo, no en el servidor), y la razón para tener cuenta.
 *
 * Los aportes que este navegador publicó sin cuenta NO se listan acá: la
 * autoría anónima vive en una cookie que solo el servidor lee, y la única
 * lista que la usa (`/api/v1/mi-espacio/recuperables`) pide sesión. Por eso el
 * texto promete lo que sí pasa: al crear la cuenta, «Mis aportes» los ofrece
 * para sumarlos.
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
      <div className="mt-10">
        <BorradoresLocales />
      </div>
    </>
  );
}
