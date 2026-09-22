import { useState } from 'react';

import { useRetirarSenal } from '~/lib/queries/senales';

export function RetirarAporte({ id }: { id: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const retirar = useRetirarSenal(id);
  return (
    <section className="mt-8 border-t pt-6" aria-label="Administrar mi aporte">
      <p className="text-sm">
        Este navegador sabe que la escribiste vos. Si borrás su identificador, ya no vamos a poder
        reconocerla.
      </p>
      {confirmando ? (
        <>
          <p className="my-3">
            El texto deja de mostrarse y la voz sale de todas las cuentas del mapa. Lo que otros ya
            descargaron no se puede recuperar.
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
          Retirar mi voz
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
