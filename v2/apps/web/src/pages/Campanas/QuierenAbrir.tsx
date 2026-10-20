import { UMBRAL_IMPULSO } from '@v2/shared';
import { Link } from 'wouter';

import { BarraImpulso } from './BarraImpulso';

import type { CampanaDeLista } from '~/lib/queries/campanas-propuestas';

import { ENLACE_DE_TEXTO, rotuloDeEstado } from '~/components/participacion/constantes';
import { EnlaceAccion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { PROPONER_HREF, useDatosDePropuesta } from '~/lib/queries/campanas-propuestas';

/**
 * «Quieren abrir»: las campañas que propuso alguien y todavía juntan gente o esperan la revisión,
 * con el botón para proponer otra (§11). Va después de las campañas abiertas.
 */
export function QuierenAbrir({ campanas }: { campanas: readonly CampanaDeLista[] }) {
  const auth = useAuth();
  return (
    <section aria-labelledby="quieren-abrir" className="border-tinta mt-12 border-t pt-8">
      <h2 id="quieren-abrir" className="font-anton text-3xl">
        Quieren abrir
      </h2>
      <p className="text-tinta-75 mt-4 max-w-[660px] leading-relaxed">
        Campañas que propuso alguien como vos. Para abrirse, cada una tiene que traer{' '}
        {UMBRAL_IMPULSO} personas nuevas a imaginar el país.
      </p>
      {campanas.length ? (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {campanas.map((c) => (
            <li key={c.id} className="min-w-0">
              <TarjetaQuiereAbrir campana={c} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5">Por ahora ninguna campaña está juntando gente.</p>
      )}
      <div className="mt-7">
        {auth.user ? (
          <EnlaceAccion href={PROPONER_HREF}>Proponer una campaña</EnlaceAccion>
        ) : (
          <EnlaceAccion href={hrefIngresar(PROPONER_HREF)}>Ingresá para proponer</EnlaceAccion>
        )}
      </div>
    </section>
  );
}

function TarjetaQuiereAbrir({ campana: c }: { campana: CampanaDeLista }) {
  const { impulso } = useDatosDePropuesta(c);
  return (
    <article className="border-tinta bg-papel flex h-full flex-col border p-6">
      <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.12em]">
        {rotuloDeEstado(c.estado)}
      </p>
      <h3 className="font-anton mt-4 text-2xl leading-[1.1]">
        <Link href={`/campanas/${c.slug}`} className="hover:text-violeta focus-visible:underline">
          {c.contrato.titulo}
        </Link>
      </h3>
      <p className="mt-4 leading-relaxed">{c.contrato.pregunta}</p>
      <p className="text-tinta-75 mt-4 text-sm">La impulsa {c.contrato.responsable}</p>
      {impulso ? <BarraImpulso impulso={impulso} className="mt-5 text-sm" /> : null}
      <Link href={`/campanas/${c.slug}`} className={`${ENLACE_DE_TEXTO} mt-auto pt-5 text-sm`}>
        Conocer esta campaña
      </Link>
    </article>
  );
}
