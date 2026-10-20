import { useState } from 'react';

import { Papelito } from '../comun/Papelito';

import { ENLACE_VOLVER, ROTULO, TituloDePantalla } from './piezas';

import type { AporteEnCurso } from './datos';
import type { ErrorDePublicar } from './usePublicarIdeal';
import type { ReactNode } from 'react';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';

/**
 * La tercera pantalla: la vista previa, quién puede leerlo, un solo consentimiento y un
 * solo botón (spec §3). La elección de quién puede leerlo no viene marcada (P1): ceder
 * el texto es de la persona.
 */
export function PantallaPublicar({
  aporte,
  cambiar,
  volver,
  publicar,
  enviando,
  error,
  bloqueo,
  destino,
  entraAMirar,
  nombreCampana,
  provincia,
  tema,
}: {
  aporte: AporteEnCurso;
  cambiar: (parcial: Partial<AporteEnCurso>) => void;
  volver: () => void;
  publicar: () => void;
  enviando: boolean;
  error: ErrorDePublicar | null;
  /** Por qué la campaña no recibe aportes ahora, si no los recibe. */
  bloqueo: string | null;
  /** A dónde va el aporte, dicho antes de publicar. */
  destino: ReactNode;
  /** El aporte entra en la campaña nacional, que es la que alimenta Mirar. */
  entraAMirar: boolean;
  /** «Mi Argentina ideal» o «la campaña «…»». */
  nombreCampana: string;
  provincia: string | null;
  tema: string | null;
}) {
  const [falta, setFalta] = useState('');

  const alPublicar = () => {
    if (aporte.lectura === null) {
      setFalta('Elegí quién puede leerlo. Las dos opciones publican tu aporte.');
      return;
    }
    if (!aporte.acepta) {
      setFalta('Marcá que querés publicarlo.');
      return;
    }
    setFalta('');
    publicar();
  };

  const OPCIONES = [
    {
      valor: 'libre',
      titulo: 'Que cualquiera lo pueda leer y citar, sin tu nombre.',
      detalle: entraAMirar ? 'Entra a Mirar.' : 'Se lee en el sitio.',
    },
    {
      valor: 'reservado',
      titulo: 'Que cuente, pero que el texto quede reservado.',
      detalle: entraAMirar ? 'No entra a Mirar.' : 'El texto no se muestra en público.',
    },
  ] as const;

  return (
    <>
      <button type="button" className={ENLACE_VOLVER} onClick={volver}>
        ← Volver a tu aporte
      </button>
      <p className={ROTULO}>Imaginar · 3 de 3</p>
      <TituloDePantalla nivel={2}>Así lo van a ver</TituloDePantalla>
      <Papelito
        id="propio"
        texto={aporte.linea.trim()}
        provincia={provincia}
        tema={tema}
        quieto
        propio
      />
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className={`${ROTULO} mb-2.5`}>¿Quién puede leerlo?</legend>
        {OPCIONES.map((o) => (
          <label
            key={o.valor}
            className="border-papel-borde bg-papel-crudo has-[:checked]:border-tinta grid cursor-pointer grid-cols-[22px_1fr] items-start gap-2.5 border-[1.5px] p-3.5 has-[:checked]:shadow-[inset_4px_0_0_#5227CC]"
          >
            <input
              type="radio"
              name="imaginar-lectura"
              value={o.valor}
              checked={aporte.lectura === o.valor}
              onChange={() => {
                cambiar({ lectura: o.valor });
                setFalta('');
              }}
              className="accent-violeta mt-0.5 h-[18px] w-[18px]"
            />
            <span>
              <strong className="block font-semibold">{o.titulo}</strong>{' '}
              <span className="text-tinta-50 text-[13.5px]">{o.detalle}</span>
            </span>
          </label>
        ))}
        <details className="group">
          <summary className="text-tinta-75 inline-flex min-h-11 cursor-pointer items-center text-[14.5px] underline underline-offset-4">
            Qué quiere decir citar
          </summary>
          <p className="text-tinta-75 text-[13.5px] leading-relaxed">
            Que cualquiera pueda copiar tu frase en otro lado, por ejemplo en un informe o en una
            nota, diciendo que salió de Mi Argentina ideal. Es la licencia CC BY 4.0. Tu nombre
            nunca aparece.
          </p>
        </details>
      </fieldset>
      <label className="grid cursor-pointer grid-cols-[22px_1fr] items-start gap-2.5 text-[15px]">
        <input
          type="checkbox"
          checked={aporte.acepta}
          onChange={(e) => {
            cambiar({ acepta: e.target.checked });
            setFalta('');
          }}
          className="accent-violeta mt-0.5 h-[18px] w-[18px]"
        />
        <span>
          Publicá mi aporte en {nombreCampana}. Se ve sin mi nombre
          {provincia ? ', con mi provincia.' : ' y sin mi provincia.'}
        </span>
      </label>
      {destino}
      <p className="text-tinta-50 text-[13.5px] leading-relaxed">
        Podés corregir o retirar tu aporte cuando quieras, mientras nadie lo haya contestado.
      </p>
      <ErrorOperacion mensaje={falta || error?.mensaje} className="my-0" />
      {error?.codigo === 'DATOS_PERSONALES' ? (
        <button type="button" className={ENLACE_VOLVER} onClick={volver}>
          Volver a tu aporte para sacarlo
        </button>
      ) : null}
      <BotonAccion
        type="button"
        className="w-full justify-center"
        motivo={bloqueo}
        ocupado={enviando}
        onClick={alPublicar}
      >
        {enviando ? 'Publicando tu aporte…' : 'Publicar mi aporte'}
      </BotonAccion>
    </>
  );
}
