import { useEffect, useRef } from 'react';
import { Link } from 'wouter';

import { FraseCampana, type CampanaDeAporte } from './FraseCampana';

import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { EnlaceAccion, Nota } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';
import { useAuth } from '~/lib/auth/use-auth';

const PRECISION: Readonly<Record<string, string>> = {
  province: 'zona amplia, sin un punto preciso',
  city: 'localidad',
  neighborhood: 'barrio',
  '100m': 'aproximadamente 100 metros',
  '500m': 'aproximadamente 500 metros',
};

/** El servidor avisa esto en castellano técnico; acá se dice como lo diría una persona. */
const AVISO_SIN_UBICACION = 'No llegó ni calle, ni localidad, ni provincia, ni punto.';

export function Recibo({
  recibo,
  campana,
  textoVisible,
  territorio = 'todo el país',
  otrosParecidos,
  alMapa,
  sumarOtro,
}: {
  recibo: ReciboParticipacion;
  /** La campaña en la que entró el aporte, o `null` si no entró en ninguna. */
  campana: CampanaDeAporte | null;
  textoVisible: boolean;
  territorio?: string;
  /** Cuántos aportes parecidos hay en ese lugar, si se sabe. Sin dato no se dice nada. */
  otrosParecidos?: number;
  /** Cierra el panel y vuelve al mapa; sin esto el enlace va a la página del mapa. */
  alMapa?: () => void;
  /** Vuelve a las tres preguntas con todo en blanco. */
  sumarOtro?: () => void;
}) {
  const auth = useAuth();
  const precision = PRECISION[recibo.precisionPublicada] ?? 'ubicación protegida';
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titulo.current?.focus();
  }, []);
  return (
    <section aria-labelledby="recibo-titulo">
      <h3 id="recibo-titulo" ref={titulo} tabIndex={-1} className="font-anton text-3xl">
        Tu aporte quedó publicado.
      </h3>
      <p className="mt-3 max-w-[650px] leading-relaxed">
        Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.
      </p>
      {recibo.yaExistia ? (
        <p role="status" className="text-violeta mt-2 text-sm">
          Ya habíamos recibido este aporte; no lo duplicamos.
        </p>
      ) : null}
      <div className="mt-4 max-w-[650px] leading-relaxed">
        <FraseCampana campana={campana} />
      </div>
      <Nota>
        Identificador público: <span className="break-all">{recibo.idPublico}</span>
        <br />
        Lugar: {territorio}. Precisión: {precision}.{' '}
        {textoVisible
          ? 'El texto puede leerse según el permiso que elegiste.'
          : 'El texto quedó reservado: el aporte cuenta sin exponer tus palabras.'}
      </Nota>
      {recibo.avisos.length ? (
        <ul className="mb-5 space-y-2 text-sm">
          {recibo.avisos.map((aviso) => (
            <li key={aviso}>
              {aviso === AVISO_SIN_UBICACION
                ? 'Tu aporte se compartió sin una ubicación puntual. No le asignamos un domicilio.'
                : aviso}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {alMapa ? (
          <button
            type="button"
            onClick={alMapa}
            className="font-space bg-violeta text-papel border-tinta inline-flex min-h-11 items-center border px-5 py-3 text-xs uppercase tracking-wide"
          >
            Verlo en el mapa
          </button>
        ) : (
          <EnlaceAccion href="/el-mapa#instrumento">Verlo en el mapa</EnlaceAccion>
        )}
        <EnlaceAccion secundario href="/la-radiografia">
          Ver la Radiografía
        </EnlaceAccion>
        {sumarOtro ? (
          <button
            type="button"
            onClick={sumarOtro}
            className="font-space text-tinta border-tinta inline-flex min-h-11 items-center border px-5 py-3 text-xs uppercase tracking-wide"
          >
            Sumar otro aporte
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <EnlaceAccion secundario href={`/senal/${recibo.idPublico}`}>
          Ver y gestionar mi aporte
        </EnlaceAccion>
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
      {campana ? (
        <div className="mt-7">
          <Seguir tipo="campana" objeto={campana.id} />
          <Link
            href={`/campanas/${campana.slug}?edicion=${campana.revision}`}
            className="text-violeta mt-3 inline-flex min-h-11 items-center underline"
          >
            Ver la campaña y su devolución
          </Link>
        </div>
      ) : (
        <p className="mt-7 text-sm leading-relaxed">
          Para seguir con otras personas,{' '}
          <Link href="/campanas" className="text-violeta underline">
            mirá las campañas abiertas
          </Link>
          .
        </p>
      )}
      {otrosParecidos === 0 ? (
        <p className="mt-8 text-sm leading-relaxed">
          Todavía no hay otros aportes como el tuyo en este lugar.
        </p>
      ) : null}
    </section>
  );
}
