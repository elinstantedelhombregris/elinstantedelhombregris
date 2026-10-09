import { Link } from 'wouter';

import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { EnlaceAccion, Nota } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';
import { useAuth } from '~/lib/auth/use-auth';

export function Recibo({
  recibo,
  campanaId,
  textoVisible,
  territorio = 'Argentina',
}: {
  recibo: ReciboParticipacion;
  campanaId: string | null;
  textoVisible: boolean;
  territorio?: string;
}) {
  const auth = useAuth();
  return (
    <section aria-labelledby="recibo-titulo">
      <p className="font-space text-verde text-xs uppercase">Tu voz quedó registrada</p>
      <h2 id="recibo-titulo" className="font-anton mt-3 text-4xl">
        Ahora tiene un lugar
        <br />y una forma de volver.
      </h2>
      <p className="mt-5 max-w-[650px] leading-relaxed">
        Compartiste una posibilidad. Sigue siendo una voz tuya; todavía no constituye un acuerdo ni
        una promesa de nadie. Podés seguir el trabajo que nazca de ella.
      </p>
      <Nota>
        Identificador público: <span className="break-all">{recibo.idPublico}</span>
        <br />
        Ámbito: {territorio}. Precisión:{' '}
        {(
          {
            province: 'ámbito amplio, sin punto preciso',
            city: 'localidad',
            neighborhood: 'barrio',
            '100m': 'aproximadamente 100 metros',
            '500m': 'aproximadamente 500 metros',
          } as Record<string, string>
        )[recibo.precisionPublicada] ?? 'ubicación protegida'}
        .{' '}
        {textoVisible
          ? 'El texto puede leerse según el permiso que elegiste.'
          : 'El texto quedó reservado. La señal cuenta sin exponer tus palabras.'}
      </Nota>
      {recibo.avisos.length ? (
        <ul className="mb-5 space-y-2 text-sm">
          {recibo.avisos.map((aviso) => (
            <li key={aviso}>
              {aviso === 'No llegó ni calle, ni localidad, ni provincia, ni punto.'
                ? 'Tu voz se compartió sin una ubicación puntual. No le asignamos un domicilio.'
                : aviso}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <EnlaceAccion href={`/senal/${recibo.idPublico}`}>Ver y gestionar mi aporte</EnlaceAccion>
        <EnlaceAccion secundario href={`/fichas/nueva?senal=${recibo.idPublico}`}>
          Proponer un futuro
        </EnlaceAccion>
        {auth.user ? (
          <EnlaceAccion secundario href="/mi-espacio">
            Volver a mi espacio
          </EnlaceAccion>
        ) : (
          <EnlaceAccion secundario href="/ingresar?volver=%2Fmi-espacio">
            Guardar en mi espacio
          </EnlaceAccion>
        )}
      </div>
      {!auth.user ? (
        <p className="mt-4 text-sm leading-relaxed">
          Este navegador conserva la autoría. Después de ingresar podés elegir vincularla con tu
          cuenta. Si borrás el identificador antes de hacerlo, no podemos prometer recuperarla.
        </p>
      ) : null}
      {campanaId ? (
        <div className="mt-7">
          <Seguir tipo="campana" objeto={campanaId} />
          <Link
            href={`/campanas/${campanaId}${recibo.contexto?.edicion ? `?edicion=${recibo.contexto.edicion}` : ''}`}
            className="text-violeta mt-3 inline-flex min-h-11 items-center underline"
          >
            Ver el proceso y su devolución
          </Link>
        </div>
      ) : (
        <p className="mt-7">
          Podés{' '}
          <Link href="/campanas" className="text-violeta underline">
            encontrar una campaña
          </Link>{' '}
          donde seguir diseñando con otros.
        </p>
      )}
      <p className="mt-8 text-sm leading-relaxed">
        Si todavía no hay otras voces relacionadas, necesitamos escucharlas. El encuentro se
        construye; no vamos a inventarlo para llenar la pantalla.
      </p>
    </section>
  );
}
