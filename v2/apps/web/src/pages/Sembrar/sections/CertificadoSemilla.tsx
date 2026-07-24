import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import { type SemillaGuardada } from '../sembrar-data';

import { BotonPapel, Sello } from '~/components/papel/primitives';

/** La semilla del certificado — tallo semgrow + hojas leafpop (§6, ya en el toolkit). */
function SemillaSvg() {
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" aria-hidden className="mx-auto block">
      <line
        x1="60"
        y1="150"
        x2="60"
        y2="62"
        strokeWidth="3"
        className="anim-semgrow text-tinta stroke-current"
        style={{ transformOrigin: '60px 150px', animationDuration: '0.9s', animationDelay: '0.2s' }}
      />
      <path
        d="M60 78 C 38 74 30 52 34 38 C 52 42 62 58 60 78 Z"
        className="anim-leafpop text-violeta fill-current"
        style={{ transformOrigin: '60px 78px', animationDuration: '0.6s', animationDelay: '1s' }}
      />
      <path
        d="M60 96 C 82 92 90 70 86 56 C 68 60 58 76 60 96 Z"
        className="anim-leafpop text-tinta fill-current"
        style={{ transformOrigin: '60px 96px', animationDuration: '0.6s', animationDelay: '1.25s' }}
      />
    </svg>
  );
}

const ETIQUETAS: {
  campo: keyof Pick<SemillaGuardada, 'basta' | 'sueno' | 'compromiso'>;
  label: string;
  clase: string;
}[] = [
  { campo: 'basta', label: 'Mi basta', clase: 'text-sello' },
  { campo: 'sueno', label: 'Mi sueño', clase: 'text-violeta' },
  { campo: 'compromiso', label: 'Mi compromiso', clase: 'text-verde' },
];

interface CertificadoSemillaProps {
  semilla: SemillaGuardada;
  onPlantarOtra: () => void;
}

/**
 * §3 de la spec — el certificado: la interacción firma de la página
 * (nacimiento de la semilla + sello PLANTADA) y el segundo lector con
 * edición impresa §10.8 del sistema (patrón 2.4, reusado tal cual).
 */
export function CertificadoSemilla({ semilla, onPlantarOtra }: CertificadoSemillaProps) {
  const [copiada, setCopiada] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const numero = semilla.id.toLocaleString('es-AR');
  const fecha = new Date(semilla.fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const copiar = () => {
    const texto = [
      `MI SEMILLA ¡BASTA! N° ${numero}`,
      `Mi basta: ${semilla.basta}`,
      `Mi sueño: ${semilla.sueno}`,
      `Mi compromiso: ${semilla.compromiso}`,
      `Plantá la tuya → ${window.location.origin}/sembrar`,
    ].join('\n');
    void navigator.clipboard
      .writeText(texto)
      .then(() => {
        setCopiada(true);
        window.setTimeout(() => {
          setCopiada(false);
        }, 2000);
      })
      .catch(() => {
        // Sin permiso de portapapeles no se confirma lo que no pasó (§10.9).
      });
  };

  return (
    <div>
      <div className="mb-9 text-center">
        <SemillaSvg />
      </div>
      <div className="edicion-impresa border-tinta bg-papel-crudo relative border p-11 max-[560px]:p-6">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fecha}
        </p>
        <div className="absolute right-7 top-[26px] max-[560px]:static max-[560px]:mb-4">
          <Sello color="violeta" rotate={6}>
            Plantada
          </Sello>
        </div>
        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="font-space text-tinta-50 mb-5 text-xs uppercase tracking-[0.14em]"
        >
          Semilla N° {numero} — {fecha}
        </h2>
        <div className="flex flex-col gap-[22px]">
          {ETIQUETAS.map(({ campo, label, clase }) => (
            <div key={campo}>
              <div className={`font-space mb-1.5 text-[10px] uppercase tracking-[0.14em] ${clase}`}>
                {label}
              </div>
              <p className="font-anton text-2xl leading-tight">«{semilla[campo]}»</p>
            </div>
          ))}
        </div>
        <div className="border-papel-borde mt-7 flex flex-wrap items-center gap-3 border-t pt-[22px] print:hidden">
          <BotonPapel variant="tinta" onClick={copiar}>
            {copiada ? '✓ Copiada' : 'Copiar para compartir'}
          </BotonPapel>
          {copiada ? (
            <span role="status" className="sr-only">
              Copiada al portapapeles
            </span>
          ) : null}
          <BotonPapel
            variant="fantasma"
            onClick={() => {
              window.print();
            }}
          >
            Imprimir el certificado
          </BotonPapel>
          <button
            type="button"
            onClick={onPlantarOtra}
            className="font-space text-tinta-50 ml-auto min-h-[44px] text-xs uppercase tracking-[0.08em]"
          >
            Plantar otra
          </button>
        </div>
      </div>
      <div className="mt-6 text-center print:hidden">
        <p className="text-tinta-50 text-[15px] leading-relaxed">
          Guardala. Es tu contrato con vos. Cuando el movimiento te pese, volvé a leerla.
        </p>
        <Link
          href="/el-mapa"
          className="font-space text-violeta mt-3 inline-block text-xs font-bold uppercase tracking-[0.1em]"
        >
          Ahora soltá tu voz en el mapa →
        </Link>
      </div>
    </div>
  );
}
