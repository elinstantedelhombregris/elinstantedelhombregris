import { useEffect, useRef } from 'react';
import { Link } from 'wouter';

import { FraseCampana, type CampanaDeAporte } from './FraseCampana';

import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { BotonAccion, EnlaceAccion, Nota } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { etiquetaDePrecision, precisionValida } from '~/pages/ElMapa/lienzo/precision';

/** El servidor avisa esto en castellano técnico; acá se dice como lo diría una persona. */
const AVISO_SIN_UBICACION = 'No llegó ni calle, ni localidad, ni provincia, ni punto.';

export function Recibo({
  recibo,
  campana,
  textoVisible,
  territorio,
  otrosParecidos,
  alMapa,
  sumarOtro,
}: {
  recibo: ReciboParticipacion;
  /** La campaña en la que entró el aporte, o `null` si no entró en ninguna. */
  campana: CampanaDeAporte | null;
  textoVisible: boolean;
  /**
   * El lugar que eligió la persona. Sin él el aporte es de todo el país, y entonces no hay
   * precisión que decir: la que viene del servidor es el valor por defecto, no un dato.
   */
  territorio?: string;
  /** Cuántos aportes parecidos hay en ese lugar, si se sabe. Sin dato no se dice nada. */
  otrosParecidos?: number;
  /** Cierra el panel y vuelve al mapa; sin esto el enlace va a la página del mapa. */
  alMapa?: () => void;
  /** Vuelve a las tres preguntas con todo en blanco. */
  sumarOtro?: () => void;
}) {
  const auth = useAuth();
  const precision = etiquetaDePrecision(precisionValida(recibo.precisionPublicada));
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titulo.current?.focus();
  }, []);
  return (
    <section aria-labelledby="recibo-titulo">
      <h3
        id="recibo-titulo"
        ref={titulo}
        tabIndex={-1}
        className="font-anton text-3xl focus:outline-none"
      >
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
        Lugar: {territorio ?? 'todo el país'}.{territorio ? ` Precisión: ${precision}.` : ''}{' '}
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
          <BotonAccion type="button" onClick={alMapa}>
            Verlo en el mapa
          </BotonAccion>
        ) : (
          <EnlaceAccion href="/el-mapa#instrumento">Verlo en el mapa</EnlaceAccion>
        )}
        <EnlaceAccion secundario href="/la-radiografia">
          Ver la Radiografía
        </EnlaceAccion>
        {sumarOtro ? (
          <BotonAccion type="button" tono="papel" onClick={sumarOtro}>
            Sumar otro aporte
          </BotonAccion>
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
          <EnlaceAccion secundario href={hrefIngresar('/mi-espacio')}>
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
