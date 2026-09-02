import { useEffect, useRef, useState } from 'react';

import { BotonPapel } from './primitives';


import { ApiError } from '~/lib/api';
import { useDejarFalta, type ContextoDeFalta, type SuperficieDeFalta } from '~/lib/queries/faltas';
import {
  guardarLlave,
  LARGO_MAXIMO_CUERPO,
  LARGO_MAXIMO_TITULO,
  SUPERFICIES,
} from '~/pages/LoQueFalta/lo-que-falta-data';

export interface PanelDejarFaltaProps {
  abierto: boolean;
  onCerrar: () => void;
  /**
   * La superficie con la que abre. La boca que lo monta ya sabe de qué está
   * hablando quien lo abrió: desde el mapa es `el-mapa`, desde el pie es lo
   * que la ruta diga. Se puede cambiar, pero no arranca en blanco.
   */
  superficieInicial?: SuperficieDeFalta;
  /**
   * Lo que la boca adjunta. El panel NO lo lee del entorno: se lo pasan. Así
   * el mapa puede mandar su encuadre y el pie su ruta sin que este componente
   * sepa nada de ninguno de los dos.
   */
  contexto?: ContextoDeFalta;
  /** Se llama con el id público cuando la falta entró. */
  onDejada?: (idPublico: string) => void;
}

/**
 * Dejar lo que falta — el panel compartido por las cuatro bocas del canal
 * (`docs/specs/2026-08-12-lo-que-falta.md` §2.8).
 *
 * Tres campos y nada más: de qué parte hablás, la línea, y el detalle. No pide
 * nombre, no pide mail, no pide cuenta. Lo que vuelve es un número público y
 * una llave que se guarda en este navegador y en ningún otro lado.
 *
 * Lo que se publica se publica **al instante** (§2.2), y el panel lo dice
 * antes de que alguien escriba, no después.
 */
