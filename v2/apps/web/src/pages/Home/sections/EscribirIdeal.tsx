import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';

import { IMAGINAR_HREF, MIRAR_HREF } from '~/components/papel/papel-nav';
import { BotonPapel, Kicker } from '~/components/papel/primitives';
import { CAMPO } from '~/components/participacion/constantes';
import { despertar } from '~/lib/despertar';
import { LIMITE_APORTE } from '~/lib/participacion/texto-aporte';
import { guardarTextoEnCurso } from '~/lib/participacion/texto-en-curso';
import { useAutoAltura } from '~/lib/participacion/useAutoAltura';
import { cn } from '~/lib/utils';

const AVISO_VACIO = 'Escribí aunque sea una frase para seguir.';

/**
 * La primera pantalla de Imaginar, en la portada (spec 2026-10-19 §7, entrega 3).
 *
 * Antes la portada hacía la pregunta y mandaba a otra página a contestarla. Ahora
 * se escribe acá: «Seguir» deja el texto en memoria (`guardarTextoEnCurso`, ni en
 * la dirección ni en el dispositivo) y abre Imaginar, que arranca en su segunda
 * pantalla cuando lo encuentra.
 *
 * La pregunta es la etiqueta del campo y, a la vez, el título de la sección: un
 * lector de pantalla la oye al llegar al campo, y quien navega por títulos la
 * encuentra igual. Es la constante de `@v2/shared`, la misma que leen Imaginar y
 * las reglas de la campaña (D-134).
 */
export function EscribirIdeal() {
  const id = useId();
  const [, navegar] = useLocation();
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(campo, texto);

  const idCampo = `${id}-campo`;
  const idPista = `${id}-pista`;
  const idAviso = `${id}-aviso`;

  const seguir = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (texto.trim() === '') {
      setAviso(true);
      campo.current?.focus();
      return;
    }
    guardarTextoEnCurso(texto.trim());
    // Escribir y seguir es la primera acción de verdad: el sitio se enciende acá (§10.7).
    despertar();
    navegar(IMAGINAR_HREF);
  };

  return (
    <form noValidate onSubmit={seguir} aria-labelledby={`${id}-titulo`}>
      <Kicker className="mb-4">El primer trazo es tuyo</Kicker>
      <h2
        id={`${id}-titulo`}
        className="font-anton max-w-[450px] text-[clamp(27px,2.7vw,38px)] leading-[1.12]"
      >
        <label htmlFor={idCampo}>{PREGUNTA_MI_ARGENTINA_IDEAL}</label>
      </h2>
      <p id={idPista} className="text-tinta-75 mt-3 max-w-[410px] text-pretty text-base">
        Una frase alcanza para empezar.
      </p>
      <textarea
        ref={campo}
        id={idCampo}
        name="ideal"
        rows={4}
        maxLength={LIMITE_APORTE}
        placeholder="En mi Argentina ideal…"
        value={texto}
        aria-invalid={aviso || undefined}
        aria-describedby={aviso ? `${idPista} ${idAviso}` : idPista}
        onChange={(evento) => {
          setTexto(evento.target.value);
          if (aviso) setAviso(false);
        }}
        className={cn(
          CAMPO,
          'placeholder:text-tinta-50 mt-4 max-h-[50vh] min-h-32 resize-none text-[17px]',
          aviso && 'border-sello',
        )}
      />
      {aviso ? (
        <p id={idAviso} role="alert" className="text-sello mt-2 text-sm">
          {AVISO_VACIO}
        </p>
      ) : null}
      <BotonPapel type="submit" variant="violeta" className="mt-4 motion-reduce:transform-none">
        Seguir
      </BotonPapel>
      <p className="mt-2">
        <Link
          href={MIRAR_HREF}
          className="font-space text-tinta-75 inline-flex min-h-11 items-center text-xs underline underline-offset-4"
        >
          O empezá mirando lo que imaginan otros
        </Link>
      </p>
      <p className="font-space text-tinta-75 text-xs">No hace falta cuenta.</p>
    </form>
  );
}
