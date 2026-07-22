export interface RitoTintaProps {
  /** Líneas del título — se apilan como bloques. */
  lineas: readonly string[];
  /** Segundos antes de la primera letra. */
  delayBase?: number;
  /** Segundos entre letras. */
  paso?: number;
}

/** Evita colas binarias (0.23500000000000004) en el estilo inline. */
function redondear(segundos: number): number {
  return Math.round(segundos * 1000) / 1000;
}

/**
 * Rito de la tinta §10.1 — el H1 se entinta letra por letra (`anim-inkfill`,
 * gris → tinta) y los signos ¡ ! caen al final (`anim-vpop`, violeta).
 * El llamador pone el elemento heading y su aria-label:
 *
 *   <h1 aria-label="Un país no se hereda. Se diseña.">
 *     <RitoTinta lineas={['Un país no se hereda.', 'Se diseña.']} />
 *   </h1>
 */
export function RitoTinta({ lineas, delayBase = 0.1, paso = 0.045 }: RitoTintaProps) {
  const totalLetras = lineas.join('').replace(/[¡!\s]/g, '').length;
  const delaySignos = redondear(delayBase + totalLetras * paso + 0.2);
  let letra = 0;

  return (
    <span aria-hidden className="contents">
      {lineas.map((linea, l) => (
        <span key={l} className="block">
          {Array.from(linea).map((char, i) => {
            if (char === '¡' || char === '!') {
              return (
                <span
                  key={i}
                  className="anim-vpop text-violeta inline-block"
                  style={{ animationDelay: `${delaySignos}s` }}
                >
                  {char}
                </span>
              );
            }
            if (char === ' ') {
              return <span key={i}>{' '}</span>;
            }
            const delay = redondear(delayBase + letra * paso);
            letra += 1;
            return (
              <span key={i} className="anim-inkfill" style={{ animationDelay: `${delay}s` }}>
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
