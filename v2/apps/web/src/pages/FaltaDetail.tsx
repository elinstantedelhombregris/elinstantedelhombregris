import { Link, useRoute } from 'wouter';

import { FichaDeFalta } from './LoQueFalta/sections/FichaDeFalta';

import { BotonPapel } from '~/components/papel/primitives';
import { useFalta } from '~/lib/queries/faltas';

/**
 * La ficha de una falta — `/lo-que-falta/:idPublico`.
 *
 * Es la URL que vuelve en el recibo al dejar algo, y es el único canal de
 * vuelta que existe: no hay mail ni notificación que avisar. Por eso tiene que
 * poder abrirse fría, meses después, desde un link pegado en cualquier lado.
 */
export function FaltaDetail() {
  const [, params] = useRoute('/lo-que-falta/:idPublico');
  const idPublico = params?.idPublico;
  const { data: falta, isLoading, isError } = useFalta(idPublico);

  return (
    <main className="mx-auto max-w-[760px] px-10 py-[72px] max-[560px]:px-5">
      {isLoading ? <Aviso>Buscando…</Aviso> : null}

      {isError || (!isLoading && !falta) ? (
        <div className="py-16 text-center">
          <p className="text-tinta-50 mb-6 text-[16px] leading-relaxed">
            No hay ninguna falta con ese número.
          </p>
          <BotonPapel variant="fantasma" asChild>
            <Link href="/lo-que-falta">Ver el registro</Link>
          </BotonPapel>
        </div>
      ) : null}

      {falta ? <FichaDeFalta falta={falta} /> : null}
    </main>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-50 py-16 text-center text-[15px] leading-relaxed">{children}</p>;
}

export default FaltaDetail;
