import { LARGO_LINEA, NOMBRE_DEL_DATO, buscarDatosPersonales } from '@v2/shared';
import { useMemo, useRef, useState } from 'react';

import { nombreCorto } from '../comun/lugar';

import {
  SIN_PROVINCIA,
  problemaDeLinea,
  provinciaIdDe,
  temaSugeridoDe,
  useTemas,
  type AporteEnCurso,
} from './datos';
import { Parecidos } from './Parecidos';
import { CAMPO_PAPEL, CHIP, CHIP_ELEGIDO, ENLACE_VOLVER, ROTULO, TituloDePantalla } from './piezas';

import type { DatoPersonal } from '@v2/shared';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useProvincias } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

/**
 * La segunda pantalla: el aporte en pocas palabras, como lo van a ver los demás
 * (spec §3). Viene con la primera oración de lo que se escribió, sin la fórmula de
 * arranque; el tema se sugiere y la persona lo confirma; la provincia va en una lista
 * nativa. Los datos personales se marcan mientras se escribe.
 */
export function PantallaLinea({
  aporte,
  cambiar,
  volver,
  seguir,
}: {
  aporte: AporteEnCurso;
  cambiar: (parcial: Partial<AporteEnCurso>) => void;
  volver: () => void;
  seguir: () => void;
}) {
  const temas = useTemas();
  const provincias = useProvincias();
  const [error, setError] = useState('');
  const campo = useRef<HTMLTextAreaElement>(null);
  const selector = useRef<HTMLSelectElement>(null);
  const largo = aporte.linea.trim().length;
  const sugerido = useMemo(
    () => temaSugeridoDe(aporte.texto, temas.data ?? []),
    [aporte.texto, temas.data],
  );
  const ordenadas = useMemo(
    () => [...(provincias.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [provincias.data],
  );
  const enLinea = buscarDatosPersonales(aporte.linea)[0];
  const enTexto = enLinea ? undefined : buscarDatosPersonales(aporte.texto)[0];

  const alSeguir = () => {
    const problema = problemaDeLinea(aporte);
    if (problema) {
      setError(problema.mensaje);
      (problema.en === 'provincia' ? selector.current : campo.current)?.focus();
      return;
    }
    seguir();
  };

  return (
    <>
      <button type="button" className={ENLACE_VOLVER} onClick={volver}>
        ← Volver a lo que escribí
      </button>
      <p className={ROTULO}>Imaginar · 2 de 3</p>
      <TituloDePantalla nivel={2}>Tu aporte, en una frase</TituloDePantalla>
      <p className="text-tinta-75 text-[15.5px] leading-relaxed">
        Así lo van a ver otras personas. Podés dejarlo como está o achicarlo.
      </p>
      <div className="flex flex-col gap-2">
        <label htmlFor="imaginar-linea" className={ROTULO}>
          Tu aporte
        </label>
        <textarea
          id="imaginar-linea"
          ref={campo}
          rows={3}
          maxLength={LARGO_LINEA + 60}
          aria-describedby="imaginar-contador"
          className={cn(CAMPO_PAPEL, 'resize-none text-lg')}
          value={aporte.linea}
          onChange={(e) => {
            cambiar({ linea: e.target.value, lineaTocada: true });
            setError('');
          }}
        />
        <p
          id="imaginar-contador"
          aria-live="polite"
          className={cn(
            'font-space text-right text-xs tabular-nums',
            largo > LARGO_LINEA ? 'text-sello' : 'text-tinta-50',
          )}
        >
          {largo} de {LARGO_LINEA}
        </p>
        {enLinea ? (
          <AvisoDato dato={enLinea} texto={aporte.linea}>
            Sacalo antes de publicar: el aporte se ve en público.
          </AvisoDato>
        ) : null}
        {enTexto ? (
          <AvisoDato dato={enTexto} texto={aporte.texto} primero>
            También se publica: volvé y sacalo ahí.
          </AvisoDato>
        ) : null}
      </div>
      <Parecidos texto={aporte.linea} provinciaId={provinciaIdDe(aporte.provincia)} />
      <div className="flex flex-col gap-2">
        <p id="imaginar-temas" className={ROTULO}>
          Tema, si querés nombrarlo
        </p>
        {sugerido && aporte.tema === null ? (
          <p className="text-tinta-75 text-sm leading-relaxed">
            ¿Es sobre <strong>{sugerido.etiqueta.toLocaleLowerCase('es')}</strong>? Tocalo para
            confirmar, o elegí otro.
          </p>
        ) : null}
        <div role="group" aria-labelledby="imaginar-temas" className="flex flex-wrap gap-2">
          {(temas.data ?? []).map((t) => (
            <button
              key={t.clave}
              type="button"
              aria-pressed={aporte.tema === t.clave}
              className={cn(
                CHIP,
                sugerido?.clave === t.clave &&
                  aporte.tema === null &&
                  'border-violeta border-dashed',
                aporte.tema === t.clave && CHIP_ELEGIDO,
              )}
              onClick={() => {
                cambiar({ tema: aporte.tema === t.clave ? null : t.clave });
              }}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
        {temas.isError ? (
          <p className="text-tinta-50 text-sm">
            No pudimos leer los temas. Podés seguir sin elegir uno.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="imaginar-provincia" className={ROTULO}>
          ¿De qué provincia sos?
        </label>
        <select
          id="imaginar-provincia"
          ref={selector}
          className={cn(CAMPO_PAPEL, 'min-h-12 py-2.5 text-base')}
          value={aporte.provincia}
          onChange={(e) => {
            cambiar({ provincia: e.target.value });
            setError('');
          }}
        >
          <option value="">Elegí tu provincia</option>
          {ordenadas.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {nombreCorto(p.name)}
            </option>
          ))}
          <option value={SIN_PROVINCIA}>Prefiero no decirlo</option>
        </select>
        <p className="text-tinta-50 text-sm leading-relaxed">
          Se ve en tu aporte («Alguien de Salta imagina»). Sirve para saber si lo que se comparte se
          comparte en todo el país.
        </p>
        {provincias.isError ? (
          <p className="text-tinta-50 text-sm">
            No pudimos leer la lista de provincias. Podés elegir «Prefiero no decirlo».
          </p>
        ) : null}
      </div>
      <ErrorOperacion mensaje={error} className="my-0" />
      <BotonAccion type="button" className="w-full justify-center" onClick={alSeguir}>
        Seguir
      </BotonAccion>
    </>
  );
}

/** «Esto parece un teléfono: 11 1234-5678.» El tramo va marcado. */
function AvisoDato({
  dato,
  texto,
  primero = false,
  children,
}: {
  dato: DatoPersonal;
  texto: string;
  /** El dato está en lo que se escribió en la primera pantalla, no acá. */
  primero?: boolean;
  children: string;
}) {
  return (
    <p role="status" className="border-sello text-sello border-[1.5px] px-3 py-2.5 text-[14.5px]">
      {primero ? 'Lo que escribiste primero tiene lo que parece ' : 'Esto parece '}
      {NOMBRE_DEL_DATO[dato.tipo]}:{' '}
      <mark className="bg-sello/20 text-sello">{texto.slice(dato.desde, dato.hasta)}</mark>.{' '}
      {children}
    </p>
  );
}
