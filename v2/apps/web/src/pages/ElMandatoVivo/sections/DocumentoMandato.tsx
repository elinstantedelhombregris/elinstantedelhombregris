import { useEffect, useRef, useState } from 'react';

import { DocumentoSecciones } from './DocumentoSecciones';

import { BotonPapel, Sello } from '~/components/papel/primitives';
import { useMandatoDocumento } from '~/lib/queries/mandato';
import { cuantos } from '~/lib/vocabulario';

const ENCABEZADO_SECCION = 'Consulta de aportes · lectura agregada';

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
      <section
        aria-label={ENCABEZADO_SECCION}
        className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5"
      >
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
      <section
        aria-label={ENCABEZADO_SECCION}
        className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5"
      >
        <h2 className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
          {ENCABEZADO_SECCION}
        </h2>
        <p className="font-archivo text-oscuro-secundario text-[15px]">
          No pudimos cargar esto. Probá de nuevo en un rato.
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
  const fecha = new Date(data.generadoEl).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      aria-labelledby="documento-titulo"
      className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5"
    >
      <h2 className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
        {ENCABEZADO_SECCION}
      </h2>

      <div className="bg-papel text-tinta relative p-[52px_56px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6">
        {/* El sello va EN el flujo, a la derecha de la fecha y debajo de ella cuando
            no entra (flex-wrap). Antes era absoluto y entre 561 y 960 px se
            encimaba con la línea de la fecha. Y no es rojo: el rojo es de los
            ejemplos, y esto es la lectura real. */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
            Revisión continua · {fecha} ·{' '}
            {data.voces.total >= 1
              ? cuantos(data.voces.total, 'aporte', 'aportes')
              : 'todavía sin aportes'}
          </p>
          <Sello color="violeta" rotate={3}>
            Consulta pública
          </Sello>
        </div>
        <h2
          id="documento-titulo"
          className="font-anton mt-2 text-[clamp(30px,4.4vw,52px)] leading-none"
        >
          Aportes del mapa — Argentina
        </h2>
        <p className="text-tinta-50 mt-3 text-sm leading-relaxed">
          Cuenta los aportes con sus permisos actuales. No incluye los resultados de deliberación ni
          de pruebas que se leen arriba, en cada proceso. Ninguna cantidad de aportes convierte esta
          consulta en un acuerdo ni en representación nacional.
        </p>

        <div className="border-tinta mt-8 border-t-2 pt-6">
          <p className="font-space text-violeta mb-3 text-[11px] font-bold uppercase tracking-[0.12em]">
            Preámbulo
          </p>
          <p className="text-[16px] leading-relaxed">
            Este documento junta lo que la gente dejó en el mapa y dice de dónde sale cada cosa. Los
            números cuentan aportes, no personas: una misma persona puede dejar varios. Un hecho
            vale cuando alguien lo corrobora; un objetivo, cuando se discutió en un proceso que se
            pueda nombrar. No habla por todo el país ni obliga a nadie: es lo que está escrito hasta
            hoy, a la vista de cualquiera.
          </p>
        </div>

        <DocumentoSecciones data={data} firmaRef={firmaRef} />

        {visto ? (
          <div role="status" className="mt-6 flex items-center gap-4">
            <Sello color="verde" rotate={-4}>
              Visto
            </Sello>
            <span className="font-space text-tinta-50 text-[12px]">Lo leíste hasta el final.</span>
          </div>
        ) : null}

        <p className="font-space text-tinta-50 border-papel-borde mt-8 border-t pt-4 text-[10px] uppercase tracking-[0.1em]">
          Fuentes: {cuantos(data.voces.total, 'aporte', 'aportes')} del mapa ·{' '}
          {cuantos(data.senales.clasificadas, 'aporte clasificado', 'aportes clasificados')} ·{' '}
          {cuantos(data.propuestas.length, 'propuesta', 'propuestas', true)} · generado {fecha}
        </p>
      </div>
    </section>
  );
}
