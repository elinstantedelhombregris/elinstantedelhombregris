import { useEffect, useRef } from 'react';
import { Link } from 'wouter';

import { FraseCampana, type CampanaDeAporte } from './FraseCampana';

import type { ReciboParticipacion } from '~/lib/queries/participacion';

import {
  ACCION_DE_PILA,
  ENLACE_DE_TEXTO,
  PILA_DE_ACCIONES,
} from '~/components/participacion/constantes';
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
      {/* Una acción principal y a lo sumo tres secundarias, todas del mismo ancho. Con una
          campaña, seguirla ocupa el tercer lugar y la Radiografía pasa a los enlaces. */}
      <div role="group" aria-label="Qué querés hacer ahora" className={PILA_DE_ACCIONES}>
        <EnlaceAccion href={`/senal/${recibo.idPublico}`} className={ACCION_DE_PILA}>
          Ver y gestionar mi aporte
        </EnlaceAccion>
        {sumarOtro ? (
          <BotonAccion type="button" tono="papel" className={ACCION_DE_PILA} onClick={sumarOtro}>
            Sumar otro aporte
          </BotonAccion>
        ) : null}
        {alMapa ? (
          <BotonAccion type="button" tono="papel" className={ACCION_DE_PILA} onClick={alMapa}>
            Verlo en el mapa
          </BotonAccion>
        ) : (
          <EnlaceAccion secundario href="/el-mapa#instrumento" className={ACCION_DE_PILA}>
            Verlo en el mapa
          </EnlaceAccion>
        )}
        {campana ? (
          <Seguir tipo="campana" objeto={campana.id} className={ACCION_DE_PILA} />
        ) : (
          <EnlaceAccion secundario href="/la-radiografia" className={ACCION_DE_PILA}>
            Ver la Radiografía
          </EnlaceAccion>
        )}
      </div>
      <ul aria-label="Otros enlaces" className="mt-4 flex flex-wrap gap-x-5">
        {campana ? (
          <li>
            <Link href="/la-radiografia" className={ENLACE_DE_TEXTO}>
              Ver la Radiografía
            </Link>
          </li>
        ) : null}
        <li>
          <Link href={`/fichas/nueva?senal=${recibo.idPublico}`} className={ENLACE_DE_TEXTO}>
            Proponer un futuro
          </Link>
        </li>
        <li>
          {auth.user ? (
            <Link href="/mi-espacio" className={ENLACE_DE_TEXTO}>
              Volver a mi espacio
            </Link>
          ) : (
            <Link href={hrefIngresar('/mi-espacio')} className={ENLACE_DE_TEXTO}>
              Guardar en mi espacio
            </Link>
          )}
        </li>
        {campana ? (
          <li>
            <Link
              href={`/campanas/${campana.slug}?edicion=${campana.revision}`}
              className={ENLACE_DE_TEXTO}
            >
              Ver la campaña y su devolución
            </Link>
          </li>
        ) : null}
      </ul>
      {!auth.user ? (
        <p className="mt-4 text-sm leading-relaxed">
          Este navegador conserva la autoría. Después de ingresar podés elegir vincularla con tu
          cuenta. Si borrás el identificador antes de hacerlo, no podemos prometer recuperarla.
        </p>
      ) : null}
      {campana ? null : (
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
