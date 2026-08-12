import { BotonPapel, Kicker, RitoTinta } from '~/components/papel/primitives';

interface PortadaLoQueFaltaProps {
  /** El conteo autoritativo, del servidor. `undefined` mientras carga. */
  total: number | undefined;
  onDejar: () => void;
}

/**
 * § Portada de `/lo-que-falta`.
 *
 * Dice las tres cosas que hacen que este canal no sea un formulario de
 * contacto: que lo que se deja es público al instante, que las deudas propias
 * están en la misma lista, y que un «no va» viene con la razón escrita.
 */
export function PortadaLoQueFalta({ total, onDejar }: PortadaLoQueFaltaProps) {
  return (
    <div className="mb-12">
      <Kicker className="anim-fadeup mb-4">
        Canal de escucha{total === undefined ? '' : ` · ${String(total)} en el registro`}
      </Kicker>

      <h1
        aria-label="Lo que falta."
        className="font-anton riso-hover mb-6 text-[clamp(44px,6vw,84px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Lo que falta.']} />
      </h1>

      <p
        className="anim-fadeup text-tinta-75 mb-5 max-w-[640px] text-pretty text-[18px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Todo lo que le falta a esto, en una sola lista: las deudas que encontré yo y las ideas que
        dejó cualquiera. Se publica al instante, sin revisión previa y sin pedirte un dato.
      </p>

      <p
        className="anim-fadeup text-tinta-50 mb-8 max-w-[640px] text-pretty text-[15px] leading-[1.6]"
        style={{ animationDelay: '1.1s' }}
      >
        Lo que no voy a hacer también entra, con el motivo escrito. Un canal donde nunca vuelve nada
        no es un canal de escucha: es un buzón.
      </p>

      <BotonPapel variant="violeta" onClick={onDejar}>
        Dejar lo que falta
      </BotonPapel>
    </div>
  );
}
