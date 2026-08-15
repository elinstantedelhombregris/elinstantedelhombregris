import { useState } from 'react';

import { ApiError } from '~/lib/api';
import { useConfirmar } from '~/lib/queries/senales';
import { cn } from '~/lib/utils';
import {
  METODOS_EN_CASTELLANO,
  PROXIMIDADES_EN_CASTELLANO,
  VEREDICTOS_EN_CASTELLANO,
} from '~/lib/vocabulario';

/**
 * El segundo par de ojos — la pantalla que faltaba.
 *
 * El circuito de corroboración estaba construido entero y era inalcanzable: sin
 * esto, el umbral de dos confirmaciones tenía techo real cero y cada hecho del
 * país se quedaba en «pide otra mirada» para siempre.
 *
 * ## Tres cosas que esta pantalla dice y una que no
 *
 * **Dice qué método pesa y cuál no**, antes de elegir. Dos de los cinco cuentan
 * para el umbral cuando la señal tiene punto; los otros dos se registran con su
 * procedencia y no suman. Ocultarlo haría que alguien eligiera «conozco el
 * lugar» creyendo que corrobora y descubriera después que su gesto no movió
 * nada — la peor forma de gastarle el tiempo a alguien que quiso ayudar.
 *
 * **Dice qué NO garantiza la proximidad.** La declarás vos y el servidor no la
 * puede atestar. Falsificar cuesta aparatos, no desplazamiento. Está en
 * pantalla y no en una nota al pie porque inflar la garantía sería peor que no
 * tenerla.
 *
 * **Dice cuántas faltan**, para que confirmar no se sienta como gritar al vacío.
 *
 * Y lo que no hace: **no muestra quién más confirmó**. Ni acá ni en la ficha.
 */
export interface PanelConfirmarProps {
  readonly idPublico: string;
  readonly hayPunto: boolean;
  readonly umbral: number;
  readonly yaCuentan: number;
}

const rotulo = 'font-space text-tinta-75 mb-2 mt-4 block text-[11px] uppercase tracking-[0.12em]';

