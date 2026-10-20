import { PUNTAS } from '@v2/shared';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { LARGO_MINIMO, LARGO_TEXTO } from './datos';
import { CHIP, CHIP_ELEGIDO, CAMPO_PAPEL, ROTULO, TituloDePantalla } from './piezas';

import type { ReactNode } from 'react';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useAutoAltura } from '~/lib/participacion/useAutoAltura';
import { cn } from '~/lib/utils';

const PISTA_INICIAL =
  'Una frase alcanza. Puede ser algo que quieras aprender, cuidar, crear o compartir.';

/**
 * La primera pantalla: la pregunta y un campo grande. Las puntas cambian la pista que
 * se ve, nunca escriben por la persona (spec §3). Una sola acción principal, «Seguir»;
 * guardar en el dispositivo es explícito y secundario.
 */
export function PantallaPregunta({
  pregunta,
  texto,
  cambiar,
  seguir,
  guardar,
  nota,
  error,
  destino,
}: {
  pregunta: string;
  texto: string;
  cambiar: (texto: string) => void;
  seguir: () => void;
  guardar: () => void;
  /** Lo que pasó con el borrador, si pasó algo. */
  nota: string;
  error: string;
  /** El aviso de la campaña del enlace, si el enlace nombró una. */
  destino: ReactNode;
}) {
  const [punta, setPunta] = useState<number | null>(null);
  const [falta, setFalta] = useState('');
  const campo = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(campo, texto);
  const pista = punta === null ? PISTA_INICIAL : (PUNTAS[punta]?.pista ?? PISTA_INICIAL);

  const alSeguir = () => {
    if (texto.trim().length < LARGO_MINIMO) {
      setFalta('Escribí aunque sea una frase para seguir.');
      campo.current?.focus();
      return;
    }
    seguir();
  };

  return (
    <>
      <p className={ROTULO}>Imaginar · 1 de 3</p>
      <TituloDePantalla nivel={1}>{pregunta}</TituloDePantalla>
      {destino}
      <div className="flex flex-col gap-2">
        <label htmlFor="imaginar-texto" className={ROTULO}>
          Lo que imaginás
        </label>
        <textarea
          id="imaginar-texto"
          ref={campo}
          rows={5}
          maxLength={LARGO_TEXTO}
          placeholder="En mi Argentina ideal…"
          aria-describedby="imaginar-pista"
          className={cn(CAMPO_PAPEL, 'min-h-[150px] resize-none text-lg')}
          value={texto}
          onChange={(e) => {
            cambiar(e.target.value);
            setFalta('');
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p id="imaginar-puntas" className={ROTULO}>
          Si no sabés por dónde empezar, pensá en
        </p>
        <div role="group" aria-labelledby="imaginar-puntas" className="flex flex-wrap gap-2">
          {PUNTAS.map((p, i) => (
            <button
              key={p.clave}
              type="button"
              aria-pressed={punta === i}
              className={cn(CHIP, punta === i && CHIP_ELEGIDO)}
              onClick={() => {
                setPunta(punta === i ? null : i);
                campo.current?.focus();
              }}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
        <p
          id="imaginar-pista"
          aria-live="polite"
          className="border-violeta text-tinta-75 min-h-8 border-l-[3px] py-1 pl-3 text-[15px] leading-relaxed"
        >
          {pista}
        </p>
      </div>
      <ErrorOperacion mensaje={falta || error} className="my-0" />
      <BotonAccion type="button" className="w-full justify-center" onClick={alSeguir}>
        Seguir
      </BotonAccion>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/mi-argentina-ideal/mirar"
          className="text-tinta-75 inline-flex min-h-11 items-center underline underline-offset-4"
        >
          O empezá mirando lo que imaginan otros
        </Link>
        <span className="text-tinta-50 text-sm">No hace falta cuenta.</span>
      </div>
      <div className="border-papel-borde flex flex-col gap-2 border-t pt-4">
        <BotonAccion type="button" tono="papel" className="self-start px-5 py-3" onClick={guardar}>
          Guardar borrador en este dispositivo
        </BotonAccion>
        <p className="text-tinta-50 text-sm leading-relaxed">
          Se guarda solo en este navegador: otras personas que lo usen podrían leerlo. Podés
          borrarlo desde Mi espacio.
        </p>
        {nota ? (
          <p role="status" className="text-verde text-sm">
            {nota}
          </p>
        ) : null}
      </div>
    </>
  );
}
