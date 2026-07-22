import { Link } from 'wouter';

import { SIN_LIDER } from '../la-idea-data';

import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';
import { useVocesCount } from '~/lib/queries/analytics';

/**
 * Capítulo III — sin líder, sin partido, sin excusas. Sección oscura.
 * Única métrica viva de la página: el conteo real de voces; si carga o
 * falla, la línea no se renderiza (regla de datos reales de la spec).
 */
export function CapituloSinLider() {
  const vocesQuery = useVocesCount();

  return (
    <section id="capitulo-iii" className="bg-tinta text-papel">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker className="text-violeta-claro mb-5">Capítulo III</Kicker>
        <h2 className="font-anton riso-hover mb-10 text-[clamp(36px,4.6vw,64px)] leading-none">
          Nadie viene a salvarte.
          <br />
          Por diseño.
        </h2>

        <div className="bg-oscuro-borde border-oscuro-borde grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
          {SIN_LIDER.map((card) => (
            <div key={card.stamp} className="bg-tinta p-7">
              <Sello color="rojo" rotate={-3} className="mb-4 border-2 px-2.5 py-1.5 text-[11px]">
                {card.stamp}
              </Sello>
              <p className="text-oscuro-secundario text-pretty text-[15px] leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <div className="border-oscuro-borde mt-12 flex flex-wrap items-center justify-between gap-5 border-t pt-8">
          <div>
            <p className="text-oscuro-secundario max-w-[520px] text-pretty text-[17px] leading-relaxed">
              Si terminaste los tres capítulos esperando el nombre de un candidato, volvé al
              primero. Si en cambio te quedó algo por decir — hay un mapa esperándote.
            </p>
            {vocesQuery.data ? (
              <p className="font-space text-oscuro-meta mt-3 text-[11px] uppercase tracking-[0.12em]">
                {vocesQuery.data.total.toLocaleString('es-AR')} voces ya están en el mapa.
                Falta la tuya.
              </p>
            ) : null}
          </div>
          <BotonPapel asChild variant="violeta" surface="oscuro">
            <Link href="/el-mapa" onClick={despertar}>
              Dejar mi voz →
            </Link>
          </BotonPapel>
        </div>
      </div>
    </section>
  );
}
