import { OBJETIVOS } from '@v2/civic-core';

import { NOMBRE_DE_OBJETIVO } from '../simulacion-lectura';

import { Progreso } from './Progreso';


import type { EstadoDelBarrido } from '../useBarrido';
import type { Diseno, Metodo, ModoDeCorrida, Objetivo } from '@v2/civic-core';

import { BotonPapel } from '~/components/papel/primitives';

/**
 * § Los controles de la corrida: qué método, qué se mira, con qué semilla.
 *
 * Los tres métodos contestan tres preguntas distintas y por eso conviven:
 *
 * - **umbral** — «¿a partir de cuánto?». Es el titular, porque la respuesta del
 *   motor es un escalón y la pregunta útil es dónde está el borde.
 * - **una por vez** — el tornado. La única lectura que alguien no técnico lee
 *   sin entrenamiento, y por eso va siempre con la nube al lado.
 * - **hipercubo** — todas moviéndose a la vez, con incertidumbre e importancia.
 *
 * **La semilla es identidad de la corrida, no una perilla.** Por eso está acá,
 * al lado del botón, y no en la mesa de variables entre las cosas que se barren:
 * cambiarla no cambia el país, cambia qué puntos del espacio se visitaron.
 *
 * Y el botón de cancelar existe porque termina el worker de verdad. Un worker
 * dedicado no mira su cola de mensajes mientras corre, así que pedirle que pare
 * llegaría cuando ya terminó: se lo termina, y el siguiente barrido levanta uno
 * nuevo.
 */

export interface ControlesDeCorridaProps {
  readonly diseno: Diseno;
  readonly estado: EstadoDelBarrido;
  /**
   * Sobre qué territorios busca umbrales el método de bisección.
   *
   * Entra por prop y no se guarda en el componente: volver a «umbral» después
   * de haber pasado por el tornado tiene que recuperar las veinticuatro
   * provincias. Con una lista vacía el método corre, no falla, y devuelve una
   * tabla vacía — un resultado sin error, que es la peor clase.
   */
  readonly territorios: readonly string[];
  readonly puedeModoGente: boolean;
  readonly onCambiarModo: (modo: ModoDeCorrida) => void;
  readonly onCambiarMetodo: (metodo: Metodo) => void;
  readonly onCambiarObjetivo: (objetivo: Objetivo) => void;
  readonly onCambiarSemilla: (semilla: number) => void;
  readonly onCorrer: () => void;
  readonly onCancelar: () => void;
}

const METODOS: readonly { id: Metodo['tipo']; etiqueta: string }[] = [
  { id: 'umbral', etiqueta: 'Umbral por provincia' },
  { id: 'unaPorVez', etiqueta: 'Una variable por vez' },
  { id: 'hipercubo', etiqueta: 'Todas a la vez' },
];