export function PanelConfirmar({ idPublico, hayPunto, umbral, yaCuentan }: PanelConfirmarProps) {
  const [abierto, setAbierto] = useState(false);
  const [veredicto, setVeredicto] = useState('confirm');
  const [metodo, setMetodo] = useState('saw_now');
  const [proximidad, setProximidad] = useState('sin_declarar');
  const [nota, setNota] = useState('');
  const confirmar = useConfirmar(idPublico);

  /**
   * El par imposible, atajado en pantalla: «lo confirmo y no tengo cómo
   * comprobarlo». El servidor lo rechaza con un CHECK cruzado, pero enterarse
   * después de apretar enviar es enterarse tarde.
   */
  const incoherente = (metodo === 'cannot_verify') !== (veredicto === 'cannot_verify');
  const faltaNota = veredicto === 'correct' && nota.trim() === '';
  const puede = !incoherente && !faltaNota && !confirmar.isPending;

  const elegido = METODOS_EN_CASTELLANO.find((m) => m.clave === metodo);
  const pesa = elegido?.pesa === true || !hayPunto;

  if (confirmar.isSuccess) {
    const r = confirmar.data;
    return (
      <div className="border-verde bg-verde/[0.06] border-l-[3px] px-5 py-4">
        <p className="font-space text-tinta text-[13px] font-bold uppercase tracking-[0.1em]">
          {r.corroboroAhora ? 'Quedó comprobada' : 'Gracias por mirar'}
        </p>
        <p className="text-tinta-75 mt-2 max-w-[60ch] text-[14px] leading-relaxed">
          {r.corroboroAhora
            ? 'Dos personas distintas la miraron y coinciden. Ahora cuenta como un hecho comprobado en la nitidez de su territorio.'
            : r.cuentan >= umbral
              ? 'Tu mirada quedó registrada. Hay correcciones pendientes, así que todavía no se da por comprobada.'
              : `Tu mirada quedó registrada. ${
                  umbral - r.cuentan === 1
                    ? 'Falta una persona más'
                    : `Faltan ${String(umbral - r.cuentan)} personas`
                } para que se dé por comprobada.`}
        </p>
      </div>
    );
  }

  if (!abierto) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setAbierto(true);
          }}
          className="font-space border-tinta text-tinta hover:bg-papel-presionado min-h-[44px] self-start border px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em]"
        >
          ¿Sigue así? Mirala vos
        </button>
        <p className="font-space text-tinta-50 max-w-[58ch] text-[11px] leading-relaxed">
          {yaCuentan === 0
            ? `Nadie la miró todavía. Con ${String(umbral)} personas distintas se da por comprobada.`
            : yaCuentan >= umbral
              ? 'Ya alcanzó el umbral. Tu mirada suma igual.'
              : `${String(yaCuentan)} de ${String(umbral)}. ${
                  umbral - yaCuentan === 1 ? 'Falta una persona.' : `Faltan ${String(umbral - yaCuentan)}.`
                }`}
        </p>
      </div>
    );
  }

  return (
    <div className="border-tinta border p-5">
      <h3 className="font-anton text-tinta text-[22px] leading-tight">¿Sigue así?</h3>

      <label htmlFor="conf-veredicto" className={rotulo}>
        Qué encontraste
      </label>
      <div id="conf-veredicto" role="group" className="flex flex-col gap-1.5">
        {VEREDICTOS_EN_CASTELLANO.map((v) => (
          <label key={v.clave} className="flex cursor-pointer items-start gap-2.5 py-0.5">
            <input
              type="radio"
              name="veredicto"
              value={v.clave}
              checked={veredicto === v.clave}
              onChange={() => {
                setVeredicto(v.clave);
                // El par imposible se evita moviendo el otro lado, no
                // bloqueando: si elegís «no puedo comprobarlo» como veredicto,
                // el método se acomoda solo y al revés también.
                if (v.clave === 'cannot_verify') setMetodo('cannot_verify');
                else if (metodo === 'cannot_verify') setMetodo('saw_now');
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="font-space text-tinta text-[13px] font-bold">{v.rotulo}</span>{' '}
              <span className="font-space text-tinta-50 text-[11px]">{v.glosa}</span>
            </span>
          </label>
        ))}
      </div>

      {veredicto === 'correct' ? (
        <>
          <label htmlFor="conf-nota" className={rotulo}>
            ¿Qué habría que corregir?
          </label>
          <input
            id="conf-nota"
            type="text"
            maxLength={280}
            value={nota}
            onChange={(e) => {
              setNota(e.target.value);
            }}
            placeholder="El semáforo anda; lo que no anda es la luz de la esquina."
            className="border-tinta bg-papel-crudo text-tinta placeholder:text-tinta-50 w-full border p-3 text-[14px]"
          />
        </>
      ) : null}

      <label htmlFor="conf-metodo" className={rotulo}>
        ¿Cómo lo sabés?
      </label>
      <div id="conf-metodo" role="group" className="flex flex-col gap-1.5">
        {METODOS_EN_CASTELLANO.map((m) => (
          <label key={m.clave} className="flex cursor-pointer items-start gap-2.5 py-0.5">
            <input
              type="radio"
              name="metodo"
              value={m.clave}
              checked={metodo === m.clave}
              onChange={() => {
                setMetodo(m.clave);
                if (m.clave === 'cannot_verify') setVeredicto('cannot_verify');
                else if (veredicto === 'cannot_verify') setVeredicto('confirm');
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="font-space text-tinta text-[13px] font-bold">{m.rotulo}</span>{' '}
              <span className="font-space text-tinta-50 text-[11px]">{m.glosa}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Antes de enviar, no después: si el método elegido no suma, se dice. */}
      {veredicto === 'confirm' && !pesa ? (
        <p className="border-ambar/50 text-tinta-75 mt-3 border-l-2 py-1 pl-3 text-[12px] leading-relaxed">
          Este método <strong>no suma</strong> al umbral porque la señal tiene un punto y no
          declarás haber estado ahí. Se registra igual, con su procedencia, y se ve en la ficha.
        </p>
      ) : null}

      <label htmlFor="conf-prox" className={rotulo}>
        ¿Qué tan cerca estabas?
      </label>
      <div className="relative">
        <select
          id="conf-prox"
          value={proximidad}
          onChange={(e) => {
            setProximidad(e.target.value);
          }}
          className="border-tinta bg-papel-crudo text-tinta font-space w-full appearance-none border p-3 text-[13px]"
        >
          {PROXIMIDADES_EN_CASTELLANO.map((p) => (
            <option key={p.clave} value={p.clave}>
              {p.rotulo}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="font-space text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
        >
          ▾
        </span>
      </div>
      <p className="font-space text-tinta-50 mt-1.5 max-w-[58ch] text-[10px] leading-relaxed">
        Esto lo declarás vos y no lo podemos comprobar. Sirve para la ficha, no para probar nada —
        decir lo contrario sería prometer una garantía que no tenemos.
      </p>

      <button
        type="button"
        disabled={!puede}
        onClick={() => {
          confirmar.mutate({
            veredicto,
            metodo,
            proximidad,
            nota: veredicto === 'correct' ? nota.trim() : null,
          });
        }}
        className={cn(
          'font-space bg-violeta text-papel mt-5 min-h-[44px] w-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em]',
          !puede && 'bg-tinta-30 border-tinta-30 text-tinta-50 cursor-not-allowed border',
        )}
      >
        Mandar lo que viste
      </button>

      {faltaNota ? (
        <p className="font-space text-tinta-50 mt-2 text-[11px]">Contá qué habría que corregir.</p>
      ) : null}

      {confirmar.isError ? (
        <p role="alert" className="font-space text-sello mt-3 max-w-[58ch] text-[12px] leading-relaxed">
          {confirmar.error instanceof ApiError
            ? confirmar.error.message
            : 'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.'}
        </p>
      ) : null}
    </div>
  );
}
