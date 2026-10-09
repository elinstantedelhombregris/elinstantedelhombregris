import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';
import { ConsentimientoVoz } from '../ElMapa/sections/soltar/ConsentimientoVoz';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { TemaDelAporte } from '~/components/participacion/TemaDelAporte';

interface Props {
  lectura: string;
  cambiar: (v: string) => void;
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
  bloqueado?: boolean;
  error?: string;
}
export function Revision(props: Props) {
  return (
    <section aria-labelledby="revision-titulo">
      <h2 id="revision-titulo" className="font-anton text-4xl">
        Que lo escrito siga siendo tuyo.
      </h2>
      <p className="mt-4 max-w-[650px] leading-relaxed">
        Mirá la frase que va a entrar al registro. Cambiala hasta que diga lo que querés decir. La
        compartimos como un sueño: una posibilidad que merece conversación.
      </p>
      <label className="mt-5 block font-medium">
        La voz que quiero compartir
        <textarea
          rows={5}
          maxLength={2000}
          className={CAMPO}
          value={props.lectura}
          onChange={(e) => {
            props.cambiar(e.target.value);
          }}
        />
      </label>
      <p className="text-tinta-50 mt-2 text-sm">
        {props.lectura.length} de 2000 caracteres.{' '}
        {props.lectura.length > 2000
          ? 'Elegí qué querés compartir en esta frase. El relato original sigue con vos.'
          : ''}
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
        <span>Esta frase refleja lo que quiero expresar.</span>
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
        <span>
          Quiero compartir también las respuestas que escribí como origen de esta frase. Si no cedo
          el texto, también quedan reservadas.
        </span>
      </label>
      <div className="mt-6 border p-4">
        <p className="mb-3">
          Ámbito elegido: <strong>{props.lugar?.name ?? 'Argentina'}</strong>. Podés hablar de todo
          el país o de un lugar concreto.
        </p>
        <BusquedaTerritorial onElegir={props.elegirLugar} rotulo="Ubicación de mi aporte" />
        {props.lugar ? (
          <button
            type="button"
            className="text-violeta mt-3 min-h-11 underline"
            onClick={() => {
              props.elegirLugar(null);
            }}
          >
            Usar alcance nacional
          </button>
        ) : null}
      </div>
      <ConsentimientoVoz
        publicar={props.publicar}
        cede={props.cede}
        setPublicar={props.setPublicar}
        setCede={props.setCede}
      />
      <Nota>
        Tu cuenta, si ingresaste, permite recuperar y gestionar el aporte. No publica tu nombre ni
        cambia tu firma. Una voz merece poder volver a sus manos.
      </Nota>
      <ErrorOperacion mensaje={props.error} />
      <div className="flex flex-wrap gap-3">
        <BotonAccion tono="papel" onClick={props.volver}>
          Volver a mi reflexión
        </BotonAccion>
        <BotonAccion
          disabled={
            !props.publicar ||
            !props.confirmado ||
            !props.lectura.trim() ||
            props.lectura.length > 2000 ||
            props.enviando ||
            props.bloqueado
          }
          onClick={props.enviar}
        >
          {props.enviando ? 'Guardando tu voz…' : 'Compartir mi Argentina ideal'}
        </BotonAccion>
      </div>
    </section>
  );
}
