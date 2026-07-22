import { COMO_SE_USA } from '../el-mandato-data';

/**
 * § 5 de la spec — «Cómo se usa»: grilla de 3 sobre el mecanismo del
 * documento (se firma / se mide / se recuerda). Prosa de mecanismo, sin
 * cifras ni promesas de features que no existen — mismo patrón visual que
 * `ComoSeEscribe` (§2), sin heading visible (no hay «encabezado de sección»
 * en la spec para esta grilla, a diferencia de §3/§4).
 */
export function ComoSeUsa() {
  return (
    <section aria-labelledby="como-se-usa-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5">
      <h2 id="como-se-usa-titulo" className="sr-only">
        Cómo se usa el mandato
      </h2>

      <div className="bg-oscuro-borde grid grid-cols-3 gap-px max-[960px]:grid-cols-1">
        {COMO_SE_USA.map((paso) => (
          <div key={paso.titulo} className="bg-tinta flex flex-col gap-3 p-8">
            <h3 className="font-anton text-violeta-claro text-[22px] leading-tight">{paso.titulo}</h3>
            <p className="font-archivo text-oscuro-secundario text-[14px] leading-relaxed">{paso.cuerpo}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