export function ControlesDeCorrida({
  diseno,
  estado,
  territorios,
  puedeModoGente,
  onCambiarModo,
  onCambiarMetodo,
  onCambiarObjetivo,
  onCambiarSemilla,
  onCorrer,
  onCancelar,
}: ControlesDeCorridaProps) {
  const corriendo = estado.fase === 'corriendo';

  const cambiarTipo = (tipo: Metodo['tipo']) => {
    if (tipo === 'umbral') {
      onCambiarMetodo({ tipo: 'umbral', territorios });
    } else if (tipo === 'unaPorVez') {
      onCambiarMetodo({ tipo: 'unaPorVez', pasos: 11 });
    } else {
      onCambiarMetodo({ tipo: 'hipercubo', muestras: 400 });
    }
  };

  return (
    <section aria-label="Cómo se corre" className="border-papel-borde mb-8 border-y py-5">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
        <Grupo rotulo="Modo">
          <div className="flex gap-1">
            <Opcion activo={diseno.modo === 'forma'} onClick={() => { onCambiarModo('forma'); }}>
              Forma
            </Opcion>
            <Opcion
              activo={diseno.modo === 'gente'}
              deshabilitado={!puedeModoGente}
              onClick={() => { onCambiarModo('gente'); }}
            >
              Gente
            </Opcion>
          </div>
          {puedeModoGente ? null : (
            <p className="text-tinta-50 mt-1 max-w-[34ch] text-[12px] leading-[1.4]">
              El modo gente necesita un elenco cargado. Se genera en tu máquina.
            </p>
          )}
        </Grupo>

        <Grupo rotulo="Método">
          <div className="flex flex-wrap gap-1">
            {METODOS.map(({ id, etiqueta }) => (
              <Opcion key={id} activo={diseno.metodo.tipo === id} onClick={() => { cambiarTipo(id); }}>
                {etiqueta}
              </Opcion>
            ))}
          </div>
        </Grupo>

        {diseno.metodo.tipo === 'unaPorVez' ? (
          <Numero
            id="pasos"
            rotulo="Puntos por variable"
            valor={diseno.metodo.pasos}
            minimo={2}
            maximo={41}
            onCambiar={(v) => { onCambiarMetodo({ tipo: 'unaPorVez', pasos: v }); }}
          />
        ) : null}

        {diseno.metodo.tipo === 'hipercubo' ? (
          <Numero
            id="muestras"
            rotulo="Muestras"
            valor={diseno.metodo.muestras}
            minimo={1}
            maximo={20_000}
            onCambiar={(v) => { onCambiarMetodo({ tipo: 'hipercubo', muestras: v }); }}
          />
        ) : null}

        <Grupo rotulo="Qué se mira">
          <select
            aria-label="Objetivo del barrido"
            value={diseno.objetivo}
            onChange={(e) => { onCambiarObjetivo(e.target.value as Objetivo); }}
            className="font-space border-tinta text-tinta border bg-transparent px-2 py-2 text-[13px]"
          >
            {OBJETIVOS.map((objetivo) => (
              <option key={objetivo} value={objetivo}>
                {NOMBRE_DE_OBJETIVO[objetivo]}
              </option>
            ))}
          </select>
        </Grupo>

        <Numero
          id="semilla"
          rotulo="Semilla"
          valor={diseno.base.semilla}
          minimo={0}
          maximo={2 ** 31 - 1}
          onCambiar={onCambiarSemilla}
        />

        <div className="flex items-center gap-3">
          <BotonPapel onClick={onCorrer} loading={corriendo}>
            {corriendo ? 'Corriendo' : 'Correr el barrido'}
          </BotonPapel>
          {corriendo ? (
            <button
              type="button"
              onClick={onCancelar}
              className="font-space border-sello text-sello hover:bg-sello hover:text-papel border px-4 py-3 text-[12px] uppercase tracking-[0.08em] transition-colors"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </div>

      <Progreso estado={estado} />
    </section>
  );
}

function Grupo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
        {rotulo}
      </div>
      {children}
    </div>
  );
}

function Opcion({
  activo,
  deshabilitado = false,
  onClick,
  children,
}: {
  activo: boolean;
  deshabilitado?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={deshabilitado}
      onClick={onClick}
      className={`font-space border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
        deshabilitado
          ? 'border-tinta-30 text-tinta-30 cursor-not-allowed'
          : activo
            ? 'bg-violeta border-violeta text-papel'
            : 'border-tinta text-tinta hover:bg-papel-presionado'
      }`}
    >
      {children}
    </button>
  );
}

function Numero({
  id,
  rotulo,
  valor,
  minimo,
  maximo,
  onCambiar,
}: {
  id: string;
  rotulo: string;
  valor: number;
  minimo: number;
  maximo: number;
  onCambiar: (valor: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={`control-${id}`}
        className="font-space text-tinta-50 mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
      >
        {rotulo}
      </label>
      <input
        id={`control-${id}`}
        type="number"
        min={minimo}
        max={maximo}
        step={1}
        value={valor}
        onChange={(e) => {
          const leido = Number(e.target.value);
          if (Number.isFinite(leido)) onCambiar(Math.min(maximo, Math.max(minimo, leido)));
        }}
        className="font-space border-tinta text-tinta w-[110px] border bg-transparent px-2 py-2 text-right text-[14px] tabular-nums"
      />
    </div>
  );
}
