import { Kicker, RitoTinta } from '~/components/papel/primitives';

interface PortadaSembrarProps {
  /** true una vez que la semilla está plantada — cambia el kicker y oculta el lead. */
  plantada: boolean;
}

/**
 * § 1 de la spec — Portada: kicker + H1 «Tu semilla.» con el rito de la
 * tinta + lead (solo en estado asistente). En estado certificado el kicker
 * cambia a «Sembrar · plantada» y el lead desaparece — la portada no repite
 * la invitación a quien ya sembró.
 */
export function PortadaSembrar({ plantada }: PortadaSembrarProps) {
  return (
    <div className="mb-9">
      <Kicker className="anim-fadeup mb-4">
        {plantada ? 'Sembrar · plantada' : 'Sembrar · 3 pasos · 2 minutos'}
      </Kicker>
      <h1
        aria-label="Tu semilla."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,84px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Tu semilla.']} />
      </h1>
      {plantada ? null : (
        <p
          className="anim-fadeup text-tinta-75 max-w-[600px] text-pretty text-[18px] leading-[1.6]"
          style={{ animationDelay: '0.9s' }}
        >
          Una semilla son tres frases tuyas: tu basta, tu sueño y tu compromiso. Se planta acá, se
          suma a la cuenta pública y no se borra con el próximo tuit del ministro.
        </p>
      )}
    </div>
  );
}
