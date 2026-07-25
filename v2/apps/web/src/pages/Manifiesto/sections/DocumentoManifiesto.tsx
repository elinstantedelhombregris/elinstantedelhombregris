import { useEffect, useRef, useState } from 'react';

import { MANIFIESTO, PARTE_COUNT, fechaLarga } from '../manifiesto-data';

import { SelloLeidoEntero } from './SelloLeidoEntero';
import { SumarioManifiesto } from './SumarioManifiesto';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * El documento (spec 3.3). Cuerpo VERBATIM: la apertura y cada parte salen
 * del parser, que reconstruye el archivo carácter por carácter. El H1 es el
 * `# ` del propio texto, izado para que corra el rito §10.1 sin duplicar
 * título (la diferencia con `PlanDetail`). El bloque de firma —último
 * elemento del artículo— dispara el sello LEÍDO ENTERO (§10.5) al entrar en
 * viewport al 60%: mismo `IntersectionObserver` que el `VISTO` del mandato
 * (`ElMandatoVivo/sections/DocumentoMandato.tsx:18-31`), desconectado al
 * primer disparo y al desmontar. El sello vive fuera del `<article>` para
 * no imprimirse con el documento.
 */
export function DocumentoManifiesto() {
  const [visto, setVisto] = useState(false);
  const firmaRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const firma = firmaRef.current;
    if (!firma || visto) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisto(true);
      },
      { threshold: 0.6 },
    );
    observer.observe(firma);
    return () => {
      observer.disconnect();
    };
  }, [visto]);

  return (
    <>
      <article className="edicion-impresa">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
        <Kicker className="mb-4 mt-10">
          El manifiesto · documento fundacional · {PARTE_COUNT} partes
        </Kicker>
        <h1
          aria-label={MANIFIESTO.titulo}
          className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
        >
          <RitoTinta lineas={[MANIFIESTO.titulo]} />
        </h1>

        <MdxPapel raw={MANIFIESTO.apertura} className="max-w-[680px] [&>*:first-child]:mt-0" />

        <SumarioManifiesto />

        {MANIFIESTO.partes.map((parte) => (
          <section key={parte.id} id={parte.id} className="border-tinta mt-12 scroll-mt-20 border-t-2 pt-[22px]">
            <h2 className="font-anton riso-hover mb-5 text-pretty text-[clamp(26px,3.4vw,40px)] leading-[1.05]">
              {parte.encabezado}
            </h2>
            <MdxPapel raw={parte.cuerpo} className="max-w-[680px] [&>*:first-child]:mt-0" />
          </section>
        ))}

        <p ref={firmaRef} className="font-space text-tinta-50 mt-9 text-xs">
          — El hombre gris
        </p>
      </article>

      {visto ? <SelloLeidoEntero /> : null}
    </>
  );
}
