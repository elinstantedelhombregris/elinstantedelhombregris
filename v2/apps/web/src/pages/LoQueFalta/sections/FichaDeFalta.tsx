import { useMemo, useState } from 'react';
import { Link } from 'wouter';

import {
  comoTextoPlano,
  ESTADOS,
  etiquetaDeSuperficie,
  fechaLarga,
  leerLlavero,
  llaveDeFirma,
  olvidarLlave,
  selloDeEstado,
} from '../lo-que-falta-data';

import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { useFirmarFalta, useRetirarFalta, type FaltaPublica } from '~/lib/queries/faltas';

interface FichaDeFaltaProps {
  falta: FaltaPublica;
}

/**
 * § La ficha — una falta, entera y con su URL propia.
 *
 * Es donde vuelve la respuesta. Quien dejó algo no recibe ningún aviso: no hay
 * mail, no hay cuenta, no hay nada que avisar a. Esta página es el canal de
 * vuelta, y por eso la razón de un «no va» se muestra tan grande como el
 * pedido.
 */
export function FichaDeFalta({ falta }: FichaDeFaltaProps) {
  const llavero = useMemo(() => leerLlavero(), []);
  const llavePropia = llavero[falta.idPublico];
  const [firmada, setFirmada] = useState(false);

  const firmar = useFirmarFalta();
  const retirar = useRetirarFalta();

  const estado = ESTADOS[falta.estado];
  const bajada = falta.estado === 'bajada';
  const firmas = firmar.data?.firmas ?? falta.firmas;

  return (
    <article>
      <Kicker className="mb-4">
        <Link href="/lo-que-falta" className="hover:text-violeta transition-colors">
          Lo que falta
        </Link>{' '}
        · {falta.idPublico}
      </Kicker>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Sello color={selloDeEstado(falta.estado)} rotate={-3}>
          {estado.etiqueta}
        </Sello>
        <span className="text-tinta-50 text-[14px] leading-snug">{estado.glosa}</span>
      </div>

      <h1 className="font-anton mb-5 text-[clamp(30px,5vw,60px)] leading-[1.02]">
        {bajada ? 'Contenido retirado' : comoTextoPlano(falta.titulo)}
      </h1>

      <div className="font-space text-tinta-50 mb-8 flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.08em]">
        <span>{etiquetaDeSuperficie(falta.superficie)}</span>
        <span>{falta.origen === 'adentro' ? 'la encontré yo' : 'la dejó alguien'}</span>
        <span>{fechaLarga(falta.creadaEn)}</span>
        {falta.severidad ? <span>severidad {falta.severidad}</span> : null}
      </div>

      {bajada ? (
        <p className="text-tinta-50 mb-8 text-[16px] leading-relaxed">
          Esta falta se bajó. El contenido no está, pero el número, la fecha y el motivo sí — nada
          desaparece del registro.
        </p>
      ) : (
        <div className="text-tinta mb-10 whitespace-pre-wrap text-[17px] leading-[1.7]">
          {comoTextoPlano(falta.cuerpo)}
        </div>
      )}

      {falta.razon ? (
        <div className="border-tinta mb-10 border-l-2 py-1 pl-5">
          <div className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            {falta.estado === 'no_va' ? 'Por qué no va' : 'Por qué se bajó'}
          </div>
          <p className="text-tinta m-0 whitespace-pre-wrap text-[16px] leading-relaxed">
            {comoTextoPlano(falta.razon)}
          </p>
        </div>
      ) : null}

      {falta.anotadaComo || falta.cierreUrl ? (
        <div className="text-tinta-50 mb-10 text-[15px] leading-relaxed">
          {falta.anotadaComo ? (
            <p className="m-0">
              Se anotó en el registro de deudas como{' '}
              <span className="font-space text-tinta">{falta.anotadaComo}</span>.
            </p>
          ) : null}
          {falta.cierreUrl ? <p className="m-0">Se cerró en {falta.cierreUrl}.</p> : null}
        </div>
      ) : null}

      {falta.contexto?.encuadre ? (
        <p className="text-tinta-30 mb-10 text-[13px] leading-snug">
          Llegó desde el mapa, con el encuadre que se estaba mirando
          {falta.contexto.capa ? ` y la capa «${falta.contexto.capa}»` : ''}.
        </p>
      ) : null}

      <div className="border-papel-borde flex flex-wrap items-center gap-4 border-t pt-7">
        {bajada ? null : (
          <>
            <BotonPapel
              variant={firmada || firmar.data?.nueva ? 'fantasma' : 'violeta'}
              onClick={() => {
                firmar.mutate(
                  { idPublico: falta.idPublico, llave: llaveDeFirma() },
                  {
                    onSuccess: () => {
                      setFirmada(true);
                    },
                  },
                );
              }}
              disabled={firmar.isPending || firmada}
            >
              {firmada ? 'Firmada' : firmar.isPending ? 'Firmando…' : 'Me pasa lo mismo'}
            </BotonPapel>
            <span className="font-space text-tinta-50 text-[13px]">
              {firmas === 0
                ? 'Nadie la firmó todavía'
                : `${String(firmas)} ${firmas === 1 ? 'persona la firmó' : 'personas la firmaron'}`}
            </span>
          </>
        )}
      </div>

      {llavePropia && !bajada ? (
        <div className="border-papel-borde mt-8 border-t pt-7">
          <p className="text-tinta-50 mb-4 text-[14px] leading-relaxed">
            Esta la dejaste vos desde este navegador. Podés retirarla: el contenido se va, el número
            y la fecha quedan.
          </p>
          <BotonPapel
            variant="fantasma"
            onClick={() => {
              retirar.mutate(
                { idPublico: falta.idPublico, llave: llavePropia },
                {
                  onSuccess: () => {
                    olvidarLlave(falta.idPublico);
                  },
                },
              );
            }}
            disabled={retirar.isPending}
          >
            {retirar.isPending ? 'Retirando…' : 'Retirarla'}
          </BotonPapel>
        </div>
      ) : null}
    </article>
  );
}
