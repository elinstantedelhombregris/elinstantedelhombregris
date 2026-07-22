import { Link } from 'wouter';

import { PASOS_CONVERGENCIA } from '../el-mandato-data';

/**
 * § 2 de la spec — «Cómo se escribe»: la convergencia (voz → clasificación →
 * documento) contada UNA sola vez en todo el sitio (directiva del master
 * plan — en v1 se contaba tres veces en tres páginas). El mapa y La idea
 * solo enlazan acá.
 */
export function ComoSeEscribe() {
  return (
    <section aria-labelledby="convergencia-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5">
      <h2 id="convergencia-titulo" className="sr-only">
        Cómo se escribe el mandato
      </h2>

      <div className="bg-oscuro-borde grid grid-cols-3 gap-px max-[960px]:grid-cols-1">
        {PASOS_CONVERGENCIA.map((paso) => (
          <div key={paso.num} className="bg-tinta flex flex-col gap-3 p-8">
            <span className="font-space text-violeta-claro text-[13px] font-bold tracking-[0.08em]">{paso.num}</span>
            <h3 className="font-anton text-oscuro-texto text-[22px] leading-tight">{paso.titulo}</h3>
            <p className="font-archivo text-oscuro-secundario text-[14px] leading-relaxed">{paso.cuerpo}</p>
            {'link' in paso ? (
              <Link href={paso.link.href} className="font-space text-papel text-[13px] font-semibold">
                {paso.link.etiqueta}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