export function PanelDejarFalta({
  abierto,
  onCerrar,
  superficieInicial = 'la-plataforma',
  contexto,
  onDejada,
}: PanelDejarFaltaProps) {
  const [superficie, setSuperficie] = useState<SuperficieDeFalta>(superficieInicial);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [dejada, setDejada] = useState<{ idPublico: string; url: string } | null>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const primerCampo = useRef<HTMLInputElement>(null);

  const mutacion = useDejarFalta();

  useEffect(() => {
    if (abierto) setSuperficie(superficieInicial);
  }, [abierto, superficieInicial]);

  useEffect(() => {
    if (!abierto) return;
    primerCampo.current?.focus();

    // El registro detrás mide 8.000 px de alto. Sin esto, la rueda del mouse
    // sobre el panel arrastra la página de atrás y quien está escribiendo
    // pierde el lugar al que iba a volver.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener('keydown', alTeclado);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const guia = SUPERFICIES.find((s) => s.valor === superficie)?.guia ?? '';
  const tituloListo = titulo.trim().length >= 3;
  const cuerpoListo = cuerpo.trim().length >= 10;
  const puedeMandar = tituloListo && cuerpoListo && !mutacion.isPending;

  const cerrarYLimpiar = () => {
    setTitulo('');
    setCuerpo('');
    setDejada(null);
    mutacion.reset();
    onCerrar();
  };

  const mandar = () => {
    if (!puedeMandar) return;
    mutacion.mutate(
      {
        superficie,
        titulo: titulo.trim(),
        cuerpo: cuerpo.trim(),
        ...(contexto ? { contexto } : {}),
      },
      {
        onSuccess: (resultado) => {
          // La llave vuelve una sola vez. Si no se guarda ahora, se perdió.
          guardarLlave(resultado.idPublico, resultado.llave);
          setDejada({ idPublico: resultado.idPublico, url: resultado.url });
          onDejada?.(resultado.idPublico);
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/70 p-0 min-[720px]:items-center min-[720px]:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarYLimpiar();
      }}
    >
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-label="Dejar lo que falta"
        className="bg-papel max-h-[92vh] w-full max-w-[680px] overflow-y-auto px-7 py-8 max-[560px]:px-5"
      >
        {dejada ? (
          <Recibo idPublico={dejada.idPublico} url={dejada.url} onCerrar={cerrarYLimpiar} />
        ) : (
          <>
            <div className="mb-6">
              <div className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
                Dejar lo que falta
              </div>
              <h2 className="font-anton mb-3 text-[clamp(26px,4vw,38px)] leading-[1.05]">
                ¿Qué le falta a esto?
              </h2>
              <p className="text-tinta-75 m-0 text-[15px] leading-relaxed">
                Se publica <strong>al instante</strong>, sin revisión previa, con un número propio y
                al lado de las deudas que ya tengo anotadas. No te pido nombre, ni mail, ni cuenta.
              </p>
            </div>

            <fieldset className="mb-6 border-0 p-0">
              <legend className="font-space text-tinta-50 mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
                ¿De qué parte hablás?
              </legend>
              <div className="flex flex-wrap gap-2">
                {SUPERFICIES.map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => {
                      setSuperficie(opcion.valor);
                    }}
                    aria-pressed={superficie === opcion.valor}
                    className={`font-space border px-[14px] py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
                      superficie === opcion.valor
                        ? 'bg-violeta border-violeta text-papel'
                        : 'border-tinta text-tinta hover:bg-papel-presionado'
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
              <p className="text-tinta-50 mt-2.5 text-[13px] leading-snug">{guia}</p>
            </fieldset>

            <label className="mb-6 block">
              <span className="font-space text-tinta-50 mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]">
                En una línea
              </span>
              <input
                ref={primerCampo}
                type="text"
                value={titulo}
                maxLength={LARGO_MAXIMO_TITULO}
                onChange={(e) => {
                  setTitulo(e.target.value);
                }}
                placeholder="El mapa no dice cuántas señales quedaron afuera del recorte"
                className="border-tinta bg-papel text-tinta placeholder:text-tinta-30 w-full border px-4 py-3 text-[16px] outline-none focus:border-violeta"
              />
              <span className="font-space text-tinta-50 mt-1.5 block text-right text-[11px]">
                {String(titulo.length)}/{String(LARGO_MAXIMO_TITULO)}
              </span>
            </label>

            <label className="mb-6 block">
              <span className="font-space text-tinta-50 mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]">
                Contámelo
              </span>
              <textarea
                value={cuerpo}
                maxLength={LARGO_MAXIMO_CUERPO}
                rows={6}
                onChange={(e) => {
                  setCuerpo(e.target.value);
                }}
                placeholder="Qué pasó, qué esperabas, y por qué te parece que importa."
                className="border-tinta bg-papel text-tinta placeholder:text-tinta-30 w-full resize-y border px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-violeta"
              />
              <span className="font-space text-tinta-50 mt-1.5 block text-right text-[11px]">
                {String(cuerpo.length)}/{String(LARGO_MAXIMO_CUERPO)}
              </span>
            </label>

            {contexto?.encuadre ? (
              <p className="text-tinta-50 mb-6 text-[13px] leading-snug">
                Va con el encuadre del mapa que estabas mirando
                {contexto.capa ? ` y la capa «${contexto.capa}»` : ''}. Sin nada tuyo.
              </p>
            ) : null}

            {mutacion.isError ? (
              <p className="text-sello mb-5 text-[14px] leading-snug" role="alert">
                {mutacion.error instanceof ApiError
                  ? mutacion.error.message
                  : 'No se pudo dejar. Probá de nuevo en un momento.'}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <BotonPapel variant="violeta" onClick={mandar} disabled={!puedeMandar}>
                {mutacion.isPending ? 'Dejando…' : 'Dejarla'}
              </BotonPapel>
              <BotonPapel variant="fantasma" onClick={cerrarYLimpiar}>
                Cancelar
              </BotonPapel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * El recibo. Es la única vez que la llave existe del lado de quien la dejó —el
 * servidor guarda su hash— así que acá se dice qué es y qué pasa si se pierde.
 */
function Recibo({
  idPublico,
  url,
  onCerrar,
}: {
  idPublico: string;
  url: string;
  onCerrar: () => void;
}) {
  return (
    <div>
      <div className="font-space text-verde mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
        Quedó
      </div>
      <h2 className="font-anton mb-4 text-[clamp(26px,4vw,38px)] leading-[1.05]">
        Es la {idPublico}.
      </h2>
      <p className="text-tinta-75 mb-4 text-[15px] leading-relaxed">
        Ya está publicada, con ese número, en el registro. Cuando la mire vas a ver la respuesta en
        su ficha — y si no va a ir, va a decir por qué.
      </p>
      <p className="text-tinta-50 mb-6 text-[14px] leading-relaxed">
        La llave para retirarla quedó guardada en este navegador. No la tengo yo y no hay forma de
        recuperarla: si limpiás el navegador, la falta sigue pública y deja de ser tuya.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <BotonPapel variant="violeta" asChild>
          <a href={url}>Ver la ficha</a>
        </BotonPapel>
        <BotonPapel variant="fantasma" onClick={onCerrar}>
          Cerrar
        </BotonPapel>
      </div>
    </div>
  );
}
