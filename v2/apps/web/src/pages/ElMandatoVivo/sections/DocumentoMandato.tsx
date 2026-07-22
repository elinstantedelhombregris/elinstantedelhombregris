import { useEffect, useRef, useState } from 'react';

import { UMBRAL_PORCENTAJE } from '../mandato-regimen';

import { DocumentoSecciones } from './DocumentoSecciones';

import { BotonPapel, Sello } from '~/components/papel/primitives';
import { useMandatoDocumento } from '~/lib/queries/mandato';

const ENCABEZADO_SECCION = 'El documento completo · la revisión vigente';

/** §4 de la spec — el documento papel sobre oscuro (única sombra del sistema). */
export function DocumentoMandato() {
  const documento = useMandatoDocumento();
  const [visto, setVisto] = useState(false);
  const firmaRef = useRef<HTMLDivElement>(null);

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
  }, [visto, documento.data]);

  if (documento.isLoading) {
    return (
      <section aria-label={ENCABEZADO_SECCION} className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
        <h2 className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
          {ENCABEZADO_SECCION}
        </h2>
        <div className="anim-pulso-papel bg-papel-presionado h-[420px] max-[560px]:h-[520px]" />
        <p className="font-space text-oscuro-meta mt-4 text-[11px] uppercase tracking-[0.12em]">
          Cargando — menos que un trámite.
        </p>
      </section>
    );
  }

  if (documento.isError) {
    return (
      <section aria-label={ENCABEZADO_SECCION} className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
        <h2 className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
          {ENCABEZADO_SECCION}
        </h2>
        <p className="font-archivo text-oscuro-secundario text-[15px]">
          Esto se rompió. Lo decimos porque publicamos todo.
        </p>
        <BotonPapel
          variant="fantasma"
          surface="oscuro"
          className="mt-5"
          onClick={() => {
            void documento.refetch();
          }}
        >
          Probar de nuevo ↺
        </BotonPapel>
      </section>
    );
  }

  const data = documento.data;
  if (!data) return null;
  const esEjemplo = data.voces.total < UMBRAL_PORCENTAJE;
  const fecha = new Date(data.generadoEl).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section aria-labelledby="documento-titulo" className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">{ENCABEZADO_SECCION}</h2>

      <div className="bg-papel text-tinta relative p-[52px_56px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6">
        {esEjemplo ? (
          <div className="absolute right-9 top-[30px]">
            <Sello color="rojo" rotate={6}>
              Ejemplo
            </Sello>
          </div>
        ) : null}

        <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
          Revisión continua · {fecha} ·{' '}
          {data.voces.total >= 1 ? `Exp. ${data.voces.total.toLocaleString('es-AR')} voces` : 'Exp. sin voces todavía'}
        </p>
        <h2 id="documento-titulo" className="font-anton mt-2 text-[clamp(30px,4.4vw,52px)] leading-none">
          Mandato ciudadano — Argentina
        </h2>
        {esEjemplo ? (
          <p className="font-space text-tinta-50 mt-3 text-[11px] uppercase tracking-[0.12em]">
            Con {data.voces.total.toLocaleString('es-AR')} voces esto es el formato del mandato, no el mandato. El de
            verdad se escribe con la tuya.
          </p>
        ) : null}

        <div className="border-tinta mt-8 border-t-2 pt-6">
          <p className="font-space text-violeta mb-3 text-[11px] font-bold uppercase tracking-[0.12em]">Preámbulo</p>
          <p className="text-[16px] leading-relaxed">
            Las voces reunidas en el mapa constituyen el presente mandato. No es un programa de gobierno ni una
            plataforma electoral: es el país ordenado por urgencia, redactado por su gente y de cumplimiento
            verificable. Quien aspire a administrar o ejecutar lo público en nombre de estas voces adhiere a este
            documento completo — o explica, en público, por qué no.
          </p>
        </div>

        <DocumentoSecciones data={data} firmaRef={firmaRef} />

        {visto ? (
          <div role="status" className="mt-6 flex items-center gap-4">
            <Sello color="verde" rotate={-4}>
              Visto
            </Sello>
            <span className="font-space text-tinta-50 text-[12px]">Documento auditado. Ahora sos testigo.</span>
          </div>
        ) : null}

        <p className="font-space text-tinta-30 border-papel-borde mt-8 border-t pt-4 text-[10px] uppercase tracking-[0.1em]">
          Fuentes: {data.voces.total.toLocaleString('es-AR')} voces del mapa ·{' '}
          {data.senales.clasificadas.toLocaleString('es-AR')} señales clasificadas ·{' '}
          {data.propuestas.length.toLocaleString('es-AR')} propuestas en votación · generado {fecha}
        </p>
      </div>
    </section>
  );
}
