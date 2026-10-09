import { useState } from 'react';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useRetirarSenal } from '~/lib/queries/senales';

export function RetirarAporte({ id }: { id: string }) {
  const auth = useAuth();
  const [confirmando, setConfirmando] = useState(false);
  const retirar = useRetirarSenal(id);
  return (
    <section className="mt-8 border-t pt-6" aria-label="Retirar mi aporte">
      {auth.user ? null : (
        <div className="text-sm leading-relaxed">
          <p>
            Este navegador sabe que lo escribiste vos. Si borrás los datos de este navegador antes
            de crear tu cuenta, no vamos a poder devolverte este aporte.
          </p>
          <div className="mt-3">
            <EnlaceAccion secundario href={hrefIngresar(undefined, '/registrarse')}>
              Crear mi cuenta
            </EnlaceAccion>
          </div>
        </div>
      )}
      {confirmando ? (
        <>
          <p className="my-3">
            El texto deja de mostrarse y el aporte sale de todas las cuentas del mapa. Lo que otras
            personas ya descargaron no se puede recuperar.
          </p>
          <button
            type="button"
            disabled={retirar.isPending}
            className="bg-sello text-papel mr-4 min-h-11 px-4"
            onClick={() => {
              retirar.mutate();
            }}
          >
            Confirmar retiro
          </button>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              setConfirmando(false);
            }}
          >
            Mejor no
          </button>
        </>
      ) : (
        <button
          type="button"
          className="text-sello mt-3 min-h-11 underline"
          onClick={() => {
            setConfirmando(true);
          }}
        >
          Retirar mi aporte
        </button>
      )}
      {retirar.isError ? (
        <p role="alert" className="text-sello mt-3">
          {retirar.error.message}
        </p>
      ) : null}
    </section>
  );
}
