import { useMemo } from 'react';
import { Link } from 'wouter';

import { FraseCampana } from '../../Imaginar/FraseCampana';
import { Compartir } from '../comun/Compartir';
import { deDonde } from '../comun/lugar';

import { ROTULO, TituloDePantalla } from './piezas';

import type { Publicado } from './usePublicarIdeal';
import type { ContenidoDeImagen } from '../comun/imagen-para-compartir';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';

/**
 * El cierre (spec §3): el aporte quedó publicado, se puede compartir como imagen y la
 * acción principal lleva a mirar lo que imaginan otros. El recibo de siempre queda
 * plegado. Con el texto reservado no se ofrece compartir: no hay nada que mostrar.
 */
export function Listo({
  publicado,
  volverAMirar,
  entraAMirar,
  provincia,
  tema,
}: {
  publicado: Publicado;
  /** Se llegó desde la tarjeta de escribir de Mirar: se vuelve ahí. */
  volverAMirar: boolean;
  entraAMirar: boolean;
  provincia: string | null;
  tema: string | null;
}) {
  const auth = useAuth();
  const { recibo, campana, linea, cedio } = publicado;
  const contenido = useMemo<ContenidoDeImagen>(
    () => ({
      kicker: `Alguien de ${deDonde(provincia)} imagina`,
      texto: linea,
      pie: tema ?? 'Mi Argentina ideal',
      llamado: '¿Y vos?',
      bajada: 'Sumá el tuyo en Mi Argentina ideal',
    }),
    [provincia, linea, tema],
  );
  const edicion = recibo.contexto?.edicion ?? campana?.revision ?? null;

  return (
    <>
      <p className={ROTULO}>Listo</p>
      <TituloDePantalla nivel={2}>Tu aporte quedó publicado.</TituloDePantalla>
      {recibo.yaExistia ? (
        <p role="status" className="text-violeta text-sm">
          Ya habíamos recibido este aporte; no lo duplicamos.
        </p>
      ) : null}
      <p className="text-tinta-75 text-[15.5px] leading-relaxed">
        {!cedio
          ? !campana
            ? 'Quedó publicado con el texto reservado: no se muestra en público. Si cambiás de idea, lo podés abrir desde tu recibo.'
            : entraAMirar
              ? 'Cuenta en la campaña con el texto reservado, así que no entra a Mirar. Si cambiás de idea, lo podés abrir desde tu recibo.'
              : 'Cuenta en la campaña con el texto reservado: no se muestra en público. Si cambiás de idea, lo podés abrir desde tu recibo.'
          : entraAMirar
            ? 'Ya está en Mirar, donde otras personas lo ven de a uno y dicen si también lo quieren.'
            : 'Ya se puede leer en el sitio.'}
      </p>
      {cedio ? (
        <Compartir
          contenido={contenido}
          enlace="/mi-argentina-ideal"
          texto={`«${linea}» ¿Y vos? Sumá el tuyo en Mi Argentina ideal.`}
          rotulo="Compartir mi aporte"
        />
      ) : null}
      <EnlaceAccion
        href={
          volverAMirar ? '/mi-argentina-ideal/mirar' : '/mi-argentina-ideal/mirar?desde=imaginar'
        }
        className="w-full justify-center text-center"
      >
        {/* Espacio duro antes de la flecha: en el teléfono no queda sola en un renglón. */}
        {volverAMirar ? 'Seguir mirando →' : 'Ahora mirá lo que imaginan otros →'}
      </EnlaceAccion>
      <details className="border-papel-borde border-t pt-2">
        <summary className="text-tinta-75 inline-flex min-h-11 cursor-pointer items-center text-[15px] underline underline-offset-4">
          Tu recibo
        </summary>
        <div className="bg-papel-crudo border-papel-borde mt-2 flex flex-col gap-2 border px-4 py-3 text-[14.5px] leading-relaxed">
          <FraseCampana campana={campana} />
          {campana && edicion ? <p>Edición {edicion}.</p> : null}
          <p className="text-tinta-50 break-all text-sm">
            Identificador público: {recibo.idPublico}
          </p>
          <p className="text-tinta-50 text-sm">
            {cedio
              ? 'El texto se puede leer y citar sin tu nombre.'
              : 'El texto quedó reservado: el aporte cuenta sin mostrar tus palabras.'}{' '}
            Podés corregirlo o retirarlo mientras nadie lo haya contestado.
          </p>
          {!auth.user ? (
            <p className="text-tinta-50 text-sm">
              Este navegador conserva la autoría. Si ingresás, podés vincularla con tu cuenta.
            </p>
          ) : null}
          <Link
            href={`/senal/${recibo.idPublico}`}
            className="text-violeta inline-flex min-h-11 items-center underline"
          >
            Ver y gestionar mi aporte
          </Link>
        </div>
      </details>
    </>
  );
}
