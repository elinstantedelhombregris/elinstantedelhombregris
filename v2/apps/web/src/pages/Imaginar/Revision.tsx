import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';
import { ConsentimientoVoz } from '../ElMapa/sections/soltar/ConsentimientoVoz';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';
import type { ReactNode } from 'react';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { TemaDelAporte } from '~/components/participacion/TemaDelAporte';
import { LIMITE_APORTE } from '~/lib/participacion/texto-aporte';

interface Props {
  lectura: string;
  cambiar: (v: string) => void;
  /** El texto se recortó para entrar en el límite. */
  recortado?: boolean;
  tema: string;
  cambiarTema: (v: string) => void;
  lugar: LugarMapa | null;
  elegirLugar: (v: LugarMapa | null) => void;
  publicar: boolean;
  cede: boolean;
  setPublicar: (v: boolean) => void;
  setCede: (v: boolean) => void;
  confirmado: boolean;
  confirmar: (v: boolean) => void;
  incluirOrigen: boolean;
  incluir: (v: boolean) => void;
  volver: () => void;
  enviar: () => void;
  enviando: boolean;
  /** Por qué la campaña no recibe el aporte ahora, si no lo recibe. */
  bloqueo?: string | null;
  error?: string;
  /** A dónde va el aporte, justo antes de decidir publicarlo. */
  destino?: ReactNode;
}

/** La razón visible por la que todavía no se puede publicar, o `null` si se puede. */
function motivoDeBloqueo(p: Props): string | null {
  if (p.bloqueo) return p.bloqueo;
  if (!p.lectura.trim()) return 'Escribí al menos una frase para seguir.';
  if (p.lectura.length > LIMITE_APORTE) return 'Acortá el texto para poder publicarlo.';
  if (!p.confirmado || !p.publicar) return 'Marcá las dos casillas para publicar.';
  return null;
}

export function Revision(props: Props) {
  const exceso = props.lectura.length - LIMITE_APORTE;
  return (
    <section aria-labelledby="revision-titulo">
      <h3 id="revision-titulo" tabIndex={-1} data-foco-paso className="font-anton text-3xl">
        Revisá lo que vas a compartir
      </h3>
      <p className="mt-3 max-w-[650px] leading-relaxed">
        Esto es lo que se va a publicar. Podés cambiarlo o recortarlo.
      </p>
      {props.recortado ? (
        <p role="status" className="text-violeta mt-2 text-sm">
          Lo recortamos para que entre: revisalo.
        </p>
      ) : null}
      <label className="mt-5 block font-medium">
        Mi aporte
        <textarea
          rows={5}
          className={CAMPO}
          value={props.lectura}
          onChange={(e) => {
            props.cambiar(e.target.value);
          }}
        />
      </label>
      <p className="text-tinta-50 mt-2 text-sm">
        {props.lectura.length} de {LIMITE_APORTE} caracteres.
        {exceso > 0 ? (
          <strong className="text-sello ml-1">Te pasás por {exceso} caracteres.</strong>
        ) : null}
      </p>
      <TemaDelAporte valor={props.tema} cambiar={props.cambiarTema} />
      <label className="mt-5 flex items-start gap-3">
        <input
          type="checkbox"
          checked={props.confirmado}
          onChange={(e) => {
            props.confirmar(e.target.checked);
          }}
          className="mt-1"
        />
        <span>Este texto dice lo que quiero decir.</span>
      </label>
      <label className="mt-4 flex items-start gap-3">
        <input
          type="checkbox"
          checked={props.incluirOrigen}
          onChange={(e) => {
            props.incluir(e.target.checked);
          }}
          className="mt-1"
        />
        <span>Compartir también mis tres respuestas, para que se vea de dónde salió.</span>
      </label>
      <p className="text-tinta-50 ml-7 mt-1 text-sm">
        Si no cedés el texto, esas respuestas también quedan reservadas.
      </p>
      <div className="border-tinta mt-6 border p-4">
        <p className="mb-3">
          Lugar: <strong>{props.lugar?.name ?? 'todo el país'}</strong>. Podés hablar de todo el
          país o de un lugar concreto.
        </p>
        <BusquedaTerritorial onElegir={props.elegirLugar} rotulo="Buscá el lugar de tu aporte" />
        {props.lugar ? (
          <button
            type="button"
            className="text-violeta mt-3 min-h-11 underline"
            onClick={() => {
              props.elegirLugar(null);
            }}
          >
            Usar todo el país
          </button>
        ) : null}
      </div>
      {props.destino}
      <ConsentimientoVoz
        publicar={props.publicar}
        cede={props.cede}
        setPublicar={props.setPublicar}
        setCede={props.setCede}
      />
      <Nota>
        Si ingresaste, el aporte queda en tu cuenta y lo podés editar o retirar desde Mi espacio. Tu
        nombre no se publica.
      </Nota>
      <ErrorOperacion mensaje={props.error} />
      <div className="flex flex-wrap items-center gap-3">
        <BotonAccion type="button" tono="papel" onClick={props.volver}>
          Volver a mis respuestas
        </BotonAccion>
        <BotonConMotivo
          type="button"
          motivo={motivoDeBloqueo(props)}
          ocupado={props.enviando}
          onClick={props.enviar}
        >
          {props.enviando ? 'Publicando tu aporte…' : 'Publicar mi aporte'}
        </BotonConMotivo>
      </div>
    </section>
  );
}
